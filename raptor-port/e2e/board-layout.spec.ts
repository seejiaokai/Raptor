import { test, expect, type Page, type Locator } from '@playwright/test'
import { login, go } from './app'

/* THE BOARD'S LAYOUT — the pictures round's group 1 (chat 11, 8 Nov 26). jsdom has no layout, so where each part of a
   line stands, and what scrolls under what, can only be measured in a real browser.
   - D1781: from 821 to 1099 wide a jet's line puts its remarks on a row of their own and stacks R over B and TO over LD,
     as a phone does, so every part of the line is in reach and the remarks get over 300px; from 1100 the times stay in
     one line (D1029). The figures are the approved drawing's (docs/img/handpass/2026-11-07-pictures-round/notes-board.md
     §2, pr-board-measured.json): the line 111px, the remarks 323 at 821 to 468 at 1099.
   - D1780: on a phone on its side the head (Calendar, title, day strip, search) scrolls away with the list and the bar
     of buttons stays at the top, about 51px, so with the keys up the list gets about 151px; nothing jumps when the keys
     open. Chromium cannot raise an iPhone's keyboard: as kbscroll.spec.ts does, window.visualViewport is replaced before
     the app loads by a stand-in, and "the keys come up" is that stand-in shrinking. His iPhone is the real test. */

const openBoard = async (page: Page) => {
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await expect(page.locator('#schedBoard')).toBeVisible()
  await page.waitForTimeout(400)   // the board's opening slide done
}
/* the first flying jet's line on the board, its parts measured */
const lineParts = (page: Page) => page.evaluate(() => {
  const line = [...document.querySelectorAll<HTMLElement>('#schedBoard .sb-line')].find(l => l.offsetParent && l.querySelector('.sb-rcell') && l.querySelector('.sb-tl'))
  if (!line) return null
  const r = (sel: string) => { const e = line.querySelector<HTMLElement>(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, h: b.height } }
  const kids = (sel: string) => [...line.querySelectorAll<HTMLElement>(`${sel} > *`)].filter(e => e.offsetParent).map(e => { const b = e.getBoundingClientRect(); return { t: b.top, b: b.bottom, l: b.left } })
  const lb = line.getBoundingClientRect()
  const out = [...line.children].filter(e => (e as HTMLElement).offsetParent).some(e => { const b = e.getBoundingClientRect(); return b.right > lb.right + 1 || b.left < lb.left - 1 })
  return { line: { l: lb.left, r: lb.right, h: lb.height }, rc: r('.sb-rcell'), rb: r('.sb-rb'), tl: r('.sb-tl'), rbKids: kids('.sb-rb'), tlKids: kids('.sb-tl'), out }
})

test.describe('D1781 — 821 to 1099 wide: the remarks on a row of their own, the times stacked', () => {
  for (const w of [821, 874, 900, 1000, 1099]) {
    test(`${w} wide: R over B, TO over LD, the remarks below them over 300px, every part inside the line`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 })
      await openBoard(page)
      const m = await lineParts(page)
      expect(m, 'a flying line on the board').not.toBeNull()
      const { rc, rb, tl, rbKids, tlKids } = m!
      expect(rbKids.length, 'R and B both drawn').toBeGreaterThanOrEqual(2)
      expect(rbKids[1]!.t, 'B stands under R').toBeGreaterThanOrEqual(rbKids[0]!.b - 1)
      expect(tlKids[1]!.t, 'LD stands under TO').toBeGreaterThanOrEqual(tlKids[0]!.b - 1)
      expect(rc!.t, 'the remarks on a row of their own, below the times').toBeGreaterThanOrEqual(Math.max(rb!.b, tl!.b) - 1)
      expect(rc!.w, 'the remarks get over 300px').toBeGreaterThan(300)
      expect(m!.out, 'every part of the line inside the line').toBe(false)
      expect(m!.line.h, 'the line stays dense (the drawing: 111px)').toBeLessThan(125)
    })
  }
  /* The headings and the line are two grids. From 821 to about 839 the line's buttons (CX, ■, +, ✕) need more room
     than the back seat's half, which widened the line's last column alone and left the RCP heading up to 5px right of
     its seat (walker A of the board-layout walk, 8 Nov 26). Each seat stands under its own heading. */
  for (const w of [821, 830, 874]) {
    test(`${w} wide: FCP and RCP stand under their headings`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 })
      await openBoard(page)
      const d = await page.evaluate(() => {
        const line = [...document.querySelectorAll<HTMLElement>('#schedBoard .sb-line')].find(l => l.offsetParent && l.querySelector('.sb-seatpair'))
        if (!line) return null
        /* the heading row of this line's own wave: the nearest .sb-lcols before it */
        const all = [...document.querySelectorAll<HTMLElement>('#schedBoard .sb-lcols')].filter(h => h.offsetParent && (h.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING))
        const head = all[all.length - 1]
        if (!head) return null
        const hd = (t: string) => [...head.children].find(c => (c.textContent || '').trim() === t)?.getBoundingClientRect().left
        const seats = [...line.querySelectorAll<HTMLElement>('.sb-seatpair > *')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().left)
        return { fcp: hd('FCP'), rcp: hd('RCP'), seats }
      })
      expect(d, 'a heading row and a flying line').not.toBeNull()
      expect(d!.seats.length, 'both seats drawn').toBeGreaterThanOrEqual(2)
      expect(Math.abs(d!.fcp! - d!.seats[0]!), 'FCP over the front seat').toBeLessThan(1.5)
      expect(Math.abs(d!.rcp! - d!.seats[1]!), 'RCP over the back seat').toBeLessThan(1.5)
    })
  }
  test('1100 wide: the times stay in one line, the remarks beside them (D1029)', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 })
    await openBoard(page)
    const m = await lineParts(page)
    expect(m, 'a flying line on the board').not.toBeNull()
    expect(Math.abs(m!.rbKids[1]!.t - m!.rbKids[0]!.t), 'R and B side by side').toBeLessThan(2)
    /* one line: the times' own boxes stand in the line's grid (their wrapper draws no box of its own here), so the
       remarks are measured against R's box */
    expect(m!.rc!.t, 'the remarks on the times\' row').toBeLessThan(m!.rbKids[0]!.b)
  })
})

const SIDE = { width: 874, height: 402 }
const KB = 200, GAP = 8          // an iPhone's keyboard on its side, about; the gap kbscroll keeps above it
const SIDEWAYS = '(min-width:821px) and (pointer:coarse) and (orientation:landscape) and (max-height:500px)'

test.describe('D1780 — a phone on its side: the head scrolls away, the bar stays', () => {
  test.use({ viewport: SIDE, isMobile: true, hasTouch: true })
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      class FakeVV extends EventTarget { width = innerWidth; height = innerHeight; offsetTop = 0; offsetLeft = 0; pageTop = 0; pageLeft = 0; scale = 1 }
      const f = new FakeVV()
      Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f })
      ;(window as any).__vv = f
    })
  })
  const geo = (page: Page) => page.evaluate(() => {
    const q = (s: string) => document.querySelector<HTMLElement>('#schedBoard ' + s)!.getBoundingClientRect()
    const board = document.querySelector<HTMLElement>('#schedBoard .schedboard, #schedBoard.schedboard') || document.querySelector<HTMLElement>('.schedboard')!
    const top = q('.sb-top'), act = q('.sb-actions'), title = q('.sb-title'), side = q('.sb-side'), br = board.getBoundingClientRect()
    /* what stands at the bar's middle, a third in from its left: the bar itself, never the list behind it (D1518) */
    const hit = document.elementFromPoint(act.left + 20, (act.top + act.bottom) / 2)
    return { scroll: board.scrollTop, boardTop: br.top, boardBottom: br.bottom, topTop: top.top, topBottom: top.bottom, actTop: act.top,
      titleBottom: title.bottom, sideTop: side.top, sideBottom: side.bottom, barHit: !!hit?.closest('.sb-top') }
  })
  const scrollBoard = (page: Page, y: number) => page.evaluate(y => { const b = document.querySelector<HTMLElement>('.schedboard')!; b.scrollTop = y }, y)

  test('at rest the board is as before; scrolled, only the bar is left at the top, about 51px, and the crew column stands under it', async ({ page }) => {
    await openBoard(page)
    expect(await page.evaluate(q => matchMedia(q).matches, SIDEWAYS), 'the fixture: the sideways look is on').toBe(true)
    const rest = await geo(page)
    expect(rest.scroll, 'at rest').toBe(0)
    expect(rest.titleBottom, 'at rest the title is on screen').toBeGreaterThan(rest.boardTop)
    expect(rest.sideTop, 'at rest the crew column starts under the whole top').toBeGreaterThanOrEqual(rest.topBottom - 1)
    await scrollBoard(page, 600); await page.waitForTimeout(100)
    const s = await geo(page)
    expect(s.scroll, 'the board scrolls as one page').toBeGreaterThan(100)
    expect(s.titleBottom, 'the head has scrolled away').toBeLessThanOrEqual(s.boardTop + 1)
    expect(s.actTop, 'the bar is at the top').toBeGreaterThanOrEqual(s.boardTop - 1)
    expect(s.topBottom - s.boardTop, 'the bar about 51px').toBeLessThan(70)
    expect(s.barHit, 'the bar is drawn in front of the list (nothing pinned leaks, D1518)').toBe(true)
    expect(Math.abs(s.sideTop - s.topBottom), 'the crew column stands right under the bar').toBeLessThan(2)
    expect(Math.abs(s.sideBottom - s.boardBottom), 'and reaches the foot of the screen').toBeLessThan(2)
  })

  test('a box low on the screen tapped with the keys up rises above them; the bar stays in sight, the list about 151px', async ({ page }) => {
    await openBoard(page)
    const box: Locator = page.locator('#schedBoard .sb-boardwrap input:visible').nth(6)
    await box.scrollIntoViewIfNeeded()
    /* the box low on the screen, under where the keys will come */
    await page.evaluate(() => { const b = document.querySelector<HTMLElement>('.schedboard')!; b.scrollTop = Math.max(0, b.scrollTop - 120) })
    await page.waitForTimeout(100)
    const bb = (await box.boundingBox())!
    test.skip(bb.y + bb.height <= SIDE.height - KB, 'the fixture: the box is already above the keys')
    await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + Math.min(bb.height / 2, 8))
    await expect(box).toBeFocused()
    await page.evaluate(kb => { const v = (window as any).__vv; v.height = innerHeight - kb; v.dispatchEvent(new Event('resize')) }, KB)
    await expect.poll(async () => { const b = (await box.boundingBox())!; return b.y + b.height }).toBeLessThanOrEqual(SIDE.height - KB - GAP + 1)
    const g = await geo(page)
    expect(g.barHit, 'the bar in sight at the top').toBe(true)
    expect(g.actTop, 'the bar is at the top of the screen').toBeGreaterThanOrEqual(g.boardTop - 1)
    expect(SIDE.height - KB - g.topBottom, 'the list gets about 151px above the keys').toBeGreaterThan(130)
  })

  /* THE TWO CODE READS' FINDINGS (8 Nov 26 — Astra's 1 and 2, the fresh Opus read's 2, 3, 4 and 5; reproduced first by
     scripts/handpass/bl-reads.mjs): what the board's scrolling as one page left out. */
  const keys = (page: Page, up: boolean) => page.evaluate(([kb, up]) => {
    const v = (window as any).__vv; v.height = up ? innerHeight - kb : innerHeight; v.dispatchEvent(new Event('resize'))
  }, [KB, up] as const)
  const pressable = (page: Page) => page.evaluate(() => ['#sbBell', '#sbInsights', '#sbDone'].map(s => {
    const e = document.querySelector<HTMLElement>(s)!, r = e.getBoundingClientRect(), h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return !!h && !!h.closest(s)
  }))
  const barFoot = (page: Page) => page.evaluate(() => Math.round(document.querySelector('#schedBoard .sb-top')!.getBoundingClientRect().bottom))

  test('the last box of the list tapped with the keys up rises above them: the board is given room at its foot (D1048, D1081)', async ({ page }) => {
    await openBoard(page)
    await scrollBoard(page, 99999); await page.waitForTimeout(150)
    /* the lowest box at the very end of the list, under where the keys will come: nothing left to scroll it up by */
    const at = await page.evaluate(() => {
      const all = [...document.querySelectorAll<HTMLElement>('#schedBoard .sb-boardwrap input, #schedBoard .sb-boardwrap textarea')]
        .map(n => ({ n, r: n.getBoundingClientRect() }))
        .filter(o => o.n.getClientRects().length && o.r.height > 6 && o.r.height < 60 && o.r.top >= 0 && o.r.bottom <= innerHeight)
      all.sort((a, b) => b.r.bottom - a.r.bottom)
      const o = all[0]; if (!o) return null
      o.n.setAttribute('data-lastbox', '')
      const b = document.querySelector<HTMLElement>('.schedboard')!
      return { x: o.r.left + o.r.width / 2, y: o.r.top + Math.min(o.r.height / 2, 8), bottom: o.r.bottom, atEnd: b.scrollTop >= b.scrollHeight - b.clientHeight - 1 }
    })
    expect(at, 'the fixture: a box at the end of the list').not.toBeNull()
    expect(at!.atEnd, 'the fixture: the board scrolled to its end').toBe(true)
    expect(at!.bottom, 'the fixture: the box lies under where the keys come').toBeGreaterThan(SIDE.height - KB - GAP)
    const box = page.locator('[data-lastbox]')
    await page.touchscreen.tap(at!.x, at!.y)
    await expect(box).toBeFocused()
    await keys(page, true)
    await expect.poll(async () => { const b = (await box.boundingBox())!; return b.y + b.height }, { message: 'the box rises above the keys' })
      .toBeLessThanOrEqual(SIDE.height - KB - GAP + 1)
    expect((await geo(page)).barHit, 'the bar still in sight at the top').toBe(true)
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('.schedboard')!).transform), 'scrolled, never moved as a window').toBe('none')
    await keys(page, false)
    await expect.poll(() => page.evaluate(() => document.querySelectorAll('[data-kbroom]').length), { message: 'the room goes with the keys' }).toBe(0)
  })

  test('a window opened with the head scrolled away stays clear of the bar as the head comes back and goes again (D1106)', async ({ page }) => {
    await openBoard(page)
    await scrollBoard(page, 600); await page.waitForTimeout(150)
    await page.click('#sbHist')
    const win = page.locator('.chgwin:not([hidden])').first()
    await expect(win).toBeVisible()
    expect(await pressable(page), 'opened with the head away: the bell, Insights and Done in reach').toEqual([true, true, true])
    for (const y of [0, 600, 0]) {
      await scrollBoard(page, y)
      await expect.poll(() => pressable(page), { message: `scrolled to ${y}: the bell, Insights and Done in reach` }).toEqual([true, true, true])
      const top = (await win.boundingBox())!.y, foot = await barFoot(page)
      expect(top, `scrolled to ${y}: the window starts below the bar's foot (${foot})`).toBeGreaterThanOrEqual(foot)
    }
  })

  test('"Jump to a date" open, the board scrolled by a finger on its head: the grey still starts at the bar\'s foot (D1645)', async ({ page }) => {
    await openBoard(page)
    await page.click('#sbCal')
    const veilTop = () => page.evaluate(() => {
      const v = [...document.querySelectorAll<HTMLElement>('.airpop')].filter(p => p.getClientRects().length).pop()
      return v ? Math.round(v.getBoundingClientRect().top) : null
    })
    await expect.poll(veilTop, { message: 'the grey starts at the bar\'s foot' }).toBe(await barFoot(page))
    const t = (await page.locator('#schedBoard .sb-title').boundingBox())!
    const cdp = await page.context().newCDPSession(page)
    const x = t.x + 40, y0 = t.y + t.height / 2
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] })
    for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 - 160 * i / 12 }] }); await page.waitForTimeout(16) }
    await page.waitForTimeout(100)
    /* read once, with the finger still down and again just after: the grey must follow the bar as it moves, not catch up
       at some later redraw (the first red run's poll passed on one) */
    expect(await page.evaluate(() => document.querySelector('.schedboard')!.scrollTop), 'the fixture: the finger scrolled the board').toBeGreaterThan(40)
    expect((await veilTop())! - (await barFoot(page)), 'the finger still down: no strip of the list open between the bar and the grey').toBe(0)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await page.waitForTimeout(150)
    expect((await veilTop())! - (await barFoot(page)), 'the finger lifted: no strip of the list open between the bar and the grey').toBe(0)
  })

  test('a published day\'s "Warning · … flagged → hidden" in To go out lands on the struck line and leaves the list where it is', async ({ page }) => {
    const TUE = 1, day = `#eWeek .day[data-day="${TUE}"]`
    await login(page); await go(page, 'editsched')
    await page.evaluate(i => {
      const d = document.querySelector<HTMLElement>(`#eWeek .day[data-day="${i}"]`)!, sc = (d.closest('.week') || d.parentElement) as HTMLElement
      if (sc.scrollWidth > sc.clientWidth) sc.scrollLeft = d.offsetLeft - ((sc.firstElementChild as HTMLElement)?.offsetLeft || 0)
      window.scrollTo(0, 0)
    }, TUE)
    for (const role of ['cur', 'sked', 'plan', 'appr']) {
      const sel = page.locator(`${day} select[data-sign="${role}"][data-signday="${TUE}"]`).first()
      const opts = await sel.locator('option').evaluateAll(os => os.map(o => (o as HTMLOptionElement).value).filter(Boolean))
      await sel.selectOption(opts[0]!)
    }
    const pub = page.locator(`${day} [data-beak="${TUE}"]`).first()
    await pub.evaluate(e => e.scrollIntoView({ block: 'center' })); await pub.click()
    await expect(page.locator(`${day} .verchip`).first()).toContainText('ORIG')
    const box = page.locator(`${day} [data-dwbox="${TUE}"]`).first()
    if (!(await box.evaluate(e => e.classList.contains('open')))) await page.locator(`${day} [data-daywarn="${TUE}"]`).first().click()
    await page.locator(`${day} [data-woff="${TUE}.3"]`).first().click()
    await expect(page.locator(`${day} .dpend`).first()).toContainText('1 pending')
    await page.evaluate(i => (window as any).openScheduler(i), TUE)
    await expect(page.locator('#schedBoard')).toBeVisible(); await page.waitForTimeout(400)
    await page.click('#sbHist')
    await page.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'To go out' }).first().click()
    const line = page.locator('.chgwin:not([hidden]) .pl-list button.pl-item').first()
    await expect(line).toContainText('flagged')
    const s0 = await page.evaluate(() => document.querySelector('.schedboard')!.scrollTop)
    await line.click()
    const struck = page.locator('#schedBoard .sb-warn .wln.hid').first()
    await expect(struck, 'the struck line is shown').toBeVisible()
    const at = () => page.evaluate(() => Math.round(document.querySelector('.schedboard')!.scrollTop))
    await expect.poll(async () => { const a = await at(); await page.waitForTimeout(250); return (await at()) === a }, { message: 'the view comes to rest' }).toBe(true)
    expect(await at(), 'the board\'s list did not move — only the warnings list scrolls to the line').toBe(s0)
    expect(await struck.evaluate(e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight }), 'the line is on screen').toBe(true)
  })
})
