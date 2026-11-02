import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";
import {
  getPublishedPostsPaginated,
  parsePageParam,
} from "@/components/ui/post-queries";

type ProyectosPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function ProyectosPage({
  searchParams,
}: ProyectosPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parsePageParam(resolvedSearchParams.page);

  const {
    posts,
    totalCount,
    currentPage,
    totalPages,
    hasPrevPage,
    hasNextPage,
  } = await getPublishedPostsPaginated("project", page);

  return (
    <section className="space-y-10 pt-6">
      <header className="border-b border-current pb-4">
        <h1 className="font-heavy text-2xl uppercase tracking-tight sm:text-3xl">
          PROYECTOS
        </h1>
      </header>

      {posts.length === 0 ? (
        <div className="py-12">
          <p className="font-roman text-sm">
            No hay proyectos publicados por el momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((project) => (
            <Link
              key={project.id}
              href={`/proyectos/${project.slug}`}
              scroll={false}
              data-no-scroll="true"
              data-modal-trigger="true"
              className="group flex aspect-square flex-col overflow-hidden"
            >
              {/* Mitad superior del cuadrado invisible: Thumbnail */}
              <div className="relative h-1/2 w-full shrink-0 overflow-hidden">
                {project.thumbnail_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-wider">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Mitad inferior del cuadrado invisible: Título, Resumen breve y "Ver más >" */}
              <div className="flex flex-1 flex-col justify-between overflow-hidden pt-4">
                <div className="space-y-2 overflow-hidden">
                  <h2 className="line-clamp-2 font-heavy text-base leading-snug">
                    <span className="hyper-link">{project.title}</span>
                  </h2>
                  {project.summary && (
                    <p className="font-editorial-serif line-clamp-2 text-xs leading-relaxed sm:text-sm">
                      {project.summary}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <span className="hyper-link font-heavy text-xs tracking-wide sm:text-sm">
                    Ver más &gt;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        basePath="/proyectos"
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
      />
    </section>
  );
}
