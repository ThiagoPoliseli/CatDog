import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getAdminEmails } from "@/lib/admin";

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().email("Informe um e-mail valido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Dados invalidos." },
      { status: 400 },
    );
  }

  const supabase = getAdminClient();

  if (!supabase) {
    return NextResponse.json(
      {
        message:
          "Cadastro sem confirmacao por e-mail exige SUPABASE_SERVICE_ROLE_KEY no .env.",
      },
      { status: 500 },
    );
  }

  const { name, email, password } = parsed.data;
  const isReservedAdminEmail = getAdminEmails().includes(email.toLowerCase());

  if (isReservedAdminEmail) {
    return NextResponse.json(
      {
        message:
          "Este e-mail e reservado para o administrador. Crie a conta admin diretamente no Supabase.",
      },
      { status: 403 },
    );
  }

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (!error) {
    return NextResponse.json({ message: "Conta criada." });
  }

  const alreadyExists =
    error.message.toLowerCase().includes("already") ||
    error.message.toLowerCase().includes("registered");

  if (!alreadyExists) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Este e-mail ja esta cadastrado. Tente fazer login." },
    { status: 409 },
  );
}
