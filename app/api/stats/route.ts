import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cache de 5 minutos para não bater no banco a cada visita
let cached: { count: number; at: number } | null = null;
const CACHE_MS = 5 * 60 * 1000;

export async function GET() {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return NextResponse.json({ count: cached.count });
  }

  const { count } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const total = (count ?? 0) + 127; // base inicial
  cached = { count: total, at: Date.now() };

  return NextResponse.json({ count: total });
}
