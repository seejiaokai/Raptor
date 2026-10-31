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
  return { z: parseFloat(getComputedStyle(m).zoom || '1'), sw: b.scrollWidth, cw: b.clientWidth, sl: b.scrollLeft, barW: Math.round(r.width), barL: Math.round(r.left), barH: Math.round(r.height), tf: m.style.transform }
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

  test('the sign-off box scrolls away with the day, as on a desktop - never frozen (D1111)', async ({ browser, baseURL }) => {
    const { context, page, cdp } = await phone(browser, baseURL)
    await wideBoard(page)
    const top0 = await page.evaluate(() => Math.round(document.getElementById('sbSign')!.getBoundingClientRect().top))
    await touch(cdp, 'touchStart', [[200, 700]])
    for (let i = 1; i <= 12; i++) { await touch(cdp, 'touchMove', [[200, 700 - 40 * i]]); await sleep(16) }
    await touch(cdp, 'touchEnd', []); await sleep(600)
    const m = await page.evaluate(() => ({ sign: Math.round(document.getElementById('sbSign')!.getBoundingClientRect().bottom), bar: Math.round(document.querySelector('#schedBoard .sb-top')!.getBoundingClientRect().bottom) }))
    expect(m.sign, `the sign-off (its top was ${top0}) has gone up under the bar`).toBeLessThanOrEqual(m.bar)
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
  test('a phone turned on its side past 820 shows the day at full size; turned back, the zoom is still there (the code read, finding 1)', async ({ browser, baseURL }) => {
    const { context, page, cdp } = await phone(browser, baseURL)
    await wideBoard(page)
    await pinch(cdp, 200, 450, 220, 40)
    const z = (await board(page)).z
    expect(z).toBeLessThan(0.5)
    await page.setViewportSize({ width: 874, height: 402 }); await sleep(400)
    expect((await board(page)).z, 'sideways, wider than a phone: full size').toBe(1)
    await page.setViewportSize(PHONE); await sleep(400)
    expect((await board(page)).z, 'upright again: the zoom he pinched').toBeCloseTo(z, 3)
    await context.close()
  })

  test('a pinch whose first finger lands on a wave grip moves no wave (the code read, finding 3)', async ({ browser, baseURL }) => {
    const { context, page, cdp } = await phone(browser, baseURL)
    await wideBoard(page)
    await pinch(cdp, 200, 450, 100, 60)
    const order = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-board [data-move^="mv:w"], #schedBoard .sb-board .wvgrip')].map(e => (e.closest('[data-move]') as HTMLElement | null)?.dataset.move + ':' + ((e.closest('.sb-wave, .wv, section, div') as HTMLElement | null)?.textContent || '').slice(0, 30)).join('|'))
    const g = await page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .sb-board .wvgrip, #schedBoard .sb-board .sb-grip')].find(e => { const r = e.getBoundingClientRect(); return r.width && r.left > 2 && r.right < innerWidth - 150 && r.top > 150 && r.bottom < innerHeight - 60 }); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    expect(g, 'a grip in view').not.toBeNull()
    const before = await order(), z0 = (await board(page)).z
    await touch(cdp, 'touchStart', [[g!.x, g!.y]]); await sleep(40)
    await touch(cdp, 'touchStart', [[g!.x, g!.y], [g!.x + 90, g!.y]]); await sleep(30)
    for (let i = 1; i <= 10; i++) { await touch(cdp, 'touchMove', [[g!.x - 2 * i, g!.y + 14 * i], [g!.x + 90 + 10 * i, g!.y + 14 * i]]); await sleep(20) }
    expect(await page.evaluate(() => !!document.querySelector('#schedBoard .rowdrag, #schedBoard .secdrag')), 'mid-pinch, no row or wave is held').toBe(false)
    await touch(cdp, 'touchEnd', []); await sleep(500)
    expect(await order(), 'the waves and rows in the order they were').toBe(before)
    expect((await board(page)).z, 'it zoomed').toBeGreaterThan(z0)
    await context.close()
  })
})

test.describe('Quals on a phone pinches (D1110)', () => {
  /* a pinch whose first finger lands on a heading in Edit quals lets the heading go (the code read, finding 3 —
     QualsPage cancelColDrag): not pinned here, because a finger over CDP never picks a heading up in this browser (its
     press is held by the heading's words; OUTSTANDING [QUALS-HEAD-FINGER-CAPTURE]) — the board's twin is pinned above */
  test('the table zooms, the buttons stay; the pinned heading row lines up; a second finger off the table still pinches', async ({ browser, baseURL }) => {
    const { context, page, errs, cdp } = await phone(browser, baseURL)
    await go(page, 'quals'); await sleep(400)
    const q = () => page.evaluate(() => {
      const w = document.querySelector('#page-quals .qwrap') as HTMLElement, t = document.getElementById('qtbl') as HTMLElement
      return { z: parseFloat(getComputedStyle(t).zoom || '1'), ww: w.clientWidth, sw: w.scrollWidth, bar: Math.round(document.querySelector('.qbar')!.getBoundingClientRect().height), seg: Math.round(document.querySelector('.segview')!.getBoundingClientRect().width) }
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
    /* MID-PINCH, scrolled sideways and pinned: the headings stay over their columns while the fingers move (the fix
       round's read, finding 1 - the browser's follow is held during the pinch) */
    await touch(cdp, 'touchStart', [[150, 500]]); await sleep(30)
    await touch(cdp, 'touchStart', [[150, 500], [250, 500]]); await sleep(30)
    for (let i = 1; i <= 6; i++) { await touch(cdp, 'touchMove', [[150 - 6 * i, 500], [250 + 6 * i, 500]]); await sleep(20) }
    const midLine = await page.evaluate(() => {
      const at = (sel: string) => [...document.querySelectorAll(sel)].slice(2, 7).map(t => Math.round(t.getBoundingClientRect().left))
      return { real: at('#qtbl thead tr:last-child > th'), mir: at('[data-testid="qsticky-head"] .qfixed-scroll thead tr:last-child > th') }
    })
    await touch(cdp, 'touchEnd', []); await sleep(400)
    midLine.real.forEach((l, i) => expect(Math.abs(l - midLine.mir[i]), `mid-pinch heading ${i + 3}`).toBeLessThanOrEqual(3))
    await go(page, 'editsched'); await go(page, 'quals'); await sleep(300)
    expect((await q()).z, 'back on Quals: today\'s size').toBe(1)
    expect(errs).toEqual([])
    await context.close()
  })

  /* [QUALS-PINCH-MID] (the pinch walk, 30 Oct 26 — its pictures quals-pinch-out-mid-band.png, quals-pinch-in-mid-names.png):
     with the page part-way down, a pinch OUT shrank the table about the fingers while the pinned heading row stayed where
     it was, so an empty band opened between them; a pinch IN carried the name column off the left edge with the stretched
     picture. Both only while the fingers were down — the lift put them right — so each is read with the fingers DOWN.
     D1110: the heading row and the name column stay pinned and lined up (the Leave War's D1287, D1288). */
  const midPinch = async <T>(cdp: CDPSession, cx: number, cy: number, d0: number, d1: number, read: () => Promise<T>): Promise<T> => {
    const at = (i: number) => { const d = d0 + (d1 - d0) * i / 10; return [[cx - d / 2, cy], [cx + d / 2, cy]] }
    await touch(cdp, 'touchStart', [at(0)[0]]); await sleep(30)
    await touch(cdp, 'touchStart', at(0)); await sleep(30)
    for (let i = 1; i <= 10; i++) { await touch(cdp, 'touchMove', at(i)); await sleep(16) }
    await sleep(120)
    const m = await read()
    await touch(cdp, 'touchEnd', []); await sleep(500)
    return m
  }
  /** points down one column, from the pinned heading row's foot (the copy under the top bar while it is up, else the
   *  table's own heading row, as drawn) to `yTo`, where no cell of the table or of the pinned row is drawn: a band */
  const bandUnderHeading = (page: Page, x: number, yTo: number) => page.evaluate(([x, yTo]) => {
    const mirror = document.querySelector('[data-testid="qsticky-head"]')
    const heads = [...(mirror ?? document.getElementById('qtbl')!.tHead!).querySelectorAll('th')].map(t => t.getBoundingClientRect()).filter(r => r.width > 0)
    const foot = Math.max(...heads.map(r => r.bottom))
    const bare: string[] = []
    for (let y = Math.ceil(foot) + 1; y < yTo; y += 4) {
      const hit = document.elementFromPoint(x!, y)
      if (!hit?.closest('#qtbl td, #qtbl th, [data-testid="qsticky-head"] th')) bare.push(`${y} ${hit ? hit.tagName.toLowerCase() + (hit.className && typeof hit.className === 'string' ? '.' + hit.className.split(' ')[0] : '') : 'nothing'}`)
    }
    return { foot: Math.round(foot), bare, mirror: !!mirror, transformed: !!(document.getElementById('qtbl') as HTMLElement).style.transform }
  }, [x, yTo] as const)
  /** the name column's left edge against the table's (the wrap's), for every name cell in sight, and the pinned row's
   *  name heading's left and right against the names' */
  const namesAtLeft = (page: Page) => page.evaluate(() => {
    const wrapL = document.querySelector('#page-quals .qwrap')!.getBoundingClientRect().left
    const names = [...document.querySelectorAll<HTMLElement>('#qtbl td.qname')].map(td => td.getBoundingClientRect()).filter(r => r.bottom > 60 && r.top < innerHeight)
    const off = names.filter(r => Math.abs(r.left - wrapL) > 1.5).map(r => Math.round(r.left))
    const mirror = document.querySelector('[data-testid="qsticky-head"]')
    const head = (mirror?.querySelector('.qfixed-frozen th[data-sort="cs"]') ?? document.querySelector('#qtbl thead th[data-sort="cs"]'))!.getBoundingClientRect()
    return { wrapL, n: names.length, off, headL: head.left, headR: head.right, nameR: names[0]?.right ?? null, transformed: !!(document.getElementById('qtbl') as HTMLElement).style.transform }
  })

  test('part-way down, a pinch out opens no band under the pinned heading row ([QUALS-PINCH-MID], D1110)', async ({ browser, baseURL }) => {
    const { context, page, errs, cdp } = await phone(browser, baseURL)
    await go(page, 'quals'); await page.waitForSelector('#qtbl td.qname')
    await page.evaluate(() => window.scrollTo(0, 420)); await sleep(500)
    await expect(page.locator('[data-testid="qsticky-head"]'), 'part-way down, the heading row is pinned under the top bar').toHaveCount(1)
    const rest = await bandUnderHeading(page, 200, 440)
    expect(rest.bare, 'at rest, nothing bare under the heading row (the reading is sound)').toEqual([])
    const out = await midPinch(cdp, 200, 450, 230, 80, async () => ({ band: await bandUnderHeading(page, 200, 440), names: await namesAtLeft(page) }))
    expect(out.band.transformed, 'read mid-pinch').toBe(true)
    expect(out.band.bare, `mid-pinch out, no band between the heading row and the rows (${JSON.stringify(out.band)})`).toEqual([])
    expect(out.names.off, `mid-pinch out, the names at the left edge (${JSON.stringify(out.names)})`).toEqual([])
    expect(errs).toEqual([])
    await context.close()
  })

  test('part-way down, a pinch in keeps the name column at the left edge, under its heading ([QUALS-PINCH-MID], D1110)', async ({ browser, baseURL }) => {
    const { context, page, errs, cdp } = await phone(browser, baseURL)
    await go(page, 'quals'); await page.waitForSelector('#qtbl td.qname')
    await page.evaluate(() => window.scrollTo(0, 420)); await sleep(500)
    await expect(page.locator('[data-testid="qsticky-head"]')).toHaveCount(1)
    const rest = await namesAtLeft(page)
    expect(rest.n, 'names in sight').toBeGreaterThan(3)
    const inn = await midPinch(cdp, 200, 450, 90, 250, () => namesAtLeft(page))
    expect(inn.transformed, 'read mid-pinch').toBe(true)
    expect(inn.n, 'names in sight mid-pinch').toBeGreaterThan(0)
    expect(inn.off, `mid-pinch in, every name at the table's left edge (${JSON.stringify(inn)})`).toEqual([])
    expect(Math.abs(inn.headL - inn.wrapL), 'the pinned row\'s name heading at the left edge too').toBeLessThan(1.5)
    expect(Math.abs(inn.headR - (inn.nameR ?? 0)), 'and as wide as the names under it — lined up').toBeLessThan(2)
    /* at the top of the page the table's own heading row is in sight: a pinch in holds it there, over the rows, with its
       name heading at the left (the walk's picture: the heading row and the names both gone until the lift) */
    await go(page, 'editsched'); await go(page, 'quals'); await page.waitForSelector('#qtbl td.qname')   // back at today's size
    await page.evaluate(() => window.scrollTo(0, 0)); await sleep(500)
    await expect(page.locator('[data-testid="qsticky-head"]')).toHaveCount(0)
    const h0 = await page.evaluate(() => document.querySelector('#qtbl thead th[data-sort="cs"]')!.getBoundingClientRect().top)
    const top = await midPinch(cdp, 200, 450, 90, 250, async () => ({ ...(await namesAtLeft(page)), headT: await page.evaluate(() => document.querySelector('#qtbl thead th[data-sort="cs"]')!.getBoundingClientRect().top) }))
    expect(top.off, `at the top, mid-pinch in, the names at the left edge (${JSON.stringify(top)})`).toEqual([])
    expect(Math.abs(top.headT - h0), 'the heading row held where it stood').toBeLessThan(1.5)
    expect(Math.abs(top.headL - top.wrapL), 'its name heading at the left').toBeLessThan(1.5)
    expect(errs).toEqual([])
    await context.close()
  })
})
