import type { Post } from "@/lib/types/database";

export type AdjacentPostLink = {
  slug: string;
  title: string;
};

export function findPostAndNeighbors(
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
  // list está ordenada por created_at desc: "Siguiente >" es más nueva (index - 1)
  // y "< Anterior" es más antigua (index + 1).
  const newerItem = index > 0 ? list[index - 1] : null;
  const olderItem = index < list.length - 1 ? list[index + 1] : null;

  return {
    post,
    prevPost: olderItem
      ? { slug: olderItem.slug, title: olderItem.title }
      : null,
    nextPost: newerItem
      ? { slug: newerItem.slug, title: newerItem.title }
      : null,
  };
}
