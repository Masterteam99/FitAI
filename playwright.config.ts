import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 45_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],

  webServer: process.env.E2E_SKIP_WEBSERVER
    ? undefined
    : {
        // In CI gli E2E girano contro la build di produzione (`next start`).
        // `next dev` (Turbopack) compila le route on-demand: a freddo impiega
        // 100s+ per route e satura il runner (2 core/7GB), causando 404/timeout
        // a cascata. La build è precompilata e serve in millisecondi. In locale
        // resta `next dev` per iterare velocemente.
        command: process.env.CI ? "npm run start" : "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: process.env.CI ? 120_000 : 60_000,
        stdout: "ignore",
        stderr: "pipe",
      },
});
