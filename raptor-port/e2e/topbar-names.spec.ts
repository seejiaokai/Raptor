import { test, expect, type Page } from '@playwright/test'
import { login, go } from './app'

/* THE PAGE NAMES BESIDE TALON, OR THE SIDE MENU (owner D1641, D1642, D1643, 4 Nov 26 — ui/navfold.ts, 02-shell.css).
   His picture: on his iPhone held sideways the bar wrapped onto three rows — TALON alone, the page names under it, the
   buttons under those. Now the names stand on the bar's first row beside TALON wherever they all fit, and fold into ☰
   (the side menu, unchanged) where they do not; a phone held sideways always folds. Whether they fit is measured on the
   bar, so this test asks the rule, never a width: the letters of the machine that runs it decide where the line falls.
   Presses are real clicks, taps and keys. */

const TOPBAR = '.topbar:has(#burger)'   // the app's own bar — the Leave War's chrome has a .topbar of its own

/* what the bar shows: is ☰ drawn, are the names seen, and are all the names on TALON's row, none wrapped */
const barState = (page: Page) => page.evaluate(sel => {
  const bar = document.querySelector(sel) as HTMLElement
  const vis = (e: Element | null) => !!e && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none' && (e as HTMLElement).getBoundingClientRect().width > 0
  const mark = bar.querySelector('.mark')!.getBoundingClientRect()
  const links = [...bar.querySelectorAll<HTMLElement>('#topnav a')].filter(a => getComputedStyle(a).display !== 'none')
  const tops = new Set(links.map(a => Math.round(a.getBoundingClientRect().top)))
  const nav = bar.querySelector('#topnav')!.getBoundingClientRect()
  /* one row when every part the bar shows (☰, TALON, the names, the buttons) overlaps every other top to bottom */
  const parts = [...bar.children].filter(vis).map(e => (e as HTMLElement).getBoundingClientRect())
  const oneRow = Math.max(...parts.map(r => r.top)) < Math.min(...parts.map(r => r.bottom))
  return {
    burger: vis(bar.querySelector('#burger')), names: vis(bar.querySelector('#topnav')),
    oneLineOfNames: tops.size === 1, besideTalon: nav.top < mark.bottom && nav.bottom > mark.top,
    rows: oneRow ? 1 : 2, height: Math.round(bar.getBoundingClientRect().height), folded: bar.classList.contains('nav-fold'),
  }
}, TOPBAR)

/* the rule, whatever the width: either the names all stand beside TALON on one line and ☰ is not drawn, or ☰ is drawn
   and the names are not seen — never the names wrapped onto a row of their own under TALON (his picture) */
async function holdsTheRule(page: Page, what: string) {
  const s = await barState(page)
  if (s.folded) {
    expect(s.burger, `${what}: folded, ☰ is drawn`).toBe(true)
    expect(s.names, `${what}: folded, the names are not seen`).toBe(false)
  } else {
    expect(s.burger, `${what}: the names fit, so no ☰`).toBe(false)
    expect(s.names && s.oneLineOfNames && s.besideTalon, `${what}: the names on one line beside TALON — ${JSON.stringify(s)}`).toBe(true)
  }
  return s
}

const errorsOf = (page: Page) => { const errs: string[] = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) }); page.on('pageerror', e => errs.push(String(e))); return errs }

test.describe('on a desktop the names stand beside TALON where they fit, and fold into ☰ where they do not (D1641, D1642)', () => {
  test('a wide desktop: the names beside TALON, no ☰, the whole bar one row; every page and a member alike', async ({ page }) => {
    const errs = errorsOf(page)
    await page.setViewportSize({ width: 1600, height: 900 })
    await login(page)
    for (const p of ['viewsched', 'editsched', 'leavewar', 'inputs'] as const) {
      await go(page, p)
      const s = await holdsTheRule(page, `admin on ${p} at 1600`)
      expect(s.folded, `admin on ${p} at 1600: nothing folds on a wide desktop`).toBe(false)
    }
    /* a click on a page name still takes him there */
    await page.locator('#topnav a[data-page="quals"]').click()
    await page.waitForFunction(() => (window as any).CURPAGE === 'quals')
    expect(errs.filter(e => /ResizeObserver/i.test(e)), 'no resize loop reported').toEqual([])
  })

  for (const width of [1280, 1024, 900, 830]) for (const who of ['a', 'user'] as const) {
    test(`at ${width} wide the rule holds on every page, for ${who === 'a' ? 'an admin' : 'a member'}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await login(page, who)
      for (const p of (who === 'a' ? ['viewsched', 'editsched', 'leavewar'] : ['viewsched', 'leavewar']) as ('viewsched' | 'editsched' | 'leavewar')[]) {
        await go(page, p); await holdsTheRule(page, `${who} on ${p} at ${width}`)
      }
    })
  }

  test('at 830 wide the admin\'s names fold: ☰ opens the menu, and the keyboard reaches ☰, opens it and Escape closes it', async ({ page }) => {
    await page.setViewportSize({ width: 830, height: 800 })
    await login(page); await go(page, 'viewsched')
    const s = await holdsTheRule(page, 'admin at 830')
    expect(s.folded, 'nine names cannot fit beside TALON in 830').toBe(true)
    /* the folded names are out of the keyboard's way: from TALON, Shift+Tab lands on ☰, never on a hidden name */
    await page.locator(`${TOPBAR} .mark`).click()
    await page.keyboard.press('Shift+Tab')
    expect(await page.evaluate(() => document.activeElement?.id)).toBe('burger')
    await page.keyboard.press('Enter')
    await expect(page.locator('#drawer')).toHaveClass(/open/)
    expect(await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.page), 'the keyboard lands on the page he is on').toBe('viewsched')
    await page.keyboard.press('Escape')
    await expect(page.locator('#drawer')).not.toHaveClass(/open/)
    expect(await page.evaluate(() => document.activeElement?.id), 'the keyboard back on ☰').toBe('burger')
    /* a page picked from the menu */
    await page.locator('#burger').click()
    await page.locator('#drawerNav a[data-page="inputs"]').click()
    await page.waitForFunction(() => (window as any).CURPAGE === 'inputs')
    await expect(page.locator('#drawer')).not.toHaveClass(/open/)
    /* widened, the names come back beside TALON by themselves */
    await page.setViewportSize({ width: 1600, height: 800 })
    await expect.poll(async () => (await barState(page)).folded).toBe(false)
    await holdsTheRule(page, 'widened to 1600')
  })
})

test.describe('a phone held sideways is always ☰ and one row, for everyone (D1643)', () => {
  test.use({ viewport: { width: 874, height: 402 }, isMobile: true, hasTouch: true })
  for (const who of ['a', 'user'] as const) {
    test(`${who === 'a' ? 'the admin' : 'a member'}: ☰, TALON and the buttons on one row; the menu scrolls to Logout`, async ({ page }) => {
      const errs = errorsOf(page)
      await login(page, who)
      for (const p of ['viewsched', 'editsched', 'leavewar'] as const) {
        if (p === 'editsched' && who !== 'a') continue
        await go(page, p)
        const s = await holdsTheRule(page, `${who} on ${p}, sideways`)
        expect(s.folded, `${who} on ${p}: a phone on its side always folds`).toBe(true)
        expect(s.rows, `${who} on ${p}: the bar is one row — ${JSON.stringify(s)}`).toBe(1)
      }
      await page.locator('#burger').tap()
      await expect(page.locator('#drawer')).toHaveClass(/open/)
      const panel = page.locator('#drawer .drawer-panel')
      expect(await panel.evaluate(el => el.scrollHeight > el.clientHeight), 'the menu is taller than the sideways screen').toBe(true)
      /* a real turn of the wheel over the menu scrolls the menu, not the page behind it, down to Logout */
      const box = (await panel.boundingBox())!
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 200)
      await expect.poll(() => panel.evaluate(el => Math.round(el.scrollTop))).toBeGreaterThan(0)
      const out = page.locator('#drawerLogout')
      const r = (await out.boundingBox())!
      expect(r.y + r.height, 'Logout scrolled into the sideways screen').toBeLessThanOrEqual(402)
      expect(errs.filter(e => /ResizeObserver/i.test(e)), 'no resize loop reported').toEqual([])
    })
  }
})
