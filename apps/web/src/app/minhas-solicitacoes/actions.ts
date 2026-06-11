"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateAdoptionRequestStatus } from "@/lib/store";

const CANCELLABLE_STATUSES = ["received", "reviewing"];

export async function cancelAdoptionRequestAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const id = String(formData.get("id") ?? "");

  const { data: request } = await supabase
    .from("adoption_requests")
    .select("status, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!request || !CANCELLABLE_STATUSES.includes(request.status)) {
    return;
  }

  await updateAdoptionRequestStatus(id, "cancelled");
  revalidatePath("/minhas-solicitacoes");
}
