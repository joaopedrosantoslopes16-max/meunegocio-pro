import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { generatePremiumCarousel, type CarouselInput } from "@/lib/carousel-service";
import type { CarouselObjective, CarouselVisualStyle } from "@/types";

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
  };

  if (!body.business_id || !body.topic) {
    return NextResponse.json({ error: "business_id e topic são obrigatórios." }, { status: 400 });
  }

  // Gerador de Carrossel Premium é recurso Pro
  if (planName !== "pro") {
    return NextResponse.json({ error: "pro_required", message: "Gerador de Carrossel Premium disponível no plano Pro." }, { status: 403 });
  }

  // Verificar ownership
  const { data: kit } = await supabaseAdmin
    .from("kits")
    .select("business_id, businesses(*)")
    .eq("user_id", user.id)
    .eq("business_id", body.business_id)
    .limit(1)
    .single();

  if (!kit) return NextResponse.json({ error: "Negócio não encontrado." }, { status: 404 });

  const business = kit.businesses as any;

  const input: CarouselInput = {
    topic: body.topic,
    objective: body.objective ?? "vender",
    niche: business.niche ?? "outro",
    businessName: business.business_name ?? "",
    city: business.city ?? "",
    mainService: business.main_service ?? "",
    whatsapp: business.whatsapp ?? "",
    selectedImages: body.selected_images ?? [],
    slideImagesMap: body.slide_images_map,
    visualStyle: body.visual_style ?? "moderno",
    format: body.format ?? "4/5",
    slideCount: body.slide_count ?? 6,
  };

  const carousel = generatePremiumCarousel(input);

  // Optionally save to DB
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
