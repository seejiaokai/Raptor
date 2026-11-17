// Multi-squadron & detachment — round 7, Group B: the DET input and where it shows (17 Nov 26, chat 102), drawn on the
// REAL running app by .claude/skills/brainstorming/mockups-on-the-real-app.md, to the brief
// docs/superpowers/briefs/2026-11-17-multi-sqn-r7-drawing.md §Group B (B1–B8). Kit helpers copied whole from draw-q4.mjs
// (round 6/7) and round 3's draw.mjs pic5 (the Detachment choice cloned from the window's own Type field); the bell line
// built verbatim from ui/topbits.tsx's markup (button.bl-line > .bl-dot, .bl-main > .bl-t > b.bl-name + i.bl-day,
// .bl-what; .bl-ago), as docs/mock/2026-11-05-postout-bell/draw.mjs does when the bell is empty.
//
// Every "proposed" frame clones a real neighbour (marked data-mine), re-letters a real node, or hides one (display:none,
// never removed). The DET kind is the app's OD drawn under another name: the inputs are real overseas-duty inputs filed
// through the probe door (window.fileInput), re-lettered "DET". Two mark colours (his D2159): BLUE #0e7fa6 for what he has
// already ruled, PINK #ff2d95 for what is new in round 7 or a question. The DET box on the Leave War wears the app's
// "flight" colour (--flight, 59,198,232 — the schedule's own colour for flying), the one colour of the app's palette no
// Leave War kind already carries.
//
// Demo data only; names re-lettered: 149's six on Exercise North Hawk, Spur, Talc, Vane, Crisp, Moss (demo Reaper, Anvil,
// Cinch, Piston, Sidewinder, Warden), Gale and Jolt (demo Ranger and Saber where they show on 149's pages), Ace the admin.
//
// Run from raptor-port/, against a built preview already serving (Playwright's own Chromium on this Windows PC; set
// CHROMIUM_PATH to use another):
//   MQ_URL=http://localhost:4180/ node docs/mock/2026-11-17-multi-sqn-r7/draw-r7b.mjs
// MQ_ONLY=B1,B5b draws only those.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, readdirSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4180/'
const OUT = 'docs/img/2026-11-17-multi-sqn-r7'
const PAGEIMG = 'docs/mock/2026-11-17-multi-sqn-r7/img'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
mkdirSync(OUT, { recursive: true }); mkdirSync(PAGEIMG, { recursive: true })

const SIZES = {
  d: { name: 'desktop', opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
// the six on the detachment, in the brief's order, by their demo ids; Spur's DET ends 20 Jul (B4)
const SIX = ['dice', 'shaft', 'snap', 'pump', 'mamba', 'nact']
const NAMES = { Reaper: 'Hawk', Anvil: 'Spur', Cinch: 'Talc', Piston: 'Vane', Sidewinder: 'Crisp', Warden: 'Moss', Ranger: 'Gale', Saber: 'Jolt' }
const DETBOX_CSS = `.c.k-det, .tchip.lv.k-det { --h: 59, 198, 232; --ink: #E3F8FD; --fill: .30; }`

const MARK_CSS = `
.mkq { outline: 2px solid #ff2d95 !important; outline-offset: -2px !important; }
.mkq.mkq-o { outline-offset: 2px !important; }
.mkq.mkb { outline-color: #0e7fa6 !important; }
.mkq-tag { position: absolute; z-index: 60; background: #ff2d95; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; }
.mkq-tag.mkb { background: #0e7fa6; }
.toast, .toasts, #toast, #toastEl { display: none !important; }
*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}
${DETBOX_CSS}
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
  // blue: a ruling he has already made (#0e7fa6); pink (default): new in round 7, or a question
  mq.mark = (el, label, where = 'in', blue = false) => {
    if (where === 'right' && el.getAttribute('data-mine') === '1') el.style.width = 'fit-content'
    const b = el.getBoundingClientRect()
    if (getComputedStyle(el).position === 'static' && (el.getAttribute('data-mine') === '1' || /^(TD|TH|SPAN|B|DIV|SECTION|H3|BUTTON)$/.test(el.tagName))) el.style.position = 'relative'
    el.classList.add('mkq'); if (blue) el.classList.add('mkb'); if (where === 'below' || where === 'right' || where === 'left' || where === 'out') el.classList.add('mkq-o')
    if (label) {
      const t = document.createElement('span')
      t.className = 'mkq-tag' + (blue ? ' mkb' : ''); t.textContent = label; t.setAttribute('data-mine', '1')
      if (where === 'below') { t.style.top = 'calc(100% + 4px)'; t.style.right = '0' }
      else if (where === 'right') { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.left = 'calc(100% + 5px)' }
      else if (where === 'left') { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.right = 'calc(100% + 5px)' }
      else if (where === 'bottom') { t.style.bottom = '2px'; t.style.right = '2px' }
      else if (where === 'above') { t.style.bottom = 'calc(100% + 3px)'; t.style.left = '0' }
      else { t.style.top = '1px'; t.style.right = '1px' }
      el.appendChild(t)
    }
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
  mq.topH = () => { const t = [...document.querySelectorAll('.topbar')].find(mq.vis); return t ? t.getBoundingClientRect().bottom : 0 }
  mq.scrollUnder = (el, gap) => { window.scrollTo(window.scrollX, window.scrollY + el.getBoundingClientRect().top - mq.topH() - gap) }
  // re-letter names (whole words) in text, titles and option labels under root
  mq.rename = (root, map) => {
    const re = new RegExp('\\b(' + Object.keys(map).join('|') + ')\\b', 'g')
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n, k = 0
    while ((n = w.nextNode())) if (re.test(n.nodeValue)) { re.lastIndex = 0; n.nodeValue = n.nodeValue.replace(re, m => map[m]); k++ } else re.lastIndex = 0
    for (const e of root.querySelectorAll('[title],[aria-label]')) for (const a of ['title', 'aria-label']) { const v = e.getAttribute(a); if (v && re.test(v)) { re.lastIndex = 0; e.setAttribute(a, v.replace(re, m => map[m])) } re.lastIndex = 0 }
    return k
  }
  // the top bar: the squadron number over TALON, and the signed-in name
  mq.brand = (num, who) => {
    for (const e of document.querySelectorAll('body *')) {
      if (e.children.length || !mq.vis(e)) continue
      const t = e.textContent.trim()
      if (t === '142' && e.getBoundingClientRect().top < 40) e.textContent = num
      if (who && /^SABER · ADMIN$/i.test(t)) e.textContent = e.textContent.replace(/Saber/i, m => m === 'SABER' ? who.toUpperCase() : who)
    }
  }
  mq.field = (win, lab) => [...win.querySelectorAll('.inped-f')].find(f => { const k = f.querySelector('.inped-k'); return k && k.textContent.trim().toLowerCase() === lab.toLowerCase() })
  mq.leaf = (root, txt) => [...root.querySelectorAll('*')].find(e => mq.vis(e) && e.children.length === 0 && e.textContent.trim() === txt)
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
  else await page.waitForTimeout(1500)
  await page.addStyleTag({ content: MARK_CSS })
  return { ctx, page }
}
function rec(file, item, sz, kind, caption) { manifest[file] = { question: item, size: SIZES[sz].name, kind, caption } }
async function neutral(page) {
  await page.evaluate(() => { const a = document.activeElement; if (a && a !== document.body && a.blur) a.blur() })
  await page.mouse.move(Math.round(page.viewportSize().width / 2), 1)
  await page.waitForTimeout(150)
}
async function shot(page, file, clip) {
  const bad = await page.evaluate(() => window.__mq.checkTags())
  if (bad.length) throw new Error(file + ': ' + bad.join('; '))
  await neutral(page)
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}) })
  console.log('  wrote', file)
}
// a clip round window.__mqClipEl, padded, kept inside the screen (under the top bar unless keepTop)
async function clipOf(page, pad = 8, { keepTop = false, extraTop = 0, extraBottom = 0 } = {}) {
  return page.evaluate(({ pad, keepTop, extraTop, extraBottom }) => {
    const r = window.__mqClipEl.getBoundingClientRect()
    const x = Math.max(0, r.left - pad), y = Math.max(keepTop ? 0 : window.__mq.topH(), r.top - pad - extraTop)
    const w = Math.min(innerWidth - x, r.width + pad * 2), h = Math.min(innerHeight - y, r.bottom + pad + extraBottom - y)
    return { x, y, width: w, height: h }
  }, { pad, keepTop, extraTop, extraBottom })
}
async function file(page, recd) { await page.evaluate(r => window.fileInput(r), recd); await page.waitForTimeout(300) }
async function fileSix(page, idp, spurTo20 = true) {
  for (const [i, p] of SIX.entries()) await file(page, { iid: idp + i, person: p, type: 'OD', title: 'Exercise North', date: 'Jul 13', endDate: spurTo20 && p === 'shaft' ? 'Jul 20' : 'Jul 31', yr: 2026, allday: true, remarks: '' })
  await page.waitForTimeout(400)
}
async function toEdit(page) {
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#page-editsched.on #eWeek .day')
  await page.waitForTimeout(900)
}
async function toInputsList(page, allDates) {
  await page.evaluate(() => window.go('inputs'))
  await page.waitForTimeout(1000)
  await page.locator('#page-inputs').getByText('List', { exact: true }).filter({ visible: true }).first().click()
  await page.waitForTimeout(600)
  if (allDates) {
    await page.locator('#inRangeBtn').filter({ visible: true }).first().click(); await page.waitForTimeout(400)
    await page.locator('#inRangeAll').click(); await page.waitForTimeout(700)
  }
}
async function toWar(page, month = 'JUL') {
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await page.waitForTimeout(900)
  if (month) { await page.locator(`[data-testid="month-${month}"]`).filter({ visible: true }).first().click(); await page.waitForTimeout(800) }
}
async function press(page, sz, loc) { const l = page.locator(loc).filter({ visible: true }).first(); if (sz === 'p') await l.tap(); else await l.click() }

// ---------- the DET input window's parts, drawn into the app's own input window (B1, B2) ----------
// win: the window's frame. Detachment: a clone of the window's own Type field (round 3's 5a). Kind: the OD option
// re-lettered DET. From / To: the app's own date box (ui/DateBox.tsx markup, its global stylesheet) under the window's own
// small-capitals labels, where the Dates calendar stood; the Duration field (all day / times) hidden.
const DETWIN = (opts) => {
  const mq = window.__mq, out = {}
  const win = window.__mqWin
  mq.rename(win, { Reaper: 'Hawk' })
  const sel = win.querySelector('#inpEditType'), typeF = sel.closest('.inped-f')
  const od = [...sel.options].find(o => o.selected); od.textContent = 'DET'
  // the Detachment choice under Type
  const f = mq.strip(typeF.cloneNode(true))
  const kh = f.querySelector('.inped-kh'), k = f.querySelector('label.inped-k')
  const lab = mq.strip(k.cloneNode(true)); lab.textContent = 'Detachment'
  if (kh) kh.replaceWith(lab); else k.replaceWith(lab)
  const s2 = f.querySelector('select'); s2.innerHTML = ''; s2.disabled = false
  const o = document.createElement('option'); o.textContent = 'Exercise North · 249 · 13–31 Jul'; s2.appendChild(o); s2.selectedIndex = 0
  typeF.after(f); out.detF = f
  const tIn = win.querySelector('#inpEditOwnTitle'); if (tIn) { tIn.value = 'Exercise North'; tIn.setAttribute('value', 'Exercise North') }
  const dur = mq.field(win, 'Duration'); if (dur) mq.hide(dur)
  const oil = mq.field(win, 'OIL'); if (oil) mq.hide(oil); out.oil = !!oil
  if (opts.dates) {
    const datesF = mq.field(win, 'Dates')
    const row = document.createElement('div'); row.className = 'inped-f'; row.setAttribute('data-mine', '1')
    const pair = document.createElement('div'); pair.style.cssText = 'display:flex;gap:10px'
    for (const [l, v] of [['From', '13 Jul'], ['To', '31 Jul']]) {
      const col = document.createElement('div'); col.style.cssText = 'flex:1 1 0;min-width:0;display:flex;flex-direction:column'
      const kk = document.createElement('span'); kk.className = 'inped-k'; kk.textContent = l
      const b = document.createElement('button'); b.type = 'button'; b.className = 'datebox'
      b.innerHTML = '<span class="datebox-txt"></span><span class="datebox-v" aria-hidden="true">&#9662;</span>'
      b.querySelector('.datebox-txt').textContent = v
      col.appendChild(kk); col.appendChild(b); pair.appendChild(col)
    }
    row.appendChild(pair)
    if (datesF) { datesF.after(row); mq.hide(datesF) } else (dur || typeF).after(row)
    out.datesRow = row
  }
  return out
}

// ---------- B1: the DET input window, new, on the Inputs page ----------
async function picB1(sz) {
  const { ctx, page } = await world(sz)
  await toInputsList(page, false)
  await press(page, sz, '#inNew')
  await page.waitForSelector('#inpEditType', { state: 'visible' }); await page.waitForTimeout(400)
  await page.selectOption('#inpEditPerson', 'dice'); await page.waitForTimeout(200)
  await page.selectOption('#inpEditType', 'OD'); await page.waitForTimeout(500)
  await page.evaluate(() => { const h = document.querySelector('[data-testid="win-inputedit"] .win-ttl'); if (h) h.click() })
  const st = await page.evaluate(({ DETWIN }) => {
    const mq = window.__mq
    const win = [...document.querySelectorAll('[data-testid="win-inputedit"]')].filter(mq.vis).pop()
    window.__mqWin = win
    const o = eval('(' + DETWIN + ')')({ dates: true })
    mq.mark(o.detF, 'D2146', 'out', true)
    mq.mark(o.datesRow, 'New · M6', 'out')
    // the list under the dates, before Save: the window's own list look (.inped-ask, its "Changed while this window was
    // open" list), its row's two chips the app's own answer chips (.upconf-seg, the picked one .on-pick — D830)
    const ask = document.createElement('div'); ask.className = 'inped-ask'; ask.setAttribute('data-mine', '1'); ask.style.margin = '2px 0 0'
    const h = document.createElement('b'); h.className = 'inped-ask-h'; h.textContent = "On 149's schedule in these dates:"
    const row = document.createElement('div'); row.className = 'inped-clash-row'
    const q = document.createElement('span'); q.className = 'inped-ask-q'; q.textContent = 'Sat 18 Jul · SDO desk (published)'
    const b1 = document.createElement('button'); b1.type = 'button'; b1.className = 'upconf-seg on-pick'; b1.setAttribute('aria-pressed', 'true'); b1.textContent = 'Take him off'
    const b2 = document.createElement('button'); b2.type = 'button'; b2.className = 'upconf-seg'; b2.setAttribute('aria-pressed', 'false'); b2.textContent = 'Keep'
    row.append(q, b1, b2); ask.append(h, row)
    o.datesRow.after(ask)
    mq.mark(ask, 'New · M2')
    // the window's Add, re-lettered as the brief writes it
    const add = [...win.querySelectorAll('button')].find(b => b.textContent.trim() === 'Add'); if (add) add.textContent = 'Save'
    // the body scrolled to its end, so the dates, the list and Save are in view together
    const body = win.querySelector('.win-body'); if (body) body.scrollTop = body.scrollHeight
    window.__mqClipEl = win
    return { add: !!add, oil: o.oil, fields: [...win.querySelectorAll('.inped-f')].filter(mq.vis).map(f => (f.querySelector('.inped-k') || {}).textContent).join(' / ') }
  }, { DETWIN: DETWIN.toString() })
  notes.push(`B1 ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const f1 = `R7B1-${sz}-proposed.png`
  await shot(page, f1, await clipOf(page, 6))
  rec(f1, 'B1', sz, 'proposed', `Inputs page → "+ Input", the app's own New input window with the kind OD picked and re-lettered DET (round 3's picture 5 redrawn). Drawn in: "Detachment", a clone of the window's own Type field, picked "Exercise North · 249 · 13–31 Jul" (blue D2146); the person Hawk; "From" 13 Jul and "To" 31 Jul as whole days in the app's own date boxes, where the Dates calendar stood, with no "all day" box and no times (pink New · M6); no OIL question; under the dates, before Save, the window's own list look: "On 149's schedule in these dates:" / "Sat 18 Jul · SDO desk (published)" with the chips "Take him off" (picked) · "Keep" (pink New · M2). The window's "Add" re-lettered "Save".`)
  await ctx.close()
}

// ---------- B2: the same DET opened again after saving, from the schedule (the scheduler's door) ----------
async function picB2(sz) {
  const { ctx, page } = await world(sz)
  await file(page, { iid: 'mq-b2', person: 'dice', type: 'OD', title: 'Exercise North', date: 'Jul 13', endDate: 'Jul 31', yr: 2026, allday: true, remarks: '' })
  await toEdit(page)
  await page.evaluate(() => { const mq = window.__mq, mon = [...document.querySelectorAll('#eWeek > .day')].find(d => mq.vis(d) && !d.classList.contains('peek')); mq.scrollUnder(mon.querySelector('.sec-unav'), 16) })
  await page.locator('#eWeek .day:not(.peek) .sec-unav [data-inpedit="mq-b2"]').filter({ visible: true }).first().click()
  await page.waitForSelector('#inpEditType', { state: 'visible' }); await page.waitForTimeout(500)
  const st = await page.evaluate(({ DETWIN }) => {
    const mq = window.__mq
    const s = [...document.querySelectorAll('#inpEditType')].filter(mq.vis).pop()
    let win = s; while (win && ![...win.querySelectorAll('button')].some(b => b.textContent.trim() === 'Save')) win = win.parentElement
    window.__mqWin = win
    const o = eval('(' + DETWIN + ')')({ dates: false })
    // the kind shown fixed: the kind control greyed (the app's own disabled select)
    const sel = win.querySelector('#inpEditType'); sel.disabled = true
    mq.mark(sel.closest('.inped-f'), 'New · M6', 'out')
    // no Reject: the window has no Accept / Reject today (the Reject sits on the schedule's row), so F4 goes on the button row
    const save = [...win.querySelectorAll('button')].find(b => b.textContent.trim() === 'Save')
    const foot = save.parentElement.querySelector('button') && save.parentElement.contains([...win.querySelectorAll('button')].find(b => b.textContent.trim() === 'Delete')) ? save.parentElement : save.parentElement.parentElement
    mq.mark(foot, 'F4', 'in', true)
    window.__mqClipEl = win.closest('[role="dialog"]') || win
    return { buttons: [...win.querySelectorAll('button')].filter(mq.vis).map(b => b.textContent.trim()).join(' | '), oil: o.oil, ground: /Ground/.test(win.innerText), cx: /\bCX\b/.test(win.innerText) }
  }, { DETWIN: DETWIN.toString() })
  notes.push(`B2 ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const f1 = `R7B2-${sz}-proposed.png`
  await shot(page, f1, await clipOf(page, 6))
  rec(f1, 'B2', sz, 'proposed', `Hawk's DET opened again after saving, from its row on the schedule (the scheduler's door): the app's own input window. Drawn: the kind DET shown fixed, its control greyed (pink New · M6); the Detachment choice as filed; no "all day" box; no OIL question. Measured on the running window: it has no "→ Ground", no CX, no information-only mark and no Accept / Reject today (the Reject sits on the schedule's row), so the blue F4 ring is on the window's button row, which keeps Delete · Cancel · Save.`)
  await ctx.close()
}

// ---------- B3: 149's home schedule, Wed 15 Jul — one Exercise North row under Unavailable, the six on it ----------
async function picB3(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  // Wednesday on the phone: its day scrolled to the screen's left edge
  const picked = await page.evaluate(() => {
    const mq = window.__mq
    const ds = [...document.querySelectorAll('#eWeek > .day')].filter(d => !d.classList.contains('peek'))
    const wed = ds[2]
    // six men free all of Wednesday: the last six of its Available crew list (the "available all day" group)
    const ids = [...new Set([...wed.querySelectorAll('.sec-avail [data-person]')].map(p => p.getAttribute('data-person')))]
    return ids.slice(-6)
  })
  for (const [i, p] of picked.entries()) await file(page, { iid: 'mq-b3-' + i, person: p, type: 'OD', title: 'Exercise North', date: 'Jul 13', endDate: 'Jul 31', yr: 2026, allday: true, remarks: '' })
  await page.waitForTimeout(600)
  const st = await page.evaluate(({ picked }) => {
    const mq = window.__mq
    const ds = [...document.querySelectorAll('#eWeek > .day')].filter(d => !d.classList.contains('peek'))
    const wed = ds[2]
    // the phone shows one day at a time, side by side: bring Wednesday to the left edge
    for (let a = wed.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a)
      if (/(auto|scroll)/.test(cs.overflowX) && a.scrollWidth > a.clientWidth + 4) { a.scrollLeft += wed.getBoundingClientRect().left - a.getBoundingClientRect().left; break }
    }
    const unav = wed.querySelector('.sec-unav')
    const rows = picked.map((p, i) => unav.querySelector(`[data-inprow="mq-b3-${i}"]`)).filter(Boolean)
    if (rows.length !== 6) return { err: 'rows ' + rows.length }
    const first = rows[0], ppl = first.querySelector('.ppl')
    const warns = []
    // the six on the one row: each man's puck (its seat) moved into the first row's people, the other five rows hidden
    for (const r of rows.slice(1)) { const seat = r.querySelector('.ppl .seat'); ppl.appendChild(seat); mq.hide(r) }
    ppl.classList.remove('one')
    for (const pk of ppl.querySelectorAll('.puck')) { if (pk.querySelector('.lchip') || /warn|hard/.test(pk.className)) warns.push(pk.textContent) }
    // the row's kind re-lettered DET; no Reject on a DET (F4)
    first.querySelector('.nm-kind').textContent = 'DET'
    const acc = first.querySelector('.accs'); if (acc) mq.hide(acc)
    const names = ['Hawk', 'Spur', 'Talc', 'Vane', 'Crisp', 'Moss']
    ;[...ppl.querySelectorAll('.puck')].forEach((pk, i) => { const n = pk.querySelector('.nm'); const old = n.textContent; n.textContent = names[i]; pk.title = pk.title.replace(old, names[i]) })
    mq.mark(first, 'D2146', 'bottom', true)
    mq.scrollUnder(unav, 12)
    window.__mqClipEl = unav
    // the six are nowhere in the day's Available crew
    const avail = [...wed.querySelectorAll('.sec-avail [data-person]')].map(p => p.getAttribute('data-person'))
    return { warns, inAvail: picked.filter(p => avail.includes(p)), row: first.innerText.replace(/\s+/g, ' ') }
  }, { picked })
  if (st.err) throw new Error('B3: ' + st.err)
  notes.push(`B3 ${sz}: picked ${picked.join(',')} ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const f1 = `R7B3-${sz}-proposed.png`
  await shot(page, f1, await clipOf(page, 6))
  rec(f1, 'B3', sz, 'proposed', `149's home schedule, Edit Schedule, Wed 15 Jul, its Unavailable list. The six DET inputs are real overseas-duty inputs titled "Exercise North"; the app draws them as six rows. Drawn: one row titled "Exercise North" with "DET" small under it (the kind re-lettered), the six men's own pucks moved onto it, the other five rows hidden, no Reject (F4) — blue D2146. They are absent from the day's Available crew list, the app's own "away" (measured: ${st.inAvail.length ? 'NOT absent: ' + st.inAvail.join(',') : 'none of the six there'}).`)
  await ctx.close()
}

// ---------- B4: the Inputs list, one DET per man, grouped under one heading ----------
async function picB4(sz) {
  const { ctx, page } = await world(sz)
  await fileSix(page, 'mq-b4-')
  await toInputsList(page, true)
  const st = await page.evaluate(({ SIX, sz }) => {
    const mq = window.__mq
    const names = ['Hawk', 'Spur', 'Talc', 'Vane', 'Crisp', 'Moss'], old = ['Reaper', 'Anvil', 'Cinch', 'Piston', 'Sidewinder', 'Warden']
    const head = document.createElement('div'); head.className = 'icard-day'; head.setAttribute('data-mine', '1')
    const hb = document.createElement('b'); hb.textContent = 'Exercise North · 6 people · 13–31 Jul'; head.appendChild(hb)
    let items, spurEnd, anchor
    if (sz === 'd') {
      items = SIX.map((p, i) => document.querySelector(`#inBody tr[data-iid="mq-b4-${i}"]`))
      if (items.some(x => !x)) return { err: 'rows missing' }
      const tr = document.createElement('tr'); tr.setAttribute('data-mine', '1')
      const td = document.createElement('td'); td.colSpan = items[0].children.length; td.style.padding = '0 12px'
      head.style.margin = '14px 2px 6px'; td.appendChild(head); tr.appendChild(td)
      items[0].before(tr); anchor = tr
      let prev = tr; for (const r of items) { prev.after(r); prev = r }
      spurEnd = items[1].querySelector('td[data-label="End"]')
    } else {
      const list = document.querySelector('#inList')
      const cards = [...list.children]
      items = SIX.map((p, i) => list.querySelector(`[data-iid="mq-b4-${i}"]`))
      if (items.some(x => !x)) return { err: 'cards missing ' + items.map(x => !!x) }
      // the day group the six stood in: its own count drops by six
      let day = items[0]; while (day && !day.classList.contains('icard-day')) day = day.previousElementSibling
      const cnt = day.querySelector('i'); const was = cnt.textContent; const n = parseInt(was, 10) - 6; cnt.textContent = n + ' input' + (n === 1 ? '' : 's')
      day.before(head); anchor = head
      let prev = head; for (const c of items) { prev.after(c); prev = c }
      spurEnd = mq.leaf(items[1], 'till 20 Jul')
      head.dataset.was = was
    }
    for (const r of items) {
      mq.rename(r, { Reaper: 'Hawk', Anvil: 'Spur', Cinch: 'Talc', Piston: 'Vane', Sidewinder: 'Crisp', Warden: 'Moss' })
      for (const e of r.querySelectorAll('*')) if (!e.children.length && e.textContent.trim() === 'OD') e.textContent = 'DET'
      // no OIL question on a DET (D2146 (2)): its "OIL?" ask hidden
      for (const e of r.querySelectorAll('button, span')) if (/^OIL\?$/.test(e.textContent.trim())) mq.hide(e)
    }
    if (!spurEnd) return { err: 'no Spur end' }
    mq.mark(spurEnd, 'New · H4', sz === 'd' ? 'in' : 'left')
    mq.scrollUnder(anchor, 40)
    const clip = document.createElement('div')
    const a = anchor.getBoundingClientRect(), z = items[5].getBoundingClientRect()
    window.__mqBox = { top: a.top, bottom: z.bottom }
    return { spur: spurEnd.textContent, was: head.dataset.was || '' }
  }, { SIX, sz })
  if (st.err) throw new Error('B4: ' + st.err)
  notes.push(`B4 ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const clip = await page.evaluate(() => { const b = window.__mqBox; const y = Math.max(window.__mq.topH(), b.top - 46); return { x: 0, y, width: innerWidth, height: Math.min(innerHeight - y, b.bottom - y + 50) } })
  const f1 = `R7B4-${sz}-proposed.png`
  await shot(page, f1, clip)
  rec(f1, 'B4', sz, 'proposed', `Inputs page, ${sz === 'd' ? 'the List (all dates)' : 'the List on a phone'}: six real overseas-duty inputs titled "Exercise North", one per man, re-lettered DET and the men Hawk…Moss. Drawn: a group heading in the list's own day-heading look (.icard-day, shown in its capitals) reading "Exercise North · 6 people · 13–31 Jul", the six rows moved under it in the brief's order; Spur's ends 20 Jul, the others 31 Jul — pink New · H4 on Spur's end. Their "OIL?" asks hidden (no OIL question on a DET, D2146 (2)).${sz === 'p' ? ` The day group they came from, Mon 13 Jul, re-counted (${st.was} → six fewer).` : ''}`)
  await ctx.close()
}

// the Leave War's DET box: the six's OD boxes re-classed k-det and re-lettered DET (the OD box's own look, its own colour)
const DETCELLS = (SIX) => {
  let n = 0
  for (const p of SIX) for (const c of document.querySelectorAll(`[data-testid^="cell-${p}-2026-07"] .c.k-od`)) { c.classList.replace('k-od', 'k-det'); if (c.textContent.trim() === 'OD') c.textContent = 'DET'; n++ }
  return n
}

// D2146: on the Leave War a man on DET still counts as his squadron's manpower. The true figures are measured in a
// throwaway world with no input for the six (the honest count of them present), then re-lettered onto the drawn world:
// every July count-row figure (number and colour class), the day heads, and the 15 Jul day window's figures.
async function presentFigures(sz, open15) {
  const { ctx, page } = await world(sz)
  await toWar(page)
  const snap = await page.evaluate(() => {
    const m = {}
    for (const e of document.querySelectorAll('[data-testid]')) { const t = e.getAttribute('data-testid'); if (/^(count|avail|req|head)-.*2026-07/.test(t)) m[t] = { cls: e.className, html: e.innerHTML } }
    return m
  })
  let day = null
  if (open15) {
    await page.evaluate(() => document.querySelector('[data-testid="head-2026-07-15"]').scrollIntoView({ block: 'center', inline: 'center' }))
    await press(page, sz, '[data-testid="head-2026-07-15"]')
    await page.waitForSelector('[data-testid="lwday-away-h"]', { state: 'visible' }); await page.waitForTimeout(500)
    day = await page.evaluate(() => {
      const h = [...document.querySelectorAll('[data-testid="lwday-away-h"]')].filter(window.__mq.vis).pop()
      const win = h.closest('.floatwin, [role="dialog"]')
      return { rows: [...win.querySelectorAll('.dl-row')].map(r => ({ cls: r.className, html: r.innerHTML })), away: h.textContent }
    })
  }
  await ctx.close()
  return { snap, day }
}
const APPLYFIG = (snap) => {
  let n = 0, changed = 0
  for (const [t, v] of Object.entries(snap)) for (const e of document.querySelectorAll(`[data-testid="${t}"]`)) { n++; if (e.className !== v.cls || e.innerHTML !== v.html) { changed++; e.className = v.cls; e.innerHTML = v.html } }
  return { n, changed }
}

// ---------- B5a: the Leave War, 149, July — the six's boxes on 15 Jul wear DET ----------
async function picB5a(sz) {
  const pres = await presentFigures(sz, false)
  const { ctx, page } = await world(sz)
  await fileSix(page, 'mq-b5-')
  await toWar(page)
  const st = await page.evaluate(({ SIX, DETCELLS, NAMES, snap, APPLYFIG }) => {
    const mq = window.__mq
    const fig = eval('(' + APPLYFIG + ')')(snap)
    const n = eval('(' + DETCELLS + ')')(SIX)
    mq.rename(document.querySelector('#page-leavewar') || document.body, NAMES)
    mq.brand('149', 'Ace')
    const tds = SIX.map(p => document.querySelector(`[data-testid="cell-${p}-2026-07-15"]`))
    tds[0].scrollIntoView({ block: 'center', inline: 'center' })
    tds.forEach((td, i) => mq.mark(td, i === 0 ? 'D2146' : '', 'above', true))
    const c15 = [...document.querySelectorAll('[data-testid$="-2026-07-15"]')].filter(e => /^(count|avail)-/.test(e.getAttribute('data-testid'))).map(e => e.getAttribute('data-testid').replace(/-2026.*/, '') + '=' + e.textContent.trim()).join(' ')
    return { n, fig, c15, labels: tds.map(t => t.textContent.trim()) }
  }, { SIX, DETCELLS: DETCELLS.toString(), NAMES, snap: pres.snap, APPLYFIG: APPLYFIG.toString() })
  notes.push(`B5a ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(300)
  // tag sits above the first box: make sure it is not clipped by the grid's own frame; else put it inside
  const bad = await page.evaluate(() => window.__mq.checkTags())
  if (bad.length) await page.evaluate(() => { const t = document.querySelector('.mkq-tag.mkb'); t.style.bottom = ''; t.style.left = ''; t.style.top = '1px'; t.style.right = '1px' })
  const f1 = `R7B5a-${sz}-proposed.png`
  const clip = null
  await shot(page, f1, clip)
  rec(f1, 'B5', sz, 'proposed', `The Leave War, 149, July (the top bar's squadron re-lettered 149). Six real overseas-duty inputs, 13–31 Jul (Spur's to 20 Jul). Drawn: each of the six's boxes wears a DET mark of its own — the OD box's own look, lettered DET, in the app's "flight" colour (59,198,232; no Leave War kind uses it) — blue D2146 on the six 15 Jul cells. The manning rows count the six as PRESENT (D2146: a man on DET still counts as manpower): every July figure and its colour re-lettered from the same page measured with no input for the six (${st.fig.changed} cells changed).`)
  await ctx.close()
}

// ---------- B5b: the legend gains the DET line ----------
async function picB5b(sz) {
  const { ctx, page } = await world(sz)
  await toWar(page)
  await press(page, sz, '[data-testid="legend-open"]'); await page.waitForTimeout(700)
  const st = await page.evaluate(() => {
    const mq = window.__mq
    const t = [...document.querySelectorAll('.leglist .leg-t')].find(e => mq.vis(e) && e.textContent.trim() === 'Overseas duty')
    const row = t.closest('.leg-row')
    const n = mq.strip(row.cloneNode(true))
    const c = n.querySelector('.c'); c.classList.replace('k-od', 'k-det'); c.textContent = 'DET'
    n.querySelector('.leg-t').textContent = 'On a detachment; still counts as manpower'
    row.after(n)
    mq.mark(n, 'New · M16'); { const tg = n.querySelector('.mkq-tag'); tg.style.top = '-8px'; tg.style.right = '16px' }
    const box = row.closest('.leglist') || row.parentElement
    // the legend scrolls inside itself: bring the new line into its view
    n.scrollIntoView({ block: 'center' })
    window.__mqClipEl = box
    return { ok: true }
  })
  notes.push(`B5b ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const f1 = `R7B5b-${sz}-proposed.png`
  await shot(page, f1, await clipOf(page, 6))
  rec(f1, 'B5', sz, 'proposed', `The Leave War's Legend, opened. Drawn: a line cloned from its own "Overseas duty" line, its box DET in the DET colour, its words "On a detachment; still counts as manpower" (the box already says DET) — pink New · M16.`)
  await ctx.close()
}

// ---------- B5c: the day panel for 15 Jul gains "On DET · 6" ----------
async function picB5c(sz) {
  const pres = await presentFigures(sz, true)
  const { ctx, page } = await world(sz)
  await fileSix(page, 'mq-b5c-')
  await toWar(page)
  await page.evaluate(() => document.querySelector('[data-testid="head-2026-07-15"]').scrollIntoView({ block: 'center', inline: 'center' }))
  await press(page, sz, '[data-testid="head-2026-07-15"]')
  await page.waitForSelector('[data-testid="lwday-away-h"]', { state: 'visible' }); await page.waitForTimeout(500)
  const st = await page.evaluate(({ SIX, NAMES, day, snap, APPLYFIG }) => {
    const mq = window.__mq
    eval('(' + APPLYFIG + ')')(snap)
    const h = [...document.querySelectorAll('[data-testid="lwday-away-h"]')].filter(mq.vis).pop()
    // the window's figures as measured with the six present (D2146)
    const winF = h.closest('.floatwin, [role="dialog"]')
    const rows = [...winF.querySelectorAll('.dl-row')]
    if (rows.length !== day.rows.length) return { err: 'figure rows ' + rows.length + ' vs ' + day.rows.length }
    let figChanged = 0
    rows.forEach((r, i) => { if (r.innerHTML !== day.rows[i].html || r.className !== day.rows[i].cls) { figChanged++; r.className = day.rows[i].cls; r.innerHTML = day.rows[i].html } })
    const away = h.closest('section')
    const sec = away.cloneNode(false); sec.setAttribute('data-mine', '1')
    const h2 = mq.strip(h.cloneNode(true)); h2.textContent = 'On DET · 6'
    sec.appendChild(h2)
    let moved = 0
    for (const p of SIX) { const l = away.querySelector(`[data-testid="lwday-away-${p}"]`); if (l) { sec.appendChild(l); moved++; const b = l.querySelector('.ll-box'); if (b) { b.classList.replace('k-od', 'k-det'); b.textContent = 'DET' } } }
    const left = away.querySelectorAll('.ll-row').length
    const was = h.textContent; h.textContent = h.textContent.replace(/\d+$/, String(left))
    away.after(sec)
    mq.rename(sec, NAMES); mq.rename(away, NAMES)
    mq.mark(h2, 'New · M3', 'right')
    const win = h.closest('.floatwin, [role="dialog"]')
    const body = win.querySelector('.win-body'); if (body) body.scrollTop = 0
    window.__mqClipEl = win
    if (h.textContent !== day.away) return { err: 'away ' + h.textContent + ' vs present ' + day.away }
    return { moved, was, now: h.textContent, figChanged, figs: rows.map(r => r.textContent.replace(/\s+/g, ' ').trim()).join(' | ') }
  }, { SIX, NAMES, day: pres.day, snap: pres.snap, APPLYFIG: APPLYFIG.toString() })
  if (st.err) throw new Error('B5c: ' + st.err)
  notes.push(`B5c ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const f1 = `R7B5c-${sz}-proposed.png`
  await shot(page, f1, await clipOf(page, 6))
  rec(f1, 'B5', sz, 'proposed', `The Leave War's day window for Wed 15 Jul, the app's own. Drawn: a line "On DET · 6" in the window's own heading look (shown in its capitals), the six's own lines moved under it from "Away", their boxes DET — pink New · M3; "Away" re-counted (${st.was} → ${st.now}), not counting them. The figures at the top count the six as PRESENT (D2146), re-lettered from the same window measured with no input for the six.`)
  await ctx.close()
}

// ---------- B5d: the member's button row reads CSE · OD · DET (a question, Q14, drawn as recommended) ----------
async function picB5d(sz) {
  const { ctx, page } = await world(sz, 'us', 'us')
  await toWar(page)
  await page.evaluate(() => document.querySelector('[data-testid="cell-bane-2026-07-22"]').scrollIntoView({ block: 'center', inline: 'center' }))
  await press(page, sz, '[data-testid="cell-bane-2026-07-22"]')
  await page.waitForSelector('[data-testid="closed-extra-row"]', { state: 'visible' }); await page.waitForTimeout(400)
  const st = await page.evaluate(({ NAMES }) => {
    const mq = window.__mq
    const row = [...document.querySelectorAll('[data-testid="closed-extra-row"]')].filter(mq.vis).pop()
    const od = row.querySelector('[data-testid="closed-file-OD"]')
    const det = mq.strip(od.cloneNode(true)); det.classList.replace('k-od', 'k-det'); det.querySelector('.lv-code').textContent = 'DET'; det.title = 'Detachment'
    od.after(det)
    const sheet = row.closest('.bidsheet')
    mq.rename(sheet, NAMES)
    mq.mark(row, 'Q14', 'out')
    window.__mqClipEl = sheet
    return { row: row.innerText.replace(/\s+/g, ' ') }
  }, { NAMES })
  notes.push(`B5d ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const f1 = `R7B5d-${sz}-proposed.png`
  await shot(page, f1, await clipOf(page, 14))
  rec(f1, 'B5', sz, 'proposed', `A member's own sheet on the Leave War (signed in as a member, re-lettered Gale; bidding closed in July, so the sheet is the app's "Bidding is closed" one with its row of buttons). Drawn as recommended: the row reads CSE · OD · DET, the DET button a clone of OD's in the DET colour — pink Q14 (a question).`)
  await ctx.close()
}

// ---------- B6: leave for a man on DET — the bid window's day line ----------
async function picB6(sz) {
  const { ctx, page } = await world(sz)
  await toWar(page)
  await page.evaluate(() => document.querySelector('[data-testid="cell-dice-2026-07-22"]').scrollIntoView({ block: 'center', inline: 'center' }))
  await press(page, sz, '[data-testid="cell-dice-2026-07-22"]')
  await page.waitForSelector('[data-testid="bid-dayline"]', { state: 'visible' }); await page.waitForTimeout(500)
  const st = await page.evaluate(({ NAMES }) => {
    const mq = window.__mq
    const dl = [...document.querySelectorAll('[data-testid="bid-dayline"]')].filter(mq.vis).pop()
    const sheet = dl.closest('.bidsheet')
    mq.rename(sheet, NAMES)
    const model = dl.querySelector('.dl-row')
    const line = mq.strip(model.cloneNode(true)); line.textContent = 'On DET · 249: 6 there, 5 with this.'
    { const par = model.parentElement; if (/flex/.test(getComputedStyle(par).display)) { par.style.flexWrap = 'wrap'; const br = document.createElement('span'); br.setAttribute('data-mine', '1'); br.style.cssText = 'flex-basis:100%;height:0'; model.after(br); br.after(line) } else { line.style.display = 'block'; model.after(line) } }
    mq.mark(line, 'New · M4', 'right')
    window.__mqClipEl = sheet
    return { before: model.textContent, head: sheet.querySelector('.bidsheet-hd').innerText.replace(/\s+/g, ' ') }
  }, { NAMES })
  notes.push(`B6 ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const f1 = `R7B6-${sz}-proposed.png`
  await shot(page, f1, await clipOf(page, 14))
  rec(f1, 'B6', sz, 'proposed', `The Leave War's bid window for Hawk, Wed 22 Jul (opened by an admin on his cell; the app's own window). Drawn: under its day line ("${st.before}"), a line in the same look, "On DET · 249: 6 there, 5 with this." — pink New · M4. The approver's line is not in this picture (it is on the Approvals tab, another screen).`)
  await ctx.close()
}

// ---------- B7: the bell, 249's and 149's schedulers ----------
async function picB7(sz, which) {
  const { ctx, page } = await world(sz)
  await page.evaluate(n => window.__mq.brand(n, 'Ace'), which === 'a' ? '249' : '149')
  await press(page, sz, '.bellbtn')
  await page.waitForSelector('[data-testid="bell-list"]', { state: 'visible' }); await page.waitForTimeout(400)
  const st = await page.evaluate(({ which }) => {
    const mq = window.__mq
    const list = document.querySelector('[data-testid="bell-list"]'), sc = list.querySelector('.bl-scroll')
    const empty = sc.querySelector('.bl-empty'); if (empty) mq.hide(empty)
    const what = which === 'a' ? 'DET Exercise North · 13–31 Jul · joining 249' : 'DET Exercise North · ends 20 Jul (was 31 Jul) · back home 21 Jul'
    const n = document.createElement('button'); n.type = 'button'; n.setAttribute('role', 'menuitem'); n.className = 'bl-line unread'; n.setAttribute('data-mine', '1')
    n.innerHTML = '<span class="bl-dot" aria-hidden="true"></span><span class="bl-main"><span class="bl-t"><b class="bl-name"></b><i class="bl-day"></i></span><span class="bl-what"></span></span><span class="bl-ago"></span>'
    n.querySelector('.bl-name').textContent = 'Spur'
    n.querySelector('.bl-what').textContent = what
    n.querySelector('.bl-ago').textContent = 'now'
    sc.prepend(n)
    // an unread line lights the bell and brings "Mark all read" under the list (topbits.tsx's own foot)
    const foot = document.createElement('div'); foot.className = 'bl-foot'; foot.setAttribute('data-mine', '1')
    const mb = document.createElement('button'); mb.type = 'button'; mb.className = 'abtn sm ghost'; mb.textContent = 'Mark all read'; foot.appendChild(mb)
    list.appendChild(foot)
    const bell = [...document.querySelectorAll('.bellbtn')].find(mq.vis); if (bell) bell.classList.add('on')
    mq.mark(n, 'New · M8', 'bottom')
    window.__mqClipEl = list
    return { line: n.innerText.replace(/\s+/g, ' ') }
  }, { which })
  notes.push(`B7${which} ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const clip = await page.evaluate(() => { const r = window.__mqClipEl.getBoundingClientRect(); const x = Math.max(0, r.left - 60), w = Math.min(innerWidth - x, r.width + 120); return { x, y: 0, width: w, height: Math.min(innerHeight, r.bottom + 12) } })
  const f1 = `R7B7${which}-${sz}-proposed.png`
  await shot(page, f1, clip)
  rec(f1, 'B7', sz, 'proposed', which === 'a'
    ? `The bell of 249's schedulers (the top bar's number re-lettered 249), opened. Drawn: one unread line in the bell's own markup — "Spur" in its name place, under it "DET Exercise North · 13–31 Jul · joining 249" — pink New · M8. The bell's own look breaks the line after the name, where the brief has its first " · ". The bell lit, "Mark all read" under it, as for any unread line.`
    : `The bell of 149's schedulers, opened. Drawn: one unread line in the bell's own markup — "Spur", under it "DET Exercise North · ends 20 Jul (was 31 Jul) · back home 21 Jul" — pink New · M8. The bell's own look breaks the line after the name, where the brief has its first " · ".`)
  await ctx.close()
}

// ---------- B8: today, marked, for the questions ----------
async function picB8a(sz) {
  const { ctx, page } = await world(sz)
  await page.evaluate(() => document.querySelector('#insightBtn').click())
  await page.waitForTimeout(900)
  const st = await page.evaluate(() => {
    const mq = window.__mq
    const h = [...document.querySelectorAll('.isec-h')].find(e => mq.vis(e) && /^Not on the flying programme/i.test(e.textContent.trim()))
    if (!h) return { err: 'no heading' }
    const chips = h.nextElementSibling
    h.scrollIntoView({ block: 'center' })
    mq.mark(h, '', 'out'); mq.mark(chips, 'Q16', 'below')
    let win = h; while (win && !/modal|floatwin|insights/i.test(win.className + '') ) win = win.parentElement
    window.__mqClipEl = win || h.parentElement
    window.__mqH = h; window.__mqC = chips
    return { h: h.textContent.trim(), n: chips.children.length }
  })
  if (st.err) throw new Error('B8a: ' + st.err)
  notes.push(`B8a ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const clip = await page.evaluate(() => { const w = window.__mqClipEl.getBoundingClientRect(), a = window.__mqH.getBoundingClientRect(), b = window.__mqC.getBoundingClientRect(); const y = Math.max(w.top, a.top - 140), y2 = Math.min(w.bottom, b.bottom + 140); return { x: Math.max(0, w.left - 4), y: Math.max(0, y), width: Math.min(innerWidth - Math.max(0, w.left - 4), w.width + 8), height: y2 - Math.max(0, y) } })
  const f1 = `R7B8a-${sz}-today.png`
  await shot(page, f1, clip)
  rec(f1, 'Q16', sz, 'today', `Today, real: the week's Insights window, its "not flying" list — "${st.h}", ${st.n} names — ringed pink Q16.`)
  await ctx.close()
}
async function picB8b(sz) {
  const { ctx, page } = await world(sz)
  await toWar(page, null)
  // on a phone the count rows start folded: "Manning" opens them
  if (sz === 'p') { await press(page, sz, '[data-testid="counts-toggle"]'); await page.waitForTimeout(700) }
  await page.evaluate(() => [...document.querySelectorAll('[data-testid="manning-info-ip"]')].find(window.__mq.vis).scrollIntoView({ block: 'center' }))
  await press(page, sz, '[data-testid="manning-info-ip"]'); await page.waitForTimeout(600)
  await page.locator('.bidsheet').getByText('Edit counter…').filter({ visible: true }).first().click(); await page.waitForTimeout(800)
  const st = await page.evaluate(() => {
    const mq = window.__mq
    const sheet = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(mq.vis).pop()
    const rows = [...sheet.querySelectorAll('.bidsheet-row')].filter(r => { const l = r.querySelector('.lab'); return l && ['CREW', 'CAT', 'HOLDING', 'WITHOUT'].includes(l.textContent.trim().toUpperCase()) })
    rows.forEach((r, i) => mq.mark(r, i === 0 ? 'Q15' : '', 'out'))
    window.__mqClipEl = sheet
    return { rows: rows.map(r => r.querySelector('.lab').textContent.trim()) }
  })
  notes.push(`B8b ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const f1 = `R7B8b-${sz}-today.png`
  await shot(page, f1, await clipOf(page, 10))
  rec(f1, 'Q15', sz, 'today', `Today, real: a count row's settings — the Leave War's IP row, "What does IP count?" → "Edit counter…" (the count rows live on the Leave War, not on Edit Schedule). Its row filter — ${st.rows.join(', ')} (seats, CATs, quals) — ringed pink Q15.`)
  await ctx.close()
}
async function picB8c(sz) {
  const { ctx, page } = await world(sz)
  await toWar(page, null)
  await press(page, sz, '[data-testid="lw-tab-balances"]'); await page.waitForTimeout(700)
  await page.locator('#page-leavewar').getByText('Days taken', { exact: true }).filter({ visible: true }).first().click(); await page.waitForTimeout(700)
  const st = await page.evaluate(() => {
    const mq = window.__mq
    let k = 0, idx, first
    const th = [...document.querySelectorAll('th')].find(t => mq.vis(t) && t.textContent.trim() === 'OD')
    if (th) {
      // the desktop: a table
      const hr = th.parentElement, ncol = hr.children.length; idx = [...hr.children].indexOf(th)
      th.scrollIntoView({ block: 'nearest', inline: 'center' })
      for (const tr of th.closest('table').querySelectorAll('tbody tr')) if (tr.children.length === ncol) { const td = tr.children[idx]; if (mq.vis(td)) { mq.mark(td, '', 'in'); k++; first = first || td } }
      mq.mark(th, '', 'in')
    } else {
      // the phone: rows of columns (.bp-cols) in a sideways-scrolling card; scrolled to its right end, where OD sits
      const zoom = [...document.querySelectorAll('.bp-zoom.taken')].find(mq.vis)
      const hs = zoom.closest('.bp-hs'); zoom.style.paddingRight = '14px'; hs.scrollLeft = hs.scrollWidth
      const cols = [...zoom.querySelectorAll('.bp-cols')]
      const head = cols.find(c => [...c.children].some(s => s.textContent.trim() === 'OD'))
      idx = [...head.children].findIndex(s => s.textContent.trim() === 'OD')
      const odh = head.children[idx]; odh.style.boxSizing = 'border-box'; odh.style.paddingRight = '8px'; mq.mark(odh, '', 'in')
      for (const s of zoom.querySelectorAll('[data-testid^="bal-taken-OD-"]')) if (mq.vis(s) && s.getBoundingClientRect().bottom < innerHeight) { s.style.boxSizing = 'border-box'; s.style.paddingRight = '8px'; mq.mark(s, '', 'in'); k++; first = first || s }
    }
    // the tag on the column's first cell, so the header's own letters stay readable
    const t = document.createElement('span'); t.className = 'mkq-tag'; t.setAttribute('data-mine', '1'); t.textContent = 'Q19'; t.style.top = '2px'; t.style.left = '2px'
    if (getComputedStyle(first).position === 'static') first.style.position = 'relative'
    first.appendChild(t)
    return { k, idx }
  })
  notes.push(`B8c ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const f1 = `R7B8c-${sz}-today.png`
  const clip = await page.evaluate(() => { const y = window.__mq.topH(); return { x: 0, y: Math.max(0, y), width: innerWidth, height: innerHeight - Math.max(0, y) } })
  await shot(page, f1, clip)
  rec(f1, 'Q19', sz, 'today', `Today, real: the Leave War → Balances → Days taken table; its OD column (header and cells) ringed pink Q19.`)
  await ctx.close()
}

const PICS = {
  B1: picB1, B2: picB2, B3: picB3, B4: picB4, B5a: picB5a, B5b: picB5b, B5c: picB5c, B5d: picB5d, B6: picB6,
  B7a: sz => picB7(sz, 'a'), B7b: sz => picB7(sz, 'b'), B8a: picB8a, B8b: picB8b, B8c: picB8c,
}
browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
try {
  for (const [k, fn] of Object.entries(PICS)) {
    if (ONLY && !ONLY.includes(k)) continue
    for (const sz of ['d', 'p']) { try { await fn(sz) } catch (e) { errs.push(`[${sz}] ${k} FAILED: ${e.message.split('\n')[0]}`) } }
  }
} finally { await browser.close() }
let old = {}
try { old = JSON.parse(readFileSync(`${OUT}/manifest.json`, 'utf8')) } catch {}
writeFileSync(`${OUT}/manifest.json`, JSON.stringify({ ...old, ...manifest }, null, 2) + '\n')
for (const f of readdirSync(OUT)) if (/^R7B.*\.png$/.test(f)) copyFileSync(`${OUT}/${f}`, `${PAGEIMG}/${f}`)
console.log('NOTES\n' + notes.join('\n'))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
