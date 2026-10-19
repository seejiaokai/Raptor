import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bType, bf, bPublish, sleep, shot, go, errors } = L
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched')
await openBoard(p, 4)
const before = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld],#schedBoard [data-slot]')].map(e => e.dataset.bfld || e.dataset.slot))
await p.locator('#schedBoard [data-sradd="4.oft"]:visible').first().click(); await sleep(500)
await p.locator('#schedBoard [data-gradd="4"]:visible').first().click(); await sleep(500)
const after = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld],#schedBoard [data-slot]')].filter(e => e.offsetParent).map(e => e.dataset.bfld || e.dataset.slot))
console.log(after.filter(k => !before.includes(k)).join(' '))
console.log(after.filter(k => /^(sr|s:|gr|g:)/.test(k)).join(' '))
await shot(p, 'x16')
await b.close()
