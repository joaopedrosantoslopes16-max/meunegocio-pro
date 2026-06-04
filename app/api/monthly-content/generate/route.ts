import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { generatePosts, generateCaptions, generateWhatsAppMessages } from "@/lib/kit-generator";
import { generateCalendar } from "@/lib/calendar-generator";
import { generateCampaigns } from "@/lib/campaign-generator";
import type { PlanName } from "@/types";

// Service role para INSERT (contorna RLS quando necessário)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_LIMITS: Record<PlanName, { posts: number; captions: number; messages: number }> = {
  essencial: { posts: 5, captions: 5, messages: 5 },
  pro:       { posts: 15, captions: 15, messages: 15 },
};

export async function POST(request: NextRequest) {
  try {
    // Autenticação via cookie de sessão
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json() as { business_id?: string };
    const businessId = body.business_id;
    if (!businessId) {
      return NextResponse.json({ error: "business_id obrigatório" }, { status: 400 });
    }

    // Verifica ownership pelo kits (businesses não tem user_id direto)
    const { data: kit } = await supabaseAdmin
      .from("kits")
      .select("business_id")
      .eq("user_id", user.id)
      .eq("business_id", businessId)
      .single();

    if (!kit) {
      return NextResponse.json({ error: "Negócio não encontrado" }, { status: 404 });
    }

    const { data: business } = await supabaseAdmin
      .from("businesses")
      .select("id, business_name, niche, city, whatsapp, main_service, services")
      .eq("id", businessId)
      .single();

    if (!business) {
      return NextResponse.json({ error: "Negócio não encontrado" }, { status: 404 });
    }

    // Busca a assinatura ativa do usuário
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("id, plan_name, status")
      .eq("email", user.email)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: "Assinatura ativa não encontrada. Verifique seu pagamento." },
        { status: 403 }
      );
    }

    const plan = (subscription.plan_name as PlanName) ?? "essencial";
    const limits = PLAN_LIMITS[plan];

    // Mês e ano atual
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    // Verifica se já gerou conteúdo para este mês
    const { data: existing } = await supabaseAdmin
      .from("monthly_content")
      .select("id, generated_at")
      .eq("user_id", user.id)
      .eq("business_id", businessId)
      .eq("month", month)
      .eq("year", year)
      .single();

    if (existing?.generated_at) {
      return NextResponse.json(
        { error: "Conteúdo deste mês já foi gerado.", already_generated: true },
        { status: 409 }
      );
    }

    // Gera o conteúdo usando os geradores existentes
    const input = {
      business_name: business.business_name,
      niche: business.niche,
      city: business.city,
      whatsapp: business.whatsapp,
      main_service: business.main_service,
      services: business.services ?? [],
    };

    const allPosts    = generatePosts({ ...input, month, year });
    const allCaptions = generateCaptions(input);
    const allMessages = generateWhatsAppMessages(input);
    const calendar    = generateCalendar(input);
    const campaigns   = plan === "pro" ? generateCampaigns(input) : [];

    // Fatia pelo limite do plano
    const posts    = allPosts.slice(0, limits.posts).map((p, i) => ({ ...p, number: i + 1, is_unlocked: true }));
    const captions = allCaptions.slice(0, limits.captions);
    const messages = allMessages.slice(0, limits.messages);

    const generatedAt = now.toISOString();

    if (existing) {
      // Atualiza registro existente sem generated_at
      const { error } = await supabaseAdmin
        .from("monthly_content")
        .update({
          plan_name:       plan,
          posts_limit:     limits.posts,
          captions_limit:  limits.captions,
          messages_limit:  limits.messages,
          posts_json:      posts,
          captions_json:   captions,
          messages_json:   messages,
          campaigns_json:  campaigns,
          calendar_json:   calendar,
          generated_at:    generatedAt,
          subscription_id: subscription.id,
        })
        .eq("id", existing.id);

      if (error) throw error;

      return NextResponse.json({ success: true, month, year, plan, limits });
    }

    // Insere novo registro
    const { error } = await supabaseAdmin.from("monthly_content").insert({
      user_id:         user.id,
      subscription_id: subscription.id,
      business_id:     businessId,
      month,
      year,
      plan_name:       plan,
      posts_limit:     limits.posts,
      captions_limit:  limits.captions,
      messages_limit:  limits.messages,
      posts_json:      posts,
      captions_json:   captions,
      messages_json:   messages,
      campaigns_json:  campaigns,
      calendar_json:   calendar,
      generated_at:    generatedAt,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, month, year, plan, limits });
  } catch (err) {
    console.error("[monthly-content/generate]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
