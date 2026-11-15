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
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              enterKeyHint="done"
              placeholder="••••••••"
              disabled={isPending}
              className={INPUT_CLASS}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="hyper-link cursor-pointer font-heavy text-sm tracking-wide disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            >
              {isPending ? "Iniciando sesión... >" : "Iniciar sesión >"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
