// Admin → Users, a person's opened row — three redesigns of the access part (his /impeccable ask of 22 Nov 26, "is
// there a way to design this nicer and more concise"), drawn on the REAL running app by
// .claude/skills/brainstorming/mockups-on-the-real-app.md. Nothing of the app changes: each picture is the real row
// opened through the app's own controls, then ONE transform built from the app's own classes (the editor's field
// labels `.mfield label`, its buttons `.abtn` / `.abtn.primary`, its grey note `.adm-note`, its grey line `.acc-sub`,
// the grey squadron badge already approved for Ranger's row), every new part marked pink "New".
//   today · measured only (the approved ladder of p1, redrawn the way redraw-pieces.mjs draws it) — pictures p1a/p1b/p1c
//   A · trim in place: the four-button ladder and its words kept; "Home squadron · 142" becomes the grey badge by his name
//   B · master admin moves into Role; one line per squadron — "142 Home squadron", "149 None · View · Plan" (recommended)
//   C · all as form fields: Role gains Master admin; "Home squadron" and "149" become boxes beside Sign-in and Role
// Cases: 1 Saber (master admin) opens Hunter (142's admin), Plan 149 picked · 2 Kestrel (149's admin) opens Ranger
// (142's member), View 149 picked, only View his to give · B3 Saber has picked Master admin for Hunter ·
// B4 Hunter (142's admin) opens Ranger: nothing of 149 his to give.
//
// Run from raptor-port/ against a served build:  MQ_URL=http://localhost:4601/ node docs/mock/2026-11-22-msq-b1-screens/draw-row.mjs
// MQ_ONLY=A,B draws only those. Pictures: docs/mock/2026-11-22-msq-b1-screens/img/r<option><n>-<d|p>.png. Demo data only.
import { chromium, webkit } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const URL_ = process.env.MQ_URL || 'http://localhost:4601/'
const OUT = 'docs/mock/2026-11-22-msq-b1-screens/img'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
mkdirSync(OUT, { recursive: true })
const NEW = '#ff2d95'
const PLAN_LINE = 'Full access to 149, every page: its schedule and publishing, its settings, its people and their sign-ins.' // D2211
const SIZES = {
  d: { name: 'desktop 1536', engine: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'iPhone 402 (WebKit)', engine: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const CSS = `
.mkq { outline: 2px solid ${NEW} !important; outline-offset: 2px !important; }
.mkq-tag { position: absolute; z-index: 600; background: ${NEW}; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; top: -9px; right: -6px; }
#toastEl { display: none !important; }
/* B: one line per squadron — the squadron's number in the field labels' look, then what he has of it */
#page-admin .mqb-sq { display: grid; grid-template-columns: 34px 1fr; column-gap: 10px; row-gap: 8px; align-items: center; margin: 12px 0 12px; }
#page-admin .mqb-sq > label { margin: 0; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); font-weight: 600; }
#page-admin .mqb-sq .mqb-home { font-size: 12px; color: var(--ink-2); }
#page-admin .mqb-sq .acc-acts { margin: 0; flex-wrap: nowrap; }
#page-admin .mqb-sq .adm-note { grid-column: 2; margin: -2px 0 0; }
`

function kit() {
  const mq = {}
  mq.el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; e.setAttribute('data-mine', '1'); return e }
  // the mark: an outline on the element and a "New" tag as its own child; asserts the element's box did not move
  mq.mark = (el, tag = true) => {
    const b = el.getBoundingClientRect()
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.classList.add('mkq')
    if (tag) { const t = mq.el('span', 'mkq-tag', 'New'); el.appendChild(t) }
    const a = el.getBoundingClientRect()
    if (!['x', 'y', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) < 0.6)) throw new Error('mark moved its element')
  }
  // the approved grey squadron badge (redraw-pieces.mjs mq.badge, the role chip's look)
  mq.badge = txt => {
    const c = mq.el('span', 'sarole ro', txt)
    c.style.background = 'rgba(255,255,255,.08)'; c.style.borderColor = 'rgba(255,255,255,.22)'; c.style.color = 'var(--ink-2)'
    c.style.verticalAlign = '1px'; c.style.marginLeft = '6px'; c.style.fontStyle = 'normal'
    return c
  }
  // the segmented choice: the app's .acc-acts.acc-mode of .abtn, the picked one .primary, greyed ones disabled
  mq.seg = (words, picked, off = []) => {
    const g = mq.el('div', 'acc-acts acc-mode'); g.setAttribute('role', 'group')
    words.forEach((t, i) => { const b = mq.el('button', 'abtn' + (i === picked ? ' primary' : ''), t); b.type = 'button'; if (off.includes(i)) b.disabled = true; g.appendChild(b) })
    return g
  }
  // "nothing else of his row changeable" (D2191): grey every other control of the row, Save and Cancel live
  mq.greyRest = keepSel => {
    const ed = document.querySelector('#page-admin .acc-edit'); let n = 0
    for (const c of ed.querySelectorAll('input, select, textarea, button')) {
      if ((keepSel && c.closest(keepSel)) || c.id === 'accEdSave' || c.id === 'accEdCancel') continue
      c.disabled = true; c.style.opacity = '.42'; n++
    }
    return n
  }
  mq.roleMaster = (pick = false) => {
    const s = document.querySelector('#accEdRole'), o = mq.el('option', null, 'Master admin — every squadron'); o.value = 'mq-master'
    s.appendChild(o); if (pick) s.value = 'mq-master'
    return s
  }
  mq.editH = () => Math.round(document.querySelector('#page-admin .acc-edit').getBoundingClientRect().height)
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
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`); console.log('PAGEERROR', String(e)) })
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
  await page.evaluate(() => { document.querySelector('#page-admin .acc-edit').closest('.acc-row').scrollIntoView({ block: 'center' }) })
  await page.waitForTimeout(400)
}
async function shot(page, sz, file) {
  await page.mouse.move(1, 1).catch(() => {})
  // a neutral tap target: the page's own title area, so no control the drawn flow touches keeps a focus ring
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur())
  await page.waitForTimeout(150)
  let clip
  if (sz === 'd') {
    const r = await page.evaluate(() => { const b = document.querySelector('#page-admin .acc-row.od-row-on').getBoundingClientRect(); return { L: b.left, T: b.top, R: b.right, B: b.bottom } })
    clip = { x: r.L - 40, y: r.T - 40, width: r.R - r.L + 80, height: r.B - r.T + 80 }
  }
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}) })
  console.log('  wrote', file)
}
const fig = {}
const note = (k, v) => { fig[k] = v }

// ---------- today, measured: the approved ladder as redraw-pieces.mjs p1 draws it ----------
async function today(sz, who, open, picked, off, line) {
  const { ctx, page } = await session(sz, ...who)
  await toUsers(page); await openRow(page, open)
  const h = await page.evaluate(({ picked, off, line }) => {
    const mq = window.__mq, ed = document.querySelector('#page-admin .acc-edit'), two = ed.querySelector('.adm-2col')
    const box = mq.el('div'); box.style.margin = '10px 0 12px'
    const l = mq.el('div', 'mfield'); l.appendChild(mq.el('span', 'mfield-lbl', 'Other squadrons')); box.appendChild(l)
    box.appendChild(mq.seg(['None', 'View 149', 'Plan 149', 'Master admin'], picked, off))
    const n = mq.el('p', 'adm-note', line); n.style.margin = '6px 0 0'; box.appendChild(n)
    two.after(box)
    const home = mq.el('div', 'acc-sub', 'Home squadron · 142'); home.style.cssText = 'display:block;width:fit-content;margin:8px 0 0 -6px;padding:3px 6px;white-space:nowrap'
    box.before(home)
    return mq.editH()
  }, { picked, off, line })
  await ctx.close()
  return h
}

// ---------- A: trim in place ----------
async function A(sz) {
  for (const c of [
    { n: 1, who: ['ad', 'a'], open: 'Hunter', picked: 2, off: [], line: PLAN_LINE },
    { n: 2, who: ['ad9', 'a9'], open: 'Ranger', picked: 1, off: [2, 3], line: 'Only a master admin gives Plan or makes a master admin.' },
  ]) {
    const was = await today(sz, c.who, c.open, c.picked, c.off, c.line)
    const { ctx, page } = await session(sz, ...c.who)
    await toUsers(page); await openRow(page, c.open)
    const m = await page.evaluate(({ c, PLAN_LINE }) => {
      const mq = window.__mq, row = document.querySelector('#page-admin .acc-row.od-row-on'), ed = row.querySelector('.acc-edit'), two = ed.querySelector('.adm-2col')
      const box = mq.el('div', 'mqa-ladder'); box.style.margin = '10px 0 12px'
      const l = mq.el('div', 'mfield'); l.appendChild(mq.el('span', 'mfield-lbl', 'Other squadrons')); box.appendChild(l)
      box.appendChild(mq.seg(['None', 'View 149', 'Plan 149', 'Master admin'], c.picked, c.off))
      const n = mq.el('p', 'adm-note', c.line); n.style.margin = '6px 0 0'; box.appendChild(n)
      two.after(box)
      // his home squadron: the grey badge by his name (the look already approved for Ranger's row on 149's list)
      const nm = row.querySelector('.acc-name'), b = mq.badge('142'); nm.appendChild(b)
      if (c.n === 1) mq.mark(b, false); else mq.greyRest('.mqa-ladder')
      return { h: mq.editH(), rows: box.querySelector('.acc-acts').getBoundingClientRect().height > 50 ? 2 : 1 }
    }, { c, PLAN_LINE })
    note(`A${c.n}-${sz}`, `${was}px → ${m.h}px, buttons on ${m.rows} row(s)`)
    await shot(page, sz, `rA${c.n}-${sz}.png`); await ctx.close()
  }
}

// ---------- B: master admin in Role; one line per squadron ----------
async function bLines(page, c) {
  return page.evaluate(({ c }) => {
    const mq = window.__mq, row = document.querySelector('#page-admin .acc-row.od-row-on'), ed = row.querySelector('.acc-edit'), two = ed.querySelector('.adm-2col')
    const grid = mq.el('div', 'mqb-sq')
    const lab = t => { const l = mq.el('label', null, t); return l }
    grid.appendChild(lab('142')); grid.appendChild(mq.el('div', 'mqb-home', 'Home squadron'))
    grid.appendChild(lab('149'))
    if (c.master) grid.appendChild(mq.el('div', 'mqb-home', 'Full access'))
    else grid.appendChild(mq.seg(['None', 'View', 'Plan'], c.picked, c.off))
    if (c.line) { const n = mq.el('p', 'adm-note', c.line); grid.appendChild(n) }
    two.after(grid)
    const role = ed.querySelector('#accEdRole')
    mq.roleMaster(!!c.master)
    if (c.grey === 'rest') mq.greyRest('.mqb-sq')  // 'all': only 149's buttons — Ranger's own row stays Hunter's to change
    if (c.grey === 'all') for (const b of grid.querySelectorAll('button')) { b.disabled = true; b.style.opacity = '.42' }
    // premise: the number labels line up with the field labels above (the same left edge, the same letters)
    const fl = ed.querySelector('.adm-2col .mfield label'), sl = grid.querySelector('label')
    const dx = Math.abs(fl.getBoundingClientRect().left - sl.getBoundingClientRect().left)
    if (dx > 0.5) throw new Error('149 label off the field labels by ' + dx)
    if (getComputedStyle(fl).fontSize !== getComputedStyle(sl).fontSize) throw new Error('label size differs')
    mq.mark(grid); mq.mark(role.closest('.mfield'))
    const seg = grid.querySelector('.acc-acts')
    const rows = seg ? (new Set([...seg.children].map(b => Math.round(b.getBoundingClientRect().top)))).size : 0
    return { h: mq.editH(), rows }
  }, { c })
}
async function B(sz) {
  const cases = [
    { n: 1, who: ['ad', 'a'], open: 'Hunter', picked: 2, line: PLAN_LINE, was: [2, []] },
    { n: 2, who: ['ad9', 'a9'], open: 'Ranger', picked: 1, off: [2], line: 'Only a master admin gives Plan.', grey: 'rest', badge: true, was: [1, [2, 3]] },
    { n: 3, who: ['ad', 'a'], open: 'Hunter', master: true, line: null },
    { n: 4, who: ['ad2', 'a2'], open: 'Ranger', picked: 0, off: [1, 2], line: "Only 149's admins, an admin with Plan of 149 or a master admin give access to 149.", grey: 'all', was: [0, [1, 2, 3]] },
  ]
  for (const c of cases) {
    const lines = { 1: PLAN_LINE, 2: 'Only a master admin gives Plan or makes a master admin.', 4: "Only 149's admins, an admin with Plan of 149 or a master admin give access to 149." }
    const was = c.was ? await today(sz, c.who, c.open, c.was[0], c.was[1], lines[c.n]) : null
    const { ctx, page } = await session(sz, ...c.who)
    await toUsers(page); await openRow(page, c.open)
    if (c.badge) await page.evaluate(() => { const nm = document.querySelector('#page-admin .acc-row.od-row-on .acc-name'); nm.appendChild(window.__mq.badge('142')) })
    const m = await bLines(page, c)
    if (!c.master && m.rows !== 1) errs.push(`B${c.n}-${sz}: the 149 buttons ran on ${m.rows} rows`)
    note(`B${c.n}-${sz}`, `${was ?? '—'}px → ${m.h}px, 149 buttons on ${m.rows} row(s)`)
    await shot(page, sz, `rB${c.n}-${sz}.png`); await ctx.close()
  }
}

// ---------- C: all as form fields ----------
async function C(sz) {
  for (const c of [
    { n: 1, who: ['ad', 'a'], open: 'Hunter', val: 'plan', line: PLAN_LINE, was: [2, []] },
    { n: 2, who: ['ad9', 'a9'], open: 'Ranger', val: 'view', off: ['plan'], line: 'Only a master admin gives Plan.', badge: true, was: [1, [2, 3]] },
  ]) {
    const was = await today(sz, c.who, c.open, c.was[0], c.was[1], c.n === 1 ? PLAN_LINE : 'Only a master admin gives Plan or makes a master admin.')
    const { ctx, page } = await session(sz, ...c.who)
    await toUsers(page); await openRow(page, c.open)
    const m = await page.evaluate(({ c }) => {
      const mq = window.__mq, row = document.querySelector('#page-admin .acc-row.od-row-on'), ed = row.querySelector('.acc-edit'), two = ed.querySelector('.adm-2col')
      if (c.badge) row.querySelector('.acc-name').appendChild(mq.badge('142'))
      const role = mq.roleMaster(false)
      // a second pair of the editor's own fields: the home squadron as a box he cannot change, the 149 choice as a list
      const two2 = two.cloneNode(true); for (const n of [two2, ...two2.querySelectorAll('*')]) { n.removeAttribute('id'); n.removeAttribute('for'); n.setAttribute('data-mine', '1') }
      const [f1, f2] = two2.querySelectorAll('.mfield')
      f1.querySelector('label').textContent = 'Home squadron'
      const inp = f1.querySelector('input'); inp.value = '142'; inp.readOnly = true; inp.disabled = true; inp.removeAttribute('placeholder')
      f2.querySelector('label').textContent = '149'
      const sel = f2.querySelector('select'); sel.innerHTML = ''
      for (const [v, t] of [['none', 'None'], ['view', 'View'], ['plan', 'Plan']]) { const o = mq.el('option', null, t); o.value = v; if ((c.off || []).includes(v)) o.disabled = true; sel.appendChild(o) }
      sel.value = c.val; sel.removeAttribute('aria-label')
      two2.style.marginTop = '10px'
      two.after(two2)
      const n = mq.el('p', 'adm-note', c.line); n.style.margin = '6px 0 12px'; two2.after(n)
      if (c.badge) { f2.classList.add('mqc-keep'); mq.greyRest('.mqc-keep') }
      // the read-only home box: the app's disabled look
      inp.style.opacity = '.6'
      if (!c.badge) mq.mark(role.closest('.mfield'))
      mq.mark(two2); mq.mark(n, false)
      return { h: mq.editH() }
    }, { c })
    note(`C${c.n}-${sz}`, `${was}px → ${m.h}px`)
    await shot(page, sz, `rC${c.n}-${sz}.png`); await ctx.close()
  }
}

const OPTS = { A, B, C }
for (const [k, fn] of Object.entries(OPTS)) {
  if (ONLY && !ONLY.includes(k)) continue
  for (const sz of ['d', 'p']) {
    console.log(k, sz)
    try { await fn(sz) } catch (e) { errs.push(`[${k} ${sz}] ${e && e.message}`); console.log('FAILED', k, sz, e && e.message) }
  }
}
for (const b of Object.values(browsers)) await b.close()
console.log('editor height, today → option:'); for (const [k, v] of Object.entries(fig)) console.log(' ', k, v)
console.log('errors:', errs.length ? errs.join('\n') : 'none')
