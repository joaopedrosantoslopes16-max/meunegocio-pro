import Link from "next/link";
import { CheckCircle2, ArrowRight, ImageIcon, Smartphone, MessageSquare } from "lucide-react";

// ============================================================
// LINKS DE CHECKOUT DOS EXTRAS — configure no .env.local
// ============================================================
const CHECKOUT_INSTAGRAM  = process.env.NEXT_PUBLIC_CHECKOUT_INSTAGRAM_EXTRA ?? "#";
const CHECKOUT_STORIES    = process.env.NEXT_PUBLIC_CHECKOUT_STORIES         ?? "#";
const CHECKOUT_REATIVACAO = process.env.NEXT_PUBLIC_CHECKOUT_REATIVACAO      ?? "#";
// ============================================================

const PACKAGES = [
  {
    Icon:        ImageIcon,
    title:       "Pacote Instagram Extra",
    price:       "R$ 19",
    tagline:     "20 posts extras para movimentar seu Instagram",
    description: "Posts com CTA para WhatsApp, adaptados ao nicho do seu negócio e salvos no painel.",
    benefits: [
      "20 posts extras para movimentar seu Instagram",
      "20 legendas extras personalizadas",
      "Posts com chamada para WhatsApp",
      "Adaptados ao nicho do seu negócio",
      "Salvos direto no seu painel",
    ],
    checkoutUrl: CHECKOUT_INSTAGRAM,
    cta:         "Adicionar posts extras",
    iconBg:      "bg-pink-50",
    iconColor:   "text-pink-500",
  },
  {
    Icon:        Smartphone,
    title:       "Pacote Stories",
    price:       "R$ 15",
    tagline:     "20 stories prontos para divulgar promoções e avisos rápidos",
    description: "Chamadas rápidas para WhatsApp, avisos de agenda aberta e enquetes simples.",
    benefits: [
      "20 stories prontos para divulgar promoções",
      "Chamadas rápidas para WhatsApp",
      "Avisos de agenda aberta",
      "Enquetes e perguntas simples",
      "Adaptados ao seu nicho",
    ],
    checkoutUrl: CHECKOUT_STORIES,
    cta:         "Adicionar stories",
    iconBg:      "bg-blue-50",
    iconColor:   "text-blue-500",
  },
  {
    Icon:        MessageSquare,
    title:       "Reativação de Clientes",
    price:       "R$ 19",
    tagline:     "50 mensagens para trazer clientes de volta",
    description: "Use quando quiser chamar clientes antigos, responder orçamentos e recuperar quem sumiu.",
    benefits: [
      "50 mensagens para trazer clientes de volta",
      "Para clientes antigos e orçamentos que sumiram",
      "Mensagens de pós-venda e avaliação",
      "Chamadas para agenda aberta",
      "Adaptadas ao seu nicho",
    ],
    checkoutUrl: CHECKOUT_REATIVACAO,
    cta:         "Adicionar mensagens de reativação",
    iconBg:      "bg-green-50",
    iconColor:   "text-green-600",
  },
];

export default function UpsellPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="gradient-brand py-14 px-4 text-center text-white">
        <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
          Oferta especial — só agora
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 max-w-2xl mx-auto leading-tight">
          Quer deixar seu plano ainda mais completo?
        </h1>
        <p className="text-white/75 text-base max-w-xl mx-auto">
          Adicione mais conteúdos ao seu painel e tenha mais materiais para divulgar seu negócio.
        </p>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-14">

        {/* PACOTES */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {PACKAGES.map((pkg) => (
            <div key={pkg.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col hover:border-violet-200 hover:shadow-md transition">
              <div className={`w-12 h-12 ${pkg.iconBg} rounded-xl flex items-center justify-center mb-4 ${pkg.iconColor}`}>
                <pkg.Icon size={22} strokeWidth={1.75} />
              </div>
              <h3 className="font-extrabold text-gray-900 mb-1">{pkg.title}</h3>
              <p className="text-3xl font-extrabold text-violet-700 mb-1">{pkg.price}</p>
              <p className="text-xs text-gray-400 mb-4">{pkg.tagline}</p>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{pkg.description}</p>
              <ul className="space-y-2 text-sm text-gray-600 flex-1 mb-5">
                {pkg.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-violet-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    {b}
                  </li>
                ))}
              </ul>
              <a
                href={pkg.checkoutUrl}
                className="flex items-center justify-center gap-2 gradient-brand text-white font-bold py-3 rounded-xl hover:opacity-90 transition text-sm shadow-md shadow-violet-100"
              >
                {pkg.cta} <ArrowRight size={14} />
              </a>
            </div>
          ))}
        </div>

        {/* PULAR */}
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500">
            Os pacotes são opcionais e não substituem sua assinatura mensal.
          </p>
          <Link
            href="/dashboard"
            className="inline-block text-sm text-gray-400 hover:text-gray-600 font-medium transition underline underline-offset-2"
          >
            Não, continuar sem extras →
          </Link>
        </div>

      </main>
    </div>
  );
}
