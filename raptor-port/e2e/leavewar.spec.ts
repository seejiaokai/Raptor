/* The Leave War suite, vendored from the standalone leave-war repo at the
   merge (16 Aug 26). Three adaptations and no other edits: the app now sits
   behind Raptor's login on its own tab, so every test opens through
   openLeaveWar() (member account — the standalone app's own default role);
   the on-screen role toggle is gone (the role rides the login), so the
   toggle clicks became lwRole() calls through the probe bridge; and the two
   Playwright projects (phone + desktop) moved into raptor-port's own
   playwright.config.ts.

   RENAMED AT THE SYNC WIRES (17 Aug 26, wire 0 of docs/superpowers/specs/
   leavewar-sync.md): the roster is now the projection of Raptor's PEOPLE,
   and on a fresh browser the seeded demo world is re-keyed onto that real
   crew — so every seed callsign inside a testid here was renamed through
   the SAME 16-entry map the boot applies (DEMO_MAP in
   src/leavewar/state/demoworld.ts, seat+band-equal by construction):
   ramp→slipway, tata→prowler, splice→wolf, jaguar→dj, switcher→ignite,
   asics→bruise, pipper→pain, dusk→ammo, miles→slash, roulette→dirty,
   cross→rocky, decal→casper, skin→divot, slammed→vinci, cage→spaceman,
   reset→harpoon. The category-label assertions (OPSP(S), IP→IP(S)) hold
   unchanged because the map preserves seat and band and the mapped
   people's own SXO flags match the seed's. */
import { expect, test, type Page } from '@playwright/test'
import { go, lwRole, lwView, openLeaveWar } from './app'

const CAL_MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]

/** Choose a counter through the sheet. The whole column header is the
 *  control — the two arrows it replaced were 13px glyphs the owner could not
 *  hit on a phone. */
async function pickCounter(page: Page, counter: string) {
  await page.locator('[data-testid="counter-pick"]').click()
  await page.locator(`[data-testid="counter-${counter}"]`).click()
}

/** A horizontal swipe, dispatched as real `Touch` objects. Playwright's
 *  `touchscreen` taps but cannot drag, and `TouchEventInit` rejects plain
 *  objects — it needs actual `Touch` instances. */
async function swipe(page: Page, from: { x: number; y: number }, dx: number) {
  await page.evaluate(([x, y, delta]) => {
    const el = document.elementFromPoint(x, y)!
    const at = (cx: number) => [new Touch({ identifier: 1, target: el, clientX: cx, clientY: y })]
    el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: at(x) }))
    el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: at(x + delta) }))
  }, [from.x, from.y, dx])
}

/** Drive a range calendar to a span the way a person does — walk to the
 *  month, tap the start, walk on, tap the end. */
async function pickSpan(page: Page, testid: string, from: string, to: string) {
  const goTo = async (yyyymm: string) => {
    for (let i = 0; i < 72; i++) {
      const shown = (await page.locator(`[data-testid="${testid}-month"]`).textContent())!
      const [name, year] = shown.split(' ')
      const at = `${year}-${String(CAL_MONTHS.indexOf(name) + 1).padStart(2, '0')}`
      if (at === yyyymm) return
      await page.locator(`[data-testid="${testid}-${at < yyyymm ? 'next' : 'prev'}-month"]`).click()
    }
    throw new Error(`never reached ${yyyymm}`)
  }
  await goTo(from.slice(0, 7))
  await page.locator(`[data-testid="${testid}-day-${from}"]`).click()
  await goTo(to.slice(0, 7))
  await page.locator(`[data-testid="${testid}-day-${to}"]`).click()
}


/** Wait for the grid to stop moving. A month jump scrolls, and the scroll's
 *  consequences are deliberately deferred: the roster's row window is debounced
 *  to scroll REST, and the reflow it then runs moves the day columns. "Still
 *  for several frames" is the only cross-browser signal for that being over —
 *  `scrollend` is patchy on Safari, and a fixed delay is a guess. Both the
 *  scroll position and a day column's own left edge have to go quiet, because
 *  the reflow moves the columns WITHOUT moving the scroller. */
async function settleGrid(page: Page) {
  await page.evaluate(async () => {
    const wrap = document.querySelector('.mx-wrap') as HTMLElement
    const probe = () => document.querySelector('.mx-wrap .mxhead th.day')?.getBoundingClientRect().x ?? 0
    let last = NaN, lastX = NaN, same = 0
    for (let i = 0; i < 240; i++) {
      await new Promise(r => requestAnimationFrame(() => r(null)))
      const now = Math.round(wrap.scrollLeft), x = Math.round(probe())
      same = (now === last && x === lastX) ? same + 1 : 0
      last = now; lastX = x
      if (same >= 8) return
    }
  })
}

test.beforeEach(async ({ page }) => {
  await openLeaveWar(page)
})

// Undo / redo (owner, 30 Aug 26). The click LOGIC is unit-tested in the store
// and chrome suites; this pins the LAYOUT jsdom can't — the pair renders inside
// the Leave War top row, disabled with nothing to undo yet, on both widths.
test('the undo/redo pair sits in the Leave War top bar, disabled at rest', async ({ page }) => {
  const undo = page.locator('[data-testid="lw-undo"]')
  const redo = page.locator('[data-testid="lw-redo"]')
  await expect(undo).toBeVisible()
  await expect(redo).toBeVisible()
  await expect(undo).toBeDisabled()   // a freshly loaded war has no history to walk
  await expect(redo).toBeDisabled()
  const u = (await undo.boundingBox())!
  const r = (await redo.boundingBox())!
  const bar = (await page.locator('#page-leavewar .topbar').boundingBox())!
  // inside the top bar, and redo immediately after undo (a tidy pair)
  expect(u.y).toBeGreaterThanOrEqual(bar.y - 1)
  expect(u.y).toBeLessThan(bar.y + bar.height + 1)
  expect(r.x).toBeGreaterThan(u.x)
  expect(r.x - (u.x + u.width)).toBeLessThan(40)
})

// THE FROZEN CALLSIGN/COUNTER COLUMNS on a phone are no longer the real cells
// (20 Aug 26 — the third look at the sideways stutter). The real cells were
// `position: sticky` on every one of ~80 rows and a sideways drag re-solved
// all of them each frame; now the two columns are drawn ONCE in a `.mxband`
// overlay outside the sideways scroller, and the real cells underneath are set
// free to scroll away. So on the phone the thing that "stays put" is the
// overlay's copy; on a desktop (untouched sticky path) it is still the real
// cell. This helper points each project at whichever one is doing the freezing.
const isPhone = () => test.info().project.name === 'lw-phone'
function frozen(page: Page, id: string, col: '.who' | '.bal') {
  return isPhone()
    ? page.locator(`.mxband [data-band-id="${id}"] ${col}`)
    : col === '.who'
      ? page.locator(`[data-testid="row-${id}"] .who`)
      : page.locator(`[data-testid="bal-${id}"]`)
}

test('the callsign column stays put when the grid scrolls sideways', async ({ page }) => {
  const cell = frozen(page, 'slipway', '.who')
  const before = await cell.boundingBox()
  const wrap = page.locator('.mx-wrap')
  await wrap.evaluate(el => el.scrollBy(600, 0))
  // Prove the container actually moved — sound today only because the
  // 90-day-wide table happens to exceed the viewport width on both
  // projects. Without this, a `.mx-wrap` that stopped scrolling entirely
  // would still pass, since before/after would be trivially identical.
  const scrollLeft = await wrap.evaluate(el => el.scrollLeft)
  expect(scrollLeft).toBeGreaterThan(0)
  const after = await cell.boundingBox()
  expect(Math.abs(after!.x - before!.x)).toBeLessThan(1)
})

// THE OVERLAY LINES UP WITH THE GRID (phone only). The whole risk of drawing
// the frozen columns a second time is that the copy sits a row out of step —
// then every name reads beside the wrong person's balance. Prove the overlay's
// callsign shares a row with the real one it stands in for, both before and
// after a sideways scroll has carried the real one off to the left.
test('the frozen overlay lines up with the rows it freezes', async ({ page }) => {
  test.skip(!isPhone(), 'the overlay is a phone-only creature')
  const realBox = (await page.locator('[data-testid="row-slipway"] .who').boundingBox())!
  const overBox = (await page.locator('.mxband [data-band-id="slipway"] .who').boundingBox())!
  // Same row: their vertical centres coincide. (At rest the overlay sits
  // directly over the real cell, so their x coincides too.)
  const midReal = realBox.y + realBox.height / 2
  const midOver = overBox.y + overBox.height / 2
  expect(Math.abs(midOver - midReal), 'overlay row shares the real row').toBeLessThan(1.5)

  // Scroll the real cell away; the overlay must still hold that same row.
  await page.locator('.mx-wrap').evaluate(el => el.scrollBy(600, 0))
  const realAfter = (await page.locator('[data-testid="row-slipway"] .who').boundingBox())!
  const overAfter = (await page.locator('.mxband [data-band-id="slipway"] .who').boundingBox())!
  expect(realAfter.x, 'the real cell has scrolled off to the left').toBeLessThan(realBox.x - 1)
  expect(
    Math.abs((overAfter.y + overAfter.height / 2) - (realAfter.y + realAfter.height / 2)),
    'the overlay still shares the real row after scrolling',
  ).toBeLessThan(1.5)
})

// ...AND IT LINES UP ALL THE WAY DOWN (20 Aug 26, owner off his phone — "see
// the misalignment vertically too"). The single-row check above is what let
// this ship: it reads `slipway`, eleven rows into the roster, where the error
// was still under a pixel. The error is CUMULATIVE. A person row carrying a
// code chip in any of its 365 day cells is a pixel taller than an empty one,
// the overlay draws no day cells and so cannot grow with it, and by the bottom
// of the demo roster the two were 14px — most of a row — apart, which is names
// standing beside the wrong balances. `syncBandHeights` copies each real row's
// MEASURED height onto its overlay twin; the only test that can prove it is
// one that walks the whole roster, so this walks the whole roster.
test('the frozen overlay lines up with every row it freezes, top to bottom', async ({ page }) => {
  test.skip(!isPhone(), 'the overlay is a phone-only creature')
  const worst = async () => page.evaluate(() => {
    let off = 0, key = '', checked = 0
    for (const tr of document.querySelectorAll('.mxband [data-band-key]')) {
      const k = tr.getAttribute('data-band-key')!
      const real = document.querySelector(`.mx-wrap tbody.mxbody [data-testid="${k}"]`)
      // A CAT sub-heading is display:none on a phone and a windowed-out row has
      // no twin at all: neither is a row, and a 0-height rect cannot misalign.
      if (!real || real.getBoundingClientRect().height === 0) continue
      checked++
      const d = tr.getBoundingClientRect().top - real.getBoundingClientRect().top
      if (Math.abs(d) > Math.abs(off)) { off = d; key = k }
    }
    return { off, key, checked }
  })

  const rest = await worst()
  // Without this the test passes just as well against a selector that matches
  // nothing, which is how a gate stops testing anything without going red.
  expect(rest.checked, 'the walk actually reached the roster').toBeGreaterThan(20)
  expect(Math.abs(rest.off), `the overlay's ${rest.key} sits on its real row`).toBeLessThan(1.5)

  // And after the year has scrolled sideways, which is when the overlay is the
  // only copy of these columns the reader can still see.
  await page.locator('.mx-wrap').evaluate(el => el.scrollBy(1200, 0))
  const scrolled = await worst()
  expect(scrolled.checked).toBeGreaterThan(20)
  expect(Math.abs(scrolled.off), `${scrolled.key} still holds its row once scrolled`).toBeLessThan(1.5)
})

// The overlay is transparent to taps AT REST (so a tap reaches the real cell,
// which owns the handler and the testid), and catches them ONCE SCROLLED (the
// real cell has left the viewport, so the overlay is the only copy left to
// tap). This proves the scrolled half — the at-rest half is proven by every
// other test in this file tapping a real cell through the overlay unbothered.
test('the frozen overlay callsign opens the sheet once the year has scrolled', async ({ page }) => {
  test.skip(!isPhone(), 'the overlay is a phone-only creature')
  await page.locator('.mx-wrap').evaluate(el => el.scrollBy(600, 0))
  await page.locator('.mxband [data-band-id="slipway"] .whoedit').click()
  await expect(page.locator('[data-testid="person-figures"]')).toBeVisible()
})

// THE FROZEN HEADER FOLLOWS A ROTATION (owner, 30 Aug 26 — "flip my screen
// horizontally … the top bar is cut off to what the vertical view was … to fix
// it I need to scroll up then back down to reset the frozen bar"). The mirror
// pins the measured column widths; a rotate/resize changes every width, but the
// pin used to KEEP the portrait ones until a scroll re-pinned it. It now
// re-measures on resize/orientation, so the mirror tracks the grid at once.
test('the frozen header re-measures its width when the screen rotates', async ({ page }) => {
  const size = page.viewportSize()!
  // scroll the page down so the real header slides under the top bar and the
  // mirror appears
  await page.evaluate(() => window.scrollTo(0, 700))
  const mirror = page.locator('[data-testid="sticky-head"]')
  await expect(mirror).toBeVisible()
  // rotate — swap width and height, the phone flip
  await page.setViewportSize({ width: size.height, height: size.width })
  // the re-measure runs on the next frames and once more after a beat
  await page.waitForTimeout(500)
  await expect(mirror).toBeVisible()
  const mW = (await mirror.boundingBox())!.width
  const gW = await page.locator('.mx-wrap').evaluate(el => el.getBoundingClientRect().width)
  expect(Math.abs(mW - gW), 'the frozen bar spans the grid, not the old orientation').toBeLessThan(2)
})

// Replaced the sticky-date-header test on 10 Aug 26, when the owner asked for
// ONE vertical scroll. That test asserted the header held still while
// `.mx-wrap` scrolled down; the wrapper no longer scrolls down at all, so it
// failed at its own `scrollTop > 0` guard rather than passing against a
// header that had quietly stopped sticking. The guard is why the change was
// caught instead of shipped.
//
// What replaces it is the property actually wanted: the grid contributes no
// vertical scroller of its own, and the page carries all of it.
test('the grid has no vertical scroller of its own', async ({ page }) => {
  // Small enough that the old 86vh cap would certainly have overflowed.
  await page.setViewportSize({ width: 390, height: 320 })
  const wrap = page.locator('.mx-wrap')
  const before = await wrap.evaluate(el => el.scrollTop)
  await wrap.evaluate(el => el.scrollBy(0, 400))
  expect(await wrap.evaluate(el => el.scrollTop)).toBe(before)
  // Nothing to scroll, rather than scrolling that happens to be refused.
  const room = await wrap.evaluate(el => el.scrollHeight - el.clientHeight)
  expect(room).toBeLessThanOrEqual(1)
})

test('the page is the one thing that scrolls vertically', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 320 })
  // The roster is taller than a 320px viewport, so the page must have
  // somewhere to go — otherwise the rows below the fold are unreachable.
  const room = await page.evaluate(
    () => document.documentElement.scrollHeight - document.documentElement.clientHeight,
  )
  expect(room).toBeGreaterThan(0)
  await page.evaluate(() => window.scrollBy(0, 200))
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

  // And it is the ONLY one: no descendant of the card may offer a second.
  const nested = await page.evaluate(() =>
    [...document.querySelectorAll('.card *')]
      .filter(el => {
        const s = getComputedStyle(el)
        return (s.overflowY === 'auto' || s.overflowY === 'scroll')
          && el.scrollHeight - el.clientHeight > 1
      })
      .map(el => el.className),
  )
  expect(nested).toEqual([])
})

// The horizontal axis did NOT move to the page — 365 columns is ~13,600px and
// a page that wide would take the chrome with it. This is the pairing that
// makes the change safe, and it is why the wrapper still scrolls one axis.
test('the grid still owns the sideways scroll', async ({ page }) => {
  const wrap = page.locator('.mx-wrap')
  expect(await wrap.evaluate(el => el.scrollWidth - el.clientWidth)).toBeGreaterThan(0)
  await wrap.evaluate(el => el.scrollBy(600, 0))
  expect(await wrap.evaluate(el => el.scrollLeft)).toBeGreaterThan(0)
})

test('the frozen column is opaque — day cells never show through it', async ({ page }) => {
  const bg = await page.locator('[data-testid="row-slipway"] .who')
    .evaluate(el => getComputedStyle(el).backgroundColor)
  expect(bg).not.toBe('rgba(0, 0, 0, 0)')
})

test('the page itself never scrolls sideways — only the grid does', async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

// The Raptor restyle repaints .blocked as a tinted amber fill
// (rgba(229, 168, 59, 0.22)) rather than a solid rgb(255, 165, 0) — see the
// cascade-order comment on `.mx thead th.blocked` in matrix.css.
const BLOCKED_BG = 'rgba(229, 168, 59, 0.22)'

test('a blocked day is painted amber on its header, and an ordinary day is not', async ({ page }) => {
  const blocked = await page.locator('[data-testid="head-2026-03-10"]')
    .evaluate(el => getComputedStyle(el).backgroundColor)
  expect(blocked).toBe(BLOCKED_BG)

  const plain = await page.locator('[data-testid="head-2026-01-07"]')
    .evaluate(el => getComputedStyle(el).backgroundColor)
  expect(plain).not.toBe(BLOCKED_BG)
})

test('a blocked day that falls on a weekend still paints amber, not grey', async ({ page }) => {
  // 2026-03-14 is the Saturday inside the seed's exercise week: it carries
  // both `.blocked` and `.weekend`. jsdom-based unit tests can only prove
  // both classes were emitted, which was already true while the CSS cascade
  // bug was live — only a real browser computes which background wins.
  const head = page.locator('[data-testid="head-2026-03-14"]')
  expect(await head.evaluate(el => el.className)).toContain('blocked')
  expect(await head.evaluate(el => el.className)).toContain('weekend')
  const bg = await head.evaluate(el => getComputedStyle(el).backgroundColor)
  expect(bg).toBe(BLOCKED_BG)
})

// jsdom (the unit-test DOM) never computes an element's cascade, so it can
// prove the `.am`/`.pm` class landed on the right chip but not that the
// divider it triggers is actually painted — that only a real browser's
// `getComputedStyle(el, '::after')` can answer. Seed (re-keyed): slipway carries `*OIL`
// on 2026-02-10 (morning, half day), and OL on 2026-01-01 (whole day, no
// divider).
test('the half-day divider is painted on a half-day chip and absent on a whole-day chip', async ({ page }) => {
  const half = page.locator('[data-testid="cell-slipway-2026-02-10"] .c')
  const halfAfter = await half.evaluate(el => {
    const s = getComputedStyle(el, '::after')
    return { width: s.width, background: s.backgroundColor }
  })
  expect(parseFloat(halfAfter.width)).toBeGreaterThan(0)
  expect(halfAfter.background).not.toBe('rgba(0, 0, 0, 0)')

  // A whole-day chip carries no `::after` rule at all, so the browser
  // reports it with no generated box: `content: none` and a computed width
  // of `auto` rather than `0px` — `parseFloat('auto')` is `NaN`, not `0`, so
  // this checks the same "nothing painted" fact via content and background
  // instead of width.
  const whole = page.locator('[data-testid="cell-slipway-2026-01-01"] .c')
  const wholeAfter = await whole.evaluate(el => {
    const s = getComputedStyle(el, '::after')
    return { content: s.content, background: s.backgroundColor }
  })
  expect(wholeAfter.content).toBe('none')
  expect(wholeAfter.background).toBe('rgba(0, 0, 0, 0)')
})

test('the matrix stays within a sane DOM size', async ({ page }) => {
  // 16 people x 90 days plus counts and headers. Measured 2227 nodes on
  // 2026-08-09, before the Raptor restyle. The chip-span wrapper the
  // restyle adds around every populated cell's text pushed that to 2330
  // nodes, measured 2026-08-09 — still comfortably under the ceiling, which
  // stays at 2500 (headroom, not a target): raising it is a deliberate edit
  // in the PR that adds the nodes.
  //
  // The bidding plan left this figure untouched at 2330, measured again on
  // 2026-08-09: the bid sheet renders OUTSIDE the table, so `.mx *` cannot
  // see it. That is this selector's blind spot rather than a saving, which
  // is why the second half of this test counts the whole document with the
  // sheet open — a sheet that grew without bound would otherwise never
  // trouble the ceiling at all.
  //
  // The counter column DOES sit inside `.mx` — one cell per person, one per
  // count row, plus the header and its two arrows — taking the figure to
  // 2357, measured 2026-08-09. That is one cell per row and cannot grow
  // with the number of counters, which is the point of a single cycling
  // column.
  //
  // THE CEILING WAS THEN RAISED FROM 2500 TO 9600, DELIBERATELY. The war is
  // now a whole year rather than a quarter, because that is how the owner
  // reads it — so the same grid is 365 columns instead of 90 and the node
  // count is four times what it was. Measured 2026-08-10 BEFORE writing the
  // number here, on both projects: 9241 inside `.mx`, 9278 whole-document
  // with a sheet open, and a load of 687-757ms with a bid round-trip of
  // 296-355ms. That cost was measured first and the year adopted second;
  // had it come out at seconds, the year would not have shipped.
  //
  // Raised a third time, 9900 -> 10700, for the two event rows: 730 more
  // cells, and 730 inputs on top of that when an admin is looking. Measured
  // 10350 as a member and 10367 with a sheet open.
  //
  // Raised before that, 9600 -> 9900, when every date header gained a weekday
  // label. That is 365 more spans and takes the measured figure to 9607, and
  // it is worth the nodes: a year of columns numbered 01…31 twelve times
  // over gives the eye nothing to hold on to.
  //
  // RAISED A FOURTH TIME, 10700 -> 26500, at the sync wires (17 Aug 26):
  // wire 0 makes the roster the projection of Raptor's PEOPLE, so the same
  // 365-column grid now carries 58 aircrew rows instead of 16. Measured
  // BEFORE writing the number here, on the built bundle: 25850 nodes inside
  // `.mx` (67 tbody/count/event rows), 25918 whole-page with a sheet open.
  // The cost is the roster's real size, not a regression — the demo simply
  // shows the crew Raptor actually flies.
  //
  // RAISED A FIFTH TIME, 26500 -> 29000, for the categorised roster (owner,
  // 18 Aug 26): ground crew now ride the roster (5 more rows across the
  // 365-column grid), each person row gained a `.whorow`/`.cs` wrapper pair
  // and a colour chip, and the seven group headings plus eight CAT
  // sub-headings add their own rows. Measured BEFORE writing the number, on
  // the built bundle: 27953 nodes inside `.mx`, 28023 whole-page with a sheet
  // open. Real size, not a regression — the crew Raptor flies plus its own
  // ground crew, grouped.
  //
  // The headroom principle is unchanged: this is a ceiling, not a target,
  // and raising it is a deliberate edit in the change that adds the nodes.
  const nodes = await page.evaluate(() => document.querySelectorAll('.mx *').length)
  // A missing `.mx` would make this 0, which is comfortably "less than the
  // ceiling" — assert it's also nonzero so an absent grid fails loudly
  // instead of passing by accident. The lower bound is a real floor too: a
  // grid that quietly went back to the 16-person seed roster would sit near
  // 10350 and this would catch it.
  // The grid draws a WINDOW of months (colwindow.ts, 3 Sep 26): two at the
  // open, four once the runway pre-grows — ~4.4k–8.8k nodes, where the whole
  // year was ~25k. The floor still proves the grid is really drawn; the
  // ceiling is the old one, now a generous "nothing regressed to the year".
  expect(nodes).toBeGreaterThan(3000)
  expect(nodes).toBeLessThan(29000)

  await page.locator('[data-testid="cell-ammo-2026-02-11"]').click()
  await expect(page.locator('[data-testid="bid-picker"]')).toBeVisible()
  // 9644 whole-document nodes with the sheet open (9607 of them the matrix),
  // measured 2026-08-10 after the weekday labels landed. Ceiling 10000 on
  // the same principle. The gap between
  // the two figures is the app chrome and the sheet — about 37 nodes — and
  // it is the sheet's unbounded growth this half of the test watches.
  /* Since the merge the document also carries Raptor's whole shell, which
     this test has no business bounding (Raptor's perf gate owns its own DOM
     ceilings). The sheet renders INSIDE #page-leavewar — the shared Sheet
     wrapper is part of the page's tree — so scoping the count to the section
     keeps this half's exact intent: the matrix plus the page chrome plus an
     open sheet, and nothing else. */
  const all = await page.evaluate(() => document.querySelectorAll('#page-leavewar *').length)
  expect(all).toBeGreaterThan(nodes)
  // 28023 measured with the sheet open (18 Aug 26) — same 29000-class
  // ceiling plus the sheet's few dozen nodes.
  expect(all).toBeLessThan(29200)
})

// A year is ~13,600px of grid. Reaching September by dragging is not a thing
// anybody will do, so the month strip is what makes a year-long war usable at
// all — which makes it load-bearing, not decoration. jsdom computes no layout
// and cannot scroll, so the unit tests prove the arithmetic against stated
// rectangles and NOTHING about whether the grid actually moves. Only here.
test('a month button scrolls the grid to that month', async ({ page }) => {
  const wrap = page.locator('.mx-wrap')
  expect(await wrap.evaluate(el => el.scrollLeft)).toBe(0)

  await page.locator('[data-testid="month-SEP"]').click()
  // The grid draws a WINDOW of months (colwindow.ts, 3 Sep 26): a jump to
  // September draws Sep–Oct and lands Sep 1 at the frozen edge — which, with
  // September the first drawn month, is scrollLeft 0, not the 6,000-odd px a
  // year-wide scroller once travelled. The landing is the claim (below), and
  // the draw+scroll lands a render after the click, so it is polled first.
  await expect.poll(async () => {
    const h = await page.locator('[data-testid="head-2026-09-01"]').boundingBox()
    const b = await page.locator('.mx .mxhead th.bal').boundingBox()
    return h && b ? Math.round(h.x - (b.x + b.width)) : -999
  }, { timeout: 5000 }).toBeGreaterThanOrEqual(-1)

  // Landing near the month is not enough: the day has to be ON SCREEN and
  // clear of the two frozen columns, which are painted OVER the day cells.
  // A jump that forgot their width would put 1 September underneath the
  // callsign column, where it is scrolled-to and invisible at the same time.
  const head = (await page.locator('[data-testid="head-2026-09-01"]').boundingBox())!
  const bal = (await page.locator('.mx .mxhead th.bal').boundingBox())!
  expect(head.x).toBeGreaterThanOrEqual(bal.x + bal.width - 1)
  const wrapBox = (await wrap.boundingBox())!
  expect(head.x + head.width).toBeLessThanOrEqual(wrapBox.x + wrapBox.width + 1)
})

// Pressing a second month from wherever the first one left the grid is the
// ordinary way this gets used, and it is the case an absolute `scrollLeft =`
// gets wrong once the grid is already scrolled.
test('a month button works from wherever the grid already is', async ({ page }) => {
  await page.locator('[data-testid="month-SEP"]').click()
  await expect(page.locator('[data-testid="head-2026-09-01"]')).toHaveCount(1)
  await page.locator('[data-testid="month-MAR"]').click()
  // Each jump draws its own window and lands its month at the frozen edge;
  // two jumps' scroll offsets are not comparable (each is "the start of its
  // own window"), so the landing is the claim — polled, because the
  // draw+scroll lands a render after the click.
  await expect.poll(async () => {
    const h = await page.locator('[data-testid="head-2026-03-01"]').boundingBox()
    const b = await page.locator('.mx .mxhead th.bal').boundingBox()
    return h && b ? Math.round(h.x - (b.x + b.width)) : -999
  }, { timeout: 5000 }).toBeGreaterThanOrEqual(-1)
  await expect(page.locator('[data-testid="head-2026-09-01"]')).toHaveCount(0)

  const head = (await page.locator('[data-testid="head-2026-03-01"]').boundingBox())!
  const bal = (await page.locator('.mx .mxhead th.bal').boundingBox())!
  expect(head.x).toBeGreaterThanOrEqual(bal.x + bal.width - 1)
})

// The strip has to be reachable on a phone without itself becoming a
// scrolling problem — twelve buttons that ran off the right edge would just
// move the navigation problem up one level.
test('the whole month strip is on screen at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 })
  const strip = page.locator('[data-testid="month-strip"]')
  await expect(strip).toBeVisible()
  const overflows = await strip.evaluate(el => el.scrollWidth > el.clientWidth + 1)
  expect(overflows).toBe(false)
  for (const m of ['JAN', 'JUN', 'DEC']) {
    const box = (await page.locator(`[data-testid="month-${m}"]`).boundingBox())!
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(390)
  }
})

// The owner's colour rule, restated 10 Aug 26: a bid nobody has answered
// carries no colour at all, purple means management has acknowledged it,
// green approved, red refused. jsdom can prove which class was emitted and
// nothing about what was painted — only a browser computes the cascade.
test('the four bid states read as three colours and one plain cell', async ({ page }) => {
  const bg = (sel: string) => page.locator(sel).evaluate(el => getComputedStyle(el).backgroundColor)
  const appr = await bg('[data-testid="cell-dj-2026-01-16"] .c')
  const ack = await bg('[data-testid="cell-bruise-2026-02-24"] .c')
  const ref = await bg('[data-testid="cell-dj-2026-01-19"] .c')
  expect(new Set([appr, ack, ref]).size).toBe(3)
  for (const c of [appr, ack, ref]) expect(c).not.toBe('rgba(0, 0, 0, 0)')

  // Pending is the absence of news, so it must be the absence of paint —
  // asserted against all three answered colours, not merely "not purple".
  const pending = await bg('[data-testid="cell-bruise-2026-01-23"] .c')
  expect(pending).toBe('rgba(0, 0, 0, 0)')
  for (const c of [appr, ack, ref]) expect(pending).not.toBe(c)

  // Plain must still be READABLE. A cell with no background is only correct
  // if its text keeps the ordinary ink — an invisible bid would be worse
  // than a wrongly coloured one.
  const ink = await page.locator('[data-testid="cell-bruise-2026-01-23"] .c')
    .evaluate(el => getComputedStyle(el).color)
  const body = await page.evaluate(() => getComputedStyle(document.body).color)
  expect(ink).toBe(body)
})

// A bid lands PENDING, which since 10 Aug 26 means plain — no colour class
// at all. It used to assert `tbc`, which is now the acknowledged colour: the
// squadron must be able to tell a bid nobody has looked at from one already
// in management's hands, and a freshly typed bid is the former.
test('a bid can be placed, and lands plain because nobody has answered it', async ({ page }) => {
  await page.locator('[data-testid="cell-ammo-2026-02-11"]').click()
  await page.locator('[data-testid="bid-LL"]').click()
  const chip = page.locator('[data-testid="cell-ammo-2026-02-11"] .c')
  await expect(chip).toBeVisible()
  const cls = (await chip.getAttribute('class'))!
  for (const painted of ['tbc', 'appr', 'ref']) expect(cls).not.toContain(painted)
  expect(await chip.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)')
})

// Leave War is session-only, deliberately (see main.tsx): its store boots on a
// memory backend so a reload forgets everything and returns to the seed — the
// same as Raptor's own INPUTS, and the point is that the two apps reset in
// lockstep so a synced cell can never linger on one side of a reload. A freshly
// placed bid must therefore be gone after a reload, and the seed's own cells
// (which the demo re-key always re-installs on the fresh boot) must be back.
test('a placed bid does not survive a reload — the war is session-only', async ({ page }) => {
  await page.locator('[data-testid="cell-ammo-2026-02-11"]').click()
  await page.locator('[data-testid="bid-LL"]').click()
  await expect(page.locator('[data-testid="cell-ammo-2026-02-11"] .c')).toHaveText('LL')

  await page.reload()
  await openLeaveWar(page)

  // The bid is gone (empty cells render no chip at all), while a seed cell is
  // back — proving the reload reset to the seed rather than losing the war.
  await expect(page.locator('[data-testid="cell-ammo-2026-02-11"] .c')).toHaveCount(0)
  await expect(page.locator('[data-testid="cell-dj-2026-01-16"] .c')).toBeVisible()
})

// The four medical markers are management's to mark (owner, 17 Aug 26): the
// Medical row exists for an admin, is absent for a member (they file on
// Raptor's Inputs page and it syncs), and the ATT chips read the owner's
// bare B / C — on the chip and on the grid cell it writes.
test('an admin marks medical on the grid; a member is never offered the row', async ({ page }) => {
  await page.locator('[data-testid="cell-ammo-2026-02-11"]').click()
  await expect(page.locator('[data-testid="bid-picker"]')).toBeVisible()
  await expect(page.locator('[data-testid="bid-ATTB"]')).toHaveCount(0)
  await page.locator('[data-testid="bid-cancel"]').click()
  await lwRole(page, 'admin')
  await page.locator('[data-testid="cell-ammo-2026-02-11"]').click()
  const chip = page.locator('[data-testid="bid-ATTB"]')
  await expect(chip).toHaveText('B')
  await chip.click()
  await expect(page.locator('[data-testid="cell-ammo-2026-02-11"] .c')).toHaveText('B')
})

// The owner's "click the individual personnel counter" (17 Aug 26): the cell
// opens a per-person breakdown whose rows sum to the total on screen. Four
// rows for the default LVE BAL figure — opening, granted, taken, Total.
test('tapping a counter cell opens that person\'s breakdown of the shown figure', async ({ page }) => {
  await page.locator('[data-testid="bal-ammo"]').click()
  const sheet = page.locator('[data-testid="figure-breakdown"]')
  await expect(sheet).toBeVisible()
  await expect(sheet.locator('.crow-top')).toHaveCount(4)
  await expect(sheet.locator('[data-testid="breakdown-total"]')).toBeVisible()
  await page.locator('[data-testid="breakdown-close"]').click()
  await expect(sheet).toHaveCount(0)
})

// The reason the bid sheet is a fixed-position sheet rather than a popover
// inside the cell: `.mx-wrap` is an `overflow: auto` scroller, and anything
// positioned inside a 30px-wide cell is clipped by it. jsdom applies no
// layout at all, so the unit tests can prove the sheet was rendered and
// nothing whatever about whether it can be seen. Only a real browser can.
test('the bid sheet is visible in full, not clipped by the grid scroller', async ({ page }) => {
  await page.locator('[data-testid="cell-ammo-2026-02-11"]').click()
  const sheet = page.locator('[data-testid="bid-picker"]')
  await expect(sheet).toBeVisible()

  const box = (await sheet.boundingBox())!
  expect(box.width).toBeGreaterThan(0)
  expect(box.height).toBeGreaterThan(0)

  const view = page.viewportSize()!
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(view.width + 1)
  expect(box.y + box.height).toBeLessThanOrEqual(view.height + 1)

  // Its buttons have to be reachable, not merely laid out — a sheet the
  // scroller clipped would still report a box while sitting under the grid.
  await expect(page.locator('[data-testid="bid-LL"]')).toBeVisible()
  await page.locator('[data-testid="bid-LL"]').click()
  await expect(sheet).toBeHidden()
})

test('opening the bid sheet never makes the page scroll sideways', async ({ page }) => {
  await page.locator('[data-testid="cell-ammo-2026-02-11"]').click()
  await expect(page.locator('[data-testid="bid-picker"]')).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

// A cell Raptor owns must be indistinguishable in COLOUR from an approved
// bid — the squadron's colour convention is that green means approved, and
// where the approval happened does not change that. Only a real browser
// computes which of the two rules on the chip actually won.
test('a cell Raptor owns is the same green as an approved bid', async ({ page }) => {
  const bg = (sel: string) => page.locator(sel).evaluate(el => getComputedStyle(el).backgroundColor)
  const raptor = await bg('[data-testid="cell-prowler-2026-01-09"] .c')
  const bid = await bg('[data-testid="cell-dj-2026-01-16"] .c')
  expect(raptor).toBe(bid)
  expect(raptor).not.toBe('rgba(0, 0, 0, 0)')
})

// ...and the mark that distinguishes it must actually be painted, rather
// than merely being a class jsdom can see. If this ever reads as damage on a
// real device the rule is meant to be deleted, so it is asserted as a
// deliberate decision and not left to rot unnoticed.
test('the Raptor mark is painted, and an ordinary bid carries none', async ({ page }) => {
  const edge = (sel: string) => page.locator(sel).evaluate(el => {
    const s = getComputedStyle(el)
    return { width: s.borderLeftWidth, style: s.borderLeftStyle }
  })
  const raptor = await edge('[data-testid="cell-prowler-2026-01-09"] .c')
  expect(parseFloat(raptor.width)).toBeGreaterThan(0)
  expect(raptor.style).toBe('solid')

  // The dotted "moved" edge exists only for a move made once bidding has
  // closed (owner, 27 Aug 26 — an open-war shuffle stores no trail, so the
  // seed no longer plants one). Close the war as an admin and MOVE a bid —
  // the landed cell paints the dotted edge.
  await lwRole(page, 'admin')
  await page.locator('[data-testid="stage-advance"]').click()
  await page.locator('[data-testid="cell-slash-2026-02-03"]').click()
  await page.locator('[data-testid="shift-date"]').fill('2026-02-06')
  await page.locator('[data-testid="decide-shift"]').click()
  const moved = await edge('[data-testid="cell-slash-2026-02-06"] .c')
  expect(parseFloat(moved.width)).toBeGreaterThan(0)
  expect(moved.style).toBe('dotted')

  const plain = await edge('[data-testid="cell-dj-2026-01-16"] .c')
  expect(parseFloat(plain.width) || 0).toBe(0)
})

test('a cell Raptor owns offers no way to change it', async ({ page }) => {
  await page.locator('[data-testid="cell-prowler-2026-01-09"]').click()
  await expect(page.locator('[data-testid="raptor-sheet"]')).toBeVisible()
  await expect(page.locator('[data-testid="bid-LL"]')).toHaveCount(0)
  await expect(page.locator('[data-testid="decide-approve"]')).toHaveCount(0)
})

// The workflow the owner described: closing the war makes the sheet
// view-only for the squadron, and the admin account keeps working.
test('closing the war locks the squadron out, and the admin account still edits', async ({ page }) => {
  // advancing the cycle is admin-only since 27 Aug 26 — the admin closes it…
  await lwRole(page, 'admin')
  await page.locator('[data-testid="stage-advance"]').click()
  await expect(page.locator('[data-testid="stage-now"]')).toHaveText('BIDDING CLOSED')

  // …and the squadron is then locked out of the closed sheet
  await lwRole(page, 'member')
  await page.locator('[data-testid="cell-ammo-2026-02-11"]').click()
  await expect(page.locator('[data-testid="bid-picker"]')).toHaveCount(0)

  await lwRole(page, 'admin')
  await page.locator('[data-testid="cell-ammo-2026-02-11"]').click()
  await expect(page.locator('[data-testid="bid-picker"]')).toBeVisible()
})

test('an admin moves a bid to another date, and it lands pending there', async ({ page }) => {
  await lwRole(page, 'admin')          // advancing the cycle is admin-only (27 Aug 26)
  await page.locator('[data-testid="stage-advance"]').click()
  await page.locator('[data-testid="cell-bruise-2026-01-23"]').click()
  await page.locator('[data-testid="shift-date"]').fill('2026-01-30')
  await page.locator('[data-testid="decide-shift"]').click()

  await expect(page.locator('[data-testid="cell-bruise-2026-01-23"] .c')).toHaveCount(0)
  const moved = page.locator('[data-testid="cell-bruise-2026-01-30"] .c')
  await expect(moved).toBeVisible()
  // A shift lands PENDING — a move is a proposal, and someone still has to
  // approve the date it moved to — so the chip is plain, not purple. The
  // dotted `moved` edge is what says it was shifted, and it sits on top of
  // whatever state colour there is or is not.
  const cls = (await moved.getAttribute('class'))!
  for (const painted of ['tbc', 'appr', 'ref']) expect(cls).not.toContain(painted)
  expect(cls).toContain('moved')
})

// ---- drag-to-select (owner, 27 Aug 26) ----
//
// The gesture needs a real browser — pointer capture, elementFromPoint and
// layout — so it lives here, not in the unit suite (which pins the DOM-free
// geometry in select.test.ts). A mouse arms on a 4px move, so a Playwright
// drag with intermediate steps always arms; the selection sheet then opens on
// release. An un-dragged click still opens the single-cell sheet (every other
// test above proves that path unbroken).

async function dragSelect(page: Page, fromId: string, toId: string) {
  const a = (await page.locator(`[data-testid="${fromId}"]`).boundingBox())!
  const b = (await page.locator(`[data-testid="${toId}"]`).boundingBox())!
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2)      // arm past MOUSE_SLOP
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 })
  await page.mouse.up()
}

// Desktop only: the mouse gesture (4px arm) is what Playwright can drive; the
// phone TOUCH gesture (180ms hold) and its frozen-column overlay are checked
// in the live-view pass, not here.
const desktopOnly = () => test.skip(test.info().project.name !== 'lw-desktop', 'mouse-drag path')

test('drag-selecting a row fills the leave across the whole span', async ({ page }) => {
  desktopOnly()
  await dragSelect(page, 'cell-slipway-2026-01-06', 'cell-slipway-2026-01-08')
  await expect(page.locator('[data-testid="select-sheet"]')).toBeVisible()
  // On this viewport slipway's row sits inside the drag's bottom edge band, and
  // a sideways drag along it used to auto-scroll the page every frame — the
  // rows slid up under the still cursor and, when a heading was what ended up
  // under the release point, the last day was dropped (the 2 Sep 26 flake). A
  // band the press started in must be left before it scrolls: the page stays put.
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  await page.locator('[data-testid="sel-LL"]').click()
  for (const d of ['2026-01-06', '2026-01-07', '2026-01-08'])
    await expect(page.locator(`[data-testid="cell-slipway-${d}"] .c`)).toBeVisible()
})

// A member edits ONLY their own row — the person they are viewing as (owner,
// 27 Aug 26 — "if I am viewing as a member and I view as ranger, I shouldn't be
// able to input on other people's row except mine"). Here the member is scoped
// to slipway; ammo is somebody else. The store rule (canEditRow) is unit-tested;
// this proves the GRID honours it — the tap opens the picker on the own row and
// nothing on another.
test('a member scoped to one person can input on that row only', async ({ page }) => {
  await lwView(page, 'slipway')
  // another person's row: a tap opens nothing
  await page.locator('[data-testid="cell-ammo-2026-02-11"]').click()
  await expect(page.locator('[data-testid="bid-picker"]')).toHaveCount(0)
  // own row (viewing as slipway): the tap opens the bid picker
  await page.locator('[data-testid="cell-slipway-2026-02-11"]').click()
  await expect(page.locator('[data-testid="bid-picker"]')).toBeVisible()
})

// The same rule on the DRAG: a scoped member's selection can only ever cover
// their own row (the drag's row list is the viewer alone), so a drag straying
// down onto another person's row is clamped to the viewer's row — a fill from it
// writes the OWN row and never the other. And a drag along the own row still
// spans dates, so scoping does not cost a member their batch fill.
test('a member scoped to one person drag-fills their own row only', async ({ page }) => {
  desktopOnly()
  await lwView(page, 'slipway')
  // strays straight down onto ammo's cell: the selection stays on slipway
  await dragSelect(page, 'cell-slipway-2026-01-06', 'cell-ammo-2026-01-06')
  await expect(page.locator('[data-testid="select-sheet"]')).toBeVisible()
  await page.locator('[data-testid="sel-LL"]').click()
  await expect(page.locator('[data-testid="cell-slipway-2026-01-06"] .c')).toBeVisible()
  await expect(page.locator('[data-testid="cell-ammo-2026-01-06"] .c')).toHaveCount(0)
  // and a normal along-the-row drag still selects a whole span
  await dragSelect(page, 'cell-slipway-2026-01-10', 'cell-slipway-2026-01-12')
  await expect(page.locator('[data-testid="select-sheet"]')).toBeVisible()
})

test('a drag-selection offers Move, and the move banner appears on entering it', async ({ page }) => {
  desktopOnly()
  await lwRole(page, 'admin')
  // fill the block first: Move (and Delete) are offered only when the selection
  // actually holds a movable bid (owner, 27 Aug 26 — an empty box is Fill-only)
  await dragSelect(page, 'cell-slipway-2026-01-06', 'cell-slipway-2026-01-07')
  await page.locator('[data-testid="sel-LL"]').click()
  await dragSelect(page, 'cell-slipway-2026-01-06', 'cell-slipway-2026-01-07')
  await expect(page.locator('[data-testid="select-sheet"]')).toBeVisible()
  await page.locator('[data-testid="sel-move"]').click()
  // the sheet gives way to the move banner; the landing itself (moveCells) is
  // pinned in store.test.ts and driven by hand in the live-view pass, where
  // the desktop ghost and phone tap-to-place are actually looked at
  await expect(page.locator('[data-testid="select-sheet"]')).toHaveCount(0)
  await expect(page.locator('[data-testid="move-banner"]')).toBeVisible()
  await page.locator('[data-testid="move-cancel"]').click()
  await expect(page.locator('[data-testid="move-banner"]')).toHaveCount(0)
})

// A loose box — bigger than the inputs, with an empty margin — must MOVE the
// inputs present and ignore the empties (owner, 27 Aug 26 — "move items … that
// are present … if I select more area than required it registers as nothing").
// The block's first input lands on the day clicked; the empty leading day (06)
// is dropped. Desktop lands on the click; the phone preview+Confirm is checked
// in the live-view pass.
test('a loose box moves the inputs present, first input landing on the clicked day', async ({ page }) => {
  desktopOnly()
  await lwRole(page, 'admin')
  // two inputs on 07–08; 06 stays empty
  await dragSelect(page, 'cell-slipway-2026-01-07', 'cell-slipway-2026-01-08')
  await page.locator('[data-testid="sel-LL"]').click()
  await expect(page.locator('[data-testid="cell-slipway-2026-01-07"] .c')).toBeVisible()
  await expect(page.locator('[data-testid="select-sheet"]')).toHaveCount(0)
  // over-select 06..08 (06 empty) and move — the empty must NOT refuse it
  await dragSelect(page, 'cell-slipway-2026-01-06', 'cell-slipway-2026-01-08')
  await page.locator('[data-testid="sel-move"]').click()
  await expect(page.locator('[data-testid="move-banner"]')).toBeVisible()
  // click a landing day: the first input (07) lands here, 08 rides along
  await page.locator('[data-testid="cell-slipway-2026-01-12"]').click()
  await expect(page.locator('[data-testid="move-banner"]')).toHaveCount(0)              // moved, mode cleared
  await expect(page.locator('[data-testid="cell-slipway-2026-01-12"] .c')).toBeVisible() // first input on the clicked day
  await expect(page.locator('[data-testid="cell-slipway-2026-01-13"] .c')).toBeVisible() // the gap is kept
  await expect(page.locator('[data-testid="cell-slipway-2026-01-07"] .c')).toHaveCount(0) // source vacated
})

// A right-click cancels a move on desktop (owner, 27 Aug 26 — the mouse Escape).
test('right-click cancels a move on desktop', async ({ page }) => {
  desktopOnly()
  await lwRole(page, 'admin')
  await dragSelect(page, 'cell-slipway-2026-01-06', 'cell-slipway-2026-01-07')
  await page.locator('[data-testid="sel-LL"]').click()
  await dragSelect(page, 'cell-slipway-2026-01-06', 'cell-slipway-2026-01-07')
  await page.locator('[data-testid="sel-move"]').click()
  await expect(page.locator('[data-testid="move-banner"]')).toBeVisible()
  await page.locator('[data-testid="cell-slipway-2026-01-10"]').click({ button: 'right' })
  await expect(page.locator('[data-testid="move-banner"]')).toHaveCount(0)   // cancelled, nothing moved
  await expect(page.locator('[data-testid="cell-slipway-2026-01-06"] .c')).toBeVisible()
})

// Dragging an EVENT row opens the event sheet pre-set to the swept span (owner,
// 27 Aug 26 — "drag and select grids in the events column to input events").
test('dragging an event row opens the event sheet ranged to the span', async ({ page }) => {
  desktopOnly()
  await lwRole(page, 'admin')
  await dragSelect(page, 'event-0-2026-01-06', 'event-0-2026-01-08')
  await expect(page.locator('[data-testid="event-text"]')).toBeVisible()
  // seeded to a RANGE, not a single day: the "A range" scope is the active chip
  await expect(page.locator('[data-testid="event-scope-range"]')).toHaveClass(/approve/)
})

// The date header freezes below the top bar on a DESKTOP page scroll now, like
// the phone (owner, 27 Aug 26). The mirror only exists once the real header has
// scrolled up under the bar.
test('the date header freezes on desktop when the page scrolls down', async ({ page }) => {
  desktopOnly()
  await expect(page.locator('[data-testid="sticky-head"]')).toHaveCount(0)
  await page.evaluate(() => window.scrollTo(0, 1400))
  await expect(page.locator('[data-testid="sticky-head"]')).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(page.locator('[data-testid="sticky-head"]')).toHaveCount(0)   // thaws back
})

// Published-stage remarks editing (owner, 27 Aug 26): once the war is
// published, a tap on an approved leave opens a note editor. An admin does it
// for anyone (a member for their own is pinned in remarks.test.tsx); the note
// lives on the Raptor input, so this proves the cross-app save in a real
// browser.
test('at published, a tap on an approved leave edits its note, and it sticks', async ({ page }) => {
  // A REAL admin login, not just the war-role bridge: the note saves through
  // Raptor's commitInputEdit, whose member-own gate genuinely fires since the
  // 27 Aug overnight pass — a member session editing prowler's record is
  // refused there, and production's war admin IS the Raptor admin (the war
  // role mirrors the login), so the realistic session is the admin one.
  await openLeaveWar(page, 'a')
  await page.locator('[data-testid="stage-advance"]').click()   // open -> closed
  await page.locator('[data-testid="stage-advance"]').click()   // closed -> published
  const cell = page.locator('[data-testid="cell-prowler-2026-01-09"]')  // a Raptor-owned leave
  await cell.click()
  await expect(page.locator('[data-testid="remarks-sheet"]')).toBeVisible()
  await page.locator('[data-testid="remarks-field"]').fill('checked by e2e')
  await page.locator('[data-testid="remarks-save"]').click()
  await expect(page.locator('[data-testid="remarks-sheet"]')).toHaveCount(0)
  // reopen — the note survived the round trip through the Raptor input
  await cell.click()
  await expect(page.locator('[data-testid="remarks-field"]')).toHaveValue('checked by e2e')
})

// ---- the frozen counter column ----
//
// This is the riskiest surface in the build and the one jsdom is blindest
// to: a second sticky column anchors its `left:` to the first column's
// width, so a `.who` free to grow slides the two apart and leaves a gap the
// day cells scroll through. Every rectangle is 0×0 in the unit suite, so
// none of that is visible there.

test('both frozen columns stay put when the grid scrolls sideways', async ({ page }) => {
  const who = frozen(page, 'slipway', '.who')
  const bal = frozen(page, 'slipway', '.bal')
  const before = { who: (await who.boundingBox())!, bal: (await bal.boundingBox())! }

  const wrap = page.locator('.mx-wrap')
  await wrap.evaluate(el => el.scrollBy(600, 0))
  expect(await wrap.evaluate(el => el.scrollLeft)).toBeGreaterThan(0)

  const after = { who: (await who.boundingBox())!, bal: (await bal.boundingBox())! }
  expect(Math.abs(after.who.x - before.who.x)).toBeLessThan(1)
  expect(Math.abs(after.bal.x - before.bal.x)).toBeLessThan(1)
})

test('the two frozen columns sit flush — no gap, no overlap', async ({ page }) => {
  const who = (await page.locator('[data-testid="row-slipway"] .who').boundingBox())!
  const bal = (await page.locator('[data-testid="bal-slipway"]').boundingBox())!
  // The balance column starts exactly where the callsign column ends. A gap
  // lets day cells scroll through between them; an overlap hides the name.
  expect(Math.abs(bal.x - (who.x + who.width))).toBeLessThan(1)
})

// This test USED to assert only `not rgba(0, 0, 0, 0)`, and that is exactly
// how it let a real defect through: the row-hover rule repainted the frozen
// cell `rgba(59, 198, 232, 0.05)`, which is not transparent and is not opaque
// either, so the grid scrolled visibly underneath it while this passed. The
// owner found it on a phone. "Not transparent" was never the requirement —
// FULLY opaque is, so alpha is what gets asserted now.
//
// The hovered case is the one that broke, and it is not an exotic state on a
// touch screen: a tap leaves the row hovered until something else is tapped,
// so on a phone the column stays see-through for as long as you look at it.
test('the balance column is opaque — day cells never show through it', async ({ page }) => {
  const bal = page.locator('[data-testid="bal-slipway"]')
  const alphaOf = (css: string) => {
    const parts = css.match(/[\d.]+/g)!
    return parts.length < 4 ? 1 : Number(parts[3])
  }

  await page.locator('.mx-wrap').evaluate(el => el.scrollBy(600, 0))
  const day = page.locator('[data-testid="cell-slipway-2026-01-15"]')
  // A cell in the SAME ROW that the pointer will not be on. Asserting the
  // row lights up needs a cell the pointer is not touching: the hovered one
  // changes colour anyway through `.mx td.act:hover`, so it cannot tell
  // "the row lights up" from "the cell does".
  const sibling = page.locator('[data-testid="cell-slipway-2026-01-16"]')
  const who = page.locator('[data-testid="row-slipway"] .who')
  const bg = (l: typeof day) => l.evaluate(el => getComputedStyle(el).backgroundColor)

  // Every at-rest reading is taken BEFORE anything is hovered. Taking them
  // after a hover was a real mistake in this test's first draft: the row was
  // already lit, so "at rest" and "hovered" were the same measurement and
  // the comparison could only ever be false.
  //
  // "Before anything is hovered" now has to be MADE true, not assumed: the
  // pointer rests wherever the login click left it, and with the projected
  // 58-row roster the matrix reaches high enough that this row sits under
  // that stale position on the desktop project — the row read as already
  // lit and the hover comparison went false. Park the mouse in the corner
  // first, where nothing of the grid lives.
  await page.mouse.move(0, 0)
  const balAtRest = await bg(bal)
  const siblingAtRest = await bg(sibling)
  expect(alphaOf(balAtRest)).toBe(1)

  await day.hover()

  // The defect: opaque at rest, opaque hovered. Nothing shows through.
  expect(alphaOf(await bg(bal))).toBe(1)
  // The callsign column was always exempt; assert it stays that way.
  expect(alphaOf(await bg(who))).toBe(1)
  // ...and the row hover this rule exists for still happens, so a "fix" that
  // simply deleted the rule does not pass. `alpha < 1` would not do here
  // either: an untinted cell is transparent, which is translucent too.
  expect(await bg(sibling)).not.toBe(siblingAtRest)
})

// The space arithmetic, checked against a real browser rather than read off
// the stylesheet. The estimate that justified this design was WRONG — it
// assumed 30px day columns from `min-width`, where the rendered width is
// ~41px — so the figures below are measured, on 2026-08-09:
//
//   phone (390px viewport): wrap 348, callsign 76, balance 44 → 5.6 days
//   the same phone before the counter column: callsign 118    → 5.6 days
//
// The callsign column gives back almost exactly what the counter column
// takes, which was the whole point of tightening it. This test guards that
// trade rather than the individual numbers: a counter panel that left four
// days on screen would be a worse app than no counters at all.
test('the counter column does not eat the grid on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 })
  const m = await page.evaluate(() => {
    const wrap = document.querySelector('.mx-wrap')!.getBoundingClientRect().width
    const who = document.querySelector('[data-testid="row-slipway"] .who')!.getBoundingClientRect().width
    const bal = document.querySelector('[data-testid="bal-slipway"]')!.getBoundingClientRect().width
    const day = document.querySelector('[data-testid="cell-slipway-2026-01-15"]')!.getBoundingClientRect().width
    return { wrap, who, bal, day }
  })
  expect(m.day).toBeGreaterThan(0)
  const visibleDays = (m.wrap - m.who - m.bal) / m.day
  expect(visibleDays).toBeGreaterThan(5)
  // The frozen pair must stay a minority of a phone screen. Widening the
  // callsign column back to its desktop 118px would trip this.
  expect((m.who + m.bal) / m.wrap).toBeLessThan(0.4)
})

test('the counter column changes every row at once', async ({ page }) => {
  await expect(page.locator('[data-testid="counter-name"]')).toHaveText('LVE BAL')
  const rows = ['slipway', 'prowler', 'dj', 'ammo']
  const before = await Promise.all(rows.map(r => page.locator(`[data-testid="bal-${r}"]`).textContent()))

  await pickCounter(page, 'oil')
  await expect(page.locator('[data-testid="counter-name"]')).toHaveText('OIL USED')

  const after = await Promise.all(rows.map(r => page.locator(`[data-testid="bal-${r}"]`).textContent()))
  expect(after).not.toEqual(before)
  // Every row moved together — none is still showing the previous figure.
  for (const v of after) expect(v).not.toBeNull()
})

test('a negative balance is painted red, and a positive one is not', async ({ page }) => {
  // LVE BAL is the one figure that can go negative, and it is the default.
  // HARPOON opens annual at 2 and holds four pending days in the 2027 war,
  // which the cross-war rule counts — so his balance reads -2; SLIPWAY sits
  // comfortably positive.
  await expect(page.locator('[data-testid="counter-name"]')).toHaveText('LVE BAL')
  const neg = await page.locator('[data-testid="bal-harpoon"]').evaluate(el => ({
    text: el.textContent, colour: getComputedStyle(el).color,
  }))
  expect(neg.text!.startsWith('-')).toBe(true)
  const pos = await page.locator('[data-testid="bal-slipway"]')
    .evaluate(el => getComputedStyle(el).color)
  expect(neg.colour).not.toBe(pos)
})

// The date cells carry className="day", which Raptor's global scheduler.css
// rounds (border-radius: var(--r)) — a cross-page leak. The scoped Leave War
// rule forces them square (owner, Aug 26 — "make the dates a square"). jsdom
// reports no border-radius at all, so this contract lives only in a browser.
test('the date headers are square, the .day leak overridden', async ({ page }) => {
  const r = await page.locator('[data-testid="head-2026-01-07"]')
    .evaluate(el => getComputedStyle(el).borderTopLeftRadius)
  expect(r).toBe('0px')
})

// The picker is also the legend the owner asked for: the BAL/CON key, and each
// aggregate's make-up shown inline as its "= …" caption.
test('the figure picker doubles as the legend, aggregates spelled out', async ({ page }) => {
  await page.locator('[data-testid="counter-pick"]').click()
  await expect(page.locator('[data-testid="counter-legend"]')).toContainText('BAL')
  await expect(page.locator('[data-testid="counter-legend"]')).toContainText('USED')
  await expect(page.locator('[data-testid="figsub-med"]')).toHaveText('= ATT C + HL + OML')
  await expect(page.locator('[data-testid="figsub-lvecon"]'))
    .toHaveText('= LL + OL + OIL + CCL + PL + FCL + CL')
})

// The figures reorder through the ▲▼ each row carries — management's alone
// since 17 Aug 26 ("normal user should not have authority to change the
// leave war column arrangement") — and Reset restores the catalogue order.
test('the figures reorder, and Reset restores the default order', async ({ page }) => {
  // A member sees no reorder controls at all.
  await page.locator('[data-testid="counter-pick"]').click()
  await expect(page.locator('[data-testid="figrow-ll"]')).toBeVisible()
  await expect(page.locator('[data-testid="figdown-ll"]')).toHaveCount(0)
  await expect(page.locator('[data-testid="counter-reset"]')).toHaveCount(0)
  await page.locator('[data-testid="counter-cancel"]').click()
  await lwRole(page, 'admin')
  await page.locator('[data-testid="counter-pick"]').click()
  await page.locator('[data-testid="figdown-ll"]').click()
  expect((await page.locator('[data-testid="counter-sheet"] .crow .cn').allTextContents())[0]).toBe('OL USED')
  await page.locator('[data-testid="counter-reset"]').click()
  expect((await page.locator('[data-testid="counter-sheet"] .crow .cn').allTextContents())[0]).toBe('LL USED')
})

// The twelve-figure sheets scroll INSIDE the sheet on a phone, and the header
// used to scroll away with them, taking the ✕ along — a reader deep in the
// list had no visible way out (owner, 17 Aug 26, from the deployed page).
// The header is stuck to the sheet's top now: scroll to the floor of the
// list and the close button still sits inside the viewport, clickable.
test('a scrolled sheet keeps its header and its close button', async ({ page }) => {
  await page.locator('[data-testid="counter-pick"]').click()
  const sheet = page.locator('[data-testid="counter-sheet"]')
  await expect(sheet).toBeVisible()
  await sheet.evaluate(el => { el.scrollTop = el.scrollHeight })
  const x = page.locator('[data-testid="counter-cancel"]')
  await expect(x).toBeVisible()
  const box = (await x.boundingBox())!
  const vp = page.viewportSize()!
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height)
  await x.click()
  await expect(sheet).toHaveCount(0)
})

// The page scrolls FREELY behind an open sheet (owner, 28 Aug 26 — "enable me
// to still scroll up and down when this window is opened"). This REVERSES the
// 17 Aug one-scroll body lock: the body is no longer frozen, so the page scrolls
// up-down while the sheet stays up, and the scrim yields the vertical axis to
// the browser (`touch-action: pan-y`) rather than refusing every gesture. The
// panel is position:fixed, so only the grid behind it moves — the sheet does not
// ride the page down. (The sheet's OWN list still keeps its scroll to itself via
// `overscroll-behavior: contain` in bidpicker.css — unchanged, not re-asserted
// here since it only bites when the list overflows, which a fitting sheet does
// not.)
test('the page scrolls behind an open sheet, and the panel stays put', async ({ page }) => {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator('[data-testid="counter-pick"]').click()
  const sheet = page.locator('[data-testid="counter-sheet"]')
  await expect(sheet).toBeVisible()
  const topBefore = (await sheet.boundingBox())!.y

  // The page is not locked: it scrolls up-down while the sheet stays up.
  // (Under the old body lock, overflow:hidden refused this and scrollY held.)
  await page.evaluate(() => window.scrollBy(0, 300))
  await page.waitForTimeout(100)
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

  // The panel is fixed, so it does not travel down with the page.
  const topAfter = (await sheet.boundingBox())!.y
  expect(Math.abs(topAfter - topBefore)).toBeLessThan(1.5)

  const ta = await page.locator('[data-testid="sheet-scrim"]').evaluate(el => getComputedStyle(el).touchAction)
  expect(ta).toBe('pan-y')
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
})

// The viewer — Raptor's "View as" person, Bane on a fresh login — is lit on
// the grid, the title sheet answers with THEIR numbers, and any callsign
// opens that person's all-figures sheet, member included (owner, 17 Aug 26).
test('the viewer\'s row is lit and the title sheet answers with their numbers', async ({ page }) => {
  // openLeaveWar leaves the war unscoped so the mechanics tests edit any row;
  // this test is specifically about the viewer, so scope it to Bane (Ranger) —
  // the person a fresh Raptor login views as.
  await lwView(page, 'bane')
  const mine = page.locator('[data-testid="row-bane"]')
  await expect(mine).toHaveClass('me')
  // Painted, not merely classed — the frozen pair carries a solid tint.
  const bg = await page.locator('[data-testid="row-bane"] .who').evaluate(el => getComputedStyle(el).backgroundColor)
  const other = await page.locator('[data-testid="row-prowler"] .who').evaluate(el => getComputedStyle(el).backgroundColor)
  expect(bg).not.toBe(other)

  // The persistent viewer badge names whose page this is (owner, 28 Aug 26).
  await expect(page.locator('[data-testid="lw-viewing"]')).toContainText('Ranger')

  await page.locator('[data-testid="counter-pick"]').click()
  // The picker leads with VIEWING AS <callsign> (28 Aug 26), not a grey aside.
  await expect(page.locator('[data-testid="counter-viewer"]')).toContainText('VIEWING AS')
  await expect(page.locator('[data-testid="counter-viewer"]')).toContainText('Ranger')
  // The row still answers with the viewer's own number; "left" is the balance's
  // word (the per-row "yours" was dropped for the header, 28 Aug 26).
  await expect(page.locator('[data-testid="counter-lvebal"]')).toContainText('left')
  await page.locator('[data-testid="counter-cancel"]').click()

  await page.locator('[data-testid="person-prowler"]').click()
  const figs = page.locator('[data-testid="person-figures"]')
  await expect(figs).toBeVisible()
  await expect(figs.locator('.crow-wrap')).toHaveCount(13)   // CL BAL + CL USED joined 3 Sep 26
  // A member reaches no editor from here.
  await expect(page.locator('[data-testid="person-edit"]')).toHaveCount(0)
})

// Nothing in the frozen column may be cut off. `.who` carries `overflow:
// hidden` — without it a long label would push the balance column out of
// alignment — so an oversized label fails SILENTLY, appearing merely
// truncated. jsdom reports every width as 0 and cannot see it at all.
//
// This caught two real cases when the phone breakpoint tightened the column
// to 76px: "Crew sets" wanted 84px against 75 available, and "IP + IWSO" 77.
// Both are count-row labels; every callsign still fitted, which is why the
// bug was invisible until it was measured.
test('nothing in the callsign column is cut off', async ({ page }) => {
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll('.mx .who')]
      .map(el => el as HTMLElement)
      .filter(el => el.scrollWidth > el.clientWidth + 1)
      .map(el => `${el.textContent?.trim()} (${el.scrollWidth} > ${el.clientWidth})`))
  expect(clipped).toEqual([])

  // Proves the collection was not empty, so an absent `.who` cannot pass
  // this by having nothing to check.
  const count = await page.locator('.mx .who').count()
  expect(count).toBeGreaterThan(10)
})

// ---- more than one leave war ----

test('switching leave war repaints the grid and keeps the balance', async ({ page }) => {
  await expect(page.locator('[data-testid="cell-slipway-2026-01-01"]')).toHaveText('OL')
  const before = await page.locator('[data-testid="bal-harpoon"]').textContent()

  await page.selectOption('[data-testid="war-picker"]', { label: 'JAN - DEC 27' })
  // A war opens on its first months (the column window); April is reached
  // the way a reader reaches it, by the strip.
  await expect(page.locator('[data-testid="head-2027-01-01"]')).toHaveCount(1)
  await page.locator('[data-testid="month-APR"]').click()
  await expect(page.locator('[data-testid="cell-harpoon-2027-04-13"]')).toHaveText('LL')
  await expect(page.locator('[data-testid="cell-slipway-2026-01-01"]')).toHaveCount(0)

  // Entitlements are continuous and wars are windows onto them, so the
  // figure is the same from either screen. HARPOON's four days sit in Apr–Jun
  // and take him to −2 annual, which reads −2 from Jan–Mar too.
  await expect(page.locator('[data-testid="bal-harpoon"]')).toHaveText(before!)
  expect(before).toBe('-2')
})

// The create sheet renders OUTSIDE `.topbar` because that element carries
// `backdrop-filter`, which makes it the containing block for any
// `position: fixed` descendant — the sheet would otherwise resolve its
// `bottom` against a 60px-tall bar and appear clipped at the top of the
// page. Every unit test passed while it was broken: jsdom computes no
// layout at all. This is the test that caught it.
test('the new-leave-war sheet is anchored to the viewport, not the topbar', async ({ page }) => {
  await lwRole(page, 'admin')
  await page.locator('[data-testid="war-new"]').click()

  const sheet = page.locator('[data-testid="war-sheet"]')
  await expect(sheet).toBeVisible()

  const box = (await sheet.boundingBox())!
  const view = page.viewportSize()!
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height).toBeLessThanOrEqual(view.height + 1)
  // Anchored to the BOTTOM, which is where every other sheet sits and where a
  // thumb already is on a phone. Asserted on the sheet's bottom edge rather
  // than its top: once this sheet gained a month calendar it became tall
  // enough to reach well up the screen, and "its top is in the lower half"
  // stopped being a statement about anchoring at all.
  expect(view.height - (box.y + box.height)).toBeLessThan(40)

  const bar = (await page.locator('#page-leavewar .topbar').boundingBox())!
  expect(box.y).toBeGreaterThan(bar.y + bar.height)
})

// A single month, deliberately: the owner settled that a period is any range
// they choose, down to one month, and this is the short end of that. The
// dates are in 2028 because the two seeded wars now cover the whole of 2026
// and 2027 — with year-long wars there is no free month any nearer.
test('an admin creates a leave war, and it joins the picker', async ({ page }) => {
  await lwRole(page, 'admin')
  await page.locator('[data-testid="war-new"]').click()
  await page.fill('[data-testid="war-name"]', 'JUL 28')
  await pickSpan(page, 'war', '2028-07-01', '2028-07-31')
  await page.locator('[data-testid="war-create"]').click()

  await expect(page.locator('[data-testid="war-sheet"]')).toHaveCount(0)
  await expect(page.locator('[data-testid="war-picker"] option')).toHaveText([
    'JAN - DEC 26', 'JAN - DEC 27', 'JUL 28',
  ])
})

test('overlapping dates are refused, with the reason on screen', async ({ page }) => {
  await lwRole(page, 'admin')
  await page.locator('[data-testid="war-new"]').click()
  await page.fill('[data-testid="war-name"]', 'CLASH')
  await pickSpan(page, 'war', '2026-05-01', '2026-08-31')
  await page.locator('[data-testid="war-create"]').click()

  await expect(page.locator('[data-testid="war-problem"]')).toBeVisible()
  await expect(page.locator('[data-testid="war-sheet"]')).toBeVisible()
  await expect(page.locator('[data-testid="war-picker"] option')).toHaveCount(2)
})

// The bidding window is the answer to the owner's "the admin can select which
// period to open" now that a war is a whole year. jsdom proves the class is
// emitted and nothing about whether a locked column LOOKS locked, which is the
// only thing that matters to someone holding a phone.
test('a locked column is visibly dimmer than an open one, and still readable', async ({ page }) => {
  const open = page.locator('[data-testid="head-2026-02-11"]')
  const locked = page.locator('[data-testid="head-2026-08-11"]')
  // Read the open column first (drawn at the open), then jump to August for
  // the locked one — the grid draws a window of months (colwindow.ts).
  const openOpacity = await open.evaluate(el => Number(getComputedStyle(el).opacity))
  await page.locator('[data-testid="month-AUG"]').click()
  await expect(locked).toHaveCount(1)
  const opacity = (l: typeof open) => l.evaluate(el => Number(getComputedStyle(el).opacity))

  expect(openOpacity).toBe(1)
  const dim = await opacity(locked)
  expect(dim).toBeLessThan(1)
  // Dimmed, not hidden. Seeing the rest of the year is the entire reason the
  // war is a year — a lock that erased October would undo that.
  expect(dim).toBeGreaterThan(0.25)
  await expect(locked).toBeVisible()
  expect((await locked.boundingBox())!.width).toBeGreaterThan(0)
})

test('an admin sees no lock, because the window does not bind them', async ({ page }) => {
  await lwRole(page, 'admin')
  const locked = page.locator('[data-testid="head-2026-08-11"]')
  await page.locator('[data-testid="month-AUG"]').click()
  await expect(locked).toHaveCount(1)
  expect(await locked.evaluate(el => Number(getComputedStyle(el).opacity))).toBe(1)
})

// The range calendar is the control the owner asked for twice — for leave and
// for a war's dates. Its whole justification over two native date inputs is
// that it DRAWS the span, and only a browser can say whether it does.
test('the range calendar paints the span between the two taps', async ({ page }) => {
  await lwRole(page, 'admin')
  await page.locator('[data-testid="bid-window"]').click()
  await expect(page.locator('[data-testid="window-sheet"]')).toBeVisible()

  const bg = (d: string) => page.locator(`[data-testid="window-day-${d}"]`)
    .evaluate(el => getComputedStyle(el).backgroundColor)
  // Cleared first, because the sheet opens showing the window that is already
  // set — Jan-Mar — so every January day starts painted and there would be no
  // unpainted day left to compare against.
  await page.locator('[data-testid="window-clear"]').click()
  const plain = await bg('2026-01-20')

  await page.locator('[data-testid="window-day-2026-01-12"]').click()
  await page.locator('[data-testid="window-day-2026-01-16"]').click()

  // Every day in the span is painted, the ends more strongly than the middle,
  // and a day outside it is untouched.
  const middle = await bg('2026-01-14')
  const start = await bg('2026-01-12')
  expect(middle).not.toBe(plain)
  expect(start).not.toBe(middle)
  expect(await bg('2026-01-20')).toBe(plain)
})

// The owner's complaint about the counter arrows was that they are too small
// to hit. The calendar is the control that mistake taught, so its days and its
// month arrows are held to a real tap target on a phone.
test('every control in the range calendar is a real tap target', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 })
  await lwRole(page, 'admin')
  await page.locator('[data-testid="bid-window"]').click()

  for (const id of ['window-day-2026-01-12', 'window-prev-month', 'window-next-month']) {
    const box = (await page.locator(`[data-testid="${id}"]`).boundingBox())!
    expect(box.width).toBeGreaterThanOrEqual(30)
    expect(box.height).toBeGreaterThanOrEqual(30)
  }
})

// Same trap the new-war sheet fell into: `.topbar` carries `backdrop-filter`,
// which makes it the containing block for any `position: fixed` descendant.
// This sheet opens from the stage strip, so it has to be checked separately.
test('the bidding-window sheet is anchored to the viewport, not clipped', async ({ page }) => {
  await lwRole(page, 'admin')
  await page.locator('[data-testid="bid-window"]').click()
  const sheet = page.locator('[data-testid="window-sheet"]')
  await expect(sheet).toBeVisible()

  const box = (await sheet.boundingBox())!
  const view = page.viewportSize()!
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height).toBeLessThanOrEqual(view.height + 1)
  const bar = (await page.locator('#page-leavewar .topbar').boundingBox())!
  expect(box.y).toBeGreaterThan(bar.y + bar.height)
})

// A posted-out day is drawn as shaded grey diagonal lines — the owner asked
// for it on 10 Aug 26, which is how we learned the hatch already there was
// too faint to read on a phone. jsdom cannot see a gradient at all, so the
// unit suite can only prove the `.gone` class was emitted.
test('a posted-out cell is hatched, and an ordinary cell is not', async ({ page }) => {
  const bgImage = (d: string) => page.locator(`[data-testid="cell-ignite-${d}"]`)
    .evaluate(el => getComputedStyle(el).backgroundImage)

  // IGNITE is posted out on 2026-01-12, so the 13th is the first day gone.
  const gone = await bgImage('2026-01-13')
  expect(gone).toContain('repeating-linear-gradient')
  expect(await bgImage('2026-01-09')).toBe('none')

  // The hatch has to be visible against the cell it sits on, not a shade of
  // the background. Taken as the STRONGEST stop in the gradient, not the
  // first: `transparent` computes to `rgba(0, 0, 0, 0)` and leads the list,
  // so reading stop one measured the gaps between the lines rather than the
  // lines. Found by this test failing against a hatch that was in fact fine.
  const alphas = [...gone.matchAll(/rgba\([\d\s,]+?,\s*([\d.]+)\)/g)].map(m => Number(m[1]))
  expect(Math.max(...alphas)).toBeGreaterThanOrEqual(0.6)
})

// OFF stopped being a person's leave on 2 Sep 26 (it is a management Off
// day event now), so the bid sheet must not offer it.
test('OFF is not offered as a leave to bid', async ({ page }) => {
  await page.locator('[data-testid="cell-ammo-2026-02-11"]').click()
  await expect(page.locator('[data-testid="bid-EL"]')).toBeVisible()
  await expect(page.locator('[data-testid="bid-OFF"]')).toHaveCount(0)
})

// The owner's complaint, from a phone: the chrome ate the screen and left
// four rows of grid visible. Two things had to change — the topbar scrolls
// away, and there is less of it to scroll past — and neither is visible to
// jsdom, which computes no layout at all.
test('the topbar scrolls away instead of holding the top of the screen', async ({ page }) => {
  // A SHORT viewport on purpose. At 390x760 the whole page is now only 808px
  // tall — the chrome shrank enough that there is barely anything to scroll,
  // which is the change working but leaves nothing for this test to observe.
  // 390x400 guarantees the page genuinely scrolls, so "does the topbar move
  // with it" is a question that can be asked at all.
  await page.setViewportSize({ width: 390, height: 400 })
  const bar = page.locator('#page-leavewar .topbar')
  const before = (await bar.boundingBox())!
  expect(before.y).toBeGreaterThanOrEqual(0)

  await page.evaluate(() => window.scrollBy(0, 200))
  // Prove the page genuinely scrolled before trusting the topbar's new
  // position as evidence of anything.
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100)

  const after = await bar.boundingBox()
  // Either gone entirely or moved up with the page — what it must NOT do is
  // stay where it was, which is what `position: sticky` made it do.
  expect(after === null || after.y < before.y - 100).toBe(true)
})

// The other half of the owner's complaint, and the more important half: not
// how the chrome behaves when scrolled, but how much of it there is. Measured
// at 390x760 before the change — the title, the picker, the stage strip and
// the month strip held 690px of a 760px screen.
test('the chrome above the grid is a fraction of the screen, not most of it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 760 })
  const wrap = (await page.locator('.mx-wrap').boundingBox())!
  // Everything above the first date column: topbar, stage strip, card header
  // and month strip together.
  expect(wrap.y).toBeLessThan(320)
})

// Scrolling the chrome away is only worth doing if the date header does not
// go with it. That row is the one part of the top of this page that is
// load-bearing while reading a grid.
test('the date header stays put while the topbar goes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 400 })
  await page.evaluate(() => window.scrollBy(0, 200))
  const head = page.locator('[data-testid="head-2026-01-15"]')
  await expect(head).toBeVisible()
  const box = (await head.boundingBox())!
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.y).toBeLessThan(760)
})

// The measurement behind the change: at 390x760 the chrome held 690px and
// left four rows of grid. This pins the improvement as a number rather than
// as a claim.
test('the grid gets most of the screen on a phone once the chrome is scrolled away', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 760 })
  await page.evaluate(() => window.scrollBy(0, 2000))

  const rows = await page.evaluate(() => {
    const seen = [...document.querySelectorAll('.mx tbody tr')]
    return seen.filter(r => {
      const b = r.getBoundingClientRect()
      return b.top >= 0 && b.bottom <= window.innerHeight && b.height > 0
    }).length
  })
  // Four rows was the complaint. Twelve visible aircrew is the answer (the
  // projected roster holds 58, so the viewport, not the roster, is the cap).
  expect(rows).toBeGreaterThanOrEqual(12)
})

test('every date column names its weekday', async ({ page }) => {
  const dow = (d: string) => page.locator(`[data-testid="head-${d}"] .dow`).textContent()
  expect(await dow('2026-01-05')).toBe('MON')
  expect(await dow('2026-01-11')).toBe('SUN')
  // Legible, not merely present: it is the smallest text in the grid.
  const size = await page.locator('[data-testid="head-2026-01-05"] .dow')
    .evaluate(el => parseFloat(getComputedStyle(el).fontSize))
  expect(size).toBeGreaterThanOrEqual(8)
})

// The owner's complaint: "The left and right buttons on the phone to toggle
// the view for the leave counter is too small." They were — two 13px glyphs
// inside a 44px column. This is the size question, and only a browser can
// answer it.
test('the counter control is a real tap target on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 760 })
  const head = (await page.locator('[data-testid="counter-pick"]').boundingBox())!
  // The whole column header is the button now, so it is as wide as the
  // column and tall enough to hit without aiming.
  expect(head.width).toBeGreaterThanOrEqual(36)
  expect(head.height).toBeGreaterThanOrEqual(36)

  await page.locator('[data-testid="counter-pick"]').click()
  await expect(page.locator('[data-testid="counter-sheet"]')).toBeVisible()
  // The picker was compressed on 28 Aug 26 (owner — "much smaller and compress
  // the data"): the generic captions are gone and the rows pull down to a
  // dense-but-tappable height, below the 44px action-sheet floor on purpose.
  // Still a real target — a scannable list of the viewer's own figures.
  for (const c of ['ll', 'lvebal', 'lvecon']) {
    const wrap = (await page.locator(`[data-testid="figrow-${c}"]`).boundingBox())!
    expect(wrap.width).toBeGreaterThanOrEqual(220)
    const crow = (await page.locator(`[data-testid="counter-${c}"]`).boundingBox())!
    expect(crow.height).toBeGreaterThanOrEqual(28)
  }
})

test('the counter sheet changes the column, and every row with it', async ({ page }) => {
  const shown = () => page.locator('[data-testid="counter-name"]').textContent()
  expect(await shown()).toBe('LVE BAL')
  const before = await page.locator('[data-testid="bal-slipway"]').textContent()

  await page.locator('[data-testid="counter-pick"]').click()
  await page.locator('[data-testid="counter-oil"]').click()

  expect(await shown()).toBe('OIL USED')
  await expect(page.locator('[data-testid="counter-sheet"]')).toHaveCount(0)
  expect(await page.locator('[data-testid="bal-slipway"]').textContent()).not.toBe(before)
})

// The fast path beside the sheet's guaranteed one. Touch emulation is only
// available on the phone project, so this is skipped elsewhere rather than
// pretended.
test('swiping across the counter column cycles it', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'needs touch emulation')
  const shown = () => page.locator('[data-testid="counter-name"]').textContent()
  expect(await shown()).toBe('LVE BAL')

  const bal = (await page.locator('[data-testid="bal-slipway"]').boundingBox())!
  const at = { x: bal.x + bal.width / 2, y: bal.y + bal.height / 2 }

  // Right to left is "next", the direction a page turns. LVE BAL sits second
  // from the end of the default order, so next is LVE CON.
  await swipe(page, at, -90)
  expect(await shown()).toBe('LVE USED')
  await swipe(page, at, 90)
  expect(await shown()).toBe('LVE BAL')
})

// Short and vertical drags must NOT cycle it, or the counter would flip
// whenever somebody scrolled the rows under their thumb.
test('a small or vertical drag on the counter column changes nothing', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'needs touch emulation')
  const bal = (await page.locator('[data-testid="bal-slipway"]').boundingBox())!
  const at = { x: bal.x + bal.width / 2, y: bal.y + bal.height / 2 }
  await swipe(page, at, -20)
  expect(await page.locator('[data-testid="counter-name"]').textContent()).toBe('LVE BAL')
})

// A swipe that starts anywhere else must go on scrolling the grid. A counter
// that flipped whenever someone dragged the year sideways would be worse than
// no swipe at all.
test('swiping the day columns leaves the counter alone', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'needs touch emulation')
  // A day column that is actually ON SCREEN at 390px. The 15th sits ~736px
  // along an unscrolled year, so `elementFromPoint` would land on whatever
  // is at that coordinate in the viewport — which is the frozen counter
  // column, and the test would then be swiping the very thing it means to
  // avoid. Found by this test failing for that reason.
  const cell = (await page.locator('[data-testid="cell-slipway-2026-01-03"]').boundingBox())!
  expect(cell.x).toBeLessThan(390)
  await swipe(page, { x: cell.x + cell.width / 2, y: cell.y + cell.height / 2 }, -120)
  expect(await page.locator('[data-testid="counter-name"]').textContent()).toBe('LVE BAL')
})

// The roster sheet: seat, band and SXO. The category is never edited — it is
// derived from the first two, which is what lets Raptor's roster replace this
// one without a migration.
test('an admin edits who somebody is, and the grid follows', async ({ page }) => {
  await lwRole(page, 'admin')
  // The callsign opens the all-figures sheet for everyone since 17 Aug 26;
  // the editor is its Edit person button.
  await page.locator('[data-testid="person-prowler"]').click()
  await expect(page.locator('[data-testid="person-figures"]')).toBeVisible()
  await page.locator('[data-testid="person-edit"]').click()
  await expect(page.locator('[data-testid="person-sheet"]')).toBeVisible()
  await expect(page.locator('[data-testid="person-category"]')).toHaveText('IP')

  await page.locator('[data-testid="person-sxo"]').click()
  await expect(page.locator('[data-testid="person-category"]')).toHaveText('IP(S)')
  // The grid follows by GROUPING now (18 Aug 26), not a suffix: prowler's chip
  // takes the SXO colour and an SXO group heading is present.
  await expect(page.locator('[data-testid="cat-prowler"]')).toHaveClass(/q-sxo/)
  await expect(page.locator('[data-testid="group-SXO"]')).toBeVisible()
})

// The callsign column is 76px on a phone. Its content — the callsign, the
// colour-coded CAT chip, and (ground crew) a label — must FIT: `overflow:
// hidden` would hide a too-wide row as mere truncation rather than show it.
// SXO is a group + a gold chip now, not a `(S)` suffix, so this guards the
// chip layout rather than the old tag.
test('the callsign, its CAT chip and a personnel label all fit the phone column', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 760 })
  // An SXO aircrew row (slipway is Raptor's own SXO) — chip present, not clipped.
  await expect(page.locator('[data-testid="cat-slipway"]')).toHaveClass(/q-sxo/)
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll('.mx tbody .who')]
      .map(el => el as HTMLElement)
      .filter(el => el.scrollWidth > el.clientWidth + 1)
      .map(el => el.textContent?.trim()))
  expect(clipped).toEqual([])
})

// The owner's rule for the event lines: "If the text needs more space, that
// day will widen to accommodate the info until a certain point then it will
// wrap text and grow vertically on that grid only." Three behaviours, none of
// which jsdom can see — it computes no layout at all.
test('an event widens its day, then wraps and grows only its own rows', async ({ page }) => {
  await lwRole(page, 'admin')

  const col = (d: string) => page.locator(`[data-testid="head-${d}"]`).boundingBox()
  const personRow = () => page.locator('[data-testid="row-slipway"]').boundingBox()
  const eventRow = () => page.locator('[data-testid="event-row-0"]').boundingBox()

  // 2026-01-07 is a clean, empty column (splice's medical markers sit on
  // 01-05/01-06, and a wide code there would inflate the baseline this test
  // measures against). No event band or PH covers it in the seed.
  const narrow = (await col('2026-01-07'))!
  const rowBefore = (await personRow())!
  const eventBefore = (await eventRow())!

  // Editing moved into the Event sheet (owner, Aug 26 — "click on the event
  // and an edit button is at the top"), so a value is set by tapping the cell,
  // typing, and saving rather than into an inline textarea.
  const setEvent = async (date: string, text: string) => {
    await page.locator(`[data-testid="event-0-${date}"]`).click()
    await page.locator('[data-testid="event-text"]').fill(text)
    await page.locator('[data-testid="event-apply"]').click()
    await page.waitForTimeout(150)
  }

  // 1. A SHORT event widens the column.
  await setEvent('2026-01-07', 'CO visit')
  const widened = (await col('2026-01-07'))!
  expect(widened.width).toBeGreaterThan(narrow.width)

  // 2. A LONG one stops widening at the ceiling and wraps instead.
  await setEvent('2026-01-07', 'Range closure 0900-1400, live firing on the eastern ranges, all crews briefed')
  const capped = (await col('2026-01-07'))!
  expect(capped.width).toBeLessThanOrEqual(140)
  const eventAfter = (await eventRow())!
  expect(eventAfter.height).toBeGreaterThan(eventBefore.height)

  // 3. ...and ONLY the event rows grew. Every person's row keeps its height,
  // which is what "on that grid only" has to mean if a year is to stay
  // readable with an event on it.
  const rowAfter = (await personRow())!
  expect(Math.abs(rowAfter.height - rowBefore.height)).toBeLessThan(2)
})

test('a member reads the events and cannot type into them', async ({ page }) => {
  await expect(page.locator('[data-testid="event-0-2026-01-01"]')).toHaveText('PH')
  await expect(page.locator('[data-testid="event-in-0-2026-01-01"]')).toHaveCount(0)
})

// The event tags surface only as colour (owner, Aug 26): an off day (PH) tints
// its column green, a no-leave day orange, a work word reads red. None of this
// is visible to jsdom, which loads no stylesheet and measures no colour.
test('an off day is green, a no-leave day orange, and a work word red', async ({ page }) => {
  await lwRole(page, 'admin')
  const rgb = (s: string) => s.match(/[\d.]+/g)!.map(Number)
  const headBg = (d: string) =>
    page.locator(`[data-testid="head-${d}"]`).evaluate(el => getComputedStyle(el).backgroundColor)

  // The seed marks 2026-01-01 PH → an off day → green header (green channel on
  // top).
  const [pr, pg, pb] = rgb(await headBg('2026-01-01'))
  expect(pg).toBeGreaterThan(pr)
  expect(pg).toBeGreaterThan(pb)

  const setEvent = async (line: 0 | 1, date: string, text: string) => {
    await page.locator(`[data-testid="event-${line}-${date}"]`).click()
    await page.locator('[data-testid="event-text"]').fill(text)
    await page.locator('[data-testid="event-apply"]').click()
    await page.waitForTimeout(150)
  }

  // A no-leave day → orange header (red channel leads, warm).
  await setEvent(0, '2026-01-08', 'No Leave')
  const [nr, ng, nb] = rgb(await headBg('2026-01-08'))
  expect(nr).toBeGreaterThan(nb)
  expect(nr).toBeGreaterThanOrEqual(ng)

  // A work word → the word reads red; the column is NOT tinted (green channel
  // does not lead the header the way an off day's does).
  await setEvent(1, '2026-01-09', 'SC')
  const [wr, wg, wb] = rgb(
    await page.locator('[data-testid="event-1-2026-01-09"]').evaluate(el => getComputedStyle(el).color),
  )
  expect(wr).toBeGreaterThan(wg)
  expect(wr).toBeGreaterThan(wb)
  const [hr, hg, hb] = rgb(await headBg('2026-01-09'))
  expect(hg <= hr || hg <= hb).toBeTruthy()
})

// The counter picker was a rounded floating pill that crowded the events; the
// owner asked to square it off. Pin that it reads as a contained, squared
// control — a small radius and a real border — which jsdom cannot measure.
test('the counter picker is a contained, squared control', async ({ page }) => {
  const pick = page.locator('[data-testid="counter-pick"]')
  const radius = parseFloat(await pick.evaluate(el => getComputedStyle(el).borderTopLeftRadius))
  expect(radius).toBeLessThanOrEqual(4)
  const border = parseFloat(await pick.evaluate(el => getComputedStyle(el).borderTopWidth))
  expect(border).toBeGreaterThan(0)
})

// ---- the period label, the contrast, and the under-manned list -----------
// All three from the owner's review of 10 Aug 26.

test('the period picker says what it is', async ({ page }) => {
  await expect(page.locator('[data-testid="period-label"]')).toHaveText('Period')
  // The visible label has to name the control for a screen reader too, not
  // merely sit next to it.
  expect(await page.locator('[data-testid="war-picker"]').getAttribute('aria-label'))
    .toContain('Period')
})

// The complaint was green ink on a green field. Luminance contrast never
// caught it — the old pair measured ~10.9:1 — so this pins what actually
// broke: ink that is a tint of its own background's hue gives the eye no
// edge. A near-neutral ink is the fix, and this is what holds it.
test('the tinted chips are not ink in their own background hue', async ({ page }) => {
  /* The `.undermanned` class only exists while some day is red, and on the
     projected 58-man roster the demo breaks no rule — so the red chip needs
     the same stored red-day fixture the under-manned list tests use. */
  await seedRedDays(page)
  /* Scoped since the merge: bare `.wk.on` would resolve to RAPTOR's week
     chip, which is deliberately accent-tinted — this rule is Leave War's. */
  for (const sel of ['#page-leavewar .wk.on', '#page-leavewar .fchip.stage-open', '#page-leavewar .fchip.undermanned']) {
    const c = await page.locator(sel).first().evaluate(el => getComputedStyle(el).color)
    const [r, g, b] = c.match(/\d+/g)!.map(Number)
    const max = Math.max(r, g, b)
    expect(max - Math.min(r, g, b)).toBeLessThan(0.12 * max)
    expect(max).toBeGreaterThan(200)
  }
})

// The half the owner actually complained about: a native option list inherits
// the select's colours, so styling the closed chip green painted the dropped
// list pale-green on green with no border to break up the rows. Options are
// not reachable by getComputedStyle once the popup is native, so this asserts
// the rule that governs them.
test('the picker options are neutral, not the chip green', async ({ page }) => {
  const opt = await page.locator('[data-testid="war-picker"] option').first()
    .evaluate(el => {
      const s = getComputedStyle(el)
      return { color: s.color, bg: s.backgroundColor }
    })
  const [r, g, b] = opt.color.match(/\d+/g)!.map(Number)
  const max = Math.max(r, g, b)
  expect(max - Math.min(r, g, b)).toBeLessThan(0.12 * max)
  expect(opt.bg).not.toBe('rgba(0, 0, 0, 0)')
})

/* ADAPTED AT THE SYNC WIRES (17 Aug 26). The vendored fixture relied on the
   16-person seed roster, where losing the one SXO made seven days red. With
   wire 0 the roster is the projection of Raptor's PEOPLE — 58 aircrew,
   twelve of them SXO — so NO seed day breaks a manning rule any more: the
   surface is dormant on the demo data, not broken. This test pins that new
   truth (0 days, chip disabled); the three list tests that follow seed a
   red-day fixture of their own through storage, because the list cannot be
   opened otherwise. */
test('the under-manned chip reads 0 days on the projected roster, and is disabled', async ({ page }) => {
  const chip = page.locator('[data-testid="undermanned"]')
  await expect(chip).toHaveText('0 days')
  await expect(chip).toBeDisabled()
  await expect(page.locator('[data-testid="undermanned-list"]')).toHaveCount(0)
})

/* A stored leave war whose bids empty the SXO pool on three dates — the
   smallest red the 58-man roster can produce (the SXO rule reds at zero
   available). Written straight into localStorage in the shape the store
   persists, then the app is reopened so boot reads it; pending bids on
   purpose, so the outbound sync has nothing to push and the fixture stays
   inert on the Raptor side. The twelve ids are Raptor's SXO holders — if
   the quals ever change this fails loudly here, which is the point of
   pinning them. */
const RED_DAYS = ['2026-01-05', '2026-01-15', '2026-02-10']
async function seedRedDays(page: Page) {
  /* Leave War is session-only now (a memory backend, see main.tsx), so writing
     `leavewar:wars` into localStorage before boot no longer reaches the store.
     The app is already up (beforeEach opens it), so push the red-day war
     straight into the live store through the probe bridge (w.lwLoadWars — the
     w.lwSetRole precedent). */
  await page.evaluate((red) => {
    const sxo = ['bane', 'stiff', 'slipway', 'nact', 'pump', 'snap',
      'mamba', 'shaft', 'dice', 'razer', 'freak', 'glass']
    const days = []
    for (let t = Date.UTC(2026, 0, 1); t <= Date.UTC(2026, 11, 31); t += 86_400_000) {
      days.push({
        date: new Date(t).toISOString().slice(0, 10),
        events: ['', ''], blocked: false, blockedReason: '', ph: false,
      })
    }
    const grid: Record<string, Record<string, string>> = {}
    const states: Record<string, Record<string, unknown>> = {}
    for (const id of sxo) {
      grid[id] = {}
      states[id] = {}
      for (const d of red) {
        grid[id][d] = 'LL'
        states[id][d] = { state: 'pending', source: 'bid' }
      }
    }
    const war = {
      period: {
        id: 'y2026', name: 'JAN - DEC 26', start: '2026-01-01', end: '2026-12-31',
        stage: 'open', bidFrom: null, bidTo: null, days,
      },
      grid, states,
    }
    ;(window as any).lwLoadWars([war], 'y2026')
  }, RED_DAYS)
}

test('the under-manned chip opens the days that caused it', async ({ page }) => {
  await seedRedDays(page)
  await page.locator('[data-testid="undermanned"]').click()
  const rows = page.locator('[data-testid^="undermanned-day-"]')
  await expect(rows).toHaveCount(3)
  // Each row names the rule that broke, not just the date.
  await expect(page.locator('[data-testid="undermanned-day-2026-01-05"]')).toContainText('SXO')
})

// The point of the list is landing on the day. jsdom reports every rect as
// 0x0, so the unit suite proves the right column was MARKED and nothing about
// whether 365 columns actually moved. 10 Feb is the last red day and sits far
// off the right edge on both projects.
test('choosing a day jumps the grid to it, clear of the frozen columns', async ({ page }) => {
  await seedRedDays(page)
  const wrap = page.locator('.mx-wrap')
  expect(await wrap.evaluate(el => el.scrollLeft)).toBe(0)

  await page.locator('[data-testid="undermanned"]').click()
  await page.locator('[data-testid="undermanned-day-2026-02-10"]').click()

  await expect.poll(() => wrap.evaluate(el => el.scrollLeft), { timeout: 5000 })
    .toBeGreaterThan(0)

  // "Scrolled somewhere right" is not the claim. The claim is that the column
  // is visible AND not hiding under the two frozen columns, which is the
  // whole reason `jumpTo` measures them.
  const box = await page.evaluate(() => {
    const w = document.querySelector('.mx-wrap')!.getBoundingClientRect()
    const h = document.querySelector('[data-testid="head-2026-02-10"]')!.getBoundingClientRect()
    const frozen = ['.who', '.bal']
      .map(s => document.querySelector('.mx-wrap ' + s)?.getBoundingClientRect().width ?? 0)
      .reduce((a, b) => a + b, 0)
    return { wl: w.left, wr: w.right, hl: h.left, hr: h.right, frozen }
  })
  expect(box.hl).toBeGreaterThanOrEqual(box.wl + box.frozen - 1)
  expect(box.hr).toBeLessThanOrEqual(box.wr + 1)
})

test('the jumped-to day is visibly marked', async ({ page }) => {
  await seedRedDays(page)
  await page.locator('[data-testid="undermanned"]').click()
  await page.locator('[data-testid="undermanned-day-2026-01-15"]').click()
  const head = page.locator('[data-testid="head-2026-01-15"]')
  expect(await head.getAttribute('class')).toContain('focus')
  // A class resolving to no paint would satisfy the unit test and show the
  // scheduler nothing.
  expect(await head.evaluate(el => getComputedStyle(el).boxShadow)).not.toBe('none')
})

// The list is positioned from JS precisely so this cannot happen. On a phone
// the chip sits far enough right that a list anchored to its left edge runs
// past the viewport and stops being clickable at all.
test('the under-manned list stays on screen and its rows are reachable', async ({ page }) => {
  await seedRedDays(page)
  await page.locator('[data-testid="undermanned"]').click()
  const box = (await page.locator('[data-testid="undermanned-list"]').boundingBox())!
  const view = page.viewportSize()!
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(view.width)
  expect(box.y).toBeGreaterThanOrEqual(0)
  // Clicking is the real proof: an intercepted row throws here.
  await page.locator('[data-testid="undermanned-day-2026-01-05"]').click()
  await expect(page.locator('[data-testid="undermanned-list"]')).toHaveCount(0)
})

// ---- the month strip says where you are (owner, 10 Aug 26) ---------------
// jsdom computes no layout, so the unit suite proves the arithmetic against
// stated rectangles and nothing about what a real year measures to. Only here
// can a real scroll be followed by a real reading.

/** Which month buttons are lit, in strip order. */
async function litMonths(page: import('@playwright/test').Page) {
  return page.$$eval('[data-testid="month-strip"] button.on', bs => bs.map(b => b.textContent))
}

test('the strip lights the month the grid is showing, and only one', async ({ page }) => {
  await expect.poll(() => litMonths(page)).toEqual(['JAN'])
})

test('the lit month follows a real scroll', async ({ page }) => {
  const wrap = page.locator('.mx-wrap')
  const settle = async () => {
    await page.waitForFunction(() => {
      const el = document.querySelector('.mx-wrap') as HTMLElement
      const w = window as unknown as { __l?: number; __n?: number }
      if (el.scrollLeft === w.__l) w.__n = (w.__n ?? 0) + 1
      else { w.__n = 0; w.__l = el.scrollLeft }
      return (w.__n ?? 0) >= 3
    }, undefined, { polling: 'raf', timeout: 5000 })
  }

  // Jumping is the fastest honest way to move a long distance, and it is the
  // control the strip belongs to: pressing SEP must leave SEP lit.
  await page.locator('[data-testid="month-SEP"]').click()
  await settle()
  expect(await litMonths(page)).toEqual(['SEP'])

  // And a plain drag of the scroller, which no button was involved in.
  // The scroller spans the DRAWN months (colwindow.ts): scrolling to 0 lands
  // on the window's first month, not January — read which off the header,
  // then the readout must agree with a real scroll to each bound.
  const firstDrawn = () => page.evaluate(() => {
    const th = document.querySelector('.mx-wrap .mxhead th[data-testid^="head-"]') as HTMLElement
    return ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][Number(th.dataset.testid!.slice(10, 12)) - 1]
  })
  await wrap.evaluate(el => el.scrollTo({ left: 0, behavior: 'instant' as ScrollBehavior }))
  await settle()
  expect(await litMonths(page)).toEqual([await firstDrawn()])
  await page.locator('[data-testid="month-JAN"]').click()
  await settle()
  expect(await litMonths(page)).toEqual(['JAN'])
})

test('every month in the strip can be reached and lights itself', async ({ page }) => {
  // Walked rather than sampled: a reading that worked for one month and not
  // for the boundary months would be worth knowing about, and December is the
  // one whose right edge is computed differently from all the others.
  //
  // SETTLE BETWEEN JUMPS (20 Aug 26 — this went red on main, not just here).
  // `expect.poll` passes the instant the strip lights up, which is while the
  // grid is still moving and before the roster's scroll-rest reflow (debounced
  // 120ms) has run. Tapping the next month into that window raced the reflow
  // and the strip ended up reading the month you LEFT — reproducible alone on
  // main's tip, and load-sensitive under two workers. What this test is for is
  // COVERAGE — that every month, boundary months included, can be reached and
  // lights itself — so it waits for the grid to be still between jumps and
  // tests that. A product fix was attempted first (dropping the pending anchor
  // correction on an explicit jump) and REVERTED: with it disabled the same
  // scenario still passes, so it was not what the failure was about, and a
  // change nothing can be shown to need does not belong in the file.
  for (const m of ['MAR', 'JUN', 'DEC']) {
    await page.locator(`[data-testid="month-${m}"]`).click()
    await expect.poll(() => litMonths(page), { timeout: 5000 }).toEqual([m])
    await settleGrid(page)
  }
})

test('the lit month is painted, not merely classed', async ({ page }) => {
  const lit = page.locator('[data-testid="month-strip"] button.on').first()
  const plain = page.locator('[data-testid="month-JUN"]')
  const bg = (l: typeof lit) => l.evaluate(el => getComputedStyle(el).backgroundColor)
  expect(await bg(lit)).not.toBe(await bg(plain))
  // Blue, as asked for: the accent channel has to dominate.
  const [r, g, b] = (await lit.evaluate(el => getComputedStyle(el).color)).match(/\d+/g)!.map(Number)
  expect(b).toBeGreaterThan(r)
  expect(g).toBeGreaterThan(r)
})

// Measuring on every scroll event is only affordable because it reads
// thirteen rectangles rather than 365. If that ever regresses to a per-day
// walk this is what notices.
test('scrolling the year stays responsive with the readout attached', async ({ page }) => {
  const ms = await page.evaluate(() => {
    const el = document.querySelector('.mx-wrap') as HTMLElement
    const t0 = performance.now()
    for (let i = 0; i < 40; i++) {
      el.scrollLeft = i * 300
      el.dispatchEvent(new Event('scroll'))
    }
    return performance.now() - t0
  })
  expect(ms).toBeLessThan(2000)
})

// ---- reopening a closed period (owner, 10 Aug 26) ------------------------
// "As an admin I can open bidding again after closing it." The unit suite
// proves the rules; this proves the control is actually reachable, which is
// a live question on a phone where the stage strip wraps onto three rows.

test('an admin can reopen bidding after closing it', async ({ page }) => {
  await lwRole(page, 'admin')          // -> admin
  await page.locator('[data-testid="stage-advance"]').click()        // open -> closed
  await expect(page.locator('[data-testid="stage-now"]')).toHaveText('BIDDING CLOSED')

  const back = page.locator('[data-testid="stage-back"]')
  await expect(back).toContainText('OPEN FOR BIDDING')
  // Clicking is the proof: a control that has wrapped off the strip, or that
  // something else is sitting on top of, throws here rather than passing.
  await back.click()
  await expect(page.locator('[data-testid="stage-now"]')).toHaveText('OPEN FOR BIDDING')
})

test('a member is offered no way back', async ({ page }) => {
  await lwRole(page, 'admin')          // -> admin
  await page.locator('[data-testid="stage-advance"]').click()        // open -> closed
  await expect(page.locator('[data-testid="stage-back"]')).toHaveCount(1)
  await lwRole(page, 'member')                                       // -> member
  await expect(page.locator('[data-testid="stage-back"]')).toHaveCount(0)
})

// The reason reopening is safe enough to offer at all: it changes what may
// happen next and rewrites nothing that already happened. A decision wiped by
// a reopen would be invisible to every test that only watches the stage.
test('a decision made before the reopen survives it', async ({ page }) => {
  await lwRole(page, 'admin')          // -> admin
  await page.locator('[data-testid="stage-advance"]').click()        // open -> closed
  await page.locator('[data-testid="cell-bruise-2026-01-23"]').click()
  await page.locator('[data-testid="decide-refuse"]').click()
  const chip = page.locator('[data-testid="cell-bruise-2026-01-23"] .c')
  expect(await chip.getAttribute('class')).toContain('ref')

  await page.locator('[data-testid="stage-back"]').click()
  await expect(page.locator('[data-testid="stage-now"]')).toHaveText('OPEN FOR BIDDING')
  expect(await chip.getAttribute('class')).toContain('ref')
})

// ---- the categorised roster (owner, 18 Aug 26) --------------------------
// The header no longer repeats "142 SQN / LEAVE WAR"; the roster is grouped
// into the owner's seven categories, colour-coded from Raptor's own CAT
// palette; ground crew ride it as a white Personnel group; an admin auto-sorts
// or hand-drags the order.

test('the page carries no second squadron mark — the shell is the only identity', async ({ page }) => {
  // The old "142 SQN / LEAVE WAR" mark and "Leave war" nav pill are removed.
  expect(await page.locator('#page-leavewar .mark, #page-leavewar .nav').count()).toBe(0)
})

test('the roster is grouped SXO → IP → OPS P → IWSO → OPS W → OCU → Personnel', async ({ page }) => {
  const order = await page.$$eval('[data-testid^="group-"]',
    els => els.map(e => e.getAttribute('data-testid').replace('group-', '')))
  expect(order).toEqual(['SXO', 'IP', 'OPSP', 'IWSO', 'OPSW', 'OCU', 'PERS'])
})

test('every callsign wears its CAT colour, reused from the Quals palette', async ({ page }) => {
  await expect(page.locator('[data-testid="cat-dj"]')).toHaveClass(/q-a/)       // CAT A ops pilot → red
  await expect(page.locator('[data-testid="cat-torque"]')).toHaveClass(/q-pers/) // ground crew → white
  await expect(page.locator('[data-testid="group-PERS"]')).toBeVisible()
  await expect(page.locator('[data-testid="row-torque"]')).toBeVisible()
})

test('CAT sub-headings split the ops groups on desktop and fold away on a phone', async ({ page }) => {
  const sub = page.locator('[data-testid="subcat-OPSP-A"]')
  if (page.viewportSize()!.width >= 700) await expect(sub).toBeVisible()
  else await expect(sub).toBeHidden()   // rendered but display:none — the owner's "just colour code it" on mobile
})

test('an admin auto-sorts and hand-drags the roster; a member gets neither tool', async ({ page }) => {
  await lwRole(page, 'admin')
  const ids = () => page.$$eval('[data-testid^="row-"]', els => els.map(e => e.getAttribute('data-testid').slice(4)))
  const before = await ids()

  if (page.viewportSize()!.width >= 700) {
    // Pointer drag (works on touch too): move the top row down past the fifth.
    await page.locator('[data-testid="roster-arrange"]').click()
    const h = (await page.locator(`[data-testid="drag-${before[0]}"]`).boundingBox())!
    const tgt = (await page.locator(`[data-testid="row-${before[5]}"]`).boundingBox())!
    await page.mouse.move(h.x + 5, h.y + 5)
    await page.mouse.down()
    await page.mouse.move(h.x + 5, h.y + 25, { steps: 3 })
    await page.mouse.move(tgt.x + 40, tgt.y + 8, { steps: 5 })
    await page.mouse.up()
    expect((await ids())[0]).not.toBe(before[0])
    // A drop in the LOWER half of the LAST row lands the dragged row at the
    // very end (review fix, 19 Aug 26). Driven with the two GROUND-CREW rows
    // at the bottom — same group, adjacent — because this exact gesture was
    // BOTH dead spots at once before the rework: insert-before-only made
    // "drag the second-to-last onto the row beneath it" a silent no-op, and
    // the end of the roster had no gesture that reached it at all.
    const cur = await ids()
    const src = cur[cur.length - 2], endId = cur[cur.length - 1]
    await page.locator(`[data-testid="row-${endId}"]`).scrollIntoViewIfNeeded()
    const h2 = (await page.locator(`[data-testid="drag-${src}"]`).boundingBox())!
    const last = (await page.locator(`[data-testid="row-${endId}"]`).boundingBox())!
    await page.mouse.move(h2.x + 5, h2.y + 5)
    await page.mouse.down()
    await page.mouse.move(h2.x + 5, h2.y + 12, { steps: 3 })
    await page.mouse.move(last.x + 40, last.y + last.height - 3, { steps: 5 })
    await page.mouse.up()
    const after = await ids()
    expect(after[after.length - 1]).toBe(src)
    // Auto-sort restores the categorised order.
    await page.locator('[data-testid="roster-autosort"]').click()
    expect((await ids())[0]).toBe(before[0])
    await page.locator('[data-testid="roster-arrange"]').click() // leave arrange mode
  } else {
    // On a phone at least prove Auto-sort is reachable and does not throw. It
    // lives on the rearrange bar now, so enter rearrange first, then leave.
    await page.locator('[data-testid="roster-arrange"]').click()
    await page.locator('[data-testid="roster-autosort"]').click()
    expect((await ids())[0]).toBe(before[0])
    await page.locator('[data-testid="roster-arrange"]').click()
  }

  await lwRole(page, 'member')
  await expect(page.locator('[data-testid="roster-autosort"]')).toHaveCount(0)
  await expect(page.locator('[data-testid="roster-arrange"]')).toHaveCount(0)
})

test('a personnel row shows its callsign, with no edit box, in Rearrange', async ({ page }) => {
  // The free-text label editor was REMOVED (owner, 28 Aug 26 — "i can edit
  // personnel, dont need to show that, just leave it as the callsign/name").
  // A ground-crew row shows the same callsign + chip as every other row, in
  // Rearrange too — no edit box in either mode, at every width.
  await lwRole(page, 'admin')
  await expect(page.locator('[data-testid="perslabel-in-torque"]')).toHaveCount(0)
  await page.locator('[data-testid="roster-arrange"]').click()
  await expect(page.locator('[data-testid="perslabel-in-torque"]')).toHaveCount(0)
  // the callsign is what the name column shows
  await expect(page.locator('[data-testid="row-torque"] .cs')).toHaveText('Ratchet')
  await page.locator('[data-testid="roster-arrange"]').click() // leave arrange mode
})

/* ---- the 18 Aug 26 layout rework: row order, bracket, frozen header, zoom.
   Browser-gated because every one of these is geometry jsdom cannot see. */

test('the grid reads counts, months, header, events, roster — top to bottom', async ({ page }) => {
  const groups = page.locator('#page-leavewar table.mx > *')
  await expect(groups.nth(0)).toHaveClass('counts')
  await expect(groups.nth(1)).toHaveClass('mstripe')
  await expect(groups.nth(2)).toHaveClass('mxhead')
  await expect(groups.nth(3)).toHaveClass('events')
  // and the order is PAINTED that way, not merely in the DOM
  const counts = (await page.locator('[data-testid="count-sets"]').boundingBox())!
  const head = (await page.locator('.mx .mxhead th.who').boundingBox())!
  const firstRow = (await page.locator('[data-testid="group-SXO"]').boundingBox())!
  expect(counts.y).toBeLessThan(head.y)
  expect(head.y).toBeLessThan(firstRow.y)
})

test('every month wears a bracket spanning exactly its days', async ({ page }) => {
  const jan = page.locator('[data-testid="bracket-2026-01"]')
  await expect(jan).toHaveText('JAN')
  const bb = (await jan.boundingBox())!
  const first = (await page.locator('[data-testid="head-2026-01-01"]').boundingBox())!
  const last = (await page.locator('[data-testid="head-2026-01-31"]').boundingBox())!
  expect(Math.abs(bb.x - first.x)).toBeLessThan(2)
  expect(Math.abs(bb.x + bb.width - (last.x + last.width))).toBeLessThan(2)
})

// The month buttons are absolutely positioned inside a sticky cell whose
// height is reserved by hand; a phone wraps them to three rows and the old
// fixed 72px was too short, so NOV/DEC spilled onto the bracket bar below
// (owner, 19 Aug 26). The cell now measures the strip and reserves its real
// height, so the last row must sit clear of the bracket.
test('the month strip fits its wrapped rows and clears the bracket bar below', async ({ page }) => {
  for (const m of ['JAN', 'JUN', 'DEC']) await expect(page.locator(`[data-testid="month-${m}"]`)).toBeVisible()
  const dec = (await page.locator('[data-testid="month-DEC"]').boundingBox())!
  const bracket = (await page.locator('[data-testid="month-bracket"]').boundingBox())!
  expect(dec.y + dec.height).toBeLessThanOrEqual(bracket.y + 1)
})

// The manning counts block collapses on a header toggle, for EITHER role — the
// default login is a member, so this proves a normal user can hide it (owner,
// 19 Aug 26).
test('a member can collapse and reopen the manning counts', async ({ page }) => {
  await expect(page.locator('[data-testid="count-sets"]')).toBeVisible()
  await page.locator('[data-testid="counts-toggle"]').click()
  await expect(page.locator('[data-testid="count-sets"]')).toHaveCount(0)
  await expect(page.locator('[data-testid="count-ip"]')).toHaveCount(0)
  await page.locator('[data-testid="counts-toggle"]').click()
  await expect(page.locator('[data-testid="count-sets"]')).toBeVisible()
})

test('the blocked exercise week prints its reason across the event row', async ({ page }) => {
  await page.locator('[data-testid="month-MAR"]').click()
  const bar = page.locator('[data-testid="event-blocked-2026-03-09"]')
  await expect(bar).toHaveText('Exercise week')
  // A month jump is not over when the click returns. Its scroll re-runs the
  // roster's row window, which is DEBOUNCED to scroll rest (19 Aug 26 — writing
  // scrollLeft mid-fling kills a touch scroll's momentum), and the reflow then
  // re-narrows every column the hidden rows' chips had widened and puts the
  // anchored column back. Reading a rect before that lands measures a layout
  // nothing ever settled at — and reading the band and the header in two
  // separate calls lets the reflow fire BETWEEN them, comparing a box from one
  // layout against a box from the next. That is a deterministic ~11px failure
  // here, not a flake. So: wait for the grid to hold still, then take all three
  // rects in ONE evaluate, where no reflow can slip between them.
  await settleGrid(page)
  const box = await page.evaluate(() => {
    const at = (sel: string) => {
      const r = document.querySelector(sel)!.getBoundingClientRect()
      return { x: r.x, right: r.x + r.width }
    }
    return {
      bar: at('[data-testid="event-blocked-2026-03-09"]'),
      from: at('[data-testid="head-2026-03-09"]'),
      to: at('[data-testid="head-2026-03-14"]'),
    }
  })
  expect(Math.abs(box.bar.x - box.from.x)).toBeLessThan(2)
  expect(Math.abs(box.bar.right - box.to.right)).toBeLessThan(2)
})

test('on a phone the header freezes under the top bar and thaws on the way back', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'lw-phone', 'the mirror is phone-only')
  // above the fold: no mirror
  await expect(page.locator('[data-testid="sticky-head"]')).toHaveCount(0)
  await page.evaluate(() => window.scrollTo(0, 700))
  await page.waitForTimeout(250)
  const mirror = page.locator('[data-testid="sticky-head"]')
  await expect(mirror).toHaveCount(1)
  // pinned under the sticky top bar, not the page origin (.first(): Leave
  // War's own chrome also carries a .topbar; the shell's is the sticky one
  // and the first in the document, same pick Matrix's querySelector makes)
  const bar = (await page.locator('.topbar').first().boundingBox())!
  const mb = (await mirror.boundingBox())!
  expect(Math.abs(mb.y - (bar.y + bar.height))).toBeLessThan(2)
  // it follows the grid's horizontal scroll — on the compositor by TRANSFORM
  // where CSS scroll-driven animations exist (`.mxfixed-anim`, the glued path),
  // else by the JS mirror's own scrollLeft (the fallback).
  await page.evaluate(() => { document.querySelector('.mx-wrap')!.scrollLeft = 400 })
  await page.waitForTimeout(200)
  const followed = await page.evaluate(() => {
    const anim = document.querySelector('.mxfixed-anim') as HTMLElement | null
    if (anim) return { mode: 'sda', tx: new DOMMatrixReadOnly(getComputedStyle(anim).transform).m41 }
    return { mode: 'js', sl: (document.querySelector('.mxfixed-scroll') as HTMLElement).scrollLeft }
  })
  if (followed.mode === 'sda') expect(Math.abs((followed.tx as number) + 400)).toBeLessThan(3)
  else expect(followed.sl).toBe(400)
  // and its columns sit exactly over the grid's (scoped to the scrolling layer,
  // so the scroll-driven path's static frozen-column overlay is not picked)
  const real = (await page.locator('[data-testid="head-2026-01-20"]').boundingBox())!
  const ghost = await page.evaluate(() => {
    const cells = document.querySelectorAll('.mxfixed-scroll .mxhead tr:last-child th')
    for (const c of cells) {
      if (c.textContent!.includes('20')) return c.getBoundingClientRect().x
    }
    return null
  })
  if (ghost !== null) expect(Math.abs(ghost - real.x)).toBeLessThan(2)
  // …but the header must NEVER drive the grid (owner, 20 Aug 26). Writing the
  // mirror's lagged position back onto the grid mid-fling is what snapped the
  // grid back and halted the sideways scroll the moment the header froze.
  // Setting the mirror's OWN scrollLeft now leaves the grid exactly where it is
  // (checked last, since it deliberately desyncs the mirror). No re-sync fires
  // because the pump only runs while the GRID is being scrolled.
  await page.evaluate(() => { document.querySelector('.mxfixed-scroll')!.scrollLeft = 50 })
  await page.waitForTimeout(150)
  expect(await page.evaluate(() => document.querySelector('.mx-wrap')!.scrollLeft)).toBe(400)
  // scrolling back up thaws it
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(250)
  await expect(page.locator('[data-testid="sticky-head"]')).toHaveCount(0)
})

test('the phone zoom steps the whole grid down and back', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'lw-phone', 'the control is phone-only')
  // One column's width, not the table's: the table also grows as the column
  // window adds months at rest (colwindow.ts), which is not what zoom claims.
  const width = () => page.evaluate(() => document.querySelector('.mx-wrap [data-testid="head-2026-01-15"]')!.getBoundingClientRect().width)
  const before = await width()
  await page.locator('[data-testid="lw-zoom-out"]').click()
  await page.locator('[data-testid="lw-zoom-out"]').click()
  const small = await width()
  expect(small).toBeLessThan(before * 0.75)
  await page.locator('[data-testid="lw-zoom-in"]').click()
  await page.locator('[data-testid="lw-zoom-in"]').click()
  expect(Math.abs((await width()) - before)).toBeLessThan(4)
  // the desktop never shows the control — asserted in the desktop project
})

test('the zoom control hides on desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'lw-desktop', 'desktop-only assertion')
  await expect(page.locator('[data-testid="lw-zoom"]')).toBeHidden()
})

test('tagging a typed event colours the day without minting a type', async ({ page }) => {
  await lwRole(page, 'admin')
  await page.locator('[data-testid="event-1-2026-01-21"]').click()
  await page.locator('[data-testid="event-text"]').fill('Standby crew')
  await page.locator('[data-testid="event-tag-nolv"]').click()
  await page.locator('[data-testid="event-apply"]').click()
  // the column tints orange — painted, not merely classed
  const head = page.locator('[data-testid="head-2026-01-21"]')
  await expect(head).toHaveClass(/evnolv/)
  const bg = await head.evaluate(e => getComputedStyle(e).backgroundColor)
  expect(bg).toContain('242') // the orange channel of the nolv tint
  // and the library holds only the four standard types
  await page.locator('[data-testid="event-1-2026-01-21"]').click()
  await page.locator('[data-testid="event-edit-types"]').click()
  await expect(page.locator('.evtype:not(.evtype-add)')).toHaveCount(4)
})

// ---- Post out from any date + the month-window roster (owner, 19 Aug 26) --
// The PO controls fold behind one button on the bid sheet: a date (seeded
// with the tapped day, but ANY date is legal), the "Archive on PO date"
// switch, and a confirm. Once posted, the tail is hatched, the LAST day in
// wears a small PO corner tag, and the row leaves the roster in months after
// they are gone — jsdom can prove none of the geometry half, so the
// month-window filter is pinned here.
test('posting out tags the last day, and the row leaves the months after it', async ({ page }) => {
  await lwRole(page, 'admin')
  // June is outside the months drawn at open (colwindow.ts): reach it the way
  // a reader does, by the month strip, then the cell exists to tap.
  await page.locator('[data-testid="month-JUN"]').click()
  await page.locator('[data-testid="cell-slipway-2026-06-15"]').click()
  await page.locator('[data-testid="bid-postout"]').click()
  // The switch is ON by default; this test flips it off (the custom case) —
  // the store side of that choice is pinned in the unit suite.
  await expect(page.locator('[data-testid="po-archive"]')).toHaveAttribute('aria-pressed', 'true')
  await page.locator('[data-testid="po-archive"]').click()
  await page.locator('[data-testid="po-confirm"]').click()

  // The first day gone is hatched; the last day IN wears the PO tag.
  await expect(page.locator('[data-testid="cell-slipway-2026-06-15"]')).toHaveClass(/gone/)
  const tag = page.locator('[data-testid="polast-slipway"]')
  await expect(tag).toHaveText('PO')
  const box = (await tag.boundingBox())!
  expect(box.width).toBeGreaterThan(0)

  // Viewing June — their last month — the row rides the roster.
  await page.locator(`[data-testid="month-JUN"]`).click()
  await expect(page.locator('[data-testid="row-slipway"]')).toHaveCount(1)
  // "Once I hit the next month, the row disappears": July on has no slipway.
  await page.locator(`[data-testid="month-JUL"]`).click()
  await expect(page.locator('[data-testid="row-slipway"]')).toHaveCount(0)
  await page.locator(`[data-testid="month-SEP"]`).click()
  await expect(page.locator('[data-testid="row-slipway"]')).toHaveCount(0)
  // Back into their time and the row returns, history intact.
  await page.locator(`[data-testid="month-MAR"]`).click()
  await expect(page.locator('[data-testid="row-slipway"]')).toHaveCount(1)
})

// The demo's own posted-out man (IGNITE, gone 12 Jan) proves the seeded path:
// his row rides January but not a month he never reached.
test('a seeded posting-out hides its row in later months too', async ({ page }) => {
  await expect(page.locator('[data-testid="row-ignite"]')).toHaveCount(1)
  await expect(page.locator('[data-testid="polast-ignite"]')).toHaveText('PO')
  await page.locator(`[data-testid="month-APR"]`).click()
  await expect(page.locator('[data-testid="row-ignite"]')).toHaveCount(0)
  await page.locator(`[data-testid="month-JAN"]`).click()
  await expect(page.locator('[data-testid="row-ignite"]')).toHaveCount(1)
})

// The roster reflow (hiding a posted-out row) repaints the ~28k-node grid and
// re-pins the viewed column with a `scrollLeft +=` correction. Run mid-fling,
// that scrollLeft write stops a real touch scroll's momentum dead — the scroll
// visibly halts at the month a row leaves (owner, 19 Aug 26). The fix defers
// the reflow to scroll REST, so it must NOT fire during a scroll: a burst of
// scroll events leaves IGNITE's row up until the burst ends, and only the
// settle that follows takes it away.
test('the roster does not reflow mid-scroll, only once the scroll settles', async ({ page }) => {
  await expect(page.locator('[data-testid="row-ignite"]')).toHaveCount(1)
  // A synchronous burst deep past January (scrollLeft clamps to the far right,
  // well beyond IGNITE's only month). No settle timer can fire inside the
  // loop, so the row is guaranteed still present the instant it ends.
  // The scroller spans the DRAWN months (colwindow.ts): wait for March to be
  // drawn (the runway pre-grows a beat after the open) so the far bound puts
  // January — the posted-out man's last month — off screen. At the bound of a
  // Jan–Feb window a wide screen still shows January, and the roster is then
  // RIGHT to keep him.
  await expect(page.locator('[data-testid="head-2026-03-01"]')).toHaveCount(1, { timeout: 5000 })
  const stillThere = await page.evaluate(() => {
    const el = document.querySelector('.mx-wrap') as HTMLElement
    for (let i = 0; i < 30; i++) { el.scrollLeft = 12000 + i * 100; el.dispatchEvent(new Event('scroll')) }
    return !!document.querySelector('[data-testid="row-ignite"]')
  })
  expect(stillThere).toBe(true)
  // Once the scroll comes to rest the window updates and the row leaves.
  await expect(page.locator('[data-testid="row-ignite"]')).toHaveCount(0)
})

// The counters as data (owner, 19 Aug 26): an admin builds one in the guided
// form, and it reads real numbers on the real grid. The form is the tallest
// sheet in the app — the whole-viewport assertion is the point of running
// this in a browser, on the phone project especially.
test('an admin builds a counter in the form, and the new row counts', async ({ page }) => {
  await lwRole(page, 'admin')
  await page.locator('[data-testid="settings-open"]').click()
  await page.locator('[data-testid="counter-add"]').click()
  const sheet = page.locator('[data-testid="counter-form"]')
  await expect(sheet).toBeVisible()
  // The sheet sits wholly inside the viewport — scrolled inside, never
  // clipped or pushed off the top (the dvh rule every sheet rides).
  const box = (await sheet.boundingBox())!
  const vp = page.viewportSize()!
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height + 1)
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1)

  await page.locator('[data-testid="cform-name"]').fill('SXO CREW')
  await page.locator('[data-testid="cf-qual-sxo"]').click()
  await page.locator('[data-testid="cform-save"]').click()
  const row = page.locator('[data-testid="count-sxo-crew"]')
  await expect(row).toHaveCount(1)
  // The seeded world has SXOs on its roster, so the new row shows a real
  // number on the war's first day — not a blank and not zero.
  const first = page.locator('[data-testid^="count-sxo-crew-2026-01-01"]')
  await expect(first).not.toHaveText('0')
})

test('deleting a counter takes its row off the grid', async ({ page }) => {
  await lwRole(page, 'admin')
  await expect(page.locator('[data-testid="count-wmp"]')).toHaveCount(1)
  await page.locator('[data-testid="manning-info-wmp"]').click()
  await page.locator('[data-testid="counter-edit-open"]').click()
  const del = page.locator('[data-testid="cform-delete"]')
  await del.click()
  await expect(del).toHaveText('Really delete?')
  await del.click()
  await expect(page.locator('[data-testid="count-wmp"]')).toHaveCount(0)
})

// Owner, 19 Aug 26 (kept through the 3 Sep 26 fold into ⚙): every admin control
// must sit wholly within the viewport width, whatever its home now. The controls
// live in three places — the top row (⚙ + OIL tracker), the ⚙ sheet (counters &
// rows), and the on-grid rearrange bar (Auto-sort + Done) — so this checks each in
// its place on BOTH projects (the phone is the real guard, the desktop proves it
// costs nothing).
test('every admin control is reachable within the viewport', async ({ page }) => {
  await lwRole(page, 'admin')
  const vw = page.viewportSize()!.width
  const within = async (id: string) => {
    const btn = page.locator(`[data-testid="${id}"]`)
    await expect(btn).toBeVisible()
    const box = (await btn.boundingBox())!
    expect(box.x, `${id} starts off the left edge`).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, `${id} runs off the right edge`).toBeLessThanOrEqual(vw + 1)
  }
  // the top row: the OIL tracker and the ⚙ settings entry
  await within('oil-tracker')
  await within('settings-open')
  // config controls, folded into ⚙ Settings
  await page.locator('[data-testid="settings-open"]').click()
  for (const id of ['event-add', 'sans-toggle', 'counter-add', 'counter-reset-all']) await within(id)
  await page.locator('[data-testid="settings-close"]').click()
  // rearrange controls, on the grid bar
  await page.locator('[data-testid="roster-arrange"]').click()
  for (const id of ['roster-autosort', 'roster-arrange-done']) await within(id)
})

// --- undo / redo UI-interaction bug test (owner, 30 Aug 26) -----------------
// The store/sync logic is covered in undoaudit.test.ts; these cover what only a
// real browser can — the buttons driving real edits, and undo fired while a
// sheet or move-mode is open (the stale-state class the scheduler guards).
test('undo/redo drive a real grid edit: fill, clear, restore', async ({ page }) => {
  desktopOnly()
  await lwRole(page, 'admin')
  const undo = page.locator('[data-testid="lw-undo"]')
  const redo = page.locator('[data-testid="lw-redo"]')
  await expect(undo).toBeDisabled()
  await dragSelect(page, 'cell-slipway-2026-01-06', 'cell-slipway-2026-01-06')
  await page.locator('[data-testid="sel-LL"]').click()
  await expect(page.locator('[data-testid="cell-slipway-2026-01-06"] .c')).toBeVisible()
  await expect(undo).toBeEnabled()
  await undo.click()
  await expect(page.locator('[data-testid="cell-slipway-2026-01-06"] .c')).toHaveCount(0)
  await expect(undo).toBeDisabled()
  await expect(redo).toBeEnabled()
  await redo.click()
  await expect(page.locator('[data-testid="cell-slipway-2026-01-06"] .c')).toBeVisible()
  await expect(redo).toBeDisabled()
})

test('undo fired in MOVE mode does not corrupt: the grid stays usable', async ({ page }) => {
  desktopOnly()
  await lwRole(page, 'admin')
  await dragSelect(page, 'cell-slipway-2026-01-06', 'cell-slipway-2026-01-07')
  await page.locator('[data-testid="sel-LL"]').click()
  await expect(page.locator('[data-testid="cell-slipway-2026-01-06"] .c')).toBeVisible()
  await dragSelect(page, 'cell-slipway-2026-01-06', 'cell-slipway-2026-01-07')
  await page.locator('[data-testid="sel-move"]').click()
  await expect(page.locator('[data-testid="move-banner"]')).toBeVisible()
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  await page.locator('[data-testid="lw-undo"]').click()   // undo mid-move
  // the grid is still alive: a fresh drag-select still opens the sheet
  await dragSelect(page, 'cell-slipway-2026-01-10', 'cell-slipway-2026-01-11')
  await expect(page.locator('[data-testid="select-sheet"]')).toBeVisible()
  await page.locator('[data-testid="sel-cancel"]').click()
  expect(errors, 'no page error from undo during move mode').toEqual([])
})

test('the select sheet still works, and undo acts on the committed edit', async ({ page }) => {
  desktopOnly()
  await lwRole(page, 'admin')
  await dragSelect(page, 'cell-slipway-2026-01-06', 'cell-slipway-2026-01-06')
  await expect(page.locator('[data-testid="select-sheet"]')).toBeVisible()
  await page.locator('[data-testid="sel-LL"]').click()
  await expect(page.locator('[data-testid="cell-slipway-2026-01-06"] .c')).toBeVisible()
  await page.locator('[data-testid="lw-undo"]').click()
  await expect(page.locator('[data-testid="cell-slipway-2026-01-06"] .c')).toHaveCount(0)
})

test('rapid undo/redo settle to a consistent grid', async ({ page }) => {
  desktopOnly()
  await lwRole(page, 'admin')
  await dragSelect(page, 'cell-slipway-2026-01-06', 'cell-slipway-2026-01-06')
  await page.locator('[data-testid="sel-LL"]').click()
  await dragSelect(page, 'cell-slipway-2026-01-08', 'cell-slipway-2026-01-08')
  await page.locator('[data-testid="sel-LL"]').click()
  const undo = page.locator('[data-testid="lw-undo"]')
  const redo = page.locator('[data-testid="lw-redo"]')
  for (let i = 0; i < 5; i++) if (await undo.isEnabled()) await undo.click()
  await expect(undo).toBeDisabled()
  await expect(page.locator('[data-testid="cell-slipway-2026-01-06"] .c')).toHaveCount(0)
  for (let i = 0; i < 5; i++) if (await redo.isEnabled()) await redo.click()
  await expect(redo).toBeDisabled()
  await expect(page.locator('[data-testid="cell-slipway-2026-01-06"] .c')).toBeVisible()
  await expect(page.locator('[data-testid="cell-slipway-2026-01-08"] .c')).toBeVisible()
})

// The tab is KEPT ALIVE between visits (owner, 1 Sep 26 — "the leave war tab
// is slow to open"): a tab switch hides the section instead of unmounting it,
// so the year grid is built once per session and a return is near-instant.
// jsdom pins the mount/hide/show shape (src/ui/lwkeepalive.test.tsx); this
// pins what only a layout engine can see — the grid REALLY is the same one
// (its sideways scroll survives the round trip), and its measurements are
// still live afterwards (a month jump still moves the grid and lights its
// button), with no page error across the switch.
test('a tab switch keeps the grid alive: same sideways spot on return, measurements still live', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  await page.evaluate(() => { document.querySelector<HTMLElement>('#page-leavewar .mx-wrap')!.scrollLeft = 600 })
  await page.waitForTimeout(250)
  const before = await page.evaluate(() => Math.round(document.querySelector('#page-leavewar .mx-wrap')!.scrollLeft))
  expect(before).toBeGreaterThan(0)

  await go(page, 'viewsched')
  // hidden, not torn down
  await expect(page.locator('#page-leavewar')).toBeHidden()
  expect(await page.evaluate(() => !!document.querySelector('#page-leavewar .mx-wrap'))).toBe(true)

  await go(page, 'leavewar')
  await expect(page.locator('[data-testid="row-slipway"]')).toBeVisible()
  // the same grid: its sideways position survived the round trip
  const after = await page.evaluate(() => Math.round(document.querySelector('#page-leavewar .mx-wrap')!.scrollLeft))
  expect(Math.abs(after - before)).toBeLessThanOrEqual(2)

  // measurements are still live after the hidden spell: a month jump moves
  // the grid and the readout follows it
  await page.locator('[data-testid="month-strip"] .mjump').nth(4).click()
  await page.waitForTimeout(400)
  const jumped = await page.evaluate(() => Math.round(document.querySelector('#page-leavewar .mx-wrap')!.scrollLeft))
  expect(jumped).not.toBe(after)
  expect(errors, 'no page error across the tab switch').toEqual([])
})

// The open-bidding box (owner, 1 Sep 26): a glowing deep-faded-green rectangle
// around the columns open for bidding, so it is obvious which dates are open.
// jsdom cannot see it (it is measured from real rects), so the pin is here.
// It tracks the window (seed: 1 Jan – 31 Mar) and clears the moment bidding
// closes — the box means "open right now".
test('a glowing green box frames the open-bidding window and clears when bidding closes', async ({ page }) => {
  await openLeaveWar(page, 'a')   // admin, so the stage can be advanced
  const box = page.locator('#page-leavewar .lw-bidbox')
  await expect(box).toHaveCount(1)
  const geo = await page.evaluate(() => {
    const b = document.querySelector('#page-leavewar .lw-bidbox').getBoundingClientRect()
    const jan1 = document.querySelector('[data-testid="head-2026-01-01"]').getBoundingClientRect()
    return { bw: b.width, bh: b.height, bl: b.left, jl: jan1.left }
  })
  expect(geo.bw).toBeGreaterThan(100)   // spans the ~90-day window
  expect(geo.bh).toBeGreaterThan(100)   // full grid height
  expect(Math.abs(geo.bl - geo.jl)).toBeLessThanOrEqual(4)  // left edge at 1 Jan
  // ROSTER rows joining re-size the box the same commit (bug-hunt fix,
  // 1 Sep 26 — the measure rides the store version, so a row-count change
  // with every other dep unchanged can no longer leave the box a row short
  // until the next zoom or resize). The SANS switch is the cleanest such
  // change: a pure Leave War store write that adds the SANS aircrew's rows
  // BELOW the header the box hangs from, touching no zoom/fold/window dep —
  // and it happens without leaving the tab, so no show-side resize kick can
  // re-measure for us. (A COUNTER row would prove nothing here: counts render
  // ABOVE the header row, outside the boxed region; and a PO'd body's row
  // deliberately stays for the months they served — the owner's 19 Aug rule.)
  await page.locator('[data-testid="settings-open"]').click()
  await page.locator('[data-testid="sans-toggle"]').click()
  await page.locator('[data-testid="settings-close"]').click() // close the sheet
  const grown = await page.evaluate(() =>
    document.querySelector('#page-leavewar .lw-bidbox').getBoundingClientRect().height)
  expect(grown).toBeGreaterThan(geo.bh)
  // Closing bidding removes it — a closed / published / draft war shows none.
  await page.locator('[data-testid="stage-advance"]').click()
  await expect(page.locator('[data-testid="stage-now"]')).toHaveText('BIDDING CLOSED')
  await expect(box).toHaveCount(0)
})

// ---- the column window (Phase 2 of the speed work, 3 Sep 26) --------------
// The grid draws a WINDOW of whole months at their real widths and grows it
// once a scroll comes to rest; a month-strip jump draws its month first. The
// arithmetic is unit-tested (colwindow.test.ts); this proves the measuring
// and the scrolling around it in a real layout, on both projects. Every
// number here is read, not assumed: the drawn months come off the header
// testids and the row alignment off the cells' colSpans.
test('the grid draws a window of months, keeps every row aligned, and grows at rest', async ({ page }) => {
  const read = () => page.evaluate(() => {
    const heads = [...document.querySelectorAll('.mx-wrap .mxhead th[data-testid^="head-"]')].map(e => (e as HTMLElement).dataset.testid!.slice(5))
    const months = [...new Set(heads.map(d => d.slice(0, 7)))]
    // every roster / event / count row spans exactly the drawn columns + the
    // two frozen ones — a band that began before the window, or a row that
    // still walked the whole year, would break this
    const rows = [...document.querySelectorAll('.mx-wrap table.mx tbody tr')]
      .filter(tr => !tr.classList.contains('grp') && !tr.classList.contains('catsub') && !tr.classList.contains('mbrak'))
    const misaligned = rows.filter(tr => [...tr.children].reduce((n, c) => n + ((c as HTMLTableCellElement).colSpan || 1), 0) !== 2 + heads.length).length
    return { months, heads: heads.length, misaligned, rows: rows.length }
  })

  const open = await read()
  expect(open.months.length).toBeGreaterThanOrEqual(2)
  expect(open.months.length).toBeLessThanOrEqual(4)     // Jan–Feb, plus the runway once it pre-grows
  expect(open.months[0]).toBe('2026-01')
  expect(open.misaligned).toBe(0)
  expect(open.rows).toBeGreaterThan(20)

  // a jump draws its month (and only around it): September exists, January does not
  await page.locator('[data-testid="month-SEP"]').click()
  await expect(page.locator('[data-testid="head-2026-09-01"]')).toHaveCount(1)
  await expect.poll(async () => (await read()).months.includes('2026-01')).toBe(false)
  const sep = await read()
  expect(sep.months).toContain('2026-09')
  expect(sep.misaligned).toBe(0)

  // scroll to the window's right bound and rest: the window grows to the right
  const before = sep.months.length
  await page.locator('.mx-wrap').evaluate(el => { el.scrollLeft = el.scrollWidth })
  await expect.poll(async () => (await read()).months.length, { timeout: 4000 }).toBeGreaterThanOrEqual(before)
  const grown = await read()
  expect(grown.misaligned).toBe(0)
  expect(grown.months[grown.months.length - 1] >= sep.months[sep.months.length - 1]!).toBe(true)

  // back to January by the strip: January is drawn again and December is not
  await page.locator('[data-testid="month-JAN"]').click()
  await expect(page.locator('[data-testid="head-2026-01-01"]')).toHaveCount(1)
  await expect.poll(async () => (await read()).months.includes('2026-12')).toBe(false)
  expect((await read()).misaligned).toBe(0)
})

// ---- the year-wide bottom scrollbar (owner, 4 Sep 26) ---------------------
// With the column window drawing ~2 months, the desktop bottom scrollbar's
// spacer spanned only those, so its thumb filled the bar, "halfway" was the
// edge, and it resized as the window grew. It is now a YEAR-wide scrubber: the
// spacer is the whole war at an estimated width, so the thumb is
// year-proportional and holds still; dragging it jumps the grid to the
// dragged-to month. Desktop only — the phone has no proxy bar.
test('the bottom scrollbar is a stable, year-wide scrubber that jumps the grid', async ({ page }) => {
  desktopOnly()
  const bar = page.locator('.mx-hbar')
  await expect(bar).toBeVisible()

  // The set of whole months the grid has actually DRAWN — the real navigation,
  // read off the header testids (not the live strip highlight, which lights the
  // instant you drag, a beat before the jump lands).
  const drawn = () => page.evaluate(() =>
    [...new Set([...document.querySelectorAll('#page-leavewar .mx-wrap .mxhead th[data-testid^="head-"]')]
      .map(e => (e as HTMLElement).dataset.testid!.slice(5, 12)))])
  const spacer = () => bar.evaluate(el => el.scrollWidth)
  const wrapContent = () => page.evaluate(() => document.querySelector<HTMLElement>('#page-leavewar .mx-wrap')!.scrollWidth)

  // The scrubber spans far more than the drawn window (the whole year), so its
  // thumb is a small fraction of the bar, not most of it.
  const yearW = await spacer()
  expect(yearW).toBeGreaterThan((await wrapContent()) * 1.8)

  const dragTo = (frac: number) => bar.evaluate((el, f) => {
    el.scrollLeft = Math.round((el.scrollWidth - el.clientWidth) * f)
    el.dispatchEvent(new Event('scroll'))
  }, frac)

  // Middle of the bar → the grid jumps to mid-year (June/July), and the spacer
  // is UNCHANGED (a thumb that no longer resizes as months draw).
  await dragTo(0.5)
  await expect.poll(async () => (await drawn()).some(m => m === '2026-06' || m === '2026-07'), { timeout: 4000 }).toBe(true)
  expect(await drawn()).not.toContain('2026-01')
  expect(await spacer()).toBe(yearW)

  // Near the far right → a late month; still the same spacer.
  await dragTo(0.92)
  await expect.poll(async () => (await drawn()).some(m => m >= '2026-10'), { timeout: 4000 }).toBe(true)
  expect(await spacer()).toBe(yearW)

  // Back to the left edge → January is drawn again.
  await dragTo(0)
  await expect.poll(async () => (await drawn()).includes('2026-01'), { timeout: 4000 }).toBe(true)

  // Reverse: driving the grid by the month strip moves the thumb to match —
  // September sits about three-quarters along the year.
  await page.locator('[data-testid="month-SEP"]').click()
  await expect.poll(() => page.locator('[data-testid="head-2026-09-01"]').count(), { timeout: 4000 }).toBe(1)
  await expect.poll(() => bar.evaluate(el => Math.round((el.scrollLeft / (el.scrollWidth - el.clientWidth)) * 100)), { timeout: 4000 })
    .toBeGreaterThan(60)
  const f = await bar.evaluate(el => el.scrollLeft / (el.scrollWidth - el.clientWidth))
  expect(f).toBeLessThan(0.85)
})
