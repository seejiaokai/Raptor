/* AN ENTRY OF SEVERAL DAYS FILED ON THE INPUTS PAGE OPENS WHOLE, AND THE PICKED DAYS SHOW ON HIS OWN ROW (his D1565, D1569 —
   [LW-INPUT-RANGE-WHOLE], [LW-OWN-ROW-SELMARK], 2 Nov 26). What only a browser can see: an OML of four days filed on the
   Inputs page opens whole from a tap — its dates in the title, "All 4 days" and the day on the Duration row on one line, its
   four days wearing the selection's mark; and on his own row (signed in as Saber, `tr.me`) the picked day wears the
   selection's stronger look over his row's lines, while another row keeps the mark as built. Runs in both Leave War projects
   (a phone and a desktop). */
import { expect, test, type Page } from '@playwright/test'
import { lwRole, openLeaveWar } from './app'

const T = (id: string) => `[data-testid="${id}"]`

/* LETTERS OF ARIAL'S WIDTHS ON EVERY MACHINE, as the whole-leave test does (e2e/wholeleave-leavewar.spec.ts): close to Apple's on
   his iPhone, and the same on this PC and GitHub's Linux machines (Liberation Sans) — so "one line at his phone's width" is
   asserted outright; with Linux's own wider letters the two chips go to the next line together (GitHub's first run, 2 Nov 26) */
const ARIAL = '#page-leavewar, #page-leavewar * { font-family: Arial, "Liberation Sans", sans-serif !important }'
test.beforeEach(async ({ page }) => {
  await openLeaveWar(page)
  await lwRole(page, 'admin')
  await page.addStyleTag({ content: ARIAL })
  const v = page.viewportSize()
  if (v && v.width < 500) await page.setViewportSize({ width: 402, height: 874 })   // his iPhone
})

async function openDay(page: Page, who: string, d: string) {
  const c = page.locator(T(`cell-${who}-${d}`))
  await c.waitFor({ state: 'attached' })
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await c.click()
  await expect(page.locator(T('bid-picker'))).toBeVisible()
}
const look = (page: Page, who: string, d: string) => page.locator(T(`cell-${who}-${d}`)).evaluate(e => {
  const cs = getComputedStyle(e)
  return { picked: e.classList.contains('selcell'), bg: cs.backgroundColor, ring: cs.boxShadow }
})

test('an OML of four days filed on the Inputs page opens whole: its dates, "All 4 days" on one line, its four days marked', async ({ page }) => {
  await page.locator(T('month-MAR')).click()
  /* four days the test world leaves empty for him — a day already holding a bid would open the day's list (D1466) */
  for (const d of ['16', '17', '18', '19']) await expect(page.locator(T(`cell-slipway-2026-03-${d}`))).toHaveText('')
  await page.evaluate(() => (window as any).fileInput({ iid: 'ir-oml', person: 'slipway', type: 'OML', date: 'Mar 16', endDate: 'Mar 19', yr: 2026, allday: true, remarks: 'Medically down' }))
  await openDay(page, 'slipway', '2026-03-17')
  await expect(page.locator(`${T('bid-picker')} .bidsheet-hd .when`)).toHaveText('16–19 Mar')
  await expect(page.locator(T('scope-all'))).toHaveText('All 4 days')
  await expect(page.locator(T('scope-day'))).toHaveText('Tue 17')
  await expect(page.locator(T('span-range'))).toHaveCount(0)
  const tops = await page.locator(`${T('bid-picker')} .bp-dur button`).evaluateAll(bs => [...new Set(bs.map(b => Math.round(b.getBoundingClientRect().top)))])
  expect(tops, 'Duration and the choice on one line').toHaveLength(1)
  expect(await page.locator('td.selcell').count(), 'the four days marked').toBe(4)
  await page.locator(T('scope-day')).click()
  expect(await page.locator('td.selcell').count(), 'only the day tapped').toBe(1)
  await expect(page.locator(`${T('bid-picker')} .bidsheet-hd .when`)).toHaveText('Tue 17 Mar')
})

test('on his own row the picked day wears the selection\'s stronger look; another row keeps the mark as built', async ({ page }) => {
  /* the war scoped to one man, as production scopes it to whoever is signed in (e2e/app.ts openLeaveWar): his row is `tr.me` */
  const me = 'slipway'
  await page.evaluate(id => (window as any).lwSetViewer(id), me)
  await page.waitForTimeout(150)
  await page.locator(T('month-FEB')).click()
  await expect(page.locator(`.mx tbody tr.me ${T(`cell-${me}-2026-02-17`)}`), 'his own row').toHaveCount(1)
  await openDay(page, me, '2026-02-17')
  const mine = await look(page, me, '2026-02-17')
  expect(mine.picked).toBe(true)
  expect(mine.bg, 'the brighter fill').toBe('rgba(59, 198, 232, 0.34)')
  expect(mine.ring, 'the 2px cyan ring, not his row\'s lines').toContain('0px 0px 0px 2px')
  await page.locator(T('bid-cancel')).click()
  const them = await page.locator('.mx tbody tr:not(.me) td[data-testid^="cell-"][data-testid$="-2026-02-17"]').first().evaluate(e => (e as HTMLElement).dataset.testid!.replace(/^cell-/, '').slice(0, -11))
  await openDay(page, them, '2026-02-17')
  const other = await look(page, them, '2026-02-17')
  expect(other.picked).toBe(true)
  /* another row as built: its 1px ring (its fill is the touched row's tint on a phone, the selection's on a desktop) */
  expect(other.ring, 'another row unchanged').toContain('0px 0px 0px 1px')
  expect(other.bg).not.toBe('rgba(59, 198, 232, 0.34)')
})
