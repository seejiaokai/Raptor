// Multi-squadron & detachment — Round 2 question pictures (16 Nov 26, chat 92).
// Draws round 2 of docs/superpowers/specs/2026-11-16-multi-sqn-detachment-design.md on the REAL running app, today
// beside proposed, by .claude/skills/brainstorming/mockups-on-the-real-app.md — the kit and marks are round 1's
// (docs/mock/2026-11-16-multi-sqn-r1/draw.mjs): each "today" frame is the app as it draws itself; each "proposed" frame
// clones a real neighbour (marked data-mine) or hides an app node (display:none, never removed). Records a frame needs
// (an overseas duty, an Attach, a published Monday, an ALL AVAIL row) are filed through the app's own doors (the
// localhost bridge's fileInput — the Inputs page's writeInputs — and the sign-off / publish calls the e2e suite uses),
// then asserted ON SCREEN before anything is drawn; the app draws them itself.
//
// Run from raptor-port/, against a built preview already serving:  MQ_URL=http://localhost:4180/ node docs/mock/2026-11-16-multi-sqn-r2/draw.mjs
// Pictures and manifest.json go to docs/img/2026-11-16-multi-sqn-r2/.
// Demo data only. The squadrons are the bare numbers 142 and 149; the detachment is the invented "Exercise North".
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { unlinkSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4180/'
const OUT = 'docs/img/2026-11-16-multi-sqn-r2'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
mkdirSync(OUT, { recursive: true })

const SIZES = {
  d: { name: 'desktop', opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const DET = 'Exercise North'
// the demo's people by their hidden ids (Admin → Users): Anvil = shaft, Comet = beams, Cinch = snap
const ANVIL = 'shaft', COMET = 'beams', CINCH = 'snap'

const MARK_CSS = `
.mkq { outline: 2px solid #ff2d95 !important; outline-offset: -2px !important; }
.mkq.mkq-o { outline-offset: 2px !important; }
.mkq-tag { position: absolute; z-index: 60; background: #ff2d95; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; }
.toast, .toasts, #toast { display: none !important; }
`

function kit() {
  const mq = {}
  mq.vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  mq.strip = root => {
    const A = ['id', 'data-inprow', 'data-inpedit', 'data-inp', 'data-txt', 'data-slot', 'data-fill', 'data-drag', 'data-inpseat',
      'tabindex', 'data-plangolive', 'data-plandup', 'data-avtog', 'data-planmenu', 'for', 'data-person', 'data-testid', 'contenteditable', 'data-acc', 'data-acck']
    for (const n of [root, ...root.querySelectorAll('*')]) for (const a of A) n.removeAttribute(a)
    root.setAttribute('data-mine', '1')
    return root
  }
  mq.hide = e => { e.setAttribute('data-mqhid', '1'); e.style.setProperty('display', 'none', 'important') }
  mq.mark = (el, label, where = 'in') => {
    if (where === 'right' && el.getAttribute('data-mine') === '1') el.style.width = 'fit-content'
    const b = el.getBoundingClientRect()
    if (el.getAttribute('data-mine') === '1' && getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.classList.add('mkq'); if (where === 'below' || where === 'right' || where === 'left') el.classList.add('mkq-o')
    const t = document.createElement('span')
    t.className = 'mkq-tag'; t.textContent = label; t.setAttribute('data-mine', '1')
    if (where === 'below') { t.style.top = 'calc(100% + 4px)'; t.style.right = '0'; el.appendChild(t) }
    else if (where === 'right') { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.left = 'calc(100% + 5px)'; el.appendChild(t) }
    else if (where === 'left') { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.right = 'calc(100% + 5px)'; el.appendChild(t) }
    else if (getComputedStyle(el).position !== 'static') { t.style.top = '1px'; t.style.right = '1px'; el.appendChild(t) }
    else el.insertBefore(t, el.firstChild)
    const a = el.getBoundingClientRect()
    const same = ['x', 'y', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) < 0.5)
    if (!same) throw new Error('mark moved its element: ' + label)
    return true
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
  // a row's number tag at its bottom-right corner, where a schedule row has no words (its top-left holds its name)
  mq.markRow = (r, label) => { r.style.position = 'relative'; mq.mark(r, label); const t = r.querySelector(':scope > .mkq-tag'); t.style.top = 'auto'; t.style.bottom = '2px'; t.style.right = '2px' }
  mq.monday = () => [...document.querySelectorAll('#eWeek > .day')].find(d => mq.vis(d) && !d.classList.contains('peek'))
  // the element whose own words are exactly txt (case-insensitive), visible, inside root
  mq.byText = (root, txt) => [...root.querySelectorAll('*')].find(e => mq.vis(e) && e.children.length === 0 && e.textContent.trim().toLowerCase() === txt.toLowerCase())
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

async function world(sz, user = 'ad', pass = 'a') {
  const ctx = await browser.newContext(SIZES[sz].opts)
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`); console.log('PAGEERROR', String(e)) })
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  await page.goto(URL_)
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  if (user === 'ad') { await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(700) }
  else await page.waitForTimeout(1200)
  await page.addStyleTag({ content: MARK_CSS })
  return { ctx, page }
}
async function toEdit(page) {
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#page-editsched.on #eWeek .day')
  await page.waitForTimeout(900)
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
// a clip round window.__mqClipEl (or a selector), padded, kept under the top bar and inside the screen
async function clipOf(page, sel, pad = 6, extraH = 0) {
  return page.evaluate(({ sel, pad, extraH }) => {
    const e = sel ? document.querySelector(sel) : window.__mqClipEl
    const r = e.getBoundingClientRect()
    const x = Math.max(0, r.left - pad), y = Math.max(window.__mq.topH(), r.top - pad)
    const w = Math.min(innerWidth - x, r.width + pad * 2), h = Math.min(innerHeight - y, r.height + pad * 2 + extraH)
    return { x, y, width: w, height: h }
  }, { sel, pad, extraH })
}
async function file(page, recd) {
  await page.evaluate(r => window.fileInput(r), recd)
  await page.waitForTimeout(500)
}
// Monday's Unavailable list, scrolled under the top bar — the clip element for the row pictures
async function unavMonday(page) {
  return page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday(), unav = mon.querySelector('.sec-unav')
    window.__mqClipEl = unav
    mq.scrollUnder(unav, 16)
    return [...unav.querySelectorAll('.pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim())
  })
}

// ---------- 1: A1 — the overseas duty input's window gains a "Detachment" choice ----------
async function pic1(sz) {
  const { ctx, page } = await world(sz)
  await file(page, { iid: 'mq-od', person: ANVIL, type: 'OD', date: 'Jul 13', endDate: 'Jul 31', yr: 2026, allday: true, remarks: 'Exercise, off island' })
  await toEdit(page)
  const rows = await unavMonday(page)
  if (!rows.some(r => /^OD\b.*Anvil/.test(r))) throw new Error('pic1 premise: no OD row for Anvil on Monday — ' + rows.join(' | '))
  await page.locator('#eWeek .day:not(.peek) .sec-unav [data-inpedit="mq-od"]').first().click()
  await page.waitForSelector('#inpEditType', { state: 'visible' })
  await page.waitForTimeout(500)
  // tap a neutral spot inside the window (its heading) so nothing is left focused
  const head = await page.evaluate(() => { const s = document.querySelector('#inpEditType'); let d = s; while (d && ![...d.querySelectorAll('button')].some(b => b.textContent.trim() === 'Save')) d = d.parentElement; window.__mqClipEl = d; const h = d.querySelector('h2, h3, .ttl, [id$="Title"]'); const r = (h || d).getBoundingClientRect(); return { x: r.left + 8, y: r.top + r.height / 2, txt: (h || d).textContent.trim().slice(0, 60) } })
  await page.mouse.click(head.x, head.y)
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur())
  await page.waitForTimeout(250)
  const inject = () => page.evaluate(({ DET }) => {
    const mq = window.__mq
    const sel = document.querySelector('#inpEditType'), typeF = sel.closest('.inped-f')
    const f = mq.strip(typeF.cloneNode(true))
    const kh = f.querySelector('.inped-kh'); const k = f.querySelector('label.inped-k')
    const lab = mq.strip(k.cloneNode(true)); lab.textContent = 'Detachment'
    if (kh) kh.replaceWith(lab); else k.replaceWith(lab)
    const s2 = f.querySelector('select'); s2.innerHTML = ''
    for (const t of ['None', '142 DET · ' + DET]) { const o = document.createElement('option'); o.textContent = t; s2.appendChild(o) }
    s2.selectedIndex = 1
    typeF.after(f)
    mq.mark(f, '1a')
    // the Title box reads the detachment's name, filled in by itself (a clone of the real Title field)
    const tIn = document.querySelector('#inpEditOwnTitle')
    if (tIn) {
      const tf = tIn.closest('.inped-f'), t2 = mq.strip(tf.cloneNode(true))
      const i2 = t2.querySelector('input'); i2.setAttribute('value', DET); i2.value = DET
      mq.hide(tf); tf.after(t2); mq.mark(t2, '1b')
    }
    return !!tIn
  }, { DET })
  await inject()
  const hProp = await page.evaluate(() => window.__mqClipEl.getBoundingClientRect().height)
  await page.evaluate(() => window.__mq.unclone())
  const hToday = await page.evaluate(() => window.__mqClipEl.getBoundingClientRect().height)
  // the window grows by the added field: clip to the taller of the two, from the window's top
  // the window floats over the top bar: its own top, never the bar's foot, starts the clip
  const clip = await page.evaluate(({ extra }) => { const r = window.__mqClipEl.getBoundingClientRect(); const x = Math.max(0, r.left - 8), y = Math.max(0, r.top - 8); return { x, y, width: Math.min(innerWidth - x, r.width + 16), height: Math.min(innerHeight - y, r.height + 16 + extra) } }, { extra: Math.max(0, hProp - hToday) })
  const f0 = `1-a1-input-${sz}-today.png`, f1 = `1-a1-input-${sz}-proposed.png`
  await shot(page, f0, clip)
  rec(f0, 'A1', sz, 'today', `Real. An overseas duty input (Anvil, 13–31 Jul, filed through the Inputs door) opened from Monday's Unavailable row on Edit Schedule: Person, Type "OD", Title, Duration, Document, Remarks.`)
  const hadTitle = await inject()
  if (!(await page.locator('[data-mine] select').count())) throw new Error('pic1 premise lost')
  await shot(page, f1, clip)
  rec(f1, 'A1', sz, 'proposed', `Drawn in. Mark 1a: a "Detachment" choice under Type, cloned from the real Type field, reading "142 DET · ${DET}" (its other choice "None", as today, for a trip with no schedule in the app). ${hadTitle ? `Mark 1b: the Title box (a clone of the real one) reads "${DET}" — filled in by itself from the choice.` : ''} Nothing else changes in the window.`)
  notes.push(`pic1 ${sz}: window grew ${Math.round(hProp - hToday)}px`)
  await ctx.close()
}

// ---------- 2: A2 — how a man on a detachment shows at home ----------
async function pic2(sz) {
  const shots = []
  for (const kind of ['today', 'proposed']) {
    const { ctx, page } = await world(sz)
    await file(page, { iid: 'mq-od', person: ANVIL, type: 'OD', date: 'Jul 13', endDate: 'Jul 31', yr: 2026, allday: true, remarks: 'Exercise, off island', ...(kind === 'proposed' ? { title: DET } : {}) })
    await toEdit(page)
    const rows = await unavMonday(page)
    const mine = rows.find(r => /Anvil/.test(r))
    if (!mine) throw new Error('pic2 premise: no Anvil row — ' + rows.join(' | '))
    await page.waitForTimeout(300)
    if (kind === 'proposed') await page.evaluate(() => { const r = [...window.__mq.monday().querySelectorAll('.sec-unav .pl-row')].find(x => /Anvil/.test(x.innerText)); window.__mq.markRow(r, '2') })
    const clip = await clipOf(page, null, 6)
    const f = `2-a2-odrow-${sz}-${kind}.png`
    await shot(page, f, clip)
    shots.push(mine)
    rec(f, 'A2', sz, kind, kind === 'today'
      ? `Real. Monday's Unavailable list with an overseas duty for Anvil (13–31 Jul) as the app draws it today: "${mine}".`
      : `Real, drawn by the app itself (mark 2): the same overseas duty filed with the title "${DET}" — which the detachment choice would fill in by itself. The app already shows an input's own title where its kind's name stands, the kind small with it: "${mine}". Nothing here is cloned.`)
    await ctx.close()
  }
  notes.push(`pic2 ${sz}: ${shots.join(' || ')}`)
}

// ---------- 3: A3 + C1 — Admin: the squadrons, their places and detachments ----------
async function pic3(sz) {
  const { ctx, page } = await world(sz)
  await page.evaluate(() => window.go('admin'))
  await page.waitForSelector('#page-admin.on button.acc-main', { state: 'attached' })
  await page.waitForTimeout(500)
  if (!(await page.locator('#page-admin button.acc-main').first().isVisible())) {
    await page.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first().click()
    await page.waitForSelector('#page-admin.on button.acc-main')
    await page.waitForTimeout(500)
  }
  // a real button of the Users editor to clone (Archive), taken and the editor closed again
  await page.locator('#page-admin button.acc-main', { hasText: /^Hex/ }).first().click()
  await page.waitForSelector('#accEdArchive')
  await page.evaluate(() => { window.__mqBtn = document.querySelector('#accEdArchive').cloneNode(true); window.__mqBtnP = document.querySelector('#accEdSave').cloneNode(true) })
  await page.click('#accEdCancel')
  await page.waitForTimeout(400)
  await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement && document.activeElement.blur && document.activeElement.blur() })
  await page.waitForTimeout(250)
  const f0 = `3-c1-admin-${sz}-today.png`, f1 = `3-c1-admin-${sz}-proposed.png`
  await shot(page, f0)
  rec(f0, 'A3 · C1', sz, 'today', `Real. Admin → Users as the app draws it today${sz === 'd' ? ': the areas Users, Squadron config and Data on the left' : ''}.`)
  const m = await page.evaluate(({ DET }) => {
    const mq = window.__mq, pg = document.querySelector('#page-admin')
    let panel = pg.querySelector('button.acc-main').parentElement
    while (panel && !panel.querySelector('h3')) panel = panel.parentElement
    const body = panel
    // the rail (desktop): a "Squadrons" area, cloned from the real Users one (its picked look), Users drawn unpicked
    const cats = [...pg.querySelectorAll('button.adm-cat')].filter(mq.vis)
    const users = cats.find(c => /Users/.test(c.textContent)), cfg = cats.find(c => /Squadron config/.test(c.textContent))
    if (users && cfg) {
      const sq = mq.strip(users.cloneNode(true))
      sq.querySelector('.adm-cat-l').textContent = 'Squadrons'
      sq.querySelector('.adm-cat-s').textContent = 'Places and detachments'
      const u2 = mq.strip(cfg.cloneNode(true))
      u2.querySelector('.adm-cat-ic').replaceWith(mq.strip(users.querySelector('.adm-cat-ic').cloneNode(true)))
      u2.querySelector('.adm-cat-l').textContent = 'Users'; u2.querySelector('.adm-cat-s').textContent = 'Sign-in and roster'
      mq.hide(users); users.after(u2); u2.after(sq)
      mq.mark(sq, '3a')
    }
    // the panel: everything of Users hidden, the squadrons list drawn from the panel's own parts
    const h3 = panel.querySelector('h3'), sub = panel.querySelector('h4.adm-sub'), row = panel.querySelector('.acc-row.od-row')
    const kids = [...panel.children]
    const h3c = mq.strip(h3.cloneNode(true)); h3c.textContent = 'Squadrons'
    kids.forEach(k => mq.hide(k))
    const hostOf = h3.parentElement === panel ? null : h3.parentElement
    const box = document.createElement('div'); box.setAttribute('data-mine', '1')
    box.style.cssText = getComputedStyle(row.parentElement.parentElement).cssText ? '' : ''
    const head = hostOf ? mq.strip(hostOf.cloneNode(false)) : null
    if (head) { head.appendChild(h3c); panel.appendChild(head) } else panel.appendChild(h3c)
    // the list's own wrapper (the section that holds Users' list), cloned empty, to keep its padding
    const listSec = row.closest('.acc-list').parentElement
    const sec = mq.strip(listSec.cloneNode(false)); panel.appendChild(sec)
    // the panel's own sections carry their side padding from where they sit; the clone keeps the Users list's inset
    const inset = Math.round(row.getBoundingClientRect().left - panel.getBoundingClientRect().left)
    sec.style.padding = `0 ${inset}px 14px`; h3c.style.paddingLeft = inset + 'px'
    const H = t => { const h = mq.strip(sub.cloneNode(true)); h.textContent = t; sec.appendChild(h); return h }
    const list = () => { const l = mq.strip(row.closest('.acc-list').cloneNode(false)); sec.appendChild(l); return l }
    const R = (l, name, subTx, btn) => {
      const r = mq.strip(row.cloneNode(true)); r.querySelector('.acc-name').textContent = name; r.querySelector('.acc-sub').textContent = subTx
      r.querySelectorAll('.od-c').forEach(x => x.remove())
      const rc = r.querySelector('.od-rc'); rc.innerHTML = ''
      if (btn) { const b = mq.strip(window.__mqBtn.cloneNode(true)); b.textContent = btn; rc.appendChild(b); rc.style.display = 'flex'; rc.style.alignItems = 'center' }
      l.appendChild(r); return r
    }
    H('Squadrons · 2')
    const l1 = list()
    R(l1, '142', 'Home · 61 people · yours')
    R(l1, '149', 'Home · 48 people')
    const hD = H('Detachments of 142 · 1')
    const l2 = list()
    const rd = R(l2, '142 DET · ' + DET, 'Exercise base · 13 Jul – 31 Jul · 6 people', 'Close detachment')
    const add = mq.strip(window.__mqBtnP.cloneNode(true)); add.textContent = '+ New detachment'; add.classList.remove('primary')
    const addWrap = document.createElement('div'); addWrap.setAttribute('data-mine', '1'); addWrap.style.cssText = 'margin:10px 0 4px'; addWrap.appendChild(add); sec.appendChild(addWrap)
    H('Past detachments · 1')
    const l3 = list()
    R(l3, '142 DET · Exercise South', 'Closed 6 Mar · its schedules kept, read only')
    mq.mark(l1, '3b'); mq.mark(rd.querySelector('.od-rc button'), '3c', 'left'); mq.mark(l3, '3d')
    const rr = rd.getBoundingClientRect(), br = rd.querySelector('.od-rc button').getBoundingClientRect()
    return { rowW: Math.round(rr.width), btnW: Math.round(br.width), nameRight: Math.round(rd.querySelector('.acc-main').getBoundingClientRect().right), btnLeft: Math.round(br.left) }
  }, { DET })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(200)
  await shot(page, f1)
  rec(f1, 'A3 · C1', sz, 'proposed', `Drawn in, from the Admin page's own parts. ${sz === 'd' ? 'Mark 3a: a "Squadrons" area on the left (cloned from the Users area; Users drawn unpicked). ' : ''}Mark 3b: the squadrons, each with its place — "142 · Home · 61 people · yours", "149 · Home · 48 people" (only a master admin may add one, D2093). Mark 3c: the open detachment "142 DET · ${DET}", its place, dates and people, with one button "Close detachment" (cloned from the Users editor's Archive button), and "+ New detachment" under it. Mark 3d: past detachments, kept read only. The rows are cloned from the Users list's rows, the headings from its "Waiting for access" heading.`)
  notes.push(`pic3 ${sz}: ${JSON.stringify(m)}`)
  await ctx.close()
}

// ---------- 4: C2 — "Request access" asks the squadron ----------
async function pic4(sz) {
  const { ctx, page } = await world(sz, 'newbie', 'x')
  await page.waitForSelector('#accSend')
  await page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() })
  // tap the card's heading so no box keeps the focus ring
  await page.locator('h2.acc-h').click()
  await page.waitForTimeout(300)
  const card = await page.evaluate(() => { const c = document.querySelector('#accSend').closest('form') || document.querySelector('#accSend').parentElement; let k = c; while (k && k.parentElement && k.getBoundingClientRect().width < 300) k = k.parentElement; window.__mqClipEl = k.closest('.login-card, .lcard, [class*="card"]') || k; return window.__mqClipEl.className })
  const inject = () => page.evaluate(() => {
    const mq = window.__mq
    const cat = document.querySelector('#accCat'), lab = document.querySelector('label[for="accCat"]')
    const cs = document.querySelector('label[for="accCs"]')
    const l2 = mq.strip(lab.cloneNode(true)); l2.textContent = 'Squadron'
    const s2 = mq.strip(cat.cloneNode(true)); s2.innerHTML = ''
    for (const t of ['Pick…', '142', '149']) { const o = document.createElement('option'); o.textContent = t; s2.appendChild(o) }
    s2.selectedIndex = 1
    // where the CAT pair sits in a wrapper of its own, clone the wrapper; else the two
    const wrapCat = cat.parentElement !== lab.parentElement || cat.parentElement.children.length <= 3 ? cat.parentElement : null
    let node
    if (wrapCat && wrapCat.contains(lab) && wrapCat.children.length <= 3) { node = mq.strip(wrapCat.cloneNode(false)); node.append(l2, s2) }
    else { node = document.createElement('div'); node.setAttribute('data-mine', '1'); node.style.display = 'contents'; node.append(l2, s2) }
    cs.before(l2, s2)
    l2.style.position = 'relative'
    mq.mark(l2, '4', 'right')
    return true
  })
  await inject()
  const hProp = await page.evaluate(() => window.__mqClipEl.getBoundingClientRect().height)
  const topProp = await page.evaluate(() => window.__mqClipEl.getBoundingClientRect().top)
  await page.evaluate(() => window.__mq.unclone())
  const r0 = await page.evaluate(() => { const r = window.__mqClipEl.getBoundingClientRect(); return { top: r.top, h: r.height } })
  const pad = 14
  const clipT = await page.evaluate(({ pad }) => { const r = window.__mqClipEl.getBoundingClientRect(); return { x: Math.max(0, r.left - pad), w: Math.min(innerWidth, r.width + 2 * pad) } }, { pad })
  const top = Math.max(0, Math.min(r0.top, topProp) - pad), bottom = Math.max(r0.top + r0.h, topProp + hProp) + pad
  const clip = { x: clipT.x, y: top, width: Math.min(clipT.w, SIZES[sz].opts.viewport.width - clipT.x), height: Math.min(bottom, SIZES[sz].opts.viewport.height) - top }
  const f0 = `4-c2-signup-${sz}-today.png`, f1 = `4-c2-signup-${sz}-proposed.png`
  await shot(page, f0, clip)
  rec(f0, 'C2', sz, 'today', 'Real. The "Request access" card someone signed in but on no list sees: callsign or name, initials, pilot / WSO / personnel, CAT.')
  await inject()
  if (!(await page.locator('select[data-mine]').count())) throw new Error('pic4 premise lost')
  await shot(page, f1, clip)
  rec(f1, 'C2', sz, 'proposed', 'Drawn in (mark 4): a "Squadron" choice first on the card, reading "142" (its choices 142 and 149), cloned from the real CAT choice. The request then goes to that squadron\'s admins only (D2094).')
  notes.push(`pic4 ${sz}: card ${card}; card grew ${Math.round(hProp - r0.h)}px`)
  await ctx.close()
}

// ---------- 5: B1 + D2096 — the other squadron's line marked, and the day's count kept apart ----------
async function pic5(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  const info = await page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday()
    const waves = [...mon.querySelectorAll('.go')].map(g => [...g.querySelectorAll('.form')].map(f => f.querySelector('.csmsn .ntx').textContent.trim() + ':' + f.querySelectorAll('.acrow').length))
    return { badge: mon.querySelector('.badge').textContent, waves }
  })
  if (info.badge !== '4 X 4' || !info.waves.every(w => w.join() === 'VL:2,RU:2')) throw new Error('pic5 premise: ' + JSON.stringify(info))
  // frame A: the day head with its count; frame B: wave 1
  const headClip = async () => page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday(), h = mon.querySelector('.day-head')
    mq.scrollUnder(mon, 4)
    const r = h.getBoundingClientRect()
    return { x: Math.max(0, r.left - 4), y: Math.max(mq.topH(), r.top - 4), width: Math.min(innerWidth - Math.max(0, r.left - 4), r.width + 8), height: r.height + 8 }
  })
  const waveClip = async () => page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday(), g = mon.querySelector('.go')
    mq.scrollUnder(g, 8)
    const r = g.getBoundingClientRect()
    const x = Math.max(0, r.left - 4), y = Math.max(mq.topH(), r.top - 4)
    return { x, y, width: Math.min(innerWidth - x, r.width + 8), height: Math.min(innerHeight - y, r.height + 8) }
  })
  const inject = () => page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday()
    // 5a: the count, re-lettered on a clone of the real badge — this squadron's waves first, then the other's
    const b = mon.querySelector('.badge'); const b2 = mq.strip(b.cloneNode(true)); b2.textContent = '2 X 2 (149) · 2 X 2 (142)'
    mq.hide(b); b.after(b2); mq.mark(b2, '5a', 'below')
    // 5b: RU, in both waves, marked as 142's — a tag cloned from the day head's own DRAFT tag, after the callsign
    const tagSrc = mon.querySelector('.dstat') || mon.querySelector('.dhver')
    const out = []
    for (const g of mon.querySelectorAll('.go')) {
      const f = [...g.querySelectorAll('.form')].find(x => x.querySelector('.csmsn .ntx').textContent.trim() === 'RU')
      const bb = f.querySelector('.csmsn b')
      const t = mq.strip(tagSrc.cloneNode(true)); t.textContent = '142'
      // the DRAFT tag's look is set where it sits (the day heading): its measured look copied onto the clone, verbatim
      const cs = getComputedStyle(tagSrc)
      for (const p of ['border-top-width', 'border-top-style', 'border-top-color', 'border-radius', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'font-size', 'font-weight', 'letter-spacing', 'color', 'background-color', 'line-height', 'font-family'])
        t.style.setProperty(p, cs.getPropertyValue(p))
      t.style.borderWidth = cs.borderTopWidth; t.style.borderStyle = cs.borderTopStyle; t.style.borderColor = cs.borderTopColor
      t.style.display = 'inline-block'; t.style.marginLeft = '5px'; t.style.verticalAlign = 'middle'
      bb.appendChild(t)
      out.push(t)
    }
    const fm = out[0].closest('.form'); fm.style.position = 'relative'; mq.mark(fm, '5b')
    const r = out[0].getBoundingClientRect(), cell = out[0].closest('.csmsn').getBoundingClientRect()
    const head = mon.querySelector('.day-head'), hr = head.getBoundingClientRect(), br = b2.getBoundingClientRect()
    return { tagSrc: tagSrc.className, tagRight: Math.round(r.right), cellRight: Math.round(cell.right), badgeRight: Math.round(br.right), headRight: Math.round(hr.right), badgeTop: Math.round(br.top), badgeH: Math.round(br.height) }
  })
  const fA0 = `5-b1-count-${sz}-today.png`, fA1 = `5-b1-count-${sz}-proposed.png`, fB0 = `5-b1-mark-${sz}-today.png`, fB1 = `5-b1-mark-${sz}-proposed.png`
  let c = await headClip(); await page.waitForTimeout(200); await shot(page, fA0, c)
  rec(fA0, 'B1', sz, 'today', `Real. Monday's heading on Edit Schedule: the day's count "${info.badge}" (aircraft in each wave — wave 1 VL and RU, two jets each; wave 2 the same).`)
  c = await waveClip(); await page.waitForTimeout(200); await shot(page, fB0, c)
  rec(fB0, 'B1', sz, 'today', 'Real. Monday\'s wave 1: two formations, VL and RU, two jets each. (There is no 149 in the app yet: in the proposed frames this screen stands in for 149\'s schedule, RU standing in for a 142 formation flown in 149\'s wave.)')
  const m = await inject()
  c = await headClip(); await page.waitForTimeout(200)
  if (!(await page.locator('.badge[data-mine]').count())) throw new Error('pic5 premise lost')
  await shot(page, fA1, { ...c, height: c.height + 22 })
  rec(fA1, 'B1', sz, 'proposed', 'Drawn in (mark 5a): the count, on a clone of the real one, reads "2 X 2 (149) · 2 X 2 (142)" — 149\'s own jets in each wave, then 142\'s, never added together (D2096). Shown on 149\'s schedule; 142\'s own count would read 142\'s and leave 149\'s out unless 149\'s lines show there.')
  c = await waveClip(); await page.waitForTimeout(200)
  await shot(page, fB1, c)
  rec(fB1, 'B1', sz, 'proposed', `Drawn in (mark 5b): a small "142" tag after RU's callsign — RU stands for 142's formation flown in 149's wave — cloned from the day heading's own DRAFT tag (grey, outlined). The same tag sits on RU in wave 2 (out of this picture). The line keeps every box, time and seat it has; nothing else changes.`)
  notes.push(`pic5 ${sz}: ${JSON.stringify(m)}`)
  // frame C: the issues list open (the checks question), real, marked
  if (sz === 'd') {
    await page.evaluate(() => window.__mq.unclone())
    await page.evaluate(() => { const mq = window.__mq, mon = mq.monday(); mq.scrollUnder(mon, 4) })
    const bar = page.locator('#eWeek .day:not(.peek) .dstat, #eWeek .day:not(.peek) [class*="issues"]').first()
    const opened = await page.evaluate(() => { const mon = window.__mq.monday(); const b = [...mon.querySelectorAll('button, div, span')].find(e => /^\s*\d+ issues/.test(e.textContent) && e.children.length < 6 && window.__mq.vis(e)); if (!b) return null; b.click(); return b.className })
    await page.waitForTimeout(500)
    const iss = await page.evaluate(() => {
      const mq = window.__mq, mon = mq.monday()
      const lines = [...mon.querySelectorAll('*')].filter(e => mq.vis(e) && e.children.length <= 4 && /^Conflict/.test(e.textContent.trim()))
      const l = lines[0]; if (!l) return null
      let box = l.parentElement; while (box && box.getBoundingClientRect().height < 120 && box !== mon) box = box.parentElement
      window.__mqClipEl = box; mq.scrollUnder(box, 8)
      mq.mark(l, '6')
      return { line: l.textContent.trim().slice(0, 120), box: box.className }
    })
    if (iss) {
      const cc = await clipOf(page, null, 6)
      const f = '6-b6-checks-d-today.png'
      await shot(page, f, { ...cc, height: Math.min(cc.height, 420) })
      rec(f, 'B6 · B7', sz, 'today', `Real. Monday's issues list opened on Edit Schedule (mark 6 on its first conflict line: "${iss.line}"). Questions B6 and B7 are about which of these checks would read across both squadrons.`)
    } else notes.push('pic5: no Conflict line found for frame 6 (opened ' + opened + ')')
  }
  await ctx.close()
}

// ---------- 7: B4 — the sign-off of a day, marked (real) ----------
async function pic7(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  const ok = await page.evaluate(() => { const mq = window.__mq, mon = mq.monday(), s = mon.querySelector('.signoff'); if (!s) return null; window.__mqClipEl = s; mq.scrollUnder(mon, 4); mq.mark(s, '7'); return s.innerText.replace(/\s+/g, ' ').slice(0, 120) })
  if (!ok) throw new Error('pic7 premise: no sign-off block')
  await page.waitForTimeout(200)
  const c = await clipOf(page, null, 8)
  const f = `7-b4-signoff-${sz}-today.png`
  await shot(page, f, c)
  rec(f, 'B4', sz, 'today', `Real, marked (mark 7). Monday's four sign-offs on Edit Schedule: "${ok}". Question B4 is whose four sign a wave both squadrons fly in.`)
  await ctx.close()
}

// ---------- 8: D2098 + B5 — the "Attach · 149" row at home, on a draft day and on a published day ----------
async function pic8(sz) {
  for (const pub of [false, true]) {
    const { ctx, page } = await world(sz)
    if (pub) await page.evaluate(() => { const w = window; const g = w.signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; w.setDayApproved(0, true) })
    await toEdit(page)
    const before = await unavMonday(page)
    await page.waitForTimeout(300)
    const clip0 = await clipOf(page, null, 6)
    const tag = pub ? 'pending' : 'draft'
    const f0 = `8-d1-attach-${tag}-${sz}-today.png`, f1 = `8-d1-attach-${tag}-${sz}-proposed.png`
    const dayState = await page.evaluate(() => window.__mq.monday().querySelector('.day-head').innerText.replace(/\s+/g, ' ').slice(0, 90))
    await shot(page, f0, clip0)
    rec(f0, pub ? 'B5' : 'D2098', sz, 'today', `Real. Monday's Unavailable list${pub ? ', Monday signed and published' : ''} (day heading: "${dayState}"): ${before.join(' / ')}.`)
    // the borrowed man: an Attach to 149, 08:00–12:00, filed through the Inputs door — the app draws its own row
    await file(page, { iid: 'mq-att', person: COMET, type: 'Attach', to: '149', date: 'Jul 13', yr: 2026, allday: false, s: 480, e: 720, remarks: '' })
    const after = await unavMonday(page)
    const row = after.find(r => /Comet/.test(r))
    if (!row) throw new Error('pic8 premise: no Attach row for Comet — ' + after.join(' | '))
    const pend = await page.evaluate((PUB) => {
      const mq = window.__mq, mon = mq.monday()
      const r = [...mon.querySelectorAll('.sec-unav .pl-row')].find(x => /Comet/.test(x.innerText))
      mq.markRow(r, PUB ? '8b' : '8a')
      return { head: mon.querySelector('.day-head').innerText.replace(/\s+/g, ' ').slice(0, 90), dotted: getComputedStyle(r.querySelector('.nm .ntx, .nm')).textDecorationStyle }
    }, pub)
    await page.waitForTimeout(300)
    // the added row lets the page scroll further, so the list sits higher than in the first frame: its own clip
    const clip1 = await clipOf(page, null, 6)
    await shot(page, f1, clip1)
    rec(f1, pub ? 'B5' : 'D2098', sz, 'proposed', pub
      ? `Real, drawn by the app itself (mark 8b): the same Attach filed after Monday was published, as a pick by 149 onto 142's published day would arrive — the app marks it waiting for the next amendment (day heading now: "${pend.head}"). Nothing here is cloned.`
      : `Real, drawn by the app itself (mark 8a): an Attach input for Comet "To 149", 08:00–12:00, filed through the Inputs door — the row the borrowed man would get at home, made by itself from 149's plan (D2098): "${row}". Nothing here is cloned.`)
    notes.push(`pic8 ${sz} ${tag}: row "${row}" · head "${pend.head}" · decoration ${pend.dotted}`)
    await ctx.close()
  }
}

// ---------- 9: D2097 — 142's ALL AVAIL window, the borrowed man's morning beside his puck ----------
async function pic9(sz) {
  const { ctx, page } = await world(sz)
  // Comet with 149 08:00–12:00 (an Attach); Cinch at a meeting 14:30–15:30, so the window shows a real reason line
  await file(page, { iid: 'mq-att', person: COMET, type: 'Attach', to: '149', date: 'Jul 13', yr: 2026, allday: false, s: 480, e: 720, remarks: '' })
  await file(page, { iid: 'mq-mtg', person: CINCH, type: 'Meeting', date: 'Jul 13', yr: 2026, allday: false, s: 870, e: 930, remarks: '' })
  await toEdit(page)
  await page.evaluate(() => { const w = window; w.DAYS[0].allhands.push({ prog: 'ACADEMICS', str: '14:00', end: '16:00', who: 'allavail' }); w.afterSchedMutate() })
  await page.waitForTimeout(700)
  const cnt = page.locator('#eWeek .day:not(.peek) [data-oilsent]').first()
  await cnt.scrollIntoViewIfNeeded()
  await cnt.click()
  await page.waitForSelector('.availwin:not([hidden]) .rpuck')
  await page.waitForTimeout(600)
  // tap the window's title so nothing is left focused
  await page.locator('.availwin .win-ttl').click()
  await page.waitForTimeout(250)
  const info = await page.evaluate(({ COMET, CINCH }) => {
    const w = document.querySelector('.availwin')
    window.__mqClipEl = w
    const c = w.querySelector(`.rpuck[data-awp="${COMET}"]`), m = w.querySelector(`.rpuck[data-awp="${CINCH}"]`)
    c && c.scrollIntoView({ block: 'center' })
    return { n: w.querySelector('.win-one .c, .win-tabs .c')?.textContent, ttl: w.querySelector('.win-ttl').innerText.replace(/\s+/g, ' '), comet: !!c, cinchWhy: m?.querySelector('.rwhy')?.textContent || null }
  }, { COMET, CINCH })
  if (!info.comet) throw new Error('pic9 premise: Comet not in the window — ' + JSON.stringify(info))
  const clip = await page.evaluate(() => { const r = window.__mqClipEl.getBoundingClientRect(); const x = Math.max(0, r.left - 6), y = Math.max(0, r.top - 6); return { x, y, width: Math.min(innerWidth - x, r.width + 12), height: Math.min(innerHeight - y, r.height + 12) } })
  const f0 = `9-d3-allavail-${sz}-today.png`, f1 = `9-d3-allavail-${sz}-proposed.png`
  await shot(page, f0, clip)
  rec(f0, 'D2097', sz, 'today', `Real. The ALL AVAIL window of an "ACADEMICS" row, Monday 14:00–16:00 (${info.ttl}), counting ${info.n}. Comet, attached 08:00–12:00 (his Attach input), is in it with nothing beside his puck; Cinch, at a meeting 14:30–15:30, carries the app's own reason line${info.cinchWhy ? ` ("${info.cinchWhy}")` : ''}.`)
  const m = await page.evaluate(({ COMET, CINCH }) => {
    const mq = window.__mq, w = document.querySelector('.availwin')
    const c = w.querySelector(`.rpuck[data-awp="${COMET}"]`)
    const src = w.querySelector(`.rpuck[data-awp="${CINCH}"] .rwhy`) || w.querySelector('.rwhy')
    let why
    const srcWho = src ? src.closest('.rpuck').querySelector('.nm').textContent : null
    if (src) { why = mq.strip(src.cloneNode(true)) } else { why = document.createElement('span'); why.className = 'rwhy'; why.setAttribute('data-mine', '1') }
    why.textContent = 'With 149 08:00–12:00'
    c.appendChild(why)
    mq.mark(why, '9a')
    // the count's line says whose people it counts
    const one = w.querySelector('.win-one') || w.querySelector('.win-tabs button')
    const one2 = mq.strip(one.cloneNode(true))
    const tn = [...one2.childNodes].find(x => x.nodeType === 3 && /available/.test(x.textContent))
    if (tn) tn.textContent = tn.textContent.replace('Who’s available', '142’s people available')
    const lineTx = one2.textContent
    mq.hide(one); one.after(one2); mq.mark(one2, '9b')
    return { cloned: !!src, srcWho, line: lineTx }
  }, { COMET, CINCH })
  await page.waitForTimeout(200)
  await shot(page, f1, clip)
  rec(f1, 'D2097', sz, 'proposed', `Drawn in. Mark 9a: under Comet's puck the line "With 149 08:00–12:00" — ${m.cloned ? `cloned from ${m.srcWho}'s real reason line` : 'in the reason line\'s own class (no real one to clone on this screen)'} — so 142's scheduler sees his morning with 149. Mark 9b: the count's line reads "${m.line.trim()}" — the window counts 142's own people only, a borrowed 149 man never in it. Naming Comet on 149's afternoon event would be a pick, taking him out of this count.`)
  notes.push(`pic9 ${sz}: ${JSON.stringify(m)} · ${JSON.stringify(info)}`)
  await ctx.close()
}

// B1 redrawn (his D2099, 17 Nov 26: "the B1 design is so ugly" — the first drawing, a "142" that took the callsign's
// big bold letters and fell to a line of its own on a phone). Three looks, each from parts the app already draws
// (lesson 68): the standby line's MAIN badge — its shape, letters and size, in a neutral grey since its teal means
// MAIN — on the mission line; that badge plus the formation lifted one surface step; that badge (on the mission line:
// beside the callsign it fell to a line of its own on a phone) plus a grey line down the formation's left edge (a solid line drawn as an inset shadow is a line, not a glow — §4).
async function pic5b(sz) {
  const LOOKS = [
    ['look1', '5c', 'mission'],
    ['look2', '5d', 'mission+surface'],
    ['look3', '5e', 'mission+edge'],
  ]
  for (const [name, tag, how] of LOOKS) {
    const { ctx, page } = await world(sz)
    await toEdit(page)
    const m = await page.evaluate(({ tag, how }) => {
      const mq = window.__mq, mon = mq.monday()
      const g = mon.querySelector('.go')
      const f = [...g.querySelectorAll('.form')].find(x => x.querySelector('.csmsn .ntx').textContent.trim() === 'RU')
      if (!f) return { err: 'no RU' }
      const cs = f.querySelector('.csmsn')
      // the chip: the MAIN badge's own recipe (12-schedule-editing.css .sarole), in neutral grey
      const chip = document.createElement('span')
      chip.className = 'sarole ro'; chip.textContent = '142'; chip.setAttribute('data-mine', '1')
      chip.style.background = 'rgba(255,255,255,.08)'; chip.style.borderColor = 'rgba(255,255,255,.22)'
      chip.style.color = 'var(--ink-2)'; chip.style.verticalAlign = 'middle'; chip.style.marginLeft = '5px'
      chip.style.position = 'relative'; chip.style.top = '-1px'
      const leaves = [...cs.querySelectorAll('*')].filter(e => !e.children.length && e.textContent.trim())
      const msn = leaves.find(e => e.textContent.trim() === 'BFM')
      if (!msn) return { err: 'no mission' }
      // a phone's callsign column is 50px (D367): "BFM" and the badge do not fit side by side, so the badge stacks under
      // the mission, smaller — the Flies chip's phone size (his lesson 11, D1066), lined up with the mission's left edge
      const phone = innerWidth < 600
      if (phone) { chip.style.display = 'block'; chip.style.width = 'fit-content'; chip.style.marginLeft = '0'; chip.style.marginTop = '2px'; chip.style.top = '0'; chip.style.fontSize = '7px'; chip.style.padding = '0 4px'; msn.after(chip) }
      else msn.appendChild(chip)
      if (how.includes('surface')) f.style.background = 'rgba(255,255,255,.055)'
      if (how.includes('edge')) f.style.boxShadow = 'inset 3px 0 0 rgba(255,255,255,.30)'
      // the pink tag only, no pink outline: an outline would cover the very edge and surface being shown
      f.style.position = 'relative'; mq.mark(f, tag); f.classList.remove('mkq', 'mkq-o')
      const cr = chip.getBoundingClientRect(), ccr = cs.getBoundingClientRect(), mr = msn.getBoundingClientRect()
      const sameLine = phone ? Math.abs(cr.left - mr.left) < 2 && cr.top >= mr.bottom - 1 : Math.abs((cr.top + cr.bottom) / 2 - (mr.top + mr.bottom) / 2) < 6
      return { phone, chipH: Math.round(cr.height), chipW: Math.round(cr.width), sameLine, insideCell: cr.right <= ccr.right + 0.5 }
    }, { tag, how })
    if (m.err) throw new Error('pic5b ' + name + ': ' + m.err)
    if (!m.sameLine || !m.insideCell) throw new Error('pic5b ' + name + ' chip off its line or out of its cell: ' + JSON.stringify(m))
    const c = await page.evaluate(() => {
      const mq = window.__mq, g = mq.monday().querySelector('.go')
      mq.scrollUnder(g, 8)
      const r = g.getBoundingClientRect(), x = Math.max(0, r.left - 4), y = Math.max(mq.topH(), r.top - 4)
      return { x, y, width: Math.min(innerWidth - x, r.width + 8), height: Math.min(innerHeight - y, r.height + 8) }
    })
    await page.waitForTimeout(200)
    const file = `5-b1-${name}-${sz}-proposed.png`
    await shot(page, file, c)
    const words = {
      look1: `Look 1 (mark ${tag}): a small grey "142" badge after RU's mission — the standby lines' MAIN badge, its shape, letters and size, in grey because its teal means MAIN. Nothing else on the line changes.`,
      look2: `Look 2 (mark ${tag}): the same grey "142" badge after the mission, and RU's whole formation — both jets and its area line — one shade lighter than 149's own lines, so the block reads as 142's at a glance.`,
      look3: `Look 3 (mark ${tag}): the same grey "142" badge after the mission, and a thin grey line down the left edge of RU's formation — both jets and its area line. (Beside the callsign was tried first: on a phone the badge falls to a line of its own there, as the first drawing did, so it stays on the mission line.)`,
    }
    rec(file, 'B1', sz, 'proposed', words[name] + (sz === 'p' ? ' On a phone the badge sits under the mission, a size smaller: side by side they do not fit the 50px column (your lesson 11, as the Flies chip does).' : '') + ' (No 149 in the app yet: this screen stands in for 149\'s schedule, RU for a 142 formation flown in 149\'s wave.)')
    notes.push(`pic5b ${name} ${sz}: ${JSON.stringify(m)}`)
    await ctx.close()
  }
}

// ---------- 10, 11: B3 — who signs a wave both squadrons fly in (his questions of 17 Nov 26) ----------
// The recommendation: the squadron whose wave it is publishes and signs it. Two orders, each seen from both squadrons:
//   10 — 149 signs first, 142 not yet;  11 — 142 signs first, 149 not yet.
// 149's view: Monday as it stands, RU wearing B1's look 2 (the grey "142" badge, the formation a shade lighter).
// 142's view: only 142's own lines of 149's wave (B2) — VL and VL's in-time line hidden, "+ In-time" hidden (the wave's
// in-times are 149's to set) — and the wave's head tagged "149" (B1's badge) plus 149's own version chip, cloned from
// the day head's real chip with its measured look (that look is set only inside the day head). Each frame is two clips —
// the day head and wave 1 — stacked into one picture with a thin gap.

const PUBLISH = () => { const w = window; const g = w.signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; w.setDayApproved(0, true) }

function stitch(top, bottom, outFile) {
  const a = `${OUT}/${top}`, b = `${OUT}/${bottom}`
  const w = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width', '-of', 'csv=p=0', a]).toString().trim()
  const w2 = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width', '-of', 'csv=p=0', b]).toString().trim()
  const W = Math.max(+w, +w2)
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', a, '-i', b, '-filter_complex',
    `[0]pad=${W}:ih:0:0:color=0x0B0D10[x];[1]pad=${W}:ih+24:0:24:color=0x0B0D10[y];[x][y]vstack`, `${OUT}/${outFile}`])
  unlinkSync(a); unlinkSync(b)
  console.log('  stitched', outFile)
}

async function weekFrame(sz, { pub, view, tag, verPub }) {
  const { ctx, page } = await world(sz)
  if (pub) await page.evaluate(PUBLISH)
  await toEdit(page)
  const m = await page.evaluate(({ view, tag, verPub }) => {
    const mq = window.__mq, mon = mq.monday()
    const head = mon.querySelector('.day-head'), g = mon.querySelector('.go')
    const forms = [...g.querySelectorAll('.form')]
    const ru = forms.find(x => x.querySelector('.csmsn .ntx').textContent.trim() === 'RU')
    const vl = forms.find(x => x.querySelector('.csmsn .ntx').textContent.trim() === 'VL')
    if (!ru || !vl) return { err: 'RU/VL' }
    const badge = (txt, small) => {
      const c = document.createElement('span'); c.className = 'sarole ro'; c.textContent = txt; c.setAttribute('data-mine', '1')
      c.style.background = 'rgba(255,255,255,.08)'; c.style.borderColor = 'rgba(255,255,255,.22)'; c.style.color = 'var(--ink-2)'
      c.style.verticalAlign = 'middle'
      if (small) { c.style.fontSize = '7px'; c.style.padding = '0 4px' }
      return c
    }
    const out = { dayChip: head.querySelector('.dhver').innerText.trim() }
    if (view === '149') {
      // B1 look 2 on RU
      const leaves = [...ru.querySelector('.csmsn').querySelectorAll('*')].filter(e => !e.children.length && e.textContent.trim())
      const msn = leaves.find(e => e.textContent.trim() === 'BFM')
      const phone = innerWidth < 600, c = badge('142', phone)
      if (phone) { c.style.display = 'block'; c.style.width = 'fit-content'; c.style.marginTop = '2px'; msn.after(c) }
      else { c.style.marginLeft = '5px'; c.style.position = 'relative'; c.style.top = '-1px'; msn.appendChild(c) }
      ru.style.background = 'rgba(255,255,255,.055)'
      const dv = head.querySelector('.dhver'); dv.style.position = 'relative'; mq.mark(dv, tag, 'below')
    } else {
      // 142's view of 149's wave: its own line only
      mq.hide(vl)
      // the wave's typed in-time lines are the wave's (149's), kept as they stand: hiding one line left its ✕ behind
      const itb = g.querySelector('[data-itadd]'); if (itb) mq.hide(itb)
      // 149's version chip: a real one measured inside the day head, its look copied onto the clone
      const probe = document.createElement('span'); probe.className = 'dhver'
      probe.innerHTML = verPub
        ? '<span class="verchip orig"><svg class="vtick" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><circle cx="6" cy="6" r="6"></circle><path d="M3.3 6.2l1.8 1.8 3.6-3.8"></path></svg>ORIG</span>'
        : '<span class="verchip draft">DRAFT</span>'
      head.appendChild(probe)
      const src = probe.firstElementChild, cs = getComputedStyle(src)
      const chip = src.cloneNode(true); chip.setAttribute('data-mine', '1')
      for (const p of ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'line-height', 'color', 'background-color', 'box-shadow', 'border-top-width', 'border-top-style', 'border-top-color', 'border-radius', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'display', 'align-items', 'gap', 'column-gap'])
        chip.style.setProperty(p, cs.getPropertyValue(p))
      chip.style.borderWidth = cs.borderTopWidth; chip.style.borderStyle = cs.borderTopStyle; chip.style.borderColor = cs.borderTopColor
      if (verPub) { const t = chip.querySelector('.vtick'); const ts = getComputedStyle(src.querySelector('.vtick')); t.style.display = 'block'; t.style.flex = '0 0 auto'; t.querySelector('circle').style.fill = '#F1F4F7'; const pth = t.querySelector('path'); pth.style.fill = 'none'; pth.style.stroke = '#0B0D10'; pth.style.strokeWidth = '1.7'; pth.style.strokeLinecap = 'round'; pth.style.strokeLinejoin = 'round'; void ts }
      probe.remove()
      const grp = document.createElement('span'); grp.setAttribute('data-mine', '1')
      grp.style.display = 'inline-flex'; grp.style.alignItems = 'center'; grp.style.gap = '5px'; grp.style.marginLeft = '8px'; grp.style.marginRight = '6px'; grp.style.verticalAlign = 'middle'
      grp.appendChild(badge('149')); grp.appendChild(chip)
      const tab = g.querySelector('.go-tab'); tab.querySelector('.asd').after(grp)
      grp.style.position = 'relative'; mq.mark(grp, tag, 'below')
      out.waveTab = tab.innerText.replace(/\s+/g, ' ').trim()
    }
    return out
  }, { view, tag, verPub })
  if (m.err) throw new Error('weekFrame ' + JSON.stringify(m))
  await page.waitForTimeout(250)
  const headClip = await page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday(), h = mon.querySelector('.day-head'); mq.scrollUnder(mon, 4)
    const r = h.getBoundingClientRect(); return { x: Math.max(0, r.left - 4), y: Math.max(mq.topH(), r.top - 4), width: Math.min(innerWidth - Math.max(0, r.left - 4), r.width + 8), height: r.height + 26 }
  })
  const fa = `_t-${tag}-${sz}-a.png`, fb = `_t-${tag}-${sz}-b.png`
  await shot(page, fa, headClip)
  const waveClip = await page.evaluate(() => {
    const mq = window.__mq, g = mq.monday().querySelector('.go'); mq.scrollUnder(g, 8)
    const r = g.getBoundingClientRect(), x = Math.max(0, r.left - 4), y = Math.max(mq.topH(), r.top - 4)
    return { x, y, width: Math.min(innerWidth - x, r.width + 8), height: Math.min(innerHeight - y, r.height + 8) }
  })
  await page.waitForTimeout(150)
  await shot(page, fb, waveClip)
  await ctx.close()
  return { fa, fb, m }
}

async function pic10(sz) {
  const cases = [
    { file: '10-b3-149first-149', pub: true, view: '149', tag: '10a', verPub: true,
      cap: m => `149 signed first, seen on 149's schedule. Monday is published, its day head "${m.dayChip}" (mark 10a, the app's own seal): 149's four signed the whole day, 142's RU in wave 1 included — RU wears B1's look 2, the grey "142" badge and the lighter block. 142 signs nothing here.` },
    { file: '10-b3-149first-142', pub: false, view: '142', tag: '10b', verPub: true,
      cap: m => `149 signed first, seen on 142's schedule at the same moment. 142's own Monday is still "${m.dayChip}" (real). In 149's wave 1 it shows only its own RU; the wave's head reads "149" and 149's seal "ORIG" (mark 10b, drawn in), so 142 sees the line is issued and final. 142's four never sign this wave. VL is 149's and not shown; the wave's in-time lines stay, since they are the wave's; "+ In-time" is 149's to use, so it is not offered.` },
    { file: '11-b3-142first-142', pub: true, view: '142', tag: '11a', verPub: false,
      cap: m => `142 signed first, seen on 142's schedule. 142's Monday is published, "${m.dayChip}" (real) — its four signed 142's own day. 149's wave 1 still reads "149" and "DRAFT" (mark 11a, drawn in): RU is in 149's working copy and may still change. When 149 publishes, the tag turns to 149's "ORIG" by itself and 142's day reads nothing pending — the wave was never in 142's signature.` },
    { file: '11-b3-142first-149', pub: false, view: '149', tag: '11b', verPub: false,
      cap: m => `142 signed first, seen on 149's schedule. 149's Monday is still "${m.dayChip}" (mark 11b, real): RU with its grey "142" badge waits in 149's working copy until 149's four sign and publish it.` },
  ]
  for (const c of cases) {
    const { fa, fb, m } = await weekFrame(sz, c)
    const f = `${c.file}-${sz}-proposed.png`
    stitch(fa, fb, f)
    rec(f, 'B3', sz, 'proposed', c.cap(m) + ' (No 149 in the app yet: 142\'s Monday stands in for each schedule; the day head above, wave 1 below.)')
    notes.push(`pic10 ${c.file} ${sz}: ${JSON.stringify(m)}`)
  }
}

// ---------- 12: B3 follow-up — how a 142 line gets into 149's wave ----------
// Recommended: each squadron adds its own lines. 142's scheduler, on 142's board, opens "+ Wave": under the kinds a new
// group lists 149's waves that day; picking one adds a blank 142 line in it, and that wave then shows on 142's schedule
// (10b's look), its "+ Line" adding 142 lines. The group is the menu's own Templates group, cloned (h5 + a column of .wm
// buttons with their .wm-sub line). Other choice: 149's own "+ Line" asks whose line — a small card at the button
// (lesson 77), the menu's own look.
async function pic12(sz) {
  for (const which of ['join', 'ask']) {
    const { ctx, page } = await world(sz)
    await toEdit(page)
    // a wave's first line reads R, B, T/O, LD; the typed in-time lines above it end in "H" and are skipped
    const waves = await page.evaluate(() => [...window.__mq.monday().querySelectorAll('.go')].map(g => { const t = [...g.innerText.matchAll(/\b(\d\d:\d\d)(?!H)/g)].map(x => x[1]); return { to: t[2], cs: g.querySelector('.form .csmsn .ntx').textContent.trim() } }))
    if (!waves.length || waves.some(w => !w.cs)) throw new Error('pic12 premise: waves ' + JSON.stringify(waves))
    await page.evaluate(() => document.querySelector('#eWeek .day:not(.peek) [data-sbday="0"]').click())
    await page.waitForTimeout(1200)
    let info
    if (which === 'join') {
      await page.evaluate(() => [...document.querySelectorAll('[data-wvadd]')].find(b => b.offsetParent).click())
      await page.waitForTimeout(600)
      info = await page.evaluate((waves) => {
        const mq = window.__mq, menu = [...document.querySelectorAll('.wavemenu')].find(e => mq.vis(e))
        if (!menu) return { err: 'no wave menu' }
        const rows = menu.querySelectorAll('.wm-row'), kinds = rows[0]
        const box = document.createElement('div'); box.setAttribute('data-mine', '1')
        box.innerHTML = `<h5>Join a 149 wave</h5><div class="wm-row" style="flex-direction:column;align-items:stretch">` +
          waves.map((w, i) => `<button class="wm">Wave ${i + 1}<span class="wm-sub">149's ${w.cs} in it</span></button>`).join('') + `</div>`
        kinds.after(box); box.style.position = 'relative'; box.style.paddingTop = '6px'; box.style.paddingLeft = '4px'; mq.mark(box, '12a')
        // the longer menu runs past the screen's foot: lift it so the whole group is in the picture
        const mr = menu.getBoundingClientRect(), over = mr.bottom - innerHeight + 12
        if (over > 0 && getComputedStyle(menu).position !== 'static') menu.style.top = Math.max(mq.topH() + 6, mr.top - over) + 'px'
        window.__mqClipEl = menu
        return { h: [...menu.querySelectorAll('h5')].map(h => h.textContent.trim()) }
      }, waves)
    } else {
      info = await page.evaluate(() => {
        const mq = window.__mq, btn = [...document.querySelectorAll('[data-gline]')].find(b => b.offsetParent)
        if (!btn) return { err: 'no + Line' }
        btn.scrollIntoView({ block: 'center' })
        // the menu's own look: open the real + Wave menu, clone its box, then close the real one
        const r = btn.getBoundingClientRect()
        const card = document.createElement('div'); card.className = 'wavemenu'; card.setAttribute('data-mine', '1')
        card.innerHTML = `<h5>Add a line for</h5><div class="wm-row"><button class="wm on">149</button><button class="wm">142</button></div>`
        card.style.position = 'fixed'; card.style.zIndex = '9999'; card.style.top = (r.bottom + 6) + 'px'
        document.body.appendChild(card)
        const w = card.getBoundingClientRect().width
        card.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.right - w)) + 'px'
        btn.style.outline = '2px solid var(--accent)'; btn.style.outlineOffset = '1px'
        card.style.overflow = 'visible'; card.style.paddingRight = '34px'; mq.mark(card, '12b')
        const wrap = document.createElement('div'); wrap.style.position = 'fixed'; wrap.setAttribute('data-mine', '1')
        const cr = card.getBoundingClientRect(), go = btn.closest('.sb-go').getBoundingClientRect()
        window.__mqClip = { x: Math.max(0, Math.min(go.left, cr.left - 40) - 6), y: Math.max(mq.topH(), go.top - 6), w: 0, b: Math.min(innerHeight, Math.max(cr.bottom, go.top + 220) + 10) }
        window.__mqClip.w = Math.min(innerWidth - window.__mqClip.x, Math.max(go.right, cr.right) + 6 - window.__mqClip.x)
        return { cs: getComputedStyle(card).backgroundColor, wmOn: !!card.querySelector('.wm.on') }
      })
    }
    if (info.err) throw new Error('pic12 ' + which + ': ' + info.err)
    await page.waitForTimeout(300)
    let clip
    if (which === 'join') clip = await clipOf(page, null, 10)
    else clip = await page.evaluate(() => { const c = window.__mqClip; return { x: c.x, y: c.y, width: c.w, height: c.b - c.y } })
    const f = `12-b3-${which}-${sz}-proposed.png`
    await shot(page, f, clip)
    rec(f, 'B3', sz, 'proposed', which === 'join'
      ? `Recommended (mark 12a, drawn in): on 142's Scheduler Board, the real "+ Wave" menu gains a group "Join a 149 wave", listing 149's waves that day, each with the first of 149's lines in it. Picking one adds a blank 142 line inside 149's wave; that wave then shows on 142's schedule as in 10b, and its "+ Line" adds more 142 lines. 149's own "+ Line" stays as it is today. (142's waves stand in for 149's here.)`
      : `Other choice (mark 12b, drawn in): on 149's board the wave's "+ Line" asks whose line, a small card at the button in the menu's own look — "149" picked by default, "142" for a line of theirs. One more tap on every line 149 adds.`)
    notes.push(`pic12 ${which} ${sz}: ${JSON.stringify(info)}`)
    await ctx.close()
  }
}

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ALL = { pic1, pic2, pic3, pic4, pic5, pic5b, pic7, pic8, pic9, pic10, pic12 }
try {
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
try { old = JSON.parse((await import('node:fs')).readFileSync(`${OUT}/manifest.json`, 'utf8')) } catch {}
const merged = { ...old, ...manifest }
const sorted = Object.fromEntries(Object.keys(merged).sort().map(k => [k, merged[k]]))
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(sorted, null, 2) + '\n')
console.log('NOTES\n' + notes.join('\n'))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
