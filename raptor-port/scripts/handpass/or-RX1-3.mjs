// RX1-3 — a drop that JOINS a Personal input: board + add (Drifter), week (Hunter), one Undo takes Hunter out
import { launch, openWorld, fileX, shotX, rowIdx, inputOf, errs, toWeek, openBoard, centre, weekRowEl, weekRowNames, boardRowEl, boardRowNames, weekLines, boardLines, inputsSurf, closeDayWin, listRow, log, drag2, drag3, rosterPuckOf, toastMark, toastsSince, toastNow, waitQuiet, undoTitle, undoRedo } from './or-RX1-lib.mjs'
const browser = await launch()
const { page: p } = await openWorld(browser, { fresh: false })
const DI = 3
const f = await fileX(p, { type: 'Personal', person: 'Ranger', from: '2026-07-16', to: '2026-07-16', timed: ['19:00', '20:00'] })
const iid = f.made[0].iid
log('filed', f.made, 'oil', f.oilSeen)
const ri = await rowIdx(p, DI, iid)
const ppl = async () => (await inputOf(p, iid)).people
/* board: Drifter onto the row's + add */
await openBoard(p, DI)
let row = boardRowEl(p, DI, ri); await centre(row); await p.waitForTimeout(300); await waitQuiet(p)
await shotX(p, 'rx1-3-1-board-before')
log('addz count on board row', await row.locator('.addz').count())
let m = await toastMark(p)
await drag2(p, await rosterPuckOf(p, '#sbRoster', 'Drifter'), row.locator('.addz').first())
log('board toasts', await toastsSince(p, m), '| now', await toastNow(p), '| oilq', await p.locator('[data-testid="oilconf"]').count())
log('people', await ppl(), 'board row', (await boardRowNames(p, DI, ri)).names, 'lines', await boardLines(p, DI))
await shotX(p, 'rx1-3-2-board-after-drifter')
const sf = await inputsSurf(p, iid, '2026-07-16'); log('card', sf); await shotX(p, 'rx1-3-3-card-two')
await closeDayWin(p)
/* week: Hunter */
await waitQuiet(p)
await toWeek(p)
row = weekRowEl(p, DI, ri); await centre(row); await p.waitForTimeout(300)
log('week addz count', await row.locator('.addz').count())
m = await toastMark(p)
const hunter = await rosterPuckOf(p, '#eRoster', 'Hunter')
await drag3(p, hunter, weekRowEl(p, DI, ri).locator('.addz').first())
log('week toasts', await toastsSince(p, m), '| now', await toastNow(p))
log('people after Hunter', await ppl(), 'week row', (await weekRowNames(p, DI, ri)).names, 'lines', await weekLines(p, DI))
await centre(weekRowEl(p, DI, ri)); await p.waitForTimeout(200)
await shotX(p, 'rx1-3-4-week-after-hunter')
log('undo title', await undoTitle(p))
/* one Undo */
const u = await undoRedo(p, 'undo'); log('undo used', u, 'toast', await toastNow(p))
log('people after one Undo', await ppl(), 'week row', (await weekRowNames(p, DI, ri)).names)
await centre(weekRowEl(p, DI, ri)); await p.waitForTimeout(200)
await shotX(p, 'rx1-3-5-week-after-undo')
log('errs', errs)
await browser.close()
