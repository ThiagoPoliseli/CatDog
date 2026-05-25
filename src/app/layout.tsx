import type { Metadata } from "next";
import Link from "next/link";
import { LogIn, PawPrint } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CatDog",
  description: "Plataforma simples para adocao de caes e gatos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              <Link href="/login">
                <LogIn size={16} aria-hidden />
                Entrar
              </Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
