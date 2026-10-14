/* helper walk S9: Undo of the cancel itself, the holiday in between.
   usage: DL_BASE=... DL_SHOTS=... node scripts/handpass/ou-h-4.mjs [desk|phone] */
import { L, J, bstate, file, mark, board, closeBoard, rowBtn, uncx, makeHoliday, closeWindows, sheet, bar, list, noteNow, rec, undo, redo, faces, signAs, bellLines, closeBell, pendText, closePend, FRI, FRI_ISO, rowOut, part } from './ou-h-0.mjs'
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
  let A
  await part(w, S, 'S9a fixture', 'filed, cancelled, the day made a holiday: no question, the cancelled input not in the list (D814)', async () => {
    A = await file(w, FRI_ISO, 'bane', 'Range brief')
    await mark(w, FRI, A.id, 'cx')
    const h = await makeHoliday(w, FRI_ISO)
    await closeWindows(w)
    const r = await rec(p, A.id)
    rowOut(S, 'S9a fixture', 'cancelled; no question at the holiday; not in the list', `holiday's list ${J(h.list)}; note "${h.note}"; input ${J(r)}`, r.cx && !(h.list && h.list.ids.includes(A.id)))
  })
  await part(w, S, 'S9b Undo of the cancel', 'the Undo asks nothing; the input is live; an OIL? tag; a place in the day\'s one list; the answerer\'s bell lit', async () => {
    await board(w, FRI)
    const t0 = await rowTag(A.id)
    await undo(p)
    const q = await sheet(p), b = await bar(p), r = await rec(p, A.id), t1 = await rowTag(A.id), note = await noteNow(p)
    await L.pic(w, `S9b-after-undo-${T}`)
    rowOut(S, 'S9b Undo of the cancel', 'no question; live; "OIL?" tag on its row (D814, D816 reading 4)', `row before ${J(t0)}; after Undo: sheet ${J(q)}, bar ${J(b)}, input ${J(r)}, row ${J(t1)}, note "${note}"`, !q && !b && !r.cx && !!t1.oilq)
    const bl = await bellLines(w)
    await L.pic(w, `S9b-schedulers-bell-${T}`)
    rowOut(S, 'S9b the schedulers\' bell (RECORD)', 'RECORD: whether the schedulers\' bell carries a line for the input', `bell ${J(bl)}`, true)
    await closeBell(w)
    await closeBoard(w)
  })
  await part(w, S, 'S9c the answerer\'s bell and the one list', 'Ranger (the answerer) is asked in his bell; the admin can open the day\'s list with the input in it', async () => {
    // the admin's one list: reached by the bell line (if any) or the Inputs page
    const l0 = await list(p)
    await signAs(w, 'us', 'us')
    const bl = await bellLines(w)
    await L.pic(w, `S9c-member-bell-${T}`)
    rowOut(S, 'S9c the answerer\'s own bell', 'a line asking him an OIL question for Range brief', `bell ${J(bl)}`, !!bl.txt && /OIL|Range brief/i.test(bl.txt))
    await closeBell(w)
    await signAs(w, 'ad', 'a')
  })
  await part(w, S, 'S9d CX on again, then off', 'CX on: no question; CX off: the question (D816)', async () => {
    await board(w, FRI)
    await rowBtn(w, FRI, A.id, 'grcx'); await p.fill('#cxReason', 'WX2'); await p.locator('#cxSave').evaluate(e => e.click()); await L.sleep(500)
    const qOn = await sheet(p), rOn = await rec(p, A.id)
    await uncx(w, FRI, A.id)
    const qOff = await sheet(p), rOff = await rec(p, A.id)
    await L.pic(w, `S9d-uncancel-question-${T}`)
    rowOut(S, 'S9d CX on again, then off', 'on: no question and cancelled; off: the question first, still cancelled', `on: sheet ${J(qOn)}, input ${J(rOn)}; off: sheet ${J(qOff)}, input ${J(rOff)}`, !qOn && rOn.cx && !!qOff && rOff.cx)
  })
} finally { await L.close(w) }
