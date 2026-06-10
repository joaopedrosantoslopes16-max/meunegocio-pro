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

// ─── Variação determinística baseada no input ──────────────
function variationIndex(seed: string, count: number): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h) ^ seed.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h) % count;
}

// ─── Interpreta a intenção real do usuário ──────────────────
export function interpretUserIntent(topic: string, mainService: string): {
  specificSubject: string;
  intent: string;
  isSpecific: boolean;
} {
  const lower = topic.toLowerCase().trim();

  let intent = "default";
  if (/promo[çc][aã]o|oferta|desconto|especial|promoç/.test(lower)) intent = "promoção";
  else if (/agenda|hor[aá]rio|vaga|reserv|agendar|marcar/.test(lower)) intent = "agenda";
  else if (/dica|como\s|por\s+que|segredo|erro|cuidado|ensin|aprend/.test(lower)) intent = "dica";
  else if (/bastidor|por\s+tr[aá]s|processo|rotina\s+da/.test(lower)) intent = "bastidores";
  else if (/depoimento|avalia[çc][aã]o|feedback|cliente\s+falou|resultado\s+real|antes\s+e\s+depois/.test(lower)) intent = "depoimento";
  else if (/lan[çc]amento|novo\s+servi[çc]o|novidade|chegou\s|lançamos/.test(lower)) intent = "lançamento";
  else if (/produto|pe[çc]a|item|artigo|modelo|linha/.test(lower)) intent = "produto";

  // Remove meta-frases ("quero algo para postar...") e prefixos de intenção
  let specificSubject = topic
    // Meta-pedidos ao sistema — extrai o assunto real
    .replace(/^(quero|preciso\s*de?|me\s+ajuda\s*com?|me\s+ajude)\s+(algo|um|uma|conteúdo|conteudo|post|coisa)?\s*(para\s+postar|de\s+post|para\s+criar|para\s+divulgar|sobre|de|do|da)?\s*/i, "")
    .replace(/^(cria?|gera?|faz|faça|escreve?)\s+(um|uma)?\s*(post|conteúdo|conteudo|roteiro|legenda)?\s*(sobre|de|do|da|para)?\s*/i, "")
    // Qualificadores que não fazem parte do assunto
    .replace(/\s*no\s+meu\s+nicho(\s+(que\s+[eéè]|de|do|da))?\s*/gi, " ")
    .replace(/\s*mostrando\s+(o\s+)?(nosso|meu|nossa|minha)\s+/gi, " ")
    .replace(/\s*para\s+(meu|minha|nosso|nossa)\s+(negócio|negocio|empresa|loja|marca)\s*/gi, " ")
    // Prefixos de intenção
    .replace(/^promo[çc][aã]o\s*(de|do|da|dos|das)?\s*/i, "")
    .replace(/^dica\s*(de|sobre|para)?\s*/i, "")
    .replace(/^bastidores?\s*(de|do|da|dos|das)?\s*/i, "")
    .replace(/^agenda\s*(aberta\s*)?(de|para|do|da)?\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!specificSubject || specificSubject.length < 3) specificSubject = topic;

  // Sugestões genéricas do sistema — não são "específicas"
  const genericSuggestions = new Set([
    "promoção da semana", "agenda aberta", "chamar clientes antigos",
    "dica importante", "antes e depois", "bastidores", "prova social",
    "serviço principal", "tirar dúvidas", "oferta pelo whatsapp",
  ]);

  // Se o assunto ainda parecer uma frase/pedido longo, não é específico
  const looksLikeSentence = specificSubject.length > 45 ||
    /\s+(que|quero|preciso|mostrando|para\s+postar)\s/.test(specificSubject);

  const isSpecific = !looksLikeSentence &&
    !genericSuggestions.has(lower) &&
    lower !== mainService.toLowerCase() &&
    topic.trim().length > 4;

  if (!isSpecific && looksLikeSentence) specificSubject = mainService;

  return { specificSubject, intent, isSpecific };
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
  const { intent, specificSubject, isSpecific } = interpretUserIntent(input.topic, input.mainService);
  const topicKey = intent !== "default" ? intent : detectTopicKey(input.topic);
  const angles =
    TOPIC_ANGLES[input.niche]?.[topicKey] ??
    TOPIC_ANGLES[input.niche]?.default ??
    TOPIC_ANGLES.outro.default;

  const subject = isSpecific ? specificSubject : input.mainService;

  return [
    {
      title: angles[0],
      angle: "Identidade e imagem",
      description: `Como "${input.topic}" conecta com a percepção que os clientes têm de ${input.businessName}.`,
    },
    {
      title: angles[1],
      angle: "Timing e urgência",
      description: `Por que agora é o momento certo para o cliente buscar ${subject} em ${input.city}.`,
    },
    {
      title: angles[2] ?? angles[0],
      angle: "Prevenção e resultado",
      description: `O que o cliente ganha ao agir agora com ${subject} na ${input.businessName}.`,
    },
    {
      title: `${subject} em ${input.city}: ${input.businessName}`,
      angle: "Prova e autoridade",
      description: `Posicionamento direto de ${input.businessName} como referência em ${subject}.`,
    },
    {
      title: `O que você precisa saber sobre ${subject}`,
      angle: "Educação e curiosidade",
      description: `Conteúdo educativo sobre ${subject} que posiciona ${input.businessName} como especialista.`,
    },
  ];
}

function getHeadlines(input: ContentInput): string[] {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const { intent, specificSubject, isSpecific } = interpretUserIntent(input.topic, input.mainService);
  const topicKey = intent !== "default" ? intent : detectTopicKey(input.topic);
  const subject = isSpecific ? specificSubject : input.mainService;

  const headlineVariants: Record<string, string[][]> = {
    promoção: [
      [
        `Essa promoção de ${subject} encerra em breve`,
        `Condição especial para ${subject} em ${input.city} — só essa semana`,
        `Você ainda não viu a oferta de ${subject} da ${input.businessName}`,
        `Por que tantos clientes aproveitam promoção de ${subject} em ${input.city}`,
        `${subject} com condição especial — fale com a ${input.businessName} agora`,
      ],
      [
        `Oferta de ${subject} que não vai voltar tão cedo`,
        `${input.businessName} com preço especial só até o fim desta semana`,
        `Não deixe para depois: ${subject} com desconto agora`,
        `Clientes da ${input.businessName} já estão aproveitando — e você?`,
        `${input.city}: oferta imperdível de ${subject} disponível agora`,
      ],
      [
        `Última chamada: promoção de ${subject} na ${input.businessName}`,
        `${subject} por um valor que você não esperava — só hoje`,
        `Por que esperar? ${input.businessName} tem condição especial agora`,
        `Economize em ${subject} em ${input.city} — oferta válida por tempo limitado`,
        `Essa promoção da ${input.businessName} vai encerrar — garanta a sua vaga`,
      ],
    ],
    agenda: [
      [
        `Agenda aberta para ${subject} em ${input.city}`,
        `Horários disponíveis para ${subject} na ${input.businessName}`,
        `Você ainda não agendou ${subject} este mês`,
        `Reserve seu horário antes de lotar — ${input.businessName} em ${input.city}`,
        `Últimos horários da semana para ${subject}`,
      ],
      [
        `${input.businessName} com horários abertos para ${subject} hoje`,
        `Não deixe para amanhã: agende ${subject} agora em ${input.city}`,
        `Vagas limitadas para ${subject} — garanta a sua na ${input.businessName}`,
        `Semana cheia na ${input.businessName}? Ainda tem horário para você`,
        `${subject} em ${input.city}: agenda disponível, é só chamar`,
      ],
      [
        `Atenção: horários de ${subject} na ${input.businessName} estão quase cheios`,
        `Reserve hoje seu atendimento de ${subject} em ${input.city}`,
        `Você merece ${subject} — e a ${input.businessName} tem vaga agora`,
        `Sem espera, sem burocracia: agende ${subject} pelo WhatsApp`,
        `${input.city}: últimas vagas para ${subject} na ${input.businessName} esta semana`,
      ],
    ],
    dica: [
      [
        `3 sinais de que está na hora de cuidar de ${subject}`,
        `O erro que faz muita gente adiar ${subject}`,
        `O que ninguém te conta sobre ${subject} em ${input.city}`,
        `Por que ignorar ${subject} pode sair caro depois`,
        `Como escolher o melhor profissional de ${subject} em ${input.city}`,
      ],
      [
        `${subject}: o que você precisa saber antes de escolher um profissional`,
        `Evite esses erros comuns relacionados a ${subject}`,
        `Dica de quem entende: como aproveitar melhor ${subject}`,
        `Por que ${subject} faz diferença no seu dia a dia`,
        `A verdade sobre ${subject} que muita gente não sabe`,
      ],
      [
        `Como ${subject} pode transformar sua rotina em ${input.city}`,
        `Antes de contratar ${subject}: leia isso`,
        `${subject} certo vs. ${subject} errado — você sabe a diferença?`,
        `Resultado real em ${subject}: o que influencia mais do que você imagina`,
        `Checklist: o que avaliar em um bom serviço de ${subject}`,
      ],
    ],
    bastidores: [
      [
        `Os bastidores de ${subject} que você nunca viu`,
        `Por trás de ${subject}: como funciona de verdade na ${input.businessName}`,
        `A rotina real de ${subject} — sem filtro`,
        `O que acontece antes do resultado em ${subject}`,
        `Mostrando o processo real de ${subject} na ${input.businessName}`,
      ],
      [
        `Bastidores: veja como ${subject} é feito na ${input.businessName}`,
        `A verdade por trás de ${subject} — e por que faz diferença`,
        `${input.businessName} abre os bastidores de ${subject}`,
        `Você sabia que ${subject} envolve tudo isso?`,
        `O processo real de ${subject}: da preparação ao resultado`,
      ],
    ],
    depoimento: [
      [
        `O que nossos clientes dizem sobre ${subject} na ${input.businessName}`,
        `Resultado real: transformações com ${subject} em ${input.city}`,
        `Por que clientes recomendam ${subject} na ${input.businessName}`,
        `Antes e depois: veja a diferença que ${subject} faz`,
        `Avaliações reais de quem já fez ${subject} na ${input.businessName}`,
      ],
      [
        `Depoimento real: como ${subject} mudou a experiência de um cliente`,
        `Quem já fez ${subject} na ${input.businessName} voltaria de novo?`,
        `${input.businessName}: resultados reais em ${subject} em ${input.city}`,
        `Transformação com ${subject} — histórias reais`,
        `Clientes satisfeitos com ${subject} na ${input.businessName}`,
      ],
    ],
    lançamento: [
      [
        `Novidade: ${subject} agora disponível na ${input.businessName}`,
        `Chegou: ${subject} para você em ${input.city}`,
        `${input.businessName} apresenta: ${subject}`,
        `Novo serviço: ${subject} com a qualidade que você já conhece`,
        `Acabou de chegar: ${subject} na ${input.businessName}`,
      ],
      [
        `Lançamento: ${subject} na ${input.businessName} em ${input.city}`,
        `${input.businessName} agora oferece ${subject} — conheça`,
        `Você pediu e chegou: ${subject} disponível agora`,
        `${subject}: novo na ${input.businessName}, mesma qualidade de sempre`,
        `${input.city}: ${subject} disponível na ${input.businessName}`,
      ],
    ],
    produto: [
      [
        `${subject}: conheça tudo sobre esse produto`,
        `Por que ${subject} está entre os mais procurados na ${input.businessName}`,
        `${subject} disponível na ${input.businessName} em ${input.city}`,
        `Como ${subject} pode fazer diferença para você`,
        `${subject} com qualidade garantida — ${input.businessName}`,
      ],
    ],
    default: [
      [
        `${subject} em ${input.city}: o que você precisa saber`,
        `Por que a ${input.businessName} é referência em ${subject}`,
        `O que muda quando você escolhe ${subject} com qualidade`,
        `${input.businessName} em ${input.city} — ${cfg.cta}`,
        `Você está deixando seus clientes esquecerem de você?`,
      ],
      [
        `${input.businessName}: qualidade em ${subject} que os clientes recomendam`,
        `Descubra por que clientes voltam sempre para a ${input.businessName}`,
        `${subject} de verdade: veja o que a ${input.businessName} entrega`,
        `Em ${input.city}, quem busca ${subject} de qualidade vai para a ${input.businessName}`,
        `O diferencial que faz a ${input.businessName} se destacar em ${subject}`,
      ],
      [
        `${subject} que faz a diferença — conheça a ${input.businessName}`,
        `Para ${subject} em ${input.city}, a escolha é a ${input.businessName}`,
        `Como a ${input.businessName} mudou a experiência de ${subject} em ${input.city}`,
        `Qualidade, confiança e resultado: ${subject} na ${input.businessName}`,
        `Seu próximo ${subject} pode ser o melhor que você já fez`,
      ],
    ],
  };

  const variants = headlineVariants[topicKey] ?? headlineVariants.default;
  const seed = `${input.topic}${input.niche}${input.businessName}`;
  return variants[variationIndex(seed, variants.length)];
}

// ─── Roteiros para Reels — expandidos e variados ─────────────

function getReelsScript(input: ContentInput): ReelsScript {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const headline = input.headline ?? `${input.mainService} em ${input.city}`;
  const name = input.businessName;
  const city = input.city;
  const service = input.mainService;
  const seed = `${input.topic}${input.narrative ?? ""}${input.headline ?? ""}`;
  const v = variationIndex(seed, 3);

  const nicheScripts: Record<string, ReelsScript[]> = {
    barbearia: [
      {
        title: headline,
        scenes: [
          {
            scene: 1,
            description: "Close no espelho ou barbeiro preparando o espaço, câmera frontal.",
            fala: `Visual descuidado não é só questão de estética — é a primeira impressão que você deixa em qualquer lugar. As pessoas decidem em segundos o que pensam de você, e o seu visual diz muita coisa antes mesmo de você abrir a boca.`,
          },
          {
            scene: 2,
            description: "Mostrar o processo de corte em detalhe — tesoura, pente, navalha trabalhando.",
            fala: `Na ${name}, cada corte é feito com técnica real e atenção ao que você quer. Desde a conversa inicial até o acabamento da barba, tudo é pensado para que você saia exatamente como imaginou — não um corte qualquer, o seu corte.`,
          },
          {
            scene: 3,
            description: "Barbeiro ou cliente satisfeito olhando para a câmera, ambiente da barbearia.",
            fala: `Estamos em ${city} com agenda aberta esta semana. Chame pelo WhatsApp agora, sem complicação, e garanta seu horário. As vagas costumam lotar rápido — não deixa para amanhã.`,
          },
        ],
        screen_text: `Reserve seu horário na ${name} — chame pelo WhatsApp`,
        caption: `Visual impecável não é luxo, é necessidade. A ${name} atende em ${city} com cortes personalizados e atenção a cada detalhe. Chame no WhatsApp e garanta seu horário 👇`,
        cta: "Agendar pelo WhatsApp",
        whatsapp_message: `Olá, ${name}! Vi o Reels e quero agendar um horário para corte.`,
      },
      {
        title: headline,
        scenes: [
          {
            scene: 1,
            description: "Barbeiro olhando para a câmera com expressão confiante, barbearia ao fundo.",
            fala: `Sabe aquele dia que você sai da barbearia e a autoconfiança vai lá pra cima? Quando o corte ficou exatamente certo, a barba tá no ponto, e você se sente bem em qualquer situação? É exatamente isso que a ${name} entrega.`,
          },
          {
            scene: 2,
            description: "Demonstração de técnica — close no detalhe do trabalho sendo feito.",
            fala: `Corte masculino de qualidade não é sorte, é técnica. Na ${name} em ${city}, cada cliente recebe atenção individual: avaliamos o formato do rosto, ouvimos o que você quer e trabalhamos para entregar o resultado que você imaginou — sem achismo, sem pressa.`,
          },
          {
            scene: 3,
            description: "Resultado final sendo mostrado ou cliente saindo satisfeito.",
            fala: `Agenda aberta hoje. Sem espera desnecessária, sem surpresa. Chame direto no WhatsApp e agende seu horário agora — é mais rápido do que você pensa.`,
          },
        ],
        screen_text: `${name} em ${city} — agende pelo WhatsApp`,
        caption: `Corte que transforma. Barba que define. A ${name} em ${city} cuida de cada detalhe do seu visual. Chame no WhatsApp e veja a diferença 👇`,
        cta: "Agendar pelo WhatsApp",
        whatsapp_message: `Oi ${name}! Assistí o Reels e quero marcar um horário para corte e barba.`,
      },
      {
        title: headline,
        scenes: [
          {
            scene: 1,
            description: "Câmera ampla mostrando o ambiente aconchegante da barbearia.",
            fala: `Se você ainda não conhece o trabalho da ${name} em ${city}, isso precisa mudar. Porque uma vez que você experimenta um corte realmente bem feito, fica difícil aceitar qualquer coisa menor. E a diferença aparece imediatamente.`,
          },
          {
            scene: 2,
            description: "Closeup em trabalho sendo feito — navalha em ação, detalhe de acabamento.",
            fala: `Corte masculino, barba desenhada, sobrancelha — tudo com técnica, paciência e o resultado que você imaginou. A ${name} trata cada cliente com atenção individual porque cada pessoa tem um estilo único, e a gente respeita isso.`,
          },
          {
            scene: 3,
            description: "Barbeiro sinalizando aprovação ou falando direto para câmera.",
            fala: `Essa semana tem horários disponíveis e uma condição especial que vai valer a pena. Chame agora pelo WhatsApp, a gente resolve tudo em segundos.`,
          },
        ],
        screen_text: `Condição especial essa semana — chame na ${name}`,
        caption: `Visual que faz diferença. A ${name} em ${city} trabalha com dedicação e técnica real. Confira a condição especial dessa semana e agende pelo WhatsApp 👇`,
        cta: "Ver condição especial",
        whatsapp_message: `Olá ${name}! Vi o Reels sobre a condição especial e quero saber mais.`,
      },
    ],

    odontologia: [
      {
        title: headline,
        scenes: [
          {
            scene: 1,
            description: "Profissional sorrindo ou mostrando o ambiente organizado da clínica.",
            fala: `Você sabe que precisa ir ao dentista, mas vai adiando. Todo mundo faz isso. O problema é que os pequenos problemas que a limpeza evitaria vão crescendo silenciosamente — e quando aparecem os sintomas, o tratamento já é maior e mais caro.`,
          },
          {
            scene: 2,
            description: "Close em atendimento sendo realizado ou equipamentos modernos.",
            fala: `A ${name} em ${city} cuida do seu sorriso com atenção e profissionalismo real. A limpeza dental remove o tártaro que escova e fio dental não alcançam, previne cáries, gengivite e mantém a saúde da gengiva. É prevenção que faz diferença no longo prazo.`,
          },
          {
            scene: 3,
            description: "Profissional olhando para câmera com expressão gentil e confiante.",
            fala: `Agende sua avaliação ainda essa semana. A ${name} tem horários disponíveis e o processo é mais simples do que você imagina. Chame pelo WhatsApp agora — cuidar do sorriso não precisa ser complicado.`,
          },
        ],
        screen_text: `Agende sua avaliação — ${name} em ${city}`,
        caption: `Adiar o dentista sai mais caro. A ${name} em ${city} cuida do seu sorriso com cuidado e profissionalismo. Agende agora pelo WhatsApp 👇`,
        cta: "Agendar avaliação",
        whatsapp_message: `Olá, ${name}! Vi o Reels sobre limpeza dental e quero agendar uma avaliação.`,
      },
      {
        title: headline,
        scenes: [
          {
            scene: 1,
            description: "Close em sorriso bonito ou profissional apresentando a clínica.",
            fala: `O sorriso é a primeira coisa que as pessoas notam em você. Ele comunica confiança, cuidado consigo mesmo e presença. E um sorriso saudável começa com atenção profissional regular — não quando o problema já apareceu.`,
          },
          {
            scene: 2,
            description: "Imagem do ambiente da clínica ou atendimento humanizado.",
            fala: `Na ${name}, cada paciente recebe atenção real desde o momento que chega. Trabalhamos com procedimentos que vão desde a limpeza preventiva até tratamentos estéticos — sempre com cuidado, explicando cada etapa e garantindo o conforto de quem está na cadeira.`,
          },
          {
            scene: 3,
            description: "Profissional acenando ou convidando para o contato.",
            fala: `Avaliação disponível essa semana em ${city}. É rápido, sem compromisso e o primeiro passo para um sorriso que você vai amar. Chame pelo WhatsApp e a gente resolve o agendamento agora.`,
          },
        ],
        screen_text: `Sorriso que você merece — ${name}`,
        caption: `Cuidar do sorriso é cuidar de você. A ${name} em ${city} oferece atendimento humanizado e procedimentos de qualidade. Marque sua avaliação pelo WhatsApp 👇`,
        cta: "Marcar avaliação",
        whatsapp_message: `Oi ${name}! Vi o Reels e quero marcar uma avaliação.`,
      },
      {
        title: headline,
        scenes: [
          {
            scene: 1,
            description: "Câmera no ambiente da clínica — organizado, limpo, acolhedor.",
            fala: `Sabia que a maioria das pessoas só vai ao dentista quando está com dor? O problema é que quando a dor aparece, o problema já é mais sério. Limpeza regular, avaliação periódica — é isso que previne tratamentos maiores e mais caros.`,
          },
          {
            scene: 2,
            description: "Close em procedimento sendo feito com cuidado e atenção.",
            fala: `A ${name} em ${city} trabalha com prevenção e cuidado completo do sorriso. Nossa equipe é especializada em fazer o paciente se sentir acolhido em cada etapa — porque dentista não precisa ser sinônimo de ansiedade.`,
          },
          {
            scene: 3,
            description: "Profissional sorrindo e convidando para o contato.",
            fala: `Essa semana tem horários disponíveis para você. Chame a ${name} pelo WhatsApp, faça sua avaliação e cuide do sorriso que você merece ter.`,
          },
        ],
        screen_text: `Prevenção hoje, menos problema amanhã — ${name}`,
        caption: `Saúde bucal não é frescura — é qualidade de vida. A ${name} em ${city} cuida do seu sorriso com profissionalismo e atenção. Agende pelo WhatsApp 👇`,
        cta: "Agendar agora",
        whatsapp_message: `Olá ${name}! Assistí o Reels e gostaria de agendar uma avaliação.`,
      },
    ],

    "personal-trainer": [
      {
        title: headline,
        scenes: [
          {
            scene: 1,
            description: "Treinador ou aluno durante exercício, ambiente de treino ao fundo.",
            fala: `Você treina mas não vê resultado. Ou vê resultado, mas logo estagna. Isso não é falta de esforço — é falta de orientação correta. Treino sem acompanhamento profissional é treino desperdiçado.`,
          },
          {
            scene: 2,
            description: "Demonstração de exercício correto ou acompanhamento individualizado.",
            fala: `Com o ${service} certo, cada sessão tem um objetivo claro: força, definição, condicionamento ou saúde. Na ${name} em ${city}, o treino é montado para você — não para um grupo genérico. A evolução vem de forma consistente porque o plano faz sentido para o seu corpo.`,
          },
          {
            scene: 3,
            description: "Treinador olhando para câmera ou resultado de aluno sendo destacado.",
            fala: `Vagas abertas para início imediato. Se você quer resultado real e não só mais um treino, chame pelo WhatsApp e a gente conversa. Primeira avaliação sem compromisso.`,
          },
        ],
        screen_text: `Treino que gera resultado — ${name} em ${city}`,
        caption: `Resultado real começa com orientação certa. O ${service} na ${name} em ${city} é personalizado para você. Chame pelo WhatsApp e comece agora 👇`,
        cta: "Falar com personal",
        whatsapp_message: `Olá ${name}! Vi o Reels e quero saber mais sobre acompanhamento personalizado.`,
      },
    ],

    estetica: [
      {
        title: headline,
        scenes: [
          {
            scene: 1,
            description: "Profissional preparando o ambiente ou mostrando produtos de qualidade.",
            fala: `Cuidar da pele não é vaidade — é saúde. E cuidar da pele com um profissional faz toda a diferença, porque cada pele tem necessidades diferentes. O que funciona para uma pessoa pode não funcionar para outra.`,
          },
          {
            scene: 2,
            description: "Procedimento sendo realizado com cuidado, close na pele ou no trabalho.",
            fala: `Na ${name} em ${city}, cada atendimento começa com uma análise da sua pele para entender o que ela realmente precisa. Usamos produtos de qualidade e técnicas adequadas para cada situação — porque o resultado que você quer precisa de um protocolo certo.`,
          },
          {
            scene: 3,
            description: "Antes e depois ou profissional convidando para contato.",
            fala: `Agenda aberta essa semana. Chame pelo WhatsApp e agende sua avaliação — cuide da sua pele com quem realmente entende.`,
          },
        ],
        screen_text: `Sua pele merece cuidado profissional — ${name}`,
        caption: `Pele saudável é resultado de cuidado consistente com profissional especializado. A ${name} em ${city} está pronta para te atender. Chame no WhatsApp 👇`,
        cta: "Agendar avaliação",
        whatsapp_message: `Olá ${name}! Vi o Reels e quero saber mais sobre tratamentos.`,
      },
    ],

    restaurante: [
      {
        title: headline,
        scenes: [
          {
            scene: 1,
            description: "Imagem do prato principal sendo preparado ou servido com cuidado.",
            fala: `Uma boa refeição não é só comida — é experiência. É o momento de parar, saborear e cuidar de você mesmo. E quando os ingredientes são frescos e o preparo tem capricho, você percebe a diferença em cada garfada.`,
          },
          {
            scene: 2,
            description: "Cozinha em ação ou detalhe de preparo mostrando cuidado e qualidade.",
            fala: `Na ${name} em ${city}, cada prato é preparado com ingredientes selecionados e atenção real ao sabor. A gente acredita que comer bem é parte de uma rotina que te faz bem — e trabalhamos para que cada refeição valha a pena.`,
          },
          {
            scene: 3,
            description: "Prato finalizado sendo apresentado ou equipe satisfeita.",
            fala: `Cardápio disponível pelo WhatsApp. Pedido fácil, entrega sem complicação, sabor que você vai querer repetir. Chame agora.`,
          },
        ],
        screen_text: `Peça pelo WhatsApp — ${name} em ${city}`,
        caption: `Sabor de verdade feito com cuidado. A ${name} em ${city} prepara cada prato com ingredientes frescos e dedicação. Veja o cardápio e peça pelo WhatsApp 👇`,
        cta: "Ver cardápio",
        whatsapp_message: `Olá ${name}! Vi o Reels e quero ver o cardápio.`,
      },
    ],

    mecanica: [
      {
        title: headline,
        scenes: [
          {
            scene: 1,
            description: "Mecânico trabalhando ou veículo em manutenção.",
            fala: `Seu carro avisa quando precisa de atenção — mas a maioria das pessoas ignora os sinais até virar um problema maior. E problema ignorado em veículo significa custo maior, risco na estrada e dor de cabeça desnecessária.`,
          },
          {
            scene: 2,
            description: "Close em peça sendo verificada ou reparo sendo feito com cuidado.",
            fala: `Na ${name} em ${city}, fazemos diagnóstico completo antes de qualquer serviço. Identificamos o problema com precisão, explicamos o que precisa ser feito e passamos o orçamento sem surpresa. Transparência do início ao fim — porque seu carro nas nossas mãos está em boas mãos.`,
          },
          {
            scene: 3,
            description: "Mecânico indicando aprovação ou veículo pronto sendo entregue.",
            fala: `Solicite seu diagnóstico essa semana pelo WhatsApp. Rápido, sem burocracia e com orçamento claro. A ${name} cuida do seu carro para você ficar tranquilo na estrada.`,
          },
        ],
        screen_text: `Diagnóstico gratuito — ${name} em ${city}`,
        caption: `Carro cuidado é segurança garantida. A ${name} em ${city} faz diagnóstico, manutenção e reparos com transparência e qualidade. Solicite orçamento pelo WhatsApp 👇`,
        cta: "Solicitar orçamento",
        whatsapp_message: `Olá ${name}! Vi o Reels e quero solicitar um diagnóstico do meu veículo.`,
      },
    ],

    default: [
      {
        title: headline,
        scenes: [
          {
            scene: 1,
            description: `Mostre o ambiente ou a equipe da ${name} de forma natural e confiante.`,
            fala: `Se você ainda não conhece o trabalho da ${name} em ${city}, esse Reels vai mudar isso. Porque quando a gente fala em ${service} de qualidade, estamos falando de resultado real — não de promessa.`,
          },
          {
            scene: 2,
            description: `Demonstre o serviço principal sendo realizado ou o resultado do trabalho.`,
            fala: `Na ${name}, cada cliente recebe atenção personalizada do início ao fim. ${service} feito com técnica, experiência e cuidado real — porque você merece um serviço que entrega o que promete, sem complicação e sem surpresa.`,
          },
          {
            scene: 3,
            description: `Equipe ou responsável olhando para a câmera, convidando para o contato.`,
            fala: `Estamos em ${city} com atendimento disponível essa semana. Chame pelo WhatsApp e tire suas dúvidas ou agende diretamente. É simples, rápido e sem compromisso.`,
          },
        ],
        screen_text: `${cfg.cta} — fale com a ${name}`,
        caption: `${service} de qualidade em ${city}. A ${name} está pronta para te atender com atenção e resultado. Chame pelo WhatsApp agora 👇`,
        cta: cfg.cta,
        whatsapp_message: `Olá, ${name}! Vi seu Reels e quero saber mais sobre ${service}.`,
      },
      {
        title: headline,
        scenes: [
          {
            scene: 1,
            description: `Close em detalhe do serviço ou produto que destaca a qualidade.`,
            fala: `O que diferencia um bom serviço de ${service} de um serviço comum? Atenção aos detalhes, técnica de verdade e compromisso com quem está do outro lado. E isso é exatamente o que a ${name} entrega.`,
          },
          {
            scene: 2,
            description: `Mostrar processo de trabalho ou equipe em ação.`,
            fala: `Em ${city}, a ${name} se tornou referência em ${service} por uma razão simples: resultados que falam por si. Cada atendimento é tratado com seriedade, cada cliente sai satisfeito — e isso não é por acaso, é processo.`,
          },
          {
            scene: 3,
            description: `Chamada final para o contato.`,
            fala: `Não deixe mais para depois. Chame a ${name} pelo WhatsApp agora e veja como ${service} feito do jeito certo faz diferença.`,
          },
        ],
        screen_text: `Resultado de verdade — ${name} em ${city}`,
        caption: `${service} que faz diferença. A ${name} em ${city} trabalha com qualidade e dedicação em cada atendimento. Chame no WhatsApp 👇`,
        cta: cfg.cta,
        whatsapp_message: `Oi ${name}! Vi o Reels e quero saber mais sobre ${service} em ${city}.`,
      },
      {
        title: headline,
        scenes: [
          {
            scene: 1,
            description: `Ambiente da ${name} sendo mostrado de forma natural.`,
            fala: `Você conhece a diferença entre um serviço de ${service} que resolve e um que apenas cumpre tabela? A ${name} em ${city} escolheu o primeiro caminho — e os clientes que passam por aqui percebem isso desde o primeiro contato.`,
          },
          {
            scene: 2,
            description: `Detalhe do trabalho sendo feito ou resultado sendo apresentado.`,
            fala: `Trabalhamos com atenção individual porque cada situação é diferente. Na ${name}, você não é mais um cliente — você é a prioridade do momento. E o resultado aparece.`,
          },
          {
            scene: 3,
            description: `Responsável ou equipe convidando para o contato.`,
            fala: `${city} tem a ${name} para ${service} feito com cuidado. Chame pelo WhatsApp agora e experimente a diferença.`,
          },
        ],
        screen_text: `${name} — ${service} em ${city}`,
        caption: `A ${name} em ${city} faz ${service} com cuidado e dedicação reais. Chame pelo WhatsApp e experimente 👇`,
        cta: cfg.cta,
        whatsapp_message: `Olá ${name}! Quero saber mais sobre ${service}.`,
      },
    ],
  };

  const scripts = nicheScripts[input.niche] ?? nicheScripts.default;
  return scripts[v % scripts.length];
}

// ─── Carrossel visual — 6 slides com design ─────────────────

function getCarouselContent(input: ContentInput): CarouselContent {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const headline = input.headline ?? `3 motivos para escolher ${input.businessName}`;
  const name = input.businessName;
  const city = input.city;
  const service = input.mainService;
  const seed = `${input.topic}${input.narrative ?? ""}${input.headline ?? ""}`;
  const v = variationIndex(seed, 3);

  type SlideSet = {
    slides: { slide: number; text: string; title?: string; body?: string; emoji?: string; type?: "cover" | "content" | "cta"; bg?: "primary" | "white" | "dark" }[];
    caption: string;
    whatsapp: string;
  };

  const nicheCarousels: Record<string, SlideSet[]> = {
    barbearia: [
      {
        slides: [
          { slide: 1, title: headline, body: `Por que o seu visual importa mais do que você pensa.`, emoji: "✂️", type: "cover", bg: "primary", text: headline },
          { slide: 2, title: "Visual que comunica presença", body: `Antes de qualquer palavra, seu visual já diz algo. Cabelo bem cuidado, barba feita — é o detalhe que faz você ser levado mais a sério em qualquer situação.`, emoji: "👑", type: "content", bg: "white", text: `1. Visual que comunica presença` },
          { slide: 3, title: "Corte que dura, não que estraga", body: `Um corte bem feito na ${name} aguenta semanas sem perder a forma. Técnica certa, produto de qualidade e atenção ao seu tipo de cabelo fazem toda a diferença.`, emoji: "💈", type: "content", bg: "white", text: `2. Corte que dura, não que estraga` },
          { slide: 4, title: "Atendimento personalizado", body: `Na ${name}, cada cliente é diferente. A gente ouve o que você quer, avalia o formato do seu rosto e entrega o corte que combina com você — não um padrão.`, emoji: "🎯", type: "content", bg: "white", text: `3. Atendimento personalizado` },
          { slide: 5, title: `${name} em ${city}`, body: `Anos atendendo clientes que voltam porque gostaram. Qualidade no corte, respeito no atendimento e resultado que você vê no espelho.`, emoji: "⭐", type: "content", bg: "white", text: `${name} em ${city} — referência em corte masculino` },
          { slide: 6, title: "Agende pelo WhatsApp", body: `Chame agora e garanta seu horário. Agenda aberta, sem complicação, sem espera.`, emoji: "📲", type: "cta", bg: "dark", text: `Reserve seu horário na ${name}` },
        ],
        caption: `Visual bem cuidado faz diferença em tudo. A ${name} em ${city} entrega corte e barba de qualidade. Chame no WhatsApp e garanta seu horário 👇`,
        whatsapp: `Olá! Vi o carrossel e quero agendar um horário na ${name}.`,
      },
      {
        slides: [
          { slide: 1, title: headline, body: `O que um bom corte pode fazer pelo seu dia.`, emoji: "✂️", type: "cover", bg: "primary", text: headline },
          { slide: 2, title: "Primeiro corte, primeiro impacto", body: `A aparência é a primeira coisa que as pessoas percebem. Um visual descuidado passa uma mensagem que você não quer passar — independente de quem você é.`, emoji: "👁️", type: "content", bg: "white", text: `Primeiro corte, primeiro impacto` },
          { slide: 3, title: "Barba feita na navalha", body: `Barba bem desenhada é diferencial masculino. Na ${name}, a navalha define o traço com precisão — limpo, simétrico e do jeito que você pediu.`, emoji: "🪒", type: "content", bg: "white", text: `Barba feita na navalha` },
          { slide: 4, title: "Produtos que fazem diferença", body: `Usamos produtos de qualidade para finalização, barba e tratamento. O resultado dura mais e o visual fica mais impecável do início ao fim.`, emoji: "🧴", type: "content", bg: "white", text: `Produtos que fazem diferença` },
          { slide: 5, title: `Referência em ${city}`, body: `A ${name} é o endereço que clientes indicam para quem busca corte de qualidade real em ${city}. Venha experimentar.`, emoji: "📍", type: "content", bg: "white", text: `Referência em corte masculino em ${city}` },
          { slide: 6, title: "Garanta seu horário agora", body: `WhatsApp aberto. Agenda disponível. Sem fila, sem complicação — só você e o melhor corte da cidade.`, emoji: "🕐", type: "cta", bg: "primary", text: `Agende agora — ${name}` },
        ],
        caption: `Corte que transforma. Barba que define. A ${name} em ${city} cuida do seu visual com técnica real. Chame no WhatsApp 👇`,
        whatsapp: `Oi ${name}! Vi o carrossel e quero marcar um horário para corte e barba.`,
      },
      {
        slides: [
          { slide: 1, title: headline, body: `O visual masculino que você merece ter.`, emoji: "💈", type: "cover", bg: "dark", text: headline },
          { slide: 2, title: "Autoconfiança começa aqui", body: `Saindo da ${name} com o corte certo, você se sente diferente. Aquela sensação de estar pronto para qualquer coisa — começa com o visual em dia.`, emoji: "💪", type: "content", bg: "white", text: `Autoconfiança começa aqui` },
          { slide: 3, title: "Acabamento que impressiona", body: `Não é só o corte que faz a diferença. É o acabamento no pescoço, a sobrancelha alinhada, o detalhe final. Na ${name}, nada passa despercebido.`, emoji: "🎨", type: "content", bg: "white", text: `Acabamento que impressiona` },
          { slide: 4, title: "Ambiente feito para você", body: `${name} não é só barbearia — é o lugar onde você para, descansa e sai renovado. Um espaço pensado para o cliente se sentir bem do início ao fim.`, emoji: "🏆", type: "content", bg: "white", text: `Ambiente feito para você` },
          { slide: 5, title: `Atende em ${city}`, body: `Clientes de ${city} já conhecem a qualidade da ${name}. Horários disponíveis essa semana para novos e antigos clientes.`, emoji: "📍", type: "content", bg: "white", text: `Atendendo em ${city} com qualidade` },
          { slide: 6, title: "Chame agora pelo WhatsApp", body: `Garante sua vaga antes de lotar. Atendimento rápido, resultado garantido.`, emoji: "📱", type: "cta", bg: "primary", text: `Agende na ${name} agora` },
        ],
        caption: `Visual impecável, autoconfiança garantida. A ${name} em ${city} cuidou de muitos visuais — chegou a sua vez. Chame no WhatsApp 👇`,
        whatsapp: `Olá ${name}! Vi o carrossel e quero agendar um horário.`,
      },
    ],

    odontologia: [
      {
        slides: [
          { slide: 1, title: headline, body: `O que você não sabe sobre saúde bucal pode estar custando caro.`, emoji: "🦷", type: "cover", bg: "primary", text: headline },
          { slide: 2, title: "Limpeza previne muito mais", body: `A limpeza dental remove tártaro que escova e fio dental não alcançam. Sem ela, bactérias acumulam, cáries aparecem e o custo do tratamento cresce.`, emoji: "🧹", type: "content", bg: "white", text: `1. Limpeza previne muito mais que você imagina` },
          { slide: 3, title: "Sorriso transmite confiança", body: `Sorriso cuidado é parte da sua imagem. Em entrevistas, reuniões ou encontros — um sorriso saudável comunica saúde, cuidado e confiança antes de qualquer palavra.`, emoji: "😁", type: "content", bg: "white", text: `2. Sorriso saudável transmite confiança` },
          { slide: 4, title: "Atendimento humanizado", body: `Na ${name}, você não é mais um paciente. Cada pessoa recebe atenção individual, explicação de cada etapa e o cuidado de quem realmente se importa com o resultado.`, emoji: "❤️", type: "content", bg: "white", text: `3. Atendimento humanizado na ${name}` },
          { slide: 5, title: `${name} em ${city}`, body: `Clínica odontológica com profissionalismo, estrutura adequada e tratamentos completos. Cuidamos do sorriso de pacientes em ${city} com dedicação.`, emoji: "🏥", type: "content", bg: "white", text: `${name} — referência em odontologia em ${city}` },
          { slide: 6, title: "Agende sua avaliação", body: `Primeira avaliação disponível essa semana. Chame pelo WhatsApp — é rápido, simples e o primeiro passo para o sorriso que você merece.`, emoji: "📲", type: "cta", bg: "primary", text: `Agende sua avaliação na ${name}` },
        ],
        caption: `Sorriso saudável começa com prevenção. A ${name} em ${city} cuida do seu sorriso com atenção e profissionalismo. Agende pelo WhatsApp 👇`,
        whatsapp: `Olá! Vi o carrossel e quero agendar uma avaliação na ${name}.`,
      },
    ],

    "personal-trainer": [
      {
        slides: [
          { slide: 1, title: headline, body: `Por que treino com acompanhamento gera mais resultado.`, emoji: "💪", type: "cover", bg: "primary", text: headline },
          { slide: 2, title: "Treino sem orientação = estagnação", body: `Sem acompanhamento profissional, você treina sem progressão real. Os exercícios ficam no piloto automático e o resultado para de aparecer.`, emoji: "📊", type: "content", bg: "white", text: `1. Treino sem orientação = estagnação` },
          { slide: 3, title: "Planejamento que funciona", body: `Personal trainer bom entende seu objetivo e monta um plano que evolui com você. Nada de treino copiado da internet — é periodização pensada para o seu corpo.`, emoji: "📋", type: "content", bg: "white", text: `2. Planejamento que realmente funciona` },
          { slide: 4, title: "Motivação e consistência", body: `Com acompanhamento, você treina com mais foco, erra menos e mantém a consistência. A ${name} está do seu lado para garantir que você não desista quando fica difícil.`, emoji: "🎯", type: "content", bg: "white", text: `3. Motivação que mantém você no caminho` },
          { slide: 5, title: `${name} em ${city}`, body: `Acompanhamento personalizado para quem quer resultado real. Na ${name} em ${city}, cada aluno tem um plano único — não uma planilha genérica.`, emoji: "⭐", type: "content", bg: "white", text: `${name} em ${city} — personal trainer que entrega resultado` },
          { slide: 6, title: "Vagas abertas agora", body: `Primeira avaliação sem compromisso. Chame pelo WhatsApp e veja o que o treino certo pode fazer por você.`, emoji: "📲", type: "cta", bg: "dark", text: `Comece agora — ${name}` },
        ],
        caption: `Resultado real vem de treino bem orientado. A ${name} em ${city} oferece acompanhamento personalizado para quem quer evolução. Chame no WhatsApp 👇`,
        whatsapp: `Olá ${name}! Vi o carrossel e quero saber mais sobre acompanhamento personalizado.`,
      },
    ],

    default: [
      {
        slides: [
          { slide: 1, title: headline, body: `O que diferencia a ${name} em ${city}.`, emoji: "⭐", type: "cover", bg: "primary", text: headline },
          { slide: 2, title: "Qualidade comprovada", body: `${service} feito por profissionais de ${city} com experiência real. Cada atendimento tem o compromisso de entregar o resultado que você precisa.`, emoji: "🏆", type: "content", bg: "white", text: `1. Qualidade comprovada em ${service}` },
          { slide: 3, title: "Atendimento humanizado", body: `Na ${name}, você não é tratado como número. Cada cliente recebe atenção personalizada, do primeiro contato até o resultado final.`, emoji: "❤️", type: "content", bg: "white", text: `2. Atendimento humanizado e personalizado` },
          { slide: 4, title: "Facilidade no contato", body: `Agendar pela ${name} é simples: chame pelo WhatsApp, explique o que precisa e a gente resolve. Sem burocracia, sem complicação.`, emoji: "📱", type: "content", bg: "white", text: `3. Facilidade — agende pelo WhatsApp` },
          { slide: 5, title: `${name} em ${city}`, body: `Uma empresa que cresce pela qualidade do trabalho e pela confiança dos clientes. ${service} feito com cuidado, entregue com responsabilidade.`, emoji: "📍", type: "content", bg: "white", text: `${name} — referência em ${service} em ${city}` },
          { slide: 6, title: `${cfg.cta}`, body: `Chame pelo WhatsApp agora. Atendimento rápido, resultado garantido.`, emoji: "📲", type: "cta", bg: "primary", text: `${cfg.cta} — ${name}` },
        ],
        caption: `${service} em ${city} com quem realmente entende do assunto. A ${name} está pronta para te atender. Chame no WhatsApp 👇`,
        whatsapp: `Olá, ${name}! Vi o carrossel e quero saber mais sobre ${service}.`,
      },
      {
        slides: [
          { slide: 1, title: headline, body: `Por que tantos clientes escolhem a ${name}.`, emoji: "🎯", type: "cover", bg: "dark", text: headline },
          { slide: 2, title: "Resultado que você vê", body: `Na ${name}, o compromisso é com o resultado. Cada etapa do atendimento de ${service} é feita com atenção para que você saia satisfeito.`, emoji: "✅", type: "content", bg: "white", text: `1. Resultado que você realmente vê` },
          { slide: 3, title: "Profissionais que entendem", body: `Equipe com experiência real em ${service}. Na ${name}, você está nas mãos de quem conhece o que está fazendo — e isso faz toda a diferença no resultado.`, emoji: "👨‍💼", type: "content", bg: "white", text: `2. Profissionais que realmente entendem` },
          { slide: 4, title: "Transparência em tudo", body: `Sem surpresa, sem enrolação. Na ${name}, você sabe o que está sendo feito, por que e quanto vai custar — antes de começar.`, emoji: "🤝", type: "content", bg: "white", text: `3. Transparência do início ao fim` },
          { slide: 5, title: `Atende em ${city}`, body: `${name} em ${city} — o endereço de referência para quem busca ${service} de qualidade na região.`, emoji: "📍", type: "content", bg: "white", text: `Atendendo em ${city} com qualidade` },
          { slide: 6, title: "Fale agora pelo WhatsApp", body: `Atendimento disponível. Chame, explique o que precisa e a gente resolve.`, emoji: "💬", type: "cta", bg: "primary", text: `Fale com a ${name} agora` },
        ],
        caption: `${service} de qualidade em ${city}. A ${name} trabalha com transparência e resultado real. Chame no WhatsApp 👇`,
        whatsapp: `Oi ${name}! Vi o carrossel sobre ${service} e quero saber mais.`,
      },
      {
        slides: [
          { slide: 1, title: headline, body: `Conheça quem faz ${service} diferente em ${city}.`, emoji: "💡", type: "cover", bg: "primary", text: headline },
          { slide: 2, title: "Experiência que se vê", body: `Anos de experiência em ${service} em ${city}. Na ${name}, cada cliente recebe o benefício de um conhecimento construído com prática real e resultados comprovados.`, emoji: "📈", type: "content", bg: "white", text: `1. Experiência que se vê no resultado` },
          { slide: 3, title: "Cuidado do início ao fim", body: `Do primeiro contato até a entrega final, a ${name} acompanha cada etapa com atenção. Você nunca fica no escuro sobre o andamento do que pediu.`, emoji: "🛡️", type: "content", bg: "white", text: `2. Cuidado do início ao fim` },
          { slide: 4, title: "Confiança que se conquista", body: `A ${name} cresceu pelo boca a boca — clientes satisfeitos que indicam para quem confiam. Isso não se compra, se constrói.`, emoji: "🌟", type: "content", bg: "white", text: `3. Confiança construída cliente a cliente` },
          { slide: 5, title: `${service} em ${city}`, body: `Se você está em ${city} e precisa de ${service} feito com qualidade, a ${name} é o endereço certo. Simples assim.`, emoji: "🏡", type: "content", bg: "white", text: `${service} em ${city} — ${name}` },
          { slide: 6, title: `${cfg.cta} agora`, body: `WhatsApp aberto. Resposta rápida. Atendimento sem burocracia.`, emoji: "⚡", type: "cta", bg: "dark", text: `${cfg.cta} — fale com a ${name}` },
        ],
        caption: `A ${name} em ${city} faz ${service} com experiência e cuidado real. Clientes satisfeitos recomendam — venha experimentar. Chame no WhatsApp 👇`,
        whatsapp: `Olá ${name}! Vi o carrossel e tenho interesse em ${service}.`,
      },
    ],
  };

  const carousels = nicheCarousels[input.niche] ?? nicheCarousels.default;
  const chosen = carousels[v % carousels.length];

  return {
    theme: headline,
    slides: chosen.slides,
    caption: chosen.caption,
    whatsapp_message: chosen.whatsapp,
  };
}

// ─── Stories ─────────────────────────────────────────────────

function getStorySequence(input: ContentInput): StorySequence {
  const name = input.businessName;
  const city = input.city;
  const service = input.mainService;
  const seed = `${input.topic}${input.narrative ?? ""}`;
  const v = variationIndex(seed, 3);

  const variants: StorySequence[] = [
    {
      stories: [
        { story: 1, text: `Você precisa de ${service}?`, type: "pergunta" },
        { story: 2, text: `A ${name} atende em ${city} com praticidade e qualidade.`, type: "apresentação" },
        { story: 3, text: `Chame pelo WhatsApp e tire todas as suas dúvidas sem compromisso.`, type: "chamada" },
        { story: 4, text: `Quer saber valores ou horários disponíveis?`, type: "caixinha" },
      ],
      cta: "Responder no WhatsApp",
      whatsapp_message: `Olá, ${name}! Vi seus stories e quero saber mais sobre ${service} em ${city}.`,
    },
    {
      stories: [
        { story: 1, text: `Você sabia que ${service} pode mudar seu resultado?`, type: "pergunta" },
        { story: 2, text: `Na ${name} em ${city} cada atendimento é feito com cuidado e atenção individualizada.`, type: "apresentação" },
        { story: 3, text: `Agenda aberta essa semana — sem fila, sem espera desnecessária.`, type: "chamada" },
        { story: 4, text: `Quanto você acha que custa? Responde aqui ↓`, type: "caixinha" },
      ],
      cta: "Ver valores pelo WhatsApp",
      whatsapp_message: `Oi ${name}! Vi o story e quero saber mais sobre ${service}.`,
    },
    {
      stories: [
        { story: 1, text: `Até quando você vai adiar ${service}?`, type: "pergunta" },
        { story: 2, text: `A ${name} tem o que você precisa em ${city} — com qualidade e preço justo.`, type: "apresentação" },
        { story: 3, text: `Uma mensagem no WhatsApp resolve tudo. A gente responde rápido.`, type: "chamada" },
        { story: 4, text: `Me conta: o que te impede de resolver isso essa semana?`, type: "caixinha" },
      ],
      cta: "Chamar no WhatsApp",
      whatsapp_message: `Olá ${name}! Vi seus stories sobre ${service} e quero mais informações.`,
    },
  ];

  return variants[v];
}

// ─── Caption ─────────────────────────────────────────────────

function getCaption(input: ContentInput): string {
  const name = input.businessName;
  const city = input.city;
  const service = input.mainService;
  const headline = input.headline ?? service;
  const seed = `${input.topic}${input.narrative ?? ""}`;
  const v = variationIndex(seed, 4);

  const nicheTag = input.niche.replace(/-/g, "");
  const cityTag = city.toLowerCase().replace(/[\s-]/g, "");
  const serviceTag = service.toLowerCase().replace(/[\s-]/g, "");

  const templates = [
    `${headline}.\n\nA ${name} atende em ${city} com qualidade e atenção personalizada para ${service}.\n\nChame no WhatsApp e saiba mais 👇\n\n#${nicheTag} #${cityTag} #${serviceTag}`,
    `${headline}.\n\nSe você está em ${city} e procura ${service} feito com cuidado e técnica real, a ${name} é o lugar certo.\n\nChame pelo WhatsApp — a gente responde rápido 👇\n\n#${nicheTag} #${cityTag} #${serviceTag}`,
    `"${headline}"\n\nA ${name} entrega ${service} com atenção real e resultado que você vai ver. Em ${city}, com atendimento pelo WhatsApp.\n\n👇 Chame agora\n\n#${nicheTag} #${serviceTag} #${cityTag}`,
    `${headline} — e a ${name} está pronta para ajudar.\n\n${service} em ${city} com quem realmente entende do assunto. Atendimento pelo WhatsApp, sem complicação.\n\n#${nicheTag} #${cityTag} #${serviceTag}`,
  ];

  return templates[v];
}

// ─── Mensagem WhatsApp ────────────────────────────────────────

function getWhatsAppMessage(input: ContentInput): string {
  const name = input.businessName;
  const service = input.mainService;
  const topicKey = detectTopicKey(input.topic);
  const seed = `${input.topic}${input.niche}`;
  const v = variationIndex(seed, 3);

  const messages: Record<string, string[]> = {
    promoção: [
      `Olá! Tudo bem? Aqui é da ${name}. Essa semana temos uma condição especial para ${service}. Posso te passar os detalhes?`,
      `Oi! Aqui é da ${name}. Temos uma oferta especial para ${service} que encerra em breve. Posso explicar como funciona?`,
      `Olá! Da ${name} aqui. Essa semana tem condição diferenciada para ${service}. Você toparia ouvir os detalhes?`,
    ],
    agenda: [
      `Olá! Aqui é da ${name}. Ainda temos horários disponíveis essa semana para ${service}. Quer que eu veja um horário para você?`,
      `Oi! Aqui é da ${name}. Agenda aberta para ${service} essa semana — posso reservar um horário para você?`,
      `Olá! Da ${name}. Temos vagas disponíveis para ${service} ainda essa semana. Posso te ajudar a agendar?`,
    ],
    dica: [
      `Olá! Aqui é da ${name}. Vi que você tem interesse em ${service}. Posso te passar mais informações e tirar dúvidas?`,
      `Oi! Da ${name} aqui. Queria compartilhar algo importante sobre ${service} que pode te ajudar. Tem um minutinho?`,
      `Olá! Aqui é da ${name}. Preparei uma informação sobre ${service} que pode ser útil pra você. Posso enviar?`,
    ],
    default: [
      `Olá! Aqui é da ${name}. Temos ${service} disponível com atendimento personalizado. Posso te ajudar com mais informações?`,
      `Oi! Da ${name} aqui. Gostaria de te apresentar nosso serviço de ${service}. Posso contar mais?`,
      `Olá! Aqui é da ${name}. Estamos com atendimento disponível para ${service}. Posso te explicar como funciona?`,
    ],
  };

  const group = messages[topicKey] ?? messages.default;
  return group[v % group.length];
}

// ─── 5 variações de WhatsApp por contexto ────────────────────

function getWhatsAppVariations(input: ContentInput): string[] {
  const name = input.businessName;
  const city = input.city;
  const { specificSubject, isSpecific } = interpretUserIntent(input.topic, input.mainService);
  const subject = isSpecific ? specificSubject : input.mainService;

  return [
    // 1. Curta — direta ao ponto
    `Oi! Aqui é ${name}. Temos ${subject} disponível. Posso te ajudar?`,

    // 2. Média — contexto + convite
    `Olá! Aqui é da ${name} em ${city}. ${subject} com qualidade e atendimento rápido pelo WhatsApp. Posso te passar mais detalhes?`,

    // 3. Persuasiva — senso de urgência suave
    `Oi! Da ${name}. Você ainda não aproveitou ${subject}? Agenda aberta essa semana e pode fechar rápido. Posso te contar como funciona?`,

    // 4. Cliente antigo — reativação
    `Oi! Aqui é da ${name}. Faz tempo que você não aparece por aqui! Que tal aproveitar ${subject}? Estamos com horário disponível e seria ótimo te atender de novo.`,

    // 5. Cliente novo — apresentação
    `Olá! Aqui é da ${name}, em ${city}. Vi que você pode ter interesse em ${subject}. Posso tirar suas dúvidas e contar como funciona?`,
  ];
}

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
