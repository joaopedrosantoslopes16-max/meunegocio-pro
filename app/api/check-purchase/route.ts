import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ approved: false, status: null, purchase_id: null });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verifica na tabela purchases
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id, status, email")
      .eq("email", normalizedEmail)
      .order("purchased_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (purchase) {
      const approved = purchase.status === "approved" || purchase.status === "active";
      return NextResponse.json({ approved, status: purchase.status, purchase_id: purchase.id });
    }

    // Fallback: verifica na tabela subscriptions
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, status, email")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscription) {
      const approved = subscription.status === "active" || subscription.status === "approved";
      return NextResponse.json({ approved, status: subscription.status, purchase_id: subscription.id });
    }

    return NextResponse.json({ approved: false, status: null, purchase_id: null });
  } catch (err) {
    console.error("[check-purchase] Error:", err);
    return NextResponse.json({ approved: false, status: null, purchase_id: null });
  }
}
