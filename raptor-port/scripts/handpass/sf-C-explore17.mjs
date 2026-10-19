import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bType, bf, bPublish, sleep, shot, go, errors } = L
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched')
await openBoard(p, 4)
await p.locator('#schedBoard [data-gradd="4"]:visible').first().click(); await sleep(500)
const gi = await p.evaluate(() => window.DAYS[4].ground.length - 1)
await bType(p, `#schedBoard [data-bfld="gr:4.${gi}.prog"]`, 'TEST GROUND')
const h = await p.evaluate(i => { const e = document.querySelector(`#schedBoard [data-bfld="gr:4.${i}.prog"]`); let r = e; for (let k = 0; k < 4 && r.parentElement; k++) r = r.parentElement; return r.outerHTML.slice(0, 2500) }, gi)
console.log(h)
await shot(p, 'x17')
await b.close()
