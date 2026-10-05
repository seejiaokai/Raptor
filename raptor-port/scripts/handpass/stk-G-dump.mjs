import * as G from './stk-G-lib.mjs'
const w = await G.world(); const p = w.p
const r = await p.evaluate(() => DAYS.map((d, di) => d.waves.map((w, gi) => w.formations.map((f, li) => ({ at: `${di}.${gi}.${li}`, cs: f.cs, msn: f.msn, rm: f.aircraft.map(a => a.rmks) })))))
for (const d of r) for (const w of d) for (const f of w) console.log(JSON.stringify(f))
await w.browser.close()
