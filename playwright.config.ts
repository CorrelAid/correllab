import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "fs";

// Prefer system chromium if present, otherwise fall back to Playwright's bundled browser.
const getChromiumPath = () => {
  const systemPath = "/usr/bin/chromium";
  return existsSync(systemPath) ? systemPath : undefined;
};

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: "list",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          executablePath: getChromiumPath(),
        },
      },
    },
  ],

  webServer: {
    command: "pnpm dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
