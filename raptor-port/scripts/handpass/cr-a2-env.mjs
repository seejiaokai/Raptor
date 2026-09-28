/* Walker A2 of the change-recording re-test (28 Sep 26) — the walk's environment, set BEFORE the shared drivers load
   (they read HP_URL / HP_SHOTS at import time). Imported FIRST by cr-a2-lib.mjs. The build is the one already served on
   4173 (the brief: never start, stop or rebuild it); pictures go under
   docs/img/handpass/2026-09-28-change-recording/a2/<width>/. */
import { fileURLToPath } from 'node:url'
export const WIDTH = process.argv[2] === 'phone' ? 'phone' : 'desktop'
export const ROOT = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_URL = process.env.HP_URL || 'http://localhost:4173'
process.env.HP_SHOTS = `${ROOT}/docs/img/handpass/2026-09-28-change-recording/a2/${WIDTH}`
process.env.AB_WHO = 'a2'
