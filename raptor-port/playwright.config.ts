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

/* The preview's port. 4173 unless E2E_PORT says otherwise — which the checks
   do when they run on the owner's own PC (D89, the self-hosted runner in
   .github/workflows/deploy.yml): that PC also hosts the chats' own previews on
   4173/4180 (D86), and with `reuseExistingServer` off in CI a busy port would
   fail the whole run — or, worse, a reused one would test another chat's
   bundle. */
const PORT = process.env.E2E_PORT || '4173'

/* The geometry gate. jsdom has no layout engine — `getBoundingClientRect()`
   returns zeroes there — so the measured contracts in docs/ui-contracts.md
   (puck exactly 74x15, free text wraps instead of overflowing, one day box per
   pan click, the proxy scrollbar 1:1) could never be pinned in Vitest. They
   live here instead, in a real browser, and run in CI beside the other gates.
   `npm run test:e2e` builds and serves the port itself. */
export default defineConfig({
  testDir: './e2e',
  /* NO git information, ever (23 Sep 26). Under CI, Playwright gathers git
     facts for its HTML report unless told not to — and for a pull request that
     means `git fetch origin <base>` over the network. The checkout keeps no
     token (`persist-credentials: false`, Astra SEC-003), and on the owner's PC
     the runner is a Windows SERVICE with no screen, so Git's credential manager
     waited for a sign-in that could never appear: the browser gate's first run
     there sat 30 minutes with no browser started, until it was cancelled. We
     never read that report data, so the test run needs no network at all. */
  captureGitInfo: { commit: false, diff: false },
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
    baseURL: process.env.PORT_URL || `http://localhost:${PORT}/`,
    launchOptions,
  },
  /* Three projects since the Leave War merge (16 Aug 26). `raptor` is the
     original geometry gate, unchanged — it sets its own viewports per test.
     The vendored Leave War suite kept the two-viewport split its standalone
     repo ran (its geometry contracts — frozen columns, sheet anchoring, tap
     targets — differ by form factor): `lw-phone` is iPhone 13 emulation
     FORCED to chromium (the image ships no WebKit; viewport/touch/UA
     emulation is unaffected), `lw-desktop` is a plain 1440×900 window. */
  projects: [
    /* availwin (23 Sep 26): the [ALL-AVAIL-WINDOW] paint and reach checks —
       their own file because the window is its own surface, and in this
       project so CI's `--project=raptor` leg runs them with the rest. */
    { name: 'raptor', testMatch: /(geometry|medical|availwin)\.spec\.ts/ },
    { name: 'lw-phone', testMatch: /leavewar\.spec\.ts/, use: { ...devices['iPhone 13'], browserName: 'chromium' } },
    { name: 'lw-desktop', testMatch: /leavewar\.spec\.ts/, use: { viewport: { width: 1440, height: 900 } } },
  ],
  /* a preview of the real production build, not the dev server: the CSS that
     carries the contracts is the built one */
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
