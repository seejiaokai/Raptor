/* ROUND 3 OF THE BID WINDOWS, AS DRAWN — the layout a browser alone can see (his D1311, approved whole D1332 / D1334;
   [LW-ROUND3-BUILD], its FULL check, 24 Oct 26). The unit tests run with no stylesheet, so they passed a build whose
   round 3 rules all lost to the bid window's older ones: the file keeps every rule inside one `#page-leavewar` wrapper
   (bidpicker.css's head), and round 3's block had been written after it closed — so the actions row stayed a wrapping
   line, the Remarks and Document row could break, and the ⋯ sat at the window's LEFT edge, 36 wide, its menu opening off
   the window where nothing in it could be pressed (GitHub's run of pull request 569: Post out "intercepted").
   Each check is what a person sees: one row of four even columns (D1330), Remarks · till · Document on one line, the ⋯
   in the fourth place under CL at a leave button's width (D1326), its menu inside the window and pressable, the drag
   window's the same. Runs in both Leave War projects (a phone and a desktop). */
import { expect, test, type Page } from '@playwright/test'
import { lwRole, openLeaveWar, untickApprove } from './app'

const P = 'slipway', D = '2026-02-11', D2 = '2026-02-12'
const T = (id: string) => `[data-testid="${id}"]`

async function boxOf(page: Page, id: string) {
  const b = await page.locator(T(id)).first().boundingBox()
  if (!b) throw new Error(`no box for ${id}`)
  return b
}
async function showFeb(page: Page) {
  await page.locator(T('month-FEB')).click()
  await page.locator(T(`cell-${P}-${D}`)).waitFor({ state: 'attached' })
}
async function openDay(page: Page, d = D) {
  await page.locator(T(`cell-${P}-${d}`)).scrollIntoViewIfNeeded()
  await page.locator(T(`cell-${P}-${d}`)).click()
  await expect(page.locator(T('bid-picker'))).toBeVisible()
}
/** the buttons of a row: one line, even widths, the row's full width */
async function fourEven(page: Page, rowId: string) {
  const row = await boxOf(page, rowId)
  const kids = await page.locator(`${T(rowId)} > .dchip`).evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.right } }))
  expect(kids.length, 'Approve · Refuse · Move · Delete').toBe(4)
  for (const k of kids) {
    expect(Math.abs(k.y - kids[0]!.y), 'one line').toBeLessThan(1)
    expect(Math.abs(k.w - kids[0]!.w), 'even columns').toBeLessThan(1.5)
  }
  expect(Math.abs(kids[0]!.x - row.x), 'from the row\'s left edge').toBeLessThan(1.5)
  expect(Math.abs(kids[3]!.r - (row.x + row.width)), 'to its right edge').toBeLessThan(1.5)
}
/** the ⋯ stands in the fourth place, under the last leave button, its width; its menu opens inside the window */
async function moreInPlace(page: Page, win: string, more: string, under: string, item: string) {
  const m = await boxOf(page, more), u = await boxOf(page, under)
  expect(Math.abs(m.x - u.x), 'the ⋯ under the fourth leave button').toBeLessThan(1.5)
  expect(Math.abs(m.width - u.width), 'the ⋯ the width of the buttons beside it').toBeLessThan(1.5)
  await page.locator(T(more)).click()
  const w = await boxOf(page, win), menu = await boxOf(page, `${more}-menu`)
  expect(menu.x, 'the menu inside the window (left)').toBeGreaterThanOrEqual(w.x - 0.5)
  expect(menu.x + menu.width, 'the menu inside the window (right)').toBeLessThanOrEqual(w.x + w.width + 0.5)
  expect(menu.y, 'the menu inside the window (top)').toBeGreaterThanOrEqual(w.y - 0.5)
  /* a press at the item's own centre meets the item — not the scrim, not the window's clipped edge */
  const hits = await page.locator(`${T(`${more}-menu`)} [role=menuitem]`).evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)) }))
  expect(hits.length).toBeGreaterThan(0)
  expect(hits.every(Boolean), 'every item pressable where it is drawn').toBe(true)
  await page.locator(T(item)).click()
}

test.beforeEach(async ({ page }) => {
  await openLeaveWar(page)
  await lwRole(page, 'admin')
  await showFeb(page)
})

test('the one-day window on a pending bid: one row of four actions, Remarks and Document on one line, the ⋯ in the fourth place', async ({ page }) => {
  await openDay(page)
  await untickApprove(page, 'bid')                         // a pending bid (D1186: the admin's switch starts on)
  await page.locator(T('bid-LL')).click()
  await expect(page.locator(T('bid-picker'))).toHaveCount(0)
  await openDay(page)
  await fourEven(page, 'bid-actions')
  /* Remarks · till · Document: one line — no part of it below the box's own line */
  const rmk = await boxOf(page, 'bid-remarks'), doc = await boxOf(page, 'bid-doc-row'), till = await boxOf(page, 'bid-tl')
  expect(doc.y, 'Document beside the box, not under it').toBeLessThan(rmk.y + rmk.height)
  expect(till.y, 'the till beside the box').toBeLessThan(rmk.y + rmk.height)
  expect(doc.x, 'Document at the right of the box').toBeGreaterThan(rmk.x + rmk.width)
  /* the box writes in the app's own letters, as the window does — never the browser's typewriter face a bare box
     falls back to (its FULL check: `font: 600 13px/1.3 inherit` is not a font, and the browser dropped the line) */
  const fonts = await page.locator(T('bid-remarks')).evaluate(e => ({ box: getComputedStyle(e).fontFamily, win: getComputedStyle(e.closest('.bidsheet')!).fontFamily, size: getComputedStyle(e).fontSize }))
  expect(fonts.box, 'the Remarks box in the window\'s letters').toBe(fonts.win)
  expect(fonts.size).toBe('13px')
  await moreInPlace(page, 'bid-picker', 'bid-more', 'bid-CL', 'bid-postout')
  await expect(page.locator(T('po-confirm'))).toBeVisible()  // Post out's own panel, opened from the menu
})

test('the drag-selection window: the same rows — its ⋯ in the fourth place, its menu inside the window', async ({ page }) => {
  /* a drag across two days of one man, as a person makes it */
  const a = (await boxOf(page, `cell-${P}-${D}`)), b = (await boxOf(page, `cell-${P}-${D2}`))
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 })
  await page.mouse.up()
  await expect(page.locator(T('select-sheet'))).toBeVisible()
  await moreInPlace(page, 'select-sheet', 'sel-more', 'sel-CL', 'sel-postout')
  await expect(page.locator(T('sel-po-confirm'))).toBeVisible()
})
