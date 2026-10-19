console.log('B s08y v1 (+ Wave sheet and the dots menu, after a changed box, phone board)')
import { launch, open, sleep, shot, tap, rec, bfld, model, finish } from './lib.mjs'
const b = await launch()
const goBoard = async (p, d) => { await p.evaluate(() => window.go('editsched')); await sleep(800); await p.evaluate(x => window.openScheduler(x), d); await p.waitForSelector('#schedBoard'); await sleep(900) }
const changeBoard = async p => { await tap(p, bfld(p, 'ff:3.0.0.rl')); await p.keyboard.type('0930'); await sleep(150) }
const nWave = p => p.evaluate(() => window.DAYS[3].waves.length)
let ctx, p
for (const pre of [false, true]) {
  ;({ ctx, p } = await open(b)); await goBoard(p, 3)
  const w0 = await nWave(p)
  if (pre) await changeBoard(p)
  await tap(p, p.locator('#sbBoard [data-wvadd]').first(), { block: 'nearest' }); await sleep(400)
  const sheetVis = await p.getByText('Flying wave', { exact: true }).first().isVisible().catch(() => false)
  const pic1 = await shot(p, `B08y-wave-sheet-${pre ? 'after-change' : 'baseline'}`)
  let w1 = w0
  if (sheetVis) { await p.getByText('Flying wave', { exact: true }).first().evaluate(e => e.scrollIntoView({ block: 'center' })); const bb = await p.getByText('Flying wave', { exact: true }).first().boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(600); w1 = await nWave(p) }
  const rl = (await model(p, 3, 0, 0)).rl
  rec(pre ? 'B4' : 'B4base', pre ? 'board: change R, then "+ Wave" (first press), then the sheet\'s "Flying wave"' : 'board baseline: "+ Wave" then "Flying wave", no box changed', 'sheet opens on the first press; exactly one wave added; R saved (after-change case)', { sheetOpenedFirstPress: sheetVis, wavesBefore: w0, wavesAfter: w1, rl }, sheetVis && w1 === w0 + 1 && (!pre || rl === '09:30') ? 'PASS' : 'FAIL', pic1)
  await ctx.close()
}
for (const pre of [false, true]) {
  ;({ ctx, p } = await open(b)); await goBoard(p, 3)
  if (pre) await changeBoard(p)
  await tap(p, p.locator('#sbMore'), { block: 'nearest' }); await sleep(400)
  const open1 = await p.locator('[role=menuitem],button,div,span').filter({ hasText: /^s*.{0,3}s*Sort alls*$/ }).first().isVisible().catch(() => false)
  const pic = await shot(p, `B08y-more-${pre ? 'after-change' : 'baseline'}`)
  let closed = null
  if (open1) { const t = p.locator('[role=menuitem],button,div,span').filter({ hasText: /^s*.{0,3}s*Sort alls*$/ }).first(); const bb = await t.boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(600); closed = !(await t.isVisible().catch(() => false)) }
  const rl = (await model(p, 3, 0, 0)).rl
  rec(pre ? 'B5' : 'B5base', pre ? 'board: change R, tap the dots button, then Sort all' : 'board baseline: dots button, then Sort all', 'menu opens on the first press; Sort all acts once and closes the menu; R saved (after-change case)', { menuOpenedFirstPress: open1, menuClosedAfterSortAll: closed, rl }, open1 && closed && (!pre || rl === '09:30') ? 'PASS' : 'FAIL', pic)
  await ctx.close()
}
await b.close()
await finish('s08y')
