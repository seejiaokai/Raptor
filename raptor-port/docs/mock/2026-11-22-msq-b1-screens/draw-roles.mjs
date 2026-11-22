// Admin → Users, a person's opened row in option B (draw-row.mjs), for his two asks of 22 Nov 26 (chat 137):
//   "what does 5 look like if there are 3 sqns?" — one line per squadron: 142 Home squadron, 149, 150 (D2241's reading)
//   D2300 — where roles and access are given, say in plain words what each lets a person see and do: a fold under the
//   squadron lines, in the app's own "How it works" look (the Logic page's `.lghow`: an accent ▸ summary, 12px lines)
// Drawn on the REAL running app by .claude/skills/brainstorming/mockups-on-the-real-app.md: the real row opened through
// the app's own controls, then one transform from the app's own classes; every new part marked pink "New". Demo data has
// two squadrons, so 150's line is drawn as a third line of the same build. The Role list's choices read "Member",
// "Admin", "Master admin" — the long words moved into the fold (and the phone's Role box no longer cuts its word off).
// Cases: K1 Saber (master admin) opens Hunter (142's admin): 149 Plan, 150 View, the fold closed ·
//        K2 the same, the fold open · K3 Kestrel (149's admin) opens Ranger (142's member), the fold open: only 149's line his.
// Run from raptor-port/ against a served build:  MQ_URL=http://localhost:4601/ node docs/mock/2026-11-22-msq-b1-screens/draw-roles.mjs
// Pictures: docs/mock/2026-11-22-msq-b1-screens/img/k<n>-<d|p>.png
import { chromium, webkit } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const URL_ = process.env.MQ_URL || 'http://localhost:4601/'
const OUT = 'docs/mock/2026-11-22-msq-b1-screens/img'
mkdirSync(OUT, { recursive: true })
const NEW = '#ff2d95'
const PLAN_LINE = 'Full access to 149, every page: its schedule and publishing, its settings, its people and their sign-ins.' // D2211
// D2300: what each role and access lets a person see and do — short, plain, one line each
const KEY = [
  // the fresh read of 22 Nov: a member sees Logic and the Leave War too; "every page" kept (D2201, D2211); Plan for an admin only (D2250)
  ['Member', "Reads the squadron's schedule, Logic and Leave War. Changes only their own inputs, Quals row and leave bids."],
  ['Admin', 'Full access to the home squadron, every page: its schedule and publishing, its settings, its people and their sign-ins.'],
  ['View of a squadron', "Reads that squadron's schedule and Logic. Changes nothing there."],
  ['Plan of a squadron', 'For an admin only. Full access to that squadron, every page: its schedule and publishing, its settings, its people and their sign-ins.'],
  ['Master admin', 'Full access to every squadron. Only a master admin makes a squadron, gives Plan or makes a master admin.'],
]
const SIZES = {
  d: { engine: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { engine: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const CSS = `
.mkq { outline: 2px solid ${NEW} !important; outline-offset: 2px !important; }
.mkq-tag { position: absolute; z-index: 600; background: ${NEW}; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; top: -9px; right: -6px; }
#toastEl { display: none !important; }
#page-admin .mqb-sq { display: grid; grid-template-columns: 34px 1fr; column-gap: 10px; row-gap: 8px; align-items: center; margin: 12px 0 4px; }
#page-admin .mqb-sq > label { margin: 0; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); font-weight: 600; }
#page-admin .mqb-sq .mqb-home { font-size: 12px; color: var(--ink-2); }
#page-admin .mqb-sq .acc-acts { margin: 0; flex-wrap: nowrap; }
#page-admin .mqb-sq .adm-note { grid-column: 2; margin: -2px 0 2px; }
/* the fold: the Logic page's "How it works" (.lghow) look, word for word in size and colour */
#page-admin .mqk { margin: 4px 0 12px; }
#page-admin .mqk summary { font-size: 12px; font-weight: 600; color: var(--accent); cursor: pointer; list-style: none; min-height: 28px;
  display: flex; align-items: center; width: max-content; }
#page-admin .mqk summary::-webkit-details-marker { display: none; }
#page-admin .mqk summary::before { content: '▸'; width: 14px; }
#page-admin .mqk[open] summary::before { content: '▾'; }
#page-admin .mqk dl { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 5px 14px; margin: 4px 0 2px 14px;
  font-size: 12px; line-height: 1.5; }
#page-admin .mqk dt { color: var(--ink-1, #e8edf2); font-weight: 600; }
#page-admin .mqk dd { margin: 0; color: var(--ink-2); }
@media (max-width: 600px) {
  #page-admin .mqk dl { grid-template-columns: 1fr; gap: 0; }
  #page-admin .mqk dd { margin-bottom: 6px; }
}
`

function kit() {
  const mq = {}
  mq.el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; e.setAttribute('data-mine', '1'); return e }
  mq.mark = (el, tag = true) => {
    const b = el.getBoundingClientRect()
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.classList.add('mkq')
    if (tag) el.appendChild(mq.el('span', 'mkq-tag', 'New'))
    const a = el.getBoundingClientRect()
    if (!['x', 'y', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) < 0.6)) throw new Error('mark moved its element')
  }
  mq.badge = txt => {
    const c = mq.el('span', 'sarole ro', txt)
    c.style.background = 'rgba(255,255,255,.08)'; c.style.borderColor = 'rgba(255,255,255,.22)'; c.style.color = 'var(--ink-2)'
    c.style.verticalAlign = '1px'; c.style.marginLeft = '6px'; c.style.fontStyle = 'normal'
    return c
  }
  mq.seg = (words, picked, off = []) => {
    const g = mq.el('div', 'acc-acts acc-mode'); g.setAttribute('role', 'group')
    words.forEach((t, i) => { const b = mq.el('button', 'abtn' + (i === picked ? ' primary' : ''), t); b.type = 'button'; if (off.includes(i)) b.disabled = true; g.appendChild(b) })
    return g
  }
  mq.greyRest = keepSel => {
    const ed = document.querySelector('#page-admin .acc-edit'); let n = 0
    for (const c of ed.querySelectorAll('input, select, textarea, button')) {
      if ((keepSel && c.closest(keepSel)) || c.id === 'accEdSave' || c.id === 'accEdCancel') continue
      c.disabled = true; c.style.opacity = '.42'; n++
    }
    return n
  }
  window.__mq = mq
}

const errs = []
const browsers = {}
async function session(sz, user, pass) {
  const S = SIZES[sz]
  if (!browsers[sz]) browsers[sz] = await S.engine.launch()
  const ctx = await browsers[sz].newContext(S.opts)
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`) })
  await page.goto(URL_); await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(800)
  await page.addStyleTag({ content: CSS })
  return { ctx, page }
}
async function toUsers(page) {
  await page.evaluate(() => window.go('admin'))
  await page.waitForSelector('#page-admin.on', { state: 'attached' }); await page.waitForTimeout(600)
  if (!(await page.locator('#page-admin button.acc-main').first().isVisible())) {
    await page.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first().click(); await page.waitForTimeout(600)
  }
}
async function openRow(page, cs) {
  await page.locator('#page-admin button.acc-main', { hasText: new RegExp('^' + cs) }).first().click()
  await page.waitForSelector('#page-admin .acc-edit'); await page.waitForTimeout(400)
}
async function shot(page, sz, file) {
  await page.mouse.move(1, 1).catch(() => {})
  await page.evaluate(() => {
    document.activeElement && document.activeElement.blur && document.activeElement.blur()
    const r = document.querySelector('#page-admin .acc-row.od-row-on')
    r.scrollIntoView({ block: 'center' })
  })
  await page.waitForTimeout(250)
  const r = await page.evaluate(() => { const b = document.querySelector('#page-admin .acc-row.od-row-on').getBoundingClientRect(); return { L: b.left, T: b.top, R: b.right, B: b.bottom, W: innerWidth, H: innerHeight } })
  const pad = sz === 'd' ? 40 : 12
  const y = Math.max(0, r.T - pad), x = sz === 'd' ? Math.max(0, r.L - pad) : 0
  const clip = { x, y, width: sz === 'd' ? r.R - r.L + 2 * pad : r.W, height: Math.min(r.H - y, r.B - r.T + 2 * pad) }
  if (r.B + pad > r.H) errs.push(`${file}: the row runs past the screen's foot by ${Math.round(r.B + pad - r.H)}px`)
  await page.screenshot({ path: `${OUT}/${file}`, clip })
  console.log('  wrote', file)
}

async function draw(sz, c) {
  const { ctx, page } = await session(sz, ...c.who)
  await toUsers(page); await openRow(page, c.open)
  const m = await page.evaluate(({ c, KEY, PLAN_LINE }) => {
    const mq = window.__mq, row = document.querySelector('#page-admin .acc-row.od-row-on'), ed = row.querySelector('.acc-edit'), two = ed.querySelector('.adm-2col')
    if (c.badge) row.querySelector('.acc-name').appendChild(mq.badge('142'))
    // Role: the short names, Master admin added (option B); the long words now live in the fold
    const role = ed.querySelector('#accEdRole')
    for (const o of role.options) o.textContent = o.value === 'admin' ? 'Admin' : 'Member'
    const mo = mq.el('option', null, 'Master admin'); mo.value = 'mq-master'; role.appendChild(mo)
    // one line per squadron
    const grid = mq.el('div', 'mqb-sq')
    grid.appendChild(mq.el('label', null, '142')); grid.appendChild(mq.el('div', 'mqb-home', 'Home squadron'))
    if (c.master) role.value = 'mq-master'
    for (const s of c.lines) {
      grid.appendChild(mq.el('label', null, s.sq))
      if (c.master) grid.appendChild(mq.el('div', 'mqb-home', 'Full access'))
      else grid.appendChild(mq.seg(['None', 'View', 'Plan'], s.picked, s.off || []))
      if (s.line) grid.appendChild(mq.el('p', 'adm-note', s.line))
    }
    two.after(grid)
    if (c.grey === 'lines') for (const b of grid.querySelectorAll('button')) { b.disabled = true; b.style.opacity = '.42' }
    // the fold (D2300)
    const det = mq.el('details', 'mqk'); if (c.open_) det.open = true
    det.appendChild(mq.el('summary', null, 'What each role allows'))
    const dl = mq.el('dl'); for (const [t, d] of KEY) { dl.appendChild(mq.el('dt', null, t)); dl.appendChild(mq.el('dd', null, d)) }
    det.appendChild(dl); grid.after(det)
    if (c.grey === 'rest') mq.greyRest('.mqb-sq, details') // Ranger's own row stays 142's (D2191); 149's line is Kestrel's
    // premises: the squadron labels sit on the field labels' left edge; each squadron's buttons on one row
    const fl = ed.querySelector('.adm-2col .mfield label'), sl = grid.querySelector('label')
    const dx = Math.abs(fl.getBoundingClientRect().left - sl.getBoundingClientRect().left)
    if (dx > 0.5) throw new Error('squadron label off the field labels by ' + dx)
    const rows = [...grid.querySelectorAll('.acc-acts')].map(g => new Set([...g.children].map(b => Math.round(b.getBoundingClientRect().top))).size)
    const roleCut = role.scrollWidth > role.clientWidth + 1
    mq.mark(role.closest('.mfield')); mq.mark(grid); mq.mark(det)
    return { rows, roleCut, h: Math.round(ed.getBoundingClientRect().height) }
  }, { c, KEY, PLAN_LINE })
  if (m.rows.some(n => n !== 1)) errs.push(`${c.f}-${sz}: a squadron's buttons ran on ${m.rows.join('/')} rows`)
  console.log(`  ${c.f}-${sz}: editor ${m.h}px, button rows ${m.rows.join('/')}, role box cut: ${m.roleCut}`)
  await shot(page, sz, `${c.f}-${sz}.png`); await ctx.close()
}

const CASES = [
  { f: 'k1', who: ['ad', 'a'], open: 'Hunter', open_: false, lines: [{ sq: '149', picked: 2, line: PLAN_LINE }, { sq: '150', picked: 1 }] },
  { f: 'k2', who: ['ad', 'a'], open: 'Hunter', open_: true, lines: [{ sq: '149', picked: 2, line: PLAN_LINE }, { sq: '150', picked: 1 }] },
  { f: 'k3', who: ['ad9', 'a9'], open: 'Ranger', open_: true, badge: true, grey: 'rest',
    lines: [{ sq: '149', picked: 1, off: [2], line: 'Plan is for admins only.' }] }, // Ranger is a member (D2250)
  // k4: Saber picks Master admin for Hunter — every other squadron reads "Full access"
  { f: 'k4', who: ['ad', 'a'], open: 'Hunter', master: true, lines: [{ sq: '149' }, { sq: '150' }] },
  // k5: Hunter, 142's admin, opens Ranger — 149 not his to give (D2299's words); Ranger's own row stays his to change
  { f: 'k5', who: ['ad2', 'a2'], open: 'Ranger', grey: 'lines', lines: [{ sq: '149', picked: 0, line: 'Only an admin of 149 can give access to 149.' }] },
]
const PICK = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
for (const sz of ['d', 'p']) for (const c of CASES) {
  if (PICK && !PICK.includes(c.f)) continue
  try { await draw(sz, c) } catch (e) { errs.push(`[${c.f} ${sz}] ${e && e.message}`); console.log('FAILED', c.f, sz, e && e.message) }
}
for (const b of Object.values(browsers)) await b.close()
console.log('errors:', errs.length ? errs.join('\n') : 'none')
