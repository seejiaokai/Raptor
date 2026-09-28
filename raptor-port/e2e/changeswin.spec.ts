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

/* [HIST-PHONE-HIDE] + [CHG-BY-ITEM] (28 Sep 26 — D339, D340, D344, D345): what only a real browser can prove — the gold dot
   as PAINTED (anti-pattern 21), where the design puts it and clear of the tags; a published day's AL tag and a dot on one
   detail; the phone's Hide, bar and Show; the bar reachable over the ALL AVAIL window in both orders. */
const GOLD = 'rgb(229, 194, 74)'
async function seatDot(page: Page, sel: string) {
  return page.$eval(sel, e => {
    const b = getComputedStyle(e, '::before')
    return { on: e.hasAttribute('data-histdot'), content: b.content, bg: b.backgroundColor, pos: b.position, w: b.width, right: b.right, bottom: b.bottom }
  })
}
for (const [label, size] of [['desktop', DESK], ['phone', PHONE]] as const) {
  test.describe(`History on — the gold dots — ${label}`, () => {
    test.use({ viewport: size })
    test('every changed detail wears a gold dot while History is on — a seat outside its corner, a typed detail inside it — and none once it is off', async ({ page }) => {
      await hexEditsThenSaber(page)
      await page.evaluate(() => { const w = window as any; w.txtSet('ap:1.0.str', '06:10'); w.afterSchedMutate() })
      await page.waitForTimeout(300)
      expect(await page.locator('#eWeek [data-histdot]').count(), 'History off: no dots').toBe(0)
      await page.click('#histBtn')
      await expect(page.locator('.chgwin:not([hidden])')).toBeVisible()
      const d = await seatDot(page, '#eWeek [data-slot="1.0.0.0.p"]')
      expect(d.on, 'the changed seat is marked').toBe(true)
      expect([d.content, d.bg, d.pos, d.w, d.right, d.bottom], 'a gold 8px dot just outside its bottom-right corner').toEqual(['""', GOLD, 'absolute', '8px', '-4px', '-4px'])
      /* its OG tag still paints at the top right (D172) — the two never share a corner */
      expect(await page.$eval('#eWeek [data-slot="1.0.0.0.p"]', e => getComputedStyle(e, '::after').content)).toBe('"OG"')
      /* a typed detail: the dot inside its corner, as a background image */
      const t = page.locator('#eWeek [data-txt="ap:1.0.str"]')
      await expect(t).toHaveAttribute('data-histdot', '')
      expect(await t.evaluate(e => getComputedStyle(e).backgroundImage)).toContain('radial-gradient')
      /* an untouched seat wears none */
      expect(await page.locator('#eWeek [data-slot="1.0.1.0.p"][data-histdot]').count()).toBe(0)
      await page.click('.chgwin .win-x')
      expect(await page.locator('[data-histdot]').count(), 'History off: every dot goes').toBe(0)
    })

    test("an amended detail on a published day wears its AL tag AND the dot — neither hides the other", async ({ page }) => {
      await hexEditsThenSaber(page)
      /* Monday published (signed, the Original out), a jet's remarks changed and issued as AL1 — the detail now wears its
         "AL1" tag (its ::after, the tag the dot must never take — Fable F1, Astra 04) */
      await page.evaluate(() => {
        const w = window as any
        const sign = () => { const g = w.signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
        sign(); w.setDayApproved(0, true)
        w.txtSet('fr:0.0.0.0', 'HIST CHECK'); w.afterSchedMutate()
        sign(); w.publishALDay(0)
      })
      await page.waitForTimeout(400)
      await page.click('#histBtn')
      await expect(page.locator('.chgwin:not([hidden])')).toBeVisible()
      const cell = page.locator('#eWeek .day[data-day="0"] [data-txt="fr:0.0.0.0"]').first()
      await expect(cell).toHaveAttribute('data-histdot', '')
      const both = await cell.evaluate(e => ({ al: getComputedStyle(e, '::after').content, img: getComputedStyle(e).backgroundImage, alc: e.getAttribute('data-alc') }))
      expect(both.alc, 'the change went out as AL1').toBe('1')
      expect(both.al, 'its AL tag still paints').toContain('AL')
      expect(both.img, 'and the dot paints beside it').toContain('radial-gradient')
    })
  })
}

test.describe('History on a phone — Hide, the bar, Show (D339, D344, D345)', () => {
  test.use({ viewport: PHONE })
  test('Hide sends the panel to the bar at the bottom; the dotted detail is in view and a tap raises its bubble; Show brings it back; ✕ turns History off', async ({ page }) => {
    await hexEditsThenSaber(page)
    await page.click('#histBtn')
    await expect(page.locator('.chgwin:not([hidden])')).toBeVisible()
    await expect(page.locator('.chgwin .cw-hint')).toHaveText('History on: Tap a gold dot on the schedule')
    await page.click('.chgwin .win-hide')
    const bar = page.locator('.chgwin.bar')
    await expect(bar).toBeVisible()
    await expect(bar.locator('.cw-barbtn')).toHaveText(/^History on · \d+ changes?\s*Show ▴$/)
    const bb = (await bar.boundingBox())!
    expect(Math.round(PHONE.height - (bb.y + bb.height)), 'the bar sits at the bottom').toBe(12)
    /* the changed seat, brought into view, is not under the bar and wears its dot; a tap raises its bubble */
    const seat = page.locator('#eWeek .day[data-day="1"] [data-slot="1.0.0.0.p"]')
    await seat.scrollIntoViewIfNeeded()
    await expect(seat).toHaveAttribute('data-histdot', '')
    const hit = await seat.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (e === h || e.contains(h)) })
    expect(hit, 'nothing covers the dotted seat').toBe(true)
    await seat.tap().catch(() => seat.click())
    await expect(page.locator('.histbub')).toBeVisible()
    /* Show brings the panel back; ✕ closes it, History with it */
    await page.click('.chgwin.bar .cw-barbtn')
    await expect(page.locator('.chgwin:not(.bar) .win-tabs')).toBeVisible()
    await page.click('.chgwin .win-hide')
    await page.click('.chgwin.bar .win-x')
    await expect(page.locator('.chgwin:not([hidden])')).toHaveCount(0)
    expect(await page.locator('[data-histdot]').count()).toBe(0)
  })

  for (const order of ['ALL AVAIL first', 'History first'] as const) {
    test(`the hidden bar stays reachable over the ALL AVAIL window — ${order} (Astra 07)`, async ({ page }) => {
      await hexEditsThenSaber(page)
      await page.evaluate(() => { const w = window as any; w.DAYS[0].allhands = [{ prog: 'SAFETY BRIEF', str: '08:00', end: '10:00', who: 'allavail' }]; w.afterSchedMutate() })
      await page.waitForTimeout(300)
      const openAvail = async () => { const p = page.locator('#eWeek [data-oilsent]').first(); await p.scrollIntoViewIfNeeded(); await p.click(); await expect(page.locator('.availwin:not([hidden])')).toBeVisible() }
      const hideHist = async () => { await page.click('#histBtn'); await expect(page.locator('.chgwin:not([hidden])')).toBeVisible(); await page.click('.chgwin .win-hide'); await expect(page.locator('.chgwin.bar')).toBeVisible() }
      if (order === 'ALL AVAIL first') { await openAvail(); await hideHist() } else { await hideHist(); await openAvail() }
      const reach = await page.evaluate(() => {
        const at = (el: Element | null) => { if (!el) return false; const r = el.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (el === h || el.contains(h)) }
        return { show: at(document.querySelector('.chgwin.bar .cw-show')), x: at(document.querySelector('.chgwin.bar .win-x')) }
      })
      expect(reach, 'Show and ✕ are on top').toEqual({ show: true, x: true })
      await page.click('.chgwin.bar .cw-barbtn')
      await expect(page.locator('.chgwin:not(.bar) .win-tabs')).toBeVisible()
    })
  }
})

test.describe('Group by Item — the window as the mock-up draws it (D340, D345)', () => {
  test.use({ viewport: DESK })
  test('Item first and on; one change is one line; two changes to one formation are a header and two lines, the seat named', async ({ page }) => {
    await hexEditsThenSaber(page)
    await page.click('#histBtn')
    await page.click('.chgwin .win-tab:has-text("All changes")')
    await expect(page.locator('.chgwin .cw-g-btn')).toHaveText(['Item', 'Who'])
    await expect(page.locator('.chgwin .cw-g-btn.on')).toHaveText('Item')
    const g = page.locator('.chgwin .cw-g').first()
    await expect(g.locator('.cw-gh')).toContainText('· 2')
    await expect(g.locator('.cw-l')).toHaveCount(2)
    await expect(g.locator('.cw-det').first()).toHaveText(/#1 (FCP|RCP)|FCP|RCP/)
  })
})
