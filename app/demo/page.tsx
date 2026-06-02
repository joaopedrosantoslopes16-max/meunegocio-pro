"use client";

import Link from "next/link";
import DashboardClient from "@/app/(protected)/dashboard/DashboardClient";
import { generatePosts, generateCaptions, generateWhatsAppMessages } from "@/lib/kit-generator";
import type { Kit, Business, Subscription, MonthlyContent, VisualStyle } from "@/types";

// ── Dados mock realistas para o demo ────────────────────────

const INPUT = {
  business_name: "Barbearia do João",
  niche: "barbearia",
  city: "São Paulo",
  whatsapp: "5511999990000",
  main_service: "Corte masculino",
  services: ["Corte masculino", "Barba", "Sobrancelha", "Acabamento"],
  primary_color: "#7c3aed",
  instagram: "@barbearia.joao",
};

const posts    = generatePosts(INPUT).map((p) => ({ ...p, is_unlocked: true }));
const captions = generateCaptions(INPUT);
const messages = generateWhatsAppMessages(INPUT);

const BUSINESS: Business = {
  id:              "demo-business-1",
  user_id:         "demo-user-1",
  business_name:   INPUT.business_name,
  niche:           INPUT.niche,
  city:            INPUT.city,
  whatsapp:        INPUT.whatsapp,
  instagram:       INPUT.instagram,
  address:         "Rua das Flores, 123 — São Paulo, SP",
  main_service:    INPUT.main_service,
  services:        INPUT.services,
  primary_color:   INPUT.primary_color,
  secondary_color: "#6d28d9",
  visual_style:    "moderno" as VisualStyle,
  slug:            "barbearia-joao-sp",
  cover_image_url:        null,
  logo_url:               null,
  professional_photo_url: null,
  gallery_images_json:    [],
  custom_links_json:      [],
  benefits_json:          [],
  testimonials_json:      [],
  short_description:      null,
  opening_hours_json:     {},
  google_maps_url:        null,
  services_json:          INPUT.services,
  created_at:      new Date().toISOString(),
  updated_at:      new Date().toISOString(),
};

const KIT: Kit & { businesses: Business } = {
  id:                  "demo-kit-1",
  user_id:             "demo-user-1",
  business_id:         BUSINESS.id,
  purchase_id:         null,
  status:              "ready" as const,
  release_stage:       3 as const,
  purchase_approved_at: new Date().toISOString(),
  day_0_unlocked:      true,
  day_3_unlocked:      true,
  day_7_unlocked:      true,
  site_slug:           BUSINESS.slug,
  site_url:            `http://localhost:3000/site/${BUSINESS.slug}`,
  posts_json:          posts,
  captions_json:       captions,
  whatsapp_messages_json: messages,
  instagram_bio:       `Barbearia em São Paulo\nCorte masculino\nAgende seu horário 👇`,
  kit_month:           `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
  created_at:          new Date().toISOString(),
  updated_at:          new Date().toISOString(),
  businesses:          BUSINESS,
};

const now = new Date();

const SUBSCRIPTION: Subscription = {
  id:                        "demo-sub-1",
  user_id:                   "demo-user-1",
  email:                     "joaopedrosantos.lopes16@gmail.com",
  plan_name:                 "pro",
  plan_price:                57,
  status:                    "active",
  kirvano_subscription_id:   null,
  kirvano_customer_id:       null,
  current_period_start:      new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
  current_period_end:        new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
  last_payment_at:           new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
  next_billing_at:           new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
  created_at:                new Date().toISOString(),
  updated_at:                new Date().toISOString(),
};

const MONTHLY_CONTENT: MonthlyContent = {
  id:              "demo-monthly-1",
  user_id:         "demo-user-1",
  subscription_id: SUBSCRIPTION.id,
  business_id:     BUSINESS.id,
  month:           now.getMonth() + 1,
  year:            now.getFullYear(),
  plan_name:       "pro",
  posts_limit:     15,
  captions_limit:  15,
  messages_limit:  15,
  posts_json:      posts.slice(0, 15),
  captions_json:   captions.slice(0, 15),
  messages_json:   messages.slice(0, 15),
  campaigns_json:  [],
  calendar_json:   [],
  generated_at:    new Date().toISOString(),
  created_at:      new Date().toISOString(),
};

const LEADS = [
  { id: "l1", business_id: BUSINESS.id, kit_id: KIT.id, name: "Maria Silva",    whatsapp: "5511988880001", interest: "Corte masculino",   created_at: new Date(Date.now() - 1 * 3600000).toISOString() },
  { id: "l2", business_id: BUSINESS.id, kit_id: KIT.id, name: "Carlos Souza",   whatsapp: "5511977770002", interest: "Barba",              created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: "l3", business_id: BUSINESS.id, kit_id: KIT.id, name: "Pedro Oliveira", whatsapp: "5511966660003", interest: "Corte + sobrancelha", created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
];

// ── Página ────────────────────────────────────────────────────

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Banner de aviso demo */}
      <div className="bg-yellow-400 text-yellow-900 text-center py-2 px-4 text-xs font-extrabold tracking-wide sticky top-0 z-50">
        👁️ MODO DEMO — Visualização do painel do cliente · Dados fictícios para teste
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-8 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-gradient-dark">MeuNegócio Pro</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">joaopedrosantos.lopes16@gmail.com</span>
            <Link href="/login" className="text-sm text-gray-500 hover:text-red-500 transition">
              Sair
            </Link>
          </div>
        </div>
      </header>

      {/* Atalhos de navegação do demo */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/demo/gerar-post-hoje" className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-indigo-200 transition group">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition">✨</div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Post de hoje</p>
              <p className="text-xs text-gray-400">Gerar post para Instagram</p>
            </div>
          </Link>
          <Link href="/demo/galeria" className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-indigo-200 transition group">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition">🖼️</div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Galeria</p>
              <p className="text-xs text-gray-400">Upload de imagens</p>
            </div>
          </Link>
          <Link href="/demo/site" className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-indigo-200 transition group col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition">🌐</div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Mini site</p>
              <p className="text-xs text-gray-400">Barbearia · Estética</p>
            </div>
          </Link>
        </div>
        <div className="h-px bg-gray-100 mt-6" />
      </div>

      {/* Dashboard completo com dados mock */}
      <DashboardClient
        kit={KIT}
        leads={LEADS}
        subscription={SUBSCRIPTION}
        monthlyContent={MONTHLY_CONTENT}
        extraPackages={[]}
        displayName="João Pedro"
        userEmail="joaopedrosantos.lopes16@gmail.com"
      />
    </div>
  );
}
