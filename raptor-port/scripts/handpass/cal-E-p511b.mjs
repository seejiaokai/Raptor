// P5-11 follow-up: does a List row flash when its input is saved / undone / redone while in view? Sample its painted colours every frame.
import { launch, world, toInputs, shot, press, seedFile, recOf } from './cal-E-lib.mjs'
const size = process.argv[2] || 'desk'
const b = await launch()
const w = await world(b, size); const p = w.page
await toInputs(p)
const ids = await seedFile(p, Array.from({ length: 8 }, (_, i) => ({ who: i, type: 'LL', from: 'Oct ' + (9 + i), remarks: 'row ' + i })))
await press(p, size, p.locator('#inListBtn')); await p.waitForTimeout(500)
const tgt = ids[3], sel = `#inBody tr[data-iid="${tgt}"]`
const start = () => p.evaluate(sel => {
  window.__bg = new Set(); const t0 = performance.now()
  const tick = () => { const tr = document.querySelector(sel); if (tr) { const cs = getComputedStyle(tr); const td = getComputedStyle(tr.children[0]); window.__bg.add([cs.backgroundColor, td.backgroundColor, td.boxShadow, cs.outlineColor, cs.boxShadow].join('|')) } if (performance.now() - t0 < 1500) requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
}, sel)
const read = async () => { await p.waitForTimeout(1700); return p.evaluate(() => [...window.__bg]) }
// quiet baseline
await start(); console.log('idle', JSON.stringify(await read()))
await press(p, size, p.locator(`${sel} [data-edit]`)); await p.waitForTimeout(300)
await p.locator(`${sel} td[data-fld="Remarks"] input`).first().fill('edited')
await start(); await press(p, size, p.locator(`${sel} .inact span`).first()); console.log('after Save', JSON.stringify(await read()))
await start(); await press(p, size, p.locator('#undoBtn')); console.log('after Undo', JSON.stringify(await read()), (await recOf(p, tgt)).remarks)
await start(); await press(p, size, p.locator('#redoBtn')); console.log('after Redo', JSON.stringify(await read()), (await recOf(p, tgt)).remarks)
await shot(p, `p511b-${size}-list`)
console.log(w.errors)
await b.close()
