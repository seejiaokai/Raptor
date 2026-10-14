/* helper walk S15 (the admin's drag half): a cancelled input dragged to a Saturday on the Inputs calendar.
   usage: DL_BASE=... DL_SHOTS=... node scripts/handpass/ou-h-11.mjs desk */
import { L, J, file, mark, board, closeBoard, uncx, sheet, bar, noteNow, rec, inputsCal, FRI, SAT, FRI_ISO, SAT_ISO, rowOut, part } from './ou-h-0.mjs'
const w = await L.world('desk'), p = w.page, S = 'S15 desk'
console.log('ou-h-11 S15 version 1')
try {
  let A
  await part(w, S, 'S15a fixture', 'a Friday input cancelled', async () => {
    A = await file(w, FRI_ISO, 'bane', 'Range brief')
    await mark(w, FRI, A.id, 'cx')
    const r = await rec(p, A.id)
    rowOut(S, 'S15a fixture', 'cancelled, no answer, on Fri 17', `asked ${A.asked}; ${J(r)}`, r.cx && !r.oil && !A.asked)
  })
  await part(w, S, 'S15b the chip dragged to Saturday', 'no OIL question at the move (D814); still cancelled; its date Sat 18', async () => {
    await inputsCal(w, '2026-07-13')
    const chip = p.locator(`[data-testid^="ib-bar-${A.id.slice(0, 12)}"]`).first()
    const cell = p.locator(`[data-icday="${SAT_ISO}"]`).first()
    await chip.scrollIntoViewIfNeeded()
    const a = await chip.boundingBox(), b = await cell.boundingBox()
    await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down(); await L.sleep(150)
    for (let i = 1; i <= 12; i++) { await p.mouse.move(a.x + a.width / 2 + (b.x + b.width / 2 - a.x - a.width / 2) * i / 12, a.y + a.height / 2 + (b.y + b.height / 2 - a.y - a.height / 2) * i / 12); await L.sleep(40) }
    await L.pic(w, 'S15b-dragging-desk')
    await p.mouse.up(); await L.sleep(900)
    const q = await sheet(p), r = await rec(p, A.id), note = await noteNow(p)
    await L.pic(w, 'S15b-after-drop-desk')
    rowOut(S, 'S15b dragged to Saturday while cancelled', 'no question; moved to Sat 18; still cancelled; no answer', `question ${J(q)}; note "${note}"; input ${J(r)}`, !q && r.date === 'Jul 18' && r.cx && !r.oil)
  })
  await part(w, S, 'S15c CX off on Saturday', 'the question (the ruling\'s own named case)', async () => {
    await board(w, SAT)
    await uncx(w, SAT, A.id)
    const q = await sheet(p), r0 = await rec(p, A.id)
    await L.pic(w, 'S15c-question-desk')
    rowOut(S, 'S15c CX off on Saturday', 'the OIL question first; nothing un-cancelled yet', `question ${J(q)}; input ${J(r0)}`, !!q && q.yesDisabled && r0.cx)
    await w.press('[data-testid="oil-yes"]'); await L.sleep(150); await w.press('[data-testid="oilconf-save"]'); await L.sleep(700)
    const r = await rec(p, A.id)
    rowOut(S, 'S15d answered', 'Un-cancelled with the answer', `input ${J(r)}`, !r.cx && !!r.oil)
    await closeBoard(w)
  })
} finally { await L.close(w) }
