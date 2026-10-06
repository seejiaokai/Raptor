import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { go, login } from './app'

/* [REST-BLANK-LINE] (D602, 6 Oct 26) — A BLANK CREWED LINE DOES NOT HIDE A CREW-REST BREACH, in a real browser.
   The engine half is engine/restblank.test.ts. What only the running app can prove: the fault is reached through the
   app's OWN controls — "+ Wave", "+ Line" (it mints the blank line), the time boxes, a tap on a seat and a tap on the
   crew list — and what the scheduler then SEES: the red "Crew rest breach" line in Tuesday's list, the red ring PAINTED
   on the man's Tuesday puck, and the dotted "breaks tomorrow" ring PAINTED on his Monday puck (a class switched on is
   not a ring seen — bug-check order, anti-pattern 21). Before the fix all three went the moment he was seated on the
   new line. Built at desktop width (the board's crew list is beside it there); read again at phone width after a
   reload, which also proves the result is worked out afresh from what was saved. */

const DESK = { width: 1440, height: 900 }
const PHONE = { width: 390, height: 844 }
const MON = 0, TUE = 1, WHO = 'waldo'     // Scribe — idle across the demo week

const nWaves = (page: Page, di: number) => page.evaluate(i => (window as any).DAYS[i].waves.length, di)
const nLines = (page: Page, di: number, gi: number) => page.evaluate(([i, g]) => (window as any).DAYS[i].waves[g].formations.length, [di, gi] as const)

/* the day's board, opened by the date in its heading — the scheduler's own door */
async function board(page: Page, di: number) {
  const open = await page.evaluate(() => { const b = document.querySelector('#schedBoard') as HTMLElement | null; return b && b.offsetWidth ? (window as any).SBDAY : null })
  if (open === di) return
  if (open != null) { await page.locator('#sbDone:visible, #sbClose:visible').first().click(); await expect(page.locator('#schedBoard')).toBeHidden() }
  await page.evaluate(i => {
    const d = document.querySelector(`#eWeek .day[data-day="${i}"]`) as HTMLElement
    const sc = (d.closest('.week') || d.parentElement) as HTMLElement
    if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = d.offsetLeft - ((sc.firstElementChild as HTMLElement)?.offsetLeft || 0)
    window.scrollTo(0, 0)
  }, di)
  await page.locator(`#eWeek .day[data-day="${di}"] [data-sbday="${di}"]`).first().click()
  await expect(page.locator('#schedBoard')).toBeVisible()
  await expect.poll(() => page.evaluate(() => (window as any).SBDAY)).toBe(di)
}
async function closeBoard(page: Page) {
  if (!(await page.locator('#schedBoard:visible').count())) return
  await page.locator('#sbDone:visible, #sbClose:visible').first().click()
  await expect(page.locator('#schedBoard')).toBeHidden()
}
/* "+ Wave" → a plain flying wave: its one line comes up blank */
async function addWave(page: Page, di: number) {
  await board(page, di)
  const n = await nWaves(page, di)
  const b = page.locator(`#schedBoard [data-wvadd="${di}"]`).first()
  await b.scrollIntoViewIfNeeded(); await b.click()
  await page.locator('.wavemenu [data-wmkind=""]').first().click()
  await expect.poll(() => nWaves(page, di)).toBe(n + 1)
  return n            // no house wave order in the demo world: the new wave is the day's last
}
/* "+ Line" on a wave: a new BLANK line */
async function addLine(page: Page, di: number, gi: number) {
  await board(page, di)
  const n = await nLines(page, di, gi)
  const b = page.locator(`#schedBoard [data-gline="${di}.${gi}"]`).first()
  await b.scrollIntoViewIfNeeded(); await b.click()
  await expect.poll(() => nLines(page, di, gi)).toBe(n + 1)
  const f = await page.evaluate(([i, g, k]) => { const x = (window as any).DAYS[i].waves[g].formations[k]; return [x.cs, x.to, x.ld] }, [di, gi, n] as const)
  expect(f, 'the new line is blank — no callsign, no take-off, no landing').toEqual(['', '', ''])
  return n
}
/* type into one of a line's boxes and leave it */
async function type(page: Page, di: number, gi: number, fi: number, field: 'cs' | 'to' | 'ld' | 'br', value: string) {
  await board(page, di)
  const el = page.locator(`#schedBoard [data-bfld="ff:${di}.${gi}.${fi}.${field}"]:visible, #schedBoard [data-txt="ff:${di}.${gi}.${fi}.${field}"]:visible`).first()
  await el.scrollIntoViewIfNeeded(); await el.click(); await el.fill(value); await el.evaluate(e => (e as HTMLElement).blur())
  await expect.poll(() => page.evaluate(([i, g, k, fl]) => String((window as any).DAYS[i].waves[g].formations[k][fl] || ''), [di, gi, fi, field] as const)).toBe(value)
}
/* arm the back seat, tap his name in the crew list */
async function seat(page: Page, di: number, gi: number, fi: number, who = WHO) {
  await board(page, di)
  const key = `${di}.${gi}.${fi}.0.w`
  const s = page.locator(`#schedBoard [data-slot="${key}"]`).first()
  await s.scrollIntoViewIfNeeded(); await s.click()
  const p = page.locator(`#sbRoster .rpuck[data-person="${who}"]:visible`).first()
  await p.scrollIntoViewIfNeeded(); await p.click()
  await expect.poll(() => page.evaluate(([i, g, k]) => (window as any).DAYS[i].waves[g].formations[k].aircraft[0].w, [di, gi, fi] as const)).toBe(who)
  await page.keyboard.press('Escape')
}
async function flight(page: Page, di: number, gi: number, fi: number, cs: string, to: string, ld: string) {
  await type(page, di, gi, fi, 'cs', cs); await type(page, di, gi, fi, 'to', to); await type(page, di, gi, fi, 'ld', ld)
  await seat(page, di, gi, fi)
}

/* bring a day of the week into view the way its own scroller does, and open its list */
async function showDay(page: Page, di: number) {
  await page.evaluate(i => {
    const d = document.querySelector(`#eWeek .day[data-day="${i}"]`) as HTMLElement
    const sc = (d.closest('.week') || d.parentElement) as HTMLElement
    if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = d.offsetLeft - ((sc.firstElementChild as HTMLElement)?.offsetLeft || 0)
    window.scrollTo(0, 0)
  }, di)
}
async function listLines(page: Page, di: number) {
  await showDay(page, di)
  const box = page.locator(`#eWeek .day[data-day="${di}"] [data-dwbox="${di}"]`).first()
  await expect(box).toBeVisible()
  if (!(await box.evaluate(e => e.classList.contains('open')))) await page.locator(`#eWeek .day[data-day="${di}"] [data-daywarn="${di}"]`).first().click()
  await expect(box).toHaveClass(/open/)
  return box.locator('.witem[data-wix]').evaluateAll(es => es.map(e => (e as HTMLElement).innerText.replace(/\s+/g, ' ').trim()))
}
/* his pucks on a day of the week, as PAINTED */
const pucks = (page: Page, di: number) => page.evaluate(([i, who]) =>
  [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] .puck[data-person="${who}"]`)].filter(e => (e as HTMLElement).offsetParent !== null).map(e => {
    const cs = getComputedStyle(e)
    return { hard: e.classList.contains('warn') && e.classList.contains('hard'), ring: cs.boxShadow !== 'none', dotted: cs.outlineStyle === 'dotted' && parseFloat(cs.outlineWidth) > 0 }
  }), [di, WHO] as const)

/* the whole breach as the scheduler meets it on the week */
async function expectBreach(page: Page, why: string) {
  await closeBoard(page)
  const tue = await listLines(page, TUE)
  expect(tue.filter(t => /Crew rest breach/.test(t) && /Scribe/.test(t)), `${why} — the red line in Tuesday's list`).toHaveLength(1)
  const pt = await pucks(page, TUE)
  expect(pt.length, `${why} — he is on Tuesday`).toBeGreaterThan(0)
  expect(pt.every(p => p.hard && p.ring), `${why} — every Tuesday puck of his wears the painted red ring`).toBe(true)
  await showDay(page, MON)
  const pm = await pucks(page, MON)
  expect(pm.some(p => p.dotted), `${why} — Monday's puck wears the dotted "breaks tomorrow" ring`).toBe(true)
}

test.describe('a blank crewed line does not hide a crew-rest breach', () => {
  test.use({ viewport: DESK })

  test('TODAY — "+ Line", seat him on the blank line: the warning, the ring and Monday\'s dotted mark all stay; and at phone width after a reload', async ({ page }) => {
    await login(page)
    await go(page, 'editsched')
    const m = await addWave(page, MON); await flight(page, MON, m, 0, 'ZM', '21:00', '22:30')
    const t = await addWave(page, TUE); await flight(page, TUE, t, 0, 'ZT', '07:00', '08:30')
    await expectBreach(page, 'the base case')

    const fi = await addLine(page, TUE, t)
    await seat(page, TUE, t, fi)
    await expectBreach(page, 'seated on the blank line')

    await type(page, TUE, t, fi, 'ld', '15:00')
    await expectBreach(page, 'a landing typed alone')

    /* what was saved is judged afresh, and a phone shows the same */
    await page.setViewportSize(PHONE)
    await page.reload()
    await login(page)
    await go(page, 'editsched')
    await expectBreach(page, 'after a reload, at phone width')
  })

  test('YESTERDAY — a blank crewed line on Monday, in a wave drawn before his late landing, does not stop Tuesday\'s breach', async ({ page }) => {
    await login(page)
    await go(page, 'editsched')
    const b = await addWave(page, MON); await seat(page, MON, b, 0)                      // the blank wave first…
    const m = await addWave(page, MON); await flight(page, MON, m, 0, 'ZM', '21:00', '22:30')   // …then the late line
    expect(m, 'the late line is drawn after the blank one').toBeGreaterThan(b)
    const t = await addWave(page, TUE); await flight(page, TUE, t, 0, 'ZT', '07:00', '08:30')
    await expectBreach(page, 'blank Monday line first')
  })

  test('THE SAME-DAY TIGHT TURN — a blank crewed line drawn between two legs 30 minutes apart does not hide it', async ({ page }) => {
    await login(page)
    await go(page, 'editsched')
    const t = await addWave(page, TUE); await flight(page, TUE, t, 0, 'ZA', '07:30', '09:00')
    const bl = await addLine(page, TUE, t); await seat(page, TUE, t, bl)
    const c = await addLine(page, TUE, t); await flight(page, TUE, t, c, 'ZC', '09:30', '11:00')
    await closeBoard(page)
    const tue = await listLines(page, TUE)
    expect(tue.filter(x => /Tight turn ZA/.test(x) && /ZC/.test(x)), 'the tight turn between ZA and ZC is said').toHaveLength(1)
  })

  test('…and with the LATER leg drawn first (ZC, a blank line, then ZA) the turn is still ZA → ZC', async ({ page }) => {
    /* a sort cannot place a line with no times: the two real legs must be put in time order after it is set aside */
    await login(page)
    await go(page, 'editsched')
    const t = await addWave(page, TUE); await flight(page, TUE, t, 0, 'ZC', '09:30', '11:00')
    const bl = await addLine(page, TUE, t); await seat(page, TUE, t, bl)
    const a = await addLine(page, TUE, t); await flight(page, TUE, t, a, 'ZA', '07:30', '09:00')
    await closeBoard(page)
    const tue = await listLines(page, TUE)
    expect(tue.filter(x => /Tight turn ZA/.test(x) && /ZC/.test(x) && /30 min/.test(x)), 'the tight turn between ZA and ZC is said').toHaveLength(1)
  })
})
