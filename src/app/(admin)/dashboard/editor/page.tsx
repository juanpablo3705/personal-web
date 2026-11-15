import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PostEditorForm from "@/components/admin/PostEditorForm";
import { getAuthenticatedAdmin } from "@/lib/supabase/admin-auth";
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
  const { supabase, user, isAuthorized } = await getAuthenticatedAdmin();

  if (!isAuthorized || !user) {
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
    <section aria-labelledby="editor-heading" className="space-y-10 pt-6">
      <header className="border-b border-current pb-4">
        <h1
          id="editor-heading"
          className="font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]"
        >
          {initialPost ? "Editar entrada" : "Nueva entrada"}
        </h1>
      </header>

      <div className="max-w-4xl space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="space-y-1">
            <p className="font-heavy text-sm sm:text-base">CMS · Editor</p>
            <p className="font-roman text-sm opacity-75 sm:text-base">
              {initialPost
                ? `Editando: ${initialPost.title}`
                : requestedType === "project"
                  ? "Creando un nuevo proyecto"
                  : "Creando una nueva entrada de blog"}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="hyper-link font-heavy text-sm sm:text-base"
          >
            &lt; Volver al panel
          </Link>
        </div>

        <div className="border border-current p-6 sm:p-8">
          <PostEditorForm
            key={initialPost?.id ?? requestedType}
            initialPost={initialPost}
            defaultType={requestedType}
          />
        </div>
      </div>
    </section>
  );
}
