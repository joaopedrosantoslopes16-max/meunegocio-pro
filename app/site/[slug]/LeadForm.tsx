"use client";

import { useState } from "react";
import { phoneInputMask } from "@/lib/whatsapp-utils";

interface LeadFormProps {
  businessId: string;
  kitId: string | null;
  primaryColor: string;
}

const INTERESTS = [
  "Quero agendar um horário",
  "Quero um orçamento",
  "Quero saber sobre promoções",
  "Tenho uma dúvida",
  "Outro assunto",
];

export default function LeadForm({ businessId, kitId, primaryColor }: LeadFormProps) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [interest, setInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !whatsapp) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: businessId, kit_id: kitId, name, whatsapp, interest }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setDone(true);
    } catch {
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="text-3xl mb-2">✅</div>
        <p className="font-bold text-gray-800 text-sm">Cadastro realizado!</p>
        <p className="text-xs text-gray-500">Em breve entraremos em contato pelo WhatsApp.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Seu nome"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition bg-white"
        style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
      />
      <input
        value={whatsapp}
        onChange={(e) => setWhatsapp(phoneInputMask(e.target.value))}
        required
        placeholder="(11) 99999-9999"
        type="tel"
        maxLength={16}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition bg-white"
      />
      <select
        value={interest}
        onChange={(e) => setInterest(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition bg-white"
      >
        <option value="">Assunto (opcional)</option>
        {INTERESTS.map((i) => <option key={i} value={i}>{i}</option>)}
      </select>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60"
        style={{ background: primaryColor }}
      >
        {loading ? "Enviando..." : "Quero receber novidades"}
      </button>
    </form>
  );
}
