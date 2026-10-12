// RW1-1 — B8 again: a Personal input for Ranger (Thu 16 Jul 19:00-20:00): Tally dropped on his puck; a man from a flying seat; the "+ add" drop
import { launch, openWorld, fileInput, shotP, rowIdx, inputOf, toastMark, toastsSince, errs, toWeek, openBoard, centre, boardRowEl, boardRowNames, weekRowEl, weekRowNames, drag2, drag3, rosterPuckOf, toastNow, waitQuiet, undoTitle, log, undoRedo } from './or-RW1-lib.mjs'
const browser = await launch()
const { page: p } = await openWorld(browser)
const DI = 3
const pe = (await fileInput(p, { type: 'Personal', person: 'Ranger', from: '2026-07-16', to: '2026-07-16', timed: ['19:00', '20:00'] }))[0].iid
log('filed', await inputOf(p, pe))
const ri = await rowIdx(p, DI, pe)
log('ri', ri)
const seatsOf = () => p.evaluate(() => { const a = window.DAYS[3].waves[0].formations[0].aircraft[0]; const c = id => (window.PEOPLE[id] || {}).cs || id || null; return { p: c(a.p), w: c(a.w) } })
log('seats Thu w1 f1 a1 before', await seatsOf())

/* (a) Tally from the crew list onto Ranger's puck, on the board */
await openBoard(p, DI)
let row = boardRowEl(p, DI, ri); await centre(row); await p.waitForTimeout(300)
await waitQuiet(p)
const u0 = await undoTitle(p)
log('undo before', u0)
let before = { people: (await inputOf(p, pe)).people, row: (await boardRowNames(p, DI, ri)).names }
log('a before', before)
await shotP(p, 'rw1-1-a0-before')
let m = await toastMark(p)
await drag2(p, await rosterPuckOf(p, '#sbRoster', 'Tally'), row.locator('.puck').first())
log('a toasts', await toastsSince(p, m)); log('a toast now', await toastNow(p))
log('a oilq', await p.locator('[data-testid="oilconf"]').count())
let after = { people: (await inputOf(p, pe)).people, row: (await boardRowNames(p, DI, ri)).names }
log('a after', after, 'unchanged', JSON.stringify(before) === JSON.stringify(after))
log('undo after', await undoTitle(p))
await shotP(p, 'rw1-1-a1-tally-on-puck-board')

/* (b) the "+ add" drop */
await waitQuiet(p)
row = boardRowEl(p, DI, ri); await centre(row); await p.waitForTimeout(300)
m = await toastMark(p)
const addz = row.locator('.addz').first()
log('addz count', await addz.count())
await drag2(p, await rosterPuckOf(p, '#sbRoster', 'Tally'), addz)
log('b toasts', await toastsSince(p, m)); log('b toast now', await toastNow(p))
after = { people: (await inputOf(p, pe)).people, row: (await boardRowNames(p, DI, ri)).names }
log('b after', after, 'unchanged', JSON.stringify(before) === JSON.stringify(after))
log('undo after b', await undoTitle(p))
await shotP(p, 'rw1-1-b1-tally-on-add')

/* (c) a man from a flying seat onto the puck (on the week) */
await waitQuiet(p)
await toWeek(p)
const seatCs = (await seatsOf())
const useSeat = seatCs.p === 'Ranger' ? 'w' : 'p'
log('using seat', useSeat, seatCs)
const seatEl = p.locator(`#eWeek .day:not(.peek) [data-slot="3.0.0.0.${useSeat}"]`).first()
const wrow = weekRowEl(p, DI, ri)
await centre(wrow); await p.waitForTimeout(300)
await shotP(p, 'rw1-1-c0-before')
const sBefore = await seatsOf()
m = await toastMark(p)
await drag3(p, seatEl.locator('.puck').first(), wrow.locator('.puck').first())
log('c toasts', await toastsSince(p, m)); log('c toast now', await toastNow(p))
const sAfter = await seatsOf()
log('c seats before/after', sBefore, sAfter)
log('c input', (await inputOf(p, pe)).people)
log('c week row', (await weekRowNames(p, DI, ri)).names)
log('undo after c', await undoTitle(p))
await shotP(p, 'rw1-1-c1-seat-onto-puck-week')
await seatEl.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(300)
await shotP(p, 'rw1-1-c2-seat-after')
/* Undo: what does it take back (should be nothing of these) */
const u = await undoRedo(p, 'undo'); log('undo used', u, 'toast', await toastNow(p))
log('input after undo', (await inputOf(p, pe)).people, 'seats', await seatsOf())
log('errs', errs)
await browser.close()
