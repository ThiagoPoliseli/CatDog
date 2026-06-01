import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { logoutAction } from "./actions";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  return (
    <main className="admin-layout">
      <aside className="sidebar">
        <h2>CatDog Admin</h2>
        <nav aria-label="Navegacao administrativa">
          <Link href="/admin">Visao geral</Link>
          <Link href="/admin/animais">Animais</Link>
          <Link href="/admin/especies">Especies</Link>
          <Link href="/admin/racas">Racas</Link>
          <Link href="/admin/portes">Portes</Link>
          <Link href="/admin/solicitacoes">Solicitacoes</Link>
        </nav>
        <form action={logoutAction} style={{ marginTop: 20 }}>
          <Button variant="outline" type="submit">
            Sair
          </Button>
        </form>
      </aside>
      <section className="admin-content">{children}</section>
    </main>
  );
}
