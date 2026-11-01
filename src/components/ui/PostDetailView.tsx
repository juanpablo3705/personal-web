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
    <article className="mx-auto max-w-4xl space-y-8 pt-6">
      {/* Encabezado de navegación para volver al catálogo */}
      <header className="flex items-center justify-between border-b border-current pb-4">
        <Link
          href={basePath}
          className="hyper-link font-heavy text-xs tracking-wide sm:text-sm"
        >
          {backLabel}
        </Link>
      </header>

      {/* Cuerpo principal con Título y HTML del contenido */}
      <div className="space-y-6 py-4">
        <h1 className="font-heavy text-2xl tracking-tight sm:text-3xl">
          {post.title}
        </h1>

        {post.content ? (
          <div
            className="font-editorial-serif editorial-content text-base leading-relaxed [&_p]:mb-5 [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-heavy [&_h2]:text-xl [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-heavy [&_h3]:text-lg [&_blockquote]:my-5 [&_blockquote]:border-l [&_blockquote]:border-current [&_blockquote]:pl-4 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : post.summary ? (
          <p className="font-editorial-serif text-base leading-relaxed">
            {post.summary}
          </p>
        ) : null}
      </div>

      {/* Barra inferior con hipervínculos Anterior / Siguiente */}
      <footer className="flex items-center justify-between gap-4 border-t border-current pt-4">
        <div>
          {prevPost && (
            <Link
              href={`${basePath}/${prevPost.slug}`}
              title={prevPost.title}
              className="hyper-link font-heavy text-xs tracking-wide sm:text-sm"
            >
              ← Anterior
            </Link>
          )}
        </div>

        <div>
          {nextPost && (
            <Link
              href={`${basePath}/${nextPost.slug}`}
              title={nextPost.title}
              className="hyper-link font-heavy text-xs tracking-wide sm:text-sm"
            >
              Siguiente →
            </Link>
          )}
        </div>
      </footer>
    </article>
  );
}
