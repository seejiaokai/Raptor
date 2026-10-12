// RW1-6 — the ordinary join, leave and move still say their notes (board, desktop)
import { launch, openWorld, fileInput, shotP, rowIdx, inputOf, toastMark, toastsSince, errs, openBoard, centre, boardRowEl, boardRowNames, boardLines, drag2, rosterPuckOf, toastNow, waitQuiet, undoRedo, log } from './or-RW1-lib.mjs'
const browser = await launch()
const { page: p } = await openWorld(browser)
const DI = 2
const mid = (await fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-15', to: '2026-07-15', timed: ['17:00', '18:00'], title: 'Range sync' }))[0].iid
const tid = (await fileInput(p, { type: 'Training', person: 'Anvil', from: '2026-07-15', to: '2026-07-15', timed: ['19:00', '20:00'] }))[0].iid
log('filed', await inputOf(p, mid), await inputOf(p, tid))
await openBoard(p, DI)
const rm = await rowIdx(p, DI, mid), rt = await rowIdx(p, DI, tid)
log('rows', rm, rt)
const ppl = async id => (await inputOf(p, id)).people
/* 1 join: Tally from the crew list onto the row's "+ add" */
let row = boardRowEl(p, DI, rm); await centre(row); await p.waitForTimeout(300); await waitQuiet(p)
let m = await toastMark(p)
await drag2(p, await rosterPuckOf(p, '#sbRoster', 'Tally'), row.locator('.addz').first())
log('1 join toasts', await toastsSince(p, m), '| now', await toastNow(p), '| people', await ppl(mid), '| row', (await boardRowNames(p, DI, rm)).names)
await shotP(p, 'rw1-6-1-join')
/* 2 leave: right-click Tally's puck */
await waitQuiet(p)
row = boardRowEl(p, DI, rm); await centre(row); await p.waitForTimeout(300)
m = await toastMark(p)
await row.locator('.puck', { hasText: 'Tally' }).first().click({ button: 'right' }); await p.waitForTimeout(700)
log('2 leave toasts', await toastsSince(p, m), '| now', await toastNow(p), '| people', await ppl(mid), '| row', (await boardRowNames(p, DI, rm)).names)
await shotP(p, 'rw1-6-2-leave')
/* 3 move: Drifter from the Meeting row onto the Training row's puck */
await waitQuiet(p)
row = boardRowEl(p, DI, rm); await centre(row); await p.waitForTimeout(300)
const target = boardRowEl(p, DI, rt).locator('.puck').first()
log('both rows visible?', await row.isVisible(), await target.isVisible(), await target.boundingBox())
m = await toastMark(p)
await drag2(p, row.locator('.puck', { hasText: 'Drifter' }).first(), target)
log('3 move toasts', await toastsSince(p, m), '| now', await toastNow(p), '| meeting', await ppl(mid), '| training', await ppl(tid))
log('rows after', (await boardRowNames(p, DI, rm)).names, (await boardRowNames(p, DI, rt)).names)
await shotP(p, 'rw1-6-3-move')
const u = await undoRedo(p, 'undo'); log('undo toast', await toastNow(p), '| meeting', await ppl(mid), '| training', await ppl(tid))
log('errs', errs)
await browser.close()
