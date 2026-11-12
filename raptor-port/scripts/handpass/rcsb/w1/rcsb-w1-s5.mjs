/* rcsb-w1-s5 v1 — S5 (the line put back to standard) on a fresh world, PC.
   usage (from raptor-port/): node scripts/handpass/rcsb/w1/rcsb-w1-s5.mjs */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { rmSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w1/s5')
rmSync(process.env.HP_SHOTS, { recursive: true, force: true })
console.log('rcsb-w1-s5 v1', process.env.HP_SHOTS)
const C = await import('./rcsb-w1-common.mjs')
const { R, X, L, sleep, row, j, W4 } = C
const w = await R.world('pc')
const { page } = w
const SAT = 5, ISO = X.ISO[SAT]
const ranger = w.ID('Ranger')
console.log('built', j(await C.build(w, SAT, '10:00', '10:30', ranger)))
console.log('published', j(await C.publish(w, SAT)))
const snap = async tag => {
  await L.go(page, 'editsched'); await sleep(500)
  const head = await L.head(page, SAT); const card = await C.dayCard(page, SAT)
  await X.pic(page, tag + '-edit-head', `#eWeek .day[data-day="${SAT}"] .day-head`)
  await X.pic(page, tag + '-edit-signoff', `#eWeek .day[data-day="${SAT}"] .signoff`)
  const box = await C.lwGrid(w, ranger, ISO, tag)
  const person = await X.lwOil(w, ranger, ISO, tag + '-lw-person')
  await L.go(page, 'editsched'); await sleep(400)
  const r = { tag: head.tag, pending: head.pending, nys: head.nys, alpub: head.alpub, card, box: box.box, person: person.oil }
  console.log(tag, j(r)); return r
}
const a = await snap('s5a')
const lg = await R.setLogic(w, 'oilFullMin', '5h', 's5b-logic-5h')
console.log('logic', j(lg))
const b = await snap('s5b')
// the Logic page: find the Reset control
await L.go(page, 'logic'); await sleep(600)
const btns = await page.evaluate(() => [...document.querySelectorAll('#page-logic button, #lgBody button, #lgOff button, .logic button')].filter(e => e.offsetWidth).map(e => (e.id || '') + '|' + e.innerText.replace(/\s+/g, ' ').trim()))
console.log('logic buttons', j(btns))
await page.screenshot({ path: process.env.HP_SHOTS + '/s5-logic-page-before-reset.png' })
const rst = page.getByRole('button', { name: /Reset to standard/i }).first()
const found = await rst.count()
console.log('reset found', found)
let how = 'Reset to standard button'
if (found) { await rst.scrollIntoViewIfNeeded(); await rst.click(); await sleep(800) }
await page.screenshot({ path: process.env.HP_SHOTS + '/s5-logic-after-reset.png' })
const stripAfter = await page.evaluate(() => { const e = document.querySelector('#lgOff'); return e && !e.hidden && e.offsetWidth ? e.innerText.replace(/\s+/g, ' ').trim() : '(strip hidden)' })
const vconf = await page.evaluate(() => window.VCONF.oilFullMin)
console.log('after reset', j({ stripAfter, vconf, how }))
const c = await snap('s5c')
row('S5a', 'RECORD', `a: ${j({ pending: a.pending, nys: a.nys, signed: a.card.signedLine, box: a.box, person: a.person })}`, 's5a-*')
row('S5b', 'RECORD', `b (5h): ${j({ pending: b.pending, nys: b.nys, signed: b.card.signedLine, soState: b.card.soState, box: b.box, person: b.person })}`, 's5b-*')
const goneOk = !/pending/.test(c.pending) && !c.nys
row('S5c', goneOk && /HO\*/.test(c.box) ? 'PASS' : 'FAIL', `after Reset to standard (vconf ${vconf}, strip "${stripAfter}"): head ${c.tag}/${c.pending}/nys ${c.nys}; signed line ${c.card.signedLine}; sign-off state ${c.card.soState}; box ${c.box}; person ${c.person}`, 's5c-*')
R.finish(w, 's5')
await w.browser.close()
