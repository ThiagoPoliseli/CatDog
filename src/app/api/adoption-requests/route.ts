import { NextResponse } from "next/server";
import { createAdoptionRequest } from "@/lib/store";
import { adoptionRequestSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Autenticacao necessaria." },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parsed = adoptionRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Dados invalidos." },
      { status: 400 },
    );
  }

  try {
    await createAdoptionRequest({ ...parsed.data, userId: user.id });
    return NextResponse.json({ message: "Solicitacao registrada." });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Nao foi possivel registrar a solicitacao.",
      },
      { status: 400 },
    );
  }
}
