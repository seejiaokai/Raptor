// RW1-4b — the last-person refusals on a PHONE (390x844 touch): week and board, a lone man and ALL AVAIL alone; the note's box measured
import { launchP, openPhone, fileInputP, inputP, touchDrag, longPress, goWeek, goBoard, unfoldWeek, unfoldBoard, weekRowTop, errs, shotP, toastBoxOf, log, sleep, waitQuiet } from './or-RW1-plib.mjs'
const DI = 4
const browser = await launchP()
const { ctx, page } = await openPhone(browser)
const iid = (await fileInputP(page, { type: 'Training', person: 'Ranger', from: '2026-07-17', to: '2026-07-17', timed: ['17:00', '18:00'] }))[0].iid
const jid = (await fileInputP(page, { type: 'Meeting', people: [], ph: 'allavail', from: '2026-07-17', to: '2026-07-17', timed: ['14:00', '15:00'], title: 'Crowd only' }))[0].iid
log('filed', await inputP(page, iid), await inputP(page, jid))
const snap = async () => JSON.stringify({ a: (await inputP(page, iid)).people, b: (await inputP(page, jid)).people })
const pbox = async (scope, cs) => { const l = page.locator(`${scope} .puck`, { hasText: cs }).filter({ visible: true }); const n = await l.count(); for (let i = 0; i < n; i++) { const b = await l.nth(i).boundingBox(); if (b && b.x >= 0 && b.x < 380 && b.y > 60 && b.y < 800) return b } return null }
async function refuse(tag, how, scope, cs, rowFinder) {
  await rowFinder()
  const b = await pbox(scope, cs)
  if (!b) { log(tag, 'NO PUCK FOUND', cs, scope); return }
  await waitQuiet(page)
  const before = await snap()
  if (how === 'drag') await touchDrag(page, { x: b.x + b.width / 2, y: b.y + b.height / 2 }, { x: 372, y: b.y + 4 }, { settle: 150 })
  else await longPress(page, b.x + b.width / 2, b.y + b.height / 2, 900)
  const box = await toastBoxOf(page)
  log(tag, JSON.stringify(box))
  await shotP(page, 'rw1-4b-' + tag)
  log(tag, 'unchanged', before === await snap(), await snap())
  await sleep(2500)
}
/* Saber off the crowd row first (a long press), so ALL AVAIL stands alone */
await goWeek(page); await unfoldWeek(page, DI)
const wCrowd = () => weekRowTop(page, 'CROWD ONLY')
await wCrowd()
{
  const b = await pbox('#page-editsched .day:not(.peek) .sec-grnd .pl-row:has-text("CROWD ONLY")', 'Saber')
  if (b) { await touchDrag(page, { x: b.x + b.width / 2, y: b.y + b.height / 2 }, { x: 372, y: b.y + 4 }, { settle: 150 }); log('Saber out', await toastBoxOf(page), (await inputP(page, jid)).people) }
  await sleep(2500)
}
const wTrain = () => weekRowTop(page, '^TRAINING 17:00')
const WS = '#page-editsched .day:not(.peek) .sec-grnd .pl-row'
await refuse('1-week-drag-ranger', 'drag', WS + ':has-text("TRAINING")', 'Ranger', wTrain)
await refuse('2-week-longpress-ranger', 'press', WS + ':has-text("TRAINING")', 'Ranger', wTrain)
await refuse('3-week-drag-allavail', 'drag', WS + ':has-text("CROWD ONLY")', 'ALL AVAIL', wCrowd)
/* the board */
await goBoard(page, DI); await unfoldBoard(page, DI)
const BS = '#schedBoard .sb-panel.grnd .sb-arow'
const bRow = txt => async () => { const r = page.locator(`${BS}:visible`, { hasText: txt }).first(); await r.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400) }
await refuse('5-board-drag-ranger', 'drag', `${BS}:has-text("Ranger")`, 'Ranger', async () => { const r = page.locator(`${BS}:visible`).filter({ has: page.locator('.puck', { hasText: 'Ranger' }) }).filter({ hasNot: page.locator('textarea.ain[value="MY OWN ROW"]') }).first(); await r.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400) })
await refuse('6-board-longpress-ranger', 'press', `${BS}:has-text("Ranger")`, 'Ranger', async () => { const r = page.locator(`${BS}:visible`).filter({ has: page.locator('.puck', { hasText: 'Ranger' }) }).first(); await r.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400) })
await refuse('7-board-drag-allavail', 'drag', `${BS}:has-text("ALL AVAIL")`, 'ALL AVAIL', async () => { const r = page.locator(`${BS}:visible`).filter({ has: page.locator('.puck', { hasText: 'ALL AVAIL' }) }).first(); await r.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400) })
log('errs', errs)
await ctx.close(); await browser.close()
