import * as B from './cal-B-lib.mjs'
const w = await B.world(process.argv[2] || 'desk')
console.log('fresh order', JSON.stringify(await B.blockOrder(w)))
await B.makeCounter(w, 'Probe pilots')
console.log('after make', JSON.stringify(await B.blockOrder(w)), 'dialogs', await w.page.evaluate(() => [...document.querySelectorAll('[role=dialog]')].map(e => e.getAttribute('data-testid'))))
await B.pic(w.page, 'probe-counter')
console.log(w.errors)
await B.close(w)
