import Link from "next/link";
import { formatBlogDate } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";
import {
  getPublishedPostsPaginated,
  parsePageParam,
} from "@/components/ui/post-queries";

type BlogPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

const BLOG_SUMMARY_MAX_CHARS = 500;

function renderBlogSummary(summary: string, postSlug: string) {
  if (summary.length <= BLOG_SUMMARY_MAX_CHARS) {
    return summary;
  }

  let text = summary.slice(0, BLOG_SUMMARY_MAX_CHARS);
  const lastSpace = text.lastIndexOf(" ");
  if (lastSpace > BLOG_SUMMARY_MAX_CHARS - 50) {
    text = text.slice(0, lastSpace);
  }
  text = text.replace(/[,;.:\s]+$/, "");

  return (
    <>
      {text} ...{" "}
      <Link
        href={`/blog/${postSlug}`}
        scroll={false}
        data-no-scroll="true"
        data-modal-trigger="true"
        className="hyper-link font-heavy"
      >
        Leer más &gt;
      </Link>
    </>
  );
}

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
          <p className="font-roman text-sm sm:text-base">
            No hay entradas de blog publicadas por el momento.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex w-full flex-col gap-2"
            >
              <h2 className="font-heavy text-sm sm:text-base">
                <Link
                  href={`/blog/${post.slug}`}
                  scroll={false}
                  data-no-scroll="true"
                  data-modal-trigger="true"
                  className="hyper-link"
                >
                  {post.title} &gt;
                </Link>
              </h2>

              {post.created_at && (
                <time
                  dateTime={post.created_at}
                  className="block font-roman text-sm italic sm:text-base"
                >
                  {formatBlogDate(post.created_at)}
                </time>
              )}

              {post.summary && (
                <p className="font-roman text-sm sm:text-base">
                  {renderBlogSummary(post.summary, post.slug)}
                </p>
              )}
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
