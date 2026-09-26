/* D260–D262 walk — the walk's environment, set BEFORE the shared drivers load (they read HP_URL / HP_SHOTS at import
   time, and a static re-export loads them before the importing module's own body runs). Imported FIRST by mv-lib.mjs. */
import { fileURLToPath } from 'node:url'
export const WIDTH = process.argv[2] === 'phone' ? 'phone' : 'desktop'
export const ROOT = fileURLToPath(new URL('../../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_URL ||= 'http://localhost:4175'
process.env.HP_SHOTS = `${ROOT}/docs/img/handpass/2026-09-27-d260-d262/${WIDTH}`
process.env.AB_WHO = 'mv'
