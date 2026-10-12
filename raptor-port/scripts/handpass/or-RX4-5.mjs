// RX4-5 (RECORDED): which puck wears the tag. Meeting Drifter, Hunter, Ranger Wed 15 Jul, published; Hunter (middle) right-clicked off.
import * as L from './or-RX4-lib.mjs'
const { j } = L
const out = {}
const { ctx, page: p } = await L.open('ad', 'a')
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: L.ISO, to: L.ISO, timed: ['09:00', '10:00'], title: 'Range brief' }))[0]
const iid = mt.iid
out.filed = mt; console.log('filed', j(mt))
out.pub = await L.signAndPublish(p, L.DI); console.log('PUBLISH', j(out.pub))
const seatsOn = (sel, di, ri) => p.evaluate(([sel, di, ri]) => {
  const root = sel === 'board' ? document.querySelector('#schedBoard') : [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
  const fs = [...root.querySelectorAll(`[data-fill="g:${di}.${ri}.+"]`)].filter(e => e.offsetParent)
  const f = fs[0]; if (!f) return 'NO FILL'
  return [...f.querySelectorAll('.seat')].map(s => ({ who: (s.querySelector('.puck .nm')?.textContent || '').trim(), title: s.getAttribute('title') || s.querySelector('.puck')?.getAttribute('title') || '', attrs: [...s.attributes].filter(a => a.name !== 'class').map(a => a.name + '=' + a.value.slice(0, 70)).join(' | '), cls: s.className, extraEls: [...s.children].filter(c => !c.classList.contains('puck')).map(c => c.className + ':' + c.textContent.trim()).join(',') }))
}, [sel, di, ri])
const ri0 = await L.rowIdx(p, L.DI, iid)
await L.toWeek(p); out.seatsPub = await seatsOn('week', L.DI, ri0); console.log('week seats as published', j(out.seatsPub))
console.log('take off Hunter:', await L.takeOffRow(p, 'Hunter', iid))
const ri = await L.rowIdx(p, L.DI, iid)
out.inputs = await L.inputOf(p, iid); console.log('input now', j(out.inputs))
out.c1 = await L.counts(p, { keepWin: true, noBoard: false }); console.log('COUNTS', L.fmt(out.c1))
await L.shot(p, 'rx4-5-1-window-hunter-off')
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
// week: zoom on the row
await L.toWeek(p); await L.scrollToSec(p, 'ground')
out.seatsWeek = await seatsOn('week', L.DI, ri); console.log('week seats', j(out.seatsWeek))
{
  const f = L.day(p).locator(`[data-fill="g:${L.DI}.${ri}.+"]`).first(); const bb = await f.boundingBox()
  await p.screenshot({ path: L.OUT + '/rx4-5-2-week-row-zoom.png', clip: { x: Math.max(0, bb.x - 20), y: Math.max(0, bb.y - 24), width: bb.width + 260, height: bb.height + 40 } })
  console.log('saved rx4-5-2-week-row-zoom')
  await L.shot(p, 'rx4-5-2b-week-wide')
}
// board
await L.toBoard(p, L.DI)
{
  const f = p.locator(`#schedBoard [data-fill="g:${L.DI}.${ri}.+"]:visible`).first()
  await f.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(400)
  out.seatsBoard = await seatsOn('board', L.DI, ri); console.log('board seats', j(out.seatsBoard))
  const bb = await f.boundingBox()
  await p.screenshot({ path: L.OUT + '/rx4-5-3-board-row-zoom.png', clip: { x: Math.max(0, bb.x - 20), y: Math.max(0, bb.y - 24), width: Math.min(1440 - Math.max(0, bb.x - 20), bb.width + 260), height: bb.height + 40 } })
  console.log('saved rx4-5-3-board-row-zoom')
  await L.shot(p, 'rx4-5-3b-board-wide')
}
// reload, same
await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(300)
await L.reload(p)
await L.toWeek(p); await L.scrollToSec(p, 'ground')
out.seatsWeekReload = await seatsOn('week', L.DI, ri); console.log('week seats after reload', j(out.seatsWeekReload))
{
  const f = L.day(p).locator(`[data-fill="g:${L.DI}.${ri}.+"]`).first(); const bb = await f.boundingBox()
  await p.screenshot({ path: L.OUT + '/rx4-5-4-week-row-zoom-reload.png', clip: { x: Math.max(0, bb.x - 20), y: Math.max(0, bb.y - 24), width: bb.width + 260, height: bb.height + 40 } })
}
console.log('ERRORS', L.errs.join(' | ') || 'none'); out.errs = L.errs.slice()
L.saveRes('5', out)
await ctx.close(); await L.browser.close()
