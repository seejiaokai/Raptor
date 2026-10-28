// Re-walk walker B, diagnostic: what stands over the Approvals tab after bids are placed on the grid (the b5 run printed "covered").
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-rw-b5c v1]')
const w = await B.newPhone(402, 874, 'chromium'); const P = w.page
const probe = (tag) => P.evaluate((tag) => {
  const t = document.querySelector('[data-testid="lw-tab-approvals"]'); const r = t.getBoundingClientRect()
  const pts = [[0.5, 0.5], [0.2, 0.5], [0.8, 0.5]].map(([fx, fy]) => { const x = r.left + r.width * fx, y = r.top + r.height * fy; const h = document.elementFromPoint(x, y); const cs = h ? getComputedStyle(h) : null; let a = h, chain = []; for (let i = 0; i < 4 && a; i++, a = a.parentElement) { const c = getComputedStyle(a); chain.push(`${a.tagName}.${String(a.className).slice(0, 24)} pos ${c.position} op ${c.opacity} vis ${c.visibility} pe ${c.pointerEvents} z ${c.zIndex}`) } return { x: Math.round(x), y: Math.round(y), el: h ? h.tagName + '.' + String(h.className).slice(0, 30) : null, chain } })
  return { tag, tab: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], scrollY: Math.round(scrollY), pts }
}, tag)
try {
  await B.signIn(w, 'admin')
  console.log(JSON.stringify(await probe('fresh sign-in')))
  await L.openCell(w, 'dice', '2026-01-15'); await L.placeLeave(w, 'LL'); await B.sleep(w, 500)
  console.log(JSON.stringify(await probe('after one admin bid')))
  await shot(w, 'b5c-after-bid')
  for (const id of ['glass', 'freak', 'drill']) { await L.openCell(w, id, '2026-01-15'); await L.placeLeave(w, 'LL'); await B.sleep(w, 400) }
  console.log(JSON.stringify(await probe('after four admin bids')))
  const tabTapped = await P.evaluate(() => 0)
  await B.press(w, T('lw-tab-approvals')); await B.sleep(w, 700)
  console.log('Approvals page visible after the tap:', await B.vis(P, T('approvals-page')))
  await shot(w, 'b5c-after-tap')
} catch (e) { console.log('ERROR', String(e).slice(0, 300)) }
await w.ctx.close(); await B.closeAll()
