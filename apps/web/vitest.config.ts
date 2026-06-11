import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", "e2e"],
    coverage: {
      provider: "v8",
      include: [
        "src/lib/validation.ts",
        "src/lib/admin.ts",
        "src/lib/utils.ts",
        "src/lib/types.ts",
        "src/lib/store.ts",
        "src/lib/supabase-store.ts",
        "src/app/api/**/*.ts",
        "src/app/admin/actions.ts",
        "src/app/entrar/actions.ts",
        "src/app/login/actions.ts",
        "src/app/minhas-solicitacoes/actions.ts",
      ],
      exclude: ["**/*.test.ts"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      reporter: ["text", "html"],
    },
  },
});
