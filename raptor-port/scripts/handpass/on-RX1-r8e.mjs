import * as L from './on-RX1-lib.mjs'
const J = o => JSON.stringify(o)
async function run(mode) {
  const W = await L.world({ tag: 'R8e' + mode })
  const { page, tid, shot, press } = W
  const iid = await L.usualSat(W, { goToBoard: mode === 'board' })
  const s0 = { ground: await L.groundNow(page), rec: await L.recOf(page, iid), undo: await L.undoState(page) }
  console.log(mode, 'search-like boxes', J(await page.evaluate(() => [...document.querySelectorAll('input[type=text], input[type=search], input:not([type])')].filter(e => e.getClientRects().length && /call|name|search|find/i.test(e.placeholder + e.id + e.className)).map(e => e.id + '.' + e.className + ' ph=' + e.placeholder))))
  let ppl
  if (mode === 'board') { await L.frameBoard(page); ppl = page.locator(L.rowSel(0)).locator('.ppl') }
  else { await L.frameGrnd(page); ppl = page.locator(`#eWeek .day:not(.peek) [data-fill="g:5.0.+"]`) }
  const pb = await ppl.boundingBox()
  await page.mouse.click(pb.x + pb.width - 12, pb.y + pb.height / 2); await page.waitForTimeout(400)
  console.log(mode, 'armed?', await page.evaluate(() => document.body.className + ' | ' + !!document.querySelector('.ros-arm, .armed, .addz.armed')))
  const box = mode === 'board' ? page.locator('input[placeholder*="callsign" i]:visible').first() : page.locator('#eRoster input:visible, input[placeholder*="callsign" i]:visible').first()
  const has = await box.count()
  console.log(mode, 'search box found', has)
  if (has) {
    await box.click(); await box.fill('Tally'); await page.keyboard.press('Enter'); await page.waitForTimeout(700)
    console.log(mode, 'after typing Tally + Enter: question', await tid('oilconf').count(), 'lead', await tid('oilconf-lead').innerText().catch(() => ''), 'bar', await tid('oilbar').count(), 'toast', await L.toast(page), 'ground', J(await L.groundNow(page)), 'same', J(await L.groundNow(page)) === J(s0.ground))
    await shot(`RX1-8-${mode}-3-search-typed`)
  }
  console.log(mode, 'errors', J(W.errors))
  await W.ctx.close()
}
await run('board'); await run('week')
process.exit(0)
