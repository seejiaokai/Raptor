import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { go } from './app'

/* [DRAFT-PENDING] — the ONE CHANGES WINDOW, in a real browser (the owner's D167, D168, D170, D171, D172; the design of
   record docs/mock/changes-window.html, option A). What only a real browser can prove: the window floats ABOVE the edit
   week and the board (a finger pressing it lands on it — bug-check order §6), the OG tag is PAINTED on the changed puck
   (anti-pattern 21 — a class switched on is not a tag seen; the first look found the tag drawn off its puck), the phone
   panel and its bar after a tap, which of two windows is in front (Astra DP-10), and no sideways page scroll. */

const PHONE = { width: 390, height: 844 }
const DESK = { width: 1440, height: 900 }

async function signIn(page: Page, u: string, p: string) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', u)
  await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(400)
}
async function signOut(page: Page) {
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => /Logout/.test(x.textContent || '')) as HTMLElement | undefined
    if (b) b.click(); else (window as any).logout?.()
  })
  await page.waitForSelector('#luser')
}
/* Hex (a seeded member account) is given the admin role in place through the localhost bridge — the role only, not
   the world (bug-check order §7.7) — and puts two men on Tuesday's first line; then Saber signs in. So the two changes
   are ANOTHER person's, new to Saber (D170). */
async function hexEditsThenSaber(page: Page) {
  await page.goto('/')
  await signIn(page, 'hex', 'x')
  await page.evaluate(() => { (window as any).raptorRole('admin') })
  await go(page, 'editsched')
  await page.evaluate(() => {
    const w = window as any
    w.fillSlot('1.0.0.0.p', 'casper'); w.fillSlot('1.0.0.0.w', 'bane'); w.afterSchedMutate()
  })
  await page.waitForTimeout(300)
  await signOut(page)
  await signIn(page, 'ad', 'a')
  await go(page, 'editsched')
}
/* what a finger pressing the middle of the window's bar and its list lands on */
async function hitInside(page: Page, sel: string) {
  return page.evaluate(sel => {
    const win = document.querySelector(sel) as HTMLElement | null
    if (!win) return { bar: false, body: false }
    const at = (el: Element | null) => { if (!el) return null; const r = el.getBoundingClientRect(); return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) }
    const hb = at(win.querySelector('.win-ttl')), hy = at(win.querySelector('.cw-body'))
    return { bar: !!hb && win.contains(hb), body: !!hy && win.contains(hy) }
  }, sel)
}

for (const [label, size] of [['desktop', DESK], ['phone', PHONE]] as const) {
  test.describe(`the changes window — ${label}`, () => {
    test.use({ viewport: size })

    test('another person\'s changes: the day reads "N new", the OG tag is painted on the changed pucks, the window floats above the week', async ({ page }) => {
      await hexEditsThenSaber(page)
      const chip = page.locator('#eWeek .day[data-day="1"] .day-head .dpend.dnew').first()
      await expect(chip).toHaveText(/2\s*new/)
      /* the OG tag, as PAINTED — its seat positioned so the tag sits on the puck's own corner */
      const og = await page.$eval('#eWeek [data-slot="1.0.0.0.p"]', e => {
        const s = getComputedStyle(e, '::after')
        return { content: s.content, pos: s.position, border: s.borderTopStyle, seat: getComputedStyle(e).position }
      })
      expect(og.content).toBe('"OG"')
      expect(og.pos).toBe('absolute')
      expect(og.border).toBe('dotted')
      expect(og.seat, 'the tag is placed on its own puck').toBe('relative')
      /* a published day's pucks never wear it */
      expect(await page.locator('#eWeek .day[data-day="0"] [data-og]').count()).toBe(0)

      await chip.click()
      await expect(page.locator('.chgwin:not([hidden])')).toBeVisible()
      const hit = await hitInside(page, '.chgwin')
      expect(hit.bar, 'a press on the bar lands on the window').toBe(true)
      expect(hit.body, 'a press on the list lands on the window').toBe(true)
      await expect(page.locator('.chgwin .cw-l')).toHaveCount(2)
      /* no sideways page scroll with it open */
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)

      if (label === 'phone') {
        const box = await page.locator('.chgwin').boundingBox()
        expect(Math.round(box!.x), 'the phone panel: 12px from the left').toBe(12)
        expect(Math.round(size.width - (box!.x + box!.width)), '…and from the right').toBe(12)
      }

      /* a tap takes the schedule there; the window stays (on a phone as its slim bar) */
      await page.locator('.chgwin button.cw-l').first().click()
      await page.waitForTimeout(500)
      await expect(page.locator('.chgwin:not([hidden])')).toBeVisible()
      if (label === 'phone') {
        await expect(page.locator('.chgwin.bar')).toBeVisible()
        await page.click('.chgwin.bar .cw-barbtn')
        await expect(page.locator('.chgwin .cw-seen')).toBeVisible()
      }

      /* Mark all as seen: the chip becomes "N changes", the tags go, the icon's number goes */
      await page.click('.chgwin .cw-seen')
      await page.waitForTimeout(300)
      await expect(page.locator('#eWeek .day[data-day="1"] .day-head .dpend.dchg').first()).toHaveText(/2\s*changes/)
      expect(await page.locator('#eWeek [data-og]').count()).toBe(0)
      expect(await page.locator('#histBtn .chgnum').count()).toBe(0)
    })

    test('the window floats above the scheduler board too', async ({ page }) => {
      await hexEditsThenSaber(page)
      await page.evaluate(() => (window as any).openScheduler(1))
      await page.waitForSelector('#schedBoard')
      await page.click('#sbHist')
      await expect(page.locator('.chgwin:not([hidden])')).toBeVisible()
      const hit = await hitInside(page, '.chgwin')
      expect(hit.bar && hit.body, 'over the board, a press lands on the window').toBe(true)
    })
  })
}

test.describe('two windows — the one pressed last is in front (Astra DP-10)', () => {
  test.use({ viewport: DESK })
  test('the ALL AVAIL window and the changes window trade places on a press, and neither climbs over a modal', async ({ page }) => {
    await hexEditsThenSaber(page)
    await page.evaluate(() => {
      const w = window as any
      w.DAYS[0].allhands = [{ prog: 'SAFETY BRIEF', str: '08:00', end: '10:00', who: 'allavail' }]
      w.afterSchedMutate()
    })
    await page.waitForTimeout(300)
    await page.click('#histBtn')
    await page.locator('#eWeek [data-oilsent]').first().click()
    await expect(page.locator('.availwin:not([hidden])')).toBeVisible()
    /* both sit in the top-right corner: the one opened or pressed last is on top */
    const z = () => page.evaluate(() => [getComputedStyle(document.querySelector('.chgwin')!).zIndex, getComputedStyle(document.querySelector('.availwin')!).zIndex])
    expect(await z(), 'the ALL AVAIL window, just opened, is in front').toEqual(['410', '411'])
    /* a press on the part of the changes window the narrower one does not cover brings it forward */
    const cb = (await page.locator('.chgwin').boundingBox())!
    await page.mouse.click(cb.x + 30, cb.y + cb.height - 30)
    expect(await z(), 'the changes window pressed — in front').toEqual(['411', '410'])
    const top = await page.evaluate(() => { const r = document.querySelector('.availwin')!.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + 20); return !!h && !!(h as HTMLElement).closest('.chgwin') })
    expect(top, 'and a finger over the overlap now lands on it').toBe(true)
    /* …and a modal still sits over both (470) */
    expect(await page.evaluate(() => +getComputedStyle(document.querySelector('.chgwin')!).zIndex < 470)).toBe(true)
  })
})
