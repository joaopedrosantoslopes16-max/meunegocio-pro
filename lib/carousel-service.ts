import type {
  PremiumCarousel,
  PremiumCarouselSlide,
  CarouselLayout,
  CarouselObjective,
  CarouselVisualStyle,
} from "@/types";

// ─── Public interface ─────────────────────────────────────────

export interface CarouselInput {
  topic: string;
  objective: CarouselObjective;
  niche: string;
  businessName: string;
  city: string;
  mainService: string;
  whatsapp: string;
  selectedImages: string[];
  slideImagesMap?: Record<number, string>;
  visualStyle: CarouselVisualStyle;
  format: "4/5" | "1/1" | "9/16";
  slideCount?: number;
  // Rich business context
  services?: string[];
  benefits?: string[];
  description?: string;
  testimonials?: { text: string; author: string }[];
  // Regeneration
  regenerationSeed?: number;
  regenerateHint?: "mais_vendedor" | "mais_educativo" | "mais_direto" | "mais_criativo" | "mais_institucional" | "outro_angulo" | "mais_promocional" | "menos_generico" | "outra_paleta" | "outro_layout" | "menos_texto" | "mais_contexto";
  primaryColor?: string;
}

// ─── Reels script ─────────────────────────────────────────────

export interface ReelsScript {
  videoTitle: string;
  hook: string;
  script: string;
  screenText: string[];
  cta: string;
}

// ─── Core helpers ─────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function variationIndex(seed: string, count: number): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h) ^ seed.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h) % count;
}

function joinServices(services: string[], fallback: string): string {
  const list = services.filter(Boolean).slice(0, 3);
  if (!list.length) return fallback;
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} e ${list[1]}`;
  return `${list[0]}, ${list[1]} e ${list[2]}`;
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function assignImages(
  images: string[],
  count: number,
  map?: Record<number, string>
): (string | undefined)[] {
  const result: (string | undefined)[] = Array(count).fill(undefined);
  if (map && Object.keys(map).length > 0) {
    Object.entries(map).forEach(([k, v]) => {
      const idx = parseInt(k);
      if (idx < count && v) result[idx] = v;
    });
    return result;
  }
  if (!images.length) return result;
  const slots = Array.from({ length: count - 1 }, (_, i) => i);
  slots.forEach((slot, i) => { result[slot] = images[i % images.length]; });
  return result;
}

// ─── Layout system ────────────────────────────────────────────

// Layout sequences alternate dark/light/color to break visual monotony
// Dark: bold_statement, image_overlay, card_glass
// Light: editorial_top, content_list (no-image)
// Color: full_color
// Split: split_image, content_list (with-image)
const CONTENT_LAYOUTS_WITH_IMAGES: Record<CarouselVisualStyle, CarouselLayout[]> = {
  moderno:     ["bold_statement",  "editorial_top", "full_color",    "image_overlay", "split_image",   "content_list"],
  premium:     ["card_glass",      "editorial_top", "full_color",    "card_glass",    "editorial_top", "image_overlay"],
  clean:       ["editorial_top",   "content_list",  "split_image",   "editorial_top", "full_color",    "content_list"],
  chamativo:   ["bold_statement",  "full_color",    "image_overlay", "editorial_top", "bold_statement","split_image"],
  elegante:    ["card_glass",      "editorial_top", "full_color",    "split_image",   "editorial_top", "card_glass"],
  minimalista: ["editorial_top",   "content_list",  "editorial_top", "content_list",  "editorial_top", "content_list"],
};

const CONTENT_LAYOUTS_NO_IMAGES: Record<CarouselVisualStyle, CarouselLayout[]> = {
  moderno:     ["bold_statement", "content_list",  "full_color",    "content_list",  "bold_statement","full_color"],
  premium:     ["card_glass",     "content_list",  "full_color",    "content_list",  "card_glass",    "full_color"],
  clean:       ["content_list",   "full_color",    "content_list",  "content_list",  "full_color",    "content_list"],
  chamativo:   ["bold_statement", "full_color",    "bold_statement","full_color",    "bold_statement","content_list"],
  elegante:    ["card_glass",     "full_color",    "card_glass",    "content_list",  "card_glass",    "full_color"],
  minimalista: ["content_list",   "content_list",  "full_color",    "content_list",  "content_list",  "full_color"],
};

function layoutsForStyle(style: CarouselVisualStyle, hasImages: boolean, count: number): CarouselLayout[] {
  const pool = hasImages ? CONTENT_LAYOUTS_WITH_IMAGES[style] : CONTENT_LAYOUTS_NO_IMAGES[style];
  const layouts: CarouselLayout[] = ["cover_hero"];
  const contentCount = count - 2;
  for (let i = 0; i < contentCount; i++) layouts.push(pool[i % pool.length]);
  layouts.push("cta_final");
  return layouts;
}

// ─── Niche-specific layout pools ──────────────────────────────
// Ordered to align with NICHE_ROLES_PRIMARY sequences below
const NICHE_LAYOUT_POOLS: Partial<Record<NicheKey, CarouselLayout[]>> = {
  barbearia:         ["before_after", "steps_process", "stats_card",    "testimonial_quote", "bold_statement", "image_overlay"],
  odontologia:       ["before_after", "steps_process", "stats_card",    "testimonial_quote", "card_glass",     "content_list"],
  "personal-trainer":["stats_card",   "before_after",  "steps_process", "testimonial_quote", "bold_statement", "image_overlay"],
  estetica:          ["before_after", "steps_process", "stats_card",    "testimonial_quote", "card_glass",     "image_overlay"],
  "clinica-medica":  ["before_after", "steps_process", "stats_card",    "testimonial_quote", "content_list",   "card_glass"],
  mecanica:          ["stats_card",   "steps_process", "before_after",  "bold_statement",    "content_list",   "split_image"],
  imobiliaria:       ["stats_card",   "split_image",   "steps_process", "testimonial_quote", "card_glass",     "image_overlay"],
  consultoria:       ["stats_card",   "steps_process", "before_after",  "testimonial_quote", "content_list",   "bold_statement"],
};

// ─── Niche-specific content roles (aligned with layout pools) ─
const NICHE_ROLES_PRIMARY: Partial<Record<NicheKey, SlideRole[]>> = {
  barbearia:         ["antes_depois", "passo_a_passo", "numero_destaque", "prova"],
  odontologia:       ["antes_depois", "passo_a_passo", "numero_destaque", "prova"],
  "personal-trainer":["numero_destaque", "antes_depois", "passo_a_passo", "prova"],
  estetica:          ["antes_depois", "passo_a_passo", "numero_destaque", "prova"],
  "clinica-medica":  ["antes_depois", "passo_a_passo", "numero_destaque", "prova"],
  mecanica:          ["numero_destaque", "passo_a_passo", "diferencial",  "prova"],
  imobiliaria:       ["numero_destaque", "diferencial",  "passo_a_passo", "prova"],
  consultoria:       ["numero_destaque", "passo_a_passo", "diferencial",  "prova"],
};

function layoutsForNiche(
  niche: NicheKey, style: CarouselVisualStyle, hasImages: boolean, count: number
): CarouselLayout[] {
  const nichePool = NICHE_LAYOUT_POOLS[niche];
  if (!nichePool) return layoutsForStyle(style, hasImages, count);

  let pool = [...nichePool];
  if (!hasImages) {
    // Replace image-dependent layouts when no photos available
    pool = pool.map(l =>
      (l === "image_overlay" || l === "card_glass" || l === "split_image") ? "content_list" : l
    );
  }

  const layouts: CarouselLayout[] = ["cover_hero"];
  for (let i = 0; i < count - 2; i++) layouts.push(pool[i % pool.length]);
  layouts.push("cta_final");
  return layouts;
}

const OVERLAY_OPACITY: Record<CarouselVisualStyle, { cover: number; overlay: number; card: number }> = {
  moderno:     { cover: 0.55, overlay: 0.60, card: 0.30 },
  premium:     { cover: 0.50, overlay: 0.55, card: 0.25 },
  clean:       { cover: 0.45, overlay: 0.50, card: 0.20 },
  chamativo:   { cover: 0.62, overlay: 0.68, card: 0.35 },
  elegante:    { cover: 0.50, overlay: 0.55, card: 0.25 },
  minimalista: { cover: 0.40, overlay: 0.45, card: 0.18 },
};

function bgForLayout(layout: CarouselLayout, index: number): "primary" | "dark" | "white" | "accent" {
  // Covers
  if (layout === "cover_hero")         return "primary";
  if (layout === "cover_split")        return "dark";
  if (layout === "cover_minimal")      return "dark";
  if (layout === "cover_magazine")     return "primary";
  // Content
  if (layout === "bold_statement")     return index % 2 === 0 ? "dark" : "primary";
  if (layout === "content_list")       return index % 2 === 0 ? "white" : "accent";
  if (layout === "split_image")        return "white";
  if (layout === "card_glass")         return "primary";
  if (layout === "image_overlay")      return "primary";
  if (layout === "feature_highlight")  return "dark";
  if (layout === "before_after")       return "dark";
  if (layout === "stats_card")         return "dark";
  if (layout === "testimonial_quote")  return "dark";
  if (layout === "steps_process")      return "white";
  // CTAs
  if (layout === "cta_final")          return "dark";
  if (layout === "cta_minimal")        return "white";
  if (layout === "cta_split")          return "dark";
  return "white";
}

// ─── Art Direction System ──────────────────────────────────────
// Each profile defines: which cover, which CTA, and preferred content layouts
// The profile rotates by regenerationSeed — so each "Outra versão" looks genuinely different

interface ArtProfile {
  id: string;
  cover: CarouselLayout;
  cta: CarouselLayout;
  contentPreference: CarouselLayout[];
}

const ART_PROFILES: ArtProfile[] = [
  // 1. Editorial — split cover, minimal white CTA — sofisticado
  { id: "editorial",    cover: "cover_split",    cta: "cta_minimal",  contentPreference: ["split_image", "content_list", "stats_card", "testimonial_quote", "feature_highlight"] },
  // 2. Impact — magazine cover, dark bold CTA — impactante
  { id: "impact",       cover: "cover_magazine",  cta: "cta_final",    contentPreference: ["bold_statement", "before_after", "stats_card", "image_overlay", "feature_highlight"] },
  // 3. Premium Dark — hero cover, split image CTA — premium escuro
  { id: "premium_dark", cover: "cover_hero",      cta: "cta_split",    contentPreference: ["bold_statement", "card_glass", "testimonial_quote", "stats_card", "feature_highlight"] },
  // 4. Minimal — text-only cover, clean white CTA — minimalista
  { id: "minimal",      cover: "cover_minimal",   cta: "cta_minimal",  contentPreference: ["content_list", "bold_statement", "steps_process", "feature_highlight", "split_image"] },
  // 5. Magazine — magazine cover, split CTA — editorial visual
  { id: "magazine",     cover: "cover_magazine",  cta: "cta_split",    contentPreference: ["image_overlay", "bold_statement", "testimonial_quote", "card_glass", "feature_highlight"] },
  // 6. Split Story — split cover, split CTA — narrativa visual
  { id: "split_story",  cover: "cover_split",     cta: "cta_split",    contentPreference: ["split_image", "before_after", "steps_process", "stats_card", "content_list"] },
];

// Visual style → which profiles to prefer (in rotation order)
const STYLE_ART_PROFILES: Record<CarouselVisualStyle, string[]> = {
  moderno:     ["impact",       "editorial",    "split_story"],
  premium:     ["editorial",    "premium_dark", "magazine"   ],
  clean:       ["minimal",      "editorial",    "premium_dark"],
  chamativo:   ["impact",       "magazine",     "split_story"],
  elegante:    ["editorial",    "magazine",     "premium_dark"],
  minimalista: ["minimal",      "editorial",    "split_story"],
};

function selectArtProfile(style: CarouselVisualStyle, seed: number): ArtProfile {
  const preferredIds = STYLE_ART_PROFILES[style] ?? STYLE_ART_PROFILES.moderno;
  const profileId = preferredIds[seed % preferredIds.length];
  return ART_PROFILES.find(p => p.id === profileId) ?? ART_PROFILES[0];
}

function layoutsWithArtDirection(
  niche: NicheKey, style: CarouselVisualStyle, hasImages: boolean, count: number, seed: number
): CarouselLayout[] {
  const profile = selectArtProfile(style, seed);

  // Niche pool provides niche-aligned content layouts
  const nichePool = NICHE_LAYOUT_POOLS[niche];

  // Merge: niche pool first (niche identity), profile preference fills remaining
  let contentPool: CarouselLayout[];
  if (nichePool) {
    const merged = [...nichePool];
    profile.contentPreference.forEach(l => { if (!merged.includes(l)) merged.push(l); });
    contentPool = merged;
  } else {
    contentPool = [...profile.contentPreference];
  }

  // Remove image-dependent layouts when no photos
  if (!hasImages) {
    const imageLayouts: CarouselLayout[] = ["image_overlay", "card_glass", "split_image", "cover_split", "cover_magazine", "cta_split"];
    contentPool = contentPool.filter(l => !imageLayouts.includes(l));
    if (!contentPool.length) contentPool = ["content_list", "bold_statement", "steps_process"];
  }

  // Cover: fall back to cover_minimal when profile needs image but none available
  const needsImageCover: CarouselLayout[] = ["cover_split", "cover_magazine", "cover_hero"];
  const cover = !hasImages && needsImageCover.includes(profile.cover) ? "cover_minimal" : profile.cover;

  // CTA: fall back to cta_minimal when profile split CTA needs image but none available
  const cta = !hasImages && profile.cta === "cta_split" ? "cta_minimal" : profile.cta;

  const layouts: CarouselLayout[] = [cover];
  for (let i = 0; i < count - 2; i++) layouts.push(contentPool[i % contentPool.length]);
  layouts.push(cta);
  return layouts;
}

// ─── Niche system ─────────────────────────────────────────────

type NicheKey = "barbearia" | "odontologia" | "personal-trainer" | "restaurante" |
                "estetica" | "loja-roupa" | "mecanica" | "imobiliaria" |
                "clinica-medica" | "consultoria" | "outro";

function nicheKey(niche: string): NicheKey {
  const n = niche.toLowerCase();
  // Barbearia / Cabelo
  if (n.includes("barb") || n.includes("cabeleir") || n.includes("salão") || n.includes("salao") || n.includes("cabeleireiro")) return "barbearia";
  // Odontologia
  if (n.includes("odonto") || n.includes("dent") || n.includes("ortodon") || n.includes("implante")) return "odontologia";
  // Personal Trainer / Academia
  if (n.includes("personal") || n.includes("academia") || n.includes("fitness") || n.includes("treino") ||
      n.includes("crossfit") || n.includes("pilates") || n.includes("muscula") || n.includes("esport")) return "personal-trainer";
  // Restaurante / Alimentação
  if (n.includes("restaur") || n.includes("lanche") || n.includes("comida") || n.includes("buffet") ||
      n.includes("café") || n.includes("cafe") || n.includes("pizz") || n.includes("hambur") ||
      n.includes("sushi") || n.includes("açaí") || n.includes("acai") || n.includes("padaria") ||
      n.includes("confeit") || n.includes("bolo") || n.includes("doce") || n.includes("sorvet") ||
      n.includes("churrasco") || n.includes("delivery") || n.includes("marmit")) return "restaurante";
  // Estética / Beleza
  if (n.includes("estet") || n.includes("beleza") || n.includes("manicur") || n.includes("pedicur") ||
      n.includes("cílios") || n.includes("cilios") || n.includes("sobrancelh") || n.includes("depila") ||
      n.includes("spa") || n.includes("micropigment") || n.includes("tatuagem")) return "estetica";
  // Loja / Moda / Varejo
  if (n.includes("loja") || n.includes("moda") || n.includes("roupa") || n.includes("ateliê") ||
      n.includes("brechó") || n.includes("tenis") || n.includes("sapato") || n.includes("acessório") ||
      n.includes("varejo") || n.includes("venda") || n.includes("lingual")) return "loja-roupa";
  // Mecânica / Automotivo
  if (n.includes("mecani") || n.includes("autom") || n.includes("oficina") || n.includes("carro") ||
      n.includes("pneu") || n.includes("funilaria") || n.includes("elétrica veíc") || n.includes("borracharia")) return "mecanica";
  // Imobiliária
  if (n.includes("imobil") || n.includes("corretor") || n.includes("imóvel") || n.includes("imovel") ||
      n.includes("apartam") || n.includes("aluguel") || n.includes("constru") || n.includes("engenharia")) return "imobiliaria";
  // Clínica / Saúde
  if (n.includes("clínica") || n.includes("clinica") || n.includes("médic") || n.includes("medic") ||
      n.includes("saúde") || n.includes("nutri") || n.includes("psicol") || n.includes("terapia") ||
      n.includes("fisioterapia") || n.includes("quiropraxia") || n.includes("veterinár") || n.includes("veterin") ||
      n.includes("farmácia") || n.includes("farmacia") || n.includes("drogaria") || n.includes("pet shop") ||
      n.includes("acupuntura") || n.includes("homeopat")) return "clinica-medica";
  // Consultoria / Jurídico / Contábil / Marketing / Educação / Tecnologia
  if (n.includes("consult") || n.includes("assessor") || n.includes("gestão") || n.includes("gestao") ||
      n.includes("estrateg") || n.includes("coach") || n.includes("mentor") ||
      n.includes("adv") || n.includes("advocac") || n.includes("jurídic") || n.includes("juridic") ||
      n.includes("direito") || n.includes("contábil") || n.includes("contabi") || n.includes("contador") ||
      n.includes("contabilidade") || n.includes("market") || n.includes("agência") || n.includes("agencia") ||
      n.includes("publicid") || n.includes("escola") || n.includes("curso") || n.includes("ensino") ||
      n.includes("educação") || n.includes("professor") || n.includes("tecnolog") || n.includes("software") ||
      n.includes("ti ") || n.includes("design") || n.includes("fotograf") || n.includes("arquitet") ||
      n.includes("financ") || n.includes("investim") || n.includes("seguro") || n.includes("rh ") ||
      n.includes("recursos humanos")) return "consultoria";
  return "outro";
}

type NicheKwTuple = [string, string, string, string, string, string, string, string];
// [técnica, serviço, benefício1, benefício2, dor1, dor2, prova1, prova2]
const NICHE_KW: Record<NicheKey, NicheKwTuple> = {
  barbearia:         ["corte",        "barba",         "estilo",        "acabamento",       "corte malfeito",       "visual descuidado",  "profissional dedicado",  "resultado impecável"],
  odontologia:       ["técnica",      "sorriso",       "saúde bucal",   "bem-estar",        "descuido dental",      "dor de dente",       "prevenção eficaz",       "tratamento humanizado"],
  "personal-trainer":["método",       "treino",        "evolução",      "resultado",        "treino sem foco",      "planejamento errado","acompanhamento real",    "resultado consistente"],
  restaurante:       ["receita",      "ingredientes",  "sabor",         "experiência",      "comida sem qualidade", "demora no pedido",   "ingredientes frescos",   "ambiente agradável"],
  estetica:          ["procedimento", "tratamento",    "beleza",        "autocuidado",      "técnica errada",       "resultado fraco",    "procedimento correto",   "resultado visível"],
  "loja-roupa":      ["curadoria",    "peças",         "estilo",        "look completo",    "roupa sem qualidade",  "tamanho errado",     "curadoria exclusiva",    "atendimento personalizado"],
  mecanica:          ["diagnóstico",  "revisão",       "segurança",     "confiança",        "problema sem solução", "carro parado",       "orçamento transparente", "prazo garantido"],
  imobiliaria:       ["negociação",   "imóvel",        "realização",    "segurança",        "processo burocrático", "documentação errada","experiência de mercado", "negociação eficaz"],
  "clinica-medica":  ["diagnóstico",  "consulta",      "saúde",         "bem-estar",        "descuido com saúde",   "consulta atrasada",  "atendimento humanizado", "resultado responsável"],
  consultoria:       ["especialidade", "assessoria",    "resultado",     "segurança",        "risco sem orientação", "prejuízo evitável",  "especialista qualificado","solução comprovada"],
  outro:             ["processo",     "serviço",       "qualidade",     "resultado",        "falta de atenção",     "resultado abaixo",   "dedicação real",         "experiência comprovada"],
};

const NICHE_COVER_BADGE: Record<NicheKey, string> = {
  barbearia: "ESTILO", odontologia: "SORRISO", "personal-trainer": "TREINO",
  restaurante: "SABOR", estetica: "BELEZA", "loja-roupa": "MODA",
  mecanica: "AUTO", imobiliaria: "IMÓVEL", "clinica-medica": "SAÚDE",
  consultoria: "NEGÓCIO", outro: "DESTAQUE",
};

// Audience profile per niche — informs what the audience wants and fears
interface AudienceProfile {
  wants: [string, string, string, string];
  objection: string;
  engageQ: string;
}

const NICHE_AUDIENCE: Record<NicheKey, AudienceProfile> = {
  barbearia:         { wants: ["corte certinho",       "atendimento rápido",    "resultado que dure",      "ambiente agradável"],   objection: "não tenho tempo pra ir",            engageQ: "Quando foi a última vez que você saiu realmente satisfeito do barbeiro?" },
  odontologia:       { wants: ["sem dor",              "sorriso mais bonito",   "tratamento rápido",        "profissional confiável"],objection: "dentista é caro e demorado",        engageQ: "Você está adiando o cuidado com o seu sorriso?" },
  "personal-trainer":{ wants: ["resultado visível",    "motivação constante",   "método personalizado",    "sem lesão"],            objection: "não tenho tempo nem disciplina",    engageQ: "Você está treinando com o método certo para o seu objetivo?" },
  restaurante:       { wants: ["boa comida",           "ambiente agradável",    "atendimento rápido",       "preço justo"],          objection: "pode ser caro ou demorar",          engageQ: "Quando foi a última vez que uma refeição superou a sua expectativa?" },
  estetica:          { wants: ["resultado visível",    "profissional experiente","produto de qualidade",    "conforto"],             objection: "não sabe se vai valer o preço",     engageQ: "Você está cuidando de você com a atenção que merece?" },
  "loja-roupa":      { wants: ["novidade",             "estilo próprio",        "bom custo-benefício",      "atendimento"],          objection: "comprar e não gostar depois",       engageQ: "Seu guarda-roupa reflete quem você é hoje?" },
  mecanica:          { wants: ["diagnóstico correto",  "orçamento transparente","prazo cumprido",           "confiança"],            objection: "mecânico cobra caro sem precisar",  engageQ: "Você sabe exatamente como está o estado do seu carro hoje?" },
  imobiliaria:       { wants: ["segurança",            "bom negócio",           "transparência",            "atendimento pessoal"],  objection: "processo burocrático e caro",       engageQ: "Você sabe exatamente o que procura num imóvel?" },
  "clinica-medica":  { wants: ["atendimento humano",   "diagnóstico preciso",   "agilidade",               "conforto"],             objection: "espera longa e atendimento frio",   engageQ: "Você está colocando sua saúde em primeiro lugar?" },
  consultoria:       { wants: ["solução rápida e clara",  "especialista de confiança","resultado garantido",   "atendimento personalizado"], objection: "não sei se é para o meu caso ou se vale o investimento", engageQ: "Você está enfrentando um problema que precisa de um especialista de verdade?" },
  outro:             { wants: ["qualidade",            "confiança",             "preço justo",              "bom atendimento"],      objection: "não sei se posso confiar",          engageQ: "O serviço que você recebe hoje está à altura do que você merece?" },
};

// ─── Sales stories — per-niche selling content for objective=vender ──

interface SalesSlide { badge: string; title: string; body?: string; }
interface SalesBenefit { badge: string; title: string; items: string[]; }
interface NicheSalesStory {
  coverTitle: string[];
  pain: SalesSlide[];
  solution: SalesSlide[];
  benefit: SalesBenefit[];
  differentiator: SalesSlide[];
  proof: SalesSlide[];
}

const NICHE_SALES_STORIES: Record<NicheKey, NicheSalesStory> = {
  consultoria: {
    coverTitle: [
      "O problema que você enfrenta tem solução — e está mais perto do que parece",
      "Especialistas certos mudam o resultado do seu caso",
      "Chega de enfrentar isso sozinho — conte com quem entende",
      "Mais do que um serviço: um parceiro que resolve de verdade",
    ],
    pain: [
      { badge: "O PROBLEMA",  title: "Enfrentar situações complexas sem o apoio certo custa tempo, dinheiro e tranquilidade." },
      { badge: "ATENÇÃO",     title: "Sem a orientação de um especialista, o que parece simples pode virar um problema grande." },
      { badge: "REALIDADE",   title: "Adiar a busca por um profissional qualificado quase sempre aumenta o custo e o risco." },
    ],
    solution: [
      { badge: "A SOLUÇÃO",   title: "Com o profissional certo, você tem clareza, segurança e o resultado que precisa." },
      { badge: "COMO FUNCIONA", title: "{B} atende, analisa e entrega a solução mais adequada para o seu caso." },
      { badge: "O CAMINHO",   title: "O trabalho da {B} em {C} é transformar problemas complexos em soluções claras." },
    ],
    benefit: [
      { badge: "O QUE VOCÊ GANHA", title: "Atendimento especializado que entende o seu caso e apresenta a melhor saída.", items: ["Atendimento personalizado", "Solução sob medida", "Prazo e transparência", "Resultado com responsabilidade"] },
      { badge: "RESULTADO",   title: "Com o suporte certo, você resolve mais rápido e com muito mais segurança.", items: ["Menos risco, mais clareza", "Processo bem conduzido", "Orientação do início ao fim", "Decisão embasada"] },
      { badge: "BENEFÍCIOS",  title: "Quem conta com especialistas qualificados resolve melhor, paga menos no longo prazo.", items: ["Economia de tempo e esforço", "Solução definitiva", "Suporte contínuo", "Parceiro de confiança"] },
    ],
    differentiator: [
      { badge: "DIFERENCIAL",   title: "{B} não entrega serviço padrão — entrega atenção real para o seu caso." },
      { badge: "POR QUE A {B}", title: "Cada situação é única. {B} analisa o seu caso e encontra a melhor solução." },
      { badge: "SÓ NA {B}",     title: "A diferença da {B} em {C} está na dedicação e na qualidade de cada atendimento." },
    ],
    proof: [
      { badge: "NA PRÁTICA",    title: "{B} atende clientes em {C} com foco em resultado, clareza e profissionalismo." },
      { badge: "RESULTADO REAL", title: "Quem escolheu a {B} resolveu o que precisava com segurança e confiança." },
      { badge: "CONFIANÇA",     title: "Não era falta de solução — era falta do especialista certo. {B} é esse profissional." },
    ],
  },
  barbearia: {
    coverTitle: [
      "Visual que combina com você — do corte ao acabamento",
      "Você merece sair do barbeiro exatamente como imaginou",
      "Cuidado real com seu visual, do corte ao acabamento",
    ],
    pain: [
      { badge: "ATENÇÃO",     title: "Nada mais frustrante do que pagar por um corte e sair sem o resultado que você queria." },
      { badge: "REALIDADE",   title: "Muita gente desistiu do visual que quer por falta de um barbeiro que realmente ouça." },
      { badge: "O PROBLEMA",  title: "Corte errado, barba descuidada, acabamento fraco — você merece muito mais que isso." },
    ],
    solution: [
      { badge: "A SOLUÇÃO",   title: "Na {B}, cada atendimento começa com uma conversa real sobre o que você quer." },
      { badge: "COMO FAZEMOS", title: "{B} em {C} combina técnica e atenção ao detalhe para entregar o visual certo." },
      { badge: "NOSSO JEITO",  title: "Não é corte em série — é o seu corte, do jeito que fica melhor em você." },
    ],
    benefit: [
      { badge: "O QUE VOCÊ GANHA", title: "Sair da {B} com o visual que imaginou — e querer voltar na semana seguinte.", items: ["Corte consultado e personalizado", "Acabamento que dura dias", "Atendimento pontual", "Resultado que você vai repetir"] },
      { badge: "EXPERIÊNCIA REAL", title: "Um atendimento que respeita seu tempo e valoriza seu resultado.", items: ["Barbeiro que ouve antes de cortar", "Técnica acima da média", "Ambiente que você vai gostar", "Visual que combina com você"] },
      { badge: "VOCÊ MERECE", title: "Qualidade, técnica e cuidado em cada detalhe do seu atendimento.", items: ["Corte + barba com padrão alto", "Produtos que fazem diferença", "Profissional que domina o ofício", "Experiência que vale o preço"] },
    ],
    differentiator: [
      { badge: "DIFERENCIAL",   title: "{B} não faz corte em série — faz o seu corte, do jeito que fica melhor em você." },
      { badge: "POR QUE A {B}", title: "Técnica, atenção e cuidado real. Em {C}, a {B} é o padrão que você vai sentir." },
      { badge: "SÓ NA {B}",     title: "Resultado que você vai repetir — e indicar. É o que a {B} entrega em cada visita." },
    ],
    proof: [
      { badge: "NA PRÁTICA",    title: "Quem veio uma vez na {B} em {C} virou cliente regular — e indicou pra quem importa." },
      { badge: "RESULTADO REAL", title: "Clientes da {B} falam de resultado, não de propaganda. Veja quem já passou por aqui." },
      { badge: "CONFIAM NA GENTE", title: "Não é só corte. É uma experiência que você vai querer repetir toda semana." },
    ],
  },
  odontologia: {
    coverTitle: [
      "Seu sorriso pode ser exatamente o que você imagina",
      "Saúde bucal que você vai sentir no dia a dia",
      "O sorriso que você quer — com segurança e resultado real",
    ],
    pain: [
      { badge: "O PROBLEMA",  title: "Muita gente adia o cuidado com o sorriso por medo, custo ou falta de tempo — e piora." },
      { badge: "ATENÇÃO",     title: "Pequenos descuidos bucais viram problemas maiores e mais caros com o tempo." },
      { badge: "REALIDADE",   title: "Dentista que não explica, tratamento demorado, resultado diferente do esperado — tem como ser diferente." },
    ],
    solution: [
      { badge: "A SOLUÇÃO",   title: "{B} oferece tratamentos claros, com explicação real e sem surpresas no processo." },
      { badge: "COMO FUNCIONA", title: "Na {B} em {C}, cada etapa do tratamento é explicada para você entender e confiar." },
      { badge: "NOSSO CUIDADO", title: "Tecnologia, atenção e escuta real: {B} cuida do seu sorriso com cuidado de verdade." },
    ],
    benefit: [
      { badge: "O QUE VOCÊ GANHA", title: "Um sorriso saudável que você vai ter orgulho de mostrar.", items: ["Tratamento personalizado ao seu caso", "Atendimento humanizado e sem pressa", "Tecnologia que acelera o resultado", "Preço transparente sem surpresa"] },
      { badge: "RESULTADO REAL", title: "Saúde bucal que você vai sentir, não só ver.", items: ["Diagnóstico preciso e honesto", "Procedimento seguro e eficaz", "Acompanhamento até o resultado final", "Conforto em cada consulta"] },
      { badge: "VOCÊ MERECE", title: "O sorriso certo, com o cuidado que você merece.", items: ["Profissional experiente e atualizado", "Ambiente limpo e bem estruturado", "Consulta sem enrolação", "Resultado que dura"] },
    ],
    differentiator: [
      { badge: "DIFERENCIAL",   title: "{B} explica antes de agir — você entende cada etapa do seu tratamento." },
      { badge: "POR QUE A {B}", title: "Atendimento humano, tecnologia real e compromisso com o resultado. Isso é a {B} em {C}." },
      { badge: "SÓ NA {B}",     title: "Dentista que você recomenda para quem você ama. É o padrão da {B} em {C}." },
    ],
    proof: [
      { badge: "NA PRÁTICA",    title: "Pacientes da {B} em {C} chegam com medo e saem com confiança no sorriso." },
      { badge: "RESULTADO REAL", title: "Quem escolheu a {B} percebeu que cuidar do sorriso pode ser simples e sem susto." },
      { badge: "CONFIAM NA GENTE", title: "Referência em cuidado bucal em {C} — comprovada por quem atendemos." },
    ],
  },
  "personal-trainer": {
    coverTitle: [
      "Resultado real no treino — com método, não sorte",
      "Treinando mais esperto, não mais duro",
      "Evolução de verdade começa com o método certo",
    ],
    pain: [
      { badge: "O PROBLEMA",  title: "Treinar sem método gera esforço, cansaço e pouca evolução — e isso frustra qualquer um." },
      { badge: "ATENÇÃO",     title: "Muita gente treina meses sem resultado porque falta planejamento, progressão e acompanhamento." },
      { badge: "REALIDADE",   title: "Sem um profissional que entende seu corpo e objetivo, você pode estar treinando errado sem saber." },
    ],
    solution: [
      { badge: "A SOLUÇÃO",   title: "Com {B}, você treina com propósito: cada sessão tem objetivo, progressão e resultado medido." },
      { badge: "COMO FUNCIONA", title: "{B} em {C} cria um plano baseado no seu corpo, objetivo e rotina real." },
      { badge: "O MÉTODO",    title: "Treino personalizado, acompanhamento próximo e evolução que você vai medir e sentir." },
    ],
    benefit: [
      { badge: "O QUE VOCÊ GANHA", title: "Mais resultado em menos tempo, com menos risco de lesão.", items: ["Treino que evolui com você", "Exercícios certos para o seu corpo", "Acompanhamento que te motiva", "Resultado que você vai medir"] },
      { badge: "VANTAGENS REAIS", title: "Não é só musculação — é uma mudança que você vai sentir no dia a dia.", items: ["Mais energia e disposição", "Corpo que você vai ter orgulho", "Progresso consistente", "Profissional que não te deixa parar"] },
      { badge: "VOCÊ MERECE", title: "Um treino feito para você, com quem entende de resultado.", items: ["Método testado e validado", "Foco no seu objetivo específico", "Sem improviso, só resultado", "Acompanhamento de quem se importa"] },
    ],
    differentiator: [
      { badge: "DIFERENCIAL",   title: "{B} não passa treino — cria um plano real para o seu corpo e objetivo em {C}." },
      { badge: "POR QUE A {B}", title: "Metodologia, atenção e progressão real. Não é mais do mesmo — é o que funciona para você." },
      { badge: "SÓ NA {B}",     title: "Em {C}, {B} é quem te acompanha do início ao resultado, sem enrolação." },
    ],
    proof: [
      { badge: "NA PRÁTICA",    title: "Alunos da {B} em {C} chegam sem resultado e saem com evolução real e motivação." },
      { badge: "RESULTADO REAL", title: "Não é sorte — é método. Quem treinou com {B} viu a diferença na prática." },
      { badge: "CONFIAM NA GENTE", title: "Quem começou com {B} não imagina mais treinar sem acompanhamento profissional." },
    ],
  },
  restaurante: {
    coverTitle: [
      "Sabor que você vai lembrar depois que sair",
      "Uma refeição que supera o que você espera",
      "Do ingrediente ao prato: qualidade em cada detalhe",
    ],
    pain: [
      { badge: "ATENÇÃO",     title: "Pagar caro por uma refeição sem sabor ou mal servida é decepcionante — e acontece demais." },
      { badge: "O PROBLEMA",  title: "Muito lugar tem boa aparência mas entrega ingrediente ruim, demora grande e experiência fraca." },
      { badge: "REALIDADE",   title: "Quando a comida decepciona, não tem segundo encontro — e todo o preço pago vira frustração." },
    ],
    solution: [
      { badge: "A SOLUÇÃO",   title: "Na {B}, cada prato é preparado com ingrediente de qualidade e atenção ao sabor real." },
      { badge: "COMO FAZEMOS", title: "{B} em {C} foi feita para quem valoriza a refeição — do ingrediente ao atendimento." },
      { badge: "NOSSA PROPOSTA", title: "Sabor, agilidade e custo justo. É o que você vai encontrar na {B} em {C}." },
    ],
    benefit: [
      { badge: "O QUE VOCÊ GANHA", title: "Uma refeição que vale cada centavo — e que você vai querer repetir.", items: ["Ingredientes frescos e selecionados", "Sabor que você vai lembrar", "Atendimento rápido e atencioso", "Ambiente que convida a ficar"] },
      { badge: "EXPERIÊNCIA REAL", title: "Mais do que comer — uma experiência que começa antes de você sentar.", items: ["Cardápio com opções para todos", "Ambiente agradável e bem cuidado", "Tempo certo, sem espera desnecessária", "Preço justo, qualidade garantida"] },
      { badge: "VOCÊ MERECE", title: "Uma boa refeição faz diferença no dia — e a {B} sabe disso.", items: ["Comida feita com cuidado real", "Porção generosa e bem montada", "Sabor consistente em toda visita", "Atendimento que te faz sentir bem-vindo"] },
    ],
    differentiator: [
      { badge: "DIFERENCIAL",   title: "{B} não serve só comida — entrega uma experiência que você vai querer repetir." },
      { badge: "POR QUE A {B}", title: "Ingrediente bom, preparo cuidadoso e atendimento real. Isso é o padrão da {B}." },
      { badge: "SÓ NA {B}",     title: "Em {C}, a {B} é conhecida por uma coisa: sabor que você sente na primeira garfada." },
    ],
    proof: [
      { badge: "NA PRÁTICA",    title: "Clientes da {B} em {C} voltam porque a comida é boa — e o atendimento faz diferença." },
      { badge: "RESULTADO REAL", title: "Não é marketing — é o que quem comeu na {B} fala quando volta para indicar." },
      { badge: "CONFIAM NA GENTE", title: "Uma vez que você prova, a {B} vira referência em {C} para suas próximas refeições." },
    ],
  },
  estetica: {
    coverTitle: [
      "Resultado que você vai ver e sentir — cuidado de verdade",
      "Autocuidado com quem realmente sabe o que está fazendo",
      "Beleza e bem-estar com resultado que você vai notar",
    ],
    pain: [
      { badge: "O PROBLEMA",  title: "Procedimento mal feito não só não funciona — pode piorar o que você queria resolver." },
      { badge: "ATENÇÃO",     title: "Muita gente investe em cuidado pessoal e não vê resultado por falta de técnica e produto certo." },
      { badge: "REALIDADE",   title: "Não é qualquer profissional que entrega o resultado que você imagina — e isso faz toda a diferença." },
    ],
    solution: [
      { badge: "A SOLUÇÃO",   title: "{B} usa técnica correta, produto adequado e atenção real para cada procedimento." },
      { badge: "COMO FAZEMOS", title: "Na {B} em {C}, cada atendimento é personalizado ao seu perfil e objetivo." },
      { badge: "NOSSO CUIDADO", title: "Aqui o resultado não é promessa — é o que você vai ver e sentir ao final de cada procedimento." },
    ],
    benefit: [
      { badge: "O QUE VOCÊ GANHA", title: "Resultado visível, duradouro e feito com segurança para você.", items: ["Procedimento adequado ao seu perfil", "Produto de qualidade comprovada", "Profissional atualizado e experiente", "Resultado que você vai mostrar"] },
      { badge: "EXPERIÊNCIA REAL", title: "Um atendimento que cuida de você de dentro para fora.", items: ["Ambiente confortável e bem preparado", "Atenção exclusiva no seu atendimento", "Orientação sobre cuidados em casa", "Satisfação que você vai sentir na hora"] },
      { badge: "VOCÊ MERECE", title: "Cuidar de você com quem realmente entende do que está fazendo.", items: ["Técnica que faz diferença no resultado", "Escuta real sobre o que você quer", "Protocolo personalizado para você", "Resultado duradouro, não temporário"] },
    ],
    differentiator: [
      { badge: "DIFERENCIAL",   title: "{B} vai além da aparência — cuida do resultado com técnica e atenção real." },
      { badge: "POR QUE A {B}", title: "Profissional experiente, produto certo e atenção total. É o que você encontra na {B} em {C}." },
      { badge: "SÓ NA {B}",     title: "Em {C}, a {B} é conhecida pelo resultado que você vê — e que faz você indicar para quem ama." },
    ],
    proof: [
      { badge: "NA PRÁTICA",    title: "Clientes da {B} em {C} saem satisfeitas — e voltam porque o resultado continua." },
      { badge: "RESULTADO REAL", title: "Quem passou pela {B} percebeu que resultado real vem de técnica, não de promessa." },
      { badge: "CONFIAM NA GENTE", title: "A {B} em {C} é a escolha de quem não abre mão de qualidade e cuidado real." },
    ],
  },
  "loja-roupa": {
    coverTitle: [
      "Moda que combina com quem você é de verdade",
      "Peças que fazem você se sentir bem ao primeiro uso",
      "Seu estilo — com curadoria que facilita tudo",
    ],
    pain: [
      { badge: "O PROBLEMA",  title: "Comprar roupa e receber algo completamente diferente do esperado é frustrante." },
      { badge: "ATENÇÃO",     title: "Muita gente tem closet cheio mas não sabe o que vestir porque as peças não combinam." },
      { badge: "REALIDADE",   title: "Qualidade ruim, tamanho errado e atendimento frio fazem da compra uma decepção." },
    ],
    solution: [
      { badge: "A SOLUÇÃO",   title: "{B} faz curadoria de peças que realmente combinam com seu estilo e corpo." },
      { badge: "COMO FUNCIONA", title: "Na {B} em {C}, você recebe ajuda para montar looks completos, não só peças soltas." },
      { badge: "NOSSO CUIDADO", title: "Peças selecionadas, qualidade verificada e atendimento que te faz sentir bem na compra." },
    ],
    benefit: [
      { badge: "O QUE VOCÊ GANHA", title: "Looks que combinam, qualidade que dura e compra sem arrependimento.", items: ["Curadoria feita para o seu estilo", "Peças que combinam entre si", "Atendimento que ajuda na escolha", "Qualidade que você vai perceber na primeira vez"] },
      { badge: "EXPERIÊNCIA REAL", title: "Uma compra que você vai fazer com prazer e usar com confiança.", items: ["Variedade com identidade clara", "Tamanhos disponíveis na hora", "Troca fácil se precisar", "Preço justo para a qualidade entregue"] },
      { badge: "VOCÊ MERECE", title: "Moda que faz você se sentir bem — não só parecer bem.", items: ["Peças pensadas para você", "Estilo que reflete quem você é", "Compra sem estresse ou dúvida", "Resultado que você vai querer repetir"] },
    ],
    differentiator: [
      { badge: "DIFERENCIAL",   title: "{B} não vende roupa — te ajuda a montar um guarda-roupa que funciona de verdade." },
      { badge: "POR QUE A {B}", title: "Curadoria real, qualidade verificada e atendimento que te faz sentir bem. É a {B} em {C}." },
      { badge: "SÓ NA {B}",     title: "Em {C}, a {B} é onde você vai para encontrar peças com curadoria e sair com estilo." },
    ],
    proof: [
      { badge: "NA PRÁTICA",    title: "Clientes da {B} em {C} voltam porque as peças duram, combinam e valem o preço." },
      { badge: "RESULTADO REAL", title: "Quem comprou na {B} percebeu que moda com curadoria faz toda a diferença." },
      { badge: "CONFIAM NA GENTE", title: "A {B} em {C} é a loja que os clientes indicam quando alguém pergunta 'onde você compra?'" },
    ],
  },
  mecanica: {
    coverTitle: [
      "Seu carro em boas mãos — diagnóstico real, orçamento justo",
      "Mecânica que fala a verdade e faz o que precisa",
      "Transparência, qualidade e prazo: o que você merece na oficina",
    ],
    pain: [
      { badge: "O PROBLEMA",  title: "Pagar por um serviço e o problema continuar — ou aparecer outro novo — não pode ser normal." },
      { badge: "ATENÇÃO",     title: "Orçamento que cresce sem explicação, prazo que estica e carro que volta com problema diferente." },
      { badge: "REALIDADE",   title: "Confiar em mecânico é difícil quando você não entende — e isso é explorado por quem não trabalha certo." },
    ],
    solution: [
      { badge: "A SOLUÇÃO",   title: "{B} mostra o diagnóstico, explica o que precisa ser feito e cumpre o orçamento combinado." },
      { badge: "COMO FUNCIONA", title: "Na {B} em {C}, você sabe exatamente o que será feito no seu carro antes de qualquer serviço." },
      { badge: "NOSSO CUIDADO", title: "Orçamento transparente, prazo cumprido e serviço garantido. É o padrão da {B}." },
    ],
    benefit: [
      { badge: "O QUE VOCÊ GANHA", title: "Carro em ordem, orçamento cumprido e tranquilidade para dirigir.", items: ["Diagnóstico correto e honesto", "Orçamento claro sem surpresas", "Prazo que você pode contar", "Serviço com garantia"] },
      { badge: "EXPERIÊNCIA REAL", title: "Uma oficina que trata você como cliente, não como oportunidade.", items: ["Peças originais ou de qualidade", "Profissional que explica o que está fazendo", "Cuidado com seu carro", "Retorno quando necessário"] },
      { badge: "VOCÊ MERECE", title: "Menos preocupação, mais confiança — no carro e em quem cuida dele.", items: ["Transparência em cada etapa", "Atendimento que você pode cobrar", "Serviço técnico de nível", "Resultado que você vai confiar"] },
    ],
    differentiator: [
      { badge: "DIFERENCIAL",   title: "{B} não faz serviço desnecessário — faz o certo, explica o porquê e cumpre o que combina." },
      { badge: "POR QUE A {B}", title: "Honestidade, técnica e transparência. Em {C}, a {B} é a oficina que você vai indicar." },
      { badge: "SÓ NA {B}",     title: "Em {C}, {B} é onde o orçamento não muda sem aviso e o prazo é para ser cumprido." },
    ],
    proof: [
      { badge: "NA PRÁTICA",    title: "Clientes da {B} em {C} voltam porque sabem que não vão ser surpreendidos." },
      { badge: "RESULTADO REAL", title: "Quem deixou o carro na {B} recebeu o serviço combinado, no prazo e no preço." },
      { badge: "CONFIAM NA GENTE", title: "A {B} em {C} tem clientes que indicam amigos porque confiam no trabalho de quem atende." },
    ],
  },
  imobiliaria: {
    coverTitle: [
      "O imóvel certo para você — com quem entende do mercado",
      "Comprar, vender ou alugar com segurança e transparência",
      "Seu próximo imóvel — com acompanhamento de quem se importa",
    ],
    pain: [
      { badge: "O PROBLEMA",  title: "Comprar imóvel sem o corretor certo pode virar um processo longo, caro e frustrante." },
      { badge: "ATENÇÃO",     title: "Burocracia, documentação incorreta e negociação mal feita custam tempo e dinheiro." },
      { badge: "REALIDADE",   title: "Muita gente fecha o imóvel errado porque não teve quem explicasse o processo com clareza." },
    ],
    solution: [
      { badge: "A SOLUÇÃO",   title: "{B} acompanha você em cada etapa — da busca à entrega das chaves." },
      { badge: "COMO FUNCIONA", title: "Com {B} em {C}, você entende o mercado, os riscos e as oportunidades antes de decidir." },
      { badge: "O CAMINHO",   title: "Segurança na negociação, documentação correta e transparência em cada passo." },
    ],
    benefit: [
      { badge: "O QUE VOCÊ GANHA", title: "Negócio seguro, processo claro e resultado que você vai valorizar.", items: ["Imóvel adequado ao seu perfil e budget", "Negociação que protege seus interesses", "Documentação verificada e correta", "Acompanhamento do início ao fim"] },
      { badge: "EXPERIÊNCIA REAL", title: "Realizar o sonho do imóvel com quem está do seu lado.", items: ["Acesso a imóveis alinhados ao que você quer", "Explicação clara de cada etapa", "Sem burocracia desnecessária", "Profissional de confiança no processo"] },
      { badge: "VOCÊ MERECE", title: "O imóvel certo, no preço justo, com toda segurança.", items: ["Transparência em cada negociação", "Rapidez sem descuido", "Orientação que protege você", "Parceiro em quem você pode confiar"] },
    ],
    differentiator: [
      { badge: "DIFERENCIAL",   title: "{B} não fecha negócio rápido — fecha o negócio certo para você em {C}." },
      { badge: "POR QUE A {B}", title: "Conhecimento de mercado, honestidade e acompanhamento real. É o padrão da {B} em {C}." },
      { badge: "SÓ NA {B}",     title: "Em {C}, a {B} é quem te acompanha além da assinatura — até você estar satisfeito." },
    ],
    proof: [
      { badge: "NA PRÁTICA",    title: "Clientes da {B} em {C} fecharam os imóveis certos — e voltaram para a próxima negociação." },
      { badge: "RESULTADO REAL", title: "Quem passou pela {B} teve processo claro, negociação justa e resultado sem arrependimento." },
      { badge: "CONFIAM NA GENTE", title: "A {B} em {C} é indicada por clientes que realizaram o sonho com segurança e clareza." },
    ],
  },
  "clinica-medica": {
    coverTitle: [
      "Saúde que você vai sentir — atendimento que faz diferença",
      "Cuidar da saúde com quem realmente te escuta",
      "Diagnóstico preciso, tratamento humanizado e resultado real",
    ],
    pain: [
      { badge: "O PROBLEMA",  title: "Espera longa, consulta rápida e saída sem entender o diagnóstico — não é o que você merece." },
      { badge: "ATENÇÃO",     title: "Muita gente adia cuidar da saúde por experiências ruins com atendimento frio e processo demorado." },
      { badge: "REALIDADE",   title: "Consulta que não escuta o paciente não é consulta — é processamento. Você merece mais que isso." },
    ],
    solution: [
      { badge: "A SOLUÇÃO",   title: "{B} oferece atendimento que te escuta, diagnóstico real e orientação que faz sentido." },
      { badge: "COMO FUNCIONA", title: "Na {B} em {C}, a consulta começa com tempo real dedicado a entender o que você está sentindo." },
      { badge: "NOSSO CUIDADO", title: "Humanização, precisão e agilidade. Saúde do jeito que deveria ser em {C}." },
    ],
    benefit: [
      { badge: "O QUE VOCÊ GANHA", title: "Saúde tratada com atenção real — e resultado que você vai perceber.", items: ["Consulta sem pressa, com escuta real", "Diagnóstico preciso e explicado", "Tratamento adequado ao seu caso", "Acompanhamento que faz diferença"] },
      { badge: "EXPERIÊNCIA REAL", title: "Um atendimento que respeita seu tempo e leva sua saúde a sério.", items: ["Ambiente acolhedor e bem preparado", "Médico que explica com clareza", "Tecnologia que ajuda no diagnóstico", "Sem burocracia desnecessária"] },
      { badge: "VOCÊ MERECE", title: "Saúde tratada por quem se importa — não só por quem atende.", items: ["Atendimento humanizado de verdade", "Resultado claro e honesto", "Continuidade no acompanhamento", "Confiança em quem cuida de você"] },
    ],
    differentiator: [
      { badge: "DIFERENCIAL",   title: "{B} não trata sintoma — trata a pessoa. Isso faz toda a diferença no resultado." },
      { badge: "POR QUE A {B}", title: "Humanização, precisão e comprometimento. Em {C}, a {B} é saúde do jeito que deveria ser." },
      { badge: "SÓ NA {B}",     title: "Em {C}, {B} é a clínica que os pacientes indicam quando querem atendimento de verdade." },
    ],
    proof: [
      { badge: "NA PRÁTICA",    title: "Pacientes da {B} em {C} voltam porque se sentiram ouvidos — e os resultados apareceram." },
      { badge: "RESULTADO REAL", title: "Quem foi atendido na {B} percebeu a diferença entre consulta e cuidado de verdade." },
      { badge: "CONFIAM NA GENTE", title: "A {B} em {C} é a referência de saúde de famílias que não abrem mão de qualidade." },
    ],
  },
  outro: {
    coverTitle: [
      "O serviço que você precisa — com quem realmente entrega",
      "Qualidade real, atendimento de respeito e resultado garantido",
      "Resultado real começa com quem leva seu pedido a sério",
    ],
    pain: [
      { badge: "O PROBLEMA",  title: "Contratar um serviço e não ter clareza sobre o que vai receber é uma experiência frustrante." },
      { badge: "ATENÇÃO",     title: "Falta de atenção, prazo não cumprido e resultado abaixo do esperado prejudicam qualquer projeto." },
      { badge: "REALIDADE",   title: "Sem comprometimento real, qualquer serviço vira decepção — e isso tem solução." },
    ],
    solution: [
      { badge: "A SOLUÇÃO",   title: "{B} entrega o que combina, no prazo acordado, com qualidade que você vai reconhecer." },
      { badge: "COMO FAZEMOS", title: "Na {B} em {C}, cada pedido é tratado com atenção, processo claro e comprometimento real." },
      { badge: "NOSSO CUIDADO", title: "Transparência, qualidade e entrega: o padrão que você vai encontrar em cada atendimento da {B}." },
    ],
    benefit: [
      { badge: "O QUE VOCÊ GANHA", title: "Resultado que você pediu, no prazo que combinou, sem surpresa no processo.", items: ["Processo claro desde o início", "Comunicação transparente", "Qualidade que você vai notar", "Prazo que você pode cobrar"] },
      { badge: "EXPERIÊNCIA REAL", title: "Um serviço tratado com profissionalismo do começo ao fim.", items: ["Atendimento que te faz sentir ouvido", "Execução cuidadosa em cada etapa", "Entrega dentro do esperado", "Suporte após a conclusão"] },
      { badge: "VOCÊ MERECE", title: "Serviço feito com dedicação real — e resultado que mostra isso.", items: ["Comprometimento com o seu projeto", "Qualidade acima da média", "Satisfação garantida na entrega", "Parceiro que você vai recomendar"] },
    ],
    differentiator: [
      { badge: "DIFERENCIAL",   title: "{B} não entrega qualquer resultado — entrega o resultado que você pediu." },
      { badge: "POR QUE A {B}", title: "Dedicação, qualidade e comprometimento real. Em {C}, a {B} é o parceiro que você merecia." },
      { badge: "SÓ NA {B}",     title: "Em {C}, a {B} é conhecida por entregar o que combina — sem desculpa e sem enrolação." },
    ],
    proof: [
      { badge: "NA PRÁTICA",    title: "Clientes da {B} em {C} voltam porque confiam no resultado e no processo." },
      { badge: "RESULTADO REAL", title: "Quem trabalhou com a {B} percebeu a diferença que comprometimento real faz no resultado." },
      { badge: "CONFIAM NA GENTE", title: "A {B} em {C} é a escolha de quem não abre mão de qualidade e atendimento de verdade." },
    ],
  },
};

function fillSales(text: string, B: string, C: string): string {
  return text.replace(/\{B\}/g, B).replace(/\{C\}/g, C);
}

// ─── Topic intent ─────────────────────────────────────────────

type TopicIntent =
  | "sobre_negocio"  // "quem somos", "conheça", "meu negócio"
  | "sobre_servico"  // specific service / topic
  | "promocao"       // promo, desconto, oferta
  | "novidade"       // launch, new, estreia
  | "educativo"      // dica, tutorial, como fazer
  | "depoimento"     // resultado, feedback, antes/depois
  | "bastidores"     // process, rotina, por trás
  | "faq"            // dúvida, pergunta, como funciona
  | "geral";

function detectTopicIntent(topic: string): TopicIntent {
  const t = topic.toLowerCase();
  if (/\b(meu neg[oó]cio|nossa empresa|quem somos|conhe[çc]a|apresenta[çc][aã]o|sobre (a|o|n[oó]s)|somos|nossa hist[oó]ria)\b/.test(t)) return "sobre_negocio";
  if (/\b(promo[çc][aã]o|promo|desconto|oferta|black|especial|cupom|preci[çc]o especial)\b/.test(t)) return "promocao";
  if (/\b(novidade|lan[çc]amento|novo|nova|acabou de chegar|estreia|anunci)\b/.test(t)) return "novidade";
  if (/\b(dica|tutorial|como fazer|como funciona|aprend|ensina|passo a passo|guia|entenda)\b/.test(t)) return "educativo";
  if (/\b(depoimento|feedback|avalia[çc][aã]o|resultado|antes e depois|transforma[çc][aã]o)\b/.test(t)) return "depoimento";
  if (/\b(bastidor|por tr[aá]s|processo|rotina|dia a dia|nos bastidores)\b/.test(t)) return "bastidores";
  if (/\b(d[uú]vida|pergunta|faq|resposta|como funciona|tire suas d[uú]vidas)\b/.test(t)) return "faq";
  return "geral";
}

// ─── Angle system ─────────────────────────────────────────────

type AngleId = "confianca" | "educativo" | "urgencia" | "diferenciais" | "resultado" | "inspiracao";

const ANGLES_BY_OBJECTIVE: Record<CarouselObjective, AngleId[]> = {
  vender:    ["confianca",    "resultado",   "diferenciais"],
  educar:    ["educativo",    "resultado",   "inspiracao"],
  promocao:  ["urgencia",     "diferenciais","resultado"],
  servico:   ["diferenciais", "resultado",   "confianca"],
  autoridade:["diferenciais", "confianca",   "educativo"],
  whatsapp:  ["urgencia",     "confianca",   "diferenciais"],
  recuperar: ["inspiracao",   "resultado",   "confianca"],
  novidade:  ["resultado",    "diferenciais","inspiracao"],
  duvidas:   ["educativo",    "confianca",   "resultado"],
};

// Cover titles — intent-specific (higher priority than angle-based)
const COVER_TITLES_BY_INTENT: Partial<Record<TopicIntent, string[]>> = {
  sobre_negocio: [
    "Conheça a {B}",
    "{B}: atendendo em {C}",
    "Bem-vindo à {B}",
    "{B} — {svc} com propósito",
  ],
  promocao: [
    "Condição especial em {svc} — aproveite agora",
    "{svc} com desconto exclusivo por tempo limitado",
    "A oferta de {sub} que você estava esperando",
    "{svc}: promoção real com horário disponível",
    "Oferta especial para {sub} — só enquanto durar",
  ],
  novidade: [
    "{sub} chegou",
    "Novidade na {B}: {sub}",
    "Acabou de chegar: {sub}",
    "Lançamento: {sub} em {C}",
  ],
  bastidores: [
    "Por trás de cada {svc}",
    "Como a {B} trabalha por você",
    "O processo que você não vê — mas sente",
    "Bastidores da {B} em {C}",
  ],
  faq: [
    "Dúvidas sobre {sub}? Respondemos tudo",
    "Tudo que você queria saber sobre {sub}",
    "{sub}: perguntas e respostas diretas",
    "As dúvidas mais comuns sobre {svc} respondidas",
  ],
  depoimento: [
    "Resultados reais na {B}",
    "O que nossos clientes dizem",
    "Histórias de quem escolheu a {B}",
    "Resultado que fala por si — {B} em {C}",
  ],
};

// Fallback angle-based cover titles
const COVER_TITLES_BY_ANGLE: Record<AngleId, string[]> = {
  confianca: [
    "Segurança em {sub} que você vai sentir na prática",
    "Profissionalismo em {sub}: veja como funciona de verdade",
    "Confiança e qualidade em {sub}: o que faz a diferença",
    "Quando {sub} é feito com cuidado, o resultado aparece",
  ],
  educativo: [
    "O que você precisa entender sobre {sub}",
    "{sub}: um guia direto e sem enrolação",
    "Informação que faz diferença em {sub}",
    "O essencial sobre {sub} em poucos passos claros",
  ],
  urgencia: [
    "Condições especiais em {sub} — aproveite antes que acabe",
    "Agora é o momento certo para {sub}",
    "{sub}: oportunidade real por tempo limitado",
    "Essa janela em {sub} fecha em breve — confira",
  ],
  diferenciais: [
    "O que separa a {B} de qualquer outro em {sub}",
    "{sub} do jeito que deveria ser feito",
    "O diferencial real em {sub}: o que muda tudo",
    "Por que a escolha certa em {sub} começa aqui",
  ],
  resultado: [
    "O resultado de {sub} feito com dedicação",
    "{sub}: a transformação que você vai perceber",
    "Resultado real quando {sub} é bem conduzido",
    "{sub} com resultado que você pode medir e sentir",
  ],
  inspiracao: [
    "{sub} pode mudar sua trajetória",
    "O próximo passo em {sub} começa aqui",
    "Uma boa decisão em {sub} muda muita coisa",
    "{sub}: quando você escolhe certo, tudo muda",
  ],
};

const COVER_SUBTITLES: Record<AngleId, string[]> = {
  confianca:    ["Qualidade que você vai ver e sentir.", "Transparência em cada etapa do processo."],
  educativo:    ["Conteúdo direto, sem enrolação.", "Informação que vale a pena guardar."],
  urgencia:     ["Aproveite enquanto está disponível.", "Oportunidade real, por tempo limitado."],
  diferenciais: ["Veja o que nos torna diferentes.", "Qualidade que se comprova na prática."],
  resultado:    ["Resultado real, não só promessa.", "Antes e depois que você vai perceber."],
  inspiracao:   ["Uma decisão que faz diferença.", "Comece hoje, veja o impacto amanhã."],
};

// Objective-based cover title fallbacks (used when intent doesn't produce a pool)
const COVER_TITLES_OBJECTIVE_PROMO: string[] = [
  "Uma oferta especial para {sub}",
  "Para {sub}: condição exclusiva em {svc}",
  "Essa promoção foi pensada para {sub}",
  "{svc} com desconto — por tempo limitado",
  "Aproveite agora: condição especial em {svc}",
  "A oferta certa para {sub} chegou",
];

const COVER_TITLES_OBJECTIVE_DUVIDAS: string[] = [
  "Dúvidas sobre {sub}? A gente responde",
  "Tudo que você queria saber sobre {sub}",
  "{sub}: perguntas e respostas diretas",
  "As dúvidas mais comuns sobre {svc} — respondidas",
  "Entenda {sub} de uma vez por todas",
];

const COVER_TITLES_OBJECTIVE_EDUCAR: string[] = [
  "O que você precisa saber sobre {sub}",
  "{sub}: um guia prático e sem enrolação",
  "Aprenda sobre {sub} em poucos passos",
  "Dicas reais sobre {sub} que fazem diferença",
  "Tudo sobre {sub}: do básico ao que importa",
];

// ─── Visual palette system ─────────────────────────────────────

interface SlidePalette {
  primary: string;
  dark: string;
  accent: string;
}

const PALETTE_POOLS: Record<CarouselVisualStyle, SlidePalette[]> = {
  moderno: [
    { primary: "#1e3a5f", dark: "#0d1b2a", accent: "#2563eb" },
    { primary: "#7c3aed", dark: "#1a0536", accent: "#a855f7" },
    { primary: "#065f46", dark: "#022c22", accent: "#059669" },
    { primary: "#991b1b", dark: "#450a0a", accent: "#dc2626" },
    { primary: "#1e40af", dark: "#0f2460", accent: "#3b82f6" },
    { primary: "#6d28d9", dark: "#2e1065", accent: "#8b5cf6" },
  ],
  premium: [
    { primary: "#1c1c1e", dark: "#0a0a0a", accent: "#c9a84c" },
    { primary: "#0f172a", dark: "#020617", accent: "#c8a96e" },
    { primary: "#1a1a2e", dark: "#0d0d18", accent: "#a89060" },
    { primary: "#0f0e0e", dark: "#070707", accent: "#d4a853" },
    { primary: "#12131a", dark: "#060609", accent: "#b8860b" },
    { primary: "#1c1917", dark: "#0c0a09", accent: "#c4956a" },
  ],
  clean: [
    { primary: "#2563eb", dark: "#1e3a8a", accent: "#60a5fa" },
    { primary: "#059669", dark: "#064e3b", accent: "#34d399" },
    { primary: "#dc2626", dark: "#7f1d1d", accent: "#f87171" },
    { primary: "#7c3aed", dark: "#3b0764", accent: "#a78bfa" },
    { primary: "#d97706", dark: "#78350f", accent: "#fbbf24" },
    { primary: "#0891b2", dark: "#083344", accent: "#22d3ee" },
  ],
  chamativo: [
    { primary: "#e11d48", dark: "#881337", accent: "#ff4d6d" },
    { primary: "#7c3aed", dark: "#2e1065", accent: "#c084fc" },
    { primary: "#d97706", dark: "#78350f", accent: "#fbbf24" },
    { primary: "#0891b2", dark: "#083344", accent: "#22d3ee" },
    { primary: "#be123c", dark: "#4c0519", accent: "#fb7185" },
    { primary: "#15803d", dark: "#14532d", accent: "#4ade80" },
  ],
  elegante: [
    { primary: "#1c2b39", dark: "#0a1520", accent: "#c9a84c" },
    { primary: "#1a1a1a", dark: "#0a0a0a", accent: "#c8a97e" },
    { primary: "#1e3a5f", dark: "#0c1f35", accent: "#c9a84c" },
    { primary: "#2d2d2d", dark: "#1a1a1a", accent: "#e8d5b7" },
    { primary: "#1a0a0a", dark: "#0d0505", accent: "#c4956a" },
    { primary: "#292524", dark: "#1c1917", accent: "#a8956a" },
  ],
  minimalista: [
    { primary: "#111111", dark: "#000000", accent: "#555555" },
    { primary: "#1a1a2e", dark: "#0d0d18", accent: "#4a4a6a" },
    { primary: "#0f172a", dark: "#020617", accent: "#475569" },
    { primary: "#1c1917", dark: "#0c0a09", accent: "#78716c" },
    { primary: "#111827", dark: "#030712", accent: "#4b5563" },
    { primary: "#18181b", dark: "#09090b", accent: "#52525b" },
  ],
};

// Which palette indices fit each niche best
const NICHE_PALETTE_AFFINITY: Record<NicheKey, number[]> = {
  barbearia:          [0, 1, 3],
  odontologia:        [0, 4, 2],
  "personal-trainer": [0, 3, 1],
  restaurante:        [3, 1, 4],
  estetica:           [1, 2, 4],
  "loja-roupa":       [1, 4, 3],
  mecanica:           [0, 3, 5],
  imobiliaria:        [0, 4, 2],
  "clinica-medica":   [2, 0, 4],
  consultoria:        [0, 4, 5],
  outro:              [0, 1, 2],
};

// Objectives shift palette selection
const OBJECTIVE_PALETTE_BIAS: Partial<Record<CarouselObjective, number>> = {
  vender:    0,
  promocao:  3,
  autoridade:1,
  recuperar: 3,
  novidade:  4,
};

function generateVisualPalette(
  style: CarouselVisualStyle,
  niche: NicheKey,
  objective: CarouselObjective,
  primaryColor: string | undefined,
  seed: string
): SlidePalette {
  // If a specific primaryColor was passed and it's not the default violet, build around it
  if (primaryColor && primaryColor !== "#7c3aed" && primaryColor !== "#7C3AED") {
    const darker = primaryColor; // use as-is for accent; dark is always near-black
    return { primary: primaryColor, dark: "#111827", accent: darker };
  }
  const pool = PALETTE_POOLS[style];
  const affinity = NICHE_PALETTE_AFFINITY[niche];
  const bias = OBJECTIVE_PALETTE_BIAS[objective];
  const candidates = bias !== undefined
    ? [affinity[0], bias, affinity[1]]
    : affinity;
  const idx = candidates[variationIndex(seed + "pal", candidates.length)];
  return pool[idx % pool.length];
}

// ─── Narrative structures ─────────────────────────────────────

type SlideRole =
  | "problema" | "solucao" | "beneficio" | "prova"
  | "curiosidade" | "explicacao" | "vantagem" | "autoridade_slide"
  | "lista" | "diferencial" | "prova_social"
  | "erro" | "causa" | "resultado_slide"
  | "identidade" | "oferta"
  | "apresentacao" | "servicos_lista" | "bastidor" | "pergunta" | "objecao" | "novidade_slide"
  // ── Niche-specific visual roles (paired with new layouts)
  | "antes_depois"    // → before_after layout
  | "numero_destaque" // → stats_card layout
  | "passo_a_passo";  // → steps_process layout

type StructureId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";

const STRUCTURES: Record<StructureId, SlideRole[]> = {
  A: ["problema",     "solucao",       "beneficio",      "prova"],            // Dor / Solução / Benefício
  B: ["curiosidade",  "explicacao",    "vantagem",       "autoridade_slide"], // Curiosidade / Educativo
  C: ["lista",        "beneficio",     "diferencial",    "prova_social"],     // Lista / Showcase
  D: ["erro",         "causa",         "solucao",        "resultado_slide"],  // Erro → Resultado
  E: ["identidade",   "diferencial",   "prova_social",   "beneficio"],        // Autoridade / Marca
  F: ["apresentacao", "servicos_lista","diferencial",    "prova_social"],     // Institucional (sobre negócio)
  G: ["identidade",   "bastidor",      "explicacao",     "resultado_slide"],  // Bastidores
  H: ["pergunta",     "explicacao",    "prova",          "identidade"],       // FAQ / Engajamento
  I: ["novidade_slide","lista",        "beneficio",      "oferta"],           // Lançamento / Novidade
  J: ["objecao",      "solucao",       "prova_social",   "identidade"],       // Objeções
};

// Structure priority per intent (overrides objective-based selection)
const STRUCTURES_BY_INTENT: Record<TopicIntent, StructureId[]> = {
  sobre_negocio: ["F", "E", "C"],
  sobre_servico: ["A", "C", "E"],
  promocao:      ["A", "I", "C"],
  novidade:      ["I", "B", "C"],
  educativo:     ["B", "H", "D"],
  depoimento:    ["E", "C", "G"],
  bastidores:    ["G", "B", "E"],
  faq:           ["H", "B", "D"],
  geral:         ["A", "C", "E"],
};

const STRUCTURES_BY_OBJECTIVE: Record<CarouselObjective, StructureId[]> = {
  vender:    ["A", "A", "D"],
  educar:    ["B", "C", "D"],
  promocao:  ["A", "C", "I"],
  servico:   ["E", "A", "B"],
  autoridade:["E", "B", "C"],
  whatsapp:  ["C", "A", "E"],
  recuperar: ["A", "E", "J"],
  novidade:  ["I", "C", "A"],
  duvidas:   ["H", "D", "C"],
};

// ─── Slide context object ─────────────────────────────────────

interface SlideTemplate {
  badge?: string;
  title: string;
  subtitle?: string;
  body?: string;
  cta?: string;
  listItems?: string[];
}

interface SlideCtx {
  sub: string;
  B: string;
  C: string;
  svc: string;
  kw: NicheKwTuple;
  v: number;
  services: string[];
  benefits: string[];
  desc: string;
  testimonials: { text: string; author: string }[];
  intent: TopicIntent;
  niche: NicheKey;
  objective: CarouselObjective;
}

type RoleFn = (ctx: SlideCtx) => SlideTemplate;

// ─── Role content generators ──────────────────────────────────

const ROLE_FNS: Record<SlideRole, RoleFn> = {

  // ── Institutional / Presentation ─────────────────────────────

  apresentacao: ({ B, C, svc, kw, v, desc, services }) => {
    const serviceSnippet = joinServices(services, svc);
    const firstSentence = desc ? desc.split(/[.!?]/)[0].trim() : "";
    const variants: SlideTemplate[] = [
      {
        badge: "CONHEÇA A GENTE",
        title: `${B}: atendendo em ${C}`,
        body: firstSentence
          ? firstSentence + "."
          : `Um espaço dedicado a ${serviceSnippet} com atendimento direto e qualidade real.`,
      },
      {
        badge: "QUEM SOMOS",
        title: `${B} — ${svc} em ${C}`,
        body: desc
          ? desc.slice(0, 140)
          : `Especialistas em ${serviceSnippet}, atendemos clientes que valorizam ${kw[2]} e ${kw[3]} sem complicação.`,
      },
      {
        badge: "NOSSA HISTÓRIA",
        title: `Por que a ${B} existe`,
        body: `Nascemos com um propósito: oferecer ${svc} com ${kw[6]} e resultado real em ${C}. Cada atendimento reforça isso.`,
      },
    ];
    return variants[v % variants.length];
  },

  servicos_lista: ({ B, C, svc, kw, v, services }) => {
    const list = services.length > 0
      ? services.slice(0, 4)
      : [`${svc}`, `${kw[0]} especializado`, `Atendimento em ${C}`, `${kw[6]}`];
    const variants: SlideTemplate[] = [
      { badge: "NOSSOS SERVIÇOS",     title: `O que a ${B} oferece`,             listItems: list },
      { badge: "O QUE FAZEMOS",       title: `Serviços disponíveis em ${C}`,     listItems: list },
      { badge: "CONHEÇA OS SERVIÇOS", title: `Tudo que você encontra na ${B}`,   listItems: list },
    ];
    return variants[v % variants.length];
  },

  bastidor: ({ B, C, svc, kw, v }) => {
    const variants: SlideTemplate[] = [
      {
        badge: "POR TRÁS",
        title: `Como a ${B} prepara cada atendimento`,
        body: `Antes de cada ${svc}, há planejamento, ${kw[0]} e atenção a detalhes que o cliente não vê — mas sente no resultado.`,
      },
      {
        badge: "BASTIDORES",
        title: `A rotina por trás do resultado`,
        body: `${kw[6]} não acontece por acaso. Na ${B}, cada ${svc} começa muito antes do cliente chegar — é método e cuidado.`,
      },
      {
        badge: "NOSSO PROCESSO",
        title: `Do detalhe ao resultado final`,
        body: `Em ${C}, a ${B} investe em ${kw[0]} e preparação contínua. O resultado que você vê é fruto de um processo real.`,
      },
    ];
    return variants[v % variants.length];
  },

  pergunta: ({ B, C, svc, kw, v, niche }) => {
    const audience = NICHE_AUDIENCE[niche];
    const variants: SlideTemplate[] = [
      {
        badge: "PENSE NISSO",
        title: audience.engageQ,
        body: `A maioria das pessoas subestima o impacto de um ${svc} bem feito. Quando é certo, a diferença é imediata.`,
      },
      {
        badge: "UMA PERGUNTA",
        title: `O que você realmente quer em ${svc}?`,
        body: `${cap(audience.wants[0])}, ${audience.wants[1]} ou ${audience.wants[2]}? A ${B} trabalha para entregar os três.`,
      },
      {
        badge: "REFLITA",
        title: `Quando foi a última vez que ${svc} superou sua expectativa?`,
        body: `Se a resposta demora, talvez seja hora de conhecer o que a ${B} faz diferente em ${C}.`,
      },
    ];
    return variants[v % variants.length];
  },

  objecao: ({ B, C, svc, kw, v, niche }) => {
    const audience = NICHE_AUDIENCE[niche];
    const variants: SlideTemplate[] = [
      {
        badge: "ENTENDEMOS",
        title: `"${cap(audience.objection)}"`,
        body: `Ouvimos isso. Por isso, a ${B} estruturou ${kw[6]} e agendamento fácil em ${C}. Você chega, é atendido, sai satisfeito.`,
      },
      {
        badge: "SEM DESCULPA",
        title: `${cap(svc)} sem complicação`,
        body: `Agendamento pelo WhatsApp, horários flexíveis e atendimento direto. A ${B} foi pensada para facilitar sua vida.`,
      },
      {
        badge: "PERSPECTIVA",
        title: `A objeção que quase te faz perder`,
        body: `"${cap(audience.objection)}" — é o que muitos pensavam antes de conhecer a ${B} em ${C}. Depois, a história muda.`,
      },
    ];
    return variants[v % variants.length];
  },

  novidade_slide: ({ B, C, svc, sub, kw, v, services }) => {
    const novelty = sub !== svc && sub.length > 3 ? sub : (services[0] ?? svc);
    const variants: SlideTemplate[] = [
      {
        badge: "NOVIDADE",
        title: `${cap(novelty)} chegou na ${B}`,
        body: `A partir de agora, você encontra ${novelty} em ${C}. Agende pelo WhatsApp e seja um dos primeiros.`,
      },
      {
        badge: "LANÇAMENTO",
        title: `Novo: ${cap(novelty)}`,
        body: `A ${B} lança ${novelty}. ${cap(kw[2])} e ${kw[3]} do jeito que você merece, agora disponível em ${C}.`,
      },
      {
        badge: "CHEGOU",
        title: `Acabou de chegar: ${cap(novelty)}`,
        body: `A espera acabou. ${cap(novelty)} está disponível na ${B} — chame no WhatsApp e garanta seu horário.`,
      },
    ];
    return variants[v % variants.length];
  },

  // ── Pain / Gain ────────────────────────────────────────────

  problema: ({ sub, B, C, svc, kw, v, niche, objective }) => {
    if (objective === "vender") {
      const s = NICHE_SALES_STORIES[niche].pain[v % 3];
      return { badge: s.badge, title: fillSales(s.title, B, C) };
    }
    if (objective === "promocao") {
      const audience = NICHE_AUDIENCE[niche];
      const variants: SlideTemplate[] = [
        {
          badge: "VOCÊ MERECE",
          title: `${audience.wants[0]} com um toque especial`,
          body: `${sub ? `Para ${sub}: ` : ""}uma experiência acima do que você já teve. Aproveitando a condição exclusiva que a ${B} preparou.`,
        },
        {
          badge: "PARA VOCÊ",
          title: `O que ${sub || "você"} está esperando em ${svc}`,
          body: `${cap(kw[2])} real, ${kw[3]} de verdade — e agora com uma condição que vale muito a pena aproveitar.`,
        },
        {
          badge: "MOMENTO CERTO",
          title: `A ocasião perfeita para ${svc}`,
          body: `${sub ? `${cap(sub)} merece o melhor` : "Você merece o melhor"} — e a ${B} em ${C} preparou uma oportunidade real para isso.`,
        },
      ];
      return variants[v % variants.length];
    }
    const variants: SlideTemplate[] = [
      {
        badge: "O PROBLEMA",
        title: `Por que ${sub} muitas vezes não entrega resultado`,
        body: `Sem o processo certo, até quem investe em ${sub} sai frustrado. A ${B} em ${C} foi feita pra mudar isso.`,
      },
      {
        badge: "REALIDADE",
        title: `Esse erro em ${svc} é mais comum do que parece`,
        body: `A maioria busca ${sub} sem saber o que faz a diferença no resultado. A ${B} mostra o caminho certo.`,
      },
      {
        badge: "ATENÇÃO",
        title: `O que trava o resultado em ${sub}`,
        body: `Falta de ${kw[6]} e processo definido. É o que faz ${sub} não funcionar como deveria — e que a ${B} em ${C} resolve.`,
      },
    ];
    return variants[v % variants.length];
  },

  solucao: ({ sub, B, C, svc, kw, v, niche, objective }) => {
    if (objective === "vender") {
      const s = NICHE_SALES_STORIES[niche].solution[v % 3];
      return { badge: s.badge, title: fillSales(s.title, B, C) };
    }
    if (objective === "promocao") {
      const variants: SlideTemplate[] = [
        {
          badge: "A OFERTA",
          title: `${cap(svc)} com condição exclusiva — só na ${B}`,
          body: `${sub ? `Para ${sub}: ` : ""}preço especial, atendimento dedicado e o resultado que você merece. Aproveite enquanto tem.`,
        },
        {
          badge: "CONDIÇÃO ESPECIAL",
          title: `O que a ${B} preparou para você`,
          body: `${cap(kw[2])} de sempre, agora com um investimento que cabe no bolso. Uma oportunidade real em ${C}.`,
        },
        {
          badge: "APROVEITE AGORA",
          title: `${cap(svc)} por um valor que vale a pena`,
          body: `A ${B} está com condições especiais por tempo limitado. ${sub ? `Feito para ${sub}.` : "Não deixe passar."} Chame pelo WhatsApp.`,
        },
      ];
      return variants[v % variants.length];
    }
    const variants: SlideTemplate[] = [
      {
        badge: "A SOLUÇÃO",
        title: `${B}: a abordagem que entrega resultado`,
        body: `Cada atendimento começa com clareza sobre o que você precisa. É assim que a ${B} garante ${kw[2]} real — sem improviso.`,
      },
      {
        badge: "COMO FAZEMOS",
        title: `Resultado em ${sub} vem do processo certo`,
        body: `Na ${B}, ${sub} é feito com foco em ${kw[2]} e no que você quer alcançar. Método que funciona, comprovado em ${C}.`,
      },
      {
        badge: "NOSSA RESPOSTA",
        title: `O que muda quando ${sub} é feito com cuidado`,
        body: `${cap(kw[2])} e ${kw[3]} no nível que você merece. A ${B} faz ${sub} do jeito que vale a pena — e que você vai repetir.`,
      },
    ];
    return variants[v % variants.length];
  },

  beneficio: ({ sub, B, C, svc, kw, v, benefits, niche, objective }) => {
    if (objective === "vender") {
      const s = NICHE_SALES_STORIES[niche].benefit[v % 3];
      return { badge: s.badge, title: fillSales(s.title, B, C), listItems: s.items };
    }
    if (objective === "promocao") {
      const audience = NICHE_AUDIENCE[niche];
      const promoItems = [
        `${cap(kw[2])} garantida`,
        "Condição especial por tempo limitado",
        `Atendimento em ${C}`,
        "Agende pelo WhatsApp",
      ];
      const variants: SlideTemplate[] = [
        {
          badge: "INCLUSO NA OFERTA",
          title: `Tudo que está incluído nessa oportunidade`,
          listItems: promoItems,
        },
        {
          badge: "POR QUE APROVEITAR",
          title: `${sub ? `Para ${sub}: ` : ""}o melhor de ${svc} com condição especial`,
          body: `${cap(kw[2])} que você conhece, preço que você vai gostar, e ${kw[3]} que a ${B} sempre entregou. Só até durar.`,
        },
        {
          badge: "A OPORTUNIDADE",
          title: `O que você ganha com essa condição`,
          listItems: [
            `${cap(svc)} com ${kw[2]}`,
            audience.wants[0],
            "Preço especial garantido",
            `Agendamento direto em ${C}`,
          ],
        },
      ];
      return variants[v % variants.length];
    }
    const benefitList = benefits.length >= 3
      ? benefits.slice(0, 4)
      : [
          `${cap(kw[2])} que você vai notar na prática`,
          `${cap(kw[3])} de verdade, não de fachada`,
          `Atendimento focado no seu objetivo`,
          `Profissional comprometido com o resultado`,
        ];
    const variants: SlideTemplate[] = [
      {
        badge: "BENEFÍCIOS",
        title: `O que você ganha com ${sub} feito certo`,
        listItems: benefitList,
      },
      {
        badge: "VANTAGENS",
        title: `Por que vale cada investimento em ${sub}`,
        body: `Além do resultado imediato, ${sub} traz ${kw[2]} que você vai notar no dia a dia. A ${B} em ${C} garante isso.`,
      },
      {
        badge: "O QUE VOCÊ GANHA",
        title: `${cap(sub)}: muito além do resultado imediato`,
        listItems: benefitList,
      },
    ];
    return variants[v % variants.length];
  },

  prova: ({ sub, B, C, svc, kw, v, testimonials, niche, objective }) => {
    if (testimonials.length > 0) {
      const t = testimonials[v % testimonials.length];
      return {
        badge: "RESULTADO REAL",
        title: `"${t.text.length > 70 ? t.text.slice(0, 68) + "…" : t.text}"`,
        body: `— ${t.author}`,
      };
    }
    if (objective === "vender") {
      const s = NICHE_SALES_STORIES[niche].proof[v % 3];
      return { badge: s.badge, title: fillSales(s.title, B, C) };
    }
    const variants: SlideTemplate[] = [
      {
        badge: "NA PRÁTICA",
        title: `Resultado real, não promessa`,
        body: `Os clientes da ${B} em ${C} chegam com dúvida e saem com ${kw[2]}. É isso que faz a diferença.`,
      },
      {
        badge: "RESULTADO",
        title: `${B} — comprometida com ${sub}`,
        body: `Cada atendimento é uma oportunidade de confirmar o compromisso com ${kw[2]} e ${kw[3]} real em ${C}.`,
      },
      {
        badge: "CONFIANÇA",
        title: `Por que clientes voltam e indicam a ${B}`,
        body: `${cap(kw[6])} e ${kw[2]} consistente são a base de tudo que fazemos. Quem passa por aqui percebe a diferença.`,
      },
    ];
    return variants[v % variants.length];
  },

  // ── Educational ────────────────────────────────────────────

  curiosidade: ({ sub, B, C, svc, kw, v }) => {
    const variants: SlideTemplate[] = [
      {
        badge: "VOCÊ SABIA?",
        title: `O que a maioria não sabe sobre ${sub}`,
        body: `A diferença entre resultado médio e resultado real em ${sub} começa muito antes do que você imagina. Arrasta para entender.`,
      },
      {
        badge: "FATO REAL",
        title: `${cap(sub)} pode ser diferente do que você viveu até hoje`,
        body: `Nem todo ${sub} é igual. ${cap(kw[0])} e ${kw[2]} dependem de como cada etapa é conduzida.`,
      },
      {
        badge: "VALE SABER",
        title: `Um fato sobre ${sub} que muda sua perspectiva`,
        body: `Com o profissional certo, ${sub} vai além do básico. É ${kw[2]}, ${kw[3]} e ${kw[6]} ao mesmo tempo.`,
      },
    ];
    return variants[v % variants.length];
  },

  explicacao: ({ sub, B, C, svc, kw, v }) => {
    const variants: SlideTemplate[] = [
      {
        badge: "COMO FUNCIONA",
        title: `O processo por trás de ${sub}`,
        body: `Na ${B}, cada etapa de ${sub} é pensada para garantir ${kw[2]} e ${kw[3]} do início ao fim.`,
      },
      {
        badge: "ETAPA A ETAPA",
        title: `Veja como ${sub} funciona na prática`,
        listItems: [`Entendemos o que você precisa`, `Planejamento personalizado`, `Execução com ${kw[0]}`, `Resultado verificável`],
      },
      {
        badge: "POR DENTRO",
        title: `O que envolve ${sub} de verdade`,
        body: `${cap(sub)} bem feito exige ${kw[0]}, ${kw[2]} e atenção constante. É isso que a ${B} oferece em ${C}.`,
      },
    ];
    return variants[v % variants.length];
  },

  vantagem: ({ sub, B, C, svc, kw, v }) => {
    const variants: SlideTemplate[] = [
      {
        badge: "AS VANTAGENS",
        title: `Por que ${sub} na ${B} faz diferença`,
        listItems: [`${kw[6]}`, `${kw[2]} consistente`, `Processo claro e direto`, `Atendimento em ${C}`],
      },
      {
        badge: "O QUE MUDA",
        title: `As vantagens de ${sub} bem feito`,
        body: `Quando ${sub} é conduzido com ${kw[2]} real, os benefícios vão além do esperado — você percebe na prática.`,
      },
      {
        badge: "DIFERENÇA REAL",
        title: `O que você não encontra em qualquer lugar`,
        listItems: [`${kw[0]} acima da média`, `${kw[3]} personalizada`, "Transparência total", `Equipe em ${C}`],
      },
    ];
    return variants[v % variants.length];
  },

  autoridade_slide: ({ sub, B, C, svc, kw, v }) => {
    const variants: SlideTemplate[] = [
      {
        badge: "QUEM SOMOS",
        title: `${B}: referência em ${sub} em ${C}`,
        body: `Anos de prática e ${kw[6]} formam a base do trabalho da ${B}. Cada cliente percebe a diferença.`,
      },
      {
        badge: "NOSSA HISTÓRIA",
        title: `O que construímos com ${sub}`,
        body: `${B} nasceu do compromisso com ${kw[2]} e ${kw[7]}. Isso não mudou desde o primeiro dia.`,
      },
      {
        badge: "EXPERTISE",
        title: `Por que confiar na ${B} para ${sub}`,
        body: `${cap(kw[6])} e ${kw[7]} que se provam na prática. Em ${C}, a ${B} é a escolha de quem não abre mão de ${kw[2]}.`,
      },
    ];
    return variants[v % variants.length];
  },

  // ── List / Showcase ────────────────────────────────────────

  lista: ({ sub, B, C, svc, kw, v, niche, objective }) => {
    if (objective === "vender") {
      const s = NICHE_SALES_STORIES[niche].benefit[v % 3];
      return { badge: s.badge, title: fillSales(s.title, B, C), listItems: s.items };
    }
    if (objective === "promocao") {
      const variants: SlideTemplate[] = [
        {
          badge: "O QUE ESTÁ NA OFERTA",
          title: `Condição especial em ${svc} — veja os detalhes`,
          listItems: [
            `${cap(kw[2])} garantida`,
            `Atendimento em ${C}`,
            "Preço especial por tempo limitado",
            "Agende pelo WhatsApp agora",
          ],
        },
        {
          badge: "POR QUE VALE",
          title: `${sub ? `Para ${sub}: ` : ""}4 motivos para aproveitar agora`,
          listItems: [
            `${cap(svc)} com ${kw[2]}`,
            "Condição que não se repete",
            `${cap(kw[3])} personalizada`,
            "Só até o prazo acabar",
          ],
        },
        {
          badge: "INCLUSO",
          title: `O que você leva com essa oferta`,
          listItems: [
            `${cap(kw[2])} de qualidade`,
            `${cap(kw[0])} especializado`,
            `Atendimento em ${C}`,
            "Resultado que você vai notar",
          ],
        },
      ];
      return variants[v % variants.length];
    }
    const variants: SlideTemplate[] = [
      {
        badge: "4 PONTOS",
        title: `O que realmente importa em ${sub}`,
        listItems: [
          `${cap(kw[2])} que você vai notar`,
          `${cap(kw[3])} de verdade`,
          `${cap(kw[6])} em cada etapa`,
          `Resultado que vale cada centavo`,
        ],
      },
      {
        badge: "PONTOS CHAVE",
        title: `Por que ${sub} faz diferença quando bem feito`,
        listItems: [
          `Processo planejado e transparente`,
          `${cap(kw[2])} do início ao fim`,
          `Profissional focado no seu objetivo`,
          `Atendimento direto em ${C}`,
        ],
      },
      {
        badge: "O PADRÃO",
        title: `${cap(sub)}: o que você deveria exigir sempre`,
        listItems: [`${cap(kw[6])}`, `${cap(kw[2])} real`, "Zero improviso", "Resultado que se repete"],
      },
    ];
    return variants[v % variants.length];
  },

  diferencial: ({ sub, B, C, svc, kw, v, niche, objective }) => {
    if (objective === "vender") {
      const s = NICHE_SALES_STORIES[niche].differentiator[v % 3];
      return { badge: fillSales(s.badge, B, C), title: fillSales(s.title, B, C) };
    }
    if (objective === "promocao") {
      const variants: SlideTemplate[] = [
        {
          badge: `SÓ NA ${B}`,
          title: `Por que essa condição especial é diferente`,
          body: `${cap(kw[6])} que você vai notar + ${kw[2]} que você não esquece + preço que faz sentido. Só na ${B} em ${C}.`,
        },
        {
          badge: "O DIFERENCIAL",
          title: `${B}: oferta boa porque atendimento é bom`,
          body: `Desconto é fácil. O que a ${B} oferece junto é ${kw[2]}, ${kw[3]} e o compromisso de sempre. Aproveite.`,
        },
        {
          badge: "POR QUE A GENTE",
          title: `Condição especial de quem você já pode confiar`,
          listItems: [
            `${cap(kw[6])} comprovado`,
            `Atendimento em ${C}`,
            `${cap(kw[2])} garantida`,
            "Preço especial agora",
          ],
        },
      ];
      return variants[v % variants.length];
    }
    const variants: SlideTemplate[] = [
      {
        badge: "DIFERENCIAL",
        title: `O que a ${B} tem que poucos têm`,
        body: `${cap(kw[6])}, ${kw[2]} e compromisso real com cada cliente em ${C}. Não é padrão. É escolha.`,
      },
      {
        badge: "POR QUE A GENTE",
        title: `Por que escolher a ${B} para ${sub}`,
        listItems: [`${kw[6]}`, `Em ${C} com atendimento dedicado`, `${kw[2]} em cada entrega`, `Agendamento pelo WhatsApp`],
      },
      {
        badge: `SÓ NA ${B}`,
        title: `O que você não vai encontrar em outro lugar`,
        body: `${cap(kw[2])} e ${kw[3]} no nível certo. A ${B} em ${C} entrega com ${kw[6]} e sem desculpa.`,
      },
    ];
    return variants[v % variants.length];
  },

  prova_social: ({ sub, B, C, svc, kw, v, testimonials, niche, objective }) => {
    if (testimonials.length > 0) {
      const t = testimonials[(v + 1) % testimonials.length];
      return {
        badge: "CLIENTE REAL",
        title: `"${t.text.length > 70 ? t.text.slice(0, 68) + "…" : t.text}"`,
        body: `— ${t.author}, cliente da ${B}`,
      };
    }
    if (objective === "vender") {
      const s = NICHE_SALES_STORIES[niche].proof[(v + 1) % 3];
      return { badge: s.badge, title: fillSales(s.title, B, C) };
    }
    const variants: SlideTemplate[] = [
      {
        badge: "NA PRÁTICA",
        title: `Clientes que já confiaram na ${B}`,
        body: `Em ${C}, quem escolheu a ${B} percebeu a diferença. ${cap(kw[7])} e ${kw[6]} que geram retorno.`,
      },
      {
        badge: "HISTÓRIAS REAIS",
        title: `O que quem passou por aqui diz`,
        body: `Cada cliente saiu com mais do que esperava: ${kw[2]}, ${kw[3]} e a segurança de ter escolhido certo.`,
      },
      {
        badge: "CONFIAM NA GENTE",
        title: `Por que nossos clientes voltam e indicam`,
        body: `Resultado não é sorte. É ${kw[0]}, ${kw[2]} e ${kw[6]} que a ${B} oferece em cada atendimento em ${C}.`,
      },
    ];
    return variants[v % variants.length];
  },

  // ── Error / Problem path ─────────────────────────────────

  erro: ({ sub, B, C, svc, kw, v }) => {
    const variants: SlideTemplate[] = [
      {
        badge: "ATENÇÃO",
        title: `O erro mais comum em ${sub}`,
        body: `Falta de ${kw[0]} na hora certa. Isso costuma custar mais caro do que parece no início — e tem solução.`,
      },
      {
        badge: "EVITE ISSO",
        title: `O que atrapalha seus resultados em ${sub}`,
        body: `${cap(kw[4])} e ${kw[5]} são mais comuns do que deveriam. E têm solução — se você escolher o parceiro certo.`,
      },
      {
        badge: "REALIDADE",
        title: `Por que ${sub} não funciona para muita gente`,
        body: `Sem o profissional certo, ${sub} vira decepção. A causa quase sempre está em ${kw[4]} desde o início.`,
      },
    ];
    return variants[v % variants.length];
  },

  causa: ({ sub, B, C, svc, kw, v }) => {
    const variants: SlideTemplate[] = [
      {
        badge: "A CAUSA",
        title: `Por que isso acontece em ${sub}`,
        body: `A raiz do problema em ${sub} quase sempre está na falta de ${kw[0]} e ${kw[6]}. Mas tem como mudar.`,
      },
      {
        badge: "ENTENDA",
        title: `O que está por trás do problema`,
        body: `Sem ${kw[2]} e ${kw[3]} desde o início, ${sub} não entrega o que deveria. É uma questão de método.`,
      },
      {
        badge: "ORIGEM",
        title: `De onde vem o problema em ${sub}`,
        body: `${cap(kw[4])} no processo inicial gera a maior parte dos problemas. Identificar é o primeiro passo.`,
      },
    ];
    return variants[v % variants.length];
  },

  resultado_slide: ({ sub, B, C, svc, kw, v, niche, objective }) => {
    if (objective === "vender") {
      const s = NICHE_SALES_STORIES[niche].proof[v % 3];
      return { badge: s.badge, title: fillSales(s.title, B, C) };
    }
    const variants: SlideTemplate[] = [
      {
        badge: "RESULTADO",
        title: `O que muda quando ${sub} é feito certo`,
        body: `Com ${kw[2]} real e ${kw[0]} correto, ${sub} entrega exatamente o que você precisava desde o início.`,
      },
      {
        badge: "TRANSFORMAÇÃO",
        title: `A diferença que você vai sentir`,
        body: `${cap(kw[2])} que você vê, ${kw[3]} que você sente. Isso é ${sub} feito com ${kw[6]}.`,
      },
      {
        badge: "ANTES E DEPOIS",
        title: `O impacto de ${sub} feito corretamente`,
        body: `Quem passou pelo processo certo na ${B} saiu com mais ${kw[2]}, mais clareza e mais confiança.`,
      },
    ];
    return variants[v % variants.length];
  },

  // ── Identity / Brand ──────────────────────────────────────

  identidade: ({ sub, B, C, svc, kw, v, desc, services }) => {
    const serviceSnippet = joinServices(services, svc);
    const descBody = desc
      ? desc.slice(0, 140)
      : `Uma equipe dedicada a entregar ${kw[2]} e ${kw[3]} de qualidade. Do atendimento à execução, tudo pensado para você.`;
    const variants: SlideTemplate[] = [
      {
        badge: "QUEM SOMOS",
        title: `${B} — ${svc} em ${C}`,
        body: descBody,
      },
      {
        badge: "NOSSA MISSÃO",
        title: `Por que a ${B} existe`,
        body: `Nascemos do compromisso com ${kw[2]} real em ${svc}. Em ${C}, somos referência para quem não abre mão de ${kw[6]}.`,
      },
      {
        badge: "CONHEÇA A GENTE",
        title: `${B}: quem são, o que fazem`,
        listItems: [
          `Especializados em ${serviceSnippet}`,
          `Localizados em ${C}`,
          `${kw[6]}`,
          `Agendamento pelo WhatsApp`,
        ],
      },
    ];
    return variants[v % variants.length];
  },

  oferta: ({ sub, B, C, svc, kw, v, niche }) => {
    const audience = NICHE_AUDIENCE[niche];
    const variants: SlideTemplate[] = [
      {
        badge: "OFERTA ESPECIAL",
        title: `${cap(svc)} com condição exclusiva${sub ? ` para ${sub}` : ""}`,
        body: `A ${B} preparou uma oportunidade real em ${C}. Disponível pelo WhatsApp enquanto durar.`,
      },
      {
        badge: "OPORTUNIDADE",
        title: `${sub ? `Para ${sub}: ` : ""}${svc} por um valor que vale aproveitar agora`,
        body: `Essa janela não vai durar. Chame no WhatsApp e garanta sua condição antes que feche.`,
      },
      {
        badge: "TEMPO LIMITADO",
        title: `O momento certo para ${svc}${sub ? ` se você é ${sub}` : ""}`,
        body: `${cap(kw[2])} que a ${B} sempre entregou — agora com condições especiais em ${C}. Aproveite agora.`,
      },
    ];
    return variants[v % variants.length];
  },

  // ── Visual niche roles (paired with new layouts) ────────────

  antes_depois: ({ B, C, svc, kw, v, niche }) => {
    const antesMap: Record<NicheKey, string[]> = {
      barbearia:          ["Corte sem personalidade",  "Barba descuidada",       "Visual sem identidade"],
      odontologia:        ["Sorriso sem brilho",       "Sensibilidade dental",   "Autoestima afetada"],
      "personal-trainer": ["Sem evolução visível",     "Treino sem método",      "Falta de motivação"],
      estetica:           ["Pele opaca",               "Tratamento genérico",    "Resultado temporário"],
      "clinica-medica":   ["Diagnóstico incompleto",   "Dúvidas sem resposta",   "Saúde comprometida"],
      mecanica:           ["Problema sem solução",     "Orçamento surpresa",     "Confiança zero"],
      imobiliaria:        ["Imóvel parado",             "Preço fora do mercado",  "Negociação travada"],
      consultoria:        ["Sem assessoria especializada","Decisão no escuro",      "Risco desnecessário"],
      restaurante:        ["Pedido demorado",           "Qualidade inconsistente","Experiência esquecível"],
      "loja-roupa":       ["Look sem identidade",       "Compra errada",          "Estilo indefinido"],
      outro:              ["Processo ineficiente",      "Resultado abaixo",       "Tempo e dinheiro perdido"],
    };
    const depoisMap: Record<NicheKey, string[]> = {
      barbearia:          ["Estilo único e marcante",  "Barba perfeitamente alinhada", "Visual impecável"],
      odontologia:        ["Sorriso radiante",          "Saúde bucal preservada",       "Autoconfiança restaurada"],
      "personal-trainer": ["Evolução consistente",      "Método personalizado",         "Motivação e foco real"],
      estetica:           ["Pele radiante e saudável",  "Tratamento personalizado",     "Resultado duradouro"],
      "clinica-medica":   ["Diagnóstico preciso",       "Tratamento completo",          "Qualidade de vida plena"],
      mecanica:           ["Carro funcionando 100%",   "Orçamento transparente",       "Confiança garantida"],
      imobiliaria:        ["Imóvel vendido mais rápido","Preço justo de mercado",      "Negociação tranquila"],
      consultoria:        ["Assessoria de quem entende", "Decisão segura e fundamentada","Resultado com responsabilidade"],
      restaurante:        ["Pedido pontual e preciso",  "Sabor marcante e consistente", "Experiência memorável"],
      "loja-roupa":       ["Look com personalidade",    "Combinações certas",           "Estilo definido"],
      outro:              ["Solução eficaz e rápida",   "Processo otimizado",           "Resultado acima do esperado"],
    };
    const antes = antesMap[niche] ?? antesMap.outro;
    const depois = depoisMap[niche] ?? depoisMap.outro;
    const titles = [
      `Antes e depois de conhecer a ${B}`,
      `A diferença que o ${svc} certo faz`,
      `O que muda depois do primeiro atendimento`,
    ];
    return {
      badge: "TRANSFORMAÇÃO",
      title: titles[v % titles.length],
      body: antes.join("|"),   // "|" separated — before_after layout splits these
      listItems: depois,
    };
  },

  numero_destaque: ({ B, C, svc, kw, v, niche }) => {
    type StatEntry = { stat: string; subtitle: string; items: string[]; badge: string; title: string };
    const statsMap: Record<NicheKey, StatEntry[]> = {
      barbearia: [
        { stat: "97%",   subtitle: "dos clientes voltam no próximo mês",          items: ["5★ no Google", "+500 atendidos", "Desde 2019"],      badge: "EM NÚMEROS", title: "Resultados que falam por si" },
        { stat: "+1K",   subtitle: "atendimentos realizados com excelência",       items: ["Corte premium", "Barba artesanal", "100% satisfação"], badge: "NOSSA MARCA", title: `${B} em números reais` },
      ],
      odontologia: [
        { stat: "98%",   subtitle: "de pacientes recomendam nossa clínica",        items: ["Tech de ponta", "+800 sorrisos", "Equipe expert"],      badge: "EM NÚMEROS", title: "Excelência em saúde bucal" },
        { stat: "+500",  subtitle: "procedimentos com resultado confirmado",        items: ["Sem dor", "Raio-X digital", "Agenda flexível"],         badge: "CONQUISTA",  title: "Números que refletem cuidado" },
      ],
      "personal-trainer": [
        { stat: "100%",  subtitle: "dos alunos com evolução em 30 dias",           items: ["Método exclusivo", "Treinos adaptativos", "Suporte diário"], badge: "RESULTADO",  title: "Evolução garantida" },
        { stat: "3x",    subtitle: "mais resultado que treinar sem acompanhamento", items: ["+Força", "+Disposição", "+Resultados"],                   badge: "COMPARAÇÃO", title: "A diferença de ter método" },
      ],
      estetica: [
        { stat: "96%",   subtitle: "de satisfação nos tratamentos",                items: ["Produtos premium", "Técnica avançada", "+300 clientes"],   badge: "EM NÚMEROS", title: "Beleza que gera satisfação" },
        { stat: "+400",  subtitle: "clientes transformados até hoje",               items: ["Resultado duradouro", "Skin care", "Pós-tratamento"],      badge: "NOSSA MARCA", title: `Experiência da ${B}` },
      ],
      "clinica-medica": [
        { stat: "99%",   subtitle: "de diagnósticos precisos na primeira consulta", items: ["Tecnologia moderna", "+1000 atendimentos", "Equipe exp."], badge: "PRECISÃO",   title: "Saúde com excelência" },
        { stat: "+800",  subtitle: "pacientes atendidos com cuidado humano",        items: ["Diagnóstico ágil", "Tratamento personalizado", "Retorno"],  badge: "EM NÚMEROS", title: "Números que geram confiança" },
      ],
      mecanica: [
        { stat: "98%",   subtitle: "de avaliações positivas no Google",             items: ["Diagnóstico grátis", "+5 anos", "Garantia escrita"],        badge: "CONFIANÇA",  title: "Oficina que resolve de vez" },
        { stat: "24h",   subtitle: "tempo médio de entrega do serviço completo",    items: ["Orçamento rápido", "Peças originais", "Sem surpresa"],       badge: "AGILIDADE",  title: "Rápido e transparente" },
      ],
      imobiliaria: [
        { stat: "+200",  subtitle: "imóveis negociados com sucesso",                items: ["Avaliação gratuita", "Rede qualificada", "Contrato seguro"], badge: "EM NÚMEROS", title: "Resultados que constroem confiança" },
        { stat: "30d",   subtitle: "tempo médio para fechar o negócio",             items: ["Anúncio profissional", "Visitas filtradas", "Negociação"],   badge: "AGILIDADE",  title: "Vende mais rápido conosco" },
      ],
      consultoria: [
        { stat: "98%",   subtitle: "de clientes satisfeitos com o atendimento",     items: ["Equipe experiente", "Resultado garantido", "Prazo cumprido"],  badge: "SATISFAÇÃO", title: "Qualidade que se prova com resultado" },
        { stat: "+10a",  subtitle: "de experiência em atendimento especializado",    items: ["Cases comprovados", "Confiança no mercado", "Método claro"],   badge: "EXPERIÊNCIA",title: `A trajetória da ${B} em números` },
        { stat: "+500",  subtitle: "clientes atendidos com excelência e cuidado",    items: ["Atendimento personalizado", "Solução sob medida", "Suporte contínuo"], badge: "EM NÚMEROS", title: "Números que constroem confiança" },
      ],
      restaurante: [
        { stat: "4.9★",  subtitle: "de avaliação média no Google Maps",             items: ["Ingredientes frescos", "+1000 pratos", "Ambiente premium"],  badge: "AVALIAÇÃO",  title: "Qualidade reconhecida por todos" },
        { stat: "+5K",   subtitle: "refeições servidas com satisfação",             items: ["Receita exclusiva", "Cardápio variado", "Entrega rápida"],   badge: "EM NÚMEROS", title: "Números que mostram o sabor" },
      ],
      "loja-roupa": [
        { stat: "95%",   subtitle: "dos clientes voltam para novas compras",        items: ["Curadoria exclusiva", "+200 peças", "Atendimento consultivo"], badge: "FIDELIDADE", title: "Estilo que faz voltar" },
        { stat: "+300",  subtitle: "looks montados para clientes satisfeitos",      items: ["Tendências atuais", "Tamanhos inclusivos", "Preço justo"],    badge: "EM NÚMEROS", title: "A ${B} em números reais" },
      ],
      outro: [
        { stat: "97%",   subtitle: "de satisfação no atendimento",                  items: [cap(kw[2]), cap(kw[6]), `Experiência em ${C}`],               badge: "EM NÚMEROS", title: "Resultados comprovados" },
        { stat: "+500",  subtitle: `clientes atendidos em ${C}`,                    items: [cap(kw[0]), cap(kw[2]), cap(kw[3])],                           badge: "NOSSA MARCA", title: `${B}: números que importam` },
      ],
    };
    const opts = statsMap[niche] ?? statsMap.outro;
    const opt = opts[v % opts.length];
    return {
      badge: opt.badge,
      title: opt.stat,
      subtitle: opt.subtitle,
      listItems: opt.items,
    };
  },

  passo_a_passo: ({ B, C, svc, kw, v, niche }) => {
    type StepEntry = { badge: string; title: string; steps: string[] };
    const stepsMap: Record<NicheKey, StepEntry[]> = {
      barbearia: [
        { badge: "COMO FUNCIONA", title: "Do agendamento ao estilo perfeito",    steps: ["Agende pelo WhatsApp em segundos", "Atendimento personalizado com especialistas", "Saia com o visual que você imaginou"] },
        { badge: "SEU PROCESSO",  title: "Sua experiência completa conosco",     steps: ["Consultoria sobre o corte ideal pra você", "Execução com produto premium e técnica", "Acabamento e dica de manutenção"] },
      ],
      odontologia: [
        { badge: "SEU TRATAMENTO", title: "Seu sorriso perfeito em 3 etapas",   steps: ["Avaliação completa e gratuita", "Plano de tratamento personalizado", "Acompanhamento até o resultado final"] },
        { badge: "COMO FUNCIONA",  title: "Atendimento humanizado do início ao fim", steps: ["Consulta sem dor e sem pressa", "Diagnóstico preciso com tecnologia", "Tratamento claro com prazo garantido"] },
      ],
      "personal-trainer": [
        { badge: "SEU MÉTODO",    title: "Evolução em 3 fases simples",          steps: ["Avaliação física e definição de metas", "Treino progressivo com acompanhamento", "Ajuste contínuo para máximo resultado"] },
        { badge: "COMO FUNCIONA", title: "Do primeiro treino ao resultado real",  steps: ["Anamnese e definição do seu objetivo", "Planilha personalizada toda semana", "Resultado medido e ajustado todo mês"] },
      ],
      estetica: [
        { badge: "SEU PROTOCOLO", title: "Tratamento que transforma em 3 passos", steps: ["Avaliação da pele e definição do protocolo", "Sessões personalizadas com produto certo", "Manutenção e resultado duradouro"] },
        { badge: "COMO FUNCIONA", title: "Do diagnóstico ao brilho da pele",      steps: ["Diagnóstico facial sem custo", "Tratamento personalizado sessão a sessão", "Rotina de cuidados pós-tratamento"] },
      ],
      "clinica-medica": [
        { badge: "SEU ATENDIMENTO", title: "Cuidado completo em 3 etapas",       steps: ["Agendamento fácil pelo WhatsApp", "Consulta dedicada e diagnóstico claro", "Tratamento acompanhado com retorno garantido"] },
        { badge: "COMO FUNCIONA",   title: "Saúde sem complicação",              steps: ["Consulta sem filas e com atenção", "Exames com laudo rápido e preciso", "Tratamento com protocolo claro"] },
      ],
      mecanica: [
        { badge: "COMO FUNCIONA", title: "Seu carro resolvido em 3 etapas",      steps: ["Diagnóstico gratuito e completo", "Orçamento transparente sem surpresa", "Execução com peças certas e garantia"] },
        { badge: "SEU PROCESSO",  title: "Sem enrolação e sem surpresa",          steps: ["Recebemos o carro e checamos tudo", "Passamos o orçamento antes de tocar", "Entregamos no prazo com garantia"] },
      ],
      imobiliaria: [
        { badge: "COMO FUNCIONA", title: "Seu imóvel negociado em 3 etapas",     steps: ["Avaliação gratuita do seu imóvel", "Divulgação para compradores qualificados", "Negociação e fechamento assistido"] },
        { badge: "SEU PROCESSO",  title: "Do anúncio ao contrato assinado",       steps: ["Fotos profissionais e anúncio premium", "Visitas filtradas para compradores certos", "Negociação segura e contrato revisado"] },
      ],
      consultoria: [
        { badge: "COMO FUNCIONA", title: "Do primeiro contato ao resultado",      steps: ["Consulta inicial para entender o seu caso", "Proposta personalizada e transparente", "Acompanhamento até a conclusão"] },
        { badge: "SEU PROCESSO",  title: "3 passos para resolver de vez",         steps: ["Análise detalhada da sua situação", "Solução sob medida com prazo definido", "Entrega com suporte e garantia de qualidade"] },
        { badge: "METODOLOGIA",   title: "Simples assim — do contato ao resultado", steps: ["Agende pelo WhatsApp sem compromisso", "Reunião rápida para entender o que precisa", "Resolução com método, prazo e clareza"] },
      ],
      restaurante: [
        { badge: "COMO FUNCIONA", title: "Do pedido à experiência completa",     steps: ["Cardápio digital com fotos reais", "Preparo com ingredientes frescos", "Entrega pontual ou mesa preparada"] },
        { badge: "SEU PEDIDO",    title: "Simples assim",                         steps: ["Escolha pelo cardápio ou delivery", "Pedido confirmado em segundos", "Recebe pronto e sem espera"] },
      ],
      "loja-roupa": [
        { badge: "SUA EXPERIÊNCIA", title: "Estilo em 3 passos",                 steps: ["Consultoria de look gratuita", "Seleção das peças certas pra você", "Combinações prontas para usar"] },
        { badge: "COMO FUNCIONA",   title: "Do estilo ideal ao seu guarda-roupa", steps: ["Conversamos sobre seu estilo e rotina", "Escolhemos peças que combinam entre si", "Você sai com look completo montado"] },
      ],
      outro: [
        { badge: "COMO FUNCIONA", title: `${B} em 3 passos simples`,             steps: [`Agende pelo WhatsApp em ${C}`, "Atendimento personalizado com especialistas", "Resultado que supera sua expectativa"] },
        { badge: "SEU PROCESSO",  title: "Do contato ao resultado",               steps: ["Primeiro contato e entendimento do que precisa", "Proposta personalizada e transparente", "Execução com acompanhamento e garantia"] },
      ],
    };
    const opts = stepsMap[niche] ?? stepsMap.outro;
    const opt = opts[v % opts.length];
    return {
      badge: opt.badge,
      title: opt.title,
      listItems: opt.steps,
    };
  },
};

// ─── CTA by objective ─────────────────────────────────────────

const CTA_BY_OBJECTIVE: Record<CarouselObjective, string[]> = {
  vender:    ["Chame no WhatsApp e solicite agora", "Fale com a gente e garanta o seu", "Chame agora e saiba mais"],
  educar:    ["Ficou com dúvida? Chame no WhatsApp", "Quer saber mais? É só chamar", "Converse com a gente"],
  promocao:  ["Aproveite — chame agora no WhatsApp", "Garanta sua condição pelo WhatsApp", "Chame antes que acabe"],
  servico:   ["Agende pelo WhatsApp", "Chame e marque seu horário", "Solicite pelo WhatsApp"],
  autoridade:["Fale com quem entende do assunto", "Chame no WhatsApp para conversar", "Converse com a especialidade"],
  whatsapp:  ["Chame agora no WhatsApp", "É só mandar mensagem", "Atendimento direto pelo WhatsApp"],
  recuperar: ["A gente te espera — chame agora", "Volte e fale com a gente", "Retome seu atendimento"],
  novidade:  ["Chame e conheça a novidade", "Descubra mais pelo WhatsApp", "Fique por dentro — chame agora"],
  duvidas:   ["Ficou com dúvida? Chame no WhatsApp", "Tire suas dúvidas na hora", "Converse com a gente agora"],
};

// ─── Caption and WhatsApp by angle ────────────────────────────

const CAPTION_HOOKS: Record<AngleId, string[]> = {
  confianca: [
    "{sub}: quando é feito com cuidado real, você percebe a diferença. Arrasta.",
    "Confiança em {sub} começa com o profissional certo. Veja o que a {B} entrega.",
    "Qualidade em {sub} que você vai ver e sentir. Desliza para conhecer.",
  ],
  educativo: [
    "Tudo que você precisa entender sobre {sub} — em poucos slides diretos. Salva.",
    "Informação que muda a forma de ver {sub}. Arrasta e aprende.",
    "{sub}: conteúdo que vale a pena guardar. Desliza e confere.",
  ],
  urgencia: [
    "Essa oportunidade em {sub} não vai durar. Arrasta antes que acabe.",
    "Condições especiais em {sub} por tempo limitado. Veja tudo no carrossel.",
    "{sub} com condições que você não vai encontrar todo dia. Desliza agora.",
  ],
  diferenciais: [
    "Nem todo lugar entrega {sub} assim. Arrasta e vê o que nos separa.",
    "O diferencial da {B} em {sub} está em cada detalhe. Desliza para conferir.",
    "{sub} feito como deveria ser. Veja o que muda quando você escolhe certo.",
  ],
  resultado: [
    "O resultado de {sub} feito com dedicação fala por si. Arrasta e vê.",
    "{sub}: o que muda quando é conduzido certo. Desliza para entender.",
    "Veja o que {sub} entrega quando feito com método. Conteúdo no carrossel.",
  ],
  inspiracao: [
    "{sub} pode ser o passo que muda sua trajetória. Arrasta e descobre.",
    "A oportunidade em {sub} está aqui agora. Desliza para ver tudo.",
    "Uma decisão em {sub} pode fazer muita diferença. Confira no carrossel.",
  ],
};

// Intent-specific caption hooks (override angle-based when intent is specific)
const CAPTION_HOOKS_BY_INTENT: Partial<Record<TopicIntent, string[]>> = {
  sobre_negocio: [
    "A {B} em {C}: quem somos, o que fazemos e como podemos ajudar. Arrasta.",
    "Conheça a {B}: uma equipe dedicada a {svc} em {C}. Desliza e descobre.",
    "Por que clientes escolhem a {B}? Tudo nesse carrossel. Arrasta e vê.",
  ],
  bastidores: [
    "Veja como a {B} prepara cada atendimento. Por trás do resultado. Arrasta.",
    "O processo que faz a diferença em {svc}. Bastidores da {B}. Desliza.",
    "Antes do resultado, há método. Veja como trabalhamos. Arrasta e confere.",
  ],
  depoimento: [
    "Resultado que não precisamos descrever — deixamos nossos clientes fazer isso. Arrasta.",
    "Quem passou pela {B} percebeu a diferença. Veja as histórias. Desliza.",
    "A prova está em quem atendemos. Histórias reais. Arrasta.",
  ],
};

const WA_MESSAGES: Record<AngleId, string[]> = {
  confianca: [
    "Olá! Vi o conteúdo sobre {sub} e gostaria de saber mais.",
    "Oi! Vim pelo Instagram. O post sobre {sub} me convenceu. Quero conversar.",
    "Olá, vim pelo Instagram! Quero saber mais sobre {sub}.",
  ],
  educativo: [
    "Olá! O conteúdo sobre {sub} foi muito útil. Tenho interesse em saber mais.",
    "Oi! Vi o post explicando {sub} e fiquei interessado. Como funciona?",
    "Olá! Vi o guia sobre {sub} e quero agendar uma conversa.",
  ],
  urgencia: [
    "Olá! Vi a oportunidade sobre {sub} e vim antes que passe. Ainda está disponível?",
    "Oi! Vim pelo post de {sub}. Quero aproveitar a condição especial.",
    "Olá! Vi a oferta de {sub} e quero garantir logo. Tem disponibilidade?",
  ],
  diferenciais: [
    "Olá! O diferencial de vocês em {sub} me chamou atenção. Quero conversar.",
    "Oi! Vi o post sobre {sub} e gostei muito da abordagem. Quero saber mais.",
    "Olá! Vim pelo Instagram. O conteúdo sobre {sub} me interessou bastante.",
  ],
  resultado: [
    "Olá! Os resultados de {sub} que vi no post foram impressionantes. Quero saber mais.",
    "Oi! Vi o post sobre {sub} e o resultado me convenceu. Como funciona?",
    "Olá! Quero esse resultado em {sub}. Pode me contar como funciona?",
  ],
  inspiracao: [
    "Olá! O post sobre {sub} me inspirou. Quero saber como posso começar.",
    "Oi! Vi o conteúdo sobre {sub} e quero dar esse passo. Me conta mais.",
    "Olá! Vim pelo Instagram. O post sobre {sub} me motivou a entrar em contato.",
  ],
};

// Objective-specific captions (override angle-based when intent is generic)
const CAPTION_HOOKS_BY_OBJECTIVE: Partial<Record<CarouselObjective, string[]>> = {
  promocao: [
    "{svc} com condição especial para {sub} — aproveite antes que acabe. Desliza.",
    "Uma oferta real em {svc} para {sub}. Arrasta e vê o que preparamos.",
    "Condição por tempo limitado para {sub} em {svc}. Confere no carrossel.",
    "Promoção de {svc} que vale aproveitar agora. Desliza.",
    "Para {sub}: condição exclusiva em {svc}. Não deixa passar. Arrasta.",
  ],
  vender: [
    "{sub} feito com o cuidado que faz diferença. Arrasta e vê.",
    "Resultado real começa com a escolha certa. Desliza.",
    "O que separa um bom {svc} do que você já viveu. Confere.",
  ],
  duvidas: [
    "Dúvidas sobre {sub}? Respondemos tudo aqui. Arrasta.",
    "As perguntas mais comuns sobre {sub} — com resposta real. Desliza.",
    "{sub}: tudo que você precisava entender, em poucos slides. Salva.",
  ],
  educar: [
    "Tudo sobre {sub} em slides diretos. Salva para não perder.",
    "Dica de {sub} que faz diferença na prática. Arrasta e aprende.",
    "Informação sobre {sub} que você vai querer guardar. Desliza.",
  ],
  autoridade: [
    "A {B} em {C}: expertise que você vai perceber na prática. Arrasta.",
    "O que faz a {B} ser referência em {sub}. Desliza e descobre.",
    "Quem escolhe a {B} para {sub} sabe o que está fazendo. Veja.",
  ],
  recuperar: [
    "Faz tempo? A {B} tem uma condição especial para você voltar. Arrasta.",
    "O que você está perdendo por não estar aqui. Desliza.",
    "A gente sente sua falta. Uma oferta especial para quem volta. Confere.",
  ],
};

const WA_MESSAGES_BY_OBJECTIVE: Partial<Record<CarouselObjective, string[]>> = {
  promocao: [
    "Olá! Vi a promoção de {svc} para {sub} e quero aproveitar. Ainda está disponível?",
    "Oi! Vim pelo Instagram. Quero garantir a condição especial de {svc}. Pode me contar mais?",
    "Olá! Vi a oferta de {svc} e quero reservar meu horário antes que acabe.",
  ],
  duvidas: [
    "Olá! Vi o conteúdo sobre {sub} e fiquei com algumas dúvidas. Pode me ajudar?",
    "Oi! Vi o carrossel explicando {sub} e quero entender melhor como funciona.",
    "Olá! O post sobre {sub} foi ótimo. Quero conversar para tirar uma dúvida específica.",
  ],
  educar: [
    "Olá! Vi o conteúdo sobre {sub} e quero aprender mais. Como posso começar?",
    "Oi! O carrossel sobre {sub} foi muito útil. Quero saber mais sobre como funciona.",
    "Olá! Vim pelo Instagram. O post sobre {sub} me ajudou bastante. Posso agendar?",
  ],
  recuperar: [
    "Oi! Faz um tempo que não apareço. Vi a oferta e quero voltar. Como funciona?",
    "Olá! Vi que vocês têm uma condição especial e quero aproveitar para retomar.",
    "Oi! Fui cliente antes e quero voltar. Vi a mensagem e vim perguntar sobre a oferta.",
  ],
};

// ─── Reels hooks by objective ─────────────────────────────────

const REELS_HOOKS_BY_OBJECTIVE: Record<CarouselObjective, string[]> = {
  vender: [
    "Você está buscando {sub}? Deixa eu te mostrar como funciona aqui na {B}.",
    "O que faz {svc} de verdade? Em menos de 1 minuto eu explico.",
    "{sub} — você sabe o que esperar? Assiste até o final.",
  ],
  educar: [
    "Sobre {sub}: o que a maioria não sabe, mas deveria.",
    "Deixa eu te explicar {sub} em menos de 60 segundos.",
    "3 pontos sobre {sub} que fazem diferença na prática.",
  ],
  promocao: [
    "Tem uma condição especial em {svc} por tempo limitado. Assiste até o final.",
    "Se você pensa em {sub}, chegou a hora certa — mas é só por pouco tempo.",
    "A {B} preparou algo especial para você. Não deixa passar.",
  ],
  servico: [
    "Como funciona {svc} na {B}? Te mostro em menos de 1 minuto.",
    "Antes de contratar {svc}, você precisa saber disso.",
    "O processo do nosso {svc} é simples e direto. Vou te explicar.",
  ],
  autoridade: [
    "O que faz a {B} diferente em {C}? Não é sorte — é processo.",
    "Anos de experiência em {svc} me ensinaram uma coisa que poucos percebem.",
    "Se você quer resultado real em {sub}, esse vídeo é pra você.",
  ],
  whatsapp: [
    "Tem interesse em {svc}? A conversa começa com uma mensagem.",
    "Se você pensa em {sub}, a {B} está pronta pra te atender pelo WhatsApp.",
    "Me manda uma mensagem e a gente resolve {sub} juntos.",
  ],
  recuperar: [
    "Faz tempo que você não aparece. A {B} tem algo especial pra quem quer voltar.",
    "Você conhecia a {B} antes? Tenho uma mensagem pra você.",
    "Se você foi cliente da {B} e sumiu, esse vídeo é pra você.",
  ],
  novidade: [
    "Novidade aqui na {B} que você precisa saber. Assiste até o final.",
    "{sub} chegou — e é exatamente o que você estava esperando.",
    "Não vou gastar seu tempo: novidade em {svc} na {B}. Confere.",
  ],
  duvidas: [
    "A dúvida que mais recebo sobre {svc}? Vou responder agora.",
    "Se você tem dúvidas sobre {sub}, essa resposta é pra você.",
    "Deixa eu responder as principais perguntas sobre {svc} de forma rápida.",
  ],
};

// ─── Input interpretation ─────────────────────────────────────

const META_PREFIXES: RegExp[] = [
  // Strip "Eu" at the very start before any other patterns
  /^eu\s+/i,
  // "quero/preciso que você faça/crie/gere um carrossel de/sobre"
  /^(?:quero|preciso)\s+que\s+(?:voc[eê]\s+)?(?:fa[çc]a|crie|gere|escreva)\s+(?:um|uma)?\s*(?:carrossel|post|conte[uú]do|roteiro|legenda)?\s*(?:de|sobre|do|da|para|—|-)?\s*/i,
  /^(quero|preciso)\s+(?:de\s+)?(criar?|gerar?|fazer?|fa[çc]a|escrever?)\s+(um|uma)?\s*(carrossel|post|conte[uú]do|roteiro|legenda)?\s*(de|sobre|do|da|para)?\s*/i,
  /^(quero|preciso)\s+(de\s+)?(um|uma)?\s*(carrossel|post|conte[uú]do|texto|legenda)\s*(de|sobre|do|da|para)?\s*/i,
  /^(criar?|gerar?|fazer?|fa[çc]a|escrever?)\s+(um|uma)?\s*(carrossel|post|conte[uú]do|roteiro|legenda)?\s*(de|sobre|do|da|para)?\s*/i,
  /^(me\s+)?(ajuda|ajude|crie|cria|gere|gera)\s+(?:com\s+)?(um|uma)?\s*(carrossel|post|conte[uú]do)?\s*(de|sobre|do|da|para)?\s*/i,
  /^com\s+(?:um|uma)\s*(?:carrossel|post|conte[uú]do)?\s*(?:de|sobre|do|da|para)?\s*/i,
  /^carrossel\s+(de|sobre|do|da)?\s*/i,
  /^posts?\s+(de|sobre|do|da)?\s*/i,
  /^falar\s+(sobre\s+|de\s+|do\s+|da\s+)?\s*/i,
  /^mostrar\s+(?:(?:o|a|os|as)\s+)?(?:noss[ao]s?\s+)?/i,
  /^divulgar\s+(?:(?:o|a|os|as)\s+)?(?:noss[ao]s?\s+)?/i,
  /^conte[uú]do\s+(?:de|sobre|do|da|para)?\s*/i,
  /^(?:tema|assunto)\s*[:—\-]?\s*/i,
  /^promo[çc][aã]o\s+(?:de|do|da|dos|das|para)?\s*/i,
  /^dica\s+(?:de|sobre|para)?\s*/i,
  /^para\s+/i,
  /^(?:algo\s+)?sobre\s+/i,
  /^(?:meu|minha|nosso|nossa|noss[ao]s)\s+(?:negócio|negocio|empresa|marca|servi[çc]o|produto)?\s*/i,
  /^(?:meu|minha|nosso|nossa|noss[ao]s)\s+/i,
  // First-person verb forms (faço, ofereço, etc.)
  /^(?:fa[çc]o|ofere[çc]o|realizo|presto|vendo|trabalho\s+com|atendo|atendemos?|oferecemos?|realizamos?|prestamos?|vendemos?|trabalhamos?\s+com)\s+/i,
  /^pra\s+/i,
  /^n[ao]s?\s+(?:meu|minha|nosso|nossa|noss[ao]s)\s+/i,
  // Strip leading em-dash/dash that may remain after other strips
  /^[-—]\s*/,
];

// Generic action verbs that mean "just do the business service" — replace with mainService
const GENERIC_ACTIONS_RE = /^(vend[ae]r?(\s+(mais|melhor|clientes?|vendas?))?|comprar?(\s+(mais|melhor))?|fazer\s*mais|gerar(\s+(mais|clientes?|vendas?|resultado|leads?))?|divulgar?|postar?(\s+(mais|melhor))?|crescer?|alavancar?|aumentar?(\s+(as\s+)?(vendas?|clientes?|resultado|faturamento))?|trazer(\s+mais)?\s*(clientes?|vendas?)?|captar?(\s*(clientes?|leads?))?|faturar?(\s+mais)?)$/i;

export function extractCleanSubjectPublic(topic: string, mainService: string): string {
  return extractCleanSubject(topic, mainService);
}

function extractCleanSubject(topic: string, mainService: string): string {
  let s = topic.trim();
  let changed = true;
  while (changed) {
    changed = false;
    for (const rx of META_PREFIXES) {
      const next = s.replace(rx, "").trim();
      if (next.length >= 2 && next !== s) { s = next; changed = true; break; }
    }
  }
  s = s.replace(/\s+/g, " ").replace(/^[-—\s]+|[-—\s]+$/g, "").replace(/[.,!?;:]+$/, "").trim();
  // Strip leading articles (o/a/os/as/um/uma)
  s = s.replace(/^(o|a|os|as|um|uma|uns|umas)\s+/i, "").trim();
  if (GENERIC_ACTIONS_RE.test(s)) return mainService;
  // Very short results (abbreviations like "adv", "rh") fall back to mainService
  if (s.length < 4 && !/^\d/.test(s)) return mainService;
  // Truncate very long phrases to avoid "copy of input" effect
  const words = s.split(" ");
  if (words.length > 6) s = words.slice(0, 5).join(" ");
  return s;
}

// ─── Theme interpretation ─────────────────────────────────────

function interpretTheme(
  cleanSubject: string,
  objective: CarouselObjective,
  mainService: string
): string {
  if (!cleanSubject || cleanSubject === mainService) {
    const fallback: Record<CarouselObjective, string> = {
      vender:     `Por que escolher ${cap(mainService)}`,
      educar:     `Tudo sobre ${cap(mainService)}`,
      promocao:   `Oferta especial em ${cap(mainService)}`,
      servico:    `Como funciona ${cap(mainService)}`,
      autoridade: `Nossa expertise em ${cap(mainService)}`,
      whatsapp:   `Fale sobre ${cap(mainService)}`,
      recuperar:  `Uma oferta especial para você`,
      novidade:   `Novidade: ${cap(mainService)}`,
      duvidas:    `Dúvidas sobre ${cap(mainService)}`,
    };
    return fallback[objective] ?? cap(mainService);
  }
  const frames: Record<CarouselObjective, string> = {
    vender:     `Por que ${cap(cleanSubject)}`,
    educar:     cap(cleanSubject),
    promocao:   `Oferta especial: ${cap(cleanSubject)}`,
    servico:    `Como funciona ${cap(cleanSubject)}`,
    autoridade: cap(cleanSubject),
    whatsapp:   cap(cleanSubject),
    recuperar:  cap(cleanSubject),
    novidade:   `Novidade: ${cap(cleanSubject)}`,
    duvidas:    `Dúvidas sobre ${cap(cleanSubject)}`,
  };
  return frames[objective] ?? cap(cleanSubject);
}

// ─── Reels script generator ───────────────────────────────────

function generateReelsScript(
  cleanSubject: string,
  objective: CarouselObjective,
  niche: NicheKey,
  businessName: string,
  city: string,
  mainService: string,
  whatsapp: string,
  interpretedTheme: string,
  seed: string
): ReelsScript {
  const sub = cleanSubject || mainService;
  const kw = NICHE_KW[niche];
  const audience = NICHE_AUDIENCE[niche];
  const v = variationIndex(seed + "reels", 3);

  const fill = (s: string) => s
    .replace(/{sub}/g, sub)
    .replace(/{B}/g, businessName)
    .replace(/{C}/g, city)
    .replace(/{svc}/g, mainService);

  const hook = fill(REELS_HOOKS_BY_OBJECTIVE[objective][v % REELS_HOOKS_BY_OBJECTIVE[objective].length]);

  const scriptParts: string[] = [hook];
  switch (objective) {
    case "vender":
      scriptParts.push(
        `Na ${businessName}, o processo é simples: você entra em contato, a gente entende o que você precisa e cuidamos de tudo com foco em ${kw[2]}.`,
        `Não é só ${mainService}. É ${kw[6]} e ${kw[7]}.`,
        `Se você está em ${city} e quer ${kw[3]}, me manda uma mensagem no WhatsApp.`
      );
      break;
    case "educar":
      scriptParts.push(
        `Primeiro ponto: ${cap(kw[2])} faz toda a diferença no resultado.`,
        `Segundo: ${cap(kw[3])} é algo que pouca gente considera, mas deveria.`,
        `E o mais importante: ${kw[6]}. É isso que separa um resultado mediano de um resultado real.`,
        `Se quiser saber mais, me manda uma mensagem.`
      );
      break;
    case "promocao":
      scriptParts.push(
        `A ${businessName} preparou uma condição especial em ${mainService} por tempo limitado.`,
        `Você garante ${kw[2]} e ${kw[3]} com uma oferta que não vai se repetir tão cedo.`,
        `Clica no link da bio ou me manda uma mensagem no WhatsApp agora.`
      );
      break;
    case "servico":
      scriptParts.push(
        `Funciona assim: primeiro a gente entende o que você precisa.`,
        `Depois aplicamos ${kw[0]} com foco em ${kw[2]}.`,
        `E o resultado é ${cap(kw[3])} e satisfação garantida.`,
        `Me chama no WhatsApp e a gente começa hoje.`
      );
      break;
    case "autoridade":
      scriptParts.push(
        `Na ${businessName}, cada detalhe é pensado para entregar ${kw[2]} e ${kw[3]}.`,
        `${cap(kw[6])} não é promessa — é o que você vai viver aqui.`,
        `Quem escolhe a ${businessName} em ${city} sabe o que está fazendo.`,
        `Me chama e comprova.`
      );
      break;
    case "whatsapp":
      scriptParts.push(
        `O próximo passo é simples: você manda uma mensagem e a gente responde.`,
        `Sem burocracia, sem espera. Só atendimento direto e ${kw[2]}.`,
        `O link está na bio. Me chama agora.`
      );
      break;
    case "recuperar":
      scriptParts.push(
        `A ${businessName} preparou algo especial para quem quer voltar.`,
        `Você vai encontrar ${kw[2]} e ${kw[3]} — do jeito que você lembra, ou ainda melhor.`,
        `Me manda uma mensagem. Temos uma condição esperando por você.`
      );
      break;
    case "novidade":
      scriptParts.push(
        `${cap(sub)} chegou na ${businessName} com tudo: ${kw[2]} e ${kw[3]}.`,
        `A gente pensou em cada detalhe para garantir ${kw[6]}.`,
        `Fica ligado no Instagram e não perde as novidades.`
      );
      break;
    case "duvidas":
      scriptParts.push(
        `A resposta mais direta: ${cap(kw[2])} e ${cap(kw[3])} são a base do que fazemos na ${businessName}.`,
        `${cap(audience.objection)}? Entendemos isso. É por isso que trabalhamos com ${kw[6]}.`,
        `Ficou com mais dúvidas? Me manda uma mensagem no WhatsApp.`
      );
      break;
  }

  const script = scriptParts.join(" ");

  const screenText = [
    interpretedTheme,
    cap(kw[2]),
    cap(kw[3]),
    cap(kw[6]),
    objective === "promocao" ? "Aproveite — por tempo limitado" : `Me chama no WhatsApp`,
  ];

  const ctaPool = CTA_BY_OBJECTIVE[objective];
  const ctaBase = fill(ctaPool[v % ctaPool.length]);
  const phone = whatsapp.replace(/\D/g, "");
  const cta = phone ? `${ctaBase} → wa.me/55${phone}` : ctaBase;

  return { videoTitle: interpretedTheme, hook, script, screenText, cta };
}

// ─── Dashboard title generation ───────────────────────────────

function makeDashboardTitle(intent: TopicIntent, B: string, sub: string, svc: string): string {
  const map: Record<TopicIntent, string> = {
    sobre_negocio: `Conheça a ${B}`,
    sobre_servico: `${cap(sub)} — ${B}`,
    promocao:      `Promoção de ${sub} — ${B}`,
    novidade:      `Novidade: ${sub} — ${B}`,
    educativo:     `Dicas sobre ${sub} — ${B}`,
    depoimento:    `Resultados reais — ${B}`,
    bastidores:    `Bastidores de ${svc} — ${B}`,
    faq:           `Dúvidas sobre ${sub} — ${B}`,
    geral:         `${cap(sub)} — ${B}`,
  };
  return map[intent] ?? `${cap(sub)} — ${B}`;
}

// ─── Planning ─────────────────────────────────────────────────

interface CarouselPlan {
  cleanSubject: string;
  intent: TopicIntent;
  angle: AngleId;
  structure: StructureId;
  keywords: NicheKwTuple;
  baseVariation: number;
  carouselTitle: string;
  coverTitle: string;
  coverSubtitle: string;
  contentRoles: SlideRole[];
  ctaText: string;
  captionHook: string;
  waMessage: string;
  palette: SlidePalette;
  interpretedTheme: string;
}

function planCarouselContent(
  topic: string,
  objective: CarouselObjective,
  niche: NicheKey,
  businessName: string,
  city: string,
  mainService: string,
  targetCount: number,
  regenerationSeed: number,
  regenerateHint: CarouselInput["regenerateHint"],
  visualStyle: CarouselVisualStyle,
  primaryColor?: string
): CarouselPlan {
  const cleanSubject = extractCleanSubject(topic, mainService);
  const intent = detectTopicIntent(topic);

  // Hint overrides intent for specific effects
  const effectiveIntent: TopicIntent =
    regenerateHint === "mais_institucional"  ? "sobre_negocio"  :
    regenerateHint === "mais_promocional"    ? "promocao"       :
    intent;

  // Seed — incorporate regeneration to force genuine variation
  const hintOffset = regenerateHint
    ? ({
        mais_vendedor: 101, mais_educativo: 199, mais_direto: 307, mais_criativo: 419,
        mais_institucional: 503, outro_angulo: 617, mais_promocional: 731, menos_generico: 839,
        outra_paleta: 947, outro_layout: 1061, menos_texto: 1163, mais_contexto: 1277,
      } as Record<string, number>)[regenerateHint] ?? 0
    : 0;
  const seed = topic + businessName + objective + (regenerationSeed * 137 + hintOffset).toString();

  // Angle: hint can bias toward specific angles
  let availableAngles: AngleId[];
  if (regenerateHint === "mais_vendedor")        availableAngles = ["urgencia", "resultado", "diferenciais"];
  else if (regenerateHint === "mais_educativo")  availableAngles = ["educativo", "confianca", "resultado"];
  else if (regenerateHint === "mais_direto")     availableAngles = ["resultado", "diferenciais", "urgencia"];
  else if (regenerateHint === "mais_criativo")   availableAngles = ["inspiracao", "educativo", "diferenciais"];
  else if (regenerateHint === "mais_promocional") availableAngles = ["urgencia", "diferenciais", "resultado"];
  else if (regenerateHint === "menos_generico")  availableAngles = ["diferenciais", "resultado", "confianca"];
  else if (regenerateHint === "menos_texto")     availableAngles = ["resultado", "urgencia", "diferenciais"];
  else if (regenerateHint === "mais_contexto")   availableAngles = ["educativo", "confianca", "inspiracao"];
  else                                           availableAngles = ANGLES_BY_OBJECTIVE[objective];
  const angle = availableAngles[variationIndex(seed, availableAngles.length)];

  // Structure: intent-based first, objective fallback
  const intentStructures = STRUCTURES_BY_INTENT[effectiveIntent];
  const objectiveStructures = STRUCTURES_BY_OBJECTIVE[objective];
  const structurePool = regenerateHint === "outro_angulo" ? objectiveStructures : intentStructures;
  const structureId = structurePool[variationIndex(seed + "s", structurePool.length)];
  const structureRoles = STRUCTURES[structureId];

  const baseVariation = variationIndex(seed + "v", 3);
  const keywords = NICHE_KW[niche];

  // Cover title: intent-specific → objective-specific → vender-niche-specific → angle-based
  const intentPool    = COVER_TITLES_BY_INTENT[effectiveIntent];
  const objectivePool = !intentPool
    ? (objective === "promocao"  ? COVER_TITLES_OBJECTIVE_PROMO  :
       objective === "duvidas"   ? COVER_TITLES_OBJECTIVE_DUVIDAS :
       objective === "educar"    ? COVER_TITLES_OBJECTIVE_EDUCAR  :
       undefined)
    : undefined;
  const salesPool     = !intentPool && !objectivePool && objective === "vender"
    ? NICHE_SALES_STORIES[niche].coverTitle
    : undefined;
  const anglePool     = COVER_TITLES_BY_ANGLE[angle];
  const coverPool     = intentPool ?? objectivePool ?? salesPool ?? anglePool;
  const coverTitle = coverPool[variationIndex(seed + "ct", coverPool.length)]
    .replace(/{sub}/g, cleanSubject)
    .replace(/{B}/g, businessName)
    .replace(/{svc}/g, mainService)
    .replace(/{C}/g, city);

  const coverSubPool = COVER_SUBTITLES[angle];
  const coverSubtitle = coverSubPool[variationIndex(seed + "cs", coverSubPool.length)];

  const carouselTitle = makeDashboardTitle(effectiveIntent, businessName, cleanSubject, mainService);

  // Niche-specific roles take priority for vender/servico/autoridade objectives
  const nicheRoleOverride =
    (objective === "vender" || objective === "servico" || objective === "autoridade") &&
    !regenerateHint  // don't override when user is requesting a specific angle
      ? NICHE_ROLES_PRIMARY[niche]
      : undefined;
  const activeRoles = nicheRoleOverride ?? structureRoles;

  const contentCount = Math.max(1, targetCount - 2);
  const contentRoles: SlideRole[] = [];
  for (let i = 0; i < contentCount; i++) contentRoles.push(activeRoles[i % activeRoles.length]);

  const ctaPool = CTA_BY_OBJECTIVE[objective];
  const ctaText = ctaPool[variationIndex(seed + "cta", ctaPool.length)];

  // Caption: intent-specific → objective-specific → angle-based
  const intentCapPool    = CAPTION_HOOKS_BY_INTENT[effectiveIntent];
  const objectiveCapPool = !intentCapPool ? CAPTION_HOOKS_BY_OBJECTIVE[objective] : undefined;
  const angleCapPool     = CAPTION_HOOKS[angle];
  const capPool = intentCapPool ?? objectiveCapPool ?? angleCapPool;
  const captionHook = capPool[variationIndex(seed + "cap", capPool.length)]
    .replace(/{sub}/g, cleanSubject)
    .replace(/{B}/g, businessName)
    .replace(/{svc}/g, mainService)
    .replace(/{C}/g, city);

  // WA: objective-specific → angle-based
  const objectiveWaPool = WA_MESSAGES_BY_OBJECTIVE[objective];
  const angleWaPool     = WA_MESSAGES[angle];
  const waPool = objectiveWaPool ?? angleWaPool;
  const waMessage = waPool[variationIndex(seed + "wa", waPool.length)]
    .replace(/{sub}/g, cleanSubject)
    .replace(/{svc}/g, mainService)
    .replace(/{B}/g, businessName);

  const palette = generateVisualPalette(visualStyle, niche, objective, primaryColor, seed);
  const interpretedTheme = interpretTheme(cleanSubject, objective, mainService);

  return {
    cleanSubject, intent: effectiveIntent, angle, structure: structureId,
    keywords, baseVariation, carouselTitle, coverTitle, coverSubtitle,
    contentRoles, ctaText, captionHook, waMessage, palette, interpretedTheme,
  };
}

// ─── Caption assembler ────────────────────────────────────────

function buildCaption(hook: string, businessName: string, city: string, whatsapp: string): string {
  const phone = whatsapp.replace(/\D/g, "");
  const waLink = phone ? `https://wa.me/55${phone}` : "";
  const closer = waLink
    ? `\n\n👉 ${waLink}\n\n📍 ${businessName} — ${city}`
    : `\n\n📍 ${businessName} — ${city}`;
  return `${hook}\n\n${closer}`;
}

// ─── Main generator ───────────────────────────────────────────

export function generatePremiumCarousel(input: CarouselInput): PremiumCarousel {
  const {
    topic, objective, niche: nicheRaw, businessName, city, mainService,
    whatsapp, selectedImages, slideImagesMap, visualStyle, format,
    services = [], benefits = [], description = "", testimonials = [],
    regenerationSeed = 0, regenerateHint, primaryColor,
  } = input;

  const targetCount = Math.min(8, Math.max(4, input.slideCount ?? 6));
  const hasImages = selectedImages.length > 0 || (slideImagesMap && Object.keys(slideImagesMap).length > 0);
  const niche = nicheKey(nicheRaw);

  const plan = planCarouselContent(
    topic, objective, niche, businessName, city, mainService,
    targetCount, regenerationSeed, regenerateHint, visualStyle, primaryColor
  );

  const { cleanSubject, keywords, baseVariation, coverTitle, coverSubtitle, contentRoles, ctaText, intent, palette, interpretedTheme } = plan;

  // Build slide context
  const ctx: Omit<SlideCtx, "v"> = {
    sub: cleanSubject, B: businessName, C: city, svc: mainService,
    kw: keywords, services, benefits, desc: description, testimonials, intent, niche, objective,
  };

  // Build slide templates
  const templates: SlideTemplate[] = [];

  // Cover
  templates.push({
    badge: NICHE_COVER_BADGE[niche],
    title: coverTitle,
    subtitle: coverSubtitle,
  });

  // Content slides — (baseVariation + i) % 3 for per-slide variant diversity
  contentRoles.forEach((role, i) => {
    const fn = ROLE_FNS[role];
    if (fn) templates.push(fn({ ...ctx, v: (baseVariation + i) % 3 }));
  });

  // CTA slide
  templates.push({ badge: "CTA", title: ctaText, cta: ctaText });

  // Assemble slides — art direction selects cover + CTA + content layout family
  const layouts = layoutsWithArtDirection(niche, visualStyle, !!hasImages, templates.length, regenerationSeed);
  const imageMap = assignImages(selectedImages, templates.length, slideImagesMap);
  const opacities = OVERLAY_OPACITY[visualStyle];

  const slides: PremiumCarouselSlide[] = templates.map((t, i) => {
    const layout = layouts[i] ?? (i === templates.length - 1 ? "cta_final" : "content_list");
    const overlayOpacity =
      layout === "cover_hero"    ? opacities.cover   :
      layout === "image_overlay" ? opacities.overlay :
      layout === "card_glass"    ? opacities.card    : 0;
    const bgVar = bgForLayout(layout, i);

    // Apply palette color per slide based on background variant
    // Dark-bg slides need a BRIGHT accent (visible against #0a0a0f), not palette.dark
    const colorOverride =
      bgVar === "primary" ? palette.primary :
      bgVar === "dark"    ? palette.accent  :
      bgVar === "accent"  ? palette.accent  :
      undefined; // "white" slides keep business color for accents

    return {
      id: uid(),
      slideNumber: i + 1,
      layout,
      title: t.title,
      subtitle: t.subtitle,
      body: t.body,
      cta: t.cta,
      badge: t.badge,
      listItems: t.listItems,
      imageUrl: imageMap[i],
      overlayOpacity,
      bgVariant: bgVar,
      colorOverride,
    };
  });

  const reelsSeed = topic + businessName + objective + regenerationSeed.toString();
  const reelsScript = generateReelsScript(
    cleanSubject, objective, niche, businessName, city, mainService,
    whatsapp, interpretedTheme, reelsSeed
  );

  return {
    title: plan.carouselTitle,
    topic,
    objective,
    format,
    visualStyle,
    slides,
    caption: buildCaption(plan.captionHook, businessName, city, whatsapp),
    whatsappMessage: plan.waMessage,
    selectedImages,
    interpretedTheme,
    reelsScript,
  };
}
