/* rcsb-w1-s2phone v1 — S2 on his iPhone (WebKit, 402 x 874, touch): Sunday 10:00-11:30, line raised to 7h.
   usage (from raptor-port/): node scripts/handpass/rcsb/w1/rcsb-w1-s2phone.mjs */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { rmSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w1/s2-phone')
rmSync(process.env.HP_SHOTS, { recursive: true, force: true })
console.log('rcsb-w1-s2phone v1', process.env.HP_SHOTS)
const C = await import('./rcsb-w1-common.mjs')
const { R, X, L, sleep, row, j, W4 } = C
const w = await R.world('phone')
const { page } = w
const SUN = 6, ISO = X.ISO[SUN]
const ranger = w.ID('Ranger')
const rk = await C.build(w, SUN, '10:00', '11:30', ranger)
console.log('built', j(rk))
const pub = await C.publish(w, SUN)
console.log('published', j({ pressed: pub.pressed, tag: pub.head && pub.head.tag, pending: pub.head && pub.head.pending }))
const read = async tag => {
  await L.go(page, 'editsched'); await sleep(600)
  const head = await L.head(page, SUN); const card = await C.dayCard(page, SUN)
  await X.pic(page, tag + '-edit-head', `#eWeek .day[data-day="${SUN}"] .day-head`)
  await W4.lwOpen(page, ISO)
  const cell = await W4.lwCell(page, ranger, ISO)
  await W4.lwShot(page, ranger ? tag + '-lw-grid' : tag, ranger, ISO)
  // tap the box: a picture right after the tap (D1281), then settled
  const c = page.locator(`[data-testid="cell-${ranger}-${ISO}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(250)
  await c.tap(); await sleep(100)
  await page.screenshot({ path: `${R.SHOTS}/${tag}-lw-window-tap.png` })
  await sleep(700)
  const win = await page.evaluate(() => { const b = document.querySelector('[data-testid="bid-picker"]') || document.querySelector('[data-testid="daylist-sheet"]'); return b ? b.innerText.replace(/\s+/g, ' ').trim() : '(no window)' })
  await page.screenshot({ path: `${R.SHOTS}/${tag}-lw-window.png` })
  await W4.lwCloseSheet(page)
  const person = await X.lwOil(w, ranger, ISO, tag + '-lw-person')
  const r = { head: { tag: head.tag, pending: head.pending, nys: head.nys }, card, box: cell.box, win: win.slice(-170), person: person.oil }
  console.log(tag, j(r)); return r
}
const a = await read('p2a')
const lg = await R.setLogic(w, 'oilFullMin', '7h', 'p2b-logic-7h')
console.log('logic', j(lg))
const b = await read('p2b')
await L.go(page, 'editsched'); await sleep(500)
const pAl = await C.publish(w, SUN)
console.log('AL1', j({ pressed: pAl.pressed, tag: pAl.head && pAl.head.tag, pending: pAl.head && pAl.head.pending }))
const c = await read('p2c')
const m = x => x.box
row('S2 phone a', /FO\*/.test(a.box) ? 'PASS' : 'FAIL', `a: box ${a.box}; person ${a.person}; head ${a.head.tag}/${a.head.pending}/nys ${a.head.nys}; window ${a.win}`, 'p2a-*')
row('S2 phone b', /FO\*/.test(b.box) && /1/.test(b.person) ? 'PASS' : 'FAIL', `b: box ${b.box}; person ${b.person}; head ${b.head.tag}/${b.head.pending}/nys ${b.head.nys}; window ${b.win}`, 'p2b-*')
row('S2 phone c', /HO\*/.test(c.box) ? 'PASS' : 'FAIL', `c: box ${c.box}; person ${c.person}; head ${c.head.tag}/${c.head.pending}/nys ${c.head.nys}; window ${c.win}`, 'p2c-*')
R.finish(w, 's2phone')
await w.browser.close()
