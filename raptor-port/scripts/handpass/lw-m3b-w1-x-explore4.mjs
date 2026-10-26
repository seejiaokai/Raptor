// exploration only: are the Manning rows pinned (always in view) on a phone? where is the Manning button when they are open?
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const w = await M.start('phone')
const P = w.page
const D = '2026-12-15'
const rect = sel => P.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom), getComputedStyle(e).position] }, sel)
const dump = async label => console.log(label, 'scrollY', await P.evaluate(() => Math.round(scrollY)), 'toggle', JSON.stringify(await rect(T('counts-toggle'))), 'head', JSON.stringify(await rect(T('head-' + D))), 'availP', JSON.stringify(await rect(T('avail-p-' + D))), 'row bane', JSON.stringify(await rect(T('row-bane'))))
await M.availP(w, D)   // opens the Manning rows
await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
await dump('open, top')
for (const y of [100, 250, 400, 800, 1500]) { await P.evaluate(y => window.scrollTo(0, y), y); await P.waitForTimeout(300); await dump('scrollTo ' + y) }
await M.settled(w, 'x-explore-scrolled')
console.log('errs', w.errs)
await w.ctx.close(); await M.closeBrowser()
