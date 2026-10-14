/* helper walk S16 (handed to another man while cancelled) and S14 (an ALL AVAIL input).
   usage: DL_BASE=... DL_SHOTS=... node scripts/handpass/ou-h-10.mjs [desk|phone] */
import { L, J, publish, file, mark, board, closeBoard, rowBtn, uncx, makeHoliday, closeWindows, sheet, bar, noteNow, rec, signAs, cardOf, closeDay, bellLines, closeBell, inputsCal, openAdd, fillForm, SAT, FRI, SAT_ISO, FRI_ISO, rowOut, part } from './ou-h-0.mjs'
import { lwCell } from './lib.mjs'
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE
const w = await L.world(SIZE), p = w.page
console.log('ou-h-10 S16/S14 version 1', SIZE)
const full = id => p.evaluate(id => { const r = window.INPUTS.find(x => String(x.iid) === id); return r ? { people: (r.people || []).map(x => x.p), who: r.who || null, cx: !!r.cx, cxr: r.cxr || '', oil: r.oil || null, date: r.date } : null }, id)
try {
  const S = `S16 ${T}`
  let F
  await part(w, S, 'S16a fixture', 'a Saturday input answered Yes, then cancelled', async () => {
    F = await file(w, SAT_ISO, 'bane', 'Range brief', { oil: 'yes' })
    await mark(w, SAT, F.id, 'cx')
    const r = await full(F.id)
    rowOut(S, 'S16a fixture', 'answered Yes at the filing, then cancelled', `asked ${F.asked}; ${J(r)}`, F.asked && r.cx && !!r.oil)
  })
  await part(w, S, 'S16b the person changed in the input\'s window while cancelled', 'RECORD whether it asks; expected: nothing asked while cancelled (D814), the first man\'s answer void', async () => {
    await inputsCal(w, '2026-07-13')
    await p.locator(`[data-icday="${SAT_ISO}"]`).focus(); await p.keyboard.press('Enter')
    await p.waitForSelector(`[data-testid="idy-row-${F.id}"]`)
    await w.press(`[data-testid="idy-row-${F.id}"] [data-testid="idy-open"]`)
    await p.waitForSelector('#inpEditPop #inpEdCal')
    await p.selectOption('#inpEditPop #inpEditPerson', 'pike'); await L.sleep(300)
    await L.pic(w, `S16b-window-${T}`)
    await w.press('#inpEditSave'); await L.sleep(900)
    const q = await sheet(p), r = await full(F.id), note = await noteNow(p)
    await L.pic(w, `S16b-after-save-${T}`)
    const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) await x.first().evaluate(e => e.click()); await L.sleep(250)
    rowOut(S, 'S16b person changed while cancelled', 'no OIL question while cancelled; still cancelled; the old answer not carried to the new man', `question ${J(q)}; note "${note}"; input now ${J(r)}`, !q && r.cx && r.people.join() === 'pike' && !r.oil)
  })
  await part(w, S, 'S16c CX off', 'the question now, for the new man (D816)', async () => {
    await board(w, SAT)
    await uncx(w, SAT, F.id)
    const q = await sheet(p)
    await L.pic(w, `S16c-question-${T}`)
    await w.press('[data-testid="oil-yes"]'); await L.sleep(150); await w.press('[data-testid="oilconf-save"]'); await L.sleep(700)
    const r = await full(F.id), note = await noteNow(p)
    await closeBoard(w)
    rowOut(S, 'S16c CX off', 'the question names the new man; after Yes + Un-cancel it is live with his answer', `sheet ${J(q)}; note "${note}"; input ${J(r)}`, !!q && /Nomad/.test(q.lead + q.head) && !r.cx && !!r.oil)
  })
  /* ───── S14 ───── */
  const S2 = `S14 ${T}`
  let A
  await part(w, S2, 'S14a fixture: Ranger files an ALL AVAIL Event on a working Friday', 'filed by a member; no question; cancelled; Friday made a holiday', async () => {
    await signAs(w, 'us', 'us')
    await inputsCal(w, '2026-07-13'); await openAdd(w, FRI_ISO)
    await p.selectOption('#inpEditPop #inpEditType', 'Event'); await L.sleep(200)
    await p.selectOption('#inpEditPop #inpEditPerson', { label: 'ALL AVAIL' }).catch(async () => { await p.selectOption('#inpEditPop #inpEditPerson', 'allavail') })
    const ad = p.locator('#inpEditPop #inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.click()
    await p.fill('#inpEditPop #inpEditStart', '09:00'); await p.fill('#inpEditPop #inpEditEnd', '10:00')
    if (await p.locator('#inpEditPop #inpEditOwnTitle').count()) await p.fill('#inpEditPop #inpEditOwnTitle', 'Crew briefing')
    const before = await p.evaluate(() => window.INPUTS.map(x => String(x.iid)))
    await w.press('#inpEditSave'); await L.sleep(800)
    const asked = !!(await p.locator('[data-testid="oilconf"]').count())
    A = { id: await p.evaluate(b => { const n = window.INPUTS.find(x => !b.includes(String(x.iid))); return n ? String(n.iid) : null }, before), asked }
    const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) await x.first().evaluate(e => e.click()); await L.sleep(250)
    await signAs(w, 'ad', 'a')
    await mark(w, FRI, A.id, 'cx')
    const h = await makeHoliday(w, FRI_ISO); await closeWindows(w)
    const r = await full(A.id)
    rowOut(S2, 'S14a fixture', 'filed with no question on a working day; cancelled; not in the holiday list', `asked ${A.asked}; input ${J(r)}; holiday's list ${J(h.list && { count: h.list.count, has: h.list.ids.includes(A.id) })}`, !!A.id && !A.asked && r.cx && !(h.list && h.list.ids.includes(A.id)))
  })
  await part(w, S2, 'S14b CX off, Yes, publish', 'asked once; the men behind it follow the answer and are credited after publishing', async () => {
    await board(w, FRI)
    await uncx(w, FRI, A.id)
    const q = await sheet(p)
    await L.pic(w, `S14b-question-${T}`)
    await w.press('[data-testid="oil-yes"]'); await L.sleep(150); await w.press('[data-testid="oilconf-save"]'); await L.sleep(700)
    const r = await full(A.id), note = await noteNow(p)
    const pub = await publish(p, FRI); await L.sleep(700)
    await closeBoard(w)
    const cell = await lwCell(p, ['dj', 'pike', 'stiff'], FRI_ISO)
    await L.pic(w, `S14b-leavewar-${T}`)
    rowOut(S2, 'S14b CX off for an ALL AVAIL input', 'one question (heading recorded); after publishing the men behind it show an HO/FO', `sheet ${J(q)}; note "${note}"; input ${J(r)}; publish ${J(pub)}; Leave War cells ${J(cell)}`, !!q && !r.cx && !!r.oil && pub.published && Object.values(cell).some(v => /HO|FO/.test(J(v))))
  })
  await part(w, S2, 'S14c Ranger\'s bell', 'RECORD: Ranger filed it, so he is told "Un-cancelled" by Saber; the men behind ALL AVAIL are not named', async () => {
    await signAs(w, 'us', 'us')
    const bl = await bellLines(w)
    await L.pic(w, `S14c-member-bell-${T}`)
    rowOut(S2, 'S14c the filer\'s bell (RECORD)', 'RECORD', `bell ${J(bl)}`, true)
    await closeBell(w)
    await signAs(w, 'ad', 'a')
  })
} finally { await L.close(w) }
