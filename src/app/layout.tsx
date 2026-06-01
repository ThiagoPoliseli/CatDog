import type { Metadata } from "next";
import Link from "next/link";
import { LogIn, PawPrint } from "lucide-react";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { userSignOutAction } from "@/app/entrar/actions";

export const metadata: Metadata = {
  title: "CatDog",
  description: "Plataforma simples para adocao de caes e gatos.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="pt-BR">
      <body>
        <div className="shell">
          <header className="topbar">
            <Link className="brand" href="/animais">
              <span className="brand-mark">
                <PawPrint size={20} aria-hidden />
              </span>
              CatDog
            </Link>
            <nav className="nav" aria-label="Navegacao principal">
              <Link href="/animais">Animais</Link>
              <Link href="/admin">Admin</Link>
              {user ? (
                <>
                  <Link href="/minhas-solicitacoes">Minhas Solicitacoes</Link>
                  <form action={userSignOutAction}>
                    <button type="submit">Sair</button>
                  </form>
                </>
              ) : (
                <Link href="/entrar">
                  <LogIn size={16} aria-hidden />
                  Entrar
                </Link>
              )}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
