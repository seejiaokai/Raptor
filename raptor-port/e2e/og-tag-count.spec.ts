/* THE CORNER TAG OF A SEAT THAT HOLDS A COUNT ([OG-TAG-OVER-COUNT], 21 Oct 26 — the walk find of 1 Oct 26).

   A changed seat wears a small tag in its top-right corner, drawn as the seat's ::after: the hollow dotted "OG" (a change
   new to you on a day not yet published), the hollow dotted "ALn" (a change waiting on a published day) and the solid
   "ALn" (once issued). On a lone puck the seat is as wide as the puck, so that corner is the puck's own. A placeholder
   puck — ALL AVAIL — also holds its count chip after the puck, which makes the seat wider; the corner then belonged to
   the count, and on a desktop the tag lay over the chip's top edge (measured: tag x 753–772, y 260–270; chip x 749–769,
   y 265–280). On a phone the chip wraps under the puck, so nothing overlapped there.

   What this proves, in a real browser (jsdom paints nothing): for each kind of tag, on every surface that draws it, the
   tag AS PAINTED — worked out from the pseudo-element's own computed box — stands on the puck's own corner (its right
   edge 3px past the puck's, its top 5px above the seat's), clear of the count chip; the tag keeps its look (size, dotted
   or solid, padding, radius, colour — the same as the tag on a seat with no count); and the count chip did not move. */
import { test, expect, type Page } from '@playwright/test'
import { login, go } from './app'

const SIZES = [
  { label: 'desktop', size: { width: 1440, height: 900 } },
  { label: 'phone', size: { width: 390, height: 844 } },
] as const

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

/* A day carrying a Common Programme row, by publication: the page's own state says which. `published` picks the kind. */
async function pickDay(page: Page, published: boolean) {
  return page.evaluate(published => {
    const w = window as any
    for (let d = 6; d >= 0; d--) if (!!w.dayApproved(d) === published && (w.DAYS[d].allhands || []).length) return d
    return -1
  }, published)
}

/* Put ALL AVAIL on the day's first Common Programme row (the app's one write door), and — so a seat of the same kind with
   NO count exists on the same page to compare the look against — change one named man on another seat of the same day
   (a flying seat where the day has one, else a duty, sim or ground seat). */
async function changeDay(page: Page, d: number) {
  await page.evaluate(d => {
    const w = window as any
    w.fillSlot(`a:${d}.0.+`, 'allavail')
    const named = ([...document.querySelectorAll(`#eWeek .day[data-day="${d}"] .seat[data-slot]`)] as HTMLElement[])
      .map(e => e.dataset.slot!).filter(k => k && !/^a:/.test(k) && ['bane', 'stiff', 'pump', 'ignite', 'wolf', 'yeti', 'razer', 'casper'].includes(w.slotVal(k)))
    /* a flying seat first (the app's own kind of changed puck), else whatever named man the day holds */
    const flying = [...document.querySelectorAll(`#eWeek .day[data-day="${d}"] .seat[data-slot]`)] as HTMLElement[]
    const key = (flying.map(e => e.dataset.slot!).find(k => /^\d+\.\d+\.\d+\.\d+\.p$/.test(k) && w.slotVal(k))) || named[0]
    if (key) w.setSlotVal(key, ['bane', 'stiff', 'pump', 'ignite', 'wolf'].find(p => p !== w.slotVal(key)))
    w.afterSchedMutate()
  }, d)
  await page.waitForTimeout(500)
}

/* The seat that holds a count (and one that does not) of one kind of tag, under `root`: the tag's box as painted, the
   chip's, the puck's, and the tag's look. Only elements with a box count (the board is drawn twice). */
async function measure(page: Page, root: string, attr: 'data-og' | 'data-aln' | 'data-alc') {
  return page.evaluate(({ root, attr }) => {
    const seats = [...document.querySelectorAll(`${root} .seat[${attr}]`)] as HTMLElement[]
    const shown = seats.filter(s => { const r = s.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
    const withCount = shown.find(s => s.querySelector('.oilcount'))
    const without = shown.find(s => !s.querySelector('.oilcount') && s.querySelector('.puck'))
    const look = (s: HTMLElement) => {
      const st = getComputedStyle(s, '::after')
      return { content: st.content, fontSize: st.fontSize, top: st.top, padding: st.padding, borderTopStyle: st.borderTopStyle,
        borderRadius: st.borderRadius, color: st.color }
    }
    const box = (r: DOMRect) => ({ x: r.left, y: r.top, w: r.width, h: r.height, right: r.right })
    const tagBox = (s: HTMLElement) => {
      const st = getComputedStyle(s, '::after'), sr = s.getBoundingClientRect()
      const px = (k: string) => parseFloat((st as any)[k]) || 0
      const border = px('borderLeftWidth') + px('borderRightWidth'), pad = px('paddingLeft') + px('paddingRight')
      const vBorder = px('borderTopWidth') + px('borderBottomWidth'), vPad = px('paddingTop') + px('paddingBottom')
      const border_box = st.boxSizing === 'border-box'
      const w = border_box ? px('width') : px('width') + pad + border
      const h = border_box ? px('height') : px('height') + vPad + vBorder
      /* the transform is read as the matrix's own x shift (its 5th number), never assumed to be -width */
      const m = /^matrix\((.+)\)$/.exec(st.transform)
      const tx = m ? parseFloat(m[1].split(',')[4]) : 0
      const left = st.left !== 'auto' ? sr.left + parseFloat(st.left) + tx : sr.right - parseFloat(st.right) - w + tx
      return { x: left, y: sr.top + parseFloat(st.top), w, h }
    }
    const out: any = { found: !!withCount, shownSeats: shown.length, control: without ? look(without) : null }
    if (withCount) {
      const sr = withCount.getBoundingClientRect()
      out.seat = box(sr)
      out.tag = tagBox(withCount)
      out.look = look(withCount)
      out.chip = box(withCount.querySelector('.oilcount')!.getBoundingClientRect())
      out.puck = box(withCount.querySelector('.puck')!.getBoundingClientRect())
      /* the week is a sideways track, so a day may sit off the screen: "inside the screen" is read against its own day card */
      const day = withCount.closest('.day, #schedBoard') as HTMLElement | null
      out.day = day ? box(day.getBoundingClientRect()) : null
    }
    return out
  }, { root, attr })
}

type M = Awaited<ReturnType<typeof measure>>
const fmt = (b: { x: number; y: number; w: number; h: number }) => `x ${b.x.toFixed(1)}–${(b.x + b.w).toFixed(1)}, y ${b.y.toFixed(1)}–${(b.y + b.h).toFixed(1)}`

function check(where: string, m: M, kind: 'OG' | 'ALn', dotted: boolean, phone: boolean) {
  expect(m.found, `${where}: a seat holding a count and wearing the tag exists`).toBe(true)
  expect(m.look.content, `${where}: the tag is painted`).toMatch(kind === 'OG' ? /^"OG"$/ : /^"AL/)
  const t = m.tag, c = m.chip, p = m.puck, s = m.seat
  expect(c.w, `${where}: the count chip is there`).toBeGreaterThan(0)
  const apart = t.x + t.w <= c.x + 0.5 || t.y + t.h <= c.y + 0.5 || c.x + c.w <= t.x + 0.5 || c.y + c.h <= t.y + 0.5
  expect(apart, `${where}: the tag (${fmt(t)}) is clear of the count chip (${fmt(c)})`).toBe(true)
  expect(Math.abs((t.x + t.w) - (p.right + 3)), `${where}: the tag's right edge ${(t.x + t.w).toFixed(1)} stands 3px past the puck's ${p.right.toFixed(1)}`).toBeLessThanOrEqual(1)
  expect(Math.abs(t.y - (s.y - 5)), `${where}: the tag's top ${t.y.toFixed(1)} stands 5px above the seat's ${s.y.toFixed(1)}`).toBeLessThanOrEqual(1)
  expect(m.look.fontSize, `${where}: the tag's type size`).toBe('7.5px')
  expect(m.look.top, `${where}: the tag's top offset`).toBe('-5px')
  if (dotted) expect(m.look.borderTopStyle, `${where}: the tag stays hollow and dotted`).toBe('dotted')
  else expect(m.look.borderTopStyle, `${where}: the issued tag stays solid`).not.toBe('dotted')
  if (phone) expect(!!m.day && c.x >= m.day.x - 0.5 && c.x + c.w <= m.day.x + m.day.w + 0.5, `${where}: the chip (${fmt(c)}) is inside its day card (${m.day ? fmt(m.day) : 'none'})`).toBe(true)
  else expect(Math.abs(c.x - (p.right + 3)), `${where}: the chip's left ${c.x.toFixed(1)} did not move off 3px past the puck's ${p.right.toFixed(1)}`).toBeLessThanOrEqual(1)
  if (m.control) {
    for (const k of ['fontSize', 'padding', 'borderTopStyle', 'borderRadius', 'color'] as const)
      expect(m.look[k], `${where}: the tag's ${k} matches the same tag on a seat with no count`).toBe(m.control[k])
  } else {
    console.log(`NOTE ${where}: no seat of this kind without a count on this surface — look compared to the fixed values only`)
  }
}

for (const { label, size } of SIZES) {
  test.describe(`a seat's corner tag clear of its count — ${label}`, () => {
    test.use({ viewport: size })
    const phone = label === 'phone'

    test('OG, on a member\'s View-only Sched', async ({ page }) => {
      await login(page)
      await go(page, 'editsched')
      const d = await pickDay(page, false)
      expect(d, 'a day not yet published with a Common Programme row').toBeGreaterThanOrEqual(0)
      await changeDay(page, d)
      await signOut(page)
      await signIn(page, 'us', 'us')
      await go(page, 'viewsched')
      const root = `#vWeek .day[data-day="${d}"]`
      const seat = page.locator(`${root} .seat:has(.oilcount)`).first()
      await expect(seat).toBeVisible()
      check('the member\'s View-only Sched, OG', await measure(page, root, 'data-og'), 'OG', true, phone)
    })

    test('the waiting ALn on the edit week and the board, then the issued ALn on View-only Sched', async ({ page }) => {
      await login(page)
      await go(page, 'editsched')
      let d = await pickDay(page, true)
      if (d < 0) {
        d = await pickDay(page, false)
        expect(d, 'a day with a Common Programme row to publish').toBeGreaterThanOrEqual(0)
        await page.evaluate(d => {
          const w = window as any
          const g = w.signOf(d); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
          w.setDayApproved(d, true)
        }, d)
        await page.waitForTimeout(300)
      }
      await changeDay(page, d)
      const week = `#eWeek .day[data-day="${d}"]`
      await expect(page.locator(`${week} .seat[data-aln]:has(.oilcount)`).first()).toBeVisible()
      check('the edit week, waiting ALn', await measure(page, week, 'data-aln'), 'ALn', true, phone)

      await page.click(`#eWeek [data-sbday="${d}"]:visible`)
      await page.waitForSelector('#schedBoard:not([hidden])')
      await page.waitForTimeout(700)
      check('the board, waiting ALn', await measure(page, '#schedBoard', 'data-aln'), 'ALn', true, phone)
      await page.click('#sbDone')
      await page.waitForSelector('#schedBoard', { state: 'hidden' })

      await page.evaluate(d => {
        const w = window as any
        const g = w.signOf(d); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
        w.publishALDay(d)
      }, d)
      await page.waitForTimeout(500)
      await go(page, 'viewsched')
      const root = `#vWeek .day[data-day="${d}"]`
      await expect(page.locator(`${root} .seat[data-alc]:has(.oilcount)`).first()).toBeVisible()
      check('View-only Sched, issued ALn', await measure(page, root, 'data-alc'), 'ALn', false, phone)
    })
  })
}
