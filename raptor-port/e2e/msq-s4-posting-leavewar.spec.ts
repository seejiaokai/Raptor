/* SECTION 4 OF THE MULTI-SQUADRON BUILD — THE LEAVE WAR'S POSTING SHEET IN WAY C, IN A REAL BROWSER (his D2653; his go
   D2732; the plan §21.4 PS4, §22's e2e line as the step-0 read corrected it). Runs in the lw-phone (iPhone 13) and
   lw-desktop (1440×900) projects. Only a browser lays the sheet out, so this holds what the unit tests cannot: the
   choices one row at a desk and two to a line on a phone (SANS alone on the second — as drawn, s4-p-greyed-out), the
   chosen one no taller than its neighbours, "PO from" half the width, the order down the sheet, "Post out" in the app's
   main-button colour, the "Delete Cinch?" card's Delete in the dashed grey look as tall as Cancel, "Undo post out" alone
   at the foot, and his Q3: a press on the day under an open posting closes it, the next press opens the day afresh. The
   pictures it attaches are for the drawing check beside docs/mock/2026-11-25-msq-pick-guard-q3/drawn/s4-*. */
import { expect, test, type Page } from '@playwright/test'
import { openLeaveWar, pressMore } from './app'

const DAY = '2026-12-14'
const box = async (page: Page, sel: string) => (await page.locator(sel).first().boundingBox())!

test.beforeEach(async ({ page }) => {
  await openLeaveWar(page, 'a')
  await page.locator('[data-testid="month-DEC"]').click()
})

async function openPostOut(page: Page, day = DAY) {
  const cell = page.locator(`[data-testid="cell-snap-${day}"]`)
  await cell.scrollIntoViewIfNeeded()
  await cell.click()
  await pressMore(page, 'bid-postout')
  await expect(page.getByTestId('po-confirm')).toBeVisible()
}

test('Post out from a day: the posting alone, in way C\'s order and layout (D2653, D2732)', async ({ page }, info) => {
  await openPostOut(page)
  const sheet = page.getByTestId('bid-picker')
  await expect(sheet.locator('.bidsheet-hd .po-act')).toHaveText('Post out')
  await expect(sheet.getByRole('group', { name: 'Which leave' })).toHaveCount(0)
  const chips = sheet.locator('.po-chips .pchip')
  await expect(chips).toHaveText(['✓ Overseas Sqn', 'Delete', 'SANS'])
  const c = await Promise.all([0, 1, 2].map(i => chips.nth(i).boundingBox()))
  const phone = (page.viewportSize()?.width ?? 1440) <= 520
  if (phone) {
    expect(Math.abs(c[0]!.y - c[1]!.y), 'two to a line').toBeLessThanOrEqual(1)
    expect(c[2]!.y, 'SANS on the second line').toBeGreaterThan(c[0]!.y + c[0]!.height - 1)
    expect(Math.abs(c[2]!.x - c[0]!.x), 'under the first').toBeLessThanOrEqual(1)
  } else {
    expect(Math.abs(c[0]!.y - c[2]!.y), 'one row at a desk').toBeLessThanOrEqual(1)
  }
  expect(Math.abs(c[0]!.height - c[1]!.height), 'the chosen one no taller than its neighbours').toBeLessThanOrEqual(1)
  const form = await box(page, '[data-testid="bid-picker"] .po-form'), date = await box(page, '[data-testid="po-date"]')
  expect(Math.abs(date.width - (form.width - 10) / 2), '"PO from" half the width').toBeLessThanOrEqual(2)
  const line = await box(page, '[data-testid="po-line"]'), go = await box(page, '[data-testid="po-confirm"]')
  expect(c[0]!.y < date.y && date.y < line.y && line.y < go.y, 'choices, date, line, button').toBe(true)
  const [bg, accent] = await page.evaluate(() => [getComputedStyle(document.querySelector('[data-testid="po-confirm"]')!).backgroundColor,
    (() => { const t = document.createElement('div'); t.style.color = 'var(--accent)'; document.querySelector('#page-leavewar')!.appendChild(t); const v = getComputedStyle(t).color; t.remove(); return v })()])
  expect(bg, '"Post out" is the app\'s main button').toBe(accent)
  await info.attach('s4-postout', { body: await sheet.screenshot(), contentType: 'image/png' })
})

/* THE WALK'S W-D FAIL 2 (chat 201, 26 Nov 26): in WebKit — his iPhone's engine — the chosen chip's "✓ " gave its line a
   taller box than the plain words, so on a phone, chips two to a line, the chosen one and its neighbour stood 30 tall and
   SANS alone on the second line 28; Chromium draws all three 30, so the test above (two chips of ONE line, which the row
   stretches alike) could not see it. WebKit's metric is injected here (§7.9 of the order): the chosen chip's line made
   2px taller, as the ✓ makes it there. The rule in its engine-free form: every chip as tall as the tallest, whatever line
   the fonts give — choose each chip in turn, measure all three. */
test('every chip as tall as the tallest, whichever is chosen and whatever line the fonts give (the walk, W-D FAIL 2)', async ({ page }) => {
  await openPostOut(page)
  await page.addStyleTag({ content: '.bidsheet .po-chips .pchip.on { line-height: 18px; }' })
  const chips = page.locator('[data-testid="bid-picker"] .po-chips .pchip')
  for (const pick of ['po-delete', 'po-sans', 'po-overseas']) {
    await page.getByTestId(pick).click()
    const h = await chips.evaluateAll(els => els.map(e => Math.round(e.getBoundingClientRect().height * 10) / 10))
    expect(Math.max(...h) - Math.min(...h), `chips' heights with ${pick} chosen: ${h.join(', ')}`).toBeLessThanOrEqual(0.5)
  }
})

test('Q3: a press on the day under an open posting closes it; the next press opens the day afresh (D2732 Q3)', async ({ page }) => {
  await openPostOut(page)
  const cell = page.locator(`[data-testid="cell-snap-${DAY}"]`)
  const b = (await cell.boundingBox())!
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await expect(page.getByTestId('po-confirm'), 'the first press closes the posting, nothing posted').toHaveCount(0)
  await expect(page.locator(`[data-testid="cell-snap-${DAY}"]`)).not.toHaveClass(/gone/)
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  const sheet = page.getByTestId('bid-picker')
  await expect(sheet.getByRole('group', { name: 'Which leave' }), 'the day\'s sheet, its leave buttons back').toBeVisible()
  await expect(sheet.locator('.po-form')).toHaveCount(0)
})

test('the "Delete Cinch?" card: its Delete in the dashed grey Delete look, as tall as Cancel (D2732 Q4)', async ({ page }, info) => {
  await openPostOut(page)
  await page.getByTestId('po-delete').click()
  await page.getByTestId('po-confirm').click()
  const go = page.getByTestId('po-delete-go'), cancel = page.getByTestId('po-delete-cancel')
  await expect(go).toBeVisible()
  expect(await go.evaluate(e => getComputedStyle(e).borderTopStyle)).toBe('dashed')
  const g = (await go.boundingBox())!, k = (await cancel.boundingBox())!
  expect(Math.abs(g.height - k.height)).toBeLessThanOrEqual(1)
  await info.attach('s4-delete', { body: await page.getByTestId('bid-picker').screenshot(), contentType: 'image/png' })
})

test('an existing posting: "Cinch  Post out", "Undo post out" alone at the foot with the teal Undo arrow (D2732 Q1, Q2)', async ({ page }, info) => {
  await openPostOut(page)
  await page.getByTestId('po-confirm').click()
  await expect(page.locator(`[data-testid="cell-snap-${DAY}"]`)).toHaveClass(/gone/)
  await page.locator('[data-testid="cell-snap-2026-12-15"]').click()
  const sheet = page.getByTestId('postout-sheet')
  await expect(sheet.locator('.bidsheet-hd .po-act')).toHaveText('Post out')
  const undo = page.getByTestId('postout-undo')
  await expect(undo).toHaveText('↶Undo post out')
  await expect(sheet.locator('.po-foot button')).toHaveCount(1)
  const [arrow, accent] = await undo.evaluate(e => [getComputedStyle(e.querySelector('.mvarr')!).color,
    (() => { const t = document.createElement('div'); t.style.color = 'var(--accent)'; e.appendChild(t); const v = getComputedStyle(t).color; t.remove(); return v })()])
  expect(arrow, 'the arrow in teal').toBe(accent)
  await info.attach('s4-existing', { body: await sheet.screenshot(), contentType: 'image/png' })
  await undo.click()
  await expect(page.locator(`[data-testid="cell-snap-${DAY}"]`)).not.toHaveClass(/gone/)
})
