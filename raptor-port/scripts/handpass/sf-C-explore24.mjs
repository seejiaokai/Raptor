import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, bPut, bType, bf, sleep, shot, go, chipLine } = L
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched'); await p.evaluate(() => window.addWave(4, 'sc')); await sleep(500)
await openBoard(p, 4)
await bPut(p, 4, 0, 0, 2, 'p', ['dice'])
await p.locator('#schedBoard [data-safly="4.0.0.2"]:visible').first().click(); await sleep(500)
console.log(await chipLine(p))
const mv = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-move]')].filter(e => e.offsetParent).map(e => e.dataset.move + '|' + e.className).slice(0, 30))
console.log(mv.join('\n'))
const row = await p.evaluate(() => { const e = document.querySelector('#schedBoard [data-slot="4.0.0.2.p"]'); let r = e; for (let i = 0; i < 5; i++) r = r.parentElement; return r.outerHTML.slice(0, 1500) })
console.log(row)
await b.close()
