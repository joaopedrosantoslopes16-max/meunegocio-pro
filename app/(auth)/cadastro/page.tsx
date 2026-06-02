"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
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

    const res = await fetch("/api/check-purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const { approved } = await res.json();

    if (!approved) {
      setError("Não encontramos uma compra aprovada para este e-mail. Use o mesmo e-mail da compra ou fale com o suporte.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-bold text-2xl text-gradient mb-4">MeuNegócio Pro</Link>
          <h1 className="text-2xl font-bold text-gray-900">Criar sua conta</h1>
          <p className="text-gray-500 mt-1 text-sm">Use o mesmo e-mail utilizado na compra</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-6 text-sm text-indigo-800">
            Use o mesmo e-mail utilizado no checkout para acessar seus materiais.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Seu nome</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="João Silva" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail da compra</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seuemail@gmail.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Criar senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Mínimo 6 caracteres" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
            )}

            <button type="submit" disabled={loading} className="w-full gradient-brand text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-60">
              {loading ? "Verificando compra..." : "Criar minha conta"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Já tem conta?{" "}
            <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Entrar</Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Problemas?{" "}
          <Link href="/suporte" className="text-indigo-500 hover:underline">Fale com o suporte</Link>
        </p>
      </div>
    </div>
  );
}
