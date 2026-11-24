// n175 - [MSQ-PICK-GUARD] the second questions page (chat 175, 25 Nov 26): shared helpers for the four pressers.
// Re-exports chat 166's helpers (../n166/lib.mjs, read only) and adds: the four sizes of this brief (d, p, ps, t - the
// phone sizes WebKit with touch, as n166's mid-e1 did), the picture pair (whole screen + a crop, the thing ringed
// 3px #e6007e by the script just before the picture and removed after), and the scratch folder per section.
// Run any script from the repo root: node raptor-port/scripts/handpass/n175/<section>-<case>.mjs <d|p|ps|t>
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
export { FACT, note, die, signIn, press, covered, boxOf, bands, barSq, pageOn, go, shut, pickSq, URL_, windowsNow, overlaysNow, roleNow, tapAt, tapCentre, reachPick, reachView, wait } from '../n166/lib.mjs'
import { note } from '../n166/lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
const { chromium, webkit } = createRequire(resolve(ROOT, 'package.json'))('playwright')
export const PICS = resolve(ROOT, 'docs/mock/2026-11-25-msq-pick-guard-q2/today')
mkdirSync(PICS, { recursive: true })
export const tmpDir = section => { const d = resolve(ROOT, '.tmp/n175', section); mkdirSync(d, { recursive: true }); return d }
export const SIZES = {
  d: { desk: true, w: 1536, h: 864, eng: 'chromium' },
  p: { desk: false, w: 402, h: 874, eng: 'webkit' },
  ps: { desk: false, w: 874, h: 402, eng: 'webkit' },
  t: { desk: false, w: 768, h: 1024, eng: 'webkit' },
}
const browsers = {}
export async function mk(sz, { storageState } = {}) {
  const S = SIZES[sz]; if (!S) throw new Error('unknown size ' + sz + ' (d, p, ps, t)')
  if (!browsers[S.eng]) browsers[S.eng] = await (S.eng === 'webkit' ? webkit : chromium).launch()
  const opts = S.desk ? { viewport: { width: S.w, height: S.h }, deviceScaleFactor: 2 }
    : { viewport: { width: S.w, height: S.h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  const ctx = await browsers[S.eng].newContext({ ...opts, ...(storageState ? { storageState } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log(`PAGEERROR ${String(e).slice(0, 200)}`))
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); (d.type() === 'beforeunload' ? d.accept() : d.dismiss()).catch(() => {}) })
  return { ctx, page, sz, desk: S.desk, W: S.w, H: S.h }
}
export async function closeAll() { for (const k of Object.keys(browsers)) { await browsers[k].close().catch(() => {}); delete browsers[k] } }
export const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
/* a press on a control as a person makes it (scrolled into view where needed - the page's own scroll) */
export async function hit(s, l, ms = 400) {
  l = typeof l === 'string' ? vis(s, l).first() : l
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 })
  await s.page.waitForTimeout(ms)
}
/* THE DECIDING PICTURE: the whole screen `<name>.png` and the crop `<name>-crop.png`, the thing in question ringed
   (3px #e6007e outline drawn just before, removed after). `ringSels` - what to ring; `cropSels` - what the crop is cut to
   (default: the ringed things), `pad` around the crop. */
export async function shot(s, name, ringSels = [], cropSels = null, pad = 40) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(200)
  /* the first ringed thing brought into view where it is off screen (the page's own scroll, as a person would) */
  await page.evaluate(sels => { for (const sel of sels) { const e = [...document.querySelectorAll(sel)].find(n => n.getBoundingClientRect().width > 0); if (!e) continue; const b = e.getBoundingClientRect(); if (b.top < 0 || b.bottom > innerHeight) e.scrollIntoView({ block: 'center' }); return } }, ringSels).catch(() => {})
  await page.waitForTimeout(150)
  const rects = await page.evaluate(sels => {
    const out = []
    for (const sel of sels) for (const e of document.querySelectorAll(sel)) { const b = e.getBoundingClientRect(); if (b.width > 0 && b.height > 0) { out.push({ L: b.left, T: b.top, R: b.right, B: b.bottom }); break } }
    return out
  }, ringSels)
  await page.evaluate(rs => { for (const r of rs) { const d = document.createElement('div'); d.className = '__n175ring'; Object.assign(d.style, { position: 'fixed', left: (r.L - 4) + 'px', top: (r.T - 4) + 'px', width: (r.R - r.L + 8) + 'px', height: (r.B - r.T + 8) + 'px', outline: '3px solid #e6007e', zIndex: 2147483647, pointerEvents: 'none' }); document.body.appendChild(d) } }, rects)
  await page.screenshot({ path: `${PICS}/${name}.png` })
  let crop = cropSels ? await page.evaluate(sels => { const out = []; for (const sel of sels) for (const e of document.querySelectorAll(sel)) { const b = e.getBoundingClientRect(); if (b.width > 0 && b.height > 0) { out.push({ L: b.left, T: b.top, R: b.right, B: b.bottom }); break } } return out }, cropSels) : rects
  if (crop.length) {
    const L = Math.max(0, Math.min(...crop.map(r => r.L)) - pad), T = Math.max(0, Math.min(...crop.map(r => r.T)) - pad)
    const R = Math.min(s.W, Math.max(...crop.map(r => r.R)) + pad), B = Math.min(s.H, Math.max(...crop.map(r => r.B)) + pad)
    if (R - L >= 20 && B - T >= 20) await page.screenshot({ path: `${PICS}/${name}-crop.png`, clip: { x: L, y: T, width: R - L, height: B - T } })
    else crop = []
  }
  await page.evaluate(() => document.querySelectorAll('.__n175ring').forEach(e => e.remove()))
  note('picture', `${name}.png` + (crop.length ? ` + -crop` : ' (no crop: nothing to ring)'))
  return `${name}.png`
}
/* a scratch picture (not in the repo) */
export async function scratch(s, section, name) { await s.page.screenshot({ path: `${tmpDir(section)}/${name}.png` }); note('scratch', name) }
/* the grey passing note / toast, as drawn now */
export const toastNow = s => s.page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return ''; const c = getComputedStyle(t); return c.opacity === '0' || c.display === 'none' || c.visibility === 'hidden' ? '' : t.innerText.replace(/\s+/g, ' ').trim() }).catch(() => '')
