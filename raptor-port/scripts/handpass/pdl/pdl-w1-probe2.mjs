/* pdl-w1-probe2 v1 — exact occupancy of the people Mon-Thu */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w1/probe')
console.log('pdl-w1-probe2 v1')
const X = await import('../rcf/rcf-w1-lib.mjs')
const w = await X.world('desktop')
const { page } = w
const r = await page.evaluate(() => {
  const P = window.PEOPLE
  const occ = {}
  const add = (id, tag) => { if (!id || !P[id]) return; (occ[P[id].cs] ||= []).push(tag) }
  const arr = v => Array.isArray(v) ? v : [v]
  for (let di = 0; di < 5; di++) {
    const d = window.DAYS[di]
    d.waves.forEach((wv, gi) => wv.formations.forEach(f => f.aircraft.forEach(a => { add(a.p, 'd' + di + ' fly'); add(a.w, 'd' + di + ' fly') })))
    d.dutywaves.forEach(b => b.rows.forEach(r => add(r.id, 'd' + di + ' duty')))
    d.sims.oft.forEach(s => { add(s.p, 'd' + di + ' sim'); add(s.w, 'd' + di + ' sim') })
    d.sims.amt.forEach(s => (s.pax || []).forEach(x => add(x, 'd' + di + ' amt')))
    d.ground.forEach(g => arr(g.who).forEach(x => add(x, 'd' + di + ' ground')))
    d.allhands.forEach(a => arr(a.who).forEach(x => add(x, 'd' + di + ' allhands')))
  }
  const inp = (window.INPUTS || []).map(i => JSON.stringify(i).slice(0, 160))
  return { occ, ninp: inp.length, inp: inp.slice(0, 40), keys: Object.keys(window.DAYS[0]) }
})
console.log('Ranger', JSON.stringify(r.occ['Ranger']))
console.log('free Mon-Thu:', Object.keys(await page.evaluate(() => Object.fromEntries(Object.values(window.PEOPLE).map(p => [p.cs, 1])))).filter(cs => !r.occ[cs]).join(','))
console.log('keys', r.keys, 'inputs', r.ninp); r.inp.forEach(x => console.log(x))
await w.browser.close()
