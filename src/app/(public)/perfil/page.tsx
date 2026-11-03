import { getCvPublicUrl } from "@/lib/cv";

type ExperienciaItem = {
  id: string;
  organizacion: string;
  periodo: string;
  cargo: string;
  ubicacion: string;
  puntos: string[];
};

type EducacionItem = {
  id: string;
  institucion: string;
  periodo: string;
  carrera: string;
  puntos?: string[];
};

const EXPERIENCIA_LABORAL: ExperienciaItem[] = [
  {
    id: "exp-1",
    organizacion: "Estudio de arquitectura 890 ARQ SpA.",
    periodo: "2024 - 2026",
    cargo:
      "Comunicación organizacional, soporte informático y atención al cliente",
    ubicacion: "Valparaíso",
    puntos: [
      "Encargado de comunicaciones y marketing digital para difusión de marca.",
      "Soporte técnico TI integral. Gestión de actualizaciones y mantenimiento de sitio web.",
      "Administración de plataforma CRM HubSpot para el registro, seguimiento y resolución de incidencias en flujos de atención y datos de clientes.",
      "Atención al cliente enfocada en la elaboración de presupuestos de proyectos y visitas en terreno.",
    ],
  },
  {
    id: "exp-2",
    organizacion: "Transportes Travel Tours LTDA.",
    periodo: "2018 - 2020",
    cargo: "Analista de licitaciones públicas y soporte informático",
    ubicacion: "Viña del Mar",
    puntos: [
      "Evaluación y postulación a procesos en Mercado Público (L1, LE, LP, Convenio Marco y Trato Directo), gestionando bases administrativas, ofertas económicas y administración de garantías.",
      "Implementación integral de plataforma Zoho One: gestión de actualizaciones, resolución de incidencias y capacitación de usuarios para optimizar procesos.",
    ],
  },
  {
    id: "exp-3",
    organizacion: "Betazeta Networks S.A",
    periodo: "2010 - 2016",
    cargo: "Director de contenidos",
    ubicacion: "Santiago",
    puntos: [
      "Coordinación de pauta y creación de contenido escrito y audiovisual para medios de comunicación digitales enfocados al área de tecnología y hardware (FayerWayer, CHW y Wayerless).",
      "Revisión y soporte de equipos informáticos para benchmarks y contenidos digitales.",
      "Redacción de contenido por encargo para Diario La Tercera, sección tecnología.",
      "Encargado de benchmarks y reviews de equipos por encargo para NetNow S.A. (Acer Chile).",
    ],
  },
];

const EDUCACION: EducacionItem[] = [
  {
    id: "edu-1",
    institucion: "DUOC UC, Sede Viña del Mar",
    periodo: "2026 - 2028 (en curso)",
    carrera: "Analista Programador",
    puntos: [
      "Manejo de lenguajes de programación Java y Python.",
      "Dominio de plataformas Linux, Amazon AWS y Oracle SQL.",
      "Certificación Artificial Intelligence Professional Certificate (CAIPC).",
      "En proceso de obtención de certificación Red Hat Certified System Administrator (RHCSA).",
    ],
  },
  {
    id: "edu-2",
    institucion: "Pontificia Universidad Católica de Valparaíso",
    periodo: "2008 - 2011 (4to año, incompleto)",
    carrera: "Periodismo y Licenciatura en Comunicaciones",
  },
];

const OTRAS_HABILIDADES = [
  "Inglés oral y escrito nivel C1 Advanced (Fluidez profesional oral y escrita).",
  "Excelente comunicación efectiva y empatía para la atención de usuarios y el trabajo colaborativo, con sólida capacidad de resolución de problemas, manejo de objeciones y capacidad de autogestión en entornos de alta exigencia con ritmo dinámico.",
] as const;

export default function PerfilPage() {
  const cvPublicUrl = getCvPublicUrl();

  return (
    <div className="space-y-16">
      {/* 1. LANDING DE PERFIL (misma estructura, dimensiones y posicionamiento que el Home, sobre fondo blanco) */}
      <section
        aria-labelledby="perfil-nombre"
        className="flex flex-col justify-start pt-2 pb-8"
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
        <div className="mt-10 max-w-xl sm:mt-14">
          <div className="space-y-6">
            <p className="indent-8 font-roman text-sm sm:text-base">
              Analista Programador dedicado al diseño, construcción y
              mantenimiento de sistemas de software, aplicaciones web y
              estructuras de datos con énfasis en la claridad arquitectónica, la
              eficiencia operativa y la durabilidad técnica.
            </p>
            <p className="indent-8 font-roman text-sm sm:text-base">
              A lo largo de mi trayectoria he articulado el desarrollo práctico de
              código con el análisis riguroso de requerimientos, la documentación
              continua de procesos y la integración de herramientas modernas que
              simplifican flujos complejos sin sacrificar estabilidad ni control.
            </p>
            <p className="indent-8 font-roman text-sm sm:text-base">
              Mi enfoque prioriza soluciones sobrias, legibles y centradas en las
              personas que las utilizan y mantienen, buscando siempre el equilibrio
              entre precisión funcional, rendimiento y coherencia visual en cada
              etapa del ciclo de vida de un proyecto.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-start gap-4 sm:mt-14">
            <a
              href={cvPublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              download="CV_JuanPabloOyanedel.pdf"
              className="hyper-link font-heavy text-sm tracking-wide sm:text-base"
            >
              Descargar CV en PDF &gt;
            </a>
            <a
              href="https://github.com/juanpablo3705"
              target="_blank"
              rel="noopener noreferrer"
              className="hyper-link font-heavy text-sm tracking-wide sm:text-base"
            >
              Perfil de GitHub &gt;
            </a>
            <a
              href="mailto:juanpablo3705@gmail.com"
              className="hyper-link font-heavy text-sm tracking-wide sm:text-base"
            >
              Enviar correo &gt;
            </a>
          </div>
        </div>
      </section>

      {/* 2. CONTENIDO INFERIOR DESDE EXPERIENCIA LABORAL HACIA ABAJO
          (misma estructura tipográfica que Blog y Proyectos) */}
      <div className="space-y-16 pb-12">
        {/* Experiencia Laboral */}
        <section aria-labelledby="experiencia-titulo" className="space-y-6">
          <h2
            id="experiencia-titulo"
            className="border-b border-current pb-3 font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]"
          >
            Experiencia laboral
          </h2>

          <div className="space-y-8">
            {EXPERIENCIA_LABORAL.map((item) => (
              <article key={item.id} className="flex w-full flex-col gap-2">
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-heavy text-sm sm:text-base">
                      {item.organizacion}
                    </h3>
                    <span className="font-heavy text-sm sm:text-base">
                      {item.periodo}
                    </span>
                  </div>
                  <p className="font-roman text-sm italic sm:text-base">
                    {item.cargo}
                  </p>
                  <p className="font-roman text-sm italic sm:text-base">
                    {item.ubicacion}
                  </p>
                </div>

                <ul className="list-disc space-y-1 pl-6 font-roman text-sm sm:text-base">
                  {item.puntos.map((punto) => (
                    <li key={punto}>{punto}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Educación */}
        <section aria-labelledby="educacion-titulo" className="space-y-6">
          <h2
            id="educacion-titulo"
            className="border-b border-current pb-3 font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]"
          >
            Educación
          </h2>

          <div className="space-y-8">
            {EDUCACION.map((item) => (
              <article key={item.id} className="flex w-full flex-col gap-2">
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-heavy text-sm sm:text-base">
                      {item.institucion}
                    </h3>
                    <span className="font-heavy text-sm sm:text-base">
                      {item.periodo}
                    </span>
                  </div>
                  <p className="font-roman text-sm italic sm:text-base">
                    {item.carrera}
                  </p>
                </div>

                {item.puntos && item.puntos.length > 0 && (
                  <ul className="list-disc space-y-1 pl-6 font-roman text-sm sm:text-base">
                    {item.puntos.map((punto) => (
                      <li key={punto}>{punto}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Otras Habilidades */}
        <section aria-labelledby="habilidades-titulo" className="space-y-6">
          <h2
            id="habilidades-titulo"
            className="border-b border-current pb-3 font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]"
          >
            Otras habilidades
          </h2>

          <ul className="list-disc space-y-1 pl-6 font-roman text-sm sm:text-base">
            {OTRAS_HABILIDADES.map((habilidad) => (
              <li key={habilidad}>{habilidad}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
