import Link from "next/link";
import SiteBody from "@/app/site/[slug]/SiteBody";
import type { Business, VisualStyle } from "@/types";

// ── Mocks ──────────────────────────────────────────────────

const BARBEARIA: Business = {
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
  services_json:          ["Corte masculino", "Barba", "Sobrancelha", "Acabamento"],
  created_at:      new Date().toISOString(),
  updated_at:      new Date().toISOString(),
};

const ESTETICA: Business = {
  id:              "demo-business-2",
  user_id:         "demo-user-1",
  business_name:   "Studio Bella Estética",
  niche:           "estetica",
  city:            "Campinas",
  whatsapp:        "5519988880000",
  instagram:       "@studiobella.estetica",
  address:         "Av. Brasil, 456 — Campinas, SP",
  main_service:    "Limpeza de pele",
  services:        ["Limpeza de pele", "Micropigmentação", "Drenagem linfática", "Design de sobrancelha"],
  primary_color:   "#be185d",
  secondary_color: "#9d174d",
  visual_style:    "elegante" as VisualStyle,
  slug:            "studio-bella-campinas",
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
  services_json:          ["Limpeza de pele", "Micropigmentação", "Drenagem linfática", "Design de sobrancelha"],
  created_at:      new Date().toISOString(),
  updated_at:      new Date().toISOString(),
};

const MOCKS: Record<string, Business> = {
  barbearia: BARBEARIA,
  estetica:  ESTETICA,
};

interface Props {
  searchParams: Promise<{ niche?: string }>;
}

export default async function DemoSitePage({ searchParams }: Props) {
  const { niche = "barbearia" } = await searchParams;
  const business = MOCKS[niche] ?? BARBEARIA;

  return (
    <div>
      {/* Banner de navegação entre nichos */}
      <div style={{ background: "#1e1b4b", color: "#fff", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/demo" style={{ color: "#a5b4fc", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
            ← Demo
          </Link>
          <span style={{ color: "#4c1d95", fontSize: "13px" }}>|</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#e0e7ff" }}>Mini site — visualização</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link
            href="/demo/site?niche=barbearia"
            style={{
              padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
              background: niche === "barbearia" ? "#7c3aed" : "transparent",
              color: niche === "barbearia" ? "#fff" : "#a5b4fc",
              border: "1px solid " + (niche === "barbearia" ? "#7c3aed" : "#4c1d95"),
              textDecoration: "none",
            }}
          >
            ✂️ Barbearia
          </Link>
          <Link
            href="/demo/site?niche=estetica"
            style={{
              padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
              background: niche === "estetica" ? "#be185d" : "transparent",
              color: niche === "estetica" ? "#fff" : "#a5b4fc",
              border: "1px solid " + (niche === "estetica" ? "#be185d" : "#4c1d95"),
              textDecoration: "none",
            }}
          >
            🌸 Estética
          </Link>
        </div>
      </div>

      <SiteBody business={business} demoMode />
    </div>
  );
}
