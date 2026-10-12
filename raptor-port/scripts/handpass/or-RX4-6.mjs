// RX4-6: the crowd of a published Personal input. Sat 18 Jul Personal for Ranger 09:00-12:00, ALL AVAIL dropped on; publish Sat; then LL for Drifter on Sat 18.
import * as L from './or-RX4-lib.mjs'
import * as F from './or-RX4-fix.mjs'
const { j } = L
const out = {}
const ISO = '2026-07-18', DI = 5
const { ctx, page: p } = await L.open('ad', 'a')
const pe = (await L.fileInput(p, { type: 'Personal', person: 'Ranger', from: ISO, to: ISO, timed: ['09:00', '12:00'], title: 'RX4 own' }))[0]
out.filed = pe; console.log('filed', j(pe))
const iid = pe.iid
console.log('OIL sheet after save:', await F.oilSheet(p))
await L.toBoard(p, DI)
const ri = await L.rowIdx(p, DI, iid)
let row = F.boardRowEl(p, DI, ri); await F.centreEl(row); await p.waitForTimeout(300)
const m = await L.toastMark(p)
await F.drag2(p, await F.rosterPuckOf(p, '#sbRoster', 'ALL AVAIL'), row.locator('.addz').first())
out.dropToast = await L.toastsSince(p, m); console.log('drop toast:', out.dropToast, '| oil sheet:', await F.oilSheet(p))
out.afterDrop = await L.inputOf(p, iid); console.log('input after drop', j(out.afterDrop))
// read the ALL AVAIL puck(s) on a surface
const readAA = (sel, di) => p.evaluate(([sel, di]) => {
  const root = sel === 'board' ? document.querySelector('#schedBoard') : [...document.querySelectorAll(sel)][di]
  if (!root) return 'NO ROOT ' + sel
  const rows = [...root.querySelectorAll('.pl-row, .sb-arow')].filter(r => r.offsetParent && /ALL AVAIL/i.test(r.innerText))
  return rows.map(r => ({ rowText: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 160), pucks: [...r.querySelectorAll('.puck')].filter(pk => /ALL AVAIL/i.test(pk.innerText)).map(pk => ({ text: pk.innerText.replace(/\s+/g, ' ').trim(), title: pk.getAttribute('title') || pk.parentElement?.getAttribute('title') || '', html: pk.innerHTML.replace(/\s+/g, ' ').slice(0, 260) })) }))
}, [sel, di])
out.boardAA0 = await readAA('board', DI); console.log('board ALL AVAIL (before publish)', j(out.boardAA0))
await row.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(300)
{ const bb = await row.boundingBox(); await L.shot(p, 'rx4-6-1-board-row-before-publish', { x: 0, y: Math.max(0, bb.y - 20), width: 1100, height: bb.height + 40 }) }
// sign and publish Saturday
out.pub = await L.signAndPublish(p, DI); console.log('PUBLISH Sat', j(out.pub))
// read on the week (Edit) and View-only
await L.toWeek(p); await L.scrollToSec(p, 'ground', DI)
out.editAA1 = await readAA('#eWeek .day:not(.peek)', DI); console.log('Edit Schedule ALL AVAIL after publish', j(out.editAA1))
out.edit1 = await L.counts(p, { di: DI, noBoard: true }); console.log('COUNTS Sat after publish', L.fmt(out.edit1))
await L.toWeek(p); await L.scrollToSec(p, 'ground', DI)
{ const f = L.day(p, DI).locator('.sec-inp, .sec-grnd').first(); if (await f.count()) { await f.scrollIntoViewIfNeeded().catch(() => {}) } await L.shot(p, 'rx4-6-2-edit-after-publish') }
await L.toView(p)
const vDay = () => p.locator('#vWeek .day').nth(DI)
await vDay().scrollIntoViewIfNeeded()
await p.evaluate(di => { const d = document.querySelectorAll('#vWeek .day')[di]; d.scrollIntoView({ inline: 'start', block: 'nearest' }) }, DI); await p.waitForTimeout(400)
out.viewAA1 = await readAA('#vWeek .day', DI); console.log('View-only ALL AVAIL after publish', j(out.viewAA1))
{
  const vr = await p.evaluate(di => { const d = document.querySelectorAll('#vWeek .day')[di]; const r = [...d.querySelectorAll('.pl-row')].find(r => /ALL AVAIL/i.test(r.innerText)); if (!r) return null; r.scrollIntoView({ block: 'center' }); return true }, DI)
  await p.waitForTimeout(400)
  await L.shot(p, 'rx4-6-3-view-after-publish')
}
// file LL for Drifter on Sat 18
const ll = (await L.fileInput(p, { type: 'LL', person: 'Drifter', from: ISO, to: ISO }))[0]
out.ll = ll; console.log('LL filed', j(ll), '| oil sheet:', await F.oilSheet(p))
out.inputsAfterLL = (await L.allInputs(p)).filter(r => /Jul 18/.test(r.date)); console.log('Jul 18 inputs', j(out.inputsAfterLL))
await L.toWeek(p); await L.scrollToSec(p, 'ground', DI)
out.editAA2 = await readAA('#eWeek .day:not(.peek)', DI); console.log('Edit Schedule ALL AVAIL after LL', j(out.editAA2))
out.edit2 = await L.counts(p, { di: DI, keepWin: true, noBoard: false }); console.log('COUNTS Sat after LL', L.fmt(out.edit2))
await L.shot(p, 'rx4-6-4-togoout-after-ll')
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
await L.toWeek(p); await L.scrollToSec(p, 'ground', DI)
await L.shot(p, 'rx4-6-5-edit-after-ll')
out.editAA2b = await readAA('#eWeek .day:not(.peek)', DI)
// the ALL AVAIL window on the edit week after LL: count & who
// board
await L.toBoard(p, DI)
out.boardAA2 = await readAA('board', DI); console.log('board ALL AVAIL after LL', j(out.boardAA2))
{ const r2 = F.boardRowEl(p, DI, ri); await F.centreEl(r2); await p.waitForTimeout(300); const bb = await r2.boundingBox(); await L.shot(p, 'rx4-6-6-board-row-after-ll', { x: 0, y: Math.max(0, bb.y - 20), width: 1100, height: bb.height + 40 }) }
await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(300)
await L.toView(p)
await p.evaluate(di => { const d = document.querySelectorAll('#vWeek .day')[di]; d.scrollIntoView({ inline: 'start', block: 'nearest' }) }, DI); await p.waitForTimeout(400)
out.viewAA2 = await readAA('#vWeek .day', DI); console.log('View-only ALL AVAIL after LL', j(out.viewAA2))
await p.evaluate(di => { const d = document.querySelectorAll('#vWeek .day')[di]; const r = [...d.querySelectorAll('.pl-row')].find(r => /ALL AVAIL/i.test(r.innerText)); if (r) r.scrollIntoView({ block: 'center' }) }, DI); await p.waitForTimeout(400)
await L.shot(p, 'rx4-6-7-view-after-ll')
// reload, same
await L.reload(p)
await L.toWeek(p); await L.scrollToSec(p, 'ground', DI)
out.editAA3 = await readAA('#eWeek .day:not(.peek)', DI); console.log('Edit after reload', j(out.editAA3))
await L.toView(p)
await p.evaluate(di => { const d = document.querySelectorAll('#vWeek .day')[di]; d.scrollIntoView({ inline: 'start', block: 'nearest' }) }, DI); await p.waitForTimeout(400)
out.viewAA3 = await readAA('#vWeek .day', DI); console.log('View after reload', j(out.viewAA3))
console.log('ERRORS', L.errs.join(' | ') || 'none'); out.errs = L.errs.slice()
L.saveRes('6', out)
await ctx.close(); await L.browser.close()
