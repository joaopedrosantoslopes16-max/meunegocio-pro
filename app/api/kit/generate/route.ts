import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { generatePosts, generateCaptions, generateWhatsAppMessages, generateInstagramBio, generateSlug } from "@/lib/kit-generator";
import { NICHE_CONFIG } from "@/lib/niche-config";

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const form = await request.json();

  // Verifica compra
  const { data: purchase } = await admin
    .from("purchases")
    .select("id, status")
    .eq("email", user.email!)
    .order("purchased_at", { ascending: false })
    .limit(1)
    .single();

  if (!purchase || (purchase.status !== "approved" && purchase.status !== "active")) {
    return NextResponse.json({ error: "Nenhuma compra aprovada encontrada." }, { status: 403 });
  }

  const services = (form.services as string).split(",").map((s: string) => s.trim()).filter(Boolean);
  const slug = `${generateSlug(form.business_name)}-${Math.random().toString(36).slice(2, 6)}`;
  const input = { ...form, services };

  const posts    = generatePosts(input);
  const captions = generateCaptions(input);
  const messages = generateWhatsAppMessages(input);
  const bio      = generateInstagramBio(input);
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "";

  // Insere negócio (admin bypassa RLS)
  const { data: business, error: bizError } = await admin
    .from("businesses")
    .insert({
      user_id: user.id,
      business_name: form.business_name,
      niche: form.niche,
      city: form.city,
      whatsapp: form.whatsapp,
      instagram: form.instagram ?? "",
      address: form.address ?? "",
      main_service: form.main_service,
      services,
      primary_color: form.primary_color,
      slug,
    })
    .select()
    .single();

  if (bizError) return NextResponse.json({ error: bizError.message }, { status: 400 });

  // Insere kit
  const { data: kit, error: kitError } = await admin
    .from("kits")
    .insert({
      user_id: user.id,
      business_id: business.id,
      purchase_id: purchase.id,
      status: "ready",
      release_stage: 1,
      purchase_approved_at: new Date().toISOString(),
      day_0_unlocked: true,
      day_3_unlocked: false,
      day_7_unlocked: false,
      site_slug: slug,
      site_url: `${appUrl}/site/${slug}`,
      posts_json: posts,
      captions_json: captions,
      whatsapp_messages_json: messages,
      instagram_bio: bio,
      kit_month: new Date().toISOString().slice(0, 7),
    })
    .select()
    .single();

  if (kitError) return NextResponse.json({ error: kitError.message }, { status: 400 });

  return NextResponse.json({ kitId: kit.id });
}
