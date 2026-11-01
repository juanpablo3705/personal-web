"use client";

import { useActionState } from "react";
import {
  sendContactEmailAction,
  type ContactoActionState,
} from "@/lib/actions/contacto";

const initialState: ContactoActionState = {
  success: false,
  message: null,
  error: null,
};

export default function ContactoPage() {
  const [state, formAction, isPending] = useActionState(
    sendContactEmailAction,
    initialState
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8 pt-6">
      <header>
        <h1 className="font-heavy text-2xl tracking-tight sm:text-3xl">
          Formulario de contacto
        </h1>
      </header>

      <section aria-label="Formulario para enviar mensaje">
        {state.success && state.message && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 border-b border-current pb-4 text-sm"
          >
            <p className="font-heavy">¡Correo enviado con éxito!</p>
            <p className="mt-1 font-roman">{state.message}</p>
          </div>
        )}

        {state.error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 border-b border-current pb-4 text-sm"
          >
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-6" noValidate>
          {/*
            NOTA FUTURA (Anti-spam / Honeypot):
            Si en el futuro se necesita agregar un campo honeypot contra bots sin usar captchas,
            insertar aquí un input oculto (y descomentar la validación en src/lib/actions/contacto.ts):

            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">No completar este campo</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
          */}

          {/* Campo 1: Nombre */}
          <div className="space-y-2">
            <label
              htmlFor="nombre"
              className="block font-roman text-sm"
            >
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              autoComplete="name"
              placeholder="Tu nombre completo"
              defaultValue={state.values?.nombre ?? ""}
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.nombre)}
              className="w-full border border-current bg-transparent px-3.5 py-2.5 font-roman text-sm placeholder:opacity-40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            {state.fieldErrors?.nombre && (
              <p className="font-roman text-xs">
                {state.fieldErrors.nombre}
              </p>
            )}
          </div>

          {/* Campo 2: Correo electrónico */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block font-roman text-sm"
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
              defaultValue={state.values?.email ?? ""}
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.email)}
              className="w-full border border-current bg-transparent px-3.5 py-2.5 font-roman text-sm placeholder:opacity-40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            {state.fieldErrors?.email && (
              <p className="font-roman text-xs">
                {state.fieldErrors.email}
              </p>
            )}
          </div>

          {/* Campo 3: Asunto */}
          <div className="space-y-2">
            <label
              htmlFor="asunto"
              className="block font-roman text-sm"
            >
              Asunto
            </label>
            <input
              id="asunto"
              name="asunto"
              type="text"
              required
              placeholder="Motivo de tu mensaje"
              defaultValue={state.values?.asunto ?? ""}
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.asunto)}
              className="w-full border border-current bg-transparent px-3.5 py-2.5 font-roman text-sm placeholder:opacity-40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            {state.fieldErrors?.asunto && (
              <p className="font-roman text-xs">
                {state.fieldErrors.asunto}
              </p>
            )}
          </div>

          {/* Campo 4: Mensaje */}
          <div className="space-y-2">
            <label
              htmlFor="mensaje"
              className="block font-roman text-sm"
            >
              Mensaje
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              rows={6}
              required
              placeholder="Escribe tu mensaje aquí..."
              defaultValue={state.values?.mensaje ?? ""}
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.mensaje)}
              className="w-full resize-y border border-current bg-transparent px-3.5 py-2.5 font-roman text-sm placeholder:opacity-40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            {state.fieldErrors?.mensaje && (
              <p className="font-roman text-xs">
                {state.fieldErrors.mensaje}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="hyper-link cursor-pointer font-heavy text-sm tracking-wide disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            >
              {isPending ? "Enviando mensaje..." : "Enviar mensaje"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
