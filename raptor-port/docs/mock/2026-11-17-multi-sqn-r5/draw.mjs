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
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs'

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
  window.__mq = mq
}

const manifest = {}, notes = [], errs = [], figures = {}
let browser
async function world(sz) {
  const ctx = await browser.newContext(SIZES[sz].opts)
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`) })
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  await page.goto(URL_)
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
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

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
try {
  for (const sz of ['d', 'p']) for (const f of [itT, itJ]) {
    try { await f(sz) } catch (e) { errs.push(`[${sz}] ${f.name} FAILED: ${e.message}`); console.log(f.name, 'FAILED', e.message) }
  }
} finally { await browser.close() }
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n')
writeFileSync(`${OUT}/figures.json`, JSON.stringify(figures, null, 2) + '\n')
for (const f of readdirSync(OUT)) if (f.endsWith('.png')) copyFileSync(`${OUT}/${f}`, `${PAGEIMG}/${f}`)
console.log('NOTES\n' + notes.join('\n'))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
