import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/blog", label: "Blog" },
  { href: "/otros-proyectos", label: "Otros Proyectos" },
  { href: "/perfil", label: "Perfil Profesional" },
  { href: "/contacto", label: "Contacto" },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-300 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="text-base font-bold tracking-tight text-neutral-900 hover:text-neutral-600"
        >
          Sitio Personal
        </Link>
        <nav aria-label="Navegación principal">
          <ul className="flex flex-wrap items-center gap-6 text-sm font-medium text-neutral-700">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-neutral-950 hover:underline underline-offset-4"
                >
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
