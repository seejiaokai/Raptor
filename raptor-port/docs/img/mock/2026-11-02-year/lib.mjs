// Shared helpers for the 2 Nov 26 year mock-ups (D1559 [LW-YEAR-CLEAR], D1560 [CAL-MONTH-YEAR-JUMP]).
// Drawn on the real app; nothing in the app changes. Run from raptor-port/ against the build served on PORT.
import { webkit, chromium, devices } from '@playwright/test'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
export const PORT = process.env.PORT || 4243
export const OUT = path.resolve('docs/img/mock/2026-11-02-year')
export const RAW = path.join(OUT, 'raw')
mkdirSync(RAW, { recursive: true })
export const sleep = ms => new Promise(r => setTimeout(r, ms))

export async function open(dev) {
  const b = dev === 'phone' ? await webkit.launch() : await chromium.launch()
  const ctx = dev === 'phone'
    ? await b.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 })
    : await b.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 })
  const P = await ctx.newPage()
  P.on('pageerror', e => console.log(dev + ' page error: ' + String(e).slice(0, 160)))
  await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
  await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached' })
  return { b, P }
}

/* a neutral tap so no control is left hovered or focused (the mock-up guide's trap) */
export async function neutral(P) { await P.evaluate(() => { document.activeElement?.blur?.() }) }

/* a clip of the page, given a box in CSS px, clamped to the viewport */
export async function clip(P, name, box) {
  const vw = await P.evaluate(() => [innerWidth, innerHeight])
  const x = Math.max(0, Math.floor(box.x)), y = Math.max(0, Math.floor(box.y))
  const w = Math.min(vw[0] - x, Math.ceil(box.w)), h = Math.min(vw[1] - y, Math.ceil(box.h))
  const file = path.join(RAW, name)
  await P.screenshot({ path: file, clip: { x, y, width: w, height: h } })
  return file
}

/* lay pictures side by side (or stacked) with a heading and a caption over each — the page he reads */
export async function compose(file, { title, sub, items, dpr = 2, stack = false, colW }) {
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: 400, height: 300 }, deviceScaleFactor: dpr })
  const P = await ctx.newPage()
  const { readFileSync } = await import('node:fs')
  const imgs = items.map(it => {
    const data = readFileSync(it.src).toString('base64')
    return `<figure><figcaption><b>${it.tag}</b>${it.cap ? ' — ' + it.cap : ''}</figcaption><img src="data:image/png;base64,${data}" style="width:${it.w}px"></figure>`
  }).join('')
  await P.setContent(`<!doctype html><html><head><style>
    body{margin:0;background:#0b0f14;color:#e7ecf1;font:14px/1.35 -apple-system,'Segoe UI',Arial,sans-serif;padding:16px;display:inline-block}
    h1{font-size:17px;margin:0 0 4px} p.sub{margin:0 0 12px;color:#9aa6b2;max-width:${stack ? 1100 : 900}px}
    .row{display:flex;gap:18px;align-items:flex-start;${stack ? 'flex-direction:column' : ''}}
    figure{margin:0;${colW ? `width:${colW}px` : ''}} figcaption{margin:0 0 6px;color:#c9d2db;max-width:${colW || 520}px} figcaption b{color:#ffd400}
    img{display:block;border:1px solid #2a333d;border-radius:6px}
  </style></head><body><h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}<div class="row">${imgs}</div></body></html>`)
  await P.waitForTimeout(200)
  const el = await P.$('body')
  await el.screenshot({ path: file })
  await b.close()
  console.log('wrote', path.basename(file))
}
