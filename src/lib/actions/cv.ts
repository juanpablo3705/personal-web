"use server";

import { revalidatePath } from "next/cache";
import { hasPdfMagicBytes, MAX_CV_FILE_BYTES } from "@/lib/media-validation";
import { getAuthenticatedAdmin } from "@/lib/supabase/admin-auth";

export type CvActionState = {
  success: boolean;
  message: string | null;
  error: string | null;
  publicUrl?: string | null;
};

export async function uploadCvAction(
  _prevState: CvActionState,
  formData: FormData
): Promise<CvActionState> {
  const { supabase, isAuthorized } = await getAuthenticatedAdmin();

  if (!isAuthorized) {
    return {
      success: false,
      message: null,
      error: "No tienes autorización para realizar esta acción.",
    };
  }

  const file = formData.get("cv") as File | null;

  if (!file || typeof file === "string" || file.size === 0) {
    return {
      success: false,
      message: null,
      error: "Por favor, selecciona un archivo PDF válido.",
    };
  }

  if (file.size > MAX_CV_FILE_BYTES) {
    return {
      success: false,
      message: null,
      error: "El archivo PDF supera el tamaño máximo permitido (15 MB).",
    };
  }

  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return {
      success: false,
      message: null,
      error: "El archivo debe estar en formato PDF (.pdf).",
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = new Uint8Array(arrayBuffer);

  if (!hasPdfMagicBytes(fileBuffer)) {
    return {
      success: false,
      message: null,
      error: "El contenido del archivo no corresponde a un documento PDF válido.",
    };
  }

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload("cv_actual.pdf", fileBuffer, {
      upsert: true,
      contentType: "application/pdf",
      cacheControl: "60",
    });

  if (uploadError) {
    console.error("[cv] Error al subir CV a Storage:", uploadError);
    return {
      success: false,
      message: null,
      error: "No se pudo subir el CV en este momento. Inténtalo nuevamente.",
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("documents").getPublicUrl("cv_actual.pdf");

  revalidatePath("/perfil");
  revalidatePath("/contacto");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "CV actualizado correctamente",
    error: null,
    publicUrl,
  };
}

export async function revalidateCvAction(): Promise<void> {
  const { isAuthorized } = await getAuthenticatedAdmin();
  if (!isAuthorized) {
    return;
  }
  revalidatePath("/perfil");
  revalidatePath("/contacto");
  revalidatePath("/dashboard");
}
