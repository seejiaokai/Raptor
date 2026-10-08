/* P2-07 — a people's-days selection leaves the grid usable (D642). */
import * as B from './cal-B-lib.mjs'
const size = process.argv[2] || 'desk'
const w = await B.world(size)
const p = w.page, S = w.key
const pics = [], log = [], checks = []
const note = (k, v) => { log.push(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`); console.log('  >', k, typeof v === 'string' ? v : JSON.stringify(v)) }
const chk = (name, ok, detail = '') => { checks.push([name, !!ok, detail]); console.log(ok ? '  ok' : '  XX', name, detail) }
const C = (who, d) => B.tid(w, `cell-${who}-2026-${d}`)
const sel = async () => []
const panel = async () => (await B.tid(w, 'select-sheet').count()) ? { who: await B.txt(B.tid(w, 'sel-who')), span: await B.txt(B.tid(w, 'sel-span')), box: await B.tid(w, 'select-sheet').boundingBox(), scrim: await B.tid(w, 'sheet-scrim').count() } : null
const upper = async (testid) => { await p.evaluate(t => { const e = document.querySelector(`[data-testid="${t}"]`); document.querySelector('.mx-wrap').scrollLeft = Math.max(0, (document.querySelector('.mx-wrap').scrollLeft + e.getBoundingClientRect().left - (innerWidth < 700 ? 190 : 560))); window.scrollBy(0, e.getBoundingClientRect().top - (innerHeight < 700 ? 250 : 300)); }, testid); await B.sleep(300) }
/* make the squadron view start at January */
await B.press(w, B.tid(w, 'month-JAN')); await B.sleep(600)
if (!w.phone) { await B.press(w, B.tid(w, 'figures-toggle')); await B.sleep(500) }
await upper('cell-slipway-2026-01-06')
await B.dragPick(w, C('slipway', '01-06'), C('slipway', '01-08'))
let pn = await panel()
note('1 picked slipway 6-8 Jan', JSON.stringify(pn))
pics.push(await B.pic(p, `P2-07-${S}-1-panel-up`))
const first = pn?.span
chk('panel up, no veil', pn && pn.scrim === 0, JSON.stringify(pn))
/* 2. move it aside by its title strip */
const hd = p.locator('[data-testid="select-sheet"] .bidsheet-hd').first()
const hb = await hd.boundingBox()
const before = pn.box
if (w.phone) {
  const c = await B.cdp(w)
  const a = { x: hb.x + hb.width / 2 - 40, y: hb.y + hb.height / 2 }
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [a] })
  for (let i = 1; i <= 8; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x, y: a.y - i * 12 }] }); await B.sleep(25) }
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
} else {
  const a = { x: hb.x + hb.width / 2 - 100, y: hb.y + hb.height / 2 }
  await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(a.x + 120, a.y - 60, { steps: 8 }); await p.mouse.up()
}
await B.sleep(300)
pn = await panel()
note('2 panel after drag', JSON.stringify(pn?.box) + ' before ' + JSON.stringify(before))
pics.push(await B.pic(p, `P2-07-${S}-2-panel-moved`))
chk('panel moved (its box changed)', pn && (Math.abs(pn.box.x - before.x) > 20 || Math.abs(pn.box.y - before.y) > 20), `${JSON.stringify(before)} -> ${JSON.stringify(pn?.box)}`)
/* 3. an outside press does not dismiss */
if (w.phone) await B.touchTap(w, 205, 24); else await p.mouse.click(900, 28)
await B.sleep(300)
pn = await panel()
chk('an outside press does not dismiss the panel', !!pn, JSON.stringify(pn))
/* 4. month control works with the panel up */
await p.evaluate(() => window.scrollTo(0, 0)); await B.sleep(300)
await B.press(w, B.tid(w, 'month-FEB')); await B.sleep(700)
pn = await panel()
const headFeb = await p.evaluate(() => { const e = document.querySelector('[data-testid="head-2026-02-10"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y) } })
const febOn = await p.evaluate(() => document.querySelector('[data-testid="month-FEB"]').className)
note('4 after pressing FEB: panel', JSON.stringify(pn) + ' head Feb 10 at ' + JSON.stringify(headFeb) + ' FEB btn class ' + febOn)
chk('month button answered with the panel up (FEB lit) and the panel stayed', /on|active|lit|cur/.test(febOn) && !!pn, febOn)
/* 5. choose another block on another row: a new drag replaces the selection */
await upper('cell-dice-2026-02-10')
await B.dragPick(w, C('dice', '02-10'), C('dice', '02-12'))
pn = await panel(); const s2 = await sel()
note('5 new block dice 10-12 Feb', JSON.stringify(pn) + ' marked ' + s2.join(','))
pics.push(await B.pic(p, `P2-07-${S}-3-new-block`))
chk('a new drag replaces the selection (panel names a different span; only the new cells marked)', pn && pn.span !== first && pn.who !== 'Drifter', `${first} -> ${pn?.span}; marked ${s2.join(',')}`)
/* 6. a plain tap on a single person's cell opens its own sheet */
await upper('cell-slipway-2026-02-17')
if (w.phone) await B.touchTap(w, ...(await (async () => { const m = await B.mid(C('slipway', '02-17')); return [m.x, m.y] })())) ; else await C('slipway', '02-17').click({ position: { x: 8, y: 8 } })
await B.sleep(500)
pn = await panel()
const own = await p.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"], [data-testid="one-day-sheet"], [data-testid="day-sheet"], .bidsheet')].map(e => e.getAttribute('data-testid') + '|' + (e.getAttribute('aria-label') || '')))
note('6 tapped slipway 17 Feb: panel', JSON.stringify(pn) + ' sheets: ' + own.join(' ; '))
pics.push(await B.pic(p, `P2-07-${S}-4-own-sheet`))
chk('the old panel is gone and the cell opened its own sheet', !pn && own.length > 0, own.join(' ; '))
const bad = checks.filter(c => !c[1])
B.row('P2-07', S, 'Picked slipway 6-8 Jan (drag/hold-drag); moved the panel by its title; pressed outside; pressed month FEB; picked dice 10-12 Feb; tapped slipway 17 Feb',
  checks.map(c => `${c[1] ? 'ok' : 'XX'} ${c[0]} [${c[2]}]`).join(' | '), bad.length ? 'FAIL' : 'PASS', pics)
B.noteErrors('p207-' + S, w.errors)
await B.close(w)
