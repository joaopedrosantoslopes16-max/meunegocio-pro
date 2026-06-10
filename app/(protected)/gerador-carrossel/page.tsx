import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import GeradorCarrosselClient from "./GeradorCarrosselClient";
import type { Business } from "@/types";
import Link from "next/link";

export default async function GeradorCarrosselPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: kit } = await supabaseAdmin
    .from("kits")
    .select("*, businesses(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!kit?.businesses) redirect("/gerar-kit");

  const business = kit.businesses as Business;

  let planName: "essencial" | "pro" = "essencial";
  let isActive = false;

  try {
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan_name, status")
      .eq("email", user.email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (subscription) {
      planName = (subscription.plan_name as "essencial" | "pro") ?? "essencial";
      isActive = subscription.status === "active";
    }
  } catch {
    // assume inativo
  }

  if (!isActive || planName !== "pro") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm">
              ← Dashboard
            </Link>
            <span className="text-gray-200 dark:text-gray-700">/</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm">Gerador de Carrossel Premium</span>
          </div>
        </header>

        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl shadow-lg"
            style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
          >
            🎨
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
            Gerador de Carrossel Premium
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Crie carrosséis com visual profissional — imagem, layout, contraste, fonte e identidade visual do {business.business_name}.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            {!isActive ? "Ative sua assinatura para acessar." : "Disponível apenas no plano Pro."}
          </p>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6 text-left">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">O que você cria</p>
            <ul className="space-y-3">
              {[
                { icon: "🖼️", text: "Carrosséis com 6 slides prontos para postar" },
                { icon: "🎨", text: "7 layouts premium: cover, glass, split, lista e mais" },
                { icon: "📸", text: "Suas fotos da galeria aplicadas nos slides" },
                { icon: "🤖", text: "Texto gerado pelo nicho do seu negócio" },
                { icon: "⬇️", text: "Download em PNG slide por slide" },
                { icon: "💬", text: "Legenda e mensagem WhatsApp incluídas" },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={process.env.NEXT_PUBLIC_CHECKOUT_URL_PRO ?? process.env.NEXT_PUBLIC_CHECKOUT_URL ?? "#"}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
            >
              Fazer upgrade para o Pro
            </a>
            <Link
              href="/dashboard"
              className="w-full py-3.5 rounded-2xl font-semibold text-gray-600 dark:text-gray-400 text-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-center"
            >
              Voltar ao dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm">
              ← Dashboard
            </Link>
            <span className="text-gray-200 dark:text-gray-700">/</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm">Gerador de Carrossel Premium</span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300">
            ⭐ Pro
          </span>
        </div>
      </header>

      <GeradorCarrosselClient business={business} />
    </div>
  );
}
