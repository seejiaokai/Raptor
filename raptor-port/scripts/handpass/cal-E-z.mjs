// diagnostic for P5-04: which window is in front when the editor is open and a date is then opened
import { launch, world, toInputs, cell, bar, shot, press, makeInput, closeDay, saveRows } from './cal-E-lib.mjs'
const b = await launch()
const w = await world(b, 'desk'); const p = w.page
await toInputs(p)
const [iid] = await makeInput(p, 'desk', '2026-10-20', { type: 'Duty', remarks: 'z' })
await closeDay(p)
const read = tag => p.evaluate(tag => {
  const f = [...document.querySelectorAll('.floatwin')].map(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { id: e.dataset.testid, z: cs.zIndex, front: e.classList.contains('front'), l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } })
  return tag + ' ' + JSON.stringify(f)
}, tag)
await press(p, 'desk', bar(p, iid)); await p.waitForSelector('[data-testid="win-inputedit"]'); await p.waitForTimeout(300)
console.log(await read('editor only'))
await press(p, 'desk', cell(p, '2026-10-20'), { position: { x: 8, y: 8 } }); await p.waitForSelector('[data-testid="win-inputsday"]'); await p.waitForTimeout(400)
console.log(await read('after date pressed (no typing)'))
const top = await p.evaluate(() => { const d = document.querySelector('[data-testid="win-inputsday"]').getBoundingClientRect(); const h = document.elementFromPoint(d.left + d.width / 2, d.top + 20); return h && (h.closest('[data-testid]')?.dataset.testid || h.className) })
console.log('element at day window centre-top:', top)
await shot(p, 'z-1')
console.log(w.errors)
await b.close()
