// Look at today's Leave War in a busy stretch (the demo seed's bids, approved leave, an Inputs-page OIL, a course), desktop and phone.
import { chromium, newPage, signIn, shot, q, esc, errs } from './full-lib.mjs'
const browser = await chromium.launch()
let { ctx, p } = await newPage(browser, 1536, 760, false)
await signIn(p, 'admin')
await p.evaluate(() => document.querySelector('[data-testid="cell-asics-2026-01-08"]')?.scrollIntoView({ block: 'center', inline: 'start' }))
await shot(p, 'x-desk-busy')
await p.click(q('legend-open')); await shot(p, 'x-desk-legend'); await esc(p)
const info = await p.evaluate(() => {
  const g = id => document.querySelector(`[data-testid="${id}"]`)
  const c = id => { const e = g(id); return e ? { cls: e.className, txt: e.innerText, html: e.innerHTML.slice(0, 300) } : null }
  return { asics8: c('cell-asics-2026-01-08'), asics9: c('cell-asics-2026-01-09'), asics23: c('cell-asics-2026-01-23'), tata9: c('cell-tata-2026-01-09'), pip12: c('cell-pipper-2026-01-12'), splice8: c('cell-splice-2026-01-08'), miles3: c('cell-miles-2026-02-03') }
})
console.log(JSON.stringify(info, null, 1))
await ctx.close()
;({ ctx, p } = await newPage(browser, 390, 844, true))
await signIn(p, 'admin')
await shot(p, 'x-phone-top')
await p.evaluate(() => document.querySelector('[data-testid="cell-asics-2026-01-08"]')?.scrollIntoView({ block: 'center', inline: 'center' }))
await shot(p, 'x-phone-busy')
await ctx.close(); await browser.close()
console.log('errors:', errs)
