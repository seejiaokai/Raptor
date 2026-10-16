import { expect, test, type Page } from '@playwright/test'
import { login, go } from './app'

/* THE OIL QUESTION'S "ONLY SOME DAYS…" IS THE APP'S ONE CALENDAR — IN THE BUILT APP ([OIL-CONFIRM-DAYGRID]; owner D923,
   15 Oct 26: "use the new calendar format but allow to tap separate days for this function").
   What only a real browser can say — jsdom has no layout: that the calendar stands inside the question's card and on top
   of the page behind it, at a desktop's size, a phone's and a phone on its side; that a press AT A POINT on a Saturday
   turns that day on (the press reaches the date, not something drawn over it); that the Friday the input also covers
   takes no press; that the card's two buttons stay wholly in sight below the calendar on a short screen; and that what
   is saved is the days pressed. What a tap and the keys do in every state is the unit tests' (ui/datecal.test.tsx
   "several separate days", ui/oilconfirm.test.tsx D923). */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const FRI = '2026-07-17', SAT = '2026-07-18', SUN = '2026-07-19'
const SIZES = [
  { name: 'desktop', use: { viewport: { width: 1440, height: 900 } }, tap: false },
  { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, tap: true },
  { name: 'phone on its side', use: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }, tap: true },
  /* NARROW PHONES (the check's walk, S13 — 17 Oct 26): at 360 the calendar's head ran 38px past it and the › arrow was cut
     by the card's edge; 320 the same, with the calendar's own narrow head */
  { name: 'phone 360 wide', use: { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true }, tap: true },
  { name: 'phone 320 wide', use: { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true }, tap: true },
] as const
const noErrors = (p: Page) => { const errs: string[] = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) }); return errs }
const box = (p: Page, sel: string) => p.locator(sel).first().evaluate(e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height } })

/* a Duty over Fri 17 – Sun 19 Jul filed from the Inputs calendar: three days picked with the keyboard, then Enter opens
   the input's own window on them (the way the pictures of record were taken — scripts/handpass/pics-two-leftovers.mjs) */
async function askSeveralDays(p: Page, tap: boolean) {
  const press = (sel: string) => (tap ? p.locator(sel).tap() : p.locator(sel).click())
  await go(p, 'inputs')
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press('#inCalBtn')
  await expect(p.locator('#inpCal')).toBeVisible()
  for (let i = 0; i < 36 && !(await p.locator(`[data-icday="${FRI}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const at = +y! * 12 + MONTHS.findIndex(x => x.startsWith(m!)), want = +FRI.slice(0, 4) * 12 + (+FRI.slice(5, 7) - 1)
    await press(at < want ? '#icNext' : '#icPrev')
  }
  await p.locator(`#inpCal [data-icday="${FRI}"]`).focus()
  await p.keyboard.press('Shift+ArrowRight'); await p.keyboard.press('Shift+ArrowRight'); await p.keyboard.press('Enter')
  const win = '[data-testid="win-inputedit"]'
  await expect(p.locator(`${win} #inpEditType`)).toBeVisible()
  await p.selectOption(`${win} #inpEditType`, 'Duty')
  await p.fill(`${win} #inpEditOwnTitle`, 'Range weekend')
  await press('#inpEditSave')
  await expect(p.locator('[data-testid="oilconf"]')).toBeVisible()
  await expect(p.locator('[data-testid="oilconf"] .upconf-h')).toContainText('2 non-working days')
  await press('[data-testid="oil-some"]')
  await expect(p.locator('[data-testid="oilcal"]')).toBeVisible()
  return press
}

for (const size of SIZES) {
  test.describe(`${size.name} — the OIL question's "Only some days…" (D923)`, () => {
    test.use(size.use as any)
    test('the one calendar stands in the card and on top; a press on Saturday turns it on, the Friday takes none; the buttons stay in sight; the save keeps the days pressed', async ({ page }) => {
      const errs = noErrors(page)
      await login(page)
      const press = await askSeveralDays(page, size.tap)
      const cal = '[data-testid="oilcal"]', card = '[data-testid="oilconf"] .airpop-box'
      /* the app's one calendar, on the month of the first day asked about */
      await expect(page.locator(cal)).toHaveClass(/\bdcal\b.*\bis-many\b/)
      await expect(page.locator(cal)).toHaveAttribute('data-month', '2026-07')
      await expect(page.locator(`${cal} [data-testid="oilcal-title"]`)).toContainText('July 2026')
      /* inside the card from side to side, and the card inside the screen */
      const c = await box(page, cal), k = await box(page, card), vw = page.viewportSize()!.width
      expect(c.l, 'the calendar is out of its card on the left').toBeGreaterThanOrEqual(k.l - 0.5)
      expect(c.r, 'the calendar is out of its card on the right').toBeLessThanOrEqual(k.r + 0.5)
      expect(k.l >= -0.5 && k.r <= vw + 0.5, 'the card is inside the screen').toBe(true)
      /* the calendar's head — the title, Today and the two arrows — inside the calendar, on one line */
      const t = await box(page, `${cal} [data-testid="oilcal-title"]`), nx = await box(page, `${cal} [data-testid="oilcal-next"]`)
      expect(t.l, 'the title starts inside the calendar').toBeGreaterThanOrEqual(c.l - 0.5)
      expect(nx.r, 'the › arrow ends inside the calendar').toBeLessThanOrEqual(c.r + 0.5)
      expect(Math.abs((nx.t + nx.b) / 2 - (t.t + t.b) / 2), 'the head is one line').toBeLessThan(8)
      expect(await page.evaluate(() => document.documentElement.scrollWidth), 'nothing scrolls the page sideways').toBeLessThanOrEqual(vw)
      /* only the two weekend days take a press */
      await expect(page.locator(`[data-testid="oilcal-day-${FRI}"]`)).toBeDisabled()
      await expect(page.locator(`[data-testid="oilcal-day-${SAT}"]`)).toBeEnabled()
      await expect(page.locator(`[data-testid="oilcal-day-${SUN}"]`)).toBeEnabled()
      /* the dates IN SIGHT as the answer opens them — nothing scrolled by the test: Saturday below the card's top and above
         its pinned foot (the code read's F1 — on a phone on its side the calendar opened below the foot, only its title in
         sight; the card now scrolls it up) */
      const inView = await page.evaluate(() => {
        const d = document.querySelector('[data-testid="oilcal-day-2026-07-18"]')!.getBoundingClientRect()
        const card = document.querySelector('[data-testid="oilconf"] .airpop-box')!.getBoundingClientRect()
        const foot = document.querySelector('[data-testid="oilconf"] .airpop-foot')!.getBoundingClientRect()
        const mid = (d.top + d.bottom) / 2
        return { mid: Math.round(mid), cardTop: Math.round(card.top), footTop: Math.round(foot.top), ok: mid > card.top && mid < foot.top }
      })
      expect(inView.ok, `Saturday in sight as "Only some days…" opens: ${JSON.stringify(inView)}`).toBe(true)
      /* a press AT THE POINT of Saturday's date: brought into the card's view the way a finger scrolls a card, then the
         element at that point is the date itself — nothing drawn over it */
      const sat = page.locator(`[data-testid="oilcal-day-${SAT}"]`)
      await sat.evaluate(e => e.scrollIntoView({ block: 'center' }))
      const s = (await sat.boundingBox())!
      const hit = await page.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); return h?.closest('[data-iso]')?.getAttribute('data-iso') || '' }, [s.x + s.width / 2, s.y + s.height / 2])
      expect(hit, 'the date is the thing at its own centre').toBe(SAT)
      if (size.tap) await page.touchscreen.tap(s.x + s.width / 2, s.y + s.height / 2)
      else await page.mouse.click(s.x + s.width / 2, s.y + s.height / 2)
      await expect(sat).toHaveAttribute('aria-pressed', 'true')
      await expect(page.locator('[data-testid="oil-count"]')).toHaveText('1 of 2 days selected — tap a day to change it')
      /* a press on the faint Friday changes nothing */
      await page.locator(`[data-testid="oilcal-day-${FRI}"]`).dispatchEvent('click')
      await expect(page.locator('[data-testid="oil-count"]')).toHaveText('1 of 2 days selected — tap a day to change it')
      /* the card's two buttons, wholly in sight below it — a phone on its side included (the foot stays pinned) */
      const inSight = await page.evaluate(card => {
        const b = document.querySelector(card)!.getBoundingClientRect()
        return ['[data-testid="oilconf-cancel"]', '[data-testid="oilconf-save"]'].every(q => { const r = document.querySelector(q)!.getBoundingClientRect(); return r.height > 0 && r.top >= b.top - 0.5 && r.bottom <= b.bottom + 0.5 && r.bottom <= innerHeight + 0.5 })
      }, card)
      expect(inSight, 'Back and Add are wholly inside the card and the screen').toBe(true)
      await press('[data-testid="oilconf-save"]')
      await expect(page.locator('[data-testid="oilconf"]')).toHaveCount(0)
      const oil = await page.evaluate(() => (window as any).INPUTS.find((r: any) => r.title === 'Range weekend')?.oil)
      expect(oil, 'Saturday credited, Sunday not').toEqual({ [SAT]: 1, [SUN]: 0 })
      expect(errs, 'no error on the way').toEqual([])
    })
  })
}
