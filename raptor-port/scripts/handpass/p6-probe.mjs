/* [DB-READINESS] phase 6 (a), (b), (d) — the FULL check's survey: who sits where on the demo week, which days are
   published, which requests are activity requests, with the clock fixed at Wed 15 Jul 26 (a delete's cutoff). */
import { launch, context, page, signIn, BASE } from './dbrA-lib.mjs'
const browser = await launch()
const ctx = await context(browser)
await ctx.clock.setFixedTime(new Date(2026, 6, 15, 9, 0, 0))
const errors = []
const p = await page(ctx, errors)
await signIn(p, 'a')
const out = await p.evaluate(() => {
  const D = window.DAYS, P = window.PEOPLE
  const where = {}
  const put = (id, di, what) => { if (!id || !P[id]) return; (where[id] ??= []).push(`${di}:${what}`) }
  D.forEach((d, di) => {
    ;(d.waves || []).forEach((w, wi) => (w.formations || []).forEach((f, fi) => (f.aircraft || []).forEach((a, ai) => { put(a.p, di, `fly.p`); put(a.w, di, 'fly.w') })))
    ;(d.dutywaves || []).forEach(dw => (dw.rows || []).forEach(r => { put(r.id, di, 'desk'); (r.more || []).forEach(m => put(m, di, 'desk.x')) }))
    Object.keys(d.sims || {}).forEach(k => (d.sims[k] || []).forEach(r => { put(r.p, di, 'sim.p'); put(r.w, di, 'sim.w'); (r.pax || []).forEach(m => put(m, di, 'sim.pax')); (r.more || []).forEach(m => put(m, di, 'sim.x')) }))
    ;(d.ground || []).forEach(r => { put(r.who, di, r.src ? 'ground.src' : 'ground'); (r.more || []).forEach(m => put(m, di, 'ground.x')) })
    ;(d.allhands || []).forEach(r => { ;[].concat(r.who || []).forEach(m => put(m, di, 'prog')); (r.more || []).forEach(m => put(m, di, 'prog.x')) })
  })
  const ok = window.SCHED && window.SCHED.ok
  return {
    week: window.CURWEEK,
    dates: D.map(d => d.dt),
    published: Object.keys((window.SCHED && window.SCHED.dayOK) || window.SCHED?.ok || {}),
    schedKeys: Object.keys(window.SCHED || {}),
    where: Object.fromEntries(Object.entries(where).sort((a, b) => b[1].length - a[1].length).slice(0, 25).map(([k, v]) => [k + ' ' + P[k].cs, v.join(' ')])),
    inputs: (window.INPUTS || []).map(r => `${r.iid} ${r.person} ${r.type} ${r.date}${r.yr ? '/' + r.yr : ''} acc=${r.acc || ''}`).slice(0, 80),
    today: new Date().toISOString(),
  }
})
console.log(JSON.stringify(out, null, 1))
console.log('errors', errors)
await browser.close()
