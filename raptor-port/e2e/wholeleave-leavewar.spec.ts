/* A LEAVE OF SEVERAL DAYS OPENS WHOLE (his D1448, D1461 — version 2, drawn by scripts/handpass/lw-whole-leave-mock.mjs;
   [LW-WHOLE-LEAVE-WINDOW]). What only a browser can see: "All <n> days" and the day tapped stand at the Duration row's right
   end on ONE line with Whole day · AM · PM, their words inside their edges, the longest labels too ("All 14 days" beside
   "Wed 30"); switching between them leaves the window's height alone (the window keeps its height — D1461); and the grid's
   cells the window acts on wear the selection's cyan (D1289). Runs in both Leave War projects (a phone and a desktop). */
import { expect, test, type Page } from '@playwright/test'
import { lwRole, openLeaveWar } from './app'

const P = 'slipway'
const T = (id: string) => `[data-testid="${id}"]`

async function place(page: Page, from: string, n: number, code = 'LL') {
  await page.evaluate(({ p, from, n, code }) => {
    const w = window as any
    for (let i = 0; i < n; i++) {
      const d = new Date(from + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + i)
      if (!w.lwSetCell(p, d.toISOString().slice(0, 10), code)) throw new Error('not placed ' + i)
    }
  }, { p: P, from, n, code })
}
async function openDay(page: Page, month: string, d: string) {
  await page.locator(T(`month-${month}`)).click()
  const c = page.locator(T(`cell-${P}-${d}`))
  await c.waitFor({ state: 'attached' })
  await c.scrollIntoViewIfNeeded()
  await c.click()
  await expect(page.locator(T('bid-picker'))).toBeVisible()
}
/** the Duration row: every button's top, and whether any button's words run past its edge or the row past the window */
async function durRow(page: Page) {
  return page.locator(`${T('bid-picker')} .bp-dur`).evaluate(row => {
    const sheet = row.closest('[data-testid="bid-picker"]')!.getBoundingClientRect()
    const bs = [...row.querySelectorAll('button')]
    /* the room the row's buttons need on one line: their widths and the gaps between them (the row's own gap, the chips' 6px) */
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0
    const need = bs.reduce((a, b) => a + b.getBoundingClientRect().width, 0) + gap * (bs.length - 2) + 6
    const chips = bs.filter(b => b.closest('.bp-scope'))
    return {
      /* ONE LINE WHERE THE ROW HAS THE ROOM — his iPhone at 402 (measured with Arial, close to Apple's letters: 342 of 352
         for the longest labels); with letters wider still (Linux's, on GitHub's machines) the two chips go to the next line
         together, whole — never a chip broken (the design guide's wrap) */
      fits: need <= row.getBoundingClientRect().width + 0.5,
      chipsTogether: new Set(chips.map(b => Math.round(b.getBoundingClientRect().top))).size <= 1,
      tops: [...new Set(bs.map(b => Math.round(b.getBoundingClientRect().top)))],
      clipped: bs.filter(b => b.scrollWidth > b.clientWidth + 1).map(b => b.textContent),
      pastEdge: bs.some(b => b.getBoundingClientRect().right > sheet.right - 4),
      height: Math.round(row.getBoundingClientRect().height),
    }
  })
}

/* LETTERS OF ARIAL'S WIDTHS ON EVERY MACHINE (the code read's F2): close to Apple's on his iPhone (measured 28 Oct 26 at
   402: the longest labels need 342 of the row's 352), and the same on this PC (Arial) and on GitHub's Linux machines
   (Liberation Sans, Arial's metric twin) — so "one line at his phone's width" is asserted outright, wherever it runs; the
   very wide letters' wrap has a block of its own below */
const ARIAL = '#page-leavewar, #page-leavewar * { font-family: Arial, "Liberation Sans", sans-serif !important }'
test.beforeEach(async ({ page }) => {
  await openLeaveWar(page)
  await lwRole(page, 'admin')
  await page.addStyleTag({ content: ARIAL })
  /* the phone project is an iPhone 13 (390 wide): his iPhone is 402 */
  const v = page.viewportSize()
  if (v && v.width < 500) await page.setViewportSize({ width: 402, height: 874 })
})

test('a four-day leave: the choice on one line with Duration, the window\'s height unchanged by it, the leave\'s days marked', async ({ page }) => {
  await place(page, '2026-02-09', 4)
  await openDay(page, 'FEB', '2026-02-10')
  await expect(page.locator(T('scope-all'))).toHaveText('All 4 days')
  await expect(page.locator(T('scope-day'))).toHaveText('Tue 10')
  const all = await durRow(page)
  expect(all.tops, 'one line').toHaveLength(1)
  expect(all.clipped, 'no words past their edge').toEqual([])
  expect(all.pastEdge, 'inside the window').toBe(false)
  /* THE CHOICE ADDS NO HEIGHT (D1461 — "the window keeps its height"): the same rows on "All" and on the day, the Duration
     row as tall in both. (The manning line at the top may take a line more on "All" — it reads the leave's four days, not
     one: what it says, not the choice's room.) */
  const rows = () => page.locator(`${T('bid-picker')} > .bidsheet-row, ${T('bid-picker')} .bidsheet-row`).count()
  const nAll = await rows()
  expect(await page.locator('td.selcell').count(), 'the four days marked').toBe(4)
  await page.locator(T('scope-day')).click()
  expect(await rows(), 'no row added or taken by the choice').toBe(nAll)
  expect(Math.abs((await durRow(page)).height - all.height), 'the Duration row as tall on the day').toBeLessThan(1)
  expect(await page.locator('td.selcell').count(), 'only the day tapped').toBe(1)
  /* the row stands as tall as a single day's Duration row, "Pick a range" at its end */
  await page.locator(T('bid-cancel')).click()
  expect(await page.locator('td.selcell').count(), 'none once closed').toBe(0)
  await place(page, '2026-02-16', 1)
  await openDay(page, 'FEB', '2026-02-16')
  await expect(page.locator(T('span-range'))).toHaveText('Pick a range')
  expect(Math.abs((await durRow(page)).height - all.height), 'the row as tall as a single day\'s').toBeLessThan(1)
})

test('the longest labels — "All 14 days" beside "Wed 30" — still stand on one line, inside the window', async ({ page }) => {
  await place(page, '2026-09-17', 14)
  await openDay(page, 'SEP', '2026-09-30')
  await expect(page.locator(T('scope-all'))).toHaveText('All 14 days')
  await expect(page.locator(T('scope-day'))).toHaveText('Wed 30')
  const r = await durRow(page)
  expect(r.tops, 'one line').toHaveLength(1)
  expect(r.clipped).toEqual([])
  expect(r.pastEdge).toBe(false)
  await expect(page.locator(`${T('bid-picker')} .bidsheet-hd .when`)).toHaveText('17–30 Sep')
  /* with very wide letters (the project's stress test — e2e/leavewar.spec.ts "with wide letters") the chips go to the next
     line together, whole, inside the window */
  await page.addStyleTag({ content: '#page-leavewar, #page-leavewar * { font-family: Verdana, "DejaVu Sans", sans-serif !important }' })
  await page.waitForTimeout(150)
  const v = await durRow(page)
  expect(v.tops.length, 'one line where the row has the room').toBe(v.fits ? 1 : 2)
  expect(v.chipsTogether, 'the two chips together').toBe(true)
  expect(v.clipped).toEqual([])
  expect(v.pastEdge).toBe(false)
})
