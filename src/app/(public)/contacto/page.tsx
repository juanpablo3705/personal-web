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
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-2 border-b border-neutral-300 pb-5">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          Formulario de Contacto
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Contacto
        </h1>
        <p className="text-sm leading-relaxed text-neutral-600">
          Completa el siguiente formulario para enviarme un mensaje directo. Te
          responderé al correo electrónico que indiques.
        </p>
      </header>

      <section
        aria-label="Formulario para enviar mensaje"
        className="border border-neutral-300 bg-white p-6 sm:p-8"
      >
        {state.success && state.message && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 border border-neutral-900 bg-neutral-100 p-4 text-sm text-neutral-900"
          >
            <p className="font-semibold">¡Correo enviado con éxito!</p>
            <p className="mt-1 text-neutral-700">{state.message}</p>
          </div>
        )}

        {state.error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 border border-neutral-900 bg-neutral-50 p-4 text-sm text-neutral-900"
          >
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5" noValidate>
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
              className="block text-sm font-medium text-neutral-900"
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
              className="w-full border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100"
            />
            {state.fieldErrors?.nombre && (
              <p className="text-xs text-neutral-700">
                {state.fieldErrors.nombre}
              </p>
            )}
          </div>

          {/* Campo 2: Correo electrónico */}
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
              defaultValue={state.values?.email ?? ""}
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.email)}
              className="w-full border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100"
            />
            {state.fieldErrors?.email && (
              <p className="text-xs text-neutral-700">
                {state.fieldErrors.email}
              </p>
            )}
          </div>

          {/* Campo 3: Asunto */}
          <div className="space-y-2">
            <label
              htmlFor="asunto"
              className="block text-sm font-medium text-neutral-900"
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
              className="w-full border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100"
            />
            {state.fieldErrors?.asunto && (
              <p className="text-xs text-neutral-700">
                {state.fieldErrors.asunto}
              </p>
            )}
          </div>

          {/* Campo 4: Mensaje */}
          <div className="space-y-2">
            <label
              htmlFor="mensaje"
              className="block text-sm font-medium text-neutral-900"
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
              className="w-full resize-y border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100"
            />
            {state.fieldErrors?.mensaje && (
              <p className="text-xs text-neutral-700">
                {state.fieldErrors.mensaje}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full border border-neutral-900 bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isPending ? "Enviando mensaje..." : "Enviar mensaje"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
