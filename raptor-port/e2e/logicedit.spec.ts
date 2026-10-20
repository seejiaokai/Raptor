import { test, expect, type Page } from '@playwright/test'
import { login, go } from './app'

/* LE1–LE3 — the Logic page's ✎ Edit in a real browser (21 Oct 26).
   [LOGIC-REDRAW-DROPS-TYPING]: React set the rule list's markup again on every repaint of the app, the same words each
   time (probed: 32,832 characters set again about 1.3s after the page opened), so a value half typed into a box went
   with the old box. [LOGIC-DONE-FIRST-PRESS]: a press on Done saved the box first, the save brought "Reset to standard"
   up beside Done, and on a phone Done moved 77px left between the finger going down and coming up — the press landed on
   nothing and the page stayed in editing. jsdom has no layout and no late repaint; the unit half is
   src/ui/logic.test.tsx. */

const lead = (page: Page) => page.evaluate(() => (window as any).VCONF.reportLead as number)
const editing = (page: Page) => page.locator('#lgDone').isVisible()

async function openEdit(page: Page) {
  await go(page, 'logic')
  await page.locator('#lgEdit').click()
  await expect(page.locator('#lgDone')).toBeVisible()
}

test.describe('the Logic page — desktop', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('LE1 a value typed slowly into a box straight after the page opens is still there, and saved, when the box is left', async ({ page }) => {
    await login(page)
    /* straight in — no settling pause, so the typing below meets the page's own late repaint */
    await page.evaluate(() => (window as any).go('logic'))
    await page.locator('#lgEdit').click()
    const box = page.locator('#lgBody input[data-lgset="reportLead"]')
    /* the box the keyboard should go on to: the next one in the list (nothing between is changed yet) */
    const next = await box.evaluate(b => { const all = [...document.querySelectorAll('#lgBody input')]; return (all[all.indexOf(b as HTMLInputElement) + 1] as HTMLInputElement).dataset.lgset })
    await box.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('2h3')
    /* the app's late recheck lands in this pause (about 1.3s after the page opened, on a free machine) */
    await page.waitForTimeout(2500)
    await page.keyboard.type('0')
    await expect(box, 'the half-typed value survived the pause').toHaveValue('2h30')
    await page.keyboard.press('Tab')
    await expect.poll(() => lead(page)).toBe(150)
    /* the keyboard went on to the next box, not back to the one left — and stayed there through the save's redraw */
    await page.waitForTimeout(300)
    expect(await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.lgset)).toBe(next)
  })

  test('LE2 Done, pressed by mouse straight after a changed value, saves it and ends editing on the first press', async ({ page }) => {
    await login(page)
    await openEdit(page)
    const box = page.locator('#lgBody input[data-lgset="reportLead"]')
    await box.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('2h30')
    const b = (await page.locator('#lgDone').boundingBox())!
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
    await expect.poll(() => lead(page)).toBe(150)
    expect(await editing(page), 'one press ended editing').toBe(false)
    await expect(page.locator('#lgEdit')).toBeVisible()
  })
})

test('LE4 — desktop: a value half typed survives two rebuilds caused elsewhere, is not saved by either, and is saved once the box is left', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await login(page)
  await openEdit(page)
  const box = page.locator('#lgBody input[data-lgset="debrief"]')
  await box.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('1h4')
  /* a setting changed elsewhere, twice — each rebuilds the list (the fix round's read: Chrome tells the box it lost the
     keyboard as the second rebuild removes it, which must not save the half-typed value) */
  for (const len of [100, 101]) {
    await page.evaluate(n => { const w = window as any; w.VCONF.simLen = n; w.ruleApply() }, len)
    await page.waitForTimeout(300)
  }
  expect(await page.evaluate(() => (window as any).VCONF.debrief), 'nothing saved yet').toBe(120)
  await expect(box).toHaveValue('1h4')
  await expect(box).toBeFocused()
  await page.keyboard.type('5'); await page.keyboard.press('Tab')
  await expect.poll(() => page.evaluate(() => (window as any).VCONF.debrief)).toBe(105)
})

test.describe('the Logic page — phone', () => {
  test.use({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true })

  test('LE3 Done, tapped by finger at 402 wide straight after a changed value, saves it and ends editing on the first tap — and Reset to standard then stands beside Edit', async ({ page }) => {
    await login(page)
    await openEdit(page)
    const box = page.locator('#lgBody input[data-lgset="reportLead"]')
    await box.scrollIntoViewIfNeeded()
    await box.tap(); await box.fill('2h30')
    await expect(page.locator('#lgReset'), 'nothing changed was saved yet').toBeHidden()
    const b = (await page.locator('#lgDone').boundingBox())!
    await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
    await expect.poll(() => lead(page)).toBe(150)
    expect(await editing(page), 'one tap ended editing').toBe(false)
    await expect(page.locator('#lgEdit')).toBeVisible()
    await expect(page.locator('#lgReset'), 'the changed value offers its way back').toBeVisible()
  })
})
