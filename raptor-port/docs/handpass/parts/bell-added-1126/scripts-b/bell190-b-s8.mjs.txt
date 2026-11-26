// bell190-b scenario group 8 (desktop): Undo of an add made on the Inputs page, before Ranger reads it [A38]; and Undo of
// a new filing for him; then Redo — RECORD what comes back.
import * as L from './bell190-b-lib.mjs'
console.log('bell190-b-s8 v1')
const P = 'b-s8'
L.clearPics(P)
const { b, page, errs } = await L.launch('desk')
const log = (...a) => console.log(...a)
const ID = L.ID
log('saber:', await L.as.saber(page))
await L.goInputs(page)
const mine = n => n.iid
// 8a: Hex's Training; Saber adds Ranger in its window; then Undo
let r = await L.file(page, { from: 'list', type: 'Training', title: 'B8a Hex undo', people: [ID.Hex], date: '2026-07-15' })
const iidA = r.rows[0].iid
await L.goInputs(page)
await L.openFromList(page, iidA)
await L.setPeople(page, [ID.Hex, ID.Ranger], true)
let before = await L.notices(page)
await L.save(page)
const added = L.newNotices(await L.notices(page), before)
log('[8a] the add wrote:\n    ' + L.fmt(added), '\n    input now', JSON.stringify(await L.input(page, iidA)))
const undoTitle = await page.locator('#undoBtn').getAttribute('title').catch(() => '?')
log('[8a] Undo says:', undoTitle)
await page.click('#undoBtn'); await page.waitForTimeout(700)
await L.pic(page, `${P}-8a-after-undo`)
const afterUndo = await L.notices(page)
log('[8a] after Undo: input', JSON.stringify(await L.input(page, iidA)), '\n    lines about it still in the store:\n    ' + (L.fmt(afterUndo.filter(n => n.iid === iidA)) || 'none'))
// 8b: a new filing for Ranger, then Undo
await L.goInputs(page)
r = await L.file(page, { from: 'list', type: 'Meeting', title: 'B8b Undo new', people: [ID.Ranger, ID.Hex], date: '2026-07-16' })
const iidB = r.rows[0].iid
log('[8b] filed, lines:\n    ' + L.fmt((await L.notices(page)).filter(n => n.iid === iidB)))
await page.click('#undoBtn'); await page.waitForTimeout(700)
log('[8b] after Undo: input exists?', !!(await L.input(page, iidB)), ' lines still:\n    ' + (L.fmt((await L.notices(page)).filter(n => n.iid === iidB)) || 'none'))
// Redo the filing — RECORD
await page.click('#redoBtn'); await page.waitForTimeout(700)
log('[8b] after Redo: input exists?', !!(await L.input(page, iidB)), ' lines:\n    ' + (L.fmt((await L.notices(page)).filter(n => n.iid === iidB)) || 'none'))
await L.signOut(page)
for (const [who, fn] of [['ranger', L.as.ranger], ['hex', L.as.hex]]) {
  log(who + ':', await fn(page))
  const rb = await L.readBell(page, `${P}-${who}-bell`)
  log(who.toUpperCase() + ' bell:', L.bellText(rb), JSON.stringify(rb.lit))
  await L.signOut(page)
}
log('errors', JSON.stringify(errs))
await b.close()
