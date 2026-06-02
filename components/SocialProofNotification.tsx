"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";

const BUYERS = [
  { name: "Carlos M.", city: "São Paulo – SP", service: "barbearia" },
  { name: "Amanda R.", city: "Belo Horizonte – MG", service: "estética" },
  { name: "Rafael S.", city: "Curitiba – PR", service: "personal trainer" },
  { name: "Juliana F.", city: "Fortaleza – CE", service: "odontologia" },
  { name: "Diego L.", city: "Porto Alegre – RS", service: "mecânica" },
  { name: "Priscila T.", city: "Recife – PE", service: "loja de roupa" },
  { name: "Marcos V.", city: "Goiânia – GO", service: "barbearia" },
  { name: "Fernanda C.", city: "Salvador – BA", service: "estética" },
  { name: "Bruno A.", city: "Campinas – SP", service: "restaurante" },
  { name: "Tatiane P.", city: "Manaus – AM", service: "ótica" },
  { name: "Luciana D.", city: "Florianópolis – SC", service: "clínica médica" },
  { name: "Rodrigo N.", city: "Natal – RN", service: "imobiliária" },
];

export default function SocialProofNotification() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;
    let i = 0;

    function cycle() {
      setIndex(i);
      setVisible(true);
      t2 = setTimeout(() => {
        setVisible(false);
        t3 = setTimeout(() => {
          i = (i + 1) % BUYERS.length;
          cycle();
        }, 700);
      }, 4500);
    }

    t1 = setTimeout(cycle, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const buyer = BUYERS[index];
  const initials = buyer.name.split(" ").map((p) => p[0]).join("").slice(0, 2);

  return (
    <div
      className={`
        fixed bottom-6 left-5 z-50 w-72
        bg-white rounded-2xl shadow-xl border border-gray-100
        px-4 py-3 flex items-center gap-3
        transition-all duration-500 ease-out
        ${visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-5 pointer-events-none"
        }
      `}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
        {initials}
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">
          {buyer.name} <span className="font-normal text-gray-500">de</span> {buyer.city}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          acabou de assinar o plano
        </p>
      </div>

      {/* Check */}
      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
        <Check size={13} className="text-green-600" strokeWidth={2.5} />
      </div>
    </div>
  );
}
