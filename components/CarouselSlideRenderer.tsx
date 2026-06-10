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
  const darkBase = shade(color, -35);
  const gradientBg = `linear-gradient(160deg, ${darkBase} 0%, ${color} 55%, ${tint(color, 40)} 100%)`;

  return (
    <div style={{ position: "absolute", inset: 0, background: hasImage ? "#08080f" : gradientBg, fontFamily: font, overflow: "hidden" }}>
      {hasImage && (
        <BgImage url={slide.imageUrl} overlay="linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.18) 100%)" />
      )}
      {!hasImage && (
        <>
          {/* Horizontal stripe texture */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)" }} />
          {/* Large blob top-right */}
          <div style={{ position: "absolute", top: "-200px", right: "-180px", width: "760px", height: "760px", borderRadius: "50%", background: rgba("#fff", 0.07), filter: "blur(1px)" }} />
          {/* Bottom left blob */}
          <div style={{ position: "absolute", bottom: "-250px", left: "-180px", width: "660px", height: "660px", borderRadius: "50%", background: rgba("#000", 0.18) }} />
          {/* Ring decorations */}
          <div style={{ position: "absolute", top: "28%", right: "6%", width: "220px", height: "220px", borderRadius: "50%", border: `2px solid ${rgba("#fff", 0.14)}` }} />
          <div style={{ position: "absolute", top: "36%", right: "13%", width: "100px", height: "100px", borderRadius: "50%", border: `1.5px solid ${rgba("#fff", 0.09)}` }} />
          <div style={{ position: "absolute", top: "32%", right: "9%", width: "18px", height: "18px", borderRadius: "50%", background: rgba("#fff", 0.25) }} />
        </>
      )}

      <div style={{ position: "absolute", inset: 0, padding: "72px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Top */}
        <BusinessPill name={businessName} color={color} textOnDark />

        {/* Bottom */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {slide.badge && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "14px",
              background: rgba(color, 0.22), border: `1px solid ${rgba(color, 0.45)}`,
              borderRadius: "10px", padding: "10px 24px", alignSelf: "flex-start",
            }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ fontSize: T.eyebrow, fontWeight: WEIGHT.black, color: "#fff", letterSpacing: "3px", textTransform: "uppercase" }}>
                {slide.badge}
              </span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h1 style={{
              margin: 0, fontSize: T.h1, fontWeight: WEIGHT.black, color: "#fff",
              lineHeight: "1.0", letterSpacing: "-2.5px",
              textShadow: "0 4px 32px rgba(0,0,0,0.5)",
            }}>
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p style={{ margin: 0, fontSize: T.h4, fontWeight: WEIGHT.light, color: "rgba(255,255,255,0.78)", lineHeight: "1.45", letterSpacing: "-0.5px" }}>
                {slide.subtitle}
              </p>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <AccentLine color={color} width={72} />
            <span style={{ fontSize: T.small, color: "rgba(255,255,255,0.4)", fontWeight: WEIGHT.medium, letterSpacing: "0.5px" }}>
              Deslize para ver
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoldStatement({ slide, color, font, h }: { slide: PremiumCarouselSlide; color: string; font: string; h: number }) {
  const isDarkBg = slide.bgVariant === "dark";
  const bgColor = isDarkBg ? "#0a0a0f" : color;
  const isColorDark = isDark(bgColor);
  const textColor = isColorDark ? "#fff" : "#111";
  const subColor = isColorDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)";
  const accentColor = isDarkBg ? color : (isColorDark ? "#fff" : shade(color, -30));

  const slideNumber = slide.slideNumber;

  return (
    <div style={{ position: "absolute", inset: 0, background: bgColor, fontFamily: font, overflow: "hidden" }}>
      {/* Decorative elements */}
      <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "500px", height: "500px", borderRadius: "50%", border: `3px solid ${rgba(accentColor, 0.1)}` }} />
      <div style={{ position: "absolute", bottom: "-100px", left: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: rgba(accentColor, 0.05) }} />

      {/* Watermark number */}
      <div style={{
        position: "absolute", right: "40px", bottom: "200px",
        fontSize: "320px", fontWeight: WEIGHT.black, lineHeight: "1",
        color: isColorDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)",
        fontVariantNumeric: "tabular-nums",
        userSelect: "none",
      }}>
        {slideNumber}
      </div>

      <div style={{ position: "absolute", inset: 0, padding: "72px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Top: badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {slide.badge && <Badge text={slide.badge} color={accentColor} />}
        </div>

        {/* Center content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <AccentLine color={accentColor} width={60} />
          <h2 style={{
            margin: 0, fontSize: T.h1, fontWeight: WEIGHT.black, color: textColor,
            lineHeight: "1.05", letterSpacing: "-2px",
          }}>
            {slide.title}
          </h2>
          {(slide.body || slide.subtitle) && (
            <p style={{ margin: 0, fontSize: T.body, fontWeight: WEIGHT.regular, color: subColor, lineHeight: "1.6", maxWidth: "800px" }}>
              {slide.body || slide.subtitle}
            </p>
          )}
        </div>

        {/* Bottom line */}
        <div style={{ height: "2px", background: rgba(accentColor, 0.2), borderRadius: "1px" }} />
      </div>
    </div>
  );
}

function SplitImage({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const hasImage = !!slide.imageUrl;
  const rightBg = isDark(color) ? color : "#0a0a0f";
  const textColor = "#fff";
  const subColor = "rgba(255,255,255,0.7)";
  const itemColor = "rgba(255,255,255,0.85)";

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", fontFamily: font }}>
      {/* Left: image */}
      <div style={{ width: "44%", position: "relative", flexShrink: 0, overflow: "hidden" }}>
        {hasImage ? (
          <>
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${slide.imageUrl})`,
              backgroundSize: "cover", backgroundPosition: "center",
            }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.2) 0%, transparent 100%)" }} />
          </>
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(160deg, ${tint(color,20)} 0%, ${shade(color,-10)} 100%)`,
          }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "140px", height: "140px", borderRadius: "50%", border: `4px solid ${rgba("#fff",0.2)}` }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "80px", height: "80px", borderRadius: "50%", background: rgba("#fff",0.1) }} />
          </div>
        )}

        {/* Badge overlay */}
        {slide.badge && (
          <div style={{
            position: "absolute", bottom: "48px", left: "32px",
            background: color, color: isDark(color) ? "#fff" : "#111",
            borderRadius: "12px", padding: "10px 24px",
            fontSize: T.badge, fontWeight: WEIGHT.black, letterSpacing: "1px",
          }}>
            {slide.badge}
          </div>
        )}
      </div>

      {/* Right: content */}
      <div style={{
        flex: 1, background: rightBg, padding: "72px 64px",
        display: "flex", flexDirection: "column", justifyContent: "center", gap: "32px",
        position: "relative", overflow: "hidden",
      }}>
        {/* BG decoration */}
        <div style={{ position: "absolute", bottom: "-80px", right: "-80px", width: "380px", height: "380px", borderRadius: "50%", background: rgba(color, 0.08) }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "relative" }}>
          <AccentLine color={color} width={56} />
          <h2 style={{ margin: 0, fontSize: T.h3, fontWeight: WEIGHT.black, color: textColor, lineHeight: "1.15", letterSpacing: "-1.5px" }}>
            {slide.title}
          </h2>
          {(slide.subtitle || slide.body) && (
            <p style={{ margin: 0, fontSize: T.caption, fontWeight: WEIGHT.regular, color: subColor, lineHeight: "1.6" }}>
              {slide.subtitle || slide.body}
            </p>
          )}
        </div>

        {slide.listItems && slide.listItems.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", color: itemColor }}>
            {slide.listItems.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ fontSize: T.caption, fontWeight: WEIGHT.medium }}>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Business name bottom */}
        <div style={{ marginTop: "auto", paddingTop: "32px", borderTop: `1px solid rgba(255,255,255,0.1)` }}>
          <span style={{ fontSize: T.small, color: rgba(color, 0.9), fontWeight: WEIGHT.semibold }}>{businessName}</span>
        </div>
      </div>
    </div>
  );
}

function CardGlass({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const hasImage = !!slide.imageUrl;
  const gradientBg = `linear-gradient(150deg, ${shade(color,-25)} 0%, ${color} 100%)`;

  return (
    <div style={{ position: "absolute", inset: 0, background: hasImage ? "#111" : gradientBg, fontFamily: font }}>
      <BgImage url={slide.imageUrl} overlay="rgba(0,0,0,0.35)" />

      {/* Decorative top-right badge */}
      {slide.badge && (
        <div style={{
          position: "absolute", top: "56px", right: "56px",
          background: color, borderRadius: "12px", padding: "10px 24px",
          fontSize: T.badge, fontWeight: WEIGHT.black,
          color: isDark(color) ? "#fff" : "#111",
        }}>
          {slide.badge}
        </div>
      )}

      {/* Business name */}
      <div style={{ position: "absolute", top: "56px", left: "56px" }}>
        <BusinessPill name={businessName} color={color} textOnDark />
      </div>

      {/* Glass card */}
      <div style={{
        position: "absolute",
        left: "56px", right: "56px",
        bottom: "72px",
        background: "rgba(10,10,20,0.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "28px",
        border: "1.5px solid rgba(255,255,255,0.13)",
        padding: "56px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <AccentLine color={color} width={56} />

          <h2 style={{ margin: 0, fontSize: T.h3, fontWeight: WEIGHT.black, color: "#fff", lineHeight: "1.1", letterSpacing: "-1.5px" }}>
            {slide.title}
          </h2>

          {(slide.body || slide.subtitle) && (
            <p style={{ margin: 0, fontSize: T.body, fontWeight: WEIGHT.regular, color: "rgba(255,255,255,0.72)", lineHeight: "1.55" }}>
              {slide.body || slide.subtitle}
            </p>
          )}

          {slide.listItems && slide.listItems.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "4px" }}>
              {slide.listItems.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", color: "rgba(255,255,255,0.85)" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: T.caption, fontWeight: WEIGHT.medium }}>{item}</span>
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
  const isAccent = slide.bgVariant === "accent";
  const bg = isAccent ? rgba(color, 0.06) : "#ffffff";
  const textColor = "#0f0f14";
  const subColor = "#555";
  const accentBg = isAccent ? rgba(color, 0.12) : rgba(color, 0.08);

  return (
    <div style={{ position: "absolute", inset: 0, background: bg, fontFamily: font }}>
      {/* Top brand bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "8px", background: color }} />

      {/* Decorative corner */}
      <div style={{ position: "absolute", top: "8px", right: 0, width: "220px", height: "220px", background: rgba(color, 0.06), borderBottomLeftRadius: "100px" }} />

      <div style={{ position: "absolute", inset: 0, padding: "80px 72px 72px", display: "flex", flexDirection: "column", gap: "0" }}>
        {/* Header section */}
        <div style={{ marginBottom: "48px" }}>
          {slide.badge && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              background: accentBg, border: `1.5px solid ${rgba(color, 0.25)}`,
              borderRadius: "8px", padding: "8px 20px", marginBottom: "24px",
            }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
              <span style={{ fontSize: T.badge, fontWeight: WEIGHT.black, color, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                {slide.badge}
              </span>
            </div>
          )}
          <h2 style={{ margin: "0 0 16px", fontSize: T.h2, fontWeight: WEIGHT.black, color: textColor, lineHeight: "1.1", letterSpacing: "-1.5px" }}>
            {slide.title}
          </h2>
          <AccentLine color={color} width={64} />
        </div>

        {/* List */}
        {slide.listItems && slide.listItems.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", flex: 1 }}>
            {slide.listItems.map((item, i) => (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "12px",
                    background: rgba(color, 0.12), border: `1.5px solid ${rgba(color,0.25)}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <span style={{ fontSize: T.caption, fontWeight: WEIGHT.black, color }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: T.body, fontWeight: WEIGHT.medium, color: textColor, lineHeight: "1.4", paddingTop: "8px" }}>{item}</span>
                </div>
                {i < (slide.listItems?.length ?? 0) - 1 && (
                  <div style={{ height: "1px", background: rgba(color, 0.12), marginTop: "28px", marginLeft: "68px" }} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex: 1 }}>
            {(slide.body || slide.subtitle) && (
              <p style={{ margin: 0, fontSize: T.h4, fontWeight: WEIGHT.regular, color: subColor, lineHeight: "1.6" }}>
                {slide.body || slide.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Bottom */}
        <div style={{ marginTop: "auto", paddingTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${rgba(color, 0.12)}` }}>
          <span style={{ fontSize: T.small, fontWeight: WEIGHT.semibold, color: rgba(color, 0.9) }}>{businessName}</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: i === 0 ? "28px" : "8px", height: "8px", borderRadius: "4px", background: i === 0 ? color : rgba(color, 0.25) }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageOverlay({ slide, color, businessName, font, h }: { slide: PremiumCarouselSlide; color: string; businessName: string; font: string; h: number }) {
  const hasImage = !!slide.imageUrl;
  const gradientBg = `linear-gradient(160deg, ${shade(color,-15)} 0%, ${tint(color,20)} 100%)`;

  return (
    <div style={{ position: "absolute", inset: 0, background: hasImage ? "#111" : gradientBg, fontFamily: font }}>
      {hasImage && (
        <BgImage url={slide.imageUrl} overlay="linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.88) 100%)" />
      )}
      {!hasImage && (
        <>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.5) 100%)` }} />
          <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "300px", height: "300px", borderRadius: "50%", border: `3px solid ${rgba("#fff",0.1)}` }} />
          <div style={{ position: "absolute", top: "28%", left: "50%", transform: "translateX(-50%)", width: "160px", height: "160px", borderRadius: "50%", background: rgba("#fff",0.06) }} />
        </>
      )}

      <div style={{ position: "absolute", inset: 0, padding: "64px 72px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <BusinessPill name={businessName} color={color} textOnDark />
          {slide.badge && (
            <div style={{
              background: color, borderRadius: "50%", width: "80px", height: "80px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: T.caption, fontWeight: WEIGHT.black, color: isDark(color) ? "#fff" : "#111",
            }}>
              {slide.badge}
            </div>
          )}
        </div>

        {/* Bottom content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {slide.badge && (
            <div style={{
              alignSelf: "flex-start", background: rgba(color,0.3), border: `1px solid ${rgba(color,0.5)}`,
              borderRadius: "6px", padding: "6px 18px",
              fontSize: T.eyebrow, fontWeight: WEIGHT.black, color: "#fff", letterSpacing: "2px", textTransform: "uppercase",
            }}>
              {slide.badge}
            </div>
          )}
          <h2 style={{ margin: 0, fontSize: T.h2, fontWeight: WEIGHT.black, color: "#fff", lineHeight: "1.08", letterSpacing: "-2px", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
            {slide.title}
          </h2>
          {(slide.body || slide.subtitle) && (
            <p style={{ margin: 0, fontSize: T.body, color: "rgba(255,255,255,0.8)", fontWeight: WEIGHT.regular, lineHeight: "1.5" }}>
              {slide.body || slide.subtitle}
            </p>
          )}
          <AccentLine color={color} width={72} />
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
      <div style={{ position: "absolute", top: "-200px", left: "50%", transform: "translateX(-50%)", width: "800px", height: "800px", borderRadius: "50%", background: rgba(color, 0.10), filter: "blur(80px)" }} />
      {/* Ambient glow — WA bottom-right */}
      <div style={{ position: "absolute", bottom: "-200px", right: "-100px", width: "600px", height: "600px", borderRadius: "50%", background: rgba(WA_COLOR, 0.08), filter: "blur(90px)" }} />
      {/* Ambient glow — color bottom-left */}
      <div style={{ position: "absolute", bottom: "-120px", left: "-80px", width: "480px", height: "480px", borderRadius: "50%", background: rgba(color, 0.06), filter: "blur(70px)" }} />

      {/* Subtle grid */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.025,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
        backgroundSize: "52px 52px" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 72px", gap: "0" }}>
        {/* Top decoration */}
        <div style={{ width: "4px", height: "60px", background: rgba(color, 0.5), borderRadius: "2px", marginBottom: "40px" }} />

        {/* Business name */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
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

  const color = business.primary_color || "#7c3aed";
  const businessName = business.business_name || "Meu Negócio";
  const city = business.city || "";
  const whatsapp = business.whatsapp || "";
  const font = FONT_MAP[business.font_style ?? "inter"] ?? FONT_MAP.inter;

  const layoutProps = { slide, color, businessName, city, whatsapp, font, h };

  function renderLayout() {
    switch (slide.layout as CarouselLayout) {
      case "cover_hero":    return <CoverHero    {...layoutProps} />;
      case "bold_statement":return <BoldStatement {...layoutProps} />;
      case "split_image":   return <SplitImage   {...layoutProps} />;
      case "card_glass":    return <CardGlass     {...layoutProps} />;
      case "content_list":  return <ContentList   {...layoutProps} />;
      case "image_overlay": return <ImageOverlay  {...layoutProps} />;
      case "cta_final":     return <CTAFinal      {...layoutProps} />;
      default:              return <ContentList   {...layoutProps} />;
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
