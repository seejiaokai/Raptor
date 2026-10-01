/* [WARN-HIDE-KEPT] (D469, D471, D472) — probe 1: what each day of the demo week warns about today, and which pucks each
   warning flags (ring / chip), so the mock-up is drawn on a day that shows the change honestly. Reads only. */
import * as L from './dbrA-lib.mjs'
const browser = await L.launch()
const ctx = await L.context(browser, {})
const errors = []
const p = await L.page(ctx, errors)
await L.signIn(p, 'a')
await L.go(p, 'editsched')
const out = await p.evaluate(() => {
  const W = window.WARN
  return W.byDay.map((g, di) => ({
    di, n: (g && g.warns || []).length,
    warns: (g && g.warns || []).map((w, ix) => ({ ix, sev: w.sev, code: w.code, who: (w.who || []).map(id => window.PEOPLE[id] ? window.PEOPLE[id].cs : id), msg: w.msg, slots: w.slots || w.keys || null, prevDi: w.prevDi })),
    sev: W.sev[di], chip: W.chip && W.chip[di], dash: W.dash && W.dash[di], trace: W.trace && W.trace[di] ? Object.keys(W.trace[di]) : null,
    approved: !!(window.SCHED.approved && window.SCHED.approved[di])
  }))
})
for (const d of out) {
  console.log(`\n== day ${d.di}  ${d.n} issue(s)  approved=${d.approved}`)
  for (const w of d.warns) console.log(`   [${w.ix}] ${w.sev} ${w.code} · ${w.who.join(', ')} — ${w.msg}${w.prevDi != null ? ' (prevDi ' + w.prevDi + ')' : ''}`)
  console.log('   sev', JSON.stringify(d.sev), '\n   chip', JSON.stringify(d.chip), '\n   dash', JSON.stringify(d.dash), '\n   trace', JSON.stringify(d.trace))
}
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
