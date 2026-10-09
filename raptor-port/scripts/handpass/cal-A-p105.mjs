import * as H from './cal-A-lib2.mjs'
const { tid, sleep, eq } = H
const SIZE = process.env.SIZE || 'desk'
const w = await H.world(SIZE)
const D = '2026-07-27' // Monday; no SANS commitments in the demo that day
const o = {}
await H.warOpen(w)
await H.warJump(w, D)
o.base = await H.warText(w, D)
const need3 = +o.base.availP + 3
await H.typeReq(w, 'p', D, need3)
o.afterReq = await H.warText(w, D)
await H.openSans(w)
o.filedA = await H.sansFile(w, D, 'Zenith', { f: true, o: true, a: true })   // F + O + A
await H.sansClose(w)
o.filedB = await H.sansFile(w, D, 'Bolt', { f: false, o: true, a: true })    // O + A only
await H.sansClose(w)
await H.sansGoto(w, D)
o.cell = await H.sansCell(w, D)
await H.sansOpen(w, D)
o.day = await H.sansDayRead(w)
const p0 = await H.pic(w, 'p105-sans-day')
await H.sansClose(w)
// a duplicate, overlapping offer for the first man
await H.sansOpen(w, D)
await w.press(tid(w.page, 'sd-add')); await w.page.waitForSelector('#inpEditPerson'); await sleep(300)
await w.page.selectOption('#inpEditPerson', { label: 'Zenith' })
await w.press(w.page.locator('#inpEditSave')); await sleep(900)
o.dup = await tid(w.page, 'win-inputedit').isVisible().then(v => v ? tid(w.page, 'win-inputedit').innerText().then(t => t.replace(/\s+/g, ' ').trim()) : 'closed (saved)').catch(() => 'n/a')
o.toast = await w.page.evaluate(() => { const m = document.body.innerText.match(/A SANS availability[^\n]*/); return m ? m[0] : null })
const p1 = await H.pic(w, 'p105-duplicate-refused')
const cancel = w.page.locator('[data-testid="win-inputedit"] button', { hasText: 'Cancel' })
if (await cancel.count()) { await w.press(cancel.first()); await sleep(400) }
await H.sansClose(w)
await H.sansGoto(w, D)
o.cellAfterDup = await H.sansCell(w, D)
await H.sansOpen(w, D)
o.dayAfterDup = await H.sansDayRead(w)
await H.warOpen(w); await H.warJump(w, D)
o.work = await H.warWork(w, 'p', D)
const p2 = await H.pic(w, 'p105-war-working')
const refused = !/closed \(saved\)/.test(o.dup)
H.judge('P1-05', `${SIZE}: Mon 27 Jul 26: Required P = Available P + 3; "+ Commitment" for Zenith with Fly + OFT + AMT, for Bolt with OFT + AMT only; then a second overlapping commitment for Zenith; read on the SANS month, opened day and the Leave War working box`, [
  [`Required exceeds Available by three (${o.afterReq.reqP} vs ${o.afterReq.availP})`, +o.afterReq.reqP === +o.afterReq.availP + 3, o.afterReq],
  [`both filings went through`, !o.filedA.stillOpen && !o.filedB.stillOpen, [o.filedA, o.filedB]],
  [`SANS month cell: F 1 pilot, O 2 pilots, A 2 pilots; still needed 2 pilots`, /^F 1 /.test(o.cell.f) && /^O 2 /.test(o.cell.o) && /^A 2 /.test(o.cell.a) && /^2 /.test(o.cell.need), [o.cell.f, o.cell.o, o.cell.a, o.cell.need]],
  [`opened day: committed to fly 1, still needed 2 (O and A do not fill the flying need)`, o.day.sans[0] === '1' && o.day.need[0] === '2', o.day],
  [`the duplicate was refused with a reason and the window stayed`, refused && !!o.toast, o.toast],
  [`nothing changed after the refusal (cell and opened day identical)`, eq(o.cell, o.cellAfterDup) && eq(o.day.list, o.dayAfterDup.list) && eq(o.day.need, o.dayAfterDup.need), [o.cellAfterDup.f, o.cellAfterDup.o, o.cellAfterDup.a]],
  [`Leave War working box agrees: committed to fly 1, still needed 2`, /SANS committed to fly 1 Still needed 2$/.test(o.work), o.work],
  ['no console or page errors', w.errors.length === 0, w.errors],
], [p0, p1, p2])
H.savePart('P1-05-' + SIZE, { out: o })
await H.closeAll(w)
