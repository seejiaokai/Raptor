/* [BOARD-PHONE-PINCH-ZOOM] — pinch to zoom on a phone, by real fingers over CDP (owner D1107–D1110, 21 Oct 26):
   the Scheduler Board's desktop layout (the day zooms, the phone's own bar stays; out to the whole width, in to twice;
   kept across days, dropped by ✓ Done; a puck held at the screen's edge slides the day and still drops where it is let
   go) and Quals (the table zooms, the buttons stay; the pinned heading row lines up with the zoomed columns). jsdom has
   no layout and no touch, so these live here. */
import { expect, test, type Browser, type Page, type CDPSession } from '@playwright/test'
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
/** two fingers about (cx, cy), from d0 to d1 apart, sideways */
async function pinch(cdp: CDPSession, cx: number, cy: number, d0: number, d1: number, steps = 10) {
  const at = (i: number) => { const d = d0 + (d1 - d0) * i / steps; return [[cx - d / 2, cy], [cx + d / 2, cy]] }
  await touch(cdp, 'touchStart', [at(0)[0]]); await sleep(30)
  await touch(cdp, 'touchStart', at(0)); await sleep(30)
  for (let i = 1; i <= steps; i++) { await touch(cdp, 'touchMove', at(i)); await sleep(16) }
  await touch(cdp, 'touchEnd', []); await sleep(350)
}
async function wideBoard(page: Page) {
  await go(page, 'editsched')
  await page.locator('#eWeek [data-sbday="0"]:visible').first().tap()
  await page.waitForSelector('#schedBoard:not([hidden])'); await sleep(400)
  await page.locator('#sbMore').tap(); await page.locator('#sbMoreWide').tap()
  await expect(page.locator('#schedBoard.sb-wide')).toBeVisible()
  await sleep(300)
}
const board = (page: Page) => page.evaluate(() => {
  const b = document.getElementById('schedBoard')!, m = b.querySelector('.sb-main') as HTMLElement, t = b.querySelector('.sb-top')!
  const r = t.getBoundingClientRect()
  return { z: parseFloat(m.style.zoom || '1'), sw: b.scrollWidth, cw: b.clientWidth, sl: b.scrollLeft, barW: Math.round(r.width), barL: Math.round(r.left), barH: Math.round(r.height), tf: m.style.transform }
})
const pressable = (page: Page, sel: string) => page.evaluate(s => {
  const b = document.querySelector(s); if (!b || !b.getClientRects().length) return false
  const q = b.getBoundingClientRect(), at = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2)
  return !!at && (at === b || b.contains(at)) && q.left >= 0 && q.right <= innerWidth
}, sel)

test.describe('the board\'s desktop layout on a phone pinches (D1109)', () => {
  test('the day zooms out to the whole width and in to twice; the phone bar stays; kept across days; ✓ Done resets it', async ({ browser, baseURL }) => {
    const { context, page, errs, cdp } = await phone(browser, baseURL)
    await wideBoard(page)
    let s = await board(page)
    expect(s.barW, 'the bar is the screen\'s width').toBe(PHONE.width)
    expect(s.z, 'opens at today\'s size').toBe(1)
    expect(await pressable(page, '#sbDone'), '✓ Done is in reach at once').toBe(true)
    await pinch(cdp, 200, 450, 220, 40)
    s = await board(page)
    expect(s.sw, 'zoomed right out, the whole day fits').toBeLessThanOrEqual(s.cw + 1)
    expect(s.tf, 'laid out sharp at the lift').toBe('')
    expect([s.barW, s.barL], 'the bar did not zoom or slide').toEqual([PHONE.width, 0])
    expect(await pressable(page, '#sbDone')).toBe(true)
    await pinch(cdp, 200, 450, 60, 300); await pinch(cdp, 200, 450, 60, 300)
    expect((await board(page)).z, 'in to twice, no further').toBeCloseTo(2, 3)
    await pinch(cdp, 200, 450, 200, 120)
    const kept = (await board(page)).z
    await page.locator('#sbNextDay').tap(); await sleep(500)
    expect((await board(page)).z, 'the next day keeps it').toBeCloseTo(kept, 3)
    await page.locator('#sbDone').tap(); await sleep(400)
    await page.locator('#eWeek [data-sbday="0"]:visible').first().tap(); await sleep(500)
    expect((await board(page)).z, 'after ✓ Done it opens at today\'s size').toBe(1)
    expect(errs).toEqual([])
    await context.close()
  })

  test('one finger still slides the day sideways', async ({ browser, baseURL }) => {
    const { context, page, cdp } = await phone(browser, baseURL)
    await wideBoard(page)
    const before = (await board(page)).sl
    await touch(cdp, 'touchStart', [[300, 600]])
    for (let i = 1; i <= 12; i++) { await touch(cdp, 'touchMove', [[300 - 18 * i, 600]]); await sleep(16) }
    await touch(cdp, 'touchEnd', []); await sleep(500)
    expect((await board(page)).sl, 'a swipe on the day itself, not only on the bar').toBeGreaterThan(before + 50)
    await context.close()
  })

  test('a puck held at the left edge slides the day back, then lands where it is let go', async ({ browser, baseURL }) => {
    const { context, page, cdp } = await phone(browser, baseURL)
    await wideBoard(page)
    await pinch(cdp, 200, 450, 100, 60)   // about 0.6
    await page.evaluate(() => { const b = document.getElementById('schedBoard')!; b.scrollLeft = b.scrollWidth })
    await sleep(300)
    const puck = await page.evaluate(() => {
      const p = [...document.querySelectorAll('#schedBoard .sb-roster [data-drag]')].find(e => { const r = e.getBoundingClientRect(); return !/^ALL/.test((e.textContent || '').trim()) && r.width && r.left > 0 && r.right < innerWidth && r.top > 200 && r.bottom < innerHeight - 20 })
      if (!p) return null
      const r = p.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, cs: (p.textContent || '').trim().split(/\s+/)[0] }
    })
    expect(puck, 'a crew puck in view at the day\'s right end').not.toBeNull()
    const start = (await board(page)).sl
    await touch(cdp, 'touchStart', [[puck!.x, puck!.y]]); await sleep(320)
    for (let i = 1; i <= 10; i++) { await touch(cdp, 'touchMove', [[puck!.x - (puck!.x - 14) * i / 10, 420]]); await sleep(20) }
    await sleep(1600)
    expect((await board(page)).sl, 'held still at the edge, the day slid back').toBeLessThan(start - 150)
    const row = await page.evaluate(() => {
      const c = [...document.querySelectorAll('#schedBoard .sb-arow [data-fill]')].find(e => { const r = e.getBoundingClientRect(); return r.width && r.left > 60 && r.right < innerWidth - 60 && r.top > 120 && r.bottom < innerHeight - 60 && !e.querySelector('.puck') })
      if (!c) return null
      const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    })
    expect(row, 'an empty Common Programme row in view').not.toBeNull()
    for (let i = 1; i <= 8; i++) { await touch(cdp, 'touchMove', [[14 + (row!.x - 14) * i / 8, 420 + (row!.y - 420) * i / 8]]); await sleep(25) }
    await sleep(200)
    await touch(cdp, 'touchEnd', []); await sleep(600)
    const landed = await page.evaluate(([x, y, cs]) => { const e = document.elementFromPoint(x, y); const t = e && e.closest('[data-fill]'); return !!t && (t.textContent || '').includes(cs) }, [row!.x, row!.y, puck!.cs] as [number, number, string])
    expect(landed, `${puck!.cs} landed on that row`).toBe(true)
    await context.close()
  })

  test('a second finger during a puck\'s hold makes a pinch, never a pick-up', async ({ browser, baseURL }) => {
    const { context, page, cdp } = await phone(browser, baseURL)
    await wideBoard(page)
    await pinch(cdp, 200, 450, 100, 60)   // about 0.6, so pucks stand in view
    const z0 = (await board(page)).z
    const p = await page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard [data-drag]')].find(e => { const r = e.getBoundingClientRect(); return r.width && r.left > 40 && r.right < innerWidth - 120 && r.top > 200 && r.bottom < innerHeight - 40 }); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    expect(p).not.toBeNull()
    await touch(cdp, 'touchStart', [[p!.x, p!.y]]); await sleep(60)
    await touch(cdp, 'touchStart', [[p!.x, p!.y], [p!.x + 80, p!.y]]); await sleep(30)
    for (let i = 1; i <= 10; i++) { await touch(cdp, 'touchMove', [[p!.x - 4 * i, p!.y], [p!.x + 80 + 8 * i, p!.y]]); await sleep(20) }
    expect(await page.evaluate(() => !!document.querySelector('.tdghost')), 'no puck lifted').toBe(false)
    await touch(cdp, 'touchEnd', []); await sleep(400)
    expect((await board(page)).z, 'it zoomed in').toBeGreaterThan(z0)
    await context.close()
  })
})

test.describe('Quals on a phone pinches (D1110)', () => {
  test('the table zooms, the buttons stay; the pinned heading row lines up; a second finger off the table still pinches', async ({ browser, baseURL }) => {
    const { context, page, errs, cdp } = await phone(browser, baseURL)
    await go(page, 'quals'); await sleep(400)
    const q = () => page.evaluate(() => {
      const w = document.querySelector('#page-quals .qwrap') as HTMLElement, t = document.getElementById('qtbl') as HTMLElement
      return { z: parseFloat(t.style.zoom || '1'), ww: w.clientWidth, sw: w.scrollWidth, bar: Math.round(document.querySelector('.qbar')!.getBoundingClientRect().height), seg: Math.round(document.querySelector('.segview')!.getBoundingClientRect().width) }
    })
    const q0 = await q()
    /* the right finger lands past the table's right edge, on the page's margin */
    await pinch(cdp, 282, 400, 220, 40)
    let s = await q()
    expect(s.sw, 'zoomed right out, the whole table fits').toBeLessThanOrEqual(s.ww + 1)
    expect([s.bar, s.seg], 'the buttons and the switch did not zoom').toEqual([q0.bar, q0.seg])
    await pinch(cdp, 200, 400, 60, 300); await pinch(cdp, 200, 400, 60, 300)
    expect((await q()).z).toBeCloseTo(2, 3)
    await pinch(cdp, 200, 400, 200, 120)
    await page.evaluate(() => window.scrollTo(0, 900)); await sleep(400)
    await page.evaluate(() => { (document.querySelector('#page-quals .qwrap') as HTMLElement).scrollLeft = 150 }); await sleep(400)
    const line = await page.evaluate(() => {
      const m = document.querySelector('[data-testid="qsticky-head"]'); if (!m) return null
      const at = (sel: string) => [...document.querySelectorAll(sel)].slice(1, 8).map(t => { const r = t.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.width)] })
      return { real: at('#qtbl thead tr:last-child > th'), mir: at('[data-testid="qsticky-head"] .qfixed-scroll thead tr:last-child > th') }
    })
    expect(line, 'the heading row is pinned').not.toBeNull()
    line!.real.forEach(([l, w], i) => {
      expect(Math.abs(l - line!.mir[i][0]), `heading ${i + 1} left`).toBeLessThanOrEqual(2)
      expect(Math.abs(w - line!.mir[i][1]), `heading ${i + 1} width`).toBeLessThanOrEqual(2)
    })
    await go(page, 'editsched'); await go(page, 'quals'); await sleep(300)
    expect((await q()).z, 'back on Quals: today\'s size').toBe(1)
    expect(errs).toEqual([])
    await context.close()
  })
})
