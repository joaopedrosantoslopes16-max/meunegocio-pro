"use client";

import React, { useState } from "react";
import type { Business, ReelsScript, RefinementMode, StorySequence } from "@/types";
import { getQuickTopicSuggestions } from "@/lib/ai-content-service";
import { NICHE_CONFIG } from "@/lib/niche-config";
import type { VideoPlatform } from "@/lib/gemini-reels";

type ContentMode = VideoPlatform | "story";

interface ContentAngle {
  id: string;
  label: string;
  description: string;
  icon: "camera" | "heart" | "lightbulb" | "star" | "clock" | "fire";
}

interface GenerationResult {
  id: string | null;
  script: ReelsScript | null;
  stories: StorySequence | null;
  caption: string;
  whatsapp_message: string;
  whatsapp_variations: string[];
  mode: ContentMode;
  angle: string;
}

interface Props {
  business: Business;
  planName: "essencial" | "pro";
}

// ── Ângulos de conteúdo ─────────────────────────────────────────
const BASE_ANGLES: ContentAngle[] = [
  {
    id: "bastidores",
    label: "Mostrar por dentro",
    description: "Câmera ligada no seu trabalho — o processo que o cliente nunca vê",
    icon: "camera",
  },
  {
    id: "dor-cliente",
    label: "Falar com a dor",
    description: "Começa com o problema real do cliente — prende quem está passando por isso",
    icon: "heart",
  },
  {
    id: "revelar",
    label: "Revelar algo",
    description: "Uma informação que surpreende — fato, mito ou segredo do nicho",
    icon: "lightbulb",
  },
  {
    id: "resultado",
    label: "Mostrar resultado",
    description: "Antes e depois, transformação real — o que muda com o seu serviço",
    icon: "star",
  },
  {
    id: "urgencia",
    label: "Criar urgência",
    description: "Por que resolver isso agora e não depois — consequências de adiar",
    icon: "clock",
  },
  {
    id: "autoridade",
    label: "Mostrar autoridade",
    description: "Posiciona você como referência — experiência, diferencial, conquistas",
    icon: "fire",
  },
];

function getAnglesForMode(mode: ContentMode, niche: string): ContentAngle[] {
  if (mode === "story") {
    return [
      BASE_ANGLES[1], // dor-cliente
      BASE_ANGLES[2], // revelar
      BASE_ANGLES[3], // resultado
    ];
  }
  // Reels e Shorts — varia por nicho
  const serviceNiches = ["mecanica", "serralheria", "contabilidade"];
  if (serviceNiches.includes(niche)) {
    return [BASE_ANGLES[0], BASE_ANGLES[2], BASE_ANGLES[3]];
  }
  return [BASE_ANGLES[0], BASE_ANGLES[1], BASE_ANGLES[2]];
}

// ── Ícones SVG ──────────────────────────────────────────────────
function IconCheck({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2.5 8 6.5 12 13.5 4" />
    </svg>
  );
}
function IconCopy({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="5" width="9" height="9" rx="1.5" />
      <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" />
    </svg>
  );
}
function IconRefresh({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 8A5.5 5.5 0 1 1 10 3.07" />
      <polyline points="10 1 10 4 13 4" />
    </svg>
  );
}
function IconCamera({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="14" height="10" rx="2" />
      <circle cx="8" cy="9" r="2.5" />
      <path d="M5 4l1-2h4l1 2" />
    </svg>
  );
}
function IconHeart({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 13.5S1.5 9.5 1.5 5.5a3.5 3.5 0 0 1 6.5-1.8A3.5 3.5 0 0 1 14.5 5.5C14.5 9.5 8 13.5 8 13.5z" />
    </svg>
  );
}
function IconLightbulb({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1a5 5 0 0 1 3 9l-1 1H6l-1-1A5 5 0 0 1 8 1z" />
      <path d="M6 11v1a2 2 0 0 0 4 0v-1" />
    </svg>
  );
}
function IconStar({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="8 1.5 10 6 14.5 6.5 11.2 9.5 12.2 14 8 11.5 3.8 14 4.8 9.5 1.5 6.5 6 6" />
    </svg>
  );
}
function IconClock({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <polyline points="8 4.5 8 8 10.5 10" />
    </svg>
  );
}
function IconFire({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 14c-3 0-5-2-5-5 0-2 1-3.5 2.5-4.5 0 1.5 1 2.5 1 2.5S7 5 7 3c3 1 4 3.5 4 5.5 0 .8-.2 1.6-.6 2.2C11 10 11 9 11 9c0 2-1.5 5-3 5z" />
    </svg>
  );
}
function IconMic({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="1" width="6" height="9" rx="3" />
      <path d="M2 8.5a6 6 0 0 0 12 0" />
      <line x1="8" y1="14.5" x2="8" y2="12" />
    </svg>
  );
}
function IconDisplay({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2" width="14" height="10" rx="1.5" />
      <path d="M5 15h6M8 12v3" />
    </svg>
  );
}
function IconMusic({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 13V4l8-2v9" />
      <circle cx="4" cy="13" r="2" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}
function IconScissors({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="3.5" cy="4" r="2" />
      <circle cx="3.5" cy="12" r="2" />
      <path d="M5.5 4.5L14 10M5.5 11.5L14 6" />
    </svg>
  );
}
function IconMessage({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 10a2 2 0 0 1-2 2H5l-3 3V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z" />
    </svg>
  );
}
function IconFilm({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="14" height="10" rx="2" />
      <line x1="1" y1="6" x2="15" y2="6" />
      <line x1="1" y1="10" x2="15" y2="10" />
      <line x1="5" y1="3" x2="5" y2="6" />
      <line x1="11" y1="3" x2="11" y2="6" />
      <line x1="5" y1="10" x2="5" y2="13" />
      <line x1="11" y1="10" x2="11" y2="13" />
    </svg>
  );
}
function IconInstagram({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconYouTube({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconStories({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="3" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="9" y1="15" x2="13" y2="15" />
    </svg>
  );
}
function IconArrowLeft({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13L5 8l5-5" />
    </svg>
  );
}

function AngleIcon({ icon, className }: { icon: ContentAngle["icon"]; className?: string }) {
  const cls = className ?? "w-5 h-5";
  if (icon === "camera") return <IconCamera className={cls} />;
  if (icon === "heart") return <IconHeart className={cls} />;
  if (icon === "lightbulb") return <IconLightbulb className={cls} />;
  if (icon === "star") return <IconStar className={cls} />;
  if (icon === "clock") return <IconClock className={cls} />;
  return <IconFire className={cls} />;
}

// ── Config de plataforma ─────────────────────────────────────────
type PlatformCfg = {
  label: string;
  sub: string;
  color: string;
  colorActive: string;
  border: string;
  borderActive: string;
};

const MODE_CONFIG: Record<ContentMode, PlatformCfg> = {
  reels: {
    label: "Reels",
    sub: "Instagram",
    color: "text-pink-600 dark:text-pink-400",
    colorActive: "text-white",
    border: "border-pink-200 dark:border-pink-800",
    borderActive: "border-pink-500 bg-gradient-to-br from-pink-500 to-purple-600",
  },
  shorts: {
    label: "Shorts",
    sub: "YouTube",
    color: "text-red-600 dark:text-red-400",
    colorActive: "text-white",
    border: "border-red-200 dark:border-red-800",
    borderActive: "border-red-500 bg-gradient-to-br from-red-500 to-red-700",
  },
  story: {
    label: "Stories",
    sub: "Instagram",
    color: "text-violet-600 dark:text-violet-400",
    colorActive: "text-white",
    border: "border-violet-200 dark:border-violet-800",
    borderActive: "border-violet-500 bg-gradient-to-br from-violet-500 to-indigo-600",
  },
};

const STORY_TYPE_LABELS: Record<string, string> = {
  pergunta: "Gancho",
  revelacao: "Revelação",
  prova: "Prova",
  cta: "CTA",
  caixinha: "Interação",
  apresentação: "Apresentação",
  chamada: "Chamada",
};

const STORY_BACKGROUNDS: Record<string, string> = {
  "roxo gradiente": "bg-gradient-to-br from-purple-600 to-pink-500",
  "rosa para laranja": "bg-gradient-to-br from-pink-500 to-orange-400",
  "azul escuro": "bg-blue-900",
  "preto": "bg-gray-950",
  "branco": "bg-white",
  "verde escuro": "bg-emerald-900",
  "creme": "bg-amber-50",
};

const REFINEMENT_BUTTONS: { mode: RefinementMode; label: string }[] = [
  { mode: "mais-vendedor",  label: "Mais vendedor"  },
  { mode: "mais-educativo", label: "Mais educativo" },
  { mode: "mais-criativo",  label: "Mais criativo"  },
  { mode: "mais-direto",    label: "Mais direto"    },
  { mode: "menos-generico", label: "Menos genérico" },
  { mode: "trocar-angulo",  label: "Trocar ângulo"  },
];

const ALL_MODES: ContentMode[] = ["reels", "story", "shorts"];

// ── Componente principal ─────────────────────────────────────────
export default function GeradorMagneticoClient({ business, planName }: Props) {
  const [topic, setTopic]           = useState("");
  const [step, setStep]             = useState<"input" | "angle" | "result">("input");
  const [selectedMode, setSelectedMode] = useState<ContentMode>("reels");
  const [selectedAngle, setSelectedAngle] = useState<ContentAngle | null>(null);
  const [result, setResult]         = useState<GenerationResult | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [copied, setCopied]         = useState<string | null>(null);
  const [activeRefinement, setActiveRefinement] = useState<RefinementMode | null>(null);

  const isPro = planName === "pro";
  const cfg = NICHE_CONFIG[business.niche] ?? NICHE_CONFIG.outro;
  const quickSuggestions = getQuickTopicSuggestions(business.niche);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2500);
  }

  function handleModeSelect(mode: ContentMode) {
    if (mode === "story" && !isPro) {
      setError("Stories está disponível apenas no plano Pro.");
      return;
    }
    if (!topic.trim()) return;
    setError(null);
    setSelectedMode(mode);
    setStep("angle");
  }

  async function generate(mode: ContentMode, angle: ContentAngle, refinement?: RefinementMode) {
    setLoading(true);
    setError(null);
    if (!refinement) setActiveRefinement(null);

    try {
      const format = mode === "story" ? "story" : "reels";
      const platform = mode === "story" ? undefined : mode;

      const res = await fetch("/api/content-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          topic,
          format,
          platform,
          angle: angle.id,
          refinementMode: refinement,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar");

      setResult({
        id: data.id,
        script: data.script ?? null,
        stories: data.stories ?? null,
        caption: data.caption ?? "",
        whatsapp_message: data.whatsapp_message ?? "",
        whatsapp_variations: data.whatsapp_variations ?? [],
        mode,
        angle: angle.id,
      });
      setStep("result");
      if (refinement) setActiveRefinement(refinement);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  function handleAngleSelect(angle: ContentAngle) {
    setSelectedAngle(angle);
    generate(selectedMode, angle);
  }

  function restart() {
    setResult(null);
    setError(null);
    setActiveRefinement(null);
    setSelectedAngle(null);
    setStep("input");
  }

  function backToAngles() {
    setResult(null);
    setError(null);
    setActiveRefinement(null);
    setStep("angle");
  }

  const currentCfg = MODE_CONFIG[result?.mode ?? selectedMode];
  const angles = getAnglesForMode(selectedMode, business.niche);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <IconFilm className="w-3.5 h-3.5" />
          Gerador de Conteúdo
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          O que você quer criar hoje?
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
          Escreva livremente — o sistema interpreta seu negócio e cria conteúdo para Reels, Stories ou Shorts.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3 mb-6 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ── ETAPA 1: INPUT ── */}
      {step === "input" && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
              Escreva o que você quer abordar
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={`Ex: "quero mostrar ${cfg.services[0] ?? "meu serviço principal"}", "promoção de fim de semana", "bastidores do trabalho"…`}
              rows={3}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Quanto mais contexto você der, mais certeiro o conteúdo.
            </p>
          </div>

          {/* Sugestões */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
              Sugestões para {cfg.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setTopic(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                    topic === s
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-400 hover:text-violet-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Escolha de plataforma */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">
              Escolha o formato
            </p>
            <div className="grid grid-cols-3 gap-3">
              {ALL_MODES.map((mode) => {
                const pc = MODE_CONFIG[mode];
                const isProOnly = mode === "story" && !isPro;
                return (
                  <button
                    key={mode}
                    onClick={() => handleModeSelect(mode)}
                    disabled={!topic.trim()}
                    className={`relative flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed ${pc.border} bg-white dark:bg-gray-900 ${pc.color} hover:shadow-md`}
                  >
                    {mode === "reels" ? <IconInstagram className="w-6 h-6 flex-shrink-0" />
                      : mode === "story" ? <IconStories className="w-6 h-6 flex-shrink-0" />
                      : <IconYouTube className="w-6 h-6 flex-shrink-0" />}
                    <div className="text-center">
                      <div className="font-bold leading-none text-xs">{pc.label}</div>
                      <div className="text-xs font-normal opacity-60 mt-0.5">{pc.sub}</div>
                    </div>
                    {isProOnly && (
                      <span className="absolute -top-2 -right-2 text-[9px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded-full">PRO</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ETAPA 2: ÂNGULO ── */}
      {step === "angle" && !loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep("input")}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition"
            >
              <IconArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <div className="flex items-center gap-2">
              {selectedMode === "reels" ? <IconInstagram className={`w-4 h-4 ${MODE_CONFIG.reels.color}`} />
                : selectedMode === "story" ? <IconStories className={`w-4 h-4 ${MODE_CONFIG.story.color}`} />
                : <IconYouTube className={`w-4 h-4 ${MODE_CONFIG.shorts.color}`} />}
              <span className={`text-sm font-bold ${MODE_CONFIG[selectedMode].color}`}>
                {MODE_CONFIG[selectedMode].label} · {MODE_CONFIG[selectedMode].sub}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{topic}"</p>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
              Que ângulo quer explorar?
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Escolha a abordagem — o roteiro vai ser gerado com esse foco.
            </p>

            <div className="space-y-2">
              {angles.map((angle) => (
                <button
                  key={angle.id}
                  onClick={() => handleAngleSelect(angle)}
                  className="w-full flex items-center gap-4 px-4 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm transition text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 dark:group-hover:bg-violet-900 transition">
                    <AngleIcon icon={angle.icon} className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{angle.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{angle.description}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-violet-500 transition flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3l5 5-5 5" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-violet-400 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerando {MODE_CONFIG[selectedMode].label}
            {selectedAngle ? ` · ${selectedAngle.label}` : ""}…
          </p>
        </div>
      )}

      {/* ── ETAPA 3: RESULTADO ── */}
      {step === "result" && result && !loading && (
        <div className="space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.mode === "reels" && <IconInstagram className={`w-4 h-4 ${MODE_CONFIG.reels.color}`} />}
              {result.mode === "story" && <IconStories className={`w-4 h-4 ${MODE_CONFIG.story.color}`} />}
              {result.mode === "shorts" && <IconYouTube className={`w-4 h-4 ${MODE_CONFIG.shorts.color}`} />}
              <span className={`text-sm font-bold ${currentCfg.color}`}>
                {currentCfg.label} · {currentCfg.sub}
              </span>
              {selectedAngle && (
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {selectedAngle.label}
                </span>
              )}
            </div>
            <button onClick={restart} className="text-xs text-violet-600 dark:text-violet-400 font-bold hover:underline">
              Novo conteúdo
            </button>
          </div>

          {/* Referência do que foi escrito */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{topic}"</p>
          </div>

          {/* Ações */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={backToAngles}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:border-violet-400 hover:text-violet-600 transition"
            >
              <IconArrowLeft className="w-3 h-3" />
              Outro ângulo
            </button>
            <button
              onClick={() => selectedAngle && generate(result.mode, selectedAngle)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:border-violet-400 hover:text-violet-600 transition disabled:opacity-50"
            >
              <IconRefresh className="w-3 h-3" />
              Gerar de novo
            </button>
          </div>

          {/* Refinamento (só para Reels/Shorts) */}
          {result.mode !== "story" && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Refinar roteiro</p>
              <div className="flex flex-wrap gap-2">
                {REFINEMENT_BUTTONS.map(({ mode, label }) => (
                  <button
                    key={mode}
                    onClick={() => selectedAngle && generate(result.mode, selectedAngle, mode)}
                    disabled={loading}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition disabled:opacity-50 ${
                      activeRefinement === mode
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-400 hover:text-violet-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stories */}
          {result.mode === "story" && result.stories && (
            <StoriesResult stories={result.stories} copy={copy} copied={copied} />
          )}

          {/* Reels / Shorts */}
          {result.mode !== "story" && result.script && (
            <ReelsResult script={result.script} platform={result.mode as VideoPlatform} copy={copy} copied={copied} />
          )}

          {/* Legenda */}
          {result.caption && (
            <CopyCard
              label={result.mode === "shorts" ? "Descrição para o Shorts" : result.mode === "story" ? "Legenda para o post" : "Legenda para o Reels"}
              text={result.caption}
              copyKey="caption"
              copied={copied}
              onCopy={copy}
              large
            />
          )}

          {/* WhatsApp */}
          {result.mode !== "shorts" && result.whatsapp_variations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <IconMessage className="w-4 h-4 text-violet-500" />
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Mensagem de divulgação para WhatsApp</p>
              </div>
              {result.whatsapp_variations.map((msg, i) => {
                const labels = ["Curta e direta", "Média com contexto", "Persuasiva com urgência", "Reativação de cliente", "Apresentação para novo cliente"];
                return (
                  <CopyCard
                    key={i}
                    label={labels[i] ?? `Variação ${i + 1}`}
                    text={msg}
                    copyKey={`wa-${i}`}
                    copied={copied}
                    onCopy={copy}
                    green
                  />
                );
              })}
            </div>
          )}

          <button
            onClick={restart}
            className="w-full border-2 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400 font-bold py-3.5 rounded-2xl hover:bg-violet-50 dark:hover:bg-violet-950 transition text-sm"
          >
            Criar outro conteúdo
          </button>
        </div>
      )}
    </div>
  );
}

// ── Stories ───────────────────────────────────────────────────────
function StoriesResult({ stories, copy, copied }: { stories: StorySequence; copy: (t: string, k: string) => void; copied: string | null }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Sequência de {stories.stories.length} Stories
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
        {stories.stories.map((slide, i) => {
          const bgClass = (slide.background && STORY_BACKGROUNDS[slide.background]) ? STORY_BACKGROUNDS[slide.background] : "bg-gradient-to-br from-violet-600 to-pink-500";
          const isLight = slide.background === "branco" || slide.background === "creme";
          const textClass = isLight ? "text-gray-900" : "text-white";
          return (
            <div key={i} className={`flex-shrink-0 snap-center w-32 h-56 rounded-2xl flex flex-col justify-between p-3 ${bgClass} shadow-md`}>
              <div><span className={`text-[9px] font-bold uppercase tracking-wide ${textClass} opacity-60`}>{STORY_TYPE_LABELS[slide.type ?? ""] ?? `Slide ${slide.story}`}</span></div>
              <div className="flex-1 flex flex-col justify-center gap-1">
                {slide.emoji && <span className="text-2xl">{slide.emoji}</span>}
                <p className={`text-xs font-bold leading-snug ${textClass}`}>{slide.text}</p>
                {slide.subtext && <p className={`text-[10px] ${textClass} opacity-70 leading-snug`}>{slide.subtext}</p>}
              </div>
              {slide.sticker && slide.sticker !== "nenhum" && (
                <div className={`text-[9px] ${textClass} opacity-70 bg-black/10 rounded-lg px-1.5 py-1 text-center`}>{slide.sticker}</div>
              )}
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        {stories.stories.map((slide, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{slide.story}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">{STORY_TYPE_LABELS[slide.type ?? ""] ?? `Slide ${slide.story}`}</span>
              {slide.background && <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full">{slide.background}</span>}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5 mb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {slide.emoji && <span className="text-base mr-1">{slide.emoji}</span>}
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{slide.text}</span>
                  {slide.subtext && <p className="text-xs text-gray-500 mt-0.5">{slide.subtext}</p>}
                </div>
                <button onClick={() => copy(slide.text + (slide.subtext ? `\n${slide.subtext}` : ""), `slide-${i}`)} className="text-gray-400 hover:text-violet-600">
                  {copied === `slide-${i}` ? <IconCheck className="w-3.5 h-3.5 text-emerald-500" /> : <IconCopy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            {slide.sticker && slide.sticker !== "nenhum" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Sticker:</span>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-2 py-0.5 rounded-full">{slide.sticker}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <CopyCard label="CTA dos Stories" text={stories.cta} copyKey="story-cta" copied={copied} onCopy={copy} />
    </div>
  );
}

// ── Reels / Shorts ────────────────────────────────────────────────
function ReelsResult({ script, platform, copy, copied }: { script: ReelsScript; platform: VideoPlatform; copy: (t: string, k: string) => void; copied: string | null }) {
  return (
    <div className="space-y-3">
      <div className="bg-gray-900 dark:bg-black rounded-2xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <IconFilm className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wide">Roteiro · {platform === "reels" ? "Instagram Reels" : "YouTube Shorts"}</span>
            </div>
            <p className="text-white font-bold text-base leading-snug">{script.title}</p>
          </div>
          <button onClick={() => copy(formatScriptForCopy(script, platform), "script-full")} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-violet-700 text-white hover:bg-violet-600 transition flex-shrink-0 ml-3 flex items-center gap-1.5">
            {copied === "script-full" ? <><IconCheck className="w-3 h-3" /> Copiado</> : <><IconCopy className="w-3 h-3" /> Copiar tudo</>}
          </button>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-1.5"><IconScissors className="w-3.5 h-3.5 text-gray-500" /><span className="text-xs text-gray-300 font-medium">{script.duracaoTotal}</span></div>
          <div className="flex items-center gap-1.5"><IconMusic className="w-3.5 h-3.5 text-gray-500" /><span className="text-xs text-gray-400">{script.vibeEdicao}</span></div>
        </div>
        <div className="bg-violet-900/30 border border-violet-700/30 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <IconLightbulb className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-semibold text-violet-300">Por que esse gancho funciona</span>
          </div>
          <p className="text-xs text-violet-200 leading-relaxed">{script.gancho}</p>
        </div>
        <div className="flex items-start gap-2">
          <IconMusic className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400"><span className="font-medium text-gray-300">Música:</span> {script.musicaSugerida}</p>
        </div>
      </div>
      <div className="space-y-2">
        {script.scenes.map((scene) => {
          const isGancho = scene.scene === 1;
          const isCta = scene.scene === script.scenes.length;
          return (
            <div key={scene.scene} className={`rounded-2xl border overflow-hidden ${isGancho ? "border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950" : isCta ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950" : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"}`}>
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${isGancho ? "bg-violet-600 text-white" : isCta ? "bg-emerald-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}>{scene.scene}</span>
                  <span className={`text-xs font-semibold uppercase tracking-wide ${isGancho ? "text-violet-600 dark:text-violet-400" : isCta ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500"}`}>{isGancho ? "Gancho" : isCta ? "CTA final" : `Cena ${scene.scene}`}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{scene.duracao}</span>
                </div>
                <div className="flex items-start gap-2 mb-2.5">
                  <IconCamera className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed italic">{scene.description}</p>
                </div>
                {scene.fala && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5 mb-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <IconMic className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed italic">"{scene.fala}"</p>
                      </div>
                      <button onClick={() => copy(scene.fala, `fala-${scene.scene}`)} className="text-gray-400 hover:text-violet-600 flex-shrink-0 ml-1 mt-0.5">
                        {copied === `fala-${scene.scene}` ? <IconCheck className="w-3.5 h-3.5 text-emerald-500" /> : <IconCopy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
                {scene.textoNaTela && (
                  <div className="flex items-center gap-2">
                    <IconDisplay className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-400">Texto na tela:</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-2 py-0.5 rounded-full">{scene.textoNaTela}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────
function formatScriptForCopy(script: ReelsScript, platform: VideoPlatform): string {
  const label = platform === "shorts" ? "YOUTUBE SHORTS" : "INSTAGRAM REELS";
  const lines = [`ROTEIRO — ${label}`, script.title, ``, `Duração: ${script.duracaoTotal}`, `Edição: ${script.vibeEdicao}`, `Música: ${script.musicaSugerida}`, ``];
  script.scenes.forEach((scene) => {
    const lbl = scene.scene === 1 ? "GANCHO" : scene.scene === script.scenes.length ? "CTA FINAL" : `CENA ${scene.scene}`;
    lines.push(`─── ${lbl} (${scene.duracao}) ───`);
    lines.push(`Câmera: ${scene.description}`);
    if (scene.fala) lines.push(`Fala: "${scene.fala}"`);
    if (scene.textoNaTela) lines.push(`Texto na tela: ${scene.textoNaTela}`);
    lines.push(``);
  });
  lines.push(`─── ${platform === "shorts" ? "DESCRIÇÃO" : "LEGENDA"} ───`);
  lines.push(script.caption);
  return lines.join("\n");
}

function CopyCard({ label, text, copyKey, copied, onCopy, large, green }: {
  label: string; text: string; copyKey: string; copied: string | null;
  onCopy: (t: string, k: string) => void; large?: boolean; green?: boolean;
}) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border p-4 ${green ? "border-green-100 dark:border-green-900" : "border-gray-100 dark:border-gray-800"}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <button
          onClick={() => onCopy(text, copyKey)}
          className={`text-xs font-semibold px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${green ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 hover:bg-green-200" : "bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 hover:bg-violet-200"}`}
        >
          {copied === copyKey ? <><IconCheck className="w-3 h-3" /> Copiado</> : <><IconCopy className="w-3 h-3" /> Copiar</>}
        </button>
      </div>
      <p className={`text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap ${large ? "text-sm" : "text-xs"}`}>{text}</p>
    </div>
  );
}
