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
    <section className="space-y-8">
      <header className="border-b border-neutral-300 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Proyectos
        </h1>
      </header>

      {posts.length === 0 ? (
        <div className="border border-neutral-300 bg-white p-12 text-center">
          <p className="text-sm text-neutral-600">
            No hay proyectos publicados por el momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((project) => (
            <Link
              key={project.id}
              href={`/proyectos/${project.slug}`}
              scroll={false}
              className="group flex aspect-square flex-col overflow-hidden border border-neutral-300 bg-white transition-colors hover:border-neutral-900"
            >
              {/* Mitad superior del cuadrado: Thumbnail */}
              <div className="relative h-1/2 w-full shrink-0 overflow-hidden border-b border-neutral-300 bg-neutral-100">
                {project.thumbnail_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-wider text-neutral-400">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Mitad inferior del cuadrado: Título y Resumen breve */}
              <div className="flex flex-1 flex-col justify-between overflow-hidden p-4">
                <div className="space-y-2 overflow-hidden">
                  <h2 className="line-clamp-2 text-base font-bold leading-snug text-neutral-900 group-hover:underline underline-offset-4">
                    {project.title}
                  </h2>
                  {project.summary && (
                    <p className="line-clamp-3 text-xs leading-relaxed text-neutral-600">
                      {project.summary}
                    </p>
                  )}
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
