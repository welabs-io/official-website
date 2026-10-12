import path from "node:path";
import { defineConfig } from "vitest/config";

// CONFIGURAÇÃO DOS TESTES
// The "@/" alias mirrors tsconfig paths; JSX follows tsconfig (react-jsx), like Next.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  // e2e/ belongs to Playwright, not to vitest
  test: { environment: "node", exclude: ["e2e/**", "node_modules/**"] },
});
