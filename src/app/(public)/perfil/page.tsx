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
    <div className="space-y-16 pt-6">
      {/* Cabecera: Nombre completo en negritas y dos líneas de ejemplo */}
      <header className="space-y-3">
        <h1 className="font-heavy text-2xl tracking-tight sm:text-3xl">
          Juan Pablo Oyanedel
        </h1>
        <div className="space-y-1 font-roman text-sm leading-relaxed sm:text-base">
          <p>
            Analista Programador enfocado en el desarrollo de software, diseño
            de sistemas y arquitectura de aplicaciones web.
          </p>
          <p>
            Construcción de soluciones tecnológicas claras, mantenibles y
            orientadas a la precisión funcional.
          </p>
        </div>
      </header>

      {/* Hipervínculo centrado y grande en negritas para descargar CV en PDF */}
      <div className="py-6 text-center">
        <a
          href={cvPublicUrl}
          target="_blank"
          rel="noopener noreferrer"
          download="cv_actual.pdf"
          className="hyper-link font-heavy text-2xl tracking-tight sm:text-3xl md:text-4xl"
        >
          Descargar CV en PDF
        </a>
      </div>

      {/* Experiencia Profesional (sin cajas contenedoras, con líneas separadoras negras) */}
      <section aria-labelledby="experiencia-titulo" className="space-y-4">
        <h2
          id="experiencia-titulo"
          className="border-b border-current pb-3 font-heavy text-lg tracking-tight sm:text-xl"
        >
          Experiencia Profesional
        </h2>

        <div className="divide-y divide-current">
          {EXPERIENCIA_PROFESIONAL.map((item) => (
            <article
              key={item.id}
              className="space-y-2 py-6 first:pt-2 last:pb-2"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-heavy text-base">{item.cargo}</h3>
                <span className="font-roman text-xs">{item.periodo}</span>
              </div>
              <p className="font-heavy text-xs uppercase tracking-wider">
                {item.organizacion}
              </p>
              <p className="font-roman text-sm leading-relaxed">
                {item.descripcion}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Formación Académica y Áreas de Especialidad */}
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-16">
        <section aria-labelledby="formacion-titulo" className="space-y-4">
          <h2
            id="formacion-titulo"
            className="border-b border-current pb-3 font-heavy text-lg tracking-tight sm:text-xl"
          >
            Formación Académica
          </h2>

          <div className="divide-y divide-current">
            {FORMACION_ACADEMICA.map((item) => (
              <article
                key={item.id}
                className="space-y-1.5 py-5 first:pt-2 last:pb-2"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-heavy text-sm sm:text-base">
                    {item.titulo}
                  </h3>
                  <span className="font-roman text-xs">{item.periodo}</span>
                </div>
                <p className="font-heavy text-xs uppercase tracking-wider">
                  {item.institucion}
                </p>
                <p className="font-roman text-xs leading-relaxed sm:text-sm">
                  {item.detalle}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="competencias-titulo" className="space-y-4">
          <h2
            id="competencias-titulo"
            className="border-b border-current pb-3 font-heavy text-lg tracking-tight sm:text-xl"
          >
            Áreas de Especialidad
          </h2>

          <ul className="grid grid-cols-1 gap-x-8 pt-1 sm:grid-cols-2">
            {AREAS_COMPETENCIA.map((area) => (
              <li
                key={area}
                className="border-b border-current py-3 font-roman text-xs sm:text-sm"
              >
                {area}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
