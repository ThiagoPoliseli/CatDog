import { NextResponse } from "next/server";
import { createAdoptionRequest } from "@/lib/store";
import { adoptionRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = adoptionRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Dados invalidos." },
      { status: 400 },
    );
  }

  try {
    await createAdoptionRequest(parsed.data);
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
