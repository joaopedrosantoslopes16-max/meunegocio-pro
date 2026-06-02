"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NICHE_OPTIONS, NICHE_CONFIG } from "@/lib/niche-config";
import { generatePosts, generateCaptions, generateWhatsAppMessages, generateInstagramBio, generateSlug } from "@/lib/kit-generator";
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
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Verifica compra
      const purchaseRes = await fetch("/api/check-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const { approved, status: purchaseStatus, purchase_id } = await purchaseRes.json();

      if (!approved) {
        if (purchaseStatus === "refunded" || purchaseStatus === "chargeback" || purchaseStatus === "cancelled") {
          router.push("/acesso-bloqueado");
          return;
        }
        setError("Nenhuma compra aprovada encontrada. Se você acabou de comprar, aguarde alguns minutos.");
        setLoading(false);
        return;
      }

      const services = form.services.split(",").map((s) => s.trim()).filter(Boolean);
      const slug = generateSlug(form.business_name);
      const cfg = NICHE_CONFIG[form.niche] ?? NICHE_CONFIG.outro;
      const input = { ...form, services };

      const posts = generatePosts(input);
      const captions = generateCaptions(input);
      const messages = generateWhatsAppMessages(input);
      const bio = generateInstagramBio(input);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

      // Salva negócio
      const { data: business, error: bizError } = await supabase.from("businesses").insert({
        user_id: user.id,
        business_name: form.business_name,
        niche: form.niche,
        city: form.city,
        whatsapp: form.whatsapp,
        instagram: form.instagram,
        address: form.address,
        main_service: form.main_service,
        services,
        primary_color: form.primary_color,
        slug,
      }).select().single();

      if (bizError) throw bizError;

      // Salva kit
      const { data: kit, error: kitError } = await supabase.from("kits").insert({
        user_id: user.id,
        business_id: business.id,
        purchase_id: purchase_id ?? null,
        status: "ready",
        release_stage: 1,
        purchase_approved_at: new Date().toISOString(),
        day_0_unlocked: true,
        day_3_unlocked: false,
        day_7_unlocked: false,
        site_slug: slug,
        site_url: `${appUrl}/site/${slug}`,
        posts_json: posts,
        captions_json: captions,
        whatsapp_messages_json: messages,
        instagram_bio: bio,
      }).select().single();

      if (kitError) throw kitError;

      // Log
      await supabase.from("access_logs").insert({
        user_id: user.id,
        kit_id: kit.id,
        purchase_id: purchase_id ?? null,
        action: "generate_kit",
        metadata: { niche: form.niche, city: form.city },
      });

      router.push(`/kit/${kit.id}`);
    } catch (err) {
      console.error(err);
      setError("Erro ao gerar o kit. Tente novamente.");
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
                <input name="business_name" value={form.business_name} onChange={handleChange} required placeholder="Ex: Barbearia Elite" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nicho *</label>
                <select name="niche" value={form.niche} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition">
                  <option value="">Selecione...</option>
                  {NICHE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cidade *</label>
                <input name="city" value={form.city} onChange={handleChange} required placeholder="São Paulo – SP" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp *</label>
                <input name="whatsapp" value={form.whatsapp} onChange={handleChange} required placeholder="(11) 99999-9999" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Instagram</label>
                <input name="instagram" value={form.instagram} onChange={handleChange} placeholder="@seunegocio" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Endereço</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Rua das Flores, 123 — Bairro" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Serviço principal *</label>
                <input name="main_service" value={form.main_service} onChange={handleChange} required placeholder={selectedNiche?.services[0] ?? "Ex: Corte masculino"} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
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
                <input name="services" value={form.services} onChange={handleChange} placeholder="Corte, Barba, Sobrancelha" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Frase/chamada do negócio <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input name="tagline" value={form.tagline} onChange={handleChange} placeholder="Ex: Tradição e qualidade desde 2010" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
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
