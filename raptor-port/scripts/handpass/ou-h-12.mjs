/* helper walk S23: the rules behind the question — a clash that must not appear until the un-cancel is really made.
   usage: DL_BASE=... DL_SHOTS=... node scripts/handpass/ou-h-12.mjs [desk|phone] */
import { L, J, file, mark, board, closeBoard, uncx, makeHoliday, closeWindows, sheet, bar, noteNow, rec, WED, WED_ISO, rowOut, part } from './ou-h-0.mjs'
import { warnings } from './lib.mjs'
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE, S = `S23 ${T}`
const w = await L.world(SIZE), p = w.page
console.log('ou-h-12 S23 version 1', SIZE)
const issues = async () => {
  const wn = await warnings(p)
  const dayIssues = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-warn, #schedBoard [data-issuebar], #schedBoard .issuebar, #sbSide')].map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 200)).filter(Boolean).slice(0, 2))
  return { head: wn.head, lines: wn.lines.filter(l => /Trident|clash|rest/i.test(l)).slice(0, 4), all: wn.lines.length }
}
try {
  let A, trident
  await part(w, S, 'S23a fixture', 'Trident (flying on Wednesday 08:15-12:00) has a 09:00-10:00 input; cancelled; Wednesday a holiday', async () => {
    trident = await p.evaluate(() => Object.entries(window.PEOPLE).find(([k, v]) => v.cs === 'Trident')[0])
    A = await file(w, '2026-07-15', trident, 'Range brief')
    await mark(w, WED, A.id, 'cx')
    const h = await makeHoliday(w, WED_ISO); await closeWindows(w)
    await board(w, WED)
    const i0 = await issues()
    await L.pic(w, `S23a-cancelled-${T}`)
    const r = await rec(p, A.id)
    rowOut(S, 'S23a fixture', 'cancelled; issues recorded as the baseline', `person id ${trident}; asked ${A.asked}; holiday's list ${J(h.list && h.list.ids.includes(A.id))}; issues ${J(i0)}; input ${J(r)}`, r.cx && !r.oil)
    A.i0 = i0
  })
  await part(w, S, 'S23b the question open: nothing behind it changes', 'the day\'s issues are unchanged behind the open question', async () => {
    await uncx(w, WED, A.id)
    const q = await sheet(p), i1 = await issues()
    await L.pic(w, `S23b-question-${T}`)
    rowOut(S, 'S23b behind the open question', 'issues as before (no clash for Trident)', `question ${J(q)}; issues ${J(i1)}; baseline ${J(A.i0)}`, !!q && J(i1) === J(A.i0))
    await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(500)
    const b = await bar(p), i2 = await issues()
    await L.pic(w, `S23b-bar-${T}`)
    rowOut(S, 'S23b under the bar after "Don\'t un-cancel"', 'issues as before; still cancelled', `bar ${J(b)}; issues ${J(i2)}; input ${J(await rec(p, A.id))}`, !!b && J(i2) === J(A.i0))
  })
  await part(w, S, 'S23c after the answered un-cancel', 'the clash for Trident appears now', async () => {
    await w.press('[data-testid="oilbar-answer"]'); await L.sleep(450)
    await w.press('[data-testid="oil-yes"]'); await L.sleep(150); await w.press('[data-testid="oilconf-save"]'); await L.sleep(800)
    const i3 = await issues(), r = await rec(p, A.id)
    await L.pic(w, `S23c-after-${T}`)
    rowOut(S, 'S23c after the un-cancel', 'the issues now include a clash naming Trident', `issues ${J(i3)}; baseline ${J(A.i0)}; input ${J(r)}`, !r.cx && (i3.lines.length > A.i0.lines.length || i3.all > A.i0.all))
    await closeBoard(w)
  })
} finally { await L.close(w) }
