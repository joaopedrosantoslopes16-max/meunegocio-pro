"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import CarouselSlideRenderer, { SLIDE_W, getSlideCanvasSize } from "@/components/CarouselSlideRenderer";
import type {
  Business, ImageGallery,
  CarouselObjective, CarouselVisualStyle, PremiumCarousel, PremiumCarouselSlide,
} from "@/types";

// ─── Auth helper ──────────────────────────────────────────────
async function getAuthHeaders(): Promise<HeadersInit> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return { Authorization: `Bearer ${session.access_token}` };
  } catch {}
  return {};
}

// ─── Constants ────────────────────────────────────────────────
const SUGGESTIONS = ["Quem somos", "Promoção especial", "Nosso serviço", "Dica do dia", "Prova social", "Agenda aberta"];

const OBJECTIVES: { id: CarouselObjective; label: string; desc: string; icon: JSX.Element }[] = [
  { id: "vender",     label: "Vender",           desc: "Destacar serviço e converter", icon: <IconBag /> },
  { id: "educar",     label: "Dica / Tutorial",  desc: "Ensinar algo do seu nicho",    icon: <IconBulb /> },
  { id: "promocao",   label: "Promoção",          desc: "Oferta com urgência",          icon: <IconTag /> },
  { id: "servico",    label: "Serviço",           desc: "Apresentar serviço específico",icon: <IconGear /> },
  { id: "autoridade", label: "Autoridade",        desc: "Expertise e diferenciais",     icon: <IconStar /> },
  { id: "whatsapp",   label: "Chamar WhatsApp",   desc: "Gerar contatos diretos",       icon: <IconPhone /> },
  { id: "recuperar",  label: "Recuperar cliente", desc: "Reativar quem sumiu",          icon: <IconRefresh /> },
  { id: "novidade",   label: "Lançamento",        desc: "Apresentar algo novo",         icon: <IconSparkle /> },
  { id: "duvidas",    label: "Tirar dúvidas",     desc: "FAQ e objeções comuns",        icon: <IconQuestion /> },
];

const STYLES: { id: CarouselVisualStyle; label: string; desc: string; bg: string; accent: string; textColor: string }[] = [
  { id: "moderno",     label: "Moderno",     desc: "Escuro + cor vibrante",   bg: "#0d0d14", accent: "#7c3aed", textColor: "#fff" },
  { id: "premium",     label: "Premium",     desc: "Sofisticado e refinado",  bg: "#120c1e", accent: "#a78bfa", textColor: "#fff" },
  { id: "clean",       label: "Clean",       desc: "Fundo claro, legível",    bg: "#f9f9fb", accent: "#7c3aed", textColor: "#111" },
  { id: "chamativo",   label: "Chamativo",   desc: "Bold, alto contraste",    bg: "#7c3aed", accent: "#fbbf24", textColor: "#fff" },
  { id: "elegante",    label: "Elegante",    desc: "Tipografia refinada",     bg: "#1a1a24", accent: "#c4b5fd", textColor: "#fff" },
  { id: "minimalista", label: "Minimalista", desc: "Só o essencial",          bg: "#ffffff", accent: "#111111", textColor: "#111" },
];

const FORMATS: { id: "4/5" | "1/1" | "9/16"; label: string; sub: string; w: number; h: number }[] = [
  { id: "4/5",  label: "Feed (4:5)",     sub: "1080 × 1350", w: 32, h: 40 },
  { id: "1/1",  label: "Quadrado (1:1)", sub: "1080 × 1080", w: 36, h: 36 },
  { id: "9/16", label: "Stories (9:16)", sub: "1080 × 1920", w: 22, h: 40 },
];

const SLIDE_COUNTS = [4, 5, 6, 7, 8];

// ─── SVG Icons (no emoji) ─────────────────────────────────────
function IconBag() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>; }
function IconBulb() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>; }
function IconTag() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }
function IconGear() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function IconStar() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function IconPhone() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>; }
function IconRefresh() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>; }
function IconSparkle() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>; }
function IconQuestion() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function IconUpload() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>; }
function IconImages() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>; }
function IconDownload() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>; }
function IconCopy() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>; }
function IconCheck() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function IconX() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function IconChevronLeft() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function IconChevronRight() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }
function IconSave() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>; }
function IconPlus() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function IconArrowRight() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>; }
function IconShuffle() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>; }

// ─── Stepper ──────────────────────────────────────────────────
function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Conteúdo" },
    { n: 2, label: "Fotos" },
    { n: 3, label: "Resultado" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map(({ n, label }, i) => {
        const done   = step > n;
        const active = step === n;
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${done   ? "bg-violet-600 text-white" :
                    active ? "bg-violet-600 text-white ring-4 ring-violet-100 dark:ring-violet-950" :
                             "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-400"}`}
              >
                {done ? <IconCheck /> : n}
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap
                ${active ? "text-violet-700 dark:text-violet-400" :
                  done   ? "text-gray-500 dark:text-gray-400" :
                           "text-gray-400 dark:text-gray-600"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-0.5 mb-5 mx-2 rounded transition-all
                ${step > n ? "bg-violet-400" : "bg-gray-200 dark:bg-gray-700"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Style mini-preview ───────────────────────────────────────
function StylePreview({ style }: { style: typeof STYLES[0] }) {
  return (
    <div
      className="w-full rounded-lg overflow-hidden flex-shrink-0"
      style={{ background: style.bg, height: "52px", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "5px" }}
    >
      <div style={{ width: "40px", height: "3px", background: style.accent, borderRadius: "2px" }} />
      <div style={{ width: "72px", height: "5px", background: style.textColor === "#fff" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)", borderRadius: "2px" }} />
      <div style={{ width: "52px", height: "4px", background: style.textColor === "#fff" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)", borderRadius: "2px" }} />
    </div>
  );
}

// ─── Gallery Modal ────────────────────────────────────────────
interface GalleryModalProps {
  images: ImageGallery[];
  onSelect: (url: string) => void;
  onClose: () => void;
  targetSlide: number | null;
}

function GalleryModal({ images, onSelect, onClose, targetSlide }: GalleryModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              {targetSlide !== null ? `Selecionar imagem — Slide ${targetSlide + 1}` : "Selecionar imagem"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Clique na imagem para selecionar</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition">
            <IconX />
          </button>
        </div>

        {/* Images grid */}
        <div className="overflow-y-auto p-5 flex-1">
          {images.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3 text-gray-400">
                <IconImages />
              </div>
              <p className="text-sm text-gray-500">Nenhuma imagem na galeria.</p>
              <p className="text-xs text-gray-400 mt-1">
                Adicione fotos em <a href="/galeria" className="text-violet-600 hover:underline">Galeria de Imagens</a>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map(img => (
                <button
                  key={img.id}
                  onClick={() => setSelected(img.image_url)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all
                    ${selected === img.image_url
                      ? "border-violet-500 ring-2 ring-violet-200 dark:ring-violet-900"
                      : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  {selected === img.image_url && (
                    <div className="absolute inset-0 bg-violet-600/20 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
                        <IconCheck />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => { if (selected) { onSelect(selected); onClose(); } }}
            disabled={!selected}
            className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition disabled:opacity-40"
          >
            Usar esta imagem
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────
interface Props { business: Business }

export default function GeradorCarrosselClient({ business }: Props) {

  // ── Wizard ────────────────────────────────────────────────
  const [step, setStep]           = useState<1 | 2 | 3>(1);

  // ── Step 1 ────────────────────────────────────────────────
  const [topic, setTopic]         = useState("");
  const [objective, setObjective] = useState<CarouselObjective>("vender");
  const [slideCount, setSlideCount] = useState(6);
  const [visualStyle, setStyle]   = useState<CarouselVisualStyle>("moderno");
  const [format, setFormat]       = useState<"4/5" | "1/1" | "9/16">("4/5");

  // ── Step 2 ────────────────────────────────────────────────
  const [galleryImages, setGallery]       = useState<ImageGallery[]>([]);
  const [galleryLoading, setGalleryLoad]  = useState(false);
  const [galleryOpen, setGalleryOpen]     = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<number | null>(null); // slide index
  const [uploadedImages, setUploaded]     = useState<{ url: string; name: string }[]>([]);
  const [slideImages, setSlideImages]     = useState<Record<number, string>>({});
  const [uploading, setUploading]         = useState(false);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  // ── Generate ──────────────────────────────────────────────
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [carousel, setCarousel] = useState<PremiumCarousel | null>(null);

  // ── Step 3 ────────────────────────────────────────────────
  const [activeSlide, setActiveSlide]     = useState(0);
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [copied, setCopied]               = useState<"caption" | "whatsapp" | null>(null);
  const [exportingSlide, setExportingSlide] = useState<PremiumCarouselSlide | null>(null);
  const [downloadingAll, setDownloadAll]  = useState(false);
  const exportRef                         = useRef<HTMLDivElement>(null);

  // ── Load gallery when step=2 ─────────────────────────────
  useEffect(() => {
    if (step !== 2 || galleryImages.length > 0) return;
    setGalleryLoad(true);
    getAuthHeaders().then(async h => {
      try {
        const res = await fetch(`/api/gallery?business_id=${business.id}`, { headers: h });
        if (res.ok) { const d = await res.json(); setGallery(Array.isArray(d) ? d : []); }
      } catch {}
      setGalleryLoad(false);
    });
  }, [step, business.id, galleryImages.length]);

  // ── PNG export ───────────────────────────────────────────
  const runExport = useCallback(async (filename: string) => {
    if (!exportRef.current) return;
    try {
      const h2c = (await import("html2canvas")).default;
      const { w, h } = getSlideCanvasSize(format);
      const canvas = await h2c(exportRef.current, { width: w, height: h, scale: 1, useCORS: true, allowTaint: true, backgroundColor: null, logging: false });
      const a = document.createElement("a");
      a.download = filename;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch {}
  }, [format]);

  useEffect(() => {
    if (!exportingSlide) return;
    const t = setTimeout(async () => {
      await runExport(`${business.business_name.replace(/\s+/g, "-")}_slide${exportingSlide.slideNumber}.png`);
      setExportingSlide(null);
    }, 300);
    return () => clearTimeout(t);
  }, [exportingSlide, business.business_name, runExport]);

  // ── File upload ──────────────────────────────────────────
  async function handleFileUpload(files: FileList) {
    if (!files.length) return;
    setUploading(true);
    const h = await getAuthHeaders();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const form = new FormData();
      form.append("file", file);
      form.append("business_id", business.id);
      form.append("image_type", "general");
      try {
        const res = await fetch("/api/gallery", { method: "POST", headers: h, body: form });
        if (res.ok) {
          const data = await res.json();
          if (data.image_url) {
            setUploaded(prev => [...prev, { url: data.image_url, name: file.name }]);
            setGallery(prev => [...prev, data]);
          }
        }
      } catch {}
    }
    setUploading(false);
  }

  function assignToSlide(slideIdx: number, url: string) {
    setSlideImages(prev => ({ ...prev, [slideIdx]: url }));
  }

  function removeFromSlide(slideIdx: number) {
    setSlideImages(prev => { const next = { ...prev }; delete next[slideIdx]; return next; });
  }

  function autoDistribute() {
    const allUrls = [...uploadedImages.map(u => u.url), ...galleryImages.map(g => g.image_url)];
    const seen = new Set<string>();
    const unique = allUrls.filter(u => { if (seen.has(u)) return false; seen.add(u); return true; });
    if (!unique.length) return;
    const map: Record<number, string> = {};
    for (let i = 0; i < slideCount - 1; i++) { map[i] = unique[i % unique.length]; }
    setSlideImages(map);
  }

  // ── Generate carousel ────────────────────────────────────
  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const h = await getAuthHeaders();
      const assignedUrls = Object.values(slideImages);
      const rawImages = [...uploadedImages.map(u => u.url), ...galleryImages.filter(g => assignedUrls.includes(g.image_url)).map(g => g.image_url)];
      const seen2 = new Set<string>();
      const allImages = rawImages.filter(u => { if (seen2.has(u)) return false; seen2.add(u); return true; });
      const res = await fetch("/api/carousel/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...h },
        body: JSON.stringify({
          business_id: business.id,
          topic: topic.trim(),
          objective,
          visual_style: visualStyle,
          format,
          selected_images: allImages,
          slide_images_map: Object.keys(slideImages).length > 0 ? slideImages : undefined,
          slide_count: slideCount,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message ?? "Erro ao gerar carrossel.");
        setLoading(false);
        return;
      }
      const data: PremiumCarousel = await res.json();
      setCarousel(data);
      setActiveSlide(0);
      setStep(3);
    } catch { setError("Erro de conexão. Tente novamente."); }
    setLoading(false);
  }

  async function handleSave() {
    if (!carousel) return;
    setSaving(true);
    try {
      const h = await getAuthHeaders();
      const res = await fetch("/api/carousel/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...h },
        body: JSON.stringify({
          business_id: business.id,
          id: carousel.id,
          title: carousel.title,
          topic: carousel.topic,
          objective: carousel.objective,
          niche: business.niche,
          visual_style: carousel.visualStyle,
          format: carousel.format,
          slides_json: carousel.slides,
          caption: carousel.caption,
          whatsapp_message: carousel.whatsappMessage,
          selected_images_json: carousel.selectedImages,
        }),
      });
      if (res.ok) {
        const { id } = await res.json();
        if (id && !carousel.id) setCarousel(p => p ? { ...p, id } : p);
        setSaved(true);
      }
    } catch {}
    setSaving(false);
  }

  async function handleDownloadAll() {
    if (!carousel) return;
    setDownloadAll(true);
    for (const slide of carousel.slides) {
      setExportingSlide(slide);
      await new Promise(r => setTimeout(r, 700));
    }
    setDownloadAll(false);
  }

  function copy(text: string, k: "caption" | "whatsapp") {
    navigator.clipboard.writeText(text).then(() => { setCopied(k); setTimeout(() => setCopied(null), 2200); });
  }

  function reset() {
    setStep(1); setTopic(""); setObjective("vender"); setSlideCount(6); setStyle("moderno");
    setFormat("4/5"); setSlideImages({}); setUploaded([]); setCarousel(null);
    setSaved(false); setError(null); setActiveSlide(0);
  }

  // ── Preview sizing ────────────────────────────────────────
  const previewW = 300;
  const { h: canonH } = getSlideCanvasSize(format);
  const previewH = Math.round(canonH * (previewW / SLIDE_W));

  // ─────────────────────────────────────────────────────────
  // STEP 1
  // ─────────────────────────────────────────────────────────
  if (step === 1) {
    const selectedStyle = STYLES.find(s => s.id === visualStyle)!;
    const selectedObj   = OBJECTIVES.find(o => o.id === objective)!;
    const selectedFmt   = FORMATS.find(f => f.id === format)!;

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Stepper step={1} />

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Gerador de Carrossel Premium
            </h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Pro
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Crie carrosséis com visual profissional — layouts, tipografia, imagens e CTA para o Instagram.
          </p>
        </div>

        <div className="flex gap-8 items-start">
          {/* ── Left: Form ──────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Topic */}
            <section>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
                Sobre o que é o seu carrossel?
              </label>
              <p className="text-xs text-gray-400 mb-3">Descreva em uma frase o que você quer comunicar.</p>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={`Ex: apresentar ${business.main_service}, promoção de ${business.main_service}, chamar clientes para o WhatsApp...`}
                rows={3}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none transition"
              />
              {/* Suggestions */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setTopic(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-violet-300 hover:text-violet-700 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50 transition font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            {/* Objective */}
            <section>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">Objetivo</label>
              <div className="grid grid-cols-3 gap-2">
                {OBJECTIVES.map(o => {
                  const active = objective === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setObjective(o.id)}
                      className={`flex flex-col items-start gap-2 p-3.5 rounded-xl border text-left transition-all
                        ${active
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-950/60"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"}`}
                    >
                      <div className={`${active ? "text-violet-600 dark:text-violet-400" : "text-gray-400"}`}>
                        {o.icon}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${active ? "text-violet-700 dark:text-violet-300" : "text-gray-800 dark:text-gray-100"}`}>
                          {o.label}
                        </div>
                        <div className="text-xs text-gray-400 leading-tight mt-0.5">{o.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Slide count */}
            <section>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">
                Quantidade de slides
              </label>
              <div className="flex gap-2">
                {SLIDE_COUNTS.map(n => (
                  <button
                    key={n}
                    onClick={() => setSlideCount(n)}
                    className={`w-12 h-11 rounded-xl border text-sm font-bold transition-all
                      ${slideCount === n
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:border-gray-300"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Inclui capa e slide de CTA (chamada para ação).</p>
            </section>

            {/* Visual style */}
            <section>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">Estilo visual</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {STYLES.map(s => {
                  const active = visualStyle === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`flex flex-col gap-2 p-3 rounded-xl border text-left transition-all
                        ${active
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-950/60"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300"}`}
                    >
                      <StylePreview style={s} />
                      <div>
                        <div className={`text-xs font-bold ${active ? "text-violet-700 dark:text-violet-300" : "text-gray-800 dark:text-gray-100"}`}>
                          {s.label}
                        </div>
                        <div className="text-xs text-gray-400">{s.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Format */}
            <section>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">Formato</label>
              <div className="flex gap-2.5">
                {FORMATS.map(f => {
                  const active = format === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFormat(f.id)}
                      className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border flex-1 transition-all
                        ${active
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-950/60"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300"}`}
                    >
                      <div
                        className={`rounded border-2 flex-shrink-0 transition-colors ${active ? "border-violet-400" : "border-gray-300 dark:border-gray-600"}`}
                        style={{ width: f.w, height: f.h, background: active ? "rgba(124,58,237,0.12)" : "rgba(128,128,128,0.08)" }}
                      />
                      <div className="text-center">
                        <div className={`text-xs font-bold ${active ? "text-violet-700 dark:text-violet-300" : "text-gray-700 dark:text-gray-200"}`}>
                          {f.label}
                        </div>
                        <div className="text-xs text-gray-400">{f.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* CTA */}
            <button
              onClick={() => topic.trim() && setStep(2)}
              disabled={!topic.trim()}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              Continuar <IconArrowRight />
            </button>
          </div>

          {/* ── Right: Sticky summary sidebar ───────────── */}
          <div className="hidden lg:block w-72 flex-shrink-0 sticky top-20">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Resumo do carrossel</p>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { label: "Tema", value: topic || "—" },
                  { label: "Objetivo", value: selectedObj?.label ?? "—" },
                  { label: "Slides", value: `${slideCount} slides` },
                  { label: "Estilo", value: selectedStyle?.label ?? "—" },
                  { label: "Formato", value: selectedFmt?.label ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-2">
                    <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-right truncate">{value}</span>
                  </div>
                ))}
              </div>

              {/* Style preview */}
              {selectedStyle && (
                <div className="mx-4 mb-4 rounded-xl overflow-hidden">
                  <StylePreview style={selectedStyle} />
                </div>
              )}

              <div className="px-4 pb-4">
                <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800" style={{ background: "#f8f8fa" }}>
                  <div className="p-3">
                    <div className="text-xs text-gray-400 text-center">Prévia do formato</div>
                    <div className="flex justify-center mt-2">
                      <div
                        className="rounded-lg border-2 border-gray-200"
                        style={{
                          width: FORMATS.find(f => f.id === format)!.w * 2,
                          height: FORMATS.find(f => f.id === format)!.h * 2,
                          background: selectedStyle?.bg ?? "#eee",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <div style={{ width: "50%", height: "3px", background: selectedStyle?.accent, borderRadius: "2px" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // STEP 2
  // ─────────────────────────────────────────────────────────
  if (step === 2) {
    const allAvailable = [
      ...uploadedImages.map(u => ({ url: u.url, name: u.name })),
      ...galleryImages.filter(g => !uploadedImages.some(u => u.url === g.image_url)).map(g => ({ url: g.image_url, name: g.file_name ?? "imagem" })),
    ];

    const assignedCount = Object.keys(slideImages).length;

    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Stepper step={2} />

        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">
            Selecione suas fotos
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Envie imagens ou escolha da galeria. Você pode atribuir cada imagem a um slide específico.
          </p>
        </div>

        {galleryOpen && (
          <GalleryModal
            images={galleryImages}
            targetSlide={galleryTarget}
            onSelect={url => { if (galleryTarget !== null) assignToSlide(galleryTarget, url); }}
            onClose={() => { setGalleryOpen(false); setGalleryTarget(null); }}
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => { if (e.target.files) handleFileUpload(e.target.files); e.target.value = ""; }}
        />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ── Left: Upload + available images ─────────── */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Suas imagens</p>

              {/* Upload zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-violet-100 dark:group-hover:bg-violet-900 flex items-center justify-center mx-auto mb-3 transition text-gray-400 group-hover:text-violet-600">
                  {uploading ? <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" /> : <IconUpload />}
                </div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {uploading ? "Enviando..." : "Clique para enviar imagens"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Múltiplos arquivos · JPG, PNG, WEBP</p>
              </div>

              {/* Available images */}
              {allAvailable.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-500">{allAvailable.length} imagem{allAvailable.length !== 1 ? "s" : ""} disponível{allAvailable.length !== 1 ? "s" : ""}</p>
                    <button
                      onClick={autoDistribute}
                      className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 transition"
                    >
                      <IconShuffle /> Distribuir automaticamente
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {allAvailable.map(img => (
                      <div key={img.url} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                        {Object.values(slideImages).includes(img.url) && (
                          <div className="absolute inset-0 bg-violet-600/30 rounded-lg flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                              <IconCheck />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery button */}
              <button
                onClick={() => { setGalleryTarget(null); setGalleryOpen(true); }}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <IconImages /> Abrir galeria
              </button>
            </div>
          </div>

          {/* ── Right: Per-slide assignment ──────────────── */}
          <div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Imagem por slide</p>
                {assignedCount > 0 && (
                  <span className="text-xs text-violet-600 font-semibold">{assignedCount} de {slideCount} atribuídos</span>
                )}
              </div>

              <div className="space-y-2">
                {Array.from({ length: slideCount }, (_, i) => {
                  const isFirst = i === 0;
                  const isLast  = i === slideCount - 1;
                  const label   = isFirst ? "Capa" : isLast ? "CTA" : `Slide ${i + 1}`;
                  const img     = slideImages[i];

                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50"
                    >
                      {/* Thumb or placeholder */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600">
                            <IconImages />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{label}</span>
                          {(isFirst || isLast) && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500">{isFirst ? "capa" : "cta"}</span>
                          )}
                        </div>
                        {img ? (
                          <p className="text-xs text-gray-400 truncate">Imagem atribuída</p>
                        ) : (
                          <p className="text-xs text-gray-400">Sem imagem</p>
                        )}
                      </div>

                      <div className="flex gap-1.5">
                        {img ? (
                          <>
                            <button
                              onClick={() => { setGalleryTarget(i); setGalleryOpen(true); }}
                              className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-white dark:hover:bg-gray-800 transition font-medium"
                            >
                              Trocar
                            </button>
                            <button
                              onClick={() => removeFromSlide(i)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                            >
                              <IconX />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { setGalleryTarget(i); setGalleryOpen(true); }}
                              className="text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:border-violet-400 hover:text-violet-600 transition font-medium flex items-center gap-1"
                            >
                              <IconPlus /> Selecionar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Continue without photos info */}
        {assignedCount === 0 && allAvailable.length === 0 && (
          <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
            Sem fotos, o sistema usa fundos profissionais com gradientes e as cores da sua marca.
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setStep(1)}
            className="sm:w-auto px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            <IconChevronLeft /> Voltar
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Gerando carrossel...</>
            ) : (
              <>Gerar carrossel <IconArrowRight /></>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // STEP 3 — Results
  // ─────────────────────────────────────────────────────────
  if (!carousel) return null;

  const currentSlide = carousel.slides[activeSlide];
  const totalSlides  = carousel.slides.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Stepper step={3} />

      {/* Hidden canonical div for PNG export */}
      <div style={{ position: "fixed", top: "-9999px", left: "-9999px", pointerEvents: "none", zIndex: -1 }}>
        <div ref={exportRef}>
          {exportingSlide && (
            <CarouselSlideRenderer slide={exportingSlide} business={business} format={format} canonical />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {carousel.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{totalSlides} slides gerados com sucesso</p>
        </div>
        <button
          onClick={reset}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-violet-600 transition px-3 py-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950"
        >
          <IconPlus /> Novo carrossel
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ── LEFT: Preview ────────────────────────────── */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          {/* Slide preview */}
          <div className="relative mx-auto" style={{ width: previewW }}>
            <div className="relative rounded-2xl overflow-hidden shadow-xl" style={{ width: previewW, height: previewH }}>
              <CarouselSlideRenderer
                slide={currentSlide}
                business={business}
                format={format}
                width={previewW}
              />
            </div>

            {/* Nav arrows */}
            {activeSlide > 0 && (
              <button
                onClick={() => setActiveSlide(a => a - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition z-10"
              >
                <IconChevronLeft />
              </button>
            )}
            {activeSlide < totalSlides - 1 && (
              <button
                onClick={() => setActiveSlide(a => a + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition z-10"
              >
                <IconChevronRight />
              </button>
            )}

            {/* Slide counter */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-semibold">
              {activeSlide + 1} / {totalSlides}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {carousel.slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`rounded-full transition-all ${i === activeSlide ? "w-5 h-2 bg-violet-600" : "w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"}`}
              />
            ))}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
            {carousel.slides.map((slide, i) => {
              const thumbH = Math.round(52 * (canonH / SLIDE_W));
              return (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`flex-shrink-0 rounded-lg overflow-hidden transition-all
                    ${i === activeSlide ? "ring-2 ring-violet-500 ring-offset-1" : "opacity-55 hover:opacity-90"}`}
                  style={{ width: 52, height: thumbH }}
                >
                  <CarouselSlideRenderer slide={slide} business={business} format={format} width={52} />
                </button>
              );
            })}
          </div>

          {/* Download buttons */}
          <div className="mt-4 space-y-2">
            <button
              onClick={() => setExportingSlide(currentSlide)}
              disabled={!!exportingSlide}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
            >
              {exportingSlide?.slideNumber === currentSlide.slideNumber ? (
                <><div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Exportando...</>
              ) : (
                <><IconDownload /> Baixar slide {activeSlide + 1}</>
              )}
            </button>
            <button
              onClick={handleDownloadAll}
              disabled={downloadingAll || !!exportingSlide}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
            >
              {downloadingAll ? (
                <><div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Exportando todos...</>
              ) : (
                <><IconDownload /> Baixar todos os {totalSlides} slides</>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Cards ──────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Caption */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Legenda — Instagram</p>
              <button
                onClick={() => copy(carousel.caption, "caption")}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all
                  ${copied === "caption"
                    ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                    : "border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              >
                {copied === "caption" ? <><IconCheck /> Copiado</> : <><IconCopy /> Copiar</>}
              </button>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
              {carousel.caption}
            </p>
          </div>

          {/* WhatsApp */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Mensagem — WhatsApp</p>
              <button
                onClick={() => copy(carousel.whatsappMessage, "whatsapp")}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all
                  ${copied === "whatsapp"
                    ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                    : "border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              >
                {copied === "whatsapp" ? <><IconCheck /> Copiado</> : <><IconCopy /> Copiar</>}
              </button>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto">
              {carousel.whatsappMessage}
            </p>
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Resumo</p>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {[
                { label: "Formato",   value: FORMATS.find(f => f.id === format)?.label ?? format },
                { label: "Estilo",    value: STYLES.find(s => s.id === carousel.visualStyle)?.label ?? carousel.visualStyle },
                { label: "Objetivo",  value: OBJECTIVES.find(o => o.id === carousel.objective)?.label ?? carousel.objective },
                { label: "Slides",    value: `${totalSlides} slides` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                ${saved
                  ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                  : "bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50"}`}
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Salvando...</>
              ) : saved ? (
                <><IconCheck /> Salvo com sucesso</>
              ) : (
                <><IconSave /> Salvar carrossel</>
              )}
            </button>

            <button
              onClick={reset}
              className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              <IconPlus /> Criar novo carrossel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
