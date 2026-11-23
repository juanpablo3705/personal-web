"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { isAdminUser, isAllowedAdminEmail } from "@/lib/supabase/admin-auth";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error: string | null;
};

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Por favor, ingresa tu correo electrónico.")
    .max(254, "El correo electrónico es demasiado largo.")
    .pipe(z.email("Ingresa un formato de correo electrónico válido.")),
  password: z
    .string()
    .min(1, "Por favor, ingresa tu contraseña.")
    .max(200, "La contraseña excede el largo máximo permitido."),
});

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const rateLimit = await checkRateLimit({
    namespace: "admin-login",
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return {
      error:
        "Demasiados intentos de inicio de sesión. Por favor, espera unos minutos antes de volver a intentarlo.",
    };
  }

  const rawData = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      error: firstIssue?.message ?? "Verifica los datos ingresados.",
    };
  }

  if (!isAllowedAdminEmail(parsed.data.email)) {
    return {
      error:
        "Credenciales incorrectas. Verifica tu correo electrónico y contraseña.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !isAdminUser(data.user)) {
    if (data?.user && !isAdminUser(data.user)) {
      await supabase.auth.signOut();
    }
    return {
      error:
        "Credenciales incorrectas. Verifica tu correo electrónico y contraseña.",
    };
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/login");
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
