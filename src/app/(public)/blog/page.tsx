import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";
import {
  getPublishedPostsPaginated,
  parsePageParam,
} from "@/components/ui/post-queries";

type BlogPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parsePageParam(resolvedSearchParams.page);

  const {
    posts,
    totalCount,
    currentPage,
    totalPages,
    hasPrevPage,
    hasNextPage,
  } = await getPublishedPostsPaginated("blog", page);

  return (
    <section className="space-y-8">
      <header className="border-b border-neutral-300 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Blog
        </h1>
      </header>

      {posts.length === 0 ? (
        <div className="border border-neutral-300 bg-white p-12 text-center">
          <p className="text-sm text-neutral-600">
            No hay entradas de blog publicadas por el momento.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              scroll={false}
              className="group flex w-full flex-col items-stretch overflow-hidden border border-neutral-300 bg-white transition-colors hover:border-neutral-900 sm:flex-row"
            >
              {/* Izquierda: Thumbnail */}
              <div className="relative h-48 w-full shrink-0 overflow-hidden border-b border-neutral-300 bg-neutral-100 sm:h-auto sm:w-56 sm:border-b-0 sm:border-r md:w-64">
                {post.thumbnail_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={post.thumbnail_url}
                    alt={post.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full min-h-[140px] w-full items-center justify-center text-xs uppercase tracking-wider text-neutral-400">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Derecha: Título + Resumen breve */}
              <div className="flex flex-1 flex-col justify-center gap-2 p-5 sm:p-6">
                <h2 className="text-lg font-bold leading-snug text-neutral-900 group-hover:underline underline-offset-4">
                  {post.title}
                </h2>
                {post.summary && (
                  <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600">
                    {post.summary}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        basePath="/blog"
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
      />
    </section>
  );
}
