// Re-walk 3 G3b — a man posting out LATER (still to come); "Approve what I enter" on; a drag over two men's days. Desktop.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk3'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, pressLoc, lineLoc, lineInfo, approveBtn, shotLine } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-rw3-g3b v1]')
const w = await L.newCtx('desk'); const P = w.page
const centreCell = async (who, iso) => { await L.reachCell(w, who, iso); await P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), L.cellId(who, iso)); await P.waitForTimeout(400) }
const toTop = async () => { await P.keyboard.press('Escape'); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(400) }
const rowId = name => P.evaluate(n => { const r = [...document.querySelectorAll('[data-testid^="row-"]')].find(e => e.innerText.trim().split(/\s+/)[0] === n); return r ? r.dataset.testid.slice(4) : null }, name)
async function postOut(who, iso, tag) {
  await centreCell(who, iso); await L.openCell(w, who, iso)
  await press(w, T('bid-more')); await P.waitForTimeout(400)
  await press(w, T('bid-postout')); await P.waitForTimeout(700)
  const line = await txt(P, T('po-line')); await press(w, T('po-confirm')); await P.waitForTimeout(900)
  for (let i = 0; i < 3 && (await vis(P, T('bid-picker')) || await vis(P, T('po-confirm')) || await vis(P, T('sheet-scrim'))); i++) { await P.keyboard.press('Escape'); await P.waitForTimeout(500) }
  console.log(tag, 'post-out line:', line); return line
}
const why = /He (posts?|posted) out on [0-9]+ [A-Za-z]+: refuse or delete it/i
const winState = () => P.evaluate(() => { const s = document.querySelector('[data-testid="daylist-sheet"], [data-testid="bid-picker"]'); return s ? { text: s.innerText.replace(/\s+/g, ' ').trim(), btns: [...s.querySelectorAll('button')].filter(b => /^(Approv|Refus)/.test(b.innerText.trim())).map(b => b.innerText.trim() + ':' + b.getAttribute('aria-pressed')) } : null })
try {
  await L.signIn(w, 'admin')
  const ST = await rowId('Static'), RE = await rowId('Reaper'), AN = await rowId('Anvil')
  console.log('ids', ST, RE, AN)
  // Reaper and Anvil: pending bids (admin, Approve-what-I-enter off) on 13 and 14 Jan, BEFORE any posting
  await centreCell(RE, '2026-01-13'); await A.placeBid(w, RE, '2026-01-13', 'LL', 'full', { adminOff: true }); await toTop()
  await centreCell(AN, '2026-01-14'); await A.placeBid(w, AN, '2026-01-14', 'LL', 'full', { adminOff: true }); await toTop()
  // post Static out from 7 Jan, Reaper from 7 Jan, Anvil from 8 Jan: all still to come (today is 5 Jan)
  const l1 = await postOut(ST, '2026-01-07', 'Static'); await toTop()
  await postOut(RE, '2026-01-07', 'Reaper'); await toTop()
  await postOut(AN, '2026-01-08', 'Anvil'); await toTop()
  // Approvals: Static 8 Jan refused "He posts out on 7 Jan: ..."
  await L.openApprovals(w); await shot(w, 'g3b-1-approvals')
  const lines = (await L.apprLines(P)).map(l => l.text); console.log('lines', JSON.stringify(lines))
  await pressLoc(w, approveBtn(P, 'Thu 8 Jan')); await P.waitForTimeout(700)
  const i1 = await lineInfo(P, 'Thu 8 Jan'); await shotLine(w, 'g3b-2-appr-static', 'Thu 8 Jan').catch(() => {})
  const w1 = (i1.text.match(why) || [''])[0]; console.log('Approvals Static:', JSON.stringify(i1), w1)
  rec('G3b Approvals: posting out LATER (7 Jan, still to come), a bid after (8 Jan): "He posts out on 7 Jan: refuse or delete it"', 'desk', /^He posts out on 7 Jan: refuse or delete it/.test(w1) && i1.ok.p !== 'true' ? 'PASS' : 'FAIL', `line "${i1.text}"; words "${w1}"; Approve lit ${i1.ok.p}`, ['g3b-2-appr-static'])
  // the bid window on the same bid
  await L.openGrid(w); await centreCell(ST, '2026-01-08'); await L.openCell(w, ST, '2026-01-08'); await shot(w, 'g3b-3-window-static')
  await pressLoc(w, P.locator('[data-testid="daylist-sheet"], [data-testid="bid-picker"]').getByRole('button', { name: 'Approve', exact: true }).first()); await P.waitForTimeout(800)
  const ws = await winState(); await shot(w, 'g3b-4-window-static-after-approve'); console.log('window Static:', JSON.stringify(ws))
  const w2 = ws ? (ws.text.match(why) || [''])[0] : ''
  rec('G3b bid window: the same bid refused with the same words', 'desk', /^He posts out on 7 Jan: refuse or delete it/.test(w2) && !(ws.btns || []).some(b => /^Approved/.test(b)) ? 'PASS' : 'FAIL', `words "${w2}"; buttons ${JSON.stringify(ws && ws.btns)}; text "${ws && ws.text.slice(0, 200)}"`, ['g3b-3-window-static', 'g3b-4-window-static-after-approve'])
  await toTop()
  // "Approve what I enter" ON: place leave on a day after Static's date (13 Jan)
  await centreCell(ST, '2026-01-13'); await L.openCell(w, ST, '2026-01-13'); await shot(w, 'g3b-5a-window-posted-day'); if (await vis(P, T('postout-place'))) { await press(w, T('postout-place')); await P.waitForTimeout(500) } await L.approveWhatIEnter(w, true); await shot(w, 'g3b-5-window-ape-on-before')
  await press(w, T('bid-LL')); await P.waitForTimeout(700)
  const wp = await winState(); await shot(w, 'g3b-6-window-ape-on-after')
  console.log('Approve-what-I-enter placement:', JSON.stringify(wp))
  const m = wp ? wp.text : ''
  const kept = /kept pending/i.test(m), reasonOk = /kept pending[^.]*He posts out on 7 Jan: refuse or delete it/i.test(m) || (kept && why.test(m))
  const wrongWords = /locked week/i.test(m)
  rec('G3b "Approve what I enter" on, leave after his date: kept pending, the window gives his posting reason (not "a locked week…")', 'desk', wp && kept && why.test(m) && !wrongWords ? 'PASS' : 'FAIL', `window text "${m.slice(0, 300)}"`, ['g3b-5-window-ape-on-before', 'g3b-6-window-ape-on-after'])
  await L.closeWin(w); await toTop()
  // Drag over Reaper 13 Jan .. Anvil 14 Jan, then Approve
  await centreCell(RE, '2026-01-13')
  const a = await P.locator(T(L.cellId(RE, '2026-01-13'))).first().boundingBox()
  const b = await P.locator(T(L.cellId(AN, '2026-01-14'))).first().boundingBox()
  await P.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await P.mouse.down(); await P.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 }); await P.mouse.up(); await P.waitForTimeout(700)
  const sheetOn = await vis(P, T('select-sheet')); await shot(w, 'g3b-7-drag-window')
  console.log('drag sheet', sheetOn, await txt(P, T('select-sheet')))
  if (sheetOn) {
    await L.approveWhatIEnter(w, false).catch(() => {})
    await press(w, T('sel-approve')); await P.waitForTimeout(800)
    const note = await txt(P, T('sel-note')); await shot(w, 'g3b-8-drag-after-approve'); console.log('drag note:', note)
    const nm = note || ''
    rec('G3b drag over two men\'s days after their dates, Approve: the note names each man before his reason, the reasons apart', 'desk', /Reaper[^.]*He posts out on 7 Jan: refuse or delete it\.?\s*Anvil[^.]*He posts out on 8 Jan: refuse or delete it/i.test(nm) ? 'PASS' : 'FAIL', `note "${nm}"`, ['g3b-7-drag-window', 'g3b-8-drag-after-approve'])
  } else rec('G3b drag over two men', 'desk', 'NOT WALKED', 'the drag did not open the drag window', ['g3b-7-drag-window'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 500)); await shot(w, 'g3b-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
await w.ctx.close(); L.writeResults('g3b'); await L.closeBrowser(); console.log('DONE')
