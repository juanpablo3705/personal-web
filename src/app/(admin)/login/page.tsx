"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  loginAction,
  logoutAction,
  type AuthActionState,
} from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";

const initialState: AuthActionState = {
  error: null,
};

const INPUT_CLASS =
  "min-h-12 w-full border border-current bg-transparent px-3.5 py-2.5 font-roman text-base placeholder:opacity-40 disabled:cursor-not-allowed disabled:opacity-50";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (isMounted && data.user?.email) {
        setActiveEmail(data.user.email);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section aria-labelledby="login-heading" className="space-y-10 pt-6">
      <header className="space-y-3 border-b border-current pb-4">
        <p className="font-heavy text-sm sm:text-base">CMS · Portal privado</p>
        <h1
          id="login-heading"
          className="font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]"
        >
          Acceso de administrador
        </h1>
      </header>

      <div className="max-w-[560px] space-y-8">
        <p className="font-roman text-sm leading-relaxed sm:text-base">
          Ingresa con tu cuenta de propietario para gestionar entradas de blog,
          proyectos y actualizar el CV.
        </p>

        {activeEmail && (
          <div className="space-y-4 border border-current p-5 font-roman text-sm sm:text-base">
            <p>
              Sesión activa como{" "}
              <span className="font-heavy">{activeEmail}</span>.
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <Link
                href="/dashboard"
                className="hyper-link font-heavy text-sm sm:text-base"
              >
                Ir al panel &gt;
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="hyper-link cursor-pointer font-roman text-sm sm:text-base"
                >
                  Cerrar sesión &gt;
                </button>
              </form>
            </div>
          </div>
        )}

        {state?.error && (
          <div
            role="alert"
            aria-live="polite"
            className="border border-current px-4 py-3 font-roman text-sm sm:text-base"
          >
            {state.error}
          </div>
        )}

        <form
          action={formAction}
          aria-labelledby="login-heading"
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-roman text-sm sm:text-base"
            >
              Correo electrónico *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              required
              autoComplete="username"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="next"
              placeholder="tu-correo@ejemplo.com"
              disabled={isPending}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-roman text-sm sm:text-base"
            >
              Contraseña *
            </label>
            <div className="flex items-stretch">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                enterKeyHint="done"
                placeholder="••••••••"
                disabled={isPending}
                className={`${INPUT_CLASS} min-w-0 flex-1`}
              />
              <button
                type="button"
                disabled={isPending}
                aria-pressed={showPassword}
                aria-controls="password"
                aria-describedby="toggle-password-warning"
                onClick={() => setShowPassword((prev) => !prev)}
                className="min-h-12 shrink-0 cursor-pointer border-y border-r border-current px-4 font-roman text-sm transition-colors hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <span id="toggle-password-warning" className="sr-only">
              Atención: activarlo mostrará la contraseña escrita en pantalla.
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="hyper-link cursor-pointer font-heavy text-sm tracking-wide disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
            >
              {isPending ? "Iniciando sesión..." : "Iniciar sesión >"}
            </button>
          </div>
        </form>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-current pt-4 font-roman text-sm sm:text-base">
          <Link href="/" className="hyper-link">
            &lt; Volver al sitio público
          </Link>

          {activeEmail && (
            <form action={logoutAction}>
              <button type="submit" className="hyper-link cursor-pointer">
                Cerrar sesión &gt;
              </button>
            </form>
          )}
        </footer>
      </div>
    </section>
  );
}
