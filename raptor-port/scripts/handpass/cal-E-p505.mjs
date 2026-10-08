// P5-05 — dragging from the middle of a bar uses the grab-to-drop distance. Real mouse (desk) / real finger (phone).
// The 29 Jul - 3 Aug input is SEEDED (background); the drag, Undo, Redo and the member's refusal are the controls under test.
import { launch, world, toInputs, toMonth, cell, bar, shot, press, saveRows, seedFile, recOf, mouseDrag, centreOf, dayCentre, fingerDrag, lerp } from './cal-E-lib.mjs'
const size = process.argv[2] || 'desk'
const b = await launch()
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
const out = {}
const dates = r => r && [r.date, r.endDate || '']
const w = await world(b, size); const p = w.page
const N = n => `p505-${size}-${n}`
await toInputs(p); await toMonth(p, 2026, 8)
const sid = await p.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))
const [iid] = await seedFile(p, [{ pid: sid, type: 'LL', from: 'Jul 29', to: 'Aug 3', remarks: 'drag me' }])
await p.waitForTimeout(400)
L('seeded', iid, JSON.stringify(dates(await recOf(p, iid))))
await shot(p, N('0-before'))
const pieces = await bar(p, iid).count()
L('bar pieces drawn in July', pieces)
// grab the INTERIOR segment: over Fri 31 Jul (the bar's third day), drop two days later (Sun 2 Aug)
const piece = bar(p, iid).first()
const bb = await piece.boundingBox()
const fri = await dayCentre(p, '2026-08-01'), sun = await dayCentre(p, '2026-08-03')
const y = bb.y + bb.height / 2, dy = sun.b.y - fri.b.y
const hold = size === 'desk' ? 0 : 500
const doDrag = async (fromX, toX, steps = 10) => {
  if (size === 'desk') await mouseDrag(p, { x: fromX, y }, { x: toX, y: y + dy })
  else await fingerDrag(w.ctx, p, lerp({ x: fromX, y }, { x: toX, y: y + dy }, steps), hold)
  await p.waitForTimeout(500)
}
// follow check mid-drag (desktop only: the ghost follows the pointer)
if (size === 'desk') {
  await p.mouse.move(fri.x, y); await p.mouse.down()
  await p.mouse.move((fri.x + sun.x) / 2, y + dy / 2, { steps: 6 })
  const g = await p.evaluate(() => { const e = document.querySelector('.ic-ghost'); if (!e) return null; const r = e.getBoundingClientRect(); return { cx: Math.round(r.left + r.width / 2), cy: Math.round(r.top + r.height / 2) } })
  L('ghost mid-drag', JSON.stringify(g), 'pointer', Math.round((fri.x + sun.x) / 2), Math.round(y + 3))
  await shot(p, N('1-mid-drag'))
  await p.mouse.move(sun.x, y + dy, { steps: 6 })
  L('date under the pointer lit?', await cell(p, '2026-08-03').getAttribute('class'))
  await p.mouse.up(); await p.waitForTimeout(500)
} else {
  await doDrag(fri.x, sun.x)
}
const r1 = await recOf(p, iid)
L('after drag', JSON.stringify(dates(r1)))
await shot(p, N('2-after-drag'))
out.moved = dates(r1)
const mvOk = r1.date === 'Jul 31' && r1.endDate === 'Aug 5'
L('both endpoints +2 and duration kept?', mvOk)
await p.waitForTimeout(400)
L('editor opened by the release?', await p.locator('[data-testid="win-inputedit"]').count(), '| flash on moved bar', await p.locator(`.ib-bar.lift-land[data-iid="${iid}"]`).count())
// ONE undo
await press(p, size, p.locator('#undoBtn')); await p.waitForTimeout(500)
const r2 = await recOf(p, iid); L('after ONE Undo', JSON.stringify(dates(r2)), 'month shown:', await p.locator('#inpCal .ic-mon').innerText()); out.undo = dates(r2)
await shot(p, N('3-after-undo'))
await press(p, size, p.locator('#redoBtn')); await p.waitForTimeout(500)
const r3 = await recOf(p, iid); L('after Redo', JSON.stringify(dates(r3)), 'month shown:', await p.locator('#inpCal .ic-mon').innerText()); out.redo = dates(r3)
await shot(p, N('4-after-redo'))
// back to the start for the member's attempt
await press(p, size, p.locator('#undoBtn')); await p.waitForTimeout(400)
L('undone again', JSON.stringify(dates(await recOf(p, iid))), 'month shown:', await p.locator('#inpCal .ic-mon').innerText()); await toMonth(p, 2026, 8)
// as an unrelated member
await p.evaluate(() => { window.raptorMe('bane'); window.raptorRole('member') }); await p.waitForTimeout(600)
const bb2 = await bar(p, iid).first().boundingBox(); const y2 = bb2.y + bb2.height / 2
const fri2 = await dayCentre(p, '2026-08-01'), sun2 = await dayCentre(p, '2026-08-03'), dy2 = sun2.b.y - fri2.b.y
if (size === 'desk') {
  await p.mouse.move(fri2.x, y2); await p.mouse.down(); await p.mouse.move((fri2.x + sun2.x) / 2, y2 + dy2, { steps: 6 })
  L('member: ghost while dragging another man\'s bar?', await p.locator('.ic-ghost').count())
  await shot(p, N('5-member-mid'))
  await p.mouse.move(sun2.x, y2 + dy2, { steps: 6 }); await p.mouse.up()
} else { await fingerDrag(w.ctx, p, lerp({ x: fri2.x, y: y2 }, { x: sun2.x, y: y2 + dy2 }, 10), 500) }
await p.waitForTimeout(500)
const r4 = await recOf(p, iid); L('member drag result', JSON.stringify(dates(r4)), '| editor opened?', await p.locator('[data-testid="win-inputedit"]').count()); out.member = dates(r4)
await shot(p, N('6-member-after'))
L('errors', JSON.stringify(w.errors))
saveRows('p505-' + size, [{ log, out, mvOk, errors: w.errors }])
await b.close()
