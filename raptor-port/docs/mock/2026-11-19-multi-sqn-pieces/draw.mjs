// Multi-squadron batch 1 — the new pieces he has ruled on but not yet seen (the night of 19 Nov 26, chat 109's job 3),
// drawn on the REAL running app by .claude/skills/brainstorming/mockups-on-the-real-app.md. Nothing of the app changes:
// each picture is the real screen reached through the app's own controls, then ONE transform — real nodes cloned and
// re-lettered, a part hidden (never removed), a new part built from the app's own classes — marked by an outline on the
// element and a "New" tag (pink: everything here is new to him).
//   p1 · Admin → Users, a person's row: the access ladder None · View 149 · Plan 149 · Master admin, and who may set which
//   p2 · Admin → Users, the list: "PLANS 149" beside the role pill of a man who holds Plan of 149, on both lists
//   p3 · the bell: the squadron mark on a line from a squadron other than his own, and the master's per-squadron chips
//   p4 · Inputs → ⚙ → Calendar…: a detachment's own holiday list, empty, offering "Copy 149's list"
//   p5 · the sign-in screen: a sign-in held while the last person's change on this tab is still saving
//   p6 · the bell: the four lines that cross squadrons (a borrowed man unavailable, posted out, taken back; a save
//        replaced by a later one)
//   p7 · Admin → Squadrons (the drawn page, not built): a shared place's time zone greyed for anyone but a master
//   p8 · Admin → Users, a man's row: a posting that could not run, in the place a held posting's words already show
//   p9 · the last-admin refusal for a home move dated ahead: the note today (the code's words) and proposed
//
// Run from raptor-port/ against a served build:  MQ_URL=http://localhost:4517/ node docs/mock/2026-11-19-multi-sqn-pieces/draw.mjs
// MQ_ONLY=p1,p3 draws only those. Pictures: docs/mock/2026-11-19-multi-sqn-pieces/img/ (+ manifest.json). Demo data only.
import { chromium, webkit } from '@playwright/test'
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'

const URL_ = process.env.MQ_URL || 'http://localhost:4517/'
const OUT = 'docs/mock/2026-11-19-multi-sqn-pieces/img'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
mkdirSync(OUT, { recursive: true })
const PINK = '#ff2d95'

const SIZES = {
  d: { name: 'desktop 1536', engine: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'iPhone 402 (WebKit)', engine: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}

const MARK_CSS = `
.mkq { outline: 2px solid ${PINK} !important; outline-offset: 2px !important; }
.mkq.mkq-in { outline-offset: -2px !important; }
.mkq-tag { position: absolute; z-index: 600; background: ${PINK}; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; }
`
const TOAST_CSS = `#toastEl { display: none !important; }`

function kit() {
  const mq = {}
  mq.vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  mq.strip = root => {
    for (const n of [root, ...root.querySelectorAll('*')]) for (const a of ['id', 'data-testid', 'data-acct', 'data-person', 'data-editing', 'for']) n.removeAttribute(a)
    root.setAttribute('data-mine', '1')
    return root
  }
  mq.hide = e => { e.setAttribute('data-mqhid', '1'); e.style.setProperty('display', 'none', 'important') }
  // the mark: an outline on the element (it takes no room) and a "New" tag as its own child, placed at its top right;
  // asserts the element's box did not move
  // noTag: the outline alone (a small badge, whose tag would cover its own letters)
  mq.mark = (el, inside = false, noTag = false) => {
    const b = el.getBoundingClientRect()
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.classList.add('mkq'); if (inside) el.classList.add('mkq-in')
    const t = document.createElement('span'); t.className = 'mkq-tag'; t.textContent = 'New'; t.setAttribute('data-mine', '1')
    t.style.top = '-9px'; t.style.right = '-6px'
    if (!noTag) el.appendChild(t)
    const a = el.getBoundingClientRect()
    if (!['x', 'y', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) < 0.6)) throw new Error('mark moved its element')
    return t
  }
  // the look-2 squadron badge already ruled for another squadron's line (round 4's mq.badge: the role chip `sarole ro`)
  mq.badge = (txt) => {
    const c = document.createElement('span'); c.className = 'sarole ro'; c.textContent = txt; c.setAttribute('data-mine', '1')
    c.style.background = 'rgba(255,255,255,.08)'; c.style.borderColor = 'rgba(255,255,255,.22)'; c.style.color = 'var(--ink-2)'
    c.style.verticalAlign = '1px'; c.style.marginLeft = '6px'; c.style.fontStyle = 'normal'
    return c
  }
  mq.el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; e.setAttribute('data-mine', '1'); return e }
  window.__mq = mq
}

const manifest = {}
const errs = []
let browsers = {}

async function session(sz, user = 'ad', pass = 'a', { toasts = false, signIn = true } = {}) {
  const S = SIZES[sz]
  if (!browsers[sz]) browsers[sz] = await S.engine.launch()
  const ctx = await browsers[sz].newContext(S.opts)
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`); console.log('PAGEERROR', String(e)) })
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  await page.goto(URL_)
  await page.waitForSelector('#luser')
  await page.addStyleTag({ content: MARK_CSS + (toasts ? '' : TOAST_CSS) })
  if (!signIn) return { ctx, page }
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(800)
  await page.addStyleTag({ content: MARK_CSS + (toasts ? '' : TOAST_CSS) })
  return { ctx, page }
}
function rec(file, piece, sz, kind, caption) { manifest[file] = { piece, size: SIZES[sz].name, kind, caption } }
// a picture: the whole phone screen, or on a desktop the box round the given elements (padded), never past the screen
async function shot(page, file, sels, pad = 24) {
  await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(150)
  let clip
  if (sels) {
    const r = await page.evaluate(sels => {
      let L = 1e9, T = 1e9, R = -1e9, B = -1e9
      for (const s of sels) for (const e of document.querySelectorAll(s)) {
        const b = e.getBoundingClientRect(); if (!(b.width > 0)) continue
        L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.right); B = Math.max(B, b.bottom)
      }
      return L < 1e9 ? { L, T, R, B, W: innerWidth, H: innerHeight } : null
    }, sels)
    if (!r) throw new Error(file + ': nothing to frame ' + sels.join(','))
    const x = Math.max(0, r.L - pad), y = Math.max(0, r.T - pad)
    clip = { x, y, width: Math.min(r.W, r.R + pad) - x, height: Math.min(r.H, r.B + pad) - y }
  }
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}) })
  console.log('  wrote', file)
}
const tap = async (page, sel) => { await page.locator(sel).first().click(); await page.waitForTimeout(350) }

// ---------- Admin → Users ----------
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
// the ladder, built in the open row's editor under Sign-in / Role, from the app's own segmented pair (the people form's
// "On the roster | New person": .mfield-lbl over .acc-acts.acc-mode of .abtn, the picked one .primary) and its quiet
// note (.adm-note). picked: index of the lit rung; off: indexes greyed (disabled); note: the one line under it
async function ladder(page, { picked, off = [], note }) {
  return page.evaluate(({ picked, off, note }) => {
    const mq = window.__mq, ed = document.querySelector('#page-admin .acc-edit'), two = ed.querySelector('.adm-2col')
    const box = mq.el('div', 'mq-ladder'); box.style.margin = '10px 0 12px'
    const lbl = mq.el('div', 'mfield'); const s = mq.el('span', 'mfield-lbl', 'Other squadrons'); lbl.appendChild(s); box.appendChild(lbl)
    const g = mq.el('div', 'acc-acts acc-mode'); g.setAttribute('role', 'group')
    ;['None', 'View 149', 'Plan 149', 'Master admin'].forEach((t, i) => {
      const b = mq.el('button', 'abtn' + (i === picked ? ' primary' : ''), t); b.type = 'button'
      if (off.includes(i)) b.disabled = true
      g.appendChild(b)
    })
    box.appendChild(g)
    if (note) { const n = mq.el('p', 'adm-note', note); n.style.margin = '6px 0 0'; box.appendChild(n) }
    two.after(box)
    // the segmented pair's real gap and look are the app's; the label is the form's own label class
    mq.mark(box)
    const r = box.getBoundingClientRect(), e = ed.getBoundingClientRect()
    return { boxW: Math.round(r.width), edW: Math.round(e.width), rows: g.getBoundingClientRect().height > 50 ? 2 : 1 }
  }, { picked, off, note })
}

async function p1(sz) {
  // 1a — Saber (the master) opens Hunter's row (142's admin): every rung his to set; Plan 149 picked
  {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await toUsers(page); await openRow(page, 'Hunter')
    const m = await ladder(page, { picked: 2, note: 'Every 149 page is his to edit, as for 149\'s own admins.' })
    const f = `p1a-${sz}.png`; await shot(page, f, sz === 'd' ? ['#page-admin .acc-row.od-row-on'] : null, 40)
    rec(f, 'p1', sz, 'drawn', `Saber, the master admin, has opened Hunter's row (an admin of 142) on Admin → Users. New: the "Other squadrons" ladder under Sign-in and Role, Plan 149 picked, its one line saying what Plan means. Every rung is Saber's to set. Measured: ladder ${m.boxW}px wide in a ${m.edW}px editor, ${m.rows} row(s).`)
    await ctx.close()
  }
  // 1b — Kestrel (149's admin) opens Ranger's row (142's member): View 149 his to give; Plan and Master greyed
  {
    const { ctx, page } = await session(sz, 'ad9', 'a9')
    await toUsers(page); await openRow(page, 'Ranger')
    const m = await ladder(page, { picked: 1, off: [2, 3], note: 'Only a master admin gives Plan or makes a master admin.' })
    const f = `p1b-${sz}.png`; await shot(page, f, sz === 'd' ? ['#page-admin .acc-row.od-row-on'] : null, 40)
    rec(f, 'p1', sz, 'drawn', `Kestrel, 149's admin, has opened Ranger's row (a member of 142). New: the ladder with View 149 picked; Plan 149 and Master admin greyed, the line under them saying why. The rest of Ranger's row stays 142's: Save is refused in the words already built ("He is 142's. Only an admin of 142 can change his account."). Measured: ${m.rows} row(s).`)
    await ctx.close()
  }
  // 1c — Hunter (142's admin) opens Ranger's row: access to 149 is not his to give
  if (sz === 'd') {
    const { ctx, page } = await session(sz, 'ad2', 'a2')
    await toUsers(page); await openRow(page, 'Ranger')
    await ladder(page, { picked: 0, off: [1, 2, 3], note: 'Only 149\'s admins or a master admin give access to 149.' })
    const f = `p1c-${sz}.png`; await shot(page, f, ['#page-admin .acc-row.od-row-on'], 40)
    rec(f, 'p1', sz, 'drawn', 'Hunter, 142\'s own admin, has opened Ranger\'s row. New: the ladder greyed whole, None lit, the line saying who may give access to 149.')
    await ctx.close()
  }
}

// ---------- p2: "PLANS 149" beside the role pill ----------
async function plansPill(page) {
  return page.evaluate(() => {
    const mq = window.__mq
    const row = [...document.querySelectorAll('#page-admin .acc-row.od-row')].find(r => /^Hunter/.test(r.querySelector('.acc-name')?.textContent || ''))
    // a pill beside ADMIN wrapped to two lines and pushed the dot columns (first drawing): the words go at the end of
    // his line under the callsign instead, in its own grey — no width taken from the columns, alike on a phone (which
    // shows no pill)
    const sub = row.querySelector('.acc-sub'), h0 = row.getBoundingClientRect().height
    const p = mq.el('span', '', ' · also plans 149'); sub.appendChild(p)
    mq.mark(p, false, true)
    const t = document.createElement('span'); t.className = 'mkq-tag'; t.textContent = 'New'; t.style.top = '-12px'; t.style.right = '-14px'; p.appendChild(t)
    row.scrollIntoView({ block: 'center' })
    return { grew: Math.round(row.getBoundingClientRect().height - h0) }
  })
}
async function p2(sz) {
  for (const [u, pw, who, k] of [['ad', 'a', 'Saber, the master admin (his list is 142\'s)', 'a'], ['ad9', 'a9', 'Kestrel, 149\'s admin (149\'s list)', 'b']]) {
    if (sz === 'p' && k === 'b') continue
    const { ctx, page } = await session(sz, u, pw)
    await toUsers(page)
    await page.evaluate(() => { const r = [...document.querySelectorAll('#page-admin .acc-row.od-row')].find(r => /^Hunter/.test(r.querySelector('.acc-name')?.textContent || '')); r.scrollIntoView({ block: 'center' }) })
    await page.waitForTimeout(300)
    await plansPill(page)
    await page.waitForTimeout(200)
    const f = `p2${k}-${sz}.png`
    if (sz === 'd') {
      await page.evaluate(() => { const r = [...document.querySelectorAll('#page-admin .acc-row.od-row')].find(r => /^Hunter/.test(r.querySelector('.acc-name')?.textContent || '')); r.setAttribute('data-mqshot', '1'); const p = r.previousElementSibling, n = r.nextElementSibling; p && p.setAttribute('data-mqshot', '1'); n && n.setAttribute('data-mqshot', '1') })
      await shot(page, f, ['[data-mqshot]'], 30)
    } else await shot(page, f)
    rec(f, 'p2', sz, 'drawn', `Admin → Users as ${who}. Hunter holds Plan of 149. New: "· also plans 149" at the end of his line under the callsign, in that line's own grey — the same on 142's list and on 149's.`)
    await ctx.close()
  }
}

// ---------- the bell ----------
async function openBell(page) {
  await page.locator('.bellbtn:visible').first().click()
  await page.waitForSelector('[data-testid="bell-list"]')
  await page.waitForTimeout(400)
}
// lines: [{ name, day, what, who, sq, unread }] — built from the bell's own line markup (ui/topbits.tsx: button.bl-line >
// .bl-dot, .bl-main > .bl-t (b.bl-name, i.bl-day) + .bl-what, .bl-ago); the real list's "Nothing new" hidden.
// chips: null, or { on: ['142'], all: ['142','149'] } — the master's per-squadron choice, the filter chip's own look
async function bellLines(page, lines, chips, markIdx = []) {
  return page.evaluate(({ lines, chips, markIdx }) => {
    const mq = window.__mq, list = document.querySelector('[data-testid="bell-list"]'), sc = list.querySelector('.bl-scroll')
    for (const k of [...sc.children]) mq.hide(k)
    const made = []
    for (const l of lines) {
      const b = mq.el('button', 'bl-line' + (l.unread ? ' unread' : '')); b.type = 'button'
      b.appendChild(mq.el('span', 'bl-dot'))
      const main = mq.el('span', 'bl-main'), t = mq.el('span', 'bl-t')
      t.appendChild(mq.el('b', 'bl-name', l.name))
      if (l.sq) t.appendChild(mq.badge(l.sq))
      t.appendChild(mq.el('i', 'bl-day', l.day))
      main.appendChild(t); main.appendChild(mq.el('span', 'bl-what', l.what + (l.who ? ' · ' + l.who : '')))
      b.appendChild(main); b.appendChild(mq.el('span', 'bl-ago', l.ago || '2m'))
      sc.appendChild(b); made.push(b)
    }
    if (chips) {
      let foot = list.querySelector('.bl-foot')
      if (!foot) { foot = mq.el('div', 'bl-foot'); list.appendChild(foot) }
      const row = mq.el('span', 'mq-sqchips'); row.style.display = 'inline-flex'; row.style.gap = '6px'; row.style.alignItems = 'center'; row.style.marginRight = 'auto'
      row.appendChild(mq.el('span', 'bl-more', 'Show'))
      for (const s of chips.all) { const c = mq.el('button', 'fchip' + (chips.on.includes(s) ? ' on' : ''), s); c.type = 'button'; c.setAttribute('aria-pressed', String(chips.on.includes(s))); row.appendChild(c) }
      foot.insertBefore(row, foot.firstChild)
      foot.style.display = 'flex'; foot.style.alignItems = 'center'
      mq.mark(row)
    }
    for (const i of markIdx) mq.mark(made[i].querySelector('.sarole') || made[i], !made[i].querySelector('.sarole'), true)
    // the list's height comes from its content; re-place nothing — the app placed the list when it opened
    return { lines: made.length, h: Math.round(list.getBoundingClientRect().height) }
  }, { lines, chips, markIdx })
}

const L142 = [
  { name: 'Ranger\'s leave', day: 'Mon 23 – Fri 27 Nov', what: 'Waiting for approval', who: 'Ranger', unread: true, ago: '4m' },
  { name: 'Access request', day: '', what: 'Waiting for an admin', who: 'Viper', unread: true, ago: '20m' },
  { name: 'Training', day: 'Tue 24 Nov', what: 'Needs an OIL answer', who: 'Ace', ago: '1h' },
]
const L149 = [
  { name: 'Osprey\'s training', day: 'Wed 25 Nov', what: 'Needs an OIL answer', who: 'Osprey', unread: true, ago: '9m', sq: '149' },
  { name: 'Access request', day: '', what: 'Waiting for an admin', who: 'Falcon', unread: true, ago: '35m', sq: '149' },
]
async function p3(sz) {
  // 3a — Saber's bell as it opens: his primary (142) on, 149 off (his D2198)
  {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await openBell(page)
    await bellLines(page, L142, { on: ['142'], all: ['142', '149'] })
    const f = `p3a-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-testid="bell-list"]', '.bellbtn'] : null, 16)
    rec(f, 'p3', sz, 'drawn', 'Saber\'s bell, the master admin. New: "Show 142 149" at the list\'s foot, the filter chip\'s own look; 142 (his own squadron) on, 149 off as it starts. Only 142\'s lines show. The lines are drawn in the bell\'s own line markup (today\'s demo has none for Saber).')
    await ctx.close()
  }
  // 3b — the same after he taps 149: 149's lines among his, each with the grey "149" mark
  {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await openBell(page)
    const all = [L142[0], L149[0], L142[1], L149[1], L142[2]]
    await bellLines(page, all, { on: ['142', '149'], all: ['142', '149'] }, [1, 3])
    const f = `p3b-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-testid="bell-list"]', '.bellbtn'] : null, 16)
    rec(f, 'p3', sz, 'drawn', 'The same bell after Saber taps 149. New: 149\'s lines in among 142\'s, newest first, each with the grey "149" mark after its name — the same grey badge already approved for another squadron\'s line on the schedule. His own squadron\'s lines carry no mark.')
    await ctx.close()
  }
  // 3c — Hunter, who holds Plan of 149: 149's admin lines on by default, his to switch off (his D2202)
  if (sz === 'd') {
    const { ctx, page } = await session(sz, 'ad2', 'a2')
    await openBell(page)
    await bellLines(page, [L149[0], L142[1], L149[1]], { on: ['142', '149'], all: ['142', '149'] }, [0, 2])
    const f = `p3c-${sz}.png`; await shot(page, f, ['[data-testid="bell-list"]', '.bellbtn'], 16)
    rec(f, 'p3', sz, 'drawn', 'Hunter\'s bell, 142\'s admin who holds Plan of 149: the same chips, 149 on as it starts (his to switch off), 149\'s admin lines marked "149".')
    await ctx.close()
  }
}

// the four lines that cross squadrons — to 149's schedulers, about 142's Ranger, borrowed onto 149's RU
const B4 = [
  { name: 'Ranger', sq: '142', day: 'Wed 25 Nov', what: 'Leave approved at 142. He is on your RU', who: 'Hunter', unread: true, ago: '3m' },
  { name: 'Ranger', sq: '142', day: 'Wed 25, Thu 26 Nov', what: 'Posted out of 142. Off your RU on these days', who: 'Hunter', unread: true, ago: '12m' },
  { name: 'Ranger', sq: '142', day: 'Thu 26 Nov', what: 'Taken back by 142. Off your VL', who: 'Hunter', unread: true, ago: '40m' },
  { name: 'RU', sq: '142', day: 'Wed 25 Nov', what: 'Your change was replaced by a later save', who: 'Hunter', unread: true, ago: '1h' },
]
async function p6(sz) {
  const { ctx, page } = await session(sz, 'ad9', 'a9')
  await openBell(page)
  await bellLines(page, B4, null, [0, 1, 2, 3])
  // the whole lines marked too (each line is new), the squadron badge marked inside
  await page.evaluate(() => { const t = window.__mq.mark(document.querySelector('[data-testid="bell-list"]'), true); t.style.top = '3px'; t.style.right = '50%' })
  const f = `p6-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-testid="bell-list"]', '.bellbtn'] : null, 16)
  rec(f, 'p6', sz, 'drawn', 'Kestrel\'s bell (149\'s admin and scheduler), Ranger of 142 borrowed onto 149\'s RU and VL. New: the four lines that cross squadrons, top to bottom — Ranger unavailable at home on a day 149 plans him; Ranger posted out of 142 while 149 still plans him, naming the days; 142 taking Ranger back out of 149\'s plan, naming the day; and Kestrel\'s change to RU replaced by Hunter\'s later save. Each carries the grey "142" mark: it comes from 142.')
  await ctx.close()
}

// ---------- p4: a detachment's own holiday list ----------
async function p4(sz) {
  const { ctx, page } = await session(sz, 'ad9', 'a9')
  await page.evaluate(() => window.go('inputs'))
  await page.waitForTimeout(900)
  await tap(page, '#inGear')
  await tap(page, '[data-testid="iset-days"]')
  if (await page.locator('[data-testid="days-tab-holidays"]').count()) await tap(page, '[data-testid="days-tab-holidays"]')
  await page.waitForSelector('[data-testid="days-part-holidays"]')
  await page.waitForTimeout(700)
  // close the settings window if it is still open behind
  const m = await page.evaluate(() => {
    const mq = window.__mq, hol = [...document.querySelectorAll('[data-testid="days-part-holidays"]')].find(mq.vis)
    hol.scrollIntoView({ block: 'start' })
    // the window's own title names the unit it is open for (the detachment is not built; its name re-lettered here)
    const win = hol.closest('[data-testid="win-days"]')
    const tw = document.createTreeWalker(win, NodeFilter.SHOW_TEXT); let tn, hit = 0
    while ((tn = tw.nextNode())) if (tn.nodeValue.trim() === 'Calendar') { tn.nodeValue = 'Calendar · 249'; hit++; break }
    if (!hit) throw new Error('premise: the window title "Calendar" not found')
    win.setAttribute('data-mqwin', '1')
    for (const s of ['[data-testid="hol-list"]', '[data-testid="hol-nocover"]', '[data-testid="hol-added-note"]', '[data-testid="hol-empty"]']) { const e = hol.querySelector(s); if (e) mq.hide(e) }
    const hint = hol.querySelector('.days-hint')
    const emp = mq.el('p', 'hol-empty', '249 has no holidays of its own yet.')
    const acts = mq.el('div', 'acc-acts'); acts.style.marginTop = '8px'
    const b = mq.el('button', 'abtn', 'Copy 149\'s 2026 list'); b.type = 'button'; acts.appendChild(b)
    const box = mq.el('div', 'mq-copy'); box.appendChild(emp); box.appendChild(acts)
    hint.after(box)
    mq.mark(box)
    hol.setAttribute('data-mqshot', '1')
    return { ok: true }
  })
  const f = `p4-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-mqwin]'] : null, 16)
  rec(f, 'p4', sz, 'drawn', 'Inputs → ⚙ → Calendar…, the Holidays part, opened for the detachment 249 (149\'s, not built yet: the window\'s title re-lettered "Calendar · 249", 149\'s real list hidden). New: while 249\'s own list is empty, one line and "Copy 149\'s 2026 list". The copy is a one-off start: afterwards each list is edited on its own, never kept in step.')
  await ctx.close()
}

// ---------- p5: a sign-in held while the last change on the tab saves ----------
async function p5(sz) {
  const { ctx, page } = await session(sz, null, null, { signIn: false })
  await page.fill('#luser', 'ad9').catch(() => {})
  await page.evaluate(() => {
    const mq = window.__mq, f = document.querySelector('#loginForm'), btn = f.querySelector('button[type=submit]')
    const p = document.querySelector('#lpass'); p.value = 'a9'; p.dispatchEvent(new Event('input', { bubbles: true }))
    document.activeElement && document.activeElement.blur && document.activeElement.blur()
    btn.textContent = 'Signing in…'; btn.disabled = true
    const n = mq.el('p', 'adm-note', 'Waiting for the last change on this page to save.'); n.style.textAlign = 'center'; n.style.margin = '10px 0 0'
    btn.after(n)
    mq.mark(n); mq.mark(btn, false, true)
    f.setAttribute('data-mqshot', '1')
  })
  const f = `p5-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-mqshot]'] : null, 60)
  rec(f, 'p5', sz, 'drawn', 'The sign-in screen on a shared tab: Saber signed out a moment ago and his last change is still saving. Kestrel has pressed Sign in. New: the button reads "Signing in…" and waits, greyed, with one line under it; once the save lands he is signed in by himself. If that save fails, the "Not saved" band already built shows on this screen, with its Retry.')
  await ctx.close()
}

// ---------- p7: Admin → Squadrons, the shared place's time zone ----------
async function p7(sz) {
  const { ctx, page } = await session(sz, 'ad2', 'a2')
  await toUsers(page)
  await page.evaluate(() => {
    const mq = window.__mq, pg = document.querySelector('#page-admin')
    const cats = [...pg.querySelectorAll('button.adm-cat')].filter(mq.vis)
    const users = cats.find(c => /Users/.test(c.textContent))
    if (users) {
      const sq = mq.strip(users.cloneNode(true)); sq.classList.remove('on')
      sq.querySelector('.adm-cat-l').textContent = 'Squadrons'; sq.querySelector('.adm-cat-s').textContent = 'Places and detachments'
      // the picked look moves to Squadrons: the app's own .on class swapped
      sq.className = users.className; users.className = users.className.replace(/\bon\b/, '')
      users.after(sq)
    }
    // the panel: Users' own h3 / sub / row markup, its children hidden, the Squadrons content built from the same classes
    let panel = pg.querySelector('button.acc-main').parentElement
    while (panel && !panel.querySelector('h3')) panel = panel.parentElement
    const kids = [...panel.children]
    const h3 = panel.querySelector('h3'), sub = panel.querySelector('h4.adm-sub'), real = panel.querySelector('.acc-row.od-row')
    const h3c = mq.strip(h3.cloneNode(true)); h3c.textContent = 'Squadrons'
    kids.forEach(k => mq.hide(k))
    const host = h3.parentElement === panel ? null : mq.strip(h3.parentElement.cloneNode(false))
    if (host) { host.removeAttribute('data-mqhid'); host.style.removeProperty('display'); host.appendChild(h3c); panel.appendChild(host) } else panel.appendChild(h3c)
    const sec = mq.strip(real.closest('.acc-list').parentElement.cloneNode(false)); panel.appendChild(sec); sec.style.paddingBottom = '16px'
    const H = t => { const h = mq.strip(sub.cloneNode(true)); h.textContent = t; sec.appendChild(h) }
    H('Places')
    const list = mq.strip(real.closest('.acc-list').cloneNode(false)); sec.appendChild(list)
    const row = mq.el('div', 'acc-row od-row od-row-on')
    const main = mq.el('div', 'acc-main'); main.appendChild(mq.el('span', 'acc-name', 'Home base'))
    main.appendChild(mq.el('span', 'acc-sub', '142 · 149 · GMT+8'))
    row.appendChild(main)
    const ed = mq.el('div', 'acc-edit'), two = mq.el('div', 'adm-2col')
    const f1 = mq.el('div', 'mfield'); f1.appendChild(mq.el('label', '', 'Name')); const i1 = mq.el('input'); i1.value = 'Home base'; f1.appendChild(i1)
    const f2 = mq.el('div', 'mfield'); f2.appendChild(mq.el('label', '', 'Time zone')); const s2 = mq.el('select'); const o = mq.el('option', '', 'Singapore · GMT+8'); s2.appendChild(o); s2.disabled = true; f2.appendChild(s2)
    two.appendChild(f1); two.appendChild(f2); ed.appendChild(two)
    const n = mq.el('p', 'adm-note', 'Only a master admin can change it: 142 and 149 are both here.'); n.style.margin = '6px 0 0'; ed.appendChild(n)
    const acts = mq.el('div', 'acc-acts'); const sv = mq.el('button', 'abtn primary', 'Save'); const cc = mq.el('button', 'abtn', 'Cancel'); acts.appendChild(sv); acts.appendChild(cc); ed.appendChild(acts)
    row.appendChild(ed); list.appendChild(row)
    s2.style.opacity = '.55'; n.style.margin = '6px 0 12px'
    mq.mark(f2, false, true); mq.mark(n)
    window.scrollTo(0, 0)
    panel.setAttribute('data-mqshot', '1')
  })
  await page.waitForTimeout(300)
  const f = `p7-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-mqshot]', '#page-admin button.adm-cat'] : null, 20)
  rec(f, 'p7', sz, 'drawn', 'Admin → Squadrons as Hunter, 142\'s admin — the Squadrons page drawn in round 4, not built yet, made here from Admin → Users\' own parts. Home base is shared by 142 and 149. New: its Time zone greyed for him, one line under it saying why. A place only 142 sits on stays his to set; Saber, the master, sees it ordinary.')
  await ctx.close()
}

// ---------- p8: a posting that could not run ----------
async function p8(sz) {
  const { ctx, page } = await session(sz, 'ad', 'a')
  await toUsers(page)
  await page.evaluate(() => {
    const mq = window.__mq
    const row = [...document.querySelectorAll('#page-admin .acc-row.od-row')].find(r => /^Outlaw/.test(r.querySelector('.acc-name')?.textContent || ''))
    const sub = row.querySelector('.acc-sub')
    const po = mq.el('span', 'od-po', ' · posted out from Fri 20 Nov'); sub.appendChild(po)
    const held = mq.el('span', 'acc-held', 'This posting could not run. It will try again when the app is next opened.')
    row.appendChild(held)
    mq.mark(held, true)
    row.scrollIntoView({ block: 'center' })
    row.setAttribute('data-mqshot', '1')
    const p = row.previousElementSibling, n = row.nextElementSibling; p && p.setAttribute('data-mqshot', '1'); n && n.setAttribute('data-mqshot', '1')
  })
  await page.waitForTimeout(300)
  const f = `p8-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-mqshot]'] : null, 24)
  rec(f, 'p8', sz, 'drawn', 'Admin → Users as Saber. Outlaw\'s posting out was due Fri 20 Nov and the app could not run it for a reason nobody foresaw. New: the line under his row, in the amber the app already uses there for a posting held by the last-admin rule ("…The posting waits until 149 has another admin."). His "posted out from" tag re-lettered for the drawing.')
  await ctx.close()
}

// ---------- p9: the last-admin refusal for a home move dated ahead ----------
async function p9(sz) {
  const { ctx, page } = await session(sz, 'ad', 'a', { toasts: true })
  await page.addStyleTag({ content: '#toastEl { opacity: 1 !important; transition: none !important; }' })
  await toUsers(page); await openRow(page, 'Kestrel')
  // the real refusal: Kestrel is 149's only admin today — demote him and the door says the built words
  await page.selectOption('#accEdRole', 'main')
  await page.click('#accEdSave')
  await page.waitForTimeout(500)
  const said = await page.evaluate(() => document.querySelector('#toastEl')?.textContent || '')
  if (!/last admin/.test(said)) throw new Error('premise: the last-admin refusal did not show — ' + said)
  await page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); document.querySelector('#toastEl').setAttribute('data-mqshot', '1'); document.querySelector('#page-admin .acc-row.od-row-on').setAttribute('data-mqshot', '1') })
  const f0 = `p9-built-${sz}.png`; await shot(page, f0, sz === 'd' ? ['[data-mqshot]'] : null, 24)
  rec(f0, 'p9', sz, 'real', `Real, today: Saber demotes Kestrel, 149's only admin, and the note says the words already built: "${said}"`)
  await page.evaluate(() => {
    const t = document.querySelector('#toastEl')
    t.textContent = 'Kestrel is 149\'s last admin from Fri 27 Nov, when Osprey moves to 142. Make another admin of 149 first.'
    window.__mq.mark(t)
  })
  const f1 = `p9-${sz}.png`; await shot(page, f1, sz === 'd' ? ['[data-mqshot]'] : null, 24)
  rec(f1, 'p9', sz, 'drawn', 'Proposed: Osprey, 149\'s second admin, is already set to move to 142 from Fri 27 Nov; Saber demotes Kestrel today. Today the app refuses with "You are not allowed to do that" (read from the code: no screen saves a home move yet). New: the same note in the built sentence\'s shape, naming the date and the reason.')
  await ctx.close()
}

const PIECES = { p1, p2, p3, p4, p5, p6, p7, p8, p9 }
for (const [k, fn] of Object.entries(PIECES)) {
  if (ONLY && !ONLY.includes(k)) continue
  for (const sz of ['d', 'p']) {
    console.log(k, sz)
    try { await fn(sz) } catch (e) { errs.push(`[${k} ${sz}] ${e && e.message}`); console.log('FAILED', k, sz, e && e.message) }
  }
}
for (const b of Object.values(browsers)) await b.close()
const mf = `${OUT}/manifest.json`
const old = existsSync(mf) ? JSON.parse(readFileSync(mf, 'utf8')) : {}
writeFileSync(mf, JSON.stringify({ ...old, ...manifest }, null, 1))
console.log('errors:', errs.length ? errs.join('\n') : 'none')
