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
