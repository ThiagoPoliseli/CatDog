import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, LogIn, PawPrint, Shield, UserPlus } from "lucide-react";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { userSignOutAction } from "@/app/entrar/actions";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { isAdminUser } from "@/lib/admin";

export const metadata: Metadata = {
  title: "CatDog",
  description: "Plataforma simples para adocao de caes e gatos.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = isAdminUser(user);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <div className="shell">
          <header className="topbar">
            <Link className="brand" href={user ? "/animais" : "/entrar"}>
              <span className="brand-mark">
                <PawPrint size={20} aria-hidden />
              </span>
              CatDog
            </Link>
            <nav className="nav" aria-label="Navegacao principal">
              <DarkModeToggle />
              {user ? (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/animais">
                      <PawPrint size={16} aria-hidden />
                      Animais
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/minhas-solicitacoes">
                      <ClipboardList size={16} aria-hidden />
                      Minhas solicitacoes
                    </Link>
                  </Button>
                  {isAdmin ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/admin">
                        <Shield size={16} aria-hidden />
                        Admin
                      </Link>
                    </Button>
                  ) : null}
                  <form action={userSignOutAction}>
                    <Button variant="outline" size="sm" type="submit">
                      Sair
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/cadastro">
                      <UserPlus size={16} aria-hidden />
                      Criar conta
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/entrar">
                      <LogIn size={16} aria-hidden />
                      Entrar
                    </Link>
                  </Button>
                </>
              )}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
