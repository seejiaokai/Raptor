/* [NO-PAGE-ZOOM] — on a phone the page itself never zooms; only the grids that zoom by their own pinch do (owner D1567,
   2 Nov 26 — "Can u disable the other kind of zooming? So only allow the grids to be zoomed. Not the page. Sometimes I
   get stuck and I can't zoom out if the page zooms in.").

   Real fingers over CDP on a touch phone in Chromium: two fingers spread over a part of the page that has no pinch of its
   own (the week, the top bar) and a double tap — the page's scale (`visualViewport.scale`) stays 1. The grids' own pinch
   is kept: the Scheduler Board's desktop layout and Quals are pinched in `pinchzoom.spec.ts`, the Leave War grid and its
   OIL tab in `leavewar.spec.ts`, all with the same fingers, and run beside this file. A desktop keeps the browser's own
   zoom (D1286): nothing here is switched on where the pointer is a mouse.

   What a test browser cannot show: an iPhone's Safari pinches the page by its own gesture events and ignores the page's
   "no zoom" setting; the app holds those off too, which only his iPhone can prove (his look). */
import { expect, test, type Browser, type CDPSession, type Page } from '@playwright/test'
import { go, login } from './app'

const PHONE = { width: 402, height: 874 }
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function phone(browser: Browser, baseURL: string | undefined) {
  const context = await browser.newContext({ baseURL, viewport: PHONE, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  const errs: string[] = []
  page.on('pageerror', e => errs.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await login(page)
  await page.addStyleTag({ content: '#toastEl{visibility:hidden!important}' })
  const cdp = await context.newCDPSession(page)
  return { context, page, errs, cdp }
}
const touch = (cdp: CDPSession, type: string, pts: number[][]) =>
  cdp.send('Input.dispatchTouchEvent', { type: type as any, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
/** two fingers about (cx, cy), from d0 to d1 apart, sideways — the same fingers as the grids' own pinch tests */
async function pinch(cdp: CDPSession, cx: number, cy: number, d0: number, d1: number, steps = 12) {
  const at = (i: number) => { const d = d0 + (d1 - d0) * i / steps; return [[cx - d / 2, cy], [cx + d / 2, cy]] }
  await touch(cdp, 'touchStart', [at(0)[0]]); await sleep(30)
  await touch(cdp, 'touchStart', at(0)); await sleep(30)
  for (let i = 1; i <= steps; i++) { await touch(cdp, 'touchMove', at(i)); await sleep(16) }
  await touch(cdp, 'touchEnd', []); await sleep(400)
}
async function tap(cdp: CDPSession, x: number, y: number) {
  await touch(cdp, 'touchStart', [[x, y]]); await sleep(40)
  await touch(cdp, 'touchEnd', [])
}
const scale = (page: Page) => page.evaluate(() => Math.round((window.visualViewport?.scale ?? 1) * 1000) / 1000)

test.describe('on a phone the page never zooms (D1567)', () => {
  test('two fingers spread over the week or the top bar leave the page at its own size', async ({ browser, baseURL }) => {
    const { context, page, errs, cdp } = await phone(browser, baseURL)
    await go(page, 'editsched')
    await page.waitForSelector('#eWeek .day')
    expect(await scale(page), 'the page starts at its own size').toBe(1)
    // over the week, a slow wide spread, then a quick one, as a person makes it (the order's lesson 2)
    await pinch(cdp, 200, 520, 60, 320)
    expect(await scale(page), 'a slow pinch out over the week leaves the page at its own size').toBe(1)
    await pinch(cdp, 200, 520, 80, 360, 4)
    expect(await scale(page), 'a quick pinch out over the week leaves the page at its own size').toBe(1)
    // part-way down the page (the order's lesson 13)
    await page.evaluate(() => window.scrollTo(0, 600)); await sleep(200)
    await pinch(cdp, 200, 400, 60, 320)
    expect(await scale(page), 'part-way down, a pinch out leaves the page at its own size').toBe(1)
    // over the top bar
    await page.evaluate(() => window.scrollTo(0, 0)); await sleep(200)
    const bar = await page.evaluate(() => { const r = document.querySelector('.topbar')!.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    await pinch(cdp, bar.x, bar.y, 60, 300)
    expect(await scale(page), 'a pinch out over the top bar leaves the page at its own size').toBe(1)
    expect(errs).toEqual([])
    await context.close()
  })

  test('a double tap leaves the page at its own size', async ({ browser, baseURL }) => {
    const { context, page, errs, cdp } = await phone(browser, baseURL)
    await go(page, 'logic')
    await sleep(400)
    // on plain words, where a phone's double tap would zoom to the text
    const at = await page.evaluate(() => {
      const el = [...document.querySelectorAll('#page-logic p, #page-logic .lg-note, #page-logic div')]
        .find(e => (e as HTMLElement).innerText && (e as HTMLElement).innerText.length > 40 && e.getBoundingClientRect().height > 0) as HTMLElement | undefined
      const r = (el ?? document.body).getBoundingClientRect()
      return { x: Math.min(r.left + 40, 380), y: Math.max(r.top + 10, 140) }
    })
    await tap(cdp, at.x, at.y); await sleep(90); await tap(cdp, at.x, at.y); await sleep(600)
    expect(await scale(page), 'a double tap leaves the page at its own size').toBe(1)
    expect(errs).toEqual([])
    await context.close()
  })

  test('the page is held from zooming only on a touch screen, never on a desktop (D1286)', async ({ browser, baseURL }) => {
    const { context, page } = await phone(browser, baseURL)
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).touchAction), 'a phone: only panning is the page\'s').toBe('pan-x pan-y')
    expect(await page.evaluate(() => document.querySelector('meta[name=viewport]')!.getAttribute('content')), 'a touch phone that is not an iPhone (an Android phone) is told the page does not zoom')
      .toBe('width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no')
    await context.close()
    const desk = await browser.newContext({ baseURL, viewport: { width: 1536, height: 864 } })
    const dp = await desk.newPage()
    await login(dp)
    expect(await dp.evaluate(() => getComputedStyle(document.documentElement).touchAction), 'a desktop: as the browser has it').toBe('auto')
    expect(await dp.evaluate(() => document.querySelector('meta[name=viewport]')!.getAttribute('content')), 'a desktop keeps the plain page setting').toBe('width=device-width, initial-scale=1.0')
    await desk.close()
  })
})
