import { NICHE_CONFIG } from "./niche-config";
import type { TodayPost, TodayPostGoal, TemplateType } from "@/types";

interface TodayPostInput {
  business_name: string;
  niche: string;
  city: string;
  main_service: string;
}

export const TODAY_GOALS: { id: TodayPostGoal; label: string; emoji: string; description: string }[] = [
  { id: "vender", label: "Vender", emoji: "💰", description: "Post focado em converter em vendas" },
  { id: "dica", label: "Dar uma dica", emoji: "💡", description: "Post educativo com dica do nicho" },
  { id: "chamar_whatsapp", label: "Chamar no WhatsApp", emoji: "💬", description: "CTA direto para o WhatsApp" },
  { id: "promocao", label: "Divulgar promoção", emoji: "🔥", description: "Post de oferta ou desconto" },
  { id: "agenda_aberta", label: "Avisar agenda aberta", emoji: "📅", description: "Horários disponíveis" },
  { id: "pedir_avaliacao", label: "Pedir avaliação", emoji: "⭐", description: "Engajamento e reputação" },
  { id: "stories", label: "Movimentar stories", emoji: "📱", description: "Post para gerar interação" },
  { id: "recuperar_clientes", label: "Recuperar clientes", emoji: "🔁", description: "Reativar quem sumiu" },
];

type GoalTemplate = {
  post_title: string;
  post_subtitle: string;
  post_cta: string;
  template_type: TemplateType;
  caption: string;
  whatsapp_message: string;
};

function t(s: string, v: Record<string, string>): string {
  return Object.entries(v).reduce((acc, [k, val]) => acc.replaceAll(`[${k}]`, val), s);
}

export function generateTodayPost(goal: TodayPostGoal, input: TodayPostInput): TodayPost {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const v = {
    NOME: input.business_name,
    CIDADE: input.city,
    SERVICO: input.main_service,
    CTA: cfg.cta,
  };

  const templates: Record<TodayPostGoal, GoalTemplate> = {
    vender: {
      post_title: "[SERVICO]",
      post_subtitle: "Com qualidade e atenção em [CIDADE]",
      post_cta: "[CTA]",
      template_type: "main_service",
      caption: "Quer [SERVICO] de qualidade? A [NOME] está em [CIDADE] pronta para te atender. Chame no WhatsApp e agende agora! 👇",
      whatsapp_message: "Oi! Tudo bem? Aqui é da [NOME]. Estamos com [SERVICO] disponível em [CIDADE]. Posso te passar mais informações?",
    },
    dica: {
      post_title: "Dica importante!",
      post_subtitle: "[SERVICO] — o que você precisa saber",
      post_cta: "Salva esse post!",
      template_type: "authority",
      caption: "Dica importante sobre [SERVICO]: cuidar regularmente faz toda a diferença! A [NOME] em [CIDADE] está aqui para te ajudar. Salva esse post! 💡",
      whatsapp_message: "Oi! Você viu nossa dica de hoje sobre [SERVICO]? A [NOME] pode te ajudar com isso em [CIDADE]. Chama aqui!",
    },
    chamar_whatsapp: {
      post_title: "Chame no WhatsApp!",
      post_subtitle: "[NOME] em [CIDADE] — [SERVICO]",
      post_cta: "[CTA]",
      template_type: "whatsapp_cta",
      caption: "Quer resolver o [SERVICO] hoje? A [NOME] está em [CIDADE] esperando pela sua mensagem. Chame agora no WhatsApp! 💬👇",
      whatsapp_message: "Oi! Vi que você nos chamou. Como posso te ajudar com [SERVICO] aqui na [NOME] em [CIDADE]?",
    },
    promocao: {
      post_title: "Promoção de hoje!",
      post_subtitle: "[SERVICO] com condição especial na [NOME]",
      post_cta: "Aproveite agora!",
      template_type: "promotion",
      caption: "Hoje tem condição especial para [SERVICO] na [NOME] em [CIDADE]! Não perde — chama no WhatsApp agora! 🔥",
      whatsapp_message: "Oi! Hoje temos uma condição especial para [SERVICO] aqui na [NOME] em [CIDADE]. Quer saber mais?",
    },
    agenda_aberta: {
      post_title: "Agenda aberta!",
      post_subtitle: "Reserve seu horário na [NOME]",
      post_cta: "Agende agora",
      template_type: "whatsapp_cta",
      caption: "Nossa agenda está aberta! A [NOME] tem horários disponíveis para [SERVICO] em [CIDADE]. Chame no WhatsApp e reserve o seu! 📅",
      whatsapp_message: "Oi! Nossa agenda está aberta para [SERVICO] aqui na [NOME] em [CIDADE]. Quer que eu veja um horário para você?",
    },
    pedir_avaliacao: {
      post_title: "Sua avaliação vale muito!",
      post_subtitle: "[NOME] — atendendo com qualidade em [CIDADE]",
      post_cta: "Deixe sua avaliação",
      template_type: "authority",
      caption: "Se você já foi atendido na [NOME] e gostou do [SERVICO], sua avaliação no Google ajuda a gente a crescer em [CIDADE]. Obrigado! ⭐",
      whatsapp_message: "Oi! Obrigado por escolher a [NOME] para o [SERVICO]. Você conseguiria deixar uma avaliação no Google? Ajuda muito! 🙏",
    },
    stories: {
      post_title: "Veja nos stories!",
      post_subtitle: "Acompanhe a [NOME] no Instagram",
      post_cta: "Siga a gente!",
      template_type: "whatsapp_cta",
      caption: "Você acompanha nossa conta no Instagram? Postamos dicas, bastidores e promoções toda semana sobre [SERVICO] em [CIDADE]. Segue lá! 📱",
      whatsapp_message: "Oi! Você já segue a [NOME] no Instagram? Postamos conteúdo sobre [SERVICO] toda semana. Dá uma olhada!",
    },
    recuperar_clientes: {
      post_title: "Sentimos sua falta!",
      post_subtitle: "[NOME] te espera em [CIDADE]",
      post_cta: "Volte para cá!",
      template_type: "location",
      caption: "Faz tempo que você não aparece? A [NOME] está em [CIDADE] com novidades e horários disponíveis para [SERVICO]. Chame no WhatsApp! 💙",
      whatsapp_message: "Oi! Faz um tempinho que você não aparece na [NOME]. Essa semana temos horários para [SERVICO] em [CIDADE]. Que tal voltar?",
    },
  };

  const tpl = templates[goal];
  return {
    goal,
    post_title: t(tpl.post_title, v),
    post_subtitle: t(tpl.post_subtitle, v),
    post_cta: t(tpl.post_cta, v),
    template_type: tpl.template_type,
    caption: t(tpl.caption, v),
    whatsapp_message: t(tpl.whatsapp_message, v),
  };
}
