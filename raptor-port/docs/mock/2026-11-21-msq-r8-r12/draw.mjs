// Multi-squadron batch 1, the reshape plan's two questions from its blind read (docs/superpowers/plans/
// 2026-11-20-multi-sqn-b1-reshape.md §19b: the sign-off boxes and a Plan holder; the last-admin words for someone who
// cannot make the fix) — drawn on the REAL running app by .claude/skills/brainstorming/mockups-on-the-real-app.md: each
// picture is the real screen reached through the app's own controls, then at most ONE named transform. A new part is
// cloned from a real neighbour (or is the app's own element with its words changed), outlined pink and tagged "New";
// the place a question is about is outlined and tagged with its number. Every staged record is asserted on screen (or,
// where no screen shows it yet, read back and said so) before a picture. Harness copied from
// docs/mock/2026-11-20-multi-sqn-reshape/draw.mjs (world, rows at the sign-in card, the open-list clone of q2a, the
// passing note's refusal face of q6d); the note drawn as docs/mock/2026-11-19-multi-sqn-pieces/draw.mjs p9 draws it.
//
//   r8a  1 · Setup: Hunter (142's admin) holds Plan of 149 (a stored row — no screen gives Plan yet); Saber ticks Hunter's
//        Scheduler box on Quals (real). Kestrel (149's admin), Edit Schedule, Mon 13 Jul: the SKED CK box's list drawn
//        open in place — it offers 149's own schedulers only; Hunter and Saber are not in it (real; the list is the box
//        cloned open, as q2a — the browser's own drop-down cannot be pictured)
//   r8b  1 · the same list with Hunter and Saber appended after 149's own people, two lines cloned from the list's own
//        lines (drawn: clone, New)
//   r12a 2 · Setup: squadron 150, and Hunter's Plan of 150 (stored rows — no screen makes a squadron or gives Plan yet);
//        Saber makes Outlaw a 142 admin on Admin → Users (real — the demo has no 142 admin who is not a master admin).
//        Outlaw, Admin → Users, Hunter's row, Suspend: today it goes through — "Hunter suspended" — and 150 has no admin
//        left who can sign in (real)
//   r12b 2 · the top bar's Undo takes the Suspend back and Hunter's row is opened again (real); the passing note the
//        Undo raised redrawn in the refusal look p9 drew (the app's amber "warn" note) with the proposed words (drawn:
//        the note's words and face, New)
//
// Run from raptor-port/:  node docs/mock/2026-11-21-msq-r8-r12/draw.mjs
// MQ_ONLY=r8 or r12; MQ_SIZES=d or p. MQ_DIST points at a frozen build (default dist/) — served from INSIDE the test
// browser (every request to the address below answered from it), so no server is needed. Demo data only.
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync, appendFileSync, existsSync, readFileSync, statSync } from 'node:fs'
import { join, extname, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
const req = createRequire(resolve(ROOT, 'package.json'))
const { chromium, webkit } = req('@playwright/test')
const DIST = process.env.MQ_DIST ? resolve(process.env.MQ_DIST) : resolve(ROOT, 'dist')
const BASE = 'http://localhost:4528'
const BUNDLE = (readFileSync(join(DIST, 'index.html'), 'utf8').match(/assets\/(index-[^"]+\.js)/) || [])[1]
if (!BUNDLE) throw new Error('index.html names no bundle')
const OUT = resolve(HERE, 'img')
mkdirSync(OUT, { recursive: true })
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
const SZS = process.env.MQ_SIZES ? process.env.MQ_SIZES.split(',') : ['d', 'p']
const PINK = '#ff2d95'
const sleep = ms => new Promise(r => setTimeout(r, ms))
// the demo's sign-ins (raptor-port/CLAUDE.md §Build & verify, state/accounts.ts SEED_PASS); an account with no seeded
// password (outlaw) takes any
const PASS = { ad: 'a', ad2: 'a2', ad9: 'a9', outlaw: 'x' }

// device scale 2 at both sizes (the brief for this round; the 19 Nov pieces drew the phone at 2 too)
const SIZES = {
  d: { name: 'desktop 1536×864 (Chromium, 2x)', engine: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'iPhone 402×874 (WebKit, touch, 2x)', engine: webkit, opts: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
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

// ---- the kit sent into the page (declares every helper it calls) — 20 Nov's, unchanged ----
function kit() {
  const mq = {}
  mq.vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  mq.hide = e => { e.setAttribute('data-mqhid', '1'); e.style.setProperty('display', 'none', 'important') }
  mq.el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; e.setAttribute('data-mine', '1'); return e }
  mq.unclipped = (el, r) => {
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a)
      if (cs.overflow === 'visible' && cs.overflowX === 'visible' && cs.overflowY === 'visible') continue
      const b = a.getBoundingClientRect()
      if (r.left < b.left - 0.5 || r.right > b.right + 0.5 || r.top < b.top - 0.5 || r.bottom > b.bottom + 0.5) return false
    }
    return r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight
  }
  mq.ptag = (el, text, at = 'tr') => {
    const b = el.getBoundingClientRect(), t = document.createElement('span')
    t.className = 'mkq-tag mkq-ptag'; t.textContent = text; t.setAttribute('data-mine', '1'); document.body.appendChild(t)
    const w = t.offsetWidth, h = t.offsetHeight
    let x = at === 'tl' ? b.left - 6 : at === 'r' ? b.right + 4 : b.right - w + 6, y = at === 'r' ? b.top + (b.height - h) / 2 : b.top - h + 4
    x = Math.max(2, Math.min(innerWidth - w - 2, x)); y = Math.max(2, Math.min(innerHeight - h - 2, y))
    t.style.left = x + 'px'; t.style.top = y + 'px'
    return t
  }
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

async function world(sz, { time, rows = {}, toasts = false }) {
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
  if (!js.includes(BUNDLE)) throw new Error('not the frozen bundle: ' + js)
  const w = { sz, phone: sz === 'p', ctx, page, toasts, back: [] }
  if (Object.keys(rows).length) w.back = await writeRows(w, rows)
  return w
}
// setup only: stored rows written at the sign-in card, before anyone signs in, then the page reloaded; read back
async function writeRows(w, rows) {
  const back = await w.page.evaluate(rows => {
    for (const [k, v] of Object.entries(rows)) localStorage.setItem('raptor:settings/' + k, JSON.stringify(v))
    return Object.keys(rows).map(k => k + '=' + localStorage.getItem('raptor:settings/' + k))
  }, rows)
  await w.page.reload(); await w.page.waitForSelector('#luser', { timeout: 20000 }); await sleep(600)
  const still = await w.page.evaluate(keys => keys.every(k => localStorage.getItem('raptor:settings/' + k) != null), Object.keys(rows))
  if (!still) throw new Error('a stored row did not survive the reload')
  return back
}
async function login(w, user) {
  const p = w.page
  await p.waitForSelector('#luser', { timeout: 20000 })
  await p.fill('#luser', user); await p.fill('#lpass', PASS[user])
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
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
async function toWeek(w, mondayLabel, dayAria) {
  const p = w.page
  if (!w.phone) {
    const b = p.locator('button:visible', { hasText: new RegExp('^' + mondayLabel + '$') }).first()
    if (await b.count()) { await b.click(); await sleep(1300) }
    return
  }
  await p.locator('button[aria-label="Jump to a date"]:visible').first().tap(); await sleep(800)
  await p.locator(`.dcal-d[aria-label^="${dayAria}"]:visible`).first().tap(); await sleep(1500)
}
function rec(file, q, sz, kind, transform, caption, asserted) { manifest[file] = { question: q, size: SIZES[sz].name, kind, transform, caption, asserted } }
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
const unmark = p => p.evaluate(() => { for (const e of document.querySelectorAll('[data-mine]')) e.remove(); for (const e of document.querySelectorAll('.mkq')) e.classList.remove('mkq', 'mkq-in') })

// ===================== 1 — the sign-off boxes and a Plan holder =====================
const PLAN149 = { 'grant:gpa149': { id: 'gpa149', account: 'acad2', unit: 'u149', level: 'admin', from: '2026-01-01' } }
// setup through the app's own controls: Saber (142's master admin) ticks Hunter's Scheduler box on Quals → Edit → Done
async function tickScheduler(w, pid) {
  const p = w.page
  await nav(w, 'quals')
  const before = await p.evaluate(pid => !!window.PEOPLE[pid]?.quals?.sched, pid)
  if (before) return { before, after: true }
  await tap(w, p.locator('#qEdit:visible').first()); await sleep(600)
  const cell = p.locator(`[data-q="${pid}|sched"]`).first()
  await cell.scrollIntoViewIfNeeded(); await sleep(300)
  await tap(w, cell); await sleep(600)
  await tap(w, p.locator('#qSave:visible').first()); await sleep(800)
  const after = await p.evaluate(pid => !!window.PEOPLE[pid]?.quals?.sched, pid)
  if (!after) throw new Error('the Scheduler tick did not take for ' + pid)
  return { before, after }
}
// 20 Nov's openList (q2a), generalised: the real box cloned as an open list under its pill, the same options in the same
// order, the clone's ids stripped; `add` appends lines cloned from the list's own last line, re-lettered
async function openList(w, { add = [] } = {}) {
  return w.page.evaluate(add => {
    const mq = window.__mq
    const sel = [...document.querySelectorAll('select[data-signday="0"][data-sign="sked"]')].find(e => mq.vis(e))
    const pill = sel.closest('label')
    const c = sel.cloneNode(true); c.removeAttribute('data-sign'); c.removeAttribute('data-signday'); c.setAttribute('data-mine', '1'); c.setAttribute('data-mqlist', '1')
    c.value = ''
    for (const name of add) {
      const o = c.options[c.options.length - 1].cloneNode(false); o.removeAttribute('selected'); o.value = 'mq-' + name; o.textContent = name; o.setAttribute('data-mqnew', '1')
      c.appendChild(o)
    }
    c.size = c.options.length
    const pr = pill.getBoundingClientRect()
    c.removeAttribute('class')
    c.setAttribute('style', `all:revert !important; position:fixed !important; left:${pr.left}px !important; top:${pr.bottom + 4}px !important; z-index:2147483000 !important; min-width:${pr.width}px !important; font-size:14px !important; pointer-events:none !important; overflow:hidden !important;`)
    document.body.appendChild(c)
    return { n: sel.options.length, names: [...sel.options].map(o => o.text), shown: [...c.options].map(o => o.text), pill: pill.innerText.replace(/\s+/g, ' ').trim() }
  }, add)
}
async function r8(sz) {
  const w = await world(sz, { time: '2026-07-15T10:00:00', rows: PLAN149 })
  const p = w.page
  await login(w, 'ad')
  const tick = await tickScheduler(w, 'prowler')
  const saberTick = await p.evaluate(() => !!window.PEOPLE.stiff?.quals?.sched)
  await signOut(w); await login(w, 'ad9')
  const who = await p.evaluate(() => ({ hunterSched: !!window.PEOPLE.prowler?.quals?.sched, saberSched: !!window.PEOPLE.stiff?.quals?.sched, grant: localStorage.getItem('raptor:settings/grant:gpa149') }))
  if (!who.hunterSched || !who.saberSched || !who.grant) throw new Error('r8 setup: ' + JSON.stringify(who))
  await nav(w, 'editsched')
  await toWeek(w, 'Jul 13', 'Mon 13 Jul 2026')
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(400)
  const day = await p.evaluate(() => {
    const s = [...document.querySelectorAll('select[data-signday="0"][data-sign="sked"]')].find(e => e.getBoundingClientRect().width > 0)
    if (!s) return null
    const d = s.closest('.day') || s.closest('[class*=day]')
    const h = d && [...d.querySelectorAll('*')].find(e => e.children.length === 0 && /^Monday$/.test(e.textContent.trim()))
    if (h) h.setAttribute('data-mqmon', '1')
    // Monday's own crew: the names on its pucks, read off the day (the day's people — that they are 149's is the point)
    return { head: d ? d.innerText.split('\n').slice(0, 3).join(' ') : '', mon: !!h, kestrelOnDay: d ? /Kestrel/.test(d.innerText) : false }
  })
  if (!day || !day.mon || !/Jul 13/.test(day.head)) throw new Error('r8: Monday 13 Jul\'s sign-off box not on screen ' + JSON.stringify(day))
  // r8a — the real list
  const L = await openList(w)
  if (!L.names.includes('Kestrel') || L.names.includes('Hunter') || L.names.includes('Saber')) throw new Error('r8a premise: ' + JSON.stringify(L))
  await p.evaluate(() => { const mq = window.__mq, c = document.querySelector('[data-mqlist]'); mq.mark(c, null, { noTag: true }); mq.ptag(c, '1', 'r') })
  // the crop keeps the top bar (it carries the signed-in mark) on the desktop: from the screen's top to under the list
  const crop = async () => w.phone ? null : p.evaluate(() => { const c = document.querySelector('[data-mqlist]').getBoundingClientRect(); return { x: 0, y: 0, width: innerWidth, height: Math.min(innerHeight, c.bottom + 40) } })
  await shot(w, `r8a-${sz}.png`, { region: await crop(), check: () => !!document.querySelector('[data-mqlist]') || 'list gone' })
  rec(`r8a-${sz}.png`, '1', sz, 'real', "the box's own list drawn open in place (the box cloned as an open list under its pill, its options as the box holds them: the browser draws its drop-down outside the page, an iPhone a wheel at the foot of the screen — neither can be pictured)",
    `Wed 15 Jul 2026, 10:00. Setup: Hunter (142's admin) given Plan of 149 by a stored row (no screen gives Plan yet); Saber ticked Hunter's Scheduler box on Quals (Edit → his Scheduler box → Done). Kestrel (149's admin) signed in, Edit Schedule, Mon 13 Jul (149's demo week): the SKED CK box's list (1) offers 149's own schedulers only — Hunter and Saber, both with the Scheduler tick, are not in it.`,
    `stored: ${w.back.join('; ')}; Hunter's tick ${JSON.stringify(tick)}, Saber's ${saberTick}; the real box's options: ${L.names.join(', ')}; day head "${day.head}"`)
  await unmark(p)
  // r8b — the same list, Hunter and Saber appended after 149's own people
  const L2 = await openList(w, { add: ['Hunter', 'Saber'] })
  const m = await p.evaluate(() => {
    const mq = window.__mq, c = document.querySelector('[data-mqlist]')
    mq.mark(c, null, { noTag: true })
    // an option can hold no child and draws no outline: each new line's own background lit pink, one "New" tag on the page
    // beside the first of them (a still screen)
    const nw = [...c.querySelectorAll('[data-mqnew]')]
    for (const o of nw) o.style.background = 'rgba(255,45,149,.28)'
    const r = nw[0].getBoundingClientRect(), r2 = nw[nw.length - 1].getBoundingClientRect()
    const t = mq.ptag(c, 'New', 'r'); t.style.top = ((r.top + r2.bottom) / 2 - 7) + 'px'
    const t1 = mq.ptag(c, '1', 'r'); t1.style.top = (c.getBoundingClientRect().top + 2) + 'px'
    // the cloned lines stand in the list's own rows: the same height as the real line above them
    const real = [...c.options].filter(o => !o.hasAttribute('data-mqnew')).pop().getBoundingClientRect()
    return { realH: Math.round(real.height * 10) / 10, newH: nw.map(o => Math.round(o.getBoundingClientRect().height * 10) / 10), left: [Math.round(real.left), ...nw.map(o => Math.round(o.getBoundingClientRect().left))] }
  })
  if (m.newH.some(h => Math.abs(h - m.realH) > 0.6) || m.left.some(x => Math.abs(x - m.left[0]) > 0.6)) say('r8b', sz, 'line sizes differ', JSON.stringify(m))
  await shot(w, `r8b-${sz}.png`, { region: await crop(), check: () => document.querySelectorAll('[data-mqlist] [data-mqnew]').length === 2 || 'new lines gone' })
  rec(`r8b-${sz}.png`, '1', sz, 'drawn', "clone: two lines cloned from the list's own last line, re-lettered Hunter and Saber, appended after 149's own people; their background lit pink (an option draws no outline)",
    `Proposed: the same list offers, after 149's own people, an admin holding Plan of 149 (Hunter) and the master admin (Saber), each with the Scheduler tick (New).`,
    `lines shown: ${L2.shown.join(', ')}; line heights real ${m.realH} new ${m.newH.join('/')}`)
  await w.ctx.close()
}

// ===================== 2 — the last-admin words for someone who cannot make the fix =====================
const SQ150 = {
  'unit:u150': { id: 'u150', num: '150', kind: 'sqn' },
  'unitplace:up150': { id: 'up150', unit: 'u150', place: 'p1', from: '2000-01-01' },
  'grant:gpa150': { id: 'gpa150', account: 'acad2', unit: 'u150', level: 'admin', from: '2026-01-01' },
}
async function toUsers(w) {
  const p = w.page
  await nav(w, 'admin')
  if (!(await p.locator('#page-admin button.acc-main').first().isVisible().catch(() => false))) { await tap(w, p.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first()); await sleep(700) }
}
async function openRow(w, cs) {
  const p = w.page
  const b = p.locator('#page-admin button.acc-main', { hasText: new RegExp('^' + cs) }).first()
  await b.scrollIntoViewIfNeeded(); await tap(w, b)
  await p.waitForSelector('#page-admin .acc-edit')
  await sleep(400)
  await p.evaluate(() => { const e = document.querySelector('#page-admin .acc-edit'); e.closest('.acc-row').scrollIntoView({ block: 'center' }) })
  await sleep(400)
}
const rowOf = (p, cs) => p.evaluate(cs => {
  const r = [...document.querySelectorAll('#page-admin .acc-row.od-row')].find(x => (x.querySelector('.acc-name')?.textContent || '') === cs)
  return r ? { sub: r.querySelector('.acc-sub')?.innerText.replace(/\s+/g, ' ').trim(), pill: r.querySelector('.od-rc')?.innerText.trim(), open: r.classList.contains('od-row-on'), edit: !!r.querySelector('.acc-edit'), onoff: r.querySelector('#accEdOnOff')?.innerText.trim() || '' } : null
}, cs)
const noteNow = p => p.evaluate(() => { const e = document.getElementById('toastEl'); if (!e) return null; const r = e.getBoundingClientRect(); return { text: e.innerText.replace(/\s+/g, ' ').trim(), op: e.style.opacity, face: e.dataset.face || '', color: e.style.color, border: e.style.borderColor, w: Math.round(r.width), h: Math.round(r.height) } })
const acct = (p, id) => p.evaluate(id => JSON.parse(localStorage.getItem('raptor:settings/account:' + id) || 'null'), id)
const R12_WORDS = 'Hunter is 150\'s last admin. Only a master admin or an admin of 150 can make another.'
async function r12(sz) {
  const w = await world(sz, { time: '2026-07-15T10:00:00', rows: SQ150, toasts: true })
  const p = w.page
  // setup through the app's own controls: the demo has no 142 admin who is not a master admin (Saber is the master,
  // Hunter holds Plan of 150 in this case) — Saber makes Outlaw (a 142 member) an admin on Admin → Users
  await login(w, 'ad')
  await toUsers(w); await openRow(w, 'Outlaw')
  await p.selectOption('#accEdRole', 'admin'); await sleep(300)
  await tap(w, p.locator('#accEdSave')); await sleep(900)
  const said0 = await noteNow(p)
  const outlaw = await rowOf(p, 'Outlaw')
  if (!/ADMIN/i.test(outlaw?.pill || '')) throw new Error('r12 setup: Outlaw not made an admin ' + JSON.stringify({ outlaw, said0 }))
  await signOut(w); await login(w, 'outlaw')
  const sess = await p.evaluate(() => ({ grant: localStorage.getItem('raptor:settings/grant:gpa150'), unit: localStorage.getItem('raptor:settings/unit:u150'), outlawMaster: JSON.parse(localStorage.getItem('raptor:settings/account:acoutlaw') || 'null')?.master || false }))
  await toUsers(w)
  // the press: Hunter's row, Suspend
  await openRow(w, 'Hunter')
  const before = await rowOf(p, 'Hunter')
  if (!before?.edit || before.onoff !== 'Suspend') throw new Error('r12a: Hunter\'s row has no Suspend ' + JSON.stringify(before))
  await tap(w, p.locator('#accEdOnOff')); await sleep(450)
  const n = await noteNow(p)
  const after = await rowOf(p, 'Hunter')
  const hunterAcct = await acct(p, 'acad2')
  // today it is NOT refused: the note says he is suspended, his account is off — and 150, whose only admin he is (by
  // Plan), is left with nobody who can sign in as its admin
  if (!n || n.op !== '1' || !/^Hunter suspended/.test(n.text) || hunterAcct?.on !== false) throw new Error('r12a premise: ' + JSON.stringify({ n, after, hunterAcct }))
  await p.evaluate(() => {
    const mq = window.__mq, t = document.getElementById('toastEl')
    // the note holds up for the picture (its fade is a timer)
    if (!window.__mqHold) { window.__mqHold = new MutationObserver(() => { if (t.style.opacity !== '1') t.style.opacity = '1' }); window.__mqHold.observe(t, { attributes: true, attributeFilter: ['style'] }) }
    const r = [...document.querySelectorAll('#page-admin .acc-row.od-row')].find(x => (x.querySelector('.acc-name')?.textContent || '') === 'Hunter')
    r.scrollIntoView({ block: 'center' })
    mq.mark(t, '2')
    // his sign-in dot, now the app's "suspended" one: outlined only
    const d = document.querySelector('[data-testid="dot-signin-prowler"]'); if (d) mq.mark(d, null, { noTag: true })
  })
  await sleep(300)
  const dot = await p.evaluate(() => { const d = document.querySelector('[data-testid="dot-signin-prowler"]'); return d ? (d.getAttribute('title') || d.getAttribute('aria-label') || d.className) : null })
  if (!/suspend|off/i.test(dot || '')) throw new Error('r12a: Hunter\'s sign-in dot does not read suspended: ' + dot)
  // the whole screen at both sizes: the desktop's top bar names who is signed in (Outlaw)
  const topBar = await p.evaluate(() => (document.querySelector('header, .topbar, #topbar')?.innerText || '').replace(/\s+/g, ' ').trim().slice(-60))
  await shot(w, `r12a-${sz}.png`, { check: () => document.getElementById('toastEl').style.opacity === '1' || 'the note faded' })
  rec(`r12a-${sz}.png`, '2', sz, 'real', 'none (marks only)',
    `Wed 15 Jul 2026, 10:00. Setup: a squadron 150 and Hunter's Plan of 150 written as stored rows (no screen makes a squadron or gives Plan yet) — Hunter is 150's only admin. Saber made Outlaw a 142 admin on Admin → Users (the demo has no 142 admin who is not a master admin). Outlaw, signed in, opens Hunter's row and presses Suspend: today it is not refused — the note says "${n.text}" (2) and 150 is left with no admin who can sign in.`,
    JSON.stringify({ stored: w.back, outlawRow: outlaw, outlawMaster: sess.outlawMaster, before, note: n, after, hunterAccount: hunterAcct, hunterDot: dot, topBar }))
  await p.evaluate(() => { window.__mqHold && window.__mqHold.disconnect(); window.__mqHold = null })
  await unmark(p)
  await p.evaluate(() => { for (const e of document.querySelectorAll('[data-mqshot]')) e.removeAttribute('data-mqshot') })
  // r12b — the top bar's Undo takes the Suspend back; Hunter's row opened again — the screen as it stood before the press
  await sleep(3500)   // the note has faded
  const undo = p.locator('button[aria-label="Undo"]:visible').first()
  const undoTitle = await undo.getAttribute('title')
  if (await undo.isDisabled()) throw new Error('r12b: Undo greyed: ' + undoTitle)
  await tap(w, undo); await sleep(450)
  const nu = await noteNow(p)
  const hunterBack = await acct(p, 'acad2')
  if (hunterBack?.on === false) throw new Error('r12b: the Undo did not give Hunter his sign-in back ' + JSON.stringify({ nu, undoTitle }))
  if (!nu || nu.op !== '1') throw new Error('r12b: no note from the Undo ' + JSON.stringify(nu))
  // the note holds while the row is opened again
  await p.evaluate(() => { const t = document.getElementById('toastEl'); window.__mqHold = new MutationObserver(() => { if (t.style.opacity !== '1') t.style.opacity = '1' }); window.__mqHold.observe(t, { attributes: true, attributeFilter: ['style'] }) })
  await openRow(w, 'Hunter')
  const again = await rowOf(p, 'Hunter')
  if (!again?.edit || again.onoff !== 'Suspend') throw new Error('r12b: Hunter\'s row not as before ' + JSON.stringify(again))
  // the transform: the note the Undo raised redrawn as the app draws a refusal on this screen — toast(words, 'warn') in
  // ui/toast.ts, as UsersPanel's `done` raises it (p9's real "Kestrel is 149's last admin…" wore this face): the plain
  // face, the words as given, border and words in the amber --adv
  const m = await p.evaluate(words => {
    const t = document.getElementById('toastEl')
    delete t.dataset.face; t.textContent = words; t.style.borderColor = 'var(--adv)'; t.style.color = 'var(--adv)'; t.style.opacity = '1'
    window.__mq.mark(t, 'New')
    const b = t.getBoundingClientRect()
    return { w: Math.round(b.width), h: Math.round(b.height), text: t.innerText.replace(/\s+/g, ' ').trim() }
  }, R12_WORDS)
  if (!m.text.startsWith(R12_WORDS)) throw new Error('r12b words: ' + m.text)
  await sleep(300)
  await shot(w, `r12b-${sz}.png`, { check: () => document.getElementById('toastEl').style.opacity === '1' || 'the note faded' })
  rec(`r12b-${sz}.png`, '2', sz, 'drawn', `the passing note the top bar's Undo raised (today's words "${nu.text}") redrawn as this screen draws a refusal — the app's amber note (toast(words, 'warn')), the face p9's real last-admin refusal wore; nothing else`,
    `Proposed: the same press refused. The Suspend was taken back by the top bar's Undo and Hunter's row opened again (real), so the screen stands as it did before the press; the note reads "${R12_WORDS}" (New).`,
    JSON.stringify({ undoTitle, undoNote: nu, hunterAccount: hunterBack, row: again, drawn: m }))
  await w.ctx.close()
}

// ===================== run =====================
const PIECES = { r8, r12 }
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
