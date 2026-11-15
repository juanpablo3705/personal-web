import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const FALLBACK_ADMIN_EMAIL = "juanpablo3705@gmail.com";

export function getAllowedAdminEmail(): string {
  return (
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.CONTACT_RECEIVER_EMAIL?.trim() ||
    FALLBACK_ADMIN_EMAIL
  ).toLowerCase();
}

export function isAdminUser(user: Pick<User, "email"> | null | undefined): boolean {
  if (!user?.email) {
    return false;
  }
  return user.email.trim().toLowerCase() === getAllowedAdminEmail();
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
