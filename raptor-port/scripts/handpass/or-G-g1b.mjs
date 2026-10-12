// G1 variant with HEX (a man who is on the Leave War) in Tally's place - Tally is a SANS man and has no Leave War row.
import { open, fileInput, toWeek, toView, shot, browser, errs, readRows, inputsRead, signAndPublish, counts, sleep, toastMark, toastsSince, dragLocToLoc, rosterPuckOf, weekRow, lwCells, lwTracker, lwCloseSheet, csId, saveData } from './or-G-lib.mjs'
const rec = {}
const { ctx, page } = await open()
await fileInput(page, { type: 'Training', person: 'Ranger', from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], title: 'Range brief', oil: 'yes' })
rec.pub1 = await signAndPublish(page, 5)
const R = await csId(page, 'Ranger'), H = await csId(page, 'Hex')
async function lw(tag) {
  const c = await lwCells(page, [R, H]); const tr = await lwTracker(page); const t = tr.text || ''
  const seg = n => { const i = t.indexOf(n); return i >= 0 ? t.slice(i, i + 110) : 'NO ' + n + ' in tracker text' }
  await shot(page, tag); await lwCloseSheet(page)
  return { cells: c, ranger: seg('Ranger IP'), hex: seg('Hex C') }
}
rec.A = await lw('G1b-A-lw'); console.log('A', JSON.stringify(rec.A))
await toWeek(page)
let m = await toastMark(page)
await dragLocToLoc(page, rosterPuckOf(page, H), weekRow(page, 5, 'Range brief').locator('.addz'))
rec.B = { toast: await toastsSince(page, m), counts: await counts(page, 5), lw: await lw('G1b-B-lw'), inputs: (await inputsRead(page)).filter(r => r.title === 'Range brief') }
await toView(page); rec.B.view = (await readRows(page, 'Range brief')).viewWeek
console.log('B', JSON.stringify(rec.B))
rec.C0 = await signAndPublish(page, 5)
rec.C = { counts: await counts(page, 5), lw: await lw('G1b-C-lw') }
await toView(page); rec.C.view = (await readRows(page, 'Range brief')).viewWeek
console.log('C', JSON.stringify(rec.C))
saveData('G1b_hex', rec)
console.log('errs', JSON.stringify(errs))
await ctx.close(); await browser.close()
