"use client";

import { useState } from "react";
import Link from "next/link";
import { TODAY_GOALS, generateTodayPost } from "@/lib/today-post-generator";
import PostCard from "@/components/PostCard";
import PostEditor from "@/components/PostEditor";
import type { TodayPostGoal, TodayPost, Kit, Business, ImageGallery } from "@/types";

interface Props {
  kit: Kit & { businesses: Business };
  initialImages: ImageGallery[];
}

export default function GerarPostHojeClient({ kit, initialImages }: Props) {
  const [selectedGoal, setSelectedGoal] = useState<TodayPostGoal | null>(null);
  const [result,        setResult]       = useState<TodayPost | null>(null);
  const images                           = initialImages;
  const [copied,        setCopied]       = useState<string | null>(null);
  const [editingPost,   setEditingPost]  = useState(false);

  function handleSelectGoal(goal: TodayPostGoal) {
    setSelectedGoal(goal);
    const post = generateTodayPost(goal, {
      business_name: kit.businesses.business_name,
      niche:         kit.businesses.niche,
      city:          kit.businesses.city,
      main_service:  kit.businesses.main_service,
    });
    setResult(post);
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function reset() {
    setSelectedGoal(null);
    setResult(null);
    setEditingPost(false);
  }

  const business     = kit.businesses;
  const primaryColor = business.primary_color ?? "#6366f1";

  return (
    <>
      {/* Post Editor Modal */}
      {editingPost && result && (
        <PostEditor
          initialTitle={result.post_title}
          initialSubtitle={result.post_subtitle}
          initialCta={result.post_cta}
          initialTemplate={result.template_type as any}
          business={business}
          images={images}
          onSave={() => setEditingPost(false)}
          onClose={() => setEditingPost(false)}
        />
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/dashboard" className="font-bold text-lg text-gradient">MeuNegócio Pro</Link>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition">← Dashboard</Link>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              ✨ Gerar post de hoje
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Qual é o objetivo de hoje?</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{business.business_name} · {business.city}</p>
          </div>

          {/* STEP 1 — Escolher objetivo */}
          {!result && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TODAY_GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleSelectGoal(goal.id)}
                  className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-800 p-4 text-center hover:border-violet-300 hover:shadow-md transition group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition">{goal.emoji}</div>
                  <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{goal.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-tight">{goal.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2 — Resultado */}
          {result && (
            <div className="space-y-5">
              {/* Header do objetivo */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{TODAY_GOALS.find((g) => g.id === selectedGoal)?.emoji}</span>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Objetivo</p>
                  <p className="font-bold text-gray-900 dark:text-white">{TODAY_GOALS.find((g) => g.id === selectedGoal)?.label}</p>
                </div>
              </div>

              {/* Post visual */}
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between px-4 pt-3 pb-2 bg-white dark:bg-gray-900">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Post — Instagram</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPost(true)}
                      className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 px-3 py-1 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900 transition"
                    >
                      ✏️ Editar post
                    </button>
                  </div>
                </div>
                <div className="max-w-sm mx-auto">
                  <PostCard
                    template_type={result.template_type}
                    title={result.post_title}
                    subtitle={result.post_subtitle}
                    cta={result.post_cta}
                    business_name={business.business_name}
                    primary_color={primaryColor}
                    niche={business.niche}
                    city={business.city}
                  />
                </div>
              </div>

              {/* Botões de ação do post */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button onClick={() => setEditingPost(true)} className="flex flex-col items-center gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:border-violet-200 transition">
                  <span>✏️</span>
                  Editar post
                </button>
                <button
                  onClick={() => {
                    if (images.length > 0) setEditingPost(true);
                    else window.open("/galeria", "_self");
                  }}
                  className="flex flex-col items-center gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:border-violet-200 transition"
                >
                  <span>🖼️</span>
                  Imagem fundo
                </button>
                <button onClick={() => copy(result.caption, "cap")} className="flex flex-col items-center gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:border-violet-200 transition">
                  <span>{copied === "cap" ? "✅" : "📋"}</span>
                  {copied === "cap" ? "Copiado!" : "Copiar legenda"}
                </button>
                <button onClick={() => copy(result.whatsapp_message, "wa")} className="flex flex-col items-center gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:border-green-200 transition">
                  <span>{copied === "wa" ? "✅" : "💬"}</span>
                  {copied === "wa" ? "Copiado!" : "Copiar WA"}
                </button>
              </div>

              {/* Legenda */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><span>📸</span><p className="font-bold text-gray-800 dark:text-gray-200 text-sm">Legenda para Instagram</p></div>
                  <button onClick={() => copy(result.caption, "cap2")} className="text-violet-600 text-sm font-semibold hover:underline">{copied === "cap2" ? "✅ Copiado!" : "Copiar"}</button>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 rounded-xl p-4 whitespace-pre-wrap">{result.caption}</p>
              </div>

              {/* WhatsApp */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-green-100 dark:border-green-900 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><span>💬</span><p className="font-bold text-gray-800 dark:text-gray-200 text-sm">Mensagem para WhatsApp</p></div>
                  <button onClick={() => copy(result.whatsapp_message, "wa2")} className="text-green-600 text-sm font-semibold hover:underline">{copied === "wa2" ? "✅ Copiado!" : "Copiar"}</button>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-green-50 dark:bg-green-950 rounded-xl p-4 whitespace-pre-wrap">{result.whatsapp_message}</p>
              </div>

              {/* Link rápido para gerador magnético */}
              <div className="bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-900 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-violet-800 dark:text-violet-300">Quer algo mais completo?</p>
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">Use o Gerador Magnético para Reels, carrosséis e Stories</p>
                </div>
                <Link href="/gerador-magnetico" className="text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900 px-3 py-2 rounded-xl hover:bg-violet-200 dark:hover:bg-violet-800 transition flex-shrink-0 ml-3">
                  ✨ Abrir →
                </Link>
              </div>

              {/* Ações finais */}
              <div className="flex gap-3 flex-wrap">
                <button onClick={reset} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm">
                  ← Gerar outro objetivo
                </button>
                <Link href="/dashboard" className="flex-1 gradient-brand text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition text-sm text-center">
                  Voltar ao dashboard
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
