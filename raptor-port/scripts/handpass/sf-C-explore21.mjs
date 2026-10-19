import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, sleep, go } = L
const b = await launch()
const { p } = await ctxOpen(b, {})
const r = await p.evaluate(() => { const P = window.PEOPLE; const k = Object.keys(P); return { one: JSON.stringify(P.ignite).slice(0, 900), keys: Object.keys(P.ignite), sc: k.filter(x => JSON.stringify(P[x]).includes('SC')).slice(0, 10), cur: k.map(x => x + ':' + JSON.stringify(P[x].cur || P[x].currency || P[x].lapsed || '')).slice(0, 8) } })
console.log(JSON.stringify(r, null, 1))
await go(p, 'quals'); await sleep(1000)
console.log((await p.evaluate(() => document.querySelector('#page-quals').innerText.replace(/\s+/g, ' ').slice(0, 1500))))
await b.close()
