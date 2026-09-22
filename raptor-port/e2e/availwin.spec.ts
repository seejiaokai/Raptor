import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { go, login } from './app'

/* [ALL-AVAIL-WINDOW] — the counter's window, in a real browser (owner D38-D41;
   the approved design of record is docs/mock/allavail-window.html).

   WHY THIS FILE EXISTS. Every other check this window had was jsdom, which has
   no layout and no paint: it can prove the window's markup is emitted and say
   nothing about whether a person can see it or press it. Fable's scenario
   design (docs/handpass/2026-09-23-allavail-window-fable-scenarios.md, S1)
   found the window was painted UNDER the scheduler board — `.availwin` sat at
   z-index 150 and `.schedboard` at 400, both root-level fixed siblings — so on
   the board, where the earn half lives, tapping the counter opened a window
   nobody could see or close. 5,727 unit tests passed over it. Only a real
   browser can prove the fix, so the proof lives here. */

const PHONE = { width: 390, height: 844 }
const DESK = { width: 1500, height: 950 }

/* A Common Programme row carrying ALL AVAIL on day 0, then the board opened on
   that day — the same seeding the count-chip geometry tests use, so the chip is
   drawn exactly where a scheduler would find it. */
async function boardWithChip(page: Page) {
  await login(page, 'a')
  await go(page, 'editsched')
  await page.evaluate(() => {
    const w = window as any
    w.DAYS[0].allhands = [{ prog: 'SAFETY BRIEF', str: '08:00', end: '10:00', who: 'allavail' }]
    w.afterSchedMutate()
    w.openScheduler(0)
  })
  await page.waitForSelector('#schedBoard:not([hidden]) [data-oilsent]', { state: 'visible' })
}

/* What a finger pressing the middle of an element actually lands on. Both the
   window's grab bar and its list are asked, because either alone could pass
   while the other half of the window is still covered. */
async function hitInsideWindow(page: Page) {
  return page.evaluate(() => {
    const win = document.querySelector('.availwin:not([hidden])') as HTMLElement | null
    if (!win) return { open: false, bar: false, body: false, landedBar: '(no window)', landedBody: '(no window)' }
    const at = (el: Element | null) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    }
    const nm = (h: Element | null) => h ? ((h as HTMLElement).id ? '#' + (h as HTMLElement).id : '') + '.' + String((h as HTMLElement).className || h.tagName) : '(nothing)'
    const hb = at(win.querySelector('.win-ttl')), hy = at(win.querySelector('.win-body'))
    return {
      open: true,
      bar: !!hb && win.contains(hb),
      body: !!hy && win.contains(hy),
      landedBar: nm(hb),
      landedBody: nm(hy),
    }
  })
}

for (const [label, size] of [['desktop', DESK], ['phone', PHONE]] as const) {
  test(`${label}: the window opened from the board is painted OVER the board, and closes`, async ({ page }) => {
    await page.setViewportSize(size)
    await boardWithChip(page)
    await page.click('#schedBoard [data-oilsent]')
    await page.waitForSelector('.availwin:not([hidden])', { state: 'attached' })

    const h = await hitInsideWindow(page)
    expect(h.open, 'the chip opened the window').toBe(true)
    expect(h.bar, `a press on the window's title landed on "${h.landedBar}"`).toBe(true)
    expect(h.body, `a press on the window's list landed on "${h.landedBody}"`).toBe(true)

    /* The ✕ is the ONLY way to dismiss this window from the board (no scrim, no
       outside-click — its contract), so if it cannot be pressed the window is
       stranded. A real click: Playwright refuses one that something else would
       intercept, which is exactly the failure being pinned. */
    await page.click('.availwin .win-x', { timeout: 3000 })
    await expect(page.locator('.availwin')).toBeHidden()
    await expect(page.locator('#schedBoard')).toBeVisible()
  })
}

/* THE OTHER EDGE OF THE SAME LADDER. The window must sit above the board and
   BELOW every dialog the app raises over it (the drawer, the confirm pop-ups,
   the modals — History's list among them): those block the page on purpose,
   and a floating list painted over a question the app is asking would hide the
   question. All of them are root-level fixed siblings of the window, so their
   computed z-index IS their paint order — read from the built stylesheet, the
   same one the squadron gets. */
test('the window sits above the board and below every dialog layer', async ({ page }) => {
  await page.setViewportSize(DESK)
  await boardWithChip(page)
  await page.click('#schedBoard [data-oilsent]')
  await page.waitForSelector('.availwin:not([hidden])', { state: 'attached' })
  const z = await page.evaluate(() => {
    const zi = (el: Element | null) => el ? parseInt(getComputedStyle(el).zIndex, 10) : NaN
    const win = zi(document.querySelector('.availwin'))
    const board = zi(document.querySelector('#schedBoard'))
    const dialogs = [...document.querySelectorAll('.modal, .airpop, .drawer')]
      .map(el => ({ what: ((el as HTMLElement).id || (el as HTMLElement).className), z: zi(el) }))
    return { win, board, dialogs }
  })
  expect(z.win, 'the window is above the board').toBeGreaterThan(z.board)
  expect(z.dialogs.length, 'the app mounts its dialog layers').toBeGreaterThan(0)
  for (const d of z.dialogs) expect(d.z, `"${d.what}" must cover the window`).toBeGreaterThan(z.win)
})

/* ---- WHERE THE WINDOW SITS (Fable S8, S11, S15) ------------------------------
   The window's position is the one part of it that is pure geometry: jsdom
   reports every rect as 0x0, so none of this can be pinned anywhere else. */
const winRect = (page: Page) => page.evaluate(() => {
  const r = (document.querySelector('.availwin:not([hidden])') as HTMLElement).getBoundingClientRect()
  return { left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height) }
})
async function openFromBoard(page: Page) {
  await page.click('#schedBoard [data-oilsent]')
  await page.waitForSelector('.availwin:not([hidden])', { state: 'visible' })
}
async function dragBar(page: Page, dx: number, dy: number) {
  const b = (await page.locator('.availwin .win-ttl').boundingBox())!
  await page.mouse.move(b.x + 10, b.y + b.height / 2)
  await page.mouse.down()
  await page.mouse.move(b.x + 10 + dx / 2, b.y + b.height / 2 + dy / 2)
  await page.mouse.move(b.x + 10 + dx, b.y + b.height / 2 + dy)
  await page.mouse.up()
}

/* S8 — THE PHONE IS THE DESIGN OF RECORD TOO (D41). The approved mock opens the
   window at phone width as a full-width panel anchored to the bottom, 62% of
   the screen tall. The build pinned an inline 212x540 on the element, and an
   inline size beats the stylesheet's phone rule — so on his phone it came up as
   a 212px column pinned bottom-left. */
test('phone: the window opens as the full-width bottom panel of the approved design (S8)', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await boardWithChip(page)
  await openFromBoard(page)
  const r = await winRect(page)
  expect(r.left, 'a 12px margin on the left').toBe(12)
  expect(PHONE.width - r.right, 'and on the right — full width').toBe(12)
  expect(PHONE.height - r.bottom, 'anchored 12px above the bottom').toBe(12)
  expect(Math.abs(r.height - Math.round(PHONE.height * 0.62)), '62% of the screen tall').toBeLessThanOrEqual(1)
})

test('desktop: the window opens skinny in the top-right corner, 212 wide (D40)', async ({ page }) => {
  await page.setViewportSize(DESK)
  await boardWithChip(page)
  await openFromBoard(page)
  const r = await winRect(page)
  expect(r.width, 'the skinny default').toBe(212)
  expect(DESK.width - r.right, 'the corner').toBe(16)
  expect(r.top).toBe(96)
})

/* S11 — every window starts where the stylesheet puts it. A drag used to leave
   its position on the element, which is reused between windows, so the NEXT
   window opened where the last one had been dragged. */
test('desktop: a window dragged, closed and opened again comes back to its corner (S11)', async ({ page }) => {
  await page.setViewportSize(DESK)
  await boardWithChip(page)
  await openFromBoard(page)
  await dragBar(page, -500, 150)
  const moved = await winRect(page)
  expect(DESK.width - moved.right, 'the drag moved it').toBeGreaterThan(400)
  /* and a re-render — he goes on editing behind it — leaves it where he put it */
  await page.evaluate(() => (window as any).afterSchedMutate())
  await page.waitForTimeout(100)
  expect((await winRect(page)).left, 'a re-render does not throw it back').toBe(moved.left)
  await page.click('.availwin .win-x')
  await openFromBoard(page)
  const again = await winRect(page)
  expect(DESK.width - again.right, 'the new window opens in the corner, not where the last was dragged').toBe(16)
  expect(again.top).toBe(96)
})

/* S15 — a shrink must never strand it. The window has no scrim and no Escape:
   the ✕ on its bar is the ONLY way to close it, so a bar pushed off-screen by a
   narrower browser (or a rotated tablet) is a window that can never be closed. */
test('desktop: a window dragged to the right edge stays reachable when the browser narrows (S15)', async ({ page }) => {
  await page.setViewportSize(DESK)
  await boardWithChip(page)
  await openFromBoard(page)
  await dragBar(page, 0, 300)
  const before = await winRect(page)
  expect(DESK.width - before.right, 'still at the right edge').toBeLessThan(40)
  await page.setViewportSize({ width: 900, height: 700 })
  await page.waitForTimeout(200)
  const after = await winRect(page)
  expect(after.right, 'its right edge is on screen').toBeLessThanOrEqual(900)
  expect(after.left, 'and its left edge').toBeGreaterThanOrEqual(0)
  expect(after.top, 'its bar is on screen').toBeLessThanOrEqual(700 - 42)
  await page.click('.availwin .win-x', { timeout: 3000 })
  await expect(page.locator('.availwin')).toBeHidden()
})

/* ---- the final reads (Astra 3, Fable's placement notes), 23 Sep 26 --------- */
async function boardWithTwoChips(page: Page) {
  await login(page, 'a')
  await go(page, 'editsched')
  await page.evaluate(() => {
    const w = window as any
    w.DAYS[0].allhands = [
      { prog: 'SAFETY BRIEF', str: '08:00', end: '10:00', who: 'allavail' },
      { prog: 'OPS BRIEF', str: '14:00', end: '15:00', who: 'allavail' },
    ]
    w.afterSchedMutate()
    w.openScheduler(0)
  })
  await page.waitForSelector('#schedBoard:not([hidden]) [data-oilsent]', { state: 'visible' })
}

/* ASTRA 3 — a desktop box never beats the phone layout. Dragged on a desktop,
   then the screen narrowed to a phone: the panel is the approved full-width one;
   back to the desktop, and the position he dragged it to comes back. */
test('a window dragged on a desktop becomes the phone panel on a phone, and gets its place back after', async ({ page }) => {
  await page.setViewportSize(DESK)
  await boardWithChip(page)
  await openFromBoard(page)
  await dragBar(page, -400, 120)
  const dragged = await winRect(page)
  await page.setViewportSize(PHONE)
  await page.evaluate(() => (window as any).afterSchedMutate())
  await page.waitForTimeout(250)
  const r = await winRect(page)
  expect(r.left, 'the phone panel, not the desktop box').toBe(12)
  expect(PHONE.width - r.right).toBe(12)
  expect(PHONE.height - r.bottom).toBe(12)
  await page.setViewportSize(DESK)
  await page.waitForTimeout(250)
  expect((await winRect(page)).left, 'the desktop place comes back').toBe(dragged.left)
})

test('phone: a panel dragged down follows a new phone width, bar still reachable', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await boardWithChip(page)
  await openFromBoard(page)
  await dragBar(page, 0, 200)
  const down = await winRect(page)
  expect(down.top, 'it moved down').toBeGreaterThan(400)
  await page.setViewportSize({ width: 430, height: 932 })
  await page.evaluate(() => (window as any).afterSchedMutate())
  await page.waitForTimeout(250)
  const r = await winRect(page)
  expect(r.left).toBe(12)
  expect(430 - r.right, 'full width at the NEW width').toBe(12)
  expect(r.top, 'its bar is on screen').toBeLessThanOrEqual(932 - 42)
})

/* a plain TAP on the bar is not a move: the window keeps following its corner */
test('desktop: a tap on the bar does not pin the window — widening the browser keeps it in its corner', async ({ page }) => {
  await page.setViewportSize(DESK)
  await boardWithChip(page)
  await openFromBoard(page)
  await page.click('.availwin .win-ttl')
  await page.setViewportSize({ width: 1700, height: 950 })
  await page.waitForTimeout(250)
  expect(1700 - (await winRect(page)).right, 'still hugging the right edge').toBe(16)
})

/* a second chip tapped while the window is open keeps the place he gave it */
test('desktop: tapping a second chip while the window is open keeps it where he dragged it', async ({ page }) => {
  await page.setViewportSize(DESK)
  await boardWithTwoChips(page)
  await page.locator('#schedBoard [data-oilsent]:visible').first().click()
  await page.waitForSelector('.availwin:not([hidden])', { state: 'visible' })
  await dragBar(page, -500, 100)
  const placed = await winRect(page)
  /* sent straight to the chip: the dragged window may be over it, and what is
     under test is where the window stays, not whether that chip can be reached */
  await page.evaluate(() => {
    const c = [...document.querySelectorAll('#schedBoard [data-oilsent]')].filter(e => (e as HTMLElement).offsetParent)[1] as HTMLElement
    c.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await page.waitForTimeout(300)
  const r = await winRect(page)
  expect(await page.locator('.availwin .win-ttl').innerText(), 'the second event is showing').toContain('OPS BRIEF')
  expect(r.left, 'in the place he put it').toBe(placed.left)
})
