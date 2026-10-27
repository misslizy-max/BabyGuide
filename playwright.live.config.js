import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";
// Keep loopback requests local; external destinations still use the session proxy.
process.env.PLAYWRIGHT_DISABLE_FORCED_CHROMIUM_PROXIED_LOOPBACK = "1";
// Opt-in, real network only. Never substitutes a weather response.
export default defineConfig({
  testDir: "./tests/live",
  workers: 1,
  fullyParallel: false,
  timeout: 45000,
  outputDir: "live-test-results",
  use: {
    ...devices["iPhone 13"],
    defaultBrowserType: "chromium",
    serviceWorkers: "block",
    baseURL: "http://127.0.0.1:4183",
    trace: "retain-on-failure",
    launchOptions: {
      executablePath:
        process.env.CHROMIUM_PATH ||
        (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    },
    ...(process.env.HTTPS_PROXY
      ? {
          proxy: {
            server: process.env.HTTPS_PROXY,
            bypass: "127.0.0.1,localhost",
          },
        }
      : {}),
  },
  webServer: {
    command: "npm run build && npm run preview -- --port 4183",
    url: "http://127.0.0.1:4183",
    reuseExistingServer: false,
  },
});
