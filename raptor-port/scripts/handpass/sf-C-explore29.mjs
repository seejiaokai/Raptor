import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, sleep, shot, go } = L
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'inputs'); await sleep(600)
const bt = await p.evaluate(() => [...document.querySelectorAll('#page-inputs button, #page-inputs [data-testid]')].filter(e => e.offsetParent).map(e => (e.dataset.testid || e.id) + '|' + e.innerText.trim().slice(0, 25)).slice(0, 40))
console.log(bt.join('\n'))
await b.close()
