import path from "node:path";
import { defineConfig } from "vitest/config";

// CONFIGURAÇÃO DOS TESTES
// The "@/" alias mirrors tsconfig paths; JSX follows tsconfig (react-jsx), like Next.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: { environment: "node" },
});
