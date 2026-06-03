import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  generateNarratives,
  generateHeadlines,
  generateReelsScript,
  generateCarouselContent,
  generateStorySequence,
  generateCaption,
  generateWhatsAppMessage,
  type ContentInput,
} from "@/lib/ai-content-service";
import type { ContentFormat } from "@/types";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  // Verificar plano Pro para recursos completos
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("plan_name, status")
    .eq("email", user.email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const planName = subscription?.plan_name ?? "essencial";
  const isActive = subscription?.status === "active";

  if (!isActive) {
    return NextResponse.json({ error: "Assinatura inativa. Ative sua assinatura para usar o gerador." }, { status: 403 });
  }

  const body = await req.json();
  const { business_id, topic, format, narrative, headline } = body as {
    business_id: string;
    topic: string;
    format: ContentFormat;
    narrative?: string;
    headline?: string;
  };

  if (!business_id || !topic) {
    return NextResponse.json({ error: "business_id e topic são obrigatórios." }, { status: 400 });
  }

  // Verificar ownership pelo kits (businesses não tem user_id direto)
  const { data: kit } = await supabaseAdmin
    .from("kits")
    .select("business_id")
    .eq("user_id", user.id)
    .eq("business_id", business_id)
    .single();

  if (!kit) {
    return NextResponse.json({ error: "Negócio não encontrado." }, { status: 404 });
  }

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id, business_name, niche, city, whatsapp, main_service")
    .eq("id", business_id)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Negócio não encontrado." }, { status: 404 });
  }

  const isPro = planName === "pro";
  const proFormats: ContentFormat[] = ["reels", "story"];

  // Reels e Stories são exclusivos do Pro
  if (proFormats.includes(format) && !isPro) {
    return NextResponse.json({
      error: "Roteiros para Reels e Stories estão disponíveis apenas no plano Pro.",
      upgrade: true,
    }, { status: 403 });
  }

  const input: ContentInput = {
    topic,
    niche: business.niche,
    businessName: business.business_name,
    city: business.city,
    mainService: business.main_service,
    whatsapp: business.whatsapp,
    narrative,
    headline,
    plan: planName,
  };

  // Gerar narrativas e headlines sempre
  const narratives = generateNarratives(input);
  const headlines = generateHeadlines(input);
  const caption = generateCaption({ ...input, headline: headline ?? headlines[0] });
  const whatsappMessage = generateWhatsAppMessage(input);

  // Gerar formato específico
  let script = null;
  let carousel = null;
  let stories = null;

  if (format === "reels") {
    script = generateReelsScript({ ...input, headline: headline ?? headlines[0] });
  } else if (format === "carrossel") {
    carousel = generateCarouselContent({ ...input, headline: headline ?? headlines[0] });
  } else if (format === "story") {
    stories = generateStorySequence({ ...input, headline: headline ?? headlines[0] });
  }

  // Salvar no banco
  const { data: saved, error: saveError } = await supabase
    .from("content_generations")
    .insert({
      user_id: user.id,
      business_id,
      topic,
      format,
      narrative_json: narratives,
      headlines_json: headlines,
      script_json: script,
      carousel_json: carousel,
      stories_json: stories,
      caption,
      whatsapp_message: whatsappMessage,
      selected_narrative: narrative ?? null,
      selected_headline: headline ?? null,
    })
    .select()
    .single();

  if (saveError) {
    // Não falhar por erro de save — retornar o conteúdo mesmo assim
    console.error("Erro ao salvar geração:", saveError);
  }

  return NextResponse.json({
    id: saved?.id ?? null,
    narratives,
    headlines,
    script,
    carousel,
    stories,
    caption,
    whatsapp_message: whatsappMessage,
    format,
    plan: planName,
  });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const business_id = searchParams.get("business_id");

  const query = supabase
    .from("content_generations")
    .select("id, topic, format, caption, created_at, selected_headline")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (business_id) query.eq("business_id", business_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ generations: data ?? [] });
}
