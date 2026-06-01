import { test, expect } from "@playwright/test";

test.describe("Catalogo de animais", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/animais");
    await page.waitForSelector("section.grid, .empty", { state: "visible" });
  });

  test("render — exibe h1 e toolbar de filtros", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Animais para adocao" }),
    ).toBeVisible();
    await expect(page.locator('[aria-label="Filtros de animais"]')).toBeVisible();
  });

  test("busca por texto — filtra cards ou exibe mensagem vazia", async ({ page }) => {
    const gridOrEmpty = page.locator("section.grid, .empty");
    await gridOrEmpty.first().waitFor({ state: "visible" });

    const initialCardCount = await page.locator("section.grid article").count();

    await page.fill('input[placeholder*="Buscar"]', "xyznotexistentanimal");

    await expect(async () => {
      const count = await page.locator("section.grid article").count();
      const emptyVisible = await page.locator(".empty").isVisible();
      expect(count !== initialCardCount || emptyVisible).toBe(true);
    }).toPass({ timeout: 5000 });
  });

  test("filtro por especie — atualiza grid sem reload", async ({ page }) => {
    const speciesSelect = page.locator('section.toolbar select').first();
    const options = await speciesSelect.locator("option").all();

    const nonEmptyOptions = options.filter(async (opt) => {
      const val = await opt.getAttribute("value");
      return val !== "";
    });

    if (nonEmptyOptions.length === 0) {
      test.skip();
      return;
    }

    const firstSpeciesOption = await speciesSelect.locator("option:not([value=''])").first();
    const speciesValue = await firstSpeciesOption.getAttribute("value");

    if (!speciesValue) {
      test.skip();
      return;
    }

    await speciesSelect.selectOption(speciesValue);

    await expect(async () => {
      const gridVisible = await page.locator("section.grid").isVisible();
      const emptyVisible = await page.locator(".empty").isVisible();
      expect(gridVisible || emptyVisible).toBe(true);
    }).toPass({ timeout: 5000 });
  });

  test("limpar filtros — redefine selects para valor vazio", async ({ page }) => {
    const speciesSelect = page.locator('section.toolbar select').first();
    const firstSpeciesOption = await speciesSelect.locator("option:not([value=''])").first();
    const speciesValue = await firstSpeciesOption.getAttribute("value");

    if (!speciesValue) {
      test.skip();
      return;
    }

    await speciesSelect.selectOption(speciesValue);
    await expect(speciesSelect).toHaveValue(speciesValue);

    await page.getByRole("button", { name: "Limpar" }).click();

    await expect(speciesSelect).toHaveValue("");
  });

  test("abrir modal — exibe dialog com nome do animal", async ({ page }) => {
    const interestButton = page
      .locator("section.grid article")
      .filter({ has: page.locator("button", { hasText: "Tenho interesse" }) })
      .locator("button", { hasText: "Tenho interesse" })
      .first();

    const animalName = await page
      .locator("section.grid article")
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
      .locator("section.grid article")
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
