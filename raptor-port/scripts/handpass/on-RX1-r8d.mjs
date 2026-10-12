import * as L from './on-RX1-lib.mjs'
const J = o => JSON.stringify(o)
const W = await L.world({ tag: 'R8d' })
const { page, tid, shot } = W
const iid = await L.usualSat(W)
console.log('board controls', J(await page.evaluate(() => [...document.querySelectorAll('#sbBoard input, #sbBoard select, #sbBoard textarea, #sbBoard [contenteditable=true]')].filter(e => e.getClientRects().length).map(e => e.tagName + '.' + String(e.className).slice(0, 14) + '[' + (e.getAttribute('data-bfld') || e.id || e.getAttribute('data-txt') || '') + ']').filter((v, i, a) => a.indexOf(v) === i).slice(0, 60))))
const pi = await page.evaluate(() => { const s = [...document.querySelectorAll('#sbBoard .sb-sec')].find(e => /PERSONAL INPUTS/i.test(e.textContent.slice(0, 80))); return s ? s.outerHTML.replace(/\s+/g, ' ').slice(0, 2500) : 'none' })
console.log('personal inputs', pi)
const un = await page.evaluate(() => { const s = [...document.querySelectorAll('#sbBoard .sb-sec')].find(e => /^\s*UNAVAILABLE/i.test(e.textContent.trim())); return s ? s.outerHTML.replace(/\s+/g, ' ').slice(0, 1500) : 'none' })
console.log('unavailable', un)
await W.ctx.close(); process.exit(0)
