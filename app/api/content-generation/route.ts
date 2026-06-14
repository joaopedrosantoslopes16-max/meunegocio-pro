import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { generateGeminiReels, generateGeminiHeadlines, generateGeminiStory } from "@/lib/gemini-reels";
import {
  generateNarratives,
  generateHeadlines,
  generateReelsScript,
  generateCarouselContent,
  generateStorySequence,
  generateCaption,
  generateCaptionVariations,
  generateWhatsAppMessage,
  generateWhatsAppVariations,
  getQuickTopicSuggestions,
  getInterpretation,
  type ContentInput,
  type RefinementMode,
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
  const {
    business_id,
    topic,
    format,
    narrative,
    headline,
    refinementMode,
    platform,
    angle,
  } = body as {
    business_id: string;
    topic: string;
    format: ContentFormat;
    narrative?: string;
    headline?: string;
    refinementMode?: RefinementMode;
    platform?: "reels" | "shorts";
    angle?: string;
  };

  if (!business_id || !topic) {
    return NextResponse.json({ error: "business_id e topic são obrigatórios." }, { status: 400 });
  }

  // Verifica ownership via kits
  const { data: kit } = await supabaseAdmin
    .from("kits")
    .select("business_id")
    .eq("user_id", user.id)
    .eq("business_id", business_id)
    .single();

  if (!kit) {
    return NextResponse.json({ error: "Negócio não encontrado." }, { status: 404 });
  }

  // Busca dados completos do negócio para contexto rico
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id, business_name, niche, city, whatsapp, main_service, services_json, short_description, services")
    .eq("id", business_id)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Negócio não encontrado." }, { status: 404 });
  }

  const isPro = planName === "pro";
  const proFormats: ContentFormat[] = ["reels", "story"];

  if (proFormats.includes(format) && !isPro) {
    return NextResponse.json({
      error: "Roteiros para Reels e Stories estão disponíveis apenas no plano Pro.",
      upgrade: true,
    }, { status: 403 });
  }

  // Seed aleatório — garante variação a cada geração
  const variationSeed = Math.floor(Math.random() * 1000);

  // Combina arrays de serviços (services pode vir como array ou services_json)
  const allServices: string[] = [
    ...(Array.isArray(business.services) ? business.services : []),
    ...(Array.isArray(business.services_json) ? business.services_json : []),
  ].filter(Boolean);

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
    variationSeed,
    refinementMode,
    services: allServices.length > 0 ? allServices : undefined,
    shortDescription: business.short_description ?? undefined,
  };

  // Gera interpretação do pedido (para retornar ao frontend)
  const interpretation = getInterpretation(input);

  // Input Gemini reutilizado em headlines e roteiro
  const videoPlatform = platform ?? "reels";
  const geminiInput = {
    topic,
    niche: business.niche,
    businessName: business.business_name,
    city: business.city,
    mainService: business.main_service,
    services: allServices.length > 0 ? allServices : undefined,
    shortDescription: business.short_description ?? undefined,
    platform: videoPlatform,
    angle,
  };

  // Roda narrativas, headlines (template + Gemini) e roteiro em paralelo
  const narratives = generateNarratives(input);
  const templateHeadlines = generateHeadlines(input);

  const [geminiHeadlines, geminiScript, geminiStories] = await Promise.all([
    format === "reels" ? generateGeminiHeadlines(geminiInput) : Promise.resolve(null),
    format === "reels" ? generateGeminiReels(geminiInput) : Promise.resolve(null),
    format === "story" ? generateGeminiStory(geminiInput) : Promise.resolve(null),
  ]);

  // Usa Gemini se disponível, senão cai nos templates
  const headlines = geminiHeadlines ?? templateHeadlines;

  const captionInput = { ...input, headline: headline ?? headlines[0] };
  const caption = generateCaption(captionInput);
  const captionVariations = generateCaptionVariations(captionInput);
  const whatsappMessage = generateWhatsAppMessage(input);
  const whatsappVariations = generateWhatsAppVariations(input);

  // Gera formato específico
  let script = null;
  let carousel = null;
  let stories = null;

  if (format === "reels") {
    script = geminiScript ?? generateReelsScript({ ...input, headline: headline ?? headlines[0] });
  } else if (format === "carrossel") {
    carousel = generateCarouselContent({ ...input, headline: headline ?? headlines[0] });
  } else if (format === "story") {
    stories = geminiStories ?? generateStorySequence({ ...input, headline: headline ?? headlines[0] });
  }

  // Salva no banco (não falhar se der erro de save)
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
    caption_variations: captionVariations,
    whatsapp_message: whatsappMessage,
    whatsapp_variations: whatsappVariations,
    format,
    platform: videoPlatform,
    plan: planName,
    interpretation,
    variationSeed,
  });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const business_id = searchParams.get("business_id");
  const niche = searchParams.get("niche");

  const query = supabase
    .from("content_generations")
    .select("id, topic, format, caption, created_at, selected_headline")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (business_id) query.eq("business_id", business_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Retorna sugestões rápidas baseadas no nicho se pedido
  const suggestions = niche ? getQuickTopicSuggestions(niche) : null;

  return NextResponse.json({ generations: data ?? [], suggestions });
}
