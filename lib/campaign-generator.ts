import { NICHE_CONFIG } from "./niche-config";
import type { Campaign } from "@/types";

interface CampaignInput {
  business_name: string;
  niche: string;
  city: string;
  main_service: string;
}

function t(template: string, v: Record<string, string>): string {
  return Object.entries(v).reduce((s, [k, val]) => s.replaceAll(`[${k}]`, val), template);
}

export function generateCampaigns(input: CampaignInput): Campaign[] {
  const cfg = NICHE_CONFIG[input.niche] ?? NICHE_CONFIG.outro;
  const v = {
    NOME: input.business_name,
    CIDADE: input.city,
    SERVICO: input.main_service,
    CTA: cfg.cta,
  };

  const templates: Omit<Campaign, "id">[] = [
    {
      name: "Promoção da semana",
      type: "promocao",
      emoji: "🔥",
      post_title: "Promoção da semana!",
      post_subtitle: "[SERVICO] com condição especial em [CIDADE]",
      caption: "Essa semana é especial na [NOME]! [SERVICO] com condição exclusiva em [CIDADE]. Não perde — chame agora no WhatsApp! 👇",
      whatsapp_message: "Oi! Tudo bem? Essa semana a [NOME] está com uma condição especial para [SERVICO] em [CIDADE]. Posso te passar mais detalhes?",
      cta: "[CTA]",
    },
    {
      name: "Agenda aberta",
      type: "chamada",
      emoji: "📅",
      post_title: "Agenda aberta!",
      post_subtitle: "Reserve seu horário na [NOME] em [CIDADE]",
      caption: "Boa notícia! A [NOME] está com horários disponíveis para [SERVICO] em [CIDADE]. Reserve o seu pelo WhatsApp! 📲",
      whatsapp_message: "Oi! Aqui é da [NOME]. Nossa agenda está aberta para [SERVICO] em [CIDADE]. Quer que eu veja um horário para você?",
      cta: "[CTA]",
    },
    {
      name: "Começo do mês",
      type: "relacionamento",
      emoji: "🗓️",
      post_title: "Novo mês, novos começos!",
      post_subtitle: "[NOME] com tudo para o seu [SERVICO]",
      caption: "Novo mês, nova chance de cuidar do que importa. A [NOME] está em [CIDADE] para te ajudar com [SERVICO]. [CTA]! 💪",
      whatsapp_message: "Oi! Começo de mês é perfeito para cuidar do [SERVICO]. A [NOME] está em [CIDADE]. Que tal agendar?",
      cta: "[CTA]",
    },
    {
      name: "Fim de semana",
      type: "chamada",
      emoji: "🌟",
      post_title: "Fim de semana especial!",
      post_subtitle: "[NOME] atendendo em [CIDADE]",
      caption: "O fim de semana ficou ainda melhor com [SERVICO] na [NOME] em [CIDADE]. Chame no WhatsApp e aproveite! 🎉",
      whatsapp_message: "Bom fim de semana! A [NOME] está atendendo em [CIDADE] para [SERVICO]. Que tal aproveitar?",
      cta: "[CTA]",
    },
    {
      name: "Semana fraca? Não mais!",
      type: "urgencia",
      emoji: "⚡",
      post_title: "Aproveite essa semana!",
      post_subtitle: "Condições especiais na [NOME] em [CIDADE]",
      caption: "Semana boa para resolver o [SERVICO] com a [NOME] em [CIDADE]. Condição especial disponível agora. Chame! ⚡",
      whatsapp_message: "Oi! Esta semana a [NOME] está com condições especiais para [SERVICO]. Posso te passar os detalhes?",
      cta: "[CTA]",
    },
    {
      name: "Pedido de avaliação",
      type: "relacionamento",
      emoji: "⭐",
      post_title: "Sua avaliação vale muito!",
      post_subtitle: "Ajude a [NOME] a crescer em [CIDADE]",
      caption: "Se você já foi atendido na [NOME] e gostou, sua avaliação no Google ajuda muita gente a nos encontrar em [CIDADE]. Obrigado! ⭐",
      whatsapp_message: "Olá! Obrigado por escolher a [NOME]. Se gostou do [SERVICO], sua avaliação no Google nos ajuda muito! Deixa um comentário? 🙏",
      cta: "Deixar avaliação",
    },
    {
      name: "Chamada para orçamento",
      type: "venda",
      emoji: "💰",
      post_title: "Orçamento grátis!",
      post_subtitle: "[SERVICO] sem compromisso com a [NOME]",
      caption: "Quer saber o valor do [SERVICO] na [NOME] em [CIDADE]? Solicite seu orçamento grátis pelo WhatsApp. Sem compromisso! 💬",
      whatsapp_message: "Oi! Posso te passar um orçamento para [SERVICO] aqui na [NOME] em [CIDADE]? É sem compromisso!",
      cta: "Pedir orçamento",
    },
    {
      name: "Recuperar clientes",
      type: "reativacao",
      emoji: "💙",
      post_title: "Sentimos sua falta!",
      post_subtitle: "[NOME] te espera em [CIDADE]",
      caption: "Faz tempo que você não aparece? A [NOME] está com novidades em [CIDADE] e gostaríamos de te ver por aqui. Chame no WhatsApp! 💙",
      whatsapp_message: "Oi! Tudo bem? Faz um tempinho que você não aparece na [NOME]. Essa semana temos horários para [SERVICO] em [CIDADE]. Quer voltar?",
      cta: "[CTA]",
    },
  ];

  return templates.map((tpl, i) => ({
    id: `campaign-${i}`,
    ...tpl,
    post_title: t(tpl.post_title, v),
    post_subtitle: t(tpl.post_subtitle, v),
    caption: t(tpl.caption, v),
    whatsapp_message: t(tpl.whatsapp_message, v),
    cta: t(tpl.cta, v),
  }));
}
