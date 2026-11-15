import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { preconnect, preload } from "react-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import "./globals.css";

// Geist Mono solo se usa en el portal privado: display "block" prohibe mostrar fuente de respaldo
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "block",
  preload: false,
});

export const metadata: Metadata = {
  title: "Juan Pablo Oyanedel — Portafolio y Publicaciones",
  description: "Portafolio de proyectos, blog y perfil profesional.",
};

const INIT_THEME_AND_FONTS_SCRIPT = `(function(){try{var r=document.documentElement;if(window.location.pathname==="/"){r.classList.add("canvas-inverted");}function show(){r.classList.add("fonts-ready");}if(document.fonts&&document.fonts.load){var t=setTimeout(show,2500);Promise.all([document.fonts.load('400 16px "AvenirLT-Roman"'),document.fonts.load('800 16px "Avenir LT 85 Heavy"'),document.fonts.ready]).then(function(){clearTimeout(t);show();}).catch(function(){clearTimeout(t);show();});}else{show();}}catch(e){document.documentElement.classList.add("fonts-ready");}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Precarga prioritaria de las dos fuentes oficiales Avenir auto-alojadas
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (supabaseUrl) {
    preconnect(supabaseUrl, { crossOrigin: "anonymous" });
  }

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: INIT_THEME_AND_FONTS_SCRIPT }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--blanco)] text-[var(--negro)]">
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}
