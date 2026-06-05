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

    // Cria o usuário via admin API (sem confirmação de e-mail)
    const signupRes = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const signupData = await signupRes.json();

    if (!signupRes.ok) {
      setLoading(false);
      if (signupData.error === "already_registered") {
        setError("Este e-mail já tem uma conta. Faça login.");
        return;
      }
      setError(signupData.error || "Erro ao criar conta. Tente novamente.");
      return;
    }

    // Faz login direto, sem precisar confirmar e-mail
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError("Conta criada! Mas houve um erro ao entrar. Vá para o login.");
      return;
    }

    router.push("/gerar-kit");
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
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="João Silva" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail usado na compra</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seuemail@gmail.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Criar senha de acesso</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Mínimo 6 caracteres" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
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
