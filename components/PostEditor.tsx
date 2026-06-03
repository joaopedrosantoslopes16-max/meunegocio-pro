"use client";

import { useState, useRef } from "react";
import PostCard, { type TemplateId } from "@/components/PostCard";
import type { Business, ImageGallery } from "@/types";

const TEMPLATES: { id: TemplateId; label: string; icon: string; dark?: boolean }[] = [
  { id: "main_service",   label: "Serviço",    icon: "⭐", dark: true  },
  { id: "whatsapp_cta",   label: "WhatsApp",   icon: "💬", dark: true  },
  { id: "promotion",      label: "Promoção",   icon: "⚡", dark: true  },
  { id: "authority",      label: "Dica",       icon: "💡"              },
  { id: "location",       label: "Localização",icon: "📍", dark: true  },
  { id: "oferta",         label: "Oferta",     icon: "🏷️", dark: true  },
  { id: "agenda",         label: "Agenda",     icon: "📅", dark: true  },
  { id: "depoimento",     label: "Depoimento", icon: "🌟"              },
  { id: "strong_cta",     label: "CTA forte",  icon: "🚀", dark: true  },
  { id: "foto_fundo",     label: "Foto fundo", icon: "🖼️", dark: true  },
  { id: "foto_lado",      label: "Foto lado",  icon: "📐"              },
  { id: "card_sobre_foto",label: "Card foto",  icon: "🃏"              },
];

const COLOR_PRESETS = [
  "#7c3aed","#6366f1","#2563eb","#0891b2","#16a34a",
  "#d97706","#dc2626","#db2777","#9333ea","#111827","#059669","#ea580c",
];

const FONT_OPTIONS = [
  { id: "inter",      label: "Moderna (Inter)",     css: "'Inter', sans-serif" },
  { id: "poppins",    label: "Elegante (Poppins)",  css: "'Poppins', sans-serif" },
  { id: "montserrat", label: "Forte (Montserrat)",  css: "'Montserrat', sans-serif" },
  { id: "opensans",   label: "Limpa (Open Sans)",   css: "'Open Sans', sans-serif" },
  { id: "nunito",     label: "Amigável (Nunito)",   css: "'Nunito', sans-serif" },
];

const OVERLAY_OPTIONS = [
  { label: "Leve (30%)",    value: 0.30 },
  { label: "Médio (55%)",   value: 0.55 },
  { label: "Escuro (75%)",  value: 0.75 },
  { label: "Muito (88%)",   value: 0.88 },
];

export interface EditedPost {
  title: string;
  subtitle: string;
  cta: string;
  template_type: TemplateId;
  primary_color: string;
  backgroundImageUrl?: string;
  overlayOpacity: number;
}

interface Props {
  initialTitle?: string;
  initialSubtitle?: string;
  initialCta?: string;
  initialTemplate?: TemplateId;
  business: Business;
  images?: ImageGallery[];
  onSave?: (post: EditedPost) => void;
  onClose: () => void;
}

export default function PostEditor({
  initialTitle = "",
  initialSubtitle = "",
  initialCta = "Fale no WhatsApp",
  initialTemplate = "main_service",
  business,
  images = [],
  onSave,
  onClose,
}: Props) {
  const [title,        setTitle]        = useState(initialTitle);
  const [subtitle,     setSubtitle]     = useState(initialSubtitle);
  const [cta,          setCta]          = useState(initialCta);
  const [template,     setTemplate]     = useState<TemplateId>(initialTemplate);
  const [color,        setColor]        = useState(business.primary_color ?? "#7c3aed");
  const [bgImageUrl,   setBgImageUrl]   = useState<string | undefined>();
  const [overlayOp,    setOverlayOp]    = useState(0.55);
  const [activeTab,    setActiveTab]    = useState<"texto" | "estilo" | "imagem">("texto");
  const [saved,        setSaved]        = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const postImages = images.filter((img) => ["post", "cover", "general", "professional"].includes(img.image_type));

  async function downloadPNG() {
    if (!previewRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `post-${business.business_name.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("Erro ao baixar. Tente novamente.");
    }
  }

  function handleSave() {
    const post: EditedPost = { title, subtitle, cta, template_type: template, primary_color: color, backgroundImageUrl: bgImageUrl, overlayOpacity: overlayOp };
    onSave?.(post);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[96vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-extrabold text-gray-900 dark:text-white">✏️ Editar post</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm">✕</button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

          {/* ── PAINEL DE EDIÇÃO ── */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col overflow-y-auto">

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 px-4 pt-3">
              {(["texto", "estilo", "imagem"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 text-xs font-bold pb-2.5 border-b-2 capitalize transition ${activeTab === tab ? "border-violet-600 text-violet-600" : "border-transparent text-gray-400"}`}>
                  {tab === "texto" ? "📝 Texto" : tab === "estilo" ? "🎨 Estilo" : "🖼️ Imagem"}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-4 flex-1">

              {/* ── TEXTO ── */}
              {activeTab === "texto" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Título principal</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                      placeholder="Ex: Corte masculino + barba"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Subtítulo</label>
                    <textarea
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                      placeholder="Subtítulo ou descrição curta"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Botão / CTA</label>
                    <input
                      value={cta}
                      onChange={(e) => setCta(e.target.value)}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                      placeholder="Ex: Agende pelo WhatsApp"
                    />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-xs text-gray-500 dark:text-gray-400">
                    <p className="font-semibold mb-1.5">Sugestões de CTA</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Fale no WhatsApp","Agende agora","Ver mais","Garanta já","Saiba mais","Chame a gente"].map((s) => (
                        <button key={s} onClick={() => setCta(s)} className="text-[10px] px-2 py-1 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-violet-300 hover:text-violet-600 transition">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── ESTILO ── */}
              {activeTab === "estilo" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Template</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTemplate(t.id)}
                          className={`flex flex-col items-center py-2 px-1 rounded-xl border text-center transition text-xs ${template === t.id ? "border-violet-500 bg-violet-50 dark:bg-violet-950 text-violet-700" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-300"}`}
                        >
                          <span className="text-base mb-0.5">{t.icon}</span>
                          <span className="font-semibold leading-tight">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Cor principal</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {COLOR_PRESETS.map((c) => (
                        <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-lg border-2 transition hover:scale-110 ${color === c ? "border-gray-800 dark:border-white scale-110" : "border-transparent"}`} style={{ background: c }} />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{color}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── IMAGEM ── */}
              {activeTab === "imagem" && (
                <div className="space-y-4">
                  {/* Imagem de fundo */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Imagem de fundo</label>

                    {bgImageUrl && (
                      <div className="mb-3 relative rounded-xl overflow-hidden aspect-video">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={bgImageUrl} alt="Fundo" className="w-full h-full object-cover" />
                        <button onClick={() => setBgImageUrl(undefined)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition">✕</button>
                      </div>
                    )}

                    {postImages.length > 0 ? (
                      <div>
                        <p className="text-xs text-gray-400 mb-2">Selecione da galeria:</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {postImages.map((img) => (
                            <button
                              key={img.id}
                              onClick={() => setBgImageUrl(img.image_url)}
                              className={`aspect-square rounded-xl overflow-hidden border-2 transition hover:scale-105 ${bgImageUrl === img.image_url ? "border-violet-500 scale-105" : "border-transparent"}`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <p className="text-sm text-gray-400 mb-2">Nenhuma imagem na galeria ainda</p>
                        <a href="/galeria" className="text-xs font-bold text-violet-600 hover:underline">Ir para galeria →</a>
                      </div>
                    )}
                  </div>

                  {/* Opacidade do overlay */}
                  {bgImageUrl && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Escurecimento do fundo</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {OVERLAY_OPTIONS.map((o) => (
                          <button
                            key={o.value}
                            onClick={() => setOverlayOp(o.value)}
                            className={`text-xs py-2 rounded-xl border font-medium transition ${overlayOp === o.value ? "border-violet-500 bg-violet-50 dark:bg-violet-950 text-violet-700" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"}`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2">
                        <input
                          type="range" min="0" max="1" step="0.05"
                          value={overlayOp}
                          onChange={(e) => setOverlayOp(Number(e.target.value))}
                          className="w-full accent-violet-600"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                          <span>Transparente</span>
                          <span>Escuro</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── PREVIEW ── */}
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6 overflow-auto">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">Preview em tempo real</p>

            <div ref={previewRef} className="w-full max-w-[360px]">
              <PostCard
                template_type={template}
                title={title || "Título do post"}
                subtitle={subtitle || "Subtítulo com mais informações sobre o serviço"}
                cta={cta}
                business_name={business.business_name}
                primary_color={color}
                niche={business.niche}
                city={business.city}
                backgroundImageUrl={bgImageUrl}
                overlayOpacity={overlayOp}
              />
            </div>

            <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-4">
              {TEMPLATES.find((t) => t.id === template)?.label} · {color}
              {bgImageUrl ? " · Com imagem de fundo" : ""}
            </p>
          </div>
        </div>

        {/* Footer ações */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-wrap">
          <button onClick={handleSave} className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${saved ? "bg-green-100 text-green-700" : "gradient-brand text-white hover:opacity-90"}`}>
            {saved ? "✅ Salvo!" : "💾 Salvar post"}
          </button>
          <button onClick={downloadPNG} className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            ⬇️ Baixar PNG
          </button>
          <button onClick={onClose} className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
