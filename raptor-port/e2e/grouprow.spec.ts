import { expect, test, type Page } from '@playwright/test'
import { login, go } from './app'

/* THE SCHEDULE'S ONE ROW FOR A SHARED INPUT, IN THE BUILT APP (`[GROUP-INPUT-ONE-ROW]`; owner D661 — "on the schedule a
   group input is ONE row holding everyone"; D743 — the ten pictures approved as drawn; the plan
   docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.3).
   What only a real browser can say — jsdom has no layout: that the one row's pucks stand two across on a desktop and
   stacked on a phone, inside their People cell on the week and on the board; that on a phone the row's two times stay
   together at its top however tall the pucks make it (the approved picture 2); that Personal Inputs draws the entry as
   one line, two pucks across on a desktop (picture 5); and that all of it is still one row after a reload.
   The rules are unit tests: engine/grouprows.test.ts, state/grouprow-entry.test.ts, ui/grouprow-draw.test.tsx.
   Behaviour register: GI5, and GI21 (the board row's coloured line — D747, at the foot). */
const WIN = '[data-testid="win-inputedit"]'
const ISO = '2026-07-15', DI = 2                    // the demo week's Wednesday, a working day (no OIL question)
const FOUR = ['Drifter', 'Hunter', 'Ranger', 'Tally']
const TITLE = 'Range safety brief'
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const noErrors = (p: Page) => { const errs: string[] = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) }); return errs }

/* file the shared input through the Inputs list's own "+ Input" window: Several people, the date, the times, the title */
async function fileGroup(p: Page, tap: boolean) {
  const press = (sel: string) => (tap ? p.locator(sel).tap() : p.locator(sel).click())
  await go(p, 'inputs')
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) await press('#inListBtn')
  await press('#inNew')
  await expect(p.locator(WIN)).toBeVisible()
  await p.selectOption('#inpEditType', 'Meeting')
  await press(`${WIN} [data-testid="pp-several"]`)
  const ids: string[] = await p.evaluate(names => names.map((cs: string) => Object.keys((window as any).PEOPLE).find(id => (window as any).PEOPLE[id].cs === cs)!), FOUR)
  /* the four, then anyone the picker already held (it opens on the person the window was opened for) taken off */
  for (const id of ids) if ((await p.locator(`${WIN} [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await press(`${WIN} [data-pp="${id}"]`)
  const pressed: string[] = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')!), WIN)
  for (const id of pressed) if (!ids.includes(id)) await press(`${WIN} [data-pp="${id}"]`)
  await expect(p.locator(`${WIN} [data-pp][aria-pressed="true"]`)).toHaveCount(4)
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${ISO}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').innerText()).trim().split(/\s+/)
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m!.toLowerCase())) + 1).padStart(2, '0')}`
    await press(`#inpEdCal button[aria-label="${at < ISO.slice(0, 7) ? 'Next' : 'Previous'} month"]`)
  }
  await press(`#inpEdCal [data-cal="${ISO}"]`); await press(`#inpEdCal [data-cal="${ISO}"]`)
  if (await p.locator('#inpEditAllday').count() && await p.locator('#inpEditAllday').isChecked()) await press('#inpEditAllday')
  await p.fill('#inpEditStart', '14:00'); await p.fill('#inpEditEnd', '15:00')
  await p.fill('#inpEditOwnTitle', TITLE)
  await press('#inpEditSave')
  await expect(p.locator(WIN)).toHaveCount(0)
  await expect.poll(() => p.evaluate(t => (window as any).INPUTS.filter((r: any) => r.title === t).length, TITLE)).toBe(4)
}

/* every row a surface draws for the shared input, measured: the row, its People cell, its pucks in the order drawn */
const measure = (p: Page, where: 'weekGround' | 'weekInputs' | 'boardGround' | 'boardInputs') => p.evaluate(([where, title]) => {
  const norm = (s: any) => String(s || '').trim().toLowerCase()
  const SEL: Record<string, [string, (r: Element) => any]> = {
    weekGround: ['#eWeek .day:not(.peek) .sec-grnd .pl-row', r => r.querySelector('.nm .ntx')?.textContent],
    weekInputs: ['#eWeek .day:not(.peek) .sec-inp .pl-row', r => r.querySelector('.nm .ntx')?.textContent],
    boardGround: ['#schedBoard .sb-panel.grnd .sb-arow', r => (r.querySelector('textarea.ain, input.ain') as HTMLInputElement | null)?.value],
    boardInputs: ['#schedBoard .sb-panel.pinp .sb-arow.inprow', r => r.querySelector('.inpedit')?.textContent],
  }
  const [sel, name] = SEL[where!]!
  const box = (e: Element) => { const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), h: Math.round(r.height) } }
  return [...document.querySelectorAll(sel)].filter(r => norm(name(r)) === norm(title)).map(r => {
    const ts = r.querySelector('.t.t-s'), te = r.querySelector('.t.t-e')
    return { row: box(r), cell: box(r.querySelector('.ppl')!), pucks: [...r.querySelectorAll('.ppl .puck')].map(k => ({ ...box(k), name: (k.querySelector('.nm')?.textContent || '').trim() })), ts: ts ? box(ts) : null, te: te ? box(te) : null }
  })
}, [where, TITLE])
const inside = (m: any) => m.pucks.every((k: any) => k.l >= m.cell.l - 1 && k.r <= m.cell.r + 1 && k.t >= m.cell.t - 1 && k.b <= m.cell.b + 1)

for (const [what, viewport, tap] of [['a desktop', { width: 1440, height: 900 }, false], ['a phone', { width: 390, height: 844 }, true]] as const) {
  test(`${what}: a shared input for four is ONE row on the week and the board — its pucks in their cell, A to Z; Personal Inputs one line; and after a reload`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport, ...(tap ? { isMobile: true, hasTouch: true } : {}) })
    const page = await context.newPage()
    const errs = noErrors(page)
    await login(page)
    await fileGroup(page, tap)

    const look = async (when: string) => {
      await go(page, 'editsched')
      await expect.poll(() => measure(page, 'weekGround').then(r => r.length), { message: `${when}: the week draws it` }).toBe(1)
      const wk = (await measure(page, 'weekGround'))[0]!
      expect(wk.pucks.map((k: any) => k.name), `${when}: A to Z`).toEqual(FOUR)
      expect(inside(wk), `${when}: every puck inside the People cell`).toBe(true)
      if (tap) {
        /* a phone: one puck a line, down the cell; the two times together at the row's top, though the row is four pucks tall */
        for (let i = 1; i < 4; i++) { expect(wk.pucks[i].t, `${when}: puck ${i} under puck ${i - 1}`).toBeGreaterThanOrEqual(wk.pucks[i - 1].b - 1); expect(Math.abs(wk.pucks[i].l - wk.pucks[0].l)).toBeLessThanOrEqual(1) }
        expect(wk.row.h, 'a tall row').toBeGreaterThan(wk.pucks[0].h * 3)
        expect(wk.te.t - wk.ts.b, `${when}: the end time sits right under the start time`).toBeLessThanOrEqual(6)
        expect(wk.ts.t - wk.row.t, `${when}: and both at the top of the row`).toBeLessThanOrEqual(12)
      } else {
        /* a desktop: two across, two down */
        expect(Math.abs(wk.pucks[0].t - wk.pucks[1].t)).toBeLessThanOrEqual(1)
        expect(wk.pucks[1].l).toBeGreaterThan(wk.pucks[0].r - 1)
        expect(wk.pucks[2].t).toBeGreaterThanOrEqual(wk.pucks[0].b - 1)
        expect(Math.abs(wk.pucks[2].l - wk.pucks[0].l)).toBeLessThanOrEqual(1)
      }
      /* Personal Inputs: folded it counts the input once; opened it is one line holding the four */
      const fold = page.locator(`#eWeek .day:not(.peek) [data-pitog="${DI}"]`).first()
      if (/show/.test(await fold.innerText())) {
        expect(await fold.innerText(), `${when}: counted once`).toMatch(/\b1 input · 1 on programme/)
        await (tap ? fold.tap() : fold.click())
      }
      await expect.poll(() => measure(page, 'weekInputs').then(r => r.length), { message: `${when}: one line under Personal Inputs` }).toBe(1)
      const pi = (await measure(page, 'weekInputs'))[0]!
      expect(pi.pucks.map((k: any) => k.name)).toEqual(FOUR)
      expect(inside(pi), `${when}: the line's pucks inside its People cell`).toBe(true)
      if (!tap) expect(Math.abs(pi.pucks[0].t - pi.pucks[1].t), 'a desktop: two across (picture 5)').toBeLessThanOrEqual(1)
      /* the board */
      await page.evaluate(di => (window as any).openScheduler(di), DI)
      await expect.poll(() => measure(page, 'boardGround').then(r => r.length), { message: `${when}: the board draws it` }).toBe(1)
      const bd = (await measure(page, 'boardGround'))[0]!
      expect(bd.pucks.map((k: any) => k.name)).toEqual(FOUR)
      expect(inside(bd), `${when}: the board's pucks wrap inside the People cell`).toBe(true)
      await expect.poll(() => measure(page, 'boardInputs').then(r => r.length)).toBe(1)
      expect(inside((await measure(page, 'boardInputs'))[0]!)).toBe(true)
      await page.evaluate(() => (window as any).closeScheduler && (window as any).closeScheduler())
    }
    await look('as filed')
    await page.reload()
    await page.waitForSelector('#vWeek .day, #loginForm')
    if (await page.locator('#loginForm').count()) await login(page)
    await look('after a reload')
    expect(errs).toEqual([])
    await context.close()
  })
}

/* ON THE BOARD A ROW'S COLOURED LINE STANDS CLEAR OF THE ROW (owner D747, 11 Oct 26 — sending a picture of his phone: "The
   orange and blue line on the edit schedule board is cutting the buttons and pucks, can it be move left slightly such
   that the visuals don't look so ugly"). The blue line of a row that came from an input and the amber line of a late
   one were painted INSIDE the row's left edge, where a phone's pucks and its CX / info / red box / ✕ buttons start.
   Only a real browser can say where a line is painted: for every such row of the seed Monday's Ground Programme, the
   line's right edge is left of everything the row draws, and the line is inside its panel (which clips what leaves
   it). */
for (const [what, viewport, tap] of [['a desktop', { width: 1440, height: 900 }, false], ['a phone', { width: 390, height: 844 }, true]] as const) {
  test(`${what}: the board row's coloured line is left of its pucks and buttons, never through them (D747)`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport, ...(tap ? { isMobile: true, hasTouch: true } : {}) })
    const page = await context.newPage()
    const errs = noErrors(page)
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(0))
    await page.waitForSelector('#schedBoard .sb-panel.grnd .sb-arow.gr-frominput')
    const rows = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow.gr-frominput')].map(row => {
      const line = getComputedStyle(row, '::before'), box = row.getBoundingClientRect()
      const left = box.left + parseFloat(line.left), right = left + parseFloat(line.width)
      const drawn = [...row.querySelectorAll('.puck, .mbtn, input, textarea, .sb-grip')].map(e => e.getBoundingClientRect()).filter(r => r.width > 0 && r.height > 0)
      return { late: row.classList.contains('lateinp'), content: line.content, colour: line.backgroundColor, shadow: getComputedStyle(row).boxShadow,
        left, right, first: Math.min(...drawn.map(r => r.left)), panel: row.closest('.sb-panel')!.getBoundingClientRect().left, things: drawn.length }
    }))
    expect(rows.length, 'the seed Monday has rows that came from inputs').toBeGreaterThan(1)
    expect(rows.some(r => r.late), '…and a late one among them (amber)').toBe(true)
    expect(rows.some(r => !r.late), '…and one on time (blue)').toBe(true)
    for (const r of rows) {
      expect(r.content, 'the line is drawn').not.toBe('none')
      expect(r.things, 'the row draws its pucks and buttons').toBeGreaterThan(2)
      expect(r.right, `the ${r.late ? 'amber' : 'blue'} line ends left of everything the row draws`).toBeLessThanOrEqual(r.first - 1)
      expect(r.left, 'and stands inside its panel, not clipped by it').toBeGreaterThanOrEqual(r.panel + 1)
      expect(r.shadow, 'no line is painted inside the row any more').toBe('none')
    }
    expect(new Set(rows.map(r => `${r.late}|${r.colour}`)).size, 'amber for late, blue otherwise').toBe(2)
    expect(errs).toEqual([])
    await context.close()
  })
}

/* THE SCHEDULE'S WINDOW ON A SHARED INPUT, ON A PHONE: "DELETE FOR ALL?" IS SHOWN WITH BOTH ITS ANSWERS (found by the
   job's bug check — walker W2, scenario 5, 11 Oct 26; D748 — the window opened from the schedule shows everyone, so
   it carries the people picker and is taller than a phone's screen). The question opened at the window's foot with
   only the red "Delete" in sight and "Keep" below the edge. Only a real browser can say what is in sight. */
test('a phone: the window opened from the Personal Inputs line asks "Delete for all 4 people?" with Delete AND Keep in sight (D748)', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  const errs = noErrors(page)
  await login(page)
  await fileGroup(page, true)
  await go(page, 'editsched')
  await page.evaluate(di => (window as any).openScheduler(di), DI)
  const type = page.locator('#schedBoard .sb-panel.pinp .sb-arow.inprow .inpedit').first()
  await type.scrollIntoViewIfNeeded(); await type.tap()
  await expect(page.locator('#inpEditPop [data-pp][aria-pressed="true"]'), 'the window shows everyone in it (D748)').toHaveCount(4)
  const del = page.locator('#inpEditDel')
  await del.scrollIntoViewIfNeeded(); await del.tap()
  await expect(page.locator('[data-testid="inped-delall"]')).toBeVisible()
  await page.waitForTimeout(250)
  const seen = await page.evaluate(() => ['inped-delall-yes', 'inped-delall-no'].map(id => {
    const b = document.querySelector(`[data-testid="${id}"]`) as HTMLElement, r = b.getBoundingClientRect()
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return { id, inView: r.top >= 0 && r.bottom <= innerHeight, hit: !!hit && (hit === b || b.contains(hit)) }
  }))
  for (const b of seen) { expect(b.inView, `${b.id} is on the screen`).toBe(true); expect(b.hit, `${b.id} can be pressed where it is drawn`).toBe(true) }
  await page.locator('[data-testid="inped-delall-no"]').tap()
  await expect.poll(() => page.evaluate(t => (window as any).INPUTS.filter((r: any) => r.title === t).length, TITLE), { message: 'Keep keeps it' }).toBe(4)
  expect(errs).toEqual([])
  await context.close()
})
