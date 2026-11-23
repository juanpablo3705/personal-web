import Link from "next/link";
import LoginForm from "@/components/admin/LoginForm";
import { logoutAction } from "@/lib/actions/auth";
import { getAuthenticatedAdmin } from "@/lib/supabase/admin-auth";

export default async function LoginPage() {
  const { user, isAuthorized } = await getAuthenticatedAdmin();
  const activeEmail = isAuthorized && user?.email ? user.email : null;

  return (
    <section aria-labelledby="login-heading" className="space-y-10 pt-6">
      <header className="border-b border-current pb-4">
        <h1
          id="login-heading"
          className="font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]"
        >
          CMS / Portal privado
        </h1>
      </header>

      <div className="max-w-[560px] space-y-8">
        {activeEmail && (
          <div className="space-y-4 border border-current p-5 font-roman text-sm sm:text-base">
            <p>
              Sesión activa como{" "}
              <span className="font-heavy">{activeEmail}</span>.
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <Link
                href="/dashboard"
                className="hyper-link font-heavy text-sm tracking-wide sm:text-base"
              >
                Ir al panel &gt;
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="hyper-link cursor-pointer font-heavy text-sm tracking-wide sm:text-base"
                >
                  Cerrar sesión &gt;
                </button>
              </form>
            </div>
          </div>
        )}

        <LoginForm />
      </div>
    </section>
  );
}
