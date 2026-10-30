import { test, expect, type Page } from '@playwright/test'
import { login, go } from './app'

/* THE FAILED-SAVE WARNING COVERS NOTHING, AND CAN BE SEEN ([SAVE-NOTE-COVERS], D586, D587 — 5 Oct 26).
   "Not saved — Retry" used to FLOAT under the top bar's right end, over whatever each page keeps there: the name search
   box on both schedule pages (on a phone a tap on the box pressed Retry), the Tracker's ✓ Save changes (a click on it
   pressed Retry) and its syllabus edit button, Quals' filter, the Leave War's "+ New". It also kept its old height after
   a page change (at 1366 it landed on the account button and Logout), and on the full-screen board — which lies over
   the top bar — it could not be seen at all. It has a band of its own now: the top bar grows by one line and the page
   moves down (D587), and the board carries the same band under its own bar — the Inputs calendar and the Medical view,
   part of the Inputs page now (D620, D626), lie under the top bar and leave the warning to it (the test below).

   Unit tests cannot see any of this (no layout, no stylesheet), so it is asked here, in a real browser, the way a
   person meets it: storage refuses every write (what a full disk or a locked-down browser does), one change is made,
   and then every page is visited at each size. What lies UNDER the warning is asked pixel by pixel with the warning
   taken away for the moment of the question; presses are real taps and clicks, never a dispatched event. */

const PAGES = ['viewsched', 'editsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help', 'admin'] as const
const SIZES = [
  ['phone 390', { width: 390, height: 844 }, true],
  ['phone 320', { width: 320, height: 568 }, true],
  ['a phone on its side', { width: 844, height: 390 }, true],
  ['desktop 1200', { width: 1200, height: 800 }, false],
  ['desktop 1366, a short window', { width: 1366, height: 700 }, false],
  ['desktop 1440', { width: 1440, height: 900 }, false],
] as const
const BAR = '.topbar > .savestat.failed'
const TOPBAR = '.topbar:has(#burger)'   // Raptor's own bar — the Leave War's chrome has a .topbar of its own

/* STORAGE IS MADE TO REFUSE, AND EVERY ATTEMPT TO WRITE IS COUNTED. One wrapper stays in place for the whole test — it
   refuses while `__lsRefuse` is set and writes for real when it is not — so the count runs through refusal and
   recovery alike. EVERY press on a Retry is measured too, IN THE PRESS ITSELF: the count is read as the click is
   captured and again as it bubbles up to the document — after the button's own handler, and before any timer can run,
   since nothing else runs while one click is being handled. So the write counted is the one that press caused, never
   the app's automatic retry (1s, 2s, 4s … storage/postman.ts) falling due at that moment. The count used to be read one
   task later (a 0ms timer), where a retry already due could run first and pass for the press (Astra's read of the last
   round, 6 Oct 26 — [SAVE-NOTE-TEST-GAPS] (1)). Whether it does depends on the order in which a browser runs its due
   timers — this Chromium, measured 30 Oct 26, ran the 0ms one first — so the reading no longer rests on that order.
   AN AUTOMATIC RETRY DUE AT THE PRESS. The wrapper notes when storage last refused, and a timer of a second or more set
   straight after that is the app's retry being armed (postman.ts arm(backoff)): its due time is kept in `__autoDue`.
   With `__holdTill` set, the press's capture holds the page until then, so that retry falls due inside the press. */
async function failSaves(page: Page, shows: string = BAR) {
  await page.evaluate(() => {
    const w = window as any
    if (!w.__lsSetWas) {
      w.__lsSetWas = Storage.prototype.setItem
      w.__lsTries = 0
      Storage.prototype.setItem = function (this: Storage, ...a: [string, string]) {
        w.__lsTries++
        if (w.__lsRefuse) { w.__refusedAt = performance.now(); throw new DOMException('The quota has been exceeded (test: forced)', 'QuotaExceededError') }
        return w.__lsSetWas.apply(this, a)
      }
      const st = window.setTimeout
      window.setTimeout = function (this: any, fn: any, ms?: number, ...rest: any[]) {
        const id = st.call(window, fn, ms, ...rest)
        if (typeof ms === 'number' && ms >= 1000 && w.__refusedAt != null && performance.now() - w.__refusedAt < 50) w.__autoDue = performance.now() + ms
        return id
      } as any
      document.addEventListener('click', e => {
        if (!(e.target as HTMLElement).closest('.savestat button, .saveband button')) return
        /* storage works again FROM this press, when the test has armed it — never before the press: the app's own
           retry could otherwise save first and take the button away before the press reached it */
        if (w.__lsArmed) { w.__lsArmed = false; w.__lsRefuse = false }
        const before = w.__lsTries
        w.__retryBefore = before
        w.__retryWrote = null
        w.__pressTries = before
        w.__dueAtPress = w.__autoDue
        /* held to a retry's deadline: did the press land before it was due? then hold until it is */
        w.__landed = w.__holdTill ? performance.now() < w.__autoDue : null
        if (w.__holdTill) { while (performance.now() < w.__holdTill) { /* the page held */ } w.__holdTill = 0 }
      }, true)
      /* the reading IN THE PRESS: the document's own bubbling listener, after React's (it listens on the app's root) */
      document.addEventListener('click', e => {
        if (!(e.target as HTMLElement).closest('.savestat button, .saveband button') || w.__retryBefore == null) return
        w.__retryWrote = w.__lsTries - w.__retryBefore
        w.__retryBefore = null
      })
    }
    w.__lsRefuse = true
    /* a change through the one write path, so there is something to save */
    w.fillSlot('1.0.0.0.p', w.DAYS[1].waves[0].formations[0].aircraft[0].p === 'casper' ? 'bane' : 'casper'); w.afterSchedMutate()
  })
  /* the warning where it shows — the top bar's, or a full-screen surface's own band over it */
  await page.waitForSelector(shows)
}
/* a real press on the Retry inside `sel`, and the proof that THAT press tried to save */
async function pressRetry(page: Page, sel: string, touch: boolean) {
  await page.evaluate(() => { (window as any).__retryWrote = null })
  const l = page.locator(sel + ' button').first()
  if (touch) await l.tap(); else await l.click()
  /* waited for only until it EXISTS — its value was fixed inside the press, so the wait lets nothing else in */
  await expect.poll(() => page.evaluate(() => (window as any).__retryWrote), { message: 'the press on Retry was read in the press itself' }).not.toBeNull()
  expect(await page.evaluate(() => (window as any).__retryWrote), 'the press on Retry made an attempt to save, itself').toBeGreaterThan(0)
}
/* A press on Retry landing as the app's automatic retry falls due ([SAVE-NOTE-TEST-GAPS] (1)): the press is made a
   quarter of a second before a retry's deadline and held in its own handling until past it. `disabled` takes the
   button's own handler away first (the one React reads at the press) — a button that does nothing. Returns the reading
   in the press and the writes counted from the press until the next retry is armed — which a retry falling due at the
   press has then made; tries again on the next retry if the press came too late. */
async function pressAtTheDeadline(page: Page, sel: string, touch: boolean, disabled: boolean) {
  if (disabled) await page.locator(sel + ' button').first().evaluate(b => {
    const k = Object.keys(b).find(x => x.startsWith('__reactProps$'))!
    ;(b as any)[k].onClick = () => { /* the handler taken away */ }
  })
  for (let tries = 0; tries < 5; tries++) {
    const left = await page.evaluate(() => (window as any).__autoDue - performance.now())
    /* too close (or no retry armed yet): let it go by — the next is armed further off */
    if (!(left > 450)) { await page.waitForTimeout(Math.max(0, left || 0) + 200); continue }
    await page.waitForTimeout(left - 250)
    await page.evaluate(() => { const w = window as any; w.__holdTill = w.__autoDue + 30; w.__retryWrote = null; w.__landed = null })
    const l = page.locator(sel + ' button').first()
    if (touch) await l.tap(); else await l.click()
    /* the retry due at the press has run once the next one is armed */
    await expect.poll(() => page.evaluate(() => { const w = window as any; return w.__retryWrote != null && w.__autoDue !== w.__dueAtPress })).toBe(true)
    const r = await page.evaluate(() => { const w = window as any; return { landed: w.__landed, now: w.__retryWrote, since: w.__lsTries - w.__pressTries } })
    if (r.landed) return r
  }
  throw new Error('no press landed before a retry was due')
}
/* Retry while storage still refuses: it tries at once, and the warning stays */
async function retryRefused(page: Page, sel: string, touch: boolean) {
  await pressRetry(page, sel, touch)
  await expect(page.locator(sel)).toHaveCount(1)
}
/* Retry with storage working again from that press: it tries at once (the caller then sees the warning go) */
async function retrySaves(page: Page, sel: string, touch: boolean) {
  await page.evaluate(() => { (window as any).__lsArmed = true })
  await pressRetry(page, sel, touch)
}

/* the warning at `sel`: can it be seen, whole and on top; and which controls lie under it */
function look(page: Page, sel: string) {
  return page.evaluate(sel => {
    const note = document.querySelector(sel) as HTMLElement | null
    if (!note) return { there: false, seen: false, covers: [] as string[], h: 0 }
    const nr = note.getBoundingClientRect()
    const control = (e: Element | null) => {
      for (let n = e; n && n !== document.body; n = n.parentElement) {
        if (n.matches('button, a[href], input, select, textarea, summary, label, [role="button"], [role="tab"], [role="link"], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]')) return n
        if (getComputedStyle(n).cursor === 'pointer') return n
      }
      return null
    }
    const name = (e: Element) => (e.getAttribute('aria-label') || e.getAttribute('title') || (e.textContent || '').trim().replace(/\s+/g, ' ') || e.getAttribute('placeholder') || e.id || String(e.className) || e.tagName).slice(0, 40)
    const pe = note.style.pointerEvents; note.style.pointerEvents = 'auto'
    const onTop = (x: number, y: number) => { const t = document.elementFromPoint(x, y); return !!t && note.contains(t) }
    const btn = note.querySelector('button')?.getBoundingClientRect(), msg = (note.querySelector('.sv-msg') || note).getBoundingClientRect()
    /* on top at its middle, at Retry's own middle, and at both ends of its words — not the middle alone */
    const top = onTop(nr.left + nr.width / 2, nr.top + nr.height / 2)
      && (!btn || onTop(btn.left + btn.width / 2, btn.top + btn.height / 2))
      && onTop(msg.left + 12, msg.top + msg.height / 2) && onTop(msg.right - 4, msg.top + msg.height / 2)
    note.style.pointerEvents = pe
    const seen = top && nr.width > 0 && nr.height > 0 && nr.top >= 0 && nr.left >= 0 && nr.right <= innerWidth + 0.5 && nr.bottom <= innerHeight + 0.5
    const vis = note.style.visibility; note.style.visibility = 'hidden'
    const under = new Set<Element>()
    for (let y = nr.top + 2; y <= nr.bottom - 2; y += 5) for (let x = nr.left + 2; x <= nr.right - 2; x += 5) {
      const c = control(document.elementFromPoint(x, y))
      if (c && !note.contains(c)) under.add(c)
    }
    note.style.visibility = vis
    return { there: true, seen, covers: [...under].map(name), h: Math.round(nr.height) }
  }, sel)
}

/* THE TWO MOVABLE WINDOWS, worked with by a real mouse ([SAVE-NOTE-TEST-GAPS] (2)) */
const CHG = '.chgwin:not([hidden])', AVAIL = '.availwin:not([hidden])'
const winBox = async (page: Page, sel: string) => { const b = (await page.locator(sel).first().boundingBox())!; return [b.x, b.y, b.width, b.height].map(Math.round) }
/* moved by its bar's grip */
async function dragWin(page: Page, sel: string, dx: number, dy: number) {
  const g = (await page.locator(sel + ' .win-bar .win-grip').first().boundingBox())!
  await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2)
  await page.mouse.down()
  await page.mouse.move(g.x + g.width / 2 + dx, g.y + g.height / 2 + dy, { steps: 8 })
  await page.mouse.up()
  await expect.poll(() => page.locator(sel).first().evaluate(n => n.hasAttribute('data-placed')), { message: 'the window knows it has been placed' }).toBe(true)
}
/* resized by the browser's own corner (the windows' `resize:both`): 60px narrower or wider (`dx`) and pulled down to the foot of the
   screen — as tall as the stylesheet lets it be (on a short screen it is that tall already) — then the schedule redrawn
   behind it, as when he goes on working: the drawing after the resize is what marks it placed */
async function resizeWin(page: Page, sel: string, dx: number) {
  const b = (await page.locator(sel).first().boundingBox())!
  const w0 = Math.round(b.width)
  await page.mouse.move(b.x + b.width - 3, b.y + b.height - 3)
  await page.mouse.down()
  await page.mouse.move(b.x + b.width - 3 + dx, page.viewportSize()!.height - 2, { steps: 10 })
  await page.mouse.up()
  await expect.poll(async () => Math.abs(Math.round((await page.locator(sel).first().boundingBox())!.width) - w0), { message: 'the corner changed the window’s width' }).toBeGreaterThan(40)
  await expect.poll(async () => {
    await page.evaluate(() => (window as any).afterSchedMutate())
    return page.locator(sel).first().evaluate(n => n.hasAttribute('data-placed'))
  }, { message: 'the resized window knows it has been placed' }).toBe(true)
  /* the cap the warning would bring (36px under the stylesheet's own) would reach it: it is taller than that */
  const h = Math.round((await page.locator(sel).first().boundingBox())!.height)
  expect(h, 'the resized window is taller than the warning’s cap would let it be').toBeGreaterThan(page.viewportSize()!.height - 120 - 36)
}
/* the warning comes (at `band`) and goes, and the window's box is the one it had. It goes by the app's own retry, once
   storage works again — not by a press on Retry: a window he has placed may lie over the warning (D587 — a window covers
   the bar; and see [WIN-RESIZED-OVER-RETRY]), and what is asked here is the window's box, not the warning's reach */
async function keepsItsBox(page: Page, sel: string, what: string, band: string) {
  const b0 = await winBox(page, sel)
  await failSaves(page, band)
  await expect(page.locator(band).first()).toBeVisible()
  await page.waitForTimeout(400)   // long enough for a stylesheet cap to have been recorded as "his size", were there one
  expect(await winBox(page, sel), `${what}, with the warning up`).toEqual(b0)
  await page.evaluate(() => { (window as any).__lsRefuse = false })
  await expect(page.locator(band)).toHaveCount(0, { timeout: 40_000 })
  await page.waitForTimeout(400)
  expect(await winBox(page, sel), `${what}, once the warning has gone`).toEqual(b0)
}
/* the board's preview bar and the window `sel`: does the window start below the bar, can a finger at each of the bar's
   buttons press it, and where is the window's foot */
const clearOfPreview = (page: Page, sel: string) => page.evaluate(sel => {
  const bar = [...document.querySelectorAll('#schedBoard .dprev-bar')].find(x => (x as HTMLElement).offsetWidth) as HTMLElement | undefined
  const w = document.querySelector(sel)!.getBoundingClientRect()
  if (!bar) return { below: false, hits: [] as string[], foot: Math.round(w.bottom) }
  const r = bar.getBoundingClientRect()
  return {
    below: Math.round(w.top) >= Math.round(r.bottom),
    hits: [...bar.querySelectorAll('button')].map(b => {
      const q = b.getBoundingClientRect(), at = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2)
      return `${(b as HTMLElement).innerText.trim()}: ${at && (at === b || b.contains(at)) ? 'reachable' : 'COVERED'}`
    }),
    foot: Math.round(w.bottom),
  }
}, sel)

/* the Tracker shows ✓ Save changes only with an unsaved chart edit — one is made the way a person makes it */
async function trackerUnsaved(page: Page) {
  await go(page, 'tracker')
  const t = (sel: string) => page.locator(sel + ':visible').first().click()
  await page.waitForSelector('#sylMenuBtn:visible')
  await t('#sylMenuBtn'); await t('#arrangeBtn')
  /* on a short screen (a phone on its side) the tools fold behind "Tools ▾" (D373) */
  const add = page.locator('#arrTools button', { hasText: '+ Test' }).first()
  if (!(await add.isVisible())) await page.locator('#page-tracker button', { hasText: 'Tools ▾' }).first().click()
  await add.click()
  await page.locator('#dlgInput').first().fill('SAVE-NOTE')
  await t('#dlgOk'); await t('#sylMenuBtn'); await t('#arrangeBtn')
  await expect(page.locator('#page-tracker header button', { hasText: 'Save changes' }).first()).toBeVisible()
}

for (const [label, viewport, touch] of SIZES) {
  test.describe(`a failed save at ${label}`, () => {
    test.use({ viewport, hasTouch: touch })
    const press = async (page: Page, sel: string) => { const l = page.locator(sel).first(); if (touch) await l.tap(); else await l.click() }

    test('its warning can be seen and covers no control, on every page, at the top and scrolled', async ({ page }) => {
      test.setTimeout(120_000)
      await login(page)
      await trackerUnsaved(page)
      await go(page, 'viewsched')
      await failSaves(page)
      for (const pg of PAGES) {
        await go(page, pg as any)
        for (const y of [0, 320]) {
          await page.evaluate(y => window.scrollTo(0, y), y)
          /* the warning follows the bar: polled, because the bar is one line or two by page and a page change redraws it */
          await expect.poll(async () => (await look(page, BAR)).seen, { message: `${pg}${y ? ', scrolled' : ''}: the warning is on screen, whole and on top` }).toBe(true)
          expect((await look(page, BAR)).covers, `${pg}${y ? ', scrolled' : ''}: what the warning lies over`).toEqual([])
        }
        await page.evaluate(() => window.scrollTo(0, 0))
      }
    })

    test('a real press reaches the search box and the Tracker’s Save changes, and Retry saves', async ({ page }) => {
      await login(page)
      await trackerUnsaved(page)
      await go(page, 'viewsched')
      const bar0 = await page.locator(TOPBAR).evaluate(b => ({ h: Math.round(b.getBoundingClientRect().height), at: [...b.querySelectorAll('button, .nav a')].filter(e => (e as HTMLElement).offsetParent).map(e => { const r = e.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)}` }).join(' ') }))
      await failSaves(page)
      /* the bar grew by exactly the band, and nothing in its row moved (a control tapped again and again must not move — 2 Sep 26) */
      const band = (await look(page, BAR)).h
      await expect.poll(() => page.locator(TOPBAR).evaluate(b => Math.round(b.getBoundingClientRect().height))).toBe(bar0.h + band)
      expect(await page.locator(TOPBAR).evaluate(b => [...b.querySelectorAll('button, .nav a')].filter(e => (e as HTMLElement).offsetParent && !e.closest('.savestat')).map(e => { const r = e.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)}` }).join(' ')), 'the bar’s own buttons stayed where they were').toBe(bar0.at)

      /* the name search box, pressed in its middle, takes the press */
      await press(page, '#page-viewsched input[placeholder*="callsign"]:visible')
      expect(await page.evaluate(() => (document.activeElement as HTMLElement | null)?.getAttribute('placeholder') || ''), 'the search box has the caret').toContain('callsign')

      /* the Tracker's ✓ Save changes, pressed in its middle, takes the press (it goes once pressed) */
      await go(page, 'tracker')
      await expect.poll(async () => (await look(page, BAR)).seen).toBe(true)
      const save = page.locator('#page-tracker header button', { hasText: 'Save changes' }).first()
      await page.evaluate(() => { (window as any).__pressed = ''; document.addEventListener('click', e => { (window as any).__pressed = ((e.target as HTMLElement).closest('button')?.textContent || '').trim() }, { capture: true, once: true }) })
      if (touch) await save.tap(); else await save.click()
      expect(await page.evaluate(() => (window as any).__pressed), 'what took the press').toContain('Save changes')
      await expect(page.locator(BAR), 'the warning is still up — nothing was saved').toBeVisible()

      /* Retry while storage still refuses: the warning stays. Then storage works again: Retry saves, the warning goes,
         and the bar is back to its height. */
      await retryRefused(page, BAR, touch)
      const rb = (await page.locator(BAR + ' button').boundingBox())!
      expect(rb.height, 'Retry is tall enough to press').toBeGreaterThanOrEqual(24)
      await retrySaves(page, BAR, touch)
      await expect(page.locator('.topbar > .savestat')).toHaveCount(0)
      await go(page, 'viewsched')
      await expect.poll(() => page.locator(TOPBAR).evaluate(b => Math.round(b.getBoundingClientRect().height))).toBe(bar0.h)
    })

    /* THE PROOF THAT A PRESS SAVED CANNOT BE FOOLED BY THE AUTOMATIC RETRY ([SAVE-NOTE-TEST-GAPS] (1) — Astra's read of
       the last round, 6 Oct 26). The press lands as a retry falls due. With Retry's own handler taken away, the reading
       in the press finds no write, though the retry that was due has written straight after it — the write a later
       reading could have taken for the press. With the handler in place the reading in the press finds the press's own
       write. One phone size and one desktop size: a finger's press and a mouse's. */
    if (label === 'phone 390' || label === 'desktop 1200') for (const disabled of [true, false]) test(`a press on Retry is told apart from the automatic retry falling due at that moment — ${disabled ? 'Retry’s handler taken away' : 'Retry as built'}`, async ({ page }) => {
      test.setTimeout(120_000)
      await login(page)
      await go(page, 'viewsched')
      await failSaves(page)
      const r = await pressAtTheDeadline(page, BAR, touch, disabled)
      if (disabled) {
        expect(r.since, 'the automatic retry due at the press has written, straight after it').toBeGreaterThan(0)
        expect(r.now, 'in the press, with Retry’s handler taken away: no write — the retry is not taken for the press').toBe(0)
      } else expect(r.now, 'in the press, with Retry’s handler: the press wrote').toBeGreaterThan(0)
    })

    test('the full-screen board shows it under its own bar; the Inputs calendar and the Medical tab leave it to the top bar', async ({ page }) => {
      await login(page)
      await go(page, 'editsched')
      await failSaves(page)
      /* the board lies over the top bar, so it carries the warning itself */
      await page.locator('#eWeek [data-sbday="1"]:visible').first().click()
      await page.waitForSelector('#schedBoard:not([hidden])')
      const onBoard = '#schedBoard .saveband'
      await expect.poll(async () => (await look(page, onBoard)).seen, { message: 'the board shows the warning, whole and on top' }).toBe(true)
      expect((await look(page, onBoard)).covers, 'what the board’s warning lies over').toEqual([])
      /* every control of the board's own bar is still its own target */
      expect(await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-top button, #schedBoard .sb-top select')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.left >= 0 && r.right <= innerWidth }).filter(e => { const r = e.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !(hit && (e === hit || e.contains(hit))) }).map(e => (e.getAttribute('aria-label') || e.textContent || e.id || '').trim().slice(0, 30))), 'board-bar controls a press would miss').toEqual([])
      /* ONE warning for a screen reader and the keyboard: the bar's copy, under the board, is inert and hidden */
      expect(await page.locator(BAR).evaluate(n => [n.getAttribute('aria-hidden'), (n as HTMLElement).inert]), 'the bar’s copy while the board shows its own').toEqual(['true', true])
      /* …and its Retry works from there */
      await retryRefused(page, onBoard, touch)
      await retrySaves(page, onBoard, touch)
      await expect(page.locator(onBoard)).toHaveCount(0)
      await expect(page.locator('.topbar > .savestat')).toHaveCount(0)

      await page.locator('#sbDone').click()   // ✓ Done, the board's one way out (D349)
      await go(page, 'inputs')
      await failSaves(page)
      /* THE INPUTS CALENDAR IS PART OF THE PAGE NOW (the calendar-first Inputs, D574/D580 — joined with D587 on
         7 Oct 26): it no longer lies over the top bar, so it carries NO band of its own — the bar's warning is the one
         a person sees and a reader hears, whole and over nothing, with the calendar open. */
      await page.locator('#inCalBtn').click()
      await page.waitForSelector('#inpCal')
      await expect.poll(async () => (await look(page, BAR)).seen, { message: 'the Inputs calendar open: the bar’s warning is on screen, whole and on top' }).toBe(true)
      expect((await look(page, BAR)).covers, 'the Inputs calendar open: what the bar’s warning lies over').toEqual([])
      await expect(page.locator('#inpCal .saveband')).toHaveCount(0)
      expect(await page.locator(BAR).evaluate(n => [n.getAttribute('aria-hidden'), (n as HTMLElement).inert]), 'the bar’s copy with the calendar open').toEqual([null, false])
      /* MEDICAL IS A TAB OF THE INPUTS PAGE NOW (D620, D626 — 8 Oct 26): it sits in the page under the three tabs and no
         longer lies over the top bar, so — like the Inputs calendar above — it carries NO band of its own: the bar's
         warning is the one a person sees and a reader hears. Its Retry is pressed for real from there: while storage
         refuses the warning stays; storage working again, it saves and the warning goes. */
      await page.locator('#inMedBtn').click()
      await page.waitForSelector('#medView')
      await expect.poll(async () => (await look(page, BAR)).seen, { message: 'the Medical tab open: the bar’s warning is on screen, whole and on top' }).toBe(true)
      expect((await look(page, BAR)).covers, 'the Medical tab open: what the bar’s warning lies over').toEqual([])
      await expect(page.locator('#medView .saveband')).toHaveCount(0)
      expect(await page.locator(BAR).evaluate(n => [n.getAttribute('aria-hidden'), (n as HTMLElement).inert]), 'the bar’s copy with Medical open').toEqual([null, false])
      await retryRefused(page, BAR, touch)
      await retrySaves(page, BAR, touch)
      await expect(page.locator(BAR)).toHaveCount(0)
      /* and the tabs are in reach above it — the only way out of a tab */
      await page.locator('#inMemberMode').click()
      await expect(page.locator('#medView')).toHaveCount(0)
    })

    /* W13 (the Codex stack check, 5 Oct 26; D587): the phone board's DESKTOP LAYOUT is 1180px wide and pans. The band was a
       line of that wide bar with its words at one end and Retry at the other — about 700px apart on a 390px screen, so
       a person saw "Not saved" with no button. In that layout the band is pinned to the screen: words and Retry
       together, wherever the board is panned. */
    if (touch && viewport.width <= 620) test('on the board’s Desktop layout the warning and its Retry are on screen together, at any pan', async ({ page }) => {
      await login(page)
      await go(page, 'editsched')
      await failSaves(page)
      await page.locator('#eWeek [data-sbday="1"]:visible').first().click()
      await page.waitForSelector('#schedBoard:not([hidden])')
      await page.locator('#sbMore').click()
      await page.locator('#sbMoreWide').click()
      await expect(page.locator('#schedBoard')).toHaveClass(/sb-wide/)
      const onBoard = '#schedBoard .saveband'
      const widest = await page.locator('#schedBoard').evaluate(b => b.scrollWidth - b.clientWidth)
      expect(widest, 'the layout really pans').toBeGreaterThan(400)
      for (const pan of [0, 400, widest]) {
        await page.locator('#schedBoard').evaluate((b, x) => { b.scrollLeft = x }, pan)
        await expect.poll(async () => (await look(page, onBoard)).seen, { message: `panned ${pan}px: the warning is whole and on top` }).toBe(true)
        const at = await page.evaluate(sel => {
          const band = document.querySelector(sel)!, btn = band.querySelector('button')!, msg = band.querySelector('.sv-msg')!
          const b = btn.getBoundingClientRect(), m = msg.getBoundingClientRect()
          const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
          return { retryIn: b.left >= 0 && b.right <= innerWidth && b.width > 0, wordsIn: m.left >= 0 && m.left < innerWidth - 60, hitRetry: hit === btn || btn.contains(hit) }
        }, onBoard)
        expect(at, `panned ${pan}px: the words and Retry, both on screen, Retry the thing a finger lands on`).toEqual({ retryIn: true, wordsIn: true, hitRetry: true })
      }
      /* every control of the board's own bar that is on screen is still its own target under the pinned band */
      expect((await look(page, onBoard)).covers, 'what the pinned warning lies over').toEqual([])
      await retryRefused(page, onBoard, touch)
      await retrySaves(page, onBoard, touch)
      await expect(page.locator(onBoard)).toHaveCount(0)
    })

    /* …AND WHEN THAT PHONE IS TURNED ON ITS SIDE (the stylesheet reader's second pass, 6 Oct 26): the Desktop layout
       stays on for the session and the board is still 1180px wide and panning at 844px — wider than the phone rules
       reach. The band then fell back to the bar's full width with its words and Retry both at the far right end: an
       empty amber strip on screen. Its two pieces are held to the screen's two edges at every width. */
    if (touch && viewport.width === 390) test('on the board’s Desktop layout, the phone turned on its side: the words and Retry are still on screen together', async ({ page }) => {
      await login(page)
      await go(page, 'editsched')
      await failSaves(page)
      await page.locator('#eWeek [data-sbday="1"]:visible').first().click()
      await page.waitForSelector('#schedBoard:not([hidden])')
      await page.locator('#sbMore').click()
      await page.locator('#sbMoreWide').click()
      await expect(page.locator('#schedBoard')).toHaveClass(/sb-wide/)
      const onBoard = '#schedBoard .saveband'
      for (const size of [{ width: 844, height: 390 }, { width: 1024, height: 768 }]) {
        await page.setViewportSize(size)
        await expect(page.locator('#schedBoard')).toHaveClass(/sb-wide/)
        const widest = await page.locator('#schedBoard').evaluate(b => b.scrollWidth - b.clientWidth)
        expect(widest, `${size.width}px: the layout still pans`).toBeGreaterThan(100)
        for (const pan of [0, Math.round(widest / 2), widest]) {
          await page.locator('#schedBoard').evaluate((b, x) => { b.scrollLeft = x }, pan)
          const at = await page.evaluate(sel => {
            const band = document.querySelector(sel)!, btn = band.querySelector('button')!, msg = band.querySelector('.sv-msg')!
            const b = btn.getBoundingClientRect(), m = msg.getBoundingClientRect()
            const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
            return { retryIn: b.left >= 0 && b.right <= innerWidth && b.width > 0, wordsIn: m.left >= 0 && m.right <= innerWidth && m.width > 60, hitRetry: hit === btn || btn.contains(hit) }
          }, onBoard)
          expect(at, `${size.width}px wide, panned ${pan}px: the words and Retry both on screen, Retry the thing a finger lands on`).toEqual({ retryIn: true, wordsIn: true, hitRetry: true })
        }
      }
    })

    /* THE LEAVE WAR'S OIL TRACKER IS A FULL-SCREEN WORKING SURFACE TOO (Astra's read, F1) — its grid and its settings both
       lie over the top bar, and credits are awarded from it. */
    test('the Leave War’s OIL tracker shows it under its head, on the grid and on its settings', async ({ page }) => {
      await login(page)
      await go(page, 'leavewar')
      await failSaves(page)
      await page.locator('[data-testid="oil-tracker"]:visible').first().click()
      const on = '[data-testid="oil-sheet"] .saveband'
      await expect.poll(async () => (await look(page, on)).seen, { message: 'the OIL tracker shows the warning, whole and on top' }).toBe(true)
      expect((await look(page, on)).covers, 'what the OIL tracker’s warning lies over').toEqual([])
      await retryRefused(page, on, touch)
      await page.locator('[data-testid="oil-settings"]').click()
      await expect.poll(async () => (await look(page, on)).seen, { message: 'its settings show the warning too' }).toBe(true)
      expect((await look(page, on)).covers, 'what the warning lies over on the settings').toEqual([])
      await retrySaves(page, on, touch)
      await expect(page.locator('.saveband')).toHaveCount(0)
    })

    /* THE PAGE YOU ARE ON WHEN A SAVE FAILS, OR LANDS (Astra's read, F3 and F4). The walk made the save fail first and
       then visited each page; a header ALREADY frozen, and the Tracker's full-height column, measured the bar before it
       grew and were never told. */
    test('a header already frozen, and the Tracker’s column, follow the bar when the warning comes and when it goes', async ({ page }) => {
      test.setTimeout(90_000)
      await login(page)
      for (const [pg, head] of [['quals', '[data-testid="qsticky-head"]'], ['leavewar', '[data-testid="sticky-head"]']] as const) {
        await go(page, pg)
        for (const y of [500, 900, 1400]) { await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(250); if (await page.locator(head).count()) break }
        await expect(page.locator(head), `${pg}: its header is frozen`).toBeVisible()
        const gap = () => page.evaluate(sel => { const h = document.querySelector(sel)?.getBoundingClientRect(), b = document.querySelector('.topbar')!.getBoundingClientRect(); return h ? Math.round(h.top - b.bottom) : -999 }, head)
        const g0 = await gap()
        await failSaves(page)
        await expect.poll(gap, { message: `${pg}: the frozen header sits under the taller bar` }).toBe(g0)
        await retrySaves(page, BAR, touch)
        await expect(page.locator('.topbar > .savestat')).toHaveCount(0)
        await expect.poll(gap, { message: `${pg}: …and back under the bar when the warning goes` }).toBe(g0)
        await page.evaluate(() => window.scrollTo(0, 0))
      }
      await go(page, 'tracker')
      await page.waitForSelector('#page-tracker .tr-root')
      const foot = () => page.evaluate(() => Math.round(document.querySelector('#page-tracker .tr-root')!.getBoundingClientRect().bottom - innerHeight))
      const f0 = await foot()
      await failSaves(page)
      await expect.poll(foot, { message: 'the Tracker’s column still ends at the foot of the screen' }).toBe(f0)
      await retrySaves(page, BAR, touch)
      await expect(page.locator('.topbar > .savestat')).toHaveCount(0)
      await expect.poll(foot, { message: '…and when the warning goes' }).toBe(f0)
    })

    /* THE TRACKER'S TOOLS SET STAYS OPEN (Astra's second read, R2-1). The page is told of the taller bar by a window
       resize, and the Tracker shuts its Tools set on a resize (a turned phone). A save failing or landing behind a
       person choosing a tool must not take the set away. Only where the set folds: a short screen (D373). */
    if (viewport.height <= 500) test('the Tracker’s open Tools set stays open when the warning comes and when it goes', async ({ page }) => {
      await login(page)
      await go(page, 'tracker')
      await page.waitForSelector('#sylMenuBtn:visible')
      await page.locator('#sylMenuBtn:visible').first().click()
      await page.locator('#arrangeBtn:visible').first().click()
      await page.locator('#foldTools').click()
      const open = () => page.locator('#arrTools').evaluate(n => n.classList.contains('open'))
      await expect.poll(open, { message: 'the Tools set is open' }).toBe(true)
      const tool = await page.locator('#foldTool').textContent()
      const foot = () => page.evaluate(() => Math.round(document.querySelector('#page-tracker .tr-root')!.getBoundingClientRect().bottom - innerHeight))
      const f0 = await foot()
      await failSaves(page)
      await expect.poll(foot, { message: 'the Tracker still fits the screen under the taller bar' }).toBe(f0)
      expect(await open(), 'the Tools set, once the warning has come').toBe(true)
      /* the save lands by itself (nobody presses Retry): the warning goes, the set is still open, the tool still chosen */
      await page.evaluate(() => { (window as any).__lsRefuse = false })
      await expect(page.locator('.topbar > .savestat')).toHaveCount(0, { timeout: 40_000 })
      await expect.poll(foot).toBe(f0)
      expect(await open(), 'the Tools set, once the warning has gone').toBe(true)
      expect(await page.locator('#foldTool').textContent(), 'the tool in use').toBe(tool)
      /* …and it still works: a tool can be picked from it */
      await page.locator('#arrTools button:visible').first().click()
    })

    /* ON A PHONE THE TWO MOVABLE WINDOWS ARE BOTTOM PANELS — the rule that lowers their desktop opening spot must not
       reach them (Astra's read, F2: it pulled them to the top and stretched the changes window's slim bar). */
    if (touch && viewport.width <= 620) test('the changes window stays a bottom panel, and its slim bar stays slim', async ({ page }) => {
      await login(page)
      await go(page, 'editsched')
      await page.locator('#histBtn').tap()
      const win = page.locator('.chgwin:not([hidden])').first()
      await expect(win).toBeVisible()
      const box = async () => { const b = (await win.boundingBox())!; return [Math.round(b.y), Math.round(b.height)] }
      const b0 = await box()
      await failSaves(page)
      await expect.poll(async () => (await look(page, BAR)).seen).toBe(true)
      expect(await box(), 'the panel is where it was').toEqual(b0)
      expect(await page.evaluate(() => getComputedStyle(document.querySelector('.availwin')!).top), 'the ALL AVAIL window keeps its bottom-panel place too').toBe('auto')
      await page.locator('.chgwin .win-hide').tap()
      await expect.poll(async () => (await box())[1], { message: 'hidden, it is a slim bar' }).toBeLessThan(80)
      const bar = (await win.boundingBox())!
      expect(Math.round(bar.y + bar.height), 'the slim bar sits at the foot of the screen').toBeGreaterThan(viewport.height - 40)
    })

    /* A WINDOW HE HAS MOVED KEEPS ITS OWN BOX (Astra's second read, R2-2). The rule that lowers and shortens a window at
       its default spot must not reach one he placed: capped, its shrunken height was recorded as the size he chose and
       stayed after the warning went. The board's preview bar is not part of this — it writes its own inline cap on an
       UNPLACED window only (ui/floatwin.ts), which the stylesheet rule never outranks. */
    if (!touch) test('a changes window he has moved keeps its place and size when the warning comes and when it goes', async ({ page }) => {
      await login(page)
      await go(page, 'editsched')
      await page.locator('#histBtn').click()
      const win = page.locator('.chgwin:not([hidden])').first()
      await expect(win).toBeVisible()
      const bar = (await page.locator('.chgwin:not([hidden]) .win-bar .win-grip').boundingBox())!
      await page.mouse.move(bar.x + bar.width / 2, bar.y + bar.height / 2)
      await page.mouse.down()
      await page.mouse.move(bar.x - 520, bar.y + 200, { steps: 8 })   // well clear of the top bar: where he puts it is his, and over the warning it would hide it
      await page.mouse.up()
      const box = async () => { const b = (await win.boundingBox())!; return [b.x, b.y, b.width, b.height].map(Math.round) }
      await expect.poll(() => win.evaluate(n => n.hasAttribute('data-placed')), { message: 'the window knows it has been placed' }).toBe(true)
      const b0 = await box()
      await failSaves(page)
      await expect.poll(async () => (await look(page, BAR)).seen).toBe(true)
      await page.waitForTimeout(400)   // long enough for a stylesheet cap to have been recorded as "his size", were there one
      expect(await box(), 'the moved window, with the warning up').toEqual(b0)
      await retrySaves(page, BAR, touch)
      await expect(page.locator('.topbar > .savestat')).toHaveCount(0)
      await page.waitForTimeout(400)
      expect(await box(), 'the moved window, once the warning has gone').toEqual(b0)
    })

    /* …AND ONE HE HAS RESIZED, AN ALL AVAIL WINDOW HE HAS WORKED WITH, AND THE BOARD'S PREVIEW BAR ([SAVE-NOTE-TEST-GAPS]
       (2) — Astra's read of the last round, 6 Oct 26: the rule was pinned for a MOVED changes window only). A resize is
       his size from its first frame (floatwin.ts records it, and the next drawing marks the window placed); made as tall
       as the screen allows, so the warning's cap — 36px shorter — would bite at every desktop size were it to reach the
       window. */
    /* …BUT A WINDOW HE HAS ONLY RESIZED, NEVER MOVED, MOVES DOWN BELOW THE WARNING (his D1523, 30 Oct 26 — "Q5 ok";
       [WIN-RESIZED-OVER-RETRY]). Where the top bar is two lines (1200, 1366) a resized changes window kept its top just under
       the bar, and the warning's line grew under it: "Not saved" and Retry lay under the window. Its place was the app's, not
       his — so it now opens below the bar's foot as an unmoved window does, keeping the width he chose and the height he chose
       while that fits; its foot stays on the screen; and once the warning goes it is back where it was, at its size. */
    if (!touch) test('a changes window he has only resized moves below the warning, leaves Retry pressable, and is back at its size when it goes', async ({ page }) => {
      await login(page)
      await go(page, 'editsched')
      await page.locator('#histBtn').click()
      await expect(page.locator(CHG)).toBeVisible()
      await resizeWin(page, CHG, -60)
      const b0 = await winBox(page, CHG)
      await failSaves(page)
      await expect.poll(async () => (await look(page, BAR)).seen, { message: 'the warning is whole and on top' }).toBe(true)
      const band = (await page.locator(BAR).first().boundingBox())!
      await expect.poll(async () => (await winBox(page, CHG))[1], { message: 'the window starts below the warning' }).toBeGreaterThanOrEqual(Math.round(band.y + band.height))
      const rb = (await page.locator(BAR + ' button').boundingBox())!
      const hit = await page.evaluate(([x, y]) => (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('.savestat button') ? 'Retry' : 'something else', [rb.x + rb.width / 2, rb.y + rb.height / 2])
      expect(hit, 'what is at Retry’s middle with the resized changes window open').toBe('Retry')
      const b1 = await winBox(page, CHG)
      expect(b1[0], 'it keeps its left edge').toBe(b0[0])
      expect(b1[2], 'it keeps the width he chose').toBe(b0[2])
      expect(b1[1] + b1[3], 'its foot stays on the screen').toBeLessThanOrEqual(viewport.height)
      await page.waitForTimeout(400)   // long enough for a cap to have been recorded as "his size", were it to be
      await page.evaluate(() => { (window as any).__lsRefuse = false })
      await expect(page.locator(BAR)).toHaveCount(0, { timeout: 40_000 })
      await expect.poll(() => winBox(page, CHG), { message: 'once the warning has gone: its place and the size he chose' }).toEqual(b0)
    })
    if (!touch) test('an ALL AVAIL window he has moved and resized keeps its place and size when the warning comes and when it goes', async ({ page }) => {
      await login(page)
      await go(page, 'editsched')
      await page.evaluate(() => { const w = window as any; w.DAYS[0].allhands = [{ prog: 'SAFETY BRIEF', str: '08:00', end: '10:00', who: 'allavail' }]; w.afterSchedMutate() })
      const p = page.locator('#eWeek [data-oilsent]').first()
      await p.scrollIntoViewIfNeeded(); await p.click()
      await expect(page.locator(AVAIL)).toBeVisible()
      await dragWin(page, AVAIL, -420, 0)   // sideways only: its corner stays on a short screen, and it can still be pulled taller than the cap
      await resizeWin(page, AVAIL, 60)
      await keepsItsBox(page, AVAIL, 'the moved and resized ALL AVAIL window', BAR)
    })
    /* THE BOARD'S PREVIEW BAR (a published day looked at as its original, "← Back to live copy"): a window he has NOT
       placed opens below that bar — its own inline place, which the warning's stylesheet rule never outranks — and the
       warning, arriving under the board's own bar, moves the preview bar down by its band: the window must follow it,
       its foot still on the screen, and follow it back when the warning goes. A window he HAS placed keeps its box
       through both, preview bar or not. */
    if (!touch) for (const [name, sel] of [['changes', CHG], ['ALL AVAIL', AVAIL]] as const) test(`on the board’s preview bar: the ${name} window, not placed, stays clear of the bar; placed, it keeps its box — when the warning comes and when it goes`, async ({ page }) => {
      test.setTimeout(90_000)
      await login(page)
      await go(page, 'editsched')
      await page.evaluate(() => {
        const w = window as any
        w.DAYS[0].allhands = [{ prog: 'SAFETY BRIEF', str: '08:00', end: '10:00', who: 'allavail' }]
        w.afterSchedMutate()
        const g = w.signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
        w.setDayApproved(0, true)
        w.openScheduler(0)
        w.setDayPreview(0, w.dayCurVer(0))
      })
      await page.waitForSelector('#schedBoard .dprev-bar', { state: 'visible' })
      if (sel === AVAIL) await page.locator('#schedBoard .pv-frozen [data-oilsent]:visible').first().click()
      else await page.click('#sbHist')
      await expect(page.locator(sel)).toBeVisible()
      const onBoard = '#schedBoard .saveband'
      const clear = async (when: string) => {
        await expect.poll(async () => (await clearOfPreview(page, sel)).below, { message: `${when}: the ${name} window starts below the preview bar` }).toBe(true)
        const c = await clearOfPreview(page, sel)
        expect(c.hits.length, `${when}: the preview bar has its buttons`).toBeGreaterThan(0)
        for (const h of c.hits) expect(h, `${when}: every button of the preview bar is reachable`).toMatch(/reachable$/)
        expect(c.foot, `${when}: the window ends on the screen`).toBeLessThanOrEqual(viewport.height)
      }
      await clear('before the warning')
      await failSaves(page, onBoard)
      await expect.poll(async () => (await look(page, onBoard)).seen, { message: 'the board shows the warning, whole and on top' }).toBe(true)
      await page.waitForTimeout(400)
      await clear('with the warning up')
      await retrySaves(page, onBoard, touch)
      await expect(page.locator(onBoard)).toHaveCount(0)
      await page.waitForTimeout(400)
      await clear('once the warning has gone')
      /* now placed: dragged away from the corner, over the day */
      await dragWin(page, sel, -480, 140)
      await keepsItsBox(page, sel, `the placed ${name} window over the preview`, onBoard)
    })

    /* the changes window stays open while a person works, and opens 96px down the right edge — under a two-line bar
       that is where the band's Retry is. It opens lower by the band, and Retry still takes a real press. */
    if (!touch) test('the changes window, open, leaves Retry pressable', async ({ page }) => {
      await login(page)
      await go(page, 'editsched')
      await page.locator('#histBtn').click()
      const win = page.locator('.chgwin:not([hidden])').first()
      await expect(win).toBeVisible()
      const top0 = (await win.boundingBox())!.y
      await failSaves(page)
      const band = (await look(page, BAR)).h
      await expect.poll(async () => Math.round((await win.boundingBox())!.y)).toBe(Math.round(top0 + band))
      const rb = (await page.locator(BAR + ' button').boundingBox())!
      const hit = await page.evaluate(([x, y]) => (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('.savestat button') ? 'Retry' : 'something else', [rb.x + rb.width / 2, rb.y + rb.height / 2])
      expect(hit, 'what is at Retry’s middle with the changes window open').toBe('Retry')
      /* lower by the band, and no taller than the room left — its foot stays on the screen (Astra's read, F2) */
      const wb = (await win.boundingBox())!
      expect(Math.round(wb.y + wb.height), 'the window’s foot').toBeLessThanOrEqual(viewport.height)
      /* …on a SHORT desktop window too (600 tall): lower by the band means shorter by the band */
      await page.setViewportSize({ width: viewport.width, height: 600 })
      await expect.poll(async () => { const b = (await win.boundingBox())!; return Math.round(b.y + b.height) }, { message: 'the window’s foot on a 600-tall screen' }).toBeLessThanOrEqual(600)
      await page.setViewportSize(viewport)
      expect(await page.evaluate(() => getComputedStyle(document.querySelector('.availwin')!).top), 'the ALL AVAIL window opens lower by the same band').toBe(`${96 + band}px`)
      await retrySaves(page, BAR, touch)
      await expect(page.locator('.topbar > .savestat')).toHaveCount(0)
      await expect.poll(async () => Math.round((await win.boundingBox())!.y)).toBe(Math.round(top0))
    })
  })
}
