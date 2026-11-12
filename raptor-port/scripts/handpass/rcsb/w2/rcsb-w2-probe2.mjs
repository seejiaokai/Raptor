/* rcsb-w2-probe2 v1 — W2: which men are free on Thu/Fri/Mon/Tue in the fresh demo week (read-only look at the world) */
const C = await import('./rcsb-w2-common.mjs')
C.setShots('probe2')
console.log('rcsb-w2-probe2 v1', process.env.HP_SHOTS)
const Q = await C.load()
const { R, L } = Q
const w = await R.world('pc')
const { page } = w
const r = await page.evaluate(() => {
  const out = {}
  const people = Object.entries(window.PEOPLE).map(([k, p]) => ({ k, cs: p.cs, role: p.role || p.cat || '', keys: Object.keys(p).slice(0, 14).join(',') }))
  const days = [0, 1, 3, 4].map(d => JSON.stringify(window.DAYS[d]))
  const inputs = window.INPUTS.map(i => ({ p: i.person || i.people, d: i.date, t: i.type })).filter(i => /Jul (13|14|16|17)/.test(i.d || ''))
  return { people: people.map(p => ({ ...p, used: [0, 1, 3, 4].map((d, ix) => days[ix].includes('"' + p.k + '"')) })), inputs, waves: [0, 1, 3, 4].map(d => window.DAYS[d].waves.length) }
})
for (const p of r.people) console.log(C.j(p))
console.log('inputs', C.j(r.inputs))
console.log('waves', C.j(r.waves))
await w.browser.close()
