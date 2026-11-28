// lwdl-pw.mjs — Playwright and the walk's picture folder for the lw-decide-look scripts. From the lw-decide-look walk of 28 Nov 26 ([LW-DECIDE-LOOK], his D2881); run from raptor-port/.
// the project's own Playwright (first written outside the checkout and loaded by path; moved into the repo, it is imported by name)
export * from '@playwright/test'
import path from 'node:path'
/* run from raptor-port/ */
export const OUT_DEFAULT = path.resolve('docs/img/handpass/2026-11-28-lw-decide-look')
