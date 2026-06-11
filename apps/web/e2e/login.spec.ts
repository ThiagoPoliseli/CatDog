import { test, expect } from "@playwright/test";

test.describe("Pagina de login (/entrar)", () => {
  test("renderiza todos os elementos do formulario", async ({ page }) => {
    await page.goto("/entrar");

    await expect(page.getByText("Entrar na plataforma")).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Esqueceu a senha?" })).toBeVisible();
    // "Criar conta" aparece no nav E no card — pega o do card (main)
    await expect(page.locator("main").getByRole("link", { name: "Criar conta" })).toBeVisible();
  });

  test("credenciais invalidas exibem mensagem de erro", async ({ page }) => {
    await page.goto("/entrar");

    await page.fill('input[name="email"]', "inexistente@example.com");
    await page.fill('input[name="password"]', "senha-invalida-123");
    await page.click('button[type="submit"]');

    await expect(page.getByText("E-mail ou senha invalidos")).toBeVisible({ timeout: 15_000 });
  });

  test("botao desabilita durante o envio", async ({ page }) => {
    await page.goto("/entrar");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "qualquercoisa");
    await page.click('button[type="submit"]');

    await expect(
      page.locator('button[type="submit"]:has-text("Entrando...")'),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("link 'Criar conta' navega para /cadastro preservando next", async ({ page }) => {
    await page.goto("/entrar?next=%2Fanimais");

    await page.locator("main").getByRole("link", { name: "Criar conta" }).click();

    await expect(page).toHaveURL(/\/cadastro/);
    expect(page.url()).toContain("next=");
  });

  test("toggle de senha altera visibilidade do campo", async ({ page }) => {
    await page.goto("/entrar");

    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "Mostrar senha" }).click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: "Ocultar senha" }).click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("rota / redireciona usuario nao autenticado para /entrar", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/entrar/, { timeout: 10_000 });
  });

  test("rota /admin redireciona usuario nao autenticado para /entrar", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/entrar/, { timeout: 10_000 });
    const url = new URL(page.url());
    expect(url.searchParams.get("next")).toBe("/admin");
  });

  test("rota /minhas-solicitacoes redireciona usuario nao autenticado", async ({ page }) => {
    await page.goto("/minhas-solicitacoes");
    await expect(page).toHaveURL(/\/entrar/, { timeout: 10_000 });
  });
});

test.describe("Pagina de cadastro (/cadastro)", () => {
  test("renderiza todos os campos obrigatorios", async ({ page }) => {
    await page.goto("/cadastro");

    await expect(page.getByText("Criar conta").first()).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Criar conta" })).toBeVisible();
  });

  test("senhas diferentes exibem erro de validacao", async ({ page }) => {
    await page.goto("/cadastro");

    await page.fill('input[name="name"]', "Teste Usuario");
    await page.fill('input[name="email"]', "novo@example.com");
    await page.fill('input[name="password"]', "senha123");
    await page.fill('input[name="confirmPassword"]', "outrasenha");
    await page.click('button[type="submit"]');

    await expect(page.getByText("As senhas nao coincidem")).toBeVisible({ timeout: 5_000 });
  });

  test("senha curta falha validacao nativa do campo", async ({ page }) => {
    await page.goto("/cadastro");

    // O campo tem minLength=6; validacao nativa bloqueia submit antes do JS
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute("minlength", "6");

    await page.fill('input[name="name"]', "Teste");
    await page.fill('input[name="email"]', "novo@example.com");
    await page.fill('input[name="password"]', "abc");
    await page.fill('input[name="confirmPassword"]', "abc");

    const isInvalid = await passwordInput.evaluate(
      (el) => !(el as HTMLInputElement).checkValidity(),
    );
    expect(isInvalid).toBe(true);
  });

  test("nome vazio falha validacao nativa do campo", async ({ page }) => {
    await page.goto("/cadastro");

    // O campo tem required; validacao nativa bloqueia submit antes do JS
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute("required");

    const isInvalid = await nameInput.evaluate(
      (el) => !(el as HTMLInputElement).checkValidity(),
    );
    expect(isInvalid).toBe(true);
  });

  test("link 'Entrar' navega para /entrar", async ({ page }) => {
    await page.goto("/cadastro");

    // Usa o link dentro do main para evitar conflito com o nav
    await page.locator("main").getByRole("link", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/entrar/);
  });
});
