/* pdl-rw-r2 — re-walk wrapper: sets the re-walk's own folder and the frozen build's address, then runs pdl-w2-t7.mjs unchanged. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL = 'http://localhost:4292'
process.env.HP_SHOTS = resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/rewalk/r2')
console.log('pdl-rw-r2 v1 wraps pdl-w2-t7', process.env.HP_SHOTS)
await import('./pdl-w2-t7.mjs')
