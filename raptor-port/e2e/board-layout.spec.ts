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
})
