import { test, expect } from "@playwright/test";

test.describe("Fluxo de acesso", () => {
  test("entrar renderiza formulario e chamada para cadastro", async ({ page }) => {
    await page.goto("/entrar");

    await expect(
      page.getByRole("heading", { name: "Entrar na plataforma" }),
    ).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Criar conta" })).toBeVisible();
  });

  test("cadastro renderiza campos obrigatorios", async ({ page }) => {
    await page.goto("/cadastro");

    await expect(page.getByRole("heading", { name: "Criar conta" })).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test("login invalido exibe mensagem de erro", async ({ page }) => {
    await page.goto("/entrar");

    await page.fill('input[name="email"]', "nao-existe@example.com");
    await page.fill('input[name="password"]', "senha-errada");
    await page.click('button[type="submit"]');

    await expect(page.getByText("E-mail ou senha invalidos")).toBeVisible();
  });
});
