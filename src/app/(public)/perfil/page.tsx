import Link from "next/link";

type ExperienciaItem = {
  id: string;
  cargo: string;
  organizacion: string;
  periodo: string;
  descripcion: string;
};

type FormacionItem = {
  id: string;
  titulo: string;
  institucion: string;
  periodo: string;
  detalle: string;
};

const EXPERIENCIA_PROFESIONAL: ExperienciaItem[] = [
  {
    id: "exp-1",
    cargo: "Rol Profesional Principal / Especialista",
    organizacion: "Organización o Práctica Independiente",
    periodo: "Actualidad",
    descripcion:
      "Dirección, desarrollo y ejecución de proyectos estratégicos, combinando rigor técnico, comunicación clara y orientación a resultados.",
  },
  {
    id: "exp-2",
    cargo: "Coordinación y Desarrollo de Proyectos",
    organizacion: "Equipo / Institución Previa",
    periodo: "Etapa Anterior",
    descripcion:
      "Planificación e implementación de soluciones integrales, gestión de entregables y colaboración con equipos multidisciplinarios.",
  },
];

const FORMACION_ACADEMICA: FormacionItem[] = [
  {
    id: "form-1",
    titulo: "Título Profesional / Grado Académico",
    institucion: "Universidad / Institución Educativa",
    periodo: "Formación Superior",
    detalle:
      "Formación base y especialización aplicada al desarrollo de proyectos y resolución de problemas.",
  },
  {
    id: "form-2",
    titulo: "Actualización Continua y Especializaciones",
    institucion: "Programas y Certificaciones",
    periodo: "Continuo",
    detalle:
      "Perfeccionamiento constante en metodologías, herramientas modernas y gestión de proyectos.",
  },
];

const AREAS_COMPETENCIA = [
  "Gestión y Desarrollo de Proyectos",
  "Arquitectura y Diseño de Soluciones",
  "Comunicación Técnica y Documentación",
  "Investigación y Análisis",
  "Trabajo Colaborativo",
  "Mejora Continua",
] as const;

function getCvPublicUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(
    /\/+$/,
    ""
  );

  if (!supabaseUrl) {
    return "/storage/v1/object/public/documents/cv_actual.pdf";
  }

  return `${supabaseUrl}/storage/v1/object/public/documents/cv_actual.pdf`;
}

export default function PerfilPage() {
  const cvPublicUrl = getCvPublicUrl();

  return (
    <div className="space-y-10">
      {/* Cabecera con botón destacado de descarga de CV */}
      <header className="flex flex-col justify-between gap-6 border border-neutral-300 bg-white p-8 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Trayectoria y Currículum
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Perfil Profesional
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-neutral-600">
            Resumen biográfico, experiencia laboral, formación académica y
            acceso directo a la versión actualizada de mi Currículum Vitae en
            formato PDF.
          </p>
        </div>

        <div className="shrink-0">
          <a
            href={cvPublicUrl}
            target="_blank"
            rel="noopener noreferrer"
            download="cv_actual.pdf"
            className="inline-flex items-center justify-center border border-neutral-900 bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Descargar CV en PDF
          </a>
        </div>
      </header>

      {/* Biografía / Presentación Profesional */}
      <section
        aria-labelledby="biografia-titulo"
        className="space-y-4 border border-neutral-300 bg-white p-8"
      >
        <h2
          id="biografia-titulo"
          className="border-b border-neutral-200 pb-3 text-lg font-bold tracking-tight text-neutral-900"
        >
          Biografía y Resumen Profesional
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-neutral-700">
          <p>
            Profesional enfocado en la creación, estructuración y ejecución de
            proyectos con atención al detalle, claridad funcional y solidez
            técnica.
          </p>
          <p>
            A lo largo de mi trayectoria he combinado el desarrollo práctico con
            la documentación continua de procesos, buscando construir soluciones
            mantenibles y centradas en las personas.
          </p>
        </div>
      </section>

      {/* Experiencia Profesional */}
      <section
        aria-labelledby="experiencia-titulo"
        className="space-y-4 border border-neutral-300 bg-white p-8"
      >
        <h2
          id="experiencia-titulo"
          className="border-b border-neutral-200 pb-3 text-lg font-bold tracking-tight text-neutral-900"
        >
          Experiencia Profesional
        </h2>

        <div className="divide-y divide-neutral-200">
          {EXPERIENCIA_PROFESIONAL.map((item) => (
            <article key={item.id} className="space-y-2 py-5 first:pt-1 last:pb-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-neutral-900">
                  {item.cargo}
                </h3>
                <span className="text-xs font-medium text-neutral-500">
                  {item.periodo}
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                {item.organizacion}
              </p>
              <p className="text-sm leading-relaxed text-neutral-600">
                {item.descripcion}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Formación y Áreas de Competencia */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section
          aria-labelledby="formacion-titulo"
          className="space-y-4 border border-neutral-300 bg-white p-6"
        >
          <h2
            id="formacion-titulo"
            className="border-b border-neutral-200 pb-3 text-lg font-bold tracking-tight text-neutral-900"
          >
            Formación Académica
          </h2>

          <div className="divide-y divide-neutral-200">
            {FORMACION_ACADEMICA.map((item) => (
              <article
                key={item.id}
                className="space-y-1.5 py-4 first:pt-1 last:pb-1"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-bold text-neutral-900">
                    {item.titulo}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {item.periodo}
                  </span>
                </div>
                <p className="text-xs font-medium text-neutral-600">
                  {item.institucion}
                </p>
                <p className="text-xs leading-relaxed text-neutral-600">
                  {item.detalle}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="competencias-titulo"
          className="space-y-4 border border-neutral-300 bg-white p-6"
        >
          <h2
            id="competencias-titulo"
            className="border-b border-neutral-200 pb-3 text-lg font-bold tracking-tight text-neutral-900"
          >
            Áreas de Especialidad
          </h2>

          <ul className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
            {AREAS_COMPETENCIA.map((area) => (
              <li
                key={area}
                className="border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-800"
              >
                {area}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Pie de página de Perfil con acceso rápido a CV y Contacto */}
      <section
        aria-label="Descarga de documento y contacto"
        className="flex flex-col justify-between gap-4 border border-neutral-300 bg-neutral-50 p-6 sm:flex-row sm:items-center"
      >
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-neutral-900">
            Documento completo disponible en PDF
          </h2>
          <p className="text-xs text-neutral-600">
            Descarga la versión oficial del CV o envíame un mensaje directo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={cvPublicUrl}
            target="_blank"
            rel="noopener noreferrer"
            download="cv_actual.pdf"
            className="inline-flex items-center justify-center border border-neutral-900 bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Descargar CV en PDF
          </a>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
          >
            Ir a Contacto
          </Link>
        </div>
      </section>
    </div>
  );
}
