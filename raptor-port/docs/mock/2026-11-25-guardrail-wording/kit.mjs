// The shared kit of the 25 Nov 26 drawings (the end-time guard rail G1–G4, the six untrue sentences F1–F6).
// Drawn on the REAL running app by .claude/skills/brainstorming/mockups-on-the-real-app.md: every "today" frame is the app
// as it draws itself after staging through its own controls; every "proposed" frame changes only words of an element the
// app drew, or adds one class (named in the script) to an element the app drew. App nodes are hidden, never removed.
// Code sent into the page declares its own helpers (it runs without this module).
import { createRequire } from 'node:module'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium, webkit } = require('@playwright/test')

export const HERE = path.dirname(fileURLToPath(import.meta.url))
export const IMG = path.join(HERE, 'img')
mkdirSync(IMG, { recursive: true })
export const URL_ = process.env.GW_URL || 'http://localhost:4791/'
/* the scratch folder for staged stores handed from the desktop to the phone (never the picture folder) */
export const STATE = process.env.GW_STATE || path.join(os.tmpdir(), 'gw-2026-11-25-state')
mkdirSync(STATE, { recursive: true })
export const CLOCK = '2026-07-15T09:00:00'
export const SIZES = {
  d: { name: 'desktop', eng: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  /* his iPhone: 402 x 874, WebKit, touch, its real 3x */
  p: { name: 'phone', eng: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } },
}
export const wait = (p, ms) => p.waitForTimeout(ms)
export const log = (...a) => console.log(...a)
export const clean = s => String(s == null ? '' : s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim()

/* the facts each run reads off the screen (what "today" says, the counts the proposals print) */
export const facts = []
export const fact = (scene, size, what, v) => { facts.push({ scene, size, what, v }); log(`[${scene} ${size}] ${what}:`, typeof v === 'string' ? v : JSON.stringify(v)) }
export function saveFacts(tag) {
  const f = path.join(IMG, `facts-${tag}.json`)
  writeFileSync(f, JSON.stringify(facts, null, 1))
}

/* a world at one size: a fresh store, or the store a desktop run staged (`state`) */
export async function world(key, state = null) {
  const sz = SIZES[key]
  const b = await sz.eng.launch()
  const ctx = await b.newContext({ ...sz.opts, ...(state ? { storageState: state } : {}) })
  await ctx.clock.install({ time: new Date(CLOCK) })
  const p = await ctx.newPage()
  p.errs = []
  p.on('pageerror', e => { p.errs.push('PAGE ' + e.message); log('PAGE ERROR', e.message) })
  p.on('console', m => { if (m.type() === 'error') { p.errs.push('CONSOLE ' + m.text()); log('console error', m.text()) } })
  p.on('response', r => { if (r.status() >= 400) { p.errs.push(r.status() + ' ' + r.url()); log('HTTP', r.status(), r.url()) } })
  p.on('dialog', d => d.accept())
  return { b, ctx, p, sz }
}
export async function signIn(p, u = 'ad', pw = 'a') {
  await p.goto(URL_)
  await p.waitForSelector('#luser, #vWeek .day, #eWeek .day', { state: 'attached', timeout: 20000 }).catch(async () => {
    await p.screenshot({ path: path.join(STATE, 'signin-fail.png') }); throw new Error('sign-in screen never came: ' + path.join(STATE, 'signin-fail.png'))
  })
  if (await p.locator('#luser').count()) {
    await p.fill('#luser', u); await p.fill('#lpass', pw)
    await p.click('#loginForm button[type=submit]')
  }
  await p.waitForSelector('#vWeek .day, #eWeek .day', { state: 'attached', timeout: 20000 }).catch(async () => {
    await p.screenshot({ path: path.join(STATE, 'signin-fail.png') }); throw new Error('the week never came: ' + path.join(STATE, 'signin-fail.png') + ' ' + p.errs.join(' | '))
  })
  await wait(p, 600)
  await p.addStyleTag({ content: MARK_CSS })
}
export async function switchUser(p, u, pw) {
  await p.keyboard.press('Escape').catch(() => {}); await p.evaluate(() => document.getElementById('logout').click()); await wait(p, 800)
  await p.fill('#luser', u); await p.fill('#lpass', pw)
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day, #eWeek .day', { state: 'attached' }); await wait(p, 600)
  await p.addStyleTag({ content: MARK_CSS })
}
export async function go(p, to) { await p.evaluate(t => window.go(t), to); await p.waitForFunction(t => window.CURPAGE === t, to); await wait(p, 600) }
export async function saveState(ctx, name) { const f = path.join(STATE, name + '.json'); await ctx.storageState({ path: f, indexedDB: true }); return f }

/* the marks for him: a pink ring drawn ON the element (an outline: it takes no room) and a numbered tag placed on the page
   from the element's box just before the picture (the screen is still). The tag says a number he answers by, or "New". */
export const MARK_CSS = `
.gwm { outline: 2px solid #ff2d95 !important; outline-offset: 3px !important; }
.gwm-in { outline: 2px solid #ff2d95 !important; outline-offset: -2px !important; }
.gwm-tag { position: fixed; z-index: 2147483647; background: #ff2d95; color: #fff; font: 700 11px/15px system-ui, 'Segoe UI', sans-serif;
  padding: 0 5px; border-radius: 8px; pointer-events: none; white-space: nowrap; }
`
/* the n-th VISIBLE match, scoped by the selector itself */
export async function markEl(p, sel, label, { inset = false, nth = 0 } = {}) {
  const ok = await p.evaluate(([sel, label, inset, nth]) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
    const el = [...document.querySelectorAll(sel)].filter(vis)[nth]; if (!el) return false
    const before = el.getBoundingClientRect()
    el.classList.add(inset ? 'gwm-in' : 'gwm')
    const after = el.getBoundingClientRect()
    if (Math.abs(before.width - after.width) > 0.5 || Math.abs(before.top - after.top) > 0.5) throw new Error('the mark moved its element: ' + sel)
    if (label) { el.setAttribute('data-gwtag', label) }
    return true
  }, [sel, label, inset, nth])
  if (!ok) throw new Error('markEl: nothing visible for ' + sel)
}
/* place every tag from its element's box, just before the picture */
export async function placeTags(p) {
  await p.evaluate(() => {
    document.querySelectorAll('.gwm-tag').forEach(t => t.remove())
    for (const el of document.querySelectorAll('[data-gwtag]')) {
      const b = el.getBoundingClientRect(); if (!b.width) continue
      const t = document.createElement('span'); t.className = 'gwm-tag'; t.textContent = el.getAttribute('data-gwtag'); document.body.appendChild(t)
      t.style.left = Math.max(2, b.right - t.offsetWidth + 4) + 'px'; t.style.top = Math.max(2, b.top - t.offsetHeight - 2) + 'px'
    }
  })
}
/* Edit Schedule with day `di` in view (the phone's week shows one or two days: the day is scrolled to the front) */
export async function weekDay(p, sz, di) {
  await go(p, 'editsched')
  await p.evaluate(di => { const d = document.querySelector(`#eWeek .day[data-day="${di}"]`); d && d.scrollIntoView({ block: 'start', inline: 'start' }); window.scrollTo(0, 0) }, di)
  await wait(p, 700)
  return p.evaluate(() => [...document.querySelectorAll('#eWeek .day')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > 0 && r.left < innerWidth }).map(e => e.getAttribute('data-day')))
}
/* the Scheduler Board on day `di`, opened by its own door on the week's day heading */
export async function board(p, sz, di) {
  await weekDay(p, sz, di)
  const sb = p.locator(`#eWeek [data-sbday="${di}"]`).filter({ visible: true }).first()
  await sb.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sb.click()
  await p.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' }); await wait(p, 700)
}
/* hover words are never painted by a browser: the script draws them in a yellow label under the control, saying so */
export async function hoverLabel(p, sel, words, { nth = 0 } = {}) {
  await p.evaluate(([sel, words, nth]) => {
    document.getElementById('gw-hover')?.remove()
    const e = [...document.querySelectorAll(sel)].filter(x => x.getBoundingClientRect().width > 0)[nth]; if (!e) throw new Error('hoverLabel: no ' + sel)
    const r = e.getBoundingClientRect(), d = document.createElement('div'); d.id = 'gw-hover'
    d.textContent = 'Hover words (drawn by the script): ' + words
    const w = Math.min(380, innerWidth - 12)
    Object.assign(d.style, { position: 'fixed', left: Math.max(6, Math.min(r.left, innerWidth - w - 6)) + 'px', top: (r.bottom + 8) + 'px', width: w + 'px', background: '#ffe066', color: '#111', font: '12px/1.35 system-ui,sans-serif', padding: '5px 7px', borderRadius: '3px', zIndex: 2147483646, boxSizing: 'border-box' })
    document.body.appendChild(d)
  }, [sel, words, nth])
}
export const hoverOff = p => p.evaluate(() => document.getElementById('gw-hover')?.remove())
/* in a proposed frame the ring would cover the new red edge: the ring comes off, the number tag stays */
export const ringsOff = p => p.evaluate(() => document.querySelectorAll('.gwm,.gwm-in').forEach(e => e.classList.remove('gwm', 'gwm-in')))
export const unmark = p => p.evaluate(() => {
  document.querySelectorAll('.gwm-tag').forEach(t => t.remove())
  document.querySelectorAll('.gwm,.gwm-in').forEach(e => e.classList.remove('gwm', 'gwm-in'))
  document.querySelectorAll('[data-gwtag]').forEach(e => e.removeAttribute('data-gwtag'))
})

/* a picture of the union of the named parts (each its first VISIBLE match), padded, clamped to the screen */
export async function shot(p, sz, name, sels, pad = 12) {
  await placeTags(p)
  const box = await p.evaluate(([sels]) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
    const rs = []
    for (const q of [].concat(sels)) { const e = [...document.querySelectorAll(q)].filter(vis)[0]; if (e) rs.push(e.getBoundingClientRect()) }
    for (const t of document.querySelectorAll('.gwm-tag')) rs.push(t.getBoundingClientRect())
    if (!rs.length) return null
    return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) }
  }, [sels])
  if (!box) throw new Error(`${name}: nothing visible for ${sels}`)
  const vw = sz.opts.viewport.width, vh = sz.opts.viewport.height
  const x = Math.max(0, box.x - pad), y = Math.max(0, box.y - pad)
  const clip = { x, y, width: Math.min(vw, box.r + pad) - x, height: Math.min(vh, box.b + pad) - y }
  const file = `${name}-${sz.name}.png`
  await p.screenshot({ path: path.join(IMG, file), clip })
  log('  picture', file, Math.round(clip.width) + 'x' + Math.round(clip.height))
  return file
}
/* the app's passing note held on screen (its fade stopped), or hidden */
export const holdNote = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return null; t.style.transition = 'none'; t.style.opacity = '1'; return t.textContent.trim() })
export const hideNote = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.style.transition = 'none'; t.style.opacity = '0' } })
export const noteText = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t && +getComputedStyle(t).opacity > 0.3 ? t.textContent.trim() : '' })

/* typing on the DESKTOP only (never before a phone picture: a phone zooms to a focused box) */
export async function setTxt(p, sel, v) {
  const el = p.locator(sel).filter({ visible: true }).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.press('Backspace')
  if (v) await p.keyboard.type(v)
  await p.keyboard.press('Enter'); await wait(p, 300)
  await p.mouse.click(760, 120); await wait(p, 300)
}
/* a tap on a neutral heading, so no control is left hovered or focused in a touch picture */
export const neutral = p => p.evaluate(() => { document.activeElement?.blur?.() })
export const isPhone = sz => sz.name === 'phone'
