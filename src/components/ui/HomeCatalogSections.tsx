"use client";

import { useState } from "react";
import Link from "next/link";
import { usePublicShell } from "@/components/layout/PublicShell";
import type { Post } from "@/lib/types/database";
import { PostModal } from "./PostModal";
import type { AdjacentPostLink } from "./post-queries";

type HomeCatalogSectionsProps = {
  proyectos: Post[];
  entradasBlog: Post[];
};

type ActiveHomeModal = {
  type: "project" | "blog";
  slug: string;
} | null;

function findPostAndNeighbors(
  list: Post[],
  slug: string
): {
  post: Post | null;
  prevPost: AdjacentPostLink | null;
  nextPost: AdjacentPostLink | null;
} {
  const index = list.findIndex((item) => item.slug === slug);
  if (index === -1) {
    return { post: null, prevPost: null, nextPost: null };
  }

  const post = list[index] ?? null;
  const prevItem = index > 0 ? list[index - 1] : null;
  const nextItem = index < list.length - 1 ? list[index + 1] : null;

  return {
    post,
    prevPost: prevItem ? { slug: prevItem.slug, title: prevItem.title } : null,
    nextPost: nextItem ? { slug: nextItem.slug, title: nextItem.title } : null,
  };
}

const HOME_BLOG_SUMMARY_MAX_CHARS = 255;

function renderHomeBlogSummary(summary: string, onOpen: () => void) {
  if (summary.length <= HOME_BLOG_SUMMARY_MAX_CHARS) {
    return summary;
  }

  let text = summary.slice(0, HOME_BLOG_SUMMARY_MAX_CHARS);
  const lastSpace = text.lastIndexOf(" ");
  if (lastSpace > HOME_BLOG_SUMMARY_MAX_CHARS - 40) {
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

export function HomeCatalogSections({
  proyectos,
  entradasBlog,
}: HomeCatalogSectionsProps) {
  const { setModalOpen } = usePublicShell();
  const [activeModal, setActiveModal] = useState<ActiveHomeModal>(null);

  const proyectosVisibles = proyectos.slice(0, 4);
  const blogVisibles = entradasBlog.slice(0, 4);

  const openModal = (type: "project" | "blog", slug: string) => {
    setModalOpen(true);
    setActiveModal({ type, slug });
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveModal(null);
  };

  const activeList =
    activeModal?.type === "project" ? proyectos : entradasBlog;
  const { post: modalPost, prevPost, nextPost } = activeModal
    ? findPostAndNeighbors(activeList, activeModal.slug)
    : { post: null, prevPost: null, nextPost: null };

  return (
    <>
      <div className="space-y-24">
        {/* 2. SECCIÓN DE RESUMEN DE PROYECTOS (máximo 4 entradas, separador solo en el subtítulo Proyectos) */}
        <section aria-labelledby="home-proyectos-titulo" className="space-y-8 pt-8">
          <header className="border-b border-current pb-4 text-center">
            <h2
              id="home-proyectos-titulo"
              className="font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]"
            >
              Proyectos
            </h2>
          </header>

          {proyectosVisibles.length === 0 ? (
            <p className="pt-4 text-center font-roman text-sm sm:text-base">
              No hay proyectos publicados por el momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 pt-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {proyectosVisibles.map((project) => (
                <article
                  key={project.id}
                  className="flex flex-col text-left"
                >
                  {/* Thumbnail: proporción 2:1 idéntica a la mitad superior de un cuadrado */}
                  <div className="relative aspect-[2/1] w-full shrink-0 overflow-hidden">
                    {project.thumbnail_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm uppercase tracking-wider sm:text-base">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  {/* Título (único link con ">") y Resumen breve */}
                  <div className="flex flex-col pt-4">
                    <div className="space-y-2">
                      <h3 className="line-clamp-2 font-heavy text-sm sm:text-base">
                        <button
                          type="button"
                          onClick={() => openModal("project", project.slug)}
                          className="hyper-link cursor-pointer text-left font-heavy"
                        >
                          {project.title} &gt;
                        </button>
                      </h3>
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

          <div className="pt-4 text-center">
            <Link
              href="/proyectos"
              className="hyper-link font-heavy text-sm tracking-wide sm:text-base"
            >
              Ver todos los proyectos &gt;
            </Link>
          </div>
        </section>

        {/* 3. SECCIÓN DE RESUMEN DE BLOG (máximo 4 entradas, separador solo en el subtítulo Blog) */}
        <section aria-labelledby="home-blog-titulo" className="space-y-8 pb-12">
          <header className="border-b border-current pb-4 text-center">
            <h2
              id="home-blog-titulo"
              className="font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]"
            >
              Blog
            </h2>
          </header>

          {blogVisibles.length === 0 ? (
            <p className="pt-4 text-center font-roman text-sm sm:text-base">
              No hay entradas de blog publicadas por el momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 pt-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {blogVisibles.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col space-y-2"
                >
                  {/* Título de la entrada (único link con ">") */}
                  <div>
                    <h3 className="font-heavy text-sm sm:text-base">
                      <button
                        type="button"
                        onClick={() => openModal("blog", post.slug)}
                        className="hyper-link cursor-pointer text-left font-heavy"
                      >
                        {post.title} &gt;
                      </button>
                    </h3>
                  </div>

                  {/* Texto resumen */}
                  {post.summary && (
                    <p className="font-roman text-sm sm:text-base">
                      {renderHomeBlogSummary(post.summary, () =>
                        openModal("blog", post.slug)
                      )}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}

          <div className="pt-4 text-center">
            <Link
              href="/blog"
              className="hyper-link font-heavy text-sm tracking-wide sm:text-base"
            >
              Ver todo el blog &gt;
            </Link>
          </div>
        </section>
      </div>

      {/* Popup superpuesto sobre el propio Home (con el Home invertido detrás) */}
      {activeModal && modalPost && (
        <PostModal
          post={modalPost}
          prevPost={prevPost}
          nextPost={nextPost}
          basePath={activeModal.type === "project" ? "/proyectos" : "/blog"}
          onCloseModal={closeModal}
          onSelectAdjacent={(slug) =>
            setActiveModal({ type: activeModal.type, slug })
          }
        />
      )}
    </>
  );
}
