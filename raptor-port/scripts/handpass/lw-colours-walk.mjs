// [INPUT-COLOURS]'s check (24 Oct 26): each kind's colour as PAINTED — the computed background of every place that draws a
// kind — against his rulings' numbers (D1316 set C, D1323 the OIL taken, D1321 duties outlined): the Legend, the grid's
// boxes, the bid window's buttons, the Inputs month's bars; his iPhone's 402 × 874 and 1440 × 900. A PASS means correct.
// Usage: LW_PORT=4343 LW_OUT=2026-10-24-lw-colours-check node lw-colours-walk.mjs
import * as L from './lw-r3-lib.mjs'
import path from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
console.log('lw-colours-walk v1', L.OUT, 'port', L.PORT)
mkdirSync(L.OUT, { recursive: true })
const K = { ll: [242, 200, 110, .22], ol: [226, 146, 38, .48], oil: [70, 196, 108, .38], oilt: [170, 230, 40, .30], care: [138, 150, 255, .32], cse: [160, 100, 240, .36], od: [128, 142, 160, .58], med: [238, 82, 82, .30] }
const rgba = ([r, g, b], a) => `rgba(${r}, ${g}, ${b}, ${a})`
const bgOf = (P, sel) => P.evaluate(sel => { const e = document.querySelector(sel); return e ? getComputedStyle(e).backgroundColor : null }, sel)
const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const md = iso => `${MON3[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}`
for (const size of ['phone', 'desk']) {
  const w = await L.newCtx(size); const P = w.page; w.tag = size
  await L.signInPlain(w, 'admin')
  const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
  const who = ids.Drifter
  /* C1 — the Legend: each swatch the grid's own box, its kind's colour */
  await P.evaluate(() => window.scrollTo(0, 0)); await L.press(w, L.T('legend-open')); await P.waitForTimeout(400)
  const leg = await P.evaluate(() => [...document.querySelectorAll('[data-testid="legend"] .leg-row')].slice(0, 9).map(r => { const c = r.querySelector('.leg-box .c'); return c ? { cls: c.className, bg: getComputedStyle(c).backgroundColor, t: r.innerText.replace(/\s+/g, ' ').trim() } : null }).filter(Boolean))
  await L.shot(w, `c1-legend-${size}`)
  const want = { 'k-ll': K.ll, 'k-ol': K.ol, 'k-oilt': K.oilt, 'k-oil': K.oil, 'k-care': K.care, 'k-cse': K.cse, 'k-od': K.od, 'k-med': K.med }
  const bad = leg.filter(x => { const k = Object.keys(want).find(k => x.cls.split(' ').includes(k)); return k && /s-a/.test(x.cls) && x.bg !== rgba(want[k], want[k][3]) })
  const oilRows = leg.filter(x => /OIL taken|OIL given/.test(x.t)).map(x => x.t)
  L.rec('C1 the Legend: every kind its colour; "OIL taken" and "OIL given" apart', size, !bad.length && oilRows.length === 2 ? 'PASS' : 'FAIL', `${leg.map(x => `${x.cls.split(' ')[1]}=${x.bg}`).join('; ')} | OIL rows: ${oilRows.join(' / ')}${bad.length ? ' | WRONG: ' + JSON.stringify(bad) : ''}`, [`c1-legend-${size}`])
  await L.closeAny(w); await P.keyboard.press('Escape').catch(() => {})
  /* C2 — the grid: an OIL taken (a leave placed, the switch on), an FO given (Grant OIL), a course, an overseas duty, a medical
     filed on the Inputs page (its own write door) */
  const d = { oilt: '2026-11-02', fo: '2026-11-03', cse: '2026-11-04', od: '2026-11-05', med: '2026-11-06' }
  await L.openCellR(w, who, d.oilt); await L.placeLeave(w, 'OIL'); await L.closeAny(w)
  await L.openCellR(w, who, d.fo); await L.press(w, L.T('bid-more')); await L.press(w, L.T('bid-oil'))
  await P.locator(L.T('oil-why')).fill('Walk'); await P.locator(L.T('oil-given-by')).fill('OC'); if (await L.vis(P, L.T('oil-days'))) await P.locator(L.T('oil-days')).fill('1')
  await L.press(w, L.T('oil-give')); await P.waitForTimeout(400); await L.closeAny(w)
  for (const [k, t] of [['cse', 'CSE'], ['od', 'OD'], ['med', 'ATT C']]) await P.evaluate(([who, date, type]) => window.fileInput({ person: who, date, yr: 2026, type, allday: true, remarks: '' }), [who, md(d[k]), t])
  await P.waitForTimeout(800)
  const cells = {}
  for (const [k, iso] of Object.entries(d)) { await L.reachCell(w, who, iso); cells[k] = await P.evaluate(([who, iso]) => { const c = document.querySelector(`[data-testid="cell-${who}-${iso}"] .c`); return c ? { cls: c.className, bg: getComputedStyle(c).backgroundColor, t: c.textContent } : null }, [who, iso]) }
  await L.cellShot(w, who, d.cse, `c2-grid-${size}`)
  const exp = { oilt: K.oilt, fo: K.oil, cse: K.cse, od: K.od, med: K.med }
  const wrong = Object.entries(cells).filter(([k, c]) => !c || c.bg !== rgba(exp[k], exp[k][3]))
  L.rec('C2 the grid: an OIL taken chartreuse, an FO green, a course purple, an overseas duty slate, a medical red — each filled', size, !wrong.length ? 'PASS' : 'FAIL', Object.entries(cells).map(([k, c]) => `${k}:${c?.t} ${c?.bg}`).join('; '), [`c2-grid-${size}`])
  /* C3 — the bid window's buttons wear the boxes' colours (D1183): OIL the OIL taken's */
  await L.openCellR(w, who, '2026-11-09')
  const btn = await P.evaluate(() => Object.fromEntries(['LL', 'OL', 'OIL', 'CCL'].map(t => { const b = document.querySelector(`[data-testid="bid-${t}"]`); return [t, b ? getComputedStyle(b).backgroundColor : null] })))
  await L.shot(w, `c3-buttons-${size}`)
  L.rec('C3 the bid window\'s buttons: OIL in the OIL taken\'s colour, the others their kinds', size, btn.OIL === rgba(K.oilt, K.oilt[3]) && btn.LL === rgba(K.ll, K.ll[3]) && btn.CCL === rgba(K.care, K.care[3]) ? 'PASS' : 'FAIL', JSON.stringify(btn), [`c3-buttons-${size}`])
  await L.closeAny(w)
  /* C4 — the Inputs month: each absence a filled bar in its kind's colour, a duty outlined, an upchit medical (as drawn), a timed bar a tint */
  const bars = [['LL', '2026-11-16'], ['OIL', '2026-11-17'], ['CSE', '2026-11-18'], ['OD', '2026-11-19'], ['ATT B', '2026-11-20'], ['Upchit', '2026-11-23'], ['Duty', '2026-11-24'], ['Training', '2026-11-25']]
  for (const [t, iso] of bars) await P.evaluate(([who, date, type, timed]) => window.fileInput({ person: who, date, yr: 2026, type, allday: !timed, ...(timed ? { s: 540, e: 600 } : {}), remarks: '' }), [who, md(iso), t, t === 'Training'])
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1200)
  /* the month's own arrow (#icNext) until November's bars stand — read from the screen, never a fixed number of steps */
  if (!(await L.vis(P, '#icNext'))) { const cal = P.getByText('Calendar', { exact: true }).first(); if (await cal.count()) { await cal.click(); await P.waitForTimeout(700) } }
  for (let i = 0; i < 4; i++) { const has = await P.evaluate(() => [...document.querySelectorAll('.ib-bar')].some(b => /OIL|CSE|Upchit/.test(b.getAttribute('title') || ''))); if (has) break; await L.press(w, '#icNext'); await P.waitForTimeout(700) }
  console.log(size, 'Inputs month reached:', await L.txt(P, '#icNext ~ *, .ib-title, .ic-title'))
  const got = await P.evaluate(() => [...document.querySelectorAll('.ib-bar')].map(b => ({ t: (b.getAttribute('title') || '').split(' · ')[1] || b.textContent, cls: b.className, bg: getComputedStyle(b).backgroundColor, sh: getComputedStyle(b).boxShadow })).filter(x => /LL|OIL|CSE|OD|ATT B|Upchit|Duty|Training/.test(x.t)))
  await L.shot(w, `c4-inputs-${size}`)
  const find = t => got.find(x => (x.t || '').trim().startsWith(t))
  const checks = [['LL', rgba(K.ll, .4)], ['OIL', rgba(K.oilt, .4)], ['CSE', rgba(K.cse, .4)], ['OD', rgba(K.od, .58)], ['ATT B', rgba(K.med, .4)], ['Upchit', rgba(K.med, .4)], ['Duty', 'rgba(232, 237, 242, 0.05)']]
  const off = checks.filter(([t, c]) => find(t)?.bg !== c).map(([t, c]) => `${t}: ${find(t)?.bg ?? 'no bar'} (want ${c})`)
  const tr = find('Training')
  L.rec('C4 the Inputs month: absences filled in their kind\'s colour, the upchit medical, a duty outlined, a timed one a tint', size, !off.length && tr && /timed/.test(tr.cls) && /duty/.test(tr.cls) ? 'PASS' : 'FAIL', `${off.join('; ') || 'all as drawn'}; Training: ${tr?.cls} ${tr?.bg}`, [`c4-inputs-${size}`])
  if (w.errs.length) L.rec('errors seen', size, 'FAIL', w.errs.slice(0, 6).join(' || '), []); else L.rec('errors seen (console, page, 4xx)', size, 'PASS', 'none', [])
  await w.ctx.close()
}
await L.closeBrowser()
writeFileSync(path.join(L.OUT, 'results.json'), JSON.stringify(L.results, null, 1))
const n = v => L.results.filter(r => r.verdict === v).length
console.log(`DONE  PASS ${n('PASS')}  FAIL ${n('FAIL')}  NOT WALKED ${n('NOT WALKED')}`)
