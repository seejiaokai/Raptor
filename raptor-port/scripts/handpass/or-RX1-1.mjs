// RX1-1 — Personal input of three (Ranger, Hex, Hunter) Thu 16 Jul 19:00-20:00, every surface
import { launch, openWorld, fileX, shotX, rowIdx, rowData, inputOf, errs, toWeek, openBoard, centre, weekRowEl, weekRowNames, boardRowEl, boardRowNames, weekLines, boardLines, inputsSurf, closeDayWin, listRow, windowRead, log, as, bellRead, WIN, csId, closeWindow } from './or-RX1-lib.mjs'
const browser = await launch()
const { page: p } = await openWorld(browser, { fresh: false })
const DI = 3
const r = await fileX(p, { type: 'Personal', people: ['Ranger', 'Hex', 'Hunter'], from: '2026-07-16', to: '2026-07-16', timed: ['19:00', '20:00'] })
log('filed', r)
const iid = r.made[0].iid
log('inputs', await inputOf(p, iid))
const ri = await rowIdx(p, DI, iid)
log('ri', ri, 'rowData', await rowData(p, DI, iid))
await toWeek(p)
const wr = weekRowEl(p, DI, ri); await centre(wr); await p.waitForTimeout(300)
log('week row', await weekRowNames(p, DI, ri))
log('week lines', await weekLines(p, DI))
await centre(weekRowEl(p, DI, ri)); await shotX(p, 'rx1-1-1-week-row')
// the Personal Inputs line
const ln = p.locator('#eWeek .day:not(.peek) .sec-inp .pl-row').first(); await ln.evaluate(e => e.scrollIntoView({ block: 'center' })); await shotX(p, 'rx1-1-2-week-personal-line')
await openBoard(p, DI)
log('board row', await boardRowNames(p, DI, ri))
log('board lines', await boardLines(p, DI))
const br = boardRowEl(p, DI, ri); await centre(br); await shotX(p, 'rx1-1-3-board-row')
const bl = p.locator('#schedBoard .pinp .sb-arow').first(); if (await bl.count()) { await bl.evaluate(e => e.scrollIntoView({ block: 'center' })); await shotX(p, 'rx1-1-4-board-personal-line') }
// Inputs calendar
const sf = await inputsSurf(p, iid, '2026-07-16'); log('inputs surf', sf); await shotX(p, 'rx1-1-5-calendar-day-card')
// the window from the card
const wsurf = await windowRead(p, iid); log('window', wsurf); await shotX(p, 'rx1-1-6-input-window')
await closeWindow(p); await closeDayWin(p)
// month bar picture
await p.screenshot({ path: 'docs/img/handpass/2026-10-12-one-rule/RX1/rx1-1-5b-month.png' })
log('list', await listRow(p, iid))
await shotX(p, 'rx1-1-7-list-desktop')
// bells
await as(p, 'Ranger'); log('ranger bell', await bellRead(p, { close: false })); await shotX(p, 'rx1-1-8-ranger-bell'); await p.locator('#notifyBell').click().catch(() => {})
await p.waitForTimeout(250)
await as(p, 'Hex'); log('hex bell', await bellRead(p, { close: false })); await shotX(p, 'rx1-1-9-hex-bell'); await p.locator('#notifyBell').click().catch(() => {})
await p.waitForTimeout(250)
await as(p, 'Saber')
log('errs', errs)
await browser.close()
