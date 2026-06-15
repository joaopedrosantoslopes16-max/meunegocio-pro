"use client";

import { useState } from "react";
import Link from "next/link";
import { NICHE_CONFIG } from "@/lib/niche-config";
import { phoneInputMask } from "@/lib/whatsapp-utils";
import type { BusinessFormData } from "@/types";

const NICHE_CARDS = [
  { value: "barbearia",        label: "Barbearia",              sub: "Cortes, barba, acabamento" },
  { value: "salao-beleza",     label: "Salão de Beleza",        sub: "Coloração, escova, manicure" },
  { value: "estetica",         label: "Estética",               sub: "Pele, sobrancelha, depilação" },
  { value: "odontologia",      label: "Odontologia",            sub: "Limpeza, clareamento, implante" },
  { value: "clinica-medica",   label: "Clínica Médica",         sub: "Consultas, exames, saúde" },
  { value: "fisioterapia",     label: "Fisioterapia / Pilates", sub: "Reabilitação, dor, postura" },
  { value: "nutricao",         label: "Nutrição",               sub: "Emagrecimento, plano alimentar" },
  { value: "psicologia",       label: "Psicologia",             sub: "Terapia, saúde mental" },
  { value: "personal-trainer", label: "Personal Trainer",       sub: "Treinos, academia, hipertrofia" },
  { value: "coaching",         label: "Coaching / Mentoria",    sub: "Desenvolvimento, carreira, negócios" },
  { value: "otica",            label: "Ótica",                  sub: "Óculos, lentes, exame de vista" },
  { value: "pet-shop",         label: "Pet Shop / Vet",         sub: "Banho, tosa, consulta, vacina" },
  { value: "restaurante",      label: "Restaurante / Café",     sub: "Comida, delivery, lanches" },
  { value: "confeitaria",      label: "Confeitaria / Padaria",  sub: "Bolos, doces, encomendas" },
  { value: "loja-roupa",       label: "Loja de Roupa",          sub: "Moda, acessórios, looks" },
  { value: "fotografia",       label: "Fotografia / Filmagem",  sub: "Ensaios, casamentos, eventos" },
  { value: "imobiliaria",      label: "Imobiliária",            sub: "Venda, aluguel, corretagem" },
  { value: "construcao",       label: "Construção / Reforma",   sub: "Obra, pintura, acabamento" },
  { value: "mecanica",         label: "Mecânica",               sub: "Revisão, manutenção, funilaria" },
  { value: "serralheria",      label: "Serralheria",            sub: "Portões, grades, estruturas" },
  { value: "advogacia",        label: "Advocacia",              sub: "Jurídico, consultoria, causas" },
  { value: "contabilidade",    label: "Contabilidade",          sub: "Fiscal, imposto, empresas" },
  { value: "escola-cursos",    label: "Escola / Cursos",        sub: "Aulas, turmas, certificação" },
  { value: "tatuagem",         label: "Tatuagem / Piercing",    sub: "Arte corporal, estúdio" },
  { value: "outro",            label: "Outro negócio",          sub: "Descreva o que você faz" },
];

const TONE_OPTIONS = [
  { value: "informal",       label: "Próximo e informal",     desc: "\"A gente te ajuda!\" — como um amigo que entende do assunto" },
  { value: "profissional",   label: "Profissional e sério",   desc: "\"Nossa equipe está à disposição\" — transmite credibilidade" },
  { value: "inspirador",     label: "Motivador e inspirador", desc: "\"Você merece o melhor\" — emociona e engaja" },
  { value: "direto",         label: "Direto ao ponto",        desc: "\"Resultado em 30 dias\" — objetivo, sem rodeios" },
];

const GOALS = [
  { id: "novos_clientes", label: "Atrair novos clientes" },
  { id: "whatsapp",       label: "Vender mais pelo WhatsApp" },
  { id: "instagram",      label: "Crescer no Instagram" },
  { id: "fidelizar",      label: "Fidelizar quem já comprou" },
  { id: "autoridade",     label: "Criar autoridade no nicho" },
  { id: "promocoes",      label: "Divulgar promoções" },
  { id: "avaliacoes",     label: "Ganhar mais avaliações" },
  { id: "online",         label: "Vender online" },
];

const TOTAL_STEPS = 6;

const STEP_LABELS = ["Negócio", "Serviços", "Público", "Comunicação", "Objetivos", "Contato"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  done
                    ? "bg-indigo-600 text-white"
                    : active
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : num}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${active ? "text-indigo-600" : done ? "text-indigo-400" : "text-gray-300"}`}>
                {label}
              </span>
            </div>
            {i < TOTAL_STEPS - 1 && (
              <div className={`w-8 sm:w-12 h-0.5 mb-4 mx-1 transition-all duration-300 ${done ? "bg-indigo-400" : "bg-gray-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

type FormState = BusinessFormData & {
  goals: string[];
  tone: string;
  differentiator: string;
  customer_pain: string;
  custom_niche: string;
};

export default function GerarKitPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    business_name: "",
    niche: "",
    city: "",
    whatsapp: "",
    instagram: "",
    address: "",
    main_service: "",
    services: "",
    primary_color: "#6366f1",
    tagline: "",
    target_audience: "",
    goals: [],
    tone: "",
    differentiator: "",
    customer_pain: "",
    custom_niche: "",
  });

  const selectedNiche = form.niche ? NICHE_CONFIG[form.niche] : null;

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleGoal(id: string) {
    setForm((prev) => ({
      ...prev,
      goals: prev.goals.includes(id)
        ? prev.goals.filter((g) => g !== id)
        : [...prev.goals, id],
    }));
  }

  function canAdvance(): boolean {
    if (step === 1) {
      if (!form.business_name.trim() || !form.niche) return false;
      if (form.niche === "outro" && !form.custom_niche.trim()) return false;
      return true;
    }
    if (step === 2) return !!form.main_service.trim();
    if (step === 3) return !!form.target_audience?.trim() && !!form.city.trim();
    if (step === 4) return !!form.tone;
    if (step === 5) return form.goals.length > 0;
    if (step === 6) return !!form.whatsapp.trim();
    return true;
  }

  function next() {
    if (!canAdvance()) {
      setError("Preencha os campos obrigatórios para continuar.");
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    if (!canAdvance()) {
      setError("Preencha o WhatsApp para continuar.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/kit/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao gerar o kit."); setLoading(false); return; }
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            MeuNegócio Pro
          </Link>
          <span className="text-xs text-gray-400 font-medium">Etapa {step} de {TOTAL_STEPS}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator current={step} />

        {/* ── STEP 1: Nome + Nicho ─────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sobre o seu negócio</h1>
              <p className="text-gray-500 mt-1 text-sm">Essas informações personalizam tudo que será criado para você.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome do negócio <span className="text-red-400">*</span>
              </label>
              <input
                value={form.business_name}
                onChange={(e) => set("business_name", e.target.value)}
                placeholder="Ex: Barbearia Elite, Clínica Dra. Ana..."
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Qual é o seu segmento? <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {NICHE_CARDS.map((n) => {
                  const active = form.niche === n.value;
                  return (
                    <button
                      key={n.value}
                      type="button"
                      onClick={() => set("niche", n.value)}
                      className={`text-left p-3.5 rounded-xl border-2 transition-all duration-150 cursor-pointer ${
                        active
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <p className={`text-sm font-semibold leading-tight ${active ? "text-indigo-700" : "text-gray-800"}`}>
                        {n.label}
                      </p>
                      <p className={`text-xs mt-0.5 leading-tight ${active ? "text-indigo-500" : "text-gray-400"}`}>
                        {n.sub}
                      </p>
                    </button>
                  );
                })}
              </div>

              {form.niche === "outro" && (
                <div className="mt-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Qual é o seu segmento exato? <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.custom_niche}
                    onChange={(e) => set("custom_niche", e.target.value)}
                    placeholder="Ex: Escola de dança, Clínica veterinária, Loja de suplementos..."
                    style={{ color: "#111827", backgroundColor: "#ffffff" }}
                    className="w-full border border-indigo-200 bg-indigo-50/30 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Quanto mais específico, melhor o sistema entende o seu negócio.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: Serviços + Diferencial ───────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">O que você oferece</h1>
              <p className="text-gray-500 mt-1 text-sm">Quanto mais específico, mais precisos ficam seus conteúdos.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Serviço principal <span className="text-red-400">*</span>
              </label>
              {selectedNiche && (
                <p className="text-xs text-indigo-500 mb-2">Sugestão: {selectedNiche.services[0]}</p>
              )}
              <input
                value={form.main_service}
                onChange={(e) => set("main_service", e.target.value)}
                placeholder={selectedNiche?.services[0] ?? "Ex: Corte masculino, Clareamento dental..."}
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Outros serviços que você oferece
                <span className="text-gray-400 font-normal ml-1">(separados por vírgula)</span>
              </label>
              {selectedNiche && (
                <p className="text-xs text-indigo-500 mb-2">Sugestão: {selectedNiche.services.join(", ")}</p>
              )}
              <input
                value={form.services}
                onChange={(e) => set("services", e.target.value)}
                placeholder="Ex: Barba, Sobrancelha, Progressiva..."
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                O que te diferencia da concorrência?
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Atendimento, localização, preço, resultado, tecnologia, experiência — o que te faz diferente?
              </p>
              <textarea
                value={form.differentiator}
                onChange={(e) => set("differentiator", e.target.value)}
                placeholder="Ex: Atendimento humanizado com hora marcada, sem fila. Usamos produtos importados e o resultado dura 3x mais que a média..."
                rows={3}
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Frase que define o seu negócio
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <input
                value={form.tagline ?? ""}
                onChange={(e) => set("tagline", e.target.value)}
                placeholder="Ex: Tradição e qualidade desde 2010"
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        )}

        {/* ── STEP 3: Público-alvo ─────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Para quem você vende</h1>
              <p className="text-gray-500 mt-1 text-sm">Esse é o campo mais importante. Quanto mais detalhe você der, mais personalizados ficam seus conteúdos.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Descreva o seu cliente ideal <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Pense em quem compra de você com mais frequência. Idade, situação de vida, o que essa pessoa quer e o que ela teme.
              </p>
              <textarea
                value={form.target_audience ?? ""}
                onChange={(e) => set("target_audience", e.target.value)}
                placeholder={
                  form.niche === "personal-trainer"
                    ? "Ex: Mulheres de 30 a 50 anos que querem emagrecer e ganhar disposição, mas não têm tempo para academia convencional. Muitas são mães, trabalham fora e buscam um treino que caiba na rotina delas..."
                    : form.niche === "barbearia"
                    ? "Ex: Homens de 20 a 40 anos que se preocupam com a aparência profissional. Trabalham no mercado formal ou têm seu próprio negócio. Querem atendimento de qualidade sem esperar horas..."
                    : form.niche === "estetica"
                    ? "Ex: Mulheres de 25 a 45 anos que investem em autocuidado e querem se sentir mais bonitas e confiantes no dia a dia. Geralmente indicam o serviço para amigas..."
                    : "Ex: Pessoas de [faixa etária] que [situação de vida]. Elas querem [objetivo] mas enfrentam [dificuldade]. Geralmente [característica marcante]..."
                }
                rows={5}
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Qual a maior dor ou problema que seu cliente resolve ao te contratar?
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Esse é o problema que faz o cliente finalmente te buscar. É o que aparece nos conteúdos que mais convertem.
              </p>
              <textarea
                value={form.customer_pain}
                onChange={(e) => set("customer_pain", e.target.value)}
                placeholder="Ex: A pessoa estava há meses tentando emagrecer sozinha sem resultado. Estava desmotivada e com autoestima baixa..."
                rows={3}
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Cidade de atendimento <span className="text-red-400">*</span>
              </label>
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Ex: São Paulo – SP"
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        )}

        {/* ── STEP 4: Tom de voz ───────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Como você se comunica</h1>
              <p className="text-gray-500 mt-1 text-sm">Isso define o tom de todos os textos gerados — posts, legendas, roteiros e mensagens de WhatsApp.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Escolha o tom que representa o seu negócio <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2.5">
                {TONE_OPTIONS.map((t) => {
                  const active = form.tone === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set("tone", t.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer ${
                        active
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold ${active ? "text-indigo-700" : "text-gray-800"}`}>
                          {t.label}
                        </p>
                        {active && (
                          <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${active ? "text-indigo-500" : "text-gray-400"}`}>{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: Objetivos ────────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">O que você quer conquistar</h1>
              <p className="text-gray-500 mt-1 text-sm">Selecione todos que fazem sentido para o seu momento atual.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {GOALS.map((g) => {
                const selected = form.goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGoal(g.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer ${
                      selected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                      selected ? "bg-indigo-500 border-indigo-500" : "border-gray-300"
                    }`}>
                      {selected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium leading-tight ${selected ? "text-indigo-700" : "text-gray-700"}`}>
                      {g.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {form.goals.length > 0 && (
              <p className="text-xs text-indigo-600 font-medium">
                {form.goals.length} objetivo{form.goals.length > 1 ? "s" : ""} selecionado{form.goals.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}

        {/* ── STEP 6: Contato + Visual ─────────────────────────── */}
        {step === 6 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Como te encontrar</h1>
              <p className="text-gray-500 mt-1 text-sm">Usados no mini site e nas mensagens de WhatsApp geradas.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                WhatsApp <span className="text-red-400">*</span>
              </label>
              <input
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", phoneInputMask(e.target.value))}
                placeholder="(11) 99999-9999"
                type="tel"
                maxLength={16}
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Instagram <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                value={form.instagram}
                onChange={(e) => set("instagram", e.target.value)}
                placeholder="@seunegocio"
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Endereço <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Rua das Flores, 123 — Bairro"
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cor principal da marca
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => set("primary_color", e.target.value)}
                  className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-700">{form.primary_color}</p>
                  <p className="text-xs text-gray-400">Usada nos posts e no seu mini site</p>
                </div>
              </div>
            </div>

            {/* Resumo final */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Resumo do seu perfil</p>
              <div className="space-y-1.5">
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400 w-28 flex-shrink-0">Negócio</span>
                  <span className="text-gray-800 font-medium">{form.business_name} — {NICHE_CARDS.find(n => n.value === form.niche)?.label}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400 w-28 flex-shrink-0">Serviço</span>
                  <span className="text-gray-800">{form.main_service}</span>
                </div>
                {form.target_audience && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-gray-400 w-28 flex-shrink-0">Público</span>
                    <span className="text-gray-800">{form.target_audience.slice(0, 70)}{form.target_audience.length > 70 ? "..." : ""}</span>
                  </div>
                )}
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400 w-28 flex-shrink-0">Tom</span>
                  <span className="text-gray-800">{TONE_OPTIONS.find(t => t.value === form.tone)?.label}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400 w-28 flex-shrink-0">Objetivos</span>
                  <span className="text-gray-800">{form.goals.map(g => GOALS.find(go => go.id === g)?.label).filter(Boolean).join(", ")}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Navegação */}
        <div className="mt-8 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={back}
              className="flex-shrink-0 px-6 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
            >
              Voltar
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={next}
              disabled={!canAdvance()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl text-sm transition"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !canAdvance()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Criando seu perfil...
                </>
              ) : (
                "Criar perfil e acessar o sistema"
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
