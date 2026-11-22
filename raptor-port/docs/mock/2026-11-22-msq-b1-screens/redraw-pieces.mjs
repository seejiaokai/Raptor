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
const OUT = 'docs/mock/2026-11-22-msq-b1-screens/img'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
mkdirSync(OUT, { recursive: true })
const PINK = '#0e7fa6' // blue: approved earlier (chat 135 redraw)

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
const NEW_CSS = `
.mkq.mkn { outline-color: #ff2d95 !important; }
.mkq-tag.mkn-tag { background: #ff2d95 !important; }
`

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
    const t = document.createElement('span'); t.className = 'mkq-tag'; t.textContent = 'Approved'; t.setAttribute('data-mine', '1')
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
  mq.markNew = (el, inside = false) => { const t = mq.mark(el, inside); el.classList.add('mkn'); t.classList.add('mkn-tag'); t.textContent = 'New'; return t }
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
  await page.addStyleTag({ content: MARK_CSS + NEW_CSS + (toasts ? '' : TOAST_CSS) })
  if (!signIn) return { ctx, page }
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(800)
  await page.addStyleTag({ content: MARK_CSS + NEW_CSS + (toasts ? '' : TOAST_CSS) })
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
    // chat 135: batch 1's approved "Home squadron · …" line (17 Nov, picture 6) above the ladder, in the row's grey-line
    // look — shown, never chosen here. The man's own squadron: 149 for Kestrel's people, else 142
    {
      const home = mq.el('div', 'acc-sub'); home.textContent = 'Home squadron · ' + (window.__mqHome || '142')
      home.style.cssText = 'display:block;width:fit-content;margin:8px 0 0 -6px;padding:3px 6px;white-space:nowrap'
      box.before(home); mq.mark(home, false, true)
    }
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
    // his D2211 (19 Nov 26): what he gets, said plainly, never "as for 149's own admins" (picture 1a to redraw)
    const m = await ladder(page, { picked: 2, note: 'Full access to 149, every page: its schedule and publishing, its settings, its people and their sign-ins.' })
    const f = `p1a-${sz}.png`; await shot(page, f, sz === 'd' ? ['#page-admin .acc-row.od-row-on'] : null, 40)
    rec(f, 'p1', sz, 'drawn', `Saber, the master admin, has opened Hunter's row (an admin of 142) on Admin → Users. New: the "Other squadrons" ladder under Sign-in and Role, Plan 149 picked, its one line saying what Plan means. Every rung is Saber's to set. Measured: ladder ${m.boxW}px wide in a ${m.edW}px editor, ${m.rows} row(s).`)
    await ctx.close()
  }
  // 1b — Kestrel (149's admin) opens Ranger's row (142's member): View 149 his to give; Plan and Master greyed
  {
    const { ctx, page } = await session(sz, 'ad9', 'a9')
    await toUsers(page); await openRow(page, 'Ranger')
    const m = await ladder(page, { picked: 1, off: [2, 3], note: 'Only a master admin gives Plan or makes a master admin.' })
    // reader's finding 1: "nothing else of his row changeable" (D2191) — every other field and button of the row greyed
    // with the app's own disabled look; Save (it saves the ladder only) and Cancel stay live. His row's "142" badge (D2191:
    // "his row there showing 142"), the look-2 grey badge, outline only
    const g = await page.evaluate(() => {
      const mq = window.__mq, row = document.querySelector('#page-admin .acc-row.od-row-on'), ed = row.querySelector('.acc-edit')
      let n = 0
      for (const c of ed.querySelectorAll('input, select, textarea, button')) {
        if (c.closest('.mq-ladder') || c.id === 'accEdSave' || c.id === 'accEdCancel') continue
        c.disabled = true; c.style.opacity = '.42'; n++
      }
      const nm = row.querySelector('.acc-name'), b = mq.badge('142'); nm.appendChild(b); mq.mark(b, false, true)
      return n
    })
    if (g < 4) throw new Error('premise: fewer than 4 of Ranger\'s controls found to grey: ' + g)
    const f = `p1b-${sz}.png`; await shot(page, f, sz === 'd' ? ['#page-admin .acc-row.od-row-on'] : null, 40)
    rec(f, 'p1', sz, 'drawn', `Kestrel, 149's admin, has opened Ranger's row (a member of 142, found by search; his row marked with the grey "142"). New: the ladder with View 149 picked; Plan 149 and Master admin greyed, the line under them saying why; everything else on Ranger's row greyed, since it stays 142's; Save saves the ladder only. Measured: ${m.rows} row(s), ${g} controls greyed.`)
    await ctx.close()
  }
  // 1c — Hunter (142's admin) opens Ranger's row: access to 149 is not his to give
  if (sz === 'd') {
    const { ctx, page } = await session(sz, 'ad2', 'a2')
    await toUsers(page); await openRow(page, 'Ranger')
    await ladder(page, { picked: 0, off: [1, 2, 3], note: 'Only 149\'s admins, an admin with Plan of 149 or a master admin give access to 149.' })
    await page.evaluate(() => { const n = [...document.querySelectorAll('.mq-ladder .adm-note')].pop(); window.__mq.markNew(n) })
    const f = `p1c-${sz}.png`; await shot(page, f, ['#page-admin .acc-row.od-row-on'], 40)
    rec(f, 'p1', sz, 'drawn', 'Hunter, 142\'s own admin, has opened Ranger\'s row. New: the ladder greyed whole, None lit, the line saying who may give access to 149.')
    await ctx.close()
  }
}

// ---------- p2: "PLANS 149" beside the role pill ----------
async function plansPill(page, onOther = false) {
  return page.evaluate((onOther) => {
    const mq = window.__mq
    const row = [...document.querySelectorAll('#page-admin .acc-row.od-row')].find(r => /^Hunter/.test(r.querySelector('.acc-name')?.textContent || ''))
    // a pill beside ADMIN wrapped to two lines and pushed the dot columns (first drawing): the words go at the end of
    // his line under the callsign instead, in its own grey — no width taken from the columns, alike on a phone (which
    // shows no pill)
    const sub = row.querySelector('.acc-sub'), h0 = row.getBoundingClientRect().height
    const p = mq.el('span', '', ' · also plans 149'); sub.appendChild(p)
    mq.mark(p, false, true)
    // the tag hangs below the words (above them it covered "Pilot" on the phone — reader's finding 12)
    const t = document.createElement('span'); t.className = 'mkq-tag'; t.textContent = 'Approved'; t.style.bottom = '-15px'; t.style.right = '-4px'; p.appendChild(t)
    // on 149's list (Kestrel's) Hunter is another squadron's man: his row shows the grey "142" (D2191)
    if (onOther) { const b = mq.badge('142'); row.querySelector('.acc-name').appendChild(b) }
    row.scrollIntoView({ block: 'center' })
    return { grew: Math.round(row.getBoundingClientRect().height - h0) }
  }, onOther)
}
async function p2(sz) {
  for (const [u, pw, who, k] of [['ad', 'a', 'Saber, the master admin (his list is 142\'s)', 'a'], ['ad9', 'a9', 'Kestrel, 149\'s admin (149\'s list)', 'b']]) {
    if (sz === 'p' && k === 'b') continue
    const { ctx, page } = await session(sz, u, pw)
    await toUsers(page)
    await page.evaluate(() => { const r = [...document.querySelectorAll('#page-admin .acc-row.od-row')].find(r => /^Hunter/.test(r.querySelector('.acc-name')?.textContent || '')); r.scrollIntoView({ block: 'center' }) })
    await page.waitForTimeout(300)
    await plansPill(page, k === 'b')
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
      main.appendChild(t)
      const w = mq.el('span', 'bl-what', l.what + (l.who ? ' · ' + l.who : ''))
      // a taken-back line, as the bell draws it (ui/topbits.tsx): what it said struck through, then "taken back · who"
      if (l.struck) { w.insertBefore(document.createTextNode(' · '), w.firstChild); w.insertBefore(mq.el('s', 'bl-struck', l.struck), w.firstChild) }
      if (l.whoSq) w.appendChild(mq.badge(l.whoSq))   // the badge after the person, where the line's subject is our own
      main.appendChild(w)
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
  { name: 'Ranger', sq: '142', day: 'Wed 25 Nov', what: 'On leave, but still on 149\'s RU formation. Replace him.', who: 'Hunter', unread: true, ago: '3m' },
  { name: 'Ranger', sq: '142', day: 'Wed 25, Thu 26 Nov', what: 'Posted out of 142. Taken off 149\'s RU formation. Fill his place.', who: 'Hunter', unread: true, ago: '12m' },
  { name: 'Ranger', sq: '142', day: 'Thu 26 Nov', what: '142 took him off 149\'s VL formation. Fill his place.', who: 'Hunter', unread: true, ago: '40m' },
  // RU is 149's own line: no badge on it (reader's finding 3 — one mark, one meaning); Hunter, who saved over it, is 142's
  { name: 'RU formation', day: 'Wed 25 Nov', what: 'Your change is gone: 142 saved over it. Check and redo it.', who: 'Hunter', whoSq: '142', unread: true, ago: '1h' },
]
async function p6(sz) {
  const { ctx, page } = await session(sz, 'ad9', 'a9')
  await openBell(page)
  await bellLines(page, B4, null, [0, 1, 2, 3])
  // the whole lines marked too (each line is new), the squadron badge marked inside
  // the tag at the list's bottom right, clear of every line's words (at the top inside it covered "Nov" on the phone,
  // and on the top edge the list cut it)
  await page.evaluate(() => { const t = window.__mq.mark(document.querySelector('[data-testid="bell-list"]'), true); t.style.top = 'auto'; t.style.bottom = '6px'; t.style.right = '8px' })
  const f = `p6-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-testid="bell-list"]', '.bellbtn'] : null, 16)
  rec(f, 'p6', sz, 'drawn', 'Kestrel\'s bell (149\'s admin and scheduler), Ranger of 142 borrowed onto 149\'s RU and VL. New: the four lines that cross squadrons, top to bottom — Ranger unavailable at home on a day 149 plans him; Ranger posted out of 142 while 149 still plans him, naming the days; 142 taking Ranger back out of 149\'s plan, naming the day; and Kestrel\'s change to RU replaced by Hunter\'s later save. The grey "142" marks 142\'s people: Ranger on the first three lines, Hunter on the fourth (RU is 149\'s own line). Kestrel\'s top bar still reads "142 TALON": the number there is not yet per squadron in the build.')
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
    // greyed in the app's disabled look (.abtn[disabled] opacity .42 — the sign-in's .go has no disabled rule of its own);
    // the line in the card's own quiet small print (.login .hint's size and grey), not the admin pages' note
    btn.textContent = 'Signing in…'; btn.disabled = true; btn.style.opacity = '.42'; btn.style.cursor = 'default'
    const n = mq.el('p', '', 'Waiting for the last change on this page to save.')
    n.style.cssText = 'text-align:center;margin:10px 0 0;font-size:10.5px;line-height:1.6;color:var(--ink-3)'
    btn.after(n)
    // the tag at the line's top left: at its right it covered "save." on the phone (reader's finding 6)
    const t = mq.mark(n); t.style.right = 'auto'; t.style.left = '-6px'
    mq.mark(btn, false, true)
    f.setAttribute('data-mqshot', '1')
  })
  const f = `p5-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-mqshot]'] : null, 60)
  rec(f, 'p5', sz, 'drawn', 'The sign-in screen on a shared tab: Saber signed out a moment ago and his last change is still saving. Kestrel has pressed Sign in. New: the button reads "Signing in…" and waits, greyed, with one line under it; once the save lands he is signed in by himself. If that save fails, the "Not saved" band already built shows on this screen, with its Retry, and Kestrel stays on this screen until Retry saves it.')
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
      sq.querySelector('.adm-cat-l').textContent = 'Squadrons'; sq.querySelector('.adm-cat-s').textContent = 'Places'
      // the picked look moves to Squadrons: the app's own .on class swapped
      sq.className = users.className; users.className = users.className.replace(/\bon\b/, '')
      // one thing, one icon (D1134): Users' people icon is not reused — a line map pin, drawn in the same svg's own
      // stroke and size (its paths swapped, the svg element kept)
      const sv = sq.querySelector('svg')
      if (sv) sv.innerHTML = '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'
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
    // the panel's own side padding, as its heading has it (the bare clone sat flush on the card's left edge)
    const sec = mq.strip(real.closest('.acc-list').parentElement.cloneNode(false)); panel.appendChild(sec); sec.style.padding = '0 32px 16px'
    const H = t => { const h = mq.strip(sub.cloneNode(true)); h.textContent = t; sec.appendChild(h) }
    H('Places')
    const list = mq.strip(real.closest('.acc-list').cloneNode(false)); sec.appendChild(list)
    const row = mq.el('div', 'acc-row od-row od-row-on')
    const main = mq.el('div', 'acc-main'); main.appendChild(mq.el('span', 'acc-name', 'Home base'))
    main.appendChild(mq.el('span', 'acc-sub', '142 · 149 · Perth · GMT+8'))
    row.appendChild(main)
    const ed = mq.el('div', 'acc-edit'), two = mq.el('div', 'adm-2col')
    const f1 = mq.el('div', 'mfield'); f1.appendChild(mq.el('label', '', 'Name')); const i1 = mq.el('input'); i1.value = 'Home base'; f1.appendChild(i1)
    const f2 = mq.el('div', 'mfield'); f2.appendChild(mq.el('label', '', 'Time zone')); const s2 = mq.el('select'); const o = mq.el('option', '', 'Perth · GMT+8'); s2.appendChild(o); s2.disabled = true; f2.appendChild(s2)
    two.appendChild(f1); two.appendChild(f2); ed.appendChild(two)
    const n = mq.el('p', 'adm-note', 'Only a master admin, or an admin of both 142 and 149, can change the time zone: 142 and 149 are both here.'); n.style.margin = '6px 0 0'; ed.appendChild(n)
    const acts = mq.el('div', 'acc-acts'); const sv = mq.el('button', 'abtn primary', 'Save'); const cc = mq.el('button', 'abtn', 'Cancel'); acts.appendChild(sv); acts.appendChild(cc); ed.appendChild(acts)
    row.appendChild(ed); list.appendChild(row)
    s2.style.opacity = '.55'; n.style.margin = '6px 0 12px'
    // outside outlines again, now that the section has the card's side padding (flush, they were cut off at its edge)
    mq.mark(f2, false, true); mq.markNew(n)
    window.scrollTo(0, 0)
    panel.setAttribute('data-mqshot', '1')
  })
  await page.waitForTimeout(300)
  const f = `p7-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-mqshot]', '#page-admin button.adm-cat'] : null, 20)
  rec(f, 'p7', sz, 'drawn', 'Admin → Squadrons as Hunter, 142\'s admin — the Squadrons page drawn in round 4, not built yet, made here from Admin → Users\' own parts. Home base is shared by 142 and 149. New: its Time zone greyed for him, one line under it saying why. A place only 142 sits on stays his to set; Saber, the master, sees it ordinary. The Squadrons tile\'s map pin is drawn here too, so it does not share Users\' icon.')
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
    // its remedy added (an error says how to put it right), in the words the app already uses for an unreadable week
    const held = mq.el('span', 'acc-held', 'This posting could not run. It will try again when the app is next opened. If this stays, report it with “Report a problem” on the Help page.')
    row.appendChild(held)
    // outside outline: inside, it cut the first letter
    mq.mark(held, false)
    row.scrollIntoView({ block: 'center' })
    row.setAttribute('data-mqshot', '1')
    const p = row.previousElementSibling, n = row.nextElementSibling; p && p.setAttribute('data-mqshot', '1'); n && n.setAttribute('data-mqshot', '1')
  })
  await page.waitForTimeout(300)
  const f = `p8-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-mqshot]'] : null, 24)
  rec(f, 'p8', sz, 'drawn', 'Admin → Users as Saber. Outlaw\'s posting out was due Fri 20 Nov and the app could not run it for a reason nobody foresaw. New: the line under his row, in the amber the app already uses there for a posting held by the last-admin rule ("…The posting waits until 149 has another admin."). His "posted out from" tag re-lettered for the drawing.')
  await ctx.close()
}

// ---------- p10: the bell line when a posting could not run (his D2214, 19 Nov 26) ----------
// Outlaw is 142's, so the line goes to 142's admins only (D2194) and carries no squadron mark; it rings once, the first
// time the posting fails, never on each retry; a tap opens his row on Admin → Users.
async function p10(sz) {
  const { ctx, page } = await session(sz, 'ad', 'a')
  await openBell(page)
  const line = { name: 'Outlaw', day: 'Fri 20 Nov', what: 'Posting out could not run. See his row on Admin → Users.', unread: true, ago: '1m' }
  await bellLines(page, [line, L142[0], L142[1]], null)
  // the line marked with its tag inside at the bottom right, clear of its words
  await page.evaluate(() => { const t = window.__mq.mark(document.querySelector('[data-testid="bell-list"] .bl-line[data-mine]'), true); t.style.top = 'auto'; t.style.bottom = '6px'; t.style.right = '8px' })
  const f = `p10-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-testid="bell-list"]', '.bellbtn'] : null, 16)
  rec(f, 'p10', sz, 'drawn', 'Saber\'s bell (a 142 admin). Outlaw\'s posting out was due Fri 20 Nov and the app could not run it. New: the top line — "Outlaw · Fri 20 Nov / Posting out could not run. See his row on Admin → Users." — rung once, the first time it fails, to 142\'s admins only (Outlaw is 142\'s, so no squadron mark); a tap opens his row, where the amber line of picture 8 says what to do. The two lines under it are today\'s kind, for scale.')
  await ctx.close()
}

// ---------- p11: Fable's look at the bells that concern both squadrons (his D2216), round 1 ----------
// 11a/11b Hunter's bell after he moved 142 → 149, when 142 undoes Jester's posting out of the app: today, and proposed
// 11c Kestrel's bell (149): a borrowed man taken away at home by an input other than leave or medical
// 11d Ranger's bell: his own squadron took him off the other squadron's formation
// 11e/11f a transfer 142 → 149 on its date: 142's admins' line, and 149's in its own words
const B11_149 = [
  { name: 'Osprey\'s training', day: 'Wed 25 Nov', what: 'Needs an OIL answer', who: 'Osprey', ago: '2h' },
]
async function p11(sz) {
  const pics = [
    { f: 'p11a', user: ['ad2', 'a2'], lines: [{ name: 'Jester', day: 'Fri 20 Nov', struck: 'Posted out · archived', what: 'taken back', who: 'Saber', unread: true, ago: '1m' }, ...B11_149], mark: [0],
      cap: 'Today, as the branch does it: Hunter, a 142 admin who read "Jester · Posted out · archived", has since moved to 149. 142 undoes Jester\'s posting out of the app. Hunter\'s bell, now 149\'s, gets the struck line with "taken back · Saber".' },
    { f: 'p11b', user: ['ad2', 'a2'], lines: [...B11_149], mark: [], listMark: true,
      cap: 'Proposed: the day Hunter moved to 149, 142\'s lines left his bell, so the undo tells him nothing. 142\'s own admins get the taken-back line as today.' },
    { f: 'p11c', user: ['ad9', 'a9'], lines: [
      { name: 'Ranger', sq: '142', day: 'Wed 25 Nov', what: 'On DET, but still on 149\'s RU formation. Replace him.', who: 'Hunter', unread: true, ago: '2m' },
      { name: 'Ranger', sq: '142', day: 'Thu 26 Nov', what: 'On a course, but still on 149\'s VL formation. Replace him.', who: 'Hunter', unread: true, ago: '30m' },
    ], mark: [0, 1], cap: 'Kestrel\'s bell (149). Today\'s ruled line covers leave and medical; proposed: the same line for any input at home that takes Ranger away, with that input\'s word: DET, a course, a duty, an overseas duty, OIL.' },
    { f: 'p11d', user: ['us', 'us'], lines: [
      { name: 'VL formation', sq: '149', day: 'Thu 26 Nov', what: '142 took you off it.', who: 'Saber', unread: true, ago: '5m' },
    ], mark: [0], cap: 'Ranger\'s own bell. 142 takes him off 149\'s VL formation; 149\'s schedulers are already told (ruled). Proposed: Ranger is told too, the "149" badge saying whose formation.' },
    { f: 'p11e', user: ['ad', 'a'], lines: [
      { name: 'Ranger', day: 'Fri 3 Apr', what: 'Posted out · now with 149', who: '', unread: true, ago: '1m' },
    ], mark: [], cap: '142\'s admins on the date of a transfer to 149: the line already ruled, unchanged.' },
    { f: 'p11f', user: ['ad9', 'a9'], lines: [
      { name: 'Ranger', sq: '142', day: 'Fri 3 Apr', what: 'Posted in · from 142', who: '', unread: true, ago: '1m' },
    ], mark: [0], cap: 'Proposed: 149\'s admins get it in their own words, "Posted in · from 142", in place of the same "Posted out · now with 149".' },
  ]
  for (const p of pics) {
    if (sz === 'p' && !['p11c', 'p11f'].includes(p.f)) continue
    const { ctx, page } = await session(sz, p.user[0], p.user[1])
    await openBell(page)
    await bellLines(page, p.lines, null)
    await page.evaluate(({ mark, listMark, today }) => {
      const mq = window.__mq, made = [...document.querySelectorAll('[data-testid="bell-list"] .bl-line[data-mine]')]
      for (const i of mark) { const t = mq.mark(made[i], true); t.style.top = 'auto'; t.style.bottom = '6px'; t.style.right = '8px'; if (today) t.textContent = 'Today' }
      if (listMark) { const t = mq.mark(document.querySelector('[data-testid="bell-list"]'), true); t.textContent = 'Proposed'; t.style.top = 'auto'; t.style.bottom = '6px'; t.style.right = '8px' }
    }, { mark: p.mark, listMark: !!p.listMark, today: p.f === 'p11a' })
    const f = `${p.f}-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-testid="bell-list"]', '.bellbtn'] : null, 16)
    rec(f, 'p11', sz, 'drawn', p.cap)
    await ctx.close()
  }
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
    // the example's premise: Osprey is 149's second admin (in the demo he is a member) — his row's role pill re-lettered
    const o = [...document.querySelectorAll('#page-admin .acc-row.od-row')].find(r => /^Osprey/.test(r.querySelector('.acc-name')?.textContent || ''))
    if (o) {
      const u = o.querySelector('.od-rc .ub'); if (u) { u.className = u.className.replace(/\bmain\b/, 'admin'); u.textContent = 'ADMIN' }
      // on a phone the role is the word in his line under the name, not the pill
      const tw = document.createTreeWalker(o.querySelector('.acc-sub'), NodeFilter.SHOW_TEXT); let tn
      while ((tn = tw.nextNode())) if (/Member/.test(tn.nodeValue)) tn.nodeValue = tn.nodeValue.replace('Member', 'Admin')
    }
  })
  const f1 = `p9-${sz}.png`; await shot(page, f1, sz === 'd' ? ['[data-mqshot]'] : null, 24)
  rec(f1, 'p9', sz, 'drawn', 'Proposed: Osprey, 149\'s second admin, is already set to move to 142 from Fri 27 Nov; Saber demotes Kestrel today. Today the app refuses with "You are not allowed to do that" (read from the code: no screen saves a home move yet). New: the same note in the built sentence\'s shape, naming the date and the reason.')
  await ctx.close()
}

// p12 — chat 115's two questions (fix read 6): who is told when an input someone filed for another man is changed.
//   q1 · Ranger (142 member, never moved) filed a Training for Ace; Saber changes its remark → Ranger's bell (as built: told)
//   q2 · Hunter (142 admin, never moved) filed LL 23–27 Nov for Ranger; Ranger moves to 149 from 25 Nov; Saber changes
//        the remark → Hunter's bell: as built nothing; recommended: told, for the days that are 142's (the line marked New)
async function p12(sz) {
  {
    const { ctx, page } = await session(sz, 'us', 'us')
    await openBell(page)
    await bellLines(page, [{ name: 'Training', day: 'Tue 24 Nov', what: 'Remark changed', who: 'Saber', unread: true, ago: '2m' }], null)
    const f = `p12a-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-testid="bell-list"]', '.bellbtn'] : null, 16)
    rec(f, 'p12', sz, 'as built', 'Question 1 — Ranger\'s bell (142 member, never moved). He filed a Training for Ace; Saber changed its remark. As built and recommended: Ranger is told, as here. Nothing new is drawn.')
    await ctx.close()
  }
  {
    const { ctx, page } = await session(sz, 'ad2', 'a2')
    await openBell(page)
    await bellLines(page, [{ name: 'LL', day: 'Mon 23 Nov', what: 'Remark changed', who: 'Saber', unread: true, ago: '2m' }], null, [0])
    const f = `p12b-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-testid="bell-list"]', '.bellbtn'] : null, 16)
    rec(f, 'p12', sz, 'drawn', 'Question 2 — Hunter\'s bell (142 admin, never moved). He filed Ranger\'s leave, 23–27 Nov; Ranger moved to 149 from 25 Nov; Saber changed its remark. As built Hunter\'s bell shows nothing. Recommended (marked New): he is told, as he would be had Ranger not moved, because 23 and 24 Nov are still 142\'s days.')
    await ctx.close()
  }
}

// ======================= chat 135 (22 Nov 26): the new pieces since 19 Nov, for batch 1's second half =======================
// n1 — Admin → Users one squadron at a time with a filter row (his D2270): Pilots · WSOs · Personnel · All (Quals' own
//      .segview), CAT and Role (the editor's own select); filters only hide rows, A to Z kept (D322).
// n3 — the bell line telling a person his account's status changed (his D2251), the posting line's shape.
const SQ149 = ['Kestrel', 'Osprey', 'Merlin', 'Harrier', 'Condor', 'Falcon', 'Heron', 'Raven', 'Shrike', 'Gannet']
async function grabSelect(page) {
  // the editor's own select (Role), cloned before its row is closed again
  await page.locator('#page-admin button.acc-main', { hasText: /^Hex/ }).first().click()
  await page.waitForSelector('#page-admin .acc-edit select')
  await page.evaluate(() => { window.__mqSel = document.querySelector('#page-admin .acc-edit select').cloneNode(true) })
  await page.click('#accEdCancel'); await page.waitForTimeout(350)
  await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement && document.activeElement.blur && document.activeElement.blur() })
}
async function filterRow(page, { seat = 'All', cat = 'All CATs', role = 'All roles', squad = null, keep = null, group = false }) {
  return page.evaluate(({ seat, cat, role, squad, keep, group, SQ149 }) => {
    const mq = window.__mq, head = document.querySelector('#page-admin .od-head'), list = document.querySelector('#accList')
    const rows = [...list.querySelectorAll(':scope > .acc-row')]
    const is149 = r => SQ149.includes((r.querySelector('.acc-name')?.textContent || '').trim())
    // the page's squadron: 142's people only (the list today shows both — the fault the build closes)
    if (!group) for (const r of rows) if (is149(r)) mq.hide(r)
    const box = mq.el('div', 'mq-filt'); box.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:4px 0 12px'
    const seg = (words, on) => { const g = mq.el('div', 'segview'); g.setAttribute('role', 'group'); for (const w of words) { const b = mq.el('button', w === on ? 'on' : '', w); b.type = 'button'; b.setAttribute('aria-pressed', String(w === on)); g.appendChild(b) } return g }
    if (squad) box.appendChild(seg(['142', 'All squadrons'], squad))
    box.appendChild(seg(['Pilots', 'WSOs', 'Personnel', 'All'], seat))
    // CAT and Role: one button each in the switch's own look, reading what is picked and "▾" (a tap opens its short list);
    // lit when a filter is set, so a hidden row is never a mystery
    const pickBtn = (word, set) => { const g = mq.el('div', 'segview'); const b = mq.el('button', set ? 'on' : '', word + ' ▾'); b.type = 'button'; g.appendChild(b); return g }
    box.appendChild(pickBtn(cat, cat !== 'All CATs'))
    box.appendChild(pickBtn(role, role !== 'All roles'))
    if (squad) { const k = document.querySelector('.topbar .mark .k'); if (k && mq.vis(k)) { const k2 = mq.strip(k.cloneNode(true)); k2.textContent = '142 ▾'; mq.hide(k); k.after(k2) } }
    head.after(box)
    let shown = rows.filter(r => r.style.display !== 'none')
    if (keep) for (const r of shown) {
      const sub = r.querySelector('.acc-sub')?.textContent || '', chip = r.querySelector('.od-rc')?.textContent || ''
      if (!keep(sub, chip)) mq.hide(r)
    }
    if (group) {
      // "All squadrons": one heading a squadron, each group A to Z; the 149 rows cloned into their own group, the originals hidden
      const h = head.querySelector('h4.adm-sub')
      const h142 = mq.strip(h.cloneNode(true)); h142.textContent = '142 · 61'; h142.style.margin = '6px 0 4px'
      list.before(h142)
      const l2 = mq.strip(list.cloneNode(false)), h149 = mq.strip(h.cloneNode(true)); h149.textContent = '149 · 10'; h149.style.margin = '14px 0 4px'
      list.after(h149); h149.after(l2)
      for (const r of rows) if (is149(r)) { const c = mq.strip(r.cloneNode(true)); const n = c.querySelector('.acc-name'); l2.appendChild(c); mq.hide(r); if (n) n.appendChild(mq.badge('149')) }
      h.textContent = 'People · 71'
    } else head.querySelector('h4.adm-sub').textContent = 'People · 61'
    mq.markNew(box)
    shown = [...document.querySelectorAll('#page-admin .acc-row')].filter(r => r.style.display !== 'none' && mq.vis(r))
    window.scrollTo(0, 0)
    return { shown: shown.length, rowsW: Math.round(box.getBoundingClientRect().width), h: Math.round(box.getBoundingClientRect().height) }
  }, { seat, cat, role, squad, keep: keep ? keep.toString() : null, group, SQ149 })
}
async function n1(sz) {
  // n1a — Hunter (142's admin): 142's people, the filter row as it opens
  {
    const { ctx, page } = await session(sz, 'ad2', 'a2')
    await toUsers(page); await grabSelect(page)
    const m = await filterRow(page, {})
    const f = `n1a-${sz}.png`; await shot(page, f, sz === 'd' ? ['#page-admin .od-head', '#page-admin .mq-filt', '#accList > .acc-row:nth-child(-n+5)'] : null, 24)
    rec(f, 'n1', sz, 'drawn', `Admin → Users as Hunter, 142's admin: 142's people only. New: the filter row under the search — Pilots · WSOs · Personnel · All (Quals' own switch), then CAT and Role. The list stays A to Z. Measured: the row ${m.h}px high.`)
    await ctx.close()
  }
  // n1b — the same, Pilots and Role "Admin" picked: only 142's pilot admins show, still A to Z
  {
    const { ctx, page } = await session(sz, 'ad2', 'a2')
    await toUsers(page); await grabSelect(page)
    await page.evaluate(() => { window.__keep = (sub, chip) => /Pilot/.test(sub) && /admin/i.test(chip) })
    const m = await page.evaluate(() => 0)
    await filterRow(page, { seat: 'Pilots', role: 'Admin' })
    const n = await page.evaluate(() => { let k = 0; for (const r of document.querySelectorAll('#accList > .acc-row')) { if (r.style.display === 'none') continue; // Saber is the demo's master admin: the roles are one each, so "Admin" leaves him out ("Master admin" shows him)
      if (/^Saber/.test(r.querySelector('.acc-name')?.textContent || '') || !(window.__keep(r.querySelector('.acc-sub')?.textContent || '', r.querySelector('.od-rc')?.textContent || ''))) { window.__mq.hide(r) } else k++ } return k })
    const f = `n1b-${sz}.png`; await shot(page, f, sz === 'd' ? ['#page-admin .od-head', '#page-admin .mq-filt', '#accList'] : null, 24)
    rec(f, 'n1', sz, 'drawn', `The same list with Pilots and Role "Admin" picked: only 142's pilots who are admins show (${n} here), still A to Z. A filter only hides rows; it never reorders them.`)
    await ctx.close()
  }
  // n1c — Saber, the master admin: "142 · All squadrons" first in the row, All squadrons picked, the people grouped by squadron
  {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await toUsers(page); await grabSelect(page)
    await filterRow(page, { squad: 'All squadrons', group: true })
    await page.evaluate(() => { const h = [...document.querySelectorAll('#page-admin h4.adm-sub')].find(x => /^149 ·/.test(x.textContent)); h.scrollIntoView({ block: 'center' }) })
    await page.waitForTimeout(250)
    const f = `n1c-${sz}.png`; if (sz === 'd') await page.evaluate(() => { const h = [...document.querySelectorAll('#page-admin h4.adm-sub')].find(x => /^149 ·/.test(x.textContent)); h.setAttribute('data-mqshot', '1'); h.nextElementSibling.setAttribute('data-mqshot', '1'); const l = document.querySelector('#accList'); const rs = [...l.children].filter(r => r.style.display !== 'none'); rs.slice(-2).forEach(r => r.setAttribute('data-mqshot', '1')) }); await shot(page, f, sz === 'd' ? ['[data-mqshot]'] : null, 24)
    // a second frame from the top, so the row and the 142 heading show too
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
    const f0 = `n1c0-${sz}.png`; await shot(page, f0, sz === 'd' ? ['#page-admin .od-head', '#page-admin .mq-filt', '#accList > .acc-row:nth-child(-n+3)'] : null, 24)
    rec(f0, 'n1', sz, 'drawn', 'Admin → Users as Saber, the master admin. New: his row starts "142 · All squadrons" (142 is the squadron picked in his Schedules menu); All squadrons picked, the people grouped under each squadron, each group A to Z.')
    rec(f, 'n1', sz, 'drawn', 'The same list further down: the 149 group under its own heading, each of its people marked with the grey "149".')
    await ctx.close()
  }
}
// nf — his D2297 (22 Nov 26): one filter button beside the search; a tap opens tick boxes in groups (Seat, CAT, Role,
// and for a master admin Squadron); any tick of a group, groups combined; the button lit with its count; a line over the
// list "Showing N of 61 · Clear". The tick boxes in the app's own filter-chip look (.fchip / .on), the panel over the list.
async function filterBtn(page, { ticks = {}, open = false, master = false }) {
  return page.evaluate(({ ticks, open, master, SQ149 }) => {
    const mq = window.__mq, head = document.querySelector('#page-admin .od-head'), list = document.querySelector('#accList')
    const find = head.querySelector('.od-find'), phone = innerWidth < 600
    const rows = [...list.querySelectorAll(':scope > .acc-row')]
    const nm = r => (r.querySelector('.acc-name')?.textContent || '').trim()
    const is149 = r => SQ149.includes(nm(r))
    const both = master && (ticks.Squadron || []).length === 2
    if (!both) for (const r of rows) if (is149(r)) mq.hide(r)
    const n = Object.entries(ticks).filter(([k, v]) => v.length && !(k === 'Squadron' && v.length === 2)).reduce((a, [, v]) => a + v.length, 0) + (both ? 1 : 0)
    // the button: the app's own .abtn, a line funnel in the search box's glyph stroke, lit (.primary) when a filter is set
    const b = mq.el('button', 'abtn' + (n ? ' primary' : '')); b.type = 'button'
    b.innerHTML = '<svg class="btnglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:-3px;margin-right:6px"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg>'
    b.appendChild(document.createTextNode(n ? 'Filter · ' + n : 'Filter')); b.setAttribute('data-mine', '1')
    b.style.whiteSpace = 'nowrap'; b.style.flex = '0 0 auto'; b.style.display = 'inline-flex'; b.style.alignItems = 'center'
    b.querySelector('svg').style.verticalAlign = '0'
    const wrapF = mq.el('div'); wrapF.style.cssText = 'display:flex;gap:8px;align-items:center;position:relative;' + (phone ? 'width:100%' : '')
    find.before(wrapF); wrapF.appendChild(find); wrapF.appendChild(b); if (phone) find.style.flex = '1 1 auto'
    head.querySelector('h4.adm-sub').textContent = both ? 'People · 71' : 'People · 61'
    // the rows a tick set keeps (a group's ticks: any; groups: all); Saber is the demo's master admin, his own role
    const seatOf = r => { const s = r.querySelector('.acc-sub')?.textContent || ''; return /Personnel/.test(s) ? 'Personnel' : /WSO/.test(s) ? 'WSOs' : 'Pilots' }
    const roleOf = r => nm(r) === 'Saber' ? 'Master admin' : /admin/i.test(r.querySelector('.od-rc')?.textContent || '') ? 'Admin' : 'Member'
    const catOf = r => ((r.querySelector('.acc-sub')?.textContent || '').match(/CAT (\w+)/) || [])[1] || ''
    let shown = 0
    for (const r of rows) {
      if (r.style.display === 'none') continue
      const ok = (!ticks.Seat?.length || ticks.Seat.includes(seatOf(r))) && (!ticks.Role?.length || ticks.Role.includes(roleOf(r))) && (!ticks.CAT?.length || ticks.CAT.includes(catOf(r)))
      if (!ok) mq.hide(r); else shown++
    }
    if (both) {
      const h = head.querySelector('h4.adm-sub')
      const h142 = mq.strip(h.cloneNode(true)); h142.textContent = '142 · 61'; h142.style.margin = '6px 0 4px'; list.before(h142)
      const l2 = mq.strip(list.cloneNode(false)), h149 = mq.strip(h.cloneNode(true)); h149.textContent = '149 · 10'; h149.style.margin = '14px 0 4px'
      list.after(h149); h149.after(l2)
      for (const r of rows) if (is149(r) && r.style.display === 'none') { const c = mq.strip(r.cloneNode(true)); c.style.removeProperty('display'); c.removeAttribute('data-mqhid'); l2.appendChild(c); const cn = c.querySelector('.acc-name'); if (cn) cn.appendChild(mq.badge('149')) }
    }
    let line = null
    if (n) {
      line = mq.el('p', 'adm-note'); line.style.margin = '2px 0 8px'
      line.appendChild(document.createTextNode(both ? 'Showing both squadrons, grouped · ' : `Showing ${shown} of 61 · `))
      const c = mq.el('a', '', 'Clear'); c.href = '#'; c.style.color = 'var(--accent, #3cc0e6)'; line.appendChild(c)
      head.after(line)
    }
    let panel = null
    if (open) {
      panel = mq.el('div', 'mq-fpanel')
      panel.style.cssText = `position:absolute;top:calc(100% + 6px);right:0;z-index:50;${phone ? 'left:0;' : 'width:380px;'}background:var(--card, #1b2129);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:12px 14px;display:grid;gap:10px;box-shadow:0 12px 32px rgba(0,0,0,.45)`
      const groups = [['Seat', ['Pilots', 'WSOs', 'Personnel']], ['CAT', ['IP', 'IW', 'A', 'B', 'C', 'OCU']], ['Role', ['Member', 'Admin', 'Admin + Plan of 149', 'Master admin']]]
      if (master) groups.push(['Squadron', ['142', '149']])
      for (const [g, opts] of groups) {
        const box = mq.el('div'); box.style.cssText = 'display:grid;gap:6px'
        box.appendChild(mq.el('span', 'mfield-lbl', g))
        const r = mq.el('div'); r.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px'
        for (const o of opts) { const on = (ticks[g] || []).includes(o); const c = mq.el('button', 'fchip' + (on ? ' on' : ''), (on ? '✓ ' : '') + o); c.type = 'button'; c.setAttribute('aria-pressed', String(on)); r.appendChild(c) }
        box.appendChild(r); panel.appendChild(box)
      }
      const ft = mq.el('div'); ft.style.cssText = 'display:flex;justify-content:flex-end'
      const cl = mq.el('button', 'abtn', 'Clear all'); cl.type = 'button'; ft.appendChild(cl); panel.appendChild(ft)
      wrapF.appendChild(panel)
    }
    mq.markNew(b)
    if (panel) mq.markNew(panel, true)
    if (line) mq.markNew(line)
    window.scrollTo(0, 0)
    return { n, shown }
  }, { ticks, open, master, SQ149 })
}
async function nf(sz) {
  const frame = sz === 'd' ? ['#page-admin .od-head', '#page-admin .mq-fpanel', '#page-admin .adm-note', '#accList > .acc-row:not([data-mqhid])'] : null
  // nfa — Hunter, 142's admin: the button beside the search, nothing filtered
  {
    const { ctx, page } = await session(sz, 'ad2', 'a2')
    await toUsers(page)
    await filterBtn(page, {})
    const f = `nfa-${sz}.png`; await shot(page, f, sz === 'd' ? ['#page-admin .od-head', '#accList > .acc-row:nth-child(-n+3)'] : null, 24)
    rec(f, 'nf', sz, 'drawn', 'Admin → Users as Hunter, 142\'s admin: 142\'s 61 people. New: one "Filter" button beside the search, nothing filtered.')
    await ctx.close()
  }
  // nfb — the same, the panel open, Pilots and Admin ticked: the button lit "Filter · 2", the line over the list
  {
    const { ctx, page } = await session(sz, 'ad2', 'a2')
    await toUsers(page)
    const m = await filterBtn(page, { ticks: { Seat: ['Pilots'], Role: ['Admin'] }, open: true })
    const f = `nfb-${sz}.png`; await shot(page, f, frame, 24)
    rec(f, 'nf', sz, 'drawn', `The panel open: Seat, CAT and Role, each a row of tick chips. Pilots and Admin ticked, so the button reads "Filter · 2" in blue and the line over the list "Showing ${m.shown} of 61 · Clear". Several ticks in one group mean any of them; groups combine.`)
    await ctx.close()
  }
  // nfd — the panel closed again with the same two ticks: the lit button, the line, the rows it keeps
  {
    const { ctx, page } = await session(sz, 'ad2', 'a2')
    await toUsers(page)
    const m = await filterBtn(page, { ticks: { Seat: ['Pilots'], Role: ['Admin'] } })
    const f = `nfd-${sz}.png`; await shot(page, f, frame, 24)
    rec(f, 'nf', sz, 'drawn', `The panel closed with Pilots and Admin still ticked: "Filter · 2" stays blue, and the line "Showing ${m.shown} of 61 · Clear" sits over the list, so a short list never looks like missing people. "Clear" takes every tick off.`)
    await ctx.close()
  }
  // nfc — Saber, the master admin: a fourth group, Squadron; 142 and 149 both ticked, the people grouped under each
  {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await toUsers(page)
    await filterBtn(page, { ticks: { Squadron: ['142', '149'] }, open: true, master: true })
    await page.evaluate(() => { const k = document.querySelector('.topbar .mark .k'); if (k && window.__mq.vis(k)) { const k2 = window.__mq.strip(k.cloneNode(true)); k2.textContent = '142 ▾'; window.__mq.hide(k); k.after(k2) } })
    const f = `nfc-${sz}.png`; await shot(page, f, frame, 24)
    rec(f, 'nf', sz, 'drawn', 'As Saber, the master admin: the panel has a fourth group, Squadron. 142 and 149 both ticked: everyone, grouped under each squadron (the 149 group further down, its people marked "149").')
    await ctx.close()
  }
}
async function n3(sz) {
  const { ctx, page } = await session(sz, 'ad2', 'a2')
  await openBell(page)
  const lines = [
    { name: 'Hunter', day: 'Sun 22 Nov', what: 'Given Plan of 149: full access to 149', who: 'Saber', unread: true, ago: '1m' },
    { name: 'Hunter', day: 'Fri 20 Nov', what: 'Made an admin of 142', who: 'Saber', ago: '2d' },
    L142[0],
  ]
  await bellLines(page, lines, null)
  await page.evaluate(() => { const ls = [...document.querySelectorAll('[data-testid="bell-list"] .bl-line[data-mine]')].slice(0, 2); for (const l of ls) { const t = window.__mq.markNew(l, true); t.style.top = 'auto'; t.style.bottom = '6px'; t.style.right = '8px' } })
  const f = `n3-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-testid="bell-list"]', '.bellbtn'] : null, 16)
  rec(f, 'n3', sz, 'drawn', 'Hunter\'s own bell. New: a line whenever his account changes — here Plan of 149 given, and earlier made an admin of 142 — each naming who did it. A tap opens nothing: his own row on Admin → Users is never his to open. The third line is today\'s kind, for scale.')
  await ctx.close()
}

const PIECES = { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, n1, n3, nf }
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
