/* helper walk S28 (rows the load treats specially) and S29 (orders around the load).
   usage: DL_BASE=... DL_SHOTS=... node scripts/handpass/ou-h-14.mjs [desk|phone] */
import { L, J, publish, file, mark, board, closeBoard, rowBtn, uncx, makeHoliday, closeWindows, sheet, bar, list, noteNow, rec, undo, redo, loadVersion, moveDate, cardOf, closeDay, inputsCal, FRI, FRI_ISO, rowOut, part } from './ou-h-0.mjs'
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE
const w = await L.world(SIZE), p = w.page
console.log('ou-h-14 S28/S29 version 1', SIZE)
const where = w.phone ? 'board' : 'week'
const wins = () => p.evaluate(() => document.querySelectorAll('[data-testid="win-oilday"]').length)
const onProg = id => p.evaluate(id => window.DAYS[4].ground.some(g => String(g.src) === id), id)
const rowText = id => p.evaluate(id => { const e = window.INPUTS.find(x => String(x.iid) === id); return e ? { acc: e.acc || '', date: e.date } : null }, id)
try {
  const S = `S28 ${T}`
  let X, Y, Z
  await part(w, S, 'S28a set-up', 'X, Y, Z on a published Friday; Friday a holiday; all three taken off', async () => {
    X = await file(w, FRI_ISO, 'bane', 'Range brief'); Y = await file(w, FRI_ISO, 'pike', 'Hangar brief', { start: '11:00', end: '12:00' }); Z = await file(w, FRI_ISO, 'dj', 'Engine brief', { start: '13:00', end: '14:00' })
    await board(w, FRI); const pub = await publish(p, FRI); await L.sleep(600); await closeBoard(w)
    const h = await makeHoliday(w, FRI_ISO)
    if (h.list) await w.press('[data-testid="odl-later"]'); await L.sleep(300); await closeWindows(w)
    await board(w, FRI)
    for (const k of [X, Y, Z]) { await rowBtn(w, FRI, k.id, 'grdel'); await L.sleep(300) }
    await closeBoard(w)
    rowOut(S, 'S28a set-up', 'published; holiday; all three off the programme', `publish ${J(pub)}; list ${J(h.list && h.list.ids)}; on the programme: ${J([await onProg(X.id), await onProg(Y.id), await onProg(Z.id)])}`, pub.published && !(await onProg(X.id)) && !(await onProg(Y.id)) && !(await onProg(Z.id)))
  })
  await part(w, S, 'S28b X deleted, Y moved to another day, then the load', 'X and Y are not counted; no blank card, no error; the note counts only Z', async () => {
    /* X deleted from its window */
    await inputsCal(w, '2026-07-13')
    await p.locator(`[data-icday="${FRI_ISO}"]`).focus(); await p.keyboard.press('Enter')
    await p.waitForSelector(`[data-testid="idy-row-${X.id}"]`)
    await w.press(`[data-testid="idy-row-${X.id}"] [data-testid="idy-open"]`)
    await p.waitForSelector('#inpEditPop #inpEdCal')
    await p.evaluate(() => { const b = [...document.querySelectorAll('#inpEditPop button')].find(x => /^Delete$/.test(x.textContent.trim())); if (b) b.click() }); await L.sleep(500)
    await p.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(x => x.getClientRects().length && /^(Delete|Yes|Confirm|Yes, delete)/.test(x.textContent.trim())).pop(); if (b) b.click() }); await L.sleep(700)
    const delGone = await p.evaluate(id => !window.INPUTS.some(x => String(x.iid) === id), X.id)
    await closeDay(w)
    const asked = await moveDate(w, FRI_ISO, Y.id, '2026-07-16')
    const yy = await rowText(Y.id)
    const errs0 = w.errors.length
    if (w.phone) await board(w, FRI); else await L.go(w, 'editsched')
    const r = await loadVersion(w, FRI, where)
    await L.pic(w, `S28b-loaded-${T}`)
    const cards = await p.evaluate(() => [...document.querySelectorAll('[data-testid="win-oilday"] [data-testid^="odl-row-"], [data-testid="win-oilday"] [data-testid^="odl-yes-"]')].length)
    rowOut(S, 'S28b deleted and moved inputs', 'neither counted; no blank card; no error', `X deleted ${delGone}; Y moved (asked ${asked}) ${J(yy)}; load: button "${r.first}"${r.second ? ' then "' + r.second + '"' : ''}; note "${r.note}"; list ${J(r.list)}; errors added ${w.errors.length - errs0}`, delGone && /1 input needs an OIL answer$/.test(r.note) && !!r.list && r.list.ids.includes(Z.id) && !r.list.ids.includes(X.id) && !r.list.ids.includes(Y.id) && w.errors.length === errs0)
    await closeWindows(w)
  })
  L.row(S, 'S28c an input Fri–Mon with Monday a holiday', 'RECORD (Q4)', 'NOT WALKED: not reached — building a Fri–Mon span through the form and a second holiday did not fit the time', 'NOT WALKED')
  L.row(S, 'S28d a two-day holiday', 'RECORD (Q4)', 'NOT WALKED: not reached in the time', 'NOT WALKED')
} finally { await L.close(w) }
