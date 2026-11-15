"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import TiptapEditor from "@/components/admin/TiptapEditor";
import {
  savePostAction,
  uploadMediaAction,
  type PostActionState,
} from "@/lib/actions/posts";
import { createClient } from "@/lib/supabase/client";
import type { Post, PostStatus, PostType } from "@/lib/types/database";

type PostEditorFormProps = {
  initialPost?: Post | null;
  defaultType?: PostType;
};

const initialActionState: PostActionState = {
  error: null,
};

function generateCleanSlug(text: string): string {
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

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");
}

export default function PostEditorForm({
  initialPost = null,
  defaultType = "blog",
}: PostEditorFormProps) {
  const [state, formAction, isSaving] = useActionState(
    savePostAction,
    initialActionState
  );

  const [type, setType] = useState<PostType>(initialPost?.type ?? defaultType);
  const [status, setStatus] = useState<PostStatus>(
    initialPost?.status ?? "draft"
  );
  const [title, setTitle] = useState<string>(initialPost?.title ?? "");
  const [slug, setSlug] = useState<string>(initialPost?.slug ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    initialPost?.thumbnail_url ?? ""
  );
  const [summary, setSummary] = useState<string>(initialPost?.summary ?? "");
  const [content, setContent] = useState<string>(initialPost?.content ?? "");

  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextTitle = event.target.value;
    setTitle(nextTitle);
    setSlug(generateCleanSlug(nextTitle));
  }

  async function handleThumbnailChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setThumbnailError(null);
    setIsUploadingThumbnail(true);

    try {
      let uploadedUrl: string | null = null;

      if (file.size <= 900 * 1024) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("folder", "thumbnails");
        const result = await uploadMediaAction(formData);
        if (result.error) {
          throw new Error(result.error);
        }
        uploadedUrl = result.url;
      } else {
        const supabase = createClient();
        const filePath = `thumbnails/${Date.now()}-${sanitizeFileName(file.name)}`;
        const { error: storageError } = await supabase.storage
          .from("media")
          .upload(filePath, file, {
            upsert: false,
            contentType: file.type,
          });

        if (storageError) {
          throw new Error(storageError.message);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("media").getPublicUrl(filePath);
        uploadedUrl = publicUrl;
      }

      if (uploadedUrl) {
        setThumbnailUrl(uploadedUrl);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al subir el thumbnail al bucket media.";
      setThumbnailError(msg);
    } finally {
      setIsUploadingThumbnail(false);
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {initialPost?.id && (
        <input type="hidden" name="id" value={initialPost.id} />
      )}
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />
      <input type="hidden" name="content" value={content} />

      {state?.error && (
        <div
          role="alert"
          className="border border-current bg-transparent px-4 py-3 font-roman text-sm sm:text-base"
        >
          {state.error}
        </div>
      )}

      {/* 1. Selector de Tipo y 2. Selector de Estado */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="type"
            className="block font-roman text-sm sm:text-base"
          >
            Tipo
          </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as PostType)}
            disabled={isSaving}
            className="w-full border border-current bg-[var(--theme-bg)] px-3 py-2 font-roman text-sm text-[var(--theme-fg)] focus:outline-none sm:text-base"
          >
            <option value="blog">Blog</option>
            <option value="project">Proyecto</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="status"
            className="block font-roman text-sm sm:text-base"
          >
            Estado
          </label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PostStatus)}
            disabled={isSaving}
            className="w-full border border-current bg-[var(--theme-bg)] px-3 py-2 font-roman text-sm text-[var(--theme-fg)] focus:outline-none sm:text-base"
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>
      </div>

      {/* 3. Campo Título (autogenera un slug limpio) */}
      <div className="space-y-1.5">
        <label
          htmlFor="title"
          className="block font-roman text-sm sm:text-base"
        >
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          onChange={handleTitleChange}
          placeholder="Escribe el título de la publicación..."
          disabled={isSaving}
          className="w-full border border-current bg-transparent px-3.5 py-2 font-roman text-sm placeholder:opacity-40 focus:outline-none sm:text-base"
        />
        <p className="font-roman text-xs opacity-75">
          Slug autogenerado:{" "}
          <span className="font-mono">
            /{type === "blog" ? "blog" : "proyectos"}/{slug || "..."}
          </span>
        </p>
      </div>

      {/* 4. Subida de Thumbnail (bucket media) */}
      <div className="space-y-2">
        <label
          htmlFor="thumbnail-input"
          className="block font-roman text-sm sm:text-base"
        >
          Subida de Thumbnail
        </label>
        <div className="border border-current bg-transparent p-4 space-y-3">
          <input
            id="thumbnail-input"
            name="thumbnail_file"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            disabled={isSaving || isUploadingThumbnail}
            className="w-full border border-current bg-transparent px-3 py-1.5 font-roman text-xs file:mr-3 file:cursor-pointer file:border file:border-current file:bg-[var(--theme-fg)] file:px-3 file:py-1 file:font-heavy file:text-xs file:text-[var(--theme-bg)]"
          />

          {isUploadingThumbnail && (
            <p className="font-roman text-xs opacity-75">
              Subiendo imagen al bucket media...
            </p>
          )}

          {thumbnailError && (
            <p role="alert" className="font-heavy text-xs">
              {thumbnailError}
            </p>
          )}

          {thumbnailUrl && (
            <div className="flex flex-wrap items-center gap-4 border-t border-current pt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt="Vista previa de thumbnail"
                className="h-20 w-20 border border-current bg-transparent object-cover"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-mono text-xs opacity-75">
                  {thumbnailUrl}
                </p>
                <button
                  type="button"
                  onClick={() => setThumbnailUrl("")}
                  className="hyper-link cursor-pointer font-heavy text-xs"
                >
                  Quitar thumbnail &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Campo Resumen Breve (textarea) */}
      <div className="space-y-1.5">
        <label
          htmlFor="summary"
          className="block font-roman text-sm sm:text-base"
        >
          Resumen Breve
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Texto breve que acompaña al thumbnail en el catálogo..."
          disabled={isSaving}
          className="w-full border border-current bg-transparent px-3.5 py-2 font-roman text-sm placeholder:opacity-40 focus:outline-none sm:text-base"
        />
      </div>

      {/* 6. Editor de Contenido (Tiptap minimalista) */}
      <div className="space-y-1.5">
        <label className="block font-roman text-sm sm:text-base">
          Contenido
        </label>
        <TiptapEditor content={content} onChange={setContent} />
      </div>

      {/* Controles de guardado */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-current pt-4">
        <Link
          href="/dashboard"
          className="hyper-link font-heavy text-sm sm:text-base"
        >
          &lt; Cancelar
        </Link>

        <button
          type="submit"
          disabled={isSaving || isUploadingThumbnail}
          className="hyper-link cursor-pointer font-heavy text-sm disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
        >
          {isSaving
            ? "Guardando... >"
            : initialPost
              ? "Actualizar entrada >"
              : "Guardar entrada >"}
        </button>
      </div>
    </form>
  );
}
