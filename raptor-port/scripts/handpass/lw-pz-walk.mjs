// [LW-PHONE-PINCH-ZOOM] the walk (23 Oct 26): the Leave War's pinch to zoom, driven by REAL two-finger touches over CDP at
// his iPhone's size (402 x 874, then turned 874 x 402), and Ctrl+scroll on a desktop. Each step asserts what a person SEES
// (the bug-check order §7.8): the zoom moved, the day under the fingers stayed under them, the frozen date row stands over
// its own columns and at their size, the frozen names stand on their rows, the month buttons kept their size, the page
// itself never zoomed, a pinch armed no selection and opened no day. Pictures to OUT.
//   node scripts/handpass/lw-pz-walk.mjs            (the frozen build served on http://localhost:4271 — launch.json lw-pz-walk)
//   URL=… OUT=… ONLY=P3,P4 node scripts/handpass/lw-pz-walk.mjs
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launch = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const URL = process.env.URL || 'http://localhost:4271/?fresh=1'
const OUT = process.env.OUT || 'docs/img/handpass/2026-10-23-lw-pinch'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
mkdirSync(OUT, { recursive: true })
const T = id => `[data-testid="${id}"]`
const sleep = ms => new Promise(r => setTimeout(r, ms))
const results = []
const rec = (id, pass, what, data = {}) => { results.push({ id, pass, what, ...data }); console.log(`${pass ? 'PASS' : 'FAIL'} ${id} — ${what}`, JSON.stringify(data)) }

const b = await chromium.launch(launch)

async function phone(w = 402, h = 874) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, screen: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push('pageerror ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text().slice(0, 200)) })
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.tap('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('#page-leavewar .mx-wrap [data-testid^="head-"]'); await sleep(900)
  await page.addStyleTag({ content: '#toastEl{visibility:hidden!important}' })
  const cdp = await ctx.newCDPSession(page)
  return { ctx, page, cdp, errs }
}
const touch = (cdp, type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
/** two fingers about (cx, cy), d0 → d1 apart, sideways; `mid` takes a picture before the lift; `hold` keeps the first finger
 *  down that long before the second lands; `slide` carries the centre by (dx, dy) */
/* every pinch also measures the JUMP AT THE LIFT: the cell first under the fingers, where it is drawn the moment before
   the lift (the stretched picture) and where it settles after — what he would see snap. Kept in `jumps`. */
const jumps = []
const opened = []   // a window a pinch opened — never meant to happen (D1282's reading: a pinch never opens a day)
let probePage = null
async function pinch(cdp, cx, cy, d0, d1, o = {}) {
  const steps = o.steps ?? 10, sx = o.slide?.[0] ?? 0, sy = o.slide?.[1] ?? 0
  const at = i => { const d = d0 + (d1 - d0) * i / steps, x = cx + sx * i / steps, y = cy + sy * i / steps; return [[x - d / 2, y], [x + d / 2, y]] }
  const c = probePage ? await cellAt(probePage, cx, cy) : null
  const sheetBefore = probePage ? await probePage.evaluate(() => document.querySelector('.bidsheet')?.getAttribute('data-testid') || null) : null
  await touch(cdp, 'touchStart', [at(0)[0]]); await sleep(o.hold ?? 30)
  await touch(cdp, 'touchStart', at(0)); await sleep(30)
  for (let i = 1; i <= steps; i++) { await touch(cdp, 'touchMove', at(i)); await sleep(16) }
  if (o.mid) await o.mid()
  const pre = c?.id ? await whereIs(probePage, c.id, c.fx, c.fy) : null
  await touch(cdp, 'touchEnd', []); await sleep(o.settle ?? 600)
  const post = c?.id ? await whereIs(probePage, c.id, c.fx, c.fy) : null
  const sheetAfter = probePage ? await probePage.evaluate(() => document.querySelector('.bidsheet')?.getAttribute('data-testid') || null) : null
  if (sheetAfter && sheetAfter !== sheetBefore) opened.push({ at: [cx, cy], d0, d1, hold: o.hold ?? 30, sheet: sheetAfter })
  if (pre && post) jumps.push({ at: [cx, cy], cell: c.id, jump: Math.round(Math.hypot(post[0] - pre[0], post[1] - pre[1])), pre, post, end: at(steps).map(p => p.map(Math.round)) })
}
async function swipe(cdp, x0, y0, x1, y1, steps = 8) {
  await touch(cdp, 'touchStart', [[x0, y0]]); await sleep(20)
  for (let i = 1; i <= steps; i++) { await touch(cdp, 'touchMove', [[x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps]]); await sleep(16) }
  await touch(cdp, 'touchEnd', []); await sleep(600)
}

/* everything a step judges, read off the screen */
const read = page => page.evaluate(() => {
  const q = s => document.querySelector(s)
  const wrap = q('#page-leavewar .mx-wrap'), tbl = wrap?.querySelector(':scope > table.mx')
  const z = parseFloat(tbl?.style.zoom || '1') || 1
  const wr = wrap.getBoundingClientRect()
  const head = [...wrap.querySelectorAll(':scope > table.mx > tbody.mxhead tr:last-child > th')]
  const heads = [...wrap.querySelectorAll('[data-testid^="head-"]')]
  const dayW = heads.length ? heads.slice(0, 40).reduce((a, h) => a + h.getBoundingClientRect().width, 0) / Math.min(40, heads.length) : 0
  const who = q('#page-leavewar .mx-wrap .mxhead th.who')?.getBoundingClientRect(), bal = q('#page-leavewar .mx-wrap .mxhead th.bal')?.getBoundingClientRect()
  const frozenR = bal ? bal.right : 0
  // the frozen date row: its scrolling layer's cells against the grid's own header cells, cell by cell, those on screen
  const mirror = q('#page-leavewar [data-testid="sticky-head"]')
  let mirrorMaxDx = null, mirrorMaxDw = null, mirrorN = 0, copyDx = null, mirrorTop = null, mirrorText = null
  if (mirror) {
    const mcells = [...mirror.querySelectorAll('.mxfixed-scroll .mxhead tr:last-child > th')]
    mirrorTop = Math.round(mirror.getBoundingClientRect().top)
    mirrorMaxDx = 0; mirrorMaxDw = 0
    const dates = []
    head.forEach((h, i) => {
      const m = mcells[i]; if (!m) return
      const a = h.getBoundingClientRect(), c = m.getBoundingClientRect()
      if (!h.dataset.testid || !h.dataset.testid.startsWith('head-')) return
      if (a.left < frozenR + 2 || a.right > innerWidth - 2) return   // only the dates he can see beside the frozen names
      mirrorN++
      mirrorMaxDx = Math.max(mirrorMaxDx, Math.abs(a.left - c.left))
      mirrorMaxDw = Math.max(mirrorMaxDw, Math.abs(a.width - c.width))
      if (h.textContent.trim() !== m.textContent.trim()) dates.push(h.textContent.trim() + '≠' + m.textContent.trim())
      if (dates.length === 0 && mirrorN === 1) mirrorText = m.textContent.trim()
    })
    if (dates.length) mirrorText = 'MISMATCH ' + dates.slice(0, 3).join(',')
    const copy = mirror.querySelector('.mxfixed-frozen')
    if (copy && bal) copyDx = Math.round(copy.getBoundingClientRect().right - bal.right)
  }
  // the frozen names copy (the phone's band) against the real rows
  let bandMaxDy = null, bandN = 0
  const band = q('#page-leavewar [data-testid="frozen-cols"]')
  if (band && getComputedStyle(band).visibility !== 'hidden') {
    bandMaxDy = 0
    for (const r of band.querySelectorAll('tr[data-band-id]')) {
      const real = q(`#page-leavewar .mx-wrap [data-testid="row-${r.dataset.bandId}"]`)
      if (!real) continue
      const a = real.getBoundingClientRect(), c = r.getBoundingClientRect()
      if (a.bottom < 0 || a.top > innerHeight) continue
      bandN++; bandMaxDy = Math.max(bandMaxDy, Math.abs(a.top - c.top), Math.abs(a.height - c.height))
    }
  }
  // the open-dates outline against its first date
  let bidDx = null
  const box = q('#page-leavewar [data-testid="bid-box"]')
  if (box) { const from = box.dataset.from, cell = q(`#page-leavewar [data-testid="head-${from}"]`); if (cell) bidDx = Math.round(box.getBoundingClientRect().left - cell.getBoundingClientRect().left) }
  const mon = q('#page-leavewar [data-testid="month-strip"] .mjump')?.getBoundingClientRect()
  const bar = q('#page-leavewar .card-hd')?.getBoundingClientRect()
  return {
    z, sl: Math.round(wrap.scrollLeft), sy: Math.round(scrollY), vv: visualViewport ? +visualViewport.scale.toFixed(3) : 1,
    dayW: +dayW.toFixed(2), days: dayW ? +((wr.width - (frozenR - wr.left)) / dayW).toFixed(1) : 0,
    names: who && bal ? Math.round(bal.right - who.left) : 0,
    mirror: !!mirror, mirrorTop, mirrorN, mirrorMaxDx: mirrorMaxDx === null ? null : +mirrorMaxDx.toFixed(1), mirrorMaxDw: mirrorMaxDw === null ? null : +mirrorMaxDw.toFixed(1), copyDx, mirrorText,
    bandN, bandMaxDy: bandMaxDy === null ? null : +bandMaxDy.toFixed(1), bidDx,
    month: mon ? [Math.round(mon.width), Math.round(mon.height)] : null, barH: bar ? Math.round(bar.height) : null,
    tf: tbl?.style.transform || '', selcells: document.querySelectorAll('#page-leavewar .selcell').length,
    sheet: !!q('#page-leavewar .bidsheet'), selecting: !!q('#page-leavewar [data-selecting]'),
  }
})
/** the date cell under a screen point, and where it is now */
const cellAt = (page, x, y) => page.evaluate(([x, y]) => {
  const el = document.elementFromPoint(x, y)?.closest('td,th')
  if (!el) return null
  const id = el.dataset.testid || null
  const r = el.getBoundingClientRect()
  return { id, fx: (x - r.left) / r.width, fy: (y - r.top) / r.height }
}, [x, y])
const whereIs = (page, id, fx, fy) => page.evaluate(([id, fx, fy]) => {
  const el = document.querySelector(`[data-testid="${id}"]`); if (!el) return null
  const r = el.getBoundingClientRect(); return [Math.round(r.left + fx * r.width), Math.round(r.top + fy * r.height)]
}, [id, fx, fy])
const shot = async (page, name, clip) => { await page.screenshot({ path: `${OUT}/${name}.png`, ...(clip ? { clip } : {}) }) }
const run = id => !ONLY.length || ONLY.includes(id)
/** the frozen row lines up: every date he can see within a pixel of its column, the same width, the copy flush */
const lined = s => s.mirror && s.mirrorN >= 3 && s.mirrorMaxDx <= 1.5 && s.mirrorMaxDw <= 1.5 && (s.copyDx === null || Math.abs(s.copyDx) <= 1) && !String(s.mirrorText).startsWith('MISMATCH')

{ // ---------------- the phone, held upright ----------------
  const { ctx, page, cdp, errs } = await phone()
  probePage = page
  let s0 = await read(page)
  rec('P0', s0.z === 0.8 && s0.vv === 1, 'a phone opens one step out (0.8), the page at its own size', { z: s0.z, vv: s0.vv, days: s0.days })
  rec('P0b', (await page.locator('[data-testid="lw-zoom"], [data-testid="lw-zoom-out"]').count()) === 0, 'no − / + on the grid\'s bar')
  await shot(page, 'p0-open-upright')

  if (run('P1')) { // pinch out over the grid: the day under the fingers stays under them, the month buttons keep their size
    const c = await cellAt(page, 260, 640)
    const before = await read(page)
    await pinch(cdp, 260, 640, 220, 130, { mid: () => shot(page, 'p1-mid-pinch-out') })
    const s = await read(page)
    const now = c?.id ? await whereIs(page, c.id, c.fx, c.fy) : null
    const offX = now ? Math.abs(now[0] - 260) : 999
    const j = jumps[jumps.length - 1]
    /* the page is at its top, so the day cannot stay under the fingers DOWN the screen (the page cannot scroll above
       its top): it must stay under them across, and nothing may jump at the lift */
    rec('P1', s.z < before.z - 0.1 && s.tf === '' && offX <= 6 && j && j.jump <= 6 && s.vv === 1 && JSON.stringify(s.month) === JSON.stringify(before.month) && s.barH === before.barH,
      'a pinch out at the top of the page zooms the grid out; the day stays under the fingers across, nothing jumps at the lift; the page, its bar and the month buttons keep their size',
      { z: s.z, from: before.z, cell: c?.id, offX: Math.round(offX), jump: j?.jump, month: s.month, monthWas: before.month, vv: s.vv, barH: s.barH })
    await shot(page, 'p1-after-pinch-out')
  }
  if (run('P2')) { // scroll down until the date row freezes, then pinch in: the frozen row zooms with the grid and stays over its columns
    await page.evaluate(() => window.scrollTo(0, 700)); await sleep(500)
    const pre = await read(page)
    rec('P2a', lined(pre), 'frozen (scrolled down), the date row stands over its columns before any pinch', pre)
    await pinch(cdp, 220, 500, 100, 170, { mid: () => shot(page, 'p2-mid-pinch-in-frozen', { x: 0, y: 0, width: 402, height: 300 }) })
    const s = await read(page)
    rec('P2', s.z > pre.z + 0.1 && lined(s) && s.bandMaxDy !== null && s.bandMaxDy <= 1.5, 'a pinch in while frozen: the frozen dates zoom with the grid, each over its own column, the frozen names on their rows', s)
    await shot(page, 'p2-after-pinch-in-frozen')
    await shot(page, 'p2-frozen-row-crop', { x: 0, y: 60, width: 402, height: 160 })
  }
  if (run('P3')) { // in, no further than 1.4
    await pinch(cdp, 220, 500, 60, 300); await pinch(cdp, 220, 500, 60, 300)
    const s = await read(page)
    rec('P3', Math.abs(s.z - 1.4) < 0.002 && lined(s), 'in to 1.4 and no further; still lined up', { z: s.z, days: s.days, mirrorMaxDx: s.mirrorMaxDx })
    await shot(page, 'p3-at-1.4')
  }
  if (run('P4')) { // out until a month fits across, held upright
    await pinch(cdp, 220, 500, 300, 40); await pinch(cdp, 220, 500, 300, 40); await pinch(cdp, 220, 500, 300, 40)
    const s = await read(page)
    rec('P4', s.z >= 0.3 && s.z <= 0.5 && s.days >= 29.5 && s.days <= 33 && lined(s), 'out until about a whole month fits across, no further; still lined up', { z: s.z, days: s.days, mirrorMaxDx: s.mirrorMaxDx })
    await shot(page, 'p4-at-the-floor')
  }
  if (run('P5')) { // a pinch that starts on the top bar zooms the grid, never the page
    const before = await read(page)
    await pinch(cdp, 200, 28, 80, 200)
    const s = await read(page)
    rec('P5', s.z > before.z + 0.1 && s.vv === 1 && (!s.mirror || lined(s)), 'a pinch started on the app\'s top bar zooms the grid; the page stays its size', { from: before.z, ...s })
    await shot(page, 'p5-pinch-from-top-bar')
  }
  if (run('P6')) { // the first finger held on a day (past the 180 ms that arms a selection), then the second: no selection, no day opened
    await page.evaluate(() => window.scrollTo(0, 0)); await sleep(400)
    await pinch(cdp, 220, 500, 200, 120)   // a step out first, so the held pinch has room to zoom in
    const before = await read(page)
    if (process.env.DEBUG6) await page.evaluate(() => {
      window.__ev = []; const t0 = performance.now()
      for (const t of ['pointerdown', 'pointerup', 'pointercancel', 'touchstart', 'touchend', 'click'])
        window.addEventListener(t, e => window.__ev.push(`${Math.round(performance.now() - t0)} ${t} ${e.pointerId ?? ''} ${e.touches ? e.touches.length : ''} ${(e.target.closest && e.target.closest('[data-testid]')?.dataset.testid) || e.target.tagName}`), true)
    })
    await pinch(cdp, 250, 700, 120, 180, { hold: 420, mid: async () => { const m = await read(page); rec('P6mid', !m.selecting && m.selcells === 0, 'mid-pinch, after a 420 ms hold: no selection painted', { selcells: m.selcells, selecting: m.selecting }) } })
    await sleep(400)
    if (process.env.DEBUG6) console.log((await page.evaluate(() => window.__ev)).join(' | '), await page.evaluate(() => document.querySelector('#page-leavewar .bidsheet')?.getAttribute('data-testid')))
    const s = await read(page)
    rec('P6', (s.z > before.z || s.z === 1.4) && s.selcells === 0 && !s.sheet && !s.selecting, 'a pinch whose first finger was held on a day selects nothing and opens no day', { z: s.z, selcells: s.selcells, sheet: s.sheet })
    await shot(page, 'p6-held-then-pinch')
  }
  if (run('P7')) { // one finger still scrolls the year sideways, and a tap on a day still opens it
    const before = await read(page)
    await swipe(cdp, 330, 650, 150, 650)
    const s = await read(page)
    rec('P7', s.sl > before.sl + 40 && s.z === before.z, 'one finger still scrolls the grid sideways after pinches, and does not zoom', { slFrom: before.sl, sl: s.sl })
  }
  if (run('P8')) { // a tap right after pinching, its pressed picture within 100 ms (D1281): a month button
    await page.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
    const btn = page.locator('#page-leavewar [data-testid="month-MAR"]')
    const bb = await btn.boundingBox()
    await touch(cdp, 'touchStart', [[bb.x + bb.width / 2, bb.y + bb.height / 2]]); await sleep(40)
    await touch(cdp, 'touchEnd', []); await sleep(60)
    await shot(page, 'p8-tap-month-pressed', { x: 0, y: 0, width: 402, height: 420 })
    await sleep(800)
    await shot(page, 'p8-tap-month-settled', { x: 0, y: 0, width: 402, height: 420 })
    const ok = await page.evaluate(() => {
      const el = document.querySelector('#page-leavewar [data-testid="head-2026-03-01"]')
      const fz = document.querySelector('#page-leavewar .mx-wrap .mxhead th.bal')
      return el && fz ? Math.round(el.getBoundingClientRect().left - fz.getBoundingClientRect().right) : null
    })
    rec('P8', ok !== null && Math.abs(ok) <= 2, 'a month button still jumps the zoomed grid to its month, at the frozen edge', { gap: ok })
  }
  if (run('P9')) { // the open-dates outline follows the zoom
    const s = await read(page)
    rec('P9', s.bidDx === null || Math.abs(s.bidDx) <= 2, 'the green open-dates outline stands on its first date after the zooms', { bidDx: s.bidDx })
  }
  if (run('P10')) { // turned sideways while zoomed: the frozen row still on its columns; a pinch sideways too
    await page.setViewportSize({ width: 874, height: 402 }); await sleep(900)
    await page.evaluate(() => window.scrollTo(0, 500)); await sleep(500)
    const s = await read(page)
    rec('P10a', lined(s), 'turned sideways while zoomed: the frozen dates stand over their columns', s)
    await shot(page, 'p10-turned-sideways-zoomed')
    await pinch(cdp, 500, 250, 100, 60)
    const s2 = await read(page)
    rec('P10b', s2.z < s.z && lined(s2) && s2.vv === 1, 'a pinch out held sideways: lined up, the page its own size', { z: s2.z, from: s.z, mirrorMaxDx: s2.mirrorMaxDx })
    await shot(page, 'p10-sideways-after-pinch')
    await pinch(cdp, 500, 250, 40, 400); await pinch(cdp, 500, 250, 60, 400)
    const s3 = await read(page)
    rec('P10c', Math.abs(s3.z - 1.4) < 0.002 && lined(s3), 'sideways, in to 1.4; lined up', { z: s3.z })
    await page.setViewportSize({ width: 402, height: 874 }); await sleep(900)
    await page.evaluate(() => window.scrollTo(0, 700)); await sleep(500)
    const s4 = await read(page)
    rec('P10d', lined(s4), 'turned back upright at 1.4: the frozen dates stand over their columns', s4)
    await shot(page, 'p10-turned-back-upright')
  }
  rec('P-errs', errs.length === 0, 'no error on the phone, upright and sideways', { errs })
  await ctx.close()
}

if (run('P11')) { // the OIL tab pinches too (D1285): the table only
  const { ctx, page, cdp, errs } = await phone()
  probePage = null
  await page.tap(T('oil-tracker')); await sleep(700)
  const tz = () => page.evaluate(() => {
    const t = document.querySelector('[data-testid="oil-list"] table.oil-grid'), tools = document.querySelector('.oil-tools')
    return { z: parseFloat(t?.style.zoom || '1') || 1, toolsH: Math.round(tools.getBoundingClientRect().height), vv: visualViewport.scale, tf: t.style.transform }
  })
  const a = await tz()
  rec('P11a', a.z === 0.8 && (await page.locator(T('oil-zoom-out')).count()) === 0, 'the OIL tab opens one step out on a phone, with no − / +', a)
  await shot(page, 'p11-oil-open')
  await pinch(cdp, 200, 500, 100, 170)
  const b1 = await tz()
  rec('P11b', b1.z > a.z + 0.1 && b1.toolsH === a.toolsH && b1.vv === 1 && b1.tf === '', 'a pinch in on the OIL table zooms the table; its tools row and the page stay', b1)
  await shot(page, 'p11-oil-pinched-in')
  const tb = await page.locator('.oil-tools').boundingBox()
  await pinch(cdp, 200, tb.y + tb.height / 2, 200, 80)
  const c1 = await tz()
  rec('P11c', c1.z < b1.z && c1.vv === 1, 'a pinch started on the OIL tab\'s tools row zooms the table too', c1)
  await pinch(cdp, 200, 500, 60, 400); await pinch(cdp, 200, 500, 60, 400)
  const d1 = await tz()
  rec('P11d', Math.abs(d1.z - 1.4) < 0.002, 'the OIL table goes in to 1.4 and no further', d1)
  // the code read's F1: scrolled down the list, a pinch whose fingers rest on the tools row, then on a pinned name —
  // the person's row first in sight stays where it was, across the lift
  const rowAt = () => page.evaluate(() => {
    const w = document.querySelector('[data-testid="oil-list"]'), wr = w.getBoundingClientRect()
    const r = [...w.querySelectorAll('table.oil-grid > tbody > tr')].find(r => r.getBoundingClientRect().bottom > wr.top + 40)
    return r ? { id: r.getAttribute('data-testid') || r.dataset.oilrow || r.textContent.slice(0, 12), top: Math.round(r.getBoundingClientRect().top) } : null
  })
  const rowById = id => page.evaluate(id => { const w = document.querySelector('[data-testid="oil-list"]'); const r = [...w.querySelectorAll('table.oil-grid > tbody > tr')].find(r => (r.getAttribute('data-testid') || r.dataset.oilrow || r.textContent.slice(0, 12)) === id); return r ? Math.round(r.getBoundingClientRect().top) : null }, id)
  await page.evaluate(() => { document.querySelector('[data-testid="oil-list"]').scrollTop = 600 }); await sleep(400)
  const e0 = await rowAt()
  const tb2 = await page.locator('.oil-tools').boundingBox()
  await pinch(cdp, 200, tb2.y + tb2.height / 2, 200, 120)
  const e1 = e0 ? await rowById(e0.id) : null
  rec('P11e', !!e0 && e1 !== null && Math.abs(e1 - e0.top) <= 24, 'scrolled down the OIL list, a pinch out on its tools row: the row first in sight stays in sight where it was', { row: e0?.id, before: e0?.top, after: e1 })
  const name = page.locator('[data-testid="oil-list"] table.oil-grid tbody td.f.c1').nth(6)
  const nm = await name.boundingBox()
  const own = await name.evaluate(td => { const r = td.closest('tr'); return r.getAttribute('data-testid') || r.dataset.oilrow || r.textContent.slice(0, 12) })
  const fy = nm ? nm.y + nm.height / 2 : 0
  if (nm) await pinch(cdp, nm.x + nm.width / 2, fy, 120, 190)
  const after = await page.evaluate(id => { const w = document.querySelector('[data-testid="oil-list"]'); const r = [...w.querySelectorAll('table.oil-grid > tbody > tr')].find(r => (r.getAttribute('data-testid') || r.dataset.oilrow || r.textContent.slice(0, 12)) === id); if (!r) return null; const q = r.getBoundingClientRect(); return { top: Math.round(q.top), bottom: Math.round(q.bottom) } }, own)
  rec('P11f', !!nm && !!after && after.top <= fy + 2 && after.bottom >= fy - 2, 'a pinch in on a pinned name: that name stays under the fingers', { row: own, fingersY: Math.round(fy), after })
  await shot(page, 'p11-oil-after-anchor-pinches')
  await shot(page, 'p11-oil-at-1.4')
  rec('P11-errs', errs.length === 0, 'no error on the OIL tab', { errs })
  await ctx.close()
}

if (run('P12')) { // Rearrange: a row held by its grip is let go when a pinch starts; nothing moves
  const { ctx, page, cdp, errs } = await phone()
  probePage = null
  await page.tap(T('settings-open')); await sleep(400)
  await page.tap(T('settings-rearrange')); await sleep(600)
  const order = () => page.evaluate(() => [...document.querySelectorAll('#page-leavewar .mx-wrap tr[data-testid^="row-"]')].slice(0, 6).map(r => r.dataset.testid).join(','))
  const before = await order(), z0 = (await read(page)).z
  const grip = page.locator('#page-leavewar .mx-wrap tr[data-testid^="row-"] [data-testid^="drag-"]').nth(2)
  const gb = await grip.boundingBox()
  let held = false
  if (gb) {
    const gx = gb.x + gb.width / 2, gy = gb.y + gb.height / 2
    await touch(cdp, 'touchStart', [[gx, gy]]); await sleep(250)
    await touch(cdp, 'touchMove', [[gx, gy + 40]]); await sleep(60)
    held = await page.evaluate(() => { const f = document.querySelector('#page-leavewar [data-testid="lift-frame"]'); return !!f && f.getBoundingClientRect().height > 0 && getComputedStyle(f).display !== 'none' && getComputedStyle(f).opacity !== '0' })
    await touch(cdp, 'touchStart', [[gx, gy + 40], [gx + 160, gy + 40]]); await sleep(30)
    for (let i = 1; i <= 8; i++) { await touch(cdp, 'touchMove', [[gx, gy + 40 + i * 4], [gx + 160 + i * 12, gy + 40 + i * 4]]); await sleep(16) }
    await touch(cdp, 'touchEnd', []); await sleep(600)
  }
  const after = await order(), z1 = (await read(page)).z
  const dragging = await page.evaluate(() => !!document.querySelector('#page-leavewar .dragging, #page-leavewar tr.drag-over'))
  rec('P12', !!gb && held && after === before && !dragging && z1 !== z0, 'in Rearrange, a row held by its grip (its lift frame up) is let go when a pinch starts: nothing moved, the grid zoomed', { grip: !!gb, held, before, after, z0, z1, dragging })
  await shot(page, 'p12-rearrange-pinch')
  rec('P12-errs', errs.length === 0, 'no error in Rearrange', { errs })
  await ctx.close()
}

if (run('P14')) { // the roll-call's three: the open-dates outline, the figures drawer, a pinch over a day's window
  const { ctx, page, cdp, errs } = await phone()
  probePage = page
  // open October and November for bidding, as the admin does
  await page.tap(T('open-chip')); await page.waitForSelector(T('open-dates')).catch(() => {}); await sleep(500)
  for (const k of ['2026-10', '2026-11']) { const m = page.locator(T(`od-month-${k}`)); if ((await m.getAttribute('data-state')) !== 'open') { await m.tap(); await sleep(250) } }
  await page.tap(T('open-dates-close')); await sleep(700)
  await page.tap(T('month-OCT')); await sleep(800)
  const a = await read(page)
  await pinch(cdp, 220, 600, 100, 150)
  const b1 = await read(page)
  rec('P14a', a.bidDx !== null && Math.abs(b1.bidDx) <= 2 && b1.z > a.z, 'with October and November open, the green open-dates outline stands on its first date after a pinch in', { before: a.bidDx, after: b1.bidDx, z: b1.z })
  await pinch(cdp, 220, 600, 180, 110)
  const b2 = await read(page)
  rec('P14b', Math.abs(b2.bidDx) <= 2, '…and after a pinch out', { bidDx: b2.bidDx, z: b2.z })
  await shot(page, 'p14-open-dates-outline')
  // the figures drawer, if the grid still offers it
  const fig = page.locator(T('figures-toggle'))
  if (await fig.count()) {
    await fig.first().tap(); await sleep(700)
    const rows = () => page.evaluate(() => {
      const d = document.querySelector('#page-leavewar [data-testid="figdrawer"]')
      if (!d) return null
      let worst = 0, n = 0
      for (const r of d.querySelectorAll('tr[data-drawer-key]')) {
        const real = document.querySelector(`#page-leavewar .mx-wrap [data-testid="${r.dataset.drawerKey}"]`)
        if (!real) continue
        const a = real.getBoundingClientRect(), c = r.getBoundingClientRect()
        if (a.bottom < 0 || a.top > innerHeight) continue
        n++; worst = Math.max(worst, Math.abs(a.top - c.top))
      }
      return { n, worst: Math.round(worst) }
    })
    const r0 = await rows()
    await pinch(cdp, 220, 600, 100, 150)
    const r1 = await rows()
    rec('P14c', !!r1 && (r1.n === 0 || r1.worst <= 2), 'with the figures drawer open, its rows stand on the rows of the grid after a pinch', { before: r0, after: r1 })
    await shot(page, 'p14-figures-drawer')
    await fig.first().tap().catch(() => {}); await sleep(400)
  } else rec('P14c', true, 'the figures drawer: no toggle on the grid (nothing to walk)', {})
  // a pinch over a day's window at the foot: the grid zooms behind it, the window keeps its size, the page never zooms
  await page.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
  const cell = page.locator('#page-leavewar .mx-wrap td[data-testid^="cell-"]').nth(40)
  await cell.tap(); await sleep(600)
  const sheet = page.locator('#page-leavewar .bidsheet').first()
  const sb0 = await sheet.boundingBox(), z0 = (await read(page)).z
  if (sb0) {
    await pinch(cdp, 200, sb0.y + Math.min(80, sb0.height / 2), 100, 160)
    const sb1 = await sheet.boundingBox(), s1 = await read(page)
    rec('P14d', !!sb1 && Math.round(sb1.height) === Math.round(sb0.height) && s1.vv === 1 && s1.z > z0 && opened.length === 0, 'a pinch over the window of a day zooms the grid behind it; the window keeps its size and stays; the page never zooms', { z0, z: s1.z, h0: Math.round(sb0.height), h1: sb1 ? Math.round(sb1.height) : null, vv: s1.vv })
    await shot(page, 'p14-pinch-over-a-window')
  } else rec('P14d', false, 'the window of a day did not open to pinch over', {})
  rec('P14-errs', errs.length === 0, 'no error with open dates, the drawer and a window', { errs })
  probePage = null
  await ctx.close()
}

if (run('P13')) { // a desktop: Ctrl+scroll over the grid zooms the grid, not the page; a plain scroll still scrolls
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('#page-leavewar .mx-wrap [data-testid^="head-"]'); await sleep(1200)
  const a = await read(page)
  await page.mouse.move(800, 520)
  await page.keyboard.down('Control')
  for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, 100); await sleep(40) }
  await page.keyboard.up('Control'); await sleep(600)
  const c = await read(page)
  const dpr = await page.evaluate(() => devicePixelRatio)
  rec('P13a', a.z === 1 && c.z < 0.8 && c.tf === '' && dpr === 1, 'a desktop opens at normal size; Ctrl+scroll down over the grid zooms the grid out, the page stays', { from: a.z, z: c.z, dpr })
  await shot(page, 'p13-desktop-ctrl-scroll-out')
  await page.keyboard.down('Control')
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, -100); await sleep(30) }
  await page.keyboard.up('Control'); await sleep(600)
  const d = await read(page)
  rec('P13b', Math.abs(d.z - 1.4) < 0.002, 'Ctrl+scroll up stops at 1.4', { z: d.z })
  const y0 = await page.evaluate(() => scrollY)
  await page.mouse.wheel(0, 300); await sleep(500)
  const y1 = await page.evaluate(() => scrollY), e = await read(page)
  rec('P13c', y1 > y0 + 100 && e.z === d.z, 'a plain scroll still scrolls the page and does not zoom', { y0, y1, z: e.z })
  await page.evaluate(() => window.scrollTo(0, 700)); await sleep(500)
  const f = await read(page)
  rec('P13d', !f.mirror || lined(f), 'a desktop zoomed in, scrolled down: its frozen dates (if it freezes them) stand over their columns', f)
  rec('P13-errs', errs.length === 0, 'no error on the desktop', { errs })
  await shot(page, 'p13-desktop-at-1.4-scrolled')
  await ctx.close()
}

rec('P-open', opened.length === 0, 'no pinch opened a window (a selection, a day)', { opened })
const worst = jumps.reduce((m, j) => Math.max(m, j.jump), 0)
rec('P-jump', worst <= 6, 'no pinch on the phone made anything jump at the lift (the cell first under the fingers, before and after)', { n: jumps.length, worst, over: jumps.filter(j => j.jump > 6) })
writeFileSync(`${OUT}/walk-results.json`, JSON.stringify(results, null, 1))
const fails = results.filter(r => !r.pass)
console.log(`\n${results.length - fails.length} / ${results.length} PASS`)
await b.close()
