/* host probe — [KEYBOARD-SCROLL] A12: with NO keyboard, does a plain scroll of the page that takes Quals' heading past the
   top bar tear the focused cell out (the pinned heading's own redraw)? */
import { open, go, version, tapBox } from './kbs-A-lib.mjs'
version('host-a12b-1')
const { browser, page } = await open()
await go(page, 'quals')
await tapBox(page, page.locator('#qEdit')); await page.waitForTimeout(800)
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
const cell = page.locator('#page-quals input.qinit:not(.qflt)').nth(12)
console.log('cell rect', await cell.evaluate(e => Math.round(e.getBoundingClientRect().top)))
await tapBox(page, cell); await page.waitForTimeout(500)
await page.evaluate(() => { window.__box = document.activeElement })
for (const dy of [100, 200, 300]) {
  await page.evaluate(d => window.scrollTo(0, d), dy); await page.waitForTimeout(500)
  console.log('scrolled to', dy, 'connected?', await page.evaluate(() => window.__box.isConnected), 'active', await page.evaluate(() => document.activeElement === window.__box))
}
await browser.close()
