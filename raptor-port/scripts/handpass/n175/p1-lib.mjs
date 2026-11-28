// p1-lib - presser P1's own helpers (chat 175, [MSQ-PICK-GUARD] second questions page, 25 Nov 26).
// Re-uses chat 166's helpers (n166/lib.mjs, which re-exports chat 162's) for the presses, the covered-check, the squadron
// and view reach. Adds: a browser per size as the brief names it (desktop Chromium 1536×864; phone WebKit 402×874, touch),
// both at deviceScaleFactor 2; the deciding pictures (whole + crop, the thing ringed in #e6007e) saved to
// docs/mock/2026-11-25-msq-pick-guard-q2/today/, every other picture to .tmp/n175/p1/. Nothing here writes the app.
import { chromium, webkit } from '@playwright/test'
import { mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
export { FACT, note, signIn, covered, boxOf, bands, barSq, pageOn, go, shut, windowsNow, overlaysNow, roleNow, reachPick, reachView, wait, tapCentre, tapAt } from '../n166/lib.mjs'
import { note, wait } from '../n166/lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
export const Q2 = resolve(HERE, '../../../docs/mock/2026-11-25-msq-pick-guard-q2/today')
export const TMP = resolve(HERE, '../../../.tmp/n175/p1')
mkdirSync(Q2, { recursive: true }); mkdirSync(TMP, { recursive: true })
export const URL_ = 'http://localhost:4700/'

/* d = desktop Chromium 1536×864; p = phone WebKit 402×874 touch (402x874 accepted for p) */
export const normSz = a => (a === 'p' || a === '402x874' ? 'p' : 'd')
const B = {}
export async function mk(sz) {
  sz = normSz(sz)
  const phone = sz === 'p'
  const kind = phone ? 'webkit' : 'chromium'
  if (!B[kind]) B[kind] = await (phone ? webkit : chromium).launch({ headless: true })
  const opts = phone ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 }
  const ctx = await B[kind].newContext(opts)
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log(`PAGEERROR ${String(e).slice(0, 200)}`))
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); (d.type() === 'beforeunload' ? d.accept() : d.dismiss()).catch(() => {}) })
  return { ctx, page, sz, desk: !phone, W: phone ? 402 : 1536, H: phone ? 874 : 864 }
}
export async function closeAll() { for (const k of Object.keys(B)) await B[k].close().catch(() => {}) }

const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
export { vis }
/* a press on a control as a person makes it (scrolls it into view first, as a person would scroll to it) */
export async function hit(s, sel, ms = 450) {
  const l = typeof sel === 'string' ? vis(s, sel).first() : sel
  if (!(await l.count())) throw new Error('no control ' + sel)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 })
  await wait(s, ms)
}
/* typing as a person types: a press in the box, then the keys */
export async function typeIn(s, sel, words) {
  const r = typeof sel === 'string' ? vis(s, sel).first() : sel
  if (!(await r.count())) return false
  await r.scrollIntoViewIfNeeded().catch(() => {})
  if (s.desk) await r.click({ timeout: 5000 }).catch(() => {}); else await r.tap({ timeout: 5000 }).catch(() => {})
  await s.page.keyboard.press(s.desk ? 'Control+a' : 'Meta+a').catch(() => {})
  /* WebKit's touch keyboard takes no select-all key: the box's words are selected as a long press would, then typed over */
  if (!s.desk) await r.evaluate(e => e.select && e.select()).catch(() => {})
  await s.page.keyboard.type(words); await wait(s, 250)
  return (await r.inputValue().catch(() => '')) === words
}
/* a value of the first shown box of a selector, or null */
export const valOf = (s, sel) => s.page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); return e ? e.value : null }, sel)

async function ring(s, sel) {
  return s.page.evaluate(sel => {
    let L = 1e9, T = 1e9, R = -1e9, Bm = -1e9
    for (const x of [].concat(sel)) for (const e of document.querySelectorAll(x)) { const b = e.getBoundingClientRect(); if (!(b.width > 1 && b.height > 1)) continue; L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.right); Bm = Math.max(Bm, b.bottom) }
    if (L >= 1e9) return null
    const d = document.createElement('div'); d.id = '__p1ring'
    Object.assign(d.style, { position: 'fixed', left: (L - 4) + 'px', top: (T - 4) + 'px', width: (R - L + 8) + 'px', height: (Bm - T + 8) + 'px', outline: '3px solid #e6007e', zIndex: 2147483647, pointerEvents: 'none' })
    document.body.appendChild(d)
    return { L, T, R, B: Bm, W: innerWidth, H: innerHeight }
  }, sel)
}
/* a DECIDING picture: whole screen + a crop to `cropSel` (default: the ringed thing), `ringSel` ringed in #e6007e */
export async function decide(s, name, ringSel, cropSel, pad = 40) {
  if (s.desk) await s.page.mouse.move(1, 1).catch(() => {})
  await wait(s, 200)
  const r = ringSel ? await ring(s, ringSel) : null
  await s.page.screenshot({ path: `${Q2}/${name}.png` })
  let c = r
  if (cropSel) c = await s.page.evaluate(sel => {
    let L = 1e9, T = 1e9, R = -1e9, Bm = -1e9
    for (const x of [].concat(sel)) for (const e of document.querySelectorAll(x)) { const b = e.getBoundingClientRect(); if (!(b.width > 1 && b.height > 1)) continue; L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.right); Bm = Math.max(Bm, b.bottom) }
    return L < 1e9 ? { L, T, R, B: Bm, W: innerWidth, H: innerHeight } : null
  }, cropSel).then(x => (x && r ? { L: Math.min(x.L, r.L), T: Math.min(x.T, r.T), R: Math.max(x.R, r.R), B: Math.max(x.B, r.B), W: x.W, H: x.H } : x || r))
  if (c) {
    const x = Math.max(0, c.L - pad), y = Math.max(0, c.T - pad)
    const clip = { x, y, width: Math.max(20, Math.min(c.W, c.R + pad) - x), height: Math.max(20, Math.min(c.H, c.B + pad) - y) }
    await s.page.screenshot({ path: `${Q2}/${name}-crop.png`, clip })
  }
  await s.page.evaluate(() => document.getElementById('__p1ring')?.remove())
  note('deciding picture', `${name}.png` + (c ? ` (+ -crop)` : ' (no crop: nothing to ring)'))
  return name
}
/* any other picture, outside the repo */
export async function scratch(s, name) {
  if (s.desk) await s.page.mouse.move(1, 1).catch(() => {})
  await wait(s, 150)
  await s.page.screenshot({ path: `${TMP}/${name}.png` })
  note('scratch picture', `${name}.png`)
}
/* the words of the app's own passing notes (toasts) drawn now */
export const notesNow = s => s.page.evaluate(() => [...document.querySelectorAll('.toast, #toastEl, [role=status], [role=alert], .moveband')].filter(e => e.getBoundingClientRect().width > 1 && getComputedStyle(e).opacity !== '0' && getComputedStyle(e).visibility !== 'hidden').map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 6))
/* the ask card's words and buttons, if one is up */
export const askNow = s => s.page.evaluate(() => {
  const m = [...document.querySelectorAll('#dlgMsg, .askcard, [role=alertdialog]')].find(e => e.getBoundingClientRect().width > 0)
  if (!m) return null
  const box = m.closest('[role=alertdialog], .modal, #dlgModal, .askcard') || m
  return { words: box.innerText.replace(/\s+/g, ' ').trim().slice(0, 240), buttons: [...box.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()) }
})
export const exists = existsSync
/* a line of words drawn somewhere (the smallest element whose words match): its words, and whether a person can see it
   now - inside the screen AND inside every scrolled box around it (not scrolled out of sight) */
export const lineSeen = (s, src) => s.page.evaluate(src => {
  const re = new RegExp(src)
  let best = null
  for (const e of document.querySelectorAll('body *')) {
    const t = (e.textContent || '').replace(/\s+/g, ' ').trim()
    if (!re.test(t)) continue
    const b = e.getBoundingClientRect(); if (!(b.width > 1 && b.height > 1)) continue
    if (!best || best.contains(e)) best = e
  }
  if (!best) return { drawn: false }
  const b = best.getBoundingClientRect()
  let seen = b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth, why = seen ? '' : 'off the screen'
  for (let p = best.parentElement; p && seen; p = p.parentElement) {
    const c = getComputedStyle(p)
    if (!/(auto|scroll|hidden)/.test(c.overflowY + c.overflowX)) continue
    const r = p.getBoundingClientRect()
    if (b.bottom <= r.top + 2 || b.top >= r.bottom - 2) { seen = false; why = `scrolled out of sight inside ${p.tagName.toLowerCase()}${p.id ? '#' + p.id : ''}.${String(p.className).split(/\s+/)[0]} (scrollTop ${Math.round(p.scrollTop)})` }
  }
  best.setAttribute('data-p1line', '1')
  return { drawn: true, words: best.textContent.replace(/\s+/g, ' ').trim().slice(0, 160), seen, why, box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } }
}, src)
