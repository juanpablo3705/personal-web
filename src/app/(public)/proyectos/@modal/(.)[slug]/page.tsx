import { notFound } from "next/navigation";
import { PostModal } from "@/components/ui/PostModal";
import { getPublishedPostWithNeighbors } from "@/components/ui/post-queries";

type ProyectoModalPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProyectoModalPage({
  params,
}: ProyectoModalPageProps) {
  const { slug } = await params;
  const result = await getPublishedPostWithNeighbors("project", slug);

  if (!result) {
    notFound();
  }

  return (
    <PostModal
      post={result.post}
      prevPost={result.prevPost}
      nextPost={result.nextPost}
      basePath="/proyectos"
    />
  );
}
