import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PostEditorForm from "@/components/admin/PostEditorForm";
import { createClient } from "@/lib/supabase/server";
import type { Post, PostType } from "@/lib/types/database";

type EditorPageProps = {
  searchParams: Promise<{
    id?: string;
    type?: string;
  }>;
};

export default async function DashboardEditorPage({
  searchParams,
}: EditorPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const postId = params.id?.trim();
  const requestedType: PostType =
    params.type === "project" ? "project" : "blog";

  let initialPost: Post | null = null;

  if (postId) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .maybeSingle();

    if (error || !data) {
      notFound();
    }

    initialPost = data as Post;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10 text-neutral-900">
      <section className="space-y-6 border border-neutral-300 bg-white p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-300 pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {initialPost ? "Editar Entrada" : "Nueva Entrada"}
            </h1>
            <p className="text-xs text-neutral-600">
              {initialPost
                ? `Editando: ${initialPost.title}`
                : requestedType === "project"
                  ? "Creando un nuevo proyecto"
                  : "Creando una nueva entrada de blog"}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
          >
            ← Volver al Panel
          </Link>
        </header>

        <PostEditorForm
          key={initialPost?.id ?? requestedType}
          initialPost={initialPost}
          defaultType={requestedType}
        />
      </section>
    </main>
  );
}
