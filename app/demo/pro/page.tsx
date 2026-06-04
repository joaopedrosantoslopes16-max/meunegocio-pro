import Link from "next/link";
import DashboardClient from "@/app/(protected)/dashboard/DashboardClient";

const mockBusiness = {
  id: "demo-pro",
  business_name: "Barbearia Estilo",
  niche: "barbearia",
  city: "São Paulo",
  main_service: "Corte Masculino",
  whatsapp: "11999999999",
  instagram: "@barbeariaestilo",
  facebook: "facebook.com/barbeariaestilo",
  linktree: "",
  booking_url: null,
  address: "Rua das Flores, 123 — São Paulo",
  google_maps_url: "https://maps.google.com",
  short_description: "Barbearia premium no centro de São Paulo. Cortes modernos e atendimento personalizado.",
  primary_color: "#7c3aed",
  cover_image_url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
  logo_url: null,
  professional_photo_url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80",
  cover_image_position_y: 40,
  professional_photo_position_y: 30,
  gallery_images_json: [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80",
    "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&q=80",
  ],
  services_json: ["Corte Masculino", "Barba", "Hidratação", "Sobrancelha", "Pigmentação"],
  services: ["Corte Masculino", "Barba", "Hidratação", "Sobrancelha", "Pigmentação"],
  benefits_json: ["Atendimento sem espera", "Produtos premium", "Wi-Fi grátis", "Estacionamento"],
  opening_hours_json: {
    Segunda: "09h às 19h", Terça: "09h às 19h", Quarta: "09h às 19h",
    Quinta: "09h às 19h", Sexta: "09h às 20h", Sábado: "08h às 18h", Domingo: "Fechado",
  },
  custom_links_json: [
    { id: "1", label: "Agendar horário", url: "#", type: "agenda", is_active: true },
    { id: "2", label: "Ver no Instagram", url: "#", type: "instagram", is_active: true },
  ],
  testimonials_json: [
    { text: "Melhor barbearia da região! Atendimento nota 10.", author: "Carlos M.", stars: 5 },
    { text: "Corte perfeito, sempre saio satisfeito.", author: "Rafael S.", stars: 5 },
  ],
  visual_style: "moderno",
  font_style: "inter",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockKit = {
  id: "demo-kit-pro",
  user_id: "demo-user",
  business_id: "demo-pro",
  site_slug: "demo-pro",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  businesses: mockBusiness as any,
};

const mockSubscription = {
  id: "demo-sub-pro",
  user_id: "demo-user",
  email: "demo@demo.com",
  plan_name: "pro",
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockMonthlyContent = {
  id: "demo-content",
  user_id: "demo-user",
  business_id: "demo-pro",
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  posts_limit: 15,
  captions_limit: 15,
  messages_limit: 15,
  generated_at: new Date().toISOString(),
  posts_json: Array.from({ length: 5 }, (_, i) => ({
    number: i + 1,
    title: ["Transforme seu visual hoje", "Barba bem feita, homem bem cuidado", "Corte que valoriza você", "Cuide-se sem complicação", "Seu estilo, sua identidade"][i],
    subtitle: ["Agende agora pelo WhatsApp", "Venha conhecer nosso trabalho", "Atendimento personalizado", "Horário flexível pra você", "Reserve seu horário"][i],
    cta: "Agendar agora",
    template_type: ["main_service","whatsapp_cta","authority","promotion","location"][i],
    is_unlocked: true,
  })),
  captions_json: Array.from({ length: 5 }, (_, i) => `✂️ Legenda exemplo ${i + 1} para a Barbearia Estilo em São Paulo. Agende pelo WhatsApp! #barbearia #corte #saopaulo`),
  messages_json: Array.from({ length: 5 }, (_, i) => `Olá! Tudo bem? Sou da Barbearia Estilo e gostaria de te avisar que temos horários disponíveis essa semana. Que tal renovar o visual? 💈`),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function DemoProPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Banner de demo */}
      <div className="bg-violet-600 text-white text-center text-xs font-bold py-2 px-4">
        ⭐ MODO DEMO — Plano Pro · Dados fictícios para visualização
        <Link href="/demo/essencial" className="ml-4 underline hover:no-underline">Ver demo Essencial →</Link>
        <Link href="/" className="ml-4 underline hover:no-underline">Voltar ao site</Link>
      </div>

      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-gradient">MeuNegócio Pro</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">demo@exemplo.com</span>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-bold">Pro</span>
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
