// lw-q7-sideways — his D1313 (24 Oct 26, "Q7 can u instead show the data horizontally? So u save vertical space. And
// should it only show when it hits amber?"): the bid window's day line with its Manning rows side by side, in the round 3
// window (lw-declutter-mock.mjs), at his iPhone's size. Four pictures, each cut to the title and the day line (D1222):
//   B  every row his leave lowers — a calm day; and a day where one of them turns amber;
//   A  only rows that turn amber or red — the same amber day; and the calm day.
// The figures are the real grid's: the day's Manning cells read, a pending LL placed through the window, read again,
// taken back with Undo. For the amber day OPSP's amber is set to 12 (amber below 12) through the counter writer the "+ Counter" form uses
// (an example squadron setting — the demo's own amber is 4), so 12 → 11 turns it amber on the real grid.
// Usage: PORT=4174 node scripts/handpass/lw-q7-sideways.mjs
import * as L from './lw-declutter-lib.mjs'
import { transform, reorder } from './lw-declutter-mock.mjs'
import path from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
console.log('lw-q7-sideways v1')
const OUT = path.resolve('docs/img/handpass/2026-10-24-lw-declutter')
mkdirSync(OUT, { recursive: true })
const DAY = '2026-11-02'
const out = {}

const w = await L.newCtx('phone')
const P = w.page
await L.signInPlain(w, 'admin')
const who = await P.evaluate(() => Object.entries(window.PEOPLE || {}).find(([, v]) => v.cs === 'Drifter')?.[0])
if (!(await P.evaluate(() => document.querySelector('[data-testid="counts-toggle"]')?.getAttribute('aria-expanded') === 'true'))) {
  await P.evaluate(() => window.scrollTo(0, 0)); await L.press(w, L.T('counts-toggle')); await P.waitForTimeout(500)
}
const readCounts = d => P.evaluate(d => Object.fromEntries([...document.querySelectorAll(`td[data-testid^="count-"][data-testid$="-${d}"]`)]
  .map(td => { const id = td.dataset.testid.slice(6, -(d.length + 1)); const row = td.closest('tr'); return [id, { have: td.textContent.trim(), cls: td.className, label: (row.querySelector('.lab, th, td')?.textContent || id).replace(/[ⓘ⋮⠿✕]/g, '').replace(/\s+/g, ' ').trim() }] })), d)
/* the rows his leave moves on DAY, and where each ends — measured, then undone */
async function measure() {
  await L.reachCell(w, who, DAY)
  const before = await readCounts(DAY)
  await L.openCellR(w, who, DAY)
  await L.press(w, L.T('bid-approve-tick')); await P.waitForTimeout(150)
  await L.press(w, L.T('bid-LL')); await P.waitForTimeout(500); await L.closeAny(w)
  const after = await readCounts(DAY)
  await L.undo(w)
  const back = await readCounts(DAY)
  if (JSON.stringify(back) !== JSON.stringify(before)) throw new Error('Undo did not put the day back')
  return Object.keys(before).filter(id => before[id].have !== after[id]?.have).map(id => ({
    label: before[id].label, b: before[id].have, a: after[id].have,
    level: /\bred\b/.test(after[id].cls) ? 'red' : /\bamber\b/.test(after[id].cls) ? 'amber' : '',
  }))
}
/* the day line redrawn side by side: the Available pair first (the window's own), then the given rows, a dot between
   pairs, each pair kept whole (D1313); `calm` adds the calm words as the last item where no row is named */
const sideways = (rows, calm) => P.evaluate(({ rows, calm }) => {
  const line = document.querySelector('.bidsheet .bidsheet-dayline')
  const av = line.querySelector('[data-testid="bid-dayline-avail"]')
  const pair = (name, fig, level) => `<span class="mq-pair${level ? ' dl-' + level : ''}"><span class="dl-name">${name}</span> <span class="dl-fig">${fig}</span></span>`
  const items = [pair(av.querySelector('.dl-name').textContent, av.querySelector('.dl-fig').textContent, '')]
  for (const r of rows) items.push(pair(r.label, `${r.b} → ${r.a}` + (r.level ? ` · ${r.level}` : ''), r.level))
  if (calm && !rows.length) items.push(`<span class="mq-pair mq-calm">no manning row turns amber or red</span>`)
  line.innerHTML = items.join('<span class="mq-dot" aria-hidden="true">·</span>')
  let st = document.getElementById('mock-q7'); if (!st) { st = document.createElement('style'); st.id = 'mock-q7'; document.head.appendChild(st) }
  st.textContent = `.bidsheet .bidsheet-dayline { display: flex !important; flex-wrap: wrap; align-items: baseline; column-gap: 7px; row-gap: 2px; }
    .bidsheet .bidsheet-dayline .mq-pair { white-space: nowrap; }
    .bidsheet .bidsheet-dayline .mq-pair .dl-name { color: var(--ink-2); }
    .bidsheet .bidsheet-dayline .mq-pair .dl-fig { color: var(--ink); }
    .bidsheet .bidsheet-dayline .mq-pair.dl-amber .dl-name, .bidsheet .bidsheet-dayline .mq-pair.dl-amber .dl-fig { color: var(--adv); }
    .bidsheet .bidsheet-dayline .mq-pair.dl-red .dl-name, .bidsheet .bidsheet-dayline .mq-pair.dl-red .dl-fig { color: var(--hard); }
    .bidsheet .bidsheet-dayline .mq-dot, .bidsheet .bidsheet-dayline .mq-calm { color: var(--ink-3); }`
  return Math.round(line.getBoundingClientRect().height)
}, { rows, calm })
/* the picture, cut to the title, the day line and the first row under it (D1222) */
async function shot(name) {
  const clip = await P.evaluate(() => {
    const s = document.querySelector('.bidsheet').getBoundingClientRect()
    const next = document.querySelector('.bidsheet .bidsheet-dayline').nextElementSibling.getBoundingClientRect()
    return { x: s.left - 4, y: Math.max(0, s.top - 4), width: s.width + 8, height: next.bottom - s.top + 14 }
  })
  await P.screenshot({ path: path.join(OUT, name + '.png'), clip, scale: 'device' })
}
async function draw(rows, calm, name) {
  await L.openCellR(w, who, DAY)
  await transform(P, { p: 'bid', admin: true }); await reorder(P, 'bid')
  const h = await sideways(rows, calm)
  /* his iPhone's wider letters: does it still fit the lines it took? */
  const wide = await P.evaluate(() => { const l = document.querySelector('.bidsheet .bidsheet-dayline'); l.style.letterSpacing = '0.9px'; const h = Math.round(l.getBoundingClientRect().height); l.style.letterSpacing = ''; return h })
  out[name] = { rows, lineHeight: h, widerLetters: wide }
  console.log(name, JSON.stringify(rows), 'day line h', h, 'wider', wide)
  await shot(name)
  await L.closeAny(w)
}

/* the calm day as the demo has it */
const calmRows = await measure()
await draw(calmRows, false, 'q7s-b-calm')
await draw([], true, 'q7s-a-calm')
/* the amber day: OPSP's amber at 12 (an example setting), through the "+ Counter" writer */
const set = await P.evaluate(() => window.lwSaveManningRule({ id: 'opsp', label: 'OPSP', count: { kind: 'people', filter: { seats: ['pilot'], notCats: ['FI', 'IR', 'IP', 'IW'] } }, threshold: { amber: 12, red: 9 }, desc: 'Ops pilots (CAT A–D, OCU included) available.' }))
if (!set) throw new Error('OPSP amber could not be set')
await P.waitForTimeout(400)
const amberRows = await measure()
if (!amberRows.some(r => r.level === 'amber')) throw new Error('no row turned amber: ' + JSON.stringify(amberRows))
await draw(amberRows, false, 'q7s-b-amber')
await draw(amberRows.filter(r => r.level), false, 'q7s-a-amber')
console.log('errors', JSON.stringify(w.errs))
writeFileSync(path.join(OUT, 'q7s-geometry.json'), JSON.stringify(out, null, 1))
await L.closeBrowser()
