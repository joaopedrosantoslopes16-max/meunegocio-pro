import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SiteBody from "./SiteBody";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("businesses").select("business_name,city,niche,main_service").eq("slug", slug).single();
  if (!data) return { title: "Negócio não encontrado" };
  return {
    title: `${data.business_name} — ${data.city}`,
    description: `${data.niche} em ${data.city}. ${data.main_service}. Fale pelo WhatsApp.`,
    openGraph: { title: data.business_name, description: `${data.main_service} em ${data.city}` },
  };
}

export default async function MiniSitePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase.from("businesses").select("*").eq("slug", slug).single();
  if (!business) notFound();

  const { data: kit } = await supabase.from("kits").select("id").eq("site_slug", slug).single();

  return <SiteBody business={business} kitId={kit?.id} />;
}
