import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("render — exibe h1, campos e botao de submit", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Entrar no CatDog" })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });

  test("login valido — redireciona para /admin", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "admin@catdog.local");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/admin/);
    expect(page.url()).toContain("/admin");
  });

  test("login invalido — exibe mensagem de erro", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "admin@catdog.local");
    await page.fill('input[name="password"]', "senha-errada");
    await page.click('button[type="submit"]');

    await expect(page.getByText("E-mail ou senha invalidos")).toBeVisible();
  });
});
