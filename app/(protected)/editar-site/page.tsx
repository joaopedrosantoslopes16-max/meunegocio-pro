import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import EditarSiteClient from "./EditarSiteClient";
import type { Business, ImageGallery, PlanName } from "@/types";
import Link from "next/link";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function EditarSitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: kit } = await supabaseAdmin
    .from("kits")
    .select("*, businesses(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!kit?.businesses) redirect("/gerar-kit");

  const business = kit.businesses as Business;

  // Plano do usuário
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("plan_name")
    .eq("email", user.email ?? "")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const plan: PlanName = (subscription?.plan_name as PlanName) ?? "essencial";

  const { data: images } = await supabaseAdmin
    .from("image_gallery")
    .select("*")
    .eq("user_id", user.id)
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm flex-shrink-0">
              ← Dashboard
            </Link>
            <span className="text-gray-200 dark:text-gray-700 flex-shrink-0">/</span>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 dark:text-white text-sm leading-none">Editar mini site</p>
              <p className="text-gray-400 text-xs truncate">{business.business_name} · /site/{kit.site_slug}</p>
            </div>
            <span className={`flex-shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${plan === "pro" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
              {plan === "pro" ? "⭐ Pro" : "Essencial"}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={`/site/${kit.site_slug}`}
              target="_blank"
              className="text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-400 hover:text-violet-600 transition"
            >
              Ver site →
            </a>
          </div>
        </div>
      </header>

      <EditarSiteClient
        business={business}
        siteSlug={kit.site_slug}
        images={(images as ImageGallery[]) ?? []}
        plan={plan}
      />
    </div>
  );
}
