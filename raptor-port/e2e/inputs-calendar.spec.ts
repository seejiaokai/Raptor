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
  await page.setViewportSize({ width: 390, height: 700 })           // the browser's own bars slide in
  await expect.poll(async () => (await read()).bottom).toBeLessThanOrEqual(700 + 1)
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
  /* THE TOOLS ARE DRAWN AS TALL AS THE TABS ABOVE THEM (owner D698, 9 Oct 26, from his iPhone: "Can the bottom buttons
     row match the top inputs row in terms of vertical height. Seems like the 2nd row is taller" — his word for a
     button's size, D487; it replaces "narrower, never shorter", D653's reading 5). What is DRAWN is the tab's height;
     what answers a finger is still 44 — a press area a little larger than the button, as "How this works" has. */
  const reach = (sel: string) => page.evaluate(sel => { const b = document.querySelector(sel)!, r = b.getBoundingClientRect(), x = r.left + r.width / 2; const at = (y: number) => { const h = document.elementFromPoint(x, y); return !!h && (h === b || b.contains(h)) }; let top = r.top + 1, bottom = r.bottom - 1; while (at(top - 1)) top--; while (at(bottom + 1)) bottom++; return Math.round(bottom - top) + 1 }, sel)
  for (const id of ['#icPrev', '#icNext', '#icToday', '#inCalBtn', '#inListBtn', '#inFiltersBtn', '[data-testid="in-gear"]']) {
    expect(Math.round((await box(id)).h), id + ' is drawn as tall as a tab').toBe(Math.round(tabs[0].h))
    expect(await reach(id), id + ' still answers a finger').toBeGreaterThanOrEqual(44)
  }
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

/* ...AND ON THE LIST, whose row is the same row (D698): the switch, the filter button and the gear as tall as a tab. */
test('a phone, the List: the row under the tabs is drawn as tall as the tabs, and each button still answers a finger (D698)', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL)
  try {
    await page.locator('#inListBtn').tap(); await expect(page.locator('#inpCal')).toHaveCount(0)
    const h = (sel: string) => page.locator(sel).evaluate(n => Math.round(n.getBoundingClientRect().height))
    const reach = (sel: string) => page.evaluate(sel => { const b = document.querySelector(sel)!, r = b.getBoundingClientRect(), x = r.left + r.width / 2; const at = (y: number) => { const h = document.elementFromPoint(x, y); return !!h && (h === b || b.contains(h)) }; let top = r.top + 1, bottom = r.bottom - 1; while (at(top - 1)) top--; while (at(bottom + 1)) bottom++; return Math.round(bottom - top) + 1 }, sel)
    const tab = await h('#inMemberMode')
    for (const id of ['#inCalBtn', '#inListBtn', '#inFiltersBtn', '#inGear']) { expect(await h(id), id + ' is drawn as tall as a tab').toBe(tab); expect(await reach(id), id + ' still answers a finger').toBeGreaterThanOrEqual(44) }
  } finally { await context.close() }
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
  await expect(page.locator('[data-testid="win-inputedit"] .win-ttl')).toContainText('14 Oct')
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
    await page.locator('[data-testid="win-inputedit-x"]').tap(); await expect(page.locator('#inpEditPop')).toBeHidden()
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
    await page.locator('[data-testid="win-inputedit-x"]').tap(); await expect(page.locator('#inpEditPop')).toBeHidden()
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] })
    await expect(cell(page, '2026-10-20')).toHaveClass(/is-picked/)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach()
    await expect(page.locator('#inpEditPop .rc-read')).toHaveText('Oct 20')
    await page.locator('[data-testid="win-inputedit-x"]').tap()
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

/* RE-POINTED 9 Oct 26 BY HIS RULING D683 (from his iPhone: "show the window to like a tall size when someone clicks on a day for
   input. Day title and input can be slightly shorter in height. +note and pucks can shift … to beside the day title"): it
   OPENS tall, where it used to open two-thirds high; its bar brings it down to that height and back; "+ Input" and the title
   box are 38px; "+ Note" and "+ Pucks" are in the bar beside the date, and a tap on one is not a tap on the bar. */
test('on a phone the opened day is a panel on the foot of the screen: it opens TALL, is pulled down by its bar and back, "+ Note" and "+ Pucks" in its bar, its controls a finger’s size (D683)', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL)
  try {
    await file(page, Array.from({ length: 14 }, (_, i) => ({ who: i, type: 'LL', from: 'Oct 20' })))
    await cell(page, '2026-10-20').tap({ position: { x: 10, y: 10 } })
    const win = dayWin(page); await expect(win).toBeVisible()
    await page.waitForTimeout(450)
    expect(await editorOpen(page), 'the tap pressed through into the window').toBe(false)
    await expect(win, 'it opens tall (D683)').toHaveClass(/is-tall/)
    const first = (await win.boundingBox())!
    expect(first.y).toBeLessThanOrEqual(12); expect(first.height).toBeGreaterThan(844 * 0.9); expect(first.y + first.height).toBeLessThanOrEqual(844)
    /* "+ Note" in the bar, after the date and before the cross — a finger's size, over nothing ("+ Pucks" stood beside
       it until D684, 9 Oct 26: a note carries its own pucks now) */
    await expect(page.locator('#icAddPucks')).toHaveCount(0)
    const bar = await page.evaluate(() => {
      const r = (s: string) => document.querySelector(s)!.getBoundingClientRect()
      const t = r('[data-testid="win-inputsday"] .win-ttl'), n = r('#icAddPuck'), x = r('[data-testid="win-inputsday-x"]'), b = r('[data-testid="win-inputsday"] .win-bar')
      return { order: t.right <= n.left + 1 && n.right <= x.left + 1, inBar: n.top >= b.top && n.bottom <= b.bottom, h: n.height, w: n.width, title: t.width }
    })
    expect(bar.order, 'the date, + Note, the cross — in that order, none over another').toBe(true)
    expect(bar.inBar).toBe(true); expect(bar.h).toBeGreaterThanOrEqual(36); expect(bar.w).toBeGreaterThanOrEqual(44)
    expect(bar.title, 'the date is still read whole').toBeGreaterThan(80)
    /* a tap on one of them is the button's, not the bar's: the note box opens and the window keeps its height */
    await page.locator('#icAddPuck').tap()
    await expect(page.locator('.ic-poppuck-edit')).toBeVisible()
    await expect(win).toHaveClass(/is-tall/)
    /* left empty, the note box goes when it loses the keyboard (Escape there closes the whole day — the shell's rule,
       older than this change and filed with `[CAL-CHECK-SEEN]`) */
    await page.locator('.ic-poppuck-edit').blur()
    await expect(page.locator('.ic-poppuck-edit')).toHaveCount(0)
    await expect(win).toBeVisible()
    /* down to the shorter height by a tap on its bar — the month behind is in reach again */
    await win.locator('.win-ttl').tap(); await expect(win).not.toHaveClass(/is-tall/)
    await page.waitForTimeout(450)
    expect(await editorOpen(page), 'the bar’s tap pressed through as the window moved').toBe(false)
    const low = (await win.boundingBox())!
    expect(low.height, 'pulled down it is about two-thirds high').toBeLessThan(844 * 0.72)
    expect(low.y + low.height).toBeLessThanOrEqual(844)
    /* everyone is listed and the LIST scrolls — "+ Input" stays pinned above it (D648) */
    const g = await page.evaluate(() => { const l = document.querySelector('[data-testid="idy-list"]') as HTMLElement, a = document.querySelector('#icPopAdd')!.getBoundingClientRect(), w = document.querySelector('[data-testid="win-inputsday"]')!.getBoundingClientRect(); return { rows: l.querySelectorAll('[data-testid^="idy-row-"]').length, scrolls: l.scrollHeight > l.clientHeight + 4, addIn: a.top >= w.top && a.bottom <= w.bottom, addH: a.height } })
    expect(g.rows).toBe(14); expect(g.scrolls, 'the list scrolls inside the window').toBe(true); expect(g.addIn).toBe(true)
    expect(g.addH, '"+ Input" is a little shorter, on his word (D683)').toBeGreaterThanOrEqual(38); expect(g.addH).toBeLessThan(44)
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

/* "HOW THIS WORKS" AND THE LEGEND IN A REAL BROWSER (D646): the fold opens ABOVE the month and the month re-fits under
   it — its foot still on the screen's foot where it fits — and the line holds on a phone. */
test('"How this works" opens above the month, which re-fits under it; the legend holds its line on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  const grid = () => page.locator('[data-testid="ib-grid"]').boundingBox()
  const before = (await grid())!
  const how = (await page.locator('[data-testid="ib-how"]').boundingBox())!, legend = (await page.locator('[data-testid="ib-legend"]').boundingBox())!
  /* the line is slim, and the fold's button still takes a finger: 44px of it answer a press */
  const reach = await page.evaluate(() => { const b = document.querySelector('[data-testid="ib-how"]')!, r = b.getBoundingClientRect(), x = r.left + r.width / 2; const at = (y: number) => !!document.elementFromPoint(x, y)?.closest('[data-testid="ib-how"]'); let top = r.top, bottom = r.bottom; while (at(top - 1)) top--; while (at(bottom + 1)) bottom++; return bottom - top })
  expect(reach, 'the fold’s button answers a finger').toBeGreaterThanOrEqual(44)
  expect(Math.abs((how.y + how.height / 2) - (legend.y + legend.height / 2)), 'the fold’s button and the legend share a line').toBeLessThanOrEqual(8)
  expect(legend.x + legend.width).toBeLessThanOrEqual(390)
  await page.locator('[data-testid="ib-how"]').click()
  await expect(page.locator('[data-testid="ib-how-list"] li')).toHaveCount(5)
  await expect(page.locator('[data-testid="ib-how-cut"]')).toHaveText('File at least 14 days before the week starts.')
  const list = (await page.locator('[data-testid="ib-how-list"]').boundingBox())!
  await expect.poll(async () => (await grid())!.y, { message: 'the month moves down under the opened fold' }).toBeGreaterThan(before.y + 40)
  const after = (await grid())!
  expect(list.y + list.height, 'the fold is above the month, not over it').toBeLessThanOrEqual(after.y + 1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.locator('[data-testid="ib-how"]').click()
  await expect.poll(async () => Math.round((await grid())!.y)).toBe(Math.round(before.y))
  await expect.poll(async () => Math.round((await grid())!.height), { message: 'and takes its height back' }).toBe(Math.round(before.height))
})

/* THE INPUT EDITOR IS A WINDOW ON THE INPUTS PAGE (D641; the plan §3.7): it drags, the month behind it works, and it
   never saves a field its user did not change — pinned here with a real drag of the very bar it is editing. */
const edWin = (p: Page) => p.locator('[data-testid="win-inputedit"]')
test('the editor is a window: with it open, the bar behind it is dragged to other days — Save keeps the new days AND the remark typed in the window', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  const [iid] = await file(page, [{ who: 3, type: 'Meeting', from: 'Oct 5', to: 'Oct 7', timed: [600, 660] }])
  await page.locator(`[data-testid="ib-bar-${iid}"]`).click()
  await expect(edWin(page)).toBeVisible()
  await expect(page.locator('.airpop#inpEditPop'), 'no blocking dialog, no veil').toHaveCount(0)
  await page.fill('#inpEditRmk', 'typed in the window')
  /* drag the window clear of the first weeks, by its bar */
  const bar = (await edWin(page).locator('.win-bar').boundingBox())!
  await page.mouse.move(bar.x + 80, bar.y + 12); await page.mouse.down(); await page.mouse.move(bar.x + 60, 640, { steps: 6 }); await page.mouse.up()
  /* the page behind works: the same input's bar, dragged two days later */
  const b = (await page.locator(`[data-testid="ib-bar-${iid}"]`).boundingBox())!, y = b.y + b.height / 2
  const xOf = async (iso: string) => { const r = (await cell(page, iso).boundingBox())!; return r.x + r.width / 2 }
  await page.mouse.move(await xOf('2026-10-06'), y); await page.mouse.down()
  await page.mouse.move(await xOf('2026-10-07'), y + 4, { steps: 4 }); await page.mouse.move(await xOf('2026-10-08'), y + 6, { steps: 4 }); await page.mouse.up()
  await expect.poll(() => recDates(page, iid)).toEqual(['Oct 7', 'Oct 9'])
  await expect(edWin(page), 'the window is still up').toBeVisible()
  await expect(page.locator('#inpEditRmk'), 'and still holds what was typed').toHaveValue('typed in the window')
  await expect(edWin(page).locator('.win-ttl'), 'its title follows the record').toContainText('7 Oct')
  await page.click('#inpEditSave'); await expect(edWin(page)).toHaveCount(0)
  expect(await recDates(page, iid), 'the window did not put the old days back').toEqual(['Oct 7', 'Oct 9'])
  expect(await page.evaluate(iid => (window as any).INPUTS.find((x: any) => x.iid === iid).remarks, iid)).toBe('typed in the window')
})

/* at 568 high the form is taller than the screen — the case the rule is for; on a tall phone it simply fits */
for (const height of [568, 844]) test(`phone ${height}: the editor window is whole on the screen, its form scrolls inside it where it must, and Save is reached`, async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL, height)
  try {
    await cell(page, '2026-10-20').tap({ position: { x: 10, y: 10 } })
    await page.locator('#icPopAdd').tap()
    await expect(edWin(page)).toBeVisible()
    const w = (await edWin(page).boundingBox())!
    if (height === 568) expect(w.y, 'a form taller than the screen runs up to a thin strip at its top (D537)').toBeLessThanOrEqual(24)
    expect(w.y).toBeGreaterThanOrEqual(0); expect(w.y + w.height).toBeLessThanOrEqual(height); expect(w.x).toBeGreaterThanOrEqual(0); expect(w.x + w.width).toBeLessThanOrEqual(390)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    await page.locator('#inpEditSave').scrollIntoViewIfNeeded()
    const save = (await page.locator('#inpEditSave').boundingBox())!
    expect(save.y + save.height, 'Save is inside the window, on the screen').toBeLessThanOrEqual(w.y + w.height + 1)
    const x = (await page.locator('[data-testid="win-inputedit-x"]').boundingBox())!
    expect(Math.min(x.width, x.height)).toBeGreaterThanOrEqual(44)
    await page.locator('[data-testid="win-inputedit-x"]').tap(); await expect(edWin(page)).toHaveCount(0)
  } finally { await context.close() }
})

/* ONE INPUT FOR SEVERAL PEOPLE (owner D654–D656, D659; the plan §3.13, "Browser (phone and desktop)"): the picker four
   across at 390 px with no sideways scroll, a puck pressed by touch; a group filed from the month by a member, seen as
   one bar, opened, one man taken out. */
const pick = (p: Page) => p.locator('#inpEditPop [data-testid="pp"]')
test('a phone: "Several people" draws the pucks four across with nothing running off sideways, and a finger picks one', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL)
  try {
    await cell(page, '2026-10-20').tap({ position: { x: 10, y: 10 } })
    await page.locator('#icPopAdd').tap()
    await expect(edWin(page)).toBeVisible()
    await page.selectOption('#inpEditType', 'Meeting')
    await pick(page).locator('[data-testid="pp-several"]').tap()
    const pilots = pick(page).locator('[data-ppgroup="pilots"] [data-pp]')
    await expect(pilots.nth(4)).toBeVisible()
    const boxes = await pilots.evaluateAll(els => els.slice(0, 8).map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right } }))
    expect(boxes.filter(b => Math.abs(b.y - boxes[0].y) < 2), 'four on the first line').toHaveLength(4)
    expect(Math.abs(boxes[4].y - boxes[0].y), 'the fifth starts the next').toBeGreaterThan(10)
    for (const b of boxes) { expect(b.x).toBeGreaterThanOrEqual(0); expect(b.r).toBeLessThanOrEqual(390); expect(b.h, 'a finger’s target').toBeGreaterThanOrEqual(36) }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    expect(await page.evaluate(() => { const e = document.getElementById('inpEditPop')!; return e.scrollWidth <= e.clientWidth + 1 }), 'the window does not scroll sideways').toBe(true)
    /* every group he named is there, and Personnel for the demo's ground crew (D659) */
    for (const g of ['pilots', 'wsos', 'sans', 'personnel']) await expect(pick(page).locator(`[data-ppgroup="${g}"]`)).toHaveCount(1)
    const other = pilots.nth(2)
    await expect(other).toHaveAttribute('aria-pressed', 'false')
    await other.tap()
    await expect(other).toHaveAttribute('aria-pressed', 'true')
    await expect(pick(page).locator('[data-testid="pp-count"]')).toHaveText('2 picked')
    /* "All" has a finger's reach though it is drawn small */
    const all = (await pick(page).locator('[data-testid="pp-all-wsos"]').boundingBox())!
    expect(all.height).toBeGreaterThanOrEqual(24)
  } finally { await context.close() }
})

test('a member files a meeting for himself and another man from the month: ONE bar; opened, it is the entry; the other man taken out, it is his own again', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page, 'user'); await go(page, 'inputs'); await page.selectOption('#inFPerson', 'all'); await month(page, 2026, 10)
  const had = await page.evaluate(() => (window as any).INPUTS.map((r: any) => r.iid))
  await cell(page, '2026-10-21').click({ position: { x: 8, y: 8 } })
  await page.click('#icPopAdd')
  await expect(edWin(page)).toBeVisible()
  await page.selectOption('#inpEditType', 'Meeting')
  await pick(page).locator('[data-testid="pp-several"]').click()
  const other = await page.evaluate(() => { const w = window as any, P = w.PEOPLE; return Object.keys(P).find(id => P[id].cs === 'Saber')! })
  await pick(page).locator(`[data-pp="${other}"]`).click()
  await page.fill('#inpEditRmk', 'flight meeting')
  await page.click('#inpEditSave')
  await expect(edWin(page)).toHaveCount(0)
  const made = await page.evaluate(had => (window as any).INPUTS.filter((r: any) => !had.includes(r.iid)).map((r: any) => ({ iid: r.iid, person: r.person, grp: r.grp, grpBy: r.grpBy })), had)
  expect(made).toHaveLength(2)
  expect(made[0].grp, 'one shared input').toBeTruthy(); expect(made[1].grp).toBe(made[0].grp)
  /* ONE bar on the month for the two of them, saying the first and "+1" */
  const bars = page.locator('#inpCal .ib-bar').filter({ hasText: '+1' })
  await expect(bars).toHaveCount(1)
  await expect(bars).toContainText('Meeting')
  /* opened: the entry — both lit — and it is his to change, as its filer */
  await bars.click()
  await expect(edWin(page)).toBeVisible()
  await expect(edWin(page).locator('.win-ttl')).toContainText('+1')
  await expect(pick(page).locator('[data-pp][aria-pressed="true"]')).toHaveCount(2)
  await expect(page.locator('#inpEditSave')).toBeVisible()
  /* the other man taken out */
  await pick(page).locator(`[data-pp="${other}"]`).click()
  await page.click('#inpEditSave')
  await expect(edWin(page)).toHaveCount(0)
  const left = await page.evaluate(had => (window as any).INPUTS.filter((r: any) => !had.includes(r.iid)).map((r: any) => r.person), had)
  expect(left).toHaveLength(1)
  expect(left[0]).not.toBe(other)
  await expect(page.locator('#inpCal .ib-bar').filter({ hasText: '+1' })).toHaveCount(0)
})

/* THE CALENDAR JOB'S BUG CHECK (8 Oct 26 — docs/handpass/2026-10-08-inputs-sans-calendar-check.md, findings W1 to W5).
   Each of these was SEEN going wrong in the running build by the host (scripts/handpass/cal-host-leads.mjs) before it
   was fixed; the rules are unit tests (ui/dayswindow.test.tsx, ui/floatwindow.test.tsx, ui/editorwindow.test.tsx).
   What only a real browser says: that real focus and a real Escape reach the right window, that a real press on a
   bar behind the editor raises the question, and that four screens print one word for one holiday. */
test('Escape closes the window in FRONT — the settings window over the editor: the editor keeps what was typed, and is then the front one', async ({ page }) => {
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  const [iid] = await file(page, [{ who: 0, type: 'Meeting', from: 'Oct 13', timed: [600, 660] }])
  await page.locator(`.ib-bar[data-iid="${iid}"]`).first().click()
  await expect(edWin(page)).toBeVisible()
  await page.locator('#inpEditRmk').fill('typed, not saved')
  await page.locator('#inGear').click()
  const settings = page.locator('[data-testid="win-inputsset"]')
  await expect(settings).toBeVisible()
  await expect(settings).toHaveClass(/front/)
  await page.locator('[data-testid="iset-cancel"]').focus()
  await page.keyboard.press('Escape')
  await expect(settings, 'the window in front closed').toHaveCount(0)
  await expect(edWin(page), 'the editor behind it stayed').toBeVisible()
  await expect(page.locator('#inpEditRmk')).toHaveValue('typed, not saved')
  await expect(edWin(page), 'and the one left is in front').toHaveClass(/front/)
  await page.locator('#inpEditRmk').focus()
  await page.keyboard.press('Escape')
  await expect(edWin(page)).toHaveCount(0)
  expect(await page.evaluate(iid => (window as any).INPUTS.find((r: any) => r.iid === iid)?.remarks, iid), 'nothing was saved').not.toBe('typed, not saved')
})

test('one more person picked in a shared input, nothing else touched: a press on another bar ASKS, and the picked people stay', async ({ page }) => {
  await login(page); await go(page, 'inputs'); await month(page, 2026, 7)
  /* the demo's shared input: a meeting for four on Thu 23 Jul */
  await cell(page, '2026-07-23').focus()
  await page.keyboard.press('Enter')
  await dayWin(page).locator('[data-testid="idy-people"]').first().click()
  await expect(edWin(page)).toBeVisible()
  const picked = page.locator('#inpEditPop .pp-pucks button[aria-pressed="true"]')
  await expect(picked).toHaveCount(4)
  await page.locator('#inpEditPop .pp-pucks button[aria-pressed="false"]').first().click()
  await expect(picked).toHaveCount(5)
  /* another input's bar, clear of both windows, pressed for real */
  const at = await page.evaluate(() => {
    const wins = [...document.querySelectorAll('.floatwin')].map(w => w.getBoundingClientRect())
    for (const b of document.querySelectorAll('.ib-bar[data-iid]')) {
      const r = b.getBoundingClientRect(); const x = r.left + Math.min(12, r.width / 2), y = r.top + r.height / 2
      if (r.width < 8 || wins.some(w => x >= w.left && x <= w.right && y >= w.top && y <= w.bottom)) continue
      const hit = document.elementFromPoint(x, y)
      if (hit && (hit === b || b.contains(hit)) && !/Meeting/.test(b.textContent || '')) return { x, y }
    }
    return null
  })
  expect(at, 'a bar clear of the windows').not.toBeNull()
  await page.mouse.click(at!.x, at!.y)
  await expect(page.locator('[data-testid="inped-swap"]'), 'it asks before it shows the other input').toBeVisible()
  await expect(picked, 'and the five he picked are still picked').toHaveCount(5)
  await expect(page.locator('.toast, [role="status"]').filter({ hasText: /changed while this window was open/i }), 'no false "changed behind it" message').toHaveCount(0)
  await page.locator('[data-testid="inped-swap-stay"]').click()
  await expect(picked).toHaveCount(5)
})

test('one holiday, one word: "ND" for a National Day on the "Calendar" month, the Inputs month, the SANS month and the Leave War', async ({ page }) => {
  await login(page); await go(page, 'leavewar')
  await page.locator('[data-testid="settings-open"]').click()
  await page.locator('[data-testid="settings-days"]').click()
  await expect(page.locator('[data-testid="win-days"]')).toBeVisible()
  if (await page.locator('[data-testid="days-tabs"]').count()) await page.locator('[data-testid="days-tab-holidays"]').click()
  await page.locator('[data-testid="hol-add"]').click()
  await page.locator('[data-testid="hol-name"]').fill('National Day')
  await page.locator('[data-testid="hol-short"]').fill('ND')
  for (let i = 0; i < 24; i++) {
    const [name, year] = (await page.locator('[data-testid="holcal-month"]').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 7 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name.slice(0, 3))))
    if (!d) break
    await page.locator(`[data-testid="${d > 0 ? 'holcal-next-month' : 'holcal-prev-month'}"]`).click()
  }
  await page.locator('[data-testid="holcal-day-2026-08-05"]').click()
  await page.locator('[data-testid="hol-save"]').click()
  if (await page.locator('[data-testid="days-tabs"]').count()) await page.locator('[data-testid="days-tab-month"]').click()
  for (let i = 0; i < 24; i++) {
    const [name, year] = (await page.locator('[data-testid="days-month"]').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 7 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name.slice(0, 3))))
    if (!d) break
    await page.locator(`[data-testid="${d > 0 ? 'days-next' : 'days-prev'}"]`).click()
  }
  const calTag = page.locator('[data-testid="days-tag-2026-08-05"]')
  await expect(calTag, 'the "Calendar" month').toHaveText('ND')
  await expect(calTag).toHaveAttribute('title', 'National Day - public holiday')
  await page.locator('[data-testid="win-days-x"]').click()
  await go(page, 'inputs'); await month(page, 2026, 8)
  await expect(page.locator('[data-testid="ib-tag-2026-08-05"]'), 'the Inputs month').toHaveText('ND')
  await page.locator('#inSansMode').click()
  await expect(page.locator('[data-testid="sanscal"]')).toBeVisible()
  for (let i = 0; i < 24; i++) {
    const [name, year] = (await page.locator('[data-testid="sc-month"]').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 7 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name.slice(0, 3))))
    if (!d) break
    await page.locator(`[data-testid="${d > 0 ? 'sc-next' : 'sc-prev'}"]`).click()
  }
  await expect(page.locator('[data-testid="sc-tag-2026-08-05"]'), 'the SANS month').toHaveText('ND')
})

/* THE DATES OF A SAVED SHARED INPUT ARE CHANGED IN ITS WINDOW (owner D681, 9 Oct 26 — `[CAL-SHARED-DATES]`). What only a
   real browser can say: that the calendar is THERE in the window a bar opens, that a real press on two of its days and
   on Save moves the ONE bar to those days for every man, that one press of Undo puts it back — and, on a phone, that
   the calendar fits the window's width and Save can still be reached under it. The rules are `ui/groupeditor.test.tsx`. */
const sharedMeeting = (p: Page, from: string) => file(p, [0, 1, 2].map(who => ({ who, type: 'Meeting', from, timed: [600, 660] as [number, number],
  more: { grp: 'e2e-g681', grpBy: 'stiff', by: 'stiff', at: '2026-09-01T08:00:00.000Z', remarks: 'range brief' } })))
const sharedBar = (p: Page) => p.locator('.ib-bar[data-iid]').filter({ hasText: /\+2 · Meeting/ })
test('a saved shared input: its window carries the calendar; two presses and Save move the ONE bar for every man; one Undo puts it back (D681)', async ({ page }) => {
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  const ids = await sharedMeeting(page, 'Oct 13')
  await expect(sharedBar(page)).toHaveCount(1)
  await sharedBar(page).click()
  await expect(edWin(page)).toBeVisible()
  const cal = page.locator('#inpEditPop #inpEdCal')
  await expect(cal, 'the calendar a new input has').toBeVisible()
  await expect(cal.locator('[data-cal="2026-10-13"]')).toHaveClass(/\bs\b/)
  await cal.locator('[data-cal="2026-10-20"]').click()
  await cal.locator('[data-cal="2026-10-22"]').click()
  await expect(page.locator('#inpEditPop .rc-read')).toContainText('20')
  await expect(page.locator('#inpEditPop .rc-read')).toContainText('22')
  await page.locator('#inpEditSave').click()
  await expect(edWin(page)).toBeHidden()
  for (const iid of ids) await expect.poll(() => recDates(page, iid)).toEqual(['Oct 20', 'Oct 22'])
  await expect(sharedBar(page), 'still ONE bar').toHaveCount(1)
  const bar = (await sharedBar(page).boundingBox())!, a = (await cell(page, '2026-10-20').boundingBox())!, b = (await cell(page, '2026-10-22').boundingBox())!
  expect(bar.x, 'the bar starts on the 20th').toBeGreaterThanOrEqual(a.x - 2)
  expect(bar.x + bar.width, 'and ends on the 22nd').toBeLessThanOrEqual(b.x + b.width + 2)
  expect(bar.x + bar.width, 'reaching into the 22nd').toBeGreaterThan(b.x + 4)
  await page.click('#undoBtn')
  for (const iid of ids) await expect.poll(() => recDates(page, iid), 'ONE Undo, every man').toEqual(['Oct 13', ''])
})
test('a phone: the shared input’s calendar fits the window, a finger picks its days, and Save is reached under it (D681)', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL)
  try {
    const ids = await sharedMeeting(page, 'Oct 13')
    await sharedBar(page).tap()
    await expect(edWin(page)).toBeVisible()
    const cal = page.locator('#inpEditPop #inpEdCal')
    await cal.scrollIntoViewIfNeeded()
    const c = (await cal.boundingBox())!
    expect(c.x, 'nothing runs off the left').toBeGreaterThanOrEqual(0)
    expect(c.x + c.width, 'or the right').toBeLessThanOrEqual(390)
    /* the calendar is the one "+ Input" already carries in this window, at its size (D487: no button is resized without
       his word — its days are 20px tall on a phone, said on the look card); what is checked is that a finger lands on
       the day it aimed at */
    await cal.locator('[data-cal="2026-10-20"]').tap()
    await expect(cal.locator('[data-cal="2026-10-20"]')).toHaveClass(/\bs\b/)
    await cal.locator('[data-cal="2026-10-21"]').tap()
    await expect(cal.locator('[data-cal="2026-10-21"]')).toHaveClass(/\be\b/)
    await expect(page.locator('#inpEditPop .rc-read')).toContainText('21')
    const save = page.locator('#inpEditSave')
    await save.scrollIntoViewIfNeeded()
    const s = (await save.boundingBox())!
    expect(s.y + s.height, 'Save is on the screen').toBeLessThanOrEqual(844)
    expect(await page.evaluate(() => { const e = document.getElementById('inpEditSave')!, r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)) }), 'and nothing lies over it').toBe(true)
    await save.tap()
    for (const iid of ids) await expect.poll(() => recDates(page, iid)).toEqual(['Oct 20', 'Oct 21'])
  } finally { await context.close() }
})


/* HIS LOOK ON HIS IPHONE, 9 Oct 26 — two more (D685, D686). What only a real browser says: that a real finger slid
   SIDEWAYS over the pucks picks them while a finger moved up or down still scrolls the window; that a real mouse drag
   picks across rows; and that a finger on a window moves what is in the window and never the page behind it. */
const openNewOn = async (page: Page, iso: string, touch: boolean) => {
  if (touch) { await cell(page, iso).tap({ position: { x: 10, y: 10 } }); await page.locator('#icPopAdd').tap() }
  else { await cell(page, iso).click({ position: { x: 8, y: 8 } }); await page.click('#icPopAdd') }
  await expect(edWin(page)).toBeVisible()
  await page.selectOption('#inpEditType', 'Meeting')
}
const pickedIds = (page: Page) => page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')!))
test('a phone: a finger slid sideways over the pucks picks every one it passes; a finger moved down scrolls the window and picks none (D685)', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL)
  try {
    await openNewOn(page, '2026-10-21', true)
    await pick(page).locator('[data-testid="pp-several"]').tap()
    const before = await pickedIds(page)
    /* the second row of Pilots: four across — slide from the first to the last of it */
    const row = await page.evaluate(() => { const b = [...document.querySelectorAll('#inpEditPop [data-ppgroup="pilots"] [data-pp]')].slice(4, 8).map(e => { const r = e.getBoundingClientRect(); return { id: e.getAttribute('data-pp')!, x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) } }); return b })
    expect(row).toHaveLength(4)
    const cdp = await context.newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: row[0].x, y: row[0].y, id: 1 }] })
    for (let x = row[0].x + 6; x <= row[3].x; x += 12) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: row[0].y, id: 1 }] }); await page.waitForTimeout(12) }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: row[3].x, y: row[3].y, id: 1 }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await page.waitForTimeout(450)
    const afterSlide = await pickedIds(page)
    for (const r of row) expect(afterSlide, 'picked by the slide: ' + r.id).toContain(r.id)
    expect(afterSlide.length, 'and nobody else').toBe(new Set([...before, ...row.map(r => r.id)]).size)
    await expect(page.locator('#inpEditPop [data-testid="pp-count"]')).toHaveText(`${afterSlide.length} picked`)
    /* a finger moved UP over the pucks: the window's own list scrolls, nothing more is picked */
    const body = () => page.evaluate(() => (document.querySelector('[data-testid="win-inputedit"] .win-body') as HTMLElement).scrollTop)
    const top0 = await body()
    const far = await page.evaluate(() => { const e = [...document.querySelectorAll('#inpEditPop [data-ppgroup="pilots"] [data-pp]')].slice(-1)[0], r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) } })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: far.x, y: far.y, id: 1 }] })
    for (let d = 15; d <= 240; d += 25) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: far.x, y: far.y - d, id: 1 }] }); await page.waitForTimeout(16) }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach()
    await page.waitForTimeout(450)
    expect(await body(), 'the list moved under the finger').toBeGreaterThan(top0 + 40)
    expect(await pickedIds(page), 'and the scroll picked nobody').toEqual(afterSlide)
  } finally { await context.close() }
})
test('a desktop: a mouse dragged across the pucks and down into the next row picks every one it passes; begun on a picked one it lets them go (D685)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
  await openNewOn(page, '2026-10-21', false)
  await pick(page).locator('[data-testid="pp-several"]').click()
  const before = await pickedIds(page)
  const at = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-ppgroup="wsos"] [data-pp]')].slice(0, 8).map(e => { const r = e.getBoundingClientRect(); return { id: e.getAttribute('data-pp')!, x: r.left + r.width / 2, y: r.top + r.height / 2 } }))
  const a = at[0], b = at[2], down = at.find(p => p.y > a.y + 10)!
  await page.mouse.move(a.x, a.y); await page.mouse.down()
  await page.mouse.move(b.x, b.y, { steps: 10 }); await page.mouse.move(down.x, down.y, { steps: 10 }); await page.mouse.up()
  const got = await pickedIds(page)
  for (const p of [at[0], at[1], at[2], down]) expect(got, p.id).toContain(p.id)
  expect(got.length).toBeGreaterThanOrEqual(before.length + 4)
  /* the click the browser sends after the drag did not undo the first puck; a plain click still lets one go */
  await page.locator(`#inpEditPop [data-pp="${at[1].id}"]`).click()
  expect(await pickedIds(page)).not.toContain(at[1].id)
  /* begun on a PICKED puck, the drag lets go */
  await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(b.x, b.y, { steps: 10 }); await page.mouse.up()
  const left = await pickedIds(page)
  expect(left).not.toContain(a.id); expect(left).not.toContain(b.id)
})
test('a phone: a finger on a window moves what is in the window — its own content when that can scroll, and never the page behind it (D686)', async ({ browser, baseURL }) => {
  /* a short phone: the page behind is taller than the screen, and so is the new-input form */
  const { context, page } = await phone(browser, baseURL, 600)
  try {
    await openNewOn(page, '2026-10-21', true)
    const read = () => page.evaluate(() => ({ page: Math.round(window.scrollY), body: (document.querySelector('[data-testid="win-inputedit"] .win-body') as HTMLElement).scrollTop, can: document.scrollingElement!.scrollHeight - window.innerHeight }))
    const w = (await edWin(page).boundingBox())!
    const cdp = await context.newCDPSession(page)
    const swipeUp = async () => {
      const x = 195, y0 = Math.round(w.y + w.height * 0.7)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0, id: 1 }] })
      for (let d = 20; d <= 260; d += 30) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 - d, id: 1 }] }); await page.waitForTimeout(16) }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(450)
    }
    const s0 = await read()
    expect(s0.can, 'the page behind could scroll').toBeGreaterThan(10)
    await swipeUp()
    const s1 = await read()
    expect(s1.body, 'the form scrolled under the finger').toBeGreaterThan(s0.body + 20)
    expect(s1.page, 'the page behind did not').toBe(s0.page)
    /* at its foot, more swipes move nothing — above all not the page */
    await swipeUp(); await swipeUp()
    const s2 = await read()
    expect(s2.page, 'at the foot of the form the page behind still does not move').toBe(s0.page)
    await cdp.detach()
    /* and a finger on the page BEHIND still scrolls the page (D641) — the strip above the window */
    await page.locator('[data-testid="win-inputedit-x"]').tap()
    await expect(edWin(page)).toHaveCount(0)
  } finally { await context.close() }
})

/* THE CALENDAR | LIST SWITCH STAYS WHERE IT IS (owner D687, 9 Oct 26 — "the calander/list button jumps to the left when I
   click on the list"). Only a real browser knows where a button IS: its box on the Calendar and on the List, a phone
   and a desktop — the same to the pixel, so the finger that pressed "List" is over "Calendar | List" still. */
for (const [name, vp, touch] of [['a phone', { width: 390, height: 844 }, true], ['a desktop', { width: 1440, height: 900 }, false]] as const) {
  test(`${name}: the Calendar | List switch is in the same place on the Calendar and on the List, and the row still holds one line (D687)`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: vp, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
    const page: Page = await context.newPage()
    try {
      await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
      const box = async () => { const b = (await page.locator('.inputs-views').boundingBox())!; return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] }
      const press = (sel: string) => touch ? page.locator(sel).tap() : page.locator(sel).click()
      const onCal = await box()
      /* the whole tools row is one line on the Calendar: the switch, the arrows, Today, the filter and the gear */
      const mids = await page.evaluate(() => ['#inCalBtn', '#icPrev', '#icToday', '#inGear'].map(s => { const r = document.querySelector(s)!.getBoundingClientRect(); return Math.round(r.top + r.height / 2) }))
      expect(Math.max(...mids) - Math.min(...mids), 'one line').toBeLessThanOrEqual(2)
      expect(await page.evaluate(() => document.documentElement.scrollWidth), 'nothing runs off sideways').toBeLessThanOrEqual(vp.width)
      /* a desktop: the switch, then the arrows, then Today. A phone (owner D705, 9 Oct 26): the arrows and Today first, where
         the SANS calendar has them, and the switch to their right */
      const order = await page.evaluate(phone => { const x = (s: string) => document.querySelector(s)!.getBoundingClientRect().left; return phone ? x('#icPrev') < x('#icToday') && x('#icToday') < x('#inCalBtn') : x('#inCalBtn') < x('#icPrev') && x('#icPrev') < x('#icToday') }, touch)
      expect(order, touch ? 'the arrows, then Today, then the switch (D705)' : 'the switch, then the arrows, then Today').toBe(true)
      await press('#inListBtn')
      await expect(page.locator('#inpCal')).toHaveCount(0)
      expect(await box(), 'on the List the switch has not moved').toEqual(onCal)
      await press('#inCalBtn')
      await expect(page.locator('#inpCal')).toHaveCount(1)
      expect(await box(), 'and back on the Calendar it is where it was').toEqual(onCal)
    } finally { await context.close() }
  })
}

/* THE FILTER BUTTON AND THE GEAR DO NOT MOVE WHEN THE FILTERS OPEN (owner D693, 9 Oct 26 — from his iPhone: "Why did the
   setting button move? Can the filter and the setting button stay when the filter button is pressed"). The folded
   fields stood between the two buttons, and opened they took a whole line — the gear fell under them and the filter
   button slid into its place. On the Calendar and on the List: both buttons where they were, the fields under the row. */
for (const view of ['the Calendar', 'the List'] as const) {
  test(`a phone, ${view}: pressing the filter button moves neither it nor the gear; the fields open on their own line under the row (D693)`, async ({ browser, baseURL }) => {
    const { context, page } = await phone(browser, baseURL)
    try {
      if (view === 'the List') { await page.locator('#inListBtn').tap(); await expect(page.locator('#inpCal')).toHaveCount(0) }
      /* WHERE a button is, without the press effect: the app's buttons draw 3% smaller while pressed (`.abtn:active`), and a
         finger's press lingers after a tap - a box read through that shrink is a pixel out, by timing alone (D87) */
      const box = (sel: string) => page.locator(sel).evaluate(n => { const el = n as HTMLElement, t = el.style.transition, f = el.style.transform; el.style.transition = 'none'; el.style.transform = 'none'; const b = el.getBoundingClientRect(); el.style.transform = f; el.style.transition = t; return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] })
      const shut = { filter: await box('#inFiltersBtn'), gear: await box('#inGear'), views: await box('.inputs-views') }
      await page.locator('#inFiltersBtn').tap()
      await expect(page.locator('#inFilters')).toBeVisible()
      expect(await box('#inFiltersBtn'), 'the filter button has not moved').toEqual(shut.filter)
      expect(await box('#inGear'), 'nor the gear').toEqual(shut.gear)
      expect(await box('.inputs-views'), 'nor the Calendar | List switch').toEqual(shut.views)
      const f = await box('#inFilters')
      expect(f[1], 'the fields are under the row, not in it').toBeGreaterThanOrEqual(shut.gear[1] + shut.gear[3])
      expect(await page.evaluate(() => document.documentElement.scrollWidth), 'nothing runs off sideways').toBeLessThanOrEqual(390)
      /* a filter chosen: its count is a badge on the button's corner — the button is no wider, so nothing moves */
      await page.selectOption('#inFType', 'OL')
      await expect(page.locator('#inFiltersBtn .inputs-filter-count')).toHaveText('1')
      expect(await box('#inFiltersBtn'), 'with a filter set the button is where and as wide as it was').toEqual(shut.filter)
      expect(await box('#inGear'), 'and so is the gear').toEqual(shut.gear)
      await page.locator('#inFiltersBtn').tap()
      await expect(page.locator('#inFilters')).toBeHidden()
      expect(await box('#inFiltersBtn')).toEqual(shut.filter)
      expect(await box('#inGear')).toEqual(shut.gear)
    } finally { await context.close() }
  })
}

/* A SHORTER INPUT IN AN OPENED DAY (owner D696, D699, D701, 9 Oct 26 — drawing B: "put the placed by sentence to the
   2nd row if the remarks is short. If the remarks is too long then move the placed by down to a 3rd row but still the
   same horizontal alignment"). Where a line of words ends is a browser's to say: a short remark and the small print on
   ONE line; under a long remark the small print on a line of its own; at the card's right end in both, and where there
   is no remark at all. */
test('a phone: in an opened day a short remark shares its line with who placed it; under a long remark that goes to a line of its own — at the card’s right end either way (D701)', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL, 667)
  try {
    const at = new Date(2026, 9, 2, 9, 10).getTime()
    const stamp = { by: 'x', at, modBy: 'x', modAt: at }
    const [short, long, bare] = await page.evaluate(async ([stamp]) => {
      const w = window as any, P = w.PEOPLE, crew = Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)
      const mk = (i: number, remarks: string) => { const iid = 'e2e-foot-' + i; w.fileInput({ iid, person: crew[i], type: 'Appointment', date: 'Oct 14', yr: 2026, allday: false, s: 540 + i * 60, e: 600 + i * 60, remarks, ...stamp, by: crew[i], modBy: crew[i] }); return iid }
      return [mk(1, 'Dental'), mk(2, 'Safety council, wing HQ — back for the 1600 brief if it ends on time'), mk(3, '')]
    }, [stamp])
    await page.locator('#inpCal [data-icday="2026-10-14"]').tap({ position: { x: 10, y: 10 } })
    await expect(page.locator('[data-testid="win-inputsday"]')).toBeVisible()
    const read = (iid: string) => page.locator(`[data-testid="idy-row-${iid}"]`).evaluate(row => {
      const r = (s: string) => { const n = row.querySelector(s); if (!n) return null; const b = n.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, left: b.left, right: b.right } }
      const cs = getComputedStyle(row)
      return { h: Math.round(row.getBoundingClientRect().height), inner: row.getBoundingClientRect().right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth), rmk: r('.sd-rmk'), placed: r('[data-testid="idy-placed"]'), words: row.querySelector('[data-testid="idy-placed"]')!.textContent }
    })
    const a = await read(short), b = await read(long), c = await read(bare)
    expect(a.words, 'the small print is the short form').toMatch(/^\S+ · 2 Oct, 09:10$/)
    expect(Math.abs(a.placed!.top - a.rmk!.top), 'a short remark and the small print share a line').toBeLessThanOrEqual(3)
    expect(a.placed!.left, 'and the small print stands after the remark').toBeGreaterThan(a.rmk!.right)
    expect(Math.abs(a.placed!.right - a.inner), 'at the card’s right end').toBeLessThanOrEqual(1.5)
    expect(a.h, 'two rows, not three').toBeLessThanOrEqual(56)
    expect(b.placed!.top, 'under a long remark the small print has a line of its own').toBeGreaterThanOrEqual(b.rmk!.bottom - 1)
    expect(Math.abs(b.placed!.right - b.inner), 'still at the card’s right end').toBeLessThanOrEqual(1.5)
    expect(c.rmk, 'no remark, no remark line').toBeNull()
    expect(Math.abs(c.placed!.right - c.inner), 'and with no remark it is at the right end too').toBeLessThanOrEqual(1.5)
    expect(c.h).toBeLessThanOrEqual(56)
    expect(await page.evaluate(() => document.documentElement.scrollWidth), 'nothing runs off sideways').toBeLessThanOrEqual(390)
  } finally { await context.close() }
})

/* A NOTE CARRIES ITS OWN PUCKS (owner D684, D688, D689, D692, D694, D695 — 9 Oct 26; the design of record
   `docs/mock/note-with-pucks.html`). What only a real browser can say: where its pucks stand (four across, the fourth
   as far from the right border as the first from the left — D694), how tall it is on a small phone (D688, D692), a
   real finger dragging a man off it (D689), and that what was made is there after a reload. The record's rules are
   state/plan.test.ts; the window's, ui/inputsday.test.tsx; the whole walk, scripts/handpass/note-pucks-walk.mjs. */
test('a phone: a note is written, given five people from its own "+", stands four across with even room, loses a man to a finger’s drag, and is still there after a reload (D684–D695)', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL, 667)
  try {
    await page.locator('#inpCal [data-icday="2026-10-14"]').tap({ position: { x: 10, y: 10 } })
    const win = page.locator('[data-testid="win-inputsday"]'); await expect(win).toBeVisible()
    await page.locator('#icAddPuck').tap()
    await page.locator('.ic-newnote .ic-poppuck-edit').fill('Brief the new guys, 0800')
    await page.locator('.ic-newnote .ic-poppuck-edit').press('Enter')
    const note = win.locator('.ic-note'); await expect(note).toHaveCount(1)
    await expect(note.locator('.ic-poppuck-txt')).toHaveText('Brief the new guys, 0800')
    expect((await note.boundingBox())!.height, 'a note of words alone is one slim line').toBeLessThanOrEqual(36)
    /* its own "+" — the picker — five people — OK: they land on THIS note */
    await note.locator('[data-pkadd]').tap(); await expect(page.locator('.ic-pick')).toBeVisible()
    for (const i of [3, 9, 14, 20, 26]) await page.locator('.ic-pick .ic-pickp').nth(i).tap()
    await page.locator('#icPickOk').tap()
    await expect(win.locator('.ic-note')).toHaveCount(1)
    await expect(note.locator('.ic-secpk:not(.ic-secpk-gap) .puck')).toHaveCount(5)
    const g = await note.evaluate(box => {
      const b = box.getBoundingClientRect(), pk = [...box.querySelectorAll('.ic-secpk:not(.ic-secpk-gap) .puck')].map(p => p.getBoundingClientRect())
      const row1 = pk.filter(p => Math.abs(p.top - pk[0].top) < 3), add = box.querySelector('.ic-secpk-grid .ic-pkadd')!
      return { h: b.height, across: row1.length, left: pk[0].left - b.left, right: b.right - row1[row1.length - 1].right, addLast: add === add.parentElement!.lastElementChild, wide: document.documentElement.scrollWidth }
    })
    expect(g.across, 'four across').toBe(4)
    expect(g.addLast, 'the dashed "+" is the last of them').toBe(true)
    expect(Math.abs(g.left - g.right), `even room: ${g.left} left of the first puck, ${g.right} right of the fourth (D694)`).toBeLessThanOrEqual(1.5)
    expect(g.h, 'compact: the drawing he chose is 77 tall (D692)').toBeLessThanOrEqual(82)
    expect(g.wide, 'nothing runs off sideways').toBeLessThanOrEqual(390)
    /* a real finger drags the second man off the note: he is taken off, his place held (D689; his 24 Aug rule) */
    const from = (await note.locator('.ic-secpk[data-pkidx="1"]').boundingBox())!, w = (await win.boundingBox())!
    const cdp = await context.newCDPSession(page), touch = (type: string, x?: number, y?: number) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: x == null ? [] : [{ x, y: y!, id: 1 }] } as any)
    const fx = from.x + from.width / 2, fy = from.y + from.height / 2, ty = Math.min(w.y + w.height - 30, fy + 220)
    await touch('touchStart', fx, fy); for (let i = 1; i <= 8; i++) await touch('touchMove', fx, fy + (ty - fy) * i / 8); await touch('touchEnd')
    await expect(note.locator('.ic-secpk:not(.ic-secpk-gap) .puck')).toHaveCount(4)
    await expect(note.locator('.ic-secpk-gap[data-pkidx="1"]'), 'his place is held').toHaveCount(1)
    /* saved: after a reload the note, its words and its four people are there */
    await page.waitForTimeout(600); await page.reload(); await login(page); await go(page, 'inputs'); await month(page, 2026, 10)
    await expect(page.locator('[data-ichead="2026-10-14"] .ic-chip.plan')).toHaveText('Brief the new guys, 0800')
    await expect(page.locator('[data-ichead="2026-10-14"] .ic-pks .ic-pk'), 'the month’s cell shows its people').toHaveCount(4)
    await page.locator('#inpCal [data-icday="2026-10-14"]').tap({ position: { x: 10, y: 10 } })
    await expect(page.locator('[data-testid="win-inputsday"] .ic-note .ic-secpk:not(.ic-secpk-gap) .puck')).toHaveCount(4)
  } finally { await context.close() }
})

/* A LONG KIND NEVER RUNS UNDER THE HOURS (found on the day-window walk, 9 Oct 26 — the host's look at its picture: an
   "Other" input is named by its remark, and a long one ran on under "All day" at the right of its card on a phone,
   the two printed over each other). The kind is cut with "…" where the hours begin. */
test('a phone: in an opened day a long kind is cut short of the hours — the two are never printed over each other', async ({ browser, baseURL }) => {
  const { context, page } = await phone(browser, baseURL, 667)
  try {
    await page.evaluate(() => {
      const w = window as any, P = w.PEOPLE, crew = Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)
      w.fileInput({ iid: 'e2e-longkind', person: crew[2], type: 'Other', date: 'Oct 14', yr: 2026, allday: true, remarks: 'A very long custom commitment name that runs on and on past the card' })
      w.fileInput({ iid: 'e2e-longkind-t', person: crew[3], type: 'Other', date: 'Oct 14', yr: 2026, allday: false, s: 1020, e: 1110, remarks: 'Another long custom commitment name, with hours' })
    })
    await page.locator('#inpCal [data-icday="2026-10-14"]').tap({ position: { x: 10, y: 10 } })
    await expect(page.locator('[data-testid="win-inputsday"]')).toBeVisible()
    for (const iid of ['e2e-longkind', 'e2e-longkind-t']) {
      const g = await page.locator(`[data-testid="idy-row-${iid}"]`).evaluate(row => {
        const b = (s: string) => row.querySelector(s)!.getBoundingClientRect()
        const kind = b('.idy-kind'), who = b('.idy-who'), when = b('[data-testid="idy-when"]'), r = row.getBoundingClientRect()
        return { kindRight: kind.right, whenLeft: when.left, whenRight: when.right, whoWhole: who.width > 20, inner: r.right, sameLine: Math.abs(kind.top - when.top) < 8 }
      })
      expect(g.sameLine, 'the kind and the hours are on the card’s first line').toBe(true)
      expect(g.kindRight, `${iid}: the kind ends before the hours begin`).toBeLessThanOrEqual(g.whenLeft - 2)
      expect(g.whenRight, 'the hours are inside the card').toBeLessThanOrEqual(g.inner)
      expect(g.whoWhole, 'the name is whole').toBe(true)
    }
  } finally { await context.close() }
})

