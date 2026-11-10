import { test, expect, type Page, type Browser, type CDPSession } from '@playwright/test'
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

/* ANY OTHER BOX OF THE BOARD, BY ITS SELECTOR (the two blind reads' findings, 11 Nov 26 — a row re-ordered, an input's
   row, a SANS card, the sign-off line, the issues bar): where it stands against the visible list, as where() says of
   the tagged remark — measured against whatever scrolls IT, since the issues list scrolls on its own on a desktop.
   null when the board draws no such box (a folded panel). */
async function spot(page: Page, sel: string) {
  return page.evaluate(sel => {
    const el = [...document.querySelectorAll(sel)].find(e => (e as HTMLElement).getBoundingClientRect().height > 0) as HTMLElement | undefined
    if (!el) return null
    let s: HTMLElement | null = el.parentElement
    while (s && !(s.scrollHeight > s.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement
    const sc = (s || document.scrollingElement) as HTMLElement
    const r = el.getBoundingClientRect()
    const v = sc === document.scrollingElement ? { top: 0, bottom: innerHeight } : sc.getBoundingClientRect()
    const bar = document.querySelector('#schedBoard .sb-top')!.getBoundingClientRect()
    const top = Math.max(v.top, bar.top <= 1 ? bar.bottom : 0), bottom = Math.min(v.bottom, innerHeight)
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return { top: r.top, bottom: r.bottom, viewTop: top, viewBottom: bottom, inView: r.top >= top - 0.5 && r.bottom <= bottom + 0.5,
      onTop: !!hit && (hit === el || el.contains(hit) || hit.contains(el)), value: String((el as any).value ?? el.textContent ?? '') }
  }, sel)
}
/* the board's own list — what scrolls the day's panels — read and moved by one of its panels that is always drawn */
const LIST = '#sbBoard .sb-panel.prog'
const list = (page: Page, to?: 'top' | 'foot') => page.evaluate(([sel, to]) => {
  let s: HTMLElement | null = (document.querySelector(sel!) as HTMLElement).parentElement
  while (s && !(s.scrollHeight > s.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement
  const sc = (s || document.scrollingElement) as HTMLElement
  if (to) sc.scrollTop = to === 'top' ? 0 : sc.scrollHeight
  return Math.round(sc.scrollTop)
}, [LIST, to] as const)
const rested = async (page: Page) => { let a = -1, b = await list(page); while (a !== b) { await page.waitForTimeout(250); a = b; b = await list(page) } return b }
/* put a box a little under the board's bar, so what lies below it in the list is as far down as it can be */
const nearTop = (page: Page, sel: string) => page.evaluate(sel => {
  const el = [...document.querySelectorAll(sel)].find(e => (e as HTMLElement).getBoundingClientRect().height > 0) as HTMLElement
  let s: HTMLElement | null = el.parentElement
  while (s && !(s.scrollHeight > s.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement
  const bar = document.querySelector('#schedBoard .sb-top')!.getBoundingClientRect()
  s!.scrollTop += el.getBoundingClientRect().top - Math.max(s!.getBoundingClientRect().top, bar.bottom) - 24
}, sel)
/* one tap then typing replaces a time (D1047); Enter keeps it */
async function retime(page: Page, sel: string, digits: string) {
  await page.locator(sel).click()
  await page.keyboard.type(digits)
  await page.keyboard.press('Enter')
}
/* the Ground Programme row an accepted input made, by the words in its item box — its place in the list is not its name */
const groundRow = (page: Page, item: string) => page.evaluate(item => {
  const box = [...document.querySelectorAll('#sbBoard .gr-frominput [data-bfld$=".prog"]')].find(e => (e as HTMLTextAreaElement).value === item)
  return box ? box.getAttribute('data-bfld')!.replace(/\.prog$/, '') : null
}, item)
/* the input behind a line of Personal Inputs, by its kind's name on the line */
const inputOf = (page: Page, kind: string) => page.evaluate(kind => {
  const b = [...document.querySelectorAll('#sbBoard .sb-panel.pinp .inprow .inpedit')].find(e => (e.textContent || '').trim() === kind)
  return b ? b.getAttribute('data-inpedit') : null
}, kind)
const PI_HEAD = '#sbBoard .sb-panel.pinp [data-pitog]', PI_ROWS = '#sbBoard .sb-panel.pinp .inprow'

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

    /* ---- the two blind reads of 11 Nov 26: their two open cases, settled here, and their findings a browser can show ---- */

    /* case S2 (the fresh Opus reader): the window test above only ever brings a box UP. On a desktop the changes window
       opens just under the board's bar (D1106) — where a box from ABOVE the screen is brought down to. */
    test('the changes window open, a change above the screen: Undo brings it down under the bar, and the window does not lie over it', async ({ page }) => {
      const m = await mark(page, 'first')
      expect(m.room).toBeGreaterThan(300)
      await retype(page, ' u5')
      await scrollTo(page, 'foot'); await settled(page)
      await page.locator('#sbHist:visible').click()
      await expect(page.locator('.chgwin:not([hidden])').first()).toBeVisible()
      expect((await where(page)).inView, 'the changed remark is out of view before Undo').toBe(false)
      await undo(page)
      await expect.poll(async () => (await where(page)).value).not.toContain('u5')
      await settled(page)
      const back = await where(page)
      expect(back.inView, `the remark is on screen after Undo (box ${back.top}–${back.bottom}, list ${back.viewTop}–${back.viewBottom})`).toBe(true)
      expect(back.onTop, 'and the changes window does not lie over it').toBe(true)
      await expect(page.locator('.chgwin:not([hidden])').first(), 'the window stays open').toBeVisible()
    })

    /* case S1 (the fresh Opus reader): an accepted input is drawn TWICE on the day — its row on the Ground Programme
       and, with Personal Inputs open, its line there. Its time retyped on the programme row, in view: the screen stays
       (D672), and a folded Personal Inputs stays folded — its row on the programme is where the change shows. */
    for (const open of [false, true]) {
      test(`an accepted input's time retyped on its Ground Programme row, in view, Personal Inputs ${open ? 'open' : 'folded'} lower down: Undo and Redo leave the board where it is`, async ({ page }) => {
        if (open) {
          await page.locator(PI_HEAD).scrollIntoViewIfNeeded(); await page.locator(PI_HEAD).click()
          await expect(page.locator(PI_ROWS).first()).toBeVisible()
        }
        const row = await groundRow(page, 'MEETING')
        expect(row, 'the demo Monday carries an accepted Meeting on its Ground Programme').toBeTruthy()
        await nearTop(page, `#sbBoard [data-bfld="${row}.end"]`); await rested(page)
        await retime(page, `#sbBoard [data-bfld="${row}.end"]`, '1730')
        const endOf = async () => `#sbBoard [data-bfld="${await groundRow(page, 'MEETING')}.end"]`
        await expect.poll(async () => (await spot(page, await endOf()))?.value, { message: 'the new time is kept' }).toBe('17:30')
        const at = await rested(page)
        const box = (await spot(page, await endOf()))!
        expect(box.inView, 'the retyped time is in view').toBe(true)
        const pi = (await spot(page, open ? PI_ROWS : PI_HEAD))!
        expect(pi.top, 'Personal Inputs is lower down the list than the retyped time').toBeGreaterThan(box.bottom)
        test.info().annotations.push({ type: 'Personal Inputs', description: pi.inView ? 'in view at this size' : 'out of view below' })
        await undo(page)
        await expect.poll(async () => (await spot(page, await endOf()))?.value, { message: 'Undo put the time back' }).toBe('17:00')
        expect(await rested(page), 'Undo moved nothing').toBe(at)
        expect(await page.locator(PI_ROWS).count() > 0, 'Personal Inputs is as it was left').toBe(open)
        await redo(page)
        await expect.poll(async () => (await spot(page, await endOf()))?.value, { message: 'Redo typed it again' }).toBe('17:30')
        expect(await rested(page), 'Redo moved nothing').toBe(at)
        expect(await page.locator(PI_ROWS).count() > 0).toBe(open)
      })
    }

    /* finding 2: a re-order names a row now. The Common Programme's first row given a late time, then ⇅ Auto sort: that
       ONE row drops to the foot of the list. From the board's foot, Undo puts it back at the head, far above.
       CORRECTED 11 Nov 26 (the narrow read of the first fix round, finding 1): this test ended "Redo, the head now in
       view, moves nothing" — the wrong target. Redo sends the row back DOWN: the change is the row that moved, at the
       foot of the Common Programme, not "the first place that differs" (the head, a different row by then). */
    test('ONE row re-ordered by Auto sort, the board scrolled to its foot: Undo and Redo each bring the row that MOVED into view; with its place in view and the head of the list out of it, Redo moves nothing', async ({ page }) => {
      const HEAD = '#sbBoard [data-bfld="ap:0.0.prog"]'
      const n = await page.locator('#sbBoard [data-bfld^="ap:0."][data-bfld$=".prog"]').count()
      expect(n, 'the demo Monday\'s Common Programme is a list').toBeGreaterThan(3)
      const FOOT = `#sbBoard [data-bfld="ap:0.${n - 1}.prog"]`
      const first = (await spot(page, HEAD))!.value
      await retime(page, '#sbBoard [data-bfld="ap:0.0.str"]', '2200')
      /* a Common Programme time box keeps the keys after Enter and reads as typed until they leave it */
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
      await expect.poll(async () => (await spot(page, '#sbBoard [data-bfld="ap:0.0.str"]'))?.value).toBe('22:00')
      await page.locator('#sbBoard [data-sortsec="p.0"]').click()
      await expect.poll(async () => (await spot(page, HEAD))?.value, { message: 'Auto sort moved the late row down' }).not.toBe(first)
      await list(page, 'foot'); await rested(page)
      expect((await spot(page, HEAD))!.inView, 'the head of the Common Programme is out of view').toBe(false)
      await undo(page)
      await expect.poll(async () => (await spot(page, HEAD))?.value, { message: 'Undo put the order back' }).toBe(first)
      await rested(page)
      const back = (await spot(page, HEAD))!
      expect(back.inView, `the row that moved is on screen after Undo (box ${back.top}–${back.bottom}, list ${back.viewTop}–${back.viewBottom})`).toBe(true)
      /* Redo from the foot again: the row goes back down, and it is THAT row — last of the list now — that comes just
         under the bar, not the head of the list with the moved row left wherever it falls below it */
      await list(page, 'foot'); await rested(page)
      await redo(page)
      await expect.poll(async () => (await spot(page, FOOT))?.value, { message: 'Redo sorted again: the late row is the last' }).toBe(first)
      await rested(page)
      const down = (await spot(page, FOOT))!
      expect(down.inView, `the row that moved is on screen after Redo (box ${down.top}–${down.bottom}, list ${down.viewTop}–${down.viewBottom})`).toBe(true)
      expect(down.top - down.viewTop, 'it is the moved row that came just under the bar, not the head of its list').toBeLessThan(40)
      /* and where the row LANDS in view, the screen stays (D672) — though the head of the list, "the first place that
         differs", is out of view above */
      await undo(page)
      await expect.poll(async () => (await spot(page, HEAD))?.value).toBe(first)
      await rested(page)
      await nearTop(page, FOOT); const room = await rested(page)
      expect((await spot(page, FOOT))!.inView, 'the foot of the Common Programme is in view').toBe(true)
      expect((await spot(page, HEAD))!.inView, 'its head is out of view above').toBe(false)
      await redo(page)
      await expect.poll(async () => (await spot(page, FOOT))?.value).toBe(first)
      expect(await rested(page), 'Redo of a row that lands in view moves nothing').toBe(room)
    })

    /* the narrow read, finding 1, by ONE ROW DRAGGED BY ITS GRIP (the mouse, as e2e/geometry.spec.ts drags a row): the
       first row of the Common Programme carried down past two or more others. Undo sends it back to the head, out of
       view above: it comes under the bar. Redo carries it down again: with the place it lands in view and the head
       above the screen, nothing may move — "the first place that differs" (the head, another row by then) scrolled the
       board up, away from the change. */
    test('ONE row dragged down the Common Programme: Undo, its old place out of view, brings it into view; Redo, the place it lands in view, moves nothing', async ({ page }) => {
      const ITEMS = '#sbBoard [data-bfld^="ap:0."][data-bfld$=".prog"]'
      const row = (i: number) => `#sbBoard [data-move="mv:p.0.${i}"]`, item = (i: number) => `#sbBoard [data-bfld="ap:0.${i}.prog"]`
      const names = () => page.evaluate(sel => [...document.querySelectorAll(sel)].map(e => (e as HTMLTextAreaElement).value), ITEMS)
      const before = await names()
      expect(before.length, 'the demo Monday\'s Common Programme is a list').toBeGreaterThan(4)
      expect(new Set(before).size, 'its items are told apart by their words').toBe(before.length)
      await nearTop(page, row(0)); await rested(page)
      const a = (await page.locator(`${row(0)} .sb-grip`).boundingBox())!, b = (await page.locator(row(3)).boundingBox())!
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
      await page.mouse.down()
      await page.mouse.move(b.x + b.width / 2, b.y + 8, { steps: 12 })
      await expect(page.locator('#sbBoard .lift'), 'the row is picked up').toHaveCount(1)
      await page.mouse.up()
      await expect.poll(names, { message: 'the drop re-ordered the list' }).not.toEqual(before)
      const dragged = await names(), to = dragged.indexOf(before[0]!)
      expect(to, 'the carried row went down past two rows or more, so it alone is the row that moved').toBeGreaterThanOrEqual(2)
      expect(dragged.filter(x => x !== before[0]), 'and every other row kept its order').toEqual(before.slice(1))
      const place = async () => { await nearTop(page, item(to)); const at = await rested(page)
        expect((await spot(page, item(to)))!.inView, 'the place the row was dropped at is in view').toBe(true)
        expect((await spot(page, item(0)))!.inView, 'the head of the list is out of view above').toBe(false)
        return at }
      await place()
      await undo(page)
      await expect.poll(names, { message: 'Undo put the order back' }).toEqual(before)
      await rested(page)
      const up = (await spot(page, item(0)))!
      expect(up.inView, `the row that moved is on screen after Undo, at the head again (box ${up.top}–${up.bottom}, list ${up.viewTop}–${up.viewBottom})`).toBe(true)
      expect(up.value).toBe(before[0])
      const at = await place()
      await redo(page)
      await expect.poll(names, { message: 'Redo carried it down again' }).toEqual(dragged)
      expect(await rested(page), 'Redo of a row that lands in view moves nothing').toBe(at)
      const down = (await spot(page, item(to)))!
      expect(down.inView, 'and the row that moved is in view where it landed').toBe(true)
      expect(down.value).toBe(before[0])
    })

    /* finding 3 (Astra's steps): a rejected input's remark retyped under Personal Inputs, the panel folded, Undo — the
       remark went back inside a folded panel, with no row drawn to bring on screen */
    test('a rejected input\'s remark retyped, Personal Inputs folded, the board scrolled away: Undo opens the panel and brings its line into view; in view, Redo and Undo move nothing', async ({ page }) => {
      await page.locator(PI_HEAD).scrollIntoViewIfNeeded(); await page.locator(PI_HEAD).click()
      const iid = await inputOf(page, 'Meeting')
      expect(iid, 'the demo Monday carries a Meeting under Personal Inputs').toBeTruthy()
      const LINE = `#sbBoard [data-inprow="${iid}"]`, RMK = `#sbBoard [data-ifld="${iid}.rmks"]`
      await page.locator(`${LINE} [data-acc="x"]`).click()
      await expect(page.locator(`${LINE} [data-acc="x"]`), 'rejected: its Reject button is gone').toHaveCount(0)
      await page.locator(RMK).click(); await page.keyboard.press('End'); await page.keyboard.type(' u7')
      await page.locator('#sbBoard .sb-panel.pinp .sb-pinote').click()
      await expect.poll(async () => (await spot(page, RMK))?.value, { message: 'the remark is kept' }).toContain('u7')
      await page.locator(PI_HEAD).scrollIntoViewIfNeeded(); await page.locator(PI_HEAD).click()
      await expect(page.locator(PI_ROWS), 'the panel is folded').toHaveCount(0)
      await list(page, 'top'); await rested(page)
      expect((await spot(page, PI_HEAD))!.inView, 'Personal Inputs is out of view').toBe(false)
      await undo(page)
      await expect.poll(async () => (await spot(page, RMK))?.value ?? 'folded', { message: 'Undo opened the panel and took the words back' }).not.toMatch(/u7|folded/)
      const at = await rested(page)
      const back = (await spot(page, LINE))!
      expect(back.inView, `the input's line is on screen after Undo (box ${back.top}–${back.bottom}, list ${back.viewTop}–${back.viewBottom})`).toBe(true)
      /* now open and in view: nothing moves, either way (D672) */
      await redo(page)
      await expect.poll(async () => (await spot(page, RMK))?.value).toContain('u7')
      expect(await rested(page), 'Redo of a line in view moves nothing').toBe(at)
      await undo(page)
      await expect.poll(async () => (await spot(page, RMK))?.value).not.toContain('u7')
      expect(await rested(page), 'Undo of a line in view moves nothing').toBe(at)
    })

    /* finding 4: a sign-off is a record of the day that is not one of its boxes — it named nothing */
    test('a sign-off picked, the board scrolled to its foot: Undo brings the sign-off line into view; Redo, now in view, moves nothing', async ({ page }) => {
      const PICK = '#sbSign select[data-sign="cur"]', LINE = '#sbSignBar'
      await page.locator(PICK).selectOption('dj')
      await expect.poll(() => page.locator(PICK).inputValue()).toBe('dj')
      await list(page, 'foot'); await rested(page)
      const out = (await spot(page, LINE))!
      test.skip(out.inView, 'the sign-off line is in view from the foot at this size: nothing to bring down')
      await undo(page)
      await expect.poll(() => page.locator(PICK).inputValue(), { message: 'Undo took the sign-off back' }).toBe('')
      const at = await rested(page)
      const back = (await spot(page, LINE))!
      expect(back.inView, `the sign-off line is on screen after Undo (box ${back.top}–${back.bottom}, list ${back.viewTop}–${back.viewBottom})`).toBe(true)
      await redo(page)
      await expect.poll(() => page.locator(PICK).inputValue()).toBe('dj')
      expect(await rested(page), 'Redo of a sign-off in view moves nothing').toBe(at)
    })

    /* the narrow read, finding 5: nothing stood behind "a publish Undo from the foot lands on the sign-off line" */
    test('a day signed and published, the board scrolled to its foot: Undo and Redo each bring the sign-off line into view; in view, Undo moves nothing', async ({ page }) => {
      const LINE = '#sbSignBar'
      for (const who of ['cur', 'sked', 'plan', 'appr']) {
        const PICK = `#sbSign select[data-sign="${who}"]`
        const name = await page.locator(PICK).evaluate(e => [...(e as HTMLSelectElement).options].map(o => o.value).find(v => v)!)
        await page.locator(PICK).selectOption(name)
        await expect.poll(() => page.locator(PICK).inputValue(), { message: `${who} is signed` }).toBe(name)
      }
      const published = () => page.evaluate(() => /^\s*Signed/.test(document.querySelector('#sbSignBar')!.textContent || ''))
      await page.locator('#sbSign [data-beak]:visible').first().click()
      await expect.poll(published, { message: 'the day is published' }).toBe(true)
      await list(page, 'foot'); await rested(page)
      test.skip((await spot(page, LINE))!.inView, 'the sign-off line is in view from the foot at this size: nothing to bring down')
      await undo(page)
      await expect.poll(published, { message: 'Undo took the publish back' }).toBe(false)
      await rested(page)
      const back = (await spot(page, LINE))!
      expect(back.inView, `the sign-off line is on screen after Undo (box ${back.top}–${back.bottom}, list ${back.viewTop}–${back.viewBottom})`).toBe(true)
      await list(page, 'foot'); await rested(page)
      await redo(page)
      await expect.poll(published, { message: 'Redo published it again' }).toBe(true)
      const at = await rested(page)
      const again = (await spot(page, LINE))!
      expect(again.inView, `the sign-off line is on screen after Redo (box ${again.top}–${again.bottom}, list ${again.viewTop}–${again.viewBottom})`).toBe(true)
      await undo(page)
      await expect.poll(published).toBe(false)
      expect(await rested(page), 'Undo of a publish with the sign-off line in view moves nothing').toBe(at)
    })

    /* finding 4, the hidden warning: on a phone the issues list heads the board's one scroller and goes out of view
       with it; on a desktop it stands in the side column and scrolls on its own, the warning's line still in sight —
       there neither the board's list nor the issues list may move (D672). The change is the warning's own LINE. */
    test('a warning hidden, the board scrolled to its foot: Undo brings the warning\'s line into view where it was out of it, and moves nothing where it was in view', async ({ page }) => {
      const BAR = '#sbWarn .wh', X = '#sbWarn .wln-mute'
      if (!(await page.locator(`${X}:visible`).count())) await page.locator(BAR).click()
      const was = (await spot(page, BAR))!.value
      const ix = await page.locator(`${X}:visible`).first().evaluate(b => b.closest('.wln')!.getAttribute('data-wix'))
      const LINE = `#sbWarn .wln[data-wix="${ix}"]`
      await page.locator(`${X}:visible`).first().click()
      await expect.poll(async () => (await spot(page, BAR))?.value, { message: 'the bar counts one issue fewer' }).not.toBe(was)
      /* the issues list's own place, where it scrolls on its own (a desktop) — at its head, the warning's line in sight */
      await page.evaluate(() => { document.querySelector('#sbWarn')!.scrollTop = 0 })
      await list(page, 'foot'); const foot = await rested(page)
      const own = () => page.evaluate(() => Math.round(document.querySelector('#sbWarn')!.scrollTop))
      const out = (await spot(page, LINE))!, ownAt = await own()
      if (size === DESK) expect(out.inView, 'on a desktop the warning\'s line is in view from the board\'s foot').toBe(true)
      await undo(page)
      await expect.poll(async () => (await spot(page, BAR))?.value, { message: 'Undo flagged it again' }).toBe(was)
      const at = await rested(page)
      const back = (await spot(page, LINE))!
      expect(back.inView, `the warning's line is on screen after Undo (box ${back.top}–${back.bottom}, list ${back.viewTop}–${back.viewBottom})`).toBe(true)
      if (out.inView) {
        expect(at, 'its line was in view all along: Undo moved the board\'s list nowhere').toBe(foot)
        expect(await own(), '…and the issues list nowhere').toBe(ownAt)
      }
      const ownBack = await own()
      await redo(page)
      await expect.poll(async () => (await spot(page, BAR))?.value).not.toBe(was)
      expect(await rested(page), 'Redo of a hidden warning whose line is in view moves nothing').toBe(at)
      expect(await own(), '…nor the issues list').toBe(ownBack)
    })

    /* the narrow read, finding 2: the LAST warning of a long issues list hidden, the list back at its head — its bar in
       view, the warning's own line far down it. The bar in view counted as "the change in view", and the line came back
       unseen. The line is the change wherever the list lays it out. */
    test('a warning low in a long issues list hidden, the list back at its head with its bar in view: Undo brings the warning\'s own line into view', async ({ page }) => {
      const BAR = '#sbWarn .wh', X = '#sbWarn .wln-mute'
      if (!(await page.locator(`${X}:visible`).count())) await page.locator(BAR).click()
      const head = async () => { await page.evaluate(() => { document.querySelector('#sbWarn')!.scrollTop = 0 }); await list(page, 'top'); await rested(page) }
      const own = () => page.evaluate(() => Math.round(document.querySelector('#sbWarn')!.scrollTop))
      const still = async () => { let a = -1, b = await own(); while (a !== b) { await page.waitForTimeout(250); a = b; b = await own() } return rested(page) }
      const ix = await page.locator(`${X}:visible`).last().evaluate(b => b.closest('.wln')!.getAttribute('data-wix'))
      const LINE = `#sbWarn .wln[data-wix="${ix}"]`
      await head()
      test.skip((await spot(page, LINE))!.inView, 'the whole issues list is in view from its head at this size: nothing to bring up')
      const was = (await spot(page, BAR))!.value
      await page.locator(`${X}:visible`).last().click()
      await expect.poll(async () => (await spot(page, BAR))?.value, { message: 'the bar counts one issue fewer' }).not.toBe(was)
      await head()
      expect((await spot(page, BAR))!.inView, 'the issues bar is in view').toBe(true)
      await undo(page)
      await expect.poll(async () => (await spot(page, BAR))?.value, { message: 'Undo flagged it again' }).toBe(was)
      await still()
      const back = (await spot(page, LINE))!
      expect(back.inView, `the warning's own line is on screen after Undo (box ${back.top}–${back.bottom}, list ${back.viewTop}–${back.viewBottom})`).toBe(true)
    })

    /* finding 5: a SANS availability card is a button that opens its input — neither finder of a change's box knew it */
    test('a SANS availability card changed from its window, the board scrolled back to its top: Undo brings the card into view; Redo, now in view, moves nothing', async ({ page }) => {
      const CARD = '#sbBoard .sb-panel.sansav .sanscard'
      const remark = () => page.evaluate(() => String(((window as any).INPUTS as any[]).find(x => x.type === 'SANS Availability' && x.date === 'Jul 13')?.remarks || ''))
      await page.locator(CARD).first().scrollIntoViewIfNeeded(); await page.locator(CARD).first().click()
      await page.waitForSelector('#inpEditPop:not([hidden]) .airpop-box')
      await page.locator('#inpEditRmk').fill('u9 card')
      await page.locator('#inpEditSave').click()
      await expect.poll(remark, { message: 'the card\'s input is changed' }).toBe('u9 card')
      await list(page, 'top'); await rested(page)
      const out = (await spot(page, CARD))!
      test.skip(out.inView, 'the SANS panel is in view from the top at this size: nothing to bring up')
      await undo(page)
      await expect.poll(remark, { message: 'Undo took the change back' }).not.toBe('u9 card')
      const at = await rested(page)
      const back = (await spot(page, CARD))!
      expect(back.inView, `the card is on screen after Undo (box ${back.top}–${back.bottom}, list ${back.viewTop}–${back.viewBottom})`).toBe(true)
      expect(await page.evaluate(() => (window as any).CURPAGE), 'and the board is still the page').toBe('editsched')
      /* the card grows a line when its remark comes back, and Undo left it only just clear of the foot: give it room
         first, so Redo's change is wholly in view before and after */
      await nearTop(page, CARD); const room = await rested(page)
      expect((await spot(page, CARD))!.inView, 'the card is in view, with room under it').toBe(true)
      expect(room, 'the list was moved for the room').not.toBe(at)
      await redo(page)
      await expect.poll(remark).toBe('u9 card')
      expect(await rested(page), 'Redo of a card in view moves nothing').toBe(room)
      expect((await spot(page, CARD))!.inView, 'and the card is still wholly in view').toBe(true)
    })
  })
}

/* finding 1 (Astra 1, the fresh Opus reader F1): THE DESKTOP LAYOUT PINCHED ON A PHONE (D1107, D1109). Inside the zoomed
   day the list scrolls in its own units while every box is measured on the screen (ui/pinchzoom.ts) — pinched small the
   landing fell short, the change still above the screen; pinched large it overshot. By two real fingers, over CDP, as
   e2e/pinchzoom.spec.ts does. Up and down only: sideways is not handled (the known limit), so only the box's height on
   screen is asked. */
test.describe('[BOARD-UNDO-SAME-DAY] the desktop layout pinched on his iPhone', () => {
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
  const touch = (cdp: CDPSession, type: string, pts: number[][]) =>
    cdp.send('Input.dispatchTouchEvent', { type: type as any, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x!), y: Math.round(y!), id: i + 1 })) })
  async function pinch(cdp: CDPSession, cx: number, cy: number, d0: number, d1: number, steps = 10) {
    const at = (i: number) => { const d = d0 + (d1 - d0) * i / steps; return [[cx - d / 2, cy], [cx + d / 2, cy]] }
    await touch(cdp, 'touchStart', [at(0)[0]!]); await sleep(30)
    await touch(cdp, 'touchStart', at(0)); await sleep(30)
    for (let i = 1; i <= steps; i++) { await touch(cdp, 'touchMove', at(i)); await sleep(16) }
    await touch(cdp, 'touchEnd', []); await sleep(350)
  }
  const zoom = (page: Page) => page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#schedBoard .sb-main')!).zoom || '1'))
  async function wide(browser: Browser, baseURL: string | undefined) {
    const context = await browser.newContext({ baseURL, viewport: PHONE, isMobile: true, hasTouch: true })
    const page = await context.newPage()
    await login(page); await go(page, 'editsched')
    await page.locator('#eWeek [data-sbday="0"]:visible').first().tap()
    await expect(page.locator('#schedBoard:not([hidden])')).toBeVisible()
    await page.locator('#sbMore').tap(); await page.locator('#sbMoreWide').tap()
    await expect(page.locator('#schedBoard.sb-wide')).toBeVisible()
    await sleep(300)
    return { context, page, cdp: await context.newCDPSession(page) }
  }

  for (const [name, fingers, lo, hi] of [['small', [[240, 120]], 0.3, 0.75], ['to twice its size', [[60, 300], [60, 300]], 1.9, 2.05]] as const) {
    test(`pinched ${name}: a change near the top, the day scrolled to its foot — Undo brings it just under the bar; Redo, now in view, moves nothing`, async ({ browser, baseURL }) => {
      const { context, page, cdp } = await wide(browser, baseURL)
      try {
        for (const [d0, d1] of fingers) await pinch(cdp, 200, 450, d0, d1)
        const z = await zoom(page)
        expect(z, 'the day is pinched').toBeGreaterThan(lo); expect(z).toBeLessThan(hi)
        const m = await mark(page, 'first')
        expect(m.room, 'the day is long enough to scroll the change out of view').toBeGreaterThan(300)
        await retype(page, ' u6')
        await scrollTo(page, 'foot'); await settled(page)
        expect((await where(page)).inView, 'the changed remark is out of view before Undo').toBe(false)
        await undo(page)
        await expect.poll(async () => (await where(page)).value, { message: 'Undo took the words back' }).not.toContain('u6')
        await settled(page)
        const back = await where(page)
        expect(back.inView, `at zoom ${z}: the remark is wholly on screen after Undo (box ${back.top}–${back.bottom}, list ${back.viewTop}–${back.viewBottom})`).toBe(true)
        expect(back.top - back.viewTop, 'it came down to just under the bar, not short of it and not past it').toBeLessThan(40)
        await redo(page)
        await expect.poll(async () => (await where(page)).value, { message: 'Redo put the words back' }).toContain('u6')
        await settled(page)
        expect((await where(page)).scroll, 'Redo of a change in view moves nothing').toBe(back.scroll)
      } finally { await context.close() }
    })
  }
})
