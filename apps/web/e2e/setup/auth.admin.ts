import { test as setup, expect } from "@playwright/test";
import path from "path";
import { mkdir } from "fs/promises";

// Configure: TEST_ADMIN_EMAIL e TEST_ADMIN_PASSWORD no .env
// TEST_ADMIN_EMAIL deve coincidir com a variavel ADMIN_EMAIL da aplicacao
const AUTH_FILE = path.join(process.cwd(), ".playwright", "admin.json");

setup("autenticar admin de teste", async ({ page }) => {
  await mkdir(path.dirname(AUTH_FILE), { recursive: true });

  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "\n[setup:admin] TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD nao definidos." +
        "\nDefina no .env para executar testes de admin.\n",
    );
    await page.goto("/entrar");
    await page.context().storageState({ path: AUTH_FILE });
    return;
  }

  await page.goto("/entrar");

  if (!page.url().includes("/entrar")) {
    await page.context().storageState({ path: AUTH_FILE });
    return;
  }

  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/animais/, { timeout: 15_000 });
  await page.context().storageState({ path: AUTH_FILE });
});
