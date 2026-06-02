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

    const { data: purchase } = await supabase
      .from("purchases")
      .select("id, status, email")
      .eq("email", email.toLowerCase().trim())
      .order("purchased_at", { ascending: false })
      .limit(1)
      .single();

    if (!purchase) {
      return NextResponse.json({ approved: false, status: null, purchase_id: null });
    }

    const approved = purchase.status === "approved" || purchase.status === "active";

    return NextResponse.json({
      approved,
      status: purchase.status,
      purchase_id: purchase.id,
    });
  } catch (err) {
    console.error("[check-purchase] Error:", err);
    return NextResponse.json({ approved: false, status: null, purchase_id: null });
  }
}
