"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  HeartHandshake,
  Lock,
  Mail,
  PawPrint,
  ShieldCheck,
  Sparkles,
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

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/animais";
  }

  if (value.startsWith("/entrar") || value.startsWith("/cadastro")) {
    return "/animais";
  }

  return value;
}

export default function EntrarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(
    () => getSafeNext(searchParams.get("next")),
    [searchParams],
  );
  const signup = useMemo(() => searchParams.get("signup"), [searchParams]);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (authError) {
      setError("E-mail ou senha invalidos. Crie uma conta se ainda nao tiver acesso.");
      return;
    }

    router.refresh();
    router.push(next);
  }

  return (
    <main className="auth-shell">
      <section className="auth-copy" aria-label="Boas-vindas ao CatDog">
        <Badge variant="species" className="w-fit">
          <Sparkles size={14} aria-hidden />
          Acesso exclusivo para contas CatDog
        </Badge>
        <div>
          <h1>Entre para encontrar seu novo companheiro.</h1>
          <p>
            Crie uma conta ou acesse seu perfil para ver animais disponiveis,
            enviar solicitacoes e acompanhar cada etapa da adocao.
          </p>
        </div>
        <div className="auth-benefits">
          <span>
            <ShieldCheck size={18} aria-hidden />
            Plataforma protegida por login
          </span>
          <span>
            <HeartHandshake size={18} aria-hidden />
            Historico de solicitacoes
          </span>
          <span>
            <PawPrint size={18} aria-hidden />
            Catalogo completo apos cadastro
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
          <CardTitle className="text-2xl">Entrar na plataforma</CardTitle>
          <CardDescription>
            Use sua conta para acessar o catalogo e suas solicitacoes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {signup ? (
            <Alert variant="success" className="mb-4">
              <AlertDescription>
                Conta criada! Se não receber o e-mail, verifique sua caixa de spam.
              </AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit} className="grid gap-4">
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
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="/redefinir-senha"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
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
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Sua senha"
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-5 grid gap-3 text-center text-sm text-muted-foreground">
            <p>Para acessar a plataforma, primeiro crie sua conta.</p>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/cadastro?next=${encodeURIComponent(next)}`}>
                Criar conta
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
