export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export const ALLOWED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
]);

export const IMAGE_INPUT_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif";

export const MAX_IMAGE_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_CV_FILE_BYTES = 15 * 1024 * 1024;
export const SERVER_ACTION_UPLOAD_LIMIT_BYTES = Math.floor(3.8 * 1024 * 1024);

export function hasPdfMagicBytes(buffer: Uint8Array): boolean {
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

export function hasValidImageMagicBytes(
  buffer: Uint8Array,
  mimeType: string
): boolean {
  if (buffer.byteLength < 12) {
    return false;
  }

  switch (mimeType) {
    case "image/jpeg":
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    case "image/png":
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );

    case "image/gif": {
      const header = String.fromCharCode(
        buffer[0],
        buffer[1],
        buffer[2],
        buffer[3],
        buffer[4],
        buffer[5]
      );
      return header === "GIF87a" || header === "GIF89a";
    }

    case "image/webp": {
      const riff = String.fromCharCode(
        buffer[0],
        buffer[1],
        buffer[2],
        buffer[3]
      );
      const webp = String.fromCharCode(
        buffer[8],
        buffer[9],
        buffer[10],
        buffer[11]
      );
      return riff === "RIFF" && webp === "WEBP";
    }

    case "image/avif": {
      const boxType = String.fromCharCode(
        buffer[4],
        buffer[5],
        buffer[6],
        buffer[7]
      );
      if (boxType !== "ftyp") {
        return false;
      }
      const scanLength = Math.min(buffer.byteLength, 32);
      const brandChunk = String.fromCharCode(...buffer.slice(8, scanLength));
      return (
        brandChunk.includes("avif") ||
        brandChunk.includes("avis") ||
        brandChunk.includes("mif1")
      );
    }

    default:
      return false;
  }
}

export function isSafeHttpsUrl(value: string): boolean {
  if (!value) {
    return true;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getImageExtension(fileName: string): string {
  const rawExt = fileName.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_IMAGE_EXTENSIONS.has(rawExt) ? rawExt : "";
}
