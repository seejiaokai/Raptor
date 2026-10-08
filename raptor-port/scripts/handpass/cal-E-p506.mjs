// P5-06 — bar movement, range selection, swipe and page scroll do not steal one another. Real finger on a short phone; real mouse on desktop.
import { launch, world, toInputs, toMonth, cell, bar, shot, press, saveRows, seedFile, recOf, mouseDrag, centreOf, dayCentre, fingerDrag, lerp } from './cal-E-lib.mjs'
const size = process.argv[2] || 'short'
const b = await launch()
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
const res = {}
const w = await world(b, size); const p = w.page
const N = n => `p506-${size}-${n}`
await toInputs(p); await toMonth(p, 2026, 10)
const sid = await p.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))
const [iid] = await seedFile(p, [{ pid: sid, type: 'LL', from: 'Oct 13', to: 'Oct 15', remarks: 'bar' }])
await p.waitForTimeout(400)
const snap = () => p.evaluate(() => JSON.stringify(window.INPUTS.map(x => [x.iid, x.date, x.endDate, x.s, x.e, x.remarks]).sort()))
const mon = () => p.locator('#inpCal .ic-mon').innerText()
const state = async () => ({ mon: await mon(), picked: await p.locator('.ib-day.is-picked').count(), open: await p.locator('.ib-day.is-open').count(), editor: await p.locator('[data-testid="win-inputedit"]').count(), ghost: await p.locator('.ic-ghost').count(), scrollY: await p.evaluate(() => scrollY) })
const base = await snap()
const phone = size !== 'desk' && size !== 'wide'
const cdpT = async (type, pts) => { const c = await w.ctx.newCDPSession(p); await c.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((q, i) => ({ x: Math.round(q.x), y: Math.round(q.y), id: i + 1 })) }); await c.detach() }
const low = iso => dayCentre(p, iso, true)
L('size', size, 'month', await mon(), 'viewport', JSON.stringify(await p.evaluate(() => [innerWidth, innerHeight, document.documentElement.scrollHeight])))
await shot(p, N('0-start'))

if (phone) {
  // 1 a TAP on an empty date (its corner): opens the day, writes nothing
  const t = cell(p, '2026-10-20')
  await t.tap({ position: { x: 10, y: 10 } }); await p.waitForTimeout(500)
  res.tap = await state(); L('1 tap on 20 Oct:', JSON.stringify(res.tap), 'unchanged:', (await snap()) === base)
  await shot(p, N('1-tap'))
  await p.keyboard.press('Escape'); await p.waitForTimeout(300)
  // 2 a quick horizontal SLIDE: turns the month, picks and opens nothing
  const a = await low('2026-10-22')
  await fingerDrag(w.ctx, p, [a, { x: a.x - 20, y: a.y }, { x: a.x - 60, y: a.y }, { x: a.x - 110, y: a.y }, { x: a.x - 150, y: a.y }], 0)
  await p.waitForTimeout(500)
  res.swipe = await state(); L('2 swipe left:', JSON.stringify(res.swipe), 'unchanged:', (await snap()) === base)
  await shot(p, N('2-swipe-left'))
  // swipe back
  const a2 = await low('2026-11-10').catch(() => null)
  const c0 = { x: 200, y: 330 }
  await fingerDrag(w.ctx, p, [c0, { x: c0.x + 30, y: c0.y }, { x: c0.x + 80, y: c0.y }, { x: c0.x + 130, y: c0.y }, { x: c0.x + 160, y: c0.y }], 0)
  await p.waitForTimeout(500)
  L('2b swipe right:', await mon())
  // 3 HOLD then drag across empty dates: picks the run, the page stands still, nothing written until Add
  const s0 = await state()
  const d1 = await low('2026-10-06'), d2 = await low('2026-10-08')
  await fingerDrag(w.ctx, p, lerp({ x: d1.x, y: d1.y }, { x: d2.x, y: d2.y }, 8), 500)
  await p.waitForTimeout(500)
  res.hold = await state(); L('3 hold-drag 6->8 Oct:', JSON.stringify(res.hold), 'editor range text:', await p.locator('#inpEditPop .rc-read').innerText().catch(() => 'n/a'), 'unchanged:', (await snap()) === base, 'scrollY before/after', s0.scrollY, res.hold.scrollY)
  await shot(p, N('3-hold-drag-range'))
  await p.locator('[data-testid="win-inputedit-x"]').tap().catch(() => {}); await p.waitForTimeout(300)
  // 4 HOLD then drag a BAR: moves it by the days between grab and drop
  const bb = await bar(p, iid).first().boundingBox(); const y = bb.y + bb.height / 2
  const g1 = await dayCentre(p, '2026-10-14'), g2 = await dayCentre(p, '2026-10-16')
  await fingerDrag(w.ctx, p, lerp({ x: g1.x, y }, { x: g2.x, y }, 8), 500)
  await p.waitForTimeout(500)
  const r = await recOf(p, iid); res.barMove = [r.date, r.endDate]; L('4 hold-drag bar 14->16:', JSON.stringify([r.date, r.endDate]), JSON.stringify(await state()))
  await shot(p, N('4-bar-moved'))
  await press(p, size, p.locator('#undoBtn')); await p.waitForTimeout(400)
  L('4b Undo:', JSON.stringify((await recOf(p, iid)).date), (await snap()) === base)
  // 5 a VERTICAL swipe starting on a date, and on a bar: scrolls the page (if it can), moves nothing
  const bb2 = await bar(p, iid).first().boundingBox(); const yb = bb2.y + bb2.height / 2, xb = bb2.x + 20
  const sc0 = await p.evaluate(() => scrollY)
  await fingerDrag(w.ctx, p, [{ x: xb, y: yb }, { x: xb, y: yb - 20 }, { x: xb, y: yb - 80 }, { x: xb, y: yb - 160 }, { x: xb, y: yb - 220 }], 0)
  await p.waitForTimeout(600)
  res.vscrollBar = await state(); L('5a vertical swipe starting ON A BAR: scrollY', sc0, '->', res.vscrollBar.scrollY, JSON.stringify(res.vscrollBar), 'unchanged:', (await snap()) === base)
  await shot(p, N('5a-vscroll-bar'))
  const sc1 = await p.evaluate(() => scrollY)
  const e1 = await low('2026-10-23')
  await fingerDrag(w.ctx, p, [{ x: e1.x, y: e1.y }, { x: e1.x, y: e1.y + 20 }, { x: e1.x, y: e1.y + 80 }, { x: e1.x, y: e1.y + 160 }, { x: e1.x, y: e1.y + 220 }], 0)
  await p.waitForTimeout(600)
  res.vscrollDate = await state(); L('5b vertical swipe starting ON A DATE: scrollY', sc1, '->', res.vscrollDate.scrollY, JSON.stringify(res.vscrollDate), 'unchanged:', (await snap()) === base)
  await shot(p, N('5b-vscroll-date'))
  // 6 a CANCELLED hold-drag of the bar (touchCancel) writes nothing
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300)
  const bb3 = await bar(p, iid).first().boundingBox(); const y3 = bb3.y + bb3.height / 2
  const h1 = await dayCentre(p, '2026-10-14'), h2 = await dayCentre(p, '2026-10-16')
  const c = await w.ctx.newCDPSession(p)
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: Math.round(h1.x), y: Math.round(y3), id: 1 }] })
  await p.waitForTimeout(500)
  for (const q of lerp({ x: h1.x, y: y3 }, { x: h2.x, y: y3 }, 6)) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(q.x), y: Math.round(q.y), id: 1 }] }); await p.waitForTimeout(16) }
  res.cancelMid = await state(); L('6 mid-drag before cancel:', JSON.stringify(res.cancelMid))
  await shot(p, N('6a-mid-drag'))
  await c.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); await c.detach()
  await p.waitForTimeout(500)
  res.cancelEnd = await state(); L('6b after touchCancel:', JSON.stringify(res.cancelEnd), 'unchanged:', (await snap()) === base)
  await shot(p, N('6b-after-cancel'))
} else {
  // desktop, real mouse
  const d1 = await low('2026-10-06'), d2 = await low('2026-10-08')
  await mouseDrag(p, d1, d2); await p.waitForTimeout(500)
  res.range = await state(); L('1 mouse drag 6->8 Oct on empty dates:', JSON.stringify(res.range), await p.locator('#inpEditPop .rc-read').innerText().catch(() => 'n/a'), 'unchanged:', (await snap()) === base)
  await shot(p, N('1-range'))
  await p.locator('#inpEditCancel').click(); await p.waitForTimeout(300)
  const bb = await bar(p, iid).first().boundingBox(); const y = bb.y + bb.height / 2
  const g1 = await dayCentre(p, '2026-10-14'), g2 = await dayCentre(p, '2026-10-16')
  // Escape mid-drag
  await p.mouse.move(g1.x, y); await p.mouse.down(); await p.mouse.move(g2.x, y + 4, { steps: 8 })
  res.mid = await state(); L('2 bar mid-drag (ghost drawn, no range picked):', JSON.stringify(res.mid))
  await shot(p, N('2-mid-drag'))
  await p.keyboard.press('Escape'); await p.waitForTimeout(200); await p.mouse.up(); await p.waitForTimeout(500)
  const r0 = await recOf(p, iid); L('2b after Escape + release:', JSON.stringify([r0.date, r0.endDate]), JSON.stringify(await state()), 'unchanged:', (await snap()) === base)
  // drop back where it started
  await p.mouse.move(g1.x, y); await p.mouse.down(); await p.mouse.move(g2.x, y + 4, { steps: 8 }); await p.mouse.move(g1.x, y, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(500)
  L('3 dropped back where grabbed: unchanged', (await snap()) === base, JSON.stringify(await state()))
  // a real move
  await mouseDrag(p, { x: g1.x, y }, { x: g2.x, y: y + 4 }); await p.waitForTimeout(500)
  const r = await recOf(p, iid); L('4 bar moved 14->16:', JSON.stringify([r.date, r.endDate]), JSON.stringify(await state()))
  res.barMove = [r.date, r.endDate]
  await shot(p, N('4-moved'))
  await p.locator('#undoBtn').click(); await p.waitForTimeout(400)
  L('4b Undo restores:', (await snap()) === base)
  // the wheel over the month
  await p.mouse.move(600, 600); await p.mouse.wheel(0, 400); await p.waitForTimeout(400)
  L('5 wheel over the month:', JSON.stringify(await state()), 'unchanged:', (await snap()) === base)
  // click (no drag) on a date opens the day; a click on a bar opens it
  await cell(p, '2026-10-20').click({ position: { x: 8, y: 8 } }); await p.waitForTimeout(400)
  res.click = await state(); L('6 click on date:', JSON.stringify(res.click), (await snap()) === base)
}
L('errors', JSON.stringify(w.errors))
saveRows('p506-' + size, [{ log, res, errors: w.errors }])
await b.close()
