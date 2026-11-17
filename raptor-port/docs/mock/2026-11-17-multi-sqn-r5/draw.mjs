// Multi-squadron & detachment — Round 5's first pictures (17 Nov 26, chat 94), drawn on the REAL running app by
// .claude/skills/brainstorming/mockups-on-the-real-app.md. Two of his asks:
//  T — the other squadron's grey "142" tag on Edit Schedule's week (look 2, D2104), lined up at the left under the mission
//      (his round-4 question "would it be nicer if the 142 tag is also aligned to the left", and "should it show the same
//      on desktop and phone"): phone as round 4 drew it, phone lined up; desktop as ruled (after the mission) and desktop
//      lined up under it, measured, the one-jet formation's height too.
//  J — the "+ Wave" menu's "Join a 149 wave" rows as he approved them (D2126): each row its take-off and formations, a
//      joined one greyed "joined" (the menu's own disabled look).
// The kit, world() and the badge recipe are round 4's (docs/mock/2026-11-17-multi-sqn-r4/draw.mjs). Every "proposed"
// frame adds a node marked data-mine, or hides one (display:none, never removed).
//
// Run from raptor-port/, against a built preview already serving:
//   MQ_URL=http://localhost:4180/ node docs/mock/2026-11-17-multi-sqn-r5/draw.mjs
// Pictures and manifest.json go to docs/img/2026-11-17-multi-sqn-r5/, then are copied beside the page (img/).
// Demo data only; 142's own Monday stands in for 149's schedule (its top bar re-lettered "149").
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, readdirSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4180/'
const OUT = 'docs/img/2026-11-17-multi-sqn-r5'
const PAGEIMG = 'docs/mock/2026-11-17-multi-sqn-r5/img'
mkdirSync(OUT, { recursive: true }); mkdirSync(PAGEIMG, { recursive: true })

const SIZES = {
  d: { name: 'desktop', opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const MARK_CSS = `
.mkq { outline: 2px solid #ff2d95 !important; outline-offset: -2px !important; }
.mkq.mkq-o { outline-offset: 1px !important; }
.mkq-tag { position: absolute; z-index: 60; background: #ff2d95; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; }
.toast, .toasts, #toast, #toastEl { display: none !important; }
`

function kit() {
  const mq = {}
  mq.vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  mq.hide = e => { e.setAttribute('data-mqhid', '1'); e.style.setProperty('display', 'none', 'important') }
  // a pink outline round a thing, its label hanging at its top right (outside, so nothing it marks moves)
  mq.mark = (el, label) => {
    const b = el.getBoundingClientRect()
    el.classList.add('mkq', 'mkq-o')
    const t = document.createElement('span'); t.className = 'mkq-tag'; t.textContent = label; t.setAttribute('data-mine', '1')
    t.style.left = Math.round(b.right + window.scrollX + 6) + 'px'; t.style.top = Math.round(b.top + window.scrollY - 8) + 'px'
    document.body.appendChild(t)
    return t
  }
  mq.days = () => [...document.querySelectorAll('#eWeek > .day')].filter(d => mq.vis(d) && !d.classList.contains('peek'))
  mq.monday = () => mq.days()[0]
  // the grey badge of round 2's look 2 (D2104): the standby lines' MAIN badge recipe, in neutral grey (round 4's)
  mq.badge = (txt, small) => {
    const c = document.createElement('span'); c.className = 'sarole ro'; c.textContent = txt; c.setAttribute('data-mine', '1')
    c.style.background = 'rgba(255,255,255,.08)'; c.style.borderColor = 'rgba(255,255,255,.22)'; c.style.color = 'var(--ink-2)'
    c.style.verticalAlign = 'middle'; c.style.alignSelf = 'center'
    if (small) { c.style.fontSize = '7px'; c.style.padding = '0 4px' }
    return c
  }
  // the left edge of a text's first letter (not its box)
  mq.textLeft = el => { const tn = [...el.childNodes].find(n => n.nodeType === 3 && n.nodeValue.trim()); const r = document.createRange(); r.selectNodeContents(tn); return r.getClientRects()[0].left }
  // --- round 4's helpers, unchanged, for G and N (chat 95): strip a clone of the app's hooks, the quiet grey line,
  // hide a formation's in-time line, a mark drawn on the element with its tag beside it, and the clip check
  mq.strip = root => {
    const A = ['id', 'data-inprow', 'data-inpedit', 'data-inp', 'data-txt', 'data-slot', 'data-fill', 'data-drag', 'data-inpseat',
      'tabindex', 'data-plangolive', 'data-plandup', 'data-avtog', 'data-planmenu', 'for', 'data-person', 'data-testid', 'contenteditable', 'data-acc', 'data-acck',
      'data-gline', 'data-gdel', 'data-itadd', 'data-sortsec', 'data-air', 'data-wvadd', 'data-acct', 'data-editing', 'data-bfld', 'data-move']
    for (const n of [root, ...root.querySelectorAll('*')]) for (const a of A) n.removeAttribute(a)
    root.setAttribute('data-mine', '1')
    return root
  }
  mq.mark4 = (el, label, where = 'in') => {
    if (where === 'right' && el.getAttribute('data-mine') === '1') el.style.width = 'fit-content'
    const b = el.getBoundingClientRect()
    if (el.getAttribute('data-mine') === '1' && getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.classList.add('mkq'); if (where !== 'in' && where !== 'br') el.classList.add('mkq-o')
    const t = document.createElement('span'); t.className = 'mkq-tag'; t.textContent = label; t.setAttribute('data-mine', '1')
    if (where === 'below') { t.style.top = 'calc(100% + 4px)'; t.style.right = '0' }
    else if (where === 'above') { t.style.bottom = 'calc(100% + 4px)'; t.style.right = '0' }
    else if (where === 'right') { t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.left = 'calc(100% + 5px)' }
    else if (where === 'br') { t.style.bottom = '3px'; t.style.right = '3px' }
    else { t.style.top = '1px'; t.style.right = '1px' }
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.appendChild(t)
    const a = el.getBoundingClientRect()
    if (!['x', 'y', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) < 0.5)) throw new Error('mark moved its element: ' + label)
    return t
  }
  mq.tag4 = (el, label, where) => { const t = mq.mark4(el, label, where); el.classList.remove('mkq', 'mkq-o'); return t }
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
  mq.hideItLine = (g, cs) => {
    const box = g.querySelector('.intimes'); if (!box) return 0
    let n = 0
    for (const l of [...box.children]) if (!l.classList.contains('itx') && new RegExp('\\b' + cs + '\\b').test(l.textContent)) {
      mq.hide(l); n++
      const x = l.nextElementSibling; if (x && x.classList.contains('itx')) mq.hide(x)
    }
    return n
  }
  // the quiet grey line: the day head's own date line ("Jul 13 · Today"), its look measured on the real element and
  // copied whole — no new colour, size or weight (round 4's item 2)
  mq.quiet = (lines) => {
    const src = [...document.querySelectorAll('#eWeek .day-head .dt, #vWeek .day-head .dt')].find(mq.vis)
    const cs = getComputedStyle(src)
    const d = document.createElement('div'); d.setAttribute('data-mine', '1'); d.className = 'mq-quiet'
    for (const p of ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'line-height', 'color']) d.style.setProperty(p, cs.getPropertyValue(p))
    d.style.whiteSpace = 'normal'
    for (const l of lines) { const x = document.createElement('div'); x.textContent = l; d.appendChild(x) }
    window.__mqQuietSrc = { size: cs.fontSize, weight: cs.fontWeight, color: cs.color }
    return d
  }
  window.__mq = mq
}

const manifest = {}, notes = [], errs = [], figures = {}
let browser
async function world(sz, { user = 'ad', pass = 'a' } = {}) {
  const ctx = await browser.newContext(SIZES[sz].opts)
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`) })
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  await page.goto(URL_)
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(700)
  await page.addStyleTag({ content: MARK_CSS })
  return { ctx, page }
}
async function toEdit(page) {
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#page-editsched.on #eWeek .day')
  await page.waitForTimeout(900)
}
function rec(file, item, sz, kind, caption) { manifest[file] = { item, size: SIZES[sz].name, kind, caption } }
async function shot(page, file, clip) {
  const bad = await page.evaluate(() => window.__mq.checkTags())
  if (bad.length) throw new Error(file + ': ' + bad.join('; '))
  await page.mouse.move(Math.round(page.viewportSize().width / 2), 1)
  await page.waitForTimeout(150)
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}) })
  console.log('  wrote', file)
}

// ---------- T: the "142" tag on the week ----------
// how: 'r4' round 4's drawing (phone: under the mission, the badge's own left margin kept); 'after' look 2 as ruled on a
// desktop (after the mission); 'left' under the mission, its left edge on the mission's first letter. oneJet: RU's
// second jet hidden, to measure what the tag costs a one-jet formation.
async function tagShot(sz, how, { oneJet = false } = {}) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  const m = await page.evaluate(({ how, oneJet }) => {
    const mq = window.__mq, mon = mq.monday(), g = mon.querySelector('.go')
    const forms = [...g.querySelectorAll('.form')]
    const ru = forms.find(x => x.querySelector('.csmsn .ntx').textContent.trim() === 'RU')
    if (!ru) return { err: 'no RU' }
    // 149's schedule: 142's app stands in, its top bar's number re-lettered
    const k = document.querySelector('.topbar .mark .k'); if (k) { const k2 = k.cloneNode(true); k2.setAttribute('data-mine', '1'); k2.textContent = '149'; mq.hide(k); k.after(k2) }
    if (oneJet) {
      // RU flown as a one-jet formation: its second jet's row and remarks hidden, the cells' row span set to one
      const rows = [...ru.querySelectorAll(':scope > .acrow, :scope > .rmkcell')]
      rows.slice(2).forEach(mq.hide)
      for (const c of ru.querySelectorAll(':scope > .fcell')) c.style.setProperty('--gs', '1')
    }
    const cell = ru.querySelector('.csmsn'), msn = cell.querySelector('i')
    const h0 = Math.round(ru.getBoundingClientRect().height * 10) / 10
    const phone = innerWidth < 600
    const c = mq.badge('142', phone)
    if (how === 'after') { c.style.marginLeft = '5px'; c.style.position = 'relative'; c.style.top = '-1px'; msn.appendChild(c) }
    else {
      c.style.display = 'block'; c.style.width = 'fit-content'; c.style.marginTop = '2px'
      msn.after(c)
      if (how === 'left') {
        // its left edge on the mission's first letter, measured, whatever margin the badge recipe carries
        // round 4's recipe centred the badge in the cell's column (align-self:center) — that was the indent he saw
        c.style.alignSelf = 'flex-start'; c.style.marginLeft = '0px'
        const dx = mq.textLeft(msn) - c.getBoundingClientRect().left
        c.style.marginLeft = dx.toFixed(2) + 'px'
      }
    }
    ru.style.background = 'rgba(255,255,255,.055)'
    const h1 = Math.round(ru.getBoundingClientRect().height * 10) / 10
    const br = c.getBoundingClientRect()
    const out = { h0, h1, grew: Math.round((h1 - h0) * 10) / 10, badgeLeft: +(br.left - mq.textLeft(msn)).toFixed(1), badge: [Math.round(br.width), Math.round(br.height)], cellW: Math.round(cell.getBoundingClientRect().width) }
    // the frame: the wave's head to RU's area line, Monday's column only
    const mr = mon.getBoundingClientRect()
    const head = g.querySelector('.go-tab') || g
    window.__mqTop = head; window.__mqBot = ru; window.__mqBadge = c; window.__mqCol = mr
    return out
  }, { how, oneJet })
  if (m.err) throw new Error('tag ' + m.err)
  await page.evaluate(() => { const t = window.__mqTop.getBoundingClientRect(); window.scrollBy(0, t.top - 120) })
  await page.waitForTimeout(250)
  await page.evaluate(() => window.__mq.mark(window.__mqBadge, 'T'))
  const clip = await page.evaluate(() => {
    const t = window.__mqTop.getBoundingClientRect(), b = window.__mqBot.getBoundingClientRect(), col = window.__mq.monday().getBoundingClientRect()
    const x = Math.max(0, col.left - 4), y = Math.max(0, t.top - 6)
    const right = innerWidth < 600 ? innerWidth : Math.min(innerWidth, col.right + 6)
    return { x, y, width: right - x, height: Math.min(innerHeight - y, b.bottom + 30 - y) }
  })
  return { ctx, page, m, clip }
}

async function itT(sz) {
  const cases = sz === 'p'
    ? [{ how: 'r4', file: 'T-r4-p', cap: m => `149's schedule, Edit Schedule, phone. Round 4 as drawn: 142's RU wears the grey "142" tag under "BFM", but it starts ${m.badgeLeft}px further in than "BFM" does.` },
       { how: 'left', file: 'T-left-p', cap: m => `149's schedule, Edit Schedule, phone. Proposed: the tag lined up on the left, its edge exactly on the "B" of "BFM" (measured: ${m.badgeLeft}px). "RU", "BFM" and "142" now read as one stack with one left edge. The blue dot before RU only marks a changed line, so it hangs out on its own as it does today. The line is ${m.h1}px tall with the tag, the same as without it (${m.h0}px).` }]
    : [{ how: 'after', file: 'T-after-d', cap: m => `149's schedule, Edit Schedule, desktop. As ruled in round 2 (look 2): the tag after the mission, "BFM 142", on the mission's own line. It adds no height.` },
       { how: 'left', file: 'T-left-d', cap: m => `149's schedule, Edit Schedule, desktop. The phone's look on a desktop: the tag under "BFM", lined up on the left (${m.badgeLeft}px). RU has two jets, so its block is ${m.h1}px tall either way (${m.h0}px before): no height added here.` },
       { how: 'left', oneJet: true, file: 'T-left1-d', cap: m => `149's schedule, Edit Schedule, desktop. The cost of the phone's look on a desktop: RU flown as a one-jet formation. With the tag under "BFM" its line grows from ${m.h0}px to ${m.h1}px (+${m.grew}px), because the tag needs a third line where the line has room for two.` },
       { how: 'after', oneJet: true, file: 'T-after1-d', cap: m => `149's schedule, Edit Schedule, desktop. The same one-jet RU with the tag after the mission, as ruled: ${m.h1}px tall, as without the tag (${m.h0}px).` }]
  for (const c of cases) {
    const { ctx, page, m, clip } = await tagShot(sz, c.how, { oneJet: !!c.oneJet })
    const f = `${c.file}.png`
    await shot(page, f, clip)
    rec(f, 'T', sz, c.how === 'r4' ? 'round 4' : 'proposed', c.cap(m))
    figures[c.file] = m
    notes.push(`${c.file}: ${JSON.stringify(m)}`)
    await ctx.close()
  }
}

// ---------- J: "Join a 149 wave", as approved (D2126) ----------
// 142's Scheduler Board, "+ Wave" pressed (real). Drawn in under the wave kinds: the "Join a 149 wave" group, one row a
// wave, each its name, take-off and formations read from the real day (142's own Monday stands in for 149's: its 1st
// and 2nd waves); the second already joined — greyed in the menu's own disabled look, "joined" at its right.
async function itJ(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  const waves = await page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday()
    return [...mon.querySelectorAll('.go')].map((g, i) => {
      const forms = [...g.querySelectorAll('.form')]
      const cs = [...new Set(forms.map(f => f.querySelector('.csmsn .ntx').textContent.trim()).filter(Boolean))]
      const tos = forms.map(f => (f.querySelector('.ld .tox') || {}).textContent || '').map(s => s.trim()).filter(s => /^\d\d:\d\d$/.test(s)).sort()
      return { n: i + 1, cs, to: tos[0] || '' }
    }).filter(w => w.cs.length && w.to)
  })
  if (waves.length < 2) throw new Error('J: fewer than two flying waves ' + JSON.stringify(waves))
  await page.evaluate(() => document.querySelector('#eWeek .day:not(.peek) [data-sbday="0"]').click())
  await page.waitForSelector('.sb-go [data-gline]'); await page.waitForTimeout(1200)
  await page.evaluate(() => [...document.querySelectorAll('[data-wvadd]')].find(b => b.offsetParent).click())
  await page.waitForTimeout(600)
  const info = await page.evaluate(({ waves }) => {
    const mq = window.__mq, menu = [...document.querySelectorAll('.wavemenu')].find(e => mq.vis(e))
    if (!menu) return { err: 'no wave menu' }
    const kinds = menu.querySelectorAll('.wm-row')[0]
    const box = document.createElement('div'); box.setAttribute('data-mine', '1')
    const h = menu.querySelector('h5').cloneNode(true); h.textContent = 'Join a 149 wave'; box.appendChild(h)
    const row = document.createElement('div'); row.className = 'wm-row'; row.style.cssText = 'flex-direction:column;align-items:stretch'
    box.appendChild(row)
    const two = waves.slice(0, 2)
    two.forEach((w, i) => {
      const b = document.createElement('button'); b.className = 'wm'; b.type = 'button'
      b.style.cssText = 'display:flex;align-items:baseline;gap:8px;width:100%'
      const name = document.createElement('span'); name.textContent = 'Wave ' + w.n
      // the small grey words: the menu's own quiet ink, a size under the row's, not bold
      const sub = document.createElement('span'); sub.textContent = `T/O ${w.to} · ${w.cs.join(', ')}`
      sub.style.cssText = 'color:var(--ink-3);font-weight:600;font-size:11px'
      b.append(name, sub)
      if (i === 1) {
        const j = document.createElement('span'); j.textContent = 'joined'; j.style.cssText = 'margin-left:auto;color:var(--ink-3);font-weight:600;font-size:11px'
        b.append(j); b.disabled = true
      }
      row.appendChild(b)
    })
    kinds.after(box)
    const op = getComputedStyle(row.children[1]).opacity
    // a tall menu kept on screen
    const mr = menu.getBoundingClientRect(), over = mr.bottom - innerHeight + 12
    if (over > 0 && getComputedStyle(menu).position !== 'static') menu.style.top = Math.max(8, mr.top - over) + 'px'
    mq.mark(box, 'J')
    window.__mqMenu = menu
    return { op, rows: [...row.children].map(b => b.innerText.replace(/\s+/g, ' ').trim()), menuW: Math.round(menu.getBoundingClientRect().width) }
  }, { waves })
  if (info.err) throw new Error('J ' + info.err)
  if (info.op !== '0.45') throw new Error('J: the greyed look is not the menu\'s own: ' + info.op)
  const clip = await page.evaluate(() => { const r = window.__mqMenu.getBoundingClientRect(); const x = Math.max(0, r.left - 12), y = Math.max(0, r.top - 12); return { x, y, width: Math.min(innerWidth - x, r.width + 40), height: Math.min(innerHeight - y, r.height + 24) } })
  const f = `J-join-${sz}.png`
  await shot(page, f, clip)
  rec(f, 'J', sz, 'proposed', `142's Scheduler Board, "+ Wave" pressed (the menu is real). Drawn in (mark J): "Join a 149 wave", one row a wave: ${info.rows.map(r => `"${r}"`).join(' and ')}. Each row says when it takes off and which formations are in it, so 149's waves are told apart by time. The second is one 142 has already joined: greyed in the menu's own "can't press" look, "joined" at its right. (142's own 1st and 2nd waves stand in for 149's.)`)
  figures['J-' + sz] = info
  notes.push(`J ${sz}: ${JSON.stringify(info)}`)
  await ctx.close()
}

// ---------- G: the grey line under the other squadron's wave, in its three states (D2124, D2129) ----------
// 142's schedule, Edit Schedule, Monday: one continuous frame from the top of the screen to the 1st wave's foot. The 1st
// wave stands in for 149's: VL and its typed in-time line are 149's, hidden (142 sees its own lines and the lines it
// ticks); RU is 142's. The wave's title wears 149's grey badge (D2124: the badge says whose wave it is); under it one
// sentence, the state's. The day head's DRAFT or ORIG is real: 142's own day, published by the app's own call where the
// state says 142 has published. Between the day head and the wave the app draws the issues bar and the Common
// Programme: hidden, each named in the caption. On a published day the empty sign-off boxes waiting for the next
// amendment are hidden too, named.
// The publish call: four real people sign Monday, as the e2e suite does (round 4's).
const PUBLISH = () => { const w = window; const g = w.signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; w.setDayApproved(0, true) }
const GSTATES = {
  none: { pub: false, line: 'Not yet published by 149.', who: 'Neither squadron has published Monday' },
  mine: { pub: true, line: 'RU goes out when 149 publishes.', who: '142 has published Monday, 149 has not' },
  theirs: { pub: false, line: 'Published by 149.', who: '149 has published its wave, 142 has not published its own day' },
}
async function gView(sz, st, { member = false } = {}) {
  const S = GSTATES[st]
  const { ctx, page } = await world(sz, member ? { user: 'us', pass: 'us' } : {})
  if (S.pub) await page.evaluate(PUBLISH)
  if (member) {
    await page.evaluate(() => window.go('viewsched'))
    await page.waitForSelector('#page-viewsched.on #vWeek .day'); await page.waitForTimeout(900)
  } else await toEdit(page)
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
  const m = await page.evaluate(({ line, label, member }) => {
    const mq = window.__mq
    const wk = member ? '#vWeek' : '#eWeek'
    const mon = [...document.querySelectorAll(wk + ' > .day')].filter(d => mq.vis(d) && !d.classList.contains('peek'))[0]
    const head = mon.querySelector('.day-head'), body = mon.querySelector('.day-body')
    const g = mon.querySelector('.go'); if (!g) return { err: 'no wave' }
    const forms = [...g.querySelectorAll('.form')]
    const nm = f => f.querySelector('.csmsn .ntx').textContent.trim()
    const ru = forms.find(x => nm(x) === 'RU'), vl = forms.find(x => nm(x) === 'VL')
    if (!ru || !vl) return { err: 'RU/VL' }
    const hidden = []
    // everything in the day's body before the 1st wave's section, and every wave after the 1st: hidden
    const sec = g.closest('.dsec') || g
    let seen = false
    for (const s of [...body.children]) {
      if (s === sec) { seen = true; continue }
      if (!seen) hidden.push(s.innerText.replace(/\s+/g, ' ').trim().slice(0, 30))
      mq.hide(s)
    }
    if (sec !== g) for (const og of [...sec.querySelectorAll('.go')].slice(1)) mq.hide(og)
    const so = mon.querySelector('.signoff.day-sign')
    if (so && /ORIG/.test(head.innerText)) { mq.hide(so); hidden.unshift('the empty sign-off boxes, waiting for the next amendment') }
    // 149's VL and its in-time line; on Edit Schedule the wave's own "+ In-time" (149's wave: its in-time is 149's)
    mq.hide(vl); const itHidden = mq.hideItLine(g, 'VL')
    const itb = g.querySelector('[data-itadd]'); if (itb) mq.hide(itb)
    const tab = g.querySelector('.go-tab')
    const b = mq.badge('149'); b.style.marginLeft = '8px'; tab.querySelector('.asd').after(b)
    const q = mq.quiet([line])
    const name = tab.querySelector('.ntx') || tab.querySelector('.asd')
    q.style.padding = `0 10px 6px ${Math.round(name.getBoundingClientRect().left - tab.getBoundingClientRect().left)}px`
    q.style.background = getComputedStyle(tab).backgroundColor
    tab.after(q)
    mq.mark4(q, label, 'right')
    window.__mqMon = mon; window.__mqG = g
    const qr = q.firstChild.getClientRects()
    return { hidden, itHidden, dayChip: head.querySelector('.dhver').innerText.trim(), waveTab: tab.innerText.replace(/\s+/g, ' ').trim(), quiet: window.__mqQuietSrc, lineRows: qr.length }
  }, { line: S.line, label: member ? 'G2' : { none: 'G1', mine: 'G2', theirs: 'G3' }[st], member })
  if (m.err) throw new Error('gView ' + st + ' ' + m.err)
  if (S.pub !== /ORIG/.test(m.dayChip)) throw new Error(`gView ${st}: day head "${m.dayChip}" is not the state's`)
  await page.waitForTimeout(250)
  const clip = await page.evaluate(() => {
    const g = window.__mqG, mon = window.__mqMon
    let r = g.getBoundingClientRect()
    if (r.bottom > innerHeight - 4) { window.scrollBy(0, r.bottom - innerHeight + 8); r = g.getBoundingClientRect() }
    const right = innerWidth < 600 ? innerWidth : Math.min(innerWidth, mon.getBoundingClientRect().right + 8)
    return { x: 0, y: 0, width: right, height: Math.min(innerHeight, Math.round(r.bottom + 8)) }
  })
  return { ctx, page, m, clip }
}
async function itG(sz) {
  const cases = [
    { st: 'none', file: 'G1-none', cap: m => `142's schedule, Edit Schedule. Neither squadron has published Monday. 142's day head reads "${m.dayChip}" (real). Under 149's wave, whose title wears 149's grey badge, one quiet sentence (mark G1): "Not yet published by 149."` },
    { st: 'mine', file: 'G2-mine', cap: m => `142's schedule, Edit Schedule. 142 has published Monday, 149 has not. 142's day head reads "${m.dayChip}" (real: 142's four signed 142's own day). The sentence under 149's wave (mark G2): "RU goes out when 149 publishes." So 142's RU, on a published day, is plainly still waiting. With two 142 lines in the wave it reads "RU and VL go out when 149 publishes."` },
    { st: 'theirs', file: 'G3-theirs', cap: m => `142's schedule, Edit Schedule. 149 has published, 142 has not. 142's day head reads "${m.dayChip}" (real): 142's own day is not out. The sentence under 149's wave (mark G3): "Published by 149." The wave wears no status chip of its own, so nothing on 142's day reads as published by 142.` },
    { st: 'mine', member: true, file: 'G2-member', cap: m => `142's schedule, View-only Sched, as a member sees it (signed in as the demo's member). 142 has published, 149 has not. The day head reads "${m.dayChip}" (real). The same sentence as Edit Schedule (mark G2): "RU goes out when 149 publishes."` },
  ]
  for (const c of cases) {
    const { ctx, page, m, clip } = await gView(sz, c.st, { member: !!c.member })
    const f = `${c.file}-${sz}.png`
    await shot(page, f, clip)
    rec(f, 'G', sz, 'proposed', c.cap(m) + ` 149's VL and its in-time line are hidden (142's view). Hidden between the day head and the wave: ${m.hidden.join(' · ')}. (142's Monday stands in; its 1st wave stands in for 149's.)`)
    figures[`${c.file}-${sz}`] = m
    notes.push(`G ${c.file} ${sz}: ${JSON.stringify(m)}`)
    await ctx.close()
  }
}

// ---------- N: "+ Line" and the "3 new ↓" count (D2125, D2115) ----------
// 142's Scheduler Board, Monday. Real presses of the 1st wave's "+ Line": the app puts each new line at the wave's foot,
// in the order made, each in the board's own just-added ring (.sb-fresh) — as D2125 rules, so nothing is moved. Drawn
// in: the count beside "+ Line", the head's own "+ In-time" button re-lettered (round 4's B) — on a phone after Traffic,
// on the head's first row, where there is room. Its passing note "Line added" is hidden (the count replaces it). The
// count's number = the new lines not yet seen; it goes once all have been in view.
//  N1 three presses, the foot out of view: "3 new ↓".
//  N2 a partial scroll by hand, the first new line in view: "2 new ↓" (the agent's reading, put to him).
//  N3 the count tapped: the screen brought to the new lines (a real scroll of the board), the count gone.
//  N4 a wave whose foot is already in view: one press, the line lands in view, no count, only the ring.
async function nBoard(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  await page.evaluate(() => document.querySelector('#eWeek .day:not(.peek) [data-sbday="0"]').click())
  await page.waitForSelector('.sb-go [data-gline]'); await page.waitForTimeout(1200)
  return { ctx, page }
}
const N_IN = () => {
  // how many of the given lines stand wholly in view, under the board's bar
  window.__mqInView = els => { const bar = document.querySelector('#schedBoard .sb-top').getBoundingClientRect().bottom; return els.filter(f => { const r = f.getBoundingClientRect(); return r.top >= bar - 0.5 && r.bottom <= innerHeight + 0.5 }).length }
}
async function pressLine(page, gi, n) {
  const at = await page.evaluate(gi => { const b = [...document.querySelectorAll('.sb-go')].filter(x => x.offsetParent)[gi].querySelector('.sb-go-h [data-gline]'); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, gi)
  for (let i = 0; i < n; i++) { await page.mouse.click(at.x, at.y); await page.waitForTimeout(300) }
  return at
}
// the count beside "+ Line": the head's own "+ In-time" button re-lettered (round 4's 3c)
const COUNT = ({ gi, text, label }) => {
  const mq = window.__mq, g = [...document.querySelectorAll('.sb-go')].filter(x => x.offsetParent)[gi]
  const btn = g.querySelector('.sb-go-h [data-gline]')
  const b0 = btn.getBoundingClientRect()
  const tpl = g.querySelector('.sb-go-h [data-itadd]') || btn
  const c = mq.strip(tpl.cloneNode(true)); c.textContent = text; c.style.whiteSpace = 'nowrap'
  const traffic = [...g.querySelectorAll('.sb-go-h button')].find(b => b.textContent.trim() === 'Traffic')
  if (innerWidth < 600 && traffic) { c.style.marginLeft = '8px'; traffic.after(c) } else btn.after(c)
  mq.mark4(c, label, 'below')
  const b1 = btn.getBoundingClientRect()
  return { moved: Math.round(Math.abs(b1.left - b0.left) + Math.abs(b1.top - b0.top)) }
}
async function itN(sz) {
  const words = []
  // N1, N2, N3: one world each, three real presses on the 1st wave
  for (const which of sz === 'p' ? ['N1', 'N3'] : ['N1', 'N2', 'N3']) {
    const { ctx, page } = await nBoard(sz)
    await page.evaluate(N_IN)
    await page.evaluate(() => { const b = [...document.querySelectorAll('.sb-go [data-gline]')].filter(x => x.offsetParent)[0]; b.scrollIntoView({ block: 'center' }) })
    await page.waitForTimeout(400)
    await pressLine(page, 0, 3)
    const base = await page.evaluate(() => {
      const g = [...document.querySelectorAll('.sb-go')].filter(x => x.offsetParent)[0]
      const fresh = [...g.querySelectorAll('.sb-line.sb-fresh')]
      window.__mqFresh = fresh
      return { fresh: fresh.length, inView: window.__mqInView(fresh), last: g.querySelector('.sb-line:last-of-type') === fresh[fresh.length - 1] }
    })
    if (base.fresh !== 3) throw new Error(`N ${which}: ${base.fresh} new lines`)
    if (base.inView !== 0) throw new Error(`N ${which}: ${base.inView} new lines already in view — the count would not show`)
    // the scroll first (a real scroll of the board), the drawing last
    // a hand scroll that brings the first new line into view. Desktop only: on a phone the 1st wave is taller than the
    // screen, so with its head just under the board's bar no new line is in view yet (measured, chat 95) — the count
    // scrolls away with "+ Line" before any new line arrives, and there is no countdown to see
    if (which === 'N2') await page.evaluate(() => window.__mqFresh[0].scrollIntoView({ block: 'end' }))
    if (which === 'N3') await page.evaluate(() => {
      // the tap's scroll: the new lines brought into view, the last one's foot (its area line) at the screen's foot
      const f = window.__mqFresh, last = f[f.length - 1], a = last.nextElementSibling && last.nextElementSibling.classList.contains('sb-area') ? last.nextElementSibling : last
      a.scrollIntoView({ block: 'end' })
    })
    await page.waitForTimeout(350)
    const info = await page.evaluate(({ which }) => {
      const f = window.__mqFresh, inView = window.__mqInView(f)
      const ringed = f.filter(x => x.classList.contains('sb-fresh')).length
      return { inView, ringed, which }
    }, { which })
    if (which === 'N2' && !(info.inView >= 1 && info.inView <= 2)) throw new Error(`N2: ${info.inView} in view, wanted 1 or 2`)
    if (which === 'N3' && info.inView !== 3) throw new Error(`N3: ${info.inView} in view, wanted 3`)
    let cm = { moved: 0 }
    if (which !== 'N3') cm = await page.evaluate(COUNT, { gi: 0, text: `${3 - info.inView} new ↓`, label: which })
    else await page.evaluate(() => window.__mq.tag4(window.__mqFresh[0], 'N3', innerWidth < 600 ? 'br' : 'in'))
    if (cm.moved) throw new Error(`${which}: "+ Line" moved ${cm.moved}px`)
    const f = `${which}-${sz}.png`
    await shot(page, f)
    figures[`${which}-${sz}`] = info
    const cap = {
      N1: `142's Scheduler Board. "+ Line" pressed three times, for real: the app put the three blank lines at the wave's foot, in the order made, out of view (0 of 3 on this ${SIZES[sz].name} screen). Beside "+ Line" the count "3 new ↓" (mark N1, drawn in: the head's own "+ In-time" button re-lettered)${sz === 'p' ? '; on a phone the head\'s second row is full, so it stands after Traffic on its first row, where there is room' : ''}. It counted 1, 2, 3 with the presses; "+ Line" never moved.`,
      N2: `142's Scheduler Board. The same three presses, then the board scrolled by hand until ${info.inView === 1 ? 'the first new line' : `${info.inView} new lines`} came into view (real scroll). The count now reads "${3 - info.inView} new ↓" (mark N2): the line${3 - info.inView > 1 ? 's' : ''} not yet seen. Proposed by the agent: the count counts down as you see the lines, so its number always says how many are still below.`,
      N3: `142's Scheduler Board. The same three presses, then the count tapped: the board scrolls to the new lines (a real scroll), all three in view (${info.inView} of 3), each in the board's own just-added ring (${info.ringed} ringed); the count is gone and does not come back for them. Mark N3 on the first new line.`,
    }[which]
    rec(f, 'N', sz, 'proposed', cap + ` (142's 1st wave; the full screen, so what is out of view shows. The passing note "Line added" is hidden: the count does its job.)`)
    notes.push(`N ${which} ${sz}: ${JSON.stringify({ base, info })}`)
    await ctx.close()
  }
  // N4: a wave whose foot is in view with its head: one press, the line lands in view, no count. Desktop only: on a
  // phone no wave of the demo day is short enough to show its foot with its head (measured, chat 95)
  if (sz === 'd') {
    const { ctx, page } = await nBoard(sz)
    await page.evaluate(N_IN)
    const gi = await page.evaluate(() => {
      const bar = document.querySelector('#schedBoard .sb-top').getBoundingClientRect().bottom
      const gs = [...document.querySelectorAll('.sb-go')].filter(x => x.offsetParent && x.querySelector('.sb-go-h [data-gline]'))
      // the wave whose height leaves room for one more line under the bar: the shortest that fits
      const room = innerHeight - bar - 120
      let best = -1, bh = 1e9
      gs.forEach((g, i) => { const h = g.getBoundingClientRect().height; if (h < room && h < bh) { best = i; bh = h } })
      return best
    })
    if (gi < 0) throw new Error('N4: no wave short enough to show its foot with its head')
    await page.evaluate(gi => { const g = [...document.querySelectorAll('.sb-go')].filter(x => x.offsetParent)[gi]; g.scrollIntoView({ block: 'center' }) }, gi)
    await page.waitForTimeout(400)
    await pressLine(page, gi, 1)
    const info = await page.evaluate(gi => {
      const g = [...document.querySelectorAll('.sb-go')].filter(x => x.offsetParent)[gi]
      const fresh = [...g.querySelectorAll('.sb-line.sb-fresh')]
      const t = g.querySelector('.go-name, .sb-go-h .ntx, .sb-go-h')
      window.__mqFresh = fresh
      return { fresh: fresh.length, inView: window.__mqInView(fresh), wave: g.querySelector('.sb-go-h').innerText.replace(/\s+/g, ' ').trim().slice(0, 40) }
    }, gi)
    if (info.fresh !== 1 || info.inView !== 1) throw new Error('N4: ' + JSON.stringify(info))
    await page.evaluate(() => window.__mq.tag4(window.__mqFresh[0], 'N4', innerWidth < 600 ? 'br' : 'in'))
    const f = `N4-${sz}.png`
    await shot(page, f)
    figures[`N4-${sz}`] = info
    rec(f, 'N', sz, 'proposed', `142's Scheduler Board, the 1st wave brought up so its foot is already on screen. "+ Line" pressed once, for real: the new line lands in view at the foot, in the board's own just-added ring (mark N4). No count: you can already see it. Nothing is drawn in.`)
    notes.push(`N N4 ${sz}: ${JSON.stringify(info)}`)
    await ctx.close()
  }
}

const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
try {
  for (const sz of ['d', 'p']) for (const f of [itT, itJ, itG, itN]) {
    if (ONLY && !ONLY.includes(f.name)) continue
    try { await f(sz) } catch (e) { errs.push(`[${sz}] ${f.name} FAILED: ${e.message}`); console.log(f.name, 'FAILED', e.message) }
  }
} finally { await browser.close() }
// a partial run (MQ_ONLY) keeps the other pictures' records
const old = n => existsSync(`${OUT}/${n}`) ? JSON.parse(readFileSync(`${OUT}/${n}`, 'utf8')) : {}
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(ONLY ? { ...old('manifest.json'), ...manifest } : manifest, null, 2) + '\n')
writeFileSync(`${OUT}/figures.json`, JSON.stringify(ONLY ? { ...old('figures.json'), ...figures } : figures, null, 2) + '\n')
for (const f of readdirSync(OUT)) if (f.endsWith('.png')) copyFileSync(`${OUT}/${f}`, `${PAGEIMG}/${f}`)
console.log('NOTES\n' + notes.join('\n'))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
