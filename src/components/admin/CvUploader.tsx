"use client";

import { useState, useTransition } from "react";
import {
  uploadCvAction,
  revalidateCvAction,
  type CvActionState,
} from "@/lib/actions/cv";
import { createClient } from "@/lib/supabase/client";

const initialState: CvActionState = {
  success: false,
  message: null,
  error: null,
};

export default function CvUploader() {
  const [state, setState] = useState<CvActionState>(initialState);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("cv") as File | null;

    if (!file || file.size === 0) {
      setState({
        success: false,
        message: null,
        error: "Por favor, selecciona un archivo PDF.",
      });
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setState({
        success: false,
        message: null,
        error: "El archivo debe estar en formato PDF (.pdf).",
      });
      return;
    }

    setState(initialState);

    startTransition(async () => {
      // Si el archivo supera ~900KB, usamos el cliente directo de Supabase Storage
      // para evitar el límite por defecto de 1MB en Server Actions de Next.js.
      if (file.size > 900 * 1024) {
        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload("cv_actual.pdf", file, {
            upsert: true,
            contentType: "application/pdf",
          });

        if (uploadError) {
          setState({
            success: false,
            message: null,
            error: `Error al subir el CV: ${uploadError.message}`,
          });
          return;
        }

        await revalidateCvAction();
        setState({
          success: true,
          message: "CV actualizado correctamente",
          error: null,
        });
        form.reset();
        return;
      }

      const result = await uploadCvAction(initialState, formData);
      setState(result);
      if (result.success) {
        form.reset();
      }
    });
  }

  return (
    <div className="border border-neutral-300 bg-white p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="cv-file-input"
            className="text-sm font-semibold text-neutral-900"
          >
            Subir / Actualizar CV (PDF)
          </label>
          <span className="text-xs text-neutral-500">
            Destino: documents/cv_actual.pdf
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            id="cv-file-input"
            name="cv"
            type="file"
            accept="application/pdf,.pdf"
            required
            disabled={isPending}
            className="w-full flex-1 border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-800 file:mr-3 file:border-0 file:bg-neutral-900 file:px-3 file:py-1 file:text-xs file:font-medium file:text-white hover:file:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isPending}
            className="shrink-0 border border-neutral-900 bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Subiendo CV..." : "Subir / Actualizar CV (PDF)"}
          </button>
        </div>

        {state.success && state.message && (
          <p
            role="status"
            aria-live="polite"
            className="border border-neutral-900 bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-900"
          >
            {state.message}
          </p>
        )}

        {state.error && (
          <p
            role="alert"
            aria-live="polite"
            className="border border-neutral-900 bg-neutral-50 px-3 py-2 text-xs text-neutral-900"
          >
            {state.error}
          </p>
        )}
      </form>
    </div>
  );
}
