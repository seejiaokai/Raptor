// RW1-4a — B5's last-person refusals on the DESKTOP: board and week, a lone man and ALL AVAIL alone
import { launch, openWorld, fileInput, shotP, rowIdx, inputOf, toastMark, toastsSince, errs, toWeek, openBoard, centre, boardRowEl, boardRowNames, weekRowEl, weekRowNames, drag2, drag3, toastNow, waitQuiet, undoTitle, toastBoxOf, log } from './or-RW1-lib.mjs'
const browser = await launch()
const { page: p } = await openWorld(browser)
const DI = 4
const iid = (await fileInput(p, { type: 'Training', person: 'Ranger', from: '2026-07-17', to: '2026-07-17', timed: ['17:00', '18:00'] }))[0].iid
const jid = (await fileInput(p, { type: 'Meeting', people: [], ph: 'allavail', from: '2026-07-17', to: '2026-07-17', timed: ['14:00', '15:00'], title: 'Crowd only' }))[0].iid
log('filed', await inputOf(p, iid), await inputOf(p, jid))
const ri = await rowIdx(p, DI, iid), rj = await rowIdx(p, DI, jid)
log('rows', ri, rj)
const snap = async () => JSON.stringify({ a: (await inputOf(p, iid)).people, b: (await inputOf(p, jid)).people })
async function step(tag, surface, which, act) {
  await waitQuiet(p)
  const before = await snap()
  const m = await toastMark(p)
  await act()
  await p.waitForTimeout(200)
  log(tag, 'toasts', await toastsSince(p, m))
  log(tag, 'box', await toastBoxOf(p))
  await shotP(p, 'rw1-4a-' + tag)
  log(tag, 'unchanged', before === (await snap()), await snap(), 'undo', await undoTitle(p))
}
/* board */
await openBoard(p, DI)
const brow = r => boardRowEl(p, DI, r)
await centre(brow(ri)); await p.waitForTimeout(300)
await step('1-board-drag-off-ranger', 'board', 'a', async () => drag2(p, brow(ri).locator('.puck').first(), { x: 420, y: 26 }))
await centre(brow(ri)); await p.waitForTimeout(300)
await step('2-board-rightclick-ranger', 'board', 'a', async () => { await brow(ri).locator('.puck').first().click({ button: 'right' }); await p.waitForTimeout(500) })
await centre(brow(rj)); await p.waitForTimeout(300)
log('crowd row', (await boardRowNames(p, DI, rj)).names)
if ((await inputOf(p, jid)).people.includes('Saber')) {
  await waitQuiet(p)
  const mm = await toastMark(p)
  await brow(rj).locator('.puck', { hasText: 'Saber' }).first().click({ button: 'right' }); await p.waitForTimeout(600)
  log('Saber out toast', await toastsSince(p, mm), (await inputOf(p, jid)).people)
  await centre(brow(rj)); await p.waitForTimeout(300)
}
await step('3-board-drag-off-allavail', 'board', 'b', async () => drag2(p, brow(rj).locator('.puck').first(), { x: 420, y: 26 }))
await centre(brow(rj)); await p.waitForTimeout(300)
await step('4-board-rightclick-allavail', 'board', 'b', async () => { await brow(rj).locator('.puck').first().click({ button: 'right' }); await p.waitForTimeout(500) })
/* week */
await toWeek(p)
const wrow = r => weekRowEl(p, DI, r)
await centre(wrow(ri)); await p.waitForTimeout(300)
log('week rows', (await weekRowNames(p, DI, ri)).names, (await weekRowNames(p, DI, rj)).names)
await step('5-week-drag-off-ranger', 'week', 'a', async () => drag3(p, wrow(ri).locator('.puck').first(), { x: 1000, y: 28 }))
await centre(wrow(ri)); await p.waitForTimeout(300)
await step('6-week-rightclick-ranger', 'week', 'a', async () => { await wrow(ri).locator('.puck').first().click({ button: 'right' }); await p.waitForTimeout(500) })
await centre(wrow(rj)); await p.waitForTimeout(300)
await step('7-week-drag-off-allavail', 'week', 'b', async () => drag3(p, wrow(rj).locator('.puck').first(), { x: 1000, y: 28 }))
await centre(wrow(rj)); await p.waitForTimeout(300)
await step('8-week-rightclick-allavail', 'week', 'b', async () => { await wrow(rj).locator('.puck').first().click({ button: 'right' }); await p.waitForTimeout(500) })
log('errs', errs)
await browser.close()
