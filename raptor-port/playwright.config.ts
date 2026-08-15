import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

/* The dev container ships ONE Chromium, at a stable path, and the pinned
   Playwright looks for a build it does not have — so a bare launch there dies
   telling you to run `npx playwright install`, which would re-download for
   nothing (raptor-port/CLAUDE.md). A CI runner is the opposite case: it has
   no such path and installs its own browser. Point at the container's build
   only when it is actually there. */
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}

/* The geometry gate. jsdom has no layout engine — `getBoundingClientRect()`
   returns zeroes there — so the measured contracts in docs/ui-contracts.md
   (puck exactly 74x15, free text wraps instead of overflowing, one day box per
   pan click, the proxy scrollbar 1:1) could never be pinned in Vitest. They
   live here instead, in a real browser, and run in CI beside the other gates.
   `npm run test:e2e` builds and serves the port itself. */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  /* One CI retry — added 15 Aug 26 with the worker bump below, after the
     first all-cores run on main failed on a single timing-sensitive carry-day
     test that passes everywhere else. A retried pass is logged by the
     reporter, so flakiness stays visible instead of silently absorbed. Local
     runs keep retries at 0: on a dev box a flake should fail loudly. */
  retries: process.env.CI ? 1 : 0,
  /* More workers in CI, but NOT all cores (tried '100%' first, 15 Aug 26):
     the default half-cores left a 4-core runner at 2, but saturating all 4
     starved the shared vite preview server and flaked the test above on the
     very first main run. Three keeps most of the ~30% win with headroom for
     the server. Local runs keep Playwright's own default. */
  workers: process.env.CI ? 3 : undefined,
  reporter: process.env.CI ? 'list' : 'line',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.PORT_URL || 'http://localhost:4173/',
    launchOptions,
  },
  /* a preview of the real production build, not the dev server: the CSS that
     carries the contracts is the built one */
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
