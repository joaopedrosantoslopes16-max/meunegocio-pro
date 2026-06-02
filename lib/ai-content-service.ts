import { NICHE_CONFIG } from "./niche-config";
import type {
  Narrative,
  ReelsScript,
  CarouselContent,
  StorySequence,
  ContentFormat,
} from "@/types";

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
}

// ─── Tópicos com ângulos pré-mapeados por nicho ──────────────
const TOPIC_ANGLES: Record<string, Record<string, string[]>> = {
  barbearia: {
    default: ["O visual fala antes de você", "A semana começa melhor com corte em dia", "Não espere o fim de semana para cuidar do visual"],
    promoção: ["Oferta especial que não vai se repetir", "Corte + barba com valor especial essa semana", "Por que esperar quando pode vir hoje?"],
    agenda: ["Horários ainda disponíveis hoje", "Reserve agora antes de lotar", "Sua semana começa aqui"],
    dica: ["O segredo de um corte que dura mais", "Como manter o visual sempre impecável", "3 erros que fazem seu corte durar menos"],
  },
  odontologia: {
    default: ["Seu sorriso também comunica confiança", "Limpeza dental não é só estética", "O cuidado que você adia pode fazer falta depois"],
    promoção: ["Avaliação sem custo para novos pacientes", "Clareamento com condição especial esse mês", "Consulta disponível ainda essa semana"],
    dica: ["3 sinais de que está na hora de cuidar do seu sorriso", "O que acontece quando você adia a limpeza dental", "Sensibilidade nos dentes — quando se preocupar"],
    agenda: ["Últimas vagas da semana ainda abertas", "Agende antes de lotar", "Essa semana ainda tem horário disponível"],
  },
  "clinica-medica": {
    default: ["Cuidar da saúde hoje evita problemas maiores amanhã", "Consulta preventiva muda tudo", "Saúde não pode esperar"],
    dica: ["Check-up anual — por que fazer sem falta", "Sinais que seu corpo manda e você ignora", "Por que prevenção é mais barata que tratamento"],
    agenda: ["Consulta disponível essa semana", "Agende seu acompanhamento preventivo", "Horários disponíveis — venha hoje"],
  },
  otica: {
    default: ["Ver bem é viver melhor", "Quando foi seu último exame de vista?", "Sua visão merece atenção especializada"],
    dica: ["Como saber se está na hora de trocar os óculos", "Por que o exame de vista regular importa", "Lentes UV — por que usar sempre"],
    promoção: ["Armações selecionadas com condição especial", "Lentes com proteção UV essa semana", "Consulte nosso consultor pelo WhatsApp"],
  },
  "personal-trainer": {
    default: ["Resultado vem com consistência e acompanhamento", "Treino sem orientação = resultado pela metade", "Sua evolução começa com o suporte certo"],
    dica: ["3 erros que travam seu resultado na academia", "Por que treino personalizado funciona mais", "Como manter a motivação nos dias difíceis"],
    promoção: ["Condição especial para novos alunos essa semana", "Primeira semana com acompanhamento diferenciado", "Vagas abertas para inicio imediato"],
  },
  estetica: {
    default: ["Cuidar de você é um ato de amor próprio", "Pele saudável começa com profissional certo", "O cuidado que você merece está aqui"],
    dica: ["Limpeza de pele: por que fazer com profissional", "3 cuidados que fazem diferença na sua pele", "O erro mais comum no skincare"],
    promoção: ["Horário especial disponível hoje", "Condição especial para limpeza de pele", "Agende pelo WhatsApp e ganhe consultoria"],
  },
  "loja-roupa": {
    default: ["Look que valoriza quem você é", "Você merece se sentir bem com o que veste", "Estilo não precisa custar caro"],
    promoção: ["Peças selecionadas com preço especial hoje", "Promoção que não volta — aproveite agora", "Novidades que chegaram essa semana"],
    dica: ["Como montar looks versáteis com poucas peças", "Combinações de cores que sempre funcionam", "Tendências que vão dominar essa temporada"],
  },
  imobiliaria: {
    default: ["O imóvel certo muda sua vida", "Segurança e transparência em cada negociação", "Seu próximo lar pode estar mais perto do que você pensa"],
    dica: ["O que avaliar antes de comprar um imóvel", "Como funciona o financiamento para quem compra pela primeira vez", "Erros comuns na compra do primeiro imóvel"],
    promoção: ["Imóvel em destaque essa semana", "Consulte nosso corretor sem compromisso", "Oportunidade de imóvel disponível agora"],
  },
  restaurante: {
    default: ["Sabor que transforma o seu dia", "Cozinha com cuidado e ingredientes frescos", "Uma refeição pode ser uma experiência"],
    promoção: ["Combo especial disponível só hoje", "Promoção de almoço — confira o cardápio", "Pedido pelo WhatsApp com condição especial"],
    dica: ["Por que comer bem faz diferença no seu dia", "O que tem de especial no nosso prato do dia", "Ingredientes frescos — como isso muda o sabor"],
  },
  mecanica: {
    default: ["Seu veículo nas mãos de quem entende", "Manutenção em dia = segurança garantida", "Carro bem cuidado dura muito mais"],
    dica: ["Sinais que indicam que seu carro precisa de revisão", "Por que não adiar a troca de óleo", "Manutenção preventiva — o que verificar todo mês"],
    promoção: ["Diagnóstico gratuito essa semana", "Condição especial para revisão completa", "Solicite orçamento pelo WhatsApp agora"],
  },
  serralheria: {
    default: ["Segurança e beleza para sua casa ou empresa", "Qualidade em ferro e aço que dura décadas", "Cada peça feita com cuidado e precisão"],
    dica: ["Como manter portões e grades sempre em bom estado", "Quando é hora de substituir o portão antigo", "Por que aço galvanizado faz diferença"],
    promoção: ["Orçamento gratuito e sem compromisso", "Condição especial para portão automático", "Solicite orçamento pelo WhatsApp"],
  },
  outro: {
    default: ["Qualidade e dedicação em cada atendimento", "Você merece um serviço feito com cuidado", "Atendimento que faz diferença"],
    promoção: ["Condição especial disponível essa semana", "Aproveite antes de encerrar", "Consulte pelo WhatsApp sem compromisso"],
    dica: ["Informação que faz diferença para você", "O que você precisa saber sobre nossos serviços", "Dica importante para aproveitar melhor"],
  },
};

function getNarratives(input: ContentInput): Narrative[] {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const topicKey = detectTopicKey(input.topic);
  const angles =
    TOPIC_ANGLES[input.niche]?.[topicKey] ??
    TOPIC_ANGLES[input.niche]?.default ??
    TOPIC_ANGLES.outro.default;

  return [
    {
      title: angles[0],
      angle: "Identidade e imagem",
      description: `Como "${input.topic}" conecta com a percepção que os clientes têm de ${input.businessName}.`,
    },
    {
      title: angles[1],
      angle: "Timing e urgência",
      description: `Por que agora é o momento certo para o cliente buscar ${input.mainService} em ${input.city}.`,
    },
    {
      title: angles[2],
      angle: "Prevenção e resultado",
      description: `O que o cliente perde quando adia ${input.mainService} — e o que ganha ao agir agora.`,
    },
    {
      title: `${cfg.label} em ${input.city}: por que ${input.businessName}`,
      angle: "Prova e autoridade",
      description: `Posicionamento direto da ${input.businessName} como referência em ${input.mainService} na região.`,
    },
    {
      title: `A pergunta que todo cliente de ${cfg.label.toLowerCase()} deveria fazer`,
      angle: "Educação e curiosidade",
      description: `Conteúdo educativo que posiciona ${input.businessName} como especialista e gera engajamento.`,
    },
  ];
}

function getHeadlines(input: ContentInput): string[] {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const topicKey = detectTopicKey(input.topic);

  const headlines: Record<string, string[]> = {
    promoção: [
      `Essa promoção de ${input.mainService} encerra em breve`,
      `Condição especial para ${input.mainService} em ${input.city} — só essa semana`,
      `Você ainda não viu a oferta de ${input.mainService} da ${input.businessName}`,
      `Por que tantos clientes aproveitam promoção de ${input.mainService} em ${input.city}`,
      `${input.mainService} com condição especial — fale com a ${input.businessName} agora`,
    ],
    agenda: [
      `Agenda aberta para ${input.mainService} em ${input.city}`,
      `Horários disponíveis para ${input.mainService} na ${input.businessName}`,
      `Você ainda não agendou seu ${input.mainService} este mês`,
      `Reserve seu horário antes de lotar — ${input.businessName} em ${input.city}`,
      `Últimos horários da semana para ${input.mainService}`,
    ],
    dica: [
      `3 sinais de que está na hora de cuidar do ${input.mainService}`,
      `O erro que faz muita gente adiar ${input.mainService}`,
      `O que ninguém te conta sobre ${input.mainService} em ${input.city}`,
      `Por que ignorar ${input.mainService} pode sair caro depois`,
      `Como escolher o melhor profissional de ${input.mainService} em ${input.city}`,
    ],
    default: [
      `${input.mainService} em ${input.city}: o que você precisa saber`,
      `Por que a ${input.businessName} é referência em ${input.mainService}`,
      `O que muda quando você escolhe ${input.mainService} com qualidade`,
      `${input.businessName} em ${input.city} — ${cfg.cta}`,
      `Você está deixando seus clientes esquecerem de você?`,
    ],
  };

  return headlines[topicKey] ?? headlines.default;
}

function getReelsScript(input: ContentInput): ReelsScript {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const headline = input.headline ?? `${input.mainService} em ${input.city}`;
  const name = input.businessName;
  const city = input.city;
  const service = input.mainService;
  const wa = input.whatsapp;
  const waLink = `https://wa.me/55${wa.replace(/\D/g, "")}`;

  const scripts: Record<string, ReelsScript> = {
    odontologia: {
      title: headline,
      scenes: [
        { scene: 1, description: "Mostre o ambiente da clínica ou a profissional sorrindo para a câmera.", fala: `Você sabia que adiar a limpeza dental pode prejudicar muito mais do que só a estética?` },
        { scene: 2, description: "Imagem de atendimento ou cadeira odontológica no foco.", fala: `A limpeza dental remove tártaro que a escova não alcança — e previne problemas maiores como cáries e gengivite.` },
        { scene: 3, description: "Close no sorriso ou na profissional olhando para a câmera.", fala: `Se você está em ${city}, fale com a ${name} pelo WhatsApp e agende sua avaliação hoje.` },
      ],
      screen_text: `Agende sua avaliação pelo WhatsApp`,
      caption: `Seu sorriso merece atenção. A ${name} atende em ${city} com cuidado e profissionalismo. Fale pelo WhatsApp 👇`,
      cta: "Chamar no WhatsApp",
      whatsapp_message: `Olá, ${name}! Vi o Reels sobre limpeza dental e quero saber mais sobre como agendar uma avaliação.`,
    },
    barbearia: {
      title: headline,
      scenes: [
        { scene: 1, description: "Câmera no espelho ou no ambiente da barbearia.", fala: `Visual impecável não acontece por acaso — começa com um bom corte.` },
        { scene: 2, description: "Mostrar as mãos do barbeiro trabalhando.", fala: `Na ${name}, cada corte é feito com atenção e técnica. É o detalhe que faz diferença na sua aparência.` },
        { scene: 3, description: "Resultado final — cliente satisfeito ou produto em destaque.", fala: `Estamos em ${city}. Chame pelo WhatsApp e garanta seu horário.` },
      ],
      screen_text: `Reserve seu horário na ${name}`,
      caption: `Visual cuidado é presença garantida. A ${name} atende em ${city}. Chame no WhatsApp e agende agora 👇`,
      cta: "Agendar pelo WhatsApp",
      whatsapp_message: `Olá, ${name}! Vi o Reels e quero agendar um horário para corte.`,
    },
    default: {
      title: headline,
      scenes: [
        { scene: 1, description: `Mostre o ambiente ou a equipe da ${name}.`, fala: `Você ainda não conhece o trabalho da ${name} em ${city}?` },
        { scene: 2, description: `Demonstre o serviço principal ou o resultado do trabalho.`, fala: `${service} feito com cuidado, qualidade e atenção personalizada — é assim que trabalhamos.` },
        { scene: 3, description: `Chamada final para o WhatsApp.`, fala: `Estamos em ${city}. Entre em contato pelo WhatsApp e tire todas as suas dúvidas.` },
      ],
      screen_text: `${cfg.cta} — fale com a ${name}`,
      caption: `${service} de qualidade em ${city}. A ${name} está pronta para te atender. Fale pelo WhatsApp 👇`,
      cta: cfg.cta,
      whatsapp_message: `Olá, ${name}! Vi seu Reels e quero saber mais sobre ${service}.`,
    },
  };

  return scripts[input.niche] ?? scripts.default;
}

function getCarouselContent(input: ContentInput): CarouselContent {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const headline = input.headline ?? `3 motivos para escolher ${input.businessName}`;
  const name = input.businessName;
  const city = input.city;
  const service = input.mainService;

  const slide1 = headline;
  const nicheSlides: Record<string, { slides: { slide: number; text: string }[]; caption: string; whatsapp: string }> = {
    odontologia: {
      slides: [
        { slide: 1, text: slide1 },
        { slide: 2, text: `1. Limpeza dental previne problemas maiores — como cáries e perda de dentes.` },
        { slide: 3, text: `2. Sorriso saudável transmite confiança e bem-estar em qualquer situação.` },
        { slide: 4, text: `3. Atendimento humanizado — a ${name} cuida de você com atenção e cuidado real.` },
        { slide: 5, text: `Fale com a ${name} pelo WhatsApp e agende sua avaliação em ${city}` },
      ],
      caption: `Seu sorriso comunica antes mesmo de você falar. A ${name} atende em ${city} com qualidade e dedicação. Chame no WhatsApp 👇`,
      whatsapp: `Olá! Vi o carrossel sobre ${service} e quero agendar uma avaliação.`,
    },
    barbearia: {
      slides: [
        { slide: 1, text: slide1 },
        { slide: 2, text: `1. Visual bem cuidado transmite confiança e presença em qualquer ambiente.` },
        { slide: 3, text: `2. Corte de qualidade dura mais e exige menos manutenção no dia a dia.` },
        { slide: 4, text: `3. Atendimento personalizado — barbeiro que entende o que você quer.` },
        { slide: 5, text: `Reserve seu horário na ${name} em ${city} pelo WhatsApp` },
      ],
      caption: `Visual impecável começa na barbearia certa. A ${name} atende em ${city}. Chame no WhatsApp e garanta seu horário 👇`,
      whatsapp: `Olá, ${name}! Vi o carrossel e quero agendar um horário.`,
    },
    default: {
      slides: [
        { slide: 1, text: slide1 },
        { slide: 2, text: `1. Qualidade comprovada — ${service} feito por profissionais de ${city}.` },
        { slide: 3, text: `2. Atendimento humanizado — a ${name} cuida de você do início ao fim.` },
        { slide: 4, text: `3. Facilidade — agende pelo WhatsApp sem burocracia.` },
        { slide: 5, text: `Fale com a ${name} pelo WhatsApp e saiba mais sobre ${service}` },
      ],
      caption: `${service} em ${city} com quem realmente entende do assunto. A ${name} está pronta para te atender. Chame no WhatsApp 👇`,
      whatsapp: `Olá, ${name}! Vi o carrossel e quero saber mais sobre ${service}.`,
    },
  };

  const result = nicheSlides[input.niche] ?? nicheSlides.default;
  return {
    theme: headline,
    slides: result.slides,
    caption: result.caption,
    whatsapp_message: result.whatsapp,
  };
}

function getStorySequence(input: ContentInput): StorySequence {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const name = input.businessName;
  const city = input.city;
  const service = input.mainService;

  return {
    stories: [
      { story: 1, text: `Você precisa de ${service}?`, type: "pergunta" },
      { story: 2, text: `A ${name} atende em ${city} com praticidade e qualidade.`, type: "apresentação" },
      { story: 3, text: `Chame pelo WhatsApp e tire todas as suas dúvidas sem compromisso.`, type: "chamada" },
      { story: 4, text: `Quer saber valores ou horários?`, type: "caixinha" },
    ],
    cta: "Responder no WhatsApp",
    whatsapp_message: `Olá, ${name}! Vi seus stories e quero saber mais sobre ${service} em ${city}.`,
  };
}

function getCaption(input: ContentInput): string {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const name = input.businessName;
  const city = input.city;
  const service = input.mainService;
  const headline = input.headline ?? service;

  return `${headline}.\n\nA ${name} atende em ${city} com qualidade e atenção personalizada para ${service}.\n\nChame no WhatsApp e saiba mais 👇\n\n#${input.niche.replace(/-/g, "")} #${city.toLowerCase().replace(/\s/g, "")} #${service.toLowerCase().replace(/\s/g, "")}`;
}

function getWhatsAppMessage(input: ContentInput): string {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const name = input.businessName;
  const service = input.mainService;
  const topicKey = detectTopicKey(input.topic);

  const messages: Record<string, string> = {
    promoção: `Olá! Tudo bem? Aqui é da ${name}. Essa semana temos uma condição especial para ${service}. Posso te passar os detalhes?`,
    agenda: `Olá! Aqui é da ${name}. Ainda temos horários disponíveis essa semana para ${service}. Quer que eu veja um horário para você?`,
    dica: `Olá! Aqui é da ${name}. Vi que você tem interesse em ${service}. Posso te passar mais informações e tirar dúvidas?`,
    default: `Olá! Aqui é da ${name}. Temos ${service} disponível com atendimento personalizado. Posso te ajudar com mais informações?`,
  };

  return messages[topicKey] ?? messages.default;
}

function detectTopicKey(topic: string): string {
  const lower = topic.toLowerCase();
  if (lower.match(/promo[çc][aã]o|oferta|desconto|especial/)) return "promoção";
  if (lower.match(/agenda|hor[aá]rio|vaga|reserv/)) return "agenda";
  if (lower.match(/dica|como|por que|segredo|erro|cuidado/)) return "dica";
  return "default";
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
