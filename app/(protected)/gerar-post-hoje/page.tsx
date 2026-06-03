import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import GerarPostHojeClient from "./GerarPostHojeClient";
import type { Kit, Business, ImageGallery } from "@/types";

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function GerarPostHojePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: kit } = await admin
    .from("kits")
    .select("*, businesses(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!kit?.businesses) redirect("/gerar-kit");

  const { data: images } = await admin
    .from("image_gallery")
    .select("*")
    .eq("user_id", user.id)
    .eq("business_id", kit.businesses.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <GerarPostHojeClient
      kit={kit as Kit & { businesses: Business }}
      initialImages={(images as ImageGallery[]) ?? []}
    />
  );
}
