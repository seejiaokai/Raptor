// Multi-squadron & detachment — Round 7, Group D (access, transfer, Admin), drawn on the REAL running app by
// .claude/skills/brainstorming/mockups-on-the-real-app.md, to the drawing brief
// docs/superpowers/briefs/2026-11-17-multi-sqn-r7-drawing.md §Group D (D1–D7). The brief's words are the spec, drawn
// letter for letter. Two mark colours (his D2159): BLUE #0e7fa6 for what he has already ruled, PINK #ff2d95 for what is
// new in round 7 or a question. Each mark is drawn ON its element by mq.mark (outline + child tag), never laid over.
// Helpers copied whole from round 4's kit (docs/mock/2026-11-17-multi-sqn-r4/draw.mjs: kit, world, toAdmin, the
// Admin → Squadrons builder) and round 7's transfer kit (draw-transfer.mjs: the Post out sheet, variant F); mq.mark gains
// a colour. Every proposed frame adds nodes marked data-mine, hides an app node (display:none, never removed) or changes
// a real node's words; nothing is removed. Demo data only; names re-lettered where the brief names someone the demo
// does not have.
//
// Run from raptor-port/, against a built preview already serving:
//   MQ_URL=http://localhost:4180/ node docs/mock/2026-11-17-multi-sqn-r7/draw-r7d.mjs
// MQ_ONLY=d1,d5a draws only those; MQ_SZ=d or p one size.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, readdirSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4180/'
// the brief: pictures to the page's folder, then copied to docs/img/
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

const MARK_CSS = `
.mkq { outline: 2px solid ${PINK} !important; outline-offset: -2px !important; }
.mkq.mkb { outline-color: ${BLUE} !important; }
.mkq.mkq-o { outline-offset: 2px !important; }
.mkq.mkq-p { outline-offset: 5px !important; }
.mkq-tag { position: absolute; z-index: 60; background: ${PINK}; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; font-style: normal; }
.mkq-tag.mkb { background: ${BLUE}; }
.toast, .toasts, #toast, #toastEl { display: none !important; }
*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}
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
  // colour: 'blue' (already ruled) or 'pink' (new in round 7, or a question)
  mq.mark = (el, label, where = 'in', colour = 'pink') => {
    if (where === 'right' && el.getAttribute('data-mine') === '1') el.style.width = 'fit-content'
    const b = el.getBoundingClientRect()
    if (el.getAttribute('data-mine') === '1' && getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.classList.add('mkq'); if (colour === 'blue') el.classList.add('mkb')
    if (where === 'below' || where === 'right' || where === 'left' || where === 'above') el.classList.add('mkq-o')
    if (where === 'pad') el.classList.add('mkq-p')
    // 'inO': the ring 2px outside the element (clear of its letters), the tag inside its top-right corner
    if (where === 'inO') { el.classList.add('mkq-o'); if (getComputedStyle(el).position === 'static') el.style.position = 'relative' }
    const t = document.createElement('span')
    t.className = 'mkq-tag' + (colour === 'blue' ? ' mkb' : ''); t.textContent = label; t.setAttribute('data-mine', '1')
    if (where === 'pad') { if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; t.style.top = '-12px'; t.style.right = '-10px'; el.appendChild(t) }
    else if (where === 'below') { t.style.top = 'calc(100% + 4px)'; t.style.right = '0'; el.appendChild(t) }
    else if (where === 'above') { t.style.bottom = 'calc(100% + 4px)'; t.style.right = '0'; el.appendChild(t) }
    else if (where === 'right') { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.left = 'calc(100% + 5px)'; el.appendChild(t) }
    else if (where === 'left') { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.right = 'calc(100% + 5px)'; el.appendChild(t) }
    else if (where === 'br') { t.style.bottom = '3px'; t.style.right = '3px'; el.appendChild(t) }
    else if (where === 'tl') { t.style.top = '3px'; t.style.left = '3px'; el.appendChild(t) }
    else if (getComputedStyle(el).position !== 'static') { t.style.top = '1px'; t.style.right = '1px'; el.appendChild(t) }
    else el.insertBefore(t, el.firstChild)
    const a = el.getBoundingClientRect()
    const same = ['x', 'y', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) < 0.5)
    if (!same) throw new Error('mark moved its element: ' + label)
    return t
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
    }
    return bad
  }
  mq.topH = () => { const t = document.querySelector('.topbar'); return t && mq.vis(t) ? t.getBoundingClientRect().bottom : 0 }
  mq.scrollUnder = (el, gap) => { window.scrollTo(window.scrollX, window.scrollY + el.getBoundingClientRect().top - mq.topH() - gap) }
  mq.days = () => [...document.querySelectorAll('#eWeek > .day')].filter(d => mq.vis(d) && !d.classList.contains('peek'))
  mq.monday = () => mq.days()[0]
  // the top bar's own squadron number re-lettered (149's admin): round 4's way
  mq.as149 = () => { const k = document.querySelector('.topbar .mark .k'); if (k && mq.vis(k)) { const k2 = mq.strip(k.cloneNode(true)); k2.textContent = '149'; mq.hide(k); k.after(k2) } }
  // text nodes inside root: every whole word a → b
  mq.reletter = (root, a, b) => {
    let n = 0; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let tn
    while ((tn = w.nextNode())) { const re = new RegExp('\\b' + a + '\\b', 'g'); if (re.test(tn.nodeValue)) { tn.nodeValue = tn.nodeValue.replace(re, b); n++ } }
    return n
  }
  // the front visible Post out sheet
  mq.sheet = () => [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(x => x.getBoundingClientRect().height > 0).pop()
  window.__mq = mq
}

const manifest = {}
const notes = []
const errs = []
let browser

async function world(sz, { user = 'ad', pass = 'a' } = {}) {
  const ctx = await browser.newContext(SIZES[sz].opts)
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`); console.log('PAGEERROR', String(e)) })
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  await page.goto(URL_)
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(700)
  await page.addStyleTag({ content: MARK_CSS })
  return { ctx, page }
}
function rec(file, item, sz, kind, caption) { manifest[file] = { item, size: SIZES[sz].name, kind, caption } }
async function shot(page, file, clip) {
  const bad = await page.evaluate(() => window.__mq.checkTags())
  if (bad.length) throw new Error(file + ': ' + bad.join('; '))
  await page.mouse.move(Math.round(page.viewportSize().width / 2), 1)
  await page.waitForTimeout(150)
  await page.screenshot({ path: `${PAGEIMG}/${file}`, ...(clip ? { clip } : {}) })
  console.log('  wrote', file)
}
// a clip round window.__mqClipEl, padded, kept under the top bar (unless top) and inside the screen
async function clipOf(page, { pad = 8, top = 0, extraH = 0, full = false } = {}) {
  return page.evaluate(({ pad, top, extraH, full }) => {
    const e = window.__mqClipEl, r = e.getBoundingClientRect()
    const x = full ? 0 : Math.max(0, r.left - pad), y = Math.max(window.__mq.topH(), r.top - pad - top)
    const w = full ? innerWidth : Math.min(innerWidth - x, r.width + pad * 2), h = Math.min(innerHeight - y, r.bottom + pad + extraH - y)
    return { x, y, width: w, height: h }
  }, { pad, top, extraH, full })
}

// ---------- Admin (round 4's toAdmin and squadrons builder, copied whole; editDet added for D5a) ----------
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
    H('Squadrons · 2')
    const l1 = list()
    R(l1, '142', 'Home base · 61 people')
    const r149 = R(l1, '149', (opts.p149 || 'Northern base') + ' · 48 people')
    if (opts.edit149) out.edit = editor(r149, [['Place', 'sel', '', ['Home base · 142', 'Northern base', 'Exercise base', '+ New place…']]], opts.edit149)
    H('Detachments · ' + (opts.det ? 1 : 0))
    const l2 = list()
    let rd = null
    if (opts.det) rd = R(l2, `${SHORT} · ${DET}`, 'Exercise base · 13 Jul – 31 Jul · 6 people', 'Close detachment')
    if (rd && opts.editDet) out.editDet = editor(rd, opts.editDet)
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
    const x = Math.max(0, left), w = sz === 'd' ? Math.min(innerWidth - x, pr.right + 12 - x) : innerWidth
    return { x, y: 0, width: w, height: Math.min(innerHeight, pr.bottom + 14 + extra) }
  }, { sz, extra })
}

// ---------- D1 · Admin → Users, Saber's access to 149: one choice only, "149 · View" (Q5, D2160) ----------
async function d1(sz) {
  const { ctx, page } = await world(sz)
  await page.evaluate(() => window.go('admin'))
  await page.waitForSelector('#page-admin.on button.acc-main', { state: 'attached' }); await page.waitForTimeout(500)
  if (!(await page.locator('#page-admin button.acc-main').first().isVisible())) {
    await page.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first().click()
    await page.waitForSelector('#page-admin.on button.acc-main'); await page.waitForTimeout(500)
  }
  // Saber is the demo's signed-in admin, and the app (rightly) will not open one's own account: Hex's row is opened and
  // re-lettered Saber with Saber's own list line (sign-in "ad", Pilot, CAT IP, admin), read from Saber's real row
  const real = await page.evaluate(() => {
    const b = [...document.querySelectorAll('#page-admin button.acc-main')].find(x => /^Saber/.test(x.innerText.trim()))
    const row = b.closest('.acc-row') || b.parentElement
    const chip = [...row.querySelectorAll('*')].find(e => !e.children.length && /^(member|admin)$/i.test(e.textContent.trim()))
    return { sub: b.querySelector('.acc-sub') ? b.querySelector('.acc-sub').textContent : '', txt: row.innerText.replace(/\s+/g, ' '), chip: chip ? chip.textContent : '' }
  })
  const hex = page.locator('#page-admin button.acc-main', { hasText: /^Hex/ }).first()
  await hex.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
  await hex.click()
  await page.waitForSelector('#accEdSave'); await page.waitForTimeout(400)
  const st = await page.evaluate((real) => {
    const mq = window.__mq
    const ed = document.querySelector('#accEdSave').closest('.acc-edit')
    const rowR = ed.closest('.acc-row') || ed.parentElement
    const nm = rowR.querySelector('.acc-name'); nm.textContent = 'Saber'
    const sb = rowR.querySelector('.acc-sub'); if (sb && real.sub) sb.textContent = real.sub.replace(/\s*YOU\s*$/i, '')
    const sin = ed.querySelector('#accEdName'); sin.value = 'ad'; sin.setAttribute('value', 'ad')
    const role = ed.querySelector('#accEdRole'); role.value = 'admin'
    // the row's role chip as Saber's own row shows it (or, where his own row shows none, as an admin's)
    const chip = [...rowR.querySelectorAll('*')].find(e => !e.children.length && /^(member|admin)$/i.test(e.textContent.trim()))
    if (chip) chip.textContent = real.chip || 'Admin'
    const col = ed.querySelector('.adm-2col'), mfSel = [...col.querySelectorAll('.mfield')].find(f => f.querySelector('select'))
    // a third field, the editor's own Role choice cloned: access to another squadron, its one choice "149 · View"
    const c = mq.strip(col.cloneNode(false))
    const f = mq.strip(mfSel.cloneNode(true)); f.querySelector('label').textContent = 'Other squadrons'
    const s = f.querySelector('select'); s.innerHTML = ''; const o = document.createElement('option'); o.textContent = '149 · View'; s.appendChild(o); s.selectedIndex = 0; s.removeAttribute('aria-label')
    c.appendChild(f); col.after(c)
    mq.mark(f, 'Q5', 'pad', 'blue')
    const row = ed.closest('.acc-row') || ed.parentElement
    window.__mqClipEl = row
    row.scrollIntoView({ block: 'center' })
    document.activeElement && document.activeElement.blur && document.activeElement.blur()
    return { fields: [...ed.querySelectorAll('.mfield label')].map(l => l.textContent), row: row.querySelector('.acc-main') ? row.querySelector('.acc-main').innerText.replace(/\s+/g, ' ') : '', real }
  }, real)
  await page.waitForTimeout(250)
  const f = `R7D1-${sz}-proposed.png`
  await shot(page, f, await clipOf(page, { pad: 14, top: 40 }))
  rec(f, 'D1', sz, 'proposed', `Admin → Users, Saber's row opened (the app's own editor; Hex's row re-lettered with Saber's own list line, since the demo signs in as Saber and the app does not open one's own account). Drawn in, blue Q5 (his D2160): a third field, the editor's own Role choice cloned, "Other squadrons", its one choice "149 · View" — no "as a scheduler". Fields: ${st.fields.join(' · ')}.`)
  notes.push(`d1 ${sz}: ${JSON.stringify(st)}`)
  await ctx.close()
}

// ---------- D2–D4, D7e · the Post out sheet (round 6's sheetFor, draw-transfer.mjs) ----------
async function sheetFor(sz, pid, iso) {
  const { ctx, page } = await world(sz)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await page.waitForTimeout(800)
  const c = page.locator(`[data-testid="cell-${pid}-${iso}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
  if (sz === 'p') await c.tap(); else await c.click()
  await page.waitForTimeout(700)
  await page.locator('.bidsheet[role="dialog"] [data-testid="bid-more"]').filter({ visible: true }).last().click(); await page.waitForTimeout(400)
  await page.locator('[data-testid="bid-postout"]').filter({ visible: true }).last().click(); await page.waitForTimeout(700)
  return { ctx, page }
}
async function sheetClip(page) {
  const b = await page.evaluate(() => { const r = window.__mq.sheet().getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })
  const pad = 16, vw = page.viewportSize()
  return { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - 40), width: Math.min(vw.width, b.w + 2 * pad), height: Math.min(vw.height - Math.max(0, b.y - 40), b.h + 40 + pad) }
}
// variant F (Fable's design, his T / D2161), the date re-lettered Fri 3 Apr (the brief's date; the war's grid draws only
// the months round today, so Ranger's Fri 20 Nov stands in), with round 7's top line
const TRANSFER = () => {
  const mq = window.__mq, s = mq.sheet()
  // the date: Fri 20 Nov → Fri 3 Apr, wherever the sheet says it
  const when = s.querySelector('.when'); const orig = when.textContent; when.textContent = 'Fri 3 Apr'
  const db = s.querySelector('[data-testid="po-date"] .datebox-txt'); if (db) db.textContent = 'Fri 3 Apr 26'
  const till = s.querySelector('[data-testid="bid-tilldate"]'); if (till) till.textContent = 'till 3 Apr'
  const ov = s.querySelector('[data-testid$="-overseas"]'); ov.classList.remove('on'); ov.textContent = 'Overseas Sqn'
  const t = s.querySelector('[data-testid$="-transfer"]'); t.disabled = false; t.removeAttribute('title'); t.classList.add('on'); t.textContent = '✓ Transfer to Sqn'
  const row = s.querySelector('.po-outcomes')
  const proto = row.querySelector('[data-testid$="-delete"]')
  const to = row.cloneNode(false); to.setAttribute('data-mine', '1'); to.removeAttribute('aria-label')
  const lab = row.querySelector('.lab').cloneNode(true); lab.textContent = 'To'; to.appendChild(lab)
  const ch = proto.cloneNode(true); ch.removeAttribute('data-testid'); ch.classList.add('on'); ch.textContent = '✓ 149'; to.appendChild(ch)
  row.after(to)
  const note = [...s.querySelectorAll('.note')].find(x => /^On /.test(x.textContent.trim()))
  // round 7's top line (the brief's words); "Management and SXO" in a span of its own, for its mark
  note.textContent = ''
  note.append('On Fri 3 Apr: moves to 149 as a member, with his sign-in, leave, OIL and inputs. His admin rights and his Scheduler, ')
  const l1 = document.createElement('span'); l1.setAttribute('data-mine', '1'); l1.textContent = 'Management and SXO'; note.append(l1)
  note.append(' ticks in 142 end.')
  for (const b of s.querySelectorAll('button')) if (b.textContent.trim() === 'Post out') { b.disabled = false; b.removeAttribute('aria-disabled') }
  const d = '3 Apr'
  // variant F's lines, as draw-transfer.mjs draws them (D2147: today's figures, worked out again on the date)
  const L = ['As of today:', // his D2162 (17 Nov 26), was "Today, worked out again on <date>:"
    `2 of 142's lines after ${d} keep him, as a borrowed 149 man`,
    '3 of his inputs move to 149\'s schedule',
    '1 leave 142 approved arrives approved, marked "approved by 142 before he joined"; 149 may send it back',
    'Published days go pending: 4 of 142\'s, 2 of 149\'s',
    `142's manning from ${d}: OPS P turns amber on 4 days`,
    "Both squadrons' admins are told now and on the date"]
  const n2 = note.cloneNode(false); n2.setAttribute('data-mine', '1'); n2.textContent = L.join('\n'); n2.style.whiteSpace = 'pre-line'
  note.after(n2)
  for (const x of [note, n2]) { x.style.flex = '1 1 100%'; x.style.maxWidth = '100%' }
  window.__mqT = { note, l1, n2, s, to }
  return { top: note.textContent, L, orig }
}
async function d2(sz, last) {
  const { ctx, page } = await sheetFor(sz, 'bane', '2026-11-20')
  const w = await page.evaluate(TRANSFER)
  const st = await page.evaluate((last) => {
    const mq = window.__mq, { s, l1, n2 } = window.__mqT
    if (!last) {
      mq.mark(s, 'T', 'br', 'blue')
      // "Management and SXO": ringed where it stands; its tag at the end of the words after it on the same line
      // (" ticks in 142 end."), so it covers no letter — measured from that text's own last line box
      l1.style.display = 'inline-block'
      const tg = mq.mark(l1, 'New · L1', 'right', 'pink')
      const rest = l1.nextSibling, rg = document.createRange(); rg.selectNodeContents(rest)
      const rr = [...rg.getClientRects()].pop(), lr = l1.getBoundingClientRect()
      if (Math.abs(rr.top - lr.top) < 6) { tg.style.left = Math.round(rr.right - lr.left + 8) + 'px' }
      // the lines are tight: the ring sits on the phrase's own line box, clear of the lines above and below
      l1.style.setProperty('outline-offset', '0px', 'important')
      n2.style.marginTop = '6px'
      mq.mark(n2, 'D2147', 'inO', 'blue')
      return { marks: 3, restSameLine: Math.abs(rr.top - lr.top) < 6 }
    }
    // D3: Ranger is 142's last admin — Post out greyed (the sheet's own disabled look), the reason above it in the
    // sheet's own refusal look (the "note warn" line Post out's own error uses)
    const po = [...s.querySelectorAll('button')].find(b => b.textContent.trim() === 'Post out')
    po.disabled = true
    const poRow = po.closest('.bidsheet-row')
    const r = poRow.cloneNode(false); r.setAttribute('data-mine', '1')
    const sp = document.createElement('span'); sp.className = 'note warn'; sp.textContent = 'Ranger is 142\'s last admin. Make another admin of 142 first.'
    sp.setAttribute('data-mine', '1'); r.appendChild(sp); poRow.before(r)
    mq.mark(sp, 'Q10', 'inO', 'pink')
    return { op: getComputedStyle(po).opacity }
  }, last)
  await page.waitForTimeout(200)
  const f = `R7D${last ? 3 : 2}-${sz}-proposed.png`
  await shot(page, f, await sheetClip(page))
  if (!last) rec(f, 'D2', sz, 'proposed', `The Post out sheet, variant F (Fable's design, ruled T), Ranger to 149, Fri 3 Apr. Blue T on the sheet: "To 149" only, no rows of choices. The top line: "${w.top}" — pink New · L1 on "Management and SXO". Blue D2147 on the lines under it, today's figures worked out again on the date (variant F's lines). The date is re-lettered: the war's grid draws only the months round today, so Ranger's Fri 20 Nov stands in. Figures made up.`)
  else rec(f, 'D3', sz, 'proposed', `The same sheet, Ranger 142's last admin: Post out greyed (the sheet's own disabled look, opacity ${st.op}) and, above it in the sheet's refusal look, "Ranger is 142's last admin. Make another admin of 142 first." — pink Q10, drawn as recommended. The sheet has no Save: its Post out button is its Save.`)
  notes.push(`d${last ? 3 : 2} ${sz}: ${JSON.stringify(st)} sheet date was "${w.orig}"`)
  await ctx.close()
}
// D4: Viper (Comet stands in) posted out with Delete, whom 149 has on its lines 1–5 Dec
async function d4(sz) {
  const { ctx, page } = await sheetFor(sz, 'beams', '2026-12-01')
  await page.locator('[data-testid="po-delete"]').filter({ visible: true }).last().click(); await page.waitForTimeout(400)
  const st = await page.evaluate(() => {
    const mq = window.__mq, s = mq.sheet()
    const n = mq.reletter(s, 'Comet', 'Viper')
    for (const e of s.querySelectorAll('[aria-label*="Comet"]')) e.setAttribute('aria-label', e.getAttribute('aria-label').replace(/Comet/g, 'Viper'))
    const line = s.querySelector('[data-testid="po-line"]')
    // under the sheet's own line, in the same row (as variant F's lines stand under its top line)
    const sp = line.cloneNode(false); sp.removeAttribute('data-testid'); sp.setAttribute('data-mine', '1')
    sp.textContent = '149 has him on 3 lines, 1–5 Dec: those seats are left empty and 149\'s schedulers are told.'
    line.after(sp)
    for (const x of [line, sp]) { x.style.flex = '1 1 100%'; x.style.maxWidth = '100%' }
    // tag in the bottom-right corner, where the wrapped line ends short on a phone
    const tg = mq.mark(sp, 'New · M5', 'inO', 'pink'); tg.style.top = 'auto'; tg.style.bottom = '1px'
    return { renamed: n, line: line.textContent, on: [...s.querySelectorAll('.po-outcomes .on')].map(x => x.textContent), who: s.querySelector('.who').textContent }
  })
  if (!/Delete/.test(st.on.join())) throw new Error('d4: Delete not picked ' + JSON.stringify(st))
  await page.waitForTimeout(200)
  const f = `R7D4-${sz}-proposed.png`
  await shot(page, f, await sheetClip(page))
  rec(f, 'D4', sz, 'proposed', `The Post out sheet for Viper (the demo's Comet re-lettered), Delete picked for real; the sheet's own line reads "${st.line}". Drawn in under it, the sheet's own line look cloned: "149 has him on 3 lines, 1–5 Dec: those seats are left empty and 149's schedulers are told." — pink New · M5.`)
  notes.push(`d4 ${sz}: ${JSON.stringify(st)}`)
  await ctx.close()
}

// ---------- D5 · Admin → Squadrons, the place ----------
async function d5(sz, part) {
  const { ctx, page } = await world(sz)
  await toAdmin(page)
  if (part === 'a') {
    await squadrons(page, { det: true, editDet: [['Place', 'sel', '', ['Exercise base', 'Home base', 'Northern base', '+ New place…']], ['Hours from home', 'in', '+7']] })
    await page.evaluate(() => { const mq = window.__mq, e = window.__mqSq.editDet; const fs = e.cols[0].querySelectorAll('.mfield'); mq.mark(fs[1], 'Q8', 'pad', 'pink') })
  } else {
    await squadrons(page, { edit149: 'From tomorrow, 142 and 149 can plan each other\'s people.' })
    await page.evaluate(() => { const mq = window.__mq, e = window.__mqSq.edit; mq.mark(e.noteEl, 'New · K2', 'pad', 'pink') })
  }
  await page.waitForTimeout(250)
  const f = `R7D5${part}-${sz}-proposed.png`
  await shot(page, f, await adminClip(page, sz))
  if (part === 'a') rec(f, 'D5', sz, 'proposed', `Admin → Squadrons (round 4's page), Exercise North's row opened. Drawn in beside its Place ("Exercise base"): "Hours from home" reading "+7" — pink Q8, a question drawn as recommended. Both fields are the Users editor's own, re-lettered.`)
  else rec(f, 'D5', sz, 'proposed', `Admin → Squadrons, 149's row opened on Place (round 4's 8-place). Its line now reads "From tomorrow, 142 and 149 can plan each other's people." — pink New · K2 (round 4's card said "Once saved, …").`)
  await ctx.close()
}

// ---------- D6 · the shared public-holiday list: 149's admin adds Fri 7 Aug ----------
async function d6(sz) {
  const { ctx, page } = await world(sz)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await page.waitForTimeout(800)
  await page.locator('[data-testid="settings-open"]').filter({ visible: true }).first().click()
  await page.locator('[data-testid="settings-days"]').filter({ visible: true }).first().click()
  await page.waitForSelector('[data-testid="win-days"]')
  if (await page.locator('[data-testid="days-tabs"]').filter({ visible: true }).count()) await page.locator('[data-testid="days-tab-holidays"]').filter({ visible: true }).first().click()
  await page.locator('[data-testid="hol-add"]').filter({ visible: true }).first().click()
  await page.waitForSelector('[data-testid="win-holiday"]'); await page.waitForTimeout(500)
  for (let i = 0; i < 12; i++) {
    const m = await page.locator('[data-testid="holcal"]').getAttribute('data-month')
    if (m === '2026-08') break
    await page.locator('[data-testid="holcal-prev"]').click(); await page.waitForTimeout(120)
  }
  await page.locator('[data-testid="holcal-day-2026-08-07"]').click(); await page.waitForTimeout(300)
  const st = await page.evaluate(() => {
    const mq = window.__mq
    mq.as149()
    const win = document.querySelector('[data-testid="win-holiday"]')
    const acts = win.querySelector('.hol-acts')
    // the line, in the Holidays list's own warning look (its amber "no leave period covers" box)
    const w = document.createElement('div'); w.className = 'hol-nocover'; w.setAttribute('data-mine', '1')
    const sp = document.createElement('span'); sp.textContent = '142\'s published Fri 7 Aug and 149\'s published Fri 7 Aug become holidays after publishing: each needs republishing for its OIL. Both squadrons\' admins are told.'
    w.appendChild(sp); acts.before(w)
    // the tag just above the box's right end, where the dates' line leaves room; never over the warning's words
    const tg = mq.mark(w, 'New · M4', 'inO', 'pink'); tg.style.top = '-17px'; tg.style.right = '-2px'
    window.__mqClipEl = win
    // the window's body scrolls: brought to its foot, so the whole warning box shows above the buttons
    for (let a = w.parentElement; a && a !== win.parentElement; a = a.parentElement) if (a.scrollHeight > a.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(a).overflowY)) a.scrollTop = a.scrollHeight
    // a neutral press target: the window's title, so no control is left focused
    const ttl = win.querySelector('.win-ttl'); ttl && ttl.click()
    return { dates: win.querySelector('[data-testid="hol-dates"]').getAttribute('data-from'), said: (win.querySelector('.hol-cal').innerText.match(/[A-Z][a-z]{2} \d+ [A-Z][a-z]{2}[^\n]*/) || [''])[0] }
  })
  if (st.dates !== '2026-08-07') throw new Error('d6: date not picked ' + JSON.stringify(st))
  await page.waitForTimeout(250)
  const f = `R7D6-${sz}-proposed.png`
  await shot(page, f, await clipOf(page, { pad: 10 }))
  rec(f, 'D6', sz, 'proposed', `Leave War → settings → Days → Holidays → "+ Add" (where the app keeps the public holidays today), the top bar's "142" re-lettered "149": 149's admin picks Fri 7 Aug (picked for real on the window's own calendar). Drawn in before Save, in the Holidays list's own amber warning box: "142's published Fri 7 Aug and 149's published Fri 7 Aug become holidays after publishing: each needs republishing for its OIL. Both squadrons' admins are told." — pink New · M4.`)
  notes.push(`d6 ${sz}: ${JSON.stringify(st)}`)
  await ctx.close()
}

// ---------- D7 · today, marked, for the questions ----------
async function d7a(sz) {
  const { ctx, page } = await world(sz)
  await page.evaluate(() => window.go('logic')); await page.waitForTimeout(1200)
  const st = await page.evaluate(() => {
    const mq = window.__mq
    const s = document.querySelector('.lgset[data-lgname="Full day of OIL"]')
    if (!s) return { err: 'no setting' }
    // the group clips what stands outside the row, so the ring is drawn just inside it
    if (getComputedStyle(s).position === 'static') s.style.position = 'relative'
    mq.mark(s, 'Q9', 'in', 'pink')
    window.__mqClipEl = s.closest('.lggrp') || s
    mq.scrollUnder(s, 80)
    return { txt: s.innerText.replace(/\s+/g, ' ') }
  })
  if (st.err) throw new Error('d7a ' + st.err)
  await page.waitForTimeout(250)
  const f = `R7D7a-${sz}-today.png`
  const clip = await page.evaluate(() => { const s = document.querySelector('.lgset[data-lgname="Full day of OIL"]'), g = window.__mqClipEl, r = s.getBoundingClientRect(), gr = g.getBoundingClientRect(); const y = Math.max(window.__mq.topH(), gr.top - 6); return { x: Math.max(0, gr.left - 10), y, width: Math.min(innerWidth - Math.max(0, gr.left - 10), gr.width + 20), height: Math.min(innerHeight - y, Math.max(r.bottom, gr.bottom) + 12 - y) } })
  await shot(page, f, clip)
  rec(f, 'D7', sz, 'today', `Today, real: Logic, the OIL setting "${st.txt}" — the value a published day keeps — ringed pink Q9.`)
  await ctx.close()
}
async function d7b(sz) {
  const { ctx, page } = await world(sz)
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#page-editsched.on #eWeek .day'); await page.waitForTimeout(900)
  const st = await page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday()
    const form = mon.querySelector('.go .form'), area = form.querySelector('.areacell')
    if (!area) return { err: 'no area' }
    if (getComputedStyle(area).position === 'static') area.style.position = 'relative'
    mq.mark(area, 'Q11', 'pad', 'pink')
    window.__mqClipEl = form
    mq.scrollUnder(form, 40)
    return { area: area.textContent }
  })
  if (st.err) throw new Error('d7b ' + st.err)
  await page.waitForTimeout(250)
  const f = `R7D7b-${sz}-today.png`
  await shot(page, f, await clipOf(page, { pad: 10, extraH: 16 }))
  rec(f, 'D7', sz, 'today', `Today, real: Edit Schedule, Monday's first line; its area field, typed text ("${st.area}"), ringed pink Q11.`)
  await ctx.close()
}
async function d7c(sz) {
  const { ctx, page } = await world(sz)
  await page.evaluate(() => window.go('tracker')); await page.waitForTimeout(2500)
  // the Syllabus pencil's menu → Edit chart layout (the chart's own way in)
  await page.locator('#arrangeBtn').evaluate(b => b.click()); await page.waitForTimeout(900)
  if (sz === 'p' && await page.locator('#foldTools').filter({ visible: true }).count()) { await page.locator('#foldTools').click(); await page.waitForTimeout(400) }
  const st = await page.evaluate(() => {
    const mq = window.__mq
    const del = [...document.querySelectorAll('.arrwrap button')].filter(mq.vis).find(b => /^Delete$/.test(b.textContent.trim()))
    if (!del) return { err: 'no Delete tool: ' + [...document.querySelectorAll('.arrwrap button')].filter(mq.vis).map(b => b.textContent.trim()).join('|') }
    if (getComputedStyle(del).position === 'static') del.style.position = 'relative'
    mq.mark(del, 'Q12', 'pad', 'pink')
    window.__mqClipEl = del.closest('.arrwrap')
    return { title: del.title }
  })
  if (st.err) throw new Error('d7c ' + st.err)
  await page.waitForTimeout(250)
  const f = `R7D7c-${sz}-today.png`
  // the tool strip and the top of the chart under it
  const clip = await page.evaluate(() => { const r = window.__mqClipEl.getBoundingClientRect(); const y = 0; return { x: 0, y, width: innerWidth, height: Math.min(innerHeight - y, r.bottom + 260 - y) } })
  await shot(page, f, clip)
  rec(f, 'D7', sz, 'today', `Today, real: the Tracker's syllabus chart in Edit chart layout (the Syllabus pencil's menu); the tool that deletes a ball, "Delete" ("${st.title}"), ringed pink Q12.`)
  await ctx.close()
}
async function d7d(sz) {
  const { ctx, page } = await world(sz)
  // Monday published by the real call (the e2e suite's, round 4's PUBLISH)
  await page.evaluate(() => { const w = window; const g = w.signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; w.setDayApproved(0, true) })
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#page-editsched.on #eWeek .day'); await page.waitForTimeout(900)
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
  const st = await page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday()
    const so = mon.querySelector('.signoff.day-sign'), head = mon.querySelector('.day-head')
    if (!so) return { err: 'no sign-off' }
    if (getComputedStyle(so).position === 'static') so.style.position = 'relative'
    // tag on the ring's top edge, kept left of the next day's column (on a phone it overlaps this day's right edge)
    const tg = mq.mark(so, 'Q13', 'pad', 'pink'); tg.style.right = '8px'
    window.__mqHead = head; window.__mqSo = so
    return { chip: head.querySelector('.dhver') ? head.querySelector('.dhver').innerText.trim() : '', boxes: [...so.querySelectorAll('.sgn .k')].map(k => k.textContent) }
  })
  if (st.err) throw new Error('d7d ' + st.err)
  if (!/ORIG/.test(st.chip)) throw new Error('d7d: not published ' + st.chip)
  await page.waitForTimeout(250)
  const f = `R7D7d-${sz}-today.png`
  const clip = await page.evaluate(() => { const h = window.__mqHead.getBoundingClientRect(), s = window.__mqSo.getBoundingClientRect(); const x = Math.max(0, Math.min(h.left, s.left) - 10); const y = Math.max(0, h.top - 10); return { x, y, width: Math.min(innerWidth - x, Math.max(h.right, s.right) + 20 - x), height: Math.min(innerHeight - y, s.bottom + 12 - y) } })
  await shot(page, f, clip)
  rec(f, 'D7', sz, 'today', `Today, real: Edit Schedule, Monday published (its head reads "${st.chip}"); the day's four sign-off boxes (${st.boxes.join(', ')}), waiting empty for the next amendment, ringed pink Q13.`)
  await ctx.close()
}
async function d7e(sz) {
  const { ctx, page } = await sheetFor(sz, 'bane', '2026-11-20')
  const st = await page.evaluate(() => { const mq = window.__mq, s = mq.sheet(), row = s.querySelector('.po-outcomes'); if (getComputedStyle(row).position === 'static') row.style.position = 'relative'; mq.mark(row, 'Q17', 'inO', 'pink'); return { chips: [...row.querySelectorAll('button')].map(b => b.textContent.trim()) } })
  await page.waitForTimeout(200)
  const f = `R7D7e-${sz}-today.png`
  await shot(page, f, await sheetClip(page))
  rec(f, 'D7', sz, 'today', `Today, real: Ranger's Post out sheet on the Leave War; its outcome chips (${st.chips.join(' · ')}) ringed pink Q17.`)
  await ctx.close()
}

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ALL = { d1, d2: sz => d2(sz, false), d3: sz => d2(sz, true), d4, d5a: sz => d5(sz, 'a'), d5b: sz => d5(sz, 'b'), d6, d7a, d7b, d7c, d7d, d7e }
try {
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
try { old = JSON.parse(readFileSync(`${OUT}/manifest-r7d.json`, 'utf8')) } catch {}
writeFileSync(`${OUT}/manifest-r7d.json`, JSON.stringify({ ...old, ...manifest }, null, 2) + '\n')
for (const f of readdirSync(PAGEIMG)) if (/^R7D/.test(f)) copyFileSync(`${PAGEIMG}/${f}`, `${OUT}/${f}`)
console.log('NOTES\n' + notes.join('\n'))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
