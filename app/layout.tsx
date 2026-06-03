import type { Metadata } from "next";
import "./globals.css";

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700;800;900&display=swap";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={GOOGLE_FONTS_URL} rel="stylesheet" />
      </head>
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
