/**
 * URL pública del CV (bucket `documents/cv_actual.pdf`) con nombre de descarga
 * amigable. Compartida por /perfil y /contacto.
 */
const CV_PATH =
  "/storage/v1/object/public/documents/cv_actual.pdf?download=CV_JuanPabloOyanedel.pdf";

export function getCvPublicUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(
    /\/+$/,
    ""
  );

  return supabaseUrl ? `${supabaseUrl}${CV_PATH}` : CV_PATH;
}
