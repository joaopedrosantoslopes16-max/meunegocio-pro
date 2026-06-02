import Link from "next/link";

export default function AcessoBloqueadoPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Acesso pausado</h1>
        <p className="text-gray-600 mb-2">
          O acesso aos materiais foi pausado por causa do status da sua compra.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Se acha que isso é um erro ou deseja regularizar a situação, entre em contato com o suporte.
        </p>
        <div className="space-y-3">
          <Link
            href="/suporte"
            className="block w-full gradient-brand text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition"
          >
            Falar com o suporte
          </Link>
          <Link href="/" className="block text-sm text-gray-400 hover:text-indigo-500 transition">
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}
