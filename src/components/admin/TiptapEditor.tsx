"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { uploadMediaAction } from "@/lib/actions/posts";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  getImageExtension,
  hasValidImageMagicBytes,
  IMAGE_INPUT_ACCEPT,
  MAX_IMAGE_FILE_BYTES,
  SERVER_ACTION_UPLOAD_LIMIT_BYTES,
} from "@/lib/media-validation";
import { createClient } from "@/lib/supabase/client";

type TiptapEditorProps = {
  content: string;
  onChange: (html: string) => void;
};

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
        codeBlock: false,
        code: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] w-full px-4 py-3 font-roman text-sm leading-relaxed text-[var(--theme-fg)] focus:outline-none sm:text-base [&_p]:mb-3 [&_a]:underline [&_a]:font-heavy [&_img]:my-4 [&_img]:max-w-full [&_img]:h-auto [&_img]:border [&_img]:border-current",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  function handleSetLink() {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href ?? "";
    const rawUrl = window.prompt(
      "Ingresa la URL del enlace (deja vacío para quitar el enlace):",
      previousUrl
    );

    if (rawUrl === null) {
      return;
    }

    const trimmed = rawUrl.trim();

    if (trimmed === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const formattedUrl = /^(https?:\/\/|mailto:|tel:|\/)/i.test(trimmed)
      ? trimmed
      : /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
        ? null
        : `https://${trimmed}`;

    if (!formattedUrl) {
      setUploadError(
        "Protocolo de enlace no permitido. Usa https://, http://, mailto:, tel: o una ruta relativa."
      );
      return;
    }

    setUploadError(null);

    if (editor.state.selection.empty && !editor.isActive("link")) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: formattedUrl,
          marks: [
            {
              type: "link",
              attrs: {
                href: formattedUrl,
                target: "_blank",
                rel: "noopener noreferrer",
              },
            },
          ],
        })
        .run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: formattedUrl,
        target: "_blank",
        rel: "noopener noreferrer",
      })
      .run();
  }

  async function handleImageFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    setUploadError(null);
    setIsUploadingImage(true);

    try {
      const ext = getImageExtension(file.name);
      if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type) || !ext) {
        throw new Error(
          "Formato de imagen no permitido. Usa JPG, PNG, WEBP, GIF o AVIF."
        );
      }

      if (file.size > MAX_IMAGE_FILE_BYTES) {
        throw new Error(
          "La imagen supera el tamaño máximo permitido (10 MB)."
        );
      }

      let imageUrl: string | null = null;

      if (file.size <= SERVER_ACTION_UPLOAD_LIMIT_BYTES) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("folder", "content");
        const result = await uploadMediaAction(formData);
        if (result.error) {
          throw new Error(result.error);
        }
        imageUrl = result.url;
      } else {
        const headerBytes = new Uint8Array(
          await file.slice(0, 32).arrayBuffer()
        );
        if (!hasValidImageMagicBytes(headerBytes, file.type)) {
          throw new Error(
            "El contenido del archivo no corresponde a una imagen válida."
          );
        }

        const supabase = createClient();
        const filePath = `content/${Date.now()}-${sanitizeFileName(file.name)}`;
        const { error: storageError } = await supabase.storage
          .from("media")
          .upload(filePath, file, {
            upsert: false,
            contentType: file.type,
          });

        if (storageError) {
          throw new Error("No se pudo subir la imagen en este momento.");
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("media").getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      if (imageUrl) {
        editor
          .chain()
          .focus()
          .setImage({ src: imageUrl, alt: file.name })
          .run();
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo subir la imagen al bucket media.";
      setUploadError(msg);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const isBold = editor?.isActive("bold") ?? false;
  const isItalic = editor?.isActive("italic") ?? false;
  const isUnderline = editor?.isActive("underline") ?? false;
  const isLink = editor?.isActive("link") ?? false;

  return (
    <div className="border border-current bg-transparent">
      {/* Barra de herramientas superior ultra-minimalista: SOLO 5 botones */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-current bg-transparent p-2">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
          aria-pressed={isBold}
          className={`cursor-pointer border border-current px-3 py-1 font-heavy text-xs transition-colors ${
            isBold
              ? "bg-[var(--theme-fg)] text-[var(--theme-bg)]"
              : "bg-transparent text-[var(--theme-fg)] hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)]"
          }`}
        >
          Negrita
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor}
          aria-pressed={isItalic}
          className={`cursor-pointer border border-current px-3 py-1 font-roman text-xs italic transition-colors ${
            isItalic
              ? "bg-[var(--theme-fg)] text-[var(--theme-bg)]"
              : "bg-transparent text-[var(--theme-fg)] hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)]"
          }`}
        >
          Cursiva
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          disabled={!editor}
          aria-pressed={isUnderline}
          className={`cursor-pointer border border-current px-3 py-1 font-roman text-xs underline transition-colors ${
            isUnderline
              ? "bg-[var(--theme-fg)] text-[var(--theme-bg)]"
              : "bg-transparent text-[var(--theme-fg)] hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)]"
          }`}
        >
          Subrayado
        </button>

        <button
          type="button"
          onClick={handleSetLink}
          disabled={!editor}
          aria-pressed={isLink}
          className={`cursor-pointer border border-current px-3 py-1 font-roman text-xs transition-colors ${
            isLink
              ? "bg-[var(--theme-fg)] text-[var(--theme-bg)]"
              : "bg-transparent text-[var(--theme-fg)] hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)]"
          }`}
        >
          Enlace
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!editor || isUploadingImage}
          className="cursor-pointer border border-current bg-transparent px-3 py-1 font-roman text-xs text-[var(--theme-fg)] transition-colors hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploadingImage ? "Subiendo imagen..." : "Insertar Imagen"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_INPUT_ACCEPT}
          onChange={handleImageFileChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {uploadError && (
        <div
          role="alert"
          className="border-b border-current bg-transparent px-3 py-2 font-roman text-xs text-[var(--theme-fg)]"
        >
          {uploadError}
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
