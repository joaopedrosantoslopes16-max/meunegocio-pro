import Link from "next/link";
import GaleriaClient from "@/app/(protected)/galeria/GaleriaClient";
import type { Business } from "@/types";

const BUSINESS: Business = {
  id:              "demo-business-1",
  user_id:         "demo-user-1",
  business_name:   "Barbearia do João",
  niche:           "barbearia",
  city:            "São Paulo",
  whatsapp:        "5511999990000",
  instagram:       "@barbearia.joao",
  address:         "Rua das Flores, 123 — São Paulo, SP",
  main_service:    "Corte masculino",
  services:        ["Corte masculino", "Barba", "Sobrancelha", "Acabamento"],
  primary_color:   "#7c3aed",
  secondary_color: "#6d28d9",
  visual_style:    "moderno",
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
  services_json:          ["Corte masculino", "Barba", "Sobrancelha", "Acabamento"],
  created_at:      new Date().toISOString(),
  updated_at:      new Date().toISOString(),
};

export default function DemoGaleriaPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Banner demo */}
      <div className="bg-yellow-400 text-yellow-900 text-center py-2 px-4 text-xs font-extrabold tracking-wide sticky top-0 z-50">
        👁️ MODO DEMO — Upload de imagens não funciona sem conta real
      </div>

      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-8 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/demo" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm">
            ← Demo
          </Link>
          <span className="text-gray-200 dark:text-gray-700">/</span>
          <span className="font-bold text-gray-900 dark:text-white text-sm">Minha Galeria</span>
        </div>
      </header>

      <GaleriaClient business={BUSINESS} initialImages={[]} />
    </div>
  );
}
