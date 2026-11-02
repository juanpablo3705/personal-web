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
    return "/storage/v1/object/public/documents/cv_actual.pdf?download=CV_JuanPabloOyanedel.pdf";
  }

  return `${supabaseUrl}/storage/v1/object/public/documents/cv_actual.pdf?download=CV_JuanPabloOyanedel.pdf`;
}

export default function PerfilPage() {
  const cvPublicUrl = getCvPublicUrl();

  return (
    <div className="space-y-32">
      {/* 1. LANDING DE PERFIL (misma estructura, dimensiones y posicionamiento que el Home, sobre fondo blanco) */}
      <section
        aria-labelledby="perfil-nombre"
        className="flex min-h-[calc(100vh-4.5rem)] flex-col justify-start pt-2 pb-16"
      >
        {/* Bloque superior izquierdo idéntico al Home */}
        <div className="max-w-xs space-y-0.5">
          <h1
            id="perfil-nombre"
            className="font-roman text-sm sm:text-base"
          >
            Juan Pablo Oyanedel
          </h1>
          <p className="font-heavy text-sm sm:text-base">
            Analista Programador
          </p>
        </div>

        {/* Columna izquierda con fuente más pequeña y delgada para mayor densidad de texto + enlace final al CV */}
        <div className="mt-10 max-w-xl space-y-6 sm:mt-14">
          <p className="indent-8 font-light-avenir text-xs leading-relaxed sm:text-sm">
            Analista Programador dedicado al diseño, construcción y
            mantenimiento de sistemas de software, aplicaciones web y
            estructuras de datos con énfasis en la claridad arquitectónica, la
            eficiencia operativa y la durabilidad técnica.
          </p>
          <p className="indent-8 font-light-avenir text-xs leading-relaxed sm:text-sm">
            A lo largo de mi trayectoria he articulado el desarrollo práctico de
            código con el análisis riguroso de requerimientos, la documentación
            continua de procesos y la integración de herramientas modernas que
            simplifican flujos complejos sin sacrificar estabilidad ni control.
          </p>
          <p className="indent-8 font-light-avenir text-xs leading-relaxed sm:text-sm">
            Mi enfoque prioriza soluciones sobrias, legibles y centradas en las
            personas que las utilizan y mantienen, buscando siempre el equilibrio
            entre precisión funcional, rendimiento y coherencia visual en cada
            etapa del ciclo de vida de un proyecto.
          </p>

          <div className="flex flex-col items-start gap-4 pt-2">
            <a
              href={cvPublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              download="CV_JuanPabloOyanedel.pdf"
              className="hyper-link font-heavy text-xs tracking-wide sm:text-sm"
            >
              Descargar CV en PDF &gt;
            </a>
            <a
              href="https://github.com/juanpablo3705"
              target="_blank"
              rel="noopener noreferrer"
              className="hyper-link font-heavy text-xs tracking-wide sm:text-sm"
            >
              Perfil de GitHub &gt;
            </a>
            <a
              href="mailto:juanpablo3705@gmail.com"
              className="hyper-link font-heavy text-xs tracking-wide sm:text-sm"
            >
              Enviar correo &gt;
            </a>
          </div>
        </div>
      </section>

      {/* 2. CONTENIDO INFERIOR DESDE EXPERIENCIA PROFESIONAL HACIA ABAJO
          (separadores únicamente en los subtítulos; elementos de lista sueltos) */}
      <div className="space-y-16 pb-12">
        {/* Experiencia Profesional */}
        <section aria-labelledby="experiencia-titulo" className="space-y-6">
          <h2
            id="experiencia-titulo"
            className="border-b border-current pb-3 font-heavy text-lg uppercase tracking-tight sm:text-xl"
          >
            EXPERIENCIA PROFESIONAL
          </h2>

          <div className="space-y-8">
            {EXPERIENCIA_PROFESIONAL.map((item) => (
              <article key={item.id} className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-heavy text-base leading-snug">{item.cargo}</h3>
                  <span className="font-roman text-xs sm:text-sm">{item.periodo}</span>
                </div>
                <p className="font-heavy text-xs uppercase tracking-wider sm:text-sm">
                  {item.organizacion}
                </p>
                <p className="font-roman text-xs leading-relaxed sm:text-sm">
                  {item.descripcion}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Formación Académica y Áreas de Especialidad */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-16">
          <section aria-labelledby="formacion-titulo" className="space-y-6">
            <h2
              id="formacion-titulo"
              className="border-b border-current pb-3 font-heavy text-lg uppercase tracking-tight sm:text-xl"
            >
              FORMACIÓN ACADÉMICA
            </h2>

            <div className="space-y-6">
              {FORMACION_ACADEMICA.map((item) => (
                <article key={item.id} className="space-y-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-heavy text-base leading-snug">
                      {item.titulo}
                    </h3>
                    <span className="font-roman text-xs sm:text-sm">{item.periodo}</span>
                  </div>
                  <p className="font-heavy text-xs uppercase tracking-wider sm:text-sm">
                    {item.institucion}
                  </p>
                  <p className="font-roman text-xs leading-relaxed sm:text-sm">
                    {item.detalle}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="competencias-titulo" className="space-y-6">
            <h2
              id="competencias-titulo"
              className="border-b border-current pb-3 font-heavy text-lg uppercase tracking-tight sm:text-xl"
            >
              ÁREAS DE ESPECIALIDAD
            </h2>

            <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {AREAS_COMPETENCIA.map((area) => (
                <li key={area} className="font-roman text-xs leading-relaxed sm:text-sm">
                  {area}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
