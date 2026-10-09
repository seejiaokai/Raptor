import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('desk', 'ad')
const p = w.page
const r = await L.fileNew(w, { iso: '2026-07-21', type: 'ATT C', doc: L.SAMPLE })
console.log(JSON.stringify(r))
console.log(JSON.stringify(await L.recBy(p, { type: 'ATT C', date: 'Jul 21' })))
console.log(await p.evaluate(() => [...document.querySelectorAll('.airpop, .floatwin')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 400))))
await L.pic(w, 'x7-attc-saved')
console.log(w.errors)
await w.browser.close()
