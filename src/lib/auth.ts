import { cookies } from "next/headers";

const cookieName = "catdog_admin";

export async function isAuthenticated() {
  const store = await cookies();
  return store.get(cookieName)?.value === "active";
}

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL ?? "admin@catdog.local",
    password: process.env.ADMIN_PASSWORD ?? "admin123",
  };
}

export async function signIn(email: string, password: string) {
  const credentials = getAdminCredentials();

  if (email !== credentials.email || password !== credentials.password) {
    return false;
  }

  const store = await cookies();
  store.set(cookieName, "active", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return true;
}

export async function signOut() {
  const store = await cookies();
  store.delete(cookieName);
}
