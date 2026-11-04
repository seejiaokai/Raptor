import { test, expect, type Page } from '@playwright/test'
import { login, go } from './app'

/* THE KEYBOARD AND WINDOWS BATCH (5 Nov 26 — his answers D1645–D1647 on the mock-up page docs/mock/2026-11-05-keys-windows/).
   What only a browser can see — jsdom lets every press through and draws nothing (the rules in every order:
   ui/barfree.test.tsx, ui/boardmenukeys.test.tsx):
   · D1645 — over "Jump to a date", the day-details window and the document viewer the browser finds Undo itself at Undo's
     middle, a real press there leaves the window open, the box sits below the bar, and another bar control (the bell)
     closes the window first; Escape after a real press on Undo still closes "Jump to a date", the keys back on its button;
   · D1646 — a board menu opened by Enter wears the app's cyan ring on its first pick, a menu opened by the mouse wears none
     and leaves the keys where they were; a day chip and the day name pressed by the keys keep them, ringed; Tab goes round
     the board;
   · D1647 — an admin's Traffic window on View-only Sched is the read list. */

const DESK = { width: 1229, height: 584 }        // his PC: 1536 × 730 at 125%, in the page's own pixels
const PHONE = { width: 402, height: 874 }        // his iPhone's screen

/* what the browser finds at a control's middle — the control itself, or what lies over it */
async function hitAt(page: Page, sel: string) {
  return page.evaluate(s => {
    const el = [...document.querySelectorAll(s)].find(e => (e as HTMLElement).offsetWidth) as HTMLElement | undefined
    if (!el) return { found: false, isIt: false, over: '' }
    const r = el.getBoundingClientRect()
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) as HTMLElement | null
    return { found: true, isIt: !!hit && (hit === el || el.contains(hit)), over: hit ? (hit.id || hit.className || hit.tagName) : '' }
  }, sel)
}
/* a window's box against the bar over it */
async function boxAgainstBar(page: Page, box: string, bar: string) {
  return page.evaluate(([b, q]) => {
    const r = (document.querySelector(b) as HTMLElement).getBoundingClientRect()
    const f = ([...document.querySelectorAll(q)].find(e => (e as HTMLElement).offsetHeight) as HTMLElement).getBoundingClientRect()
    return { boxTop: r.top, boxFoot: r.bottom, barFoot: f.bottom, vh: innerHeight }
  }, [box, bar] as const)
}
/* an undoable change: a line of traffic added through its own window, the window closed */
async function change(page: Page) {
  await page.locator('#eWeek [data-air]:visible').first().click()
  await page.locator('#airAdd').click()
  await page.locator('#airDone').click()
}
const focusAt = (page: Page) => page.evaluate(() => {
  const a = document.activeElement as HTMLElement | null
  return a ? { tag: a.tagName, id: a.id, label: a.getAttribute('aria-label'), cls: a.className, ring: a.matches(':focus-visible'),
    outline: getComputedStyle(a).outlineColor + ' ' + getComputedStyle(a).outlineWidth + ' ' + getComputedStyle(a).outlineStyle,
    data: { ...a.dataset }, inMenu: !!a.closest('.wavemenu'), inBoard: !!a.closest('#schedBoard') } : null
})
const ACCENT = () => 'rgb(59, 198, 232)'           // the app's --accent, dark theme

for (const [name, size] of [['his PC', DESK], ['his iPhone', PHONE]] as const) {
  test.describe(`[D1645] the bar stays pressable — ${name} (${size.width}×${size.height})`, () => {
    test.use({ viewport: size, hasTouch: size === PHONE })

    test('Jump to a date: Undo is met at its middle and keeps the window open; the box below the bar; the bell closes it', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      await change(page)
      await page.locator('button[aria-label="Jump to a date"]:visible').first().click()
      await expect(page.locator('#weekCal:not([hidden])')).toBeVisible()
      const at = await hitAt(page, '#undoBtn')
      expect(at.found, 'the top bar\'s Undo is on screen').toBe(true)
      expect(at.isIt, `a press at Undo's middle meets Undo, not ${at.over}`).toBe(true)
      await page.locator('#undoBtn').click({ timeout: 3000 })
      await expect(page.locator('#weekCal:not([hidden])'), 'the window stays open through Undo').toBeVisible()
      const m = await boxAgainstBar(page, '#weekCal .airpop-box', '.topbar:has(#burger)')
      expect(m.boxTop, `the box's top (${m.boxTop}) is below the bar's foot (${m.barFoot})`).toBeGreaterThanOrEqual(m.barFoot - 0.5)
      expect(m.boxFoot).toBeLessThanOrEqual(m.vh + 0.5)
      await page.locator('#notifyBell').click({ timeout: 3000 })
      await expect(page.locator('#weekCal:not([hidden])'), 'the bell closed it').toHaveCount(0)
    })

    test('the day-details window over the Scheduler Board: the board\'s Undo is met at its middle', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      await change(page)
      await page.locator('#eWeek .day[data-day="0"] .dt.sb-open').click()
      await expect(page.locator('#schedBoard:not([hidden])')).toBeVisible()
      await page.locator('#schedBoard .dinfobtn:visible').first().click()
      await expect(page.locator('#dayPop:not([hidden])')).toBeVisible()
      const at = await hitAt(page, '#sbUndo')
      expect(at.isIt, `a press at the board's Undo meets it, not ${at.over}`).toBe(true)
      await page.locator('#sbUndo').click({ timeout: 3000 })
      await expect(page.locator('#dayPop:not([hidden])'), 'the window stays open through Undo').toBeVisible()
      const m = await boxAgainstBar(page, '#dayPop .airpop-box', '#schedBoard .sb-top')
      expect(m.boxTop, `the box's top (${m.boxTop}) is below the board's bar (${m.barFoot})`).toBeGreaterThanOrEqual(m.barFoot - 0.5)
      await page.locator('#dayPopClose').click()
    })

    test('the document viewer over the Medical page: the bar is met at its middle, the box below it; the bell closes it', async ({ page }) => {
      await login(page); await go(page, 'inputs')
      await page.locator('#inMedBtn').click()
      await page.locator('.medsec.med-pend .medcard').first().scrollIntoViewIfNeeded()
      await page.locator('.medsec.med-pend .medcard').first().click()
      await expect(page.locator('#docViewPop:not([hidden])')).toBeVisible()
      const bell = await hitAt(page, '#notifyBell')
      expect(bell.isIt, `a press at the bell meets it, not ${bell.over}`).toBe(true)
      const m = await boxAgainstBar(page, '#docViewPop .docviewbox', '.topbar:has(#burger)')
      expect(m.boxTop, `the box's top (${m.boxTop}) is below the bar's foot (${m.barFoot})`).toBeGreaterThanOrEqual(m.barFoot - 0.5)
      await page.locator('#notifyBell').click({ timeout: 3000 })
      await expect(page.locator('#docViewPop:not([hidden])'), 'the bell closed it').toHaveCount(0)
    })
  })
}

test.describe('[D1645] over a window that keeps the bar covered, his PC', () => {
  test.use({ viewport: DESK })
  test("the document viewer opened over an input's own window on Edit Schedule keeps its whole veil: the bar stays covered", async ({ page }) => {
    await login(page); await go(page, 'editsched')
    const door = page.locator('#eWeek .day[data-day="0"] [data-inpedit]:visible').first()
    await door.scrollIntoViewIfNeeded()
    await door.click()
    await page.waitForSelector('#inpEditPop:not([hidden]) .airpop-box')
    await page.locator('#inpEditPop .docfield input[type=file]').first().setInputFiles({ name: 'cert.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 %%EOF') })
    await page.locator('#inpEditPop .docopen').first().click()
    await expect(page.locator('#docViewPop:not([hidden])')).toBeVisible()
    const at = await hitAt(page, '#undoBtn')
    expect(at.found && !at.isIt, `the input window's veil still lies over Undo (met: ${at.over})`).toBe(true)
    expect(await page.locator('#docViewPop').evaluate(n => n.classList.contains('air-below')), 'the viewer keeps its whole veil').toBe(false)
  })
})

test.describe('[D1645] real keys at his PC', () => {
  test.use({ viewport: { width: 1536, height: 864 } })
  test('Escape closes Jump to a date after a real press on Undo, the keys back on its button', async ({ page }) => {
    await login(page); await go(page, 'editsched')
    await change(page); await change(page)
    const cal = page.locator('button[aria-label="Jump to a date"]:visible').first()
    await cal.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#weekCal:not([hidden])')).toBeVisible()
    await page.locator('#undoBtn').click()
    await expect(page.locator('#weekCal:not([hidden])')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#weekCal:not([hidden])'), 'Escape closed it').toHaveCount(0)
    expect((await focusAt(page))?.label, 'the keys are back on its button').toBe('Jump to a date')
  })
})

test.describe('[D1646] the Scheduler Board by the keys, at his PC', () => {
  test.use({ viewport: { width: 1536, height: 864 } })

  test('a menu opened by Enter is on its first pick, the cyan ring on it; ↓ moves; opened by the mouse, no ring and the keys stay', async ({ page }) => {
    await login(page); await go(page, 'editsched')
    await page.locator('#eWeek .day[data-day="2"] .dt.sb-open').click()
    const blk = page.locator('#sbBoard [data-dwadd]').first()
    await blk.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('.wavemenu')).toHaveCount(1)
    const f = await focusAt(page)
    expect(f?.inMenu && f.cls.includes('wm'), 'the keys on the first pick').toBe(true)
    expect(f?.ring, 'the keyboard ring shows').toBe(true)
    expect(f?.outline, 'the app\'s cyan ring').toContain(ACCENT())
    await page.keyboard.press('ArrowDown')
    expect((await focusAt(page))?.inMenu, '↓ stays in the menu').toBe(true)
    await page.keyboard.press('Escape')
    await expect(page.locator('.wavemenu')).toHaveCount(0)
    expect((await focusAt(page))?.data.dwadd, 'Escape: back on + Block').toBeDefined()
    /* the mouse */
    await page.locator('#sbBoard [data-dwadd]').first().click()
    await expect(page.locator('.wavemenu')).toHaveCount(1)
    const m = await focusAt(page)
    expect(m?.inMenu, 'opened by the mouse: the keys are not moved into it').toBe(false)
    const ringed = await page.evaluate(() => [...document.querySelectorAll('.wavemenu button')].some(b => b.matches(':focus-visible')))
    expect(ringed, 'no ring in a menu opened by the mouse').toBe(false)
    await page.keyboard.press('Escape')
  })

  test('↓ on the plans selector opens it on its first pick; Enter picks, the keys back on the selector', async ({ page }) => {
    await login(page); await go(page, 'editsched')
    await page.locator('#eWeek .day[data-day="2"] .dt.sb-open').click()
    const sel = page.locator('#schedBoard [data-planmenu]').first()
    await sel.focus()
    await page.keyboard.press('ArrowDown')
    await expect(page.locator('.wavemenu')).toHaveCount(1)
    expect((await focusAt(page))?.inMenu).toBe(true)
    await page.keyboard.press('Enter')
    await expect(page.locator('.wavemenu')).toHaveCount(0)
    await expect.poll(async () => (await focusAt(page))?.data.planmenu, { message: 'the keys back on the plans selector' }).toBeDefined()
  })

  test('a day chip and the day name pressed by the keys keep them, ringed; Tab goes round the board', async ({ page }) => {
    await login(page); await go(page, 'editsched')
    await page.locator('#eWeek .day[data-day="2"] .dt.sb-open').click()
    await page.locator('#sbDays [data-sbtab="4"]').focus()
    await page.keyboard.press('Enter')
    await expect.poll(async () => (await focusAt(page))?.data.sbtab, { message: 'the keys on the chip pressed' }).toBe('4')
    const c = await focusAt(page)
    expect(c?.ring && c.outline.includes(ACCENT()), 'the cyan ring on the chip').toBe(true)
    await expect(page.locator('#sbDays [data-sbtab="4"].on')).toHaveCount(1)
    /* Tab round the board: from its last stop to its first */
    const last = await page.evaluate(() => {
      const b = document.getElementById('schedBoard')!
      const s = [...b.querySelectorAll<HTMLElement>('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"]),[contenteditable="true"],[contenteditable=""]')]
        .filter(n => n.tabIndex >= 0 && !(n as HTMLButtonElement).disabled && !n.closest('[hidden], [inert]') && n.getClientRects().length > 0)
      s[s.length - 1]!.setAttribute('data-kw-last', '1'); s[0]!.setAttribute('data-kw-first', '1')
      return s.length
    })
    expect(last).toBeGreaterThan(1)
    await page.locator('[data-kw-last]').focus()
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => document.activeElement?.hasAttribute('data-kw-first')), 'Tab from the last stop: the first').toBe(true)
    await page.keyboard.press('Shift+Tab')
    expect(await page.evaluate(() => document.activeElement?.hasAttribute('data-kw-last')), 'Shift+Tab: the last').toBe(true)
    await page.locator('#sbDone').click()
    /* the day name on Edit Schedule's week */
    const dn = page.locator('#eWeek .day[data-day="3"] .dow.crewday')
    await page.locator('#eWeek .day[data-day="3"] .dt.sb-open').focus()
    await page.keyboard.press('Shift+Tab')
    expect((await focusAt(page))?.data.crewday, 'Shift+Tab from the date reaches the day name').toBe('3')
    await page.keyboard.press('Enter')
    const d = await focusAt(page)
    expect(d?.ring && d.outline.includes(ACCENT()), 'the cyan ring on the day name').toBe(true)
    await expect(dn).toBeVisible()
  })
})

test.describe('[D1647] Traffic on View-only Sched, an admin', () => {
  test.use({ viewport: DESK })
  test('the read list: no box, no Add row', async ({ page }) => {
    await login(page); await go(page, 'viewsched')
    await page.locator('#vWeek [data-air]:visible').first().click()
    await expect(page.locator('#airpop:not([hidden])')).toBeVisible()
    await expect(page.locator('#airBody .airview')).toBeVisible()
    await expect(page.locator('#airBody [data-airi]')).toHaveCount(0)
    await expect(page.locator('#airAdd')).toHaveCount(0)
  })
})
