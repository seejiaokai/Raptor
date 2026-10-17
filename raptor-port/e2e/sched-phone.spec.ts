/* THE SCHEDULING PAGES ON A PHONE — the small fixes of 18 Oct 26 (owner D994: "the small things next"; the batch's
   check: docs/handpass/2026-10-18-sched-phone.md). [SCHED-INPUT-WINDOW-PHONE], the one-rule walk's D4 and D7 (12 Oct 26):

   (1) the window a Personal Inputs line opens on Edit Schedule and the Scheduler Board kept its family's 80vh cap — on a
       phone it is as tall as what is in it, up to the visible screen less 24px (owner D706), standing in the middle of
       the screen (owner D995 — the batch had put it at the foot, as D537 has the phone's other windows);
   (2) a finger on that window never scrolls the schedule behind it (owner D686);
   (3) a phone on its side (844 × 390): the Inputs list no longer widens the page, so "+ Input" opens on the screen
       with its Add and Cancel in reach.

   By touch, in a phone's own browser (isMobile + hasTouch) — the layout viewport there widens to what the page holds,
   which is how (3) put a window off the screen. */
import { expect, test } from '@playwright/test'
import type { Browser, Page } from '@playwright/test'
import { go, login } from './app'

async function phone(browser: Browser, baseURL: string | undefined, width: number, height: number) {
  const context = await browser.newContext({ baseURL, viewport: { width, height }, isMobile: true, hasTouch: true })
  const page: Page = await context.newPage()
  await login(page)
  return { context, page }
}

/* the window's door: the title of the first Personal Inputs line of Monday, on the week or the board */
async function openFromSchedule(page: Page, onBoard: boolean) {
  await go(page, 'editsched')
  if (onBoard) {
    await page.locator('#eWeek [data-sbday="0"]:visible').tap()
    await page.locator('#sbBoard .sb-sec').first().waitFor({ state: 'attached' })
    if (!(await page.locator('#schedBoard [data-inpedit]:visible').count())) await page.locator('#schedBoard [data-pitog="0"]:visible').tap()
  }
  const door = page.locator(`${onBoard ? '#schedBoard' : '#eWeek .day[data-day="0"]'} [data-inpedit]:visible`).first()
  await door.scrollIntoViewIfNeeded()
  await door.tap()
  await page.waitForSelector('#inpEditPop:not([hidden]) .airpop-box')
  await page.waitForTimeout(250)
}

const winBox = (page: Page) => page.evaluate(() => {
  const b = document.querySelector('#inpEditPop .airpop-box') as HTMLElement
  const r = b.getBoundingClientRect()
  return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), h: Math.round(r.height), content: b.scrollHeight, vh: window.innerHeight }
})

for (const [where, onBoard] of [['Edit Schedule', false], ['the Scheduler Board', true]] as const) {
  for (const height of [844, 568]) {
    test(`a phone ${height} tall, ${where}: an input's window is as tall as what is in it, up to the screen less 24px, in the middle of the screen (D706, D995)`, async ({ browser, baseURL }) => {
      const { context, page } = await phone(browser, baseURL, 390, height)
      try {
        await openFromSchedule(page, onBoard)
        const w = await winBox(page)
        const want = Math.min(w.content + 2, height - 24)   // the box's own 1px border, each side
        expect(Math.abs(w.h - want), `the window's height ${w.h} against what is in it (${w.content}) and the screen (${height})`).toBeLessThanOrEqual(2)
        expect(Math.abs(w.top - (height - w.bottom)), `it stands in the middle of the screen: ${w.top}px above it, ${height - w.bottom}px below`).toBeLessThanOrEqual(1)
        expect(w.top, 'its top stays on the screen, 12px clear at least').toBeGreaterThanOrEqual(12)
        expect(w.left, 'and inside its sides').toBeGreaterThanOrEqual(0)
        expect(w.right).toBeLessThanOrEqual(390)
        await page.screenshot({ path: test.info().outputPath('window.png') })
      } finally { await context.close() }
    })
  }

  test(`a phone, ${where}: a finger on an input's window never scrolls the schedule behind it (D686)`, async ({ browser, baseURL }) => {
    const { context, page } = await phone(browser, baseURL, 390, 568)
    try {
      await openFromSchedule(page, onBoard)
      /* what is behind must be able to move, or a still page proves nothing: the week scrolls the document; on a phone
         the board is a full-screen layer that scrolls its own column (.sb-main), with the document behind it — both
         are watched, whichever the window sits over */
      const read = () => page.evaluate(board => {
        const doc = document.scrollingElement as HTMLElement
        const main = board ? document.querySelector('#schedBoard .sb-main') as HTMLElement : null
        return { page: Math.round(doc.scrollTop) + ':' + (main ? Math.round(main.scrollTop) : '-'),
          room: main ? main.scrollHeight - main.clientHeight : doc.scrollHeight - doc.clientHeight }
      }, onBoard)
      const r0 = await read()
      expect(r0.room, 'the schedule behind could scroll').toBeGreaterThan(200)
      const w = await winBox(page)
      const cdp = await context.newCDPSession(page)
      const swipe = async (dy: number) => {
        const x = 195, y0 = Math.round(w.top + w.h * (dy < 0 ? 0.75 : 0.25))
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0, id: 1 }] })
        for (let d = 1; d <= 10; d++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + dy * d / 10, id: 1 }] }); await page.waitForTimeout(16) }
        await page.waitForTimeout(90)   // a finger rests before it lifts (docs/walk-scripts.md §4)
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(500)
      }
      /* up, past the window's foot; then down, past its top — the page behind stays where it stood throughout */
      for (const dy of [-200, -200, -200, 200, 200, 200, 200]) {
        await swipe(dy)
        expect((await read()).page, `after a swipe of ${dy}px the schedule behind has not moved`).toBe(r0.page)
      }
      await cdp.detach()
    } finally { await context.close() }
  })
}

test('a phone on its side (844 × 390): the Inputs list stays the screen\'s width, and "+ Input" opens on the screen with Add and Cancel in reach', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL, 844, 390)
  try {
    await go(page, 'inputs')
    if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await page.locator('#inListBtn').tap()
    await expect(page.locator('#intbl')).toBeVisible()
    const width = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, inner: window.innerWidth }))
    expect(width.doc, 'the list does not widen the page past the screen').toBeLessThanOrEqual(844)
    await page.locator('#inNew').tap()
    const win = page.locator('[data-testid="win-inputedit"]')
    await expect(win).toBeVisible()
    const at = await page.evaluate(() => {
      const r = (s: string) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, hit: !!hit && (hit === e || e.contains(hit)) } }
      return { win: r('[data-testid="win-inputedit"]'), save: r('#inpEditSave'), cancel: r('#inpEditCancel'), x: r('[data-testid="win-inputedit-x"]'), inner: window.innerWidth }
    })
    expect(at.inner, 'the screen is still 844 wide with the window up').toBe(844)
    expect(at.win!.right, 'the window\'s right edge is on the screen').toBeLessThanOrEqual(844)
    for (const k of ['save', 'cancel', 'x'] as const) {
      expect(at[k]!.right, `${k}: on the screen`).toBeLessThanOrEqual(844)
      expect(at[k]!.hit, `${k}: a finger at its middle meets it`).toBe(true)
    }
    await page.screenshot({ path: test.info().outputPath('side.png') })
    /* and Cancel, pressed by a finger, closes it */
    await page.locator('#inpEditCancel').tap()
    await expect(win).toHaveCount(0)
  } finally { await context.close() }
})

/* D997 (18 Oct 26 — "All in the middle"): on a phone every window that pops up for a task stands in the middle of the
   screen — a short one visibly so (the Inputs calendar's settings, here), a tall one filling it as before; the day
   panels pulled up and down by their bar, and the ALL AVAIL and changes windows, stay at the foot. */
test('a phone: a short pop-up window (the Inputs calendar’s settings) stands in the middle of the screen (D997)', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL, 390, 844)
  try {
    await go(page, 'inputs')
    await page.locator('#inGear').tap()
    const win = page.locator('.floatwin:not([hidden])').first()
    await expect(win).toBeVisible()
    await page.waitForTimeout(400)
    const b = (await win.boundingBox())!
    const above = Math.round(b.y), below = Math.round(844 - (b.y + b.height))
    expect(b.height, 'a short window: shorter than the screen').toBeLessThan(844 - 24 - 40)
    expect(Math.abs(above - below), `in the middle: ${above}px above it, ${below}px below`).toBeLessThanOrEqual(1)
    expect(Math.round(b.x), 'and 12px from the sides').toBe(12)
    await page.screenshot({ path: test.info().outputPath('settings.png') })
  } finally { await context.close() }
})
