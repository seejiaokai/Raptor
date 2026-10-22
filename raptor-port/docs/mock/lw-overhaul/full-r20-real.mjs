// Round 20b (22 Oct 26), his "a typical sqn will add like around 6 more rows on the counters. plus your mockup havent
// placed the events that can be like 3 rows. would it be hard to view if this is the layout?" — round 20's grid order
// (full-r20-order.mjs) tried with a typical squadron's load: six more counter rows (IP, SXO, IWSO, OPS P, OPS W, FL P,
// their figures made up) and three Event rows with up to three events on one day (PH, FAM, SIM, OPS, ACM, EX — made up).
//   r20-real-today-<dev>     round 19's order: Manning rows, months, a JAN band, dates, three Event rows
//   r20-real-new-<dev>       G1–G3: months, dates (the day's first event under the date, "+2" for more), Manning rows
//   r20-real-folded-<dev>    G1–G3 with Manning folded: the red count stays on the button
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r20-real.mjs
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo } from './full-lib.mjs'
import { oneStage, oneFold, mk, UNDER } from './full-r7-one.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const DC = load(cut(SRC('full-r7-decide.mjs'), '// ---------------------------------------------------------------- shared pieces', '// ---------------------------------------------------------------- scenes'),
  { oneStage, oneFold, mk, UNDER, q, newPage, signIn, shot, gridTo, browser, state }, ['stage'])
const N = load(cut(SRC('full-r19-nav.mjs'), 'const IC = {', 'const res = {}'), { newPage, signIn, DC, state, browser }, ['page', 'draw'])

const CSS = `
#page-leavewar th.day .zz-evt{display:block;margin:2px auto 0;width:max-content;padding:0 4px;border-radius:4px;font:700 9px/14px system-ui;letter-spacing:.02em;background:rgba(160,170,182,.16);color:#d6dde4}
#page-leavewar th.day .zz-evt.ph{background:rgba(70,196,108,.18);color:#bff0cf}
#page-leavewar th.day .zz-evt{position:relative}
#page-leavewar th.day .zz-evt i{position:absolute;right:-7px;top:-6px;min-width:12px;height:12px;border-radius:6px;background:#5fd0e6;color:#04222b;font:800 8px/12px system-ui;font-style:normal;text-align:center}
#page-leavewar th.day .zz-evt.none{visibility:hidden}
`
// the load: six counters, three Event rows (dates in Jan 2026, where the grid opens)
const COUNTERS = [['IP', -14], ['SXO', -18], ['IWSO', -22], ['OPS P', -12], ['OPS W', -6], ['FL P', -9]]
const EVENTS = [
  { '2026-01-01': 'PH', '2026-01-06': 'OPS', '2026-01-12': 'EX', '2026-01-13': 'EX' },
  { '2026-01-05': 'FAM', '2026-01-06': 'FAM', '2026-01-07': 'FAM' },
  { '2026-01-06': 'SIM', '2026-01-07': 'ACM' },
]
async function load_(p) {
  return p.evaluate(([CSS, COUNTERS, EVENTS]) => {
    const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s)
    const pg = document.querySelector('#page-leavewar'), t = pg.querySelector('table.mx')
    const counts = t.querySelector(':scope > tbody.counts'), ev = t.querySelector(':scope > tbody.events')
    // six counter rows above the four (D674 lets a counter stand anywhere among them), cloned from Available P
    const src = counts?.querySelector('[data-testid="fly-row-avail-p"]'), first = counts?.rows[0]
    if (counts) for (const [name, off] of COUNTERS) {
      const tr = src.cloneNode(true); tr.removeAttribute('data-testid'); tr.classList.add('zz-ctr')
      const lab = tr.cells[0]; const a = lab.querySelector('a, span, button') || lab
      a.textContent = name
      for (const td of [...tr.cells].slice(1)) { const v = parseFloat(td.textContent); if (!isNaN(v)) td.textContent = String(Math.max(0, Math.round(v + off))) ; td.removeAttribute('data-testid'); td.classList.remove('zz-amb', 'zz-red') }
      tr.style.backgroundImage = 'none'; for (const td of tr.cells) td.style.backgroundImage = 'none'
      counts.insertBefore(tr, first)
    }
    // three Event rows: a third cloned from the second; the made-up events written in
    while (ev.rows.length < 3) { const r = ev.rows[ev.rows.length - 1].cloneNode(true); r.querySelectorAll('[data-testid]').forEach(e => e.removeAttribute('data-testid')); const lab = r.cells[0]; if (lab) lab.textContent = 'EVENT ' + (ev.rows.length + 1); ev.appendChild(r) }
    EVENTS.forEach((row, i) => {
      for (const [iso, txt] of Object.entries(row)) {
        const c = i < 2 ? ev.querySelector(`[data-testid="event-${i}-${iso}"]`) : [...ev.rows[2].cells][[...ev.rows[0].cells].indexOf(ev.querySelector(`[data-testid="event-0-${iso}"]`))]
        if (c) { c.textContent = txt; c.className = 'ev has tap editable'; c.style.minWidth = '2ch' }
      }
    })
    for (const o of pg.querySelectorAll('.mxband')) o.style.display = 'none'
    return 'ok'
  }, [CSS, COUNTERS, EVENTS])
}
async function reorder(p) {
  return p.evaluate(EVENTS => {
    const pg = document.querySelector('#page-leavewar'), t = pg.querySelector('table.mx')
    const tb = c => t.querySelector(':scope > tbody.' + c)
    const counts = tb('counts'), strip = tb('mstripe'), head = tb('mxhead'), ev = tb('events')
    // G3: the day's first event under its date, "+n" for the rest; every heading keeps the tag's line
    for (const th of head.querySelectorAll('th.day[data-testid^="head-"]')) {
      const iso = th.dataset.testid.slice(5), list = EVENTS.map(r => r[iso]).filter(Boolean)
      const e = document.createElement('span'); e.className = 'zz-evt' + (list[0] === 'PH' ? ' ph' : '') + (list.length ? '' : ' none')
      e.innerHTML = list.length ? list[0] + (list.length > 1 ? `<i>${list.length}</i>` : '') : '·'; th.appendChild(e)
    }
    ev.style.display = 'none'
    const band = head.querySelector('tr.mbrak'); if (band) band.style.display = 'none'
    const first = t.querySelector(':scope > tbody'); t.insertBefore(strip, first); t.insertBefore(head, strip.nextSibling); if (counts) t.insertBefore(counts, head.nextSibling)
    for (const o of pg.querySelectorAll('.lw-bidbox')) o.style.display = 'none'
    return 'ok'
  }, EVENTS)
}
const firstPerson = p => p.evaluate(() => {
  const rows = [...document.querySelectorAll('#page-leavewar [data-testid^="row-"]')].map(e => e.getBoundingClientRect()).filter(r => r.height)
  return { first: Math.round(rows[0]?.top ?? -1), onScreen: rows.filter(r => r.top >= 0 && r.bottom <= innerHeight).length }
})
const out = {}
for (const [w, h, touch, dev] of [[390, 844, true, 'phone'], [1536, 860, false, 'desk']]) {
  for (const v of ['today', 'new', 'folded']) {
    const { ctx, p } = await N.page(w, h, touch, 'admin')
    await N.draw(p, touch, false)
    { const fb = p.locator('[data-testid="figures-toggle"]'); if (await fb.count() && /(^| )on( |$)/.test(await fb.getAttribute('class') || '')) { await fb.click({ force: true }); await p.waitForTimeout(500) } }
    if (v === 'folded') { const m = p.locator('[data-testid="counts-toggle"]'); if ((await m.getAttribute('aria-expanded')) !== 'false') { await m.click({ force: true }); await p.waitForTimeout(500) } }
    await load_(p)
    if (v !== 'today') await reorder(p)
    await p.waitForTimeout(300)
    const r = await firstPerson(p); out[`${v}-${dev}`] = r
    console.log(v, dev, JSON.stringify(r))
    await p.mouse.move(2, 2)
    await shot(p, `r20-real-${v}-${dev}`, touch ? {} : { clip: { x: 0, y: 0, width: w, height: 760 } })
    await ctx.close()
  }
}
console.log(JSON.stringify(out))
await browser.close(); console.log('errors:', errs)
