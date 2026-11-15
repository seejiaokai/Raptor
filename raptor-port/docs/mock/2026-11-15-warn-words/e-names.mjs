/* E — the checks' short names (redraw 3). REAL today: Insights' "Conflicts by type" on the seeded week, phone.
   DRAWN proposed: only the name text of rows in the table changed; counts and order untouched. usage: node e-names.mjs */
import * as X from './ww-lib.mjs'
import { appendFileSync } from 'node:fs'
const w = await X.open({ phone: true })
const { page, P } = w
const man = rec => appendFileSync(X.OUT + '/manifest.jsonl', JSON.stringify(rec) + '\n')
const MAP = {
  'Conflict — two events at once': 'Clash',
  'Personal input clash': 'Clash with a request',
  'No time for the flight brief': 'Misses flight brief',
  'No time for the flight debrief': 'Misses flight debrief',
  'No time for the sim brief': 'Misses sim brief',
  'No time for the sim debrief': 'Misses sim debrief',
  'Tight turning — crew rest': 'Tight crew rest',
  'Long work day': 'Long day',
  'No break day — too many days in a row': 'Days in a row',
  'Qualification — illegal seat': 'Wrong seat',
  'Illegal aircrew combination': 'Crew not authorised',
  'Crew combination — CO approval required': 'CO approval needed',
  'OCU without IP': 'OCU with no IP',
  'IRT without an IR examiner': 'IRT with no IR examiner',
  'On shift — also down for a ground event': 'Overlaps standby',
  'In-time window cut — busy between report and shift start': 'Busy before a standby shift',
}
// Insights opens from a week page's ⋯ menu on a phone (e2e/insights.spec.ts)
await X.go(page, 'viewsched')
await X.press(w, '#viewSchedMore')
await X.press(w, '#viewSchedMoreInsights')
await page.waitForSelector('#insightModal', { state: 'visible' })
await X.sleep(600)
const read = () => page.evaluate(() => {
  const m = document.querySelector('#insightModal')
  const h = [...m.querySelectorAll('.isec-h')].find(e => /Conflicts by type/.test(e.textContent))
  const out = []; let e = h.nextElementSibling
  while (e && e.classList.contains('irow')) { const s = e.querySelectorAll('span'); out.push({ name: s[0].textContent, n: s[1].textContent }); e = e.nextElementSibling }
  return out
})
async function shot(file) {
  const c = await page.evaluate(() => {
    const m = document.querySelector('#insightModal')
    const h = [...m.querySelectorAll('.isec-h')].find(e => /Conflicts by type/.test(e.textContent))
    h.scrollIntoView({ block: 'start' })
    let last = h; while (last.nextElementSibling && last.nextElementSibling.classList.contains('irow')) last = last.nextElementSibling
    const a = h.getBoundingClientRect(), b = last.getBoundingClientRect(), box = (m.querySelector('.isec-h').parentElement).getBoundingClientRect()
    return { x: Math.max(0, box.left), y: Math.max(0, a.top - 10), width: Math.min(innerWidth, box.right) - Math.max(0, box.left), height: b.bottom - a.top + 20, fits: b.bottom <= innerHeight }
  })
  X.say(P, 'E clip', c)
  if (!c.fits) X.say(P, 'E TOO TALL — list runs past the screen')
  delete c.fits
  await page.screenshot({ path: `${X.OUT}/${file}`, clip: c })
}
const t = await read()
X.say(P, 'E TODAY', t)
if (!t.length) throw new Error('no Conflicts by type rows')
await shot(`e-names-today-${P}.png`)
const fam = "E — the checks' short names"
man({ file: `e-names-today-${P}.png`, family: fam, state: 'today', kind: "real: Insights → Conflicts by type, the seeded week", size: '402x874 WebKit @3x', rows: t.map(r => `${r.name} · ${r.n}`) })
const changed = await page.evaluate(MAP => {
  const m = document.querySelector('#insightModal')
  const h = [...m.querySelectorAll('.isec-h')].find(e => /Conflicts by type/.test(e.textContent))
  const done = []; let e = h.nextElementSibling
  while (e && e.classList.contains('irow')) { const s = e.querySelector('span'); const k = s.textContent; if (MAP[k]) { s.textContent = MAP[k]; done.push(k) } e = e.nextElementSibling }
  return done
}, MAP)
X.say(P, 'E changed', changed)
const p = await read()
if (p.length !== t.length || p.some((r, i) => r.n !== t[i].n || r.name !== (MAP[t[i].name] || t[i].name))) throw new Error('E drawn rows wrong')
await shot(`e-names-proposed-${P}.png`)
man({ file: `e-names-proposed-${P}.png`, family: fam, state: 'proposed', kind: 'drawn on the same real list: only the names in the redraw-3 table changed; counts and order untouched', size: '402x874 WebKit @3x', rows: p.map(r => `${r.name} · ${r.n}`),
  notes: 'changed: ' + changed.join(' | ') + '; not in the table, left as they are: ' + t.filter(r => !MAP[r.name]).map(r => r.name).join(' | ') })
await w.browser.close()
