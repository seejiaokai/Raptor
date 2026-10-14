/* helper walk S21 (OIL Earn mode) and S22 (places that must not offer the un-cancel).
   usage: DL_BASE=... DL_SHOTS=... node scripts/handpass/ou-h-8.mjs [desk|phone] */
import { L, J, bstate, publish, file, mark, board, closeBoard, rowBtn, uncx, fixture, makeHoliday, closeWindows, sheet, bar, noteNow, rec, signAs, cardOf, closeDay, loadVersion, FRI, FRI_ISO, SAT, SAT_ISO, rowOut, part, bellLines, closeBell, inputsCal } from './ou-h-0.mjs'
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE
const w = await L.world(SIZE), p = w.page
console.log('ou-h-8 S21/S22 version 1', SIZE)
const click = sel => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getClientRects().length); if (e) { e.click(); return true } return false }, sel)
async function raise(id) {
  await board(w, SAT)
  await uncx(w, SAT, id)
  await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(500)
  return bar(p)
}
try {
  let X
  await part(w, `S21 ${T}`, 'S21 fixture', 'a cancelled, unanswered input on Saturday', async () => {
    X = await fixture(w, 'bane', 'Range brief')
    rowOut(`S21 ${T}`, 'S21 fixture', 'cancelled, no answer', `input ${J(X.now)}`, X.now.cx && !X.now.oil)
  })
  await part(w, `S21 ${T}`, 'S21a the bar up, then OIL Earn on', 'the waiting change and its bar go (ui-contracts, the walk\'s C7)', async () => {
    const b0 = await raise(X.id)
    const on = await click('#sbOil, [data-oilmode]'); await L.sleep(800)
    const b1 = await bar(p), q = await sheet(p)
    await L.pic(w, `S21a-oil-earn-${T}`)
    rowOut(`S21 ${T}`, 'S21a OIL Earn on with the bar up', 'the bar gone', `bar before ${J(b0)}; OIL Earn pressed ${on}; the bar ${J(b1)}; a question ${J(q)}`, !!b0 && on && !b1 && !q)
  })
  await part(w, `S21 ${T}`, 'S21b CX in OIL Earn mode (RECORD)', 'RECORD: what the row offers in OIL Earn, and what pressing its CX does', async () => {
    const offered = await p.evaluate(() => document.querySelectorAll('#schedBoard [data-grcx]').length)
    let res = null
    try { await rowBtn(w, SAT, X.id, 'grcx'); res = 'pressed' } catch (e) { res = 'not pressed: ' + String(e.message).slice(0, 100) }
    await L.sleep(500)
    const q = await sheet(p), r = await rec(p, X.id), b = await bar(p), cx = await p.evaluate(() => { const e = document.querySelector('#cxPop:not([hidden])'); return e ? (e.innerText || '').replace(/\s+/g, ' ').slice(0, 160) : null })
    await L.pic(w, `S21b-oil-earn-cx-${T}`)
    rowOut(`S21 ${T}`, 'S21b CX in OIL Earn (RECORD)', 'RECORD', `CX buttons on the board in OIL Earn: ${offered}; ${res}; the cancel sheet ${J(cx)}; an OIL question ${J(q)}; bar ${J(b)}; input ${J(r)}`, true)
    await p.keyboard.press('Escape'); await L.sleep(300)
    await click('#sbOil, [data-oilmode]'); await L.sleep(500)
    await closeBoard(w)
  })
  /* ───── S22 ───── */
  const S2 = `S22 ${T}`
  await part(w, S2, 'S22a the member opens his cancelled input', 'no control un-cancels: not the Inputs card, not the input\'s window; View-only Sched shows no CX button', async () => {
    await signAs(w, 'us', 'us')
    const card = await cardOf(w, SAT_ISO, X.id)
    const ctl = await p.evaluate(id => { const row = document.querySelector(`[data-testid="idy-row-${id}"]`); return row ? [...row.querySelectorAll('button')].map(b => `${b.getAttribute('data-testid') || b.id || ''}:${(b.innerText || b.title || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim()}`) : null }, X.id)
    await L.pic(w, `S22a-member-card-${T}`)
    const opened = await p.evaluate(id => { const b = document.querySelector(`[data-testid="idy-row-${id}"] [data-testid="idy-open"]`); if (!b) return false; b.click(); return true }, X.id)
    await L.sleep(700)
    const win = await p.evaluate(() => { const pop = document.querySelector('#inpEditPop'); if (!pop) return null; return { btns: [...pop.querySelectorAll('button')].filter(b => b.getClientRects().length).map(b => (b.innerText || b.title || b.getAttribute('aria-label') || b.id).replace(/\s+/g, ' ').trim()), cxTag: /CX/.test(pop.innerText), text: (pop.innerText || '').replace(/\s+/g, ' ').slice(0, 260) } })
    await L.pic(w, `S22a-member-window-${T}`)
    await p.evaluate(() => { const b = document.querySelector('#inpEditCancel'); if (b) b.click() }); await L.sleep(300)
    await closeDay(w)
    const r = await rec(p, X.id)
    const bad = (win && win.btns.some(t => /un-?cancel|restore|CX/i.test(t))) || (ctl && ctl.some(t => /un-?cancel|restore/i.test(t)))
    rowOut(S2, 'S22a the member\'s card and window', 'no un-cancel control; still cancelled', `card ${J(card)}; its buttons ${J(ctl)}; window opened ${opened}: ${J(win)}; input ${J(r)}`, !!card && !bad && r.cx)
    await L.go(w, 'viewsched'); await L.sleep(700)
    const vs = await p.evaluate(() => ({ cxButtons: document.querySelectorAll('#vWeek [data-grcx]').length, text: /CX DUE/.test(document.querySelector('#vWeek').innerText) }))
    await L.pic(w, `S22a-member-viewonly-${T}`)
    rowOut(S2, 'S22a View-only Sched (member)', 'no CX button on any row', `view-only week: ${J(vs)}`, vs.cxButtons === 0)
    await signAs(w, 'ad', 'a')
  })
  let A
  await part(w, S2, 'S22b fixture: a published Friday with the cancel on', 'published with the input cancelled; then un-cancelled on the working copy on the holiday', async () => {
    A = await file(w, FRI_ISO, 'bane', 'Hangar brief', { start: '13:00', end: '14:00' })
    await mark(w, FRI, A.id, 'cx')
    await board(w, FRI)
    const pub = await publish(p, FRI); await L.sleep(600)
    await closeBoard(w)
    const h = await makeHoliday(w, FRI_ISO); await closeWindows(w)
    await board(w, FRI)
    await uncx(w, FRI, A.id)
    await w.press('[data-testid="oil-yes"]'); await L.sleep(150); await w.press('[data-testid="oilconf-save"]'); await L.sleep(700)
    const r = await rec(p, A.id)
    rowOut(S2, 'S22b fixture', 'working copy live and answered; the issued version showing it cancelled', `publish ${J(pub)}; input ${J(r)}`, pub.published && !r.cx && !!r.oil)
    await closeBoard(w)
  })
  await part(w, S2, 'S22c the admin in a preview of the published version', 'no control un-cancels; a read-only preview raises no question', async () => {
    await L.go(w, 'editsched'); await L.sleep(500)
    const scope = w.phone ? '#schedBoard' : '#eWeek'
    if (w.phone) await board(w, FRI)
    await p.locator(`${scope} [data-planmenu="${FRI}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() }); await L.sleep(400)
    const ver = await p.locator('[data-planpv]').first().getAttribute('data-planpv')
    await p.locator(`[data-planpv="${ver}"]`).first().evaluate(e => e.click()); await L.sleep(700)
    const cx = await p.evaluate(sc => ({ grcx: document.querySelectorAll(`${sc} [data-grcx]`).length, previewBar: /Load onto working copy/.test(document.querySelector(sc).innerText) }), scope)
    await L.pic(w, `S22c-preview-${T}`)
    let pressed = 'no CX button in the preview'
    const sel = await p.evaluate(sc => { const e = [...document.querySelectorAll(`${sc} [data-grcx]`)].find(x => x.getClientRects().length); return e ? `${sc} [data-grcx="${e.getAttribute('data-grcx')}"]` : null }, scope)
    if (sel) { await p.locator(sel).first().evaluate(e => e.click()); await L.sleep(500); pressed = 'pressed' }
    const q = await sheet(p), b = await bar(p), r = await rec(p, A.id), cxp = await p.evaluate(() => { const e = document.querySelector('#cxPop:not([hidden])'); return e ? (e.innerText || '').replace(/\s+/g, ' ').slice(0, 160) : null })
    await L.pic(w, `S22c-preview-after-press-${T}`)
    rowOut(S2, 'S22c a preview', 'no OIL question, no bar, nothing changed (the working copy stays live and answered)', `preview ${J(cx)}; ${pressed}; the cancel sheet ${J(cxp)}; question ${J(q)}; bar ${J(b)}; input ${J(r)}`, !q && !b && !r.cx && !!r.oil)
  })
} finally { await L.close(w) }
