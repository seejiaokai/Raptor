// B4 — a row of several
import { launch, openWorld, fileInput, shot, rowIdx, rowData, inputOf, toastMark, toastsSince, undoRedo, saveJson, loadJson, errs, csId,
  toWeek, openBoard, centre, boardRowEl, boardRowNames, boardLines, drag2, rosterPuckOf, inputsSurf, closeDayWin, listRow, weekRowNames, weekLines } from './or-B-lib2.mjs'
const R = {}
const say = (k, v) => { R[k] = v; console.log(k, typeof v === 'string' ? v : JSON.stringify(v)) }
const browser = await launch()
const { page: p } = await openWorld(browser)
const DI = 2
const f = await fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-15', to: '2026-07-15', timed: ['17:00', '18:00'], title: 'Range sync' })
const iid = f[0].iid
say('filed', f)
await openBoard(p, DI)
const ri = await rowIdx(p, DI, iid)
const state = async (tag) => { const s = { input: (await inputOf(p, iid)).people, row: (await boardRowNames(p, DI, ri)).names, extra: await p.evaluate(([di, ri]) => JSON.stringify({ who: window.DAYS[di].ground[ri].who, more: window.DAYS[di].ground[ri].more }), [DI, ri]) }; say(tag, s); return s }
await state('start')
async function act(tag, srcWho, targetFn, { ur = true, pic } = {}) {
  const row = boardRowEl(p, DI, ri); await centre(row); await p.waitForTimeout(300)
  const src = await rosterPuckOf(p, '#sbRoster', srcWho)
  const before = await state(tag + ' BEFORE')
  const m = await toastMark(p)
  await drag2(p, src, await targetFn(row))
  const toasts = await toastsSince(p, m)
  say(tag + ' toasts', toasts)
  say(tag + ' oilq', await p.locator('[data-testid="oilconf"]').count())
  const after = await state(tag + ' AFTER')
  if (pic) { await centre(boardRowEl(p, DI, ri)); await shot(p, pic) }
  say(tag + ' changed', JSON.stringify(before) !== JSON.stringify(after))
  if (ur && JSON.stringify(before) !== JSON.stringify(after)) {
    await undoRedo(p, 'undo'); say(tag + ' undo toast', await p.evaluate(() => (document.getElementById('toastEl') || {}).innerText)); await state(tag + ' AFTER UNDO')
    await undoRedo(p, 'redo'); say(tag + ' redo toast', await p.evaluate(() => (document.getElementById('toastEl') || {}).innerText)); await state(tag + ' AFTER REDO')
  }
}
/* a: Tally onto Hunter's puck */
await act('a Tally on Hunter', 'Tally', async row => row.locator('.puck', { hasText: 'Hunter' }).first(), { pic: 's04-1-tally-joined' })
/* b: Tally from the crew list onto the row again (onto the people area / a puck) */
await act('b Tally again', 'Tally', async row => row.locator('.puck', { hasText: 'Ranger' }).first(), { pic: 's04-2-tally-again' })
/* c: ALL AVAIL on Hunter's puck */
await act('c ALL AVAIL on Hunter', 'ALL AVAIL', async row => row.locator('.puck', { hasText: 'Hunter' }).first(), { pic: 's04-3-allavail' })
/* d: ALL on the row */
await act('d ALL on row', 'ALL', async row => row.locator('.puck', { hasText: 'Ranger' }).first(), { pic: 's04-4-all-refused' })
/* e: ALL AVAIL again */
await act('e ALL AVAIL again', 'ALL AVAIL', async row => row.locator('.puck', { hasText: 'Drifter' }).first(), { pic: 's04-5-allavail-again' })
/* f: Anvil onto ALL AVAIL's puck */
await act('f Anvil on ALL AVAIL', 'Anvil', async row => row.locator('.puck', { hasText: 'ALL AVAIL' }).first(), { pic: 's04-6-anvil' })
/* every surface at the end */
await toWeek(p)
say('week row', await weekRowNames(p, DI, ri))
say('week lines', await weekLines(p, DI))
const sf = await inputsSurf(p, iid, '2026-07-15'); say('inputs surf', sf); await shot(p, 's04-7-card')
say('list', await listRow(p, iid))
say('errs', errs)
const all = loadJson('docs/handpass/parts/or-B.json'); all.B4 = R; saveJson('docs/handpass/parts/or-B.json', all)
await browser.close()
