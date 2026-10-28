// M5a re-walk 2b — the LVE figure beside a name: what is it, can it hold focus; and what covered the Grid tab after the slim bar
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/rewalk/r2b'
process.env.LW_TODAY ||= '2026-01-25'
const R = await import('./lw-m5a-rewalk-lib.mjs')
const { L, T, note, press, pwRead, focusId, nameBtn, shotD } = R
console.log('[lw-m5a-rewalk-2b v1]')
L.clearOut()
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin')
const info = await P.evaluate(() => { const e = document.querySelector('[data-testid="bal-bane"]'); return { tag: e.tagName, tabindex: e.getAttribute('tabindex'), role: e.getAttribute('role'), cls: e.className, html: e.outerHTML.slice(0, 200), inner: [...e.querySelectorAll('button,[tabindex]')].map(x => x.tagName + '.' + x.className).slice(0, 4) } })
console.log('figure element:', JSON.stringify(info))
// open by mouse, Escape, what has focus; then open by keyboard (Tab to the figure + Enter) and Escape
await press(w, '[data-testid="bal-bane"]'); await P.waitForTimeout(700)
console.log('window opened:', !!(await pwRead(P)))
await P.keyboard.press('Escape'); await P.waitForTimeout(500)
console.log('focus after Escape (mouse open):', await focusId(P))
await shotD(w, '01-after-escape')
// a second try: the name button works; compare what the name does
await press(w, nameBtn('bane')); await P.waitForTimeout(600); await P.keyboard.press('Escape'); await P.waitForTimeout(400)
console.log('focus after Escape (name open):', await P.evaluate(() => document.activeElement?.className))
// the cover: open slim bar route, close it, what covers the Grid tab
await L.openApprovals(w)
await P.locator('[data-testid="approvals-page"] .appr-dlink').first().click(); await P.waitForTimeout(900)
await press(w, nameBtn('bane')); await P.waitForTimeout(700)
await P.keyboard.press('Escape'); await P.waitForTimeout(400)
const c1 = await P.evaluate(() => { const e = document.querySelector('[data-testid="lw-tab-grid"]'); const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { who: h?.tagName + '.' + String(h?.className).slice(0, 40) + '#' + (h?.dataset?.testid || ''), slim: !!document.querySelector('[data-testid="appr-slim"]') } })
console.log('Grid tab cover with the slim bar up:', JSON.stringify(c1))
await shotD(w, '02-slim-up')
await w.ctx.close(); await L.closeBrowser()
