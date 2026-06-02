import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeuNegócio Pro — Mini site + posts para Instagram",
  description:
    "Gere um mini site com botão de WhatsApp e 30 posts personalizados para o Instagram do seu negócio local.",
  openGraph: {
    title: "MeuNegócio Pro",
    description: "Mini site + posts para Instagram em minutos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
