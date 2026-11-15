"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAuthenticatedAdmin } from "@/lib/supabase/admin-auth";
import type { PostStatus, PostType } from "@/lib/types/database";

const ALLOWED_MEDIA_FOLDERS = new Set(["thumbnails", "uploads", "content"]);
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const ALLOWED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
]);
const MAX_IMAGE_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export type PostActionState = {
  error: string | null;
  success?: boolean;
};

export type MediaUploadResult = {
  url: string | null;
  error: string | null;
};

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Sanitiza el HTML generado por el editor antes de persistirlo en la base de datos:
 * elimina etiquetas ejecutables/embebidas peligrosas (<script>, <iframe>, <object>,
 * <embed>, <style>, <svg>, <math>, <form>) y atributos de ejecución (on*, srcdoc,
 * javascript:, data:text/html), preservando el formato editorial de Tiptap.
 */
function sanitizePostHtml(rawHtml: string): string {
  if (!rawHtml) return "";

  return rawHtml
    // 1. Eliminar bloques completos de etiquetas peligrosas con su contenido
    .replace(
      /<\s*(script|iframe|object|embed|style|svg|math|form|base|meta|link)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      ""
    )
    // 2. Eliminar etiquetas peligrosas huérfanas o auto-cerradas
    .replace(
      /<\s*\/?\s*(script|iframe|object|embed|style|svg|math|form|base|meta|link|input|button|textarea|select)\b[^>]*\/?>/gi,
      ""
    )
    // 3. Eliminar atributos de eventos inline (onload, onerror, onclick, etc.) y srcdoc/formaction
    .replace(
      /\s+(on[a-z]+|srcdoc|formaction)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
      ""
    )
    // 4. Neutralizar protocolos peligrosos (javascript:, vbscript:, data:text/html) en href/src
    .replace(
      /\s+(href|src|xlink:href|action)\s*=\s*(?:"\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^"]*"|'\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^']*'|(?:\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^\s>]+))/gi,
      ""
    );
}

const postSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["blog", "project"], {
    message: "Selecciona un tipo válido (Blog o Proyecto).",
  }),
  status: z.enum(["draft", "published"], {
    message: "Selecciona un estado válido (Borrador o Publicado).",
  }),
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio."),
  slug: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  thumbnail_url: z.string().trim().optional(),
  content: z.string().optional(),
});

export async function uploadMediaAction(
  formData: FormData
): Promise<MediaUploadResult> {
  const { supabase, isAuthorized } = await getAuthenticatedAdmin();

  if (!isAuthorized) {
    return {
      url: null,
      error: "No tienes autorización para subir archivos.",
    };
  }

  const file = formData.get("file") as File | null;
  const requestedFolder = String(formData.get("folder") ?? "uploads").trim();
  const folder = ALLOWED_MEDIA_FOLDERS.has(requestedFolder)
    ? requestedFolder
    : "uploads";

  if (!file || typeof file === "string" || file.size === 0) {
    return {
      url: null,
      error: "Selecciona una imagen válida.",
    };
  }

  if (file.size > MAX_IMAGE_FILE_BYTES) {
    return {
      url: null,
      error: "La imagen supera el tamaño máximo permitido (10 MB).",
    };
  }

  const rawExt = file.name.split(".").pop()?.toLowerCase() || "";
  const ext = ALLOWED_IMAGE_EXTENSIONS.has(rawExt) ? rawExt : "";

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type) || !ext) {
    return {
      url: null,
      error:
        "Formato de imagen no permitido. Usa JPG, PNG, WEBP, GIF o AVIF.",
    };
  }

  const baseName = createSlug(file.name.replace(/\.[^/.]+$/, "")) || "imagen";
  const filePath = `${folder}/${Date.now()}-${baseName}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(filePath, fileBuffer, {
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    return {
      url: null,
      error: `Error al subir imagen: ${uploadError.message}`,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(filePath);

  return {
    url: publicUrl,
    error: null,
  };
}

export async function savePostAction(
  _prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  const { supabase, isAuthorized } = await getAuthenticatedAdmin();

  if (!isAuthorized) {
    return {
      error: "No tienes autorización para guardar publicaciones.",
    };
  }

  const rawId = String(formData.get("id") ?? "").trim();
  const rawType = String(formData.get("type") ?? "blog").trim();
  const rawStatus = String(formData.get("status") ?? "draft").trim();
  const rawTitle = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const rawSummary = String(formData.get("summary") ?? "").trim();
  let rawThumbnailUrl = String(formData.get("thumbnail_url") ?? "").trim();
  const rawContent = String(formData.get("content") ?? "");

  const parsed = postSchema.safeParse({
    id: rawId || undefined,
    type: rawType,
    status: rawStatus,
    title: rawTitle,
    slug: rawSlug,
    summary: rawSummary,
    thumbnail_url: rawThumbnailUrl,
    content: rawContent,
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      error: firstIssue?.message ?? "Verifica los campos del formulario.",
    };
  }

  // Si se adjuntó un archivo de thumbnail directamente sin subir previamente
  const thumbnailFile = formData.get("thumbnail_file") as File | null;
  if (
    !rawThumbnailUrl &&
    thumbnailFile &&
    typeof thumbnailFile !== "string" &&
    thumbnailFile.size > 0
  ) {
    const uploadFormData = new FormData();
    uploadFormData.set("file", thumbnailFile);
    uploadFormData.set("folder", "thumbnails");
    const uploadResult = await uploadMediaAction(uploadFormData);
    if (uploadResult.error) {
      return { error: uploadResult.error };
    }
    if (uploadResult.url) {
      rawThumbnailUrl = uploadResult.url;
    }
  }

  const baseSlug =
    createSlug(parsed.data.slug || parsed.data.title) || `entrada-${Date.now()}`;

  // Asegurar que el slug sea único en la tabla posts
  let finalSlug = baseSlug;
  const { data: existingWithSlug } = await supabase
    .from("posts")
    .select("id, slug")
    .eq("slug", baseSlug)
    .maybeSingle();

  if (existingWithSlug && existingWithSlug.id !== parsed.data.id) {
    finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
  }

  const now = new Date().toISOString();
  const safeContent = sanitizePostHtml(parsed.data.content || "");

  if (parsed.data.id) {
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        type: parsed.data.type as PostType,
        status: parsed.data.status as PostStatus,
        title: parsed.data.title,
        slug: finalSlug,
        summary: parsed.data.summary || null,
        thumbnail_url: rawThumbnailUrl || null,
        content: safeContent,
        updated_at: now,
      })
      .eq("id", parsed.data.id);

    if (updateError) {
      return {
        error: `Error al actualizar la entrada: ${updateError.message}`,
      };
    }
  } else {
    const { error: insertError } = await supabase.from("posts").insert({
      type: parsed.data.type as PostType,
      status: parsed.data.status as PostStatus,
      title: parsed.data.title,
      slug: finalSlug,
      summary: parsed.data.summary || null,
      thumbnail_url: rawThumbnailUrl || null,
      content: safeContent,
      updated_at: now,
    });

    if (insertError) {
      return {
        error: `Error al crear la entrada: ${insertError.message}`,
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/proyectos");
  revalidatePath(`/blog/${finalSlug}`);
  revalidatePath(`/proyectos/${finalSlug}`);
  revalidatePath("/dashboard");

  redirect("/dashboard");
}

export async function togglePostStatusAction(
  id: string,
  currentStatus: PostStatus
): Promise<{ error: string | null }> {
  const { supabase, isAuthorized } = await getAuthenticatedAdmin();

  if (!isAuthorized) {
    return { error: "No autorizado." };
  }

  const nextStatus: PostStatus =
    currentStatus === "published" ? "draft" : "published";

  const { error } = await supabase
    .from("posts")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/proyectos");
  revalidatePath("/dashboard");

  return { error: null };
}

export async function deletePostAction(
  id: string
): Promise<{ error: string | null }> {
  const { supabase, isAuthorized } = await getAuthenticatedAdmin();

  if (!isAuthorized) {
    return { error: "No autorizado." };
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/proyectos");
  revalidatePath("/dashboard");

  return { error: null };
}
