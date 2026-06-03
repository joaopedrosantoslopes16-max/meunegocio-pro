"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Business, ImageGallery, ImageType } from "@/types";

const LINK_TYPES = [
  { id: "whatsapp",    label: "WhatsApp",    icon: "💬" },
  { id: "instagram",   label: "Instagram",   icon: "📸" },
  { id: "facebook",    label: "Facebook",    icon: "📘" },
  { id: "linktree",    label: "Linktree",    icon: "🌿" },
  { id: "google_maps", label: "Google Maps", icon: "📍" },
  { id: "agenda",      label: "Agenda",      icon: "📅" },
  { id: "catalogo",    label: "Catálogo",    icon: "📋" },
  { id: "cardapio",    label: "Cardápio",    icon: "🍽️" },
  { id: "site",        label: "Site externo",icon: "🌐" },
  { id: "outro",       label: "Outro",       icon: "🔗" },
];

interface CustomLink {
  id: string;
  label: string;
  url: string;
  type: string;
  is_active: boolean;
}

interface Props {
  business: Business;
  siteSlug: string;
  images: ImageGallery[];
}

export default function EditarSiteClient({ business, siteSlug, images }: Props) {
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [activeSection, setSection] = useState<string>("perfil");

  // Dados básicos
  const [businessName,     setBusinessName]     = useState(business.business_name);
  const [niche,            setNiche]            = useState(business.niche);
  const [city,             setCity]             = useState(business.city);
  const [shortDesc,        setShortDesc]        = useState(business.short_description ?? "");
  const [mainService,      setMainService]      = useState(business.main_service);
  const [servicesText,     setServicesText]     = useState((business.services_json ?? business.services ?? []).join(", "));

  // Contato
  const [whatsapp,  setWhatsapp]  = useState(business.whatsapp);
  const [instagram, setInstagram] = useState(business.instagram ?? "");
  const [facebook,  setFacebook]  = useState((business as any).facebook ?? "");
  const [linktree,  setLinktree]  = useState((business as any).linktree ?? "");
  const [booking,   setBooking]   = useState((business as any).booking_url ?? "");
  const [address,   setAddress]   = useState(business.address ?? "");
  const [mapsUrl,   setMapsUrl]   = useState(business.google_maps_url ?? "");

  // Aparência
  const [primaryColor, setPrimaryColor] = useState(business.primary_color ?? "#7c3aed");
  const [fontStyle,    setFontStyle]    = useState((business as any).font_style ?? "inter");

  // Imagens
  const [coverImg,    setCoverImg]    = useState(business.cover_image_url ?? "");
  const [logoImg,     setLogoImg]     = useState(business.logo_url ?? "");
  const [proImg,      setProImg]      = useState(business.professional_photo_url ?? "");

  // Benefícios
  const [benefitsText, setBenefitsText] = useState((business.benefits_json ?? []).join("\n"));

  // Horários
  const [horariosText, setHorariosText] = useState(
    Object.entries(business.opening_hours_json ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n")
  );

  // Links personalizados
  const [customLinks, setCustomLinks] = useState<CustomLink[]>(
    (business.custom_links_json ?? []).map((l: any, i: number) => ({ ...l, id: l.id ?? String(i), is_active: l.is_active ?? true }))
  );

  // Depoimentos
  const [testimonials, setTestimonials] = useState<{ text: string; author: string }[]>(
    business.testimonials_json ?? []
  );

  const coverImages  = images.filter((i) => ["cover","general","professional"].includes(i.image_type));
  const logoImages   = images.filter((i) => ["logo","general"].includes(i.image_type));
  const proImages    = images.filter((i) => ["professional","general"].includes(i.image_type));

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const services = servicesText.split(",").map((s) => s.trim()).filter(Boolean);
      const benefits = benefitsText.split("\n").map((s) => s.trim()).filter(Boolean);
      const hours: Record<string, string> = {};
      horariosText.split("\n").forEach((line) => {
        const [k, ...v] = line.split(":"); if (k && v.length) hours[k.trim()] = v.join(":").trim();
      });

      const update: any = {
        business_name:          businessName,
        niche,
        city,
        short_description:      shortDesc || null,
        main_service:           mainService,
        services_json:          services,
        whatsapp,
        instagram,
        facebook,
        linktree,
        booking_url:            booking || null,
        address,
        google_maps_url:        mapsUrl || null,
        primary_color:          primaryColor,
        font_style:             fontStyle,
        cover_image_url:        coverImg || null,
        logo_url:               logoImg || null,
        professional_photo_url: proImg  || null,
        benefits_json:          benefits,
        opening_hours_json:     hours,
        custom_links_json:      customLinks,
        testimonials_json:      testimonials.filter((t) => t.text),
        updated_at:             new Date().toISOString(),
      };

      const { error: dbError } = await supabase
        .from("businesses")
        .update(update)
        .eq("id", business.id);

      if (dbError) throw new Error(dbError.message);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message ?? "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  function addLink() {
    setCustomLinks((prev) => [...prev, { id: Date.now().toString(), label: "", url: "", type: "outro", is_active: true }]);
  }

  function updateLink(id: string, field: keyof CustomLink, value: any) {
    setCustomLinks((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l));
  }

  function removeLink(id: string) {
    setCustomLinks((prev) => prev.filter((l) => l.id !== id));
  }

  function addTestimonial() {
    setTestimonials((prev) => [...prev, { text: "", author: "" }]);
  }

  function updateTestimonial(i: number, field: "text" | "author", val: string) {
    setTestimonials((prev) => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t));
  }

  function removeTestimonial(i: number) {
    setTestimonials((prev) => prev.filter((_, idx) => idx !== i));
  }

  const SECTIONS = [
    { id: "perfil",    label: "Perfil",     icon: "🏢" },
    { id: "contato",   label: "Contato",    icon: "📞" },
    { id: "servicos",  label: "Serviços",   icon: "🛠️" },
    { id: "imagens",   label: "Imagens",    icon: "🖼️" },
    { id: "links",     label: "Links",      icon: "🔗" },
    { id: "aparencia", label: "Aparência",  icon: "🎨" },
    { id: "horarios",  label: "Horários",   icon: "⏰" },
    { id: "avaliacoes",label: "Avaliações", icon: "⭐" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header ações */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Editar mini site</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{business.business_name} · /site/{siteSlug}</p>
        </div>
        <div className="flex gap-3">
          <a href={`/site/${siteSlug}`} target="_blank" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition">
            🌐 Ver site
          </a>
          <button onClick={save} disabled={saving} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${saved ? "bg-green-100 text-green-700" : "gradient-brand text-white hover:opacity-90 disabled:opacity-60"}`}>
            {saving ? "Salvando…" : saved ? "✅ Salvo!" : "💾 Salvar alterações"}
          </button>
        </div>
      </div>

      {error && <p className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300 mb-5">{error}</p>}

      <div className="flex flex-col md:flex-row gap-6">

        {/* Nav lateral */}
        <nav className="md:w-44 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition ${activeSection === s.id ? "bg-violet-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <span>{s.icon}</span>
              <span className="hidden md:inline">{s.label}</span>
            </button>
          ))}
        </nav>

        {/* Conteúdo */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-5">

          {/* ── PERFIL ── */}
          {activeSection === "perfil" && (
            <>
              <SectionTitle icon="🏢" title="Informações do negócio" />
              <Field label="Nome do negócio" required>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={INPUT} placeholder="Ex: Barbearia do João" />
              </Field>
              <Field label="Nicho / Segmento" required>
                <input value={niche} onChange={(e) => setNiche(e.target.value)} className={INPUT} placeholder="Ex: Barbearia, Odontologia, Personal Trainer…" />
              </Field>
              <Field label="Cidade">
                <input value={city} onChange={(e) => setCity(e.target.value)} className={INPUT} placeholder="Ex: São Paulo - SP" />
              </Field>
              <Field label="Descrição curta (aparece no hero do site)">
                <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} rows={3} className={`${INPUT} resize-none`} placeholder="Uma frase que resume o que você faz e para quem…" />
                <p className="text-xs text-gray-400 mt-1">{shortDesc.length}/160 caracteres</p>
              </Field>
              <Field label="Endereço">
                <input value={address} onChange={(e) => setAddress(e.target.value)} className={INPUT} placeholder="Rua, número, bairro, cidade" />
              </Field>
              <Field label="Link do Google Maps">
                <input value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} className={INPUT} placeholder="https://maps.google.com/..." />
              </Field>
            </>
          )}

          {/* ── CONTATO ── */}
          {activeSection === "contato" && (
            <>
              <SectionTitle icon="📞" title="Informações de contato" />
              <Field label="WhatsApp" required>
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={INPUT} placeholder="5511999999999 (com código do país)" />
                <p className="text-xs text-gray-400 mt-1">Formato: 5511999999999 (55 + DDD + número)</p>
              </Field>
              <Field label="Instagram">
                <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className={INPUT} placeholder="@seu_instagram ou URL completa" />
              </Field>
              <Field label="Facebook">
                <input value={facebook} onChange={(e) => setFacebook(e.target.value)} className={INPUT} placeholder="@sua_pagina ou URL completa" />
              </Field>
              <Field label="Linktree">
                <input value={linktree} onChange={(e) => setLinktree(e.target.value)} className={INPUT} placeholder="https://linktr.ee/..." />
              </Field>
              <Field label="Link de agendamento (Calendly, WhatsApp etc)">
                <input value={booking} onChange={(e) => setBooking(e.target.value)} className={INPUT} placeholder="https://..." />
              </Field>
            </>
          )}

          {/* ── SERVIÇOS ── */}
          {activeSection === "servicos" && (
            <>
              <SectionTitle icon="🛠️" title="Serviços" />
              <Field label="Serviço principal" required>
                <input value={mainService} onChange={(e) => setMainService(e.target.value)} className={INPUT} placeholder="Ex: Corte masculino, Limpeza dental, Musculação…" />
              </Field>
              <Field label="Lista de serviços (separados por vírgula)">
                <textarea value={servicesText} onChange={(e) => setServicesText(e.target.value)} rows={4} className={`${INPUT} resize-none`} placeholder="Corte masculino, Barba, Acabamento, Tintura" />
                <p className="text-xs text-gray-400 mt-1">Cada serviço separado por vírgula vira um item no site</p>
              </Field>
              <Field label="Benefícios (um por linha)">
                <textarea value={benefitsText} onChange={(e) => setBenefitsText(e.target.value)} rows={5} className={`${INPUT} resize-none`} placeholder={"Agendamento pelo WhatsApp\nAtendimento personalizado\nProdutos de qualidade"} />
              </Field>
            </>
          )}

          {/* ── IMAGENS ── */}
          {activeSection === "imagens" && (
            <>
              <SectionTitle icon="🖼️" title="Imagens do site" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Selecione imagens da sua galeria. Para enviar novas imagens,{" "}
                <a href="/galeria" className="text-violet-600 font-semibold hover:underline">acesse a galeria</a>.
              </p>

              <ImagePicker label="Imagem de fundo do hero (banner principal)" value={coverImg} onChange={setCoverImg} images={coverImages} placeholder="Foto do seu negócio ou ambiente" />
              <ImagePicker label="Logo" value={logoImg} onChange={setLogoImg} images={logoImages} placeholder="Logomarca do negócio" />
              <ImagePicker label="Foto profissional (foto sua ou da equipe)" value={proImg} onChange={setProImg} images={proImages} placeholder="Foto da equipe ou responsável" />

              {images.length === 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-center">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 font-semibold mb-1">Galeria vazia</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-3">Envie fotos do seu negócio para usar no site.</p>
                  <a href="/galeria" className="text-xs font-bold text-yellow-800 dark:text-yellow-300 underline">Ir para a galeria →</a>
                </div>
              )}
            </>
          )}

          {/* ── LINKS PERSONALIZADOS ── */}
          {activeSection === "links" && (
            <>
              <SectionTitle icon="🔗" title="Links personalizados" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Adicione links extras que vão aparecer como botões no seu site.</p>

              {customLinks.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm mb-3">Nenhum link adicionado ainda</p>
                </div>
              )}

              {customLinks.map((link) => (
                <div key={link.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <select value={link.type} onChange={(e) => updateLink(link.id, "type", e.target.value)} className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-400">
                      {LINK_TYPES.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
                    </select>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <input type="checkbox" checked={link.is_active} onChange={(e) => updateLink(link.id, "is_active", e.target.checked)} className="accent-violet-600" />
                        Ativo
                      </label>
                      <button onClick={() => removeLink(link.id)} className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-950 text-red-500 text-sm flex items-center justify-center hover:bg-red-100 transition">✕</button>
                    </div>
                  </div>
                  <input value={link.label} onChange={(e) => updateLink(link.id, "label", e.target.value)} className={INPUT} placeholder="Nome do link (Ex: Ver cardápio, Agendar horário…)" />
                  <input value={link.url} onChange={(e) => updateLink(link.id, "url", e.target.value)} className={INPUT} placeholder="URL (https://...)" />
                </div>
              ))}

              <button onClick={addLink} className="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-3 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-violet-300 hover:text-violet-600 transition flex items-center justify-center gap-2">
                + Adicionar link
              </button>
            </>
          )}

          {/* ── APARÊNCIA ── */}
          {activeSection === "aparencia" && (
            <>
              <SectionTitle icon="🎨" title="Aparência do site" />
              <Field label="Cor principal">
                <div className="flex items-center gap-3">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer" />
                  <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-28 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-400" />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["#7c3aed","#6366f1","#2563eb","#16a34a","#d97706","#dc2626","#db2777","#111827"].map((c) => (
                    <button key={c} onClick={() => setPrimaryColor(c)} className={`w-8 h-8 rounded-lg border-2 transition hover:scale-110 ${primaryColor === c ? "border-gray-800 dark:border-white scale-110" : "border-transparent"}`} style={{ background: c }} />
                  ))}
                </div>
              </Field>
              <Field label="Fonte">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "inter",      label: "Moderna",   sample: "Aa" },
                    { id: "poppins",    label: "Elegante",  sample: "Aa" },
                    { id: "montserrat", label: "Forte",     sample: "Aa" },
                    { id: "opensans",   label: "Clean",     sample: "Aa" },
                    { id: "nunito",     label: "Amigável",  sample: "Aa" },
                  ].map((f) => (
                    <button key={f.id} onClick={() => setFontStyle(f.id)} className={`border-2 rounded-xl px-3 py-3 text-left transition ${fontStyle === f.id ? "border-violet-500 bg-violet-50 dark:bg-violet-950" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}>
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">{f.sample}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{f.label}</p>
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {/* ── HORÁRIOS ── */}
          {activeSection === "horarios" && (
            <>
              <SectionTitle icon="⏰" title="Horário de funcionamento" />
              <Field label="Horários (um por linha, formato 'Dia: horário')">
                <textarea value={horariosText} onChange={(e) => setHorariosText(e.target.value)} rows={8} className={`${INPUT} resize-none`} placeholder={"Segunda: 08h às 18h\nTerça: 08h às 18h\nQuarta: 08h às 18h\nQuinta: 08h às 18h\nSexta: 08h às 17h\nSábado: 08h às 12h\nDomingo: Fechado"} />
              </Field>
            </>
          )}

          {/* ── AVALIAÇÕES ── */}
          {activeSection === "avaliacoes" && (
            <>
              <SectionTitle icon="⭐" title="Depoimentos de clientes" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Use depoimentos reais de clientes satisfeitos para gerar confiança.</p>

              {testimonials.map((t, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Depoimento {i + 1}</p>
                    <button onClick={() => removeTestimonial(i)} className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-950 text-red-500 text-sm flex items-center justify-center hover:bg-red-100 transition">✕</button>
                  </div>
                  <textarea value={t.text} onChange={(e) => updateTestimonial(i, "text", e.target.value)} rows={3} className={`${INPUT} resize-none`} placeholder="O que o cliente disse sobre você…" />
                  <input value={t.author} onChange={(e) => updateTestimonial(i, "author", e.target.value)} className={INPUT} placeholder="Nome ou iniciais do cliente (Ex: Maria S.)" />
                </div>
              ))}

              <button onClick={addTestimonial} className="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-3 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-violet-300 hover:text-violet-600 transition flex items-center justify-center gap-2">
                + Adicionar depoimento
              </button>
            </>
          )}

          {/* Salvar bottom */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <button onClick={save} disabled={saving} className={`w-full py-3.5 rounded-xl font-bold text-sm transition ${saved ? "bg-green-100 text-green-700" : "gradient-brand text-white hover:opacity-90 disabled:opacity-60"}`}>
              {saving ? "Salvando…" : saved ? "✅ Alterações salvas!" : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────

const INPUT = "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400";

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
      <span className="text-xl">{icon}</span>
      <h2 className="font-extrabold text-gray-900 dark:text-white">{title}</h2>
    </div>
  );
}

function ImagePicker({ label, value, onChange, images, placeholder }: {
  label: string; value: string; onChange: (url: string) => void;
  images: ImageGallery[]; placeholder: string;
}) {
  return (
    <Field label={label}>
      {value && (
        <div className="mb-3 relative rounded-xl overflow-hidden aspect-video max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onChange("")} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">✕</button>
        </div>
      )}
      {!value && (
        <div className="mb-3 bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-5 text-center max-w-xs">
          <p className="text-xs text-gray-400">{placeholder}</p>
        </div>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 mb-2"
        placeholder="Cole uma URL de imagem ou selecione abaixo"
      />
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => onChange(img.image_url)}
              className={`aspect-square rounded-xl overflow-hidden border-2 transition hover:scale-105 ${value === img.image_url ? "border-violet-500 scale-105" : "border-transparent"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </Field>
  );
}
