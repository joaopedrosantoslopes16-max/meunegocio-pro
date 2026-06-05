"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NICHE_OPTIONS, NICHE_CONFIG } from "@/lib/niche-config";
import type { BusinessFormData } from "@/types";

export default function GerarKitPage() {
  const router = useRouter();
  const [form, setForm] = useState<BusinessFormData>({
    business_name: "",
    niche: "",
    city: "",
    whatsapp: "",
    instagram: "",
    address: "",
    main_service: "",
    services: "",
    primary_color: "#6366f1",
    tagline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    let { name, value } = e.target;
    if (name === "whatsapp") {
      value = value.replace(/\D/g, "").slice(0, 11);
      if (value.length > 6) value = `(${value.slice(0,2)}) ${value.slice(2,7)}-${value.slice(7)}`;
      else if (value.length > 2) value = `(${value.slice(0,2)}) ${value.slice(2)}`;
      else if (value.length > 0) value = `(${value}`;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.business_name || !form.niche || !form.city || !form.whatsapp || !form.main_service) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/kit/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao gerar o kit.");
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Erro inesperado.");
      setLoading(false);
    }
  }

  const selectedNiche = form.niche ? NICHE_CONFIG[form.niche] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-bold text-lg text-gradient">MeuNegócio Pro</Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-indigo-600 transition">← Dashboard</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gerar meu kit</h1>
          <p className="text-gray-500 mt-1">Preencha os dados do seu negócio para gerar o mini site, posts e legendas personalizadas.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do negócio *</label>
                <input name="business_name" value={form.business_name} onChange={handleChange} required placeholder="Ex: Barbearia Elite" style={{ color: "#111827", backgroundColor: "#ffffff" }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nicho *</label>
                <select name="niche" value={form.niche} onChange={handleChange} required style={{ color: "#111827", backgroundColor: "#ffffff" }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition">
                  <option value="">Selecione...</option>
                  {NICHE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cidade *</label>
                <input name="city" value={form.city} onChange={handleChange} required placeholder="São Paulo – SP" style={{ color: "#111827", backgroundColor: "#ffffff" }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp *</label>
                <input name="whatsapp" value={form.whatsapp} onChange={handleChange} required placeholder="(11) 99999-9999" style={{ color: "#111827", backgroundColor: "#ffffff" }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Instagram</label>
                <input name="instagram" value={form.instagram} onChange={handleChange} placeholder="@seunegocio" style={{ color: "#111827", backgroundColor: "#ffffff" }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Endereço</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Rua das Flores, 123 — Bairro" style={{ color: "#111827", backgroundColor: "#ffffff" }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Serviço principal *</label>
                <input name="main_service" value={form.main_service} onChange={handleChange} required placeholder={selectedNiche?.services[0] ?? "Ex: Corte masculino"} style={{ color: "#111827", backgroundColor: "#ffffff" }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cor principal da marca</label>
                <div className="flex items-center gap-3">
                  <input type="color" name="primary_color" value={form.primary_color} onChange={handleChange} className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer" />
                  <span className="text-sm text-gray-500">{form.primary_color}</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lista de serviços <span className="text-gray-400 font-normal">(separados por vírgula)</span></label>
                {selectedNiche && (
                  <p className="text-xs text-indigo-600 mb-1">Sugestão: {selectedNiche.services.join(", ")}</p>
                )}
                <input name="services" value={form.services} onChange={handleChange} placeholder="Corte, Barba, Sobrancelha" style={{ color: "#111827", backgroundColor: "#ffffff" }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Frase/chamada do negócio <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input name="tagline" value={form.tagline} onChange={handleChange} placeholder="Ex: Tradição e qualidade desde 2010" style={{ color: "#111827", backgroundColor: "#ffffff" }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
            )}

            <button type="submit" disabled={loading} className="w-full gradient-brand text-white font-bold py-4 rounded-xl text-base hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Gerando seu kit...
                </>
              ) : (
                "🚀 Gerar meu kit"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
