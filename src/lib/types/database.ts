export type PostType = "blog" | "project";

export type PostStatus = "draft" | "published";

export type Post = {
  id: string;
  type: PostType;
  status: PostStatus;
  title: string;
  slug: string;
  summary: string | null;
  thumbnail_url: string | null;
  content: string | null;
  created_at: string;
  updated_at: string;
};

export type PostInsert = {
  id?: string;
  type: PostType;
  status?: PostStatus;
  title: string;
  slug: string;
  summary?: string | null;
  thumbnail_url?: string | null;
  content?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PostUpdate = {
  id?: string;
  type?: PostType;
  status?: PostStatus;
  title?: string;
  slug?: string;
  summary?: string | null;
  thumbnail_url?: string | null;
  content?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: Post;
        Insert: PostInsert;
        Update: PostUpdate;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      post_type: PostType;
      post_status: PostStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
