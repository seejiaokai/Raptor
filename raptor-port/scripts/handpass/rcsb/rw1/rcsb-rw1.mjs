/* rcsb-rw1 v3 — the re-walk of the fix the blind read found (13 Nov 26): the red "no usable times" line on a published
   Saturday follows the values the day was published under. "Nominal report before T/O" 0, a line typed 10:00-10:00 with
   Ranger (earns a half day on the 2h debrief, D49), published; then "Flight debrief after land" set to 0 on the Logic
   page: View-only Sched must NOT show the red line while the change waits; Edit Schedule (the working copy) shows the
   next amendment; after AL1 the published face says it and the Leave War drops the half day.
   usage (from raptor-port/, the fixed build served on 4193): node scripts/handpass/rcsb/rw1/rcsb-rw1.mjs */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { rmSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/rw1')
rmSync(process.env.HP_SHOTS, { recursive: true, force: true })
console.log('rcsb-rw1 v3', process.env.HP_SHOTS)
const C = await import('../w1/rcsb-w1-common.mjs')
const { R, X, L, sleep, row, j, W4 } = C
const w = await R.world('pc')
const { page } = w
const SAT = 5
const ranger = w.ID('Ranger')
const BLIND = /no usable times/i
/* the day's text on a page, and a picture of the day */
/* (v2) the day's issues list is folded until its bar is pressed: open it first, so its lines are read and pictured */
const dayText = async (pg, sel, di) => {
  const box = page.locator(`${sel} .day[data-day="${di}"] .dwbox`).first()
  if (await box.count() && !(await box.evaluate(e => e.classList.contains('open')))) {
    await page.locator(`${sel} .day[data-day="${di}"] [data-daywarn]`).first().click(); await sleep(500)
  }
  return page.evaluate(([s, i]) => { const d = document.querySelector(`${s} .day[data-day="${i}"]`); return d ? d.innerText.replace(/\s+/g, ' ').trim() : 'NO DAY' }, [sel, di])
}
const viewLook = async (tag) => {
  await L.go(page, 'viewsched'); await sleep(700)
  const t = await dayText(page, '#vWeek', SAT)
  await X.pic(page, tag + '-view', `#vWeek .day[data-day="${SAT}"]`)
  return t
}
const editLook = async (tag) => {
  await L.go(page, 'editsched'); await sleep(700)
  const t = await dayText(page, '#eWeek', SAT)
  const head = await L.head(page, SAT)
  /* (v3) the whole day is taller than the window and pictures scrolled; the head and the issues list, each cut to itself */
  await X.pic(page, tag + '-edit-head', `#eWeek .day[data-day="${SAT}"] .day-head`)
  await X.pic(page, tag + '-edit-issues', `#eWeek .day[data-day="${SAT}"] .dwbox`)
  return { t, head: head && { ...head, pending: String(head.pending || '').replace(/\s+/g, ' ') } }
}
const lr = await R.setLogic(w, 'reportLead', '0', 'a0-logic-report0')
console.log('reportLead', j(lr))
const b = await C.build(w, SAT, '10:00', '10:00', ranger)
console.log('built', j(b))
const p = await C.publish(w, SAT)
console.log('published', j(p))
await W4.lwOpen(page, X.ISO[SAT])
const cellA = await W4.lwCell(page, ranger, X.ISO[SAT])
await W4.lwShot(page, 'a1-lw', ranger, X.ISO[SAT])
const viewA = await viewLook('a2')
console.log('A', j({ cellA, viewA: viewA.slice(0, 400) }))
row('RW1a premise', /HO\*/.test(cellA.box) && !BLIND.test(viewA) ? 'PASS' : 'FAIL', `published: Leave War box ${cellA.box}; View-only red line: ${BLIND.test(viewA)}`, 'a1-lw.png, a2-view.png')

const ld = await R.setLogic(w, 'debrief', '0', 'b0-logic-debrief0')
console.log('debrief', j(ld))
await W4.lwOpen(page, X.ISO[SAT])
const cellB = await W4.lwCell(page, ranger, X.ISO[SAT])
await W4.lwShot(page, 'b1-lw', ranger, X.ISO[SAT])
const viewB = await viewLook('b2')
const editB = await editLook('b3')
console.log('B', j({ cellB, viewB: viewB.slice(0, 400), editHead: editB.head, editBlind: BLIND.test(editB.t) }))
row('RW1b face', /HO\*/.test(cellB.box) && !BLIND.test(viewB) ? 'PASS' : 'FAIL', `debrief 0: Leave War box ${cellB.box}; View-only red line: ${BLIND.test(viewB)} (must be false)`, 'b1-lw.png, b2-view.png')
row('RW1b working copy', BLIND.test(editB.t) && /1 pending/.test(String(editB.head && editB.head.pending)) ? 'PASS' : 'FAIL', `Edit Schedule: red line ${BLIND.test(editB.t)}, head ${j(editB.head)}`, 'b3-edit.png')

await L.go(page, 'editsched'); await sleep(500)
const pAl = await C.publish(w, SAT)
console.log('AL1', j(pAl))
await W4.lwOpen(page, X.ISO[SAT])
const cellC = await W4.lwCell(page, ranger, X.ISO[SAT])
await W4.lwShot(page, 'c1-lw', ranger, X.ISO[SAT])
const viewC = await viewLook('c2')
console.log('C', j({ cellC, viewC: viewC.slice(0, 400) }))
row('RW1c after AL1', !/HO\*/.test(cellC.box) && BLIND.test(viewC) ? 'PASS' : 'FAIL', `after AL1: Leave War box ${cellC.box}; View-only red line: ${BLIND.test(viewC)}`, 'c1-lw.png, c2-view.png')
R.finish(w, 'rw1')
await w.browser.close()
