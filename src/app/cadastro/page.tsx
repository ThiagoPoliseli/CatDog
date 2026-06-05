"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  PawPrint,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignUpFields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/animais";
  }

  if (value.startsWith("/entrar") || value.startsWith("/cadastro")) {
    return "/animais";
  }

  return value;
}

function extractFields(formData: FormData): SignUpFields {
  return {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
}

export default function CadastroPage() {
  const searchParams = useSearchParams();
  const next = useMemo(
    () => getSafeNext(searchParams.get("next")),
    [searchParams],
  );
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const { name, email, password, confirmPassword } = extractFields(
      new FormData(event.currentTarget),
    );

    if (name.length < 2) {
      setError("Informe seu nome para criar a conta.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas nao coincidem.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const result = (await response.json()) as { message?: string };

    if (!response.ok) {
      setIsSubmitting(false);
      setError(result.message ?? "Nao foi possivel criar a conta.");
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    window.location.assign(next);
  }

  return (
    <main className="auth-shell">
      <section className="auth-copy" aria-label="Cadastro CatDog">
        <Badge variant="available" className="w-fit">
          <CheckCircle2 size={14} aria-hidden />
          Cadastro gratuito
        </Badge>
        <div>
          <h1>Crie sua conta para acessar a plataforma.</h1>
          <p>
            O login protege os dados das solicitacoes e permite que voce
            acompanhe seus pedidos de adocao com mais clareza.
          </p>
        </div>
        <div className="auth-benefits">
          <span>
            <CheckCircle2 size={18} aria-hidden />
            Acesso ao catalogo completo
          </span>
          <span>
            <CheckCircle2 size={18} aria-hidden />
            Formularios preenchidos com seus dados
          </span>
          <span>
            <CheckCircle2 size={18} aria-hidden />
            Status das solicitacoes em um so lugar
          </span>
        </div>
      </section>

      <Card className="auth-card">
        <CardHeader>
          <div className="auth-brand">
            <span className="brand-mark">
              <PawPrint size={20} aria-hidden />
            </span>
            <span>CatDog</span>
          </div>
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>
            Preencha seus dados para liberar o acesso ao CatDog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <div className="relative">
                <User
                  aria-hidden
                  size={18}
                  className="pointer-events-none absolute left-3 top-3 text-muted-foreground"
                />
                <Input
                  id="name"
                  className="pl-9"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail
                  aria-hidden
                  size={18}
                  className="pointer-events-none absolute left-3 top-3 text-muted-foreground"
                />
                <Input
                  id="email"
                  className="pl-9"
                  name="email"
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock
                  aria-hidden
                  size={18}
                  className="pointer-events-none absolute left-3 top-3 text-muted-foreground"
                />
                <Input
                  id="password"
                  className="px-9"
                  name="password"
                  required
                  minLength={6}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Minimo de 6 caracteres"
                />
                <Button
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-1 top-1"
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOff size={16} aria-hidden />
                  ) : (
                    <Eye size={16} aria-hidden />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Lock
                  aria-hidden
                  size={18}
                  className="pointer-events-none absolute left-3 top-3 text-muted-foreground"
                />
                <Input
                  id="confirmPassword"
                  className="px-9"
                  name="confirmPassword"
                  required
                  minLength={6}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                />
                <Button
                  aria-label={
                    showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                  className="absolute right-1 top-1"
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} aria-hidden />
                  ) : (
                    <Eye size={16} aria-hidden />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Ja possui uma conta?{" "}
            <Link
              href={`/entrar?next=${encodeURIComponent(next)}`}
              className="font-medium text-primary hover:underline"
            >
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
