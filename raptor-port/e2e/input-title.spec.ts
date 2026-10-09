import { expect, test, type Page } from '@playwright/test'
import { login, go } from './app'

/* AN INPUT'S OWN TITLE, IN THE BUILT APP (`[INPUT-OWN-TITLE]`; owner D715, D716, D717 — 9 Oct 26; the plan
   docs/superpowers/plans/2026-10-09-input-own-title-plan.md §5).
   What only a real browser can say: that the Title box stands under Type and fills in from the kind a person picks;
   that the row the request lands on the schedule is named by the title with its kind UNDER the name — and is NO TALLER
   for it than the untitled row beside it (jsdom has no layout: a label that grew every titled row would pass every
   unit test); that the label is not part of the name a scheduler types in; and that all of it is still there after a
   reload. The rules are unit tests: engine/inputtitle.test.ts, ui/inputtitle.test.tsx, ui/inputtitle-row.test.tsx,
   ui/latepub.test.tsx. */
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
const noErrors = (p: Page) => { const errs: string[] = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) }); return errs }
/* Wednesday 15 July 2026 is in the demo week, a working day (no OIL question), so the request's row is on screen */
const WED = '2026-07-15'

/* file one for the signed-in admin himself through the month's own "+ Input" */
async function file(page: Page, tap: boolean, type: string, from: string, to: string, title?: string) {
  await go(page, 'inputs'); await month(page, 2026, 7)
  if (await page.locator('[data-testid="win-inputsday"]').count()) await page.keyboard.press('Escape')
  if (tap) await cell(page, WED).tap({ position: { x: 8, y: 8 } }); else await cell(page, WED).click({ position: { x: 8, y: 8 } })
  await page.locator('#icPopAdd').click()
  await expect(edWin(page)).toBeVisible()
  await page.selectOption('#inpEditType', type)
  /* the box stands straight under Type and reads the kind's own name */
  await expect(page.locator('#inpEditOwnTitle')).toHaveValue(type)
  const order = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] .inped-f .inped-k')].map(k => k.textContent))
  expect(order.indexOf('Title')).toBe(order.indexOf('Type') + 1)
  await page.fill('#inpEditStart', from); await page.fill('#inpEditEnd', to)
  if (title != null) await page.fill('#inpEditOwnTitle', title)
  await page.locator('#inpEditSave').click()
  await expect(edWin(page)).toHaveCount(0)
}
/* the week's Ground Programme row by its printed name: its height, its name, its kind label */
const rowOf = (page: Page, name: string) => page.evaluate(name => {
  const r = [...document.querySelectorAll('#eWeek .pl-row.gr-frominput')].find(x => (x.querySelector(':scope > .nm .ntx')?.textContent || '').trim() === name) as HTMLElement | undefined
  if (!r) return null
  const ntx = r.querySelector(':scope > .nm .ntx') as HTMLElement, tag = r.querySelector(':scope > .nm .nm-kind') as HTMLElement | null
  const q = (e: Element) => e.getBoundingClientRect()
  return { h: Math.round(q(r).height), tag: tag ? { text: tag.textContent, under: q(tag).top >= q(ntx).bottom - 1, left: Math.round(q(tag).left - q(ntx).left), inName: ntx.contains(tag), editable: tag.isContentEditable } : null }
}, name)

for (const [what, viewport, tap] of [['a desktop', { width: 1440, height: 900 }, false], ['a phone', { width: 390, height: 844 }, true]] as const) {
  test(`${what}: a titled input — the Title box, the schedule's row named by it, its kind under the name, no taller a row; and a reload`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport, ...(tap ? { isMobile: true, hasTouch: true } : {}) })
    const page = await context.newPage()
    const errs = noErrors(page)
    await login(page)
    await file(page, tap, 'Event', '09:00', '10:00', 'Sports day')
    await file(page, tap, 'Duty', '13:00', '14:00')
    const recs = await page.evaluate(() => (window as any).INPUTS.filter((r: any) => r.date === 'Jul 15' && (r.type === 'Event' || r.type === 'Duty') && r.mod !== '2026-06-26').map((r: any) => ({ type: r.type, title: r.title, has: 'title' in r })))
    expect(recs.find((r: any) => r.type === 'Event')).toMatchObject({ title: 'Sports day' })
    expect(recs.find((r: any) => r.type === 'Duty' && !r.has), 'an untouched Title box stored nothing').toBeTruthy()
    /* the month: named by the title on a desktop (a phone's bar has room for the person only) */
    if (!tap) await expect(page.locator('#inpCal .ib-bar', { hasText: 'Sports day' }).first()).toBeVisible()
    /* the schedule: the row named by the title, its kind under the name and outside it; the untitled row has no label */
    await go(page, 'editsched')
    await expect.poll(() => rowOf(page, 'SPORTS DAY').then(r => !!r)).toBe(true)
    const titled = (await rowOf(page, 'SPORTS DAY'))!, plain = (await rowOf(page, 'DUTY'))!
    expect(plain, 'the untitled row').toBeTruthy()
    expect(titled.tag, 'the kind kept in sight').toMatchObject({ text: 'Event', under: true, inName: false, editable: false })
    expect(Math.abs(titled.tag!.left), 'the label starts where the name starts').toBeLessThanOrEqual(1)
    expect(plain.tag, 'a row named by its kind carries no label').toBeNull()
    expect(titled.h, 'the titled row is no taller than the untitled one').toBeLessThanOrEqual(plain.h + 1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'nothing runs off sideways').toBe(true)
    /* the List: the title on a line of its own, the kind's pill whole under it — squeezed beside a long title on a phone,
       the pill broke inside the word ("EVEN" over "T": the check's walk, W2) */
    await go(page, 'inputs')
    await page.locator('#inListBtn').click()
    if (!(await page.locator('#inRangePop').count())) await page.locator('#inRangeBtn').click()
    await page.locator('#inRangeAll').click()
    if (viewport.width > 820) {
      const pill = await page.evaluate(() => {
        const t = [...document.querySelectorAll('#inBody [data-testid="in-title"]')].find(x => x.textContent === 'Sports day') as HTMLElement
        const p = t.nextElementSibling as HTMLElement, q = (e: Element) => e.getBoundingClientRect()
        return { text: p.textContent, under: q(p).top >= q(t).bottom - 1, h: Math.round(q(p).height) }
      })
      expect(pill).toMatchObject({ text: 'Event', under: true })
      expect(pill.h, 'one line tall — never broken inside the word').toBeLessThan(26)
    } else {
      /* ON A PHONE THE LIST IS THE INPUT CARD (owner D718, D723 — 10 Oct 26): the kind in small capitals on the top line,
         whole on one line, and the title at the left on a row of its own under it (D722) */
      const card = await page.evaluate(() => {
        const t = [...document.querySelectorAll('#inList [data-testid="inl-title"]')].find(x => x.textContent === 'Sports day') as HTMLElement
        const c = t.closest('[data-testid^="inl-row-"]') as HTMLElement, k = c.querySelector('[data-testid="inl-kind"]') as HTMLElement, q = (e: Element) => e.getBoundingClientRect()
        return { kind: k.textContent, under: q(t).top >= q(k).bottom - 4, atLeft: Math.abs(q(t).left - q(c.querySelector('.icard-sq')!).left) < 1.5, h: Math.round(q(k).height) }
      })
      expect(card).toMatchObject({ kind: 'Event', under: true, atLeft: true })
      expect(card.h, 'the kind is one line tall — never broken inside the word').toBeLessThan(26)
    }
    /* a reload keeps the title, the row's name and its label */
    await page.reload()
    await page.waitForSelector('#vWeek .day, #loginForm')
    if (await page.locator('#loginForm').count()) await login(page)
    expect(await page.evaluate(() => (window as any).INPUTS.some((r: any) => r.title === 'Sports day' && r.type === 'Event'))).toBe(true)
    await go(page, 'editsched')
    await expect.poll(() => rowOf(page, 'SPORTS DAY').then(r => r && r.tag && r.tag.text)).toBe('Event')
    expect(errs, 'no error on the way').toEqual([])
    await context.close()
  })
}

test('the Scheduler Board: the titled row keeps its name box where every other row\'s is, its kind under the box, the row\'s cells in step with its heading', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const errs = noErrors(page)
  await login(page)
  await file(page, false, 'Event', '09:00', '10:00', 'Sports day')
  await file(page, false, 'Duty', '13:00', '14:00')
  await go(page, 'editsched')
  await page.locator('#eWeek [data-sbday="2"]:visible').first().click()
  await expect(page.locator('#schedBoard')).toBeVisible()
  const d = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#schedBoard .sb-arow.c6r')] as HTMLElement[]
    const val = (r: Element) => { const f = r.querySelector('[data-bfld$=".prog"]') as HTMLInputElement | null; return f ? (f.value || f.textContent || '').trim() : '' }
    const t = rows.find(r => val(r) === 'SPORTS DAY')!, u = rows.find(r => val(r) === 'DUTY')!
    const q = (e: Element) => e.getBoundingClientRect()
    const tb = t.querySelector('[data-bfld$=".prog"]')!, ub = u.querySelector('[data-bfld$=".prog"]')!, tag = t.querySelector('.nm-kind')!
    /* every cell after the name sits where the untitled row's does: the label never took a track of its own */
    const lefts = (r: Element) => [...r.children].slice(2).map(c => Math.round(q(c).left))
    return { x: [Math.round(q(tb).left), Math.round(q(ub).left)], w: [Math.round(q(tb).width), Math.round(q(ub).width)], tag: tag.textContent, under: q(tag).top >= q(tb).bottom - 1, kids: [t.children.length, u.children.length], lefts: [lefts(t), lefts(u)], uTag: !!u.querySelector('.nm-kind') }
  })
  expect(d.tag).toBe('Event')
  expect(d.under, 'under the name box').toBe(true)
  expect(d.x[0], 'the name box at the same place').toBe(d.x[1])
  expect(d.w[0], 'and the same width').toBe(d.w[1])
  expect(d.kids[0], 'the same number of cells').toBe(d.kids[1])
  expect(d.lefts[0], 'every later cell in its own column').toEqual(d.lefts[1])
  expect(d.uTag).toBe(false)
  expect(errs).toEqual([])
})
