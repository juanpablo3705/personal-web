"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { uploadMediaAction } from "@/lib/actions/posts";
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
          "min-h-[320px] w-full px-4 py-3 text-sm leading-relaxed text-neutral-900 focus:outline-none [&_p]:mb-3 [&_a]:underline [&_a]:font-medium [&_img]:my-4 [&_img]:max-w-full [&_img]:h-auto [&_img]:border [&_img]:border-neutral-300",
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

    const formattedUrl =
      /^(https?:\/\/|mailto:|tel:|\/)/i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;

    if (editor.state.selection.empty && !editor.isActive("link")) {
      editor
        .chain()
        .focus()
        .insertContent(
          `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${formattedUrl}</a>`
        )
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
      let imageUrl: string | null = null;

      if (file.size <= 900 * 1024) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("folder", "content");
        const result = await uploadMediaAction(formData);
        if (result.error) {
          throw new Error(result.error);
        }
        imageUrl = result.url;
      } else {
        const supabase = createClient();
        const filePath = `content/${Date.now()}-${sanitizeFileName(file.name)}`;
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
    <div className="border border-neutral-300 bg-white">
      {/* Barra de herramientas superior ultra-minimalista: SOLO 5 botones */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-300 bg-neutral-50 p-2">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
          aria-pressed={isBold}
          className={`border px-3 py-1 text-xs font-medium transition-colors ${
            isBold
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900 hover:bg-neutral-100"
          }`}
        >
          Negrita
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor}
          aria-pressed={isItalic}
          className={`border px-3 py-1 text-xs font-medium italic transition-colors ${
            isItalic
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900 hover:bg-neutral-100"
          }`}
        >
          Cursiva
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          disabled={!editor}
          aria-pressed={isUnderline}
          className={`border px-3 py-1 text-xs font-medium underline transition-colors ${
            isUnderline
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900 hover:bg-neutral-100"
          }`}
        >
          Subrayado
        </button>

        <button
          type="button"
          onClick={handleSetLink}
          disabled={!editor}
          aria-pressed={isLink}
          className={`border px-3 py-1 text-xs font-medium transition-colors ${
            isLink
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900 hover:bg-neutral-100"
          }`}
        >
          Enlace
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!editor || isUploadingImage}
          className="border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploadingImage ? "Subiendo imagen..." : "Insertar Imagen"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFileChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {uploadError && (
        <div
          role="alert"
          className="border-b border-neutral-300 bg-neutral-100 px-3 py-2 text-xs text-neutral-900"
        >
          {uploadError}
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
