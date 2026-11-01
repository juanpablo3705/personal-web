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

  const proyectosVisibles = proyectos.slice(0, 3);
  const blogVisibles = entradasBlog.slice(0, 3);

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
      {/* 2. SECCIÓN DE RESUMEN DE PROYECTOS (máximo 3 entradas, diseño uniforme con Blog) */}
      <section aria-labelledby="home-proyectos-titulo" className="space-y-8 pt-8">
        <header className="border-b border-current pb-4 text-center">
          <h2
            id="home-proyectos-titulo"
            className="font-heavy text-lg uppercase tracking-widest sm:text-xl"
          >
            PROYECTOS
          </h2>
        </header>

        {proyectosVisibles.length === 0 ? (
          <p className="pt-4 text-center text-sm">
            No hay proyectos publicados por el momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-10 pt-2 md:grid-cols-3 lg:gap-14">
            {proyectosVisibles.map((project) => (
              <article
                key={project.id}
                className="flex flex-col justify-between space-y-5"
              >
                <div className="space-y-5">
                  {/* Título + Separador */}
                  <div className="border-b border-current pb-3 text-center">
                    <h3 className="font-heavy text-sm uppercase tracking-wider sm:text-base">
                      <button
                        type="button"
                        onClick={() => openModal("project", project.slug)}
                        className="hyper-link cursor-pointer font-heavy uppercase"
                      >
                        {project.title}
                      </button>
                    </h3>
                  </div>

                  {/* Thumbnail */}
                  {project.thumbnail_url && (
                    <button
                      type="button"
                      onClick={() => openModal("project", project.slug)}
                      className="block aspect-[4/3] w-full cursor-pointer overflow-hidden text-left"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  )}

                  {/* Texto resumen */}
                  {project.summary && (
                    <p className="font-editorial-serif text-sm leading-relaxed sm:text-base">
                      {project.summary}
                    </p>
                  )}
                </div>

                {/* Link "Ver más >" */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openModal("project", project.slug)}
                    className="hyper-link cursor-pointer font-roman text-xs tracking-wide sm:text-sm"
                  >
                    Ver más &gt;
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="pt-4 text-center">
          <Link
            href="/proyectos"
            className="hyper-link font-heavy text-xs tracking-wider sm:text-sm"
          >
            Ver todos los proyectos &gt;
          </Link>
        </div>
      </section>

      {/* 3. SECCIÓN DE RESUMEN DE BLOG (máximo 3 entradas, diseño uniforme con Proyectos) */}
      <section aria-labelledby="home-blog-titulo" className="space-y-8 pb-12">
        <header className="border-b border-current pb-4 text-center">
          <h2
            id="home-blog-titulo"
            className="font-heavy text-lg uppercase tracking-widest sm:text-xl"
          >
            BLOG
          </h2>
        </header>

        {blogVisibles.length === 0 ? (
          <p className="pt-4 text-center text-sm">
            No hay entradas de blog publicadas por el momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-10 pt-2 md:grid-cols-3 lg:gap-14">
            {blogVisibles.map((post) => (
              <article
                key={post.id}
                className="flex flex-col justify-between space-y-5"
              >
                <div className="space-y-5">
                  {/* Título + Separador */}
                  <div className="border-b border-current pb-3 text-center">
                    <h3 className="font-heavy text-sm uppercase tracking-wider sm:text-base">
                      <button
                        type="button"
                        onClick={() => openModal("blog", post.slug)}
                        className="hyper-link cursor-pointer font-heavy uppercase"
                      >
                        {post.title}
                      </button>
                    </h3>
                  </div>

                  {/* Texto resumen */}
                  {post.summary && (
                    <p className="font-editorial-serif text-sm leading-relaxed sm:text-base">
                      {post.summary}
                    </p>
                  )}
                </div>

                {/* Link "Leer más >" */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openModal("blog", post.slug)}
                    className="hyper-link cursor-pointer font-roman text-xs tracking-wide sm:text-sm"
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
            className="hyper-link font-heavy text-xs tracking-wider sm:text-sm"
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
