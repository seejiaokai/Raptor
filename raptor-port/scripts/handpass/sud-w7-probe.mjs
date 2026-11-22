// w7 probe (read only): who is free to be R3/R4's man; Hex's own items Mon–Sun; empty seats on Fri/Sat; the bundle served.
import { DUMP } from './sud-w7-env.mjs'
const L = await import('./asp-w2-lib.mjs')
import { writeFileSync, mkdirSync } from 'node:fs'
console.log('sud-w7-probe v1', L.URL_, L.OUT)
mkdirSync(DUMP, { recursive: true })
const sz = L.SIZES.d, W = L.mk('probe', sz)
const { b, p } = await L.world(sz, W, '2026-07-13T09:00:00')
await L.signIn(p, 'ad', 'a')
const out = await p.evaluate(() => {
  const P = window.PEOPLE, D = window.DAYS, I = window.INPUTS || []
  const js = JSON.stringify(I)
  const dayHas = (di, id) => JSON.stringify(D[di]).includes('"' + id + '"')
  const cands = Object.keys(P).filter(id => { const q = P[id]; return !q.archived && !q.deleted && !q.san && (q.seat === 'FCP' || q.seat === 'RCP') && !js.includes('"' + id + '"') })
    .map(id => ({ id, cs: P[id].cs, seat: P[id].seat, cat: P[id].cat, sqn: P[id].sqn || P[id].squadron || '', days: D.map((d, i) => dayHas(i, id) ? i : null).filter(x => x !== null) }))
  const hex = D.map((d, i) => { const out = []; (d.waves || []).forEach(w => (w.formations || []).forEach(f => (f.aircraft || []).forEach(a => { if (a.p === 'rocky' || a.w === 'rocky') out.push(f.cs + ' ' + f.msn + ' T/O ' + f.to + ' LD ' + f.ld) }))); if (JSON.stringify(d.duties || '').includes('"rocky"')) out.push('duty'); if (JSON.stringify(d.sims || '').includes('"rocky"')) out.push('sim'); if (JSON.stringify(d.ground || '').includes('"rocky"')) out.push('ground'); return d.dt + ': ' + out.join('; ') })
  const empty = [4, 5].map(di => { const d = D[di]; const o = []; (d.waves || []).forEach((w, gi) => (w.formations || []).forEach((f, li) => (f.aircraft || []).forEach((a, ai) => { if (!a.w) o.push(`${di}.${gi}.${li}.${ai}.w ${f.cs} T/O ${f.to}`); if (!a.p) o.push(`${di}.${gi}.${li}.${ai}.p ${f.cs}`) }))); return { di, dt: d.dt, keys: Object.keys(d), waves: (d.waves || []).length, empty: o.slice(0, 8), sims: JSON.stringify(d.sims || d.sim || '').slice(0, 300) } })
  return { week: D.map(d => d.dt), cands: cands.slice(0, 40), hex, empty, inputsN: I.length, today: new Date().toString() }
})
writeFileSync(DUMP + '/probe.json', JSON.stringify(out, null, 1))
console.log(JSON.stringify(out.week), out.today)
console.log('HEX', out.hex.join(' | '))
console.log('CANDS', out.cands.map(c => `${c.id}/${c.cs}/${c.seat}/${c.cat} days[${c.days}]`).join(' '))
console.log('EMPTY', JSON.stringify(out.empty))
console.log('errs', W.errs.join(' || '))
await b.close()
