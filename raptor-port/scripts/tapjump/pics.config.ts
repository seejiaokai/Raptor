/* TEMPORARY — not committed. Pictures against a build already served on E2E_PORT. */
import { defineConfig, devices } from '@playwright/test'
const PORT = process.env.E2E_PORT!
export default defineConfig({
  testDir: '.',
  testMatch: new RegExp(process.env.PICS_MATCH || 'tmp-.*\\.spec\\.ts'),
  captureGitInfo: { commit: false, diff: false },
  workers: Number(process.env.PICS_WORKERS || 2),
  fullyParallel: true,
  reporter: 'line',
  timeout: Number(process.env.PICS_TIMEOUT || 60000),
  use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${PORT}/` },
  projects: [
    { name: 'pc', use: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
    { name: 'phone', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
  ],
})
