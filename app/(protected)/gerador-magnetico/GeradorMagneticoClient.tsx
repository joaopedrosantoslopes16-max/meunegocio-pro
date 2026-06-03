"use client";

import { useState } from "react";
import type { Business, Narrative, ReelsScript, CarouselContent, StorySequence, ContentFormat } from "@/types";
import { QUICK_TOPIC_SUGGESTIONS } from "@/lib/ai-content-service";
import { NICHE_CONFIG } from "@/lib/niche-config";

type Step = "topic" | "narrative" | "headline" | "format" | "result";

interface GenerationResult {
  id: string | null;
  narratives: Narrative[];
  headlines: string[];
  script: ReelsScript | null;
  carousel: CarouselContent | null;
  stories: StorySequence | null;
  caption: string;
  whatsapp_message: string;
  format: ContentFormat;
}

const FORMAT_OPTIONS: { id: ContentFormat; label: string; desc: string; proOnly?: boolean }[] = [
  { id: "reels",     label: "Reels",            desc: "Roteiro completo com cenas e falas",        proOnly: true },
  { id: "carrossel", label: "Carrossel",         desc: "Slides com título, corpo e CTA" },
  { id: "story",     label: "Stories",           desc: "Sequência de 4 stories com pergunta e CTA", proOnly: true },
  { id: "post",      label: "Post único",        desc: "Texto + legenda + CTA" },
  { id: "whatsapp",  label: "Mensagem WhatsApp", desc: "Mensagem direta para enviar no WhatsApp" },
];

interface Props {
  business: Business;
  planName: "essencial" | "pro";
}

export default function GeradorMagneticoClient({ business, planName }: Props) {
  const [step, setStep] = useState<Step>("topic");
  const [topic, setTopic] = useState("");
  const [selectedNarrative, setSelectedNarrative] = useState<Narrative | null>(null);
  const [selectedHeadline, setSelectedHeadline] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<ContentFormat>("carrossel");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [editedNarrativeTitles, setEditedNarrativeTitles] = useState<string[]>([]);
  const [selectedNarrativeIndex, setSelectedNarrativeIndex] = useState<number | null>(null);
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [editedHeadlines, setEditedHeadlines] = useState<string[]>([]);
  const [selectedHeadlineIndex, setSelectedHeadlineIndex] = useState<number | null>(null);

  const isPro = planName === "pro";
  const cfg = NICHE_CONFIG[business.niche] ?? NICHE_CONFIG.outro;

  const STEPS: { id: Step; label: string }[] = [
    { id: "topic",     label: "Tema" },
    { id: "narrative", label: "Narrativa" },
    { id: "headline",  label: "Headline" },
    { id: "format",    label: "Formato" },
    { id: "result",    label: "Resultado" },
  ];

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function fetchNarrativesAndHeadlines() {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/content-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: business.id, topic, format: "post" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao gerar ideias."); return; }
      setNarratives(data.narratives ?? []);
      setEditedNarrativeTitles((data.narratives ?? []).map((n: Narrative) => n.title));
      setSelectedNarrativeIndex(null);
      setHeadlines(data.headlines ?? []);
      setEditedHeadlines(data.headlines ?? []);
      setSelectedHeadlineIndex(null);
      setStep("narrative");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function generateResult() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/content-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          topic,
          format: selectedFormat,
          narrative: selectedNarrative?.title,
          headline: selectedHeadline,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.upgrade) {
          setError("Esse formato é exclusivo do plano Pro. Faça upgrade para acessar.");
        } else {
          setError(data.error ?? "Erro ao gerar conteúdo.");
        }
        return;
      }
      setResult(data);
      setStep("result");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setStep("topic");
    setTopic("");
    setSelectedNarrative(null);
    setSelectedHeadline("");
    setSelectedFormat("carrossel");
    setResult(null);
    setError(null);
    setNarratives([]);
    setEditedNarrativeTitles([]);
    setSelectedNarrativeIndex(null);
    setHeadlines([]);
    setEditedHeadlines([]);
    setSelectedHeadlineIndex(null);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
          Gerador de Conteúdos Magnéticos
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          O que você quer divulgar hoje?
        </h1>
        <p className="text-gray-500 text-sm">
          Digite um tema, escolha narrativa e formato — receba post, roteiro e mensagem prontos.
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < stepIndex ? "bg-violet-600 text-white" :
              i === stepIndex ? "bg-violet-600 text-white ring-4 ring-violet-100" :
              "bg-gray-100 text-gray-400"
            }`}>
              {i < stepIndex ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === stepIndex ? "text-violet-700" : "text-gray-400"}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-0.5 mx-1 ${i < stepIndex ? "bg-violet-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-6 text-sm text-red-700">
          {error}
          {error.includes("Pro") && (
            <a href={process.env.NEXT_PUBLIC_CHECKOUT_URL_PRO ?? "#"} className="ml-2 font-bold underline">
              Fazer upgrade →
            </a>
          )}
        </div>
      )}

      {/* ── ETAPA 1: Tema ── */}
      {step === "topic" && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
              Sobre o que você quer criar conteúdo hoje?
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={`Ex: Promoção da semana, agenda aberta, dica sobre ${business.main_service}…`}
              rows={3}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">Seja específico — mais contexto = conteúdo mais certeiro.</p>
          </div>

          {/* Sugestões rápidas */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-2">Sugestões rápidas</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_TOPIC_SUGGESTIONS.map((s) => (
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

          <button
            onClick={fetchNarrativesAndHeadlines}
            disabled={!topic.trim() || loading}
            className="w-full gradient-brand text-white font-bold py-4 rounded-2xl hover:opacity-90 transition disabled:opacity-50 text-sm"
          >
            {loading ? "Gerando ideias…" : "Gerar ideias →"}
          </button>
        </div>
      )}

      {/* ── ETAPA 2: Narrativa ── */}
      {step === "narrative" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-gray-900 dark:text-white">Escolha a narrativa</h2>
            <button onClick={() => setStep("topic")} className="text-xs text-gray-400 hover:text-gray-600">← Voltar</button>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Tema: <span className="font-bold text-violet-600">"{topic}"</span>
          </p>
          <p className="text-xs text-gray-400 mb-2">Clique para selecionar. Toque no título para editar.</p>
          {narratives.map((n, i) => (
            <div
              key={i}
              onClick={() => setSelectedNarrativeIndex(i)}
              className={`w-full text-left border rounded-2xl px-5 py-4 cursor-pointer transition hover:border-violet-300 hover:shadow-sm ${
                selectedNarrativeIndex === i
                  ? "border-violet-400 bg-violet-50 dark:bg-violet-950"
                  : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
              }`}
            >
              <input
                value={editedNarrativeTitles[i] ?? n.title}
                onChange={(e) => {
                  const updated = [...editedNarrativeTitles];
                  updated[i] = e.target.value;
                  setEditedNarrativeTitles(updated);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full font-bold text-gray-900 dark:text-white text-sm leading-snug mb-1 bg-transparent focus:outline-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{n.description}</p>
            </div>
          ))}
          <button
            onClick={() => {
              if (selectedNarrativeIndex !== null) {
                setSelectedNarrative({
                  ...narratives[selectedNarrativeIndex],
                  title: editedNarrativeTitles[selectedNarrativeIndex],
                });
                setStep("headline");
              }
            }}
            disabled={selectedNarrativeIndex === null}
            className="w-full gradient-brand text-white font-bold py-4 rounded-2xl hover:opacity-90 transition disabled:opacity-50 text-sm mt-2"
          >
            Continuar →
          </button>
        </div>
      )}

      {/* ── ETAPA 3: Headline ── */}
      {step === "headline" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-gray-900 dark:text-white">Escolha a headline</h2>
            <button onClick={() => setStep("narrative")} className="text-xs text-gray-400 hover:text-gray-600">← Voltar</button>
          </div>
          {selectedNarrative && (
            <div className="bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-900 rounded-xl px-4 py-2.5 text-sm font-medium text-violet-700 dark:text-violet-300 mb-2">
              {selectedNarrative.title}
            </div>
          )}
          <p className="text-xs text-gray-400 mb-2">Clique para selecionar. Toque no texto para editar.</p>
          {editedHeadlines.map((h, i) => (
            <div
              key={i}
              onClick={() => setSelectedHeadlineIndex(i)}
              className={`w-full text-left border rounded-2xl p-4 cursor-pointer transition hover:border-violet-300 ${
                selectedHeadlineIndex === i
                  ? "border-violet-400 bg-violet-50 dark:bg-violet-950"
                  : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 w-6 h-6 rounded-lg font-bold flex-shrink-0 flex items-center justify-center">
                  {i + 1}
                </span>
                <input
                  value={h}
                  onChange={(e) => {
                    const updated = [...editedHeadlines];
                    updated[i] = e.target.value;
                    setEditedHeadlines(updated);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-transparent focus:outline-none leading-snug"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              if (selectedHeadlineIndex !== null) {
                setSelectedHeadline(editedHeadlines[selectedHeadlineIndex]);
                setStep("format");
              }
            }}
            disabled={selectedHeadlineIndex === null}
            className="w-full gradient-brand text-white font-bold py-4 rounded-2xl hover:opacity-90 transition disabled:opacity-50 text-sm mt-2"
          >
            Continuar →
          </button>
        </div>
      )}

      {/* ── ETAPA 4: Formato ── */}
      {step === "format" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-900 dark:text-white">Escolha o formato</h2>
            <button onClick={() => setStep("headline")} className="text-xs text-gray-400 hover:text-gray-600">← Voltar</button>
          </div>
          {selectedHeadline && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 mb-2 italic">
              "{selectedHeadline}"
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FORMAT_OPTIONS.map((f) => {
              const locked = f.proOnly && !isPro;
              return (
                <button
                  key={f.id}
                  onClick={() => { if (!locked) setSelectedFormat(f.id); }}
                  className={`relative text-left border rounded-2xl p-4 transition ${
                    locked ? "opacity-50 cursor-not-allowed border-gray-100 dark:border-gray-800" :
                    selectedFormat === f.id ? "border-violet-400 bg-violet-50 dark:bg-violet-950 shadow-sm" :
                    "border-gray-200 dark:border-gray-700 hover:border-violet-300 bg-white dark:bg-gray-900"
                  }`}
                >
                  {locked && (
                    <span className="absolute top-2 right-2 text-xs bg-yellow-400 text-yellow-900 font-bold px-1.5 py-0.5 rounded-full">Pro</span>
                  )}
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{f.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{f.desc}</p>
                </button>
              );
            })}
          </div>

          {!isPro && (
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Reels e Stories disponíveis no Pro</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-2">Desbloqueie roteiros para Reels, Stories, narrativas magnéticas e posts com imagens.</p>
              <a href={process.env.NEXT_PUBLIC_CHECKOUT_URL_PRO ?? "#"} className="text-xs font-bold text-yellow-800 dark:text-yellow-300 underline">
                Fazer upgrade para Pro →
              </a>
            </div>
          )}

          <button
            onClick={generateResult}
            disabled={loading}
            className="w-full gradient-brand text-white font-bold py-4 rounded-2xl hover:opacity-90 transition disabled:opacity-50 text-sm"
          >
            {loading ? "Gerando conteúdo…" : `Gerar ${FORMAT_OPTIONS.find((f) => f.id === selectedFormat)?.label}`}
          </button>
        </div>
      )}

      {/* ── ETAPA 5: Resultado ── */}
      {step === "result" && result && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Seu conteúdo está pronto</h2>
            <button onClick={restart} className="text-xs text-violet-600 font-bold hover:underline">
              Novo conteúdo
            </button>
          </div>

          {/* Info do tema */}
          <div className="bg-violet-50 dark:bg-violet-950 border border-violet-100 dark:border-violet-900 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-violet-700 dark:text-violet-300">{topic}</p>
              {result.format && (
                <p className="text-xs text-violet-500 dark:text-violet-400 mt-0.5">
                  Formato: {FORMAT_OPTIONS.find((f) => f.id === result.format)?.label}
                </p>
              )}
            </div>
          </div>

          {/* ─ REELS ─ */}
          {result.script && (
            <div className="space-y-3">
              <SectionTitle title={`Roteiro para Reels — ${result.script.title}`} />
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {result.script.scenes.map((scene) => (
                  <div key={scene.scene} className="border-b border-gray-50 dark:border-gray-800 last:border-0 p-4">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {scene.scene}
                      </span>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{scene.description}</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed italic">"{scene.fala}"</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3">
                  <p className="text-xs text-gray-400 mb-1">Texto na tela</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{result.script.screen_text}</p>
                </div>
              </div>
            </div>
          )}

          {/* ─ CARROSSEL ─ */}
          {result.carousel && (
            <div className="space-y-3">
              <SectionTitle title={`Carrossel — ${result.carousel.theme}`} />
              <div className="space-y-2">
                {result.carousel.slides.map((slide) => (
                  <div key={slide.slide} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {slide.slide}
                    </span>
                    <p className={`text-sm leading-snug ${slide.slide === 1 ? "font-extrabold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                      {slide.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─ STORIES ─ */}
          {result.stories && (
            <div className="space-y-3">
              <SectionTitle title="Sequência de Stories" />
              <div className="space-y-2">
                {result.stories.stories.map((s) => (
                  <div key={s.story} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                      s.type === "pergunta" ? "bg-blue-100 text-blue-700" :
                      s.type === "caixinha" ? "bg-yellow-100 text-yellow-700" :
                      "bg-violet-100 text-violet-700"
                    }`}>
                      {s.story}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.text}</p>
                      {s.type && <span className="text-xs text-gray-400">{s.type}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <CopyCard label="CTA final" text={result.stories.cta} copyKey="story-cta" copied={copied} onCopy={copy} />
            </div>
          )}

          {/* ─ LEGENDA ─ */}
          <CopyCard label="Legenda" text={result.caption} copyKey="caption" copied={copied} onCopy={copy} large />

          {/* ─ MENSAGEM WA ─ */}
          <CopyCard label="Mensagem para WhatsApp" text={result.whatsapp_message} copyKey="whatsapp" copied={copied} onCopy={copy} green />

          {/* ─ Novo conteúdo ─ */}
          <button
            onClick={restart}
            className="w-full border-2 border-violet-200 text-violet-700 font-bold py-3.5 rounded-2xl hover:bg-violet-50 transition text-sm"
          >
            Criar outro conteúdo
          </button>
        </div>
      )}
    </div>
  );
}

// ── Componentes auxiliares ──────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1 h-4 rounded-full bg-violet-500 flex-shrink-0" />
      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</p>
    </div>
  );
}

function CopyCard({
  label, text, copyKey, copied, onCopy, large, green,
}: {
  label: string;
  text: string;
  copyKey: string;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
  large?: boolean;
  green?: boolean;
}) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border p-4 ${green ? "border-green-100 dark:border-green-900" : "border-gray-100 dark:border-gray-800"}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
        <button
          onClick={() => onCopy(text, copyKey)}
          className={`text-xs font-bold px-3 py-1 rounded-lg transition ${
            green
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-violet-100 text-violet-700 hover:bg-violet-200"
          }`}
        >
          {copied === copyKey ? "Copiado!" : "Copiar"}
        </button>
      </div>
      <p className={`text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap ${large ? "text-sm" : "text-xs"}`}>
        {text}
      </p>
    </div>
  );
}
