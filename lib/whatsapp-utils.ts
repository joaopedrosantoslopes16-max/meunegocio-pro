export function cleanPhone(raw: string): string {
  return raw.replace(/\D/g, "");
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
