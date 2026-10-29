import { test, expect, type Page } from '@playwright/test'
import { login, go } from './app'

/* ESCAPE ON THE SCHEDULER BOARD, AND THE BAR OVER THE TRAFFIC WINDOW (the night of 30 Oct 26, job 4).

   [TRAFFIC-WIN-COVERS-UNDO] — the airspace Traffic window's veil lay over the whole screen, the top bar with it: a real
   press on Undo met the veil (the walk of 21 Oct 26: the click timed out at both sizes). Only a browser can see that —
   jsdom lets every click through — so this is the test that is red on `main`: at the Undo button's middle the browser
   finds the button, a real mouse press there takes the line back, the window stays open and shows it; the same on the
   Scheduler Board's own bar; the box is held below the bar on a short screen; and any other control of the bar (the
   bell) closes the window first and opens what it opens on top.

   [BOARD-ESCAPE-CLOSE] — Escape closes the board as ✓ Done does, with real keys: from nowhere; in a take-off box it puts
   the old time back first and the board stays; with a window over the board (the Traffic window), the board stays.
   The rules: ui/boardescape.ts; every order of them in jsdom: ui/boardescape.test.tsx, ui/trafficwin.test.tsx. */

const DESK = { width: 1229, height: 584 }        // his PC: 1536 × 730 at 125%, in the page's own pixels
const PHONE = { width: 402, height: 874 }        // his iPhone's screen

/* the first wave of the day with a Traffic button, on the surface given */
async function trafficButton(page: Page, within: string) {
  const b = page.locator(`${within} [data-air]:visible`).first()
  await expect(b, 'a Traffic button').toBeVisible()
  return b
}
/* what the browser finds at a control's middle — the control itself, or what lies over it */
async function hitAt(page: Page, sel: string) {
  return page.evaluate(s => {
    const el = [...document.querySelectorAll(s)].find(e => (e as HTMLElement).offsetWidth) as HTMLElement | undefined
    if (!el) return { found: false, isIt: false, over: '' }
    const r = el.getBoundingClientRect()
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) as HTMLElement | null
    return { found: true, isIt: !!hit && (hit === el || el.contains(hit)), over: hit ? (hit.id || hit.className || hit.tagName) : '' }
  }, sel)
}
/* the window's box against the bar over it */
async function boxAgainstBar(page: Page, bar: string) {
  return page.evaluate(b => {
    const box = document.querySelector('#airpop:not([hidden]) .airpop-box') as HTMLElement
    const q = ([...document.querySelectorAll(b)].find(e => (e as HTMLElement).offsetHeight) as HTMLElement).getBoundingClientRect()
    const r = box.getBoundingClientRect()
    return { boxTop: r.top, boxFoot: r.bottom, barFoot: q.bottom, vh: innerHeight }
  }, bar)
}
const lines = (page: Page) => page.locator('#airBody [data-airi]').evaluateAll(bs => bs.map(b => (b as HTMLInputElement).value))

for (const [name, size] of [['his PC', DESK], ['his iPhone', PHONE]] as const) {
  test.describe(`[TRAFFIC-WIN-COVERS-UNDO] ${name} (${size.width}×${size.height})`, () => {
    test.use({ viewport: size, hasTouch: size === PHONE })

    test('Edit Schedule: the top bar\'s Undo can be pressed over the Traffic window, and the window shows what it took back', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      await (await trafficButton(page, '#eWeek')).click()
      await expect(page.locator('#airpop:not([hidden])')).toBeVisible()
      const before = await lines(page)
      await page.locator('#airAdd').click()
      await expect.poll(() => lines(page).then(l => l.length)).toBe(before.length + 1)
      const at = await hitAt(page, '#undoBtn')
      expect(at.found, 'the top bar\'s Undo is on screen').toBe(true)
      expect(at.isIt, `a press at Undo's middle meets Undo, not ${at.over}`).toBe(true)
      await page.locator('#undoBtn').click({ timeout: 3000 })
      await expect(page.locator('#airpop:not([hidden])'), 'the window stays open through Undo').toBeVisible()
      await expect.poll(() => lines(page), { message: 'the line added is gone from the window' }).toEqual(before)
      await page.locator('#redoBtn').click({ timeout: 3000 })
      await expect.poll(() => lines(page).then(l => l.length), { message: 'Redo puts it back' }).toBe(before.length + 1)
      const m = await boxAgainstBar(page, '.topbar:has(#burger)')
      expect(m.boxTop, `the box's top (${m.boxTop}) is below the bar's foot (${m.barFoot})`).toBeGreaterThanOrEqual(m.barFoot - 0.5)
      expect(m.boxFoot, 'and its foot is on the screen').toBeLessThanOrEqual(m.vh + 0.5)
      await page.locator('#undoBtn').click()
      await page.locator('#airDone').click()
    })

    test('the Scheduler Board: its own Undo can be pressed over the Traffic window', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      await page.locator('#eWeek .day[data-day="0"] .dt.sb-open').click()
      await expect(page.locator('#schedBoard:not([hidden])')).toBeVisible()
      await (await trafficButton(page, '#sbBoard')).click()
      await expect(page.locator('#airpop:not([hidden])')).toBeVisible()
      const before = await lines(page)
      await page.locator('#airAdd').click()
      await expect.poll(() => lines(page).then(l => l.length)).toBe(before.length + 1)
      const at = await hitAt(page, '#sbUndo')
      expect(at.isIt, `a press at the board's Undo meets it, not ${at.over}`).toBe(true)
      await page.locator('#sbUndo').click({ timeout: 3000 })
      await expect(page.locator('#airpop:not([hidden])')).toBeVisible()
      await expect.poll(() => lines(page)).toEqual(before)
      const m = await boxAgainstBar(page, '#schedBoard .sb-top')
      expect(m.boxTop, `the box's top (${m.boxTop}) is below the board's bar (${m.barFoot})`).toBeGreaterThanOrEqual(m.barFoot - 0.5)
      await page.locator('#airDone').click()
    })

    test('any other control of the bar closes the window first: the bell\'s list opens on top', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      await (await trafficButton(page, '#eWeek')).click()
      await expect(page.locator('#airpop:not([hidden])')).toBeVisible()
      await page.locator('#notifyBell').click({ timeout: 3000 })
      await expect(page.locator('#airpop:not([hidden])'), 'the Traffic window closed').toHaveCount(0)
      await expect(page.locator('[data-testid="bell-list"]')).toBeVisible()
      const at = await hitAt(page, '[data-testid="bell-list"]')
      expect(at.isIt, `the bell's list is on top, not ${at.over}`).toBe(true)
    })
  })
}

test.describe('[BOARD-ESCAPE-CLOSE] Escape on the Scheduler Board, real keys', () => {
  test.use({ viewport: DESK })

  test('from nowhere it closes the board; in a take-off box it puts the old time back first; over a window it waits', async ({ page }) => {
    await login(page); await go(page, 'editsched')
    const open = page.locator('#schedBoard:not([hidden])')
    await page.locator('#eWeek .day[data-day="0"] .dt.sb-open').click()
    await expect(open).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(open, 'Escape closed the board').toHaveCount(0)

    await page.locator('#eWeek .day[data-day="1"] .dt.sb-open').click()
    await expect(open).toBeVisible()
    const box = page.locator('#sbBoard input.tm[data-bfld$=".to"]').first()
    const was = await box.inputValue()
    await box.click()
    await page.keyboard.type('2359')
    await page.keyboard.press('Escape')
    await expect(box, 'the old time is back').toHaveValue(was)
    await expect(open, 'the board stays').toBeVisible()
    await page.keyboard.press('Escape')
    await expect(open, 'the next Escape closes it').toHaveCount(0)

    await page.locator('#eWeek .day[data-day="2"] .dt.sb-open').click()
    await (await trafficButton(page, '#sbBoard')).click()
    await expect(page.locator('#airpop:not([hidden])')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(open, 'with the Traffic window over it, the board stays').toBeVisible()
    await page.locator('#airDone').click()
    await page.keyboard.press('Escape')
    await expect(open).toHaveCount(0)
  })
})
