import { test as setup, expect } from "@playwright/test";
import path from "path";
import { mkdir } from "fs/promises";

// Configure: TEST_USER_EMAIL e TEST_USER_PASSWORD no .env
const AUTH_FILE = path.join(process.cwd(), ".playwright", "user.json");

setup("autenticar usuario de teste", async ({ page }) => {
  await mkdir(path.dirname(AUTH_FILE), { recursive: true });

  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    console.warn(
      "\n[setup:user] TEST_USER_EMAIL / TEST_USER_PASSWORD nao definidos." +
        "\nDefina no .env para executar testes autenticados.\n",
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
