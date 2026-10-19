/* host probe (debug build) — [KEYBOARD-SCROLL] A12: which of the Quals table's inputs moves when the heading pins */
import { open, go, version, tapBox } from './kbs-A-lib.mjs'
version('host-a12f-1')
const { browser, page } = await open()
await go(page, 'quals')
await tapBox(page, page.locator('#qEdit')); await page.waitForTimeout(800)
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
const cell = page.locator('#page-quals input.qinit:not(.qflt)').nth(12)
await tapBox(page, cell); await page.waitForTimeout(500)
await page.evaluate(() => { window.__mark = window.__qdbg.length })
await page.evaluate(() => window.scrollTo(0, 200)); await page.waitForTimeout(600)
console.log(await page.evaluate(() => {
  const all = window.__qdbg, m = window.__mark, a = all[m - 1], rest = all.slice(m)
  return JSON.stringify(rest.map(r => { const o = {}; for (const k of Object.keys(r)) if (k !== 'h' && r[k] !== a[k]) o[k] = [a[k], r[k]]; let i = 0; while (i < a.h.length && a.h[i] === r.h[i]) i++; o.diffAt = i; o.was = a.h.slice(i - 80, i + 80); o.now = r.h.slice(i - 80, i + 80); return o }))
}))
await browser.close()
