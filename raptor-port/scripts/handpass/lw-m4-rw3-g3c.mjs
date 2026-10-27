// Re-walk 3 G3c — "Approve what I enter" ON, leave placed on a day after a man's posting-out date: where does the reason show? Desktop.
// Static posted out from 7 Jan (still to come). Two ways: (1) the one-day window ("Place leave or OIL here instead…"), (2) the drag window.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk3'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-rw3-g3c v1]')
const w = await L.newCtx('desk'); const P = w.page
const centreCell = async (who, iso) => { await L.reachCell(w, who, iso); await P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), L.cellId(who, iso)); await P.waitForTimeout(400) }
const toTop = async () => { await P.keyboard.press('Escape'); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(400) }
const bodyHas = () => P.evaluate(() => { const t = document.body.innerText; const m = t.match(/kept pending[^\n]*/g); return m })
try {
  await L.signIn(w, 'admin')
  const ST = 'shaft' === null ? null : await P.evaluate(() => { const r = [...document.querySelectorAll('[data-testid^="row-"]')].find(e => e.innerText.trim().split(/\s+/)[0] === 'Static'); return r.dataset.testid.slice(4) })
  // post Static out from 7 Jan
  await centreCell(ST, '2026-01-07'); await L.openCell(w, ST, '2026-01-07')
  await press(w, T('bid-more')); await P.waitForTimeout(400); await press(w, T('bid-postout')); await P.waitForTimeout(700); await press(w, T('po-confirm')); await P.waitForTimeout(900)
  for (let i = 0; i < 3 && (await vis(P, T('bid-picker')) || await vis(P, T('po-confirm')) || await vis(P, T('sheet-scrim'))); i++) { await P.keyboard.press('Escape'); await P.waitForTimeout(500) }
  await toTop()
  // (1) the one-day window
  await centreCell(ST, '2026-01-13'); await L.openCell(w, ST, '2026-01-13')
  if (await vis(P, T('postout-place'))) { await press(w, T('postout-place')); await P.waitForTimeout(500) }
  await L.approveWhatIEnter(w, true)
  const c = await L.centre(P, T('bid-LL'))
  await P.mouse.click(c.x, c.y)
  for (const ms of [30, 150, 400]) { await P.waitForTimeout(ms); await shot(w, `g3c-1-after-LL-${ms}`); console.log('t+', ms, JSON.stringify(await bodyHas()), 'window:', ((await txt(P, T('bid-picker'))) || '').slice(0, 160)) }
  const st1 = await bodyHas()
  rec('G3c one-day window, "Approve what I enter" on, leave after his date: the reason is on screen', 'desk', st1 && st1.some(x => /He posts out on 7 Jan: refuse or delete it/.test(x)) ? 'PASS' : 'FAIL', `"kept pending" on screen: ${JSON.stringify(st1)}`, ['g3c-1-after-LL-30', 'g3c-1-after-LL-150', 'g3c-1-after-LL-400'])
  await toTop()
  // (2) a one-day leave on a day after the date again, a different day, with the window staying: second tap path
  await centreCell(ST, '2026-01-14'); await L.openCell(w, ST, '2026-01-14')
  if (await vis(P, T('postout-place'))) { await press(w, T('postout-place')); await P.waitForTimeout(500) }
  await shot(w, 'g3c-2-before')
  // a range of two days (Pick a range) then LL
  console.log('buttons:', await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] button')].map(b => b.dataset.testid + '=' + b.innerText.trim()).join(' | ')))
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'g3c-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
await w.ctx.close(); L.writeResults('g3c'); await L.closeBrowser(); console.log('DONE')
