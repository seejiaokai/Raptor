import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'x6' })
const { page, tid, shot, press } = W
const J = o => JSON.stringify(o)
const iid = await L.usualSat(W, { goToBoard: false })
await L.frameGrnd(page)
console.log(J(await page.evaluate(di => {
  const day = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
  const rows = [...day.querySelectorAll('.sec-grnd .pl-row')]
  return rows.map(r => ({ html: r.outerHTML.replace(/\s+/g, ' ').slice(0, 1500) }))
}, L.SAT_DI)))
await W.ctx.close(); process.exit(0)
