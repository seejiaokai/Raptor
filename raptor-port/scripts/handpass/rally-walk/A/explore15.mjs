import { launch, ctxOpen, SIZES, sleep, shot, buildSat, bType, bf, addIt, setIt, warns, errors } from './lib.mjs'
console.log('explore15 v1')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, 'x')
await buildSat(p)
await bType(p, bf(5, 0, 0, 'rl'), '10:00')
console.log(await p.evaluate(() => { const e = [...document.querySelectorAll('#sbSide *')].filter(e => e.children.length === 0 && /later than suggested brief/.test(e.textContent))[0]; return e.outerHTML + '\nPARENT ' + e.parentElement.outerHTML.slice(0, 400) }))
await b.close()
