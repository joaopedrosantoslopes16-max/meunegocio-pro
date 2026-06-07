import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import SiteBody from "./SiteBody";

export const dynamic = "force-dynamic";

// Cliente admin para leitura pública — site é acessível por qualquer visitante
const supabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabase.from("businesses").select("business_name,city,niche,main_service").eq("slug", slug).maybeSingle();
  if (!data) return { title: "Negócio não encontrado" };
  return {
    title: `${data.business_name} — ${data.city}`,
    description: `${data.niche} em ${data.city}. ${data.main_service}. Fale pelo WhatsApp.`,
    openGraph: { title: data.business_name, description: `${data.main_service} em ${data.city}` },
  };
}

export default async function MiniSitePage({ params }: Props) {
  const { slug } = await params;

  const { data: business } = await supabase.from("businesses").select("*").eq("slug", slug).maybeSingle();
  if (!business) notFound();

  const { data: kit } = await supabase.from("kits").select("id").eq("site_slug", slug).maybeSingle();

  return <SiteBody business={business} kitId={kit?.id} />;
}
