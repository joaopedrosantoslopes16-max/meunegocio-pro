"use client";

import { useState, useRef } from "react";
import PostCard, { type TemplateId } from "@/components/PostCard";
import type { Business, ImageGallery } from "@/types";

const TEMPLATES: { id: TemplateId; label: string; dark?: boolean }[] = [
  { id: "main_service",    label: "Serviço",     dark: true },
  { id: "whatsapp_cta",    label: "WhatsApp",    dark: true },
  { id: "promotion",       label: "Promoção",    dark: true },
  { id: "authority",       label: "Dica"                   },
  { id: "location",        label: "Localização", dark: true },
  { id: "oferta",          label: "Oferta",      dark: true },
  { id: "agenda",          label: "Agenda",      dark: true },
  { id: "depoimento",      label: "Depoimento"             },
  { id: "strong_cta",      label: "CTA forte",   dark: true },
  { id: "foto_fundo",      label: "Foto fundo",  dark: true },
  { id: "foto_lado",       label: "Foto lado"              },
  { id: "card_sobre_foto", label: "Card foto"              },
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

const FORMAT_SIZES: {
  id: "1/1" | "4/5" | "9/16" | "16/9";
  label: string;
  desc: string;
  w: number; h: number; // proporção visual do botão
}[] = [
  { id: "1/1",  label: "Quadrado", desc: "1080×1080",  w: 1,    h: 1    },
  { id: "4/5",  label: "Retrato",  desc: "1080×1350",  w: 4,    h: 5    },
  { id: "9/16", label: "Stories",  desc: "1080×1920",  w: 9,    h: 16   },
  { id: "16/9", label: "Paisagem", desc: "1920×1080",  w: 16,   h: 9    },
];

export interface EditedPost {
  title: string;
  subtitle: string;
  cta: string;
  template_type: TemplateId;
  primary_color: string;
  textColor: string;
  fontStyle: string;
  backgroundImageUrl?: string;
  overlayOpacity: number;
  imagePositionY: number;
  postFormat: "1/1" | "4/5" | "9/16" | "16/9";
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
  const [textColor,    setTextColor]    = useState("#ffffff");
  const [fontStyle,    setFontStyle]    = useState((business as any).font_style ?? "inter");
  const [bgImageUrl,   setBgImageUrl]   = useState<string | undefined>();
  const [overlayOp,    setOverlayOp]    = useState(0.55);
  const [imagePosY,    setImagePosY]    = useState(50);
  const [postFormat,   setPostFormat]   = useState<"1/1" | "4/5" | "9/16" | "16/9">("1/1");
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
    const post: EditedPost = { title, subtitle, cta, template_type: template, primary_color: color, textColor, fontStyle, backgroundImageUrl: bgImageUrl, overlayOpacity: overlayOp, imagePositionY: imagePosY, postFormat };
    onSave?.(post);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[96vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-extrabold text-gray-900 dark:text-white">Editar post</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm">✕</button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

          {/* ── PAINEL DE EDIÇÃO ── */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col overflow-y-auto">

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 px-4 pt-3">
              {(["texto", "estilo", "imagem"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 text-xs font-bold pb-2.5 border-b-2 capitalize transition ${activeTab === tab ? "border-violet-600 text-violet-600" : "border-transparent text-gray-400"}`}>
                  {tab === "texto" ? "Texto" : tab === "estilo" ? "Estilo" : "Imagem"}
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

                  {/* Formato / tamanho */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Formato</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {FORMAT_SIZES.map((f) => {
                        const maxH = 44;
                        const scale = f.w >= f.h
                          ? { w: maxH, h: Math.round(maxH * f.h / f.w) }
                          : { w: Math.round(maxH * f.w / f.h), h: maxH };
                        return (
                          <button
                            key={f.id}
                            onClick={() => setPostFormat(f.id)}
                            className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border transition ${postFormat === f.id ? "border-violet-500 bg-violet-50 dark:bg-violet-950" : "border-gray-200 dark:border-gray-700 hover:border-violet-300"}`}
                          >
                            {/* Bloco visual proporcional */}
                            <div
                              className={`rounded-sm flex-shrink-0 ${postFormat === f.id ? "bg-violet-500" : "bg-gray-300 dark:bg-gray-600"}`}
                              style={{ width: scale.w, height: scale.h }}
                            />
                            <span className={`text-[10px] font-bold leading-tight ${postFormat === f.id ? "text-violet-700 dark:text-violet-300" : "text-gray-500 dark:text-gray-400"}`}>
                              {f.label}
                            </span>
                            <span className="text-[9px] text-gray-400 dark:text-gray-500">{f.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Template</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTemplate(t.id)}
                          className={`py-2 px-1 rounded-xl border text-center transition text-xs font-semibold leading-tight ${template === t.id ? "border-violet-500 bg-violet-50 dark:bg-violet-950 text-violet-700" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-300"}`}
                        >
                          {t.label}
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

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Cor do texto</label>
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

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Fonte</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {FONT_OPTIONS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFontStyle(f.id)}
                          className={`border-2 rounded-xl px-2 py-2 text-left transition ${fontStyle === f.id ? "border-violet-500 bg-violet-50 dark:bg-violet-950" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
                        >
                          <p className="font-bold text-gray-800 dark:text-gray-200 text-sm" style={{ fontFamily: f.css }}>Aa</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{f.label.split(" ")[0]}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── IMAGEM ── */}
              {activeTab === "imagem" && (
                <div className="space-y-4">

                  {/* Preview da imagem atual + remover */}
                  {bgImageUrl && (
                    <div className="relative rounded-xl overflow-hidden aspect-video border border-violet-200 dark:border-violet-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bgImageUrl} alt="Fundo" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <button
                          onClick={() => setBgImageUrl(undefined)}
                          className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-red-600 transition"
                        >
                          Remover imagem
                        </button>
                      </div>
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ✅ Imagem aplicada
                      </span>
                    </div>
                  )}

                  {/* Upload direto do dispositivo */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                      Enviar do dispositivo
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl py-4 px-4 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Clique para escolher uma foto</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG ou WEBP</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setBgImageUrl(ev.target.result as string);
                              // Sugere template foto_fundo automaticamente
                              if (template === "main_service" || template === "authority") {
                                setTemplate("foto_fundo");
                              }
                            }
                          };
                          reader.readAsDataURL(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {/* Galeria salva */}
                  {postImages.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                        Ou escolha da galeria
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {postImages.map((img) => (
                          <button
                            key={img.id}
                            onClick={() => setBgImageUrl(img.image_url)}
                            className={`aspect-square rounded-xl overflow-hidden border-2 transition hover:scale-105 ${bgImageUrl === img.image_url ? "border-violet-500 scale-105" : "border-transparent hover:border-violet-200"}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Escurecimento + Posição — só aparecem com imagem */}
                  {bgImageUrl && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                          Escurecimento da foto
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 mb-2">
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
                        <input
                          type="range" min="0" max="1" step="0.05"
                          value={overlayOp}
                          onChange={(e) => setOverlayOp(Number(e.target.value))}
                          className="w-full accent-violet-600"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                          <span>Transparente</span>
                          <span>Muito escuro</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                          Posição da foto
                        </label>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-gray-400">T</span>
                          <input
                            type="range" min="0" max="100" step="1"
                            value={imagePosY}
                            onChange={(e) => setImagePosY(Number(e.target.value))}
                            className="flex-1 accent-violet-600"
                          />
                          <span className="text-[10px] font-bold text-gray-400">B</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>Topo</span>
                          <span className="font-semibold text-violet-500">{imagePosY === 0 ? "Topo" : imagePosY === 100 ? "Base" : imagePosY === 50 ? "Centro" : `${imagePosY}%`}</span>
                          <span>Base</span>
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          {[{ label: "Topo", v: 10 }, { label: "Centro", v: 50 }, { label: "Base", v: 85 }].map((opt) => (
                            <button
                              key={opt.v}
                              onClick={() => setImagePosY(opt.v)}
                              className={`flex-1 text-[10px] py-1.5 rounded-lg border font-semibold transition ${imagePosY === opt.v ? "border-violet-500 bg-violet-50 dark:bg-violet-950 text-violet-700" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-300"}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Dica template */}
                  {bgImageUrl && (
                    <div className="bg-violet-50 dark:bg-violet-950/40 rounded-xl p-3 text-xs text-violet-700 dark:text-violet-300">
                      <p className="font-semibold mb-1">Templates que combinam com foto</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {(["foto_fundo", "strong_cta", "whatsapp_cta", "card_sobre_foto"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setTemplate(t)}
                            className={`px-2 py-1 rounded-lg border transition font-medium ${template === t ? "bg-violet-600 text-white border-violet-600" : "bg-white dark:bg-gray-800 border-violet-200 dark:border-violet-700 hover:border-violet-400"}`}
                          >
                            {t === "foto_fundo" ? "Foto fundo" : t === "strong_cta" ? "CTA forte" : t === "whatsapp_cta" ? "WhatsApp" : "Card foto"}
                          </button>
                        ))}
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
                imagePositionY={imagePosY}
                postFormat={postFormat}
                textColor={textColor}
                fontFamily={FONT_OPTIONS.find(f => f.id === fontStyle)?.css}
              />
            </div>

            <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-4">
              {TEMPLATES.find((t) => t.id === template)?.label} · {FORMAT_SIZES.find(f => f.id === postFormat)?.desc ?? postFormat} · {color}
              {bgImageUrl ? " · com foto" : ""}
            </p>
          </div>
        </div>

        {/* Footer ações */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-wrap">
          <button onClick={handleSave} className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${saved ? "bg-green-100 text-green-700" : "gradient-brand text-white hover:opacity-90"}`}>
            {saved ? "Salvo!" : "Salvar post"}
          </button>
          <button onClick={downloadPNG} className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            Baixar PNG
          </button>
          <button onClick={onClose} className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
