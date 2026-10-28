// Re-walk A7b — the posting-out refusal in the window of a leave on the grid (D1436): Blade posted out from 15 Jan, his Mon 2 Feb leave opened, Approve pressed.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-rw-a7b v2]')
const w = await L.newCtx('desk'); const P = w.page
const centreCell = async (who, iso) => { await L.reachCell(w, who, iso); await P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), L.cellId(who, iso)); await P.waitForTimeout(400) }
const winInfo = () => P.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find(b => b.getBoundingClientRect().height > 0 && b.innerText.trim().replace(/\s+/g, ' ') === 'Approve' || b.innerText.trim() === 'Approved')
  if (!btn) return null
  let e = btn; for (let i = 0; i < 6 && e && !(e.innerText.includes('Blade') && e.innerText.includes('Delete')); i++) e = e.parentElement
  const pair = [...e.querySelectorAll('button')].filter(b => /^(Approve|Refuse)/.test(b.innerText.trim())).map(b => b.innerText.trim() + ':' + b.getAttribute('aria-pressed') + ':' + b.className)
  return { text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 300), pair, testid: e.dataset.testid || e.className.toString().slice(0, 30) }
})
try {
  await L.signIn(w, 'admin')
  await centreCell('slash', '2026-01-15'); await L.openCell(w, 'slash', '2026-01-15')
  await press(w, T('bid-more')); await P.waitForTimeout(400)
  await press(w, T('bid-postout')); await P.waitForTimeout(700)
  await press(w, T('po-confirm')); await P.waitForTimeout(900)
  for (let i = 0; i < 3 && (await vis(P, T('bid-picker')) || await vis(P, T('po-confirm')) || await vis(P, T('sheet-scrim'))); i++) { await P.keyboard.press('Escape'); await P.waitForTimeout(500) }
  await centreCell('slash', '2026-02-02'); await L.openCell(w, 'slash', '2026-02-02')
  await shot(w, 'a7b-1-bidwin')
  const b4 = await winInfo(); console.log('window before:', JSON.stringify(b4))
  const ap = P.getByRole('button', { name: 'Approve', exact: true }).last()
  const bb = await ap.boundingBox(); await P.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await P.waitForTimeout(800)
  await shot(w, 'a7b-2-after-approve')
  const af = await winInfo(); console.log('window after Approve:', JSON.stringify(af))
  rec('A7.4 in the window of that leave on the grid, Approve is refused with the same reason', 'desk', af && /posts out/i.test(af.text) && !af.pair.some(x => /^Approved/.test(x) || /:true:/.test(x) && /^Approve/.test(x)) ? 'PASS' : 'FAIL', JSON.stringify(af), ['a7b-1-bidwin', 'a7b-2-after-approve'])
  const rf = P.getByRole('button', { name: 'Refuse', exact: true }).last()
  const rb = await rf.boundingBox(); await P.mouse.click(rb.x + rb.width / 2, rb.y + rb.height / 2); await P.waitForTimeout(800)
  await shot(w, 'a7b-3-refuse')
  const rr = await winInfo(); console.log('window after Refuse:', JSON.stringify(rr))
  rec('A7.4b Refuse works in that window', 'desk', rr ? 'PASS' : 'NOT WALKED', JSON.stringify(rr), ['a7b-3-refuse'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 300)); await shot(w, 'a7b-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
await w.ctx.close(); L.writeResults('a7b'); await L.closeBrowser(); console.log('DONE')
