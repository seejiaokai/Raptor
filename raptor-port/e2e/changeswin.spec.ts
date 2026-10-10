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
      /* a text detail with text: the dot just OUTSIDE its bottom-right corner too — inside it sat on the last character */
      const t = page.locator('#eWeek [data-txt="ap:1.0.str"]')
      await expect(t).toHaveAttribute('data-histdot', '')
      expect(await t.evaluate(e => { const b = getComputedStyle(e, '::before'); return [b.backgroundColor, b.position, getComputedStyle(e).backgroundImage] }))
        .toEqual([GOLD, 'absolute', 'none'])
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
      const both = await cell.evaluate(e => ({ al: getComputedStyle(e, '::after').content, dot: getComputedStyle(e, '::before').backgroundColor, alc: e.getAttribute('data-alc') }))
      expect(both.alc, 'the change went out as AL1').toBe('1')
      expect(both.al, 'its AL tag still paints').toContain('AL')
      expect(both.dot, 'and the dot paints beside it').toBe(GOLD)
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

/* [HIST-JUMP-EMPTY-SEAT] — THE OWNER'S FIND (10 Oct 26, his iPhone): a tap on a change whose seat is empty now was
   answered "shown on the scheduler board" on Edit Schedule and "shown on the week" on the board — each page sent him to
   the other. A row that lists its people draws a seat only while someone is in it; the tap now lands on the ROW's
   people box. What only a real browser can prove: the box is brought ON SCREEN on a phone, clear of the bar the window
   drops to, with nothing drawn over it — under a real finger at a point, not a scripted press that scrolls first.
   Every kind of row, on both pages, is the loop in src/ui/histjump.test.tsx; the walk is docs/handpass/. */
test.describe('a change whose seat is empty now lands on its row — a phone, by touch', () => {
  test.use({ viewport: PHONE, hasTouch: true })
  const fingerOnLine = async (page: Page, pos: string) => {
    const show = page.locator('.cw-show:visible')
    if (await show.count()) { const b = (await show.boundingBox())!; await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(350) }
    const pt = await page.evaluate(p => {
      const el = ([...document.querySelectorAll('.chgwin button.cw-l')] as HTMLElement[]).find(e => e.offsetParent && (window as any).posKey(e.dataset.cwkey || '') === p)
      if (!el) return null
      const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, hit = document.elementFromPoint(x, y)
      return { x, y, hit: !!hit && (hit === el || el.contains(hit)), inView: r.top >= 0 && r.bottom <= innerHeight }
    }, pos)
    expect(pt, `a line for ${pos} is in the window`).toBeTruthy()
    expect(pt!.inView && pt!.hit, 'the line is on screen with nothing over it').toBe(true)
    await page.touchscreen.tap(pt!.x, pt!.y)
    /* the page glides to the place: measured once it is at rest, while the mark still shows (about 1.4 s) */
    await expect(page.locator('.chgflash')).toHaveCount(1)
    let last = ''
    for (let i = 0; i < 8; i++) {
      const at = await page.evaluate(() => { const e = document.querySelector('.chgflash'); return e ? Math.round(e.getBoundingClientRect().top) + '' : 'none' })
      if (at === last) break
      last = at; await page.waitForTimeout(110)
    }
    return page.evaluate(() => {
      const el = document.querySelector('.chgflash') as HTMLElement | null, t = document.getElementById('toastEl')
      if (!el) return { said: t ? t.textContent || '' : '', fill: '', inView: false, clear: false, onTop: false }
      const r = el.getBoundingClientRect(), bar = document.querySelector('.cw-show') as HTMLElement | null
      const br = bar && bar.offsetParent ? (bar.closest('button') || bar).getBoundingClientRect() : null
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return {
        said: t ? t.textContent || '' : '', fill: el.dataset.fill || '',
        inView: r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth,
        clear: !br || r.bottom <= br.top || r.top >= br.bottom,
        onTop: !!hit && (hit === el || el.contains(hit)),
      }
    })
  }
  test('Edit Schedule, then the Scheduler Board: each lands on SODB\'s people box, on screen, and names no other page', async ({ page }) => {
    await page.goto('/')
    await signIn(page, 'ad', 'a')
    await go(page, 'editsched')
    /* Ranger moves from FLIGHT SAFETY STAND-DOWN into SODB, then on — both seats stand empty (the engine's own writers;
       the walk does it with a mouse) */
    await page.evaluate(() => {
      const w = window as any, man = w.slotVal('a:0.2.0')
      w.setSlotVal('a:0.2.0', ''); w.fillSlot('a:0.0.+', man); w.afterSchedMutate()
      w.setSlotVal('a:0.0.0', ''); w.fillSlot('a:0.3.+', man); w.afterSchedMutate()
    })
    await page.click('#histBtn')
    await page.click('.chgwin .win-tab:has-text("All changes")')
    const week = await fingerOnLine(page, 'a:0.0.0')
    expect(week.said).toBe('That seat is empty now')
    expect(week.fill, 'the mark is on the people box of SODB').toBe('a:0.0.+')
    expect(week.inView, 'on screen').toBe(true)
    expect(week.clear, 'clear of the bar the window dropped to').toBe(true)
    expect(week.onTop, 'nothing is drawn over it').toBe(true)

    await page.evaluate(() => (window as any).openScheduler(0))
    await page.waitForSelector('#sbHist')
    await page.waitForTimeout(1500)     // the first mark has faded
    const board = await fingerOnLine(page, 'a:0.0.0')
    expect(board.said).toBe('That seat is empty now')
    expect(board.fill).toBe('a:0.0.+')
    expect(board.inView, 'on screen').toBe(true)
    expect(board.clear, 'clear of the bar').toBe(true)
    expect(board.onTop, 'nothing is drawn over it').toBe(true)
  })
})
