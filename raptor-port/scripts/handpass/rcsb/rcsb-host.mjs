/* rcsb-host v1 — the host's own short route check before the walkers start (walk-scripts §1).
   One published Saturday that earns, "Full day of OIL" raised, the Leave War read, the amendment published.
   usage (from raptor-port/): node scripts/handpass/rcsb/rcsb-host.mjs [pc|phone] */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'pc'
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-13-rules-check-small-batch/host/' + KIND)
console.log('rcsb-host v1', KIND, process.env.HP_SHOTS)
const R = await import('./rcsb-lib.mjs')
const { X, L, sleep, row } = R
const w = await R.world(KIND)
const { page } = w
const SAT = 5, ISO = X.ISO[SAT]
const ranger = w.ID('Ranger')
const j = o => JSON.stringify(o)
const oilBtn = () => page.locator('#schedBoard #sbOil:visible, #schedBoard [data-oilmode]:visible').first()
const oilOn = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .seat.oilpk, #schedBoard .oilitem')].some(e => e.offsetWidth))
const tapOil = async () => { const b = oilBtn(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150); if (w.phone) await b.tap(); else await b.click(); await sleep(800) }
const rangerOil = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .seat.oilpk, #schedBoard .puck.oilbar, #schedBoard .oilitem')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /Ranger/.test(t)).slice(0, 3))
async function readAll(tag) {
  await L.go(page, 'editsched'); await sleep(400)
  await L.board(page, SAT)
  const head = await L.head(page, SAT)
  await tapOil(); const om = await rangerOil(); await X.pic(page, tag + '-oilearn'); await tapOil()
  await L.closeBoard(page)
  const lb = await X.lwBox(w, ranger, ISO)
  const lo = await X.lwOil(w, ranger, ISO, tag + '-war-person')
  await X.pic(page, tag + '-war')
  console.log(tag, j({ head, om, lb, lo }))
  return { head, om, lb, lo }
}
await L.board(page, SAT)
const gF = await X.addWave(w, SAT, '')
await X.typeIn(w, `[data-bfld="ff:5.${gF}.0.to"]`, '10:00'); await X.typeIn(w, `[data-bfld="ff:5.${gF}.0.ld"]`, '11:30')
console.log('seat', await X.seatPhoneAware(w, `[data-slot="5.${gF}.0.0.p"]`, ranger))
const sp = await X.signAndPublish(w, SAT)
console.log('published', j(sp.p), j(sp.h))
await L.closeBoard(page)
const a = await readAll('h1-published')
const lg = await R.setLogic(w, 'oilFullMin', '7h', 'h2-logic-7h')
console.log('logic', j(lg))
const b = await readAll('h3-after-7h')
await L.board(page, SAT)
const sp2 = await X.signAndPublish(w, SAT)
console.log('amended', j(sp2.p), j(sp2.h))
await L.closeBoard(page)
const c = await readAll('h4-after-amendment')
row('H1 route', 'RECORD', j({ a: a.lb, b: b.lb, c: c.lb, oa: a.lo, ob: b.lo, oc: c.lo, pend: [a.head?.pending, b.head?.pending, c.head?.pending] }))
R.finish(w, 'host-' + KIND)
await w.browser.close()
