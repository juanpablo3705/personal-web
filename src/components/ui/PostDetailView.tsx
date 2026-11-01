import Link from "next/link";
import type { Post } from "@/lib/types/database";
import type { AdjacentPostLink } from "./post-queries";

type PostDetailViewProps = {
  post: Post;
  prevPost: AdjacentPostLink | null;
  nextPost: AdjacentPostLink | null;
  basePath: "/proyectos" | "/blog";
};

export function PostDetailView({
  post,
  prevPost,
  nextPost,
  basePath,
}: PostDetailViewProps) {
  const backLabel =
    basePath === "/proyectos" ? "← Volver a Proyectos" : "← Volver al Blog";

  return (
    <article className="border border-neutral-300 bg-white text-neutral-900">
      {/* Encabezado de navegación para volver al catálogo */}
      <header className="flex items-center justify-between border-b border-neutral-300 bg-neutral-50 px-6 py-3 sm:px-8">
        <Link
          href={basePath}
          className="text-xs font-medium text-neutral-700 transition-colors hover:text-neutral-950 hover:underline underline-offset-4"
        >
          {backLabel}
        </Link>
      </header>

      {/* Cuerpo principal con Título y HTML del contenido */}
      <div className="space-y-6 px-6 py-8 sm:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          {post.title}
        </h1>

        {post.content ? (
          <div
            className="text-sm leading-relaxed text-neutral-800 sm:text-base [&_p]:mb-4 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:border [&_img]:border-neutral-300 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-400 [&_blockquote]:pl-4 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : post.summary ? (
          <p className="text-sm leading-relaxed text-neutral-700 sm:text-base">
            {post.summary}
          </p>
        ) : (
          <p className="text-sm text-neutral-500">Sin contenido adicional.</p>
        )}
      </div>

      {/* Barra inferior con navegación Anterior / Siguiente */}
      <footer className="flex items-center justify-between gap-4 border-t border-neutral-300 bg-neutral-50 px-6 py-4 sm:px-8">
        {prevPost ? (
          <a
            href={`${basePath}/${prevPost.slug}`}
            title={prevPost.title}
            className="inline-flex items-center border border-neutral-300 bg-white px-4 py-1.5 text-xs font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
          >
            ← Anterior
          </a>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center border border-neutral-200 bg-neutral-100 px-4 py-1.5 text-xs font-medium text-neutral-400"
          >
            ← Anterior
          </span>
        )}

        {nextPost ? (
          <a
            href={`${basePath}/${nextPost.slug}`}
            title={nextPost.title}
            className="inline-flex items-center border border-neutral-300 bg-white px-4 py-1.5 text-xs font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
          >
            Siguiente →
          </a>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center border border-neutral-200 bg-neutral-100 px-4 py-1.5 text-xs font-medium text-neutral-400"
          >
            Siguiente →
          </span>
        )}
      </footer>
    </article>
  );
}
