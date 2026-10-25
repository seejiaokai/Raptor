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

/* since D1349 / D1356 (25 Oct 26) the third place is Grant OIL, in OIL given's green (D1320); UNA went */
test('the row under the leaves: CSE · OD · Grant OIL under LL · OL · OIL, as wide, the ⋯ under CL; each its kind\'s colour', async ({ page }) => {
  await openDay(page)
  for (const [mine, under] of [['bid-file-CSE', 'bid-LL'], ['bid-file-OD', 'bid-OL'], ['bid-oil', 'bid-OIL'], ['bid-more', 'bid-CL']]) {
    const m = await boxOf(page, mine!), u = await boxOf(page, under!)
    expect(Math.abs(m.x - u.x), `${mine} under ${under}`).toBeLessThan(1.5)
    expect(Math.abs(m.width - u.width), `${mine} as wide as ${under}`).toBeLessThan(1.5)
  }
  const boxes = await Promise.all(['bid-file-CSE', 'bid-file-OD', 'bid-oil', 'bid-more'].map(id => boxOf(page, id)))
  for (const b of boxes) expect(Math.abs(b.y - boxes[0]!.y), 'one line').toBeLessThan(1)
  /* one height too: the ⋯'s glyph and the chips' words differ in height under Linux's fonts, and centred in the row they
     stood a pixel apart on GitHub's run while his PC's fonts hid it — the row stretches each to its full height */
  for (const b of boxes) expect(Math.abs(b.height - boxes[0]!.height), 'one height').toBeLessThan(1)
  /* the colours his drawings painted (set C, D1316; D1325) — each kind's own, filled */
  const paint = (id: string) => page.locator(T(id)).evaluate(e => getComputedStyle(e).backgroundColor)
  expect(await paint('bid-file-OD')).toBe('rgba(128, 142, 160, 0.58)')
  expect(await paint('bid-file-CSE')).toBe('rgba(160, 100, 240, 0.36)')
})

/* ROUND 2's FULL check, the walk in Safari's engine (H1, WebKit — his iPhone): the row under the leaves stood 30 tall under
   leave buttons 28 tall. Safari sets the chips' 12px words on a shorter line than Chrome does, and the ⋯ — its 16px glyph on
   its own line height plus the chips' padding — then set the row's height. The row is to stand as tall as the leave rows
   above it whatever line the fonts give: here the chips are given Safari's line, which Chrome alone never shows. */
test('the row under the leaves stands as tall as the leave buttons above it, on Safari’s shorter line too', async ({ page }) => {
  await openDay(page)
  await page.addStyleTag({ content: '.bidsheet .tchip.lv { line-height: 14px; }' })
  await page.waitForTimeout(100)
  const ll = await boxOf(page, 'bid-LL')
  for (const id of ['bid-file-CSE', 'bid-file-OD', 'bid-oil', 'bid-more']) {
    const b = await boxOf(page, id)
    expect(Math.abs(b.height - ll.height), `${id} as tall as LL (${b.height} vs ${ll.height})`).toBeLessThan(1)
  }
})

/* AN OTHER FROM THE ⋯ (his D1365): straight under Unavailable, on the window's Duration — the day shows its outlined box */
test('an admin’s Other from the ⋯ files at once: the window closes and the day shows the outlined OTH', async ({ page }) => {
  await openDay(page)
  await page.locator(T('bid-more')).click()
  await page.locator(T('bid-file-OTH')).click()
  await expect(page.locator(T('bid-picker'))).toHaveCount(0)
  await expect(page.locator(`${T(`cell-${P}-${D}`)} .c.k-unav`)).toHaveCount(1)
})

/* AN ATTACH FROM THE ⋯ (his D1378–D1380): first in the ⋯, straight under Unavailable, on the window's Duration — ATCH outlined */
test('an admin’s Attach from the ⋯ files at once: the window closes and the day shows the outlined ATCH', async ({ page }) => {
  await openDay(page)
  await page.locator(T('bid-more')).click()
  await expect(page.locator(`${T('bid-more-menu')} [role=menuitem]`).first()).toHaveText('Attach')
  await page.locator(T('bid-file-ATCH')).click()
  await expect(page.locator(T('bid-picker'))).toHaveCount(0)
  await expect(page.locator(`${T(`cell-${P}-${D}`)} .c.k-unav`)).toHaveText('ATCH')
})

/* THE JOINED BAR AND THE OUTLINED COMMITMENT, AS PAINTED (D1359, D1370 — the M3 build's FULL check, walker 1's F1): the
   rules sat after this file set's #page-leavewar wrapper, so the wrapper's own rules beat them and every run of days drew
   as separate boxes, and the outline as the generic edge. Only a real browser computes the cascade. */
test('a leave over three days paints as one bar, its code once; a commitment under Unavailable wears D1370 outline', async ({ page }) => {
  await page.locator(T('month-FEB')).click()
  const days = ['2026-02-09', '2026-02-10', '2026-02-11']
  for (const d of days) await page.locator(T(`cell-${P}-${d}`)).waitFor({ state: 'attached' })
  await page.evaluate(([p, ds]) => { for (const d of ds as string[]) (window as any).lwSetCell(p, d, 'LL') }, [P, days] as const)
  const read = (d: string) => page.locator(`${T(`cell-${P}-${d}`)} .c`).first().evaluate(e => {
    const s = getComputedStyle(e)
    return { cls: e.className, left: s.left, right: s.right, color: s.color, tr: s.borderTopRightRadius, tl: s.borderTopLeftRadius }
  })
  const [a, b, c] = [await read(days[0]!), await read(days[1]!), await read(days[2]!)]
  expect(a.cls).toMatch(/\bjr\b/); expect(b.cls).toMatch(/\bjl\b.*\bjr\b|\bjr\b.*\bjl\b/); expect(c.cls).toMatch(/\bjl\b/)
  expect(a.right, 'the first day reaches over the day line').toBe('-1px')
  expect(a.tr).toBe('0px')
  expect(b.left, 'the middle day starts at its cell\u2019s edge').toBe('0px')
  expect(b.right).toBe('-1px')
  expect(b.color, 'the code once, at the start').toBe('rgba(0, 0, 0, 0)')
  expect(c.left).toBe('0px'); expect(c.tl).toBe('0px')
  /* an Other filed straight under Unavailable: D1370's 1.5px edge at .78 */
  await page.locator(T(`cell-${P}-2026-02-13`)).scrollIntoViewIfNeeded()
  await page.locator(T(`cell-${P}-2026-02-13`)).click()
  await page.locator(T('bid-more')).click()
  await page.locator(T('bid-file-OTH')).click()
  const sh = await page.locator(`${T(`cell-${P}-2026-02-13`)} .c.k-unav`).evaluate(e => getComputedStyle(e).boxShadow)
  expect(sh).toContain('1.5px')
  expect(sh).toContain('0.78')
  /* …and one over three days, joined: every day keeps D1370's 1.5px edge at .78, not the leave's 1px join (the code read's Q8) */
  const od = ['2026-02-16', '2026-02-17', '2026-02-18']
  await page.evaluate(p => (window as any).fileInput({ person: p, type: 'Other', date: 'Feb 16', endDate: 'Feb 18', yr: 2026, allday: true, acc: 'u', remarks: 'Board of inquiry' }), P)
  for (const d of od) {
    const cell = page.locator(`${T(`cell-${P}-${d}`)} .c.k-unav`).first()
    await cell.waitFor({ state: 'attached' })
    const got = await cell.evaluate(e => ({ cls: e.className, sh: getComputedStyle(e).boxShadow }))
    expect(got.cls, `${d} is part of the joined bar`).toMatch(/\bj[lr]\b/)
    expect(got.sh, `${d}`).toContain('1.5px')
    expect(got.sh, `${d}`).toContain('0.78')
  }
})
