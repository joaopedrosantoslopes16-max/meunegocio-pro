import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { business_id, kit_id, name, whatsapp, interest } = await request.json();

    if (!business_id || !name || !whatsapp) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const { error } = await supabase.from("leads").insert({
      business_id,
      kit_id: kit_id ?? null,
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      interest: interest?.trim() ?? null,
    });

    if (error) {
      console.error("[leads] DB error:", error);
      return NextResponse.json({ error: "Erro ao salvar lead" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[leads] Error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
