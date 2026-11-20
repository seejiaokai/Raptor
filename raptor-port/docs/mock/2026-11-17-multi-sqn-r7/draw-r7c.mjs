// Multi-squadron & detachment — round 7's Group C, "planning each other's people" (17 Nov 26, chat 102), drawn on the
// REAL running app by .claude/skills/brainstorming/mockups-on-the-real-app.md, to the brief
// docs/superpowers/briefs/2026-11-17-multi-sqn-r7-drawing.md (C1–C6; rulings F19, F20, F8, R9, D2149; new H6, L2, M12).
// Kit: draw-q4.mjs (Q4N's row and its window) and round 5's draw.mjs (the grey 149 badge, the quiet grey line, the
// shared-wave look, the "142" tag). Two mark colours (D2159): BLUE #0e7fa6 for what he has already ruled, PINK #ff2d95
// for what is new in round 7. Every mark is drawn ON its element (outline + child tag); every drawn part is marked
// data-mine; a part the app draws is hidden (display:none), never removed. Demo data only; 142's app stands in for 149's
// where a picture is 149's (its top bar re-lettered "149").
//
// Run from raptor-port/, against a built preview already serving (no build, no server started here):
//   MQ_URL=http://localhost:4180/ node docs/mock/2026-11-17-multi-sqn-r7/draw-r7c.mjs
//   MQ_ONLY=c1,c3 … draws only those.
// The pictures go to docs/mock/2026-11-17-multi-sqn-r7/img/ (the page's folder) and are copied to
// docs/img/2026-11-17-multi-sqn-r7/; their captions to manifest-r7c.json in both.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4180/'
const PAGEIMG = 'docs/mock/2026-11-17-multi-sqn-r7/img'
const OUT = 'docs/img/2026-11-17-multi-sqn-r7'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
mkdirSync(PAGEIMG, { recursive: true }); mkdirSync(OUT, { recursive: true })

const SIZES = {
  d: { name: 'desktop', opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
// the demo's people by their hidden ids
const COMET = 'beams', ANVIL = 'shaft', TALLY = 'nick'
// four signers for a publish, none of them a man the pictures re-letter (Torch, Ridge, Piston, Trident)
const SIGN = { cur: 'ignite', sked: 'razer', plan: 'pump', appr: 'harpoon' }

const MARK_CSS = `
.mkq { outline: 2px solid #ff2d95 !important; outline-offset: -2px !important; }
.mkq.mkb { outline-color: #0e7fa6 !important; }
.mkq.mkq-o { outline-offset: 2px !important; }
.mkq-tag { position: absolute; z-index: 60; background: #ff2d95; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; font-style: normal; text-decoration: none; }
.mkq-tag.b { background: #0e7fa6; }
.toast, .toasts, #toast, #toastEl { display: none !important; }
`

function kit() {
  const mq = {}
  mq.vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  mq.hide = e => { e.setAttribute('data-mqhid', '1'); e.style.setProperty('display', 'none', 'important') }
  mq.strip = root => {
    const A = ['id', 'data-inprow', 'data-inpedit', 'data-inp', 'data-txt', 'data-slot', 'data-fill', 'data-drag', 'data-inpseat',
      'tabindex', 'data-plangolive', 'data-plandup', 'data-avtog', 'data-planmenu', 'for', 'data-person', 'data-testid', 'contenteditable', 'data-acc', 'data-acck',
      'data-gline', 'data-gdel', 'data-itadd', 'data-sortsec', 'data-air', 'data-wvadd', 'data-acct', 'data-editing', 'data-bfld', 'data-move', 'data-beak']
    for (const n of [root, ...root.querySelectorAll('*')]) for (const a of A) n.removeAttribute(a)
    root.setAttribute('data-mine', '1')
    return root
  }
  // a mark ON the element: an outline (no room taken) and a child tag. col 'b' = blue (ruled), else pink (new).
  // where: in (top right, inside) · br (bottom right, inside) · below · above · right · left (outside)
  mq.mark = (el, label, where = 'in', col = 'p') => {
    if (where === 'right' && el.getAttribute('data-mine') === '1') el.style.width = 'fit-content'
    const b = el.getBoundingClientRect()
    el.classList.add('mkq'); if (col === 'b') el.classList.add('mkb')
    if (!['in', 'br'].includes(where)) el.classList.add('mkq-o')
    const t = document.createElement('span'); t.className = 'mkq-tag' + (col === 'b' ? ' b' : ''); t.textContent = 'New'; if (col === 'b') t.style.display = 'none'; t.setAttribute('data-mine', '1')
    if (where === 'below') { t.style.top = 'calc(100% + 4px)'; t.style.right = '0' }
    else if (where === 'above') { t.style.bottom = 'calc(100% + 4px)'; t.style.right = '0' }
    else if (where === 'right') { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.left = 'calc(100% + 5px)' }
    else if (where === 'left') { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.right = 'calc(100% + 5px)' }
    else if (where === 'br') { t.style.bottom = '2px'; t.style.right = '2px' }
    else { t.style.top = '1px'; t.style.right = '1px' }
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.appendChild(t)
    const a = el.getBoundingClientRect()
    if (!['x', 'y', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) < 0.5)) throw new Error('mark moved its element: ' + label)
    return t
  }
  mq.checkTags = () => {
    const bad = []
    for (const t of document.querySelectorAll('.mkq-tag')) {
      if (t.closest('[data-mqhid]')) continue
      if (t.style.display === 'none') continue
      const r = t.getBoundingClientRect()
      if (!(r.width > 0)) { bad.push(t.textContent + ': not drawn'); continue }
      for (let a = t.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        const cs = getComputedStyle(a)
        if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
          const c = a.getBoundingClientRect()
          if (r.left < c.left - 0.5 || r.right > c.right + 0.5 || r.top < c.top - 0.5 || r.bottom > c.bottom + 0.5) bad.push(t.textContent + ': clipped by ' + a.className)
        }
      }
    }
    return bad
  }
  mq.topH = () => { const t = document.querySelector('.topbar'); return t && mq.vis(t) ? t.getBoundingClientRect().bottom : 0 }
  // a day column brought wholly into view sideways: every scrolling ancestor moved so its left edge is at their left
  mq.bringX = el => {
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a)
      if (a.scrollWidth > a.clientWidth + 1 && /auto|scroll/.test(cs.overflowX)) a.scrollLeft += el.getBoundingClientRect().left - a.getBoundingClientRect().left
    }
    if (el.getBoundingClientRect().left < 0 || el.getBoundingClientRect().right > innerWidth) window.scrollBy(el.getBoundingClientRect().left, 0)
    return Math.round(el.getBoundingClientRect().left)
  }
  mq.days = wk =>[...document.querySelectorAll((wk || '#eWeek') + ' > .day')].filter(d => mq.vis(d) && !d.classList.contains('peek'))
  // the grey badge of round 2's look 2 (D2104), round 4's recipe: the standby lines' MAIN badge in neutral grey
  mq.badge = (txt, small) => {
    const c = document.createElement('span'); c.className = 'sarole ro'; c.textContent = txt; c.setAttribute('data-mine', '1')
    c.style.background = 'rgba(255,255,255,.08)'; c.style.borderColor = 'rgba(255,255,255,.22)'; c.style.color = 'var(--ink-2)'
    c.style.verticalAlign = 'middle'; c.style.alignSelf = 'center'
    if (small) { c.style.fontSize = '7px'; c.style.padding = '0 4px' }
    return c
  }
  mq.textLeft = el => { const tn = [...el.childNodes].find(n => n.nodeType === 3 && n.nodeValue.trim()); const r = document.createRange(); r.selectNodeContents(tn); return r.getClientRects()[0].left }
  // the quiet grey line: the day head's own date line, its look measured on the real element and copied whole (round 4)
  mq.quiet = (lines) => {
    const src = [...document.querySelectorAll('#eWeek .day-head .dt, #vWeek .day-head .dt')].find(mq.vis)
    const cs = getComputedStyle(src)
    const d = document.createElement('div'); d.setAttribute('data-mine', '1'); d.className = 'mq-quiet'
    for (const p of ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'line-height', 'color']) d.style.setProperty(p, cs.getPropertyValue(p))
    d.style.whiteSpace = 'normal'
    for (const l of lines) { const x = document.createElement('div'); x.textContent = l; d.appendChild(x) }
    return d
  }
  // made-up names over the demo's: each whole word, case kept (an all-capitals word stays all capitals), titles too
  mq.reletter = (root, map) => {
    const keys = Object.keys(map)
    const re = new RegExp('\\b(' + keys.join('|') + ')\\b', 'gi')
    const sub = s => s.replace(re, m => { const k = keys.find(x => x.toLowerCase() === m.toLowerCase()); const v = map[k]; return m === m.toUpperCase() && m !== m.toLowerCase() ? v.toUpperCase() : v })
    let n = 0
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let t
    while ((t = w.nextNode())) { if (re.test(t.nodeValue)) { re.lastIndex = 0; t.nodeValue = sub(t.nodeValue); n++ } re.lastIndex = 0 }
    for (const e of root.querySelectorAll('[title]')) e.setAttribute('title', sub(e.getAttribute('title')))
    return n
  }
  // the squadron number in the top bar, re-lettered (round 4's recipe) — and the signed-in name, where given
  mq.topbar = (sqn, who) => {
    if (sqn) { const k = document.querySelector('.topbar .mark .k'); if (k) { const k2 = k.cloneNode(true); k2.setAttribute('data-mine', '1'); k2.textContent = sqn; mq.hide(k); k.after(k2) } }
    if (who) mq.reletter(document.querySelector('.topbar'), who)
  }
  // a bell line in the bell's own markup (topbits.tsx: button.bl-line > .bl-dot, .bl-main > .bl-t > b.bl-name + i.bl-day,
  // .bl-what; .bl-ago), unread like every new line. The brief's words are kept whole on the line's first row.
  mq.bellLine = (text) => {
    const list = document.querySelector('[data-testid="bell-list"] .bl-scroll')
    const empty = list.querySelector('.bl-empty'); if (empty) mq.hide(empty)
    const n = document.createElement('button'); n.type = 'button'; n.setAttribute('role', 'menuitem'); n.setAttribute('data-mine', '1')
    n.className = 'bl-line unread'
    n.innerHTML = '<span class="bl-dot" aria-hidden="true"></span><span class="bl-main"><span class="bl-t"><b class="bl-name"></b></span></span><span class="bl-ago"></span>'
    n.querySelector('.bl-name').textContent = text
    list.prepend(n)
    const bell = [...document.querySelectorAll('.bellbtn')].find(x => x.offsetParent !== null); if (bell) bell.classList.add('on')
    return n
  }
  window.__mq = mq
}

const manifest = {}, notes = [], errs = [], touched = new Set()
let browser
async function login(page, user, pass) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForTimeout(1300)
}
async function world(sz, { user = 'ad', pass = 'a' } = {}) {
  const ctx = await browser.newContext(SIZES[sz].opts)
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`); console.log('PAGEERROR', String(e)) })
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  await page.goto(URL_)
  await login(page, user, pass)
  await page.addStyleTag({ content: MARK_CSS })
  return { ctx, page }
}
async function toEdit(page) {
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#page-editsched.on #eWeek .day')
  await page.waitForTimeout(900)
}
const publish = (page, di) => page.evaluate(({ di, S }) => { const g = window.signOf(di); Object.assign(g, S); window.setDayApproved(di, true) }, { di, S: SIGN })
function rec(file, item, sz, kind, caption) { manifest[file] = { item, size: SIZES[sz].name, kind, caption } }
async function neutral(page) {
  await page.evaluate(() => { const a = document.activeElement; if (a && a !== document.body && a.blur) a.blur() })
  await page.mouse.move(Math.round(page.viewportSize().width / 2), 1)
  await page.waitForTimeout(150)
}
async function shot(page, file, clip, full = false) {
  const bad = await page.evaluate(() => window.__mq.checkTags())
  if (bad.length) throw new Error(file + ': ' + bad.join('; '))
  await neutral(page)
  await page.screenshot({ path: `${PAGEIMG}/${file}`, ...(clip ? { clip } : {}), ...(full ? { fullPage: true } : {}) })
  copyFileSync(`${PAGEIMG}/${file}`, `${OUT}/${file}`)
  console.log('  wrote', file)
}
// a clip from one element's top to another's bottom, in PAGE coordinates (for a full-page picture), x from a column
async function pageClip(page, { top, bot, col, pad = 6 }) {
  return page.evaluate(({ top, bot, col, pad }) => {
    const T = window[top].getBoundingClientRect(), B = window[bot].getBoundingClientRect(), C = window[col].getBoundingClientRect()
    const x = Math.max(0, C.left - pad), y = Math.max(0, T.top + scrollY - pad)
    return { x, y, width: Math.min(innerWidth - x, C.width + pad * 2), height: B.bottom + scrollY + pad - y }
  }, { top, bot, col, pad })
}
// a frame taller than the screen: the screen made taller at the same width (the layout follows the width only), the
// frame's top brought just under the top bar, and the clip taken in the screen. Said in the caption.
async function tallClip(page, { top, bot, col, pad = 6 }) {
  const need = await page.evaluate(({ top, bot }) => Math.ceil(window[bot].getBoundingClientRect().bottom - window[top].getBoundingClientRect().top + window.__mq.topH() + 40), { top, bot })
  const vp = page.viewportSize()
  if (need > vp.height) await page.setViewportSize({ width: vp.width, height: need })
  await page.waitForTimeout(300)
  return page.evaluate(({ top, bot, col, pad }) => {
    const mq = window.__mq
    window.scrollBy(0, window[top].getBoundingClientRect().top - mq.topH() - 12)
    const T = window[top].getBoundingClientRect(), B = window[bot].getBoundingClientRect(), C = window[col].getBoundingClientRect()
    const x = Math.max(0, C.left - pad), y = Math.max(mq.topH(), T.top - pad)
    return { x, y, width: Math.min(innerWidth - x, C.width + pad * 2), height: Math.min(innerHeight - y, B.bottom + pad - y), tall: innerHeight }
  }, { top, bot, col, pad })
}

// ---------- C1 · 142's published Tue 14 Jul, Saber's automatic row ----------
// The world: 149 picks Saber (the demo's Comet, re-lettered) for its ACADEMICS 14:00–16:00 on Tue 14 Jul — the automatic
// Attach To 149 the app files through the Inputs door (D2098, D2149), titled ACADEMICS, so the app itself draws the row
// "ACADEMICS · 149" over the small "ATTACH" (draw-q4.mjs's Q4N row, now drawn by the app from the title). 142 has
// Saber on its own Sim BOX 14:30–15:30 (a real fill), so the app's own rules raise their real people warning on that
// line ("Conflict with a request"). Comet's own 2nd-wave SDO 12:00–17:00 on the demo Tuesday is handed to Anvil first,
// so the one clash in the picture is the cross-squadron one. Then 142 publishes Tuesday (four real signers).
async function c1World(sz) {
  const w = await world(sz)
  await toEdit(w.page)
  await w.page.evaluate(({ COMET }) => window.fileInput({ iid: 'mq-att', person: COMET, type: 'Attach', to: '149', title: 'ACADEMICS', date: 'Jul 14', yr: 2026, allday: false, s: 840, e: 960, remarks: '' }), { COMET })
  await w.page.waitForTimeout(400)
  const ok = await w.page.evaluate(({ COMET, ANVIL }) => { const a = window.setSlotVal('d:1.1.0', ANVIL); const b = window.fillSlot('s:1.amt.1.+', COMET); window.afterSchedMutate(); return a && b }, { COMET, ANVIL })
  if (!ok) throw new Error('C1: the SDO hand-over or the BOX fill was refused')
  await w.page.waitForTimeout(400)
  await publish(w.page, 1)
  await w.page.waitForTimeout(800)
  return w
}
async function itC1(sz) {
  const { ctx, page } = await c1World(sz)
  // the day's issues list opened by its own bar (a real press)
  await page.evaluate(() => { const t = window.__mq.days()[1]; window.__mq.bringX(t); t.querySelector('.daywarn').click() })
  await page.waitForTimeout(700)
  const m = await page.evaluate(() => {
    const mq = window.__mq, tue = mq.days()[1]
    mq.bringX(tue)
    const head = tue.querySelector('.day-head'), body = tue.querySelector('.day-body')
    const ver = (head.querySelector('.dhver, .verchip') || head).innerText.replace(/\s+/g, ' ').trim()
    if (!/ORIG/.test(head.innerText)) return { err: 'Tuesday is not published: ' + head.innerText.replace(/\s+/g, ' ') }
    // what the picture keeps of the day: its head, its issues list, Sims and Unavailable; the rest hidden, named
    const hidden = []
    const so = tue.querySelector('.signoff.day-sign'); if (so) { mq.hide(so); hidden.push('the empty sign-off boxes, waiting for the next amendment') }
    const dw = body.querySelector('.dwbox')
    for (const s of [...body.children]) {
      const txt = s.innerText.replace(/\s+/g, ' ').trim()
      const keep = s === dw || /^\W*SIMS\b/.test(txt) || s.querySelector('.sec-unav') || s.classList.contains('sec-unav')
      if (!keep) { hidden.push(txt.replace(/^\W+/, '').slice(0, 22)); mq.hide(s) }
    }
    const renamed = mq.reletter(tue, { Comet: 'Saber' })
    // the automatic row: the app's own, from the Attach To 149 titled ACADEMICS
    const row = tue.querySelector('[data-inprow="mq-att"]')
    if (!row) return { err: 'no automatic row' }
    const name = row.querySelector('.inpedit').textContent.trim(), kind = row.querySelector('.nm-kind').textContent.trim()
    const ts = row.querySelector('.t-s').textContent.trim(), te = row.querySelector('.t-e').textContent.trim()
    // its REJECT hidden, as Q4N drew it (the row like every input row; its one action is in the window, C2)
    const rej = row.querySelector('[data-acc="x"]'); if (rej) mq.hide(rej.closest('.accs') || rej)
    // 149's grey badge beside the small kind line (round 4's recipe, D2104)
    const b = mq.badge('149', innerWidth < 600); b.style.marginLeft = '6px'
    row.querySelector('.nm-kind').appendChild(b)
    for (const e of row.querySelectorAll('[contenteditable="true"]')) e.setAttribute('contenteditable', 'false')
    mq.mark(row, 'F19', 'br', 'b')
    // beside it, faint: 149's change not yet published — the pending amber of the app's "not the issued document"
    // grammar (03-week.css .dprev-bar.work b, #F2D699), in the quiet grey line's type, faded; under the row's times
    const ln = mq.quiet(['15:00–17:00 · not yet published by 149'])
    ln.style.color = '#F2D699'; ln.style.opacity = '.62'
    const x0 = row.querySelector('.t-s').getBoundingClientRect().left - row.getBoundingClientRect().left
    ln.style.padding = `0 8px 7px ${Math.round(x0)}px`
    row.after(ln)
    const span = document.createElement('span'); span.setAttribute('data-mine', '1'); span.style.display = 'inline-block'
    span.textContent = ln.firstChild.textContent; ln.firstChild.textContent = ''; ln.firstChild.appendChild(span)
    // the tag at the line's right on a desktop; on a phone, where the row has no room beside it, inside the line's box
    if (innerWidth < 600) { ln.style.position = 'relative'; mq.mark(ln, 'F19', 'br', 'b') } else mq.mark(span, 'F19', 'right', 'b')
    // the cross-squadron people warning on 142's own 14:30 line (the app's own "Conflict with a request" item)
    const wi = [...tue.querySelectorAll('.witem')].find(x => /Sim BOX/.test(x.innerText))
    if (!wi) return { err: 'no BOX warning: ' + [...tue.querySelectorAll('.witem')].map(x => x.innerText).join(' | ') }
    const was = wi.querySelector('.wtx').innerText.replace(/\s+/g, ' ')
    const wtx = wi.querySelector('.wtx'), code = wtx.querySelector('.wcode')
    for (const n of [...wtx.childNodes]) if (n !== code) { if (n.nodeType === 3) n.nodeValue = ''; else mq.hide(n) }
    const bn = document.createElement('b'); bn.textContent = 'Saber'; bn.setAttribute('data-mine', '1')
    const rest = document.createTextNode(" is still on 149's issued ACADEMICS 14:00 — it changes when 149 publishes.")
    wtx.append(bn, rest)
    mq.mark(wi, 'New · H6', 'br')
    const box = [...tue.querySelectorAll('.pl-row')].find(r => /^\s*BOX/.test(r.innerText))
    window.__mqTop = head; window.__mqBot = [...body.children].filter(s => !s.hasAttribute('data-mqhid')).pop(); window.__mqCol = tue
    return { ver, hidden, renamed, name, kind, ts, te, was, box: box ? box.innerText.replace(/\s+/g, ' ') : '' }
  })
  if (m.err) throw new Error('C1: ' + m.err)
  await page.waitForTimeout(250)
  const clip = await tallClip(page, { top: '__mqTop', bot: '__mqBot', col: '__mqCol' }); const tall = clip.tall; delete clip.tall
  const f = `R7C1-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, 'C1', sz, 'proposed', `142's schedule, Edit Schedule, Tue 14 Jul, published (day head ${m.ver}, real: four signers). Saber's automatic row "${m.name}" over the small "${m.kind}" is the app's own (an Attach To 149 titled ACADEMICS, ${m.ts}–${m.te}); drawn in: 149's grey badge beside "ATTACH", the times as 149 published them (blue F19), and under them, faint, "15:00–17:00 · not yet published by 149" (blue F19). 142's own Sim BOX 14:30–15:30 holds Saber (a real fill), so the app raises its real warning; its words re-lettered to "Saber is still on 149's issued ACADEMICS 14:00 — it changes when 149 publishes." (pink New · H6; the app's words were "${m.was}"). Hidden between the head and these: ${m.hidden.join(' · ')}. The row's REJECT is hidden (Q4N). Comet re-lettered Saber. The screen is made ${tall}px tall at the same width so the frame fits one picture.`)
  notes.push(`C1 ${sz}: ${JSON.stringify(m)}`)
  touched.add('C1: the row\'s REJECT button hidden (Q4N\'s plain row; the brief names no REJECT)')
  touched.add('C1: Comet\'s own 2nd-wave SDO on the demo Tuesday handed to Anvil, so the one clash is the cross-squadron one')
  touched.add('C1: the other two warnings the BOX fill raises ("Misses AMT brief / debrief: ACADEMICS 14:00–16:00") stay in the list, re-lettered only — they too are cross-squadron people warnings the brief does not word')
  touched.add('C1: the faint pending line\'s look — no "faint" text style exists for a row; drawn in the quiet grey line\'s type, in the pending amber (#F2D699) faded')
  touched.add('C1: Common Programme, Flying waves, Duties, Ground programme, Personal inputs, Available crew and SANS avail hidden to bring the issues list, Sims and Unavailable into one frame')
  await ctx.close()
}

// ---------- C2 · the input window from that row ----------
async function itC2(sz) {
  const { ctx, page } = await c1World(sz)
  await page.evaluate(() => { const t = window.__mq.days()[1]; t.scrollIntoView({ inline: 'start', block: 'nearest' }); const r = t.querySelector('[data-inprow="mq-att"]'); r.scrollIntoView({ block: 'center' }); r.querySelector('.inpedit').click() })
  await page.waitForSelector('#inpEditDel', { state: 'attached', timeout: 8000 })
  await page.waitForTimeout(700)
  const ws = await page.evaluate(() => {
    const mq = window.__mq
    const d0 = document.querySelector('#inpEditDel')
    let win = d0; while (win && !/floatwin|fwin|inpedwin/.test(win.className + '')) win = win.parentElement
    if (!win) win = d0.closest('#inpEditPop')
    if (!win) return { err: 'no frame' }
    const title = (win.querySelector('h2, h3, .fw-title, .floatwin-title') || {}).textContent
    mq.reletter(win, { Comet: 'Saber' })
    for (const i of win.querySelectorAll('.inped-f input, .inped-f select, .inped-f textarea')) i.disabled = true
    const fieldBy = lab => [...win.querySelectorAll('.inped-f')].find(f => { const k = f.querySelector('.inped-k'); return k && k.textContent.trim().toLowerCase() === lab })
    const rmF = fieldBy('remarks'); if (rmF) for (const c of rmF.querySelectorAll('input[type="checkbox"]')) mq.hide(c.closest('label') || c.parentElement)
    const docF = fieldBy('document'); if (docF) mq.hide(docF)
    for (const e of win.querySelectorAll('*')) if (!e.children.length && /^The dates are changed/.test(e.textContent.trim())) mq.hide(e)
    const firstF = win.querySelector('.inped-f')
    const note = document.createElement('div'); note.setAttribute('data-mine', '1')
    note.textContent = "Set by 149's plan"
    note.style.cssText = 'font-size:12px;opacity:.7;padding:2px 0 8px'
    firstF.parentElement.insertBefore(note, firstF)
    const del = win.querySelector('#inpEditDel')
    del.textContent = 'Take him off ACADEMICS'
    const foot = del.parentElement
    const why = document.createElement('div'); why.setAttribute('data-mine', '1')
    why.style.cssText = 'flex:1 1 100%;font-size:12px;color:var(--ink-2);margin-top:4px;line-height:1.45;padding-bottom:20px'
    const s1 = document.createTextNode('His seat is left empty; 149 is told. ')
    const s2 = document.createElement('span'); s2.setAttribute('data-mine', '1'); s2.textContent = 'Until 149 publishes, he stays on its issued ACADEMICS.'
    why.append(s1, s2)
    foot.style.flexWrap = 'wrap'
    foot.appendChild(why)
    const save = [...foot.querySelectorAll('button')].find(b => /^save$/i.test(b.textContent.trim())); if (save) mq.hide(save)
    // any other door the published day adds to the foot is listed, not hidden
    const btns = [...foot.querySelectorAll('button')].filter(b => !b.hasAttribute('data-mqhid')).map(b => b.textContent.trim())
    for (const e of win.querySelectorAll('.inped-f svg, .inped-f [class*="pencil"], .inped-f [class*="edit-ic"]')) mq.hide(e.closest('button') || e)
    // the window's own panel: the narrowest frame round the title and the Delete (the layer behind it is screen-wide)
    const titleEl = [...win.querySelectorAll('*')].find(e => e.children.length === 0 && /·\s*14 Jul/.test(e.textContent))
    let panel = del; while (panel.parentElement && !(titleEl && panel.contains(titleEl))) panel = panel.parentElement
    window.__mqWin = win; window.__mqPanel = panel
    return { title, save: !!save, btns, fields: [...win.querySelectorAll('.inped-k')].filter(mq.vis).map(k => k.textContent.trim()) }
  })
  if (ws.err) throw new Error('C2: ' + ws.err)
  await page.waitForTimeout(200)
  await page.evaluate(() => {
    const mq = window.__mq, win = window.__mqWin
    mq.mark(win.querySelector('#inpEditDel'), 'D2149', 'right', 'b')
    const s2 = [...win.querySelectorAll('[data-mine] span[data-mine]')].find(x => /^Until 149/.test(x.textContent))
    // the second sentence starts its own line, so its ring holds it whole (the words unchanged)
    s2.style.display = 'block'; s2.style.width = 'fit-content'; s2.style.marginTop = '2px'
    mq.mark(s2, 'New · H6', 'below')
  })
  const clip = await page.evaluate(() => {
    const r = window.__mqPanel.getBoundingClientRect(), pad = 8
    const x = Math.max(0, r.left - pad), y = Math.max(0, r.top - pad)
    return { x, y, width: Math.min(innerWidth - x, r.width + pad * 2), height: Math.min(innerHeight - y, r.height + pad * 2 + 18) }
  })
  const f = `R7C2-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, 'C2', sz, 'proposed', `The input window opened by pressing "ACADEMICS · 149" on 142's published Tuesday (the app's own window, "${(ws.title || '').trim()}", Comet re-lettered Saber). As Q4N drew it: "Set by 149's plan" above the fields, the fields shown but not changeable, no Save; the Delete re-lettered "Take him off ACADEMICS" (blue D2149) with under it "His seat is left empty; 149 is told. Until 149 publishes, he stays on its issued ACADEMICS." — the second sentence new (pink New · H6). Fields shown: ${ws.fields.join(', ')}; buttons left: ${ws.btns.join(', ')}.`)
  notes.push(`C2 ${sz}: ${JSON.stringify(ws)}`)
  touched.add('C2: the window\'s Document field, its remarks "till" tick and its dates note hidden (as Q4N did: nothing there is his to change)')
  await ctx.close()
}

// ---------- C3 · Saber's own view ----------
// 142's Monday, published by 142's own four; 149's VL in the 1st wave stands in for 149's published line, its take-off
// moved to 14:00 (a real edit of the line before publishing, so the bell's "14:00" and the in-time "13:00" agree with
// it). Signed in as the demo's member (Ranger, who flies in VL's second jet), re-lettered Saber; VL's lead and WSOs
// re-lettered with 149's names (Hawk, Spur, Talc). Drawn in: 149's grey badge on the line (round 5's T look: after the
// mission on a desktop, under it, lined up on the left, on a phone), and the wave's in-time line for VL re-lettered as
// the brief's example.
const C3MAP = { Saber: 'Hawk', Ranger: 'Saber', Echo: 'Spur', Static: 'Talc' }
async function c3World(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  const ok = await page.evaluate(() => { const a = window.txtSet('ff:0.0.0.to', '14:00'); const b = window.txtSet('ff:0.0.0.ld', '15:25'); window.afterSchedMutate(); return [a, b] })
  await page.waitForTimeout(400)
  await publish(page, 0)
  await page.waitForTimeout(800)
  await page.evaluate(() => [...document.querySelectorAll('.topbar button')].find(b => b.textContent.trim() === 'Logout').click())
  await login(page, 'us', 'us')
  await page.addStyleTag({ content: MARK_CSS })
  await page.evaluate(() => window.go('viewsched'))
  await page.waitForSelector('#page-viewsched.on #vWeek .day'); await page.waitForTimeout(900)
  return { ctx, page, ok }
}
async function itC3(sz) {
  const { ctx, page, ok } = await c3World(sz)
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
  const m = await page.evaluate(({ MAP }) => {
    const mq = window.__mq, mon = mq.days('#vWeek')[0]
    const head = mon.querySelector('.day-head'), body = mon.querySelector('.day-body')
    const g = mon.querySelector('.go'); if (!g) return { err: 'no wave' }
    const forms = [...g.querySelectorAll('.form')]
    const vl = forms.find(f => f.querySelector('.csmsn .ntx').textContent.trim() === 'VL')
    if (!vl) return { err: 'no VL' }
    const hidden = []
    const sec = g.closest('.dsec') || g
    let seen = false
    for (const s of [...body.children]) {
      if (s === sec) { seen = true; continue }
      if (!seen) hidden.push(s.innerText.replace(/\s+/g, ' ').replace(/^\W+/, '').trim().slice(0, 22))
      mq.hide(s)
    }
    if (sec !== g) for (const og of [...sec.querySelectorAll('.go')].slice(1)) mq.hide(og)
    const so = mon.querySelector('.signoff.day-sign'); let soHidden = false
    if (so && /ORIG/.test(head.innerText)) { mq.hide(so); soHidden = true }
    const before = vl.innerText.replace(/\s+/g, ' ')
    mq.reletter(mon, MAP); mq.reletter(document.querySelector('.topbar'), MAP)
    const to = (vl.querySelector('.ld .tox') || {}).textContent
    // 149's grey badge on the line: round 5's T look
    const cell = vl.querySelector('.csmsn'), msn = cell.querySelector('i')
    const phone = innerWidth < 600
    const c = mq.badge('149', phone)
    if (!phone) { c.style.marginLeft = '5px'; c.style.position = 'relative'; c.style.top = '-1px'; msn.appendChild(c) }
    else { c.style.display = 'block'; c.style.width = 'fit-content'; c.style.marginTop = '2px'; msn.after(c); c.style.alignSelf = 'flex-start'; c.style.marginLeft = '0px'; c.style.marginLeft = (mq.textLeft(msn) - c.getBoundingClientRect().left).toFixed(2) + 'px' }
    // the wave's reporting notes: VL's own in-time line, its words re-lettered as the brief's example
    const it = g.querySelector('.intimes')
    const itl = it ? [...it.children].find(l => /\bVL\b/.test(l.textContent)) : null
    if (!itl) return { err: 'no VL in-time line' }
    const itWas = itl.textContent
    itl.textContent = ''; const its = document.createElement('span'); its.setAttribute('data-mine', '1'); its.style.display = 'inline-block'; its.textContent = 'In 13:00 · Brief room 2'; itl.appendChild(its)
    // RU's in-time line is 142's own; it stays
    window.__mqVL = vl; window.__mqIT = itl.firstChild; window.__mqG = g; window.__mqMon = mon
    return { day: head.innerText.replace(/\s+/g, ' ').slice(0, 60), hidden, soHidden, before, after: vl.innerText.replace(/\s+/g, ' '), to, itWas, who: document.querySelector('.topbar').innerText.replace(/\s+/g, ' ').slice(-30) }
  }, { MAP: C3MAP })
  if (m.err) throw new Error('C3: ' + m.err)
  if (!/ORIG/.test(m.day)) throw new Error('C3: Monday is not published on the member\'s view: ' + m.day)
  if (m.to !== '14:00') throw new Error('C3: VL take-off is ' + m.to)
  await page.waitForTimeout(200)
  await page.evaluate(() => { const mq = window.__mq; mq.mark(window.__mqVL, 'F20', 'br', 'b'); mq.mark(window.__mqIT, 'New · L2', 'right') })
  const clip = await page.evaluate(() => {
    const g = window.__mqG, mon = window.__mqMon
    let r = g.getBoundingClientRect()
    const vl = window.__mqVL.getBoundingClientRect()
    if (vl.bottom > innerHeight - 4) { window.scrollBy(0, vl.bottom - innerHeight + 30); r = g.getBoundingClientRect() }
    const right = innerWidth < 600 ? innerWidth : Math.min(innerWidth, mon.getBoundingClientRect().right + 8)
    return { x: 0, y: 0, width: right, height: Math.min(innerHeight, Math.round(window.__mqVL.getBoundingClientRect().bottom + 30)) }
  })
  const f = `R7C3-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, 'C3', sz, 'proposed', `Saber's own schedule, View-only Sched, Mon 13 Jul, as a member sees it (the demo's member, Ranger, re-lettered Saber; ${m.who.trim()} in the top bar). 149's published line he is on: VL, the demo's 1st wave standing in for 149's (VL's take-off moved to 14:00 by a real edit before 142 published Monday), read only, wearing 149's grey badge (blue F20); Saber in its second jet, Hawk, Spur and Talc 149's (re-lettered). The wave's reporting note for VL, the app's own in-time line at the head of the wave, re-lettered "In 13:00 · Brief room 2" (pink New · L2; it read "${m.itWas.trim()}"). Hidden between the day head and the wave: ${m.hidden.join(' · ')}${m.soHidden ? ' · the empty sign-off boxes' : ''}; the day's other waves hidden.`)
  notes.push(`C3 ${sz}: ${JSON.stringify({ ok, ...m })}`)
  // the bell, open: his one line
  const bb = page.locator('.bellbtn').filter({ visible: true }).first()
  if (sz === 'p') await bb.tap(); else await bb.click()
  await page.waitForSelector('[data-testid="bell-list"]'); await page.waitForTimeout(500)
  const bl = await page.evaluate(() => {
    const mq = window.__mq
    const today = [...document.querySelectorAll('[data-testid="bell-list"] .bl-line, [data-testid="bell-list"] .bl-empty')].map(l => l.textContent.replace(/\s+/g, ' ').trim())
    const n = mq.bellLine('149 planned you · Mon 13 Jul 14:00')
    mq.mark(n, 'F20', 'br', 'b')
    window.__mqBell = document.querySelector('[data-testid="bell-list"]')
    return { today }
  })
  await page.waitForTimeout(200)
  const clip2 = await page.evaluate(() => {
    const r = window.__mqBell.getBoundingClientRect(), bell = [...document.querySelectorAll('.bellbtn')].find(x => x.offsetParent !== null).getBoundingClientRect()
    const phone = innerWidth < 600, x = phone ? 0 : Math.max(0, Math.min(r.left, bell.left) - 240), y = 0
    return { x, y, width: innerWidth - x, height: Math.min(innerHeight, r.bottom + 16) }
  })
  const f2 = `R7C3b-${sz}-proposed.png`
  await shot(page, f2, clip2)
  rec(f2, 'C3', sz, 'proposed', `Saber's bell, open (pressed for real; the app's own list said: ${bl.today.map(x => `"${x}"`).join(', ')}). Drawn in, in the bell's own line markup, unread, the bell lit: "149 planned you · Mon 13 Jul 14:00" (blue F20).`)
  notes.push(`C3b ${sz}: ${JSON.stringify(bl)}`)
  touched.add('C3: VL\'s take-off moved to 14:00 (landing 15:25) on the demo Monday, so the bell\'s 14:00 and the in-time 13:00 agree with the line')
  touched.add('C3: the badge goes on the line (as the brief words it), not on the wave\'s title as round 5\'s shared wave had it (D2124)')
  touched.add('C3: the reporting note stands where the app shows a wave\'s in-time lines — at the head of the wave, above the lines — not under the line')
  touched.add('C3/C4: the bell line\'s words are written whole on its first row; the line\'s second row and its age are left empty (the brief gives no age, and the app\'s lines split name, day and what)')
  await ctx.close()
}

// ---------- C4 · the fourth sentence (F8) ----------
// 142's schedule, Mon 13 Jul, 142 having published Monday. The 1st wave stands in for 149's (round 5's shared-wave look):
// VL and its in-time line are 149's, hidden; RU is 142's. Then 142 changes RU for real: Tally into the seat Relay had
// (the demo's Relay stands in for Viper). On a published day the app draws its own pending mark on the changed seat —
// the hollow, dotted ALn tag (D92, D93). Drawn in: 149's grey badge on the wave's title and the quiet grey line under it.
async function itC4(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  await publish(page, 0)
  await page.waitForTimeout(600)
  const ok = await page.evaluate(({ TALLY }) => { const a = window.setSlotVal('0.0.1.1.w', TALLY); window.afterSchedMutate(); return a }, { TALLY })
  if (!ok) throw new Error('C4: Tally refused in RU\'s seat')
  await page.waitForTimeout(700)
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
  const m = await page.evaluate(() => {
    const mq = window.__mq, mon = mq.days()[0]
    const head = mon.querySelector('.day-head'), body = mon.querySelector('.day-body')
    const g = mon.querySelector('.go')
    const forms = [...g.querySelectorAll('.form')]
    const nm = f => f.querySelector('.csmsn .ntx').textContent.trim()
    const ru = forms.find(x => nm(x) === 'RU'), vl = forms.find(x => nm(x) === 'VL')
    if (!ru || !vl) return { err: 'RU/VL' }
    const seat = ru.querySelector('[data-slot="0.0.1.1.w"]')
    const aln = seat.getAttribute('data-aln'), who = seat.innerText.replace(/\s+/g, ' ').trim()
    if (!aln) return { err: 'no pending mark on the changed seat: ' + seat.outerHTML.slice(0, 300) }
    const hidden = []
    const sec = g.closest('.dsec') || g
    let seen = false
    for (const s of [...body.children]) {
      if (s === sec) { seen = true; continue }
      if (!seen) hidden.push(s.innerText.replace(/\s+/g, ' ').replace(/^\W+/, '').trim().slice(0, 22))
      mq.hide(s)
    }
    if (sec !== g) for (const og of [...sec.querySelectorAll('.go')].slice(1)) mq.hide(og)
    const so = mon.querySelector('.signoff.day-sign'); if (so && /ORIG/.test(head.innerText)) { mq.hide(so); hidden.unshift('the empty sign-off boxes, waiting for the next amendment') }
    mq.hide(vl); mq.hideItLine = null
    const box = g.querySelector('.intimes'); let itHidden = 0
    if (box) for (const l of [...box.children]) if (!l.classList.contains('itx') && /\bVL\b/.test(l.textContent)) { mq.hide(l); itHidden++; const x = l.nextElementSibling; if (x && x.classList.contains('itx')) mq.hide(x) }
    const itb = g.querySelector('[data-itadd]'); if (itb) mq.hide(itb)
    // Relay's title (the changed seat's "was") re-lettered Viper, wherever the day says it
    mq.reletter(mon, { Relay: 'Viper' })
    const tab = g.querySelector('.go-tab')
    const b = mq.badge('149'); b.style.marginLeft = '8px'; tab.querySelector('.asd').after(b)
    const q = mq.quiet(['RU changed · goes out when 149 publishes'])
    const name = tab.querySelector('.ntx') || tab.querySelector('.asd')
    q.style.padding = `0 10px 6px ${Math.round(name.getBoundingClientRect().left - tab.getBoundingClientRect().left)}px`
    q.style.background = getComputedStyle(tab).backgroundColor
    tab.after(q)
    window.__mqQ = q; window.__mqSeat = seat; window.__mqG = g; window.__mqMon = mon
    const changed = [...ru.querySelectorAll('[data-aln]')].map(e => e.className + '=' + e.getAttribute('data-aln'))
    return { day: head.innerText.replace(/\s+/g, ' ').slice(0, 70), hidden, itHidden, aln, who, changed, tab: tab.innerText.replace(/\s+/g, ' ') }
  })
  if (m.err) throw new Error('C4: ' + m.err)
  if (!/ORIG/.test(m.day)) throw new Error('C4: Monday not published: ' + m.day)
  await page.waitForTimeout(200)
  await page.evaluate(() => { const mq = window.__mq; mq.mark(window.__mqQ.firstChild, 'F8', 'right', 'b'); window.__mqQ.firstChild.style.width = 'fit-content'; mq.mark(window.__mqSeat, 'F8', 'below', 'b') })
  const clip = await page.evaluate(() => {
    const g = window.__mqG, mon = window.__mqMon
    let r = g.getBoundingClientRect()
    if (r.bottom > innerHeight - 4) { window.scrollBy(0, r.bottom - innerHeight + 8); r = g.getBoundingClientRect() }
    const right = innerWidth < 600 ? innerWidth : Math.min(innerWidth, mon.getBoundingClientRect().right + 8)
    return { x: 0, y: 0, width: right, height: Math.min(innerHeight, Math.round(r.bottom + 8)) }
  })
  const f = `R7C4-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, 'C4', sz, 'proposed', `142's schedule, Edit Schedule, Mon 13 Jul, published by 142 (day head real). RU, 142's line, inside 149's wave (round 5's shared-wave look: the wave's title wears 149's grey badge; 149's VL and its in-time line hidden). 142 changed RU for real: Tally into the seat Viper had (the demo's Relay stands in for Viper); the app draws its own pending mark on the changed seat, the hollow dotted AL${m.aln} tag (blue F8). Under the wave's title the quiet grey line "RU changed · goes out when 149 publishes" (blue F8). Hidden between the day head and the wave: ${m.hidden.join(' · ')}.`)
  notes.push(`C4 ${sz}: ${JSON.stringify(m)}`)
  touched.add('C4: the "pending dots" are the app\'s own pending mark on a published day — the hollow dotted ALn tag on the changed seat (D92, D93); no other dot is drawn')
  await ctx.close()
  // 149's schedulers' bell: 142's app stands in, its top bar re-lettered 149 and its admin Ace
  const w2 = await world(sz)
  await toEdit(w2.page)
  const bb = w2.page.locator('.bellbtn').filter({ visible: true }).first()
  if (sz === 'p') await bb.tap(); else await bb.click()
  const opened = await w2.page.waitForSelector('[data-testid="bell-list"]', { timeout: 5000 }).then(() => true, () => false)
  if (!opened) throw new Error('C4b: the admin\'s bell did not open its list (it went to a waiting question)')
  await w2.page.waitForTimeout(500)
  const bl = await w2.page.evaluate(() => {
    const mq = window.__mq
    const today = [...document.querySelectorAll('[data-testid="bell-list"] .bl-line, [data-testid="bell-list"] .bl-empty')].map(l => l.textContent.replace(/\s+/g, ' ').trim())
    mq.topbar('149', { Saber: 'Ace' })
    const n = mq.bellLine('142 changed RU on Mon 13 Jul · publish to send it')
    mq.mark(n, 'F8', 'br', 'b')
    window.__mqBell = document.querySelector('[data-testid="bell-list"]')
    return { today }
  })
  await w2.page.waitForTimeout(200)
  const clip2 = await w2.page.evaluate(() => {
    const r = window.__mqBell.getBoundingClientRect(), bell = [...document.querySelectorAll('.bellbtn')].find(x => x.offsetParent !== null).getBoundingClientRect()
    const phone = innerWidth < 600
    const x = 0
    return { x, y: 0, width: Math.min(innerWidth - x, Math.max(r.right, bell.right, innerWidth - 4) - x), height: Math.min(innerHeight, Math.max(r.top + 260, Math.min(r.bottom, r.top + 360)) + 10) }
  })
  const f2 = `R7C4b-${sz}-proposed.png`
  await shot(w2.page, f2, clip2)
  rec(f2, 'C4', sz, 'proposed', `149's schedulers' bell, open (142's app stands in: its top bar re-lettered 149, its admin Ace; the list pressed open for real, ${bl.today.length} line(s) of the demo's own under it). Drawn in at the top, in the bell's own line markup, unread: "142 changed RU on Mon 13 Jul · publish to send it" (blue F8).`)
  notes.push(`C4b ${sz}: ${JSON.stringify(bl)}`)
  touched.add('C4b/C5: the signed-in admin\'s name in the top bar re-lettered Ace (an admin of 149), so "Saber" names only 142\'s man')
  await w2.ctx.close()
}

// ---------- C5 · two schedulers on one shared line (R9) ----------
// 149's schedule, Tue 14 Jul: 142's Tuesday stands in, its top bar re-lettered 149 and its admin Ace. The 1st wave is
// 149's; RU in it is 142's, wearing round 5's grey "142" tag (after the mission on a desktop, under it on a phone). Ace has
// signed the four boxes, so "Publish day" is live. Drawn in: the editing mark on RU — the app has none built (the day
// lock is D1751's, unbuilt); the chip is the day head's own read-only chip (.dbeak.ro.work, the pending amber, dashed:
// "someone's working copy, not the issued one") under RU — and 149's Publish card, the app's one card for a question
// hanging from the control pressed (.askcard, D1626), hanging from "Publish day", its warning line and "Publish day".
async function itC5(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  await page.evaluate(({ S }) => { const g = window.signOf(1); Object.assign(g, S); window.afterSchedMutate() }, { S: SIGN })
  await page.waitForTimeout(700)
  await page.evaluate(() => { const t = window.__mq.days()[1]; t.scrollIntoView({ inline: 'start', block: 'nearest' }); window.scrollTo(window.scrollX, 0) })
  await page.waitForTimeout(300)
  const m = await page.evaluate(() => {
    const mq = window.__mq, tue = mq.days()[1]
    const head = tue.querySelector('.day-head'), body = tue.querySelector('.day-body')
    const pub = [...head.querySelectorAll('button')].find(b => /Publish day/.test(b.textContent))
    if (!pub || pub.disabled) return { err: 'Publish day not live: ' + head.innerText.replace(/\s+/g, ' ') }
    const g = tue.querySelector('.go'), sec = g.closest('.dsec') || g
    const hidden = []
    let seen = false
    for (const s of [...body.children]) {
      if (s === sec) { seen = true; continue }
      if (!seen) hidden.push(s.innerText.replace(/\s+/g, ' ').replace(/^\W+/, '').trim().slice(0, 22))
      mq.hide(s)
    }
    if (sec !== g) for (const og of [...sec.querySelectorAll('.go')].slice(1)) mq.hide(og)
    mq.topbar('149', { Saber: 'Ace' })
    const forms = [...g.querySelectorAll('.form')]
    const ru = forms.find(x => x.querySelector('.csmsn .ntx').textContent.trim() === 'RU')
    if (!ru) return { err: 'no RU' }
    // the "142" tag on RU, round 5's T look
    const cell = ru.querySelector('.csmsn'), msn = cell.querySelector('i'), phone = innerWidth < 600
    const c = mq.badge('142', phone)
    if (!phone) { c.style.marginLeft = '5px'; c.style.position = 'relative'; c.style.top = '-1px'; msn.appendChild(c) }
    else { c.style.display = 'block'; c.style.width = 'fit-content'; c.style.marginTop = '2px'; msn.after(c); c.style.alignSelf = 'flex-start'; c.style.marginLeft = '0px'; c.style.marginLeft = (mq.textLeft(msn) - c.getBoundingClientRect().left).toFixed(2) + 'px' }
    // the editing mark under RU's line, lined up with its callsign
    const ed = document.createElement('div'); ed.setAttribute('data-mine', '1')
    const chip = document.createElement('span'); chip.className = 'dbeak ro work'; chip.setAttribute('data-mine', '1'); chip.textContent = 'Saber (142) – editing Tue'
    chip.style.display = 'inline-block'
    ed.appendChild(chip)
    const x0 = ru.querySelector('.csmsn .ntx').getBoundingClientRect().left - ru.getBoundingClientRect().left
    ed.style.cssText = `grid-column:1/-1;padding:2px 8px 6px ${Math.max(6, Math.round(x0))}px`
    ru.after(ed)
    // the Publish card: the app's .askcard, hanging below "Publish day"
    const card = document.createElement('div'); card.className = 'askcard ac-below ac-over'; card.setAttribute('data-mine', '1'); card.setAttribute('role', 'dialog')
    const warnSrc = document.querySelector('.witem.hard .wbar') ? null : null
    const q = document.createElement('div'); q.className = 'askcard-q'; q.textContent = 'Saber (142) is editing RU.'
    const btns = document.createElement('div'); btns.className = 'askcard-btns'
    const go = document.createElement('button'); go.type = 'button'; go.className = 'abtn primary'; go.textContent = 'Publish day'
    btns.appendChild(go); card.append(q, btns)
    const host = document.querySelector('#page-editsched') || document.body
    host.appendChild(card)
    const pr = pub.getBoundingClientRect(), cw = card.getBoundingClientRect().width
    const left = Math.max(8, Math.min(innerWidth - cw - 8, pr.left + pr.width / 2 - 26))
    card.style.left = left + 'px'; card.style.top = (pr.bottom + 9) + 'px'
    card.style.setProperty('--ac-px', Math.round(pr.left + pr.width / 2 - left) + 'px')
    window.__mqEd = chip; window.__mqCard = card; window.__mqHead = head; window.__mqRU = ru; window.__mqEdRow = ed; window.__mqTue = tue
    // the warning line in the app's warning ink: the issues list's own hard colour
    const hard = document.querySelector('.daywarn.hard b')
    const hc = hard ? getComputedStyle(hard).color : ''
    return { hidden, pubTitle: pub.title, signed: head.innerText.replace(/\s+/g, ' ').slice(0, 120), hc, go: getComputedStyle(go).opacity }
  })
  if (m.err) throw new Error('C5: ' + m.err)
  await page.waitForTimeout(200)
  // the card must not cover RU's editing mark
  const cover = await page.evaluate(() => { const a = window.__mqCard.getBoundingClientRect(), b = window.__mqEd.getBoundingClientRect(); return !(a.bottom < b.top || a.top > b.bottom || a.right < b.left || a.left > b.right) })
  if (cover) throw new Error('C5: the card covers the editing mark')
  await page.evaluate(() => { const mq = window.__mq; mq.mark(window.__mqEd, 'R9', 'right', 'b'); mq.mark(window.__mqCard, 'R9', 'in', 'b') })
  const clip = await page.evaluate(() => {
    const t = window.__mqTue.getBoundingClientRect(), h = window.__mqHead.getBoundingClientRect(), e = window.__mqEdRow.getBoundingClientRect(), c = window.__mqCard.getBoundingClientRect()
    const phone = innerWidth < 600
    const x = phone ? 0 : Math.max(0, t.left - 6), y = Math.max(0, Math.min(h.top, c.top) - 8)
    return { x, y, width: (phone ? innerWidth : Math.min(innerWidth, t.right + 6)) - x, height: Math.min(innerHeight - y, Math.max(e.bottom, c.bottom) + 10 - y) }
  })
  const f = `R7C5-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, 'C5', sz, 'proposed', `149's schedule, Edit Schedule, Tue 14 Jul (142's Tuesday stands in; top bar re-lettered 149, its admin Ace). The four boxes signed for real, so "Publish day" is live. RU, 142's line in 149's wave, wears the grey "142" tag (round 5). Drawn in: under RU, the editing mark "Saber (142) – editing Tue" (blue R9), in the day head's own read-only chip, its pending-amber dashed look; and 149's Publish card hanging from "Publish day", in the app's own question card (.askcard), its warning line "Saber (142) is editing RU." and "Publish day" still pressable (blue R9). Hidden between the day head and the wave: ${m.hidden.join(' · ')}.`)
  notes.push(`C5 ${sz}: ${JSON.stringify(m)}`)
  touched.add('C5: the editing mark — the app has no editing mark built (D1751\'s day lock is unbuilt); drawn as the day head\'s read-only chip in the pending amber (.dbeak.ro.work), under RU\'s line')
  touched.add('C5: the Publish card — "Publish day" publishes at once today, with no card; drawn as the app\'s one question card (.askcard, D1626) hanging from it; the brief names no second button, so none is drawn (a press outside closes an askcard)')
  touched.add('C5: the card\'s warning line is in the card\'s own question type; no warning colour added')
  await ctx.close()
}

// ---------- C6 · the printed day (M12) ----------
// The real export: "Export as PDF (print)" pressed on Edit Schedule; the app builds its print document into a hidden
// frame. The frame is caught before it prints, and its document shown as a page of its own. Today: its heading reads
// "142 — Flying Programme" on 149's schedule (142's app stands in) — ringed pink New · M12. Proposed: "149 — …".
// The print view is an A4 sheet with no phone layout: desktop only.
async function itC6(sz) {
  if (sz !== 'd') return
  const { ctx, page } = await world(sz)
  await toEdit(page)
  await publish(page, 0); await page.waitForTimeout(400)
  // the export buttons stand on Edit Schedule's tool row
  await page.waitForTimeout(300)
  await page.evaluate(() => {
    window.__mqPrint = null
    new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.tagName === 'IFRAME') { const f = n; const grab = () => { if (f.srcdoc && !window.__mqPrint) { window.__mqPrint = f.srcdoc; f.remove() } }; new MutationObserver(grab).observe(f, { attributes: true }); setTimeout(grab, 0) } }).observe(document.body, { childList: true })
  })
  const btn = page.locator('#exportPdf').filter({ visible: true }).first()
  await btn.click()
  await page.waitForFunction(() => !!window.__mqPrint, null, { timeout: 5000 })
  const html = await page.evaluate(() => window.__mqPrint)
  await ctx.close()
  const title0 = (html.match(/<title>([^<]*)<\/title>/) || [])[1]
  for (const kind of ['today', 'proposed']) {
    const c2 = await browser.newContext(SIZES.d.opts)
    const p = await c2.newPage()
    await p.setContent(kind === 'today' ? html : html.replace(/<title>142 Flying Programme/, '<title>149 Flying Programme').replace('<h1>142 — Flying Programme</h1>', '<h1>149 — Flying Programme</h1>'))
    // the sheet's own @page margins (14mm 12mm) drawn as the page's padding, as the paper shows them
    await p.addStyleTag({ content: MARK_CSS + 'body{padding:14mm 12mm}' }); await p.evaluate(kit)
    const info = await p.evaluate(() => {
      const h1 = document.querySelector('header h1')
      const s = document.createElement('span'); s.setAttribute('data-mine', '1'); s.textContent = h1.textContent; h1.textContent = ''; h1.appendChild(s); s.style.display = 'inline-block'
      window.__mq.mark(s, 'New · M12', 'right')
      return { h1: s.firstChild.textContent, title: document.title }
    })
    const clip = await p.evaluate(() => { const r = document.querySelector('section.day').getBoundingClientRect(); return { x: 0, y: 0, width: innerWidth, height: Math.min(innerHeight, r.bottom + 12) } })
    const f = `R7C6-d-${kind}.png`
    const bad = await p.evaluate(() => window.__mq.checkTags()); if (bad.length) throw new Error(f + bad.join(';'))
    await p.screenshot({ path: `${PAGEIMG}/${f}`, clip }); copyFileSync(`${PAGEIMG}/${f}`, `${OUT}/${f}`); console.log('  wrote', f)
    rec(f, 'C6', 'd', kind, kind === 'today'
      ? `The printed week as the app makes it today ("Export as PDF (print)" pressed on Edit Schedule; the print document caught before the print dialog and shown at the desktop's width, its @page margins drawn round it as on paper; its top and first day). On 149's schedule (142's app stands in) its heading reads "${info.h1}" (pink New · M12), and its title — the PDF's name and the print dialog's header, which the page itself does not show — reads "${info.title}". Both are fixed to 142 in the app. Desktop only: the print view is an A4 sheet with no phone layout.`
      : `The same printed week, proposed: the heading reads "${info.h1}" (pink New · M12) and the title "${info.title}" — the schedule's own squadron. Desktop only: the print view is an A4 sheet with no phone layout.`)
    notes.push(`C6 ${kind}: ${JSON.stringify(info)} (caught title "${title0}")`)
    await c2.close()
  }
  touched.add('C6: the print document\'s title shows nowhere on the page (it is the PDF\'s name and the print dialog\'s header); its words are given in the caption, not drawn')
  touched.add('C6: the print document is shown at the desktop size (1536 wide); on paper it is A4. No phone picture: the print view has no phone layout')
}

const ITEMS = { c1: itC1, c2: itC2, c3: itC3, c4: itC4, c5: itC5, c6: itC6 }
browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
try {
  for (const [k, fn] of Object.entries(ITEMS)) {
    if (ONLY && !ONLY.includes(k)) continue
    for (const sz of k === 'c3' ? ['p', 'd'] : ['d', 'p']) {
      try { await fn(sz) } catch (e) { errs.push(`[${sz}] ${k} FAILED: ${e.message}`); console.log(k, sz, 'FAILED', e.message) }
    }
  }
} finally { await browser.close() }
const mf = 'manifest-r7c.json'
let old = {}
try { old = JSON.parse((await import('node:fs')).readFileSync(`${PAGEIMG}/${mf}`, 'utf8')) } catch {}
const all = JSON.stringify(ONLY ? { ...old, ...manifest } : manifest, null, 2) + '\n'
writeFileSync(`${PAGEIMG}/${mf}`, all); writeFileSync(`${OUT}/${mf}`, all)
console.log('NOTES\n' + notes.join('\n'))
console.log('TOUCHED (not named by the brief)\n- ' + [...touched].join('\n- '))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
