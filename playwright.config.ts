import path from "node:path";
import { defineConfig } from "@playwright/test";

// CONFIGURAÇÃO DO PLAYWRIGHT
// Runs against a server that is already up (PORTFOLIO_PREVIEW_URL, default the 5176 preview); it never starts one.
// The browser binary comes from PW_CHROMIUM_PATH, because the revision the package asks for may not be installed.
// Reference screenshots live outside the repo (PW_SNAPSHOT_DIR), so a baseline is never versioned by accident.
const snapshots =
  process.env.PW_SNAPSHOT_DIR ?? path.resolve(__dirname, "e2e/.snapshots");

export default defineConfig({
  testDir: "e2e",
  snapshotPathTemplate: `${snapshots}/{arg}{ext}`,
  outputDir: process.env.PW_OUTPUT_DIR ?? "e2e/.results",
  reporter: "list",
  workers: 1,
  use: {
    baseURL: process.env.PORTFOLIO_PREVIEW_URL ?? "http://127.0.0.1:5176",
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : {},
  },
});
