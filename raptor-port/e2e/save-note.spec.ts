import { test, expect, type Page } from '@playwright/test'
import { login, go } from './app'

/* THE FAILED-SAVE WARNING COVERS NOTHING, AND CAN BE SEEN ([SAVE-NOTE-COVERS], D586, D587 — 5 Oct 26).
   "Not saved — Retry" used to FLOAT under the top bar's right end, over whatever each page keeps there: the name search
   box on both schedule pages (on a phone a tap on the box pressed Retry), the Tracker's ✓ Save changes (a click on it
   pressed Retry) and its syllabus edit button, Quals' filter, the Leave War's "+ New". It also kept its old height after
   a page change (at 1366 it landed on the account button and Logout), and on the full-screen board — which lies over
   the top bar — it could not be seen at all. It has a band of its own now: the top bar grows by one line and the page
   moves down (D587), and the board, the Inputs calendar and the Medical view carry the same band under their own bars.

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
   recovery alike. EVERY press on a Retry is measured too: the count is read as the click is captured and again one
   task later, before any timer of the app's own can run — the write that press caused, apart from the app's automatic
   retry (1s, 2s, 4s … storage/postman.ts), which would otherwise pass for it (Astra's second read, R2-3). */
async function failSaves(page: Page) {
  await page.evaluate(() => {
    const w = window as any
    if (!w.__lsSetWas) {
      w.__lsSetWas = Storage.prototype.setItem
      w.__lsTries = 0
      Storage.prototype.setItem = function (this: Storage, ...a: [string, string]) {
        w.__lsTries++
        if (w.__lsRefuse) throw new DOMException('The quota has been exceeded (test: forced)', 'QuotaExceededError')
        return w.__lsSetWas.apply(this, a)
      }
      document.addEventListener('click', e => {
        if (!(e.target as HTMLElement).closest('.savestat button, .saveband button')) return
        /* storage works again FROM this press, when the test has armed it — never before the press: the app's own
           retry could otherwise save first and take the button away before the press reached it */
        if (w.__lsArmed) { w.__lsArmed = false; w.__lsRefuse = false }
        const before = w.__lsTries
        w.__retryWrote = null
        setTimeout(() => { w.__retryWrote = w.__lsTries - before }, 0)
      }, true)
    }
    w.__lsRefuse = true
    /* a change through the one write path, so there is something to save */
    w.fillSlot('1.0.0.0.p', w.DAYS[1].waves[0].formations[0].aircraft[0].p === 'casper' ? 'bane' : 'casper'); w.afterSchedMutate()
  })
  await page.waitForSelector(BAR)
}
/* a real press on the Retry inside `sel`, and the proof that THAT press tried to save */
async function pressRetry(page: Page, sel: string, touch: boolean) {
  await page.evaluate(() => { (window as any).__retryWrote = null })
  const l = page.locator(sel + ' button').first()
  if (touch) await l.tap(); else await l.click()
  await expect.poll(() => page.evaluate(() => (window as any).__retryWrote), { message: 'the press on Retry made an attempt to save, itself' }).toBeGreaterThan(0)
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

    test('the full-screen board, the Inputs calendar and the Medical view each show it under their own bar', async ({ page }) => {
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
      for (const [btn, root] of [['#inCalBtn', '#inpCal'], ['#inMedBtn', '#medView']] as const) {
        await page.locator(btn).click()
        await page.waitForSelector(root)
        await expect.poll(async () => (await look(page, root + ' .saveband')).seen, { message: `${root} shows the warning, whole and on top` }).toBe(true)
        expect((await look(page, root + ' .saveband')).covers, `${root}: what the warning lies over`).toEqual([])
        /* its Retry, pressed for real: while storage refuses the warning stays; from the Medical view, storage working
           again, it saves and the warning goes */
        await retryRefused(page, root + ' .saveband', touch)
        expect(await page.locator(BAR).getAttribute('aria-hidden'), `${root}: the bar’s copy is hidden from readers`).toBe('true')
        if (root === '#medView') { await retrySaves(page, root + ' .saveband', touch); await expect(page.locator('.saveband')).toHaveCount(0) }
        await page.locator(root + ' .ic-head button[aria-label="Back to list"], ' + root + ' .ic-head button:has-text("✕")').first().click()
        await expect(page.locator(root)).toHaveCount(0)
        /* closed with the save still failed (the Inputs calendar): the bar's own warning is the one again */
        if (root === '#inpCal') expect(await page.locator(BAR).evaluate(n => [n.getAttribute('aria-hidden'), (n as HTMLElement).inert]), 'the bar’s copy once the calendar is closed').toEqual([null, false])
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
