"use client";

import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "INICIO" },
  { href: "/perfil", label: "PERFIL" },
  { href: "/proyectos", label: "PROYECTOS" },
  { href: "/blog", label: "BLOG" },
  { href: "/otros-proyectos", label: "IDEAS" },
  { href: "/contacto", label: "CONTACTO" },
] as const;

type NavbarProps = {
  isInverted: boolean;
};

export function Navbar({ isInverted }: NavbarProps) {
  return (
    <header
      className={`sticky top-0 z-40 w-full bg-[var(--theme-bg)] text-[var(--theme-fg)] ${
        isInverted ? "theme-inverted" : "theme-normal"
      }`}
    >
      <div className="flex w-full items-center justify-end px-5 py-5 sm:px-8 md:px-12 lg:px-16">
        <nav aria-label="Navegación principal" className="w-full">
          <ul className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-xs sm:gap-x-10 sm:text-sm md:gap-x-14">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hyper-link font-roman uppercase">
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
