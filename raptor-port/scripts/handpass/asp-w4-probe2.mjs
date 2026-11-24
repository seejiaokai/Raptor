// asp-w4-probe2 — read only: what Hex (rocky) holds on Thu 16 Jul in the demo week, and his crew-list reason there.
// Run from raptor-port/: W2_URL=http://localhost:4393/ W2_OUT=docs/img/handpass/2026-11-22-allavail-sans-posted/w4/probe node scripts/handpass/asp-w4-probe2.mjs
import * as L from './asp-w2-lib.mjs'
const { sleep, J, HEX } = L
console.log('asp-w4-probe2 v1', L.URL_, L.OUT)
const sz = L.SIZES.d, W = L.mk('probe2', sz)
const { b, p } = await L.world(sz, W)
await L.signIn(p, 'ad', 'a')
const items = await p.evaluate(id => {
  const d = window.DAYS[3]
  const s = JSON.stringify(d)
  const hits = []
  const walk = (o, path) => {
    if (!o || typeof o !== 'object') return
    for (const [k, v] of Object.entries(o)) {
      if (v === id || (Array.isArray(v) && v.includes(id))) hits.push(path + '.' + k)
      else walk(v, path + '.' + k)
    }
  }
  walk(d, 'thu')
  return { dt: d.dt, hits }
}, HEX)
console.log('thu hits', J(items))
for (const h of items.hits) {
  const parts = h.split('.').slice(1, -1)
  const v = await p.evaluate(pp => { let o = window.DAYS[3]; for (const k of pp) o = o[k]; return JSON.stringify(o).slice(0, 400) }, parts)
  console.log(h, v)
}
await L.openBoard(p, W, 3)
const why = await p.evaluate(id => [...document.querySelectorAll(`#schedBoard .rpuck[data-person="${id}"]`)].map(e => (e.innerText || '').replace(/\s+/g, ' ') + ' {' + e.className + '} title=' + (e.getAttribute('title') || '')).join(' | '), HEX)
console.log('crew list', why)
await W.pic(p, 'thu-board')
await b.close()
