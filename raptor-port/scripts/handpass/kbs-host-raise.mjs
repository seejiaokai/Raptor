/* host probe — [KEYBOARD-SCROLL] his seventh report: on the board, a box at the very end of its panel (nothing left to
   scroll it up by) with the stand-in keys up — what is raised, does it cover the board's top bar, and where does the
   board's raised part end against the keys? Then the visible screen panned 200 (as an iPhone does after the focus). */
import { open, version, KB } from './kbs-A-lib.mjs'
version('host-raise-1')
const { browser, page } = await open({ width: 402, height: 874 })
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900)
const box = page.locator('#schedBoard textarea:visible, #schedBoard input:visible').last()
await box.evaluate(e => { let s = e.parentElement; while (s && !(/(auto|scroll)/.test(getComputedStyle(s).overflowY) && s.scrollHeight > s.clientHeight + 1)) s = s.parentElement; if (s) s.scrollTop = s.scrollHeight })
await page.waitForTimeout(300)
const b = await box.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + 6); await page.waitForTimeout(300)
await page.evaluate(kb => { const v = window.__vv; v.height = innerHeight - kb; v.dispatchEvent(new Event('resize')) }, KB)
await page.waitForTimeout(700)
const state = () => page.evaluate(() => {
  const L = [...document.querySelectorAll('[data-kblift],[data-kbcap]')].map(e => '.' + String(e.className).split(' ')[0] + ' ' + (e.getAttribute('style') || ''))
  const top = document.querySelector('#schedBoard .sb-top').getBoundingClientRect(), a = document.activeElement.getBoundingClientRect()
  const lifted = document.querySelector('[data-kblift],[data-kbcap]'); const lr = lifted?.getBoundingClientRect()
  return JSON.stringify({ lifted: L, barBottom: Math.round(top.bottom), liftedTop: lr && Math.round(lr.top), liftedBottom: lr && Math.round(lr.bottom), boxBottom: Math.round(a.bottom), vv: [window.__vv.offsetTop, window.__vv.height] })
})
console.log('keys up', await state())
await page.screenshot({ path: 'docs/img/handpass/2026-10-19-keyboard-scroll/walk/host-raise-up.png' })
await page.evaluate(() => { const v = window.__vv; v.offsetTop = 200; v.dispatchEvent(new Event('scroll')) })
await page.waitForTimeout(700)
console.log('panned 200', await state())
await browser.close()
