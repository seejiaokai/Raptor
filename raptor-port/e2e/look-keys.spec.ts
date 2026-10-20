import { test, expect, type Page } from '@playwright/test'
import { login, go } from './app'

/* THE LOOK-AND-KEYS SMALL FIXES (the night of 21 Oct 26 — D994's small fixes). Each is something only a real browser can
   see: where a window lands against a bar, whether two marks share pixels, which ring a key press paints.

   [FLOATWIN-TWO-LINE-BAR] — the changes window, the ALL AVAIL window and every window of the shell open at a fixed spot,
   96px down the right edge. The top bar is one line (57–58 tall) on a wide screen, but on the schedule pages and the
   Inputs page it runs to two lines between about 900 and 1366 wide (103–104 tall, measured 21 Oct 26), and the windows
   lay over its last 7px. A window he has not moved now opens 8px under the bar's real bottom (ui/floatwin.ts barsUnder);
   over the Scheduler Board, which covers the top bar, it keeps its corner. A window he has moved keeps its place
   (e2e/save-note.spec.ts, "a changes window he has moved…").

   [INP-OIL-CHIP-PHONE] — on 5 Oct 26 the green OIL chip was painted over a request card's date and time at 390 wide. The
   card has been rebuilt since (the one input card, ui/InputCard.tsx — D723, D777): on a phone its only OIL mark is the
   outlined "OIL?" tag, set in the card's corner row between LATE and the hours. Measured 21 Oct 26 at 390 and 320: no
   overlap, so nothing was changed; this pins it, the worst card first (LATE and OIL? both), and the desktop list's chip.

   [BATCH-14OCT-LEFTOVERS] (a) — the board's "Cancel this item" sheet: its reason chips and "✎ Edit" (and the edit
   list's ▲ ▼ ✕) wore the browser's own ring by keyboard, not the app's cyan one (the design look's K10, D830). */

const CYAN = 'rgb(59, 198, 232)'
const TOPBAR = '.topbar:has(#burger)'

/* ---------------------------------------------------------------------------------------------------------------- */
/* the window's top edge against the bar that lies under it, and what a finger meets in that bar's last 3px */
async function against(page: Page, win: string, bar: string) {
  return page.evaluate(([win, bar]) => {
    const w = [...document.querySelectorAll(win)].find(e => !(e as HTMLElement).hidden && (e as HTMLElement).offsetWidth) as HTMLElement
    const b = [...document.querySelectorAll(bar)].find(e => (e as HTMLElement).offsetHeight) as HTMLElement
    const r = w.getBoundingClientRect(), q = b.getBoundingClientRect()
    const hit = document.elementFromPoint(r.left + r.width / 2, q.bottom - 3)
    return { top: r.top, foot: r.bottom, barBottom: q.bottom, barH: q.height, inBar: !!hit && b.contains(hit), inWin: !!hit && w.contains(hit), vh: innerHeight }
  }, [win, bar] as const)
}
async function allAvailOnMonday(page: Page) {
  await page.evaluate(() => { const w = window as any; w.fillSlot('a:0.0.+', 'allavail'); w.afterSchedMutate() })
  await expect(page.locator('#eWeek [data-oilsent]:visible').first()).toBeVisible()
}

test.describe('[FLOATWIN-TWO-LINE-BAR] a window he has not moved opens clear of the bar under it', () => {
  test('1200 wide, the top bar on two lines: the changes window and the ALL AVAIL window open under its real bottom', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    await login(page); await go(page, 'editsched')
    const bar = await page.locator(TOPBAR).evaluate(b => b.getBoundingClientRect().height)
    expect(bar, 'the premise: at 1200 the bar is two lines').toBeGreaterThan(90)

    await page.locator('#histBtn').click()
    await expect(page.locator('.chgwin:not([hidden])')).toBeVisible()
    let m = await against(page, '.chgwin', TOPBAR)
    expect(Math.round(m.top), `the changes window's top, the bar's foot at ${m.barBottom}`).toBe(Math.round(m.barBottom + 8))
    expect(m.inBar && !m.inWin, "the bar's last 3px are the bar's, not the window's").toBe(true)
    expect(m.foot, 'and its foot is on the screen').toBeLessThanOrEqual(m.vh)
    await page.locator('.chgwin .win-x').click()

    await allAvailOnMonday(page)
    await page.locator('#eWeek [data-oilsent]:visible').first().click()
    await expect(page.locator('.availwin:not([hidden])')).toBeVisible()
    m = await against(page, '.availwin', TOPBAR)
    expect(Math.round(m.top), `the ALL AVAIL window's top, the bar's foot at ${m.barBottom}`).toBe(Math.round(m.barBottom + 8))
    expect(m.inBar && !m.inWin, "the bar's last 3px are the bar's").toBe(true)
  })

  /* 1920, not 1440: where the bar runs to a second line depends on the letters' widths — at 1440 it is one line on his PC
     and two on GitHub's Linux machines (the read's finding 1, 21 Oct 26) — and at 1920 it is one line on both */
  test('1920 wide, the bar on one line: the windows keep the corner they always had', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 })
    await login(page); await go(page, 'editsched')
    expect(await page.locator(TOPBAR).evaluate(b => b.getBoundingClientRect().height), 'one line').toBeLessThan(70)
    await page.locator('#histBtn').click()
    await expect(page.locator('.chgwin:not([hidden])')).toBeVisible()
    expect(Math.round((await against(page, '.chgwin', TOPBAR)).top)).toBe(96)
    await page.locator('.chgwin .win-x').click()
    await allAvailOnMonday(page)
    await page.locator('#eWeek [data-oilsent]:visible').first().click()
    await expect(page.locator('.availwin:not([hidden])')).toBeVisible()
    expect(Math.round((await against(page, '.availwin', TOPBAR)).top)).toBe(96)
  })

  test("1200 wide, over the Scheduler Board: the top bar is covered, so the window keeps its corner", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    await login(page); await go(page, 'editsched')
    await allAvailOnMonday(page)
    await page.locator('#eWeek [data-sbday="0"]:visible').first().click()
    await page.waitForSelector('#schedBoard:not([hidden])')
    await page.locator('#schedBoard [data-oilsent]:visible').first().click()
    await expect(page.locator('.availwin:not([hidden])')).toBeVisible()
    /* the two-line top bar is under the board here, not under the window: the corner stands. (It lies over the right
       end of the board's own bar — a look put to him, OUTSTANDING.md [FLOATWIN-BOARD-BAR]; not changed here.) */
    expect(Math.round((await against(page, '.availwin', TOPBAR)).top)).toBe(96)
  })

  /* TWO WINDOWS HE HAS NOT MOVED, OPEN TOGETHER (the read's finding 2, 21 Oct 26): each asked what lies under its own top
     edge, met the OTHER window there and never the bar, so neither moved down. Opened together where the bar is one
     line, the screen then narrowed until the bar takes two (the read's other route — the board closed under both — is
     not one a mouse can take while the windows cover the board's ✓ Done: [FLOATWIN-BOARD-BAR]). */
  test('both windows open together at 1920, the screen narrowed to 1200: both move under the two-line top bar', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 900 })
    await login(page); await go(page, 'editsched')
    await allAvailOnMonday(page)
    await page.locator('#eWeek [data-oilsent]:visible').first().click()
    await expect(page.locator('.availwin:not([hidden])')).toBeVisible()
    await page.locator('#histBtn').click()
    await expect(page.locator('.chgwin:not([hidden])')).toBeVisible()
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(300)
    for (const sel of ['.availwin', '.chgwin']) {
      await expect(page.locator(`${sel}:not([hidden])`), `${sel} still open`).toBeVisible()
      const m = await against(page, sel, TOPBAR)
      expect(m.barH, 'the premise: two lines at 1200').toBeGreaterThan(90)
      expect(Math.round(m.top), `${sel}'s top, the bar's foot at ${m.barBottom}`).toBe(Math.round(m.barBottom + 8))
    }
  })

  test("1200 wide, a window of the shell (the Inputs list's ⚙ settings) opens under the two-line bar too", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    await login(page); await go(page, 'inputs')
    await page.locator('#inGear').click()
    await expect(page.locator('.floatwin').first()).toBeVisible()
    const m = await against(page, '.floatwin', TOPBAR)
    expect(m.barH, 'the premise: two lines').toBeGreaterThan(90)
    expect(Math.round(m.top)).toBe(Math.round(m.barBottom + 8))
    expect(m.inBar && !m.inWin).toBe(true)
  })
})

/* ---------------------------------------------------------------------------------------------------------------- */
/* inputs filed on Saturday 17 Oct 26 through the app's own filing body (e2e/inputs-batch2.spec.ts `file`): one LATE with
   its OIL question unanswered, one answered, one unanswered — and one with the longest name the roster holds */
async function fileSaturday(page: Page) {
  return page.evaluate(() => {
    const w = window as any, P = w.PEOPLE
    const crew = Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)
    const longest = crew.slice().sort((a, b) => String(P[b].cs).length - String(P[a].cs).length)[0]
    const rows = [{ who: crew[3], more: { mod: '2026-10-16' } }, { who: crew[4], more: { oil: { '2026-10-17': 1 } } }, { who: crew[5] }, { who: longest, more: { mod: '2026-10-16' } }]
    return rows.map((r, i) => { const iid = 'lk-' + i; w.fileInput({ iid, person: r.who, type: 'Duty', date: 'Oct 17', yr: 2026, allday: false, s: 540, e: 720, ...(r.more || {}) }); return iid })
  })
}
/* every mark on a card or a row against everything else drawn on it: the pairs that share pixels */
const CLASHES = (ids: string[]) => ids.map(iid => {
  const host = document.querySelector(`.icard[data-iid="${iid}"], #inBody tr[data-iid="${iid}"]`) as HTMLElement | null
  if (!host || !host.offsetWidth) return { iid, found: false, marks: 0, clashes: [] as string[], outside: [] as string[] }
  const hb = host.getBoundingClientRect()
  const marks = [...host.querySelectorAll('.oiltag, .sd-late, .roil, .latetag')].filter(e => (e as HTMLElement).offsetWidth) as HTMLElement[]
  const parts = [...host.querySelectorAll('.icard-hrs, .icard-who, .icard-kind, .icard-text, .icard-by, .oiltag, .sd-late, td, .roil, .latetag')] as HTMLElement[]
  const clashes: string[] = [], outside: string[] = []
  for (const m of marks) {
    const a = m.getBoundingClientRect()
    if (a.left < hb.left - 0.5 || a.right > hb.right + 0.5) outside.push(m.className)
    for (const p of parts) {
      if (p === m || p.contains(m) || m.contains(p)) continue
      const rg = document.createRange(); rg.selectNodeContents(p)
      for (const b of rg.getClientRects()) if (b.width > 1 && a.left < b.right - 0.5 && a.right > b.left + 0.5 && a.top < b.bottom - 0.5 && a.bottom > b.top + 0.5)
        clashes.push(`${m.className} [${m.textContent}] over ${p.dataset.label || p.className}`)
    }
  }
  return { iid, found: true, marks: marks.length, clashes, outside }
})

test.describe('[INP-OIL-CHIP-PHONE] an input\'s OIL mark shares no pixels with its date and time', () => {
  for (const [w, h] of [[390, 844], [320, 568]] as const) test(`a phone ${w} wide: on the list's cards, LATE, OIL? and the hours stand apart, inside the card`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: w, height: h }, isMobile: true, hasTouch: true })
    const page = await context.newPage()
    try {
      await login(page); await go(page, 'inputs')
      const ids = await fileSaturday(page)
      await page.locator('#inListBtn').click()
      await page.locator('#inRangeBtn').click(); await page.locator('#inRangeAll').click()
      await expect(page.locator(`.icard[data-iid="${ids[0]}"]`)).toBeVisible()
      const got = await page.evaluate(CLASHES, ids)
      for (const g of got) expect(g.found, `${g.iid}: its card is drawn`).toBe(true)
      expect(got[0].marks, 'the worst card wears LATE and OIL? both').toBe(2)
      expect(got.flatMap(g => g.clashes), 'marks over the words beside them').toEqual([])
      expect(got.flatMap(g => g.outside), 'marks past the card\'s edge').toEqual([])
    } finally { await context.close() }
  })

  test('the desktop list, 1024 wide: the row\'s OIL chips share no pixels with its dates', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await login(page); await go(page, 'inputs')
    const ids = await fileSaturday(page)
    await page.locator('#inListBtn').click()
    await page.locator('#inRangeBtn').click(); await page.locator('#inRangeAll').click()
    await expect(page.locator(`#inBody tr[data-iid="${ids[1]}"]`)).toBeVisible()
    const got = await page.evaluate(CLASHES, ids)
    expect(got[1].marks, 'the answered input wears its OIL chip').toBeGreaterThan(0)
    expect(got.flatMap(g => g.clashes)).toEqual([])
  })
})

/* ---------------------------------------------------------------------------------------------------------------- */
test.describe('[BATCH-14OCT-LEFTOVERS] (a) the board\'s Cancel sheet by keyboard', () => {
  test('its reason chips, "✎ Edit" and the edit list\'s ▲ ▼ ✕ wear the app\'s cyan ring when Tab reaches them — and no ring after a click', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await login(page); await go(page, 'editsched')
    await page.locator('#eWeek [data-sbday="1"]:visible').first().click()
    await page.waitForSelector('#schedBoard:not([hidden])')
    await page.locator('#schedBoard [data-pcx]:visible').first().click()
    await expect(page.locator('#cxPop:not([hidden])')).toBeVisible()
    const ring = () => page.evaluate(() => {
      const a = document.activeElement as HTMLElement, s = getComputedStyle(a)
      return { name: (a.getAttribute('aria-label') || a.textContent || '').trim(), q: a.hasAttribute('data-cxq') || a.hasAttribute('data-cxedit') || a.classList.contains('cxedit-mv') || a.classList.contains('cxedit-del'), ring: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}` }
    })
    /* from the reason box, Tab walks the chips, then "✎ Edit" */
    const seen: string[] = []
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab')
      const f = await ring()
      if (!f.q) continue
      seen.push(f.name)
      expect(f.ring, `${f.name}, reached by Tab`).toBe(`solid 2px ${CYAN}`)
      if (f.name.includes('Edit')) break
    }
    expect(seen.length, `the chips and Edit were reached: ${seen.join(', ')}`).toBeGreaterThanOrEqual(2)
    expect(seen.some(n => n.includes('Edit'))).toBe(true)
    /* Enter on "✎ Edit" opens the list; its ▲ ▼ ✕ by Tab */
    await page.keyboard.press('Enter')
    await expect(page.locator('#cxEdit')).toBeVisible()
    await page.locator('#cxEdit .cxedit-name').first().focus()
    let got = 0
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
      const f = await ring()
      if (!f.q) continue
      got++
      expect(f.ring, `${f.name} in the edit list, reached by Tab`).toBe(`solid 2px ${CYAN}`)
    }
    expect(got, 'the edit list\'s buttons were reached').toBeGreaterThan(0)
    /* …and the ring is WHOLE: the list scrolls, and a ring 2px off a button reaches 4px past it — the list must not cut it
       (the read's finding 4, 21 Oct 26: the ✕'s right side, the first row's top, the last row's bottom) */
    const cut = await page.evaluate(() => {
      const list = document.querySelector('#cxEdit .cxedit-list') as HTMLElement, l = list.getBoundingClientRect()
      return [...list.querySelectorAll('.cxedit-mv:not([disabled]), .cxedit-del')].map(b => {
        const r = b.getBoundingClientRect(), o = 4
        const sides = [r.left - o < l.left - 0.5 && 'left', r.right + o > l.left + list.clientWidth + 0.5 && 'right',
          r.top - o < l.top - 0.5 && 'top', r.bottom + o > l.top + list.clientHeight + 0.5 && 'bottom'].filter(Boolean)
        return sides.length ? `${b.getAttribute('aria-label')}: ${sides.join(', ')}` : ''
      }).filter(Boolean)
    })
    expect(cut, 'rings the edit list would cut').toEqual([])
    /* a click is not a keyboard: no ring after a mouse press on a chip */
    await page.locator('#cxEdit [data-cxdone]').click()
    await page.locator('#cxQuick [data-cxq]').first().click()
    expect((await ring()).ring, 'a chip after a mouse press').not.toBe(`solid 2px ${CYAN}`)
  })
})
