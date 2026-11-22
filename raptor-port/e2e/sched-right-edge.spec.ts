/* EDIT SCHEDULE'S DAYS RUN TO THE WINDOW'S RIGHT EDGE UNDER THE FOLDED CREW TAB (his D2293, 22 Nov 26 —
   [SCHED-RIGHT-EDGE]), AND A SCHEDULE PAGE OPENS ITS FRONT DAY WHERE A DAY ARROW LANDS ONE (his D2295, the same day —
   [SCHED-OPEN-20-OFF]).

   jsdom has no layout, so every line here is measured in a real browser on the built app, at a desktop's size (his
   PC's 1536 x 864) and at his iPhone's (402 x 874). The drawing he approved, with its measures at seven window widths:
   docs/mock/2026-11-22-sched-right-edge/.

   WHAT STAYS AS IT WAS is pinned first — these passed before the change and must pass after it:
     · the day arrows step ONE day a press, each day landing where the one before it did (his own question when he
       asked for the edge: "the left and right arrows still step one day at a time");
     · with the crew panel OPEN the tab keeps its lane beside the panel, never over a name;
     · a phone, which never had the lane, and where a day rests flush against the screen's edge.
   WHAT CHANGES failed before it:
     · folded, the days' strip ends at the window's edge, the CREW tab over it, the foot scroll bar with it, and the
       strip's own far end keeps room for the tab;
     · arriving from the other schedule page, the front day stands where an arrow press lands a day — it stood 20px
       further left, hard against the window, under the left arrow. */
import { expect, test } from '@playwright/test'
import type { Browser, Page } from '@playwright/test'
import { login } from './app'

const EDIT = '#page-editsched .week'
const VIEW = '#vWeek'

async function desktop(browser: Browser, baseURL: string | undefined) {
  const context = await browser.newContext({ baseURL, viewport: { width: 1536, height: 864 } })
  const page: Page = await context.newPage()
  await login(page)
  return { context, page }
}
/* the top bar's own tab, pressed as he presses it — the page switch that carries the front day across */
async function tab(page: Page, name: 'Edit Schedule' | 'View-only Sched', want: 'editsched' | 'viewsched') {
  await page.locator('.topbar').getByText(name, { exact: true }).first().click()
  await page.waitForFunction(p => (window as any).CURPAGE === p, want)
  await rest(page, want === 'editsched' ? EDIT : VIEW)
}
/* the strip at rest: the same sideways scroll for a quarter of a second (an arrow's glide has ended) */
async function rest(page: Page, sel: string) {
  await page.waitForSelector(`${sel} .day`)
  await page.evaluate(async s => {
    const el = document.querySelector(s) as HTMLElement
    let last = NaN, since = performance.now()
    for (;;) {
      await new Promise(r => requestAnimationFrame(() => r(null)))
      const now = el.scrollLeft
      if (now !== last) { last = now; since = performance.now() }
      if (performance.now() - since > 250) return
    }
  }, sel)
}
async function fold(page: Page, want: boolean) {
  const is = await page.evaluate(() => document.body.classList.contains('ros-collapsed'))
  if (is !== want) await page.click('.ros-rail')
  await page.waitForFunction(w => document.body.classList.contains('ros-collapsed') === w, want)
  await page.waitForTimeout(350)   // the panel's own slide, 240ms
  await rest(page, EDIT)
}
/* what the screen shows of one week strip, in window pixels */
function read(page: Page, sel: string) {
  return page.evaluate(s => {
    const wk = document.querySelector(s) as HTMLElement
    const box = (el: Element | null) => { const r = el!.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width } }
    const cs = getComputedStyle(wk)
    const days = Array.from(wk.querySelectorAll('.day')).map(d => ({ day: d.getAttribute('data-day'), ...box(d) }))
    /* the front day: the first one whose left edge has not gone off the strip's left */
    const front = days.filter(d => d.left >= box(wk).left - 2).sort((a, b) => a.left - b.left)[0]
    const board = wk.closest('.edit-board')
    const rail = document.querySelector('.ros-rail'), bar = document.getElementById('hscroll'), panel = document.querySelector('#page-editsched .eroster')
    return {
      innerWidth: window.innerWidth, week: box(wk), padLeft: parseFloat(cs.paddingLeft), padRight: parseFloat(cs.paddingRight),
      boardPadRight: board ? parseFloat(getComputedStyle(board).paddingRight) : null,
      front, last: days[days.length - 1], scrollLeft: wk.scrollLeft,
      rail: rail ? box(rail) : null, bar: bar && bar.classList.contains('on') ? box(bar) : null, panel: panel ? box(panel) : null,
    }
  }, sel)
}
async function arrow(page: Page, dir: 'next' | 'prev', sel: string) {
  await page.click(`.week-nav.${dir}`)
  await rest(page, sel)
  return read(page, sel)
}

test.describe('Edit Schedule on a desktop — the right edge and the day arrows', () => {
  test('the crew panel folded: each press of an arrow moves one day, and every day lands in the same place', async ({ browser, baseURL }) => {
    const { context, page } = await desktop(browser, baseURL)
    await tab(page, 'Edit Schedule', 'editsched')
    await fold(page, true)
    const first = await arrow(page, 'next', EDIT)
    expect(first.front.day, 'one press from Monday shows Tuesday first').toBe('1')
    const home = first.front.left
    expect(Math.abs(home - (first.week.left + first.padLeft)), 'a day lands the strip\'s own margin in from its left edge').toBeLessThanOrEqual(1)
    for (const day of ['2', '3', '4', '5', '6']) {
      const at = await arrow(page, 'next', EDIT)
      expect(at.front.day, `the next press shows day ${day} first`).toBe(day)
      expect(Math.abs(at.front.left - home), `day ${day} lands where Tuesday did`).toBeLessThanOrEqual(1)
    }
    for (const day of ['5', '4', '3', '2', '1', '0']) {
      const at = await arrow(page, 'prev', EDIT)
      expect(at.front.day, `the press back shows day ${day} first`).toBe(day)
      expect(Math.abs(at.front.left - home), `day ${day} lands where Tuesday did, going back`).toBeLessThanOrEqual(1)
    }
    await context.close()
  })

  test('the crew panel open: the CREW tab keeps its lane beside the panel, never over it', async ({ browser, baseURL }) => {
    const { context, page } = await desktop(browser, baseURL)
    await tab(page, 'Edit Schedule', 'editsched')
    await fold(page, false)
    const at = await read(page, EDIT)
    expect(at.boardPadRight, 'the lane beside the open panel').toBe(26)
    expect(at.rail!.left, 'the tab starts where the panel ends').toBeGreaterThanOrEqual(at.panel!.right - 0.5)
    expect(at.week.right, 'the days end where the panel begins').toBeLessThanOrEqual(at.panel!.left + 0.5)
    await context.close()
  })

  test('the crew panel folded: the days run to the window\'s edge under the CREW tab, the foot scroll bar with them', async ({ browser, baseURL }) => {
    const { context, page } = await desktop(browser, baseURL)
    await tab(page, 'Edit Schedule', 'editsched')
    await fold(page, true)
    const at = await read(page, EDIT)
    expect(at.boardPadRight, 'no empty lane at the window\'s right').toBe(0)
    expect(Math.abs(at.week.right - at.innerWidth), 'the days\' strip ends at the window\'s edge').toBeLessThanOrEqual(0.5)
    expect(at.rail!.left, 'the tab lies over the strip').toBeGreaterThanOrEqual(at.week.left)
    expect(at.rail!.right, 'the tab lies over the strip').toBeLessThanOrEqual(at.week.right + 0.5)
    expect(Math.abs(at.bar!.right - at.innerWidth), 'the foot scroll bar ends where the strip does').toBeLessThanOrEqual(1)
    /* the strip's own far end keeps room for the tab, so the last column is never under it */
    expect(at.padRight, 'room for the tab after the last column').toBeGreaterThanOrEqual(at.rail!.width + 8)
    await page.evaluate(() => { const t = document.getElementById('hsTrack')!; t.scrollLeft = t.scrollWidth })
    await rest(page, EDIT)
    const end = await read(page, EDIT)
    expect(end.last.right, 'at the far end the last column stops clear of the tab').toBeLessThanOrEqual(end.rail!.left - 7.5)
    /* folding and unfolding puts the lane back and takes it away again, the bar following each time (D1528) */
    await fold(page, false)
    const open = await read(page, EDIT)
    expect(open.boardPadRight).toBe(26)
    expect(Math.abs(open.bar!.right - open.week.right), 'the bar fits the strip with the panel open').toBeLessThanOrEqual(1)
    await fold(page, true)
    const again = await read(page, EDIT)
    expect(Math.abs(again.week.right - again.innerWidth)).toBeLessThanOrEqual(0.5)
    expect(Math.abs(again.bar!.right - again.innerWidth)).toBeLessThanOrEqual(1)
    await context.close()
  })

  test('opened from the other schedule page, the front day stands where an arrow lands a day', async ({ browser, baseURL }) => {
    const { context, page } = await desktop(browser, baseURL)
    await tab(page, 'Edit Schedule', 'editsched')
    const opened = await read(page, EDIT)
    expect(opened.front.day, 'Monday first, as on View-only Sched').toBe('0')
    expect(Math.abs(opened.front.left - (opened.week.left + opened.padLeft)), 'Monday opens the strip\'s margin in, clear of the left arrow').toBeLessThanOrEqual(1)
    const tue = await arrow(page, 'next', EDIT)
    const wed = await arrow(page, 'next', EDIT)
    expect(wed.front.day).toBe('2')
    expect(Math.abs(tue.front.left - opened.front.left), 'an arrow lands a day where the page opened one').toBeLessThanOrEqual(1)
    /* Wednesday carried to View-only Sched, and back */
    await tab(page, 'View-only Sched', 'viewsched')
    const view = await read(page, VIEW)
    expect(view.front.day, 'the same day first on View-only Sched').toBe('2')
    expect(Math.abs(view.front.left - (view.week.left + view.padLeft)), 'in the place an arrow lands a day there').toBeLessThanOrEqual(1)
    await tab(page, 'Edit Schedule', 'editsched')
    const back = await read(page, EDIT)
    expect(back.front.day).toBe('2')
    expect(Math.abs(back.front.left - wed.front.left), 'and back on Edit Schedule, where the arrow left it').toBeLessThanOrEqual(1)
    await context.close()
  })

  /* THE OTHER WAYS THE APP BRINGS A NAMED DAY TO THE FRONT rest it in the same place (D2295 — one reading,
     state/view.ts weekFrontInset): an Undo whose day has gone off the side (highlights.ts bringDayIntoView), and the
     changes window's "take me to this change" (bringIntoView, the warning jump's own recipe). Each parked its day on
     the window's edge before. A real change first, made on Monday through a jet's own stores window. */
  async function changeMonday(page: Page) {
    await page.locator(`${EDIT} .day[data-day="0"] [data-air]:visible`).first().click()
    await page.locator('#airAdd').click()
    await page.locator('#airDone').click()
  }
  test('an Undo that brings its day back on screen lands it where an arrow lands a day', async ({ browser, baseURL }) => {
    const { context, page } = await desktop(browser, baseURL)
    await tab(page, 'Edit Schedule', 'editsched')
    await changeMonday(page)
    const tue = await arrow(page, 'next', EDIT)
    await arrow(page, 'next', EDIT); await arrow(page, 'next', EDIT)
    const thu = await arrow(page, 'next', EDIT)
    expect(thu.front.day, 'Monday is four days off the side').toBe('4')
    await page.click('#undoBtn')
    await page.waitForFunction(s => (document.querySelector(s) as HTMLElement).scrollLeft < 100, EDIT)
    await rest(page, EDIT)
    const back = await read(page, EDIT)
    expect(back.front.day, 'the Undo brought Monday to the front').toBe('0')
    expect(Math.abs(back.front.left - tue.front.left), 'in the place an arrow lands a day').toBeLessThanOrEqual(1)
    /* …and the next press of an arrow is ONE day from where the Undo left the week — not one day from where the
       presses before it were heading (walker A's F2, 22 Nov 26: it showed Saturday) */
    const after = await arrow(page, 'next', EDIT)
    expect(after.front.day, 'one press after the Undo shows Tuesday').toBe('1')
    await context.close()
  })
  test('"take me to this change" lands its day where an arrow lands a day', async ({ browser, baseURL }) => {
    const { context, page } = await desktop(browser, baseURL)
    await tab(page, 'Edit Schedule', 'editsched')
    /* a crew change on Monday — a change with a place to go to (a stores change has none: its line is not a button).
       Written through the app's own slot write, as the geometry suite's changes-window test does. */
    await page.evaluate(sel => {
      const w = window as any
      const el = Array.from(document.querySelectorAll(`${sel} .day[data-day="0"] [data-slot]`))
        .find(e => /\.[pw]$/.test((e as HTMLElement).dataset.slot || '') && w.slotVal((e as HTMLElement).dataset.slot)) as HTMLElement
      const k = el.dataset.slot!
      w.setSlotVal(k, w.slotVal(k) === 'bane' ? 'stiff' : 'bane')
    }, EDIT)
    const tue = await arrow(page, 'next', EDIT)
    await arrow(page, 'next', EDIT); await arrow(page, 'next', EDIT)
    await arrow(page, 'next', EDIT)
    await page.click('#histBtn')
    const win = page.locator('.chgwin:not([hidden])').first()
    await expect(win).toBeVisible()
    await win.locator('.win-tab', { hasText: 'All changes' }).first().click()
    await win.locator('button.cw-l').first().click()
    await page.waitForFunction(s => (document.querySelector(s) as HTMLElement).scrollLeft < 100, EDIT)
    await rest(page, EDIT)
    const at = await read(page, EDIT)
    expect(at.front.day, 'the jump brought Monday to the front').toBe('0')
    expect(Math.abs(at.front.left - tue.front.left), 'in the place an arrow lands a day').toBeLessThanOrEqual(1)
    const after = await arrow(page, 'next', EDIT)
    expect(after.front.day, 'one press after the jump shows Tuesday (walker A\'s F2)').toBe('1')
    await context.close()
  })
})

test('a phone: the day still rests against the screen\'s edge and the strip still runs under the AIRCREW tab', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true })
  const page: Page = await context.newPage()
  await login(page)
  for (const [to, sel] of [['editsched', EDIT], ['viewsched', VIEW], ['editsched', EDIT]] as const) {
    await page.evaluate(p => (window as any).go(p), to)
    await page.waitForFunction(p => (window as any).CURPAGE === p, to)
    await rest(page, sel)
    const at = await read(page, sel)
    expect(at.front.day, `${to}: Monday first`).toBe('0')
    expect(Math.abs(at.front.left - at.week.left), `${to}: the day flush against the screen's edge, as a swipe rests it`).toBeLessThanOrEqual(1)
    expect(Math.abs(at.week.right - at.innerWidth), `${to}: the strip to the screen's edge`).toBeLessThanOrEqual(0.5)
    if (to === 'editsched') expect(at.boardPadRight, 'a phone has no lane').toBe(0)
  }
  await context.close()
})
