/* rcsb-w1-s2 v1 — S2 (raising the line, Sunday 10:00-11:30, "Full day of OIL" 7h) and S3 (Undo / Redo of the amendment), PC.
   usage (from raptor-port/): node scripts/handpass/rcsb/w1/rcsb-w1-s2.mjs */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { rmSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w1/s2')
rmSync(process.env.HP_SHOTS, { recursive: true, force: true })
console.log('rcsb-w1-s2 v1', process.env.HP_SHOTS)
const C = await import('./rcsb-w1-common.mjs')
const { R, X, L, sleep, row, j, W4 } = C
const w = await R.world('pc')
const { page } = w
const SUN = 6, ISO = X.ISO[SUN]
const ranger = w.ID('Ranger')
console.log('built', j(await C.build(w, SUN, '10:00', '11:30', ranger)))
console.log('published', j(await C.publish(w, SUN)))
const a = await C.readAll(w, SUN, ranger, 's2a')
const lg = await R.setLogic(w, 'oilFullMin', '7h', 's2b-logic-7h')
console.log('logic', j(lg))
const b = await C.readAll(w, SUN, ranger, 's2b')
await L.go(page, 'editsched'); await sleep(500)
console.log('AL1 published', j(await C.publish(w, SUN)))
const c = await C.readAll(w, SUN, ranger, 's2c')
// S3: Undo of the amendment, Redo
const small = async tag => {
  await L.go(page, 'editsched'); await sleep(500)
  const head = await L.head(page, SUN); const card = await C.dayCard(page, SUN)
  const grid = await C.lwGrid(w, ranger, ISO, tag)
  const person = await X.lwOil(w, ranger, ISO, tag + '-lw-person')
  const o = await C.lwOther(w, ranger, ISO, tag)
  await L.go(page, 'editsched'); await sleep(500)
  await X.pic(page, tag + '-edit-head', `#eWeek .day[data-day="${SUN}"] .day-head`)
  const r = { head: { tag: head.tag, pending: head.pending, selector: head.selector, nys: head.nys, alpub: head.alpub && head.alpub.text }, card, box: grid.box, win: grid.win.slice(-180), person: person.oil, tracker: o.tracker, bal: o.balOil }
  console.log(tag, j(r)); return r
}
await L.go(page, 'editsched'); await sleep(500)
const ub = page.locator('#undoBtn:visible').first()
const undoTitle = await ub.getAttribute('title'); const undoDis = await ub.isDisabled()
console.log('undo button', j({ title: undoTitle, disabled: undoDis, label: await L.undoLabel(page) }))
await page.screenshot({ path: process.env.HP_SHOTS + '/s3-before-undo.png' })
const u = await X.undoBtn(w, 'undo')
const toast1 = await L.takeToasts(page)
console.log('undo pressed', j(u), 'toast', j(toast1))
await page.screenshot({ path: process.env.HP_SHOTS + '/s3-after-undo-screen.png' })
const afterUndo = await small('s3u')
const rb = page.locator('#redoBtn:visible').first()
const redoTitle = await rb.getAttribute('title'); const redoDis = await rb.isDisabled().catch(() => null)
console.log('redo button', j({ title: redoTitle, disabled: redoDis }))
const rd = await X.undoBtn(w, 'redo')
const toast2 = await L.takeToasts(page)
console.log('redo pressed', j(rd), 'toast', j(toast2))
const afterRedo = await small('s3r')
const ok = (x, re) => re.test(x)
row('S2a', ok(a.grid.box, /FO\*/) ? 'PASS' : 'FAIL', `a: box ${a.grid.box}; person ${a.person.oil}; tracker ${a.tracker}; balances ${a.balOil}; board ${j(a.board.seat)}; head ${a.head.tag}/${a.head.pending}/nys ${a.card.nys}`, 's2a-*')
row('S2b', ok(b.grid.box, /FO\*/) ? 'PASS' : 'FAIL', `b: box ${b.grid.box}; person ${b.person.oil}; tracker ${b.tracker}; balances ${b.balOil}; board ${j(b.board.seat)}; head ${b.head.tag}/${b.head.pending}/nys ${b.card.nys}`, 's2b-*')
row('S2c', ok(c.grid.box, /HO\*/) ? 'PASS' : 'FAIL', `c: box ${c.grid.box}; person ${c.person.oil}; tracker ${c.tracker}; balances ${c.balOil}; board ${j(c.board.seat)}; head ${c.head.tag}/${c.head.pending}/nys ${c.card.nys}`, 's2c-*')
row('S3 undo', 'RECORD', `Undo title "${undoTitle}"; toast ${j(toast1)}; after: box ${afterUndo.box} person ${afterUndo.person} head ${afterUndo.head.tag}/${afterUndo.head.pending}/nys ${afterUndo.card.nys}`, 's3u-*')
row('S3 redo', 'RECORD', `Redo title "${redoTitle}"; toast ${j(toast2)}; after: box ${afterRedo.box} person ${afterRedo.person} head ${afterRedo.head.tag}/${afterRedo.head.pending}`, 's3r-*')
R.finish(w, 's2')
await w.browser.close()
