"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Globe, ImageIcon, PenLine, CalendarDays, Megaphone,
  MessageSquare, RefreshCw, Sparkles, Target, CloudUpload,
  Lightbulb, Smartphone, Lock, Database, Scissors, Headphones,
  ShieldCheck, Pencil, Eye, CheckCircle2, ChevronDown, ArrowRight,
  DollarSign, Package
} from "lucide-react";
import { NICHE_CONFIG, NICHE_OPTIONS } from "@/lib/niche-config";
import { buildWhatsAppLink } from "@/lib/whatsapp-utils";
import { generateInstagramBio, generateCaptions, generateWhatsAppMessages } from "@/lib/kit-generator";
import PostCard from "@/components/PostCard";
import PlanComparison from "@/components/PlanComparison";
import ThemeToggle from "@/components/ThemeToggle";
import type { PreviewData } from "@/types";

// ============================================================
// LINKS DE CHECKOUT — configure no .env.local
const CHECKOUT_URL        = process.env.NEXT_PUBLIC_CHECKOUT_URL                 ?? "https://SEU-LINK-CHECKOUT-ESSENCIAL-AQUI.com";
const CHECKOUT_URL_PRO    = process.env.NEXT_PUBLIC_CHECKOUT_URL_PRO             ?? "https://SEU-LINK-CHECKOUT-PRO-AQUI.com";
const CHECKOUT_INSTAGRAM  = process.env.NEXT_PUBLIC_CHECKOUT_INSTAGRAM_EXTRA     ?? "#";
const CHECKOUT_STORIES    = process.env.NEXT_PUBLIC_CHECKOUT_STORIES             ?? "#";
const CHECKOUT_REATIVACAO = process.env.NEXT_PUBLIC_CHECKOUT_REATIVACAO          ?? "#";
const PRICE_ESSENTIAL     = "R$ 37/mês";
const PRICE_PRO           = "R$ 57/mês";
const PRICE               = PRICE_ESSENTIAL;
// ============================================================

interface FormState {
  business_name: string; niche: string; city: string; whatsapp: string;
  instagram: string; main_service: string; primary_color: string;
}

const KIT_CARDS = [
  { Icon: Globe,       title: "Mini site com WhatsApp",        desc: "Link profissional para bio do Instagram, Google e WhatsApp. Sem domínio, sem hospedagem." },
  { Icon: ImageIcon,   title: "30 posts mensais personalizados", desc: "Posts prontos para o Instagram adaptados ao nicho do seu negócio. Só copiar e usar." },
  { Icon: PenLine,     title: "30 legendas mensais",            desc: "Textos em português, com chamada para ação e o nome do seu negócio." },
  { Icon: CalendarDays,title: "Calendário de postagem",         desc: "O que postar em cada dia da semana — sem precisar pensar do zero." },
  { Icon: Megaphone,   title: "Campanhas prontas",              desc: "Promoção da semana, agenda aberta, recuperar clientes — com post, legenda e mensagem." },
  { Icon: MessageSquare,title:"10 mensagens para WhatsApp",     desc: "Para chamar clientes novos, antigos, avisar promoções e pedir avaliação." },
  { Icon: RefreshCw,   title: "Mensagens para recuperar clientes", desc: "Para quem sumiu, pediu preço e não respondeu, ou que não aparece há tempo." },
  { Icon: Sparkles,    title: "Post de hoje",                   desc: "Sem ideia do que postar? Escolha o objetivo e receba post + legenda + mensagem na hora." },
  { Icon: Target,      title: "Leads do seu mini site",         desc: "Quando alguém se cadastrar no site, você recebe o contato no painel para chamar no WhatsApp." },
  { Icon: CloudUpload, title: "Materiais salvos na conta",      desc: "Tudo salvo em qualquer dispositivo. Fechou o app e voltou depois — está tudo lá." },
];

const WHY_ITEMS = [
  { Icon: Lightbulb,    title: "Nunca mais fica sem ideia do que postar",  desc: "O sistema gera o conteúdo do mês pra você. Você só copia, posta e responde os clientes." },
  { Icon: ShieldCheck,  title: "Seu negócio parece mais profissional",     desc: "Mini site bonito, posts com identidade e mensagens com linguagem certa fazem diferença na percepção do cliente." },
  { Icon: Smartphone,   title: "O cliente chega direto no seu WhatsApp",   desc: "O botão de WhatsApp está em destaque no seu site. Um clique e o cliente já está na sua conversa." },
  { Icon: Package,      title: "Conteúdo novo todo mês",                   desc: "Enquanto sua assinatura estiver ativa, você recebe novos posts, legendas e campanhas todos os meses." },
  { Icon: Lock,         title: "Seus materiais nunca somem",               desc: "Trocou de celular? Fechou o navegador? Login em qualquer aparelho — tudo continua lá." },
];

const TRUST_ITEMS = [
  { Icon: ShieldCheck,   title: "Pagamento seguro",           desc: "Processado por plataformas certificadas (Kirvano, Kiwify ou Hotmart)." },
  { Icon: Database,      title: "Dados salvos na conta",      desc: "Nada fica só no celular. Login em qualquer aparelho, qualquer hora." },
  { Icon: Globe,         title: "Sem domínio ou hospedagem",  desc: "O mini site fica no nosso servidor. Você só usa o link." },
  { Icon: Smartphone,    title: "Funciona em qualquer celular", desc: "Mini site responsivo — iPhone, Android, tablet e computador." },
  { Icon: Scissors,      title: "Cancelamento simples",       desc: "Cancele quando quiser, sem burocracia e sem taxa de saída." },
  { Icon: Headphones,    title: "Suporte disponível",         desc: "Qualquer dúvida, você fala com o suporte por e-mail." },
];

const NICHES = [
  { abbr: "BB", label: "Barbearia",       bg: "bg-blue-100  text-blue-700" },
  { abbr: "OD", label: "Odontologia",     bg: "bg-cyan-100  text-cyan-700" },
  { abbr: "CM", label: "Clínica médica",  bg: "bg-teal-100  text-teal-700" },
  { abbr: "ÓT", label: "Ótica",           bg: "bg-sky-100   text-sky-700" },
  { abbr: "PT", label: "Personal trainer",bg: "bg-orange-100 text-orange-700" },
  { abbr: "ES", label: "Estética",        bg: "bg-pink-100  text-pink-700" },
  { abbr: "LR", label: "Loja de roupa",   bg: "bg-rose-100  text-rose-700" },
  { abbr: "IM", label: "Imobiliária",     bg: "bg-amber-100 text-amber-700" },
  { abbr: "RS", label: "Restaurante",     bg: "bg-red-100   text-red-700" },
  { abbr: "MC", label: "Mecânica",        bg: "bg-slate-100 text-slate-700" },
  { abbr: "SR", label: "Serralheria",     bg: "bg-zinc-100  text-zinc-700" },
  { abbr: "NL", label: "Outro negócio",   bg: "bg-violet-100 text-violet-700" },
];

const FAQ_ITEMS = [
  { q: "Preciso comprar domínio ou pagar hospedagem?", a: "Não. O mini site fica hospedado dentro do sistema. Você recebe um link pronto para usar na bio do Instagram, no Google e no WhatsApp." },
  { q: "Os materiais ficam salvos se eu fechar o navegador?", a: "Sim. Tudo fica salvo na sua conta. Pode fechar, trocar de celular, ficar semanas sem acessar — quando voltar, está tudo lá do jeito que você deixou." },
  { q: "Recebo tudo na hora que assinar?", a: "O mini site ativo e os primeiros materiais são liberados imediatamente após a compra. O restante dos posts e legendas do mês é liberado em até 7 dias — no plano Essencial são 10, no Pro são 30." },
  { q: "Funciona para qualquer tipo de negócio?", a: "Sim. O sistema adapta textos, posts e mensagens para barbearia, clínica, dentista, personal trainer, ótica, restaurante, imobiliária e mais 4 nichos." },
  { q: "Posso cancelar quando quiser?", a: "Sim. Enquanto a assinatura estiver ativa, você recebe os materiais mensais e seu mini site fica no ar. Ao cancelar, o recebimento de novos conteúdos é encerrado e o mini site pode ser pausado — sem taxa e sem multa." },
  { q: "Como funciona o botão de WhatsApp do mini site?", a: "Você informa o número do seu WhatsApp. O sistema gera automaticamente o link wa.me com uma mensagem de boas-vindas pronta. Um clique e o cliente entra na conversa." },
  { q: "O que é a prévia grátis?", a: "Antes de assinar, você preenche os dados do seu negócio e vê como ficaria o mini site, um post de exemplo, uma legenda e uma mensagem de WhatsApp. 100% gratuito, sem cadastro." },
];

// Ícone com fundo colorido
function FeatIcon({ Icon: I, className = "bg-violet-100 text-violet-600" }: { Icon: React.ElementType; className?: string }) {
  return (
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 flex-shrink-0 ${className}`}>
      <I size={20} strokeWidth={1.75} />
    </div>
  );
}

export default function LandingPage() {
  const [form, setForm] = useState<FormState>({
    business_name: "", niche: "", city: "", whatsapp: "", instagram: "", main_service: "", primary_color: "#7c3aed",
  });
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [buyerCount, setBuyerCount] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setBuyerCount(d.count))
      .catch(() => {});
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.business_name || !form.niche || !form.city || !form.whatsapp || !form.main_service) {
      alert("Preencha todos os campos obrigatórios."); return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const cfg = NICHE_CONFIG[form.niche] ?? NICHE_CONFIG.outro;
    const data: PreviewData = {
      business_name: form.business_name, niche: cfg.label, city: form.city,
      whatsapp: form.whatsapp, instagram: form.instagram, main_service: form.main_service,
      primary_color: form.primary_color, cta: cfg.cta,
      sample_post_title: form.main_service,
      sample_post_subtitle: `${cfg.label} em ${form.city}`,
      sample_caption: generateCaptions({ ...form })[0],
      sample_whatsapp_message: generateWhatsAppMessages({ ...form })[0],
      instagram_bio: generateInstagramBio({ ...form }),
    };
    localStorage.setItem("mnp_preview", JSON.stringify(data));
    setPreview(data);
    setLoading(false);
    setTimeout(() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToPlans() {
    plansRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans transition-colors duration-200">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-extrabold text-lg text-gradient-dark">MeuNegócio Pro</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-violet-700 font-medium transition hidden sm:block">
              Área do cliente
            </Link>
            <a href={CHECKOUT_URL} className="text-sm font-bold gradient-brand text-white px-4 py-2 rounded-xl transition shadow-sm hover:opacity-90">
              Assinar por {PRICE}
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="gradient-hero pt-28 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Texto */}
            <div className="text-white">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold px-4 py-2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Marketing mensal para negócios locais
                </div>
                {buyerCount !== null && (
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold px-4 py-2 rounded-full">
                    <span className="text-green-400 font-extrabold">{buyerCount}</span> negócios já usam
                  </div>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
                Seu marketing mensal{" "}
                <span className="text-gradient">pronto para postar</span>
                {" "}e vender pelo WhatsApp
              </h1>

              <p className="text-white/75 text-lg leading-relaxed mb-8 max-w-xl">
                Tenha um mini site ativo para seu negócio e receba todos os meses posts, legendas, campanhas e mensagens prontas para divulgar no Instagram e chamar clientes no WhatsApp.
              </p>

              <ul className="space-y-3 mb-10">
                {[
                  "Mini site ativo com botão de WhatsApp",
                  "Posts e legendas novos todo mês",
                  "Mensagens prontas para chamar clientes",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white/90">
                    <CheckCircle2 size={18} className="text-green-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={scrollToForm} className="inline-flex items-center justify-center gap-2 bg-white text-violet-700 font-extrabold py-4 px-8 rounded-2xl text-base hover:bg-violet-50 transition shadow-xl">
                  Quero ver minha prévia grátis
                  <ArrowRight size={16} />
                </button>
                <button onClick={scrollToPlans} className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold py-4 px-6 rounded-2xl text-base hover:bg-white/20 transition">
                  Ver planos
                </button>
              </div>
              <p className="text-white/40 text-xs mt-4">Sem cadastro. Sem compromisso. Prévia 100% gratuita.</p>
            </div>

            {/* Mockup — mini site profissional */}
            <div className="relative hidden lg:flex justify-center items-center">
              <div className="bg-white rounded-3xl shadow-2xl w-72 overflow-hidden border border-white/10" style={{ maxHeight: "520px", overflowY: "auto" }}>

                {/* Barra do browser */}
                <div className="bg-gray-900 px-3 py-2 flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="text-gray-500 text-xs ml-2 truncate">meunegocio.pro/site/barbearia-elite</span>
                </div>

                {/* Capa do mini site */}
                <div className="relative h-24 flex items-end" style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)" }}>
                  <div className="absolute inset-0 flex items-center justify-end pr-4">
                    <span className="text-5xl opacity-10">✂️</span>
                  </div>
                  <div className="absolute top-2 left-3">
                    <span className="bg-white/15 text-white text-xs font-bold px-2 py-0.5 rounded-full">Barbearia</span>
                  </div>
                  <div className="absolute top-2 right-3">
                    <span className="bg-white/15 text-white text-xs px-2 py-0.5 rounded-full">São Paulo</span>
                  </div>
                </div>

                {/* Perfil */}
                <div className="px-4 pt-0 pb-3">
                  <div className="-mt-7 mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-violet-600 border-2 border-white flex items-center justify-center text-white text-xl font-black shadow-lg">B</div>
                  </div>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-extrabold text-gray-900 text-sm leading-tight">Barbearia Elite</p>
                      <p className="text-gray-400 text-xs">Barbearia · São Paulo</p>
                    </div>
                    <span className="flex items-center gap-1 bg-green-50 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full border border-green-100 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Online
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1 bg-violet-50 border border-violet-100 rounded-lg px-2 py-1 mb-3">
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-sm rotate-45 flex-shrink-0" />
                    <span className="text-xs font-bold text-violet-600">Corte masculino</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="w-full bg-green-500 text-white font-bold text-center py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-green-200">
                      <span>💬</span> Agendar pelo WhatsApp
                    </div>
                    <div className="w-full border border-gray-200 text-gray-600 font-semibold text-center py-2 rounded-xl text-xs">
                      Ver no Instagram
                    </div>
                  </div>
                </div>

                {/* Serviços */}
                <div className="bg-gray-50 px-4 py-3 mx-3 rounded-2xl mb-3">
                  <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">Serviços</p>
                  {[["✂️","Corte masculino"], ["🪒","Barba"], ["💈","Acabamento"]].map(([e, s]) => (
                    <div key={s} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{e}</span>
                        <span className="text-xs font-semibold text-gray-700">{s}</span>
                      </div>
                      <span className="text-xs text-violet-600 font-bold">Falar →</span>
                    </div>
                  ))}
                </div>

                {/* Por que escolher */}
                <div className="px-3 pb-3 space-y-1.5">
                  {[["⚡","Atendimento rápido"],["📍","São Paulo – SP"],["💬","Resposta pelo WhatsApp"]].map(([e, t]) => (
                    <div key={t} className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2">
                      <span className="text-sm">{e}</span>
                      <span className="text-xs font-semibold text-gray-700">{t}</span>
                    </div>
                  ))}
                </div>

                {/* CTA final */}
                <div className="mx-3 mb-3 rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
                  <p className="text-white text-xs font-extrabold mb-2">Quer falar com a Barbearia Elite?</p>
                  <div className="bg-white text-violet-700 font-bold text-xs py-2 rounded-xl">💬 Chamar no WhatsApp</div>
                </div>

              </div>

              {/* Badge flutuante */}
              <div className="absolute -top-3 -right-3 bg-white rounded-2xl shadow-xl px-3 py-2 flex items-center gap-2 border border-violet-100">
                <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Sparkles size={13} className="text-violet-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Site profissional</p>
                  <p className="text-xs text-gray-400">Pronto pra bio do Insta</p>
                </div>
              </div>

              {/* Badge flutuante — lead */}
              <div className="absolute -bottom-3 -left-4 bg-white rounded-2xl shadow-xl px-3 py-2 flex items-center gap-2 border border-green-100">
                <div className="w-7 h-7 rounded-xl bg-green-100 flex items-center justify-center">
                  <Target size={13} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Novo lead recebido</p>
                  <p className="text-xs text-gray-400">João · WhatsApp</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── BARRA DE NÚMEROS ── */}
      <section className="bg-violet-600 py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-10 text-white">
          {[["12", "nichos atendidos"], ["10–30", "posts por mês"], ["A partir de R$ 37", "por mês"], ["100%", "personalizado"]].map(([n, l]) => (
            <div key={l} className="text-center">
              <p className="text-2xl font-extrabold">{n}</p>
              <p className="text-white/65 text-xs mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Simples assim</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-2">Como funciona em 3 passos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { Icon: Pencil, n: "01", title: "Preencha os dados", desc: "Digite o nome do seu negócio, o nicho, a cidade, o WhatsApp e o serviço principal. Leva menos de 2 minutos." },
              { Icon: Eye,    n: "02", title: "Veja a prévia grátis", desc: "Veja na hora como ficaria seu mini site, um post de exemplo, uma legenda e uma mensagem de WhatsApp. Gratuito." },
              { Icon: CheckCircle2, n: "03", title: "Assine e acesse tudo", desc: "Escolha o plano Essencial ou Pro e acesse o painel com mini site ativo, posts, calendário, campanhas e materiais salvos na conta." },
            ].map(({ Icon: I, n, title, desc }) => (
              <div key={n} className="relative text-center group">
                <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <I size={26} strokeWidth={1.5} className="text-white" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 w-6 h-6 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-xs font-extrabold rounded-full flex items-center justify-center">{n}</div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRÉVIA GRÁTIS (FORMULÁRIO) ── */}
      <section ref={formRef} className="py-20 px-4 bg-violet-50 dark:bg-gray-900 scroll-mt-14">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">Teste grátis agora</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">Veja como ficaria o kit do seu negócio</h2>
            <p className="text-gray-500 dark:text-gray-400">Preencha os dados e veja em segundos o mini site, o post e a legenda criados para você. Sem cadastro, sem compromisso.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-violet-100 dark:border-gray-700 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Nome do negócio *</label>
                  <input name="business_name" value={form.business_name} onChange={handleChange} required placeholder="Ex: Barbearia do João, Clínica Sorriso" className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tipo de negócio *</label>
                  <select name="niche" value={form.niche} onChange={handleChange} required className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition">
                    <option value="">Selecione o nicho...</option>
                    {NICHE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Cidade *</label>
                  <input name="city" value={form.city} onChange={handleChange} required placeholder="Ex: São Paulo – SP" className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">WhatsApp *</label>
                  <input name="whatsapp" value={form.whatsapp} onChange={handleChange} required placeholder="(11) 99999-9999" className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Serviço principal *</label>
                  <input name="main_service" value={form.main_service} onChange={handleChange} required placeholder="Ex: Corte masculino, Limpeza dental" className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Cor da marca</label>
                  <div className="flex items-center gap-3">
                    <input type="color" name="primary_color" value={form.primary_color} onChange={handleChange} className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer" />
                    <span className="text-sm text-gray-400 font-mono">{form.primary_color}</span>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full gradient-cta text-white font-extrabold py-4 rounded-2xl text-base hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-violet-200">
                {loading ? (
                  <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Gerando sua prévia...</>
                ) : (<>Gerar minha prévia grátis <ArrowRight size={16} /></>)}
              </button>
              <p className="text-center text-xs text-gray-400">Gratuito · Sem cadastro · Sem compromisso</p>
            </form>
          </div>
        </div>
      </section>

      {/* ── RESULTADO DA PRÉVIA ── */}
      {preview && (
        <section ref={previewRef} className="py-16 px-4 bg-white dark:bg-gray-900 scroll-mt-14">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-bold px-5 py-2.5 rounded-full mb-4">
                <CheckCircle2 size={16} />
                Prévia criada para {preview.business_name}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">É assim que ficaria o seu kit</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Amostra do kit. O plano completo tem 30 posts, calendário, campanhas e muito mais.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* MINI SITE PREVIEW — fiel ao design real */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Browser bar */}
                <div className="bg-gray-900 px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-gray-400 text-xs ml-1 truncate">
                    meunegocio.pro/site/{preview.business_name.toLowerCase().replace(/\s+/g, "-")}
                  </span>
                </div>

                {/* Mini site real — hero com gradiente */}
                <div style={{ background: `linear-gradient(160deg, ${preview.primary_color}f0, ${preview.primary_color}bb)`, padding: "28px 20px 36px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "160px", height: "160px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)" }} />
                  <div className="text-center" style={{ position: "relative", zIndex: 1 }}>
                    <div style={{
                      width: "56px", height: "56px", borderRadius: "16px", margin: "0 auto 12px",
                      background: "rgba(255,255,255,0.20)", backdropFilter: "blur(8px)",
                      border: "2px solid rgba(255,255,255,0.30)", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: "22px", fontWeight: 900, color: "#fff"
                    }}>
                      {preview.business_name[0]}
                    </div>
                    <p style={{ fontSize: "17px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: "3px" }}>
                      {preview.business_name}
                    </p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", fontWeight: 600, marginBottom: "16px" }}>
                      {preview.niche} · {preview.city}
                    </p>
                    <a href={buildWhatsAppLink(preview.whatsapp)} target="_blank" rel="noopener noreferrer" style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                      background: "#25D366", color: "#fff", fontWeight: 800, fontSize: "13px",
                      padding: "11px 0", borderRadius: "10px", textDecoration: "none",
                      boxShadow: "0 4px 16px rgba(37,211,102,0.40)"
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      Chamar no WhatsApp
                    </a>
                  </div>
                  {/* Wave */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "28px", background: "#fff", clipPath: "ellipse(55% 100% at 50% 100%)" }} />
                </div>

                {/* Seção de serviços mini */}
                <div style={{ padding: "16px 20px 20px", background: "#fff" }}>
                  <p style={{ fontSize: "10px", fontWeight: 700, color: preview.primary_color, letterSpacing: "0.20em", textTransform: "uppercase", marginBottom: "8px" }}>
                    Serviços
                  </p>
                  <div style={{ background: `${preview.primary_color}10`, border: `1px solid ${preview.primary_color}25`, borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: preview.primary_color, flexShrink: 0 }} />
                    <p style={{ fontSize: "13px", fontWeight: 800, color: "#111" }}>{preview.main_service}</p>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {["Contato", "WhatsApp", "Instagram"].map((s) => (
                      <div key={s} style={{ background: "#f5f5f5", borderRadius: "6px", padding: "5px 8px" }}>
                        <p style={{ fontSize: "10px", fontWeight: 600, color: "#555" }}>{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* POST PREVIEW — usa PostCard real */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Post de exemplo</span>
                  </div>
                  <span className="text-xs bg-violet-50 text-violet-600 font-bold px-2 py-0.5 rounded-full">1080×1080</span>
                </div>
                <PostCard
                  template_type="main_service"
                  title={preview.sample_post_title}
                  subtitle={preview.sample_post_subtitle}
                  cta={preview.cta}
                  business_name={preview.business_name}
                  primary_color={preview.primary_color}
                  niche={preview.niche}
                  city={preview.city}
                  unlocked={true}
                />
              </div>
            </div>

            {/* GRADE DE POSTS EXTRAS */}
            <div className="mb-6">
              <p className="text-sm font-bold text-gray-500 mb-3">Mais exemplos do kit — templates diferentes</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <PostCard template_type="whatsapp_cta" title={`${preview.business_name}`} subtitle={`${preview.main_service} em ${preview.city}`} cta={preview.cta} business_name={preview.business_name} primary_color={preview.primary_color} city={preview.city} compact />
                <PostCard template_type="promotion" title="Promoção da semana" subtitle={preview.main_service} cta="Aproveite agora" business_name={preview.business_name} primary_color={preview.primary_color} compact />
                <PostCard template_type="authority" title="Dica importante" subtitle={`Sobre ${preview.main_service}`} cta="Salva esse post" business_name={preview.business_name} primary_color={preview.primary_color} niche={preview.niche} compact />
                <PostCard template_type="location" title={preview.main_service} subtitle={`Atendemos em ${preview.city}`} cta={preview.cta} business_name={preview.business_name} primary_color={preview.primary_color} city={preview.city} compact />
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">+ 26 posts com outros templates no kit completo</p>
            </div>

            {/* Legenda + WhatsApp */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-pink-50 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                    <PenLine size={15} className="text-pink-500" />
                  </div>
                  <p className="font-bold text-gray-800 dark:text-white text-sm">Legenda para o Instagram</p>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700 rounded-xl p-4">{preview.sample_caption}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2.5">+ 29 legendas mensais no plano completo</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <MessageSquare size={15} className="text-green-500" />
                  </div>
                  <p className="font-bold text-gray-800 dark:text-white text-sm">Mensagem pronta para WhatsApp</p>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700 rounded-xl p-4">{preview.sample_whatsapp_message}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2.5">+ mensagens para recuperar clientes no plano completo</p>
              </div>
            </div>

            {/* Comparação visual entre planos */}
            <PlanComparison
              preview={preview}
              nicheKey={form.niche}
              checkoutUrl={CHECKOUT_URL}
              checkoutUrlPro={CHECKOUT_URL_PRO}
            />

            {/* Nota de rodapé */}
            <p className="text-xs text-gray-400 text-center mt-4">
              Cancele quando quiser · Mini site ativo enquanto a assinatura estiver ativa · Conteúdos renovados todo mês
            </p>
          </div>
        </section>
      )}

      {/* ── O QUE VOCÊ RECEBE ── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Kit completo</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-3">Tudo que você recebe todo mês</h2>
            <p className="text-gray-500 dark:text-gray-400">Pare de depender de agência, designer ou ficar criando do zero.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {KIT_CARDS.map(({ Icon: I, title, desc }) => (
              <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm card-hover">
                <div className="w-11 h-11 bg-violet-100 dark:bg-violet-900/40 rounded-xl flex items-center justify-center mb-4 text-violet-600 dark:text-violet-400">
                  <I size={20} strokeWidth={1.75} />
                </div>
                <h3 className="font-extrabold text-gray-900 dark:text-white mb-1.5 text-sm">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARA QUEM É ── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Funciona para você</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4">Para qualquer negócio local</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10">O sistema adapta os posts, legendas e mensagens para o seu tipo de negócio automaticamente.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {NICHES.map(({ abbr, label, bg }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 hover:bg-violet-50 dark:hover:bg-violet-900/30 border border-gray-100 dark:border-gray-700 hover:border-violet-200 rounded-2xl p-4 text-center transition card-hover cursor-default">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 text-sm font-extrabold ${bg}`}>
                  {abbr}
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUE ASSINAR ── */}
      <section className="py-20 px-4 bg-violet-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Valeu a pena?</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-2">Por que assinar o MeuNegócio Pro</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_ITEMS.map(({ Icon: I, title, desc }) => (
              <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-violet-100 dark:border-gray-700 card-hover">
                <div className="w-11 h-11 bg-violet-100 dark:bg-violet-900/40 rounded-xl flex items-center justify-center mb-4 text-violet-600 dark:text-violet-400">
                  <I size={20} strokeWidth={1.75} />
                </div>
                <h3 className="font-extrabold text-gray-900 dark:text-white mb-2 text-sm">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
            {/* Card destaque preço */}
            <div className="gradient-brand rounded-2xl p-6 shadow-sm card-hover flex flex-col justify-between md:col-span-2 lg:col-span-1">
              <div>
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-4 text-white">
                  <DollarSign size={20} strokeWidth={1.75} />
                </div>
                <h3 className="font-extrabold text-white mb-2 text-sm">Menos de R$ 1,25 por dia</h3>
                <p className="text-violet-200 text-sm leading-relaxed">Por R$ 37/mês você tem todo o marketing digital do seu negócio resolvido. Menos do que um cafezinho por dia.</p>
              </div>
              <a href={CHECKOUT_URL} className="mt-6 flex items-center justify-center gap-2 bg-white text-violet-700 font-extrabold py-3 rounded-xl hover:bg-violet-50 transition text-sm">
                Assinar agora <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONFIANÇA ── */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Feito para você confiar</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {TRUST_ITEMS.map(({ Icon: I, title, desc }) => (
              <div key={title} className="text-center p-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-500 dark:text-gray-400">
                  <I size={22} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section ref={plansRef} className="py-20 px-4 gradient-hero relative overflow-hidden scroll-mt-14">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">

          <div className="text-center mb-12 text-white">
            <span className="inline-block bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Escolha seu plano
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Marketing mensal para o seu negócio</h2>
            <p className="text-white/65 text-base">Mini site ativo incluso nos dois planos. Conteúdo novo todo mês enquanto a assinatura estiver ativa.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">

            {/* PLANO ESSENCIAL */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Plano</p>
                <h3 className="text-2xl font-extrabold text-white mb-4">Essencial</h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-extrabold text-white">R$ 37</span>
                  <span className="text-white/60 text-sm mb-2">/mês</span>
                </div>
                <p className="text-white/50 text-xs">Cancele quando quiser · Sem fidelidade</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Mini site ativo com botão de WhatsApp",
                  "Link para bio do Instagram",
                  "5 posts novos por mês",
                  "5 legendas novas por mês",
                  "5 mensagens de WhatsApp novas por mês",
                  "Calendário básico de postagem",
                  "Materiais salvos na conta",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/85">
                    <CheckCircle2 size={15} className="text-green-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
              <a href={CHECKOUT_URL} className="flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white font-extrabold py-4 px-6 rounded-2xl hover:bg-white/25 transition text-sm">
                Começar com Essencial <ArrowRight size={15} />
              </a>
            </div>

            {/* PLANO PRO */}
            <div className="bg-white rounded-3xl p-8 flex flex-col relative shadow-2xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-extrabold px-5 py-2 rounded-full shadow-lg whitespace-nowrap">
                ⭐ Mais recomendado
              </div>
              <div className="mb-6 mt-2">
                <p className="text-violet-500 text-xs font-bold uppercase tracking-widest mb-1">Plano</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-4">Pro</h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-extrabold text-violet-700">R$ 57</span>
                  <span className="text-gray-400 text-sm mb-2">/mês</span>
                </div>
                <p className="text-gray-400 text-xs">Cancele quando quiser · Sem fidelidade</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Mini site ativo com botão de WhatsApp",
                  "Link para bio do Instagram",
                  "15 posts novos por mês",
                  "15 legendas novas por mês",
                  "15 mensagens de WhatsApp novas por mês",
                  "Campanhas prontas (promoção, agenda, recuperação)",
                  "\"Gerar post de hoje\" — post instantâneo",
                  "Mensagens para recuperar clientes",
                  "Personalização visual básica",
                  "Materiais salvos na conta",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 size={15} className="text-violet-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
              <a href={CHECKOUT_URL_PRO} className="flex items-center justify-center gap-2 gradient-brand text-white font-extrabold py-4 px-6 rounded-2xl hover:opacity-90 transition shadow-lg shadow-violet-200 text-sm">
                Quero o Pro <ArrowRight size={15} />
              </a>
            </div>

          </div>

          <p className="text-center text-white/40 text-xs">
            Seu mini site fica ativo. Seus conteúdos renovam todo mês.
          </p>
        </div>
      </section>

      {/* ── PACOTES EXTRAS ── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-4">
            <span className="inline-block bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">Opcionais</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Quer turbinar seu plano?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-base max-w-2xl mx-auto">
              Adicione pacotes extras quando quiser para receber mais posts, stories ou mensagens para chamar clientes.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Os pacotes extras são opcionais e não substituem os planos principais.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-10">

            {/* INSTAGRAM EXTRA */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-violet-200 dark:hover:border-violet-600 hover:shadow-md transition card-hover flex flex-col">
              <div className="w-12 h-12 bg-pink-50 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-4 text-pink-500">
                <ImageIcon size={22} strokeWidth={1.75} />
              </div>
              <h3 className="font-extrabold text-gray-900 dark:text-white mb-1">Pacote Instagram Extra</h3>
              <p className="text-3xl font-extrabold text-violet-700 dark:text-violet-400 mb-3">R$ 19</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                Mais posts para movimentar o Instagram do seu negócio.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 flex-1 mb-5">
                {[
                  "20 posts extras para movimentar seu Instagram",
                  "20 legendas extras personalizadas",
                  "Posts com CTA para WhatsApp",
                  "Adaptados ao seu nicho",
                  "Salvos no painel",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-violet-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
              <a href={CHECKOUT_INSTAGRAM} className="flex items-center justify-center gap-2 border-2 border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-400 font-bold py-3 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/30 transition text-sm">
                Adicionar posts extras <ArrowRight size={14} />
              </a>
            </div>

            {/* STORIES */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-violet-200 dark:hover:border-violet-600 hover:shadow-md transition card-hover flex flex-col">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 text-blue-500">
                <Smartphone size={22} strokeWidth={1.75} />
              </div>
              <h3 className="font-extrabold text-gray-900 dark:text-white mb-1">Pacote Stories</h3>
              <p className="text-3xl font-extrabold text-violet-700 dark:text-violet-400 mb-3">R$ 15</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                Stories prontos para divulgar promoções, avisos e chamadas rápidas.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 flex-1 mb-5">
                {[
                  "20 stories prontos para divulgar promoções e avisos",
                  "Chamadas rápidas para WhatsApp",
                  "Avisos de agenda aberta",
                  "Enquetes e perguntas simples",
                  "Adaptados ao seu nicho",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-violet-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
              <a href={CHECKOUT_STORIES} className="flex items-center justify-center gap-2 border-2 border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-400 font-bold py-3 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/30 transition text-sm">
                Adicionar stories <ArrowRight size={14} />
              </a>
            </div>

            {/* REATIVAÇÃO */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-violet-200 dark:hover:border-violet-600 hover:shadow-md transition card-hover flex flex-col">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                <MessageSquare size={22} strokeWidth={1.75} />
              </div>
              <h3 className="font-extrabold text-gray-900 dark:text-white mb-1">Reativação de Clientes</h3>
              <p className="text-3xl font-extrabold text-violet-700 dark:text-violet-400 mb-3">R$ 19</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                Mensagens para trazer clientes de volta ao seu negócio.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 flex-1 mb-5">
                {[
                  "50 mensagens para trazer clientes de volta",
                  "Para clientes antigos e orçamentos que sumiram",
                  "Mensagens de pós-venda e avaliação",
                  "Chamadas para agenda aberta",
                  "Adaptadas ao seu nicho",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-violet-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
              <a href={CHECKOUT_REATIVACAO} className="flex items-center justify-center gap-2 border-2 border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-400 font-bold py-3 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/30 transition text-sm">
                Adicionar mensagens de reativação <ArrowRight size={14} />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Dúvidas</span>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">Perguntas frequentes</h2>
          </div>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <span className="text-sm">{item.q}</span>
                  <ChevronDown size={18} className={`text-violet-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-violet-600 font-bold text-sm uppercase tracking-widest mb-3">Seu próximo passo</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Seu negócio merece uma presença profissional
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base mb-8 max-w-lg mx-auto">
            Comece com a prévia grátis e veja em segundos como ficaria o site e os posts do seu negócio.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={scrollToForm} className="inline-flex items-center gap-2 gradient-cta text-white font-extrabold py-4 px-10 rounded-2xl text-base hover:opacity-90 transition shadow-lg shadow-violet-200">
              Gerar minha prévia grátis
              <ArrowRight size={16} />
            </button>
            <a href={CHECKOUT_URL} className="text-violet-700 font-bold text-sm hover:underline">
              ou assinar direto por {PRICE} →
            </a>
          </div>
          <p className="text-gray-400 text-xs mt-4">Sem cadastro · Sem cartão · 100% gratuito para ver a prévia</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-gray-500 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <span className="font-extrabold text-white text-lg">MeuNegócio Pro</span>
            <p className="text-xs mt-1">Marketing mensal para pequenos negócios locais</p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/suporte" className="hover:text-white transition">Suporte</Link>
            <Link href="/login" className="hover:text-white transition">Área do cliente</Link>
            <a href={CHECKOUT_URL} className="hover:text-white transition">Assinar</a>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} MeuNegócio Pro</p>
        </div>
      </footer>

    </div>
  );
}
