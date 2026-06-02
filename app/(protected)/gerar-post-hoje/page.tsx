"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TODAY_GOALS, generateTodayPost } from "@/lib/today-post-generator";
import type { TodayPostGoal, TodayPost, Kit, Business } from "@/types";

export default function GerarPostHojePage() {
  const [selectedGoal, setSelectedGoal] = useState<TodayPostGoal | null>(null);
  const [result, setResult] = useState<TodayPost | null>(null);
  const [kit, setKit] = useState<(Kit & { businesses: Business }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function loadKit() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("kits")
        .select("*, businesses(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      setKit(data);
      setLoading(false);
    }
    loadKit();
  }, []);

  function handleSelectGoal(goal: TodayPostGoal) {
    if (!kit) return;
    setSelectedGoal(goal);
    const post = generateTodayPost(goal, {
      business_name: kit.businesses.business_name,
      niche: kit.businesses.niche,
      city: kit.businesses.city,
      main_service: kit.businesses.main_service,
    });
    setResult(post);

    // Log
    const supabase = createClient();
    supabase.from("access_logs").insert({
      user_id: kit.user_id,
      kit_id: kit.id,
      purchase_id: kit.purchase_id,
      action: "generate_today_post",
      metadata: { goal },
    });
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function reset() {
    setSelectedGoal(null);
    setResult(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Carregando...</div>
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Você precisa gerar um kit primeiro.</p>
          <Link href="/gerar-kit" className="gradient-brand text-white font-bold py-3 px-6 rounded-xl inline-block">
            Gerar kit
          </Link>
        </div>
      </div>
    );
  }

  const business = kit.businesses;
  const primaryColor = business.primary_color ?? "#6366f1";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-bold text-lg text-gradient">MeuNegócio Pro</Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-indigo-600 transition">← Dashboard</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">✨ Gerar post de hoje</h1>
          <p className="text-gray-500">Qual é o objetivo do post de hoje?</p>
          <p className="text-sm text-gray-400 mt-1">{business.business_name} • {business.city}</p>
        </div>

        {/* STEP 1 — ESCOLHER OBJETIVO */}
        {!result && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TODAY_GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleSelectGoal(goal.id)}
                className="bg-white rounded-2xl border-2 border-gray-100 p-4 text-center hover:border-indigo-300 hover:shadow-md transition group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition">{goal.emoji}</div>
                <p className="font-bold text-gray-800 text-sm">{goal.label}</p>
                <p className="text-xs text-gray-400 mt-1 leading-tight">{goal.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2 — VER RESULTADO */}
        {result && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{TODAY_GOALS.find((g) => g.id === selectedGoal)?.emoji}</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Objetivo</p>
                <p className="font-bold text-gray-900">{TODAY_GOALS.find((g) => g.id === selectedGoal)?.label}</p>
              </div>
            </div>

            {/* POST VISUAL */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-400 px-4 pt-3 pb-1 font-medium uppercase tracking-wide bg-white">Post — Instagram</div>
              <div
                className="aspect-square flex flex-col items-center justify-center p-8 text-white"
                style={{ background: `linear-gradient(135deg, ${primaryColor}ee, ${primaryColor}77)` }}
              >
                <p className="text-xs uppercase tracking-widest opacity-70 mb-3">{business.niche}</p>
                <h2 className="text-2xl font-extrabold text-center leading-tight mb-2">{result.post_title}</h2>
                <p className="text-sm opacity-90 text-center mb-4">{result.post_subtitle}</p>
                <div className="bg-white/20 backdrop-blur px-5 py-2 rounded-full text-sm font-bold">{result.post_cta}</div>
                <p className="absolute opacity-50 text-xs bottom-4">{business.business_name}</p>
              </div>
            </div>

            {/* LEGENDA */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>📸</span>
                  <p className="font-bold text-gray-800 text-sm">Legenda</p>
                </div>
                <button onClick={() => copy(result.caption, "caption")} className="text-indigo-600 text-sm font-semibold hover:underline">
                  {copied === "caption" ? "✅ Copiado!" : "Copiar"}
                </button>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">{result.caption}</p>
            </div>

            {/* MENSAGEM WHATSAPP */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>💬</span>
                  <p className="font-bold text-gray-800 text-sm">Mensagem para WhatsApp</p>
                </div>
                <button onClick={() => copy(result.whatsapp_message, "wa")} className="text-green-600 text-sm font-semibold hover:underline">
                  {copied === "wa" ? "✅ Copiado!" : "Copiar"}
                </button>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">{result.whatsapp_message}</p>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={reset}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition text-sm"
              >
                ← Gerar outro objetivo
              </button>
              <Link
                href="/dashboard"
                className="flex-1 gradient-brand text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition text-sm text-center"
              >
                Voltar ao dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
