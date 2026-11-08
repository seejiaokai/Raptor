// Walker B's shared parts for the React Doctor last-findings walk ([RD-LEFT-1108], 8 Nov 26): worlds, presses, snapshots.
import { chromium, webkit, LAUNCH, serveDist } from '../drawcheck/lib.mjs'
export { chromium, webkit, LAUNCH }
export const ORIGIN = 'http://localhost:4411'
export const NOW = new Date('2026-11-08T09:00:00+08:00')
export const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important;caret-color:transparent !important}'
export const NL = String.fromCharCode(10)
export const V = sel => `${sel} >> visible=true`
export const firstLine = e => String((e && e.message) || e).split(NL)[0]
export const phoneOf = p => p.viewportSize().width < 600
export const wait = (p, ms = 450) => p.waitForTimeout(ms)

export async function press(p, sel, ms = 450) {
  try {
    const l = p.locator(V(sel)).first()
    if (phoneOf(p)) { await l.tap({ timeout: 6000 }) } else await l.click({ timeout: 6000 })
  } catch (e) { throw new Error(`pressing ${sel}: ${firstLine(e)}`) }
  await wait(p, ms)
}
export async function world(br, dist, { phone = false, q = '', user = 'ad', pass = 'a', noSign = false } = {}) {
  const ctx = await br.newContext(phone
    ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25, acceptDownloads: true })
  await serveDist(ctx, ORIGIN, dist)
  const errs = []
  const watch = pg => {
    pg.on('pageerror', e => errs.push('PAGE ' + firstLine(e)))
    pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 140)) })
    pg.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url().slice(0, 100)) })
  }
  await ctx.addInitScript(() => { })
  const p = await ctx.newPage(); watch(p)
  await p.clock.install({ time: NOW })
  await p.goto(ORIGIN + '/' + q)
  await p.addStyleTag({ content: QUIET }).catch(() => {})
  if (!noSign) await signIn(p, user, pass)
  return { ctx, p, errs, watch }
}
export async function signIn(p, user = 'ad', pass = 'a') {
  await p.waitForSelector('#luser', { timeout: 15000 })
  await p.fill('#luser', user); await p.fill('#lpass', pass)
  if (phoneOf(p)) await p.locator('#loginForm button[type=submit]').tap(); else await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day, #accForm, #accName, #welcomeBack', { state: 'attached', timeout: 20000 })
  await wait(p, 1200)
  await p.addStyleTag({ content: QUIET }).catch(() => {})
}
export async function reload(p, q = null) {
  if (q === null) await p.reload(); else await p.goto(ORIGIN + '/' + q)
  await p.addStyleTag({ content: QUIET }).catch(() => {})
}
export async function logout(p) {
  if (await p.locator(V('#accOut, #guestOut')).count()) { await p.locator(V('#accOut, #guestOut')).first().click(); await wait(p, 500) }
  else if (phoneOf(p)) { await press(p, '#burger'); await press(p, '#drawerLogout') }
  else { const l = p.locator(V('#logout, #accOut, #guestOut')); await l.first().click(); await wait(p, 500) }
  await p.waitForSelector('#luser', { timeout: 8000 })
}
export async function tab(p, page) {
  if (phoneOf(p)) { await press(p, '#burger'); await press(p, `#drawerNav a[data-page="${page}"]`) }
  else await press(p, `#topnav a[data-page="${page}"]`)
  await wait(p, 700)
}
export async function adminUsers(p) {
  await tab(p, 'admin')
  if (phoneOf(p)) { if (!(await p.locator(V('#accList')).count())) await press(p, '.adm-cat:has-text("Users")') }
  await p.waitForSelector('#accList', { timeout: 8000 })
}
export async function adminCat(p, label) {
  await tab(p, 'admin')
  if (phoneOf(p) && (await p.locator(V('.adm-back')).count())) await press(p, '.adm-back')
  await press(p, `.adm-cat:has-text("${label}")`)
  await wait(p, 400)
}
export async function adminData(p) { await adminCat(p, 'Data') }
export const note = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t && +getComputedStyle(t).opacity > 0.5 ? (t.textContent || '').trim() : '' })
export const bar = p => p.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' }
  const s = [...document.querySelectorAll('.savestat, [role=status]')].filter(vis).map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean)
  return s.join(' | ')
})
export const undoState = p => p.evaluate(() => {
  const g = id => { const b = document.getElementById(id); return b ? { dis: !!b.disabled || b.getAttribute('aria-disabled') === 'true', t: b.getAttribute('title') || '' } : null }
  return { undo: g('undoBtn'), redo: g('redoBtn') }
})
/* a person's row text by callsign, on Admin → Users (active and archived lists) */
export const rowText = (p, cs) => p.evaluate(c => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  for (const r of document.querySelectorAll('#page-admin .acc-row')) {
    const n = r.querySelector('.acc-name'); if (!n || n.textContent.trim() !== c || !vis(r)) continue
    const dots = [...r.querySelectorAll('[data-testid^="dot-"]')].map(d => d.getAttribute('aria-label')).join('/')
    const own = r.querySelector('.acc-tap'), main = (own ? own.innerText : r.innerText)
    const badge = r.querySelector('.ub'); const held = r.querySelector('.acc-held')
    return main.replace(/\s+/g, ' ').trim() + ' ¦ ' + dots + (badge ? ' ¦ ' + badge.textContent : '') + (held ? ' ¦ ' + held.textContent : '') + (r.querySelector('.acc-edit') ? ' ¦ EDITOR OPEN' : '')
  }
  return null
}, cs)
export const counts = p => p.evaluate(() => {
  const t = s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null }
  return { people: [...document.querySelectorAll('#page-admin h4.adm-sub')].map(h => h.textContent.trim()).filter(x => /^People/.test(x))[0] || null, arch: t('#accArchToggle'), waiting: t('#admWaiting') ? document.querySelectorAll('#admWaiting .acc-row').length : 0 }
})
/* what the browser's store holds, masked of ids and times so two runs compare */
export const store = p => p.evaluate(() => {
  const mask = s => s.replace(/\b[a-z]{1,4}[0-9a-z]{6,}\b/g, 'ID').replace(/\d{9,}/g, 'T')
  const o = {}
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!/^raptor:/.test(k)) continue; o[k.replace(/^raptor:/, '').replace(/[0-9a-z]{8,}/g, 'ID')] = (o[k.replace(/^raptor:/, '').replace(/[0-9a-z]{8,}/g, 'ID')] || 0) + 1 }
  return Object.fromEntries(Object.entries(o).sort())
})
export const prefixKeys = (p, rx) => p.evaluate(src => { const r = new RegExp(src); const k = []; for (let i = 0; i < localStorage.length; i++) { const x = localStorage.key(i); if (r.test(x)) k.push(x.replace(/[0-9a-f-]{12,}/g, 'ID')) } return k.sort() }, rx)
/* open a date box and pick a date on the app's own calendar, as a person does */
export async function pickDate(p, sel, iso) {
  await press(p, sel)
  await p.waitForSelector('[data-testid="dcal-card"]', { timeout: 5000 })
  const want = +iso.slice(0, 4) * 12 + +iso.slice(5, 7)
  for (let i = 0; i < 480; i++) {
    const at = await p.locator('[data-testid="dcal"]').getAttribute('data-month')
    const d = want - (+at.slice(0, 4) * 12 + +at.slice(5, 7))
    if (!d) break
    await press(p, d > 0 ? '[data-testid="dcal-next"]' : '[data-testid="dcal-prev"]', 150)
  }
  await press(p, `[data-testid="dcal-day-${iso}"]`)
}
