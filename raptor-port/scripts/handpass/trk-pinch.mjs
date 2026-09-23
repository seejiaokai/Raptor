/* The Tracker pinch walk — owner, 23 Sep 26: "The tracker zoom in and out does
   not follow where my fingers open or close, it's like off to the top left".

   Two real fingers through Chromium's own touch input (CDP Input.dispatchTouchEvent
   — the same pointer events a phone sends), on the production bundle. For each
   case it pinches with the fingers' midpoint on a ball and measures where that
   ball ends up against where the fingers are at the end. A pinch that follows
   the fingers keeps the ball under them; the drift is the finding.

     HP_URL    the preview (http://localhost:4190 for this fix)
     PINCH_TAG a name for this run's pictures/results: 'before' or 'after'

   Pictures carry a red cross where the fingers' midpoint is (an annotation for
   the picture only — pointer-events none, added after the gesture). */
import { pathToFileURL } from 'node:url'
import { open, shot, save, PHONE } from './trk-lib.mjs'

const TAG = process.env.PINCH_TAG || 'run'
const rows = []
const note = (name, r) => { rows.push({ name, ...r }); console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${name}  ${r.detail || ''}`) }
const TOL = 6   /* px: a finger is ~40px wide, so 6 is well inside "under the fingers" */

export async function touchCdp(page) { return page.context().newCDPSession(page) }

/* Two fingers set horizontally about (cx,cy), spread from d0 to d1 apart, the
   midpoint sliding by (dx,dy) over the gesture. */
export async function pinch(page, cdp, { cx, cy, d0, d1, dx = 0, dy = 0, steps = 14 }) {
  const pts = (d, mx, my) => [{ x: mx - d / 2, y: my, id: 1 }, { x: mx + d / 2, y: my, id: 2 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(d0, cx, cy) })
  await page.waitForTimeout(30)
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(d0 + (d1 - d0) * t, cx + dx * t, cy + dy * t) })
    await page.waitForTimeout(16)
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(300)
  return { x: cx + dx, y: cy + dy }
}
/* One finger dragging the board (the ordinary scroll). */
export async function drag(page, cdp, { x, y, dx, dy, steps = 10 }) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 3 }] })
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / steps, y: y + dy * i / steps, id: 3 }] })
    await page.waitForTimeout(16)
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(300)
}

/* The ball nearest the middle of the visible board, and its centre on screen
   (the board clipped to the screen; a margin so both fingers land on it). */
export const pickBall = page => page.evaluate(() => {
  const b0 = document.getElementById('board').getBoundingClientRect()
  const bd = { left: b0.left, right: Math.min(b0.right, innerWidth), top: b0.top, bottom: Math.min(b0.bottom, innerHeight) }
  const mY = Math.min(60, (bd.bottom - bd.top) * 0.3)
  const mx = (bd.left + bd.right) / 2, my = bd.top + (bd.bottom - bd.top) * 0.45
  let best = null
  for (const mX of [100, 40]) { if (best) break
  for (const g of document.querySelectorAll('#flowSvg .ball')) {
    const r = g.getBoundingClientRect(); if (!r.width) continue
    const x = r.left + r.width / 2, y = r.top + r.height / 2
    if (x < bd.left + mX || x > bd.right - mX || y < bd.top + mY || y > bd.bottom - mY) continue
    const d = Math.hypot(x - mx, y - my)
    if (!best || d < best.d) best = { id: g.dataset.id, x, y, d }
  } }
  return best
})
export const ballAt = (page, id) => page.evaluate(id => {
  const g = document.querySelector(`#flowSvg .ball[data-id="${CSS.escape(id)}"]`); if (!g) return null
  const r = g.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}, id)
export const hitAt = (page, p) => page.evaluate(p => { const e = document.elementFromPoint(p.x, p.y); const g = e && e.closest && e.closest('.ball'); return g ? g.dataset.id : null }, p)
export const zoomNow = page => page.evaluate(() => {
  const w = document.querySelector('#board .flowwrap'); const t = document.querySelector('#viewport')
  return { flow: +(getComputedStyle(w).zoom || 1), view: t ? t.getAttribute('transform') : '' }
})
export const mark = (page, p) => page.evaluate(p => {
  let m = document.getElementById('__pinchmark')
  if (!m) { m = document.createElement('div'); m.id = '__pinchmark'; document.body.appendChild(m) }
  m.style.cssText = `position:fixed;left:${p.x - 14}px;top:${p.y - 14}px;width:28px;height:28px;pointer-events:none;z-index:99999;` +
    'background:linear-gradient(#e11 0 0) center/28px 3px no-repeat,linear-gradient(#e11 0 0) center/3px 28px no-repeat;border:2px solid #e11;border-radius:50%'
}, p)
export const unmark = page => page.evaluate(() => { const m = document.getElementById('__pinchmark'); if (m) m.remove() })

/* One pinch case: pick the ball, pinch on it, measure. */
async function pinchCase(page, cdp, name, { d0, d1, dx = 0, dy = 0, picture = null }) {
  const b = await pickBall(page)
  if (!b) { note(name, { pass: false, detail: 'no ball in view to pinch on' }); return }
  const z0 = await zoomNow(page)
  if (picture) { await mark(page, b); await shot(page, `${TAG}-${picture}-1-before`); await unmark(page) }
  const end = await pinch(page, cdp, { cx: b.x, cy: b.y, d0, d1, dx, dy })
  const a = await ballAt(page, b.id), z1 = await zoomNow(page)
  const drift = Math.round(Math.hypot(a.x - end.x, a.y - end.y))
  const hit = await hitAt(page, end)
  if (picture) { await mark(page, end); await shot(page, `${TAG}-${picture}-2-after`); await unmark(page) }
  note(name, {
    pass: drift <= TOL && Math.abs(z1.flow - z0.flow) + (z1.view !== z0.view ? 1 : 0) > 0,
    detail: `ball ${b.id}: fingers end at (${Math.round(end.x)},${Math.round(end.y)}), ball at (${Math.round(a.x)},${Math.round(a.y)}) — ${drift}px off; under the fingers now: ${hit}; zoom ${z0.flow}→${z1.flow} ${z0.view !== z1.view ? '(edit-layout view moved)' : ''}`,
    drift, ball: b.id, hit, zoom: [z0.flow, z1.flow],
  })
}

/* Edit chart layout: the chart point under the fingers, read off the canvas's
   own screen matrix, must still be under them at the end. On EMPTY canvas —
   a finger on a ball starts that ball's drag (filed separately, below). */
export const chartAt = (page, p) => page.evaluate(p => { const q = new DOMPoint(p.x, p.y).matrixTransform(document.getElementById('viewport').getScreenCTM().inverse()); return { x: q.x, y: q.y } }, p)
export const emptySpot = page => page.evaluate(() => {
  const s0 = document.getElementById('flowSvg').getBoundingClientRect(), b0 = document.getElementById('board').getBoundingClientRect()
  const s = { left: Math.max(s0.left, b0.left), top: Math.max(s0.top, b0.top), right: Math.min(s0.right, b0.right, innerWidth), bottom: Math.min(s0.bottom, b0.bottom, innerHeight) }
  const hit = (x, y) => { const e = document.elementFromPoint(x, y); return !e || !!(e.closest && e.closest('.ball')) }
  const cx = (s.left + s.right) / 2, cy = (s.top + s.bottom) / 2; let best = null
  for (let y = s.top + 60; y < s.bottom - 60; y += 11) for (let x = s.left + 110; x < s.right - 110; x += 11) {
    let ok = true; for (let d = 0; d <= 100 && ok; d += 10) if (hit(x - d, y) || hit(x + d, y)) ok = false
    if (ok) { const dd = Math.hypot(x - cx, y - cy); if (!best || dd < best.d) best = { x, y, d: dd } }
  }
  return best
})
async function editPinch(page, cdp, name, { d0, d1, dx = 0, dy = 0, picture = null }) {
  const p = await emptySpot(page)
  if (!p) { note(name, { pass: false, detail: 'no empty canvas on screen to pinch on' }); return }
  const c0 = await chartAt(page, p), v0 = (await zoomNow(page)).view
  /* at the 400% ceiling a pinch out cannot zoom: pinch in there instead */
  if (d1 > d0 && +(v0.match(/scale\(([\d.]+)\)/) || [0, 1])[1] >= 3.5) [d0, d1] = [d1, d0]
  if (picture) { await mark(page, p); await shot(page, `${TAG}-${picture}-1-before`); await unmark(page) }
  const end = await pinch(page, cdp, { cx: p.x, cy: p.y, d0, d1, dx, dy })
  const c1 = await chartAt(page, end), v1 = (await zoomNow(page)).view, k = +(v1.match(/scale\(([\d.]+)\)/) || [0, 1])[1]
  if (picture) { await mark(page, end); await shot(page, `${TAG}-${picture}-2-after`); await unmark(page) }
  const drift = Math.round(Math.hypot(c1.x - c0.x, c1.y - c0.y) * k * 10) / 10
  note(name, { pass: drift <= TOL && v1 !== v0, detail: `the chart point under the fingers moved ${drift}px; view ${v0} → ${v1}`, drift })
}
/* The second pinch problem the walk found (filed, NOT this fix): one finger on
   a ball makes the pinch a drag of that ball too. */
async function ballUnderFinger(page, cdp, name) {
  const b = await pickBall(page); if (!b) { note(name, { pass: false, detail: 'no ball in view' }); return }
  const pos = () => page.evaluate(id => document.querySelector(`#flowSvg .ball[data-id="${id}"]`).getAttribute('transform'), b.id)
  const undoOn = () => page.evaluate(() => { const u = document.querySelector('#page-tracker button[title*="ndo"]'); return u ? !u.disabled : null })
  const p0 = await pos(), u0 = await undoOn()
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b.x, y: b.y, id: 1 }, { x: b.x + 70, y: b.y, id: 2 }] })
  for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: b.x - 5 * i, y: b.y, id: 1 }, { x: b.x + 70 + 5 * i, y: b.y, id: 2 }] }); await page.waitForTimeout(16) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(400)
  const p1 = await pos(), u1 = await undoOn()
  note(name, { pass: p1 === p0 && u1 === u0, detail: `ball ${b.id} ${p0} → ${p1}; undo ${u0 ? 'on' : 'off'} → ${u1 ? 'on' : 'off'}`, filed: !(p1 === p0 && u1 === u0) })
}

async function phoneWalk(size, label) {
  const { browser, page, errors } = await open({ size, touch: true })
  const cdp = await touchCdp(page)
  await page.waitForTimeout(400)
  await pinchCase(page, cdp, `${label}: pinch OUT (zoom in) on a ball`, { d0: 60, d1: 200, picture: `${label}-out` })
  await pinchCase(page, cdp, `${label}: pinch IN (zoom out) on a ball`, { d0: 200, d1: 90 })
  await pinchCase(page, cdp, `${label}: pinch while the fingers slide`, { d0: 70, d1: 170, dx: -40, dy: -70, picture: `${label}-slide` })
  /* drag first, then pinch. A drag scrolls only from EMPTY chart (a finger on
     a ball is a tap on it, by design), so it starts on empty space, inside the
     chart area and on screen. */
  const dragFrom = () => page.evaluate(() => {
    const r = document.getElementById('board').getBoundingClientRect(), bot = Math.min(r.bottom, innerHeight), h = bot - r.top
    const dy = -Math.min(160, Math.round(h * 0.5))
    for (let x = r.left + 20; x < Math.min(r.right, innerWidth) - 20; x += 13) {
      const y = r.top + h / 2 - dy / 2, e = document.elementFromPoint(x, y)
      if (e && !(e.closest && e.closest('.ball'))) return { x, y, dy }
    }
    return null
  })
  let from = await dragFrom()
  const st0 = await page.evaluate(() => document.getElementById('board').scrollTop)
  if (from) await drag(page, cdp, { x: from.x, y: from.y, dx: 0, dy: from.dy })
  const st1 = await page.evaluate(() => document.getElementById('board').scrollTop)
  note(`${label}: one finger drags the chart before a pinch`, { pass: st1 > st0 + 30, detail: from ? `scroll ${st0}→${st1}` : 'no empty spot to start a drag' })
  /* at the 300% ceiling a pinch out cannot zoom, so pinch in there */
  const zNow = (await zoomNow(page)).flow
  await pinchCase(page, cdp, `${label}: pinch after a drag`, zNow >= 2.5 ? { d0: 180, d1: 90 } : { d0: 80, d1: 180 })
  /* pinch first, then drag: the drag must still scroll */
  const s2 = await page.evaluate(() => document.getElementById('board').scrollTop)
  from = await dragFrom()
  if (from) await drag(page, cdp, { x: from.x, y: from.y, dx: 0, dy: from.dy })
  const s3 = await page.evaluate(() => document.getElementById('board').scrollTop)
  note(`${label}: one finger drags the chart after a pinch`, { pass: s3 > s2 + 30, detail: `scroll ${s2}→${s3}` })
  /* the − button after a pinch: the chart point in the middle of the view holds,
     so a ball off the middle ends at middle + (its offset × the zoom ratio) */
  const mid = await page.evaluate(() => { const b = document.getElementById('board'), r = b.getBoundingClientRect(); return { x: r.left + b.clientLeft + b.clientWidth / 2, y: r.top + b.clientTop + b.clientHeight / 2 } })
  const cen = await page.evaluate(m => { let best = null; for (const g of document.querySelectorAll('#flowSvg .ball')) { const r = g.getBoundingClientRect(); if (!r.width) continue; const x = r.left + r.width / 2, y = r.top + r.height / 2, d = Math.hypot(x - m.x, y - m.y); if (!best || d < best.d) best = { id: g.dataset.id, x, y, d } } return best }, mid)
  const outBtn = page.locator('#fzOut:visible')
  if (await outBtn.count() && cen) {
    const za = (await zoomNow(page)).flow
    await outBtn.tap(); await page.waitForTimeout(250)
    const zt = (await zoomNow(page)).flow
    note(`${label}: the first tap on − after a drag/pinch on the chart registers`, { pass: zt !== za, detail: zt !== za ? '' : 'the tap reached the button (finger down and up on it) but made no press — a second tap works', filed: zt === za })
    if (zt === za) { await page.click('#fzOut'); await page.waitForTimeout(250) }
    const zb = (await zoomNow(page)).flow, r = zb / za, a = await ballAt(page, cen.id)
    const ex = { x: mid.x + (cen.x - mid.x) * r, y: mid.y + (cen.y - mid.y) * r }
    const off = Math.round(Math.hypot(a.x - ex.x, a.y - ex.y))
    note(`${label}: − after a pinch holds the middle of the view`, { pass: off <= TOL && zb !== za, detail: `zoom ${za}→${zb}; ball ${cen.id} ${off}px from where holding the middle puts it` })
  }
  /* Edit chart layout: the same gesture on the editing canvas */
  await page.tap('#sylMenuBtn'); await page.waitForTimeout(200); await page.tap('#arrangeBtn'); await page.waitForTimeout(600)
  const inEdit = await page.evaluate(() => document.getElementById('flowSvg').classList.contains('arrange'))
  note(`${label}: Edit chart layout opens`, { pass: inEdit })
  /* how much of the screen the editing canvas actually gets (filed, not this fix:
     sideways on a phone the tool strip leaves it none) */
  const room = await page.evaluate(() => { const r = document.getElementById('board').getBoundingClientRect(); return Math.max(0, Math.round(Math.min(r.bottom, innerHeight) - r.top)) })
  note(`${label}: Edit chart layout leaves the chart room on screen`, { pass: room >= 150, detail: `${room}px of chart visible`, filed: room < 150 })
  if (room < 150) await shot(page, `${TAG}-${label}-edit-no-room`)
  if (room >= 150) {
    await ballUnderFinger(page, cdp, `${label}: EDIT LAYOUT — a pinch with one finger ON a ball leaves that ball and undo alone`)
    await editPinch(page, cdp, `${label}: EDIT LAYOUT — pinch OUT keeps the chart under the fingers`, { d0: 60, d1: 180, picture: `${label}-edit` })
    await editPinch(page, cdp, `${label}: EDIT LAYOUT — pinch IN keeps the chart under the fingers`, { d0: 180, d1: 80 })
    await editPinch(page, cdp, `${label}: EDIT LAYOUT — fingers that slide carry the chart`, { d0: 70, d1: 150, dx: 30, dy: -50 })
  }
  /* and out again the way a person does: the ✎ menu, then "✓ Done editing chart" */
  let taps = 0
  while (!(await page.locator('#arrangeBtn').isVisible()) && taps < 2) { await page.tap('#sylMenuBtn'); taps++; await page.waitForTimeout(250) }
  if (taps > 1) note(`${label}: the first tap on ✎ after a pinch opens its menu`, { pass: false, detail: 'needed a second tap', filed: true })
  const doneVisible = await page.locator('#arrangeBtn').isVisible()
  if (doneVisible) { await page.tap('#arrangeBtn'); await page.waitForTimeout(500) }
  const left = await page.evaluate(() => !document.getElementById('flowSvg').classList.contains('arrange'))
  if (!left) await shot(page, `${TAG}-${label}-edit-exit-stuck`)
  note(`${label}: "✓ Done editing chart" still reachable after pinching in Edit chart layout`, { pass: left, detail: doneVisible ? '' : 'the ✎ menu did not show "✓ Done editing chart"' })
  note(`${label}: no console or page errors`, { pass: errors.length === 0, detail: errors.slice(0, 3).join(' | ') })
  await browser.close()
}

/* The touch helpers above are shared with trk-pinch-ball.mjs ([TRK-PINCH-DRAGS-BALL]),
   so this walk runs only when it is the script named on the command line. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await phoneWalk(PHONE, 'phone')
  await phoneWalk({ width: 844, height: 390 }, 'phone-sideways')
  await phoneWalk({ width: 1366, height: 1024 }, 'tablet')

  const filed = rows.filter(r => !r.pass && r.filed).length, failed = rows.filter(r => !r.pass && !r.filed).length
  console.log(`\n${rows.filter(r => r.pass).length}/${rows.length} passed; ${filed} FILED (the older problems, not this fix); ${failed} unexpected`)
  save(`pinch-${TAG}`, { rows })
}
