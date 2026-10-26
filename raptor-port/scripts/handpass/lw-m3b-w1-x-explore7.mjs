// exploration only: ⋯ -> Other on a Saturday: what opens (the OIL question)
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const w = await M.start('phone')
const P = w.page
const D = '2026-11-14'
await L.openCellR(w, 'bane', D); await P.waitForSelector(T('bid-picker'))
await L.press(w, T('bid-more')); await P.waitForSelector(T('bid-more-menu'))
await L.press(w, T('bid-file-OTH')); await P.waitForTimeout(900)
const vis = await P.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().height > 0 && /oil|inped|win-input|docconf|ask/i.test(e.dataset.testid)).map(e => e.dataset.testid))
console.log('visible oil-ish testids:', JSON.stringify(vis))
console.log('windows:', JSON.stringify(await M.anyWindowOpen(P)))
const dump = await P.evaluate(() => { const e = [...document.querySelectorAll('[data-testid="oilconf"], .oilconf, [role="dialog"]')].filter(e => e.getBoundingClientRect().height > 0).pop(); return e ? { id: e.dataset.testid || e.className, text: e.innerText.replace(/\s+/g, ' ').slice(0, 500), btns: [...e.querySelectorAll('button')].map(b => (b.dataset.testid || '') + '=' + b.textContent.trim()).slice(0, 14) } : null })
console.log('dump:', JSON.stringify(dump))
await M.settled(w, 'x-explore-oilq')
console.log('INPUTS for bane Other:', JSON.stringify(await P.evaluate(() => (window.INPUTS || []).filter(r => r.type === 'Other' && JSON.stringify(r).includes('bane')))))
console.log('errs', w.errs)
await w.ctx.close(); await M.closeBrowser()
