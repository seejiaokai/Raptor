import * as L from './it-B-lib.mjs'
const W = await L.mk('desk', { who: 'us', pass: 'us' })
const p = W.page
await L.openNew(W, '2026-07-15')
await p.selectOption('#inpEditType', 'Event')
console.log(await p.evaluate(() => [...document.querySelectorAll('#inpEditPerson option')].map(o => o.value + ':' + o.text).slice(0, 6)))
await p.selectOption('#inpEditPerson', 'all')
await p.fill('#inpEditTitle', 'Open house')
const head = await L.saveWin(W, 'no')
console.log('head', head)
await L.closeWins(p)
console.log(await p.evaluate(() => window.INPUTS.filter(x => x.title === 'Open house').map(x => JSON.stringify({ p: x.person, t: x.type, d: x.date, acc: x.acc }))))
await L.shot(p, 'probe10')
await W.browser.close()
