/* THE PHONE'S SWIPE ACROSS WEEKS, BY A REAL FINGER ([WEEK-SWIPE-CROSS], his iPhone recording of 3 Nov 26 — "Sometimes it
   triggers but it's very abrupt, not smooth. Sometimes it doesn't allow me to go to the next week. Like Monday to Sunday").

   The design is settled (scheduler.md §Week navigation — the phone swipe is continuous across weeks and the cross GLIDES
   on two frozen one-day copies, ui/weekglide.ts; the edge swipe is read in ui/pan.ts). jsdom pins the reading of the
   gesture and the glide's parts (src/ui/swipeweeks.test.tsx, src/ui/weekglide.test.ts); what only a real browser shows
   is pinned here, on Edit Schedule at his iPhone's size (402 × 874), with touch events through Chromium's own input
   pipeline — the browser scrolls and snaps the week itself, as his phone does:

     · THE LEAVING DAY STARTS WHERE IT IS ON SCREEN. The copy of the day being left used to be put at the day's resting
       place the moment it went up, and the day jumped back against the swipe before it slid (12px on Sunday here; on
       his iPhone, the whole pull past the end Safari draws — about 80px in his recording at 0.75 s).
     · A SECOND SWIPE STARTED WHILE THE WEEK IS STILL SETTLING ONTO MONDAY CROSSES. Read at the touch's start, the strip
       was still 140–200px from Monday, so the swipe only finished the move to Monday — "several swipes only bounce".
     · A SHORT QUICK FLICK AT THE EDGE CROSSES, as a short quick flick inside the week moves a day.
     · A THUMB'S ARC CROSSES when the browser itself moved the day sideways — its first movement decides, as the
       browser's own, not its whole drop.

   His iPhone is the proof of the feel; this is the proof of the mechanism. */
import { expect, test } from '@playwright/test'
import type { Browser, Page, CDPSession } from '@playwright/test'
import { go, login, settle } from './app'

async function phone(browser: Browser, baseURL: string | undefined) {
  const context = await browser.newContext({ baseURL, viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true })
  const page: Page = await context.newPage()
  await login(page)
  await go(page, 'editsched')
  await page.waitForSelector('#eWeek .day[data-day="6"]', { state: 'attached' })
  const cdp = await context.newCDPSession(page)
  return { context, page, cdp }
}

const week = (page: Page) => page.evaluate(() => (window as any).CURWEEK as string)
const sl = (page: Page) => page.evaluate(() => Math.round(document.getElementById('eWeek')!.scrollLeft))
/* put the week on a day with no animation, then let it come to rest */
const park = async (page: Page, day: number) => {
  await page.evaluate(d => {
    const w = document.getElementById('eWeek')!
    const ds = w.querySelectorAll('.day:not(.peek)')
    w.style.scrollBehavior = 'auto'
    w.scrollLeft = d >= ds.length - 1 ? w.scrollWidth : (ds[d] as HTMLElement).offsetLeft - (ds[0] as HTMLElement).offsetLeft
    w.style.scrollBehavior = ''
  }, day)
  await settle(page, '#eWeek')
  await page.waitForTimeout(250)
}
/* a finger: lands, moves in even steps, and lifts — `rest` is how long it stays still before it lifts (a slow drag rests,
   a flick does not) */
async function finger(page: Page, cdp: CDPSession, pts: [number, number][], stepMs = 16, rest = 60) {
  const [x0, y0] = pts[0]!
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: 1 }] })
  for (const [x, y] of pts.slice(1)) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: 1 }] }); await page.waitForTimeout(stepMs) }
  if (rest) await page.waitForTimeout(rest)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
const line = (x0: number, dx: number, n = 10, y = 430): [number, number][] => Array.from({ length: n + 1 }, (_, i) => [x0 + dx * i / n, y])
/* wait for a week cross to finish: the glide's copies come off */
const crossed = async (page: Page, from: string) => {
  await page.waitForFunction(w => (window as any).CURWEEK !== w, from, { timeout: 3000 }).catch(() => {})
  await page.waitForFunction(() => ![...document.body.children].some(c => (c as HTMLElement).style.position === 'fixed' && c.classList.contains('week')), undefined, { timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(150)
}

/* every frame of a cross: the live strip's Monday and Sunday, and the two copies' cards (the leaving one on top, z 41;
   the arriving one under it, z 40) — where each stands on screen */
type Frame = { mon: number; sun: number; out: number | null; inc: number | null }
async function traceCross(page: Page, cdp: CDPSession, dx: number): Promise<Frame[]> {
  await page.evaluate(() => {
    const w = window as any
    w.__f = []
    const left = (el: Element | null | undefined) => el ? Math.round(el.getBoundingClientRect().left) : null
    const tick = () => {
      const e = document.getElementById('eWeek')!
      const copy = (z: string) => [...document.body.children].find(c => (c as HTMLElement).style.position === 'fixed' && (c as HTMLElement).style.zIndex === z)
      w.__f.push({ mon: left(e.querySelector('.day[data-day="0"]')), sun: left(e.querySelector('.day[data-day="6"]')), out: left(copy('41')?.firstElementChild), inc: left(copy('40')?.firstElementChild) })
      if (w.__f.length < 400) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  const from = await week(page)
  await finger(page, cdp, line(dx < 0 ? 320 : 80, dx))
  await crossed(page, from)
  await page.waitForTimeout(400)
  expect(await week(page), 'the swipe crossed').not.toBe(from)
  return page.evaluate(() => { const f = (window as any).__f; (window as any).__f = []; return f })
}

test('a phone: across a week the day being left starts its slide where it stands, and the arriving day ends where it then rests — no hop either end', async ({ browser, baseURL }) => {
  const { context, page, cdp } = await phone(browser, baseURL)
  try {
    for (const [start, dx, leaving, landing] of [[6, -220, 'sun', 'mon'], [0, 220, 'mon', 'sun']] as const) {
      await park(page, start)
      const f = await traceCross(page, cdp, dx)
      const up = f.findIndex(x => x.out != null)
      expect(up, "the leaving day's copy went up").toBeGreaterThan(0)
      const stood = f[up - 1]![leaving]
      expect(Math.abs(f[up]!.out! - stood), `${leaving} off: its copy went up at ${f[up]!.out}px, the day stood at ${stood}px`).toBeLessThanOrEqual(1)
      /* the arriving copy's last frame against where the real day rests once the copies are off — and stays */
      const lastInc = f.map(x => x.inc).filter(x => x != null).pop()!
      const rest = f[f.length - 1]![landing]
      expect(Math.abs(lastInc - rest), `${landing} landed: its copy ended at ${lastInc}px, the day then rests at ${rest}px`).toBeLessThanOrEqual(1)
      const gone = f.findIndex((x, i) => i > up && x.inc == null)
      const after = new Set(f.slice(gone).map(x => x[landing]))
      expect([...after], `${landing} never moves once the copies are off`).toHaveLength(1)
    }
  } finally { await context.close() }
})

test('a phone: a second swipe begun while the week is still settling onto Monday crosses to Sunday', async ({ browser, baseURL }) => {
  const { context, page, cdp } = await phone(browser, baseURL)
  try {
    await park(page, 1)                                  // Tuesday
    const from = await week(page)
    await finger(page, cdp, line(60, 260, 8), 16, 40)   // Tuesday → Monday …
    const at = await sl(page)
    await finger(page, cdp, line(80, 150, 6), 12, 0)    // … and straight on, before Monday has settled
    await crossed(page, from)
    expect(at, 'the second swipe began while the week was still on its way to Monday').toBeGreaterThan(30)
    expect(await week(page), 'it crossed into the previous week').not.toBe(from)
  } finally { await context.close() }
})

/* THE WALK'S A6b (3 Nov 26, 4 of 24 runs): after a swipe back from Tuesday this browser sometimes left the strip STANDING
   84–127px short of Monday for 160ms and more before its snap began, and the second swipe, begun then, only carried it home.
   The premise is made here on purpose: the snap held off while the strip is put 100px short of Monday and left still, then
   put back before the finger lands — so nothing is moving when it does. */
test('a phone: a swipe begun with the week standing 100px short of Monday crosses when it carries Monday home and on', async ({ browser, baseURL }) => {
  const { context, page, cdp } = await phone(browser, baseURL)
  try {
    await park(page, 0)
    const from = await week(page)
    const stand = () => page.evaluate(() => {
      const w = document.getElementById('eWeek')!
      w.style.scrollSnapType = 'none'; w.style.scrollBehavior = 'auto'
      const ds = w.querySelectorAll('.day:not(.peek)')
      w.scrollLeft = (ds[0] as HTMLElement).offsetLeft - (w.firstElementChild as HTMLElement).offsetLeft + 12 + 100
      return Math.round(w.scrollLeft)
    })
    const at = await stand()
    await page.waitForTimeout(300)
    expect(at, 'the week stands about 100px short of Monday').toBeGreaterThan(90)
    /* a swipe of 100px only brings Monday home: it stays on the week */
    await finger(page, cdp, line(60, 100, 8), 16, 60)
    await page.waitForTimeout(700)
    expect(await week(page), 'a swipe that only brings Monday home stays on the week').toBe(from)
    await stand(); await page.waitForTimeout(300)
    /* one of 180px brings it home and goes on past it */
    await finger(page, cdp, line(60, 180, 8), 16, 60)
    await crossed(page, from)
    await page.evaluate(() => { const w = document.getElementById('eWeek')!; w.style.scrollSnapType = ''; w.style.scrollBehavior = '' })
    expect(await week(page), 'it crossed into the previous week').not.toBe(from)
  } finally { await context.close() }
})

test('a phone: a short quick flick off Monday crosses; a short slow drag does not', async ({ browser, baseURL }) => {
  const { context, page, cdp } = await phone(browser, baseURL)
  try {
    await park(page, 0)
    const from = await week(page)
    /* 40px — under the 45px a slow swipe needs — lifted still moving: one move, then the lift (each step through this
       browser's input takes some 30ms, so more steps would make it a slow drag) */
    await finger(page, cdp, line(150, 40, 1), 0, 0)
    await crossed(page, from)
    const flicked = await week(page)
    expect(flicked, 'a quick 40px flick off Monday crossed').not.toBe(from)
    /* back to Monday of the week we came from, then 34px slowly, resting before the lift: not a swipe */
    await park(page, 6)
    await finger(page, cdp, line(320, -220))
    await crossed(page, flicked)
    expect(await week(page)).toBe(from)
    await park(page, 0)
    await finger(page, cdp, line(150, 34, 10), 40, 120)
    await page.waitForTimeout(700)
    expect(await week(page), 'a slow 34px drag stays on the week').toBe(from)
  } finally { await context.close() }
})

test('a phone: a thumb\'s arc off Monday that the browser moved sideways crosses; a drag down the day does not', async ({ browser, baseURL }) => {
  const { context, page, cdp } = await phone(browser, baseURL)
  try {
    await park(page, 0)
    const from = await week(page)
    /* starts sideways, then curls down: 70px across, 80px down in all */
    const arc: [number, number][] = [[100, 380], [114, 381], [128, 384], [140, 392], [150, 404], [158, 418], [164, 434], [168, 448], [170, 460]]
    await finger(page, cdp, arc)
    await crossed(page, from)
    const arced = await week(page)
    expect(arced, 'the arc crossed into the previous week').not.toBe(from)
    /* and a drag that starts DOWN the day and drifts sideways is the page being scrolled, never a cross */
    await park(page, 0)
    const down: [number, number][] = [[100, 300], [102, 316], [106, 336], [114, 360], [126, 390], [140, 420], [156, 450], [172, 480]]
    await finger(page, cdp, down)
    await page.waitForTimeout(700)
    expect(await week(page), 'a drag down the day stays on the week').toBe(arced)
  } finally { await context.close() }
})

test('a phone: an ordinary swipe inside the week still moves one day and never crosses', async ({ browser, baseURL }) => {
  const { context, page, cdp } = await phone(browser, baseURL)
  try {
    await park(page, 2)                                  // Wednesday
    const from = await week(page)
    const before = await sl(page)
    await finger(page, cdp, line(320, -220))
    const after = await settle(page, '#eWeek', before)
    await page.waitForTimeout(300)
    expect(await week(page)).toBe(from)
    const step = await page.evaluate(() => { const ds = document.querySelectorAll('#eWeek .day:not(.peek)'); return Math.round((ds[1] as HTMLElement).offsetLeft - (ds[0] as HTMLElement).offsetLeft) })
    expect(Math.abs(after - before - step), `moved ${after - before}px, one day is ${step}px`).toBeLessThanOrEqual(2)
  } finally { await context.close() }
})
