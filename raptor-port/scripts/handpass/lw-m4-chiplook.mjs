// M4 — the phone's Approvals filters beside his drawing (D1423): pictures at 402, the count 1 and a two-digit count
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/chips'
const L = await import('./lw-m4-lib.mjs')
console.log('[lw-m4-chiplook v1]')
L.clearOut()
const w = await L.newCtx('phone')
await L.signIn(w, 'admin')
await L.openApprovals(w)
await w.page.evaluate(() => window.scrollTo(0, 0))
const card = await w.page.locator('[data-testid="approvals-page"] .appr-card').boundingBox()
const clip = { x: 0, y: card.y - 4, width: 402, height: 330 }
await L.shot(w, 'phone-filters-new1', { clip })
/* a two-digit count — the text only, to see it fit (a stand-in for "New 15"; the route is the walk's) */
await w.page.evaluate(() => { const b = document.querySelector('[data-testid="appr-new"]'); const t = [...b.childNodes].filter(n => n.nodeType === 3); t[t.length - 1].textContent = '15' })
await L.shot(w, 'phone-filters-new15', { clip })
const fit = await w.page.evaluate(() => { const b = document.querySelector('[data-testid="appr-new"]'); return { sw: b.scrollWidth, cw: b.clientWidth, h: b.getBoundingClientRect().height } })
console.log('New 15 fits:', JSON.stringify(fit))
/* armed */
await w.page.evaluate(() => { const b = document.querySelector('[data-testid="appr-new"]'); const t = [...b.childNodes].filter(n => n.nodeType === 3); t[t.length - 1].textContent = '1' })
await L.press(w, '[data-testid="appr-approve-all"]')
await w.page.waitForTimeout(300)
await L.shot(w, 'phone-filters-armed', { clip })
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
