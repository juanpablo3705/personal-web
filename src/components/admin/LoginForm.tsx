"use client";

import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/lib/actions/auth";

const initialState: AuthActionState = {
  error: null,
};

const INPUT_CLASS =
  "min-h-12 w-full border border-current bg-transparent px-3.5 py-2.5 font-roman text-base placeholder:opacity-40 disabled:cursor-not-allowed disabled:opacity-50";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <>
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
            Correo electrónico
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
            Contraseña
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
    </>
  );
}
