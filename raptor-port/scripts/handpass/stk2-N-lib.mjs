/* Walker F — the Codex stack check, 5 Oct 26. Shared helpers: a fresh browser per scenario group, numbered pictures,
   the forced storage failure (the recipe of sn-cover.mjs), and the looks the failed-save band is judged by.
   Env: HP_URL (frozen build), HP_SHOTS (pictures), HP_OUT (JSON). Read-only on the app. */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
import * as H from './wh-lib.mjs'
export { H }
export const { row, judge, savePart, TABLE } = H
export const BASE = process.env.HP_URL
export const SHOTS = process.env.HP_SHOTS
mkdirSync(SHOTS, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const sleep = ms => new Promise(r => setTimeout(r, ms))

export const SIZES = {
  desk: { width: 1440, height: 900 },
  d1366: { width: 1366, height: 800 },
  d1280: { width: 1280, height: 700 },
  phone: { width: 390, height: 844, touch: true },
  p320: { width: 320, height: 568, touch: true },
  side: { width: 844, height: 390, touch: true },
}
let N = 0
export const pics = []
/* a fresh browser + context + page, signed in (storage is its own; NOT ?fresh=1 — that mode keeps everything in
   memory so no save can ever fail) */
export async function open(sizeKey = 'desk', who = 'a', { signIn = true } = {}) {
  const size = SIZES[sizeKey]
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1, hasTouch: !!size.touch })
  const errors = []
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error' && !/quota|QuotaExceeded|walk: forced/i.test(m.text())) errors.push(`${sizeKey}: ${m.text()}`) })
  p.on('pageerror', e => { if (!/quota|walk: forced/i.test(e.message)) errors.push(`${sizeKey}: PAGEERROR ${e.message}`) })
  p.on('response', r => { if (r.status() >= 400) errors.push(`${sizeKey}: HTTP ${r.status()} ${r.url()}`) })
  p.on('dialog', d => { errors.push(`${sizeKey}: NATIVE DIALOG ${d.message()}`); d.dismiss().catch(() => {}) })
  await p.goto(BASE + '/')
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  if (signIn) {
    await p.waitForSelector('#luser', { state: 'visible', timeout: 15000 })
    await p.fill('#luser', who === 'a' ? 'ad' : 'us'); await p.fill('#lpass', who === 'a' ? 'a' : 'us')
    await p.click('#loginForm button[type=submit]')
    await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
    await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
    await sleep(500)
  }
  const press = async (x, y) => { if (size.touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); await sleep(300) }
  return { browser, ctx, p, errors, size, sizeKey, press }
}
export async function go(p, to) {
  await p.evaluate(x => window.go(x), to)
  await p.waitForFunction(x => window.CURPAGE === x, to)
  await sleep(450)
}
/* a picture: the whole screen, or a clipped top part; returns the file name; every one is opened by the walker */
export async function pic(p, name, clip = null) {
  const f = `${process.env.F_RUN || 'r'}-${String(++N).padStart(3, '0')}-${name}.png`
  await p.screenshot({ path: `${SHOTS}/${f}`, ...(clip ? { clip } : {}) }).catch(() => {})
  pics.push(f)
  return f
}
/* ----- the forced failure, as a full disk does it (recipe of sn-cover.mjs) ----- */
export const breakStorage = p => p.evaluate(() => {
  if (!window.__lsSetWas) window.__lsSetWas = Storage.prototype.setItem
  Storage.prototype.setItem = function () { throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError') }
})
export const fixStorage = p => p.evaluate(() => { if (window.__lsSetWas) Storage.prototype.setItem = window.__lsSetWas })
/* storage works again FROM the press on Retry, never before (the app's own retry could save first) */
export const fixOnRetryPress = p => p.evaluate(() => {
  const arm = e => { if (!e.target.closest('.savestat button, .saveband button')) return; Storage.prototype.setItem = window.__lsSetWas; document.removeEventListener('pointerdown', arm, true) }
  window.__arm = arm
  document.addEventListener('pointerdown', arm, true)
})
export const disarm = p => p.evaluate(() => { if (window.__arm) document.removeEventListener('pointerdown', window.__arm, true) })
/* an ordinary edit through the app's own box: the callsign of Monday's first formation on the edit week */
export async function ordinaryEdit(p, text = 'VLX') {
  await go(p, 'editsched')
  const el = p.locator('#eWeek [data-txt="ff:0.0.0.cs"]:visible').first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(text, { delay: 10 })
  await p.keyboard.press('Tab'); await sleep(300)
}
/* break storage, then make the ordinary edit; the warning must come up */
export async function failNow(p, text = 'VLX') {
  await breakStorage(p)
  await ordinaryEdit(p, text)
  return p.waitForSelector('.topbar > .savestat.failed', { timeout: 15000 }).then(() => true, () => false)
}
/* what is measurable about the bar and the note */
export const barInfo = p => p.evaluate(() => {
  const bar = document.querySelector('.topbar'); const br = bar.getBoundingClientRect()
  const n = document.querySelector('.topbar > .savestat')
  const nr = n ? n.getBoundingClientRect() : null
  const page = document.querySelector('.page.on, .page:not([hidden])')
  return { barH: Math.round(br.height), barBottom: Math.round(br.bottom), cls: bar.className, note: nr && [Math.round(nr.left), Math.round(nr.top), Math.round(nr.width), Math.round(nr.height)], noteBottom: nr && Math.round(nr.bottom), text: n ? n.textContent : null, noteCls: n ? n.className : null, inert: n ? n.hasAttribute('inert') : null }
})
/* the warning at `sel`: seen whole and on top? what a person could press lies under it? (from sn-board.mjs) */
export const look = (p, sel) => p.evaluate(sel => {
  const n = document.querySelector(sel)
  if (!n) return { there: false, seen: false, covers: [] }
  const b = n.getBoundingClientRect()
  const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
  const seen = !!top && n.contains(top) && b.width > 0 && b.height > 0 && b.top >= 0 && b.left >= 0 && b.right <= innerWidth + 0.5 && b.bottom <= innerHeight + 0.5
  const control = e => { for (let x = e; x && x !== document.body; x = x.parentElement) { if (x.matches('button, a[href], input, select, textarea, summary, label, [role="button"], [role="tab"], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]') || getComputedStyle(x).cursor === 'pointer') return x } return null }
  const spots = []
  for (let y = b.top + 2; y <= b.bottom - 2; y += 4) for (let x = b.left + 2; x <= b.right - 2; x += 4) spots.push([x, y])
  const vis = n.style.visibility; n.style.visibility = 'hidden'
  const under = new Set(spots.map(([x, y]) => control(document.elementFromPoint(x, y))).filter(c => c && !n.contains(c)))
  n.style.visibility = vis
  return { there: true, seen, onTop: top ? (top.id || String(top.className) || top.tagName).slice(0, 40) : null, box: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)],
    covers: [...under].map(c => (c.getAttribute('aria-label') || c.textContent || c.id || '').trim().slice(0, 30)) }
}, sel)
/* press Retry for real wherever it is; report what took the press */
export async function pressRetry(ctx, sel = '.savestat button, .saveband button') {
  const { p, press } = ctx
  const l = p.locator(sel + ':visible').first()
  const bb = await l.boundingBox()
  if (!bb) return { pressed: false }
  await press(bb.x + bb.width / 2, bb.y + bb.height / 2)
  return { pressed: true, box: [Math.round(bb.x), Math.round(bb.y), Math.round(bb.width), Math.round(bb.height)] }
}
/* how many Retry buttons / warning notes are on the page and which are reachable (not inert, not hidden) */
export const retries = p => p.evaluate(() => {
  const all = [...document.querySelectorAll('.savestat button, .saveband button')]
  return all.map(b => {
    const r = b.getBoundingClientRect(); const inert = !!b.closest('[inert]'); const hid = !!b.closest('[aria-hidden="true"]')
    const hit = r.width > 0 ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null
    return { where: b.closest('.saveband') ? 'band:' + (b.closest('#schedBoard') ? 'board' : b.closest('#inpCal') ? 'inputs-cal' : b.closest('#medView') ? 'medical' : b.closest('[data-testid="oil-sheet"]') ? 'oil' : '?') : 'topbar', inert, hid, drawn: r.width > 0 && r.height > 0, onTop: !!hit && (hit === b || b.contains(hit)), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }
  })
})
export const bands = p => p.evaluate(() => [...document.querySelectorAll('.saveband')].map(b => { const r = b.getBoundingClientRect(); return { in: b.closest('#schedBoard') ? 'board' : b.closest('#inpCal') ? 'inputs-cal' : b.closest('#medView') ? 'medical' : b.closest('[data-testid="oil-sheet"]') ? 'oil' : (b.parentElement && (b.parentElement.id || b.parentElement.className)).toString().slice(0, 40), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] } }))
/* the first thing a person can press that is below the bar: a press at its middle — who took it */
export async function topmostControl(ctx, root = null) {
  const { p } = ctx
  return p.evaluate(root => {
    const bar = document.querySelector('.topbar').getBoundingClientRect()
    const scope = root ? document.querySelector(root) : document
    if (!scope) return null
    const ok = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width >= 14 && r.height >= 14 && r.top >= bar.bottom - 1 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && cs.visibility !== 'hidden' && cs.display !== 'none' && !e.closest('.topbar') && !e.closest('.saveband') && !e.closest('.savestat') }
    const cands = [...scope.querySelectorAll('button:not([disabled]), input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [role="button"], [role="tab"], a[href], [contenteditable="true"]')].filter(ok)
    cands.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left)
    const c = cands[0]
    if (!c) return null
    const r = c.getBoundingClientRect()
    return { sig: (c.id || (c.textContent || '').trim().slice(0, 25) || c.tagName), name: (c.getAttribute('aria-label') || c.getAttribute('title') || (c.textContent || '').trim().replace(/\s+/g, ' ') || c.getAttribute('placeholder') || c.id || c.tagName).toString().slice(0, 40), id: c.id || '', tag: c.tagName.toLowerCase(), x: r.left + r.width / 2, y: r.top + r.height / 2, box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], barBottom: Math.round(bar.bottom) }
  }, root)
}
/* press it for real and say what received the click (a capturing listener, nothing prevented) */
export async function realPress(ctx, c) {
  const { p, press } = ctx
  await p.evaluate(() => { window.__hit = null; window.__hh = e => { const t = e.target; window.__hit = t.closest('.savestat button, .saveband button') ? 'RETRY' : ((t.closest('button,input,select,textarea,a,[role=button],[contenteditable]') || t).id || (t.textContent || '').trim().slice(0, 25) || t.tagName); }; document.addEventListener('click', window.__hh, true); document.addEventListener('focusin', window.__hf = e => { window.__focus = (e.target.id || e.target.tagName) }, true) })
  await p.evaluate(() => { window.__focus = null })
  await press(c.x, c.y)
  return p.evaluate(() => { document.removeEventListener('click', window.__hh, true); document.removeEventListener('focusin', window.__hf, true); return { clickAt: window.__hit, focus: window.__focus } })
}
/* the shot of the top part of the screen */
export const topShot = (p, name, h = 260) => pic(p, name, { x: 0, y: 0, width: p.viewportSize().width, height: Math.min(h, p.viewportSize().height) })
export async function closeAll(c) { await c.browser.close() }
