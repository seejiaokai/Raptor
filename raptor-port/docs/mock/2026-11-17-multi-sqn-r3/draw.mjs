// Multi-squadron & detachment — Round 3 pictures (17 Nov 26, the night's job 6, his own): a review of the design as
// ruled (D2088–D2111), walked screen by screen, and his "+ Line" question.
// Drawn on the REAL running app, today beside proposed, by .claude/skills/brainstorming/mockups-on-the-real-app.md —
// the kit, world(), toEdit(), rec(), shot(), clipOf() and file() are round 2's (docs/mock/2026-11-16-multi-sqn-r2/draw.mjs),
// the top-bar picker round 1's (docs/mock/2026-11-16-multi-sqn-r1/draw.mjs pic5). Each "today" frame is the app as it
// draws itself; each "proposed" frame clones a real neighbour (marked data-mine) or hides an app node (display:none,
// never removed). The questions' card is the app's own ask card (.askcard, ui/scheduler/27-ask-card.css — global), the
// editor rows Admin → Users' own (.acc-edit, .mfield), the ring on an added line the board's own (.sb-fresh, made by a
// real press of "+ Line").
//
// Run from raptor-port/, against a built preview already serving:  MQ_URL=http://localhost:4180/ node docs/mock/2026-11-17-multi-sqn-r3/draw.mjs
// MQ_ONLY=pic1,pic12 draws only those. Pictures and manifest.json go to docs/img/2026-11-17-multi-sqn-r3/.
// Demo data only. The squadrons are the bare numbers 142 and 149; the detachment is the invented "Exercise North",
// short name "249"; the places "Home base", "Northern base" and "Exercise base" are invented; 149's men "Mako", "Jolt",
// "Brick" are invented callsigns re-lettered on 142's own pucks.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4180/'
const OUT = 'docs/img/2026-11-17-multi-sqn-r3'
const R2 = 'docs/img/2026-11-16-multi-sqn-r2'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
mkdirSync(OUT, { recursive: true })

const SIZES = {
  d: { name: 'desktop', opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const DET = 'Exercise North', SHORT = '249'
const ANVIL = 'shaft'

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
  mq.cleanPuck = p => { p.classList.remove('warn', 'hard', 'boxred', 'soft', 'sel', 'hl', 'me', 'note'); p.querySelectorAll('.lchip').forEach(x => x.remove()); return p }
  mq.hide = e => { e.setAttribute('data-mqhid', '1'); e.style.setProperty('display', 'none', 'important') }
  mq.mark = (el, label, where = 'in') => {
    if (where === 'right' && el.getAttribute('data-mine') === '1') el.style.width = 'fit-content'
    const b = el.getBoundingClientRect()
    if (el.getAttribute('data-mine') === '1' && getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.classList.add('mkq'); if (where === 'below' || where === 'right' || where === 'left') el.classList.add('mkq-o')
    // 'pad': the outline stands clear of the part (its label untouched), the tag over the outline's top right corner
    if (where === 'pad') el.classList.add('mkq-p')
    const t = document.createElement('span')
    t.className = 'mkq-tag'; t.textContent = label; t.setAttribute('data-mine', '1')
    if (where === 'pad') { if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; t.style.top = '-12px'; t.style.right = '-10px'; el.appendChild(t) }
    else if (where === 'below'){ t.style.top = 'calc(100% + 4px)'; t.style.right = '0'; el.appendChild(t) }
    else if (where === 'right') { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.left = 'calc(100% + 5px)'; el.appendChild(t) }
    else if (where === 'left') { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.right = 'calc(100% + 5px)'; el.appendChild(t) }
    else if (getComputedStyle(el).position !== 'static') { t.style.top = '1px'; t.style.right = '1px'; el.appendChild(t) }
    else el.insertBefore(t, el.firstChild)
    const a = el.getBoundingClientRect()
    const same = ['x', 'y', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) < 0.5)
    if (!same) throw new Error('mark moved its element: ' + label)
    return true
  }
  // a tag only, no outline — for a part whose own edge is what the picture shows (a ring, a lighter block)
  mq.tag = (el, label) => { mq.mark(el, label); el.classList.remove('mkq', 'mkq-o') }
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
  mq.topH = () => { const t = document.querySelector('.topbar'); return t && mq.vis(t) ? t.getBoundingClientRect().bottom : 0 }
  mq.scrollUnder = (el, gap) => { window.scrollTo(window.scrollX, window.scrollY + el.getBoundingClientRect().top - mq.topH() - gap) }
  mq.monday = () => [...document.querySelectorAll('#eWeek > .day')].find(d => mq.vis(d) && !d.classList.contains('peek'))
  // the grey badge of round 2's look 2 (D2104): the standby lines' MAIN badge recipe, in neutral grey
  mq.badge = (txt, small) => {
    const c = document.createElement('span'); c.className = 'sarole ro'; c.textContent = txt; c.setAttribute('data-mine', '1')
    c.style.background = 'rgba(255,255,255,.08)'; c.style.borderColor = 'rgba(255,255,255,.22)'; c.style.color = 'var(--ink-2)'
    c.style.verticalAlign = 'middle'; c.style.alignSelf = 'center'
    if (small) { c.style.fontSize = '7px'; c.style.padding = '0 4px' }
    return c
  }
  // the app's ask card (ui/AskCard.tsx's markup, its global stylesheet), hung under or over a control, its pointer on
  // the control's middle — placed as AskCard places it
  mq.ask = (at, q, sub, btns) => {
    const c = document.createElement('div'); c.className = 'askcard ac-below'; c.setAttribute('data-mine', '1'); c.setAttribute('role', 'alertdialog')
    c.innerHTML = `<span class="askcard-q"></span>${sub ? '<span class="askcard-sub"></span>' : ''}<span class="askcard-btns"></span>`
    c.querySelector('.askcard-q').textContent = q
    if (sub) c.querySelector('.askcard-sub').textContent = sub
    for (const [t, k] of btns) { const b = document.createElement('button'); b.type = 'button'; b.className = 'abtn' + (k ? ' ' + k : ''); b.textContent = t; c.querySelector('.askcard-btns').appendChild(b) }
    // on the board the card goes on the page's body, above the board's cover (inside Edit Schedule it would sit under it)
    const onBoard = !!at.closest('.sb-go, .sb-lock, .sb-boardwrap, .sb-main')
    const host = onBoard ? document.body : (at.closest('[id^="page-"]') || document.body)
    if (onBoard) { c.style.position = 'fixed'; c.style.zIndex = '9999' }
    host.appendChild(c)
    const r = at.getBoundingClientRect(), W = c.offsetWidth, H = c.offsetHeight
    const mid = (r.left + r.right) / 2
    let left = mid > innerWidth / 2 ? r.right - W : r.left
    left = Math.min(Math.max(left, 8), innerWidth - W - 8)
    let top = r.bottom + 8
    if (top + H > innerHeight - 8 && r.top - 8 - H > 8) { top = r.top - 8 - H; c.className = 'askcard ac-above' }
    const o = c.getBoundingClientRect(), ox = o.left - 0, oy = o.top - 0
    c.style.left = left + 'px'; c.style.top = top + 'px'
    const o2 = c.getBoundingClientRect(); c.style.left = (left - (o2.left - left)) + 'px'; c.style.top = (top - (o2.top - top)) + 'px'
    c.style.setProperty('--ac-px', Math.round(Math.min(Math.max(mid - left, 14), W - 14)) + 'px')
    void ox; void oy
    // the control the card hangs from, drawn pressed: the app's cyan focus ring
    at.style.outline = '2px solid var(--accent)'; at.style.outlineOffset = '1px'
    return c
  }
  mq.unclone = () => {
    document.querySelectorAll('[data-mine]').forEach(e => e.remove())
    document.querySelectorAll('[data-mqhid]').forEach(e => { e.style.removeProperty('display'); e.removeAttribute('data-mqhid') })
    document.querySelectorAll('.mkq').forEach(e => e.classList.remove('mkq', 'mkq-o'))
  }
  window.__mq = mq
}

const manifest = {}
const notes = []
const errs = []
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
  return { ctx, page }
}
async function toEdit(page) {
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#page-editsched.on #eWeek .day')
  await page.waitForTimeout(900)
}
async function toBoard(page) {
  await toEdit(page)
  await page.evaluate(() => document.querySelector('#eWeek .day:not(.peek) [data-sbday="0"]').click())
  await page.waitForSelector('.sb-go [data-gline]')
  await page.waitForTimeout(1200)
}
function rec(file, question, sz, kind, caption) { manifest[file] = { question, size: SIZES[sz].name, kind, caption } }
async function shot(page, file, clip) {
  const bad = await page.evaluate(() => window.__mq.checkTags())
  if (bad.length) throw new Error(file + ': ' + bad.join('; '))
  await page.mouse.move(Math.round(page.viewportSize().width / 2), 1)
  await page.waitForTimeout(120)
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}) })
  console.log('  wrote', file)
}
async function file(page, recd) {
  await page.evaluate(r => window.fileInput(r), recd)
  await page.waitForTimeout(500)
}

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
  // a real editor of the Users list (Hex's), taken whole and closed again: the editor rows and buttons cloned below
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
// opts.p149: 149's place line; opts.edit149: 149's row open on Place / From; opts.newdet: a New detachment row open;
// opts.det: the open detachment shown; opts.closeAsk: the Close question hanging from its button
async function squadrons(page, opts) {
  return page.evaluate(({ opts, DET, SHORT }) => {
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
    // an editor of the Users list, its fields re-lettered: each [label, kind, value, choices]
    const editor = (r, fields, note) => {
      r.classList.add('od-row-on')
      const ed = mq.strip(window.__mqEdit.cloneNode(true))
      const col = ed.querySelector('.adm-2col'), mfIn = col.querySelector('.mfield'), mfSel = col.querySelectorAll('.mfield')[1]
      const cols = []
      for (let i = 0; i < fields.length; i += 2) {
        const c = mq.strip(col.cloneNode(false)); cols.push(c)
        for (const [lab, kind, val, choices] of fields.slice(i, i + 2)) {
          const f = mq.strip((kind === 'sel' ? mfSel : mfIn).cloneNode(true))
          f.querySelector('label').textContent = lab
          if (kind === 'sel') { const s = f.querySelector('select'); s.innerHTML = ''; for (const t of choices) { const o = document.createElement('option'); o.textContent = t; s.appendChild(o) } s.selectedIndex = 0; s.removeAttribute('aria-label') }
          else { const inp = f.querySelector('input'); inp.setAttribute('value', val); inp.value = val; inp.removeAttribute('placeholder') }
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
    // whose view: 'master' (a master admin, every squadron — D2093) or '149' (149's own admin, his detachments)
    const v149 = opts.viewer === '149'
    H('Squadrons · 2')
    const l1 = list()
    R(l1, '142', 'Home base · 61 people')
    const r149 = R(l1, '149', (opts.p149 || 'Northern base') + ' · 48 people' + (v149 ? ' · yours' : ''))
    if (opts.edit149) {
      const e = editor(r149, [['Place', 'sel', '', ['Home base · 142', 'Northern base', 'Exercise base', '+ New place…']], ['From', 'in', '1 Dec 26']],
        'From 1 Dec, 142 and 149 can plan each other\'s people, and clashes between the two are checked. Both squadrons\' schedulers are told.')
      out.edit = e
    }
    H((v149 ? 'Detachments of 149 · ' : 'Detachments · ') + (opts.det ? 1 : 0))
    const l2 = list()
    let rd = null
    if (opts.det) rd = R(l2, `${SHORT} · ${DET}`, 'Exercise base · 13 Jul – 31 Jul · 6 people', 'Close detachment')
    if (opts.newdet) {
      const rn = R(l2, 'New detachment', 'Of 149')
      out.newdet = editor(rn, [['Name', 'in', DET], ['Short name', 'in', SHORT], ['Place', 'sel', '', ['Exercise base', 'Home base', 'Northern base', '+ New place…']], ['People', 'in', 'Through their overseas duty input'], ['From', 'in', '13 Jul 26'], ['To', 'in', '31 Jul 26']])
      out.newdetRow = rn
    } else {
      const add = mq.strip(window.__mqBtn.cloneNode(true)); add.textContent = '+ New detachment'
      const addWrap = document.createElement('div'); addWrap.setAttribute('data-mine', '1'); addWrap.style.cssText = 'margin:10px 0 4px'; addWrap.appendChild(add); sec.appendChild(addWrap)
      out.add = add
    }
    H('Past detachments · 1')
    const l3 = list()
    R(l3, 'Exercise South', 'Closed 6 Mar · its schedules kept, read only')
    // the rows' inset: the real Users list's name inset, matched on the clones (round 2's were flush at the left)
    const mine = Math.round(sec.querySelector('.acc-name').getBoundingClientRect().left - panel.getBoundingClientRect().left)
    if (mine < realInset) { sec.style.paddingLeft = (realInset - mine) + 'px'; sec.style.paddingRight = (realInset - mine) + 'px'; h3c.style.paddingLeft = (realInset - mine) + 'px' }
    out.inset = { realInset, mine }
    out.r149 = r149; out.rd = rd; out.l1 = l1
    window.__mqSq = out
    window.__mqClipEl = panel
    return { inset: out.inset }
  }, { opts, DET, SHORT })
}
async function adminClip(page, sz, extra = 0) {
  return page.evaluate(({ sz, extra }) => {
    const mq = window.__mq, pg = document.querySelector('#page-admin')
    const panel = window.__mqClipEl, pr = panel.getBoundingClientRect()
    const cats = [...pg.querySelectorAll('button.adm-cat')].filter(mq.vis)
    const left = sz === 'd' && cats.length ? Math.min(pr.left, cats[0].getBoundingClientRect().left) - 12 : 0
    let bottom = pr.bottom + 14 + extra
    for (const c of document.querySelectorAll('.askcard[data-mine]')) bottom = Math.max(bottom, c.getBoundingClientRect().bottom + 12)
    const x = Math.max(0, left), w = sz === 'd' ? Math.min(innerWidth - x, pr.right + 12 - x) : innerWidth
    return { x, y: 0, width: w, height: Math.min(innerHeight, bottom) }
  }, { sz, extra })
}

// ---------- 1: 149 moves to 142's home — its place set on Admin → Squadrons ----------
async function pic1(sz) {
  const { ctx, page } = await world(sz)
  // the app's own menu of choices (the plans selector's), taken whole, to draw the Place list open
  await toEdit(page)
  await page.locator('#page-editsched .day .planselbtn').first().click()
  await page.waitForSelector('.wavemenu')
  await page.waitForTimeout(300)
  await page.evaluate(() => { window.__mqMenu = document.querySelector('.wavemenu').cloneNode(true) })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  if (await page.locator('.wavemenu').count()) { await page.mouse.click(sz === 'd' ? 900 : 200, sz === 'd' ? 150 : 210); await page.waitForTimeout(250) }
  await toAdmin(page)
  const m0 = await squadrons(page, { viewer: 'master' })
  await page.evaluate(() => { const mq = window.__mq, r = window.__mqSq.r149; mq.mark(r, '1a') })
  let clip = await adminClip(page, sz)
  const f0 = `1-place-${sz}-ruled.png`
  await shot(page, f0, clip)
  rec(f0, 'Q1', sz, 'ruled', `As ruled (round 2's C1, D2110), drawn again as a master admin sees it — only a master admin looks after squadrons (D2093), so no row reads "yours": Admin → Squadrons before the move, 142 at "Home base", 149 at "Northern base" (mark 1a: 149's row, a tap opens it). Rows cloned from Admin → Users' own list${sz === 'd' ? ', the "Squadrons" area on the left cloned from Users' : ''}.`)
  await page.evaluate(() => window.__mq.unclone())
  const m = await squadrons(page, { viewer: 'master', edit149: true })
  await page.evaluate(() => {
    const mq = window.__mq, e = window.__mqSq.edit
    mq.mark(e.cols[0].querySelector('.mfield'), '1b', 'pad'); mq.mark(e.cols[0].querySelectorAll('.mfield')[1], '1c', 'pad'); mq.mark(e.noteEl, '1d', 'pad')
  })
  clip = await adminClip(page, sz)
  const f1 = `1-place-${sz}-proposed.png`
  await shot(page, f1, clip)
  rec(f1, 'Q1', sz, 'proposed', `Drawn in, a master admin's view. 149's row opened, as a Users row opens: mark 1b "Place", picked from the places list (drawn open in the next picture), never typed; mark 1c "From 1 Dec 26", the day the move takes effect — the one decision Q1 asks; mark 1d the line saying what Save will do: "From 1 Dec, 142 and 149 can plan each other's people, and clashes between the two are checked. Both squadrons' schedulers are told." Save and Cancel are the Users editor's own buttons; its fields are its own boxes re-lettered.`)
  // the same, its Place list open: the app's own menu of choices, re-lettered
  await page.evaluate(() => {
    const mq = window.__mq, e = window.__mqSq.edit, sel = e.cols[0].querySelector('select')
    const menu = mq.strip(window.__mqMenu.cloneNode(true))
    const rows = [...menu.querySelectorAll('.wm-row')]
    const selRow = rows.find(r => r.querySelector('.wm.sa')), plainRow = rows.find(r => r.querySelector('.wm:not(.sa)'))
    const h = menu.querySelector('h5'); if (h) h.textContent = 'Place'
    const mk = (tpl, text) => { const r = tpl.cloneNode(true); const b = r.querySelector('.wm'); b.textContent = text; b.style.textAlign = 'left'; return r }
    const add = [mk(selRow, 'Home base · 142'), mk(plainRow, 'Northern base'), mk(plainRow, 'Exercise base'), mk(plainRow, '+ New place…')]
    rows.forEach(r => r.remove()); menu.append(...add)
    const r = sel.getBoundingClientRect()
    menu.style.position = 'fixed'; menu.style.left = Math.round(r.left) + 'px'; menu.style.top = Math.round(r.bottom + 4) + 'px'
    menu.style.minWidth = Math.round(r.width) + 'px'; menu.style.zIndex = '70'
    document.body.appendChild(menu)
    mq.mark(menu, '1e')
  })
  const f2 = `1-place-${sz}-list.png`
  const clip2 = await page.evaluate(({ clip }) => { const m = document.querySelector('.wavemenu[data-mine]').getBoundingClientRect(); return { ...clip, height: Math.min(innerHeight, Math.max(clip.height, Math.round(m.bottom + 16))) } }, { clip })
  await shot(page, f2, clip2)
  rec(f2, 'Q1', sz, 'proposed', `Drawn in: 149's Place list open (mark 1e), the app's own menu of choices re-lettered — "Home base · 142", "Northern base", "Exercise base", "+ New place…". A place is picked, never typed, so two squadrons are at one place only when they picked the same one.`)
  notes.push(`pic1 ${sz}: inset ${JSON.stringify(m0.inset)} / ${JSON.stringify(m.inset)}`)
  await ctx.close()
}

// ---------- 2: what 142's scheduler sees change — 149's people in a group of their own in Available crew ----------
async function pic2(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  const inject = () => page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday(), av = mon.querySelector('.sec-avail')
    const seats = [...av.querySelectorAll('.seat[data-person]')].filter(mq.vis)
    const grps = [...av.querySelectorAll('.ap-grp:not([data-mine])')]
    const g = grps[grps.length - 1], grid = g.nextElementSibling
    // 149's free men grouped by WHEN they are free, as the list above groups 142's — so nobody is dragged into a wave
    // he is not free for: Jolt flies with 149 in the morning, free for the night wave only
    const wrap = document.createElement('div'); wrap.setAttribute('data-mine', '1'); wrap.className = 'mq-grp149'
    const src = seats.slice(-3)
    const group = (head, names) => {
      const g2 = mq.strip(g.cloneNode(true)); g2.textContent = head
      const grid2 = mq.strip(grid.cloneNode(false))
      names.forEach((n, i) => { const s2 = mq.strip(src[i].cloneNode(true)); const p = s2.querySelector('.puck'); mq.cleanPuck(p); p.querySelector('.nm').textContent = n; p.removeAttribute('title'); grid2.appendChild(s2) })
      wrap.append(g2, grid2)
    }
    group('149 · 2nd wave · night 16:20–end · 1 can fly', ['Jolt'])
    group('149 · available all day · 2', ['Mako', 'Brick'])
    let last = av.lastElementChild; while (last && !last.classList.contains('ap-grid')) last = last.previousElementSibling
    ;(last || grid).after(wrap)
    mq.mark(wrap, '2a')
    return 1
  })
  await inject()
  await page.evaluate(() => {
    const mq = window.__mq, w = document.querySelector('.mq-grp149'), r = w.getBoundingClientRect()
    window.scrollTo(window.scrollX, window.scrollY + r.bottom - innerHeight + 40)
    const av = mq.monday().querySelector('.sec-avail'), ar = av.getBoundingClientRect()
    if (ar.top < mq.topH() + 8 && (r.bottom - ar.top) < innerHeight - mq.topH() - 50) mq.scrollUnder(av, 10)
  })
  const y = await page.evaluate(() => window.scrollY)
  await page.evaluate(() => window.__mq.unclone())
  await page.evaluate(y => window.scrollTo(window.scrollX, y), y)
  await page.waitForTimeout(300)
  const clip = await page.evaluate(() => { const mq = window.__mq, av = mq.monday().querySelector('.sec-avail'), r = av.getBoundingClientRect(); const x = Math.max(0, r.left - 6), t = Math.max(mq.topH(), r.top - 6); return { x, y: t, width: Math.min(innerWidth - x, r.width + 12), height: innerHeight - t } })
  const f0 = `2-crew-${sz}-today.png`, f1 = `2-crew-${sz}-proposed.png`
  await shot(page, f0, clip)
  rec(f0, 'Q1 · Q3', sz, 'today', `Real. 142's Edit Schedule, Monday 13 Jul: the day's Available crew list as the app draws it.`)
  await inject()
  await page.evaluate(y => window.scrollTo(window.scrollX, y), y)
  await page.waitForTimeout(150)
  if (!(await page.locator('.mq-grp149').count())) throw new Error('pic2 premise lost')
  await shot(page, f1, clip)
  rec(f1, 'Q3', sz, 'proposed', `Drawn in (mark 2a). From the day 149 shares 142's place, 142's Available crew list ends with 149's free people, grouped by when they are free as the groups above are: "149 · 2nd wave · night 16:20–end · 1 can fly" (Jolt, who flies with 149 in the morning) and "149 · available all day · 2" (Mako, Brick) — invented callsigns on 142's own pucks, re-lettered and cleared of their flags. Dragging one onto a seat is a pick (D2091): his home schedule then shows "Attach · 142" for him. 142's own groups above are unchanged.`)
  await ctx.close()
}

// ---------- 2b: the same on the Scheduler Board's own crew list (Pilots · N free / WSOs · N free) ----------
async function pic2b(sz) {
  const { ctx, page } = await world(sz)
  await toBoard(page)
  if (sz === 'p') {
    // on a phone the board's crew list is the parked AIRCREW tab: opened by a real tap
    const at = await page.evaluate(() => {
      const mq = window.__mq
      const el = [...document.querySelectorAll('body *')].find(e => mq.vis(e) && e.children.length === 0 && e.textContent.trim() === 'AIRCREW')
      if (!el) return null
      const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    })
    if (!at) throw new Error('pic2b: no AIRCREW tab')
    await page.mouse.click(at.x, at.y)
    await page.waitForTimeout(700)
  }
  // the board's own list: the one on top (Edit Schedule's list lies under the board, the same size, unseen)
  const ok = await page.evaluate(() => {
    const top = c => { const r = c.getBoundingClientRect(); const y = Math.min(innerHeight - 5, Math.max(5, r.top + 20)); const e = document.elementFromPoint(r.left + r.width / 2, y); return e && c.contains(e) }
    const c = [...document.querySelectorAll('.rcols')].find(c => window.__mq.vis(c) && top(c)); window.__mqRc = c || null; return !!c
  })
  if (!ok) throw new Error('pic2b: the board crew list is not open')
  await page.evaluate(() => { const c = window.__mqRc; const sc = (e => { while (e && !(e.scrollHeight > e.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(e).overflowY))) e = e.parentElement; return e })(c); window.__mqSc = sc })
  const inject = () => page.evaluate(() => {
    const mq = window.__mq, cols = [...window.__mqRc.querySelectorAll('.rcol')].filter(mq.vis)
    const plan = [[['Mako', ''], ['Jolt', 'free from 11:30']], [['Brick', '']]]
    const heads = ['149 · 1 free', '149 · 1 free']
    cols.slice(0, 2).forEach((col, ci) => {
      const rh = col.querySelector('.rh'), pucks = [...col.querySelectorAll('.rpuck')]
      const tpl = pucks.find(p => !p.classList.contains('no') && !p.classList.contains('haswhy')) || pucks[0]
      const box = document.createElement('div'); box.setAttribute('data-mine', '1'); box.className = 'mq-b149'; box.style.marginTop = '10px'
      const h = mq.strip(rh.cloneNode(true)); h.textContent = heads[ci]; box.appendChild(h)
      for (const [n, why] of plan[ci]) {
        const p = mq.strip(tpl.cloneNode(true)); p.removeAttribute('title'); p.removeAttribute('data-why')
        const pk = p.querySelector('.puck'); if (pk) mq.cleanPuck(pk)
        const nm = p.querySelector('.nm'); if (nm) nm.textContent = n
        if (why) { p.classList.add('haswhy'); const w = document.createElement('span'); w.className = 'rwhy'; w.textContent = why; if (innerWidth < 600) { p.style.flexWrap = 'wrap'; w.style.flexBasis = '100%'; w.style.whiteSpace = 'nowrap' } p.appendChild(w) }
        box.appendChild(p)
      }
      col.appendChild(box)
    })
    const boxes = [...document.querySelectorAll('.mq-b149')]
    boxes.forEach((b, i) => mq.mark(b, i ? '' : '2b', 'pad'))
    document.querySelectorAll('.mq-b149 > .mkq-tag').forEach(t => { if (!t.textContent) t.remove() })
    return boxes.length
  })
  const n = await inject()
  if (n < 2) throw new Error('pic2b: columns ' + n)
  // bring 149's groups into view, the columns' headings kept where they fit
  const clipFor = () => page.evaluate(() => {
    // the two columns end at different heights: the picture runs from the higher group's top to the lower one's foot
    const mq = window.__mq, sc = window.__mqSc, bs = () => [...document.querySelectorAll('.mq-b149')].map(b => b.getBoundingClientRect())
    const lo = Math.max(...bs().map(r => r.bottom))
    if (sc) sc.scrollTop += Math.round(lo - innerHeight + 40); else window.scrollBy(0, Math.round(lo - innerHeight + 40))
    const rs = bs(), rc = window.__mqRc.getBoundingClientRect()
    const top = Math.max(mq.topH(), Math.round(Math.min(...rs.map(r => r.top)) - 90)), bot = Math.round(Math.max(...rs.map(r => r.bottom)) + 16)
    const x = Math.max(0, rc.left - 8)
    return { x, y: top, width: Math.min(innerWidth - x, rc.width + 16), height: Math.min(innerHeight - top, bot - top) }
  })
  const clip = await clipFor()
  const sTop = await page.evaluate(() => window.__mqSc ? window.__mqSc.scrollTop : 0)
  await page.evaluate(() => window.__mq.unclone())
  await page.evaluate(s => { if (window.__mqSc) window.__mqSc.scrollTop = s }, sTop)
  await page.waitForTimeout(200)
  const f0 = `2-board-${sz}-today.png`, f1 = `2-board-${sz}-proposed.png`
  await shot(page, f0, clip)
  rec(f0, 'Q3', sz, 'today', `Real. 142's Scheduler Board${sz === 'p' ? ', its AIRCREW tab opened' : ''}: its own crew list, "Pilots · N free" and "WSOs · N free" — where a scheduler picks crew while building a wave, joining 149's included.`)
  await inject()
  await page.evaluate(s => { if (window.__mqSc) window.__mqSc.scrollTop = s }, sTop)
  await page.waitForTimeout(150)
  await shot(page, f1, clip)
  rec(f1, 'Q3', sz, 'proposed', `Drawn in (mark 2b). The board's own list ends each column with 149's men, "149 · 1 free", in the same pucks; one free only part of the day says when, in the list's own small reason line — Jolt "free from 11:30" — and is drawn after the free men, as a tasked man is today, so he is not dragged into a wave he cannot fly.`)
  await ctx.close()
}

// ---------- 3: moving between schedules — the squadron name on the top bar as a picker (round 1's Q4, never put) ----------
async function pic3(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(250)
  const clip = sz === 'd' ? { x: 0, y: 0, width: 720, height: 300 } : { x: 0, y: 0, width: 390, height: 330 }
  const f0 = `3-switch-${sz}-today.png`, f1 = `3-switch-${sz}-proposed.png`
  await page.locator('#page-editsched .day .planselbtn').first().click()
  await page.waitForSelector('.wavemenu')
  await page.waitForTimeout(300)
  await page.evaluate(() => { window.__mqMenu = document.querySelector('.wavemenu').cloneNode(true) })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur())
  if (await page.locator('.wavemenu').count()) { await page.mouse.click(sz === 'd' ? 900 : 200, sz === 'd' ? 150 : 210); await page.waitForTimeout(250) }
  if (await page.locator('.wavemenu:not([data-mine])').count()) throw new Error('pic3: the real plans menu did not close')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(200)
  await shot(page, f0, clip)
  rec(f0, 'Q2', sz, 'today', 'Real. The top bar today: "142 TALON" is a plain title, not a control.')
  const m = await page.evaluate(({ DET, SHORT }) => {
    const mq = window.__mq
    // 149's scheduler at home (his own example, D2088: 149 opens 249); 142's top bar stands in for 149's
    const k = document.querySelector('.topbar .mark .k')
    const k2 = mq.strip(k.cloneNode(true)); k2.textContent = '149 ▾'
    mq.hide(k); k.after(k2)
    const markEl = document.querySelector('.topbar .mark')
    if (getComputedStyle(markEl).position === 'static') markEl.style.position = 'relative'
    mq.mark(markEl, '3a', innerWidth < 600 ? 'in' : 'pad')
    const menu = mq.strip(window.__mqMenu)
    const rows = [...menu.querySelectorAll('.wm-row')]
    const selRow = rows.find(r => r.querySelector('.wm.sa')), plainRow = rows.find(r => r.querySelector('.wm:not(.sa)'))
    menu.querySelector('h5').textContent = 'Schedules'
    const mk = (tpl, text) => { const r = tpl.cloneNode(true); const b = r.querySelector('.wm'); b.textContent = text; b.style.textAlign = 'left'; return r }
    const r1 = mk(selRow, '149 ●'), r2 = mk(plainRow, `${SHORT} · ${DET}`), r3 = mk(plainRow, '142')
    rows.forEach(r => r.remove())
    menu.append(r1, r2, r3)
    const mark = document.querySelector('.topbar .mark').getBoundingClientRect()
    menu.style.left = Math.round(mark.left) + 'px'
    menu.style.top = Math.round(mq.topH() + 12) + 'px'
    document.body.appendChild(menu)
    mq.mark(menu, '3b')
    const r = menu.getBoundingClientRect()
    return { bottom: Math.round(r.bottom), right: Math.round(r.right) }
  }, { DET, SHORT })
  if (m.bottom > clip.height - 8) throw new Error('pic3: menu runs out of the clip ' + JSON.stringify(m))
  await shot(page, f1, clip)
  rec(f1, 'Q2', sz, 'proposed', `Drawn in, as 149's scheduler at home would see it (142's top bar stands in). Mark 3a: the whole TALON mark is the button, its small squadron number now "149 ▾" — a change to the built "142 TALON" title (D1606). Mark 3b: its menu, the plans selector's own menu re-lettered "Schedules": "149" (picked, its ●), "${SHORT} · ${DET}" (149's detachment, his own example, D2088), "142". Only the schedules he may see are listed; someone who may see one sees no ▾, as today. Picking one changes the schedule pages — Edit Schedule, View-only Sched, the Scheduler Board — and Logic; Inputs, Quals, the Leave War and the Tracker stay on his own squadron's people.`)
  await ctx.close()
}

// ---------- 4: a detachment opened — "+ New detachment" ----------
async function pic4(sz) {
  const { ctx, page } = await world(sz)
  await toAdmin(page)
  await squadrons(page, { p149: 'Home base', newdet: true, viewer: '149' })
  await page.evaluate(() => {
    const mq = window.__mq, e = window.__mqSq.newdet
    mq.mark(e.cols[0].querySelectorAll('.mfield')[1], '4a', 'pad'); mq.mark(e.cols[1].querySelector('.mfield'), '4b', 'pad'); mq.mark(e.cols[1].querySelectorAll('.mfield')[1], '4c', 'pad'); mq.mark(e.cols[2].querySelectorAll('.mfield')[1], '4d', 'pad')
    // the People box is no box: it says how people join; drawn as the editor's own small grey words
    const pf = e.cols[1].querySelectorAll('.mfield')[1], inp = pf.querySelector('input'), s = document.createElement('div')
    s.setAttribute('data-mine', '1'); s.className = 'acc-sub'; s.textContent = 'Through their overseas duty input'; s.style.cssText = 'display:block;padding:10px 0'
    mq.hide(inp); inp.after(s)
  })
  const clip = await adminClip(page, sz)
  const f = `4-newdet-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, 'R1', sz, 'proposed', `Drawn in, as 149's own admin sees it (a squadron's own admins make its detachments, D2093). "+ New detachment" pressed: a new row opens as a Users row opens, its fields cloned from the Users editor's own boxes — Name "${DET}", mark 4a "Short name" "${SHORT}", the name the top bar and the Schedules menu show (your own example: 149 opens 249, D2088), mark 4b Place, picked from the places list, mark 4c "People: through their overseas duty input" (D2101), From, and mark 4d "To", the planned last day — recommended: it does not close the detachment by itself; that day the bell reminds 149's admins to close it or move the date. 149 here already shares Home base with 142.`)
  await ctx.close()
}

// ---------- 5: a man put on it — the overseas duty input's "Detachment" choice (round 2's A1, D2101) ----------
async function pic5(sz) {
  const { ctx, page } = await world(sz)
  await file(page, { iid: 'mq-od', person: ANVIL, type: 'OD', date: 'Jul 13', endDate: 'Jul 31', yr: 2026, allday: true, remarks: 'Exercise, off island' })
  await toEdit(page)
  await page.evaluate(() => { const mq = window.__mq, unav = mq.monday().querySelector('.sec-unav'); mq.scrollUnder(unav, 16) })
  await page.locator('#eWeek .day:not(.peek) .sec-unav [data-inpedit="mq-od"]').first().click()
  await page.waitForSelector('#inpEditType', { state: 'visible' })
  await page.waitForTimeout(500)
  const head = await page.evaluate(() => { const s = document.querySelector('#inpEditType'); let d = s; while (d && ![...d.querySelectorAll('button')].some(b => b.textContent.trim() === 'Save')) d = d.parentElement; window.__mqClipEl = d; const h = d.querySelector('h2, h3, .ttl, [id$="Title"]'); const r = (h || d).getBoundingClientRect(); return { x: r.left + 8, y: r.top + r.height / 2 } })
  await page.mouse.click(head.x, head.y)
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur())
  await page.waitForTimeout(250)
  const inject = () => page.evaluate(({ DET, SHORT }) => {
    const mq = window.__mq
    const sel = document.querySelector('#inpEditType'), typeF = sel.closest('.inped-f')
    const f = mq.strip(typeF.cloneNode(true))
    const kh = f.querySelector('.inped-kh'); const k = f.querySelector('label.inped-k')
    const lab = mq.strip(k.cloneNode(true)); lab.textContent = 'Detachment'
    if (kh) kh.replaceWith(lab); else k.replaceWith(lab)
    const s2 = f.querySelector('select'); s2.innerHTML = ''
    for (const t of ['None', `${SHORT} · ${DET}`]) { const o = document.createElement('option'); o.textContent = t; s2.appendChild(o) }
    s2.selectedIndex = 1
    typeF.after(f)
    mq.mark(f, '5a')
    const tIn = document.querySelector('#inpEditOwnTitle')
    if (tIn) { const tf = tIn.closest('.inped-f'), t2 = mq.strip(tf.cloneNode(true)); const i2 = t2.querySelector('input'); i2.setAttribute('value', DET); i2.value = DET; mq.hide(tf); tf.after(t2); mq.mark(t2, '5b') }
    return !!tIn
  }, { DET, SHORT })
  await inject()
  const hProp = await page.evaluate(() => window.__mqClipEl.getBoundingClientRect().height)
  await page.evaluate(() => window.__mq.unclone())
  const hToday = await page.evaluate(() => window.__mqClipEl.getBoundingClientRect().height)
  const clip = await page.evaluate(({ extra }) => { const r = window.__mqClipEl.getBoundingClientRect(); const x = Math.max(0, r.left - 8), y = Math.max(0, r.top - 8); return { x, y, width: Math.min(innerWidth - x, r.width + 16), height: Math.min(innerHeight - y, r.height + 16 + extra) } }, { extra: Math.max(0, hProp - hToday) })
  const f0 = `5-od-${sz}-today.png`, f1 = `5-od-${sz}-proposed.png`
  await shot(page, f0, clip)
  rec(f0, 'walk', sz, 'today', 'Real. An overseas duty input (Anvil, 13–31 Jul) opened from Monday\'s Unavailable row: Person, Type "OD", Title, Duration, Document, Remarks.')
  await inject()
  await shot(page, f1, clip)
  rec(f1, 'walk', sz, 'proposed', `As ruled (D2101), drawn in. Mark 5a: the "Detachment" choice under Type, cloned from the real Type choice, reading "${SHORT} · ${DET}" (its other choice "None" keeps an ordinary overseas duty, a staff trip). Mark 5b: the Title box, a clone of the real one, filled in by itself with "${DET}". (142's Anvil stands in for a 149 man joining 149's detachment.)`)
  await ctx.close()
}

// ---------- 7: a detachment closed — "Close detachment" asks at the button (lesson 77) ----------
async function pic7(sz) {
  const { ctx, page } = await world(sz)
  await toAdmin(page)
  await squadrons(page, { p149: 'Home base', det: true, viewer: '149' })
  await page.evaluate(({ DET }) => {
    const mq = window.__mq, b = window.__mqSq.rd.querySelector('.od-rc button')
    const c = mq.ask(b, `Close ${DET}?`, 'Its schedules stay, read only, under Past detachments. Its 6 people are back on 149\'s schedule from today, and their overseas duty ends today.', [['Close it', ''], ['Keep open', 'primary']])
    mq.mark(c, '7')
  }, { DET })
  const clip = await adminClip(page, sz)
  const f = `7-close-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, 'R3', sz, 'proposed', `As ruled (one "Close detachment", D2103), seen by 149's admin, with what pressing it should ask, drawn in (mark 7): the app's own question card hanging from the button, as your lesson 77 asks — "Close ${DET}? Its schedules stay, read only, under Past detachments. Its 6 people are back on 149's schedule from today, and their overseas duty ends today." The last clause is my reading, not yet ruled: closing early cuts their overseas duty inputs short. Keep open is the safe answer, as on the app's other cards. The button keeps "Close detachment" on one line (round 2's drawing broke it in two).`)
  await ctx.close()
}

// ---------- 9, 10, 13: a 142 line in 149's wave, seen on each board; removing a wave that holds the other's line ----------
// 142's board stands in for both: on "142's" view, 149's VL and RU are hidden and the wave's head carries 149's grey
// badge and status (round 2's 10b); on "149's", RU stands for 142's formation, in look 2 (D2104), on the board.
const VERPROBE = (verPub) => verPub
  ? '<span class="verchip orig"><svg class="vtick" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><circle cx="6" cy="6" r="6"></circle><path d="M3.3 6.2l1.8 1.8 3.6-3.8"></path></svg>ORIG</span>'
  : '<span class="verchip draft">DRAFT</span>'
async function pic9(sz) {
  const { ctx, page } = await world(sz)
  await toBoard(page)
  await page.evaluate(() => { const b = [...document.querySelectorAll('.sb-go [data-gline]')].filter(x => x.offsetParent)[0]; b.scrollIntoView({ block: 'start' }) })
  await page.evaluate(() => { const sc = [...document.querySelectorAll('.sb-boardwrap, .sb-main')].find(e => e.scrollHeight > e.clientHeight); if (sc) sc.scrollTop -= 70 })
  await page.waitForTimeout(400)
  // the real press: one "+ Line" — the line comes up blank, wearing the board's just-added ring
  const at = await page.evaluate(() => { const r = [...document.querySelectorAll('.sb-go [data-gline]')].filter(x => x.offsetParent)[0].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  await page.mouse.click(at.x, at.y)
  await page.waitForTimeout(500)
  const m = await page.evaluate((html) => {
    const mq = window.__mq, g = [...document.querySelectorAll('.sb-go')].find(x => x.offsetParent)
    const fresh = [...g.querySelectorAll('.sb-line.sb-fresh')]
    if (fresh.length !== 1) return { err: 'fresh lines ' + fresh.length }
    const areas = [...g.querySelectorAll('.sb-area')]
    for (const l of g.querySelectorAll('.sb-line:not(.sb-fresh)')) mq.hide(l)
    areas.slice(0, -1).forEach(a => mq.hide(a))
    for (const s of ['[data-itadd]', '[data-gdel]', '[data-sortsec]']) { const b = g.querySelector('.sb-go-h ' + s); if (b) mq.hide(b) }
    // the in-times are 149's: on 142's view their ✕ goes too (the ✕ is the only button in an in-time row)
    for (const b of g.querySelectorAll('button')) { if (b.closest('.sb-go-h') || b.closest('.sb-line')) continue; if (b.textContent.trim() === '✕' || b.textContent.trim() === '×' || b.querySelector('svg')) mq.hide(b) }
    // 149's badge and its status beside the wave's name (round 2's 10b), the chip's look measured where the app sets it
    const host = document.querySelector('.sb-pub') || document.querySelector('#eWeek .day-head')
    const probe = document.createElement('span'); probe.className = 'dhver'; probe.innerHTML = html; host.appendChild(probe)
    const src = probe.firstElementChild, cs = getComputedStyle(src), chip = src.cloneNode(true); chip.setAttribute('data-mine', '1')
    for (const p of ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'line-height', 'color', 'background-color', 'box-shadow', 'border-radius', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'display', 'align-items', 'gap'])
      chip.style.setProperty(p, cs.getPropertyValue(p))
    probe.remove()
    const grp = document.createElement('span'); grp.setAttribute('data-mine', '1')
    grp.style.cssText = 'display:inline-flex;align-items:center;gap:5px;margin:0 6px;vertical-align:middle'
    grp.appendChild(mq.badge('149')); grp.appendChild(chip)
    g.querySelector('.sb-go-h .airbtn').after(grp)
    mq.mark(grp, '9a', 'below')
    const f = fresh[0]; f.style.position = 'relative'; mq.tag(f, '9b')
    window.__mqClipEl = g
    return { ok: 1 }
  }, VERPROBE(false))
  if (m.err) throw new Error('pic9: ' + m.err)
  const clip = await page.evaluate(() => { const mq = window.__mq, g = window.__mqClipEl, r = g.getBoundingClientRect(); const top = Math.max(document.querySelector('.sb-bar, .sb-top, .topbar') ? 0 : 0, r.top - 6); const x = Math.max(0, r.left - 6); return { x, y: Math.max(0, top), width: Math.min(innerWidth - x, r.width + 12), height: Math.min(innerHeight - Math.max(0, top), r.height + 12) } })
  const f = `9-joined-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, 'walk', sz, 'proposed', `As ruled (D2106), drawn on 142's Scheduler Board after "Join a 149 wave". Mark 9a: the wave's head carries 149's grey badge and 149's own status, "DRAFT" (round 2's 10b). Mark 9b: 142's new line, blank, wearing the board's own just-added blue ring — made by a real press of "+ Line", which is how 142 adds more lines to that wave. 149's VL and RU are hidden here (142 sees only its own lines, D2105), and so are "+ In-time", "Auto sort" and "✕ Wave", which are 149's to use. "+ Line" is drawn in the wave's head, as today; if you take Q5 it moves to the wave's foot here too. (142's 1st wave stands in for 149's.)`)
  await ctx.close()
}
// 149's view: RU in look 2 on the board — the badge sits inside the mission box's right end (the board's boxes leave no
// room after it); optionally "✕ Wave" pressed, its question hanging from it
async function look2Board(page, sz) {
  return page.evaluate(() => {
    const mq = window.__mq, g = [...document.querySelectorAll('.sb-go')].find(x => x.offsetParent)
    const kids = [...g.children]
    const ruLines = [...g.querySelectorAll('.sb-line')].filter(l => (l.querySelector('textarea.lin') || {}).value === 'RU')
    if (ruLines.length < 2) return { err: 'RU lines ' + ruLines.length }
    const lastRu = ruLines[ruLines.length - 1]
    const area = kids.slice(kids.indexOf(lastRu)).find(k => k.classList.contains('sb-area'))
    for (const x of [...ruLines, area]) x.style.background = 'rgba(255,255,255,.055)'
    const l = ruLines[0], msn = l.querySelector('textarea.msn')
    l.style.position = 'relative'
    const phone = innerWidth < 600
    const b = mq.badge('142', phone)
    const lr = l.getBoundingClientRect(), mr = msn.getBoundingClientRect()
    b.style.position = 'absolute'; b.style.zIndex = '2'
    l.appendChild(b)
    const br = b.getBoundingClientRect()
    // D2104 puts the badge after the mission (under it on a phone). The board has no room for either: on a desktop its R
    // box follows the mission box a few pixels on, and on a phone the crew pucks start just under it (tried: the badge
    // covered Vector's puck). So it sits inside the mission box, at its right end — a change from the ruling, put to him (R2)
    b.style.left = Math.round(mr.right - lr.left - br.width - 5) + 'px'
    b.style.top = Math.round(mr.top - lr.top + (mr.height - br.height) / 2) + 'px'
    const nb = msn.nextElementSibling ? msn.nextElementSibling.getBoundingClientRect() : null
    window.__mqClipEl = g; window.__mqBadge = b
    return { ru: l, badgeW: Math.round(br.width), msnW: Math.round(mr.width), gapAfter: nb ? Math.round(nb.left - mr.right) : null }
  })
}
async function pic10(sz) {
  for (const which of ['look', 'del']) {
    const { ctx, page } = await world(sz)
    await toBoard(page)
    await page.evaluate(() => { const b = [...document.querySelectorAll('.sb-go [data-gline]')].filter(x => x.offsetParent)[0]; b.scrollIntoView({ block: 'start' }) })
    await page.evaluate(() => { const sc = [...document.querySelectorAll('.sb-boardwrap, .sb-main')].find(e => e.scrollHeight > e.clientHeight); if (sc) sc.scrollTop -= 70 })
    await page.waitForTimeout(400)
    const m = await look2Board(page, sz)
    if (m.err) throw new Error('pic10: ' + m.err)
    await page.evaluate((which) => {
      const mq = window.__mq, g = window.__mqClipEl
      const ru = [...g.querySelectorAll('.sb-line')].find(l => (l.querySelector('textarea.lin') || {}).value === 'RU')
      if (which === 'look') mq.mark(window.__mqBadge, '16', 'pad')
      else {
        const del = g.querySelector('.sb-go-h [data-gdel]')
        const c = mq.ask(del, 'Remove 1st wave? It holds 142\'s RU.', '142\'s schedulers are told. Undo puts it back.', [['Remove wave', 'danger'], ['Keep', 'primary']])
        mq.mark(c, '13')
      }
    }, which)
    const clip = await page.evaluate(() => {
      const g = window.__mqClipEl, r = g.getBoundingClientRect(); let bottom = r.bottom + 6
      for (const c of document.querySelectorAll('.askcard[data-mine]')) bottom = Math.max(bottom, c.getBoundingClientRect().bottom + 10)
      const x = Math.max(0, r.left - 6), y = Math.max(0, r.top - 6)
      return { x, y, width: Math.min(innerWidth - x, r.width + 12), height: Math.min(innerHeight - y, bottom - y) }
    })
    const f = which === 'look' ? `10-shared-${sz}-proposed.png` : `13-delwave-${sz}-proposed.png`
    await shot(page, f, clip)
    rec(f, which === 'look' ? 'walk' : 'Q4', sz, 'proposed', which === 'look'
      ? `Changed from what you ruled, on the Scheduler Board only (R2). Look 2 (D2104) puts the grey "142" badge after the mission, and under it on a phone. On the board the mission is a typing box with ${sz === 'p' ? 'the crew pucks just under it (tried there, the badge covered a puck)' : 'its R box a few pixels after it'}, so there is no room: the badge (mark 16) sits inside the box, at its right end, a size smaller on a phone. Both jets and the area line are one shade lighter, as ruled. Round 2's week drawing, as ruled, is beside it. (142's RU stands in.)`
      : `Drawn in (mark 13). On 149's board, "✕ Wave" pressed on a wave that holds 142's RU: today it removes the wave at once with every line in it. Proposed, only where the wave holds the other squadron's lines, the app's own question card hangs from the button (lesson 77): "Remove 1st wave? It holds 142's RU. 142's schedulers are told. Undo puts it back." — Remove wave, or Keep (the safe answer). A wave of 149's lines alone is removed as today, with no question.`)
    notes.push(`pic10 ${which} ${sz}: ${JSON.stringify({ badgeW: m.badgeW, msnW: m.msnW })}`)
    await ctx.close()
  }
}

// ---------- 12: "+ Line" pressed three times — today, and three ways to keep fast repeated adds safe ----------
async function pic12(sz) {
  for (const which of ['today', 'foot', 'card', 'step']) {
    const { ctx, page } = await world(sz, { toasts: which === 'today' })
    await toBoard(page)
    // the wave's "+ Line" brought to the screen's upper part, where a scheduler working down the board would press it
    await page.evaluate(() => { const b = [...document.querySelectorAll('.sb-go [data-gline]')].filter(x => x.offsetParent)[0]; b.scrollIntoView({ block: 'center' }) })
    await page.waitForTimeout(400)
    const at = await page.evaluate(() => { const r = [...document.querySelectorAll('.sb-go [data-gline]')].filter(x => x.offsetParent)[0].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    if (which !== 'step') for (let i = 0; i < 3; i++) { await page.mouse.click(at.x, at.y); await page.waitForTimeout(350) }
    const info = await page.evaluate(({ which, at }) => {
      const mq = window.__mq, g = [...document.querySelectorAll('.sb-go')].find(x => x.offsetParent)
      const btn = g.querySelector('.sb-go-h [data-gline]')
      const fresh = [...g.querySelectorAll('.sb-line.sb-fresh')]
      const sc = [...document.querySelectorAll('.sb-boardwrap, .sb-main')].find(e => e.scrollHeight > e.clientHeight)
      const inView = () => fresh.filter(f => { const r = f.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight }).length
      const out = { fresh: fresh.length, inViewBefore: inView() }
      if (which === 'today') {
        const t = [...document.querySelectorAll('body *')].find(e => mq.vis(e) && e.children.length === 0 && e.textContent.trim() === 'Line added')
        const chain = []; for (let a = t; a && chain.length < 5; a = a.parentElement) chain.push(a.tagName + '.' + a.className)
        out.toast = chain.join(' < ')
        const br = btn.getBoundingClientRect(), gr = g.getBoundingClientRect()
        out.btn = [Math.round(br.top), Math.round(br.bottom)]; out.go = [Math.round(gr.top), Math.round(gr.bottom)]
        btn.style.position = 'relative'; mq.mark(btn, '17a', 'below')
        if (t) { if (getComputedStyle(t).position === 'static') t.style.position = 'relative'; mq.mark(t, '17b') }
      } else if (which === 'foot') {
        // "+ Line" moved to the wave's foot, under its last line (the same button, the same size); the board scrolled so it
        // stands where the finger pressed — each new line then lands just above the finger, in view, ringed
        mq.hide(btn)
        const foot = document.createElement('div'); foot.setAttribute('data-mine', '1')
        const hl = g.querySelector('.sb-go-h').getBoundingClientRect(), gl = g.getBoundingClientRect()
        foot.style.cssText = `padding:8px 0 10px ${Math.round(btn.getBoundingClientRect().left - gl.left) > 0 ? 34 : 34}px`
        const b2 = mq.strip(btn.cloneNode(true)); b2.style.removeProperty('display'); b2.removeAttribute('data-mqhid')
        foot.appendChild(b2); g.appendChild(foot)
        const fr = b2.getBoundingClientRect()
        if (sc) sc.scrollTop += Math.round(fr.top + fr.height / 2 - at.y)
        else window.scrollBy(0, Math.round(fr.top + fr.height / 2 - at.y))
        mq.mark(b2, '17c', 'right')
        out.footY = Math.round(b2.getBoundingClientRect().top + b2.getBoundingClientRect().height / 2); out.atY = Math.round(at.y)
        void hl
      } else if (which === 'card') {
        const c = mq.ask(btn, '3 lines added to Go 1', 'At the foot of the wave, below the screen.', [['Show them', ''], ['+ Line', 'primary']])
        mq.mark(c, '17d')
      } else {
        const c = mq.ask(btn, 'How many lines?', null, [['Cancel', ''], ['Add 3 lines', 'primary']])
        const row = document.createElement('span'); row.setAttribute('data-mine', '1'); row.style.cssText = 'display:flex;align-items:center;gap:10px'
        const minus = document.createElement('button'); minus.className = 'abtn'; minus.textContent = '−'
        const n = document.createElement('span'); n.textContent = '3'; n.style.cssText = 'font-weight:700;font-size:15px;min-width:2ch;text-align:center;color:var(--ink)'
        const plus = document.createElement('button'); plus.className = 'abtn'; plus.textContent = '+'
        for (const b of [minus, plus]) { b.style.minHeight = '36px'; b.style.minWidth = '40px' }
        row.append(minus, n, plus)
        c.querySelector('.askcard-btns').before(row)
        mq.mark(c, '17e')
      }
      out.inView = inView()
      return out
    }, { which, at })
    await page.waitForTimeout(250)
    const f = `12-line-${which}-${sz}-${which === 'today' ? 'today' : 'proposed'}.png`
    await shot(page, f)
    const words = {
      today: `Real. 142's Scheduler Board, "+ Line" (mark 17a, in the wave's head) pressed three times where it stood. Three blank lines were added at the wave's foot — ${info.inView} of 3 wholly in view on this ${SIZES[sz].name} screen; the screen does not move to them. The passing note "Line added" (mark 17b) says it each time, the same words, with no count.`,
      foot: `Recommended, drawn in. The same "+ Line" button, its size kept, moved from the wave's head to its foot, under the last line (mark 17c); the board keeps it under the finger, so each press adds a line right above it, in view, wearing the just-added blue ring (real: the three lines here were added by real presses). Nothing out of view, so the passing note is no longer needed. The board's other add buttons ("+ Row", "+ Item", "+ Note", "+ Block") would follow the same rule where their list runs below the screen. ${info.inView} of 3 new lines wholly in view.`,
      card: `Your idea, drawn in. "+ Line" opens a card that stays open (mark 17d): each press of its "+ Line" adds a line, its count rising — "3 lines added to Go 1" — until a click outside closes it. Counted fairly, it costs no extra press: the first press opens it and adds a line, and the next click anywhere else closes it. But the lines still land at the wave's foot, below the screen here, so the card has to say where they went and offer "Show them".`,
      step: `Another way, drawn in. "+ Line" opens a card asking how many (mark 17e): − 3 +, then "Add 3 lines". One deliberate number in place of repeated presses, so no line is made by an extra press; but every add, even of one line, now takes two presses, and the lines still land at the foot.`,
    }
    rec(f, 'Q5', sz, which === 'today' ? 'today' : 'proposed', words[which] + ' (142\'s 1st wave; the full screen, so what is out of view shows.)')
    notes.push(`pic12 ${which} ${sz}: ${JSON.stringify(info)}`)
    await ctx.close()
  }
}

// round 2's pictures that this round's walk uses unchanged (copied byte for byte — git keeps one copy)
function copyR2() {
  const map = {
    '2-a2-odrow-d-proposed.png': '6-home-d-proposed.png', '2-a2-odrow-p-proposed.png': '6-home-p-proposed.png',
    '12-b3-join-d-proposed.png': '8-join-d-proposed.png', '12-b3-join-p-proposed.png': '8-join-p-proposed.png',
    '5-b1-look2-d-proposed.png': '10-week-d-ruled.png',
    '10-b3-149first-149-d-proposed.png': '11-sign-149first-149-d-proposed.png', '10-b3-149first-142-d-proposed.png': '11-sign-149first-142-d-proposed.png',
    '11-b3-142first-142-d-proposed.png': '11-sign-142first-142-d-proposed.png', '11-b3-142first-149-d-proposed.png': '11-sign-142first-149-d-proposed.png',
    '10-b3-149first-149-p-proposed.png': '11-sign-149first-149-p-proposed.png', '10-b3-149first-142-p-proposed.png': '11-sign-149first-142-p-proposed.png',
    '11-b3-142first-142-p-proposed.png': '11-sign-142first-142-p-proposed.png', '11-b3-142first-149-p-proposed.png': '11-sign-142first-149-p-proposed.png',
  }
  const r2m = JSON.parse(readFileSync(`${R2}/manifest.json`, 'utf8'))
  for (const [a, b] of Object.entries(map)) {
    copyFileSync(`${R2}/${a}`, `${OUT}/${b}`)
    manifest[b] = { ...r2m[a], question: 'walk', caption: `Round 2's picture, unchanged (as ruled). ${r2m[a].caption}` }
  }
  console.log('  copied', Object.keys(map).length, 'from round 2')
}

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ALL = { pic1, pic2, pic2b, pic3, pic4, pic5, pic7, pic9, pic10, pic12 }
try {
  if (!ONLY || ONLY.includes('copy')) copyR2()
  for (const sz of ['d', 'p']) {
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
console.log('NOTES\n' + notes.join('\n'))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
