/* host probe — [KEYBOARD-SCROLL] A12: what changes in the Quals table's markup when the heading pins? */
import { open, go, version, tapBox } from './kbs-A-lib.mjs'
version('host-a12e-4')
const { browser, page } = await open()
await go(page, 'quals')
await tapBox(page, page.locator('#qEdit')); await page.waitForTimeout(800)
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
const cell = page.locator('#page-quals input.qinit:not(.qflt)').nth(12)
await tapBox(page, cell); await page.waitForTimeout(500)
await page.evaluate(() => {
  window.__sets = []
  const t = document.getElementById('qtbl'), d = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')
  Object.defineProperty(t, 'innerHTML', { configurable: true, get() { return d.get.call(this) }, set(v) {
    const o = d.get.call(this).replace(/ \/>/g, '>').replace(/<option >/g, '<option>'), w = v.replace(/ \/>/g, '>').replace(/<option >/g, '<option>'); let i = 0; while (i < o.length && o[i] === w[i]) i++
    window.__sets.push({ len: w.length, oldLen: o.length, at: i, old: o.slice(Math.max(0, i - 300), i + 200), now: w.slice(Math.max(0, i - 300), i + 200) })
    d.set.call(this, v)
  } })
})
await page.evaluate(() => window.scrollTo(0, 200)); await page.waitForTimeout(600)
console.log(JSON.stringify(await page.evaluate(() => window.__sets), null, 1))
await browser.close()
