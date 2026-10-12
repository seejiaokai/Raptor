import * as L from './on-RX1-lib.mjs'
const J = o => JSON.stringify(o)
async function run(mode) {
  const W = await L.world({ tag: 'R8c' + mode })
  const { page, tid, shot, press } = W
  const iid = await L.usualSat(W, { goToBoard: mode === 'board' })
  const active = () => page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + '.' + String(a.className).slice(0, 30) + ' [' + (a.getAttribute('data-bfld') || a.getAttribute('data-txt') || a.id || '') + ']' : 'none' })
  let box
  if (mode === 'board') { await L.frameBoard(page); box = page.locator(`#sbBoard [data-bfld="gr:5.0.prog"]`) }
  else { await L.frameGrnd(page); box = page.locator(`#eWeek .day:not(.peek) [data-txt="gr:5.0.prog"]`) }
  const s0 = { ground: await L.groundNow(page), rec: await L.recOf(page, iid), undo: await L.undoState(page) }
  await box.click(); await page.waitForTimeout(300)
  console.log(mode, 'clicked the name box: active', await active(), 'text', J(await box.evaluate(e => e.value ?? e.textContent)))
  await page.keyboard.press('Control+a'); await page.keyboard.type('Tally'); await page.waitForTimeout(300)
  await shot(`RX1-8-${mode}-1-typed`)
  await page.keyboard.press(mode === 'board' ? 'Tab' : 'Tab'); await page.waitForTimeout(700)
  console.log(mode, 'after Tab: question', await tid('oilconf').count(), 'bar', await tid('oilbar').count(), 'toast', await L.toast(page))
  console.log(mode, 'ground', J(await L.groundNow(page)), 'rec', await L.recOf(page, iid), 'undo same', (await L.undoState(page)) === s0.undo)
  await shot(`RX1-8-${mode}-2-after-tab`)
  // week: also the people cell
  console.log(mode, 'errors', J(W.errors))
  await W.ctx.close()
}
await run('board'); await run('week')
process.exit(0)
