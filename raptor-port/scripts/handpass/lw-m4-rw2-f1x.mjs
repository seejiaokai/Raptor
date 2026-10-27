// Re-walk 2 F1x — explore: Ranger PM approved + AM pending on Tue 13 Jan; what the grid cell, the day's list and Approvals show.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk2'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, placeBid } = A
const { T, shot, txt, vis, press } = L
console.log('[lw-m4-rw2-f1x v1]')
const w = await L.newCtx('desk'); const P = w.page
const cellTxt = () => P.evaluate(id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? { text: e.innerText.replace(/\s+/g, ' ').trim(), html: e.innerHTML.slice(0, 600), cls: e.className } : null }, L.cellId('bane', '2026-01-13'))
try {
  await L.signIn(w, 'admin')
  const ok1 = await placeBid(w, 'bane', '2026-01-13', 'LL', 'pm')
  console.log('PM placed (admin, approve-what-I-enter default):', ok1)
  console.log('cell after PM:', JSON.stringify(await cellTxt()))
  const ok2 = await placeBid(w, 'bane', '2026-01-13', 'LL', 'am', { adminOff: true })
  console.log('AM placed pending:', ok2)
  console.log('cell after AM:', JSON.stringify(await cellTxt()))
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  await L.reachCell(w, 'bane', '2026-01-13')
  await P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), L.cellId('bane', '2026-01-13'))
  await L.openCell(w, 'bane', '2026-01-13')
  await shot(w, 'f1x-1-cell-opened')
  console.log('visible: bid-picker', await vis(P, T('bid-picker')), 'daylist', await vis(P, T('daylist-sheet')))
  console.log('window text:', await txt(P, T('daylist-sheet')) || await txt(P, T('bid-picker')))
  const tids = await P.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().height > 0 && /^(dl|decide|bid|portion)/.test(e.dataset.testid)).map(e => e.dataset.testid))
  console.log('ids:', tids.join(' '))
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  await L.openApprovals(w)
  await shot(w, 'f1x-2-approvals')
  const lines = (await L.apprLines(P)).filter(l => l.who === 'bane')
  console.log('Ranger lines:', JSON.stringify(lines))
} catch (e) { console.log('ERR', e); await shot(w, 'f1x-error').catch(() => {}) }
console.log('errs', w.errs)
await w.ctx.close(); await L.closeBrowser(); console.log('DONE')
