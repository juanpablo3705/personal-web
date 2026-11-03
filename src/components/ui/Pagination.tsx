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
      className="flex items-center justify-between pt-6"
    >
      <div>
        {hasPrevPage && (
          <Link
            href={prevHref}
            className="hyper-link font-heavy text-sm tracking-wide sm:text-base"
          >
            &lt; Anterior
          </Link>
        )}
      </div>

      <span className="font-roman text-sm sm:text-base">
        Página {currentPage} de {totalPages}
      </span>

      <div>
        {hasNextPage && (
          <Link
            href={nextHref}
            className="hyper-link font-heavy text-sm tracking-wide sm:text-base"
          >
            Siguiente &gt;
          </Link>
        )}
      </div>
    </nav>
  );
}
