/* helper walk S11 (+S12): published with the cancel on, then un-cancelled.
   usage: DL_BASE=... DL_SHOTS=... node scripts/handpass/ou-h-3.mjs [desk|phone] */
import { L, J, bstate, publish, file, mark, board, closeBoard, rowBtn, uncx, makeHoliday, closeWindows, sheet, bar, list, noteNow, rec, undo, redo, faces, signAs, bellLines, closeBell, pendText, closePend, FRI, FRI_ISO, rowOut, part } from './ou-h-0.mjs'
import { lwCell } from './lib.mjs'
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE, S = `S11 ${T}`
const w = await L.world(SIZE), p = w.page
console.log('ou-h-3 S11/S12 version 1', SIZE)
const readPend = async () => {
  await board(w, FRI)
  const b = await bstate(p)
  return b
}
try {
  let A
  await part(w, S, 'S11a fixture', 'filed Friday, cancelled, published, Friday made a holiday; no list for the cancelled input (D814)', async () => {
    A = await file(w, FRI_ISO, 'bane', 'Range brief')
    await mark(w, FRI, A.id, 'cx')
    await board(w, FRI)
    const pub = await publish(p, FRI); await L.sleep(600)
    const b1 = await bstate(p)
    await closeBoard(w)
    const h = await makeHoliday(w, FRI_ISO)
    await L.pic(w, `S11a-holiday-${T}`)
    await closeWindows(w)
    const r = await rec(p, A.id)
    rowOut(S, 'S11a fixture', 'filed Friday, cancelled, published, Friday made a holiday; no list for the cancelled input (D814)',
      `filed asked ${A.asked}; publish ${J(pub)}; board after publish ${J(b1)}; the holiday's list ${J(h.list)}, note "${h.note}"; input ${J(r)}`,
      !A.asked && pub.published && r.cx && !(h.list && h.list.ids.includes(A.id)))
  })
  let before, pend0
  await part(w, S, 'S11b the board before the un-cancel', 'recorded: the pending count and its list as the holiday left them', async () => {
    await board(w, FRI)
    before = await bstate(p)
    pend0 = await pendText(w)
    await L.pic(w, `S11b-before-${T}`)
    await closePend(w)
    rowOut(S, 'S11b the board before the un-cancel', 'RECORD: what the holiday alone leaves pending', `board ${J(before)}; its pending list reads ${J(pend0)}`, !!before)
  })
  await part(w, S, 'S12a not answered', 'nothing changed: pending and sign-offs as before; the bar up', async () => {
    await uncx(w, FRI, A.id)
    const q = await sheet(p)
    await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(500)
    const bb = await bar(p), r = await rec(p, A.id), b = await bstate(p)
    await L.pic(w, `S12a-not-answered-${T}`)
    rowOut('S12 ' + T, 'S12a not answered', 'pending unchanged, sign-offs intact, still cancelled with its reason', `sheet ${J(q)}; bar ${J(bb)}; input ${J(r)}; board ${J(b)} (before ${J(before)})`,
      !!q && !!bb && r.cx && r.cxr === 'WX' && !r.oil && b.pend === before.pend && b.so === before.so && b.nys === before.nys)
  })
  await part(w, S, 'S11c Answer OIL → Yes → Un-cancel', 'answered; one more change pending naming its people; sign-offs not rising', async () => {
    await w.press('[data-testid="oilbar-answer"]'); await L.sleep(500)
    const q = await sheet(p)
    await L.pic(w, `S11c-question-${T}`)
    await w.press('[data-testid="oil-yes"]'); await L.sleep(150)
    await w.press('[data-testid="oilconf-save"]'); await L.sleep(700)
    const note = await noteNow(p), r = await rec(p, A.id), b = await bstate(p)
    await L.pic(w, `S11c-after-${T}`)
    rowOut(S, 'S11c Answer OIL → Yes → Un-cancel', 'after Yes + Un-cancel: one more pending change than before; sign-offs still down (D103)',
      `sheet ${J(q)}; note "${note}"; input ${J(r)}; board ${J(b)} (before ${J(before)})`,
      !!q && !r.cx && !!r.oil && Number.parseInt(b.pend) === Number.parseInt(before.pend) + 1 && /to sign/.test(b.so || '') && /Not yet/.test(b.nys || ''))
  })
  let pend1
  await part(w, S, 'S11d the pending list names its people', 'the un-cancel is ONE item naming Ranger (D736)', async () => {
    pend1 = await pendText(w)
    await L.pic(w, `S11d-pendlist-${T}`)
    const n = ((pend1.txt || '').match(/Range brief/g) || []).length
    rowOut(S, 'S11d the pending list names its people', 'one item naming Ranger and Range brief; the other item (if any) was there before', `the list reads ${J(pend1)}; before the un-cancel it read ${J(pend0)}`, !!pend1.txt && /Ranger/.test(pend1.txt) && n === 1)
    await closePend(w)
  })
  await part(w, S, 'S12b Undo of the answered un-cancel', 'pending back to what it was; sign-offs as before; cancelled again', async () => {
    await closePend(w)
    await undo(p)
    const r = await rec(p, A.id), b = await bstate(p)
    await L.pic(w, `S12b-undo-${T}`)
    rowOut('S12 ' + T, 'S12b Undo of the answered un-cancel', 'pending as before the un-cancel; sign-offs as before; cancelled with its reason, no answer', `input ${J(r)}; board ${J(b)} (before ${J(before)})`,
      r.cx && r.cxr === 'WX' && !r.oil && b.pend === before.pend && b.so === before.so)
    await redo(p)
    const r2 = await rec(p, A.id), q = await sheet(p), b2 = await bstate(p)
    rowOut('S12 ' + T, 'S12c Redo', 'un-cancelled with its answer again, no question, pending +1', `input ${J(r2)}; a question ${J(q)}; board ${J(b2)}`, !r2.cx && !!r2.oil && !q && Number.parseInt(b2.pend) === Number.parseInt(before.pend) + 1)
  })
  await part(w, S, 'S11e the issued face stays cancelled (week)', 'View-only Sched still shows the cancelled face (D178, D179)', async () => {
    await closeBoard(w)
    await L.go(w, 'viewsched'); await L.sleep(700)
    const f = await faces(p, '#vWeek', 'Range brief')
    await L.pic(w, `S11e-viewonly-${T}`)
    rowOut(S, 'S11e the issued face in View-only Sched', 'still cancelled (struck / CX) on Friday', `faces ${J(f)}`, f.n > 0 && (f.struck > 0 || f.cxrows > 0))
  })
  await part(w, S, 'S11e2 the member sees the issued face', 'Ranger (member) still sees the cancelled face (D178, D179); no OIL question on his side', async () => {
    await signAs(w, 'us', 'us')
    await L.go(w, 'viewsched'); await L.sleep(700)
    const f = await faces(p, '#vWeek', 'Range brief')
    await L.pic(w, `S11e2-member-${T}`)
    const asked = await p.locator('[data-testid="oilconf"], [data-testid="win-oilday"]').count()
    rowOut(S, 'S11e2 the member sees the issued face', 'still cancelled (struck / CX) on Friday for the member too', `faces ${J(f)}; an OIL question or list open: ${asked}`, f.n > 0 && (f.struck > 0 || f.cxrows > 0) && !asked)
    await signAs(w, 'ad', 'a')
  })
  await part(w, S, 'S11f no Leave War credit before the amendment', 'Ranger has no HO/FO for Friday (D142)', async () => {
    const cell = await lwCell(p, ['bane'], FRI_ISO)
    await L.pic(w, `S11f-leavewar-before-${T}`)
    rowOut(S, 'S11f the Leave War cell before the amendment', 'no HO or FO credit on Fri 17', `cell ${J(cell)}`, !/HO|FO/.test(J(cell)))
  })
  await part(w, S, 'S11g Publish AL1 → credit shows', 'after Publish AL1 the credit shows; pending back to none', async () => {
    await board(w, FRI)
    const pub = await publish(p, FRI); await L.sleep(700)
    const b = await bstate(p)
    await L.pic(w, `S11g-published-${T}`)
    await closeBoard(w)
    const cell = await lwCell(p, ['bane'], FRI_ISO)
    await L.pic(w, `S11g-leavewar-after-${T}`)
    rowOut(S, 'S11g after Publish AL1', 'the amendment goes out; the Leave War shows an HO/FO for Ranger on Fri 17', `publish ${J(pub)}; board ${J(b)}; cell ${J(cell)}`, pub.published && /HO|FO/.test(J(cell)))
  })
} finally { await L.close(w) }
