import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { generatePremiumCarousel, type CarouselInput, extractCleanSubjectPublic } from "@/lib/carousel-service";
import { generateCarouselWithAI, generateCarouselFromDescription } from "@/lib/carousel-ai";
import { getPexelsImagesForCarousel } from "@/lib/pexels-images";
import type { CarouselObjective, CarouselVisualStyle } from "@/types";

function nicheLabelForAI(niche: string): string {
  const n = (niche ?? "").toLowerCase();
  if (n.includes("adv") || n.includes("advocac") || n.includes("jurídic") || n.includes("juridic") || n.includes("direito")) return "Advocacia / Escritório de Advocacia";
  if (n.includes("barb") || n.includes("cabeleir") || n.includes("salão") || n.includes("salao")) return "Barbearia / Salão de Beleza";
  if (n.includes("odonto") || n.includes("dent") || n.includes("ortodon")) return "Odontologia / Clínica Odontológica";
  if (n.includes("personal") || n.includes("academia") || n.includes("fitness") || n.includes("crossfit") || n.includes("pilates")) return "Personal Trainer / Academia";
  if (n.includes("restaur") || n.includes("pizz") || n.includes("hambur") || n.includes("delivery") || n.includes("padaria")) return "Restaurante / Alimentação";
  if (n.includes("estet") || n.includes("beleza") || n.includes("manicur") || n.includes("cílios") || n.includes("micropigment")) return "Estética / Beleza";
  if (n.includes("loja") || n.includes("moda") || n.includes("roupa")) return "Loja / Moda / Varejo";
  if (n.includes("mecani") || n.includes("oficina") || n.includes("autom")) return "Mecânica / Automotivo";
  if (n.includes("imobil") || n.includes("corretor") || n.includes("imovel") || n.includes("imóvel")) return "Imobiliária / Corretagem de Imóveis";
  if (n.includes("clínica") || n.includes("clinica") || n.includes("médic") || n.includes("medic") || n.includes("saúde")) return "Clínica Médica / Saúde";
  if (n.includes("nutri")) return "Nutrição / Saúde Alimentar";
  if (n.includes("psicol") || n.includes("terapia") || n.includes("fisioter")) return "Psicologia / Terapia / Saúde Mental";
  if (n.includes("veterin") || n.includes("pet")) return "Veterinária / Pet Shop";
  if (n.includes("contábil") || n.includes("contabi") || n.includes("contador") || n.includes("contabilidade")) return "Contabilidade / Serviços Contábeis";
  if (n.includes("market") || n.includes("agência") || n.includes("agencia") || n.includes("publicid")) return "Marketing Digital / Agência";
  if (n.includes("tecnolog") || n.includes("software") || n.includes("ti ")) return "Tecnologia / Desenvolvimento de Software";
  if (n.includes("fotograf")) return "Fotografia / Audiovisual";
  if (n.includes("escola") || n.includes("curso") || n.includes("educação")) return "Educação / Escola / Cursos";
  if (n.includes("consult") || n.includes("assessor") || n.includes("coach") || n.includes("mentor")) return "Consultoria / Assessoria";
  if (n.includes("financ") || n.includes("seguro") || n.includes("investim")) return "Finanças / Seguros / Investimentos";
  return niche;
}

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

  if (!subscription || subscription.status !== "active") {
    return NextResponse.json({ error: "Assinatura inativa." }, { status: 403 });
  }

  const planName: "essencial" | "pro" = subscription.plan_name ?? "essencial";

  const body = await req.json() as {
    business_id: string;
    topic: string;
    objective: CarouselObjective;
    visual_style: CarouselVisualStyle;
    format: "4/5" | "1/1" | "9/16";
    selected_images: string[];
    slide_images_map?: Record<number, string>;
    slide_count?: number;
    save?: boolean;
    regeneration_seed?: number;
    regenerate_hint?: "mais_vendedor" | "mais_educativo" | "mais_direto" | "mais_criativo" | "mais_institucional" | "outro_angulo" | "mais_promocional" | "menos_generico" | "outra_paleta" | "outro_layout" | "menos_texto" | "mais_contexto";
    primary_color?: string;
    direct_generate?: boolean;
  };

  if (!body.business_id || !body.topic) {
    return NextResponse.json({ error: "business_id e topic são obrigatórios." }, { status: 400 });
  }

  if (planName !== "pro") {
    return NextResponse.json({ error: "pro_required", message: "Gerador de Carrossel Premium disponível no plano Pro." }, { status: 403 });
  }

  const { data: kit } = await supabaseAdmin
    .from("kits")
    .select("business_id, businesses(*)")
    .eq("user_id", user.id)
    .eq("business_id", body.business_id)
    .limit(1)
    .single();

  if (!kit) return NextResponse.json({ error: "Negócio não encontrado." }, { status: 404 });

  const business = kit.businesses as any;

  const slideCount = body.slide_count ?? 6;
  const regenSeed = body.regeneration_seed ?? 0;

  // Fetch high-quality Pexels images when API key is configured
  // Overrides any LoremFlickr URLs sent from the client
  let resolvedImages: string[] = body.selected_images ?? [];
  let resolvedMap: Record<number, string> | undefined = body.slide_images_map;
  const pexelsKey = process.env.PEXELS_API_KEY;
  if (pexelsKey) {
    const pexelsUrls = await getPexelsImagesForCarousel(
      business.niche ?? "default",
      slideCount,
      regenSeed,
      pexelsKey,
    );
    if (pexelsUrls.length > 0) {
      resolvedImages = pexelsUrls;
      const imgMap: Record<number, string> = {};
      pexelsUrls.forEach((url, i) => { if (i < slideCount - 1) imgMap[i] = url; });
      resolvedMap = imgMap;
    }
  }

  const input: CarouselInput = {
    topic: body.topic,
    objective: body.objective ?? "vender",
    niche: business.niche ?? "outro",
    businessName: business.business_name ?? "",
    city: business.city ?? "",
    mainService: business.main_service ?? "",
    whatsapp: business.whatsapp ?? "",
    selectedImages: resolvedImages,
    slideImagesMap: resolvedMap,
    visualStyle: body.visual_style ?? "moderno",
    format: body.format ?? "4/5",
    slideCount,
    services: Array.isArray(business.services) ? business.services : [],
    benefits: Array.isArray(business.benefits_json) ? business.benefits_json : [],
    description: business.short_description ?? "",
    testimonials: Array.isArray(business.testimonials_json)
      ? business.testimonials_json.slice(0, 3)
      : [],
    regenerationSeed: regenSeed,
    regenerateHint: body.regenerate_hint,
    primaryColor: body.primary_color ?? business.primary_color ?? undefined,
  };

  // Generate base carousel (templates — always fast, used as fallback)
  const carousel = generatePremiumCarousel(input);

  // Try AI enhancement if API key is configured
  const openRouterKey = process.env.GROQ_API_KEY;
  if (openRouterKey) {
    try {
      const nicheForAI = (business.niche === "outro" && business.custom_niche)
        ? business.custom_niche
        : nicheLabelForAI(business.niche ?? "outro");

      const commonProfile = {
        businessName: business.business_name ?? "",
        niche: nicheForAI,
        mainService: business.main_service ?? "",
        city: business.city ?? "",
        description: business.short_description ?? "",
        services: Array.isArray(business.services) ? business.services.slice(0, 4) : [],
        benefits: Array.isArray(business.benefits_json) ? business.benefits_json.slice(0, 3) : [],
        targetAudience: business.target_audience ?? undefined,
        customerPain: business.customer_pain ?? undefined,
        differentiator: business.differentiator ?? undefined,
        tone: business.tone ?? undefined,
        goals: Array.isArray(business.goals_json) && business.goals_json.length > 0 ? business.goals_json : undefined,
      };

      let aiContent;

      if (body.direct_generate && body.topic.trim().length > 20) {
        // "Descreva e gere": user wrote a free description — pass it verbatim so AI interprets intent
        aiContent = await generateCarouselFromDescription({
          ...commonProfile,
          userDescription: body.topic.trim(),
          whatsapp: business.whatsapp ?? "",
          slideCount: carousel.slides.length,
          apiKey: openRouterKey,
        });
      } else {
        // Wizard flow: structured topic → standard carousel AI
        const cleanSubject = extractCleanSubjectPublic(body.topic, business.main_service ?? "");
        const slideRoles = carousel.slides.slice(1, -1).map((slide, i) => ({
          role: slide.badge ?? `slide ${i + 1}`,
          layout: slide.listItems?.length
            ? "title_list" as const
            : slide.body
            ? "title_body" as const
            : "title_only" as const,
        }));

        aiContent = await generateCarouselWithAI({
          ...commonProfile,
          objective: body.objective ?? "vender",
          cleanSubject,
          slideRoles,
          apiKey: openRouterKey,
        });
      }

      if (aiContent) {
        // Apply AI content to slides
        const enhancedSlides = carousel.slides.map((slide, i) => {
          if (i === 0) {
            // Cover slide — use AI cover title
            return {
              ...slide,
              title: aiContent.coverTitle || slide.title,
              subtitle: aiContent.coverSubtitle || slide.subtitle,
            };
          }
          if (i === carousel.slides.length - 1) {
            // CTA slide — keep as is
            return slide;
          }
          // Content slides
          const aiSlide = aiContent.slides[i - 1];
          if (!aiSlide) return slide;
          return {
            ...slide,
            badge: aiSlide.badge || slide.badge,
            title: aiSlide.title || slide.title,
            body: aiSlide.body ?? (aiSlide.listItems ? undefined : slide.body),
            listItems: aiSlide.listItems?.length ? aiSlide.listItems : (aiSlide.body ? undefined : slide.listItems),
          };
        });

        return NextResponse.json({
          ...carousel,
          selectedImages: resolvedImages,
          slides: enhancedSlides,
          caption: aiContent.caption || carousel.caption,
          whatsappMessage: aiContent.whatsappMessage || carousel.whatsappMessage,
          aiGenerated: true,
        });
      }
    } catch (err) {
      console.error("[generate] AI enhancement failed, using templates:", err);
    }
  }

  // Save to DB if requested
  if (body.save) {
    const { data: saved, error } = await supabaseAdmin
      .from("generated_carousels")
      .insert({
        user_id: user.id,
        business_id: body.business_id,
        title: carousel.title,
        topic: carousel.topic,
        objective: carousel.objective,
        niche: business.niche ?? "outro",
        visual_style: carousel.visualStyle,
        format: carousel.format,
        slides_json: carousel.slides,
        caption: carousel.caption,
        whatsapp_message: carousel.whatsappMessage,
        selected_images_json: carousel.selectedImages,
        status: "draft",
      })
      .select("id")
      .single();

    if (!error && saved) {
      return NextResponse.json({ ...carousel, id: saved.id });
    }
  }

  return NextResponse.json(carousel);
}
