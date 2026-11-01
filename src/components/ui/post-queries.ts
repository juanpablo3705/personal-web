import { createClient } from "@/lib/supabase/server";
import type { Post, PostType } from "@/lib/types/database";

export const POSTS_PER_PAGE = 20;

export type CatalogPostItem = Pick<
  Post,
  | "id"
  | "type"
  | "status"
  | "title"
  | "slug"
  | "summary"
  | "thumbnail_url"
  | "created_at"
  | "updated_at"
>;

export type AdjacentPostLink = {
  slug: string;
  title: string;
};

export type PaginatedPostsResult = {
  posts: CatalogPostItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

export type PostWithNeighbors = {
  post: Post;
  prevPost: AdjacentPostLink | null;
  nextPost: AdjacentPostLink | null;
};

export function parsePageParam(
  rawPage: string | string[] | undefined
): number {
  const value = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const parsed = Number.parseInt(value ?? "1", 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

export async function getPublishedPostsPaginated(
  type: PostType,
  page: number,
  pageSize: number = POSTS_PER_PAGE
): Promise<PaginatedPostsResult> {
  const currentPage = Math.max(1, page);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();

  const { data, count, error } = await supabase
    .from("posts")
    .select(
      "id, type, status, title, slug, summary, thumbnail_url, created_at, updated_at",
      { count: "exact" }
    )
    .eq("type", type)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return {
      posts: [],
      totalCount: 0,
      currentPage,
      totalPages: 1,
      hasPrevPage: currentPage > 1,
      hasNextPage: false,
    };
  }

  const totalCount = count ?? data.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    posts: data as CatalogPostItem[],
    totalCount,
    currentPage,
    totalPages,
    hasPrevPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  };
}

export async function getPublishedPostsFull(
  type: PostType,
  limit: number = 20
): Promise<Post[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("type", type)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as Post[];
}

export async function getPublishedPostWithNeighbors(
  type: PostType,
  rawSlug: string
): Promise<PostWithNeighbors | null> {
  const slug = decodeURIComponent(rawSlug);
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("type", type)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !post) {
    return null;
  }

  // Consultar la lista ordenada cronológicamente (created_at DESC) del mismo tipo
  // para determinar con exactitud la entrada anterior y siguiente.
  const { data: orderedList } = await supabase
    .from("posts")
    .select("slug, title")
    .eq("type", type)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  let prevPost: AdjacentPostLink | null = null;
  let nextPost: AdjacentPostLink | null = null;

  if (orderedList && orderedList.length > 0) {
    const currentIndex = orderedList.findIndex(
      (item) => item.slug === post.slug
    );

    if (currentIndex > 0) {
      prevPost = orderedList[currentIndex - 1] ?? null;
    }

    if (currentIndex >= 0 && currentIndex < orderedList.length - 1) {
      nextPost = orderedList[currentIndex + 1] ?? null;
    }
  }

  return {
    post: post as Post,
    prevPost,
    nextPost,
  };
}
