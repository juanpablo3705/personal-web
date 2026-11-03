/**
 * Formatea una fecha ISO (ej: "2026-11-03T04:20:50.089831+00:00")
 * al formato DD/MM/YYYY (ej: "03/11/2026") utilizando la zona horaria
 * de referencia ('America/Santiago') para evitar discrepancias de hidratación.
 */
export function formatBlogDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "";

    const parts = new Intl.DateTimeFormat("es-CL", {
      timeZone: "America/Santiago",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).formatToParts(date);

    const day = parts.find((p) => p.type === "day")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const year = parts.find((p) => p.type === "year")?.value;

    if (!day || !month || !year) return "";

    return `${day}/${month}/${year}`;
  } catch {
    return "";
  }
}
