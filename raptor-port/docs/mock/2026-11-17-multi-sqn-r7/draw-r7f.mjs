// Multi-squadron & detachment — Round 7, Group F (chat 104): the last three pictures, drawn on the REAL running app by
// .claude/skills/brainstorming/mockups-on-the-real-app.md, to the drawing brief
// docs/superpowers/briefs/2026-11-17-multi-sqn-r7-drawing-chat104.md (and chat 102's brief it points to, its "Read first"
// and "Rules for every picture"). The brief's words are the spec, drawn letter for letter. Everything on these three
// pictures is already ruled, so every mark is BLUE #0e7fa6, its ring drawn ON the element by mq.mark (outline + child
// tag) and its tag hidden (chat 103's change: the blue tags display:none on round 7's page).
// Helpers copied whole: the kit, world, shot, clipOf, toAdmin and the Admin → Squadrons builder from draw-r7d.mjs (the
// builder gains its two squadron sub-lines as options, for F3); mq.badge, the grey other-squadron badge, from
// draw-r7e.mjs (round 4's and round 5's recipe, as round 7's C1–C6 draw it); DETWIN, toInputsList, press and the kit's
// mq.field / mq.rename from draw-r7b.mjs (picB1, the DET input window); the open list from round 3's draw.mjs pic1 (the
// app's own menu of choices, the plans selector's .wavemenu, taken whole and re-lettered). Every proposed frame adds
// nodes marked data-mine, hides an app node (display:none, never removed) or changes a real node's words.
// Demo data only; names re-lettered where the brief names someone the demo does not have.
//
// Run from raptor-port/, against a built preview already serving:
//   MQ_URL=http://localhost:4181/ node docs/mock/2026-11-17-multi-sqn-r7/draw-r7f.mjs
// MQ_ONLY=f1,f3 draws only those; MQ_SZ=d or p one size; MQ_PROBE=1 prints what the screens hold and draws nothing.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, readdirSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4181/'
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
    t.className = 'mkq-tag' + (colour === 'blue' ? ' mkb' : ''); t.textContent = 'New'; if (colour === 'blue') t.style.display = 'none'; t.setAttribute('data-mine', '1')
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
  mq.scrollUnder = (el, gap) => { window.scrollTo(window.scrollX, window.scrollY + el.getBoundingClientRect().top - mq.topH() - gap) }
  mq.days = () => [...document.querySelectorAll('#eWeek > .day')].filter(d => mq.vis(d) && !d.classList.contains('peek'))
  mq.monday = () => mq.days()[0]
  // the top bar's own squadron number re-lettered: round 4's way (as149, with the number as an argument)
  mq.asSqn = (num) => { const k = document.querySelector('.topbar .mark .k'); if (k && mq.vis(k)) { const k2 = mq.strip(k.cloneNode(true)); k2.textContent = num; mq.hide(k); k.after(k2) } }
  // text nodes inside root: every whole word a → b
  mq.reletter = (root, a, b) => {
    let n = 0; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let tn
    while ((tn = w.nextNode())) { const re = new RegExp('\\b' + a + '\\b', 'g'); if (re.test(tn.nodeValue)) { tn.nodeValue = tn.nodeValue.replace(re, b); n++ } }
    return n
  }
  // draw-r7b.mjs's kit: re-letter names (whole words) in text, titles and option labels under root
  mq.rename = (root, map) => {
    const re = new RegExp('\\b(' + Object.keys(map).join('|') + ')\\b', 'g')
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n, k = 0
    while ((n = w.nextNode())) if (re.test(n.nodeValue)) { re.lastIndex = 0; n.nodeValue = n.nodeValue.replace(re, m => map[m]); k++ } else re.lastIndex = 0
    for (const e of root.querySelectorAll('[title],[aria-label]')) for (const a of ['title', 'aria-label']) { const v = e.getAttribute(a); if (v && re.test(v)) { re.lastIndex = 0; e.setAttribute(a, v.replace(re, m => map[m])) } re.lastIndex = 0 }
    return k
  }
  mq.field = (win, lab) => [...win.querySelectorAll('.inped-f')].find(f => { const k = f.querySelector('.inped-k'); return k && k.textContent.trim().toLowerCase() === lab.toLowerCase() })
  // draw-r7e.mjs: the grey badge of round 2's look 2 (D2104), round 4's and round 5's recipe: the standby lines' MAIN
  // badge in neutral grey
  mq.badge = (txt, small) => {
    const c = document.createElement('span'); c.className = 'sarole ro'; c.textContent = txt; c.setAttribute('data-mine', '1')
    c.style.background = 'rgba(255,255,255,.08)'; c.style.borderColor = 'rgba(255,255,255,.22)'; c.style.color = 'var(--ink-2)'
    c.style.verticalAlign = 'middle'; c.style.alignSelf = 'center'
    if (small) { c.style.fontSize = '7px'; c.style.padding = '0 4px' }
    return c
  }
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
async function press(page, sz, loc) { const l = page.locator(loc).filter({ visible: true }).first(); if (sz === 'p') await l.tap(); else await l.click() }
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

// ---------- probe ----------
async function probe(sz) {
  const { ctx, page } = await world(sz)
  const a = await page.evaluate(() => {
    const P = window.PEOPLE || {}
    return { top: document.querySelector('.topbar') ? document.querySelector('.topbar').innerText.replace(/\s+/g, ' ') : '',
      people: Object.entries(P).filter(([, p]) => !p.archived).map(([id, p]) => `${id}:${p.name || p.cs || ''}`).join(' ') }
  })
  console.log('PROBE', JSON.stringify(a))
  await toEdit(page)
  const b = await page.evaluate(() => {
    const mq = window.__mq
    return mq.days().map(d => {
      const av = d.querySelector('.sec-avail')
      return { head: (d.querySelector('.day-head, .dhead, h3') || d).innerText.replace(/\s+/g, ' ').slice(0, 60),
        secs: [...d.children].map(c => c.className).join(' | ').slice(0, 300),
        avail: av ? [...av.children].map(c => c.className + (c.classList.contains('ap-grp') ? '[' + c.textContent.trim() + ']' : c.classList.contains('ap-grid') ? '{' + [...c.querySelectorAll('.nm')].map(n => n.textContent).join(',') + '}' : '')).join(' / ') : null }
    })
  })
  for (const x of b) console.log('DAY', JSON.stringify(x))
  const seat = await page.evaluate(() => { const d = window.__mq.days()[2]; const s = d && d.querySelector('.sec-avail .seat'); return s ? s.outerHTML.slice(0, 1500) : null })
  console.log('SEAT', seat)
  // the plans selector's menu
  await page.locator('#page-editsched .day .planselbtn').first().click()
  await page.waitForSelector('.wavemenu'); await page.waitForTimeout(300)
  console.log('MENU', await page.evaluate(() => document.querySelector('.wavemenu').outerHTML.slice(0, 2500)))
  await page.keyboard.press('Escape')
  await ctx.close()
}

// ---------- the DET input window's parts (draw-r7b.mjs's DETWIN, copied whole) ----------
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

// ---------- F1 · a 142 man files his DET onto 149's detachment: the Detachment list open ----------
// Real: 142's Inputs page → "+ Input", the app's own New input window, person Saber (the demo's own Saber, 142's man),
// the kind OD picked and re-lettered DET, as draw-r7b.mjs's picB1 draws it. Drawn: the Detachment choice open as a list
// — the app's own menu of choices (the plans selector's .wavemenu, round 3's pic1 recipe), its two rows re-lettered,
// the picked one in the menu's own picked look; after the first, the grey "149" badge (draw-r7e.mjs's recipe).
async function f1(sz) {
  const { ctx, page } = await world(sz)
  // the app's own menu of choices, taken whole from the plans selector, then closed
  await toEdit(page)
  await page.locator('#page-editsched .day .planselbtn').filter({ visible: true }).first().click()
  await page.waitForSelector('.wavemenu'); await page.waitForTimeout(300)
  await page.evaluate(() => { window.__mqMenu = document.querySelector('.wavemenu').cloneNode(true) })
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  if (await page.locator('.wavemenu').count()) { await page.mouse.click(sz === 'd' ? 900 : 200, sz === 'd' ? 150 : 210); await page.waitForTimeout(250) }
  if (await page.locator('.wavemenu').count()) throw new Error('f1: the real plans menu did not close')
  await toInputsList(page, false)
  await press(page, sz, '#inNew')
  await page.waitForSelector('#inpEditType', { state: 'visible' }); await page.waitForTimeout(400)
  await page.selectOption('#inpEditPerson', 'stiff'); await page.waitForTimeout(200)
  await page.selectOption('#inpEditType', 'OD'); await page.waitForTimeout(500)
  await page.evaluate(() => { const h = document.querySelector('[data-testid="win-inputedit"] .win-ttl'); if (h) h.click() })
  const st = await page.evaluate(({ DETWIN }) => {
    const mq = window.__mq
    const win = [...document.querySelectorAll('[data-testid="win-inputedit"]')].filter(mq.vis).pop()
    window.__mqWin = win
    const person = win.querySelector('#inpEditPerson')
    const who = person.options[person.selectedIndex].textContent.trim()
    const o = eval('(' + DETWIN + ')')({ dates: true })
    // the window's Add, re-lettered as round 7's B1 writes it
    const add = [...win.querySelectorAll('button')].find(b => b.textContent.trim() === 'Add'); if (add) add.textContent = 'Save'
    // the window's body at its top, so Person, Type, the Detachment list and the dates show together
    const body = win.querySelector('.win-body'); if (body) body.scrollTop = 0
    // the Detachment list open: the app's menu of choices under its select, the width of the select
    const sel = o.detF.querySelector('select')
    const menu = mq.strip(window.__mqMenu.cloneNode(true))
    const h5 = menu.querySelector('h5'); if (h5) mq.hide(h5)
    const rows = [...menu.querySelectorAll('.wm-row')]
    const selRow = rows.find(r => r.querySelector('.wm.sa')), plainRow = rows.find(r => r.querySelector('.wm:not(.sa)'))
    const mk = (tpl, text, badge) => {
      const r = tpl.cloneNode(true); const b = r.querySelector('.wm')
      b.textContent = text; b.style.textAlign = 'left'
      if (badge) { const c = mq.badge(badge); c.style.marginLeft = '8px'; b.appendChild(c) }
      return r
    }
    // the two rows cloned first, then the menu's own rows hidden (a clone of a hidden row would be hidden too)
    const r1 = mk(selRow, 'Exercise North · 249 · 13–31 Jul', '149'), r2 = mk(plainRow, 'Red Sands · 242 · 3–14 Aug')
    rows.forEach(r => mq.hide(r))
    menu.append(r1, r2)
    // in the window's own flow under the select, the width of the select, so TITLE and the dates below still show
    // (laid over them, the open list hid TITLE, which the brief names)
    const sr = sel.getBoundingClientRect()
    menu.style.position = 'relative'; menu.style.left = 'auto'; menu.style.top = 'auto'; menu.style.margin = '6px 0 0'
    menu.style.minWidth = '0'; menu.style.maxWidth = 'none'; menu.style.width = Math.round(sr.width) + 'px'; menu.style.boxSizing = 'border-box'; menu.style.zIndex = '1'
    sel.after(menu)
    mq.mark(menu, 'F1', 'inO', 'blue')
    window.__mqClipEl = win; window.__mqMenuEl = menu
    const badge = r1.querySelector('.sarole').getBoundingClientRect(), btn = r1.querySelector('.wm').getBoundingClientRect()
    return { who, oil: o.oil, add: !!add, fields: [...win.querySelectorAll('.inped-f')].filter(mq.vis).map(f => (f.querySelector('.inped-k') || {}).textContent).join(' / '),
      list: [...menu.querySelectorAll('.wm')].filter(mq.vis).map(b => b.textContent).join(' | '), badgeInside: badge.right <= btn.right && badge.top >= btn.top && badge.bottom <= btn.bottom,
      title: (win.querySelector('#inpEditOwnTitle') || {}).value }
  }, { DETWIN: DETWIN.toString() })
  if (st.who !== 'Saber') throw new Error('f1: person is ' + st.who)
  if (!st.badgeInside) throw new Error('f1: the badge spills out of its row ' + JSON.stringify(st))
  notes.push(`f1 ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const clip = await page.evaluate(() => {
    const w = window.__mqClipEl.getBoundingClientRect(), m = window.__mqMenuEl.getBoundingClientRect(), pad = 6
    const x = Math.max(0, Math.min(w.left, m.left) - pad), y = Math.max(0, Math.min(w.top, m.top) - pad)
    return { x, y, width: Math.min(innerWidth - x, Math.max(w.right, m.right) + pad - x), height: Math.min(innerHeight - y, Math.max(w.bottom, m.bottom) + pad - y) }
  })
  const f = `R7F1-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, 'F1', sz, 'proposed', `142's Inputs page → "+ Input", the app's own New input window: PERSON Saber (142's man, the demo's own Saber), TYPE the kind OD picked and re-lettered DET, as round 7's B1 draws it. Drawn, blue F1: the DETACHMENT choice open as a list — the app's own menu of choices (the plans selector's), its two rows re-lettered: "Exercise North · 249 · 13–31 Jul" in the menu's own picked look, with the small grey "149" badge after it (the other-squadron badge of C1–C6), and "Red Sands · 242 · 3–14 Aug", no badge (142's own). TITLE "Exercise North"; FROM 13 Jul, TO 31 Jul as whole days; no OIL question; no "On 142's schedule in these dates" box (he has nothing planned then). The window's "Add" re-lettered "Save", as B1.`)
  await ctx.close()
}

// ---------- F2 · Saber on 249's crew list, Wed 15 Jul ----------
// Real: Edit Schedule, Wednesday 15 Jul, the day's Available crew list (the list round 3's picture 2 drew 149's free
// people at the foot of, in a group of their own). Drawn: the top bar's "142" re-lettered "249" (Exercise North's
// schedule); the day's sections between its head and the crew list hidden (249's own lines are not drawn); the list's
// wave groups hidden, its "Available all day" group kept with seven of its real seats in the app's own order — six
// re-lettered as the detachment's six, and the demo's own Saber, the grey "142" badge after his name; the rest hidden
// and the group's count set to 7.
// the demo signs in as its own Saber, and the app lights the signed-in man's puck: his seat is hidden, and Ranger's,
// next to it in the app's order, is re-lettered Saber, so all seven wear the list's plain look
const F2MAP = { Reaper: 'Hawk', Blade: 'Spur', Cinch: 'Talc', Comet: 'Vane', Piston: 'Crisp', Ranger: 'Saber', Warden: 'Moss' }
async function f2(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  const st = await page.evaluate(({ sz, F2MAP }) => {
    const mq = window.__mq
    const ds = [...document.querySelectorAll('#eWeek > .day')].filter(d => !d.classList.contains('peek'))
    const wed = ds[2], head = wed.querySelector('.day-head')
    if (!/Jul 15/.test(head.innerText)) return { err: 'not Wed 15 Jul: ' + head.innerText.slice(0, 40) }
    // the phone shows one day at a time, side by side: bring Wednesday to the left edge (draw-r7b.mjs's B3)
    for (let a = wed.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a)
      if (/(auto|scroll)/.test(cs.overflowX) && a.scrollWidth > a.clientWidth + 4) { a.scrollLeft += wed.getBoundingClientRect().left - a.getBoundingClientRect().left; break }
    }
    const av = wed.querySelector('.sec-avail'), body = wed.querySelector('.day-body')
    // the day's sections between its head and the crew list hidden: 249's own lines are not this picture's subject
    const hidden = []
    let holder = av; while (holder.parentElement && holder.parentElement !== body) holder = holder.parentElement
    for (const c of [...body.children]) { if (c === holder) break; hidden.push((c.className || c.tagName) + ''); mq.hide(c) }
    for (let n = av; n && n !== holder; n = n.parentElement) for (const sib of [...n.parentElement.children]) { if (sib === n) break; hidden.push('(in) ' + sib.className); mq.hide(sib) }
    // the list's groups: only "Available all day" kept
    const kids = [...av.children]
    let keepGrp = null, keepGrid = null
    kids.forEach((c, i) => {
      if (c.classList.contains('ap-grp') && /^Available all day/.test(c.textContent.trim())) { keepGrp = c; keepGrid = kids[i + 1] }
    })
    if (!keepGrp || !keepGrid) return { err: 'no Available all day group' }
    for (const c of kids) if (c !== keepGrp && c !== keepGrid && !c.classList.contains('ap-h')) mq.hide(c)
    const seats = [...keepGrid.querySelectorAll(':scope > .seat')]
    const kept = []
    for (const s of seats) {
      const nm = s.querySelector('.nm'), old = nm.textContent.trim()
      if (!(old in F2MAP)) { mq.hide(s); continue }
      const p = s.querySelector('.puck')
      nm.textContent = F2MAP[old]; if (p.title) p.title = p.title.replace(old, F2MAP[old])
      kept.push({ s, name: F2MAP[old], old, role: (s.querySelector('.role') || {}).textContent, cls: p.className })
    }
    if (kept.length !== 7) return { err: 'kept ' + kept.map(k => k.old).join(',') }
    if (new Set(kept.map(k => k.cls)).size !== 1) return { err: 'the seven pucks differ: ' + kept.map(k => k.old + '=' + k.cls).join(', ') }
    const was = keepGrp.textContent.trim()
    keepGrp.textContent = keepGrp.textContent.replace(/\d+\s*$/, '7')
    // Saber's row: the grey "142" badge after his name (draw-r7e.mjs's E1: after his puck)
    const sab = kept.find(k => k.name === 'Saber').s
    const b = mq.badge('142', sz === 'p'); b.style.marginLeft = '4px'; b.style.flex = '0 0 auto'
    sab.querySelector('.puck').after(b)
    // 249's schedule: the top bar's number re-lettered
    mq.asSqn('249')
    if (getComputedStyle(sab).position === 'static') sab.style.position = 'relative'
    mq.mark(sab, 'F2', 'inO', 'blue')
    window.__mqDay = wed; window.__mqAv = av; window.__mqSab = sab
    const sr = sab.getBoundingClientRect(), br = b.getBoundingClientRect(), gr = keepGrid.getBoundingClientRect()
    return { order: kept.map(k => k.name + '(' + k.old + ' ' + k.role + ')').join(', '), was, now: keepGrp.textContent.trim(), hidden,
      ah: (av.querySelector('.ap-h') || {}).textContent, seat: [sr.left, sr.right, sr.top, sr.bottom].map(Math.round), badge: [br.left, br.right, br.top, br.bottom].map(Math.round), grid: [gr.left, gr.right].map(Math.round) }
  }, { sz, F2MAP })
  if (st.err) throw new Error('f2 ' + st.err)
  notes.push(`f2 ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  // framing: from the top of the page (the top bar, 249) to the foot of the crew list; desktop up to Wednesday's right edge
  const clip = await page.evaluate((sz) => {
    const mq = window.__mq, av = window.__mqAv, d = window.__mqDay
    window.scrollTo(window.scrollX, 0)
    const ar = av.getBoundingClientRect(), dr = d.getBoundingClientRect()
    const w = sz === 'd' ? Math.min(innerWidth, Math.round(dr.right + 10)) : innerWidth
    return { x: 0, y: 0, width: w, height: Math.min(innerHeight, Math.round(ar.bottom + 12)) }
  }, sz)
  const f = `R7F2-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, 'F2', sz, 'proposed', `Exercise North's schedule (249): Edit Schedule, Wed 15 Jul, the top bar's "142" re-lettered "249". The day's crew list, the app's own "Available all day" group (it read "${st.was}"), kept with seven of its own seats in the app's order: the six re-lettered Hawk, Spur, Talc, Vane, Crisp, Moss and the demo's own Saber, with the small grey "142" badge after his name (the other-squadron badge, E1's recipe) — in the list as one of the detachment's people, not in a foot group of the other squadron's free people; blue F2 on his row. Hidden: the day's sections between its head and the crew list, the list's wave groups, and the group's other seats; its count set to 7.`)
  await ctx.close()
}

// ---------- F3 · Admin → Squadrons with the time-zone picker (replaces R7D5a, same file names) ----------
// draw-r7d.mjs's D5a, changing only this: "HOURS FROM HOME" "+7" becomes "TIME ZONE", a select reading "Dhaka · GMT+6";
// 142's and 149's sub-lines gain "Perth · GMT+8". The builder below is draw-r7d.mjs's, copied whole, its two sub-lines
// made options (s142, s149).
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
    R(l1, '142', 'Home base · 61 people' + (opts.s142 || ''))
    const r149 = R(l1, '149', (opts.p149 || 'Northern base') + ' · 48 people' + (opts.s149 || ''))
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
async function f3(sz) {
  const { ctx, page } = await world(sz)
  await toAdmin(page)
  await squadrons(page, { det: true, s142: ' · Perth · GMT+8', s149: ' · Perth · GMT+8',
    editDet: [['Place', 'sel', '', ['Exercise base', 'Home base', 'Northern base', '+ New place…']], ['Time zone', 'sel', '', ['Dhaka · GMT+6', 'Perth · GMT+8']]] })
  const st = await page.evaluate(() => {
    const mq = window.__mq, e = window.__mqSq.editDet; const fs = e.cols[0].querySelectorAll('.mfield')
    mq.mark(fs[1], 'F3', 'pad', 'blue')
    const subs = [...document.querySelectorAll('#page-admin .acc-row[data-mine] .acc-sub')].filter(mq.vis).map(s => s.textContent)
    const s = fs[1].querySelector('select')
    return { label: fs[1].querySelector('label').textContent, shown: s.options[s.selectedIndex].textContent, subs }
  })
  notes.push(`f3 ${sz}: ${JSON.stringify(st)}`)
  await page.waitForTimeout(250)
  const f = `R7D5a-${sz}-proposed.png`
  await shot(page, f, await adminClip(page, sz))
  rec(f, 'D5', sz, 'proposed', `Admin → Squadrons (round 4's page), Exercise North's row opened. Drawn in beside its Place ("Exercise base"): "Time zone", a select reading "Dhaka · GMT+6" — blue (Q8, ruled). 142's and 149's rows each carry their time zone in their grey sub-line: "Home base · 61 people · Perth · GMT+8", "Northern base · 48 people · Perth · GMT+8". Both fields are the Users editor's own, re-lettered. Redrawn by draw-r7f.mjs (chat 104) from draw-r7d.mjs's D5a, which had "Hours from home" "+7"; the city names are made up for the demo.`)
  await ctx.close()
}

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ALL = { f1, f2, f3 }
try {
  if (process.env.MQ_PROBE) { await probe(process.env.MQ_SZ || 'd') }
  else for (const sz of (process.env.MQ_SZ ? process.env.MQ_SZ.split(',') : ['d', 'p'])) {
    console.log('== ' + SIZES[sz].name)
    for (const [k, f] of Object.entries(ALL)) {
      if (ONLY && !ONLY.includes(k)) continue
      try { await f(sz) } catch (e) { errs.push(`[${sz}] ${k} FAILED: ${e.message}`); console.log(k, 'FAILED', e.message) }
    }
  }
} finally {
  await browser.close()
}
if (!process.env.MQ_PROBE) {
  let old = {}
  try { old = JSON.parse(readFileSync(`${OUT}/manifest-r7f.json`, 'utf8')) } catch {}
  writeFileSync(`${OUT}/manifest-r7f.json`, JSON.stringify({ ...old, ...manifest }, null, 2) + '\n')
  for (const f of Object.keys(manifest)) copyFileSync(`${PAGEIMG}/${f}`, `${OUT}/${f}`)
}
console.log('NOTES\n' + notes.join('\n'))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
