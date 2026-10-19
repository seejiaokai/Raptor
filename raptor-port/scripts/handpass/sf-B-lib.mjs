/* WALKER B shared driver — [STANDBY-FLIES] phone walk (19 Oct 26). Plain Playwright, the served build on 4322 only.
   Phone = Chromium touch emulation 402x874, isMobile, hasTouch, deviceScaleFactor 3 (not WebKit). */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const BASE = 'http://localhost:4322'
export const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-19-standby-flies/walk/B')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const launch = () => chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

export async function proveBundle() {
  const html = await (await fetch(BASE + '/')).text()
  const m = html.match(/index-[A-Za-z0-9_-]+\.js/)
  console.log('served bundle', m && m[0], m && m[0] === 'index-BTbomYbk.js' ? 'OK' : 'MISMATCH')
  if (!m || m[0] !== 'index-BTbomYbk.js') throw new Error('wrong bundle')
}

export async function phone(browser, who = 'a', opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, ...opts })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/')
  await page.waitForSelector('#luser')
  await page.fill('#luser', who === 'a' ? 'ad' : 'us')
  await page.fill('#lpass', who === 'a' ? 'a' : 'us')
  await page.tap('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await page.addStyleTag({ content: '#toastEl{display:none !important}*{scroll-behavior:auto !important}' })
  await page.waitForTimeout(500)
  return { ctx, page, errors }
}

export const wait = (p, ms = 400) => p.waitForTimeout(ms)

/** zoom state of the page — a typing step on a phone can zoom it */
export const zoom = p => p.evaluate(() => ({ scale: window.visualViewport.scale, left: window.visualViewport.offsetLeft, top: window.visualViewport.offsetTop, w: window.visualViewport.width, iw: window.innerWidth }))

/** finger tap at the element's centre after proving it is on screen and is what is under the finger */
export async function tapEl(p, loc, { label = '' } = {}) {
  await loc.first().waitFor({ state: 'attached', timeout: 8000 })
  await loc.first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await p.waitForTimeout(250)
  const info = await loc.first().evaluate(e => {
    const r = e.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const top = document.elementFromPoint(cx, cy)
    return { cx, cy, w: r.width, h: r.height, on: cx >= 0 && cy >= 0 && cx <= innerWidth && cy <= innerHeight, hit: !!top && (top === e || e.contains(top) || top.contains(e)), topTag: top ? top.tagName + '.' + String(top.className).slice(0, 40) : null }
  })
  if (!info.on) throw new Error(`tap target ${label} off screen ${JSON.stringify(info)}`)
  if (!info.hit) throw new Error(`tap target ${label} covered by ${info.topTag}`)
  await p.touchscreen.tap(info.cx, info.cy)
  await p.waitForTimeout(450)
  return info
}

/** type into a small box by a real finger tap + keyboard; reports zoom afterwards */
export async function typeBox(p, loc, text, { clear = true } = {}) {
  await tapEl(p, loc, { label: 'box' })
  if (clear) { await p.keyboard.press('Control+A'); await p.keyboard.press('Backspace') }
  if (text) await p.keyboard.type(text, { delay: 30 })
  await p.keyboard.press('Enter').catch(() => {})
  await p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur())
  await p.waitForTimeout(500)
  return zoom(p)
}

/** the set-up seating helper (NOT the thing under test) */
export async function addWaveAndSeat(p, di, kind, rows /* [[li,ai], ...] */, seatSpec) {
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
  return p.evaluate(([di, kind, rows]) => {
    window.addWave(di, kind)
    const gi = window.DAYS[di].waves.findIndex(w => w.kind === kind)
    const ids = Object.keys(window.PEOPLE).filter(i => !window.PEOPLE[i].special)
    window.__used = window.__used || new Set()
    const pick = seat => { const i = ids.find(x => window.PEOPLE[x].seat === seat && !window.__used.has(x)); window.__used.add(i); return i }
    rows.forEach(([li, ai]) => { window.fillSlot(`${di}.${gi}.${li}.${ai}.p`, pick('FCP')); window.fillSlot(`${di}.${gi}.${li}.${ai}.w`, pick('RCP')) })
    return gi
  }, [di, kind, rows])
}

export async function openBoard(p, di) {
  await p.evaluate(d => window.openScheduler(d), di)
  await p.waitForSelector('#schedBoard'); await p.waitForTimeout(900)
}
export async function closeBoard(p) {
  await p.evaluate(() => { const b = document.querySelector('#sbDone'); if (b) b.click(); else if (window.closeScheduler) window.closeScheduler() })
  await p.waitForTimeout(700)
}

export async function shot(p, name, opts = {}) {
  const file = `${OUT}/${name}.png`
  await p.screenshot({ path: file, ...opts })
  return file
}
/** picture of one element (scrolled into view first) */
export async function shotEl(p, loc, name, pad = 0) {
  await loc.first().evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(250)
  return loc.first().screenshot({ path: `${OUT}/${name}.png` })
}

/** scroll an element so its top sits `y` css px below the viewport top (the sticky bars are ~80px) */
export async function scrollTo(p, loc, y = 150) {
  await loc.first().evaluate((e, y) => {
    let a = e.parentElement
    while (a && !(a.scrollHeight > a.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(a).overflowY))) a = a.parentElement
    const r = e.getBoundingClientRect()
    if (a && a !== document.body && a !== document.documentElement) a.scrollTop += r.top - y
    else window.scrollBy(0, r.top - y)
  }, y)
  await p.waitForTimeout(300)
}

/** sign the four roles and publish (or amend) through the real controls; selects are set with selectOption (a native picker cannot be driven by a finger in emulation) */
export async function publishDay(p, di) {
  const sels = p.locator('#schedBoard .sb-sign select')
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    const cur = await sels.nth(i).inputValue()
    if (opts.length && (!cur || cur === '—' || cur === '')) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await p.waitForTimeout(150)
  }
  await p.waitForTimeout(400)
  let beak = p.locator(`#schedBoard [data-beak="${di}"]`).first()
  if (!await beak.count()) beak = p.locator(`#schedBoard [data-alpub="${di}"]`).first()
  if (!await beak.count()) return { published: false, why: 'no publish button', signSelects: n }
  const label = (await beak.innerText()).trim()
  if (await beak.isDisabled()) return { published: false, why: 'disabled: ' + label, signSelects: n }
  await tapEl(p, beak, { label: 'publish' })
  await p.waitForTimeout(700)
  const ok = p.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await tapEl(p, ok, { label: 'confirm' }); await p.waitForTimeout(800) }
  const ver = await p.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '')
  return { published: true, label, version: ver, signSelects: n }
}

/** what the visible Flies/role chips say, scoped to a root selector */
export const chips = (p, root = 'body') => p.evaluate(root => [...document.querySelectorAll(`${root} [data-safly], ${root} .saflies, ${root} .saflies-on`)].filter(e => e.offsetParent !== null && e.getBoundingClientRect().width > 1).map(e => ({ tag: e.tagName, cls: e.className, key: e.getAttribute('data-safly') || e.getAttribute('data-sarole') || '', txt: (e.innerText || '').trim(), title: e.title || '', aria: e.getAttribute('aria-label') || '', pressed: e.getAttribute('aria-pressed'), dis: e.disabled || false, w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) })), root)

/** open the warning fold of the board and read its lines */
export async function warnLines(p) {
  return p.evaluate(() => {
    const b = document.querySelector('#schedBoard'); if (!b) return null
    const t = b.querySelector('#sbSide') || b
    return { head: [...b.querySelectorAll('button, summary, .sb-warn-h, [data-warnfold]')].filter(e => e.offsetParent && /issue|warning/i.test(e.innerText || '')).map(e => (e.innerText || '').trim() + ' | ' + [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')), lines: [...b.querySelectorAll('[data-warn], .wrow, .sb-warn li, [data-wk]')].filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()) }
  })
}

export async function openWarn(p) {
  const open = await p.evaluate(() => { const s = document.querySelector('#sbWarn'); return !!s && /▾/.test(s.querySelector('.wh')?.innerText || '') })
  if (!open) await tapEl(p, p.locator('#schedBoard .wh[data-sbwtog]'), { label: 'warn fold' })
  return p.evaluate(() => (document.querySelector('#sbWarn')?.innerText || '').replace(/\n+/g, ' | '))
}
export const pending = p => p.evaluate(() => [...document.querySelectorAll('#schedBoard .dpend')].map(b => b.innerText.trim()).join(' / ') + ' ' + (document.querySelector('#schedBoard .nysmark')?.innerText || '') + ' ' + (document.querySelector('#schedBoard .so-state')?.innerText || ''))
export const puckInfo = (p, scope, id) => p.evaluate(([scope, id]) => [...document.querySelectorAll(`${scope} [data-person="${id}"]`)].filter(e => e.offsetParent && e.classList.contains('puck')).map(e => ({ cls: e.className, title: (e.title || '').slice(0, 300), seatKey: (e.closest('[data-slot]') || {}).dataset?.slot || '' })), [scope, id])
export const dayBadge = (p, root) => p.evaluate(root => [...document.querySelectorAll(`${root} *`)].filter(e => e.offsetParent && e.children.length === 0 && /\bX\s*\d+\b|\d\s*X\s*\d/.test(e.textContent || '') && e.textContent.length < 40).map(e => e.className + ':' + e.textContent.trim()).slice(0, 8), root)

/** a real finger swipe (touch events through the browser's own channel); the finger RESTS before it lifts */
export async function swipe(p, ctx, x0, y0, dx, dy = 0) {
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] })
  for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + dx * i / 8, y: y0 + dy * i / 8 }] })
  await p.waitForTimeout(110)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await p.waitForTimeout(600)
  await cdp.detach().catch(() => {})
}
/** the week pager: which day page is showing */
export const weekPage = (p, root = '#eWeek') => p.evaluate(root => { const w = document.querySelector(root); return Math.round(w.scrollLeft / (w.querySelector('.day').getBoundingClientRect().width)) }, root)
/** swipe the week to day index di by finger (empty padding of the sign-off card as the start) */
export async function weekTo(p, ctx, di, root = '#eWeek', y = 112) {
  for (let i = 0; i < 10; i++) {
    const cur = await weekPage(p, root)
    if (cur === di) return cur
    const dir = di > cur ? -1 : 1
    await p.evaluate(root => { const d = [...document.querySelectorAll(root + ' .day')].find(d => d.getBoundingClientRect().left >= -5 && d.getBoundingClientRect().left < 200); d && (d.scrollTop = 0) }, root)
    await swipe(p, ctx, dir < 0 ? 330 : 70, y, dir * 260)
  }
  return weekPage(p, root)
}

/** the real route to a page on the phone: burger, then the page's own entry */
export async function navTo(p, page) {
  await tapEl(p, p.locator('#burger'), { label: 'burger' })
  await tapEl(p, p.locator(`a[data-page="${page}"]:visible`), { label: 'nav ' + page })
  await p.waitForFunction(pg => window.CURPAGE === pg, page)
  await p.waitForTimeout(700)
}
export const dayBadges = (p, root, di) => p.evaluate(([root, di]) => { const d = document.querySelectorAll(`${root} .day`)[di]; return [...d.querySelectorAll('.badge, .dbadge, .nx')].filter(e => e.offsetParent).map(e => (e.className + ':' + e.innerText.trim())) }, [root, di])
