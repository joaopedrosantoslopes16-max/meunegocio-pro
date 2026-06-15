import { interpretMagneticRequest } from "./magnetic-engine";
import type { ReelsScript, StorySequence } from "@/types";

export type VideoPlatform = "reels" | "shorts";

export interface GeminiReelsInput {
  topic: string;
  niche: string;
  businessName: string;
  city: string;
  mainService: string;
  services?: string[];
  shortDescription?: string;
  targetAudience?: string;
  goals?: string[];
  tone?: string;
  differentiator?: string;
  customerPain?: string;
  platform?: VideoPlatform;
  angle?: string;
}

const NICHE_LABELS: Record<string, string> = {
  advogacia: "escritório de advocacia",
  barbearia: "barbearia",
  odontologia: "clínica odontológica",
  estetica: "estúdio de estética",
  psicologia: "psicóloga / clínica de psicologia",
  "personal-trainer": "personal trainer",
  mecanica: "oficina mecânica",
  contabilidade: "escritório de contabilidade",
  "clinica-medica": "clínica médica",
  otica: "ótica",
  "loja-roupa": "loja de roupas",
  imobiliaria: "imobiliária",
  restaurante: "restaurante",
  serralheria: "serralheria",
  "salao-beleza": "salão de beleza",
  "pet-shop": "pet shop / clínica veterinária",
  fisioterapia: "clínica de fisioterapia e pilates",
  nutricao: "consultório de nutrição",
  fotografia: "estúdio de fotografia e filmagem",
  construcao: "empresa de construção e reformas",
  confeitaria: "confeitaria artesanal",
  coaching: "coaching e mentoria",
  "escola-cursos": "escola / cursos e treinamentos",
  tatuagem: "estúdio de tatuagem e piercing",
  outro: "negócio local",
};

function buildPrompt(
  input: GeminiReelsInput,
  intent: string,
  tema: string,
): string {
  const nicheLabel = NICHE_LABELS[input.niche] ?? "negócio local";
  const servicesList = input.services?.slice(0, 5).join(", ") || input.mainService;
  const desc = input.shortDescription ? `\nDescrição do negócio: ${input.shortDescription}` : "";
  const audience = input.targetAudience ? `\nPúblico-alvo: ${input.targetAudience}` : "";
  const goalsLine = input.goals && input.goals.length > 0
    ? `\nObjetivos do negócio: ${input.goals.join(", ")}`
    : "";
  const platform = input.platform ?? "reels";

  const ANGLE_INSTRUCTIONS: Record<string, string> = {
    bastidores: "Ângulo escolhido: BASTIDORES — mostre o processo por dentro, o que o cliente nunca vê. Humanize o negócio.",
    "dor-cliente": "Ângulo escolhido: DOR DO CLIENTE — comece pela dor ou problema real que o público sente. Prenda quem está passando por isso.",
    revelar: "Ângulo escolhido: REVELAR — compartilhe um fato surpreendente, desmistifique um mito ou revele um segredo do nicho.",
    resultado: "Ângulo escolhido: RESULTADO/TRANSFORMAÇÃO — mostre o antes e depois, o resultado real que o cliente obtém.",
    urgencia: "Ângulo escolhido: URGÊNCIA — mostre as consequências de adiar. Por que agir agora é importante.",
    autoridade: "Ângulo escolhido: AUTORIDADE — posicione o negócio como referência. Experiência, diferenciais, conquistas.",
  };
  const angleInstruction = input.angle ? (ANGLE_INSTRUCTIONS[input.angle] ?? "") : "";

  const platformInstructions =
    platform === "shorts"
      ? `
Plataforma: YouTube Shorts
- CTA final: peça para se inscrever no canal, dar like ou comentar
- Tom levemente mais educativo/informativo que o Reels do Instagram
- O gancho dos primeiros 3 segundos é ainda mais crítico
- caption deve ser otimizada para YouTube (use hashtags como #shorts #negociolocal)
- cta: "Se inscreve no canal e salva esse vídeo"
- whatsapp_message: omita ou use "Olá! Vi o Shorts e quero saber mais sobre a ${input.businessName}."`
      : `
Plataforma: Instagram Reels
- CTA final: chame para WhatsApp ou link na bio
- Tom conversacional e direto
- caption otimizada para Instagram
- cta: "Chame no WhatsApp — link na bio"
- whatsapp_message: "Olá ${input.businessName}! Vi o Reels e quero saber mais."`;

  const TONE_MAP: Record<string, string> = {
    informal: "próximo e informal — fale como um amigo que entende do assunto, use linguagem do dia a dia",
    profissional: "profissional e sério — transmita credibilidade e expertise, linguagem cuidada",
    inspirador: "motivador e inspirador — emocione, use frases que tocam e que dão vontade de agir",
    direto: "direto ao ponto — objetivo, sem rodeios, foco total no resultado e na ação",
  };
  const audienceBlock = input.targetAudience
    ? `\nPÚBLICO-ALVO (descrito pelo dono — use como lente principal de tudo):\n"${input.targetAudience}"`
    : "";
  const painBlock = input.customerPain
    ? `\nMAIOR DOR DO CLIENTE (o momento que faz ele te buscar):\n"${input.customerPain}"`
    : "";
  const diffBlock = input.differentiator
    ? `\nDIFERENCIAL DO NEGÓCIO:\n"${input.differentiator}"`
    : "";
  const toneBlock = input.tone
    ? `\nTOM DE VOZ OBRIGATÓRIO: ${TONE_MAP[input.tone] ?? input.tone}`
    : "";
  const goalsBlock = input.goals && input.goals.length > 0
    ? `\nOBJETIVOS: ${input.goals.join(", ")}`
    : "";

  return `Você é um especialista em marketing de conteúdo para pequenos negócios locais no Brasil.

PERFIL DO NEGÓCIO
Nome: "${input.businessName}" — ${nicheLabel} em ${input.city}
Serviços: ${servicesList}${desc}${audienceBlock}${painBlock}${diffBlock}${toneBlock}${goalsBlock}

INSTRUÇÃO CENTRAL: Todo o roteiro deve ser escrito PARA o público-alvo acima, usando o tom de voz definido. Cada palavra das falas deve ressoar com a realidade, dor, desejo e linguagem DESSA pessoa específica. Se não há público-alvo descrito, deduza pelo nicho.

O dono do negócio quer falar sobre: "${input.topic}"
Intenção detectada: ${intent}
Assunto/tema interpretado: ${tema}
${angleInstruction ? `\n${angleInstruction}` : ""}
${platformInstructions}

Seu trabalho: criar um roteiro de vídeo vertical (9:16) que PARE o scroll da pessoa certa — o público-alvo descrito acima.
NUNCA repita literalmente o que o dono digitou. Use como SINAL DE INTENÇÃO, não como script.
${angleInstruction ? "Respeite o ângulo escolhido — ele define a estrutura narrativa." : ""}
O gancho (cena 1) deve ser uma situação, dor ou desejo que o PÚBLICO-ALVO reconhece imediatamente como sendo sobre ele.

Escreva um roteiro com EXATAMENTE este formato JSON (sem markdown, sem explicações, só o JSON):
{
  "title": "título descritivo do vídeo (máx 60 chars)",
  "gancho": "por que esse gancho para o scroll dessa pessoa específica — 1 frase",
  "duracaoTotal": "XX–YY segundos",
  "vibeEdicao": "instrução de edição e câmera — 1 linha objetiva",
  "musicaSugerida": "tipo de música sugerida — 1 linha",
  "scenes": [
    {
      "scene": 1,
      "duracao": "0–5s",
      "description": "instrução de câmera e postura para essa cena",
      "fala": "frase de abertura que PARA o scroll — fala da situação/dor/desejo do público-alvo, nunca anuncia o negócio",
      "textoNaTela": "texto sobreposto curto (máx 35 chars)"
    },
    {
      "scene": 2,
      "duracao": "6–25s",
      "description": "instrução de gravação",
      "fala": "aprofunda a dor ou desejo com detalhes específicos do nicho e desse público",
      "textoNaTela": "texto sobreposto curto"
    },
    {
      "scene": 3,
      "duracao": "26–38s",
      "description": "instrução de gravação",
      "fala": "virada: resultado real e concreto que essa pessoa específica obtém — não promessa genérica",
      "textoNaTela": "texto sobreposto curto"
    },
    {
      "scene": 4,
      "duracao": "39–45s",
      "description": "CTA — olhe para a câmera com confiança",
      "fala": "CTA natural e direto, voltado para o próximo passo que FAZ SENTIDO para esse público",
      "textoNaTela": "texto sobreposto do CTA"
    }
  ],
  "screen_text": "${input.businessName} — ${input.city}",
  "caption": "legenda completa (2–4 linhas naturais + emojis discretos + CTA) escrita para o público-alvo",
  "cta": "texto do CTA",
  "whatsapp_message": "mensagem de WhatsApp como se o público-alvo viesse do vídeo"
}

Regras obrigatórias:
- Cada fala deve soar como CONVERSA REAL com a pessoa do público-alvo, não anúncio
- Nunca comece com "Olá", "Passando para avisar", "Agenda aberta"
- Os primeiros 5 segundos falam da SITUAÇÃO DO PÚBLICO, não do negócio
- Use "você" — segunda pessoa direta
- Português brasileiro natural e coloquial
- Duração total: entre 30 e 50 segundos
- Textos na tela: curtos, legíveis, complementam a fala (nunca repetem)`;
}

async function callGemini(prompt: string, maxTokens = 1500): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.88,
            maxOutputTokens: maxTokens,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(18000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

export async function generateGeminiScript(input: GeminiReelsInput): Promise<ReelsScript | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const interpretation = interpretMagneticRequest({
    userInput: input.topic,
    businessName: input.businessName,
    niche: input.niche,
    city: input.city,
    mainService: input.mainService,
    services: input.services,
  });

  const prompt = buildPrompt(input, interpretation.intencaoUsuario, interpretation.temaInterpretado);
  const text = await callGemini(prompt, 1600);
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as ReelsScript;
    if (!parsed.scenes || !Array.isArray(parsed.scenes) || parsed.scenes.length < 3) return null;
    if (!parsed.title || !parsed.gancho) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Mantido para compatibilidade
export const generateGeminiReels = generateGeminiScript;

export async function generateGeminiHeadlines(input: GeminiReelsInput): Promise<string[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const nicheLabel = NICHE_LABELS[input.niche] ?? "negócio local";
  const servicesList = input.services?.slice(0, 5).join(", ") || input.mainService;
  const platform = input.platform ?? "reels";

  const interpretation = interpretMagneticRequest({
    userInput: input.topic,
    businessName: input.businessName,
    niche: input.niche,
    city: input.city,
    mainService: input.mainService,
    services: input.services,
  });

  const prompt = `Especialista em marketing de conteúdo para pequenos negócios locais no Brasil.

Negócio: ${input.businessName} — ${nicheLabel} em ${input.city}
Serviços: ${servicesList}
O dono digitou: "${input.topic}"
Intenção: ${interpretation.intencaoUsuario}
Tema interpretado: ${interpretation.temaInterpretado}
Plataforma: ${platform === "shorts" ? "YouTube Shorts" : "Instagram Reels"}

Gere 5 títulos/headlines para o vídeo. Máx 55 caracteres cada.
- Falam com o PÚBLICO (não com o dono)
- Não repetem o que o dono digitou
- Param o scroll com curiosidade, dor ou desejo
- Português brasileiro direto

Responda APENAS com JSON: {"headlines": ["h1", "h2", "h3", "h4", "h5"]}`;

  const text = await callGemini(prompt, 400);
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as { headlines: string[] };
    if (!Array.isArray(parsed.headlines) || parsed.headlines.length < 3) return null;
    return parsed.headlines;
  } catch {
    return null;
  }
}

export async function generateGeminiStory(input: GeminiReelsInput): Promise<StorySequence | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const nicheLabel = NICHE_LABELS[input.niche] ?? "negócio local";
  const servicesList = input.services?.slice(0, 5).join(", ") || input.mainService;
  const desc = input.shortDescription ? `\nDescrição: ${input.shortDescription}` : "";

  const interpretation = interpretMagneticRequest({
    userInput: input.topic,
    businessName: input.businessName,
    niche: input.niche,
    city: input.city,
    mainService: input.mainService,
    services: input.services,
  });

  const prompt = `Você é especialista em Instagram Stories para pequenos negócios locais no Brasil.

Negócio: "${input.businessName}" — ${nicheLabel} em ${input.city}
Serviços: ${servicesList}${desc}
O dono escreveu: "${input.topic}"
Intenção detectada: ${interpretation.intencaoUsuario}
Tema interpretado: ${interpretation.temaInterpretado}

Crie uma sequência de 5 stories para o Instagram. Cada story deve ser autossuficiente e também funcionar em sequência.

Tipos de story:
- "pergunta": slide de gancho que para o dedo (provoca ou gera curiosidade)
- "revelacao": conteúdo/resposta/dica de valor — o coração da sequência
- "prova": resultado, depoimento hipotético ou cenário real do nicho
- "cta": chamada pra ação clara e direta
- "caixinha": pergunta interativa pro público responder

Regras:
- NUNCA repita o que o dono escreveu
- Fale com o PÚBLICO, não com o dono
- Textos curtos (máx 3 linhas por slide — Stories tem espaço limitado)
- Português brasileiro direto e conversacional
- Use "você" para se dirigir ao público
- O "sticker" deve ser específico: "Caixinha de perguntas", "Enquete Sim/Não", "Quiz", "Link", "Contagem regressiva", ou "nenhum"
- O "background" deve ser uma cor/gradiente instagram-friendly: "roxo gradiente", "rosa para laranja", "azul escuro", "preto", "branco", "verde escuro", "creme"
- "emoji" opcional — 1 emoji que reforça o texto (ou omita)
- "subtext" é um complemento menor opcional debaixo do texto principal (máx 1 linha)

Responda APENAS com este JSON (sem markdown):
{
  "stories": [
    {
      "story": 1,
      "type": "pergunta",
      "text": "texto principal do slide — curto e impactante",
      "subtext": "linha complementar opcional",
      "background": "cor ou gradiente",
      "sticker": "tipo de sticker ou nenhum",
      "emoji": "emoji opcional"
    }
  ],
  "cta": "texto do botão/link de ação",
  "whatsapp_message": "mensagem sugerida para WhatsApp"
}`;

  const text = await callGemini(prompt, 900);
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as StorySequence;
    if (!Array.isArray(parsed.stories) || parsed.stories.length < 3) return null;
    if (!parsed.cta) return null;
    return parsed;
  } catch {
    return null;
  }
}
