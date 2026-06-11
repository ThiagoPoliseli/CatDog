import { test, expect } from "@playwright/test";

async function openAdoptionModal(page: import("@playwright/test").Page) {
  await page.goto("/animais");

  if (page.url().includes("/entrar")) {
    return false;
  }

  await page.waitForSelector("section.animal-grid, .empty", { state: "visible", timeout: 15_000 });

  const availableCard = page
    .locator("section.animal-grid article")
    .filter({ has: page.locator("button", { hasText: "Tenho interesse" }) })
    .first();

  if (!(await availableCard.isVisible().catch(() => false))) {
    return false;
  }

  await availableCard.getByRole("button", { name: "Tenho interesse" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  return true;
}

test.describe("Formulario de solicitacao de adocao", () => {
  test("form invalido sem preenchimento", async ({ page }) => {
    const opened = await openAdoptionModal(page);
    if (!opened) {
      test.skip();
      return;
    }

    const isValid = await page.getByRole("dialog").locator("form").evaluate((form) => {
      return (form as HTMLFormElement).checkValidity();
    });

    expect(isValid).toBe(false);
  });

  test("mascara de telefone formata corretamente (celular)", async ({ page }) => {
    const opened = await openAdoptionModal(page);
    if (!opened) {
      test.skip();
      return;
    }

    const phoneInput = page.getByRole("dialog").locator('input[name="phone"]');
    await phoneInput.fill("11987654321");

    const value = await phoneInput.inputValue();
    expect(value).toBe("(11) 98765-4321");
  });

  test("mascara de telefone formata corretamente (fixo)", async ({ page }) => {
    const opened = await openAdoptionModal(page);
    if (!opened) {
      test.skip();
      return;
    }

    const phoneInput = page.getByRole("dialog").locator('input[name="phone"]');
    await phoneInput.fill("1134567890");

    const value = await phoneInput.inputValue();
    expect(value).toBe("(11) 3456-7890");
  });

  test("submissao com dados validos exibe mensagem de sucesso (mock)", async ({ page }) => {
    const opened = await openAdoptionModal(page);
    if (!opened) {
      test.skip();
      return;
    }

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

    await expect(page.getByText("Solicitacao enviada")).toBeVisible({ timeout: 10_000 });
  });

  test("API retorna erro 400 — exibe mensagem da API", async ({ page }) => {
    const opened = await openAdoptionModal(page);
    if (!opened) {
      test.skip();
      return;
    }

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

    await expect(page.getByText("Este animal ja foi adotado")).toBeVisible({ timeout: 10_000 });
  });

  test("API retorna erro 401 — exibe mensagem de autenticacao", async ({ page }) => {
    const opened = await openAdoptionModal(page);
    if (!opened) {
      test.skip();
      return;
    }

    await page.route("/api/adoption-requests", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Autenticacao necessaria." }),
      });
    });

    const dialog = page.getByRole("dialog");
    await dialog.locator('input[name="adopterName"]').fill("Ana Costa");
    await dialog.locator('input[name="email"]').fill("ana@example.com");
    await dialog.locator('input[name="phone"]').fill("11944445555");
    await dialog.locator('textarea[name="message"]').fill("Gostaria muito de adotar.");
    await dialog.locator('button[type="submit"]').click();

    await expect(page.getByText("Autenticacao necessaria")).toBeVisible({ timeout: 10_000 });
  });

  test("botao Cancelar no modal fecha o dialog", async ({ page }) => {
    const opened = await openAdoptionModal(page);
    if (!opened) {
      test.skip();
      return;
    }

    await page.getByRole("dialog").getByRole("button", { name: "Cancelar" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("botao de submit desabilita durante envio", async ({ page }) => {
    const opened = await openAdoptionModal(page);
    if (!opened) {
      test.skip();
      return;
    }

    await page.route("/api/adoption-requests", async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    const dialog = page.getByRole("dialog");
    await dialog.locator('input[name="adopterName"]').fill("Carlos Lima");
    await dialog.locator('input[name="email"]').fill("carlos@example.com");
    await dialog.locator('input[name="phone"]').fill("11933334444");
    await dialog.locator('textarea[name="message"]').fill("Interesse em adocao responsavel.");

    const submitBtn = dialog.locator('button[type="submit"]');
    await submitBtn.click();

    await expect(page.getByRole("button", { name: "Enviando..." })).toBeVisible();
  });
});
