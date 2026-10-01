/* phase 6 check — survey week 2 (Mon 20 Jul 26): who sits where, the weekend, OIL-able ground rows */
import { launch, context, page, signIn } from './dbrA-lib.mjs'
const browser = await launch()
const ctx = await context(browser)
await ctx.clock.setFixedTime(new Date(2026, 6, 15, 9, 0, 0))
const errors = []
const p = await page(ctx, errors)
await signIn(p, 'a')
const survey = () => p.evaluate(() => {
  const D = window.DAYS, P = window.PEOPLE, where = {}
  const put = (id, di, what) => { if (!id || !P[id]) return; (where[id] ??= []).push(`${di}:${what}`) }
  D.forEach((d, di) => {
    ;(d.waves || []).forEach(w => (w.formations || []).forEach(f => (f.aircraft || []).forEach(a => { put(a.p, di, 'fly.p'); put(a.w, di, 'fly.w') })))
    ;(d.dutywaves || []).forEach(dw => (dw.rows || []).forEach(r => { put(r.id, di, 'desk'); (r.more || []).forEach(m => put(m, di, 'desk.x')) }))
    Object.keys(d.sims || {}).forEach(k => (d.sims[k] || []).forEach(r => { put(r.p, di, 'sim.p'); put(r.w, di, 'sim.w'); (r.pax || []).forEach(m => put(m, di, 'sim.pax')); (r.more || []).forEach(m => put(m, di, 'sim.x')) }))
    ;(d.ground || []).forEach(r => { put(r.who, di, r.src ? 'ground.src' : 'ground'); (r.more || []).forEach(m => put(m, di, 'ground.x')) })
    ;(d.allhands || []).forEach(r => { ;[].concat(r.who || []).forEach(m => put(m, di, 'prog')); (r.more || []).forEach(m => put(m, di, 'prog.x')) })
  })
  return { week: window.CURWEEK, where: Object.fromEntries(Object.entries(where).map(([k, v]) => [k + ' ' + P[k].cs, v.join(' ')])),
    weekend: [5, 6].map(di => ({ di, dt: D[di].dt, ground: (D[di].ground || []).map(r => `${r.prog}|${r.who}|${r.src || ''}|${r.str}-${r.end}`), desks: (D[di].dutywaves || []).flatMap(dw => (dw.rows || []).map(r => `${r.role}|${r.id}|${r.str}-${r.end}`)) })) }
})
const w1 = await survey()
await p.evaluate(() => window.loadWeek('20/07/2026')); await p.waitForTimeout(800)
const w2 = await survey()
console.log(JSON.stringify({ w1weekend: w1.weekend, w2: w2.where, w2weekend: w2.weekend }, null, 1))
console.log('errors', errors)
await browser.close()
