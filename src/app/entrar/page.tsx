"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EntrarPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (authError) {
      setError("E-mail ou senha invalidos.");
      return;
    }

    router.refresh();
    router.push("/animais");
  }

  return (
    <main className="login-page">
      <Card className="w-full max-w-[430px]">
        <CardHeader>
          <h1 className="text-2xl font-bold">Bem-vindo!</h1>
          <p className="text-sm text-muted-foreground">
            Entre com sua conta para ver os animais disponiveis.
          </p>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail
                  aria-hidden
                  size={18}
                  className="absolute left-3 top-3 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="email"
                  className="pl-9"
                  name="email"
                  required
                  type="email"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="/redefinir-senha"
                  className="text-xs text-primary hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  aria-hidden
                  size={18}
                  className="absolute left-3 top-3 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="password"
                  className="pl-9"
                  name="password"
                  required
                  type="password"
                  placeholder="Sua senha"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Nao tem uma conta?{" "}
            <Link href="/cadastro" className="text-primary hover:underline font-medium">
              Cadastre-se
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
