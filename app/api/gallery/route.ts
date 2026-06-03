import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { ImageType } from "@/types";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "business-gallery";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function resolveUser(req: NextRequest, supabase: Awaited<ReturnType<typeof createClient>>) {
  // Tenta Bearer token primeiro (mais confiável de client components)
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data } = await supabase.auth.getUser(token);
    if (data.user) return data.user;
  }
  // Fallback: cookie session
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const user = await resolveUser(req, supabase);
  if (!user) return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const business_id = searchParams.get("business_id");

  let query = supabase
    .from("image_gallery")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (business_id) query = query.eq("business_id", business_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ images: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const user = await resolveUser(req, supabase);
  if (!user) return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const business_id = formData.get("business_id") as string | null;
  const image_type = (formData.get("image_type") as ImageType) ?? "general";

  if (!file || !business_id) {
    return NextResponse.json({ error: "Arquivo e negócio são obrigatórios." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Imagem muito grande. Máximo 5MB por imagem." }, { status: 400 });
  }

  // Aceitar apenas imagens
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Apenas imagens são aceitas (JPG, PNG, WEBP)." }, { status: 400 });
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

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const storagePath = `${user.id}/${business_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    // Bucket não existe ainda
    if (uploadError.message?.includes("Bucket not found") || uploadError.message?.includes("bucket")) {
      return NextResponse.json({
        error: 'O bucket de imagens ainda não foi criado. Acesse o Supabase Storage e crie o bucket "business-gallery" como público.',
      }, { status: 500 });
    }
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
    // Limpar arquivo do storage se insert falhar
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ image: record });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const user = await resolveUser(req, supabase);
  if (!user) return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });

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
  const user = await resolveUser(req, supabase);
  if (!user) return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });

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
