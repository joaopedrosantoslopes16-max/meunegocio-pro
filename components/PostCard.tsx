"use client";

export type TemplateId =
  | "whatsapp_cta" | "main_service" | "promotion" | "authority" | "location"
  | "oferta" | "agenda" | "depoimento" | "comparacao" | "strong_cta"
  | "foto_fundo" | "foto_lado" | "card_sobre_foto";

interface Props {
  template_type: TemplateId | string;
  title: string;
  subtitle: string;
  cta: string;
  business_name: string;
  primary_color: string;
  niche?: string;
  city?: string;
  number?: number;
  unlocked?: boolean;
  compact?: boolean;
  backgroundImageUrl?: string;
  overlayOpacity?: number; // 0–1, default 0.55
  fontFamily?: string;
}

const FONT = "'Inter', 'system-ui', sans-serif";

function s(value: number, compact: boolean) { return compact ? Math.round(value * 0.52) : value; }
function px(value: number, compact: boolean) { return `${s(value, compact)}px`; }

function Slide({ bg, children, compact, backgroundImageUrl, overlayOpacity = 0.55, fontFamily }: {
  bg: string; children: React.ReactNode; compact: boolean;
  backgroundImageUrl?: string; overlayOpacity?: number; fontFamily?: string;
}) {
  return (
    <div style={{
      aspectRatio: "1/1",
      background: backgroundImageUrl ? "#111" : bg,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      fontFamily: fontFamily || FONT,
      WebkitFontSmoothing: "antialiased",
    }}>
      {backgroundImageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundImageUrl}
            alt=""
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
            }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: `rgba(0,0,0,${overlayOpacity})`,
            backdropFilter: "blur(0.5px)",
          }} />
        </>
      )}
      {children}
    </div>
  );
}

const Icons = {
  whatsapp: (size: number, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  ),
  star: (size: number, color = "#FFD700") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
  ),
  pin: (size: number, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
  ),
  calendar: (size: number, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  arrow: (size: number, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
  ),
  check: (size: number, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  zap: (size: number, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  quote: (size: number, color = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill={color}><path d="M13.3 23.2c.5-.1 1-.2 1.6-.2 3.8 0 6.9 3.1 6.9 6.9S18.7 36.8 14.9 36.8 8 33.7 8 29.9c0-.6.1-1.2.2-1.8L11 13h6l-3.7 10.2zm22 0c.5-.1 1-.2 1.6-.2 3.8 0 6.9 3.1 6.9 6.9s-3.1 6.9-6.9 6.9-6.9-3.1-6.9-6.9c0-.6.1-1.2.2-1.8L33 13h6l-3.7 10.2z"/></svg>
  ),
};

function Locked({ number, compact }: { number?: number; compact: boolean }) {
  const p = (v: number) => px(v, compact);
  return (
    <div style={{ aspectRatio: "1/1", background: "#f1f1f1", borderRadius: p(16), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: p(6) }}>
      <div style={{ width: p(36), height: p(36), borderRadius: p(10), background: "#e5e5e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={p(16)} height={p(16)} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
      </div>
      <span style={{ fontSize: p(11), color: "#aaa", fontWeight: 600, fontFamily: FONT }}>{number ? `Post #${number}` : "Bloqueado"}</span>
    </div>
  );
}

// ── 1. WHATSAPP CTA ──────────────────────────────────────────
function WhatsAppCTA({ title, subtitle, cta, business_name, color, city, c: compact, bgImg, ov, font }: any) {
  const p = (v: number) => px(v, compact);
  const pad = s(32, compact);
  return (
    <Slide bg="#0A0D14" compact={compact} backgroundImageUrl={bgImg} overlayOpacity={ov ?? (bgImg ? 0.65 : undefined)} fontFamily={font}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", width: px(400, compact), height: px(400, compact), borderRadius: "50%", background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`, pointerEvents: "none" }} />
      {!bgImg && <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }} viewBox="0 0 400 400">{Array.from({ length: 9 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="white" strokeWidth="0.5"/>)}{Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="400" stroke="white" strokeWidth="0.5"/>)}</svg>}
      <div style={{ padding: `${pad}px`, display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: px(24, compact) }}>
          <div style={{ background: "#25D36620", border: "1px solid #25D36640", borderRadius: px(100, compact), padding: `${s(5,compact)}px ${s(12,compact)}px`, display: "flex", alignItems: "center", gap: px(6,compact) }}>
            {Icons.whatsapp(s(12, compact), "#25D366")}
            <span style={{ fontSize: px(10,compact), fontWeight: 800, color: "#25D366", letterSpacing: "0.16em", textTransform: "uppercase" }}>WhatsApp</span>
          </div>
          {city && <span style={{ fontSize: px(10,compact), color: "rgba(255,255,255,0.30)", fontWeight: 600 }}>{city}</span>}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ width: px(36,compact), height: px(3,compact), background: color, borderRadius: px(2,compact), marginBottom: px(20,compact) }} />
          <h2 style={{ fontSize: px(32,compact), fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: px(10,compact) }}>{title}</h2>
          <p style={{ fontSize: px(14,compact), color: "rgba(255,255,255,0.75)", fontWeight: 500, lineHeight: 1.5, marginBottom: px(24,compact), maxWidth: "85%" }}>{subtitle}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: px(8,compact), background: "#25D366", color: "#fff", padding: `${s(12,compact)}px ${s(20,compact)}px`, borderRadius: px(10,compact), width: "fit-content", boxShadow: "0 4px 16px rgba(37,211,102,0.35)" }}>
            {Icons.whatsapp(s(14, compact), "#fff")}
            <span style={{ fontSize: px(13,compact), fontWeight: 800 }}>{cta}</span>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: px(14,compact), display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: px(11,compact), color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>{business_name}</span>
          <span style={{ fontSize: px(10,compact), color: "rgba(255,255,255,0.20)", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>→</span>
        </div>
      </div>
    </Slide>
  );
}

// ── 2. MAIN SERVICE ──────────────────────────────────────────
function MainService({ title, subtitle, cta, business_name, color, niche, c: compact, bgImg, ov, font }: any) {
  const p = (v: number) => px(v, compact);
  const pad = s(28, compact);
  return (
    <Slide bg="#0D0D0D" compact={compact} backgroundImageUrl={bgImg} overlayOpacity={ov ?? (bgImg ? 0.65 : undefined)} fontFamily={font}>
      {!bgImg && <>
        <div style={{ position: "absolute", top: 0, right: 0, width: px(280, compact), height: px(280, compact), background: `radial-gradient(circle at top right, ${color}28 0%, transparent 65%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: px(3, compact), height: "45%", background: `linear-gradient(180deg, ${color} 0%, transparent 100%)` }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "45%", height: px(3, compact), background: `linear-gradient(90deg, ${color} 0%, transparent 100%)` }} />
      </>}
      <div style={{ padding: `${pad}px`, display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: px(20, compact) }}>
          {niche && <div style={{ background: `${color}30`, border: `1px solid ${color}50`, borderRadius: px(100,compact), padding: `${s(5,compact)}px ${s(12,compact)}px` }}>
            <span style={{ fontSize: px(10,compact), fontWeight: 800, color, letterSpacing: "0.18em", textTransform: "uppercase" }}>{niche}</span>
          </div>}
          <div style={{ width: px(28, compact), height: px(28, compact), borderRadius: px(8,compact), background: `${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: px(13, compact), fontWeight: 900, color }}>#1</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ fontSize: px(11,compact), fontWeight: 700, color: `${color}bb`, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: px(10,compact) }}>Destaque</p>
          <h2 style={{ fontSize: px(36,compact), fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 0.96, marginBottom: px(14,compact) }}>{title}</h2>
          <div style={{ width: px(48, compact), height: px(2, compact), background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`, borderRadius: px(2,compact), marginBottom: px(14,compact) }} />
          <p style={{ fontSize: px(13,compact), color: "rgba(255,255,255,0.70)", fontWeight: 500, lineHeight: 1.55, maxWidth: "88%" }}>{subtitle}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid rgba(255,255,255,0.07)`, paddingTop: px(14,compact) }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: px(8,compact), background: color, color: "#fff", padding: `${s(9,compact)}px ${s(16,compact)}px`, borderRadius: px(10,compact), boxShadow: `0 4px 16px ${color}50` }}>
            <span style={{ fontSize: px(11,compact), fontWeight: 800, letterSpacing: "0.10em", textTransform: "uppercase" }}>{cta}</span>
            {Icons.arrow(s(12, compact), "#fff")}
          </div>
          <span style={{ fontSize: px(10,compact), color: "rgba(255,255,255,0.22)", fontWeight: 600 }}>{business_name}</span>
        </div>
      </div>
    </Slide>
  );
}

// ── 3. PROMOTION ─────────────────────────────────────────────
function Promotion({ title, subtitle, cta, business_name, color, c: compact, bgImg, ov, font }: any) {
  const p = (v: number) => px(v, compact);
  const pad = s(32, compact);
  return (
    <Slide bg={`linear-gradient(145deg, #0A0D14 0%, ${color}cc 100%)`} compact={compact} backgroundImageUrl={bgImg} overlayOpacity={ov ?? (bgImg ? 0.60 : undefined)} fontFamily={font}>
      {!bgImg && <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }} viewBox="0 0 400 400">{Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 50 - 100} y1="0" x2={i * 50 + 300} y2="400" stroke="white" strokeWidth="1.5"/>)}</svg>}
      <div style={{ padding: `${pad}px`, display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: px(6,compact), marginBottom: px(20,compact) }}>
          <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: px(100,compact), padding: `${s(6,compact)}px ${s(12,compact)}px`, display: "flex", alignItems: "center", gap: px(5,compact) }}>
            {Icons.zap(s(10,compact), "#FFD700")}
            <span style={{ fontSize: px(10,compact), fontWeight: 800, color: "#fff", letterSpacing: "0.20em", textTransform: "uppercase" }}>Promoção</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ width: px(40,compact), height: px(3,compact), background: "rgba(255,255,255,0.4)", borderRadius: px(2,compact), marginBottom: px(16,compact) }} />
          <h2 style={{ fontSize: px(36,compact), fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 0.98, marginBottom: px(12,compact) }}>{title}</h2>
          <p style={{ fontSize: px(14,compact), color: "rgba(255,255,255,0.80)", fontWeight: 500, lineHeight: 1.5, marginBottom: px(24,compact) }}>{subtitle}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: px(8,compact), background: "#fff", color: "#111", padding: `${s(12,compact)}px ${s(20,compact)}px`, borderRadius: px(10,compact), width: "fit-content", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            <span style={{ fontSize: px(13,compact), fontWeight: 800 }}>{cta}</span>
            {Icons.arrow(s(14,compact), "#111")}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: px(14,compact) }}>
          <span style={{ fontSize: px(11,compact), color: "rgba(255,255,255,0.30)", fontWeight: 600 }}>{business_name}</span>
        </div>
      </div>
    </Slide>
  );
}

// ── 4. AUTHORITY ─────────────────────────────────────────────
function Authority({ title, subtitle, cta, business_name, color, c: compact, bgImg, ov, font }: any) {
  const p = (v: number) => px(v, compact);
  const pad = s(28, compact);
  return (
    <Slide bg="#fff" compact={compact} backgroundImageUrl={bgImg} overlayOpacity={ov ?? (bgImg ? 0.55 : undefined)} fontFamily={font}>
      {!bgImg && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: px(80, compact), background: `linear-gradient(180deg, ${color}f0 0%, ${color}c0 100%)` }} />}
      <div style={{ padding: `${pad}px`, paddingLeft: bgImg ? `${pad}px` : `${s(80, compact) + s(20, compact)}px`, display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: px(16, compact) }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: px(5,compact), background: bgImg ? `${color}80` : `${color}14`, border: `1px solid ${color}50`, borderRadius: px(8,compact), padding: `${s(5,compact)}px ${s(10,compact)}px` }}>
            <span style={{ fontSize: px(9,compact), fontWeight: 900, color: bgImg ? "#fff" : color, letterSpacing: "0.24em", textTransform: "uppercase" }}>Dica</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: px(30,compact), fontWeight: 900, color: bgImg ? "#fff" : "#111", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: px(12,compact) }}>{title}</h2>
          <div style={{ width: px(32, compact), height: px(3, compact), background: color, borderRadius: px(2,compact), marginBottom: px(12,compact) }} />
          <p style={{ fontSize: px(13,compact), color: bgImg ? "rgba(255,255,255,0.80)" : "#555", fontWeight: 500, lineHeight: 1.6 }}>{subtitle}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: px(14,compact), borderTop: `1px solid ${bgImg ? "rgba(255,255,255,0.15)" : "#f0f0f0"}` }}>
          <span style={{ fontSize: px(10,compact), color: bgImg ? "rgba(255,255,255,0.40)" : "#bbb", fontWeight: 600 }}>{business_name}</span>
          <div style={{ display: "inline-flex", alignItems: "center", gap: px(5,compact), background: `${color}`, borderRadius: px(100,compact), padding: `${s(6,compact)}px ${s(12,compact)}px` }}>
            <span style={{ fontSize: px(10,compact), fontWeight: 800, color: "#fff", letterSpacing: "0.12em", textTransform: "uppercase" }}>{cta}</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// ── 5. LOCATION ──────────────────────────────────────────────
function Location({ title, subtitle, cta, business_name, color, city, c: compact, bgImg, ov, font }: any) {
  const p = (v: number) => px(v, compact);
  const pad = s(32, compact);
  return (
    <Slide bg="#181C24" compact={compact} backgroundImageUrl={bgImg} overlayOpacity={ov ?? (bgImg ? 0.60 : undefined)} fontFamily={font}>
      {!bgImg && city && <div style={{ position: "absolute", bottom: px(40, compact), left: 0, right: 0, textAlign: "center", fontSize: px(90, compact), fontWeight: 900, color: "rgba(255,255,255,0.025)", letterSpacing: "-0.04em", lineHeight: 1, pointerEvents: "none", userSelect: "none", fontFamily: FONT }}>{city.toUpperCase()}</div>}
      <div style={{ padding: `${pad}px`, display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: px(8, compact), marginBottom: px(16, compact) }}>
          {Icons.pin(s(16, compact), color)}
          <span style={{ fontSize: px(11, compact), fontWeight: 800, color, letterSpacing: "0.22em", textTransform: "uppercase" }}>Localização</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ width: px(40, compact), height: px(3, compact), background: color, borderRadius: px(2, compact), marginBottom: px(16, compact) }} />
          <h2 style={{ fontSize: px(32, compact), fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: px(10, compact) }}>{title}</h2>
          <p style={{ fontSize: px(14, compact), color: "rgba(255,255,255,0.70)", fontWeight: 500, lineHeight: 1.5, marginBottom: px(24, compact) }}>{subtitle}</p>
          {city && <p style={{ fontSize: px(13, compact), color: `${color}cc`, fontWeight: 700 }}>{city}</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: px(14, compact) }}>
          <span style={{ fontSize: px(10, compact), background: `${color}25`, border: `1px solid ${color}40`, color, padding: `${s(5,compact)}px ${s(10,compact)}px`, borderRadius: px(6, compact), fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" }}>{cta}</span>
          <span style={{ fontSize: px(10, compact), color: "rgba(255,255,255,0.20)", fontWeight: 600 }}>{business_name}</span>
        </div>
      </div>
    </Slide>
  );
}

// ── 6. OFERTA ────────────────────────────────────────────────
function Oferta({ title, subtitle, cta, business_name, color, c: compact, bgImg, ov, font }: any) {
  const p = (v: number) => px(v, compact);
  const pad = s(32, compact);
  return (
    <Slide bg="#0A0D14" compact={compact} backgroundImageUrl={bgImg} overlayOpacity={ov ?? (bgImg ? 0.65 : undefined)} fontFamily={font}>
      {!bgImg && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: px(6, compact), background: `linear-gradient(180deg, ${color} 0%, ${color}55 100%)` }} />}
      <div style={{ padding: `${pad}px ${pad}px ${pad}px ${bgImg ? pad : pad + s(10,compact)}px`, display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: px(6,compact), background: color, borderRadius: px(8,compact), padding: `${s(6,compact)}px ${s(12,compact)}px`, width: "fit-content", marginBottom: px(16,compact) }}>
          {Icons.zap(s(10,compact), "#fff")}
          <span style={{ fontSize: px(10,compact), fontWeight: 900, color: "#fff", letterSpacing: "0.20em", textTransform: "uppercase" }}>Oferta</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: px(34,compact), fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: px(12,compact) }}>{title}</h2>
          <div style={{ width: px(48,compact), height: px(2,compact), background: color, borderRadius: px(2,compact), marginBottom: px(12,compact) }} />
          <p style={{ fontSize: px(14,compact), color: "rgba(255,255,255,0.70)", fontWeight: 500, lineHeight: 1.5, marginBottom: px(24,compact) }}>{subtitle}</p>
          {[{icon: Icons.check, label: "Qualidade garantida"}, {icon: Icons.check, label: "Atendimento personalizado"}].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: px(8,compact), marginBottom: px(8,compact) }}>
              <div style={{ width: px(16,compact), height: px(16,compact), borderRadius: px(4,compact), background: `${color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.icon(s(10,compact), color)}
              </div>
              <span style={{ fontSize: px(12,compact), color: "rgba(255,255,255,0.60)", fontWeight: 500 }}>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: px(14,compact), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: px(6,compact), color, fontSize: px(12,compact), fontWeight: 800 }}>
            {cta} {Icons.arrow(s(12,compact), color)}
          </div>
          <span style={{ fontSize: px(10,compact), color: "rgba(255,255,255,0.20)", fontWeight: 600 }}>{business_name}</span>
        </div>
      </div>
    </Slide>
  );
}

// ── 7. AGENDA ────────────────────────────────────────────────
function Agenda({ title, subtitle, cta, business_name, color, c: compact, bgImg, ov, font }: any) {
  const p = (v: number) => px(v, compact);
  const pad = s(28, compact);
  const days = [
    { d: "Seg", slots: "09h · 14h · 17h", active: true },
    { d: "Ter", slots: "10h · 15h",       active: true },
    { d: "Qua", slots: "09h · 11h · 16h", active: true },
    { d: "Qui", slots: "14h disponível",   active: false },
    { d: "Sex", slots: "Quase lotado",     active: false },
  ];
  return (
    <Slide bg="#0D1117" compact={compact} backgroundImageUrl={bgImg} overlayOpacity={ov ?? (bgImg ? 0.75 : undefined)} fontFamily={font}>
      {!bgImg && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: px(3, compact), background: `linear-gradient(90deg, ${color} 0%, ${color}55 100%)` }} />}
      <div style={{ padding: `${pad}px`, paddingTop: `${s(32, compact)}px`, display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: px(18, compact) }}>
          <div style={{ display: "flex", alignItems: "center", gap: px(8, compact) }}>
            {Icons.calendar(s(16, compact), color)}
            <span style={{ fontSize: px(10,compact), fontWeight: 800, color, letterSpacing: "0.20em", textTransform: "uppercase" }}>Agenda</span>
          </div>
          <div style={{ background: "#22c55e20", border: "1px solid #22c55e40", borderRadius: px(100,compact), padding: `${s(4,compact)}px ${s(10,compact)}px`, display: "flex", alignItems: "center", gap: px(5,compact) }}>
            <div style={{ width: px(5,compact), height: px(5,compact), borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ fontSize: px(9,compact), fontWeight: 800, color: "#22c55e" }}>Aberto</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: px(26, compact), fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: px(14, compact) }}>{title}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: px(6, compact), marginBottom: px(16, compact) }}>
            {days.map((item) => (
              <div key={item.d} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: item.active ? `${color}18` : "rgba(255,255,255,0.04)", border: `1px solid ${item.active ? color + "35" : "rgba(255,255,255,0.06)"}`, borderRadius: px(8, compact), padding: `${s(7,compact)}px ${s(10,compact)}px` }}>
                <span style={{ fontSize: px(11, compact), fontWeight: 800, color: item.active ? "#fff" : "rgba(255,255,255,0.30)", width: px(26, compact) }}>{item.d}</span>
                <span style={{ fontSize: px(11, compact), fontWeight: 500, color: item.active ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.20)", flex: 1, textAlign: "center" }}>{item.slots}</span>
                {item.active && <div style={{ width: px(6, compact), height: px(6, compact), borderRadius: "50%", background: color }} />}
              </div>
            ))}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: px(7, compact), background: "#25D366", color: "#fff", padding: `${s(11,compact)}px ${s(16,compact)}px`, borderRadius: px(10, compact), width: "fit-content", boxShadow: "0 4px 16px rgba(37,211,102,0.35)" }}>
            {Icons.whatsapp(s(13, compact), "#fff")}
            <span style={{ fontSize: px(12, compact), fontWeight: 800 }}>{cta}</span>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: px(12, compact) }}>
          <span style={{ fontSize: px(10, compact), color: "rgba(255,255,255,0.18)", fontWeight: 600 }}>{business_name}</span>
        </div>
      </div>
    </Slide>
  );
}

// ── 8. DEPOIMENTO ────────────────────────────────────────────
function Depoimento({ title, subtitle, cta, business_name, color, city, c: compact, bgImg, ov, font }: any) {
  const p = (v: number) => px(v, compact);
  const pad = s(32, compact);
  return (
    <Slide bg={`linear-gradient(160deg, ${color}f5 0%, ${color}cc 100%)`} compact={compact} backgroundImageUrl={bgImg} overlayOpacity={ov ?? (bgImg ? 0.55 : undefined)} fontFamily={font}>
      <div style={{ padding: `${pad}px`, display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: px(3, compact), marginBottom: px(20, compact) }}>
          {Array.from({ length: 5 }, (_, i) => <span key={i}>{Icons.star(s(14, compact))}</span>)}
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: px(-8, compact), left: px(-4, compact), opacity: 0.20 }}>{Icons.quote(s(32, compact), "#fff")}</div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: px(8, compact) }}>
            <p style={{ fontSize: px(20, compact), fontWeight: 700, color: "#fff", lineHeight: 1.4, letterSpacing: "-0.02em", marginBottom: px(20, compact) }}>"{title}"</p>
            <p style={{ fontSize: px(13, compact), color: "rgba(255,255,255,0.80)", fontWeight: 500, lineHeight: 1.5, marginBottom: px(20, compact) }}>{subtitle}</p>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.20)", borderRadius: px(12, compact), padding: `${s(12,compact)}px ${s(16,compact)}px`, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: px(16, compact) }}>
          <div>
            <p style={{ fontSize: px(12, compact), fontWeight: 800, color: "#fff" }}>Cliente satisfeito</p>
            <p style={{ fontSize: px(11, compact), color: "rgba(255,255,255,0.60)", fontWeight: 500 }}>{city || "Brasil"}</p>
          </div>
          <div style={{ display: "flex", gap: px(2,compact) }}>{Array.from({ length: 5 }, (_, i) => <span key={i}>{Icons.star(s(10, compact))}</span>)}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: px(11, compact), fontWeight: 800, color: "rgba(255,255,255,0.50)" }}>{business_name}</span>
          <span style={{ fontSize: px(11, compact), fontWeight: 700, color: "rgba(255,255,255,0.60)", letterSpacing: "0.10em", textTransform: "uppercase" }}>{cta}</span>
        </div>
      </div>
    </Slide>
  );
}

// ── 9. COMPARAÇÃO ────────────────────────────────────────────
function Comparacao({ title, subtitle, cta, business_name, color, c: compact, bgImg, ov, font }: any) {
  const p = (v: number) => px(v, compact);
  const pad = s(28, compact);
  return (
    <Slide bg="#fff" compact={compact} backgroundImageUrl={bgImg} overlayOpacity={ov ?? (bgImg ? 0.80 : undefined)} fontFamily={font}>
      <div style={{ padding: `${pad}px`, display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: px(12, compact), marginBottom: px(16, compact) }}>
          <div style={{ background: bgImg ? "rgba(255,255,255,0.15)" : "#f5f5f5", borderRadius: px(8, compact), padding: `${s(8,compact)}px`, textAlign: "center" }}>
            <span style={{ fontSize: px(10, compact), fontWeight: 800, color: bgImg ? "rgba(255,255,255,0.60)" : "#aaa", letterSpacing: "0.18em", textTransform: "uppercase" }}>Sem nós</span>
          </div>
          <div style={{ background: bgImg ? `${color}50` : `${color}15`, borderRadius: px(8, compact), padding: `${s(8,compact)}px`, textAlign: "center" }}>
            <span style={{ fontSize: px(10, compact), fontWeight: 800, color: bgImg ? "#fff" : color, letterSpacing: "0.18em", textTransform: "uppercase" }}>Com a gente</span>
          </div>
        </div>
        {[["Sem plano", "Com plano mensal"], ["Improvisa", "Conteúdo pronto"], ["Perde clientes", "Fideliza clientes"]].map(([antes, depois], i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: px(8, compact), marginBottom: px(8, compact) }}>
            <div style={{ background: bgImg ? "rgba(255,255,255,0.08)" : "#fafafa", borderRadius: px(8, compact), padding: `${s(8,compact)}px ${s(10,compact)}px`, display: "flex", alignItems: "center", gap: px(6,compact) }}>
              <div style={{ width: px(4, compact), height: px(4, compact), borderRadius: "50%", background: bgImg ? "rgba(255,255,255,0.30)" : "#ddd", flexShrink: 0 }} />
              <span style={{ fontSize: px(11, compact), color: bgImg ? "rgba(255,255,255,0.50)" : "#aaa", fontWeight: 600 }}>{antes}</span>
            </div>
            <div style={{ background: bgImg ? `${color}40` : `${color}10`, border: `1px solid ${color}30`, borderRadius: px(8, compact), padding: `${s(8,compact)}px ${s(10,compact)}px`, display: "flex", alignItems: "center", gap: px(6,compact) }}>
              {Icons.check(s(10,compact), color)}
              <span style={{ fontSize: px(11, compact), color: bgImg ? "#fff" : "#333", fontWeight: 700 }}>{depois}</span>
            </div>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ background: color, borderRadius: px(10, compact), padding: `${s(12,compact)}px`, display: "flex", alignItems: "center", justifyContent: "center", gap: px(8, compact), marginTop: px(12, compact) }}>
          {Icons.arrow(s(14, compact), "#fff")}
          <span style={{ fontSize: px(13, compact), fontWeight: 800, color: "#fff" }}>{cta}</span>
        </div>
        <div style={{ marginTop: px(10, compact), textAlign: "center" }}>
          <span style={{ fontSize: px(10, compact), color: bgImg ? "rgba(255,255,255,0.30)" : "#ccc", fontWeight: 600 }}>{business_name}</span>
        </div>
      </div>
    </Slide>
  );
}

// ── 10. STRONG CTA ───────────────────────────────────────────
function StrongCTA({ title, subtitle, cta, business_name, color, c: compact, bgImg, ov, font }: any) {
  const p = (v: number) => px(v, compact);
  const pad = s(32, compact);
  return (
    <Slide bg="#0A0D14" compact={compact} backgroundImageUrl={bgImg} overlayOpacity={ov ?? (bgImg ? 0.60 : undefined)} fontFamily={font}>
      {!bgImg && <>
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: px(340, compact), height: px(340, compact), borderRadius: "50%", background: `radial-gradient(circle, ${color}20 0%, transparent 65%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: px(300, compact), height: px(300, compact), borderRadius: "50%", border: `1px solid ${color}15`, pointerEvents: "none" }} />
      </>}
      <div style={{ padding: `${pad}px`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", position: "relative", zIndex: 1, textAlign: "center" }}>
        <p style={{ fontSize: px(10,compact), fontWeight: 800, color, letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: px(16,compact) }}>{business_name}</p>
        <div style={{ width: px(36, compact), height: px(3, compact), background: color, borderRadius: px(2, compact), margin: `0 auto ${px(20, compact)}` }} />
        <h2 style={{ fontSize: px(36, compact), fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: px(12, compact) }}>{title}</h2>
        <p style={{ fontSize: px(14, compact), color: "rgba(255,255,255,0.65)", fontWeight: 500, lineHeight: 1.5, marginBottom: px(32, compact), maxWidth: "80%" }}>{subtitle}</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: px(8, compact), background: "#25D366", color: "#fff", padding: `${s(14,compact)}px ${s(24,compact)}px`, borderRadius: px(12, compact), boxShadow: "0 4px 24px rgba(37,211,102,0.35)" }}>
          {Icons.whatsapp(s(15, compact), "#fff")}
          <span style={{ fontSize: px(14, compact), fontWeight: 800 }}>{cta}</span>
        </div>
      </div>
    </Slide>
  );
}

// ── 11. FOTO FUNDO (template novo com imagem obrigatória) ─────
function FotoFundo({ title, subtitle, cta, business_name, color, c: compact, bgImg, ov, font }: any) {
  const p = (v: number) => px(v, compact);
  const pad = s(28, compact);
  return (
    <Slide bg="#111" compact={compact} backgroundImageUrl={bgImg ?? undefined} overlayOpacity={ov ?? 0.50} fontFamily={font}>
      {/* Gradiente inferior para legibilidade */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)", zIndex: 1, pointerEvents: "none" }} />
      <div style={{ padding: `${pad}px`, display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 2 }}>
        {/* Badge topo */}
        <div style={{ display: "inline-flex", alignItems: "center", background: `${color}dd`, borderRadius: px(100,compact), padding: `${s(5,compact)}px ${s(12,compact)}px`, width: "fit-content" }}>
          <span style={{ fontSize: px(10,compact), fontWeight: 800, color: "#fff", letterSpacing: "0.18em", textTransform: "uppercase" }}>{business_name}</span>
        </div>
        <div style={{ flex: 1 }} />
        {/* Conteúdo na base */}
        <div>
          <h2 style={{ fontSize: px(32,compact), fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: px(8,compact), textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{title}</h2>
          <p style={{ fontSize: px(13,compact), color: "rgba(255,255,255,0.80)", fontWeight: 500, lineHeight: 1.5, marginBottom: px(16,compact) }}>{subtitle}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: px(8,compact), background: color, color: "#fff", padding: `${s(11,compact)}px ${s(18,compact)}px`, borderRadius: px(10,compact), boxShadow: `0 4px 16px ${color}50` }}>
            <span style={{ fontSize: px(12,compact), fontWeight: 800 }}>{cta}</span>
            {Icons.arrow(s(13,compact), "#fff")}
          </div>
        </div>
      </div>
    </Slide>
  );
}

// ── 12. FOTO LADO (imagem à direita) ─────────────────────────
function FotoLado({ title, subtitle, cta, business_name, color, c: compact, bgImg, ov, font }: any) {
  const p = (v: number) => px(v, compact);
  const pad = s(24, compact);
  return (
    <Slide bg="#fff" compact={compact} fontFamily={font}>
      {/* Layout split */}
      <div style={{ display: "flex", height: "100%", position: "relative" }}>
        {/* Lado esquerdo — texto */}
        <div style={{ width: "55%", padding: `${pad}px`, display: "flex", flexDirection: "column", background: "#fff", position: "relative", zIndex: 1 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ width: px(28,compact), height: px(3,compact), background: color, borderRadius: px(2,compact), marginBottom: px(12,compact) }} />
            <h2 style={{ fontSize: px(22,compact), fontWeight: 900, color: "#111", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: px(8,compact) }}>{title}</h2>
            <p style={{ fontSize: px(11,compact), color: "#666", fontWeight: 500, lineHeight: 1.55, marginBottom: px(16,compact) }}>{subtitle}</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: px(5,compact), background: color, color: "#fff", padding: `${s(8,compact)}px ${s(12,compact)}px`, borderRadius: px(8,compact) }}>
              <span style={{ fontSize: px(10,compact), fontWeight: 800 }}>{cta}</span>
              {Icons.arrow(s(10,compact), "#fff")}
            </div>
          </div>
          <span style={{ fontSize: px(9,compact), color: "#ccc", fontWeight: 600 }}>{business_name}</span>
        </div>
        {/* Lado direito — imagem */}
        <div style={{ width: "45%", position: "relative", overflow: "hidden" }}>
          {bgImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bgImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg, ${color}dd 0%, ${color}88 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: px(40,compact), opacity: 0.4 }}>📸</span>
            </div>
          )}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: px(20,compact), background: "linear-gradient(to right, #fff, transparent)" }} />
        </div>
      </div>
    </Slide>
  );
}

// ── 13. CARD SOBRE FOTO ──────────────────────────────────────
function CardSobreFoto({ title, subtitle, cta, business_name, color, c: compact, bgImg, ov, font }: any) {
  const p = (v: number) => px(v, compact);
  const pad = s(20, compact);
  return (
    <Slide bg="#111" compact={compact} backgroundImageUrl={bgImg ?? undefined} overlayOpacity={ov ?? 0.40} fontFamily={font}>
      <div style={{ padding: `${pad}px`, display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 1, justifyContent: "flex-end" }}>
        {/* Card sobre a foto */}
        <div style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(16px)",
          borderRadius: px(16,compact),
          padding: `${s(18,compact)}px ${s(20,compact)}px`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: px(8,compact), marginBottom: px(10,compact) }}>
            <div style={{ width: px(4,compact), height: px(20,compact), background: color, borderRadius: px(2,compact) }} />
            <span style={{ fontSize: px(10,compact), fontWeight: 800, color, letterSpacing: "0.20em", textTransform: "uppercase" }}>{business_name}</span>
          </div>
          <h2 style={{ fontSize: px(22,compact), fontWeight: 900, color: "#111", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: px(6,compact) }}>{title}</h2>
          <p style={{ fontSize: px(11,compact), color: "#666", fontWeight: 500, lineHeight: 1.5, marginBottom: px(14,compact) }}>{subtitle}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: px(6,compact), background: color, color: "#fff", padding: `${s(9,compact)}px ${s(14,compact)}px`, borderRadius: px(8,compact), boxShadow: `0 4px 12px ${color}40` }}>
            <span style={{ fontSize: px(11,compact), fontWeight: 800 }}>{cta}</span>
            {Icons.arrow(s(11,compact), "#fff")}
          </div>
        </div>
      </div>
    </Slide>
  );
}

// ══════════════════════════════════════════════════════════════
// EXPORT
// ══════════════════════════════════════════════════════════════
export default function PostCard({
  template_type, title, subtitle, cta, business_name, primary_color,
  niche, city, number, unlocked = true, compact = false,
  backgroundImageUrl, overlayOpacity, fontFamily,
}: Props) {
  if (!unlocked) return <Locked number={number} compact={compact} />;

  const color = primary_color || "#7c3aed";
  const props = {
    title, subtitle, cta, business_name,
    color, niche, city,
    c: compact,
    bgImg: backgroundImageUrl,
    ov: overlayOpacity,
    font: fontFamily || FONT,
  };

  switch (template_type) {
    case "whatsapp_cta":  return <WhatsAppCTA  {...props} />;
    case "promotion":     return <Promotion    {...props} />;
    case "authority":     return <Authority    {...props} />;
    case "location":      return <Location     {...props} />;
    case "oferta":        return <Oferta       {...props} />;
    case "agenda":        return <Agenda       {...props} />;
    case "depoimento":    return <Depoimento   {...props} />;
    case "comparacao":    return <Comparacao   {...props} />;
    case "strong_cta":    return <StrongCTA    {...props} />;
    case "foto_fundo":    return <FotoFundo    {...props} />;
    case "foto_lado":     return <FotoLado     {...props} />;
    case "card_sobre_foto": return <CardSobreFoto {...props} />;
    case "main_service":
    default:              return <MainService  {...props} />;
  }
}
