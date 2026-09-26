/* The absence-record re-test (26 Sep 26) — set the walk's environment BEFORE the shared drivers load (they read
   HP_URL / HP_SHOTS at import time). Imported FIRST by ab-lib.mjs; ESM evaluates imports in order, so this runs
   before ../lib.mjs. The build is served on 4175 (this chat's port, D228); pictures go under this checkout's
   docs/img/handpass/2026-09-26-absence/, one sub-folder per walker (set AB_WHO). */
import { fileURLToPath } from 'node:url'
export const ROOT = fileURLToPath(new URL('../../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_URL ||= 'http://localhost:4175'
process.env.HP_SHOTS ||= `${ROOT}/docs/img/handpass/2026-09-26-absence/${process.env.AB_WHO || 'host'}`
