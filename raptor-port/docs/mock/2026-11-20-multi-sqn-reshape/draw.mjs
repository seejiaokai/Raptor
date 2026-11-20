// Multi-squadron batch 1, the reshape plan (docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §11, §12) — the
// pictures for his round of questions (chat 125, 20 Nov 26), drawn on the REAL running app by
// .claude/skills/brainstorming/mockups-on-the-real-app.md: each picture is the real screen reached through the app's own
// controls, then at most ONE named transform. A new part is built from the app's own classes or cloned from a real
// neighbour, outlined pink and tagged "New"; the place a question is about is outlined and tagged with its number.
// Every staged record is asserted ON SCREEN (or, where no screen shows it yet, read back and said so) before a picture.
//
// The move used throughout unless said: Ranger, 142 → 149, counting from Thu 16 Jul 2026, saved on Wed 15 Jul.
// No screen saves a squadron move yet: it is written into storage as two home rows (his old squadron from 1 Jan, the new
// from the move's date) at the sign-in card, before anyone signs in — setup only, named in each caption.
//
//   q1a  Q1 · Hunter files an ALL AVAIL squadron meeting for Fri 24 Jul through the Inputs window; 142's Fri 24 Jul shows it (real)
//   q1b-142 / q1b-149  Q1 · Hunter's own move to 149 from Thu 16 Jul written: 142's Fri 24 Jul without it, 149's with it (real)
//   q2a  Q2 · Ranger's move written; Hunter, Edit Schedule, Mon 20 Jul: the sign-off box's list still offers Ranger (real;
//        the browser's own drop-down list drawn open in place — a picture cannot catch the browser's pop-up)
//   q2b  Q2 · the crew list for Mon 20 Jul beside it, which does not list him (real)
//   q2c  Q2 · the same list with Ranger's name hidden — the recommended look (drawn: hide)
//   q6a-142 / q6a-149  Q6 · Thu 16 Jul: 142's Leave War without his row; 149's with his row from 1 Jan (real)
//   q6b-142  Q6+Q3 · 142's war: Ranger's row as now to Wed 15 Jul, then the war's own outside-the-squadron look; Havoc
//        posted out through the war's own Post out beside it, the real case (drawn: the app's class on his cells)
//   q6b-149  Q6 · 149's war: his row from Thu 16 Jul, the same look before it; a man added with a post-in date of
//        Thu 16 Jul beside it, the real case (drawn: the app's class on his cells)
//   q6c  Q6 · Admin → Users, Ranger's row after the move: no posting tag (real); q6c-ref Havoc's row with his (real)
//   q4a / q4b  Q4 · Admin → Users, Ranger's row, the access ladder (the approved drawing's own function, from
//        docs/mock/2026-11-19-multi-sqn-pieces/draw.mjs p1): Wed 15 Jul 10:05 "View 150" lit; Thu 16 Jul "None" lit (drawn)
//   q5a  Q5 · Kestrel turns on 149's guest switch (real)
//   q5b  Q5 · a person waiting for access signs in with only 149's switch on (real)
//   q5c  Q5 · Hunter turns on 142's switch; the same person lands in 142's week (real)
//   q7a  Q7 · Ranger, his Leave War window open, words typed in its remarks, 23:58 Wed 15 Jul (real)
//   q7b0 Q7 · the same window at 00:00 Thu 16 Jul, today (real)
//   q7b  Q7 · …with the band across the window's top and "Close" (drawn, New)
//   q7c0 / q7c  Q7 · the Tracker's chart layout being edited across midnight: today (real), with the band (drawn, New)
//   (the plan's second revision, §11 rows A7 and "C6, C1 across a move", §12 Q6 and Q8)
//   q8a  Q8 · Ranger's move written; Hunter (142's admin, his person record `prowler`) files LL for Ranger on Tue 14 Jul
//        through Inputs → + New, stretches it to Fri 17 Jul and saves: today's general refusal, the window still open (real)
//   q8b  Q8 · the same window, the same passing note with the proposed words (drawn: the note's words changed, New)
//   q6d  Q6 (A7) · 142's Leave War: a refused Undo's note (reached through a real refused Undo) with the proposed words
//        (drawn: the note's words changed, New)
//
// Run from raptor-port/:  node docs/mock/2026-11-20-multi-sqn-reshape/draw.mjs
// MQ_ONLY=q1,q2 draws only those pieces (q1 q2 q4 q5 q6 q7 q8 q6d); MQ_SIZES=d or p for one size. The frozen dist/ is served
// from INSIDE the test browser (every request to the address below answered from dist/), so no server is needed and
// the bundle is checked against dist/index.html. Pictures and manifest.json: img/ beside this file. Demo data only.
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync, appendFileSync, existsSync, readFileSync, statSync } from 'node:fs'
import { join, extname, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
const req = createRequire(resolve(ROOT, 'package.json'))
const { chromium, webkit } = req('@playwright/test')
const DIST = resolve(ROOT, 'dist')
const BASE = 'http://localhost:4527'
const BUNDLE = (readFileSync(join(DIST, 'index.html'), 'utf8').match(/assets\/(index-[^"]+\.js)/) || [])[1]
if (!BUNDLE) throw new Error('dist/index.html names no bundle')
const OUT = resolve(HERE, 'img')
mkdirSync(OUT, { recursive: true })
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
const SZS = process.env.MQ_SIZES ? process.env.MQ_SIZES.split(',') : ['d', 'p']
const PINK = '#ff2d95'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PASS = { ad: 'a', us: 'us', ad2: 'a2', ad9: 'a9', us9: 'us9' }
const RANGER_MOVE = [{ pid: 'bane', old: 'u142', to: 'u149', from: '2026-07-16' }]
const HUNTER_MOVE = [{ pid: 'prowler', old: 'u142', to: 'u149', from: '2026-07-16' }]

const SIZES = {
  d: { name: 'desktop 1536×864 (Chromium, 2x)', engine: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'iPhone 402×874 (WebKit, touch, 3x)', engine: webkit, opts: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } },
}
const MARK_CSS = `
.mkq { outline: 2px solid ${PINK} !important; outline-offset: 2px !important; }
.mkq.mkq-in { outline-offset: -2px !important; }
.mkq-tag { position: absolute; z-index: 600; background: ${PINK}; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; }
.mkq-ptag { position: fixed; z-index: 2147483647; }
`
const TOAST_HIDE = `#toastEl { display: none !important; }`
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' }

// ---- the kit sent into the page (declares every helper it calls) ----
function kit() {
  const mq = {}
  mq.vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  mq.hide = e => { e.setAttribute('data-mqhid', '1'); e.style.setProperty('display', 'none', 'important') }
  mq.el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; e.setAttribute('data-mine', '1'); return e }
  // is r inside every clipping ancestor of el?
  mq.unclipped = (el, r) => {
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a)
      if (cs.overflow === 'visible' && cs.overflowX === 'visible' && cs.overflowY === 'visible') continue
      const b = a.getBoundingClientRect()
      if (r.left < b.left - 0.5 || r.right > b.right + 0.5 || r.top < b.top - 0.5 || r.bottom > b.bottom + 0.5) return false
    }
    return r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight
  }
  // a tag alone on the page, fixed, placed from the element's box (a still screen only — the method's one exception)
  mq.ptag = (el, text, at = 'tr') => {
    const b = el.getBoundingClientRect(), t = document.createElement('span')
    t.className = 'mkq-tag mkq-ptag'; t.textContent = text; t.setAttribute('data-mine', '1'); document.body.appendChild(t)
    const w = t.offsetWidth, h = t.offsetHeight
    let x = at === 'tl' ? b.left - 6 : at === 'r' ? b.right + 4 : b.right - w + 6, y = at === 'r' ? b.top + (b.height - h) / 2 : b.top - h + 4
    x = Math.max(2, Math.min(innerWidth - w - 2, x)); y = Math.max(2, Math.min(innerHeight - h - 2, y))
    t.style.left = x + 'px'; t.style.top = y + 'px'
    return t
  }
  // the mark: an outline on the element (it takes no room) and its tag as its own child at the top right; the element's
  // box must not move; a tag a clipping ancestor would cut goes on the page instead (still screens)
  mq.mark = (el, text, { inside = false, noTag = false, at = 'tr' } = {}) => {
    const b = el.getBoundingClientRect()
    const canHold = !['SELECT', 'INPUT', 'TEXTAREA', 'OPTION', 'IMG', 'TR', 'TBODY', 'TABLE'].includes(el.tagName)
    if (canHold && !noTag && text && getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.classList.add('mkq'); if (inside) el.classList.add('mkq-in')
    let t = null
    if (!noTag && text) {
      if (canHold) {
        t = document.createElement('span'); t.className = 'mkq-tag'; t.textContent = text; t.setAttribute('data-mine', '1')
        if (at === 'tl') { t.style.top = '-9px'; t.style.left = '-6px' } else { t.style.top = '-9px'; t.style.right = '-6px' }
        el.appendChild(t)
        if (!mq.unclipped(t, t.getBoundingClientRect())) { t.remove(); t = mq.ptag(el, text, at) }
      } else t = mq.ptag(el, text, at)
    }
    const a = el.getBoundingClientRect()
    if (!['x', 'y', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) < 0.6)) throw new Error('mark moved its element')
    return t
  }
  // the React way to set a box's value — the box's own input event, never typing (an emulated phone zooms to a typed box)
  mq.setVal = (el, v) => {
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v)
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }))
  }
  window.__mq = mq
}

const manifest = existsSync(join(OUT, 'manifest.json')) ? JSON.parse(readFileSync(join(OUT, 'manifest.json'), 'utf8')) : {}
const errs = []
const notes = []
const browsers = {}
const say = (...a) => { const s = a.join(' '); console.log(s); notes.push(s) }

async function world(sz, { user = null, time, moves = [], rows = {}, toasts = false }) {
  const S = SIZES[sz]
  if (!browsers[sz]) browsers[sz] = await S.engine.launch()
  const ctx = await browsers[sz].newContext(S.opts)
  await ctx.clock.install({ time: new Date(time) })
  await ctx.route(BASE + '/**', async route => {
    const u = new URL(route.request().url()); const p = decodeURIComponent(u.pathname)
    let f = join(DIST, p)
    if (p === '/' || !existsSync(f) || statSync(f).isDirectory()) f = join(DIST, 'index.html')
    await route.fulfill({ status: 200, body: readFileSync(f), headers: { 'content-type': TYPES[extname(f)] || 'application/octet-stream' } })
  })
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e.message}`); console.log('PAGEERROR', e.message) })
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  await page.goto(BASE + '/')
  await page.waitForSelector('#luser', { timeout: 20000 })
  const js = await page.evaluate(() => [...document.scripts].map(s => s.src).find(s => /index-/.test(s)) || '')
  if (!js.includes(BUNDLE)) throw new Error('not the dist bundle: ' + js)
  const w = { sz, phone: sz === 'p', ctx, page, toasts }
  if (moves.length || Object.keys(rows).length) await writeRows(w, moves, rows)
  if (user) await login(w, user)
  return w
}
// setup only: the move (two home rows) and any other stored row, written at the sign-in card, then the page reloaded
async function writeRows(w, moves, rows = {}) {
  const back = await w.page.evaluate(({ ms, rows }) => {
    let n = 0; const keys = []
    for (const m of ms) {
      const a = 'h' + (Date.now() + (n++)).toString(36) + 'a', b = 'h' + (Date.now() + (n++)).toString(36) + 'b'
      localStorage.setItem('raptor:settings/home:' + a, JSON.stringify({ id: a, pid: m.pid, unit: m.old, from: '2026-01-01' }))
      localStorage.setItem('raptor:settings/home:' + b, JSON.stringify({ id: b, pid: m.pid, unit: m.to, from: m.from })); keys.push('home:' + a, 'home:' + b)
    }
    for (const [k, v] of Object.entries(rows)) { localStorage.setItem('raptor:settings/' + k, JSON.stringify(v)); keys.push(k) }
    return keys.map(k => k + '=' + localStorage.getItem('raptor:settings/' + k))
  }, { ms: moves, rows })
  await w.page.reload(); await w.page.waitForSelector('#luser', { timeout: 20000 }); await sleep(600)
  return back
}
async function login(w, user) {
  const p = w.page
  await p.waitForSelector('#luser', { timeout: 20000 })
  await p.fill('#luser', user); await p.fill('#lpass', PASS[user] ?? 'x')
  await p.click('#loginForm button[type=submit]')
  if (PASS[user]) await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(800)
  await p.addStyleTag({ content: MARK_CSS + (w.toasts ? '' : TOAST_HIDE) })
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto' })
}
async function signOut(w) {
  const p = w.page
  if (w.phone && await p.locator('#burger:visible').count()) { await p.locator('#burger').tap(); await sleep(500) }
  const b = p.getByRole('button', { name: /sign out|log ?out/i }).first()
  await b.waitFor({ state: 'visible', timeout: 8000 })
  await tap(w, b)
  await p.waitForSelector('#luser', { timeout: 20000 }); await sleep(700)
}
const tap = async (w, loc) => { if (w.phone) await loc.tap(); else await loc.click() }
async function nav(w, pg) {
  const p = w.page
  if (w.phone) { await p.locator('#burger').tap(); await sleep(500) }
  await tap(w, p.locator(`[data-page="${pg}"]:visible`).first())
  await p.waitForFunction(x => window.CURPAGE === x, pg, { timeout: 10000 }).catch(() => {})
  await sleep(1200)
}
// the week of a date: the desktop's week button (its Monday, "Jul 20"); the phone's "Jump to a date" and the day
async function toWeek(w, mondayLabel, dayAria) {
  const p = w.page
  if (!w.phone) { await p.locator('button:visible', { hasText: new RegExp('^' + mondayLabel + '$') }).first().click(); await sleep(1300); return }
  await p.locator('button[aria-label="Jump to a date"]:visible').first().tap(); await sleep(800)
  await p.locator(`.dcal-d[aria-label^="${dayAria}"]:visible`).first().tap(); await sleep(1500)
}
async function setText(w, sel, v) {
  if (w.phone) await w.page.evaluate(({ sel, v }) => window.__mq.setVal(document.querySelector(sel), v), { sel, v })
  else await w.page.fill(sel, v)
}
async function clockTo(w, iso) {
  const now = await w.page.evaluate(() => Date.now())
  const ms = Date.parse(iso) - now
  if (ms > 0) await w.page.clock.fastForward(ms)
  await sleep(1200)
  return w.page.evaluate(() => new Date().toString().slice(0, 24))
}
function rec(file, q, sz, kind, transform, caption, asserted) { manifest[file] = { question: q, size: SIZES[sz].name, kind, transform, caption, asserted } }
// a picture: on a phone the whole screen; on a desktop the box round the given selectors (padded) or a region
async function shot(w, file, { sels = null, pad = 24, region = null, check = null } = {}) {
  const p = w.page
  if (!w.phone) await p.mouse.move(1, 1).catch(() => {})
  await p.evaluate(() => { const a = document.activeElement; if (a && a.blur && a !== document.body) a.blur() })
  await sleep(200)
  if (check) { const why = await p.evaluate(check); if (why !== true) throw new Error(file + ': premise gone — ' + why) }
  let clip = region
  if (!clip && sels && !w.phone) {
    const r = await p.evaluate(sels => {
      let L = 1e9, T = 1e9, R = -1e9, B = -1e9
      for (const s of sels) for (const e of document.querySelectorAll(s)) {
        const b = e.getBoundingClientRect(); if (!(b.width > 0) || b.bottom < 0 || b.top > innerHeight) continue
        L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.right); B = Math.max(B, b.bottom)
      }
      return L < 1e9 ? { L, T, R, B, W: innerWidth, H: innerHeight } : null
    }, sels)
    if (!r) throw new Error(file + ': nothing to frame ' + sels.join(','))
    const x = Math.max(0, r.L - pad), y = Math.max(0, r.T - pad)
    clip = { x, y, width: Math.min(r.W, r.R + pad) - x, height: Math.min(r.H, r.B + pad) - y }
  }
  await p.screenshot({ path: join(OUT, file), ...(clip ? { clip } : {}) })
  console.log('  wrote', file)
}
const ONSCREEN = sel => `[...document.querySelectorAll(${JSON.stringify(sel)})].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })`

// ===================== Q1 — the ALL AVAIL meeting =====================
async function fileMeeting(w) {
  const p = w.page
  await nav(w, 'inputs')
  if (!(await p.locator('#inNew:visible').count())) { await tap(w, p.locator('#inListBtn')); await sleep(800) }
  await tap(w, p.locator('#inNew')); await sleep(1400)
  await p.selectOption('#inpEditType', { label: 'Meeting' }); await sleep(500)
  await p.selectOption('#inpEditPerson', { label: 'ALL AVAIL' }); await sleep(500)
  await setText(w, '#inpEditOwnTitle', 'Squadron meeting')
  await setText(w, '#inpEditStart', '09:00'); await setText(w, '#inpEditEnd', '10:00')
  const d = p.locator('.inped-win .dcal-d[aria-label^="Fri 24 Jul 2026"]').first()
  await d.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  await tap(w, d); await sleep(500)
  const filled = await p.evaluate(() => ({ who: document.querySelector('#inpEditPerson').selectedOptions[0]?.text, type: document.querySelector('#inpEditType').selectedOptions[0]?.text, title: document.querySelector('#inpEditOwnTitle')?.value, s: document.querySelector('#inpEditStart')?.value, e: document.querySelector('#inpEditEnd')?.value, head: [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && e.getBoundingClientRect().width > 0 && /^New input/.test(e.textContent.trim())).map(e => e.textContent.trim())[0] || '' }))
  if (filled.who !== 'ALL AVAIL' || filled.type !== 'Meeting' || filled.title !== 'Squadron meeting' || !/Jul 24/.test(filled.head)) throw new Error('Q1 filing premise: ' + JSON.stringify(filled))
  await shot(w, `q1a-window-${w.sz}.png`, { sels: ['.inped-win'], pad: 16 })
  await tap(w, p.locator('#inpEditSave')); await sleep(1600)
  const nd = p.locator('button:visible', { hasText: /^(No document|Later|OK)$/ }).last()
  if (await nd.count()) { await tap(w, nd); await sleep(1200) }
  return filled
}
// Friday 24 Jul's column of the week in view (View-only Sched), its meeting row if any
async function friday(w) {
  const p = w.page
  await nav(w, 'viewsched')
  await toWeek(w, 'Jul 20', 'Fri 24 Jul 2026')
  // bring Friday's column into view sideways (a swipe would do the same); the page stays at its top
  await p.evaluate(() => {
    const d = [...document.querySelectorAll('#vWeek .day')].find(e => /Jul 24/.test(e.querySelector('.dt')?.textContent || '') && e.getBoundingClientRect().width > 0)
    d.scrollIntoView({ inline: 'start', block: 'nearest', behavior: 'instant' }); window.scrollTo(0, 0)
  })
  // wait until the column stands still (the week's own sideways scroll may glide)
  for (let i = 0, last = ''; i < 30; i++) {
    await sleep(150)
    const now = await p.evaluate(() => { const d = [...document.querySelectorAll('#vWeek .day')].find(e => /Jul 24/.test(e.querySelector('.dt')?.textContent || '') && e.getBoundingClientRect().width > 0); const r = d.getBoundingClientRect(); return Math.round(r.left * 10) + ',' + Math.round(r.top * 10) })
    if (now === last) break
    last = now
  }
  await sleep(300)
  return p.evaluate(() => {
    const d = [...document.querySelectorAll('#vWeek .day')].find(e => /Jul 24/.test(e.querySelector('.dt')?.textContent || '') && e.getBoundingClientRect().width > 0)
    if (!d) return { day: false }
    d.setAttribute('data-mqday', '1')
    const rowEl = [...d.querySelectorAll('tr, .prow, [class*=row]')].filter(e => /SQUADRON MEETING/i.test(e.innerText) && e.getBoundingClientRect().width > 0).sort((a, b) => a.innerText.length - b.innerText.length)[0]
    const cp = [...d.querySelectorAll('*')].find(e => /^COMMON PROGRAMME$/i.test(e.textContent.trim()) && e.children.length === 0)
    return { day: true, meeting: !!rowEl, rowText: rowEl ? rowEl.innerText.replace(/\s+/g, ' ').slice(0, 120) : '', cp: !!cp, head: d.innerText.split('\n').slice(0, 2).join(' ') }
  })
}
async function markMeeting(w, present) {
  return w.page.evaluate(present => {
    const mq = window.__mq, d = document.querySelector('[data-mqday]')
    if (present) {
      const rowEl = [...d.querySelectorAll('tr, .prow, [class*=row]')].filter(e => /SQUADRON MEETING/i.test(e.innerText) && e.getBoundingClientRect().width > 0).sort((a, b) => a.innerText.length - b.innerText.length)[0]
      // a table row cannot hold a tag: its first cell carries the outline's tag; the outline goes on the row's cells' box
      const target = rowEl.tagName === 'TR' ? rowEl.firstElementChild : rowEl
      mq.mark(rowEl.tagName === 'TR' ? rowEl : rowEl, null, { inside: true, noTag: true })
      mq.ptag(target, '1', 'tl')
      return rowEl.tagName
    }
    // absent: the Common Programme section, outlined, its tag "1"
    const h = [...d.querySelectorAll('*')].find(e => /^COMMON PROGRAMME$/i.test(e.textContent.trim()) && e.children.length === 0)
    // the Common Programme's own block: the largest box round its heading that holds no other section
    let sec = h; while (sec.parentElement && sec !== d && !/SODB/.test(sec.innerText)) sec = sec.parentElement
    // its outline only, the tag on the page beside its corner (a child tag shifted this block — the mark check caught it)
    mq.mark(sec, null, { inside: true, noTag: true }); mq.ptag(sec, '1', 'tr')
    return sec.className
  }, present)
}
// the top bar kept (it names who is signed in), Friday's column and its Common Programme
const Q1CROP = w => (w.phone ? null : { x: 0, y: 0, width: 1536, height: 640 })
async function q1(sz) {
  const w = await world(sz, { user: 'ad2', time: '2026-07-15T10:00:00' })
  const p = w.page
  const filled = await fileMeeting(w)
  let f = await friday(w)
  if (!f.meeting) throw new Error('Q1a: the meeting is not on 142\'s Fri 24 Jul: ' + JSON.stringify(f))
  await markMeeting(w, true)
  await shot(w, `q1a-${sz}.png`, { sels: ['[data-mqday]'], pad: 12, region: Q1CROP(w) })
  rec(`q1a-${sz}.png`, 'Q1', sz, 'real', 'none (marks only)', `Wed 15 Jul, 10:00. Hunter (a 142 admin) filed, through the Inputs window ("+ New" on Inputs: Meeting, ALL AVAIL, "Squadron meeting", 09:00–10:00, Fri 24 Jul — the filled window is q1a-window-${sz}.png), an ALL AVAIL squadron meeting. View-only Sched, week of 20 Jul, Friday: 142's Common Programme shows it (1).`, `filled: ${JSON.stringify(filled)}; on screen: "${f.rowText}"`)
  rec(`q1a-window-${sz}.png`, 'Q1', sz, 'real', 'none', 'The Inputs window as Hunter filled it, before he pressed Add.', JSON.stringify(filled))
  // 1b — Hunter's own move to 149 from Thu 16 Jul (setup: written at the sign-in card)
  await signOut(w)
  const back = await writeRows(w, HUNTER_MOVE)
  await login(w, 'ad2')
  f = await friday(w)
  if (f.meeting || !f.cp) throw new Error('Q1b-142 premise: ' + JSON.stringify(f))
  await markMeeting(w, false)
  await shot(w, `q1b-142-${sz}.png`, { region: Q1CROP(w) })
  rec(`q1b-142-${sz}.png`, 'Q1', sz, 'real', 'none (marks only)', `Setup: Hunter's own move 142 → 149, counting from Thu 16 Jul, written into storage (no screen saves a move yet). Hunter signs in again on Wed 15 Jul (still 142's that day): 142's Fri 24 Jul — the meeting has left 142's Common Programme (1).`, `rows: ${back.join('; ')}; on screen Friday: "${f.head}", no "SQUADRON MEETING"`)
  await signOut(w); await login(w, 'ad9')
  f = await friday(w)
  if (!f.meeting) throw new Error('Q1b-149 premise: ' + JSON.stringify(f))
  await markMeeting(w, true)
  await shot(w, `q1b-149-${sz}.png`, { region: Q1CROP(w) })
  rec(`q1b-149-${sz}.png`, 'Q1', sz, 'real', 'none (marks only)', `The same world: Kestrel (149's admin) signs in. 149's Fri 24 Jul now shows 142's meeting (1). The top bar's mark still reads "142" on Kestrel's 149 schedule — the screen names no squadron; this is 149's week.`, `on screen: "${f.rowText}"`)
  await w.ctx.close()
}

// ===================== Q2 — the sign-off boxes =====================
// the browser's own drop-down list cannot be pictured (Chromium draws it outside the page; an iPhone draws a wheel): the
// box itself is cloned as an open list under its pill — the same options, in the same order, the clone's ids stripped
async function openList(w, { hideRanger = false } = {}) {
  return w.page.evaluate(hideRanger => {
    const mq = window.__mq
    const sel = [...document.querySelectorAll('select[data-signday="0"][data-sign="sked"]')].find(e => mq.vis(e))
    const pill = sel.closest('label')
    const c = sel.cloneNode(true); c.removeAttribute('data-sign'); c.removeAttribute('data-signday'); c.setAttribute('data-mine', '1'); c.setAttribute('data-mqlist', '1')
    c.size = sel.options.length; c.value = ''
    // the app's own rules stretch this box invisibly over its pill: they are reverted to the browser's own list look, and
    // the list is placed on the page under the pill (fixed — the screen is still from here to the picture)
    const pr = pill.getBoundingClientRect()
    c.removeAttribute('class')
    c.setAttribute('style', `all:revert !important; position:fixed !important; left:${pr.left}px !important; top:${pr.bottom + 4}px !important; z-index:2147483000 !important; min-width:${pr.width}px !important; font-size:14px !important; pointer-events:none !important; overflow:hidden !important;`)
    document.body.appendChild(c)
    const opt = [...c.options].find(o => o.text === 'Ranger')
    // (WebKit draws one row fewer than the size asked when a line is hidden: the size stays whole there)
    if (hideRanger) { mq.hide(opt); c.size = sel.options.length - (/AppleWebKit/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) ? 0 : 1) }
    return { n: sel.options.length, names: [...sel.options].map(o => o.text), ranger: !!opt }
  }, hideRanger)
}
async function q2(sz) {
  const w = await world(sz, { user: 'ad2', time: '2026-07-15T10:00:00', moves: RANGER_MOVE })
  const p = w.page
  await nav(w, 'editsched')
  await toWeek(w, 'Jul 20', 'Mon 20 Jul 2026')
  await p.evaluate(() => window.scrollTo(0, 0))
  const head = await p.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day, .day')].find(e => e.getBoundingClientRect().width > 0 && /Jul 20/.test(e.innerText.slice(0, 80))); return d ? d.innerText.split('\n').slice(0, 2).join(' ') : null })
  if (!head) throw new Error('Q2: Monday 20 Jul not on screen')
  // Monday's heading (its name and date) kept in every crop
  await p.evaluate(() => { const s = [...document.querySelectorAll('select[data-signday="0"]')].find(e => e.getBoundingClientRect().width > 0); const d = s.closest('.day') || s.closest('[class*=day]'); const h = [...d.querySelectorAll('*')].find(e => e.children.length === 0 && /^Monday$/.test(e.textContent.trim())); (h || d).setAttribute('data-mqmon', '1') })
  // 2a: the list, real options
  const L = await openList(w)
  if (!L.ranger) throw new Error('Q2a premise: Ranger not offered')
  const g = await p.evaluate(() => {
    const mq = window.__mq, c = document.querySelector('[data-mqlist]'), o = [...c.options].find(x => x.text === 'Ranger')
    mq.mark(c, null, { noTag: true })
    // an option can hold no child: its tag on the page beside it (a still screen), and its own background lit
    o.style.background = 'rgba(255,45,149,.28)'
    const r = o.getBoundingClientRect(), t = mq.ptag(c, '2', 'r'); t.style.top = (r.top + r.height / 2 - 7) + 'px'
    return { top: Math.round(r.top), h: Math.round(r.height) }
  })
  const pick = '[data-mqlist]'
  await shot(w, `q2a-${sz}.png`, { sels: [pick, '.mkq-ptag', `[data-signday="0"]`, '[data-mqmon]'], pad: 28, check: () => !!document.querySelector('[data-mqlist]') || 'list gone' })
  rec(`q2a-${sz}.png`, 'Q2', sz, 'real', "the box's own list drawn open in place (the box cloned as an open list under its pill: the browser draws its drop-down outside the page, an iPhone a wheel at the foot of the screen — neither can be pictured); Ranger's line lit pink", `Setup: Ranger's move 142 → 149 from Thu 16 Jul, written into storage. Wed 15 Jul, 10:00: Hunter, Edit Schedule, week of 20 Jul. Monday 20 Jul's sign-off box "SKED CK" — its list still offers Ranger (2), though he is 149's from Thu 16 Jul.`, `options read from the real box: ${L.names.join(', ')}`)
  await p.evaluate(() => { for (const e of document.querySelectorAll('[data-mine]')) e.remove(); for (const e of document.querySelectorAll('.mkq')) e.classList.remove('mkq', 'mkq-in') })
  // 2c: the same list, Ranger's name hidden
  const L2 = await openList(w, { hideRanger: true })
  await p.evaluate(() => { const mq = window.__mq, c = document.querySelector('[data-mqlist]'); mq.mark(c, null, { noTag: true }); mq.ptag(c, '2', 'r') })
  await shot(w, `q2c-${sz}.png`, { sels: ['[data-mqlist]', '.mkq-ptag', `[data-signday="0"]`, '[data-mqmon]'], pad: 28 })
  rec(`q2c-${sz}.png`, 'Q2', sz, 'drawn', "hide: Ranger's line of the same list hidden (display:none), nothing removed", `The recommended look: Monday 20 Jul's "SKED CK" list offers only Monday's 142 people — Ranger's name is not in it (2).`, `${L2.n - 1} names shown of the box's ${L2.n}`)
  await p.evaluate(() => { for (const e of document.querySelectorAll('[data-mine]')) e.remove(); for (const e of document.querySelectorAll('.mkq')) e.classList.remove('mkq', 'mkq-in') })
  // 2b: the crew list for Monday — the day's name opens it in the aircrew panel
  await tap(w, p.locator('[data-crewday="0"]:visible').first()); await sleep(1300)
  const panelOn = () => p.evaluate(() => [...document.querySelectorAll('*')].some(e => /^AIRCREW/.test((e.innerText || '').trim()) && e.getBoundingClientRect().width > 150 && e.getBoundingClientRect().height > 300 && e.getBoundingClientRect().left >= -2 && e.getBoundingClientRect().right <= innerWidth + 2))
  if (!(await panelOn())) {
    // on the phone the panel waits behind its side tab, "AIRCREW", at the screen's right edge
    const tabEl = p.locator('*:visible', { hasText: /^AIRCREW$/ }).last()
    await tap(w, tabEl); await sleep(1300)
  }
  const crew = await p.evaluate(() => {
    const pan = [...document.querySelectorAll('*')].filter(e => /^AIRCREW/.test((e.innerText || '').trim()) && e.getBoundingClientRect().width > 150 && e.getBoundingClientRect().height > 300 && e.getBoundingClientRect().left >= -2 && e.getBoundingClientRect().right <= innerWidth + 2).sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height)[0]
    if (!pan) return null
    const names = [...pan.querySelectorAll('*')].filter(e => e.children.length === 0 && e.getBoundingClientRect().width > 0).map(e => e.textContent.trim())
    pan.setAttribute('data-mqcrew', '1')
    return { day: (pan.innerText.match(/AIRCREW[^\n]*\n?[^\n]*/) || [''])[0].replace(/\s+/g, ' '), ranger: names.includes('Ranger'), hunter: names.includes('Hunter'), n: names.length }
  })
  if (!crew || crew.ranger || !crew.hunter) throw new Error('Q2b premise: ' + JSON.stringify(crew))
  await p.evaluate(() => { const mq = window.__mq, pan = document.querySelector('[data-mqcrew]'); mq.mark(pan, '2', { inside: true }) })
  await shot(w, `q2b-${sz}.png`, { sels: ['[data-mqcrew]', `[data-signday="0"]`, '[data-mqmon]'], pad: 16 })
  rec(`q2b-${sz}.png`, 'Q2', sz, 'real', 'none (marks only)', `The same screen: Monday's name opens Monday 20 Jul's crew list (the aircrew panel) — it does not list Ranger (2); Hunter, still 142's, is on it.`, JSON.stringify(crew))
  await w.ctx.close()
}

// ===================== Q6 / Q3 — a moved man's row on both Leave Wars =====================
const lwJul = async w => { await tap(w, w.page.locator('button:visible', { hasText: /^JUL$/ }).first()); await sleep(1200) }
const rowCells = (p, pid) => p.evaluate(pid => [...document.querySelectorAll(`td[data-testid^="cell-${pid}-"]`)].filter(e => e.getBoundingClientRect().width > 0).length, pid)
async function q6a(sz) {
  const w = await world(sz, { user: 'ad', time: '2026-07-16T10:00:00', moves: RANGER_MOVE })
  const p = w.page
  await nav(w, 'leavewar'); await sleep(1500)
  await lwJul(w)
  const n142 = await p.evaluate(() => document.querySelectorAll('td[data-testid^="cell-bane-"]').length)
  const grp = await p.evaluate(() => [...document.querySelectorAll('tr.grp, .grp')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /SXO/.test(t))[0])
  if (n142 !== 0) throw new Error('Q6a-142 premise: Ranger has cells on 142\'s war: ' + n142)
  // mark the place his row stood: between Piston and Saber, the tag at the join of their name cells
  await p.evaluate(() => {
    const mq = window.__mq
    const nm = cs => [...document.querySelectorAll('td, th')].filter(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().left < 260 && e.innerText.trim().startsWith(cs)).filter(e => { const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!t && (e === t || e.contains(t)) }).sort((a, b) => a.getBoundingClientRect().width - b.getBoundingClientRect().width)[0]
    const a = nm('Piston'), b = nm('Saber')
    mq.mark(a, null, { inside: true, noTag: true }); mq.mark(b, null, { inside: true, noTag: true })
    const t = mq.ptag(b, '6', 'r'); t.style.top = (b.getBoundingClientRect().top - 7) + 'px'
  })
  await shot(w, `q6a-142-${sz}.png`, {})
  rec(`q6a-142-${sz}.png`, 'Q6', sz, 'real', 'none (marks only)', `Setup: Ranger's move 142 → 149 from Thu 16 Jul, written into storage. The clock on Thu 16 Jul, 10:00 (on Wed 15 Jul the war still reads him as 142's for the whole year). Saber, 142's Leave War, July: Ranger's row is gone from 142's war altogether — every month of his, January to 15 July included (6: where his row stood, between Piston and Saber).`, `no cell of Ranger's on 142's war; group heading "${grp}"`)
  await signOut(w); await login(w, 'ad9')
  await nav(w, 'leavewar'); await sleep(1500)
  await lwJul(w)
  const st = await p.evaluate(() => { const c = [...document.querySelectorAll('td[data-testid^="cell-bane-"]')]; return { n: c.length, gone: c.filter(e => e.classList.contains('gone')).length, first: c[0]?.getAttribute('data-testid') } })
  if (!st.n || st.gone) throw new Error('Q6a-149 premise: ' + JSON.stringify(st))
  await p.evaluate(() => {
    const mq = window.__mq
    const nm = [...document.querySelectorAll('td, th')].filter(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().left < 260 && e.innerText.trim().startsWith('Ranger')).filter(e => { const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!t && (e === t || e.contains(t)) }).sort((a, b) => a.getBoundingClientRect().width - b.getBoundingClientRect().width)[0]
    mq.mark(nm, '6', { inside: true })
    const d1 = document.querySelector('td[data-testid="cell-bane-2026-07-01"]'); if (d1 && mq.vis(d1)) mq.mark(d1, null, { inside: true, noTag: true })
  })
  await shot(w, `q6a-149-${sz}.png`, {})
  rec(`q6a-149-${sz}.png`, 'Q6', sz, 'real', 'none (marks only)', `The same world, Thu 16 Jul: Kestrel, 149's Leave War, July (the JUL button pressed): Ranger's row (6) is 149's for the whole year — 1 July to 15 July, before he came, counted as his days in 149 (no day greyed; 1 Jul outlined).`, `Ranger's cells on 149's war: ${st.n}, none outside his time`)
  await w.ctx.close()
}
// a cell's own class, as the grid draws a day outside a man's time in the squadron (matrix.css `.mx td.gone`); its words
// left as they are (none on these days). Returns how many cells took it.
async function goneCells(w, pid, from, to) {
  return w.page.evaluate(({ pid, from, to }) => {
    let n = 0
    for (const td of document.querySelectorAll(`td[data-testid^="cell-${pid}-"]`)) {
      const d = td.getAttribute('data-testid').slice(-10)
      if (d >= from && d <= to) { td.classList.add('gone'); td.setAttribute('data-mqgone', '1'); n++ }
    }
    return n
  }, { pid, from, to })
}
async function q6b142(sz) {
  const w = await world(sz, { user: 'ad', time: '2026-07-15T10:00:00', moves: RANGER_MOVE })
  const p = w.page
  await nav(w, 'leavewar'); await sleep(1500)
  // the real case: Havoc posted out through the war's own Post out — its date is his first day away (Thu 16 Jul; tried
  // first with Wed 15 Jul, which greyed the 15th too), so his last day is Wed 15 Jul, as Ranger's
  const hv = await p.evaluate(() => Object.entries(window.PEOPLE).find(([k, v]) => v.cs === 'Havoc')?.[0])
  const c = p.locator(`[data-testid="cell-${hv}-2026-07-16"]`).first()
  await c.scrollIntoViewIfNeeded(); await sleep(300); await tap(w, c); await sleep(1200)
  await tap(w, p.locator('[data-testid="bid-more"]:visible').first()); await sleep(600)
  await tap(w, p.locator('[data-testid="bid-postout"]:visible').first()); await sleep(800)
  const po = await p.evaluate(() => ({ date: document.querySelector('[data-testid="po-date"]')?.innerText || document.querySelector('[data-testid="po-date"] input')?.value || '', line: document.querySelector('[data-testid="po-line"]')?.innerText || '' }))
  await tap(w, p.locator('[data-testid="po-confirm"]:visible').first()); await sleep(1500)
  const err = await p.evaluate(() => document.querySelector('[data-testid="post-err"]')?.innerText || '')
  if (err) throw new Error('Q6b Post out refused: ' + err)
  const xb = p.locator('.bidsheet .x:visible, .bidsheet button[aria-label="Close"]:visible').first()
  if (await xb.count()) { await tap(w, xb); await sleep(800) }
  const hvState = await p.evaluate(hv => { const g = d => document.querySelector(`td[data-testid="cell-${hv}-${d}"]`); return { d15: g('2026-07-15')?.className, d16: g('2026-07-16')?.className, t16: g('2026-07-16')?.innerText.trim() } }, hv)
  if (!/gone/.test(hvState.d16 || '') || /gone/.test(hvState.d15 || '')) throw new Error('Q6b premise (Havoc posted out): ' + JSON.stringify(hvState))
  // the war at its own place for today (Wed 15 Jul first); the page scrolled down (as a finger would) until the SXO
  // group sits under the grid's own pinned row of dates, so Ranger's row and Havoc's are on one screen with their dates
  await p.evaluate(() => { const r = document.querySelector('td[data-testid="cell-bane-2026-07-16"]').getBoundingClientRect(); window.scrollBy(0, r.top - (innerWidth > 1000 ? 190 : 330)) }); await sleep(900)
  const rg = await p.evaluate(() => ({ n: document.querySelectorAll('td[data-testid^="cell-bane-"]').length }))
  if (!rg.n) throw new Error('Q6b-142: Ranger has no row on 142 on Wed 15 Jul')
  // the transform: Ranger's days from Thu 16 Jul take the grid's own outside-the-squadron class
  const n = await goneCells(w, 'bane', '2026-07-16', '2026-12-31')
  await p.evaluate(() => {
    const mq = window.__mq
    const a = document.querySelector('td[data-testid="cell-bane-2026-07-16"]'), b = document.querySelector('td[data-testid="cell-bane-2026-07-24"]')
    mq.mark(a, 'New', { inside: true }); mq.mark(b, '3', { inside: true })
  })
  // frame: from the SXO heading (Ranger) down to Havoc's row
  const region = !w.phone ? await p.evaluate(hv => { const h = document.querySelector(`td[data-testid="cell-${hv}-2026-07-16"]`).getBoundingClientRect(); return { x: 0, y: 0, width: 1536, height: Math.min(864, h.bottom + 30) } }, hv) : null
  const seen = await p.evaluate(hv => { const v = e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.width > 0 }; return { ranger: v(document.querySelector('td[data-testid="cell-bane-2026-07-16"]')), havoc: v(document.querySelector(`td[data-testid="cell-${hv}-2026-07-16"]`)) } }, hv)
  say('q6b-142', sz, 'on screen', JSON.stringify(seen))
  await shot(w, `q6b-142-${sz}.png`, { region, check: () => document.querySelector('td[data-testid="cell-bane-2026-07-16"]').classList.contains('gone') || 'class gone' })
  rec(`q6b-142-${sz}.png`, 'Q6, Q3', sz, 'drawn', `the grid's own class for a day outside a man's time in the squadron (\`gone\`, matrix.css) put on Ranger's ${n} cells from Thu 16 Jul; nothing else`, `Proposed, 142's Leave War (Saber, Wed 15 Jul): Ranger's row as now up to Wed 15 Jul, then from Thu 16 Jul (New) the war's own look for days outside a man's time — the grey hatch, with no "PO" in it, as no posting was set. Fri 24 Jul (3) is a day a master could no longer write Ranger's leave into here. Real, beside it: Havoc, posted out through the war's own Post out ("PO from" Thu 16 Jul, so his last day is Wed 15 Jul) — the same hatch, and "PO" in each day after.`, `Havoc's Post out: date "${po.date}", line "${po.line}"; his 15 Jul "${hvState.d15}", 16 Jul "${hvState.d16}" reads "${hvState.t16}"`)
  // 6c — Admin → Users: Ranger's row after the move (no posting tag) and Havoc's (with his)
  await nav(w, 'admin')
  if (!(await p.locator('#page-admin button.acc-main').first().isVisible().catch(() => false))) { await tap(w, p.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first()); await sleep(700) }
  const rows = await p.evaluate(() => {
    const row = cs => [...document.querySelectorAll('#page-admin .acc-row.od-row')].find(r => (r.querySelector('.acc-name')?.textContent || '') === cs)
    const r = row('Ranger'), h = row('Havoc')
    r.setAttribute('data-mqr', '1'); if (h) h.setAttribute('data-mqh', '1')
    return { ranger: r.querySelector('.acc-sub').innerText, rtag: !!r.querySelector('.od-po'), havoc: h ? h.querySelector('.acc-sub').innerText : null, htag: h ? (h.querySelector('.od-po')?.innerText || '') : null, hheld: h ? (h.querySelector('.acc-held')?.innerText || '') : null }
  })
  if (rows.rtag) throw new Error('Q6c premise: Ranger has a posting tag')
  if (rows.havoc) {
    await p.evaluate(() => document.querySelector('[data-mqh]').scrollIntoView({ block: 'center' })); await sleep(400)
    await shot(w, `q6c-ref-${sz}.png`, { sels: ['[data-mqh]'], pad: 20 })
    rec(`q6c-ref-${sz}.png`, 'Q6', sz, 'real', 'none', `For comparison, the same world: Havoc's row on Admin → Users after his Post out — the line under his callsign as the app draws it for a posting.`, JSON.stringify({ sub: rows.havoc, tag: rows.htag, held: rows.hheld }))
  }
  await p.evaluate(() => { const r = document.querySelector('[data-mqr]'); r.scrollIntoView({ block: 'center' }); window.__mq.mark(r.querySelector('.acc-sub'), '6') })
  await sleep(300)
  await shot(w, `q6c-${sz}.png`, { sels: ['[data-mqr]'], pad: 20 })
  rec(`q6c-${sz}.png`, 'Q6', sz, 'real', 'none (marks only)', `Admin → Users (Saber, Wed 15 Jul), Ranger's row after the move to 149 was written: the line under his callsign carries no posting tag (6) — the move is not a posting.`, JSON.stringify({ sub: rows.ranger, tag: rows.rtag }))
  await w.ctx.close()
}
async function q6b149(sz) {
  const w = await world(sz, { user: 'ad9', time: '2026-07-16T10:00:00', moves: RANGER_MOVE })
  const p = w.page
  // the real case: a man added on 149's Admin → Users with a post-in date of Thu 16 Jul (the form's own date box)
  await nav(w, 'admin')
  if (!(await p.locator('#page-admin button.acc-main').first().isVisible().catch(() => false))) { await tap(w, p.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first()); await sleep(700) }
  await setText(w, '#accAddCs', 'Swift'); await setText(w, '#accAddIni', 'SW')
  await p.selectOption('#accAddSeat', { label: 'Pilot' }); await sleep(300)
  const cats = await p.evaluate(() => [...document.querySelector('#accAddCat').options].map(o => o.text))
  await p.selectOption('#accAddCat', { label: cats.find(t => /CAT A|^A$/.test(t)) || cats[1] }); await sleep(300)
  const pi = p.locator('#accAddPostIn:visible, [id^="accAddPostIn"]:visible').first()
  await pi.scrollIntoViewIfNeeded(); await tap(w, pi); await sleep(700)
  await tap(w, p.locator('.dcal-d[aria-label^="Thu 16 Jul 2026"]:visible').first()); await sleep(600)
  const piText = await p.evaluate(() => document.querySelector('[id^="accAddPostIn"]')?.innerText || '')
  await tap(w, p.locator('#accAdd')); await sleep(1500)
  const added = await p.locator('#page-admin button.acc-main', { hasText: /^Swift/ }).count()
  if (!added) throw new Error('Q6b-149: Swift not added; post-in box read "' + piText + '"')
  await nav(w, 'leavewar'); await sleep(1500)
  await lwJul(w)
  const sw = await p.evaluate(() => Object.entries(window.PEOPLE).find(([k, v]) => v.cs === 'Swift')?.[0])
  const swState = await p.evaluate(sw => { const g = d => document.querySelector(`td[data-testid="cell-${sw}-${d}"]`); return { d15: g('2026-07-15')?.className, d16: g('2026-07-16')?.className, t15: g('2026-07-15')?.innerText.trim() } }, sw)
  if (!/gone/.test(swState.d15 || '') || /gone/.test(swState.d16 || '')) throw new Error('Q6b-149 premise (Swift posted in 16 Jul): ' + JSON.stringify(swState))
  const n = await goneCells(w, 'bane', '2026-01-01', '2026-07-15')
  if (w.phone) await p.evaluate(() => { document.querySelector('td[data-testid="cell-bane-2026-07-16"]').scrollIntoView({ inline: 'center', block: 'nearest' }); window.scrollTo(0, 0) })
  await sleep(500)
  await p.evaluate(() => { const mq = window.__mq; mq.mark(document.querySelector('td[data-testid="cell-bane-2026-07-15"]'), 'New', { inside: true }) })
  await shot(w, `q6b-149-${sz}.png`, { check: () => document.querySelector('td[data-testid="cell-bane-2026-07-15"]').classList.contains('gone') || 'class gone' })
  rec(`q6b-149-${sz}.png`, 'Q6', sz, 'drawn', `the grid's own class for a day outside a man's time (\`gone\`) put on Ranger's ${n} cells from 1 Jan to Wed 15 Jul; nothing else`, `Proposed, 149's Leave War (Kestrel, Thu 16 Jul, the JUL button pressed): Ranger's row from Thu 16 Jul; before it (New) the war's own look for days before a man arrives — the hatch, blank. Real, beside it: Swift, added on 149's Admin → Users with a post-in date of Thu 16 Jul — the same blank hatch before his first day.`, `Swift added (post-in box "${piText}"); his 15 Jul "${swState.d15}" reads "${swState.t15}", 16 Jul "${swState.d16}"`)
  await w.ctx.close()
}

// ===================== Q4 — the access ladder (the approved drawing's own function) =====================
// copied whole from docs/mock/2026-11-19-multi-sqn-pieces/draw.mjs (p1's `ladder` and its `toUsers`, `openRow`); the one
// change: the rungs' squadron number is a parameter (`sq`) where p1's were written "149"
async function toUsers(page) {
  await page.evaluate(() => window.go('admin'))
  await page.waitForSelector('#page-admin.on', { state: 'attached' })
  await page.waitForTimeout(600)
  if (!(await page.locator('#page-admin button.acc-main').first().isVisible())) {
    await page.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first().click()
    await page.waitForTimeout(600)
  }
}
async function openRow(page, cs) {
  await page.locator('#page-admin button.acc-main', { hasText: new RegExp('^' + cs) }).first().click()
  await page.waitForSelector('#page-admin .acc-edit')
  await page.waitForTimeout(400)
  await page.evaluate(() => { const e = document.querySelector('#page-admin .acc-edit'); e.closest('.acc-row').scrollIntoView({ block: 'center' }); document.activeElement && document.activeElement.blur && document.activeElement.blur() })
  await page.waitForTimeout(400)
}
async function ladder(page, { picked, off = [], note, sq = '149' }) {
  return page.evaluate(({ picked, off, note, sq }) => {
    const mq = window.__mq, ed = document.querySelector('#page-admin .acc-edit'), two = ed.querySelector('.adm-2col')
    const box = mq.el('div', 'mq-ladder'); box.style.margin = '10px 0 12px'
    const lbl = mq.el('div', 'mfield'); const s = mq.el('span', 'mfield-lbl', 'Other squadrons'); lbl.appendChild(s); box.appendChild(lbl)
    const g = mq.el('div', 'acc-acts acc-mode'); g.setAttribute('role', 'group')
    ;['None', `View ${sq}`, `Plan ${sq}`, 'Master admin'].forEach((t, i) => {
      const b = mq.el('button', 'abtn' + (i === picked ? ' primary' : ''), t); b.type = 'button'
      if (off.includes(i)) b.disabled = true
      g.appendChild(b)
    })
    box.appendChild(g)
    if (note) { const n = mq.el('p', 'adm-note', note); n.style.margin = '6px 0 0'; box.appendChild(n) }
    two.after(box)
    // the segmented pair's real gap and look are the app's; the label is the form's own label class
    mq.mark(box, 'New')
    const r = box.getBoundingClientRect(), e = ed.getBoundingClientRect()
    return { boxW: Math.round(r.width), edW: Math.round(e.width), rows: g.getBoundingClientRect().height > 50 ? 2 : 1 }
  }, { picked, off, note, sq })
}
const SQ150 = {
  'unit:u150': { id: 'u150', num: '150', kind: 'sqn' },
  'unitplace:up150': { id: 'up150', unit: 'u150', place: 'p1', from: '2000-01-01' },
  'grant:g150r': { id: 'g150r', account: 'acus', unit: 'u150', level: 'view', from: '2026-07-01' },
}
async function q4(sz) {
  for (const [k, time, picked, when] of [['a', '2026-07-15T10:05:00', 1, 'Wed 15 Jul, 10:05 — five minutes after Hunter saved Ranger\'s move to 149 (counting from Thu 16 Jul) at 10:00'], ['b', '2026-07-16T09:00:00', 0, 'Thu 16 Jul, 09:00 — the first day his move counts']]) {
    const w = await world(sz, { time })
    const back = await writeRows(w, RANGER_MOVE, SQ150)
    await login(w, 'ad')
    const p = w.page
    await toUsers(p); await openRow(p, 'Ranger')
    const m = await ladder(p, { picked, sq: '150' })
    const f = `q4${k}-${sz}.png`
    await shot(w, f, { sels: ['#page-admin .acc-row.od-row-on'], pad: 40 })
    rec(f, 'Q4', sz, 'drawn', 'the approved ladder (round of 19 Nov, picture p1) built by its own drawing function under Sign-in and Role on Ranger\'s open row — rungs lettered for 150; no line under it', `${when}. Saber, the master admin, has opened Ranger's row on Admin → Users. New: the "Other squadrons" ladder (not built yet) — ${picked === 1 ? '"View 150" still lit: his view of 150 lasts the rest of Wednesday, the day he is still 142\'s (the recommendation)' : '"None" lit: from Thursday his view of 150 is gone'}. Setup: 150 (a third squadron, at the same place) and Ranger's View of it written into storage — no screen makes a squadron or gives a right yet, and no screen shows either.`, `rows read back: ${back.join('; ')}; ladder ${m.boxW}px wide in a ${m.edW}px editor, ${m.rows} row(s)`)
    await w.ctx.close()
  }
}

// ===================== Q5 — the guest switch =====================
async function guestSwitch(w, who) {
  const p = w.page
  await nav(w, 'admin')
  if (!(await p.locator('#page-admin button.acc-main').first().isVisible().catch(() => false))) { await tap(w, p.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first()); await sleep(700) }
  const sw = p.locator('#admGuestView')
  await sw.scrollIntoViewIfNeeded(); await sleep(300)
  const before = await sw.isChecked()
  await tap(w, p.locator('#page-admin .acc-switch').first()); await sleep(900)
  const after = await sw.isChecked()
  if (before || !after) throw new Error(`Q5 ${who}: switch ${before} → ${after}`)
  await p.evaluate(() => document.querySelector('#page-admin .acc-switch').scrollIntoView({ block: 'center' })); await sleep(300)
  return { before, after }
}
async function requestAccess(w) {
  const p = w.page
  await p.fill('#luser', 'swift'); await p.fill('#lpass', 'x')
  await p.click('#loginForm button[type=submit]'); await sleep(1500)
  if (await p.locator('#accCs:visible').count()) {
    await setText(w, '#accCs', 'Swift'); await setText(w, '#accIni', 'SW')
    await p.selectOption('#accSeat', { label: 'Pilot' }); await sleep(300)
    const cats = await p.evaluate(() => [...document.querySelector('#accCat').options].map(o => o.text))
    await p.selectOption('#accCat', { label: cats[1] }); await sleep(300)
    await tap(w, p.getByRole('button', { name: 'Request access' }).first()); await sleep(1500)
  }
  await p.addStyleTag({ content: MARK_CSS + TOAST_HIDE })
  return p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 400))
}
async function q5(sz) {
  const w = await world(sz, { user: 'ad9', time: '2026-07-15T10:00:00' })
  const p = w.page
  const s = await guestSwitch(w, 'Kestrel')
  await p.evaluate(() => window.__mq.mark(document.querySelector('#page-admin .acc-switch'), '5'))
  await shot(w, `q5a-${sz}.png`, { sels: ['#page-admin .acc-switch', '#page-admin .adm-sub'], pad: 20, region: !w.phone ? await p.evaluate(() => { const b = document.querySelector('#page-admin .acc-switch').getBoundingClientRect(); return { x: b.left - 40, y: b.top - 120, width: 680, height: 170 } }) : null })
  rec(`q5a-${sz}.png`, 'Q5', sz, 'real', 'none (marks only)', `Wed 15 Jul. Kestrel (149's admin) on Admin → Users, at its foot: "Guest view" — he ticks it (5). It is 149's own switch (each squadron has its own).`, JSON.stringify(s))
  await signOut(w)
  const t1 = await requestAccess(w)
  await p.evaluate(() => { const mq = window.__mq; const h = [...document.querySelectorAll('h1,h2,h3,p,div')].filter(e => mq.vis(e) && /not on the squadron|waiting|with the admins|asked/i.test(e.textContent) && e.children.length < 4).sort((a, b) => a.textContent.length - b.textContent.length)[0]; if (h) mq.mark(h, '5') })
  await shot(w, `q5b-${sz}.png`)
  rec(`q5b-${sz}.png`, 'Q5', sz, 'real', 'none (marks only)', `A person waiting for access ("swift", whose request is with the admins) signs in with only 149's switch on: he is not let in to view any schedule — 149's switch does nothing for him (5).`, t1.slice(0, 300))
  // 142's switch on, by Hunter
  await tap(w, p.getByRole('button', { name: /sign out/i }).first()).catch(async () => { await signOut(w) }); await sleep(1200)
  await p.waitForSelector('#luser', { timeout: 20000 })
  await login(w, 'ad2')
  await guestSwitch(w, 'Hunter')
  await signOut(w)
  const t2 = await requestAccess(w)
  await sleep(800)
  const g = await p.evaluate(() => { const mq = window.__mq; const k = [...document.querySelectorAll('.tx .k')].find(e => mq.vis(e)); const wk = window.CURWEEK; if (k) mq.mark(k, '5'); return { mark: k ? k.textContent : null, week: wk } })
  await shot(w, `q5c-${sz}.png`)
  rec(`q5c-${sz}.png`, 'Q5', sz, 'real', 'none (marks only)', `Hunter (142's admin) ticks 142's own switch; the same person signs in again and lands, as a guest, in 142's week (5: the "142" over TALON — the only place on screen that names a squadron, and it reads "142" on every screen, 149's included).`, `${JSON.stringify(g)}; ${t2.slice(0, 200)}`)
  await w.ctx.close()
}

// ===================== Q7 — the band at midnight =====================
// the app's own warning band (ui/SaveStatus.tsx SaveBand — `.saveband` with `.sv-msg`: the drawn sign, the lead in bold,
// the rest quieter) with its words, and one button cloned from the window's own buttons (its computed look copied, as
// `.saveband button` would otherwise restyle it as the band's amber Retry)
async function band(w, hostSel, afterSel, lead, rest, srcBtnSel) {
  return w.page.evaluate(({ hostSel, afterSel, lead, rest, srcBtnSel }) => {
    const mq = window.__mq
    const host = [...document.querySelectorAll(hostSel)].find(e => mq.vis(e))
    const after = afterSel ? host.querySelector(afterSel) : null
    const b = mq.el('div', 'saveband'); b.setAttribute('role', 'status')
    const msg = mq.el('span', 'sv-msg')
    msg.appendChild(mq.el('span', 'sv-sign')); msg.appendChild(mq.el('b', null, lead)); msg.appendChild(mq.el('span', 'sv-sep', ' ')); msg.appendChild(mq.el('span', 'sv-rest', rest))
    b.appendChild(msg)
    const src = [...document.querySelectorAll(srcBtnSel)].find(e => mq.vis(e))
    const btn = src.cloneNode(false); btn.textContent = 'Close'; btn.removeAttribute('id'); btn.removeAttribute('data-testid'); btn.setAttribute('data-mine', '1')
    const cs = getComputedStyle(src)
    for (const k of ['background-color', 'background-image', 'border-top', 'border-right', 'border-bottom', 'border-left', 'border-radius', 'color', 'font-family', 'font-size', 'font-weight', 'line-height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'height', 'letter-spacing', 'text-transform']) btn.style.setProperty(k, cs.getPropertyValue(k))
    btn.style.margin = '0'; btn.style.flex = '0 0 auto'
    b.appendChild(btn)
    // across the window's top: bled to its edges as the board's own band is (`.sb-top > .saveband`)
    const hs = getComputedStyle(host), pl = parseFloat(hs.paddingLeft), pr = parseFloat(hs.paddingRight)
    b.style.margin = `0 -${pr}px 8px -${pl}px`; b.style.width = `calc(100% + ${pl + pr}px)`
    if (after && after.nextSibling) host.insertBefore(b, after.nextSibling); else if (after) host.appendChild(b); else host.insertBefore(b, host.firstChild)
    // the band is one line in the app (nowrap, its fixed height): where its words do not fit they would be cut — they
    // are let wrap instead, said on the picture's caption
    let wrapped = false
    const rs = b.querySelector('.sv-rest'), m2 = b.querySelector('.sv-msg')
    if (rs.scrollWidth > rs.clientWidth + 1 || m2.scrollWidth > m2.clientWidth + 1) {
      wrapped = true
      b.style.whiteSpace = 'normal'; b.style.height = 'auto'; b.style.padding = `7px ${b.style.paddingRight || '14px'}`; b.style.paddingTop = '7px'; b.style.paddingBottom = '7px'
      for (const e of [m2, rs]) { e.style.whiteSpace = 'normal'; e.style.overflow = 'visible'; e.style.textOverflow = 'clip' }
      m2.style.flexWrap = 'wrap'; m2.style.rowGap = '2px'
    }
    mq.mark(b, 'New', { inside: true })
    const r = b.getBoundingClientRect(), br = btn.getBoundingClientRect(), sr = src.getBoundingClientRect()
    const cut = rs.scrollWidth > rs.clientWidth + 1
    return { w: Math.round(r.width), h: Math.round(r.height), wrapped, cut, btn: [Math.round(br.width), Math.round(br.height)], src: [Math.round(sr.width), Math.round(sr.height), src.innerText.trim()] }
  }, { hostSel, afterSel, lead, rest, srcBtnSel })
}
async function q7(sz) {
  const w = await world(sz, { user: 'ad', time: '2026-07-15T23:54:00', moves: RANGER_MOVE })
  const p = w.page
  // setup through the app's own controls: Saber opens July for bidding (the demo's war is closed for bidding, and a
  // member's window then holds no remarks box)
  await nav(w, 'leavewar'); await sleep(1500)
  await tap(w, p.locator('button:visible', { hasText: 'Bidding closed' }).first()); await sleep(900)
  await tap(w, p.locator('button:visible', { hasText: /^JUL$/ }).first()); await sleep(900)
  const opened = await p.evaluate(() => [...document.querySelectorAll('.bidsheet')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText).join(' ').match(/15 Jul – 31 Jul/) ? true : false)
  if (!opened) throw new Error('Q7 setup: July not opened for bidding')
  const x = p.locator('.bidsheet .x:visible').first(); if (await x.count()) { await tap(w, x); await sleep(600) }
  await signOut(w); await login(w, 'us')
  await nav(w, 'leavewar'); await sleep(1500)
  const c = p.locator('[data-testid="cell-bane-2026-07-24"]').first()
  await c.scrollIntoViewIfNeeded(); await sleep(300); await tap(w, c); await sleep(1300)
  const WORDS = 'Family wedding in Perth, back Sunday'
  await setText(w, '#bid-remarks', WORDS)
  const t1 = await clockTo(w, '2026-07-15T23:58:00')
  const st = await p.evaluate(() => ({ head: document.querySelector('.bidsheet-hd')?.innerText.replace(/\s+/g, ' '), val: document.querySelector('#bid-remarks')?.value, bid: [...document.querySelectorAll('button')].find(b => /Open for bidding|Open /.test(b.innerText) && b.getBoundingClientRect().width > 0)?.innerText.replace(/\s+/g, ' ') }))
  if (st.val !== WORDS || !/Ranger/.test(st.head || '')) throw new Error('Q7a premise: ' + JSON.stringify(st))
  // the whole screen: the top bar names who is signed in, the war under the window says whose war it is
  const winRegion = async () => null
  await shot(w, `q7a-${sz}.png`, { region: await winRegion() })
  rec(`q7a-${sz}.png`, 'Q7', sz, 'real', 'none', `The clock at ${t1.slice(16, 21)} on Wed 15 Jul. Setup: Ranger's move 142 → 149 from Thu 16 Jul written into storage; Saber opened July for bidding (the war's own "Bidding closed" → JUL). Ranger, signed in, has 142's Leave War open and his window for Fri 24 Jul up, words typed in its remarks${w.phone ? ' (set through the box\'s own input event, not typed — an emulated phone zooms to a typed box)' : ''}.`, `${t1}; ${JSON.stringify(st)}`)
  const t2 = await clockTo(w, '2026-07-16T00:00:30')
  const st2 = await p.evaluate(() => ({ win: !!document.querySelector('.bidsheet'), val: document.querySelector('#bid-remarks')?.value, rangerRow: document.querySelectorAll('td[data-testid^="cell-bane-"]').length, kestrelRow: document.querySelectorAll('td[data-testid^="cell-kes9-"]').length }))
  if (!st2.win || st2.val !== WORDS) throw new Error('Q7b0 premise: ' + JSON.stringify(st2))
  await shot(w, `q7b0-${sz}.png`, { region: await winRegion() })
  rec(`q7b0-${sz}.png`, 'Q7', sz, 'real', 'none', `Today, just after midnight (${t2.slice(16, 21)}, Thu 16 Jul — his first day as 149's): the window stays up with his words, and nothing says anything. Under it the page is still 142's Leave War, and his own row has already gone from it.`, `${t2}; ${JSON.stringify(st2)}`)
  const m = await band(w, '.bidsheet', '.bidsheet-hd', 'You are 149\'s from today.', 'This can\'t be saved in 142\'s Leave War.', '.bidsheet .pchip.bp-range')
  await sleep(300)
  await shot(w, `q7b-${sz}.png`, { region: await winRegion(), check: () => !!document.querySelector('.bidsheet .saveband') || 'band gone' })
  rec(`q7b-${sz}.png`, 'Q7', sz, 'drawn', `clone: the app's own warning band (the failed-save band's classes — its sign, bold lead, quieter rest) put across the window's top under its title bar, bled to the window's edges as the board's band is; "Close" a copy of the window's own "${m.src[2]}" button, its look copied${m.wrapped ? '; the band let wrap to a second line, as one line would cut its words here' : ''}`, `Proposed: just after midnight the window stays, with one band across its top — "You are 149's from today. This can't be saved in 142's Leave War." — and one button, "Close" (New). His typed words stay under it.`, JSON.stringify(m))
  await w.ctx.close()
  // the Tracker: its chart layout being edited across the same midnight
  const t = await world(sz, { user: 'us', time: '2026-07-15T23:56:00', moves: RANGER_MOVE })
  const tp = t.page
  await nav(t, 'tracker'); await sleep(1800)
  await tap(t, tp.locator('button[title^="Edit the syllabus"]:visible').first()); await sleep(600)
  await tap(t, tp.locator('text=Edit chart layout').first()); await sleep(1500)
  // the editing state: its tool row and the one-line hint under it ("Move: drag a ball …") across the chart's top
  const ed = await tp.evaluate(() => {
    const hint = [...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().width > 200 && /^Move: drag a ball/.test((e.textContent || '').trim())).sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height)[0]
    const tools = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.innerText.trim()).filter(t => /^(Move|Select|Connect|Delete|Reset layout|Edit events|Merge)$/.test(t))
    if (hint) { hint.setAttribute('data-mqhint', '1'); hint.parentElement.setAttribute('data-mqhost', '1'); if (hint.previousElementSibling) hint.previousElementSibling.setAttribute('data-mqafter', '1') }
    const src = [...document.querySelectorAll('button')].find(b => b.getBoundingClientRect().width > 0 && b.innerText.trim() === 'Merge'); if (src) src.setAttribute('data-mqsrc', '1')
    return { hint: hint ? hint.textContent.trim().slice(0, 80) : null, tools, src: !!src }
  })
  if (!ed.hint || ed.tools.length < 4) throw new Error('Q7c premise: the chart-layout editing state is not on screen ' + JSON.stringify(ed))
  const tt = await clockTo(t, '2026-07-16T00:00:30')
  const still = await tp.evaluate(() => !!document.querySelector('[data-mqhint]') && document.querySelector('[data-mqhint]').getBoundingClientRect().width > 0)
  if (!still) throw new Error('Q7c0: the editing state left at midnight')
  await shot(t, `q7c0-${sz}.png`)
  rec(`q7c0-${sz}.png`, 'Q7', sz, 'real', 'none', `The Tracker at ${tt.slice(16, 21)} Thu 16 Jul. Setup: Ranger's move written into storage. Ranger (a member) pressed the syllabus pencil → "Edit chart layout" at 23:56 Wed 15 Jul; its tool row and the hint "Move: drag a ball…" stay as they were across midnight — nothing says anything.`, `${tt}; ${JSON.stringify(ed)}`)
  const mt = await band(t, '[data-mqhost]', (await tp.locator('[data-mqafter]').count()) ? '[data-mqafter]' : null, 'You are 149\'s from today.', 'This can\'t be saved in 142\'s Tracker.', '[data-mqsrc]')
  await sleep(300)
  await shot(t, `q7c-${sz}.png`, { check: () => !!document.querySelector('[data-mqhost] .saveband') || 'band gone' })
  rec(`q7c-${sz}.png`, 'Q7', sz, 'drawn', `clone: the same band (the failed-save band's classes) put across the chart's top, above the editing hint line; "Close" a copy of the editing row's own "Merge" button, its look copied${mt.wrapped ? '; the band let wrap to a second line, as one line would cut its words here' : ''}`, `Proposed: the Tracker's chart layout being edited at the same midnight — one band across the chart's top, "You are 149's from today. This can't be saved in 142's Tracker.", and "Close" (New). The editing tools stay under it.`, JSON.stringify(mt))
  await t.ctx.close()
  return ed
}

// ===================== Q8 and A7 — the passing note's words (the plan's second revision) =====================
// the app's passing note (`#toastEl`, ui/toast.ts): a refused save wears its "blocked" face (a drawn sign, the words up to
// the first colon in bold, the rest plain — `blockedFace`); a refused Undo its amber "warn" tint with the words as they are
// (ui/topstate.ts: HOOKS.toast(reason, 'warn')). Read off the live note, never assumed.
const noteNow = p => p.evaluate(() => { const e = document.getElementById('toastEl'); if (!e) return null; const r = e.getBoundingClientRect(); return { text: e.innerText.replace(/\s+/g, ' ').trim(), op: e.style.opacity, face: e.dataset.face || '', color: e.style.color, border: e.style.borderColor, at: e.dataset.at || '', w: Math.round(r.width), h: Math.round(r.height) } })
// the drawn words, put into the live note exactly as the app's own face would draw them; the note held up for the picture
async function noteWords(w, words, face) {
  return w.page.evaluate(({ words, face }) => {
    const t = document.getElementById('toastEl')
    if (face === 'blocked') {
      // ui/toast.ts blockedParts + blockedFace, as built: the lead is the words up to the first colon (within 60), else all
      const i = words.indexOf(':'), lead = i > 0 && i < 60 ? words.slice(0, i + 1) : words, rest = i > 0 && i < 60 ? words.slice(i + 1).trim() : ''
      const sign = document.createElement('span'); sign.className = 'bk-sign'; sign.setAttribute('aria-hidden', 'true')
      const ws = document.createElement('span'); ws.className = 'bk-words'
      const b = document.createElement('b'); b.textContent = lead; ws.appendChild(b)
      if (rest) { const r = document.createElement('span'); r.className = 'bk-rest'; r.textContent = ' ' + rest; ws.appendChild(r) }
      t.replaceChildren(sign, ws)
    } else {
      // ui/toast.ts toast(msg, 'warn'), as built — what the top bar's Undo raises for a refusal (ui/topstate.ts:
      // HOOKS.toast(r.reason, 'warn')): the plain face, the words as they are, border and words in the amber --adv
      delete t.dataset.face; t.textContent = words; t.style.borderColor = 'var(--adv)'; t.style.color = 'var(--adv)'
    }
    t.style.opacity = '1'
    // its fade is a timer: held up while the picture is taken
    if (!window.__mqHold) { window.__mqHold = new MutationObserver(() => { if (t.style.opacity !== '1') t.style.opacity = '1' }); window.__mqHold.observe(t, { attributes: true, attributeFilter: ['style'] }) }
    window.__mq.mark(t, 'New')
    const r = t.getBoundingClientRect()
    return { w: Math.round(r.width), h: Math.round(r.height), lines: Math.round(r.height / parseFloat(getComputedStyle(t).lineHeight || '18')) || null, text: t.innerText.replace(/\s+/g, ' ').trim() }
  }, { words, face })
}
const Q8_WORDS = 'Ranger is 149\'s from Thu 16 Jul. Only a master or Ranger can change leave that runs across his move.'
async function q8(sz) {
  const w = await world(sz, { user: 'ad2', time: '2026-07-15T10:00:00', moves: RANGER_MOVE, toasts: true })
  const p = w.page
  await nav(w, 'inputs')
  if (!(await p.locator('#inNew:visible').count())) { await tap(w, p.locator('#inListBtn')); await sleep(800) }
  await tap(w, p.locator('#inNew')); await sleep(1400)
  await p.selectOption('#inpEditType', { label: 'LL' }); await sleep(500)
  const day = async a => { const d = p.locator(`.inped-win .dcal-d[aria-label^="${a}"]`).first(); await d.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await tap(w, d); await sleep(500) }
  // the draft on Tue 14 Jul alone first, Ranger picked, then its end stretched to Fri 17 Jul
  await day('Tue 14 Jul 2026')
  const offered14 = await p.evaluate(() => [...document.querySelector('#inpEditPerson').options].some(o => o.text === 'Ranger'))
  await p.selectOption('#inpEditPerson', { label: 'Ranger' }); await sleep(500)
  await day('Fri 17 Jul 2026')
  const d = await p.evaluate(() => ({ head: ((document.querySelector('.inpedwin, .floatwin')?.innerText || '').match(/New input[^\n]*/) || [''])[0], who: document.querySelector('#inpEditPerson').selectedOptions[0]?.text, type: document.querySelector('#inpEditType').selectedOptions[0]?.text, offered: [...document.querySelector('#inpEditPerson').options].some(o => o.text === 'Ranger') }))
  if (!offered14 || !d.offered || d.who !== 'Ranger' || d.type !== 'LL' || !/Jul 14 → Jul 17/.test(d.head)) throw new Error('Q8 draft premise: ' + JSON.stringify({ offered14, ...d }))
  await tap(w, p.locator('#inpEditSave')); await sleep(1200)
  const nd = p.locator('button:visible', { hasText: /^No document$/ }).last()
  const docq = await nd.count()
  if (docq) { await tap(w, nd); await sleep(350) }
  const n = await noteNow(p)
  const open = await p.locator('.inped-win:visible').count()
  const kept = await p.evaluate(() => (window.INPUTS || []).filter(r => r && /bane/.test(JSON.stringify(r.person || r.who || r.ppl || '')) && /LL/.test(String(r.type))).map(r => (r.start || r.date) + '→' + (r.end || '')).join(',')).catch(() => 'not read')
  if (!n || n.op !== '1' || n.face !== 'blocked' || !open) throw new Error('Q8a premise: ' + JSON.stringify({ n, open }))
  await p.evaluate(() => window.__mq.mark(document.getElementById('toastEl'), '8'))
  await shot(w, `q8a-${sz}.png`, { check: () => document.getElementById('toastEl').style.opacity === '1' || 'the note faded' })
  rec(`q8a-${sz}.png`, 'Q8', sz, 'real', 'none (marks only)', `Wed 15 Jul, 10:00. Setup: Ranger's move 142 → 149 from Thu 16 Jul, written into storage. Hunter (142's admin) files LL for Ranger through Inputs → + New: the draft started on Tue 14 Jul alone, Ranger picked (the list offers him), then its end stretched to Fri 17 Jul ("New input · Jul 14 → Jul 17"); Add pressed${docq ? ', then "No document" in the document question' : ''}. Today: the general refusal, "Blocked: nothing was kept", in the passing note at the ${n.at === 'top' ? 'top' : 'foot'} of the screen (8); the window stays open and nothing is kept.`, JSON.stringify({ draft: d, note: n, windowOpen: !!open, documentQuestion: !!docq, rangerLL: kept }))
  await p.evaluate(() => { const t = document.getElementById('toastEl'); for (const e of t.querySelectorAll('[data-mine]')) e.remove(); t.classList.remove('mkq', 'mkq-in'); for (const e of document.querySelectorAll('.mkq-ptag')) e.remove() })
  const m = await noteWords(w, Q8_WORDS, 'blocked')
  if (m.text !== Q8_WORDS + ' New' && m.text !== Q8_WORDS + 'New') throw new Error('Q8b words: ' + m.text)
  await shot(w, `q8b-${sz}.png`, { check: () => document.getElementById('toastEl').style.opacity === '1' || 'the note faded' })
  rec(`q8b-${sz}.png`, 'Q8', sz, 'drawn', 'the passing note\'s words changed, nothing else: the same note the refusal raised, its "blocked" face drawn as the app\'s own blockedFace would draw these words (no colon in them, so all of them are its bold lead); the note held up for the picture', `Proposed: the same moment — the window still open with the draft — and the same passing note reading "${Q8_WORDS}" (New).`, JSON.stringify(m))
  await w.ctx.close()
}
const A7_WORDS = 'Ranger is 149\'s from Thu 16 Jul, so this can\'t go back into 142\'s Leave War.'
async function q6d(sz) {
  const w = await world(sz, { user: 'ad', time: '2026-07-15T23:55:00', moves: RANGER_MOVE, toasts: true })
  const p = w.page
  await nav(w, 'leavewar'); await sleep(1500)
  const closeWin = async () => { const x = p.locator('.bidsheet .x:visible').first(); if (await x.count()) { await tap(w, x); await sleep(700) } }
  // A7 itself, through the war's own controls: on Wed 15 Jul (Ranger still 142's that day) Saber puts approved LL on Ranger's
  // Fri 17 Jul and deletes it; midnight passes (his move counts from Thu 16 Jul); Saber presses Undo, which would put the
  // leave back on Fri 17 Jul in 142's war
  const cell = d => p.locator(`[data-testid="cell-bane-${d}"]`).first()
  await cell('2026-07-17').scrollIntoViewIfNeeded(); await sleep(300); await tap(w, cell('2026-07-17')); await sleep(1300)
  await tap(w, p.locator('.bidsheet .tchip.lv', { hasText: /^LL/ }).first()); await sleep(1300)
  const placed = await p.evaluate(() => document.querySelector('td[data-testid="cell-bane-2026-07-17"]')?.innerText.trim())
  if (placed !== 'LL') throw new Error('Q6d: LL not placed: ' + placed)
  if (!(await p.locator('.bidsheet:visible').count())) { await tap(w, cell('2026-07-17')); await sleep(1300) }
  await tap(w, p.locator('.bidsheet button:visible', { hasText: /^Delete$/ }).first()); await sleep(1300)
  const afterDel = await p.evaluate(() => document.querySelector('td[data-testid="cell-bane-2026-07-17"]')?.innerText.trim())
  if (afterDel) throw new Error('Q6d: leave not deleted: ' + afterDel)
  await closeWin()
  const undoBefore = await p.locator('button[aria-label="Undo"]:visible').first().getAttribute('title')
  const t = await clockTo(w, '2026-07-16T00:00:30')
  await sleep(3000)   // any earlier note has faded
  const rowNow = await p.evaluate(() => document.querySelectorAll('td[data-testid^="cell-bane-"]').length)
  const undoTitle = await p.locator('button[aria-label="Undo"]:visible').first().getAttribute('title')
  const undoOff = await p.locator('button[aria-label="Undo"]:visible').first().isDisabled()
  if (undoOff) throw new Error('Q6d: Undo greyed after midnight: ' + undoTitle)
  await tap(w, p.locator('button[aria-label="Undo"]:visible').first()); await sleep(450)
  const n = await noteNow(p)
  const back = await p.evaluate(() => document.querySelector('td[data-testid="cell-bane-2026-07-17"]')?.innerText.trim() ?? '(no row)')
  // today the Undo is NOT refused: it says "Undid: …" and puts the leave back, out of sight (his row has left 142's war)
  if (!n || n.op !== '1' || !/^Undid/.test(n.text)) throw new Error('Q6d: the Undo note: ' + JSON.stringify({ n, back, undoBefore, undoTitle, rowNow, t }))
  const m = await noteWords(w, A7_WORDS, 'warn')
  await shot(w, `q6d-${sz}.png`, { check: () => document.getElementById('toastEl').style.opacity === '1' || 'the note faded' })
  rec(`q6d-${sz}.png`, 'Q6 (A7)', sz, 'drawn', `the passing note this Undo raised (today's words "${n.text}", plain face) redrawn as the app's own note draws a REFUSED Undo — toast(words, 'warn'): amber border and words, the words as given; nothing else; the note held up for the picture`, `A7 reached for real, by the war's own controls: at 23:55 Wed 15 Jul (Ranger still 142's that day; his move to 149 written into storage, counting from Thu 16 Jul) Saber put approved LL on Ranger's Fri 17 Jul in 142's Leave War and deleted it. At ${t.slice(16, 21)} Thu 16 Jul he pressed Undo ("${undoTitle}"), which would put the leave back. Today it is NOT refused: the note says "${n.text}" and the leave goes back into 142's war, out of sight (his row has already left it). Proposed (New): the Undo refused, the note in the refused-Undo look reading "${A7_WORDS}". Under it, 142's war as it stands now.`, JSON.stringify({ realNote: n, drawn: m, undoBefore, undoTitle, rangerCellsNow: rowNow, cellAfterUndo: back, clock: t }))
  await w.ctx.close()
}

// ===================== run =====================
const PIECES = { q1, q2, q6: async sz => { await q6a(sz); await q6b142(sz); await q6b149(sz) }, q4, q5, q7, q8, q6d }
for (const [k, fn] of Object.entries(PIECES)) {
  if (ONLY && !ONLY.includes(k)) continue
  for (const sz of SZS) {
    console.log(`== ${k} ${sz}`)
    try { await fn(sz) } catch (e) { errs.push(`[${sz}] ${k} FAILED ${e.message}`); console.log('FAILED', k, sz, e.stack) }
  }
}
for (const b of Object.values(browsers)) await b.close().catch(() => {})
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1))
appendFileSync(join(OUT, 'run-log.txt'), [`=== run ${new Date().toISOString()} pieces ${ONLY ? ONLY.join(',') : 'all'} sizes ${SZS.join(',')} bundle ${BUNDLE}`, ...notes, '--- page errors and failures ---', ...(errs.length ? errs : ['none']), ''].join('\n'))
console.log('errors:', errs.length ? errs.join('\n') : 'none')
