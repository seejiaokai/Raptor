import { expect, test, type Page } from '@playwright/test'
import { login, go } from './app'

/* AN INPUT FILED FOR "ALL AVAIL", AND THE KIND "EVENT", IN THE BUILT APP (`[INPUT-ALL-AVAIL]`, `[INPUT-EVENT-KIND]`; owner
   D700, D702, D711, D713 — 9 Oct 26; the plan docs/superpowers/plans/2026-10-09-input-all-avail-plan.md §6.9).
   What only a real browser can say: that the two entries are really in the list a person opens and can be chosen by a
   mouse and by a finger; that the OIL question comes up over the editor and its answer is kept; that the bar reads the
   placeholder's name; that the SAME input stands on the schedule with its count, whose press opens the window of the
   people behind it; and that all of it is still there after a reload. The rules are unit tests: engine/
   placeholderinput.test.ts, engine/oilplaceholderclaim.test.ts, ui/placeholderdoors.test.tsx, ui/placeholderlist.test.tsx,
   ui/oilplaceholderclaim.test.tsx, engine/eventkind.test.ts.
   SINCE STEP 3 OF THE ONE-RULE BUILD (12 Oct 26 — owner D750: "'Several people' takes ALL AVAIL / ALL, so the puck is one
   of the input's own people"; D753; the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.5) the third test
   below no longer ends in the refusal "ALL AVAIL is filed on its own": with "Several people" switched on, ALL AVAIL
   stays picked, a person is picked beside it by a real press, and the save is ONE input for both — one bar. The two
   rules that survive are said in the plan's shorter words (ui/phpick.test.tsx, ui/phmember.test.tsx pin them). */
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
  .map((r: any) => ({ iid: r.iid, people: (r.people || [{ p: r.person }]).map((e: any) => e.p), type: r.type, date: r.date, endDate: r.endDate, by: r.by, oil: r.oil, acc: r.acc })), had)
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
  expect(rows[0]).toMatchObject({ type: 'Duty', date: 'Jul 18' })
  expect(rows[0].people, 'the placeholder is its one person — no name copied in').toEqual(['allavail'])
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
  const kept = await page.evaluate(iid => { const w = window as any; const r = w.INPUTS.find((x: any) => x.iid === iid); return r ? { people: (r.people || [{ p: r.person }]).map((e: any) => e.p), oil: r.oil } : null }, row.iid)
  expect(kept, 'still there after a reload').toBeTruthy()
  expect(kept!.people).toEqual(['allavail'])
  expect(Object.values(kept!.oil || {}).some((v: any) => v > 0)).toBe(true)
  /* …and its ROW on the schedule, with its count (Astra's read of the code, 9 Oct 26: the reload proved the input and
     its answer, never the row it stands on) */
  await go(page, 'editsched')
  const again = page.locator(`#eWeek .oilcount[data-oilsent="i:${row.iid}"]`)
  await expect(again).toHaveCount(1)
  expect(parseInt((await again.innerText()).replace(/\D+/g, ''), 10)).toBeGreaterThan(0)
  expect(errs, 'no error on the way').toEqual([])
})

test('a phone: the same filing by a finger — the list offers the two, the editor and the OIL question fit the screen', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  const errs = noErrors(page)
  await login(page)
  const row = await fileForAllAvail(page, true)
  expect(row.people).toEqual(['allavail'])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'nothing runs off sideways').toBe(true)
  const bar = page.locator(`#inpCal .ib-bar`).filter({ hasText: 'ALL AVAIL' })
  await expect(bar.first()).toBeVisible()
  expect(errs).toEqual([])
  await context.close()
})

/* RE-EXPRESSED FOR STEP 3 (12 Oct 26). The first half STANDS — the kind rule survives (D711 (2), D712; D753 reading 3) and
   only its words changed, "can be filed only for … or Other" to the plan's "is for … and Other". The second half was
   'and with "Several people"': the line "ALL AVAIL is filed on its own", the press "File it for ALL AVAIL only", and a
   save for ALL AVAIL alone. Owner D750 and D755 changed that rule — ALL AVAIL is one of an input's own people — so the
   same presses now end in ONE input for ALL AVAIL and a person: the two placeholder pucks stand above the groups, the
   one already chosen lit; a person's puck is pressed beside it; the save is one record and one bar. */
test('in the window: ALL AVAIL with an overseas duty is refused in words — and with "Several people" it is one of the input\'s own people (D750)', async ({ page }) => {
  const errs = noErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  const had = await ids(page)
  await cell(page, '2026-10-21').click({ position: { x: 8, y: 8 } })
  await page.locator('#icPopAdd').click()
  await page.selectOption('#inpEditType', 'Meeting')
  await page.selectOption('#inpEditPerson', 'allavail')
  await page.selectOption('#inpEditType', 'OD')
  await expect(page.locator('#inpEditPerson')).toHaveValue('allavail')
  await expect(page.locator('#inpEditPop [data-testid="pp-why"]')).toContainText('ALL AVAIL is for Training, Meeting, Personal, Appointment, Duty, Event and Other')
  await page.locator('#inpEditSave').click()
  await expect(edWin(page), 'the window stays').toBeVisible()
  expect(await made(page, had)).toHaveLength(0)
  await page.selectOption('#inpEditType', 'Meeting')
  await page.locator('#inpEditPop [data-testid="pp-several"]').click()
  /* no longer refused: nothing is said, and the two stand as pucks of their own above the groups — the one he chose lit */
  await expect(page.locator('#inpEditPop [data-testid="pp-why"]')).toHaveCount(0)
  const phGroup = page.locator('#inpEditPop [data-ppgroup="ph"]')
  await expect(phGroup).toBeVisible()
  await expect(phGroup.locator('[data-ph="allavail"]')).toHaveAttribute('aria-pressed', 'true')
  await expect(phGroup.locator('[data-ph="all"]')).toHaveAttribute('aria-pressed', 'false')
  await expect(phGroup.locator('[data-ph="all"]')).toBeEnabled()
  await expect(page.locator('#inpEditPop [data-testid="pp-count"]')).toHaveText('ALL AVAIL')
  /* a person picked beside it, by a real press */
  const other = await page.evaluate(() => { const w = window as any, P = w.PEOPLE; return Object.keys(P).find(id => P[id].cs === 'Ranger')! })
  await page.locator(`#inpEditPop [data-pp="${other}"]`).click()
  await expect(page.locator('#inpEditPop [data-testid="pp-count"]')).toHaveText('1 picked + ALL AVAIL')
  await page.locator('#inpEditSave').click()
  await expect(edWin(page)).toHaveCount(0)
  const rows = await made(page, had)
  /* ONE record holding both, in the order picked — an input is stored once, with the list of its people (D756) */
  expect(rows, 'one input').toHaveLength(1)
  expect(rows[0].people).toEqual(['allavail', other])
  expect(rows[0].endDate).toBeUndefined()
  /* ONE bar: the person, then "+ ALL AVAIL" — the count is of the named people (the plan §4.5) */
  const bar = page.locator(`#inpCal .ib-bar[data-iid="${rows[0].iid}"]`)
  await expect(bar).toHaveCount(1)
  await expect(bar).toHaveText('Ranger + ALL AVAIL · Meeting')
  /* …and opened again, the window shows both: "Several people", ALL AVAIL lit, Ranger's puck lit */
  await bar.click()
  await expect(edWin(page)).toBeVisible()
  await expect(page.locator('#inpEditPop [data-ppgroup="ph"] [data-ph="allavail"]')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator(`#inpEditPop [data-pp="${other}"]`)).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#inpEditPop [data-testid="pp-count"]')).toHaveText('1 picked + ALL AVAIL')
  expect(errs, 'no error on the way').toEqual([])
})

/* ADDED FOR STEP 3 (D753: "it is offered only where the input is a single day"; its reading 2: "on a longer input the
   picker does not offer the puck and says why") — in a real browser a greyed puck must really not take a press. */
test('in the window: on an input of several days "Several people" shows ALL AVAIL and ALL greyed, with the reason under them', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  const had = await ids(page)
  await cell(page, '2026-10-27').click({ position: { x: 8, y: 8 } })
  await page.locator('#icPopAdd').click()
  await page.selectOption('#inpEditType', 'Training')
  await page.locator('#inpEditPop [data-testid="pp-several"]').click()
  const phGroup = page.locator('#inpEditPop [data-ppgroup="ph"]')
  await expect(phGroup.locator('[data-ph="allavail"]'), 'one day: offered').toBeEnabled()
  /* the dates made three days on the window's own calendar: a tap for the start, a tap for the end. The start is tapped
     on the day BEFORE the one the window opened on — a day earlier than a start already picked is always a new start
     (ui/RangeCal.tsx), whether or not the window holds a finished range — so the two taps give 26 → 28 Oct either way */
  await page.locator('#inpEdCal [data-iso="2026-10-26"]').click()
  await page.locator('#inpEdCal [data-iso="2026-10-28"]').click()
  await expect(page.locator('#inpEditPop .rc-read')).toContainText('→')
  await expect(phGroup.locator('[data-ph="allavail"]')).toBeDisabled()
  await expect(phGroup.locator('[data-ph="all"]')).toBeDisabled()
  await expect(page.locator('#inpEditPop [data-testid="pp-phwhy"]')).toHaveText('ALL AVAIL is for one day')
  await phGroup.locator('[data-ph="allavail"]').click({ force: true })
  await expect(phGroup.locator('[data-ph="allavail"]'), 'a press does nothing').toHaveAttribute('aria-pressed', 'false')
  expect(await made(page, had)).toHaveLength(0)
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
  /* ONE record for the two of them — an input is stored once, with the list of its people (owner D756) */
  expect(rows, 'one shared input').toHaveLength(1)
  expect(rows[0].type).toBe('Event')
  expect(rows[0].people).toHaveLength(2)
  expect(rows[0].people).toContain(other)
  /* ONE bar for the two of them: how many, then what (the count first since the design vet — D729, V4) */
  await expect(page.locator('#inpCal .ib-bar').filter({ hasText: /^2 · Event$/ })).toHaveCount(1)
  /* and the demo's own Event for ALL, in July — named by its own title since [INPUT-OWN-TITLE] (D715, D716: the demo's
     Event is titled "Sports afternoon"); its kind is said in the bar's tip, the bar having room for the name only */
  await month(page, 2026, 7)
  const demo = page.locator('#inpCal .ib-bar').filter({ hasText: 'ALL' }).filter({ hasText: 'Sports afternoon' }).first()
  await expect(demo).toBeVisible()
  expect((await demo.getAttribute('title') || '').split('\n')[0]).toContain('· Sports afternoon · Event ·')
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
  expect(rows[0].people).toEqual(['allavail'])
  /* nobody's "mine": his own filter does not list it; Everyone does */
  await page.selectOption('#inFPerson', 'all')
  const bar = page.locator('#inpCal .ib-bar').filter({ hasText: 'ALL AVAIL' }).filter({ hasText: 'Meeting' })
  await expect(bar).toHaveCount(1)
  await bar.click()
  await expect(edWin(page)).toBeVisible()
  await expect(page.locator('#inpEditSave'), 'the filer may change it').toBeVisible()
})
