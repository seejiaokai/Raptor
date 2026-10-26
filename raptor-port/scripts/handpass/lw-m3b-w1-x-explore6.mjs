// exploration only: an Other filed from the war: the box's drawing, the stored input, the Inputs list DOM
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const w = await M.start('phone')
const P = w.page
const D = '2026-11-10'
await L.openCellR(w, 'bane', D); await P.waitForSelector(T('bid-picker'))
await L.press(w, T('portion-am'))
await L.press(w, T('bid-remarks')); await P.keyboard.type('Brief'); await P.waitForTimeout(200)
await L.press(w, T('bid-more')); await P.waitForSelector(T('bid-more-menu'))
await L.press(w, T('bid-file-OTH')); await P.waitForTimeout(700)
const ci = await L.cellInfo(P, 'bane', D)
console.log('boxes', JSON.stringify(ci.boxes.map(b => ({ text: b.text, cls: b.cls, bg: b.bg, ol: b.ol, bs: b.bs, bf: b.bf, brs: b.brs, bw: b.bw, bc: b.bc, color: b.color, fs: b.fs }))))
console.log('INPUTS all for bane:', JSON.stringify(await P.evaluate(() => (window.INPUTS || []).filter(r => JSON.stringify(r).includes('bane')).map(r => r))).slice(0, 1500))
await L.inputsList(w); await P.waitForTimeout(800)
console.log('inputs page testids:', JSON.stringify(await P.evaluate(() => [...new Set([...document.querySelectorAll('#page-inputs [data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid.replace(/[0-9a-z]{10,}/g, '<id>')))].slice(0, 60))))
console.log('inputs page text:', (await L.txt(P, '#page-inputs')).slice(0, 700))
await M.settled(w, 'x-explore-inputs')
console.log('errs', w.errs)
await w.ctx.close(); await M.closeBrowser()
