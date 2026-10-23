// [LW-PHONE-PINCH-ZOOM] — the pictures for his questions (23 Oct 26). His iPhone's size, 402 x 874 at 3x, as the admin,
// the demo squadron (?fresh=1). The build served on http://localhost:4180/ (launch.json "raptor-preview").
//
// Which pictures are REAL and which are DRAWN (the mock-ups guide, step 4):
//   q1-*        real screens; the coloured outlines and labels are drawn on top.
//   q2-*, q3-*  the grid at a zoom the − / + cannot reach today (0.5, 0.41, 2): DRAWN by one transform — every Leave War box
//               the app zooms (inline `zoom: 0.8`) set to the zoom named, `--lwz` with it; 0.6 and 1.4 are the real buttons.
//   q4-*        real screens (the OIL tab), outlines drawn on top.
//   rec-*       frames of his own screen recording of 23 Oct 26, turned upright and cropped, outlines drawn on top.
// Read only: nothing is saved (?fresh=1 keeps the demo world in memory).
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { chromium, devices } from '@playwright/test'
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../docs/img/mock/lw-pinch')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launch = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const URL = process.env.URL || 'http://localhost:4180/?fresh=1'
const REC = process.env.REC || ''   // folder of frames pulled from his recording (f000.0.jpg …), optional
const T = id => `[data-testid="${id}"]`
const b = await chromium.launch(launch)
const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: devices['iPhone 13'].userAgent })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
const shot = (name, clip) => page.screenshot({ path: path.join(OUT, name + '.png'), ...(clip ? { clip } : {}) })
const rect = sel => page.evaluate(s => { const r = document.querySelector(s)?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null }, sel)

/* outlines and labels drawn over the page — plain lines, no glow (D887) */
const mark = boxes => page.evaluate(bs => {
  document.getElementById('pzmarks')?.remove()
  const host = document.createElement('div'); host.id = 'pzmarks'
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999'
  for (const m of bs) {
    const d = document.createElement('div')
    d.style.cssText = `position:fixed;left:${m.x}px;top:${m.y}px;width:${m.w}px;height:${m.h}px;border:2px ${m.dash ? 'dashed' : 'solid'} ${m.c};border-radius:6px;box-sizing:border-box`
    host.appendChild(d)
    if (m.t) {
      const l = document.createElement('div')
      l.textContent = m.t
      const ly = m.ly ?? (m.y + 2)
      l.style.cssText = `position:fixed;${m.lr ? `right:${402 - m.x - m.w + 4}px` : `left:${m.x + 4}px`};top:${ly}px;background:${m.c};color:#0b0f14;font:700 10.5px/1.25 -apple-system,system-ui,sans-serif;padding:2px 6px;border-radius:4px;white-space:nowrap`
      host.appendChild(l)
    }
  }
  document.body.appendChild(host)
}, boxes)
const unmark = () => page.evaluate(() => document.getElementById('pzmarks')?.remove())

/* the one transform for the drawn zooms: every box the app zoomed at `from` is set to `to` (its inverse too) */
const setZoom = (from, to) => page.evaluate(([f, t]) => {
  let n = 0
  for (const el of document.querySelectorAll('#page-leavewar [style]')) {
    const z = parseFloat(el.style.zoom)
    if (!z) continue
    if (Math.abs(z - f) < 0.001) { el.style.zoom = String(t); el.style.setProperty('--lwz', String(t)); n++ }
    else if (Math.abs(z - 1 / f) < 0.001) { el.style.zoom = String(1 / t); n++ }
  }
  window.dispatchEvent(new Event('resize'))
  return n
}, [from, to])
const measure = () => page.evaluate(() => {
  const wrap = document.querySelector('#page-leavewar .mx-wrap')
  const cells = [...document.querySelectorAll('#page-leavewar tr[data-testid="row-stiff"] td[data-testid^="cell-stiff-"]')]
  const dayW = cells[3]?.getBoundingClientRect().width || 0
  const fz = [...document.querySelectorAll('#page-leavewar .mx-wrap tbody tr[data-testid="row-stiff"] > *')].slice(0, 2).reduce((a, c) => a + c.getBoundingClientRect().width, 0)
  const row = document.querySelector('#page-leavewar tr[data-testid="row-stiff"]')
  const rh = row?.getBoundingClientRect().height || 1
  const top = wrap.getBoundingClientRect().top
  return { days: +((wrap.getBoundingClientRect().width - fz) / dayW).toFixed(1), people: Math.floor((innerHeight - Math.max(top, 0) - 90) / rh), nameCol: Math.round(fz) }
})

await page.goto(URL)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.tap('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar'))
await page.waitForSelector(T('row-stiff')); await page.waitForTimeout(900)
/* A BUSY JULY (the mock-ups guide: one busy state by default). The demo squadron holds only about twenty leave days a month,
   so for the pictures only, sample leave is placed through the test door the browser tests use (`lwSetCell`) — in memory,
   never saved. Every third person gets a stretch of two to six days, in the grid's own kinds. */
const placed = await page.evaluate(() => {
  const ids = [...document.querySelectorAll('#page-leavewar .mx-wrap tbody tr[data-testid^="row-"]')].map(r => r.dataset.testid.slice(4))
  const kinds = ['LL', 'OL', 'OIL', 'LL', 'CCL', 'OL', 'LL', 'FO']
  let n = 0
  ids.forEach((id, i) => {
    if (i % 3 === 2) return
    const start = 1 + ((i * 7) % 26), len = 2 + (i % 5), kind = kinds[i % kinds.length]
    for (let d = start; d < Math.min(32, start + len); d++) if (window.lwSetCell(id, `2026-07-${String(d).padStart(2, '0')}`, kind)) n++
  })
  return n
})
await page.waitForTimeout(600)
/* the grid on 1 July: the month button, then the day put at the left edge of the days */
const toJuly = async () => {
  await page.evaluate(() => [...document.querySelectorAll('[data-testid="month-strip"] button')].find(b => b.textContent.trim() === 'JUL')?.click())
  await page.waitForTimeout(700)
  await page.evaluate(() => {
    const wrap = document.querySelector('#page-leavewar .mx-wrap')
    const row = document.querySelector('#page-leavewar .mx-wrap tbody tr[data-testid="row-stiff"]')
    const fz = [...row.children].slice(0, 2).reduce((a, c) => a + c.getBoundingClientRect().width, 0)
    const c = document.querySelector('#page-leavewar td[data-testid="cell-stiff-2026-07-01"]')
    if (c) wrap.scrollLeft += c.getBoundingClientRect().left - (wrap.getBoundingClientRect().left + fz)
  })
  await page.waitForTimeout(500)
}
await toJuly()
const figures = { placed }

/* ---- Q1: what a pinch zooms ---- */
{
  const top = await rect('.topbar'), tabs = await rect(T('lw-tab-grid')), gear = await rect(T('settings-open'))
  const view = await rect('.lw-viewline'), bar = await rect(T('counts-toggle')), leg = await rect(T('legend-open'))
  const strip = await rect(T('month-strip')), wrap = await rect('#page-leavewar .mx-wrap')
  const GREY = '#c9d1d9', GREEN = '#7ee2a8'
  await mark([
    { x: 2, y: top.y + 1, w: 398, h: top.h - 2, c: GREY, dash: 1 },
    { x: 2, y: tabs.y - 3, w: 398, h: gear.h + 2, c: GREY, dash: 1 },
    { x: 2, y: view.y, w: 398, h: view.h, c: GREY, dash: 1 },
    { x: 2, y: bar.y - 6, w: 398, h: leg.h + 12, c: GREY, dash: 1 },
    { x: strip.x - 6, y: strip.y - 3, w: strip.w + 8, h: strip.h + 6, c: GREY, dash: 1 },
    { x: wrap.x - 2, y: strip.y + strip.h + 4, w: wrap.w + 4, h: 874 - (strip.y + strip.h + 4) - 4, c: GREEN, t: 'Green: a pinch zooms this — the grid', ly: 874 - 56 },
    { x: 6, y: 874 - 30, w: 0, h: 0, c: GREY, t: 'Grey dashes: stays its size', ly: 874 - 30 },
  ])
  await shot('q1-a-what-zooms-top')
  await unmark()
  /* scrolled down: the frozen date row is up under the top bar — it zooms with the grid and stays over its columns */
  await page.evaluate(() => window.scrollTo(0, 700)); await page.waitForTimeout(700)
  const fixed = await rect('#page-leavewar .mxfixed')
  const wrap2 = await rect('#page-leavewar .mx-wrap')
  if (!fixed) throw new Error('the frozen date row did not appear')
  await mark([
    { x: 2, y: fixed.y - 1, w: 398, h: fixed.h + 2, c: GREEN, t: 'Frozen date row — zooms with the grid, stays over its columns', ly: fixed.y + fixed.h + 4 },
    { x: wrap2.x - 2, y: fixed.y + fixed.h + 26, w: wrap2.w + 4, h: 874 - (fixed.y + fixed.h + 26) - 4, c: GREEN },
  ])
  await shot('q1-b-what-zooms-frozen-row')
  await unmark()
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(600)
}

/* the grid crop for Q2 / Q3: from the month strip down — what the question is about (D1222) */
const gridClip = async () => { const s = await rect(T('month-strip')); return { x: 0, y: s.y - 6, width: 402, height: 874 - (s.y - 6) } }

/* ---- Q2: how far out ---- */
await page.tap(T('lw-zoom-out')); await page.waitForTimeout(700)                       // 0.6 — the real button
await toJuly(); figures.z060 = await measure(); await shot('q2-a-out-060-today', await gridClip())
let n = await setZoom(0.6, 0.5); await page.waitForTimeout(900)
await toJuly(); figures.z050 = { ...(await measure()), boxes: n }; await shot('q2-b-out-050', await gridClip())
n = await setZoom(0.5, 0.41); await page.waitForTimeout(900)
await toJuly(); figures.z041 = { ...(await measure()), boxes: n }; await shot('q2-c-out-041-month', await gridClip())
n = await setZoom(0.41, 0.6); await page.waitForTimeout(600)                            // back to the app's own 0.6

/* ---- Q3: how far in ---- */
await page.tap(T('lw-zoom-in')); await page.waitForTimeout(500)
await page.tap(T('lw-zoom-in')); await page.waitForTimeout(500)
await page.tap(T('lw-zoom-in')); await page.waitForTimeout(500)
await page.tap(T('lw-zoom-in')); await page.waitForTimeout(800)                          // 1.4 — the real button
await toJuly(); figures.z140 = await measure(); await shot('q3-a-in-140-today', await gridClip())
n = await setZoom(1.4, 2); await page.waitForTimeout(900)
await toJuly(); figures.z200 = { ...(await measure()), boxes: n }; await shot('q3-b-in-200', await gridClip())
n = await setZoom(2, 1.4); await page.waitForTimeout(600)
await page.tap(T('lw-zoom-out')); await page.waitForTimeout(400)
await page.tap(T('lw-zoom-out')); await page.waitForTimeout(400)
await page.tap(T('lw-zoom-out')); await page.waitForTimeout(600)                         // back to 0.8

/* ---- the grid's bar: the − / + that go once the pinch is proven (D1276) ---- */
{
  const z = await rect(T('lw-zoom')), bar = await rect(T('counts-toggle'))
  await mark([{ x: z.x - 4, y: z.y - 4, w: z.w + 8, h: z.h + 8, c: '#ffb454', t: 'Go once the pinch holds (D1276)', lr: 1, ly: z.y + z.h + 8 }])
  await shot('q0-zoom-buttons-bar', { x: 0, y: bar.y - 14, width: 402, height: 80 })
  await unmark()
}

/* ---- Q4: the OIL tab has − / + of its own ---- */
await page.tap(T('oil-tracker')); await page.waitForTimeout(1000)
{
  const btns = await page.evaluate(() => [...document.querySelectorAll('#page-leavewar button')].filter(b => /^[−＋+-]$/.test((b.textContent || '').trim()) && b.getBoundingClientRect().width > 0).map(b => { const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } }).filter(q => q.y < 140).sort((a, c) => a.x - c.x).slice(0, 2))
  if (btns.length >= 2) {
    const x0 = Math.min(...btns.map(q => q.x)), x1 = Math.max(...btns.map(q => q.x + q.w)), y0 = Math.min(...btns.map(q => q.y)), y1 = Math.max(...btns.map(q => q.y + q.h))
    figures.oilZoomButtons = { x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0) }
    await mark([{ x: x0 - 4, y: y0 - 4, w: x1 - x0 + 8, h: y1 - y0 + 8, c: '#ffb454', t: 'The OIL tab’s own − / +', lr: 1, ly: y1 + 8 }])
  } else figures.oilZoomButtons = 'not found'
  await shot('q4-oil-tab-zoom-buttons')
  await unmark()
}

/* ---- his recording: turned upright, cropped, marked ---- */
if (REC) {
  const frame = async (file, rotate, crop, boxes, name) => {
    const data = 'data:image/jpeg;base64,' + readFileSync(path.join(REC, file)).toString('base64')
    const png = await page.evaluate(async ([src, rot, cr, bs]) => {
      const img = new Image(); img.src = src; await img.decode()
      const c = document.createElement('canvas')
      const w = rot ? img.height : img.width, h = rot ? img.width : img.height
      c.width = w; c.height = h
      const g = c.getContext('2d')
      if (rot) { g.translate(w / 2, h / 2); g.rotate(rot * Math.PI / 180); g.drawImage(img, -img.width / 2, -img.height / 2) } else g.drawImage(img, 0, 0)
      const o = document.createElement('canvas'); o.width = cr.w; o.height = cr.h
      const og = o.getContext('2d'); og.drawImage(c, cr.x, cr.y, cr.w, cr.h, 0, 0, cr.w, cr.h)
      for (const m of bs) {
        og.lineWidth = 6; og.strokeStyle = m.c; og.strokeRect(m.x, m.y, m.w, m.h)
        if (m.t) { og.font = '700 34px -apple-system, system-ui, sans-serif'; const tw = og.measureText(m.t).width; og.fillStyle = m.c; og.fillRect(m.x, m.y + m.h + 8, tw + 20, 46); og.fillStyle = '#0b0f14'; og.fillText(m.t, m.x + 10, m.y + m.h + 43) }
      }
      return o.toDataURL('image/png')
    }, [data, rotate, crop, boxes])
    const { writeFileSync } = await import('node:fs')
    writeFileSync(path.join(OUT, name + '.png'), Buffer.from(png.split(',')[1], 'base64'))
  }
  const spec = JSON.parse(process.env.REC_SPEC || '[]')
  for (const s of spec) await frame(s.file, s.rotate, s.crop, s.boxes, s.name)
}

console.log(JSON.stringify({ figures, errs }, null, 1))
await b.close()
