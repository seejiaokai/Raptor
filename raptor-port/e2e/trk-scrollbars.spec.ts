/* The Tracker's stray scroll bars ([TRK-STRAY-SCROLLBARS], his D1405 and D1406 — 27 Oct 26).
   On his iPhone the chart box showed the phone's own fading scroll bars whenever it moved, and mid-pinch drew them in
   the wrong place (one floating mid-chart, one at the top left). His answer "A": on a touch screen the chart draws no
   bars — it still scrolls — while the Info half keeps its normal bar, and a desktop with a mouse keeps both.
   No desktop browser draws the iPhone's own bars, so what is pinned here is the rule that hides them: the chart box's
   `scrollbar-width` (honoured by Safari since 18.2 and by Chrome), read where the screen's only pointer is a finger. */
import { expect, test, type Page } from '@playwright/test'
import { go, login } from './app'

const bars = (page: Page, sel: string) => page.evaluate(s => {
  const e = document.querySelector(s) as HTMLElement | null
  return e ? getComputedStyle(e).scrollbarWidth : null
}, sel)

async function openTracker(page: Page) {
  await login(page)
  await go(page, 'tracker')
  await page.waitForSelector('#flowSvg .ball', { timeout: 20000 })
  await page.waitForTimeout(300)
}

test.describe('phone (a finger the only pointer)', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test('the chart draws no scroll bars, still scrolls, and the Info half keeps its bar (D1406)', async ({ page }) => {
    await openTracker(page)
    /* the test is only worth anything where the browser takes this for a touch screen */
    expect(await page.evaluate(() => matchMedia('(hover: none) and (pointer: coarse)').matches), 'a touch screen').toBe(true)
    expect(await bars(page, '#board'), 'the chart box').toBe('none')
    const moved = await page.evaluate(() => {
      const b = document.getElementById('board')!
      const before = b.scrollTop
      b.scrollTop = before + 200
      return b.scrollTop - before
    })
    expect(moved, 'the chart still scrolls').toBeGreaterThan(0)
    await page.locator('#viewtabs button[data-view="info"]').click()
    await page.waitForTimeout(300)
    expect(await bars(page, '#side'), 'the Info half').toBe('auto')
  })
})

test.describe('desktop (a mouse)', () => {
  test.use({ viewport: { width: 1536, height: 730 } })

  test('the chart and the Info panel keep their scroll bars (D1406)', async ({ page }) => {
    await openTracker(page)
    expect(await page.evaluate(() => matchMedia('(hover: none) and (pointer: coarse)').matches), 'a mouse screen').toBe(false)
    expect(await bars(page, '#board'), 'the chart box').toBe('auto')
    expect(await bars(page, '#side'), 'the Info panel').toBe('auto')
  })
})
