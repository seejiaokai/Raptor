// Multi-squadron & detachment — Round 1 question pictures (16 Nov 26).
// Draws the four Round 1 questions of docs/superpowers/specs/2026-11-16-multi-sqn-detachment-design.md on the REAL
// running app, today beside proposed, by the method in .claude/skills/brainstorming/mockups-on-the-real-app.md:
// each "today" frame is the app as it draws itself; each "proposed" frame applies ONE transform that clones a real
// neighbour (marked data-mine) or hides an app node (display:none, never removed). Marks are an outline on the element
// itself plus a small numbered tag inside it — never a box laid over the page.
//
// Run from raptor-port/, against a built preview already serving:  MQ_URL=http://localhost:4180/ node docs/mock/2026-11-16-multi-sqn-r1/draw.mjs
// Pictures and manifest.json go to docs/img/2026-11-16-multi-sqn-r1/.
// Demo data only. The squadrons are the bare numbers 142 and 149; the detachment is the invented "Exercise North".
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4180/'
const OUT = 'docs/img/2026-11-16-multi-sqn-r1'
mkdirSync(OUT, { recursive: true })

const SIZES = {
  d: { name: 'desktop', opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  // phone: width, height, touch and density emulated; nothing is ever TYPED on the phone (values set by script).
  p: { name: 'phone', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const DET = 'Exercise North'
const DET_TILL = 'till 31 Jul' // the demo week is 13 Jul; a three-week exercise ends about here

const MARK_CSS = `
.mkq { outline: 2px solid #ff2d95 !important; outline-offset: -2px !important; }
.mkq.mkq-o { outline-offset: 2px !important; }
.mkq-tag { position: absolute; z-index: 60; background: #ff2d95; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; }
.toast, .toasts, #toast { display: none !important; }
`

// In-page kit — defined by an init script so every page.evaluate can call it (code sent to the page has no module).
function kit() {
  const mq = {}
  mq.vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  mq.strip = root => {
    const A = ['id', 'data-inprow', 'data-inpedit', 'data-inp', 'data-txt', 'data-slot', 'data-fill', 'data-drag', 'data-inpseat',
      'tabindex', 'data-plangolive', 'data-plandup', 'data-avtog', 'data-planmenu', 'for']
    for (const n of [root, ...root.querySelectorAll('*')]) for (const a of A) n.removeAttribute(a)
    root.setAttribute('data-mine', '1')
    return root
  }
  mq.hide = e => { e.setAttribute('data-mqhid', '1'); e.style.setProperty('display', 'none', 'important') }
  mq.cleanPuck = p => { p.classList.remove('warn', 'hard', 'boxred', 'soft', 'sel', 'hl'); p.querySelectorAll('.lchip').forEach(x => x.remove()); return p }
  // where: 'in' — the tag inside the element's top-right corner; 'below' — under its right end (a one-line name on the
  // top bar, where a tag inside would cover its words)
  mq.mark = (el, label, where = 'in') => {
    if (where === 'right' && el.getAttribute('data-mine') === '1') el.style.width = 'fit-content' // my clone's own width, set before the measure
    const b = el.getBoundingClientRect()
    if (el.getAttribute('data-mine') === '1' && getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.classList.add('mkq'); if (where === 'below') el.classList.add('mkq-o')
    const t = document.createElement('span')
    t.className = 'mkq-tag'; t.textContent = label; t.setAttribute('data-mine', '1')
    if (where === 'below') { t.style.top = 'calc(100% + 4px)'; t.style.right = '0'; el.appendChild(t) }
    // the bar's name line is as wide as TALON under it: a short clone is drawn its own words' width, so the tag stands
    // just after the words (over the empty space above TALON's end), not over the next control
    else if (where === 'right') { el.classList.add('mkq-o'); t.style.top = '50%'; t.style.transform = 'translateY(-50%)'; t.style.left = 'calc(100% + 5px)'; el.appendChild(t) }
    else if (getComputedStyle(el).position !== 'static') { t.style.top = '1px'; t.style.right = '1px'; el.appendChild(t) }
    else el.insertBefore(t, el.firstChild) // absolute, auto offsets: sits at the content's top-left, takes no room
    const a = el.getBoundingClientRect()
    const same = ['x', 'y', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) < 0.5)
    if (!same) throw new Error('mark moved its element: ' + label)
    return true
  }
  // every tag inside every clipping ancestor
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
  mq.topH = () => document.querySelector('.topbar').getBoundingClientRect().bottom
  mq.scrollUnder = (el, gap) => { window.scrollTo(window.scrollX, window.scrollY + el.getBoundingClientRect().top - mq.topH() - gap) }
  mq.monday = () => [...document.querySelectorAll('#eWeek > .day')].find(d => mq.vis(d) && !d.classList.contains('peek'))
  window.__mq = mq
}

const manifest = {}
const notes = []
const errs = []
let browser

async function world(sz) {
  const ctx = await browser.newContext(SIZES[sz].opts)
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`); console.log('PAGEERROR', String(e)) })
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  await page.goto(URL_)
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a') // the sign-in card, before any phone frame
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(700)
  await page.addStyleTag({ content: MARK_CSS })
  return { ctx, page }
}
async function toEdit(page) {
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#page-editsched.on #eWeek .day')
  await page.waitForTimeout(900)
}
function rec(file, question, sz, kind, caption) {
  manifest[file] = { question, size: SIZES[sz].name, kind, caption }
}
async function shot(page, file, clip) {
  // premise: the page's own errors none so far for this frame is logged, not refused; marks must sit inside their clips
  const bad = await page.evaluate(() => window.__mq.checkTags())
  if (bad.length) throw new Error(file + ': ' + bad.join('; '))
  // park the pointer on the top bar's bare top edge, so no control is left hovered from the last tap
  await page.mouse.move(Math.round(page.viewportSize().width / 2), 1)
  await page.waitForTimeout(120)
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}) })
  console.log('  wrote', file)
}
async function clipOf(page, sel, pad = 6, extraH = 0) {
  return page.evaluate(({ sel, pad, extraH }) => {
    const e = typeof sel === 'string' ? document.querySelector(sel) : null
    const r = (e || window.__mqClipEl).getBoundingClientRect()
    const x = Math.max(0, r.left - pad), y = Math.max(window.__mq.topH(), r.top - pad)
    const w = Math.min(innerWidth - x, r.width + pad * 2), h = Math.min(innerHeight - y, r.height + pad * 2 + extraH)
    return { x, y, width: w, height: h }
  }, { sel, pad, extraH })
}

// ---------- the six people of the detachment: 3 pilots + 3 WSOs from Monday's first Available-crew group ----------
async function pickSix(page) {
  return page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday()
    const seen = new Set()
    const seats = [...mon.querySelectorAll('.sec-avail .seat[data-person]')].filter(s => !seen.has(s.dataset.person) && seen.add(s.dataset.person))
    const pil = seats.filter(s => !s.querySelector('.puck').classList.contains('r')).slice(0, 3)
    const wso = seats.filter(s => s.querySelector('.puck').classList.contains('r')).slice(0, 3)
    return [...pil, ...wso].map(s => ({ id: s.dataset.person, name: s.querySelector('.nm').textContent }))
  })
}

// ---------- 1: Q1, home side — the detached man under Unavailable ----------
async function pic1(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  const six = await pickSix(page)
  const man = await page.evaluate(six => {
    const mon = window.__mq.monday()
    const unav = mon.querySelector('.sec-unav')
    const away = new Set([...unav.querySelectorAll('[data-person]')].map(e => e.dataset.person))
    return six.find(p => !away.has(p.id))
  }, six)
  if (!man) throw new Error('no free man among the six')
  const info = await page.evaluate(() => {
    const mon = window.__mq.monday(); const unav = mon.querySelector('.sec-unav')
    window.__mqClipEl = unav
    window.__mq.scrollUnder(unav, 16)
    return { day: mon.querySelector('.dow, h2, h3')?.textContent || '', rows: [...unav.querySelectorAll('.pl-row')].map(r => [r.querySelector('.nm'), r.querySelector('.puck .nm'), r.querySelector('.rmk .ntx'), r.querySelector('.rk-till')].map(e => (e ? e.textContent : '').trim()).filter(Boolean).join(' · ')) }
  })
  if (!info.rows.length) throw new Error('Monday has no Unavailable row to clone')
  await page.waitForTimeout(300)
  // measure the proposed height first (inject, measure, take my clone away), so both frames share one crop
  const inject = () => page.evaluate(({ man, DET, DET_TILL }) => {
    const mq = window.__mq, mon = mq.monday(), unav = mon.querySelector('.sec-unav')
    const rows = [...unav.querySelectorAll('.pl-row:not([data-mine])')]
    const src = rows[rows.length - 1]
    const row = mq.strip(src.cloneNode(true))
    row.querySelectorAll('.latetag').forEach(x => x.remove())
    row.classList.remove('has-late')
    row.querySelector('.nm .ntx').textContent = 'DET'
    row.querySelector('.t-s').textContent = ''; row.querySelector('.t-e').textContent = ''
    const puckSrc = mon.querySelector(`.sec-avail .seat[data-person="${man.id}"] .puck`)
    const seat = row.querySelector('.seat')
    seat.innerHTML = ''; seat.appendChild(mq.cleanPuck(puckSrc.cloneNode(true)))
    const rk = row.querySelector('.rmk'); rk.classList.remove('has-late')
    rk.querySelector('.ntx').textContent = DET
    const till = rk.querySelector('.rk-till'); if (till) till.textContent = DET_TILL
    src.after(row)
    mq.mark(row, '1')
    return row.outerHTML.length
  }, { man, DET, DET_TILL })
  await inject()
  const hProp = await page.evaluate(() => window.__mqClipEl.getBoundingClientRect().height)
  await page.evaluate(() => document.querySelectorAll('.sec-unav [data-mine]').forEach(e => e.remove()))
  const hToday = await page.evaluate(() => window.__mqClipEl.getBoundingClientRect().height)
  const clip = await clipOf(page, null, 6, hProp - hToday)
  const top = await page.evaluate(c => { const e = document.elementFromPoint(c.x + 20, c.y + 8); return !!e && !!e.closest('.sec-unav') }, clip)
  if (!top) throw new Error('pic1: something sits over the crop top')
  const f0 = `1-q1-det-home-${sz}-today.png`, f1 = `1-q1-det-home-${sz}-proposed.png`
  await shot(page, f0, clip)
  rec(f0, 'Q1', sz, 'today', `Real. Edit Schedule, ${info.day.trim() || 'Monday'} 13 Jul, the day's Unavailable list as the app draws it today: ${info.rows.join(' / ')}.`)
  await inject()
  if (!(await page.locator('.sec-unav .pl-row[data-mine]').count())) throw new Error('pic1 premise lost')
  await shot(page, f1, clip)
  rec(f1, 'Q1', sz, 'proposed', `Drawn in (mark 1): one Unavailable row cloned from the real "${info.rows[info.rows.length - 1].split(' · ')[0]}" row above it (its puck swapped for ${man.name}'s own, cloned from the day's Available crew), for ${man.name} (one of the six sent away), reading "DET · ${DET} · ${DET_TILL}" — DET in the kind column, the detachment's name in the remarks, its end in the app's own "till" words. Everything else is real.`)
  notes.push(`pic1 ${sz}: detached man ${man.name}; six = ${six.map(p => p.name).join(', ')}`)
  await ctx.close()
  return six
}

// ---------- 2: Q1, the detachment's own schedule — the bar says whose it is, the crew list holds only its six ----------
async function pic2(sz, six) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  const before = await page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday(), av = mon.querySelector('.sec-avail')
    mq.scrollUnder(av, 10)
    return { k: document.querySelector('.topbar .mark .k').textContent, n: av.querySelectorAll('.seat[data-person]').length,
      grp: [...av.querySelectorAll('.ap-grp')].map(g => g.textContent.trim()) }
  })
  if (before.k !== '142') throw new Error('pic2 premise: top bar reads ' + before.k)
  await page.waitForTimeout(300)
  const f0 = `2-q1-det-own-${sz}-today.png`, f1 = `2-q1-det-own-${sz}-proposed.png`
  await shot(page, f0)
  rec(f0, 'Q1', sz, 'today', `Real. Edit Schedule, Monday 13 Jul: the top bar reads "142 TALON"; the day's Available crew list shows ${before.n} people in ${before.grp.length} groups (${before.grp.join(' / ')})${sz === 'd' ? ', and the AIRCREW panel on the right lists the whole squadron' : ''}.`)
  const ids = six.map(p => p.id)
  const meas = await page.evaluate(({ ids, DET }) => {
    const mq = window.__mq, mon = mq.monday(), av = mon.querySelector('.sec-avail')
    // the bar: the real "142" line hidden, a clone of it reading the detachment
    const k = document.querySelector('.topbar .mark .k')
    const k2 = mq.strip(k.cloneNode(true)); k2.textContent = '142 DET · ' + DET
    mq.hide(k); k.after(k2); mq.mark(k2, '2a', 'below')
    // the day's Available crew: everyone but the six hidden; each group's count re-lettered on a clone
    for (const s of av.querySelectorAll('.seat[data-person]')) if (!s.closest('[data-mine]') && !ids.includes(s.dataset.person)) mq.hide(s)
    for (const g of [...av.querySelectorAll('.ap-grp:not([data-mine])')]) {
      const grid = g.nextElementSibling
      const n = grid ? [...grid.querySelectorAll('.seat[data-person]')].filter(mq.vis).length : 0
      const g2 = mq.strip(g.cloneNode(true)) // cloned BEFORE hiding, or the clone carries the display:none
      mq.hide(g)
      if (!n) { if (grid) mq.hide(grid); continue }
      // the heading's count is the last figure of its own words ("· 15 can fly", "Available all day · 11")
      const tn = [...g2.childNodes].reverse().find(x => x.nodeType === 3 && /\d/.test(x.textContent))
      if (tn) tn.textContent = tn.textContent.replace(/\d+(?=\D*$)/, String(n))
      g.after(g2)
    }
    mq.mark(av, '2b')
    // the desktop's AIRCREW panel lists the same people: the same six only, its counts re-lettered
    const ros = document.querySelector('#eRoster')
    let rosN = null
    // only where the panel is open (the desktop); on a phone it is the folded AIRCREW tab at the edge
    if (mq.vis(ros) && ros.getBoundingClientRect().width > 150) {
      for (const e of ros.querySelectorAll('.rcol .rpuck[data-person]')) if (!ids.includes(e.dataset.person)) mq.hide(e)
      // SANS Avail and Personnel are home people: the detachment's panel has neither section
      for (const s of ros.querySelectorAll('.rall.rsans, .rall.rpers')) mq.hide(s)
      rosN = []
      for (const h of [...ros.querySelectorAll('.rcol > .rh:not([data-mine])')]) {
        const col = h.parentElement
        const n = new Set([...col.querySelectorAll('.rpuck[data-person]')].filter(mq.vis).map(e => e.dataset.person)).size
        const h2 = mq.strip(h.cloneNode(true)); h2.textContent = h.textContent.replace(/\d+ free/i, n + ' free')
        mq.hide(h); h.after(h2); rosN.push(h2.textContent)
      }
      mq.mark(ros, '2c')
    }
    // does the longer bar name reach the next control on the bar?
    const kr = k2.getBoundingClientRect()
    const next = [...document.querySelectorAll('.topbar > *')].filter(e => mq.vis(e) && !e.classList.contains('mark') && !e.classList.contains('burger'))
      .map(e => e.getBoundingClientRect()).filter(r => r.left > kr.left).sort((a, b) => a.left - b.left)[0]
    const shown = [...av.querySelectorAll('.seat[data-person]')].filter(mq.vis).map(s => s.dataset.person)
    return { kRight: Math.round(kr.right), nextLeft: next ? Math.round(next.left) : null, shown: [...new Set(shown)].length, rosN }
  }, { ids, DET })
  if (meas.shown !== six.length && meas.shown > six.length) throw new Error('pic2: more than six left in the list')
  await page.waitForTimeout(150)
  if (!(await page.locator('.topbar .k[data-mine]').count())) throw new Error('pic2 premise lost')
  await shot(page, f1)
  const gap = meas.nextLeft == null ? 'no control beside it' : (meas.nextLeft - meas.kRight) + 'px clear of the next control on the bar'
  rec(f1, 'Q1', sz, 'proposed', `Drawn in. Mark 2a: the bar's small squadron line (a clone of the real "142" line) reads "142 DET · ${DET}" — ${gap}. Mark 2b: the day's Available crew list with everyone but the detachment's six hidden (${six.map(p => p.name).join(', ')}), each group's "can fly" count re-lettered to the people left${sz === 'd' ? `; mark 2c: the AIRCREW panel likewise, its counts re-lettered (${(meas.rosN || []).join(' / ')}) and its SANS Avail and Personnel sections hidden (home people)` : ''}. The rest of the day (waves, programme, the day's own SANS Avail and Unavailable) is still 142's home plan — not drawn.`)
  notes.push(`pic2 ${sz}: bar name right edge ${meas.kRight}px, next control at ${meas.nextLeft}px; people left in list ${meas.shown}`)
  await ctx.close()
}

// ---------- 3a: Q2, 142's side — a man of 142's morning wave lent to 149 for the afternoon ----------
async function pic3a(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  const info = await page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday()
    const g = mon.querySelector('.sec-grnd')
    // a man of Monday's first wave — not the signed-in scheduler himself
    const me = (document.querySelector('#roleBadge')?.textContent || '').split('·')[0].trim()
    const seat = [...mon.querySelectorAll('[data-slot^="0.0."] .puck[data-person]')].find(p => p.querySelector('.nm')?.textContent.trim() !== me)
    if (!g || !seat) return null
    window.__mqClipEl = g
    mq.scrollUnder(g, 16)
    return { id: seat.dataset.person, name: seat.querySelector('.nm').textContent, slot: seat.closest('[data-slot]').dataset.slot,
      rows: [...g.querySelectorAll('.pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()) }
  })
  if (!info || !info.rows.length) throw new Error('pic3a premise: Monday has no Ground Programme rows or no wave-1 crew')
  await page.waitForTimeout(300)
  const inject = () => page.evaluate(({ id }) => {
    const mq = window.__mq, mon = mq.monday(), g = mon.querySelector('.sec-grnd')
    const rows = [...g.querySelectorAll('.pl-row:not([data-mine])')]
    const src = rows.find(r => r.querySelectorAll('.seat').length === 1 && !r.classList.contains('gr-frominput')) || rows[0]
    const row = mq.strip(src.cloneNode(true))
    row.querySelectorAll('.addz').forEach(x => x.remove())
    row.querySelector('.nm .ntx').textContent = 'WITH 149 · ACADEMICS'
    row.querySelector('.t-s').textContent = '14:00'; row.querySelector('.t-e').textContent = '16:00'
    const rk = row.querySelector('.rmk .ntx'); if (rk) rk.textContent = ''
    const seat = row.querySelector('.seat')
    seat.innerHTML = ''; seat.appendChild(mq.cleanPuck(mon.querySelector(`[data-slot^="0.0."] .puck[data-person="${id}"]`).cloneNode(true)))
    // in time order, as the Ground Programme lists
    const after = rows.filter(r => (r.querySelector('.t-s')?.textContent || '') && r.querySelector('.t-s').textContent > '14:00')[0]
    if (after) after.before(row); else rows[rows.length - 1].after(row)
    mq.mark(row, '3a')
    return src.querySelector('.nm').innerText
  }, { id: info.id })
  const srcName = await inject()
  const hProp = await page.evaluate(() => window.__mqClipEl.getBoundingClientRect().height)
  await page.evaluate(() => document.querySelectorAll('.sec-grnd [data-mine]').forEach(e => e.remove()))
  const hToday = await page.evaluate(() => window.__mqClipEl.getBoundingClientRect().height)
  const clip = await clipOf(page, null, 6, hProp - hToday)
  const f0 = `3a-q2-lend-142-${sz}-today.png`, f1 = `3a-q2-lend-142-${sz}-proposed.png`
  await shot(page, f0, clip)
  rec(f0, 'Q2', sz, 'today', `Real. 142's Edit Schedule, Monday 13 Jul, the Ground Programme as drawn today. ${info.name} flies Monday's first wave (his seat is on wave 1 — not in this crop).`)
  await inject()
  if (!(await page.locator('.sec-grnd .pl-row[data-mine]').count())) throw new Error('pic3a premise lost')
  await shot(page, f1, clip)
  rec(f1, 'Q2', sz, 'proposed', `Drawn in (mark 3a): a Ground Programme row cloned from the real "${srcName.trim()}" row, put in time order, reading "WITH 149 · ACADEMICS" (capitals, as the Ground Programme's names are typed), 14:00–16:00, with ${info.name}'s own puck — what 142 would see once 149 borrows him for the afternoon. Cloned from a ground row (not an Unavailable row), since he is still 142's for the rest of the day.`)
  notes.push(`pic3a ${sz}: lent man ${info.name} (${info.slot})`)
  await ctx.close()
  return info
}

// ---------- 3b: Q2, 149's side — a "142" group in 149's Available crew list ----------
async function pic3b(sz, lent) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  const pick = await page.evaluate(({ lentId }) => {
    const mq = window.__mq, mon = mq.monday(), av = mon.querySelector('.sec-avail')
    const seats = [...av.querySelectorAll('.seat[data-person]')]
    const ids = [lentId]
    for (const s of seats.slice().reverse()) { if (ids.length >= 3) break; if (!ids.includes(s.dataset.person)) ids.push(s.dataset.person) }
    const names = ids.map(id => (mon.querySelector(`.puck[data-person="${id}"] .nm`) || {}).textContent)
    return { ids, names }
  }, { lentId: lent.id })
  const inject = () => page.evaluate(({ ids }) => {
    const mq = window.__mq, mon = mq.monday(), av = mon.querySelector('.sec-avail')
    const k = document.querySelector('.topbar .mark .k')
    if (!document.querySelector('.topbar .k[data-mine]')) { const k2 = mq.strip(k.cloneNode(true)); k2.textContent = '149'; mq.hide(k); k.after(k2); mq.mark(k2, '3b', 'right') }
    // the three hidden from 149's own groups (in this drawing they stand for 149's crew) ...
    for (const s of av.querySelectorAll('.seat[data-person]')) if (!s.closest('[data-mine]') && ids.includes(s.dataset.person)) mq.hide(s)
    // ... and shown in a group of their own, headed "142", cloned from the real group heading and grid
    const grps = [...av.querySelectorAll('.ap-grp:not([data-mine])')]
    const g = grps[grps.length - 1], grid = g.nextElementSibling
    const g2 = mq.strip(g.cloneNode(true)); g2.textContent = `142 · ${ids.length} free`
    const grid2 = mq.strip(grid.cloneNode(false))
    for (const id of ids) {
      const s = [...av.querySelectorAll(`.seat[data-person="${id}"]`)].find(x => !x.closest('[data-mine]')) || mon.querySelector(`.seat [data-person="${id}"]`)?.closest('.seat')
      const s2 = mq.strip(s.cloneNode(true)); s2.style.removeProperty('display'); s2.removeAttribute('data-mqhid')
      mq.cleanPuck(s2.querySelector('.puck')); grid2.appendChild(s2)
    }
    const wrap = document.createElement('div'); wrap.setAttribute('data-mine', '1'); wrap.className = 'mq-grp142'
    wrap.append(g2, grid2)
    let last = av.lastElementChild; while (last && !(last.classList.contains('ap-grid'))) last = last.previousElementSibling
    ;(last || grid).after(wrap)
    mq.mark(wrap, '3c')
    // a group above that lost one of the three has its count re-lettered on a clone of its heading
    for (const h of [...av.querySelectorAll('.ap-grp:not([data-mine])')]) {
      const hg = h.nextElementSibling
      if (!hg || !hg.querySelector('.seat[data-mqhid]') || h.hasAttribute('data-mqhid')) continue
      const n = [...hg.querySelectorAll('.seat[data-person]')].filter(mq.vis).length
      const h2 = mq.strip(h.cloneNode(true))
      const tn = [...h2.childNodes].reverse().find(x => x.nodeType === 3 && /\d/.test(x.textContent))
      if (tn) tn.textContent = tn.textContent.replace(/\d+(?=\D*$)/, String(n))
      mq.hide(h); h.after(h2)
    }
    return true
  }, { ids: pick.ids })
  // place the scroll with the group in, so the group sits in view in both frames
  await inject()
  await page.evaluate(() => {
    const mq = window.__mq, w = document.querySelector('.mq-grp142')
    const r = w.getBoundingClientRect()
    window.scrollTo(window.scrollX, window.scrollY + r.bottom - innerHeight + 60)
    const av = mq.monday().querySelector('.sec-avail')
    // keep the list's head in view where the screen allows it
    const ar = av.getBoundingClientRect()
    if (ar.top < mq.topH() + 8 && (r.bottom - ar.top) < innerHeight - mq.topH() - 70) mq.scrollUnder(av, 10)
  })
  const y = await page.evaluate(() => window.scrollY)
  // take every drawn part away (unhide what I hid) for the today frame, at the same scroll
  await page.evaluate(() => {
    document.querySelectorAll('[data-mine]').forEach(e => { if (!e.classList.contains('mkq-tag') || true) e.remove() })
    document.querySelectorAll('[data-mqhid]').forEach(e => { e.style.removeProperty('display'); e.removeAttribute('data-mqhid') })
    document.querySelectorAll('.mkq').forEach(e => e.classList.remove('mkq'))
  })
  await page.evaluate(y => window.scrollTo(window.scrollX, y), y)
  await page.waitForTimeout(300)
  const f0 = `3b-q2-lend-149-${sz}-today.png`, f1 = `3b-q2-lend-149-${sz}-proposed.png`
  await shot(page, f0)
  rec(f0, 'Q2', sz, 'today', `Real. Edit Schedule, Monday 13 Jul, the day's Available crew list as drawn today, the top bar reading "142 TALON". (There is no 149 in the app yet: in the proposed frame this screen stands in for 149's.)`)
  await inject()
  await page.evaluate(y => window.scrollTo(window.scrollX, y), y)
  await page.waitForTimeout(150)
  if (!(await page.locator('.mq-grp142').count())) throw new Error('pic3b premise lost')
  await shot(page, f1)
  rec(f1, 'Q2', sz, 'proposed', `Drawn in. Mark 3b: the bar's squadron line (a clone of the real one) reads "149" — this stands for 149's own Edit Schedule. Mark 3c: a group added at the foot of the Available crew list, its heading cloned from the real wave heading above it and re-lettered "142 · 3 free", holding ${pick.names.join(', ')} (cloned pucks; ${pick.names[0]} flies 142's first wave and the other two were in the groups above, which stand for 149's own crew — hidden there, that group's count re-lettered). The AIRCREW panel on the desktop is not drawn: it still lists them as before.`)
  await ctx.close()
}

// ---------- 4: Q3, Admin -> Users, a member's editor with one added tick ----------
async function pic4(sz) {
  const { ctx, page } = await world(sz)
  await page.evaluate(() => window.go('admin'))
  await page.waitForSelector('#page-admin.on button.acc-main', { state: 'attached' })
  await page.waitForTimeout(500)
  // on a phone Admin opens on its list of areas: tap Users
  if (!(await page.locator('#page-admin button.acc-main').first().isVisible())) {
    await page.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first().click()
    await page.waitForSelector('#page-admin.on button.acc-main')
    await page.waitForTimeout(500)
  }
  if (sz === 'd') {
    // the source of the clone: the real switch at the foot of Users, pictured as it is
    await page.evaluate(() => { const l = document.querySelector('#page-admin label.acc-switch'); window.__mqClipEl = l; window.__mq.scrollUnder(l, 120) })
    await page.waitForTimeout(250)
    const c = await clipOf(page, null, 12)
    const fs = '4-q3-src-real-switch-desktop.png'
    await shot(page, fs, c)
    rec(fs, 'Q3', sz, 'today', 'Real. The switch the added tick row is cloned from: Admin → Users\' own "Let people waiting for access view the schedule (read only)" switch, at the foot of the Users list.')
  }
  await page.locator('#page-admin button.acc-main', { hasText: /^Hex/ }).first().click()
  await page.waitForTimeout(600)
  const ok = await page.evaluate(() => {
    const mq = window.__mq
    const save = [...document.querySelectorAll('#page-admin button')].find(b => mq.vis(b) && b.textContent.trim() === 'Save')
    if (!save) return null
    let ed = save.parentElement
    while (ed && !ed.querySelector('button.acc-main')) ed = ed.parentElement
    window.__mqClipEl = ed; window.__mqSave = save
    document.activeElement && document.activeElement.blur && document.activeElement.blur()
    mq.scrollUnder(ed, 24)
    return { role: (ed.querySelector('select') || {}).value, txt: ed.innerText.replace(/\s+/g, ' ').slice(0, 120) }
  })
  if (!ok) throw new Error('pic4: Hex editor did not open')
  // tap a neutral spot (the admin page heading area) so nothing is left focused
  await page.waitForTimeout(250)
  const inject = () => page.evaluate(() => {
    const mq = window.__mq
    const src = document.querySelector('#page-admin label.acc-switch')
    const l = mq.strip(src.cloneNode(true))
    const inp = l.querySelector('input'); inp.checked = true; inp.setAttribute('checked', '')
    l.querySelector('span').textContent = "May view 149's schedule (read only)"
    window.__mqSave.parentElement.before(l)
    mq.mark(l, '4')
    return true
  })
  await inject()
  const hProp = await page.evaluate(() => window.__mqClipEl.getBoundingClientRect().height)
  await page.evaluate(() => document.querySelectorAll('#page-admin [data-mine]').forEach(e => e.remove()))
  const hToday = await page.evaluate(() => window.__mqClipEl.getBoundingClientRect().height)
  const clip = await clipOf(page, null, 8, hProp - hToday)
  const f0 = `4-q3-view-rights-${sz}-today.png`, f1 = `4-q3-view-rights-${sz}-proposed.png`
  await shot(page, f0, clip)
  rec(f0, 'Q3', sz, 'today', 'Real. Admin → Users, the member Hex\'s editor open as the app draws it: sign-in, role, then Save / Suspend / Archive / Delete / Cancel — no tick rows today.')
  await inject()
  if (!(await page.locator('#page-admin label.acc-switch[data-mine]').count())) throw new Error('pic4 premise lost')
  await shot(page, f1, clip)
  rec(f1, 'Q3', sz, 'proposed', `Drawn in (mark 4): one tick row, ticked, "May view 149's schedule (read only)", above the editor's buttons — cloned from the Users page's own switch (the waiting-for-access one, pictured separately). The member editor has no tick of its own today, so where it sits is a design choice.`)
  await ctx.close()
}

// ---------- 5: Q4, the squadron name on the top bar as a picker ----------
async function pic5(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(250)
  const clip = sz === 'd' ? { x: 0, y: 0, width: 720, height: 300 } : { x: 0, y: 0, width: 390, height: 330 }
  const f0 = `5-q4-picker-${sz}-today.png`, f1 = `5-q4-picker-${sz}-proposed.png`
  await shot(page, f0, clip)
  rec(f0, 'Q4', sz, 'today', 'Real. The top bar today: the squadron name "142 TALON" is a plain title, not a control.')
  // the nearest REAL interaction: open the plans selector on Monday's top bar and take its menu's markup
  await page.locator('#page-editsched .day .planselbtn').first().click()
  await page.waitForSelector('.wavemenu')
  await page.waitForTimeout(300)
  const menuClip = await page.evaluate(() => {
    const m = document.querySelector('.wavemenu'); const b = document.querySelector('#page-editsched .planselbtn').getBoundingClientRect(); const r = m.getBoundingClientRect()
    const x = Math.max(0, Math.min(r.left, b.left) - 10), y = Math.max(0, b.top - 10)
    return { x, y, width: Math.min(innerWidth - x, Math.max(r.right, b.right) - x + 10), height: r.bottom - y + 10 }
  })
  const fs = `5-q4-src-real-plans-menu-${sz}.png`
  await shot(page, fs, menuClip)
  rec(fs, 'Q4', sz, 'today', 'Real. The menu the picker is cloned from: the plans selector ("Live working copy ▾") on a day\'s top bar, opened by a real tap.')
  await page.evaluate(() => { window.__mqMenu = document.querySelector('.wavemenu').cloneNode(true) })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  // the plans button keeps the keyboard's ring after Escape: the drawn flow never touches it, so let go of it
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur())
  if (await page.locator('.wavemenu').count()) { await page.mouse.click(sz === 'd' ? 900 : 200, sz === 'd' ? 150 : 210); await page.waitForTimeout(250) }
  if (await page.locator('.wavemenu').count()) throw new Error('pic5: the real plans menu did not close')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(200)
  const m = await page.evaluate(({ DET }) => {
    const mq = window.__mq
    const k = document.querySelector('.topbar .mark .k')
    const k2 = mq.strip(k.cloneNode(true)); k2.textContent = '142 ▾'
    mq.hide(k); k.after(k2); mq.mark(k2, '5a', 'right')
    const menu = mq.strip(window.__mqMenu)
    const rows = [...menu.querySelectorAll('.wm-row')]
    const selRow = rows.find(r => r.querySelector('.wm.sa')), plainRow = rows.find(r => r.querySelector('.wm:not(.sa)'))
    menu.querySelector('h5').textContent = 'Schedules'
    const mk = (tpl, text) => { const r = tpl.cloneNode(true); const b = r.querySelector('.wm'); b.textContent = text; b.style.textAlign = 'left'; return r }
    const r1 = mk(selRow, '142 ●'), r2 = mk(plainRow, '142 DET · ' + DET), r3 = mk(plainRow, '149 · view only')
    rows.forEach(r => r.remove())
    menu.append(r1, r2, r3)
    const mark = document.querySelector('.topbar .mark').getBoundingClientRect()
    menu.style.left = Math.round(mark.left) + 'px'
    menu.style.top = Math.round(mq.topH() + 4) + 'px'
    document.body.appendChild(menu)
    mq.mark(menu, '5b')
    const r = menu.getBoundingClientRect()
    return { w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom), right: Math.round(r.right) }
  }, { DET })
  if (m.bottom > clip.height || m.right > clip.width) clip.height = Math.max(clip.height, m.bottom + 12), clip.width = Math.min(SIZES[sz].opts.viewport.width, Math.max(clip.width, m.right + 12))
  await page.waitForTimeout(150)
  if (!(await page.locator('.wavemenu[data-mine]').count())) throw new Error('pic5 premise lost')
  await shot(page, f1, clip)
  // the today frame used the smaller clip if the menu grew it: retake today at the same clip
  if (manifest[f0]) {
    await page.evaluate(() => { document.querySelectorAll('[data-mine]').forEach(e => e.remove()); document.querySelectorAll('[data-mqhid]').forEach(e => { e.style.removeProperty('display'); e.removeAttribute('data-mqhid') }) })
    await page.waitForTimeout(150)
    await shot(page, f0, clip)
  }
  rec(f1, 'Q4', sz, 'proposed', `Drawn in. Mark 5a: the bar's squadron line (a clone of the real "142") reads "142 ▾". Mark 5b: its menu open under it, a clone of the plans selector's menu (heading re-lettered "Schedules"; the current row in that menu's own picked look with its ●): "142" (current), "142 DET · ${DET}", "149 · view only".`)
  notes.push(`pic5 ${sz}: menu ${m.w}x${m.h}`)
  await ctx.close()
}

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
try {
  for (const sz of ['d', 'p']) {
    console.log('== ' + SIZES[sz].name)
    const six = await pic1(sz)
    await pic2(sz, six)
    const lent = await pic3a(sz)
    await pic3b(sz, lent)
    await pic4(sz)
    await pic5(sz)
  }
} finally {
  await browser.close()
}
const sorted = Object.fromEntries(Object.keys(manifest).sort().map(k => [k, manifest[k]]))
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(sorted, null, 2) + '\n')
console.log('NOTES\n' + notes.join('\n'))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
