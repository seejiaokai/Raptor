/* ROUND 2 — A COURSE, AN OVERSEAS DUTY AND THE UNFORESEEN ABSENCE FILED ON THE LEAVE WAR, as drawn (his D1318, D1324,
   D1325, D1326 — scripts/handpass/lw-round2-odcrs.mjs; [LW-FILE-OD-CRS]). What a browser alone can see: the row under the
   leaves is four even places — CSE · OD · UNA in the first three (UNA an admin's, the Leave War's own — D1338), each under
   its leave button and as wide, the ⋯ in the fourth under CL; UNA painted deep teal, OD slate, CSE purple; a tap files or
   places it, the window closes and the grid shows the box.
   Runs in both Leave War projects (a phone and a desktop). */
import { expect, test, type Page } from '@playwright/test'
import { lwRole, openLeaveWar } from './app'

const P = 'slipway', D = '2026-02-11'
const T = (id: string) => `[data-testid="${id}"]`

async function boxOf(page: Page, id: string) {
  const b = await page.locator(T(id)).first().boundingBox()
  if (!b) throw new Error(`no box for ${id}`)
  return b
}
async function openDay(page: Page, d = D) {
  await page.locator(T('month-FEB')).click()
  await page.locator(T(`cell-${P}-${d}`)).waitFor({ state: 'attached' })
  await page.locator(T(`cell-${P}-${d}`)).scrollIntoViewIfNeeded()
  await page.locator(T(`cell-${P}-${d}`)).click()
  await expect(page.locator(T('bid-picker'))).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await openLeaveWar(page)
  await lwRole(page, 'admin')
})

test('the row under the leaves: CSE · OD · UNA under LL · OL · OIL, as wide, the ⋯ under CL; each its kind\'s colour', async ({ page }) => {
  await openDay(page)
  for (const [mine, under] of [['bid-file-CSE', 'bid-LL'], ['bid-file-OD', 'bid-OL'], ['bid-una', 'bid-OIL'], ['bid-more', 'bid-CL']]) {
    const m = await boxOf(page, mine!), u = await boxOf(page, under!)
    expect(Math.abs(m.x - u.x), `${mine} under ${under}`).toBeLessThan(1.5)
    expect(Math.abs(m.width - u.width), `${mine} as wide as ${under}`).toBeLessThan(1.5)
  }
  const boxes = await Promise.all(['bid-file-CSE', 'bid-file-OD', 'bid-una', 'bid-more'].map(id => boxOf(page, id)))
  for (const b of boxes) expect(Math.abs(b.y - boxes[0]!.y), 'one line').toBeLessThan(1)
  /* one height too: the ⋯'s glyph and the chips' words differ in height under Linux's fonts, and centred in the row they
     stood a pixel apart on GitHub's run while his PC's fonts hid it — the row stretches each to its full height */
  for (const b of boxes) expect(Math.abs(b.height - boxes[0]!.height), 'one height').toBeLessThan(1)
  /* the colours his drawings painted (set C, D1316; D1325) — each kind's own, filled */
  const paint = (id: string) => page.locator(T(id)).evaluate(e => getComputedStyle(e).backgroundColor)
  expect(await paint('bid-una')).toBe('rgba(20, 130, 130, 0.7)')
  expect(await paint('bid-file-OD')).toBe('rgba(128, 142, 160, 0.58)')
  expect(await paint('bid-file-CSE')).toBe('rgba(160, 100, 240, 0.36)')
})

test('an admin’s tap on UNA places it at once (D1338): the window closes and the day shows its teal box', async ({ page }) => {
  await openDay(page)
  await page.locator(T('bid-una')).click()
  await expect(page.locator(T('bid-picker'))).toHaveCount(0)
  await expect(page.locator(`${T(`cell-${P}-${D}`)} .c.k-una`)).toHaveCount(1)
})
