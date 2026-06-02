import Link from "next/link";

export default function ObrigadoPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Assinatura confirmada!</h1>
        <p className="text-gray-600 mb-2">
          Obrigado pela sua assinatura do MeuNegócio Pro.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Agora crie sua conta usando o mesmo e-mail do checkout para acessar seus materiais.
        </p>

        {/* Upsell link antes de criar conta */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-6 text-left">
          <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-1">Oferta exclusiva — só agora</p>
          <p className="font-bold text-gray-900 mb-1">Quer deixar seu kit ainda mais completo?</p>
          <p className="text-sm text-gray-600 mb-3">Stories + legendas extras + campanhas prontas por apenas R$ 27/mês a mais.</p>
          <Link href="/upsell" className="block text-center gradient-brand text-white font-bold py-2.5 rounded-xl text-sm hover:opacity-90 transition">
            Ver oferta do Kit Premium →
          </Link>
        </div>

        <Link
          href="/cadastro-pos-compra"
          className="inline-block gradient-brand text-white font-bold py-4 px-8 rounded-2xl text-lg hover:opacity-90 transition shadow-lg shadow-indigo-200"
        >
          Criar minha conta agora
        </Link>
        <p className="text-sm text-gray-400 mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-indigo-500 hover:underline">Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
