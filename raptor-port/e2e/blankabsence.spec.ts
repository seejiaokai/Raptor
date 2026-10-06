import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { go, login } from './app'

/* [BLANK-TIMES-ABSENCE] (owner, D605, 6 Oct 26) — A MAN AWAY FOR THE WHOLE DAY IS FLAGGED THE MOMENT HE IS SEATED, ON A
   SEAT WITH NO TIMES YET TOO, in a real browser. The engine half is engine/blankabsence.test.ts (every kind of seat,
   every input type). What only the running app can prove: the seat is reached through the app's OWN controls —
   "+ Wave" (its first line comes up blank; a BB wave comes up with no shift times), a tap on the seat, a tap on the
   struck name in the crew list — and what the scheduler then SEES: the red line in the day's list and the red ring
   PAINTED on the puck he was just put on (a class switched on is not a ring seen — bug-check order, anti-pattern 21).
   Before the fix the list said nothing and the puck stayed plain until a take-off was typed.

   The man is the demo week's own: Cobra, on overseas leave for the whole of Wednesday 15 Jul. Built at desktop width
   (the board's crew list is beside it there); read again at phone width after a reload, which also proves the result
   is worked out afresh from what was saved. */

const DESK = { width: 1440, height: 900 }
const PHONE = { width: 390, height: 844 }
const WED = 2, WHO = 'taipan', CS = 'Cobra'     // a pilot — front seat

const nWaves = (page: Page, di: number) => page.evaluate(i => (window as any).DAYS[i].waves.length, di)

/* the day's board, opened by the date in its heading — the scheduler's own door (as e2e/restblank.spec.ts) */
async function board(page: Page, di: number) {
  const open = await page.evaluate(() => { const b = document.querySelector('#schedBoard') as HTMLElement | null; return b && b.offsetWidth ? (window as any).SBDAY : null })
  if (open === di) return
  if (open != null) { await page.locator('#sbDone:visible, #sbClose:visible').first().click(); await expect(page.locator('#schedBoard')).toBeHidden() }
  await showDay(page, di)
  await page.locator(`#eWeek .day[data-day="${di}"] [data-sbday="${di}"]`).first().click()
  await expect(page.locator('#schedBoard')).toBeVisible()
  await expect.poll(() => page.evaluate(() => (window as any).SBDAY)).toBe(di)
}
async function closeBoard(page: Page) {
  if (!(await page.locator('#schedBoard:visible').count())) return
  await page.locator('#sbDone:visible, #sbClose:visible').first().click()
  await expect(page.locator('#schedBoard')).toBeHidden()
}
/* "+ Wave" → a kind from its menu: '' is the plain flying wave, 'bb' the BB standby wave */
async function addWave(page: Page, di: number, kind: '' | 'bb') {
  await board(page, di)
  const n = await nWaves(page, di)
  const b = page.locator(`#schedBoard [data-wvadd="${di}"]`).first()
  await b.scrollIntoViewIfNeeded(); await b.click()
  await page.locator(`.wavemenu [data-wmkind="${kind}"]`).first().click()
  await expect.poll(() => nWaves(page, di)).toBe(n + 1)
  const f = await page.evaluate(([i, g]) => { const x = (window as any).DAYS[i].waves[g].formations[0]; return [x.to, x.ld] }, [di, n] as const)
  expect(f, 'the new line comes up with no take-off / shift start and no landing / end').toEqual(['', ''])
  return n            // no house wave order in the demo world: the new wave is the day's last
}
async function type(page: Page, di: number, gi: number, fi: number, field: 'cs' | 'to' | 'ld', value: string) {
  await board(page, di)
  const el = page.locator(`#schedBoard [data-bfld="ff:${di}.${gi}.${fi}.${field}"]:visible, #schedBoard [data-txt="ff:${di}.${gi}.${fi}.${field}"]:visible`).first()
  await el.scrollIntoViewIfNeeded(); await el.click(); await el.fill(value); await el.evaluate(e => (e as HTMLElement).blur())
  await expect.poll(() => page.evaluate(([i, g, k, fl]) => String((window as any).DAYS[i].waves[g].formations[k][fl] || ''), [di, gi, fi, field] as const)).toBe(value)
}
/* arm the front seat; his name in the crew list is STRUCK (the warning before he is placed); tap it anyway */
async function seat(page: Page, key: string) {
  const [di, gi, fi, ai] = key.split('.').map(Number)
  await board(page, di)
  const s = page.locator(`#schedBoard [data-slot="${key}"]`).first()
  await s.scrollIntoViewIfNeeded(); await s.click()
  const p = page.locator(`#sbRoster .rpuck[data-person="${WHO}"]:visible`).first()
  await p.scrollIntoViewIfNeeded()
  const struck = await p.evaluate(e => e.classList.contains('no') || getComputedStyle(e, '::after').content !== 'none')
  expect(struck, 'the crew list strikes his name before he is placed').toBe(true)
  await p.click()
  await expect.poll(() => page.evaluate(([i, g, k, a]) => (window as any).DAYS[i].waves[g].formations[k].aircraft[a].p, [di, gi, fi, ai] as const)).toBe(WHO)
  await page.keyboard.press('Escape')
}
async function showDay(page: Page, di: number) {
  await page.evaluate(i => {
    const d = document.querySelector(`#eWeek .day[data-day="${i}"]`) as HTMLElement
    const sc = (d.closest('.week') || d.parentElement) as HTMLElement
    if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = d.offsetLeft - ((sc.firstElementChild as HTMLElement)?.offsetLeft || 0)
    window.scrollTo(0, 0)
  }, di)
}
async function listLines(page: Page, di: number) {
  await closeBoard(page)
  await showDay(page, di)
  const box = page.locator(`#eWeek .day[data-day="${di}"] [data-dwbox="${di}"]`).first()
  await expect(box).toBeVisible()
  if (!(await box.evaluate(e => e.classList.contains('open')))) await page.locator(`#eWeek .day[data-day="${di}"] [data-daywarn="${di}"]`).first().click()
  await expect(box).toHaveClass(/open/)
  return box.locator('.witem[data-wix]').evaluateAll(es => es.map(e => (e as HTMLElement).innerText.replace(/\s+/g, ' ').trim()))
}
/* the puck in ONE seat of the week, as PAINTED */
const seatPuck = (page: Page, key: string) => page.evaluate(([k, who]) => {
  const e = [...document.querySelectorAll(`#eWeek [data-slot="${k}"] .puck[data-person="${who}"], #eWeek .puck[data-slot="${k}"][data-person="${who}"]`)].find(x => (x as HTMLElement).offsetParent !== null)
  if (!e) return null
  const cs = getComputedStyle(e)
  return { hard: e.classList.contains('warn') && e.classList.contains('hard'), ring: cs.boxShadow !== 'none' }
}, [key, WHO] as const)

test.describe('a man away for the whole day is flagged the moment he is seated on a seat with no times', () => {
  test.use({ viewport: DESK })

  test('"+ Wave", seat Cobra (overseas leave all Wednesday) on its blank line: the red line and the painted ring — before any time is typed, with times, without again, and at phone width after a reload', async ({ page }) => {
    await login(page)
    await go(page, 'editsched')
    const said = (ls: string[]) => ls.filter(t => /On leave but planned to fly/.test(t) && t.includes(CS))
    const before = said(await listLines(page, WED)).length

    const gi = await addWave(page, WED, '')
    const key = `${WED}.${gi}.0.0.p`
    await seat(page, key)
    let ls = said(await listLines(page, WED))
    expect(ls.length, 'one new red line the moment he is seated').toBe(before + 1)
    expect(ls.some(t => /planned to fly this line/.test(t)), 'a line with no callsign yet is "this line"').toBe(true)
    expect(ls.some(t => /NaN|undefined/.test(t)), 'no clock that is not there').toBe(false)
    let pk = await seatPuck(page, key)
    expect(pk, 'his puck is drawn in the new seat').toBeTruthy()
    expect(pk!.hard && pk!.ring, 'the red ring is painted on it').toBe(true)

    await type(page, WED, gi, 0, 'cs', 'ZL')
    ls = said(await listLines(page, WED))
    expect(ls.filter(t => /planned to fly ZL/.test(t)), 'named once the line has a callsign').toHaveLength(1)
    expect(ls.length).toBe(before + 1)

    await type(page, WED, gi, 0, 'to', '10:00'); await type(page, WED, gi, 0, 'ld', '11:00')
    expect(said(await listLines(page, WED)).length, 'the same single line once times are typed').toBe(before + 1)
    await type(page, WED, gi, 0, 'to', ''); await type(page, WED, gi, 0, 'ld', '')
    expect(said(await listLines(page, WED)).length, 'and it does not go when they are cleared again').toBe(before + 1)

    /* what was saved is judged afresh, and a phone shows the same */
    await page.setViewportSize(PHONE)
    await page.reload()
    await login(page)
    await go(page, 'editsched')
    expect(said(await listLines(page, WED)).filter(t => /planned to fly ZL/.test(t)), 'after a reload, at phone width').toHaveLength(1)
    pk = await seatPuck(page, key)
    expect(pk && pk.hard && pk.ring, 'the ring is still painted').toBe(true)
  })

  test('a BB wave comes up with no shift times: Cobra in its MAIN seat is "OL but on BB SHIFT — overseas", ring painted', async ({ page }) => {
    await login(page)
    await go(page, 'editsched')
    const gi = await addWave(page, WED, 'bb')
    const key = `${WED}.${gi}.0.0.p`
    await seat(page, key)
    const ls = (await listLines(page, WED)).filter(t => /OL but on BB SHIFT — overseas/.test(t) && t.includes(CS))
    expect(ls, 'the standby line\'s own words, with no hours typed').toHaveLength(1)
    const pk = await seatPuck(page, key)
    expect(pk, 'his puck is drawn in the BB seat').toBeTruthy()
    expect(pk!.hard && pk!.ring, 'the red ring is painted on the BB seat\'s own puck').toBe(true)
  })
})
