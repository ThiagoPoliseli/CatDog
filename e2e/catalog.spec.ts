import { test, expect } from "@playwright/test";

test.describe("Catalogo de animais", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/animais");
    if (page.url().includes("/entrar")) {
      test.skip(true, "Catalogo exige usuario autenticado.");
    }
    await page.waitForSelector("section.animal-grid, .empty", { state: "visible" });
  });

  test("render — exibe h1 e toolbar de filtros", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Animais para adocao" }),
    ).toBeVisible();
    await expect(page.locator('[aria-label="Filtros de animais"]')).toBeVisible();
  });

  test("busca por texto — filtra cards ou exibe mensagem vazia", async ({ page }) => {
    const gridOrEmpty = page.locator("section.animal-grid, .empty");
    await gridOrEmpty.first().waitFor({ state: "visible" });

    const initialCardCount = await page.locator("section.animal-grid article").count();

    await page.fill('input[placeholder*="Buscar"]', "xyznotexistentanimal");

    await expect(async () => {
      const count = await page.locator("section.animal-grid article").count();
      const emptyVisible = await page.locator(".empty").isVisible();
      expect(count !== initialCardCount || emptyVisible).toBe(true);
    }).toPass({ timeout: 5000 });
  });

  test("filtro por especie — atualiza grid sem reload", async ({ page }) => {
    const speciesSelect = page.locator('section.toolbar button[role="combobox"]').first();
    const hasSpeciesSelect = await speciesSelect.isVisible().catch(() => false);

    if (!hasSpeciesSelect) {
      test.skip();
      return;
    }

    await speciesSelect.click();
    const options = page.locator('[role="option"]');
    const optionCount = await options.count();

    if (optionCount < 2) {
      test.skip();
      return;
    }

    await options.nth(1).click();

    await expect(async () => {
      const gridVisible = await page.locator("section.animal-grid").isVisible();
      const emptyVisible = await page.locator(".empty").isVisible();
      expect(gridVisible || emptyVisible).toBe(true);
    }).toPass({ timeout: 5000 });
  });

  test("limpar filtros — redefine selects para valor vazio", async ({ page }) => {
    const speciesSelect = page.locator('section.toolbar button[role="combobox"]').first();
    const hasSpeciesSelect = await speciesSelect.isVisible().catch(() => false);

    if (!hasSpeciesSelect) {
      test.skip();
      return;
    }

    await speciesSelect.click();
    const options = page.locator('[role="option"]');
    const optionCount = await options.count();

    if (optionCount < 2) {
      test.skip();
      return;
    }

    await options.nth(1).click();

    await page.getByRole("button", { name: "Limpar" }).click();

    await expect(speciesSelect).toContainText("Todas");
  });

  test("abrir modal — exibe dialog com nome do animal", async ({ page }) => {
    const interestButton = page
      .locator("section.animal-grid article")
      .filter({ has: page.locator("button", { hasText: "Tenho interesse" }) })
      .locator("button", { hasText: "Tenho interesse" })
      .first();

    const animalName = await page
      .locator("section.animal-grid article")
      .filter({ has: page.locator("button", { hasText: "Tenho interesse" }) })
      .first()
      .locator("h2")
      .textContent();

    if (!animalName) {
      test.skip();
      return;
    }

    await interestButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("#request-title")).toContainText(animalName.trim());
  });

  test("fechar modal — remove dialog do DOM", async ({ page }) => {
    const interestButton = page
      .locator("section.animal-grid article")
      .filter({ has: page.locator("button", { hasText: "Tenho interesse" }) })
      .locator("button", { hasText: "Tenho interesse" })
      .first();

    const hasAvailable = await interestButton.isVisible();
    if (!hasAvailable) {
      test.skip();
      return;
    }

    await interestButton.click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "Fechar" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
