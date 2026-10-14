/* helper walk S9: Undo of the cancel itself, the holiday in between.
   usage: DL_BASE=... DL_SHOTS=... node scripts/handpass/ou-h-4.mjs [desk|phone] */
import { L, J, bstate, file, mark, board, closeBoard, rowBtn, uncx, makeHoliday, closeWindows, sheet, bar, list, noteNow, rec, undo, redo, faces, signAs, bellLines, closeBell, pendText, closePend, cardOf, closeDay, FRI, FRI_ISO, rowOut, part } from './ou-h-0.mjs'
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE, S = `S9 ${T}`
const w = await L.world(SIZE), p = w.page
console.log('ou-h-4 S9 version 1', SIZE)
/** the OIL? tag on the board row, and the row's text */
const rowTag = (id) => p.evaluate(id => {
  const ri = window.DAYS[4].ground.findIndex(g => String(g.src) === id)
  if (ri < 0) return { row: null }
  const el = document.querySelector(`#schedBoard [data-grcx="4.${ri}"]`)
  const row = el && (el.closest('tr, .gr, .grow, [class*=row]') || el.parentElement.parentElement)
  const t = row ? (row.innerText || '').replace(/\s+/g, ' ').trim() : null
  return { row: t, oilq: !!t && /OIL\s*\?/.test(t) }
}, id)
try {
  let A, B
  await part(w, S, 'S9a0 as designed: file, cancel, holiday, then Undo', 'RECORD: what the first Undo takes back', async () => {
    A = await file(w, FRI_ISO, 'bane', 'Range brief')
    await mark(w, FRI, A.id, 'cx')
    const h = await makeHoliday(w, FRI_ISO)
    await closeWindows(w)
    await board(w, FRI)
    await undo(p)
    const q = await sheet(p), r = await rec(p, A.id), note = await noteNow(p)
    await L.pic(w, `S9a0-first-undo-${T}`)
    rowOut(S, 'S9a0 as designed: file, cancel, holiday, then Undo', 'RECORD: the first Undo takes back the holiday or the cancel', `A is ${A.id}; holidays list ${J(h.list)}; after Undo: sheet ${J(q)}, input ${J(r)}, note "${note}"`, true)
    await closeBoard(w)
  })
  await part(w, S, 'S9a fixture', 'a second input filed, the day made a holiday (list: Later), then cancelled: no question', async () => {
    B = await file(w, FRI_ISO, 'bane', 'Hangar brief', { start: '11:00', end: '12:00' })
    const h = await makeHoliday(w, FRI_ISO)
    if (h.list) { await w.press('[data-testid="odl-later"]'); await L.sleep(300) }
    await closeWindows(w)
    await mark(w, FRI, B.id, 'cx')
    const r = await rec(p, B.id)
    rowOut(S, "S9a fixture", "cancelled on the holiday with no question", `B is ${B.id}; A is ${A.id}; holidays list ${J(h.list)}; note "${h.note}"; input ${J(r)}`, r.cx && !r.oil)
  })
  await part(w, S, 'S9b Undo of the cancel', 'the Undo asks nothing; the input is live; an OIL? tag; the answerers bell lit', async () => {
    await board(w, FRI)
    const t0 = await rowTag(B.id)
    await undo(p)
    const q = await sheet(p), b2 = await bar(p), r = await rec(p, B.id), t1 = await rowTag(B.id), note = await noteNow(p)
    await L.pic(w, `S9b-after-undo-${T}`)
    rowOut(S, 'S9b Undo of the cancel', 'no question, no bar; the input live again (the OIL? tag is read on its Inputs card below)', `row before ${J(t0)}; after Undo: sheet ${J(q)}, bar ${J(b2)}, input ${J(r)}, row ${J(t1)}, note "${note}"`, !q && !b2 && !r.cx)
    await closeBoard(w)
    const card = await cardOf(w, FRI_ISO, B.id)
    await L.pic(w, `S9b-inputs-card-${T}`)
    rowOut(S, 'S9b the OIL? tag on the Inputs card', 'the input shows the outlined OIL? tag (nobody has answered)', `card ${J(card)}`, !!card && card.oilq && !card.cx)
    await closeDay(w)
    const bl = await bellLines(w)
    await L.pic(w, `S9b-schedulers-bell-${T}`)
    rowOut(S, 'S9b the schedulers bell (RECORD)', 'RECORD: whether the schedulers bell carries a line for the input', `bell ${J(bl)}`, true)
    await closeBell(w)
    await closeBoard(w)
  })
  await part(w, S, 'S9c the answerers own side', 'Rangers bell is lit for the input; pressing it brings him the OIL question for Hangar brief', async () => {
    await signAs(w, 'us', 'us')
    const note0 = await noteNow(p)
    const bl = await bellLines(w)
    const q = await p.evaluate(() => { const e = document.querySelector('[data-testid="oilconf"]'); return e ? (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 300) : null })
    const note = await noteNow(p)
    await L.pic(w, `S9c-member-bell-${T}`)
    rowOut(S, 'S9c the answerers own side', 'bell lit; pressing it opens the OIL question for Hangar brief', `note at sign-in "${note0}"; bell ${J(bl)}; after the press: question ${J(q)}, note "${note}"`, !!bl.badge && bl.badge.dot && !!q && /Hangar brief/.test(q))
    await p.evaluate(() => { const b = [...document.querySelectorAll('[data-testid="oilconf"] button')].find(x => /^Back$/.test(x.textContent.trim())); if (b) b.click() }); await L.sleep(400)
    await p.evaluate(() => { const b = document.querySelector('#inpEditCancel') || [...document.querySelectorAll('#inpEditPop button')].find(x => /^Cancel$/.test(x.textContent.trim())); if (b) b.click() }); await L.sleep(400)
    await signAs(w, 'ad', 'a')
  })
  await part(w, S, 'S9d CX on again, then off', 'CX on: no question; CX off: the question (D816)', async () => {
    await board(w, FRI)
    await rowBtn(w, FRI, B.id, 'grcx'); await p.fill('#cxReason', 'WX2'); await p.locator('#cxSave').evaluate(e => e.click()); await L.sleep(500)
    const qOn = await sheet(p), rOn = await rec(p, B.id)
    await uncx(w, FRI, B.id)
    const qOff = await sheet(p), rOff = await rec(p, B.id)
    await L.pic(w, `S9d-uncancel-question-${T}`)
    rowOut(S, 'S9d CX on again, then off', 'on: no question and cancelled; off: the question first, still cancelled', `on: sheet ${J(qOn)}, input ${J(rOn)}; off: sheet ${J(qOff)}, input ${J(rOff)}`, !qOn && rOn.cx && !!qOff && rOff.cx)
  })
} finally { await L.close(w) }
