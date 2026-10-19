/* host probe — [KEYBOARD-SCROLL] KS3b after the board became page content: Duty templates with 28 time boxes, the last
   tapped, the stand-in keys up then down; prints the window's lift and hold at each step, and every later write to it. */
import { open, version, KB } from './kbs-A-lib.mjs'
version('host-ks3b-1')
const { browser, page } = await open({ width: 402, height: 874 })
await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
await page.evaluate(() => document.getElementById('admDutyTpl').click()); await page.waitForTimeout(400)
const add = page.locator('#tplModal button', { hasText: /add role/i })
for (let n = await page.locator('#tplModal input.tm').count(); n < 28; n += 2) await add.click()
const box = page.locator('#tplModal input.tm').last()
await box.evaluate(e => e.scrollIntoView({ block: 'end' }))
await page.evaluate(() => {
  const w = document.querySelector('#tplModal .modal-box'); window.__log = []
  new MutationObserver(() => window.__log.push(performance.now().toFixed(0) + ' ' + (w.getAttribute('style') || '') + ' cap=' + (w.dataset.kbcap ?? '-'))).observe(w, { attributes: true })
})
await page.waitForTimeout(600)
const b = await box.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + Math.min(b.height / 2, 8))
await page.waitForTimeout(300)
await page.evaluate(kb => { const v = window.__vv; v.height = innerHeight - kb; v.dispatchEvent(new Event('resize')) }, KB)
await page.waitForTimeout(600)
console.log('up', await page.evaluate(() => document.querySelector('#tplModal .modal-box').getAttribute('style')))
await page.evaluate(() => { const v = window.__vv; v.height = innerHeight; v.dispatchEvent(new Event('resize')) })
await page.waitForTimeout(800)
console.log('down', await page.evaluate(() => document.querySelector('#tplModal .modal-box').getAttribute('style')))
console.log((await page.evaluate(() => window.__log)).join('\n'))
await browser.close()
