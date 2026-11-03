import type { Metadata } from "next";
import { Geist_Mono, Noto_Serif } from "next/font/google";
import { preload } from "react-dom";
import "./globals.css";

// Geist Mono solo se usa en el portal privado: no precargarla en cada visita pública
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Juan Pablo Oyanedel — Portafolio y Publicaciones",
  description: "Portafolio de proyectos, blog y perfil profesional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Precarga de las fuentes Avenir usadas en todas las páginas para reducir el
  // parpadeo de tipografía (texto que cambia de fuente) en la primera visita
  preload("/fonts/AvenirLTStd-Roman.woff", {
    as: "font",
    type: "font/woff",
    crossOrigin: "anonymous",
  });
  preload("/fonts/AvenirLTStd-Heavy.woff", {
    as: "font",
    type: "font/woff",
    crossOrigin: "anonymous",
  });

  return (
    <html
      lang="es"
      className={`${geistMono.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--blanco)] text-[var(--negro)]">
        {children}
      </body>
    </html>
  );
}
