import { NICHE_CONFIG } from "./niche-config";
import {
  interpretMagneticRequest,
  generateMagneticNarratives,
  generateContextualKeywords,
  type RefinementMode,
  type MagneticInterpretation,
} from "./magnetic-engine";
import type {
  Narrative,
  ReelsScript,
  CarouselContent,
  StorySequence,
  ContentFormat,
  MagneticInterpretation as MagneticInterpretationType,
} from "@/types";

export type { RefinementMode };
export type { MagneticInterpretation };

export interface ContentInput {
  topic: string;
  niche: string;
  businessName: string;
  city: string;
  mainService: string;
  whatsapp: string;
  narrative?: string;
  headline?: string;
  plan?: "essencial" | "pro";
  variationSeed?: number;
  refinementMode?: RefinementMode;
  services?: string[];
  shortDescription?: string;
  targetAudience?: string;
  goals?: string[];
}

// ─── Variação com seed externo + fallback aleatório ──────────
function variationIndex(seed: string, count: number, externalSeed?: number): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h) ^ seed.charCodeAt(i);
    h = h & h;
  }
  const base = Math.abs(h) % count;
  if (externalSeed !== undefined) {
    return (base + externalSeed) % count;
  }
  return base;
}

// ─── Detecta key do tópico para seleção de templates ─────────
function detectTopicKey(topic: string): string {
  const lower = topic.toLowerCase();
  if (/promo[çc][aã]o|oferta|desconto|especial/.test(lower)) return "promoção";
  if (/agenda|hor[aá]rio|vaga|reserv|agendar/.test(lower)) return "agenda";
  if (/dica|como\s|por\s+que|segredo|erro|cuidado/.test(lower)) return "dica";
  if (/bastidor|por\s+tr[aá]s|rotina\s+da/.test(lower)) return "bastidores";
  if (/depoimento|avalia[çc][aã]o|antes\s+e\s+depois|resultado\s+real/.test(lower)) return "depoimento";
  if (/lan[çc]amento|novidade|chegou\s|novo\s+servi[çc]o/.test(lower)) return "lançamento";
  if (/produto|pe[çc]a|item\s|artigo/.test(lower)) return "produto";
  return "default";
}

// ─── Gera narrativas magnéticas reais ────────────────────────

function getNarratives(input: ContentInput): Narrative[] {
  const interpretation = interpretMagneticRequest({
    userInput: input.topic,
    businessName: input.businessName,
    niche: input.niche,
    city: input.city,
    mainService: input.mainService,
    services: input.services,
    shortDescription: input.shortDescription,
    refinementMode: input.refinementMode,
  });

  const seed = input.variationSeed ?? Math.floor(Math.random() * 1000);
  const fullNarratives = generateMagneticNarratives({
    interpretation,
    businessName: input.businessName,
    city: input.city,
    mainService: input.mainService,
    niche: input.niche,
    variationSeed: seed,
    refinementMode: input.refinementMode,
  });

  // Converte FullNarrative → Narrative (retrocompatível + campos estendidos)
  return fullNarratives.map(n => ({
    title: n.title,
    angle: n.angle,
    description: n.description,
    tipo: n.tipo,
    gancho: n.gancho,
    dor: n.dor,
    desejo: n.desejo,
    promessa: n.promessa,
    formatos: n.formatos,
    cta: n.cta,
    exemplo: n.exemplo,
  }));
}

// ─── Interpreta e retorna contexto completo ───────────────────

export function getInterpretation(input: ContentInput): MagneticInterpretationType {
  return interpretMagneticRequest({
    userInput: input.topic,
    businessName: input.businessName,
    niche: input.niche,
    city: input.city,
    mainService: input.mainService,
    services: input.services,
    shortDescription: input.shortDescription,
    refinementMode: input.refinementMode,
  }) as unknown as MagneticInterpretationType;
}

// ─── Headlines contextuais e variadas ────────────────────────

function getHeadlines(input: ContentInput): string[] {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const interpretation = interpretMagneticRequest({
    userInput: input.topic,
    businessName: input.businessName,
    niche: input.niche,
    city: input.city,
    mainService: input.mainService,
    services: input.services,
    shortDescription: input.shortDescription,
  });
  const { temaInterpretado: subject, intencaoUsuario } = interpretation;
  const rawTopicKey = detectTopicKey(input.topic);
  // Usa a intenção detectada para selecionar o pool certo — mais preciso que só o topicKey
  const intentToKey: Partial<Record<string, string>> = {
    "agenda aberta": "agenda",
    "promoção": "promoção",
    "bastidores": "bastidores",
    "prova social": "depoimento",
    "lançamento": "lançamento",
    "dica educativa": "dica",
    "produto": "produto",
  };
  const topicKey = intentToKey[intencaoUsuario] ?? rawTopicKey;
  const name = input.businessName;
  const city = input.city;

  const headlineVariants: Record<string, string[][]> = {
    promoção: [
      [
        `Condição especial para ${subject} — só essa semana`,
        `Essa oportunidade de ${subject} não vai se repetir tão cedo`,
        `${name} com oferta especial para ${subject}`,
        `Clientes da ${name} já estão aproveitando — você ainda vai esperar?`,
        `${subject} com condição especial — chame a ${name} agora`,
      ],
      [
        `Não deixe para depois: ${subject} com condição especial agora`,
        `${name} lançou uma oferta para ${subject} que encerra em breve`,
        `Por que esperar? ${name} tem condição diferenciada agora`,
        `Economize em ${subject} em ${city} — oferta por tempo limitado`,
        `Essa promoção da ${name} vai encerrar — garanta já`,
      ],
      [
        `Última chamada: condição especial de ${subject} na ${name}`,
        `${subject} por uma condição que você não esperava — só hoje`,
        `Oferta disponível essa semana na ${name} em ${city}`,
        `Chame agora e aproveite enquanto tem`,
        `${name} em ${city}: oportunidade especial para ${subject}`,
      ],
    ],
    agenda: [
      [
        `${name} está com agenda aberta essa semana`,
        `Tem horário disponível para você — chame agora`,
        `Se você estava esperando para marcar, esse é o momento`,
        `Agenda aberta para novos atendimentos em ${city}`,
        `Reserve seu horário antes de lotar`,
      ],
      [
        `Novos horários abertos — não espere lotar`,
        `Atendimento disponível essa semana na ${name}`,
        `${city}: vagas abertas, é só chamar no WhatsApp`,
        `Agenda com espaço pra você — por essa semana`,
        `Não deixa pra depois: tem vaga disponível agora`,
      ],
      [
        `Você ainda não marcou esse mês? Ainda tem vaga`,
        `Um WhatsApp garante seu horário na ${name}`,
        `Essa semana: atendimento disponível em ${city}`,
        `Agenda aberta. Chame antes de lotar.`,
        `${name} com horário disponível pra você agora`,
      ],
    ],
    dica: [
      [
        `3 sinais de que está na hora de cuidar de ${subject}`,
        `O erro que faz muita gente adiar ${subject}`,
        `O que ninguém te conta sobre ${subject} em ${city}`,
        `Por que ignorar ${subject} pode sair caro depois`,
        `Como escolher o melhor profissional de ${subject} em ${city}`,
      ],
      [
        `${subject}: o que você precisa saber antes de decidir`,
        `Evite esses erros comuns relacionados a ${subject}`,
        `Dica de quem entende: como aproveitar melhor ${subject}`,
        `Por que ${subject} faz diferença no seu resultado`,
        `A verdade sobre ${subject} que muita gente desconhece`,
      ],
      [
        `Como ${subject} pode mudar seus resultados em ${city}`,
        `Antes de contratar ${subject}: leia isso primeiro`,
        `${subject} certo vs. errado — você sabe a diferença?`,
        `O que influencia mais no resultado de ${subject}`,
        `Checklist: o que avaliar em um bom serviço de ${subject}`,
      ],
    ],
    bastidores: [
      [
        `Os bastidores de ${subject} que você nunca viu`,
        `Por trás de ${subject}: como funciona de verdade na ${name}`,
        `A rotina real de ${subject} — sem filtro`,
        `O que acontece antes do resultado em ${subject}`,
        `Mostrando o processo real de ${subject} na ${name}`,
      ],
      [
        `Bastidores: veja como ${subject} é feito na ${name}`,
        `A verdade por trás de ${subject} — e por que faz diferença`,
        `${name} abre os bastidores de ${subject}`,
        `Você sabia que ${subject} envolve tudo isso?`,
        `O processo real de ${subject}: da preparação ao resultado`,
      ],
    ],
    depoimento: [
      [
        `O que nossos clientes dizem sobre ${subject} na ${name}`,
        `Resultado real: transformações com ${subject} em ${city}`,
        `Por que clientes recomendam ${subject} na ${name}`,
        `Antes e depois: veja a diferença que ${subject} faz`,
        `Avaliações reais de quem já fez ${subject} na ${name}`,
      ],
      [
        `Depoimento real: como ${subject} mudou a experiência do cliente`,
        `Quem já fez ${subject} na ${name} voltaria de novo?`,
        `${name}: resultados reais em ${subject} em ${city}`,
        `Transformação com ${subject} — histórias reais`,
        `Clientes satisfeitos com ${subject} na ${name}`,
      ],
    ],
    lançamento: [
      [
        `Novidade: ${subject} agora disponível na ${name}`,
        `Chegou: ${subject} para você em ${city}`,
        `${name} apresenta: ${subject}`,
        `Novo: ${subject} com a qualidade que você já conhece`,
        `Acabou de chegar: ${subject} na ${name}`,
      ],
      [
        `Lançamento: ${subject} na ${name} em ${city}`,
        `${name} agora oferece ${subject} — conheça`,
        `Você pediu e chegou: ${subject} disponível agora`,
        `${subject}: novo na ${name}, mesma qualidade de sempre`,
        `${city}: ${subject} disponível na ${name}`,
      ],
    ],
    produto: [
      [
        `${subject}: conheça tudo sobre esse produto`,
        `Por que ${subject} está entre os mais procurados na ${name}`,
        `${subject} disponível na ${name} em ${city}`,
        `Como ${subject} pode fazer diferença para você`,
        `${subject} com qualidade garantida — ${name}`,
      ],
    ],
    default: [
      [
        `${subject} em ${city}: o que você precisa saber`,
        `Por que a ${name} é referência em ${subject}`,
        `O que muda quando você escolhe ${subject} com qualidade`,
        `${name} em ${city} — ${cfg.cta}`,
        `Você já conhece o trabalho da ${name} com ${subject}?`,
      ],
      [
        `${name}: qualidade em ${subject} que os clientes recomendam`,
        `Descubra por que clientes voltam sempre para a ${name}`,
        `${subject} de verdade: veja o que a ${name} entrega`,
        `Em ${city}, quem busca ${subject} de qualidade vai para a ${name}`,
        `O diferencial que faz a ${name} se destacar em ${subject}`,
      ],
      [
        `${subject} que faz a diferença — conheça a ${name}`,
        `Para ${subject} em ${city}, a escolha certa é a ${name}`,
        `Como a ${name} mudou a experiência de ${subject} em ${city}`,
        `Qualidade, confiança e resultado: ${subject} na ${name}`,
        `O próximo passo certo em ${subject} é a ${name}`,
      ],
    ],
  };

  const variants = headlineVariants[topicKey] ?? headlineVariants.default;
  const seed = `${input.topic}${input.niche}${input.businessName}`;
  const idx = variationIndex(seed, variants.length, input.variationSeed);
  return variants[idx];
}

// ─── Vocabulário específico por nicho ─────────────────────────

const NICHE_VOCAB: Record<string, {
  oque_faz: string;
  o_resultado: string;
  o_processo: string;
  chamar: string;
  trabalho: string;
  profissional: string;
}> = {
  advogacia:         { oque_faz: "presta assessoria jurídica",           o_resultado: "seus direitos garantidos",               o_processo: "análise do caso, estratégia e acompanhamento",          chamar: "agendar uma consulta",        trabalho: "caso",         profissional: "advogado"            },
  barbearia:         { oque_faz: "faz cortes e acabamentos profissionais",o_resultado: "visual impecável e autoconfiança",        o_processo: "conversa, técnica e atenção a cada detalhe",            chamar: "agendar seu horário",         trabalho: "corte",        profissional: "barbeiro"            },
  odontologia:       { oque_faz: "cuida do seu sorriso",                  o_resultado: "sorriso saudável e bonito",               o_processo: "avaliação, tratamento e cuidado contínuo",              chamar: "agendar avaliação",           trabalho: "tratamento",   profissional: "dentista"            },
  estetica:          { oque_faz: "realiza tratamentos estéticos",         o_resultado: "pele renovada e autoestima elevada",      o_processo: "avaliação da pele, tratamento personalizado e cuidado", chamar: "agendar seu atendimento",     trabalho: "tratamento",   profissional: "esteticista"         },
  "personal-trainer":{ oque_faz: "prescreve e acompanha treinos",         o_resultado: "corpo e saúde que você quer",             o_processo: "avaliação física, planejamento e acompanhamento real",  chamar: "começar seu acompanhamento",  trabalho: "treino",       profissional: "personal trainer"    },
  restaurante:       { oque_faz: "prepara refeições com cuidado",         o_resultado: "refeição gostosa e nutritiva",            o_processo: "ingredientes frescos, preparo com cuidado e entrega",   chamar: "fazer seu pedido",            trabalho: "prato",        profissional: "chef"                },
  mecanica:          { oque_faz: "faz revisão e manutenção do seu carro", o_resultado: "carro revisado e segurança na estrada",   o_processo: "diagnóstico honesto, orçamento e execução",             chamar: "agendar sua revisão",         trabalho: "revisão",      profissional: "mecânico"            },
  imobiliaria:       { oque_faz: "encontra e negocia imóveis",            o_resultado: "imóvel ideal com segurança total",        o_processo: "busca, avaliação e negociação segura",                  chamar: "falar com um corretor",       trabalho: "negociação",   profissional: "corretor"            },
  otica:             { oque_faz: "cuida da sua visão",                    o_resultado: "enxergar bem com conforto real",          o_processo: "exame de vista, escolha da armação e ajuste perfeito",  chamar: "fazer seu exame",             trabalho: "exame",        profissional: "ótico"               },
  "loja-roupa":      { oque_faz: "vende roupas e acessórios selecionados",o_resultado: "look que te dá confiança",                o_processo: "curadoria de moda e atendimento personalizado",          chamar: "ver as novidades",            trabalho: "look",         profissional: "consultora de moda"  },
  serralheria:       { oque_faz: "fabrica e instala portões e grades",    o_resultado: "portão bonito, seguro e durável",         o_processo: "orçamento, fabricação própria e instalação profissional",chamar: "pedir seu orçamento",         trabalho: "portão",       profissional: "serralheiro"         },
  "clinica-medica":  { oque_faz: "realiza consultas e acompanhamento médico", o_resultado: "saúde monitorada e qualidade de vida", o_processo: "consulta, exames e acompanhamento contínuo",           chamar: "marcar sua consulta",         trabalho: "consulta",     profissional: "médico"              },
  psicologia:        { oque_faz: "acompanha a saúde mental",              o_resultado: "equilíbrio emocional e bem-estar",        o_processo: "escuta, acolhimento e acompanhamento psicológico",      chamar: "agendar sua sessão",          trabalho: "sessão",       profissional: "psicóloga"           },
  contabilidade:     { oque_faz: "cuida da contabilidade da sua empresa", o_resultado: "empresa regularizada pagando menos imposto", o_processo: "análise, regularização e acompanhamento contábil",   chamar: "falar com um contador",       trabalho: "análise",      profissional: "contador"            },
  outro:             { oque_faz: "atende com qualidade e profissionalismo",o_resultado: "o resultado que você espera",            o_processo: "atenção individualizada e comprometimento",              chamar: "entrar em contato",           trabalho: "atendimento",  profissional: "profissional"        },
};

// ─── Openers por nicho — falam com o PÚBLICO, não sobre o negócio ──

// Cada nicho tem 3 openers (um por variante de roteiro).
// Os openers descrevem a SITUAÇÃO do público, nunca o que o negócio quer divulgar.
const NICHE_OPENERS: Record<string, [string, string, string]> = {
  barbearia: [
    "Você está naquele ponto em que o cabelo ou a barba já pede um jeito — e você sabe disso.",
    "Quantas vezes essa semana você olhou no espelho e pensou: preciso ir cortar.",
    "Você sabe quando está na hora de se cuidar. E sabe que está na hora.",
  ],
  odontologia: [
    "Quando foi a última vez que você foi ao dentista de verdade — não do jeito que fica adiando, de verdade?",
    "Tem aquela dorzinha, aquela sensibilidade, aquele incômodo que você vai deixando para depois?",
    "Você está no grupo de quem sabe que precisava marcar consulta há meses — mas não marcou?",
  ],
  advogacia: [
    "Você tem alguma situação jurídica que está pesando e você ainda não tomou uma atitude?",
    "Tem algum problema jurídico que você guarda porque acha que é complicado demais ou caro demais resolver?",
    "Você está em uma situação de conflito — trabalhista, familiar, contratual — e não sabe por onde começar?",
  ],
  estetica: [
    "Você está se cuidando do jeito que merece — ou sempre vai deixando pra depois?",
    "Quanto tempo faz que você fez algo só pra você mesmo — um cuidado real, sem pressa?",
    "Você está no modo de: quando tiver tempo, me cuido. E o tempo não vem.",
  ],
  psicologia: [
    "Tem alguma coisa que você precisa falar — mas não encontrou o lugar certo ainda?",
    "Você está carregando algo sozinho que seria muito mais leve com apoio?",
    "Você já pensou em buscar acompanhamento, mas ficou com aquela dúvida de se realmente precisa?",
  ],
  "personal-trainer": [
    "Seus treinos estão te dando o resultado que você queria — ou você sente que algo está faltando?",
    "Você começou o ano com uma meta de saúde e está longe de onde queria estar agora?",
    "Você treina, mas sem evolução real? Isso tem uma explicação.",
  ],
  mecanica: [
    "Quando foi a última revisão do seu carro? Você sabe isso de cabeça?",
    "Seu carro está te mandando sinal — aquele barulhinho, aquela estranheza — e você vai ignorando?",
    "Carro com manutenção atrasada é risco na estrada. Você sabe disso, mas fica adiando.",
  ],
  contabilidade: [
    "Você sabe exatamente quanto de imposto está pagando — e se está correto?",
    "Você está no final do mês perguntando pra onde foi o dinheiro e a contabilidade não responde?",
    "Sua empresa está regularizada do jeito que deveria estar — ou tem coisa pendente que você prefere não pensar?",
  ],
  "clinica-medica": [
    "Você está no modo reativo com a saúde — só vai ao médico quando algo dói?",
    "Quando foi seu último check-up de verdade? Não emergência — check-up preventivo.",
    "Você tem algum sintoma que está ignorando porque acha que vai passar sozinho?",
  ],
  serralheria: [
    "Você ainda está adiando aquele portão, aquela grade ou aquela estrutura que precisava de atenção?",
    "Portão que não fecha direito, grade enferrujada — você convive com isso há quanto tempo?",
    "Segurança e estética da sua entrada começam no portão. O seu está do jeito que você quer?",
  ],
  "loja-roupa": [
    "Você abre o guarda-roupa e não sabe o que usar — mesmo tendo um monte de coisa?",
    "Tem aquela peça que você passa na frente toda semana e não compra. Esse momento chegou.",
    "Seu estilo está onde você quer que esteja — ou você está no modo repetição?",
  ],
  imobiliaria: [
    "Você está esperando o momento certo para comprar, vender ou alugar — mas não sabe quando esse momento chega?",
    "Você está pagando aluguel e pensa que devia estar construindo patrimônio?",
    "Tem um imóvel que você quer, mas não sabe se o mercado está favorável agora?",
  ],
  restaurante: [
    "Você está no modo de comer a mesma coisa todo dia e quer uma opção boa de verdade?",
    "Tem aquele momento do almoço em que você não sabe o que pedir e nada parece apetitoso?",
    "Você está procurando um lugar pra comer de verdade — com sabor real e sem enrolação?",
  ],
};

const GENERIC_OPENERS: [string, string, string] = [
  "Você tem algo que precisa resolver mas fica deixando para depois?",
  "Quanto tempo faz que você está pensando nisso — e ainda não tomou uma atitude?",
  "Você já sabe que precisa. Só está esperando um motivo para agir agora.",
];

// ─── Roteiro específico: Agenda Aberta ────────────────────────

function getAgendaAbertaReels(
  input: ContentInput,
  vocab: { trabalho: string; o_resultado: string; oque_faz: string; chamar: string },
  name: string,
  city: string,
  cfg: { cta: string },
): ReelsScript {
  const seed = `${input.topic}${input.narrative ?? ""}${input.headline ?? ""}`;
  const v = variationIndex(seed, 3, input.variationSeed);
  const openers = NICHE_OPENERS[input.niche] ?? GENERIC_OPENERS;
  const headline = input.headline ?? `${name} em ${city} — essa semana tem horário`;

  const roteiros: ReelsScript[] = [
    // Variante 1 — Abre com a situação do público, não com o anúncio do negócio
    {
      title: headline,
      gancho: `Abrir com a realidade do público cria identificação imediata — quem está nessa situação para de rolar`,
      duracaoTotal: "25–35 segundos",
      vibeEdicao: "Conversa direta — olhar na câmera o tempo todo. Sem muitos cortes, tom de pessoa real falando",
      musicaSugerida: "Lo-fi suave de fundo — discreto, não compete com a fala",
      scenes: [
        {
          scene: 1,
          duracao: "0–6s",
          description: "Olhe direto para câmera como se estivesse falando com uma pessoa específica. Tom de quem entende a situação.",
          fala: openers[0],
          textoNaTela: `Esse vídeo é pra você 👀`,
        },
        {
          scene: 2,
          duracao: "7–20s",
          description: "Continue o raciocínio — explique a solução de forma natural, sem anunciar.",
          fala: `Essa semana a ${name} está com atendimento disponível em ${city}. A gente ${vocab.oque_faz} com atenção real a cada caso — e o processo é simples, sem burocracia.`,
          textoNaTela: `${name} · ${city} · Disponível agora`,
        },
        {
          scene: 3,
          duracao: "21–28s",
          description: "Tom de consequência positiva — o que muda quando a pessoa age.",
          fala: `${vocab.o_resultado} começa com um WhatsApp. É isso que separa quem resolve de quem continua esperando.`,
          textoNaTela: `${vocab.o_resultado} ✅`,
        },
        {
          scene: 4,
          duracao: "29–34s",
          description: "Aponte para baixo — sorrindo com confiança.",
          fala: `Chama agora — link na bio.`,
          textoNaTela: `👇 WhatsApp na bio`,
        },
      ],
      screen_text: `${name} em ${city}`,
      caption: `${openers[0]} Essa semana a ${name} tem atendimento disponível em ${city}. Um WhatsApp resolve — chame agora 👇`,
      cta: cfg.cta,
      whatsapp_message: `Olá! Vi o vídeo e quero ${vocab.chamar}.`,
    },
    // Variante 2 — Consequência de deixar para depois
    {
      title: headline,
      gancho: `Mostrar o que acontece quando se adia cria urgência genuína sem ser alarmista`,
      duracaoTotal: "25–35 segundos",
      vibeEdicao: "Ritmo médio — 1 corte no meio. Começa sério e termina com leveza",
      musicaSugerida: "Beat discreto com progressão — sobe de intensidade no meio",
      scenes: [
        {
          scene: 1,
          duracao: "0–6s",
          description: "Expressão séria mas acolhedora — como quem vai dar um conselho honesto.",
          fala: openers[1],
          textoNaTela: `Isso acontece com mais gente do que você imagina 🤔`,
        },
        {
          scene: 2,
          duracao: "7–20s",
          description: "Explique o que acontece quando se adia — sem drama, com honestidade.",
          fala: `Quando a gente vai deixando, o problema vai crescendo. E o que era simples de resolver, vira algo bem maior. A ${name} está aqui em ${city} pra que isso não aconteça com você — com atendimento disponível essa semana.`,
          textoNaTela: `Resolver cedo é sempre melhor 💡`,
        },
        {
          scene: 3,
          duracao: "21–27s",
          description: "Tom de solução — positivo e direto.",
          fala: `${vocab.oque_faz} com cuidado real. E essa semana tem espaço pra você.`,
          textoNaTela: `Essa semana tem horário ✅`,
        },
        {
          scene: 4,
          duracao: "28–34s",
          description: "Sorriso e CTA direto.",
          fala: `Chama no WhatsApp agora — a gente atende rápido.`,
          textoNaTela: `👇 WhatsApp na bio`,
        },
      ],
      screen_text: `${name} em ${city} — essa semana`,
      caption: `Adiar só complica. Essa semana a ${name} tem atendimento disponível em ${city}. Chame no WhatsApp agora 👇`,
      cta: cfg.cta,
      whatsapp_message: `Olá ${name}! Vi o vídeo e quero marcar essa semana.`,
    },
    // Variante 3 — Fala diretamente com quem já sabe que precisa
    {
      title: headline,
      gancho: `Falar com quem já decidiu mas não agiu ainda — elimina a barreira do próximo passo`,
      duracaoTotal: "25–35 segundos",
      vibeEdicao: "Casual e conversacional — como uma conversa entre conhecidos. Sem produção excessiva",
      musicaSugerida: "Lofi ou instrumental leve — quase imperceptível de fundo",
      scenes: [
        {
          scene: 1,
          duracao: "0–6s",
          description: "Tom levemente irônico e acolhedor — como quem conhece a pessoa.",
          fala: openers[2],
          textoNaTela: `Você já sabe. Agora vai? 👀`,
        },
        {
          scene: 2,
          duracao: "7–20s",
          description: "Apresente a solução como se fosse óbvio — sem convencer demais.",
          fala: `A ${name} está com horário disponível essa semana em ${city}. Você chama no WhatsApp, a gente organiza tudo e te atende. Sem fila, sem espera, sem complicação.`,
          textoNaTela: `Sem fila · Sem espera · ${name}`,
        },
        {
          scene: 3,
          duracao: "21–28s",
          description: "Tom de quem está facilitando a decisão.",
          fala: `Um WhatsApp é tudo que você precisa pra sair do pensando e ir pro resolvido.`,
          textoNaTela: `Do pensando pro resolvido 💪`,
        },
        {
          scene: 4,
          duracao: "29–34s",
          description: "Sorriso e aponta para baixo.",
          fala: `Link na bio — chama agora.`,
          textoNaTela: `👇 WhatsApp na bio`,
        },
      ],
      screen_text: `${name} em ${city} — sem fila, sem espera`,
      caption: `Você já sabe que precisa. A ${name} tem horário disponível essa semana em ${city}. É só chamar no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Oi ${name}! Vi o vídeo. Quero ${vocab.chamar} essa semana.`,
    },
  ];

  return roteiros[v % roteiros.length];
}

// ─── Roteiro específico: Tema Livre ───────────────────────────

function getFreeThemeReels(input: ContentInput, name: string, city: string): ReelsScript {
  const rawInput = input.topic.toLowerCase();
  const headline = input.headline ?? input.topic;

  // Detecta o assunto específico do tema livre
  let assunto = input.topic;
  let ctaMsg = "Me chama no WhatsApp para mais informações.";
  let gancho = "Falar de algo fora do contexto do negócio de forma direta e pessoal";

  if (/carro|ve[íi]culo|autom[oó]vel/.test(rawInput)) {
    assunto = "carro";
    ctaMsg = "Me chama no WhatsApp para saber o valor e mais detalhes.";
    gancho = "Quem está procurando um carro bem cuidado vai parar ao ver esse início";
  } else if (/moto[çc]icleta?|moto\b/.test(rawInput)) {
    assunto = "moto";
    ctaMsg = "Me chama no WhatsApp para saber o valor e mais detalhes.";
    gancho = "Quem está procurando moto para comprar vai prestar atenção imediata";
  }

  return {
    title: headline,
    gancho,
    duracaoTotal: "25–35 segundos",
    vibeEdicao: "Casual e direto — como um vídeo pessoal de aviso. Sem muita edição",
    musicaSugerida: "Música ambiente leve de fundo — sem letra",
    scenes: [
      {
        scene: 1,
        duracao: "0–5s",
        description: "Olhe para câmera com expressão confiante e direta.",
        fala: `Se você está procurando um ${assunto} bem cuidado, presta atenção nisso aqui.`,
        textoNaTela: `${assunto.charAt(0).toUpperCase() + assunto.slice(1)} disponível 👀`,
      },
      {
        scene: 2,
        duracao: "6–22s",
        description: "Fale sobre o assunto com naturalidade — descreva o que é, o estado, por que está disponível.",
        fala: `Estou colocando esse ${assunto} à venda. Ele está em bom estado, bem cuidado e pronto para uso. Pode ser uma boa opção para quem procura praticidade e confiança.`,
        textoNaTela: `[Descreva o ${assunto}: modelo, ano, estado]`,
      },
      {
        scene: 3,
        duracao: "23–29s",
        description: "Chamada direta — olhe para câmera.",
        fala: `Se quiser ver fotos, saber o valor ou tirar dúvidas — ${ctaMsg}`,
        textoNaTela: `Valor e detalhes no WhatsApp`,
      },
      {
        scene: 4,
        duracao: "30–34s",
        description: "Aponte para baixo.",
        fala: `Link do WhatsApp na bio — chama lá.`,
        textoNaTela: `👇 WhatsApp na bio`,
      },
    ],
    screen_text: `${assunto.charAt(0).toUpperCase() + assunto.slice(1)} à venda`,
    caption: `Estou vendendo. Bom estado, pronto para uso. Para saber valor, ver fotos ou detalhes, me chama no WhatsApp 👇`,
    cta: "Me chama no WhatsApp",
    whatsapp_message: `Olá! Vi o vídeo sobre o ${assunto} à venda. Pode me passar os detalhes?`,
  };
}

// ─── Roteiro específico: Promoção ────────────────────────────

// Openers de promoção — falam com o DESEJO do público, não anunciam a oferta
const NICHE_PROMO_OPENERS: Record<string, [string, string, string]> = {
  barbearia: [
    "Você está com aquele visual que já precisava de um jeito — mas sempre aparece um motivo para adiar?",
    "Você sabe que um corte bom muda o dia. Mas o preço sempre pareceu um obstáculo?",
    "Você queria cuidar do visual essa semana mas ainda estava pesando se valia a pena?",
  ],
  odontologia: [
    "Você sabe que devia cuidar do sorriso — mas o custo sempre foi o motivo para adiar?",
    "Você está naquele grupo de quem pensa: vou marcar quando tiver uma oportunidade boa. Essa oportunidade chegou.",
    "Você quer aquele sorriso que dá confiança — mas sempre achou que ia custar demais?",
  ],
  advogacia: [
    "Você tem uma situação jurídica que precisava de atenção — mas o custo da consulta sempre travou?",
    "Você está com um problema jurídico guardado porque achou que resolver ia sair caro demais?",
    "Você queria entender seus direitos, mas ficou na dúvida se compensava buscar assessoria?",
  ],
  estetica: [
    "Você queria se cuidar de verdade essa semana — mas o preço travou essa decisão?",
    "Você está naquele ciclo de: vou me cuidar quando tiver uma oportunidade boa. Essa oportunidade chegou.",
    "Você merece um momento só pra você — e essa semana ficou mais fácil ter esse momento.",
  ],
  psicologia: [
    "Você pensou em começar acompanhamento, mas o custo das sessões travou essa decisão?",
    "Você está naquele ponto em que sabe que precisa de apoio, mas ficou adiando por questão de valor?",
    "Começar um acompanhamento psicológico sempre pareceu um passo difícil — financeiramente ou emocionalmente?",
  ],
  "personal-trainer": [
    "Você queria ter um acompanhamento de treino de verdade, mas o investimento sempre travou?",
    "Você está treinando por conta própria sem resultado — e sabe que precisa de orientação mas ficou no custo?",
    "Você quer evoluir nos treinos e sabe que precisa de alguém junto — mas ficou esperando a hora certa?",
  ],
  mecanica: [
    "Você está adiando a revisão do carro por questão de custo — mas sabe que está arriscando?",
    "Você está com aquela luz acesa no painel que vai ignorando porque não quer pagar uma revisão agora?",
    "Seu carro precisa de atenção e você estava esperando um momento mais acessível pra resolver?",
  ],
  contabilidade: [
    "Você está pagando imposto sem saber se está correto — e sempre achou caro contratar um contador?",
    "Sua empresa está irregular e você ficou adiando a regularização por questão de custo?",
    "Você quer organizar as finanças da empresa mas o investimento em contabilidade sempre travou?",
  ],
};

const GENERIC_PROMO_OPENERS: [string, string, string] = [
  "Você estava esperando o momento certo para dar esse passo — mas o momento certo nunca parecia chegar?",
  "Você queria resolver isso, mas o custo sempre foi o motivo para deixar pra depois?",
  "Você está naquele grupo de quem pensa: quando aparecer uma boa oportunidade, eu faço. Essa oportunidade chegou.",
];

// Openers específicos para quando o sujeito é um grupo ("casais", "novos clientes", etc.)
const GRUPO_OPENERS = (sujeito: string): [string, string, string] => [
  `Esse vídeo é para ${sujeito} que estavam esperando um momento certo para fazer isso juntos.`,
  `${sujeito.charAt(0).toUpperCase() + sujeito.slice(1)} que sempre quiseram fazer isso mas ficaram no custo — prestem atenção.`,
  `Já pensaram nisso juntos — um momento só para vocês, fora da rotina? Essa semana ficou mais fácil.`,
];

function getPromocaoReels(
  input: ContentInput,
  vocab: { trabalho: string; o_resultado: string; chamar: string },
  name: string,
  city: string,
  cfg: { cta: string },
): ReelsScript {
  const seed = `${input.topic}${input.narrative ?? ""}${input.headline ?? ""}`;
  const v = variationIndex(seed, 3, input.variationSeed);
  const interpretation = interpretMagneticRequest({
    userInput: input.topic,
    businessName: name,
    niche: input.niche,
    city,
    mainService: input.mainService,
    services: input.services,
  });
  const sujeito = interpretation.temaInterpretado;
  const temSujeito = sujeito !== input.mainService;
  const headline = input.headline ?? `${name} — condição especial essa semana`;

  const promoOpeners = temSujeito
    ? GRUPO_OPENERS(sujeito)
    : (NICHE_PROMO_OPENERS[input.niche] ?? GENERIC_PROMO_OPENERS);

  const roteiros: ReelsScript[] = [
    // Variante 1 — Abre com o obstáculo do público (custo, momento certo, procrastinação)
    {
      title: headline,
      gancho: `Abrir com o obstáculo que travava o público cria identificação imediata e remove a barreira`,
      duracaoTotal: "25–35 segundos",
      vibeEdicao: "Positivo e caloroso — 1 corte no meio. Clima de oportunidade real, não anúncio",
      musicaSugerida: "Beat animado e discreto — instrumental sem letra, ritmo constante",
      scenes: [
        {
          scene: 1,
          duracao: "0–6s",
          description: "Olhe para câmera como se estivesse falando com uma pessoa específica que você reconhece.",
          fala: promoOpeners[0],
          textoNaTela: temSujeito ? `Para ${sujeito} 💙` : `Esse momento chegou ✅`,
        },
        {
          scene: 2,
          duracao: "7–20s",
          description: "Apresente a oportunidade como solução natural para o obstáculo que acabou de nomear.",
          fala: `Essa semana a ${name} preparou uma condição especial${temSujeito ? ` para ${sujeito}` : ""}. ${vocab.trabalho.charAt(0).toUpperCase() + vocab.trabalho.slice(1)} com uma proposta diferente — feita pra quem estava esperando esse momento em ${city}.`,
          textoNaTela: `${name} · ${city} · Condição especial`,
        },
        {
          scene: 3,
          duracao: "21–28s",
          description: "Tom de urgência genuína — sem exagerar.",
          fala: `Essa condição é por tempo limitado. Depois que encerrar, volta ao normal.`,
          textoNaTela: `Por tempo limitado ⏰`,
        },
        {
          scene: 4,
          duracao: "29–34s",
          description: "Aponte para baixo — sorrindo com confiança.",
          fala: `Chame no WhatsApp. A gente te explica tudo e confirma.`,
          textoNaTela: `👇 WhatsApp na bio`,
        },
      ],
      screen_text: `${name} — essa semana tem condição especial`,
      caption: `${promoOpeners[0]} Essa semana a ${name} tem uma condição especial${temSujeito ? " para " + sujeito : ""} em ${city}. Por tempo limitado — chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Olá! Vi o vídeo e quero saber sobre a condição especial${temSujeito ? " para " + sujeito : ""}. Ainda está disponível?`,
    },
    // Variante 2 — Abre com urgência do fechamento, da perspectiva do público que está perdendo
    {
      title: headline,
      gancho: `Falar sobre a oportunidade que fecha cria urgência genuína em quem estava procrastinando`,
      duracaoTotal: "25–35 segundos",
      vibeEdicao: "Ritmo médio com 1 corte — urgência real sem parecer spam",
      musicaSugerida: "Trending com batida discreta — leve animação sem exagero",
      scenes: [
        {
          scene: 1,
          duracao: "0–6s",
          description: "Expressão séria mas amigável — como quem está dando um aviso que importa.",
          fala: promoOpeners[1],
          textoNaTela: `Essa janela está fechando ⚡`,
        },
        {
          scene: 2,
          duracao: "7–20s",
          description: "Conecte o obstáculo com a solução — a condição especial resolve o que travava.",
          fala: `A ${name} está com uma proposta${temSujeito ? ` especial para ${sujeito}` : " que raramente fazemos"} — exatamente para esse momento. Se você estava esperando um bom momento para ${vocab.chamar}, esse momento é agora. Estamos em ${city} com atendimento disponível essa semana.`,
          textoNaTela: `${name} · ${city} · Disponível agora`,
        },
        {
          scene: 3,
          duracao: "21–27s",
          description: "Tom direto e firme.",
          fala: `Depois que essa semana fechar, não consigo garantir essa condição de novo.`,
          textoNaTela: `Depois não garantimos 🛑`,
        },
        {
          scene: 4,
          duracao: "28–34s",
          description: "Sorriso e aponta para baixo.",
          fala: `Chame agora no WhatsApp — atendimento rápido.`,
          textoNaTela: `👇 WhatsApp na bio`,
        },
      ],
      screen_text: `${name} — condição encerrando essa semana`,
      caption: `${promoOpeners[1]} A ${name} tem uma condição especial${temSujeito ? " para " + sujeito : ""} em ${city} encerrando em breve. Chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Olá ${name}! Vi o vídeo. A condição especial ainda está disponível?`,
    },
    // Variante 3 — Tom íntimo, fala direto com o grupo ou com o procrastinador
    {
      title: headline,
      gancho: `Tom íntimo e direto com o público certo — cria sensação de que o vídeo foi feito pra eles`,
      duracaoTotal: "25–35 segundos",
      vibeEdicao: "Casual e caloroso — como uma mensagem pessoal, não um anúncio publicitário",
      musicaSugerida: "Lo-fi suave ou instrumental leve — fundo discreto",
      scenes: [
        {
          scene: 1,
          duracao: "0–6s",
          description: "Sorriso genuíno — tom de quem está compartilhando algo bom com alguém que conhece.",
          fala: promoOpeners[2],
          textoNaTela: temSujeito ? `Para ${sujeito} 💙` : `Esse vídeo é pra você 👀`,
        },
        {
          scene: 2,
          duracao: "7–20s",
          description: "Explique a oportunidade de forma humana, sem exagerar.",
          fala: `A ${name} em ${city} preparou uma condição pensada${temSujeito ? ` para ${sujeito}` : " pra quem estava esperando esse momento"}. Vale muito conferir antes de encerrar — chama no WhatsApp e a gente explica tudo.`,
          textoNaTela: `${name} · ${city} · Vale conferir`,
        },
        {
          scene: 3,
          duracao: "21–27s",
          description: "Tom direto — sem drama.",
          fala: `É por tempo limitado. Não deixa pra depois dessa vez.`,
          textoNaTela: `Por tempo limitado ⏰`,
        },
        {
          scene: 4,
          duracao: "28–34s",
          description: "Aponte para baixo com sorriso.",
          fala: `WhatsApp na bio — chama agora.`,
          textoNaTela: `👇 WhatsApp na bio`,
        },
      ],
      screen_text: `${name} — vale conferir essa semana`,
      caption: `${promoOpeners[2]} A ${name} tem uma condição especial${temSujeito ? " para " + sujeito : ""} em ${city} por tempo limitado. Chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Oi ${name}! Vi o vídeo sobre a condição especial${temSujeito ? " para " + sujeito : ""}. Ainda tem disponibilidade?`,
    },
  ];

  return roteiros[v % roteiros.length];
}

// ─── Roteiro específico: Bastidores / Como Funciona ──────────

function getBastidoresReels(
  input: ContentInput,
  vocab: { trabalho: string; o_resultado: string; o_processo: string; oque_faz: string },
  name: string,
  city: string,
  cfg: { cta: string },
): ReelsScript {
  const seed = `${input.topic}${input.narrative ?? ""}${input.headline ?? ""}`;
  const v = variationIndex(seed, 3, input.variationSeed);
  const headline = input.headline ?? `Como funciona o atendimento na ${name}`;

  const roteiros: ReelsScript[] = [
    {
      title: headline,
      gancho: `Explicar o processo do início ao fim reduz resistência e aumenta a confiança antes de contratar`,
      duracaoTotal: "30–40 segundos",
      vibeEdicao: "Sequencial e natural — como uma conversa mostrando o passo a passo. Sem cortes forçados",
      musicaSugerida: "Lo-fi instrumental calmo — fundo discreto que não compete com a fala",
      scenes: [
        {
          scene: 1,
          duracao: "0–5s",
          description: "Olhe para câmera com expressão de quem vai explicar algo simples.",
          fala: `Deixa eu te mostrar como funciona o processo aqui na ${name} do início ao fim.`,
          textoNaTela: `Como funciona? 🔍`,
        },
        {
          scene: 2,
          duracao: "6–22s",
          description: "Mostre o ambiente e o processo sendo realizado — cada etapa com naturalidade.",
          fala: `Primeiro, você entra em contato pelo WhatsApp. A gente entende o que você precisa e já organiza tudo. Depois: ${vocab.o_processo}. Nada é apressado — cada etapa tem atenção real.`,
          textoNaTela: `${vocab.o_processo}`,
        },
        {
          scene: 3,
          duracao: "23–33s",
          description: "Mostre o resultado final com satisfação.",
          fala: `E o resultado é ${vocab.o_resultado}. Do começo ao fim, você sabe o que está acontecendo — sem surpresas.`,
          textoNaTela: `${vocab.o_resultado} ✅`,
        },
        {
          scene: 4,
          duracao: "34–39s",
          description: "Olhe para câmera e aponte para baixo.",
          fala: `Se quiser saber mais ou já começar, chame no WhatsApp. A gente responde rápido.`,
          textoNaTela: `👇 WhatsApp na bio`,
        },
      ],
      screen_text: `${name} em ${city} — como funciona`,
      caption: `Como funciona o atendimento na ${name} — do primeiro contato ao resultado. Simples, transparente e direto. Chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Olá ${name}! Vi o vídeo explicando como funciona. Quero saber mais.`,
    },
    {
      title: headline,
      gancho: `Abrir os bastidores do trabalho cria curiosidade — o público quer ver o que normalmente não se mostra`,
      duracaoTotal: "30–40 segundos",
      vibeEdicao: "Câmera no ombro — vibe documental e real. Transições suaves entre as cenas",
      musicaSugerida: "Instrumental com leveza — algo que passa sensação de processo e cuidado",
      scenes: [
        {
          scene: 1,
          duracao: "0–5s",
          description: "Câmera mostrando o ambiente enquanto você se prepara — o que o cliente nunca vê.",
          fala: `Esse vídeo é sobre o que acontece aqui antes do resultado que você vê no feed.`,
          textoNaTela: `Por trás do resultado 🎬`,
        },
        {
          scene: 2,
          duracao: "6–22s",
          description: "Mostre o processo passo a passo — preparação, execução, atenção ao detalhe.",
          fala: `Antes de qualquer ${vocab.trabalho}, a gente passa pelo ${vocab.o_processo}. Cada etapa tem um motivo — e o motivo é sempre o mesmo: que você saia daqui com ${vocab.o_resultado}.`,
          textoNaTela: `Cada detalhe tem um motivo ✨`,
        },
        {
          scene: 3,
          duracao: "23–33s",
          description: "Resultado visível — produto final ou cliente satisfeito.",
          fala: `É isso que a ${name} entrega em ${city}. Processo real, resultado real.`,
          textoNaTela: `Processo real. Resultado real. 💪`,
        },
        {
          scene: 4,
          duracao: "34–39s",
          description: "Olhe para câmera diretamente — sorrindo.",
          fala: `Se ficou com alguma dúvida ou quer agendar, chame no WhatsApp agora.`,
          textoNaTela: `${name} · ${city} · WhatsApp 👇`,
        },
      ],
      screen_text: `${name} — bastidores do ${vocab.trabalho}`,
      caption: `Os bastidores de cada ${vocab.trabalho} na ${name}. Processo real, atenção real, resultado real — em ${city}. Chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Oi ${name}! Vi o vídeo dos bastidores e quero saber mais sobre como funciona.`,
    },
    {
      title: headline,
      gancho: `Responder diretamente "como funciona" remove a principal barreira para o primeiro contato`,
      duracaoTotal: "25–35 segundos",
      vibeEdicao: "Direto ao ponto — tom de conversa, sem produção exagerada. Genuíno e simples",
      musicaSugerida: "Beat discreto — algo leve que não dispute atenção com a fala",
      scenes: [
        {
          scene: 1,
          duracao: "0–5s",
          description: "Olhe para câmera com tom de quem vai tirar uma dúvida comum.",
          fala: `Muita gente me pergunta: como funciona? Vou explicar em menos de 30 segundos.`,
          textoNaTela: `Como funciona? 🤔`,
        },
        {
          scene: 2,
          duracao: "6–20s",
          description: "Explique de forma objetiva — sem tecnicismo, linguagem simples.",
          fala: `É simples: você chama no WhatsApp, a gente conversa sobre o que você precisa, agendamos o horário e cuidamos de tudo. A ${name} em ${city} ${vocab.oque_faz}. Do jeito certo, sem enrolação.`,
          textoNaTela: `1. Chama · 2. Agenda · 3. Resultado`,
        },
        {
          scene: 3,
          duracao: "21–28s",
          description: "Tom confiante e direto.",
          fala: `Rápido, direto e com resultado que você vai perceber. É assim que funciona aqui.`,
          textoNaTela: `Rápido. Direto. ${vocab.o_resultado} ✅`,
        },
        {
          scene: 4,
          duracao: "29–34s",
          description: "Aponte para baixo.",
          fala: `Chame agora — WhatsApp na bio.`,
          textoNaTela: `👇 WhatsApp na bio`,
        },
      ],
      screen_text: `${name} — simples assim`,
      caption: `Como funciona a ${name} em ${city}: você chama, a gente cuida do resto. ${vocab.o_resultado}, do jeito certo. Chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Olá ${name}! Vi a explicação de como funciona. Quero agendar.`,
    },
  ];

  return roteiros[v % roteiros.length];
}

// ─── Cenários reais por nicho — prontos para gravar ─────────

interface CenarioData {
  abertura: string;
  historia: string;
  virada: string;
  gancho: string;
  textoAbertura: string;
}

const NICHE_CENARIOS: Record<string, [CenarioData, CenarioData, CenarioData]> = {
  advogacia: [
    {
      gancho: "Consequência de assinar sem assessoria jurídica — identificação imediata com quem já passou por isso",
      textoAbertura: "Isso acontece todo dia ⚖️",
      abertura: "Deixa eu te contar o que acontece quando alguém tenta resolver uma questão trabalhista sem advogado.",
      historia: "A pessoa recebe uma proposta de rescisão, acha que está certo e assina. Só depois descobre que abriu mão de horas extras, férias proporcionais, aviso prévio — verbas que somavam muito mais do que o que recebeu. O prazo para contestar já tinha passado. Sem assessoria, sem saída.",
      virada: "Com orientação jurídica desde o começo, esse cenário muda completamente. Analisamos cada cláusula antes de qualquer assinatura — para que você não perca o que é seu por falta de informação.",
    },
    {
      gancho: "Custo real de buscar advogado tarde demais — gera urgência preventiva e posiciona como aliado",
      textoAbertura: "Quase todo caso começa igual 📋",
      abertura: "Você sabia que a maioria dos casos que chegam até nós teriam sido muito mais simples de resolver — se a pessoa tivesse buscado orientação no começo?",
      historia: "A gente vê isso o tempo todo: chega uma notificação, a pessoa fica sem saber o que fazer, espera, tenta resolver sozinha. Quando finalmente busca um advogado, a situação já escalou. Prazos perdidos, direitos comprometidos, processo mais longo e mais caro do que precisava ser.",
      virada: "Buscar orientação cedo não é gasto — é o que evita um custo muito maior depois. Estamos aqui exatamente para que você não chegue tarde demais.",
    },
    {
      gancho: "Situação universal de incerteza jurídica — quem já passou por isso para imediatamente",
      textoAbertura: "Você já esteve nessa situação? 🤔",
      abertura: "Você já passou por isso: chegou uma cobrança, uma notificação, um contrato — e você ficou sem saber o que fazer.",
      historia: "Essa sensação de não saber seus direitos é mais comum do que parece. E quem não age no prazo certo perde oportunidades. O que seria resolvido com uma consulta vira um processo. Ou você aceita um acordo ruim porque não sabia que podia contestar.",
      virada: "É exatamente para esse momento que existe assessoria jurídica. Análise clara, orientação direta, defesa real dos seus direitos — antes que o prazo passe.",
    },
  ],
  barbearia: [
    {
      gancho: "Situação que a maioria já viveu — sair da barbearia sem gostar do resultado",
      textoAbertura: "Você já viveu isso? ✂️",
      abertura: "Você já saiu de uma barbearia sem gostar do resultado — mesmo o barbeiro tendo feito exatamente o que você pediu?",
      historia: "Isso acontece porque o que você pediu não é sempre o que fica melhor no seu rosto. Perfil, estrutura óssea, tipo de cabelo — tudo influencia. Quando não tem conversa antes de cortar, o resultado é genérico. Você paga, sai, fica decepcionado. E fica sem vontade de voltar.",
      virada: "Aqui cada corte começa com uma conversa de verdade. A gente entende o que você quer, avalia o que fica melhor — e aí pega a tesoura. O resultado é outro.",
    },
    {
      gancho: "O impacto real do visual no dia a dia — conexão emocional com o público masculino",
      textoAbertura: "Isso acontece toda vez 💈",
      abertura: "Sabe aquele dia que você sai da barbearia e sente que pode encarar qualquer coisa? Esse sentimento tem uma explicação.",
      historia: "Não é só o corte. É o tempo que o profissional dedicou pra entender o que você precisa. É o acabamento que mostra que cada detalhe importou. É sair sabendo que aquele visual representa quem você é — não um modelo padrão aplicado em todo mundo igual.",
      virada: "É isso que a gente entrega em cada atendimento. Técnica, conversa e atenção individual — porque visual descuidado fala por você antes de você abrir a boca.",
    },
    {
      gancho: "Custo emocional e profissional de não cuidar do visual — urgência real sem ser alarmista",
      textoAbertura: "Quanto tempo faz? 🪞",
      abertura: "Quanto tempo faz que você não sai de uma barbearia se sentindo do jeito certo?",
      historia: "Visual descuidado fala por você antes de você abrir a boca. Em uma entrevista, em uma reunião, no dia a dia — as pessoas percebem em segundos. E quando o cabelo ou a barba não está do jeito que deveria, você sente isso — na confiança, na postura, no que você projeta.",
      virada: "A diferença começa em uma conversa e termina no resultado. Essa semana tem horário disponível.",
    },
  ],
  odontologia: [
    {
      gancho: "Progressão do problema por adiar — cria urgência genuína sem ser dramático",
      textoAbertura: "O que o adiamento faz com o seu sorriso 🦷",
      abertura: "Deixa eu te contar o que acontece com o sorriso quando você vai adiando o dentista.",
      historia: "O que começa como uma sensibilidade pequena vira cárie. A cárie não tratada vira canal. O canal mal resolvido vira extração. O que seria uma limpeza simples e barata se torna um tratamento longo, mais complexo e muito mais caro. Tudo começa com 'vou marcar semana que vem'.",
      virada: "Cuidar do sorriso antes que os problemas cresçam é sempre mais simples e mais barato. Avaliação disponível essa semana — sem pressão, sem julgamento.",
    },
    {
      gancho: "Impacto social do sorriso — aspiracional e emocional, cria desejo de resolver",
      textoAbertura: "Isso muda mais do que você imagina 😁",
      abertura: "Você sorrindo com confiança — sem esconder os dentes, sem se preocupar. Você sabe o quanto isso muda?",
      historia: "Sorriso é uma das primeiras coisas que as pessoas percebem. Em entrevistas, em fotos, no dia a dia — a impressão que você passa começa ali. E quando você não confia no seu sorriso, isso aparece: você cobre a boca, evita sorrir aberto, fica mais retraído.",
      virada: "Sorriso saudável e bonito não é luxo. É cuidado acessível com resultado que você percebe no espelho e no jeito que as pessoas te recebem.",
    },
    {
      gancho: "Derruba a objeção do medo de dentista — fala direto com quem está adiando por isso",
      textoAbertura: "Você tem medo? É normal. 🌿",
      abertura: "Você tem medo de dentista — ou de que vai doer, ou de que vai custar caro?",
      historia: "Esse medo é real e muito comum. Mas sabe o que acontece quando você adia por causa dele? O problema que daria pra resolver simples fica grande, doloroso e caro. A odontologia moderna é muito diferente do que muita gente imagina — anestesia eficiente, procedimentos rápidos, profissional que entende o seu desconforto.",
      virada: "O cuidado começa antes de você sentar na cadeira. Avaliação sem pressão, no seu ritmo — é assim que funciona aqui.",
    },
  ],
  estetica: [
    {
      gancho: "Reconhecimento da realidade de quem cuida de todo mundo menos de si — identificação emocional imediata",
      textoAbertura: "Você cuida de todo mundo menos de você? 💆‍♀️",
      abertura: "Você está no modo de cuidar de todo mundo — família, trabalho, casa — e vai deixando você pra depois.",
      historia: "A maioria das mulheres que chegam aqui chegam exatamente assim: esgotadas de cuidar de tudo ao redor, sem ter reservado um momento real pra si mesmas. E aí o corpo cobra: pele resseca, cansaço aparece no rosto, a autoestima vai embora aos poucos.",
      virada: "Cuidar de você não é egoísmo. É o que te mantém inteira pra tudo que você já cuida. E essa semana tem horário disponível.",
    },
    {
      gancho: "Consequência progressiva do descuido com a pele — urgência preventiva e real",
      textoAbertura: "O que acontece quando você ignora a pele ✨",
      abertura: "Deixa eu te mostrar o que acontece com a pele quando você fica deixando o cuidado pra depois.",
      historia: "Pequenas manchas ficam maiores. Poros abertos ficam mais aparentes com o tempo. A elasticidade vai embora mais rápido do que parece. E aí vira um ciclo: quanto mais tempo passa, mais difícil reverter. O que seria um tratamento simples vira um processo longo.",
      virada: "Cuidar da pele antes que isso aconteça é sempre mais simples. Com técnica real e produtos de qualidade — o resultado aparece e dura.",
    },
    {
      gancho: "Momento emocional de reconhecimento — quem perdeu essa sensação quer buscar de volta",
      textoAbertura: "Você lembra dessa sensação? 🌸",
      abertura: "Você se lembra da última vez que olhou no espelho e se sentiu bem de verdade — não do jeito rápido de manhã, de verdade?",
      historia: "Com aquela sensação de que você está bem, cuidada, pronta. Isso não é vaidade. É saúde emocional. Pele bem cuidada tem impacto real em como você se sente ao longo do dia, nas decisões que você toma, na energia que você transmite.",
      virada: "Essa sensação tem endereço. E essa semana tem horário disponível pra você.",
    },
  ],
  psicologia: [
    {
      gancho: "Esgotamento silencioso que o público normaliza — reconhecimento imediato",
      textoAbertura: "Você está carregando isso sozinho? 💙",
      abertura: "Você está carregando muita coisa — e tentando resolver sozinho. Mas tem uma hora que isso pesa.",
      historia: "A gente normaliza tanto o estresse, a ansiedade, o peso emocional, que fica difícil perceber quando cruzou um limite. E aí vêm os sinais: sono ruim, irritabilidade, sensação constante de sobrecarga, aquela dificuldade de se desligar. O corpo e a mente cobram o que você vai ignorando.",
      virada: "Acompanhamento psicológico não é pra quem está em crise. É pra quem quer entender o que está acontecendo e não quer mais só sobreviver. Sessão disponível essa semana.",
    },
    {
      gancho: "Derrubar a barreira de 'precisa ser grave pra buscar ajuda' — fala com a maioria silenciosa",
      textoAbertura: "Você já pensou nisso mas descartou? 🌿",
      abertura: "Você já se pegou pensando: será que eu precisaria de terapia? E logo descartou a ideia?",
      historia: "Essa dúvida é mais comum do que parece. A maioria espera chegar em um nível crítico antes de buscar apoio. Mas acompanhamento psicológico funciona melhor quando você começa antes disso — antes do burnout, antes que os relacionamentos deteriorem, antes que o trabalho vire fonte de sofrimento.",
      virada: "O apoio começa onde você está agora — não onde você acha que deveria estar. Primeira sessão disponível essa semana.",
    },
    {
      gancho: "Solidão de carregar algo que não pode falar — criação de espaço seguro e urgência emocional",
      textoAbertura: "Tem algo que você não consegue falar 🤍",
      abertura: "Tem uma coisa que você guarda — que não contou pra ninguém — porque não sabe como falar ou com quem.",
      historia: "Guardar vai pesando. O que começa como algo pequeno ocupa mais espaço com o tempo. E quando você tenta falar, não sabe por onde começar. Esse silêncio tem um custo — no sono, nas relações, no dia a dia.",
      virada: "Esse é exatamente o trabalho da psicologia: criar um espaço onde você pode começar de onde está, no ritmo que consegue. Sem julgamento. Sessão disponível essa semana.",
    },
  ],
  "personal-trainer": [
    {
      gancho: "Tirar a culpa do público e apontar a causa real — identificação e alívio imediatos",
      textoAbertura: "O problema não é você 💪",
      abertura: "Você está treinando — mas sem resultado. E começa a pensar que o problema é você.",
      historia: "Não é você. É a falta de direção. Treinar por conta, sem avaliação, sem plano, sem alguém que ajuste quando necessário é como dirigir sem GPS em uma cidade que você não conhece. Você se move, gasta energia, mas não chega onde quer.",
      virada: "Acompanhamento real muda esse cenário. Treino com propósito, carga certa, técnica certa, progressão real — o corpo responde diferente quando tem alguém do seu lado.",
    },
    {
      gancho: "Comparação antes/depois do acompanhamento — cria desejo pela versão com resultado",
      textoAbertura: "A diferença é real 🏋️",
      abertura: "Deixa eu te mostrar a diferença entre treinar com acompanhamento e treinar sozinho.",
      historia: "Sem acompanhamento: você faz os exercícios que conhece, na ordem que lembra, com a carga que parece certa. Progride devagar ou não progride. Se machuca às vezes. Perde motivação. Com acompanhamento: cada treino tem propósito, cada semana tem progressão, você sabe por que está fazendo e o que vai mudar.",
      virada: "É essa diferença que o acompanhamento faz. Treino com ciência, atenção e resultado que você vê — em semanas, não em anos.",
    },
    {
      gancho: "Ciclo de início/abandono que o público repete — identificação e esperança de quebrar o padrão",
      textoAbertura: "Esse ciclo é familiar? 🔄",
      abertura: "Você começa o ano cheio de motivação — academia, plano alimentar, rotina — e abandona depois de algumas semanas. Por que isso acontece?",
      historia: "Não é falta de vontade. É falta de direção. Sem plano claro, sem progressão, sem alguém que mostre a diferença entre esforço e resultado, a motivação vai embora. Vem a culpa, que piora tudo. E no ano seguinte, o ciclo começa de novo.",
      virada: "A gente existe pra quebrar esse ciclo. Acompanhamento real, plano que funciona e alguém do seu lado quando bater a vontade de desistir.",
    },
  ],
  mecanica: [
    {
      gancho: "Progressão do problema mecânico — urgência real com custo concreto",
      textoAbertura: "O que você ignora vai crescendo 🔧",
      abertura: "Você sabe o que acontece quando você ignora aquele barulhinho estranho no carro por semanas?",
      historia: "O que era uma pastilha desgastada vira disco danificado. O que era um ajuste simples vira um problema no motor. Cada revisão atrasada transforma um reparo pequeno em um reparo grande. E o valor aumenta junto com o risco na estrada.",
      virada: "A gente resolve o problema antes que ele cresça. Diagnóstico honesto, orçamento claro, sem invenção. Você sai sabendo exatamente o que foi feito e por quê.",
    },
    {
      gancho: "Medo de mecânico desonesto — construir confiança através de transparência",
      textoAbertura: "Você confia no seu mecânico? 🚗",
      abertura: "Você confia no seu carro — ou você dirige com aquela sensação de que algo pode dar errado a qualquer hora?",
      historia: "Essa insegurança é real. E quando a manutenção foi feita em um lugar sem transparência, você nem sabe se o problema foi resolvido de verdade. Você paga, sai, e fica na dúvida se valeu. Isso não devia acontecer.",
      virada: "Aqui o diagnóstico é honesto e o processo é transparente. Você sabe o que foi feito, por que foi feito, quanto custou. Sem surpresa, sem invenção.",
    },
    {
      gancho: "Segurança da família na estrada — urgência emocional real",
      textoAbertura: "Carro sem revisão é risco real ⚠️",
      abertura: "Você já pegou uma estrada longa com o carro sem revisão — e ficou na torcida que tudo desse certo?",
      historia: "Esse medo é evitável. Carro revisado é carro previsível. Você sabe que os freios respondem, que o óleo está certo, que os pneus estão calibrados. A tranquilidade na estrada começa antes de você ligar o motor — e começa com manutenção em dia.",
      virada: "A gente cuida do seu carro pra você dirigir com segurança. Diagnóstico disponível essa semana.",
    },
  ],
  contabilidade: [
    {
      gancho: "Imposto pago errado — questiona o status quo e oferece economia real",
      textoAbertura: "Você está pagando mais do que devia? 📊",
      abertura: "Você sabe exatamente quanto a sua empresa está pagando de imposto — e se está correto?",
      historia: "A maioria dos empresários não sabe. Paga o que a guia cobra, sem questionar. E muitas vezes está pagando mais do que deveria — porque o regime tributário não está adequado, porque o planejamento não foi feito, porque há créditos que não estão sendo aproveitados.",
      virada: "Essa análise é o que a contabilidade certa faz. Muitas vezes o valor que você paga pelo serviço é menor do que o quanto você vai economizar em impostos.",
    },
    {
      gancho: "Caos financeiro do empreendedor sem estrutura — identificação e urgência de organizar",
      textoAbertura: "O dinheiro some sem explicação? 💸",
      abertura: "Você está tocando seu negócio no improviso — boletos chegam, você paga, e no final do mês não sabe pra onde foi o dinheiro?",
      historia: "Isso é mais comum do que parece. Sem controle contábil real, as decisões são no instinto. E quando o crescimento vem, o caos financeiro vem junto — DAS, pró-labore, obrigações acessórias, tudo empilha. Você trabalha muito, mas não tem clareza do resultado.",
      virada: "Contabilidade certa organiza essa estrutura. Empresa regularizada, obrigações em dia, decisão baseada em número real — não em chute.",
    },
    {
      gancho: "Custo de irregularidade — fala com quem já se machucou ou tem medo de se machucar",
      textoAbertura: "Empresa irregular tem custo alto 📋",
      abertura: "Você já recebeu uma multa da Receita ou uma notificação que poderia ter sido evitada com contabilidade em dia?",
      historia: "Obrigação acessória esquecida, declaração incorreta, CNPJ irregular — cada um tem custo: multa, juros, tempo. E muitas vezes o empreendedor não sabia que estava em falta porque estava gerenciando tudo sozinho, sem suporte técnico. Quando percebe, já tem histórico negativo.",
      virada: "A contabilidade certa previne exatamente esses problemas. Vai além de abrir empresa — é gestão real do seu negócio.",
    },
  ],
};

// ─── Roteiro específico: Cenário ──────────────────────────────

function getCenarioReels(
  input: ContentInput,
  vocab: { trabalho: string; o_resultado: string; oque_faz: string; chamar: string },
  name: string,
  city: string,
  cfg: { cta: string },
): ReelsScript {
  const seed = `${input.topic}${input.narrative ?? ""}${input.headline ?? ""}`;
  const v = variationIndex(seed, 3, input.variationSeed);

  const nicheScenarios = NICHE_CENARIOS[input.niche];

  if (nicheScenarios) {
    const c = nicheScenarios[v % 3];
    const sub = (s: string) => s.replace(/\[nome\]/g, name).replace(/\[city\]/g, city);
    const headline = input.headline ?? `${name} — situação real em ${city}`;

    return {
      title: headline,
      gancho: c.gancho,
      duracaoTotal: "35–50 segundos",
      vibeEdicao: "Narrativo e empático — olhe para câmera o tempo todo, sem cortes forçados. Câmera próxima ao rosto, tom de conversa real",
      musicaSugerida: "Instrumental com emoção suave — piano ou violão discreto, não compete com a narrativa",
      scenes: [
        {
          scene: 1,
          duracao: "0–6s",
          description: "Olhe direto para câmera com tom sério e empático — como alguém que vai contar algo importante. Pausa antes de falar.",
          fala: sub(c.abertura),
          textoNaTela: c.textoAbertura,
        },
        {
          scene: 2,
          duracao: "7–30s",
          description: "Desenvolva o cenário com naturalidade — você pode mostrar o ambiente de trabalho, encenar ou falar direto para câmera. Detalhes específicos tornam a história real.",
          fala: sub(c.historia),
          textoNaTela: `Situação real 📍`,
        },
        {
          scene: 3,
          duracao: "31–43s",
          description: "A virada — apresente o que muda com o profissional certo. Tom de solução, não de anúncio.",
          fala: sub(c.virada),
          textoNaTela: `${name} em ${city} 💪`,
        },
        {
          scene: 4,
          duracao: "44–50s",
          description: "CTA direto — olhe para câmera com confiança.",
          fala: `Se isso fez sentido pra você, chama no WhatsApp agora. Link na bio.`,
          textoNaTela: `👇 WhatsApp na bio`,
        },
      ],
      screen_text: `${name} em ${city}`,
      caption: `${sub(c.abertura)} ${sub(c.virada)} Chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Olá ${name}! Vi o vídeo e quero ${vocab.chamar}.`,
    };
  }

  // Genérico — quando o nicho não tem cenário específico
  return {
    title: input.headline ?? `${name} — o que muda quando você tem o profissional certo`,
    gancho: "Narrar um cenário que o público reconhece cria identificação imediata e gera ação",
    duracaoTotal: "35–45 segundos",
    vibeEdicao: "Narrativo e empático — fale para câmera com naturalidade e emoção genuína",
    musicaSugerida: "Instrumental suave — não compete com a história",
    scenes: [
      {
        scene: 1,
        duracao: "0–6s",
        description: "Abra com uma situação que o público reconhece — tom empático.",
        fala: `Você já esteve em uma situação em que sabia que precisava de ajuda — mas ficou sem saber por onde começar?`,
        textoNaTela: `Isso acontece com mais gente do que você imagina 👀`,
      },
      {
        scene: 2,
        duracao: "7–25s",
        description: "Desenvolva o cenário — mostre o que acontece quando a pessoa fica sem o suporte certo.",
        fala: `A maioria das pessoas que chegam até a ${name} chegam depois de tentar resolver sozinhos por muito tempo. E o que poderia ser simples no começo virou algo muito maior — porque cada dia sem a orientação certa, o problema cresce.`,
        textoNaTela: `Resolver cedo é sempre melhor 💡`,
      },
      {
        scene: 3,
        duracao: "26–38s",
        description: "A virada — o que muda com o profissional certo.",
        fala: `Com o suporte certo, esse cenário muda. A ${name} em ${city} ${vocab.oque_faz} com atenção real. ${vocab.o_resultado} — de verdade, não como promessa.`,
        textoNaTela: `${vocab.o_resultado} ✅`,
      },
      {
        scene: 4,
        duracao: "39–44s",
        description: "CTA direto.",
        fala: `Chame no WhatsApp — link na bio.`,
        textoNaTela: `👇 WhatsApp na bio`,
      },
    ],
    screen_text: `${name} em ${city}`,
    caption: `Você já esteve nessa situação? A ${name} em ${city} ${vocab.oque_faz} com atenção real. Chame no WhatsApp 👇`,
    cta: cfg.cta,
    whatsapp_message: `Olá ${name}! Vi o vídeo e quero ${vocab.chamar}.`,
  };
}

// ─── Roteiro específico: Dica Educativa ──────────────────────

function getDicaReels(
  input: ContentInput,
  vocab: { trabalho: string; o_resultado: string; profissional: string; oque_faz: string; o_processo: string },
  name: string,
  city: string,
  cfg: { cta: string },
): ReelsScript {
  const seed = `${input.topic}${input.narrative ?? ""}${input.headline ?? ""}`;
  const v = variationIndex(seed, 3, input.variationSeed);
  const interpretation = interpretMagneticRequest({
    userInput: input.topic,
    businessName: name,
    niche: input.niche,
    city,
    mainService: input.mainService,
    services: input.services,
  });
  const tema = interpretation.temaInterpretado;
  const headline = input.headline ?? `O que você precisa saber sobre ${tema}`;

  const roteiros: ReelsScript[] = [
    {
      title: headline,
      gancho: `Revelar algo que o público não sabe sobre o serviço posiciona como autoridade e gera compartilhamento`,
      duracaoTotal: "30–40 segundos",
      vibeEdicao: "Educativo e direto — como uma aula rápida. Texto na tela como destaque",
      musicaSugerida: "Instrumental leve e neutro — não compete com a fala. Algo que transmite conhecimento",
      scenes: [
        {
          scene: 1,
          duracao: "0–5s",
          description: "Olhe para câmera com expressão de quem vai ensinar algo valioso.",
          fala: `A maioria não sabe, mas ${tema} funciona diferente do que as pessoas imaginam.`,
          textoNaTela: `O que poucos sabem sobre ${tema} 💡`,
        },
        {
          scene: 2,
          duracao: "6–22s",
          description: "Explique de forma simples — linguagem acessível, sem tecnicismo exagerado.",
          fala: `Muita gente toma decisões sobre ${tema} sem a informação certa — e acaba desperdiçando tempo ou dinheiro. O que faz diferença de verdade é contar com um ${vocab.profissional} especializado. É exatamente isso que a ${name} entrega.`,
          textoNaTela: `A informação certa muda tudo ✅`,
        },
        {
          scene: 3,
          duracao: "23–33s",
          description: "Continue com dica prática — algo que o público pode usar imediatamente.",
          fala: `Dica prática: antes de decidir qualquer coisa sobre ${tema}, busque quem entende. Em ${city}, a ${name} pode te orientar — primeira conversa sem compromisso.`,
          textoNaTela: `Dica que vale guardar 📌`,
        },
        {
          scene: 4,
          duracao: "34–39s",
          description: "Aponte para baixo ou para câmera — tom de convite.",
          fala: `Ficou com dúvida? Chame no WhatsApp. A gente responde rápido.`,
          textoNaTela: `${name} · ${city} · WhatsApp 👇`,
        },
      ],
      screen_text: `${name} — dica sobre ${tema}`,
      caption: `O que poucos sabem sobre ${tema} — e como isso afeta o resultado. A ${name} em ${city} ${vocab.oque_faz} do jeito certo. Chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Olá ${name}! Vi a dica sobre ${tema} e quero saber mais.`,
    },
    {
      title: headline,
      gancho: `Revelar um erro comum cria identificação imediata — quem já errou vai compartilhar`,
      duracaoTotal: "30–40 segundos",
      vibeEdicao: "Começa sério, vai ficando mais leve depois da revelação. Cortes moderados",
      musicaSugerida: "Beat discreto com progressão — começa neutro e anima no meio",
      scenes: [
        {
          scene: 1,
          duracao: "0–5s",
          description: "Expressão de quem vai revelar algo que as pessoas erram muito.",
          fala: `O erro mais comum que vejo as pessoas cometendo com ${tema}? Vou te contar.`,
          textoNaTela: `O erro mais comum com ${tema} ⚠️`,
        },
        {
          scene: 2,
          duracao: "6–20s",
          description: "Descreva o erro sem apontar alguém — fale do cenário geral.",
          fala: `A maioria das pessoas deixa ${tema} pra última hora — ou tenta resolver sem a orientação certa. O resultado: mais custo, mais tempo e às vezes resultados piores do que o necessário.`,
          textoNaTela: `Deixar para depois sai mais caro ❌`,
        },
        {
          scene: 3,
          duracao: "21–32s",
          description: "Apresente a solução — como fazer do jeito certo.",
          fala: `A solução é simples: contar com um ${vocab.profissional} especializado desde o início. Na ${name} em ${city}, ${vocab.oque_faz} com atenção real. Você resolve mais rápido, com menos custo e com resultado que dura.`,
          textoNaTela: `Do jeito certo desde o início ✅`,
        },
        {
          scene: 4,
          duracao: "33–39s",
          description: "Tom direto e acolhedor.",
          fala: `Quer fazer do jeito certo? Chame no WhatsApp agora.`,
          textoNaTela: `${name} · ${city} · WhatsApp 👇`,
        },
      ],
      screen_text: `${name} — ${tema} do jeito certo`,
      caption: `O erro que mais vejo com ${tema} — e como evitar. A ${name} em ${city} ${vocab.oque_faz} com atenção real. Chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Oi ${name}! Vi a dica sobre ${tema}. Quero fazer do jeito certo.`,
    },
    {
      title: headline,
      gancho: `Lista numerada cria senso de completude — o público fica para ver todos os pontos`,
      duracaoTotal: "30–42 segundos",
      vibeEdicao: "Cortes no ritmo — 1 corte por ponto. Texto na tela acompanhando cada item",
      musicaSugerida: "Beat animado e constante — algo que dá ritmo ao conteúdo educativo",
      scenes: [
        {
          scene: 1,
          duracao: "0–5s",
          description: "Olhe para câmera com energia — como quem vai ensinar algo rápido e valioso.",
          fala: `3 coisas que você precisa saber sobre ${tema} — que a maioria descobre tarde demais.`,
          textoNaTela: `3 coisas sobre ${tema} 📋`,
        },
        {
          scene: 2,
          duracao: "6–24s",
          description: "Fale os 3 pontos com ritmo — cada um com foco e texto na tela.",
          fala: `Um: ${tema} tem mais impacto do que parece no resultado final. Dois: quem tenta resolver sozinho geralmente paga mais caro depois. Três: o ${vocab.profissional} certo faz diferença desde a primeira conversa.`,
          textoNaTela: `1 · 2 · 3 — guarda isso 💡`,
        },
        {
          scene: 3,
          duracao: "25–35s",
          description: "Conecte com o serviço da ${name} de forma natural.",
          fala: `A ${name} em ${city} existe para cuidar de ${tema} do jeito certo — com atenção, técnica e resultado real.`,
          textoNaTela: `${name} · ${city} · Resultado real`,
        },
        {
          scene: 4,
          duracao: "36–41s",
          description: "Chamada direta com sorriso.",
          fala: `Chame no WhatsApp — primeira consulta sem compromisso.`,
          textoNaTela: `👇 WhatsApp na bio`,
        },
      ],
      screen_text: `${name} — 3 coisas sobre ${tema}`,
      caption: `3 coisas sobre ${tema} que fazem diferença no resultado. A ${name} em ${city} ${vocab.oque_faz} com cuidado real. Chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Oi ${name}! Vi a lista sobre ${tema}. Quero saber mais.`,
    },
  ];

  return roteiros[v % roteiros.length];
}

// ─── Roteiros para Reels — produção profissional ─────────────

function getReelsScript(input: ContentInput): ReelsScript {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const headline = input.headline ?? `${input.mainService} em ${input.city}`;
  const name = input.businessName;
  const city = input.city;
  const service = input.mainService;
  const seed = `${input.topic}${input.narrative ?? ""}${input.headline ?? ""}`;
  const v = variationIndex(seed, 6, input.variationSeed);

  const vocab = NICHE_VOCAB[input.niche] ?? NICHE_VOCAB.outro;

  const interpretation = interpretMagneticRequest({
    userInput: input.topic,
    businessName: name,
    niche: input.niche,
    city,
    mainService: service,
    services: input.services,
  });
  const tema = interpretation.temaInterpretado;
  const dor  = interpretation.doresPublico[0]  ?? "resultado abaixo do esperado";
  const dor2 = interpretation.doresPublico[1]  ?? "não saber por onde começar";
  const des  = interpretation.desejosPublico[0] ?? "resultado que transforma";

  // ── Despacha para roteiros específicos por intenção ──────────────
  if (interpretation.intencaoUsuario === "agenda aberta") {
    return getAgendaAbertaReels(input, vocab, name, city, cfg);
  }
  if (interpretation.isFreeTheme) {
    return getFreeThemeReels(input, name, city);
  }
  if (interpretation.intencaoUsuario === "promoção") {
    return getPromocaoReels(input, vocab, name, city, cfg);
  }
  if (interpretation.intencaoUsuario === "bastidores") {
    return getBastidoresReels(input, vocab, name, city, cfg);
  }
  if (interpretation.intencaoUsuario === "dica educativa") {
    return getDicaReels(input, vocab, name, city, cfg);
  }
  if (interpretation.intencaoUsuario === "cenário") {
    return getCenarioReels(input, vocab, name, city, cfg);
  }

  // ── 6 estruturas genuinamente diferentes ─────────────────────

  const genericos: ReelsScript[] = [

    // 1. DOR → SOLUÇÃO → PROVA → CTA  (pergunta direta que para o scroll)
    {
      title: headline,
      gancho: `Pergunta direta que expõe a dor e prende quem está passando pelo feed`,
      duracaoTotal: "30–40 segundos",
      vibeEdicao: "Cortes rápidos no ritmo da música — 1 corte a cada 3–4 segundos",
      musicaSugerida: "Trending no Reels — instrumental animado com batida constante",
      scenes: [
        {
          scene: 1,
          duracao: "0–4s",
          description: `Olhe direto para a câmera. Close no rosto. Expressão séria e confiante.`,
          fala: `Você ainda está sofrendo com ${dor}?`,
          textoNaTela: `${dor}? 👀`,
        },
        {
          scene: 2,
          duracao: "5–18s",
          description: `Mostre o ${vocab.trabalho} sendo realizado — o processo real da ${name} com atenção ao detalhe.`,
          fala: `A maioria das pessoas não sabe, mas ${dor} tem solução. Na ${name}, a gente ${vocab.oque_faz} com atenção individualizada. O resultado? ${vocab.o_resultado} — toda vez.`,
          textoNaTela: `${vocab.o_resultado} ✅`,
        },
        {
          scene: 3,
          duracao: "19–30s",
          description: `Mostre o resultado entregue — o que o cliente leva de concreto.`,
          fala: `É isso que nossos clientes levam. Estamos em ${city} com atendimento disponível essa semana.`,
          textoNaTela: `Resultado real 🔥`,
        },
        {
          scene: 4,
          duracao: "31–38s",
          description: `Olhe para câmera e aponte para baixo (indicando o link na bio).`,
          fala: `Chame agora pelo WhatsApp — é mais simples do que você pensa.`,
          textoNaTela: `📍 ${city} | 👇 WhatsApp na bio`,
        },
      ],
      screen_text: `${name} — ${cfg.cta}`,
      caption: `${tema} do jeito certo muda tudo. A ${name} em ${city} ${vocab.oque_faz} com cuidado real. Chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Olá, ${name}! Vi o Reels sobre ${tema} e quero ${vocab.chamar}.`,
    },

    // 2. BASTIDORES → PROCESSO → RESULTADO → CTA  (storytelling visual)
    {
      title: headline,
      gancho: `Mostrar o processo real por trás do trabalho cria curiosidade e confiança`,
      duracaoTotal: "35–45 segundos",
      vibeEdicao: "Transições suaves — cada cena com pelo menos 4–5 segundos. Ritmo mais calmo e storytelling",
      musicaSugerida: "Lo-fi instrumental ou música ambiente com leveza — sem letra",
      scenes: [
        {
          scene: 1,
          duracao: "0–5s",
          description: `Câmera gravando o ambiente enquanto você prepara o trabalho — o que o cliente nunca vê.`,
          fala: `Deixa eu te mostrar como a ${name} trabalha de verdade.`,
          textoNaTela: `Bastidores reais 🎬`,
        },
        {
          scene: 2,
          duracao: "6–20s",
          description: `Mostre o ${vocab.o_processo} em detalhes — prepare, execute, cuide.`,
          fala: `Cada ${vocab.trabalho} na ${name} começa com escuta. A gente entende o que você precisa e faz ${vocab.o_processo}. Nada é deixado de lado.`,
          textoNaTela: `${vocab.o_processo}`,
        },
        {
          scene: 3,
          duracao: "21–35s",
          description: `Resultado — mostre com orgulho o que foi entregue.`,
          fala: `E é isso que o cliente recebe. ${vocab.o_resultado}. Em ${city}, quem conhece a ${name} sabe que entrega real não é promessa — é rotina.`,
          textoNaTela: `${vocab.o_resultado} ✨`,
        },
        {
          scene: 4,
          duracao: "36–44s",
          description: `Fale direto para câmera, sorrindo.`,
          fala: `Atendimento disponível essa semana em ${city}. Chame pelo WhatsApp.`,
          textoNaTela: `${name} · ${city} · WhatsApp na bio 👇`,
        },
      ],
      screen_text: `${name} em ${city} — ${vocab.o_resultado}`,
      caption: `Por trás de cada ${vocab.trabalho} existe processo, atenção e dedicação. A ${name} em ${city} mostra tudo isso. Chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Oi ${name}! Vi o Reels e quero ${vocab.chamar}.`,
    },

    // 3. ERRO COMUM → REVELAÇÃO → COMO EVITAR → CTA  (educativo provocativo)
    {
      title: headline,
      gancho: `Revelar um erro que o público comete cria identificação instantânea`,
      duracaoTotal: "30–42 segundos",
      vibeEdicao: "Comece devagar (gancho sério) e acelere depois que revelar a solução",
      musicaSugerida: "Começa com suspense suave, aumenta no desenvolvimento — trending beats",
      scenes: [
        {
          scene: 1,
          duracao: "0–5s",
          description: `Olhe para câmera com expressão de quem vai revelar algo importante.`,
          fala: `O erro que a maioria das pessoas comete com ${tema} — e acaba pagando mais caro depois.`,
          textoNaTela: `O erro que você está cometendo ⚠️`,
        },
        {
          scene: 2,
          duracao: "6–18s",
          description: `Explique o problema sem apontar alguém — fale do cenário genérico.`,
          fala: `${dor2} é mais comum do que parece. E quem tenta resolver sem um ${vocab.profissional} especializado acaba investindo tempo e dinheiro sem resultado real.`,
          textoNaTela: `Sem especialista = sem resultado ❌`,
        },
        {
          scene: 3,
          duracao: "19–32s",
          description: `Mostre como a ${name} resolve — o processo correto.`,
          fala: `Na ${name}, cada ${vocab.trabalho} começa do zero: entendemos o que você precisa, fazemos ${vocab.o_processo} e entregamos ${vocab.o_resultado}. Sem atalho.`,
          textoNaTela: `Do jeito certo desde o início ✅`,
        },
        {
          scene: 4,
          duracao: "33–41s",
          description: `Chamada direta — olhe para câmera.`,
          fala: `Estamos em ${city} com atendimento disponível. WhatsApp na bio.`,
          textoNaTela: `${name} · ${city} 📍`,
        },
      ],
      screen_text: `${tema} do jeito certo — ${name}`,
      caption: `O erro com ${tema} que a maioria comete — e como a ${name} em ${city} resolve isso diferente. Chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Olá ${name}! Vi o Reels sobre ${tema} e quero entender melhor.`,
    },

    // 4. RESULTADO PRIMEIRO → COMO CHEGAMOS LÁ → CONVITE → CTA  (prova social reversa)
    {
      title: headline,
      gancho: `Mostrar o resultado antes de explicar cria curiosidade — o público quer saber como`,
      duracaoTotal: "35–45 segundos",
      vibeEdicao: "Abre com câmera lenta no resultado, depois cortes rápidos no processo",
      musicaSugerida: "Música inspiradora com build-up — começa suave e cresce",
      scenes: [
        {
          scene: 1,
          duracao: "0–5s",
          description: `Mostre logo de cara o resultado — o que o cliente ganhou. Câmera lenta.`,
          fala: `Esse é o resultado. Agora deixa eu te contar como chegamos aqui.`,
          textoNaTela: `${vocab.o_resultado} ✨`,
        },
        {
          scene: 2,
          duracao: "6–22s",
          description: `Mostre o processo em cortes rápidos — como a ${name} trabalha de verdade.`,
          fala: `Na ${name}, cada ${vocab.trabalho} começa com escuta. A gente faz ${vocab.o_processo} — com atenção e comprometimento do início ao fim. ${vocab.o_resultado} não acontece por acaso.`,
          textoNaTela: `Processo real. Resultado real.`,
        },
        {
          scene: 3,
          duracao: "23–35s",
          description: `Fale com naturalidade para a câmera.`,
          fala: `E esse resultado pode ser seu também. A ${name} está em ${city} com atendimento disponível essa semana.`,
          textoNaTela: `Você pode ter isso também 💡`,
        },
        {
          scene: 4,
          duracao: "36–44s",
          description: `Aponte para baixo ou indique o WhatsApp na bio.`,
          fala: `Chame no WhatsApp agora. A gente responde rápido.`,
          textoNaTela: `${name} · WhatsApp na bio 👇`,
        },
      ],
      screen_text: `${vocab.o_resultado} — ${name} em ${city}`,
      caption: `O resultado que nossos clientes levam — e o processo por trás. A ${name} em ${city} ${vocab.oque_faz} do jeito certo. Chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Oi, ${name}! Vi o Reels sobre ${tema} e quero saber mais.`,
    },

    // 5. TRANSFORMAÇÃO → EMOCIONAL → POR QUE NÓS → CTA  (conexão emocional)
    {
      title: headline,
      gancho: `Falar do sentimento que o cliente tem depois do resultado cria identificação imediata`,
      duracaoTotal: "35–45 segundos",
      vibeEdicao: "Ritmo médio — transições suaves, clima emocional e confiante",
      musicaSugerida: "Música com leveza e emoção — instrumental com piano ou violão",
      scenes: [
        {
          scene: 1,
          duracao: "0–6s",
          description: `Olhe para câmera com tranquilidade. Tom de conversa genuína.`,
          fala: `Sabe aquela sensação de resolver um problema que pesava — e finalmente respirar? É isso que a ${name} entrega.`,
          textoNaTela: `Esse alívio tem endereço 💙`,
        },
        {
          scene: 2,
          duracao: "7–20s",
          description: `Mostre o trabalho sendo realizado — clima positivo e humano.`,
          fala: `Quando alguém chega com ${dor} e sai com ${vocab.o_resultado}, isso não é sorte. É o resultado de ${vocab.o_processo} — com atenção real a cada caso.`,
          textoNaTela: `${dor} → ${vocab.o_resultado} 🔄`,
        },
        {
          scene: 3,
          duracao: "21–35s",
          description: `Mostre o ambiente ou a equipe com expressão positiva.`,
          fala: `A ${name} existe pra isso. Em ${city}, com um atendimento que você vai lembrar — e recomendar.`,
          textoNaTela: `${name} em ${city} 📍`,
        },
        {
          scene: 4,
          duracao: "36–44s",
          description: `Sorria e aponte para baixo.`,
          fala: `Essa semana tem atendimento disponível. Chame pelo WhatsApp agora.`,
          textoNaTela: `👇 WhatsApp na bio`,
        },
      ],
      screen_text: `${name} — ${vocab.trabalho} com cuidado real`,
      caption: `${vocab.o_resultado} — e um atendimento que você vai indicar. A ${name} em ${city} ${vocab.oque_faz} com atenção real. Chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Oi ${name}! Vi o Reels e quero ${vocab.chamar}.`,
    },

    // 6. COMPARAÇÃO → DIFERENCIAL → AUTORIDADE → CTA  (posicionamento)
    {
      title: headline,
      gancho: `Questionar o padrão do mercado cria contraste e posiciona o negócio como superior`,
      duracaoTotal: "35–48 segundos",
      vibeEdicao: "Começa sério/questionador e vai ficando mais confiante — cortes moderados",
      musicaSugerida: "Beat confiante e constante — sem letra, só ritmo",
      scenes: [
        {
          scene: 1,
          duracao: "0–5s",
          description: `Olhe para câmera com expressão questionadora. Um leve sorriso no final.`,
          fala: `Você acha que todo ${vocab.profissional} é igual? A ${name} discorda.`,
          textoNaTela: `Nem todo ${vocab.profissional} é igual 🤔`,
        },
        {
          scene: 2,
          duracao: "6–20s",
          description: `Mostre o que diferencia o trabalho da ${name} — processo, atenção, detalhe.`,
          fala: `A maioria faz o básico. A ${name} vai além. Cada ${vocab.trabalho} aqui começa com entender o que você realmente precisa — não em aplicar um modelo padrão pra todo mundo.`,
          textoNaTela: `O padrão vs. o que fazemos ⬆️`,
        },
        {
          scene: 3,
          duracao: "21–36s",
          description: `Mostre resultado ou equipe com confiança.`,
          fala: `Anos de experiência em ${city} resultam em atendimento que você percebe desde o primeiro contato. Clientes que chegam uma vez, voltam. E indicam.`,
          textoNaTela: `Clientes que voltam. Sempre. 💛`,
        },
        {
          scene: 4,
          duracao: "37–47s",
          description: `Chamada direta — olhe para câmera e sorria.`,
          fala: `Experimente a diferença. Atendimento disponível essa semana — chame pelo WhatsApp.`,
          textoNaTela: `${name} · ${city} · ${cfg.cta} 👇`,
        },
      ],
      screen_text: `${name} — diferente de verdade`,
      caption: `Nem todo ${vocab.profissional} é igual. A ${name} em ${city} ${vocab.oque_faz} do jeito que você vai perceber. Chame no WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Olá ${name}! Vi o Reels e quero entender o que diferencia o atendimento de vocês.`,
    },
  ];

  // ── Roteiros específicos por nicho (mais contextuais) ─────────

  const nicheEspecificos: Partial<Record<string, ReelsScript[]>> = {
    barbearia: [
      {
        title: headline,
        gancho: `Autoconfiança é o produto real de uma boa barbearia — começar por aí gera identificação imediata`,
        duracaoTotal: "30–40 segundos",
        vibeEdicao: "Cortes no ritmo da música — visual impecável, estético, moderno",
        musicaSugerida: "Hip-hop instrumental moderno ou trending de barbearia no Reels",
        scenes: [
          {
            scene: 1,
            duracao: "0–5s",
            description: "Close no espelho enquanto você (barbeiro) faz a arrumação final — expressão séria e confiante.",
            fala: `Visual descuidado fala por você antes de você abrir a boca. E as pessoas decidem isso em segundos.`,
            textoNaTela: `A primeira impressão é visual 👁️`,
          },
          {
            scene: 2,
            duracao: "6–20s",
            description: "Processo de corte em detalhe — tesoura, navalha, pente. Câmera fechada no trabalho.",
            fala: `Na ${name}, cada corte começa pela conversa. A gente ouve o que você quer, avalia o que fica melhor e entrega o ${tema} que vai te deixar com aquela autoconfiança que você merece.`,
            textoNaTela: `Técnica + atenção = resultado 🏆`,
          },
          {
            scene: 3,
            duracao: "21–32s",
            description: "Resultado final — mostre o cliente satisfeito (ou encenar) com o look impecável.",
            fala: `Em ${city}, quem quer ${tema} de verdade sabe onde ir. Agenda aberta essa semana.`,
            textoNaTela: `${name} · ${city} ✦`,
          },
          {
            scene: 4,
            duracao: "33–39s",
            description: "Barbeiro olhando para câmera, aponta para baixo.",
            fala: `Chame pelo WhatsApp agora — as vagas enchem rápido.`,
            textoNaTela: `Agendar pelo WhatsApp 👇`,
          },
        ],
        screen_text: `${name} em ${city} — agende pelo WhatsApp`,
        caption: `Visual impecável começa com técnica real. A ${name} atende em ${city} com atenção a cada detalhe. Agende pelo WhatsApp 👇`,
        cta: "Agendar pelo WhatsApp",
        whatsapp_message: `Olá ${name}! Vi o Reels e quero agendar um horário para ${tema}.`,
      },
      {
        title: headline,
        gancho: `Mostrar a transformação antes/depois de uma barbearia é o conteúdo que mais para o scroll`,
        duracaoTotal: "35–45 segundos",
        vibeEdicao: "Divide em antes e depois — transição dramática no meio. Câmera lenta no reveal",
        musicaSugerida: "Música dramática com build-up — algo que sobe de intensidade no reveal",
        scenes: [
          {
            scene: 1,
            duracao: "0–5s",
            description: "Mostre o cliente chegando (cabelo sem corte) — ângulo lateral, sério.",
            fala: `Deixa eu te mostrar o que ${tema} certo faz.`,
            textoNaTela: `Antes ⬇️`,
          },
          {
            scene: 2,
            duracao: "6–20s",
            description: "Processo em cortes rápidos — close na tesoura, no acabamento, nos detalhes.",
            fala: `Na ${name}, cada detalhe é calculado. Perfil, testa, estrutura do rosto — tudo é considerado para que o resultado seja exatamente o que você imaginou.`,
            textoNaTela: `Técnica de verdade 🔪✂️`,
          },
          {
            scene: 3,
            duracao: "21–37s",
            description: "REVEAL — câmera lenta no resultado final. Espelho mostrando o antes/depois.",
            fala: `E esse é o resultado. Em ${city}, quando o assunto é ${tema}, a ${name} entrega.`,
            textoNaTela: `Depois ⬆️ 🔥`,
          },
          {
            scene: 4,
            duracao: "38–44s",
            description: "Barbeiro sorrindo para câmera.",
            fala: `Sua vez. Chame agora pelo WhatsApp — agenda aberta.`,
            textoNaTela: `${name} · Agendar pelo WhatsApp 👇`,
          },
        ],
        screen_text: `Antes e depois — ${name} em ${city}`,
        caption: `O poder de um ${tema} bem feito. A ${name} em ${city} entrega transformação real. Agende pelo WhatsApp 👇`,
        cta: "Agendar agora",
        whatsapp_message: `Oi ${name}! Vi o Reels e quero agendar ${tema} com vocês.`,
      },
      {
        title: headline,
        gancho: `Falar do sentimento de sair da barbearia confiante cria identificação com o público masculino`,
        duracaoTotal: "30–40 segundos",
        vibeEdicao: "Vibe confiante e casual — como uma conversa com o barbeiro. Natural e sem exagero",
        musicaSugerida: "Lofi ou R&B instrumental — algo calmo e confiante",
        scenes: [
          {
            scene: 1,
            duracao: "0–6s",
            description: "Barbeiro olhando para câmera com naturalidade — tom de conversa.",
            fala: `Sabe aquele dia que você sai da barbearia e sente que pode encarar qualquer coisa? É o que a ${name} entrega.`,
            textoNaTela: `Essa sensação tem endereço 📍`,
          },
          {
            scene: 2,
            duracao: "7–22s",
            description: "Cenas do trabalho sendo feito com cuidado e conversa natural com o cliente.",
            fala: `${tema} de qualidade não é só estética — é como você se sente depois. Na ${name} em ${city}, cada cliente recebe atenção individual. Avaliamos, conversamos, entregamos.`,
            textoNaTela: `Atenção individual. Sempre.`,
          },
          {
            scene: 3,
            duracao: "23–33s",
            description: "Resultado final ou ambiente da barbearia — clima tranquilo.",
            fala: `Agenda aberta essa semana em ${city}. A gente não te deixa esperando.`,
            textoNaTela: `${name} · Sem espera ✅`,
          },
          {
            scene: 4,
            duracao: "34–39s",
            description: "Barbeiro aponta para baixo — sorrindo.",
            fala: `Chame no WhatsApp agora.`,
            textoNaTela: `👇 WhatsApp na bio`,
          },
        ],
        screen_text: `${name} em ${city} — ${tema} que você vai lembrar`,
        caption: `${tema} que faz diferença no dia inteiro. A ${name} em ${city} trabalha com cuidado e atenção real. WhatsApp na bio 👇`,
        cta: "Agendar pelo WhatsApp",
        whatsapp_message: `Olá ${name}! Vi o Reels e quero agendar um horário para ${tema}.`,
      },
    ],

    odontologia: [
      {
        title: headline,
        gancho: `A dor de adiar o dentista ressoa com quem vai procrastinando — identificação imediata`,
        duracaoTotal: "35–45 segundos",
        vibeEdicao: "Clima profissional e acolhedor — cortes suaves, ambiente limpo e confiável",
        musicaSugerida: "Instrumental leve e confiante — sem estresse, clima de cuidado",
        scenes: [
          {
            scene: 1,
            duracao: "0–6s",
            description: "Profissional sorrindo para câmera — ambiente organizado da clínica ao fundo.",
            fala: `Você está adiando o dentista? Eu sei que é comum. Mas preciso te contar o que acontece quando você espera demais.`,
            textoNaTela: `Adiando o dentista? 🦷`,
          },
          {
            scene: 2,
            duracao: "7–22s",
            description: "Mostrar a estrutura da clínica — equipamentos modernos, ambiente limpo e organizado.",
            fala: `Problemas bucais pequenos crescem em silêncio. O que hoje seria uma limpeza simples pode virar um tratamento muito maior — e mais caro. A ${name} em ${city} cuida do seu sorriso antes que isso aconteça.`,
            textoNaTela: `Prevenção sai mais barato 💡`,
          },
          {
            scene: 3,
            duracao: "23–36s",
            description: "Profissional demonstrando um atendimento ou falando com atenção para o paciente.",
            fala: `${tema} feito corretamente é simples, rápido e sem dor. A gente cuida de tudo com atenção e profissionalismo para que você saia daqui sorrindo — literalmente.`,
            textoNaTela: `Sem dor. Sem complicação. ✅`,
          },
          {
            scene: 4,
            duracao: "37–44s",
            description: "Profissional olhando para câmera com gentileza e sorrindo.",
            fala: `Agende sua avaliação essa semana. WhatsApp na bio — resposta rápida.`,
            textoNaTela: `${name} · ${city} · Agendar 👇`,
          },
        ],
        screen_text: `${name} em ${city} — agende sua avaliação`,
        caption: `Adiar ${tema} sai mais caro depois. A ${name} em ${city} cuida do seu sorriso com cuidado real. Agende pelo WhatsApp 👇`,
        cta: "Agendar avaliação",
        whatsapp_message: `Olá, ${name}! Vi o Reels sobre ${tema} e quero agendar uma avaliação.`,
      },
      {
        title: headline,
        gancho: `Mostrar o sorriso como um ativo social (confiança, impressão) cria desejo imediato`,
        duracaoTotal: "35–42 segundos",
        vibeEdicao: "Clima positivo e aspiracional — sorrisos, ambiente moderno, confiança",
        musicaSugerida: "Música inspiradora e leve — algo que passa positividade",
        scenes: [
          {
            scene: 1,
            duracao: "0–5s",
            description: "Close em um sorriso bonito — pode ser do profissional ou de forma genérica.",
            fala: `O sorriso é uma das primeiras coisas que as pessoas notam em você. Faz sentido cuidar dele.`,
            textoNaTela: `A primeira impressão começa aqui 😁`,
          },
          {
            scene: 2,
            duracao: "6–20s",
            description: "Mostrar o ambiente e procedimentos de forma acolhedora.",
            fala: `Na ${name} em ${city}, ${tema} é feito com atenção, equipamentos modernos e um cuidado que você sente desde o primeiro contato. Sorriso saudável e bonito não é luxo — é cuidado acessível.`,
            textoNaTela: `Cuidado real. Resultado que aparece.`,
          },
          {
            scene: 3,
            duracao: "21–34s",
            description: "Profissional ou paciente com expressão satisfeita — clima de cuidado.",
            fala: `Clientes que passaram pela ${name} não precisam esconder o sorriso — eles mostram com orgulho.`,
            textoNaTela: `Sorriso que você se orgulha 🌟`,
          },
          {
            scene: 4,
            duracao: "35–41s",
            description: "Profissional aponta para câmera ou para baixo.",
            fala: `Agende sua avaliação. WhatsApp na bio — a gente responde rápido.`,
            textoNaTela: `${name} · ${city} · Agendar 👇`,
          },
        ],
        screen_text: `${name} — sorriso que você vai mostrar`,
        caption: `Sorriso bonito começa com cuidado certo. A ${name} em ${city} cuida do seu com atenção real. Agende pelo WhatsApp 👇`,
        cta: "Agendar avaliação",
        whatsapp_message: `Oi ${name}! Vi o Reels e quero agendar ${tema} com vocês.`,
      },
    ],

    estetica: [
      {
        title: headline,
        gancho: `Cuidar da pele como ato de amor próprio ressoa fortemente com o público feminino`,
        duracaoTotal: "35–45 segundos",
        vibeEdicao: "Vibe leve, feminina e acolhedora — iluminação suave, clima de spa",
        musicaSugerida: "Música relaxante e positiva — instrumental com piano ou sons suaves",
        scenes: [
          {
            scene: 1,
            duracao: "0–5s",
            description: "Close na pele ou no ambiente preparado — luz suave, clima acolhedor.",
            fala: `Cuidar da pele não é vaidade. É respeito por si mesma.`,
            textoNaTela: `Autocuidado que faz diferença 💆‍♀️`,
          },
          {
            scene: 2,
            duracao: "6–22s",
            description: "Mostrar o processo de atendimento — mãos cuidando, produtos sendo aplicados, ambiente organizado.",
            fala: `Na ${name}, ${tema} é feito com produtos de qualidade, técnica real e atenção ao que cada pele precisa. Porque pele saudável é resultado de cuidado profissional — não de sorte.`,
            textoNaTela: `Técnica + cuidado = pele real ✨`,
          },
          {
            scene: 3,
            duracao: "23–36s",
            description: "Resultado — cliente (ou profissional encenando) com expressão de satisfação e pele radiante.",
            fala: `Em ${city}, quem cuida da pele com a ${name} sai renovada. É isso que a gente entrega.`,
            textoNaTela: `${des} 🌸`,
          },
          {
            scene: 4,
            duracao: "37–44s",
            description: "Profissional sorrindo e apontando para baixo.",
            fala: `Tem horário disponível essa semana. Chame pelo WhatsApp agora.`,
            textoNaTela: `${name} · ${city} · Agendar 👇`,
          },
        ],
        screen_text: `${name} — ${tema} com cuidado real`,
        caption: `Pele saudável é resultado de cuidado profissional. A ${name} em ${city} entrega ${tema} com atenção real. Chame no WhatsApp 👇`,
        cta: "Agendar atendimento",
        whatsapp_message: `Olá ${name}! Vi o Reels e quero agendar ${tema} com vocês.`,
      },
    ],

    advogacia: [
      {
        title: headline,
        gancho: `Revelar um direito que o público não conhece gera impacto imediato e autoridade`,
        duracaoTotal: "35–45 segundos",
        vibeEdicao: "Início sério e impactante, depois confiante e resolutivo. Cortes moderados.",
        musicaSugerida: "Beat discreto e profissional — música instrumental sem letra, tom sério",
        scenes: [
          {
            scene: 1,
            duracao: "0–5s",
            description: "Olhe direto para câmera. Expressão séria, confiante. Tom de quem vai revelar algo importante.",
            fala: `Você sabia que tem direitos que pode estar perdendo por não ter assessoria jurídica?`,
            textoNaTela: `Seus direitos. Você conhece todos? ⚖️`,
          },
          {
            scene: 2,
            duracao: "6–20s",
            description: "Mostre o ambiente do escritório ou você trabalhando — computador, documentos, livros jurídicos.",
            fala: `${dor} acontece com muita gente. E a maioria não age porque não sabe que existe solução jurídica. Na ${name}, analisamos cada caso com atenção e construímos a estratégia certa para garantir seus direitos.`,
            textoNaTela: `Todo caso tem solução. A gente encontra. ✅`,
          },
          {
            scene: 3,
            duracao: "21–34s",
            description: "Fale com segurança — como alguém que resolve problemas.",
            fala: `Problema jurídico não resolvido cresce com o tempo. Quanto antes você age, mais opções você tem. A ${name} está em ${city} para te orientar.`,
            textoNaTela: `Não espere. Seus direitos não esperam. ⏳`,
          },
          {
            scene: 4,
            duracao: "35–44s",
            description: "Olhe para câmera e aponte para baixo.",
            fala: `Agende uma consulta pelo WhatsApp — a primeira conversa é sem compromisso.`,
            textoNaTela: `${name} · ${city} · Consulta 👇`,
          },
        ],
        screen_text: `${name} — seus direitos garantidos`,
        caption: `Você tem direitos que pode estar perdendo. A ${name} em ${city} analisa seu caso e garante a representação que você merece. Chame no WhatsApp 👇`,
        cta: "Agendar consulta",
        whatsapp_message: `Olá, ${name}! Vi o Reels e quero agendar uma consulta para discutir meu caso.`,
      },
      {
        title: headline,
        gancho: `Mostrar o antes/depois de um caso jurídico (sem identificar) cria prova social real`,
        duracaoTotal: "35–45 segundos",
        vibeEdicao: "Narrativa linear — ritmo calmo e resolutivo. Não precisa ser acelerado.",
        musicaSugerida: "Instrumental profissional e discreto — sem percussão forte",
        scenes: [
          {
            scene: 1,
            duracao: "0–6s",
            description: "Ambiente do escritório. Olhe para câmera com expressão de quem vai contar uma história.",
            fala: `Deixa eu te contar o que acontece quando você resolve um problema jurídico com quem entende.`,
            textoNaTela: `Uma história real ⚖️`,
          },
          {
            scene: 2,
            duracao: "7–22s",
            description: "Mostre você trabalhando — documentos, computador, análise de caso.",
            fala: `Um cliente chegou até a ${name} com ${dor}. Achava que não tinha saída. Depois de análise completa, identificamos os direitos que ele desconhecia — e construímos uma estratégia sólida. Resultado: ${des}.`,
            textoNaTela: `Antes: ${dor} → Depois: ${des}`,
          },
          {
            scene: 3,
            duracao: "23–36s",
            description: "Olhe para câmera com confiança.",
            fala: `Cada caso é diferente. Mas o compromisso da ${name} é o mesmo em todos: análise séria, estratégia real e defesa com dedicação.`,
            textoNaTela: `Todo caso merece dedicação real. 💼`,
          },
          {
            scene: 4,
            duracao: "37–44s",
            description: "Fale diretamente para câmera, sério e acolhedor.",
            fala: `Tem algum problema jurídico que está te preocupando? Chame no WhatsApp. A gente analisa seu caso.`,
            textoNaTela: `${name} · ${city} · WhatsApp na bio 👇`,
          },
        ],
        screen_text: `${name} — resolução jurídica real`,
        caption: `Problema jurídico sem representação só cresce. A ${name} em ${city} analisa seu caso e constrói a defesa que você merece. Chame no WhatsApp 👇`,
        cta: "Agendar consulta",
        whatsapp_message: `Oi ${name}! Vi o Reels e gostaria de conversar sobre um caso jurídico.`,
      },
      {
        title: headline,
        gancho: `Ensinar um direito que o público não conhece posiciona como autoridade e gera compartilhamento`,
        duracaoTotal: "30–40 segundos",
        vibeEdicao: "Educativo e direto — como uma aula rápida. Pode usar texto na tela como destaque principal.",
        musicaSugerida: "Instrumental leve e neutro — não compete com a fala",
        scenes: [
          {
            scene: 1,
            duracao: "0–5s",
            description: "Olhe para câmera com expressão de quem vai ensinar algo valioso.",
            fala: `${tema} — o direito que muita gente tem mas não sabe que pode usar.`,
            textoNaTela: `Você conhece esse direito? ⚖️`,
          },
          {
            scene: 2,
            duracao: "6–22s",
            description: "Explique de forma simples — como se estivesse conversando com um amigo.",
            fala: `Segundo a lei, em casos de ${tema}, o cidadão tem o direito de exigir reparação. Mas poucos sabem disso — e acabam aceitando algo que não precisavam aceitar. A ${name} existe para orientar e representar quem está nessa situação.`,
            textoNaTela: `Você não precisa aceitar. A lei te protege. ✅`,
          },
          {
            scene: 3,
            duracao: "23–33s",
            description: "Continue falando para câmera — tom de conselho jurídico.",
            fala: `Se você está passando por isso ou conhece alguém que está, vale buscar orientação antes que o prazo passe.`,
            textoNaTela: `Prazo jurídico existe. Não perca o seu. ⏳`,
          },
          {
            scene: 4,
            duracao: "34–39s",
            description: "Aponte para baixo ou para o lado da câmera.",
            fala: `Chame no WhatsApp agora — primeira conversa sem compromisso.`,
            textoNaTela: `${name} · ${city} · Consulta 👇`,
          },
        ],
        screen_text: `${name} — direito que você precisa conhecer`,
        caption: `${tema} — o direito que muita gente tem mas não sabe usar. A ${name} em ${city} orienta e representa. Chame no WhatsApp 👇`,
        cta: "Agendar consulta",
        whatsapp_message: `Olá ${name}! Vi o Reels sobre ${tema} e quero entender melhor minha situação.`,
      },
    ],

    mecanica: [
      {
        title: headline,
        gancho: `Falar de segurança no trânsito e manutenção cria urgência genuína`,
        duracaoTotal: "30–40 segundos",
        vibeEdicao: "Direto ao ponto — visual técnico e confiante",
        musicaSugerida: "Beat constante e confiante — sem letra",
        scenes: [
          {
            scene: 1,
            duracao: "0–5s",
            description: "Close no mecânico com expressão séria e confiante.",
            fala: `Você sabe quando foi a última revisão do seu carro? Porque o seu veículo sabe.`,
            textoNaTela: `Quando foi a última revisão? 🚗`,
          },
          {
            scene: 2,
            duracao: "6–20s",
            description: "Mostrar diagnóstico ou serviço sendo realizado com profissionalismo.",
            fala: `Na ${name} em ${city}, ${tema} começa com um diagnóstico honesto — sem inventar problema, sem esconder o que existe. Transparência total do começo ao fim.`,
            textoNaTela: `Diagnóstico honesto. Sempre. ✅`,
          },
          {
            scene: 3,
            duracao: "21–32s",
            description: "Mostrar o carro saindo em bom estado — equipe com expressão satisfeita.",
            fala: `Carro revisado é carro seguro. E segurança no trânsito não tem preço.`,
            textoNaTela: `Segurança começa na manutenção 🔧`,
          },
          {
            scene: 4,
            duracao: "33–39s",
            description: "Mecânico olhando para câmera.",
            fala: `Agende sua revisão pelo WhatsApp — a gente atende essa semana em ${city}.`,
            textoNaTela: `${name} · ${city} · Orçamento 👇`,
          },
        ],
        screen_text: `${name} — revisão que você pode confiar`,
        caption: `Revisão não é gasto — é segurança. A ${name} em ${city} cuida do seu veículo com honestidade e técnica. Solicite um orçamento pelo WhatsApp 👇`,
        cta: "Solicitar orçamento",
        whatsapp_message: `Olá ${name}! Vi o Reels e quero agendar ${tema} para o meu carro.`,
      },
    ],
  };

  const especificos = nicheEspecificos[input.niche];
  if (especificos && especificos.length > 0) {
    return especificos[v % especificos.length];
  }

  return genericos[v % genericos.length];
}

// ─── Carrossel visual — guiado pelo tema real ────────────────

function getCarouselContent(input: ContentInput): CarouselContent {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const headline = input.headline ?? `3 motivos para escolher ${input.businessName}`;
  const name = input.businessName;
  const city = input.city;
  const service = input.mainService;
  const seed = `${input.topic}${input.narrative ?? ""}${input.headline ?? ""}`;
  const v = variationIndex(seed, 3, input.variationSeed);

  const interpretation = interpretMagneticRequest({
    userInput: input.topic,
    businessName: name,
    niche: input.niche,
    city,
    mainService: service,
    services: input.services,
  });
  const tema = interpretation.temaInterpretado;
  const dor = interpretation.doresPublico[0] ?? "problema com o serviço";
  const dor2 = interpretation.doresPublico[1] ?? "resultado insatisfatório";
  const des = interpretation.desejosPublico[0] ?? "resultado que transforma";
  const des2 = interpretation.desejosPublico[1] ?? "qualidade e confiança";
  const kw = interpretation.palavrasChave.nicho.slice(0, 3);

  type SlideSet = {
    slides: {
      slide: number; text: string; title?: string; body?: string;
      emoji?: string; type?: "cover" | "content" | "cta";
      bg?: "primary" | "white" | "dark";
    }[];
    caption: string;
    whatsapp: string;
  };

  const variants: SlideSet[] = [
    {
      slides: [
        { slide: 1, title: headline, body: `Por que ${tema} faz toda a diferença — entenda.`, emoji: "⭐", type: "cover", bg: "primary", text: headline },
        { slide: 2, title: `O problema real`, body: `${dor} é mais comum do que parece. E quem enfrenta isso sabe: resolver com profissional certo muda tudo.`, emoji: "🎯", type: "content", bg: "white", text: `1. O problema que ${tema} resolve` },
        { slide: 3, title: `O que você realmente deseja`, body: `${des}. Esse é o resultado que clientes da ${name} alcançam com ${tema} bem feito em ${city}.`, emoji: "✨", type: "content", bg: "white", text: `2. O resultado que ${tema} pode entregar` },
        { slide: 4, title: `O diferencial da ${name}`, body: `Na ${name}, ${tema} é feito com atenção individual, técnica real e compromisso com o seu resultado — não um atendimento padrão.`, emoji: "🏆", type: "content", bg: "white", text: `3. Por que a ${name} é diferente` },
        { slide: 5, title: `${name} em ${city}`, body: `Palavras do nosso trabalho: ${kw.join(" · ")}. Qualidade que os clientes recomendam.`, emoji: "📍", type: "content", bg: "white", text: `${name} — referência em ${tema} em ${city}` },
        { slide: 6, title: cfg.cta, body: `Chame agora pelo WhatsApp. Agenda disponível, resposta rápida.`, emoji: "📲", type: "cta", bg: "dark", text: `${cfg.cta} — ${name}` },
      ],
      caption: `${tema} feito certo muda tudo. A ${name} em ${city} entrega resultado com atenção real. Chame no WhatsApp e garante seu horário 👇`,
      whatsapp: `Olá! Vi o carrossel sobre ${tema} e quero saber mais sobre atendimento na ${name}.`,
    },
    {
      slides: [
        { slide: 1, title: headline, body: `O que ${tema} pode fazer por você — veja.`, emoji: "💡", type: "cover", bg: "dark", text: headline },
        { slide: 2, title: `Por que ${dor2} acontece`, body: `Sem o profissional certo, ${dor2} é quase certo. A ${name} existe para resolver isso de forma definitiva.`, emoji: "⚠️", type: "content", bg: "white", text: `Por que ${dor2} acontece — e como evitar` },
        { slide: 3, title: `O que ${des2} realmente significa`, body: `Na ${name}, cada cliente recebe ${des2} de forma consistente. Isso não é por acaso — é processo.`, emoji: "💎", type: "content", bg: "white", text: `${des2} — o compromisso da ${name}` },
        { slide: 4, title: `Atendimento personalizado`, body: `${tema} em ${city} feito pensando em você especificamente. Não em um cliente genérico.`, emoji: "🎯", type: "content", bg: "white", text: `Atendimento pensado para você` },
        { slide: 5, title: `Referência em ${city}`, body: `A ${name} é o endereço que clientes indicam para quem busca ${tema} de qualidade real em ${city}.`, emoji: "📍", type: "content", bg: "white", text: `Referência em ${tema} em ${city}` },
        { slide: 6, title: `Garanta seu horário agora`, body: `WhatsApp aberto. Agenda disponível. Chame agora.`, emoji: "📱", type: "cta", bg: "primary", text: `Agende agora — ${name}` },
      ],
      caption: `${tema} que transforma. A ${name} em ${city} trabalha com qualidade e cuidado real. Chame no WhatsApp 👇`,
      whatsapp: `Oi ${name}! Vi o carrossel e quero marcar um horário para ${tema}.`,
    },
    {
      slides: [
        { slide: 1, title: headline, body: `Conheça quem faz ${tema} diferente em ${city}.`, emoji: "🔍", type: "cover", bg: "primary", text: headline },
        { slide: 2, title: `Experiência que se vê`, body: `Anos de experiência em ${tema} em ${city}. Na ${name}, cada cliente recebe o benefício de um conhecimento construído com prática real.`, emoji: "📈", type: "content", bg: "white", text: `Experiência que se vê no resultado` },
        { slide: 3, title: `Processo transparente`, body: `Do primeiro contato até o resultado final, a ${name} acompanha cada etapa. Sem surpresas, sem promessas vazias.`, emoji: "🛡️", type: "content", bg: "white", text: `Processo transparente do início ao fim` },
        { slide: 4, title: `Confiança que se constrói`, body: `A ${name} cresceu pelo boca a boca — clientes satisfeitos indicando para quem confiam. Isso não se compra.`, emoji: "🌟", type: "content", bg: "white", text: `Confiança construída cliente a cliente` },
        { slide: 5, title: `${tema} em ${city}`, body: `Se você está em ${city} e precisa de ${tema} com qualidade, a ${name} é o endereço certo.`, emoji: "🏡", type: "content", bg: "white", text: `${tema} em ${city} — ${name}` },
        { slide: 6, title: `${cfg.cta} agora`, body: `WhatsApp aberto. Resposta rápida. Sem burocracia.`, emoji: "⚡", type: "cta", bg: "dark", text: `${cfg.cta} — ${name}` },
      ],
      caption: `A ${name} em ${city} faz ${tema} com experiência e cuidado real. Chame no WhatsApp 👇`,
      whatsapp: `Olá ${name}! Vi o carrossel e tenho interesse em ${tema}.`,
    },
  ];

  const chosen = variants[v % variants.length];

  return {
    theme: headline,
    slides: chosen.slides,
    caption: chosen.caption,
    whatsapp_message: chosen.whatsapp,
  };
}

// ─── Stories ──────────────────────────────────────────────────

function getStorySequence(input: ContentInput): StorySequence {
  const name = input.businessName;
  const city = input.city;
  const service = input.mainService;
  const seed = `${input.topic}${input.narrative ?? ""}`;
  const v = variationIndex(seed, 3, input.variationSeed);

  const interpretation = interpretMagneticRequest({
    userInput: input.topic,
    businessName: name,
    niche: input.niche,
    city,
    mainService: service,
    services: input.services,
  });
  const tema = interpretation.temaInterpretado;

  const variants: StorySequence[] = [
    {
      stories: [
        { story: 1, text: `Você já pensou em ${tema}?`, type: "pergunta" },
        { story: 2, text: `A ${name} atende em ${city} com qualidade e agilidade — do primeiro contato ao resultado.`, type: "apresentação" },
        { story: 3, text: `Chame no WhatsApp agora e tire suas dúvidas sem compromisso.`, type: "chamada" },
        { story: 4, text: `Quanto você acha que custa ${tema}? Responde aqui ↓`, type: "caixinha" },
      ],
      cta: `Chamar no WhatsApp — ${name}`,
      whatsapp_message: `Olá, ${name}! Vi os stories e quero saber mais sobre ${tema} em ${city}.`,
    },
    {
      stories: [
        { story: 1, text: `Sabia que ${tema} pode mudar seu resultado de verdade?`, type: "pergunta" },
        { story: 2, text: `Na ${name} em ${city}, cada atendimento é feito com cuidado e atenção individualizada ao que você precisa.`, type: "apresentação" },
        { story: 3, text: `Agenda aberta essa semana — sem fila, sem espera, resultado garantido.`, type: "chamada" },
        { story: 4, text: `Qual é sua maior dúvida sobre ${tema}? Manda aqui ↓`, type: "caixinha" },
      ],
      cta: `Ver valores pelo WhatsApp`,
      whatsapp_message: `Oi ${name}! Vi o story sobre ${tema} e quero saber mais.`,
    },
    {
      stories: [
        { story: 1, text: `Até quando você vai adiar ${tema}?`, type: "pergunta" },
        { story: 2, text: `A ${name} tem o que você precisa em ${city} — com qualidade real e atendimento pelo WhatsApp.`, type: "apresentação" },
        { story: 3, text: `Uma mensagem no WhatsApp resolve tudo. A gente responde rápido mesmo.`, type: "chamada" },
        { story: 4, text: `Me conta: o que te impede de resolver ${tema} essa semana?`, type: "caixinha" },
      ],
      cta: `Chamar no WhatsApp`,
      whatsapp_message: `Olá ${name}! Vi os stories sobre ${tema} e quero mais informações.`,
    },
  ];

  return variants[v % variants.length];
}

// ─── Caption ─────────────────────────────────────────────────

function getCaption(input: ContentInput): string {
  const variations = getCaptionVariations(input);
  return variations[0];
}

// ─── 4 estilos de legenda (educativo/provocativo/storytelling/direto) ──

function getCaptionVariations(input: ContentInput): string[] {
  const name = input.businessName;
  const city = input.city;
  const headline = input.headline ?? input.mainService;
  const seed = `${input.topic}${input.narrative ?? ""}`;
  const v = variationIndex(seed, 3, input.variationSeed);

  const interpretation = interpretMagneticRequest({
    userInput: input.topic,
    businessName: name,
    niche: input.niche,
    city,
    mainService: input.mainService,
    services: input.services,
  });
  const tema = interpretation.temaInterpretado;
  const dor = interpretation.doresPublico[0] ?? "não ter o resultado que merece";
  const desejo = interpretation.desejosPublico[0] ?? "o resultado que você quer";

  const nicheTag = input.niche.replace(/-/g, "");
  const cityTag = city.toLowerCase().replace(/[\s-]/g, "");
  const temaTag = tema.toLowerCase().replace(/[\s-]/g, "").replace(/[^a-z0-9]/g, "");

  const sets = [
    {
      educativo: `${headline}.\n\n${dor} é mais comum do que parece — e quem não resolve a tempo, paga um preço maior depois.\n\nA ${name} trabalha com ${tema} em ${city} com técnica real, atenção individual e resultado que você vê.\n\nChame no WhatsApp e veja como funciona 👇\n\n#${nicheTag} #${cityTag} #${temaTag}`,
      provocativo: `Você ainda vai adiar ${tema}?\n\n${dor} não some sozinha. Enquanto você espera, o problema cresce — e a solução fica mais cara.\n\nA ${name} tem horário disponível agora em ${city}. Um WhatsApp resolve.\n\nChame agora 👇\n\n#${nicheTag} #${temaTag}`,
      storytelling: `${headline}.\n\nImagina: você chega com ${dor}. Sai da ${name} com ${desejo}.\n\nÉ isso que acontece em ${city}, toda semana, com quem decide agir. Você quer ser o próximo?\n\nChame no WhatsApp 👇\n\n#${nicheTag} #${cityTag}`,
      direto: `${headline} — ${name} em ${city}.\n\nAtendimento pelo WhatsApp. Resultado de verdade. Agenda aberta agora.\n\nChame 👇\n\n#${nicheTag} #${temaTag} #${cityTag}`,
    },
    {
      educativo: `${headline}.\n\nSabia que ${tema} mal feito — ou adiado — pode custar muito mais caro depois?\n\nNa ${name} em ${city}, cada atendimento é pensado para entregar resultado com técnica real. Não improviso, não promessa vazia.\n\nTire suas dúvidas pelo WhatsApp 👇\n\n#${nicheTag} #${cityTag} #${temaTag}`,
      provocativo: `${dor}. Essa sensação você conhece?\n\nPara quem decide agir agora, ${tema} com a ${name} em ${city} muda esse cenário de verdade. É só dar o primeiro passo.\n\nChame no WhatsApp 👇\n\n#${nicheTag} #${temaTag}`,
      storytelling: `${headline}.\n\nA maioria das pessoas espera o momento certo para cuidar de ${tema}. O momento certo é agora.\n\nA ${name} está em ${city} com horário disponível e pronta para te atender com cuidado real. A gente responde rápido.\n\nChame no WhatsApp 👇\n\n#${nicheTag} #${cityTag}`,
      direto: `${name} em ${city} — ${tema} com resultado que você vê.\n\nAgenda aberta. WhatsApp direto. Sem enrolação.\n\nChame agora 👇\n\n#${nicheTag} #${temaTag}`,
    },
    {
      educativo: `${headline}.\n\nO que diferencia ${tema} bem feito de um resultado mediano? Técnica, atenção individual e compromisso com você — não com um atendimento padrão.\n\nA ${name} entrega isso em ${city}. E os clientes percebem desde o primeiro contato.\n\nVeja como funciona — WhatsApp na bio 👇\n\n#${nicheTag} #${cityTag} #${temaTag}`,
      provocativo: `Até quando ${tema} vai ficar pra depois?\n\n${dor} não é normal — é sinal de que está na hora de resolver. A ${name} em ${city} está com agenda disponível agora.\n\nUm WhatsApp é o suficiente 👇\n\n#${nicheTag} #${temaTag}`,
      storytelling: `${headline}.\n\nClientes que chegam com ${dor} saem da ${name} com ${desejo}. Em ${city}, quem cuida de ${tema} com o profissional certo percebe a diferença no resultado.\n\nVocê está pronto para isso?\n\nChame no WhatsApp 👇\n\n#${nicheTag} #${cityTag}`,
      direto: `${headline}.\n\n${name} em ${city} com horário disponível essa semana. Chame agora pelo WhatsApp 👇\n\n#${nicheTag} #${temaTag}`,
    },
  ];

  const chosen = sets[v % sets.length];
  return [chosen.educativo, chosen.provocativo, chosen.storytelling, chosen.direto];
}

// ─── Mensagem WhatsApp ────────────────────────────────────────

function getWhatsAppMessage(input: ContentInput): string {
  const name = input.businessName;
  const topicKey = detectTopicKey(input.topic);
  const seed = `${input.topic}${input.niche}`;
  const v = variationIndex(seed, 3, input.variationSeed);

  const interpretation = interpretMagneticRequest({
    userInput: input.topic,
    businessName: name,
    niche: input.niche,
    city: input.city,
    mainService: input.mainService,
    services: input.services,
  });
  const tema = interpretation.temaInterpretado;

  const messages: Record<string, string[]> = {
    promoção: [
      `Olá! Tudo bem? Aqui é da ${name}. Essa semana temos uma condição especial para ${tema}. Posso te passar os detalhes?`,
      `Oi! Aqui é da ${name}. Temos uma oferta especial para ${tema} que encerra em breve. Posso explicar como funciona?`,
      `Olá! Da ${name} aqui. Essa semana tem condição diferenciada para ${tema}. Você toparia ouvir os detalhes?`,
    ],
    agenda: [
      `Olá! Aqui é da ${name}. Ainda temos horários disponíveis essa semana para ${tema}. Quer que eu veja um horário para você?`,
      `Oi! Aqui é da ${name}. Agenda aberta para ${tema} essa semana — posso reservar um horário para você?`,
      `Olá! Da ${name}. Temos vagas disponíveis para ${tema} ainda essa semana. Posso te ajudar a agendar?`,
    ],
    dica: [
      `Olá! Aqui é da ${name}. Vi que você tem interesse em ${tema}. Posso te passar mais informações e tirar dúvidas?`,
      `Oi! Da ${name} aqui. Queria compartilhar algo importante sobre ${tema} que pode te ajudar. Tem um minutinho?`,
      `Olá! Aqui é da ${name}. Preparei uma informação sobre ${tema} que pode ser útil pra você. Posso enviar?`,
    ],
    default: [
      `Olá! Aqui é da ${name}. Temos ${tema} disponível com atendimento personalizado. Posso te ajudar com mais informações?`,
      `Oi! Da ${name} aqui. Gostaria de te apresentar nosso serviço de ${tema}. Posso contar mais?`,
      `Olá! Aqui é da ${name}. Estamos com atendimento disponível para ${tema}. Posso te explicar como funciona?`,
    ],
  };

  const group = messages[topicKey] ?? messages.default;
  return group[v % group.length];
}

// ─── 5 variações de WhatsApp (niche-aware) ───────────────────

function getWhatsAppVariations(input: ContentInput): string[] {
  const name = input.businessName;
  const city = input.city;
  const interpretation = interpretMagneticRequest({
    userInput: input.topic,
    businessName: name,
    niche: input.niche,
    city,
    mainService: input.mainService,
    services: input.services,
  });
  const tema = interpretation.temaInterpretado;
  const dor = interpretation.doresPublico[0] ?? "resultado abaixo do esperado";
  const desejo = interpretation.desejosPublico[0] ?? "o resultado que você merece";

  const nicheCtx: Record<string, { sentimento: string; gatilho: string; resultado: string; verbo: string }> = {
    barbearia:         { sentimento: "sua autoconfiança",   gatilho: "visual abaixo do que você merece",  resultado: "sair impecável e cheio de confiança",     verbo: "agendar seu horário"     },
    odontologia:       { sentimento: "seu sorriso",         gatilho: "adiar o cuidado bucal",              resultado: "sorriso saudável e bonito",               verbo: "agendar sua avaliação"   },
    estetica:          { sentimento: "sua autoestima",      gatilho: "pele sem o cuidado certo",           resultado: "pele renovada e autoestima em alta",      verbo: "agendar seu atendimento" },
    "personal-trainer":{ sentimento: "seu resultado",       gatilho: "treinar sem acompanhamento",         resultado: "corpo e saúde que você tanto quer",       verbo: "começar seu treino"      },
    restaurante:       { sentimento: "seu paladar",         gatilho: "comer mal no dia a dia",             resultado: "refeição gostosa e nutritiva",            verbo: "fazer seu pedido"        },
    mecanica:          { sentimento: "sua tranquilidade",   gatilho: "ignorar a manutenção do carro",      resultado: "rodar com segurança e sem surpresas",     verbo: "agendar sua revisão"     },
    imobiliaria:       { sentimento: "seu sonho",           gatilho: "adiar a busca pelo imóvel ideal",    resultado: "as chaves do imóvel que você imaginou",   verbo: "falar com um corretor"   },
    otica:             { sentimento: "sua visão",           gatilho: "adiar o exame de vista",             resultado: "enxergar bem com muito mais conforto",    verbo: "fazer seu exame"         },
    "loja-roupa":      { sentimento: "seu estilo",          gatilho: "ficar sem novidade no guarda-roupa", resultado: "look novo que te dá confiança",           verbo: "ver as novidades"        },
    serralheria:       { sentimento: "sua segurança",       gatilho: "portão sem manutenção",              resultado: "portão novo, seguro e bonito",                  verbo: "pedir seu orçamento"        },
    "clinica-medica":  { sentimento: "sua saúde",           gatilho: "adiar consultas e exames",           resultado: "saúde monitorada e qualidade de vida",          verbo: "marcar sua consulta"        },
    advogacia:         { sentimento: "seus direitos",       gatilho: "enfrentar um problema jurídico sem representação", resultado: "caso resolvido com segurança e justiça",  verbo: "agendar uma consulta"       },
    psicologia:        { sentimento: "sua saúde mental",    gatilho: "adiar o cuidado emocional",          resultado: "equilíbrio emocional e bem-estar real",          verbo: "agendar sua sessão"         },
    contabilidade:     { sentimento: "a saúde da empresa",  gatilho: "empresa irregular ou imposto mal calculado", resultado: "empresa regularizada pagando menos imposto", verbo: "falar com um contador"      },
    outro:             { sentimento: "seu resultado",       gatilho: "adiar a decisão",                    resultado: "o resultado que você está buscando",            verbo: "entrar em contato"          },
  };

  const ctx = nicheCtx[input.niche] ?? nicheCtx.outro;

  return [
    // 1. Curta e direta — 2 linhas, vai logo ao ponto
    `Oi! Aqui é ${name}. Tem ${tema} disponível essa semana em ${city}. Posso te ajudar a ${ctx.verbo}?`,

    // 2. Média com contexto — apresenta, mostra benefício, convida
    `Olá! Aqui é da ${name} em ${city}.\n\nEstamos com ${tema} disponível — atendimento rápido pelo WhatsApp, sem fila e sem burocracia.\n\n${desejo} é o que nossos clientes alcançam. Posso te explicar como funciona?`,

    // 3. Persuasiva com dor + solução + urgência
    `Oi! Da ${name}.\n\n${ctx.gatilho} é mais comum do que parece — e quem adiar só piora o cenário.\n\nEssa semana ainda tem horário disponível para ${tema} em ${city}. O processo é simples: você chama, a gente cuida de tudo, e você sai com ${ctx.resultado}.\n\nVale tentar essa semana?`,

    // 4. Reativação — cliente que já conhece
    `Oi! Aqui é da ${name}. Faz tempo que a gente não se vê!\n\nLembrei de você e queria avisar: essa semana temos uma condição especial para ${tema}. Você já conhece nosso trabalho — seria ótimo cuidar de ${ctx.sentimento} de novo.\n\nQuer que eu reserve um horário pra você?`,

    // 5. Apresentação completa — cliente novo que nunca foi
    `Olá! Aqui é da ${name}, em ${city}.\n\nSomos especializados em ${tema} e trabalhamos com agendamento direto pelo WhatsApp — sem burocracia, resposta rápida e resultado que você vai perceber.\n\n${ctx.resultado} é o que nossos clientes relatam depois do atendimento.\n\nPosso te contar como funciona e verificar um horário? Sem compromisso nenhum.`,
  ];
}

// ─── Sugestões rápidas por nicho (dinâmicas) ─────────────────

export function getQuickTopicSuggestions(niche: string): string[] {
  const suggestions: Record<string, string[]> = {
    barbearia: ["Mostrar um cenário", "Corte masculino", "Barba e acabamento", "Agenda aberta", "Antes e depois", "Dica de cuidado", "Promoção da semana", "Por que cuidar do visual", "Bastidores da barbearia"],
    odontologia: ["Mostrar um cenário", "Limpeza dental", "Clareamento", "Agenda disponível", "Por que ir ao dentista", "Sorriso antes e depois", "Promoção de avaliação", "Dica de higiene bucal"],
    "clinica-medica": ["Mostrar um cenário", "Check-up preventivo", "Consulta disponível", "Dica de saúde", "Por que não adiar exames", "Cuidados preventivos", "Agenda aberta"],
    otica: ["Exame de vista", "Armações novas", "Dica para os óculos", "Quando trocar as lentes", "Promoção da semana", "Lentes com UV"],
    "personal-trainer": ["Mostrar um cenário", "Treino personalizado", "Vagas abertas", "Dica de treino", "Erro na academia", "Antes e depois", "Resultado com acompanhamento"],
    estetica: ["Mostrar um cenário", "Limpeza de pele", "Agenda disponível", "Dica de skincare", "Antes e depois", "Promoção especial", "Cuidados com a pele"],
    "loja-roupa": ["Novidades chegaram", "Look do dia", "Promoção da semana", "Dica de combinação", "Tendências da temporada", "Peças em destaque"],
    imobiliaria: ["Imóvel em destaque", "Dica de compra", "Como funciona o financiamento", "Imóvel disponível", "Bastidores de negociação"],
    restaurante: ["Prato do dia", "Promoção do almoço", "Bastidores da cozinha", "Cardápio novo", "Ingredientes frescos", "Delivery disponível"],
    mecanica: ["Mostrar um cenário", "Revisão preventiva", "Dica de manutenção", "Diagnóstico gratuito", "Quando fazer revisão", "Troca de óleo", "Cuidado com o carro"],
    serralheria: ["Portão novo", "Orçamento gratuito", "Antes e depois", "Por que automatizar", "Manutenção de portão", "Produto em destaque"],
    advogacia: ["Mostrar um cenário", "Direitos do consumidor", "Quando contratar advogado", "Como funciona um processo", "Direitos trabalhistas", "Consulta disponível", "Assessoria preventiva", "Tire suas dúvidas", "Caso de família"],
    psicologia: ["Mostrar um cenário", "Como lidar com ansiedade", "Quando procurar terapia", "Saúde mental no dia a dia", "Sessão disponível", "Autoconhecimento", "Relacionamentos saudáveis", "Dica de equilíbrio emocional"],
    contabilidade: ["Mostrar um cenário", "Erro que MEI comete", "Como pagar menos imposto", "Empresa regularizada", "Declaração de IR", "Abrir empresa", "Organização financeira", "Prazo fiscal se aproximando"],
    outro: ["Mostrar um cenário", "Promoção da semana", "Agenda aberta", "Dica importante", "Antes e depois", "Bastidores", "Novidade no serviço", "Por que nos escolher"],
  };

  return suggestions[niche] ?? suggestions.outro;
}

// ─── Interface pública exportada ─────────────────────────────

export function generateNarratives(input: ContentInput): Narrative[] {
  return getNarratives(input);
}

export function generateHeadlines(input: ContentInput): string[] {
  return getHeadlines(input);
}

export function generateReelsScript(input: ContentInput): ReelsScript {
  return getReelsScript(input);
}

export function generateCarouselContent(input: ContentInput): CarouselContent {
  return getCarouselContent(input);
}

export function generateStorySequence(input: ContentInput): StorySequence {
  return getStorySequence(input);
}

export function generateCaption(input: ContentInput): string {
  return getCaption(input);
}

export function generateWhatsAppMessage(input: ContentInput): string {
  return getWhatsAppMessage(input);
}

export function generateWhatsAppVariations(input: ContentInput): string[] {
  return getWhatsAppVariations(input);
}

export function generateCaptionVariations(input: ContentInput): string[] {
  return getCaptionVariations(input);
}

export function generateFullContent(input: ContentInput, format: ContentFormat) {
  const narratives = generateNarratives(input);
  const headlines = generateHeadlines(input);

  const base = {
    narratives,
    headlines,
    caption: generateCaption(input),
    whatsapp_message: generateWhatsAppMessage(input),
  };

  switch (format) {
    case "reels":
      return { ...base, script: generateReelsScript(input) };
    case "carrossel":
      return { ...base, carousel: generateCarouselContent(input) };
    case "story":
      return { ...base, stories: generateStorySequence(input) };
    default:
      return base;
  }
}

// Retrocompatibilidade — lista genérica usada em outros lugares
export const QUICK_TOPIC_SUGGESTIONS = [
  "Promoção da semana",
  "Agenda aberta",
  "Chamar clientes antigos",
  "Dica importante",
  "Antes e depois",
  "Bastidores",
  "Prova social",
  "Serviço principal",
  "Tirar dúvidas",
  "Oferta pelo WhatsApp",
];

export { interpretMagneticRequest as interpretUserIntent };
