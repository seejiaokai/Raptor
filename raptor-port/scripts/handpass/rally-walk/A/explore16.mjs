import { launch, ctxOpen, SIZES, sleep, openBoard } from './lib.mjs'
console.log('explore16 v1')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, 'x')
await openBoard(p, 5)
console.log(await p.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => /^(Fri 17|‹|›)$/.test((e.innerText || '').trim()) && e.children.length === 0).map(e => e.tagName + '|' + e.className + '|' + [...e.attributes].map(a => a.name + '=' + a.value).join(',')).join('\n')))
await b.close()
