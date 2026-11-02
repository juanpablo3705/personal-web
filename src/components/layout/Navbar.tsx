"use client";

import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/perfil", label: "Perfil" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/blog", label: "Blog" },
  { href: "/otros-proyectos", label: "Ideas" },
  { href: "/contacto", label: "Contacto" },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--theme-bg)] text-[var(--theme-fg)]">
      <div className="flex w-full items-center justify-end px-5 py-5 sm:px-8 md:px-12 lg:px-16">
        <nav aria-label="Navegación principal" className="w-full">
          <ul className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm sm:gap-x-10 sm:text-base md:gap-x-14">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hyper-link font-roman">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
