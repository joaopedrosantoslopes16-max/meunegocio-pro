import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// WEBHOOK — Kiwify
//
// Configure a URL no painel da Kiwify:
//   Configurações → Webhooks → https://meunegocio-pro.netlify.app/api/webhooks/kiwify
//
// Configure o token secreto em .env.local (Netlify):
//   WEBHOOK_SECRET=seu-token-aqui
//
// No painel Kiwify: Settings → Webhooks → Token = mesmo valor do WEBHOOK_SECRET
// ============================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type PlanName = "essencial" | "pro";
type ExtraSlug = "instagram-extra" | "stories" | "reativacao";
type PurchaseStatus = "pending" | "approved" | "refunded" | "chargeback" | "cancelled" | "failed";
type SubStatus = "active" | "pending" | "cancelled" | "refunded" | "chargeback" | "past_due";

// Kiwify event → purchase status
const KIWIFY_PURCHASE_STATUS: Record<string, PurchaseStatus> = {
  order_approved:           "approved",
  order_refunded:           "refunded",
  order_chargeback:         "chargeback",
  subscription_active:      "active" as any,
  subscription_renewed:     "active" as any,
  subscription_canceled:    "cancelled",
  subscription_late_payment: "failed",
};

// Kiwify event → subscription status
const KIWIFY_SUB_STATUS: Record<string, SubStatus> = {
  order_approved:            "active",
  subscription_active:       "active",
  subscription_renewed:      "active",
  subscription_canceled:     "cancelled",
  order_refunded:            "refunded",
  order_chargeback:          "chargeback",
  subscription_late_payment: "past_due",
};

const BLOCKING_EVENTS = new Set([
  "order_refunded",
  "order_chargeback",
  "subscription_canceled",
]);

const EXTRA_SLUGS: Record<string, ExtraSlug> = {
  "instagram extra":           "instagram-extra",
  "pacote instagram extra":    "instagram-extra",
  "instagram-extra":           "instagram-extra",
  "stories":                   "stories",
  "pacote stories":            "stories",
  "reativacao":                "reativacao",
  "reativação":                "reativacao",
  "reativacao de clientes":    "reativacao",
  "reativação de clientes":    "reativacao",
};

function detectExtra(productName: string): ExtraSlug | null {
  const n = productName.toLowerCase().trim();
  for (const [key, slug] of Object.entries(EXTRA_SLUGS)) {
    if (n.includes(key)) return slug;
  }
  return null;
}

function detectPlan(productName: string, amountReais: number): PlanName {
  const n = productName.toLowerCase();
  if (n.includes("pro")) return "pro";
  if (n.includes("essencial")) return "essencial";
  return amountReais >= 50 ? "pro" : "essencial";
}

function extractKiwify(payload: Record<string, unknown>) {
  const event  = payload.event as string;
  const order  = (payload.order ?? {}) as Record<string, unknown>;
  const customer = (order.customer ?? {}) as Record<string, unknown>;
  const product  = (order.product  ?? {}) as Record<string, unknown>;
  const sub      = (order.subscription ?? {}) as Record<string, unknown>;

  // Kiwify envia valor em centavos
  const amountRaw = Number(order.total_value ?? order.amount ?? 0);
  const amountReais = amountRaw > 1000 ? amountRaw / 100 : amountRaw;

  const productName = (product.name ?? order.product_name ?? "MeuNegócio Pro") as string;

  return {
    event,
    email:         ((customer.email ?? order.email ?? "") as string).toLowerCase().trim(),
    buyer_name:    (customer.name ?? customer.full_name ?? "") as string,
    transaction_id:(order.id ?? order.order_id ?? "") as string,
    product_id:    (product.id ?? "") as string,
    product_name:  productName,
    amount:        amountReais,
    currency:      (order.currency ?? "BRL") as string,
    sub_id:        (sub.id ?? order.subscription_id ?? null) as string | null,
    customer_id:   (customer.id ?? null) as string | null,
    period_start:  (sub.current_period_start ?? null) as string | null,
    period_end:    (sub.current_period_end   ?? null) as string | null,
    next_billing:  (sub.next_billing_at      ?? null) as string | null,
    plan:          detectPlan(productName, amountReais),
  };
}

async function upsertSubscription(p: {
  email: string; buyer_name: string; plan: PlanName; amount: number;
  subStatus: SubStatus; sub_id: string | null; customer_id: string | null;
  period_start: string | null; period_end: string | null; next_billing: string | null;
}) {
  const now      = new Date().toISOString();
  const pStart   = p.period_start ?? now;
  const pEnd     = p.period_end   ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  let existingId: string | null = null;

  if (p.sub_id) {
    const { data } = await supabase.from("subscriptions").select("id")
      .eq("kirvano_subscription_id", p.sub_id).single();
    if (data) existingId = data.id;
  }
  if (!existingId) {
    const { data } = await supabase.from("subscriptions").select("id")
      .eq("email", p.email).order("created_at", { ascending: false }).limit(1).single();
    if (data) existingId = data.id;
  }

  const { data: profile } = await supabase.from("profiles").select("user_id").eq("email", p.email).single();
  const userId = profile?.user_id ?? null;

  const fields = {
    status: p.subStatus, plan_name: p.plan, plan_price: p.amount,
    kirvano_subscription_id: p.sub_id, kirvano_customer_id: p.customer_id,
    current_period_start: pStart, current_period_end: pEnd,
    last_payment_at: now, next_billing_at: p.next_billing ?? pEnd,
    user_id: userId, updated_at: now,
  };

  if (existingId) {
    await supabase.from("subscriptions").update(fields).eq("id", existingId);
  } else {
    await supabase.from("subscriptions").insert({ email: p.email, ...fields });
  }
}

async function blockAccess(email: string) {
  const { data: profiles } = await supabase.from("profiles").select("user_id").eq("email", email);
  if (profiles?.length) {
    await supabase.from("kits").update({ status: "blocked" })
      .in("user_id", profiles.map((p) => p.user_id));
  }
}

async function processExtra(email: string, slug: ExtraSlug, txId: string) {
  const { data: pkg } = await supabase.from("extra_packages")
    .select("id,name,slug,posts_quantity,captions_quantity,stories_quantity,messages_quantity")
    .eq("slug", slug).single();
  if (!pkg) return;

  const { data: profile } = await supabase.from("profiles").select("user_id").eq("email", email).single();
  const { data: purchase } = await supabase.from("purchases").select("id").eq("transaction_id", txId).single();
  const { data: existing } = await supabase.from("user_extra_packages").select("id").eq("transaction_id", txId).single();

  if (existing) {
    await supabase.from("user_extra_packages").update({ status: "active", updated_at: new Date().toISOString() }).eq("id", existing.id);
  } else {
    await supabase.from("user_extra_packages").insert({
      user_id: profile?.user_id ?? null, email,
      purchase_id: purchase?.id ?? null,
      package_id: pkg.id, package_name: pkg.name, package_slug: pkg.slug,
      status: "active", transaction_id: txId,
      posts_added: pkg.posts_quantity, captions_added: pkg.captions_quantity,
      stories_added: pkg.stories_quantity, messages_added: pkg.messages_quantity,
      purchased_at: new Date().toISOString(),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Valida token
    const secret = process.env.WEBHOOK_SECRET;
    if (secret) {
      const token =
        req.headers.get("x-kiwify-event-token") ??
        req.headers.get("x-webhook-token") ??
        req.nextUrl.searchParams.get("token");
      if (token !== secret) {
        console.warn("[kiwify-webhook] Token inválido");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const raw = await req.text();
    let payload: Record<string, unknown>;
    try { payload = JSON.parse(raw); }
    catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const d = extractKiwify(payload);
    if (!d.email) {
      console.warn("[kiwify-webhook] Payload sem email", payload);
      return NextResponse.json({ received: true });
    }

    console.log(`[kiwify-webhook] event=${d.event} email=${d.email} plan=${d.plan} amount=${d.amount}`);

    const purchaseStatus = KIWIFY_PURCHASE_STATUS[d.event];
    const subStatus      = KIWIFY_SUB_STATUS[d.event];

    // 1. Registra compra
    if (purchaseStatus) {
      const normalizedStatus = (purchaseStatus === ("active" as any)) ? "approved" : purchaseStatus;
      const { data: existing } = await supabase.from("purchases").select("id").eq("transaction_id", d.transaction_id).single();
      if (existing) {
        await supabase.from("purchases").update({ status: normalizedStatus, updated_at: new Date().toISOString(), raw_payload: payload }).eq("id", existing.id);
      } else {
        await supabase.from("purchases").insert({
          email: d.email, buyer_name: d.buyer_name,
          product_id: d.product_id, product_name: d.product_name,
          transaction_id: d.transaction_id, platform: "kiwify",
          status: normalizedStatus, amount: d.amount, currency: d.currency,
          purchased_at: new Date().toISOString(), raw_payload: payload,
        });
      }
    }

    // 2. Atualiza assinatura
    if (subStatus) {
      await upsertSubscription({
        email: d.email, buyer_name: d.buyer_name, plan: d.plan, amount: d.amount,
        subStatus, sub_id: d.sub_id, customer_id: d.customer_id,
        period_start: d.period_start, period_end: d.period_end, next_billing: d.next_billing,
      });
    }

    // 3. Bloqueia acesso se necessário
    if (BLOCKING_EVENTS.has(d.event)) {
      await blockAccess(d.email);
    }

    // 4. Pacote extra
    const extraSlug = detectExtra(d.product_name);
    if (extraSlug && d.event === "order_approved") {
      await processExtra(d.email, extraSlug, d.transaction_id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[kiwify-webhook] Erro:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
