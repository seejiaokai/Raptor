// Multi-squadron & detachment — round 7, Group A: closing a detachment (17 Nov 26, chat 102), drawn on the REAL running
// app by .claude/skills/brainstorming/mockups-on-the-real-app.md, to docs/superpowers/briefs/2026-11-17-multi-sqn-r7-drawing.md
// §Group A. The words are the brief's, letter for letter.
// Built from round 4's kit (docs/mock/2026-11-17-multi-sqn-r4/draw.mjs: kit, world(), toAdmin(), squadrons(),
// adminClip()) and round 3's ask card (docs/mock/2026-11-17-multi-sqn-r3/draw.mjs mq.ask — ui/AskCard.tsx's markup and its
// global stylesheet, 27-ask-card.css). Two mark colours (his D2159): BLUE #0e7fa6 for what he has ruled, PINK #ff2d95 for
// what is new in round 7. Every mark is an outline on the element and a child tag (mq.mark), never laid over the page.
//   A1 · the Close card, pressed Thu 23 Jul 14:00 home — Admin → Squadrons, Exercise North's "Close detachment"
//   A2 · the same card pressed at 23:00 home (Fri 24 06:00 at Exercise North) — the card alone
//   A3 · 249's Sat 25 Jul after Close — Edit Schedule, the demo's Saturday (Jul 18) really published, then really
//        cleared and published again as AL1; date and top bar re-lettered; the sign-off names replaced by one line; the
//        day-head Unpublish greyed with its reason under it; Hawk's input row on Unavailable kept
//   A4 · moving the detachment's "To" earlier — the detachment's row open, To 28 Jul, the question card from the To box
//
// Run from raptor-port/, against a built preview already serving (on his PC the Playwright browser is used; on the
// cloud machine CHROMIUM_PATH's default):
//   MQ_URL=http://localhost:4180/ node docs/mock/2026-11-17-multi-sqn-r7/draw-r7a.mjs
// MQ_ONLY=a1,a3 draws only those. Pictures go to docs/mock/2026-11-17-multi-sqn-r7/img/ and are copied to
// docs/img/2026-11-17-multi-sqn-r7/ with manifest.json. Demo data only.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4180/'
const PAGEIMG = 'docs/mock/2026-11-17-multi-sqn-r7/img'
const OUT = 'docs/img/2026-11-17-multi-sqn-r7'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
mkdirSync(OUT, { recursive: true }); mkdirSync(PAGEIMG, { recursive: true })

const SIZES = {
  d: { name: 'desktop', opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const DET = 'Exercise North', SHORT = '249'
const DET6 = ['Hawk', 'Spur', 'Talc', 'Vane', 'Crisp', 'Moss']
const BLUE = '#0e7fa6', PINK = '#ff2d95'

// ---- the brief's words, letter for letter ----
const A1_LINES = [
  ['Hawk, Spur, Talc, Vane, Crisp and Moss: their DET ends today, Thu 23 Jul ', ['(was 31 Jul)', 'p', 'New · M2'], '. On 149\'s schedule from Fri 24 Jul.', ['b', 'F15']],
  ['Exercise North\'s Fri 24, Sat 25 and Sun 26 Jul: cleared, and an amendment published on each. Later days, never published, are dropped.', ['b', 'F16']],
  ['OIL taken back: Sat 25 Jul, 4 people 1 day, 2 people ½ · Sun 26 Jul, 6 people 1 day. Spur has already used his: his OIL goes to −1.', ['b', 'F17']],
  ['Sat 25 Jul holds 242\'s RU (Kite, Lark): it moves to a wave of 242\'s own, same times, and 242\'s day goes pending for its scheduler.', ['p', 'New · H2']],
  ['149\'s published Fri 24 – Sun 26 Jul go pending: the 6 are free there now, for 149\'s scheduler to plan.', ['b', 'C2']],
  ['Gale was due from Mon 27 Jul: his DET is removed and he is told.', ['b', 'F17']],
  ['Jolt is editing Sun 26 Jul.', ['b', 'F17']],
  ['Kept under Past detachments.', null],
]
// A2: lines 1, 2 and 5 change; the rest as A1. Line 1 carries the brief's pink H1; lines 2 and 5 keep A1's rulings' marks
const A2_LINES = A1_LINES.slice()
A2_LINES[0] = ['It is already Fri 24 Jul at Exercise North (7 h ahead): Fri 24 is kept. Their DET ends Fri 24 Jul (was 31 Jul); on 149\'s schedule from Sat 25 Jul.', ['p', 'New · H1']]
A2_LINES[1] = ['Exercise North\'s Sat 25 and Sun 26 Jul: cleared, and an amendment published on each. Later days, never published, are dropped.', ['b', 'F16']]
A2_LINES[4] = ['149\'s published Sat 25 and Sun 26 Jul go pending: the 6 are free there now, for 149\'s scheduler to plan.', ['b', 'C2']]
const A3_SIGN = 'Cleared when Exercise North was closed · Ace · Thu 23 Jul'
const A3_WHY = 'Published when Exercise North was closed. Correct it with a new amendment.'
const A4_Q = 'Shorten the 6 people\'s DET to 28 Jul?'
const A4_SUB = 'Hawk, Spur, Talc, Vane, Crisp and Moss are on DET to 31 Jul.'

const MARK_CSS = `
.mkq { outline: 2px solid ${PINK} !important; outline-offset: -2px !important; }
.mkq.mkq-o { outline-offset: 2px !important; }
.mkq.mkq-p { outline-offset: 5px !important; }
.mkq.mkq-t { outline-offset: 1px !important; }
.mkq.mkq-b { outline-color: ${BLUE} !important; }
.mkq-tag { position: absolute; z-index: 60; background: ${PINK}; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; }
.mkq-tag.mkq-tb { background: ${BLUE}; }
.toast, .toasts, #toast, #toastEl { display: none !important; }
`

function kit() {
  const mq = {}
  mq.vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  mq.strip = root => {
    const A = ['id', 'data-inprow', 'data-inpedit', 'data-inp', 'data-txt', 'data-slot', 'data-fill', 'data-drag', 'data-inpseat',
      'tabindex', 'data-plangolive', 'data-plandup', 'data-avtog', 'data-planmenu', 'for', 'data-person', 'data-testid', 'contenteditable', 'data-acc', 'data-acck',
      'data-gline', 'data-gdel', 'data-itadd', 'data-sortsec', 'data-air', 'data-wvadd', 'data-acct', 'data-editing', 'data-bfld', 'data-move']
    for (const n of [root, ...root.querySelectorAll('*')]) for (const a of A) n.removeAttribute(a)
    root.setAttribute('data-mine', '1')
    return root
  }
  mq.hide = e => { e.setAttribute('data-mqhid', '1'); e.style.setProperty('display', 'none', 'important') }
  // col: 'p' pink (new in round 7) or 'b' blue (already ruled) — his D2159
  mq.mark = (el, label, where = 'in', col = 'p') => {
    if (where === 'right' && el.getAttribute('data-mine') === '1') el.style.width = 'fit-content'
    const b = el.getBoundingClientRect()
    if (el.getAttribute('data-mine') === '1' && getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.classList.add('mkq'); if (col === 'b') el.classList.add('mkq-b')
    if (where === 'below' || where === 'right' || where === 'left' || where === 'above') el.classList.add('mkq-o')
    if (where === 'pad') el.classList.add('mkq-p')
    const t = document.createElement('span')
    t.className = 'mkq-tag' + (col === 'b' ? ' mkq-tb' : ''); t.textContent = label; t.setAttribute('data-mine', '1')
    if (where === 'pad') { if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; t.style.top = '-12px'; t.style.right = '-10px'; el.appendChild(t) }
    else if (where === 'below') { t.style.top = 'calc(100% + 4px)'; t.style.right = '0'; el.appendChild(t) }
    else if (where === 'above') { t.style.bottom = 'calc(100% + 4px)'; t.style.right = '0'; el.appendChild(t) }
    else if (where === 'right') { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.left = 'calc(100% + 5px)'; el.appendChild(t) }
    else if (where === 'left') { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.right = 'calc(100% + 5px)'; el.appendChild(t) }
    else if (where === 'br') { t.style.bottom = '3px'; t.style.right = '3px'; el.appendChild(t) }
    else if (getComputedStyle(el).position !== 'static') { t.style.top = '1px'; t.style.right = '1px'; el.appendChild(t) }
    else el.insertBefore(t, el.firstChild)
    const a = el.getBoundingClientRect()
    const same = ['x', 'y', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) < 0.5)
    if (!same) throw new Error('mark moved its element: ' + label)
    return t
  }
  // the rows of text of an element (its tags left out), merged by their top: [{top, bottom, right}] top to bottom
  mq.rowsOf = el => {
    const tags = [...el.querySelectorAll('.mkq-tag')]; tags.forEach(t => { t.style.display = 'none' })
    const rg = document.createRange(); rg.selectNodeContents(el)
    const rows = [...rg.getClientRects()].filter(r => r.width > 0)
    tags.forEach(t => { t.style.display = '' })
    const byTop = []
    for (const r of rows) { const k = byTop.find(x => Math.abs(x.top - r.top) < 4); if (k) { k.right = Math.max(k.right, r.right); k.bottom = Math.max(k.bottom, r.bottom) } else byTop.push({ top: r.top, bottom: r.bottom, right: r.right }) }
    return byTop.sort((a, b) => a.top - b.top)
  }
  // a tag hung in the free room at the end of a row of words — the rows given, in order of preference — never over a
  // word and never over a tag already placed (mq.__placed). Positioned against its own parent. Returns the row's index.
  mq.placeTag = (tag, rows, room) => {
    const par = tag.parentElement.getBoundingClientRect(), tw = tag.getBoundingClientRect().width
    mq.__placed = mq.__placed || []
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i], t = (row.top + row.bottom) / 2 - 7
      let l = row.right + 5
      // a tag already at this row's end: this one goes after it
      for (const p of mq.__placed) if (l < p.r + 3 && l + tw > p.l - 3 && t < p.b && t + 14 > p.t) l = p.r + 5
      if (l + tw > room) continue
      if (mq.__placed.some(p => l < p.r + 3 && l + tw > p.l - 3 && t < p.b && t + 14 > p.t)) continue
      tag.style.left = Math.round(l - par.left) + 'px'; tag.style.right = 'auto'; tag.style.top = Math.round(t - par.top) + 'px'; tag.style.bottom = 'auto'; tag.style.transform = 'none'
      mq.__placed.push({ l, r: l + tw, t, b: t + 14 })
      return i
    }
    return -1
  }
  mq.checkTags = () => {
    const bad = []
    for (const t of document.querySelectorAll('.mkq-tag')) {
      const r = t.getBoundingClientRect()
      if (!(r.width > 0)) { bad.push(t.textContent + ': not drawn'); continue }
      for (let a = t.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        const cs = getComputedStyle(a)
        if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
          const c = a.getBoundingClientRect()
          if (r.left < c.left - 0.5 || r.right > c.right + 0.5 || r.top < c.top - 0.5 || r.bottom > c.bottom + 0.5) bad.push(t.textContent + ': clipped by ' + a.className)
        }
      }
      if (r.left < -0.5 || r.right > innerWidth + 0.5) bad.push(t.textContent + ': off the screen')
    }
    return bad
  }
  // a tag covering a word of the card: every tag inside a card is checked against every other text rect in it
  mq.checkCover = root => {
    const bad = []
    const tags = [...root.querySelectorAll('.mkq-tag')].map(t => [t, t.getBoundingClientRect()])
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n
    while ((n = w.nextNode())) {
      if (!n.nodeValue.trim() || n.parentElement.closest('.mkq-tag')) continue
      const rg = document.createRange(); rg.selectNodeContents(n)
      for (const r of rg.getClientRects()) for (const [t, tr] of tags) if (r.width > 0 && tr.left < r.right - 1 && tr.right > r.left + 1 && tr.top < r.bottom - 1 && tr.bottom > r.top + 1) bad.push(t.textContent + ' covers "' + n.nodeValue.trim().slice(0, 30) + '"')
    }
    return bad
  }
  mq.topH = () => { const t = document.querySelector('.topbar'); return t && mq.vis(t) ? t.getBoundingClientRect().bottom : 0 }
  mq.scrollUnder = (el, gap) => { window.scrollTo(window.scrollX, window.scrollY + el.getBoundingClientRect().top - mq.topH() - gap) }
  // the app's ask card (ui/AskCard.tsx's markup, its global stylesheet), hung under or over a control, its pointer on
  // the control's middle — placed as AskCard places it (round 3's kit). sub: a string, or an element for the sub line
  mq.ask = (at, q, sub, btns) => {
    const c = document.createElement('div'); c.className = 'askcard ac-below'; c.setAttribute('data-mine', '1'); c.setAttribute('role', 'alertdialog')
    c.innerHTML = `<span class="askcard-q"></span>${sub && typeof sub === 'string' ? '<span class="askcard-sub"></span>' : ''}<span class="askcard-btns"></span>`
    c.querySelector('.askcard-q').textContent = q
    if (sub && typeof sub === 'string') c.querySelector('.askcard-sub').textContent = sub
    else if (sub) c.querySelector('.askcard-btns').before(sub)
    for (const [t, k] of btns) { const b = document.createElement('button'); b.type = 'button'; b.className = 'abtn' + (k ? ' ' + k : ''); b.textContent = t; c.querySelector('.askcard-btns').appendChild(b) }
    const host = at.closest('[id^="page-"]') || document.body
    host.appendChild(c)
    const r = at.getBoundingClientRect(), W = c.offsetWidth, H = c.offsetHeight
    const mid = (r.left + r.right) / 2
    let left = mid > innerWidth / 2 ? r.right - W : r.left
    left = Math.min(Math.max(left, 8), innerWidth - W - 8)
    let top = r.bottom + 8
    if (top + H > innerHeight - 8 && r.top - 8 - H > 8) { top = r.top - 8 - H; c.className = 'askcard ac-above' }
    c.style.left = left + 'px'; c.style.top = top + 'px'
    const o2 = c.getBoundingClientRect(); c.style.left = (left - (o2.left - left)) + 'px'; c.style.top = (top - (o2.top - top)) + 'px'
    c.style.setProperty('--ac-px', Math.round(Math.min(Math.max(mid - left, 14), W - 14)) + 'px')
    // the control the card hangs from, drawn pressed: the app's cyan focus ring
    at.style.outline = '2px solid var(--accent)'; at.style.outlineOffset = '1px'
    return c
  }
  window.__mq = mq
}

const manifest = {}
const notes = []
const errs = []
let browser

// tallH: a taller screen of the same width, for a picture of a whole day taller than the size's screen (A3)
async function world(sz, tallH = 0) {
  const o = SIZES[sz].opts, ctx = await browser.newContext(tallH ? { ...o, viewport: { width: o.viewport.width, height: tallH } } : o)
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`); console.log('PAGEERROR', String(e)) })
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  await page.goto(URL_)
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(700)
  await page.addStyleTag({ content: MARK_CSS })
  // the invented callsigns must not be on the demo roster (Ace is the demo's own, and the brief's admin of 149)
  const clash = await page.evaluate(names => Object.values(window.PEOPLE).map(p => p.cs).filter(c => names.some(n => c.toLowerCase() === n.toLowerCase())), [...DET6, 'Gale', 'Jolt', 'Kite', 'Lark'])
  if (clash.length) throw new Error('invented callsigns on the roster: ' + clash.join(','))
  return { ctx, page }
}
// the signed-in admin named as 149's (Ace) on the top bar: its squadron number and its user chip re-lettered
async function as149(page, k = '149') {
  return page.evaluate(k => {
    const mq = window.__mq, out = {}
    const mk = document.querySelector('.topbar .mark .k'); if (mk && mq.vis(mk)) { const k2 = mq.strip(mk.cloneNode(true)); k2.textContent = k; mq.hide(mk); mk.after(k2); out.k = true }
    const w = document.createTreeWalker(document.querySelector('.topbar'), NodeFilter.SHOW_TEXT); let n
    while ((n = w.nextNode())) if (/\bSABER\b/i.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace(/\bSaber\b/, 'Ace').replace(/\bSABER\b/, 'ACE'); out.user = n.nodeValue }
    return out
  }, k)
}
function rec(file, item, sz, kind, caption) { manifest[file] = { item, size: SIZES[sz].name, kind, caption } }
// full: the clip is in page coordinates and may run past the screen's foot (a day taller than the screen)
async function shot(page, file, clip, full = false) {
  const bad = await page.evaluate(() => window.__mq.checkTags())
  if (bad.length) throw new Error(file + ': ' + bad.join('; '))
  await page.mouse.move(Math.round(page.viewportSize().width / 2), 1)
  await page.waitForTimeout(120)
  await page.screenshot({ path: `${PAGEIMG}/${file}`, ...(clip ? { clip } : {}), ...(full ? { fullPage: true } : {}) })
  copyFileSync(`${PAGEIMG}/${file}`, `${OUT}/${file}`)
  console.log('  wrote', file)
}

// ---------- Admin → Squadrons (round 4's builder, whole) ----------
async function toAdmin(page) {
  await page.evaluate(() => window.go('admin'))
  await page.waitForSelector('#page-admin.on button.acc-main', { state: 'attached' })
  await page.waitForTimeout(500)
  if (!(await page.locator('#page-admin button.acc-main').first().isVisible())) {
    await page.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first().click()
    await page.waitForSelector('#page-admin.on button.acc-main')
    await page.waitForTimeout(500)
  }
  await page.locator('#page-admin button.acc-main', { hasText: /^Hex/ }).first().click()
  await page.waitForSelector('#accEdArchive')
  await page.evaluate(() => {
    window.__mqEdit = document.querySelector('#accEdSave').closest('.acc-edit').cloneNode(true)
    window.__mqBtn = document.querySelector('#accEdArchive').cloneNode(true)
  })
  await page.click('#accEdCancel')
  await page.waitForTimeout(400)
  await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement && document.activeElement.blur && document.activeElement.blur() })
  await page.waitForTimeout(250)
}
// opts.det: the open detachment shown; opts.detPeople: its People line and door (round 4's item 6); opts.editDet: the
// detachment's own row open on its fields (A4: To moved to 28 Jul)
async function squadrons(page, opts) {
  return page.evaluate(({ opts, DET, SHORT, DET6 }) => {
    const mq = window.__mq, pg = document.querySelector('#page-admin')
    let panel = pg.querySelector('button.acc-main').parentElement
    while (panel && !panel.querySelector('h3')) panel = panel.parentElement
    const realRow = panel.querySelector('.acc-row.od-row')
    const realInset = Math.round(realRow.querySelector('.acc-name').getBoundingClientRect().left - panel.getBoundingClientRect().left)
    const cats = [...pg.querySelectorAll('button.adm-cat')].filter(mq.vis)
    const users = cats.find(c => /Users/.test(c.textContent)), cfg = cats.find(c => /Squadron config/.test(c.textContent))
    if (users && cfg) {
      const sq = mq.strip(users.cloneNode(true))
      sq.querySelector('.adm-cat-l').textContent = 'Squadrons'; sq.querySelector('.adm-cat-s').textContent = 'Places and detachments'
      const u2 = mq.strip(cfg.cloneNode(true))
      u2.querySelector('.adm-cat-ic').replaceWith(mq.strip(users.querySelector('.adm-cat-ic').cloneNode(true)))
      u2.querySelector('.adm-cat-l').textContent = 'Users'; u2.querySelector('.adm-cat-s').textContent = 'Sign-in and roster'
      mq.hide(users); users.after(u2); u2.after(sq)
    }
    const h3 = panel.querySelector('h3'), sub = panel.querySelector('h4.adm-sub'), row = realRow
    const kids = [...panel.children]
    const h3c = mq.strip(h3.cloneNode(true)); h3c.textContent = 'Squadrons'
    kids.forEach(k => mq.hide(k))
    const hostOf = h3.parentElement === panel ? null : h3.parentElement
    const head = hostOf ? mq.strip(hostOf.cloneNode(false)) : null
    if (head) { head.appendChild(h3c); panel.appendChild(head) } else panel.appendChild(h3c)
    const listSec = row.closest('.acc-list').parentElement
    const sec = mq.strip(listSec.cloneNode(false)); panel.appendChild(sec)
    sec.style.paddingBottom = '14px'
    const H = t => { const h = mq.strip(sub.cloneNode(true)); h.textContent = t; sec.appendChild(h); return h }
    const list = () => { const l = mq.strip(row.closest('.acc-list').cloneNode(false)); sec.appendChild(l); return l }
    const R = (l, name, subTx, btn) => {
      const r = mq.strip(row.cloneNode(true)); r.classList.remove('od-row-on')
      r.querySelector('.acc-name').textContent = name; r.querySelector('.acc-sub').textContent = subTx
      r.querySelectorAll('.od-c, .acc-edit').forEach(x => x.remove())
      const rc = r.querySelector('.od-rc'); rc.innerHTML = ''
      if (btn) { const b = mq.strip(window.__mqBtn.cloneNode(true)); b.textContent = btn; b.style.whiteSpace = 'nowrap'; rc.appendChild(b); rc.style.display = 'flex'; rc.style.alignItems = 'center' }
      l.appendChild(r); return r
    }
    const editor = (r, fields, note) => {
      r.classList.add('od-row-on')
      const ed = mq.strip(window.__mqEdit.cloneNode(true))
      const col = ed.querySelector('.adm-2col'), mfIn = col.querySelector('.mfield'), mfSel = col.querySelectorAll('.mfield')[1]
      const cols = []
      for (let i = 0; i < fields.length; i += 2) {
        const c = mq.strip(col.cloneNode(false)); cols.push(c)
        for (const [lab, kind, val, choices, ph] of fields.slice(i, i + 2)) {
          const f = mq.strip((kind === 'sel' ? mfSel : mfIn).cloneNode(true))
          f.querySelector('label').textContent = lab
          if (kind === 'sel') { const s = f.querySelector('select'); s.innerHTML = ''; for (const t of choices) { const o = document.createElement('option'); o.textContent = t; s.appendChild(o) } s.selectedIndex = 0; s.removeAttribute('aria-label') }
          else { const inp = f.querySelector('input'); inp.setAttribute('value', val); inp.value = val; if (ph) inp.setAttribute('placeholder', ph); else inp.removeAttribute('placeholder') }
          c.appendChild(f)
        }
      }
      col.replaceWith(...cols)
      let noteEl = null
      if (note) {
        noteEl = document.createElement('div'); noteEl.setAttribute('data-mine', '1'); noteEl.className = 'acc-sub'
        noteEl.textContent = note; noteEl.style.cssText = 'display:block;margin:2px 0 10px;white-space:normal'
        ed.querySelector('.acc-acts').before(noteEl)
      }
      const acts = ed.querySelector('.acc-acts')
      ;[...acts.children].forEach(b => { if (!/^(Save|Cancel)$/.test(b.textContent.trim())) b.remove() })
      r.appendChild(ed)
      return { ed, cols, noteEl }
    }
    const out = {}
    const v149 = opts.viewer === '149'
    H('Squadrons · 2')
    const l1 = list()
    R(l1, '142', 'Home base · 61 people')
    const r149 = R(l1, '149', (opts.p149 || 'Northern base') + ' · 48 people' + (v149 ? ' · yours' : ''))
    H((v149 ? 'Detachments of 149 · ' : 'Detachments · ') + (opts.det ? 1 : 0))
    const l2 = list()
    let rd = null
    if (opts.det) rd = R(l2, `${SHORT} · ${DET}`, 'Exercise base · 13 Jul – 31 Jul · 6 people', opts.editDet ? null : 'Close detachment')
    if (rd && opts.detPeople) {
      const subEl = rd.querySelector('.acc-sub'); subEl.textContent = 'Exercise base · 13 Jul – 31 Jul'
      const ppl = mq.strip(subEl.cloneNode(true)); ppl.textContent = 'People · 6 · ' + DET6.join(', '); ppl.style.whiteSpace = 'normal'; ppl.style.position = 'relative'; ppl.style.paddingRight = '30px'
      subEl.after(ppl)
      const door = mq.strip(window.__mqBtn.cloneNode(true)); door.textContent = '+ Put people on it'; door.style.whiteSpace = 'nowrap'
      const wrap = document.createElement('div'); wrap.setAttribute('data-mine', '1'); wrap.style.cssText = 'margin:8px 0 2px'; wrap.appendChild(door)
      ppl.after(wrap)
      out.ppl = ppl; out.door = door
    }
    if (rd && opts.editDet) {
      // the detachment's own row opened, its fields as round 4's "+ New detachment" drew them; To moved to 28 Jul
      out.editDet = editor(rd, [['Name', 'in', DET], ['Squadron number', 'in', SHORT], ['Place', 'sel', '', ['Exercise base', 'Home base', 'Northern base', '+ New place…']], ['People', 'in', 'Through their overseas duty input'], ['From', 'in', '13 Jul 26'], ['To', 'in', opts.editDet.to]])
    }
    if (!opts.editDet) {
      const add = mq.strip(window.__mqBtn.cloneNode(true)); add.textContent = '+ New detachment'
      const addWrap = document.createElement('div'); addWrap.setAttribute('data-mine', '1'); addWrap.style.cssText = 'margin:10px 0 4px'; addWrap.appendChild(add); sec.appendChild(addWrap)
    }
    H('Past detachments · 1')
    const l3 = list()
    R(l3, 'Exercise South', 'Closed 6 Mar · its schedules kept, read only')
    const mine = Math.round(sec.querySelector('.acc-name').getBoundingClientRect().left - panel.getBoundingClientRect().left)
    if (mine < realInset) { sec.style.paddingLeft = (realInset - mine) + 'px'; sec.style.paddingRight = (realInset - mine) + 'px'; h3c.style.paddingLeft = (realInset - mine) + 'px' }
    out.r149 = r149; out.rd = rd
    window.__mqSq = out
    window.__mqClipEl = panel
    return { inset: { realInset, mine } }
  }, { opts, DET, SHORT, DET6 })
}
async function adminClip(page, sz, extra = 0) {
  return page.evaluate(({ sz, extra }) => {
    const mq = window.__mq, pg = document.querySelector('#page-admin')
    const panel = window.__mqClipEl, pr = panel.getBoundingClientRect()
    const cats = [...pg.querySelectorAll('button.adm-cat')].filter(mq.vis)
    const left = sz === 'd' && cats.length ? Math.min(pr.left, cats[0].getBoundingClientRect().left) - 12 : 0
    let bottom = pr.bottom + 14 + extra, top = 0
    for (const c of document.querySelectorAll('.askcard[data-mine]')) { const r = c.getBoundingClientRect(); bottom = Math.max(bottom, r.bottom + 14) }
    const x = Math.max(0, left), w = sz === 'd' ? Math.min(innerWidth - x, pr.right + 12 - x) : innerWidth
    return { x, y: top, width: w, height: Math.min(innerHeight, bottom) - top }
  }, { sz, extra })
}

// ---------- the Close card: the ask card, its sub line a numbered list of the brief's lines ----------
// The card keeps the ask card's own type: each line in the sub line's look (.askcard-sub's size, weight and colour,
// read off a real .askcard-sub in the page), numbered with a hanging figure — the app's numbered lines (the Leave War's
// fixed columns, the issues list) have no list of their own to clone, so the numbers are the one new thing (said so).
async function closeCard(page, lines, title) {
  return page.evaluate(({ lines, title }) => {
    const mq = window.__mq, b = window.__mqSq.rd.querySelector('.od-rc button')
    const list = document.createElement('ol'); list.setAttribute('data-mine', '1'); list.className = 'mq-close-lines'
    list.style.cssText = 'margin:-4px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:7px'
    const made = []
    lines.forEach((ln, i) => {
      const li = document.createElement('li'); li.className = 'askcard-sub'
      li.style.cssText = 'margin:0;display:grid;grid-template-columns:16px minmax(0,1fr);position:relative'
      const n = document.createElement('span'); n.textContent = (i + 1) + '.'; n.style.cssText = 'font-variant-numeric:tabular-nums;color:var(--ink-3,#7d8794)'
      const tx = document.createElement('span'); tx.className = 'mq-ln'; tx.style.position = 'relative'
      let lineMark = null, spanMark = null
      for (const part of ln) {
        if (typeof part === 'string') tx.appendChild(document.createTextNode(part))
        else if (part && part.length === 3) { const s = document.createElement('span'); s.textContent = part[0]; s.style.position = 'relative'; tx.appendChild(s); spanMark = [s, part[1], part[2]] }
        else if (part) lineMark = part
      }
      li.appendChild(n); li.appendChild(tx); list.appendChild(li)
      made.push({ tx, lineMark, spanMark })
    })
    const c = mq.ask(b, title, list, [['Keep open', 'primary'], ['Close detachment', '']])
    // marks: an outline round each marked line, its tag where the line's words end; an outline round a marked phrase,
    // its tag above it (in the gap over its row)
    // Each tag goes where words end: its own line's last row first, then its line's other rows, then the row just above
    // the line (the line before, or the card's title) — never over a word or another tag.
    const where = []
    mq.__placed = []
    const cr = c.getBoundingClientRect(), room = cr.right - 4
    const titleRows = mq.rowsOf(c.querySelector('.askcard-q'))
    const above = i => i === 0 ? titleRows.slice(-1) : mq.rowsOf(made[i - 1].tx).slice(-1)
    const marks = []
    made.forEach((m, i) => {
      if (m.lineMark) marks.push({ el: m.tx, col: m.lineMark[0], lab: m.lineMark[1], rows: () => { const own = mq.rowsOf(m.tx); return [...own.slice().reverse(), ...above(i)] }, line: true })
      if (m.spanMark) { const [s, col, lab] = m.spanMark; marks.push({ el: s, col, lab, rows: () => { const own = mq.rowsOf(m.tx), sr = s.getClientRects()[0]; const k = own.findIndex(r => Math.abs(r.top - sr.top) < 4); const near = [own[k], own[k + 1], own[k - 1]].filter(Boolean); return [...near, ...own.filter(r => !near.includes(r)), ...above(i)] } }) }
    })
    for (const k of marks) {
      const t = mq.mark(k.el, k.lab, 'o', k.col); k.el.classList.add('mkq-t')
      const at = mq.placeTag(t, k.rows(), room)
      where.push(k.lab + ':' + at)
      if (at < 0) throw new Error('no free room for the tag ' + k.lab)
    }
    window.__mqCard = c
    return { where, h: Math.round(c.getBoundingClientRect().height), w: Math.round(c.getBoundingClientRect().width), side: c.className }
  }, { lines, title })
}

// ---------- A1 / A2: the Close card ----------
async function a12(sz, which) {
  const { ctx, page } = await world(sz)
  await toAdmin(page)
  const tb = await as149(page)
  await squadrons(page, { p149: 'Home base', det: true, detPeople: true, viewer: '149' })
  // bring the detachment's row up under the top bar, so the tall card hangs below its button as AskCard places it
  await page.evaluate(() => { const mq = window.__mq; const r = window.__mqSq.rd; const room = innerHeight - 40; void room; mq.scrollUnder(r, 8) })
  await page.waitForTimeout(200)
  const lines = which === 'a1' ? A1_LINES : A2_LINES
  const st = await closeCard(page, lines, `Close ${DET}?`)
  const cover = await page.evaluate(() => window.__mq.checkCover(window.__mqCard))
  if (cover.length) throw new Error(which + ' tags cover words: ' + cover.join('; '))
  // the card's words, its tags left out
  const words = await page.evaluate(() => { const c = window.__mqCard.cloneNode(true); c.querySelectorAll('.mkq-tag').forEach(t => t.remove()); return c.textContent })
  for (const ln of lines) { const t = ln.map(p => typeof p === 'string' ? p : (p && p.length === 3 ? p[0] : '')).join(''); if (!words.replace(/\s+/g, ' ').includes(t.replace(/\s+/g, ' '))) throw new Error(which + ' line missing: ' + t) }
  await page.waitForTimeout(250)
  const n = which === 'a1' ? 'A1' : 'A2'
  const f = `R7${n}-${sz}-proposed.png`
  let clip
  if (which === 'a1') {
    // the row and its card: from the detachment's heading to the card's foot
    clip = await page.evaluate(({ sz }) => {
      const mq = window.__mq, c = window.__mqCard.getBoundingClientRect(), r = window.__mqSq.rd.getBoundingClientRect()
      const panel = window.__mqClipEl.getBoundingClientRect()
      // from the "Detachments of 149" heading over the row
      const h = window.__mqSq.rd.closest('.acc-list').previousElementSibling.getBoundingClientRect()
      const top = Math.max(0, Math.min(h.top, c.top) - 10)
      const x = sz === 'd' ? Math.max(0, panel.left - 12) : 0, w = sz === 'd' ? Math.min(innerWidth - x, panel.right + 12 - x) : innerWidth
      return { x, y: top, width: w, height: Math.min(innerHeight, Math.max(c.bottom, r.bottom) + 18) - top }
    }, { sz })
  } else {
    clip = await page.evaluate(() => { const c = window.__mqCard.getBoundingClientRect(); const x = Math.max(0, c.left - 14), y = Math.max(0, c.top - 10); return { x, y, width: Math.min(innerWidth - x, c.width + 28), height: Math.min(innerHeight - y, c.height + 24) } })
  }
  await shot(page, f, clip)
  rec(f, n, sz, 'proposed', which === 'a1'
    ? `149's admin (Ace), Admin → Squadrons, Exercise North's row: "Close detachment" pressed on Thu 23 Jul at 14:00 home (21:00 at Exercise North). The app's own question card hangs from the button, "Close Exercise North?", its lines numbered in the brief's order. Blue: F15, F16, F17 (three lines), C2 — already ruled. Pink: New · M2 on "(was 31 Jul)", New · H2 on 242's RU. No amendment label on the card (C8). Keep open is the safe answer.`
    : `The same card, pressed at 23:00 home on Thu 23 Jul (Fri 24 06:00 at Exercise North). Lines 1, 2 and 5 change: Fri 24 is kept. Pink: New · H1 on line 1. Lines 2 and 5 keep A1's blue F16 and C2. The card alone.`)
  notes.push(`${which} ${sz}: ${JSON.stringify({ tb, st })}`)
  await ctx.close()
}

// ---------- A3: 249's Sat 25 Jul after Close ----------
// Real: the demo's Saturday (Jul 18, day 5) with Hawk's input filed on it (an OML, the app's medical kind — its kind
// line re-lettered MED DOWNCHIT, the brief's words), published as the Original by four real sign-offs; then its programme
// notes and its SDO desk taken off and the four signed again, and "Publish AL1" pressed — so the day is a published
// amendment with nothing on it but the input. Drawn: the date (Jul 25), the top bar (249, Ace), the line in place of
// the four names, the Unpublish button greyed and its reason under the day head.
const SIGN4 = () => { const w = window; const g = w.signOf(5); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
async function a3(sz) {
  const { ctx, page } = await world(sz, sz === 'd' ? 1500 : 1700)
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#page-editsched.on #eWeek .day'); await page.waitForTimeout(900)
  await page.evaluate(SIGN4); await page.evaluate(() => window.setDayApproved(5, true)); await page.waitForTimeout(900)
  // Hawk's input filed on the published day (a pending amendment, as any input filed on a published day)
  await page.evaluate(() => window.fileInput({ iid: 'mq-med', person: 'shaft', type: 'OML', date: 'Jul 18', yr: 2026, allday: true, remarks: '' }))
  await page.waitForTimeout(700)
  // cleared: the programme notes and the duty desk taken off the working copy, then the four signed again and AL1 published
  await page.evaluate(() => { const w = window, D = w.DAYS[5]; D.notes = []; D.dutywaves = []; D.allhands = []; D.ground = []; D.waves = []; if (w.validate) w.validate(); if (w.renderEditWeek) w.renderEditWeek() })
  await page.waitForTimeout(700)
  await page.evaluate(SIGN4); await page.evaluate(() => window.renderEditWeek && window.renderEditWeek()); await page.waitForTimeout(500)
  const pub = await page.evaluate(() => { const b = document.querySelector('#eWeek .day:not(.peek) button[data-alpub="5"]'); if (!b) return 'no AL button: ' + [...document.querySelectorAll('#eWeek .day:not(.peek)')][5].querySelector('.day-head').innerText.replace(/\s+/g, ' '); if (b.disabled) return 'AL button locked'; b.click(); return 'pressed ' + b.textContent })
  await page.waitForTimeout(900)
  if (!/^pressed/.test(pub)) throw new Error('a3: ' + pub)
  // the premise on screen: AL1 issued, the four names shown, no line, wave, programme row or desk, the input row there
  const pre = await page.evaluate(() => {
    const d = [...document.querySelectorAll('#eWeek > .day')].filter(x => !x.classList.contains('peek'))[5]
    const head = d.querySelector('.day-head').innerText.replace(/\s+/g, ' ')
    // the four who signed the issued version stand on the "Signed" line under the day head (signedLineHTML, D95, D102)
    const sl = d.querySelector('.signedln'), sign = sl ? [...sl.querySelectorAll('.sl-n')].map(v => v.textContent) : []
    const unav = [...d.querySelectorAll('.sec-unav .pl-row')].map(r => r.innerText.replace(/\s+/g, ' '))
    const secs = [...d.querySelectorAll('.dsec')].map(s => s.innerText.replace(/\s+/g, ' ').slice(0, 90))
    return { head, sign, unav, secs }
  })
  if (!/AL1/.test(pre.head) || !/Unpublish/.test(pre.head)) throw new Error('a3: not a published AL1: ' + pre.head)
  if (pre.sign.length !== 4 || pre.sign.some(v => /—/.test(v))) throw new Error('a3: the four names are not shown: ' + pre.sign.join(','))
  if (pre.secs.some(s => /SDO|NO FLYING|DUTY CREW/.test(s))) throw new Error('a3: not cleared: ' + pre.secs.join(' | '))
  if (!pre.unav.some(r => /Anvil/.test(r))) throw new Error('a3: no input row: ' + pre.unav.join(' | '))
  await as149(page, SHORT)
  if (sz === 'p') { await page.evaluate(() => { const d = [...document.querySelectorAll('#eWeek > .day')].filter(x => !x.classList.contains('peek'))[5]; d.scrollIntoView({ inline: 'start', block: 'start' }) }); await page.waitForTimeout(600) }
  else { await page.evaluate(() => { const d = [...document.querySelectorAll('#eWeek > .day')].filter(x => !x.classList.contains('peek'))[5]; d.scrollIntoView({ inline: 'start', block: 'start' }) }); await page.waitForTimeout(600) }
  // the day's head brought up under the top bar (the bar is sticky: scroll-into-view alone hides the head under it)
  await page.evaluate(() => { const mq = window.__mq, d = [...document.querySelectorAll('#eWeek > .day')].filter(x => !x.classList.contains('peek'))[5]; mq.scrollUnder(d, 6) })
  await page.waitForTimeout(400)
  // Available crew: nobody is on the detachment after Close — the section folded first, by a real press on its own
  // header (its ⌃), so the demo's 46 names of 142 do not stand on 249's day; the day repaints, so drawing comes after
  const fold = await page.evaluate(() => { const d = [...document.querySelectorAll('#eWeek > .day')].filter(x => !x.classList.contains('peek'))[5]; const h = d.querySelector('.sec-avail .ap-h'); if (!h) return 'none'; h.click(); return 'pressed' })
  await page.waitForTimeout(600)
  const st = await page.evaluate(({ SIGN, WHY }) => {
    const mq = window.__mq
    const d = [...document.querySelectorAll('#eWeek > .day')].filter(x => !x.classList.contains('peek'))[5]
    window.__mqDay = d
    // the date re-lettered: Sat 25 Jul
    const dt = d.querySelector('.day-head .dt'); dt.textContent = dt.textContent.replace('Jul 18', 'Jul 25')
    // the four who signed, on the "Signed" line under the day head: the line's own parts hidden, one line in their
    // place, in the look of a name on that line (.sl-n, measured on the real element)
    const sl = d.querySelector('.signedln'), nm = sl.querySelector('.sl-n'), nc = getComputedStyle(nm)
    for (const k of [...sl.children]) mq.hide(k)
    const line = document.createElement('span'); line.setAttribute('data-mine', '1'); line.className = 'mq-cleared'
    for (const p of ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'line-height', 'color']) line.style.setProperty(p, nc.getPropertyValue(p))
    line.style.position = 'relative'; line.textContent = SIGN
    sl.appendChild(line)
    // Unpublish greyed and its reason under the day head, right-aligned, in the quiet look of the Signed line's names.
    // Greyed: the button keeps its own quiet face (.dbeak.dunpub) at the plans menu's greyed-item opacity (.45, the
    // app's .wavemenu .wm:disabled) — the day-head buttons' own disabled face is a dim BLUE, which lights a quiet grey
    // button up instead of greying it (named to him)
    const un = d.querySelector('.day-head button[data-unpub]'); un.disabled = true; un.removeAttribute('title')
    // (the .45 laid on its words and edge, not as the element's opacity, so the ring drawn on it keeps full strength)
    for (const [p, v] of [['background', 'transparent'], ['color', 'color-mix(in srgb, var(--ink-2) 45%, transparent)'], ['border-color', 'color-mix(in srgb, var(--edge-2) 45%, transparent)'], ['cursor', 'not-allowed']]) un.style.setProperty(p, v)
    const head = d.querySelector('.day-head')
    const why = document.createElement('div'); why.setAttribute('data-mine', '1'); why.className = 'mq-why'
    why.textContent = WHY
    for (const p of ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'line-height']) why.style.setProperty(p, nc.getPropertyValue(p))
    why.style.cssText += `;color:var(--ink-2);text-align:${(() => { const b = un.getBoundingClientRect(), h = head.getBoundingClientRect(); return (b.left + b.right) / 2 < (h.left + h.right) / 2 ? 'left' : 'right' })()};padding:5px 10px 6px;position:relative;background:${getComputedStyle(head).backgroundColor};border-bottom:${getComputedStyle(head).borderBottom}`
    head.after(why)
    // Hawk's input row: the demo's Anvil re-lettered Hawk, its kind line OML re-lettered MED DOWNCHIT
    const row = [...d.querySelectorAll('.sec-unav .pl-row')].find(r => /Anvil/.test(r.innerText))
    const tw = document.createTreeWalker(row, NodeFilter.SHOW_TEXT); let n; const re = []
    while ((n = tw.nextNode())) { if (/\bAnvil\b/.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace(/\bAnvil\b/, 'Hawk'); re.push('name') } else if (n.nodeValue.trim() === 'OML') { n.nodeValue = n.nodeValue.replace('OML', 'MED DOWNCHIT'); re.push('kind') } else if (/\b18 Jul\b/.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace('18 Jul', '25 Jul'); re.push('date') } }
    // Available crew, folded: its count is 142's demo roster; on 249 after Close nobody is left there — 0
    const avh = d.querySelector('.sec-avail .ap-h'); const aw = document.createTreeWalker(avh, NodeFilter.SHOW_TEXT)
    while ((n = aw.nextNode())) if (/^\s*46\b/.test(n.nodeValue) || /\b46 all day/i.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace('46', '0'); re.push('avail 0') }
    for (const p of row.querySelectorAll('[title*="Anvil"]')) p.setAttribute('title', p.getAttribute('title').replace(/Anvil/g, 'Hawk'))
    return { re, row: row.innerText.replace(/\s+/g, ' '), head: head.innerText.replace(/\s+/g, ' '), unDisabledBg: getComputedStyle(un).backgroundColor }
  }, { SIGN: A3_SIGN, WHY: A3_WHY })
  await page.waitForTimeout(300)
  const still = await page.evaluate(() => !!document.querySelector('#eWeek .signedln .mq-cleared') && !!document.querySelector('#eWeek .mq-why'))
  if (!still) throw new Error('a3: a repaint took the drawn parts')
  const mk = await page.evaluate(() => {
    const mq = window.__mq, d = window.__mqDay
    const line = d.querySelector('.signedln .mq-cleared')
    mq.mark(line, 'F18', 'right', 'b')
    const un = d.querySelector('.day-head button[data-unpub]')
    const t0 = mq.mark(un, 'x', 'o', 'p'); un.classList.add('mkq-o'); t0.remove()
    const why = d.querySelector('.mq-why')
    // the reason is right-aligned: its tag goes in the free room at the left of a row of its words
    const t1 = mq.mark(why, 'New · M7', 'in', 'p')
    {
      t1.style.display = 'none'
      const rg = document.createRange(); rg.selectNodeContents(why)
      const rows = [...rg.getClientRects()].filter(r => r.width > 0); t1.style.display = ''
      const wr = why.getBoundingClientRect(), tw = t1.getBoundingClientRect().width
      let placed = false
      for (const r of rows) {
        const L = r.left - 8 - tw >= wr.left + 2 ? r.left - 8 - tw : (r.right + 8 + tw <= wr.right - 2 ? r.right + 8 : null)
        if (L == null) continue
        t1.style.right = 'auto'; t1.style.left = Math.round(L - wr.left) + 'px'; t1.style.top = Math.round((r.top + r.bottom) / 2 - 7 - wr.top) + 'px'
        placed = true; break
      }
      if (!placed) throw new Error('a3: no room for the M7 tag')
    }
    const row = [...d.querySelectorAll('.sec-unav .pl-row')].find(r => /Hawk/.test(r.innerText))
    // its tag in a corner of the row that holds no word: bottom-right, bottom-left, top-right
    row.style.position = 'relative'; const t2 = mq.mark(row, 'New · H3')
    const corners = [{ top: 'auto', bottom: '2px', right: '2px', left: 'auto' }, { top: 'auto', bottom: '2px', right: 'auto', left: '2px' }, { top: '2px', bottom: 'auto', right: '2px', left: 'auto' }]
    let ok = false
    for (const c of corners) { Object.assign(t2.style, c); if (!mq.checkCover(row).length) { ok = true; break } }
    if (!ok) throw new Error('a3: no free corner for the H3 tag')
    const av = d.querySelector('.sec-avail')
    return { avail: av ? av.innerText.replace(/\s+/g, ' ').slice(0, 80) : 'none', whyCover: mq.checkCover(why), rowCover: mq.checkCover(row) }
  })
  if (mk.whyCover.length) throw new Error('a3: ' + mk.whyCover.join('; '))
  await page.waitForTimeout(250)
  const clip = await page.evaluate(({ sz }) => {
    const mq = window.__mq, d = window.__mqDay, r = d.getBoundingClientRect()
    const unav = d.querySelector('.sec-unav').getBoundingClientRect()
    // from the screen's left edge (the top bar's squadron number, 249, in the picture) to the day's right edge, from the
    // top of the screen to the foot of Unavailable
    // (page coordinates: the day runs past the screen's foot, so the picture is taken of the whole page)
    const right = Math.min(innerWidth, r.right + 6)
    return { x: 0, y: 0, width: right, height: Math.min(innerHeight, unav.bottom + 8) }
  }, { sz })
  const f = `R7A3-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, 'A3', sz, 'proposed', `249's (Exercise North's) schedule, Edit Schedule, Sat 25 Jul after Close. Real: a published day, really cleared and published again as AL1 (the demo's Saturday Jul 18, re-lettered Jul 25; the top bar re-lettered 249). Nothing on it but Hawk's input row on Unavailable (pink New · H3 — inputs are never cleared; the demo's medical kind OML re-lettered MED DOWNCHIT). Blue F18: one line in place of the four sign-off names, "${A3_SIGN}". Pink New · M7: Unpublish greyed (its own quiet face at the plans menu's greyed-item strength; the app has no day menu with Unpublish in it — the button sits on the day head) with its reason under the day head, "${A3_WHY}". Available crew folded by its own control, its count re-lettered 0. Drawn on a screen of the size's width made taller, so the whole day shows.`)
  notes.push(`a3 ${sz}: ${JSON.stringify({ pre, st, fold, mk })}`)
  await ctx.close()
}

// ---------- A4: moving the detachment's "To" earlier ----------
async function a4(sz) {
  const { ctx, page } = await world(sz)
  await toAdmin(page)
  const tb = await as149(page)
  await squadrons(page, { p149: 'Home base', det: true, viewer: '149', editDet: { to: '28 Jul 26' } })
  await page.evaluate(() => { const mq = window.__mq; mq.scrollUnder(window.__mqSq.rd, 8) })
  await page.waitForTimeout(200)
  const st = await page.evaluate(({ Q, SUB }) => {
    const mq = window.__mq, e = window.__mqSq.editDet
    const toF = [...e.ed.querySelectorAll('.mfield')].find(f => f.querySelector('label').textContent === 'To')
    const inp = toF.querySelector('input')
    const c = mq.ask(inp, Q, SUB, [['Keep to 31 Jul', ''], ['Shorten', 'primary']])
    mq.mark(c, 'New · M2', 'pad', 'p')
    window.__mqCard = c
    return { to: inp.value, card: c.innerText.replace(/\s+/g, ' '), side: c.className }
  }, { Q: A4_Q, SUB: A4_SUB })
  await page.waitForTimeout(250)
  const clip = await page.evaluate(({ sz }) => {
    const c = window.__mqCard.getBoundingClientRect(), r = window.__mqSq.rd.getBoundingClientRect(), panel = window.__mqClipEl.getBoundingClientRect()
    const h = window.__mqSq.rd.closest('.acc-list').previousElementSibling.getBoundingClientRect()
    const top = Math.max(0, Math.min(h.top, c.top) - 10)
    const x = sz === 'd' ? Math.max(0, panel.left - 12) : 0, w = sz === 'd' ? Math.min(innerWidth - x, panel.right + 12 - x) : innerWidth
    return { x, y: top, width: w, height: Math.min(innerHeight, Math.max(c.bottom, r.bottom) + 18) - top }
  }, { sz })
  const f = `R7A4-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, 'A4', sz, 'proposed', `149's admin, Admin → Squadrons, Exercise North's row open on its dates, "To" changed from 31 Jul to 28 Jul. The app's own question card hangs from the To box (pink New · M2): "${A4_Q}" / "${A4_SUB}", buttons Keep to 31 Jul · Shorten (Shorten the default). The mirror of round 6's R4 "Extend …".`)
  notes.push(`a4 ${sz}: ${JSON.stringify({ tb, st })}`)
  await ctx.close()
}

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ALL = { a1: sz => a12(sz, 'a1'), a2: sz => a12(sz, 'a2'), a3, a4 }
try {
  for (const sz of (process.env.MQ_SZ ? process.env.MQ_SZ.split(',') : ['d', 'p'])) {
    console.log('== ' + SIZES[sz].name)
    for (const [k, f] of Object.entries(ALL)) {
      if (ONLY && !ONLY.includes(k)) continue
      try { await f(sz) } catch (e) { errs.push(`[${sz}] ${k} FAILED: ${e.message}`); console.log(k, 'FAILED', e.message) }
    }
  }
} finally { await browser.close() }
let old = {}
try { old = JSON.parse(readFileSync(`${OUT}/manifest.json`, 'utf8')) } catch {}
writeFileSync(`${OUT}/manifest.json`, JSON.stringify({ ...old, ...manifest }, null, 2) + '\n')
console.log('NOTES\n' + notes.join('\n'))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
