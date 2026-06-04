import Link from "next/link";
import DashboardClient from "@/app/(protected)/dashboard/DashboardClient";

const mockBusiness = {
  id: "demo-essencial",
  business_name: "Barbearia Estilo",
  niche: "barbearia",
  city: "São Paulo",
  main_service: "Corte Masculino",
  whatsapp: "11999999999",
  instagram: "@barbeariaestilo",
  facebook: "",
  linktree: "",
  booking_url: null,
  address: "Rua das Flores, 123 — São Paulo",
  google_maps_url: null,
  short_description: "Barbearia premium no centro de São Paulo. Cortes modernos e atendimento personalizado.",
  primary_color: "#7c3aed",
  cover_image_url: null,
  logo_url: null,
  professional_photo_url: null,
  cover_image_position_y: 50,
  professional_photo_position_y: 50,
  gallery_images_json: [],
  services_json: ["Corte Masculino", "Barba", "Hidratação"],
  services: ["Corte Masculino", "Barba", "Hidratação"],
  benefits_json: ["Atendimento sem espera", "Produtos premium", "Wi-Fi grátis"],
  opening_hours_json: {
    Segunda: "09h às 19h", Terça: "09h às 19h", Quarta: "09h às 19h",
    Quinta: "09h às 19h", Sexta: "09h às 20h", Sábado: "08h às 18h", Domingo: "Fechado",
  },
  custom_links_json: [],
  testimonials_json: [],
  visual_style: "moderno",
  font_style: "inter",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockKit = {
  id: "demo-kit-essencial",
  user_id: "demo-user",
  business_id: "demo-essencial",
  site_slug: "demo-essencial",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  businesses: mockBusiness as any,
};

const mockSubscription = {
  id: "demo-sub",
  user_id: "demo-user",
  email: "demo@demo.com",
  plan_name: "essencial",
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Conteúdo mensal mockado para Essencial (5 posts)
const mockMonthlyContent = {
  id: "demo-content-essencial",
  user_id: "demo-user",
  business_id: "demo-essencial",
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  posts_limit: 5,
  captions_limit: 5,
  messages_limit: 5,
  generated_at: new Date().toISOString(),
  posts_json: [
    { number: 1, title: "Transforme seu visual hoje", subtitle: "Agende agora pelo WhatsApp", cta: "Agendar", template_type: "main_service", is_unlocked: true },
    { number: 2, title: "Barba bem feita, homem cuidado", subtitle: "Venha conhecer nosso trabalho", cta: "Agendar", template_type: "whatsapp_cta", is_unlocked: true },
    { number: 3, title: "Corte que valoriza você", subtitle: "Atendimento personalizado", cta: "Saiba mais", template_type: "authority", is_unlocked: true },
    { number: 4, title: "Cuide-se sem complicação", subtitle: "Horário flexível pra você", cta: "Ver horários", template_type: "promotion", is_unlocked: true },
    { number: 5, title: "Seu estilo, sua identidade", subtitle: "Reserve seu horário agora", cta: "Reservar", template_type: "location", is_unlocked: true },
  ],
  captions_json: [
    "✂️ Precisando de um corte novo? A Barbearia Estilo tem o estilo certo pra você! Agende pelo WhatsApp. #barbearia #corte #saopaulo",
    "💈 Barba feita com cuidado e precisão. Venha conhecer o nosso trabalho. #barba #barbearia #cuidadomasculino",
    "✨ Um bom corte muda tudo! Venha conferir nossa barbearia em São Paulo. Agendamento no link da bio.",
    "🗓️ Horários flexíveis pra encaixar na sua rotina. Agende agora e garanta seu horário! #barbearia #agendamento",
    "💪 Cuide do seu visual com quem entende. Barbearia Estilo — qualidade em cada detalhe. #estilo #barba #saopaulo",
  ],
  messages_json: [
    "Olá! Tudo bem? Aqui é da Barbearia Estilo. Temos horários disponíveis essa semana. Que tal renovar o visual? 💈",
    "Oi! Passando pra avisar que temos promoção especial nessa semana na Barbearia Estilo. Me chama aqui! ✂️",
    "Boa tarde! Você estava aqui conosco há algum tempo. Que tal agendar um horário esta semana? 😊",
    "Olá! Não te vemos há um tempo. Que tal uma visita? Temos novidades aqui na Barbearia Estilo! 💈",
    "Oi! Temos agenda aberta para amanhã na Barbearia Estilo. Quer garantir seu horário? Me chama! ✂️",
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function DemoEssencialPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-amber-500 text-amber-950 text-center text-xs font-bold py-2 px-4 flex items-center justify-center gap-4 flex-wrap">
        <span>👁️ MODO DEMO — Plano Essencial</span>
        <Link href="/demo/pro" className="underline hover:no-underline">Ver demo Pro →</Link>
        <Link href="/" className="underline hover:no-underline">Voltar ao site</Link>
      </div>

      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-gradient">MeuNegócio Pro</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">demo@exemplo.com</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">Essencial</span>
          </div>
        </div>
      </header>

      <DashboardClient
        kit={mockKit as any}
        leads={[]}
        subscription={mockSubscription as any}
        monthlyContent={mockMonthlyContent as any}
        extraPackages={[]}
        displayName="João Silva"
        userEmail="demo@exemplo.com"
        galleryImages={[]}
      />
    </div>
  );
}
