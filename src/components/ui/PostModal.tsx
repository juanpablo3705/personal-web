"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Post } from "@/lib/types/database";
import type { AdjacentPostLink } from "./post-queries";

type PostModalProps = {
  post: Post;
  prevPost: AdjacentPostLink | null;
  nextPost: AdjacentPostLink | null;
  basePath: "/proyectos" | "/blog";
};

export function PostModal({
  post,
  prevPost,
  nextPost,
  basePath,
}: PostModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const contentScrollRef = useRef<HTMLDivElement | null>(null);

  const handleClose = () => {
    router.back();
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0 });
  }, [post.slug]);

  if (pathname === basePath) {
    return null;
  }

  const sectionLabel = basePath === "/proyectos" ? "Proyecto" : "Blog";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-post-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col border border-neutral-300 bg-white text-neutral-900">
        {/* Parte superior: barra sobria con botón "X" claro para cerrar */}
        <header className="flex shrink-0 items-center justify-between border-b border-neutral-300 bg-white px-6 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            {sectionLabel}
          </span>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar ventana y volver al catálogo"
            className="inline-flex h-8 w-8 items-center justify-center border border-neutral-300 bg-white text-sm font-bold text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
          >
            X
          </button>
        </header>

        {/* Parte central: Título y HTML del contenido (texto e imágenes intercaladas) */}
        <div
          ref={contentScrollRef}
          className="flex-1 overflow-y-auto px-6 py-6 sm:px-8"
        >
          <article className="space-y-6">
            <h1
              id="modal-post-title"
              className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
            >
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
              <p className="text-sm text-neutral-500">
                Sin contenido adicional.
              </p>
            )}
          </article>
        </div>

        {/* Parte inferior: Barra sobria con botones "← Anterior" y "Siguiente →" */}
        <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-neutral-300 bg-neutral-50 px-6 py-3">
          {prevPost ? (
            <Link
              href={`${basePath}/${prevPost.slug}`}
              replace
              scroll={false}
              title={prevPost.title}
              className="inline-flex items-center border border-neutral-300 bg-white px-4 py-1.5 text-xs font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
            >
              ← Anterior
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex cursor-not-allowed items-center border border-neutral-200 bg-neutral-100 px-4 py-1.5 text-xs font-medium text-neutral-400"
            >
              ← Anterior
            </span>
          )}

          {nextPost ? (
            <Link
              href={`${basePath}/${nextPost.slug}`}
              replace
              scroll={false}
              title={nextPost.title}
              className="inline-flex items-center border border-neutral-300 bg-white px-4 py-1.5 text-xs font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
            >
              Siguiente →
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex cursor-not-allowed items-center border border-neutral-200 bg-neutral-100 px-4 py-1.5 text-xs font-medium text-neutral-400"
            >
              Siguiente →
            </span>
          )}
        </footer>
      </div>
    </div>
  );
}
