'use client'

import { useState, useCallback } from 'react'

const NICHE_IMAGES: Record<string, string[]> = {
  barbearia: [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?fit=crop&w=900&q=80",
  ],
  odontologia: [
    "https://images.unsplash.com/photo-1588776814546-daab30f310ce?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1606811841689-23dfddce3e66?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?fit=crop&w=900&q=80",
  ],
  "clinica-medica": [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?fit=crop&w=900&q=80",
  ],
  otica: [
    "https://images.unsplash.com/photo-1508296695146-257a814070b4?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?fit=crop&w=900&q=80",
  ],
  "personal-trainer": [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?fit=crop&w=900&q=80",
  ],
  estetica: [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?fit=crop&w=900&q=80",
  ],
  "loja-de-roupa": [
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?fit=crop&w=900&q=80",
  ],
  imobiliaria: [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?fit=crop&w=900&q=80",
  ],
  restaurante: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?fit=crop&w=900&q=80",
  ],
  mecanica: [
    "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1486754735734-325b5831c3ad?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?fit=crop&w=900&q=80",
  ],
  serralheria: [
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1590418606746-018840f9cd0e?fit=crop&w=900&q=80",
  ],
  outro: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?fit=crop&w=900&q=80",
  ],
}

// Dark/warm base tone per niche — used in the color overlay gradient
const NICHE_BASE: Record<string, string> = {
  barbearia:          "#0f2040",
  odontologia:        "#1a4a6e",
  "clinica-medica":   "#0f3d25",
  otica:              "#2a2a2a",
  "personal-trainer": "#0d0d0d",
  estetica:           "#5c1a3a",
  "loja-de-roupa":    "#2d1a45",
  imobiliaria:        "#0d1a4a",
  restaurante:        "#6b1a06",
  mecanica:           "#111111",
  serralheria:        "#101820",
  outro:              "#1a2030",
}

const IconIG = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
)

const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

interface Props {
  niche: string
  color: string
  city: string
  instagram?: string | null
  nicheLabel: string
}

export default function HeroCover({ niche, color, city, instagram, nicheLabel }: Props) {
  const images = NICHE_IMAGES[niche] ?? NICHE_IMAGES.outro
  const base = NICHE_BASE[niche] ?? NICHE_BASE.outro
  const [current, setCurrent] = useState(0)

  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length])

  const btnStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    width: '36px', height: '36px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    border: '1px solid rgba(255,255,255,0.28)',
    color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
  }

  return (
    <div style={{ height: '260px', position: 'relative', overflow: 'hidden', background: base }}>

      {/* Crossfade image layers */}
      {images.map((url, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === current ? 1 : 0,
            transition: 'opacity 0.7s ease',
          }}
        />
      ))}

      {/* Color tint overlay: niche base → primary color */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(150deg, ${base}cc 0%, ${color}aa 100%)`,
      }} />

      {/* Bottom vignette for readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.65) 100%)',
      }} />

      {/* Niche label — top left */}
      <div style={{ position: 'absolute', top: '18px', left: '18px', zIndex: 10 }}>
        <div style={{
          background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.22)', borderRadius: '100px', padding: '5px 12px',
        }}>
          <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
            {nicheLabel}
          </span>
        </div>
      </div>

      {/* Instagram — top right */}
      {instagram && (
        <a
          href={`https://instagram.com/${instagram.replace('@', '')}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            position: 'absolute', top: '18px', right: '18px', zIndex: 10,
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.22)', borderRadius: '100px', padding: '5px 12px',
            color: '#fff', fontSize: '11px', fontWeight: 700, textDecoration: 'none',
          }}
        >
          <IconIG /> {instagram}
        </a>
      )}

      {/* City — bottom left */}
      <div style={{
        position: 'absolute', bottom: '18px', left: '18px', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: '5px',
        color: 'rgba(255,255,255,0.88)', fontSize: '13px', fontWeight: 600,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        {city}
      </div>

      {/* Dot indicators — bottom right */}
      <div style={{
        position: 'absolute', bottom: '20px', right: '18px', zIndex: 10,
        display: 'flex', gap: '5px', alignItems: 'center',
      }}>
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? '20px' : '7px',
              height: '7px',
              borderRadius: '100px',
              background: i === current ? '#fff' : 'rgba(255,255,255,0.38)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.3s ease',
            }}
            aria-label={`Imagem ${i + 1}`}
          />
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button onClick={prev} style={{ ...btnStyle, left: '12px' }} aria-label="Imagem anterior">
        <ChevronLeft />
      </button>
      <button onClick={next} style={{ ...btnStyle, right: '12px' }} aria-label="Próxima imagem">
        <ChevronRight />
      </button>

    </div>
  )
}
