// Multi-squadron batch 1, the reshape plan's two refusals whose words are drawn for him first (docs/superpowers/plans/
// 2026-11-20-multi-sqn-b1-reshape.md §19b rows R7 and R1; D1625) — drawn on the REAL running app by
// .claude/skills/brainstorming/mockups-on-the-real-app.md: each picture is the real screen reached through the app's own
// controls, then at most ONE named transform. A new part is the app's own element with its words changed (or cloned from
// a real neighbour), outlined pink and tagged "New"; the place a question is about is outlined and tagged with its
// number. Every staged record is asserted on screen (or read back, and said so) before a picture. Harness copied from
// docs/mock/2026-11-21-msq-r8-r12/draw.mjs (world, rows at the sign-in card, Outlaw made a 142 admin as its r12a does,
// the refusal note in the app's amber "warn" look as its r12b draws it); the transfer sheet is the approved drawing of
// docs/mock/2026-11-17-multi-sqn-r7/draw-r7d.mjs (its TRANSFER transform, variant F, copied whole, and its D3 refusal
// line — the sheet's own "note warn" line above a greyed Post out).
//
//   q1a  1 · Setup: Hunter (142's admin) holds Plan of 149 (a stored row — no screen gives Plan yet); Saber makes Outlaw
//        a 142 admin on Admin → Users (real). Outlaw opens Hunter's row, Role → Member, Save: refused today with the
//        generic words (real)
//   q1b  1 · the same screen, the note's words changed to the proposed ones (drawn: the words, New)
//        (then, no picture: Saber, the master admin, does the same — allowed, and Hunter's Plan of 149 ends; asserted)
//   q2a  2 · Hunter signed in, the Leave War, his own Post out sheet: "Transfer to Sqn" greyed, not built (real)
//   q2b  2 · the approved transfer sheet (round 7's drawing, variant F) on his own row, refused: the proposed sentence
//        in the sheet's refusal look above a greyed Post out (drawn: the approved transform + the line, New)
//   q2c  2 · the same, Hunter on Saber's (the master admin's) row: the app's existing "Only a master admin can do that"
//        (drawn, as q2b)
//
// Run from raptor-port/:  node docs/mock/2026-11-21-msq-r1-r7/draw.mjs
// MQ_ONLY=q1 or q2; MQ_SIZES=d or p. MQ_DIST points at a frozen build (default dist/) — served from INSIDE the test
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
const BASE = 'http://localhost:4529'
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

const SIZES = {
  d: { name: 'desktop 1536×864 (Chromium, 2x)', engine: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'iPhone 402×874 (WebKit, touch, 2x)', engine: webkit, opts: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
}
const MARK_CSS = `
.mkq { outline: 2px solid ${PINK} !important; outline-offset: 2px !important; }
.mkq.mkq-in { outline-offset: -2px !important; }
.mkq-tag { position: absolute; z-index: 600; background: ${PINK}; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; font-style: normal; }
.mkq-ptag { position: fixed; z-index: 2147483647; }
`
const TOAST_HIDE = `#toastEl { display: none !important; }`
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' }

// ---- the kit sent into the page (declares every helper it calls) — 21 Nov's, with sheet() from round 7's ----
function kit() {
  const mq = {}
  mq.vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  mq.sheet = () => [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(x => x.getBoundingClientRect().height > 0).pop()
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
    const canHold = !['SELECT', 'INPUT', 'TEXTAREA', 'OPTION', 'IMG', 'TR', 'TBODY', 'TABLE', 'BUTTON'].includes(el.tagName)
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
function rec(file, q, sz, kind, transform, caption, asserted) { manifest[file] = { question: q, size: SIZES[sz].name, kind, transform, caption, asserted } }
async function shot(w, file, { region = null, check = null } = {}) {
  const p = w.page
  if (!w.phone) await p.mouse.move(1, 1).catch(() => {})
  await p.evaluate(() => { const a = document.activeElement; if (a && a.blur && a !== document.body) a.blur() })
  await sleep(200)
  if (check) { const why = await p.evaluate(check); if (why !== true) throw new Error(file + ': premise gone — ' + why) }
  await p.screenshot({ path: join(OUT, file), ...(region ? { clip: region } : {}) })
  console.log('  wrote', file)
}
const unmark = p => p.evaluate(() => { for (const e of document.querySelectorAll('[data-mine]')) e.remove(); for (const e of document.querySelectorAll('.mkq')) e.classList.remove('mkq', 'mkq-in') })

// ===================== 1 — making a member of an admin who holds Plan of another squadron =====================
const PLAN149 = { 'grant:gpa149': { id: 'gpa149', account: 'acad2', unit: 'u149', level: 'admin', from: '2026-01-01' } }
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
  return r ? { sub: r.querySelector('.acc-sub')?.innerText.replace(/\s+/g, ' ').trim(), pill: r.querySelector('.od-rc')?.innerText.trim(), open: r.classList.contains('od-row-on'), edit: !!r.querySelector('.acc-edit'), role: r.querySelector('#accEdRole')?.value || '' } : null
}, cs)
const noteNow = p => p.evaluate(() => { const e = document.getElementById('toastEl'); if (!e) return null; const r = e.getBoundingClientRect(); return { text: e.innerText.replace(/\s+/g, ' ').trim(), op: e.style.opacity, face: e.dataset.face || '', color: e.style.color, border: e.style.borderColor, w: Math.round(r.width), h: Math.round(r.height) } })
const stored = (p, k) => p.evaluate(k => JSON.parse(localStorage.getItem('raptor:settings/' + k) || 'null'), k)
const HOLD = () => { const t = document.getElementById('toastEl'); if (window.__mqHold) window.__mqHold.disconnect(); window.__mqHold = new MutationObserver(() => { if (t.style.opacity !== '1') t.style.opacity = '1' }); window.__mqHold.observe(t, { attributes: true, attributeFilter: ['style'] }) }
// the desktop picture cut to the Users list's column and the top bar's right end (it names who is signed in); the
// phone's whole screen is that column already
const usersCrop = async w => w.phone ? null : w.page.evaluate(() => {
  const r = document.querySelector('#page-admin .acc-row.od-row').getBoundingClientRect()
  const t = document.getElementById('toastEl').getBoundingClientRect()
  const x = Math.max(0, Math.floor(Math.min(r.left, t.left) - 40))
  return { x, y: 0, width: innerWidth - x, height: innerHeight }
})
const Q1_WORDS = 'Hunter holds Plan of 149. Only a master admin can make him a member.'
async function q1(sz) {
  const w = await world(sz, { time: '2026-07-15T10:00:00', rows: PLAN149, toasts: true })
  const p = w.page
  // setup through the app's own controls, as r12a's: the demo has no 142 admin who is not a master admin — Saber makes
  // Outlaw (a 142 member) an admin on Admin → Users
  await login(w, 'ad')
  await toUsers(w); await openRow(w, 'Outlaw')
  await p.selectOption('#accEdRole', 'admin'); await sleep(300)
  await tap(w, p.locator('#accEdSave')); await sleep(900)
  const outlaw = await rowOf(p, 'Outlaw')
  if (!/ADMIN/i.test(outlaw?.pill || '')) throw new Error('q1 setup: Outlaw not made an admin ' + JSON.stringify(outlaw))
  await signOut(w); await login(w, 'outlaw')
  const sess = await p.evaluate(() => ({ grant: localStorage.getItem('raptor:settings/grant:gpa149'), outlawMaster: JSON.parse(localStorage.getItem('raptor:settings/account:acoutlaw') || 'null')?.master || false }))
  if (!sess.grant || sess.outlawMaster) throw new Error('q1 setup: ' + JSON.stringify(sess))
  await toUsers(w)
  await openRow(w, 'Hunter')
  const before = await rowOf(p, 'Hunter')
  if (!before?.edit || before.role !== 'admin' || !/ADMIN/i.test(before.pill || '')) throw new Error('q1a: Hunter\'s row ' + JSON.stringify(before))
  // the press: Role → Member, Save
  await p.selectOption('#accEdRole', 'main'); await sleep(300)
  await tap(w, p.locator('#accEdSave')); await sleep(450)
  const n = await noteNow(p)
  const after = await rowOf(p, 'Hunter')
  const hunter = await stored(p, 'account:acad2')
  const grant = await stored(p, 'grant:gpa149')
  // today: refused, in the generic words; nothing changed — he is still an admin and his Plan of 149 stands
  if (!n || n.op !== '1' || n.text !== 'This change could not be saved.' || (hunter && hunter.role !== 'admin') || !grant) throw new Error('q1a premise: ' + JSON.stringify({ n, after, hunter, grant }))
  await p.evaluate(HOLD)
  await p.evaluate(() => {
    const mq = window.__mq
    const r = [...document.querySelectorAll('#page-admin .acc-row.od-row')].find(x => (x.querySelector('.acc-name')?.textContent || '') === 'Hunter')
    r.scrollIntoView({ block: 'center' })
    mq.mark(document.getElementById('toastEl'), '1')
    mq.mark(document.getElementById('accEdRole'), null, { noTag: true })
  })
  await sleep(300)
  await shot(w, `q1a-${sz}.png`, { region: await usersCrop(w), check: () => document.getElementById('toastEl').style.opacity === '1' || 'the note faded' })
  rec(`q1a-${sz}.png`, '1', sz, 'real', 'none (marks only)',
    `Wed 15 Jul 2026, 10:00. Setup: Hunter's Plan of 149 written as a stored row (no screen gives Plan yet); Saber made Outlaw a 142 admin on Admin → Users. Outlaw, signed in, opens Hunter's row, picks Member, presses Save: refused today, the note reads "${n.text}" (1); Hunter stays an admin, his Plan of 149 stands.`,
    JSON.stringify({ stored: w.back, outlawRow: outlaw, before, note: n, after, hunterAccount: hunter, grant }))
  // q1b — the same screen, the note's words changed (the note keeps the face the app gave it: toast(words, 'warn'))
  await unmark(p)
  const m = await p.evaluate(words => {
    const t = document.getElementById('toastEl')
    t.textContent = words; t.style.opacity = '1'
    window.__mq.mark(t, 'New')
    const b = t.getBoundingClientRect()
    return { w: Math.round(b.width), h: Math.round(b.height), text: t.innerText.replace(/\s+/g, ' ').trim(), color: t.style.color, border: t.style.borderColor }
  }, Q1_WORDS)
  if (!m.text.startsWith(Q1_WORDS)) throw new Error('q1b words: ' + m.text)
  await sleep(300)
  await shot(w, `q1b-${sz}.png`, { region: await usersCrop(w), check: () => document.getElementById('toastEl').style.opacity === '1' || 'the note faded' })
  rec(`q1b-${sz}.png`, '1', sz, 'drawn', `the refusal note's words changed (today's "${n.text}"), its amber face kept as the app drew it; nothing else`,
    `Proposed: the same press, the note reading "${Q1_WORDS}" (New).`, JSON.stringify({ drawn: m }))
  await p.evaluate(() => { window.__mqHold && window.__mqHold.disconnect(); window.__mqHold = null })
  await unmark(p)
  // no picture: Saber, the master admin, does the same — allowed, and Hunter's Plan of 149 ends in the same change
  await signOut(w); await login(w, 'ad')
  await toUsers(w); await openRow(w, 'Hunter')
  await p.selectOption('#accEdRole', 'main'); await sleep(300)
  await tap(w, p.locator('#accEdSave')); await sleep(600)
  const nm = await noteNow(p)
  const hunterM = await stored(p, 'account:acad2')
  const grantM = await p.evaluate(() => localStorage.getItem('raptor:settings/grant:gpa149'))
  const ok = hunterM?.role === 'main' && (grantM == null || grantM === 'null')
  say('q1', sz, 'master does it:', JSON.stringify({ note: nm?.text, hunterRole: hunterM?.role, grantAfter: grantM, ok }))
  if (!ok) errs.push(`[${sz}] q1 master check failed ${JSON.stringify({ nm, hunterM, grantM })}`)
  manifest[`q1-master-${sz}`] = { question: '1', size: SIZES[sz].name, kind: 'asserted, no picture', caption: 'Saber (master admin) makes Hunter a member on Admin → Users: allowed, and Hunter\'s Plan of 149 ends with it.', asserted: JSON.stringify({ note: nm, hunterAccount: hunterM, grantAfter: grantM }) }
  await w.ctx.close()
}

// ===================== 2 — moving yourself, or the master admin, to another squadron =====================
// the approved transfer sheet: round 7's TRANSFER (docs/mock/2026-11-17-multi-sqn-r7/draw-r7d.mjs), copied whole but for
// the man's name in the "approved by" figures it never printed; the date re-lettered Fri 3 Apr as that drawing does
const TRANSFER = () => {
  const mq = window.__mq, s = mq.sheet()
  const when = s.querySelector('.when'); const orig = when ? when.textContent : ''; if (when) when.textContent = 'Fri 3 Apr'
  const db = s.querySelector('[data-testid="po-date"] .datebox-txt'); if (db) db.textContent = 'Fri 3 Apr 26'
  const till = s.querySelector('[data-testid="bid-tilldate"]'); if (till) till.textContent = 'till 3 Apr'
  const ov = s.querySelector('[data-testid$="-overseas"]'); if (ov) { ov.classList.remove('on'); ov.textContent = 'Overseas Sqn' }
  const t = s.querySelector('[data-testid$="-transfer"]'); t.disabled = false; t.removeAttribute('title'); t.classList.add('on'); t.textContent = '✓ Transfer to Sqn'
  const row = s.querySelector('.po-outcomes')
  const proto = row.querySelector('[data-testid$="-delete"]')
  const to = row.cloneNode(false); to.setAttribute('data-mine', '1'); to.removeAttribute('aria-label')
  const lab = row.querySelector('.lab').cloneNode(true); lab.textContent = 'To'; to.appendChild(lab)
  const ch = proto.cloneNode(true); ch.removeAttribute('data-testid'); ch.classList.add('on'); ch.textContent = '✓ 149'; to.appendChild(ch)
  row.after(to)
  const note = [...s.querySelectorAll('.note')].find(x => /^On /.test(x.textContent.trim()))
  if (!note) throw new Error('the sheet has no "On …" line')
  note.textContent = 'On Fri 3 Apr: moves to 149 as a member, with his sign-in, leave, OIL and inputs. His admin rights and his Scheduler, Management and SXO ticks in 142 end.'
  const d = '3 Apr'
  const L = ['As of today:',
    `2 of 142's lines after ${d} keep him, as a borrowed 149 man`,
    '3 of his inputs move to 149\'s schedule',
    '1 leave 142 approved arrives approved, marked "approved by 142 before he joined"; 149 may send it back',
    'Published days go pending: 4 of 142\'s, 2 of 149\'s',
    `142's manning from ${d}: OPS P turns amber on 4 days`,
    "Both squadrons' admins are told now and on the date"]
  const n2 = note.cloneNode(false); n2.setAttribute('data-mine', '1'); n2.textContent = L.join('\n'); n2.style.whiteSpace = 'pre-line'
  note.after(n2)
  for (const x of [note, n2]) { x.style.flex = '1 1 100%'; x.style.maxWidth = '100%' }
  return { orig, who: s.querySelector('.who, h2, .bidsheet-head')?.textContent?.trim() || '' }
}
// round 7's D3: the refusal line in the sheet's own refusal look ("note warn", as Post out's own error uses) above a
// greyed Post out (the sheet's own disabled look)
const REFUSE = words => {
  const mq = window.__mq, s = mq.sheet()
  const po = [...s.querySelectorAll('button')].find(b => b.textContent.trim() === 'Post out')
  po.disabled = true
  const poRow = po.closest('.bidsheet-row')
  const r = poRow.cloneNode(false); r.setAttribute('data-mine', '1')
  const sp = document.createElement('span'); sp.className = 'note warn'; sp.textContent = words
  sp.setAttribute('data-mine', '1'); r.appendChild(sp); poRow.before(r)
  mq.mark(sp, 'New')
  // the sheet may scroll inside itself on a phone: bring its foot (Post out) into view
  for (let a = po.parentElement; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (/(auto|scroll)/.test(cs.overflowY) && a.scrollHeight > a.clientHeight) a.scrollTop = a.scrollHeight }
  return { op: getComputedStyle(po).opacity, color: getComputedStyle(sp).color }
}
async function sheetFor(w, pid, iso) {
  const p = w.page
  await p.evaluate(() => window.go('leavewar'))
  await p.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await sleep(800)
  const c = p.locator(`[data-testid="cell-${pid}-${iso}"]`).first()
  if (!(await c.count())) throw new Error(`no Leave War cell for ${pid} on ${iso}`)
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  await tap(w, c); await sleep(700)
  await tap(w, p.locator('.bidsheet[role="dialog"] [data-testid="bid-more"]').filter({ visible: true }).last()); await sleep(400)
  await tap(w, p.locator('[data-testid="bid-postout"]').filter({ visible: true }).last()); await sleep(700)
  return p.evaluate(() => { const s = window.__mq.sheet(); return s ? s.innerText.split('\n').slice(0, 2).join(' ').replace(/\s+/g, ' ').trim() : null })
}
async function sheetClip(p) {
  const b = await p.evaluate(() => { const r = window.__mq.sheet().getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })
  const pad = 16, vw = p.viewportSize()
  const y = Math.max(0, b.y - 40)
  return { x: Math.max(0, b.x - pad), y, width: Math.min(vw.width - Math.max(0, b.x - pad), b.w + 2 * pad), height: Math.min(vw.height - y, b.h + 40 + pad) }
}
const Q2_SELF = "You can't move yourself to another squadron — ask another admin"
const Q2_MASTER = 'Only a master admin can do that'
async function q2(sz) {
  // the approved drawing's day: the war's grid draws the months round today, so Fri 20 Nov stands in, re-lettered Fri 3 Apr
  const ISO = '2026-11-20'
  // q2a — today, real: Hunter's own Post out sheet; "Transfer to Sqn" greyed
  {
    const w = await world(sz, { time: '2026-11-17T10:00:00' })
    const p = w.page
    await login(w, 'ad2')
    const head = await sheetFor(w, 'prowler', ISO)
    if (!/Hunter/.test(head || '')) throw new Error('q2a: not Hunter\'s sheet ' + head)
    const st = await p.evaluate(() => {
      const s = window.__mq.sheet(), t = s.querySelector('[data-testid$="-transfer"]')
      window.__mq.mark(t, '2', { noTag: false })
      return { disabled: t.disabled, title: t.getAttribute('title'), chips: [...s.querySelectorAll('.po-outcomes button')].map(b => b.textContent.trim()) }
    })
    if (!st.disabled) throw new Error('q2a: Transfer to Sqn is not greyed ' + JSON.stringify(st))
    await sleep(200)
    await shot(w, `q2a-${sz}.png`, { region: await sheetClip(p) })
    rec(`q2a-${sz}.png`, '2', sz, 'real', 'none (marks only)',
      `Tue 17 Nov 2026. Hunter (142's admin) signed in, the Leave War, his own row, Post out: "Transfer to Sqn" (2) is greyed — "${st.title}" — so no screen moves anyone yet.`,
      JSON.stringify({ head, ...st }))
    await w.ctx.close()
  }
  // q2b and q2c — the approved transfer sheet, refused: on his own row, and on Saber's
  for (const [file, pid, cs, words] of [[`q2b-${sz}.png`, 'prowler', 'Hunter', Q2_SELF], [`q2c-${sz}.png`, 'stiff', 'Saber', Q2_MASTER]]) {
    const w = await world(sz, { time: '2026-11-17T10:00:00' })
    const p = w.page
    await login(w, 'ad2')
    const head = await sheetFor(w, pid, ISO)
    if (!new RegExp(cs).test(head || '')) throw new Error(file + ': not ' + cs + '\'s sheet ' + head)
    const tr = await p.evaluate(TRANSFER)
    const rf = await p.evaluate(REFUSE, words)
    await sleep(250)
    const seen = await p.evaluate(words => { const s = window.__mq.sheet(); const sp = [...s.querySelectorAll('.note.warn')].find(x => x.textContent.startsWith(words)); const r = sp.getBoundingClientRect(); return { inView: r.top >= 0 && r.bottom <= innerHeight, head: s.innerText.split('\n')[0] } }, words)
    if (!seen.inView) say(file, 'the refusal line is out of view', JSON.stringify(seen))
    await shot(w, file, { region: await sheetClip(p) })
    rec(file, '2', sz, 'drawn', 'round 7\'s approved transfer sheet (variant F, its TRANSFER transform) on the real Post out sheet, then round 7\'s D3 refusal line ("note warn" above a greyed Post out) with these words',
      `Hunter signed in, ${cs}'s Post out sheet as the approved drawing draws it (Transfer to Sqn → 149, Fri 3 Apr, the figures made up), refused: "${words}" (New). Not built.`,
      JSON.stringify({ head, transform: tr, refusal: rf, seen }))
    await w.ctx.close()
  }
}

// ===================== run =====================
const PIECES = { q1, q2 }
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
