import { test, expect, type Page, type Locator } from '@playwright/test'
import { login, go } from './app'

/* KS1–KS4 — [KEYBOARD-SCROLL] (owner D1048, 19 Oct 26): on a phone, a box tapped to type in that the keyboard would
   cover is scrolled to sit just above it. Chromium cannot raise an iPhone's keyboard, so — as the board's own keyboard
   walk did (scripts/handpass/am/b3-03-keyboard.mjs) — window.visualViewport is replaced before the app loads by a
   stand-in with the same fields and events, and "the keys come up" is that stand-in shrinking and saying so. What only
   a real browser can show: the real panels' scrolling, the board following the visible screen, the page behind a
   window left still. The arithmetic is pinned in src/ui/kbscroll.test.ts; his iPhone is the real test. */
const H = 874, KB = 336, GAP = 8
const stubVV = (page: Page) => page.addInitScript(() => {
  class FakeVV extends EventTarget { width = innerWidth; height = innerHeight; offsetTop = 0; offsetLeft = 0; pageTop = 0; pageLeft = 0; scale = 1 }
  const f = new FakeVV()
  Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f })
  ;(window as any).__vv = f
})
const keysUp = (page: Page) => page.evaluate(kb => {
  const v = (window as any).__vv; v.height = innerHeight - kb; v.dispatchEvent(new Event('resize'))
}, KB)
const tap = async (page: Page, loc: Locator) => {
  const b = (await loc.boundingBox())!
  await page.touchscreen.tap(b.x + b.width / 2, b.y + Math.min(b.height / 2, 8))
}
const bottomOf = (loc: Locator) => loc.evaluate(e => Math.round(e.getBoundingClientRect().bottom))
/* bring `loc` low on the screen inside its own scrolling panel (or the page), as a box he would reach for */
const lowOnScreen = (loc: Locator) => loc.evaluate((e, h) => {
  let sc: Element | null = e.parentElement
  while (sc && !(/(auto|scroll)/.test(getComputedStyle(sc).overflowY) && sc.scrollHeight > sc.clientHeight + 1)) sc = sc.parentElement
  const s = sc || document.scrollingElement!
  s.scrollTop += e.getBoundingClientRect().bottom - (h - 40)
  return Math.round(e.getBoundingClientRect().bottom)
}, H)

test.describe('the box being typed in shows above the keyboard — phone', () => {
  test.use({ viewport: { width: 402, height: H }, isMobile: true, hasTouch: true })
  test.beforeEach(async ({ page }) => { await stubVV(page) })

  test('KS1 the Scheduler Board: a box low in its scrolling panel is lifted just above the keys; the week behind never moves', async ({ page }) => {
    await login(page); await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(0)); await expect(page.locator('#schedBoard')).toBeVisible()
    const box = page.locator('#schedBoard input.tm:visible').nth(6)
    const was = await lowOnScreen(box)
    expect(was, 'the fixture: the box sits where the keys will come').toBeGreaterThan(H - KB + 20)
    const behind = await page.evaluate(() => document.scrollingElement!.scrollTop)
    await tap(page, box)
    await expect(box).toBeFocused()
    await keysUp(page)
    await expect.poll(() => bottomOf(box)).toBeLessThanOrEqual(H - KB - GAP + 1)
    expect(await bottomOf(box), 'just above, not flung to the top').toBeGreaterThan(H - KB - 80)
    expect(await page.evaluate(() => document.scrollingElement!.scrollTop), 'the page behind the board').toBe(behind)
    await expect(box).toBeFocused()
  })

  test('KS2 a page that scrolls itself (Logic): its last setting box is brought above the keys', async ({ page }) => {
    await login(page); await go(page, 'logic')
    const box = page.locator('input.lgin:visible').last()
    const was = await lowOnScreen(box)
    expect(was).toBeGreaterThan(H - KB + 20)
    await tap(page, box)
    await expect(box).toBeFocused()
    await keysUp(page)
    await expect.poll(() => bottomOf(box)).toBeLessThanOrEqual(H - KB - GAP + 1)
  })

  test('KS3 a window (Admin → Duty templates): a time box low in it is brought above the keys, the page behind it left still', async ({ page }) => {
    await login(page); await go(page, 'admin' as any)
    await page.click('#admDutyTpl')
    const box = page.locator('#tplModal input.tm:visible').last()
    await expect(box).toBeVisible()
    /* the window as he meets it: the keys come up over its lower half */
    const was = await bottomOf(box)
    const behind = await page.evaluate(() => document.scrollingElement!.scrollTop)
    await tap(page, box)
    await expect(box).toBeFocused()
    await keysUp(page)
    if (was > H - KB - GAP) await expect.poll(() => bottomOf(box)).toBeLessThanOrEqual(H - KB - GAP + 1)
    else expect(await bottomOf(box), 'already above the keys: left where it was').toBe(was)
    expect(await page.evaluate(() => document.scrollingElement!.scrollTop), 'the page behind the window').toBe(behind)
  })

  test('KS4 a box already above the keys is left where it is', async ({ page }) => {
    await login(page); await go(page, 'logic')
    const box = page.locator('input.lgin:visible').first()
    await box.evaluate(e => e.scrollIntoView({ block: 'start' }))
    const was = await bottomOf(box)
    expect(was).toBeLessThan(H - KB - GAP)
    await tap(page, box); await keysUp(page)
    await page.waitForTimeout(150)
    expect(await bottomOf(box)).toBe(was)
  })
})
