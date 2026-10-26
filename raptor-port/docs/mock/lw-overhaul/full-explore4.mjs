// Dump the top rows, a date heading, a group heading and a person row's frozen cells (markup the page drawing transforms).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, errs, OUT } from './full-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
for (const [w, h, t, who] of [[1536, 860, false, 'admin'], [390, 844, true, 'member']]) {
  const { ctx, p } = await newPage(browser, w, h, t, state)
  await signIn(p, who)
  console.log(await p.evaluate(() => {
    const cut = (s, n = 1500) => (s || '').replace(/\s+/g, ' ').slice(0, n)
    const filt = [...document.querySelectorAll('#page-leavewar .filters')].map(e => cut(e.outerHTML, 2500))
    const th = [...document.querySelectorAll('#page-leavewar th')].find(e => /09/.test(e.textContent) && /MON/i.test(e.textContent))
    const grp = document.querySelector('#page-leavewar td.grphd')?.closest('tr')
    const row = document.querySelector('[data-testid="row-dice"]')
    return JSON.stringify({ filters: filt, th: cut(th?.outerHTML, 600), grp: cut(grp?.outerHTML, 1200), rowStart: cut(row?.outerHTML, 1800), rowClass: row?.className, figHead: cut([...document.querySelectorAll('#page-leavewar *')].find(e => e.childElementCount < 3 && /^\s*[▸▾]?\s*figures\s*$/i.test(e.textContent))?.outerHTML, 400) }, null, 1)
  }))
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
