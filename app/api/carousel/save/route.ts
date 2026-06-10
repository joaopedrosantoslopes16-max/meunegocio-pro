import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { PremiumCarouselSlide } from "@/types";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json() as {
    business_id: string;
    id?: string;
    title: string;
    topic: string;
    objective: string;
    niche: string;
    visual_style: string;
    format: string;
    slides_json: PremiumCarouselSlide[];
    caption: string;
    whatsapp_message: string;
    selected_images_json: string[];
  };

  if (!body.business_id) return NextResponse.json({ error: "business_id obrigatório." }, { status: 400 });

  if (body.id) {
    // Update existing
    const { error } = await supabaseAdmin
      .from("generated_carousels")
      .update({
        title: body.title,
        slides_json: body.slides_json,
        caption: body.caption,
        whatsapp_message: body.whatsapp_message,
        selected_images_json: body.selected_images_json,
        visual_style: body.visual_style,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: body.id });
  }

  // Create new
  const { data, error } = await supabaseAdmin
    .from("generated_carousels")
    .insert({
      user_id: user.id,
      business_id: body.business_id,
      title: body.title,
      topic: body.topic,
      objective: body.objective,
      niche: body.niche,
      visual_style: body.visual_style,
      format: body.format,
      slides_json: body.slides_json,
      caption: body.caption,
      whatsapp_message: body.whatsapp_message,
      selected_images_json: body.selected_images_json,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data?.id });
}
