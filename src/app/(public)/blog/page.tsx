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
    <section className="space-y-10 pt-6">
      <header className="border-b border-current pb-4">
        <h1 className="font-heavy text-2xl tracking-tight sm:text-3xl">Blog</h1>
      </header>

      {posts.length === 0 ? (
        <div className="py-12">
          <p className="font-roman text-sm">
            No hay entradas de blog publicadas por el momento.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex w-full flex-col gap-3"
            >
              <h2 className="font-heavy text-base leading-snug">
                <Link
                  href={`/blog/${post.slug}`}
                  scroll={false}
                  data-no-scroll="true"
                  data-modal-trigger="true"
                  className="hyper-link"
                >
                  {post.title}
                </Link>
              </h2>

              {post.summary && (
                <p className="font-editorial-serif text-xs leading-relaxed sm:text-sm">
                  {post.summary}
                </p>
              )}

              <div className="pt-1">
                <Link
                  href={`/blog/${post.slug}`}
                  scroll={false}
                  data-no-scroll="true"
                  data-modal-trigger="true"
                  className="hyper-link font-heavy text-xs tracking-wide sm:text-sm"
                >
                  Leer más &gt;
                </Link>
              </div>
            </article>
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
