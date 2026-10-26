// How the frozen columns are copied (desktop and phone), and which scroller moves the year sideways.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, errs, OUT } from './full-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
for (const [w, h, t] of [[1536, 860, false], [390, 844, true]]) {
  const { ctx, p } = await newPage(browser, w, h, t, state)
  await signIn(p, 'member')
  console.log(w, await p.evaluate(() => {
    const trs = [...document.querySelectorAll('#page-leavewar tr')].filter(tr => /^\s*Reaper/.test(tr.textContent))
    const tables = trs.map(tr => { const tb = tr.closest('table'); return (tb.className || '(none)') + ' in ' + (tb.parentElement.className || tb.parentElement.tagName) + ' testid=' + (tr.dataset.testid || '-') + ' tds=' + tr.children.length })
    const wrap = document.querySelector('.mx-wrap'); const band = document.querySelector('.mxband')
    const scrollers = [...document.querySelectorAll('#page-leavewar *')].filter(e => e.scrollWidth > e.clientWidth + 50 && /(auto|scroll)/.test(getComputedStyle(e).overflowX)).map(e => e.className + ' sl=' + e.scrollLeft + ' sw=' + e.scrollWidth)
    return JSON.stringify({ tables, wrap: wrap && wrap.className, band: band && [band.getBoundingClientRect().width, getComputedStyle(band).display], scrollers })
  }))
  // try direct scroll on the phone's scroller
  const r = await p.evaluate(() => {
    const c = document.querySelector('[data-testid="cell-bane-2026-01-21"]'); const s = c.closest('.mx-wrap') || c.closest('[class*="wrap"]')
    const band = document.querySelector('.mxband'); const fr = band && getComputedStyle(band).display !== 'none' ? band.getBoundingClientRect().right : 0
    const before = c.getBoundingClientRect().left
    const d = before - fr; const z = parseFloat(getComputedStyle(c.closest('table')).zoom) || 1
    s.scrollLeft += d / z
    return { fr, before, d, z, after: c.getBoundingClientRect().left, sl: s.scrollLeft, cls: s.className }
  })
  console.log(JSON.stringify(r))
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
