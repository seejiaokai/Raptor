// Who is on the war (ids by group), and the shape of a filed leave input — for staging the busy stretch.
import { chromium, newPage, signIn, errs } from './full-lib.mjs'
const browser = await chromium.launch()
const { ctx, p } = await newPage(browser, 1536, 860, false)
await signIn(p, 'admin')
const ids = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="person-"]')].map(e => e.dataset.testid.slice(7) + '=' + e.textContent.trim()).join(' '))
console.log(ids)
const inp = await p.evaluate(() => JSON.stringify((window.INPUTS || []).filter(i => /OL|LL|ATT|CSE|HL/.test(i.type || i.t || '')).slice(0, 3)))
console.log(inp)
await ctx.close(); await browser.close(); console.log('errors:', errs)
