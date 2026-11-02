// [NO-PAGE-ZOOM] — the walk of 2 Nov 26 (`claude/no-page-zoom`, his D1567: on a phone the page itself never zooms, only
// the grids that pinch by themselves). Evidence: docs/handpass/2026-11-02-no-page-zoom.md.
// Every check is written as the RIGHT behaviour (a PASS is correct), so the same script on origin/main's build is the
// "before" (the page zooms: N-steps red) and on this branch's build the "after".
//   node scripts/handpass/nopagezoom-walk.mjs <dist> <out-dir>              — Chromium, a phone by real fingers over CDP
//   ENGINE=webkit node …                                                     — Safari's engine at his iPhone's size: it takes
//     no touch input from outside the page, so the touches are made inside the page (pinch1031-walk.mjs's way). It shows
//     the grids' own pinch still reads the fingers in WebKit, and that an iPhone's gesture events are cancelled; it cannot
//     show an iPhone's own page zoom, which only his phone proves (the order's §7.11 lessons 6 and 7).
//   DESK=1 node …                                                            — his PC's 1536, a mouse: nothing changed.
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { serveDist, LAUNCH } from '../drawcheck/lib.mjs'
const require = createRequire(import.meta.url)
const { chromium, webkit } = require('@playwright/test')
const [, , DIST = 'dist', OUT0 = 'C:/npz'] = process.argv
const ENGINE = process.env.ENGINE === 'webkit' ? 'webkit' : 'chromium'
const DESK = process.env.DESK === '1'
const OUT = join(OUT0, DESK ? 'desktop' : ENGINE)
mkdirSync(OUT, { recursive: true })
console.log(`nopagezoom-walk v1 — ${DESK ? 'desktop' : ENGINE}, ${DIST}`)
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ORIGIN = 'http://localhost:4197'
const results = []
const check = (id, what, ok, detail) => { results.push({ id, what, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${what}${ok ? '' : ' — ' + JSON.stringify(detail)}`) }

const browser = ENGINE === 'webkit' ? await webkit.launch() : await chromium.launch(LAUNCH)
async function fresh({ signIn = true } = {}) {
  const ctx = await browser.newContext(DESK
    ? { viewport: { width: 1536, height: 864 }, timezoneId: 'Asia/Singapore' }
    : { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: ENGINE === 'chromium', timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, DIST)
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
  await p.goto(ORIGIN + '/')
  if (signIn) {
    await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
    await p.waitForSelector('#vWeek .day', { timeout: 20000 })
    await p.addStyleTag({ content: '#toastEl{visibility:hidden!important}' })
  }
  const cdp = ENGINE === 'chromium' && !DESK ? await ctx.newCDPSession(p) : null
  const touch = (type, pts) => cdp
    ? cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
    : p.evaluate(([type, pts]) => {
        const w = window; w.__tt = w.__tt || {}
        const ev = { touchStart: 'touchstart', touchMove: 'touchmove', touchEnd: 'touchend' }[type]
        if (type === 'touchStart') pts.forEach(([x, y], i) => { if (!w.__tt[i + 1]) w.__tt[i + 1] = document.elementFromPoint(x, y) || document.body })
        const mk = (id, x, y) => ({ identifier: id, target: w.__tt[id], clientX: x, clientY: y, pageX: x + scrollX, pageY: y + scrollY, screenX: x, screenY: y })
        const fire = (tgt, touches, changed) => {
          const e = new Event(ev, { bubbles: true, cancelable: true })
          const list = a => Object.assign([...a], { item: i => a[i] })
          Object.defineProperty(e, 'touches', { value: list(touches) })
          Object.defineProperty(e, 'targetTouches', { value: list(touches) })
          Object.defineProperty(e, 'changedTouches', { value: list(changed) })
          tgt.dispatchEvent(e)
        }
        if (type === 'touchEnd') { fire(w.__tt[1], [], Object.keys(w.__tt).map(Number).map(id => mk(id, 0, 0))); w.__tt = {}; return }
        const now = pts.map(([x, y], i) => mk(i + 1, x, y))
        fire(w.__tt[now.length] || w.__tt[1], now, type === 'touchStart' ? [now[now.length - 1]] : now)
      }, [type, pts])
  /** two fingers about (cx, cy), d0 → d1 apart, sideways; `steps` small is a quick pinch (lesson 2) */
  const pinch = async (cx, cy, d0, d1, steps = 12) => {
    const at = i => { const d = d0 + (d1 - d0) * i / steps; return [[cx - d / 2, cy + i], [cx + d / 2, cy + i]] }
    await touch('touchStart', [at(0)[0]]); await sleep(30)
    await touch('touchStart', at(0)); await sleep(30)
    for (let i = 1; i <= steps; i++) { await touch('touchMove', at(i)); await sleep(16) }
    await touch('touchEnd', []); await sleep(450)
  }
  const swipe = async (x, y, dx, dy, steps = 10) => {
    await touch('touchStart', [[x, y]])
    for (let i = 1; i <= steps; i++) { await touch('touchMove', [[x + dx * i / steps, y + dy * i / steps]]); await sleep(16) }
    await sleep(60); await touch('touchEnd', []); await sleep(600)
  }
  const tap = async (x, y) => { await touch('touchStart', [[x, y]]); await sleep(40); await touch('touchEnd', []) }
  const go = async x => { await p.evaluate(x => window.go(x), x); await p.waitForFunction(x => window.CURPAGE === x, x); await sleep(900) }
  const scale = () => p.evaluate(() => Math.round((window.visualViewport?.scale ?? 1) * 1000) / 1000)
  const shot = async name => { await p.screenshot({ path: join(OUT, name + '.png') }) }
  return { ctx, p, errs, pinch, swipe, tap, go, scale, shot, touch }
}
const zoomOf = (p, sel, computed = false) => p.evaluate(([s, c]) => {
  const el = document.querySelector(s); if (!el) return null
  return parseFloat((c ? getComputedStyle(el).zoom : el.style.zoom) || '1')
}, [sel, computed])

if (DESK) {
  /* ---------- his PC: nothing changed ---------- */
  const s = await fresh()
  check('D1', 'a desktop: the page keeps the browser\'s own touch rules', (await s.p.evaluate(() => getComputedStyle(document.documentElement).touchAction)) === 'auto')
  check('D2', 'a desktop: the plain page setting', (await s.p.evaluate(() => document.querySelector('meta[name=viewport]').getAttribute('content'))) === 'width=device-width, initial-scale=1.0')
  const g = await s.p.evaluate(() => { const e = new Event('gesturestart', { cancelable: true, bubbles: true }); document.body.dispatchEvent(e); return e.defaultPrevented })
  check('D3', 'a desktop: a trackpad\'s gesture events are left to the browser', g === false)
  await s.go('leavewar'); await s.p.waitForSelector('.mx-wrap > table.mx')
  const z0 = await zoomOf(s.p, '.mx-wrap > table.mx')
  await s.p.mouse.move(700, 500); await s.p.keyboard.down('Control'); await s.p.mouse.wheel(0, -300); await s.p.keyboard.up('Control'); await sleep(600)
  const z1 = await zoomOf(s.p, '.mx-wrap > table.mx')
  check('D4', 'a desktop: Ctrl+scroll over the Leave War grid still zooms the grid (D1228)', z1 > z0 + 0.1, { z0, z1 })
  await s.shot('D4-lw-ctrl-scroll')
  check('D5', 'no page error', s.errs.length === 0, s.errs)
  await s.ctx.close()
} else {
  /* ---------- the phone ---------- */
  const isC = ENGINE === 'chromium'
  // N0 the sign-in page, before anyone signs in
  {
    const s = await fresh({ signIn: false })
    await s.p.waitForSelector('#luser')
    check('N0a', 'the sign-in page: the page takes only panning from a finger', (await s.p.evaluate(() => getComputedStyle(document.documentElement).touchAction)) === 'pan-x pan-y')
    const g = await s.p.evaluate(() => { const e = new Event('gesturestart', { cancelable: true, bubbles: true }); document.body.dispatchEvent(e); return e.defaultPrevented })
    check('N0b', 'the sign-in page: an iPhone\'s own pinch (its gesture event) is cancelled', g === true)
    if (isC) { await s.pinch(200, 300, 60, 300); check('N0c', 'the sign-in page: a pinch out leaves the page at its own size', (await s.scale()) === 1, await s.scale()) }
    await s.shot('N0-signin')
    await s.ctx.close()
  }
  const s = await fresh()
  const { p } = s
  // N1–N4 the week
  await s.go('editsched'); await p.waitForSelector('#eWeek .day')
  if (isC) {
    await s.pinch(200, 520, 60, 320)
    check('N1', 'Edit Schedule\'s week: a slow pinch out leaves the page at its own size', (await s.scale()) === 1, await s.scale())
    await s.pinch(200, 520, 80, 360, 3)
    check('N2', 'Edit Schedule\'s week: a quick pinch out leaves the page at its own size (lesson 2)', (await s.scale()) === 1, await s.scale())
    await p.evaluate(() => window.scrollTo(0, 900)); await sleep(300)
    await s.pinch(200, 420, 300, 60)
    await s.pinch(200, 420, 60, 300)
    check('N3', 'part-way down: a pinch in, then out, leaves the page at its own size (lesson 13)', (await s.scale()) === 1, await s.scale())
    await s.shot('N3-week-partway-after-pinch')
    await p.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
    const tb = await p.evaluate(() => { const r = document.querySelector('.topbar').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })
    await s.pinch(tb[0], tb[1], 60, 300)
    check('N4', 'over the top bar: a pinch out leaves the page at its own size', (await s.scale()) === 1, await s.scale())
  }
  // N5 one finger still scrolls the page and swipes the week's day
  {
    const y0 = await p.evaluate(() => scrollY)
    await s.swipe(200, 700, 0, -400)
    const y1 = await p.evaluate(() => scrollY)
    check('N5a', 'one finger up still scrolls the page', y1 > y0 + 100, { y0, y1 })
    await p.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
    const x0 = await p.evaluate(() => document.querySelector('#eWeek').scrollLeft)
    await s.swipe(340, 500, -260, 0)
    const x1 = await p.evaluate(() => document.querySelector('#eWeek').scrollLeft)
    check('N5b', 'one finger sideways still slides the week to the next day', x1 > x0 + 100, { x0, x1 })
    await s.shot('N5-week-after-swipe')
  }
  // N6 a double tap on plain words
  if (isC) {
    await s.go('logic')
    await s.tap(120, 300); await sleep(90); await s.tap(120, 300); await sleep(700)
    check('N6', 'Logic: a double tap on its words leaves the page at its own size', (await s.scale()) === 1, await s.scale())
    await s.shot('N6-logic')
  }
  // N7 a window over the page: pinched, then closed by its ✕ and by Escape (lesson 19)
  {
    await s.go('editsched')
    const door = p.locator('#eWeek .day[data-day="0"] [data-inpedit]:visible').first()
    await door.scrollIntoViewIfNeeded(); await door.tap()
    await p.waitForSelector('#inpEditPop:not([hidden]) .airpop-box'); await sleep(300)
    const box = await p.evaluate(() => { const r = document.querySelector('#inpEditPop .airpop-box').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })
    if (isC) {
      await s.pinch(box[0], box[1], 60, 260)
      check('N7a', 'an input\'s window: a pinch over it leaves the page at its own size', (await s.scale()) === 1, await s.scale())
    }
    check('N7b', 'and the window is still open after the pinch', await p.locator('#inpEditPop:not([hidden]) .airpop-box').count() === 1)
    await s.shot('N7-window-after-pinch')
    const x = p.locator('#inpEditPop .airpop-x, #inpEditPop [aria-label="Close"]').first()
    if (await x.count()) { await x.tap(); await sleep(400) } else { await p.keyboard.press('Escape'); await sleep(400) }
    check('N7c', 'its close shuts it, the week behind it still there', await p.locator('#inpEditPop:not([hidden]) .airpop-box').count() === 0 && await p.locator('#eWeek .day').count() > 0)
  }
  // G1 the board, its phone layout (no pinch of its own) and its desktop layout (its own pinch)
  {
    await p.locator('#eWeek [data-sbday="0"]:visible').first().tap()
    await p.waitForSelector('#schedBoard:not([hidden])'); await sleep(500)
    if (isC) {
      await s.pinch(200, 500, 60, 300)
      check('G1a', 'the board\'s phone layout: a pinch leaves the page at its own size', (await s.scale()) === 1, await s.scale())
    }
    await p.locator('#sbMore').tap(); await p.locator('#sbMoreWide').tap(); await sleep(400)
    const z0 = await zoomOf(p, '#schedBoard .sb-main', true)
    await s.pinch(200, 450, 220, 60)
    const z1 = await zoomOf(p, '#schedBoard .sb-main', true)
    check('G1b', 'the board\'s desktop layout still zooms by its own pinch (D1109)', z1 < z0 - 0.1, { z0, z1 })
    if (isC) check('G1c', 'and the page did not', (await s.scale()) === 1, await s.scale())
    await s.shot('G1-board-wide-pinched')
    await p.locator('#sbDone').tap(); await sleep(500)
  }
  // G2 Quals
  {
    await s.go('quals')
    const z0 = await zoomOf(p, '#qtbl', true)
    await s.pinch(200, 400, 60, 260)
    const z1 = await zoomOf(p, '#qtbl', true)
    check('G2a', 'Quals still zooms by its own pinch (D1110)', z1 > z0 + 0.2, { z0, z1 })
    if (isC) check('G2b', 'and the page did not', (await s.scale()) === 1, await s.scale())
    await s.shot('G2-quals-pinched')
  }
  // G3–G5 the Leave War grid, its Balances page and its OIL tab
  {
    await s.go('leavewar'); await p.waitForSelector('.mx-wrap > table.mx'); await sleep(600)
    const z0 = await zoomOf(p, '.mx-wrap > table.mx')
    await s.pinch(200, 520, 80, 200)
    const z1 = await zoomOf(p, '.mx-wrap > table.mx')
    check('G3a', 'the Leave War grid still zooms by its own pinch (D1282)', z1 > z0 + 0.2, { z0, z1 })
    if (isC) check('G3b', 'and the page did not', (await s.scale()) === 1, await s.scale())
    await s.shot('G3-lw-grid-pinched')
    await p.locator('[data-testid="lw-tab-balances"]').tap(); await p.waitForSelector('.bp-zoom'); await sleep(600)
    const b0 = await zoomOf(p, '.bp-zoom')
    await s.pinch(200, 500, 240, 60)
    const b1 = await zoomOf(p, '.bp-zoom')
    check('G4a', 'the Balances page still zooms by its own pinch (D1236)', b1 < b0 - 0.1, { b0, b1 })
    if (isC) check('G4b', 'and the page did not', (await s.scale()) === 1, await s.scale())
    await s.shot('G4-balances-pinched')
    await p.locator('[data-testid="oil-tracker"]').tap(); await p.waitForSelector('[data-testid="oil-list"] table.oil-grid'); await sleep(600)
    const o0 = await zoomOf(p, '[data-testid="oil-list"] table.oil-grid')
    await s.pinch(200, 520, 100, 200)
    const o1 = await zoomOf(p, '[data-testid="oil-list"] table.oil-grid')
    check('G5a', 'the OIL tab still zooms by its own pinch (D1285)', o1 > o0 + 0.2, { o0, o1 })
    if (isC) check('G5b', 'and the page did not', (await s.scale()) === 1, await s.scale())
    await s.shot('G5-oil-pinched')
  }
  // G6 the Tracker's chart
  {
    await p.keyboard.press('Escape'); await sleep(500)
    check('G5c', 'the OIL tab closes by Escape', await p.locator('[data-testid="oil-sheet"]').count() === 0)
    await s.go('tracker'); await p.waitForSelector('#board .flowwrap', { timeout: 20000 }); await sleep(1200)
    const z0 = await zoomOf(p, '#board .flowwrap')
    const c = await p.evaluate(() => { const b = document.getElementById('board').getBoundingClientRect(); return [b.left + b.width / 2, b.top + Math.min(b.height, innerHeight - b.top) / 2] })
    await s.pinch(c[0], c[1], 60, 240)
    const z1 = await zoomOf(p, '#board .flowwrap')
    check('G6a', 'the Tracker\'s chart still zooms by its own pinch (D992)', z1 > z0 + 0.1, { z0, z1 })
    if (isC) check('G6b', 'and the page did not', (await s.scale()) === 1, await s.scale())
    await s.shot('G6-tracker-pinched')
  }
  // R no screen needs the page zoomed to be read: the smallest words drawn on each everyday page, at his iPhone's width
  for (const pg of ['viewsched', 'inputs', 'logic', 'help', 'admin']) {
    await s.go(pg)
    const r = await p.evaluate(() => {
      let min = 99, where = ''
      for (const el of document.querySelectorAll('.page.on *')) {
        const t = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())
        if (!t) continue
        const b = el.getBoundingClientRect(); if (b.width < 2 || b.height < 2 || b.bottom < 0) continue
        const f = parseFloat(getComputedStyle(el).fontSize) * (parseFloat(getComputedStyle(el).zoom) || 1)
        if (f >= 1 && f < min) { min = f; where = el.className || el.tagName }   // a 0px label is a hidden one (a screen reader's), not words drawn
      }
      return { min, where: String(where).slice(0, 60) }
    })
    check(`R-${pg}`, `${pg}: its smallest words are drawn at ${r.min}px (${r.where}) — at or above the app's smallest by design, the week's stores chip (7.5px, bold short codes — pictured legible at 3x)`, r.min >= 7.5, r)
    await s.shot(`R-${pg}`)
  }
  check('E', 'no page error', s.errs.length === 0, s.errs)
  await s.ctx.close()
}
await browser.close()
writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 1))
const bad = results.filter(r => !r.ok)
console.log(`\n${results.length - bad.length}/${results.length} PASS`)
process.exit(bad.length ? 1 : 0)
