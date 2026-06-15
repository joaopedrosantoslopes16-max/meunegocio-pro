import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { generateCarouselFromDescription } from "@/lib/carousel-ai";
import { generatePremiumCarousel } from "@/lib/carousel-service";
import type { CarouselVisualStyle } from "@/types";

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

  if (planName !== "pro") {
    return NextResponse.json({
      error: "pro_required",
      message: "O Gerador de Carrossel por Descrição está disponível no plano Pro.",
    }, { status: 403 });
  }

  const body = await req.json() as {
    business_id: string;
    description: string;
    visual_style?: CarouselVisualStyle;
    format?: "4/5" | "1/1" | "9/16";
    slide_count?: number;
    selected_images?: string[];
    primary_color?: string;
  };

  if (!body.business_id || !body.description?.trim()) {
    return NextResponse.json({ error: "business_id e description são obrigatórios." }, { status: 400 });
  }

  const { data: kit } = await supabaseAdmin
    .from("kits")
    .select("business_id, businesses(*)")
    .eq("user_id", user.id)
    .eq("business_id", body.business_id)
    .limit(1)
    .single();

  if (!kit) return NextResponse.json({ error: "Negócio não encontrado." }, { status: 404 });

  const business = kit.businesses as unknown as Record<string, unknown>;
  const slideCount = body.slide_count ?? 6;

  // Gera carrossel base como fallback
  const fallbackCarousel = generatePremiumCarousel({
    topic: body.description,
    objective: "autoridade",
    niche: (business.niche as string) ?? "outro",
    businessName: (business.business_name as string) ?? "",
    city: (business.city as string) ?? "",
    mainService: (business.main_service as string) ?? "",
    whatsapp: (business.whatsapp as string) ?? "",
    selectedImages: body.selected_images ?? [],
    visualStyle: body.visual_style ?? "moderno",
    format: body.format ?? "4/5",
    slideCount,
    services: Array.isArray(business.services) ? (business.services as string[]) : [],
    benefits: Array.isArray(business.benefits_json) ? (business.benefits_json as string[]) : [],
    description: (business.short_description as string) ?? "",
    testimonials: [],
    regenerationSeed: 0,
    primaryColor: body.primary_color ?? (business.primary_color as string) ?? undefined,
  });

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ ...fallbackCarousel, aiGenerated: false });
  }

  try {
    const aiContent = await generateCarouselFromDescription({
      userDescription: body.description,
      businessName: (business.business_name as string) ?? "",
      niche: (business.niche as string) ?? "outro",
      mainService: (business.main_service as string) ?? "",
      city: (business.city as string) ?? "",
      whatsapp: (business.whatsapp as string) ?? "",
      description: (business.short_description as string) ?? "",
      services: Array.isArray(business.services) ? (business.services as string[]).slice(0, 5) : [],
      benefits: Array.isArray(business.benefits_json) ? (business.benefits_json as string[]).slice(0, 3) : [],
      targetAudience: (business.target_audience as string) ?? undefined,
      goals: Array.isArray(business.goals_json) && (business.goals_json as string[]).length > 0
        ? (business.goals_json as string[])
        : undefined,
      slideCount,
      apiKey: groqKey,
    });

    if (!aiContent) {
      return NextResponse.json({ ...fallbackCarousel, aiGenerated: false });
    }

    // Aplica conteúdo AI sobre o esqueleto de slides do fallback
    const enhancedSlides = fallbackCarousel.slides.map((slide, i) => {
      if (i === 0) {
        return { ...slide, title: aiContent.coverTitle || slide.title, subtitle: aiContent.coverSubtitle || slide.subtitle };
      }
      if (i === fallbackCarousel.slides.length - 1) return slide; // CTA inalterado
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
      ...fallbackCarousel,
      slides: enhancedSlides,
      caption: aiContent.caption || fallbackCarousel.caption,
      whatsappMessage: aiContent.whatsappMessage || fallbackCarousel.whatsappMessage,
      topic: body.description,
      aiGenerated: true,
    });
  } catch (err) {
    console.error("[from-description] AI failed, returning fallback:", err);
    return NextResponse.json({ ...fallbackCarousel, aiGenerated: false });
  }
}
