"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const ok = await signIn(email, password);

  if (!ok) {
    redirect("/login?error=1");
  }

  redirect("/admin");
}
