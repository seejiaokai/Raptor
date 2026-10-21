/* [BOARD-SIDE-WIDTH] — the Scheduler Board's right panel and the crew list, in a real browser (owner D1113, D1116,
   D1118, 21 Oct 26). jsdom has no layout, so what is PAINTED lives here: the grip widens the panel by a real mouse drag,
   to 40% of the window and no further, remembered across a reload and put back to 320 by a double-click; with a desk
   picked a crossed-out man's reason stands beside his puck once the panel is wide and under it at 320, the strike
   across the puck only; on a phone the grip is not there; and Edit Schedule's crew panel, scrolled, keeps its
   "AIRCREW · ‹ day ›" heading in sight under the top bar. */
import { expect, test, type Page } from '@playwright/test'
import { go, login } from './app'

const DESK = { width: 1536, height: 864 }
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function board(page: Page) {
  await go(page, 'editsched')
  await page.locator('#eWeek [data-sbday="0"]:visible').first().click()
  await page.waitForSelector('#schedBoard:not([hidden])'); await sleep(400)
}
const sideW = (page: Page) => page.evaluate(() => Math.round(document.querySelector('#schedBoard .sb-side')!.getBoundingClientRect().width))
async function dragGrip(page: Page, dx: number) {
  const g = await page.locator('#schedBoard [data-sidegrip]').boundingBox()
  const x = g!.x + g!.width / 2, y = g!.y + g!.height / 2
  await page.mouse.move(x, y); await page.mouse.down()
  for (let i = 1; i <= 8; i++) await page.mouse.move(x + dx * i / 8, y)
  await page.mouse.up(); await sleep(150)
}
async function pickDesk(page: Page) {
  const d = page.locator('#schedBoard [data-fill="d:0.0.0.+"]:visible').first()
  await d.scrollIntoViewIfNeeded(); await d.click(); await sleep(400)
  await expect.poll(() => page.evaluate(() => (window as any).ARM && (window as any).ARM.key)).toBe('d:0.0.0.+')
}
/* every crossed-out entry that prints its own reason: is the reason beside the puck (its left at or past the puck's
   right) or under it (its top at or past the puck's foot)? and the strike's painted width */
const reasons = (page: Page) => page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-roster .rcol .rpuck.no.haswhy')].map(e => {
  const p = e.querySelector('.puck')!.getBoundingClientRect(), r = e.querySelector('.rwhy')!.getBoundingClientRect()
  return { beside: r.left >= p.right - 1 && r.top < p.bottom, under: r.top >= p.bottom - 1, strike: parseFloat(getComputedStyle(e, '::after').width), puck: p.width }
}))

test.describe('the board\'s right panel on a desktop (D1113, D1118)', () => {
  test.use({ viewport: DESK })
  test('the grip drags it to 40% and no further, it is remembered, and a double-click puts it back', async ({ page }) => {
    const errs: string[] = []; page.on('pageerror', e => errs.push(String(e)))
    await login(page); await board(page)
    expect(await sideW(page)).toBe(320)
    await dragGrip(page, -150)
    expect(await sideW(page)).toBe(470)
    await dragGrip(page, -600)
    expect(await sideW(page)).toBe(Math.round(DESK.width * 0.4))
    /* remembered on this computer: the page reloaded, the board opened again */
    await page.reload(); await login(page).catch(() => {}); await board(page)
    expect(await sideW(page)).toBe(Math.round(DESK.width * 0.4))
    await page.locator('#schedBoard [data-sidegrip]').dblclick(); await sleep(150)
    expect(await sideW(page)).toBe(320)
    /* the keyboard: ← widens by 20 */
    await page.locator('#schedBoard [data-sidegrip]').focus(); await page.keyboard.press('ArrowLeft'); await sleep(100)
    expect(await sideW(page)).toBe(340)
    expect(errs).toEqual([])
  })
  test('with a desk picked: reasons under the pucks at 320, beside them when wide; the strike across the puck only', async ({ page }) => {
    await login(page); await board(page); await pickDesk(page)
    let r = await reasons(page)
    expect(r.length).toBeGreaterThan(5)
    r.forEach(x => { expect(x.under).toBe(true); expect(Math.round(x.strike)).toBe(Math.round(x.puck) - 6) })
    await dragGrip(page, -300)
    /* the drag is a control, not a click on blank space: the desk is still the one being planned (the walk's find) */
    expect(await page.evaluate(() => (window as any).ARM && (window as any).ARM.key)).toBe('d:0.0.0.+')
    r = await reasons(page)
    expect(r.length).toBeGreaterThan(5)
    r.forEach(x => { expect(x.beside).toBe(true); expect(Math.round(x.strike)).toBe(Math.round(x.puck) - 6) })
  })
})

test.describe('where the new layout must not reach (the blind read)', () => {
  test.use({ viewport: DESK })
  test('the desktop layout (sb-wide) on a wide window has no grip', async ({ page }) => {
    await login(page); await board(page)
    await page.evaluate(() => document.getElementById('schedBoard')!.classList.add('sb-wide'))
    await expect(page.locator('#schedBoard [data-sidegrip]')).toBeHidden()
  })
  test("Edit Schedule's crew panel keeps its own layout: the words under the puck", async ({ page }) => {
    /* an ATT B man with nothing else on Monday wears his words ("ATT B: no flying") on BOTH lists: under his puck on
       Edit Schedule's (its own layout), as the board's rules are the board's alone */
    await login(page)
    await page.evaluate(() => { const P = (window as any).PEOPLE, id = Object.keys(P).find(k => P[k].cs === 'Havoc');
      (window as any).fileInput({ person: id, date: 'Jul 13', allday: true, type: 'ATT B', remarks: '', mod: '2026-07-10' }) })
    await go(page, 'editsched'); await sleep(400)
    const m = await page.evaluate(() => { const e = document.querySelector('.edit-board .eroster .rpuck.grounded.haswhy') as HTMLElement | null
      return e ? { dir: getComputedStyle(e).flexDirection, words: e.querySelector('.rwhy')?.textContent } : null })
    expect(m).toEqual({ dir: 'column', words: 'ATT B: no flying' })
  })
})

test('on a phone the panel has no grip', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  await login(page)
  await go(page, 'editsched')
  await page.locator('#eWeek [data-sbday="0"]:visible').first().tap()
  await page.waitForSelector('#schedBoard:not([hidden])'); await sleep(300)
  await expect(page.locator('#schedBoard [data-sidegrip]')).toBeHidden()
  await context.close()
})

test.describe('Edit Schedule\'s AIRCREW heading stays in sight (D1116)', () => {
  test.use({ viewport: DESK })
  test('scrolled down, the crew panel\'s heading sits under the top bar, not behind it', async ({ page }) => {
    await login(page); await go(page, 'editsched'); await sleep(300)
    await page.evaluate(() => window.scrollTo(0, 900)); await sleep(300)
    const m = await page.evaluate(() => {
      const bar = document.querySelector('.topbar')!.getBoundingClientRect()
      const h = document.querySelector('.edit-board .eroster .er-h')!.getBoundingClientRect()
      const hit = document.elementFromPoint(h.left + 40, h.top + h.height / 2)
      return { scrolled: scrollY, barBottom: bar.bottom, headTop: h.top, onHead: !!hit && !!hit.closest('.er-h') }
    })
    expect(m.scrolled).toBeGreaterThan(400)
    expect(m.headTop).toBeGreaterThanOrEqual(m.barBottom)
    expect(m.onHead).toBe(true)
  })
})

/* [ARROWS-STAY-PUT] (D1122) — arrows around changing words keep their place: pressed again and again, the › is where it
   was, whatever the day's or the month's name */
test.describe('arrows around changing words stay put (D1122)', () => {
  test.use({ viewport: DESK })
  const travel = async (page: Page, prev: string, next: string, n: number) => {
    const xs: number[] = []
    for (let i = 0; i <= n; i++) {
      xs.push(await page.evaluate(([p, q]) => document.querySelector(q)!.getBoundingClientRect().left + document.querySelector(p)!.getBoundingClientRect().left / 1e6, [prev, next]))
      if (i < n) { await page.locator(next).first().click(); await sleep(120) }
    }
    return Math.max(...xs) - Math.min(...xs)
  }
  test('Edit Schedule crew panel ‹ day ›, the Inputs and SANS calendars ‹ month ›', async ({ page }) => {
    await login(page); await go(page, 'editsched'); await sleep(300)
    expect(await travel(page, '.edit-board .eroster [data-crewstep="-1"]', '.edit-board .eroster [data-crewstep="1"]', 6)).toBeLessThan(0.6)
    await go(page, 'inputs'); await sleep(400)
    expect(await travel(page, '#icPrev', '#icNext', 12)).toBeLessThan(0.6)
    await page.locator('#inSansMode').click(); await sleep(400)
    expect(await travel(page, '[data-testid="sc-prev"]', '[data-testid="sc-next"]', 12)).toBeLessThan(0.6)
  })
})

test.describe('the board\'s week arrow and the week buttons stay put (D1122)', () => {
  test.use({ viewport: DESK })
  test('eight weeks on, the board\'s › is where it was; every week button is one width', async ({ page }) => {
    await login(page); await board(page)
    const xs: number[] = []
    for (let i = 0; i < 8; i++) { xs.push(await page.evaluate(() => document.querySelector('#schedBoard [data-sbweek="1"]')!.getBoundingClientRect().left)); await page.locator('#schedBoard [data-sbweek="1"]').click(); await sleep(250) }
    expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(0.6)
    await page.evaluate(() => (document.querySelector('#sbDone') as HTMLElement | null)?.click()); await sleep(400)
    await go(page, 'editsched'); await sleep(300)
    const w = await page.evaluate(() => [...document.querySelectorAll('.wk[data-wk]')].filter(e => (e as HTMLElement).offsetParent).map(e => Math.round(e.getBoundingClientRect().width)))
    expect(w.length).toBeGreaterThan(2); expect(new Set(w).size).toBe(1)
  })
})

/* ROUND 1 OF THE CONSISTENCY LOOK (owner D1125–D1128, 21 Oct 26 — "1 yes, 2 yes, 3 yes, 4 yes"): the Inputs and SANS top rows
   alike, the top bar one line at his PC's width on every page, one search box, Quals' Edit / Done as Logic's. */
test.describe('round 1 of the consistency look (D1125–D1128)', () => {
  test.use({ viewport: DESK })
  test('D1125: on a desktop the Inputs and SANS rows are one line each, the arrows, month and Today in the same places, one month style; the switch stays put', async ({ page }) => {
    await login(page); await go(page, 'inputs'); await sleep(400)
    const read = (sel: string[]) => page.evaluate(sels => sels.map(s => { const e = document.querySelector(s)!, r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { l: r.left, w: r.width, mid: r.top + r.height / 2, h: r.height, fs: cs.fontSize, fw: cs.fontWeight } }), sel)
    const inp = await read(['#inMemberMode', '#icPrev', '.ic-mon', '#icNext', '#icToday', '#inGear'])
    const cal = (await page.locator('#inCalBtn').boundingBox())!
    await page.locator('#inSansMode').click(); await sleep(400)
    const sans = await read(['#inMemberMode', '[data-testid=sc-prev]', '[data-testid=sc-month]', '[data-testid=sc-next]', '[data-testid=sc-today]', '[data-testid=sc-gear]'])
    for (const [i, name] of ['the tabs', '‹', 'the month', '›', 'Today', 'the gear'].entries()) {
      expect(Math.abs(inp[i].l - sans[i].l), `${name}: the same place on both`).toBeLessThan(1.5)
      expect(Math.abs(inp[i].w - sans[i].w), `${name}: the same width on both`).toBeLessThan(1.5)
    }
    for (const row of [inp, sans]) expect(Math.max(...row.map(r => r.mid)) - Math.min(...row.map(r => r.mid)), 'one line').toBeLessThanOrEqual(2)
    for (const i of [1, 3, 4, 5]) { expect(inp[i].h, 'drawn 36 tall').toBe(36); expect(sans[i].h, 'drawn 36 tall').toBe(36) }
    expect([sans[2].fs, sans[2].fw], 'one month style').toEqual([inp[2].fs, inp[2].fw])
    await page.locator('#inMemberMode').click(); await sleep(300)
    await page.locator('#inListBtn').click(); await sleep(400)
    const lst = (await page.locator('#inCalBtn').boundingBox())!
    expect(Math.abs(lst.x - cal.x), 'the switch where it was on the Calendar (D687)').toBeLessThan(0.6)
    await page.locator('#inCalBtn').click(); await sleep(300)
    /* and where the row is narrower and wraps (1366, 1024) — the List keeps the Calendar's month controls' room
       (an invisible copy), so the two rows wrap alike and the switch still never moves */
    for (const w of [1366, 1024]) {
      await page.setViewportSize({ width: w, height: 864 }); await sleep(300)
      const c = (await page.locator('#inCalBtn').boundingBox())!
      await page.locator('#inListBtn').click(); await sleep(350)
      const l = (await page.locator('#inCalBtn').boundingBox())!
      expect([Math.round(l.x * 10) / 10, Math.round(l.y * 10) / 10], `${w}: the switch where it was`).toEqual([Math.round(c.x * 10) / 10, Math.round(c.y * 10) / 10])
      await page.locator('#inCalBtn').click(); await sleep(300)
    }
  })
  test('D1126: at his PC\'s 1536 the top bar is one line on Edit Schedule as on every page', async ({ page }) => {
    await login(page)
    const hs: Record<string, number> = {}
    for (const p of ['editsched', 'viewsched', 'quals', 'inputs', 'leavewar', 'logic']) { await go(page, p); await sleep(250); hs[p] = await page.evaluate(() => Math.round(document.querySelector('.topbar')!.getBoundingClientRect().height)) }
    expect(Math.max(...Object.values(hs)) - Math.min(...Object.values(hs)), 'every page the same height (Edit Schedule’s bar has always been 1px taller) ' + JSON.stringify(hs)).toBeLessThanOrEqual(1)
    expect(hs.editsched, 'one line').toBeLessThan(80)
  })
  test('D1127: every search box wears the app\'s line magnifier, never the emoji', async ({ page }) => {
    await login(page)
    const look = (sel: string) => page.evaluate(s => { const i = document.querySelector(s) as HTMLElement | null; if (!i) return 'missing'; const box = i.parentElement!; return (box.querySelector('svg') ? 'line' : 'none') + (/\u{1F50D}/u.test(box.textContent || '') ? '+emoji' : '') }, sel)
    const seen: Record<string, string> = {}
    await go(page, 'editsched'); await sleep(300); seen.week = await look('#searchE')
    await go(page, 'quals'); await sleep(300); seen.quals = await look('#qFilter')
    await go(page, 'logic'); await sleep(300); seen.logic = await look('#lgSearch')
    await go(page, 'admin'); await sleep(300); seen.admin = await look('#accFind')
    await go(page, 'inputs'); await sleep(300); await page.locator('#inListBtn').click(); await sleep(300); seen.inputs = await look('#inFSearch'); await page.locator('#inCalBtn').click()
    await go(page, 'tracker'); await sleep(600); seen.tracker = await look('#hSearch')
    /* and the Tracker's two others (a fresh reader's find): Show All's filter and the + Add window's search */
    await page.locator('#showAllBtn').click(); await sleep(300); seen.trackerAll = await look('#saSearch'); await page.locator('#saClose').click(); await sleep(200)
    await page.locator('#addStu:visible').first().click(); await sleep(300); seen.trackerAdd = await look('#dlgFilter'); await page.keyboard.press('Escape'); await sleep(200)
    await board(page); seen.board = await look('#searchB')
    expect(seen).toEqual({ week: 'line', quals: 'line', logic: 'line', admin: 'line', inputs: 'line', tracker: 'line', trackerAll: 'line', trackerAdd: 'line', board: 'line' })
    /* the box itself shows where the keyboard is (a fresh reader's find): its border takes the accent while focused */
    await go(page, 'admin'); await sleep(300); await page.locator('#accFind').focus()
    const ring = await page.evaluate(() => { const b = document.querySelector('#accFind')!.parentElement!; return getComputedStyle(b).borderColor })
    await page.locator('#accFind').blur()
    const rest = await page.evaluate(() => getComputedStyle(document.querySelector('#accFind')!.parentElement!).borderColor)
    expect(ring, 'focused, the box shows it').not.toBe(rest)
  })
  test('D1128: Quals reads "✎ Edit" plain, then "Done" blue — as Logic does', async ({ page }) => {
    await login(page)
    const btn = (sel: string) => page.evaluate(s => { const b = document.querySelector(s)!; return [b.textContent!.trim(), b.classList.contains('primary')] }, sel)
    await go(page, 'quals'); await sleep(300)
    const q1 = await btn('#qEdit'); await page.locator('#qEdit').click(); const q2 = await btn('#qSave'); await page.locator('#qSave').click()
    await go(page, 'logic'); await sleep(300)
    const l1 = await btn('#lgEdit'); await page.locator('#lgEdit').click(); const l2 = await btn('#lgDone'); await page.locator('#lgDone').click()
    expect([q1, q2]).toEqual([l1, l2])
    expect([q1, q2]).toEqual([['✎ Edit', false], ['Done', true]])
  })
})
