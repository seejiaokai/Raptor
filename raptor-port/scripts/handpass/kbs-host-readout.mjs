/* host probe — D1082: the hidden keyboard readout, at his iPhone's width with ?kbdebug=1, on the board with a box tapped
   and the stand-in keys up; a picture of it for him. HP_URL points at the build being looked at. */
import { open, version, KB } from './kbs-A-lib.mjs'
version('host-readout-1')
const { browser, page, errors } = await open({ width: 402, height: 874, login: false })
await page.goto((process.env.HP_URL || 'http://localhost:4333/') + '?kbdebug=1')
const { signIn } = await import('./kbs-A-lib.mjs'); await signIn(page, 'a')
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900)
const box = page.locator('#schedBoard input.tm:visible').nth(6)
await box.evaluate(e => { let s = e.parentElement; while (s && !(/(auto|scroll)/.test(getComputedStyle(s).overflowY) && s.scrollHeight > s.clientHeight + 1)) s = s.parentElement; s.scrollTop += e.getBoundingClientRect().bottom - (innerHeight - 60) })
await page.waitForTimeout(300)
const b = await box.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + 6); await page.waitForTimeout(300)
await page.evaluate(kb => { const v = window.__vv; v.height = innerHeight - kb; v.dispatchEvent(new Event('resize')) }, KB)
await page.waitForTimeout(700)
console.log(await page.evaluate(() => document.querySelector('[data-kbdebug]')?.textContent))
await page.screenshot({ path: 'docs/img/handpass/2026-10-19-keyboard-scroll/walk/host-readout.png' })
console.log('errors', errors.length ? errors : 'none')
await browser.close()
