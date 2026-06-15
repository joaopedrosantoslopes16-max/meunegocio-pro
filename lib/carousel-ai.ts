// Groq AI content generation for Premium Carousel
// Free tier: 14.400 req/day — no credit card needed
// Sign up at console.groq.com → API Keys → Create Key

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const FREE_MODEL = "llama-3.3-70b-versatile";

export interface AISlideContent {
  badge: string;
  title: string;
  body?: string;
  listItems?: string[];
}

export interface AICarouselContent {
  coverTitle: string;
  coverSubtitle: string;
  slides: AISlideContent[];
  caption: string;
  whatsappMessage: string;
}

interface SlideRequest {
  role: string;
  layout: "title_only" | "title_body" | "title_list";
}

// ─── Perfil completo do negócio ──────────────────────────────
const TONE_MAP: Record<string, string> = {
  informal: "próximo e informal — como um amigo que entende do assunto",
  profissional: "profissional e sério — credibilidade e expertise",
  inspirador: "motivador e inspirador — emociona e dá vontade de agir",
  direto: "direto ao ponto — objetivo, foco no resultado e na ação",
};

function buildBusinessProfile(params: {
  businessName: string;
  niche: string;
  mainService: string;
  city: string;
  description?: string;
  services?: string[];
  benefits?: string[];
  targetAudience?: string;
  customerPain?: string;
  differentiator?: string;
  tone?: string;
  goals?: string[];
}): string {
  const lines: string[] = [
    `Nome: ${params.businessName}`,
    `Nicho: ${params.niche}`,
    `Serviço principal: ${params.mainService}`,
    `Cidade: ${params.city}`,
  ];
  if (params.description) lines.push(`Descrição: ${params.description}`);
  if (params.services?.length) lines.push(`Serviços: ${params.services.slice(0, 5).join(", ")}`);
  if (params.differentiator) lines.push(`Diferencial: ${params.differentiator}`);
  if (params.benefits?.length) lines.push(`Outros diferenciais: ${params.benefits.slice(0, 3).join(", ")}`);
  if (params.targetAudience) lines.push(`\nPÚBLICO-ALVO (descrito pelo dono):\n"${params.targetAudience}"`);
  if (params.customerPain) lines.push(`Maior dor do cliente: "${params.customerPain}"`);
  if (params.tone) lines.push(`Tom de voz: ${TONE_MAP[params.tone] ?? params.tone}`);
  if (params.goals?.length) lines.push(`Objetivos: ${params.goals.join(", ")}`);
  return lines.join("\n");
}

// ─── Carrossel a partir de tema/objetivo (fluxo existente) ───
export async function generateCarouselWithAI(params: {
  businessName: string;
  niche: string;
  mainService: string;
  city: string;
  objective: string;
  cleanSubject: string;
  description?: string;
  services?: string[];
  benefits?: string[];
  targetAudience?: string;
  customerPain?: string;
  differentiator?: string;
  tone?: string;
  goals?: string[];
  slideRoles: SlideRequest[];
  apiKey: string;
}): Promise<AICarouselContent | null> {
  const {
    objective, cleanSubject, slideRoles, apiKey,
  } = params;

  const objectiveMap: Record<string, string> = {
    vender: "vender o serviço, gerar leads e conversões",
    educar: "educar o público sobre o tema, gerar autoridade",
    promocao: "divulgar uma promoção com urgência",
    servico: "apresentar como o serviço funciona",
    autoridade: "mostrar expertise e diferenciais do negócio",
    whatsapp: "fazer o público entrar em contato pelo WhatsApp",
    recuperar: "reativar clientes antigos com oferta especial",
    novidade: "anunciar uma novidade ou lançamento",
    duvidas: "responder dúvidas frequentes do público",
  };

  const businessProfile = buildBusinessProfile(params);

  const slidesSpec = slideRoles.map((s, i) =>
    `Slide ${i + 1} (${s.role}): ${
      s.layout === "title_list"
        ? "badge + título + lista de 3-4 itens curtos"
        : s.layout === "title_body"
        ? "badge + título + corpo (1-2 frases)"
        : "badge + título impactante"
    }`
  ).join("\n");

  const audienceInstruction = params.targetAudience
    ? `\nINSTRUÇÃO CENTRAL: todo o conteúdo deve ser escrito PARA o público-alvo descrito acima. Cada slide deve ressoar com a realidade, dor, desejo e linguagem DESSA pessoa específica.`
    : "";

  const prompt = `Você é um copywriter especialista em marketing digital brasileiro para Instagram. Sua missão é criar carrosséis que pareçam feitos por um profissional de marketing premium — conteúdo específico para o nicho, títulos impactantes, linguagem que converte.

PERFIL DO NEGÓCIO
${businessProfile}
${audienceInstruction}

CARROSSEL
Tema: ${cleanSubject || params.mainService}
Objetivo: ${objectiveMap[objective] || objective}

ESTRUTURA DOS SLIDES (gere exatamente ${slideRoles.length} slides)
${slidesSpec}

REGRAS DE QUALIDADE — siga à risca:
1. PÚBLICO: escreva como se estivesse falando diretamente com o público-alvo descrito. Se não há descrição, deduza pelo nicho.
2. ESPECIFICIDADE: cada slide deve ser específico para o nicho. Nunca use títulos genéricos como "Resultado Garantido" — seja concreto: "3 casos resolvidos em 30 dias", "Sem dor no primeiro atendimento", etc.
3. TÍTULOS: máximo 8 palavras. Comece com verbo ou número quando possível. Impactante, direto, gera curiosidade.
4. BADGES: 2-3 palavras em MAIÚSCULAS. Exemplos: "VOCÊ SABIA?", "O PROBLEMA", "A SOLUÇÃO", "CASO REAL", "EM NÚMEROS", "SEU PRÓXIMO PASSO"
5. LISTAS: 3-4 itens, máximo 6 palavras cada, paralelos (mesmo tempo verbal)
6. CORPO: 1-2 frases diretas que falem com a dor ou desejo concreto do público-alvo
7. VARIEDADE: cada slide deve ter um ângulo diferente — não repita a mesma ideia
8. Use "${params.businessName}" e "${params.city}" no máximo 2 vezes no total
9. LEGENDA: 3-4 linhas, engajante, com call to action claro para o objetivo "${objectiveMap[objective] || objective}" e 3-5 hashtags do nicho
10. WHATSAPP: máximo 2 linhas, como se o cliente viesse do Instagram

Responda APENAS com JSON válido neste formato:
{
  "coverTitle": "título da capa impactante (até 6 palavras)",
  "coverSubtitle": "subtítulo que complementa a capa (até 10 palavras)",
  "slides": [
    {
      "badge": "BADGE EM MAIÚSCULAS",
      "title": "Título específico e impactante",
      "body": "Texto do corpo OU ausente se tiver listItems",
      "listItems": ["item 1", "item 2", "item 3"]
    }
  ],
  "caption": "Legenda completa Instagram",
  "whatsappMessage": "Mensagem curta WhatsApp"
}

body e listItems são mutuamente exclusivos — use um ou outro, nunca os dois no mesmo slide.`;

  return callGroq(prompt, params.businessName, params.mainService, slideRoles.length, apiKey);
}

// ─── Carrossel a partir de descrição livre do usuário ────────
export async function generateCarouselFromDescription(params: {
  userDescription: string;
  businessName: string;
  niche: string;
  mainService: string;
  city: string;
  whatsapp?: string;
  description?: string;
  services?: string[];
  benefits?: string[];
  targetAudience?: string;
  customerPain?: string;
  differentiator?: string;
  tone?: string;
  goals?: string[];
  slideCount?: number;
  apiKey: string;
}): Promise<AICarouselContent | null> {
  const {
    userDescription, whatsapp, slideCount = 6, apiKey,
  } = params;

  const businessProfile = buildBusinessProfile(params);
  const contentSlides = Math.max(2, slideCount - 2); // exclui capa e CTA

  const audienceInstruction = params.targetAudience
    ? `\nINSTRUÇÃO CENTRAL: todo o conteúdo deve ser escrito PARA o público-alvo descrito acima. Cada slide deve ressoar com a realidade, dor e desejo DESSA pessoa.`
    : "";

  const prompt = `Você é um copywriter especialista em marketing digital brasileiro para Instagram. Crie um carrossel de alta conversão com base na descrição do dono do negócio.

PERFIL DO NEGÓCIO
${businessProfile}
${audienceInstruction}

O DONO DO NEGÓCIO DESCREVEU O QUE QUER:
"${userDescription}"

Sua missão: interpretar o que o dono quer comunicar, definir o melhor ângulo narrativo para o público-alvo, e criar ${slideCount} slides completos.

ESTRUTURA ESPERADA:
- Slide 1: CAPA — título impactante que para o scroll
- Slides 2 a ${slideCount - 1}: CONTEÚDO — ${contentSlides} slides que desenvolvem o tema. Você decide o ângulo de cada um com base na descrição e no público-alvo.
- Slide ${slideCount}: CTA — chamada para ação clara${whatsapp ? ` para o WhatsApp (${whatsapp})` : ""}

REGRAS:
1. Cada slide deve falar DIRETAMENTE com o público-alvo — use a linguagem, dores e desejos deles
2. Títulos: máximo 8 palavras, impactantes, específicos para o nicho
3. Badges: 2-3 palavras em MAIÚSCULAS
4. Listas: 3-4 itens paralelos de até 6 palavras cada
5. Corpo: 1-2 frases que tocam na dor ou no desejo real do público
6. Nunca use títulos genéricos — seja concreto e específico para esse nicho e esse público
7. Legenda: 3-4 linhas engajantes + CTA + 3-5 hashtags do nicho
8. WhatsApp: 2 linhas máximo, como se o cliente viesse do Instagram

Responda APENAS com JSON válido neste formato:
{
  "coverTitle": "título da capa que para o scroll (até 6 palavras)",
  "coverSubtitle": "subtítulo complementar (até 10 palavras)",
  "slides": [
    {
      "badge": "BADGE EM MAIÚSCULAS",
      "title": "Título específico",
      "body": "texto OU ausente se usar listItems",
      "listItems": ["item 1", "item 2", "item 3"]
    }
  ],
  "caption": "Legenda completa Instagram",
  "whatsappMessage": "Mensagem curta WhatsApp"
}

Gere exatamente ${contentSlides} objetos no array "slides" (não inclua a capa nem o CTA no array — eles são separados).
body e listItems são mutuamente exclusivos.`;

  return callGroq(prompt, params.businessName, params.mainService, contentSlides, apiKey);
}

// ─── Chamada compartilhada ao Groq ───────────────────────────
async function callGroq(
  prompt: string,
  businessName: string,
  mainService: string,
  expectedSlides: number,
  apiKey: string,
): Promise<AICarouselContent | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    let res: Response;
    try {
      res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: FREE_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.8,
          max_tokens: 2500,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error("[carousel-ai] Groq error:", res.status, errText);
      return null;
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) { console.error("[carousel-ai] Empty content from model"); return null; }

    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) ?? raw.match(/(\{[\s\S]*\})/);
    const jsonStr = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : raw;

    const parsed: AICarouselContent = JSON.parse(jsonStr.trim());

    if (!parsed.coverTitle || !Array.isArray(parsed.slides)) return null;

    while (parsed.slides.length < expectedSlides) {
      parsed.slides.push({ badge: "SAIBA MAIS", title: mainService });
    }
    parsed.slides = parsed.slides.slice(0, expectedSlides);

    return parsed;
  } catch (err) {
    console.error("[carousel-ai] Generation failed:", err);
    return null;
  }
}
