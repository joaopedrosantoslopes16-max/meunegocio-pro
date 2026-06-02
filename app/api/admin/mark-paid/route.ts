import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// ROTA DE SIMULAÇÃO — apenas para testes em desenvolvimento
//
// Use para marcar um e-mail como pago sem webhook real:
//   POST /api/admin/mark-paid
//   Body: { "email": "cliente@email.com", "admin_key": "chave-de-admin" }
//
// Configure ADMIN_KEY em .env.local
// REMOVA ou PROTEJA esta rota em produção!
// ============================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const { email, admin_key } = await request.json();

    if (admin_key !== (process.env.ADMIN_KEY ?? "dev-only")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const existing = await supabase
      .from("purchases")
      .select("id")
      .eq("email", email)
      .single();

    if (existing.data) {
      await supabase
        .from("purchases")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", existing.data.id);
    } else {
      await supabase.from("purchases").insert({
        email,
        buyer_name: "Teste Dev",
        product_id: "dev-product",
        product_name: "MeuNegócio Pro",
        transaction_id: `dev-${Date.now()}`,
        platform: "dev",
        status: "approved",
        amount: 37.90,
        currency: "BRL",
        purchased_at: new Date().toISOString(),
        raw_payload: { simulated: true },
      });
    }

    return NextResponse.json({ success: true, message: `${email} marcado como pago.` });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
