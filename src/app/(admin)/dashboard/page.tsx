import Link from "next/link";
import { redirect } from "next/navigation";
import CvUploader from "@/components/admin/CvUploader";
import PostList from "@/components/admin/PostList";
import { logoutAction } from "@/lib/actions/auth";
import { getAuthenticatedAdmin } from "@/lib/supabase/admin-auth";
import type { Post } from "@/lib/types/database";

export default async function DashboardPage() {
  const { supabase, user, isAuthorized } = await getAuthenticatedAdmin();

  if (!isAuthorized || !user) {
    redirect("/login");
  }

  const { data: postsData, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[dashboard] Error al cargar entradas:", error);
  }

  const posts: Post[] = (postsData as Post[] | null) ?? [];

  return (
    <section aria-labelledby="dashboard-heading" className="space-y-10 pt-6">
      {/* Cabecera del Panel */}
      <header className="border-b border-current pb-4">
        <h1
          id="dashboard-heading"
          className="font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]"
        >
          Panel de administración
        </h1>
      </header>

      {/* Bloque superior: estado de sesión, navegación, creación y actualización de CV */}
      <section
        aria-label="Acciones principales"
        className="space-y-8 border-b border-current pb-10"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="space-y-1">
            <p className="font-heavy text-sm sm:text-base">
              CMS · Administración
            </p>
            {user?.email && (
              <p className="font-roman text-sm sm:text-base">
                Sesión iniciada como{" "}
                <span className="font-heavy">{user.email}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <Link
              href="/"
              className="hyper-link font-roman text-sm sm:text-base"
            >
              Ver sitio público &gt;
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="hyper-link cursor-pointer font-heavy text-sm sm:text-base"
              >
                Cerrar sesión &gt;
              </button>
            </form>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <Link
            href="/dashboard/editor?type=blog"
            className="hyper-link font-heavy text-sm sm:text-base"
          >
            + Nueva entrada de blog &gt;
          </Link>

          <Link
            href="/dashboard/editor?type=project"
            className="hyper-link font-heavy text-sm sm:text-base"
          >
            + Nuevo proyecto &gt;
          </Link>
        </div>

        <CvUploader />
      </section>

      {/* Lista de todas las entradas (posts) ordenadas por fecha */}
      <section aria-labelledby="posts-table-heading" className="space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="posts-table-heading"
            className="font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]"
          >
            Entradas ({posts.length})
          </h2>
          <span className="font-roman text-sm italic sm:text-base">
            Ordenadas por fecha (más recientes primero)
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="border border-current px-4 py-3 font-roman text-sm sm:text-base"
          >
            No se pudieron cargar las entradas en este momento. Intenta recargar
            la página.
          </div>
        )}

        <PostList posts={posts} />
      </section>
    </section>
  );
}
