"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { usePublicShell } from "@/components/layout/PublicShell";
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
  const { setModalOpen } = usePublicShell();
  const contentScrollRef = useRef<HTMLDivElement | null>(null);
  const [fadingFromSlug, setFadingFromSlug] = useState<string | null>(null);

  const isVisible = pathname !== basePath;
  const isFading = fadingFromSlug === post.slug;

  const handleClose = useCallback(() => {
    setFadingFromSlug(post.slug);
    setTimeout(() => {
      setModalOpen(false);
      router.back();
    }, 500);
  }, [post.slug, router, setModalOpen]);

  const handleNavigateAdjacent = (
    event: React.MouseEvent<HTMLAnchorElement>,
    targetSlug: string
  ) => {
    event.preventDefault();
    setFadingFromSlug(post.slug);
    setTimeout(() => {
      router.replace(`${basePath}/${targetSlug}`, { scroll: false });
    }, 500);
  };

  useEffect(() => {
    setModalOpen(isVisible);
    return () => {
      setModalOpen(false);
    };
  }, [isVisible, setModalOpen]);

  useEffect(() => {
    if (!isVisible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, handleClose]);

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0 });
  }, [post.slug]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-post-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--negro)]/60 p-4 sm:p-6 md:p-10"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={
          isFading
            ? { opacity: 0, filter: "blur(8px)" }
            : { opacity: 1, filter: "blur(0px)" }
        }
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="theme-normal-box flex max-h-[90vh] w-full max-w-4xl flex-col bg-[var(--blanco)] text-[var(--negro)]"
      >
        {/* Espacio en blanco exclusivo superior con hipervínculo "X" (sin etiqueta "blog"/"proyecto" ni bordes) */}
        <header className="flex shrink-0 items-center justify-end bg-[var(--blanco)] px-6 py-4 sm:px-10">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar ventana y volver al catálogo"
            className="hyper-link cursor-pointer font-heavy text-sm sm:text-base"
          >
            X
          </button>
        </header>

        {/* Área central de lectura */}
        <div
          ref={contentScrollRef}
          className="flex-1 overflow-y-auto px-6 py-4 sm:px-10 sm:py-6"
        >
          <article className="space-y-6">
            <h1
              id="modal-post-title"
              className="font-heavy text-2xl tracking-tight text-[var(--negro)] sm:text-3xl"
            >
              {post.title}
            </h1>

            {post.content ? (
              <div
                className="font-editorial-serif editorial-content text-base leading-relaxed text-[var(--negro)] [&_p]:mb-5 [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-heavy [&_h2]:text-xl [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-heavy [&_h3]:text-lg [&_blockquote]:my-5 [&_blockquote]:border-l [&_blockquote]:border-[var(--negro)] [&_blockquote]:pl-4 [&_blockquote]:italic"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : post.summary ? (
              <p className="font-editorial-serif text-base leading-relaxed text-[var(--negro)]">
                {post.summary}
              </p>
            ) : null}
          </article>
        </div>

        {/* Espacio en blanco exclusivo inferior con hipervínculos "← Anterior" y "Siguiente →" (sin cajas ni bordes) */}
        <footer className="flex shrink-0 items-center justify-between gap-4 bg-[var(--blanco)] px-6 py-4 sm:px-10">
          <div>
            {prevPost && (
              <Link
                href={`${basePath}/${prevPost.slug}`}
                replace
                scroll={false}
                data-modal-internal="true"
                onClick={(e) => handleNavigateAdjacent(e, prevPost.slug)}
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
                replace
                scroll={false}
                data-modal-internal="true"
                onClick={(e) => handleNavigateAdjacent(e, nextPost.slug)}
                title={nextPost.title}
                className="hyper-link font-heavy text-xs tracking-wide sm:text-sm"
              >
                Siguiente →
              </Link>
            )}
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
