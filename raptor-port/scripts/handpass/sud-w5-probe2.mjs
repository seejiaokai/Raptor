// sud-w5-probe2 — READS only: Fri 17 – Sun 19 Jul's rows (seats, sims, duties, ground), and the board's markup around a
// ground row's puck and a sim / duty row on Fri, to copy the controls from what the app draws.
import './sud-w5-env.mjs'
import { writeFileSync } from 'node:fs'
const L = await import('./asp-w2-lib.mjs')
console.log('sud-w5-probe2 v1', L.URL_)
const W = L.mk('probe2', L.SIZES.d)
const { b, p } = await L.world(L.SIZES.d, W)
await L.signIn(p, 'ad', 'a')
const info = await p.evaluate(() => [4, 5, 6].map(di => {
  const d = window.DAYS[di]
  const fly = []
  ;(d.waves || []).forEach((w, wi) => (w.formations || []).forEach((f, fi) => (f.aircraft || []).forEach((a, ai) => fly.push(`${wi}.${fi}.${ai} ${f.cs || ''} T/O ${f.to} LD ${f.ld} p=${a.p} w=${a.w}`))))
  return { dt: d.dt, fly, sims: JSON.stringify(d.sims).slice(0, 900), duty: JSON.stringify(d.dutywaves).slice(0, 900), ground: JSON.stringify(d.ground).slice(0, 400), allhands: JSON.stringify(d.allhands).slice(0, 400) }
}))
console.log(JSON.stringify(info, null, 1))
await L.openBoard(p, W, 4)
const html = await p.evaluate(() => document.querySelector('#schedBoard').outerHTML)
writeFileSync('D:/raptor-work/c147-walk/w5/board-fri.html', html)
await W.pic(p, 'board-fri')
console.log('errors', W.errs)
await b.close()
