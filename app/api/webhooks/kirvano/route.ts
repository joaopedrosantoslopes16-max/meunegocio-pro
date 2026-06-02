import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// WEBHOOK — Kirvano
//
// Configure a URL no painel da Kirvano:
//   Configurações → Webhooks → https://seusite.com/api/webhooks/kirvano
//
// Configure o token secreto em .env.local:
//   WEBHOOK_SECRET=seu-token-aqui
//
// Este endpoint gerencia DUAS tabelas:
//   - purchases: histórico de transações (imutável)
//   - subscriptions: estado atual da assinatura (gerenciada aqui)
// ============================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type PurchaseStatus =
  | "pending" | "approved" | "active"
  | "cancelled" | "refunded" | "chargeback" | "failed";

type SubscriptionStatus =
  | "active" | "pending" | "cancelled" | "refunded" | "chargeback" | "past_due";

type PlanName = "essencial" | "pro";

type ExtraPackageSlug = "instagram-extra" | "stories" | "reativacao";

const EXTRA_PACKAGE_SLUGS: Record<string, ExtraPackageSlug> = {
  "instagram extra":             "instagram-extra",
  "pacote instagram extra":      "instagram-extra",
  "instagram-extra":             "instagram-extra",
  "stories":                     "stories",
  "pacote stories":              "stories",
  "reativacao":                  "reativacao",
  "reativação":                  "reativacao",
  "pacote reativacao":           "reativacao",
  "pacote reativação":           "reativacao",
  "reativacao de clientes":      "reativacao",
  "reativação de clientes":      "reativacao",
  "pacote reativacao de clientes": "reativacao",
};

function detectExtraPackage(productName: string): ExtraPackageSlug | null {
  const normalized = productName.toLowerCase().trim();
  for (const [key, slug] of Object.entries(EXTRA_PACKAGE_SLUGS)) {
    if (normalized.includes(key)) return slug;
  }
  return null;
}

// Mapa de eventos Kirvano → status de purchase
const EVENT_TO_PURCHASE_STATUS: Record<string, PurchaseStatus> = {
  "order.approved":            "approved",
  "order.paid":                "approved",
  "order.created":             "pending",
  "order.refunded":            "refunded",
  "order.chargeback":          "chargeback",
  "order.cancelled":           "cancelled",
  "order.failed":              "failed",
  "subscription.activated":    "active",
  "subscription.renewed":      "active",
  "subscription.cancelled":    "cancelled",
  "subscription.past_due":     "failed",
};

// Mapa de eventos Kirvano → status de subscription
const EVENT_TO_SUB_STATUS: Record<string, SubscriptionStatus> = {
  "order.approved":            "active",
  "order.paid":                "active",
  "subscription.activated":    "active",
  "subscription.renewed":      "active",
  "subscription.cancelled":    "cancelled",
  "order.refunded":            "refunded",
  "order.chargeback":          "chargeback",
  "order.cancelled":           "cancelled",
  "subscription.past_due":     "past_due",
};

// Eventos que representam pagamento recorrente aprovado (libera novo mês)
const RECURRING_PAYMENT_EVENTS = new Set([
  "subscription.renewed",
  "subscription.activated",
  "order.approved",
  "order.paid",
]);

// Eventos que bloqueiam acesso
const BLOCKING_EVENTS = new Set([
  "order.refunded",
  "order.chargeback",
  "order.cancelled",
  "subscription.cancelled",
]);

function detectPlan(productName: string, amountReais: number): PlanName {
  const name = productName.toLowerCase();
  if (name.includes("pro")) return "pro";
  if (name.includes("essencial")) return "essencial";
  // fallback por preço (R$ 50+ = pro)
  return amountReais >= 50 ? "pro" : "essencial";
}

function extractPayload(payload: Record<string, unknown>) {
  if (!payload.event || !payload.data) return null;

  const event = payload.event as string;
  const data = payload.data as Record<string, unknown>;
  const customer = (data.customer ?? {}) as Record<string, unknown>;
  const product = (data.product ?? {}) as Record<string, unknown>;
  const plan = (data.plan ?? {}) as Record<string, unknown>;
  const subscription = (data.subscription ?? {}) as Record<string, unknown>;

  const amountCents = Number(data.amount ?? data.price ?? plan.price ?? 0);
  const amountReais = amountCents > 1000 ? amountCents / 100 : amountCents;

  const productName =
    (product.name ?? data.product_name ?? plan.name ?? "MeuNegócio Pro") as string;

  return {
    event,
    email: ((customer.email ?? data.email ?? "") as string).toLowerCase().trim(),
    buyer_name: (customer.name ?? customer.full_name ?? data.buyer_name ?? "") as string,
    transaction_id: (data.order_id ?? data.id ?? data.transaction_id ?? "") as string,
    product_id: (product.id ?? data.product_id ?? "") as string,
    product_name: productName,
    amount: amountReais,
    currency: (data.currency ?? "BRL") as string,
    kirvano_subscription_id: (
      subscription.id ??
      data.subscription_id ??
      null
    ) as string | null,
    kirvano_customer_id: (
      customer.id ??
      data.customer_id ??
      null
    ) as string | null,
    current_period_start: (
      subscription.current_period_start ??
      data.current_period_start ??
      null
    ) as string | null,
    current_period_end: (
      subscription.current_period_end ??
      data.current_period_end ??
      null
    ) as string | null,
    next_billing_at: (
      subscription.next_billing_at ??
      data.next_billing_at ??
      null
    ) as string | null,
    plan: detectPlan(productName, amountReais),
  };
}

async function upsertSubscription(params: {
  email: string;
  buyer_name: string;
  plan: PlanName;
  amount: number;
  subStatus: SubscriptionStatus;
  kirvano_subscription_id: string | null;
  kirvano_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  next_billing_at: string | null;
  rawPayload: Record<string, unknown>;
}) {
  const now = new Date().toISOString();
  const periodStart = params.current_period_start ?? now;
  const periodEnd = params.current_period_end ??
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Tenta achar a assinatura existente por subscription_id Kirvano ou por email
  let existingId: string | null = null;

  if (params.kirvano_subscription_id) {
    const { data } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("kirvano_subscription_id", params.kirvano_subscription_id)
      .single();
    if (data) existingId = data.id;
  }

  if (!existingId) {
    const { data } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("email", params.email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (data) existingId = data.id;
  }

  // Vincula user_id se o email já tem conta
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", params.email)
    .single();
  const userId = profile?.user_id ?? null;

  if (existingId) {
    await supabase
      .from("subscriptions")
      .update({
        status: params.subStatus,
        plan_name: params.plan,
        plan_price: params.amount,
        kirvano_subscription_id: params.kirvano_subscription_id,
        kirvano_customer_id: params.kirvano_customer_id,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        last_payment_at: now,
        next_billing_at: params.next_billing_at ?? periodEnd,
        user_id: userId,
        updated_at: now,
      })
      .eq("id", existingId);
  } else {
    await supabase.from("subscriptions").insert({
      email: params.email,
      plan_name: params.plan,
      plan_price: params.amount,
      status: params.subStatus,
      kirvano_subscription_id: params.kirvano_subscription_id,
      kirvano_customer_id: params.kirvano_customer_id,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      last_payment_at: now,
      next_billing_at: params.next_billing_at ?? periodEnd,
      user_id: userId,
    });
  }
}

async function processExtraPackage(params: {
  email: string;
  extraSlug: ExtraPackageSlug;
  transactionId: string;
  purchaseStatus: string;
}) {
  // Busca o pacote no catálogo
  const { data: pkg } = await supabase
    .from("extra_packages")
    .select("id, name, slug, posts_quantity, captions_quantity, stories_quantity, messages_quantity")
    .eq("slug", params.extraSlug)
    .single();

  if (!pkg) {
    console.warn(`[webhook] Pacote extra não encontrado: ${params.extraSlug}`);
    return;
  }

  // Encontra user_id pelo email
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", params.email)
    .single();

  // Encontra a purchase pelo transaction_id
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("transaction_id", params.transactionId)
    .single();

  const status = params.purchaseStatus === "approved" ? "active" : params.purchaseStatus;

  // Evita duplicatas por transaction_id
  const { data: existing } = await supabase
    .from("user_extra_packages")
    .select("id")
    .eq("transaction_id", params.transactionId)
    .single();

  if (existing) {
    await supabase
      .from("user_extra_packages")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase.from("user_extra_packages").insert({
      user_id:        profile?.user_id ?? null,
      email:          params.email,
      purchase_id:    purchase?.id ?? null,
      package_id:     pkg.id,
      package_name:   pkg.name,
      package_slug:   pkg.slug,
      status,
      transaction_id: params.transactionId,
      posts_added:     pkg.posts_quantity,
      captions_added:  pkg.captions_quantity,
      stories_added:   pkg.stories_quantity,
      messages_added:  pkg.messages_quantity,
      purchased_at:    new Date().toISOString(),
    });
  }

  console.log(`[webhook] Pacote extra "${pkg.name}" → ${params.email} (${status})`);
}

async function blockUserAccess(email: string) {
  // Bloqueia kits
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", email);

  if (profiles && profiles.length > 0) {
    const userIds = profiles.map((p) => p.user_id);
    await supabase
      .from("kits")
      .update({ status: "blocked" })
      .in("user_id", userIds);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validação do token secreto
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature =
        request.headers.get("x-webhook-token") ??
        request.headers.get("x-kirvano-signature") ??
        request.headers.get("authorization")?.replace("Bearer ", "");

      if (signature !== webhookSecret) {
        console.warn("[webhook] Token inválido");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const rawBody = await request.text();
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const extracted = extractPayload(payload);
    if (!extracted || !extracted.email) {
      console.warn("[webhook] Payload não reconhecido", payload);
      return NextResponse.json({ received: true });
    }

    const { event, email } = extracted;

    const purchaseStatus = EVENT_TO_PURCHASE_STATUS[event];
    const subStatus = EVENT_TO_SUB_STATUS[event];

    console.log(`[webhook] event=${event} email=${email} plan=${extracted.plan}`);

    // ── 1. Registra/atualiza na tabela purchases (histórico imutável) ──
    if (purchaseStatus) {
      const { data: existing } = await supabase
        .from("purchases")
        .select("id")
        .eq("transaction_id", extracted.transaction_id)
        .single();

      if (existing) {
        await supabase
          .from("purchases")
          .update({ status: purchaseStatus, updated_at: new Date().toISOString(), raw_payload: payload })
          .eq("id", existing.id);
      } else {
        await supabase.from("purchases").insert({
          email,
          buyer_name: extracted.buyer_name,
          product_id: extracted.product_id,
          product_name: extracted.product_name,
          transaction_id: extracted.transaction_id,
          platform: "kirvano",
          status: purchaseStatus,
          amount: extracted.amount,
          currency: extracted.currency,
          purchased_at: new Date().toISOString(),
          raw_payload: payload,
        });
      }
    }

    // ── 2. Atualiza/cria subscription ──
    if (subStatus) {
      await upsertSubscription({
        email,
        buyer_name: extracted.buyer_name,
        plan: extracted.plan,
        amount: extracted.amount,
        subStatus,
        kirvano_subscription_id: extracted.kirvano_subscription_id,
        kirvano_customer_id: extracted.kirvano_customer_id,
        current_period_start: extracted.current_period_start,
        current_period_end: extracted.current_period_end,
        next_billing_at: extracted.next_billing_at,
        rawPayload: payload,
      });
    }

    // ── 3. Bloqueia acesso se necessário ──
    if (BLOCKING_EVENTS.has(event)) {
      await blockUserAccess(email);
    }

    // ── 4. Processa pacote extra se for compra de pacote ──
    const extraSlug = detectExtraPackage(extracted.product_name);
    if (extraSlug && purchaseStatus === "approved") {
      await processExtraPackage({
        email,
        extraSlug,
        transactionId: extracted.transaction_id,
        purchaseStatus,
      });
    }

    // ── 5. Log ──
    if (RECURRING_PAYMENT_EVENTS.has(event) && subStatus === "active") {
      console.log(`[webhook] Pagamento recorrente aprovado → ${email} (${extracted.plan}).`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook] Erro interno:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
