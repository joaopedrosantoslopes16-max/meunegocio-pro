export function cleanPhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

// Máscara de telefone brasileiro — aplica enquanto o usuário digita.
// Aceita 10 dígitos (fixo com DDD) ou 11 dígitos (celular com DDD).
// Remove automaticamente o código do país (+55) se colado com ele.
export function phoneInputMask(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  // Strip +55 country code se alguém colar o número completo
  if (digits.startsWith("55") && digits.length > 11) digits = digits.slice(2);
  digits = digits.slice(0, 11); // máximo 11 dígitos
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function buildWhatsAppLink(phone: string, message?: string): string {
  const cleaned = cleanPhone(phone);
  const number = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
  const encoded = encodeURIComponent(
    message ?? "Olá, vim pelo site e quero mais informações"
  );
  return `https://wa.me/${number}?text=${encoded}`;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = cleanPhone(phone);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return digits;
}
