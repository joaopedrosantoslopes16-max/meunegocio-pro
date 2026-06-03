import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditarSiteClient from "./EditarSiteClient";
import type { Business, ImageGallery } from "@/types";
import Link from "next/link";

export default async function EditarSitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: kit } = await supabase
    .from("kits")
    .select("*, businesses(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!kit?.businesses) redirect("/gerar-kit");

  const business = kit.businesses as Business;

  const { data: images } = await supabase
    .from("image_gallery")
    .select("*")
    .eq("user_id", user.id)
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm">
              ← Dashboard
            </Link>
            <span className="text-gray-200 dark:text-gray-700">/</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm">Editar mini site</span>
          </div>
          <a
            href={`/site/${kit.site_slug}`}
            target="_blank"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            🌐 Ver site →
          </a>
        </div>
      </header>

      <EditarSiteClient
        business={business}
        siteSlug={kit.site_slug}
        images={(images as ImageGallery[]) ?? []}
      />
    </div>
  );
}
