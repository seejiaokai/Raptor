// The drawing check's shared parts (D1494, 29 Oct 26): serving a built folder inside the test browser, and the ONE
// measure both sides use — the drawing when its script takes its picture (record.mjs), the build when the check
// reaches the same screen (check.mjs). One measure for both, so a difference is the screen's, never the ruler's.
import { createRequire } from 'node:module'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'

const require = createRequire(new URL('../../package.json', import.meta.url))
export const { chromium } = require('@playwright/test')
// the repo's own browser fallback (playwright.config.ts): a fixed browser only where the container has one
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}

// The two sizes every drawing is checked at: his PC (1920 × 1080 at 125% — 1536 × 864 of page at 1.25) and his
// iPhone (402 × 874 at 3). A state may name its own, but these are the defaults.
export const SIZES = {
  desk: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25, hasTouch: false, isMobile: false },
  phone: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true },
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.json': 'application/json', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' }

// Serve a built folder (`dist`) at an origin from inside the browser, `index.html` as the fallback — no second server
// holds a port (walk-scripts.md §8). The app's test hooks answer only on localhost, so the origin is a localhost one.
export async function serveDist(ctx, origin, dist) {
  const root = resolve(dist)
  if (!existsSync(join(root, 'index.html'))) throw new Error('no built index.html in ' + root)
  await ctx.route(origin.replace(/\/$/, '') + '/**', route => {
    const u = new URL(route.request().url())
    let f = join(root, decodeURIComponent(u.pathname))
    if (!f.startsWith(root) || !existsSync(f) || statSync(f).isDirectory()) f = join(root, 'index.html')
    return route.fulfill({ status: 200, body: readFileSync(f), headers: { 'content-type': TYPES[extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' } })
  })
}

// How far two pictures differ: the share of pixels whose colour differs by more than `tol` in any channel, and the box
// that holds them. Read in a blank page's canvas, so no picture library is needed. Proves a replayed drawing is the
// approved picture (a replay that drew something else would measure the wrong drawing with no error).
export async function pictureDiff(browser, fileA, fileB, tol = 24) {
  const ctx = await browser.newContext(), page = await ctx.newPage()
  const url = f => 'data:image/png;base64,' + readFileSync(f).toString('base64')
  const r = await page.evaluate(async ([a, b, tol]) => {
    const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src })
    const [A, B] = await Promise.all([load(a), load(b)])
    if (A.width !== B.width || A.height !== B.height) return { same: false, why: `sizes differ: ${A.width}×${A.height} and ${B.width}×${B.height}` }
    const px = img => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, c.width, c.height).data }
    const da = px(A), db = px(B); let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1
    for (let i = 0; i < da.length; i += 4) {
      if (Math.abs(da[i] - db[i]) > tol || Math.abs(da[i + 1] - db[i + 1]) > tol || Math.abs(da[i + 2] - db[i + 2]) > tol) {
        n++; const p = i / 4, x = p % A.width, y = (p / A.width) | 0
        if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y
      }
    }
    return { same: n === 0, share: n / (A.width * A.height), pixels: n, where: n ? [x0, y0, x1, y1] : null, size: [A.width, A.height] }
  }, [url(fileA), url(fileB), tol])
  await ctx.close()
  return r
}

// ---------------------------------------------------------------- the measure (runs in the page)
// parts: [{ name, sel, nth }] — `sel` a CSS selector, `nth` which VISIBLE match (a box wider than zero; the app keeps
// hidden copies). For each: its box, the box of the words it draws (the parts with a width, never innerText —
// walk-scripts.md §4), its words, and the look the eye compares: fill, edges, corners, text alignment, letters.
export function measureParts(parts) {
  const vis = e => { const r = e.getBoundingClientRect(); if (r.width <= 0 || r.height <= 0) return false; const s = getComputedStyle(e); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0 }
  const R = r => ({ x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 })
  const out = {}
  for (const p of parts) {
    let all = []
    try { all = [...document.querySelectorAll(p.sel)].filter(vis) } catch (e) { out[p.name] = { found: false, why: 'bad selector: ' + e.message }; continue }
    const el = all[p.nth || 0]
    if (!el) { out[p.name] = { found: false, count: all.length, why: `no visible match (${all.length} visible) for ${p.sel}` }; continue }
    // the words drawn: every text node under it whose own element has a width, unioned
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    let t, ink = null; const words = []
    while ((t = tw.nextNode())) {
      if (!t.textContent.trim()) continue
      const pe = t.parentElement; if (!pe || !vis(pe)) continue
      const pr = pe.getBoundingClientRect(); if (pr.width <= 1) continue
      const rg = document.createRange(); rg.selectNodeContents(t)
      for (const r of rg.getClientRects()) {
        if (r.width <= 0) continue
        ink = ink ? { l: Math.min(ink.l, r.left), t: Math.min(ink.t, r.top), r: Math.max(ink.r, r.right), b: Math.max(ink.b, r.bottom) } : { l: r.left, t: r.top, r: r.right, b: r.bottom }
      }
      words.push(t.textContent.replace(/\s+/g, ' ').trim())
    }
    const s = getComputedStyle(el)
    // a typed box's words are drawn from its value, which no text node holds: their place is worked out from the box,
    // its padding and edge, its letters' measured width and its setting (left, centre, right)
    if (!ink && /^(INPUT|TEXTAREA)$/.test(el.tagName) && el.value) {
      const cv = measureParts.cv || (measureParts.cv = document.createElement('canvas')), g = cv.getContext('2d')
      g.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`
      const tw = g.measureText(el.value).width, r = el.getBoundingClientRect()
      const L = r.left + parseFloat(s.borderLeftWidth) + parseFloat(s.paddingLeft), Rr = r.right - parseFloat(s.borderRightWidth) - parseFloat(s.paddingRight)
      const al = s.textAlign
      const x = /right|end/.test(al) ? Rr - tw : /center/.test(al) ? (L + Rr - tw) / 2 : L
      const fs = parseFloat(s.fontSize)
      ink = { l: x, r: x + tw, t: r.top + (r.height - fs * 1.2) / 2, b: r.top + (r.height + fs * 1.2) / 2 }
    }
    const sides = ['Top', 'Right', 'Bottom', 'Left']
    out[p.name] = {
      found: true, count: all.length,
      box: R(el.getBoundingClientRect()),
      ink: ink ? R({ left: ink.l, top: ink.t, width: ink.r - ink.l, height: ink.b - ink.t }) : null,
      // a typed box's words stand in its value, which no text node holds (walk-scripts.md §4)
      text: (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) ? (el.tagName === 'SELECT' ? el.selectedOptions[0]?.textContent || '' : el.value) + ' ' : '') + words.join(' ').replace(/\s+/g, ' ').trim(),
      typed: /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName),
      look: {
        fill: s.backgroundColor, image: s.backgroundImage === 'none' ? '' : s.backgroundImage.slice(0, 120),
        edge: sides.map(k => `${parseFloat(s['border' + k + 'Width']) || 0}px ${s['border' + k + 'Style']} ${s['border' + k + 'Color']}`),
        corners: [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius],
        shadow: s.boxShadow, color: s.color, align: s.textAlign, justify: s.justifyContent,
        font: `${s.fontWeight} ${s.fontSize}`, spacing: s.letterSpacing,
      },
      tag: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 4).join('.') : ''),
    }
  }
  return { viewport: { w: innerWidth, h: innerHeight }, dpr: devicePixelRatio, scroll: { x: scrollX, y: scrollY }, parts: out }
}
