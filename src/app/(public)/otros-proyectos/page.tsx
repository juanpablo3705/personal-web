import Link from "next/link";

export type BloqueProyectoEstatico = {
  id: string;
  categoria: string;
  periodo: string;
  titulo: string;
  descripcion: string;
  puntosClave?: string[];
  enlaceTexto?: string;
  enlaceUrl?: string;
};

/**
 * Lista modular de bloques estáticos.
 * Para agregar nuevos bloques en el futuro, basta con añadir un objeto a este arreglo.
 */
const BLOQUES_OTROS_PROYECTOS: BloqueProyectoEstatico[] = [
  {
    id: "iniciativa-01",
    categoria: "Experimento / Prototipo",
    periodo: "En archivo",
    titulo: "Módulo de Experimentación Técnica",
    descripcion:
      "Espacio reservado para documentar prototipos rápidos, pruebas de concepto, herramientas de uso interno y exploraciones de código o diseño.",
    puntosClave: [
      "Arquitectura ligera enfocada en funcionalidad directa.",
      "Documentación breve de aprendizajes y resultados.",
    ],
  },
  {
    id: "iniciativa-02",
    categoria: "Colaboración",
    periodo: "Continuo",
    titulo: "Participaciones y Proyectos Paralelos",
    descripcion:
      "Registro estático de colaboraciones interdisciplinarias, aportes en proyectos de terceros, talleres y asesorías puntuales.",
    puntosClave: [
      "Integración con equipos externos y comunidades.",
      "Publicaciones, charlas o recursos compartidos.",
    ],
  },
  {
    id: "iniciativa-03",
    categoria: "Recursos y Herramientas",
    periodo: "Permanente",
    titulo: "Repositorio de Utilidades y Plantillas",
    descripcion:
      "Colección curada de scripts, configuraciones base y pequeños sistemas reutilizables desarrollados a lo largo del tiempo.",
    puntosClave: [
      "Automatizaciones y flujos de trabajo.",
      "Guías de referencia rápida y notas técnicas.",
    ],
  },
  {
    id: "iniciativa-04",
    categoria: "Archivo Histórico",
    periodo: "Etapas previas",
    titulo: "Trabajos Anteriores y Primeros Desarrollos",
    descripcion:
      "Compendio de proyectos de etapas iniciales que forman parte del recorrido formativo y profesional.",
    puntosClave: [
      "Evolución de criterios técnicos y de diseño.",
      "Conservación de referencias y enlaces históricos.",
    ],
  },
];

export default function OtrosProyectosPage() {
  return (
    <div className="space-y-10">
      {/* Cabecera de la página */}
      <header className="space-y-3 border-b border-neutral-300 pb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          Sección Estática Modular
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Otros Proyectos
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
          Archivo estructurado en bloques modulares para presentar iniciativas
          paralelas, experimentos, colaboraciones y proyectos que complementan
          el catálogo principal.
        </p>
      </header>

      {/* Grilla modular de bloques estáticos */}
      <section
        aria-label="Bloques de proyectos e iniciativas"
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        {BLOQUES_OTROS_PROYECTOS.map((bloque) => (
          <article
            key={bloque.id}
            className="flex flex-col justify-between border border-neutral-300 bg-white p-6"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-2 text-xs text-neutral-500">
                <span className="font-medium uppercase tracking-wider">
                  {bloque.categoria}
                </span>
                <span>{bloque.periodo}</span>
              </div>

              <h2 className="text-lg font-bold text-neutral-900">
                {bloque.titulo}
              </h2>

              <p className="text-sm leading-relaxed text-neutral-600">
                {bloque.descripcion}
              </p>

              {bloque.puntosClave && bloque.puntosClave.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 pt-1 text-xs leading-relaxed text-neutral-600">
                  {bloque.puntosClave.map((punto) => (
                    <li key={punto}>{punto}</li>
                  ))}
                </ul>
              )}
            </div>

            {bloque.enlaceUrl && bloque.enlaceTexto && (
              <div className="mt-6 border-t border-neutral-200 pt-3">
                <a
                  href={bloque.enlaceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-neutral-900 hover:underline underline-offset-4"
                >
                  {bloque.enlaceTexto} →
                </a>
              </div>
            )}
          </article>
        ))}
      </section>

      {/* Bloque transversal inferior preparado para expansiones futuras */}
      <section
        aria-labelledby="bloque-adicional-titulo"
        className="flex flex-col justify-between gap-4 border border-neutral-300 bg-neutral-50 p-6 sm:flex-row sm:items-center"
      >
        <div className="space-y-1">
          <h2
            id="bloque-adicional-titulo"
            className="text-base font-bold text-neutral-900"
          >
            ¿Buscas los proyectos principales o propuestas de colaboración?
          </h2>
          <p className="text-xs leading-relaxed text-neutral-600">
            Puedes revisar el catálogo completo de publicaciones dinámicas o
            escribir directamente desde el formulario de contacto.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/proyectos"
            className="inline-flex items-center justify-center border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
          >
            Ir a Proyectos
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center border border-neutral-900 bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Contactar
          </Link>
        </div>
      </section>
    </div>
  );
}
