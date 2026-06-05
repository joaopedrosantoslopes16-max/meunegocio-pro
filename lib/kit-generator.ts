import { NICHE_CONFIG } from "./niche-config";
import type { Post, TemplateType, PostCategory } from "@/types";

interface GenerateKitInput {
  business_name: string;
  niche: string;
  city: string;
  whatsapp: string;
  main_service: string;
  services?: string[];
  primary_color?: string;
  instagram?: string;
}

function t(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (str, [k, v]) => str.replaceAll(`[${k}]`, v),
    template
  );
}

export function generateInstagramBio(input: GenerateKitInput): string {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const label = cfg.label;
  return `${label} em ${input.city}\n${input.main_service}\n${cfg.cta} 👇`;
}

export function generateWhatsAppMessages(input: GenerateKitInput): string[] {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const v = {
    NOME: input.business_name,
    CIDADE: input.city,
    SERVICO: input.main_service,
    CTA: cfg.cta,
  };

  return [
    t("Olá! Tudo bem? Aqui é da [NOME]. Estamos atendendo em [CIDADE] com [SERVICO]. Posso te passar mais informações?", v),
    t("Oi! Faz um tempinho que você não aparecia. Essa semana temos horários para [SERVICO]. Quer que eu veja um horário para você?", v),
    t("Olá! Esta semana temos uma condição especial para [SERVICO] aqui na [NOME]. Quer saber mais?", v),
    t("Oi! Só confirmando seu horário na [NOME]. Qualquer dúvida, pode me chamar aqui.", v),
    t("Olá! Obrigado por escolher a [NOME]. Se gostou do atendimento, sua avaliação no Google ajuda muito nosso trabalho! 🙏", v),
    t("Oi! Para [SERVICO] é [CIDADE por [NOME]. Posso te passar o valor e as condições?", v),
    t("Olá! Que tal fazer um orçamento sem compromisso? A [NOME] atende em [CIDADE] com [SERVICO]. Chame aqui!", v),
    t("Oi! Você sabia que a [NOME] oferece [SERVICO] em [CIDADE]? Qualidade garantida. Quer saber mais?", v),
    t("Olá! Nossa agenda está aberta para [SERVICO] essa semana. Quer garantir seu horário na [NOME]?", v),
    t("Obrigado por nos escolher! Foi um prazer te atender na [NOME]. Até a próxima! 😊", v),
  ];
}

const POST_TEMPLATES: {
  category: PostCategory;
  template_type: TemplateType;
  title: string;
  subtitle: string;
  cta: string;
}[] = [
  // VENDA (10)
  { category: "venda", template_type: "whatsapp_cta", title: "Chame no WhatsApp!", subtitle: "[NOME] em [CIDADE] — [SERVICO]", cta: "[CTA]" },
  { category: "venda", template_type: "promotion", title: "Promoção da semana", subtitle: "[SERVICO] com condições especiais em [CIDADE]", cta: "Aproveite agora!" },
  { category: "venda", template_type: "main_service", title: "[SERVICO]", subtitle: "Feito com qualidade e dedicação em [CIDADE]", cta: "[CTA]" },
  { category: "venda", template_type: "whatsapp_cta", title: "Agenda aberta!", subtitle: "Reserve seu horário na [NOME]", cta: "Agende agora" },
  { category: "venda", template_type: "location", title: "Estamos em [CIDADE]!", subtitle: "Atendendo com qualidade e atenção", cta: "[CTA]" },
  { category: "venda", template_type: "main_service", title: "Conheça nosso diferencial", subtitle: "[SERVICO] com atendimento personalizado", cta: "[CTA]" },
  { category: "venda", template_type: "whatsapp_cta", title: "Orçamento grátis!", subtitle: "Sem compromisso. Fale com a [NOME].", cta: "Solicite agora" },
  { category: "venda", template_type: "promotion", title: "Peça sua avaliação", subtitle: "Venha conhecer o trabalho da [NOME] em [CIDADE]", cta: "Agende sua visita" },
  { category: "venda", template_type: "main_service", title: "Destaque do mês", subtitle: "[SERVICO] — o que há de melhor em [CIDADE]", cta: "[CTA]" },
  { category: "venda", template_type: "whatsapp_cta", title: "Não perca mais tempo!", subtitle: "A [NOME] tem o que você precisa em [CIDADE]", cta: "Fale agora" },

  // AUTORIDADE (10)
  { category: "autoridade", template_type: "authority", title: "Dica importante", subtitle: "Sabia que [SERVICO] faz toda a diferença no seu dia a dia?", cta: "Saiba mais" },
  { category: "autoridade", template_type: "authority", title: "Erro comum", subtitle: "Deixar [SERVICO] para depois pode sair mais caro. Cuide logo!", cta: "Fale com a gente" },
  { category: "autoridade", template_type: "authority", title: "Benefício real", subtitle: "[SERVICO] traz qualidade de vida e bem-estar. Descubra como.", cta: "[CTA]" },
  { category: "autoridade", template_type: "main_service", title: "Por que nos escolher?", subtitle: "A [NOME] oferece experiência, cuidado e resultados em [CIDADE]", cta: "Conheça nosso trabalho" },
  { category: "autoridade", template_type: "authority", title: "Atenção especial", subtitle: "Com [SERVICO], cada detalhe importa. A [NOME] cuida de tudo.", cta: "[CTA]" },
  { category: "autoridade", template_type: "authority", title: "Mito ou verdade?", subtitle: "Sobre [SERVICO]: descubra o que realmente funciona.", cta: "Pergunte para a gente" },
  { category: "autoridade", template_type: "authority", title: "Como funciona?", subtitle: "Veja o passo a passo do nosso processo de [SERVICO]", cta: "Saiba mais" },
  { category: "autoridade", template_type: "authority", title: "Informação vale ouro", subtitle: "Tudo que você precisa saber sobre [SERVICO] está aqui.", cta: "Tire suas dúvidas" },
  { category: "autoridade", template_type: "authority", title: "Nossa recomendação", subtitle: "Para melhores resultados com [SERVICO], conte com quem sabe.", cta: "[CTA]" },
  { category: "autoridade", template_type: "main_service", title: "Confiança comprovada", subtitle: "A [NOME] atende em [CIDADE] com excelência e responsabilidade", cta: "Conheça mais" },

  // RELACIONAMENTO (10)
  { category: "relacionamento", template_type: "location", title: "Bom dia! ☀️", subtitle: "Que essa semana seja cheia de conquistas. A [NOME] está aqui para você!", cta: "Bom dia, [CIDADE]!" },
  { category: "relacionamento", template_type: "whatsapp_cta", title: "Não esqueça!", subtitle: "Você ainda não agendou seu [SERVICO]. A [NOME] está esperando.", cta: "Agende agora" },
  { category: "relacionamento", template_type: "authority", title: "Por trás dos bastidores", subtitle: "Preparação e cuidado em cada detalhe do nosso trabalho na [NOME]", cta: "Veja mais" },
  { category: "relacionamento", template_type: "authority", title: "Clientes satisfeitos", subtitle: "\"Clientes satisfeitos começam com um atendimento bem feito.\" — [NOME]", cta: "Seja o próximo!" },
  { category: "relacionamento", template_type: "whatsapp_cta", title: "Siga nossas redes!", subtitle: "Acompanhe a [NOME] no Instagram para novidades e dicas", cta: "Seguir @" },
  { category: "relacionamento", template_type: "whatsapp_cta", title: "Assista nossos stories!", subtitle: "Compartilhamos dicas e bastidores todos os dias!", cta: "Ver stories" },
  { category: "relacionamento", template_type: "authority", title: "Você sabia?", subtitle: "Conta pra gente nos comentários o que você mais gosta em [SERVICO]!", cta: "Comente aqui 👇" },
  { category: "relacionamento", template_type: "location", title: "Obrigado! 🙏", subtitle: "A cada cliente atendido, nossa missão cresce. Obrigado pela confiança!", cta: "Até a próxima!" },
  { category: "relacionamento", template_type: "whatsapp_cta", title: "Horário de atendimento", subtitle: "A [NOME] atende em [CIDADE]. Venha nos visitar!", cta: "[CTA]" },
  { category: "relacionamento", template_type: "main_service", title: "[NOME]", subtitle: "[SERVICO] em [CIDADE] com qualidade e respeito", cta: "Somos nós! 💙" },
];

// Embaralha deterministicamente com base em uma semente (mês+ano+negócio)
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Paleta de variações de cor por lote (cada mês tem um tom diferente)
const BATCH_COLORS = [
  null,        // mês 1: usa cor principal do negócio
  "#2563eb",   // mês 2: azul
  "#059669",   // mês 3: verde esmeralda
  "#dc2626",   // mês 4: vermelho
  "#d97706",   // mês 5: âmbar
  "#7c3aed",   // mês 6: violeta
  "#0891b2",   // mês 7: ciano
  "#db2777",   // mês 8: rosa
  "#65a30d",   // mês 9: lima
  "#9333ea",   // mês 10: roxo
  "#0284c7",   // mês 11: azul claro
  "#b45309",   // mês 12: marrom dourado
];

export function generatePosts(input: GenerateKitInput & { month?: number; year?: number; batchIndex?: number }): Post[] {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const v = {
    NOME: input.business_name,
    CIDADE: input.city,
    SERVICO: input.main_service,
    CTA: cfg.cta,
  };

  // Semente única por mês/ano/negócio — posts diferentes a cada mês
  const seed = ((input.month ?? 1) * 31 + (input.year ?? 2025) * 12) ^ input.business_name.length;
  const shuffled = seededShuffle(POST_TEMPLATES, seed);

  // Cor do lote: cada mês tem um accent diferente
  const batchIdx = input.batchIndex ?? ((input.month ?? 1) - 1);
  const batchColor = BATCH_COLORS[batchIdx % BATCH_COLORS.length] ?? null;

  return shuffled.map((tpl, i) => ({
    number: i + 1,
    template_type: tpl.template_type,
    category: tpl.category,
    title: t(tpl.title, v),
    subtitle: t(tpl.subtitle, v),
    cta: t(tpl.cta, v),
    caption: "",
    is_unlocked: false,
    batch_color: batchColor, // cor do lote — null = usa cor do negócio
  }));
}

// Gera posts extras (diferentes dos mensais — semente baseada no packageId)
export function generateExtraPosts(input: GenerateKitInput, packageId: string, count: number): Post[] {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const v = { NOME: input.business_name, CIDADE: input.city, SERVICO: input.main_service, CTA: cfg.cta };
  const seed = packageId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) * 7919;
  const shuffled = seededShuffle(POST_TEMPLATES, seed);
  return shuffled.slice(0, count).map((tpl, i) => ({
    number: i + 1,
    template_type: tpl.template_type,
    category: tpl.category,
    title: t(tpl.title, v),
    subtitle: t(tpl.subtitle, v),
    cta: t(tpl.cta, v),
    caption: "",
    is_unlocked: true,
    batch_color: "#f59e0b", // âmbar — identifica como "extra"
  }));
}

// Gera mensagens extras (diferentes das mensais)
export function generateExtraMessages(input: GenerateKitInput, packageId: string, count: number): string[] {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const v = { NOME: input.business_name, CIDADE: input.city, SERVICO: input.main_service, CTA: cfg.cta };
  const allMessages = [
    t("Oi, [NOME] aqui! Você sabia que temos [SERVICO] disponível em [CIDADE]? Chama a gente!", v),
    t("Olá! A [NOME] está com agenda aberta para [SERVICO]. Quer garantir seu horário?", v),
    t("Oi! Faz tempo que não aparece por aqui. Que tal agendar um [SERVICO] essa semana?", v),
    t("Olá! Trouxemos novidades para você em [SERVICO]. A [NOME] te aguarda em [CIDADE]!", v),
    t("Oi! Você já conhece nosso [SERVICO]? A [NOME] é referência em [CIDADE]. Chama aqui!", v),
    t("Olá! Sua última visita foi há um tempo. Podemos te atender essa semana em [SERVICO]?", v),
    t("Oi! A [NOME] tem condição especial para clientes antigos em [SERVICO]. Interesse?", v),
    t("Olá! Recomenda a [NOME] para alguém? Temos [SERVICO] de qualidade em [CIDADE]!", v),
    t("Oi! Você merece um cuidado especial. A [NOME] reservou horário para [SERVICO]. Confirma?", v),
    t("Olá! Sua satisfação é prioridade na [NOME]. Como foi seu último [SERVICO]? Nos conta!", v),
  ];
  const seed = packageId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) * 3571;
  const shuffled = seededShuffle(allMessages, seed);
  // Multiplica até atingir o count pedido
  const result: string[] = [];
  while (result.length < count) result.push(...shuffled);
  return result.slice(0, count);
}

export function generateCaptions(input: GenerateKitInput): string[] {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const v = {
    NOME: input.business_name,
    CIDADE: input.city,
    SERVICO: input.main_service,
    CTA: cfg.cta,
  };

  const templates = [
    "Quer [SERVICO] de qualidade? A [NOME] está pronta para te atender em [CIDADE]. Chame no WhatsApp e agende seu horário! 👇",
    "Seu [SERVICO] merece cuidado. A [NOME] atende em [CIDADE] com atenção personalizada. Agende agora! 📲",
    "Está buscando [SERVICO] em [CIDADE]? Venha conhecer a [NOME]! Chame no WhatsApp. ✨",
    "Qualidade, atenção e resultado. A [NOME] oferece [SERVICO] para você em [CIDADE]. [CTA]! 👇",
    "Não adie mais. Cuide do seu [SERVICO] com a [NOME] em [CIDADE]. Fale com a gente! 💬",
    "A [NOME] está em [CIDADE] para te ajudar com [SERVICO]. Vamos conversar? 😊",
    "Promoção especial! Não perca a oportunidade de ter [SERVICO] com a [NOME] em [CIDADE]. Chame agora!",
    "Você merece o melhor em [SERVICO]. A [NOME] tá em [CIDADE] esperando por você! 🙌",
    "Sabia que [SERVICO] faz toda a diferença? A [NOME] te mostra como na prática. [CTA]! 💡",
    "Dica da [NOME]: cuide do seu [SERVICO] regularmente. Estamos em [CIDADE] para te ajudar!",
    "Agenda aberta essa semana! Reserve seu horário na [NOME] em [CIDADE] para [SERVICO]. 📅",
    "Atendimento humanizado e resultado garantido. A [NOME] em [CIDADE] te espera! [CTA].",
    "Por que escolher a [NOME]? Qualidade, experiência e cuidado em cada atendimento em [CIDADE].",
    "Olha que dica importante sobre [SERVICO]! A [NOME] em [CIDADE] te orienta. Chame! 💬",
    "Erro comum: deixar [SERVICO] para depois. Não faça isso! A [NOME] resolve agora em [CIDADE].",
    "A [NOME] tem o [SERVICO] que você precisa em [CIDADE]. Não perca mais tempo!",
    "Novidade na [NOME]! Confira nossas condições especiais para [SERVICO] em [CIDADE]. Chame! 🎉",
    "Gratidão é a palavra! Obrigado por cada cliente que confia na [NOME] em [CIDADE]. 💙",
    "Siga nosso Instagram e fique por dentro das novidades da [NOME] em [CIDADE]! ✅",
    "Você tem dúvidas sobre [SERVICO]? A [NOME] responde tudo! Manda mensagem. 📩",
    "Semana começa bem quando você cuida do seu [SERVICO]. A [NOME] está em [CIDADE]! 🌟",
    "Conheça o trabalho da [NOME] e veja por que somos referência em [SERVICO] em [CIDADE].",
    "Orçamento sem compromisso? Claro! A [NOME] atende em [CIDADE]. Chame agora! 💸",
    "Seu bem-estar é nossa prioridade. A [NOME] em [CIDADE] cuida do seu [SERVICO] com carinho.",
    "Testimonial genuíno: \"Clientes satisfeitos começam com um atendimento bem feito.\" — [NOME]",
    "Bom dia, [CIDADE]! A [NOME] está pronta para mais um dia de excelência em [SERVICO]. ☀️",
    "Lembrete: [SERVICO] precisa de atenção regular. A [NOME] em [CIDADE] está aqui para isso!",
    "Horário especial disponível essa semana! Reserve na [NOME] — [SERVICO] em [CIDADE]. 🗓️",
    "Final de semana produtivo começa com um bom [SERVICO]! A [NOME] atende em [CIDADE]. 💪",
    "Chegou na hora certa! A [NOME] tem tudo para o seu [SERVICO] em [CIDADE]. [CTA]! 🚀",
  ];

  return templates.map((tpl) => t(tpl, v));
}

export function generateSlug(businessName: string): string {
  const base = businessName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}
