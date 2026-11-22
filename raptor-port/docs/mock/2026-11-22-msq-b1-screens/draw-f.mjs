// Batch 1's second half — the eight pictures the plan puts to him before the build (§9 F1–F8, as §15 widened them;
// raptor-port/docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md), drawn on the REAL running app by
// .claude/skills/brainstorming/mockups-on-the-real-app.md (chat 139's helper, 22 Nov 26). Nothing of the app changes:
// each picture is the real screen reached through the app's own controls, then ONE transform — real nodes re-lettered,
// a part hidden (never removed), new parts built from the app's own classes — every new word or mark outlined pink with
// a "New" tag. Demo data only; nothing is saved (the extra squadrons 150–155 live in the drawn parts alone).
//   f1  Admin → Squadron config following the schedule in view: 149 picked by a View holder (read only), 142 (editable)
//   f2  the Tracker when it holds another squadron than the one picked: (a) covered read only, (b) hidden
//   f3  the own-account lines in the bell (two pictures: the lines naming who did it, and the app's own)
//   f4  Admin → Users, a person with no sign-in opened: his squadron lines greyed, one line saying why
//   f5  eight squadrons on an iPhone: the bell's Show buttons, a person's squadron lines, the filter's Squadron group,
//       the Schedules menu
//   f6  the sign-in after the save lands (a), and a save that never lands (b)
//   f7  the pick-time band of an open Leave War window (a) and an open Input window (b)
//   f8  a request only its squadron's admin may answer: the refusal where Admin → Users shows one (the toast)
//
// Run from raptor-port/ against a served build:  MQ_URL=http://localhost:4612/ node docs/mock/2026-11-22-msq-b1-screens/draw-f.mjs
// MQ_ONLY=f1,f3 draws only those; MQ_SZ=d or p one size. Pictures: img/f<n><a-d>-<d|p>.png (+ manifest.json).
import { chromium, webkit } from '@playwright/test'
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'

const URL_ = process.env.MQ_URL || 'http://localhost:4612/'
const OUT = 'docs/mock/2026-11-22-msq-b1-screens/img'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
const SZS = process.env.MQ_SZ ? process.env.MQ_SZ.split(',') : ['d', 'p']
mkdirSync(OUT, { recursive: true })
const NEW = '#ff2d95'
const EIGHT = ['142', '149', '150', '151', '152', '153', '154', '155']

const SIZES = {
  d: { name: 'desktop 1536', engine: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'iPhone 402 (WebKit)', engine: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}

const CSS = `
.mkq { outline: 2px solid ${NEW} !important; outline-offset: 2px !important; }
.mkq.mkq-in { outline-offset: -2px !important; }
.mkq-tag { position: absolute; z-index: 600; background: ${NEW}; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none;
  font-style: normal; top: -9px; right: -6px; }
/* blue "Approved": a part he approved earlier (redraw-pieces.mjs's default mark) */
.mkq.mka { outline-color: #0e7fa6 !important; }
.mkq-tag.mka-tag { background: #0e7fa6 !important; }
*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}
/* the redesigned row "B" (draw-roles.mjs, pictures k1–k5), its rules word for word */
#page-admin .mqb-sq { display: grid; grid-template-columns: 34px 1fr; column-gap: 10px; row-gap: 8px; align-items: center; margin: 12px 0 4px; }
#page-admin .mqb-sq > label { margin: 0; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); font-weight: 600; }
#page-admin .mqb-sq .mqb-home { font-size: 12px; color: var(--ink-2); }
#page-admin .mqb-sq .acc-acts { margin: 0; flex-wrap: nowrap; }
#page-admin .mqb-sq .adm-note { grid-column: 2; margin: -2px 0 2px; }
#page-admin .mqk { margin: 4px 0 12px; }
#page-admin .mqk summary { font-size: 12px; font-weight: 600; color: var(--accent); cursor: pointer; list-style: none; min-height: 28px;
  display: flex; align-items: center; width: max-content; }
#page-admin .mqk summary::-webkit-details-marker { display: none; }
#page-admin .mqk summary::before { content: '▸'; width: 14px; }
`
const HIDE_TOAST = `#toastEl { display: none !important; }`

function kit() {
  const mq = {}
  mq.vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  mq.el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; e.setAttribute('data-mine', '1'); return e }
  mq.hide = e => { e.setAttribute('data-mqhid', '1'); e.style.setProperty('display', 'none', 'important') }
  mq.strip = root => { for (const n of [root, ...root.querySelectorAll('*')]) for (const a of ['id', 'data-testid', 'for']) n.removeAttribute(a); root.setAttribute('data-mine', '1'); return root }
  // the mark: an outline on the element (no room taken) and a "New" tag as its own child; asserts the box did not move
  mq.mark = (el, { inside = false, tag = true, approved = false } = {}) => {
    const b = el.getBoundingClientRect()
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.classList.add('mkq'); if (inside) el.classList.add('mkq-in'); if (approved) el.classList.add('mka')
    let t = null
    if (tag) { t = mq.el('span', 'mkq-tag' + (approved ? ' mka-tag' : ''), approved ? 'Approved' : 'New'); el.appendChild(t) }
    const a = el.getBoundingClientRect()
    if (!['x', 'y', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) < 0.6)) throw new Error('mark moved its element')
    return t
  }
  // the approved grey squadron badge (redraw-pieces.mjs mq.badge)
  mq.badge = txt => {
    const c = mq.el('span', 'sarole ro', txt)
    c.style.background = 'rgba(255,255,255,.08)'; c.style.borderColor = 'rgba(255,255,255,.22)'; c.style.color = 'var(--ink-2)'
    c.style.verticalAlign = '1px'; c.style.marginLeft = '6px'; c.style.fontStyle = 'normal'
    return c
  }
  // the band of ui/MoveBand.tsx, its markup word for word: .saveband.moveband > .sv-msg (.sv-sign, b lead, .sv-sep,
  // .sv-rest) and one button, Close, in the class of the buttons beside it (none where the page has nothing to close)
  mq.band = (lead, rest, closeClass) => {
    const d = mq.el('div', 'saveband moveband'); d.setAttribute('role', 'status')
    const m = mq.el('span', 'sv-msg'); m.appendChild(mq.el('span', 'sv-sign')); m.appendChild(mq.el('b', null, lead))
    if (rest) { m.appendChild(mq.el('span', 'sv-sep', ' ')); m.appendChild(mq.el('span', 'sv-rest', rest)) }
    d.appendChild(m)
    if (closeClass) { const b = mq.el('button', closeClass, 'Close'); b.type = 'button'; d.appendChild(b) }
    return d
  }
  // the TALON mark's number re-lettered (the Schedules button of b1-1: "142 ▾")
  mq.barNum = txt => {
    const k = [...document.querySelectorAll('.topbar .mark .k')].find(mq.vis)
    if (!k) return false
    const k2 = mq.strip(k.cloneNode(true)); k2.textContent = txt; mq.hide(k); k.after(k2); return true
  }
  // the signed-in chip re-lettered (the case is someone else's than the demo login that reaches the real screen)
  mq.who = (from, to) => {
    let n = 0
    for (const e of document.querySelectorAll('.topbar *')) for (const c of e.childNodes) if (c.nodeType === 3 && c.nodeValue.includes(from)) { c.nodeValue = c.nodeValue.replace(from, to); n++ }
    return n
  }
  // a band's tag inside it, at its right, clear of its words (above its edge the page clips it)
  // (left of its Close, where it has one — on the button it covered the word)
  mq.markBand = b => {
    const t = mq.mark(b, { inside: true }); t.style.top = '50%'; t.style.marginTop = '-7px'
    const c = b.querySelector(':scope > button'); t.style.right = (c ? Math.round(c.getBoundingClientRect().width) + 22 : 10) + 'px'
    // where the words run up to it (a narrow window), the tag sits on the band's foot instead
    const tr = t.getBoundingClientRect()
    for (const w of b.querySelectorAll('.sv-msg > b, .sv-msg > .sv-rest')) {
      const rg = document.createRange(); rg.selectNodeContents(w)
      for (const r of rg.getClientRects()) if (r.right > tr.left - 2 && r.left < tr.right && r.bottom > tr.top && r.top < tr.bottom) { t.style.top = 'auto'; t.style.marginTop = '0'; t.style.bottom = '-8px'; return t }
    }
    return t
  }
  mq.checkTags = () => {
    const bad = []
    for (const t of document.querySelectorAll('.mkq-tag')) {
      const r = t.getBoundingClientRect()
      if (!(r.width > 0)) continue
      for (let a = t.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        const cs = getComputedStyle(a)
        if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
          const c = a.getBoundingClientRect()
          if (r.left < c.left - 0.5 || r.right > c.right + 0.5 || r.top < c.top - 0.5 || r.bottom > c.bottom + 0.5) bad.push('tag "' + t.parentElement.className + '" clipped by ' + (a.className || a.tagName))
        }
      }
    }
    return bad
  }
  window.__mq = mq
}

const manifest = {}
const errs = []
const notes = []
const browsers = {}

async function session(sz, user, pass, { toasts = false, signIn = true } = {}) {
  const S = SIZES[sz]
  if (!browsers[sz]) browsers[sz] = await S.engine.launch()
  const ctx = await browsers[sz].newContext(S.opts)
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`); console.log('PAGEERROR', String(e)) })
  await page.goto(URL_)
  await page.waitForSelector('#luser')
  const css = CSS + (toasts ? '' : HIDE_TOAST)
  await page.addStyleTag({ content: css })
  if (!signIn) return { ctx, page }
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(800)
  await page.addStyleTag({ content: css })
  return { ctx, page }
}
function rec(file, piece, sz, caption) { manifest[file] = { piece, size: SIZES[sz].name, kind: 'drawn', caption } }
async function neutral(page) {
  await page.mouse.move(1, 1).catch(() => {})
  await page.evaluate(() => { const a = document.activeElement; a && a.blur && a.blur() })
  await page.waitForTimeout(150)
}
async function tagsOk(page, file) {
  const bad = await page.evaluate(() => window.__mq.checkTags())
  if (bad.length) errs.push(`${file}: ${bad.join('; ')}`)
}
// a picture: the whole screen, or the box round the given elements (padded), never past the screen
async function shot(page, file, sels, pad = 24) {
  await neutral(page)
  await tagsOk(page, file)
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
// the whole opened row on Admin → Users, in page coordinates, so a row taller than the screen is never cut (draw-roles.mjs)
async function rowShot(page, sz, file) {
  await neutral(page)
  await tagsOk(page, file)
  await page.evaluate(() => document.querySelector('#page-admin .acc-row.od-row-on').scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(250)
  const r = await page.evaluate(() => { const b = document.querySelector('#page-admin .acc-row.od-row-on').getBoundingClientRect(); return { L: b.left, T: b.top + scrollY, R: b.right, B: b.bottom + scrollY, W: innerWidth } })
  const pad = sz === 'd' ? 40 : 12
  const y = Math.max(0, r.T - pad), x = sz === 'd' ? Math.max(0, r.L - pad) : 0
  const clip = { x, y, width: sz === 'd' ? r.R - r.L + 2 * pad : r.W, height: r.B - r.T + 2 * pad }
  if (sz === 'p') { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200) }
  await page.screenshot({ path: `${OUT}/${file}`, clip, fullPage: true })
  console.log('  wrote', file)
}

async function toAdmin(page, cat) {
  await page.evaluate(() => window.go('admin'))
  await page.waitForSelector('#page-admin.on', { state: 'attached' }); await page.waitForTimeout(600)
  const want = cat === 'config' ? '#admConfig' : '#page-admin button.acc-main'
  if (!(await page.locator(want).first().isVisible())) {
    await page.locator('#page-admin button.adm-cat', { hasText: cat === 'config' ? 'Squadron config' : 'Users' }).first().click(); await page.waitForTimeout(600)
  }
}
async function openRow(page, cs) {
  await page.locator('#page-admin button.acc-main', { hasText: new RegExp('^' + cs) }).first().click()
  await page.waitForSelector('#page-admin .acc-edit'); await page.waitForTimeout(400)
}
async function openBell(page) {
  await page.locator('.bellbtn:visible').first().click()
  await page.waitForSelector('[data-testid="bell-list"]')
  await page.waitForTimeout(400)
}
// the bell's own line markup (ui/topbits.tsx: button.bl-line > .bl-dot, .bl-main > .bl-t (b.bl-name, i.bl-day) +
// .bl-what, .bl-ago); the real lines hidden. chips: null, or { on, all } — the bell's "Show" row (picture p3)
async function bellLines(page, lines, chips) {
  return page.evaluate(({ lines, chips }) => {
    const mq = window.__mq, list = document.querySelector('[data-testid="bell-list"]'), sc = list.querySelector('.bl-scroll')
    for (const k of [...sc.children]) mq.hide(k)
    for (const l of lines) {
      const b = mq.el('button', 'bl-line' + (l.unread ? ' unread' : '')); b.type = 'button'
      b.appendChild(mq.el('span', 'bl-dot'))
      const main = mq.el('span', 'bl-main'), t = mq.el('span', 'bl-t')
      t.appendChild(mq.el('b', 'bl-name', l.name)); t.appendChild(mq.el('i', 'bl-day', l.day)); main.appendChild(t)
      main.appendChild(mq.el('span', 'bl-what', l.what + (l.who ? ' · ' + l.who : '')))
      b.appendChild(main); b.appendChild(mq.el('span', 'bl-ago', l.ago || '2m'))
      sc.appendChild(b)
    }
    let row = null
    if (chips) {
      let foot = list.querySelector('.bl-foot')
      if (!foot) { foot = mq.el('div', 'bl-foot'); list.appendChild(foot) }
      row = mq.el('span', 'mq-sqchips')
      row.style.cssText = 'display:inline-flex;gap:6px;align-items:center;margin-right:auto;flex-wrap:nowrap;min-width:0;flex:1 1 auto;overflow-x:auto;scrollbar-width:none'
      row.appendChild(mq.el('span', 'bl-more', 'Show'))
      for (const s of chips.all) { const c = mq.el('button', 'fchip' + (chips.on.includes(s) ? ' on' : ''), s); c.type = 'button'; c.style.flex = '0 0 auto'; row.appendChild(c) }
      foot.insertBefore(row, foot.firstChild)
    }
    const r = sc.getBoundingClientRect()
    return { lines: lines.length, overflow: Math.round(sc.scrollHeight - sc.clientHeight), h: Math.round(list.getBoundingClientRect().height), chipsOver: row ? Math.round(row.scrollWidth - row.clientWidth) : null, listW: Math.round(list.getBoundingClientRect().width) }
  }, { lines, chips })
}

// ======================= F1 — Admin → Squadron config following the schedule in view =======================
async function f1(sz) {
  // f1a — 149 picked by a View holder of 149: drawn on Kestrel's session, so the set-up under the drawing is 149's own
  // (the demo gives nobody View of 149); the bar and the signed-in chip re-lettered as Hunter's, 149 picked
  for (const [k, who, pw, sq, ro] of [['a', 'ad9', 'a9', '149', true], ['b', 'ad2', 'a2', '142', false]]) {
    const { ctx, page } = await session(sz, who, pw)
    await toAdmin(page, 'config')
    const m = await page.evaluate(({ sq, ro, sz }) => {
      const mq = window.__mq, pane = document.querySelector('#admConfig').closest('.adm-pane')
      const h = pane.querySelector('.adm-pane-head h3')
      if (!/Squadron config/.test(h.textContent)) throw new Error('premise: the pane heading reads ' + h.textContent)
      const real = document.querySelector('.topbar .mark .k')
      if (real && mq.vis(real) && real.textContent.trim() !== sq) throw new Error('premise: the bar reads ' + real.textContent + ', not ' + sq)
      h.textContent = 'Squadron config · ' + sq
      mq.barNum(sq + ' ▾')
      if (ro) mq.who('KESTREL', 'HUNTER'), mq.who('Kestrel', 'Hunter')
      const sec = document.querySelector('#admConfig')
      let n = 0
      if (ro) {
        const line = mq.el('p', 'adm-note', "This is 149's set-up. Only an admin of 149 can change it.")
        line.style.margin = '0 0 12px'
        sec.insertBefore(line, sec.firstChild)
        // every control read only, in the app's own disabled look (the nudges' and the .abtn's own [disabled] rules)
        for (const c of sec.querySelectorAll('button, input, select, textarea')) { if (!c.disabled) n++; c.disabled = true }
        mq.mark(line)
      }
      // the tag above the heading's letters (at the box's edge it covered the number on the phone)
      const th = mq.mark(h); if (sz === 'p') th.style.top = '-17px'
      pane.setAttribute('data-mqshot', '1')
      window.scrollTo(0, 0)
      return { greyed: n }
    }, { sq, ro, sz })
    if (ro && m.greyed < 10) throw new Error('premise: fewer than 10 controls greyed: ' + m.greyed)
    const f = `f1${k}-${sz}.png`
    // desktop: the pane from its heading to the three template buttons; phone: the screen
    await shot(page, f, sz === 'd' ? ['[data-mqshot]'] : null, 16)
    rec(f, 'f1', sz, ro
      ? `Admin → Squadron config with 149 picked, by Hunter (142's admin) holding View of 149 — drawn on Kestrel's session (149's admin), so the set-up shown is 149's own; the demo gives nobody View of 149, so the top bar's number and the signed-in name are re-lettered as Hunter's with 149 picked. New: the heading "Squadron config · 149", one line under it, and every control read only (${m.greyed} greyed, in the app's own disabled look).`
      : `The same page with 142 picked, as Hunter, 142's admin: the heading "Squadron config · 142", every control his to change as today.`)
    await ctx.close()
  }
}

// ======================= F2 — the Tracker after a pick =======================
async function toTracker(page) {
  await page.evaluate(() => window.go('tracker'))
  await page.waitForSelector('#page-tracker #board, #page-tracker [data-testid="trk-nocourse"]', { state: 'attached', timeout: 30000 })
  await page.waitForTimeout(1500)
}
async function f2(sz) {
  // f2a — Saber (master admin) opened the Tracker on 149, then picked 142 in the Schedules menu: drawn on Kestrel's
  // session so the Tracker under the veil is 149's own; the bar re-lettered "142 ▾" and the chip "SABER"
  {
    const { ctx, page } = await session(sz, 'ad9', 'a9')
    await toTracker(page)
    const m = await page.evaluate(() => {
      const mq = window.__mq, pg = document.querySelector('#page-tracker'), root = pg.querySelector('.tr-root')
      if (!root || !pg.querySelector('#board')) throw new Error('premise: 149\'s Tracker board is not on screen')
      mq.barNum('142 ▾'); mq.who('KESTREL', 'SABER'); mq.who('Kestrel', 'Saber')
      const band = mq.band("This is 149's Tracker.", "Pick 149 to change it. To open 142's, sign out and in.", null)
      root.parentElement.insertBefore(band, root)
      // the veil: the page visible beneath, no control live (pointer events stop at it)
      if (getComputedStyle(root).position === 'static') root.style.position = 'relative'
      const veil = mq.el('div', 'mq-veil')
      veil.style.cssText = 'position:absolute;inset:0;z-index:400;background:rgba(10,12,16,.5);pointer-events:auto'
      root.appendChild(veil)
      mq.markBand(band)
      // the veil's tag at its left, half way down the screen: the chart's empty margin (at its top it sat on the Tracker's bar)
      const t = mq.mark(veil, { inside: true }); t.style.right = 'auto'; t.style.left = '10px'; t.style.top = Math.round(innerHeight / 2 - root.getBoundingClientRect().top) + 'px'
      return { bandH: Math.round(band.getBoundingClientRect().height) }
    })
    const f = `f2a-${sz}.png`; await shot(page, f, null)
    rec(f, 'f2', sz, `The Tracker as Saber, the master admin: he opened it on 149, then picked 142 in the Schedules menu (the bar reads "142 ▾"). He is still an admin of 149 (here by the master mark; home or Plan alike), so it stays in view, read only. Drawn on Kestrel's session so the Tracker under the veil is 149's own; the bar's number and the signed-in name re-lettered. New: the band across the Tracker's top in the app's own band look (the one an open window carries when his squadron changes under it), "This is 149's Tracker. Pick 149 to change it. To open 142's, sign out and in.", and the page under a light veil — visible, no control live. The band is ${m.bandH}px high.`)
    await ctx.close()
  }
  // f2b — Hunter, whose Plan of 149 was lowered to View while the Tracker held 149: its contents hidden, the line alone
  {
    const { ctx, page } = await session(sz, 'ad2', 'a2')
    await toTracker(page)
    await page.evaluate(() => {
      const mq = window.__mq, pg = document.querySelector('#page-tracker'), root = pg.querySelector('.tr-root')
      if (!root) throw new Error('premise: no Tracker on screen')
      mq.barNum('142 ▾')
      const band = mq.band("You can't open 149's Tracker any more.", "Sign out and in to open 142's.", null)
      root.parentElement.insertBefore(band, root)
      mq.hide(root)
      mq.markBand(band)
    })
    const f = `f2b-${sz}.png`; await shot(page, f, null)
    rec(f, 'f2', sz, 'The Tracker as Hunter (142\'s admin): it held 149\'s when his Plan of 149 was lowered to View (the bar reads "142 ▾" — View still gives him the menu). New: everything of the Tracker hidden — its bar, chart and panel, nothing to press — and the band alone across the top: "You can\'t open 149\'s Tracker any more. Sign out and in to open 142\'s." Drawn on his real session (142\'s Tracker, hidden).')
    await ctx.close()
  }
  // f2c — the member view: Hunter, holding Plan of 149, his Tracker bound to 149, tapped his badge to the member view
  // (a real tap: his badge reads "HUNTER · MEMBER" after it); hidden as (b), its own line
  {
    const { ctx, page } = await session(sz, 'ad2', 'a2')
    await toTracker(page)
    if (sz === 'd') { await page.locator('#roleBadge').click(); await page.waitForTimeout(600) }
    const badge = sz === 'd' ? await page.locator('#roleBadge').innerText() : '(phone: the badge is in the side menu)'
    await page.evaluate(() => {
      const mq = window.__mq, pg = document.querySelector('#page-tracker'), root = pg.querySelector('.tr-root')
      if (!root) throw new Error('premise: no Tracker on screen')
      mq.barNum('142 ▾')
      const band = mq.band("This is 149's Tracker.", 'Leave the member view to open it.', null)
      root.parentElement.insertBefore(band, root)
      mq.hide(root)
      mq.markBand(band)
    })
    const f = `f2c-${sz}.png`; await shot(page, f, null)
    rec(f, 'f2', sz, `The Tracker as Hunter, 142's admin holding Plan of 149, his Tracker bound to 149, after he tapped his badge into the member view${sz === 'd' ? ` (the real tap: the badge at the bar's right reads "${badge.replace(/\n/g, ' ')}")` : ' (on the iPhone the badge sits in the side menu, so the bar does not show it)'}. New: the Tracker hidden as in the picture before, and the band: "This is 149's Tracker. Leave the member view to open it." The bar reads "142 ▾" (the member view keeps 149 in his menu, view only). Drawn on his real session (142's Tracker, hidden).`)
    await ctx.close()
  }
  // f2d — a pick with unsaved Tracker edits asks first: the app's own three-button question (the one sign-out asks,
  // tracker/app/core.js onBeforeTrackerLogout), reached for real — an unsaved chart edit (save-note.spec.ts's way:
  // Edit chart layout, + Test, OK, done), then Logout — and its words re-lettered for the pick
  {
    const { ctx, page } = await session(sz, 'ad2', 'a2')
    await toTracker(page)
    const t = sel => page.locator(sel + ':visible').first().click()
    await page.waitForSelector('#sylMenuBtn:visible')
    await t('#sylMenuBtn'); await t('#arrangeBtn')
    const add = page.locator('#arrTools button', { hasText: '+ Test' }).first()
    if (!(await add.isVisible())) await page.locator('#page-tracker button', { hasText: 'Tools ▾' }).first().click()
    await add.click()
    await page.waitForSelector('#dlgInput:visible')
    // the name set through the box's own change path (typing on an emulated phone zooms the page)
    await page.evaluate(() => { const i = [...document.querySelectorAll('#dlgInput')].find(window.__mq.vis); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, 'T-NEW'); i.dispatchEvent(new Event('input', { bubbles: true })) })
    await t('#dlgOk'); await page.waitForTimeout(400); await t('#sylMenuBtn'); await t('#arrangeBtn'); await page.waitForTimeout(400)
    if (!(await page.locator('#page-tracker header button', { hasText: 'Save changes' }).first().isVisible())) throw new Error('premise: no unsaved chart edit ("Save changes" not shown)')
    if (sz === 'd') await page.locator('#logout').click()
    else { await page.locator('.topbar button[aria-label*="enu"]:visible').first().click(); await page.waitForTimeout(400); await page.locator('button:visible', { hasText: /^Log ?out$/ }).first().click() }
    await page.waitForTimeout(700)
    const real = await page.evaluate(() => { const m = [...document.querySelectorAll('#page-tracker *')].find(e => e.children.length === 0 && /unsaved chart edits/.test(e.textContent || '') && window.__mq.vis(e)); return m ? m.textContent : null })
    if (!real) throw new Error('premise: the sign-out question did not show')
    const m = await page.evaluate(() => {
      const mq = window.__mq
      const msg = [...document.querySelectorAll('#page-tracker *')].find(e => e.children.length === 0 && /unsaved chart edits/.test(e.textContent || '') && mq.vis(e))
      // the words: the chart's own name kept as the app prints it; "logging out" becomes the pick
      const tw = document.createTreeWalker(msg.closest('[role="dialog"], .dlg, .modal') || msg.parentElement, NodeFilter.SHOW_TEXT); let tn, hit = 0
      while ((tn = tw.nextNode())) if (/Save them before logging out\?/.test(tn.nodeValue)) { tn.nodeValue = tn.nodeValue.replace('Save them before logging out?', 'Save them before switching to 142?'); hit++ }
      if (!hit) throw new Error('premise: "Save them before logging out?" not found in the question')
      // the moment before the pick lands: the bar still names the squadron the page is on, 149
      mq.barNum('149 ▾')
      const box = msg.closest('[role="dialog"]') || msg.parentElement
      const btns = [...box.querySelectorAll('button')].filter(mq.vis).map(b => b.textContent.trim())
      const words = msg.textContent
      // the outline round the question's words only (the words are the change)
      const t = mq.mark(msg, { inside: false }); t.style.top = '-12px'
      return { btns, words }
    })
    notes.push(`f2d-${sz}: ${JSON.stringify(m)} (real: ${JSON.stringify(real)})`)
    const f = `f2d-${sz}.png`; await shot(page, f, null)
    rec(f, 'f2', sz, `The Tracker as Hunter with an unsaved chart edit (a real one: Edit chart layout, + Test), at the moment he picks 142 in the Schedules menu while it holds 149's. The question is the app's own — the one Logout asks today, reached here by pressing Logout, its buttons as built (${m.btns.join(' · ')}). New: its words — "${m.words.replace(/\n+/g, ' ')}" in place of "…Save them before logging out?".`)
    await ctx.close()
  }
}

// ======================= F3 — the own-account lines in the bell =======================
const F3_NAMED = [
  ['Made an admin of 142', 'Sun 22 Nov', '1m'], ['Made a member', 'Sat 21 Nov', '1d'], ['Suspended', 'Fri 20 Nov', '2d'],
  ['Enabled', 'Fri 20 Nov', '2d'], ['Given View of 149', 'Thu 19 Nov', '3d'], ['View of 149 ended', 'Wed 18 Nov', '4d'],
  ['Given Plan of 149: full access to 149', 'Tue 17 Nov', '5d'], ['Plan of 149 ended', 'Mon 16 Nov', '6d'],
  ['Made a master admin', 'Sun 15 Nov', '1w'], ['Master admin taken off', 'Sat 14 Nov', '1w'],
]
const F3_APP = [
  ['View of 149 ended: you moved to 150', 'Sun 22 Nov', '3m'], ['Plan of 149 ended: archived', 'Sat 21 Nov', '1d'],
  ['Made a member: you moved to 149', 'Fri 20 Nov', '2d'], ['Suspended', 'Thu 19 Nov', '3d'],
]
async function f3(sz) {
  // ten lines scroll the bell's list (its height stops at 520): seven a picture — the first seven named lines; then the
  // app's four, newest, with the last three named lines under them, older
  const named = F3_NAMED.map(([what, day, ago]) => ({ what, day, ago, who: 'Saber' }))
  const app = F3_APP.map(([what, day, ago]) => ({ what, day, ago, who: '' }))
  for (const [k, set] of [['a', named.slice(0, 7)], ['b', [...app, ...named.slice(7)]]]) {
    const { ctx, page } = await session(sz, 'ad2', 'a2')
    await openBell(page)
    const lines = set.map(({ what, day, who, ago }, i) => ({ name: 'Hunter', day, what, who, unread: i === 0, ago }))
    const m = await bellLines(page, lines, null)
    if (m.overflow > 0) errs.push(`f3${k}-${sz}: the list scrolls by ${m.overflow}px — not every line is in the picture`)
    await page.evaluate(() => {
      const mq = window.__mq
      for (const l of document.querySelectorAll('[data-testid="bell-list"] .bl-line[data-mine]')) mq.mark(l, { inside: true, tag: false })
      const t = mq.mark(document.querySelector('[data-testid="bell-list"]'), { inside: true }); t.style.top = 'auto'; t.style.bottom = '6px'; t.style.right = '8px'
    })
    notes.push(`f3${k}-${sz}: ${JSON.stringify(m)}`)
    const f = `f3${k}-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-testid="bell-list"]', '.bellbtn'] : null, 16)
    rec(f, 'f3', sz, k === 'a'
      ? 'Hunter\'s own bell (142\'s admin): changes to his account set by someone, each in the bell\'s usual line shape — his name · the day, then what changed · who did it; the newest unread. New: these seven lines (outlined), newest first: made an admin of 142, made a member, suspended, enabled, given View of 149, View of 149 ended, given Plan of 149. They carry no squadron mark; a tap opens nothing. (Ten lines scroll the list, so the other three are in the next picture.)'
      : 'The same kind of bell, another time: on top, newest first and the newest unread, the four lines the app writes by itself, with no one\'s name (a move, an archive, an Overseas posting\'s suspension record no one who set them); under them, older, the last three named lines: Plan of 149 ended, made a master admin, master admin taken off. New: all seven lines (outlined); no squadron mark.')
    await ctx.close()
  }
}

// ======================= F4 — a person with no sign-in, opened =======================
// the redesigned row "B" (draw-roles.mjs, k1–k5) on a person with no sign-in: Ace, 142's, opened by Hunter, 142's admin
async function squadLines(page, c) {
  return page.evaluate(c => {
    const mq = window.__mq, row = document.querySelector('#page-admin .acc-row.od-row-on'), ed = row.querySelector('.acc-edit'), two = ed.querySelector('.adm-2col')
    const role = ed.querySelector('select')
    for (const o of role.options) o.textContent = o.value === 'admin' ? 'Admin' : 'Member'
    const mo = mq.el('option', null, 'Master admin'); mo.value = 'mq-master'; role.appendChild(mo)
    const grid = mq.el('div', 'mqb-sq')
    grid.appendChild(mq.el('label', null, '142')); grid.appendChild(mq.el('div', 'mqb-home', 'Home squadron'))
    for (const s of c.lines) {
      grid.appendChild(mq.el('label', null, s.sq))
      const g = mq.el('div', 'acc-acts acc-mode'); g.setAttribute('role', 'group')
      ;['None', 'View', 'Plan'].forEach((t, i) => { const b = mq.el('button', 'abtn' + (i === s.picked ? ' primary' : ''), t); b.type = 'button'; if (c.greyAll) b.disabled = true; g.appendChild(b) })
      grid.appendChild(g)
    }
    if (c.line) grid.appendChild(mq.el('p', 'adm-note', c.line))
    two.after(grid)
    const det = mq.el('details', 'mqk'); det.appendChild(mq.el('summary', null, 'What each role allows')); grid.after(det)
    const fl = ed.querySelector('.adm-2col .mfield label'), sl = grid.querySelector('label')
    const dx = Math.abs(fl.getBoundingClientRect().left - sl.getBoundingClientRect().left)
    if (dx > 0.5) throw new Error('squadron label off the field labels by ' + dx)
    const rows = [...grid.querySelectorAll('.acc-acts')].map(g => new Set([...g.children].map(b => Math.round(b.getBoundingClientRect().top))).size)
    // the fold's tag on its summary (a closed fold draws no other child)
    // approved on 22 Nov (design B): the Role box, the squadron lines' look, the fold — blue. Pink only on what is new:
    // the greyed buttons with their line (f4), or the lines past 149 (f5b, eight squadrons)
    mq.mark(role.closest('.mfield'), { approved: true }); mq.mark(grid, { approved: true })
    // the fold's tag beside it, at its right (above it, it sat on the line over it)
    { const t = mq.mark(det.querySelector('summary'), { approved: true }); t.style.right = '-74px'; t.style.top = '50%'; t.style.marginTop = '-7px' }
    const segs = [...grid.querySelectorAll('.acc-acts')]
    if (c.line) {
      const n = [...grid.querySelectorAll('.adm-note')].pop()
      mq.mark(segs[0], { tag: false }); const t = mq.mark(n); t.style.top = 'auto'; t.style.bottom = '-8px'
    }
    if (c.newFrom) {
      const labs = [...grid.querySelectorAll(':scope > label')]
      let first = true
      for (const l of labs) if (Number(l.textContent) >= c.newFrom) {
        const s = l.nextElementSibling
        mq.mark(l, { tag: false }); const t = mq.mark(s, { tag: first }); if (t) { t.style.right = '6px'; t.style.top = '50%'; t.style.marginTop = '-7px' }
        first = false
      }
    }
    return { rows, h: Math.round(ed.getBoundingClientRect().height), signin: !!ed.querySelector('#accGiveName') }
  }, c)
}
async function f4(sz) {
  const { ctx, page } = await session(sz, 'ad2', 'a2')
  await toAdmin(page, 'users'); await openRow(page, 'Ace')
  const m = await squadLines(page, { lines: [{ sq: '149', picked: 0 }], greyAll: true, line: 'Give him a sign-in first to give access.' })
  if (!m.signin) throw new Error('premise: Ace\'s row is not the no-sign-in editor (no "Give sign-in" box)')
  const f = `f4-${sz}.png`; await rowShot(page, sz, f)
  rec(f, 'f4', sz, 'Admin → Users as Hunter, 142\'s admin, with Ace opened — a 142 pilot with no sign-in (his row\'s editor offers "Give sign-in"). Approved (blue, design B of 22 Nov): the Role list Member · Admin · Master admin, the squadron lines "142 Home squadron" / "149 None · View · Plan", the "What each role allows" fold. New (pink): the 149 buttons greyed, with one line under them: "Give him a sign-in first to give access."')
  await ctx.close()
}

// ======================= F5 — eight squadrons on an iPhone =======================
// the Schedules menu, option A as he chose it (draw-menu.mjs build, A only), rows 38 high (page question B, recommended)
function menuA({ view, rows, rowH }) {
  const mq = window.__mq, ph = innerWidth < 600
  const el = (tag, css, txt) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; e.setAttribute('data-mine', '1'); return e }
  const CHECK = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M4.5 12.5l4.8 4.8L19.5 7" fill="none" stroke="#3BC6E8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  const k = document.querySelector('.topbar .mark .k')
  if (!mq.vis(k) || k.textContent.trim() !== view) throw new Error('premise: the bar reads ' + k.textContent + ', not ' + view)
  const markEl = document.querySelector('.topbar .mark')
  const k2 = k.cloneNode(true); k2.setAttribute('data-mine', '1'); k2.textContent = view + ' ▾'
  mq.hide(k); k.after(k2)
  markEl.style.cssText += ';background:rgba(255,255,255,.07);box-shadow:0 0 0 6px rgba(255,255,255,.07);border-radius:4px'
  const top = Math.round(document.querySelector('.topbar').getBoundingClientRect().bottom)
  const panel = el('div'); panel.className = 'sb-moremenu'
  panel.style.cssText = `position:fixed;z-index:490;min-width:${ph ? 0 : 268}px;padding:4px;`
  panel.append(el('h5', `margin:0;padding:${ph ? '10px 11px 6px' : '8px 11px 5px'};font-family:'Barlow Condensed','Inter Tight',sans-serif;text-transform:uppercase;letter-spacing:.1em;font-size:${ph ? 11 : 10}px;color:var(--ink-3);font-weight:700`, 'Schedules'))
  for (const r of rows) {
    const b = el('button'); b.className = 'sb-moreitem'
    b.style.cssText = `width:100%;min-height:${rowH}px;height:${rowH}px;font-size:${ph ? 15 : 13}px;`
    const c = el('span'); c.className = 'bi'; c.style.cssText = 'display:inline-flex;justify-content:center;align-items:center;flex:none'
    if (r.n === view) c.innerHTML = CHECK
    b.append(c, el('span', 'font-weight:700;font-variant-numeric:tabular-nums', r.n), el('span', `margin-left:auto;padding-left:24px;font-size:${ph ? 13 : 12}px;font-weight:500;color:var(--ink-3)`, r.acc))
    b.tabIndex = -1
    panel.append(b)
  }
  if (ph) {
    const dim = el('div', `position:fixed;left:0;right:0;top:${top}px;bottom:0;background:rgba(0,0,0,.55);z-index:489`)
    document.body.appendChild(dim)
    Object.assign(panel.style, { left: '0', right: '0', top: top + 'px', width: 'auto', maxWidth: 'none', minWidth: '0', boxSizing: 'border-box', borderRadius: '0 0 16px 16px', borderTop: '0', margin: '0', padding: '4px 8px 10px' })
  } else { panel.style.left = Math.round(markEl.getBoundingClientRect().left) + 'px'; panel.style.top = (top + 12) + 'px' }
  document.body.appendChild(panel)
  // approved (option A, his choice): the menu — blue; new (pink): the rows past 149, the eight-squadron list
  panel.classList.add('mkq', 'mkq-in', 'mka')
  const t = el('span'); t.className = 'mkq-tag mka-tag'; t.textContent = 'Approved'; t.style.top = '5px'; t.style.right = '6px'; panel.appendChild(t)
  const extra = [...panel.querySelectorAll('button.sb-moreitem')].filter(b => Number(b.children[1].textContent) >= 150)
  extra.forEach((b, i) => {
    b.classList.add('mkq', 'mkq-in'); if (getComputedStyle(b).position === 'static') b.style.position = 'relative'
    if (i === 0) { const n = el('span'); n.className = 'mkq-tag'; n.textContent = 'New'; n.style.top = '50%'; n.style.marginTop = '-7px'; n.style.right = 'auto'; n.style.left = '96px'; b.appendChild(n) }
  })
  const hs = [...panel.querySelectorAll('button.sb-moreitem')].map(b => Math.round(b.getBoundingClientRect().height))
  const pr = panel.getBoundingClientRect()
  return { rows: hs, panelBottom: Math.round(pr.bottom) }
}
// the filter (redraw-pieces.mjs filterBtn, picture nf), its Squadron group with eight squadrons; 142 and 149 ticked
async function filterEight(page) {
  return page.evaluate(({ EIGHT }) => {
    const mq = window.__mq, head = document.querySelector('#page-admin .od-head'), find = head.querySelector('.od-find'), phone = innerWidth < 600
    const b = mq.el('button', 'abtn primary'); b.type = 'button'
    b.innerHTML = '<svg class="btnglyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:0;margin-right:6px"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg>'
    // two ticks of eight are a filter of two (picture nf counted "both of two" as one: everyone)
    b.appendChild(document.createTextNode('Filter · 2')); b.setAttribute('data-mine', '1')
    b.style.whiteSpace = 'nowrap'; b.style.flex = '0 0 auto'; b.style.display = 'inline-flex'; b.style.alignItems = 'center'
    const real = [...document.querySelectorAll('#page-admin button')].find(x => !x.getAttribute('data-mine') && /^Add person$/.test(x.textContent.trim()))
    if (real) { const cs = getComputedStyle(real); b.style.color = cs.color; b.style.background = cs.backgroundColor; b.style.borderColor = cs.borderColor }
    const wrapF = mq.el('div'); wrapF.style.cssText = 'display:flex;gap:8px;align-items:center;position:relative;' + (phone ? 'width:100%' : '')
    find.before(wrapF); wrapF.appendChild(find); wrapF.appendChild(b); if (phone) find.style.flex = '1 1 auto'
    const panel = mq.el('div', 'mq-fpanel')
    panel.style.cssText = `position:absolute;top:calc(100% + 6px);right:0;z-index:50;${phone ? 'left:0;' : 'width:380px;'}background:var(--card, #1b2129);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:12px 14px;display:grid;gap:10px;box-shadow:0 12px 32px rgba(0,0,0,.45)`
    const groups = [['Seat', ['Pilots', 'WSOs', 'Personnel']], ['CAT', ['IP', 'IW', 'A', 'B', 'C', 'OCU']], ['Role', ['Member', 'Admin', 'Admin + Plan of 149', 'Master admin']], ['Squadron', EIGHT]]
    const ticks = { Squadron: ['142', '149'] }
    let sq = null
    for (const [g, opts] of groups) {
      const box = mq.el('div'); box.style.cssText = 'display:grid;gap:6px'
      box.appendChild(mq.el('span', 'mfield-lbl', g))
      const r = mq.el('div'); r.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px'
      for (const o of opts) { const on = (ticks[g] || []).includes(o); const c = mq.el('button', 'fchip' + (on ? ' on' : ''), (on ? '✓ ' : '') + o); c.type = 'button'; r.appendChild(c) }
      box.appendChild(r); panel.appendChild(box); if (g === 'Squadron') sq = box
    }
    const ft = mq.el('div'); ft.style.cssText = 'display:flex;justify-content:flex-end'
    const cl = mq.el('button', 'abtn', 'Clear all'); cl.type = 'button'; ft.appendChild(cl); panel.appendChild(ft)
    wrapF.appendChild(panel)
    // approved (picture nf): the button and the Squadron group — blue; new (pink): the chips past 149 and the count
    mq.mark(b, { approved: true }); mq.mark(sq, { approved: true })
    const extra = [...sq.querySelectorAll('.fchip')].filter(c => Number(c.textContent.replace(/\D/g, '')) >= 150)
    extra.forEach((c, i) => { const t = mq.mark(c, { inside: true, tag: i === extra.length - 1 }); if (t) { t.style.right = '-44px'; t.style.top = '50%'; t.style.marginTop = '-7px' } })
    window.scrollTo(0, 0)
    const rows = new Set([...sq.querySelectorAll('.fchip')].map(c => Math.round(c.getBoundingClientRect().top))).size
    const pr = panel.getBoundingClientRect()
    return { sqRows: rows, panelBottom: Math.round(pr.bottom), vh: innerHeight }
  }, { EIGHT })
}
async function f5(sz) {
  if (sz !== 'p') return
  // f5a — Saber's bell: the Show row of eight in ONE row that scrolls sideways
  {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await openBell(page)
    const L = [
      { name: 'Ranger\'s leave', day: 'Mon 23 – Fri 27 Nov', what: 'Waiting for approval', who: 'Ranger', unread: true, ago: '4m' },
      { name: 'Access request', day: '', what: 'Waiting for an admin', who: 'Viper', unread: true, ago: '20m' },
      { name: 'Training', day: 'Tue 24 Nov', what: 'Needs an OIL answer', who: 'Ace', ago: '1h' },
    ]
    const m = await bellLines(page, L, { on: ['142'], all: EIGHT })
    if (!(m.chipsOver > 0)) errs.push('f5a: the Show row does not overflow — it would not scroll (' + m.chipsOver + ')')
    await page.evaluate(() => window.__mq.mark(document.querySelector('.mq-sqchips'), { inside: true, tag: false }))
    // the tag on the foot (the row clips its own children as it scrolls)
    await page.evaluate(() => { const f = document.querySelector('[data-testid="bell-list"] .bl-foot'); const t = window.__mq.el('span', 'mkq-tag', 'New'); if (getComputedStyle(f).position === 'static') f.style.position = 'relative'; t.style.top = '-9px'; t.style.right = 'auto'; t.style.left = '4px'; f.appendChild(t) })
    notes.push(`f5a: ${JSON.stringify(m)}`)
    const f = 'f5a-p.png'; await shot(page, f, null)
    rec(f, 'f5', sz, `Saber's bell, the master admin, with eight squadrons. New: the "Show" buttons, 142 · 149 · 150 · 151 · 152 · 153 · 154 · 155, in one row that scrolls sideways — cut off at the right edge (${m.chipsOver}px more to the right), so it reads as more to see. Only 142 on as it starts. The squadrons past 149 are drawn (the demo has two).`)
    await ctx.close()
  }
  // f5b — Saber opens Hunter's row: one line per squadron, eight
  {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await toAdmin(page, 'users'); await openRow(page, 'Hunter')
    const picks = { 149: 2, 150: 1, 151: 0, 152: 1, 153: 0, 154: 0, 155: 1 }
    const m = await squadLines(page, { lines: EIGHT.slice(1).map(sq => ({ sq, picked: picks[sq] })), line: null, newFrom: 150 })
    if (m.rows.some(n => n !== 1)) errs.push('f5b: a squadron\'s buttons ran on ' + m.rows.join('/') + ' rows')
    notes.push(`f5b: ${JSON.stringify(m)}`)
    const f = 'f5b-p.png'; await rowShot(page, sz, f)
    rec(f, 'f5', sz, `Saber, the master admin, opens Hunter's row (142's admin) with eight squadrons. Approved (blue, design B of 22 Nov): the Role box, the squadron lines' look, the fold. New (pink): the lines for 150 to 155 — eight squadrons, one line each, each on one row of the iPhone (${m.rows.length} lines measured, every one a single row). The editor grows to ${m.h}px tall; the fold stays closed.`)
    await ctx.close()
  }
  // f5c — Saber's filter, its Squadron group with eight
  {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await toAdmin(page, 'users')
    const m = await filterEight(page)
    notes.push(`f5c: ${JSON.stringify(m)}`)
    if (m.panelBottom > m.vh) errs.push(`f5c: the panel runs below the screen (${m.panelBottom} > ${m.vh})`)
    const f = 'f5c-p.png'; await shot(page, f, null)
    rec(f, 'f5', sz, `Admin → Users as Saber, the master admin, the filter open. Approved (blue, picture nf): the Filter button and its Squadron group. New (pink): the chips 150 to 155 — eight squadrons on ${m.sqRows} row(s) — and the count: 142 and 149 ticked, so the button reads "Filter · 2" (with two squadrons, picture nf counted both ticked as one, since both meant everyone; with eight, two ticks are a filter of two). The list behind is not redrawn for the ticks; the open panel covers it.`)
    await ctx.close()
  }
  // f5d — the Schedules menu with eight rows, 38 high
  {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await page.evaluate(() => window.go('editsched'))
    await page.waitForSelector('#page-editsched.on .day', { state: 'attached', timeout: 20000 }); await page.waitForTimeout(1200)
    await page.evaluate(() => window.scrollTo(0, 0))
    const rows = EIGHT.map((n, i) => ({ n, acc: i === 0 ? 'Your squadron' : 'Full access' }))
    const m = await page.evaluate(menuA, { view: '142', rows, rowH: 38 })
    if (m.rows.some(h => h !== 38)) errs.push('f5d: a row is not 38 high: ' + m.rows.join(','))
    notes.push(`f5d: ${JSON.stringify(m)}`)
    await page.mouse.move(200, 870); await page.waitForTimeout(150)
    await tagsOk(page, 'f5d-p.png')
    await page.screenshot({ path: `${OUT}/f5d-p.png`, clip: { x: 0, y: 0, width: 402, height: Math.min(874, m.panelBottom + 90) } })
    console.log('  wrote f5d-p.png')
    rec('f5d-p.png', 'f5', sz, `The Schedules menu ("142 ▾", option A as he chose it) for Saber, the master admin, with eight squadrons: 142 "Your squadron" ticked, 149 to 155 "Full access". Approved (blue): the menu, option A as he chose it. New (pink): the rows 150 to 155 — eight rows, each 38 high (question B's recommendation), the sheet ending ${m.panelBottom}px down the iPhone's 874.`)
    await ctx.close()
  }
}

// ======================= F6 — the sign-in after the save lands; a save that never lands =======================
async function f6(sz) {
  // f6a — the card back after the reload: the typed name kept, the password empty, one line under the name
  {
    const { ctx, page } = await session(sz, null, null, { signIn: false })
    await page.evaluate(() => {
      const mq = window.__mq, u = document.querySelector('#luser')
      // the value set through the box's own change path (typing on an emulated phone zooms the page)
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      set.call(u, 'ad9'); u.dispatchEvent(new Event('input', { bubbles: true }))
      document.activeElement && document.activeElement.blur && document.activeElement.blur()
      // the card's own quiet small print (picture 10's line, its size and grey)
      const n = mq.el('p', '', 'Saved. Press Sign in again.')
      n.style.cssText = 'text-align:center;margin:6px 0 10px;font-size:10.5px;line-height:1.6;color:var(--ink-3)'
      u.after(n)
      const t = mq.mark(n); t.style.right = 'auto'; t.style.left = '-6px'
      document.querySelector('#loginForm').setAttribute('data-mqshot', '1')
    })
    const v = await page.inputValue('#luser'), pw = await page.inputValue('#lpass')
    if (v !== 'ad9' || pw !== '') throw new Error('premise: the name box reads ' + v + ', the password ' + pw.length + ' letters')
    const f = `f6a-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-mqshot]'] : null, 60)
    rec(f, 'f6', sz, 'The sign-in screen on a shared tab, after the page reloaded once the last person\'s change saved. Kestrel had typed his sign-in and pressed Sign in while it waited (picture 10). New: his name kept in the Username box ("ad9", the demo\'s sign-in name for Kestrel), the password empty, and one line under the name: "Saved. Press Sign in again."')
    await ctx.close()
  }
  // f6b — picture 10's held sign-in (redraw-pieces.mjs p5) after the save has failed to land for a while
  {
    const { ctx, page } = await session(sz, null, null, { signIn: false })
    await page.evaluate(() => {
      const mq = window.__mq, f = document.querySelector('#loginForm'), btn = f.querySelector('button[type=submit]')
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      for (const [s, v] of [['#luser', 'ad9'], ['#lpass', 'a9']]) { const e = document.querySelector(s); set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })) }
      document.activeElement && document.activeElement.blur && document.activeElement.blur()
      btn.textContent = 'Signing in…'; btn.disabled = true; btn.style.opacity = '.42'; btn.style.cursor = 'default'
      const n = mq.el('p', '', 'The last change has not saved yet — check the connection. Sign in waits until it saves.')
      n.style.cssText = 'text-align:center;margin:10px 0 0;font-size:10.5px;line-height:1.6;color:var(--ink-3)'
      btn.after(n)
      // the tag above the line's top (at its edge it covered "The" on the phone, where the line fills two rows)
      const t = mq.mark(n); t.style.right = 'auto'; t.style.left = '-6px'; t.style.top = '-15px'
      mq.mark(btn, { tag: false })
      f.setAttribute('data-mqshot', '1')
    })
    const f = `f6b-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-mqshot]'] : null, 60)
    rec(f, 'f6', sz, 'Picture 10\'s held sign-in — Kestrel pressed Sign in while the last person\'s change was still saving — after that save has not landed for a while. New: its one line now reads "The last change has not saved yet — check the connection. Sign in waits until it saves."; the button still "Signing in…", greyed.')
    await ctx.close()
  }
}

// ======================= F7 — the pick-time band of an open window =======================
async function f7(sz) {
  // f7a — an open Leave War window (the one a scheduler opens by pressing a person's day): Saber, 142's war
  {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await page.evaluate(() => window.go('leavewar'))
    await page.waitForSelector('#page-leavewar [data-testid^="cell-"]', { state: 'attached', timeout: 30000 }); await page.waitForTimeout(1200)
    // Ranger's row: the cell of 25 Nov whose row's first cell names him (a cell's id carries his person id, not his name)
    const id = await page.evaluate(() => { const c = [...document.querySelectorAll('#page-leavewar [data-testid^="cell-"]')].find(e => /-2026-11-25$/.test(e.getAttribute('data-testid')) && /^\s*Ranger/.test((e.closest('tr')?.querySelector('th, td')?.textContent) || '')); return c && c.getAttribute('data-testid') })
    if (!id) throw new Error('premise: Ranger\'s Wed 25 Nov cell not found')
    await page.locator(`[data-testid="${id}"]`).first().scrollIntoViewIfNeeded()
    await page.locator(`[data-testid="${id}"]`).first().click(); await page.waitForTimeout(700)
    const m = await page.evaluate(() => {
      const mq = window.__mq
      const hd = [...document.querySelectorAll('.bidsheet-hd')].filter(mq.vis).pop()
      if (!hd) throw new Error('premise: no Leave War window open')
      const panel = hd.parentElement
      mq.barNum('149 ▾')
      // the slot as leavewar/ui/Sheet.tsx useMoveBand makes it: after the title strip, let out to the window's edges
      const cs = getComputedStyle(panel), pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0
      const slot = mq.el('div', 'moveband-slot'); slot.style.margin = `0 -${pr}px 8px -${pl}px`; slot.style.width = `calc(100% + ${pl + pr}px)`
      hd.after(slot)
      const band = mq.band("This is 142's.", 'You picked 149 — close this to go on.', 'pchip'); slot.appendChild(band)
      // the window read only beneath: every control under the band greyed in the app's disabled look; its ✕ and the
      // band's Close stay live
      let n = 0
      for (const c of panel.querySelectorAll('button, input, select, textarea')) {
        if (band.contains(c) || hd.contains(c)) continue
        c.disabled = true; c.style.opacity = '.42'; n++
      }
      mq.markBand(band)
      panel.setAttribute('data-mqshot', '1')
      return { greyed: n, title: hd.innerText.replace(/\n/g, ' ') }
    })
    notes.push(`f7a-${sz}: ${JSON.stringify(m)}`)
    const f = `f7a-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-mqshot]', '.topbar .mark'] : null, 16)
    rec(f, 'f7', sz, `Saber on 142's Leave War with a window open (Ranger's Wed 25 Nov, opened by pressing his day), at the moment the Schedules menu picks 149 (the bar reads "149 ▾"). Today, with nothing tried, this band reads "This change could not be saved." New: it reads "This is 142's. You picked 149 — close this to go on.", in the band's own look with its Close; the window under it read only (${m.greyed} controls greyed); nothing saved.`)
    await ctx.close()
  }
  // f7b — an open Input window on Inputs: Saber, a new input from a day of 142's month
  {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await page.evaluate(() => window.go('inputs'))
    await page.waitForSelector('#inpCal [data-icday="2026-11-25"]', { timeout: 20000 }); await page.waitForTimeout(600)
    await page.locator('#inpCal [data-icday="2026-11-25"]').click({ position: { x: 8, y: 8 } }); await page.waitForTimeout(500)
    await page.locator('#icPopAdd').click(); await page.waitForSelector('[data-testid="win-inputedit"]'); await page.waitForTimeout(600)
    const m = await page.evaluate(() => {
      const mq = window.__mq, win = document.querySelector('[data-testid="win-inputedit"]'), box = win.querySelector('#inpEditPop')
      mq.barNum('149 ▾')
      // where ui/InputWindow.tsx puts its band: the first thing in the window's body
      const band = mq.band("This is 142's.", 'You picked 149 — close this to go on.', 'abtn')
      box.insertBefore(band, box.firstChild)
      let n = 0
      // the whole window, its foot's Cancel and Add too; its ✕ and the band's Close stay live
      for (const c of win.querySelectorAll('button, input, select, textarea')) { if (band.contains(c) || /close/i.test(c.getAttribute('aria-label') || '')) continue; c.disabled = true; c.style.opacity = '.42'; n++ }
      mq.markBand(band)
      win.setAttribute('data-mqshot', '1')
      return { greyed: n }
    })
    notes.push(`f7b-${sz}: ${JSON.stringify(m)}`)
    const f = `f7b-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-mqshot]', '.topbar .mark'] : null, 16)
    rec(f, 'f7', sz, `Saber on 142's Inputs with an Input window open (a new input, from Wed 25 Nov's "+ Input"), at the moment the Schedules menu picks 149 (the bar reads "149 ▾"). Today its band reads "This change could not be saved." New: "This is 142's. You picked 149 — close this to go on.", in the band's own look with its Close; the window under it read only (${m.greyed} controls greyed); nothing saved.`)
    await ctx.close()
  }
}

// ======================= F8 — a request only its squadron's admin may answer =======================
async function f8(sz) {
  const { ctx, page } = await session(sz, 'ad2', 'a2', { toasts: true })
  await page.addStyleTag({ content: '#toastEl { opacity: 1 !important; transition: none !important; }' })
  await toAdmin(page, 'users'); await openRow(page, 'Ace')
  // the real refusal at this door: Give sign-in with the box empty — the app answers in its warning toast
  await page.click('#accGive'); await page.waitForTimeout(400)
  const said = await page.evaluate(() => { const t = document.querySelector('#toastEl'); return t ? { txt: t.textContent, cls: t.className, vis: window.__mq.vis(t) } : null })
  if (!said || !said.vis || !said.txt) throw new Error('premise: no refusal toast at Give sign-in: ' + JSON.stringify(said))
  await page.evaluate(() => {
    const mq = window.__mq, t = document.querySelector('#toastEl'), inp = document.querySelector('#accGiveName')
    inp.value = 'jett@mail'
    t.textContent = 'He asked to join 149 — only an admin of 149 can answer it.'
    mq.mark(t)
    t.setAttribute('data-mqshot', '1'); document.querySelector('#page-admin .acc-row.od-row-on').setAttribute('data-mqshot', '1')
    document.querySelector('#page-admin .acc-row.od-row-on').scrollIntoView({ block: 'center' })
  })
  await page.waitForTimeout(200)
  const f = `f8-${sz}.png`; await shot(page, f, sz === 'd' ? ['[data-mqshot]'] : null, 24)
  rec(f, 'f8', sz, `Admin → Users as Hunter, 142's admin. He opened Ace's row (no sign-in) and pressed "Give sign-in" with "jett@mail" — a sign-in that is waiting in a request to join 149. The app answers every refusal at this door in its warning toast (reached here by the real refusal of an empty box, "${said.txt}", its words then changed). New: the toast reads "He asked to join 149 — only an admin of 149 can answer it." The same toast answers "Add person" and a renamed sign-in.`)
  await ctx.close()
}

// ======================= F9 — the bell's access-request tap from another squadron =======================
// reached for real: a newcomer signs in with a name on no list and asks for access (the Request access card), signs
// out; Hunter signs in, his bell lit, and taps it — the app's own toast as Admin → Users opens; its words re-lettered
async function f9(sz) {
  const { ctx, page } = await session(sz, null, null, { signIn: false, toasts: true })
  await page.addStyleTag({ content: '#toastEl { opacity: 1 !important; transition: none !important; }' })
  const setv = (sel, v) => page.evaluate(([sel, v]) => { const e = document.querySelector(sel); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })) }, [sel, v])
  await setv('#luser', 'jett'); await setv('#lpass', 'jett')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#accCs', { timeout: 15000 })
  await setv('#accCs', 'Jett'); await setv('#accIni', 'JT')
  const seat = await page.evaluate(() => [...document.querySelector('#accSeat').options].map(o => o.value).find(v => v && v !== 'GND'))
  await page.selectOption('#accSeat', seat); await page.waitForTimeout(200)
  const cat = await page.evaluate(() => [...document.querySelector('#accCat').options].map(o => o.value).find(v => v))
  await page.selectOption('#accCat', cat)
  await page.click('#accSend'); await page.waitForTimeout(600)
  await page.locator('button:visible', { hasText: /^Sign out$/ }).first().click()
  await page.waitForSelector('#luser', { timeout: 15000 }); await page.waitForTimeout(800)
  await setv('#luser', 'ad2'); await setv('#lpass', 'a2')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(800)
  await page.addStyleTag({ content: CSS + '#toastEl { opacity: 1 !important; transition: none !important; }' })
  await page.locator('.bellbtn:visible').first().click(); await page.waitForTimeout(500)
  const said = await page.evaluate(() => { const t = document.querySelector('#toastEl'); return t && window.__mq.vis(t) ? t.textContent : null })
  if (!said || !/waiting for access/.test(said)) throw new Error('premise: the bell tap did not toast the waiting request — ' + said)
  const onUsers = await page.evaluate(() => !!document.querySelector('#page-admin.on #admUsers.on'))
  await page.evaluate(() => {
    const mq = window.__mq, t = document.querySelector('#toastEl')
    // the toast's place approved (today's toast where Admin → Users opens) — blue on the toast; its new words pink
    t.textContent = ''
    const w = mq.el('span', null, '1 waiting for access to 149'); t.appendChild(w)
    mq.mark(t, { approved: true, tag: false })
    const tw = mq.mark(w); tw.style.top = '-14px'
    mq.barNum('142 ▾')
  })
  const f = `f9-${sz}.png`; await shot(page, f, null)
  rec(f, 'f9', sz, `Hunter (142's admin, holding Plan of 149), 142 picked (the bar reads "142 ▾"), taps his lit bell for a request waiting to join 149. Reached for real: a newcomer asked for access on the Request access card, then Hunter tapped his bell — the app opened Admin → Users${onUsers ? '' : ' (not confirmed on screen)'} and said "${said}". Approved (blue outline): the toast, in its place as today. New (pink): its words, "1 waiting for access to 149". (The demo's request is 142's; the list behind is 142's — in the build the tap enters 149 and opens 149's list.)`)
  await ctx.close()
}

// ======================= F10 — the Undo bubble after an access change =======================
// the bubble is the app's toast after Undo (state/undo-wire.ts showBubble → toast; undo/describe.ts bubbleText:
// "Undid: " + the label). Reached for real: Saber suspends Ranger on Admin → Users, presses Undo; its words re-lettered
async function f10(sz) {
  const { ctx, page } = await session(sz, 'ad', 'a', { toasts: true })
  await page.addStyleTag({ content: '#toastEl { opacity: 1 !important; transition: none !important; }' })
  await toAdmin(page, 'users'); await openRow(page, 'Ranger')
  await page.click('#accEdOnOff'); await page.waitForTimeout(600)
  const title = await page.locator('#undoBtn:visible').first().getAttribute('title')
  await page.locator('#undoBtn:visible').first().click(); await page.waitForTimeout(500)
  const said = await page.evaluate(() => { const t = document.querySelector('#toastEl'); return t && window.__mq.vis(t) ? t.textContent : null })
  if (!said || !/^Undid/.test(said)) throw new Error('premise: no "Undid" bubble after Undo — ' + said)
  await page.evaluate(() => {
    const mq = window.__mq, t = document.querySelector('#toastEl')
    t.textContent = 'Undid: Plan of 149 given · Hunter'
    mq.mark(t)
    const u = [...document.querySelectorAll('#undoBtn')].find(mq.vis); mq.mark(u, { tag: false })
    // Hunter's row, whose access the label names, brought into view
    const h = [...document.querySelectorAll('#page-admin .acc-row')].find(r => /^Hunter/.test(r.querySelector('.acc-name')?.textContent || ''))
    if (h) h.scrollIntoView({ block: 'center' })
  })
  const f = `f10-${sz}.png`; await shot(page, f, null)
  rec(f, 'f10', sz, `Admin → Users as Saber, the master admin, just after pressing the top bar's Undo (outlined) on a change of Hunter's access. The label shows in the app's Undo bubble — its toast after an Undo, which today begins "Undid: " (reached for real: Saber suspended Ranger and pressed Undo; it said "${said}"). New: the label "Plan of 149 given · Hunter". The same label is the Undo button's hover before the press: "Undo — Plan of 149 given · Hunter" (today: "${title}" — a hover cannot be pictured).`)
  await ctx.close()
}

const PIECES = { f1, f2, f3, f4, f5, f6, f7, f8, f9, f10 }
for (const [k, fn] of Object.entries(PIECES)) {
  if (ONLY && !ONLY.includes(k)) continue
  for (const sz of SZS) {
    console.log(k, sz)
    try { await fn(sz) } catch (e) { errs.push(`[${k} ${sz}] ${e && e.message}`); console.log('FAILED', k, sz, e && e.message) }
  }
}
for (const b of Object.values(browsers)) await b.close()
const mf = `${OUT}/manifest.json`
const old = existsSync(mf) ? JSON.parse(readFileSync(mf, 'utf8')) : {}
writeFileSync(mf, JSON.stringify({ ...old, ...manifest }, null, 1))
console.log('notes:\n' + notes.join('\n'))
console.log('errors:', errs.length ? errs.join('\n') : 'none')
