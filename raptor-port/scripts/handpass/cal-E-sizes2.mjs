// follow-up to the sizes look: after scrolling INSIDE the editor / settings window, do Save and Cancel become reachable?
import { launch, world, toInputs, toMonth, cell, shot, press } from './cal-E-lib.mjs'
const b = await launch()
for (const size of ['short', 'side']) {
  const w = await world(b, size); const p = w.page
  await toInputs(p); await toMonth(p, 2026, 10)
  await press(p, size, cell(p, '2026-10-14'), { position: { x: 8, y: 8 } }); await p.waitForSelector('#icPopAdd'); await press(p, size, p.locator('#icPopAdd')); await p.waitForSelector('#inpEditPop'); await p.waitForTimeout(500)
  const before = await p.evaluate(() => { const bd = document.querySelector('[data-testid="win-inputedit"] .win-body'); return { st: bd.scrollTop, max: bd.scrollHeight - bd.clientHeight } })
  await p.evaluate(() => { const bd = document.querySelector('[data-testid="win-inputedit"] .win-body'); bd.scrollTop = bd.scrollHeight }); await p.waitForTimeout(300)
  const after = await p.evaluate(() => { const out = {}; for (const id of ['inpEditSave', 'inpEditCancel']) { const b = document.getElementById(id); const q = b.getBoundingClientRect(); const hit = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); out[id] = { top: Math.round(q.top), bottom: Math.round(q.bottom), inView: q.bottom <= innerHeight && q.top >= 0, lands: !!hit && (hit === b || b.contains(hit)) } } return out })
  console.log(size, 'editor body scroll', JSON.stringify(before), '-> after scrolling to the end:', JSON.stringify(after))
  await shot(p, `sizes2-${size}-editor-scrolled`)
  await w.ctx.close()
}
await b.close()
