import * as F from './fx.mjs'
const { L } = F
console.log('w1 c4-explore v1')
const w = await L.world('phone')
const p = w.page
try {
  await F.publishSat(w)
  await F.toWar(w)
  await F.openMonth(w)
  console.log('stage menu', JSON.stringify(await F.stageTo(w)))
  await L.pic(w, 'x-c4-stage-menu')
  await w.press('[data-testid="stage-advance"]'); await L.sleep(700)
  console.log('after advance', await p.evaluate(() => document.querySelector('[data-testid="stage-now"]').textContent.trim()), JSON.stringify(await F.sheetNow(p)))
  const dlg = await F.dialogNow(p); console.log('dialogs', JSON.stringify(dlg))
  await L.pic(w, 'x-c4-after-advance')
  const t = await F.tapCell(w, 'plasma')
  console.log('cell sheet', JSON.stringify(t))
  await L.pic(w, 'x-c4-cell-sheet')
} finally { await L.close(w) }
