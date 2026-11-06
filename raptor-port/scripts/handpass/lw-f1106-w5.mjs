// Walker script 5 (6 Nov 26): S7 (c) pictures for a question (record only), S8 the plain-user round.  SIZE=desk|phone  ONLY=s7|s8
process.env.LW_OUT ||= '2026-11-06-lw-faults/walk'
process.env.WNAME = 'w5'
const { L, row, T, openNow, elAt, fresh, finish } = await import('./lw-f1106-w0.mjs')
console.log('[lw-f1106-w5 v1]', L.SIZE, L.DIST)
const SIZE = L.SIZE, PH = SIZE === 'phone', ONLY = process.env.ONLY || ''
const w = await fresh(SIZE)
const P = w.page
const step = async (id, fn) => { try { await fn() } catch (e) { console.log(e.stack); row(id, SIZE, 'step', 'stopped: ' + String(e).slice(0, 250), 'NOT WALKED') } }
async function toInputsDec() {
  await L.goPage(w, 'inputs', 'Inputs')
  for (let i = 0; i < 6; i++) {
    const lab = await P.locator('#inpCal .ic-mon').first().getAttribute('aria-label').catch(() => null)
    if (lab && /December 2026/.test(lab)) break
    await L.press(w, '#icNext'); await P.waitForTimeout(300)
  }
  return P.locator('#inpCal .ic-mon').first().getAttribute('aria-label').catch(() => null)
}
if (!ONLY || ONLY === 's7') await step('S7', async () => {
  const dies = await L.pidOf(P, 'Diesel'), echo = await L.pidOf(P, 'Echo')
  const d28 = L.day(54), d29 = L.day(55), d30 = L.day(56)
  const po = await L.postOutOn(w, dies, d29, 'overseas', d29, `s7-${SIZE}-1-postout-sheet`)
  await L.toWar(w); await L.openGrid(w)
  row('S7-postout', SIZE, `post Diesel out as Overseas from ${d29}`, JSON.stringify(po), po.confirmed ? 'RECORD' : 'NOT WALKED', [`s7-${SIZE}-1-postout-sheet`])
  // (i) drag over his 28-30 Dec, choose OD
  const sheet = await L.dragCells(w, [dies, d28], [dies, d30])
  await L.shot(w, `s7-${SIZE}-2-drag-window-before-OD`)
  const more = P.locator(T('sel-more')).first()
  let odNote = ''
  if (await more.count()) { await L.press(w, T('sel-more')); await P.waitForTimeout(300) }
  const od = P.locator('[data-testid="sel-file-OD"], [data-testid="sel-OD"]').first()
  if (await od.count() && await od.isVisible()) { await od.scrollIntoViewIfNeeded().catch(() => {}); const odId = await od.getAttribute('data-testid'); await L.press(w, `[data-testid="${odId}"]`); await P.waitForTimeout(800); odNote = 'pressed ' + odId; const again = await L.cellWords(w, dies, d28); if (again === 'empty') { await L.shot(w, 's7-' + SIZE + '-3a-after-first-OD-press'); await L.press(w, '[data-testid="' + odId + '"]'); await P.waitForTimeout(900); odNote += ' (twice: the first left the row empty)' } } else odNote = 'no OD button found'
  const open1 = await openNow(P)
  await L.shot(w, `s7-${SIZE}-3-after-OD`)
  await L.closeWin(w); await L.settle(w)
  const cells = [await L.cellWords(w, dies, d28), await L.cellWords(w, dies, d29), await L.cellWords(w, dies, d30)]
  await L.rowShot(w, dies, L.day(52), L.day(57), `s7-${SIZE}-4-diesel-row`)
  row('S7-i', SIZE, `drag Diesel ${d28}..${d30} (window ${sheet}), ${odNote}`, `cells 28/29/30 Dec = ${JSON.stringify(cells)}; window open after: ${JSON.stringify(open1)}`, 'RECORD', [`s7-${SIZE}-2-drag-window-before-OD`, `s7-${SIZE}-3-after-OD`, `s7-${SIZE}-4-diesel-row`])
  // (ii) the Inputs page
  const lab = await toInputsDec()
  await L.shot(w, `s7-${SIZE}-5-inputs-december`)
  const bars = await P.evaluate(() => [...document.querySelectorAll('.ib-bar')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.innerText.replace(/\s+/g, ' ').trim().slice(0, 40)).slice(0, 12))
  row('S7-ii', SIZE, 'the Inputs page, calendar on ' + lab,`bars drawn: ${JSON.stringify(bars)}`, 'RECORD', [`s7-${SIZE}-5-inputs-december`])
  // (iii) another man posted out the same way, LL dragged over 28-30 Dec
  await L.toWar(w); await L.openGrid(w)
  const po2 = await L.postOutOn(w, echo, d29, 'overseas', d29)
  await L.toWar(w); await L.openGrid(w)
  const sheet2 = await L.dragCells(w, [echo, d28], [echo, d30])
  await L.shot(w, `s7-${SIZE}-6-echo-drag-window`)
  await L.autoApprove(w, false, 'sel')
  await L.press(w, T('sel-LL')); await P.waitForTimeout(800)
  const note = await P.evaluate(() => (document.querySelector('[data-testid="select-sheet"],[data-testid="sel-sheet"]')?.innerText || '').replace(/\s+/g, ' ').slice(0, 200))
  await L.shot(w, `s7-${SIZE}-7-echo-after-LL`)
  await L.closeWin(w); await L.settle(w)
  const cells2 = [await L.cellWords(w, echo, d28), await L.cellWords(w, echo, d29), await L.cellWords(w, echo, d30)]
  await L.rowShot(w, echo, L.day(52), L.day(57), `s7-${SIZE}-8-echo-row`)
  row('S7-iii', SIZE, `Echo posted out (${po2.confirmed}) from ${d29}; LL dragged over ${d28}..${d30} (window ${sheet2})`, `cells 28/29/30 Dec = ${JSON.stringify(cells2)}; window said "${note}"`, 'RECORD', [`s7-${SIZE}-6-echo-drag-window`, `s7-${SIZE}-7-echo-after-LL`, `s7-${SIZE}-8-echo-row`])
})
if (!ONLY || ONLY === 's8') await step('S8', async () => {
  await L.toWar(w); await L.openGrid(w)
  const id = await L.pidOf(P, 'Warden'), id2 = await L.pidOf(P, 'Cinch')
  const D = L.day(20)
  const errsBefore = w.errs.length
  // (1) free day, LL with Auto-approve ON
  await L.openCell(w, id, D)
  const on = await L.autoApprove(w, true)
  await L.shot(w, `s8-${SIZE}-1-window-auto-on`)
  const placed = await L.placeLeave(w, 'LL', `s8-${SIZE}-2-ll-q`)
  const c1 = await L.cellWords(w, id, D)
  await L.rowShot(w, id, L.day(18), L.day(22), `s8-${SIZE}-3-landed`)
  row('S8-1', SIZE, `tap a free day, Auto-approve ON (${on}), place LL (window closed=${placed})`, `cell = ${c1}; bell/toast not read`, /LL:s-a/.test(c1) ? 'PASS' : 'FAIL', [`s8-${SIZE}-1-window-auto-on`, `s8-${SIZE}-3-landed`])
  // (2) tap it again; close by X; Escape; tap outside
  const ways = []
  await L.openCell(w, id, D); await L.shot(w, `s8-${SIZE}-4-reopen`)
  const o1 = await openNow(P); ways.push('open:' + o1)
  await L.press(w, T('bid-cancel')); await P.waitForTimeout(400); ways.push('x:' + JSON.stringify(await openNow(P)))
  await L.openCell(w, id, D)
  if (!PH) { await P.keyboard.press('Escape'); await P.waitForTimeout(400); ways.push('esc:' + JSON.stringify(await openNow(P))) } else ways.push('esc: desktop only')
  if (PH || (await openNow(P)).length) { /* if still open continue */ }
  await L.openCell(w, id, D)
  const outside = await P.evaluate(() => { const s = document.querySelector('.sheetscrim'); return s ? { x: 10, y: 120 } : null })
  if (outside) { await L.finger(w, outside.x, outside.y); await P.waitForTimeout(500) } else { await L.finger(w, 200, 100); await P.waitForTimeout(500) }
  ways.push('outside:' + JSON.stringify(await openNow(P)))
  await L.shot(w, `s8-${SIZE}-5-after-ways`)
  row('S8-2', SIZE, 'reopen the leave; close by X, by Escape (desktop), by a tap outside', ways.join(' | '), 'RECORD', [`s8-${SIZE}-4-reopen`, `s8-${SIZE}-5-after-ways`])
  await L.settle(w)
  // (3) drag three days, fill OL, close the drag window
  const a = L.day(24), z = L.day(26)
  const sheet = await L.dragCells(w, [id2, a], [id2, z])
  await L.autoApprove(w, false, 'sel')
  await L.shot(w, `s8-${SIZE}-6-drag-window`)
  await L.press(w, T('sel-OL')); await P.waitForTimeout(800)
  const still = await L.vis(P, T('select-sheet')) || await L.vis(P, T('sel-sheet'))
  await L.shot(w, `s8-${SIZE}-7-after-fill`)
  await L.closeWin(w); await L.settle(w)
  const oc = [await L.cellWords(w, id2, a), await L.cellWords(w, id2, L.day(25)), await L.cellWords(w, id2, z)]
  row('S8-3', SIZE, `drag Cinch ${a}..${z} (window ${sheet}), Auto-approve OFF, OL, close the drag window`, `window stayed after fill=${still}; cells=${JSON.stringify(oc)}`, oc.every(x => /OL:s-w/.test(x)) ? 'PASS' : 'FAIL', [`s8-${SIZE}-6-drag-window`, `s8-${SIZE}-7-after-fill`])
  // (4) Undo once, Redo once
  const cu0 = await L.cellWords(w, id2, a)
  await L.undo(w); await L.shot(w, `s8-${SIZE}-8-undo`)
  const cu1 = [await L.cellWords(w, id2, a), await L.cellWords(w, id2, z), await L.cellWords(w, id, D)]
  await L.redo(w); await L.shot(w, `s8-${SIZE}-9-redo`)
  const cu2 = [await L.cellWords(w, id2, a), await L.cellWords(w, id2, z), await L.cellWords(w, id, D)]
  row('S8-4', SIZE, 'top bar Undo once, then Redo once', `cell ${a} before=${cu0}; after Undo [${a},${z}, Warden ${D}]=${JSON.stringify(cu1)}; after Redo=${JSON.stringify(cu2)}`, /empty/.test(cu1[0] + cu1[1]) ? 'PASS' : 'RECORD', [`s8-${SIZE}-8-undo`, `s8-${SIZE}-9-redo`])
  // (5) other places
  await L.toWar(w); await L.settle(w)
  await L.openApprovals(w); await L.shot(w, `s8-${SIZE}-10-approvals`)
  const lines = (await L.apprLines(P)).filter(l => l.who === id2).map(l => l.text)
  row('S8-5a', SIZE, 'Approvals tab', `Cinch lines: ${JSON.stringify(lines)}; tab count ${await L.tabCount(P)}`, lines.length >= 3 ? 'PASS' : 'FAIL', [`s8-${SIZE}-10-approvals`])
  await L.openGrid(w)
  await P.locator('#bellBtn, [data-testid="bellicon"], #bell').first().click().catch(() => {}); await P.waitForTimeout(600)
  await L.shot(w, `s8-${SIZE}-11-bell`)
  const bell = await P.evaluate(() => (document.querySelector('#bellPanel, .bellpanel, [data-testid="bellpanel"], .bell-pop')?.innerText || '').replace(/\s+/g, ' ').slice(0, 300))
  row('S8-5b', SIZE, 'the bell', `panel text: ${bell || '(not found)'}`, 'RECORD', [`s8-${SIZE}-11-bell`])
  await P.keyboard.press('Escape').catch(() => {}); await P.waitForTimeout(300)
  const my = P.locator('[data-testid="lw-myleave"], [data-testid^="my-leave"], button:has-text("My leave")').first()
  if (await my.count()) { await my.click().catch(() => {}); await P.waitForTimeout(700) }
  await L.shot(w, `s8-${SIZE}-12-my-leave`)
  row('S8-5c', SIZE, 'My leave (the admin Saber: his own; Warden / Cinch are not him)', `open: ${JSON.stringify(await openNow(P))}`, 'RECORD', [`s8-${SIZE}-12-my-leave`])
  await L.closeWin(w); await L.settle(w)
  const lab = await toInputsDec().catch(() => null)
  // Inputs: go to Nov
  for (let i = 0; i < 8; i++) { const l = await P.locator('#inpCal .ic-mon').first().getAttribute('aria-label').catch(() => ''); if (/November 2026/.test(l || '')) break; await L.press(w, '#icPrev'); await P.waitForTimeout(300) }
  await L.shot(w, `s8-${SIZE}-13-inputs`)
  const bars = await P.evaluate(() => [...document.querySelectorAll('.ib-bar')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.innerText.replace(/\s+/g, ' ').trim().slice(0, 40)))
  row('S8-5d', SIZE, 'the Inputs page, November (the approved LL of Warden should be an entry)', `bars: ${JSON.stringify(bars)}`, bars.some(b => /LL|Warden/i.test(b)) ? 'PASS' : 'RECORD', [`s8-${SIZE}-13-inputs`])
  row('S8-errs', SIZE, 'console errors and failed requests collected during the round', `${w.errs.length - errsBefore} new: ${JSON.stringify(w.errs.slice(errsBefore, errsBefore + 6))}`, w.errs.length === errsBefore ? 'PASS' : 'RECORD', [])
})
console.log('errs', JSON.stringify(w.errs))
finish('w5-' + SIZE)
await L.closeBrowser()
