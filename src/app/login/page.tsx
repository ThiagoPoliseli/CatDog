import { Lock, Mail } from "lucide-react";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <main className="login-page">
      <Card className="w-full max-w-[430px]">
        <CardHeader>
          <h1 className="text-2xl font-bold">Entrar no CatDog</h1>
          <p className="text-sm text-muted-foreground">
            Acesse a area administrativa para gerenciar animais, dados auxiliares
            e solicitacoes de adocao.
          </p>
        </CardHeader>
        <CardContent>
          {params.error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>E-mail ou senha invalidos.</AlertDescription>
            </Alert>
          ) : null}

          <form action={loginAction} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail
                  aria-hidden
                  size={18}
                  className="absolute left-3 top-3 text-muted-foreground"
                />
                <Input
                  id="email"
                  className="pl-9"
                  defaultValue="admin@catdog.local"
                  name="email"
                  required
                  type="email"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock
                  aria-hidden
                  size={18}
                  className="absolute left-3 top-3 text-muted-foreground"
                />
                <Input
                  id="password"
                  className="pl-9"
                  defaultValue="admin123"
                  name="password"
                  required
                  type="password"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
