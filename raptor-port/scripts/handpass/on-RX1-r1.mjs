import * as L from './on-RX1-lib.mjs'
import { warnRead, ensureOpen } from './on-RX1-warn.mjs'
const W = await L.world({ tag: 'R1' })
const { page, tid, shot, press } = W
const iid = await L.fileIt(W, L.SAT, { type: 'OD', people: ['bane'] })
console.log('OD', await L.recOf(page, iid))
await L.plainRow(W, L.SAT_DI, 0, 'Hangar open day', '13:00', '15:00', ['rocky'])
await L.closeBoard(W); await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
await L.frameGrnd(page); await ensureOpen(page)
const src = `#eWeek .day:not(.peek) [data-slot="g:${L.SAT_DI}.0"] .puck`
const tgt = `#eWeek .day:not(.peek) [data-inpseat="${iid}"] .puck`
const J = o => JSON.stringify(o)
const S = async () => ({ warn: await warnRead(page), ground: await L.groundNow(page), rec: await L.recOf(page, iid), undo: await L.undoState(page) })
await L.frameGrnd(page); await page.waitForTimeout(300)
const b0 = await S()
console.log('BEFORE', J(b0))
await shot('RX1-1-0-before')
await L.drag(page, page.locator(src), page.locator(tgt))
const q = {
  up: await tid('oilconf').count(), lead: await tid('oilconf-lead').innerText().catch(() => 'NO'),
  btns: [await tid('oilconf-cancel').innerText().catch(() => ''), await tid('oilconf-save').innerText().catch(() => '')],
  measure: await L.measure(page, '[data-testid="oilconf"] .airpop-box'),
}
console.log('QUESTION', J(q))
const b1 = await S()
console.log('BEHIND_Q', J(b1))
console.log('behind same warn:', J(b1.warn) === J(b0.warn), 'ground same', J(b1.ground) === J(b0.ground), 'rec same', b1.rec === b0.rec, 'undo same', b1.undo === b0.undo)
await W.hush(); await shot('RX1-1-1-question'); await W.unhush()
await press(tid('oilconf-cancel')); await page.waitForTimeout(100)
const fl1 = await L.flashing(page, [src, tgt]); console.log('FLASH1 (100ms)', J(fl1))
await shot('RX1-1-2-after-dont-swap-100ms')
await page.waitForTimeout(600)
const b2 = await S()
console.log('BAR', await tid('oilbar-text').innerText().catch(() => 'NO'), J(await L.measure(page, '[data-testid="oilbar"]')))
console.log('AFTER_DONT', J(b2))
console.log('after same warn:', J(b2.warn) === J(b0.warn), 'ground same', J(b2.ground) === J(b0.ground), 'rec same', b2.rec === b0.rec, 'undo same', b2.undo === b0.undo)
await W.hush(); await shot('RX1-1-3-bar-up'); await W.unhush()
// Answer OIL -> Dont swap again
await press(tid('oilbar-answer')); await page.waitForTimeout(400)
console.log('question back', await tid('oilconf').count(), await tid('oilconf-lead').innerText().catch(() => 'NO'), 'bar', await tid('oilbar').count())
await press(tid('oilconf-cancel')); await page.waitForTimeout(80)
const fl2 = await L.flashing(page, [src, tgt]); console.log('FLASH2 (80ms)', J(fl2))
await shot('RX1-1-4-second-dont-swap-fast')
await page.waitForTimeout(700)
const b3 = await S()
console.log('bar2', await tid('oilbar').count(), await tid('oilbar-text').innerText().catch(() => 'NO'))
console.log('after2 same warn:', J(b3.warn) === J(b0.warn), 'ground', J(b3.ground) === J(b0.ground), 'undo', b3.undo === b0.undo)
await W.hush(); await shot('RX1-1-5-bar-again'); await W.unhush()
console.log('errors', J(W.errors))
L.note({ id: 'RX1-1', b0, q, b1, fl1, b2, fl2, b3, errors: W.errors })
await W.ctx.close(); process.exit(0)
