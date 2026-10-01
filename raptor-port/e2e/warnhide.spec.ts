import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { go, login } from './app'

/* [WARN-HIDE-KEPT] — A HIDDEN WARNING, in a real browser (owner D469 / D471 / D472 / D475, 1 Oct 26; the approved picture
   docs/mock/warn-hide.html). What only a real browser can prove (bug-check order, anti-pattern 21 — a class switched on is
   not a line seen): the hidden line is PAINTED struck through and greyed where it stood; its ↺ is the thing a finger
   lands on; the man's puck is painted with no ring and no chip; and the hide comes back from the browser's own storage
   after a reload and a fresh sign-in — for the scheduler and for a member, who gets no button. Desktop and phone.
   The demo Tuesday: four issues, the last "Static has a long work day". */

const PHONE = { width: 390, height: 844 }
const DESK = { width: 1440, height: 900 }
const TUE = 1, STATIC = 'wolf'

/* bring a day of a week into view the way its own scroller does, and open its list */
async function openList(page: Page, surf: '#eWeek' | '#vWeek', di: number) {
  await page.evaluate(([s, i]) => {
    const d = document.querySelector(`${s} .day[data-day="${i}"]`) as HTMLElement
    const sc = (d.closest('.week') || d.parentElement) as HTMLElement
    if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = d.offsetLeft - ((sc.firstElementChild as HTMLElement)?.offsetLeft || 0)
    window.scrollTo(0, 0)
  }, [surf, di] as const)
  const box = page.locator(`${surf} .day[data-day="${di}"] [data-dwbox="${di}"]`).first()
  await expect(box).toBeVisible()
  if (!(await box.evaluate(e => e.classList.contains('open')))) await page.locator(`${surf} .day[data-day="${di}"] [data-daywarn="${di}"]`).first().click()
  await expect(box).toHaveClass(/open/)
}
/* what a person reads off the day's list: the bar, and each line as it is PAINTED */
const readList = (page: Page, surf: string, di: number) => page.evaluate(([s, i]) => {
  const box = document.querySelector(`${s} .day[data-day="${i}"] [data-dwbox="${i}"]`)!
  const bar = box.querySelector('.daywarn') as HTMLElement
  return {
    bar: bar.innerText.replace(/\s+/g, ' ').trim(), barCls: bar.className,
    lines: [...box.querySelectorAll('.witem[data-wix]')].map(e => {
      const txt = (e.querySelector('.wtx') || e.children[1]) as HTMLElement, cs = getComputedStyle(txt), b = e.querySelector('button.witem-mute') as HTMLElement | null
      let top = false
      if (b) { const r = b.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); top = !!hit && (hit === b || b.contains(hit)) }
      return { ix: +(e as HTMLElement).dataset.wix!, hid: e.classList.contains('hid'), struck: cs.textDecorationLine.includes('line-through'), color: cs.color, btn: b ? b.innerText.trim() : '', btnOnTop: top }
    }),
  }
}, [surf, di] as const)
/* the man's pucks on that day, as painted */
const pucks = (page: Page, scope: string, id: string) => page.evaluate(([s, who]) =>
  [...document.querySelectorAll(`${s} .puck[data-person="${who}"]`)].filter(e => (e as HTMLElement).offsetParent !== null)
    .map(e => ({ warn: e.classList.contains('warn'), chip: !!e.querySelector('.lchip'), ring: getComputedStyle(e).boxShadow !== 'none' && e.classList.contains('warn') })), [scope, id] as const)

for (const [name, vp] of [['desktop', DESK], ['phone', PHONE]] as const) {
  test.describe(`a hidden warning — ${name}`, () => {
    test.use({ viewport: vp, ...(name === 'phone' ? { hasTouch: true, isMobile: true } : {}) })

    test('WH4, WH5, WH3 — Edit Schedule: the line struck in place with ↺, the count without it, the puck plain; WH1 — and after a reload', async ({ page }) => {
      await login(page)
      await go(page, 'editsched')
      await openList(page, '#eWeek', TUE)
      const before = await readList(page, '#eWeek', TUE)
      expect(before.bar).toContain('4 issues')
      expect(before.lines.map(l => l.btn)).toEqual(['✕', '✕', '✕', '✕'])
      expect((await pucks(page, `#eWeek .day[data-day="${TUE}"]`, STATIC)).every(p => p.warn && p.chip), 'Static wears his flag').toBe(true)

      await page.locator(`#eWeek .day[data-day="${TUE}"] [data-woff="${TUE}.3"]`).first().click()
      await expect(page.locator(`#eWeek .day[data-day="${TUE}"] .daywarn`).first()).toContainText('3 issues')
      const after = await readList(page, '#eWeek', TUE)
      expect(after.bar, 'the count line says nothing about a hidden one (D472)').not.toMatch(/hidden/i)
      expect(after.lines.map(l => l.ix), 'four lines, in place').toEqual([0, 1, 2, 3])
      expect(after.lines.map(l => l.hid)).toEqual([false, false, false, true])
      expect(after.lines[3]!.struck, 'painted struck through').toBe(true)
      expect(after.lines[2]!.struck).toBe(false)
      expect(after.lines[3]!.color, 'and greyed, unlike a live line').not.toBe(after.lines[2]!.color)
      expect(after.lines[3]!.btn).toBe('↺')
      expect(after.lines[3]!.btnOnTop, 'the ↺ is what a finger lands on').toBe(true)
      const pk = await pucks(page, `#eWeek .day[data-day="${TUE}"]`, STATIC)
      expect(pk.length, 'his puck is on the day').toBeGreaterThan(0)
      expect(pk.some(p => p.warn || p.chip), 'no ring, no chip (D469)').toBe(false)

      /* the browser's own storage: a reload, a fresh sign-in */
      await page.waitForTimeout(700)   // the save (its 300 ms merge)
      await login(page)
      await go(page, 'editsched')
      await openList(page, '#eWeek', TUE)
      const back = await readList(page, '#eWeek', TUE)
      expect(back.bar, 'still hidden after a reload (D469)').toContain('3 issues')
      expect(back.lines[3]!.hid && back.lines[3]!.struck).toBe(true)

      /* ↺ flags it again */
      await page.locator(`#eWeek .day[data-day="${TUE}"] [data-woff="${TUE}.3"]`).first().click()
      await expect(page.locator(`#eWeek .day[data-day="${TUE}"] .daywarn`).first()).toContainText('4 issues')
      expect((await pucks(page, `#eWeek .day[data-day="${TUE}"]`, STATIC)).every(p => p.warn && p.chip), 'his flag is back').toBe(true)
    })

    test('WH4 — the Scheduler Board: the same line struck in its panel, the heading without it', async ({ page }) => {
      await login(page)
      await go(page, 'editsched')
      await page.evaluate(d => (window as any).openScheduler(d), TUE)
      await page.waitForSelector('#schedBoard .sb-warn')
      const openFold = async () => { if (name !== 'phone') return; if (!(await page.locator('#schedBoard .sbwrap').first().evaluate(e => e.classList.contains('open')))) await page.locator('#schedBoard [data-sbwtog]').first().click() }
      await openFold()
      await page.locator(`#schedBoard [data-woff="${TUE}.3"]`).first().click()
      await expect(page.locator('#schedBoard .sb-warn .wh').first()).toContainText('3 issues')
      await openFold()
      const rows = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-warn .wln[data-wix]')].map(e => {
        const t = e.querySelector('.wln-t') as HTMLElement, b = e.querySelector('button.wln-mute') as HTMLElement
        const r = b.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        return { hid: e.classList.contains('hid'), struck: getComputedStyle(t).textDecorationLine.includes('line-through'), btn: b.innerText.trim(), onTop: !!hit && (hit === b || b.contains(hit)) }
      }))
      expect(rows.map(r => r.hid)).toEqual([false, false, false, true])
      expect(rows[3]).toMatchObject({ struck: true, btn: '↺', onTop: true })
      expect(await page.locator('#schedBoard .sb-warn').innerText()).not.toMatch(/\d+ hidden/)
      expect((await pucks(page, '#schedBoard', STATIC)).some(p => p.warn || p.chip), 'no flag on the board either').toBe(false)
    })

    test('WH2, WH7 — a member signing in after: the count without it, the line struck, and no button', async ({ page }) => {
      await login(page)
      await go(page, 'editsched')
      await openList(page, '#eWeek', TUE)
      await page.locator(`#eWeek .day[data-day="${TUE}"] [data-woff="${TUE}.3"]`).first().click()
      await expect(page.locator(`#eWeek .day[data-day="${TUE}"] .daywarn`).first()).toContainText('3 issues')
      await page.waitForTimeout(700)
      await login(page, 'user')
      await openList(page, '#vWeek', TUE)
      const m = await readList(page, '#vWeek', TUE)
      expect(m.bar).toContain('3 issues')
      expect(m.lines.map(l => l.hid)).toEqual([false, false, false, true])
      expect(m.lines[3]!.struck).toBe(true)
      expect(m.lines.every(l => l.btn === ''), 'no ✕ and no ↺ for a member (D475)').toBe(true)
      expect((await pucks(page, `#vWeek .day[data-day="${TUE}"]`, STATIC)).some(p => p.warn || p.chip)).toBe(false)
    })
  })
}
