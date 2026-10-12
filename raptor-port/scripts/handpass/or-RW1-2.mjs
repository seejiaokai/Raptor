// B3 — a swap the seat refuses
import { launch, openWorld, fileInput, shot, rowIdx, rowData, inputOf, toastMark, toastsSince, undoRedo, saveJson, loadJson, errs, csId, shotP, toastNow, waitQuiet, undoTitle,
  toWeek, openBoard, centre, boardRowEl, boardRowNames, boardLines, drag2, rosterPuckOf, inputsSurf, listRow } from './or-RW1-lib.mjs'
const R = {}
const log2 = (k,v)=>console.log(k, JSON.stringify(v))
const say = (k, v) => { R[k] = v; console.log(k, typeof v === 'string' ? v : JSON.stringify(v)) }
const browser = await launch()
const { page: p } = await openWorld(browser)
const DI = 4
await openBoard(p, DI)
const nBefore = await p.evaluate(() => window.DAYS[4].ground.length)
say('ground rows before', nBefore)
await p.locator('#schedBoard .sb-panel.grnd button:has-text("+ Item"):visible').first().click(); await p.waitForTimeout(500)
const nAfter = await p.evaluate(() => window.DAYS[4].ground.length)
say('ground rows after +Item', nAfter)
const mi = nAfter - 1
/* title it so it is findable */
const t = p.locator(`#schedBoard [data-bfld="gr:${DI}.${mi}.prog"]:visible`).first()
await t.click(); await t.fill('MY OWN ROW'); await t.blur(); await p.waitForTimeout(300)
for (const who of ['Tally', 'Ranger']) {
  const row = boardRowEl(p, DI, mi); await centre(row); await p.waitForTimeout(300)
  const pk = await rosterPuckOf(p, '#sbRoster', who)
  const m = await toastMark(p)
  await drag2(p, pk, row.locator('.addz, .ppl').first())
  say('put ' + who, await toastsSince(p, m))
}
say('own row', await boardRowNames(p, DI, mi))
say('own row data', await rowData(p, DI, 'x').catch(() => null))
/* the Training for Ranger alone */
const f = await fileInput(p, { type: 'Training', person: 'Ranger', from: '2026-07-17', to: '2026-07-17', timed: ['17:00', '18:00'] })
const iid = f[0].iid
say('filed', f)
await openBoard(p, DI)
const ri = await rowIdx(p, DI, iid)
const myIdx = await p.evaluate(() => window.DAYS[4].ground.findIndex(g => g.prog === 'MY OWN ROW'))
say('ri / own row idx', [ri, myIdx])
say('own row after filing', await boardRowNames(p, DI, myIdx))
say('training row', await boardRowNames(p, DI, ri))
const before = { input: await inputOf(p, iid), own: await p.evaluate(i => JSON.stringify(window.DAYS[4].ground[i].who) + '|' + JSON.stringify(window.DAYS[4].ground[i].more), myIdx), train: await rowData(p, DI, iid) }
say('before', before)
const rowT = boardRowEl(p, DI, ri), rowO = boardRowEl(p, DI, myIdx)
await centre(rowT); await p.waitForTimeout(300)
await shotP(p, 'rw1-2-1-before')
const tallyPuck = rowO.locator('.puck', { hasText: 'Tally' }).first()
say('tally puck on own row visible', await tallyPuck.isVisible())
await waitQuiet(p); log2('undo title before', await undoTitle(p))
const m0 = await toastMark(p)
await drag2(p, tallyPuck, rowT.locator('.puck').first())
say('toasts', await toastsSince(p, m0))
say('toast now', await p.evaluate(() => (document.getElementById('toastEl') || {}).innerText))
await shotP(p, 'rw1-2-2-after-refusal')
log2('undo title after', await undoTitle(p))
say('oilq', await p.locator('[data-testid="oilconf"]').count())
const after = { input: await inputOf(p, iid), own: await p.evaluate(i => JSON.stringify(window.DAYS[4].ground[i].who) + '|' + JSON.stringify(window.DAYS[4].ground[i].more), myIdx), train: await rowData(p, DI, iid) }
say('after', after)
say('unchanged', JSON.stringify(before) === JSON.stringify(after))
say('own row names after', await boardRowNames(p, DI, myIdx))
say('training row names after', await boardRowNames(p, DI, ri))
/* no undo step: press Undo once and see what it takes back */
const u = await undoRedo(p, 'undo'); say('undo used', u)
say('undo toast', await p.evaluate(() => (document.getElementById('toastEl') || {}).innerText))
say('input exists after undo', await inputOf(p, iid))
say('own row after undo', await boardRowNames(p, DI, myIdx))
await shotP(p, 'rw1-2-3-after-undo')
const rd = await undoRedo(p, 'redo'); say('redo used', rd)
say('redo toast', await p.evaluate(() => (document.getElementById('toastEl') || {}).innerText))
say('input after redo', await inputOf(p, iid))
say('errs', errs)
await browser.close()
