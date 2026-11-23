import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

function getConfiguredAdminEmail(): string | null {
  const email =
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.CONTACT_RECEIVER_EMAIL?.trim();
  return email ? email.toLowerCase() : null;
}

function getConfiguredAdminUserId(): string | null {
  const uid = process.env.ADMIN_USER_ID?.trim();
  return uid || null;
}

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  const allowedEmail = getConfiguredAdminEmail();
  if (!allowedEmail || !email) {
    return false;
  }
  return email.trim().toLowerCase() === allowedEmail;
}

export function isAdminUser(
  user: Pick<User, "id" | "email" | "email_confirmed_at"> | null | undefined
): boolean {
  if (!user?.email || !user.email_confirmed_at) {
    return false;
  }

  const allowedUid = getConfiguredAdminUserId();
  const allowedEmail = getConfiguredAdminEmail();

  // fail-closed: sin variables de entorno de administrador configuradas se deniega siempre
  if (!allowedUid && !allowedEmail) {
    return false;
  }

  if (allowedUid && user.id !== allowedUid) {
    return false;
  }

  if (allowedEmail && user.email.trim().toLowerCase() !== allowedEmail) {
    return false;
  }

  return true;
}

export async function getAuthenticatedAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !isAdminUser(user)) {
    return { supabase, user: null, isAuthorized: false as const };
  }

  return { supabase, user, isAuthorized: true as const };
}
