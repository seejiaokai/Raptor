import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, sleep, go } = L
const b = await launch()
const { p } = await ctxOpen(b, {})
const r = await p.evaluate(() => { const P = window.PEOPLE; return Object.entries(P).filter(([k, v]) => v.quals && (v.quals.scDay === false || v.quals.scNight === false)).map(([k, v]) => k + '=' + v.cs + '/' + v.seat + '/' + v.q + ' scDay=' + v.quals.scDay + ' scNight=' + v.quals.scNight) })
console.log(r.join('\n'))
await b.close()
