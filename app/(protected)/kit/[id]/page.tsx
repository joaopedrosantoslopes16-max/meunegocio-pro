"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getReleaseStage, getUnlockedPostCount, getUnlockedCaptionCount, getUnlockedWhatsAppCount } from "@/lib/release-schedule";
import { buildWhatsAppLink } from "@/lib/whatsapp-utils";
import PostCard from "@/components/PostCard";
import type { Kit, Business, Post } from "@/types";

type TabId = "posts" | "legendas" | "whatsapp" | "site" | "download";

export default function KitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabId) ?? "posts";

  const [kit, setKit] = useState<Kit | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("kits")
        .select("*, businesses(*)")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (data) {
        setKit(data);
        setBusiness(data.businesses);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function logAction(action: string, meta?: Record<string, unknown>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !kit) return;
    await supabase.from("access_logs").insert({
      user_id: user.id,
      kit_id: kit.id,
      purchase_id: kit.purchase_id,
      action,
      metadata: meta ?? {},
    });
  }

  function copy(text: string, key: string, action: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    logAction(action, { key });
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400">Carregando...</div>
    </div>
  );

  if (!kit || !business) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500">Kit não encontrado.</p>
        <Link href="/dashboard" className="text-indigo-600 hover:underline mt-2 inline-block">Voltar ao dashboard</Link>
      </div>
    </div>
  );

  const stage = getReleaseStage(kit.purchase_approved_at);
  const unlockedPosts = getUnlockedPostCount(stage);
  const unlockedCaptions = getUnlockedCaptionCount(stage);
  const unlockedWA = getUnlockedWhatsAppCount(stage);
  const siteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/site/${kit.site_slug}`;

  const tabs: { id: TabId; label: string }[] = [
    { id: "posts", label: `📸 Posts (${unlockedPosts}/30)` },
    { id: "legendas", label: `✍️ Legendas` },
    { id: "whatsapp", label: `💬 WhatsApp` },
    { id: "site", label: `🌐 Mini site` },
    ...(stage >= 3 ? [{ id: "download" as TabId, label: `⬇️ Baixar tudo` }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-bold text-lg text-gradient">MeuNegócio Pro</Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-indigo-600 transition">← Dashboard</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{business.business_name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{business.niche} • {business.city}</p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/kit/${id}?tab=${tab.id}`}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "gradient-brand text-white shadow"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* POSTS TAB */}
        {activeTab === "posts" && (
          <div>
            <p className="text-sm text-gray-500 mb-6">{unlockedPosts} posts liberados. {30 - unlockedPosts > 0 && `Faltam ${30 - unlockedPosts} para liberar.`}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(kit.posts_json as Post[]).map((post, i) => {
                const unlocked = i < unlockedPosts;
                return (
                  <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                    <PostCard
                      template_type={post.template_type}
                      title={post.title}
                      subtitle={post.subtitle}
                      cta={post.cta}
                      business_name={business.business_name}
                      primary_color={business.primary_color ?? "#7c3aed"}
                      niche={business.niche}
                      city={business.city}
                      number={i + 1}
                      unlocked={unlocked}
                      compact
                    />
                    <div className="bg-white px-3 py-2 flex items-center justify-between">
                      <p className="text-xs text-gray-400">Post #{i + 1}</p>
                      {unlocked && (
                        <button
                          onClick={() => { navigator.clipboard.writeText((kit.captions_json as string[])[i] ?? ""); logAction("copy_caption", { post: i + 1 }); }}
                          className="text-xs text-indigo-500 font-semibold hover:underline"
                        >
                          Copiar legenda
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LEGENDAS TAB */}
        {activeTab === "legendas" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">{unlockedCaptions} legendas liberadas.</p>
            {(kit.captions_json as string[]).slice(0, unlockedCaptions).map((caption, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Legenda #{i + 1}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{caption}</p>
                  </div>
                  <button
                    onClick={() => copy(caption, `caption-${i}`, "copy_caption")}
                    className="flex-shrink-0 text-indigo-600 text-sm font-semibold hover:underline"
                  >
                    {copied === `caption-${i}` ? "✅ Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>
            ))}
            {unlockedCaptions < 30 && (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center">
                <p className="text-gray-500 text-sm">Mais {30 - unlockedCaptions} legendas serão liberadas nas próximas etapas.</p>
              </div>
            )}
          </div>
        )}

        {/* WHATSAPP TAB */}
        {activeTab === "whatsapp" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">{unlockedWA} mensagens liberadas.</p>
            {(kit.whatsapp_messages_json as string[]).slice(0, unlockedWA).map((msg, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Mensagem #{i + 1}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{msg}</p>
                  </div>
                  <button
                    onClick={() => copy(msg, `wa-${i}`, "copy_whatsapp_message")}
                    className="flex-shrink-0 text-green-600 text-sm font-semibold hover:underline"
                  >
                    {copied === `wa-${i}` ? "✅ Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SITE TAB */}
        {activeTab === "site" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-1">Link do seu mini site</h2>
              <p className="text-sm text-gray-500 mb-4">Coloque este link na bio do Instagram, Google Meu Negócio e no WhatsApp.</p>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-sm font-mono text-gray-700 flex-1 truncate">{siteUrl}</span>
                <button onClick={() => { copy(siteUrl, "site-link", "copy_site_link"); logAction("copy_site_link"); }} className="text-indigo-600 font-semibold text-sm">
                  {copied === "site-link" ? "✅ Copiado!" : "Copiar"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Bio do Instagram</h2>
              <pre className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 whitespace-pre-wrap font-sans">{kit.instagram_bio}</pre>
              <button onClick={() => copy(kit.instagram_bio, "bio", "copy_caption")} className="mt-3 text-indigo-600 font-semibold text-sm">
                {copied === "bio" ? "✅ Copiado!" : "Copiar bio"}
              </button>
            </div>

            <a
              href={`/site/${kit.site_slug}`}
              target="_blank"
              onClick={() => logAction("open_site")}
              className="block w-full text-center gradient-brand text-white font-bold py-4 rounded-2xl hover:opacity-90 transition"
            >
              🌐 Abrir mini site
            </a>
          </div>
        )}

        {/* DOWNLOAD TAB */}
        {activeTab === "download" && stage >= 3 && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Kit completo liberado!</h2>
              <p className="text-gray-600 text-sm">Você pode agora baixar todos os seus posts e acessar todos os materiais.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-gray-600 text-sm mb-4">Para baixar os posts como imagem PNG: abra cada post, clique com o botão direito e salve como imagem. Em breve adicionaremos o botão de download automático.</p>
              <button
                onClick={() => logAction("download_all")}
                className="w-full gradient-brand text-white font-bold py-4 rounded-xl hover:opacity-90 transition"
              >
                ⬇️ Baixar todos os posts (em breve)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
