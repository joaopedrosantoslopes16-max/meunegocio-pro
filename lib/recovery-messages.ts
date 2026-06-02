import { NICHE_CONFIG } from "./niche-config";
import type { RecoveryMessage } from "@/types";

interface RecoveryInput {
  business_name: string;
  niche: string;
  main_service: string;
  city: string;
}

function t(template: string, v: Record<string, string>): string {
  return Object.entries(v).reduce((s, [k, val]) => s.replaceAll(`[${k}]`, val), template);
}

export function generateRecoveryMessages(input: RecoveryInput): RecoveryMessage[] {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const v = {
    NOME: input.business_name,
    CIDADE: input.city,
    SERVICO: input.main_service,
    CTA: cfg.cta,
  };

  const templates: Omit<RecoveryMessage, "id">[] = [
    {
      situation: "Cliente antigo que sumiu",
      emoji: "💙",
      message: "Oi! Tudo bem? Faz um tempinho que você não aparece na [NOME]. Essa semana temos horários disponíveis para [SERVICO] em [CIDADE]. Posso ver um horário para você?",
    },
    {
      situation: "Cliente pediu preço e sumiu",
      emoji: "💬",
      message: "Oi! Vi que você tinha perguntado sobre [SERVICO] aqui na [NOME]. Ainda posso te ajudar? Posso te passar mais detalhes pelo WhatsApp.",
    },
    {
      situation: "Cliente que não responde",
      emoji: "📲",
      message: "Oi! Só passando pra saber se você ainda precisa do [SERVICO]. A [NOME] está em [CIDADE] e pode te ajudar. Quando quiser, é só chamar!",
    },
    {
      situation: "Cliente que faltou ao horário",
      emoji: "🗓️",
      message: "Oi! Vimos que você não conseguiu comparecer. Sem problema! Quando quiser remarcar o [SERVICO] na [NOME], é só me chamar aqui.",
    },
    {
      situation: "Cliente que comprou uma vez e não voltou",
      emoji: "🌟",
      message: "Oi! Tudo bem? Você veio na [NOME] uma vez e adoraria te ver novamente! Temos novidades e horários disponíveis para [SERVICO]. Vem?",
    },
    {
      situation: "Cliente que precisa agendar de novo",
      emoji: "⏰",
      message: "Oi! Seu [SERVICO] pode precisar de uma nova visita! A [NOME] está em [CIDADE] pronta para te atender. Que tal agendarmos?",
    },
    {
      situation: "Oferecer promoção para cliente antigo",
      emoji: "🔥",
      message: "Oi! Temos uma condição especial essa semana para clientes como você aqui na [NOME]. Que tal aproveitar para fazer o [SERVICO]? Chame aqui!",
    },
    {
      situation: "Pedir avaliação no Google",
      emoji: "⭐",
      message: "Oi! Obrigado por ter escolhido a [NOME] para o [SERVICO]. Se gostou do atendimento, sua avaliação no Google ajuda muito nosso trabalho. Pode deixar um comentário? 🙏",
    },
  ];

  return templates.map((tpl, i) => ({
    id: `recovery-${i}`,
    ...tpl,
    message: t(tpl.message, v),
  }));
}
