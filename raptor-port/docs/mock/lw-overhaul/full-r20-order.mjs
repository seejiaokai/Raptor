// Round 20 (22 Oct 26), his "do u also think that this is the best design for the leave war? like how things are
// arranged. is there a better way to do this" — the design skill's layout look (Impeccable layout) at the grid card,
// measured (full-r20-measure.mjs, full-r20-frozen.mjs). Its findings, drawn into the real build on round 19's top:
//   1  the Manning figures sit ABOVE the month buttons and their dates BELOW them: two rows part each figure from its
//      date. Proposed: month buttons first, then the dates, then the Manning rows right under the dates.
//   2  the month is said three times (the lit month button, the band "JAN", the first date "JAN THU 01"): the band
//      row goes (its Balances fold goes with N5); the first of each month still carries its name.
//   3  two Event rows stand on every screen, nearly empty: an event's short form (PH, EX, SP) moves into its date's
//      heading, under the date, and the two rows go.
//   r20-order-admin-phone / -member-phone / -admin-desk   the proposal, numbered
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r20-order.mjs
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

const firstPerson = p => p.evaluate(() => {
  const rows = [...document.querySelectorAll('#page-leavewar [data-testid^="row-"]')].map(e => e.getBoundingClientRect()).filter(r => r.height)
  return { first: Math.round(rows[0]?.top ?? -1), onScreen: rows.filter(r => r.top >= 0 && r.bottom <= innerHeight).length }
})
const CSS = `
#page-leavewar th.day .zz-evt{display:block;margin:2px auto 0;width:max-content;padding:0 4px;border-radius:4px;font:700 9px/14px system-ui;letter-spacing:.02em;background:rgba(160,170,182,.16);color:#d6dde4}
#page-leavewar th.day .zz-evt.ph{background:rgba(70,196,108,.18);color:#bff0cf}
`
for (const [w, h, touch, who, name] of [[390, 844, true, 'admin', 'admin-phone'], [390, 844, true, 'member', 'member-phone'], [1536, 860, false, 'admin', 'admin-desk']]) {
  const { ctx, p } = await N.page(w, h, touch, who)
  await N.draw(p, touch, who === 'member')
  await p.waitForTimeout(300)
  // the Balances fold shut first (N5 proposes it goes): open, its columns are an overlay placed for the old order
  {
    const fb = p.locator('[data-testid="figures-toggle"]')
    const open = async () => (await fb.count()) ? / on|^on/.test(await fb.getAttribute('class') || '') || (await fb.getAttribute('aria-expanded')) === 'true' : false
    const was = await open(); if (was) { await fb.click({ force: true }); await p.waitForTimeout(600) }
    console.log(name, 'Balances fold open before', was, '→ after', await open())
  }
  const before = await firstPerson(p)
  const r = await p.evaluate(css => {
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s)
    const pg = document.querySelector('#page-leavewar'), t = pg.querySelector('table.mx')
    const tb = c => t.querySelector(':scope > tbody.' + c)
    const counts = tb('counts'), strip = tb('mstripe'), head = tb('mxhead'), ev = tb('events')
    if (!strip || !head || !ev) return 'missing ' + [!!counts, !!strip, !!head, !!ev]
    // 3: each event's short form into its date's heading, then the Event rows go
    for (const c of ev.querySelectorAll('td[data-testid^="event-"]')) {
      const txt = c.textContent.trim(); if (!txt || /^[+＋]$/.test(txt)) continue // an empty Event cell shows the full-width ＋
      const iso = c.dataset.testid.slice(-10), th = head.querySelector(`[data-testid="head-${iso}"]`); if (!th || th.querySelector('.zz-evt')) continue
      const e = document.createElement('span'); e.className = 'zz-evt' + (txt === 'PH' ? ' ph' : ''); e.textContent = txt; th.appendChild(e)
    }
    ev.style.display = 'none'
    // 2: the band row (the Balances fold and "JAN") goes — N5 takes the fold; the first date keeps its month
    const band = head.querySelector('tr.mbrak'); if (band) band.style.display = 'none'
    // 1: month buttons, then the dates, then the Manning rows
    const first = t.querySelector(':scope > tbody'); t.insertBefore(strip, first); t.insertBefore(head, strip.nextSibling)
    if (counts) t.insertBefore(counts, head.nextSibling)
    // the app's overlays (the frozen band and the open-dates outline) are measured for the old order; redrawn here they would sit wrong, so the picture leaves them out
    for (const o of pg.querySelectorAll('.mxband, .lw-bidbox')) o.style.display = 'none'
    return 'ok'
  }, CSS)
  await p.waitForTimeout(400)
  const after = await firstPerson(p)
  console.log(name, r, 'first row', before.first, '→', after.first, '· rows on screen', before.onScreen, '→', after.onScreen)
  await mk(p, '.mstripe .months', '1', { prefer: ['sw', 'w'] })
  await mk(p, touch ? '[data-testid="head-2026-01-06"]' : '[data-testid="head-2026-01-19"]', '2', { prefer: ['in'] })
  if (who !== 'member') await mk(p, '[data-testid="fly-row-req-p"] td', '3', { prefer: ['e', 'ne'] })
  await mk(p, '.zz-evt', '4', { prefer: ['se', 's'] })
  await p.mouse.move(2, 2)
  await shot(p, 'r20-order-' + name, touch ? {} : { clip: { x: 0, y: 0, width: w, height: 560 } })
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
