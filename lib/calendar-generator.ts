import { NICHE_CONFIG } from "./niche-config";
import type { CalendarEntry } from "@/types";

interface CalendarInput {
  niche: string;
  business_name: string;
  city: string;
  main_service: string;
}

type WeekSlot = {
  day: "Segunda" | "Quarta" | "Sexta";
  topicKey: keyof typeof NICHE_CONFIG[string]["calendarTopics"];
  post_type: string;
  template_type: CalendarEntry["template_type"];
};

const WEEK_STRUCTURE: WeekSlot[] = [
  // Semana 1
  { day: "Segunda", topicKey: "dica", post_type: "Dica", template_type: "authority" },
  { day: "Quarta", topicKey: "servico", post_type: "Serviço", template_type: "main_service" },
  { day: "Sexta", topicKey: "chamada", post_type: "Chamada", template_type: "whatsapp_cta" },
  // Semana 2
  { day: "Segunda", topicKey: "educativo", post_type: "Educativo", template_type: "authority" },
  { day: "Quarta", topicKey: "promocao", post_type: "Promoção", template_type: "promotion" },
  { day: "Sexta", topicKey: "relacionamento", post_type: "Relacionamento", template_type: "location" },
  // Semana 3
  { day: "Segunda", topicKey: "autoridade", post_type: "Autoridade", template_type: "authority" },
  { day: "Quarta", topicKey: "bastidores", post_type: "Bastidores", template_type: "main_service" },
  { day: "Sexta", topicKey: "oferta", post_type: "Oferta", template_type: "promotion" },
  // Semana 4
  { day: "Segunda", topicKey: "lembrete", post_type: "Lembrete", template_type: "whatsapp_cta" },
  { day: "Quarta", topicKey: "prova", post_type: "Prova social", template_type: "authority" },
  { day: "Sexta", topicKey: "chamadaFinal", post_type: "Chamada final", template_type: "whatsapp_cta" },
];

export function generateCalendar(input: CalendarInput): CalendarEntry[] {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const topics = cfg.calendarTopics;

  return WEEK_STRUCTURE.map((slot, i) => ({
    week: Math.floor(i / 3) + 1,
    day: slot.day,
    post_type: slot.post_type,
    topic: topics[slot.topicKey] ?? slot.topicKey,
    template_type: slot.template_type,
    caption_snippet: buildSnippet(slot.topicKey, input, cfg.cta),
  }));
}

function buildSnippet(
  key: string,
  input: CalendarInput,
  cta: string
): string {
  const base: Record<string, string> = {
    dica: `Dica importante para quem busca ${input.main_service} em ${input.city}. Salva esse post!`,
    servico: `${input.business_name} oferece ${input.main_service} com qualidade em ${input.city}. ${cta}!`,
    chamada: `Agenda aberta! A ${input.business_name} está pronta para te atender em ${input.city}. Chame no WhatsApp 👇`,
    educativo: `Você sabia disso sobre ${input.main_service}? A ${input.business_name} explica. Salva!`,
    promocao: `Condição especial essa semana na ${input.business_name} em ${input.city}. ${cta}!`,
    relacionamento: `Obrigado por confiar na ${input.business_name}. Estamos aqui para você em ${input.city}! 💙`,
    autoridade: `Por que escolher a ${input.business_name} para ${input.main_service}? Qualidade e dedicação em ${input.city}.`,
    bastidores: `Nos bastidores da ${input.business_name}. Veja como cuidamos de cada detalhe!`,
    oferta: `Oferta especial: ${input.main_service} com condições especiais na ${input.business_name}. ${cta}!`,
    lembrete: `Lembrete importante! A ${input.business_name} está em ${input.city} para te atender. ${cta}!`,
    prova: `Qualidade comprovada. A ${input.business_name} cuida de cada cliente com dedicação em ${input.city}.`,
    chamadaFinal: `Últimos horários da semana! ${input.business_name} em ${input.city}. ${cta} agora!`,
  };
  return base[key] ?? `${input.business_name} — ${input.main_service} em ${input.city}. ${cta}!`;
}
