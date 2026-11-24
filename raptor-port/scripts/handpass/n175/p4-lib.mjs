// n175 / P4 - [MSQ-PICK-GUARD] second questions page (chat 175, 25 Nov 26): Undo's edges, the refresh card's edges, a drag,
// typing left in a box. Presser P4's own helpers: re-exports chat 166's (n166/lib.mjs) and adds the ringed picture (a 3px
// #e6007e outline drawn just before, removed after; the whole screen and a crop, both into the q2 "today" folder) and a
// clock world (the page clock installed, Singapore time; optional home rows written at the sign-in card - the midnight
// stand-in of mid-e1 / msq-rs-lib). Nothing here writes the app's code.
// Run any script: node raptor-port/scripts/handpass/n175/p4-<case>.mjs <d|402x874>
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { chromium, webkit } from '@playwright/test'
export { mk, closeAll, FACT, note, signIn, press, covered, boxOf, bands, barSq, pageOn, go, shut, SIZES, URL_, windowsNow, overlaysNow, roleNow, tapAt, tapCentre, reachPick, reachView, wait } from '../n166/lib.mjs'
import { note, wait } from '../n166/lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
export const DPICS = resolve(HERE, '../../../docs/mock/2026-11-25-msq-pick-guard-q2/today')
export const TMP = resolve(HERE, '../../../.tmp/n175/p4')
mkdirSync(DPICS, { recursive: true }); mkdirSync(TMP, { recursive: true })
export const SZT = sz => (sz === 'd' ? 'd' : 'p')
export const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
export async function hit(s, l, ms = 400) { l = typeof l === 'string' ? vis(s, l).first() : l; await l.scrollIntoViewIfNeeded().catch(() => {}); if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 }); await wait(s, ms) }
export const toast = s => s.page.evaluate(() => { const t = document.getElementById('toastEl'); return t && getComputedStyle(t).opacity !== '0' && t.getBoundingClientRect().height > 0 ? t.textContent.replace(/\s+/g, ' ').trim() : null })
export const question = s => s.page.evaluate(() => { const m = document.querySelector('#dlgMsg'); return m && m.getBoundingClientRect().width > 0 ? m.textContent.replace(/\s+/g, ' ').trim() : null })

/* a scratch picture, not a deciding one */
export async function tpic(s, name) { if (s.desk) await s.page.mouse.move(1, 1).catch(() => {}); await s.page.waitForTimeout(150); await s.page.screenshot({ path: `${TMP}/${name}.png` }); note('scratch picture', `${name}.png`) }

/* a DECIDING picture: ring = selector(s) or a {x,y,w,h} box to outline; crop = selectors (or boxes) the crop is cut to
   (default: the ring). Saves <name>.png (whole) and <name>-crop.png. */
export async function dpic(s, name, ring, crop, pad = 16) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  const toBoxes = async t => {
    if (!t) return []
    const list = Array.isArray(t) ? t : [t]
    const out = []
    for (const x of list) {
      if (typeof x === 'string') out.push(...await page.evaluate(sel => [...document.querySelectorAll(sel)].map(e => e.getBoundingClientRect()).filter(b => b.width > 1 && b.height > 1).map(b => ({ x: b.left, y: b.top, w: b.width, h: b.height })), x))
      else out.push(x)
    }
    return out
  }
  const rb = await toBoxes(ring)
  const ringBox = rb.length ? rb.reduce((a, b) => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), r: Math.max(a.r, b.x + b.w), b: Math.max(a.b, b.y + b.h) }), { x: 1e9, y: 1e9, r: -1e9, b: -1e9 }) : null
  if (ringBox) await page.evaluate(r => { const d = document.createElement('div'); d.id = '__n175ring'; Object.assign(d.style, { position: 'fixed', left: (r.x - 5) + 'px', top: (r.y - 5) + 'px', width: (r.r - r.x + 10) + 'px', height: (r.b - r.y + 10) + 'px', outline: '3px solid #e6007e', zIndex: 2147483647, pointerEvents: 'none', boxSizing: 'border-box' }); document.body.appendChild(d) }, ringBox)
  await page.waitForTimeout(150)
  await page.screenshot({ path: `${DPICS}/${name}.png` })
  const cb = crop ? await toBoxes(crop) : (ringBox ? [{ x: ringBox.x, y: ringBox.y, w: ringBox.r - ringBox.x, h: ringBox.b - ringBox.y }] : [])
  if (cb.length) {
    const W = s.W, H = s.H
    let L = Math.min(...cb.map(b => b.x)), T = Math.min(...cb.map(b => b.y)), R = Math.max(...cb.map(b => b.x + b.w)), B = Math.max(...cb.map(b => b.y + b.h))
    if (ringBox) { L = Math.min(L, ringBox.x); T = Math.min(T, ringBox.y); R = Math.max(R, ringBox.r); B = Math.max(B, ringBox.b) }
    const x = Math.max(0, L - pad), y = Math.max(0, T - pad)
    const clip = { x, y, width: Math.max(20, Math.min(W, R + pad) - x), height: Math.max(20, Math.min(H, B + pad) - y) }
    await page.screenshot({ path: `${DPICS}/${name}-crop.png`, clip })
  }
  await page.evaluate(() => document.getElementById('__n175ring')?.remove())
  note('DECIDING picture', `${name}.png` + (cb.length ? ` + ${name}-crop.png` : ''), ringBox ? 'ringed' : 'no ring found')
  return name
}

/* the Undo / Redo buttons as drawn: words, greyed, the tooltip text the app puts on them */
export const undoBtns = s => s.page.evaluate(() => ['undoBtn', 'redoBtn', 'trUndoBtn', 'trRedoBtn', 'sbUndo', 'sbRedo'].map(id => [...document.querySelectorAll('#' + id)].find(e => e.getBoundingClientRect().width > 0)).filter(Boolean).map(b => ({ id: b.id, words: b.textContent.replace(/\s+/g, ' ').trim(), greyed: b.disabled || b.getAttribute('aria-disabled') === 'true', title: b.title || null })))

/* a clock world: a fresh browser (WebKit on a phone, as mid-e1), the page clock installed at `now` (Singapore time);
   home rows (moves) written at the sign-in card BEFORE sign-in - the named stand-in, no screen saves a move. */
const TZT = iso => new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : iso + '+08:00')
export async function clockWorld(sz, { now, homes = [], user, pass, engine, onDialog } = {}) {
  const phone = sz !== 'd'
  const eng = engine || (phone ? 'webkit' : 'chromium')
  const browser = await (eng === 'webkit' ? webkit : chromium).launch()
  const ctx = await browser.newContext({ timezoneId: 'Asia/Singapore', locale: 'en-GB', deviceScaleFactor: 2, ...(phone ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true } : { viewport: { width: 1536, height: 864 } }) })
  if (now) await ctx.clock.install({ time: TZT(now) })
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log(`PAGEERROR ${String(e).slice(0, 200)}`))
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); if (onDialog) onDialog(d); else d.accept().catch(() => {}) })
  await page.goto('http://localhost:4700/'); await page.waitForSelector('#luser', { timeout: 20000 })
  const s = { browser, ctx, page, desk: !phone, W: phone ? 402 : 1536, H: phone ? 874 : 864, sz }
  if (homes.length) {
    for (const h of homes) await writeHome(page, h)
    await page.reload(); await page.waitForSelector('#luser', { timeout: 20000 }); await page.waitForTimeout(600)
  }
  if (user) await clockSignIn(s, user, pass)
  return s
}
export async function writeHome(page, { pid, from, to, day }) {
  return page.evaluate(m => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('raptor:settings/home:'))
    const has = keys.some(k => { try { return JSON.parse(localStorage.getItem(k)).pid === m.pid } catch { return false } })
    const id = n => 'h' + (Date.now() + n).toString(36) + Math.random().toString(36).slice(2, 6)
    if (!has && m.from) { const a = id(0); localStorage.setItem('raptor:settings/home:' + a, JSON.stringify({ id: a, pid: m.pid, unit: m.from, from: '2026-01-01' })) }
    const b = id(1); localStorage.setItem('raptor:settings/home:' + b, JSON.stringify({ id: b, pid: m.pid, unit: m.to, from: m.day }))
    return b
  }, { pid, from, to, day })
}
export async function clockSignIn(s, user, pass) {
  const p = s.page
  await p.fill('#luser', user); await p.fill('#lpass', pass)
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 })
  await p.addStyleTag({ content: '*{transition:none !important;animation:none !important}' }).catch(() => {})
  await p.waitForTimeout(800)
}
export async function clockTo(s, iso) {
  const now = await s.page.evaluate(() => Date.now())
  const ms = TZT(iso).getTime() - now
  if (ms < 0) throw new Error('clockTo: behind the page clock')
  await s.page.clock.fastForward(ms)
  await s.page.waitForTimeout(1500)
}
/* the words of every band, card, status line, toast and dialog drawn now */
export const sayNow = s => s.page.evaluate(() => {
  const vis = e => { const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return b.width > 1 && b.height > 1 && c.visibility !== 'hidden' && c.display !== 'none' && c.opacity !== '0' }
  const out = []
  for (const e of document.querySelectorAll('.moveband, .saveband, .savestat, [role=status], [role=alert], [role=dialog], [role=alertdialog], #toastEl, .askcard, .refreshcard, #dlgModal')) if (vis(e)) { const t = (e.innerText || '').replace(/\s+/g, ' ').trim(); if (t) out.push(t.slice(0, 220)) }
  return [...new Set(out)].slice(0, 10)
})
