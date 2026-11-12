/* rcf-w1 probe 1 — what Friday holds in the demo world, and the board's doors (read only). */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/probe1')
console.log('rcf-w1-probe1 v1')
const L = await import('../am/w2-lib.mjs')
const { browser, page, errors } = await L.openHi({ width: 1536, height: 864, dpr: 1 })
const FRI = 4
await L.board(page, FRI)
const info = await page.evaluate(di => {
  const d = window.DAYS[di], P = window.PEOPLE
  const cs = id => (P[id] && P[id].cs) || id
  return {
    date: d.date || d.name || null,
    waves: d.waves.map(w => ({ label: w.label, kind: w.kind, f: w.formations.map(f => ({ cs: f.cs, to: f.to, ld: f.ld, ac: f.aircraft.map(a => cs(a.p) + '/' + cs(a.w)) })) })),
    duties: (d.dutywaves || []).map(b => ({ label: b.label, rows: b.rows.map(r => `${r.role}|${r.str}-${r.end}|${cs(r.id)}`) })),
    ground: (d.ground || []).map(g => `${g.prog}|${g.str}-${g.end}|${cs(g.who)}`),
    sims: { oft: d.sims.oft.length, amt: d.sims.amt.length },
    keys: Object.keys(d),
  }
}, FRI)
console.log(JSON.stringify(info, null, 1))
const btns = await page.evaluate(() => [...document.querySelectorAll('#schedBoard button:not([hidden])')].filter(b => b.offsetWidth).map(b => (b.id || '') + '|' + [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',') + '|' + b.innerText.trim().slice(0, 24)).slice(0, 120))
console.log(btns.join('\n'))
await L.screen(page, 'fri-board')
console.log('weekdays:', await page.evaluate(() => window.DAYS.map((d, i) => i + ':' + (d.date || d.name || d.dow || '?')).join(' ')))
console.log('errors', errors)
await browser.close()
