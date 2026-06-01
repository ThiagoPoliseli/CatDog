"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PawPrint } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

type SignUpFields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function extractFields(formData: FormData): SignUpFields {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
}

export default function CadastroPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const { name, email, password, confirmPassword } = extractFields(
      new FormData(event.currentTarget),
    );

    if (password !== confirmPassword) {
      setError("As senhas nao coincidem.");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    setIsSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.user?.identities?.length === 0) {
      setError("Este e-mail ja esta cadastrado. Tente fazer login.");
      return;
    }

    if (data.session) {
      router.refresh();
      router.push("/animais");
      return;
    }

    setSuccessMessage(
      "Conta criada! Verifique seu e-mail para confirmar o cadastro.",
    );
  }

  return (
    <main className="login-page">
      <Card className="w-full max-w-[430px]">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="brand-mark">
              <PawPrint size={20} aria-hidden />
            </span>
            <span className="text-lg font-extrabold">CatDog</span>
          </div>
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="text-sm text-muted-foreground">
            <Link href="/entrar" className="text-primary hover:underline">
              Ja possui uma conta? Entre aqui
            </Link>
          </p>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {successMessage ? (
            <Alert variant="success" className="mb-4">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Seu nome completo"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                required
                type="email"
                placeholder="seu@email.com"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                required
                type="password"
                placeholder="Crie uma senha"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                required
                type="password"
                placeholder="Repita a senha"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/entrar" className="text-primary hover:underline">
              Voltar
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
