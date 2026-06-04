import { test, expect } from "@playwright/test";

test.describe("Solicitacao de adocao", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/animais");
    if (page.url().includes("/entrar")) {
      test.skip(true, "Solicitacoes exigem usuario autenticado.");
    }
    await page.waitForSelector("section.animal-grid, .empty", { state: "visible" });

    const interestButton = page
      .locator("section.animal-grid article")
      .filter({ has: page.locator("button", { hasText: "Tenho interesse" }) })
      .locator("button", { hasText: "Tenho interesse" })
      .first();

    const hasAvailable = await interestButton.isVisible().catch(() => false);
    if (!hasAvailable) {
      test.skip();
      return;
    }

    await interestButton.click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("submissao valida — exibe mensagem de sucesso", async ({ page }) => {
    await page.route("/api/adoption-requests", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Solicitacao registrada." }),
      });
    });

    const dialog = page.getByRole("dialog");

    await dialog.locator('input[name="adopterName"]').fill("Maria Oliveira");
    await dialog.locator('input[name="email"]').fill("maria@example.com");
    await dialog.locator('input[name="phone"]').fill("11987654321");
    await dialog.locator('textarea[name="message"]').fill("Adoro animais e tenho espaco em casa.");

    await dialog.locator('button[type="submit"]').click();

    await expect(page.getByText("Solicitacao enviada")).toBeVisible();
  });

  test("validacao de campos obrigatorios — form invalido sem preenchimento", async ({
    page,
  }) => {
    const dialog = page.getByRole("dialog");

    const isValid = await dialog.locator("form").evaluate((form) => {
      return (form as HTMLFormElement).checkValidity();
    });

    expect(isValid).toBe(false);
  });

  test("erro da API — exibe mensagem de erro retornada pela API", async ({ page }) => {
    await page.route("/api/adoption-requests", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ message: "Este animal ja foi adotado." }),
      });
    });

    const dialog = page.getByRole("dialog");

    await dialog.locator('input[name="adopterName"]').fill("Joao Silva");
    await dialog.locator('input[name="email"]').fill("joao@example.com");
    await dialog.locator('input[name="phone"]').fill("11912345678");
    await dialog.locator('textarea[name="message"]').fill("Tenho muito carinho por animais.");

    await dialog.locator('button[type="submit"]').click();

    await expect(page.getByText("Este animal ja foi adotado")).toBeVisible();
  });
});
