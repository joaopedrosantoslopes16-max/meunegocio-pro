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

const CONTENT_LAYOUTS_WITH_IMAGES: Record<CarouselVisualStyle, CarouselLayout[]> = {
  moderno:     ["bold_statement", "split_image",    "content_list",  "image_overlay", "bold_statement", "card_glass"],
  premium:     ["card_glass",     "content_list",   "split_image",   "card_glass",    "content_list",   "image_overlay"],
  clean:       ["content_list",   "split_image",    "content_list",  "content_list",  "split_image",    "content_list"],
  chamativo:   ["bold_statement", "image_overlay",  "bold_statement","image_overlay", "bold_statement", "split_image"],
  elegante:    ["card_glass",     "split_image",    "card_glass",    "content_list",  "split_image",    "card_glass"],
  minimalista: ["content_list",   "content_list",   "split_image",   "content_list",  "content_list",   "content_list"],
};

const CONTENT_LAYOUTS_NO_IMAGES: Record<CarouselVisualStyle, CarouselLayout[]> = {
  moderno:     ["bold_statement", "content_list", "bold_statement", "content_list", "bold_statement", "content_list"],
  premium:     ["card_glass",     "content_list", "card_glass",    "content_list", "card_glass",     "content_list"],
  clean:       ["content_list",   "bold_statement","content_list", "content_list", "bold_statement", "content_list"],
  chamativo:   ["bold_statement", "bold_statement","content_list", "bold_statement","bold_statement", "content_list"],
  elegante:    ["card_glass",     "bold_statement","card_glass",   "content_list", "card_glass",     "bold_statement"],
  minimalista: ["content_list",   "content_list", "content_list",  "content_list", "content_list",   "content_list"],
};

function layoutsForStyle(style: CarouselVisualStyle, hasImages: boolean, count: number): CarouselLayout[] {
  const pool = hasImages ? CONTENT_LAYOUTS_WITH_IMAGES[style] : CONTENT_LAYOUTS_NO_IMAGES[style];
  const layouts: CarouselLayout[] = ["cover_hero"];
  const contentCount = count - 2;
  for (let i = 0; i < contentCount; i++) layouts.push(pool[i % pool.length]);
  layouts.push("cta_final");
  return layouts;
}

// Overlay opacity calibrated per visual style
const OVERLAY_OPACITY: Record<CarouselVisualStyle, { cover: number; overlay: number; card: number }> = {
  moderno:     { cover: 0.55, overlay: 0.60, card: 0.30 },
  premium:     { cover: 0.50, overlay: 0.55, card: 0.25 },
  clean:       { cover: 0.45, overlay: 0.50, card: 0.20 },
  chamativo:   { cover: 0.62, overlay: 0.68, card: 0.35 },
  elegante:    { cover: 0.50, overlay: 0.55, card: 0.25 },
  minimalista: { cover: 0.40, overlay: 0.45, card: 0.18 },
};

function bgForLayout(layout: CarouselLayout, index: number): "primary" | "dark" | "white" | "accent" {
  if (layout === "cover_hero")     return "primary";
  if (layout === "cta_final")      return "dark";
  if (layout === "bold_statement") return index % 2 === 0 ? "dark" : "primary";
  if (layout === "content_list")   return index % 2 === 0 ? "white" : "accent";
  if (layout === "split_image")    return "white";
  if (layout === "card_glass")     return "primary";
  if (layout === "image_overlay")  return "primary";
  return "white";
}

// ─── Niche classification ─────────────────────────────────────

type NicheKey = "barbearia" | "odontologia" | "personal-trainer" | "restaurante" |
                "estetica" | "loja-roupa" | "mecanica" | "imobiliaria" |
                "clinica-medica" | "outro";

function nicheKey(niche: string): NicheKey {
  const n = niche.toLowerCase();
  if (n.includes("barb")) return "barbearia";
  if (n.includes("odonto") || n.includes("dent")) return "odontologia";
  if (n.includes("personal") || n.includes("academia")) return "personal-trainer";
  if (n.includes("restaur") || n.includes("lanche") || n.includes("comida")) return "restaurante";
  if (n.includes("estet") || n.includes("beleza") || n.includes("cabeleir")) return "estetica";
  if (n.includes("loja") || n.includes("moda") || n.includes("roupa")) return "loja-roupa";
  if (n.includes("mecani") || n.includes("autom")) return "mecanica";
  if (n.includes("imobil") || n.includes("corretor")) return "imobiliaria";
  if (n.includes("clínica") || n.includes("clinica") || n.includes("médic") || n.includes("medic")) return "clinica-medica";
  return "outro";
}

// ─── Niche keyword banks ──────────────────────────────────────
// [técnica, serviço principal, benefício1, benefício2, dor1, dor2, prova1, prova2]

type NicheKwTuple = [string, string, string, string, string, string, string, string];
const NICHE_KW: Record<NicheKey, NicheKwTuple> = {
  barbearia:         ["corte",      "barba",           "estilo",        "acabamento",    "corte mal feito",     "visual sem cuidado", "profissional dedicado",  "resultado impecável"],
  odontologia:       ["técnica",    "sorriso",         "saúde bucal",   "bem-estar",     "descuido dental",     "dor de dente",       "prevenção eficaz",        "tratamento humanizado"],
  "personal-trainer":["método",     "treino",          "evolução",      "resultado",     "treino sem foco",     "planejamento errado","acompanhamento real",     "resultado consistente"],
  restaurante:       ["receita",    "ingredientes",    "sabor",         "experiência",   "comida sem qualidade","demora",             "ingredientes frescos",    "ambiente agradável"],
  estetica:          ["procedimento","tratamento",     "beleza",        "autocuidado",   "falta de técnica",    "resultado fraco",    "procedimento correto",    "resultado visível"],
  "loja-roupa":      ["curadoria",  "peças",           "estilo",        "look completo", "roupa sem qualidade", "tamanho errado",     "curadoria exclusiva",     "atendimento personalizado"],
  mecanica:          ["diagnóstico","revisão",         "segurança",     "confiança",     "problema sem solução","carro parado",       "orçamento transparente",  "prazo garantido"],
  imobiliaria:       ["negociação", "imóvel",          "realização",    "segurança",     "processo complicado", "documentação errada","experiência de mercado",  "negociação eficaz"],
  "clinica-medica":  ["diagnóstico","consulta",        "saúde",         "bem-estar",     "descuido com saúde",  "consulta atrasada",  "atendimento humanizado",  "resultado responsável"],
  outro:             ["processo",   "serviço",         "qualidade",     "resultado",     "falta de atenção",    "resultado abaixo do esperado","dedicação real","experiência comprovada"],
};

// Badge cover by niche
const NICHE_COVER_BADGE: Record<NicheKey, string> = {
  barbearia: "VISUAL", odontologia: "SORRISO", "personal-trainer": "TREINO",
  restaurante: "HOJE", estetica: "BELEZA", "loja-roupa": "NOVIDADE",
  mecanica: "AUTO", imobiliaria: "IMÓVEL", "clinica-medica": "SAÚDE", outro: "DESTAQUE",
};

// ─── Angle system ─────────────────────────────────────────────

type AngleId = "confianca" | "educativo" | "urgencia" | "diferenciais" | "resultado" | "inspiracao";

const COVER_TITLES: Record<AngleId, string[]> = {
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
    "O que separa {B} de qualquer outro em {sub}",
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
    "A oportunidade em {sub} está aqui agora",
    "O próximo passo que faz diferença começa em {sub}",
    "Uma boa decisão em {sub} muda muita coisa",
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

// ─── Narrative structure system ───────────────────────────────

type SlideRole =
  "problema" | "solucao" | "beneficio" | "prova" |
  "curiosidade" | "explicacao" | "vantagem" | "autoridade_slide" |
  "lista" | "diferencial" | "prova_social" |
  "erro" | "causa" | "resultado_slide" |
  "identidade" | "oferta";

type StructureId = "A" | "B" | "C" | "D" | "E";

// Content roles between cover and CTA — cycles if slideCount > 6
const STRUCTURES: Record<StructureId, SlideRole[]> = {
  A: ["problema",    "solucao",    "beneficio",     "prova"],
  B: ["curiosidade", "explicacao", "vantagem",      "autoridade_slide"],
  C: ["lista",       "beneficio",  "diferencial",   "prova_social"],
  D: ["erro",        "causa",      "solucao",       "resultado_slide"],
  E: ["identidade",  "diferencial","prova_social",  "beneficio"],
};

const STRUCTURES_BY_OBJECTIVE: Record<CarouselObjective, StructureId[]> = {
  vender:    ["A", "C", "E"],
  educar:    ["B", "C", "D"],
  promocao:  ["A", "C", "E"],
  servico:   ["E", "A", "B"],
  autoridade:["E", "B", "C"],
  whatsapp:  ["C", "A", "E"],
  recuperar: ["A", "E", "B"],
  novidade:  ["B", "C", "A"],
  duvidas:   ["B", "D", "C"],
};

// ─── Slide template ───────────────────────────────────────────

interface SlideTemplate {
  badge?: string;
  title: string;
  subtitle?: string;
  body?: string;
  cta?: string;
  listItems?: string[];
}

// ─── Role content generators ──────────────────────────────────
// v = (baseVariation + slideIndex) % 3  →  picks variant per slide

type RoleFn = (sub: string, B: string, C: string, svc: string, kw: NicheKwTuple, v: number) => SlideTemplate;

const ROLE_FNS: Record<SlideRole, RoleFn> = {

  problema: (sub, B, C, svc, kw, v) => {
    const variants: SlideTemplate[] = [
      { badge: "ATENÇÃO",    title: `O que trava o resultado em ${sub}`,
        body: `Sem a abordagem certa, ${sub} vira frustração. A diferença está nos detalhes que a maioria ignora.` },
      { badge: "REALIDADE",  title: `Por que ${sub} muitas vezes não entrega o esperado`,
        body: `Muita gente chega até aqui sem clareza sobre ${sub}. Isso tem um custo real no resultado final.` },
      { badge: "O PROBLEMA", title: `O erro mais comum em ${sub}`,
        body: `A falta de ${kw[0]} e ${kw[1]} é o que faz ${sub} não funcionar como deveria.` },
    ];
    return variants[v % variants.length];
  },

  solucao: (sub, B, C, svc, kw, v) => {
    const variants: SlideTemplate[] = [
      { badge: "A SOLUÇÃO",     title: `Como ${B} trata ${sub} diferente`,
        body: `Na ${B}, ${sub} é conduzido com ${kw[0]}, ${kw[2]} e atenção a cada detalhe que faz diferença.` },
      { badge: "COMO FAZEMOS",  title: `A abordagem que realmente funciona em ${sub}`,
        body: `O processo correto começa por entender o que cada cliente precisa. Não tem atalho: é assim que ${sub} entrega resultado.` },
      { badge: "NOSSA RESPOSTA",title: `O que muda quando ${sub} é feito certo`,
        body: `Com ${kw[2]} e ${kw[3]}, ${sub} deixa de ser problema e passa a ser resultado consistente.` },
    ];
    return variants[v % variants.length];
  },

  beneficio: (sub, B, C, svc, kw, v) => {
    const variants: SlideTemplate[] = [
      { badge: "BENEFÍCIOS",      title: `O que você ganha com ${sub} feito certo`,
        listItems: [`${kw[2]} de qualidade`, `${kw[3]} dedicado`, "Processo transparente", "Resultado que dura"] },
      { badge: "VANTAGENS",       title: `Por que vale cada investimento em ${sub}`,
        body: `Além do resultado imediato, ${sub} traz ${kw[2]} que você vai notar no dia a dia. ${B} garante isso com cada atendimento.` },
      { badge: "O QUE VOCÊ GANHA",title: `${sub}: muito além do resultado imediato`,
        listItems: [`Mais ${kw[2]}`, `Melhor ${kw[3]}`, "Processo sem surpresas", "Suporte pelo WhatsApp"] },
    ];
    return variants[v % variants.length];
  },

  prova: (sub, B, C, svc, kw, v) => {
    const variants: SlideTemplate[] = [
      { badge: "NA PRÁTICA",  title: `Resultado real, não promessa`,
        body: `Os clientes da ${B} em ${C} chegam com dúvida e saem com ${kw[2]}. É isso que faz a diferença.` },
      { badge: "RESULTADO",   title: `${B} — anos de prática em ${sub}`,
        body: `Cada atendimento é uma oportunidade de confirmar o compromisso com ${kw[2]} e ${kw[3]} real.` },
      { badge: "CONFIANÇA",   title: `Por que clientes voltam e indicam ${B}`,
        body: `${kw[6]} e ${kw[2]} consistente são a base de tudo que fazemos em ${C}.` },
    ];
    return variants[v % variants.length];
  },

  curiosidade: (sub, B, C, svc, kw, v) => {
    const variants: SlideTemplate[] = [
      { badge: "VOCÊ SABIA?", title: `O que a maioria não sabe sobre ${sub}`,
        body: `A diferença entre resultado médio e resultado real em ${sub} começa muito antes do que você imagina. Arrasta para entender.` },
      { badge: "FATO REAL",   title: `${sub} pode ser diferente do que você viveu até hoje`,
        body: `Nem todo ${sub} é igual. ${kw[0]} e ${kw[2]} dependem de como cada etapa é conduzida.` },
      { badge: "VALE SABER",  title: `Um fato sobre ${sub} que muda sua perspectiva`,
        body: `Com o profissional certo, ${sub} vai além do básico. É ${kw[2]}, ${kw[3]} e ${kw[6]} ao mesmo tempo.` },
    ];
    return variants[v % variants.length];
  },

  explicacao: (sub, B, C, svc, kw, v) => {
    const variants: SlideTemplate[] = [
      { badge: "COMO FUNCIONA", title: `O processo por trás de ${sub}`,
        body: `Em ${B}, cada etapa de ${sub} é pensada para garantir ${kw[2]} e ${kw[3]} do início ao fim.` },
      { badge: "ETAPA A ETAPA", title: `Veja como ${sub} funciona na prática`,
        listItems: [`Entendemos o que você precisa`, `Planejamento personalizado`, `Execução com ${kw[0]}`, `Resultado verificável`] },
      { badge: "POR DENTRO",    title: `O que envolve ${sub} de verdade`,
        body: `${sub} bem feito exige ${kw[0]}, ${kw[2]} e atenção constante. É isso que ${B} oferece em cada atendimento.` },
    ];
    return variants[v % variants.length];
  },

  vantagem: (sub, B, C, svc, kw, v) => {
    const variants: SlideTemplate[] = [
      { badge: "AS VANTAGENS",  title: `Por que ${sub} na ${B} faz diferença`,
        listItems: [`${kw[6]}`, `${kw[2]} consistente`, `Processo claro e direto`, `Atendimento em ${C}`] },
      { badge: "O QUE MUDA",    title: `As vantagens de ${sub} bem feito`,
        body: `Quando ${sub} é conduzido com ${kw[2]} real, os benefícios vão além do esperado — você percebe na prática.` },
      { badge: "DIFERENÇA REAL",title: `O que você não encontra em qualquer lugar`,
        listItems: [`${kw[0]} acima da média`, `${kw[3]} personalizada`, "Transparência total", `Equipe em ${C}`] },
    ];
    return variants[v % variants.length];
  },

  autoridade_slide: (sub, B, C, svc, kw, v) => {
    const variants: SlideTemplate[] = [
      { badge: "QUEM SOMOS",  title: `${B}: referência em ${sub} em ${C}`,
        body: `Anos de prática e ${kw[6]} formam a base do trabalho da ${B}. Cada cliente percebe a diferença.` },
      { badge: "NOSSA HISTÓRIA",title: `O que construímos com ${sub}`,
        body: `${B} nasceu do compromisso com ${kw[2]} e ${kw[7]}. Isso não mudou desde o primeiro dia.` },
      { badge: "EXPERTISE",   title: `Por que confiar em ${B} para ${sub}`,
        body: `${kw[6]} e ${kw[7]} que se provam na prática. Em ${C}, ${B} é escolha de quem não abre mão de ${kw[2]}.` },
    ];
    return variants[v % variants.length];
  },

  lista: (sub, B, C, svc, kw, v) => {
    const variants: SlideTemplate[] = [
      { badge: "PONTOS CHAVE",    title: `O que realmente importa em ${sub}`,
        listItems: [`${kw[0]} comprovado`, `${kw[2]} real`, `${kw[3]} em cada etapa`, `Atendimento em ${C}`] },
      { badge: "4 PONTOS",        title: `4 coisas que fazem diferença em ${sub}`,
        listItems: [`1. ${kw[0]}`, `2. ${kw[2]}`, `3. ${kw[3]}`, `4. ${kw[6]}`] },
      { badge: "O QUE VOCÊ MERECE",title: `Por que ${sub} precisa dessas características`,
        listItems: [`${kw[6]}`, `${kw[0]} correto`, "Transparência total", "Satisfação garantida"] },
    ];
    return variants[v % variants.length];
  },

  diferencial: (sub, B, C, svc, kw, v) => {
    const badges = ["DIFERENCIAL", "POR QUE A GENTE", `SÓ NA ${B}`];
    const variants: SlideTemplate[] = [
      { badge: badges[0], title: `O que ${B} tem que poucos têm`,
        body: `${kw[6]}, ${kw[2]} e compromisso real com cada cliente. Não é padrão. É escolha.` },
      { badge: badges[1], title: `Por que escolher ${B} para ${sub}`,
        listItems: [`${kw[6]}`, `Localizado em ${C}`, `${kw[0]} verificável`, `Atendimento pelo WhatsApp`] },
      { badge: badges[2], title: `O que você não vai encontrar em outro lugar`,
        body: `${kw[2]} e ${kw[3]} que ${B} entrega em ${C} vêm de uma combinação única de ${kw[0]} e ${kw[7]}.` },
    ];
    return variants[v % variants.length];
  },

  prova_social: (sub, B, C, svc, kw, v) => {
    const variants: SlideTemplate[] = [
      { badge: "NA PRÁTICA",     title: `Clientes que já confiaram na ${B}`,
        body: `Em ${C}, quem escolheu ${B} para ${sub} percebeu a diferença. ${kw[7]} e ${kw[6]} que geram retorno.` },
      { badge: "HISTÓRIAS REAIS",title: `O que quem passou por aqui diz`,
        body: `Cada cliente saiu com mais do que esperava: ${kw[2]}, ${kw[3]} e a segurança de ter escolhido certo.` },
      { badge: "CONFIAM NA GENTE",title: `Por que nossos clientes voltam e indicam`,
        body: `Resultado não é sorte. É ${kw[0]}, ${kw[2]} e ${kw[6]} que ${B} oferece em cada visita.` },
    ];
    return variants[v % variants.length];
  },

  erro: (sub, B, C, svc, kw, v) => {
    const variants: SlideTemplate[] = [
      { badge: "ATENÇÃO",   title: `O erro mais comum em ${sub}`,
        body: `Falta de ${kw[0]} na hora certa. Isso costuma custar mais caro do que parece no início.` },
      { badge: "EVITE ISSO",title: `O que atrapalha seus resultados em ${sub}`,
        body: `${kw[4]} e ${kw[5]} são mais comuns do que deveriam. E têm solução.` },
      { badge: "REALIDADE",  title: `Por que ${sub} não funciona para muita gente`,
        body: `Sem o profissional certo, ${sub} vira decepção. A causa quase sempre está em ${kw[4]} desde o início.` },
    ];
    return variants[v % variants.length];
  },

  causa: (sub, B, C, svc, kw, v) => {
    const variants: SlideTemplate[] = [
      { badge: "A CAUSA",  title: `Por que isso acontece em ${sub}`,
        body: `A raiz do problema em ${sub} quase sempre está na falta de ${kw[0]} e ${kw[6]}. Mas tem como mudar.` },
      { badge: "ENTENDA",  title: `O que está por trás do problema`,
        body: `Sem ${kw[2]} e ${kw[3]} desde o início, ${sub} não entrega o que deveria.` },
      { badge: "ORIGEM",   title: `De onde vem o problema em ${sub}`,
        body: `${kw[4]} no processo inicial gera a maior parte dos problemas. Identificar é o primeiro passo.` },
    ];
    return variants[v % variants.length];
  },

  resultado_slide: (sub, B, C, svc, kw, v) => {
    const variants: SlideTemplate[] = [
      { badge: "RESULTADO",      title: `O que muda quando ${sub} é feito certo`,
        body: `Com ${kw[2]} real e ${kw[0]} correto, ${sub} entrega exatamente o que você precisava desde o início.` },
      { badge: "TRANSFORMAÇÃO",  title: `A diferença que você vai sentir`,
        body: `${kw[2]} que você vê, ${kw[3]} que você sente. Isso é ${sub} feito com ${kw[6]}.` },
      { badge: "ANTES E DEPOIS", title: `O impacto de ${sub} feito corretamente`,
        body: `Quem passou pelo processo certo em ${B} saiu com mais ${kw[2]}, mais clareza e mais confiança.` },
    ];
    return variants[v % variants.length];
  },

  identidade: (sub, B, C, svc, kw, v) => {
    const variants: SlideTemplate[] = [
      { badge: "QUEM SOMOS",     title: `${B} — ${sub} em ${C}`,
        body: `Uma equipe dedicada a entregar ${kw[2]} e ${kw[3]} de qualidade. Do atendimento à execução, tudo planejado pra você.` },
      { badge: "NOSSA MISSÃO",   title: `Por que ${B} existe`,
        body: `Nascemos do compromisso com ${kw[2]} real em ${sub}. Em ${C}, somos referência para quem não abre mão de ${kw[6]}.` },
      { badge: "CONHEÇA A GENTE",title: `${B}: quem são, o que fazem, onde estão`,
        listItems: [`Especializados em ${sub}`, `Localizados em ${C}`, `${kw[6]}`, `Agendamento pelo WhatsApp`] },
    ];
    return variants[v % variants.length];
  },

  oferta: (sub, B, C, svc, kw, v) => {
    const variants: SlideTemplate[] = [
      { badge: "OFERTA",      title: `Condição especial em ${sub} — por tempo limitado`,
        body: `${B} preparou uma oportunidade real para você. Disponível em ${C} pelo WhatsApp enquanto durar.` },
      { badge: "OPORTUNIDADE",title: `${sub} com condições que valem aproveitar agora`,
        body: `Essa janela em ${sub} não vai durar. Chame no WhatsApp e garanta sua condição antes que feche.` },
      { badge: "ESPECIAL",    title: `O melhor momento para ${sub}`,
        body: `Condições exclusivas em ${C}. ${B} está com disponibilidade limitada. Aproveite agora.` },
    ];
    return variants[v % variants.length];
  },
};

// ─── CTA by objective ─────────────────────────────────────────

const CTA_BY_OBJECTIVE: Record<CarouselObjective, string[]> = {
  vender:    ["Chame no WhatsApp e solicite agora", "Fale com a gente e garanta o seu", "Chame agora e saiba mais"],
  educar:    ["Ficou com dúvida? Chame no WhatsApp", "Quer saber mais? É só chamar", "Converse com a gente"],
  promocao:  ["Aproveite — chame agora no WhatsApp", "Garanta sua condição pelo WhatsApp", "Chame antes que acabe"],
  servico:   ["Agende pelo WhatsApp", "Chame e marque seu horário", "Solicite pelo WhatsApp"],
  autoridade:["Fale com quem entende do assunto", "Chame no WhatsApp para conversar", "Converse com especialista"],
  whatsapp:  ["Chame agora no WhatsApp", "É só mandar mensagem", "Atendimento direto pelo WhatsApp"],
  recuperar: ["A gente te espera — chame agora", "Volte e fale com a gente", "Retome seu atendimento"],
  novidade:  ["Chame e conheça a novidade", "Descubra mais pelo WhatsApp", "Fique por dentro — chame agora"],
  duvidas:   ["Ficou com dúvida? Chame no WhatsApp", "Tire suas dúvidas na hora", "Converse com a gente agora"],
};

// ─── Input interpretation ─────────────────────────────────────

const META_PREFIXES: RegExp[] = [
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
  /^promo[çc][aã]o\s+(?:de|do|da|dos|das)?\s*/i,
  /^dica\s+(?:de|sobre|para)?\s*/i,
  /^(?:algo\s+)?sobre\s+/i,
  /^(?:meu|minha|nosso|nossa)\s+/i,
];

function extractCleanSubject(topic: string, mainService: string): string {
  let s = topic.trim();
  let changed = true;
  while (changed) {
    changed = false;
    for (const rx of META_PREFIXES) {
      const next = s.replace(rx, "").trim();
      if (next.length >= 3 && next !== s) { s = next; changed = true; break; }
    }
  }
  s = s.replace(/\s+/g, " ").replace(/[.,!?;:]+$/, "").trim();
  return s.length >= 3 ? s : mainService;
}

// ─── Caption hooks and WA messages by angle ───────────────────

const CAPTION_HOOKS: Record<AngleId, string[]> = {
  confianca: [
    "{sub}: quando é feito com cuidado real, você percebe a diferença. Arrasta.",
    "Confiança em {sub} começa com o profissional certo. Veja o que {B} entrega.",
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
    "O diferencial de {B} em {sub} está em cada detalhe. Desliza para conferir.",
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

const WA_MESSAGES: Record<AngleId, string[]> = {
  confianca: [
    "Olá! Vi o conteúdo sobre {sub} e gostaria de saber mais.",
    "Oi! Vim pelo Instagram. O post sobre {sub} me convenceu. Quero conversar.",
    "Olá, vim pelo Instagram! Quero saber mais sobre {sub}.",
  ],
  educativo: [
    "Olá! O conteúdo sobre {sub} foi muito útil. Tenho interesse em saber mais.",
    "Oi! Vi o post explicando {sub} e fiquei com interesse. Como funciona?",
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
    "Olá! O post sobre {sub} me inspirou bastante. Quero saber como posso começar.",
    "Oi! Vi o conteúdo sobre {sub} e quero dar esse passo. Me conta mais.",
    "Olá! Vim pelo Instagram. O post sobre {sub} me motivou a entrar em contato.",
  ],
};

// ─── Planning ─────────────────────────────────────────────────

interface CarouselPlan {
  cleanSubject: string;
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
}

function planCarouselContent(
  topic: string,
  objective: CarouselObjective,
  niche: NicheKey,
  businessName: string,
  city: string,
  mainService: string,
  targetCount: number
): CarouselPlan {
  const cleanSubject = extractCleanSubject(topic, mainService);
  const seed = topic + businessName + objective;

  // Angle: picked deterministically from the pool for this objective
  const availableAngles = ANGLES_BY_OBJECTIVE[objective];
  const angle = availableAngles[variationIndex(seed, availableAngles.length)];

  // Structure: picked independently from angle
  const availableStructures = STRUCTURES_BY_OBJECTIVE[objective];
  const structureId = availableStructures[variationIndex(seed + "s", availableStructures.length)];
  const structureRoles = STRUCTURES[structureId];

  // Base variation (0-2) drives which content variant to use
  const baseVariation = variationIndex(seed + "v", 3);

  // Keywords
  const keywords = NICHE_KW[niche];

  // Cover
  const coverTitlePool = COVER_TITLES[angle];
  const coverTitle = coverTitlePool[variationIndex(seed + "ct", coverTitlePool.length)]
    .replace(/{sub}/g, cleanSubject).replace(/{B}/g, businessName);

  const coverSubPool = COVER_SUBTITLES[angle];
  const coverSubtitle = coverSubPool[variationIndex(seed + "cs", coverSubPool.length)];

  // Carousel title (slightly different from cover title)
  const altIdx = (variationIndex(seed + "ct", coverTitlePool.length) + 1) % coverTitlePool.length;
  const carouselTitle = coverTitlePool[altIdx]
    .replace(/{sub}/g, cleanSubject).replace(/{B}/g, businessName);

  // Content roles — scale to targetCount - 2, cycling if needed
  const contentCount = Math.max(1, targetCount - 2);
  const contentRoles: SlideRole[] = [];
  for (let i = 0; i < contentCount; i++) contentRoles.push(structureRoles[i % structureRoles.length]);

  // CTA
  const ctaPool = CTA_BY_OBJECTIVE[objective];
  const ctaText = ctaPool[variationIndex(seed + "cta", ctaPool.length)];

  // Caption
  const capPool = CAPTION_HOOKS[angle];
  const captionHook = capPool[variationIndex(seed + "cap", capPool.length)]
    .replace(/{sub}/g, cleanSubject).replace(/{B}/g, businessName);

  // WhatsApp
  const waPool = WA_MESSAGES[angle];
  const waMessage = waPool[variationIndex(seed + "wa", waPool.length)]
    .replace(/{sub}/g, cleanSubject).replace(/{B}/g, businessName);

  return {
    cleanSubject, angle, structure: structureId, keywords, baseVariation,
    carouselTitle, coverTitle, coverSubtitle, contentRoles, ctaText, captionHook, waMessage,
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
  const { topic, objective, niche: nicheRaw, businessName, city, mainService,
          whatsapp, selectedImages, slideImagesMap, visualStyle, format } = input;

  const targetCount = Math.min(8, Math.max(4, input.slideCount ?? 6));
  const hasImages = selectedImages.length > 0 || (slideImagesMap && Object.keys(slideImagesMap).length > 0);
  const niche = nicheKey(nicheRaw);

  const plan = planCarouselContent(topic, objective, niche, businessName, city, mainService, targetCount);
  const { cleanSubject, keywords, baseVariation, coverTitle, coverSubtitle, contentRoles, ctaText } = plan;

  // Build slide templates from plan
  const templates: SlideTemplate[] = [];

  // Cover
  templates.push({
    badge: NICHE_COVER_BADGE[niche],
    title: coverTitle,
    subtitle: coverSubtitle,
  });

  // Content slides — vary content within the carousel via (baseVariation + i)
  contentRoles.forEach((role, i) => {
    const fn = ROLE_FNS[role];
    if (fn) templates.push(fn(cleanSubject, businessName, city, mainService, keywords, (baseVariation + i) % 3));
  });

  // CTA slide
  templates.push({ badge: "CTA", title: ctaText, cta: ctaText });

  // Assemble slides
  const layouts = layoutsForStyle(visualStyle, !!hasImages, templates.length);
  const imageMap = assignImages(selectedImages, templates.length, slideImagesMap);
  const opacities = OVERLAY_OPACITY[visualStyle];

  const slides: PremiumCarouselSlide[] = templates.map((t, i) => {
    const layout = layouts[i] ?? (i === templates.length - 1 ? "cta_final" : "content_list");
    const overlayOpacity =
      layout === "cover_hero"    ? opacities.cover   :
      layout === "image_overlay" ? opacities.overlay :
      layout === "card_glass"    ? opacities.card    : 0;

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
      bgVariant: bgForLayout(layout, i),
    };
  });

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
  };
}
