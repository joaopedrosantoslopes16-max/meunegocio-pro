"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { generateCalendar } from "@/lib/calendar-generator";
import { generateCampaigns } from "@/lib/campaign-generator";
import { generateRecoveryMessages } from "@/lib/recovery-messages";
import { buildWhatsAppLink } from "@/lib/whatsapp-utils";
import PostCard from "@/components/PostCard";
import PostEditor, { type EditedPost } from "@/components/PostEditor";
import type { Kit, Business, Lead, Subscription, MonthlyContent, UserExtraPackage, Post, VisualStyle, ImageGallery } from "@/types";

type TabId =
  | "inicio" | "gerador" | "posts" | "calendario"
  | "campanhas" | "mensagens" | "galeria" | "extras" | "leads" | "aparencia";

const VISUAL_STYLES: { id: VisualStyle; label: string; desc: string }[] = [
  { id: "moderno",     label: "Moderno",     desc: "Limpo e contemporâneo" },
  { id: "elegante",    label: "Elegante",    desc: "Sofisticado e refinado" },
  { id: "clean",       label: "Clean",       desc: "Simples e minimalista" },
  { id: "chamativo",   label: "Chamativo",   desc: "Colorido e vibrante"   },
  { id: "minimalista", label: "Minimalista", desc: "Só o essencial"        },
];

const COLOR_PRESETS = [
  { label: "Índigo",   value: "#6366f1" },
  { label: "Roxo",     value: "#7c3aed" },
  { label: "Azul",     value: "#2563eb" },
  { label: "Ciano",    value: "#0891b2" },
  { label: "Verde",    value: "#16a34a" },
  { label: "Esmeralda",value: "#059669" },
  { label: "Âmbar",   value: "#d97706" },
  { label: "Vermelho", value: "#dc2626" },
  { label: "Rosa",     value: "#db2777" },
  { label: "Preto",    value: "#111827" },
];

const FONT_STYLES = [
  { id: "inter",      label: "Moderna",   sample: "Aa" },
  { id: "poppins",    label: "Elegante",  sample: "Aa" },
  { id: "montserrat", label: "Forte",     sample: "Aa" },
  { id: "opensans",   label: "Clean",     sample: "Aa" },
  { id: "nunito",     label: "Amigável",  sample: "Aa" },
];

const MONTH_NAMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const PLAN_LABELS: Record<string, string> = { essencial: "Essencial", pro: "Pro" };

interface DashboardClientProps {
  kit:            Kit & { businesses: Business };
  leads:          Lead[];
  subscription:   Subscription | null;
  monthlyContent: MonthlyContent | null;
  extraPackages:  UserExtraPackage[];
  displayName:    string;
  userEmail:      string;
  galleryImages?: ImageGallery[];
}

export default function DashboardClient({
  kit,
  leads,
  subscription,
  monthlyContent,
  extraPackages,
  displayName,
  userEmail,
  galleryImages = [],
}: DashboardClientProps) {
  const [activeTab, setActiveTab]         = useState<TabId>("inicio");
  const [copied, setCopied]               = useState<string | null>(null);
  const [savingAppearance, setSavingApp]  = useState(false);
  const [appearanceSaved, setAppSaved]    = useState(false);
  const [generatingContent, setGenerating]= useState(false);
  const [contentError, setContentError]   = useState<string | null>(null);
  const [localMonthlyContent, setMonthly] = useState<MonthlyContent | null>(monthlyContent);
  const [editingPost, setEditingPost]     = useState<Post | null>(null);

  const [primaryColor, setPrimaryColor]   = useState(kit.businesses.primary_color ?? "#6366f1");
  const [secondaryColor, setSecondary]    = useState((kit.businesses as any).secondary_color ?? "#4f46e5");
  const [selectedStyle, setSelectedStyle] = useState<VisualStyle>((kit.businesses.visual_style as VisualStyle) ?? "moderno");
  const [selectedFont, setSelectedFont]   = useState<string>((kit.businesses as any).font_style ?? "inter");

  const business = kit.businesses;
  const siteUrl  = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/site/${kit.site_slug}`;

  const subStatus = subscription?.status ?? null;
  const isActive  = subStatus === "active";
  const isPending = subStatus === "pending" || !subscription;
  const isBlocked = subStatus === "cancelled" || subStatus === "refunded" || subStatus === "chargeback";
  const isPastDue = subStatus === "past_due";
  const planName  = subscription?.plan_name ?? "essencial";
  const planLabel = PLAN_LABELS[planName] ?? "Essencial";
  const isPro     = planName === "pro";

  const now          = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear  = now.getFullYear();
  const monthLabel   = MONTH_NAMES[currentMonth - 1];

  const hasMonthlyContent = !!localMonthlyContent?.generated_at;
  const monthlyPosts      = (localMonthlyContent?.posts_json    as Post[]   ) ?? [];
  const monthlyCaptions   = (localMonthlyContent?.captions_json as string[] ) ?? [];
  const monthlyMessages   = (localMonthlyContent?.messages_json as string[] ) ?? [];

  const basePostsLimit    = localMonthlyContent?.posts_limit    ?? (planName === "pro" ? 15 : 5);
  const baseCaptionsLimit = localMonthlyContent?.captions_limit ?? (planName === "pro" ? 15 : 5);
  const baseMessagesLimit = localMonthlyContent?.messages_limit ?? (planName === "pro" ? 15 : 5);

  const activeExtras  = extraPackages.filter((p) => p.status === "active");
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

  const calendar         = generateCalendar({ niche: business.niche, business_name: business.business_name, city: business.city, main_service: business.main_service });
  const campaigns        = generateCampaigns({ business_name: business.business_name, niche: business.niche, city: business.city, main_service: business.main_service });
  const recoveryMessages = generateRecoveryMessages({ business_name: business.business_name, niche: business.niche, main_service: business.main_service, city: business.city });

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function saveAppearance() {
    setSavingApp(true);
    const supabase = createClient();
    await supabase
      .from("businesses")
      .update({ primary_color: primaryColor, visual_style: selectedStyle, font_style: selectedFont, secondary_color: secondaryColor })
      .eq("id", business.id);
    setSavingApp(false);
    setAppSaved(true);
    setTimeout(() => setAppSaved(false), 3000);
  }

  async function generateMonthlyContent() {
    setGenerating(true);
    setContentError(null);
    try {
      const res  = await fetch("/api/monthly-content/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business_id: business.id }) });
      const json = await res.json();
      if (!res.ok) setContentError(json.error ?? "Erro ao gerar conteúdo.");
      else window.location.reload();
    } catch { setContentError("Erro de conexão. Tente novamente."); }
    finally  { setGenerating(false); }
  }

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "inicio",     label: "Início",      icon: "🏠" },
    { id: "gerador",    label: "Gerador",     icon: "✨" },
    { id: "posts",      label: `Posts (${monthlyPosts.length}/${postsLimit})`, icon: "📸" },
    { id: "calendario", label: "Calendário",  icon: "📅" },
    { id: "campanhas",  label: "Campanhas",   icon: "🚀" },
    { id: "mensagens",  label: "Mensagens",   icon: "💬" },
    { id: "galeria",    label: "Galeria",     icon: "🖼️" },
    { id: "extras",     label: `Extras${activeExtras.length > 0 ? ` (${activeExtras.length})` : ""}`, icon: "⚡" },
    { id: "leads",      label: `Leads (${leads.length})`, icon: "🎯" },
    { id: "aparencia",  label: "Aparência",   icon: "🎨" },
  ];

  return (
    <>
      {/* Post Editor Modal */}
      {editingPost && (
        <PostEditor
          initialTitle={editingPost.title}
          initialSubtitle={editingPost.subtitle}
          initialCta={editingPost.cta}
          initialTemplate={editingPost.template_type as any}
          business={business}
          images={galleryImages}
          onSave={(edited: EditedPost) => { console.log("Post salvo:", edited); }}
          onClose={() => setEditingPost(null)}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Olá, {displayName}! 👋</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Seu mini site fica ativo. Seus conteúdos renovam todo mês.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${isActive ? "bg-green-100 text-green-700" : isPastDue ? "bg-yellow-100 text-yellow-700" : isBlocked ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {isActive ? `Plano ${planLabel} ativo` : isPastDue ? "Pagamento pendente" : isBlocked ? "Assinatura inativa" : "Aguardando confirmação"}
            </span>
          </div>
        </div>

        {/* AVISOS */}
        {isPastDue && (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between flex-wrap gap-3">
            <p className="text-yellow-800 dark:text-yellow-300 text-sm font-medium">⚠️ Há um problema com seu pagamento. Regularize para continuar.</p>
            <a href={process.env.NEXT_PUBLIC_CHECKOUT_URL ?? "#"} className="text-sm font-bold text-yellow-700 dark:text-yellow-300 underline">Regularizar →</a>
          </div>
        )}
        {isPending && !isActive && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl px-5 py-4 mb-6">
            <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">⏳ Aguardando confirmação de pagamento. Recursos serão liberados automaticamente.</p>
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-gray-100 dark:border-gray-800 scrollbar-hide">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${activeTab === tab.id ? "bg-violet-600 text-white shadow" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ──────────────────── INÍCIO ──────────────────── */}
        {activeTab === "inicio" && (
          <div className="space-y-5">

            {/* Mini site */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 font-bold">Meu mini site</p>
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{business.business_name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{business.niche} • {business.city}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {isActive ? <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><span className="text-sm text-green-600 font-semibold">Online</span></> : <><span className="w-2 h-2 rounded-full bg-gray-400" /><span className="text-sm text-gray-500 font-semibold">Pausado</span></>}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5 font-mono text-sm text-gray-600 dark:text-gray-300 truncate mb-3">{siteUrl}</div>
              <div className="flex gap-2 flex-wrap">
                <a href={`/site/${kit.site_slug}`} target="_blank" className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900 transition">🌐 Abrir site</a>
                <button onClick={() => copy(siteUrl, "site")} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition">{copied === "site" ? "✅ Copiado!" : "📋 Copiar link"}</button>
                <a href={buildWhatsAppLink(business.whatsapp, `Estou enviando o link do meu site: ${siteUrl}`)} target="_blank" className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-green-100 transition">💬 Compartilhar</a>
                <Link href="/editar-site" className="flex items-center gap-1.5 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900 transition border border-violet-200 dark:border-violet-800">✏️ Editar site</Link>
              </div>
            </div>

            {/* Gerador Magnético destaque */}
            <Link href="/gerador-magnetico" className="block rounded-2xl p-5 hover:opacity-95 transition shadow-lg" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1 text-white/90 text-xs font-bold mb-2">✨ Novo</div>
                  <h2 className="text-xl font-extrabold text-white mb-1">Gerador de Conteúdos Magnéticos</h2>
                  <p className="text-white/75 text-sm leading-relaxed">Crie posts, Reels, Stories, carrosséis e mensagens em segundos.</p>
                </div>
                <div className="text-4xl opacity-80 flex-shrink-0 ml-4">→</div>
              </div>
            </Link>

            {/* Links rápidos */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/galeria" className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-violet-200 transition shadow-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-0.5">Galeria</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Enviar imagens</p>
                </div>
                <span className="text-xl">📸</span>
              </Link>
              <Link href="/gerar-post-hoje" className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-violet-200 transition shadow-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-0.5">Post de hoje</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Gerar agora</p>
                </div>
                <span className="text-xl">✨</span>
              </Link>
            </div>

            {/* Conteúdos do mês */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-bold">Conteúdos do mês</p>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{monthLabel} {currentYear}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Plano {planLabel} · {postsLimit} posts · {captionsLimit} legendas · {messagesLimit} msgs</p>
                </div>
                {hasMonthlyContent && <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-700">✅ Gerado</span>}
              </div>

              {hasMonthlyContent && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[{ label: "Posts", used: monthlyPosts.length, total: postsLimit }, { label: "Legendas", used: monthlyCaptions.length, total: captionsLimit }, { label: "Mensagens", used: monthlyMessages.length, total: messagesLimit }].map((item) => (
                    <div key={item.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                      <p className="text-xl font-extrabold text-gray-900 dark:text-white">{item.used}<span className="text-sm font-normal text-gray-400">/{item.total}</span></p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {!isActive ? (
                <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500">Ative sua assinatura para gerar conteúdos mensais.</p>
                </div>
              ) : hasMonthlyContent ? (
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setActiveTab("posts")} className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-indigo-100 transition">📸 Ver posts</button>
                  <button onClick={() => setActiveTab("mensagens")} className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-green-100 transition">💬 Ver mensagens</button>
                  {isPro && <button onClick={() => setActiveTab("campanhas")} className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-purple-100 transition">🚀 Ver campanhas</button>}
                </div>
              ) : (
                <div className="space-y-3">
                  {contentError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{contentError}</p>}
                  <button onClick={generateMonthlyContent} disabled={generatingContent} className="w-full gradient-brand text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-60 text-sm">
                    {generatingContent ? "Gerando seus conteúdos…" : `✨ Gerar conteúdos de ${monthLabel}`}
                  </button>
                  <p className="text-xs text-gray-400 text-center">{postsLimit} posts · {captionsLimit} legendas · {messagesLimit} mensagens disponíveis</p>
                </div>
              )}
            </div>

            {/* Leads resumo */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900 dark:text-white">🎯 Leads recebidos</h2>
                <button onClick={() => setActiveTab("leads")} className="text-indigo-600 text-sm font-semibold hover:underline">Ver todos ({leads.length})</button>
              </div>
              {leads.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum lead ainda. Compartilhe o link do seu site!</p>
              ) : (
                <div className="space-y-2">
                  {leads.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{lead.name}</p>
                        {lead.interest && <p className="text-xs text-gray-500">{lead.interest}</p>}
                      </div>
                      <a href={buildWhatsAppLink(lead.whatsapp, `Olá ${lead.name}! Vi que você se cadastrou no nosso site.`)} target="_blank" className="text-xs font-bold text-green-600 hover:underline">💬 Chamar</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────────────────── GERADOR ──────────────────── */}
        {activeTab === "gerador" && (
          <div className="space-y-5">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerador de Conteúdos Magnéticos</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Crie posts, Reels, Stories e mensagens em segundos.</p>
            </div>
            <Link href="/gerador-magnetico" className="flex items-center justify-between rounded-2xl p-6 hover:opacity-95 transition shadow-lg" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)" }}>
              <div>
                <h3 className="text-lg font-extrabold text-white mb-1">✨ Abrir Gerador Magnético</h3>
                <p className="text-white/75 text-sm">Tema → Narrativa → Headline → Formato → Resultado</p>
              </div>
              <span className="text-3xl text-white/80">→</span>
            </Link>
            <Link href="/gerar-post-hoje" className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:border-violet-200 transition shadow-sm">
              <div>
                <p className="font-bold text-gray-900 dark:text-white mb-0.5">⚡ Gerar post de hoje</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Escolha um objetivo e receba post + legenda + mensagem WhatsApp</p>
              </div>
              <span className="text-gray-400 text-lg">→</span>
            </Link>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Plano Essencial</p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {["Post único","Carrossel básico","Legenda","Mensagem WhatsApp","Ideias de conteúdo"].map((f) => <li key={f} className="flex items-center gap-2"><span className="text-green-500">✓</span> {f}</li>)}
                </ul>
              </div>
              <div className="bg-violet-50 dark:bg-violet-950 rounded-2xl border border-violet-100 dark:border-violet-900 p-5 relative overflow-hidden">
                <span className="absolute top-3 right-3 text-xs bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded-full">Pro</span>
                <p className="text-xs font-bold text-violet-500 uppercase tracking-wide mb-3">Plano Pro</p>
                <ul className="space-y-2 text-sm text-violet-700 dark:text-violet-300">
                  {["Tudo do Essencial","Roteiro para Reels","Sequência de Stories","Narrativas magnéticas","Headlines de impacto","CTA personalizado"].map((f) => <li key={f} className="flex items-center gap-2"><span className="text-violet-500">✓</span> {f}</li>)}
                </ul>
                {!isPro && <a href={process.env.NEXT_PUBLIC_CHECKOUT_URL_PRO ?? "#"} className="mt-4 flex items-center justify-center gap-1.5 gradient-brand text-white font-bold py-2 rounded-xl text-sm hover:opacity-90 transition">Fazer upgrade para Pro →</a>}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────── POSTS ──────────────────── */}
        {activeTab === "posts" && (
          <div>
            <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Posts de {monthLabel}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{monthlyPosts.length} de {postsLimit} disponíveis.</p>
              </div>
              <Link href="/gerar-post-hoje" className="flex items-center gap-1.5 gradient-brand text-white font-bold text-xs px-4 py-2 rounded-xl hover:opacity-90 transition">
                ✨ Gerar post de hoje
              </Link>
            </div>

            {!hasMonthlyContent ? (
              <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
                <div className="text-4xl mb-3">📸</div>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Posts não gerados ainda</h3>
                <p className="text-sm text-gray-500 mb-4">Vá para Início e clique em "Gerar conteúdos deste mês".</p>
                <button onClick={() => setActiveTab("inicio")} className="inline-block gradient-brand text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:opacity-90 transition">Ir para Início →</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {monthlyPosts.map((post, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 group">
                    <PostCard
                      template_type={post.template_type}
                      title={post.title}
                      subtitle={post.subtitle}
                      cta={post.cta}
                      business_name={business.business_name}
                      primary_color={primaryColor}
                      niche={business.niche}
                      city={business.city}
                      number={post.number}
                      unlocked={post.is_unlocked}
                    />
                    <div className="bg-white dark:bg-gray-900 px-3 py-2.5 flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-400">Post #{i + 1}</span>
                      <div className="flex gap-1.5">
                        {monthlyCaptions[i] && (
                          <button onClick={() => copy(monthlyCaptions[i], `cap-${i}`)} className="text-[11px] text-violet-600 font-semibold hover:underline">
                            {copied === `cap-${i}` ? "✅" : "Legenda"}
                          </button>
                        )}
                        {post.is_unlocked && (
                          <button
                            onClick={() => setEditingPost(post)}
                            className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold hover:text-violet-600 transition"
                          >
                            ✏️ Editar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ──────────────────── CALENDÁRIO ──────────────────── */}
        {activeTab === "calendario" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Calendário do mês</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">O que postar e quando — adaptado para {business.niche}.</p>
            </div>
            {[1,2,3,4].map((week) => (
              <div key={week} className="mb-6">
                <h3 className="text-sm font-bold text-violet-600 uppercase tracking-wide mb-3">Semana {week}</h3>
                <div className="space-y-3">
                  {calendar.filter((e) => e.week === week).map((entry, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex gap-4">
                      <div className="w-20 flex-shrink-0 text-center">
                        <p className="text-xs font-bold text-gray-400 uppercase">{entry.day}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300">{entry.post_type}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{entry.topic}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{entry.caption_snippet}</p>
                      </div>
                      <button onClick={() => copy(entry.caption_snippet, `cal-${week}-${i}`)} className="flex-shrink-0 text-violet-600 text-xs font-semibold hover:underline self-start">
                        {copied === `cal-${week}-${i}` ? "✅" : "Copiar"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ──────────────────── CAMPANHAS ──────────────────── */}
        {activeTab === "campanhas" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Campanhas prontas</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Use quando quiser movimentar o Instagram e o WhatsApp.</p>
            </div>
            {!isPro ? (
              <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Disponível no plano Pro</h3>
                <p className="text-sm text-gray-500 mb-4">Campanhas prontas fazem parte do plano Pro (R$ 57/mês).</p>
                <a href={process.env.NEXT_PUBLIC_CHECKOUT_URL_PRO ?? "#"} className="inline-block gradient-brand text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:opacity-90 transition">Fazer upgrade para Pro →</a>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{campaign.emoji}</span>
                      <h3 className="font-bold text-gray-900 dark:text-white">{campaign.name}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Post</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{campaign.post_title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{campaign.post_subtitle}</p>
                      </div>
                      <CopyRow label="Legenda" text={campaign.caption} copyKey={`cap-${campaign.id}`} copied={copied} onCopy={copy} />
                      <CopyRow label="WhatsApp" text={campaign.whatsapp_message} copyKey={`wa-${campaign.id}`} copied={copied} onCopy={copy} green />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ──────────────────── MENSAGENS ──────────────────── */}
        {activeTab === "mensagens" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Mensagens para WhatsApp</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                {hasMonthlyContent ? `${monthlyMessages.length} mensagens de ${monthLabel}.` : "Gere o conteúdo do mês para ver as mensagens."}
              </p>
              {!hasMonthlyContent ? (
                <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
                  <p className="text-sm text-gray-500 mb-3">Mensagens ainda não geradas para este mês.</p>
                  <button onClick={() => setActiveTab("inicio")} className="text-violet-600 text-sm font-bold hover:underline">Gerar conteúdos →</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {monthlyMessages.map((msg, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Mensagem #{i + 1}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{msg}</p>
                      </div>
                      <button onClick={() => copy(msg, `wa-msg-${i}`)} className="flex-shrink-0 text-green-600 text-sm font-semibold hover:underline">
                        {copied === `wa-msg-${i}` ? "✅" : "Copiar"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {isPro && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Mensagens para recuperar clientes</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Use quando quiser reativar quem sumiu.</p>
                <div className="space-y-3">
                  {recoveryMessages.map((msg) => (
                    <div key={msg.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{msg.emoji}</span>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{msg.situation}</p>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{msg.message}</p>
                        <button onClick={() => copy(msg.message, `rec-${msg.id}`)} className="flex-shrink-0 text-violet-600 text-sm font-semibold hover:underline">
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

        {/* ──────────────────── GALERIA ──────────────────── */}
        {activeTab === "galeria" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Minha galeria de imagens</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Envie e organize fotos do negócio para posts, site e stories.</p>
            </div>
            <Link href="/galeria" className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:border-violet-200 transition shadow-sm">
              <div>
                <p className="font-bold text-gray-900 dark:text-white mb-1">📸 Abrir galeria completa</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Envie imagens, defina capa, logo e fotos profissionais</p>
                <p className="text-xs text-gray-400 mt-1">{galleryImages.length} imagem{galleryImages.length !== 1 ? "ns" : ""} enviada{galleryImages.length !== 1 ? "s" : ""}</p>
              </div>
              <span className="text-gray-400 text-lg">→</span>
            </Link>
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {galleryImages.slice(0, 6).map((img) => (
                  <div key={img.id} className="aspect-square rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            {!isPro && (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-5">
                <p className="font-bold text-yellow-800 dark:text-yellow-300 text-sm mb-1">Galeria e imagens nos posts disponíveis no Pro</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-2">No Pro você usa imagens reais nos posts e no mini site com capa personalizada.</p>
                <a href={process.env.NEXT_PUBLIC_CHECKOUT_URL_PRO ?? "#"} className="text-xs font-bold text-yellow-800 dark:text-yellow-300 underline">Fazer upgrade para Pro →</a>
              </div>
            )}
          </div>
        )}

        {/* ──────────────────── EXTRAS ──────────────────── */}
        {activeTab === "extras" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pacotes extras</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Adicione mais conteúdos ao seu plano quando precisar.</p>
            </div>
            {activeExtras.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Seus pacotes ativos</h3>
                <div className="space-y-3">
                  {activeExtras.map((pkg) => (
                    <div key={pkg.id} className="bg-white dark:bg-gray-900 border border-green-100 dark:border-green-900 rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-green-500" /><p className="font-bold text-gray-900 dark:text-white text-sm">{pkg.package_name}</p></div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                          {pkg.posts_added    > 0 && <span>+{pkg.posts_added} posts</span>}
                          {pkg.captions_added > 0 && <span>+{pkg.captions_added} legendas</span>}
                          {pkg.stories_added  > 0 && <span>+{pkg.stories_added} stories</span>}
                          {pkg.messages_added > 0 && <span>+{pkg.messages_added} mensagens</span>}
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-bold px-3 py-1 rounded-full">Ativo</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Pacotes disponíveis</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { slug: "instagram-extra", icon: "📸", title: "Instagram Extra", price: "R$ 19", tagline: "20 posts extras para movimentar seu Instagram", benefits: ["+20 posts extras","+20 legendas extras","Posts com CTA para WhatsApp"], checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_INSTAGRAM_EXTRA ?? "#", cta: "Adicionar posts extras", active: hasInstagramExtra },
                { slug: "stories", icon: "📱", title: "Pacote Stories", price: "R$ 15", tagline: "20 stories prontos para divulgar promoções", benefits: ["+20 stories personalizados","Chamadas para WhatsApp","Avisos de agenda aberta"], checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_STORIES ?? "#", cta: "Adicionar stories", active: hasStories },
                { slug: "reativacao", icon: "💬", title: "Reativação de Clientes", price: "R$ 19", tagline: "50 mensagens para trazer clientes de volta", benefits: ["+50 mensagens de reativação","Para clientes antigos","Pós-venda e avaliação"], checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_REATIVACAO ?? "#", cta: "Adicionar mensagens", active: hasReativacao },
              ].map((pkg) => (
                <div key={pkg.slug} className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 flex flex-col ${pkg.active ? "border-green-200 dark:border-green-900 opacity-60" : "border-gray-200 dark:border-gray-700 hover:border-violet-200 hover:shadow-sm transition"}`}>
                  <div className="text-3xl mb-3">{pkg.icon}</div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-sm mb-0.5">{pkg.title}</h3>
                  <p className="text-xl font-extrabold text-violet-700 mb-1">{pkg.price}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{pkg.tagline}</p>
                  <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 flex-1 mb-4">
                    {pkg.benefits.map((b) => <li key={b} className="flex items-center gap-1.5"><span className="text-violet-400">✓</span> {b}</li>)}
                  </ul>
                  {pkg.active ? <div className="text-center py-2 text-sm text-green-600 font-bold">✅ Já adicionado</div> : <a href={pkg.checkoutUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 gradient-brand text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition text-xs">{pkg.cta} →</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──────────────────── LEADS ──────────────────── */}
        {activeTab === "leads" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Leads recebidos pelo site</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Pessoas que se cadastraram no seu mini site.</p>
            </div>
            {leads.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Nenhum lead ainda</h3>
                <p className="text-sm text-gray-500 mb-4">Compartilhe o link do seu site no Instagram, WhatsApp e Google.</p>
                <button onClick={() => copy(siteUrl, "site-leads")} className="inline-block gradient-brand text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:opacity-90 transition">{copied === "site-leads" ? "✅ Copiado!" : "📋 Copiar link do site"}</button>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div key={lead.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{lead.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{lead.whatsapp}</p>
                      {lead.interest && <p className="text-xs text-gray-400">Interesse: {lead.interest}</p>}
                      <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">{new Date(lead.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <a href={buildWhatsAppLink(lead.whatsapp, `Olá ${lead.name}! Vi que você se cadastrou no site da ${business.business_name}.`)} target="_blank" className="flex items-center gap-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 font-bold text-sm px-4 py-2 rounded-xl hover:bg-green-100 transition">💬 Chamar</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ──────────────────── APARÊNCIA ──────────────────── */}
        {activeTab === "aparencia" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar aparência</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Personalize cores, fontes e estilos dos seus posts e mini site.</p>
            </div>

            <div className="grid md:grid-cols-5 gap-6">
              {/* Controles */}
              <div className="md:col-span-3 space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">

                  {/* Cor principal */}
                  <div className="mb-5">
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Cor principal</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {COLOR_PRESETS.map((c) => (
                        <button key={c.value} onClick={() => setPrimaryColor(c.value)} className={`w-9 h-9 rounded-xl transition border-2 hover:scale-110 ${primaryColor === c.value ? "border-gray-800 dark:border-white scale-110" : "border-transparent"}`} style={{ background: c.value }} title={c.label} />
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Cor escolhida</p>
                        <span className="text-sm text-gray-700 dark:text-gray-200 font-mono font-bold">{primaryColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cor secundária */}
                  <div className="mb-5">
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Cor secundária</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={secondaryColor} onChange={(e) => setSecondary(e.target.value)} className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer" />
                      <span className="text-sm text-gray-700 dark:text-gray-200 font-mono">{secondaryColor}</span>
                    </div>
                  </div>

                  {/* Fonte */}
                  <div className="mb-5">
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Estilo de fonte</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {FONT_STYLES.map((f) => (
                        <button key={f.id} onClick={() => setSelectedFont(f.id)} className={`border-2 rounded-xl px-3 py-3 text-left transition ${selectedFont === f.id ? "border-violet-500 bg-violet-50 dark:bg-violet-950" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}>
                          <p className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-0.5">{f.sample}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{f.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Estilo visual */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Estilo visual</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {VISUAL_STYLES.map((style) => (
                        <button key={style.id} onClick={() => setSelectedStyle(style.id)} className={`border-2 rounded-xl p-3 text-left transition ${selectedStyle === style.id ? "border-violet-500 bg-violet-50 dark:bg-violet-950" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}>
                          <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{style.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{style.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={saveAppearance} disabled={savingAppearance} className="flex-1 gradient-brand text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-60 text-sm">
                    {savingAppearance ? "Salvando…" : appearanceSaved ? "✅ Aparência salva!" : "Salvar aparência"}
                  </button>
                  <Link href="/editar-site" className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 font-bold text-sm hover:bg-violet-50 dark:hover:bg-violet-950 transition">
                    ✏️ Editar mini site
                  </Link>
                </div>
              </div>

              {/* Preview */}
              <div className="md:col-span-2 space-y-4">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Preview</p>

                {/* Preview post */}
                <div>
                  <p className="text-[10px] text-gray-400 mb-1.5">Post</p>
                  <div className="max-w-[200px]">
                    <PostCard
                      template_type="main_service"
                      title={business.business_name}
                      subtitle={business.main_service}
                      cta="Fale no WhatsApp"
                      business_name={business.business_name}
                      primary_color={primaryColor}
                      niche={business.niche}
                      city={business.city}
                    />
                  </div>
                </div>

                {/* Preview WhatsApp */}
                <div>
                  <p className="text-[10px] text-gray-400 mb-1.5">WhatsApp CTA</p>
                  <div className="max-w-[200px]">
                    <PostCard
                      template_type="whatsapp_cta"
                      title="Agenda aberta"
                      subtitle={`Marque seu horário em ${business.city}`}
                      cta="Agendar pelo WhatsApp"
                      business_name={business.business_name}
                      primary_color={primaryColor}
                      niche={business.niche}
                      city={business.city}
                    />
                  </div>
                </div>

                {/* Preview promoção */}
                <div>
                  <p className="text-[10px] text-gray-400 mb-1.5">Promoção</p>
                  <div className="max-w-[200px]">
                    <PostCard
                      template_type="promotion"
                      title="Oferta especial"
                      subtitle={`Para novos clientes em ${business.city}`}
                      cta="Aproveitar agora"
                      business_name={business.business_name}
                      primary_color={primaryColor}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/suporte" className="text-sm text-gray-400 hover:text-violet-500 transition">Precisa de ajuda? Acesse o suporte</Link>
        </div>
      </div>
    </>
  );
}

function CopyRow({ label, text, copyKey, copied, onCopy, green }: { label: string; text: string; copyKey: string; copied: string | null; onCopy: (text: string, key: string) => void; green?: boolean }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-gray-400 mb-1">{label}</p>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">{text}</p>
        </div>
        <button onClick={() => onCopy(text, copyKey)} className={`flex-shrink-0 text-xs font-bold ${green ? "text-green-600" : "text-violet-600"}`}>
          {copied === copyKey ? "✅" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
