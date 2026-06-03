"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPosCompraPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "check-email">("form");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);

    // Verifica se e-mail tem compra aprovada
    const res = await fetch("/api/check-purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (data.status === "pending") {
      setError("Sua compra ainda está em análise. Aguarde alguns minutos e tente novamente.");
      setLoading(false);
      return;
    }

    if (data.status === "refunded" || data.status === "chargeback" || data.status === "cancelled") {
      router.push("/acesso-bloqueado");
      return;
    }

    if (!data.approved) {
      setError("Não encontramos uma compra aprovada para este e-mail. Confira se você usou o mesmo e-mail da compra ou fale com o suporte.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    setLoading(false);

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("Este e-mail já tem uma conta. Faça login.");
        return;
      }
      setError(signUpError.message);
      return;
    }

    setStep("check-email");
  }

  if (step === "check-email") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirme seu e-mail</h1>
          <p className="text-gray-600 mb-6">
            Enviamos um link de confirmação para <strong>{email}</strong>.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-left mb-6 space-y-3">
            <p className="font-bold text-blue-800 text-sm">Próximos passos:</p>
            <ol className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2"><span className="font-bold">1.</span> Abra o e-mail que acabamos de enviar para <strong>{email}</strong></li>
              <li className="flex items-start gap-2"><span className="font-bold">2.</span> Clique no botão <strong>"Confirmar e-mail"</strong> dentro do e-mail</li>
              <li className="flex items-start gap-2"><span className="font-bold">3.</span> Volte aqui e clique em <strong>"Entrar na minha conta"</strong> abaixo</li>
              <li className="flex items-start gap-2"><span className="font-bold">4.</span> Preencha os dados do seu negócio para gerar seu kit</li>
            </ol>
          </div>
          <Link href="/login" className="inline-block gradient-brand text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition">
            Entrar na minha conta
          </Link>
          <p className="text-xs text-gray-400 mt-4">Não recebeu? Verifique a caixa de spam ou fale com o suporte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-bold text-2xl text-gradient mb-4">MeuNegócio Pro</Link>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Compra realizada!
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Crie sua conta</h1>
          <p className="text-gray-500 mt-1 text-sm">Use o mesmo e-mail utilizado na compra para acessar seus materiais</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 mb-6 text-sm text-yellow-800">
            ⚠️ <strong>Importante:</strong> use exatamente o mesmo e-mail informado no checkout.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Seu nome</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="João Silva" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail usado na compra</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seuemail@gmail.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Criar senha de acesso</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Mínimo 6 caracteres" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
            )}

            <button type="submit" disabled={loading} className="w-full gradient-brand text-white font-bold py-4 rounded-xl text-base hover:opacity-90 transition disabled:opacity-60">
              {loading ? "Verificando..." : "Criar conta e acessar meu kit"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Já tem conta?{" "}
            <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Entrar</Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          E-mail não reconhecido?{" "}
          <Link href="/suporte" className="text-indigo-500 hover:underline">Fale com o suporte</Link>
        </p>
      </div>
    </div>
  );
}
