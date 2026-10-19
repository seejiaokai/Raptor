/* host probe — [KEYBOARD-SCROLL] walker A's A12: is the Quals cell torn out by the keys' resize itself (Quals' own
   re-measure), or by the lift? Cell HIGH on screen (nothing for the lift to do), then keys up. */
import { open, go, version, tapBox } from './kbs-A-lib.mjs'
version('host-a12-1')
const { browser, page } = await open()
await go(page, 'quals')
await tapBox(page, page.locator('#qEdit')); await page.waitForTimeout(800)
const cell = page.locator('#page-quals input.qinit:not(.qflt)').nth(2)
await cell.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.evaluate(() => window.scrollBy(0, -200)); await page.waitForTimeout(400)
console.log('cell rect', await cell.evaluate(e => JSON.stringify(e.getBoundingClientRect())))
await tapBox(page, cell); await page.waitForTimeout(500)
await page.evaluate(() => { window.__box = document.activeElement; window.__sy = scrollY })
await page.evaluate(() => { const v = window.__vv; v.height = innerHeight - 336; v.dispatchEvent(new Event('resize')) })
await page.waitForTimeout(800)
console.log('keys up, cell high: connected?', await page.evaluate(() => window.__box.isConnected), 'page moved', await page.evaluate(() => scrollY - window.__sy), 'active', await page.evaluate(() => document.activeElement.tagName + '.' + document.activeElement.className))
await browser.close()
