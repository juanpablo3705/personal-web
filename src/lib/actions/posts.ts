"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  getImageExtension,
  hasValidImageMagicBytes,
  isSafeHttpsUrl,
  MAX_IMAGE_FILE_BYTES,
} from "@/lib/media-validation";
import { sanitizePostHtml } from "@/lib/sanitize-html";
import { getAuthenticatedAdmin } from "@/lib/supabase/admin-auth";
import type { PostStatus, PostType } from "@/lib/types/database";

const ALLOWED_MEDIA_FOLDERS = new Set(["thumbnails", "uploads", "content"]);
const MEDIA_PUBLIC_PREFIX = "/storage/v1/object/public/media/";

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

function extractMediaPathsFromText(text: string | null | undefined): string[] {
  if (!text) {
    return [];
  }

  const paths = new Set<string>();
  const pattern =
    /\/storage\/v1\/object\/public\/media\/([a-zA-Z0-9/_\-.]+)/g;

  for (const match of text.matchAll(pattern)) {
    const rawPath = match[1];
    if (rawPath && !rawPath.includes("..")) {
      paths.add(rawPath);
    }
  }

  return Array.from(paths);
}

const postIdSchema = z.uuid("Identificador de publicación inválido.");
const postStatusSchema = z.enum(["draft", "published"]);

const postSchema = z.object({
  id: z.uuid("Identificador de publicación inválido.").optional(),
  type: z.enum(["blog", "project"], {
    message: "Selecciona un tipo válido (Blog o Proyecto).",
  }),
  status: z.enum(["draft", "published"], {
    message: "Selecciona un estado válido (Borrador o Publicado).",
  }),
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio.")
    .max(300, "El título no puede superar los 300 caracteres."),
  slug: z.string().trim().max(200).optional(),
  summary: z.string().trim().max(3000).optional(),
  thumbnail_url: z
    .string()
    .trim()
    .max(2048)
    .refine(
      isSafeHttpsUrl,
      "La URL de la miniatura debe usar el protocolo HTTPS."
    )
    .optional(),
  content: z
    .string()
    .max(200_000, "El contenido supera el límite máximo permitido.")
    .optional(),
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

  const ext = getImageExtension(file.name);

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type) || !ext) {
    return {
      url: null,
      error:
        "Formato de imagen no permitido. Usa JPG, PNG, WEBP, GIF o AVIF.",
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = new Uint8Array(arrayBuffer);

  if (!hasValidImageMagicBytes(fileBuffer, file.type)) {
    return {
      url: null,
      error:
        "El contenido del archivo no corresponde a una imagen válida del formato indicado.",
    };
  }

  const baseName = createSlug(file.name.replace(/\.[^/.]+$/, "")) || "imagen";
  const filePath = `${folder}/${Date.now()}-${baseName}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(filePath, fileBuffer, {
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("[posts] Error al subir imagen a Storage:", uploadError);
    return {
      url: null,
      error: "No se pudo subir la imagen en este momento. Inténtalo nuevamente.",
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
  let previousSlug: string | null = null;

  if (parsed.data.id) {
    const { data: previousPost } = await supabase
      .from("posts")
      .select("slug")
      .eq("id", parsed.data.id)
      .maybeSingle();

    previousSlug = previousPost?.slug ?? null;

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
      console.error("[posts] Error al actualizar entrada:", updateError);
      return {
        error:
          "No se pudo actualizar la entrada en este momento. Inténtalo nuevamente.",
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
      console.error("[posts] Error al crear entrada:", insertError);
      return {
        error:
          "No se pudo crear la entrada en este momento. Inténtalo nuevamente.",
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/proyectos");
  revalidatePath(`/blog/${finalSlug}`);
  revalidatePath(`/proyectos/${finalSlug}`);
  if (previousSlug && previousSlug !== finalSlug) {
    revalidatePath(`/blog/${previousSlug}`);
    revalidatePath(`/proyectos/${previousSlug}`);
  }
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

  const parsedId = postIdSchema.safeParse(id);
  const parsedStatus = postStatusSchema.safeParse(currentStatus);

  if (!parsedId.success || !parsedStatus.success) {
    return { error: "Parámetros inválidos." };
  }

  const nextStatus: PostStatus =
    parsedStatus.data === "published" ? "draft" : "published";

  const { data: updatedPost, error } = await supabase
    .from("posts")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsedId.data)
    .select("slug, type")
    .maybeSingle();

  if (error) {
    console.error("[posts] Error al cambiar estado:", error);
    return {
      error: "No se pudo actualizar el estado de la publicación.",
    };
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/proyectos");
  if (updatedPost?.slug) {
    revalidatePath(
      updatedPost.type === "blog"
        ? `/blog/${updatedPost.slug}`
        : `/proyectos/${updatedPost.slug}`
    );
  }
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

  const parsedId = postIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { error: "Identificador de publicación inválido." };
  }

  const { data: targetPost } = await supabase
    .from("posts")
    .select("slug, type, thumbnail_url, content")
    .eq("id", parsedId.data)
    .maybeSingle();

  const candidatePaths = Array.from(
    new Set([
      ...extractMediaPathsFromText(targetPost?.thumbnail_url),
      ...extractMediaPathsFromText(targetPost?.content),
    ])
  );

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", parsedId.data);

  if (error) {
    console.error("[posts] Error al eliminar entrada:", error);
    return { error: "No se pudo eliminar la publicación." };
  }

  // limpieza best-effort de imágenes huérfanas del bucket media
  if (candidatePaths.length > 0) {
    try {
      const { data: otherPosts } = await supabase
        .from("posts")
        .select("thumbnail_url, content");

      const referencedUrls = (otherPosts ?? [])
        .map((p) => `${p.thumbnail_url ?? ""}\n${p.content ?? ""}`)
        .join("\n");

      const orphanPaths = candidatePaths.filter(
        (path) => !referencedUrls.includes(`${MEDIA_PUBLIC_PREFIX}${path}`)
      );

      if (orphanPaths.length > 0) {
        const { error: removeError } = await supabase.storage
          .from("media")
          .remove(orphanPaths);
        if (removeError) {
          console.error(
            "[posts] No se pudieron limpiar archivos huérfanos en Storage:",
            removeError
          );
        }
      }
    } catch (cleanupErr) {
      console.error("[posts] Error al limpiar archivos huérfanos:", cleanupErr);
    }
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/proyectos");
  if (targetPost?.slug) {
    revalidatePath(
      targetPost.type === "blog"
        ? `/blog/${targetPost.slug}`
        : `/proyectos/${targetPost.slug}`
    );
  }
  revalidatePath("/dashboard");

  return { error: null };
}
