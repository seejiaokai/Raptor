/* A FINGER'S DOUBLE TAP ON A WINDOW'S CLOSING BUTTON REACHES NOTHING ON THE GRID BEHIND IT ([LW-DOUBLETAP-OTHER-WINDOWS] —
   the code read's F1 of the night of 6 Nov 26). The guard built for the one-day and drag windows ([LW-NIGHT1025-OLDER] (d),
   `src/leavewar/ui/doubletap.test.tsx`; walked, never in a browser test of its own) is armed by every window over the grid
   now: the person window, ⚙ Settings, the event window, the counter form, the Events list, the Manning sheet, the OIL
   tracker and the event box. What only a browser can see: a real touch — its press, then the click the browser makes of it —
   landing a moment after the window has gone, on the day that stood under the button.

   The gesture is the walk's own (`scripts/handpass/lw-f1106-host.mjs`): a tap, a short gap, a second tap at the same point.
   The gap is the gesture itself, not a wait for the page — the guard's moment is 600 ms from the close, so the second tap
   goes at once (D87 does not apply to it); the pause after it is the time a window would have needed to open.

   A phone only (the lw-phone project, an iPhone by touch): on a desktop the same guard is held by the unit tests' mouse
   double click. */
import { expect, test, type Page } from '@playwright/test'
import { elevenCounters, lwRole, openLeaveWar } from './app'

const T = (id: string) => `[data-testid="${id}"]`
const isPhone = () => test.info().project.name === 'lw-phone'
/* every window a tap on the grid can open, and the windows of this file — each id read from the app's source (the fix
   round's F2: `sel-sheet` named no window; the drag window is `select-sheet`). A day's tap opens, by what it holds: the bid
   window, the day's list, a member's remarks or closed-day window, the credited-OIL / filed-on-Inputs window, his own
   award, a posting's sheet. */
const WINDOWS = ['bid-picker', 'select-sheet', 'daylist-sheet', 'remarks-sheet', 'closed-note', 'raptor-sheet', 'award-sheet', 'postout-sheet', 'postin-sheet',
  'person-window', 'win-lwday', 'event-sheet', 'event-peek', 'manning-sheet', 'counter-form', 'settings-sheet', 'events-sheet', 'oil-sheet']

const openNow = (page: Page) => page.evaluate(ids => ids.filter(t => {
  const e = document.querySelector(`[data-testid="${t}"]`)
  return !!e && e.getBoundingClientRect().height > 0
}).concat(document.querySelector('.qualpop') ? ['qualpop'] : []), WINDOWS)

/** what the GRID holds at a point, read through whatever window lies over it: a day's cell, a name, or null */
const behind = (page: Page, x: number, y: number) => page.evaluate(({ x, y }) => {
  const el = document.elementsFromPoint(x, y).find(e => e.closest('.mx') && !e.closest('.bidsheet, .evpeek'))
  return el ? (el.closest('[data-testid]')?.getAttribute('data-testid') ?? String(el.className)) : null
}, { x, y })

const centre = async (page: Page, sel: string) => {
  const b = (await page.locator(sel).first().boundingBox())!
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}

/* what a tap opens on the grid: a day's cell (that day's window, for an admin) or a date of the pinned dates row (the day
   panel) — the tall windows' ✕ (Settings, the person window) stands at the top of a phone's screen, over the pinned dates */
const OPENS = /^(cell-|sticky-head)/

/** The page moved under the window (it scrolls freely under one — 28 Aug 26) until a DAY stands under the button — its
 *  cell, or its date in the pinned row: a tap there opens something, so a second tap that gets through is seen. */
async function dayUnder(page: Page, sel: string) {
  let seen = ''
  for (let i = 0; i < 30; i++) {
    const p = await centre(page, sel)
    const b = await behind(page, p.x, p.y)
    if (b && OPENS.test(b)) return b
    seen = `${b} at ${Math.round(p.x)},${Math.round(p.y)}, the page at ${await page.evaluate(() => Math.round(window.scrollY))}`
    await page.evaluate(() => window.scrollBy(0, 19))
    await page.waitForTimeout(40)
  }
  return `no day: ${seen}`
}

/** the double tap: the first tap closes the window, the second lands where the button stood. `under`: what the grid
 *  holds there; `top`: what the second tap meets, whatever it is (the full-screen windows' ✕ stands over the top bar) */
async function doubleTap(page: Page, sel: string) {
  const p = await centre(page, sel)
  await page.touchscreen.tap(p.x, p.y)
  await page.waitForTimeout(80)
  const under = await behind(page, p.x, p.y)
  const top = await page.evaluate(({ x, y }) => {
    const h = document.elementFromPoint(x, y)
    return h ? (h.closest('[data-testid], [id]')?.getAttribute('data-testid') || h.closest('[id]')?.id || String(h.className)) : null
  }, p)
  await page.touchscreen.tap(p.x, p.y)
  await page.waitForTimeout(700)
  return { under, top, opened: await openNow(page), at: p }
}

/** an Event row's first empty cell on screen, clear of the grid's frozen names */
const emptyEventCell = (page: Page) => page.evaluate(() => {
  const names = document.querySelector('.mx th.who, .mx td.who')?.getBoundingClientRect().right ?? 120
  const c = [...document.querySelectorAll<HTMLElement>('td.ev.editable:not(.has):not(.band)')].find(e => {
    const r = e.getBoundingClientRect()
    return r.width > 0 && r.left > names + 8 && r.right < window.innerWidth - 8
  })
  return c?.getAttribute('data-testid') ?? null
})

test.beforeEach(async ({ page }) => {
  test.skip(!isPhone(), 'a finger\'s double tap: the phone project; a mouse\'s double click is held by doubletap-windows.test.tsx')
  await openLeaveWar(page)
  await lwRole(page, 'admin')
})

/* each window: opened as a person opens it, a day brought under its closing button, the button double-tapped */
const CLOSERS: [string, string, (page: Page) => Promise<void>][] = [
  ['the person window\'s ✕', 'pw-close', async page => { await page.locator(T('person-slipway')).first().click(); await expect(page.locator(T('person-window'))).toBeVisible() }],
  ['⚙ Settings\' ✕', 'settings-close', async page => { await page.locator(T('settings-open')).click(); await expect(page.locator(T('settings-sheet'))).toBeVisible() }],
  ['the counter form\'s ✕', 'cform-close', async page => { await page.locator(T('settings-open')).click(); await page.locator(T('counter-add')).click(); await expect(page.locator(T('counter-form'))).toBeVisible() }],
  ['the counter form\'s Cancel', 'cform-cancel', async page => { await page.locator(T('settings-open')).click(); await page.locator(T('counter-add')).click(); await expect(page.locator(T('counter-form'))).toBeVisible() }],
  ['the Manning sheet\'s ✕', 'manning-info-close', async page => { await elevenCounters(page); await page.locator(T('manning-info-sets')).first().click(); await expect(page.locator(T('manning-sheet'))).toBeVisible() }],
  ['the event window\'s ✕', 'event-cancel', async page => { await page.locator(T((await emptyEventCell(page))!)).click(); await expect(page.locator(T('event-sheet'))).toBeVisible() }],
]
for (const [name, closer, open] of CLOSERS) {
  test(`${name}, double-tapped: the second tap opens nothing behind it`, async ({ page }) => {
    await open(page)
    const day = await dayUnder(page, T(closer))
    expect(day, 'a day stands under the button').toMatch(OPENS)
    const r = await doubleTap(page, T(closer))
    expect(r.under, 'the window had gone: the second tap landed on the grid').toMatch(OPENS)
    expect(r.opened, `the second tap on ${r.under}`).toEqual([])
  })
}

test('the event window\'s Save and its Delete, double-tapped: nothing opens behind either', async ({ page }) => {
  const cell = (await emptyEventCell(page))!
  await page.locator(T(cell)).click()
  await page.locator(T('event-text')).fill('Range day')
  await page.locator(T('event-text')).blur()
  expect(await dayUnder(page, T('event-apply')), 'a day under Save').toMatch(/^cell-/)
  const saved = await doubleTap(page, T('event-apply'))
  expect(saved.under).toMatch(/^cell-/)
  expect(saved.opened, 'after Save').toEqual([])
  await expect(page.locator(T(cell))).not.toHaveText('')
  /* the saved event, opened again through its box's Edit, and deleted */
  await page.locator(T(cell)).scrollIntoViewIfNeeded()
  await page.locator(T(cell)).click()
  await page.locator(T('event-peek-edit')).click()
  await expect(page.locator(T('event-sheet'))).toBeVisible()
  expect(await dayUnder(page, T('event-delete')), 'a day under Delete').toMatch(/^cell-/)
  const gone = await doubleTap(page, T('event-delete'))
  expect(gone.under).toMatch(/^cell-/)
  expect(gone.opened, 'after Delete').toEqual([])
})

/* THE WINDOWS THAT FILL A PHONE'S SCREEN: the Events list (a full page from the top — D1511) and the OIL tracker (the whole
   screen). Their ✕ stands over the app's top bar, not the grid — measured 11 Nov 26: the second tap meets the top bar's bell
   (`notifyBell`) and opens its list. That is not the grid's and not this guard's (it never eats a press on the top bar);
   what a double tap there should do is the owner's, put to him. Held here: nothing of the grid's opens. These two were
   green before the guard was widened — the fall-through onto the grid could not be made on a phone. */
test('the Events list\'s ✕, double-tapped: nothing of the grid\'s opens', async ({ page }) => {
  await page.locator(T('settings-open')).click()
  await page.locator(T('settings-events')).click()
  await expect(page.locator(T('events-sheet'))).toBeVisible()
  const ev = await doubleTap(page, T('events-close'))
  expect(ev.under, 'no part of the grid stands under this ✕').toBeNull()
  expect(ev.opened, `after the Events list's ✕ (the second tap met ${ev.top})`).toEqual([])
})

test('the OIL tracker\'s ✕, double-tapped: nothing of the grid\'s opens', async ({ page }) => {
  await page.locator(T('oil-tracker')).click()
  await expect(page.locator(T('oil-sheet'))).toBeVisible()
  const oil = await doubleTap(page, T('oil-close'))
  expect(oil.under, 'no part of the grid stands under this ✕').toBeNull()
  expect(oil.opened, `after the OIL tracker's ✕ (the second tap met ${oil.top})`).toEqual([])
})

/* green before the guard was widened too: Edit opens the event window, whose own shield keeps a finger off the grid
   (Sheet.tsx useGridPan) — held so it stays so */
test('the event box\'s Edit, double-tapped: the event window opens and nothing behind it does', async ({ page }) => {
  const cell = (await emptyEventCell(page))!
  await page.locator(T(cell)).click()
  await page.locator(T('event-text')).fill('Range day')
  await page.locator(T('event-apply')).click()
  await expect(page.locator(T('event-sheet'))).toHaveCount(0)
  await page.waitForTimeout(700)
  await page.locator(T(cell)).click()
  await expect(page.locator(T('event-peek'))).toBeVisible()
  const r = await doubleTap(page, T('event-peek-edit'))
  expect(r.opened.filter(w => w !== 'event-sheet'), `the second tap on ${r.under}`).toEqual([])
})

/* WHAT STILL GOES THROUGH, as for the one-day window (the code read's F3, D262's reading): a quick tap on another day, away
   from the button, is a press he meant; and the same place opens once the moment has passed. */
test('after a window\'s ✕ a quick tap on another day opens it, and the place of the ✕ opens after the moment', async ({ page }) => {
  await elevenCounters(page)
  await page.locator(T('manning-info-sets')).first().click()
  await expect(page.locator(T('manning-sheet'))).toBeVisible()
  expect(await dayUnder(page, T('manning-info-close'))).toMatch(/^cell-/)
  const x = await centre(page, T('manning-info-close'))
  /* another day, well away from the ✕ */
  const far = { x: x.x - 150, y: x.y }
  expect(await behind(page, far.x, far.y), 'a day stands there too').toMatch(/^cell-/)
  await page.touchscreen.tap(x.x, x.y)
  await page.waitForTimeout(80)
  await page.touchscreen.tap(far.x, far.y)
  await expect(page.locator(T('bid-picker')), 'a quick tap elsewhere is his').toBeVisible()
  await page.locator(T('bid-cancel')).click()
  await expect(page.locator(T('bid-picker'))).toHaveCount(0)
  await page.waitForTimeout(700)
  await page.touchscreen.tap(x.x, x.y)
  await expect(page.locator(T('bid-picker')), 'the same place, after the moment').toBeVisible()
})
