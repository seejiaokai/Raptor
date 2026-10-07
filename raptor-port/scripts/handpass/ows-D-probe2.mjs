import * as D from './ows-D-lib.mjs'
const { world, sleep, A, R, W, L } = D
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const info = await p.evaluate(() => {
  const P = window.PEOPLE
  const ppl = Object.entries(P).map(([id, v]) => `${id}:${v.cs}:${v.cat || v.role || ''}:${v.arch ? 'ARCH' : ''}`)
  const used = di => { const d = window.DAYS[di]; const s = new Set(); const add = x => { if (!x) return; if (Array.isArray(x)) x.forEach(add); else s.add(x) }
    d.waves.forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { add(a.p); add(a.w) })))
    d.dutywaves.forEach(b => b.rows.forEach(r => { add(r.id); (r.more || []).forEach(m => add(m.id || m)) }))
    d.sims.oft.forEach(x => { add(x.p); add(x.w) }); d.sims.amt.forEach(x => add(x.pax))
    d.ground.forEach(g => add(g.who)); d.allhands.forEach(a => add(a.who)); return [...s] }
  return { ppl, sat: used(5), sun: used(6), mon: used(0) }
})
console.log(JSON.stringify(info))
const lw = await p.evaluate(() => { try { const st = window.lwState(); return Object.keys(st.wars[0].recs || {}).join(',') } catch (e) { return 'n/a ' + e } })
console.log('LW roster ids', lw)
await browser.close()
