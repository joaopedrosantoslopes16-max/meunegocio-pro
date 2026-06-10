import type {
  PremiumCarousel,
  PremiumCarouselSlide,
  CarouselLayout,
  CarouselObjective,
  CarouselVisualStyle,
} from "@/types";

export interface CarouselInput {
  topic: string;
  objective: CarouselObjective;
  niche: string;
  businessName: string;
  city: string;
  mainService: string;
  whatsapp: string;
  selectedImages: string[];
  /** Per-slide image map: key = slide index (0-based), value = image URL */
  slideImagesMap?: Record<number, string>;
  visualStyle: CarouselVisualStyle;
  format: "4/5" | "1/1" | "9/16";
  /** Number of slides to generate (4–8, default 6) */
  slideCount?: number;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function variationIndex(seed: string, count: number): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h) ^ seed.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h) % count;
}

// ─── Assigns images to slides ─────────────────────────────────
function assignImages(
  images: string[],
  count: number,
  map?: Record<number, string>
): (string | undefined)[] {
  const result: (string | undefined)[] = Array(count).fill(undefined);
  // Per-slide map takes priority
  if (map && Object.keys(map).length > 0) {
    Object.entries(map).forEach(([k, v]) => {
      const idx = parseInt(k);
      if (idx < count && v) result[idx] = v;
    });
    return result;
  }
  if (!images.length) return result;
  // Auto-distribute: cover + middle slides get images; last (CTA) never
  const slots = Array.from({ length: count - 1 }, (_, i) => i);
  slots.forEach((slot, i) => { result[slot] = images[i % images.length]; });
  return result;
}

// ─── Layout sequence per style ───────────────────────────────
const CONTENT_LAYOUTS_WITH_IMAGES: Record<CarouselVisualStyle, CarouselLayout[]> = {
  moderno:     ["bold_statement", "content_list", "split_image",   "image_overlay", "card_glass",   "bold_statement"],
  premium:     ["card_glass",     "bold_statement","content_list", "split_image",   "card_glass",   "image_overlay"],
  clean:       ["content_list",   "bold_statement","content_list", "image_overlay", "content_list", "split_image"],
  chamativo:   ["bold_statement", "image_overlay", "content_list", "bold_statement","split_image",  "image_overlay"],
  elegante:    ["card_glass",     "content_list",  "split_image",  "card_glass",    "content_list", "bold_statement"],
  minimalista: ["content_list",   "bold_statement","content_list", "image_overlay", "content_list", "bold_statement"],
};

const CONTENT_LAYOUTS_NO_IMAGES: Record<CarouselVisualStyle, CarouselLayout[]> = {
  moderno:     ["bold_statement", "content_list", "bold_statement","content_list", "bold_statement","content_list"],
  premium:     ["bold_statement", "content_list", "bold_statement","content_list", "bold_statement","content_list"],
  clean:       ["content_list",   "bold_statement","content_list", "bold_statement","content_list", "bold_statement"],
  chamativo:   ["bold_statement", "content_list", "bold_statement","content_list", "bold_statement","content_list"],
  elegante:    ["bold_statement", "content_list", "bold_statement","content_list", "bold_statement","content_list"],
  minimalista: ["content_list",   "bold_statement","content_list", "bold_statement","content_list", "bold_statement"],
};

function layoutsForStyle(style: CarouselVisualStyle, hasImages: boolean, count: number): CarouselLayout[] {
  const pool = hasImages ? CONTENT_LAYOUTS_WITH_IMAGES[style] : CONTENT_LAYOUTS_NO_IMAGES[style];
  const layouts: CarouselLayout[] = ["cover_hero"];
  const contentCount = count - 2;
  for (let i = 0; i < contentCount; i++) {
    layouts.push(pool[i % pool.length]);
  }
  layouts.push("cta_final");
  return layouts;
}

// ─── Build slide array with correct count ─────────────────────
function buildSlideTemplates(templates: SlideTemplate[], targetCount: number): SlideTemplate[] {
  if (templates.length === 0) return templates;
  const cover = templates[0];
  const cta = templates[templates.length - 1];
  const pool = templates.slice(1, -1);
  if (pool.length === 0) return templates;
  const contentCount = Math.max(0, targetCount - 2);
  const contents: SlideTemplate[] = [];
  for (let i = 0; i < contentCount; i++) {
    contents.push(pool[i % pool.length]);
  }
  return [cover, ...contents, cta];
}

// ─── BG variant per layout position ──────────────────────────
function bgForLayout(layout: CarouselLayout, index: number): "primary" | "dark" | "white" | "accent" {
  if (layout === "cover_hero")   return "primary";
  if (layout === "cta_final")    return "dark";
  if (layout === "bold_statement") return index % 2 === 0 ? "dark" : "primary";
  if (layout === "content_list") return index % 2 === 0 ? "white" : "accent";
  if (layout === "split_image")  return "white";
  if (layout === "card_glass")   return "primary";
  if (layout === "image_overlay")return "primary";
  return "white";
}

// ─── Slide content by niche × objective ──────────────────────
interface SlideTemplate {
  badge?: string;
  title: string;
  subtitle?: string;
  body?: string;
  cta?: string;
  listItems?: string[];
}

type NicheKey = "barbearia" | "odontologia" | "personal-trainer" | "restaurante" |
                "estetica" | "loja-roupa" | "mecanica" | "imobiliaria" |
                "clinica-medica" | "outro";

function nicheKey(niche: string): NicheKey {
  const n = niche.toLowerCase();
  if (n.includes("barb")) return "barbearia";
  if (n.includes("odonto") || n.includes("dent")) return "odontologia";
  if (n.includes("personal") || n.includes("academia")) return "personal-trainer";
  if (n.includes("restaur") || n.includes("lanche") || n.includes("comida")) return "restaurante";
  if (n.includes("estet") || n.includes("beleza") || n.includes("cabeleir")) return "estetica";
  if (n.includes("loja") || n.includes("moda") || n.includes("roupa")) return "loja-roupa";
  if (n.includes("mecani") || n.includes("autom")) return "mecanica";
  if (n.includes("imobil") || n.includes("corretor")) return "imobiliaria";
  if (n.includes("clínica") || n.includes("clinica") || n.includes("médic") || n.includes("medic")) return "clinica-medica";
  return "outro";
}

function getSlideTemplates(
  niche: NicheKey,
  objective: CarouselObjective,
  subject: string,
  businessName: string,
  city: string,
  mainService: string,
  whatsapp: string
): SlideTemplate[] {
  const B = businessName;
  const C = city;
  const S = subject || mainService;
  const W = whatsapp;

  // CTA text by objective
  const ctaTexts: Record<CarouselObjective, string> = {
    vender:    "Chame no WhatsApp e solicite agora",
    educar:    "Chame no WhatsApp para saber mais",
    promocao:  "Aproveite — chame no WhatsApp agora",
    servico:   "Chame no WhatsApp e agende",
    autoridade:"Fale com a gente pelo WhatsApp",
    whatsapp:  "Chame agora no WhatsApp",
    recuperar: "A gente te espera — chame no WhatsApp",
    novidade:  "Fique por dentro — chame no WhatsApp",
    duvidas:   "Ficou com dúvida? Chame no WhatsApp",
  };

  const ctaFinal = ctaTexts[objective];

  type NicheTemplates = Partial<Record<CarouselObjective | "default", SlideTemplate[]>>;
  const templatesByNiche: Record<NicheKey, NicheTemplates> = {
    barbearia: {
      vender: [
        { badge: "VISUAL", title: "Seu visual fala antes de você", subtitle: "Cuide do que as pessoas veem primeiro." },
        { badge: "01", title: "Um corte certo muda tudo", body: "Não é só estética. É confiança. É presença. É como você se apresenta para o mundo a cada dia." },
        { badge: "02", title: "O que a gente faz por você", listItems: ["Corte masculino", "Barba na navalha", "Acabamento preciso", "Atendimento sem enrolação"] },
        { badge: "03", title: "Estilo que combina com você", body: `Em ${C}, você encontra cortes modernos e personalizados na ${B}. Agende pelo WhatsApp.` },
        { badge: "04", title: "Resultado que você vê no espelho", body: "Cuidado com os detalhes, respeito pelo seu tempo e um corte que dura." },
        { badge: "CTA", title: "Agende agora pelo WhatsApp", cta: ctaFinal },
      ],
      promocao: [
        { badge: "OFERTA", title: "Semana de preço especial na barbearia", subtitle: "Corte + barba com condição exclusiva." },
        { badge: "01", title: "Aproveite enquanto dura", body: "Promoção válida essa semana. Atendimento com hora marcada para você." },
        { badge: "02", title: "O que está incluído", listItems: ["Corte masculino", "Barba completa", "Produto pós-barba", "Horário garantido"] },
        { badge: "03", title: "Agenda limitada", body: "Os horários estão preenchendo rápido. Reserve o seu antes que acabe." },
        { badge: "04", title: "É só chamar no WhatsApp", body: `Manda uma mensagem pra ${B} e garante seu horário agora.` },
        { badge: "CTA", title: "Garantir meu horário agora", cta: ctaFinal },
      ],
      default: [
        { badge: "BARBEARIA", title: "Corte e barba de verdade", subtitle: `${B} — ${C}` },
        { badge: "01", title: `Serviços na ${B}`, listItems: ["Corte masculino", "Barba", "Acabamento", "Navalha"] },
        { badge: "02", title: "Cuidado de verdade", body: "Cada cliente é atendido com atenção, técnica e respeito pelo seu estilo." },
        { badge: "03", title: `Localização: ${C}`, body: "Fácil de chegar, fácil de agendar. Atendimento com hora marcada pelo WhatsApp." },
        { badge: "04", title: "Confira o resultado", body: "Clientes que chegam de novo e indicam para os amigos." },
        { badge: "CTA", title: "Agende seu horário agora", cta: ctaFinal },
      ],
    },
    odontologia: {
      educar: [
        { badge: "SAÚDE", title: "Seu sorriso conta uma história", subtitle: "E você merece que ela seja bonita." },
        { badge: "01", title: "Por que cuidar da saúde bucal agora?", body: "Problemas que não doem hoje podem virar tratamentos caros amanhã. Prevenção é o melhor caminho." },
        { badge: "02", title: "3 hábitos que fazem diferença", listItems: ["Escovar 3× ao dia com técnica correta", "Usar fio dental todos os dias", "Consulta a cada 6 meses"] },
        { badge: "03", title: "O que avaliamos na consulta", body: "Gengiva, esmalte, mordida, desgastes — tudo é observado para garantir sua saúde a longo prazo." },
        { badge: "04", title: "Prevenção é tratamento também", body: `Na ${B} em ${C}, cada consulta é um investimento no seu sorriso.` },
        { badge: "CTA", title: "Agende sua avaliação", cta: ctaFinal },
      ],
      vender: [
        { badge: "SORRISO", title: "Um sorriso bonito começa com uma avaliação", subtitle: "Primeira consulta com análise completa." },
        { badge: "01", title: "Você já pensou no seu sorriso?", body: "Clarear, alinhar, corrigir ou só manter saudável — tudo começa com saber onde você está." },
        { badge: "02", title: "O que oferecemos", listItems: ["Clareamento dental", "Ortodontia", "Implantes", "Limpeza e prevenção"] },
        { badge: "03", title: "Resultado que você vê e sente", body: `Atendimento humanizado, tecnologia atual e cuidado real com cada paciente da ${B}.` },
        { badge: "04", title: "Sem enrolação, com cuidado", body: `Em ${C}, você agenda direto pelo WhatsApp e já garante seu horário.` },
        { badge: "CTA", title: "Agendar avaliação gratuita", cta: ctaFinal },
      ],
      default: [
        { badge: "ODONTO", title: "Cuidado com seu sorriso", subtitle: `${B} — ${C}` },
        { badge: "01", title: "Nossos serviços", listItems: ["Limpeza", "Clareamento", "Ortodontia", "Implantes"] },
        { badge: "02", title: "Saúde bucal em dia", body: "Consultas preventivas salvam seu sorriso e seu bolso a longo prazo." },
        { badge: "03", title: "Atendimento humanizado", body: "Cada paciente é tratado com atenção e cuidado individualizado." },
        { badge: "04", title: `Localizado em ${C}`, body: "Agendamento fácil pelo WhatsApp. Horários flexíveis para sua rotina." },
        { badge: "CTA", title: "Agende sua consulta", cta: ctaFinal },
      ],
    },
    "personal-trainer": {
      vender: [
        { badge: "TREINO", title: "Resultados reais precisam de método", subtitle: "Não de sorte, não de improviso." },
        { badge: "01", title: "Por que treinar com acompanhamento?", body: "Treino sem orientação é tempo perdido. Com método certo, cada semana conta." },
        { badge: "02", title: "O que você vai ter", listItems: ["Planilha personalizada", "Acompanhamento semanal", "Ajustes conforme evolução", "Suporte via WhatsApp"] },
        { badge: "03", title: "Sem achismo, com ciência", body: `Na ${B}, cada treino é montado para o seu corpo, seus objetivos e sua rotina.` },
        { badge: "04", title: "Resultados consistentes", body: "Quem segue o método evolui. Simples assim." },
        { badge: "CTA", title: "Começar agora", cta: ctaFinal },
      ],
      default: [
        { badge: "FITNESS", title: "Transforme sua rotina de treino", subtitle: `${B} — ${C}` },
        { badge: "01", title: "Personal training personalizado", listItems: ["Avaliação física inicial", "Treino sob medida", "Acompanhamento contínuo", "Resultados mensuráveis"] },
        { badge: "02", title: "Seu objetivo, nosso método", body: "Emagrecer, ganhar massa, melhorar performance — cada meta tem um caminho." },
        { badge: "03", title: "Treino onde você preferir", body: "Academia, ar livre ou online. A orientação vai com você." },
        { badge: "04", title: `Personal em ${C}`, body: "Agende uma avaliação gratuita e veja como podemos trabalhar juntos." },
        { badge: "CTA", title: "Agendar avaliação", cta: ctaFinal },
      ],
    },
    restaurante: {
      vender: [
        { badge: "HOJE", title: "Uma refeição que vale a visita", subtitle: "Comida boa, ambiente gostoso, sem complicação." },
        { badge: "01", title: "O que tem no prato hoje", body: "Ingredientes frescos, receitas que fazem você voltar e um cardápio pensado com cuidado." },
        { badge: "02", title: "Destaques do cardápio", listItems: [mainService, "Pratos executivos", "Sobremesas da casa", "Opções para entrega"] },
        { badge: "03", title: "Peça pelo WhatsApp", body: "Delivery ou reserva de mesa — tudo direto pelo WhatsApp, sem complicação." },
        { badge: "04", title: `O melhor da cozinha em ${C}`, body: `${B} — onde cada prato é feito com capricho.` },
        { badge: "CTA", title: "Fazer pedido agora", cta: ctaFinal },
      ],
      default: [
        { badge: "CARDÁPIO", title: "Venha experimentar", subtitle: `${B} — ${C}` },
        { badge: "01", title: "Destaques de hoje", listItems: [mainService, "Pratos especiais", "Sobremesas", "Bebidas"] },
        { badge: "02", title: "Feito com cuidado", body: "Ingredientes selecionados e receitas tradicionais que conquistam." },
        { badge: "03", title: "Entrega e salão", body: "Peça pelo WhatsApp ou venha visitar o salão. Atendimento rápido e gostoso." },
        { badge: "04", title: `Em ${C}`, body: "Funcionamos todos os dias. Consulte horários pelo WhatsApp." },
        { badge: "CTA", title: "Pedir agora", cta: ctaFinal },
      ],
    },
    estetica: {
      vender: [
        { badge: "BELEZA", title: "Cuidado que você sente na pele", subtitle: "Procedimentos que entregam resultado." },
        { badge: "01", title: "Você merece esse cuidado", body: "Rotina corrida demais? Um horário reservado só para você faz toda a diferença." },
        { badge: "02", title: "Nossos tratamentos", listItems: [mainService, "Skincare personalizado", "Procedimentos faciais", "Relaxamento"] },
        { badge: "03", title: "Resultado visível", body: `${B} usa técnicas e produtos selecionados para entregar o melhor resultado para você.` },
        { badge: "04", title: `Estética em ${C}`, body: "Agende pelo WhatsApp. Horários disponíveis essa semana." },
        { badge: "CTA", title: "Agendar horário", cta: ctaFinal },
      ],
      default: [
        { badge: "ESTÉTICA", title: "Cuide de você", subtitle: `${B} — ${C}` },
        { badge: "01", title: "Tratamentos disponíveis", listItems: [mainService, "Faciais", "Corporais", "Relaxantes"] },
        { badge: "02", title: "Profissional qualificada", body: "Atendimento especializado, ambiente acolhedor e técnicas atualizadas." },
        { badge: "03", title: "Resultado que você vê", body: "Cada tratamento é planejado para você alcançar o resultado que deseja." },
        { badge: "04", title: `Localizada em ${C}`, body: "Agende pelo WhatsApp e garante seu horário essa semana." },
        { badge: "CTA", title: "Agendar agora", cta: ctaFinal },
      ],
    },
    "loja-roupa": {
      vender: [
        { badge: "NOVIDADE", title: "Peças que acabaram de chegar", subtitle: "Escolhas feitas para facilitar o seu estilo." },
        { badge: "01", title: "O que chegou essa semana", body: "Peças novas com estilo, qualidade e opções para montar looks completos." },
        { badge: "02", title: "Por que comprar aqui", listItems: ["Qualidade real", "Tamanhos variados", "Entrega rápida", "Fotos reais sem filtro"] },
        { badge: "03", title: "Monte seu look", body: "Combine as peças, peça sugestões pelo WhatsApp e receba em casa." },
        { badge: "04", title: "Atendimento pelo WhatsApp", body: `Tire dúvidas, veja disponibilidade e faça seu pedido direto com ${B}.` },
        { badge: "CTA", title: "Ver peças disponíveis", cta: ctaFinal },
      ],
      default: [
        { badge: "MODA", title: "Estilo do seu jeito", subtitle: `${B} — ${C}` },
        { badge: "01", title: "O que você encontra aqui", listItems: ["Roupas femininas", "Looks completos", "Tamanhos especiais", "Novidades semanais"] },
        { badge: "02", title: "Qualidade que você vê", body: "Peças selecionadas com cuidado para entregar moda acessível e real." },
        { badge: "03", title: "Atendimento pelo WhatsApp", body: "Fotos reais, preços diretos e entrega para sua casa." },
        { badge: "04", title: "Loja online", body: `Chame no WhatsApp da ${B} e veja as opções disponíveis hoje.` },
        { badge: "CTA", title: "Ver peças agora", cta: ctaFinal },
      ],
    },
    mecanica: {
      vender: [
        { badge: "AUTO", title: "Seu carro merece cuidado de verdade", subtitle: "Diagnóstico preciso. Serviço honesto." },
        { badge: "01", title: "O que pode estar errado no seu carro?", body: "Barulho estranho, luz acesa no painel, freio mole — cada sinal merece atenção antes de virar problema maior." },
        { badge: "02", title: "Serviços que fazemos", listItems: ["Revisão geral", "Freios e suspensão", "Troca de óleo", "Diagnóstico eletrônico"] },
        { badge: "03", title: "Orçamento sem surpresa", body: "A gente mostra o que precisa antes de fazer. Sem custo oculto, sem enrolação." },
        { badge: "04", title: `Mecânica em ${C}`, body: `${B} — anos de experiência cuidando do seu veículo.` },
        { badge: "CTA", title: "Pedir orçamento agora", cta: ctaFinal },
      ],
      default: [
        { badge: "MECÂNICA", title: "Cuidado com seu veículo", subtitle: `${B} — ${C}` },
        { badge: "01", title: "Nossos serviços", listItems: ["Revisão completa", "Troca de óleo", "Freios", "Suspensão"] },
        { badge: "02", title: "Diagnóstico honesto", body: "Você sabe o que está sendo feito no seu carro antes de aprovar qualquer serviço." },
        { badge: "03", title: "Orçamento rápido", body: "Manda foto ou descreve o problema pelo WhatsApp e recebe orçamento em minutos." },
        { badge: "04", title: `Em ${C}`, body: "Atendemos com hora marcada e sem enrolação. Seu carro pronto no prazo." },
        { badge: "CTA", title: "Pedir orçamento", cta: ctaFinal },
      ],
    },
    imobiliaria: {
      vender: [
        { badge: "IMÓVEL", title: "Seu próximo endereço começa aqui", subtitle: "Comprar, vender ou alugar com quem conhece o mercado." },
        { badge: "01", title: "O que você está procurando?", body: "Apartamento, casa ou comercial — a gente tem opções e conhece o que está disponível na região." },
        { badge: "02", title: "Por que contar com um corretor?", listItems: ["Acesso a imóveis exclusivos", "Negociação especializada", "Documentação sem erro", "Processo seguro"] },
        { badge: "03", title: "Encontramos o imóvel certo", body: `${B} em ${C} — anos de mercado e carteira qualificada de imóveis.` },
        { badge: "04", title: "Primeira conversa sem compromisso", body: "Chame no WhatsApp, conta o que você precisa e a gente te apresenta as melhores opções." },
        { badge: "CTA", title: "Falar com corretor agora", cta: ctaFinal },
      ],
      default: [
        { badge: "IMÓVEL", title: "Realize seu sonho", subtitle: `${B} — ${C}` },
        { badge: "01", title: "Especialidades", listItems: ["Compra e venda", "Locação", "Imóveis comerciais", "Consultoria"] },
        { badge: "02", title: "Atendimento personalizado", body: "Cada cliente tem necessidades únicas. Encontramos o imóvel certo para você." },
        { badge: "03", title: "Mercado local", body: `Conhecemos ${C} profundamente — bairros, preços, tendências.` },
        { badge: "04", title: "Negociação sem estresse", body: "Cuidamos de toda a documentação e tratativas para você." },
        { badge: "CTA", title: "Conversar com especialista", cta: ctaFinal },
      ],
    },
    "clinica-medica": {
      educar: [
        { badge: "SAÚDE", title: "Informação é o primeiro cuidado", subtitle: "Conteúdo de saúde com responsabilidade." },
        { badge: "01", title: "Prevenção vale mais que tratamento", body: "Consultas periódicas identificam problemas cedo, quando o tratamento é mais simples e acessível." },
        { badge: "02", title: "Hábitos que protegem sua saúde", listItems: ["Consultas preventivas anuais", "Exames em dia", "Sono regular", "Alimentação equilibrada"] },
        { badge: "03", title: "Quando procurar o médico?", body: "Sintomas persistentes, mesmo leves, merecem atenção. Não espere o problema se agravar." },
        { badge: "04", title: `Atendimento em ${C}`, body: `${B} — cuidado médico humanizado e responsável.` },
        { badge: "CTA", title: "Agendar consulta", cta: ctaFinal },
      ],
      default: [
        { badge: "SAÚDE", title: "Cuide da sua saúde", subtitle: `${B} — ${C}` },
        { badge: "01", title: "Especialidades", listItems: [mainService, "Consultas preventivas", "Exames", "Orientação médica"] },
        { badge: "02", title: "Atendimento humanizado", body: "Cada paciente é ouvido com atenção. Diagnóstico responsável e transparente." },
        { badge: "03", title: "Prevenção primeiro", body: "Manter a saúde em dia evita complicações maiores. Consultas regulares fazem diferença." },
        { badge: "04", title: `Localizado em ${C}`, body: "Agende sua consulta pelo WhatsApp. Horários disponíveis essa semana." },
        { badge: "CTA", title: "Agendar consulta", cta: ctaFinal },
      ],
    },
    outro: {
      vender: [
        { badge: "DESTAQUE", title: `${S || mainService}`, subtitle: `${B} — ${C}` },
        { badge: "01", title: "O que fazemos por você", body: `Na ${B}, cada cliente recebe atenção personalizada e resultado de qualidade.` },
        { badge: "02", title: "Por que escolher a gente", listItems: ["Atendimento ágil", "Qualidade comprovada", "Preço justo", "Suporte pelo WhatsApp"] },
        { badge: "03", title: "Como funciona", body: "Chame no WhatsApp, conta o que você precisa e recebe atendimento rápido." },
        { badge: "04", title: `Em ${C}`, body: "Presença local, atendimento humano. Sua satisfação é nossa prioridade." },
        { badge: "CTA", title: "Entrar em contato agora", cta: ctaFinal },
      ],
      default: [
        { badge: "SERVIÇO", title: S || mainService, subtitle: `${B} — ${C}` },
        { badge: "01", title: "Nossos serviços", listItems: [mainService, "Atendimento personalizado", "Orçamento rápido", "Resultado garantido"] },
        { badge: "02", title: "Qualidade em cada detalhe", body: `${B} se dedica a entregar o melhor resultado para cada cliente.` },
        { badge: "03", title: "Atendimento ágil", body: "Chame no WhatsApp para orçamento, dúvidas ou agendamento." },
        { badge: "04", title: `Localizado em ${C}`, body: "Atendemos com compromisso e seriedade. Veja nosso trabalho." },
        { badge: "CTA", title: "Falar agora", cta: ctaFinal },
      ],
    },
  };

  const nicheTemplates = templatesByNiche[niche];
  const templates = nicheTemplates[objective] ?? nicheTemplates["vender"] ?? nicheTemplates["default"] ?? templatesByNiche.outro["default"]!;
  return templates;
}

// ─── Content interpretation ──────────────────────────────────

const META_PREFIXES: RegExp[] = [
  // "quero criar carrossel sobre X" / "preciso de um post de X"
  /^(quero|preciso)\s+(?:de\s+)?(criar?|gerar?|fazer?|fa[çc]a|escrever?)\s+(um|uma)?\s*(carrossel|post|conte[uú]do|roteiro|legenda)?\s*(de|sobre|do|da|para)?\s*/i,
  // "quero carrossel sobre X" / "preciso post de X"
  /^(quero|preciso)\s+(de\s+)?(um|uma)?\s*(carrossel|post|conte[uú]do|texto|legenda)\s*(de|sobre|do|da|para)?\s*/i,
  // "criar carrossel sobre X" / "fazer post de X" / "gere uma legenda sobre X"
  /^(criar?|gerar?|fazer?|fa[çc]a|escrever?)\s+(um|uma)?\s*(carrossel|post|conte[uú]do|roteiro|legenda)?\s*(de|sobre|do|da|para)?\s*/i,
  // "me ajuda com um carrossel sobre X"
  /^(me\s+)?(ajuda|ajude|crie|cria|gere|gera)\s+(?:com\s+)?(um|uma)?\s*(carrossel|post|conte[uú]do)?\s*(de|sobre|do|da|para)?\s*/i,
  // "com um carrossel de X" (leftover after iterative strip)
  /^com\s+(?:um|uma)\s*(?:carrossel|post|conte[uú]do)?\s*(?:de|sobre|do|da|para)?\s*/i,
  /^carrossel\s+(de|sobre|do|da)?\s*/i,
  /^posts?\s+(de|sobre|do|da)?\s*/i,
  /^falar\s+(sobre\s+|de\s+|do\s+|da\s+)?\s*/i,
  /^mostrar\s+(?:(?:o|a|os|as)\s+)?(?:noss[ao]s?\s+)?/i,
  /^divulgar\s+(?:(?:o|a|os|as)\s+)?(?:noss[ao]s?\s+)?/i,
  /^conte[uú]do\s+(?:de|sobre|do|da|para)?\s*/i,
  /^(?:tema|assunto)\s*[:—\-]?\s*/i,
  /^promo[çc][aã]o\s+(?:de|do|da|dos|das)?\s*/i,
  /^dica\s+(?:de|sobre|para)?\s*/i,
  /^(?:algo\s+)?sobre\s+/i,
  // Possessivos soltos no início ("minha loja de bolos" → "loja de bolos")
  /^(?:meu|minha|nosso|nossa)\s+/i,
];

function extractCleanSubject(topic: string, mainService: string): string {
  let s = topic.trim();
  let changed = true;
  while (changed) {
    changed = false;
    for (const rx of META_PREFIXES) {
      const next = s.replace(rx, "").trim();
      if (next.length >= 3 && next !== s) { s = next; changed = true; break; }
    }
  }
  s = s.replace(/\s+/g, " ").replace(/[.,!?;:]+$/, "").trim();
  return s.length >= 3 ? s : mainService;
}

const TITLE_TEMPLATES: Record<CarouselObjective, string[]> = {
  vender: [
    "{subject} com quem entende do assunto",
    "Qualidade em {subject} que você vai notar",
    "Por que escolher {businessName} para {subject}",
    "{subject} — resultado que fala por si",
    "A diferença está em {subject}",
  ],
  educar: [
    "{subject}: o que você precisa saber",
    "Tudo sobre {subject} em poucos slides",
    "{subject} — dicas que fazem diferença",
    "Entenda de vez {subject}",
    "O guia rápido de {subject}",
  ],
  promocao: [
    "Promoção especial em {subject}",
    "{subject} com condições imperdíveis",
    "Oferta limitada: confira tudo sobre {subject}",
    "{subject} — oportunidade por tempo limitado",
    "Condições exclusivas em {subject}",
  ],
  servico: [
    "Como funciona: {subject}",
    "{subject} — veja o processo completo",
    "Tudo o que envolve {subject}",
    "{subject}: do início ao resultado",
    "O processo de {subject} explicado",
  ],
  autoridade: [
    "{businessName} em {subject}: expertise que se vê",
    "Por que somos referência em {subject}",
    "{subject} com profissionalismo de verdade",
    "Quem entende de {subject} escolhe {businessName}",
    "Nossa experiência em {subject}",
  ],
  whatsapp: [
    "Chame e fale sobre {subject}",
    "{subject} — atendimento direto pelo WhatsApp",
    "Atendimento rápido sobre {subject}",
    "Fale com a gente sobre {subject}",
    "{subject}: tudo pelo WhatsApp",
  ],
  recuperar: [
    "Sentimos sua falta em {businessName}",
    "Volte para {businessName} — sua agenda está aberta",
    "{businessName} tem novidades pra você",
    "A gente não esqueceu de você",
    "Retorne: {subject} esperando por você",
  ],
  novidade: [
    "{subject}: a novidade chegou",
    "Novidade: {subject} em {businessName}",
    "Apresentando {subject} — novo no catálogo",
    "{subject} — recém-chegado",
    "Conheça a nova opção: {subject}",
  ],
  duvidas: [
    "Respondendo suas dúvidas sobre {subject}",
    "{subject}: perguntas respondidas",
    "FAQ de {subject} — tire suas dúvidas",
    "O que você pergunta sobre {subject}",
    "{subject}: tudo esclarecido",
  ],
};

const CAPTION_OPENERS: Record<CarouselObjective, string[]> = {
  vender: [
    "Arrasta para ver o que {businessName} tem pra você.",
    "Se você busca qualidade em {subject}, esse conteúdo é pra você.",
    "Confira tudo sobre {subject} no carrossel abaixo.",
    "O que você precisa saber sobre {subject} está aqui.",
    "Desliza para descobrir o que {businessName} pode fazer por você.",
  ],
  educar: [
    "Entender {subject} pode mudar completamente o seu resultado. Arrasta.",
    "Tudo sobre {subject} em poucos slides — salva esse conteúdo.",
    "Você sabe tudo sobre {subject}? Arrasta e descobre.",
    "Informação que vale ouro sobre {subject}. Salva e compartilha.",
    "Desliza e aprende tudo sobre {subject} de forma simples.",
  ],
  promocao: [
    "Promoção por tempo limitado — arrasta antes que acabe.",
    "Condições especiais em {subject}. Não deixa passar.",
    "Essa oportunidade em {subject} não vai durar. Confira agora.",
    "Salva esse post: temos uma oferta especial em {subject}.",
    "Desliza para ver as condições da promoção.",
  ],
  servico: [
    "Sabia que funciona assim? Arrasta e vê o processo completo.",
    "Tudo sobre como funciona {subject}. Desliza para entender.",
    "Conhece bem o processo? Arrasta e descobre cada etapa.",
    "Transparência em tudo que fazemos — desliza e vê.",
    "Arrasta para ver como {subject} funciona na prática.",
  ],
  autoridade: [
    "{businessName} tem algo importante pra compartilhar. Arrasta.",
    "Expertise que você vê e sente. Desliza para conferir.",
    "Anos de experiência em {subject} resumidos nesse carrossel.",
    "Conteúdo de quem realmente entende de {subject}.",
    "Quem cuida da qualidade, cuida dos detalhes. Arrasta.",
  ],
  whatsapp: [
    "Rápido, prático e sem complicação. Desliza e chame no WhatsApp.",
    "Arrasta para ver o que oferecemos — depois manda mensagem.",
    "Conteúdo rápido. Depois chama no WhatsApp e a gente resolve.",
    "Tudo que você precisa saber antes de chamar. Arrasta.",
    "Prefere resolver pelo WhatsApp? Tudo aqui — depois chama.",
  ],
  recuperar: [
    "Faz tempo que não aparece, mas a gente não esqueceu de você.",
    "Sua vaga ainda está aqui. Arrasta e vê as novidades.",
    "Saudade? Desliza que tem novidade pra você.",
    "Voltou? Que bom. Arrasta para ver o que preparamos.",
    "A gente reservou um espaço pra você. Desliza.",
  ],
  novidade: [
    "Novidade no catálogo — arrasta para conferir tudo.",
    "Chegou {subject} em {businessName}. Desliza e vê todos os detalhes.",
    "Tem coisa nova aqui — arrasta antes de todo mundo.",
    "Novidade que você vai querer. Confira no carrossel.",
    "Acabou de chegar. Arrasta e não perde.",
  ],
  duvidas: [
    "Resposta rápida para quem tem dúvidas sobre {subject}. Salva.",
    "As dúvidas mais comuns sobre {subject} — respondidas aqui.",
    "Você perguntou, a gente respondeu. Arrasta e tira suas dúvidas.",
    "FAQ sobre {subject}: salva esse post para não esquecer.",
    "Dúvida sobre {subject}? Arrasta que está tudo explicado.",
  ],
};

const WA_TEMPLATES: Record<CarouselObjective, string[]> = {
  vender: [
    "Olá, vim pelo Instagram! Quero saber mais sobre {subject}.",
    "Oi! Vi o post e tenho interesse. Pode me contar mais sobre {subject}?",
    "Olá! Adorei o conteúdo. Gostaria de saber valores para {subject}.",
  ],
  educar: [
    "Olá! Vi o conteúdo no Instagram e fiquei com interesse. Como faço para agendar?",
    "Oi, vim pelo Instagram! Queria tirar uma dúvida sobre {subject}.",
    "Olá! O post foi muito útil. Posso marcar uma consulta?",
  ],
  promocao: [
    "Olá! Vi a promoção no Instagram e quero aproveitar. Ainda está disponível?",
    "Oi! Vim pelo post de promoção. Pode me dar mais detalhes?",
    "Olá! Vi a oferta especial de {subject}. Ainda dá tempo?",
  ],
  servico: [
    "Olá! Vi como funciona o processo e gostei. Quero agendar.",
    "Oi, vim pelo Instagram! Quero saber mais sobre o serviço de {subject}.",
    "Olá! Vi o post explicando tudo e tenho interesse. Qual o próximo passo?",
  ],
  autoridade: [
    "Olá! Vi o conteúdo de {businessName} e quero conversar.",
    "Oi! Vim pelo Instagram e gostei muito do trabalho. Quero saber mais.",
    "Olá! Fiquei impressionado com o conteúdo. Posso agendar uma conversa?",
  ],
  whatsapp: [
    "Olá! Vim pelo Instagram.",
    "Oi, vi o post e vim falar com vocês!",
    "Olá! Vi o conteúdo e vim pelo Instagram mesmo.",
  ],
  recuperar: [
    "Olá! Faz um tempo que não apareço. Quero marcar horário.",
    "Oi! Vi o post e resolvi voltar. Tem vaga essa semana?",
    "Olá, vim pelo Instagram! Quero retomar meu atendimento.",
  ],
  novidade: [
    "Olá! Vi a novidade no Instagram e quero saber mais sobre {subject}.",
    "Oi! Vi o lançamento e quero garantir o meu.",
    "Olá! Adorei a novidade. Pode me contar os detalhes?",
  ],
  duvidas: [
    "Olá! Vi o post com as dúvidas sobre {subject} e ainda tenho uma pergunta.",
    "Oi! Vi o FAQ e gostaria de conversar um pouco mais.",
    "Olá! O post foi ótimo. Posso tirar mais uma dúvida sobre {subject}?",
  ],
};

function fillTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] || "");
}

interface CarouselInterpretation {
  cleanSubject: string;
  professionalTitle: string;
  captionHook: string;
  waMessage: string;
}

function interpretCarouselRequest(
  topic: string,
  objective: CarouselObjective,
  businessName: string,
  mainService: string
): CarouselInterpretation {
  const cleanSubject = extractCleanSubject(topic, mainService);
  const seed = topic + businessName;
  const vars = { subject: cleanSubject, businessName };

  const titleTpls = TITLE_TEMPLATES[objective];
  const professionalTitle = fillTemplate(titleTpls[variationIndex(seed, titleTpls.length)], vars);

  const capTpls = CAPTION_OPENERS[objective];
  const captionHook = fillTemplate(capTpls[variationIndex(seed + "cap", capTpls.length)], vars);

  const waTpls = WA_TEMPLATES[objective];
  const waMessage = fillTemplate(waTpls[variationIndex(seed + "wa", waTpls.length)], vars);

  return { cleanSubject, professionalTitle, captionHook, waMessage };
}

// ─── Caption generation ───────────────────────────────────────
function generateCaption(
  hook: string,
  businessName: string,
  city: string,
  whatsapp: string
): string {
  const phone = whatsapp.replace(/\D/g, "");
  const waLink = phone ? `https://wa.me/55${phone}` : "";
  const closer = waLink
    ? `\n\n👉 ${waLink}\n\n📍 ${businessName} — ${city}`
    : `\n\n📍 ${businessName} — ${city}`;
  return `${hook}\n\n${closer}`;
}

// ─── Main generator ───────────────────────────────────────────
export function generatePremiumCarousel(input: CarouselInput): PremiumCarousel {
  const { topic, objective, niche: nicheRaw, businessName, city, mainService,
          whatsapp, selectedImages, slideImagesMap, visualStyle, format } = input;

  const targetCount = Math.min(8, Math.max(4, input.slideCount ?? 6));
  const hasImages = selectedImages.length > 0 || (slideImagesMap && Object.keys(slideImagesMap).length > 0);

  const { cleanSubject, professionalTitle, captionHook, waMessage } =
    interpretCarouselRequest(topic, objective, businessName, mainService);

  const niche = nicheKey(nicheRaw);
  const rawTemplates = getSlideTemplates(niche, objective, cleanSubject, businessName, city, mainService, whatsapp);
  const templates = buildSlideTemplates(rawTemplates, targetCount);

  const layouts = layoutsForStyle(visualStyle, !!hasImages, targetCount);
  const imageMap = assignImages(selectedImages, templates.length, slideImagesMap);

  const slides: PremiumCarouselSlide[] = templates.map((t, i) => {
    const layout = layouts[i] ?? (i === templates.length - 1 ? "cta_final" : "content_list");
    return {
      id: uid(),
      slideNumber: i + 1,
      layout,
      title: t.title,
      subtitle: t.subtitle,
      body: t.body,
      cta: t.cta,
      badge: t.badge,
      listItems: t.listItems,
      imageUrl: imageMap[i],
      overlayOpacity: layout === "cover_hero" ? 0.55 : layout === "card_glass" ? 0.3 : layout === "image_overlay" ? 0.6 : 0,
      bgVariant: bgForLayout(layout, i),
    };
  });

  return {
    title: professionalTitle,
    topic,
    objective,
    format,
    visualStyle,
    slides,
    caption: generateCaption(captionHook, businessName, city, whatsapp),
    whatsappMessage: waMessage,
    selectedImages,
  };
}
