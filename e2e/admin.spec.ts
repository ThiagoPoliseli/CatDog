import { test, expect } from "@playwright/test";

test("redireciona para /login sem autenticacao", async ({ page }) => {
  await page.goto("/admin");

  await page.waitForURL(/\/login/);
  expect(page.url()).toContain("/login");
});

test("acessa /admin apos login", async ({ page }) => {
  await page.goto("/login");

  await page.fill('input[name="email"]', "admin@catdog.local");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/admin/);
  expect(page.url()).toContain("/admin");

  await expect(page.getByRole("heading", { name: "Visao geral" })).toBeVisible();
});
