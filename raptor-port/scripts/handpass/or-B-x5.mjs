import { launch, openWorld } from './or-B-lib2.mjs'
const browser = await launch()
const { page: p } = await openWorld(browser)
const o = await p.evaluate(() => {
  const P = window.PEOPLE, cs = id => (P[id] || {}).cs || id
  const out = {}
  for (const di of [2, 3]) {
    const d = window.DAYS[di]
    out[di] = d.waves.map((w, wi) => ({ wi, label: w.label, sa: w.sa, kind: w.kind, f: w.formations.map((f, fi) => ({ fi, cs: f.cs, to: f.to, ld: f.ld, ac: f.aircraft.map((a, ai) => `${ai}:${cs(a.p)}/${cs(a.w)}`) })) }))
    out[di + 'ground'] = d.ground.map(g => `${g.prog}|${g.str}-${g.end}|${cs(g.who)}`)
    out[di + 'duty'] = d.dutywaves.map(b => b.rows.map(r => `${r.role}|${r.str}-${r.end}|${cs(r.id)}`))
  }
  out.ranger = Object.keys(P).find(k => P[k].cs === 'Ranger')
  out.tally = Object.keys(P).find(k => P[k].cs === 'Tally')
  return out
})
console.log(JSON.stringify(o, null, 1).slice(0, 6000))
await browser.close()
