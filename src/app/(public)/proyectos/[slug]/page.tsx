import { notFound } from "next/navigation";
import { PostDetailView } from "@/components/ui/PostDetailView";
import { getPublishedPostWithNeighbors } from "@/components/ui/post-queries";

type ProyectoDetallePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProyectoDetallePage({
  params,
}: ProyectoDetallePageProps) {
  const { slug } = await params;
  const result = await getPublishedPostWithNeighbors("project", slug);

  if (!result) {
    notFound();
  }

  return (
    <PostDetailView
      post={result.post}
      prevPost={result.prevPost}
      nextPost={result.nextPost}
      basePath="/proyectos"
    />
  );
}
