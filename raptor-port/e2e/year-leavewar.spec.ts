/* THE YEAR ON THE LEAVE WAR GRID (owner D1561, 2 Nov 26 — [LW-YEAR-CLEAR]) AND THE MONTH STRIP OF A PERIOD ACROSS TWO
   YEARS ([LW-MONTHSTRIP-TWO-YEARS]) — measured in a real browser, on a phone and a desktop (the lw-phone and lw-desktop
   projects), because jsdom has no layout and the corner's year is read from where the dates ARE.

   - The pinned corner over the names shows the year of the first date in view, and turns at 1 January in a period
     across two years: 31 December half under the names still reads the old year; 1 January at the edge, the new.
   - The year adds no height: the corner's row is as tall as a date's heading.
   - A two-year period's twelve month buttons ("JAN 29") all stand in view on one line — on the iPhone they ran past
     the right edge, on a desktop MAY 29 and JUN 29 wrapped onto a second line. */
import { expect, test, type Page } from '@playwright/test'
import { openLeaveWar } from './app'

const shownYears = (page: Page) => page.evaluate(() =>
  [...document.querySelectorAll('.lw-yr')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.top < innerHeight }).map(e => e.textContent))

/* the grid scrolled so `iso` is the first date past the frozen columns, `into` px of it under them */
async function gridTo(page: Page, iso: string, into = 0) {
  await expect(page.locator(`[data-testid="head-${iso}"]`)).toBeAttached()
  await page.evaluate(([iso, into]) => {
    const th = document.querySelector(`[data-testid="head-${iso}"]`)!
    const wrap = document.querySelector('.mx-wrap') as HTMLElement
    const bal = document.querySelector('[data-testid="counter-head"]')!.getBoundingClientRect()
    wrap.scrollLeft += th.getBoundingClientRect().left - bal.right + (into as number)
  }, [iso, into] as const)
  await page.waitForTimeout(400)
}

async function newTwoYearPeriod(page: Page) {
  await page.selectOption('[data-testid="war-picker"]', { label: '+ New period' })
  await page.waitForSelector('[data-testid="war-sheet"]')
  await page.fill('[data-testid="war-name"]', 'JUL 28 - JUN 29')
  const at = async () => { const ym = (await page.getAttribute('[data-testid="war"]', 'data-month'))!; return +ym.slice(0, 4) * 12 + (+ym.slice(5, 7) - 1) }
  const goTo = async (iso: string) => {
    let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
    // eslint-disable-next-line react-doctor/async-await-in-loop -- one press after another, each turning the month the next reads
    for (; d > 0; d--) await page.click('[data-testid="war-next"]')
    // eslint-disable-next-line react-doctor/async-await-in-loop -- one press after another, each turning the month the next reads
    for (; d < 0; d++) await page.click('[data-testid="war-prev"]')
  }
  await goTo('2028-07-01'); await page.click('[data-testid="war-day-2028-07-01"]')
  await goTo('2029-06-30'); await page.click('[data-testid="war-day-2029-06-30"]')
  await page.click('[data-testid="war-create"]')
  await expect(page.locator('[data-testid="month-JUN-29"]')).toBeVisible()
}

test('the corner over the names carries the year, adds no height, and turns at 1 January (D1561)', async ({ page }) => {
  await openLeaveWar(page, 'a')
  const corner = await page.evaluate(() => {
    const th = document.querySelector('.mx .mxhead th.who')!
    const day = th.parentElement!.querySelector('th.day')!
    return { h: Math.round(th.getBoundingClientRect().height), dayH: Math.round(day.getBoundingClientRect().height), spill: th.scrollHeight > th.clientHeight + 1, year: th.querySelector('.lw-yr')!.textContent }
  })
  expect(corner.year).toMatch(/^20\d\d$/)
  expect(corner.h, 'no height added').toBe(corner.dayH)
  expect(corner.spill).toBe(false)
  await newTwoYearPeriod(page)
  await page.click('[data-testid="month-DEC-28"]')
  await gridTo(page, '2028-12-31', 6)
  expect(await shownYears(page), '31 Dec half under the names').toEqual(expect.arrayContaining(['2028']))
  expect((await shownYears(page)).every(y => y === '2028')).toBe(true)
  await gridTo(page, '2029-01-01')
  expect((await shownYears(page)).every(y => y === '2029'), '1 Jan at the edge').toBe(true)
  await gridTo(page, '2028-12-30')
  expect((await shownYears(page)).every(y => y === '2028'), 'back into December').toBe(true)
  /* SCROLLED DOWN, THE DATE ROW PINNED AT THE TOP (the normal state on a phone): the pinned bar draws its own copies of
     the corner, and every one of them turns with the dates (the fresh code read's finding 1, 2 Nov 26) */
  await page.evaluate(() => window.scrollBy(0, 1200))
  await expect(page.locator('[data-testid="sticky-head"]')).toBeVisible()
  const allYears = () => page.evaluate(() => [...document.querySelectorAll('.lw-yr')].map(e => e.textContent))
  await gridTo(page, '2028-12-31', 6)
  expect(await allYears(), 'pinned, 31 Dec — every copy of the corner').toEqual(expect.arrayContaining(['2028']))
  expect((await allYears()).every(y => y === '2028')).toBe(true)
  await gridTo(page, '2029-01-01')
  expect((await allYears()).every(y => y === '2029'), 'pinned, 1 Jan at the edge — every copy of the corner').toBe(true)
  const onTop = await page.evaluate(() => {
    const bar = document.querySelector('[data-testid="sticky-head"]')!
    // the copy a person sees: the one whose own cell is what the screen shows at its middle
    const seen = [...bar.querySelectorAll('.lw-yr')].find(e => {
      const r = e.getBoundingClientRect(); if (!r.width) return false
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return !!hit && (hit === e || e.closest('th')!.contains(hit))
    })
    return seen?.textContent
  })
  expect(onTop, 'the corner drawn on top of the pinned bar').toBe('2029')
})

test('a two-year period’s twelve month buttons stand in view on one line ([LW-MONTHSTRIP-TWO-YEARS])', async ({ page }) => {
  await openLeaveWar(page, 'a')
  await newTwoYearPeriod(page)
  const strip = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('[data-testid="month-strip"] .mjump')]
    const rs = btns.map(b => b.getBoundingClientRect())
    return { n: btns.length, right: Math.max(...rs.map(r => r.right)), vw: innerWidth, tops: [...new Set(rs.map(r => Math.round(r.top)))], cut: btns.filter(b => b.scrollWidth > b.clientWidth + 1).length }
  })
  expect(strip.n).toBe(12)
  expect(strip.right, 'the last month in view').toBeLessThanOrEqual(strip.vw)
  expect(strip.tops, 'one line').toHaveLength(1)
  expect(strip.cut, 'no words cut').toBe(0)
})
