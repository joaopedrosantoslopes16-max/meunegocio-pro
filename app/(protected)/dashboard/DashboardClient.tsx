"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { generateCalendar } from "@/lib/calendar-generator";
import { generateCampaigns } from "@/lib/campaign-generator";
import { generateRecoveryMessages } from "@/lib/recovery-messages";
import { buildWhatsAppLink } from "@/lib/whatsapp-utils";
import type { Kit, Business, Lead, Subscription, MonthlyContent, UserExtraPackage, Post, VisualStyle } from "@/types";

type TabId = "inicio" | "calendario" | "campanhas" | "posts" | "mensagens" | "leads" | "extras" | "aparencia";

const VISUAL_STYLES: { id: VisualStyle; label: string; desc: string }[] = [
  { id: "moderno",     label: "Moderno",     desc: "Limpo e contemporâneo" },
  { id: "elegante",    label: "Elegante",    desc: "Sofisticado e refinado" },
  { id: "clean",       label: "Clean",       desc: "Simples e minimalista" },
  { id: "chamativo",   label: "Chamativo",   desc: "Colorido e vibrante" },
  { id: "minimalista", label: "Minimalista", desc: "Só o essencial" },
];

const COLOR_PRESETS = [
  { label: "Índigo",   value: "#6366f1" },
  { label: "Roxo",     value: "#9333ea" },
  { label: "Azul",     value: "#2563eb" },
  { label: "Verde",    value: "#16a34a" },
  { label: "Vermelho", value: "#dc2626" },
  { label: "Preto",    value: "#111827" },
  { label: "Dourado",  value: "#d97706" },
  { label: "Rosa",     value: "#db2777" },
];

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const PLAN_LABELS: Record<string, string> = {
  essencial: "Essencial",
  pro:       "Pro",
};

interface DashboardClientProps {
  kit:            Kit & { businesses: Business };
  leads:          Lead[];
  subscription:   Subscription | null;
  monthlyContent: MonthlyContent | null;
  extraPackages:  UserExtraPackage[];
  displayName:    string;
  userEmail:      string;
}

export default function DashboardClient({
  kit,
  leads,
  subscription,
  monthlyContent,
  extraPackages,
  displayName,
  userEmail,
}: DashboardClientProps) {
  const [activeTab, setActiveTab]           = useState<TabId>("inicio");
  const [copied, setCopied]                 = useState<string | null>(null);
  const [savingAppearance, setSavingAppearance] = useState(false);
  const [appearanceSaved, setAppearanceSaved]   = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [contentGenerated, setContentGenerated]   = useState(false);
  const [contentError, setContentError]           = useState<string | null>(null);
  const [localMonthlyContent, setLocalMonthlyContent] = useState<MonthlyContent | null>(monthlyContent);

  const [primaryColor, setPrimaryColor]   = useState(kit.businesses.primary_color ?? "#6366f1");
  const [selectedStyle, setSelectedStyle] = useState<VisualStyle>(
    (kit.businesses.visual_style as VisualStyle) ?? "moderno"
  );

  const business = kit.businesses;
  const siteUrl  = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/site/${kit.site_slug}`;

  // Status da assinatura
  const subStatus  = subscription?.status ?? null;
  const isActive   = subStatus === "active";
  const isPending  = subStatus === "pending" || !subscription;
  const isBlocked  = subStatus === "cancelled" || subStatus === "refunded" || subStatus === "chargeback";
  const isPastDue  = subStatus === "past_due";
  const planName   = subscription?.plan_name ?? "essencial";
  const planLabel  = PLAN_LABELS[planName] ?? "Essencial";

  // Mês atual
  const now          = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear  = now.getFullYear();
  const monthLabel   = MONTH_NAMES[currentMonth - 1];

  // Conteúdo mensal
  const hasMonthlyContent = !!localMonthlyContent?.generated_at;
  const monthlyPosts      = (localMonthlyContent?.posts_json    as Post[]   ) ?? [];
  const monthlyCaptions   = (localMonthlyContent?.captions_json as string[] ) ?? [];
  const monthlyMessages   = (localMonthlyContent?.messages_json as string[] ) ?? [];

  // Soma plano base + pacotes extras ativos
  const basePostsLimit    = localMonthlyContent?.posts_limit    ?? (planName === "pro" ? 15 : 5);
  const baseCaptionsLimit = localMonthlyContent?.captions_limit ?? (planName === "pro" ? 15 : 5);
  const baseMessagesLimit = localMonthlyContent?.messages_limit ?? (planName === "pro" ? 15 : 5);

  const activeExtras = extraPackages.filter((p) => p.status === "active");
  const extraPosts    = activeExtras.reduce((sum, p) => sum + p.posts_added,    0);
  const extraCaptions = activeExtras.reduce((sum, p) => sum + p.captions_added, 0);
  const extraMessages = activeExtras.reduce((sum, p) => sum + p.messages_added, 0);
  const extraStories  = activeExtras.reduce((sum, p) => sum + p.stories_added,  0);

  const postsLimit    = basePostsLimit    + extraPosts;
  const captionsLimit = baseCaptionsLimit + extraCaptions;
  const messagesLimit = baseMessagesLimit + extraMessages;

  const hasInstagramExtra = activeExtras.some((p) => p.package_slug === "instagram-extra");
  const hasStories        = activeExtras.some((p) => p.package_slug === "stories");
  const hasReativacao     = activeExtras.some((p) => p.package_slug === "reativacao");

  // Calendário, campanhas e mensagens de recuperação (gerados localmente para as abas)
  const calendar = generateCalendar({
    niche: business.niche, business_name: business.business_name,
    city: business.city,   main_service: business.main_service,
  });
  const campaigns = generateCampaigns({
    business_name: business.business_name, niche: business.niche,
    city: business.city,                   main_service: business.main_service,
  });
  const recoveryMessages = generateRecoveryMessages({
    business_name: business.business_name, niche: business.niche,
    main_service: business.main_service,   city: business.city,
  });

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function saveAppearance() {
    setSavingAppearance(true);
    const supabase = createClient();
    await supabase
      .from("businesses")
      .update({ primary_color: primaryColor, visual_style: selectedStyle })
      .eq("id", business.id);
    setSavingAppearance(false);
    setAppearanceSaved(true);
    setTimeout(() => setAppearanceSaved(false), 3000);
  }

  async function generateMonthlyContent() {
    setGeneratingContent(true);
    setContentError(null);
    try {
      const res = await fetch("/api/monthly-content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: business.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setContentError(json.error ?? "Erro ao gerar conteúdo.");
      } else {
        setContentGenerated(true);
        // Recarrega a página para buscar o monthly_content salvo
        window.location.reload();
      }
    } catch {
      setContentError("Erro de conexão. Tente novamente.");
    } finally {
      setGeneratingContent(false);
    }
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "inicio",    label: "Início" },
    { id: "calendario", label: "Calendário" },
    { id: "campanhas", label: "Campanhas" },
    { id: "posts",     label: `Posts (${monthlyPosts.length}/${postsLimit})` },
    { id: "mensagens", label: "Mensagens" },
    { id: "extras",    label: `Extras${activeExtras.length > 0 ? ` (${activeExtras.length})` : ""}` },
    { id: "leads",     label: `Leads (${leads.length})` },
    { id: "aparencia", label: "Aparência" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá, {displayName}!</h1>
          <p className="text-gray-500 text-sm mt-1">
            Seu marketing está salvo aqui. Copie links, baixe posts e gere novos conteúdos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${
            isActive   ? "bg-green-100 text-green-700"  :
            isPastDue  ? "bg-yellow-100 text-yellow-700" :
            isBlocked  ? "bg-red-100 text-red-700"      :
                         "bg-gray-100 text-gray-500"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {isActive  ? `Plano ${planLabel} ativo` :
             isPastDue ? "Pagamento pendente"        :
             isBlocked ? "Assinatura inativa"        :
                         "Aguardando confirmação"}
          </span>
        </div>
      </div>

      {/* AVISOS DE STATUS */}
      {isPastDue && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between flex-wrap gap-3">
          <p className="text-yellow-800 text-sm font-medium">
            ⚠️ Há um problema com seu pagamento. Regularize para continuar gerando conteúdos.
          </p>
          <a href={process.env.NEXT_PUBLIC_CHECKOUT_URL ?? "#"} className="text-sm font-bold text-yellow-700 underline">
            Regularizar assinatura →
          </a>
        </div>
      )}

      {isPending && !isActive && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 mb-6">
          <p className="text-blue-800 text-sm font-medium">
            ⏳ Sua assinatura ainda está aguardando confirmação de pagamento. Assim que for confirmada, todos os recursos serão liberados automaticamente.
          </p>
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ====================== INÍCIO ====================== */}
      {activeTab === "inicio" && (
        <div className="space-y-6">

          {/* ÁREA 1 — MEU MINI SITE */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 font-semibold">Meu mini site</p>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{business.business_name}</h2>
                <p className="text-sm text-gray-500">{business.niche} • {business.city}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {isActive ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-green-600 font-semibold">Online</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="text-sm text-gray-500 font-semibold">Pausado</span>
                  </>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-2.5 font-mono text-sm text-gray-600 truncate mb-3">{siteUrl}</div>
            <div className="flex gap-2 flex-wrap">
              <a
                href={`/site/${kit.site_slug}`}
                target="_blank"
                className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-indigo-100 transition"
              >
                🌐 Abrir site
              </a>
              <button
                onClick={() => copy(siteUrl, "site")}
                className="flex items-center gap-1.5 bg-gray-100 text-gray-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-gray-200 transition"
              >
                {copied === "site" ? "✅ Copiado!" : "📋 Copiar link"}
              </button>
              <a
                href={buildWhatsAppLink(business.whatsapp, `Estou enviando o link do meu site: ${siteUrl}`)}
                target="_blank"
                className="flex items-center gap-1.5 bg-green-50 text-green-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-green-100 transition"
              >
                💬 Compartilhar no WhatsApp
              </a>
              <button
                onClick={() => setActiveTab("aparencia")}
                className="flex items-center gap-1.5 bg-gray-50 text-gray-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-gray-100 transition border border-gray-200"
              >
                🎨 Editar aparência
              </button>
            </div>
          </div>

          {/* ÁREA 2 — CONTEÚDOS DO MÊS */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-semibold">Conteúdos do mês</p>
                <h2 className="text-lg font-bold text-gray-900">{monthLabel} {currentYear}</h2>
                <p className="text-sm text-gray-500">
                  Plano {planLabel} · {postsLimit} posts · {captionsLimit} legendas · {messagesLimit} mensagens
                </p>
              </div>
              {hasMonthlyContent && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-700">
                  ✅ Gerado
                </span>
              )}
            </div>

            {/* Texto explicativo */}
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Seu mini site fica ativo enquanto sua assinatura estiver ativa. Todos os meses, após a confirmação da cobrança, você recebe novos conteúdos para divulgar seu negócio.
            </p>

            {/* Métricas de uso */}
            {hasMonthlyContent && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Posts",    used: monthlyPosts.length,    total: postsLimit },
                  { label: "Legendas", used: monthlyCaptions.length, total: captionsLimit },
                  { label: "Mensagens WA", used: monthlyMessages.length, total: messagesLimit },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-extrabold text-gray-900">{item.used}<span className="text-sm font-normal text-gray-400">/{item.total}</span></p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Botão de geração */}
            {!isActive ? (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Ative sua assinatura para gerar conteúdos mensais.</p>
              </div>
            ) : hasMonthlyContent ? (
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveTab("posts")}
                    className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-indigo-100 transition"
                  >
                    📸 Ver posts
                  </button>
                  <button
                    onClick={() => setActiveTab("mensagens")}
                    className="flex items-center gap-1.5 bg-green-50 text-green-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-green-100 transition"
                  >
                    💬 Ver mensagens
                  </button>
                  {planName === "pro" && (
                    <button
                      onClick={() => setActiveTab("campanhas")}
                      className="flex items-center gap-1.5 bg-purple-50 text-purple-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-purple-100 transition"
                    >
                      🚀 Ver campanhas
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Próximo pacote disponível após a confirmação do pagamento do mês seguinte.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {contentError && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{contentError}</p>
                )}
                <button
                  onClick={generateMonthlyContent}
                  disabled={generatingContent}
                  className="w-full gradient-brand text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-60 text-sm"
                >
                  {generatingContent
                    ? "Gerando seus conteúdos..."
                    : `✨ Gerar conteúdos de ${monthLabel}`}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Você tem {postsLimit} posts, {captionsLimit} legendas e {messagesLimit} mensagens disponíveis neste mês.
                </p>
              </div>
            )}
          </div>

          {/* GERAR POST DE HOJE (plano Pro) */}
          {planName === "pro" && (
            <Link
              href="/gerar-post-hoje"
              className="block gradient-brand text-white rounded-2xl p-6 hover:opacity-90 transition shadow-lg shadow-indigo-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">Não sabe o que postar hoje?</p>
                  <h2 className="text-2xl font-extrabold">✨ Gerar post de hoje</h2>
                  <p className="text-white/80 text-sm mt-1">Escolha o objetivo e receba post + legenda + mensagem prontos</p>
                </div>
                <div className="text-5xl opacity-80">→</div>
              </div>
            </Link>
          )}

          {/* LEADS RESUMO */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">🎯 Leads recebidos pelo site</h2>
              <button onClick={() => setActiveTab("leads")} className="text-indigo-600 text-sm font-semibold hover:underline">
                Ver todos ({leads.length})
              </button>
            </div>
            {leads.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum lead ainda. Compartilhe o link do seu site para receber contatos!</p>
            ) : (
              <div className="space-y-2">
                {leads.slice(0, 3).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{lead.name}</p>
                      {lead.interest && <p className="text-xs text-gray-500">Interesse: {lead.interest}</p>}
                    </div>
                    <a
                      href={buildWhatsAppLink(lead.whatsapp, `Olá ${lead.name}! Vi que você se cadastrou no nosso site. Como posso te ajudar?`)}
                      target="_blank"
                      className="text-xs font-bold text-green-600 hover:underline"
                    >
                      💬 Chamar
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================== CALENDÁRIO ====================== */}
      {activeTab === "calendario" && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Calendário do mês</h2>
            <p className="text-gray-500 text-sm mt-1">O que postar e quando — adaptado para {business.niche}.</p>
          </div>
          {[1, 2, 3, 4].map((week) => (
            <div key={week} className="mb-6">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-3">Semana {week}</h3>
              <div className="space-y-3">
                {calendar.filter((e) => e.week === week).map((entry, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
                    <div className="w-20 flex-shrink-0 text-center">
                      <p className="text-xs font-bold text-gray-400 uppercase">{entry.day}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">{entry.post_type}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 mb-1">{entry.topic}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{entry.caption_snippet}</p>
                    </div>
                    <button
                      onClick={() => copy(entry.caption_snippet, `cal-${week}-${i}`)}
                      className="flex-shrink-0 text-indigo-600 text-xs font-semibold hover:underline self-start"
                    >
                      {copied === `cal-${week}-${i}` ? "✅" : "Copiar"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ====================== CAMPANHAS ====================== */}
      {activeTab === "campanhas" && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Campanhas prontas</h2>
            <p className="text-gray-500 text-sm mt-1">Use quando quiser movimentar o Instagram e o WhatsApp.</p>
          </div>
          {planName !== "pro" ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-bold text-gray-700 mb-2">Disponível no plano Pro</h3>
              <p className="text-sm text-gray-500 mb-4">Campanhas prontas fazem parte do plano Pro (R$ 57/mês).</p>
              <a
                href={process.env.NEXT_PUBLIC_CHECKOUT_URL_PRO ?? "#"}
                className="inline-block gradient-brand text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:opacity-90 transition"
              >
                Fazer upgrade para Pro →
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{campaign.emoji}</span>
                    <h3 className="font-bold text-gray-900">{campaign.name}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Post</p>
                      <p className="text-sm font-bold text-gray-800">{campaign.post_title}</p>
                      <p className="text-xs text-gray-500">{campaign.post_subtitle}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Legenda</p>
                          <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{campaign.caption}</p>
                        </div>
                        <button onClick={() => copy(campaign.caption, `cap-${campaign.id}`)} className="flex-shrink-0 text-indigo-600 text-xs font-bold">
                          {copied === `cap-${campaign.id}` ? "✅" : "Copiar"}
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Mensagem WhatsApp</p>
                          <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{campaign.whatsapp_message}</p>
                        </div>
                        <button onClick={() => copy(campaign.whatsapp_message, `wa-${campaign.id}`)} className="flex-shrink-0 text-green-600 text-xs font-bold">
                          {copied === `wa-${campaign.id}` ? "✅" : "Copiar"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====================== POSTS ====================== */}
      {activeTab === "posts" && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Posts de {monthLabel}</h2>
              <p className="text-gray-500 text-sm">{monthlyPosts.length} de {postsLimit} disponíveis.</p>
            </div>
          </div>
          {!hasMonthlyContent ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📸</div>
              <h3 className="font-bold text-gray-700 mb-2">Posts não gerados ainda</h3>
              <p className="text-sm text-gray-500 mb-4">Vá para a aba Início e clique em "Gerar conteúdos deste mês".</p>
              <button onClick={() => setActiveTab("inicio")} className="inline-block gradient-brand text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:opacity-90 transition">
                Ir para Início →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {monthlyPosts.map((post, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                  <div
                    className="aspect-square flex flex-col items-center justify-center p-4 text-white"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}ee, ${primaryColor}77)` }}
                  >
                    <p className="text-xs uppercase tracking-widest opacity-70 mb-1">{post.category}</p>
                    <p className="text-base font-extrabold text-center leading-tight mb-1">{post.title}</p>
                    <p className="text-xs opacity-80 text-center">{post.subtitle}</p>
                    <div className="mt-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">{post.cta}</div>
                    <p className="absolute bottom-2 text-xs opacity-40 truncate max-w-full px-2">{business.business_name}</p>
                  </div>
                  <div className="bg-white px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Post #{i + 1}</span>
                    <button
                      onClick={() => copy(monthlyCaptions[i] ?? "", `post-cap-${i}`)}
                      className="text-xs text-indigo-600 font-semibold"
                    >
                      {copied === `post-cap-${i}` ? "✅" : "Copiar legenda"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====================== MENSAGENS ====================== */}
      {activeTab === "mensagens" && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Mensagens para WhatsApp</h2>
            <p className="text-gray-500 text-sm mb-4">
              {hasMonthlyContent ? `${monthlyMessages.length} mensagens de ${monthLabel}.` : "Gere o conteúdo do mês para ver as mensagens."}
            </p>
            {!hasMonthlyContent ? (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
                <p className="text-sm text-gray-500 mb-3">Mensagens ainda não geradas para este mês.</p>
                <button onClick={() => setActiveTab("inicio")} className="text-indigo-600 text-sm font-bold hover:underline">
                  Gerar conteúdos →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {monthlyMessages.map((msg, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Mensagem #{i + 1}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{msg}</p>
                    </div>
                    <button onClick={() => copy(msg, `wa-msg-${i}`)} className="flex-shrink-0 text-green-600 text-sm font-semibold hover:underline">
                      {copied === `wa-msg-${i}` ? "✅" : "Copiar"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {planName === "pro" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Mensagens para trazer clientes de volta</h2>
              <p className="text-gray-500 text-sm mb-4">Use quando quiser reativar quem sumiu.</p>
              <div className="space-y-3">
                {recoveryMessages.map((msg) => (
                  <div key={msg.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{msg.emoji}</span>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{msg.situation}</p>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-gray-700 leading-relaxed">{msg.message}</p>
                      <button onClick={() => copy(msg.message, `rec-${msg.id}`)} className="flex-shrink-0 text-indigo-600 text-sm font-semibold hover:underline">
                        {copied === `rec-${msg.id}` ? "✅" : "Copiar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================== EXTRAS ====================== */}
      {activeTab === "extras" && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Pacotes extras</h2>
            <p className="text-gray-500 text-sm mt-1">Adicione mais conteúdos ao seu plano quando precisar.</p>
          </div>

          {/* Pacotes ativos */}
          {activeExtras.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Seus pacotes ativos</h3>
              <div className="space-y-3">
                {activeExtras.map((pkg) => (
                  <div key={pkg.id} className="bg-white border border-green-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <p className="font-bold text-gray-900 text-sm">{pkg.package_name} ativo</p>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {pkg.posts_added    > 0 && <span>+{pkg.posts_added} posts extras</span>}
                        {pkg.captions_added > 0 && <span>+{pkg.captions_added} legendas extras</span>}
                        {pkg.stories_added  > 0 && <span>+{pkg.stories_added} stories</span>}
                        {pkg.messages_added > 0 && <span>+{pkg.messages_added} mensagens de reativação</span>}
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full flex-shrink-0">Ativo</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pacotes disponíveis */}
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Pacotes disponíveis</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                slug: "instagram-extra",
                icon: "📸",
                title: "Instagram Extra",
                price: "R$ 19",
                tagline: "20 posts extras para movimentar seu Instagram",
                benefits: ["+20 posts extras", "+20 legendas extras", "Posts com CTA para WhatsApp"],
                checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_INSTAGRAM_EXTRA ?? "#",
                cta: "Adicionar posts extras",
                active: hasInstagramExtra,
              },
              {
                slug: "stories",
                icon: "📱",
                title: "Pacote Stories",
                price: "R$ 15",
                tagline: "20 stories prontos para divulgar promoções e avisos",
                benefits: ["+20 stories personalizados", "Chamadas para WhatsApp", "Avisos de agenda aberta"],
                checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_STORIES ?? "#",
                cta: "Adicionar stories",
                active: hasStories,
              },
              {
                slug: "reativacao",
                icon: "💬",
                title: "Reativação de Clientes",
                price: "R$ 19",
                tagline: "50 mensagens para trazer clientes de volta",
                benefits: ["+50 mensagens de reativação", "Para clientes antigos", "Pós-venda e avaliação"],
                checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_REATIVACAO ?? "#",
                cta: "Adicionar mensagens de reativação",
                active: hasReativacao,
              },
            ].map((pkg) => (
              <div key={pkg.slug} className={`bg-white border rounded-2xl p-5 flex flex-col ${pkg.active ? "border-green-200 opacity-60" : "border-gray-200 hover:border-violet-200 hover:shadow-sm transition"}`}>
                <div className="text-3xl mb-3">{pkg.icon}</div>
                <h3 className="font-extrabold text-gray-900 text-sm mb-0.5">{pkg.title}</h3>
                <p className="text-xl font-extrabold text-violet-700 mb-1">{pkg.price}</p>
                <p className="text-xs text-gray-500 mb-3">{pkg.tagline}</p>
                <ul className="space-y-1.5 text-xs text-gray-600 flex-1 mb-4">
                  {pkg.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-1.5">
                      <span className="text-violet-400">✓</span> {b}
                    </li>
                  ))}
                </ul>
                {pkg.active ? (
                  <div className="text-center py-2 text-sm text-green-600 font-bold">✅ Já adicionado</div>
                ) : (
                  <a
                    href={pkg.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 gradient-brand text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition text-xs shadow-md shadow-violet-100"
                  >
                    {pkg.cta} →
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Lógica de limites totais */}
          {activeExtras.length > 0 && (
            <div className="mt-8 bg-violet-50 border border-violet-100 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Seus limites atuais (plano + extras)</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Posts",    total: postsLimit,    base: basePostsLimit,    extra: extraPosts },
                  { label: "Legendas", total: captionsLimit, base: baseCaptionsLimit, extra: extraCaptions },
                  { label: "Mensagens WA", total: messagesLimit, base: baseMessagesLimit, extra: extraMessages },
                  ...(extraStories > 0 ? [{ label: "Stories", total: extraStories, base: 0, extra: extraStories }] : []),
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded-xl p-3 text-center">
                    <p className="text-xl font-extrabold text-gray-900">{item.total}</p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    {item.extra > 0 && (
                      <p className="text-xs text-violet-600 font-bold mt-0.5">{item.base} + {item.extra} extras</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================== LEADS ====================== */}
      {activeTab === "leads" && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Leads recebidos pelo site</h2>
            <p className="text-gray-500 text-sm mt-1">Pessoas que se cadastraram no seu mini site.</p>
          </div>
          {leads.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-700 mb-2">Nenhum lead ainda</h3>
              <p className="text-sm text-gray-500 mb-4">Compartilhe o link do seu site no Instagram, WhatsApp e Google.</p>
              <button onClick={() => copy(siteUrl, "site-leads")} className="inline-block gradient-brand text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:opacity-90 transition">
                {copied === "site-leads" ? "✅ Copiado!" : "📋 Copiar link do site"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div key={lead.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-gray-800">{lead.name}</p>
                    <p className="text-sm text-gray-500">{lead.whatsapp}</p>
                    {lead.interest && <p className="text-xs text-gray-400">Interesse: {lead.interest}</p>}
                    <p className="text-xs text-gray-300 mt-0.5">{new Date(lead.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <a
                    href={buildWhatsAppLink(lead.whatsapp, `Olá ${lead.name}! Vi que você se cadastrou no site da ${business.business_name}. Como posso te ajudar?`)}
                    target="_blank"
                    className="flex items-center gap-2 bg-green-50 text-green-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-green-100 transition"
                  >
                    💬 Chamar no WhatsApp
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====================== APARÊNCIA ====================== */}
      {activeTab === "aparencia" && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Editar aparência</h2>
            <p className="text-gray-500 text-sm mt-1">Personalize cores e estilo dos seus posts e mini site.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">Cor principal</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setPrimaryColor(c.value)}
                    className={`w-10 h-10 rounded-xl transition border-2 ${primaryColor === c.value ? "border-gray-800 scale-110" : "border-transparent hover:scale-105"}`}
                    style={{ background: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer" />
                <span className="text-sm text-gray-500 font-mono">{primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">Estilo visual</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {VISUAL_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`border-2 rounded-2xl p-4 text-left transition ${
                      selectedStyle === style.id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-bold text-gray-800 text-sm">{style.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">Preview</label>
              <div
                className="aspect-square max-w-[200px] rounded-2xl flex flex-col items-center justify-center p-4 text-white"
                style={{ background: `linear-gradient(135deg, ${primaryColor}ee, ${primaryColor}88)` }}
              >
                <p className="text-xs uppercase tracking-widest opacity-70 mb-1">{business.niche}</p>
                <p className="text-base font-extrabold text-center">{business.business_name}</p>
                <p className="text-xs opacity-80 text-center mt-1">{business.main_service}</p>
                <div className="mt-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">Ver mais</div>
              </div>
            </div>

            <button
              onClick={saveAppearance}
              disabled={savingAppearance}
              className="w-full gradient-brand text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-60"
            >
              {savingAppearance ? "Salvando..." : appearanceSaved ? "✅ Aparência salva!" : "Salvar aparência"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/suporte" className="text-sm text-gray-400 hover:text-indigo-500 transition">Precisa de ajuda? Acesse o suporte</Link>
      </div>
    </div>
  );
}
