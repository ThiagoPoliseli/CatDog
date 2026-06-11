import { test, expect } from "@playwright/test";

function skipIfNoAdmin(page: import("@playwright/test").Page) {
  const { pathname } = new URL(page.url());
  // redireciona para /entrar quando sem auth, ou para /animais se nao for admin
  if (pathname === "/entrar" || pathname === "/animais") {
    test.skip(true, "Admin nao autenticado. Configure TEST_ADMIN_EMAIL/PASSWORD.");
  }
}

test.describe("Painel Admin — acesso e visao geral", () => {
  test("usuario nao autenticado e redirecionado para /entrar com next param", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/entrar/);
    const url = new URL(page.url());
    expect(url.searchParams.get("next")).toBe("/admin");

    await context.close();
  });

  test("admin autenticado acessa o painel", async ({ page }) => {
    await page.goto("/admin");
    skipIfNoAdmin(page);

    await expect(page.getByText("CatDog Admin")).toBeVisible();
  });

  test("sidebar exibe links de navegacao", async ({ page }) => {
    await page.goto("/admin");
    skipIfNoAdmin(page);

    const sidebar = page.locator(".sidebar");
    await expect(sidebar.getByRole("link", { name: "Animais" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Especies" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Racas" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Portes" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Solicitacoes" })).toBeVisible();
  });
});

test.describe("Admin — Especies", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/especies");
    skipIfNoAdmin(page);
    await page.waitForSelector("h1", { state: "visible", timeout: 10_000 });
  });

  test("pagina renderiza titulo e formulario", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Especies" })).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Adicionar" })).toBeVisible();
  });

  test("tabela de especies exibe colunas corretas", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "Nome" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Slug" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Acoes" })).toBeVisible();
  });

  test("criar e remover especie de teste", async ({ page }) => {
    const testName = `E2E-Especie-${Date.now()}`;

    await page.fill('input[name="name"]', testName);
    await page.getByRole("button", { name: "Adicionar" }).click();

    await expect(page.getByRole("cell", { name: testName, exact: true })).toBeVisible({ timeout: 10_000 });

    const row = page.locator("tr").filter({ hasText: testName });
    await row.getByRole("button", { name: "Remover" }).click();

    await expect(page.getByRole("cell", { name: testName, exact: true })).not.toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Admin — Racas", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/racas");
    skipIfNoAdmin(page);
    await page.waitForSelector("h1", { state: "visible", timeout: 10_000 });
  });

  test("pagina renderiza titulo e formulario", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Racas" })).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Adicionar" })).toBeVisible();
  });

  test("select de especie esta presente no formulario", async ({ page }) => {
    await expect(page.locator('select[name="speciesId"]')).toBeVisible();
  });

  test("tabela de racas exibe colunas Nome, Especie e Acoes", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "Nome" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Especie" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Acoes" })).toBeVisible();
  });
});

test.describe("Admin — Portes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/portes");
    skipIfNoAdmin(page);
    await page.waitForSelector("h1", { state: "visible", timeout: 10_000 });
  });

  test("pagina renderiza titulo e formulario", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Portes" })).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Adicionar" })).toBeVisible();
  });

  test("criar e remover porte de teste", async ({ page }) => {
    const testName = `E2E-Porte-${Date.now()}`;

    await page.fill('input[name="name"]', testName);
    await page.getByRole("button", { name: "Adicionar" }).click();

    await expect(page.getByRole("cell", { name: testName, exact: true })).toBeVisible({ timeout: 10_000 });

    const row = page.locator("tr").filter({ hasText: testName });
    await row.getByRole("button", { name: "Remover" }).click();

    await expect(page.getByRole("cell", { name: testName, exact: true })).not.toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Admin — Animais", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/animais");
    skipIfNoAdmin(page);
    await page.waitForSelector("h1", { state: "visible", timeout: 10_000 });
  });

  test("pagina renderiza titulo e painel de cadastro", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Animais", exact: true })).toBeVisible();
    await expect(page.locator("details").filter({ hasText: "Cadastrar novo animal" })).toBeVisible();
  });

  test("formulario de cadastro exibe todos os campos", async ({ page }) => {
    const panel = page.locator("details").filter({ hasText: "Cadastrar novo animal" });

    await expect(panel.locator('input[name="name"]')).toBeVisible();
    await expect(panel.locator('input[name="imageFile"]')).toBeVisible();
    await expect(panel.locator('select[name="speciesId"]')).toBeVisible();
    await expect(panel.locator('select[name="breedId"]')).toBeVisible();
    await expect(panel.locator('select[name="sizeId"]')).toBeVisible();
    await expect(panel.locator('input[name="ageMonths"]')).toBeVisible();
    await expect(panel.locator('select[name="sex"]')).toBeVisible();
    await expect(panel.locator('select[name="status"]')).toBeVisible();
    await expect(panel.locator('input[name="city"]')).toBeVisible();
    await expect(panel.locator('input[name="state"]')).toBeVisible();
    await expect(panel.locator('textarea[name="description"]')).toBeVisible();
  });

  test("tabela de animais exibe colunas corretas", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "Animal" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Local" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Acoes" })).toBeVisible();
  });
});

test.describe("Admin — Solicitacoes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/solicitacoes");
    skipIfNoAdmin(page);
    await page.waitForSelector("h1", { state: "visible", timeout: 10_000 });
  });

  test("pagina renderiza titulo e descricao", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Solicitacoes" })).toBeVisible();
    await expect(page.getByText("Acompanhe interessados")).toBeVisible();
  });

  test("tabela exibe colunas corretas", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "Interessado" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Animal" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Mensagem" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Acoes" })).toBeVisible();
  });

  test("linhas com solicitacoes exibem select de status e botao Salvar", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first();
    const hasRows = await firstRow.isVisible().catch(() => false);

    if (!hasRows) {
      test.skip();
      return;
    }

    await expect(firstRow.locator('select[name="status"]')).toBeVisible();
    await expect(firstRow.getByRole("button", { name: "Salvar" })).toBeVisible();
  });

  test("select de status exibe todas as opcoes validas", async ({ page }) => {
    const firstSelect = page.locator('select[name="status"]').first();
    const hasSelect = await firstSelect.isVisible().catch(() => false);

    if (!hasSelect) {
      test.skip();
      return;
    }

    const options = await firstSelect.locator("option").allTextContents();
    expect(options).toContain("Recebida");
    expect(options).toContain("Em analise");
    expect(options).toContain("Aprovada");
    expect(options).toContain("Recusada");
    expect(options).toContain("Concluida");
  });
});
