/* [LW-MOVE-STANDARD] (D264–D266, 27 Sep 26) — the walk's and the mock-up's environment, set BEFORE the shared drivers
   load (they read HP_URL / HP_SHOTS at import time). This chat's build is served on 4177 (raptor-walk-5); pictures go
   under docs/img/handpass/2026-09-27-lw-move-standard/<run>/<width>/ (MS_RUN names a re-walk — the first walk's
   pictures are the defects' evidence, bug-check order §5). Imported FIRST, before ../mv/mv-lib.mjs. */
import { fileURLToPath } from 'node:url'
export const WIDTH = process.argv[2] === 'phone' ? 'phone' : 'desktop'
export const ROOT = fileURLToPath(new URL('../../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_URL = process.env.HP_URL || 'http://localhost:4177'
export const RUN = process.env.MS_RUN || ''
process.env.MV_RUN = RUN
process.env.HP_SHOTS_MS = `${ROOT}/docs/img/handpass/2026-09-27-lw-move-standard/${RUN ? RUN + '/' : ''}${WIDTH}`
