import Link from "next/link";
import { redirect } from "next/navigation";
import CvUploader from "@/components/admin/CvUploader";
import PostList from "@/components/admin/PostList";
import { logoutAction } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: postsData, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  const posts: Post[] = (postsData as Post[] | null) ?? [];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 text-neutral-900">
      <div className="space-y-8 border border-neutral-300 bg-white p-8">
        {/* Cabecera del Panel */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-300 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Panel de Administración
            </h1>
            {user?.email && (
              <p className="text-xs text-neutral-600">
                Sesión iniciada como: {user.email}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="border border-neutral-300 bg-white px-3.5 py-2 text-xs font-medium text-neutral-800 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
            >
              Ver sitio público
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>

        {/* Bloque superior: 3 acciones claras */}
        <section
          aria-label="Acciones principales"
          className="space-y-4 border-b border-neutral-300 pb-8"
        >
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard/editor?type=blog"
              className="inline-flex items-center justify-center border border-neutral-900 bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              + Nueva Entrada de Blog
            </Link>

            <Link
              href="/dashboard/editor?type=project"
              className="inline-flex items-center justify-center border border-neutral-900 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
            >
              + Nuevo Proyecto
            </Link>
          </div>

          <CvUploader />
        </section>

        {/* Lista de todas las entradas (posts) ordenadas por fecha */}
        <section aria-label="Lista de publicaciones" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900">
              Entradas ({posts.length})
            </h2>
            <span className="text-xs text-neutral-500">
              Ordenadas por fecha (más recientes primero)
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="border border-neutral-900 bg-neutral-100 px-4 py-3 text-xs text-neutral-900"
            >
              Error al cargar las entradas: {error.message}
            </div>
          )}

          <PostList posts={posts} />
        </section>
      </div>
    </main>
  );
}
