import { world, fileInput, pic, sleep, go, openBoard, oilOn, reanswer, openCount, tabTo, winState, closeWin, seatTap, undoRedo } from './aa-B-lib.mjs'
import { groundIdx, putExtra, tapRowSeat, rowSeat } from './aa-B-rows.mjs'
async function run(name, typed, tapW, tapP) {
  const w = await world('desk'); w.tag = 'p11' + name
  const { page } = w
  const rmk = 'p11' + name
  const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk, s: '09:00', e: '12:00', oil: 'no' })
  const iid = f.rec.iid
  const snap = (l) => page.evaluate(([l, i]) => name + ' ' + l + ' :: oil=' + JSON.stringify((window.INPUTS.find(x => x.iid === i) || {}).oil) + ' undoTitle=' + (document.querySelector('#undoBtn,#sbUndo') || {}).title + ' redoDisabled=' + (document.querySelector('#redoBtn,#sbRedo') || {}).disabled, [l, iid]).then(s => s.replace('name', name))
  await openBoard(page, 5)
  if (typed) { const slot = await groundIdx(page, rmk); await putExtra(page, slot, 'dice') }
  await oilOn(page, true)
  if (tapP) await tapRowSeat(page, rmk, 'dice')
  if (tapW) { await openCount(page, iid); await tabTo(page, 'earn'); await seatTap(page, 'glass'); await closeWin(page) }
  await reanswer(page, iid, 'yes'); console.log(await snap('answered'))
  await openBoard(page, 5); if (process.env.OILUNDO) await oilOn(page, true)
  for (let i = 1; i <= 2; i++) { await page.locator('#sbUndo').click(); await sleep(700); console.log(await snap('UNDO #' + i)) }
  await w.browser.close()
}

await run('V5', false, false, false)
await run('V6', true, true, true)
