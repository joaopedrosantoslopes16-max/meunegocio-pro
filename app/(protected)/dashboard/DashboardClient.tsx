"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { generateCalendar } from "@/lib/calendar-generator";
import { generateCampaigns } from "@/lib/campaign-generator";
import { generateRecoveryMessages } from "@/lib/recovery-messages";
import { buildWhatsAppLink } from "@/lib/whatsapp-utils";
import PostCard, { type TemplateId } from "@/components/PostCard";
import PostEditor, { type EditedPost } from "@/components/PostEditor";
import type { Kit, Business, Lead, Subscription, MonthlyContent, UserExtraPackage, Post, VisualStyle, ImageGallery } from "@/types";

type TabId =
  | "inicio" | "gerador" | "posts" | "calendario"
  | "campanhas" | "mensagens" | "extras" | "leads" | "aparencia";

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
  { id: "inter",      label: "Moderna",   sample: "Aa", css: "'Inter', sans-serif" },
  { id: "poppins",    label: "Elegante",  sample: "Aa", css: "'Poppins', sans-serif" },
  { id: "montserrat", label: "Forte",     sample: "Aa", css: "'Montserrat', sans-serif" },
  { id: "opensans",   label: "Clean",     sample: "Aa", css: "'Open Sans', sans-serif" },
  { id: "nunito",     label: "Amigável",  sample: "Aa", css: "'Nunito', sans-serif" },
];

const STYLE_PREVIEW_TEMPLATE: Record<VisualStyle, TemplateId> = {
  moderno:     "main_service",
  elegante:    "whatsapp_cta",
  clean:       "authority",
  chamativo:   "promotion",
  minimalista: "location",
};

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
  const [textColor,     setTextColor]     = useState<string>("#ffffff");
  const [previewBgUrl, setPreviewBgUrl]         = useState<string | undefined>();
  const [previewImagePosY, setPreviewImagePosY] = useState(50);
  const [previewTemplate, setPreviewTemplate]   = useState<TemplateId>("main_service");

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

  const planPostsLimit    = planName === "pro" ? 15 : 5;
  const planCaptionsLimit = planName === "pro" ? 15 : 5;
  const planMessagesLimit = planName === "pro" ? 15 : 5;
  const basePostsLimit    = Math.min(localMonthlyContent?.posts_limit    ?? planPostsLimit,    planPostsLimit);
  const baseCaptionsLimit = Math.min(localMonthlyContent?.captions_limit ?? planCaptionsLimit, planCaptionsLimit);
  const baseMessagesLimit = Math.min(localMonthlyContent?.messages_limit ?? planMessagesLimit, planMessagesLimit);

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

  const tabs: { id: TabId; label: string }[] = [
    { id: "inicio",     label: "Início"      },
    { id: "gerador",    label: "Gerador"     },
    { id: "posts",      label: `Posts (${monthlyPosts.length}/${postsLimit})` },
    { id: "calendario", label: "Calendário"  },
    { id: "campanhas",  label: "Campanhas"   },
    { id: "mensagens",  label: "Mensagens"   },
    { id: "extras",     label: `Extras${activeExtras.length > 0 ? ` (${activeExtras.length})` : ""}` },
    { id: "leads",      label: `Leads (${leads.length})` },
    { id: "aparencia",  label: "Aparência"   },
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Olá, {displayName}!</h1>
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
        <div className="relative mb-6">
          <div className="flex gap-1 overflow-x-auto pb-2 border-b border-gray-100 dark:border-gray-800 scrollbar-hide scroll-smooth">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${activeTab === tab.id ? "bg-violet-600 text-white shadow" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                {tab.label}
              </button>
            ))}
          </div>
          {/* Fade direita — indica mais conteúdo na scroll */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-white dark:from-gray-950 to-transparent" />
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
                <a href={`/site/${kit.site_slug}`} target="_blank" className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900 transition">Abrir site</a>
                <button onClick={() => copy(siteUrl, "site")} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition">{copied === "site" ? "Copiado!" : "Copiar link"}</button>
                <a href={buildWhatsAppLink(business.whatsapp, `Estou enviando o link do meu site: ${siteUrl}`)} target="_blank" className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-green-100 transition">Compartilhar</a>
                <Link href="/editar-site" className="flex items-center gap-1.5 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900 transition border border-violet-200 dark:border-violet-800">Editar site</Link>
              </div>
            </div>

            {/* Gerador Magnético destaque */}
            <Link href="/gerador-magnetico" className="block rounded-2xl p-5 hover:opacity-95 transition shadow-lg" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1 text-white/90 text-xs font-bold mb-2">Novo</div>
                  <h2 className="text-xl font-extrabold text-white mb-1">Gerador de Conteúdos Magnéticos</h2>
                  <p className="text-white/75 text-sm leading-relaxed">Crie posts, Reels, Stories, carrosséis e mensagens em segundos.</p>
                </div>
                <div className="text-4xl opacity-80 flex-shrink-0 ml-4">→</div>
              </div>
            </Link>

            {/* Links rápidos */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/editar-site" className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-violet-200 transition shadow-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-0.5">Mini site</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Editar site</p>
                </div>
              </Link>
              <Link href="/gerar-post-hoje" className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-violet-200 transition shadow-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-0.5">Post de hoje</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Gerar agora</p>
                </div>
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
                {hasMonthlyContent && <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-700">Gerado</span>}
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
                  <button onClick={() => setActiveTab("posts")} className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-indigo-100 transition">Ver posts</button>
                  <button onClick={() => setActiveTab("mensagens")} className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-green-100 transition">Ver mensagens</button>
                  {isPro && <button onClick={() => setActiveTab("campanhas")} className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-purple-100 transition">Ver campanhas</button>}
                </div>
              ) : (
                <div className="space-y-3">
                  {contentError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{contentError}</p>}
                  <button onClick={generateMonthlyContent} disabled={generatingContent} className="w-full gradient-brand text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-60 text-sm">
                    {generatingContent ? "Gerando seus conteúdos…" : `Gerar conteúdos de ${monthLabel}`}
                  </button>
                  <p className="text-xs text-gray-400 text-center">{postsLimit} posts · {captionsLimit} legendas · {messagesLimit} mensagens disponíveis</p>
                </div>
              )}
            </div>

            {/* Leads resumo */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900 dark:text-white">Leads recebidos</h2>
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
                      <a href={buildWhatsAppLink(lead.whatsapp, `Olá ${lead.name}! Vi que você se cadastrou no nosso site.`)} target="_blank" className="text-xs font-bold text-green-600 hover:underline">Chamar</a>
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

            {isPro ? (
              <>
                <Link href="/gerador-magnetico" className="flex items-center justify-between rounded-2xl p-6 hover:opacity-95 transition shadow-lg" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)" }}>
                  <div>
                    <h3 className="text-lg font-extrabold text-white mb-1">Abrir Gerador Magnético</h3>
                    <p className="text-white/75 text-sm">Tema → Narrativa → Headline → Formato → Resultado</p>
                  </div>
                  <span className="text-3xl text-white/80">→</span>
                </Link>
                <Link href="/gerar-post-hoje" className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:border-violet-200 transition shadow-sm">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white mb-0.5">Gerar post de hoje</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Escolha um objetivo e receba post + legenda + mensagem WhatsApp</p>
                  </div>
                  <span className="text-gray-400 text-lg">→</span>
                </Link>
              </>
            ) : (
              <div className="rounded-2xl overflow-hidden border border-violet-200 dark:border-violet-800">
                {/* Preview bloqueado */}
                <div className="rounded-xl overflow-hidden select-none" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)" }}>
                  <div className="flex flex-col items-center justify-center gap-3 py-8 px-6 text-center">
                    <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-extrabold text-base mb-1">Exclusivo do Plano Pro</p>
                      <p className="text-white/65 text-sm leading-relaxed">Gere roteiros para Reels, Carrosséis, Stories e Narrativas Magnéticas.</p>
                    </div>
                  </div>
                </div>
                {/* Features Pro */}
                <div className="bg-violet-50 dark:bg-violet-950 p-5">
                  <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-3">O que você ganha no Pro</p>
                  <ul className="space-y-2 text-sm text-violet-700 dark:text-violet-300 mb-5">
                    {["Roteiro completo para Reels (30, 60 e 90s)","Sequência de Stories com CTA","Carrosséis com headline + lâminas","Narrativas Magnéticas por tema","15 posts · 15 legendas · 15 mensagens","Campanhas e mensagens de reativação"].map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="text-violet-400 mt-0.5 flex-shrink-0">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={process.env.NEXT_PUBLIC_CHECKOUT_URL_PRO ?? "https://pay.kiwify.com.br/1fAPOyu"}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 gradient-brand text-white font-extrabold py-3.5 rounded-xl text-sm hover:opacity-90 transition w-full"
                  >
                    Fazer upgrade para Pro — R$ 57/mês →
                  </a>
                </div>
              </div>
            )}
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
                Gerar post de hoje
              </Link>
            </div>

            {!hasMonthlyContent ? (
              <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
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
                      unlocked={post.is_unlocked !== false}
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
                            Editar
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
                        {copied === `cal-${week}-${i}` ? "Copiado" : "Copiar"}
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
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Disponível no plano Pro</h3>
                <p className="text-sm text-gray-500 mb-4">Campanhas prontas fazem parte do plano Pro (R$ 57/mês).</p>
                <a href={process.env.NEXT_PUBLIC_CHECKOUT_URL_PRO ?? "#"} className="inline-block gradient-brand text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:opacity-90 transition">Fazer upgrade para Pro →</a>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-3">
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
                        {copied === `wa-msg-${i}` ? "Copiado" : "Copiar"}
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
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{msg.situation}</p>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{msg.message}</p>
                        <button onClick={() => copy(msg.message, `rec-${msg.id}`)} className="flex-shrink-0 text-violet-600 text-sm font-semibold hover:underline">
                          {copied === `rec-${msg.id}` ? "Copiado" : "Copiar"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                { slug: "instagram-extra", icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>), title: "Pacote Instagram Extra", price: "R$ 12", tagline: "Mais posts para movimentar o Instagram do seu negócio.", benefits: ["20 posts extras para movimentar seu Instagram","20 legendas extras personalizadas","Posts com CTA para WhatsApp","Adaptados ao seu nicho","Salvos no painel"], checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_INSTAGRAM_EXTRA ?? "#", cta: "Adicionar posts extras", active: hasInstagramExtra },
                { slug: "stories", icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/></svg>), title: "Pacote Stories", price: "R$ 14", tagline: "Stories prontos para divulgar promoções, avisos e chamadas rápidas.", benefits: ["20 stories prontos para divulgar promoções e avisos","Chamadas rápidas para WhatsApp","Avisos de agenda aberta","Enquetes e perguntas simples","Adaptados ao seu nicho"], checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_STORIES ?? "#", cta: "Adicionar stories", active: hasStories },
                { slug: "reativacao", icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>), title: "Reativação de Clientes", price: "R$ 9,90", tagline: "Mensagens para trazer clientes de volta ao seu negócio.", benefits: ["50 mensagens para trazer clientes de volta","Para clientes antigos e orçamentos que sumiram","Mensagens de pós-venda e avaliação","Chamadas para agenda aberta","Adaptadas ao seu nicho"], checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_REATIVACAO ?? "#", cta: "Adicionar mensagens de reativação", active: hasReativacao },
              ].map((pkg) => (
                <div key={pkg.slug} className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 flex flex-col ${pkg.active ? "border-green-200 dark:border-green-900 opacity-60" : "border-gray-200 dark:border-gray-700 hover:border-violet-200 hover:shadow-sm transition"}`}>
                  <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">{pkg.icon}</div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-sm mb-0.5">{pkg.title}</h3>
                  <p className="text-xl font-extrabold text-violet-700 mb-1">{pkg.price}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{pkg.tagline}</p>
                  <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 flex-1 mb-4">
                    {pkg.benefits.map((b) => <li key={b} className="flex items-center gap-1.5"><span className="text-violet-400">✓</span> {b}</li>)}
                  </ul>
                  {pkg.active ? <div className="text-center py-2 text-sm text-green-600 font-bold">Já adicionado</div> : <a href={pkg.checkoutUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 gradient-brand text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition text-xs">{pkg.cta} →</a>}
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
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Nenhum lead ainda</h3>
                <p className="text-sm text-gray-500 mb-4">Compartilhe o link do seu site no Instagram, WhatsApp e Google.</p>
                <button onClick={() => copy(siteUrl, "site-leads")} className="inline-block gradient-brand text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:opacity-90 transition">{copied === "site-leads" ? "Copiado!" : "Copiar link do site"}</button>
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
                    <a href={buildWhatsAppLink(lead.whatsapp, `Olá ${lead.name}! Vi que você se cadastrou no site da ${business.business_name}.`)} target="_blank" className="flex items-center gap-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 font-bold text-sm px-4 py-2 rounded-xl hover:bg-green-100 transition">Chamar</a>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Aparência do mini site</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Edite cores, fonte, imagens e conteúdo do seu site.</p>
            </div>

            <Link href="/editar-site" className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:border-violet-300 hover:shadow-sm transition shadow-sm mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Editar mini site</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Cor, fonte, imagens, serviços, horários, depoimentos e mais</p>
                </div>
              </div>
              <span className="text-gray-400 text-lg">→</span>
            </Link>

            <a href={`/site/${kit.site_slug}`} target="_blank" className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950 rounded-2xl border border-indigo-100 dark:border-indigo-900 p-5 hover:border-indigo-300 transition">
              <div>
                <p className="font-bold text-indigo-800 dark:text-indigo-200">Ver site ao vivo</p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono truncate max-w-xs">/site/{kit.site_slug}</p>
              </div>
              <span className="text-indigo-500 text-lg">↗</span>
            </a>

            {/* Bloco antigo (oculto) — mantido apenas para preservar os estados */}
            <div className="hidden">

            <div className="grid md:grid-cols-5 gap-6">
              {/* ── Controles (esquerda, 2 cols) ── */}
              <div className="md:col-span-2 space-y-5">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-5">

                  {/* Cor principal */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Cor principal</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {COLOR_PRESETS.map((c) => (
                        <button key={c.value} onClick={() => setPrimaryColor(c.value)} className={`w-8 h-8 rounded-lg transition border-2 hover:scale-110 ${primaryColor === c.value ? "border-gray-800 dark:border-white scale-110" : "border-transparent"}`} style={{ background: c.value }} title={c.label} />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{primaryColor}</span>
                    </div>
                  </div>

                  {/* Cor secundária */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Cor secundária</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={secondaryColor} onChange={(e) => setSecondary(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{secondaryColor}</span>
                    </div>
                  </div>

                  {/* Cor do texto nos posts */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Cor do texto (posts)</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {["#ffffff","#f0f0f0","#111111","#333333","#ffdd57","#f97316","#22d3ee"].map((c) => (
                        <button key={c} onClick={() => setTextColor(c)} className={`w-8 h-8 rounded-lg border-2 transition hover:scale-110 ${textColor === c ? "border-gray-800 dark:border-white scale-110" : "border-gray-200 dark:border-gray-600"}`} style={{ background: c }} />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{textColor}</span>
                    </div>
                  </div>

                  {/* Fonte */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Fonte</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {FONT_STYLES.map((f) => (
                        <button key={f.id} onClick={() => setSelectedFont(f.id)} className={`border-2 rounded-xl px-2 py-2.5 text-left transition ${selectedFont === f.id ? "border-violet-500 bg-violet-50 dark:bg-violet-950" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}>
                          <p className="font-bold text-gray-800 dark:text-gray-200 text-base leading-none mb-0.5" style={{ fontFamily: f.css }}>{f.sample}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{f.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Estilo visual */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Estilo visual</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {VISUAL_STYLES.map((style) => (
                        <button key={style.id} onClick={() => setSelectedStyle(style.id)} className={`border-2 rounded-xl p-2.5 text-left transition ${selectedStyle === style.id ? "border-violet-500 bg-violet-50 dark:bg-violet-950" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}>
                          <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">{style.label}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{style.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Template selecionado para preview */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Template do preview</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["main_service","whatsapp_cta","promotion","foto_fundo","strong_cta","depoimento"] as TemplateId[]).map((t) => (
                        <button key={t} onClick={() => setPreviewTemplate(t)} className={`py-1.5 px-1 text-[10px] font-semibold rounded-lg border transition text-center ${previewTemplate === t ? "border-violet-500 bg-violet-50 dark:bg-violet-950 text-violet-700" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-violet-300"}`}>
                          {t === "main_service" ? "Serviço" : t === "whatsapp_cta" ? "WhatsApp" : t === "promotion" ? "Promoção" : t === "foto_fundo" ? "Foto" : t === "strong_cta" ? "CTA" : "Depoimento"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Imagem de fundo no preview */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Foto de fundo (preview)</label>
                    <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition mb-2">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Carregar foto</p>
                        <p className="text-[10px] text-gray-400">JPG, PNG, WEBP</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { if (ev.target?.result) setPreviewBgUrl(ev.target.result as string); }; reader.readAsDataURL(file); e.target.value = ""; }} />
                    </label>
                    {galleryImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-1.5 mb-2">
                        <button onClick={() => setPreviewBgUrl(undefined)} className={`aspect-square rounded-lg border-2 flex items-center justify-center text-[10px] font-semibold transition ${!previewBgUrl ? "border-violet-500 bg-violet-50 dark:bg-violet-950 text-violet-600" : "border-gray-200 dark:border-gray-700 text-gray-400"}`}>Sem</button>
                        {galleryImages.slice(0, 7).map((img) => (
                          <button key={img.id} onClick={() => setPreviewBgUrl(img.image_url)} className={`aspect-square rounded-lg overflow-hidden border-2 transition ${previewBgUrl === img.image_url ? "border-violet-500" : "border-transparent hover:border-violet-300"}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                    {previewBgUrl && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-gray-500">Posição</span>
                          <span className="text-[10px] text-violet-500 font-bold">{previewImagePosY}%</span>
                        </div>
                        <input type="range" min="0" max="100" step="1" value={previewImagePosY} onChange={(e) => setPreviewImagePosY(Number(e.target.value))} className="w-full accent-violet-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick site config */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Mini site</p>
                  <p className="text-xs text-gray-400 mb-4">Configure links, imagens e informações do site no editor completo.</p>
                  <Link href="/editar-site" className="flex items-center justify-between w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-violet-400 hover:text-violet-600 transition">
                    <span>Editar mini site</span>
                    <span className="text-gray-400">→</span>
                  </Link>
                  <p className="text-[10px] text-gray-400 mt-2">Links, serviços, imagens, logo, horários e avaliações</p>
                </div>

                {/* Salvar */}
                <button onClick={saveAppearance} disabled={savingAppearance} className="w-full gradient-brand text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-60 text-sm">
                  {savingAppearance ? "Salvando…" : appearanceSaved ? "Aparência salva!" : "Salvar aparência"}
                </button>
              </div>

              {/* ── Preview (direita, 3 cols) ── */}
              <div className="md:col-span-3 space-y-5">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Preview</p>

                {/* Mini site preview — completo, largo */}
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Mini site</p>
                  <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div style={{ background: `linear-gradient(135deg, ${primaryColor}f0 0%, ${secondaryColor}cc 100%)`, padding: "20px" }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 18, flexShrink: 0 }}>
                          {business.business_name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-extrabold text-sm leading-tight">{business.business_name}</p>
                          <p className="text-white/60 text-xs">{business.city} · {business.niche}</p>
                        </div>
                      </div>
                      <div style={{ background: "#25D366", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>Chamar no WhatsApp</span>
                      </div>
                    </div>
                    {/* Serviços */}
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p style={{ fontSize: 9, fontWeight: 800, color: primaryColor, letterSpacing: "0.18em", textTransform: "uppercase" as const, marginBottom: 8 }}>Serviços</p>
                      {((business as any).services_json ?? (business as any).services ?? [business.main_service]).slice(0, 3).map((svc: string, i: number) => (
                        <div key={i} style={{ background: `${primaryColor}10`, border: `1px solid ${primaryColor}30`, borderRadius: 8, padding: "7px 12px", marginBottom: 6 }}>
                          <p style={{ fontSize: 12, fontWeight: 700 }} className="text-gray-900 dark:text-white">{svc}</p>
                        </div>
                      ))}
                    </div>
                    {/* Links */}
                    <div className="bg-white dark:bg-gray-800 px-4 py-3">
                      <p style={{ fontSize: 9, fontWeight: 800, color: primaryColor, letterSpacing: "0.18em", textTransform: "uppercase" as const, marginBottom: 8 }}>Links</p>
                      <div className="flex gap-2">
                        {["WhatsApp","Localização","Instagram"].map((l) => (
                          <div key={l} style={{ flex: 1, background: secondaryColor + "18", border: `1px solid ${secondaryColor}35`, borderRadius: 8, padding: "7px 0", textAlign: "center" as const }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: primaryColor }}>{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posts preview — 2 lado a lado, tamanho maior */}
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Posts</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1.5">{FONT_STYLES.find(f => f.id === selectedFont)?.label} · {VISUAL_STYLES.find(s => s.id === selectedStyle)?.label}</p>
                      <PostCard
                        template_type={previewTemplate}
                        title={business.business_name}
                        subtitle={business.main_service}
                        cta="Fale no WhatsApp"
                        business_name={business.business_name}
                        primary_color={primaryColor}
                        secondaryColor={secondaryColor}
                        niche={business.niche}
                        city={business.city}
                        fontFamily={FONT_STYLES.find(f => f.id === selectedFont)?.css}
                        backgroundImageUrl={previewBgUrl}
                        imagePositionY={previewImagePosY}
                        textColor={textColor}
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1.5">Promoção (gradiente)</p>
                      <PostCard
                        template_type="promotion"
                        title="Oferta especial"
                        subtitle={`Para novos clientes em ${business.city}`}
                        cta="Aproveitar agora"
                        business_name={business.business_name}
                        primary_color={primaryColor}
                        secondaryColor={secondaryColor}
                        fontFamily={FONT_STYLES.find(f => f.id === selectedFont)?.css}
                        textColor={textColor}
                      />
                    </div>
                  </div>
                </div>

                {/* Preview com foto — quando tiver imagem */}
                {previewBgUrl && (
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1.5">Com sua foto</p>
                    <div className="max-w-[280px]">
                      <PostCard
                        template_type="foto_fundo"
                        title={business.business_name}
                        subtitle={business.main_service}
                        cta="Fale no WhatsApp"
                        business_name={business.business_name}
                        primary_color={primaryColor}
                        secondaryColor={secondaryColor}
                        fontFamily={FONT_STYLES.find(f => f.id === selectedFont)?.css}
                        backgroundImageUrl={previewBgUrl}
                        imagePositionY={previewImagePosY}
                        textColor={textColor}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>{/* fecha hidden */}
          </div>
        )}

        {/* Rodapé */}
        <div className="mt-10 border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            MeuNegócio Pro · Plano <span className="font-bold text-violet-500">{planLabel}</span>
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-600">
            <Link href="/suporte" className="hover:text-violet-500 transition">Suporte</Link>
            <a href={`/site/${kit.site_slug}`} target="_blank" className="hover:text-violet-500 transition">Ver meu site</a>
            <Link href="/editar-site" className="hover:text-violet-500 transition">Editar site</Link>
          </div>
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
          {copied === copyKey ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
