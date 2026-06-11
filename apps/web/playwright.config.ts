import { defineConfig, devices } from "@playwright/test";

try { process.loadEnvFile(".env"); } catch {}

const PORT = process.env.PORT ?? "3001";
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "setup:user",
      testMatch: "**/setup/auth.user.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "setup:admin",
      testMatch: "**/setup/auth.admin.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "unauthenticated",
      testMatch: "**/login.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "user",
      testMatch: ["**/catalog.spec.ts", "**/adoption-request.spec.ts", "**/my-requests.spec.ts"],
      dependencies: ["setup:user"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".playwright/user.json",
      },
    },
    {
      name: "admin",
      testMatch: "**/admin.spec.ts",
      dependencies: ["setup:admin"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".playwright/admin.json",
      },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { PORT },
  },
});
