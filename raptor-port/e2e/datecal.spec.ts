/* THE APP'S ONE DATE CALENDAR, ITS DATE BOX AND THE SWIPE — what only a real browser shows ([ONE-DATE-CALENDAR] step
   one; owner D786, D795, D796, D797 — the design of record docs/superpowers/specs/2026-10-13-one-date-calendar.md).

   jsdom has no layout, so the unit tests (src/ui/datecal.test.tsx, datebox.test.tsx, dayswipe.test.tsx) cannot see:
     · THAT THE CALENDAR IS ON TOP of each surface a date box stands in (the checking order §6 — a new floating surface
       names every surface it can open over, with a browser test on each that the element at its centre is the surface):
       the windows shell with a second window behind it, the Admin page, an input's own window over the Medical page.
       The Leave War's sheets are in e2e/leavewar.spec.ts, where that page's own helpers are;
     · THAT A DATE BOX FITS its form at any phone width (D786 — "fit the phone size which might be variable");
     · that the calendar's controls stay where they are as the months turn, and its lists really scroll;
     · that a REAL finger slid sideways turns the Calendar window's month and the Holidays list's year, presses nothing
       on the way, and leaves a mouse alone.
   What a press opens is proved ON SCREEN before anything in it is pressed (§7.2): the page not scrolled by the test,
   the card's box inside the screen, the element at its centre and corners the card itself. */
import { expect, test, type Browser, type Page } from '@playwright/test'
import { calendarOnTop, go, login, tapCalendarDate } from './app'

const PHONE = { width: 390, height: 844 }
const DESK = { width: 1440, height: 900 }
type Size = { width: number; height: number }

async function world(browser: Browser, baseURL: string | undefined, viewport: Size, touch: boolean) {
  const context = await browser.newContext({ baseURL, viewport, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await context.newPage()
  const errs: string[] = []
  page.on('pageerror', e => errs.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await login(page)
  const press = async (sel: string) => { const l = page.locator(sel).first(); if (touch) await l.tap(); else await l.click() }
  return { context, page, errs, press }
}
const rect = (page: Page, sel: string) => page.locator(sel).first().evaluate(el => { const b = el.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height } })
const boxValue = (page: Page, sel: string) => page.locator(sel).first().getAttribute('data-value')

/** a date box: inside the screen and inside the form that holds it */
async function boxFits(page: Page, sel: string, holder: string, what: string) {
  const b = await rect(page, sel), h = await rect(page, holder)
  const vw = page.viewportSize()!.width
  expect(b.w, `${what}: the box has no width`).toBeGreaterThan(60)
  expect(b.l, `${what}: off the left of the screen`).toBeGreaterThanOrEqual(0); expect(b.r, `${what}: off the right of the screen`).toBeLessThanOrEqual(vw + 0.5)
  expect(b.l, `${what}: out of its form on the left`).toBeGreaterThanOrEqual(h.l - 0.5); expect(b.r, `${what}: out of its form on the right`).toBeLessThanOrEqual(h.r + 0.5)
}
/** on the open calendar: turn to the month and tap the date (e2e/app.ts) */
const pick = (page: Page, press: (sel: string) => Promise<void>, iso: string) => tapCalendarDate(page, iso, !!(page.context() as any)._options?.hasTouch)
async function openCalendarWindow(page: Page, press: (sel: string) => Promise<void>) {
  await go(page, 'inputs')
  await press('#inGear'); await press('[data-testid="iset-days"]')
  await expect(page.locator('[data-testid="win-days"]')).toBeVisible()
  /* the settings window that opened it is closed, so the Calendar window is what stands behind "Every …" */
  const x = page.locator('[data-testid="win-inputsset-x"]')
  if (await x.count()) await x.evaluate(e => (e as HTMLElement).click())
}
const adminPanel = async (page: Page, name: 'Users' | 'Data') => {
  await page.evaluate(() => (window as any).go('admin'))
  await expect(page.locator('#page-admin.on')).toBeVisible()
  /* a phone shows one category at a time: back to the list of them first */
  const back = page.locator('#page-admin .adm-back')
  if (await back.count() && await back.first().isVisible()) await back.first().click()
  await page.evaluate(n => { const b = [...document.querySelectorAll<HTMLElement>('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && new RegExp('^' + n).test((b.textContent || '').trim())); if (b) b.click() }, name)
}

for (const [what, viewport, touch] of [['a phone', PHONE, true], ['a desktop', DESK, false]] as const) {
  test(`${what}: "Every Thursday" — the two dates are the app's own boxes, and the calendar opens on top of both windows`, async ({ browser, baseURL }) => {
    const { context, page, errs, press } = await world(browser, baseURL, viewport, touch)
    await openCalendarWindow(page, press)
    await press('[data-testid="days-wd-3"]')
    const win = '[data-testid="win-every"]'
    await expect(page.locator(win)).toBeVisible()
    expect(await page.locator(`${win} input[type="date"]`).count(), 'the phone’s own date box is still in the window').toBe(0)
    await boxFits(page, '[data-testid="every-from"]', `${win} .win-body`, 'From')
    const from0 = (await boxValue(page, '[data-testid="every-from"]'))!
    expect(new Date(from0 + 'T00:00:00Z').getUTCDay(), 'the start it opens on is not a Thursday').toBe(4)

    await press('[data-testid="every-from"]')
    const m = await calendarOnTop(page, 'From')
    if (touch) {
      /* a phone: the card in the middle of the screen, never wider than the screen less a margin */
      expect(Math.abs((m.l + m.r) / 2 - m.vw / 2), 'the card is not centred').toBeLessThanOrEqual(1)
      expect(m.r - m.l).toBeLessThanOrEqual(350.5)
    } else {
      /* a desktop: a small panel right under its box */
      const b = await rect(page, '[data-testid="every-from"]')
      expect(Math.abs(m.t - (b.b + 6)), 'the panel is not right under its box').toBeLessThanOrEqual(1.5)
      expect(Math.abs(m.l - b.l), 'the panel does not line up with its box').toBeLessThanOrEqual(1.5)
    }
    /* Thursday stands out — its heading in the accent, its dates heavier than a Wednesday's — and any date may be picked */
    const heavy = (iso: string) => page.locator(`[data-testid="dcal-day-${iso}"] b`).evaluate(e => +getComputedStyle(e).fontWeight)
    /* another Thursday of the month on screen (the picked one is heavy for being picked), and the Wednesday before it */
    const day = +from0.slice(8), other = day + 7 <= 28 ? day + 7 : day - 7
    const iso = (d: number) => from0.slice(0, 8) + String(d).padStart(2, '0')
    expect(await heavy(iso(other)), 'a Thursday is not heavier than a Wednesday').toBeGreaterThan(await heavy(iso(other - 1)))
    const dow = page.locator('[data-testid="dcal-dow"] span')
    expect(await dow.nth(3).evaluate(e => getComputedStyle(e).color), 'THU is not lit').not.toBe(await dow.nth(2).evaluate(e => getComputedStyle(e).color))

    /* THE CONTROLS STAY WHERE THEY ARE as the months change length and the weeks change count (the standing rule) */
    const at = async () => ({ next: await rect(page, '[data-testid="dcal-next"]'), prev: await rect(page, '[data-testid="dcal-prev"]'), today: await rect(page, '[data-testid="dcal-today"]'), card: await rect(page, '[data-testid="dcal-card"]') })
    const a0 = await at()
    expect(a0.next.w, 'the arrows are a finger wide').toBeGreaterThanOrEqual(34); expect(a0.next.h).toBeGreaterThanOrEqual(36)
    for (let i = 0; i < 12; i++) {
      await press('[data-testid="dcal-next"]')
      const a = await at()
      for (const k of ['next', 'prev', 'today', 'card'] as const) {
        expect(Math.abs(a[k].l - a0[k].l) + Math.abs(a[k].t - a0[k].t), `${k} moved in month ${i + 1}`).toBeLessThanOrEqual(0.5)
      }
      expect(Math.abs(a.card.h - a0.card.h), `the card changed height in month ${i + 1}`).toBeLessThanOrEqual(0.5)
      /* the head's five things stay on one line, inside the card */
      const head = await rect(page, '.dcal-hd')
      expect(a.next.r, 'the next arrow runs out of the head').toBeLessThanOrEqual(head.r + 0.5)
      expect(a.today.l, 'the Today icon is under the title').toBeGreaterThanOrEqual((await rect(page, '[data-testid="dcal-title"]')).r - 0.5)
    }
    for (let i = 0; i < 12; i++) await press('[data-testid="dcal-prev"]')
    /* a date is a finger tall */
    const d = await rect(page, `[data-testid="dcal-day-${from0}"]`)
    expect(d.h, 'a date is too short for a finger').toBeGreaterThanOrEqual(38); expect(d.w).toBeGreaterThanOrEqual(34)

    /* THE MONTH-AND-YEAR LISTS take the dates' place in a card of the same size, and really scroll */
    await press('[data-testid="dcal-title"]')
    await expect(page.locator('[data-testid="dcal-lists"]')).toBeVisible()
    expect(Math.abs((await rect(page, '[data-testid="dcal-card"]')).h - a0.card.h), 'the card hops when the lists open').toBeLessThanOrEqual(0.5)
    const band = await rect(page, '.dcal-band')
    for (const which of ['months', 'years'] as const) {
      const sel = await rect(page, `[data-testid="dcal-${which}"] [aria-selected="true"]`)
      expect(Math.abs((sel.t + sel.b) / 2 - (band.t + band.b) / 2), `the chosen ${which} row is not in the band`).toBeLessThanOrEqual(1.5)
      expect(sel.h, 'a row is a finger tall').toBeGreaterThanOrEqual(43.5)
    }
    const title = () => page.locator('[data-testid="dcal-title"]').innerText()
    const y0 = +from0.slice(0, 4)
    /* scrolled by three rows, the list comes to rest on a row and that year is chosen */
    await page.locator('[data-testid="dcal-years"]').evaluate(e => { e.scrollTop += 44 * 3 })
    await expect.poll(title, { message: 'the year scrolled into the band is not chosen' }).toContain(String(y0 + 3))
    /* years have no end: scrolled far past any list a calendar could hold */
    for (let i = 0; i < 6; i++) { await page.locator('[data-testid="dcal-years"]').evaluate(e => { e.scrollTop += 44 * 25 }); await expect.poll(title).toContain(String(y0 + 3 + 25 * (i + 1))) }
    await page.locator('[data-testid="dcal-years"] [aria-selected="true"]').evaluate(e => (e.previousElementSibling as HTMLElement).click())
    await expect.poll(title).toContain(String(y0 + 152))
    /* the months go round: one row on is the next month, and eleven more come back to this one — past December */
    const NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const mon = (await title()).split(' ')[0]!
    await page.locator('[data-testid="dcal-months"]').evaluate(e => { e.scrollTop += 44 })
    await expect.poll(title, { message: 'the month scrolled into the band is not chosen' }).toContain(NAMES[(NAMES.indexOf(mon) + 1) % 12]!)
    await page.locator('[data-testid="dcal-months"]').evaluate(e => { e.scrollTop += 44 * 11 })
    await expect.poll(title, { message: 'the months do not go round' }).toContain(mon)
    expect(await title(), 'the months list moved the year').toContain(String(y0 + 152))
    /* the Today icon brings the dates back on today's month, and picks nothing */
    await press('[data-testid="dcal-today"]')
    await expect(page.locator('[data-testid="dcal-grid"]')).toBeVisible()
    const today = await page.evaluate(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}` })
    expect(await page.locator('[data-testid="dcal"]').getAttribute('data-month')).toBe(today.slice(0, 7))
    expect(await boxValue(page, '[data-testid="every-from"]'), 'the Today icon picked a date').toBe(from0)

    /* a tap on a date picks and the calendar goes; both windows are still up */
    const next = new Date(Date.parse(from0 + 'T00:00:00Z') + 7 * 86400000).toISOString().slice(0, 10)
    await pick(page, press, next)
    expect(await boxValue(page, '[data-testid="every-from"]')).toBe(next)
    await expect(page.locator(win)).toBeVisible(); await expect(page.locator('[data-testid="win-days"]')).toBeVisible()

    /* Until: "A date" — its box fits, opens on top, and a date before the start is faint and cannot be picked */
    await press('[data-testid="every-until-date"]')
    await boxFits(page, '[data-testid="every-until"]', `${win} .win-body`, 'Until')
    await expect(page.locator('[data-testid="every-until"]')).toContainText('Pick a date')
    await press('[data-testid="every-until"]')
    await calendarOnTop(page, 'Until')
    await expect(page.locator(`[data-testid="dcal-day-${from0}"]`)).toBeDisabled()
    await expect(page.locator(`[data-testid="dcal-day-${next}"]`)).toBeEnabled()
    /* a tap outside closes it and changes nothing — and presses nothing behind it */
    await page.mouse.click(3, 3)
    await expect(page.locator('[data-testid="dcal-card"]')).toHaveCount(0)
    expect(await boxValue(page, '[data-testid="every-until"]')).toBe('')
    await expect(page.locator(win), 'the tap outside the calendar closed the window behind it').toBeVisible()

    /* THE SAME TAP MADE TWICE DOES NOTHING MORE (the read's F1): a double-click on a date drawn over Save picks the
       date — the second click does not fall through onto Save, so the window is still up and no rule is saved */
    if (!touch) {
      await press('[data-testid="every-until-none"]')
      await press('[data-testid="every-from"]')
      await calendarOnTop(page, 'From, for a double-click')
      const save = await rect(page, '[data-testid="every-save"]')
      const over = await page.locator('[data-testid="dcal-grid"] button:not([disabled])').evaluateAll((els, sv) => {
        const hit = els.find(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; return x > sv.l && x < sv.r && y > sv.t && y < sv.b })
        return hit ? hit.getAttribute('data-testid') : null
      }, save)
      expect(over, 'no date of the calendar is drawn over Save — the test proves nothing').toBeTruthy()
      await page.locator(`[data-testid="${over}"]`).dblclick()
      await expect(page.locator('[data-testid="dcal-card"]')).toHaveCount(0)
      await expect(page.locator(win), 'the second click fell on Save and closed the window').toBeVisible()
      expect(await boxValue(page, '[data-testid="every-from"]')).toBe(over!.slice('dcal-day-'.length))
      await press('[data-testid="every-until-date"]')
    }

    /* ESCAPE closes the calendar first, and the "Every …" window only on a second press (a keyboard — a desktop) */
    if (!touch) {
      await press('[data-testid="every-from"]')
      await calendarOnTop(page, 'From, again')
      await page.keyboard.press('Escape')
      await expect(page.locator('[data-testid="dcal-card"]')).toHaveCount(0)
      await expect(page.locator(win)).toBeVisible()
      await expect(page.locator('[data-testid="every-from"]')).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(page.locator(win)).toHaveCount(0)
      await expect(page.locator('[data-testid="win-days"]')).toBeVisible()
    }
    expect(errs, 'errors on the page').toEqual([])
    await context.close()
  })

  test(`${what}: Admin — a new person's Post in, and the dates of the two clearing forms`, async ({ browser, baseURL }) => {
    const { context, page, errs, press } = await world(browser, baseURL, viewport, touch)
    await adminPanel(page, 'Users')
    await page.locator('#accAddPostIn').scrollIntoViewIfNeeded()
    await boxFits(page, '#accAddPostIn', '#admUsers', 'Post in')
    const today = await page.evaluate(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}` })
    await press('#accAddPostIn')
    await calendarOnTop(page, 'Post in')
    await expect(page.locator(`[data-testid="dcal-day-${today}"]`)).toHaveClass(/is-today/)
    await pick(page, press, today.slice(0, 8) + (today.slice(8) === '15' ? '16' : '15'))
    expect(await boxValue(page, '#accAddPostIn')).toBe(today.slice(0, 8) + (today.slice(8) === '15' ? '16' : '15'))

    await adminPanel(page, 'Data')
    for (const id of ['admWipe', 'admLog']) {
      await page.locator(`#${id}Date`).scrollIntoViewIfNeeded()
      await boxFits(page, `#${id}Date`, '#admData', `${id}: Older than`)
      await expect(page.locator(`#${id}`)).toBeDisabled()
      await press(`#${id}Date`)
      await calendarOnTop(page, `${id}: Older than`)
      await pick(page, press, today.slice(0, 8) + '01')
      await expect(page.locator(`#${id}`), 'a date is picked: the form can ask').toBeEnabled()
      /* "A date range": ONE calendar in the form — no second box, nothing floating */
      await page.selectOption(`#${id}Mode`, 'range')
      await expect(page.locator(`#${id}Run`)).toBeVisible()
      expect(await page.locator(`#${id}Date2`).count()).toBe(0); expect(await page.locator('.dcal-layer:not(.dcal-patch)').count()).toBe(0)
      await page.locator(`#${id}Run`).scrollIntoViewIfNeeded()
      await boxFits(page, `#${id}Run`, '#admData', `${id}: the range calendar`)
      await press(`[data-testid="${id}Run-day-${today.slice(0, 8)}09"]`); await press(`[data-testid="${id}Run-day-${today.slice(0, 8)}12"]`)
      await press(`[data-testid="${id}Run-day-${today.slice(0, 8)}09"]`); await press(`[data-testid="${id}Run-day-${today.slice(0, 8)}12"]`)
      await expect(page.locator(`#${id}Run`)).toHaveAttribute('data-from', today.slice(0, 8) + '09')
      await expect(page.locator(`#${id}Run`)).toHaveAttribute('data-to', today.slice(0, 8) + '12')
      /* the band joins the two ends: painted on a day between them, not on the day after */
      const band = (d: string) => page.locator(`[data-testid="${id}Run-day-${today.slice(0, 8)}${d}"]`).evaluate(e => getComputedStyle(e, '::before').backgroundColor)
      expect(await band('10'), 'no band on a day inside the run').not.toBe('rgba(0, 0, 0, 0)')
      expect(await band('13'), 'a band on a day outside the run').toBe('rgba(0, 0, 0, 0)')
      await expect(page.locator(`[data-testid="${id}Run-foot"]`)).toContainText(' to ')
    }
    expect(errs, 'errors on the page').toEqual([])
    await context.close()
  })

  test(`${what}: the upchit date — the calendar on top of an input's own window, over the Medical page`, async ({ browser, baseURL }) => {
    const { context, page, errs, press } = await world(browser, baseURL, viewport, touch)
    await go(page, 'inputs')
    await press('#inMedBtn')
    await page.locator('.medsec.med-pend .medcard').first().scrollIntoViewIfNeeded()
    await press('.medsec.med-pend .medcard')
    await page.waitForSelector('#docViewPop:not([hidden])')
    await press('#docViewUpchit')
    await expect(page.locator('[data-testid="win-inputedit"]')).toBeVisible()
    await boxFits(page, '#inpEditUpDate', '[data-testid="win-inputedit"] .win-body', 'Upchit date')
    const d0 = (await boxValue(page, '#inpEditUpDate'))!
    expect(d0, 'the upchit date opens filled').toMatch(/^\d{4}-\d\d-\d\d$/)
    await press('#inpEditUpDate')
    await calendarOnTop(page, 'Upchit date')
    const other = d0.slice(0, 8) + (d0.slice(8) === '10' ? '11' : '10')
    await pick(page, press, other)
    expect(await boxValue(page, '#inpEditUpDate')).toBe(other)
    await expect(page.locator('[data-testid="win-inputedit"]'), 'picking a date closed the form').toBeVisible()
    expect(errs, 'errors on the page').toEqual([])
    await context.close()
  })
}

/* D786: "fix this to fit the phone size which might be variable" — measured at four widths, and with the window dragged
   narrower than the screen it cannot be on a phone (its width is the screen's), so the four widths are the claim. */
for (const width of [320, 360, 390, 440]) {
  test(`a phone ${width} wide: the From and Until boxes fit "Every Thursday", and the calendar fits the screen`, async ({ browser, baseURL }) => {
    const { context, page, press } = await world(browser, baseURL, { width, height: 780 }, true)
    await openCalendarWindow(page, press)
    await press('[data-testid="days-wd-3"]')
    const win = '[data-testid="win-every"]'
    await expect(page.locator(win)).toBeVisible()
    await press('[data-testid="every-until-date"]')
    for (const id of ['every-from', 'every-until']) {
      await boxFits(page, `[data-testid="${id}"]`, `${win} .win-body`, id)
      /* and the words in it are whole: not cut with "…" */
      const cut = await page.locator(`[data-testid="${id}"] .datebox-txt`).evaluate(e => e.scrollWidth > e.clientWidth + 0.5)
      expect(cut, `${id}: its date is cut short`).toBe(false)
    }
    const w = await rect(page, win)
    expect(w.l).toBeGreaterThanOrEqual(0); expect(w.r).toBeLessThanOrEqual(width + 0.5)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'the page scrolls sideways').toBe(true)
    await press('[data-testid="every-from"]')
    const m = await calendarOnTop(page, `From at ${width}`)
    expect(m.l, 'a margin at the left').toBeGreaterThanOrEqual(11.5); expect(m.vw - m.r, 'a margin at the right').toBeGreaterThanOrEqual(11.5)
    /* September — the longest name — still leaves the head on one line */
    for (let i = 0; i < 12; i++) {
      await press('[data-testid="dcal-next"]')
      const head = await rect(page, '.dcal-hd'), next = await rect(page, '[data-testid="dcal-next"]'), t = await rect(page, '[data-testid="dcal-title"]'), my = await rect(page, '.dcal-my')
      expect(next.r, 'the head runs out of the card').toBeLessThanOrEqual(head.r + 0.5)
      expect(my.r, 'the month and year run out of their room').toBeLessThanOrEqual(t.r + 0.5)
      expect(head.h, 'the head wrapped onto two lines').toBeLessThanOrEqual(52)
    }
    await context.close()
  })
}

/* THE TRACKER'S OWN DATE BOXES ARE NOT THIS STEP'S — and the app's date-box look must not reach them. The Tracker wraps
   each of its date boxes in an element of its own that had the SAME class name as the app's new date box, so on the
   first build of this step every one of them wore the new box's border, padding and pointer (found 13 Oct 26, starting
   the Tracker's own job — no check of step one had opened the Tracker, because step one does not touch it). The
   roll-call's lesson: a new class name on one global stylesheet is searched for in all three apps before it is used. */
test('the Tracker’s own date boxes are untouched: the app’s date-box look does not reach them', async ({ browser, baseURL }) => {
  const { context, page } = await world(browser, baseURL, DESK, false)
  await go(page, 'tracker')
  await page.waitForSelector('#flowSvg .ball', { timeout: 20000 })
  const wrap = page.locator('#page-tracker #lastSyll').locator('xpath=..')
  await expect(wrap, 'the Tracker’s Last Flown box is not on the page — the test proves nothing').toHaveCount(1)
  const st = await wrap.evaluate(e => { const c = getComputedStyle(e); return { tag: e.tagName, border: c.borderTopWidth, padding: c.paddingLeft, pointer: c.cursor === 'pointer' } })
  expect(st).toEqual({ tag: 'SPAN', border: '0px', padding: '0px', pointer: false })
  await context.close()
})

test('a sideways phone (844 × 390): the whole calendar is on the screen', async ({ browser, baseURL }) => {
  const { context, page, press } = await world(browser, baseURL, { width: 844, height: 390 }, true)
  await openCalendarWindow(page, press)
  await press('[data-testid="days-wd-3"]')
  await page.locator('[data-testid="every-from"]').scrollIntoViewIfNeeded()
  await press('[data-testid="every-from"]')
  await calendarOnTop(page, 'From, sideways')
  await press('[data-testid="dcal-title"]')
  await calendarOnTop(page, 'the lists, sideways')
  await context.close()
})

/* THE WALK'S FIND (13 Oct 26, W2's scenario 9): with a calendar open, the mouse wheel scrolled the page behind the veil
   and the panel ended up over its own box. The veil has taken the page: the wheel moves nothing behind it — and still
   scrolls a month-and-year list. */
test('a desktop: the mouse wheel does not scroll the page behind an open calendar, and still scrolls its lists', async ({ browser, baseURL }) => {
  const { context, page, press } = await world(browser, baseURL, { width: 1280, height: 640 }, false)
  await adminPanel(page, 'Users')
  await page.locator('#accAddPostIn').evaluate(e => { const r = e.getBoundingClientRect(); window.scrollBy(0, r.top - 320) })
  const scrolled = () => page.evaluate(() => Math.round(document.scrollingElement!.scrollTop + [...document.querySelectorAll<HTMLElement>('#page-admin, #page-admin *')].reduce((a, e) => a + e.scrollTop, 0)))
  /* the page CAN scroll here — or "it did not scroll" would prove nothing */
  const y0 = await scrolled()
  await page.mouse.move(640, 100); await page.mouse.wheel(0, -120)
  await expect.poll(scrolled, { message: 'the page under test does not scroll at all' }).not.toBe(y0)
  await page.mouse.wheel(0, 120)
  await expect.poll(scrolled).toBe(y0)
  await press('#accAddPostIn')
  const m0 = await calendarOnTop(page, 'Post in')
  const box0 = await rect(page, '#accAddPostIn')
  await page.mouse.move(20, 300)                                           // over the veil
  await page.mouse.wheel(0, -240); await page.mouse.wheel(0, 240); await page.mouse.wheel(0, -240)
  await page.waitForTimeout(250)
  expect(await scrolled(), 'the page scrolled behind the calendar').toBe(y0)
  expect((await rect(page, '#accAddPostIn')).t, 'the box moved under the calendar').toBe(box0.t)
  await page.mouse.move((m0.l + m0.r) / 2, (m0.t + m0.b) / 2)              // over the dates
  await page.mouse.wheel(0, -240)
  await page.waitForTimeout(250)
  expect(await scrolled()).toBe(y0)
  /* the lists still scroll under the wheel */
  await press('[data-testid="dcal-title"]')
  const title = () => page.locator('[data-testid="dcal-title"]').innerText()
  const t0 = await title()
  const yr = await rect(page, '[data-testid="dcal-years"]')
  await page.mouse.move(yr.l + yr.w / 2, yr.t + yr.h / 2)
  await page.mouse.wheel(0, 132)
  await expect.poll(title, { message: 'the wheel over the year list chose no other year' }).not.toBe(t0)
  expect(await scrolled()).toBe(y0)
  await context.close()
})

/* THE WALK'S FIND (13 Oct 26, W1's scenario 14): a phone turned on its side and back with the calendar up left the card
   half off the screen — it kept the place written for the other layout. Whole on the screen, and on top, at each turn. */
test('a phone turned on its side and back with the calendar up: the calendar is wholly on the screen at each turn', async ({ browser, baseURL }) => {
  const { context, page, press } = await world(browser, baseURL, PHONE, true)
  await openCalendarWindow(page, press)
  await press('[data-testid="days-wd-3"]')
  await press('[data-testid="every-from"]')
  await calendarOnTop(page, 'upright')
  for (const [what, size] of [['on its side', { width: 844, height: 390 }], ['upright again', PHONE], ['on its side again', { width: 844, height: 390 }], ['upright a third time', PHONE]] as const) {
    await page.setViewportSize(size)
    const m = await calendarOnTop(page, what)
    if (size.width < 620) expect(Math.abs((m.l + m.r) / 2 - m.vw / 2), `${what}: the card is not in the middle of the phone's screen`).toBeLessThanOrEqual(1)
    /* on its side the screen is wide enough for the desktop's layout: a panel lined up with its box's left edge — so the
       layout really was asked again, not kept from the turn before */
    else expect(Math.abs(m.l - (await rect(page, '[data-testid="every-from"]')).l), `${what}: the panel does not line up with its box`).toBeLessThanOrEqual(1.5)
  }
  await context.close()
})

test('a desktop: where there is no room under its box, the calendar opens above it — still on the screen', async ({ browser, baseURL }) => {
  const { context, page, press } = await world(browser, baseURL, { width: 1280, height: 640 }, false)
  await adminPanel(page, 'Users')
  /* the box at the foot of the screen */
  await page.locator('#accAddPostIn').evaluate(e => { const r = e.getBoundingClientRect(); window.scrollBy(0, r.bottom - innerHeight + 24) })
  const b = await rect(page, '#accAddPostIn')
  expect(page.viewportSize()!.height - b.b, 'the box is not at the foot of the screen').toBeLessThan(120)
  await press('#accAddPostIn')
  const m = await calendarOnTop(page, 'Post in, at the foot')
  expect(m.b, 'the calendar is not above its box').toBeLessThanOrEqual(b.t + 0.5)
  await context.close()
})

/* ---------------------------------------------------------------------------------------------------------------
   THE SWIPE (D786, D795). A real finger: touch events through the browser's own input pipeline. THE FINGER RESTS
   BEFORE IT LIFTS, as a finger does — a scripted swipe that lifts at full speed leaves this browser believing a
   fling is under way, and it then swallows the next tap (found 13 Oct 26; the same on the Inputs calendar built
   before this job, so it is the test's world — `docs/walk-scripts.md`). His own iPhone is the proof of the feel.
   --------------------------------------------------------------------------------------------------------------- */
test('a phone: a finger slid sideways turns the Calendar window’s month and the Holidays list’s year, and presses nothing', async ({ browser, baseURL }) => {
  const { context, page, errs, press } = await world(browser, baseURL, PHONE, true)
  const cdp = await context.newCDPSession(page)
  const swipe = async (sel: string, dx: number, dy = 0, frac = 0.5) => {
    const b = await page.locator(sel).first().evaluate(e => {
      const r = e.getBoundingClientRect(); const w = e.closest('.win-body'); const wr = w ? w.getBoundingClientRect() : { top: 0, bottom: innerHeight }
      const t = Math.max(r.top, wr.top, 0), bt = Math.min(r.bottom, wr.bottom, innerHeight)
      return { l: r.left, w: r.width, t, h: bt - t }
    })
    /* the finger lands on the middle of what it is aimed at — so "begins on a date's button" is on that button */
    const x0 = b.l + b.w / 2, y0 = b.t + Math.min(b.h - 6, Math.max(6, b.h * frac))
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] })
    for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + dx * i / 6, y: y0 + dy * i / 6 }] })
    await page.waitForTimeout(90)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }
  await openCalendarWindow(page, press)
  const month = () => page.locator('[data-testid="days-month"]').innerText()
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const shift = (m: string, by: number) => { const [name, y] = m.split(' '); const n = +y * 12 + MONTHS.indexOf(name) + by; return `${MONTHS[n % 12]} ${Math.floor(n / 12)}` }
  const m0 = await month()

  /* the browser is told the part scrolls up and down only, so it never takes the sideways move for itself */
  expect(await page.locator('[data-testid="days-parts"]').evaluate(e => getComputedStyle(e).touchAction)).toBe('pan-y')
  /* and the part reaches the window's foot: the room under a short month is part of what is swiped */
  const parts = await rect(page, '[data-testid="days-parts"]'), body = await rect(page, '[data-testid="win-days"] .win-body')
  expect(parts.b, 'the swiped part stops short of the window’s foot').toBeGreaterThanOrEqual(body.b - 14)

  await swipe('[data-testid="days-grid"]', -140)
  await expect.poll(month, { message: 'left is the next month' }).toBe(shift(m0, 1))
  await swipe('[data-testid="days-grid"]', 140)
  await expect.poll(month, { message: 'right is the last month' }).toBe(m0)
  /* fifty pixels and more; less is not a swipe */
  await swipe('[data-testid="days-grid"]', -40)
  await page.waitForTimeout(250); expect(await month()).toBe(m0)
  /* more down than sideways is the page's own */
  await swipe('[data-testid="days-grid"]', -70, 130)
  await page.waitForTimeout(250); expect(await month()).toBe(m0)
  /* in the empty room at the foot of the part, and on the head */
  await swipe('[data-testid="days-parts"]', -140, 0, 0.985)
  await expect.poll(month, { message: 'the room at the foot is part of the month' }).toBe(shift(m0, 1))
  await swipe('.days-head', 140)
  await expect.poll(month).toBe(m0)

  /* A SWIPE THAT BEGINS ON A DATE'S BUTTON turns the page and presses nothing: no day changes its flying */
  const cls = () => page.locator('[data-testid="days-grid"] .days-step').evaluateAll(els => els.map(e => e.getAttribute('data-testid') + '=' + e.getAttribute('data-cls')).join(','))
  const before = await cls()
  const aStep = page.locator('[data-testid="days-grid"] .days-step').nth(8)
  const id = await aStep.getAttribute('data-testid')
  await swipe(`[data-testid="${id}"]`, -140)
  await expect.poll(month).toBe(shift(m0, 1))
  await swipe('[data-testid="days-grid"]', 140)
  await expect.poll(month).toBe(m0)
  expect(await cls(), 'a swipe pressed a date’s button').toBe(before)
  /* the same on a weekday's heading: no "Every …" window */
  await swipe('[data-testid="days-wd-2"]', -140)
  await expect.poll(month).toBe(shift(m0, 1))
  expect(await page.locator('[data-testid="win-every"]').count(), 'a swipe opened "Every Wednesday"').toBe(0)
  await swipe('[data-testid="days-grid"]', 140)
  await expect.poll(month).toBe(m0)

  /* AND A TAP IS STILL A TAP, straight after a swipe: the date's button steps its day */
  await swipe('[data-testid="days-grid"]', -140); await expect.poll(month).toBe(shift(m0, 1))
  await swipe('[data-testid="days-grid"]', 140); await expect.poll(month).toBe(m0)
  const was = await page.locator(`[data-testid="${id}"]`).getAttribute('data-cls')
  await press(`[data-testid="${id}"]`)
  await expect.poll(() => page.locator(`[data-testid="${id}"]`).getAttribute('data-cls'), { message: 'a tap after a swipe did nothing' }).not.toBe(was)
  /* the arrows and Today stay */
  await press('[data-testid="days-next"]'); await expect.poll(month).toBe(shift(m0, 1))
  await press('[data-testid="days-prev"]'); await expect.poll(month).toBe(m0)

  /* THE APP'S NEW CALENDAR ITSELF (D800): a sideways finger on its dates turns its month; begun on a date it picks
     nothing and the calendar stays up; a tap afterwards picks */
  await press('[data-testid="days-wd-3"]')
  await press('[data-testid="every-from"]')
  await expect(page.locator('[data-testid="dcal-card"]')).toBeVisible()
  const calMonth = () => page.locator('[data-testid="dcal"]').getAttribute('data-month')
  const from0 = (await page.locator('[data-testid="every-from"]').getAttribute('data-value'))!
  const c0 = (await calMonth())!
  const add = (ym: string, by: number) => { const n = +ym.slice(0, 4) * 12 + +ym.slice(5, 7) - 1 + by; return `${Math.floor(n / 12)}-${String(n % 12 + 1).padStart(2, '0')}` }
  await swipe('[data-testid="dcal-grid"]', -140)
  await expect.poll(calMonth, { message: 'a finger slid left on the calendar is the next month' }).toBe(add(c0, 1))
  await swipe('[data-testid="dcal-grid"]', 140)
  await expect.poll(calMonth).toBe(c0)
  await swipe(`[data-testid="dcal-day-${from0.slice(0, 8)}15"]`, -140)
  await expect.poll(calMonth, { message: 'a swipe begun on a date did not turn the month' }).toBe(add(c0, 1))
  await expect(page.locator('[data-testid="dcal-card"]'), 'a swipe begun on a date picked it').toBeVisible()
  expect(await page.locator('[data-testid="every-from"]').getAttribute('data-value')).toBe(from0)
  await swipe('[data-testid="dcal-grid"]', 140)
  await expect.poll(calMonth).toBe(c0)
  /* the browser is told the dates scroll up and down only — it never takes the sideways move for itself */
  expect(await page.locator('[data-testid="dcal-grid"]').evaluate(e => getComputedStyle(e).touchAction)).toBe('pan-y')
  const other = from0.slice(0, 8) + (from0.slice(8) === '16' ? '17' : '16')
  await press(`[data-testid="dcal-day-${other}"]`)
  await expect(page.locator('[data-testid="dcal-card"]'), 'a tap after a swipe did not pick').toHaveCount(0)
  expect(await page.locator('[data-testid="every-from"]').getAttribute('data-value')).toBe(other)
  await press('[data-testid="every-cancel"]')

  /* THE HOLIDAYS LIST: the year */
  await press('[data-testid="days-tab-holidays"]')
  const year = () => page.locator('[data-testid="hol-year"]').innerText()
  const y0 = +(await year())
  await swipe('[data-testid="days-parts"]', -140)
  await expect.poll(year, { message: 'left is the next year' }).toBe(String(y0 + 1))
  /* in the empty room under the list, and beginning on "+ Add" — which opens no form */
  await swipe('[data-testid="days-parts"]', 140, 0, 0.985)
  await expect.poll(year, { message: 'right, in the room under the list, is the last year' }).toBe(String(y0))
  await swipe('[data-testid="hol-add"]', -140)
  await expect.poll(year).toBe(String(y0 + 1))
  expect(await page.locator('[data-testid="win-holiday"]').count(), 'a swipe opened the holiday form').toBe(0)
  await press('[data-testid="hol-prev"]'); await expect.poll(year).toBe(String(y0))
  /* the month it left is where it was */
  await press('[data-testid="days-tab-month"]')
  expect(await month()).toBe(m0)
  expect(errs, 'errors on the page').toEqual([])
  await context.close()
})

test('a desktop: a mouse dragged across the Calendar window’s month turns nothing — the arrows are the way', async ({ browser, baseURL }) => {
  const { context, page, press } = await world(browser, baseURL, DESK, false)
  await openCalendarWindow(page, press)
  const month = () => page.locator('[data-testid="days-month"]').innerText()
  const m0 = await month()
  const g = await rect(page, '[data-testid="days-grid"]')
  await page.mouse.move(g.l + g.w * 0.7, g.t + 14); await page.mouse.down()
  await page.mouse.move(g.l + g.w * 0.2, g.t + 14, { steps: 8 }); await page.mouse.up()
  await page.waitForTimeout(300)
  expect(await month()).toBe(m0)
  await press('[data-testid="days-next"]')
  await expect.poll(month).not.toBe(m0)
  await context.close()
})
