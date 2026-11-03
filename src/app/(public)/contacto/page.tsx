"use client";

import { useActionState } from "react";
import {
  sendContactEmailAction,
  type ContactoActionState,
} from "@/lib/actions/contacto";
import { getCvPublicUrl } from "@/lib/cv";

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
  const cvPublicUrl = getCvPublicUrl();

  return (
    <section className="space-y-10 pt-6">
      <header className="border-b border-current pb-4">
        <h1 className="font-roman text-2xl leading-[1.32] sm:text-3xl lg:text-[2.1rem]">
          Formulario de contacto
        </h1>
      </header>

      <div aria-label="Formulario para enviar mensaje" className="max-w-2xl">
        {state.success && state.message && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 pb-4 text-sm sm:text-base"
          >
            <p className="font-heavy text-sm sm:text-base">¡Correo enviado con éxito!</p>
            <p className="mt-1 font-roman text-sm sm:text-base">{state.message}</p>
          </div>
        )}

        {state.error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 pb-4 font-roman text-sm sm:text-base"
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
            <label htmlFor="nombre" className="block font-roman text-sm sm:text-base">
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
              className="w-full border border-current bg-transparent px-3.5 py-2.5 font-roman text-sm placeholder:opacity-40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
            />
            {state.fieldErrors?.nombre && (
              <p className="font-roman text-sm sm:text-base">{state.fieldErrors.nombre}</p>
            )}
          </div>

          {/* Campo 2: Correo electrónico */}
          <div className="space-y-2">
            <label htmlFor="email" className="block font-roman text-sm sm:text-base">
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
              className="w-full border border-current bg-transparent px-3.5 py-2.5 font-roman text-sm placeholder:opacity-40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
            />
            {state.fieldErrors?.email && (
              <p className="font-roman text-sm sm:text-base">{state.fieldErrors.email}</p>
            )}
          </div>

          {/* Campo 3: Asunto */}
          <div className="space-y-2">
            <label htmlFor="asunto" className="block font-roman text-sm sm:text-base">
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
              className="w-full border border-current bg-transparent px-3.5 py-2.5 font-roman text-sm placeholder:opacity-40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
            />
            {state.fieldErrors?.asunto && (
              <p className="font-roman text-sm sm:text-base">{state.fieldErrors.asunto}</p>
            )}
          </div>

          {/* Campo 4: Mensaje */}
          <div className="space-y-2">
            <label htmlFor="mensaje" className="block font-roman text-sm sm:text-base">
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
              className="w-full resize-y border border-current bg-transparent px-3.5 py-2.5 font-roman text-sm placeholder:opacity-40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
            />
            {state.fieldErrors?.mensaje && (
              <p className="font-roman text-sm sm:text-base">{state.fieldErrors.mensaje}</p>
            )}
          </div>

          <div className="flex flex-col items-start gap-4 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="hyper-link cursor-pointer font-heavy text-sm tracking-wide disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            >
              {isPending ? "Enviando este mensaje... >" : "Enviar este mensaje >"}
            </button>
            <p className="font-roman text-sm sm:text-base">o</p>
            <a
              href={cvPublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              download="CV_JuanPabloOyanedel.pdf"
              className="hyper-link font-heavy text-sm tracking-wide sm:text-base"
            >
              Descargar CV en PDF &gt;
            </a>
            <a
              href="https://github.com/juanpablo3705"
              target="_blank"
              rel="noopener noreferrer"
              className="hyper-link font-heavy text-sm tracking-wide sm:text-base"
            >
              Perfil de GitHub &gt;
            </a>
            <a
              href="mailto:juanpablo3705@gmail.com"
              className="hyper-link font-heavy text-sm tracking-wide sm:text-base"
            >
              Enviar correo &gt;
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}
