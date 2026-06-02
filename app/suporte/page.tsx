import Link from "next/link";

// ====================================================
// EDITE AQUI o e-mail de suporte
// ====================================================
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "seuemail@gmail.com";
// ====================================================

export default function SuportePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="font-bold text-lg text-gradient">MeuNegócio Pro</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">🙋</div>
          <h1 className="text-3xl font-bold text-gray-900">Precisa de ajuda?</h1>
          <p className="text-gray-500 mt-2">Estamos aqui para resolver.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-3">Não encontrei minha compra</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Verifique se você está usando exatamente o mesmo e-mail informado no checkout. O e-mail é case-sensitive (diferencía maiúsculas e minúsculas).
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-3">Perdi acesso aos meus materiais</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Seus materiais ficam salvos permanentemente na sua conta. Basta fazer login com o e-mail e senha cadastrados. Se esqueceu a senha, use a opção "Esqueci minha senha" na tela de login.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-3">Posts ainda não liberados</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Os materiais são liberados em etapas: os primeiros logo após a compra, mais posts em 3 dias, e o pacote completo com 30 posts em 7 dias. Fique tranquilo, tudo será liberado automaticamente.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
            <h2 className="font-bold text-indigo-900 mb-3">Falar com o suporte</h2>
            <p className="text-indigo-700 text-sm leading-relaxed mb-4">
              Se ainda precisar de ajuda, envie uma mensagem para:
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-2 gradient-brand text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition"
            >
              📧 {SUPPORT_EMAIL}
            </a>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link href="/" className="text-gray-400 hover:text-indigo-600 text-sm transition">← Voltar para o início</Link>
        </div>
      </main>
    </div>
  );
}
