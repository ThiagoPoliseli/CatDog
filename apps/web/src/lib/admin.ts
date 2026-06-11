import type { User } from "@supabase/supabase-js";

export function getAdminEmails() {
  return (process.env.ADMIN_EMAIL ?? "admin@catdog.local")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user: User | null) {
  const email = user?.email?.toLowerCase();

  if (!email) {
    return false;
  }

  return getAdminEmails().includes(email);
}
