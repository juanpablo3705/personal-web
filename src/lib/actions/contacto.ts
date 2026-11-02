"use server";

import { Resend } from "resend";
import { z } from "zod";

export type ContactoFieldErrors = {
  nombre?: string;
  email?: string;
  asunto?: string;
  mensaje?: string;
};

export type ContactoFormValues = {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
};

export type ContactoActionState = {
  success: boolean;
  message: string | null;
  error: string | null;
  fieldErrors?: ContactoFieldErrors;
  values?: ContactoFormValues;
};

const contactoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "Por favor, ingresa tu nombre.")
    .max(120, "El nombre no puede superar los 120 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "Por favor, ingresa tu correo electrónico.")
    .email("Por favor, ingresa un correo electrónico válido."),
  asunto: z
    .string()
    .trim()
    .min(1, "Por favor, ingresa el asunto del mensaje.")
    .max(180, "El asunto no puede superar los 180 caracteres."),
  mensaje: z
    .string()
    .trim()
    .min(1, "Por favor, escribe tu mensaje.")
    .max(5000, "El mensaje no puede superar los 5000 caracteres."),
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendContactEmailAction(
  _prevState: ContactoActionState,
  formData: FormData
): Promise<ContactoActionState> {
  // NOTA FUTURA (Honeypot):
  // Si se habilita el campo oculto honeypot en el formulario de /contacto,
  // verificar aquí:
  // const honeypot = String(formData.get("website") ?? "").trim();
  // if (honeypot.length > 0) {
  //   return { success: true, message: "Tu mensaje ha sido enviado con éxito.", error: null };
  // }

  const rawValues: ContactoFormValues = {
    nombre: String(formData.get("nombre") ?? ""),
    email: String(formData.get("email") ?? ""),
    asunto: String(formData.get("asunto") ?? ""),
    mensaje: String(formData.get("mensaje") ?? ""),
  };

  const parsed = contactoSchema.safeParse(rawValues);

  if (!parsed.success) {
    const fieldErrors: ContactoFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const fieldName = issue.path[0] as keyof ContactoFieldErrors | undefined;
      if (fieldName && !fieldErrors[fieldName]) {
        fieldErrors[fieldName] = issue.message;
      }
    }

    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      message: null,
      error:
        firstIssue?.message ??
        "Por favor, revisa los campos del formulario e inténtalo nuevamente.",
      fieldErrors,
      values: rawValues,
    };
  }

  const { nombre, email, asunto, mensaje } = parsed.data;

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL?.trim();

  if (!resendApiKey || !receiverEmail) {
    return {
      success: false,
      message: null,
      error:
        "El servicio de correo no está configurado actualmente. Por favor, inténtalo más tarde.",
      values: rawValues,
    };
  }

  try {
    const resend = new Resend(resendApiKey);
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL?.trim() ||
      "Sitio Personal <onboarding@resend.dev>";

    const safeSubject = asunto.replace(/[\r\n]+/g, " ").trim();

    const { error: resendError } = await resend.emails.send({
      from: fromEmail,
      to: [receiverEmail],
      replyTo: email,
      subject: `[Contacto Web] ${safeSubject}`,
      text: [
        "Nuevo mensaje recibido desde el formulario de contacto:",
        "",
        `Nombre: ${nombre}`,
        `Correo electrónico: ${email}`,
        `Asunto: ${asunto}`,
        "",
        "Mensaje:",
        mensaje,
      ].join("\n"),
      html: `
        <div style="font-family: sans-serif; color: #171717; line-height: 1.6; max-width: 600px;">
          <h2 style="margin-bottom: 16px; border-bottom: 1px solid #d4d4d4; padding-bottom: 8px;">
            Nuevo mensaje de contacto
          </h2>
          <p style="margin: 4px 0;"><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
          <p style="margin: 4px 0;"><strong>Correo electrónico:</strong> ${escapeHtml(email)}</p>
          <p style="margin: 4px 0;"><strong>Asunto:</strong> ${escapeHtml(asunto)}</p>
          <div style="margin-top: 16px; padding: 12px; border: 1px solid #d4d4d4; background-color: #fafafa; white-space: pre-wrap;">${escapeHtml(mensaje)}</div>
        </div>
      `,
    });

    if (resendError) {
      return {
        success: false,
        message: null,
        error: `No se pudo enviar el mensaje: ${resendError.message}`,
        values: rawValues,
      };
    }

    return {
      success: true,
      message:
        "Tu mensaje ha sido enviado con éxito. Me pondré en contacto contigo a la brevedad.",
      error: null,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Ocurrió un error inesperado al enviar el correo.";

    return {
      success: false,
      message: null,
      error: `Error al enviar el mensaje: ${errorMessage}`,
      values: rawValues,
    };
  }
}
