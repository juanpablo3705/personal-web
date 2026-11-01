import Link from "next/link";

const SECCIONES_PRINCIPALES = [
  {
    href: "/proyectos",
    titulo: "Proyectos",
    etiqueta: "Catálogo Dinámico",
    descripcion:
      "Selección de trabajos, desarrollos y casos de estudio publicados en orden cronológico.",
    accion: "Ver proyectos →",
  },
  {
    href: "/blog",
    titulo: "Blog",
    etiqueta: "Publicaciones",
    descripcion:
      "Artículos, notas técnicas, reflexiones y documentación de procesos.",
    accion: "Leer el blog →",
  },
  {
    href: "/otros-proyectos",
    titulo: "Otros Proyectos",
    etiqueta: "Archivo Modular",
    descripcion:
      "Iniciativas paralelas, experimentos, colaboraciones y bloques de contenido complementario.",
    accion: "Explorar iniciativas →",
  },
  {
    href: "/perfil",
    titulo: "Perfil Profesional",
    etiqueta: "Trayectoria y CV",
    descripcion:
      "Resumen biográfico, experiencia profesional, formación académica y descarga directa de CV en PDF.",
    accion: "Ver perfil y CV →",
  },
  {
    href: "/contacto",
    titulo: "Contacto",
    etiqueta: "Comunicación Directa",
    descripcion:
      "Formulario directo para consultas profesionales, propuestas de colaboración o mensajes.",
    accion: "Enviar un mensaje →",
  },
] as const;

export default function InicioPage() {
  return (
    <div className="space-y-10">
      {/* Bloque Hero / Bienvenida Principal */}
      <section
        aria-labelledby="inicio-titulo"
        className="space-y-6 border border-neutral-300 bg-white p-8 sm:p-10"
      >
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Bienvenida
          </p>
          <h1
            id="inicio-titulo"
            className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
          >
            Portafolio, Publicaciones y Archivo Personal
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-neutral-700">
            Espacio digital dedicado a reunir mis proyectos principales,
            artículos de blog, iniciativas complementarias y trayectoria
            profesional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/proyectos"
            className="inline-flex items-center justify-center border border-neutral-900 bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Explorar Proyectos
          </Link>
          <Link
            href="/perfil"
            className="inline-flex items-center justify-center border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
          >
            Perfil Profesional y CV
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
          >
            Contacto
          </Link>
        </div>
      </section>

      {/* Mapa de Secciones conectado al Menú Principal */}
      <section aria-labelledby="secciones-titulo" className="space-y-4">
        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-300 pb-3">
          <h2
            id="secciones-titulo"
            className="text-lg font-bold tracking-tight text-neutral-900"
          >
            Secciones del Sitio
          </h2>
          <span className="text-xs text-neutral-500">
            Acceso directo a los módulos principales
          </span>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SECCIONES_PRINCIPALES.map((seccion) => (
            <article
              key={seccion.href}
              className="flex flex-col justify-between border border-neutral-300 bg-white p-6 transition-colors hover:border-neutral-900"
            >
              <div className="space-y-2">
                <span className="inline-block text-xs font-medium uppercase tracking-wider text-neutral-500">
                  {seccion.etiqueta}
                </span>
                <h3 className="text-lg font-bold text-neutral-900">
                  <Link
                    href={seccion.href}
                    className="hover:underline underline-offset-4"
                  >
                    {seccion.titulo}
                  </Link>
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {seccion.descripcion}
                </p>
              </div>

              <div className="mt-6 border-t border-neutral-200 pt-3">
                <Link
                  href={seccion.href}
                  className="inline-flex items-center text-xs font-semibold text-neutral-900 hover:underline underline-offset-4"
                >
                  {seccion.accion}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
