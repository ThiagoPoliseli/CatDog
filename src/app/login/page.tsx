import { Lock, Mail } from "lucide-react";
import { loginAction } from "./actions";

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <main className="login-page">
      <section className="login-box">
        <h1>Entrar no CatDog</h1>
        <p className="muted">
          Acesse a area administrativa para gerenciar animais, dados auxiliares
          e solicitacoes de adocao.
        </p>

        {params.error ? (
          <div className="message error">E-mail ou senha invalidos.</div>
        ) : null}

        <form action={loginAction} className="form-grid">
          <label className="full">
            <span className="muted">E-mail</span>
            <div style={{ position: "relative" }}>
              <Mail
                aria-hidden
                size={18}
                style={{ left: 12, position: "absolute", top: 13 }}
              />
              <input
                className="field"
                defaultValue="admin@catdog.local"
                name="email"
                required
                style={{ paddingLeft: 38 }}
                type="email"
              />
            </div>
          </label>
          <label className="full">
            <span className="muted">Senha</span>
            <div style={{ position: "relative" }}>
              <Lock
                aria-hidden
                size={18}
                style={{ left: 12, position: "absolute", top: 13 }}
              />
              <input
                className="field"
                defaultValue="admin123"
                name="password"
                required
                style={{ paddingLeft: 38 }}
                type="password"
              />
            </div>
          </label>
          <button className="button full" type="submit">
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
