// THE WALK OF ROUND 4 OF THE WORDS PASS (his D2521) — the shared helpers (chat 170, 24 Nov 26). MADE by
// .tmp/make-wr4-lib.mjs from words-r4.mjs's helpers (chat 163's script, whose routes passed on the real app that day):
// the same code, exported, with the build served INSIDE the test browser from a frozen folder (no port, no server) and
// the picture folder taken from the environment. Nothing here wipes a folder.
//   WR4_OUT  the run's own picture folder (required)        WR4_NEW  the frozen build under test (required)
//   WR4_OLD  the build of main, for lines the old build wrote (optional)
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'

export const OUT = process.env.WR4_OUT
export const NEW_DIR = process.env.WR4_NEW
export const OLD_DIR = process.env.WR4_OLD || ''
if (!OUT || !NEW_DIR || !existsSync(join(NEW_DIR, 'index.html'))) throw new Error('set WR4_OUT and WR4_NEW (a built folder holding index.html)')
mkdirSync(OUT, { recursive: true })
export const URL = 'http://localhost:4731/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
let WK = null
export const wkBrowser = async () => (WK ||= await webkit.launch())
const TYPES = { '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.txt': 'text/plain', '.map': 'application/json' }
/* every request to the walk's address is answered from the build folder `dir` (index.html as the fallback) */
export async function serve(ctx, dir) {
  const origin = new globalThis.URL(URL).origin
  await ctx.route('**/*', route => {
    const u = new globalThis.URL(route.request().url())
    if (u.origin !== origin) return route.abort()
    const rel = decodeURIComponent(u.pathname).replace(/^\/+/, '')
    let file = join(dir, rel)
    if (!rel || !existsSync(file) || !statSync(file).isFile() || !resolve(file).startsWith(resolve(dir))) file = join(dir, 'index.html')
    return route.fulfill({ status: 200, body: readFileSync(file), headers: { 'content-type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' } })
  })
}
/* the bundle a page is really running — proves which build a context was served */
export const bundleOf = page => page.evaluate(() => (document.querySelector('script[type="module"][src]')?.getAttribute('src') || '').split('/').pop())
export const finish = async () => { writeFileSync(join(OUT, 'facts.json'), JSON.stringify(facts, null, 1)); await browser.close(); if (WK) await WK.close() }
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const facts = { pictures: [], cases: {}, errors: [] }
export const log = (c, s) => { (facts.cases[c] ||= { log: [] }).log.push(s); console.log(`[${c}] ${s}`) }

export const SIZES = {
  phone: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
}
export const SIZE_SAYS = { phone: 'phone 402x874 @3x', desk: 'desktop 1440x900 @2x' }
export const NOMOTION = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}'
/* the ring on the changed words, drawn only in an "after" picture; an outline takes no room, so nothing moves */
export const RING = '.w4-chg{outline:1.5px solid #34c759;outline-offset:2px;border-radius:3px}'

/* ---------- worlds ---------- */
export async function newPage(size, state, dir = NEW_DIR, engine = 'chromium') {
  const ctx = await (engine === 'webkit' ? await wkBrowser() : browser).newContext({ ...SIZES[size], reducedMotion: 'reduce', ...(state ? { storageState: state } : {}) })
  await serve(ctx, dir); const page = await ctx.newPage()
  page.on('pageerror', e => facts.errors.push(`${size} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') facts.errors.push(`${size} console: ` + m.text().slice(0, 200)) })
  await page.goto(URL)
  await page.waitForFunction(() => document.querySelector('#luser') || document.querySelector('#vWeek .day'))
  await page.addStyleTag({ content: NOMOTION })
  return { ctx, page, tap: !!SIZES[size].hasTouch, size }
}
export async function signIn(w, user) {
  const { page } = w
  if (!(await page.locator('#luser').isVisible().catch(() => false))) {
    if (await page.locator('#logout:visible').count()) await page.locator('#logout:visible').click()
    else { await page.locator('#burger').click(); await sleep(400); await page.getByRole('button', { name: /^Log ?out/i }).first().click() }
    await page.locator('#luser').waitFor()
  }
  await page.fill('#luser', user); await page.fill('#lpass', user === 'ad' ? 'a' : user)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await sleep(500)
}
/* the next person, on another device: the stored world carried over (the app keeps its data in the browser's storage) */
export async function handOver(w, size, user, dir = NEW_DIR) {
  await sleep(1200)                                 // let the last save reach the store
  const state = await w.ctx.storageState({ indexedDB: true })
  await w.ctx.close()
  const n = await newPage(size, state, dir)
  await signIn(n, user)
  return n
}
export const press = async (w, loc) => { const l = (typeof loc === 'string' ? w.page.locator(loc) : loc).first(); await l.scrollIntoViewIfNeeded().catch(() => {}); await (w.tap ? l.tap() : l.click()); await sleep(w.tap ? 650 : 200) }
export const go = async (page, p) => { await page.evaluate(p => window.go(p), p); await page.waitForFunction(p => window.CURPAGE === p, p); await sleep(400) }
export const ids = page => page.evaluate(() => window.INPUTS.map(r => String(r.iid)))
export const recOf = (page, iid) => page.evaluate(i => { const r = window.INPUTS.find(x => String(x.iid) === String(i)); return r ? { type: r.type, title: r.title, date: r.date, endDate: r.endDate, allday: r.allday, half: r.half, s: r.s, e: r.e, cx: !!r.cx, cxr: r.cxr, remarks: r.remarks, people: (r.people || []).map(p => p.p), person: r.person, acc: r.acc } : null }, iid)

/* ---------- the Inputs page ---------- */
export const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
export async function toMonth(w, y, m) {
  await go(w.page, 'inputs')
  if (await w.page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(w, '#inCalBtn')
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await w.page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.indexOf(name.slice(0, 3)))
    if (!d) { await sleep(400); return }
    await press(w, d > 0 ? '#icNext' : '#icPrev'); await sleep(300)
  }
  throw new Error('the Inputs calendar never reached the month')
}
export async function openDay(w, iso) {
  await toMonth(w, +iso.slice(0, 4), +iso.slice(5, 7))
  await w.page.locator(`#inpCal [data-icday="${iso}"]`).focus()
  await w.page.keyboard.press('Enter')
  await w.page.locator('[data-testid="win-inputsday"]').waitFor()
  await sleep(350)
}
/* every question a Save can raise, answered the plain way (no document; OIL yes) — what was asked is returned */
export async function answerAsks(w) {
  const asked = []
  for (let i = 0; i < 5; i++) {
    await sleep(350)
    const p = w.page
    if (await p.locator('[data-testid="docconf-nodoc"]:visible').count()) { asked.push('document'); await press(w, '[data-testid="docconf-nodoc"]'); continue }
    if (await p.locator('[data-testid="oilconf"]:visible').count()) {
      asked.push('oil')
      const y = p.locator('[data-testid="oil-all"]:visible, [data-testid="oil-yes"]:visible')
      if (await y.count()) await press(w, y)
      await press(w, '[data-testid="oilconf-save"]'); continue
    }
    if (await p.locator('[data-testid="inped-swap-go"]:visible').count()) { asked.push('swap'); await press(w, '[data-testid="inped-swap-go"]'); continue }
    break
  }
  return asked
}
export const shownToast = page => page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return ''; const cs = getComputedStyle(t); return +cs.opacity > 0.05 && t.getBoundingClientRect().height > 0 ? (t.textContent || '').replace(/\s+/g, ' ').trim() : '' })
/* file an input through a day of the calendar and its "+ Input" */
export async function fileInput(w, c, iso, spec) {
  await openDay(w, iso)
  const before = await ids(w.page)
  await press(w, '#icPopAdd')
  await w.page.locator('#inpEditPop #inpEditType').waitFor()
  await w.page.selectOption('#inpEditPop #inpEditType', spec.type)
  if (spec.people) {
    if (spec.people.length > 1) {
      await press(w, '#inpEditPop [data-testid="pp-several"]')
      for (const id of spec.people) if ((await w.page.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await press(w, `#inpEditPop [data-pp="${id}"]`)
      const lit = await w.page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
      for (const id of lit) if (!spec.people.includes(id)) await press(w, `#inpEditPop [data-pp="${id}"]`)
    } else if (await w.page.locator('#inpEditPop #inpEditPerson').count()) await w.page.selectOption('#inpEditPop #inpEditPerson', spec.people[0])
  }
  if (spec.span && await w.page.locator(`#inpEditSpan [data-span="${spec.span}"]`).count()) await press(w, `#inpEditSpan [data-span="${spec.span}"]`)
  if (spec.from) {
    const ad = w.page.locator('#inpEditPop #inpEditAllday')
    if (await w.page.locator('#inpEditSpan [data-span="custom"]').count()) await press(w, '#inpEditSpan [data-span="custom"]')
    else if (await ad.count() && await ad.isChecked()) await ad.click()
    await w.page.fill('#inpEditPop #inpEditStart', spec.from); await w.page.fill('#inpEditPop #inpEditEnd', spec.to)
  }
  if (spec.title) { const t = w.page.locator('#inpEditPop #inpEditOwnTitle'); if (await t.count()) await t.fill(spec.title); else log(c, 'NOTE: no Title box for type ' + spec.type) }
  if (spec.remarks) await w.page.fill('#inpEditPop #inpEditRmk', spec.remarks)
  await press(w, '#inpEditSave')
  const asked = await answerAsks(w)
  const said = await shownToast(w.page)
  const made = (await ids(w.page)).filter(x => !before.includes(x))
  if (await w.page.locator('[data-testid="win-inputedit"]:visible').count()) log(c, 'NOTE: the input window is still open after Save — the note: ' + JSON.stringify(said))
  if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
  log(c, `filed ${JSON.stringify(spec)} on ${iso}: new input ${JSON.stringify(made)}; asked ${JSON.stringify(asked)}; note ${JSON.stringify(said)}`)
  return made.length === 1 ? made[0] : null
}
/* open a saved input from its day, change it with `edit`, Save */
export async function editInput(w, c, iid, iso, edit) {
  await openDay(w, iso)
  const card = w.page.locator(`[data-testid="win-inputsday"] [data-iid="${iid}"], [data-testid="win-inputsday"] [data-popiid="${iid}"]`).first()
  if (!(await card.count())) throw new Error(`no card for ${iid} in the day ${iso}`)
  await press(w, card)
  await w.page.locator('[data-testid="win-inputedit"]').waitFor({ timeout: 5000 })
  await sleep(400)
  await edit()
  await press(w, '#inpEditSave')
  const asked = await answerAsks(w)
  const said = await shownToast(w.page)
  const open = await w.page.locator('[data-testid="win-inputedit"]:visible').count()
  log(c, `saved the change: asked ${JSON.stringify(asked)}; note ${JSON.stringify(said)}; window still open: ${!!open}`)
  if (open) { await w.page.keyboard.press('Escape'); await sleep(300); const d = w.page.getByRole('button', { name: /Discard|Close it/ }).first(); if (await d.count()) await d.click().catch(() => {}) }
  if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
  return { asked, said }
}

/* ---------- pictures ---------- */
/* the viewport box round some elements, padded and kept on the screen */
export const boxOf = (page, sels, pad = 12, opts = {}) => page.evaluate(([sels, pad, o]) => {
  let L = 1e9, T = 1e9, R = -1e9, B = -1e9
  for (const s of sels) for (const e of document.querySelectorAll(s)) {
    const r = e.getBoundingClientRect(); if (r.width <= 1 || r.height <= 1) continue
    L = Math.min(L, r.left); T = Math.min(T, r.top); R = Math.max(R, r.right); B = Math.max(B, r.bottom)
  }
  if (L > R) return null
  const x = o.fullWidth ? 0 : Math.max(0, L - pad), y = o.fromTop ? 0 : Math.max(0, T - pad)
  const r = o.fullWidth ? innerWidth : Math.min(innerWidth, R + pad), b = Math.min(innerHeight, B + pad)
  return { x, y, width: r - x, height: b - y }
}, [sels, pad, opts])
export async function shot(page, c, name, clip, text, size, extra = {}) {
  if (!clip) { facts.errors.push(`${c} ${name}: nothing to clip`); log(c, `NO PICTURE ${name}: nothing to clip`); return }
  const file = name + '.png'
  await page.screenshot({ path: join(OUT, file), clip })
  facts.pictures.push({ file, case: c, size: SIZE_SAYS[size], text, ...extra })
  log(c, `picture ${file}: ${JSON.stringify(text)}`)
}
/* swap words in a node and ring them; returns what the node now says */
export const swapIn = (page, sel, html) => page.evaluate(([sel, html, ring]) => {
  if (!document.getElementById('w4-ring')) { const s = document.createElement('style'); s.id = 'w4-ring'; s.textContent = ring; document.head.append(s) }
  const e = typeof sel === 'string' ? document.querySelector(sel) : null
  if (!e) return null
  e.innerHTML = html
  return (e.textContent || '').replace(/\s+/g, ' ').trim()
}, [sel, html, RING])
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')

/* the note at the foot, held where it stands once it shows (a passing note fades after a few seconds) */
export async function catchToast(page, re, timeout = 6000) {
  try {
    await page.waitForFunction(src => { const t = document.getElementById('toastEl'); if (!t) return false; const cs = getComputedStyle(t); return +cs.opacity > 0.5 && new RegExp(src, 'i').test(t.textContent || '') }, re.source, { timeout })
  } catch { return null }
  await page.evaluate(() => { const s = document.createElement('style'); s.id = 'w4-hold'; s.textContent = '#toastEl{opacity:1 !important}'; document.head.append(s) })
  return page.evaluate(() => (document.getElementById('toastEl').textContent || '').replace(/\s+/g, ' ').trim())
}
export const releaseToast = page => page.evaluate(() => document.getElementById('w4-hold')?.remove())
export const toastClip = (page, pad = 40) => boxOf(page, ['#toastEl'], pad)
export async function toastPair(w, c, name, re, after, extraSels = [], part = null) {
  const today = await catchToast(w.page, re)
  if (!today) { const now = await shownToast(w.page); log(c, `NOT AS DRAFTED: no note matching ${re} — the note showing: ${JSON.stringify(now)}`); if (now) await shot(w.page, c, `${name}-what-showed`, await toastClip(w.page), now, w.size); return null }
  await w.page.mouse.move(2, 2).catch(() => {})
  const clip = await boxOf(w.page, ['#toastEl', ...extraSels], 40)
  await shot(w.page, c, `${name}-today`, clip, today, w.size)
  if (after != null) {
    /* only the part the case is about is swapped — what the note says before it stays as the app printed it */
    const at = part ? today.search(part) : -1
    const now = await swapIn(w.page, '#toastEl', `${at > 0 ? esc(today.slice(0, at)) : ''}<span class="w4-chg">${esc(after)}</span>`)
    await shot(w.page, c, `${name}-after`, await boxOf(w.page, ['#toastEl', ...extraSels], 40), now, w.size, { swappedFrom: today })
  }
  await releaseToast(w.page)
  return today
}

/* ---------- the bell, on Ranger's phone ---------- */
export async function openBell(w) {
  await go(w.page, 'viewsched')
  await w.page.evaluate(() => scrollTo(0, 0))
  const b = w.page.locator('#notifyBell:visible').first()
  await press(w, b)
  const list = await w.page.locator('[data-testid="bell-list"]').waitFor({ timeout: 4000 }).then(() => true).catch(() => false)
  if (!list) { log('bell', 'the bell opened no list; the note: ' + JSON.stringify(await shownToast(w.page))); return [] }
  await sleep(300)
  return w.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map((l, i) => {
    l.setAttribute('data-w4', String(i))
    const t = s => (l.querySelector(s)?.textContent || '').replace(/\s+/g, ' ').trim()
    return { i, name: t('.bl-name'), day: t('.bl-day'), what: t('.bl-what'), ago: t('.bl-ago') }
  }))
}
/* does each line's second line (what happened · who) fit on one line, or wrap? its lines counted by its height over its
   line height, and its box's width */
export const bellFit = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map(l => {
  const w = l.querySelector('.bl-what'); if (!w) return null
  const r = w.getBoundingClientRect(), cs = getComputedStyle(w)
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.35
  const lines = Math.round(r.height / lh)
  return { what: (w.textContent || '').replace(/\s+/g, ' ').trim(), lines, fitsOneLine: lines <= 1, boxWidth: Math.round(r.width), height: Math.round(r.height), lineHeight: lh }
}))
export const bellClip = page => boxOf(page, ['[data-testid="bell-list"]', '#notifyBell'], 10, { fullWidth: true, fromTop: true })
/* the today picture of the list, then an after picture per variant, each swapping one line's words before " · <who>" */
export async function bellPair(w, c, lines, pick, variants) {
  const L = lines.find(pick)
  log(c, 'Ranger\'s bell, as the app prints it: ' + JSON.stringify(lines.map(l => `${l.name} ${l.day} / ${l.what}`)))
  await shot(w.page, c, `${c}-phone-bell-today`, await bellClip(w.page), lines.map(l => `${l.name} ${l.day} / ${l.what}`), w.size, { line: L ? `${L.name} ${L.day} / ${L.what}` : null, fit: await bellFit(w.page) })
  if (!L) { log(c, 'NOT AS DRAFTED: no line of the drafted kind in the bell'); return null }
  for (const [tag, words] of variants) {
    const who = (/ · ([^·]+)$/.exec(L.what) || [])[1]
    const html = `<span class="w4-chg">${esc(words)}</span>${who ? ' · ' + esc(who) : ''}`
    const now = await swapIn(w.page, `[data-w4="${L.i}"] .bl-what`, html)
    await shot(w.page, c, `${c}-phone-bell-after${tag}`, await bellClip(w.page), now, w.size, { swappedFrom: L.what, fit: await bellFit(w.page) })
  }
  return L
}

export const RANGER = 'bane', HEX = 'rocky', WED = '2026-07-15', THU = '2026-07-16'
