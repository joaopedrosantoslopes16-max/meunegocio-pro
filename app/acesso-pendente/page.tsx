import Link from "next/link";

export default function AcessoPendentePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Compra em análise</h1>
        <p className="text-gray-600 mb-2">
          Sua compra está sendo processada. Isso pode levar alguns minutos.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Assim que o pagamento for confirmado, seus materiais serão liberados automaticamente.
        </p>
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full gradient-brand text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition"
          >
            Verificar novamente
          </Link>
          <Link href="/suporte" className="block text-sm text-gray-400 hover:text-indigo-500 transition">
            Falar com o suporte
          </Link>
        </div>
      </div>
    </div>
  );
}
