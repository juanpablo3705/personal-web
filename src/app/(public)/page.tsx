import Link from "next/link";
import { getPublishedPostsPaginated } from "@/components/ui/post-queries";

export default async function InicioPage() {
  const [{ posts: proyectos }, { posts: entradasBlog }] = await Promise.all([
    getPublishedPostsPaginated("project", 1, 4),
    getPublishedPostsPaginated("blog", 1, 3),
  ]);

  return (
    <div className="space-y-32">
      {/* 1. LANDING DE PANTALLA COMPLETA (referencia: home-home.png) */}
      <section
        aria-labelledby="landing-nombre"
        className="flex min-h-[calc(100vh-4.5rem)] flex-col justify-between pt-4 pb-16 sm:pt-8 sm:pb-24"
      >
        {/* Bloque superior izquierdo: Nombre y Rol */}
        <div className="max-w-md space-y-0.5">
          <h1
            id="landing-nombre"
            className="font-heavy text-base tracking-wide sm:text-lg"
          >
            Juan Pablo Oyanedel
          </h1>
          <p className="font-heavy text-base tracking-wide sm:text-lg">
            Analista Programador
          </p>
        </div>

        {/* Columna izquierda: Texto biográfico de referencia */}
        <div className="my-auto max-w-xl space-y-8 pt-12 sm:pt-16">
          <p className="indent-8 font-roman text-2xl leading-[1.32] tracking-tight sm:text-3xl lg:text-[2.1rem]">
            Desarrollo de software, arquitectura de sistemas y construcción de
            soluciones digitales donde la precisión técnica converge con la
            claridad estructural para dar forma a herramientas funcionales y
            perdurables.
          </p>
          <p className="indent-8 font-roman text-2xl leading-[1.32] tracking-tight sm:text-3xl lg:text-[2.1rem]">
            El pensamiento analítico combinado con métodos de programación
            contemporáneos permite diseñar flujos, interfaces y estructuras de
            datos pensadas desde la simplicidad y el rigor.
          </p>
        </div>
      </section>

      {/* 2. SECCIÓN DE RESUMEN DE PROYECTOS (referencia: home-proyectos.png) */}
      <section aria-labelledby="home-proyectos-titulo" className="space-y-12 pt-8">
        <header className="text-center">
          <h2
            id="home-proyectos-titulo"
            className="font-heavy text-lg uppercase tracking-widest sm:text-xl"
          >
            PROYECTOS
          </h2>
        </header>

        {proyectos.length === 0 ? (
          <p className="border-t border-current pt-8 text-center text-sm">
            No hay proyectos publicados por el momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {proyectos.map((project) => (
              <article
                key={project.id}
                className="flex flex-col justify-between"
              >
                {/* Título superior con línea separadora negra */}
                <div className="border-b border-current pb-3 text-center">
                  <h3 className="font-heavy text-sm uppercase tracking-wider sm:text-base">
                    <Link
                      href={`/proyectos/${project.slug}`}
                      className="hyper-link"
                    >
                      {project.title}
                    </Link>
                  </h3>
                </div>

                {/* Cuerpo visual / resumen del proyecto */}
                <div className="my-6 flex flex-1 flex-col justify-between space-y-4">
                  {project.thumbnail_url && (
                    <Link
                      href={`/proyectos/${project.slug}`}
                      className="block aspect-[4/3] w-full overflow-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </Link>
                  )}

                  {project.summary && (
                    <p className="font-editorial-serif line-clamp-4 text-sm leading-relaxed">
                      {project.summary}
                    </p>
                  )}
                </div>

                {/* Enlace inferior enmarcado entre líneas separadoras negras */}
                <div className="border-y border-current py-3 text-center">
                  <Link
                    href={`/proyectos/${project.slug}`}
                    className="hyper-link font-heavy text-xs tracking-wide sm:text-sm"
                  >
                    Leer más &gt;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="pt-2 text-center">
          <Link
            href="/proyectos"
            className="hyper-link font-heavy text-xs tracking-wider sm:text-sm"
          >
            Ver todos los proyectos &gt;
          </Link>
        </div>
      </section>

      {/* 3. SECCIÓN DE RESUMEN DE BLOG (referencia: home-blog.png) */}
      <section aria-labelledby="home-blog-titulo" className="space-y-8 pb-12">
        {/* Título de la sección + línea separadora negra de ancho completo */}
        <header className="border-b border-current pb-4 text-center">
          <h2
            id="home-blog-titulo"
            className="font-heavy text-lg uppercase tracking-widest sm:text-xl"
          >
            BLOG
          </h2>
        </header>

        {entradasBlog.length === 0 ? (
          <p className="pt-4 text-center text-sm">
            No hay entradas de blog publicadas por el momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-10 pt-2 md:grid-cols-3 lg:gap-14">
            {entradasBlog.map((post) => (
              <article
                key={post.id}
                className="flex flex-col justify-between space-y-6"
              >
                <div className="space-y-5">
                  {/* Título del post */}
                  <h3 className="text-center font-heavy text-sm uppercase tracking-wider sm:text-base">
                    <Link href={`/blog/${post.slug}`} className="hyper-link">
                      {post.title}
                    </Link>
                  </h3>

                  {/* Texto del post (Noto Serif Regular, sin thumbnail) */}
                  {post.summary && (
                    <p className="font-editorial-serif text-sm leading-relaxed sm:text-base">
                      {post.summary}
                    </p>
                  )}
                </div>

                {/* Enlace "Leer más >" */}
                <div className="pt-2">
                  <div className="inline-block border-b border-current pb-1">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hyper-link font-roman text-xs tracking-wide sm:text-sm"
                    >
                      Leer más &gt;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
