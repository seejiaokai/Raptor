// The schedule's held small fixes — pictures (the night of 17 Nov 26, job 3): eight backlog items each drawn on the REAL
// running app, today beside proposed, by .claude/skills/brainstorming/mockups-on-the-real-app.md. The kit, world(),
// rec() and shot() are the multi-squadron round 3's (docs/mock/2026-11-17-multi-sqn-r3/draw.mjs, on its own branch).
// Each "today" frame is the app as it draws itself. Each "proposed" frame clones a real neighbour (marked data-mine) or
// hides an app node (display:none, never removed); where a clone's words change, the page names it.
// Setting up a published day uses the app's own calls, as the browser tests do (e2e/availwin.spec.ts publishedBoard):
// the four sign-offs filled and the day approved — the same state the Publish day button leaves.
//
// Run from raptor-port/, against a built preview already serving:  MQ_URL=http://localhost:4180/ node docs/mock/2026-11-17-held-fixes/draw.mjs
// MQ_ONLY=pic1,pic5 draws only those. Pictures and manifest.json go to docs/img/2026-11-17-held-fixes/. Demo data only.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4180/'
const OUT = 'docs/img/2026-11-17-held-fixes'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
mkdirSync(OUT, { recursive: true })

const SIZES = {
  d: { name: 'desktop', opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}

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
    const A = ['id', 'data-txt', 'data-slot', 'data-fill', 'data-drag', 'tabindex', 'data-testid', 'contenteditable', 'data-bfld',
      'data-wdi', 'data-wix', 'data-woff', 'data-chgday', 'data-pendlist', 'data-vwork', 'data-dayinfo']
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
    if (where === 'pad') el.classList.add('mkq-p')
    if (where === 'float') el.classList.add('mkq-o')
    if (where === 'floatin') el.classList.add('mkq')
    if (where === 'floatl') el.classList.add('mkq-o')
    const t = document.createElement('span')
    t.className = 'mkq-tag'; t.textContent = label; t.setAttribute('data-mine', '1')
    // 'float': the tag on the page itself, over the part's top right corner — for a part inside a box that clips
    // (a chip in a day column) or one that holds no children (a text box)
    if (where === 'floatl') { const r = el.getBoundingClientRect(); t.style.position = 'fixed'; t.style.zIndex = '99999'; document.body.appendChild(t); t.style.left = Math.round(r.left - t.offsetWidth - 6) + 'px'; t.style.top = Math.round(r.top + 2) + 'px' }
    else if (where === 'floatin') { const r = el.getBoundingClientRect(); t.style.position = 'fixed'; t.style.zIndex = '99999'; document.body.appendChild(t); t.style.left = Math.round(r.right - t.offsetWidth - 4) + 'px'; t.style.top = Math.round(r.top + 3) + 'px' }
    else if (where === 'float') { const r = el.getBoundingClientRect(); t.style.position = 'fixed'; t.style.zIndex = '99999'; t.style.left = Math.round(r.right - 6) + 'px'; t.style.top = Math.round(r.top - 15) + 'px'; document.body.appendChild(t) }
    else if (where === 'pad') { if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; t.style.top = '-12px'; t.style.right = '-10px'; el.appendChild(t) }
    else if (where === 'below') { t.style.top = 'calc(100% + 4px)'; t.style.right = '0'; el.appendChild(t) }
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
  // the app's ask card (ui/AskCard.tsx's markup, its global stylesheet), hung under a control, its pointer on the control
  mq.ask = (at, q, btns) => {
    const c = document.createElement('div'); c.className = 'askcard ac-below'; c.setAttribute('data-mine', '1'); c.setAttribute('role', 'alertdialog')
    c.innerHTML = '<span class="askcard-q"></span><span class="askcard-btns"></span>'
    c.querySelector('.askcard-q').textContent = q
    for (const [t, k] of btns) { const b = document.createElement('button'); b.type = 'button'; b.className = 'abtn' + (k ? ' ' + k : ''); b.textContent = t; c.querySelector('.askcard-btns').appendChild(b) }
    c.style.position = 'fixed'; c.style.zIndex = '9999'
    document.body.appendChild(c)
    const r = at.getBoundingClientRect(), W = c.offsetWidth
    const mid = (r.left + r.right) / 2
    let left = Math.min(Math.max(r.right - W, 8), innerWidth - W - 8)
    c.style.left = left + 'px'; c.style.top = (r.bottom + 8) + 'px'
    const o2 = c.getBoundingClientRect(); c.style.left = (left - (o2.left - left)) + 'px'; c.style.top = (r.bottom + 8 - (o2.top - r.bottom - 8)) + 'px'
    c.style.setProperty('--ac-px', Math.round(Math.min(Math.max(mid - left, 14), W - 14)) + 'px')
    at.style.outline = '2px solid var(--accent)'; at.style.outlineOffset = '1px'
    return c
  }
  window.__mq = mq
}

const manifest = {}
const notes = []
const errs = []
let browser

async function world(sz, { toasts = false, init } = {}) {
  const ctx = await browser.newContext(SIZES[sz].opts)
  await ctx.addInitScript(kit)
  if (init) await ctx.addInitScript(init)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`); console.log('PAGEERROR', String(e)) })
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  await page.goto(URL_)
  await login(page, toasts)
  return { ctx, page }
}
async function login(page, toasts) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(700)
  await page.addStyleTag({ content: MARK_CSS + (toasts ? '' : TOAST_CSS) })
}
async function toEdit(page) {
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#page-editsched.on #eWeek .day')
  await page.waitForTimeout(900)
}
async function toBoard(page, di) {
  await toEdit(page)
  await page.evaluate(di => document.querySelector(`#eWeek .day:not(.peek) [data-sbday="${di}"]`).click(), di)
  await page.waitForSelector('#schedBoard:not([hidden]) [data-gline]')
  await page.waitForTimeout(1200)
}
// a published Monday, as the app's tests set one up: the four sign-offs and the day approved (the Publish day state)
async function publishMonday(page, { al } = {}) {
  const r = await page.evaluate(al => {
    const w = window
    const sign = () => { const g = w.signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
    sign(); w.setDayApproved(0, true); w.afterSchedMutate()
    let out = { v0: w.dayCurVer(0) }
    // an amendment: one time changed, the day signed again, AL1 published
    if (al) { w.txtSet('ap:0.0.end', '17:10'); w.afterSchedMutate(); sign(); w.publishALDay(0); out.v1 = w.dayCurVer(0) }
    w.afterSchedMutate()
    return out
  }, al)
  notes.push('publishMonday ' + JSON.stringify(r))
  await page.waitForTimeout(600)
}
function rec(file, question, sz, kind, caption) { manifest[file] = { question, size: SIZES[sz].name, kind, caption } }
// on a desktop, a picture is cut to what its question is about (D1222) — the same cut for its today and proposed
const DCLIPS = {
  '3-plural-insights-': { x: 460, y: 60, width: 620, height: 150 },
  '3-plural-panel-': { x: 500, y: 135, width: 536, height: 645 },
  '4-banner-': { x: 1210, y: 95, width: 326, height: 310 },
  '5-changes-': { x: 0, y: 80, width: 1120, height: 230 },
  '6-damaged-delete-': { x: 300, y: 620, width: 940, height: 244 },
  '7-original-': { x: 0, y: 0, width: 1120, height: 290 },
  '8-cutoff-': { x: 590, y: 60, width: 946, height: 545 },
}
async function shot(page, file, clip) {
  const bad = await page.evaluate(() => window.__mq.checkTags())
  if (bad.length) throw new Error(file + ': ' + bad.join('; '))
  if (!clip && page.viewportSize().width > 700) { const k = Object.keys(DCLIPS).find(p => file.startsWith(p)); if (k) clip = DCLIPS[k] }
  if (clip) {
    // every mark and tag must sit wholly inside the cut
    const out = await page.evaluate(c => [...document.querySelectorAll('.mkq, .mkq-tag')].map(e => e.getBoundingClientRect())
      .filter(r => r.width && (r.left < c.x - 1 || r.top < c.y - 1 || r.right > c.x + c.width + 1 || r.bottom > c.y + c.height + 1))
      .map(r => `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`), clip)
    if (out.length) throw new Error(file + ': a mark outside the cut: ' + out.join('; '))
  }
  await page.mouse.move(Math.round(page.viewportSize().width / 2), 1)
  await page.waitForTimeout(120)
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}) })
  console.log('  wrote', file)
}
// a clip round an element (with a margin), kept inside the screen
async function clipOf(page, sel, m = 16, minH = 0) {
  const r = await page.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height } }, sel)
  const vw = page.viewportSize().width, vh = page.viewportSize().height
  const x = Math.max(0, r.x - m), y = Math.max(0, r.y - m)
  return { x, y, width: Math.min(vw - x, r.w + 2 * m), height: Math.min(vh - y, Math.max(minH, r.h + 2 * m)) }
}

// ---------- 1. a WSO in a BB front seat with no times ----------
async function pic1(sz) {
  for (const which of ['today', 'proposed']) {
    const { ctx, page } = await world(sz)
    await toBoard(page, 1)
    const wi = await page.evaluate(() => window.DAYS[1].waves.length)
    await page.evaluate(() => document.querySelector('#schedBoard [data-wvadd="1"]').click()); await page.waitForTimeout(400)
    await page.evaluate(() => document.querySelector('.wavemenu [data-wmkind="bb"]').click()); await page.waitForTimeout(900)
    // Echo, a WSO, dropped in the first MAIN line's front seat — the line's START and END blank, as "+ Wave" makes it
    await page.evaluate(wi => { window.fillSlot(`1.${wi}.0.0.p`, 'freak'); window.afterSchedMutate() }, wi); await page.waitForTimeout(700)
    await page.evaluate(() => { const w = document.querySelector('#schedBoard .sbwrap'); if (w && !w.classList.contains('open')) w.querySelector('[data-sbwtog]').click() }); await page.waitForTimeout(500)
    let info = {}
    if (which === 'proposed') {
      // the real line and puck, made by typing the line's times; then the times taken out again
      await page.evaluate(wi => { window.txtSet(`ff:1.${wi}.0.to`, '19:00'); window.txtSet(`ff:1.${wi}.0.ld`, '07:00'); window.afterSchedMutate() }, wi); await page.waitForTimeout(700)
      info = await page.evaluate(wi => {
        const ln = [...document.querySelectorAll('#schedBoard .wln')].find(x => /Illegal seat/.test(x.textContent))
        const pk = document.querySelector(`#schedBoard [data-slot="1.${wi}.0.0.p"]`)
        window.__mqLine = ln && ln.outerHTML; window.__mqPuck = pk && pk.innerHTML
        return { line: ln && ln.querySelector('.wln-t').textContent, head: document.querySelector('#schedBoard .sbwrap .wh').textContent }
      }, wi)
      await page.evaluate(wi => { window.txtSet(`ff:1.${wi}.0.to`, ''); window.txtSet(`ff:1.${wi}.0.ld`, ''); window.afterSchedMutate() }, wi); await page.waitForTimeout(700)
      await page.evaluate(() => { const w = document.querySelector('#schedBoard .sbwrap'); if (w && !w.classList.contains('open')) w.querySelector('[data-sbwtog]').click() }); await page.waitForTimeout(400)
    }
    const out = await page.evaluate(({ wi, which }) => {
      const mq = window.__mq
      const slot = document.querySelector(`#schedBoard [data-slot="1.${wi}.0.0.p"]`)
      const wrap = document.querySelector('#schedBoard .sbwrap'), head = wrap.querySelector('.wh')
      const before = head.textContent
      // on a desktop the seat and the list share the screen; on a phone the list sits above the waves, so the
      // picture shows the list, and the seat is marked only where it is in view
      if (innerWidth < 700) { wrap.scrollIntoView({ block: 'center' }) } else slot.scrollIntoView({ block: 'center' })
      const sr = slot.getBoundingClientRect(), seatIn = sr.top > 170 && sr.bottom < innerHeight - 10
      if (which === 'proposed') {
        // the line the seat raises with times typed, its hours swapped for "(no times yet)" as a flight's line words it
        const box = document.createElement('div'); box.innerHTML = window.__mqLine
        const ln = mq.strip(box.firstElementChild)
        const t = ln.querySelector('.wln-t'); t.textContent = t.textContent.replace(/\s*\d{2}:?\d{2}\s*[–-]\s*\d{2}:?\d{2}\s*$/, '') + ' (no times yet)'
        const first = wrap.querySelector('.wln.hard') || wrap.querySelector('.wln')
        if (first) first.before(ln); else wrap.appendChild(ln)
        // the bar's counts, one more of each
        const b = head.querySelector('b'); const n = +(b.textContent.match(/\d+/) || [0])[0]
        b.textContent = `⚠ ${n + 1} issues`
        const rest = [...head.childNodes].find(x => x.nodeType === 3 && /warning/.test(x.textContent))
        if (rest) { const m = +(rest.textContent.match(/\d+/) || [0])[0]; rest.textContent = ` · ${m + 1} warnings` }
        // the seat's puck as it reads with times typed: its red ring and Q chip
        const kids = [...slot.children]; kids.forEach(k => mq.hide(k))
        const pk = document.createElement('span'); pk.setAttribute('data-mine', '1'); pk.style.display = 'contents'; pk.innerHTML = window.__mqPuck; slot.appendChild(pk)
        if (seatIn) mq.mark(slot, '1c', 'float')
        mq.mark(ln, '1d', 'floatin')
        mq.mark(head, '1e', 'floatin')
      } else {
        if (seatIn) mq.mark(slot, '1a', 'float')
        mq.mark(head, '1b', 'floatin')
      }
      return { before, after: head.textContent, lines: [...wrap.querySelectorAll('.wln-t')].map(x => x.textContent).slice(0, 4) }
    }, { wi, which })
    await page.waitForTimeout(250)
    const f = `1-standby-${sz}-${which}.png`
    await shot(page, f)
    rec(f, 'Q1', sz, which, which === 'today'
      ? `Real. Tuesday's Scheduler Board, a new BB wave (its START and END blank, as "+ Wave" makes them). Echo, a WSO, is in the first MAIN line's front seat (mark 1a). The seat wears no ring and no Q chip, and the day's issues (mark 1b) have no line for it: ${out.before.trim()}.`
      : `Proposed, drawn in. The same seat with no times now raises the line it raises once times are typed, with the hours swapped for "(no times yet)" as a flight's line says it (mark 1d): "${out.lines[0]}". The seat wears the red ring and Q chip it wears with times (mark 1c, the real puck with times typed), and the bar counts one more (mark 1e). With times typed the real line reads "${info.line || '?'}".`)
    notes.push(`pic1 ${which} ${sz}: ${JSON.stringify({ out, info })}`)
    await ctx.close()
  }
}

// ---------- 2. "+ Block"'s "BB desk" ----------
async function pic2(sz) {
  const cases = sz === 'd' ? ['fresh', 'bb'] : ['fresh']
  for (const which of cases) {
    const { ctx, page } = await world(sz)
    await toBoard(page, 0)
    if (which === 'bb') {
      // the duty templates window, opened from the menu's pencil; Standard's "For wave" set to BB, as the walker had it
      await page.evaluate(() => document.querySelector('#schedBoard [data-dwadd="0"]').click()); await page.waitForTimeout(400)
      await page.evaluate(() => document.querySelector('[data-blkedit]').click()); await page.waitForTimeout(700)
      const sel = page.locator('label.tpl-wave select').first()
      await sel.selectOption('bb'); await page.waitForTimeout(400)
      await page.locator('#tplModal .abtn.primary', { hasText: 'Done' }).first().click(); await page.waitForTimeout(600)
    }
    await page.evaluate(() => { const b = document.querySelector('#schedBoard [data-dwadd="0"]'); b.scrollIntoView({ block: 'center' }); b.click() }); await page.waitForTimeout(500)
    const out = await page.evaluate(which => {
      const mq = window.__mq
      const items = [...document.querySelectorAll('[data-blktpl]')].filter(mq.vis)
      const std = items.find(x => /Standard/.test(x.textContent))
      if (std) mq.mark(std, which === 'bb' ? '2b' : '2a', 'floatin')
      return items.map(x => x.textContent)
    }, which)
    await page.waitForTimeout(200)
    const f = `2-block-${sz}-${which === 'bb' ? 'for-wave-bb' : 'today'}.png`
    await shot(page, f)
    rec(f, 'Q2', sz, 'today', which === 'bb'
      ? `Real. The same menu after the Standard template's "For wave" was set to BB in the duty templates window (its pencil): now it reads "${(out.find(x => /Standard/.test(x)) || '').replace(/\s+/g, ' ')}" (mark 2b). "BB desk" says the block will be made as the BB wave's desk, which is what that setting does. Set back to its blank, the words go.`
      : `Real. 142's Scheduler Board, "+ Block" pressed on a fresh copy of the app. The built-in Standard template reads "${(out.find(x => /Standard/.test(x)) || '').replace(/\s+/g, ' ')}" (mark 2a), with no "BB desk".`)
    notes.push(`pic2 ${which} ${sz}: ${JSON.stringify(out)}`)
    await ctx.close()
  }
}

// ---------- 3. the singular "warning" in the day's ⓘ panel and on Insights ----------
async function pic3(sz) {
  for (const which of ['today', 'proposed']) {
    const { ctx, page } = await world(sz)
    await toEdit(page)
    await page.evaluate(() => document.querySelector('#eWeek .day:not(.peek) [data-dayinfo="0"].dinfobtn').click()); await page.waitForTimeout(700)
    const out = await page.evaluate(which => {
      const mq = window.__mq
      const sev = [...document.querySelectorAll('.dip-sev')].find(mq.vis)
      if (!sev) return { none: true }
      const before = sev.textContent
      if (which === 'proposed') {
        for (const b of sev.querySelectorAll('b')) {
          const n = +(b.textContent.match(/\d+/) || [0])[0]
          b.textContent = b.textContent.replace(/\b(warning|advisory|note)\b/, w => n === 1 ? w : w === 'advisory' ? 'advisories' : w + 's')
        }
      }
      sev.scrollIntoView({ block: 'center' })
      mq.mark(sev, which === 'today' ? '3a' : '3b', 'pad')
      return { before, after: sev.textContent }
    }, which)
    await page.waitForTimeout(250)
    const f = `3-plural-panel-${sz}-${which}.png`
    await shot(page, f)
    rec(f, 'Q3', sz, which, which === 'today'
      ? `Real. Edit Schedule, Monday's ⓘ (day details) panel. Its count of the day's issues reads "${out.before}" (mark 3a), while the issues bar above Monday reads the plural ("N warnings", live since pull request 756).`
      : `Proposed, drawn in. The same counts in the plural wherever the number is not 1: "${out.after}" (mark 3b). Only the endings change; one of each still reads "1 warning", "1 advisory", "1 note".`)
    notes.push(`pic3 panel ${which} ${sz}: ${JSON.stringify(out)}`)
    await ctx.close()
  }
  if (sz !== 'd') return
  for (const which of ['today', 'proposed']) {
    const { ctx, page } = await world(sz)
    await toBoard(page, 0)
    await page.evaluate(() => document.querySelector('#sbInsights').click()); await page.waitForTimeout(900)
    const out = await page.evaluate(which => {
      const mq = window.__mq
      const tile = [...document.querySelectorAll('.itile.hard')].find(mq.vis)
      if (!tile) return { none: true }
      const l = tile.querySelector('.l'), before = l.textContent
      const n = +tile.querySelector('.n').textContent
      // the big number is the week's issues; the label names it and gives the warnings, as the issues bar words it
      const h = +(before.match(/\d+/) || [0])[0]
      if (which === 'proposed') l.textContent = `issues · ${h} warning${h === 1 ? '' : 's'}`
      mq.mark(tile, which === 'today' ? '3c' : '3d', 'pad')
      return { n, before, after: l.textContent }
    }, which)
    await page.waitForTimeout(250)
    const f = `3-plural-insights-${sz}-${which}.png`
    await shot(page, f)
    rec(f, 'Q3', sz, which, which === 'today'
      ? `Real. The Scheduler Board's Insights window. The red tile reads ${out.n} over "${out.before}" (mark 3c): ${out.n} is the week's issues, of which ${out.before.match(/\d+/)[0]} are warnings, but nothing says so, and "warning" is singular.`
      : `Proposed, drawn in. The tile's label worded as the issues bar words it: ${out.n} over "${out.after}" (mark 3d; the tile prints its labels in capitals). Words added: "issues ·" and the "s".`)
    notes.push(`pic3 insights ${which} ${sz}: ${JSON.stringify(out)}`)
    await ctx.close()
  }
}

// ---------- 4. the look banner on the phone board ----------
async function pic4(sz) {
  for (const which of ['today', 'proposed']) {
    const { ctx, page } = await world(sz)
    await toEdit(page)
    await publishMonday(page)
    await page.evaluate(() => { window.openScheduler(0) }); await page.waitForSelector('#schedBoard:not([hidden]) [data-gline]'); await page.waitForTimeout(1000)
    // a look at the Original: the board's plans selector, its "Original" row (the real press)
    await page.evaluate(() => { const b = [...document.querySelectorAll('#schedBoard [data-planmenu]')].find(window.__mq.vis); b.click() }); await page.waitForTimeout(500)
    notes.push('pic4 menu ' + sz + ': ' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-plansel], [data-plangolive], .planmenu button, .wavemenu button')].filter(window.__mq.vis).map(x => x.textContent.slice(0, 40)))))
    const picked = await page.evaluate(() => { const r = [...document.querySelectorAll('[data-plansel], .planmenu button, .wavemenu button')].filter(window.__mq.vis).find(x => /^\s*Original/.test(x.textContent)); if (r) r.click(); return !!r })
    if (!picked) await page.evaluate(() => { window.setDayPreview(0, window.dayCurVer(0)); window.afterSchedMutate() })
    await page.waitForTimeout(900)
    const out = await page.evaluate(which => {
      const mq = window.__mq
      const bar = [...document.querySelectorAll('#schedBoard .dprev-bar')].find(mq.vis)
      if (!bar) return { none: true }
      const h0 = bar.getBoundingClientRect().height
      if (which === 'proposed') {
        // the words wrapped in one span that takes the room left beside the buttons, so they flow as one sentence
        // and only wrap where the line is full; the two buttons stay where they are
        const nodes = [...bar.childNodes].filter(n => !(n.nodeType === 1 && n.tagName === 'BUTTON'))
        const back = bar.querySelector('.dprev-back')
        const span = document.createElement('span'); span.setAttribute('data-mine', '1')
        span.style.flex = '1 1 220px'; span.style.minWidth = '0'
        back.after(span)
        for (const n of nodes) span.appendChild(n)
      }
      bar.scrollIntoView({ block: 'center' })
      const h1 = bar.getBoundingClientRect().height
      const tab = [...document.querySelectorAll('#schedBoard .sb-tab, #schedBoard [role=tab]')].find(mq.vis)
      mq.mark(bar, which === 'today' ? '4a' : '4b', 'float')
      return { picked: true, h0, h1, text: bar.textContent.replace(/\s+/g, ' ').trim(), tab: tab && tab.textContent }
    }, which)
    await page.waitForTimeout(250)
    const f = `4-banner-${sz}-${which}.png`
    await shot(page, f)
    rec(f, 'Q4', sz, which, which === 'today'
      ? `Real. Monday published, then its Original looked at from the board's plans selector. The banner (mark 4a) is ${Math.round(out.h0)}px tall: "← Back to live copy", then the words "Viewing the issued Original — read-only. This is what was sent out; it never changes." broken over its lines, then "Load onto working copy".`
      : `Proposed, drawn in. The same words and buttons, the words held together as one block beside the buttons so they read as one sentence and wrap only where the line is full (mark 4b), ${Math.round(out.h1)}px tall. No word changes.`)
    notes.push(`pic4 ${which} ${sz}: ${JSON.stringify(out)} picked=${picked}`)
    await ctx.close()
  }
}

// ---------- 5. "N changes" beside "N pending" ----------
async function pic5(sz) {
  for (const which of ['today', 'proposed']) {
    const { ctx, page } = await world(sz)
    await toEdit(page)
    // Monday: published, then an edit waiting to go out ("1 pending"). Tuesday: published, two edits, sent out as AL1 —
    // nothing waits, so its chip counts what the issued versions changed ("N changes")
    await publishMonday(page)
    const tue = await page.evaluate(() => {
      const w = window
      const sign = di => { const g = w.signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
      sign(1); w.setDayApproved(1, true); w.afterSchedMutate()
      w.txtSet('ap:1.0.end', '16:40'); w.txtSet('ap:1.0.str', '08:40'); w.afterSchedMutate(); sign(1); w.publishALDay(1)
      w.txtSet('ap:0.0.end', '16:30'); w.afterSchedMutate()
      return w.dayCurVer(1)
    })
    notes.push('pic5 tuesday ' + tue)
    await page.waitForTimeout(800)
    const out = await page.evaluate(which => {
      const mq = window.__mq
      const days = [...document.querySelectorAll('#eWeek > .day')].filter(d => mq.vis(d) && !d.classList.contains('peek'))
      const pend = days[0].querySelector('.dpend'), chg = days[1].querySelector('.dpend.dchg')
      const r = { pend: pend && pend.textContent, chg: chg && chg.textContent }
      if (!pend || !chg) return r
      // a phone shows one day at a time: Tuesday's day brought into view (Monday's "pending" is one swipe back)
      const ph = innerWidth < 700
      if (ph) { for (let a = days[1].parentElement; a; a = a.parentElement) if (a.scrollWidth > a.clientWidth + 4) { a.style.scrollBehavior = 'auto'; a.scrollLeft += days[1].getBoundingClientRect().left - a.getBoundingClientRect().left; break } }
      else { days[0].scrollIntoView({ block: 'start' }); window.scrollBy(0, -80) }
      if (which === 'proposed') {
        // History's clock (the top bar's changes button wears it) before the count: what was changed, and by whom
        const clk = document.querySelector('#histBtn svg')
        if (clk) { const c = clk.cloneNode(true); c.setAttribute('data-mine', '1'); c.style.width = '11px'; c.style.height = '11px'; c.style.marginRight = '3px'; c.style.verticalAlign = '-1px'; chg.insertBefore(c, chg.firstChild) }
        r.clock = !!clk
        mq.mark(chg, '5c', 'float')
      } else {
        if (!ph) mq.mark(pend, '5a', 'float')
        mq.mark(chg, '5b', 'float')
      }
      return r
    }, which)
    await page.waitForTimeout(250)
    const f = `5-changes-${sz}-${which}.png`
    await shot(page, f)
    rec(f, 'Q5', sz, which, which === 'today'
      ? (sz === 'p' ? `Real, on a phone. Tuesday, published, its two edits sent out as AL1: its chip reads "${(out.chg || '').trim()}" (mark 5b). Monday, one swipe back, reads "${(out.pend || '').trim()}" in the same place.` : `Real. Edit Schedule's week. Monday is published with one edit waiting to go out: its chip reads "${(out.pend || '').trim()}" (mark 5a). Tuesday is published and its two edits already went out as AL1: its chip, in the same place on the day, reads "${(out.chg || '').trim()}" (mark 5b), what the issued versions changed. Side by side on the week, "changes" can read as changes not sent yet.`)
      : `Proposed, drawn in. Tuesday's chip wears History's clock before its count (mark 5c, the clock of the top bar's changes button), so it reads as the day's change history (who changed what) beside Monday's "pending". The words and the window it opens stay.`)
    notes.push(`pic5 ${which} ${sz}: ${JSON.stringify(out)}`)
    await ctx.close()
  }
}

// ---------- 6. a damaged week: the next-week preview, and the delete refusal ----------
// stage: edits saved on 20/07 (next week) so its stored rows exist, then those rows made unreadable before the reload
async function damagedWorld(sz) {
  const init = () => { const k = sessionStorage.getItem('mqbreak'); if (k) { for (const x of k.split('|')) localStorage.setItem(x, '{"broken'); sessionStorage.removeItem('mqbreak') } }
  const { ctx, page } = await world(sz, { init })
  await toEdit(page)
  await page.locator('button.wk[data-wk="20/07/2026"]:visible').first().click(); await page.waitForTimeout(900)
  await page.evaluate(() => { window.txtSet('ap:0.0.end', '16:30'); window.txtSet('ap:2.0.end', '16:30'); window.afterSchedMutate() }); await page.waitForTimeout(700)
  await page.locator('button.wk[data-wk="13/07/2026"]:visible').first().click(); await page.waitForTimeout(900)
  const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => /^raptor:weeks\/20-07-2026/.test(k)))
  await page.evaluate(k => sessionStorage.setItem('mqbreak', k.join('|')), keys)
  await page.reload(); await login(page, false)
  await toEdit(page)
  return { ctx, page, keys }
}
async function pic6(sz) {
  if (sz === 'd') for (const which of ['today', 'proposed']) {
    const { ctx, page, keys } = await damagedWorld(sz)
    const out = await page.evaluate(which => {
      const mq = window.__mq
      const peeks = [...document.querySelectorAll('#eWeek > .day.peek')].filter(mq.vis)
      if (!peeks.length) return { none: true }
      const p = peeks[0]
      // the preview sits after Sunday: the week scrolled to its end, the preview in view
      const sc = p.closest('.edit-board') || p.parentElement
      for (let a = p.parentElement; a; a = a.parentElement) if (a.scrollWidth > a.clientWidth + 4) { a.style.scrollBehavior = 'auto'; a.scrollLeft += p.getBoundingClientRect().left - a.getBoundingClientRect().left - 380; break }
      void sc
      const r = { n: peeks.length, head: (p.querySelector('.day-head') || p).textContent.replace(/\s+/g, ' ').slice(0, 60) }
      if (which === 'proposed') {
        // D1785's notice where the days would be: the bar Edit Schedule draws over an unreadable week, one word swapped
        for (const q of peeks) {
          const head = q.querySelector('.day-head')
          for (const k of [...q.children]) if (k !== head) mq.hide(k)
          const bar = document.createElement('div'); bar.className = 'dprev-bar'; bar.setAttribute('data-mine', '1')
          bar.textContent = 'Next week’s saved copy could not be read, so it can’t be shown. The saved copy is kept as it was. Report it with “Report a problem” on the Help page.'
          q.appendChild(bar)
        }
        mq.mark(peeks[0], '6b', 'floatl')
      } else mq.mark(p, '6a', 'floatl')
      return r
    }, which)
    await page.waitForTimeout(250)
    const f = `6-damaged-peek-${sz}-${which}.png`
    await shot(page, f)
    rec(f, 'Q6', sz, which, which === 'today'
      ? `Real. Edit Schedule on 13 Jul, with next week's (20 Jul) saved copy made unreadable (its stored days spoiled before a reload). The next-week preview at the right (mark 6a) draws the demo days as if nothing were wrong.`
      : `Proposed, drawn in. Where the preview's days would be, the notice Edit Schedule shows over an unreadable week, with "This week’s" swapped for "Next week’s" (mark 6b). The day headings stay.`)
    notes.push(`pic6 peek ${which} ${sz}: ${JSON.stringify({ out, keys })}`)
    await ctx.close()
  }
  for (const which of ['today', 'proposed']) {
    const { ctx, page } = await world(sz, { toasts: true })
    await page.evaluate(() => window.go('admin')); await page.waitForTimeout(800)
    // the refusal raised with its real words through the app's own note (no control reaches it without a damaged
    // current week, which hides the week behind its notice) — today its amber note, proposed the grey "Blocked:" note
    await page.evaluate(which => {
      if (which === 'today') window.toast('The week of 13/07/2026 can’t be changed — the delete was not made', 'warn')
      else window.toast('Blocked: the saved copy of the week of 13/07/2026 could not be read, so the delete was not made. Report it with “Report a problem” on the Help page.', 'blocked')
    }, which)
    await page.waitForTimeout(700)
    const out = await page.evaluate(which => {
      const mq = window.__mq
      const t = [...document.querySelectorAll('.toast, #toast, #toastEl, [data-face]')].find(mq.vis)
      if (!t) return { none: true }
      mq.mark(t, which === 'today' ? '6c' : '6d', 'pad')
      return { text: t.textContent }
    }, which)
    await page.waitForTimeout(200)
    const f = `6-damaged-delete-${sz}-${which}.png`
    await shot(page, f)
    rec(f, 'Q6', sz, which, which === 'today'
      ? `Real words, raised through the app's own note on the Admin page: deleting a person while the week's saved copy cannot be read is refused in the amber note (mark 6c), "${out.text}".`
      : `Proposed, the app's grey "Blocked:" note (mark 6d), as every other refusal of one change takes it (D1667, D1668), in D1785's words: "${out.text}".`)
    notes.push(`pic6 delete ${which} ${sz}: ${JSON.stringify(out)}`)
    await ctx.close()
  }
}

// ---------- 7. View-only Sched's picker has no "Original" ----------
async function pic7(sz) {
  for (const which of ['today', 'proposed']) {
    const { ctx, page } = await world(sz)
    await toEdit(page)
    await publishMonday(page, { al: true })
    await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(900)
    const out = await page.evaluate(which => {
      const mq = window.__mq
      const sel = [...document.querySelectorAll('select.dver[data-vwork="0"]')].find(mq.vis)
      if (!sel) return { none: true }
      const before = [...sel.options].map(o => o.textContent)
      if (which === 'proposed') {
        const o = document.createElement('option'); o.textContent = 'Original — as issued'; o.value = 'orig'; o.setAttribute('data-mine', '1')
        sel.options[0].after(o)
      }
      // drawn open: the list shown in place (a browser draws a select's open list outside the page)
      sel.size = sel.options.length; sel.style.height = 'auto'; sel.style.overflow = 'hidden'
      sel.scrollIntoView({ block: 'center' })
      mq.mark(sel, which === 'today' ? '7a' : '7b', 'float')
      return { before, after: [...sel.options].map(o => o.textContent) }
    }, which)
    await page.waitForTimeout(250)
    const f = `7-original-${sz}-${which}.png`
    await shot(page, f)
    rec(f, 'Q7', sz, which, which === 'today'
      ? `Real. View-only Sched, Monday published and then amended (AL1). Its picker (mark 7a, drawn open) offers ${out.before.map(x => '"' + x + '"').join(' and ')}: there is no way here to look at the Original.`
      : `Proposed, drawn in. The picker gains "Original — as issued" (mark 7b), worded as its neighbour is: ${out.after.map(x => '"' + x + '"').join(', ')}. With more amendments, each issued version would be listed the same way, newest first.`)
    notes.push(`pic7 ${which} ${sz}: ${JSON.stringify(out)}`)
    await ctx.close()
  }
}

// ---------- 8. the late cut-off box ----------
async function pic8(sz) {
  const cases = ['typed', 'closed', 'a', 'b']
  for (const which of cases) {
    if (sz === 'p' && which !== 'typed' && which !== 'a') continue
    const { ctx, page } = await world(sz)
    await page.evaluate(() => window.go('logic')); await page.waitForTimeout(800)
    const openWin = async () => { await page.evaluate(() => { const b = document.querySelector('[data-lgopen="inputs"]'); b.scrollIntoView({ block: 'center' }); b.click() }); await page.waitForSelector('[data-testid="win-inputsset"]'); await page.waitForTimeout(500) }
    await openWin()
    const lead = page.locator('[data-testid="iset-lead"]').first()
    await lead.fill('10'); await page.keyboard.press('Tab'); await page.waitForTimeout(400)
    if (which === 'closed') {
      await page.evaluate(() => { const w = document.querySelector('[data-testid="win-inputsset"]'); const x = [...w.querySelectorAll('button')].find(b => /✕|×|Close/.test(b.textContent + (b.getAttribute('aria-label') || '') + (b.title || ''))); x.click() }); await page.waitForTimeout(500)
    }
    const out = await page.evaluate(which => {
      const mq = window.__mq
      const row = document.querySelector('[data-lgopen="inputs"]')
      const rowLine = row.closest('.lg-row, .lgrow, li, tr, div')
      const r = { row: (rowLine || row).textContent.replace(/\s+/g, ' ').slice(0, 160) }
      const w = document.querySelector('[data-testid="win-inputsset"]')
      const box = document.querySelector('[data-testid="iset-lead"]')
      r.box = box && box.value
      if (which === 'a') {
        // the box keeps what is typed the moment the keys leave it, as the Logic page's own boxes do: the row behind
        // reads it at once, and the window has nothing left to Save or Cancel
        const tw = document.createTreeWalker(row, NodeFilter.SHOW_TEXT)
        for (let n = tw.nextNode(); n; n = tw.nextNode()) if (/\b14\b/.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace(/\b14\b/, '10'); break }
        const foot = w.querySelector('.sset-foot'); if (foot) mq.hide(foot)
        if (innerWidth < 700) mq.mark(box, '8c', 'float'); else mq.mark(row, '8c', 'floatl')
      }
      if (which === 'b') {
        const x = [...w.querySelectorAll('button')].find(b => /✕|×|Close/.test(b.textContent + (b.getAttribute('aria-label') || '') + (b.title || '')))
        const card = mq.ask(x, 'This window has unsaved changes. Close it and lose them?', [['Discard and close', 'danger'], ['Keep editing', 'primary']])
        mq.mark(card, '8d', 'floatin')
      }
      if (which === 'typed') { mq.mark(box, '8a', 'float'); if (innerWidth >= 700) mq.mark(row, '8b', 'floatl') }
      if (which === 'closed') mq.mark(row, '8b', 'floatl')
      r.after = row.textContent.replace(/\s+/g, ' ').slice(0, 160)
      return r
    }, which)
    await page.waitForTimeout(250)
    const f = `8-cutoff-${sz}-${which === 'typed' ? 'today-typed' : which === 'closed' ? 'today-closed' : which === 'a' ? 'proposed-a' : 'proposed-b'}.png`
    await shot(page, f)
    const ph = sz === 'p'
    const words = {
      typed: ph ? `Real, on a phone. The same: 10 typed over 14, then Tab. The box shows ${out.box} (mark 8a); the Logic row, under the window here, still says 14 days, because nothing is kept until Save (or Enter).` : `Real. Logic → "Inputs late cut-off" opens the Inputs calendar settings window. 10 typed over 14 in the days-before box, then Tab: the box shows ${out.box} (mark 8a) while the Logic row behind still says "${out.row}" (mark 8b), because nothing is kept until Save (or Enter).`,
      closed: `Real. The same, then the window's ✕: the window closes and the 10 is gone without a word. The row still says "${out.after}" (mark 8b).`,
      a: ph ? `Proposed A, on a phone, drawn in. The box keeps 10 the moment the keys leave it (mark 8c), so the window has no Save or Cancel; the Logic row under it reads 10 at once.` : `Proposed A (recommended), drawn in. The box keeps the number the moment the keys leave it, as the Logic page's own boxes do: the row behind reads 10 at once (mark 8c), and Save and Cancel go, since there is nothing left to save. Undo takes it back.`,
      b: `Proposed B, drawn in. The window keeps its Save. A press of ✕ (or Escape) with a changed box asks first, in a card hanging from the ✕ worded as the input window's: "This window has unsaved changes. Close it and lose them?" with "Discard and close" and "Keep editing" (mark 8d).`,
    }
    rec(f, 'Q8', sz, which === 'typed' || which === 'closed' ? 'today' : 'proposed', words[which])
    notes.push(`pic8 ${which} ${sz}: ${JSON.stringify(out)}`)
    await ctx.close()
  }
}

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ALL = { pic1, pic2, pic3, pic4, pic5, pic6, pic7, pic8 }
try {
  for (const sz of (process.env.MQ_SIZES || 'd,p').split(',')) {
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
