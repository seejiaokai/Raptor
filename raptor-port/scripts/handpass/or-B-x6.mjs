import { launch, openWorld } from './or-B-lib2.mjs'
const browser = await launch()
const { page: p } = await openWorld(browser)
const o = await p.evaluate(() => {
  const out = []
  window.DAYS.forEach((d, di) => d.waves.forEach((w, wi) => w.formations.forEach((f, fi) => f.aircraft.forEach((a, ai) => { for (const s of ['p', 'w']) if (!a[s]) out.push(`${di}.${wi}.${fi}.${ai}.${s} empty (${w.label} ${f.cs} ${f.to}-${f.ld})`) }))))
  return out
})
console.log(JSON.stringify(o))
const d = await p.evaluate(() => window.DAYS.map((d, di) => di + ':' + d.waves.length + 'w ' + d.dutywaves.length + 'd ' + (d.sims.oft.length + d.sims.amt.length) + 's'))
console.log(JSON.stringify(d))
await browser.close()
