// D3 — refusals by touch
import { open, fileInput, shot, sleep, log, goWeek, errs, browser, DI, csId, press, toastBox, inputsOf, allInputs, weekGroundText, undoState, rowTopRe, dragPlaceholder, inlineCrew, touchDrag, unfoldWeek } from './or-D-lib.mjs'
const { ctx, page } = await open()
await fileInput(page, { type: 'Personal', person: 'Anvil', from: '2026-07-15', to: '2026-07-15', timed: ['09:00', '10:00'] })
await fileInput(page, { type: 'Fly with', person: 'Piston', from: '2026-07-15', to: '2026-07-15', timed: ['11:00', '12:00'] })
await fileInput(page, { type: 'Training', person: 'Ranger', from: '2026-07-13', to: '2026-07-15', timed: ['16:00', '17:00'], title: 'Long course', oil: 'no' })
const mine = async () => (await allInputs(page)).filter(r => (r.type === 'Personal' || (r.type === 'Fly with' && r.date === 'Jul 15') || r.title === 'Long course'))
log('D3 inputs filed', await mine())
await goWeek(page)
const snap = async () => JSON.stringify({ inputs: await mine(), rows: await weekGroundText(page), undo: await undoState(page) })
async function refusal(id, label, act) {
  const before = await snap()
  const out = await act()
  const note = await toastBox(page)
  await shot(page, `D3-${id}-note`)
  await sleep(200)
  const after = await snap()
  log(`D3 ${id} ${label}`, JSON.stringify({ note, unchanged: before === after, dragFrom: out }))
  if (before !== after) log(`D3 ${id} DIFF before`, before, 'after', after)
  await sleep(2500)
}
// 1) ALL AVAIL onto the Personal input's row
await refusal('a', 'ALL AVAIL onto the Personal row', async () => { const row = await rowTopRe(page, '^PERSONAL 09:00'); return await dragPlaceholder(page, 'allavail', row) })
await goWeek(page)
// 2) ALL AVAIL onto the Fly with row
await refusal('b', 'ALL AVAIL onto the Fly with row', async () => { const row = await rowTopRe(page, '^FLY WITH 11:00'); return await dragPlaceholder(page, 'allavail', row) })
await goWeek(page)
// 3) ALL AVAIL onto the three-day Training's row (it is drawn on its first day, Monday)
await refusal('c', 'ALL AVAIL onto the three-day Training row', async () => { const row = await rowTopRe(page, 'LONG COURSE'); return await dragPlaceholder(page, 'allavail', row) })
await goWeek(page)
// 4) a named person (Blade) onto the Personal row
await refusal('d', 'Blade onto the Personal row', async () => {
  const row = await rowTopRe(page, '^PERSONAL 09:00'); const bl = await inlineCrew(page, 'Blade'); const pb = await row.locator('.ppl').boundingBox()
  if (!bl) return 'no Blade in the crew list'
  await touchDrag(page, { x: bl.b.x + bl.b.width / 2, y: bl.b.y + bl.b.height / 2 }, { x: pb.x + 40, y: pb.y + pb.height - 6 }, { settle: 150 }); return bl.b })
await goWeek(page)
// 5) the last person off: Ranger off the Long course row
await refusal('e', 'the last person (Ranger) dragged off the Long course row', async () => {
  const row = await rowTopRe(page, 'LONG COURSE'); const pk = row.locator('.puck', { hasText: 'Ranger' }).first(); const b = await pk.boundingBox()
  await touchDrag(page, { x: b.x + b.width / 2, y: b.y + b.height / 2 }, { x: 200, y: b.y + 150 }, { settle: 150 }); return b })
log('D3 final: Ranger back on the row?', JSON.stringify(await weekGroundText(page)))
log('D3 errs', errs)
await ctx.close(); await browser.close()
