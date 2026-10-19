/* host probe — [KEYBOARD-SCROLL] A12: what replaces the focused Quals cell when the heading pins? */
import { open, go, version, tapBox } from './kbs-A-lib.mjs'
version('host-a12c-1')
const { browser, page } = await open()
await go(page, 'quals')
await tapBox(page, page.locator('#qEdit')); await page.waitForTimeout(800)
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
const cell = page.locator('#page-quals input.qinit:not(.qflt)').nth(12)
await tapBox(page, cell); await page.waitForTimeout(500)
await page.evaluate(() => {
  window.__box = document.activeElement; window.__log = []
  const t = document.getElementById('qtbl'); window.__html0 = t.innerHTML
  new MutationObserver(ms => { for (const m of ms) window.__log.push(m.type + ' ' + (m.target.id || m.target.tagName) + ' +' + m.addedNodes.length + ' -' + m.removedNodes.length) }).observe(t, { childList: true, subtree: true })
  window.__tbl = t
})
await page.evaluate(() => window.scrollTo(0, 200)); await page.waitForTimeout(600)
console.log(await page.evaluate(() => JSON.stringify({ same: document.getElementById('qtbl') === window.__tbl, log: window.__log.slice(0, 6), n: window.__log.length })))
const diff = await page.evaluate(() => { const a = window.__html0, b = document.getElementById('qtbl').innerHTML; let i = 0; while (i < a.length && a[i] === b[i]) i++; return [a.length, b.length, i, a.slice(Math.max(0, i - 120), i + 120), '|||', b.slice(Math.max(0, i - 120), i + 120)] })
console.log(JSON.stringify(diff))
await browser.close()
