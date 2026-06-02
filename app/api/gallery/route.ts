import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ImageType } from "@/types";

const BUCKET = "business-gallery";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const business_id = searchParams.get("business_id");

  const query = supabase
    .from("image_gallery")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (business_id) query.eq("business_id", business_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ images: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const business_id = formData.get("business_id") as string | null;
  const image_type = (formData.get("image_type") as ImageType) ?? "general";

  if (!file || !business_id) {
    return NextResponse.json({ error: "file e business_id são obrigatórios." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Imagem muito grande. Máximo 5MB." }, { status: 400 });
  }

  // Verificar que o negócio pertence ao usuário
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", business_id)
    .eq("user_id", user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Negócio não encontrado." }, { status: 404 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const storagePath = `${user.id}/${business_id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: `Erro no upload: ${uploadError.message}` }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  const { data: record, error: insertError } = await supabase
    .from("image_gallery")
    .insert({
      user_id: user.id,
      business_id,
      image_url: publicUrl.publicUrl,
      storage_path: storagePath,
      image_type,
      file_name: file.name,
      file_size: file.size,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ image: record });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const { id, is_favorite, image_type, used_for } = body;

  if (!id) return NextResponse.json({ error: "id obrigatório." }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (is_favorite !== undefined) update.is_favorite = is_favorite;
  if (image_type !== undefined) update.image_type = image_type;
  if (used_for !== undefined) update.used_for = used_for;

  const { data, error } = await supabase
    .from("image_gallery")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ image: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório." }, { status: 400 });

  const { data: record } = await supabase
    .from("image_gallery")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (record?.storage_path) {
    await supabase.storage.from(BUCKET).remove([record.storage_path]);
  }

  const { error } = await supabase
    .from("image_gallery")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
