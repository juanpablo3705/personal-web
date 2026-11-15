"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  deletePostAction,
  togglePostStatusAction,
} from "@/lib/actions/posts";
import { formatBlogDate } from "@/lib/utils";
import type { Post } from "@/lib/types/database";

type PostListProps = {
  posts: Post[];
};

export default function PostList({ posts }: PostListProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggleStatus(post: Post) {
    setErrorMessage(null);
    setPendingId(post.id);
    startTransition(async () => {
      const result = await togglePostStatusAction(post.id, post.status);
      if (result.error) {
        setErrorMessage(result.error);
      }
      setPendingId(null);
    });
  }

  function handleDelete(post: Post) {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar "${post.title}"?`
    );
    if (!confirmed) return;

    setErrorMessage(null);
    setPendingId(post.id);
    startTransition(async () => {
      const result = await deletePostAction(post.id);
      if (result.error) {
        setErrorMessage(result.error);
      }
      setPendingId(null);
    });
  }

  if (posts.length === 0) {
    return (
      <div className="border border-current p-8 font-roman text-sm sm:text-base">
        No hay entradas registradas todavía. Usa los enlaces superiores para
        crear una nueva entrada de blog o un nuevo proyecto.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="border border-current px-4 py-3 font-roman text-sm sm:text-base"
        >
          {errorMessage}
        </div>
      )}

      <div
        tabIndex={0}
        role="region"
        aria-labelledby="posts-table-heading"
        className="cms-table-wrap"
      >
        <table className="cms-table font-roman text-sm sm:text-base">
          <caption className="sr-only">
            Listado de publicaciones y proyectos registrados en el CMS
          </caption>
          <thead>
            <tr className="font-heavy text-sm sm:text-base">
              <th scope="col" className="px-4 py-3.5">
                Título
              </th>
              <th scope="col" className="px-4 py-3.5">
                Tipo
              </th>
              <th scope="col" className="px-4 py-3.5">
                Estado
              </th>
              <th scope="col" className="px-4 py-3.5">
                Fecha
              </th>
              <th scope="col" className="px-4 py-3.5 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const isRowBusy = isPending && pendingId === post.id;
              const typeLabel = post.type === "blog" ? "Blog" : "Proyecto";
              const statusLabel =
                post.status === "published" ? "Publicado" : "Borrador";
              const formattedDate = formatBlogDate(post.created_at) || "—";

              return (
                <tr key={post.id}>
                  <th scope="row" className="px-4 py-4 font-roman align-top">
                    <div className="font-heavy text-sm sm:text-base">
                      {post.title}
                    </div>
                    <div className="mt-1 font-roman text-sm opacity-70">
                      /{post.type === "blog" ? "blog" : "proyectos"}/{post.slug}
                    </div>
                  </th>
                  <td className="px-4 py-4 align-top font-roman">
                    {typeLabel}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span
                      className={`inline-block border border-current px-2 py-0.5 text-xs sm:text-sm ${
                        post.status === "published"
                          ? "bg-[var(--theme-fg)] font-heavy text-[var(--theme-bg)]"
                          : "font-roman"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top font-roman italic">
                    {formattedDate}
                  </td>
                  <td className="px-4 py-4 align-top text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
                      <Link
                        href={`/dashboard/editor?id=${post.id}`}
                        className="hyper-link font-heavy text-sm sm:text-base"
                      >
                        Editar &gt;
                      </Link>
                      <button
                        type="button"
                        disabled={isRowBusy}
                        onClick={() => handleToggleStatus(post)}
                        className="hyper-link cursor-pointer font-roman text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                      >
                        {post.status === "published"
                          ? "Pasar a borrador >"
                          : "Publicar >"}
                      </button>
                      <button
                        type="button"
                        disabled={isRowBusy}
                        onClick={() => handleDelete(post)}
                        className="hyper-link cursor-pointer font-roman text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                      >
                        Eliminar &gt;
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
