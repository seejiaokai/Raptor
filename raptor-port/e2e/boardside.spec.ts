/* [BOARD-SIDE-WIDTH] — the Scheduler Board's right panel and the crew list, in a real browser (owner D1113, D1116,
   D1118, 21 Oct 26). jsdom has no layout, so what is PAINTED lives here: the grip widens the panel by a real mouse drag,
   to 40% of the window and no further, remembered across a reload and put back to 320 by a double-click; with a desk
   picked a crossed-out man's reason stands beside his puck once the panel is wide and under it at 320, the strike
   across the puck only; on a phone the grip is not there; and Edit Schedule's crew panel, scrolled, keeps its
   "AIRCREW · ‹ day ›" heading in sight under the top bar. */
import { expect, test, type Page } from '@playwright/test'
import { go, login } from './app'

const DESK = { width: 1536, height: 864 }
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function board(page: Page) {
  await go(page, 'editsched')
  await page.locator('#eWeek [data-sbday="0"]:visible').first().click()
  await page.waitForSelector('#schedBoard:not([hidden])'); await sleep(400)
}
const sideW = (page: Page) => page.evaluate(() => Math.round(document.querySelector('#schedBoard .sb-side')!.getBoundingClientRect().width))
async function dragGrip(page: Page, dx: number) {
  const g = await page.locator('#schedBoard [data-sidegrip]').boundingBox()
  const x = g!.x + g!.width / 2, y = g!.y + g!.height / 2
  await page.mouse.move(x, y); await page.mouse.down()
  for (let i = 1; i <= 8; i++) await page.mouse.move(x + dx * i / 8, y)
  await page.mouse.up(); await sleep(150)
}
async function pickDesk(page: Page) {
  const d = page.locator('#schedBoard [data-fill="d:0.0.0.+"]:visible').first()
  await d.scrollIntoViewIfNeeded(); await d.click(); await sleep(400)
  await expect.poll(() => page.evaluate(() => (window as any).ARM && (window as any).ARM.key)).toBe('d:0.0.0.+')
}
/* every crossed-out entry that prints its own reason: is the reason beside the puck (its left at or past the puck's
   right) or under it (its top at or past the puck's foot)? and the strike's painted width */
const reasons = (page: Page) => page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-roster .rcol .rpuck.no.haswhy')].map(e => {
  const p = e.querySelector('.puck')!.getBoundingClientRect(), r = e.querySelector('.rwhy')!.getBoundingClientRect()
  return { beside: r.left >= p.right - 1 && r.top < p.bottom, under: r.top >= p.bottom - 1, strike: parseFloat(getComputedStyle(e, '::after').width), puck: p.width }
}))

test.describe('the board\'s right panel on a desktop (D1113, D1118)', () => {
  test.use({ viewport: DESK })
  test('the grip drags it to 40% and no further, it is remembered, and a double-click puts it back', async ({ page }) => {
    const errs: string[] = []; page.on('pageerror', e => errs.push(String(e)))
    await login(page); await board(page)
    expect(await sideW(page)).toBe(320)
    await dragGrip(page, -150)
    expect(await sideW(page)).toBe(470)
    await dragGrip(page, -600)
    expect(await sideW(page)).toBe(Math.round(DESK.width * 0.4))
    /* remembered on this computer: the page reloaded, the board opened again */
    await page.reload(); await login(page).catch(() => {}); await board(page)
    expect(await sideW(page)).toBe(Math.round(DESK.width * 0.4))
    await page.locator('#schedBoard [data-sidegrip]').dblclick(); await sleep(150)
    expect(await sideW(page)).toBe(320)
    /* the keyboard: ← widens by 20 */
    await page.locator('#schedBoard [data-sidegrip]').focus(); await page.keyboard.press('ArrowLeft'); await sleep(100)
    expect(await sideW(page)).toBe(340)
    expect(errs).toEqual([])
  })
  test('with a desk picked: reasons under the pucks at 320, beside them when wide; the strike across the puck only', async ({ page }) => {
    await login(page); await board(page); await pickDesk(page)
    let r = await reasons(page)
    expect(r.length).toBeGreaterThan(5)
    r.forEach(x => { expect(x.under).toBe(true); expect(Math.round(x.strike)).toBe(Math.round(x.puck) - 6) })
    await dragGrip(page, -300)
    r = await reasons(page)
    r.forEach(x => { expect(x.beside).toBe(true); expect(Math.round(x.strike)).toBe(Math.round(x.puck) - 6) })
  })
})

test('on a phone the panel has no grip', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  await login(page)
  await go(page, 'editsched')
  await page.locator('#eWeek [data-sbday="0"]:visible').first().tap()
  await page.waitForSelector('#schedBoard:not([hidden])'); await sleep(300)
  await expect(page.locator('#schedBoard [data-sidegrip]')).toBeHidden()
  await context.close()
})

test.describe('Edit Schedule\'s AIRCREW heading stays in sight (D1116)', () => {
  test.use({ viewport: DESK })
  test('scrolled down, the crew panel\'s heading sits under the top bar, not behind it', async ({ page }) => {
    await login(page); await go(page, 'editsched'); await sleep(300)
    await page.evaluate(() => window.scrollTo(0, 900)); await sleep(300)
    const m = await page.evaluate(() => {
      const bar = document.querySelector('.topbar')!.getBoundingClientRect()
      const h = document.querySelector('.edit-board .eroster .er-h')!.getBoundingClientRect()
      const hit = document.elementFromPoint(h.left + 40, h.top + h.height / 2)
      return { scrolled: scrollY, barBottom: bar.bottom, headTop: h.top, onHead: !!hit && !!hit.closest('.er-h') }
    })
    expect(m.scrolled).toBeGreaterThan(400)
    expect(m.headTop).toBeGreaterThanOrEqual(m.barBottom)
    expect(m.onHead).toBe(true)
  })
})
