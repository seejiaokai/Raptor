// exploration only: a day holding two half-day entries -> what a tap opens (the day's list)
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const w = await M.start('desk')
const P = w.page
const iso = '2026-11-16'
await M.bidType(w, 'bane', iso, { approve: false, portion: 'am' })
await M.bidType(w, 'bane', iso, { approve: false, portion: 'pm', type: 'OL' })
console.log('cell', JSON.stringify(await M.cellWords(P, 'bane', iso)))
console.log('records', await M.stateOf(P, 'bane', iso))
await L.openCellR(w, 'bane', iso); await P.waitForTimeout(500)
console.log('dump:', JSON.stringify(await L.sheetDump(P)).slice(0, 2000))
const ids = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="dl-"]')].map(e => e.dataset.testid))
console.log('dl ids', ids)
await M.settled(w, 'x-explore-daylist')
console.log('errs', w.errs)
await w.ctx.close(); await M.closeBrowser()
