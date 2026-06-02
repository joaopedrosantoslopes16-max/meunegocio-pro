import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import DashboardClient from "./DashboardClient";
import ThemeToggle from "@/components/ThemeToggle";
import type { Kit, Business, Lead, Subscription, MonthlyContent, UserExtraPackage } from "@/types";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Perfil do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Assinatura ativa (fonte de verdade para acesso e plano)
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("email", user.email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const subStatus = subscription?.status ?? null;

  // Bloqueios por status da assinatura
  if (subStatus === "refunded" || subStatus === "chargeback" || subStatus === "cancelled") {
    redirect("/acesso-bloqueado");
  }

  // Fallback: verifica compra antiga (compatibilidade com clientes sem subscription ainda)
  const { data: purchase } = await supabaseAdmin
    .from("purchases")
    .select("id, status")
    .eq("email", user.email)
    .order("purchased_at", { ascending: false })
    .limit(1)
    .single();

  if (!subscription && purchase) {
    const ps = purchase.status;
    if (ps === "refunded" || ps === "chargeback" || ps === "cancelled") {
      redirect("/acesso-bloqueado");
    }
  }

  // Kit mais recente
  const { data: kitRaw } = await supabase
    .from("kits")
    .select("*, businesses(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!kitRaw) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg text-gradient">MeuNegócio Pro</Link>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-sm text-gray-500 hover:text-red-500">Sair</button>
            </form>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Bem-vindo ao MeuNegócio Pro!</h1>
          <p className="text-gray-500 mb-8">Você ainda não configurou seu negócio. Preencha os dados para começar.</p>
          <Link href="/gerar-kit" className="inline-block gradient-brand text-white font-bold py-4 px-8 rounded-2xl hover:opacity-90 transition shadow-lg">
            🚀 Configurar meu negócio
          </Link>
        </div>
      </div>
    );
  }

  const kit = kitRaw as Kit & { businesses: Business };

  // Conteúdo do mês atual
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { data: monthlyContent } = await supabaseAdmin
    .from("monthly_content")
    .select("*")
    .eq("user_id", user.id)
    .eq("business_id", kit.businesses.id)
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .single();

  // Pacotes extras ativos do usuário
  const { data: extraPackages } = await supabaseAdmin
    .from("user_extra_packages")
    .select("*")
    .eq("email", user.email)
    .eq("status", "active")
    .order("purchased_at", { ascending: false });

  // Leads do mini site
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("business_id", kit.businesses.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Log de visita
  await supabase.from("access_logs").insert({
    user_id: user.id,
    kit_id: kit.id,
    purchase_id: purchase?.id ?? null,
    action: "view_kit",
    metadata: {},
  }).then(() => {});

  const displayName =
    profile?.name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Cliente";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-gradient">MeuNegócio Pro</Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-sm text-gray-500 hover:text-red-500 transition">Sair</button>
            </form>
          </div>
        </div>
      </header>

      <DashboardClient
        kit={kit}
        leads={(leads as Lead[]) ?? []}
        subscription={(subscription as Subscription) ?? null}
        monthlyContent={(monthlyContent as MonthlyContent) ?? null}
        extraPackages={(extraPackages as UserExtraPackage[]) ?? []}
        displayName={displayName}
        userEmail={user.email ?? ""}
      />
    </div>
  );
}
