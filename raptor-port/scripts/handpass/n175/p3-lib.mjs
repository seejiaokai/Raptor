// p3-lib - [MSQ-PICK-GUARD] the second questions page, presser P3 (chat 175, 25 Nov 26): where the grey "Blocked:" note
// stands, and Logout. Shared helpers for p3-*.mjs only. Reuses chat 166's helpers (../n166/lib.mjs, read only); its own
// browser maker gives the sizes this section names: d = Chromium 1536x864; p = WebKit 402x874 touch; ps = WebKit 874x402
// touch (a phone on its side); t = WebKit 768x1024 touch (a small tablet upright) - all at deviceScaleFactor 2.
// Pictures: deciding ones to docs/mock/2026-11-25-msq-pick-guard-q2/today/ (whole + -crop, the thing ringed in #e6007e);
// every other one to .tmp/n175/p3/. Nothing here writes the app.
import { chromium, webkit } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
export { FACT, note, signIn, press, covered, boxOf, bands, barSq, pageOn, go, shut, URL_ } from '../n162/lib.mjs'
export { windowsNow, roleNow, wait } from '../n166/lib.mjs'
import { note } from '../n162/lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
export const PICS = resolve(HERE, '../../../docs/mock/2026-11-25-msq-pick-guard-q2/today')
export const TMP = resolve(HERE, '../../../.tmp/n175/p3')
mkdirSync(PICS, { recursive: true }); mkdirSync(TMP, { recursive: true })

const SIZES = {
  d: { eng: 'chromium', desk: true, w: 1536, h: 864 },
  p: { eng: 'webkit', desk: false, w: 402, h: 874 },
  ps: { eng: 'webkit', desk: false, w: 874, h: 402 },
  t: { eng: 'webkit', desk: false, w: 768, h: 1024 },
}
const browsers = {}
export async function mk(sz) {
  const S = SIZES[sz]; if (!S) throw new Error('unknown size ' + sz + ' (d, p, ps, t)')
  if (!browsers[S.eng]) browsers[S.eng] = await (S.eng === 'webkit' ? webkit : chromium).launch()
  const opts = S.desk ? { viewport: { width: S.w, height: S.h }, deviceScaleFactor: 2 }
    : { viewport: { width: S.w, height: S.h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  const ctx = await browsers[S.eng].newContext(opts)
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log(`PAGEERROR ${String(e).slice(0, 200)}`))
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); (d.type() === 'beforeunload' ? d.accept() : d.dismiss()).catch(() => {}) })
  return { ctx, page, sz, desk: S.desk, W: S.w, H: S.h }
}
export async function closeAll() { for (const b of Object.values(browsers)) await b.close().catch(() => {}) }

export const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
const w8 = (s, ms) => s.page.waitForTimeout(ms)
/* a press as a person makes it: a mouse click on a desktop, a finger tap elsewhere */
export async function hit(s, sel, ms = 400) {
  const l = typeof sel === 'string' ? vis(s, sel).first() : sel
  if (!(await l.count())) throw new Error('no control ' + sel)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 })
  await w8(s, ms)
}
export async function tapAt(s, x, y, ms = 450) { if (s.desk) await s.page.mouse.click(x, y); else await s.page.touchscreen.tap(x, y); await w8(s, ms) }
/* words into a box: a desktop types them; a touch size sets them through the box's own input event (typing on an
   emulated phone zooms the page to the box - chat 166's draw-lib trap) */
export async function typeWords(s, sel, words) {
  const r = typeof sel === 'string' ? vis(s, sel).first() : sel
  if (!(await r.count())) return null
  if (s.desk) { await r.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(words) }
  else await r.evaluate((e, w) => { const proto = Object.getPrototypeOf(e); const set = Object.getOwnPropertyDescriptor(proto, 'value').set; set.call(e, w); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) }, words)
  await w8(s, 300)
  return r.inputValue().catch(() => null)
}
/* a picture, not deciding: .tmp */
export async function scratch(s, name) {
  if (s.desk) await s.page.mouse.move(1, 1).catch(() => {})
  await w8(s, 150); await s.page.screenshot({ path: `${TMP}/${name}.png` }); note('scratch picture', `${name}.png`)
}
/* a DECIDING picture: the whole screen and a crop, each with a 3px #e6007e ring round the thing in question (drawn just
   before, removed after). `ringSel` - one selector or a list (each first visible match ringed); `cropSels` - what the crop
   is cut to (the ringed things if not given). */
export async function decide(s, name, ringSel, cropSels, pad = 16) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  const rings = Array.isArray(ringSel) ? ringSel : (ringSel ? [ringSel] : [])
  const boxes = await page.evaluate(sels => {
    const out = []
    for (const sel of sels) {
      const e = [...document.querySelectorAll(sel)].find(n => { const r = n.getBoundingClientRect(); const c = getComputedStyle(n); return r.width > 1 && r.height > 1 && c.visibility !== 'hidden' && c.opacity !== '0' })
      if (!e) continue
      const r = e.getBoundingClientRect(), d = document.createElement('div')
      d.className = '__n175ring'
      Object.assign(d.style, { position: 'fixed', left: (r.left - 4) + 'px', top: (r.top - 4) + 'px', width: (r.width + 8) + 'px', height: (r.height + 8) + 'px', outline: '3px solid #e6007e', zIndex: 2147483647, pointerEvents: 'none' })
      document.body.appendChild(d); out.push({ sel, x: r.left, y: r.top, w: r.width, h: r.height })
    }
    return out
  }, rings)
  await w8(s, 150)
  await page.screenshot({ path: `${PICS}/${name}.png` })
  let clip
  const cs = cropSels || rings
  if (cs.length) {
    const r = await page.evaluate(sels => {
      let L = 1e9, T = 1e9, R = -1e9, B = -1e9
      for (const sel of sels) { const e = [...document.querySelectorAll(sel)].find(n => { const b = n.getBoundingClientRect(); const c = getComputedStyle(n); return b.width > 1 && b.height > 1 && c.visibility !== 'hidden' && c.opacity !== '0' }); if (!e) continue; const b = e.getBoundingClientRect(); L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.right); B = Math.max(B, b.bottom) }
      return L < 1e9 ? { L, T, R, B, W: innerWidth, H: innerHeight } : null
    }, cs)
    if (r) { const x = Math.max(0, r.L - pad), y = Math.max(0, r.T - pad); clip = { x, y, width: Math.max(10, Math.min(r.W, r.R + pad) - x), height: Math.max(10, Math.min(r.H, r.B + pad) - y) } }
  }
  await page.screenshot({ path: `${PICS}/${name}-crop.png`, ...(clip ? { clip } : {}) })
  await page.evaluate(() => document.querySelectorAll('.__n175ring').forEach(e => e.remove()))
  note('deciding picture', `${name}.png`, `${name}-crop.png`, { ringed: boxes.map(b => b.sel) })
  return boxes
}

/* the openers this section needs, each by the app's own controls (chat 166's win-a and mid-e1 ways) */
export async function inputsList(s) {
  const { page } = s
  const { go } = await import('../n162/lib.mjs')
  await go(s, 'inputs'); await w8(s, 600)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  if (!/All dates/.test(((await page.locator('#inRangeBtn').first().textContent().catch(() => '')) || '').trim())) {
    if (!(await vis(s, '#inRangeAll').count())) await hit(s, '#inRangeBtn')
    if (await page.locator('#inRangeAll').count()) await hit(s, page.locator('#inRangeAll').first())
    if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn')
  }
}
export async function openInput(s, words) {
  await inputsList(s)
  const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').first()
  const who = (await row.innerText()).replace(/\s+/g, ' ').trim().slice(0, 40)
  const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
  const typed = words ? await typeWords(s, '#inpEditRmk', words) : null
  return { who, typed }
}
export const tid = t => `[data-testid="${t}"]`
export async function openMyLeave(s) {
  const { go } = await import('../n162/lib.mjs')
  await go(s, 'leavewar'); await s.page.waitForSelector(tid('my-leave'), { timeout: 15000 }); await hit(s, tid('my-leave'), 700)
}
export async function openInputsGear(s) {
  const { go } = await import('../n162/lib.mjs')
  await go(s, 'inputs'); await hit(s, '#inGear', 600)
}
export async function openCalendar(s) {
  const { go } = await import('../n162/lib.mjs')
  await go(s, 'inputs'); await hit(s, '#inGear', 500); await hit(s, tid('iset-days'), 700)
}
/* Leave War "Place a bid": December, a cell of 15 Dec pressed (the first report's lw-day) */
export async function openPlaceBid(s) {
  const { go } = await import('../n162/lib.mjs')
  await go(s, 'leavewar'); await s.page.waitForSelector(tid('month-strip'), { timeout: 15000 }); await w8(s, 500)
  const w = vis(s, tid('war-picker')); if (await w.count() && (await w.first().inputValue()) !== 'y2026') { await s.page.selectOption(tid('war-picker'), 'y2026'); await w8(s, 500) }
  if (await vis(s, tid('month-DEC')).count()) await hit(s, tid('month-DEC'), 600)
  const c = s.page.locator('[data-testid^="cell-"][data-testid$="-2026-12-15"]').first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await w8(s, 250)
  if (s.desk) await c.click(); else await c.tap(); await w8(s, 700)
}
export async function closeAllBrowsers() { return closeAll() }
