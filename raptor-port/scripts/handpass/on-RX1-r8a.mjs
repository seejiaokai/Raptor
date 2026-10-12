import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'R8a' })
const { page, tid, shot, press } = W
const J = o => JSON.stringify(o)
const iid = await L.usualSat(W)
await L.frameBoard(page)
const row = page.locator(L.rowSel(0))
console.log('row html', (await row.evaluate(e => e.outerHTML.replace(/\s+/g, ' ').slice(0, 2500))))
console.log('row inputs', J(await row.evaluate(e => [...e.querySelectorAll('input, [contenteditable], textarea, select')].map(x => x.tagName + '#' + x.id + '.' + x.className + ' [' + [...x.attributes].map(a => a.name + '=' + a.value.slice(0, 30)).join(' ') + ']'))))
await shot('RX1-8-0-board-row')
await W.ctx.close(); process.exit(0)
