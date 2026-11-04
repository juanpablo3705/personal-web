import { HomeCatalogSections } from "@/components/ui/HomeCatalogSections";
import { getPublishedPostsFull } from "@/components/ui/post-queries";

export default async function InicioPage() {
  const [proyectos, entradasBlog] = await Promise.all([
    getPublishedPostsFull("project", 20),
    getPublishedPostsFull("blog", 20),
  ]);

  return (
    /* =========================================================================
     * REGLA DE DISEÑO ARQUITECTÓNICO CRÍTICA - LANDING HOME (NO MODIFICAR A LA LIGERA)
     *
     * 1. PANTALLA COMPLETA GARANTIZADA:
     *    La sección superior usa `min-h-[calc(100vh-4.5rem)]` para garantizar que
     *    en cualquier resolución (desde 768p hasta 4K) el bloque negro llene al 100%
     *    la primera vista visible. Al cargar la página (arriba del todo), la sección
     *    "Proyectos" permanece 100% oculta debajo del pliegue de la pantalla.
     *
     * 2. COREOGRAFÍA EN 3 ACTOS AL HACER SCROLL:
     *    - Acto 1 (Carga): Portada limpia 100% negra (garantizada por 100vh).
     *    - Acto 2 (Scroll inicial): La separación exterior `space-y-20` (80px) sumada
     *      al `pt-8` (32px) de Proyectos deja un colchón exacto de 112px. Al empezar
     *      a bajar la rueda, "Proyectos" asoma primero sutilmente en blanco sobre negro.
     *    - Acto 3 (Inversión de color): Al superar el 55% de la pantalla (calculado en
     *      `PublicShell.tsx`), el fondo se invierte suavemente a blanco.
     *
     * ATENCIÓN A FUTUROS AGENTES DE IA O DESARROLLADORES:
     * NO remover `min-h-[calc(100vh-4.5rem)]` ni cambiar drásticamente `space-y-20`
     * sin considerar cómo altera la coreografía visual entre el negro y el blanco.
     * ========================================================================= */
    <div className="space-y-20">
      {/* 1. LANDING DE PANTALLA COMPLETA (referencia: home-home.png) */}
      <section
        aria-labelledby="landing-nombre"
        className="flex min-h-[calc(100vh-4.5rem)] flex-col justify-start pt-2 pb-16"
      >
        {/* Bloque superior izquierdo:
            Juan Pablo Oyanedel (AvenirLT-Roman) y Analista Programador (Avenir LT 85 Heavy) */}
        <div className="max-w-xs space-y-0.5">
          <h1
            id="landing-nombre"
            className="font-roman text-sm sm:text-base"
          >
            Juan Pablo Oyanedel
          </h1>
          <p className="font-heavy text-sm sm:text-base">
            Analista Programador
          </p>
        </div>

        {/* Columna izquierda debajo del encabezado */}
        <div className="mt-10 max-w-[650px] space-y-8 sm:mt-14">
          <p className="indent-8 font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]">
            Exploración y desarrollo de software, arquitectura de sistemas y
            construcción de soluciones digitales donde la precisión técnica
            converge con la claridad estructural.
          </p>
          <p className="indent-8 font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]">
            El análisis sistemático, combinado con métodos de programación
            contemporáneos, permite diseñar flujos inteligibles, interfaces
            singulares y estructuras de datos coherentes, pensadas desde la
            esencialidad y el rigor compositivo visual.
          </p>
        </div>
      </section>

      {/* 2 y 3. SECCIONES PROYECTOS Y BLOG UNIFORMIZADAS + POPUP SOBRE EL HOME */}
      <HomeCatalogSections
        proyectos={proyectos}
        entradasBlog={entradasBlog}
      />
    </div>
  );
}
