"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const params   = useSearchParams();
  const redirect = params.get("redirect") ?? "/dashboard";
  const hasError = params.get("error") === "1";

  return (
    <form method="POST" action="/api/auth/login" className="space-y-4">
      <input type="hidden" name="redirect" value={redirect} />
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
        <input type="email" name="email" required placeholder="seuemail@gmail.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
        <input type="password" name="password" required placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
      </div>
      {hasError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          E-mail ou senha incorretos. Tente novamente.
        </div>
      )}
      <button type="submit" className="w-full gradient-brand text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition">
        Entrar
      </button>
      <div className="mt-2 text-center text-sm text-gray-500">
        Ainda não tem conta?{" "}
        <Link href="/cadastro-pos-compra" className="text-indigo-600 font-semibold hover:underline">
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

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 text-center">
            <p className="text-xs font-bold text-yellow-700 mb-2">👁️ Quer ver como fica o painel do cliente?</p>
            <Link href="/demo" className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 font-extrabold text-sm px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition">
              Abrir modo demo
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Precisando de ajuda?{" "}
            <Link href="/suporte" className="text-indigo-500 hover:underline">Ver suporte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
