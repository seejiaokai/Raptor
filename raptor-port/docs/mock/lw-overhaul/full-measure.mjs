// Measure the real grid's cell and chip (desktop and phone) so the cell-states page copies them, not eyes them.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, errs, OUT } from './full-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const res = {}
for (const [name, w, h, touch] of [['desk', 1536, 860, false], ['phone', 390, 844, true]]) {
  const { ctx, p } = await newPage(browser, w, h, touch, state)
  await signIn(p, 'admin')
  res[name] = await p.evaluate(() => {
    const pick = (el, props) => { if (!el) return null; const s = getComputedStyle(el); const o = {}; for (const k of props) o[k] = s.getPropertyValue(k); const r = el.getBoundingClientRect(); o._w = r.width; o._h = r.height; return o }
    const P = ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'line-height', 'color', 'background-color', 'background-image', 'box-shadow', 'border-left', 'border-right', 'border-top', 'border-bottom', 'padding', 'border-radius', 'zoom', 'vertical-align', 'text-align', 'height']
    const td = document.querySelector('[data-testid="cell-dice-2026-01-19"]')
    const tdw = document.querySelector('[data-testid="cell-dice-2026-01-24"]')
    const tdempty = document.querySelector('[data-testid="cell-dice-2026-01-26"]')
    const grid = td?.closest('table'); const outer = td?.closest('.mx-outer')
    return {
      td: pick(td, P), tdWeekend: pick(tdw, P), tdEmpty: pick(tdempty, P),
      appr: pick(td?.querySelector('.c'), P), plain: pick(document.querySelector('[data-testid="cell-dice-2026-01-27"] .c'), P),
      tbc: pick(document.querySelector('[data-testid="cell-snap-2026-01-22"] .c'), P),
      ref: pick(document.querySelector('[data-testid="cell-bane-2026-02-02"] .c'), P),
      am: pick(document.querySelector('[data-testid="cell-shaft-2026-01-20"] .c'), P),
      raptor: pick(document.querySelector('[data-testid="cell-pump-2026-01-26"] .c'), P),
      info: pick(document.querySelector('[data-testid="cell-mamba-2026-01-21"] .c'), P),
      more: pick(document.querySelector('[data-testid="mark-nact-2026-01-23"]'), P),
      sc: pick(document.querySelector('[data-testid="cell-slipway-2026-01-03"] .c'), P),
      table: pick(grid, ['background-color', 'zoom', 'font-family']), outer: pick(outer, ['background-color', 'zoom']),
      body: pick(document.body, ['background-color', 'font-family']),
      name: pick(document.querySelector('[data-testid="person-dice"]'), P),
      tdHTML: td?.outerHTML, moreHTML: document.querySelector('[data-testid="cell-nact-2026-01-23"]')?.outerHTML,
    }
  })
  await ctx.close()
}
writeFileSync(join(OUT, 'measure.json'), JSON.stringify(res, null, 1))
console.log(JSON.stringify(res, null, 1).slice(0, 9000))
await browser.close(); console.log('errors:', errs)
