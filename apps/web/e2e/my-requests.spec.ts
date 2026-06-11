import { test, expect } from "@playwright/test";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "e2e-user@catdog.local";

// Fixed IDs so beforeAll is idempotent across retries
const SEED_IDS = ["e2e-req-received", "e2e-req-reviewing", "e2e-req-cancelled"];

// an-luna is already in_process — inserting new requests won't change any animal status
const SEED_ANIMAL_ID = "an-luna";

async function getUserId(request: import("@playwright/test").APIRequestContext): Promise<string | null> {
  const res = await request.get(`${SUPABASE_URL}/auth/v1/admin/users`, {
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
  });
  const body = await res.json();
  const user = (body.users ?? []).find((u: { email: string }) => u.email === TEST_EMAIL);
  return user?.id ?? null;
}

async function seedRequests(
  request: import("@playwright/test").APIRequestContext,
  userId: string,
) {
  const records = [
    { id: "e2e-req-received", status: "received" },
    { id: "e2e-req-reviewing", status: "reviewing" },
    { id: "e2e-req-cancelled", status: "cancelled" },
  ];
  for (const rec of records) {
    await request.post(`${SUPABASE_URL}/rest/v1/adoption_requests`, {
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        "Content-Type": "application/json",
        Prefer: "resolution=ignore-duplicates,return=minimal",
      },
      data: {
        id: rec.id,
        animal_id: SEED_ANIMAL_ID,
        adopter_name: "E2E Test User",
        email: TEST_EMAIL,
        phone: "(11) 99999-9999",
        message: "Solicitacao criada automaticamente pelo teste e2e",
        status: rec.status,
        user_id: userId,
      },
    });
  }
}

async function cleanupRequests(request: import("@playwright/test").APIRequestContext) {
  await request.delete(
    `${SUPABASE_URL}/rest/v1/adoption_requests?id=in.(${SEED_IDS.map((id) => `"${id}"`).join(",")})`,
    {
      headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
    },
  );
}

test.beforeAll(async ({ request }) => {
  if (!SERVICE_KEY) return;
  const userId = await getUserId(request);
  if (!userId) return;
  await seedRequests(request, userId);
});

test.afterAll(async ({ request }) => {
  if (!SERVICE_KEY) return;
  await cleanupRequests(request);
});

test.describe("Minhas Solicitacoes (/minhas-solicitacoes)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/minhas-solicitacoes");

    if (page.url().includes("/entrar")) {
      test.skip(true, "Minhas Solicitacoes exige usuario autenticado. Configure TEST_USER_EMAIL/PASSWORD.");
      return;
    }

    await page.waitForSelector("h1", { state: "visible", timeout: 15_000 });
  });

  test("renderiza o titulo da pagina", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Minhas Solicitacoes" })).toBeVisible();
    await expect(page.getByText("Acompanhe o status dos seus pedidos de adocao")).toBeVisible();
  });

  test("exibe contagem de solicitacoes", async ({ page }) => {
    const countText = page.locator(".text-sm.text-muted-foreground").first();
    await expect(countText).toBeVisible();
    await expect(countText).toContainText("solicitacao");
  });

  test("exibe estado vazio ou tabela com solicitacoes", async ({ page }) => {
    const hasEmpty = await page.locator(".empty").isVisible().catch(() => false);
    const hasTable = await page.locator("table").isVisible().catch(() => false);
    expect(hasEmpty || hasTable).toBe(true);
  });

  test("tabela exibe colunas corretas quando ha solicitacoes", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible({ timeout: 10_000 });

    await expect(page.getByRole("columnheader", { name: "Animal" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Data" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Mensagem" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Acoes" })).toBeVisible();
  });

  test("botao Cancelar visivel apenas para status recebida ou em analise", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible({ timeout: 10_000 });

    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const statusCell = row.locator("td").nth(1);
      const statusText = (await statusCell.textContent())?.trim() ?? "";

      const cancelButton = row.getByRole("button", { name: "Cancelar" });
      const hasCancelButton = await cancelButton.isVisible().catch(() => false);

      const cancellableStatuses = ["Recebida", "Em analise"];
      const nonCancellableStatuses = ["Aprovada", "Recusada", "Concluida", "Cancelada"];

      if (cancellableStatuses.some((s) => statusText.includes(s))) {
        expect(hasCancelButton).toBe(true);
      }

      if (nonCancellableStatuses.some((s) => statusText.includes(s))) {
        expect(hasCancelButton).toBe(false);
      }
    }
  });

  test("badge de status Cancelada exibe variante correta (cinza)", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible({ timeout: 10_000 });

    const cancelledBadge = page.locator("table").getByText("Cancelada").first();
    await expect(cancelledBadge).toBeVisible({ timeout: 10_000 });

    const classList = await cancelledBadge.evaluate((el) => el.className);
    expect(classList).toMatch(/zinc/);
  });
});
