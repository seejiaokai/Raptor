// exploration only: the Legend and its Codes; the drag window's ⋯
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const w = await M.start('desk')
const P = w.page
await L.press(w, '[data-testid="legend"], button:has-text("Legend")'); await P.waitForTimeout(700)
console.log('legend tids:', JSON.stringify(await P.evaluate(() => [...document.querySelectorAll('[data-testid^="leg"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid))))
console.log('legend text:', (await P.evaluate(() => { const e = document.querySelector('[data-testid="legend-open"]') || document.querySelector('[data-testid="legend"]'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 2500) : null })))
await M.settled(w, 'x-explore-legend')
console.log('tabs inside:', JSON.stringify(await P.evaluate(() => [...document.querySelectorAll('[data-testid="legend-open"] button, [data-testid="legend-open"] [role="tab"]')].map(b => b.textContent.trim() + '|' + (b.dataset.testid || '')))))
console.log('errs', w.errs)
await w.ctx.close(); await M.closeBrowser()
