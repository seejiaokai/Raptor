// Multi-squadron & detachment — Round 4 pictures (17 Nov 26, chat 93): the agent's design for each of his round 3
// answers (D2113–D2123), drawn as the design note's "## Round 4" items 1–8 say
// (docs/superpowers/specs/2026-11-16-multi-sqn-detachment-design.md).
// Drawn on the REAL running app, today beside proposed, by .claude/skills/brainstorming/mockups-on-the-real-app.md.
// The kit, world(), toEdit(), toBoard(), the Admin → Squadrons builder and the ask card are round 3's
// (docs/mock/2026-11-17-multi-sqn-r3/draw.mjs); the publish call (signOf / setDayApproved) and the week's wave view
// round 2's (docs/mock/2026-11-16-multi-sqn-r2/draw.mjs weekFrame, pic12). Each "today" frame is the app as it draws
// itself; each "proposed" frame clones a real neighbour (marked data-mine), hides an app node (display:none, never
// removed) or, for item 3's A only, MOVES the three lines a real "+ Line" made.
//
// Run from raptor-port/, against a built preview already serving:
//   MQ_URL=http://localhost:4185/ node docs/mock/2026-11-17-multi-sqn-r4/draw.mjs
// MQ_ONLY=it1,it3 draws only those. Pictures and manifest.json go to docs/img/2026-11-17-multi-sqn-r4/; every picture
// is then copied beside the page, into docs/mock/2026-11-17-multi-sqn-r4/img/, so the page reads them from its own
// folder and the publish carries the folder as it is (git stores one copy of each identical file).
// Demo data only. The squadrons are the bare numbers 142 and 149; the detachment the invented "Exercise North", number
// "249"; the places "Home base", "Northern base", "Exercise base" invented; 149's men "Mako", "Jolt", "Brick", "Tusk",
// "Flint", "Rook" invented callsigns re-lettered on 142's own pucks (asserted not on the demo roster).
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, readdirSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4185/'
const OUT = 'docs/img/2026-11-17-multi-sqn-r4'
const R3 = 'docs/img/2026-11-17-multi-sqn-r3'
const PAGEIMG = 'docs/mock/2026-11-17-multi-sqn-r4/img'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
mkdirSync(OUT, { recursive: true }); mkdirSync(PAGEIMG, { recursive: true })

const SIZES = {
  d: { name: 'desktop', opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const DET = 'Exercise North', SHORT = '249'
const MEN149 = ['Mako', 'Jolt', 'Brick', 'Tusk', 'Flint', 'Rook']

const MARK_CSS = `
.mkq { outline: 2px solid #ff2d95 !important; outline-offset: -2px !important; }
.mkq.mkq-o { outline-offset: 2px !important; }
.mkq.mkq-p { outline-offset: 5px !important; }
.mkq-tag { position: absolute; z-index: 60; background: #ff2d95; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; }
`
const TOAST_CSS = `.toast, .toasts, #toast, #toastEl { display: none !important; }`

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
  mq.mark = (el, label, where = 'in') => {
    if (where === 'right' && el.getAttribute('data-mine') === '1') el.style.width = 'fit-content'
    const b = el.getBoundingClientRect()
    if (el.getAttribute('data-mine') === '1' && getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.classList.add('mkq'); if (where === 'below' || where === 'right' || where === 'left' || where === 'above') el.classList.add('mkq-o')
    if (where === 'pad') el.classList.add('mkq-p')
    const t = document.createElement('span')
    t.className = 'mkq-tag'; t.textContent = label; t.setAttribute('data-mine', '1')
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
  // a tag only, no outline — for a part whose own edge is what the picture shows (a ring, a lighter block)
  mq.tag = (el, label, where) => { const t = mq.mark(el, label, where); el.classList.remove('mkq', 'mkq-o', 'mkq-p'); return t }
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
    }
    return bad
  }
  // a wave's typed in-time line naming one formation (the other squadron's, hidden with its lines)
  mq.hideItLine = (g, cs) => {
    const box = g.querySelector('.intimes'); if (!box) return 0
    let n = 0
    // on the week a line is a pair, its text then its own ✕: both go
    for (const l of [...box.children]) if (!l.classList.contains('itx') && new RegExp('\\b' + cs + '\\b').test(l.textContent)) {
      mq.hide(l); n++
      const x = l.nextElementSibling; if (x && x.classList.contains('itx')) mq.hide(x)
    }
    return n
  }
  mq.topH = () => { const t = document.querySelector('.topbar'); return t && mq.vis(t) ? t.getBoundingClientRect().bottom : 0 }
  mq.scrollUnder = (el, gap) => { window.scrollTo(window.scrollX, window.scrollY + el.getBoundingClientRect().top - mq.topH() - gap) }
  mq.days = () => [...document.querySelectorAll('#eWeek > .day')].filter(d => mq.vis(d) && !d.classList.contains('peek'))
  mq.monday = () => mq.days()[0]
  // the grey badge of round 2's look 2 (D2104): the standby lines' MAIN badge recipe, in neutral grey
  mq.badge = (txt, small) => {
    const c = document.createElement('span'); c.className = 'sarole ro'; c.textContent = txt; c.setAttribute('data-mine', '1')
    c.style.background = 'rgba(255,255,255,.08)'; c.style.borderColor = 'rgba(255,255,255,.22)'; c.style.color = 'var(--ink-2)'
    c.style.verticalAlign = 'middle'; c.style.alignSelf = 'center'
    if (small) { c.style.fontSize = '7px'; c.style.padding = '0 4px' }
    return c
  }
  // item 2's quiet grey line: the look of the day head's own date line ("Jul 13 · Today"), measured on the real element
  // and copied whole — no new colour, size or weight
  mq.quiet = (lines) => {
    const src = document.querySelector('#eWeek .day-head .dt')
    const cs = getComputedStyle(src)
    const d = document.createElement('div'); d.setAttribute('data-mine', '1'); d.className = 'mq-quiet'
    for (const p of ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'line-height', 'color']) d.style.setProperty(p, cs.getPropertyValue(p))
    d.style.whiteSpace = 'normal'
    for (const l of lines) { const x = document.createElement('div'); x.textContent = l; d.appendChild(x) }
    window.__mqQuietSrc = { font: cs.fontFamily.split(',')[0], size: cs.fontSize, weight: cs.fontWeight, color: cs.color }
    return d
  }
  // the app's ask card (ui/AskCard.tsx's markup, its global stylesheet)
  mq.unclone = () => {
    document.querySelectorAll('[data-mine]').forEach(e => e.remove())
    document.querySelectorAll('[data-mqhid]').forEach(e => { e.style.removeProperty('display'); e.removeAttribute('data-mqhid') })
    document.querySelectorAll('.mkq').forEach(e => e.classList.remove('mkq', 'mkq-o', 'mkq-p'))
  }
  window.__mq = mq
}

const manifest = {}
const notes = []
const errs = []
const figures = {}
let browser

async function world(sz, { toasts = false } = {}) {
  const ctx = await browser.newContext(SIZES[sz].opts)
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`); console.log('PAGEERROR', String(e)) })
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  await page.goto(URL_)
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(700)
  await page.addStyleTag({ content: MARK_CSS + (toasts ? '' : TOAST_CSS) })
  // the invented callsigns must not be on the demo roster
  const clash = await page.evaluate(names => Object.values(window.PEOPLE).map(p => p.cs).filter(c => names.includes(c)), MEN149)
  if (clash.length) throw new Error('invented callsigns on the roster: ' + clash.join(','))
  return { ctx, page }
}
async function toEdit(page) {
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#page-editsched.on #eWeek .day')
  await page.waitForTimeout(900)
}
async function toBoard(page, di = 0) {
  await toEdit(page)
  await page.evaluate(di => document.querySelector(`#eWeek .day:not(.peek) [data-sbday="${di}"]`).click(), di)
  await page.waitForSelector('.sb-go [data-gline]')
  await page.waitForTimeout(1200)
}
function rec(file, item, sz, kind, caption) { manifest[file] = { item, size: SIZES[sz].name, kind, caption } }
async function shot(page, file, clip) {
  const bad = await page.evaluate(() => window.__mq.checkTags())
  if (bad.length) throw new Error(file + ': ' + bad.join('; '))
  await page.mouse.move(Math.round(page.viewportSize().width / 2), 1)
  await page.waitForTimeout(120)
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}) })
  console.log('  wrote', file)
}
// the published day: four real people sign Monday (the e2e suite's call); names re-lettered for 149's view
const PUBLISH = () => { const w = window; const g = w.signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; w.setDayApproved(0, true) }

// ---------- Admin → Squadrons (round 2's C1 page, D2110), its rows' inset measured from the real Users list ----------
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
// opts.p149: 149's place line; opts.edit149: 149's row open on Place (item 8: no From); opts.newdet: a New detachment
// row open (item 5: the number box); opts.det: the open detachment shown; opts.detPeople: its People line and door (item 6)
async function squadrons(page, opts) {
  return page.evaluate(({ opts, DET, SHORT, MEN149 }) => {
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
    // an editor of the Users list, its fields re-lettered: each [label, kind, value, choices, placeholder]
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
    if (v149) { const k = document.querySelector('.topbar .mark .k'); if (k && mq.vis(k)) { const k2 = mq.strip(k.cloneNode(true)); k2.textContent = '149'; mq.hide(k); k.after(k2) } }
    H('Squadrons · 2')
    const l1 = list()
    R(l1, '142', 'Home base · 61 people')
    const r149 = R(l1, '149', (opts.p149 || 'Northern base') + ' · 48 people' + (v149 ? ' · yours' : ''))
    if (opts.edit149) {
      out.edit = editor(r149, [['Place', 'sel', '', ['Home base · 142', 'Northern base', 'Exercise base', '+ New place…']]],
        'Once saved, 142 and 149 can plan each other\'s people, and clashes between the two are checked. Both squadrons\' schedulers are told.')
    }
    H((v149 ? 'Detachments of 149 · ' : 'Detachments · ') + (opts.det ? 1 : 0))
    const l2 = list()
    let rd = null
    if (opts.det) rd = R(l2, `${SHORT} · ${DET}`, 'Exercise base · 13 Jul – 31 Jul · 6 people', 'Close detachment')
    if (rd && opts.detPeople) {
      // item 6: the row's own grey line says who, and the door under it, the Users editor's own button re-lettered
      const subEl = rd.querySelector('.acc-sub'); subEl.textContent = 'Exercise base · 13 Jul – 31 Jul'
      const ppl = mq.strip(subEl.cloneNode(true)); ppl.textContent = 'People · 6 · ' + MEN149.join(', '); ppl.style.whiteSpace = 'normal'; ppl.style.position = 'relative'; ppl.style.paddingRight = '30px'
      subEl.after(ppl)
      const door = mq.strip(window.__mqBtn.cloneNode(true)); door.textContent = '+ Put people on it'; door.style.whiteSpace = 'nowrap'
      const wrap = document.createElement('div'); wrap.setAttribute('data-mine', '1'); wrap.style.cssText = 'margin:8px 0 2px'; wrap.appendChild(door)
      ppl.after(wrap)
      out.ppl = ppl; out.door = door
    }
    if (opts.newdet) {
      const rn = R(l2, 'New detachment', 'Of 149')
      out.newdet = editor(rn, [['Name', 'in', DET], ['Squadron number', 'in', '', null, SHORT], ['Place', 'sel', '', ['Exercise base', 'Home base', 'Northern base', '+ New place…']], ['People', 'in', 'Through their overseas duty input'], ['From', 'in', '13 Jul 26'], ['To', 'in', '31 Jul 26']])
      out.newdetRow = rn
    } else {
      const add = mq.strip(window.__mqBtn.cloneNode(true)); add.textContent = '+ New detachment'
      const addWrap = document.createElement('div'); addWrap.setAttribute('data-mine', '1'); addWrap.style.cssText = 'margin:10px 0 4px'; addWrap.appendChild(add); sec.appendChild(addWrap)
      out.add = add
    }
    H('Past detachments · 1')
    const l3 = list()
    R(l3, 'Exercise South', 'Closed 6 Mar · its schedules kept, read only')
    const mine = Math.round(sec.querySelector('.acc-name').getBoundingClientRect().left - panel.getBoundingClientRect().left)
    if (mine < realInset) { sec.style.paddingLeft = (realInset - mine) + 'px'; sec.style.paddingRight = (realInset - mine) + 'px'; h3c.style.paddingLeft = (realInset - mine) + 'px' }
    out.inset = { realInset, mine }
    out.r149 = r149; out.rd = rd; out.l1 = l1
    window.__mqSq = out
    window.__mqClipEl = panel
    return { inset: out.inset }
  }, { opts, DET, SHORT, MEN149 })
}
async function adminClip(page, sz, extra = 0) {
  return page.evaluate(({ sz, extra }) => {
    const mq = window.__mq, pg = document.querySelector('#page-admin')
    const panel = window.__mqClipEl, pr = panel.getBoundingClientRect()
    const cats = [...pg.querySelectorAll('button.adm-cat')].filter(mq.vis)
    const left = sz === 'd' && cats.length ? Math.min(pr.left, cats[0].getBoundingClientRect().left) - 12 : 0
    const x = Math.max(0, left), w = sz === 'd' ? Math.min(innerWidth - x, pr.right + 12 - x) : innerWidth
    return { x, y: 0, width: w, height: Math.min(innerHeight, pr.bottom + 14 + extra) }
  }, { sz, extra })
}

// round 3's pictures this round sets beside its own (copied byte for byte — git keeps one copy)
function copyR3() {
  const r3m = JSON.parse(readFileSync(`${R3}/manifest.json`, 'utf8'))
  for (const sz of ['d', 'p']) {
    const map = {
      [`11-sign-149first-142-${sz}-proposed.png`]: `r3-2-sign-${sz}.png`,
      [`10-shared-${sz}-proposed.png`]: `r3-1-board-${sz}.png`,
      [`8-join-${sz}-proposed.png`]: `r3-4a-join-${sz}.png`,
      [`9-joined-${sz}-proposed.png`]: `r3-4b-joined-${sz}.png`,
      [`4-newdet-${sz}-proposed.png`]: `r3-5-newdet-${sz}.png`,
      [`1-place-${sz}-proposed.png`]: `r3-8-place-${sz}.png`,
    }
    for (const [a, b] of Object.entries(map)) {
      copyFileSync(`${R3}/${a}`, `${OUT}/${b}`)
      manifest[b] = { item: 'round 3', size: SIZES[sz].name, kind: 'round 3', caption: `Round 3's picture, unchanged. ${r3m[a] ? r3m[a].caption : ''}` }
    }
  }
  console.log('  copied round 3 pictures')
}

// ---------- item 1: the board's badge on the callsign box's top-right corner (D2117) ----------
// 149's board: 142's RU (two jets and its area) in 149's wave. Today: the real board. Proposed: the RU lines and area one
// shade lighter (look 2) and the grey "142" badge on the callsign box's corner — measured: the line's height before and
// after, and the badge clear of the callsign's letters, the mission box and every button.
async function look2Lines(page, { badge = true } = {}) {
  return page.evaluate(({ badge }) => {
    const mq = window.__mq, g = [...document.querySelectorAll('.sb-go')].find(x => x.offsetParent)
    const kids = [...g.children]
    const ruLines = [...g.querySelectorAll('.sb-line')].filter(l => (l.querySelector('textarea.lin') || {}).value === 'RU')
    if (ruLines.length < 2) return { err: 'RU lines ' + ruLines.length }
    const lastRu = ruLines[ruLines.length - 1]
    const area = kids.slice(kids.indexOf(lastRu)).find(k => k.classList.contains('sb-area'))
    const h0 = ruLines.map(l => l.getBoundingClientRect().height)
    for (const x of [...ruLines, area]) x.style.background = 'rgba(255,255,255,.055)'
    const out = { h0 }
    if (badge) for (const [li, l] of ruLines.entries()) {
      const cs = l.querySelector('textarea.lin'), msn = l.querySelector('textarea.msn')
      const phone = innerWidth < 600
      l.style.position = 'relative'
      const b = mq.badge('142', phone); b.style.position = 'absolute'; b.style.zIndex = '2'; b.style.lineHeight = 'normal'
      l.appendChild(b)
      const lr = l.getBoundingClientRect(), cr = cs.getBoundingClientRect(), br = b.getBoundingClientRect()
      // its middle on the box's top edge; its right edge 3px inside the box's right
      b.style.left = Math.round(cr.right - lr.left - br.width - 3) + 'px'
      b.style.top = Math.round(cr.top - lr.top - br.height / 2) + 'px'
      const B = b.getBoundingClientRect()
      // the callsign's letters: the box's font measured on a canvas, from the box's own left padding
      const ccs = getComputedStyle(cs), ctx = document.createElement('canvas').getContext('2d')
      ctx.font = `${ccs.fontWeight} ${ccs.fontSize} ${ccs.fontFamily}`
      const tw = ctx.measureText(cs.value).width
      const textL = cr.left + parseFloat(ccs.borderLeftWidth) + parseFloat(ccs.paddingLeft), textR = textL + tw
      const fs = parseFloat(ccs.fontSize), lh = parseFloat(ccs.lineHeight) || fs * 1.2
      const textT = cr.top + parseFloat(ccs.borderTopWidth) + parseFloat(ccs.paddingTop) + (lh - fs) / 2
      const hit = r => !(B.right <= r.left || B.left >= r.right || B.bottom <= r.top || B.top >= r.bottom)
      const overlaps = []
      if (!(B.left >= textR + 1 || B.bottom <= textT)) overlaps.push('callsign letters')
      if (hit(msn.getBoundingClientRect())) overlaps.push('mission box')
      for (const x of g.querySelectorAll('button, input, textarea, .puck')) if (x !== cs && mq.vis(x) && hit(x.getBoundingClientRect())) overlaps.push(x.tagName + '.' + x.className)
      // nothing above it in the line: the badge's top stays inside the line
      if (B.top < lr.top - 0.5) overlaps.push('above the line')
      // the room each side: how many letters the box holds before the badge would touch them
      const roomPx = Math.round(B.left - textL)
      // a long callsign runs under the badge: is the badge clear of its capital letters' tops? the glyphs' own
      // measures (the font's ascent and the capitals' height) from the same canvas, the line centred in the box
      const m = ctx.measureText('WARHAWK'), fA = m.fontBoundingBoxAscent, fD = m.fontBoundingBoxDescent
      const baseline = cr.top + parseFloat(ccs.borderTopWidth) + parseFloat(ccs.paddingTop) + (lh - (fA + fD)) / 2 + fA
      const capTop = baseline - m.actualBoundingBoxAscent
      if (li === 0) out.badge = { w: Math.round(B.width), h: Math.round(B.height), top: Math.round(B.top - lr.top), csBox: [Math.round(cr.width), Math.round(cr.height)], textW: Math.round(tw), gapToText: Math.round(B.left - textR), roomPx, capGap: +(capTop - B.bottom).toFixed(1), longW: Math.round(m.width) }
      out.overlaps = (out.overlaps || []).concat(overlaps)
      // a clipping ancestor would cut the badge
      for (let a = b.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        const s = getComputedStyle(a)
        if (s.overflowX !== 'visible' || s.overflowY !== 'visible') { const c = a.getBoundingClientRect(); if (B.top < c.top - 0.5 || B.right > c.right + 0.5) overlaps.push('clipped by ' + a.className) }
      }
      if (li === 0) window.__mqBadge = b
    }
    if (badge && !out.overlaps) out.overlaps = []
    out.h1 = ruLines.map(l => l.getBoundingClientRect().height)
    window.__mqClipEl = g; window.__mqRu = ruLines; window.__mqArea = area
    return out
  }, { badge })
}
async function boardTop(page) {
  // the wave's first line brought under the board's bar, the wave head just above it
  await page.evaluate(() => { const b = [...document.querySelectorAll('.sb-go [data-gline]')].filter(x => x.offsetParent)[0]; b.scrollIntoView({ block: 'start' }) })
  await page.evaluate(() => { const sc = [...document.querySelectorAll('.sb-boardwrap, .sb-main')].find(e => e.scrollHeight > e.clientHeight); if (sc) sc.scrollTop -= 70 })
  await page.waitForTimeout(400)
}
async function ruClip(page, sz) {
  return page.evaluate(sz => {
    const g = window.__mqClipEl, gr = g.getBoundingClientRect()
    if (sz === 'd') { const x = Math.max(0, gr.left - 6), y = Math.max(0, gr.top - 6); return { x, y, width: Math.min(innerWidth - x, gr.width + 12), height: Math.min(innerHeight - y, gr.height + 12) } }
    // phone: VL's second jet's foot to RU's area — the RU formation whole, with the line above it for context
    const ru = window.__mqRu, top = ru[0].getBoundingClientRect().top - 40, bot = window.__mqArea.getBoundingClientRect().bottom + 6
    return { x: 0, y: Math.max(0, top), width: innerWidth, height: Math.min(innerHeight - Math.max(0, top), bot - top) }
  }, sz)
}
async function it1(sz) {
  const { ctx, page } = await world(sz)
  await toBoard(page)
  await boardTop(page)
  if (sz === 'p') {
    // on a phone the RU formation sits below the screen: bring its first line under the bar, the VL line above in part
    await page.evaluate(() => { const g = [...document.querySelectorAll('.sb-go')].find(x => x.offsetParent); const l = [...g.querySelectorAll('.sb-line')].filter(l => (l.querySelector('textarea.lin') || {}).value === 'RU')[0]; const sc = [...document.querySelectorAll('.sb-boardwrap, .sb-main')].find(e => e.scrollHeight > e.clientHeight); const bar = document.querySelector('.sb-top').getBoundingClientRect().bottom; sc.scrollTop += l.getBoundingClientRect().top - bar - 120 })
    await page.waitForTimeout(300)
  }
  // today: the real board, nothing drawn in
  const m0 = await page.evaluate(() => { const g = [...document.querySelectorAll('.sb-go')].find(x => x.offsetParent); window.__mqClipEl = g; window.__mqRu = [...g.querySelectorAll('.sb-line')].filter(l => (l.querySelector('textarea.lin') || {}).value === 'RU'); const k = [...g.children]; window.__mqArea = k.slice(k.indexOf(window.__mqRu[1])).find(x => x.classList.contains('sb-area')); return window.__mqRu.map(l => l.getBoundingClientRect().height) })
  const clip = await ruClip(page, sz)
  const f0 = `1-badge-${sz}-today.png`
  await shot(page, f0, clip)
  rec(f0, '1', sz, 'today', `Real. 149's Scheduler Board (142's own board stands in): its 1st wave, with RU standing for 142's formation in 149's wave. Today nothing marks RU as the other squadron's.`)
  const m = await look2Lines(page)
  if (m.err) throw new Error('it1: ' + m.err)
  if (m.overlaps.length) throw new Error('it1 badge overlaps: ' + m.overlaps.join(', '))
  if (m.h0.some((h, i) => Math.abs(h - m.h1[i]) > 0.5) || m0.some((h, i) => Math.abs(h - m.h1[i]) > 0.5)) throw new Error('it1: line height changed ' + JSON.stringify([m0, m.h1]))
  await page.evaluate(() => window.__mq.mark(window.__mqBadge, '1a', 'pad'))
  const f1 = `1-badge-${sz}-proposed.png`
  await shot(page, f1, clip)
  figures['1-' + sz] = { lineBefore: m0, lineAfter: m.h1, badge: m.badge }
  rec(f1, '1', sz, 'proposed', `Drawn in, on 149's board. 142's RU, both jets and its area line, one shade lighter (look 2, as ruled). The grey "142" badge (mark 1a on the first) sits on each RU line's callsign box, at its top-right corner: its middle on the box's top edge, its right edge 3px inside the box. Each line is ${Math.round(m.h1[0])}px tall before and after: the badge adds no height. It clears "RU", the mission box and every button (measured); a callsign long enough to run under it passes ${m.badge.capGap}px below it.`)
  notes.push(`it1 ${sz}: ${JSON.stringify(m)}`)
  await ctx.close()
}

// ---------- item 2: signing — one rule: the day head's status is the only "published" mark on a schedule ----------
// Edit Schedule, Monday, one continuous frame: the top bar, the day head (and its sign-off strip), the wave. Between the
// day head and the 1st wave the app draws the issues bar and the Common Programme: hidden here (display:none), named in
// the caption. 149's view: 142's top bar re-lettered "149", RU in look 2 (week: badge after the mission, lighter).
// 142's view: VL hidden (149's), the wave head 149's grey badge, under it the quiet grey line in words.
async function weekView(sz, { pub, view, quiet, tags, signNames }) {
  const { ctx, page } = await world(sz)
  if (pub) await page.evaluate(PUBLISH)
  await toEdit(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(200)
  const m = await page.evaluate(({ view, quiet, tags, signNames }) => {
    const mq = window.__mq, mon = mq.monday()
    const head = mon.querySelector('.day-head'), body = mon.querySelector('.day-body')
    const g = mon.querySelector('.go')
    const forms = [...g.querySelectorAll('.form')]
    const ru = forms.find(x => x.querySelector('.csmsn .ntx').textContent.trim() === 'RU')
    const vl = forms.find(x => x.querySelector('.csmsn .ntx').textContent.trim() === 'VL')
    if (!ru || !vl) return { err: 'RU/VL' }
    // the sections between the day head and the 1st wave: hidden, each named
    const hidden = []
    const wavesSec = g.closest('.dsec')
    for (const s of [...body.children]) { if (s === wavesSec) break; hidden.push(s.innerText.replace(/\s+/g, ' ').trim().slice(0, 30)); mq.hide(s) }
    // the waves after the 1st, in the same section: hidden too (below the frame anyway)
    for (const og of [...wavesSec.querySelectorAll('.go')].slice(1)) mq.hide(og)
    // on a published day the sign-off boxes wait, empty, for the next amendment ("4 to sign"): hidden and named, so
    // the picture's one "signed" fact is the SIGNED line above them
    const so = mon.querySelector('.signoff.day-sign')
    if (so && /ORIG/.test(head.innerText)) { mq.hide(so); hidden.unshift('the empty sign-off boxes, waiting for the next amendment') }
    const out = { hidden, dayChip: head.querySelector('.dhver').innerText.trim() }
    const chip = head.querySelector('.dhver')
    if (view === '149') {
      // the top bar's own number re-lettered: 142's app stands in for 149's
      const k = document.querySelector('.topbar .mark .k'); const k2 = mq.strip(k.cloneNode(true)); k2.textContent = '149'; mq.hide(k); k.after(k2)
      // the sign-off strip's names, for a signed 149 day, re-lettered to 149's invented men
      if (signNames) {
        // the four signers' callsigns, wherever the strip prints them (a chosen option, a plain name), become 149's men
        const map = {}; ['ignite', 'bane', 'stiff', 'pump'].forEach((id, i) => { map[window.PEOPLE[id].cs] = signNames[i] })
        // the day head, the "Signed ORIG" line and the sign-off strip: everywhere above the waves (never a puck)
        for (const s of mon.querySelectorAll('select')) { if (s.closest('.go')) continue; const o = s.options[s.selectedIndex]; if (o && map[o.textContent.trim()]) o.textContent = map[o.textContent.trim()] }
        const tw = document.createTreeWalker(mon, NodeFilter.SHOW_TEXT); let tn
        while ((tn = tw.nextNode())) {
          const p = tn.parentElement; if (!p || p.closest('.go') || p.closest('.dwbox') || p.tagName === 'OPTION') continue
          for (const [a, b] of Object.entries(map)) tn.nodeValue = tn.nodeValue.replace(new RegExp('\\b' + a + '\\b', 'g'), b)
        }
      }
      const leaves = [...ru.querySelector('.csmsn').querySelectorAll('*')].filter(e => !e.children.length && e.textContent.trim())
      const msn = leaves.find(e => e.textContent.trim() === 'BFM')
      const phone = innerWidth < 600, c = mq.badge('142', phone)
      if (phone) { c.style.display = 'block'; c.style.width = 'fit-content'; c.style.marginTop = '2px'; msn.after(c) }
      else { c.style.marginLeft = '5px'; c.style.position = 'relative'; c.style.top = '-1px'; msn.appendChild(c) }
      ru.style.background = 'rgba(255,255,255,.055)'
      chip.style.position = 'relative'; mq.mark(chip, tags[0], 'below')
    } else {
      mq.hide(vl); out.itHidden = mq.hideItLine(g, "VL")
      const itb = g.querySelector('[data-itadd]'); if (itb) mq.hide(itb)
      const tab = g.querySelector('.go-tab')
      const b = mq.badge('149'); b.style.marginLeft = '8px'; tab.querySelector('.asd').after(b)
      const q = mq.quiet(quiet)
      const name = tab.querySelector('.ntx') || tab.querySelector('.asd')
      q.style.padding = `0 10px 6px ${Math.round(name.getBoundingClientRect().left - tab.getBoundingClientRect().left)}px`
      q.style.background = getComputedStyle(tab).backgroundColor
      tab.after(q)
      chip.style.position = 'relative'; mq.mark(chip, tags[0], 'below')
      mq.mark(q, tags[1], 'right')
      out.quietSrc = window.__mqQuietSrc
      out.waveTab = tab.innerText.replace(/\s+/g, ' ').trim()
    }
    return out
  }, { view, quiet, tags, signNames })
  if (m.err) throw new Error('weekView ' + JSON.stringify(m))
  await page.waitForTimeout(250)
  // one continuous frame: from the top of the screen to the 1st wave's foot, across Monday's column
  const clip = await page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday(), g = mon.querySelector('.go:not([data-mqhid])')
    let r = g.getBoundingClientRect()
    if (r.bottom > innerHeight - 4) { window.scrollBy(0, r.bottom - innerHeight + 8); r = g.getBoundingClientRect() }
    const mr = mon.getBoundingClientRect()
    const right = innerWidth < 600 ? innerWidth : Math.min(innerWidth, mr.right + 8)
    return { x: 0, y: 0, width: right, height: Math.min(innerHeight, Math.round(r.bottom + 8)) }
  })
  return { ctx, page, m, clip }
}
async function it2(sz) {
  const cases = [
    { file: '2-A-149', pub: true, view: '149', tags: ['2a'], signNames: ['Mako', 'Jolt', 'Brick', 'Tusk'],
      cap: m => `Moment 1 · 149 has published, 142 has not. 149's schedule. Its day head reads "${m.dayChip}" (mark 2a, real: 149's four have signed), so the whole day is published, the wave and 142's RU in it included. RU wears only its grey "142" badge and the lighter block: its state is 149's day's.` },
    { file: '2-A-142', pub: false, view: '142', tags: ['2b', '2c'], quiet: ['149\'s wave · 149 publishes it · published by 149'],
      cap: m => `Moment 1 · 149 has published, 142 has not. 142's schedule. Its day head reads "${m.dayChip}" (mark 2b, real): 142's day is not published. The 1st wave is 149's: its head wears 149's grey badge, and under it one quiet grey line (mark 2c): "149's wave · 149 publishes it · published by 149". No status chip on the wave, so nothing on 142's day reads as published.` },
    { file: '2-B-142', pub: true, view: '142', tags: ['2d', '2e'], quiet: ['149\'s wave · 149 publishes it · not published yet', 'RU goes out when 149 publishes.'],
      cap: m => `Moment 2 · 142 has published, 149 has not. 142's schedule. Its day head reads "${m.dayChip}" (mark 2d, real: 142's four signed 142's own day). The quiet line under 149's wave (mark 2e): "149's wave · 149 publishes it · not published yet. RU goes out when 149 publishes." So 142's own RU, though it sits on a published day, is plainly still waiting.` },
    { file: '2-B-149', pub: false, view: '149', tags: ['2f'],
      cap: m => `Moment 2 · 142 has published, 149 has not. 149's schedule. Its day head reads "${m.dayChip}" (mark 2f, real): 149's day, and 142's RU in its wave, are not published yet. RU wears only its badge.` },
  ]
  for (const c of cases) {
    const { ctx, page, m, clip } = await weekView(sz, c)
    const f = `${c.file}-${sz}-proposed.png`
    await shot(page, f, clip)
    rec(f, '2', sz, 'proposed', c.cap(m) + ` Hidden between the day head and the wave: ${m.hidden.join(' · ')}. (142's Monday stands in for both schedules${c.view === '149' ? '; the top bar\'s "142" re-lettered "149"' : ''}.)`)
    notes.push(`it2 ${c.file} ${sz}: ${JSON.stringify(m)}`)
    await ctx.close()
  }
}

// ---------- item 3: feedback for "+ Line" (D2115, lesson 94) — three real presses, today, A and B ----------
async function it3(sz) {
  for (const which of ['today', 'A', 'B']) {
    const { ctx, page } = await world(sz, { toasts: which === 'today' })
    await toBoard(page)
    await page.evaluate(() => { const b = [...document.querySelectorAll('.sb-go [data-gline]')].filter(x => x.offsetParent)[0]; b.scrollIntoView({ block: 'center' }) })
    await page.waitForTimeout(400)
    const at = await page.evaluate(() => { const r = [...document.querySelectorAll('.sb-go [data-gline]')].filter(x => x.offsetParent)[0].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    for (let i = 0; i < 3; i++) { await page.mouse.click(at.x, at.y); await page.waitForTimeout(300) }
    const info = await page.evaluate(({ which, at }) => {
      const mq = window.__mq, g = [...document.querySelectorAll('.sb-go')].find(x => x.offsetParent)
      const btn = g.querySelector('.sb-go-h [data-gline]')
      const fresh = [...g.querySelectorAll('.sb-line.sb-fresh')]
      const bar = document.querySelector('.sb-top').getBoundingClientRect().bottom
      const inView = () => fresh.filter(f => { const r = f.getBoundingClientRect(); return r.top >= bar - 0.5 && r.bottom <= innerHeight + 0.5 }).length
      const btn0 = btn.getBoundingClientRect()
      const out = { fresh: fresh.length, btnAt: [Math.round(btn0.left), Math.round(btn0.top)], pressedAt: [Math.round(at.x), Math.round(at.y)] }
      // each new line made by "+ Line" comes with its own area line after it: the pair moves as one
      const pairs = fresh.map(f => [f, f.nextElementSibling && f.nextElementSibling.classList.contains('sb-area') && !f.nextElementSibling.nextElementSibling?.classList?.contains('sb-fresh') === false ? f.nextElementSibling : (f.nextElementSibling && f.nextElementSibling.classList.contains('sb-area') ? f.nextElementSibling : null)])
      out.pairs = pairs.map(p => !!p[1])
      if (which === 'today') {
        const t = [...document.querySelectorAll('body *')].find(e => mq.vis(e) && e.children.length === 0 && e.textContent.trim() === 'Line added')
        out.toast = !!t
        btn.style.position = 'relative'; mq.mark(btn, '3a', 'below')
      } else if (which === 'A') {
        // A: the three new lines (each with its area line) moved to the top of the wave, straight under the column
        // headings, newest first — the app's own nodes moved, not cloned; the ring is the app's own (.sb-fresh)
        const cols = g.querySelector('.sb-lcols')
        let after = cols
        for (const [l, a] of pairs.slice().reverse()) { after.after(l); after = l; if (a) { l.after(a); after = a } }
        fresh[fresh.length - 1].style.position = 'relative'; mq.tag(fresh[fresh.length - 1], '3b', innerWidth < 600 ? 'br' : 'in')
      } else {
        // B: the lines stay at the foot, as today; beside "+ Line" a small count, the head's own "+ In-time" button
        // re-lettered — a tap would bring the new lines into view
        const tpl = g.querySelector('.sb-go-h [data-itadd]') || btn
        const c = mq.strip(tpl.cloneNode(true)); c.textContent = '3 new ↓'; c.style.whiteSpace = 'nowrap'
        // on a phone the head's second row is full: the count stands on its first row, after Traffic, where there is room,
        // so "+ Line" still never moves
        const traffic = [...g.querySelectorAll('.sb-go-h button')].find(b => b.textContent.trim() === 'Traffic')
        if (innerWidth < 600 && traffic) { c.style.marginLeft = '8px'; traffic.after(c) } else btn.after(c)
        mq.mark(c, '3c', 'below')
      }
      const btn1 = btn.getBoundingClientRect()
      out.btnMoved = Math.round(Math.abs(btn1.left - btn0.left) + Math.abs(btn1.top - btn0.top))
      out.inView = inView()
      // the newest line wholly in view?
      const nr = fresh[fresh.length - 1].getBoundingClientRect(); out.newestInView = nr.top >= bar - 0.5 && nr.bottom <= innerHeight + 0.5
      return out
    }, { which, at })
    if (info.btnMoved) throw new Error(`it3 ${which}: "+ Line" moved ${info.btnMoved}px`)
    if (info.fresh !== 3) throw new Error(`it3 ${which}: fresh ${info.fresh}`)
    await page.waitForTimeout(150)
    const f = `3-line-${which}-${sz}-${which === 'today' ? 'today' : 'proposed'}.png`
    await shot(page, f)
    figures[`3-${which}-${sz}`] = { inView: info.inView, newestInView: info.newestInView }
    const words = {
      today: `Real. 142's Scheduler Board, "+ Line" (mark 3a) pressed three times where it stood. The three blank lines went to the wave's foot: ${info.inView} of 3 wholly on this ${SIZES[sz].name} screen. The screen does not move, and the passing note "Line added" says the same words each time.`,
      A: `A, recommended, drawn in. The same three real presses; "+ Line" has not moved. Each new line goes in at the top of the wave, straight under the column headings, newest on top (mark 3b on the newest), each in the board's own just-added blue ring. ${info.inView} of 3 new lines wholly in view; the newest always is. The three lines the app made were moved there; nothing was copied. No passing note is needed.`,
      B: `B, drawn in. The same three real presses; the lines stay at the wave's foot, as today. Beside "+ Line" a small count, "3 new ↓" (mark 3c, the head's own button look re-lettered): a tap brings the new lines into view.${sz === 'p' ? ' On a phone the head\'s second row is full, so the count stands on its first row, after Traffic.' : ''} ${info.inView} of 3 new lines in view until it is tapped. "+ Line" has not moved.`,
    }
    rec(f, '3', sz, which === 'today' ? 'today' : 'proposed', words[which] + ` (142's 1st wave; the full screen, so what is out of view shows.)`)
    notes.push(`it3 ${which} ${sz}: ${JSON.stringify(info)}`)
    await ctx.close()
  }
}

// ---------- item 4: his three questions ----------
// (a) "+ Wave" on 142's board when 149 has no wave that day: the "Join a 149 wave" group, greyed (the menu's own
// disabled look, .wavemenu button.wm:disabled)
async function it4a(sz) {
  const { ctx, page } = await world(sz)
  await toBoard(page)
  await page.evaluate(() => [...document.querySelectorAll('[data-wvadd]')].find(b => b.offsetParent).click())
  await page.waitForTimeout(600)
  const info = await page.evaluate(() => {
    const mq = window.__mq, menu = [...document.querySelectorAll('.wavemenu')].find(e => mq.vis(e))
    if (!menu) return { err: 'no wave menu' }
    const kinds = menu.querySelectorAll('.wm-row')[0]
    const box = document.createElement('div'); box.setAttribute('data-mine', '1')
    box.innerHTML = `<h5>Join a 149 wave</h5><div class="wm-row" style="flex-direction:column;align-items:stretch"><button class="wm" disabled>149 has no wave on Mon 13 Jul</button></div>`
    kinds.after(box); box.style.position = 'relative'; box.style.paddingTop = '6px'; box.style.paddingLeft = '4px'
    const op = getComputedStyle(box.querySelector('button')).opacity
    mq.mark(box, '4a')
    const mr = menu.getBoundingClientRect(), over = mr.bottom - innerHeight + 12
    if (over > 0 && getComputedStyle(menu).position !== 'static') menu.style.top = Math.max(mq.topH() + 6, mr.top - over) + 'px'
    window.__mqClipEl = menu
    return { op, h: [...menu.querySelectorAll('h5')].map(h => h.textContent.trim()) }
  })
  if (info.err) throw new Error('it4a ' + info.err)
  if (info.op !== '0.45') throw new Error('it4a: the greyed look is not the app\'s own: ' + info.op)
  const clip = await page.evaluate(() => { const r = window.__mqClipEl.getBoundingClientRect(); const x = Math.max(0, r.left - 10), y = Math.max(0, r.top - 10); return { x, y, width: Math.min(innerWidth - x, r.width + 20), height: Math.min(innerHeight - y, r.height + 20) } })
  const f = `4a-nowave-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, '4', sz, 'proposed', `142's schedule. Drawn in (mark 4a): 142's "+ Wave" menu (real) on a day 149 has no wave. The "Join a 149 wave" group still shows, its one row greyed in the menu's own "can't press" look: "149 has no wave on Mon 13 Jul". 142 then picks a wave of its own above, and 149 may join it.`)
  notes.push(`it4a ${sz}: ${JSON.stringify(info)}`)
  await ctx.close()
}
// (b) 142's board just after "Join a 149 wave": round 3's picture 9 with item 2's quiet line in place of its chips
async function it4b(sz) {
  const { ctx, page } = await world(sz)
  await toBoard(page)
  await boardTop(page)
  const at = await page.evaluate(() => { const r = [...document.querySelectorAll('.sb-go [data-gline]')].filter(x => x.offsetParent)[0].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  await page.mouse.click(at.x, at.y)
  await page.waitForTimeout(500)
  const m = await page.evaluate(() => {
    const mq = window.__mq, g = [...document.querySelectorAll('.sb-go')].find(x => x.offsetParent)
    const fresh = [...g.querySelectorAll('.sb-line.sb-fresh')]
    if (fresh.length !== 1) return { err: 'fresh lines ' + fresh.length }
    const areas = [...g.querySelectorAll('.sb-area')]
    for (const l of g.querySelectorAll('.sb-line:not(.sb-fresh)')) mq.hide(l)
    areas.slice(0, -1).forEach(a => mq.hide(a))
    const its = g.querySelector('.intimes'); if (its) mq.hide(its)   // 149's in-time lines, with its lines
    for (const s of ['[data-itadd]', '[data-gdel]', '[data-sortsec]']) { const b = g.querySelector('.sb-go-h ' + s); if (b) mq.hide(b) }
    for (const b of g.querySelectorAll('button')) { if (b.closest('.sb-go-h') || b.closest('.sb-line')) continue; if (b.textContent.trim() === '✕' || b.textContent.trim() === '×' || b.querySelector('svg')) mq.hide(b) }
    const h = g.querySelector('.sb-go-h')
    const b = mq.badge('149'); b.style.margin = '0 6px'
    h.querySelector('.airbtn').after(b)
    const q = mq.quiet(['149\'s wave · 149 publishes it · not published yet'])
    const goName = [...h.querySelectorAll('span')].find(s => s.textContent.trim() === 'Go 1')
    q.style.padding = `2px 10px 6px ${Math.round(goName.getBoundingClientRect().left - h.getBoundingClientRect().left)}px`
    h.after(q)
    mq.mark(q, '4b', 'right')
    const f = fresh[0]; f.style.position = 'relative'; mq.tag(f, '4c', innerWidth < 600 ? 'br' : 'in')
    window.__mqClipEl = g
    return { ok: 1 }
  })
  if (m.err) throw new Error('it4b: ' + m.err)
  const clip = await page.evaluate(() => { const g = window.__mqClipEl, r = g.getBoundingClientRect(); const x = Math.max(0, r.left - 6), y = Math.max(0, r.top - 6); return { x, y, width: Math.min(innerWidth - x, r.width + 12), height: Math.min(innerHeight - y, r.height + 12) } })
  const f = `4b-joined-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, '4', sz, 'proposed', `142's schedule, its Scheduler Board right after "Join a 149 wave" (round 3's picture 9, redrawn). The wave is 149's: its head wears 149's grey badge, and under it the quiet line of item 2 (mark 4b), "149's wave · 149 publishes it · not published yet", in place of round 3's "149 DRAFT" chips. Mark 4c: 142's blank line inside 149's wave, in the board's own just-added ring, made by a real press of "+ Line". 149's lines and in-time lines are hidden (142 sees only its own, D2105), and so are "+ In-time", "Auto sort" and "✕ Wave", which are 149's. (142's 1st wave stands in for 149's.)`)
  await ctx.close()
}
// (c) who may change what (D2114): on 149's board, RU (142's line in 149's wave) "142 or 149 may change it", VL "149 only"
async function it4c(sz) {
  const { ctx, page } = await world(sz)
  await toBoard(page)
  await boardTop(page)
  const m = await look2Lines(page)
  if (m.err) throw new Error('it4c: ' + m.err)
  await page.evaluate(() => {
    const mq = window.__mq, g = window.__mqClipEl
    const vl = [...g.querySelectorAll('.sb-line')].filter(l => (l.querySelector('textarea.lin') || {}).value === 'VL')
    vl[0].style.position = 'relative'; window.__mqRu[0].style.position = 'relative'
    // on a phone the line's top right holds its times: the tag sits in its empty bottom right
    const at = innerWidth < 600 ? 'br' : 'in'
    mq.mark(vl[0], '4d · 149 only', at)
    mq.mark(window.__mqRu[0], '4e · 142 or 149 may change it', at)
  })
  let clip
  if (sz === 'd') clip = await ruClip(page, 'd')
  else clip = await page.evaluate(() => { const bar = document.querySelector('.sb-top').getBoundingClientRect().bottom; return { x: 0, y: bar, width: innerWidth, height: innerHeight - bar } })
  const f = `4c-who-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, '4', sz, 'proposed', `149's schedule, its Scheduler Board (142's board stands in). Mark 4d: VL, 149's own line, is changed by 149's scheduler only. Mark 4e: RU, 142's line in 149's wave, concerns both squadrons, so either scheduler may change it, from either schedule (D2114); RU wears item 1's badge and the lighter block.${sz === 'p' ? ' On a phone RU is further down the board.' : ''}`)
  await ctx.close()
}

// ---------- item 5: the number box (D2116) ----------
async function it5(sz) {
  const { ctx, page } = await world(sz)
  await toAdmin(page)
  await squadrons(page, { p149: 'Home base', newdet: true, viewer: '149' })
  const ph = await page.evaluate(() => {
    const mq = window.__mq, e = window.__mqSq.newdet
    const num = e.cols[0].querySelectorAll('.mfield')[1]
    mq.mark(num, '5a', 'pad')
    const pf = e.cols[1].querySelectorAll('.mfield')[1], inp = pf.querySelector('input'), s = document.createElement('div')
    s.setAttribute('data-mine', '1'); s.className = 'acc-sub'; s.textContent = 'Through their overseas duty input'; s.style.cssText = 'display:block;padding:10px 0'
    mq.hide(inp); inp.after(s)
    const i = num.querySelector('input'), cs = getComputedStyle(i, '::placeholder')
    return { value: i.value, placeholder: i.getAttribute('placeholder'), phColor: cs.color }
  })
  if (ph.value !== '' || ph.placeholder !== '249') throw new Error('it5 ' + JSON.stringify(ph))
  const clip = await adminClip(page, sz)
  const f = `5-number-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, '5', sz, 'proposed', `149's admin, Admin → Squadrons, "+ New detachment" pressed. Drawn in (mark 5a): the second box is labelled "Squadron number" and is empty, a faded "249" inside it as the example (the box's own faded placeholder look). The rest as round 3 drew it. "To" stays as drawn, R1 still open.`)
  notes.push(`it5 ${sz}: ${JSON.stringify(ph)}`)
  await ctx.close()
}

// ---------- item 6: several men at once (D2120) — the detachment's People line and its door ----------
async function it6(sz) {
  {
    const { ctx, page } = await world(sz)
    await toAdmin(page)
    await squadrons(page, { p149: 'Home base', det: true, detPeople: true, viewer: '149' })
    await page.evaluate(() => { const mq = window.__mq, s = window.__mqSq; mq.mark(s.ppl, '6a', 'in'); mq.mark(s.door, '6b', 'pad') })
    const clip = await adminClip(page, sz)
    const f = `6-row-${sz}-proposed.png`
    await shot(page, f, clip)
    rec(f, '6', sz, 'proposed', `149's admin, Admin → Squadrons. Drawn in. The open detachment's row says who is on it (mark 6a): "People · 6 · ${MEN149.join(', ')}", read from their overseas duty inputs. Under it the door (mark 6b), "+ Put people on it", the Users editor's own button re-lettered.`)
    await ctx.close()
  }
  {
    // the door opens the Inputs page's own window with its several-people picker: reached by real presses —
    // "+ Input", the "Several people" switch, six pucks — its type set to OD through the box's own change event
    const { ctx, page } = await world(sz)
    await page.evaluate(() => window.go('inputs'))
    await page.waitForTimeout(800)
    await page.click('#inListBtn'); await page.waitForTimeout(400)
    await page.click('#inNew'); await page.waitForTimeout(700)
    await page.locator('[data-testid=pp-several]').first().click(); await page.waitForTimeout(300)
    // Saber, the signed-in man, comes picked: unpick him, then pick three pilots and three WSOs
    const picks = await page.evaluate(() => {
      const g = k => [...document.querySelectorAll(`[data-ppgroup="${k}"] .pp-puck`)]
      const on = [...document.querySelectorAll('.pp-puck.on')].map(b => b.getAttribute('data-pp'))
      const free = k => g(k).map(b => b.getAttribute('data-pp')).filter(id => !on.includes(id)).slice(0, 3)
      return { on, pil: free('pilots'), wso: free('wsos') }
    })
    const tapPuck = id => page.locator(`[data-ppgroup] .pp-puck[data-pp="${id}"]`).first().click()
    // the six first, then Saber off: the picker keeps at least one man, so the only one cannot be unpicked first
    for (const id of [...picks.pil, ...picks.wso]) { await tapPuck(id); await page.waitForTimeout(80) }
    for (const id of picks.on) { await tapPuck(id); await page.waitForTimeout(120) }
    picks.after = await page.evaluate(() => [...document.querySelectorAll('.pp-puck.on')].map(b => b.getAttribute('data-pp')))
    await page.evaluate(() => {
      const s = document.querySelector('#inpEditType')
      const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set
      set.call(s, 'OD'); s.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await page.waitForTimeout(500)
    // an overseas duty runs whole days: "all day" ticked by a real press, before anything is drawn in (the window
    // redraws on it)
    await page.locator('.floatwin.inpedwin').getByText('all day', { exact: true }).first().click()
    await page.waitForTimeout(300)
    const st = await page.evaluate(({ ids, MEN149, DET, SHORT }) => {
      const mq = window.__mq
      const on = [...document.querySelectorAll('.pp-puck.on')]
      const out = { picked: on.map(b => b.getAttribute('data-pp')), type: document.querySelector('#inpEditType').value, count: (document.querySelector('[data-testid=pp-count]') || {}).textContent }
      // the six picked pucks re-lettered as 149's men
      ids.forEach((id, i) => { const b = document.querySelector(`[data-ppgroup] .pp-puck[data-pp="${id}"]`); const leaf = [...b.querySelectorAll('*')].find(e => !e.children.length && e.textContent.trim() === window.PEOPLE[id].cs); if (leaf) leaf.textContent = MEN149[i]; else out.noLeaf = (out.noLeaf || 0) + 1 })
      const pp = document.querySelector('[data-testid=pp]')
      mq.mark(pp.querySelector('.pp-top'), '6c', 'pad')
      // the Detachment choice under Type (round 3's 5a, ruled D2101), the Type box cloned
      const sel = document.querySelector('#inpEditType'), typeF = sel.closest('.inped-f')
      const f = mq.strip(typeF.cloneNode(true))
      const k = f.querySelector('.inped-k'); k.textContent = 'Detachment'
      const kh = f.querySelector('.inped-kh'); if (kh && kh !== k) [...kh.children].forEach(c => { if (c !== k) c.remove() })
      const s2 = f.querySelector('select'); s2.innerHTML = ''
      for (const t of ['None', `${SHORT} · ${DET}`]) { const o = document.createElement('option'); o.textContent = t; s2.appendChild(o) }
      s2.selectedIndex = 1
      typeF.after(f)
      window.__mqDet = f   // marked for the second picture, where it is in view
      const tIn = document.querySelector('#inpEditOwnTitle')
      if (tIn) { const tf = tIn.closest('.inped-f'), t2 = mq.strip(tf.cloneNode(true)); const i2 = t2.querySelector('input'); i2.setAttribute('value', DET); i2.value = DET; mq.hide(tf); tf.after(t2) }
      out.title = !!tIn
      // the window and its scroller
      let win = pp; while (win && !/floatwin|fwin/.test(win.className + '')) win = win.parentElement
      let sc = pp.parentElement; while (sc && !(sc.scrollHeight > sc.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement
      window.__mqWin = win || pp.closest('[role=dialog]'); window.__mqSc = sc
      out.win = window.__mqWin && window.__mqWin.className
      return out
    }, { ids: [...picks.pil, ...picks.wso], MEN149, DET, SHORT })
    if (st.picked.length !== 6 || st.type !== 'OD') throw new Error('it6 picker ' + JSON.stringify({ st, picks }))
    // a neutral tap on the window's title to clear the last press's ring
    await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur())
    const winClip = () => page.evaluate(() => { const r = window.__mqWin.getBoundingClientRect(); const x = Math.max(0, r.left - 4), y = Math.max(0, r.top - 4); return { x, y, width: Math.min(innerWidth - x, r.width + 8), height: Math.min(innerHeight - y, r.height + 8) } })
    await page.evaluate(() => { if (window.__mqSc) window.__mqSc.scrollTop = 0 }); await page.waitForTimeout(200)
    const f1 = `6-pick-${sz}-proposed.png`
    await shot(page, f1, await winClip())
    rec(f1, '6', sz, 'proposed', `What "+ Put people on it" opens: the Inputs page's own "New input" window with its several-people picker (real: "+ Input", the "Several people" switch and six pucks pressed). Mark 6c: six picked, ${MEN149.join(', ')} (142's pucks re-lettered as 149's men; the rest of the list is 142's demo roster standing in for 149's). It opens already set to overseas duty, Detachment 249, the detachment's dates (next picture).`)
    // the same window scrolled to its Type, Detachment and dates
    await page.evaluate(() => { const sc = window.__mqSc, t = document.querySelector('#inpEditType').closest('.inped-f'); if (sc) sc.scrollTop += t.getBoundingClientRect().top - sc.getBoundingClientRect().top - 12 })
    await page.evaluate(() => {
      // 6c belongs to the first picture: its mark comes off before this one
      for (const t of document.querySelectorAll('.mkq-tag')) if (t.textContent === '6c') { t.parentElement.classList.remove('mkq', 'mkq-o', 'mkq-p'); t.remove() }
      window.__mq.mark(window.__mqDet, '6d', 'in')
    })
    await page.waitForTimeout(250)
    const f2 = `6-od-${sz}-proposed.png`
    await shot(page, f2, await winClip())
    rec(f2, '6', sz, 'proposed', `The same window, further down: Type "OD" (real), and the Detachment choice under it (mark 6d, drawn in, as ruled in round 2: D2101) reading "${SHORT} · ${DET}", and the title "${DET}" (drawn in). "all day" ticked (real). Opened from the door, its dates would come set to the detachment's, 13 to 31 Jul; here the calendar still shows the one day the window opened on. Add files ONE overseas duty input for all six. Each man's own overseas duty input stays the backup way on (D2120).`)
    notes.push(`it6 ${sz}: ${JSON.stringify(st)}`)
    await ctx.close()
  }
}

// ---------- item 7: crew rest across two schedules (D2122, D2123) — a REAL warning, then re-lettered ----------
// Saber already flies Monday's night wave (VL, lands 21:10, so with the 2h debrief his day ends 23:10). 142's crew rest
// is the demo's 12h (Logic), so he is clear at 11:10 Tuesday. He is put on Tuesday's 2nd wave RU (its typed RU in-time
// moved from 11:40 to 10:00): 10:00 is inside 12h (a breach) though outside 10h (149's made-up setting). The app raises
// the crew-rest warning on Tuesday and the dotted "breaks tomorrow's crew rest" ring on Saber's Monday night line.
async function setup7(page) {
  return page.evaluate(() => {
    const w = window
    const before = w.slotVal('1.1.1.0.p')
    w.setSlotVal('1.1.1.0.p', 'stiff')
    // Tuesday's 2nd wave keeps its in-time lines on the wave itself (the board's typed lines above the wave)
    const wv = w.DAYS[1].waves[1], it0 = (wv.intimes || []).slice()
    wv.intimes = it0.map(l => String(l).replace('1140H', '1000H'))
    if (w.validate) w.validate()
    return { before, after: w.slotVal('1.1.1.0.p'), it0, it1: wv.intimes, mon: [w.slotVal('0.1.0.0.p'), w.slotVal('0.1.0.0.w')] }
  })
}
async function it7(sz) {
  // 7a: 142's Tuesday — the warning
  {
    const { ctx, page } = await world(sz)
    const s = await setup7(page)
    await toEdit(page)
    const tue = await page.evaluate(() => {
      const mq = window.__mq, days = mq.days()
      return days.length
    })
    if (sz === 'p') {
      // the phone week steps by day: Tuesday by the day arrows' own route — scroll the week one day
      await page.evaluate(() => { const d = [...document.querySelectorAll('#eWeek > .day')].filter(d => !d.classList.contains('peek'))[1]; d.scrollIntoView({ inline: 'start' }) })
      await page.waitForTimeout(600)
    }
    // open Tuesday's issues list by a real press
    const opened = await page.evaluate(() => {
      const days = [...document.querySelectorAll('#eWeek > .day')].filter(d => !d.classList.contains('peek'))
      const t = days[1], box = t.querySelector('.dwbox'); window.__mqTue = t
      const btn = box.querySelector('button, [role=button]') || box
      const r = btn.getBoundingClientRect(); return { x: r.left + Math.min(40, r.width / 2), y: r.top + r.height / 2, txt: box.innerText.replace(/\s+/g, ' ').slice(0, 60), left: Math.round(t.getBoundingClientRect().left) }
    })
    await page.evaluate(() => { const mq = window.__mq; mq.scrollUnder(window.__mqTue.querySelector('.dwbox'), 10) })
    await page.waitForTimeout(250)
    const o2 = await page.evaluate(() => { const b = window.__mqTue.querySelector('.dwbox'); const r = b.getBoundingClientRect(); return { x: r.left + 40, y: r.top + r.height / 2 } })
    await page.mouse.click(o2.x, o2.y)
    await page.waitForTimeout(500)
    const w = await page.evaluate(() => {
      const mq = window.__mq, t = window.__mqTue
      const lines = [...t.querySelectorAll('.dwbox *')].filter(e => mq.vis(e) && /Saber/.test(e.textContent) && /rest/i.test(e.textContent))
      const line = lines.sort((a, b) => a.textContent.length - b.textContent.length)[0]
      if (!line) return { err: 'no crew-rest line for Saber', all: t.querySelector('.dwbox').innerText.slice(0, 600) }
      let row = line; while (row.parentElement && !row.parentElement.classList.contains('dwbox') && row.parentElement.children.length === 1) row = row.parentElement
      const was = line.innerText
      return { was, cls: line.className, rowCls: row.className }
    })
    if (w.err) throw new Error('it7a: ' + w.err + ' :: ' + w.all + ' :: ' + JSON.stringify(s))
    const r = await page.evaluate(() => {
      const mq = window.__mq, t = window.__mqTue
      const lines = [...t.querySelectorAll('.dwbox *')].filter(e => mq.vis(e) && /Saber/.test(e.textContent) && /rest/i.test(e.textContent))
      const line = lines.sort((a, b) => a.textContent.length - b.textContent.length)[0]
      // re-lettered: the Monday line named as 149's night wave; "needs 12h" kept as the app writes it
      const walk = document.createTreeWalker(line, NodeFilter.SHOW_TEXT)
      let n, changed = 0
      while ((n = walk.nextNode())) { if (/\bMonday\b/.test(n.nodeValue) && !changed) { n.nodeValue = n.nodeValue.replace(/\bMonday\b/, 'Monday, 149\'s night wave,'); changed++ } }
      if (changed !== 1) return { err: 'not re-lettered' }
      line.style.position = getComputedStyle(line).position === 'static' ? 'relative' : line.style.position
      mq.mark(line, '7a', 'pad')
      const box = t.querySelector('.dwbox'), br = box.getBoundingClientRect(), tr = t.getBoundingClientRect()
      return { now: line.innerText, changed, box: [Math.round(br.top), Math.round(br.bottom)], x: Math.round(tr.left), w: Math.round(tr.width) }
    })
    if (r.err) throw new Error('it7a: ' + r.err)
    const clip = await page.evaluate(() => { const mq = window.__mq, t = window.__mqTue, b = t.querySelector('.dwbox').getBoundingClientRect(), tr = t.getBoundingClientRect(); const x = Math.max(0, tr.left - 4), y = Math.max(mq.topH(), t.querySelector('.day-head').getBoundingClientRect().top - 4); return { x, y, width: Math.min(innerWidth - x, tr.width + 8), height: Math.min(innerHeight - y, b.bottom + 8 - y) } })
    const f = `7a-warning-${sz}-proposed.png`
    await shot(page, f, clip)
    rec(f, '7', sz, 'proposed', `142's schedule, Tuesday, its issues list opened. The crew-rest warning (mark 7a) is the app's own, raised by the real rules: Saber flies Monday's night wave, then Tuesday's 2nd wave, in at 10:00. Only "Monday" is re-lettered "Monday, 149's night wave,"; every other word is the app's. The later line is 142's, so 142's 12h judges ("needs 12h": 10h50 rest); by 149's made-up 10h he would be clear at 09:10. Who fixes: 142 changes its own Tuesday line, or either scheduler changes the night line, which holds a 142 man.`)
    notes.push(`it7a ${sz}: ${JSON.stringify({ s, w, r, tue, opened })}`)
    await ctx.close()
  }
  // 7b: 142's Monday — the night wave as 149's (badge, quiet line), Saber's dotted ring; 7c: 149's Monday, VL in look 2
  for (const view of ['142', '149']) {
    const { ctx, page } = await world(sz)
    await setup7(page)
    await toEdit(page)
    const m = await page.evaluate(({ view }) => {
      const mq = window.__mq, mon = mq.monday()
      const gos = [...mon.querySelectorAll('.go')], g = gos[1]
      const forms = [...g.querySelectorAll('.form')]
      const vl = forms.find(x => x.querySelector('.csmsn .ntx').textContent.trim() === 'VL')
      const ru = forms.find(x => x.querySelector('.csmsn .ntx').textContent.trim() === 'RU')
      const saber = [...vl.querySelectorAll('.puck')].find(p => /Saber/.test(p.textContent))
      const ring = saber ? getComputedStyle(saber).outlineStyle + '/' + getComputedStyle(saber).borderStyle + ' ' + saber.className : 'none'
      const tab = g.querySelector('.go-tab')
      if (view === '142') {
        mq.hide(ru); mq.hideItLine(g, "RU")
        const itb = g.querySelector('[data-itadd]'); if (itb) mq.hide(itb)
        const b = mq.badge('149'); b.style.marginLeft = '8px'; tab.querySelector('.asd').after(b)
        const q = mq.quiet(['149\'s wave · 149 publishes it · not published yet'])
        const name = tab.querySelector('.ntx') || tab.querySelector('.asd')
        q.style.padding = `0 10px 6px ${Math.round(name.getBoundingClientRect().left - tab.getBoundingClientRect().left)}px`
        q.style.background = getComputedStyle(tab).backgroundColor
        tab.after(q)
      } else {
        const k = document.querySelector('.topbar .mark .k'); const k2 = mq.strip(k.cloneNode(true)); k2.textContent = '149'; mq.hide(k); k.after(k2)
        const leaves = [...vl.querySelector('.csmsn').querySelectorAll('*')].filter(e => !e.children.length && e.textContent.trim())
        const msn = leaves.find(e => e.textContent.trim() === 'BFM')
        const phone = innerWidth < 600, c = mq.badge('142', phone)
        if (phone) { c.style.display = 'block'; c.style.width = 'fit-content'; c.style.marginTop = '2px'; msn.after(c) }
        else { c.style.marginLeft = '5px'; c.style.position = 'relative'; c.style.top = '-1px'; msn.appendChild(c) }
        vl.style.background = 'rgba(255,255,255,.055)'
      }
      // the puck clips what it holds: the tag hangs in its formation, at the puck's top-right corner
      if (saber) {
        const f = saber.closest('.form'); if (getComputedStyle(f).position === 'static') f.style.position = 'relative'
        const fr = f.getBoundingClientRect(), pr = saber.getBoundingClientRect()
        const t = document.createElement('span'); t.className = 'mkq-tag'; t.setAttribute('data-mine', '1'); t.textContent = view === '142' ? '7b' : '7c'
        t.style.left = Math.round(pr.right - fr.left - 10) + 'px'; t.style.top = Math.round(pr.top - fr.top - 9) + 'px'
        f.appendChild(t)
      }
      mq.scrollUnder(g, 8)
      window.__mqG = g
      return { ring, tab: tab.innerText.replace(/\s+/g, ' ') }
    }, { view })
    await page.waitForTimeout(250)
    const clip = await page.evaluate(() => { const mq = window.__mq, g = window.__mqG, r = g.getBoundingClientRect(); const x = Math.max(0, r.left - 4), y = Math.max(mq.topH(), r.top - 4); return { x, y, width: Math.min(innerWidth - x, r.width + 8), height: Math.min(innerHeight - y, r.height + 8) } })
    const f = `7${view === '142' ? 'b' : 'c'}-night-${sz}-proposed.png`
    await shot(page, f, clip)
    rec(f, '7', sz, 'proposed', view === '142'
      ? `142's schedule, Monday. The night wave, re-lettered as 149's (its grey badge and item 2's quiet line), holding 142's VL. Saber (mark 7b) wears the app's own dotted "breaks tomorrow's crew rest" ring, raised by the real rules because of his Tuesday line. 149's RU in that wave is hidden (142 sees its own lines).`
      : `149's schedule, Monday (142's app stands in; the top bar re-lettered "149"). The same night wave is 149's own; 142's VL in it wears look 2, the badge and the lighter block. Saber (mark 7c) wears the same dotted ring, so 149's scheduler sees it too. (Outlaw's dotted ring in RU is the demo's own, another man.)`)
    notes.push(`it7 ${view} ${sz}: ${JSON.stringify(m)}`)
    await ctx.close()
  }
}

// ---------- item 8: the place saved at once (D2119) — round 3's picture 1 with no "From" ----------
async function it8(sz) {
  const { ctx, page } = await world(sz)
  await toAdmin(page)
  await squadrons(page, { viewer: 'master', edit149: true })
  await page.evaluate(() => { const mq = window.__mq, e = window.__mqSq.edit; mq.mark(e.cols[0].querySelector('.mfield'), '8a', 'pad'); mq.mark(e.noteEl, '8b', 'pad') })
  const clip = await adminClip(page, sz)
  const f = `8-place-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, '8', sz, 'proposed', `A master admin's view, Admin → Squadrons, 149's row opened. Drawn in. Mark 8a: Place, picked from the places list (as round 3 drew it), and no "From" box: the move takes effect when Save is pressed, as a new account does. Mark 8b, the line saying what Save does: "Once saved, 142 and 149 can plan each other's people, and clashes between the two are checked. Both squadrons' schedulers are told."`)
  await ctx.close()
}

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ALL = { it1, it2, it3, it4a, it4b, it4c, it5, it6, it7, it8 }
try {
  if (!ONLY || ONLY.includes('copy')) copyR3()
  for (const sz of (process.env.MQ_SZ ? process.env.MQ_SZ.split(',') : ['d', 'p'])) {
    console.log('== ' + SIZES[sz].name)
    for (const [k, f] of Object.entries(ALL)) {
      if (ONLY && !ONLY.includes(k)) continue
      try { await f(sz) } catch (e) { errs.push(`[${sz}] ${k} FAILED: ${e.message}`); console.log(k, 'FAILED', e.message) }
    }
  }
} finally {
  await browser.close()
}
let old = {}
try { old = JSON.parse(readFileSync(`${OUT}/manifest.json`, 'utf8')) } catch {}
const merged = { ...old, ...manifest }
const sorted = Object.fromEntries(Object.keys(merged).sort().map(k => [k, merged[k]]))
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(sorted, null, 2) + '\n')
let oldF = {}
try { oldF = JSON.parse(readFileSync(`${OUT}/figures.json`, 'utf8')) } catch {}
writeFileSync(`${OUT}/figures.json`, JSON.stringify({ ...oldF, ...figures }, null, 2) + '\n')
for (const f of readdirSync(OUT)) if (f.endsWith('.png')) copyFileSync(`${OUT}/${f}`, `${PAGEIMG}/${f}`)
console.log('NOTES\n' + notes.join('\n'))
console.log('FIGURES ' + JSON.stringify(figures))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
