"use client";

import { useState, useTransition } from "react";
import {
  uploadCvAction,
  revalidateCvAction,
  type CvActionState,
} from "@/lib/actions/cv";
import {
  hasPdfMagicBytes,
  MAX_CV_FILE_BYTES,
  SERVER_ACTION_UPLOAD_LIMIT_BYTES,
} from "@/lib/media-validation";
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

    if (file.size > MAX_CV_FILE_BYTES) {
      setState({
        success: false,
        message: null,
        error: "El archivo PDF supera el tamaño máximo permitido (15 MB).",
      });
      return;
    }

    setState(initialState);

    startTransition(async () => {
      // para pdfs > 3.8 mb (límite de server actions / vercel functions), validamos magic bytes antes del upload directo
      if (file.size > SERVER_ACTION_UPLOAD_LIMIT_BYTES) {
        const headerBytes = new Uint8Array(
          await file.slice(0, 16).arrayBuffer()
        );
        if (!hasPdfMagicBytes(headerBytes)) {
          setState({
            success: false,
            message: null,
            error:
              "El contenido del archivo no corresponde a un documento PDF válido.",
          });
          return;
        }

        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload("cv_actual.pdf", file, {
            upsert: true,
            contentType: "application/pdf",
            cacheControl: "60",
          });

        if (uploadError) {
          setState({
            success: false,
            message: null,
            error:
              "No se pudo subir el CV en este momento. Inténtalo nuevamente.",
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
    <div className="border border-current p-5 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <label
            htmlFor="cv-file-input"
            className="font-heavy text-sm sm:text-base"
          >
            Actualizar CV (PDF)
          </label>
          <span className="font-roman text-sm italic opacity-75 sm:text-base">
            Destino: documents/cv_actual.pdf
          </span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            id="cv-file-input"
            name="cv"
            type="file"
            accept="application/pdf,.pdf"
            required
            disabled={isPending}
            className="min-h-12 w-full flex-1 border border-current bg-transparent px-3 py-2 font-roman text-sm file:mr-4 file:cursor-pointer file:border file:border-current file:bg-transparent file:px-3 file:py-1.5 file:font-heavy file:text-xs file:text-[var(--theme-fg)] hover:file:bg-[var(--theme-fg)] hover:file:text-[var(--theme-bg)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base sm:file:text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="hyper-link shrink-0 cursor-pointer font-heavy text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
          >
            {isPending ? "Subiendo CV..." : "Subir CV >"}
          </button>
        </div>

        {state.success && state.message && (
          <p
            role="status"
            aria-live="polite"
            className="border border-current px-4 py-3 font-roman text-sm sm:text-base"
          >
            <span className="font-heavy">Confirmado:</span> {state.message}
          </p>
        )}

        {state.error && (
          <p
            role="alert"
            aria-live="polite"
            className="border border-current px-4 py-3 font-roman text-sm sm:text-base"
          >
            <span className="font-heavy">Error:</span> {state.error}
          </p>
        )}
      </form>
    </div>
  );
}
