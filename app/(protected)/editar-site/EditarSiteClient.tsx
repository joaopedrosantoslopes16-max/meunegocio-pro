"use client";

import { useState } from "react";
import type { Business, ImageGallery, ImageType, PlanName } from "@/types";

const LINK_TYPES = [
  { id: "whatsapp",    label: "WhatsApp"    },
  { id: "instagram",   label: "Instagram"   },
  { id: "facebook",    label: "Facebook"    },
  { id: "linktree",    label: "Linktree"    },
  { id: "google_maps", label: "Google Maps" },
  { id: "agenda",      label: "Agenda"      },
  { id: "catalogo",    label: "Catálogo"    },
  { id: "cardapio",    label: "Cardápio"    },
  { id: "site",        label: "Site externo"},
  { id: "outro",       label: "Outro"       },
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
  plan?: PlanName;
}

// Overlay de bloqueio Pro para recursos exclusivos
function ProLock({ checkoutUrl = "https://pay.kiwify.com.br/1fAPOyu" }: { checkoutUrl?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl" style={{ background: "rgba(10,10,20,0.85)", backdropFilter: "blur(4px)" }}>
      <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-lg">🔒</div>
      <div className="text-center px-4">
        <p className="text-white font-bold text-sm mb-1">Exclusivo do plano Pro</p>
        <p className="text-white/50 text-xs mb-3">Foto de capa, galeria, links e fontes personalizadas</p>
        <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition">
          ⭐ Fazer upgrade para Pro
        </a>
      </div>
    </div>
  );
}

export default function EditarSiteClient({ business, siteSlug, images, plan = "essencial" }: Props) {
  const isPro = plan === "pro";
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"essencial" | "pro">(isPro ? "pro" : "essencial");
  const [activeSection, setSection] = useState<string>("perfil");

  // Parse font config (JSON ou string simples por compatibilidade)
  const parseFontConfig = (raw: string | null | undefined) => {
    try { const c = JSON.parse(raw ?? "{}"); return typeof c === "object" ? c : {}; } catch { return {}; }
  };
  const fontConfig = parseFontConfig((business as any).font_style);

  // Dados básicos
  const [businessName,  setBusinessName]  = useState(business.business_name);
  const [niche,         setNiche]         = useState(business.niche);
  const [city,          setCity]          = useState(business.city);
  const [shortDesc,     setShortDesc]     = useState(business.short_description ?? "");
  const [mainService,   setMainService]   = useState(business.main_service);
  const [serviceItems,  setServiceItems]  = useState<string[]>(
    (business.services_json ?? business.services ?? []).filter(Boolean)
  );

  // Contato
  const [whatsapp,  setWhatsapp]  = useState(business.whatsapp);
  const [instagram, setInstagram] = useState(business.instagram ?? "");
  const [facebook,  setFacebook]  = useState((business as any).facebook ?? "");
  const [linktree,  setLinktree]  = useState((business as any).linktree ?? "");
  const [booking,   setBooking]   = useState((business as any).booking_url ?? "");
  const [address,   setAddress]   = useState(business.address ?? "");
  const [mapsUrl,   setMapsUrl]   = useState(business.google_maps_url ?? "");

  // Aparência (font config encodeado em font_style como JSON)
  const [primaryColor,   setPrimaryColor]   = useState(business.primary_color ?? "#7c3aed");
  const [fontStyle,      setFontStyle]      = useState<string>(fontConfig.font ?? ((business as any).font_style && !((business as any).font_style?.startsWith("{")) ? (business as any).font_style : "inter"));
  const [siteBgColor,    setSiteBgColor]    = useState<string>(fontConfig.bg ?? "#ffffff");
  const [siteTextColor,  setSiteTextColor]  = useState<string>(fontConfig.text ?? "#111111");
  const [siteBgImg,      setSiteBgImg]      = useState<string>(fontConfig.bgImg ?? "");

  // Imagens + posição
  const [coverImg,     setCoverImg]     = useState(business.cover_image_url ?? "");
  const [coverImgPosY, setCoverImgPosY] = useState<number>(business.cover_image_position_y ?? 50);
  const [logoImg,      setLogoImg]      = useState(business.logo_url ?? "");
  const [proImg,       setProImg]       = useState(business.professional_photo_url ?? "");
  const [proImgPosY,   setProImgPosY]   = useState<number>(business.professional_photo_position_y ?? 50);
  // Galeria de fotos (até 6 itens, exibe as 3 primeiras no site)
  const [galleryImages, setGalleryImages] = useState<string[]>(business.gallery_images_json ?? []);

  // Benefícios
  const [benefitItems, setBenefitItems] = useState<string[]>(
    (business.benefits_json ?? []).filter(Boolean)
  );

  // Horários — toggles por dia
  const WEEK_DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  const [hoursConfig, setHoursConfig] = useState<Record<string, { open: boolean; time: string }>>(() => {
    const saved = business.opening_hours_json ?? {};
    const cfg: Record<string, { open: boolean; time: string }> = {};
    WEEK_DAYS.forEach((day) => {
      const val = saved[day] ?? "";
      const closed = !val || val.toLowerCase().includes("fechad");
      cfg[day] = { open: !closed, time: closed ? "" : val };
    });
    // Dias customizados fora dos 7 padrão
    Object.entries(saved).forEach(([day, time]) => {
      if (!WEEK_DAYS.includes(day)) {
        const closed = typeof time === "string" && time.toLowerCase().includes("fechad");
        cfg[day] = { open: !closed, time: closed ? "" : (time as string) };
      }
    });
    return cfg;
  });

  // Links personalizados
  const [customLinks, setCustomLinks] = useState<CustomLink[]>(
    (business.custom_links_json ?? []).map((l: any, i: number) => ({ ...l, id: l.id ?? String(i), is_active: l.is_active ?? true }))
  );

  // Depoimentos
  const [testimonials, setTestimonials] = useState<{ text: string; author: string; stars: number }[]>(
    (business.testimonials_json ?? []).map((t: any) => ({ text: t.text ?? "", author: t.author ?? "", stars: t.stars ?? 5 }))
  );

  const coverImages  = images.filter((i) => ["cover","general","professional"].includes(i.image_type));
  const logoImages   = images.filter((i) => ["logo","general"].includes(i.image_type));
  const proImages    = images.filter((i) => ["professional","general"].includes(i.image_type));

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const hours: Record<string, string> = {};
      Object.entries(hoursConfig).forEach(([day, cfg]) => {
        hours[day] = cfg.open ? (cfg.time.trim() || "Consulte disponibilidade") : "Fechado";
      });

      const update: any = {
        business_name:     businessName,
        niche,
        city,
        short_description: shortDesc || null,
        main_service:      mainService,
        services_json:     serviceItems.filter(Boolean),
        whatsapp,
        instagram,
        facebook,
        linktree,
        booking_url:       booking || null,
        address,
        google_maps_url:   mapsUrl || null,
        primary_color:     primaryColor,
        font_style:        JSON.stringify({ font: fontStyle, bg: siteBgColor, text: siteTextColor, bgImg: siteBgImg }),
        cover_image_url:        coverImg || null,
        logo_url:               logoImg || null,
        professional_photo_url: proImg  || null,
        cover_image_position_y:        coverImgPosY,
        professional_photo_position_y: proImgPosY,
        gallery_images_json: galleryImages.filter(Boolean),
        benefits_json:     benefitItems.filter(Boolean),
        opening_hours_json: hours,
        custom_links_json: customLinks,
        testimonials_json: testimonials.filter((t) => t.text),
        updated_at:        new Date().toISOString(),
      };

      const res = await fetch("/api/business/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: business.id, update }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao salvar");

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
    setTestimonials((prev) => [...prev, { text: "", author: "", stars: 5 }]);
  }

  function updateTestimonial(i: number, field: "text" | "author", val: string) {
    setTestimonials((prev) => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t));
  }

  function updateTestimonialStars(i: number, stars: number) {
    setTestimonials((prev) => prev.map((t, idx) => idx === i ? { ...t, stars } : t));
  }

  function removeTestimonial(i: number) {
    setTestimonials((prev) => prev.filter((_, idx) => idx !== i));
  }

  const SECTIONS = [
    { id: "perfil",    label: "Perfil",     proOnly: false },
    { id: "contato",   label: "Contato",    proOnly: false },
    { id: "servicos",  label: "Serviços",   proOnly: false },
    { id: "imagens",   label: "Imagens",    proOnly: false },
    { id: "links",     label: "Links",      proOnly: true  },
    { id: "aparencia", label: "Aparência",  proOnly: false },
    { id: "horarios",  label: "Horários",   proOnly: false },
    { id: "avaliacoes",label: "Avaliações", proOnly: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header ações */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Editar mini site</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{business.business_name} · /site/{siteSlug}</p>
        </div>
        <div className="flex gap-3">
          <a href={`/site/${siteSlug}`} target="_blank" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition">
            Ver site
          </a>
          <button onClick={save} disabled={saving} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${saved ? "bg-green-100 text-green-700" : "gradient-brand text-white hover:opacity-90 disabled:opacity-60"}`}>
            {saving ? "Salvando…" : saved ? "Salvo!" : "Salvar alterações"}
          </button>
        </div>
      </div>

      {error && <p className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300 mb-5">{error}</p>}

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Nav lateral */}
        <nav className="lg:w-44 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 lg:sticky lg:top-6 flex-shrink-0">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex-shrink-0 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition flex items-center justify-between gap-1.5 ${activeSection === s.id ? "bg-violet-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <span>{s.label}</span>
              {s.proOnly && !isPro && (
                <span className="text-[9px] font-extrabold opacity-60">🔒</span>
              )}
              {s.proOnly && isPro && (
                <span className="text-[8px] font-extrabold text-yellow-400 opacity-80">⭐</span>
              )}
            </button>
          ))}
        </nav>

        {/* Conteúdo */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-5">

          {/* ── PERFIL ── */}
          {activeSection === "perfil" && (
            <>
              <SectionTitle title="Informações do negócio" />
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
              <SectionTitle title="Informações de contato" />
              <Field label="WhatsApp" required>
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={INPUT} placeholder="5511999999999 (com código do país)" />
                <p className="text-xs text-gray-400 mt-1">Formato: 5511999999999 (55 + DDD + número)</p>
              </Field>
              <Field label="Instagram">
                <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className={INPUT} placeholder="@berbeiro_elite ou https://instagram.com/berbeiro_elite" />
                <p className="text-xs text-gray-400 mt-1">Cole o link completo do perfil ou só o @nome de usuário.</p>
              </Field>
              <p className="text-xs text-gray-400 mt-2">Facebook, Linktree e links de agendamento: adicione na aba <strong>Links</strong>.</p>
            </>
          )}

          {/* ── SERVIÇOS ── */}
          {activeSection === "servicos" && (
            <>
              <SectionTitle title="Serviços" />
              <Field label="Serviço principal" required>
                <input value={mainService} onChange={(e) => setMainService(e.target.value)} className={INPUT} placeholder="Ex: Corte masculino, Limpeza dental, Musculação…" />
              </Field>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Lista de serviços</label>
                <div className="space-y-2">
                  {serviceItems.map((svc, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={svc}
                        onChange={(e) => { const u = [...serviceItems]; u[i] = e.target.value; setServiceItems(u); }}
                        className={INPUT}
                        placeholder={`Serviço ${i + 1}`}
                      />
                      <button
                        onClick={() => setServiceItems((prev) => prev.filter((_, idx) => idx !== i))}
                        className="w-9 h-9 flex-shrink-0 rounded-xl bg-red-50 dark:bg-red-950 text-red-500 font-bold hover:bg-red-100 transition"
                      >✕</button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setServiceItems((prev) => [...prev, ""])}
                  className="mt-2 w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-violet-300 hover:text-violet-600 transition"
                >
                  + Adicionar serviço
                </button>
                <p className="text-xs text-gray-400 mt-1">Cada linha vira um item no site</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Benefícios</label>
                <div className="space-y-2">
                  {benefitItems.map((b, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={b}
                        onChange={(e) => { const u = [...benefitItems]; u[i] = e.target.value; setBenefitItems(u); }}
                        className={INPUT}
                        placeholder="Ex: Agendamento pelo WhatsApp"
                      />
                      <button
                        onClick={() => setBenefitItems((prev) => prev.filter((_, idx) => idx !== i))}
                        className="w-9 h-9 flex-shrink-0 rounded-xl bg-red-50 dark:bg-red-950 text-red-500 font-bold hover:bg-red-100 transition"
                      >✕</button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setBenefitItems((prev) => [...prev, ""])}
                  className="mt-2 w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-violet-300 hover:text-violet-600 transition"
                >
                  + Adicionar benefício
                </button>
              </div>
            </>
          )}

          {/* ── IMAGENS ── */}
          {activeSection === "imagens" && (
            <>
              <SectionTitle title="Imagens do site" />

              {/* Logo — todos os planos */}
              <ImagePicker label="Logo / foto do perfil" value={logoImg} onChange={setLogoImg} images={logoImages} placeholder="Logomarca ou foto do negócio" />

              {/* Recursos exclusivos Pro */}
              {!isPro ? (
                <div className="mt-4 rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 p-5 flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-lg">🔒</div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">Galeria, capa e foto da equipe</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">No plano Pro você adiciona foto de capa no banner, galeria de fotos e foto da equipe no seu site.</p>
                    <a href="https://pay.kiwify.com.br/1fAPOyu" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition">
                      ⭐ Fazer upgrade para Pro — R$ 57/mês
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-6">
                  {/* Galeria */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Galeria de fotos <span className="text-xs text-gray-400 font-normal">(até 6 fotos no site)</span>
                    </p>
                    <div className="space-y-2 mt-2">
                      {[0, 1, 2, 3, 4, 5].map((idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          {/* Miniatura + upload */}
                          <label className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex-shrink-0 cursor-pointer hover:border-violet-400 transition relative">
                            {galleryImages[idx] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={galleryImages[idx]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-light">+</span>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                // Tenta Supabase Storage primeiro
                                try {
                                  const fd = new FormData();
                                  fd.append("file", file);
                                  fd.append("image_type", "general");
                                  fd.append("business_id", business.id);
                                  const res = await fetch("/api/gallery", { method: "POST", body: fd });
                                  if (res.ok) {
                                    const data = await res.json();
                                    const url = data.image?.image_url ?? data.url;
                                    if (url) {
                                      setGalleryImages(prev => {
                                        const next = Array.from({ length: 6 }, (_, i) => prev[i] ?? "");
                                        next[idx] = url;
                                        return next;
                                      });
                                      return;
                                    }
                                  }
                                } catch { /* cai no fallback */ }

                                // Fallback: base64 local (funciona sem Supabase Storage)
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const url = ev.target?.result as string;
                                  if (url) {
                                    setGalleryImages(prev => {
                                      const next = Array.from({ length: 6 }, (_, i) => prev[i] ?? "");
                                      next[idx] = url;
                                      return next;
                                    });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                          <input
                            value={galleryImages[idx] ?? ""}
                            onChange={e => {
                              const val = e.target.value;
                              setGalleryImages(prev => {
                                const next = Array.from({ length: 6 }, (_, i) => prev[i] ?? "");
                                next[idx] = val;
                                return next;
                              });
                            }}
                            placeholder={`URL da foto ${idx + 1}...`}
                            className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-400"
                          />
                          {galleryImages[idx] && (
                            <button
                              onClick={() => setGalleryImages(prev => { const next = Array.from({ length: 6 }, (_, i) => prev[i] ?? ""); next[idx] = ""; return next; })}
                              className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-950 text-red-400 text-xs flex items-center justify-center hover:bg-red-100 transition flex-shrink-0"
                            >✕</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Capa */}
                  <ImagePicker label="Foto de capa (banner do site)" value={coverImg} onChange={setCoverImg} images={coverImages} placeholder="Foto do seu negócio ou ambiente" />
                  {coverImg && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Posição vertical do banner</p>
                        <span className="text-xs font-bold text-violet-600">{coverImgPosY}%</span>
                      </div>
                      <input type="range" min={0} max={100} step={1} value={coverImgPosY} onChange={(e) => setCoverImgPosY(Number(e.target.value))} className="w-full accent-violet-600" />
                      <div className="flex justify-between text-[10px] text-gray-400"><span>↑ Topo</span><span>Centro</span><span>Base ↓</span></div>
                      <div className="rounded-xl overflow-hidden h-24 mt-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coverImg} alt="" className="w-full h-full object-cover" style={{ objectPosition: `center ${coverImgPosY}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Foto profissional */}
                  <ImagePicker label="Foto da equipe / foto profissional" value={proImg} onChange={setProImg} images={proImages} placeholder="Foto da equipe ou responsável" />
                  {proImg && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Posição vertical</p>
                        <span className="text-xs font-bold text-violet-600">{proImgPosY}%</span>
                      </div>
                      <input type="range" min={0} max={100} step={1} value={proImgPosY} onChange={(e) => setProImgPosY(Number(e.target.value))} className="w-full accent-violet-600" />
                      <div className="rounded-xl overflow-hidden h-24 mt-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={proImg} alt="" className="w-full h-full object-cover" style={{ objectPosition: `center ${proImgPosY}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── LINKS PERSONALIZADOS ── */}
          {activeSection === "links" && (
            <div className="relative">
              {!isPro && <ProLock />}
              <>
              <SectionTitle title="Links personalizados" />
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
                      {LINK_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
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
            </div>
          )}

          {/* ── APARÊNCIA ── */}
          {activeSection === "aparencia" && (
            <>
              <SectionTitle title="Aparência do site" />

              <Field label="Cor principal (botões, destaques)">
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

              <Field label="Cor de fundo do site">
                <div className="flex items-center gap-3">
                  <input type="color" value={siteBgColor} onChange={(e) => setSiteBgColor(e.target.value)} className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer" />
                  <input value={siteBgColor} onChange={(e) => setSiteBgColor(e.target.value)} className="w-28 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-400" />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["#ffffff","#f9f9f9","#f0f4ff","#fff8f0","#f0fff4","#1a1a2e","#0f172a","#111827"].map((c) => (
                    <button key={c} onClick={() => setSiteBgColor(c)} className={`w-8 h-8 rounded-lg border-2 transition hover:scale-110 ${siteBgColor === c ? "border-gray-800 dark:border-white scale-110" : "border-gray-200 dark:border-gray-600"}`} style={{ background: c }} />
                  ))}
                </div>
              </Field>

              <Field label="Cor do texto">
                <div className="flex items-center gap-3">
                  <input type="color" value={siteTextColor} onChange={(e) => setSiteTextColor(e.target.value)} className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer" />
                  <input value={siteTextColor} onChange={(e) => setSiteTextColor(e.target.value)} className="w-28 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-400" />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["#111111","#333333","#1e293b","#ffffff","#f1f5f9","#e2e8f0"].map((c) => (
                    <button key={c} onClick={() => setSiteTextColor(c)} className={`w-8 h-8 rounded-lg border-2 transition hover:scale-110 ${siteTextColor === c ? "border-gray-800 dark:border-white scale-110" : "border-gray-200 dark:border-gray-600"}`} style={{ background: c }} />
                  ))}
                </div>
              </Field>

              <Field label="Imagem de fundo do site (opcional)">
                <input value={siteBgImg} onChange={(e) => setSiteBgImg(e.target.value)} className={INPUT} placeholder="URL de uma imagem (vai cobrir o fundo com opacidade)" />
                {siteBgImg && (
                  <button onClick={() => setSiteBgImg("")} className="mt-1.5 text-xs text-red-500 font-semibold hover:underline">Remover imagem</button>
                )}
              </Field>

              <div className="relative">
              {!isPro && <ProLock />}
              <Field label="Fonte">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "inter",      label: "Moderna",   css: "'Inter', sans-serif" },
                    { id: "poppins",    label: "Elegante",  css: "'Poppins', sans-serif" },
                    { id: "montserrat", label: "Forte",     css: "'Montserrat', sans-serif" },
                    { id: "opensans",   label: "Clean",     css: "'Open Sans', sans-serif" },
                    { id: "nunito",     label: "Amigável",  css: "'Nunito', sans-serif" },
                  ].map((f) => (
                    <button key={f.id} onClick={() => setFontStyle(f.id)} className={`border-2 rounded-xl px-3 py-3 text-left transition ${fontStyle === f.id ? "border-violet-500 bg-violet-50 dark:bg-violet-950" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}>
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-lg" style={{ fontFamily: f.css }}>Aa</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{f.label}</p>
                    </button>
                  ))}
                </div>
              </Field>
              </div>
            </>
          )}

          {/* ── HORÁRIOS ── */}
          {activeSection === "horarios" && (
            <>
              <SectionTitle title="Horário de funcionamento" />
              <p className="text-xs text-gray-400 mb-3">Ative os dias que você atende e coloque o horário (ex: 08h às 18h).</p>
              <div className="space-y-2">
                {WEEK_DAYS.map((day) => {
                  const cfg = hoursConfig[day] ?? { open: false, time: "" };
                  return (
                    <div key={day} className="flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
                      {/* Toggle */}
                      <button
                        type="button"
                        onClick={() => setHoursConfig((prev) => ({ ...prev, [day]: { ...cfg, open: !cfg.open } }))}
                        className={`w-10 h-6 rounded-full flex-shrink-0 transition-colors relative ${cfg.open ? "bg-violet-600" : "bg-gray-300 dark:bg-gray-600"}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${cfg.open ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                      {/* Dia */}
                      <span className={`w-16 text-sm font-semibold flex-shrink-0 ${cfg.open ? "text-gray-800 dark:text-gray-200" : "text-gray-400"}`}>{day}</span>
                      {/* Horário */}
                      {cfg.open ? (
                        <input
                          value={cfg.time}
                          onChange={(e) => setHoursConfig((prev) => ({ ...prev, [day]: { ...cfg, time: e.target.value } }))}
                          className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-400"
                          placeholder="08h às 18h"
                        />
                      ) : (
                        <span className="text-sm text-gray-400 italic">Fechado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── AVALIAÇÕES ── */}
          {activeSection === "avaliacoes" && (
            <>
              <SectionTitle title="Depoimentos de clientes" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Use depoimentos reais de clientes satisfeitos para gerar confiança.</p>

              {testimonials.map((t, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Depoimento {i + 1}</p>
                    <button onClick={() => removeTestimonial(i)} className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-950 text-red-500 text-sm flex items-center justify-center hover:bg-red-100 transition">✕</button>
                  </div>
                  {/* Estrelas */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Avaliação</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateTestimonialStars(i, s)}
                          className="text-2xl leading-none transition hover:scale-110"
                          style={{ color: s <= (t.stars ?? 5) ? "#FFD700" : "#d1d5db" }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
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
              {saving ? "Salvando…" : saved ? "Alterações salvas!" : "Salvar alterações"}
            </button>
          </div>
        </div>

        {/* ── PREVIEW AO VIVO ── */}
        <div className="hidden xl:block w-[296px] flex-shrink-0 sticky top-6 self-start">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Preview ao vivo</p>
            <a href={`/site/${siteSlug}`} target="_blank" className="text-xs text-violet-600 font-semibold hover:underline">Abrir site →</a>
          </div>
          {/* Toggle — Essencial vê os dois, Pro vê só Pro */}
          {!isPro ? (
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-3">
              <button
                onClick={() => setPreviewMode("essencial")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${previewMode === "essencial" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
              >Essencial</button>
              <button
                onClick={() => setPreviewMode("pro")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${previewMode === "pro" ? "bg-violet-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
              >⭐ Ver Pro</button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-violet-600">⭐ Plano Pro</span>
              <span className="text-xs text-gray-400">Preview do seu site</span>
            </div>
          )}
          <div style={{ width: 280, height: 580, border: "8px solid #1f2937", borderRadius: 44, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)", background: "#fff", position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 72, height: 18, background: "#1f2937", borderRadius: "0 0 14px 14px", zIndex: 10 }} />
            <div style={{ width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden", paddingTop: 20 }} className="[&::-webkit-scrollbar]:hidden">
              <SitePreviewMini
                businessName={businessName}
                niche={niche}
                city={city}
                shortDesc={shortDesc}
                mainService={mainService}
                serviceItems={serviceItems}
                benefitItems={benefitItems}
                fontStyle={fontStyle}
                primaryColor={primaryColor}
                siteBgColor={siteBgColor}
                siteTextColor={siteTextColor}
                siteBgImg={siteBgImg}
                instagram={instagram}
                coverImg={coverImg}
                coverImgPosY={coverImgPosY}
                logoImg={logoImg}
                proImg={proImg}
                proImgPosY={proImgPosY}
                address={address}
                customLinks={customLinks}
                hoursConfig={hoursConfig}
                testimonials={testimonials}
                galleryImages={galleryImages}
                isPro={previewMode === "pro"}
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">Atualiza em tempo real</p>
        </div>
      </div>
    </div>
  );
}

// ── Preview ao vivo ────────────────────────────────────────

const PREVIEW_COVER: Record<string, { emoji: string; bg: string }> = {
  barbearia:          { emoji: "✂️", bg: "linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)" },
  odontologia:        { emoji: "🦷", bg: "linear-gradient(135deg,#e8f4fd 0%,#d6eaf8 60%,#aed6f1 100%)" },
  "clinica-medica":   { emoji: "🩺", bg: "linear-gradient(135deg,#eafaf1 0%,#d5f5e3 60%,#a9dfbf 100%)" },
  otica:              { emoji: "👓", bg: "linear-gradient(135deg,#fdfefe 0%,#f2f3f4 60%,#d5d8dc 100%)" },
  "personal-trainer": { emoji: "💪", bg: "linear-gradient(135deg,#1c1c1c 0%,#2d2d2d 60%,#ff6b35 100%)" },
  estetica:           { emoji: "🌸", bg: "linear-gradient(135deg,#fce4ec 0%,#f8bbd9 60%,#f48fb1 100%)" },
  "loja-de-roupa":    { emoji: "👗", bg: "linear-gradient(135deg,#f3e5f5 0%,#e1bee7 60%,#ce93d8 100%)" },
  imobiliaria:        { emoji: "🏠", bg: "linear-gradient(135deg,#1a237e 0%,#283593 60%,#3949ab 100%)" },
  restaurante:        { emoji: "🍽️", bg: "linear-gradient(135deg,#bf360c 0%,#d84315 60%,#ff7043 100%)" },
  mecanica:           { emoji: "🔧", bg: "linear-gradient(135deg,#212121 0%,#424242 60%,#616161 100%)" },
  serralheria:        { emoji: "🔒", bg: "linear-gradient(135deg,#263238 0%,#37474f 60%,#546e7a 100%)" },
  outro:              { emoji: "⭐", bg: "linear-gradient(135deg,#2c3e50 0%,#3d5a80 60%,#98c1d9 100%)" },
};

const FONT_CSS_MAP: Record<string, string> = {
  inter:      "'Inter', system-ui, sans-serif",
  poppins:    "'Poppins', sans-serif",
  montserrat: "'Montserrat', sans-serif",
  opensans:   "'Open Sans', sans-serif",
  nunito:     "'Nunito', sans-serif",
};

function SitePreviewMini({ businessName, niche, city, shortDesc, mainService, serviceItems, benefitItems, fontStyle, primaryColor, siteBgColor, siteTextColor, siteBgImg, instagram, coverImg, coverImgPosY, logoImg, proImg, proImgPosY, address, customLinks, hoursConfig, testimonials, galleryImages, isPro }: {
  businessName: string; niche: string; city: string; shortDesc: string;
  mainService: string; serviceItems: string[]; benefitItems: string[];
  fontStyle: string; primaryColor: string;
  siteBgColor: string; siteTextColor: string; siteBgImg: string;
  instagram: string; coverImg: string; coverImgPosY: number;
  logoImg: string; proImg: string; proImgPosY: number;
  address: string; customLinks: CustomLink[];
  hoursConfig: Record<string, { open: boolean; time: string }>;
  testimonials: { text: string; author: string; stars: number }[];
  galleryImages: string[];
  isPro: boolean;
}) {
  const services    = serviceItems.filter(Boolean);
  const benefits    = benefitItems.filter(Boolean);
  const initial     = (businessName || "?")[0].toUpperCase();
  const bgColor     = siteBgColor || "#ffffff";
  const textColor   = siteTextColor || "#111111";
  const cover       = PREVIEW_COVER[niche] ?? PREVIEW_COVER.outro;
  const color       = primaryColor || "#7c3aed";
  const fontFamily  = FONT_CSS_MAP[fontStyle] ?? FONT_CSS_MAP.inter;
  const activeLinks = customLinks.filter((l) => l.is_active && l.label);
  const hoursEntries = Object.entries(hoursConfig).map(([day, cfg]) => ({ day, hours: cfg.open ? (cfg.time || "Consulte disponibilidade") : "Fechado" }));
  const activeTestimonials = testimonials.filter((t) => t.text);

  // Instagram: aceita @handle ou URL completa
  const igRaw = instagram ?? "";
  const igUrl = igRaw.startsWith("http") ? igRaw : igRaw ? `https://instagram.com/${igRaw.replace("@", "")}` : "";
  const igHandle = igRaw.startsWith("http") ? `@${igRaw.split("instagram.com/").pop()?.split("/")[0] ?? ""}` : igRaw;

  const bgStyle = siteBgImg
    ? { background: bgColor, backgroundImage: `url(${siteBgImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundBlendMode: "overlay" as const }
    : { background: bgColor };

  return (
    <div style={{ ...bgStyle, fontFamily, WebkitFontSmoothing: "antialiased" }}>

      {isPro ? (
        <>
          {/* ── PRO: capa escura com avatar dentro ── */}
          <div style={{ height: 140, background: coverImg ? "none" : cover.bg, backgroundImage: coverImg ? `url(${coverImg})` : undefined, backgroundSize: "cover", backgroundPosition: `center ${coverImgPosY}%`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: coverImg ? "linear-gradient(to bottom,rgba(0,0,0,0.30) 0%,rgba(0,0,0,0.80) 100%)" : "linear-gradient(to bottom,rgba(0,0,0,0.10) 0%,rgba(0,0,0,0.65) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 75% 20%, ${color}44 0%, transparent 55%)` }} />
            <div style={{ position: "absolute", top: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {logoImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoImg} alt="" style={{ width: 28, height: 28, borderRadius: 8, objectFit: "cover", border: "2px solid rgba(255,255,255,0.4)" }} />
                ) : (
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{initial}</div>
                )}
                <div style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 100, padding: "3px 8px" }}>
                  <span style={{ color: "#fff", fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const }}>{niche || "negócio"}</span>
                </div>
              </div>
              {igUrl && (
                <div style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 100, padding: "3px 8px" }}>
                  <span style={{ color: "#fff", fontSize: 9, fontWeight: 700 }}>{igHandle || "@instagram"}</span>
                </div>
              )}
            </div>
            <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, zIndex: 10 }}>
              <h1 style={{ fontSize: 14, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 3 }}>{businessName || "Nome do negócio"}</h1>
              {mainService && <p style={{ fontSize: 9, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{mainService} · {city}</p>}
            </div>
            {!coverImg && <div style={{ position: "absolute", right: 10, bottom: -4, fontSize: 52, opacity: 0.10 }}>{cover.emoji}</div>}
          </div>
          <div style={{ background: "#0a0a0a", borderBottom: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "6px 10px" }}>
            {[["⚡", "Online"], ["📍", city || "Cidade"], ["💬", "Rápido"]].map(([emoji, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 8 }}>{emoji}</span>
                <span style={{ fontSize: 8, color: "#aaa", fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: "10px 14px 4px" }}>
            {shortDesc && <p style={{ fontSize: 9, color: textColor + "99", lineHeight: 1.6, marginBottom: 6 }}>{shortDesc}</p>}
            <div style={{ background: "#25D366", borderRadius: 10, padding: "9px 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>Chamar no WhatsApp</span>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ── ESSENCIAL: hero gradiente centralizado (igual PlanComparison) ── */}
          <div style={{ background: `linear-gradient(160deg, ${color}f5 0%, ${color}bb 100%)`, padding: "28px 18px 40px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "120px", height: "120px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
            <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              {logoImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoImg} alt="" style={{ width: 52, height: 52, borderRadius: 14, margin: "0 auto 10px", objectFit: "cover", border: "2px solid rgba(255,255,255,0.35)" }} />
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: 14, margin: "0 auto 10px", background: "rgba(255,255,255,0.22)", border: "2px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#fff" }}>{initial}</div>
              )}
              <p style={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 3 }}>{businessName || "Nome do negócio"}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.70)", fontWeight: 600, marginBottom: 16 }}>{niche} · {city}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#25D366", color: "#fff", fontWeight: 800, fontSize: 12, padding: 11, borderRadius: 10, boxShadow: "0 4px 14px rgba(37,211,102,0.35)" }}>
                💬 Chamar no WhatsApp
              </div>
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 24, background: bgColor, clipPath: "ellipse(55% 100% at 50% 100%)" }} />
          </div>

          {/* Serviços */}
          {services.length > 0 && (
            <div style={{ padding: "16px 16px 4px" }}>
              <p style={{ fontSize: 9, fontWeight: 800, color, letterSpacing: "0.20em", textTransform: "uppercase" as const, marginBottom: 8 }}>Serviços</p>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                {[mainService, ...services.filter((s) => s !== mainService)].filter(Boolean).slice(0, 3).map((svc, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: i === 0 ? `${color}18` : `${color}06`, border: `1px solid ${i === 0 ? color + "40" : color + "15"}`, borderRadius: 8, padding: "9px 12px" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <p style={{ fontSize: 12, fontWeight: i === 0 ? 800 : 600, color: textColor, flex: 1 }}>{svc}</p>
                    {i === 0 && <span style={{ fontSize: 9, fontWeight: 700, color, background: `${color}20`, borderRadius: 4, padding: "2px 5px" }}>Principal</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links rápidos */}
          <div style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["WhatsApp", "Localização", "Instagram"].map((s) => (
                <div key={s} style={{ flex: 1, background: `${color}10`, border: `1px solid ${color}20`, borderRadius: 7, padding: "7px 4px", textAlign: "center" as const }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: textColor + "cc" }}>{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA footer */}
          <div style={{ padding: "12px 16px 20px", background: `${color}08`, borderTop: `1px solid ${color}20` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: color, color: "#fff", fontWeight: 800, fontSize: 12, padding: 11, borderRadius: 10 }}>
              💬 Fale pelo WhatsApp
            </div>
          </div>
        </>
      )}

      {/* Serviços */}
      {services.length > 0 && (
        <div style={{ background: `${color}06`, padding: "14px" }}>
          <p style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase" as const, color, marginBottom: 8 }}>Serviços</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 5 }}>
            {services.slice(0, 5).map((svc, i) => (
              <div key={i} style={{ background: bgColor, borderRadius: 10, padding: "7px 10px", display: "flex", alignItems: "center", gap: 8, border: i === 0 ? `1.5px solid ${color}35` : `1.5px solid ${color}15` }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: i === 0 ? color : `${color}60`, flexShrink: 0 }} />
                <p style={{ fontSize: 11, fontWeight: 700, color: textColor }}>{svc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Galeria — só Pro (grid 3 colunas, proporção 4:3) */}
      {isPro && galleryImages.filter(Boolean).length > 0 && (
        <div style={{ padding: "14px" }}>
          <p style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase" as const, color, marginBottom: 8 }}>Galeria</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
            {galleryImages.filter(Boolean).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="" style={{ width: "100%", height: 40, objectFit: "cover", borderRadius: 6 }} />
            ))}
          </div>
        </div>
      )}

      {/* Benefícios */}
      {benefits.length > 0 && (
        <div style={{ padding: "14px" }}>
          <p style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase" as const, color, marginBottom: 8 }}>Por que a gente</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 5 }}>
            {benefits.slice(0, 4).map((b, i) => (
              <div key={i} style={{ background: `${color}06`, borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "flex-start", gap: 8, border: `1.5px solid ${color}18` }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 3 }} />
                <p style={{ fontSize: 10, color: textColor, lineHeight: 1.5 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Foto profissional — depois dos serviços */}
      {proImg && (
        <div style={{ padding: "0 14px 14px" }}>
          <div style={{ borderRadius: 12, overflow: "hidden", height: 100 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={proImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `center ${proImgPosY}%` }} />
          </div>
        </div>
      )}

      {/* Links personalizados */}
      {activeLinks.length > 0 && (
        <div style={{ padding: "14px" }}>
          <p style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase" as const, color, marginBottom: 8 }}>Links</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 5 }}>
            {activeLinks.slice(0, 4).map((link) => (
              <div key={link.id} style={{ background: `${color}08`, border: `1.5px solid ${color}20`, borderRadius: 10, padding: "7px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#333" }}>{link.label}</span>
                <span style={{ fontSize: 10, color: "#bbb" }}>→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Endereço */}
      {address && (
        <div style={{ padding: "0 14px 14px" }}>
          <div style={{ background: `${color}08`, border: `1px solid ${color}18`, borderRadius: 10, padding: "8px 12px", display: "flex", gap: 7, alignItems: "flex-start" }}>
            <span style={{ fontSize: 12, flexShrink: 0 }}>📍</span>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#555", lineHeight: 1.5 }}>{address}</p>
          </div>
        </div>
      )}

      {/* Horários */}
      {Object.keys(hoursConfig).length > 0 && (
        <div style={{ background: `${color}06`, padding: "14px" }}>
          <p style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase" as const, color, marginBottom: 8 }}>Horários</p>
          <div style={{ background: bgColor, borderRadius: 10, overflow: "hidden", border: `1.5px solid ${color}18` }}>
            {hoursEntries.slice(0, 7).map(({ day, hours }, i) => {
              const closed = hours.toLowerCase().includes("fechad");
              return (
                <div key={day} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", borderBottom: i < hoursEntries.slice(0, 7).length - 1 ? `1px solid ${color}12` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: closed ? "#d1d5db" : "#22c55e", flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: textColor }}>{day}</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: closed ? "#aaa" : textColor }}>{hours}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Depoimentos */}
      {activeTestimonials.length > 0 && (
        <div style={{ padding: "14px" }}>
          <p style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase" as const, color, marginBottom: 8 }}>Depoimentos</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {activeTestimonials.slice(0, 3).map((t, i) => (
              <div key={i} style={{ background: `${color}06`, borderRadius: 10, padding: "10px 12px", border: `1.5px solid ${color}18` }}>
                <div style={{ display: "flex", gap: 1, marginBottom: 5 }}>
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} style={{ fontSize: 10, color: s <= (t.stars ?? 5) ? "#FFD700" : "#e0e0e0" }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: 10, color: "#555", lineHeight: 1.5, fontStyle: "italic", marginBottom: 5 }}>"{t.text.slice(0, 80)}{t.text.length > 80 ? "…" : ""}"</p>
                <p style={{ fontSize: 9, fontWeight: 700, color }}>{t.author}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA final */}
      <div style={{ background: color, padding: "22px 14px", textAlign: "center" as const }}>
        <h2 style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 10, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
          Quer falar com {businessName || "a gente"}?
        </h2>
        <div style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 10, padding: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>Chamar no WhatsApp</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#0a0a0a", padding: "18px 14px", textAlign: "center" as const }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 7px", fontSize: 14, fontWeight: 900, color: "#fff" }}>{initial}</div>
        <p style={{ fontSize: 12, fontWeight: 900, color: "#fff", marginBottom: 2 }}>{businessName || "Seu negócio"}</p>
        <p style={{ fontSize: 9, color: "#555" }}>{niche} · {city}</p>
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

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="pb-2 border-b border-gray-100 dark:border-gray-800">
      <h2 className="font-extrabold text-gray-900 dark:text-white">{title}</h2>
    </div>
  );
}

function ImagePicker({ label, value, onChange, images, placeholder }: {
  label: string; value: string; onChange: (url: string) => void;
  images: ImageGallery[]; placeholder: string;
}) {
  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => { if (e.target?.result) onChange(e.target.result as string); };
    reader.readAsDataURL(file);
  }

  return (
    <Field label={label}>
      {value && (
        <div className="mb-3 relative rounded-xl overflow-hidden aspect-video max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onChange("")} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">✕</button>
        </div>
      )}

      {/* Upload ou URL */}
      <div className="flex gap-2 mb-2">
        <input
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
          placeholder="Cole uma URL de imagem aqui"
        />
        <label className="flex-shrink-0 cursor-pointer flex items-center gap-1.5 bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 font-semibold text-xs px-3 py-2 rounded-xl hover:bg-violet-100 transition">
          Subir foto
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
        </label>
      </div>

      {/* Galeria */}
      {images.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-1.5">Ou selecione da galeria:</p>
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
        </>
      )}
      {images.length === 0 && !value && (
        <p className="text-xs text-gray-400 italic">{placeholder}</p>
      )}
    </Field>
  );
}
