import * as L from './cal-F-lib2.mjs'
const b = await L.launch()
const ctx = await L.newCtx(b)
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
const out = await p.evaluate(() => {
  const P = window.PEOPLE
  const res = {}
  for (let d = 0; d < 7; d++) {
    const day = document.querySelector(`#vWeek .day[data-day="${d}"]`)
    const set = new Set()
    if (day) for (const e of day.querySelectorAll('.puck[data-person]')) set.add(P[e.dataset.person] ? P[e.dataset.person].cs : e.dataset.person)
    res[d] = [...set]
  }
  const inp = {}
  for (const r of window.INPUTS) { const k = r.date + (r.endDate ? '..' + r.endDate : ''); (inp[k] = inp[k] || []).push((P[r.person] || {}).cs + ':' + r.type) }
  return { res, inp }
})
console.log(JSON.stringify(out, null, 1))
await b.close()
