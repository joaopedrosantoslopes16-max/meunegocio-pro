'use client'

import { useState, useRef, useEffect } from 'react'
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

// ── Demos do Pro — exemplos visuais rotativos ─────────────────
interface DemoSlide {
  nicheLabel: string
  businessName: string
  mainService: string
  city: string
  color: string
  instagram: string
  heroImage: string
  galleryImg2: string
  galleryImg3: string
  services: string[]
  teamImages: string[]
  about: string
  review: string
}

const PRO_DEMO_SLIDES: DemoSlide[] = [
  {
    nicheLabel: "Clínica Médica",
    businessName: "Clínica São Lucas",
    mainService: "Consultas e Exames",
    city: "São Paulo",
    color: "#2563EB",
    instagram: "clinicasaolucas",
    heroImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&fit=crop",
    galleryImg2: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80&fit=crop",
    galleryImg3: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&q=80&fit=crop",
    services: ["Consultas e Exames", "Pediatria", "Cardiologia"],
    teamImages: [
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&q=80&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&q=80&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&q=80&fit=crop&crop=face",
    ],
    about: "Clínica São Lucas é referência em saúde preventiva em SP, com equipe especializada e atendimento humanizado.",
    review: "Equipe muito atenciosa. Me senti acolhida desde a entrada!",
  },
  {
    nicheLabel: "Barbearia",
    businessName: "Barbearia Black",
    mainService: "Corte Masculino",
    city: "Rio de Janeiro",
    color: "#7C3AED",
    instagram: "barbearíablack",
    heroImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80&fit=crop",
    galleryImg2: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80&fit=crop",
    galleryImg3: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80&fit=crop",
    services: ["Corte Masculino", "Barba Completa", "Hidratação"],
    teamImages: [
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=80&h=80&q=80&fit=crop&crop=face",
    ],
    about: "Barbearia Black é o espaço certo para quem quer estilo e precisão no Rio. Atendimento rápido e resultado garantido.",
    review: "Melhor barbearia da zona sul! Saio sempre impecável daqui.",
  },
  {
    nicheLabel: "Advocacia",
    businessName: "Dr. Fernandes Adv.",
    mainService: "Direito Trabalhista",
    city: "Belo Horizonte",
    color: "#1D4ED8",
    instagram: "drfernandes_adv",
    heroImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80&fit=crop",
    galleryImg2: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80&fit=crop",
    galleryImg3: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop&crop=face",
    services: ["Direito Trabalhista", "Direito Civil", "Consultoria"],
    teamImages: [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&q=80&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&q=80&fit=crop&crop=face",
    ],
    about: "Dr. Fernandes e equipe oferecem atendimento jurídico especializado com foco em resultados reais para você.",
    review: "Resolveu meu caso em tempo recorde. Excelente profissional!",
  },
  {
    nicheLabel: "Serralheria",
    businessName: "Ferro Forte",
    mainService: "Portões e Grades",
    city: "Campinas",
    color: "#B45309",
    instagram: "ferroforte_cps",
    heroImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80&fit=crop",
    galleryImg2: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80&fit=crop",
    galleryImg3: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&q=80&fit=crop",
    services: ["Portões e Grades", "Escadas Metálicas", "Coberturas"],
    teamImages: [],
    about: "Ferro Forte fabrica e instala portões, grades e coberturas sob medida em Campinas e região. Qualidade garantida.",
    review: "Serviço impecável, prazo cumprido e preço justo. Recomendo!",
  },
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

// ── Pro: mini site com imagem real de cada negócio ───────────
function ProSite({ demo }: { demo: DemoSlide }) {
  const c = demo.color
  const initial = demo.businessName[0]?.toUpperCase() ?? '?'

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#fff' }}>

      {/* Hero com foto real */}
      <div style={{
        height: '200px', position: 'relative', overflow: 'hidden',
        backgroundImage: `url(${demo.heroImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundColor: '#111',
      }}>
        {/* overlay escuro + tint da cor */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.78) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 70% 20%, ${c}44 0%, transparent 55%)` }} />

        {/* Top bar */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900, color: '#fff', boxShadow: `0 3px 10px ${c}55` }}>
              {initial}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '100px', padding: '3px 8px', backdropFilter: 'blur(4px)' }}>
              <span style={{ color: '#fff', fontSize: '9px', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>{demo.nicheLabel}</span>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '100px', padding: '3px 8px', backdropFilter: 'blur(4px)' }}>
            <span style={{ color: '#fff', fontSize: '9px', fontWeight: 700 }}>@{demo.instagram}</span>
          </div>
        </div>

        {/* Bottom: equipe + nome */}
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', zIndex: 10 }}>
          {demo.teamImages.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '9px' }}>
              <div style={{ display: 'flex' }}>
                {demo.teamImages.slice(0, 3).map((img, i) => (
                  <div key={i} style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.85)',
                    overflow: 'hidden', marginLeft: i > 0 ? '-7px' : '0',
                    position: 'relative', zIndex: 3 - i, background: c,
                    flexShrink: 0,
                  }}>
                    <img
                      src={img}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.80)', fontWeight: 600 }}>
                {demo.teamImages.length} profissional{demo.teamImages.length > 1 ? 'is' : ''}
              </span>
            </div>
          )}
          <p style={{ fontSize: '10px', fontWeight: 800, color: c, textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '3px' }}>
            {demo.mainService}
          </p>
          <p style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '4px' }}>
            {demo.businessName}
          </p>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
            📍 {demo.city}
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', background: '#0d0d0d', borderBottom: `2px solid ${c}` }}>
        {['⚡ Online', `📍 ${demo.city}`, '💬 Rápido'].map((item, i) => (
          <div key={i} style={{ flex: 1, padding: '8px 4px', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>{item}</p>
          </div>
        ))}
      </div>

      {/* CTA principal */}
      <div style={{ padding: '12px 14px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          background: '#25D366', color: '#fff', fontWeight: 800, fontSize: '12px',
          padding: '11px', borderRadius: '10px',
          boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
        }}>
          💬 Agendar via WhatsApp
        </div>
      </div>

      {/* Sobre */}
      <div style={{ padding: '14px 14px 0', borderTop: '1px solid #f0f0f0', marginTop: '12px' }}>
        <p style={{ fontSize: '9px', fontWeight: 800, color: c, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '6px' }}>Sobre</p>
        <p style={{ fontSize: '11px', color: '#555', lineHeight: 1.65 }}>{demo.about}</p>
      </div>

      {/* Galeria de fotos */}
      <div style={{ padding: '14px 14px 0', marginTop: '2px' }}>
        <p style={{ fontSize: '9px', fontWeight: 800, color: c, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>Galeria</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
          {[demo.heroImage, demo.galleryImg2, demo.galleryImg3].map((img, i) => (
            <div key={i} style={{
              height: '56px', borderRadius: '7px', overflow: 'hidden',
              backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center',
              backgroundColor: `${c}${i === 0 ? '33' : i === 1 ? '22' : '14'}`,
            }} />
          ))}
        </div>
      </div>

      {/* Serviços em cards */}
      <div style={{ padding: '14px', background: '#f9f9f9', marginTop: '12px', borderTop: '1px solid #f0f0f0' }}>
        <p style={{ fontSize: '9px', fontWeight: 800, color: c, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>Serviços</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {demo.services.map((svc, i) => (
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
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === 0 ? 'rgba(255,255,255,0.9)' : c }} />
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

      {/* Avaliação */}
      <div style={{ padding: '14px' }}>
        <p style={{ fontSize: '9px', fontWeight: 800, color: c, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>Avaliações</p>
        <div style={{ display: 'flex', gap: '1px', marginBottom: '8px' }}>
          {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: '12px', color: '#FBBF24' }}>★</span>)}
        </div>
        <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '9px 11px' }}>
          <p style={{ fontSize: '11px', color: '#444', lineHeight: 1.55, marginBottom: '5px' }}>
            &ldquo;{demo.review}&rdquo;
          </p>
          <p style={{ fontSize: '9px', fontWeight: 700, color: '#aaa' }}>Cliente verificado · {demo.city}</p>
        </div>
      </div>

      {/* CTA final */}
      <div style={{ padding: '16px 14px', background: c, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '90px', height: '90px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.10)' }} />
        <p style={{ fontSize: '13px', fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: '10px', letterSpacing: '-0.01em' }}>
          Fale com {demo.businessName}
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          background: '#fff', color: c, fontWeight: 800, fontSize: '12px',
          padding: '11px', borderRadius: '10px',
        }}>
          💬 Chamar no WhatsApp
        </div>
      </div>

    </div>
  )
}

// ── Card individual de plano ──────────────────────────────────
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
  const price = isPro ? '57' : '37,90'
  const priceDesc = isPro
    ? 'Mini site + conteúdos + Gerador Magnético'
    : 'Mini site profissional ativo'
  const features = isPro ? PRO_FEATURES : ESSENCIAL_FEATURES

  // Slideshow state — só ativo no Pro
  const [demoIdx, setDemoIdx] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    if (!isPro) return
    const t = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setDemoIdx(i => (i + 1) % PRO_DEMO_SLIDES.length)
        setFadeIn(true)
      }, 350)
    }, 7000)
    return () => clearInterval(t)
  }, [isPro])

  const currentDemo = PRO_DEMO_SLIDES[demoIdx]

  const urlSlug = isPro
    ? currentDemo.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : preview.business_name.toLowerCase().replace(/\s+/g, '-')

  function goToDemo(i: number) {
    setFadeIn(false)
    setTimeout(() => { setDemoIdx(i); setFadeIn(true) }, 300)
  }

  return (
    <div className={`rounded-2xl overflow-hidden flex flex-col bg-white ${isPro ? 'border-2 border-violet-400 shadow-xl shadow-violet-100' : 'border border-gray-200 shadow-sm'}`}>

      {/* Browser chrome */}
      <div className={`flex items-center justify-between px-4 py-2.5 ${isPro ? 'bg-violet-700' : 'bg-gray-900'}`}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
          </div>
          <span className="text-white/50 text-[10px] truncate max-w-[130px] transition-all duration-300">
            meunegocio.pro/site/{urlSlug}
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

      {/* Mini site preview — scrollável sem scrollbar */}
      <div className="overflow-y-auto mnp-plan-scroll bg-white" style={{ maxHeight: '440px' }}>
        {isPro ? (
          <div style={{ opacity: fadeIn ? 1 : 0, transition: 'opacity 0.35s ease' }}>
            <ProSite demo={currentDemo} />
          </div>
        ) : (
          <EssencialSite preview={preview} cfg={cfg} />
        )}
      </div>

      {/* Fade-out hint */}
      {isPro && (
        <div className="relative -mt-8 h-8 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, #fff)' }} />
      )}

      {/* Indicadores do slideshow — só Pro */}
      {isPro && (
        <div className="flex flex-col items-center gap-1.5 py-2.5 bg-white border-t border-violet-100">
          <p className="text-[9px] font-bold text-violet-400 uppercase tracking-widest transition-all duration-300">
            {currentDemo.nicheLabel}
          </p>
          <div className="flex gap-1.5">
            {PRO_DEMO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToDemo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === demoIdx ? 'w-5 h-1.5 bg-violet-500' : 'w-1.5 h-1.5 bg-gray-200 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className={`flex-1 px-4 py-4 border-t ${isPro ? 'bg-violet-50 border-violet-100' : 'bg-white border-gray-100'}`}>
        <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-3 ${isPro ? 'text-violet-500' : 'text-green-600'}`}>
          O que inclui
        </p>
        <ul className="flex flex-col gap-1.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isPro ? 'bg-violet-600' : 'bg-green-500'}`}>
                <Check size={9} color="white" strokeWidth={3} />
              </span>
              <span className="text-xs text-gray-700 leading-snug">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Price + CTA */}
      <div className={`px-4 pt-3 pb-5 ${isPro ? 'bg-violet-50' : 'bg-white'}`}>
        <div className="text-center mb-3">
          <span className={`text-2xl font-extrabold ${isPro ? 'text-violet-700' : 'text-gray-900'}`}>
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
              : 'bg-gray-900 text-white hover:bg-gray-800'
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
          O Pro mostra como ficam sites de negócios reais — com fotos, equipe e galeria.
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
              {plan === 'pro' ? 'R$ 57/mês' : 'R$ 37,90/mês'}
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
          <p className="font-extrabold text-gray-800 text-sm mb-1">Mini site + fotos + conteúdos + gerador</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Site com foto de capa, galeria, equipe visível, roteiros para Reels, Stories, carrosséis e mensagens — tudo renovando todo mês.
          </p>
        </div>
      </div>

    </div>
  )
}
