/* pdl-rw-r3 — re-walk wrapper: sets the re-walk's own folder and the frozen build's address, then runs pdl-w1-s4.mjs unchanged. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL = 'http://localhost:4292'
process.env.HP_SHOTS = resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/rewalk/r3')
console.log('pdl-rw-r3 v1 wraps pdl-w1-s4', process.env.HP_SHOTS)
await import('./pdl-w1-s4.mjs')
