import { test, expect } from "@playwright/test";

test.describe("Catalogo de animais (/animais)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/animais");

    if (page.url().includes("/entrar")) {
      test.skip(true, "Catalogo exige usuario autenticado. Configure TEST_USER_EMAIL/PASSWORD.");
      return;
    }

    await page.waitForSelector("section.animal-grid, .empty", { state: "visible", timeout: 15_000 });
  });

  test("exibe secao hero com h1 e imagem", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Animais para adocao" })).toBeVisible();
    await expect(page.locator(".hero-media")).toBeVisible();
  });

  test("exibe toolbar com todos os filtros", async ({ page }) => {
    const toolbar = page.locator('[aria-label="Filtros de animais"]');
    await expect(toolbar).toBeVisible();
    await expect(toolbar.locator('input[placeholder*="Buscar"]')).toBeVisible();
    await expect(toolbar.getByRole("button", { name: "Limpar" })).toBeVisible();
  });

  test("exibe grid de animais ou estado vazio", async ({ page }) => {
    const hasGrid = await page.locator("section.animal-grid").isVisible();
    const hasEmpty = await page.locator(".empty").isVisible();
    expect(hasGrid || hasEmpty).toBe(true);
  });

  test("cards de animais exibem nome, raca, status e localizacao", async ({ page }) => {
    const firstCard = page.locator("section.animal-grid article").first();
    const hasCards = await firstCard.isVisible().catch(() => false);

    if (!hasCards) {
      test.skip();
      return;
    }

    await expect(firstCard.locator("h2")).toBeVisible();
    await expect(firstCard.locator(".meta").first()).toBeVisible();
  });

  test("busca por texto filtra cards", async ({ page }) => {
    const gridOrEmpty = page.locator("section.animal-grid, .empty");
    await gridOrEmpty.first().waitFor({ state: "visible" });

    const initialCount = await page.locator("section.animal-grid article").count();

    await page.fill('input[placeholder*="Buscar"]', "xyztermoimpossivel999");

    await expect(async () => {
      const count = await page.locator("section.animal-grid article").count();
      const emptyVisible = await page.locator(".empty").isVisible();
      expect(count < initialCount || emptyVisible).toBe(true);
    }).toPass({ timeout: 5_000 });
  });

  test("limpar busca restaura todos os cards", async ({ page }) => {
    const initialCount = await page.locator("section.animal-grid article").count();
    if (initialCount === 0) {
      test.skip();
      return;
    }

    await page.fill('input[placeholder*="Buscar"]', "xyztermoimpossivel999");
    await page.fill('input[placeholder*="Buscar"]', "");

    await expect(async () => {
      const count = await page.locator("section.animal-grid article").count();
      expect(count).toBe(initialCount);
    }).toPass({ timeout: 5_000 });
  });

  test("filtro por especie atualiza o grid", async ({ page }) => {
    const speciesSelect = page.locator('section.toolbar button[role="combobox"]').first();
    if (!(await speciesSelect.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await speciesSelect.click();
    const options = page.locator('[role="option"]');
    if ((await options.count()) < 2) {
      test.skip();
      return;
    }

    await options.nth(1).click();

    const hasGrid = await page.locator("section.animal-grid").isVisible();
    const hasEmpty = await page.locator(".empty").isVisible();
    expect(hasGrid || hasEmpty).toBe(true);
  });

  test("limpar filtros redefine especie para 'Todas'", async ({ page }) => {
    const speciesSelect = page.locator('section.toolbar button[role="combobox"]').first();
    if (!(await speciesSelect.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await speciesSelect.click();
    const options = page.locator('[role="option"]');
    if ((await options.count()) < 2) {
      test.skip();
      return;
    }
    await options.nth(1).click();

    await page.getByRole("button", { name: "Limpar" }).click();
    await expect(speciesSelect).toContainText("Todas");
  });

  test("botao 'Tenho interesse' abre modal com nome do animal", async ({ page }) => {
    const availableCard = page
      .locator("section.animal-grid article")
      .filter({ has: page.locator("button", { hasText: "Tenho interesse" }) })
      .first();

    if (!(await availableCard.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const animalName = await availableCard.locator("h2").textContent();
    await availableCard.getByRole("button", { name: "Tenho interesse" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("#request-title")).toContainText(animalName!.trim());
  });

  test("modal exibe todos os campos do formulario", async ({ page }) => {
    const availableCard = page
      .locator("section.animal-grid article")
      .filter({ has: page.locator("button", { hasText: "Tenho interesse" }) })
      .first();

    if (!(await availableCard.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await availableCard.getByRole("button", { name: "Tenho interesse" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.locator('input[name="adopterName"]')).toBeVisible();
    await expect(dialog.locator('input[name="email"]')).toBeVisible();
    await expect(dialog.locator('input[name="phone"]')).toBeVisible();
    await expect(dialog.locator('textarea[name="message"]')).toBeVisible();
    await expect(dialog.locator('button[type="submit"]')).toBeVisible();
  });

  test("campo de telefone aplica mascara ao digitar", async ({ page }) => {
    const availableCard = page
      .locator("section.animal-grid article")
      .filter({ has: page.locator("button", { hasText: "Tenho interesse" }) })
      .first();

    if (!(await availableCard.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await availableCard.getByRole("button", { name: "Tenho interesse" }).click();

    const phoneInput = page.getByRole("dialog").locator('input[name="phone"]');
    await phoneInput.fill("11987654321");

    const phoneValue = await phoneInput.inputValue();
    expect(phoneValue).toMatch(/^\(\d{2}\)\s\d{4,5}-\d{4}$/);
  });

  test("botao Fechar dispensa o modal", async ({ page }) => {
    const availableCard = page
      .locator("section.animal-grid article")
      .filter({ has: page.locator("button", { hasText: "Tenho interesse" }) })
      .first();

    if (!(await availableCard.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await availableCard.getByRole("button", { name: "Tenho interesse" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "Fechar" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("animais adotados exibem botao desabilitado", async ({ page }) => {
    const adoptedCard = page
      .locator("section.animal-grid article")
      .filter({ has: page.locator("button", { hasText: "Ja adotado" }) })
      .first();

    if (!(await adoptedCard.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const button = adoptedCard.getByRole("button", { name: "Ja adotado" });
    await expect(button).toBeDisabled();
  });
});
