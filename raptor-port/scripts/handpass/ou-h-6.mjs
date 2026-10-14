/* helper walk S13: an input for several people, filed by a member (Ranger), cancelled, the day a holiday, then the cancel taken off.
   usage: DL_BASE=... DL_SHOTS=... node scripts/handpass/ou-h-6.mjs [desk|phone] */
import { L, J, bstate, publish, file, fileSev, mark, board, closeBoard, rowBtn, uncx, makeHoliday, closeWindows, sheet, bar, list, noteNow, rec, undo, signAs, bellLines, closeBell, cardOf, closeDay, FRI, FRI_ISO, rowOut, part } from './ou-h-0.mjs'
import { lwCell } from './lib.mjs'
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE, S = `S13 ${T}`
const w = await L.world(SIZE), p = w.page
console.log('ou-h-6 S13 version 1', SIZE)
const full = id => p.evaluate(id => { const r = window.INPUTS.find(x => String(x.iid) === id); return r ? JSON.parse(JSON.stringify(r)) : null }, id)
try {
  let F
  await part(w, S, 'S13a fixture: Ranger files for three people on a working Friday', 'no question at the filing (working day); one input holding the three', async () => {
    await signAs(w, 'us', 'us')
    F = await fileSev(w, FRI_ISO, ['Ranger', 'Nomad', 'Ace'], 'Range brief')
    const r = await full(F.id)
    await L.pic(w, `S13a-filed-${T}`)
    rowOut(S, 'S13a fixture', 'no question; one input for three people', `asked ${F.asked}; record ${J(r)}`, !!r && !F.asked)
    await signAs(w, 'ad', 'a')
  })
  await part(w, S, 'S13b cancel on the board, the day a holiday', 'cancelled; the cancelled input is not in the holiday list', async () => {
    await mark(w, FRI, F.id, 'cx')
    const h = await makeHoliday(w, FRI_ISO)
    await closeWindows(w)
    const r = await rec(p, F.id)
    rowOut(S, 'S13b cancel, holiday', 'cancelled, no answer; not in the list', `holiday's list ${J(h.list)}; input ${J(r)}`, r.cx && !r.oil && !(h.list && h.list.ids.includes(F.id)))
  })
  await part(w, S, 'S13c CX off: one question for everyone', 'ONE question, headed for everyone; one answer; Un-cancel', async () => {
    await board(w, FRI)
    await uncx(w, FRI, F.id)
    const q = await sheet(p)
    const extra = await p.evaluate(() => document.querySelectorAll('[data-testid="oilconf"]').length)
    await L.pic(w, `S13c-question-${T}`)
    await w.press('[data-testid="oil-yes"]'); await L.sleep(150)
    await w.press('[data-testid="oilconf-save"]'); await L.sleep(700)
    const note = await noteNow(p), r = await full(F.id), q2 = await sheet(p)
    await L.pic(w, `S13c-after-${T}`)
    rowOut(S, 'S13c CX off for several', 'ONE question (one sheet), then one answer for all three; a second question does not follow', `sheet ${J(q)} (sheets open: ${extra}); note "${note}"; record ${J(r)}; a second sheet ${J(q2)}`, !!q && extra === 1 && !q2 && !r.cx && !!r.oil)
    await closeBoard(w)
  })
  await part(w, S, 'S13d the OIL line in the input window', 'states ONE answer and who gave it (D762, D782)', async () => {
    const card = await cardOf(w, FRI_ISO, F.id)
    const open = await p.evaluate(id => { const b = document.querySelector(`[data-testid="idy-row-${id}"] [data-testid="idy-open"]`); if (!b) return false; b.click(); return true }, F.id)
    await L.sleep(700)
    const oil = await p.evaluate(() => { const pop = document.querySelector('#inpEditPop'); if (!pop) return null; const t = (pop.innerText || '').replace(/\s+/g, ' '); const i = t.indexOf('OIL'); return t.slice(Math.max(0, t.lastIndexOf('OIL', t.length) - 10), t.length).slice(0, 400) })
    await L.pic(w, `S13d-window-${T}`)
    rowOut(S, 'S13d the input window\'s OIL line (RECORD)', 'RECORD: one answer for all three and who gave it', `card ${J(card)}; window opened ${open}; its OIL part reads ${J(oil)}`, true)
    await p.evaluate(() => { const b = document.querySelector('#inpEditCancel'); if (b) b.click() }); await L.sleep(300)
    await closeDay(w)
  })
  await part(w, S, 'S13e Ranger\'s bell', 'Ranger (named, and the filer) is told "Un-cancelled" by Saber; no OIL question asked of him', async () => {
    await signAs(w, 'us', 'us')
    const bl = await bellLines(w)
    const q = await p.evaluate(() => { const e = document.querySelector('[data-testid="oilconf"]'); return e ? (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200) : null })
    await L.pic(w, `S13e-member-bell-${T}`)
    rowOut(S, 'S13e the member\'s bell', 'a line "Un-cancelled" naming Saber as who did it; no OIL question', `bell ${J(bl)}; a question open: ${J(q)}`, !!bl.txt && /Un-cancelled/i.test(bl.txt) && !q)
    await closeBell(w)
    await signAs(w, 'ad', 'a')
  })
  await part(w, S, 'S13f the admin\'s own bell', 'the admin who un-cancelled is not told', async () => {
    const bl = await bellLines(w)
    await L.pic(w, `S13f-admin-bell-${T}`)
    rowOut(S, 'S13f the admin\'s bell', 'no "Un-cancelled" line for the admin who did it', `bell ${J(bl)}`, !(bl.txt && /Un-cancelled/i.test(bl.txt)))
    await closeBell(w)
  })
  await part(w, S, 'S13g published: all three credited', 'after publishing Friday, each of the three has an HO/FO cell', async () => {
    await board(w, FRI)
    const pub = await publish(p, FRI); await L.sleep(700)
    await closeBoard(w)
    const cell = await lwCell(p, ['bane', 'pike', 'dj'], FRI_ISO)
    await L.pic(w, `S13g-leavewar-${T}`)
    rowOut(S, 'S13g the Leave War after publishing', 'one cell each for the three, none missing', `publish ${J(pub)}; cells ${J(cell)}`, pub.published && Object.values(cell).filter(v => /HO|FO/.test(J(v))).length === 3)
  })
} finally { await L.close(w) }
