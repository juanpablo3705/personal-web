"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  deletePostAction,
  togglePostStatusAction,
} from "@/lib/actions/posts";
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
      <div className="border border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-600">
        No hay entradas registradas todavía. Usa los botones superiores para
        crear una nueva entrada de Blog o un nuevo Proyecto.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {errorMessage && (
        <div
          role="alert"
          className="border border-neutral-900 bg-neutral-100 px-4 py-2.5 text-xs text-neutral-900"
        >
          {errorMessage}
        </div>
      )}

      <div className="overflow-x-auto border border-neutral-300">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-300 bg-neutral-100 text-xs font-semibold uppercase tracking-wider text-neutral-700">
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-300 bg-white">
            {posts.map((post) => {
              const isRowBusy = isPending && pendingId === post.id;
              const typeLabel = post.type === "blog" ? "Blog" : "Proyecto";
              const statusLabel =
                post.status === "published" ? "Publicado" : "Borrador";
              const formattedDate = new Date(
                post.created_at
              ).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });

              return (
                <tr
                  key={post.id}
                  className="transition-colors hover:bg-neutral-50"
                >
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    <div>{post.title}</div>
                    <div className="text-xs font-normal text-neutral-500">
                      /{post.type === "blog" ? "blog" : "proyectos"}/{post.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    <span className="inline-block border border-neutral-300 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-800">
                      {typeLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block border px-2 py-0.5 text-xs font-medium ${
                        post.status === "published"
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-300 bg-white text-neutral-700"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600">
                    {formattedDate}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/editor?id=${post.id}`}
                        className="border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        disabled={isRowBusy}
                        onClick={() => handleToggleStatus(post)}
                        className="border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {post.status === "published"
                          ? "Pasar a Borrador"
                          : "Publicar"}
                      </button>
                      <button
                        type="button"
                        disabled={isRowBusy}
                        onClick={() => handleDelete(post)}
                        className="border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Eliminar
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
