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
          className="border border-neutral-900 bg-neutral-100 px-4 py-3 text-sm text-neutral-900"
        >
          {state.error}
        </div>
      )}

      {/* 1. Selector de Tipo y 2. Selector de Estado */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="type"
            className="block text-sm font-medium text-neutral-900"
          >
            Tipo
          </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as PostType)}
            disabled={isSaving}
            className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
          >
            <option value="blog">Blog</option>
            <option value="project">Proyecto</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-neutral-900"
          >
            Estado
          </label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PostStatus)}
            disabled={isSaving}
            className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
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
          className="block text-sm font-medium text-neutral-900"
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
          className="w-full border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
        />
        <p className="text-xs text-neutral-500">
          Slug autogenerado:{" "}
          <span className="font-mono text-neutral-800">
            /{type === "blog" ? "blog" : "proyectos"}/{slug || "..."}
          </span>
        </p>
      </div>

      {/* 4. Subida de Thumbnail (bucket media) */}
      <div className="space-y-2">
        <label
          htmlFor="thumbnail-input"
          className="block text-sm font-medium text-neutral-900"
        >
          Subida de Thumbnail
        </label>
        <div className="border border-neutral-300 bg-neutral-50 p-4 space-y-3">
          <input
            id="thumbnail-input"
            name="thumbnail_file"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            disabled={isSaving || isUploadingThumbnail}
            className="w-full border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-800 file:mr-3 file:border-0 file:bg-neutral-900 file:px-3 file:py-1 file:text-xs file:font-medium file:text-white hover:file:bg-neutral-800"
          />

          {isUploadingThumbnail && (
            <p className="text-xs text-neutral-600">
              Subiendo imagen al bucket media...
            </p>
          )}

          {thumbnailError && (
            <p role="alert" className="text-xs text-neutral-900 font-medium">
              {thumbnailError}
            </p>
          )}

          {thumbnailUrl && (
            <div className="flex flex-wrap items-center gap-4 border-t border-neutral-300 pt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt="Vista previa de thumbnail"
                className="h-20 w-20 border border-neutral-300 bg-white object-cover"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-mono text-xs text-neutral-600">
                  {thumbnailUrl}
                </p>
                <button
                  type="button"
                  onClick={() => setThumbnailUrl("")}
                  className="border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-800 hover:border-neutral-900"
                >
                  Quitar thumbnail
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
          className="block text-sm font-medium text-neutral-900"
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
          className="w-full border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
        />
      </div>

      {/* 6. Editor de Contenido (Tiptap minimalista) */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-neutral-900">
          Contenido
        </label>
        <TiptapEditor content={content} onChange={setContent} />
      </div>

      {/* Controles de guardado */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-300 pt-4">
        <Link
          href="/dashboard"
          className="border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:border-neutral-900 hover:bg-neutral-100"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={isSaving || isUploadingThumbnail}
          className="border border-neutral-900 bg-neutral-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving
            ? "Guardando..."
            : initialPost
              ? "Actualizar Entrada"
              : "Guardar Entrada"}
        </button>
      </div>
    </form>
  );
}
