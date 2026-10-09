import { expect, test, type Page } from '@playwright/test'
import { login, go } from './app'

/* AN INPUT FILED FOR "ALL AVAIL", AND THE KIND "EVENT", IN THE BUILT APP (`[INPUT-ALL-AVAIL]`, `[INPUT-EVENT-KIND]`; owner
   D700, D702, D711, D713 — 9 Oct 26; the plan docs/superpowers/plans/2026-10-09-input-all-avail-plan.md §6.9).
   What only a real browser can say: that the two entries are really in the list a person opens and can be chosen by a
   mouse and by a finger; that the OIL question comes up over the editor and its answer is kept; that the bar reads the
   placeholder's name; that the SAME input stands on the schedule with its count, whose press opens the window of the
   people behind it; and that all of it is still there after a reload. The rules are unit tests: engine/
   placeholderinput.test.ts, engine/oilplaceholderclaim.test.ts, ui/placeholderdoors.test.tsx, ui/placeholderlist.test.tsx,
   ui/oilplaceholderclaim.test.tsx, engine/eventkind.test.ts. */
const cell = (p: Page, iso: string) => p.locator(`#inpCal [data-icday="${iso}"]`)
const edWin = (p: Page) => p.locator('[data-testid="win-inputedit"]')
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
async function month(p: Page, y: number, m: number) {
  for (let i = 0; i < 240; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))   // a phone prints three letters
    if (!d) return
    await p.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  throw new Error('the calendar never reached the month asked for')
}
const ids = (p: Page) => p.evaluate(() => (window as any).INPUTS.map((r: any) => r.iid))
const made = (p: Page, had: string[]) => p.evaluate(had => (window as any).INPUTS.filter((r: any) => !had.includes(r.iid))
  .map((r: any) => ({ iid: r.iid, person: r.person, type: r.type, date: r.date, endDate: r.endDate, grp: r.grp, by: r.by, oil: r.oil, acc: r.acc })), had)
const noErrors = (p: Page) => { const errs: string[] = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) }); return errs }

/* Saturday 18 July 2026 is in the demo week, so the request's row stands on a schedule that is on screen */
const SAT = '2026-07-18'

async function fileForAllAvail(page: Page, tap: boolean) {
  await go(page, 'inputs'); await month(page, 2026, 7)
  const had = await ids(page)
  if (tap) await cell(page, SAT).tap({ position: { x: 8, y: 8 } }); else await cell(page, SAT).click({ position: { x: 8, y: 8 } })
  await page.locator('#icPopAdd').click()
  await expect(edWin(page)).toBeVisible()
  await page.selectOption('#inpEditType', 'Duty')
  /* the two entries stand in the list a person opens, under their heading */
  const grp = page.locator('#inpEditPerson optgroup[data-ph]')
  await expect(grp).toHaveAttribute('label', 'Whoever is free that day')
  expect(await grp.locator('option').allInnerTexts()).toEqual(['ALL AVAIL', 'ALL'])
  await page.selectOption('#inpEditPerson', 'allavail')
  await expect(page.locator('[data-testid="pp-why"]'), 'a kind it may carry: no line of complaint').toHaveCount(0)
  await page.fill('#inpEditRmk', 'hangar clean-up')
  await page.locator('#inpEditSave').click()
  /* a Saturday: the OIL question, asked of whoever files it, once, for everyone behind it (D702, D711) */
  const oil = page.locator('[data-testid="oilconf"]')
  await expect(oil).toBeVisible()
  await expect(oil).toContainText('ALL AVAIL')
  await oil.locator('[data-testid="oil-yes"]').click()
  await oil.locator('[data-testid="oilconf-save"]').click()
  await expect(edWin(page)).toHaveCount(0)
  const rows = await made(page, had)
  expect(rows, 'ONE record').toHaveLength(1)
  expect(rows[0]).toMatchObject({ person: 'allavail', type: 'Duty', date: 'Jul 18' })
  expect(rows[0].grp, 'no group').toBeUndefined()
  expect(rows[0].endDate).toBeUndefined()
  expect(Object.values(rows[0].oil || {}).some((v: any) => v > 0), 'the filer said Yes').toBe(true)
  return rows[0]
}

test('a desktop: an admin files a weekend Duty for ALL AVAIL from the month — the OIL question, the bar, the schedule\'s row with its count and window, and a reload', async ({ page }) => {
  const errs = noErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page)
  const row = await fileForAllAvail(page, false)
  /* the month: ONE bar on the Saturday reading the placeholder's name and the kind */
  /* (its own bar — the demo carries another ALL AVAIL Duty, on the Saturday after) */
  const bar = page.locator(`#inpCal .ib-bar[data-iid="${row.iid}"]`)
  await expect(bar).toHaveCount(1)
  await expect(bar).toContainText('ALL AVAIL')
  await expect(bar).toContainText('Duty')
  /* the schedule: the SAME input's row on Saturday's ground programme — the placeholder puck, its count */
  await go(page, 'editsched')
  const onSched = await page.evaluate(iid => {
    const w = window as any
    const d = w.DAYS[5], r = (d.ground || []).find((x: any) => String(x.src || '') === iid)
    return r ? { who: r.who, prog: r.prog } : null
  }, row.iid)
  expect(onSched, 'it landed a row on the Saturday').toBeTruthy()
  expect(String(onSched!.who)).toBe('allavail')
  /* Edit Schedule's own week (`#eWeek`; `#vWeek` is View-only Sched's, hidden here): the count on ITS puck */
  const chip = page.locator(`#eWeek .oilcount[data-oilsent="i:${row.iid}"]`)
  await expect(chip).toHaveCount(1)
  await chip.scrollIntoViewIfNeeded()
  await expect(chip).toBeVisible()
  expect(parseInt((await chip.innerText()).replace(/\D+/g, ''), 10), 'whoever is free: more than nobody').toBeGreaterThan(0)
  await chip.click()
  const win = page.locator('.availwin')
  await expect(win).toBeVisible()
  expect(await win.locator('.puck').count(), 'the people behind it, as pucks').toBeGreaterThan(0)
  /* a reload keeps the input, its answer and its row */
  await page.reload()
  await page.waitForSelector('#vWeek .day, #loginForm')
  if (await page.locator('#loginForm').count()) await login(page)
  const kept = await page.evaluate(iid => { const w = window as any; const r = w.INPUTS.find((x: any) => x.iid === iid); return r ? { person: r.person, oil: r.oil } : null }, row.iid)
  expect(kept, 'still there after a reload').toBeTruthy()
  expect(kept!.person).toBe('allavail')
  expect(Object.values(kept!.oil || {}).some((v: any) => v > 0)).toBe(true)
  expect(errs, 'no error on the way').toEqual([])
})

test('a phone: the same filing by a finger — the list offers the two, the editor and the OIL question fit the screen', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  const errs = noErrors(page)
  await login(page)
  const row = await fileForAllAvail(page, true)
  expect(row.person).toBe('allavail')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'nothing runs off sideways').toBe(true)
  const bar = page.locator(`#inpCal .ib-bar`).filter({ hasText: 'ALL AVAIL' })
  await expect(bar.first()).toBeVisible()
  expect(errs).toEqual([])
  await context.close()
})

test('refused in words, in the window: ALL AVAIL with an overseas duty, and with "Several people"', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  const had = await ids(page)
  await cell(page, '2026-10-21').click({ position: { x: 8, y: 8 } })
  await page.locator('#icPopAdd').click()
  await page.selectOption('#inpEditType', 'Meeting')
  await page.selectOption('#inpEditPerson', 'allavail')
  await page.selectOption('#inpEditType', 'OD')
  await expect(page.locator('#inpEditPerson')).toHaveValue('allavail')
  await expect(page.locator('#inpEditPop [data-testid="pp-why"]')).toContainText('ALL AVAIL can be filed only for Training, Meeting, Appointment, Duty, Event or Other')
  await page.locator('#inpEditSave').click()
  await expect(edWin(page), 'the window stays').toBeVisible()
  expect(await made(page, had)).toHaveLength(0)
  await page.selectOption('#inpEditType', 'Meeting')
  await page.locator('#inpEditPop [data-testid="pp-several"]').click()
  await expect(page.locator('#inpEditPop [data-testid="pp-why"]')).toContainText('ALL AVAIL is filed on its own')
  await page.locator('#inpEditPop [data-testid="pp-fix"]').click()
  await expect(page.locator('#inpEditPerson')).toHaveValue('allavail')
  await page.locator('#inpEditSave').click()
  await expect(edWin(page)).toHaveCount(0)
  expect(await made(page, had)).toHaveLength(1)
})

test('the kind "Event": in the type list, filed for several people as ONE bar, and for ALL', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  const had = await ids(page)
  await cell(page, '2026-10-22').click({ position: { x: 8, y: 8 } })
  await page.locator('#icPopAdd').click()
  expect(await page.locator('#inpEditType option').allInnerTexts(), 'Event is a kind').toContain('Event')
  await page.selectOption('#inpEditType', 'Event')
  await page.locator('#inpEditPop [data-testid="pp-several"]').click()
  const other = await page.evaluate(() => { const w = window as any, P = w.PEOPLE; return Object.keys(P).find(id => P[id].cs === 'Ranger')! })
  await page.locator(`#inpEditPop [data-pp="${other}"]`).click()
  await page.fill('#inpEditRmk', 'games night')
  await page.locator('#inpEditSave').click()
  await expect(edWin(page)).toHaveCount(0)
  const rows = await made(page, had)
  expect(rows).toHaveLength(2)
  expect(rows.every(r => r.type === 'Event')).toBe(true)
  expect(rows[0].grp, 'one shared input').toBeTruthy()
  await expect(page.locator('#inpCal .ib-bar').filter({ hasText: '+1' }).filter({ hasText: 'Event' })).toHaveCount(1)
  /* and the demo's own Event for ALL, in July */
  await month(page, 2026, 7)
  await expect(page.locator('#inpCal .ib-bar').filter({ hasText: 'ALL' }).filter({ hasText: 'Event' }).first()).toBeVisible()
})

test('a member may choose it too (D702): he files a Meeting for ALL AVAIL, sees it under Everyone, and it is his to change', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page, 'user'); await go(page, 'inputs'); await month(page, 2026, 10)
  const had = await ids(page)
  await cell(page, '2026-10-20').click({ position: { x: 8, y: 8 } })
  await page.locator('#icPopAdd').click()
  await page.selectOption('#inpEditType', 'Meeting')
  await page.selectOption('#inpEditPerson', 'allavail')
  await page.fill('#inpEditRmk', 'flight social')
  await page.locator('#inpEditSave').click()
  await expect(edWin(page)).toHaveCount(0)
  const rows = await made(page, had)
  expect(rows).toHaveLength(1)
  expect(rows[0].person).toBe('allavail')
  /* nobody's "mine": his own filter does not list it; Everyone does */
  await page.selectOption('#inFPerson', 'all')
  const bar = page.locator('#inpCal .ib-bar').filter({ hasText: 'ALL AVAIL' }).filter({ hasText: 'Meeting' })
  await expect(bar).toHaveCount(1)
  await bar.click()
  await expect(edWin(page)).toBeVisible()
  await expect(page.locator('#inpEditSave'), 'the filer may change it').toBeVisible()
})
