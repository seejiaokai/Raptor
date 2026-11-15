/* A FINGER'S DOUBLE TAP ON SIX MORE WINDOWS' CLOSING BUTTONS REACHES NOTHING ON THE GRID BEHIND THEM
   ([LW-DOUBLETAP-MORE-WINDOWS] — the two reads of the night of 11 Nov 26: the Opus read's F1, Astra's §1). The guard of
   `doubletap-leavewar.spec.ts` saw a window go only when its open state lived in the grid's own file; these keep theirs
   elsewhere, or were no window at all to it: the Required rows' selection panel, rename form and number pad, the day
   panel, the under-manned days list, the move banners, New period and Open for bidding. Each now arms the same guard
   through one door (`src/leavewar/ui/gridguard.ts`; the unit tests: `doubletap-more.test.tsx`). What only a browser can
   see: a real touch — its press, then the click the browser makes of it — landing a moment after the window has gone, on
   the day that stood under the button.

   The gesture is the built guard's browser test's own: a tap, a short gap, a second tap at the same point. The gap is the
   gesture itself, not a wait for the page — the guard's moment is 600 ms from the close, so the second tap goes at once
   (D87 does not apply to it); the pause after it is the time a window would have needed to open.

   The phone project only (an iPhone by touch), as the built guard's; Open for bidding is also driven at a tablet's width
   by touch, the one place its window leaves the grid under its ✕. */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { elevenCounters, lwRole, openLeaveWar, openManning, raptorRole } from './app'

const T = (id: string) => `[data-testid="${id}"]`
const isPhone = () => test.info().project.name === 'lw-phone'
/* every window a tap on the grid can open (the built test's list), and the windows of this file */
const WINDOWS = ['bid-picker', 'select-sheet', 'daylist-sheet', 'remarks-sheet', 'closed-note', 'raptor-sheet', 'award-sheet', 'postout-sheet', 'postin-sheet',
  'person-window', 'win-lwday', 'event-sheet', 'event-peek', 'manning-sheet', 'counter-form', 'settings-sheet', 'events-sheet', 'oil-sheet',
  'req-panel', 'req-name-form', 'fly-pad', 'undermanned-list', 'war-sheet', 'open-dates', 'move-banner', 'event-move-banner', 'win-days']
const openNow = (page: Page) => page.evaluate(ids => ids.filter(t => {
  const e = document.querySelector(`[data-testid="${t}"]`)
  return !!e && e.getBoundingClientRect().height > 0
}).concat(document.querySelector('.qualpop') ? ['qualpop'] : []), WINDOWS)

/** what the GRID holds at a point, read through whatever window lies over it: a day's cell, a name, or null */
const behind = (page: Page, x: number, y: number) => page.evaluate(({ x, y }) => {
  const el = document.elementsFromPoint(x, y).find(e => e.closest('.mx') && !e.closest('.bidsheet, .evpeek, .floatwin, .flypad, .flyedit, .umlist, .mv-banner, .appr-slim'))
  return el ? (el.closest('[data-testid]')?.getAttribute('data-testid') ?? String(el.className)) : null
}, { x, y })
/* a point in the button — its middle, or `fx` of the way across (a button over the frozen names, whose category chip at
   the puck's right end opens nothing when empty) */
const centre = async (page: Page, sel: string, fx = 0.5) => {
  const b = (await page.locator(sel).first().boundingBox())!
  return { x: b.x + b.width * fx, y: b.y + b.height / 2 }
}
/* what a tap opens on the grid: a day's cell (that day's window, for an admin), a Required cell (its number pad), a date
   heading or the pinned dates row (the day panel) or a man's name (his person window) */
const OPENS = /^(cell-|req-[pw]-|head-|sticky-head|person-)/

/** The page moved under the window until a DAY stands under the button: a tap there opens something, so a second tap
 *  that gets through is seen. */
async function dayUnder(page: Page, sel: string, fx = 0.5) {
  let seen = ''
  for (let i = 0; i < 40; i++) {
    const p = await centre(page, sel, fx)
    const b = await behind(page, p.x, p.y)
    if (b && OPENS.test(b)) return b
    seen = `${b} at ${Math.round(p.x)},${Math.round(p.y)}, the page at ${await page.evaluate(() => Math.round(window.scrollY))}`
    await page.evaluate(() => window.scrollBy(0, 19))
    await page.waitForTimeout(40)
  }
  return `no day: ${seen}`
}

/** the double tap: the first tap closes the window, the second lands where the button stood */
async function doubleTap(page: Page, sel: string, fx = 0.5) {
  const p = await centre(page, sel, fx)
  await page.touchscreen.tap(p.x, p.y)
  await page.waitForTimeout(80)
  const under = await behind(page, p.x, p.y)
  /* what the second tap meets, whatever it is: the grid, or still the window (a close that came late) */
  const onGrid = await page.evaluate(({ x, y }) => !!document.elementFromPoint(x, y)?.closest('.mx'), p)
  await page.touchscreen.tap(p.x, p.y)
  await page.waitForTimeout(700)
  return { under, onGrid, opened: await openNow(page), at: p }
}
/** the double tap whose second tap must land on a day, and open nothing */
async function guarded(page: Page, sel: string, what: string, fx = 0.5) {
  expect(await dayUnder(page, sel, fx), `${what}: a day stands under the button`).toMatch(OPENS)
  const r = await doubleTap(page, sel, fx)
  expect(r.under, `${what}: a day under the button`).toMatch(OPENS)
  expect(r.onGrid, `${what}: the window had gone — the second tap landed on the grid`).toBe(true)
  expect(r.opened, `${what}: the second tap on ${r.under}`).toEqual([])
  /* THE PROOF THE PLACE IS LIVE, and the guard's moment over: the same place tapped again opens what it holds (a day whose
     tap opens nothing would hold the line above whatever the guard did) */
  await page.touchscreen.tap(r.at.x, r.at.y)
  await expect.poll(() => openNow(page), { message: `${what}: a tap on ${r.under} after the moment opens it` }).not.toEqual([])
}

/* a held finger's drag over the Required rows (the CDP touch path — Playwright's touchscreen taps but cannot drag): the
   leavewar spec's own pick */
async function pickBlock(page: Page, a: Locator, b: Locator) {
  const mid = async (l: Locator) => { const r = (await l.boundingBox())!; return { x: r.x + r.width / 2, y: r.y + r.height / 2 } }
  const p = await mid(a), q = await mid(b)
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [p] })
  await page.waitForTimeout(260)                             // past HOLD (180ms) → armed
  for (let i = 1; i <= 6; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p.x + ((q.x - p.x) * i) / 6, y: p.y + ((q.y - p.y) * i) / 6 }] })
    await page.waitForTimeout(20)
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await cdp.detach()
}

test.beforeEach(async ({ page }) => {
  test.skip(!isPhone(), 'a finger\'s double tap: the phone project; a mouse\'s double click is held by doubletap-more.test.tsx')
  await openLeaveWar(page)
  await lwRole(page, 'admin')
  await raptorRole(page, 'admin')
})

/* ---- the Required rows' windows ---- */
test.describe('the Required rows', () => {
  test.beforeEach(async ({ page }) => { await openManning(page) })
  const cell = (page: Page, r: string, d: string) => page.locator(T(`${r}-${d}`))
  const panelUp = async (page: Page) => {
    await pickBlock(page, cell(page, 'req-p', '2026-01-05'), cell(page, 'req-w', '2026-01-06'))
    await expect(page.locator(T('req-panel'))).toBeVisible()
  }

  test('the selection panel\'s ✕, double-tapped: the second tap opens nothing behind it', async ({ page }) => {
    await panelUp(page)
    await guarded(page, T('req-panel-x'), 'the panel\'s ✕')
  })

  test('the selection panel\'s Apply, double-tapped: nothing opens behind it', async ({ page }) => {
    await panelUp(page)
    await page.locator(T('req-panel-num')).fill('14')
    await page.locator(T('req-panel-num')).blur()
    await guarded(page, T('req-panel-apply'), 'the panel\'s Apply')
  })

  test('the selection panel\'s Clear, double-tapped: nothing opens behind it', async ({ page }) => {
    await page.evaluate(() => { (window as any).setFlyDays([{ iso: '2026-01-05', p: 12, w: 8 }]) })
    await panelUp(page)
    /* measured: where the panel first stands, Clear's middle lies over a day of FREAK's whose tap opens nothing — the page
       moved on a little, so the day under it is one that opens */
    await page.evaluate(() => window.scrollBy(0, 60))
    await guarded(page, T('req-panel-clear'), 'the panel\'s Clear')
  })

  for (const [btn, what] of [['reqname-close', '✕'], ['reqname-save', 'Save'], ['reqname-cancel', 'Cancel']] as const) {
    test(`the rename form's ${what}, double-tapped: nothing opens behind it`, async ({ page }) => {
      await page.locator(T('fly-name-req-p')).tap()
      await expect(page.locator(T('req-name-form'))).toBeVisible()
      if (btn === 'reqname-save') { await page.locator(T('reqname-name')).fill('Pilots'); await page.locator(T('reqname-name')).blur() }
      await guarded(page, T(btn), `the rename form's ${what}`, btn === 'reqname-save' ? 0.2 : 0.5)
    })
  }

  test('the number pad\'s Done, double-tapped: nothing opens behind it', async ({ page }) => {
    await cell(page, 'req-p', '2026-01-08').tap()
    await expect(page.locator(T('fly-pad'))).toBeVisible()
    await page.locator(T('fly-pad-5')).tap()
    await guarded(page, T('fly-pad-done'), 'the pad\'s Done')
  })
})

/* ---- the day panel ---- */
test('the day panel\'s ✕, double-tapped: nothing opens behind it', async ({ page }) => {
  await page.locator(T('head-2026-01-12')).tap()
  await expect(page.locator(T('win-lwday'))).toBeVisible()
  await guarded(page, T('win-lwday-x'), 'the day panel\'s ✕')
})

test('the day panel\'s ›, double-tapped: it steps twice and stays up, nothing opening behind it', async ({ page }) => {
  await page.locator(T('head-2026-01-12')).tap()
  await expect(page.locator(T('lwday-body'))).toHaveAttribute('data-iso', '2026-01-12')
  const r = await doubleTap(page, T('lwday-next'))
  await expect(page.locator(T('lwday-body'))).toHaveAttribute('data-iso', '2026-01-14')
  expect(r.opened).toEqual(['win-lwday'])
})

/* ---- the under-manned days list ---- */
/* the red-day world of the leavewar spec's own under-manned tests (its `seedRedDays`): the eleven counters, and every SXO
   bidding on three days, so the SXO counter is red there */
const RED_DAYS = ['2026-01-05', '2026-01-15', '2026-02-10']
async function seedRedDays(page: Page) {
  await elevenCounters(page)
  await page.evaluate((red) => {
    const sxo = ['bane', 'stiff', 'slipway', 'nact', 'pump', 'snap', 'mamba', 'shaft', 'dice', 'razer', 'freak', 'glass']
    const days = []
    for (let t = Date.UTC(2026, 0, 1); t <= Date.UTC(2026, 11, 31); t += 86_400_000) {
      days.push({ date: new Date(t).toISOString().slice(0, 10), events: ['', ''], blocked: false, blockedReason: '', ph: false })
    }
    const recs: Record<string, Record<string, unknown[]>> = {}
    for (const id of sxo) {
      recs[id] = {}
      for (const d of red) recs[id][d] = [{ id: `rd-${id}-${d}`, kind: 'request', code: 'LL', state: 'pending' }]
    }
    const war = {
      period: { id: 'y2026', name: 'JAN - DEC 26', start: '2026-01-01', end: '2026-12-31', open: [{ from: '2026-01-01', to: '2026-12-31' }], lastClosed: null, days },
      recs,
    }
    ;(window as any).lwLoadWars([war], 'y2026')
  }, RED_DAYS)
}

test('an under-manned day tapped twice: the first takes the grid to it and closes the list, the second opens nothing', async ({ page }) => {
  await seedRedDays(page)
  /* the Manning rows folded again (elevenCounters opened them): a counter's figure, under the list's row once the grid
     is taken to the day, opens nothing, so a fall-through there would not be seen — a man's day does */
  await page.locator(T('counts-toggle')).tap()
  await expect(page.locator(T('counts-toggle'))).toHaveAttribute('aria-expanded', 'false')
  await page.locator(T('undermanned')).tap()
  await expect(page.locator(T('undermanned-list'))).toBeVisible()
  /* the list hangs from its chip: what lies under its row once the grid has been taken to the day is read after the
     first tap (doubleTap's `under`) */
  const r = await doubleTap(page, T('undermanned-day-2026-01-05'))
  expect(r.under, 'the list had gone: the second tap landed on the grid').toMatch(OPENS)
  expect(r.opened, `the second tap on ${r.under}`).toEqual([])
})

/* ---- the move banners ---- */
test.describe('the move banners', () => {
  const LEAVE = 'cell-bruise-2026-01-08'   // the seed's approved LL — the leavewar spec's own move
  const pickUp = async (page: Page) => {
    await page.locator(T(LEAVE)).tap()
    await page.locator(T('decide-shift')).tap()
    await expect(page.locator(T('move-banner'))).toBeVisible()
    /* past the move's own guard on the spot Move was pressed (D262, 400 ms) AND the closing window's (600 ms), so neither
       can stand in for the banner's own bit (Astra's read of 15 Nov 26) */
    await page.waitForTimeout(650)
  }

  test('the move banner\'s Cancel, double-tapped: nothing opens behind it', async ({ page }) => {
    await pickUp(page)
    await guarded(page, T('move-cancel'), 'the move banner\'s Cancel')
  })

  test('the move banner\'s Confirm, double-tapped: the entry lands and nothing opens behind it', async ({ page }) => {
    await pickUp(page)
    await page.locator(T('cell-bruise-2026-01-06')).tap()
    await expect(page.locator(T('move-confirm'))).toBeVisible()
    /* landed: the banner is among the windows that must be gone */
    await guarded(page, T('move-confirm'), 'the move banner\'s Confirm')
  })

  /* the seed's first event, picked up for a move from its peek's Edit */
  const pickEvent = async (page: Page) => {
    await page.locator(T('event-0-2026-01-01')).scrollIntoViewIfNeeded()
    await page.locator('td.ev.has').first().tap()
    await page.locator(T('event-peek-edit')).tap()
    await page.locator(T('event-move')).tap()
    await expect(page.locator(T('event-move-banner'))).toBeVisible()
    await page.waitForTimeout(650)          // past the event box's closing guard too (600 ms), as the record's banner
  }

  test('the event move banner\'s Cancel, double-tapped: nothing opens behind it', async ({ page }) => {
    await pickEvent(page)
    await guarded(page, T('event-move-cancel'), 'the event move banner\'s Cancel')
  })

  test('the event move banner\'s Confirm, double-tapped: the event lands and nothing opens behind it', async ({ page }) => {
    await pickEvent(page)
    /* a free Event cell on screen, staged */
    const free = await page.evaluate(() => {
      const names = document.querySelector('.mx th.who, .mx td.who')?.getBoundingClientRect().right ?? 120
      const c = [...document.querySelectorAll<HTMLElement>('td.ev.editable:not(.has):not(.band)')].find(e => {
        const r = e.getBoundingClientRect()
        return r.width > 0 && r.left > names + 8 && r.right < window.innerWidth - 8 && r.top > 80 && r.bottom < window.innerHeight - 120
      })
      return c?.getAttribute('data-testid') ?? null
    })
    expect(free, 'a free Event cell on screen').not.toBeNull()
    await page.locator(T(free!)).tap()
    await expect(page.locator(T('event-move-confirm'))).toBeVisible()
    await guarded(page, T('event-move-confirm'), 'the event move banner\'s Confirm')
  })
})

/* ---- New period ---- */
test.describe('New period', () => {
  const sheet = async (page: Page) => {
    await page.locator(T('war-picker')).selectOption({ label: '+ New period' })
    await expect(page.locator(T('war-sheet'))).toBeVisible()
  }

  test('its ✕, double-tapped: nothing opens behind it', async ({ page }) => {
    await sheet(page)
    await guarded(page, T('war-cancel'), 'New period\'s ✕')
  })

  test('its Create, double-tapped: the new period is made and nothing of its grid opens', async ({ page }) => {
    await sheet(page)
    await page.locator(T('war-name')).fill('JUL 28')
    await page.locator(T('war-name')).blur()
    for (let i = 0; i < 72; i++) {
      const at = await page.locator(T('war')).getAttribute('data-month')
      if (at === '2028-07') break
      await page.locator(T(at! < '2028-07' ? 'war-next' : 'war-prev')).tap()
    }
    await page.locator(T('war-day-2028-07-01')).tap()
    await page.locator(T('war-day-2028-07-31')).tap()
    await expect(page.locator(T('war-create'))).toBeEnabled()
    /* the grid under Create changes with the period it makes: the day there is read after the first tap */
    const r = await doubleTap(page, T('war-create'))
    await expect(page.locator(T('war-picker'))).toHaveValue(/./)
    expect(r.under, 'the sheet had gone: the second tap landed on the new grid').toMatch(OPENS)
    expect(r.opened, `the second tap on ${r.under}`).toEqual([])
  })
})

/* ---- Open for bidding ---- */
test('Open for bidding\'s ✕ on a tablet\'s width, by touch, double-tapped: nothing opens behind it', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await page.waitForTimeout(300)
  await page.locator(T('open-chip')).tap()
  await expect(page.locator(T('open-dates'))).toBeVisible()
  await guarded(page, T('open-dates-close'), 'Open for bidding\'s ✕')
})

/* a phone's fills the screen: its ✕ stands over the app's top bar, never the grid — held so it stays so */
test('Open for bidding\'s ✕ on a phone, double-tapped: nothing of the grid\'s opens', async ({ page }) => {
  await page.locator(T('open-chip')).tap()
  await expect(page.locator(T('open-dates'))).toBeVisible()
  const r = await doubleTap(page, T('open-dates-close'))
  expect(r.under, 'no part of the grid stands under this ✕').toBeNull()
  expect(r.opened).toEqual([])
})

/* WHAT STILL GOES THROUGH: a quick tap on another day, away from the button, is a press he meant; and the same place opens
   once the moment has passed */
test('after the day panel\'s ✕ a quick tap on another day opens it, and the place of the ✕ opens after the moment', async ({ page }) => {
  await page.locator(T('head-2026-01-12')).tap()
  await expect(page.locator(T('win-lwday'))).toBeVisible()
  expect(await dayUnder(page, T('win-lwday-x'))).toMatch(OPENS)
  const x = await centre(page, T('win-lwday-x'))
  const far = { x: x.x - 150, y: x.y }
  expect(await behind(page, far.x, far.y), 'a day stands there too').toMatch(OPENS)
  await page.touchscreen.tap(x.x, x.y)
  await page.waitForTimeout(80)
  await page.touchscreen.tap(far.x, far.y)
  await expect.poll(() => openNow(page), { message: 'a quick tap elsewhere is his' }).not.toEqual([])
  /* …and the place of the ✕ itself, once the moment has passed */
  await page.keyboard.press('Escape')
  await expect.poll(() => openNow(page)).toEqual([])
  await page.waitForTimeout(700)
  expect(await behind(page, x.x, x.y)).toMatch(OPENS)
  await page.touchscreen.tap(x.x, x.y)
  await expect.poll(() => openNow(page), { message: 'the same place, after the moment' }).not.toEqual([])
})

/* ---- THE TWO BLIND READS OF 15 NOV 26 ---- */
/* Astra's F1: on a touch tablet with a keyboard, a digit of the pad pressed by a finger, then Escape — the pad's own Escape
   stopped the key before the grid could forget the finger's press, so the pad's going armed the guard at the digit and a
   deliberate tap on the day that stood under it was eaten */
test('at a tablet\'s size, Escape from the number pad after a finger pressed a digit: the day under the digit opens at once', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await openManning(page)
  await page.locator(T('req-p-2026-01-08')).tap()
  await expect(page.locator(T('fly-pad'))).toBeVisible()
  let key = ''
  for (const k of ['5', '2', '8', '6', '4', '1', '3', '9', '7']) {
    const b = await dayUnder(page, T(`fly-pad-${k}`))
    if (OPENS.test(b) && !b.startsWith('req-')) { key = k; break }
  }
  expect(key, 'a digit with a day under it').not.toBe('')
  const p = await centre(page, T(`fly-pad-${key}`))
  const under = await behind(page, p.x, p.y)
  await page.touchscreen.tap(p.x, p.y)
  await page.keyboard.press('Escape')
  await expect(page.locator(T('fly-pad'))).toHaveCount(0)
  await page.touchscreen.tap(p.x, p.y)
  await expect.poll(() => openNow(page), { message: `the tap on ${under} after the pad was closed by Escape opens it` }).not.toEqual([])
})

/* the Opus read's F1 (older, the same kind): the slim "Back to Approvals" bar at the screen's foot, over the grid */
test('the slim "Back to Approvals" bar\'s ✕, double-tapped: nothing opens behind it', async ({ page }) => {
  await page.locator(T('lw-tab-approvals')).tap()
  await expect(page.locator(T('approvals-page'))).toBeVisible()
  await page.locator(`${T('approvals-page')} ${T('appr-dates')}`).first().tap()
  await expect(page.locator(T('appr-slim'))).toBeVisible()
  await page.waitForTimeout(650)          // past the Approvals page's own going, so only the bar's bit is tested
  await guarded(page, T('appr-slim-x'), 'the slim bar\'s ✕')
})

/* the fix brief's item 3, measured: with the page scrolled, the Calendar window's ✕ (⚙ → Calendar…) stands over the pinned
   dates, and the second tap opened that day's panel */
test('the Calendar window\'s ✕ (⚙ → Calendar…), double-tapped with the page scrolled: nothing opens behind it', async ({ page }) => {
  await page.locator(T('settings-open')).first().tap()
  await expect(page.locator(T('settings-sheet'))).toBeVisible()
  await page.locator(T('settings-days')).tap()
  await expect(page.locator(T('win-days'))).toBeVisible()
  await page.waitForTimeout(650)          // past the Settings window's own going
  await guarded(page, T('win-days-x'), 'the Calendar window\'s ✕')
})
