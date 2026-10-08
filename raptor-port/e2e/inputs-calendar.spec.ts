import { expect, test, type Page } from '@playwright/test'
import { login, go } from './app'

/* THE INPUTS CALENDAR IN THE BUILT APP (the Inputs / SANS job, step 5 — the plan §3.6; D620, D626, D632, D639, D653,
   D664). What only a real browser can say: that a bar lies over the dates it covers and over no other, that the month
   takes the phone's full screen at any height and is never a box scrolled inside the page, that the tabs and the one
   tools row hold their lines, that a real mouse drag and a real finger do what the unit tests say a pointer does, and
   that the click a browser sends after a tap presses nothing it should not. The rules themselves are unit tests:
   ui/inputscal-model.test.ts, ui/inputsmonth.test.tsx, ui/inputstabs.test.tsx, ui/calpick.test.ts. */
const cell = (p: Page, iso: string) => p.locator(`#inpCal [data-icday="${iso}"]`)
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
      const iid = 'e2e-' + Date.now().toString(36) + '-' + i
      w.fileInput({ iid, person: crew[r.who % crew.length], type: r.type, date: r.from, endDate: r.to, yr: 2026, allday: !r.timed, s: r.timed ? r.timed[0] : 360, e: r.timed ? r.timed[1] : 1080, ...(r.more || {}) })
      out.push(iid)
    })
    return out
  }, rows)
}
const editorOpen = (p: Page) => p.evaluate(() => { const e = document.getElementById('inpEditPop'); return !!e && !e.hidden })
async function phone(browser: any, baseURL: string | undefined, height = 844) {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height }, isMobile: true, hasTouch: true })
  const page: Page = await context.newPage()
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  return { context, page }
}

/* ON A PHONE THE MONTH IS NEVER A BOX SCROLLED INSIDE THE PAGE (owner D664: "It should be a full screen of the phone"),
   AND IT FITS ITSELF TO WHATEVER HEIGHT THE PHONE GIVES (D653). At three heights, in a five-week month (October 2026)
   and a six-week one (August 2026): the month has no scroll of its own; where the screen can hold it, it runs to the
   foot of the screen and the page does not scroll; where it cannot, the PAGE is what scrolls; nothing runs off
   sideways; a week row never has room for fewer than three bars and the "+N more" line. */
for (const height of [568, 700, 844]) for (const [name, y, m] of [['five-week', 2026, 10], ['six-week', 2026, 8]] as const) {
  test(`phone ${height}, a ${name} month: the Inputs month fills the screen and has no scroll of its own`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height })
    await login(page); await go(page, 'inputs'); await month(page, y, m)
    await page.evaluate(() => scrollTo(0, 0))
    const g = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="ib-grid"]') as HTMLElement, r = el.getBoundingClientRect(), cs = getComputedStyle(el)
      const cal = document.getElementById('inpCal') as HTMLElement
      const week = el.querySelector('.ib-week') as HTMLElement
      const px = (n: string) => parseFloat(cs.getPropertyValue(n))
      return { bottom: r.bottom, ownScroll: el.scrollHeight - el.clientHeight, calScroll: cal.scrollHeight - cal.clientHeight, maxH: cs.maxHeight, overflowY: cs.overflowY,
        weeks: el.querySelectorAll('.ib-week').length, weekH: week.getBoundingClientRect().height, floor: px('--ib-head') + 3 * px('--ib-lane') + px('--ib-more'),
        pageH: document.documentElement.scrollHeight, pageW: document.documentElement.scrollWidth, vh: innerHeight, vw: innerWidth }
    })
    expect(g.weeks).toBe(name === 'five-week' ? 5 : 6)
    expect(g.maxH, 'the month has no height limit').toBe('none')
    expect(g.ownScroll, 'the month does not scroll inside itself').toBeLessThanOrEqual(1)
    expect(g.calScroll, 'nor does the calendar around it').toBeLessThanOrEqual(1)
    expect(g.overflowY).not.toMatch(/auto|scroll/)
    expect(g.pageW, 'nothing runs off sideways').toBeLessThanOrEqual(g.vw)
    expect(g.weekH, 'a week row keeps room for three bars and "+N more"').toBeGreaterThanOrEqual(g.floor - 1)
    if (g.bottom <= g.vh + 0.5) {
      /* it fits: then it reaches the foot of the screen, and the page has nothing to scroll */
      expect(g.vh - g.bottom, 'the month stops short of the foot of the screen').toBeLessThanOrEqual(16)
      expect(g.pageH, 'a month that fits leaves the page nothing to scroll').toBeLessThanOrEqual(g.vh + 1)
    } else {
      expect(g.pageH, 'the page itself must be what scrolls').toBeGreaterThanOrEqual(Math.floor(g.bottom))
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
      const foot = await page.locator('[data-testid="ib-grid"]').evaluate(el => el.getBoundingClientRect().bottom)
      expect(foot, 'the month’s last week is reached by scrolling the page').toBeLessThanOrEqual(g.vh + 1)
    }
  })
}

test('the month re-fits when the phone’s height changes, without its top moving (D653)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  await file(page, Array.from({ length: 9 }, (_, i) => ({ who: i, type: 'LL', from: 'Oct 21' })))
  const read = () => page.evaluate(() => {
    const g = document.querySelector('[data-testid="ib-grid"]') as HTMLElement
    return { top: g.getBoundingClientRect().top, bottom: g.getBoundingClientRect().bottom, bars: [...document.querySelectorAll('.ib-bar')].length, vh: innerHeight }
  })
  const tall = await read()
  await page.setViewportSize({ width: 390, height: 640 })           // the browser's own bars slide in
  await expect.poll(async () => (await read()).bottom).toBeLessThanOrEqual(640 + 1)
  const short = await read()
  expect(short.top, 'the top of the month stood still').toBeCloseTo(tall.top, 0)
  expect(short.bars, 'fewer lines on the shorter screen').toBeLessThan(tall.bars)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(async () => (await read()).bars).toBe(tall.bars)
})

for (const height of [844, 568]) test(`phone ${height}: three slim tabs, then ONE tools row — a finger’s size, nothing cut, nothing off the screen`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  const box = (sel: string) => page.evaluate(sel => { const r = document.querySelector(sel)!.getBoundingClientRect(); return { top: r.top, mid: Math.round(r.top + r.height / 2), left: r.left, right: r.right, h: r.height, w: r.width } }, sel)
  const tabs = await Promise.all(['#inMemberMode', '#inSansMode', '#inMedBtn'].map(box))
  expect(Math.max(...tabs.map(t => t.mid)) - Math.min(...tabs.map(t => t.mid)), 'the three tabs share one line').toBeLessThanOrEqual(1)
  /* LESS TALL (owner D626 — "I like the 3 tabs across the top but make it less tall"): slimmer than the app's 44px
     buttons, and still wide — each a third of the screen */
  for (const t of tabs) { expect(t.h, 'a tab is less tall than a button').toBeLessThan(44); expect(t.h).toBeGreaterThanOrEqual(36); expect(t.w).toBeGreaterThan(100) }
  const tools = await Promise.all(['#icPrev', '#inpCal .ic-mon', '#icNext', '#icToday', '#inCalBtn', '#inListBtn', '#inFiltersBtn', '[data-testid="in-gear"]'].map(box))
  expect(Math.max(...tools.map(t => t.mid)) - Math.min(...tools.map(t => t.mid)), 'the tools wrapped onto a second line').toBeLessThanOrEqual(2)
  expect(Math.min(...tools.map(t => t.top)), 'the tools row is under the tabs').toBeGreaterThan(Math.max(...tabs.map(t => t.top)))
  expect(Math.max(...[...tabs, ...tools].map(t => t.right))).toBeLessThanOrEqual(390)
  expect(Math.min(...[...tabs, ...tools].map(t => t.left)), 'the page stands in from the edge of the screen').toBeGreaterThanOrEqual(6)
  /* the tools keep their height (D487, D653 reading 5): narrower on a phone, never shorter */
  for (const id of ['#icPrev', '#icNext', '#icToday', '#inCalBtn', '#inListBtn', '#inFiltersBtn', '[data-testid="in-gear"]']) expect((await box(id)).h, id + ' phone target').toBeGreaterThanOrEqual(44)
  /* the month's name reads whole in every month of a year, and the row holds its one line through them all */
  for (let i = 0; i < 12; i++) {
    const cut = await page.evaluate(() => { const m = document.querySelector('#inpCal .ic-mon') as HTMLElement, f = document.querySelector('[data-testid="in-gear"]')!.getBoundingClientRect(), n = document.querySelector('#icPrev')!.getBoundingClientRect(); return { cut: m.scrollWidth > m.clientWidth, name: m.textContent, wrapped: Math.abs(f.top - n.top) > 2, right: f.right } })
    expect(cut.cut, 'the month is cut: ' + cut.name).toBe(false); expect(cut.wrapped, 'the tools wrapped in ' + cut.name).toBe(false); expect(cut.right).toBeLessThanOrEqual(390)
    await page.click('#icNext')
  }
  /* the filters fold behind the one button, and open as a full line under the row */
  await expect(page.locator('#inFSearch')).toBeHidden()
  await page.click('#inFiltersBtn'); await expect(page.locator('#inFSearch')).toBeVisible()
  expect((await box('#inFSearch')).top).toBeGreaterThan((await box('#icPrev')).top + 40)
  expect(await page.evaluate(() => document.documentElement.scrollWidth), 'no sideways scroll with the filters open').toBeLessThanOrEqual(390)
})

test('arriving from a scrolled page shows the Inputs page from its top, tabs in reach — and each tab leaves them in reach', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page)
  await page.evaluate(() => scrollTo(0, 400))
  expect(await page.evaluate(() => scrollY), 'the week is scrolled, as a phone leaves it').toBeGreaterThan(50)
  await go(page, 'inputs')
  await expect(page.locator('#inpCal')).toBeVisible()
  expect(await page.evaluate(() => scrollY)).toBe(0)
  /* every tab is ON TOP at its own middle — the only way out of a tab must take a real press */
  for (const tab of ['#inSansMode', '#inMedBtn', '#inMemberMode']) {
    const onTop = await page.evaluate(sel => { const e = document.querySelector(sel)!, r = e.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!hit && (hit === e || e.contains(hit)) }, tab)
    expect(onTop, tab + ' is covered').toBe(true)
    await page.locator(tab).click()                                   // a real click: Playwright refuses a covered target
    await expect(page.locator(tab)).toHaveAttribute('aria-selected', 'true')
  }
  await expect(page.locator('#inpCal')).toBeVisible()
})

test('a desktop: ONE row of controls above the month; seven bars a day, then "+N more"; every bar over its own dates and no other', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  const mids = await page.evaluate(() => ['#inMemberMode', '#icPrev', '#icToday', '#inCalBtn', '#inFPerson', '#inFSearch'].map(s => { const r = document.querySelector(s)!.getBoundingClientRect(); return Math.round(r.top + r.height / 2) }))
  expect(Math.max(...mids) - Math.min(...mids), 'the tabs, the arrows, the switch and the filters share one line').toBeLessThanOrEqual(2)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440)
  const ids = await file(page, [
    ...Array.from({ length: 9 }, (_, i) => ({ who: i, type: 'LL', from: 'Oct 21' })),
    { who: 10, type: 'OML', from: 'Oct 5', to: 'Oct 9' }, { who: 11, type: 'CSE', from: 'Oct 9', to: 'Oct 13' }, { who: 12, type: 'Meeting', from: 'Oct 6', timed: [600, 660] },
  ])
  await expect(page.locator(`[data-testid="ib-bar-${ids[9]}"]`)).toHaveCount(1)
  await expect(page.locator(`[data-testid="ib-bar-${ids[10]}"]`), 'a bar that runs past Sunday is carried on').toHaveCount(2)
  const g = await page.evaluate(ids => {
    const w = window as any
    const at = (iso: string) => (document.querySelector(`#inpCal [data-icday="${iso}"]`) as HTMLElement).getBoundingClientRect()
    const iso = (lbl: string) => '2026-10-' + String(+lbl.split(' ')[1]).padStart(2, '0')
    const bad: string[] = []
    const rects: Array<{ week: Element; r: DOMRect; id: string }> = []
    for (const bar of document.querySelectorAll('.ib-bar') as NodeListOf<HTMLElement>) {
      const rec = w.INPUTS.find((x: any) => x.iid === bar.dataset.iid); if (!rec) continue
      const r = bar.getBoundingClientRect(), week = bar.closest('.ib-week')!
      rects.push({ week, r, id: rec.iid })
      /* the dates of this week the input covers */
      const days = [...week.querySelectorAll('[data-icday]')].map(d => (d as HTMLElement).dataset.icday!).filter(d => d >= iso(rec.date) && d <= iso(rec.endDate || rec.date))
      if (!days.length) { bad.push('a bar in a week its input does not touch: ' + bar.textContent); continue }
      const a = at(days[0]), b = at(days[days.length - 1]), wk = week.getBoundingClientRect()
      if (r.left < a.left - 0.5 || r.right > b.right + 0.5) bad.push(`${bar.textContent}: ${Math.round(r.left)}–${Math.round(r.right)} outside ${Math.round(a.left)}–${Math.round(b.right)}`)
      if (r.width < (b.right - a.left) * 0.9) bad.push(`${bar.textContent}: too short for its days`)
      if (r.top < wk.top || r.bottom > wk.bottom + 0.5) bad.push(`${bar.textContent}: outside its week`)
      if (bar.scrollHeight > bar.clientHeight + 1) bad.push(`${bar.textContent}: its words are cut top or bottom`)
    }
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
      const p = rects[i], q = rects[j]
      if (p.week === q.week && p.r.left < q.r.right - 0.5 && q.r.left < p.r.right - 0.5 && p.r.top < q.r.bottom - 0.5 && q.r.top < p.r.bottom - 0.5) bad.push('two bars overlap: ' + p.id + ' / ' + q.id)
    }
    const on21 = ids.slice(0, 9).filter(id => document.querySelector(`[data-testid="ib-bar-${id}"]`)).length
    const more = document.querySelector('[data-icmore="2026-10-21"]') as HTMLElement | null
    const d21 = at('2026-10-21'), mr = more ? more.getBoundingClientRect() : null
    return { bad: bad.slice(0, 5), on21, more: more ? more.textContent : null, moreIn: !!mr && mr.left >= d21.left - 0.5 && mr.right <= d21.right + 0.5 && mr.bottom <= d21.bottom + 0.5 }
  }, ids)
  expect(g.bad).toEqual([])
  expect(g.on21, 'seven a day on a desktop (D632, D639)').toBe(7)
  expect(g.more).toBe('+2 more'); expect(g.moreIn, '"+N more" sits inside its own date').toBe(true)
  /* the words on a bar are readable: at least 11px, at his PC's 125% and at 100% alike (D632 reading 3 is checked on
     the real build — here the size itself) */
  expect(await page.locator('.ib-bar').first().evaluate(e => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(11)
})

test('a real mouse drag across dates picks the run for "+ Input"; a click on a date opens the day; a click on a bar opens that input', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  const [iid] = await file(page, [{ who: 3, type: 'OML', from: 'Oct 14', to: 'Oct 16' }])
  const low = async (d: string) => { const b = (await cell(page, d).boundingBox())!; return { x: b.x + b.width / 2, y: b.y + b.height - 12 } }   // under the bars
  const a = await low('2026-10-13'), b = await low('2026-10-15')
  await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(b.x, b.y, { steps: 6 })
  for (const d of ['2026-10-13', '2026-10-14', '2026-10-15']) await expect(cell(page, d)).toHaveClass(/is-picked/)
  await page.mouse.up()
  await expect(page.locator('#inpEditPop .rc-read')).toHaveText('Oct 13 → Oct 15')
  expect(await page.locator('#inpEditType option').allTextContents(), 'the Inputs tab files no SANS availability (D620)').not.toContain('SANS Availability')
  await page.click('#inpEditCancel')
  /* the run carries on while the pointer crosses a bar: from the 13th, up across the bar of the 14th–16th */
  const bar = (await page.locator(`[data-testid="ib-bar-${iid}"]`).boundingBox())!
  await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(bar.x + bar.width * 0.5, bar.y + bar.height / 2, { steps: 6 })
  for (const d of ['2026-10-13', '2026-10-14', '2026-10-15']) await expect(cell(page, d)).toHaveClass(/is-picked/)
  await page.mouse.up(); await page.click('#inpEditCancel')
  /* a click on a bar opens that input, and nothing is being picked */
  await page.locator(`[data-testid="ib-bar-${iid}"]`).click()
  await expect(page.locator('#inpEditTitle')).toContainText('14 Oct')
  await page.click('#inpEditCancel')
  await expect(page.locator('.ib-day.is-picked')).toHaveCount(0)
})

test('a finger: a tap on a bar opens that input and it STAYS open; a tap on a date opens the day and presses nothing else; a slide turns the month', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL)
  try {
    const [iid] = await file(page, [{ who: 3, type: 'OML', from: 'Oct 13', to: 'Oct 16' }])
    await page.locator(`[data-testid="ib-bar-${iid}"]`).tap()
    await expect(page.locator('#inpEditPop')).toBeVisible()
    await page.waitForTimeout(450)                                   // past the click a phone sends after the tap
    expect(await editorOpen(page), 'the tap’s own click shut the window it had just opened').toBe(true)
    await page.locator('#inpEditClose').tap(); await expect(page.locator('#inpEditPop')).toBeHidden()
    /* a date, on its own corner (its middle is under the bar) */
    await cell(page, '2026-10-20').tap({ position: { x: 10, y: 10 } })
    await expect(cell(page, '2026-10-20')).toHaveClass(/is-open/)
    await page.waitForTimeout(450)
    expect(await editorOpen(page), 'the tap pressed through into the opened day').toBe(false)
    await page.keyboard.press('Escape'); await expect(cell(page, '2026-10-20')).not.toHaveClass(/is-open/)
    /* a quick slide turns the month and opens nothing */
    const cdp = await context.newCDPSession(page)
    const r = (await cell(page, '2026-10-22').boundingBox())!, at = { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height - 10) }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...at, id: 1 }] })
    for (const dx of [20, 60, 110, 150]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: at.x - dx, y: at.y, id: 1 }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach()
    await expect(page.locator('#inpCal .ic-mon')).toHaveText('Nov 2026')
    expect(await editorOpen(page)).toBe(false)
  } finally { await context.close() }
})

test('a finger held on a date, then dragged, picks the run with the page standing still; a held finger let go is that one day', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL)
  try {
    const cdp = await context.newCDPSession(page)
    const low = async (iso: string) => { const r = (await cell(page, iso).boundingBox())!; return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height - 10) } }
    const a = await low('2026-10-20'), b = await low('2026-10-22')
    const y0 = await page.evaluate(() => scrollY)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] })
    await expect(cell(page, '2026-10-20')).toHaveClass(/is-picked/)     // the hold has taken: the day lights
    expect(await editorOpen(page)).toBe(false)
    for (const x of [a.x + 15, a.x + 40, (a.x + b.x) / 2, b.x]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(x), y: a.y + 2, id: 1 }] })
    for (const d of ['2026-10-20', '2026-10-21', '2026-10-22']) await expect(cell(page, d)).toHaveClass(/is-picked/)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect(page.locator('#inpEditPop .rc-read')).toHaveText('Oct 20 → Oct 22')
    expect(await page.evaluate(() => scrollY), 'the page scrolled under the finger').toBe(y0)
    await expect(page.locator('#inpCal .ic-mon')).toHaveText('Oct 2026')
    await page.locator('#inpEditClose').tap(); await expect(page.locator('#inpEditPop')).toBeHidden()
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] })
    await expect(cell(page, '2026-10-20')).toHaveClass(/is-picked/)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach()
    await expect(page.locator('#inpEditPop .rc-read')).toHaveText('Oct 20')
    await page.locator('#inpEditClose').tap()
  } finally { await context.close() }
})

test('a public holiday, an Off day and a no-fly day wear their tag on the Inputs month, in step with the Leave War — and no sun or moon', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  await page.evaluate(() => { const w = window as any; w.setFlyDays([{ iso: '2026-10-22', cls: 'nf' }, { iso: '2026-10-15', cls: 'night' }]); w.lwSetDayEvent('2026-10-09', 0, 'PH'); w.lwSetDayEvent('2026-10-26', 0, 'Off day') })
  const tag = (iso: string) => page.locator(`[data-testid="ib-tag-${iso}"]`)
  await expect(tag('2026-10-22')).toHaveText('NF'); await expect(tag('2026-10-09')).toHaveText('PH'); await expect(tag('2026-10-26')).toHaveText('OFF')
  await expect(tag('2026-10-15'), 'night flying shows on the SANS calendar only (D627)').toHaveCount(0)
  await expect(page.locator('#inpCal [data-icon]')).toHaveCount(0)
  /* the tag sits beside its own date's number, inside that date */
  const inside = await page.evaluate(() => ['2026-10-22', '2026-10-09', '2026-10-26'].every(iso => { const t = document.querySelector(`[data-testid="ib-tag-${iso}"]`)!.getBoundingClientRect(), d = document.querySelector(`#inpCal [data-icday="${iso}"]`)!.getBoundingClientRect(); return t.left >= d.left && t.right <= d.right + 0.5 && t.top >= d.top && t.bottom <= d.bottom }))
  expect(inside).toBe(true)
  /* a holiday taken back on the war leaves the month at once, with no reload */
  await page.evaluate(() => (window as any).lwSetDayEvent('2026-10-09', 0, ''))
  await expect(tag('2026-10-09')).toHaveCount(0)
})

/* A BAR MOVED (the plan §3.6, §5): the move is by the days between where the bar was grabbed and where it is dropped —
   resolved from where things ARE on the page, which no unit test can see — its length kept; one Undo step; the moved
   bar is the thing that flashes. */
const recDates = (p: Page, iid: string) => p.evaluate(iid => { const r = (window as any).INPUTS.find((x: any) => x.iid === iid); return r ? [r.date, r.endDate || ''] : null }, iid)
test('a real mouse moves a bar by the days between grab and drop — from its middle day, and from its continuation in the next week', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  const [a, b] = await file(page, [{ who: 3, type: 'LL', from: 'Oct 5', to: 'Oct 9' }, { who: 4, type: 'LL', from: 'Oct 23', to: 'Oct 27' }])
  const xOf = async (iso: string) => { const r = (await cell(page, iso).boundingBox())!; return r.x + r.width / 2 }
  /* Mon 5 – Fri 9, grabbed over Wednesday the 7th, dropped on Friday the 9th: two days later, still five days long */
  const barA = (await page.locator(`[data-testid="ib-bar-${a}"]`).boundingBox())!, yA = barA.y + barA.height / 2
  await page.mouse.move(await xOf('2026-10-07'), yA); await page.mouse.down()
  await page.mouse.move(await xOf('2026-10-08'), yA + 4, { steps: 4 })
  await expect(page.locator('.ic-ghost'), 'the bar is picked up and follows the mouse').toHaveCount(1)
  await page.mouse.move(await xOf('2026-10-09'), yA + 6, { steps: 4 })
  await expect(cell(page, '2026-10-09'), 'the date under it lights').toHaveClass(/ic-over/)
  await page.mouse.up()
  await expect.poll(() => recDates(page, a)).toEqual(['Oct 7', 'Oct 11'])
  await expect(page.locator('.ic-ghost')).toHaveCount(0)
  await expect(page.locator(`.ib-bar.lift-land[data-iid="${a}"]`).first(), 'the moved bar is what flashes').toBeVisible()
  await page.waitForTimeout(400)
  expect(await editorOpen(page), 'the release must not open the input it moved').toBe(false)
  await page.click('#undoBtn')
  await expect.poll(() => recDates(page, a)).toEqual(['Oct 5', 'Oct 9'])
  /* Undo leaves the screen where it is (D672): the bar he is looking at goes back and flashes — no day opens over the month */
  await expect(page.locator(`.ib-bar.lift-land[data-iid="${a}"]`).first()).toBeVisible()
  await expect(page.locator('.ib-day.is-open')).toHaveCount(0)
  /* Fri 23 – Tue 27: its SECOND piece, in the next week, grabbed over Monday the 26th and dropped on Wednesday the 28th */
  const second = page.locator(`[data-testid="ib-bar-${b}"]`).nth(1)
  const barB = (await second.boundingBox())!, yB = barB.y + barB.height / 2
  await page.mouse.move(await xOf('2026-10-26'), yB); await page.mouse.down()
  await page.mouse.move(await xOf('2026-10-27'), yB + 4, { steps: 4 }); await page.mouse.move(await xOf('2026-10-28'), yB + 6, { steps: 4 })
  await page.mouse.up()
  await expect.poll(() => recDates(page, b)).toEqual(['Oct 25', 'Oct 29'])
  /* dropped back where it was grabbed: nothing changes and there is no step to take back */
  const barB2 = (await page.locator(`[data-testid="ib-bar-${b}"]`).nth(1).boundingBox())!, y2 = barB2.y + barB2.height / 2
  await page.mouse.move(await xOf('2026-10-27'), y2); await page.mouse.down()
  await page.mouse.move(await xOf('2026-10-28'), y2 + 4, { steps: 4 }); await page.mouse.move(await xOf('2026-10-27'), y2, { steps: 4 }); await page.mouse.up()
  expect(await recDates(page, b)).toEqual(['Oct 25', 'Oct 29'])
  await page.click('#undoBtn')
  await expect.poll(() => recDates(page, b), 'the one Undo step is the move before it').toEqual(['Oct 23', 'Oct 27'])
})

test('another man’s bar does not lift for a member, and trying to drag it opens nothing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  /* a member cannot file for another man through the test door either, so this uses the demo squadron's own July:
     the first bar there whose input is not his (us = Ranger) */
  await login(page, 'user'); await go(page, 'inputs'); await page.selectOption('#inFPerson', 'all'); await month(page, 2026, 7)
  await page.waitForSelector('.ib-bar')
  const iid = await page.evaluate(() => { const w = window as any; const bar = [...document.querySelectorAll('.ib-bar')].find(b => { const r = w.INPUTS.find((x: any) => x.iid === (b as HTMLElement).dataset.iid); return r && r.person !== 'bane' && !r.grp }) as HTMLElement; return bar.dataset.iid! })
  const was = await recDates(page, iid)
  const bar = (await page.locator(`[data-testid="ib-bar-${iid}"]`).first().boundingBox())!, y = bar.y + bar.height / 2
  const to = (await cell(page, '2026-07-30').boundingBox())!
  await page.mouse.move(bar.x + 12, y); await page.mouse.down(); await page.mouse.move(bar.x + 60, y + 3, { steps: 4 })
  await expect(page.locator('.ic-ghost')).toHaveCount(0)
  await page.mouse.move(to.x + to.width / 2, to.y + to.height - 8, { steps: 4 }); await page.mouse.up()
  expect(await recDates(page, iid)).toEqual(was)
  await page.waitForTimeout(400)
  expect(await editorOpen(page), 'a drag that could not lift is not a tap').toBe(false)
  /* and a plain click still opens it, read only */
  await page.locator(`[data-testid="ib-bar-${iid}"]`).first().click()
  await expect(page.locator('[data-testid="inped-ro"]')).toBeVisible()
})

test('a finger: a bar held still lifts, is carried to another date and lands there — the page standing still', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL)
  try {
    const [iid] = await file(page, [{ who: 3, type: 'LL', from: 'Oct 20', to: 'Oct 22' }])
    const cdp = await context.newCDPSession(page)
    const bar = (await page.locator(`[data-testid="ib-bar-${iid}"]`).boundingBox())!
    const xOf = async (iso: string) => { const r = (await cell(page, iso).boundingBox())!; return Math.round(r.x + r.width / 2) }
    const y = Math.round(bar.y + bar.height / 2), y0 = await page.evaluate(() => scrollY)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: await xOf('2026-10-21'), y, id: 1 }] })
    await expect(page.locator('.ic-ghost'), 'held still, the bar lifts').toHaveCount(1)
    for (const iso of ['2026-10-22', '2026-10-23']) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: await xOf(iso), y: y + 3, id: 1 }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach()
    await expect.poll(() => recDates(page, iid)).toEqual(['Oct 22', 'Oct 24'])
    expect(await page.evaluate(() => scrollY), 'the page scrolled under the finger').toBe(y0)
    await expect(page.locator('#inpCal .ic-mon'), 'and the month was not turned').toHaveText('Oct 2026')
    await page.waitForTimeout(400)
    expect(await editorOpen(page)).toBe(false)
  } finally { await context.close() }
})

/* A DAY OPENED ON THE INPUTS MONTH IS A WINDOW (D641, D648; the plan §3.6, §3.7): beside the month on a desktop and
   covering no date; on a phone a panel on the foot of the screen at two heights; the month behind it takes a press. */
const dayWin = (p: Page) => p.locator('[data-testid="win-inputsday"]')
test('on a desktop the opened day sits beside the month and covers no date; another date re-points it; dragged away, the month takes the width back', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  const [iid] = await file(page, [{ who: 3, type: 'Meeting', from: 'Oct 13', timed: [840, 960], more: { remarks: 'Bring the folder' } }])
  const width = async () => (await page.locator('[data-testid="ib-grid"]').boundingBox())!.width
  const full = await width()
  await cell(page, '2026-10-13').click({ position: { x: 8, y: 8 } }); await expect(dayWin(page)).toBeVisible()
  await expect(dayWin(page).locator('.win-ttl')).toContainText('Tue 13 Oct')
  const row = page.locator(`[data-testid="idy-row-${iid}"]`)
  await expect(row.locator('[data-testid="idy-when"]')).toHaveText('14:00–16:00'); await expect(row).toContainText('Bring the folder')
  const win = (await dayWin(page).boundingBox())!, grid = (await page.locator('[data-testid="ib-grid"]').boundingBox())!
  expect(grid.x + grid.width, 'the month ends before the window begins').toBeLessThanOrEqual(win.x)
  /* nothing of the window lies over a date: every date's own corner is still the date */
  const covered = await page.evaluate(() => [...document.querySelectorAll('#inpCal [data-icday]')].filter(c => { const r = c.getBoundingClientRect(); const hit = document.elementFromPoint(r.x + 6, r.y + 6); return !(hit && (hit === c || c.contains(hit))) }).map(c => (c as HTMLElement).dataset.icday))
  expect(covered).toEqual([])
  /* the tabs and the tools are not under it either */
  for (const id of ['#inMedBtn', '#inFSearch', '#inListBtn']) { const b = (await page.locator(id).boundingBox())!; expect(b.x + b.width, id + ' is under the window').toBeLessThanOrEqual(win.x) }
  await cell(page, '2026-10-20').click({ position: { x: 8, y: 8 } })
  await expect(dayWin(page)).toHaveCount(1); await expect(dayWin(page).locator('.win-ttl')).toContainText('Tue 20 Oct')
  /* a press on the page outside it leaves it up (D641) */
  await page.locator('#inpCal .ic-mon').click(); await expect(dayWin(page)).toBeVisible()
  const bar = (await dayWin(page).locator('.win-bar').boundingBox())!
  await page.mouse.move(bar.x + 80, bar.y + 12); await page.mouse.down(); await page.mouse.move(bar.x - 300, bar.y + 200, { steps: 6 }); await page.mouse.up()
  await expect.poll(width).toBe(full)
  await page.locator('[data-testid="win-inputsday-x"]').click(); await expect(dayWin(page)).toHaveCount(0)
})

test('on a phone the opened day is a panel on the foot of the screen: about two-thirds high, pulled up by its bar and back, its controls a finger’s size', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL)
  try {
    await file(page, Array.from({ length: 14 }, (_, i) => ({ who: i, type: 'LL', from: 'Oct 20' })))
    await cell(page, '2026-10-20').tap({ position: { x: 10, y: 10 } })
    const win = dayWin(page); await expect(win).toBeVisible()
    await page.waitForTimeout(450)
    expect(await editorOpen(page), 'the tap pressed through into the window').toBe(false)
    const low = (await win.boundingBox())!
    expect(low.height, 'it opens about two-thirds high — the month behind stays in reach').toBeLessThan(844 * 0.72)
    expect(low.y + low.height).toBeLessThanOrEqual(844)
    /* everyone is listed and the LIST scrolls — "+ Input" stays pinned above it (D648) */
    const g = await page.evaluate(() => { const l = document.querySelector('[data-testid="idy-list"]') as HTMLElement, a = document.querySelector('#icPopAdd')!.getBoundingClientRect(), w = document.querySelector('[data-testid="win-inputsday"]')!.getBoundingClientRect(); return { rows: l.querySelectorAll('[data-testid^="idy-row-"]').length, scrolls: l.scrollHeight > l.clientHeight + 4, addIn: a.top >= w.top && a.bottom <= w.bottom, addH: a.height } })
    expect(g.rows).toBe(14); expect(g.scrolls, 'the list scrolls inside the window').toBe(true); expect(g.addIn).toBe(true); expect(g.addH).toBeGreaterThanOrEqual(44)
    await page.evaluate(() => { const l = document.querySelector('[data-testid="idy-list"]') as HTMLElement; l.scrollTop = l.scrollHeight })
    const add = (await page.locator('#icPopAdd').boundingBox())!
    expect(add.y, '"+ Input" stood still while the list scrolled').toBeGreaterThanOrEqual(low.y)
    /* the month behind still takes a tap: another date re-points the same window */
    /* (a date of the first week — the panel stands over the lower weeks, which is what its two heights are for) */
    await cell(page, '2026-10-01').tap({ position: { x: 10, y: 10 } })
    await expect(win.locator('.win-ttl')).toContainText('Thu 1 Oct')
    await win.locator('.win-ttl').tap(); await expect(win).toHaveClass(/is-tall/)
    await page.waitForTimeout(450)
    expect(await editorOpen(page), 'the bar’s tap pressed through as the window moved').toBe(false)
    const tall = (await win.boundingBox())!
    expect(tall.y).toBeLessThanOrEqual(12); expect(tall.height).toBeGreaterThan(844 * 0.9)
    await win.locator('.win-ttl').tap(); await expect(win).not.toHaveClass(/is-tall/)
    const x = (await page.locator('[data-testid="win-inputsday-x"]').boundingBox())!
    expect(Math.min(x.width, x.height)).toBeGreaterThanOrEqual(44)
    expect(await page.evaluate(() => document.documentElement.scrollWidth), 'no sideways scroll with the day open').toBeLessThanOrEqual(390)
    await page.locator('[data-testid="win-inputsday-x"]').tap(); await expect(win).toHaveCount(0)
  } finally { await context.close() }
})

/* THE KEYBOARD, WITH REAL KEYS AND REAL FOCUS (D621): what jsdom cannot say is where the browser's focus really goes —
   onto the next date, into the opened day and back to the date on Escape, onto the question's "Delete". */
test('the keyboard: arrows move the date, Shift + arrows pick a run, Enter files or opens, Escape closes and gives the keyboard back, Delete asks first', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  const [iid] = await file(page, [{ who: 3, type: 'LL', from: 'Oct 20' }])
  const on = () => page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.icday || (document.activeElement as HTMLElement | null)?.dataset.testid || document.activeElement?.tagName)
  await cell(page, '2026-10-13').focus()
  await page.keyboard.press('ArrowRight'); expect(await on()).toBe('2026-10-14')
  await page.keyboard.press('ArrowDown'); expect(await on()).toBe('2026-10-21')
  await page.keyboard.press('Shift+ArrowLeft'); await page.keyboard.press('Shift+ArrowLeft')
  for (const d of ['2026-10-19', '2026-10-20', '2026-10-21']) await expect(cell(page, d)).toHaveClass(/is-picked/)
  await page.keyboard.press('Enter')
  await expect(page.locator('#inpEditPop .rc-read')).toHaveText('Oct 19 → Oct 21')
  await page.keyboard.press('Escape'); await expect(page.locator('#inpEditPop')).toBeHidden()
  /* past the month's end the month turns and the keyboard is on the new month's date */
  await cell(page, '2026-10-31').focus(); await page.keyboard.press('ArrowRight')
  await expect(page.locator('#inpCal .ic-mon')).toHaveText('November 2026'); await expect.poll(on).toBe('2026-11-01')
  await page.keyboard.press('ArrowLeft'); await expect(page.locator('#inpCal .ic-mon')).toHaveText('October 2026'); await expect.poll(on).toBe('2026-10-31')
  /* Enter opens the day and the keyboard goes INTO its window; Escape closes it and hands the keyboard back to the date */
  await cell(page, '2026-10-20').focus(); await page.keyboard.press('Enter')
  await expect(dayWin(page)).toBeVisible()
  expect(await page.evaluate(() => !!document.activeElement?.closest('[data-testid="win-inputsday"]')), 'the keyboard is in the window').toBe(true)
  await page.keyboard.press('Escape'); await expect(dayWin(page)).toHaveCount(0)
  await expect.poll(on, { message: 'the keyboard is back on the date that opened it' }).toBe('2026-10-20')
  /* Delete on a line asks first; the question's own "Delete" has the keyboard, so Enter answers it */
  await page.keyboard.press('Enter'); await expect(dayWin(page)).toBeVisible()
  await page.locator(`[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`).focus()
  await page.keyboard.press('Delete')
  await expect(page.locator('[data-testid="idy-ask"]')).toContainText('Delete this input?')
  expect(await recDates(page, iid), 'nothing is removed until he says').not.toBeNull()
  await expect.poll(on).toBe('idy-del-yes')
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-testid="idy-ask"]')).toHaveCount(0); await expect(dayWin(page), 'Escape put the question away, not the day').toBeVisible()
  await page.locator(`[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`).focus()
  await page.keyboard.press('Delete'); await expect.poll(on).toBe('idy-del-yes'); await page.keyboard.press('Enter')
  await expect.poll(() => recDates(page, iid)).toBeNull()
  await page.click('#undoBtn'); await expect.poll(() => recDates(page, iid)).toEqual(['Oct 20', ''])
})

/* THE GEAR (D635, D639): the app's own cog, admins only; its window drags and the month behind it answers (D641); what
   it saves survives a reload; and the Logic page's row opens the SAME window. */
test('the gear: the Inputs cut-off and the members’ switch are saved from its window and survive a reload; the Logic page opens the same window; a member has no gear', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  const gear = page.locator('[data-testid="in-gear"]'), win = page.locator('[data-testid="win-inputsset"]')
  await expect(gear).toHaveText('⚙'); await expect(gear.locator('svg')).toHaveCount(0)
  await gear.click(); await expect(win).toBeVisible()
  /* a window, not a wall: dragged aside by its bar, and a date behind it still opens */
  const bar = (await win.locator('.win-bar').boundingBox())!
  await page.mouse.move(bar.x + 90, bar.y + 12); await page.mouse.down(); await page.mouse.move(bar.x - 200, bar.y + 140, { steps: 6 }); await page.mouse.up()
  const moved = (await win.boundingBox())!
  const clear = await page.evaluate(m => { for (const d of document.querySelectorAll('#inpCal [data-icday]')) { const r = d.getBoundingClientRect(), x = r.left + 8, y = r.top + 8; if (x < m.x - 4 || x > m.x + m.width + 4 || y < m.y - 4 || y > m.y + m.height + 4) return (d as HTMLElement).dataset.icday || '' } return '' }, moved)
  expect(clear, 'some date is clear of the window').not.toBe('')
  await cell(page, clear).click({ position: { x: 8, y: 8 } }); await expect(dayWin(page)).toBeVisible(); await expect(win).toBeVisible()
  await page.locator('[data-testid="win-inputsday-x"]').click()
  /* a weekday of a number of weeks before, and the switch off */
  await page.locator('[data-testid="iset-mode-wd"]').click()
  await page.locator('[data-testid="iset-wd"]').selectOption('3'); await page.locator('[data-testid="iset-weeks"]').selectOption('2')
  await expect(page.locator('[data-testid="iset-example"]')).toContainText('inputs are due by the end of Thu')
  await page.locator('[data-testid="iset-memberfile"]').uncheck()
  await page.locator('[data-testid="iset-save"]').click(); await expect(win).toHaveCount(0)
  await page.reload(); await login(page); await go(page, 'logic')
  const row = page.locator('#lgBody .lgrule', { hasText: 'input is due' })
  await expect(row).toContainText('Thursday'); await expect(page.locator('#lgBody .lgrule', { hasText: 'Members may file duties and commitments for other people' })).toContainText('other people: off.')
  /* one setting, two ways in: the row's button opens the same window, showing what was saved */
  await row.locator('[data-lgopen="inputs"]').click(); await expect(win).toBeVisible()
  await expect(page.locator('[data-testid="iset-mode-wd"]')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-testid="iset-memberfile"]')).not.toBeChecked()
  await page.locator('[data-testid="iset-cancel"]').click()
  /* (Undo of each, alone, is pinned in ui/inputssettings.test.tsx — a reload starts a new sitting with no steps, D148) */
})

test('a member has no gear on the Inputs calendar and no door on the Logic page; on a phone the gear sits on the tools row beside the filter', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page, 'user'); await go(page, 'inputs')
  await expect(page.locator('#inpCal')).toBeVisible(); await expect(page.locator('[data-testid="in-gear"]')).toHaveCount(0)
  await go(page, 'logic'); await expect(page.locator('#lgBody [data-lgopen]')).toHaveCount(0)
})
