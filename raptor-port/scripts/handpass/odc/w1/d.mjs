// W1 — a second look at scenario 14 (turning the phone with the calendar open), with the page's own size readings. VERSION 1
import { start, openCalendarWindow, press, shot, rect, vis, cardOnTop } from './lib.mjs'
console.log('w1/d.mjs VERSION 1')
const L = await start(390, 844)
const { page } = L
const sz = () => page.evaluate(() => ({ inner: [innerWidth, innerHeight], vv: window.visualViewport ? [Math.round(visualViewport.width), Math.round(visualViewport.height), Math.round(visualViewport.offsetLeft), Math.round(visualViewport.offsetTop)] : null, scroll: [scrollX, scrollY] }))
await openCalendarWindow(L)
await press(L, '[data-testid="days-wd-3"]'); await page.waitForSelector('[data-testid="win-every"]')
await press(L, '[data-testid="every-from"]')
console.log('open 390x844', JSON.stringify(await cardOnTop(L, 'a')), JSON.stringify(await sz()))
await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(1000)
console.log('turned 844x390', JSON.stringify(await cardOnTop({ page, W: 844, H: 390 }, 'b')), JSON.stringify(await sz()))
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(1000)
console.log('back 390x844', JSON.stringify(await cardOnTop(L, 'c')), JSON.stringify(await sz()))
await shot(L, 's14b-back-again')
/* then a tap outside, and open again */
await page.touchscreen.tap(380, 700); await page.waitForTimeout(400)
console.log('after a tap at 380,700: calendar open', await vis(L, '[data-testid="dcal-card"]'), 'Every window open', await vis(L, '[data-testid="win-every"]'))
await press(L, '[data-testid="every-from"]')
console.log('opened again', JSON.stringify(await cardOnTop(L, 'd')))
await shot(L, 's14b-reopened')
/* a second turn, with the calendar closed, then open */
await page.touchscreen.tap(380, 700); await page.waitForTimeout(300)
await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(600)
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(600)
await press(L, '[data-testid="every-from"]')
console.log('opened after turning twice with it closed', JSON.stringify(await cardOnTop(L, 'e')))
await L.browser.close()
