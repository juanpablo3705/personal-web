import { ProyectosCatalogSection } from "@/components/ui/CatalogWithModal";
import { Pagination } from "@/components/ui/Pagination";
import {
  getPublishedPostsPaginated,
  parsePageParam,
} from "@/components/ui/post-queries";

type ProyectosPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function ProyectosPage({
  searchParams,
}: ProyectosPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parsePageParam(resolvedSearchParams.page);

  const {
    posts,
    totalCount,
    currentPage,
    totalPages,
    hasPrevPage,
    hasNextPage,
  } = await getPublishedPostsPaginated("project", page);

  return (
    <section className="space-y-10 pt-6">
      <header className="border-b border-current pb-4">
        <h1 className="font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]">
          Proyectos
        </h1>
      </header>

      <ProyectosCatalogSection posts={posts} />

      <Pagination
        basePath="/proyectos"
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
      />
    </section>
  );
}
