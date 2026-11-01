import Link from "next/link";
import { POSTS_PER_PAGE } from "./post-queries";

type PaginationProps = {
  basePath: "/proyectos" | "/blog";
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  pageSize?: number;
};

export function Pagination({
  basePath,
  currentPage,
  totalPages,
  totalCount,
  hasPrevPage,
  hasNextPage,
  pageSize = POSTS_PER_PAGE,
}: PaginationProps) {
  if (totalCount <= pageSize && currentPage <= 1) {
    return null;
  }

  const prevHref =
    currentPage - 1 <= 1 ? basePath : `${basePath}?page=${currentPage - 1}`;
  const nextHref = `${basePath}?page=${currentPage + 1}`;

  return (
    <nav
      aria-label="Paginación de publicaciones"
      className="flex items-center justify-between border-t border-neutral-300 pt-6"
    >
      {hasPrevPage ? (
        <Link
          href={prevHref}
          className="inline-flex items-center border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
        >
          ← Anterior
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex cursor-not-allowed items-center border border-neutral-200 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-400"
        >
          ← Anterior
        </span>
      )}

      <span className="text-xs font-medium text-neutral-600">
        Página {currentPage} de {totalPages}
      </span>

      {hasNextPage ? (
        <Link
          href={nextHref}
          className="inline-flex items-center border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
        >
          Siguiente →
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex cursor-not-allowed items-center border border-neutral-200 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-400"
        >
          Siguiente →
        </span>
      )}
    </nav>
  );
}
