import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { go, login } from './app'

/* [OIL-WORK-START] (owner, D591, D592 — 5 Oct 26) IN A REAL BROWSER: a published day keeps the OIL it went out with, and
   a flying line's OIL day starts at its entered In-time / Rally (OWS1, OWS6, OWS7, OWS8 of
   docs/superpowers/specs/2026-10-06-oil-work-start-behaviour-register.md). The engine halves are engine/oilworkstart.test.ts and
   leavewar/oilworkstart-published.test.ts; what only the running app can prove is the whole chain through its OWN
   controls — "+ Wave", the typed take-off and landing, the crew list, the four sign-off selects, Publish, the Logic
   page's box — read where the OIL actually lands: the Leave War's cell.

   The finding (W1 of the Codex stack check): a man on a published Saturday, take-off 10:00, landing 11:15 — a full day,
   07:00–13:15. Logic → "Nominal report before T/O" 3h → 2h30 made it a half day at once: nothing pending, ORIG, the four
   sign-offs standing. This test is red on the build as it stood before the fix. */

const DESK = { width: 1440, height: 900 }
const SAT = 5, ISO = '2026-07-18', WHO = 'bane'      // the demo's Ranger — a pilot, free on the demo Saturday

const day = `#eWeek .day[data-day="${SAT}"]`
async function showDay(page: Page, di: number) {
  await page.evaluate(i => {
    const d = document.querySelector(`#eWeek .day[data-day="${i}"]`) as HTMLElement
    const sc = (d.closest('.week') || d.parentElement) as HTMLElement
    if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = d.offsetLeft - ((sc.firstElementChild as HTMLElement)?.offsetLeft || 0)
    window.scrollTo(0, 0)
  }, di)
}
async function board(page: Page, di: number) {
  const open = await page.evaluate(() => { const b = document.querySelector('#schedBoard') as HTMLElement | null; return b && b.offsetWidth ? (window as any).SBDAY : null })
  if (open === di) return
  await showDay(page, di)
  await page.locator(`#eWeek .day[data-day="${di}"] [data-sbday="${di}"]`).first().click()
  await expect(page.locator('#schedBoard')).toBeVisible()
  await expect.poll(() => page.evaluate(() => (window as any).SBDAY)).toBe(di)
}
async function closeBoard(page: Page) {
  if (!(await page.locator('#schedBoard:visible').count())) return
  await page.locator('#sbDone:visible, #sbClose:visible').first().click()
  await expect(page.locator('#schedBoard')).toBeHidden()
}
async function type(page: Page, di: number, gi: number, field: 'cs' | 'to' | 'ld', value: string) {
  const el = page.locator(`#schedBoard [data-bfld="ff:${di}.${gi}.0.${field}"]:visible`).first()
  await el.scrollIntoViewIfNeeded(); await el.click(); await el.fill(value); await el.evaluate(e => (e as HTMLElement).blur())
  await expect.poll(() => page.evaluate(([i, g, f]) => String((window as any).DAYS[i].waves[g].formations[0][f] || ''), [di, gi, field] as const)).toBe(value)
}
/* the four sign-off selects of the day, on the week — each takes its first offered name */
async function signFour(page: Page) {
  await closeBoard(page); await showDay(page, SAT)
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = page.locator(`${day} select[data-sign="${role}"][data-signday="${SAT}"]`).first()
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => (o as HTMLOptionElement).value).filter(Boolean))
    await sel.selectOption(opts[0]!)
  }
}
const signed = (page: Page) => page.locator(`${day} select[data-sign][data-signday="${SAT}"]`).evaluateAll(ss => ss.map(s => (s as HTMLSelectElement).value).filter(Boolean).length)
/* what the Leave War grid says in his Saturday cell — FO, HO or nothing */
async function oilCell(page: Page) {
  await go(page, 'leavewar')
  const jul = page.locator('[data-testid="month-JUL"]').first()
  if (await jul.count()) await jul.click()
  const cell = page.locator(`[data-testid="cell-${WHO}-${ISO}"]`).first()
  await expect(cell).toBeAttached()
  const t = (await cell.innerText()).trim()
  await go(page, 'editsched')
  return (/\b(FO|HO)\b/.exec(t) || [''])[0]
}
async function logicLead(page: Page, value: string) {
  await go(page, 'logic')
  if (!(await page.locator('[data-lgset="reportLead"]').count())) await page.locator('#lgEdit').click()
  const f = page.locator('input[data-lgset="reportLead"]').first()
  await f.scrollIntoViewIfNeeded(); await f.fill(value); await f.press('Tab')
  await go(page, 'editsched')
}
const pendChip = (page: Page) => page.locator(`${day} .dpend:not(.dnew):not(.dchg)`).first()

test.describe('a published day keeps the OIL it went out with (D592)', () => {
  test.use({ viewport: DESK })

  test('OWS6, OWS7, OWS8 — publish a Saturday sortie, change "Nominal report before T/O": the Leave War holds the full day, the day reads 1 pending and names the value and the man; the amendment applies it', async ({ page }) => {
    await login(page)
    await go(page, 'editsched')

    /* "+ Wave" → Flying wave; its line: VIPER 10:00–11:15, Ranger in the front seat, through the crew list */
    await board(page, SAT)
    const gi = await page.evaluate(i => (window as any).DAYS[i].waves.length, SAT)
    const add = page.locator(`#schedBoard [data-wvadd="${SAT}"]`).first()
    await add.scrollIntoViewIfNeeded(); await add.click()
    await page.locator('.wavemenu [data-wmkind=""]').first().click()
    await expect.poll(() => page.evaluate(i => (window as any).DAYS[i].waves.length, SAT)).toBe(gi + 1)
    await type(page, SAT, gi, 'cs', 'VIPER'); await type(page, SAT, gi, 'to', '10:00'); await type(page, SAT, gi, 'ld', '11:15')
    const seat = page.locator(`#schedBoard [data-slot="${SAT}.${gi}.0.0.p"]`).first()
    await seat.scrollIntoViewIfNeeded(); await seat.click()
    const puck = page.locator(`#sbRoster .rpuck[data-person="${WHO}"]:visible`).first()
    await puck.scrollIntoViewIfNeeded(); await puck.click()
    await expect.poll(() => page.evaluate(([i, g]) => (window as any).DAYS[i].waves[g].formations[0].aircraft[0].p, [SAT, gi] as const)).toBe(WHO)
    await page.keyboard.press('Escape')

    /* the four sign, the day is published */
    await signFour(page)
    const pub = page.locator(`${day} [data-beak="${SAT}"]`).first()
    await pub.evaluate(e => e.scrollIntoView({ block: 'center' })); await pub.click()
    await expect(page.locator(`${day} .verchip`).first()).toContainText('ORIG')
    expect(await oilCell(page), 'a full day: 07:00 to 13:15').toBe('FO')

    /* the Logic value changes under the published day */
    await logicLead(page, '2h30')
    expect(await page.evaluate(() => (window as any).VCONF.reportLead)).toBe(150)
    expect(await oilCell(page), 'the published day keeps the OIL it went out with').toBe('FO')
    await showDay(page, SAT)
    await expect(pendChip(page), 'and the day says a change is waiting').toContainText('1 pending')
    expect(await signed(page), 'the four sign-offs fell (D103)').toBe(0)
    await pendChip(page).click()
    await page.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'To go out' }).first().click()
    const list = page.locator('.chgwin:not([hidden]) .pl-list').first()
    await expect(list).toContainText('OIL on this day')
    await expect(list).toContainText('Nominal report before T/O')
    await expect(list).toContainText('2h30')
    await expect(list).toContainText('full day · 07:00–13:15')
    await expect(list).toContainText('half day · 07:30–13:15')
    await page.keyboard.press('Escape')

    /* signed again, the amendment goes out: now the new value applies */
    await signFour(page)
    const al = page.locator(`${day} [data-alpub="${SAT}"]`).first()
    await al.evaluate(e => e.scrollIntoView({ block: 'center' })); await al.click()
    await expect(page.locator(`${day} .verchip`).first()).toContainText('AL1')
    expect(await oilCell(page), 'published again: 07:30 to 13:15 is a half day').toBe('HO')
    await showDay(page, SAT)
    await expect(pendChip(page)).toHaveCount(0)

    /* and back: the amendment now holds its half day, and the day says so */
    await logicLead(page, '3h')
    expect(await oilCell(page)).toBe('HO')
    await showDay(page, SAT)
    await expect(pendChip(page)).toContainText('1 pending')
  })
})
