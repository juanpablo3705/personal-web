import { HomeCatalogSections } from "@/components/ui/HomeCatalogSections";
import { getPublishedPostsFull } from "@/components/ui/post-queries";

export default async function InicioPage() {
  const [proyectos, entradasBlog] = await Promise.all([
    getPublishedPostsFull("project", 20),
    getPublishedPostsFull("blog", 20),
  ]);

  return (
    <div className="space-y-32">
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
        <div className="mt-10 max-w-xl space-y-8 sm:mt-14">
          <p className="indent-8 font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]">
            Desarrollo de software, arquitectura de sistemas y construcción de
            soluciones digitales donde la precisión técnica converge con la
            claridad estructural para dar forma a herramientas funcionales y
            perdurables.
          </p>
          <p className="indent-8 font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]">
            El pensamiento analítico combinado con métodos de programación
            contemporáneos permite diseñar flujos, interfaces y estructuras de
            datos pensadas desde la simplicidad y el rigor.
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
