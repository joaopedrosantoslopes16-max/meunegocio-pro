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
  platform?: VideoPlatform;
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
  const platform = input.platform ?? "reels";

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

  return `Você é um especialista em marketing de conteúdo para pequenos negócios locais no Brasil.

Negócio: "${input.businessName}" — ${nicheLabel} em ${input.city}
Serviços: ${servicesList}${desc}

O dono do negócio escreveu: "${input.topic}"
Intenção detectada: ${intent}
Assunto/tema interpretado: ${tema}
${platformInstructions}

Seu trabalho: transformar o que o dono escreveu em um roteiro de vídeo vertical (9:16) de alta qualidade.
NUNCA repita literalmente o que o dono digitou. Use o que ele escreveu apenas como SINAL DE INTENÇÃO.
O roteiro deve falar com o PÚBLICO-ALVO (possíveis clientes), baseado no nicho e no que eles sentem, querem ou temem.

Escreva um roteiro com EXATAMENTE este formato JSON (sem markdown, sem explicações, só o JSON):
{
  "title": "título descritivo do vídeo (máx 60 chars)",
  "gancho": "por que esse gancho funciona para parar o scroll — 1 frase",
  "duracaoTotal": "XX–YY segundos",
  "vibeEdicao": "instrução de edição e câmera — 1 linha objetiva",
  "musicaSugerida": "tipo de música sugerida — 1 linha",
  "scenes": [
    {
      "scene": 1,
      "duracao": "0–5s",
      "description": "instrução de câmera e postura para essa cena",
      "fala": "frase de abertura que PARA o scroll — fala sobre a situação do público, nunca anuncia o negócio",
      "textoNaTela": "texto sobreposto curto (máx 35 chars)"
    },
    {
      "scene": 2,
      "duracao": "6–25s",
      "description": "instrução de gravação",
      "fala": "desenvolvimento: aprofunda a dor, o cenário ou o desejo do público com detalhes do nicho",
      "textoNaTela": "texto sobreposto curto"
    },
    {
      "scene": 3,
      "duracao": "26–38s",
      "description": "instrução de gravação",
      "fala": "virada: o que muda com o profissional certo — resultado real, não promessa vaga",
      "textoNaTela": "texto sobreposto curto"
    },
    {
      "scene": 4,
      "duracao": "39–45s",
      "description": "CTA — olhe para a câmera com confiança",
      "fala": "CTA natural e direto — sem robotizar",
      "textoNaTela": "texto sobreposto do CTA"
    }
  ],
  "screen_text": "${input.businessName} — ${input.city}",
  "caption": "legenda completa para o post (2–4 linhas naturais + emojis discretos + CTA)",
  "cta": "texto do CTA",
  "whatsapp_message": "mensagem de WhatsApp sugerida"
}

Regras obrigatórias:
- Cada fala deve soar como CONVERSA REAL, não anúncio
- Nunca comece com "Olá", "Passando para avisar", "Agenda aberta" ou frases de anúncio
- Fale da situação, dor ou desejo do PÚBLICO nos primeiros 5 segundos
- Use "você" — segunda pessoa direta
- Português brasileiro natural, coloquial sem ser informal demais
- Duração total: entre 30 e 50 segundos
- Os textos na tela devem ser curtos, legíveis e complementar a fala (não repetir)`;
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
