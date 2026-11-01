import { notFound } from "next/navigation";
import { PostDetailView } from "@/components/ui/PostDetailView";
import { getPublishedPostWithNeighbors } from "@/components/ui/post-queries";

type BlogDetallePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogDetallePage({
  params,
}: BlogDetallePageProps) {
  const { slug } = await params;
  const result = await getPublishedPostWithNeighbors("blog", slug);

  if (!result) {
    notFound();
  }

  return (
    <PostDetailView
      post={result.post}
      prevPost={result.prevPost}
      nextPost={result.nextPost}
      basePath="/blog"
    />
  );
}
