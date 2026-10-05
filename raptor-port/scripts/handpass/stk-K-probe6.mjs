import * as K from './stk-K-lib.mjs'
const { L, W, H } = K
const { browser, p, errors } = await H.world({ who: 'a', phone: false })
const r = await p.evaluate(() => {
  const out = []
  for (let di = 0; di < 5; di++) {
    const d = window.DAYS[di]; const ws = (window.WARN.byDay[di] || {}).warns || []
    const flagged = new Set(ws.flatMap(w => w.who || []))
    out.push({ di, issues: ws.length, waves: d.waves.map((w, wi) => w.formations.map((f, fi) => ({ wi, fi, cs: f.cs, to: f.to, ld: f.ld, crew: f.aircraft.flatMap(a => [a.p, a.w]).filter(Boolean).map(x => x + (flagged.has(x) ? '*' : '')) }))).flat() })
  }
  return out
})
for (const d of r) { console.log('day', d.di, 'issues', d.issues); for (const f of d.waves) console.log('  ', JSON.stringify(f)) }
await browser.close()
