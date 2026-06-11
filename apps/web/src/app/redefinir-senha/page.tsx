"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RedefinirSenhaPage() {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");

    const supabase = createClient();
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=/nova-senha`
        : "/auth/callback?next=/nova-senha";

    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo },
    );

    setIsSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSent(true);
    setSuccessMessage(
      "Verifique seu e-mail para redefinir a senha.",
    );
  }

  return (
    <main className="login-page">
      <Card className="w-full max-w-[430px]">
        <CardHeader>
          <h1 className="text-2xl font-bold">Redefinir Senha</h1>
          <p className="text-sm text-muted-foreground">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
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
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || sent}
            >
              {isSubmitting ? "Enviando..." : "Recuperar senha"}
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
