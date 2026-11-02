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
      {/* 2. SECCIÓN DE RESUMEN DE PROYECTOS (máximo 4 entradas, separador solo en el subtítulo PROYECTOS) */}
      <section aria-labelledby="home-proyectos-titulo" className="space-y-8 pt-8">
        <header className="border-b border-current pb-4 text-center">
          <h2
            id="home-proyectos-titulo"
            className="font-heavy text-lg uppercase tracking-tight sm:text-xl"
          >
            PROYECTOS
          </h2>
        </header>

        {proyectosVisibles.length === 0 ? (
          <p className="pt-4 text-center text-sm">
            No hay proyectos publicados por el momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 pt-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {proyectosVisibles.map((project) => (
              <div
                key={project.id}
                role="button"
                tabIndex={0}
                onClick={() => openModal("project", project.slug)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openModal("project", project.slug);
                  }
                }}
                className="group flex aspect-square cursor-pointer flex-col overflow-hidden text-left"
              >
                {/* Mitad superior del cuadrado invisible: Thumbnail */}
                <div className="relative h-1/2 w-full shrink-0 overflow-hidden">
                  {project.thumbnail_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={project.thumbnail_url}
                      alt={project.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-wider">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Mitad inferior del cuadrado invisible: Título, Resumen breve y "Ver más >" */}
                <div className="flex flex-1 flex-col justify-between overflow-hidden pt-4">
                  <div className="space-y-2 overflow-hidden">
                    <h3 className="line-clamp-2 font-heavy text-base leading-snug">
                      <span className="hyper-link">{project.title}</span>
                    </h3>
                    {project.summary && (
                      <p className="font-editorial-serif line-clamp-2 text-xs leading-relaxed sm:text-sm">
                        {project.summary}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <span className="hyper-link font-heavy text-xs tracking-wide sm:text-sm">
                      Ver más &gt;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 text-center">
          <Link
            href="/proyectos"
            className="hyper-link font-heavy text-xs tracking-wide sm:text-sm"
          >
            Ver todos los proyectos &gt;
          </Link>
        </div>
      </section>

      {/* 3. SECCIÓN DE RESUMEN DE BLOG (máximo 4 entradas, separador solo en el subtítulo BLOG) */}
      <section aria-labelledby="home-blog-titulo" className="space-y-8 pb-12">
        <header className="border-b border-current pb-4 text-center">
          <h2
            id="home-blog-titulo"
            className="font-heavy text-lg uppercase tracking-tight sm:text-xl"
          >
            BLOG
          </h2>
        </header>

        {blogVisibles.length === 0 ? (
          <p className="pt-4 text-center text-sm">
            No hay entradas de blog publicadas por el momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 pt-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {blogVisibles.map((post) => (
              <article
                key={post.id}
                className="flex flex-col justify-between space-y-5"
              >
                <div className="space-y-2">
                  {/* Título de la entrada (sin barra separadora individual ni mayúsculas forzadas) */}
                  <div>
                    <h3 className="font-heavy text-base leading-snug">
                      <button
                        type="button"
                        onClick={() => openModal("blog", post.slug)}
                        className="hyper-link cursor-pointer text-left font-heavy"
                      >
                        {post.title}
                      </button>
                    </h3>
                  </div>

                  {/* Texto resumen */}
                  {post.summary && (
                    <p className="font-editorial-serif text-xs leading-relaxed sm:text-sm">
                      {post.summary}
                    </p>
                  )}
                </div>

                {/* Link "Leer más >" */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openModal("blog", post.slug)}
                    className="hyper-link cursor-pointer font-heavy text-xs tracking-wide sm:text-sm"
                  >
                    Leer más &gt;
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="pt-4 text-center">
          <Link
            href="/blog"
            className="hyper-link font-heavy text-xs tracking-wide sm:text-sm"
          >
            Ver todo el blog &gt;
          </Link>
        </div>
      </section>

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
