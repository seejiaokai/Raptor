// k-lib - the third round's presser ([MSQ-PICK-GUARD], chat 176, 25 Nov 26): shared helpers for k1-k8.
// Re-uses chat 175's helpers (n175/p6-lib.mjs, n175/lib.mjs, n166/lib.mjs - read only) for sign-in, presses, give,
// fileInput, the bell and storage readers. Adds: the two sizes of this brief at deviceScaleFactor 1 (d = desktop Chromium
// 1536x864; p = phone WebKit 402x874 touch; t = tablet WebKit 768x1024 touch), the picture pair saved to
// docs/mock/2026-11-25-msq-pick-guard-q3/today/k<n>-<size>-<step>.png (+ -crop), and the three-squadron world (his D2630)
// built once by the app's own controls (k0-world.mjs) and copied into each fresh browser (Playwright's storage copy).
// Run any script from the repo root: node raptor-port/scripts/handpass/n176/k<n>-<what>.mjs [d|p]
import { mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
export { FACT, note, signIn, go, wait, vis, barSq, pageOn, roleNow, toastNow, bands, windowsNow, overlaysNow, covered, boxOf, reachPick, reachView, tapCentre, tapAt, shut, give, usersTab, typeIn, fileInput, saveInput, editRemarks, toList, relog, snap, changed, tapBell, bellLit, bellLines, closeBell, LIST, winFacts, state } from '../n175/p6-lib.mjs'
import { note, wait } from '../n175/p6-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
const { chromium, webkit } = createRequire(resolve(ROOT, 'package.json'))('playwright')
export const PICS = resolve(ROOT, 'docs/mock/2026-11-25-msq-pick-guard-q3/today')
export const TMP = resolve(ROOT, '.tmp/n176')
mkdirSync(PICS, { recursive: true }); mkdirSync(TMP, { recursive: true })
export const SIZES = {
  d: { desk: true, w: 1536, h: 864, eng: 'chromium' },
  w1000: { desk: true, w: 1000, h: 864, eng: 'chromium' },
  p: { desk: false, w: 402, h: 874, eng: 'webkit' },
  t: { desk: false, w: 768, h: 1024, eng: 'webkit' },
}
const browsers = {}
export async function mk(sz, { storageState } = {}) {
  const S = SIZES[sz]; if (!S) throw new Error('unknown size ' + sz)
  if (!browsers[S.eng]) browsers[S.eng] = await (S.eng === 'webkit' ? webkit : chromium).launch()
  const opts = S.desk ? { viewport: { width: S.w, height: S.h }, deviceScaleFactor: 1 }
    : { viewport: { width: S.w, height: S.h }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }
  const ctx = await browsers[S.eng].newContext({ ...opts, ...(storageState ? { storageState } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log(`PAGEERROR ${String(e).slice(0, 200)}`))
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); (d.type() === 'beforeunload' ? d.accept() : d.dismiss()).catch(() => {}) })
  return { ctx, page, sz, desk: S.desk, W: S.w, H: S.h }
}
export async function closeAll() { for (const k of Object.keys(browsers)) { await browsers[k].close().catch(() => {}); delete browsers[k] } }
/* the DECIDING picture pair: `<name>.png` whole, `<name>-crop.png` cut to cropSels (default the ringed things); the
   ringed things outlined 3px #e6007e just before the picture and removed after */
export async function shot(s, name, ringSels = [], cropSels = null, pad = 30) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(200)
  const boxes = sels => page.evaluate(sels => { const out = []; for (const sel of sels) for (const e of document.querySelectorAll(sel)) { const b = e.getBoundingClientRect(); if (b.width > 0 && b.height > 0 && b.bottom > 0 && b.top < innerHeight) { out.push({ L: b.left, T: b.top, R: b.right, B: b.bottom }); break } } return out }, sels)
  const rects = await boxes(ringSels)
  await page.evaluate(rs => { for (const r of rs) { const d = document.createElement('div'); d.className = '__n176ring'; Object.assign(d.style, { position: 'fixed', left: (r.L - 4) + 'px', top: (r.T - 4) + 'px', width: (r.R - r.L + 8) + 'px', height: (r.B - r.T + 8) + 'px', outline: '3px solid #e6007e', zIndex: 2147483647, pointerEvents: 'none' }); document.body.appendChild(d) } }, rects)
  await page.screenshot({ path: `${PICS}/${name}.png` })
  const crop = cropSels ? await boxes(cropSels) : rects
  if (crop.length) {
    const L = Math.max(0, Math.min(...crop.map(r => r.L)) - pad), T = Math.max(0, Math.min(...crop.map(r => r.T)) - pad)
    const R = Math.min(s.W, Math.max(...crop.map(r => r.R)) + pad), B = Math.min(s.H, Math.max(...crop.map(r => r.B)) + pad)
    if (R - L >= 20 && B - T >= 20) await page.screenshot({ path: `${PICS}/${name}-crop.png`, clip: { x: L, y: T, width: R - L, height: B - T } })
  }
  await page.evaluate(() => document.querySelectorAll('.__n176ring').forEach(e => e.remove()))
  note('picture', `${name}.png` + (crop.length ? ' + -crop' : ''))
  return name
}
export async function scratch(s, name) { await s.page.screenshot({ path: `${TMP}/${name}.png` }); note('scratch', name) }
/* the browser's saved data as a map; the keys a press changed (all keys, nothing filtered) */
export const store = s => s.page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k) } return o })
export const diffKeys = (a, b) => Object.keys({ ...a, ...b }).filter(k => a[k] !== b[k])
/* the world (his D2630) - built by k0-world.mjs, re-built by it when missing */
export const WORLD = `${TMP}/state-world.json`
export async function world() {
  if (!existsSync(WORLD) || process.env.FRESH) { const { buildWorld } = await import('./k0-world.mjs'); await buildWorld() }
  return WORLD
}
export const tag = s => (s.desk ? 'd' : 'p')
/* a press as a person makes it: the mouse on a desktop; on a touch screen a finger at the control's middle (scrolled
   into view first, as a person scrolls to it) - Playwright's own tap waits on WebKit for checks a finger never makes */
export async function hit(s, l, ms = 450) {
  l = typeof l === 'string' ? s.page.locator(l).filter({ visible: true }).first() : l
  if (!(await l.count())) throw new Error('no control to press: ' + l)
  if (s.desk) {
    await l.scrollIntoViewIfNeeded().catch(() => {})
    /* Playwright's own click waits on checks a mouse never makes (a box still moving): then the mouse at its middle */
    try { await l.click({ timeout: 4000 }) } catch { const b = await l.boundingBox(); await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  }
  else {
    await l.evaluate(e => { const r = e.getBoundingClientRect(); if (r.top < 60 || r.bottom > innerHeight - 10) e.scrollIntoView({ block: 'center' }) })
    await s.page.waitForTimeout(150)
    const b = await l.boundingBox(); await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  }
  await s.page.waitForTimeout(ms)
}
export const step = (k, w) => console.log(`  step ${k}: ${w}`)
