"use client";

import { useEffect, useState } from "react";
import { usePublicShell } from "@/components/layout/PublicShell";
import type { Post } from "@/lib/types/database";
import { formatBlogDate } from "@/lib/utils";
import { PostModal } from "./PostModal";
import { findPostAndNeighbors } from "./post-neighbors";

const MODAL_OPEN_DELAY_MS = 300;
const BLOG_SUMMARY_MAX_CHARS = 500;

function renderBlogSummary(summary: string, onOpen: () => void) {
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
      <button
        type="button"
        onClick={onOpen}
        className="hyper-link cursor-pointer font-heavy"
      >
        Leer más &gt;
      </button>
    </>
  );
}

export function ProyectosCatalogSection({ posts }: { posts: Post[] }) {
  const { setModalOpen } = usePublicShell();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      setModalOpen(false);
    };
  }, [setModalOpen]);

  useEffect(() => {
    if (!pendingSlug) {
      return;
    }
    const timerId = window.setTimeout(() => {
      setActiveSlug(pendingSlug);
    }, MODAL_OPEN_DELAY_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [pendingSlug]);

  const openModal = (slug: string) => {
    setModalOpen(true);
    setPendingSlug(slug);
  };

  const closeModal = () => {
    setModalOpen(false);
    setPendingSlug(null);
    setActiveSlug(null);
  };

  const { post: modalPost, prevPost, nextPost } = activeSlug
    ? findPostAndNeighbors(posts, activeSlug)
    : { post: null, prevPost: null, nextPost: null };

  return (
    <>
      {posts.length === 0 ? (
        <div className="py-12">
          <p className="font-roman text-sm sm:text-base">
            No hay proyectos publicados por el momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((project, index) => (
            <article
              key={project.id}
              className="flex aspect-square flex-col overflow-hidden"
            >
              {/* Mitad superior del cuadrado invisible: Thumbnail (click abre popup) */}
              <button
                type="button"
                onClick={() => openModal(project.slug)}
                aria-label={`Ver proyecto ${project.title}`}
                className="relative block h-1/2 w-full shrink-0 cursor-pointer overflow-hidden text-left focus:outline-none"
              >
                {project.thumbnail_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="h-full w-full object-cover"
                    fetchPriority={index === 0 ? "high" : undefined}
                    loading={index < 4 ? undefined : "lazy"}
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm uppercase tracking-wider sm:text-base">
                    Sin imagen
                  </div>
                )}
              </button>

              {/* Mitad inferior del cuadrado invisible: Título (único link con ">") y Resumen breve */}
              <div className="flex flex-1 flex-col overflow-hidden pt-4">
                <div className="space-y-2 overflow-hidden">
                  <h2 className="line-clamp-2 font-heavy text-sm sm:text-base">
                    <button
                      type="button"
                      onClick={() => openModal(project.slug)}
                      className="hyper-link cursor-pointer text-left font-heavy"
                    >
                      {project.title} &gt;
                    </button>
                  </h2>
                  {project.summary && (
                    <p className="font-roman line-clamp-2 text-sm sm:text-base">
                      {project.summary}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {activeSlug && modalPost && (
        <PostModal
          post={modalPost}
          prevPost={prevPost}
          nextPost={nextPost}
          basePath="/proyectos"
          onCloseModal={closeModal}
          onSelectAdjacent={(slug) => setActiveSlug(slug)}
        />
      )}
    </>
  );
}

export function BlogCatalogSection({ posts }: { posts: Post[] }) {
  const { setModalOpen } = usePublicShell();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      setModalOpen(false);
    };
  }, [setModalOpen]);

  useEffect(() => {
    if (!pendingSlug) {
      return;
    }
    const timerId = window.setTimeout(() => {
      setActiveSlug(pendingSlug);
    }, MODAL_OPEN_DELAY_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [pendingSlug]);

  const openModal = (slug: string) => {
    setModalOpen(true);
    setPendingSlug(slug);
  };

  const closeModal = () => {
    setModalOpen(false);
    setPendingSlug(null);
    setActiveSlug(null);
  };

  const { post: modalPost, prevPost, nextPost } = activeSlug
    ? findPostAndNeighbors(posts, activeSlug)
    : { post: null, prevPost: null, nextPost: null };

  return (
    <>
      {posts.length === 0 ? (
        <div className="py-12">
          <p className="font-roman text-sm sm:text-base">
            No hay entradas de blog publicadas por el momento.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {posts.map((post) => (
            <article key={post.id} className="flex w-full flex-col gap-2">
              <h2 className="font-heavy text-sm sm:text-base">
                <button
                  type="button"
                  onClick={() => openModal(post.slug)}
                  className="hyper-link cursor-pointer text-left font-heavy"
                >
                  {post.title} &gt;
                </button>
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
                  {renderBlogSummary(post.summary, () => openModal(post.slug))}
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      {activeSlug && modalPost && (
        <PostModal
          post={modalPost}
          prevPost={prevPost}
          nextPost={nextPost}
          basePath="/blog"
          onCloseModal={closeModal}
          onSelectAdjacent={(slug) => setActiveSlug(slug)}
        />
      )}
    </>
  );
}
