import { sanitizePostHtml } from "@/lib/sanitize-html";
import { createClient } from "@/lib/supabase/server";
import type { Post, PostType } from "@/lib/types/database";
import type { AdjacentPostLink } from "./post-neighbors";

export type { AdjacentPostLink };

export const POSTS_PER_PAGE = 20;
const MAX_PAGE_NUMBER = 1000;
const NEIGHBOR_SCAN_LIMIT = 500;
const PUBLIC_POST_COLUMNS =
  "id, type, status, title, slug, summary, thumbnail_url, content, created_at, updated_at";

export type CatalogPostItem = Post;

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

function sanitizePostRecord(post: Post): Post {
  return {
    ...post,
    content: post.content ? sanitizePostHtml(post.content) : post.content,
  };
}

export function parsePageParam(
  rawPage: string | string[] | undefined
): number {
  const value = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const parsed = Number.parseInt(value ?? "1", 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }
  return Math.min(parsed, MAX_PAGE_NUMBER);
}

export async function getPublishedPostsPaginated(
  type: PostType,
  page: number,
  pageSize: number = POSTS_PER_PAGE
): Promise<PaginatedPostsResult> {
  const currentPage = Math.min(Math.max(1, page), MAX_PAGE_NUMBER);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();

  const { data, count, error } = await supabase
    .from("posts")
    .select(PUBLIC_POST_COLUMNS, { count: "exact" })
    .eq("type", type)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return {
      posts: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      hasPrevPage: false,
      hasNextPage: false,
    };
  }

  const totalCount = count ?? data.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (currentPage > totalPages && totalCount > 0) {
    const clampedFrom = (totalPages - 1) * pageSize;
    const clampedTo = clampedFrom + pageSize - 1;
    const { data: fallbackData } = await supabase
      .from("posts")
      .select(PUBLIC_POST_COLUMNS)
      .eq("type", type)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(clampedFrom, clampedTo);

    return {
      posts: ((fallbackData as Post[] | null) ?? []).map(sanitizePostRecord),
      totalCount,
      currentPage: totalPages,
      totalPages,
      hasPrevPage: totalPages > 1,
      hasNextPage: false,
    };
  }

  return {
    posts: (data as Post[]).map(sanitizePostRecord),
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
    .select(PUBLIC_POST_COLUMNS)
    .eq("type", type)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as Post[]).map(sanitizePostRecord);
}

export async function getPublishedPostWithNeighbors(
  type: PostType,
  rawSlug: string
): Promise<PostWithNeighbors | null> {
  let slug: string;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    return null;
  }

  const supabase = await createClient();

  const [{ data: post, error }, { data: orderedList }] = await Promise.all([
    supabase
      .from("posts")
      .select(PUBLIC_POST_COLUMNS)
      .eq("type", type)
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle(),
    supabase
      .from("posts")
      .select("slug, title")
      .eq("type", type)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(NEIGHBOR_SCAN_LIMIT),
  ]);

  if (error || !post) {
    return null;
  }

  let prevPost: AdjacentPostLink | null = null;
  let nextPost: AdjacentPostLink | null = null;

  if (orderedList && orderedList.length > 0) {
    const currentIndex = orderedList.findIndex(
      (item) => item.slug === post.slug
    );

    if (currentIndex > 0) {
      nextPost = orderedList[currentIndex - 1] ?? null;
    }

    if (currentIndex >= 0 && currentIndex < orderedList.length - 1) {
      prevPost = orderedList[currentIndex + 1] ?? null;
    }
  }

  return {
    post: sanitizePostRecord(post as Post),
    prevPost,
    nextPost,
  };
}
