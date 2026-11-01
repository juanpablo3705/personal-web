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

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );
  const [activeEmail, setActiveEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setActiveEmail(data.user.email);
      }
    });
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-white px-6 py-12 text-neutral-900">
      <section className="space-y-6 border border-neutral-300 bg-white p-8">
        <header className="space-y-2 border-b border-neutral-300 pb-4">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Portal Privado
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Acceso de Administrador
          </h1>
          <p className="text-sm text-neutral-600">
            Ingresa con tu cuenta de propietario para gestionar entradas y CV.
          </p>
        </header>

        {activeEmail && (
          <div className="space-y-3 border border-neutral-300 bg-neutral-50 p-4 text-sm">
            <p className="text-neutral-700">
              Sesión activa como{" "}
              <span className="font-semibold text-neutral-900">
                {activeEmail}
              </span>
              .
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center border border-neutral-900 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Ir al Panel →
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        )}

        {state?.error && (
          <div
            role="alert"
            aria-live="polite"
            className="border border-neutral-900 bg-neutral-100 px-4 py-3 text-sm text-neutral-900"
          >
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-900"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu-correo@ejemplo.com"
              disabled={isPending}
              className="w-full border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-900"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isPending}
              className="w-full border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full border border-neutral-900 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <footer className="flex items-center justify-between border-t border-neutral-300 pt-4 text-xs text-neutral-600">
          <Link
            href="/"
            className="hover:text-neutral-900 hover:underline underline-offset-4"
          >
            ← Volver al sitio público
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="text-neutral-600 hover:text-neutral-900 hover:underline underline-offset-4"
            >
              Cerrar sesión
            </button>
          </form>
        </footer>
      </section>
    </main>
  );
}
