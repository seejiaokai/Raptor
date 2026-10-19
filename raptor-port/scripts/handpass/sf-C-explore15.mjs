import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bType, bf, bPublish, sleep, shot, go, errors } = L
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched')
await openBoard(p, 4)
const bt = await p.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard [data-simadd], #schedBoard [data-gradd]')].filter(e => e.offsetParent && /\+|Sim|Ground|Row|Block|Event|Prog/i.test(e.innerText)).map(e => e.className + '|' + JSON.stringify(e.dataset) + '|' + e.innerText.trim().slice(0, 30)))
console.log(bt.join('\n'))
const keys = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld],#schedBoard [data-slot]')].filter(e => e.offsetParent).map(e => e.dataset.bfld || e.dataset.slot).filter(k => !/^(ff|fr):/.test(k)))
console.log(keys.join(' '))
await p.evaluate(() => { const e = document.querySelector('#schedBoard'); e.scrollTo ? e.scrollTo(0, 99999) : 0; window.scrollTo(0, 99999) }); await sleep(400)
await shot(p, 'x15-bottom')
await b.close()
