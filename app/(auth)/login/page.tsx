"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const params   = useSearchParams();
  const redirect = params.get("redirect") ?? "/dashboard";
  const router   = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(
    params.get("error") === "1" ? "E-mail ou senha incorretos. Tente novamente." : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("E-mail ou senha incorretos. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seuemail@gmail.com"
          style={{ color: "#111827", backgroundColor: "#ffffff" }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          style={{ color: "#111827", backgroundColor: "#ffffff" }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
        />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full gradient-brand text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            Entrando…
          </>
        ) : "Entrar"}
      </button>
      <div className="mt-2 text-center text-sm text-gray-500">
        Ainda não tem conta?{" "}
        <Link href="/cadastro-pos-compra" className="text-violet-600 font-semibold hover:underline">
          Criar conta após compra
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block font-bold text-2xl text-gradient mb-4">MeuNegócio Pro</Link>
            <h1 className="text-2xl font-bold text-gray-900">Entrar na sua conta</h1>
            <p className="text-gray-500 mt-1 text-sm">Acesse seus materiais a qualquer momento</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <Suspense fallback={<div className="h-40" />}>
              <LoginForm />
            </Suspense>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Precisando de ajuda?{" "}
            <Link href="/suporte" className="text-violet-500 hover:underline">Ver suporte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
