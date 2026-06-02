'use client'

import { useState, useRef } from 'react'
import { ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PreviewData } from '@/types'
import { NICHE_CONFIG } from '@/lib/niche-config'
import { buildWhatsAppLink } from '@/lib/whatsapp-utils'

type NicheCfg = (typeof NICHE_CONFIG)[string]

const NICHE_EMOJIS: Record<string, string[]> = {
  barbearia:          ["✂️", "🪒", "💈"],
  odontologia:        ["🦷", "✨", "🔬"],
  "clinica-medica":   ["🩺", "🧪", "❤️"],
  otica:              ["👓", "🔭", "🕶️"],
  "personal-trainer": ["💪", "🏃", "⚡"],
  estetica:           ["✨", "💆", "💅"],
  "loja-roupa":       ["👗", "👔", "👟"],
  "loja-de-roupa":    ["👗", "👔", "👟"],
  imobiliaria:        ["🏠", "🔑", "📐"],
  restaurante:        ["🍽️", "🥩", "👨‍🍳"],
  mecanica:           ["🔧", "⚙️", "🚗"],
  serralheria:        ["🔒", "⚙️", "🛠️"],
  outro:              ["⭐", "✅", "💡"],
}

const ESSENCIAL_FEATURES = [
  "Mini site profissional ativo",
  "Botão de WhatsApp em destaque",
  "5 posts por mês",
  "5 legendas por mês",
  "5 mensagens WhatsApp/mês",
  "Calendário de postagem básico",
  "Gerador básico de conteúdo",
]

const PRO_FEATURES = [
  "Tudo do Essencial",
  "Foto/logo e capa personalizada",
  "Galeria de fotos no mini site",
  "Links personalizados no site",
  "15 posts · 15 legendas · 15 mensagens",
  "Gerador de Narrativas Magnéticas",
  "Roteiros para Reels",
  "Sequência de Stories",
  "Carrosséis completos",
  "Campanhas prontas mensais",
  "Mensagens para recuperar clientes",
]

// ── Essencial: mini site simples e profissional ──────────────
function EssencialSite({ preview, cfg }: { preview: PreviewData; cfg: NicheCfg }) {
  const c = preview.primary_color
  const initial = preview.business_name[0]?.toUpperCase() ?? '?'
  const services = (cfg.services ?? []).filter((s: string) => s !== preview.main_service).slice(0, 2)
  const waLink = buildWhatsAppLink(preview.whatsapp, `Olá! Vim pelo site da ${preview.business_name} e quero saber mais.`)

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#fff' }}>

      {/* Hero gradient */}
      <div style={{
        background: `linear-gradient(160deg, ${c}f5 0%, ${c}bb 100%)`,
        padding: '28px 18px 40px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)' }} />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto 10px',
            background: 'rgba(255,255,255,0.22)', border: '2px solid rgba(255,255,255,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 900, color: '#fff',
          }}>
            {initial}
          </div>
          <p style={{ fontSize: '16px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '3px' }}>
            {preview.business_name}
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.70)', fontWeight: 600, marginBottom: '16px' }}>
            {preview.niche} · {preview.city}
          </p>
          <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            background: '#25D366', color: '#fff', fontWeight: 800, fontSize: '12px',
            padding: '11px', borderRadius: '10px', textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
          }}>
            💬 Chamar no WhatsApp
          </a>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '24px', background: '#fff', clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </div>

      {/* Serviços simples */}
      <div style={{ padding: '16px 16px 4px' }}>
        <p style={{ fontSize: '9px', fontWeight: 800, color: c, letterSpacing: '0.20em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Serviços
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[preview.main_service, ...services].map((svc, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: i === 0 ? `${c}0d` : '#f9f9f9',
              border: `1px solid ${i === 0 ? c + '28' : '#f0f0f0'}`,
              borderRadius: '8px', padding: '9px 12px',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c, flexShrink: 0 }} />
              <p style={{ fontSize: '12px', fontWeight: i === 0 ? 800 : 600, color: '#222', flex: 1 }}>{svc}</p>
              {i === 0 && (
                <span style={{ fontSize: '9px', fontWeight: 700, color: c, background: `${c}12`, borderRadius: '4px', padding: '2px 5px' }}>
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Links rápidos */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['WhatsApp', 'Localização', 'Instagram'].map((s) => (
            <div key={s} style={{ flex: 1, background: '#f5f5f5', borderRadius: '7px', padding: '7px 4px', textAlign: 'center' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, color: '#666' }}>{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA footer */}
      <div style={{ padding: '12px 16px 20px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
        <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          background: c, color: '#fff', fontWeight: 800, fontSize: '12px',
          padding: '11px', borderRadius: '10px', textDecoration: 'none',
        }}>
          💬 {cfg.cta}
        </a>
      </div>
    </div>
  )
}

// ── Pro: mini site mais rico e completo ─────────────────────
function ProSite({ preview, cfg, emojis }: { preview: PreviewData; cfg: NicheCfg; emojis: string[] }) {
  const c = preview.primary_color
  const initial = preview.business_name[0]?.toUpperCase() ?? '?'
  const services = (cfg.services ?? []).filter((s: string) => s !== preview.main_service).slice(0, 2)
  const waLink = buildWhatsAppLink(preview.whatsapp, `Olá! Vim pelo site da ${preview.business_name} e quero saber mais.`)

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#fff' }}>

      {/* Hero escuro com overlay de cor — estilo editorial */}
      <div style={{ height: '190px', position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, #111 0%, ${c}77 70%, #000 100%)` }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 70% 30%, ${c}44 0%, transparent 60%)` }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.80) 100%)' }} />

        {/* Top bar */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900, color: '#fff', boxShadow: `0 3px 10px ${c}55` }}>
              {initial}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: '100px', padding: '3px 8px', backdropFilter: 'blur(4px)' }}>
              <span style={{ color: '#fff', fontSize: '9px', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>{cfg.label}</span>
            </div>
          </div>
          {preview.instagram && (
            <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: '100px', padding: '3px 8px', backdropFilter: 'blur(4px)' }}>
              <span style={{ color: '#fff', fontSize: '9px', fontWeight: 700 }}>@{preview.instagram}</span>
            </div>
          )}
        </div>

        {/* Bottom text */}
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', zIndex: 10 }}>
          <p style={{ fontSize: '10px', fontWeight: 800, color: c, textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '3px' }}>
            {preview.main_service}
          </p>
          <p style={{ fontSize: '19px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '4px' }}>
            {preview.business_name}
          </p>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
            📍 {preview.city}
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', background: '#0d0d0d', borderBottom: `2px solid ${c}` }}>
        {['⚡ Online', `📍 ${preview.city}`, '💬 Rápido'].map((item, i) => (
          <div key={i} style={{ flex: 1, padding: '8px 4px', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>{item}</p>
          </div>
        ))}
      </div>

      {/* CTA principal */}
      <div style={{ padding: '12px 14px 0' }}>
        <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          background: '#25D366', color: '#fff', fontWeight: 800, fontSize: '12px',
          padding: '11px', borderRadius: '10px', textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
        }}>
          💬 {cfg.cta}
        </a>
      </div>

      {/* Sobre */}
      <div style={{ padding: '14px 14px 0', borderTop: '1px solid #f0f0f0', marginTop: '12px' }}>
        <p style={{ fontSize: '9px', fontWeight: 800, color: c, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '6px' }}>Sobre</p>
        <p style={{ fontSize: '11px', color: '#555', lineHeight: 1.65 }}>
          {preview.business_name} é uma {cfg.label.toLowerCase()} em {preview.city}, especializada em {preview.main_service}. Atendimento direto pelo WhatsApp.
        </p>
      </div>

      {/* Serviços em cards */}
      <div style={{ padding: '14px', background: '#f9f9f9', marginTop: '12px', borderTop: '1px solid #f0f0f0' }}>
        <p style={{ fontSize: '9px', fontWeight: 800, color: c, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>Serviços</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {[preview.main_service, ...services].map((svc, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#fff', borderRadius: '8px', padding: '8px 10px',
              border: `1px solid ${i === 0 ? c + '30' : '#f0f0f0'}`,
              boxShadow: i === 0 ? `0 2px 8px ${c}10` : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
                  background: i === 0 ? `linear-gradient(135deg, ${c}, ${c}bb)` : `${c}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                }}>
                  {emojis[i % emojis.length]}
                </div>
                <p style={{ fontSize: '11px', fontWeight: i === 0 ? 800 : 600, color: '#222' }}>{svc}</p>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#25D366', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '5px', padding: '2px 6px', flexShrink: 0 }}>
                Falar
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Avaliações */}
      <div style={{ padding: '14px' }}>
        <p style={{ fontSize: '9px', fontWeight: 800, color: c, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>Avaliações</p>
        <div style={{ display: 'flex', gap: '1px', marginBottom: '8px' }}>
          {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: '12px', color: '#FBBF24' }}>★</span>)}
        </div>
        <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '9px 11px' }}>
          <p style={{ fontSize: '11px', color: '#444', lineHeight: 1.55, marginBottom: '5px' }}>
            "Ótimo atendimento! Muito profissional e resultado excelente."
          </p>
          <p style={{ fontSize: '9px', fontWeight: 700, color: '#aaa' }}>Cliente satisfeito · {preview.city}</p>
        </div>
      </div>

      {/* Horários */}
      <div style={{ padding: '14px', background: '#f9f9f9', borderTop: '1px solid #f0f0f0' }}>
        <p style={{ fontSize: '9px', fontWeight: 800, color: c, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>Horários</p>
        <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
          {[['Seg–Sex', 'Consulte disponibilidade'], ['Sábado', 'Consulte disponibilidade'], ['Domingo', 'Fechado']].map(([day, hrs], i) => (
            <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderBottom: i < 2 ? '1px solid #f5f5f5' : 'none' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#333' }}>{day}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: i === 2 ? '#bbb' : '#111' }}>{hrs}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA final */}
      <div style={{ padding: '16px 14px', background: c, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '90px', height: '90px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.10)' }} />
        <p style={{ fontSize: '13px', fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: '10px', letterSpacing: '-0.01em' }}>
          Fale com a {preview.business_name}
        </p>
        <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          background: '#fff', color: c, fontWeight: 800, fontSize: '12px',
          padding: '11px', borderRadius: '10px', textDecoration: 'none',
        }}>
          💬 Chamar no WhatsApp
        </a>
      </div>

      {/* Barra WhatsApp fixa (simulação visual) */}
      <div style={{ background: '#25D366', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>💬 Botão fixo de WhatsApp</span>
      </div>

    </div>
  )
}

// ── Card individual de plano (browser frame + preview + features + CTA) ──
function PlanSlide({
  plan, preview, cfg, emojis, checkoutUrl,
}: {
  plan: 'essencial' | 'pro'
  preview: PreviewData
  cfg: NicheCfg
  emojis: string[]
  checkoutUrl: string
}) {
  const isPro = plan === 'pro'
  const label = isPro ? 'Pro' : 'Essencial'
  const price = isPro ? '57' : '37'
  const priceDesc = isPro
    ? 'Mini site + conteúdos + Gerador Magnético'
    : 'Mini site profissional ativo'
  const features = isPro ? PRO_FEATURES : ESSENCIAL_FEATURES

  return (
    <div className={`rounded-2xl overflow-hidden flex flex-col ${isPro ? 'border-2 border-violet-400 shadow-xl shadow-violet-100' : 'border border-gray-200 shadow-sm'}`}>

      {/* Browser chrome */}
      <div className={`flex items-center justify-between px-4 py-2.5 ${isPro ? 'bg-violet-700' : 'bg-gray-900'}`}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
          </div>
          <span className="text-white/50 text-[10px] truncate max-w-[120px]">
            meunegocio.pro/site/{preview.business_name.toLowerCase().replace(/\s+/g, '-')}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isPro && (
            <span className="bg-yellow-400 text-yellow-900 text-[9px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap">
              ⭐ Recomendado
            </span>
          )}
          <span className={`text-[10px] font-bold ${isPro ? 'text-white/70' : 'text-white/50'}`}>{label}</span>
        </div>
      </div>

      {/* Mini site preview — scrollable, sem scrollbar visível */}
      <div
        className="overflow-y-auto mnp-plan-scroll"
        style={{ maxHeight: '440px' }}
      >
        {isPro
          ? <ProSite preview={preview} cfg={cfg} emojis={emojis} />
          : <EssencialSite preview={preview} cfg={cfg} />}
      </div>

      {/* Fade-out hint para o Pro (tem mais conteúdo) */}
      {isPro && (
        <div className="relative -mt-8 h-8 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, #fff)' }} />
      )}

      {/* Features */}
      <div className={`px-4 py-4 border-t ${isPro ? 'bg-violet-50 border-violet-100' : 'bg-gray-50 border-gray-100'}`}>
        <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-3 ${isPro ? 'text-violet-500' : 'text-gray-400'}`}>
          O que inclui
        </p>
        <ul className="flex flex-col gap-1.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isPro ? 'bg-violet-600' : 'bg-gray-400'}`}>
                <Check size={9} color="white" strokeWidth={3} />
              </span>
              <span className="text-xs text-gray-700 leading-snug">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Price + CTA */}
      <div className={`px-4 pt-3 pb-5 ${isPro ? 'bg-violet-50' : 'bg-gray-50'}`}>
        <div className="text-center mb-3">
          <span className={`text-2xl font-extrabold ${isPro ? 'text-violet-700' : 'text-gray-700'}`}>
            R$ {price}
          </span>
          <span className="text-gray-400 text-sm font-medium">/mês</span>
          <p className="text-xs text-gray-400 mt-1">{priceDesc}</p>
        </div>
        <a
          href={checkoutUrl}
          className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-extrabold text-sm transition-opacity hover:opacity-90 ${
            isPro
              ? 'gradient-brand text-white shadow-md shadow-violet-200'
              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-violet-300'
          }`}
        >
          Escolher {label} <ArrowRight size={14} />
        </a>
      </div>

    </div>
  )
}

// ── Componente principal exportado ───────────────────────────
interface Props {
  preview: PreviewData
  nicheKey: string
  checkoutUrl: string
  checkoutUrlPro: string
}

export default function PlanComparison({ preview, nicheKey, checkoutUrl, checkoutUrlPro }: Props) {
  const [active, setActive] = useState(0)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const cfg = NICHE_CONFIG[nicheKey] ?? NICHE_CONFIG.outro
  const emojis = NICHE_EMOJIS[nicheKey] ?? NICHE_EMOJIS.outro

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = touchStartY.current - e.changedTouches[0].clientY
    // só ativa swipe se o movimento horizontal for maior que o vertical
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) setActive(1)
      else setActive(0)
    }
  }

  return (
    <div className="mt-10">

      <style>{`
        .mnp-plan-scroll::-webkit-scrollbar { display: none; }
        .mnp-plan-scroll { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <span className="text-violet-600 text-xs font-bold uppercase tracking-widest">Comparativo visual</span>
        <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2 mb-2">
          Compare os planos na prática
        </h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Arraste para o lado e veja como o seu site pode ficar no Essencial e no Pro.
        </p>
      </div>

      {/* Hint de swipe — apenas mobile */}
      <div className="flex items-center justify-center gap-2 mb-5 text-xs text-gray-400 md:hidden">
        <span>←</span>
        <span className="font-medium">Deslize para comparar</span>
        <span>→</span>
      </div>

      {/* Tab switcher */}
      <div className="flex max-w-xs mx-auto rounded-2xl p-1 bg-gray-100 mb-6 gap-1">
        {(['essencial', 'pro'] as const).map((plan, i) => (
          <button
            key={plan}
            onClick={() => setActive(i)}
            className={`relative flex-1 py-2.5 px-2 rounded-xl text-sm font-extrabold transition-all duration-200 ${
              active === i ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'
            }`}
          >
            {plan === 'pro' && active === 1 && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[9px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap z-10">
                ⭐ Recomendado
              </span>
            )}
            <span className="capitalize">{plan === 'pro' ? 'Pro' : 'Essencial'}</span>
            <span className={`block text-xs font-semibold mt-0.5 ${active === i ? 'text-violet-500' : 'text-gray-300'}`}>
              {plan === 'pro' ? 'R$ 57/mês' : 'R$ 37/mês'}
            </span>
          </button>
        ))}
      </div>

      {/* ── Mobile: slider de um de cada vez ── */}
      <div className="md:hidden">
        <div
          className="overflow-hidden select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            style={{
              display: 'flex',
              transform: `translateX(-${active * 100}%)`,
              transition: 'transform 0.42s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            <div style={{ minWidth: '100%', paddingBottom: '4px' }}>
              <PlanSlide plan="essencial" preview={preview} cfg={cfg} emojis={emojis} checkoutUrl={checkoutUrl} />
            </div>
            <div style={{ minWidth: '100%', paddingBottom: '4px' }}>
              <PlanSlide plan="pro" preview={preview} cfg={cfg} emojis={emojis} checkoutUrl={checkoutUrlPro} />
            </div>
          </div>
        </div>

        {/* Controles de navegação */}
        <div className="flex items-center justify-center gap-4 mt-5">
          <button
            onClick={() => setActive(0)}
            disabled={active === 0}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
              active === 0 ? 'border-gray-100 text-gray-200 cursor-default' : 'border-gray-300 text-gray-600 hover:border-violet-400 hover:text-violet-600'
            }`}
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex gap-2 items-center">
            {[0, 1].map((i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === active ? 'w-6 h-2.5 bg-violet-600' : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setActive(1)}
            disabled={active === 1}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
              active === 1 ? 'border-gray-100 text-gray-200 cursor-default' : 'border-gray-300 text-gray-600 hover:border-violet-400 hover:text-violet-600'
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Desktop: lado a lado ── */}
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        <PlanSlide plan="essencial" preview={preview} cfg={cfg} emojis={emojis} checkoutUrl={checkoutUrl} />
        <PlanSlide plan="pro" preview={preview} cfg={cfg} emojis={emojis} checkoutUrl={checkoutUrlPro} />
      </div>

      {/* Explicação abaixo */}
      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Plano Essencial</p>
          <p className="font-extrabold text-gray-800 text-sm mb-1">Para começar com presença online</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Mini site profissional ativo com botão de WhatsApp e conteúdos básicos mensais para manter presença online.
          </p>
        </div>
        <div className="bg-violet-50 rounded-2xl p-5 border border-violet-100 relative overflow-hidden">
          <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-[9px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap">
            Mais completo
          </span>
          <p className="text-[10px] font-extrabold text-violet-500 uppercase tracking-widest mb-1.5">Plano Pro</p>
          <p className="font-extrabold text-gray-800 text-sm mb-1">Mini site + conteúdos + gerador</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Site personalizado, galeria de fotos, roteiros para Reels, Stories, carrosséis e mensagens para WhatsApp — tudo renovando todo mês.
          </p>
        </div>
      </div>

    </div>
  )
}
