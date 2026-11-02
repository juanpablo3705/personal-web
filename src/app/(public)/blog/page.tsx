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
        <h1 className="font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]">
          Blog
        </h1>
      </header>

      {posts.length === 0 ? (
        <div className="py-12">
          <p className="font-editorial-serif text-sm sm:text-base">
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
              <h2 className="font-heavy text-sm sm:text-base">
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
                <p className="font-editorial-serif text-sm sm:text-base">
                  {post.summary}
                </p>
              )}

              <div className="pt-1">
                <Link
                  href={`/blog/${post.slug}`}
                  scroll={false}
                  data-no-scroll="true"
                  data-modal-trigger="true"
                  className="hyper-link font-heavy text-sm tracking-wide sm:text-base"
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
