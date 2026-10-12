// D2 — a person taken off the row by a finger, on the week and on the board
import { open, fileInput, shot, sleep, log, goWeek, goBoard, errs, browser, DI, csId, press, toast, toastBox, inputsOf, inputsPages, schedSurfaces, weekRowToTop, touchDrag, unfoldBoard } from './or-D-lib.mjs'
const { ctx, page } = await open()
const f = await fileInput(page, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Blade'], from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: 'Range brief' })
const iid = f[0].iid
log('D2 filed', f)
const ppl = async () => (await inputsOf(page, 'Range brief'))[0].people
async function longPress(x, y, ms = 900) {
  const c = await page.context().newCDPSession(page)
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); await sleep(ms)
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await c.detach().catch(() => {}); await sleep(500)
}
// ---- the week
await goWeek(page)
let row = await weekRowToTop(page, 'Range brief')
const puckBox = async (cs, scope) => { const l = page.locator(`${scope} .puck`, { hasText: cs }).filter({ visible: true }); const n = await l.count(); for (let i = 0; i < n; i++) { const b = await l.nth(i).boundingBox(); if (b && b.x >= 0 && b.x < 390) return b } return null }
let hb = await puckBox('Hunter', '#page-editsched .day:not(.peek) .sec-grnd .pl-row:has-text("RANGE BRIEF")')
log('D2 week Hunter puck', hb)
await shot(page, 'D2-01-week-before')
// 1. a long press on his puck (a finger's right-click)
await longPress(hb.x + hb.width / 2, hb.y + hb.height / 2)
log('D2 week long-press: note', await toastBox(page), 'people', await ppl())
await shot(page, 'D2-02-week-longpress')
// 2. drag his puck off to a place with nothing on it (the day card's right-hand margin)
row = await weekRowToTop(page, 'Range brief')
hb = await puckBox('Hunter', '#page-editsched .day:not(.peek) .sec-grnd .pl-row:has-text("RANGE BRIEF")')
log('D2 week Hunter puck again', hb)
const dropAt = { x: 372, y: hb.y + 4 }
log('D2 what is under the drop point', await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className + ' | ' + (e.closest('[data-slot],[data-fill]')?.getAttribute('data-slot') || e.closest('[data-fill]')?.getAttribute('data-fill') || 'no target') : null }, [dropAt.x, dropAt.y]))
await touchDrag(page, { x: hb.x + hb.width / 2, y: hb.y + hb.height / 2 }, dropAt, { settle: 150 })
log('D2 week drag-off: note', await toastBox(page), 'people', await ppl())
await shot(page, 'D2-03-week-dragoff')
const sw = await schedSurfaces(page, 'Range brief'); log('D2 sched after the week drag-off', JSON.stringify(sw))
const pw = await inputsPages(page, iid, { picDay: 'D2-04-after-week', title: 'Range brief', win: false }); log('D2 pages after the week drag-off', JSON.stringify(pw))
// ---- the board
await goBoard(page); await unfoldBoard(page)
const brow = page.locator('#schedBoard .sb-panel.grnd .sb-arow:visible', { hasText: 'Drifter' }).first()
await brow.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400)
await shot(page, 'D2-05-board-before')
const bpuck = async cs => { const l = brow.locator('.puck', { hasText: cs }); const n = await l.count(); for (let i = 0; i < n; i++) { const b = await l.nth(i).boundingBox(); if (b && b.x >= 0 && b.x < 390) return b } return null }
let bb = await bpuck('Blade'); log('D2 board Blade puck', bb)
await longPress(bb.x + bb.width / 2, bb.y + bb.height / 2)
log('D2 board long-press: note', await toastBox(page), 'people', await ppl())
await shot(page, 'D2-06-board-longpress')
bb = await bpuck('Blade')
const bdrop = { x: 372, y: bb.y + 4 }
log('D2 board under the drop point', await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className : null }, [bdrop.x, bdrop.y]))
await touchDrag(page, { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }, bdrop, { settle: 150 })
log('D2 board drag-off: note', await toastBox(page), 'people', await ppl())
await shot(page, 'D2-07-board-dragoff')
const sb = await schedSurfaces(page, 'Range brief'); log('D2 sched after the board drag-off', JSON.stringify(sb))
log('D2 errs', errs)
await ctx.close(); await browser.close()
