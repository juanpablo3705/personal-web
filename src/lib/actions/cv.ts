"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
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
  revalidatePath("/perfil");
  revalidatePath("/dashboard");
}
