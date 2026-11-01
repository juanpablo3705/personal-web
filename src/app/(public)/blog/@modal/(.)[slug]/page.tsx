import { notFound } from "next/navigation";
import { PostModal } from "@/components/ui/PostModal";
import { getPublishedPostWithNeighbors } from "@/components/ui/post-queries";

type BlogModalPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogModalPage({ params }: BlogModalPageProps) {
  const { slug } = await params;
  const result = await getPublishedPostWithNeighbors("blog", slug);

  if (!result) {
    notFound();
  }

  return (
    <PostModal
      post={result.post}
      prevPost={result.prevPost}
      nextPost={result.nextPost}
      basePath="/blog"
    />
  );
}
