import { test, expect, type Page } from '@playwright/test'
import { login, go } from './app'

/* THE BOARD'S UNDO AND REDO BRING THE CHANGE ON SCREEN WHEN IT IS OUT OF VIEW — AND MOVE NOTHING WHEN IT IS IN VIEW
   ([BOARD-UNDO-SAME-DAY]; his D672). Chat 61's reproduction (10 Nov 26, on `main`): a remark changed near the board's
   top, the board scrolled to its foot, Undo pressed — the remark went back 1989px above the screen, the board's scroll
   3026 before and after. Only a browser can see it: jsdom lays nothing out, so every box is "nowhere" there.
   The rule: ui/boardland.ts; the pure half (which box a step changes): ui/boardland.test.tsx. */

const DESK = { width: 1229, height: 584 }        // his PC: 1536 × 730 at 125%, in the page's own pixels
const PHONE = { width: 402, height: 874 }        // his iPhone's screen

/* the remark boxes of the board's flying lines that are drawn, top to bottom */
const REMARKS = '#sbBoard .sb-line .nts'
/* tag the first (or the last) drawn remark box and whatever scrolls it, so every later reading asks the same two */
async function mark(page: Page, which: 'first' | 'last') {
  return page.evaluate(([sel, which]) => {
    const all = [...document.querySelectorAll(sel!)].filter(e => (e as HTMLElement).getBoundingClientRect().width > 0) as HTMLElement[]
    const el = which === 'first' ? all[0]! : all[all.length - 1]!
    let s: HTMLElement | null = el.parentElement
    while (s && !(s.scrollHeight > s.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement
    ;(window as any).__sc = s || document.scrollingElement
    ;(window as any).__key = el.getAttribute('data-txt') || el.getAttribute('data-bfld') || ''
    ;(window as any).__nth = all.indexOf(el)
    return { n: all.length, room: (window as any).__sc.scrollHeight - (window as any).__sc.clientHeight }
  }, [REMARKS, which] as const)
}
/* where the tagged box stands now against the visible list: under the board's bar, above the screen's foot */
async function where(page: Page) {
  return page.evaluate(sel => {
    const all = [...document.querySelectorAll(sel)].filter(e => (e as HTMLElement).getBoundingClientRect().width > 0) as HTMLInputElement[]
    const el = all[(window as any).__nth]!
    const r = el.getBoundingClientRect()
    const sc = (window as any).__sc as HTMLElement
    const v = sc === document.scrollingElement ? { top: 0, bottom: innerHeight } : sc.getBoundingClientRect()
    const bar = document.querySelector('#schedBoard .sb-top')!.getBoundingClientRect()
    const top = Math.max(v.top, bar.top <= 1 ? bar.bottom : 0), bottom = Math.min(v.bottom, innerHeight)
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return { top: r.top, bottom: r.bottom, viewTop: top, viewBottom: bottom, inView: r.top >= top - 0.5 && r.bottom <= bottom + 0.5,
      onTop: !!hit && (hit === el || el.contains(hit)), value: el.value, scroll: Math.round(sc.scrollTop) }
  }, REMARKS)
}
const scrollTo = (page: Page, to: 'top' | 'foot') => page.evaluate(to => { const s = (window as any).__sc as HTMLElement; s.scrollTop = to === 'top' ? 0 : s.scrollHeight }, to)
/* type into the tagged box as a person does, and leave it so the change is kept */
async function retype(page: Page, add: string) {
  const nth = await page.evaluate(() => (window as any).__nth as number)
  const box = page.locator(`${REMARKS}:visible`).nth(nth)
  await box.scrollIntoViewIfNeeded()
  await box.click()
  await page.keyboard.press('End')
  await page.keyboard.type(add)
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await where(page)).value, { message: 'the remark is kept' }).toContain(add.trim())
}
const settled = async (page: Page) => { let a = -1, b = (await where(page)).scroll; while (a !== b) { await page.waitForTimeout(250); a = b; b = (await where(page)).scroll } }
const undo = (page: Page) => page.locator('#sbUndo:visible').click()
const redo = (page: Page) => page.locator('#sbRedo:visible').click()

for (const [name, size] of [['his PC', DESK], ['his iPhone', PHONE]] as const) {
  test.describe(`[BOARD-UNDO-SAME-DAY] ${name} (${size.width}×${size.height})`, () => {
    test.use({ viewport: size, hasTouch: size === PHONE })

    test.beforeEach(async ({ page }) => {
      await login(page); await go(page, 'editsched')
      await page.locator('#eWeek [data-sbday="0"]:visible').first().click()
      await expect(page.locator('#schedBoard:not([hidden])')).toBeVisible()
    })

    test('a change near the top, the board scrolled to its foot: Undo brings it just under the board\'s bar; Redo, now in view, moves nothing', async ({ page }) => {
      const m = await mark(page, 'first')
      expect(m.room, 'the board\'s list is long enough to scroll the change out of view').toBeGreaterThan(300)
      await retype(page, ' u1')
      await scrollTo(page, 'foot'); await settled(page)
      const out = await where(page)
      expect(out.inView, 'the changed remark is out of view before Undo').toBe(false)
      await undo(page)
      await expect.poll(async () => (await where(page)).value, { message: 'Undo took the words back' }).not.toContain('u1')
      await settled(page)
      const back = await where(page)
      expect(back.inView, `the remark is wholly on screen after Undo (box ${back.top}–${back.bottom}, list ${back.viewTop}–${back.viewBottom})`).toBe(true)
      expect(back.onTop, 'and nothing lies over it').toBe(true)
      expect(back.top - back.viewTop, 'it came down to just under the bar, not to the middle of the screen').toBeLessThan(40)
      /* Redo: the change is in view now, so the screen stays exactly where it is (D672) */
      await redo(page)
      await expect.poll(async () => (await where(page)).value, { message: 'Redo put the words back' }).toContain('u1')
      await settled(page)
      expect((await where(page)).scroll, 'Redo of a change in view moves nothing').toBe(back.scroll)
    })

    test('a change in view: Undo and Redo leave the board exactly where it is', async ({ page }) => {
      await mark(page, 'first')
      await retype(page, ' u2')
      await settled(page)
      const at = await where(page)
      expect(at.inView, 'the changed remark is in view').toBe(true)
      await undo(page)
      await expect.poll(async () => (await where(page)).value).not.toContain('u2')
      await settled(page)
      expect((await where(page)).scroll, 'Undo moved nothing').toBe(at.scroll)
      await redo(page)
      await expect.poll(async () => (await where(page)).value).toContain('u2')
      await settled(page)
      expect((await where(page)).scroll, 'Redo moved nothing').toBe(at.scroll)
    })

    test('a change near the foot, the board scrolled back to its top: Undo brings it up into view by the least movement', async ({ page }) => {
      const m = await mark(page, 'last')
      expect(m.room).toBeGreaterThan(300)
      await retype(page, ' u3')
      await scrollTo(page, 'top'); await settled(page)
      const out = await where(page)
      test.skip(out.inView, 'the last flying line is in view from the top at this size: nothing to bring up')
      await undo(page)
      await expect.poll(async () => (await where(page)).value).not.toContain('u3')
      await settled(page)
      const back = await where(page)
      expect(back.inView, `the remark is wholly on screen after Undo (box ${back.top}–${back.bottom}, list ${back.viewTop}–${back.viewBottom})`).toBe(true)
      expect(back.onTop, 'and nothing lies over it').toBe(true)
      expect(back.viewBottom - back.bottom, 'it came up just clear of the foot, not to the top').toBeLessThan(40)
    })

    /* chat 63's walk (W9b, 11 Nov 26): on a phone the changes window stands at the screen's foot (D997), and the change
       brought up "clear of the foot" landed under it — on top of the box lay the window's own foot. What stands over the
       list's foot is the window's top. */
    test('the changes window open, a change below the screen: Undo brings it up clear of the window, not under it', async ({ page }) => {
      const m = await mark(page, 'last')
      expect(m.room).toBeGreaterThan(300)
      await retype(page, ' u4')
      await scrollTo(page, 'top'); await settled(page)
      await page.locator('#sbHist:visible').click()
      await expect(page.locator('.chgwin:not([hidden])').first()).toBeVisible()
      const out = await where(page)
      test.skip(out.inView && out.onTop, 'the last flying line is in sight from the top at this size: nothing to bring up')
      await undo(page)
      await expect.poll(async () => (await where(page)).value).not.toContain('u4')
      await settled(page)
      const back = await where(page)
      expect(back.inView, `the remark is on screen after Undo (box ${back.top}–${back.bottom})`).toBe(true)
      expect(back.onTop, 'and the changes window does not lie over it').toBe(true)
      await expect(page.locator('.chgwin:not([hidden])').first(), 'the window stays open').toBeVisible()
    })
  })
}
