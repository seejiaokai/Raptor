// Re-walk 3 G3d — "Approve what I enter" ON placing leave after a man's date: (1) a man whose posting has RUN, one-day window; (2) the drag window over his days. Desktop.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk3'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-rw3-g3d v1]')
const w = await L.newCtx('desk'); const P = w.page
const centreCell = async (who, iso) => { await L.reachCell(w, who, iso); await P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), L.cellId(who, iso)); await P.waitForTimeout(400) }
const toTop = async () => { await P.keyboard.press('Escape'); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(400) }
const kept = () => P.evaluate(() => document.body.innerText.match(/[^\n]*kept pending[^\n]*/g))
const rowId = n => P.evaluate(n => { const r = [...document.querySelectorAll('[data-testid^="row-"]')].find(e => e.innerText.trim().split(/\s+/)[0] === n); return r.dataset.testid.slice(4) }, n)
async function postOut(who, iso) {
  await centreCell(who, iso); await L.openCell(w, who, iso)
  await press(w, T('bid-more')); await P.waitForTimeout(400); await press(w, T('bid-postout')); await P.waitForTimeout(700); await press(w, T('po-confirm')); await P.waitForTimeout(900)
  for (let i = 0; i < 3 && (await vis(P, T('bid-picker')) || await vis(P, T('po-confirm')) || await vis(P, T('sheet-scrim'))); i++) { await P.keyboard.press('Escape'); await P.waitForTimeout(500) }
  await toTop()
}
try {
  await L.signIn(w, 'admin')
  const BL = 'slash', ST = await rowId('Static')
  await postOut(BL, '2026-01-04')      // Blade: the posting has RUN
  await postOut(ST, '2026-01-07')      // Static: still to come
  // (1) Blade, run posting, one-day window, "Approve what I enter" on, 12 Jan
  await centreCell(BL, '2026-01-12'); await L.openCell(w, BL, '2026-01-12')
  if (await vis(P, T('postout-place'))) { await press(w, T('postout-place')); await P.waitForTimeout(500) }
  await L.approveWhatIEnter(w, true); await shot(w, 'g3d-1-blade-before')
  const c = await L.centre(P, T('bid-LL')); await P.mouse.click(c.x, c.y); await P.waitForTimeout(500); await shot(w, 'g3d-2-blade-after')
  const k1 = await kept(); console.log('Blade one-day:', JSON.stringify(k1), 'window:', ((await txt(P, T('bid-picker'))) || (await txt(P, T('daylist-sheet'))) || '').slice(0, 200))
  rec('G3d one-day window, posting RUN, "Approve what I enter" on, leave after his date: the posting reason shown', 'desk', k1 && k1.some(x => /He posted out on 4 Jan: refuse or delete it/.test(x)) ? 'PASS' : 'FAIL', `"kept pending" on screen: ${JSON.stringify(k1)}`, ['g3d-1-blade-before', 'g3d-2-blade-after'])
  await toTop()
  // (2) the drag window over Static 20-21 Jan, toggle on, LL
  await centreCell(ST, '2026-01-20')
  const a = await P.locator(T(L.cellId(ST, '2026-01-20'))).first().boundingBox(), b = await P.locator(T(L.cellId(ST, '2026-01-21'))).first().boundingBox()
  await P.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await P.mouse.down(); await P.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 }); await P.mouse.up(); await P.waitForTimeout(700)
  const open = await vis(P, T('select-sheet')); await shot(w, 'g3d-3-drag-open')
  console.log('drag open', open, await P.evaluate(() => [...document.querySelectorAll('[data-testid="select-sheet"] button')].map(b => b.dataset.testid + '=' + b.innerText.trim().replace(/\s+/g, ' ')).join(' | ')))
  if (open) {
    await L.approveWhatIEnter(w, true).catch(() => {})
    const tick = await P.evaluate(() => { const t = document.querySelector('[data-testid="sel-approve-tick"]'); return t ? (t.getAttribute('aria-checked') || t.getAttribute('aria-pressed')) : null })
    console.log('sel tick', tick)
    await shot(w, 'g3d-3b-drag-before-LL'); const cc = await L.centre(P, T('sel-LL')); await P.mouse.click(cc.x, cc.y); await P.waitForTimeout(700); await shot(w, 'g3d-4-drag-after-LL')
    const note = await txt(P, T('sel-note')); const k2 = await kept(); console.log('drag note', note, JSON.stringify(k2))
    rec('G3d drag window over his days after the date, "Approve what I enter" on, LL: kept pending with the posting reason', 'desk', k2 && k2.some(x => /He posts out on 7 Jan: refuse or delete it/.test(x)) ? 'PASS' : 'FAIL', `note "${note}"; "kept pending" on screen ${JSON.stringify(k2)}; tick ${tick}`, ['g3d-3-drag-open', 'g3d-4-drag-after-LL'])
  } else rec('G3d drag window', 'desk', 'NOT WALKED', 'drag did not open the window', ['g3d-3-drag-open'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'g3d-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
await w.ctx.close(); L.writeResults('g3d'); await L.closeBrowser(); console.log('DONE')
