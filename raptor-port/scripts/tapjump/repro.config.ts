/* TEMPORARY — [TAP-JUMP-SWEEP] chat 70's hand repro; not committed. Against a build already served on E2E_PORT. */
import { defineConfig, devices } from '@playwright/test'
const PORT = process.env.REPRO_PORT || '4190'
export default defineConfig({
  testDir: '.',
  testMatch: /repro\.spec\.ts/,
  grep: process.env.REPRO_GREP ? new RegExp(process.env.REPRO_GREP) : undefined,
  captureGitInfo: { commit: false, diff: false },
  workers: Number(process.env.PICS_WORKERS || 3),
  fullyParallel: true,
  reporter: 'line',
  timeout: 90000,
  use: { baseURL: `http://localhost:${PORT}/` },
  projects: [
    /* his PC: 1920x1080 at 125% → 1536 CSS px wide; the browser started at that scaling */
    { name: 'pc', use: { ...devices['Desktop Chrome'], viewport: { width: 1536, height: 740 }, deviceScaleFactor: 1.25,
      launchOptions: { args: ['--force-device-scale-factor=1.25'] } } },
    /* his iPhone 17 Pro's screen, in CSS px */
    { name: 'phone', use: { ...devices['iPhone 13'], browserName: 'chromium', viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 } },
  ],
})
