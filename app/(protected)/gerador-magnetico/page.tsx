import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import GeradorMagneticoClient from "./GeradorMagneticoClient";
import type { Business, Subscription } from "@/types";
import Link from "next/link";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function GeradorMagneticoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("plan_name, status")
    .eq("email", user.email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!subscription || subscription.status !== "active") {
    redirect("/dashboard");
  }

  const { data: kit } = await supabase
    .from("kits")
    .select("*, businesses(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!kit?.businesses) {
    redirect("/gerar-kit");
  }

  const business = kit.businesses as Business;
  const planName = subscription.plan_name ?? "essencial";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm">
              ← Dashboard
            </Link>
            <span className="text-gray-200 dark:text-gray-700">/</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm">Gerador de Conteúdos</span>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${planName === "pro" ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-500"}`}>
            {planName === "pro" ? "⭐ Pro" : "Essencial"}
          </span>
        </div>
      </header>

      <GeradorMagneticoClient
        business={business}
        planName={planName as "essencial" | "pro"}
      />
    </div>
  );
}
