import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, sleep, go, shot } = L
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'quals'); await sleep(1000)
const r = await p.evaluate(() => { const row = [...document.querySelectorAll('#page-quals tr')].find(t => /Torch/.test(t.innerText)); return row ? row.outerHTML.slice(0, 2500) : 'none' })
console.log(r)
console.log(await p.evaluate(() => [...document.querySelectorAll('#page-quals button')].filter(e => e.offsetParent).map(e => e.id + '|' + e.innerText.trim().slice(0, 20)).slice(0, 12)))
await b.close()
