import { launch, ctxOpen, SIZES, sleep, go, shot } from './lib.mjs'
console.log('explore17 v1')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, 'x')
await go(p, 'logic')
console.log(await p.evaluate(() => { const els = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /rally|In-time|before T\/O|before take/i.test(e.textContent)); return els.map(e => e.tagName + '.' + e.className + '|' + e.textContent.trim().slice(0, 140) + '| parent: ' + e.parentElement.outerHTML.slice(0, 500)).join('\n---\n') }))
await shot(p, 'explore-logic')
await b.close()
