"use client";

import type { PremiumCarouselSlide, CarouselLayout } from "@/types";

// ─── Canonical dimensions ────────────────────────────────────
export const SLIDE_W = 1080;
export const SLIDE_H_45 = 1350;
export const SLIDE_H_11 = 1080;
export const SLIDE_H_916 = 1920;

function slideHeight(format: "4/5" | "1/1" | "9/16"): number {
  if (format === "1/1")  return SLIDE_H_11;
  if (format === "9/16") return SLIDE_H_916;
  return SLIDE_H_45;
}

// ─── Color helpers ────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  try {
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  } catch { return [124, 58, 237]; }
}

function isDark(hex: string): boolean {
  const [r,g,b] = hexToRgb(hex);
  return (r*299 + g*587 + b*114) / 1000 < 128;
}

function tint(hex: string, amt: number): string {
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const [r,g,b] = hexToRgb(hex);
  return `#${[r,g,b].map(c => clamp(c+amt).toString(16).padStart(2,"0")).join("")}`;
}

function shade(hex: string, pct: number): string {
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const [r,g,b] = hexToRgb(hex);
  return `#${[r,g,b].map(c => clamp(Math.round(c*(1+pct/100))).toString(16).padStart(2,"0")).join("")}`;
}

function rgba(hex: string, alpha: number): string {
  const [r,g,b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Typography scale (canonical px) ─────────────────────────
const T = {
  display:  "112px",
  h1:       "84px",
  h2:       "68px",
  h3:       "52px",
  h4:       "40px",
  body:     "32px",
  caption:  "26px",
  small:    "22px",
  badge:    "20px",
  eyebrow:  "20px",
};

const WEIGHT = {
  black:    900,
  extrabold:800,
  bold:     700,
  semibold: 600,
  medium:   500,
  regular:  400,
  light:    300,
};

// ─── WhatsApp SVG icon ────────────────────────────────────────
function WhatsAppIcon({ size, color = "currentColor" }: { size: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

// ─── Slide background image ───────────────────────────────────
function BgImage({ url, overlay }: { url?: string; overlay: string }) {
  if (!url) return null;
  return (
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: `url(${url})`,
      backgroundSize: "cover",
      backgroundPosition: "center center",
    }}>
      <div style={{ position: "absolute", inset: 0, background: overlay }} />
    </div>
  );
}

// ─── Business pill (top bar) ──────────────────────────────────
function BusinessPill({ name, color, textOnDark }: { name: string; color: string; textOnDark: boolean }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "12px",
      background: rgba(color, 0.18),
      border: `1.5px solid ${rgba(color, 0.35)}`,
      borderRadius: "100px", padding: "10px 28px",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: T.small, fontWeight: WEIGHT.semibold, color: textOnDark ? "rgba(255,255,255,0.9)" : "#111", letterSpacing: "0.5px" }}>
        {name}
      </span>
    </div>
  );
}

// ─── Badge (number/label pill) ────────────────────────────────
function Badge({ text, color }: { text: string; color: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: color, color: isDark(color) ? "#fff" : "#111",
      borderRadius: "14px", padding: "10px 24px", minWidth: "64px",
      fontSize: T.badge, fontWeight: WEIGHT.black, letterSpacing: "1px",
    }}>
      {text}
    </div>
  );
}

// ─── Accent line ──────────────────────────────────────────────
function AccentLine({ color, width = 72 }: { color: string; width?: number }) {
  return <div style={{ width: `${width}px`, height: "5px", background: color, borderRadius: "3px" }} />;
}

// ─── Check item (for content_list) ───────────────────────────
function CheckItem({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "22px" }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "50%", background: rgba(color, 0.15),
        border: `2px solid ${rgba(color, 0.4)}`, display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: "2px",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <span style={{ fontSize: T.body, fontWeight: WEIGHT.medium, color: "inherit", lineHeight: "1.4" }}>{text}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  LAYOUTS
// ════════════════════════════════════════════════════════════

function CoverHero({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const hasImage = !!slide.imageUrl;

  return (
    <div style={{ position: "absolute", inset: 0, background: "#06060e", fontFamily: font, overflow: "hidden" }}>
      {hasImage ? (
        <>
          {/* Full-bleed photo — visible in the top 65%, vignette only at bottom */}
          <img src={slide.imageUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.14) 42%, rgba(0,0,0,0.74) 68%, rgba(0,0,0,0.97) 100%)" }} />
        </>
      ) : (
        <>
          {/* No image: brand color top half — bold editorial block */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "54%",
            background: `linear-gradient(135deg, ${shade(color, -30)} 0%, ${color} 100%)` }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "54%", opacity: 0.05,
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(255,255,255,0.5) 28px, rgba(255,255,255,0.5) 29px)" }} />
          {/* Divider fade edge */}
          <div style={{ position: "absolute", top: "46%", left: 0, right: 0, height: "16%",
            background: "linear-gradient(to bottom, transparent, #06060e)" }} />
        </>
      )}

      {/* Left brand stripe */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "5px", height: "100%", background: color }} />

      {/* Top row */}
      <div style={{ position: "absolute", top: "52px", left: "68px", right: "68px",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <BusinessPill name={businessName} color={color} textOnDark />
        {slide.badge && (
          <div style={{
            fontSize: T.badge, fontWeight: WEIGHT.black, letterSpacing: "2px", textTransform: "uppercase" as const,
            background: color, color: isDark(color) ? "#fff" : "#111",
            padding: "10px 24px", borderRadius: "8px",
          }}>
            {slide.badge}
          </div>
        )}
      </div>

      {/* Bottom content block */}
      <div style={{ position: "absolute", bottom: "64px", left: "68px", right: "68px" }}>
        <div style={{ width: "52px", height: "4px", background: color, borderRadius: "2px", marginBottom: "24px" }} />
        <h1 style={{
          margin: 0, fontSize: T.h1, fontWeight: WEIGHT.black, color: "#fff",
          lineHeight: "1.0", letterSpacing: "-3px", maxWidth: "920px",
        }}>
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p style={{ margin: "24px 0 0", fontSize: T.body, fontWeight: WEIGHT.regular,
            color: "rgba(255,255,255,0.72)", lineHeight: "1.45", maxWidth: "700px" }}>
            {slide.subtitle}
          </p>
        )}
        <div style={{ marginTop: "36px", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ height: "1px", width: "40px", background: rgba(color, 0.5) }} />
          <span style={{ fontSize: T.small, color: "rgba(255,255,255,0.32)", letterSpacing: "0.5px" }}>
            Deslize para ver
          </span>
        </div>
      </div>
    </div>
  );
}

function BoldStatement({ slide, color, font, h }: { slide: PremiumCarouselSlide; color: string; font: string; h: number }) {
  const isDarkBg = slide.bgVariant === "dark";
  const hasImage = !!slide.imageUrl;
  const accentColor = isDarkBg ? color : "rgba(255,255,255,0.95)";
  const textMuted = isDarkBg ? "rgba(255,255,255,0.68)" : "rgba(255,255,255,0.80)";

  if (hasImage) {
    return (
      <div style={{ position: "absolute", inset: 0, fontFamily: font, overflow: "hidden", background: "#07070e" }}>
        {/* Photo visible on right half — dark on left where text lives */}
        <img src={slide.imageUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.82) 38%, rgba(0,0,0,0.32) 68%, rgba(0,0,0,0.10) 100%)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "5px", height: "100%",
          background: `linear-gradient(to bottom, ${color} 0%, ${rgba(color, 0.1)} 100%)` }} />
        <div style={{ position: "absolute", inset: 0, padding: "72px 80px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {slide.badge && (
            <div style={{ alignSelf: "flex-start",
              display: "inline-flex", alignItems: "center", gap: "12px",
              background: rgba(color, 0.2), border: `1.5px solid ${rgba(color, 0.4)}`,
              borderRadius: "10px", padding: "10px 24px",
              fontSize: T.badge, fontWeight: WEIGHT.black, color: "#fff", letterSpacing: "1.5px" }}>
              {slide.badge}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "620px" }}>
            <div style={{ width: "56px", height: "4px", background: color, borderRadius: "2px" }} />
            <h2 style={{ margin: 0, fontSize: T.h1, fontWeight: WEIGHT.black, color: "#fff",
              lineHeight: "1.0", letterSpacing: "-3px" }}>
              {slide.title}
            </h2>
            {(slide.body || slide.subtitle) && (
              <p style={{ margin: 0, fontSize: T.h4, color: "rgba(255,255,255,0.78)", lineHeight: "1.55" }}>
                {bodyText(slide.body) || slide.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isDarkBg) {
    return (
      <div style={{ position: "absolute", inset: 0, fontFamily: font, overflow: "hidden", background: "#07070e" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "5px", height: "100%", background: color }} />
        <div style={{ position: "absolute", inset: 0, padding: "72px 80px 72px 85px", display: "flex", flexDirection: "column" }}>
          {slide.badge && (
            <div style={{ alignSelf: "flex-start", marginBottom: "auto",
              display: "inline-flex", alignItems: "center", gap: "12px",
              background: rgba(color, 0.12), border: `1.5px solid ${rgba(color, 0.3)}`,
              borderRadius: "10px", padding: "10px 24px",
              fontSize: T.badge, fontWeight: WEIGHT.black, color, letterSpacing: "1.5px" }}>
              {slide.badge}
            </div>
          )}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "28px" }}>
            <div style={{ width: "72px", height: "5px", borderRadius: "3px", background: `linear-gradient(90deg, ${color}, ${rgba(color, 0.2)})` }} />
            <h2 style={{ margin: 0, fontSize: T.h1, fontWeight: WEIGHT.black, color: "#fff",
              lineHeight: "1.0", letterSpacing: "-3px", maxWidth: "900px" }}>
              {slide.title}
            </h2>
            {(slide.body || slide.subtitle) && (
              <p style={{ margin: 0, fontSize: T.h4, color: "rgba(255,255,255,0.68)", lineHeight: "1.55", maxWidth: "820px" }}>
                {bodyText(slide.body) || slide.subtitle}
              </p>
            )}
            {slide.listItems && slide.listItems.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {slide.listItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: T.body, color: "rgba(255,255,255,0.85)", lineHeight: "1.3" }}>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ height: "1px", background: rgba(color, 0.1) }} />
        </div>
      </div>
    );
  }

  // Brand gradient: color band top 38%, title spans into dark zone
  const colorBg = `linear-gradient(135deg, ${shade(color, -30)} 0%, ${color} 100%)`;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: font, overflow: "hidden", background: "#07070e" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "38%", background: colorBg }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "38%", opacity: 0.06,
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 32px, rgba(255,255,255,0.5) 32px, rgba(255,255,255,0.5) 33px)" }} />

      {slide.badge && (
        <div style={{ position: "absolute", top: "52px", left: "80px",
          display: "inline-flex", alignItems: "center", gap: "12px",
          background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: "8px", padding: "10px 24px",
          fontSize: T.badge, fontWeight: WEIGHT.black, color: "rgba(255,255,255,0.92)", letterSpacing: "1.5px" }}>
          {slide.badge}
        </div>
      )}

      {/* Title in dark zone top, body at bottom */}
      <div style={{ position: "absolute", top: "38%", left: "80px", right: "80px", bottom: "72px",
        display: "flex", flexDirection: "column", justifyContent: "space-between", paddingTop: "48px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ width: "72px", height: "4px", background: color, borderRadius: "2px" }} />
          <h2 style={{ margin: 0, fontSize: T.h1, fontWeight: WEIGHT.black, color: "#fff",
            lineHeight: "1.0", letterSpacing: "-3px" }}>
            {slide.title}
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {(slide.body || slide.subtitle) && (
            <p style={{ margin: 0, fontSize: T.h4, color: "rgba(255,255,255,0.68)", lineHeight: "1.55" }}>
              {bodyText(slide.body) || slide.subtitle}
            </p>
          )}
          {slide.listItems && slide.listItems.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {slide.listItems.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: T.body, color: "rgba(255,255,255,0.82)", lineHeight: "1.3" }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SplitImage({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const hasImage = !!slide.imageUrl;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", fontFamily: font }}>
      {/* Left: image panel — 54% for maximum visual impact */}
      <div style={{ width: "54%", position: "relative", flexShrink: 0, overflow: "hidden" }}>
        {hasImage ? (
          <>
            <img src={slide.imageUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.08) 0%, transparent 50%)" }} />
          </>
        ) : (
          <div style={{ position: "absolute", inset: 0,
            background: `linear-gradient(160deg, ${tint(color, 20)} 0%, ${shade(color, -10)} 100%)` }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.08,
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 24px, rgba(255,255,255,0.4) 24px, rgba(255,255,255,0.4) 25px)" }} />
          </div>
        )}
        {/* Badge bottom-left */}
        {slide.badge && (
          <div style={{ position: "absolute", bottom: "48px", left: "32px",
            background: color, color: isDark(color) ? "#fff" : "#111",
            borderRadius: "8px", padding: "10px 24px",
            fontSize: T.badge, fontWeight: WEIGHT.black, letterSpacing: "1px" }}>
            {slide.badge}
          </div>
        )}
        {/* Right fade edge */}
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "100px",
          background: "linear-gradient(to right, transparent, #08080f)" }} />
        {/* Color bottom accent */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "5px", background: color }} />
      </div>

      {/* Right: content panel */}
      <div style={{ flex: 1, background: "#08080f", padding: "64px 52px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "relative", overflow: "hidden" }}>
        {/* Top accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "5px",
          background: `linear-gradient(90deg, ${color} 0%, transparent 100%)` }} />
        {/* Ambient glow */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px",
          borderRadius: "50%", background: rgba(color, 0.12), filter: "blur(70px)" }} />

        {/* Top section */}
        <div style={{ position: "relative" }}>
          <AccentLine color={color} width={44} />
          {!slide.badge && slide.badge !== "" && (
            <div style={{ marginTop: "20px" }} />
          )}
        </div>

        {/* Middle content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "relative" }}>
          {slide.badge && (
            <div style={{ fontSize: T.eyebrow, letterSpacing: "3px", fontWeight: WEIGHT.black,
              color, textTransform: "uppercase" as const }}>
              {slide.badge}
            </div>
          )}
          <h2 style={{ margin: 0, fontSize: T.h3, fontWeight: WEIGHT.black, color: "#fff",
            lineHeight: "1.12", letterSpacing: "-1.5px" }}>
            {slide.title}
          </h2>
          {(slide.subtitle || slide.body) && (
            <p style={{ margin: 0, fontSize: T.caption, color: "rgba(255,255,255,0.65)", lineHeight: "1.55" }}>
              {slide.subtitle || slide.body}
            </p>
          )}
          {slide.listItems && slide.listItems.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {slide.listItems.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color,
                    flexShrink: 0, marginTop: "10px" }} />
                  <span style={{ fontSize: T.caption, fontWeight: WEIGHT.medium, color: "rgba(255,255,255,0.82)", lineHeight: "1.4" }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom */}
        <div style={{ paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
          <span style={{ fontSize: T.small, color: rgba(color, 0.85), fontWeight: WEIGHT.bold }}>{businessName}</span>
        </div>
      </div>
    </div>
  );
}

function CardGlass({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const hasImage = !!slide.imageUrl;
  const gradientBg = `linear-gradient(150deg, ${shade(color,-25)} 0%, ${color} 100%)`;

  return (
    <div style={{ position: "absolute", inset: 0, background: hasImage ? "#111" : gradientBg, fontFamily: font, overflow: "hidden" }}>
      {hasImage ? (
        <>
          <img src={slide.imageUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          {/* Lighter overlay — photo breathes */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.30) 100%)" }} />
        </>
      ) : (
        <>
          <div style={{ position: "absolute", inset: 0, opacity: 0.07,
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(255,255,255,0.5) 28px, rgba(255,255,255,0.5) 29px)" }} />
        </>
      )}

      {/* Top row */}
      <div style={{ position: "absolute", top: "52px", left: "52px", right: "52px",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <BusinessPill name={businessName} color={color} textOnDark />
        {slide.badge && (
          <div style={{
            background: color, borderRadius: "8px", padding: "10px 24px",
            fontSize: T.badge, fontWeight: WEIGHT.black,
            color: isDark(color) ? "#fff" : "#111", letterSpacing: "1px",
          }}>
            {slide.badge}
          </div>
        )}
      </div>

      {/* Glass card — bottom half */}
      <div style={{
        position: "absolute",
        left: "44px", right: "44px", bottom: "52px",
        background: "rgba(6,6,18,0.80)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderRadius: "28px",
        border: "1.5px solid rgba(255,255,255,0.10)",
        borderTop: `2px solid ${rgba(color, 0.5)}`,
        padding: "48px 52px 48px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {!slide.badge && <AccentLine color={color} width={48} />}
          <h2 style={{ margin: 0, fontSize: T.h3, fontWeight: WEIGHT.black, color: "#fff",
            lineHeight: "1.08", letterSpacing: "-1.5px" }}>
            {slide.title}
          </h2>
          {(slide.body || slide.subtitle) && (
            <p style={{ margin: 0, fontSize: T.body, color: "rgba(255,255,255,0.70)", lineHeight: "1.55" }}>
              {slide.body || slide.subtitle}
            </p>
          )}
          {slide.listItems && slide.listItems.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {slide.listItems.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: T.caption, fontWeight: WEIGHT.medium, color: "rgba(255,255,255,0.85)" }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentList({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const hasImage = !!slide.imageUrl;

  if (hasImage) {
    // Dark editorial with photo — items in frosted cards, image shows through
    return (
      <div style={{ position: "absolute", inset: 0, background: "#07070e", fontFamily: font, overflow: "hidden" }}>
        <img src={slide.imageUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.52) 48%, rgba(0,0,0,0.90) 100%)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "5px", background: color }} />

        <div style={{ position: "absolute", inset: 0, padding: "68px 68px 56px", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "32px" }}>
            {slide.badge && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px",
                background: rgba(color, 0.22), border: `1.5px solid ${rgba(color, 0.45)}`,
                borderRadius: "8px", padding: "8px 18px", marginBottom: "18px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: color }} />
                <span style={{ fontSize: T.badge, fontWeight: WEIGHT.black, color: "#fff", letterSpacing: "1.5px", textTransform: "uppercase" as const }}>{slide.badge}</span>
              </div>
            )}
            <h2 style={{ margin: "0 0 14px", fontSize: T.h2, fontWeight: WEIGHT.black, color: "#fff", lineHeight: "1.05", letterSpacing: "-2px" }}>
              {slide.title}
            </h2>
            <div style={{ width: "48px", height: "4px", borderRadius: "2px", background: color }} />
          </div>

          {slide.listItems && slide.listItems.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
              {slide.listItems.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "20px",
                  padding: "20px 24px",
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderRadius: "16px",
                  border: `1px solid rgba(255,255,255,0.10)`,
                  borderLeft: `3px solid ${i === 0 ? color : rgba(color, 0.35)}` }}>
                  <span style={{ fontSize: T.caption, fontWeight: WEIGHT.black, color, minWidth: "36px", flexShrink: 0 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: T.body, fontWeight: WEIGHT.semibold, color: "rgba(255,255,255,0.92)", lineHeight: "1.3" }}>{item}</span>
                </div>
              ))}
            </div>
          ) : (slide.body || slide.subtitle) ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <p style={{ margin: 0, fontSize: T.h3, color: "rgba(255,255,255,0.80)", lineHeight: "1.55" }}>{slide.body || slide.subtitle}</p>
            </div>
          ) : null}

          <div style={{ paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: T.small, fontWeight: WEIGHT.bold, color: rgba(color, 0.9) }}>{businessName}</span>
          </div>
        </div>
      </div>
    );
  }

  // Light editorial mode — white, clean, professional
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fafafa", fontFamily: font, overflow: "hidden" }}>
      {/* Top brand bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: color }} />
      {/* Ghost number — large background element */}
      {slide.listItems && slide.listItems.length > 0 && (
        <div style={{ position: "absolute", right: "-16px", bottom: "60px",
          fontSize: "340px", fontWeight: WEIGHT.black, color: rgba(color, 0.04),
          lineHeight: 1, pointerEvents: "none", userSelect: "none" as const, letterSpacing: "-16px" }}>
          {slide.listItems.length}
        </div>
      )}
      {/* Left color rail */}
      <div style={{ position: "absolute", top: "76px", left: "56px", bottom: "76px",
        width: "4px", background: `linear-gradient(to bottom, ${color} 0%, ${rgba(color, 0.12)} 100%)`, borderRadius: "2px" }} />

      <div style={{ position: "absolute", inset: 0, padding: "76px 72px 64px 80px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "36px" }}>
          {slide.badge && (
            <div style={{ fontSize: T.badge, fontWeight: WEIGHT.black, color, letterSpacing: "2.5px",
              textTransform: "uppercase" as const, marginBottom: "14px" }}>
              {slide.badge}
            </div>
          )}
          <h2 style={{ margin: 0, fontSize: T.h2, fontWeight: WEIGHT.black, color: "#0a0a12",
            lineHeight: "1.05", letterSpacing: "-2px" }}>
            {slide.title}
          </h2>
        </div>

        {slide.listItems && slide.listItems.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0", flex: 1 }}>
            {slide.listItems.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "22px",
                paddingBottom: "22px", marginBottom: "22px",
                borderBottom: i < (slide.listItems?.length ?? 0) - 1 ? "1px solid rgba(0,0,0,0.07)" : "none" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px",
                  background: i === 0 ? color : rgba(color, 0.1),
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: T.body, fontWeight: WEIGHT.black,
                    color: i === 0 ? (isDark(color) ? "#fff" : "#111") : color }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: T.body, fontWeight: WEIGHT.semibold, color: "#1a1a28",
                  lineHeight: "1.35", paddingTop: "10px" }}>{item}</span>
              </div>
            ))}
          </div>
        ) : (slide.body || slide.subtitle) ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <p style={{ margin: 0, fontSize: T.h3, color: "#2a2a3a", lineHeight: "1.6" }}>{slide.body || slide.subtitle}</p>
          </div>
        ) : null}

        <div style={{ paddingTop: "22px", borderTop: `2px solid ${rgba(color, 0.12)}`,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: T.small, fontWeight: WEIGHT.bold, color }}>{businessName}</span>
        </div>
      </div>
    </div>
  );
}

function ImageOverlay({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const hasImage = !!slide.imageUrl;
  const gradientBg = `linear-gradient(145deg, ${shade(color, -20)} 0%, ${tint(color, 20)} 100%)`;

  return (
    <div style={{ position: "absolute", inset: 0, background: hasImage ? "#111" : gradientBg, fontFamily: font, overflow: "hidden" }}>
      {hasImage ? (
        <>
          <img src={slide.imageUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          {/* Vignette at bottom for readability, photo breathes at top */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 38%, rgba(0,0,0,0.80) 68%, rgba(0,0,0,0.97) 100%)" }} />
        </>
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)" }} />
      )}

      {/* Left accent stripe */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "5px", height: "100%", background: color }} />

      <div style={{ position: "absolute", inset: 0, padding: "56px 72px 64px 76px", display: "flex", flexDirection: "column" }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <BusinessPill name={businessName} color={color} textOnDark />
          {slide.badge && (
            <div style={{ background: color, borderRadius: "8px", padding: "10px 24px",
              fontSize: T.badge, fontWeight: WEIGHT.black, color: isDark(color) ? "#fff" : "#111",
              letterSpacing: "2px", textTransform: "uppercase" as const }}>
              {slide.badge}
            </div>
          )}
        </div>

        {/* Bottom content block */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ width: "56px", height: "4px", background: color, borderRadius: "2px" }} />
          <h2 style={{ margin: 0, fontSize: T.h2, fontWeight: WEIGHT.black, color: "#fff",
            lineHeight: "1.06", letterSpacing: "-2px",
            textShadow: "0 4px 28px rgba(0,0,0,0.5)" }}>
            {slide.title}
          </h2>
          {(slide.body || slide.subtitle) && (
            <p style={{ margin: 0, fontSize: T.body, color: "rgba(255,255,255,0.80)", lineHeight: "1.5",
              textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
              {slide.body || slide.subtitle}
            </p>
          )}
          {slide.listItems && slide.listItems.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {slide.listItems.slice(0, 3).map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: T.caption, fontWeight: WEIGHT.semibold, color: "rgba(255,255,255,0.88)" }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CTAFinal({ slide, color, businessName, city, whatsapp, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; city: string; whatsapp: string; font: string; h: number }) {
  const WA_COLOR = "#25D366";

  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070e", fontFamily: font, overflow: "hidden" }}>
      {/* Ambient glow — color top */}
      <div style={{ position: "absolute", top: "-180px", left: "50%", transform: "translateX(-50%)",
        width: "720px", height: "720px", borderRadius: "50%",
        background: rgba(color, 0.10), filter: "blur(80px)" }} />
      {/* WA glow bottom */}
      <div style={{ position: "absolute", bottom: "-160px", right: "-80px",
        width: "520px", height: "520px", borderRadius: "50%",
        background: rgba(WA_COLOR, 0.08), filter: "blur(80px)" }} />

      {/* Top brand bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "5px",
        background: `linear-gradient(90deg, ${color}, ${rgba(color, 0.15)})` }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "80px 72px", gap: "0" }}>

        {/* Business name pill */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "12px",
            background: rgba(color, 0.12), border: `1.5px solid ${rgba(color, 0.3)}`,
            borderRadius: "100px", padding: "12px 36px", marginBottom: "28px",
          }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color }} />
            <span style={{ fontSize: T.caption, fontWeight: WEIGHT.black, color: rgba(color, 1), letterSpacing: "1.5px", textTransform: "uppercase" }}>
              {businessName}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: T.h2, fontWeight: WEIGHT.black, color: "#fff", lineHeight: "1.1", letterSpacing: "-2px", textAlign: "center" }}>
            {slide.title}
          </h2>
          {(slide.cta || slide.body || slide.subtitle) && (
            <p style={{ margin: "20px 0 0", fontSize: T.body, color: "rgba(255,255,255,0.6)", fontWeight: WEIGHT.regular, lineHeight: "1.5", textAlign: "center" }}>
              {slide.cta || slide.body || slide.subtitle}
            </p>
          )}
        </div>

        {/* WhatsApp button */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "20px",
          background: `linear-gradient(135deg, ${WA_COLOR}, #1ab854)`,
          borderRadius: "24px", padding: "36px 72px",
          width: "100%", maxWidth: "760px",
          boxShadow: `0 20px 60px rgba(37,211,102,0.35), 0 4px 12px rgba(37,211,102,0.2)`,
        }}>
          <WhatsAppIcon size={52} color="#fff" />
          <div>
            <div style={{ fontSize: T.h4, fontWeight: WEIGHT.black, color: "#fff", letterSpacing: "-0.5px", lineHeight: "1" }}>
              Falar no WhatsApp
            </div>
            <div style={{ fontSize: T.small, fontWeight: WEIGHT.medium, color: "rgba(255,255,255,0.75)", marginTop: "6px" }}>
              Resposta rápida garantida
            </div>
          </div>
        </div>

        {/* Bottom info */}
        <div style={{ marginTop: "40px", display: "flex", gap: "40px", alignItems: "center", justifyContent: "center" }}>
          {city && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: rgba(color, 0.6) }} />
                <span style={{ fontSize: T.small, color: "rgba(255,255,255,0.4)", fontWeight: WEIGHT.medium }}>{city}</span>
              </div>
              <div style={{ height: "20px", width: "1px", background: "rgba(255,255,255,0.1)" }} />
            </>
          )}
          <span style={{ fontSize: T.small, color: "rgba(255,255,255,0.25)", fontWeight: WEIGHT.medium, letterSpacing: "0.5px" }}>
            @{businessName.toLowerCase().replace(/\s+/g, "")}
          </span>
        </div>
      </div>
    </div>
  );
}

// Pipe-separated body means antes_depois role data — render as bullet list separator
function bodyText(body: string | undefined): string | undefined {
  if (!body) return undefined;
  return body.includes("|") ? body.split("|").join(" • ") : body;
}

// ─── Niche-specific antes/depois data ───────────────────────
const NICHE_ANTES: Record<string, string[]> = {
  barbearia:         ["Corte sem personalidade", "Barba descuidada",    "Visual sem estilo"],
  odontologia:       ["Sorriso sem brilho",      "Sensibilidade dental","Autoestima afetada"],
  "personal-trainer":["Sem evolução visível",    "Treino sem método",   "Falta de motivação"],
  estetica:          ["Pele sem brilho",          "Tratamento genérico", "Resultado temporário"],
  "clinica-medica":  ["Diagnóstico incompleto",  "Dúvidas sem resposta","Saúde comprometida"],
  mecanica:          ["Problema não resolvido",  "Orçamento surpresa",  "Peças erradas"],
  imobiliaria:       ["Imóvel parado no mercado","Preço fora do real",  "Negociação difícil"],
  consultoria:       ["Gestão no escuro",         "Decisões sem dados",  "Resultados erráticos"],
  restaurante:       ["Pedido demorado",          "Sem consistência",    "Experiência esquecível"],
  "loja-roupa":      ["Look sem identidade",      "Compra errada",       "Estilo indefinido"],
  outro:             ["Processo ineficiente",     "Resultado abaixo",    "Tempo perdido"],
};

// ════════════════════════════════════════════════════════════
//  NOVOS LAYOUTS
// ════════════════════════════════════════════════════════════

// ─── BeforeAfter ─────────────────────────────────────────────
function BeforeAfter({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const niche = (slide as any).niche as string ?? "outro";
  const antesItems = slide.body?.includes("|")
    ? slide.body.split("|")
    : (NICHE_ANTES[niche] ?? NICHE_ANTES.outro);
  const depoisItems = slide.listItems?.length
    ? slide.listItems.slice(0, 3)
    : ["Resultado real", "Qualidade garantida", "Satisfação total"];

  const panelH = Math.round(h * 0.52);

  const hasImageBA = !!slide.imageUrl;

  return (
    <div style={{ position: "absolute", inset: 0, background: "#08080f", fontFamily: font, overflow: "hidden" }}>
      {hasImageBA && <BgImage url={slide.imageUrl} overlay="linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.42) 50%, rgba(0,0,0,0.78) 100%)" />}
      {/* Ambient glow — brand */}
      <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "500px", height: "500px", borderRadius: "50%", background: rgba(color, 0.12), filter: "blur(80px)" }} />

      {/* Split panels */}
      <div style={{ position: "absolute", top: "72px", left: "60px", right: "60px", height: `${panelH}px`, display: "flex", gap: "12px", borderRadius: "24px", overflow: "hidden" }}>
        {/* ANTES — dark panel */}
        <div style={{ flex: 1, background: "linear-gradient(160deg, #151520 0%, #0e0e18 100%)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "36px 32px", display: "flex", flexDirection: "column", gap: "20px", position: "relative", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "1.5px solid rgba(239,68,68,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.85)" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <span style={{ fontSize: T.eyebrow, fontWeight: WEIGHT.black, color: "rgba(239,68,68,0.7)", letterSpacing: "3px", textTransform: "uppercase" }}>ANTES</span>
          </div>
          {antesItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(239,68,68,0.4)", flexShrink: 0, marginTop: "9px" }} />
              <span style={{ fontSize: T.caption, fontWeight: WEIGHT.medium, color: "rgba(255,255,255,0.45)", lineHeight: "1.4" }}>{item}</span>
            </div>
          ))}
          {/* Diagonal stripe texture */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 21px)", borderRadius: "20px" }} />
        </div>

        {/* DEPOIS — brand gradient panel */}
        <div style={{ flex: 1, background: `linear-gradient(155deg, ${shade(color, -30)} 0%, ${color} 55%, ${tint(color, 24)} 100%)`, borderRadius: "20px", padding: "36px 32px", display: "flex", flexDirection: "column", gap: "20px", position: "relative", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span style={{ fontSize: T.eyebrow, fontWeight: WEIGHT.black, color: "rgba(255,255,255,0.85)", letterSpacing: "3px", textTransform: "uppercase" }}>DEPOIS</span>
          </div>
          {depoisItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.7)", flexShrink: 0, marginTop: "9px" }} />
              <span style={{ fontSize: T.caption, fontWeight: WEIGHT.semibold, color: "rgba(255,255,255,0.92)", lineHeight: "1.4" }}>{item}</span>
            </div>
          ))}
          {/* Light shine top-right */}
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
        </div>
      </div>

      {/* Bottom content */}
      <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", padding: "0 60px 60px" }}>
        {slide.badge && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: rgba(color, 0.18), border: `1px solid ${rgba(color, 0.35)}`, borderRadius: "8px", padding: "8px 20px", marginBottom: "20px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color }} />
            <span style={{ fontSize: T.badge, fontWeight: WEIGHT.black, color: "#fff", letterSpacing: "2.5px", textTransform: "uppercase" }}>{slide.badge}</span>
          </div>
        )}
        <h2 style={{ margin: "0 0 16px", fontSize: T.h3, fontWeight: WEIGHT.black, color: "#fff", lineHeight: "1.12", letterSpacing: "-1.5px" }}>{slide.title}</h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <AccentLine color={color} />
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {[0,1,2].map(i => <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: i === 0 ? color : "rgba(255,255,255,0.15)" }} />)}
          </div>
        </div>
        <span style={{ display: "block", marginTop: "14px", fontSize: T.small, fontWeight: WEIGHT.medium, color: "rgba(255,255,255,0.28)", letterSpacing: "0.5px" }}>@{businessName.toLowerCase().replace(/\s+/g,"")}</span>
      </div>
    </div>
  );
}

// ─── StatsCard ────────────────────────────────────────────────
function StatsCard({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const miniStats = slide.listItems?.slice(0, 3) ?? [];
  const hasImage = !!slide.imageUrl;

  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070e", fontFamily: font, overflow: "hidden" }}>
      {hasImage && <BgImage url={slide.imageUrl} overlay="linear-gradient(to bottom, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.64) 100%)" />}
      {/* Color band behind number area (no-image: makes it look editorial, not "só preto") */}
      {!hasImage && (
        <>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "55%",
            background: `linear-gradient(135deg, ${shade(color, -28)} 0%, ${color} 100%)` }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "55%", opacity: 0.05,
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 24px, rgba(255,255,255,0.5) 24px, rgba(255,255,255,0.5) 25px)" }} />
        </>
      )}
      {/* Brand color glow — top-left (image mode only) */}
      {hasImage && <div style={{ position: "absolute", top: "-120px", left: "-80px", width: "600px", height: "600px",
        borderRadius: "50%", background: rgba(color, 0.22), filter: "blur(100px)" }} />}
      {/* Subtle dot grid (image mode only — no-image has color band) */}
      {!hasImage && <div style={{ position: "absolute", top: "55%", left: 0, right: 0, bottom: 0, opacity: 0.03,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
        backgroundSize: "44px 44px" }} />}

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        padding: "72px 72px 64px", justifyContent: "space-between" }}>
        {/* Top: badge + business pill */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {slide.badge ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px",
              background: rgba(color, 0.15), border: `1px solid ${rgba(color, 0.3)}`,
              borderRadius: "8px", padding: "8px 20px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color }} />
              <span style={{ fontSize: T.badge, fontWeight: WEIGHT.black, color: "#fff",
                letterSpacing: "2.5px", textTransform: "uppercase" }}>{slide.badge}</span>
            </div>
          ) : <div />}
          <BusinessPill name={businessName} color={color} textOnDark />
        </div>

        {/* Center: big number — left-anchored */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{
            fontSize: "168px", fontWeight: WEIGHT.black, color: "#fff",
            lineHeight: "1.0", letterSpacing: "-8px",
            textShadow: `0 0 100px ${rgba(color, 0.45)}, 0 4px 40px rgba(0,0,0,0.5)`,
          }}>
            {slide.title}
          </div>
          <div style={{ width: "80px", height: "5px", background: `linear-gradient(90deg, ${color}, ${tint(color, 40)})`,
            borderRadius: "3px" }} />
          {slide.subtitle && (
            <p style={{ margin: 0, fontSize: T.h4, fontWeight: WEIGHT.medium,
              color: "rgba(255,255,255,0.62)", lineHeight: "1.45", maxWidth: "680px" }}>
              {slide.subtitle}
            </p>
          )}
        </div>

        {/* Bottom: mini stats */}
        <div>
          {miniStats.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${miniStats.length}, 1fr)`,
              gap: "16px", marginBottom: "36px" }}>
              {miniStats.map((s, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px", padding: "24px 16px", textAlign: "center",
                  borderTop: `2px solid ${rgba(color, 0.5)}`,
                }}>
                  <span style={{ display: "block", fontSize: T.h4, fontWeight: WEIGHT.black, color: "#fff" }}>{s}</span>
                </div>
              ))}
            </div>
          )}
          <AccentLine color={color} />
        </div>
      </div>
    </div>
  );
}

// ─── TestimonialQuote ─────────────────────────────────────────
function TestimonialQuote({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const quoteText = slide.title?.replace(/^[""]|[""]$/g, "") ?? "";
  const attribution = slide.body ?? "";
  const hasImage = !!slide.imageUrl;

  return (
    <div style={{ position: "absolute", inset: 0,
      background: hasImage ? "#08080f" : `linear-gradient(165deg, #0a0a14 0%, #0f0f1c 100%)`,
      fontFamily: font, overflow: "hidden" }}>
      {hasImage && <BgImage url={slide.imageUrl} overlay="linear-gradient(to bottom, rgba(0,0,0,0.72), rgba(0,0,0,0.88))" />}
      {/* Color glow — bottom right */}
      <div style={{ position: "absolute", bottom: "8%", right: "-80px", width: "440px", height: "440px",
        borderRadius: "50%", background: rgba(color, 0.12), filter: "blur(90px)" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "72px" }}>
        {/* Top: badge + stars */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "64px" }}>
          {slide.badge ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px",
              background: rgba(color, 0.15), border: `1px solid ${rgba(color, 0.3)}`,
              borderRadius: "8px", padding: "8px 20px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color }} />
              <span style={{ fontSize: T.badge, fontWeight: WEIGHT.black, color: "#fff",
                letterSpacing: "2px", textTransform: "uppercase" }}>{slide.badge}</span>
            </div>
          ) : <div />}
          <div style={{ display: "flex", gap: "8px" }}>
            {[0,1,2,3,4].map(i => (
              <svg key={i} width="32" height="32" viewBox="0 0 24 24" fill="#facc15">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
        </div>

        {/* Quote text with left accent bar */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
            <div style={{ width: "4px", alignSelf: "stretch", minHeight: "160px", flexShrink: 0,
              background: `linear-gradient(to bottom, ${color}, ${rgba(color, 0.1)})`,
              borderRadius: "2px" }} />
            <p style={{ margin: 0, fontSize: T.h3, fontWeight: WEIGHT.semibold,
              color: "rgba(255,255,255,0.93)", lineHeight: "1.45", letterSpacing: "-0.5px" }}>
              {quoteText}
            </p>
          </div>
        </div>

        {/* Attribution */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "32px", marginTop: "48px",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: T.body, fontWeight: WEIGHT.semibold, color: "rgba(255,255,255,0.72)" }}>
            {attribution || `— Cliente da ${businessName}`}
          </p>
          <BusinessPill name={businessName} color={color} textOnDark />
        </div>
      </div>
    </div>
  );
}

// ─── StepsProcess ─────────────────────────────────────────────
function StepsProcess({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const steps = slide.listItems?.slice(0, 4) ?? ["Passo 1", "Passo 2", "Passo 3"];
  const hasImage = !!slide.imageUrl;

  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070e", fontFamily: font, overflow: "hidden" }}>
      {hasImage && <BgImage url={slide.imageUrl} overlay="linear-gradient(to right, rgba(0,0,0,0.90) 48%, rgba(0,0,0,0.42) 100%)" />}
      {/* Left brand accent panel (no-image: adds color structure) */}
      {!hasImage && <div style={{ position: "absolute", top: 0, left: 0, width: "8px", height: "100%",
        background: `linear-gradient(to bottom, ${color} 0%, ${rgba(color, 0.2)} 100%)` }} />}
      {!hasImage && <div style={{ position: "absolute", top: 0, left: "8px", width: "200px", height: "100%",
        background: `linear-gradient(to right, ${rgba(color, 0.08)} 0%, transparent 100%)` }} />}
      {/* Color glow */}
      <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "380px", height: "380px",
        borderRadius: "50%", background: rgba(color, hasImage ? 0.15 : 0.12), filter: "blur(80px)" }} />
      {/* Top brand bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "5px",
        background: `linear-gradient(90deg, ${color}, ${rgba(color, 0.15)})` }} />

      <div style={{ position: "absolute", inset: 0, padding: "72px 72px 64px", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ marginBottom: "52px" }}>
          {slide.badge && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px",
              background: rgba(color, 0.12), border: `1px solid ${rgba(color, 0.28)}`,
              borderRadius: "8px", padding: "8px 20px", marginBottom: "20px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color }} />
              <span style={{ fontSize: T.badge, fontWeight: WEIGHT.black, color,
                letterSpacing: "2px", textTransform: "uppercase" }}>{slide.badge}</span>
            </div>
          )}
          <h2 style={{ margin: 0, fontSize: T.h3, fontWeight: WEIGHT.black, color: "#fff",
            lineHeight: "1.15", letterSpacing: "-1.5px" }}>{slide.title}</h2>
          <div style={{ width: "48px", height: "3px", background: color, borderRadius: "2px", marginTop: "20px" }} />
        </div>

        {/* Steps */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "0" }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "28px", alignItems: "stretch" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "14px", flexShrink: 0,
                  background: i === 0 ? color : rgba(color, 0.18),
                  border: `2px solid ${i === 0 ? "transparent" : rgba(color, 0.45)}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: i === 0 ? `0 8px 24px ${rgba(color, 0.4)}` : "none",
                }}>
                  <span style={{ fontSize: T.h4, fontWeight: WEIGHT.black, color: i === 0 ? (isDark(color) ? "#fff" : "#111") : color }}>{i + 1}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: "2px", flex: 1, minHeight: "32px",
                    background: `linear-gradient(to bottom, ${rgba(color, 0.5)}, ${rgba(color, 0.1)})`, margin: "6px 0" }} />
                )}
              </div>
              <div style={{ paddingBottom: i < steps.length - 1 ? "28px" : "0", paddingTop: "10px" }}>
                <p style={{ margin: 0, fontSize: T.body, fontWeight: WEIGHT.medium,
                  color: "rgba(255,255,255,0.85)", lineHeight: "1.45" }}>{step}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "24px",
          display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: T.small, color: "rgba(255,255,255,0.22)" }}>
            @{businessName.toLowerCase().replace(/\s+/g, "")}
          </span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  NOVOS LAYOUTS — COVER VARIANTS
// ════════════════════════════════════════════════════════════

// ─── CoverSplit — imagem 50% esq + painel texto 50% dir ───────
function CoverSplit({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const bg = slide.colorOverride ?? color;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", overflow: "hidden", fontFamily: font }}>
      {/* Left — image panel */}
      <div style={{ width: "50%", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        {slide.imageUrl
          ? <img src={slide.imageUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${bg}cc, ${rgba(bg, 0.3)})` }} />
        }
        {/* fade edge to dark */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 50%, #07070e)" }} />
        {/* brand accent bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", background: bg }} />
      </div>

      {/* Right — text panel */}
      <div style={{ width: "50%", background: "#07070e", display: "flex", flexDirection: "column", justifyContent: "center", padding: "52px 44px 52px 48px", position: "relative" }}>
        {/* accent line */}
        <div style={{ width: "36px", height: "3px", background: bg, borderRadius: "2px", marginBottom: "28px" }} />
        {slide.badge && (
          <div style={{ fontSize: T.eyebrow, letterSpacing: "4px", fontWeight: WEIGHT.black, color: bg, textTransform: "uppercase", marginBottom: "20px" }}>
            {slide.badge}
          </div>
        )}
        <h1 style={{ margin: 0, fontSize: T.h3, fontWeight: WEIGHT.black, color: "#fff", lineHeight: 1.05, letterSpacing: "-1px", marginBottom: "20px" }}>
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p style={{ margin: 0, fontSize: T.caption, color: rgba("#fff", 0.6), lineHeight: 1.45, fontWeight: WEIGHT.regular, marginBottom: "40px" }}>
            {slide.subtitle}
          </p>
        )}
        {/* business name bottom */}
        <div style={{ position: "absolute", bottom: "44px", left: "48px", fontSize: T.small, fontWeight: WEIGHT.bold, color: rgba("#fff", 0.25), letterSpacing: "2.5px", textTransform: "uppercase" }}>
          {businessName}
        </div>
      </div>
    </div>
  );
}

// ─── CoverMinimal — sem imagem, tipografia gigante centralizada ──
function CoverMinimal({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const bg = slide.colorOverride ?? color;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070e", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", overflow: "hidden", fontFamily: font }}>
      {/* ambient glow */}
      <div style={{ position: "absolute", top: "8%", right: "-15%", width: "500px", height: "500px", borderRadius: "50%", background: rgba(bg, 0.12), filter: "blur(80px)" }} />
      <div style={{ position: "absolute", bottom: "5%", left: "-12%", width: "360px", height: "360px", borderRadius: "50%", background: rgba(bg, 0.08), filter: "blur(100px)" }} />
      {/* top accent */}
      <div style={{ position: "absolute", top: "56px", left: "50%", transform: "translateX(-50%)", width: "56px", height: "3px", background: bg, borderRadius: "2px" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 64px", maxWidth: "100%" }}>
        {slide.badge && (
          <div style={{ fontSize: T.eyebrow, letterSpacing: "5px", fontWeight: WEIGHT.black, color: bg, textTransform: "uppercase", marginBottom: "32px" }}>
            {slide.badge}
          </div>
        )}
        <h1 style={{ margin: 0, fontSize: T.h1, fontWeight: WEIGHT.black, color: "#fff", lineHeight: 1.0, letterSpacing: "-3px", marginBottom: "24px" }}>
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p style={{ margin: 0, fontSize: T.body, color: rgba("#fff", 0.55), lineHeight: 1.5, fontWeight: WEIGHT.regular }}>
            {slide.subtitle}
          </p>
        )}
      </div>

      {/* bottom business name */}
      <div style={{ position: "absolute", bottom: "48px", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ width: "28px", height: "1.5px", background: rgba(bg, 0.6) }} />
        <span style={{ fontSize: T.small, fontWeight: WEIGHT.bold, color: rgba("#fff", 0.35), letterSpacing: "3px", textTransform: "uppercase" }}>{businessName}</span>
        <div style={{ width: "28px", height: "1.5px", background: rgba(bg, 0.6) }} />
      </div>
    </div>
  );
}

// ─── CoverMagazine — full image, título massivo bottom, faixa brand ──
function CoverMagazine({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const bg = slide.colorOverride ?? color;
  const op = slide.overlayOpacity ?? 0.6;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", fontFamily: font }}>
      {slide.imageUrl
        ? <img src={slide.imageUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        : <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, #1a0a2e, ${rgba(bg, 0.5)})` }} />
      }
      {/* gradient overlay — stronger bottom */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,${op}) 55%, rgba(0,0,0,0.92) 100%)` }} />

      {/* badge — top right */}
      {slide.badge && (
        <div style={{ position: "absolute", top: "36px", right: "36px", background: bg, color: "#fff", fontSize: T.small, fontWeight: WEIGHT.black, letterSpacing: "2px", textTransform: "uppercase", padding: "10px 20px", borderRadius: "6px" }}>
          {slide.badge}
        </div>
      )}
      {/* left edge accent line */}
      <div style={{ position: "absolute", left: "28px", top: "52px", bottom: "108px", width: "2.5px", background: `linear-gradient(to bottom, ${bg}, transparent)` }} />

      {/* title block — bottom */}
      <div style={{ position: "absolute", bottom: "84px", left: 0, right: 0, padding: "0 40px 0 44px" }}>
        <h1 style={{ margin: 0, fontSize: T.h1, fontWeight: WEIGHT.black, color: "#fff", lineHeight: 1.0, letterSpacing: "-3px", textShadow: "0 4px 32px rgba(0,0,0,0.7)", marginBottom: "16px" }}>
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p style={{ margin: 0, fontSize: T.body, color: rgba("#fff", 0.72), lineHeight: 1.4, fontWeight: WEIGHT.regular }}>
            {slide.subtitle}
          </p>
        )}
      </div>

      {/* brand band footer */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "56px", background: bg, display: "flex", alignItems: "center", paddingLeft: "44px", gap: "12px" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: rgba("#fff", 0.6) }} />
        <span style={{ fontSize: T.eyebrow, fontWeight: WEIGHT.black, color: "#fff", letterSpacing: "3px", textTransform: "uppercase" }}>{businessName}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  NOVOS LAYOUTS — FEATURE CONTENT
// ════════════════════════════════════════════════════════════

// ─── FeatureHighlight — dark bg, glow, feature + lista numerada ──
function FeatureHighlight({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const bg = slide.colorOverride ?? color;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#07070e", overflow: "hidden", fontFamily: font }}>
      {slide.imageUrl && (
        <>
          <img src={slide.imageUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.18 }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(7,7,14,0.72)" }} />
        </>
      )}
      {/* glow right */}
      <div style={{ position: "absolute", right: "-80px", top: "45%", transform: "translateY(-50%)", width: "400px", height: "400px", borderRadius: "50%", background: rgba(bg, 0.2), filter: "blur(80px)" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 48px" }}>
        <div style={{ width: "36px", height: "3px", background: bg, borderRadius: "2px", marginBottom: "28px" }} />
        {slide.badge && (
          <div style={{ fontSize: T.eyebrow, letterSpacing: "3px", fontWeight: WEIGHT.black, color: bg, textTransform: "uppercase", marginBottom: "16px" }}>
            {slide.badge}
          </div>
        )}
        <h2 style={{ margin: "0 0 28px", fontSize: T.h3, fontWeight: WEIGHT.black, color: "#fff", lineHeight: 1.05, letterSpacing: "-1px" }}>
          {slide.title}
        </h2>

        {slide.listItems?.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {slide.listItems.slice(0, 4).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                  <span style={{ fontSize: "18px", fontWeight: WEIGHT.black, color: "#fff", lineHeight: 1 }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: T.caption, color: rgba("#fff", 0.82), lineHeight: 1.4, fontWeight: WEIGHT.medium, paddingTop: "4px" }}>{item}</span>
              </div>
            ))}
          </div>
        ) : slide.body ? (
          <p style={{ margin: 0, fontSize: T.body, color: rgba("#fff", 0.7), lineHeight: 1.5, fontWeight: WEIGHT.regular }}>
            {bodyText(slide.body)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// ─── FullColor — slide inteiro na cor da marca, texto branco bold ──
function FullColor({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: color, fontFamily: font, overflow: "hidden" }}>
      {/* Texture overlay */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.055,
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(255,255,255,0.6) 28px, rgba(255,255,255,0.6) 29px)" }} />
      {/* Top-right circle — decorative */}
      <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "420px", height: "420px",
        borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
      {/* Bottom-left circle */}
      <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "300px", height: "300px",
        borderRadius: "50%", background: "rgba(0,0,0,0.10)" }} />
      {/* Horizontal rule mid-right */}
      <div style={{ position: "absolute", right: "56px", top: "50%", transform: "translateY(-50%)",
        width: "1px", height: "200px", background: "rgba(255,255,255,0.15)" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        justifyContent: "space-between", padding: "68px 72px" }}>
        {/* Top */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: T.small, fontWeight: WEIGHT.black, color: "rgba(255,255,255,0.65)",
            letterSpacing: "3.5px", textTransform: "uppercase" as const }}>{businessName}</span>
          {slide.badge && (
            <div style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)",
              borderRadius: "8px", padding: "8px 20px",
              fontSize: T.badge, fontWeight: WEIGHT.black, color: "#fff", letterSpacing: "1.5px" }}>
              {slide.badge}
            </div>
          )}
        </div>

        {/* Center: bold text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ width: "52px", height: "4px", background: "rgba(255,255,255,0.45)", borderRadius: "2px" }} />
          <h2 style={{ margin: 0, fontSize: T.h1, fontWeight: WEIGHT.black, color: "#fff",
            lineHeight: "1.0", letterSpacing: "-3px", maxWidth: "880px" }}>
            {slide.title}
          </h2>
          {(slide.body || slide.subtitle) && (
            <p style={{ margin: 0, fontSize: T.h4, color: "rgba(255,255,255,0.80)", lineHeight: "1.5", maxWidth: "720px" }}>
              {bodyText(slide.body) || slide.subtitle}
            </p>
          )}
          {slide.listItems && slide.listItems.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "8px" }}>
              {slide.listItems.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.55)", flexShrink: 0 }} />
                  <span style={{ fontSize: T.body, fontWeight: WEIGHT.semibold, color: "rgba(255,255,255,0.92)" }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom rule */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.18)" }} />
      </div>
    </div>
  );
}

// ─── EditorialTop — foto no topo 45% (sem overlay), painel branco baixo ──
function EditorialTop({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const hasImage = !!slide.imageUrl;
  const imgH = Math.round(h * 0.44);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: font, overflow: "hidden" }}>
      {/* Image panel — top 44%, barely touched */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${imgH}px`, overflow: "hidden" }}>
        {hasImage
          ? <img src={slide.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${shade(color, -28)} 0%, ${color} 100%)` }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(255,255,255,0.5) 28px, rgba(255,255,255,0.5) 29px)" }} />
            </div>
        }
        {/* Minimal bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "32px",
          background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.15))" }} />
      </div>

      {/* Brand accent bar — between image and text */}
      <div style={{ position: "absolute", top: `${imgH}px`, left: 0, right: 0, height: "5px", background: color }} />

      {/* Text panel — bottom 56% */}
      <div style={{ position: "absolute", top: `${imgH + 5}px`, left: 0, right: 0, bottom: 0,
        background: "#fff", padding: "36px 64px 52px" }}>
        {slide.badge && (
          <div style={{ fontSize: T.badge, fontWeight: WEIGHT.black, color,
            letterSpacing: "2.5px", textTransform: "uppercase" as const, marginBottom: "10px" }}>
            {slide.badge}
          </div>
        )}
        <h2 style={{ margin: "0 0 14px", fontSize: T.h3, fontWeight: WEIGHT.black, color: "#0a0a12",
          lineHeight: "1.08", letterSpacing: "-1.5px" }}>
          {slide.title}
        </h2>
        <div style={{ width: "40px", height: "3px", background: color, borderRadius: "2px", marginBottom: "20px" }} />
        {(slide.body || slide.subtitle) && (
          <p style={{ margin: "0 0 18px", fontSize: T.caption, color: "#4a4a5a", lineHeight: "1.55" }}>
            {slide.body || slide.subtitle}
          </p>
        )}
        {slide.listItems && slide.listItems.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {slide.listItems.slice(0, 3).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "6px",
                  background: rgba(color, 0.1), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "3px" }}>
                  <span style={{ fontSize: "15px", fontWeight: WEIGHT.black, color, lineHeight: 1 }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: T.caption, color: "#2a2a3a", lineHeight: "1.4", fontWeight: WEIGHT.medium }}>{item}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ position: "absolute", bottom: "28px", left: "64px",
          fontSize: T.small, fontWeight: WEIGHT.bold, color: rgba(color, 0.55), letterSpacing: "1px" }}>
          {businessName}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  NOVOS LAYOUTS — CTA VARIANTS
// ════════════════════════════════════════════════════════════

// ─── CTAMinimal — fundo branco, clean, botão WhatsApp elegante ──
function CTAMinimal({ slide, color, businessName, city, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; city: string; font: string; h: number }) {
  const bg = slide.colorOverride ?? color;
  const WA = "#25D366";
  return (
    <div style={{ position: "absolute", inset: 0, background: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", overflow: "hidden", fontFamily: font }}>
      {/* top brand line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "5px", background: `linear-gradient(to right, ${bg}, ${shade(bg, 20)})` }} />
      {/* subtle dot texture */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: `radial-gradient(${bg} 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />

      <div style={{ position: "relative", textAlign: "center", padding: "0 64px" }}>
        {slide.badge && (
          <div style={{ fontSize: T.eyebrow, letterSpacing: "4px", fontWeight: WEIGHT.black, color: bg, textTransform: "uppercase", marginBottom: "28px" }}>
            {slide.badge}
          </div>
        )}
        <h2 style={{ margin: "0 0 16px", fontSize: T.h3, fontWeight: WEIGHT.black, color: "#0a0a0f", lineHeight: 1.05, letterSpacing: "-1.5px" }}>
          {slide.title || "Pronto para começar?"}
        </h2>
        {(slide.subtitle || slide.body) && (
          <p style={{ margin: "0 0 44px", fontSize: T.caption, color: "#666", lineHeight: 1.45, fontWeight: WEIGHT.regular }}>
            {slide.subtitle || bodyText(slide.body)}
          </p>
        )}
        {/* WhatsApp button */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "16px", background: WA, color: "#fff", padding: "28px 52px", borderRadius: "100px", boxShadow: "0 12px 40px rgba(37,211,102,0.3)" }}>
          <WhatsAppIcon size={36} color="#fff" />
          <span style={{ fontSize: T.body, fontWeight: WEIGHT.black, letterSpacing: "-0.5px" }}>Falar no WhatsApp</span>
        </div>
        {/* business info */}
        <div style={{ marginTop: "36px", fontSize: T.small, color: "#bbb", letterSpacing: "1px" }}>
          {businessName}{city ? ` • ${city}` : ""}
        </div>
      </div>
    </div>
  );
}

// ─── CTASplit — imagem esq 40% + painel CTA dir 60% ──────────
function CTASplit({ slide, color, businessName, city, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; city: string; font: string; h: number }) {
  const bg = slide.colorOverride ?? color;
  const WA = "#25D366";
  const dark = "#07070e";
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", overflow: "hidden", fontFamily: font }}>
      {/* Left — image panel */}
      <div style={{ width: "42%", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        {slide.imageUrl
          ? <img src={slide.imageUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${rgba(bg, 0.6)}, ${rgba(bg, 0.2)})` }} />
        }
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, transparent 50%, ${dark})` }} />
        {/* brand accent bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "5px", background: bg }} />
      </div>

      {/* Right — CTA panel */}
      <div style={{ width: "58%", background: dark, display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 48px" }}>
        <div style={{ width: "32px", height: "3px", background: bg, borderRadius: "2px", marginBottom: "24px" }} />
        {slide.badge && (
          <div style={{ fontSize: T.eyebrow, letterSpacing: "3px", fontWeight: WEIGHT.black, color: bg, textTransform: "uppercase", marginBottom: "16px" }}>
            {slide.badge}
          </div>
        )}
        <h2 style={{ margin: "0 0 16px", fontSize: T.h4, fontWeight: WEIGHT.black, color: "#fff", lineHeight: 1.05, letterSpacing: "-1px" }}>
          {slide.title || "Fale conosco agora"}
        </h2>
        {(slide.subtitle || slide.body) && (
          <p style={{ margin: "0 0 36px", fontSize: T.caption, color: rgba("#fff", 0.55), lineHeight: 1.4, fontWeight: WEIGHT.regular }}>
            {slide.subtitle || bodyText(slide.body)}
          </p>
        )}
        {/* WhatsApp button */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "14px", background: WA, color: "#fff", padding: "22px 36px", borderRadius: "12px", width: "fit-content", boxShadow: "0 8px 28px rgba(37,211,102,0.25)" }}>
          <WhatsAppIcon size={30} color="#fff" />
          <span style={{ fontSize: T.caption, fontWeight: WEIGHT.black }}>Falar no WhatsApp</span>
        </div>
        {/* business info */}
        <div style={{ marginTop: "28px", fontSize: T.small, color: rgba("#fff", 0.28), letterSpacing: "2px", textTransform: "uppercase" }}>
          {businessName}{city ? ` · ${city}` : ""}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN RENDERER
// ════════════════════════════════════════════════════════════

interface CarouselSlideRendererProps {
  slide: PremiumCarouselSlide;
  business: {
    business_name: string;
    primary_color: string;
    city?: string;
    whatsapp?: string;
    font_style?: string | null;
  };
  format?: "4/5" | "1/1" | "9/16";
  /** Rendered width in px (default 360) */
  width?: number;
  /** If true, renders at canonical 1080px (for PNG export) */
  canonical?: boolean;
}

const FONT_MAP: Record<string, string> = {
  inter:      "'Inter', 'system-ui', sans-serif",
  poppins:    "'Poppins', 'system-ui', sans-serif",
  montserrat: "'Montserrat', 'system-ui', sans-serif",
  opensans:   "'Open Sans', 'system-ui', sans-serif",
  nunito:     "'Nunito', 'system-ui', sans-serif",
};

export default function CarouselSlideRenderer({
  slide,
  business,
  format = "4/5",
  width = 360,
  canonical = false,
}: CarouselSlideRendererProps) {
  const h = slideHeight(format);
  const renderW = canonical ? SLIDE_W : width;
  const renderH = canonical ? h : Math.round(h * (width / SLIDE_W));
  const scale = canonical ? 1 : width / SLIDE_W;

  const color = slide.colorOverride || business.primary_color || "#7c3aed";
  const businessName = business.business_name || "Meu Negócio";
  const city = business.city || "";
  const whatsapp = business.whatsapp || "";
  const font = FONT_MAP[business.font_style ?? "inter"] ?? FONT_MAP.inter;

  const layoutProps = { slide, color, businessName, city, whatsapp, font, h };

  function renderLayout() {
    switch (slide.layout as CarouselLayout) {
      // Covers
      case "cover_hero":        return <CoverHero        {...layoutProps} />;
      case "cover_split":       return <CoverSplit       {...layoutProps} />;
      case "cover_minimal":     return <CoverMinimal     {...layoutProps} />;
      case "cover_magazine":    return <CoverMagazine    {...layoutProps} />;
      // Content
      case "bold_statement":    return <BoldStatement    {...layoutProps} />;
      case "split_image":       return <SplitImage       {...layoutProps} />;
      case "card_glass":        return <CardGlass        {...layoutProps} />;
      case "content_list":      return <ContentList      {...layoutProps} />;
      case "image_overlay":     return <ImageOverlay     {...layoutProps} />;
      case "feature_highlight": return <FeatureHighlight {...layoutProps} />;
      case "before_after":      return <BeforeAfter      {...layoutProps} />;
      case "stats_card":        return <StatsCard        {...layoutProps} />;
      case "testimonial_quote": return <TestimonialQuote {...layoutProps} />;
      case "steps_process":     return <StepsProcess     {...layoutProps} />;
      case "full_color":        return <FullColor        {...layoutProps} />;
      case "editorial_top":     return <EditorialTop     {...layoutProps} />;
      // CTAs
      case "cta_final":         return <CTAFinal         {...layoutProps} />;
      case "cta_minimal":       return <CTAMinimal       {...layoutProps} />;
      case "cta_split":         return <CTASplit         {...layoutProps} />;
      default:                  return <ContentList      {...layoutProps} />;
    }
  }

  if (canonical) {
    return (
      <div style={{
        width: SLIDE_W, height: h,
        position: "relative", overflow: "hidden",
        fontFamily: font,
      }}>
        {renderLayout()}
      </div>
    );
  }

  return (
    <div style={{
      width: renderW, height: renderH,
      position: "relative", overflow: "hidden",
      borderRadius: "12px",
      flexShrink: 0,
    }}>
      <div style={{
        width: SLIDE_W, height: h,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        position: "absolute", top: 0, left: 0,
        fontFamily: font,
      }}>
        {renderLayout()}
      </div>
    </div>
  );
}

// ─── Export helper: returns ref wrapper for html2canvas ────────
export function getSlideCanvasSize(format: "4/5" | "1/1" | "9/16"): { w: number; h: number } {
  return { w: SLIDE_W, h: slideHeight(format) };
}
