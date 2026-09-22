/* JOB 7 — one OIL switch per FORMATION, never one per aircraft row.
   JOB 8 (D18) — a SECOND man the scheduler puts on a landed request row earns
   from it, with his own switch, without touching the requester's own answer.

   A real switch is `.oilitem`; a PUCK carries the same data-oilitem attribute
   and is `.oilpk` with a data-oilp. The commit says this was mis-measured
   twice, so both are counted separately here. */
import { open, board, openInputs, tap, shot, SHOTS } from './lib.mjs'
const { browser, page, errors } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
const L = []; const S = (k, v) => { L.push({ [k]: v }); return v }
await board(page, 5)
await openInputs(page, 5)
await tap(page, '#sbOil'); await page.waitForTimeout(900)
await shot(page, 'j78-01-mode-on')

/* ---- JOB 7 ------------------------------------------------------------- */
S('JOB 7 — switches', await page.evaluate(() => {
  const sw = [...document.querySelectorAll('#schedBoard .oilitem')].filter(e => e.offsetParent)
  const keys = sw.map(e => e.getAttribute('data-oilitem'))
  const seen = {}; keys.forEach(k => seen[k] = (seen[k] || 0) + 1)
  const dupes = Object.entries(seen).filter(([, n]) => n > 1)
  return {
    switches: sw.length,
    distinctItems: Object.keys(seen).length,
    duplicated: dupes,
    pucksAlsoCarryingTheAttribute: document.querySelectorAll('#schedBoard .oilpk').length,
  }
}))

/* ---- JOB 8: who is on the landed request rows, and do they earn? -------- */
S('JOB 8 — the landed request rows', await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#schedBoard .grnd .sb-arow')].filter(e => e.offsetParent)
  return rows.map(r => ({
    row: (r.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 44),
    pucks: [...r.querySelectorAll('.oilpk')].map(p => ({
      who: p.getAttribute('data-oilp'), on: p.className.includes(' on'),
      says: (p.title || '').replace(/\s+/g, ' ').slice(0, 78),
    })),
    switches: r.querySelectorAll('.oilitem').length,
  })).filter(r => r.pucks.length)
}))
console.log(JSON.stringify(L, null, 1)); console.log('errors:', errors.slice(0, 5))
console.log('shots in ' + SHOTS)
await browser.close()
