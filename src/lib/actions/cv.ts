"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/supabase/admin-auth";

const MAX_CV_FILE_BYTES = 15 * 1024 * 1024; // 15 MB

export type CvActionState = {
  success: boolean;
  message: string | null;
  error: string | null;
  publicUrl?: string | null;
};

function hasPdfMagicBytes(buffer: Uint8Array): boolean {
  // Un archivo PDF real comienza con la secuencia ASCII "%PDF-" (0x25 0x50 0x44 0x46 0x2D)
  if (buffer.byteLength < 5) {
    return false;
  }
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  );
}

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
    });

  if (uploadError) {
    return {
      success: false,
      message: null,
      error: `Error al subir el CV: ${uploadError.message}`,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("documents").getPublicUrl("cv_actual.pdf");

  revalidatePath("/perfil");
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
  revalidatePath("/dashboard");
}
