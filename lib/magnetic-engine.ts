import { NICHE_CONFIG } from "./niche-config";
import type { ContentFormat } from "@/types";

// ─── Types ─────────────────────────────────────────────────────

export type NarrativeType =
  | "problema-solucao" | "antes-depois" | "dica-rapida" | "erro-comum"
  | "bastidores" | "prova-social" | "apresentacao" | "comparacao"
  | "mito-verdade" | "pergunta-frequente" | "oferta" | "chamada-whatsapp"
  | "autoridade" | "checklist" | "tutorial" | "objecao"
  | "beneficio" | "educativo" | "novidade" | "historia";

export type RefinementMode =
  | "mais-vendedor" | "mais-educativo" | "mais-criativo"
  | "mais-direto" | "mais-elegante" | "menos-generico" | "trocar-angulo";

export interface MagneticInterpretation {
  temaInterpretado: string;
  intencaoUsuario: string;
  nichoLabel: string;
  publicoFinal: string;
  objetivoProbavel: string;
  palavrasChave: KeywordSet;
  doresPublico: string[];
  desejosPublico: string[];
  angulosPossiveis: string[];
  formatosRecomendados: ContentFormat[];
  tomDeVoz: string;
  isFreeTheme?: boolean;
}

export interface KeywordSet {
  nicho: string[];
  desejo: string[];
  dor: string[];
  acao: string[];
  conversao: string[];
  autoridade: string[];
  formato: string[];
}

export interface FullNarrative {
  title: string;
  tipo: NarrativeType;
  angle: string;
  gancho: string;
  dor: string;
  desejo: string;
  promessa: string;
  description: string;
  formatos: ContentFormat[];
  cta: string;
  exemplo: string;
}

// ─── Keyword databases por nicho ──────────────────────────────

const NICHE_KEYWORDS: Record<string, KeywordSet> = {
  barbearia: {
    nicho: ["corte masculino", "barba", "acabamento", "degradê", "navalha", "sobrancelha", "corte social", "fade", "pigmentação"],
    desejo: ["visual impecável", "autoconfiança", "barba desenhada", "estilo próprio", "se sentir bem", "corte perfeito", "presença"],
    dor: ["visual descuidado", "corte mal feito", "barba por fazer", "falta de tempo para agendar", "cabelo sem forma", "corte que não dura"],
    acao: ["agendar horário", "reservar vaga", "chamar no WhatsApp", "marcar atendimento", "garantir horário"],
    conversao: ["hoje", "essa semana", "antes de lotar", "vagas limitadas", "agenda quase cheia", "encerra em breve"],
    autoridade: ["técnica profissional", "produto de qualidade", "anos de experiência", "especialistas em corte", "referência em corte masculino"],
    formato: ["antes e depois do corte", "processo de degradê", "resultado final", "ambiente da barbearia", "detalhe da navalha"],
  },
  odontologia: {
    nicho: ["limpeza dental", "clareamento", "sorriso", "saúde bucal", "tártaro", "cárie", "gengiva", "implante", "aparelho", "restauração"],
    desejo: ["sorriso bonito", "dentes brancos", "confiança ao sorrir", "sorriso alinhado", "dentes limpos e saudáveis", "sorriso que transforma"],
    dor: ["dor de dente", "sensibilidade", "tártaro acumulado", "gengiva inflamada", "cárie avançada", "medo do dentista", "sorriso amarelado"],
    acao: ["agendar avaliação", "marcar consulta", "chamar no WhatsApp", "tirar dúvidas sem compromisso"],
    conversao: ["essa semana", "avaliação disponível", "primeiros horários", "ainda tem vaga"],
    autoridade: ["profissionalismo comprovado", "atendimento humanizado", "equipe especializada", "clínica moderna", "anos de experiência"],
    formato: ["antes e depois do sorriso", "procedimento em detalhe", "equipamentos modernos", "resultado real", "paciente satisfeito"],
  },
  "clinica-medica": {
    nicho: ["consulta médica", "check-up", "prevenção", "saúde", "exames", "acompanhamento", "diagnóstico", "tratamento"],
    desejo: ["saúde em dia", "tranquilidade", "qualidade de vida", "bem-estar", "diagnóstico rápido", "resultado de exame"],
    dor: ["adiar consulta", "sintomas ignorados", "falta de tempo", "problema não diagnosticado", "saúde descuidada", "check-up atrasado"],
    acao: ["agendar consulta", "marcar check-up", "chamar no WhatsApp", "solicitar exames"],
    conversao: ["ainda essa semana", "consulta disponível", "horário aberto", "não adie mais"],
    autoridade: ["médicos especializados", "clínica equipada", "atendimento completo", "cuidado integral", "equipe experiente"],
    formato: ["dica de saúde", "orientação médica", "informativo de prevenção", "depoimento de paciente"],
  },
  otica: {
    nicho: ["óculos", "lentes", "armação", "visão", "exame de vista", "lentes de contato", "UV", "progressivo", "óptica"],
    desejo: ["ver bem", "óculos moderno", "lentes de qualidade", "conforto visual", "óculos que combina com o estilo"],
    dor: ["visão embaçada", "dor de cabeça por visão", "óculos antigo", "lentes riscadas", "dificuldade para enxergar"],
    acao: ["fazer exame de vista", "escolher armação", "consultar especialista", "chamar no WhatsApp"],
    conversao: ["condição especial", "essa semana", "armações selecionadas", "promoção relâmpago"],
    autoridade: ["óticos especializados", "produtos de qualidade", "exame completo gratuito", "lentes certificadas"],
    formato: ["dica sobre visão", "armações em destaque", "novidades de coleção", "como cuidar dos óculos"],
  },
  "personal-trainer": {
    nicho: ["treino personalizado", "academia", "musculação", "emagrecimento", "hipertrofia", "condicionamento", "planilha de treino", "acompanhamento"],
    desejo: ["resultado visível", "corpo definido", "emagrecer com saúde", "ganhar massa", "mais disposição", "consistência no treino"],
    dor: ["sem resultado na academia", "treino errado", "sem motivação", "risco de lesão", "estagnação", "treinar sem orientação"],
    acao: ["começar acompanhamento", "agendar avaliação física", "falar com personal", "chamar no WhatsApp"],
    conversao: ["vagas abertas", "início imediato", "primeira semana especial", "resultado comprovado"],
    autoridade: ["personal certificado", "método comprovado", "acompanhamento real", "resultados documentados"],
    formato: ["exercício em detalhe", "antes e depois", "rotina de treino", "dica técnica de treino"],
  },
  estetica: {
    nicho: ["limpeza de pele", "sobrancelha", "depilação", "massagem", "tratamento facial", "hidratação", "peeling", "skincare"],
    desejo: ["pele bonita e limpa", "bem-estar", "autoestima elevada", "pele jovem", "cuidado profissional", "se sentir renovada"],
    dor: ["pele oleosa e com acne", "pele opaca", "sobrancelha mal feita", "falta de cuidado regular", "cansaço acumulado"],
    acao: ["agendar atendimento", "marcar horário", "chamar no WhatsApp", "reservar vaga"],
    conversao: ["horário disponível", "essa semana", "condição especial", "agenda com vagas"],
    autoridade: ["profissional especializado", "produtos de alta qualidade", "técnica certificada", "resultados visíveis"],
    formato: ["antes e depois da pele", "procedimento passo a passo", "dica de skincare", "resultado de tratamento"],
  },
  "loja-roupa": {
    nicho: ["moda", "roupas", "look", "peças", "estilo", "tendências", "coleção", "fashion", "acessórios"],
    desejo: ["se sentir bonita", "look perfeito para cada ocasião", "estilo próprio definido", "peças novas", "estar na moda"],
    dor: ["não saber o que usar", "peças básicas demais", "looks repetidos", "guarda-roupa sem personalidade"],
    acao: ["ver catálogo", "chamar no WhatsApp", "comprar agora", "visitar a loja"],
    conversao: ["novidade chegou", "últimas peças", "promoção da semana", "peças exclusivas"],
    autoridade: ["moda curada com estilo", "peças selecionadas", "tendências atuais", "consultoria de moda"],
    formato: ["look do dia montado", "novidades da semana", "combinações criativas", "tendências da temporada"],
  },
  imobiliaria: {
    nicho: ["imóvel", "casa", "apartamento", "terreno", "financiamento", "compra", "venda", "aluguel", "corretor"],
    desejo: ["casa própria", "imóvel ideal", "investimento seguro", "sair do aluguel", "espaço maior para a família"],
    dor: ["aluguel pesado", "não entender financiamento", "mercado confuso", "medo de golpe imobiliário", "documentação complicada"],
    acao: ["falar com corretor", "ver imóveis disponíveis", "simular financiamento", "chamar no WhatsApp"],
    conversao: ["oportunidade única", "imóvel em destaque", "condição especial de lançamento", "última unidade"],
    autoridade: ["corretor experiente", "negociação segura", "documentação correta", "assessoria completa"],
    formato: ["imóvel em destaque", "dica de compra consciente", "processo de financiamento simplificado", "bastidores de negociação"],
  },
  restaurante: {
    nicho: ["almoço", "jantar", "cardápio", "prato especial", "delivery", "marmita", "ingredientes frescos", "culinária"],
    desejo: ["refeição gostosa e nutritiva", "praticidade no dia a dia", "sabor diferente", "experiência gastronômica", "comida como em casa"],
    dor: ["comer mal no trabalho", "marmita sem graça", "delivery que decepciona", "sem tempo para cozinhar bem"],
    acao: ["fazer pedido", "chamar no WhatsApp", "ver cardápio completo", "reservar mesa"],
    conversao: ["prato do dia", "promoção do almoço", "delivery disponível agora", "cardápio renovado"],
    autoridade: ["ingredientes frescos selecionados", "cozinha profissional", "sabor comprovado", "receitas exclusivas"],
    formato: ["prato sendo preparado", "apresentação do prato finalizado", "ingredientes em destaque", "cliente satisfeito"],
  },
  mecanica: {
    nicho: ["revisão", "manutenção preventiva", "troca de óleo", "freios", "suspensão", "diagnóstico eletrônico", "motor", "pneu"],
    desejo: ["carro funcionando perfeitamente", "segurança na estrada", "tranquilidade", "manutenção em dia sem surpresa"],
    dor: ["barulho suspeito no carro", "carro que parou na hora errada", "manutenção atrasada", "mecânica que cobra sem explicar"],
    acao: ["solicitar orçamento", "agendar revisão", "chamar no WhatsApp", "levar o carro"],
    conversao: ["diagnóstico gratuito essa semana", "orçamento sem compromisso", "atendimento rápido"],
    autoridade: ["mecânicos experientes", "diagnóstico preciso", "transparência total no orçamento", "garantia do serviço"],
    formato: ["mecânico trabalhando em detalhe", "antes e depois da revisão", "dica de manutenção preventiva"],
  },
  serralheria: {
    nicho: ["portão", "grade", "ferro", "aço", "estrutura metálica", "escada", "manutenção de portão", "automação"],
    desejo: ["segurança para casa e empresa", "portão bonito e durável", "qualidade de acabamento", "portão automático"],
    dor: ["portão enferrujado", "grade velha e sem segurança", "portão barulhento", "manutenção atrasada demais"],
    acao: ["pedir orçamento", "agendar visita técnica", "chamar no WhatsApp", "tirar dúvidas"],
    conversao: ["orçamento gratuito e sem compromisso", "atendimento essa semana", "visita na sua região"],
    autoridade: ["fabricação própria", "anos de experiência", "material de qualidade certificada", "garantia de serviço"],
    formato: ["portão em construção", "antes e depois da instalação", "produto finalizado", "detalhe de acabamento"],
  },
  advogacia: {
    nicho: ["assessoria jurídica", "consultoria legal", "processo judicial", "direitos", "caso jurídico", "contrato", "defesa", "advocacia"],
    desejo: ["caso resolvido com justiça", "direitos garantidos", "segurança jurídica", "vitória no processo", "tranquilidade legal", "problema resolvido de vez"],
    dor: ["processo perdido por falta de representação", "demissão injusta", "cobrança indevida", "contrato com cláusula abusiva", "não conhecer os próprios direitos", "problema jurídico sem solução"],
    acao: ["agendar consulta", "tirar dúvidas jurídicas", "chamar no WhatsApp", "solicitar assessoria"],
    conversao: ["consulta disponível essa semana", "primeira conversa sem compromisso", "atendimento rápido", "caso analisado com urgência"],
    autoridade: ["advogado experiente", "OAB", "anos de atuação", "casos resolvidos", "especialização comprovada", "histórico de resultados"],
    formato: ["dica jurídica do dia", "direito que você não conhecia", "como funciona um processo", "passo a passo jurídico"],
  },
  psicologia: {
    nicho: ["psicoterapia", "saúde mental", "terapia", "sessão", "acompanhamento psicológico", "bem-estar emocional", "ansiedade", "depressão"],
    desejo: ["equilíbrio emocional", "saúde mental", "autoconhecimento", "superar a ansiedade", "se sentir bem consigo mesmo", "qualidade de vida emocional"],
    dor: ["ansiedade constante", "dificuldade de lidar com emoções", "relacionamentos difíceis", "falta de autoestima", "estresse que não passa", "sentimentos que não consegue controlar"],
    acao: ["agendar sessão", "iniciar acompanhamento", "chamar no WhatsApp", "tirar dúvidas sem compromisso"],
    conversao: ["sessão disponível essa semana", "início imediato", "conversa inicial sem compromisso"],
    autoridade: ["psicólogo registrado CRP", "abordagem comprovada", "experiência clínica", "atendimento humanizado"],
    formato: ["dica de saúde mental", "como lidar com ansiedade", "reflexão da semana", "cuidado emocional no dia a dia"],
  },
  contabilidade: {
    nicho: ["contabilidade", "imposto", "declaração", "empresa", "MEI", "CNPJ", "folha de pagamento", "balanço", "BPO financeiro"],
    desejo: ["empresa regularizada", "pagar menos imposto legalmente", "tranquilidade fiscal", "CNPJ sem pendências", "gestão financeira clara"],
    dor: ["multa por atraso", "declaração errada", "imposto mal calculado", "empresa irregular", "medo da Receita Federal", "não entender os números da empresa"],
    acao: ["falar com contador", "solicitar análise gratuita", "chamar no WhatsApp", "regularizar a empresa"],
    conversao: ["análise gratuita essa semana", "regularize agora", "prazo se aproximando", "atendimento imediato"],
    autoridade: ["CRC ativo", "anos de experiência contábil", "clientes atendidos", "especialização em pequenas empresas"],
    formato: ["dica fiscal do dia", "erro que MEI comete", "como declarar corretamente", "economia legal de imposto"],
  },
  outro: {
    nicho: ["serviço", "atendimento", "qualidade", "resultado", "profissional", "solução", "produto"],
    desejo: ["resultado rápido", "qualidade garantida", "atendimento personalizado", "valor justo pelo serviço"],
    dor: ["sem solução para o problema", "mau atendimento anterior", "preço surpresa", "demora excessiva"],
    acao: ["chamar no WhatsApp", "solicitar orçamento", "agendar atendimento", "conhecer o serviço"],
    conversao: ["disponível essa semana", "sem compromisso", "condição especial", "orçamento gratuito"],
    autoridade: ["profissional experiente", "qualidade comprovada", "atendimento personalizado", "resultado garantido"],
    formato: ["trabalho em andamento", "resultado final", "depoimento de cliente", "apresentação do serviço"],
  },
};

const NICHE_AUDIENCE: Record<string, string> = {
  barbearia: "homens que valorizam aparência, estilo e um visual sempre impecável",
  odontologia: "adultos que buscam saúde bucal preventiva e um sorriso mais bonito",
  "clinica-medica": "adultos que precisam de saúde preventiva e acompanhamento de qualidade",
  otica: "pessoas que precisam de óculos ou lentes com qualidade e estilo",
  "personal-trainer": "pessoas que querem resultado real no treino com acompanhamento profissional",
  estetica: "mulheres e homens que valorizam cuidados estéticos e bem-estar",
  "loja-roupa": "pessoas que buscam moda e estilo para o dia a dia",
  imobiliaria: "pessoas que buscam comprar, vender ou alugar imóvel com segurança",
  restaurante: "pessoas que querem refeições gostosas, práticas e de qualidade",
  mecanica: "donos de veículos que precisam de manutenção confiável e transparente",
  serralheria: "proprietários que precisam de portões, grades e estruturas metálicas com qualidade",
  advogacia: "pessoas e empresas que precisam de representação jurídica ou assessoria legal para garantir seus direitos",
  psicologia: "pessoas que buscam saúde mental, equilíbrio emocional e apoio psicológico profissional",
  contabilidade: "empreendedores e pequenas empresas que precisam de contabilidade confiável e organização fiscal",
  outro: "clientes que buscam serviços profissionais de qualidade na região",
};

// ─── Interpreta o pedido do usuário ───────────────────────────

export function interpretMagneticRequest(params: {
  userInput: string;
  businessName: string;
  niche: string;
  city: string;
  mainService: string;
  services?: string[];
  shortDescription?: string;
  refinementMode?: RefinementMode;
}): MagneticInterpretation {
  const { userInput, niche, city, mainService, services, refinementMode } = params;
  const cfg = NICHE_CONFIG[niche] ?? NICHE_CONFIG.outro;
  const keywords = NICHE_KEYWORDS[niche] ?? NICHE_KEYWORDS.outro;
  const lower = userInput.toLowerCase().trim();

  // ── Detecta intenção ──
  let intencaoUsuario = "apresentação";
  let objetivoProbavel = "gerar interesse e atrair novos contatos";

  if (/promo[çc][aã]o|oferta|desconto|especial|promo|liquid/.test(lower)) {
    intencaoUsuario = "promoção";
    objetivoProbavel = "vender com urgência e atrair clientes imediatos";
  } else if (/agenda|hor[aá]rio|vaga|reserv|agendar|marcar|disponível/.test(lower)) {
    intencaoUsuario = "agenda aberta";
    objetivoProbavel = "gerar agendamentos e ocupar a agenda";
  } else if (/cen[aá]rio|mostrar\s+(o\s+)?cen[aá]rio|mostrar\s+(uma?\s+)?situa[çc][aã]o|situa[çc][aã]o\s+real|quero\s+mostrar\s+o\s+que\s+acontece/.test(lower)) {
    intencaoUsuario = "cenário";
    objetivoProbavel = "contar uma situação real que o público reconhece e que leva à ação";
  } else if (/dica|como\s|por\s+que|segredo|erro|aprend|ensinar|orientaç|tutorial/.test(lower)) {
    intencaoUsuario = "dica educativa";
    objetivoProbavel = "educar o público e construir autoridade";
  } else if (/bastidor|por\s+tr[aá]s|processo|rotina|dia\s+a\s+dia|funciona/.test(lower)) {
    intencaoUsuario = "bastidores";
    objetivoProbavel = "gerar conexão humana e mostrar o processo real";
  } else if (/depoimento|avalia[çc][aã]o|feedback|resultado\s+real|antes\s+e\s+depois|transforma/.test(lower)) {
    intencaoUsuario = "prova social";
    objetivoProbavel = "mostrar resultados reais e conquistar confiança";
  } else if (/lan[çc]amento|novo\s+servi[çc]o|novidade|chegou|lançamos|estrean/.test(lower)) {
    intencaoUsuario = "lançamento";
    objetivoProbavel = "anunciar novidade e gerar curiosidade e interesse";
  } else if (/produto|pe[çc]a|artigo|item|cole[çc]/.test(lower)) {
    intencaoUsuario = "produto";
    objetivoProbavel = "mostrar produto e estimular compra";
  } else if (/whatsapp|mensagem|chamar|contato|falar\s+com/.test(lower)) {
    intencaoUsuario = "chamada para WhatsApp";
    objetivoProbavel = "gerar contatos diretos e conversas no WhatsApp";
  } else if (/recuperar|cliente\s+antigo|cliente\s+sumiu|reativ|saudade|voltando/.test(lower)) {
    intencaoUsuario = "reativação de clientes";
    objetivoProbavel = "recuperar clientes inativos e reativar relacionamento";
  } else if (/apresentar|conheça|quem\s+somos|sobre\s+n[oó]s|meu\s+neg[oó]cio|minha\s+empresa/.test(lower)) {
    intencaoUsuario = "apresentação";
    objetivoProbavel = "apresentar o negócio e gerar conhecimento e interesse";
  } else if (/vender|venda|fechar|comprar|adquirir/.test(lower)) {
    intencaoUsuario = "venda direta";
    objetivoProbavel = "converter interesse em venda ou contrato";
  } else if (/reels|v[ií]deo|gravar|câmera|roteiro/.test(lower)) {
    intencaoUsuario = "conteúdo em vídeo";
    objetivoProbavel = "criar conteúdo em vídeo com alto engajamento";
  } else if (/carrossel|slides|sequência|passo\s+a\s+passo/.test(lower)) {
    intencaoUsuario = "carrossel educativo";
    objetivoProbavel = "criar carrossel que educa e gera salvamentos";
  }

  // ── Extrai o tema específico ──
  let temaInterpretado = userInput
    // Remove prefixos de intenção com verbo + formato ("quero fazer um video sobre...")
    .replace(/^(quero|preciso)\s+(criar?|fazer|gerar?|escrever?)\s+(um|uma)?\s*(v[ií]deo|post|conteúdo|conteudo|roteiro|legenda|reels|carrossel|story|stories)?\s*(sobre|de|do|da|para)?\s*/i, "")
    // Remove prefixo genérico de intenção ("quero algo para divulgar sobre...")
    .replace(/^(quero|preciso\s*de?|me\s+ajuda|me\s+ajude)\s+(algo|um|uma|conteúdo|conteudo|post|coisa)?\s*(para\s+postar|de\s+post|para\s+criar|para\s+divulgar|sobre|de|do|da)?\s*/i, "")
    // Remove verbo de criação no início, incluindo infinitivos (fazer, criar, gerar, escrever)
    .replace(/^(criar?|gerar?|fazer|faz|faça|escrever?)\s+(um|uma)?\s*(v[ií]deo|post|conteúdo|conteudo|roteiro|legenda|reels|carrossel|story|stories)?\s*(sobre|de|do|da|para)?\s*/i, "")
    .replace(/^(quero\s+)?(falar\s+)?(sobre|de|do|da)\s*/i, "")
    .replace(/^(quero\s+)?(mostrar|divulgar|anunciar|comunicar|apresentar)\s*/i, "")
    // Remove referências em primeira pessoa que sobram ("sobre mim", "mim", "eu")
    .replace(/^(sobre\s+)?(mim|eu|a\s+mim)\s*/i, "")
    // Remove possessivos no início ("nossa advocacia", "meu escritório")
    .replace(/^(nossa?|nosso?|minha?|meu)\s+/i, "")
    // Remove qualificadores de localização no final ("que é nova em X", "em X", "localizada em X")
    .replace(/\s+que\s+(é|e|somos|ficamos|estamos|fica|está)\s+(nova?|recém[\s-]aberta?|localizada?\s+)?(em|no|na)\s+[\wÀ-ú]+/gi, "")
    .replace(/\s+(localizada?\s+)?(em|no|na)\s+[\wÀ-ú]+\s*$/i, "")
    // Remove ruídos genéricos
    .replace(/\s*no\s+meu\s+nicho(\s+(que\s+[eéè]|de|do|da))?\s*/gi, " ")
    .replace(/\s*mostrando\s+(o\s+)?(nosso|meu|nossa|minha)\s+/gi, " ")
    .replace(/\s*para\s+(meu|minha|nosso|nossa)\s+(negócio|negocio|empresa|loja|marca|escritório)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const isGenericInput =
    /^(meu\s+neg[oó]cio|minha\s+empresa|meu\s+trabalho|meu\s+servi[çc]o|meu\s+escrit[oó]rio)$/.test(temaInterpretado.toLowerCase()) ||
    temaInterpretado.length < 3;

  if (isGenericInput) temaInterpretado = mainService;

  // Se ainda for uma frase longa e vaga (> 6 palavras), usa o serviço principal
  if (temaInterpretado.split(" ").length > 6) temaInterpretado = mainService;

  // ── Enriquece com serviços cadastrados ──
  const servicoDetectado = services?.find(s =>
    s.toLowerCase().split(/\s+/).some(w => lower.includes(w.toLowerCase()) && w.length > 4)
  );
  if (servicoDetectado && !isGenericInput) {
    if (lower.includes(servicoDetectado.toLowerCase())) {
      temaInterpretado = servicoDetectado;
    }
  }

  // ── Remove qualificadores temporais sem valor semântico ──
  temaInterpretado = temaInterpretado
    .replace(/\s+d[aeo]\s+semana\b/gi, "")
    .replace(/\s+d[eo]\s+m[eê]s\b/gi, "")
    .replace(/\s+de\s+hoje\b/gi, "")
    .trim();
  if (temaInterpretado.length < 3) temaInterpretado = mainService;

  // ── Resolve frases de intenção pura → assunto real ──────────────
  // Quando o usuário digita só "agenda aberta", "bastidores", etc.,
  // o tema deve ser o assunto do conteúdo, não a frase de intenção.
  const AGENDA_FRASES = new Set([
    "agenda aberta", "agenda", "horário", "horários", "vagas", "vaga",
    "disponível", "disponíveis", "agendamento",
  ]);
  const AGENDA_TEMA_NICHO: Record<string, string> = {
    barbearia:          "horários para corte e barba",
    odontologia:        "consultas disponíveis",
    "clinica-medica":   "consultas disponíveis",
    estetica:           "horários para tratamentos",
    "personal-trainer": "vagas para acompanhamento",
    advogacia:          "horários para consulta jurídica",
    psicologia:         "sessões disponíveis",
    mecanica:           "agenda para revisão",
    serralheria:        "horários para orçamento",
    contabilidade:      "horários para consultoria",
  };
  const INTENCOES_PURAS = new Set([
    "bastidores", "bastidor",
    "dica", "dicas",
    "depoimento", "depoimentos",
    "avaliação", "avaliações",
    "lançamento",
    "novidade", "novidades",
    "antes e depois",
    "promoção", "oferta",
    "cenário", "cenario", "situação", "situacao",
    "reels", "vídeo", "video", "roteiro",
  ]);

  const temaLower = temaInterpretado.toLowerCase();
  if (AGENDA_FRASES.has(temaLower)) {
    temaInterpretado = AGENDA_TEMA_NICHO[niche] ?? `horários disponíveis para ${mainService}`;
  } else if (INTENCOES_PURAS.has(temaLower)) {
    temaInterpretado = mainService;
  }

  // ── Remove sufixos de formato do tema ("em um reels", "para um reels", "no reels") ──
  // "atrair mais clientes em um reels" → "atrair mais clientes"
  temaInterpretado = temaInterpretado
    .replace(/\s+(em\s+um|para\s+um|num|no|pra\s+um?|n[ou])\s+(reels?|reel|v[ií]deo|stories?|story|carrossel|post)\s*$/i, "")
    .trim();
  if (temaInterpretado.length < 3) temaInterpretado = mainService;

  // ── Objetivos de negócio (não são temas de conteúdo — mapeiam pro serviço principal) ──
  // "atrair mais clientes", "conseguir clientes", "aumentar vendas", "crescer" → mainService
  const BUSINESS_GOAL_PATTERNS = [
    /^atrair\s+(mais\s+)?clientes?\b/i,
    /^conseguir\s+(mais\s+)?clientes?\b/i,
    /^trazer\s+(mais\s+)?clientes?\b/i,
    /^aumentar\s+(as\s+)?(vendas?|clientes?|faturamento|lucro)\b/i,
    /^crescer\s+(meu|minha|o|a|os|as)?\s*(neg[oó]cio|empresa|marca|canal)\b/i,
    /^(ganhar|ter)\s+mais\s+clientes?\b/i,
    /^mais\s+clientes?\b/i,
    /^captar\s+(mais\s+)?clientes?\b/i,
    /^(vender?\s+mais|alavancar|impulsionar|escalar)\b/i,
    /^divulgar\s+(meu|minha|o|a|os)?\s*(neg[oó]cio|servi[çc]o|trabalho|empresa)\b/i,
  ];
  if (BUSINESS_GOAL_PATTERNS.some(p => p.test(temaInterpretado))) {
    temaInterpretado = mainService;
  }

  // ── Remove prefixos verbais de intenção que não são o assunto ──
  // "quero explicar como funciona" → mainService, não "explicar como funciona"
  // "quero mostrar como trabalho" → mainService
  // "como cuidar de X" → mainService (o verbo não é o assunto)
  const VERB_INTENT_PATTERNS = [
    /^(quero?\s+)?(explicar?|mostrar?|falar|ensinar?|contar|apresentar)\s+(como\s+)?(funciona|trabalh[ao]|[eé]\s+feito|[eé]\s+realizado|acontece)/i,
    /^(como\s+)?(funciona|trabalh[ao]|[eé]\s+feito|[eé]\s+realizado)\s*$/i,
    /^como\s+\w+(ar|er|ir)\b/i,
  ];
  if (VERB_INTENT_PATTERNS.some(p => p.test(temaInterpretado))) {
    temaInterpretado = mainService;
  }

  // ── Strip prefixo "dica de/sobre X" → extrai o assunto real ──
  // "dica de como cuidar dos dentes" → "como cuidar dos dentes" → depois cai em VERB_INTENT_PATTERNS
  // "dica sobre nutrição" → "nutrição"
  const dicaMatch = temaInterpretado.match(/^dicas?\s+(?:de|sobre|para)\s+(.+)$/i);
  if (dicaMatch) {
    const assunto = dicaMatch[1].trim();
    temaInterpretado = assunto.length >= 3 ? assunto : mainService;
    // Se o assunto extraído ainda é uma frase verbal (como cuidar, como escolher), vira mainService
    if (VERB_INTENT_PATTERNS.some(p => p.test(temaInterpretado))) {
      temaInterpretado = mainService;
    }
  }

  // ── Strip prefixo "bastidores de X" → extrai o assunto ──
  const bastidoresMatch = temaInterpretado.match(/^bastidores?\s+(?:de|do|da)\s+(.+)$/i);
  if (bastidoresMatch) {
    const assunto = bastidoresMatch[1].trim();
    temaInterpretado = assunto.length >= 3 ? assunto : mainService;
  }

  // ── Strip prefixo "promoção para" / "oferta para" → extrai o sujeito ──
  // "promoção para casais" → "casais" (para usar no roteiro: "condição especial para casais")
  const promocaoMatch = temaInterpretado.match(/^(?:promo[çc][aã]o|oferta)\s+para?\s+(.+)$/i);
  if (promocaoMatch) {
    const sujeito = promocaoMatch[1].trim();
    temaInterpretado = sujeito.length >= 3 ? sujeito : mainService;
  }

  // ── Detecta tema livre (não relacionado ao nicho do negócio) ────
  const FREE_THEME_PATTERNS = [
    /\bvend[eo]r?\s+(meu|minha|nosso|nossa)\s+\w+/,
    /\b(carro|moto[çc]icleta?|ve[íi]culo|autom[oó]vel)\b/,
  ];
  const nicheKwsAll = (NICHE_KEYWORDS[niche] ?? NICHE_KEYWORDS.outro).nicho;
  const hasNicheMatch = nicheKwsAll.some(kw => lower.includes(kw.toLowerCase().slice(0, 5)));
  const isFreeTheme = FREE_THEME_PATTERNS.some(p => p.test(lower)) && !hasNicheMatch;

  // ── Palavras-chave contextuais ──
  const palavrasChave = generateContextualKeywords({ niche, topic: temaInterpretado, intent: intencaoUsuario });

  // ── Tom de voz ──
  let tomDeVoz = cfg.tone;
  if (refinementMode === "mais-vendedor") tomDeVoz = "Direto, vendedor e com urgência real";
  else if (refinementMode === "mais-educativo") tomDeVoz = "Informativo, didático e acessível";
  else if (refinementMode === "mais-elegante") tomDeVoz = "Sofisticado, elegante e premium";
  else if (refinementMode === "mais-criativo") tomDeVoz = "Original, criativo e surpreendente";
  else if (refinementMode === "mais-direto") tomDeVoz = "Curto, direto e objetivo — sem rodeios";
  else if (refinementMode === "menos-generico") tomDeVoz = `Específico para ${cfg.label} em ${city}`;

  // ── Formatos recomendados ──
  let formatosRecomendados: ContentFormat[] = ["carrossel", "post", "whatsapp"];
  if (["bastidores", "prova social", "antes-depois", "conteúdo em vídeo"].includes(intencaoUsuario)) {
    formatosRecomendados = ["reels", "carrossel", "post"];
  } else if (["chamada para WhatsApp", "promoção", "reativação de clientes", "venda direta"].includes(intencaoUsuario)) {
    formatosRecomendados = ["whatsapp", "story", "post"];
  } else if (["dica educativa", "carrossel educativo"].includes(intencaoUsuario)) {
    formatosRecomendados = ["carrossel", "reels", "post"];
  } else if (intencaoUsuario === "agenda aberta") {
    formatosRecomendados = ["story", "whatsapp", "post"];
  }

  // ── Ângulos possíveis baseados no tema real ──
  const angulosPossiveis = buildAngles(temaInterpretado, intencaoUsuario, niche);

  return {
    temaInterpretado,
    intencaoUsuario,
    nichoLabel: cfg.label,
    publicoFinal: NICHE_AUDIENCE[niche] ?? "pessoas que buscam qualidade na região",
    objetivoProbavel,
    palavrasChave,
    doresPublico: keywords.dor.slice(0, 5),
    desejosPublico: keywords.desejo.slice(0, 5),
    angulosPossiveis,
    formatosRecomendados,
    tomDeVoz,
    isFreeTheme,
  };
}

function buildAngles(tema: string, intent: string, niche: string): string[] {
  const intencaoAngles: Record<string, string[]> = {
    "promoção": [
      `Por que essa oferta de ${tema} não vai se repetir`,
      `O que você ganha agindo agora com ${tema}`,
      `Como aproveitar melhor essa condição especial`,
      `Quem já aproveitou ${tema} e saiu ganhando`,
    ],
    "dica educativa": [
      `O que a maioria não sabe sobre ${tema}`,
      `3 erros que as pessoas cometem com ${tema}`,
      `Como fazer ${tema} do jeito certo`,
      `A verdade sobre ${tema} que ninguém conta`,
    ],
    "bastidores": [
      `Como funciona ${tema} na prática`,
      `O que acontece antes do resultado em ${tema}`,
      `A rotina real por trás de ${tema}`,
      `O cuidado invisível por trás de ${tema}`,
    ],
    "prova social": [
      `Resultado real de quem já fez ${tema}`,
      `A transformação que ${tema} gerou em clientes reais`,
      `Por que clientes voltam sempre para ${tema}`,
      `O antes e depois real de ${tema}`,
    ],
    "agenda aberta": [
      `Horário aberto para ${tema} — não perca`,
      `Você ainda não agendou ${tema} este mês`,
      `As vagas para ${tema} estão se esgotando`,
      `Por que adiar ${tema} sai mais caro`,
    ],
    "apresentação": [
      `O que é ${tema} e por que faz diferença`,
      `Por que nosso ${tema} é diferente dos outros`,
      `Tudo que você precisa saber sobre ${tema}`,
      `Como ${tema} pode mudar sua experiência`,
    ],
  };

  const base = [
    `A dor real que ${tema} resolve`,
    `O desejo que ${tema} realiza`,
    `Por que ${tema} faz diferença no resultado`,
    `O erro mais comum relacionado a ${tema}`,
    `Resultado real com ${tema}`,
  ];

  const extra = intencaoAngles[intent] ?? [];
  return [...(extra.slice(0, 3)), ...base].slice(0, 7);
}

// ─── Geração de palavras-chave contextuais ─────────────────────

export function generateContextualKeywords(params: {
  niche: string;
  topic: string;
  intent: string;
}): KeywordSet {
  const { niche, topic } = params;
  const base = NICHE_KEYWORDS[niche] ?? NICHE_KEYWORDS.outro;

  // Palavras extras extraídas do tema digitado
  const topicWords = topic
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(w => w.length > 3 && !["para", "como", "sobre", "quero", "criar", "fazer"].includes(w))
    .slice(0, 3)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1));

  return {
    nicho: Array.from(new Set([...base.nicho.slice(0, 6), ...topicWords])).slice(0, 8),
    desejo: base.desejo.slice(0, 5),
    dor: base.dor.slice(0, 5),
    acao: base.acao,
    conversao: base.conversao,
    autoridade: base.autoridade,
    formato: base.formato,
  };
}

// ─── Gera narrativas magnéticas completas ─────────────────────

export function generateMagneticNarratives(params: {
  interpretation: MagneticInterpretation;
  businessName: string;
  city: string;
  mainService: string;
  niche: string;
  variationSeed: number;
  refinementMode?: RefinementMode;
}): FullNarrative[] {
  const { interpretation, businessName, city, mainService, niche, variationSeed, refinementMode } = params;
  const { temaInterpretado, intencaoUsuario, doresPublico, desejosPublico } = interpretation;
  const cfg = NICHE_CONFIG[niche] ?? NICHE_CONFIG.outro;

  const tema = temaInterpretado;
  const nome = businessName;
  const cta = cfg.cta;
  const dor0 = doresPublico[0] ?? "dificuldade com o problema";
  const dor1 = doresPublico[1] ?? "resultado aquém do esperado";
  const des0 = desejosPublico[0] ?? "resultado que transforma";
  const des1 = desejosPublico[1] ?? "qualidade e confiança";

  // ── Narrativas específicas por intenção ──────────────────────────
  // Injetadas no topo quando a intenção exige ângulos próprios
  const intentInjections: Partial<Record<string, FullNarrative[]>> = {
    "agenda aberta": [
      {
        title: `Agenda aberta — essa semana tem horário para você`,
        tipo: "chamada-whatsapp",
        angle: "Aviso direto de disponibilidade",
        gancho: `Aviso claro e direto: existem horários disponíveis e o público precisa saber agora.`,
        dor: "querer marcar mas não saber se tem vaga",
        desejo: "garantir um atendimento logo, sem complicação",
        promessa: `Comunicar de forma direta que há vagas disponíveis e facilitar o agendamento pelo WhatsApp.`,
        description: `Roteiro simples e direto: agenda aberta, venha agendar. Funciona melhor com urgência real.`,
        formatos: ["reels", "story", "whatsapp"],
        cta,
        exemplo: `"Passando avisar que estamos com agenda aberta. Chame agora no WhatsApp."`,
      },
      {
        title: `Os horários enchem rápido — garante o seu agora`,
        tipo: "oferta",
        angle: "Urgência de disponibilidade limitada",
        gancho: `Vagas limitadas criam urgência real — o público procrastina menos quando sente que pode perder.`,
        dor: "perder o horário e ficar sem atendimento quando precisar",
        desejo: "garantir seu horário com facilidade antes de lotar",
        promessa: `Criar urgência genuína: vagas existem agora, mas a agenda vai fechar — aja antes.`,
        description: `Roteiro que comunica disponibilidade com leve urgência — "ainda tem vaga, mas vai encher".`,
        formatos: ["reels", "story"],
        cta,
        exemplo: `"Agenda aberta com limite — depois não garantimos. Chame agora."`,
      },
      {
        title: `Você ainda não marcou esse mês? Ainda dá tempo`,
        tipo: "objecao",
        angle: "Quebra de procrastinação",
        gancho: `Falar direto com quem está adiando o agendamento gera identificação e ação imediata.`,
        dor: "ficar adiando o atendimento sem razão concreta",
        desejo: "resolver de uma vez sem complicação ou burocracia",
        promessa: `Quebrar a procrastinação: vaga existe, é simples marcar, não há desculpa para esperar.`,
        description: `Roteiro que questiona o adiamento e apresenta solução: um WhatsApp é o suficiente.`,
        formatos: ["reels", "story"],
        cta,
        exemplo: `"Ainda não marcou? Ainda tem horário — é só chamar no WhatsApp."`,
      },
    ],
    "promoção": [
      {
        title: `Essa condição especial encerra em breve`,
        tipo: "oferta",
        angle: "Urgência e oportunidade real",
        gancho: `Promoções com prazo real criam urgência genuína que leva à ação imediata.`,
        dor: "perder uma boa oportunidade por procrastinar",
        desejo: "economizar e aproveitar no momento certo",
        promessa: `Criar urgência real para que o cliente tome ação hoje — chame antes que encerre.`,
        description: `Roteiro de promoção com prazo claro e benefício concreto — agir agora vale a pena.`,
        formatos: ["story", "reels", "whatsapp"],
        cta,
        exemplo: `"Condição especial disponível só essa semana — chame agora no WhatsApp."`,
      },
      {
        title: `Condição especial para novos clientes`,
        tipo: "chamada-whatsapp",
        angle: "Convite com vantagem concreta",
        gancho: `Uma vantagem clara e exclusiva reduz a barreira de entrada para novos clientes.`,
        dor: "não ter um motivo concreto para dar o primeiro passo agora",
        desejo: "aproveitar uma oportunidade real que vale a pena",
        promessa: `Apresentar uma condição especial que incentive o primeiro contato imediato.`,
        description: `Roteiro que apresenta promoção como convite: venha agora, tem uma vantagem esperando.`,
        formatos: ["story", "whatsapp"],
        cta,
        exemplo: `"Essa semana temos uma condição especial para quem vier pela primeira vez. Chame no WhatsApp."`,
      },
    ],
    "bastidores": [
      {
        title: `Como funciona o atendimento na ${businessName} — do início ao fim`,
        tipo: "bastidores",
        angle: "Transparência do processo",
        gancho: `Mostrar o processo completo reduz resistência e aumenta a confiança antes do primeiro contato.`,
        dor: "não saber o que acontece antes de ser atendido ou contratar",
        desejo: "entender o processo e se sentir seguro antes de entrar em contato",
        promessa: `Abrir os bastidores: mostrar o processo real, do primeiro contato ao resultado final.`,
        description: `Roteiro que apresenta o passo a passo do atendimento — simples, transparente, confiante.`,
        formatos: ["reels"],
        cta,
        exemplo: `"Deixa eu te mostrar como funciona aqui: você chama, a gente organiza tudo, e entrega o resultado."`,
      },
      {
        title: `O que acontece antes do resultado que você vê no feed`,
        tipo: "historia",
        angle: "Bastidores reais",
        gancho: `O público quer ver o que normalmente está escondido — bastidores criam curiosidade e identificação.`,
        dor: "não ter visão do processo real por trás dos resultados mostrados",
        desejo: "ver autenticidade e trabalho real — não só o resultado polido",
        promessa: `Mostrar o trabalho por trás do resultado: processo, atenção e dedicação que o cliente não vê.`,
        description: `Roteiro documental: câmera no processo real, mostrando preparação, execução e resultado.`,
        formatos: ["reels"],
        cta,
        exemplo: `"Esse vídeo é sobre o que acontece aqui antes do resultado. Sem filtro."`,
      },
      {
        title: `Em menos de 30 segundos: como funciona a ${businessName}`,
        tipo: "educativo",
        angle: "Clareza e objetividade",
        gancho: `Responder diretamente "como funciona" remove a principal barreira para o primeiro contato.`,
        dor: "ter dúvidas sobre como é o processo e não saber se encaixa na rotina",
        desejo: "entender rapidamente se vale entrar em contato e como funciona",
        promessa: `Explicar de forma objetiva e simples como funciona — facilitando a decisão de chamar.`,
        description: `Roteiro curto e direto: você chama, a gente agenda, cuida de tudo. Simples assim.`,
        formatos: ["reels", "story"],
        cta,
        exemplo: `"É simples: você chama no WhatsApp, a gente organiza, e entrega o resultado. Sem burocracia."`,
      },
    ],
    "cenário": [
      {
        title: `O cenário que mais vejo — e que poderia ter sido diferente`,
        tipo: "historia",
        angle: "Situação real com consequência",
        gancho: `Narrar uma situação real que o público reconhece cria identificação imediata e senso de urgência genuíno.`,
        dor: "estar em uma situação difícil sem saber que tem solução ou que poderia ter sido evitada",
        desejo: "entender o que fazer antes que o problema cresça — com apoio de quem entende",
        promessa: `Mostrar um cenário real e como o profissional certo muda o resultado — sem ser alarmista.`,
        description: `Roteiro narrativo: abre com uma situação que o público reconhece, desenvolve as consequências e apresenta a virada com o serviço como solução.`,
        formatos: ["reels"],
        cta,
        exemplo: `"Deixa eu te contar o que acontece quando você tenta resolver isso sozinho — e o que muda quando você tem o profissional certo."`,
      },
      {
        title: `O que acontece quando você adia demais — cenário real`,
        tipo: "problema-solucao",
        angle: "Consequência da procrastinação",
        gancho: `Mostrar o custo real de adiar cria urgência genuína em quem está no mesmo ciclo.`,
        dor: "deixar o problema crescer porque não sabia o custo de esperar",
        desejo: "resolver antes que vire algo grande — e ter paz de saber que está no controle",
        promessa: `Contar a progressão de um problema pequeno que virou grande por falta de ação — e como evitar isso.`,
        description: `Roteiro de consequência: pequeno problema → ignorado → problema maior → custo alto. A virada mostra o que muda com o profissional certo.`,
        formatos: ["reels"],
        cta,
        exemplo: `"O que começa pequeno vai crescendo. E o que seria simples de resolver vira algo muito mais complicado."`,
      },
      {
        title: `Você já passou por uma situação assim?`,
        tipo: "objecao",
        angle: "Identificação com situação universal do nicho",
        gancho: `Abrir com uma pergunta de identificação faz o público parar imediatamente — "isso aconteceu comigo".`,
        dor: "estar em uma situação incerta sem saber por onde começar ou com quem falar",
        desejo: "ter clareza sobre o que fazer e alguém de confiança para guiar",
        promessa: `Criar identificação com uma situação que o público reconhece — e apresentar o caminho claro para resolver.`,
        description: `Roteiro de identificação: você já passou por isso? → assim sente quem está nessa situação → é assim que muda com ajuda certa.`,
        formatos: ["reels"],
        cta,
        exemplo: `"Você já esteve em uma situação em que sabia que precisava de ajuda — mas ficou sem saber por onde começar?"`,
      },
    ],
    "dica educativa": [
      {
        title: `O que poucos sabem sobre ${tema} — e como isso muda tudo`,
        tipo: "educativo",
        angle: "Revelação de informação valiosa",
        gancho: `Revelar algo que o público não sabe posiciona como autoridade e gera compartilhamento natural.`,
        dor: "tomar decisões sobre o assunto sem a informação certa",
        desejo: "entender o assunto melhor para fazer escolhas melhores",
        promessa: `Compartilhar uma informação que o público provavelmente não tinha — e que muda como age.`,
        description: `Roteiro educativo: explique algo não óbvio sobre o tema de forma simples e acessível.`,
        formatos: ["reels", "carrossel"],
        cta,
        exemplo: `"A maioria não sabe, mas ${tema} funciona diferente do que as pessoas imaginam."`,
      },
      {
        title: `O erro mais comum com ${tema} — e como evitar`,
        tipo: "erro-comum",
        angle: "Revelação de erro frequente",
        gancho: `Revelar um erro comum cria identificação imediata — quem já errou vai compartilhar e quem não errou vai aprender.`,
        dor: "cometer erros por falta de informação e pagar mais caro depois",
        desejo: "fazer certo desde o início e evitar retrabalho ou custo extra",
        promessa: `Apontar o erro frequente e apresentar a solução correta — posicionando como referência confiável.`,
        description: `Roteiro que começa com o erro, desenvolve o problema e apresenta a solução certa.`,
        formatos: ["reels", "carrossel"],
        cta,
        exemplo: `"O erro mais comum que vejo: tentar resolver ${tema} sem orientação especializada."`,
      },
      {
        title: `3 coisas sobre ${tema} que fazem diferença no resultado`,
        tipo: "checklist",
        angle: "Lista educativa com impacto",
        gancho: `Listas numeradas criam senso de completude — o público fica para ver todos os pontos.`,
        dor: "não saber quais fatores realmente importam e tomar decisões baseadas em achismo",
        desejo: "ter clareza sobre o que fazer e o que evitar para alcançar o resultado certo",
        promessa: `Entregar 3 pontos práticos e acionáveis que o público pode usar imediatamente.`,
        description: `Roteiro em formato de lista: 3 pontos, 1 corte por ponto, texto na tela acompanhando.`,
        formatos: ["reels", "carrossel"],
        cta,
        exemplo: `"3 coisas sobre ${tema} que a maioria descobre tarde demais."`,
      },
    ],
  };

  const injected = intentInjections[intencaoUsuario] ?? [];

  // Pool completo de 20 tipos de narrativa
  // Títulos e ganchos focados na SITUAÇÃO DO PÚBLICO — nunca inserem o tema diretamente em posição gramatical incorreta
  const allNarratives: FullNarrative[] = [
    {
      title: `O problema que todo mundo deixa crescer — até não ter saída`,
      tipo: "problema-solucao",
      angle: "Problema e solução",
      gancho: `Muita gente ignora esse problema até o dia que ele vira algo muito maior. Não precisa ser assim.`,
      dor: dor0,
      desejo: des0,
      promessa: `Mostrar que ${nome} tem a solução real para quem enfrenta ${dor0} em ${city}.`,
      description: `Conte o problema que o cliente enfrenta e mostre como ${nome} resolve de verdade.`,
      formatos: ["carrossel", "reels", "post"],
      cta: `${cta} — ${nome} em ${city}`,
      exemplo: `"Você está nessa situação agora? Aqui está como resolver de vez com ${nome}."`,
    },
    {
      title: `A transformação real de quem fez a escolha certa`,
      tipo: "antes-depois",
      angle: "Transformação real",
      gancho: `O antes e o depois falam por si — e a diferença começa com uma decisão simples.`,
      dor: dor1,
      desejo: des1,
      promessa: `Mostrar a transformação real de clientes que passaram pela ${nome} em ${city}.`,
      description: `Contraste visual e emocional — o antes (dor) e o depois (resultado) com ${nome}.`,
      formatos: ["reels", "carrossel", "post"],
      cta: `Veja o resultado — chame a ${nome}`,
      exemplo: `"Antes: ${dor0}. Depois de escolher ${nome}: ${des0}."`,
    },
    {
      title: `A dica que muda tudo — e que poucos profissionais compartilham`,
      tipo: "dica-rapida",
      angle: "Valor imediato",
      gancho: `Uma informação simples que faz diferença real — e que você provavelmente ainda não ouviu.`,
      dor: "falta de informação confiável que leve a boas decisões",
      desejo: "aprender algo útil e aplicar imediatamente",
      promessa: `Posicionar ${nome} como especialista entregando valor genuíno e prático.`,
      description: `Entregue uma dica prática, simples e relevante sobre o nicho que o cliente pode usar agora.`,
      formatos: ["post", "story", "reels"],
      cta: `Quer saber mais? Chame a ${nome} no WhatsApp`,
      exemplo: `"3 coisas que mudam seu resultado — e que a maioria das pessoas nunca considera."`,
    },
    {
      title: `O erro mais comum — e como evitar antes que seja tarde`,
      tipo: "erro-comum",
      angle: "Correção e orientação",
      gancho: `Tem um erro que aparece toda hora — e que a maioria comete sem perceber.`,
      dor: "fazer errado sem saber e perder resultado por isso",
      desejo: "acertar desta vez e ter resultado real",
      promessa: `Mostrar o expertise de ${nome} ao corrigir o que as pessoas fazem de errado.`,
      description: `Aponte o erro mais comum no nicho e mostre a solução que apenas especialistas conhecem.`,
      formatos: ["reels", "carrossel", "post"],
      cta: `Não cometa esse erro — chame a ${nome}`,
      exemplo: `"Se você faz isso, está perdendo resultado. Veja o que funciona de verdade."`,
    },
    {
      title: `Bastidores: como o trabalho acontece de verdade`,
      tipo: "bastidores",
      angle: "Humanização e processo",
      gancho: `Você já viu como esse processo funciona por dentro? O que acontece nos bastidores surpreende.`,
      dor: "não saber em quem confiar antes de decidir",
      desejo: "transparência e confiança no processo antes de contratar",
      promessa: `Humanizar ${nome} mostrando o cuidado real e o processo que faz diferença.`,
      description: `Mostre os bastidores do trabalho na ${nome} para gerar conexão e confiança genuína.`,
      formatos: ["reels", "story", "post"],
      cta: `Venha conhecer de perto — ${nome} em ${city}`,
      exemplo: `"Bastidores do nosso processo — sem filtro, do início ao resultado final."`,
    },
    {
      title: `O que os clientes falam — sem edição`,
      tipo: "prova-social",
      angle: "Prova e credibilidade",
      gancho: `Não somos nós falando — são os clientes mostrando o resultado real.`,
      dor: "medo de se decepcionar ao contratar",
      desejo: "garantia de resultado antes de investir",
      promessa: `Mostrar que ${nome} entrega resultado real documentado, não promessas vazias.`,
      description: `Use depoimentos, avaliações e resultados documentados para construir confiança genuína.`,
      formatos: ["carrossel", "post", "reels"],
      cta: `Seja o próximo resultado — ${nome} em ${city}`,
      exemplo: `"O que nossos clientes falam sobre o atendimento na ${nome} em ${city}."`,
    },
    {
      title: `Conheça a ${nome} em ${city} — quem somos e o que fazemos`,
      tipo: "apresentacao",
      angle: "Apresentação direta",
      gancho: `Se você ainda não conhece a ${nome}, esse conteúdo foi feito para você.`,
      dor: "não saber onde encontrar quem resolve o problema com qualidade",
      desejo: "conhecer o serviço antes de decidir",
      promessa: `Apresentar ${nome} de forma clara e convidativa para quem ainda não conhece.`,
      description: `Apresente o negócio, como funciona, quem atende e por que vale a pena escolher ${nome}.`,
      formatos: ["carrossel", "post", "story"],
      cta: `${cta} — ${nome} em ${city}`,
      exemplo: `"Tudo sobre a ${nome}: o que fazemos, como funciona e como agendar em ${city}."`,
    },
    {
      title: `Por que a ${nome} é a escolha mais inteligente em ${city}`,
      tipo: "autoridade",
      angle: "Posicionamento de especialista",
      gancho: `Em ${city}, quando precisam de resultado real, as pessoas chegam até a ${nome}. Tem uma razão.`,
      dor: "não saber em quem confiar para ter resultado",
      desejo: "contratar o melhor profissional da região com segurança",
      promessa: `Posicionar ${nome} como a referência definitiva e a escolha mais segura em ${city}.`,
      description: `Mostre os diferenciais, a experiência e por que ${nome} é a escolha mais inteligente.`,
      formatos: ["carrossel", "post", "reels"],
      cta: `${cta} com a referência — ${nome}`,
      exemplo: `"O que faz a ${nome} diferente de qualquer outra opção em ${city} — veja."`,
    },
    {
      title: `5 sinais de que está na hora de resolver isso`,
      tipo: "checklist",
      angle: "Guia prático com verificação",
      gancho: `Se você se identificar com esses sinais, já passou da hora de agir.`,
      dor: "insegurança sobre quando e como agir",
      desejo: "clareza e orientação prática para não errar",
      promessa: `Oferecer guia prático que educa e posiciona ${nome} como autoridade de confiança.`,
      description: `Crie um checklist com sinais concretos que o cliente reconhece e que levam à ação.`,
      formatos: ["carrossel", "post"],
      cta: `Se marcou algum, chame a ${nome}`,
      exemplo: `"5 sinais de que você precisa de ajuda agora — e que a maioria ignora até tarde demais."`,
    },
    {
      title: `Uma mensagem resolve tudo — sem burocracia`,
      tipo: "chamada-whatsapp",
      angle: "Facilidade e sem burocracia",
      gancho: `Você não precisa complicar para começar. Uma mensagem já é o suficiente.`,
      dor: "achar que vai ser difícil, demorado ou caro entrar em contato",
      desejo: "praticidade, rapidez e sem burocracia para resolver",
      promessa: `Mostrar como é simples e rápido começar com ${nome} — sem complicação.`,
      description: `Mostre que entrar em contato com ${nome} é instantâneo e a resposta é rápida e humana.`,
      formatos: ["story", "post", "whatsapp"],
      cta: `Chame agora no WhatsApp — ${nome}`,
      exemplo: `"Quer resolver? É só chamar no WhatsApp da ${nome} em ${city}. Respondemos rápido."`,
    },
    {
      title: `Essa condição não vai se repetir — chame agora`,
      tipo: "oferta",
      angle: "Urgência e oportunidade real",
      gancho: `Essa oportunidade tem prazo. Quem age agora sai na frente.`,
      dor: "perder uma boa oportunidade por procrastinar",
      desejo: "economizar e agir no momento certo sem deixar passar",
      promessa: `Criar urgência genuína para que o cliente tome ação hoje na ${nome}.`,
      description: `Apresente uma oferta ou condição especial com prazo claro e benefício concreto.`,
      formatos: ["story", "post", "whatsapp"],
      cta: `Aproveite — chame a ${nome} agora`,
      exemplo: `"Condição especial disponível só essa semana na ${nome} — encerra sem prorrogação."`,
    },
    {
      title: `Os mitos que impedem as pessoas de agir — desmontados`,
      tipo: "mito-verdade",
      angle: "Desconstrução de crenças limitantes",
      gancho: `Tem muita informação errada circulando — e ela está impedindo muita gente de tomar a decisão certa.`,
      dor: "acreditar em mitos que impedem de agir e perder tempo",
      desejo: "saber a verdade e tomar decisão com segurança real",
      promessa: `Mostrar que ${nome} conhece profundamente o assunto e desfaz as barreiras mentais do público.`,
      description: `Quebre os mitos mais comuns no nicho e substitua por verdades que você conhece.`,
      formatos: ["carrossel", "post", "reels"],
      cta: `${cta} com quem realmente entende — ${nome}`,
      exemplo: `"Mito: é caro e demorado. Verdade: veja o que realmente acontece na ${nome}."`,
    },
    {
      title: `A dúvida mais comum que nos chegam — respondida`,
      tipo: "pergunta-frequente",
      angle: "FAQ e clareza que remove barreira",
      gancho: `Essa pergunta aparece toda hora. A resposta honesta vai te surpreender.`,
      dor: "dúvida que impede a decisão de agir",
      desejo: "ter clareza completa antes de contratar",
      promessa: `Responder a pergunta mais frequente e remover a última barreira para o cliente decidir.`,
      description: `Responda a dúvida mais comum do seu público de forma clara, direta e humana.`,
      formatos: ["carrossel", "post", "story"],
      cta: `Ainda com dúvida? Chame a ${nome} no WhatsApp`,
      exemplo: `"A pergunta que todo cliente faz antes de contratar — e a resposta real que damos."`,
    },
    {
      title: `O que você realmente ganha ao escolher a ${nome}`,
      tipo: "beneficio",
      angle: "Benefício concreto e tangível",
      gancho: `Quando você escolhe a ${nome}, recebe muito mais do que imagina. Veja o que está incluído.`,
      dor: "não ver o valor real do serviço antes de contratar",
      desejo: des0,
      promessa: `Mostrar de forma clara os benefícios reais e tangíveis de escolher ${nome}.`,
      description: `Liste os benefícios concretos do serviço de forma direta e irresistível.`,
      formatos: ["post", "carrossel", "whatsapp"],
      cta: `${cta} e sinta a diferença — ${nome}`,
      exemplo: `"Além do resultado, você também recebe: [lista de benefícios reais da ${nome}]."`,
    },
    {
      title: `Como funciona o processo na ${nome} — sem mistério`,
      tipo: "tutorial",
      angle: "Transparência e processo revelado",
      gancho: `Você sabe exatamente o que esperar da ${nome} do início ao fim? A gente mostra.`,
      dor: "medo do desconhecido antes de tomar a decisão de contratar",
      desejo: "entender o processo completo antes de decidir",
      promessa: `Mostrar o processo passo a passo para eliminar incerteza e gerar confiança em ${nome}.`,
      description: `Explique como funciona o atendimento da ${nome} do primeiro contato até o resultado final.`,
      formatos: ["carrossel", "reels", "post"],
      cta: `Começar é simples — chame a ${nome}`,
      exemplo: `"Como é ser atendido na ${nome}: do primeiro WhatsApp ao resultado final."`,
    },
    {
      title: `Você já pensou: "é caro demais" ou "não tenho tempo"?`,
      tipo: "objecao",
      angle: "Objeção e superação direta",
      gancho: `Essas objeções são reais. A resposta honesta que a gente dá vai mudar como você vê isso.`,
      dor: "objeções concretas que impedem de dar o primeiro passo",
      desejo: "superar as dúvidas e agir com confiança e clareza",
      promessa: `Desmontar as principais objeções e mostrar que ${nome} tem uma resposta honesta para cada uma.`,
      description: `Aborde as objeções mais comuns do seu público de forma direta e empática, sem enrolação.`,
      formatos: ["reels", "carrossel", "post"],
      cta: `Sem desculpa — chame a ${nome} e veja`,
      exemplo: `"'É caro.' A resposta honesta da ${nome}: [resposta real e empática com contexto]."`,
    },
    {
      title: `O que você precisa saber — mas ninguém conta direito`,
      tipo: "educativo",
      angle: "Conteúdo educativo de valor",
      gancho: `Tem uma informação importante que poucos profissionais compartilham de verdade. Essa é uma delas.`,
      dor: "tomar decisão sem informação correta e errar por isso",
      desejo: "estar bem informado para decidir com segurança",
      promessa: `Educar o público de forma genuína, construindo autoridade real para ${nome}.`,
      description: `Compartilhe conhecimento profundo do seu nicho que genuinamente ajuda o cliente.`,
      formatos: ["carrossel", "post", "reels"],
      cta: `Saiba mais com quem entende — ${nome}`,
      exemplo: `"O que você realmente precisa saber antes de qualquer decisão — sem enrolação."`,
    },
    {
      title: `Tem novidade na ${nome} — veja o que chegou`,
      tipo: "novidade",
      angle: "Lançamento e curiosidade",
      gancho: `A ${nome} acabou de lançar algo novo em ${city} — e você precisa saber disso.`,
      dor: "ficar por fora das novidades e oportunidades",
      desejo: "ser um dos primeiros a saber e aproveitar",
      promessa: `Anunciar novidade genuína e criar senso de urgência positivo na ${nome}.`,
      description: `Anuncie um novo serviço, produto, horário ou condição especial com entusiasmo real.`,
      formatos: ["story", "post", "whatsapp"],
      cta: `Seja o primeiro — chame a ${nome} agora`,
      exemplo: `"Novidade na ${nome}: [descrição da novidade] — disponível já em ${city}."`,
    },
    {
      title: `Por que a ${nome} existe — uma história real`,
      tipo: "historia",
      angle: "Narrativa e conexão emocional",
      gancho: `Toda escolha que fazemos aqui tem uma razão. Ela começou de uma forma simples e real.`,
      dor: "falta de conexão genuína com a marca antes de contratar",
      desejo: "sentir que está escolhendo alguém que realmente se importa",
      promessa: `Criar conexão emocional entre o cliente e ${nome} através de uma história verdadeira.`,
      description: `Conte a história por trás do negócio, do serviço ou de um resultado marcante.`,
      formatos: ["reels", "post", "carrossel"],
      cta: `Faça parte da história — ${nome} em ${city}`,
      exemplo: `"Por que a ${nome} existe? Tudo começou quando..."`,
    },
    {
      title: `Com profissional vs. sem profissional: a diferença real`,
      tipo: "comparacao",
      angle: "Comparação e contraste",
      gancho: `A diferença entre fazer com o profissional certo e tentar sozinho é maior do que parece.`,
      dor: "não saber a real diferença entre contratar e tentar sozinho",
      desejo: "tomar a decisão mais inteligente com clareza",
      promessa: `Mostrar claramente por que ${nome} é a melhor opção comparada ao que existe.`,
      description: `Compare o resultado com ${nome} versus sem profissional ou com alternativas inferiores.`,
      formatos: ["carrossel", "reels", "post"],
      cta: `Escolha o melhor — ${nome} em ${city}`,
      exemplo: `"Com profissional: [resultado]. Sem profissional: [consequência]. A diferença real."`,
    },
  ];

  // Intento → tipos de narrativa preferidos
  const intentPreferences: Record<string, NarrativeType[]> = {
    "promoção": ["oferta", "chamada-whatsapp", "beneficio", "problema-solucao", "comparacao"],
    "agenda aberta": ["chamada-whatsapp", "oferta", "apresentacao", "autoridade", "beneficio"],
    "dica educativa": ["dica-rapida", "erro-comum", "checklist", "tutorial", "mito-verdade", "educativo"],
    "bastidores": ["bastidores", "autoridade", "apresentacao", "prova-social", "historia"],
    "prova social": ["prova-social", "antes-depois", "autoridade", "beneficio", "comparacao"],
    "lançamento": ["novidade", "apresentacao", "chamada-whatsapp", "beneficio", "oferta"],
    "apresentação": ["apresentacao", "autoridade", "beneficio", "antes-depois", "historia"],
    "reativação de clientes": ["chamada-whatsapp", "prova-social", "oferta", "antes-depois", "historia"],
    "chamada para WhatsApp": ["chamada-whatsapp", "oferta", "beneficio", "apresentacao", "objecao"],
    "venda direta": ["oferta", "chamada-whatsapp", "beneficio", "objecao", "comparacao"],
    "conteúdo em vídeo": ["bastidores", "antes-depois", "dica-rapida", "erro-comum", "prova-social"],
    "carrossel educativo": ["checklist", "tutorial", "mito-verdade", "educativo", "pergunta-frequente"],
  };

  // Refinement mode → ajuste de tipos preferidos
  const refinementPreferences: Partial<Record<RefinementMode, NarrativeType[]>> = {
    "mais-vendedor": ["oferta", "chamada-whatsapp", "beneficio", "comparacao", "objecao"],
    "mais-educativo": ["educativo", "tutorial", "checklist", "mito-verdade", "pergunta-frequente"],
    "mais-criativo": ["historia", "bastidores", "antes-depois", "mito-verdade", "novidade"],
    "mais-direto": ["chamada-whatsapp", "oferta", "beneficio", "apresentacao", "dica-rapida"],
    "mais-elegante": ["autoridade", "historia", "beneficio", "antes-depois", "apresentacao"],
    "menos-generico": ["antes-depois", "prova-social", "bastidores", "historia", "erro-comum"],
    "trocar-angulo": ["comparacao", "objecao", "novidade", "checklist", "tutorial"],
  };

  const preferred = refinementMode
    ? (refinementPreferences[refinementMode] ?? [])
    : (intentPreferences[intencaoUsuario] ?? []);

  // Ordena: preferidos primeiro, depois o resto
  const sorted = [
    ...allNarratives.filter(n => preferred.includes(n.tipo)),
    ...allNarratives.filter(n => !preferred.includes(n.tipo)),
  ];

  // Aplica offset de variação para garantir rotação entre gerações
  const offset = variationSeed % Math.max(sorted.length - 8, 1);
  const rotated = [...sorted.slice(offset), ...sorted.slice(0, offset)];

  // Injeções de intent no topo (sem duplicar tipo já presente nas preferidas)
  const injectedTypes = new Set(injected.map(n => n.tipo));
  const baseWithoutDupes = rotated.filter(n => !injectedTypes.has(n.tipo));

  return [...injected, ...baseWithoutDupes].slice(0, 8);
}
