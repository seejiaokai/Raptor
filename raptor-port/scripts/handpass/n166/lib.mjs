// n166 - [MSQ-PICK-GUARD] step 1 (chat 166, 24 Nov 26): what TODAY's app does when a squadron pick or the member-view switch
// is pressed with a window open, with unsaved typing, mid-save, and when a change he did not make lands. Re-exports chat
// 162's helpers (n162/lib.mjs); pictures go to docs/mock/2026-11-24-msq-pick-guard/today/. Nothing here writes the app.
// Run: node raptor-port/scripts/handpass/n166/<script>.mjs <d|402x874>
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
export { mk, closeAll, FACT, note, die, signIn, press, covered, boxOf, bands, barSq, pageOn, go, shut, pickSq, SIZES, URL_ } from '../n162/lib.mjs'
import { note, boxOf, covered, shut, press } from '../n162/lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
export const PICS = resolve(HERE, '../../../docs/mock/2026-11-24-msq-pick-guard/today')
mkdirSync(PICS, { recursive: true })
export const SZTAG = sz => (sz === 'd' ? 'd' : 'p')
export const wait = (s, ms) => s.page.waitForTimeout(ms)

/* a picture: the whole screen, or cropped to the boxes of the given selectors */
export async function pic(s, name, clipSels, pad = 12) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(150)
  let clip
  if (clipSels) {
    const r = await page.evaluate(sels => {
      let L = 1e9, T = 1e9, R = -1e9, B = -1e9
      for (const sel of sels) for (const e of document.querySelectorAll(sel)) { const b = e.getBoundingClientRect(); if (!(b.width > 0 && b.height > 0)) continue; L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.right); B = Math.max(B, b.bottom) }
      return L < 1e9 ? { L, T, R, B, W: innerWidth, H: innerHeight } : null
    }, clipSels)
    if (r) { const x = Math.max(0, r.L - pad), y = Math.max(0, r.T - pad); clip = { x, y, width: Math.max(10, Math.min(r.W, r.R + pad) - x), height: Math.max(10, Math.min(r.H, r.B + pad) - y) } }
  }
  await page.screenshot({ path: `${PICS}/${name}.png`, ...(clip ? { clip } : {}) })
  note('picture', `${name}.png`)
  return `${name}.png`
}

/* every dialog-like thing drawn now: its first words, and its buttons as drawn (live or greyed) */
export const windowsNow = s => s.page.evaluate(() => {
  const vis = e => { const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return b.width > 2 && b.height > 2 && c.visibility !== 'hidden' && c.display !== 'none' }
  const found = []
  for (const e of document.querySelectorAll('[role=dialog], [role=alertdialog], .airpop, .floatwin, .bidsheet, dialog[open], #dlgModal, .modal, .lwday, #pop, [role=menu], [data-testid="bell-list"], #arrTools, .wavemenu, .menupanel.on')) {
    if (e.id === 'sqnMenu' || e.id === 'drawerSqnList') continue
    if (!vis(e)) continue
    if (found.some(o => o.contains(e))) continue
    found.push(e)
  }
  return found.map(el => ({
    what: (el.id ? '#' + el.id : '') + '.' + String(el.className).split(/\s+/).slice(0, 2).join('.') + (el.getAttribute('aria-label') ? ` "${el.getAttribute('aria-label')}"` : ''),
    words: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160),
    inert: !!el.closest('[inert]') || !!el.querySelector('[inert]'),
    buttons: [...el.querySelectorAll('button')].filter(vis).map(b => (b.textContent.trim() || b.getAttribute('aria-label') || '?').slice(0, 30) + (b.disabled || b.getAttribute('aria-disabled') === 'true' ? ' [greyed]' : '')).slice(0, 14),
  }))
})

/* anything else floating: fixed or absolute boxes over 60×30 with a z-index, drawn now (top level only) - for menus and
   panels the list above does not name */
export const overlaysNow = s => s.page.evaluate(() => {
  const out = []
  for (const e of document.querySelectorAll('body *')) {
    const c = getComputedStyle(e); if (c.position !== 'fixed' && c.position !== 'absolute') continue
    if (!(+c.zIndex >= 10)) continue
    const b = e.getBoundingClientRect(); if (b.width < 60 || b.height < 30 || c.visibility === 'hidden' || c.display === 'none' || +c.opacity === 0) continue
    if (e.closest('.topbar, header, #drawer:not(.open)')) continue
    if (out.some(o => o.contains(e))) continue
    out.push(e)
  }
  return out.map(e => `${e.id ? '#' + e.id : ''}.${String(e.className).split(/\s+/).slice(0, 2).join('.')}: ${(e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 70)}`).slice(0, 8)
})
/* the member view: the bar's name badge words, the menu's role line */
export const roleNow = s => s.page.evaluate(() => {
  const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 }
  const b = [...document.querySelectorAll('#roleBadge')].find(vis)
  return { badge: b ? b.textContent.replace(/\s+/g, ' ').trim() : null, menuLine: document.querySelector('#drawerRole')?.textContent.trim() ?? null }
})

/* a press at a control's middle, as a person makes it (no scrolling, the control where it is drawn) */
export async function tapAt(s, x, y) { if (s.desk) await s.page.mouse.click(x, y); else await s.page.touchscreen.tap(x, y); await wait(s, 450) }
export async function tapCentre(s, sel) { const b = await boxOf(s, sel); if (!b) return null; await tapAt(s, b.x + b.w / 2, b.y + b.h / 2); return b }

/* THE SQUADRON CONTROL as a person reaches it with a window open: the desktop's top-bar picker where drawn, else ☰ then
   the menu's squadron line. Never scrolls, never presses through a cover: where the control's middle is covered, it is
   reported covered and NOT pressed. Returns { control, covered, pressed, listOpen }. */
export async function reachPick(s, num, via = 'bar') {
  const out = {}
  if (via === 'bar') {
    out.control = 'top-bar squadron picker'
    out.covered = await covered(s, '#sqnMenuBtn')
    if (out.covered !== 'free') return out
    await tapCentre(s, '#sqnMenuBtn'); await wait(s, 300)
    const row = `#sqnMenu .sqm-row`
    const rows = await s.page.evaluate(r => [...document.querySelectorAll(r)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()), row)
    out.listOpen = rows.length > 0; out.listRows = rows
    if (!rows.length) { out.afterTap = (await windowsNow(s)).map(w => w.what); return out }
    const i = await s.page.evaluate(([r, n]) => [...document.querySelectorAll(r)].findIndex(e => e.getBoundingClientRect().width > 0 && e.querySelector('.sqm-num')?.textContent.trim() === n), [row, String(num)])
    if (i < 0) { out.pressed = false; out.why = `no ${num} row`; return out }
    await s.page.evaluate(([r, i]) => document.querySelectorAll(r)[i].setAttribute('data-n166row', '1'), [row, i])
    out.rowCovered = await covered(s, '[data-n166row]')
    if (out.rowCovered !== 'free') { out.pressed = false; await s.page.keyboard.press('Escape').catch(() => {}); return out }
    await tapCentre(s, '[data-n166row]'); out.pressed = true
  } else {
    out.control = '☰ menu, its squadron list'
    out.covered = await covered(s, '#burger')
    if (out.covered !== 'free') return out
    await tapCentre(s, '#burger'); await wait(s, 350)
    out.menuOpen = await s.page.evaluate(() => !!document.querySelector('#drawer')?.classList.contains('open'))
    if (!out.menuOpen) out.afterTap = (await windowsNow(s)).map(w => w.what)
    if (!(await s.page.locator('#drawerSqnList').count())) {
      out.lineCovered = await covered(s, '#drawerSqnBtn')
      if (out.lineCovered !== 'free') { await shut(s); return out }
      await tapCentre(s, '#drawerSqnBtn'); await wait(s, 300)
    }
    const row = '#drawerSqnList .sqm-row'
    const i = await s.page.evaluate(([r, n]) => [...document.querySelectorAll(r)].findIndex(e => e.getBoundingClientRect().width > 0 && e.querySelector('.sqm-num')?.textContent.trim() === n), [row, String(num)])
    out.listOpen = i >= 0
    if (i < 0) { out.pressed = false; await shut(s); return out }
    await s.page.evaluate(([r, i]) => document.querySelectorAll(r)[i].setAttribute('data-n166row', '1'), [row, i])
    const l = s.page.locator('[data-n166row]').first()
    await l.evaluate(e => { const r = e.getBoundingClientRect(); if (r.bottom > innerHeight) e.scrollIntoView({ block: 'center' }) })
    out.rowCovered = await covered(s, '[data-n166row]')
    if (out.rowCovered !== 'free') { out.pressed = false; await shut(s); return out }
    await tapCentre(s, '[data-n166row]'); out.pressed = true
    await wait(s, 300); await shut(s)
  }
  await s.page.evaluate(() => document.querySelectorAll('[data-n166row]').forEach(e => e.removeAttribute('data-n166row')))
  await wait(s, 700)
  return out
}

/* THE MEMBER-VIEW SWITCH as a person reaches it: the bar's name badge where drawn, else ☰ and its role line. Same rules. */
export async function reachView(s) {
  const out = {}
  if (await boxOf(s, '#roleBadge')) {
    out.control = 'name badge in the top bar'
    out.words = await s.page.evaluate(() => [...document.querySelectorAll('#roleBadge')].find(e => e.getBoundingClientRect().width > 1)?.textContent.trim())
    out.covered = await covered(s, '#roleBadge')
    if (out.covered !== 'free') return out
    await tapCentre(s, '#roleBadge'); out.pressed = true
  } else {
    out.control = '☰ menu, its role line'
    out.covered = await covered(s, '#burger')
    if (out.covered !== 'free') return out
    await tapCentre(s, '#burger'); await wait(s, 350)
    out.words = await s.page.evaluate(() => document.querySelector('#drawerRole')?.textContent.trim() ?? null)
    out.lineCovered = await covered(s, '#drawerRole')
    if (out.lineCovered !== 'free') { out.menuOpen = await s.page.evaluate(() => !!document.querySelector('#drawer')?.classList.contains('open')); out.afterTap = (await windowsNow(s)).map(w => w.what); await shut(s); return out }
    await tapCentre(s, '#drawerRole'); out.pressed = true
    await wait(s, 300); await shut(s)
  }
  await wait(s, 700)
  return out
}
