// trk-lib v1 (24 Nov 26) — shared helpers for the n162 Tracker "This change could not be saved." walks (trk-*.mjs).
// Self-contained: Chromium at both sizes (the repo's browser fallback, as playwright.config.ts), the built app already served
// on port 4700 (never started or stopped here). Every step presses the app's own controls; the page is only READ for facts.
// Each wait is on what the next step needs (a selector, a drawn state) — no fixed sleeps.
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
export const URL_ = 'http://localhost:4700/'
export const PICS = resolve(HERE, '../../../docs/mock/2026-11-24-msq-night-questions/checked')
mkdirSync(PICS, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}

/* d / p: the walks' sizes (Chromium both). desk / phone: the mock-up sizes (the mock-ups guide) — desktop 1536x864 Chromium
   at scale 2; his iPhone's own 402x874 in WebKit, touch, scale 3. */
export const SZ = (process.argv[2] || '').trim()
if (!['d', 'p', 'desk', 'phone'].includes(SZ)) { console.error('usage: node <script> d|p|desk|phone   (d/desk = desktop 1536x864 mouse, p/phone = phone 402x874 touch)'); process.exit(2) }
const SIZES = {
  d: { engine: chromium, desk: true, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { engine: chromium, desk: false, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  desk: { engine: chromium, desk: true, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  phone: { engine: webkit, desk: false, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } },
}
export const ENGINE = SIZES[SZ].engine === webkit ? 'webkit' : 'chromium'
let browser = null
export const errs = []
export async function mk() {
  const S = SIZES[SZ]
  if (!browser) browser = await S.engine.launch(S.engine === chromium ? launchOptions : {})
  const ctx = await browser.newContext(S.opts)
  const page = await ctx.newPage()
  page.setDefaultTimeout(20000)
  page.on('pageerror', e => { errs.push(`PAGEERROR ${e}`); console.log(`PAGEERROR ${e}`) })
  page.on('dialog', d => { log(`BROWSER DIALOG ${d.type()}: ${d.message()}`); d.accept().catch(() => {}) })
  return { ctx, page, desk: S.desk }
}
export async function closeAll() { if (browser) await browser.close().catch(() => {}) }

export const log = (...a) => console.log(a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '))
export const FACTS = []
export function fact(key, v) { const line = `FACT ${key}=${typeof v === 'string' ? JSON.stringify(v) : JSON.stringify(v)}`; FACTS.push(line); console.log(line) }
export function fail(msg) { console.error(`STEP COULD NOT BE PRESSED: ${msg}`); throw new Error(msg) }

/* two animation frames: what a press set off has been drawn */
export const frames = s => s.page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(true))))).catch(() => false)
const noMotion = s => s.page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' }).catch(() => {})

/* a press as a person makes it: a mouse click on the desktop, a finger tap on the phone */
export async function press(s, sel, what) {
  const l = typeof sel === 'string' ? s.page.locator(sel).filter({ visible: true }).first() : sel
  try { await l.waitFor({ state: 'visible', timeout: 10000 }) } catch (_) { fail(`${what || sel}: not on screen`) }
  if (s.desk) await l.click({ timeout: 10000 }); else await l.tap({ timeout: 10000 })
  await frames(s)
  return true
}
export const visible = (s, sel) => s.page.locator(sel).filter({ visible: true }).count().then(n => n > 0)

export async function signIn(s, user, pass, query = '') {
  const { page } = s
  await page.goto(URL_ + query); await page.waitForSelector('#luser')
  await noMotion(s)
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await press(s, '#loginForm button[type=submit]', 'Sign in')
  await page.waitForSelector('.page.on', { state: 'attached', timeout: 30000 })
  await noMotion(s)
}
export async function logout(s) {
  if (s.desk) await press(s, '#logout', 'Logout')
  else { await press(s, '#burger', '☰'); await press(s, '#drawerLogout', 'Logout (menu)') }
}
export async function waitSignedOut(s) { await s.page.waitForSelector('#luser', { state: 'visible', timeout: 20000 }) }

/* the ☰ drawer shut, if open */
export async function shut(s) {
  for (let i = 0; i < 3; i++) {
    const open = await s.page.evaluate(() => !!document.querySelector('#drawer')?.classList.contains('open'))
    if (!open) return
    const W = s.page.viewportSize().width
    if (s.desk) await s.page.mouse.click(W - 8, 500); else await s.page.touchscreen.tap(W - 8, 500)
    await s.page.waitForFunction(() => !document.querySelector('#drawer')?.classList.contains('open'), null, { timeout: 4000 }).catch(() => {})
  }
}
/* a page by name: the top bar's tab where drawn, else the ☰ menu's line */
export async function go(s, pageName) {
  const tab = s.page.locator(`#topnav a[data-page="${pageName}"]`).filter({ visible: true })
  if (await tab.count()) await press(s, tab.first(), `tab ${pageName}`)
  else {
    const open = await s.page.evaluate(() => !!document.querySelector('#drawer')?.classList.contains('open'))
    if (!open) await press(s, '#burger', '☰')
    await press(s, `#drawerNav a[data-page="${pageName}"]`, `menu line ${pageName}`)
    await shut(s)
  }
  await s.page.waitForSelector(`#page-${pageName}.on, .page.on#page-${pageName}`, { state: 'attached', timeout: 15000 }).catch(() => {})
}
export async function trackerReady(s) {
  await s.page.waitForFunction(() => { const p = document.querySelector('#page-tracker'); return !!p && p.classList.contains('on') && document.querySelectorAll('#flowSvg .ball').length > 0 && !/Loading…/.test(p.querySelector('header')?.textContent || '') }, null, { timeout: 30000 })
  await frames(s)
}
/* a squadron pick by the size's own door: the top bar's list on a desktop, the ☰ menu's list on a phone */
export async function pickSq(s, num) {
  const rowOf = list => s.page.locator(`${list} .sqm-row`, { has: s.page.locator('.sqm-num', { hasText: new RegExp(`^${num}$`) }) })
  if (s.desk) {
    await press(s, '#sqnMenuBtn', 'Schedules list')
    if (!(await rowOf('#sqnMenu').count())) fail(`no row ${num} in the bar's list`)
    await press(s, rowOf('#sqnMenu').first(), `row ${num}`)
  } else {
    const open = await s.page.evaluate(() => !!document.querySelector('#drawer')?.classList.contains('open'))
    if (!open) await press(s, '#burger', '☰')
    if (!(await s.page.locator('#drawerSqnList').count())) await press(s, '#drawerSqnBtn', 'menu squadron mark')
    if (!(await rowOf('#drawerSqnList').count())) fail(`no row ${num} in the menu's list`)
    await press(s, rowOf('#drawerSqnList').first(), `menu row ${num}`)
  }
}
/* the member-view switch: the chip at the top right on a desktop, the menu's line on a phone */
export async function roleSwitch(s) {
  if (s.desk) await press(s, '#roleBadge', 'role chip')
  else { await press(s, '#burger', '☰'); await press(s, '#drawerRole', 'role line (menu)'); await shut(s) }
}
/* Saber's door: Admin → Users, a person's row, one access line, Save */
export async function setAccess(s, pid, unitNum, line) {
  const { page } = s
  await go(s, 'admin')
  if (await page.locator('.adm-back:visible').count()) await press(s, '.adm-back', 'Admin back')
  const c = page.locator('#page-admin button.adm-cat', { has: page.locator('.adm-cat-l', { hasText: /^Users/ }) })
  if (!(await c.count())) fail('no Users tile in Admin')
  await press(s, c.first(), 'Users tile')
  const r = page.locator(`[data-person="${pid}"] .acc-tap`).first()
  await r.waitFor({ state: 'attached' }); await r.scrollIntoViewIfNeeded(); await press(s, r, `row ${pid}`)
  await page.waitForSelector('[data-testid="acc-sq"]', { timeout: 8000 })
  const b = page.locator(`[data-testid="acc-sq"] [aria-label="Access to ${unitNum}"] button[data-line="${line}"]`)
  if (!(await b.count())) fail(`no ${line} line for ${unitNum} on ${pid}`)
  if ((await b.getAttribute('aria-pressed')) !== 'true') { await b.scrollIntoViewIfNeeded(); await press(s, b, `${line} of ${unitNum}`) }
  await press(s, '#accEdSave', 'Save (account)')
  await page.waitForFunction(() => !document.querySelector('#accEdSave') || document.querySelector('#accEdSave').getBoundingClientRect().width === 0, null, { timeout: 8000 }).catch(() => {})
  const now = await page.evaluate(() => document.querySelector('#toastEl')?.textContent?.trim() || '')
  log(`access: ${pid} ${line} of ${unitNum} saved; toast: ${now}`)
}

/* the question / alert box as drawn */
export const dlg = s => s.page.evaluate(() => {
  const d = document.querySelector('#dlgModal'), m = document.querySelector('#dlgMsg')
  if (!d || d.getBoundingClientRect().width < 2) return { up: false }
  const box = e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round) }
  return { up: true, msg: m ? m.textContent.trim() : null, box: box(d), msgBox: m ? box(m) : null, btns: [...d.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()) }
})
export const waitDlg = (s, re) => s.page.waitForFunction(src => { const m = document.querySelector('#dlgMsg'); return !!m && m.getBoundingClientRect().width > 0 && new RegExp(src).test(m.textContent) }, re.source, { timeout: 15000 }).catch(() => fail(`no box with words /${re.source}/`))
export const waitNoDlg = s => s.page.waitForFunction(() => { const d = document.querySelector('#dlgModal'); return !d || d.getBoundingClientRect().width < 2 }, null, { timeout: 15000 })

/* where he is, as drawn */
export const where = s => s.page.evaluate(() => {
  const shown = e => { if (!e) return false; const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return b.width > 1 && b.height > 1 && c.visibility !== 'hidden' && c.display !== 'none' }
  const t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null
  const mark = [...document.querySelectorAll('.topbar .mark')].find(shown) || document.querySelector('.drawer-sqn .mark')
  return { page: document.querySelector('.page.on')?.id || null, sq: t(mark), badge: t([...document.querySelectorAll('#roleBadge')].find(shown)), roleLine: t(document.querySelector('#drawerRole')), signedOut: shown(document.querySelector('#luser')) }
})

/* the Tracker's save corner and its bar, measured */
export const bar = s => s.page.evaluate(() => {
  const st = document.getElementById('saveStat'), hdr = document.querySelector('#page-tracker header'), btn = document.getElementById('saveChanges')
  const shown = e => { if (!e) return false; const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return b.width > 0.5 && b.height > 0.5 && c.visibility !== 'hidden' && c.display !== 'none' && !e.hidden }
  const out = { trackerShown: shown(document.querySelector('#page-tracker')) }
  if (hdr) {
    const r = hdr.getBoundingClientRect()
    out.barHeight = Math.round(r.height * 10) / 10
    /* rows: the distinct tops of every drawn control in the bar (buttons, drop-downs, boxes, the save words) */
    const tops = [...hdr.querySelectorAll('button, select, input, #saveStat, h1')].filter(shown).map(e => { const b = e.getBoundingClientRect(); return Math.round((b.top + b.bottom) / 2) })
    const rows = []; for (const t of tops.sort((a, b) => a - b)) if (!rows.length || t - rows[rows.length - 1] > 14) rows.push(t)
    out.barRowMiddles = rows
    out.barRows = rows.length
  }
  out.saveChangesShown = shown(btn)
  out.saveChangesText = btn ? btn.textContent.trim() : null
  if (!st) { out.stat = 'absent'; return out }
  const cs = getComputedStyle(st), r = st.getBoundingClientRect()
  out.statShown = shown(st)
  out.fullText = st.textContent
  out.cls = st.className
  out.boxWidth = Math.round(r.width * 10) / 10
  out.boxHeight = Math.round(r.height * 10) / 10
  out.textWidth = st.scrollWidth
  out.clientWidth = st.clientWidth
  out.overflow = cs.overflow; out.textOverflow = cs.textOverflow; out.whiteSpace = cs.whiteSpace; out.maxWidth = cs.maxWidth
  out.fontSize = cs.fontSize; out.color = cs.color
  out.cut = st.scrollWidth > st.clientWidth + 0.5
  out.padding = `${cs.paddingLeft} ${cs.paddingRight}`
  const full = st.textContent
  /* the words' full natural width: a copy of the span, same font, no cap, no padding, off screen */
  const cl = st.cloneNode(true); cl.removeAttribute('id'); cl.hidden = false
  Object.assign(cl.style, { position: 'fixed', left: '-9999px', top: '0', maxWidth: 'none', width: 'auto', padding: '0', overflow: 'visible' })
  st.parentNode.appendChild(cl); out.naturalTextWidth = Math.round(cl.getBoundingClientRect().width * 10) / 10
  const ellS = cl.cloneNode(false); ellS.textContent = '…'; st.parentNode.appendChild(ellS); const ellW = ellS.getBoundingClientRect().width; cl.remove(); ellS.remove()
  /* the words a person can read: each character's drawn place (a Range), kept where it ends before the room left for "…" */
  if (!out.statShown) out.visibleText = ''
  else if (!out.cut) out.visibleText = full
  else {
    const node = st.firstChild, contentRight = r.left + st.clientLeft + st.clientWidth - parseFloat(cs.paddingRight)
    let n = 0
    for (let i = 0; i < full.length; i++) { const rg = document.createRange(); rg.setStart(node, i); rg.setEnd(node, i + 1); const cr = rg.getBoundingClientRect(); if (cr.right <= contentRight - ellW + 0.5) n = i + 1; else break }
    out.visibleText = full.slice(0, n).replace(/\s+$/, '') + '…'
  }
  return out
})
export function barFacts(prefix, b) {
  for (const k of ['trackerShown', 'statShown', 'fullText', 'visibleText', 'cls', 'boxWidth', 'textWidth', 'naturalTextWidth', 'clientWidth', 'padding', 'cut', 'overflow', 'textOverflow', 'whiteSpace', 'maxWidth', 'fontSize', 'color', 'barHeight', 'barRows', 'barRowMiddles','saveChangesShown', 'saveChangesText']) fact(`${prefix}.${k}`, b[k])
}

/* the bell: opened, its lines read, shut */
export async function bellLines(s) {
  const btn = s.page.locator('#notifyBell, .bellbtn').filter({ visible: true })
  if (!(await btn.count())) return { bell: 'not on screen' }
  const badge = await btn.first().textContent()
  await press(s, btn.first(), 'bell')
  await s.page.waitForSelector('[data-testid="bell-list"]', { timeout: 5000 }).catch(() => {})
  const lines = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line, [data-testid="bell-empty"]')].filter(l => l.getBoundingClientRect().height > 0).map(l => l.textContent.replace(/\s+/g, ' ').trim()))
  return { badge: (badge || '').replace(/\s+/g, ' ').trim(), lines, open: true }
}
export async function bellClose(s) { await s.page.keyboard.press('Escape'); await frames(s) }

/* a new event made in the chart's layout editor by presses: an unsaved chart edit */
export async function addEvent(s, name) {
  const { page } = s
  await press(s, '#sylMenuBtn', 'Syllabus menu'); await press(s, '#arrangeBtn', 'Edit chart layout')
  await page.waitForSelector('#arrTools', { state: 'attached', timeout: 10000 })
  const add = page.locator('#arrTools button', { hasText: '+ Test' }).first()
  if (!(await add.isVisible())) await press(s, page.locator('#page-tracker button', { hasText: 'Tools ▾' }).first(), 'Tools ▾')
  await press(s, add, '+ Test')
  await page.waitForSelector('#dlgInput', { state: 'visible' })
  if (s.desk) await page.locator('#dlgInput').filter({ visible: true }).first().fill(name)
  /* on a phone the name is set through the box's own input event, never typed (the mock-ups guide: typing zooms the page) */
  else await page.evaluate(n => { const i = [...document.querySelectorAll('#dlgInput')].find(e => e.getBoundingClientRect().width > 0); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })) }, name)
  await press(s, '#dlgOk', 'OK (name)'); await waitNoDlg(s)
  await press(s, '#sylMenuBtn', 'Syllabus menu'); await press(s, '#arrangeBtn', 'Edit chart layout (off)')
  await page.waitForSelector('#saveChanges', { state: 'visible', timeout: 10000 }).catch(() => fail('no ✓ Save changes after adding an event'))
  const has = await page.evaluate(n => document.querySelector('#page-tracker').innerText.includes(n), name)
  if (!has) fail(`event ${name} not on the chart`)
}

/* pictures: the whole screen, and a crop of the place (about 700px wide on a desktop, the full width on a phone) */
export async function shots(s, name, sel) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await frames(s)
  const full = `${PICS}/${name}-full.png`
  await page.screenshot({ path: full })
  let crop = null
  if (sel) {
    const r = await page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0); if (!e) return null; const b = e.getBoundingClientRect(); return { L: b.left, T: b.top, R: b.right, B: b.bottom, W: innerWidth, H: innerHeight } }, sel)
    if (r) {
      let x, w
      if (s.desk) { w = Math.min(700, r.W); const mid = (r.L + r.R) / 2; x = Math.max(0, Math.min(r.W - w, mid - w / 2)); if (r.R - r.L > 680) { x = Math.max(0, r.L - 10); w = Math.min(r.W - x, r.R - r.L + 20) } }
      else { x = 0; w = r.W }
      const y = Math.max(0, r.T - 40), h = Math.min(r.H - y, r.B - r.T + 80)
      crop = `${PICS}/${name}-crop.png`
      await page.screenshot({ path: crop, clip: { x, y, width: w, height: h } })
    } else log(`crop ${name}: ${sel} not drawn — no crop`)
  }
  log(`PICTURES ${name}: ${full}${crop ? ' ; ' + crop : ''}`)
  return { full, crop }
}

/* Hunter (ad2/a2, an admin of 142) given Plan of 149 by Saber (ad/a) through Admin → Users; then signed in as Hunter, on
   149's Tracker. 142's Tracker opened once first: its first opening writes its seed records. */
export async function hunterOn149(s) {
  await signIn(s, 'ad', 'a')
  await setAccess(s, 'prowler', '149', 'plan')
  await logout(s); await waitSignedOut(s)
  await signIn(s, 'ad2', 'a2')
  await go(s, 'tracker'); await trackerReady(s)
  await pickSq(s, '149'); await shut(s)
  await s.page.waitForFunction(() => /149/.test(([...document.querySelectorAll('.topbar .mark')].find(e => e.getBoundingClientRect().width > 1) || document.querySelector('.drawer-sqn .mark'))?.textContent || ''), null, { timeout: 15000 }).catch(() => fail('the pick of 149 did not land'))
  await trackerReady(s)
}

export async function run(name, fn) {
  let code = 0
  try { await fn() } catch (e) { code = 1; console.error(`FAILED ${name}: ${String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')}`) }
  finally {
    if (errs.length) console.log('page errors:', JSON.stringify(errs.slice(0, 10)))
    await closeAll()
  }
  process.exit(code)
}
