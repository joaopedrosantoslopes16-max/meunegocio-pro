import LeadForm from "./LeadForm";
import { buildWhatsAppLink } from "@/lib/whatsapp-utils";
import { NICHE_CONFIG } from "@/lib/niche-config";
import type { Business } from "@/types";

// ── Ícones SVG inline ──────────────────────────────────────
const IconWA = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);
const IconIG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);
const IconPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

// ── Ícones de serviço por nicho ────────────────────────────
const NICHE_SERVICE_EMOJIS: Record<string, string[]> = {
  barbearia:           ["✂️", "🪒", "👁️", "💈", "💇"],
  odontologia:         ["🦷", "✨", "🔬", "🦿", "😁"],
  "clinica-medica":    ["🩺", "🧪", "📋", "🛡️", "❤️"],
  otica:               ["👓", "🔭", "🕶️", "👁️", "🔧"],
  "personal-trainer":  ["💪", "🏃", "🥗", "⚡", "🏋️"],
  estetica:            ["✨", "💆", "💅", "🌿", "🪷"],
  "loja-de-roupa":     ["👗", "👔", "👟", "🎀", "🛍️"],
  imobiliaria:         ["🏠", "🔑", "📐", "🏡", "📊"],
  restaurante:         ["🍽️", "🥩", "🥗", "🍷", "👨‍🍳"],
  mecanica:            ["🔧", "⚙️", "🚗", "🛞", "🔩"],
  serralheria:         ["🔒", "⚙️", "🛠️", "🪟", "🏗️"],
  outro:               ["⭐", "✅", "💡", "🎯", "🏆"],
};

// ── Placeholder de capa por nicho ──────────────────────────
const NICHE_COVER: Record<string, { emoji: string; bg: string }> = {
  barbearia:           { emoji: "✂️", bg: "linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)" },
  odontologia:         { emoji: "🦷", bg: "linear-gradient(135deg,#e8f4fd 0%,#d6eaf8 60%,#aed6f1 100%)" },
  "clinica-medica":    { emoji: "🩺", bg: "linear-gradient(135deg,#eafaf1 0%,#d5f5e3 60%,#a9dfbf 100%)" },
  otica:               { emoji: "👓", bg: "linear-gradient(135deg,#fdfefe 0%,#f2f3f4 60%,#d5d8dc 100%)" },
  "personal-trainer":  { emoji: "💪", bg: "linear-gradient(135deg,#1c1c1c 0%,#2d2d2d 60%,#ff6b35 100%)" },
  estetica:            { emoji: "🌸", bg: "linear-gradient(135deg,#fce4ec 0%,#f8bbd9 60%,#f48fb1 100%)" },
  "loja-de-roupa":     { emoji: "👗", bg: "linear-gradient(135deg,#f3e5f5 0%,#e1bee7 60%,#ce93d8 100%)" },
  imobiliaria:         { emoji: "🏠", bg: "linear-gradient(135deg,#1a237e 0%,#283593 60%,#3949ab 100%)" },
  restaurante:         { emoji: "🍽️", bg: "linear-gradient(135deg,#bf360c 0%,#d84315 60%,#ff7043 100%)" },
  mecanica:            { emoji: "🔧", bg: "linear-gradient(135deg,#212121 0%,#424242 60%,#616161 100%)" },
  serralheria:         { emoji: "🔒", bg: "linear-gradient(135deg,#263238 0%,#37474f 60%,#546e7a 100%)" },
  outro:               { emoji: "⭐", bg: "linear-gradient(135deg,#2c3e50 0%,#3d5a80 60%,#98c1d9 100%)" },
};

function buildAboutText(businessName: string, niche: string, city: string, mainService: string): string {
  const sensitive = ["clinica-medica", "odontologia"];
  if (sensitive.includes(niche)) {
    return `A ${businessName} atende em ${city} com foco em um atendimento claro, responsável e acolhedor. Nossa equipe está disponível para tirar dúvidas e orientar cada paciente. Entre em contato pelo WhatsApp para mais informações.`;
  }
  const cfg = NICHE_CONFIG[niche] ?? NICHE_CONFIG.outro;
  return `A ${businessName} é uma ${cfg.label.toLowerCase()} localizada em ${city}, especializada em ${mainService}. ${cfg.description}. Atendimento direto pelo WhatsApp — sem fila, sem burocracia.`;
}

interface SiteBodyProps {
  business: Business;
  kitId?: string | null;
  demoMode?: boolean;
}

export default function SiteBody({ business, kitId, demoMode }: SiteBodyProps) {
  const cfg          = NICHE_CONFIG[business.niche] ?? NICHE_CONFIG.outro;
  const color        = business.primary_color ?? "#7c3aed";
  const initial      = business.business_name[0].toUpperCase();
  const waMain       = buildWhatsAppLink(business.whatsapp, `Olá! Vim pelo site da ${business.business_name} e quero saber mais sobre ${business.main_service}.`);
  const rawServices: string[] = Array.isArray(business.services) && business.services.length > 0
    ? business.services
    : cfg.services ?? [];
  const serviceEmojis = NICHE_SERVICE_EMOJIS[business.niche] ?? NICHE_SERVICE_EMOJIS.outro;
  const cover        = NICHE_COVER[business.niche] ?? NICHE_COVER.outro;
  const aboutText    = buildAboutText(business.business_name, business.niche, business.city, business.main_service);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Inter', system-ui, sans-serif", WebkitFontSmoothing: "antialiased", color: "#111", paddingBottom: "80px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --c: ${color}; }
        a { text-decoration: none; color: inherit; }
        .wa-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(37,211,102,0.40) !important; }
        .card-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.12) !important; }
        .svc-card:hover { background: ${color}10 !important; border-color: ${color}40 !important; }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.5);opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .animate { animation: fadeUp .6s ease both; }
        .wa-fixed { display:none; }
        @media(max-width:640px){ .wa-fixed{ display:flex; } }
      `}</style>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden" }}>

        {/* CAPA */}
        <div style={{ height: "260px", position: "relative", overflow: "hidden", background: cover.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "120px", opacity: 0.12, userSelect: "none", position: "absolute", right: "24px", bottom: "-10px" }}>
            {cover.emoji}
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
          <div style={{ position: "absolute", top: "20px", left: "20px" }}>
            <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "100px", padding: "5px 12px" }}>
              <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" }}>{cfg.label}</span>
            </div>
          </div>
          {business.instagram && (
            <a href={`https://instagram.com/${business.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer"
               style={{ position: "absolute", top: "20px", right: "20px", display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "100px", padding: "5px 12px", color: "#fff", fontSize: "12px", fontWeight: 700 }}>
              <IconIG /> {business.instagram}
            </a>
          )}
          <div style={{ position: "absolute", bottom: "20px", left: "20px", display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.85)", fontSize: "13px", fontWeight: 600 }}>
            <IconPin /> {business.city}
          </div>
        </div>

        {/* PERFIL */}
        <div style={{ position: "relative", padding: "0 20px", maxWidth: "560px", margin: "0 auto" }}>
          <div style={{ marginTop: "-52px", marginBottom: "16px", position: "relative", display: "inline-block" }}>
            <div style={{ position: "absolute", inset: "-6px", borderRadius: "28px", background: color, opacity: 0.25, animation: "pulse-ring 2.8s ease-out infinite" }} />
            <div style={{ width: "104px", height: "104px", borderRadius: "24px", background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`, border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", fontWeight: 900, color: "#fff", boxShadow: `0 8px 32px ${color}40`, position: "relative" }}>
              {initial}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
            <h1 style={{ fontSize: "clamp(24px,7vw,34px)", fontWeight: 900, color: "#111", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              {business.business_name}
            </h1>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "100px", padding: "4px 10px", flexShrink: 0, marginTop: "4px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a" }}>Online</span>
            </div>
          </div>

          <p style={{ fontSize: "15px", fontWeight: 600, color: "#777", marginBottom: "16px" }}>
            {cfg.label} · {business.city}
          </p>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: `${color}10`, border: `1px solid ${color}30`, borderRadius: "12px", padding: "8px 14px", marginBottom: "20px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: color, transform: "rotate(45deg)", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: color }}>{business.main_service}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <a href={waMain} target="_blank" rel="noopener noreferrer" className="wa-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#25D366", color: "#fff", fontWeight: 800, fontSize: "16px", padding: "16px 24px", borderRadius: "16px", boxShadow: "0 8px 28px rgba(37,211,102,0.35)", transition: "transform .2s, box-shadow .2s" }}>
              <IconWA size={20} />
              {cfg.cta} pelo WhatsApp
            </a>
            {business.instagram && (
              <a href={`https://instagram.com/${business.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#fff", border: "1.5px solid #e5e7eb", color: "#333", fontWeight: 700, fontSize: "15px", padding: "14px 24px", borderRadius: "16px", transition: "border-color .2s" }}>
                <IconIG /> Ver no Instagram
              </a>
            )}
          </div>

          <div style={{ height: "1px", background: "#f0f0f0", margin: "28px 0" }} />
        </div>
      </section>

      {/* ══ SOBRE ══════════════════════════════════════════════ */}
      <section style={{ padding: "0 20px 40px", maxWidth: "560px", margin: "0 auto" }}>
        <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.24em", textTransform: "uppercase", color: color, marginBottom: "8px" }}>Sobre</p>
        <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#111", letterSpacing: "-0.02em", marginBottom: "12px" }}>
          Sobre a {business.business_name}
        </h2>
        <p style={{ fontSize: "15px", color: "#555", lineHeight: 1.75, marginBottom: "20px" }}>{aboutText}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {[`📍 ${business.city}`, `✅ ${cfg.label}`, "💬 Resposta rápida"].map((pill) => (
            <div key={pill} style={{ background: "#f5f5f5", borderRadius: "100px", padding: "6px 14px", fontSize: "12px", fontWeight: 600, color: "#555", border: "1px solid #ebebeb" }}>
              {pill}
            </div>
          ))}
        </div>
      </section>

      {/* ══ SERVIÇOS ══════════════════════════════════════════ */}
      <section style={{ padding: "40px 20px", background: "#f9f9f9" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.24em", textTransform: "uppercase", color: color, marginBottom: "8px" }}>O que oferecemos</p>
          <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#111", letterSpacing: "-0.02em", marginBottom: "20px" }}>Serviços</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ background: "#fff", borderRadius: "18px", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", border: `1.5px solid ${color}30`, boxShadow: `0 4px 20px ${color}12` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                  {serviceEmojis[0]}
                </div>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: color, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "2px" }}>Especialidade</p>
                  <p style={{ fontSize: "16px", fontWeight: 800, color: "#111" }}>{business.main_service}</p>
                </div>
              </div>
              <a href={buildWhatsAppLink(business.whatsapp, `Olá! Quero saber mais sobre ${business.main_service}.`)} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", background: "#25D366", color: "#fff", fontSize: "12px", fontWeight: 700, padding: "8px 14px", borderRadius: "10px", flexShrink: 0 }}>
                <IconWA size={13} /> Falar
              </a>
            </div>

            {rawServices.filter((s: string) => s !== business.main_service).map((s: string, i: number) => (
              <div key={i} className="svc-card" style={{ background: "#fff", borderRadius: "16px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", border: "1.5px solid #f0f0f0", transition: "all .2s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `${color}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                    {serviceEmojis[(i + 1) % serviceEmojis.length]}
                  </div>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "#222" }}>{s}</p>
                </div>
                <a href={buildWhatsAppLink(business.whatsapp, `Olá! Quero saber mais sobre ${s}.`)} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", fontWeight: 700, color: color, border: `1px solid ${color}30`, padding: "6px 12px", borderRadius: "8px", flexShrink: 0, background: `${color}08` }}>
                  Falar →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ POR QUE ESCOLHER ══════════════════════════════════ */}
      <section style={{ padding: "48px 20px", background: "#fff" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.24em", textTransform: "uppercase", color: color, marginBottom: "8px" }}>Por que a gente</p>
          <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#111", letterSpacing: "-0.02em", marginBottom: "20px" }}>Por que escolher a {business.business_name}?</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { icon: "⚡", title: "Atendimento fácil e direto", desc: `Fale direto pelo WhatsApp com a equipe da ${business.business_name}. Sem fila, sem secretária eletrônica.` },
              { icon: "🎯", title: `Especialistas em ${business.main_service}`, desc: `A ${business.business_name} é focada em ${business.main_service} e entende as necessidades de quem busca esse serviço em ${business.city}.` },
              { icon: "📍", title: `Presente em ${business.city}`, desc: `Atendimento local, perto de você. A ${business.business_name} atende em ${business.city} e conhece bem o que o cliente da região precisa.` },
            ].map((item) => (
              <div key={item.title} className="card-lift" style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "#fafafa", borderRadius: "18px", padding: "20px", border: "1.5px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", transition: "all .2s" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#111", marginBottom: "4px" }}>{item.title}</h3>
                  <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HORÁRIO ═══════════════════════════════════════════ */}
      <section style={{ padding: "48px 20px", background: "#f9f9f9" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.24em", textTransform: "uppercase", color: color, marginBottom: "8px" }}>Funcionamento</p>
          <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#111", letterSpacing: "-0.02em", marginBottom: "20px" }}>Horário de atendimento</h2>
          <div style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", border: "1.5px solid #f0f0f0", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            {[
              { day: "Segunda a Sexta", hours: "Consulte disponibilidade", open: true },
              { day: "Sábado",          hours: "Consulte disponibilidade", open: true },
              { day: "Domingo",         hours: "Fechado",                  open: false },
            ].map((row, i) => (
              <div key={row.day} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: i < 2 ? "1px solid #f5f5f5" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: row.open ? "#22c55e" : "#d1d5db", flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>{row.day}</span>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: row.open ? "#111" : "#aaa" }}>{row.hours}</span>
              </div>
            ))}
          </div>
          <a href={waMain} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px", padding: "13px 16px", background: `${color}0c`, borderRadius: "12px", border: `1px solid ${color}20`, color: color, fontSize: "13px", fontWeight: 700 }}>
            <IconClock /> Confirme horários pelo WhatsApp
          </a>
        </div>
      </section>

      {/* ══ LOCALIZAÇÃO ═══════════════════════════════════════ */}
      <section style={{ padding: "48px 20px", background: "#fff" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.24em", textTransform: "uppercase", color: color, marginBottom: "8px" }}>Onde estamos</p>
          <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#111", letterSpacing: "-0.02em", marginBottom: "20px" }}>Localização</h2>
          <div style={{ background: "#f9f9f9", borderRadius: "20px", padding: "24px", border: "1.5px solid #f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "20px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: color, flexShrink: 0 }}>
                <IconPin />
              </div>
              <div>
                <p style={{ fontSize: "16px", fontWeight: 800, color: "#111", marginBottom: "2px" }}>
                  {business.address ?? business.city}
                </p>
                <p style={{ fontSize: "14px", color: "#777", fontWeight: 500 }}>{business.city}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {business.address && (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(`${business.address}, ${business.city}`)}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "140px", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", fontWeight: 700, color: "#333", justifyContent: "center" }}>
                  📍 Ver no mapa
                </a>
              )}
              <a href={waMain} target="_blank" rel="noopener noreferrer" className="wa-btn" style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "140px", background: "#25D366", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", fontWeight: 700, color: "#fff", justifyContent: "center", boxShadow: "0 4px 16px rgba(37,211,102,0.30)", transition: "transform .2s, box-shadow .2s" }}>
                <IconWA size={15} /> Chamar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ═════════════════════════════════════════ */}
      <section style={{ padding: "60px 20px", background: color, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "280px", height: "280px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.10)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "220px", height: "220px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", gap: "2px", marginBottom: "14px" }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ color: "#FFD700" }}><IconStar /></span>)}
          </div>
          <h2 style={{ fontSize: "clamp(24px,6vw,36px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "12px" }}>
            Quer falar com a {business.business_name}?
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.70)", lineHeight: 1.6, marginBottom: "32px" }}>
            Clique no botão abaixo e entre em contato direto pelo WhatsApp. Respondemos rápido.
          </p>
          <a href={waMain} target="_blank" rel="noopener noreferrer" className="wa-btn" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "12px", background: "#fff", color: color, fontWeight: 800, fontSize: "17px", padding: "18px 36px", borderRadius: "16px", boxShadow: "0 8px 30px rgba(0,0,0,0.18)", transition: "transform .2s, box-shadow .2s" }}>
            <IconWA size={20} /> Chamar no WhatsApp
          </a>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.40)", marginTop: "14px" }}>
            Atendimento em {business.city} · Resposta rápida
          </p>
        </div>
      </section>

      {/* ══ LEAD FORM / DEMO PLACEHOLDER ════════════════════════ */}
      <section style={{ padding: "48px 20px", background: "#f9f9f9" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <div style={{ background: "#fff", borderRadius: "24px", padding: "28px", boxShadow: "0 8px 32px rgba(0,0,0,0.06)", border: "1.5px solid #f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🔔</div>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 800, color: color, letterSpacing: "0.18em", textTransform: "uppercase" }}>Fique por dentro</p>
                <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#111" }}>Receba novidades</h3>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "#777", lineHeight: 1.65, margin: "10px 0 20px" }}>
              Deixe seu WhatsApp e avisamos sobre promoções e novidades da {business.business_name}.
            </p>
            {demoMode ? (
              <div style={{ background: "#fffbeb", border: "1px solid #fef08a", borderRadius: "12px", padding: "14px 16px", fontSize: "13px", color: "#92400e", fontWeight: 600 }}>
                👁️ Demo — formulário de leads ativo no site real do cliente
              </div>
            ) : (
              <LeadForm businessId={business.id} kitId={kitId ?? null} primaryColor={color} />
            )}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <footer style={{ background: "#0a0a0a", padding: "36px 20px" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 900, color: "#fff" }}>
            {initial}
          </div>
          <div>
            <p style={{ fontSize: "18px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: "2px" }}>{business.business_name}</p>
            <p style={{ fontSize: "12px", color: "#555" }}>{cfg.label} · {business.city}</p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            <a href={waMain} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#25D366", color: "#fff", fontWeight: 700, fontSize: "13px", padding: "10px 18px", borderRadius: "10px" }}>
              <IconWA size={15} /> WhatsApp
            </a>
            {business.instagram && (
              <a href={`https://instagram.com/${business.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#1a1a1a", border: "1px solid #333", color: "#fff", fontWeight: 700, fontSize: "13px", padding: "10px 18px", borderRadius: "10px" }}>
                <IconIG /> Instagram
              </a>
            )}
          </div>
          <p style={{ fontSize: "11px", color: "#2a2a2a", marginTop: "4px" }}>
            Feito com <span style={{ color: color, fontWeight: 700 }}>MeuNegócio Pro</span>
          </p>
        </div>
      </footer>

      {/* ══ BOTÃO FIXO MOBILE ═════════════════════════════════ */}
      <a href={waMain} target="_blank" rel="noopener noreferrer" className="wa-fixed wa-btn" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, alignItems: "center", justifyContent: "center", gap: "10px", background: "#25D366", color: "#fff", fontWeight: 800, fontSize: "16px", padding: "18px 24px", boxShadow: "0 -4px 24px rgba(37,211,102,0.30)", transition: "opacity .2s" }}>
        <IconWA size={20} /> Chamar no WhatsApp
      </a>
    </div>
  );
}
