/* THE HOST'S SECOND WALK OF THE SMALL OIL JOB — the published version loaded back (owner D818;
   `[OIL-LOAD-VERSION-UNASKED]`) and the un-cancel's edges (D816): the designer's S24–S26, S10, S18, S19 (ii).
   Assertions of the RIGHT behaviour on the built app, with pictures; where a ruling does not decide, the row RECORDS.
     L0 the fixture: two inputs on a published Friday; Friday made a public holiday; one answered, one left for later
     L1 both taken off, the Original loaded back: the note's tail counts ONE; the day's one list opens with that one,
        reachable (at a phone's size from the Scheduler Board, above it — S25), the note not over its buttons (S24)
     L2 answered in the list; taken off and loaded again: no tail, no list (S26)
     E1 an input already answered, cancelled and un-cancelled: at once, no question, the answer counts again (S10)
     E2 a second press while one waits: the same input again; another input; the bar follows the last (S18)
     E3 changed meanwhile: the bar up, then Undo, then "Answer OIL" (S19 ii)
   usage: DL_BASE=http://localhost:4174 DL_SHOTS=docs/img/handpass/2026-10-14-oil-uncancel-load node scripts/handpass/ou-walk-2.mjs [phone|desk] */
import { L, rowOut, part, SAT, FRI, SAT_ISO, FRI_ISO, noteNow, rec, board, closeBoard, rowBtn, sheet, bar, list, file, mark, fixture, uncx, makeHoliday, closeWindows, loadVersion } from './ou-lib.mjs'
import { publish } from './lib.mjs'

const SIZE = process.argv[2] === 'desk' ? 'desk' : 'phone', T = SIZE
const J = x => JSON.stringify(x)
const undo = async p => { await p.evaluate(() => { const b = [...document.querySelectorAll('#sbUndo, #undoBtn')].find(e => e.getClientRects().length && !e.disabled); if (b) b.click() }); await L.sleep(650) }

{ /* ───── the load ───── */
  const w = await L.world(SIZE), p = w.page, S = `L ${T}`
  try {
    let A, B
    await part(w, S, 'L0 two inputs on a published Friday; Friday made a public holiday', 'filed on a working day with no question; published; the holiday opens the one list with both (and whatever else of that day is open); one answered, one left', async () => {
      A = await file(w, FRI_ISO, 'bane', 'Range brief')
      B = await file(w, FRI_ISO, 'pike', 'Hangar brief', { start: '11:00', end: '12:00' })
      await board(w, FRI)
      const pub = await publish(p, FRI); await L.sleep(600)
      await closeBoard(w)
      const h = await makeHoliday(w, FRI_ISO)
      await L.pic(w, `L0-holiday-list-${T}`)
      await w.press(`[data-testid="odl-yes-${A.id}"]`); await L.sleep(150)
      await w.press('[data-testid="odl-save"]'); await L.sleep(600)
      const after = await list(p)
      if (after) { await w.press('[data-testid="odl-later"]'); await L.sleep(300) }
      await closeWindows(w)
      const a = await rec(p, A.id), b = await rec(p, B.id)
      rowOut(S, 'L0 two inputs on a published Friday; Friday made a public holiday', 'filed on a working day with no question; published; the holiday opens the one list with both (and whatever else of that day is open); one answered, one left',
        `asked at the filing: ${A.asked}/${B.asked}; publish ${J(pub)}; the holiday's list ${J(h.list)}; after Save ${J(after)}; A ${J(a)}; B ${J(b)}`,
        !A.asked && !B.asked && pub.published && !!h.list && h.list.ids.includes(A.id) && h.list.ids.includes(B.id) && !!a.oil && a.oil[FRI_ISO] != null && !b.oil)
    })
    await part(w, S, 'L1 both taken off; the Original loaded back', 'the note ends "1 input needs an OIL answer."; that day\'s one list opens with that input and without the answered one, headed as a public holiday, reachable; the load is made', async () => {
      await board(w, FRI)
      await rowBtn(w, FRI, A.id, 'grdel'); await L.sleep(300)
      await rowBtn(w, FRI, B.id, 'grdel'); await L.sleep(300)
      const off = { a: await rec(p, A.id), b: await rec(p, B.id) }
      const where = w.phone ? 'board' : 'week'
      if (!w.phone) await closeBoard(w)
      const r = await loadVersion(w, FRI, where)
      await L.pic(w, `L1-loaded-${where}-${T}`)
      const on = { a: await rec(p, A.id), b: await rec(p, B.id) }
      rowOut(S, 'L1 both taken off; the Original loaded back', 'the note ends "1 input needs an OIL answer."; that day\'s one list opens with that input and without the answered one, headed as a public holiday, reachable; the load is made',
        `from the ${where}; taken off: A ${J(off.a)}, B ${J(off.b)}; the button "${r.first}"${r.second ? ' then "' + r.second + '"' : ''}; note "${r.note}"; the list ${J(r.list)}; back on: A ${J(on.a)}, B ${J(on.b)}`,
        off.a.acc !== 'g' && off.b.acc !== 'g' && / 1 input needs an OIL answer\.$/.test(r.note) && !!r.list && r.list.ids.includes(B.id) && !r.list.ids.includes(A.id) && /Public holiday/.test(r.list.head) && r.list.reach === true && on.a.acc === 'g' && on.b.acc === 'g')
      if (r.list && r.list.noteOver) rowOut(S, 'L1b the note and the list\'s buttons', 'the passing note is not over the list\'s buttons', 'the note overlaps a button of the list while it shows', false)
    })
    await part(w, S, 'L2 answered in the list; taken off and loaded again', 'the answer is written from the list; the second load says nothing of OIL and opens no list', async () => {
      await w.press(`[data-testid="odl-yes-${B.id}"]`); await L.sleep(150)
      await w.press('[data-testid="odl-save"]'); await L.sleep(600)
      const gone = !(await list(p)), b1 = await rec(p, B.id)
      await closeWindows(w)
      await board(w, FRI)
      await rowBtn(w, FRI, B.id, 'grdel'); await L.sleep(300)
      const where = w.phone ? 'board' : 'week'
      if (!w.phone) await closeBoard(w)
      const r = await loadVersion(w, FRI, where)
      await L.pic(w, `L2-loaded-again-${T}`)
      rowOut(S, 'L2 answered in the list; taken off and loaded again', 'the answer is written from the list; the second load says nothing of OIL and opens no list',
        `the list closed on Save: ${gone}; B ${J(b1)}; the second load's note "${r.note}"; a list: ${J(r.list)}`,
        gone && !!b1.oil && b1.oil[FRI_ISO] != null && / is back to /.test(r.note) && !/OIL/.test(r.note) && !r.list)
    })
  } finally { await L.close(w) }
}

{ /* ───── the un-cancel's edges ───── */
  const w = await L.world(SIZE), p = w.page, S = `E ${T}`
  try {
    await part(w, S, 'E1 already answered: cancelled, then un-cancelled', 'no question; "Restored" at once; the same answer counts again — a Yes and a No alike', async () => {
      const Y = await file(w, SAT_ISO, 'stiff', 'Answered yes', { oil: 'yes', start: '11:00', end: '12:00' })
      const N = await file(w, SAT_ISO, 'stiff', 'Answered no', { oil: 'no', start: '13:00', end: '14:00' })
      const y0 = await rec(p, Y.id), n0 = await rec(p, N.id)
      await mark(w, SAT, Y.id, 'cx'); await mark(w, SAT, N.id, 'cx')
      const ym = await rec(p, Y.id)
      await board(w, SAT)
      await uncx(w, SAT, Y.id); const qY = await sheet(p), noteY = await noteNow(p)
      await L.sleep(3300)
      await uncx(w, SAT, N.id); const qN = await sheet(p), noteN = await noteNow(p)
      const y1 = await rec(p, Y.id), n1 = await rec(p, N.id)
      await closeBoard(w)
      rowOut(S, 'E1 already answered: cancelled, then un-cancelled', 'no question; "Restored" at once; the same answer counts again — a Yes and a No alike',
        `asked at the filing: ${Y.asked}/${N.asked}; filed ${J(y0)} / ${J(n0)}; cancelled ${J(ym)}; a question at the un-cancel: ${!!qY}/${!!qN}; notes "${noteY}" / "${noteN}"; after ${J(y1)} / ${J(n1)}`,
        Y.asked && N.asked && ym.cx && !qY && !qN && noteY === 'Restored' && noteN === 'Restored' && !y1.cx && !n1.cx && J(y1.oil) === J(y0.oil) && J(n1.oil) === J(n0.oil) && !!y0.oil && !!n0.oil)
    })
    let X, Y2
    await part(w, S, 'E2 a second press while one waits', 'the same input again: asked again, nothing changed; another input: its own question; left, the bar is the last one\'s and "Answer OIL" asks for that one; nothing is un-cancelled unanswered', async () => {
      X = await fixture(w, 'bane', 'Range brief'); Y2 = await fixture(w, 'pike', 'Hangar brief')
      await board(w, SAT)
      await uncx(w, SAT, X.id); const q1 = await sheet(p)
      await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(450); const b1 = await bar(p)
      await uncx(w, SAT, X.id); const q2 = await sheet(p)
      await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(450); const b2 = await bar(p)
      await uncx(w, SAT, Y2.id); const q3 = await sheet(p)
      await L.pic(w, `E2-second-input-${T}`)
      await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(450); const b3 = await bar(p)
      await w.press('[data-testid="oilbar-answer"]'); await L.sleep(450); const q4 = await sheet(p)
      await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(450)
      const x = await rec(p, X.id), y = await rec(p, Y2.id)
      rowOut(S, 'E2 a second press while one waits', 'the same input again: asked again, nothing changed; another input: its own question; left, the bar is the last one\'s and "Answer OIL" asks for that one; nothing is un-cancelled unanswered',
        `X asked "${q1 && q1.lead}", bar ${J(b1)}; X again "${q2 && q2.lead}", bar ${J(b2)}; Y asked "${q3 && q3.lead}", bar ${J(b3)}; "Answer OIL" then asks "${q4 && q4.lead}"; X ${J(x)}; Y ${J(y)}`,
        !!q1 && /Range brief/.test(q1.lead) && !!q2 && /Range brief/.test(q2.lead) && !!q3 && /Hangar brief/.test(q3.lead) && !!q4 && /Hangar brief/.test(q4.lead) && !!b1 && !!b2 && !!b3 && b3.lines === 1 && x.cx && y.cx && !x.oil && !y.oil)
    })
    await part(w, S, 'E3 changed meanwhile: the bar up, Undo, then "Answer OIL"', 'RECORD (Q6): the Undo takes the move to Saturday back, so nothing is to be asked — "Answer OIL" un-cancels it at once on its working day, or the bar has gone; never a Saturday answer on a Wednesday input', async () => {
      const b0 = await bar(p)
      await undo(p)
      const y1 = await rec(p, Y2.id), b1 = await bar(p)
      let note = '', q = null
      if (b1) { await w.press('[data-testid="oilbar-answer"]'); await L.sleep(500); q = await sheet(p); note = await noteNow(p) }
      const y2 = await rec(p, Y2.id)
      await L.pic(w, `E3-after-undo-${T}`)
      rowOut(S, 'E3 changed meanwhile: the bar up, Undo, then "Answer OIL"', 'RECORD (Q6): the Undo takes the move to Saturday back, so nothing is to be asked — "Answer OIL" un-cancels it at once on its working day, or the bar has gone; never a Saturday answer on a Wednesday input',
        `the bar before ${J(b0)}; after Undo the input ${J(y1)}, the bar ${J(b1)}; "Answer OIL": a question ${J(q)}, note "${note}"; the input then ${J(y2)}`,
        !!b0 && y1.date === 'Jul 15' && !y2.oil && !q)
    })
  } finally { await L.close(w) }
}
