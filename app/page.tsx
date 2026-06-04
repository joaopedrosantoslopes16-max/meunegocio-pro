"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Globe, ImageIcon, PenLine, CalendarDays, Megaphone,
  MessageSquare, RefreshCw, Sparkles, Target, CloudUpload,
  Lightbulb, Smartphone, Lock, Database, Scissors, Headphones,
  ShieldCheck, Pencil, Eye, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ArrowRight,
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
const CHECKOUT_URL        = process.env.NEXT_PUBLIC_CHECKOUT_URL                 ?? "https://pay.kiwify.com.br/dglZsdE";
const CHECKOUT_URL_PRO    = process.env.NEXT_PUBLIC_CHECKOUT_URL_PRO             ?? "https://pay.kiwify.com.br/1fAPOyu";
const CHECKOUT_INSTAGRAM  = process.env.NEXT_PUBLIC_CHECKOUT_INSTAGRAM_EXTRA     ?? "https://pay.kiwify.com.br/9JTBA7c";
const CHECKOUT_STORIES    = process.env.NEXT_PUBLIC_CHECKOUT_STORIES             ?? "https://pay.kiwify.com.br/SDlVYKr";
const CHECKOUT_REATIVACAO = process.env.NEXT_PUBLIC_CHECKOUT_REATIVACAO          ?? "https://pay.kiwify.com.br/Ao7MCfe";
const PRICE_ESSENTIAL     = "R$ 37,90/mês";
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

  // Pro customization preview state
  const [proMode, setProMode] = useState(false);
  const [proColor, setProColor] = useState("#7c3aed");
  const [proFont, setProFont] = useState("inter");
  const [proCoverImg, setProCoverImg] = useState("");
  const [proCoverPosY, setProCoverPosY] = useState(50);
  const [proLogoImg, setProLogoImg] = useState("");
  const [proProPhoto, setProProPhoto] = useState("");
  const [proProPhotoPosY, setProProPhotoPosY] = useState(50);
  const [proName, setProName] = useState("");
  const [proService, setProService] = useState("");
  const [proDesc, setProDesc] = useState("");
  const [editorTab, setEditorTab] = useState<"site"|"posts"|"carrossel">("site");
  const [vslOpen, setVslOpen] = useState(false);
  const [vslSlide, setVslSlide] = useState(0);
  const [vslProgress, setVslProgress] = useState(0);
  const [postTitle, setPostTitle] = useState("");
  const [postSubtitle, setPostSubtitle] = useState("");
  const [postCta, setPostCta] = useState("");
  const [postBgImg, setPostBgImg] = useState("");

  const PREVIEW_COVER_IMAGES: Record<string, string> = {
    barbearia:          "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=700&q=80&fit=crop",
    odontologia:        "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=700&q=80&fit=crop",
    "clinica-medica":   "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&q=80&fit=crop",
    otica:              "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=700&q=80&fit=crop",
    "personal-trainer": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80&fit=crop",
    estetica:           "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=700&q=80&fit=crop",
    "loja-de-roupa":    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=700&q=80&fit=crop",
    imobiliaria:        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&q=80&fit=crop",
    restaurante:        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&q=80&fit=crop",
    mecanica:           "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=700&q=80&fit=crop",
    serralheria:        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=700&q=80&fit=crop",
    outro:              "https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80&fit=crop",
  };

  const GALLERY_IMAGES: Record<string, string[]> = {
    barbearia:          ["https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80&fit=crop&crop=face"],
    odontologia:        ["https://images.unsplash.com/photo-1606811841689-23dfddce3e66?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=400&q=80&fit=crop"],
    "clinica-medica":   ["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80&fit=crop&crop=face"],
    otica:              ["https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400&q=80&fit=crop"],
    "personal-trainer": ["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80&fit=crop"],
    estetica:           ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80&fit=crop"],
    "loja-de-roupa":    ["https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80&fit=crop"],
    imobiliaria:        ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80&fit=crop"],
    restaurante:        ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80&fit=crop"],
    mecanica:           ["https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80&fit=crop"],
    serralheria:        ["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1590418606746-018840f9cd0e?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&q=80&fit=crop"],
    outro:              ["https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=80&fit=crop","https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80&fit=crop"],
  };

  const proFonts = [
    { key: "inter",      label: "Inter",       style: "'Inter', sans-serif" },
    { key: "poppins",    label: "Poppins",      style: "'Poppins', sans-serif" },
    { key: "montserrat", label: "Montserrat",   style: "'Montserrat', sans-serif" },
    { key: "nunito",     label: "Nunito",       style: "'Nunito', sans-serif" },
    { key: "opensans",   label: "Open Sans",    style: "'Open Sans', sans-serif" },
  ];

  function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProCoverImg(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProLogoImg(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleProPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProProPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handlePostBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPostBgImg(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function activatePro() {
    setProMode(true);
    setProColor(preview?.primary_color ?? "#7c3aed");
    setProName(preview?.business_name ?? "");
    setProService(preview?.main_service ?? "");
    setProDesc("");
  }

  const VSL_SLIDES = [
    {
      tag: "O problema",
      headline: "Você tem um negócio bom — mas ninguém fica sabendo disso.",
      sub: "Sem site, sem post, sem presença. O cliente pesquisa no Google e não te acha. Vê o concorrente no Instagram todo dia e vai lá. Não é culpa sua — você não tem tempo pra isso.",
      visual: "empty",
      color: "#ef4444",
    },
    {
      tag: "Plano Essencial — R$ 37,90/mês",
      headline: "Por 37,90 reais por mês, seu negócio aparece onde o cliente procura.",
      sub: "Mini site profissional com botão de WhatsApp, link pra bio do Instagram e URL própria. Todo mês você recebe 5 posts prontos, 5 legendas, 5 mensagens e um calendário de postagem. Só copiar e usar.",
      visual: "essencial",
      color: "#16a34a",
    },
    {
      tag: "Plano Pro — R$ 57/mês",
      headline: "O Pro é pra quem quer aparecer todo dia e atrair cliente de verdade.",
      sub: "Tudo do Essencial + foto de capa personalizada, galeria de fotos no site, links extras, 15 posts, 15 legendas, 15 mensagens, roteiros para Reels, sequência de Stories e carrosséis completos todo mês.",
      visual: "pro",
      color: "#7c3aed",
    },
    {
      tag: "Narrativa Magnética",
      headline: "A ferramenta que faz o cliente querer contratar — sem você saber escrever.",
      sub: "Exclusivo do plano Pro. Você escolhe o tópico, o sistema gera o roteiro completo com gancho, desenvolvimento e CTA. Scripts para Reels de 30, 60 e 90 segundos. Carrosséis com headline e lâminas prontas. Tudo com os gatilhos que os maiores perfis do seu nicho usam.",
      visual: "magnetica",
      color: "#8b5cf6",
    },
    {
      tag: "Como funciona",
      headline: "Em menos de 5 minutos você tem tudo ativo.",
      sub: "Preenche o nome do negócio, o nicho e a cidade. O sistema gera o mini site, os posts e as mensagens na hora. Sem domínio, sem hospedagem, sem agência. Você acessa de qualquer celular — tudo salvo na conta.",
      visual: "dashboard",
      color: "#2563eb",
    },
    {
      tag: "Escolha agora",
      headline: "Essencial por R$ 37,90 ou Pro por R$ 57 — os dois valem muito mais.",
      sub: "Cancele quando quiser, sem taxa e sem burocracia. Enquanto a assinatura estiver ativa, seu site fica no ar e você recebe conteúdo novo todo mês. Comece com a prévia gratuita agora e veja como fica o site do seu negócio.",
      visual: "price",
      color: "#d97706",
    },
  ] as const;

  useEffect(() => {
    const SLIDE_DURATION = 5000;
    const TICK = 50;
    const steps = SLIDE_DURATION / TICK;
    let step = 0;
    const t = setInterval(() => {
      step++;
      setVslProgress((step / steps) * 100);
      if (step >= steps) {
        step = 0;
        setVslProgress(0);
        setVslSlide(s => (s + 1) % VSL_SLIDES.length);
      }
    }, TICK);
    return () => clearInterval(t);
  }, [vslOpen, vslSlide, VSL_SLIDES.length]);

  useEffect(() => {
    if (!vslOpen) return;
    const close = (e: KeyboardEvent) => { if (e.key === "Escape") setVslOpen(false); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [vslOpen]);

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
    setProColor(form.primary_color);
    setPostTitle("");
    setPostSubtitle("");
    setPostCta("");
    setPostBgImg("");
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
      <section className="gradient-hero pt-28 pb-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative">

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-7">
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

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-white text-center">
            Seu negócio atraindo clientes{" "}
            <span className="text-gradient">todo dia</span>
            {" "}— no piloto automático
          </h1>
          <p className="text-white/60 text-lg leading-relaxed mb-3 max-w-2xl mx-auto text-center">
            Mini site profissional + posts, legendas e mensagens prontas todo mês.
          </p>
          <p className="text-white/90 text-sm font-semibold mb-10 text-center">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-4 py-1.5">
              <Sparkles size={13} className="text-violet-300" />
              Plano Pro inclui o{" "}
              <span className="text-gradient font-extrabold">Gerador de Narrativas Magnéticas</span>
              {" "}— roteiros prontos para Reels, Carrosséis e Stories
            </span>
          </p>

          {/* ── SLIDES ROTATIVOS ── */}
          <div className="relative mx-auto max-w-4xl mb-10">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-900/40" style={{ background: "rgba(10,10,20,0.85)", backdropFilter: "blur(20px)" }}>
              <div className="grid md:grid-cols-[220px_1fr]">

                {/* Coluna esquerda — visual do slide */}
                <div className="relative flex items-center justify-center p-6 border-r border-white/8 min-h-[280px] md:min-h-0" style={{ background: "rgba(0,0,0,0.3)" }}>
                  {VSL_SLIDES.map((slide, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 flex items-center justify-center p-6 transition-all duration-500"
                      style={{ opacity: i === vslSlide ? 1 : 0, pointerEvents: i === vslSlide ? "auto" : "none", transform: i === vslSlide ? "scale(1)" : "scale(0.95)" }}
                    >
                      {/* Visual: Problema */}
                      {slide.visual === "empty" && (
                        <div className="w-full space-y-2">
                          {["Sem site profissional","Sem post há semanas","Cliente indo embora","Concorrente aparecendo"].map((t, j) => (
                            <div key={j} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                              <div className="w-3.5 h-3.5 rounded-full bg-red-500/30 flex items-center justify-center flex-shrink-0">
                                <svg className="w-2 h-2 text-red-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                              </div>
                              <p className="text-red-300/80 text-xs font-medium">{t}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Visual: Essencial */}
                      {slide.visual === "essencial" && (
                        <div className="w-full rounded-xl overflow-hidden border border-green-500/30">
                          <div className="bg-green-600/80 px-3 py-2 flex justify-between items-center">
                            <p className="text-white text-xs font-extrabold">Essencial</p>
                            <span className="text-green-200 text-xs font-bold">R$37,90/mês</span>
                          </div>
                          <div className="p-3 space-y-1.5">
                            {["Mini site profissional","Botão WhatsApp ativo","5 posts por mês","5 legendas","Calendário de postagem"].map(f => (
                              <div key={f} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50 flex items-center justify-center flex-shrink-0">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                </div>
                                <p className="text-white/70 text-xs">{f}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Visual: Pro */}
                      {slide.visual === "pro" && (
                        <div className="w-full rounded-xl overflow-hidden border border-violet-500/40">
                          <div className="bg-violet-700 px-3 py-2 flex justify-between items-center">
                            <p className="text-white text-xs font-extrabold">Pro</p>
                            <span className="text-yellow-300 text-xs font-bold">R$57/mês</span>
                          </div>
                          <div className="p-3 space-y-1.5">
                            <p className="text-violet-400 text-[9px] font-extrabold uppercase tracking-wider">Tudo do Essencial +</p>
                            {["Foto e capa personalizada","Galeria de fotos","15 posts · 15 legendas","Roteiros para Reels","Carrosséis completos","Narrativas Magnéticas"].map(f => (
                              <div key={f} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-violet-500/30 border border-violet-500/50 flex items-center justify-center flex-shrink-0">
                                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                </div>
                                <p className="text-white/70 text-xs">{f}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Visual: Narrativa Magnética */}
                      {slide.visual === "magnetica" && (
                        <div className="w-full rounded-xl overflow-hidden border border-purple-500/40">
                          <div className="bg-purple-800/80 px-3 py-2">
                            <p className="text-purple-200 text-xs font-extrabold">Narrativas Magnéticas</p>
                          </div>
                          <div className="p-3 space-y-2">
                            {[{l:"Gancho",t:"\"Por que 80% dos clientes somem...\""},
                              {l:"Desenvolvimento",t:"\"Não é o preço. É como você aparece...\""},
                              {l:"CTA",t:"\"Comenta AQUI que eu te explico 👇\""}].map(({l,t}) => (
                              <div key={l} className="bg-purple-900/40 rounded-lg p-2 border border-purple-500/20">
                                <p className="text-purple-400 text-[8px] font-extrabold uppercase tracking-wider mb-0.5">{l}</p>
                                <p className="text-white/70 text-xs italic">{t}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Visual: Dashboard */}
                      {slide.visual === "dashboard" && (
                        <div className="w-full rounded-xl overflow-hidden border border-blue-500/30">
                          <div className="bg-blue-700 px-3 py-2"><p className="text-white text-xs font-bold">Meu painel</p></div>
                          <div className="p-3 space-y-2">
                            {["Mini site ativo","Posts gerados","Legendas prontas","Mensagens WA"].map(t => (
                              <div key={t} className="flex items-center gap-2 bg-blue-900/20 rounded-lg px-2 py-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                                <p className="text-white/70 text-xs">{t}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Visual: Preço */}
                      {slide.visual === "price" && (
                        <div className="flex gap-2 w-full">
                          <div className="flex-1 rounded-xl border border-green-500/30 p-3 text-center">
                            <p className="text-green-400 text-[9px] font-extrabold uppercase mb-1">Essencial</p>
                            <p className="text-white text-xl font-extrabold">R$37,90</p>
                            <p className="text-white/30 text-[9px] mb-2">/mês</p>
                            <div className="space-y-1">
                              {["Mini site","5 posts"].map(f => (
                                <div key={f} className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" /><p className="text-white/50 text-[9px]">{f}</p></div>
                              ))}
                            </div>
                          </div>
                          <div className="flex-1 rounded-xl border border-violet-500/40 p-3 text-center">
                            <p className="text-violet-400 text-[9px] font-extrabold uppercase mb-1">Pro</p>
                            <p className="text-white text-xl font-extrabold">R$57</p>
                            <p className="text-white/30 text-[9px] mb-2">/mês</p>
                            <div className="space-y-1">
                              {["Site + fotos","15 posts","Narrativas"].map(f => (
                                <div key={f} className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" /><p className="text-white/50 text-[9px]">{f}</p></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Coluna direita — texto + barra de progresso */}
                <div className="p-8 flex flex-col justify-between">
                  <div className="relative min-h-[180px]">
                    {VSL_SLIDES.map((slide, i) => (
                      <div
                        key={i}
                        className="absolute inset-0 transition-all duration-500"
                        style={{ opacity: i === vslSlide ? 1 : 0, pointerEvents: i === vslSlide ? "auto" : "none", transform: i === vslSlide ? "translateY(0)" : "translateY(12px)" }}
                      >
                        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ background: slide.color + "20", color: slide.color, border: `1px solid ${slide.color}30` }}>
                          {slide.tag}
                        </div>
                        <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight mb-3">
                          {slide.headline}
                        </h2>
                        <p className="text-white/50 text-sm leading-relaxed">
                          {slide.sub}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Indicadores + progresso */}
                  <div className="mt-6">
                    <div className="flex gap-1.5 mb-3">
                      {VSL_SLIDES.map((slide, i) => (
                        <button
                          key={i}
                          onClick={() => { setVslSlide(i); setVslProgress(0); }}
                          className="h-1 rounded-full transition-all duration-300 overflow-hidden"
                          style={{ flex: i === vslSlide ? 3 : 1, background: i < vslSlide ? VSL_SLIDES[i].color + "60" : "rgba(255,255,255,0.12)" }}
                        >
                          {i === vslSlide && (
                            <div className="h-full rounded-full transition-all duration-75" style={{ width: `${vslProgress}%`, background: slide.color }} />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setVslSlide(s => Math.max(0, s - 1)); setVslProgress(0); }}
                          disabled={vslSlide === 0}
                          className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 transition disabled:opacity-25 disabled:cursor-default"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span className="text-white/30 text-xs">{vslSlide + 1} / {VSL_SLIDES.length}</span>
                        <button
                          onClick={() => { setVslSlide(s => Math.min(VSL_SLIDES.length - 1, s + 1)); setVslProgress(0); }}
                          disabled={vslSlide === VSL_SLIDES.length - 1}
                          className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 transition disabled:opacity-25 disabled:cursor-default"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                      <button onClick={scrollToForm} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-semibold transition">
                        Criar prévia grátis <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
            <button onClick={scrollToForm} className="inline-flex items-center justify-center gap-2 bg-white text-violet-700 font-extrabold py-4 px-10 rounded-2xl text-base hover:bg-violet-50 transition shadow-2xl shadow-violet-900/30">
              Criar minha prévia grátis agora <ArrowRight size={16} />
            </button>
            <button onClick={scrollToPlans} className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold py-4 px-6 rounded-2xl text-base hover:bg-white/20 transition">
              Ver planos e preços
            </button>
          </div>
          <p className="text-white/35 text-xs text-center">Sem cadastro. Sem cartão. 100% gratuito pra testar.</p>

          {/* Social proof */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-6 text-white/40 text-xs">
            {["✅ Sem domínio ou hospedagem","⚡ Mini site ativo em minutos","📅 Conteúdo novo todo mês","💬 WhatsApp direto no site"].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>

        </div>
      </section>

      {/* ── BARRA DE NÚMEROS ── */}
      <section className="bg-violet-600 py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-10 text-white">
          {[["12", "nichos atendidos"], ["10–30", "posts por mês"], ["A partir de R$ 37,90,90", "por mês"], ["100%", "personalizado"]].map(([n, l]) => (
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

      {/* ── NARRATIVA MAGNÉTICA ── */}
      <section className="py-20 px-4 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-gray-950 to-purple-900/20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* Texto */}
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-bold px-4 py-2 rounded-full mb-6">
                <Sparkles size={13} />
                Exclusivo no plano Pro
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-5">
                Enquanto você pensa no que escrever,{" "}
                <span className="text-gradient">o cliente vai pro concorrente</span>
                {" "}que já está postando.
              </h2>
              <p className="text-gray-400 text-base leading-relaxed mb-8">
                O Gerador de Narrativas Magnéticas entrega roteiros prontos para Reels, Carrosséis e Stories — com os mesmos gatilhos que os maiores perfis do seu nicho usam pra atrair cliente todo dia.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Roteiros prontos para Reels de 30s, 60s e 90s",
                  "Sequência de Stories em 5 a 8 frames narrativos",
                  "Carrosséis com headline + lâminas + CTA irresistível",
                  "Ângulos: prova social, urgência, transformação, dor",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-violet-500/25 border border-violet-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <a href={CHECKOUT_URL_PRO} className="inline-flex items-center gap-2 gradient-brand text-white font-extrabold py-4 px-8 rounded-2xl text-sm hover:opacity-90 transition shadow-xl shadow-violet-900/40">
                Quero o gerador de narrativas <ArrowRight size={15} />
              </a>
              <p className="text-gray-600 text-xs mt-3">Disponível no plano Pro · R$ 57/mês</p>
            </div>

            {/* Mockup do gerador */}
            <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-violet-600/30 flex items-center justify-center">
                  <Sparkles size={13} className="text-violet-400" />
                </div>
                <p className="text-sm font-bold text-white">Narrativas Magnéticas</p>
                <span className="ml-auto text-xs bg-violet-500/20 text-violet-400 font-bold px-2 py-0.5 rounded-full">Pro</span>
              </div>

              {/* Tópico selecionado */}
              <div className="px-5 py-4 border-b border-gray-800/60">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tópico</p>
                <div className="bg-gray-800 rounded-xl p-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                  <p className="text-sm text-white font-semibold">Por que meus clientes voltam sempre</p>
                </div>
              </div>

              {/* Formato escolhido */}
              <div className="px-5 py-4 border-b border-gray-800/60">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Formato</p>
                <div className="flex gap-2">
                  {["Reels", "Carrossel", "Stories", "Post"].map((f, i) => (
                    <div key={f} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${i === 0 ? "bg-violet-600 border-violet-500 text-white" : "border-gray-700 text-gray-500"}`}>
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Resultado gerado */}
              <div className="px-5 py-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Script gerado</p>
                <div className="space-y-2">
                  {[
                    { label: "Gancho (0–3s)", text: "\"Você sabia que 80% dos clientes voltam por causa de UMA coisa?\"" },
                    { label: "Desenvolvimento", text: "\"Não é o preço. Não é a localização. É como você faz a pessoa se sentir...\"" },
                    { label: "CTA", text: "\"Comenta AQUI pra eu te mandar o que eu faço diferente 👇\"" },
                  ].map(({ label, text }) => (
                    <div key={label} className="bg-gray-800/60 rounded-xl p-3">
                      <p className="text-[9px] font-extrabold text-violet-400 uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

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
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-bold px-5 py-2.5 rounded-full mb-4">
                <CheckCircle2 size={16} />
                Prévia criada para {preview.business_name}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Veja como fica o seu site</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Escolha o plano e veja a diferença em tempo real.</p>
            </div>

            {/* Seletor de plano — topo da prévia */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 gap-1">
                <button onClick={() => setProMode(false)} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${!proMode ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white" : "text-gray-400 hover:text-gray-600"}`}>
                  Essencial <span className="text-gray-400 font-normal">R$ 37,90/mês</span>
                </button>
                <button onClick={activatePro} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${proMode ? "gradient-brand text-white shadow-lg" : "text-gray-400 hover:text-gray-600"}`}>
                  Pro <span className={proMode ? "opacity-80 font-normal" : "text-gray-400 font-normal"}>R$ 57/mês</span>
                  <span className="text-xs bg-yellow-400 text-yellow-900 font-extrabold px-1.5 py-0.5 rounded-full">✦</span>
                </button>
              </div>
            </div>

            <div className="grid gap-6 mb-6 lg:grid-cols-[1fr_300px]">
              {/* MINI SITE PREVIEW */}
              {(() => {
                const c = proColor;
                const coverImg = proCoverImg || PREVIEW_COVER_IMAGES[form.niche] || null;
                const galleryImgs = GALLERY_IMAGES[form.niche] ?? GALLERY_IMAGES.outro;
                const nicheServices = (NICHE_CONFIG[form.niche]?.services ?? []).slice(0, 3);
                const allServices = nicheServices.length ? nicheServices : [preview.main_service];
                const fontFam = proFonts.find(f => f.key === proFont)?.style ?? "'Inter',sans-serif";
                const slug = (proName || preview.business_name).toLowerCase().replace(/[^a-z0-9]+/g,"-");
                const displayName = proMode && proName ? proName : preview.business_name;
                const displayService = proMode && proService ? proService : preview.main_service;
                if (!proMode) {
                  // ── ESSENCIAL: design leve com gradiente colorido ──
                  return (
                    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
                      {/* Browser chrome cinza */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-white/20" /><div className="w-2.5 h-2.5 rounded-full bg-white/20" /><div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                          </div>
                          <span className="text-white/40 text-[10px] truncate max-w-[160px]">meunegocio.pro/site/{slug}</span>
                        </div>
                        <span className="text-white/40 text-[10px] font-bold">Essencial</span>
                      </div>
                      {/* Hero gradiente colorido */}
                      <div style={{ background: `linear-gradient(160deg, ${c}f5 0%, ${c}bb 100%)`, padding: "28px 18px 44px", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "120px", height: "120px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
                        <div style={{ textAlign: "center", position: "relative", zIndex: 1, fontFamily: "'Inter',sans-serif" }}>
                          {proLogoImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={proLogoImg} alt="" style={{ width: "64px", height: "64px", borderRadius: "16px", margin: "0 auto 12px", border: "3px solid rgba(255,255,255,0.4)", objectFit: "cover", boxShadow: `0 8px 24px ${c}55` }} />
                          ) : (
                            <div style={{ width: "64px", height: "64px", borderRadius: "16px", margin: "0 auto 12px", background: "rgba(255,255,255,0.22)", border: "3px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: 900, color: "#fff" }}>
                              {displayName[0]?.toUpperCase()}
                            </div>
                          )}
                          <p style={{ fontSize: "18px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: "4px" }}>{displayName}</p>
                          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.70)", fontWeight: 600, marginBottom: "16px" }}>{preview.niche} · {preview.city}</p>
                          <a href={buildWhatsAppLink(preview.whatsapp)} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#25D366", color: "#fff", fontWeight: 800, fontSize: "13px", padding: "12px", borderRadius: "12px", textDecoration: "none", boxShadow: "0 4px 14px rgba(37,211,102,0.35)" }}>
                            💬 Chamar no WhatsApp
                          </a>
                        </div>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "26px", background: "#fff", clipPath: "ellipse(55% 100% at 50% 100%)" }} />
                      </div>
                      {/* Serviços simples */}
                      <div style={{ padding: "16px 16px 4px", background: "#fff", fontFamily: "'Inter',sans-serif" }}>
                        <p style={{ fontSize: "9px", fontWeight: 800, color: c, letterSpacing: "0.20em", textTransform: "uppercase", marginBottom: "8px" }}>Serviços</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {allServices.map((svc, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", background: i === 0 ? `${c}0d` : "#f9f9f9", border: `1px solid ${i === 0 ? c+"28" : "#f0f0f0"}`, borderRadius: "8px", padding: "9px 12px" }}>
                              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: c, flexShrink: 0 }} />
                              <p style={{ fontSize: "12px", fontWeight: i===0?800:600, color: "#222", flex: 1 }}>{svc}</p>
                              {i === 0 && <span style={{ fontSize: "9px", fontWeight: 700, color: c, background: `${c}12`, borderRadius: "4px", padding: "2px 5px" }}>Principal</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Links rápidos */}
                      <div style={{ padding: "12px 16px 16px", background: "#fff" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {["WhatsApp","Localização","Instagram"].map(s => (
                            <div key={s} style={{ flex: 1, background: "#f5f5f5", borderRadius: "7px", padding: "7px 4px", textAlign: "center" }}>
                              <p style={{ fontSize: "9px", fontWeight: 700, color: "#666" }}>{s}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                // ── PRO: design escuro com foto real ──
                return (
                  <div className="rounded-2xl overflow-hidden border-2 shadow-xl" style={{ borderColor: c + "88", boxShadow: `0 12px 40px ${c}22` }}>
                    {/* Browser chrome colorido */}
                    <div className="flex items-center justify-between px-4 py-2.5" style={{ background: c }}>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-white/20" /><div className="w-2.5 h-2.5 rounded-full bg-white/20" /><div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                        </div>
                        <span className="text-white/50 text-[10px] truncate max-w-[160px]">meunegocio.pro/site/{slug}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="bg-yellow-400 text-yellow-900 text-[9px] font-extrabold px-2 py-0.5 rounded-full">⭐ Recomendado</span>
                        <span className="text-white/70 text-[10px] font-bold">Pro</span>
                      </div>
                    </div>

                    {/* Conteúdo scrollável sem fundo cinza */}
                    <div style={{ overflowY: "auto", scrollbarWidth: "none", background: "#fff" }}>

                      {/* Hero com foto */}
                      <div style={{ height: "200px", position: "relative", overflow: "hidden", ...(coverImg ? { backgroundImage: `url(${coverImg})`, backgroundSize: "cover", backgroundPosition: `center ${proCoverPosY}%` } : { background: `linear-gradient(160deg,#111 0%,${c}77 70%,#000 100%)` }) }}>
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.28) 0%,rgba(0,0,0,0.78) 100%)" }} />
                        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 70% 20%,${c}44 0%,transparent 55%)` }} />
                        <div style={{ position: "absolute", top: "12px", left: "12px", right: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            {proLogoImg ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={proLogoImg} alt="" style={{ width: "30px", height: "30px", borderRadius: "7px", objectFit: "cover", boxShadow: `0 3px 10px ${c}55` }} />
                            ) : (
                              <div style={{ width: "30px", height: "30px", borderRadius: "7px", background: c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 900, color: "#fff" }}>
                                {displayName[0]?.toUpperCase()}
                              </div>
                            )}
                            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "100px", padding: "3px 8px", backdropFilter: "blur(4px)" }}>
                              <span style={{ color: "#fff", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", fontFamily: fontFam }}>{preview.niche}</span>
                            </div>
                          </div>
                          {preview.instagram && (
                            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "100px", padding: "3px 8px", backdropFilter: "blur(4px)" }}>
                              <span style={{ color: "#fff", fontSize: "9px", fontWeight: 700 }}>@{preview.instagram}</span>
                            </div>
                          )}
                        </div>
                        <div style={{ position: "absolute", bottom: "12px", left: "12px", zIndex: 10 }}>
                          <p style={{ fontSize: "10px", fontWeight: 800, color: c, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: "3px", fontFamily: fontFam }}>{displayService}</p>
                          <p style={{ fontSize: "18px", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "3px", fontFamily: fontFam }}>{displayName}</p>
                          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>📍 {preview.city}</p>
                        </div>
                      </div>

                      {/* Stats strip */}
                      <div style={{ display: "flex", background: "#0d0d0d", borderBottom: `2px solid ${c}` }}>
                        {[`⚡ Online`,`📍 ${preview.city}`,"💬 Rápido"].map((item, i) => (
                          <div key={i} style={{ flex: 1, padding: "8px 4px", textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                            <p style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>{item}</p>
                          </div>
                        ))}
                      </div>

                      {/* CTA + links sociais */}
                      <div style={{ padding: "12px 14px 0", background: "#fff" }}>
                        <a href={buildWhatsAppLink(preview.whatsapp)} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#25D366", color: "#fff", fontWeight: 800, fontSize: "13px", padding: "12px", borderRadius: "10px", textDecoration: "none", boxShadow: "0 4px 14px rgba(37,211,102,0.35)", marginBottom: "8px", fontFamily: fontFam }}>
                          💬 {NICHE_CONFIG[form.niche]?.cta ?? "Falar"} pelo WhatsApp
                        </a>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {preview.instagram && (
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "7px", fontSize: "10px", fontWeight: 700, color: "#555" }}>
                              📸 Instagram
                            </div>
                          )}
                          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "7px", fontSize: "10px", fontWeight: 700, color: "#555" }}>
                            👍 Facebook
                          </div>
                        </div>
                      </div>

                      {/* Sobre */}
                      <div style={{ padding: "14px 14px 0", borderTop: "1px solid #f0f0f0", marginTop: "12px", background: "#fff" }}>
                        <p style={{ fontSize: "9px", fontWeight: 800, color: c, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "6px" }}>Sobre</p>
                        <p style={{ fontSize: "11px", color: "#555", lineHeight: 1.65, fontFamily: fontFam }}>
                          {proDesc || `${displayName} é uma ${(NICHE_CONFIG[form.niche]?.label ?? preview.niche).toLowerCase()} em ${preview.city}, especializada em ${displayService}. Atendimento direto pelo WhatsApp.`}
                        </p>
                      </div>

                      {/* Galeria — fotos do nicho, SEPARADAS da capa */}
                      <div style={{ padding: "14px 14px 0", background: "#fff", marginTop: "4px" }}>
                        <p style={{ fontSize: "9px", fontWeight: 800, color: c, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px" }}>Galeria</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                          {galleryImgs.map((img, i) => (
                            <div key={i} style={{ height: "56px", borderRadius: "7px", backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                          ))}
                        </div>
                      </div>

                      {/* Serviços */}
                      <div style={{ padding: "14px", background: "#f9f9f9", marginTop: "12px", borderTop: "1px solid #f0f0f0" }}>
                        <p style={{ fontSize: "9px", fontWeight: 800, color: c, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px" }}>Serviços</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                          {allServices.map((svc, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: "8px", padding: "8px 10px", border: `1px solid ${i===0?c+"30":"#f0f0f0"}` }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: i===0?`linear-gradient(135deg,${c},${c}bb)`:`${c}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: i===0?"rgba(255,255,255,0.9)":c }} />
                                </div>
                                <p style={{ fontSize: "11px", fontWeight: i===0?800:600, color: "#222", fontFamily: fontFam }}>{svc}</p>
                              </div>
                              <span style={{ fontSize: "9px", fontWeight: 700, color: "#25D366", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "5px", padding: "2px 6px" }}>Falar</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* PAINEL DE EDIÇÃO */}
              <div className={`rounded-2xl p-4 self-start sticky top-4 ${proMode ? "bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800" : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"}`}>

                {proMode ? (
                  <>
                    {/* Tabs Pro */}
                    <div className="flex gap-1 p-1 bg-violet-100/60 dark:bg-violet-900/30 rounded-xl mb-4">
                      {(["site","posts","carrossel"] as const).map(tab => (
                        <button key={tab} onClick={() => setEditorTab(tab)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition ${editorTab === tab ? "bg-white dark:bg-violet-900 text-violet-700 dark:text-violet-300 shadow-sm" : "text-violet-400 hover:text-violet-600"}`}>
                          {tab === "carrossel" ? "Carrossel" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    {editorTab === "site" && (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">Nome do negócio</p>
                          <input value={proName} onChange={e => setProName(e.target.value)} placeholder={preview.business_name} className="w-full border border-violet-200 dark:border-violet-700 dark:bg-violet-950/30 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">Serviço principal</p>
                          <input value={proService} onChange={e => setProService(e.target.value)} placeholder={preview.main_service} className="w-full border border-violet-200 dark:border-violet-700 dark:bg-violet-950/30 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">Sobre o negócio</p>
                          <textarea value={proDesc} onChange={e => setProDesc(e.target.value)} placeholder="Fale um pouco sobre o negócio..." rows={2} className="w-full border border-violet-200 dark:border-violet-700 dark:bg-violet-950/30 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">Cor principal</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {["#7c3aed","#2563eb","#dc2626","#16a34a","#d97706","#db2777","#0891b2","#111827"].map(col => (
                              <button key={col} onClick={() => setProColor(col)} style={{ background: col }} className={`w-6 h-6 rounded-full border-2 transition ${proColor === col ? "border-white scale-110 shadow-md" : "border-transparent"}`} />
                            ))}
                            <input type="color" value={proColor} onChange={e => setProColor(e.target.value)} className="w-6 h-6 rounded-full border border-gray-200 cursor-pointer" />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">Fonte</p>
                          <div className="flex gap-1.5 flex-wrap">
                            {proFonts.map(f => (
                              <button key={f.key} onClick={() => setProFont(f.key)} style={{ fontFamily: f.style }} className={`px-2.5 py-1 rounded-lg text-xs border transition ${proFont === f.key ? "border-violet-500 bg-violet-100 dark:bg-violet-900/40 text-violet-700 font-bold" : "border-gray-200 dark:border-gray-600 text-gray-500"}`}>
                                {f.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">Foto de capa (banner)</p>
                          <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-800 border border-dashed border-violet-300 rounded-xl px-3 py-2 hover:border-violet-500 transition w-fit">
                            <ImageIcon size={14} className="text-violet-500" />
                            <span className="text-xs font-semibold text-violet-600">{proCoverImg ? "Trocar imagem" : "Adicionar capa"}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                          </label>
                          {proCoverImg && (
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Posição</span><span className="font-bold text-violet-600">{proCoverPosY}%</span>
                              </div>
                              <input type="range" min={0} max={100} value={proCoverPosY} onChange={e => setProCoverPosY(Number(e.target.value))} className="w-full accent-violet-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">Logo / foto do perfil</p>
                          <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-800 border border-dashed border-violet-300 rounded-xl px-3 py-2 hover:border-violet-500 transition w-fit">
                            <ImageIcon size={14} className="text-violet-500" />
                            <span className="text-xs font-semibold text-violet-600">{proLogoImg ? "Trocar logo" : "Adicionar logo"}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                          </label>
                        </div>
                      </div>
                    )}

                    {editorTab === "posts" && (
                      <div className="space-y-3">
                        {/* Campos de edição */}
                        <div className="space-y-2">
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Título do post</p>
                            <input
                              value={postTitle}
                              onChange={e => setPostTitle(e.target.value)}
                              placeholder={proService || preview.sample_post_title}
                              className="w-full border border-violet-200 dark:border-violet-700 dark:bg-violet-950/30 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Subtítulo</p>
                            <input
                              value={postSubtitle}
                              onChange={e => setPostSubtitle(e.target.value)}
                              placeholder={`${NICHE_CONFIG[form.niche]?.label ?? preview.niche} em ${preview.city}`}
                              className="w-full border border-violet-200 dark:border-violet-700 dark:bg-violet-950/30 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">CTA (chamada)</p>
                            <input
                              value={postCta}
                              onChange={e => setPostCta(e.target.value)}
                              placeholder={NICHE_CONFIG[form.niche]?.cta ?? preview.cta}
                              className="w-full border border-violet-200 dark:border-violet-700 dark:bg-violet-950/30 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Imagem de fundo</p>
                            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-800 border border-dashed border-violet-300 rounded-xl px-3 py-2 hover:border-violet-500 transition w-fit">
                              <ImageIcon size={13} className="text-violet-500" />
                              <span className="text-xs font-semibold text-violet-600">{postBgImg ? "Trocar imagem" : "Adicionar imagem"}</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handlePostBgUpload} />
                            </label>
                            {postBgImg && <p className="text-[10px] text-green-600 font-semibold mt-1">✓ Imagem carregada</p>}
                          </div>
                        </div>
                        {/* Preview do post */}
                        <PostCard
                          template_type="main_service"
                          title={postTitle || proService || preview.sample_post_title}
                          subtitle={postSubtitle || `${NICHE_CONFIG[form.niche]?.label ?? preview.niche} em ${preview.city}`}
                          cta={postCta || NICHE_CONFIG[form.niche]?.cta || preview.cta}
                          business_name={proName || preview.business_name}
                          primary_color={proColor}
                          niche={preview.niche}
                          city={preview.city}
                          backgroundImageUrl={postBgImg || undefined}
                          unlocked={true}
                        />
                        <p className="text-[10px] text-gray-400 text-center">+ 14 templates diferentes no plano Pro</p>
                      </div>
                    )}

                    {editorTab === "carrossel" && (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Exemplo de carrossel gerado para o seu nicho.</p>
                        <div className="rounded-xl overflow-hidden border border-violet-100 dark:border-violet-800">
                          {[
                            { label: "Capa", bg: proColor, text: proService || preview.main_service, sub: "Deslize para ver →" },
                            { label: "Lâmina 1", bg: "#fff", text: "Por que escolher a gente?", sub: proName || preview.business_name },
                            { label: "Lâmina 2", bg: "#f9f9f9", text: `Especialistas em ${proService || preview.main_service}`, sub: preview.city },
                            { label: "CTA Final", bg: proColor, text: "Fale pelo WhatsApp agora", sub: "Um clique e você fala direto 💬" },
                          ].map((slide, i) => (
                            <div key={i} style={{ background: slide.bg, padding: "12px 14px", borderBottom: i < 3 ? "1px solid #f0f0f0" : "none" }}>
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold flex-shrink-0" style={{ background: slide.bg === proColor ? "rgba(255,255,255,0.2)" : `${proColor}18`, color: slide.bg === proColor ? "#fff" : proColor }}>
                                  {i + 1}
                                </div>
                                <div>
                                  <p className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: slide.bg === proColor ? "rgba(255,255,255,0.6)" : "#999" }}>{slide.label}</p>
                                  <p className="text-xs font-bold leading-snug" style={{ color: slide.bg === proColor ? "#fff" : "#111" }}>{slide.text}</p>
                                  <p className="text-[10px]" style={{ color: slide.bg === proColor ? "rgba(255,255,255,0.55)" : "#888" }}>{slide.sub}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 text-center">+ carrosséis para stories, promoções e depoimentos</p>
                      </div>
                    )}

                    <div className="pt-3 mt-3 border-t border-violet-200 dark:border-violet-800">
                      <a href={CHECKOUT_URL_PRO} className="flex items-center justify-center gap-2 gradient-brand text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:opacity-90 transition">
                        Assinar Pro — R$ 57/mês <ArrowRight size={13} />
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Essencial — só cor + logo */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                      <p className="text-sm font-extrabold text-gray-600 dark:text-gray-300">Essencial — R$ 37,90/mês</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">Cor do seu site</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {["#7c3aed","#2563eb","#dc2626","#16a34a","#d97706","#db2777","#0891b2","#111827"].map(col => (
                            <button key={col} onClick={() => { setProColor(col); }} style={{ background: col }} className={`w-7 h-7 rounded-full border-2 transition ${proColor === col ? "border-white scale-110 shadow-md" : "border-transparent"}`} />
                          ))}
                          <input type="color" value={proColor} onChange={e => setProColor(e.target.value)} className="w-7 h-7 rounded-full border border-gray-200 cursor-pointer" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">Logo / foto do perfil</p>
                        <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-700 border border-dashed border-gray-300 rounded-xl px-3 py-2 hover:border-violet-400 transition w-fit">
                          <ImageIcon size={14} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-500">{proLogoImg ? "Trocar logo" : "Adicionar logo"}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                        </label>
                        {proLogoImg && <p className="text-[10px] text-green-600 font-semibold mt-1">✓ Imagem carregada</p>}
                      </div>
                      <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-3 border border-violet-100 dark:border-violet-800">
                        <p className="text-xs font-bold text-violet-700 dark:text-violet-400 mb-1">Quer o site com foto, galeria e links?</p>
                        <p className="text-xs text-violet-600/70 dark:text-violet-400/70 mb-2">Isso é exclusivo do plano Pro.</p>
                        <button onClick={activatePro} className="flex items-center justify-center gap-1.5 w-full gradient-brand text-white font-bold text-xs py-2 rounded-lg hover:opacity-90 transition">
                          Ver como fica no Pro <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                    <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                      <a href={CHECKOUT_URL} className="flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm px-4 py-2.5 rounded-xl hover:opacity-90 transition">
                        Assinar Essencial — R$ 37,90/mês <ArrowRight size={13} />
                      </a>
                    </div>
                  </>
                )}
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
                <p className="text-violet-200 text-sm leading-relaxed">Por R$ 37,90/mês você tem todo o marketing digital do seu negócio resolvido. Menos do que um cafezinho por dia.</p>
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
                  <span className="text-5xl font-extrabold text-white">R$ 37,90</span>
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
              <p className="text-3xl font-extrabold text-violet-700 dark:text-violet-400 mb-3">R$ 12</p>
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
              <p className="text-3xl font-extrabold text-violet-700 dark:text-violet-400 mb-3">R$ 14</p>
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
              <p className="text-3xl font-extrabold text-violet-700 dark:text-violet-400 mb-3">R$ 9,90</p>
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

      {/* ── MODAL VSL ── */}
      {vslOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
          onClick={() => setVslOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "#0a0a12" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Barra superior */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white/50 text-xs font-medium">MeuNegócio Pro — Demo</span>
              </div>
              <button
                onClick={() => setVslOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition text-sm"
              >
                ✕
              </button>
            </div>

            {/* Slide content */}
            <div className="relative" style={{ minHeight: "360px" }}>
              {VSL_SLIDES.map((slide, i) => (
                <div
                  key={i}
                  className="absolute inset-0 flex flex-col md:flex-row items-center gap-8 p-8 md:p-12 transition-all duration-500"
                  style={{ opacity: i === vslSlide ? 1 : 0, pointerEvents: i === vslSlide ? "auto" : "none", transform: i === vslSlide ? "translateX(0)" : i < vslSlide ? "translateX(-40px)" : "translateX(40px)" }}
                >
                  {/* Visual */}
                  <div className="flex-shrink-0">
                    {/* Visual: Problema */}
                    {slide.visual === "empty" && (
                      <div className="w-44 space-y-2">
                        {["Postou há 3 semanas","Instagram sem engajamento","Sem site profissional","Clientes indo embora"].map((t,i) => (
                          <div key={i} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                            <div className="w-4 h-4 rounded-full bg-red-500/30 flex items-center justify-center flex-shrink-0">
                              <svg className="w-2.5 h-2.5 text-red-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                            </div>
                            <p className="text-red-300/80 text-[10px] font-semibold">{t}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Visual: Essencial */}
                    {slide.visual === "essencial" && (
                      <div className="w-44 rounded-2xl border border-green-500/30 bg-gray-900 overflow-hidden">
                        <div className="bg-green-600/80 px-3 py-2 flex items-center justify-between">
                          <p className="text-white text-[10px] font-extrabold">Plano Essencial</p>
                          <span className="text-green-200 text-[10px] font-bold">R$37,90/mês</span>
                        </div>
                        <div className="p-3 space-y-2">
                          {["Mini site profissional","Botão WhatsApp ativo","5 posts por mês","5 legendas por mês","5 mensagens WA","Calendário de postagem"].map(f => (
                            <div key={f} className="flex items-center gap-2">
                              <div className="w-3.5 h-3.5 rounded-full bg-green-500/30 border border-green-500/50 flex items-center justify-center flex-shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                              </div>
                              <p className="text-white/70 text-[9px] font-semibold">{f}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Visual: Pro */}
                    {slide.visual === "pro" && (
                      <div className="w-44 rounded-2xl border border-violet-500/40 bg-gray-900 overflow-hidden">
                        <div className="bg-violet-700 px-3 py-2 flex items-center justify-between">
                          <p className="text-white text-[10px] font-extrabold">Plano Pro</p>
                          <span className="text-yellow-300 text-[10px] font-bold">R$57/mês</span>
                        </div>
                        <div className="p-3 space-y-1.5">
                          <p className="text-violet-400 text-[8px] font-extrabold uppercase tracking-wider mb-2">Tudo do Essencial +</p>
                          {["Foto e capa personalizada","Galeria de fotos no site","15 posts · 15 legendas","Roteiros para Reels","Sequência de Stories","Carrosséis completos","Narrativas Magnéticas"].map(f => (
                            <div key={f} className="flex items-center gap-2">
                              <div className="w-3.5 h-3.5 rounded-full bg-violet-500/30 border border-violet-500/50 flex items-center justify-center flex-shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                              </div>
                              <p className="text-white/70 text-[9px] font-semibold">{f}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Visual: Narrativa Magnética */}
                    {slide.visual === "magnetica" && (
                      <div className="w-44 rounded-2xl border border-purple-500/40 bg-gray-900 overflow-hidden">
                        <div className="bg-purple-800/80 px-3 py-2">
                          <p className="text-purple-200 text-[9px] font-extrabold uppercase tracking-wider">Narrativas Magnéticas</p>
                        </div>
                        <div className="p-3 space-y-2">
                          {[
                            { label: "Gancho", text: "\"Por que 80% dos clientes somem...\"" },
                            { label: "Desenvolvimento", text: "\"Não é o preço. É como você aparece...\"" },
                            { label: "CTA", text: "\"Comenta AQUI que eu te explico 👇\"" },
                          ].map(({ label, text }) => (
                            <div key={label} className="bg-purple-900/40 rounded-lg p-2 border border-purple-500/20">
                              <p className="text-purple-400 text-[8px] font-extrabold uppercase tracking-wider mb-0.5">{label}</p>
                              <p className="text-white/70 text-[9px] italic leading-tight">{text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Visual: Como funciona / Dashboard */}
                    {slide.visual === "dashboard" && (
                      <div className="w-44 rounded-2xl overflow-hidden border border-blue-500/30 bg-gray-900">
                        <div className="bg-blue-700 px-3 py-2"><p className="text-white text-[9px] font-bold">Meu painel</p></div>
                        <div className="p-3 space-y-2">
                          {[
                            { icon: "🌐", text: "Mini site ativo", ok: true },
                            { icon: "📸", text: "Posts gerados", ok: true },
                            { icon: "✏️", text: "Legendas prontas", ok: true },
                            { icon: "💬", text: "Mensagens WA", ok: true },
                          ].map(item => (
                            <div key={item.text} className="flex items-center gap-2 bg-blue-900/20 rounded-lg px-2 py-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                              <p className="text-white/70 text-[9px] font-semibold">{item.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Visual: Preço final — comparação dos dois planos */}
                    {slide.visual === "price" && (
                      <div className="flex gap-2">
                        <div className="flex-1 rounded-xl border border-green-500/30 bg-gray-900 p-3 text-center">
                          <p className="text-green-400 text-[9px] font-extrabold uppercase tracking-wider mb-2">Essencial</p>
                          <p className="text-white text-2xl font-extrabold">R$37,90</p>
                          <p className="text-white/30 text-[9px] mb-3">/mês</p>
                          {["Mini site","5 posts","5 legendas"].map(f => (
                            <div key={f} className="flex items-center gap-1.5 mb-1">
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500/40 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-green-400" /></div>
                              <p className="text-white/50 text-[8px]">{f}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex-1 rounded-xl border border-violet-500/40 bg-gray-900 p-3 text-center">
                          <p className="text-violet-400 text-[9px] font-extrabold uppercase tracking-wider mb-2">Pro</p>
                          <p className="text-white text-2xl font-extrabold">R$57</p>
                          <p className="text-white/30 text-[9px] mb-3">/mês</p>
                          {["Site + fotos","15 posts","Narrativas"].map(f => (
                            <div key={f} className="flex items-center gap-1.5 mb-1">
                              <div className="w-2.5 h-2.5 rounded-full bg-violet-500/40 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-violet-400" /></div>
                              <p className="text-white/50 text-[8px]">{f}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Texto */}
                  <div className="flex-1 text-left">
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ background: slide.color + "25", color: slide.color }}>
                      {slide.tag}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-4">
                      {slide.headline}
                    </h2>
                    <p className="text-white/55 text-base leading-relaxed">
                      {slide.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Barra de progresso + navegação */}
            <div className="px-5 pb-5 pt-2 border-t border-white/8">
              {/* Indicadores de slide */}
              <div className="flex gap-1.5 mb-3">
                {VSL_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setVslSlide(i); setVslProgress(0); }}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{ flex: i === vslSlide ? 3 : 1, background: i < vslSlide ? "#7c3aed" : i === vslSlide ? "#a78bfa" : "rgba(255,255,255,0.15)" }}
                  >
                    {i === vslSlide && (
                      <div className="h-full rounded-full bg-violet-400 transition-all duration-75" style={{ width: `${vslProgress}%` }} />
                    )}
                  </button>
                ))}
              </div>

              {/* Controles */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => { setVslSlide(s => Math.max(0, s - 1)); setVslProgress(0); }} disabled={vslSlide === 0} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition disabled:opacity-30">
                    ← Anterior
                  </button>
                  <button onClick={() => { setVslSlide(s => Math.min(VSL_SLIDES.length - 1, s + 1)); setVslProgress(0); }} disabled={vslSlide === VSL_SLIDES.length - 1} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition disabled:opacity-30">
                    Próximo →
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/30 text-xs">{vslSlide + 1} / {VSL_SLIDES.length}</span>
                  <button
                    onClick={() => { setVslOpen(false); scrollToForm(); }}
                    className="inline-flex items-center gap-2 gradient-brand text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition"
                  >
                    Criar minha prévia grátis <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
