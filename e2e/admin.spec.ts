import { test, expect } from "@playwright/test";

test("redireciona admin sem autenticacao para /entrar", async ({ page }) => {
  await page.goto("/admin");

  await page.waitForURL(/\/entrar/);
  expect(page.url()).toContain("/entrar");
  expect(page.url()).toContain("next=%2Fadmin");
});
