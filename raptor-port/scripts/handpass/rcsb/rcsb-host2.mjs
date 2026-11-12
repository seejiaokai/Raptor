/* rcsb-host2 v1 — the host's check of the strip helpers (a cropped picture in the 125% window) before the walkers.
   usage (from raptor-port/): node scripts/handpass/rcsb/rcsb-host2.mjs [pc|phone] */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'pc'
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-13-rules-check-small-batch/host/' + KIND)
console.log('rcsb-host2 v1', KIND)
const R = await import('./rcsb-lib.mjs')
const w = await R.world(KIND)
const a = await R.setLogic(w, 'oilFullMin', '5h', 'h5-logic-5h')
console.log('one', JSON.stringify(a))
await R.stripPic(w, 'h5-strip-one')
const b = await R.setLogic(w, 'debrief', '90', 'h6-logic-debrief')
console.log('two', JSON.stringify(b))
await R.stripPic(w, 'h6-strip-two')
R.finish(w, 'host2-' + KIND)
await w.browser.close()
