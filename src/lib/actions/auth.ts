"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error: string | null;
};

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Por favor, ingresa tu correo electrónico.")
    .email("Ingresa un formato de correo electrónico válido."),
  password: z
    .string()
    .min(1, "Por favor, ingresa tu contraseña."),
});

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
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

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error:
        "Credenciales incorrectas. Verifica tu correo electrónico y contraseña.",
    };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export const signIn = loginAction;
export const signOut = logoutAction;
export const logout = logoutAction;
