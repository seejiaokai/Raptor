import { expect, test, type Page } from '@playwright/test'
import { login, go } from './app'

/* THE SECOND BATCH OF THE INPUTS PAGES, IN THE BUILT APP (owner D730, D731 — 10 Oct 26; `OUTSTANDING.md`
   `[SEEN-BATCH-2]`). What only a real browser can say — where a thing is drawn, what a real key press reaches, what a
   finger meets. The rules and the words themselves are unit tests: ui/batch2.test.tsx, ui/toastplace.test.tsx.

     D731 (1)   on a phone, with a window up, the passing note is at the top and clear of the window's buttons
     D731 (12)  on a phone the days of the List's dates calendar are a finger's size, and it fills its pop-up
     D731 (10)  the viewer of an input with two documents keeps "Edit input" and "Close" in sight
     D731 (2)   a day whose inputs a filter hides says so, and "Clear filters" is a finger's target
     D731 (9)   Escape while a note is typed leaves the note box only; the next closes the day
     A1  the "Unsaved changes" question is seen — in front of the day's window — on a phone
     A2  Enter in a new input's Remarks saves ONE input, and no second window opens
     A4  Tab reaches the row's OIL chip, which measures as the span it replaced
     A6  Escape closes the List's dates calendar */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
async function month(p: Page, y: number, m: number) {
  for (let i = 0; i < 240; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))   // a phone prints three letters
    if (!d) return
    await p.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  throw new Error('the calendar never reached the month asked for')
}
/* made-up inputs of the demo squadron's own people, filed through the app's own door */
async function file(p: Page, rows: Array<{ who: number; type: string; from: string; to?: string; timed?: [number, number]; more?: Record<string, unknown> }>) {
  return p.evaluate(rows => {
    const w = window as any, P = w.PEOPLE
    const crew = Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)
    const out: string[] = []
    rows.forEach((r, i) => {
      const iid = 'b2-' + Date.now().toString(36) + '-' + i
      w.fileInput({ iid, person: crew[r.who % crew.length], type: r.type, date: r.from, endDate: r.to, yr: 2026, allday: !r.timed, s: r.timed ? r.timed[0] : 360, e: r.timed ? r.timed[1] : 1080, ...(r.more || {}) })
      out.push(iid)
    })
    return out
  }, rows)
}
const box = (p: Page, sel: string) => p.evaluate(sel => {
  const e = document.querySelector(sel) as HTMLElement | null
  if (!e) return null
  const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, hit = document.elementFromPoint(x, y)
  return { x, y, top: r.top, bottom: r.bottom, left: r.left, right: r.right, w: r.width, h: r.height, reached: !!hit && (hit === e || e.contains(hit)) }
}, sel)
async function phone(browser: any, baseURL: string | undefined, height = 844) {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height }, isMobile: true, hasTouch: true })
  const page: Page = await context.newPage()
  await login(page); await go(page, 'inputs')
  return { context, page }
}
const pdf = (word: string) => Buffer.from(`%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 400]>>endobj\n% ${word}\ntrailer<</Root 1 0 R>>\n%%EOF`)

/* D731 (1). The note is drawn where a phone's window keeps its buttons; with a window up it goes to the top. Pressing
   "Add" on a new input with no date picked refuses with a sentence and KEEPS the window — the note and the buttons are
   on screen together, which is the case his picture showed. */
test('D731 (1) — a phone, a window up: the passing note is at the top of the screen and lies over none of the window’s buttons', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL)
  try {
    await page.locator('#inListBtn').tap()
    await page.locator('#inNew').tap()
    await expect(page.locator('[data-testid="win-inputedit"]')).toHaveCount(1)
    await page.locator('#inpEditSave').tap()
    const note = page.locator('#toastEl')
    await expect(note).toHaveText('Pick a start date on the calendar first')
    await expect(note).toHaveAttribute('data-at', 'top')
    const g = await page.evaluate(() => {
      const r = (e: Element) => { const b = e.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, left: b.left, right: b.right } }
      const n = r(document.getElementById('toastEl')!)
      const btns = [...document.querySelectorAll('[data-testid="win-inputedit"] .airpop-foot button')].map(r)
      const hits = btns.filter(b => !(b.right <= n.left || b.left >= n.right || b.bottom <= n.top || b.top >= n.bottom)).length
      return { n, btns: btns.length, hits, vw: innerWidth, vh: innerHeight }
    })
    expect(g.btns, 'the window’s buttons are drawn').toBeGreaterThanOrEqual(2)
    expect(g.hits, 'the note lies over none of them').toBe(0)
    expect(g.n.top, 'it is at the top of the screen').toBeLessThan(80)
    expect(g.n.top, 'and wholly on it').toBeGreaterThanOrEqual(0)
    expect(g.n.left).toBeGreaterThanOrEqual(0)
    expect(g.n.right).toBeLessThanOrEqual(g.vw)
    /* the next note, with every window closed, is at the foot again */
    await page.locator('#inpEditCancel').tap()
    await expect(page.locator('[data-testid="win-inputedit"]')).toHaveCount(0)
    await page.evaluate(() => (window as any).toast('a note with no window up'))
    await expect(note).toHaveAttribute('data-at', 'foot')
    const foot = await box(page, '#toastEl')
    expect(844 - foot!.bottom, 'at the foot, where it always was').toBeLessThan(40)
  } finally { await context.close() }
})
test('D731 (1) — a desktop keeps the note at the foot with a window up', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs')
  await page.locator('#inListBtn').click()
  await page.locator('#inNew').click()
  await page.locator('#inpEditSave').click()
  await expect(page.locator('#toastEl')).toHaveText('Pick a start date on the calendar first')
  await expect(page.locator('#toastEl')).toHaveAttribute('data-at', 'foot')
  const n = await box(page, '#toastEl')
  expect(900 - n!.bottom).toBeLessThan(40)
})

/* D731 (12). The same sizes D725 gave the calendar in an input's window — measured against that calendar, on the same
   phone, so the two cannot drift apart. */
for (const height of [568, 700, 844]) {
  test(`D731 (12) — a phone ${height} tall: the days of the List’s dates calendar are a finger’s size, the calendar fills its pop-up, and all of it is on the screen`, async ({ browser, baseURL }) => {
    const { context, page } = await phone(browser, baseURL, height)
    try {
      await page.locator('#inListBtn').tap()
      await page.locator('#inRangeBtn').tap()
      await expect(page.locator('#inRangePop')).toHaveCount(1)
      const m = await page.evaluate(() => {
        const r = (e: Element) => e.getBoundingClientRect()
        const pop = document.getElementById('inRangePop')!, cal = document.getElementById('inRangeCal')!, d = cal.querySelector('.rc-d')!, nav = cal.querySelector('.rc-nav')!
        const cs = getComputedStyle(pop)
        const all = document.getElementById('inRangeAll')!, a = r(all), hit = document.elementFromPoint(a.left + a.width / 2, a.top + a.height / 2)
        return { day: { w: r(d).width, h: r(d).height }, nav: { w: r(nav).width, h: r(nav).height }, cal: r(cal).width,
          inner: r(pop).width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth),
          popTop: r(pop).top, popBottom: r(pop).bottom, allBottom: a.bottom, allReached: !!hit && (hit === all || all.contains(hit)),
          scrolled: scrollY, wide: document.documentElement.scrollWidth, vh: innerHeight }
      })
      expect(m.day.h, 'a day is a finger tall').toBeGreaterThanOrEqual(32)
      expect(m.day.w, 'and a finger wide').toBeGreaterThanOrEqual(40)
      expect(m.nav.w).toBe(28); expect(m.nav.h).toBe(28)
      expect(Math.abs(m.cal - m.inner), 'the calendar fills its pop-up').toBeLessThanOrEqual(1)
      expect(m.wide, 'nothing runs off sideways').toBeLessThanOrEqual(390)
      expect(m.scrolled, 'the page was not moved to find it').toBe(0)
      expect(m.popBottom, 'the whole pop-up is on the screen').toBeLessThanOrEqual(m.vh)
      expect(m.allReached, '"All dates" is what a finger on it reaches').toBe(true)
      /* …and they are the sizes of the calendar in an input's window (D725) */
      await page.locator('#inRangeAll').tap()
      await page.locator('#inNew').tap()
      await expect(page.locator('#inpEdCal')).toHaveCount(1)
      const w = await page.evaluate(() => { const d = document.querySelector('#inpEdCal .rc-d')!.getBoundingClientRect(); return { h: d.height } })
      expect(Math.abs(m.day.h - w.h), 'as tall as a day of the window’s calendar').toBeLessThanOrEqual(1)
    } finally { await context.close() }
  })
}
test('D731 (12) — a desktop’s dates calendar keeps its small days', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs')
  await page.locator('#inListBtn').click()
  await page.locator('#inRangeBtn').click()
  const d = await box(page, '#inRangeCal .rc-d')
  expect(d!.h).toBeLessThan(26)
  const cal = await box(page, '#inRangeCal')
  expect(cal!.w).toBe(212)
})

/* D731 (10). Two documents on one entry: a pager row more, and the viewer was a little taller than its box. */
test('D731 (10) — the viewer of an input with two documents keeps "Edit input" and "Close" in sight at its foot (1440 × 900)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs')
  await page.locator('#inListBtn').click()
  await page.locator('#inRangeBtn').click(); await page.locator('#inRangeAll').click()
  await page.locator('#inNew').click()
  await page.locator('#inpEditType').selectOption('ATT C')
  await page.locator('#inpEdCal [data-cal]').nth(14).click()
  await page.locator('[data-testid="win-inputedit"] .docfield input[type=file]').first().setInputFiles([
    { name: 'cert-one.pdf', mimeType: 'application/pdf', buffer: pdf('one') }, { name: 'cert-two.pdf', mimeType: 'application/pdf', buffer: pdf('two') }])
  await page.locator('#inpEditSave').click()
  await expect(page.locator('[data-testid="win-inputedit"]')).toHaveCount(0)
  await page.locator('#inBody .rclip').first().click()
  await expect(page.locator('#docViewPop')).toBeVisible()
  await expect(page.locator('.docview-count')).toHaveText('1 of 2')
  const g = await page.evaluate(() => {
    const bx = document.querySelector('#docViewPop .docviewbox') as HTMLElement, b = bx.getBoundingClientRect()
    const at = (id: string) => { const e = document.getElementById(id)!, r = e.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { top: r.top, bottom: r.bottom, reached: !!hit && (hit === e || e.contains(hit)) } }
    return { box: { top: b.top, bottom: b.bottom }, taller: bx.scrollHeight - bx.clientHeight, scrolled: bx.scrollTop, done: at('docViewDone'), edit: at('docViewEdit'), vh: innerHeight }
  })
  expect(g.taller, 'the case his picture showed: what the viewer holds is taller than its box').toBeGreaterThan(0)
  expect(g.scrolled, 'and it has not been scrolled').toBe(0)
  for (const [name, b] of [['Close', g.done], ['Edit input', g.edit]] as const) {
    expect(b.reached, `${name} is what a press on it reaches`).toBe(true)
    expect(b.bottom, `${name} is wholly inside the box`).toBeLessThanOrEqual(g.box.bottom)
    expect(b.top).toBeGreaterThanOrEqual(g.box.top)
  }
  /* the page above the pinned foot still scrolls, and the buttons stay where they are */
  await page.evaluate(() => { (document.querySelector('#docViewPop .docviewbox') as HTMLElement).scrollTop = 9999 })
  const after = await box(page, '#docViewDone')
  expect(Math.abs(after!.bottom - g.done.bottom)).toBeLessThanOrEqual(1)
  await page.locator('#docViewDone').click()
  await expect(page.locator('#docViewPop')).toBeHidden()
})

/* D731 (2), on a phone: the words and the button, and the button is a finger's target that works. */
test('D731 (2) — a phone: a day whose one input the Person filter hides says "No inputs match on this day." and "Clear filters" brings it back', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL)
  try {
    await month(page, 2026, 10)
    await file(page, [{ who: 3, type: 'Meeting', from: 'Oct 21', timed: [600, 660] }])
    const other = await page.evaluate(() => { const w = window as any, P = w.PEOPLE; return Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)[9] })
    await page.locator('#inFiltersBtn').tap()
    await page.locator('#inFPerson').selectOption(other)
    await page.locator('#inpCal [data-icday="2026-10-21"]').tap()
    const empty = page.locator('[data-testid="idy-empty"]')
    await expect(empty).toContainText('No inputs match on this day.')
    const b = await box(page, '[data-testid="idy-clear"]')
    expect(b!.reached, 'a finger on "Clear filters" reaches it').toBe(true)
    expect(b!.h, 'a finger’s target').toBeGreaterThanOrEqual(44)
    await page.touchscreen.tap(b!.x, b!.y)
    await expect(page.locator('[data-testid^="idy-row-"]')).toHaveCount(1)
    await expect(empty).toHaveCount(0)
  } finally { await context.close() }
})

/* D731 (9), with real keys. */
test('D731 (9) — Escape while a note is typed leaves the note box only; the next Escape closes the day', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  await page.locator('#inpCal [data-icday="2026-10-22"]').click()
  await expect(page.locator('[data-testid="win-inputsday"]')).toHaveCount(1)
  await page.locator('#icAddPuck').click()
  await page.locator('.ic-newnote .ic-poppuck-edit').fill('half a thought')
  await page.keyboard.press('Escape')
  await expect(page.locator('.ic-newnote')).toHaveCount(0)
  await expect(page.locator('[data-testid="win-inputsday"]'), 'the day is still open').toHaveCount(1)
  await expect(page.locator('[data-testid^="idy-note-"]'), 'and no note was made').toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-testid="win-inputsday"]')).toHaveCount(0)
})

/* A1, on a phone: the day's window is nearly the whole screen, the input's window stands at its foot. A finger on a
   card of the day that still shows above the input's window asks for the other input — and the question is SEEN. */
test('A1 — a phone: another card tapped over unsaved changes — the question is in front, where a finger can answer it', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL)
  try {
    await month(page, 2026, 10)
    const ids = await file(page, [{ who: 1, type: 'Meeting', from: 'Oct 21', timed: [540, 600] }, { who: 2, type: 'Meeting', from: 'Oct 21', timed: [660, 720] }])
    await page.locator('#inpCal [data-icday="2026-10-21"]').tap()
    await expect(page.locator('[data-testid^="idy-row-"]')).toHaveCount(2)
    await page.locator(`[data-testid="idy-row-${ids[0]}"] [data-testid="idy-open"]`).tap()
    await expect(page.locator('[data-testid="win-inputedit"]')).toHaveCount(1)
    await page.locator('#inpEditRmk').fill('typed, not saved')
    /* THE ROUTE A FINGER HAS. The input's window stands over the day's cards; what still shows of the day is the strip
       of its bar above the input's window. A tap there brings the day forward (any pressed window comes forward) and
       its cards with it — then a tap on the OTHER input's card asks for that input. Every press is at a point a
       finger meets, never a scripted press on something covered. */
    const shows = (sel: string) => page.evaluate(sel => {
      for (const c of [...document.querySelectorAll(sel)]) {
        const r = c.getBoundingClientRect()
        for (const y of [r.top + 5, r.top + r.height / 2, r.bottom - 5]) {
          const x = r.left + r.width / 3, hit = document.elementFromPoint(x, y)
          if (hit && c.contains(hit)) return { x, y }
        }
      }
      return null
    }, sel)
    const other = `[data-testid="idy-row-${ids[1]}"] [data-testid="idy-open"]`
    let pt = await shows(other)
    if (!pt) {
      const bar = await shows('[data-testid="win-inputsday"] .win-bar .win-ttl')
      expect(bar, 'the day’s bar still shows above the input’s window').toBeTruthy()
      await page.touchscreen.tap(bar!.x, bar!.y)
      await expect(page.locator('[data-testid="win-inputsday"]')).toHaveClass(/\bfront\b/)
      pt = await shows(other)
    }
    expect(pt, 'the other input’s card can be reached by a finger').toBeTruthy()
    await page.touchscreen.tap(pt!.x, pt!.y)
    const q = page.locator('[data-testid="inped-swap"]')
    await expect(q).toHaveCount(1)
    await expect(page.locator('[data-testid="win-inputedit"]')).toHaveClass(/\bfront\b/)
    const keep = await box(page, '[data-testid="inped-swap-stay"]')
    expect(keep!.reached, '"Keep editing" is what a finger on it reaches — nothing lies over the question').toBe(true)
    expect(keep!.bottom).toBeLessThanOrEqual(844)
    await page.touchscreen.tap(keep!.x, keep!.y)
    await expect(q).toHaveCount(0)
    await expect(page.locator('#inpEditRmk')).toHaveValue('typed, not saved')
  } finally { await context.close() }
})

/* A2, with a real key: Enter saves, the window closes, the keyboard goes back to "+ Input" — and the same press must not
   press it. */
for (const where of ['the List', 'the opened day'] as const) {
  test(`A2 — Enter in a new input’s Remarks, opened from ${where}: one input is saved and no second window opens`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await login(page); await go(page, 'inputs')
    if (where === 'the List') {
      await page.locator('#inListBtn').click()
      await page.locator('#inRangeBtn').click(); await page.locator('#inRangeAll').click()
      await page.locator('#inNew').click()
      await page.locator('#inpEdCal [data-cal]').nth(14).click()
    } else {
      await month(page, 2026, 10)
      await page.locator('#inpCal [data-icday="2026-10-22"]').click()
      await page.locator('#icPopAdd').click()
    }
    await expect(page.locator('[data-testid="win-inputedit"]')).toHaveCount(1)
    const before = await page.evaluate(() => (window as any).INPUTS.length)
    await page.locator('#inpEditRmk').fill('weekly sync')
    await page.locator('#inpEditRmk').press('Enter')
    await expect.poll(() => page.evaluate(() => (window as any).INPUTS.length)).toBe(before + 1)
    /* the note says the save happened; by then any second window the key press could open would be up */
    await expect(page.locator('#toastEl')).toContainText('Input added')
    await expect(page.locator('[data-testid="win-inputedit"]'), 'no blank "New input" opens again').toHaveCount(0)
    expect(await page.evaluate(() => (window as any).INPUTS.length), 'and nothing more was saved').toBe(before + 1)
  })
}

/* A4. The chips are buttons: a Tab from the row's Name lands on the chip, Enter opens its question — and it is the size
   the span was (30 high; a paperclip 30 × 30), so no button changed size (D487). */
test('A4 — Tab from a row’s Name reaches its OIL chip, Enter opens the question, and the chips measure as before', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs')
  const [iid] = await file(page, [{ who: 4, type: 'Duty', from: 'Oct 17', more: { oil: { '2026-10-17': 1 } } }])
  await page.locator('#inListBtn').click()
  await page.locator('#inRangeBtn').click(); await page.locator('#inRangeAll').click()
  const row = page.locator(`#inBody tr[data-iid="${iid}"]`)
  await row.locator('[data-testid="in-open"]').focus()
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => (document.activeElement as HTMLElement).getAttribute('data-oilrev') != null), 'the keyboard is on the OIL chip').toBe(true)
  const g = await page.evaluate(iid => {
    const c = document.querySelector(`#inBody tr[data-iid="${iid}"] [data-oilrev]`) as HTMLElement, r = c.getBoundingClientRect(), cs = getComputedStyle(c)
    return { h: r.height, font: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight, bg: cs.backgroundColor, cell: getComputedStyle(c.closest('td')!).fontFamily }
  }, iid)
  expect(g.h, 'as tall as the span it replaced').toBe(30)
  expect(g.size).toBe('11px'); expect(g.weight).toBe('800')
  expect(g.font, 'the app’s own typeface, not a button’s').toBe(g.cell)
  expect(g.bg, 'no button face').toBe('rgba(0, 0, 0, 0)')
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-testid="oilconf"]')).toHaveCount(1)
  await expect(page.locator('[data-testid="win-inputedit"]'), 'the chip did its own work — the row did not open').toHaveCount(0)
})

/* A6, with a real key. */
test('A6 — Escape closes the List’s dates calendar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs')
  await page.locator('#inListBtn').click()
  await page.locator('#inRangeBtn').click()
  await expect(page.locator('#inRangePop')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(page.locator('#inRangePop')).toHaveCount(0)
})

/* A6 and A4 together, with real keys (Astra's read of the code, finding 3): the chips are buttons, so the keyboard can
   open the OIL question OVER a dates calendar no press outside ever closed. Escape is the question's first. */
test('A6 — the OIL question opened by the keyboard over the open dates calendar takes Escape first; the next Escape closes the calendar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs')
  const [iid] = await file(page, [{ who: 4, type: 'Duty', from: 'Oct 17', more: { oil: { '2026-10-17': 1 } } }])
  await page.locator('#inListBtn').click()
  await page.locator('#inRangeBtn').click(); await page.locator('#inRangeAll').click()
  await page.locator('#inRangeBtn').click()
  await expect(page.locator('#inRangePop')).toHaveCount(1)
  await page.locator(`#inBody tr[data-iid="${iid}"] [data-testid="in-open"]`).focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-testid="oilconf"]')).toHaveCount(1)
  await expect(page.locator('#inRangePop'), 'the calendar is still up under the question').toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-testid="oilconf"]'), 'the question in front went').toHaveCount(0)
  await expect(page.locator('#inRangePop'), 'the calendar did not').toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(page.locator('#inRangePop')).toHaveCount(0)
})
