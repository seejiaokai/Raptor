// Multi-squadron & detachment — round 6's Q4 drawn to Fable's design (17 Nov 26, chat 100), on the REAL running app by
// .claude/skills/brainstorming/mockups-on-the-real-app.md. Built from round 2's kit (docs/mock/2026-11-16-multi-sqn-r2/
// draw.mjs, its helpers copied whole). Q4: 149 picks Saber (142) into 149's VL. VL stays 149's; the one thing 142 may do
// is take its own man off it, from his automatic "Attach · 149" row on 142's schedule, 149 told by the bell. The row is
// the app's own, filed through the Inputs door (an Attach "To 149"), so the app draws it; only the name is re-lettered
// Saber (the demo's Comet stands in) and the one action and its line are cloned in (data-mine). Demo data only.
//
// Run from raptor-port/, against a built preview already serving:
//   MQ_URL=http://localhost:4180/ node docs/mock/2026-11-17-multi-sqn-r7/draw-q4.mjs
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { unlinkSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4180/'
const OUT = 'docs/img/2026-11-17-multi-sqn-r7'
const PAGEIMG = 'docs/mock/2026-11-17-multi-sqn-r7/img'
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
import { copyFileSync, readdirSync, readFileSync } from 'node:fs'
mkdirSync(PAGEIMG, { recursive: true })

async function picQ4(sz, ground) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  // Saber on 149's VL in Monday's night wave, 19:00-22:00: the automatic Attach the pick would make at home (D2098)
  await file(page, { iid: 'mq-att', person: COMET, type: 'Attach', to: '149', date: 'Jul 13', yr: 2026, allday: false, s: 1140, e: 1320, remarks: '' })
  // his question (chat 100): the same man also named on 149's ground programme, ACADEMICS 14:00-16:00 — a second row
  if (ground) await file(page, { iid: 'mq-att2', person: COMET, type: 'Attach', to: '149', date: 'Jul 13', yr: 2026, allday: false, s: 840, e: 960, remarks: '' })
  const rows = await unavMonday(page)
  const st = await page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday()
    const out = []
    for (const r of [...mon.querySelectorAll('.sec-unav .pl-row')].filter(x => /Comet/.test(x.innerText))) {
    const item = /14:00/.test(r.innerText) ? { name: 'ACADEMICS', when: "149's ground programme, Mon 14:00–16:00" } : { name: 'VL', when: "149's VL, Mon night wave" }
    const before = r.outerHTML.slice(0, 200)
    // the name re-lettered: Saber, as the page's example
    let renamed = 0
    const w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT); let n
    while ((n = w.nextNode())) if (/\bComet\b/.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace(/\bComet\b/, 'Saber'); renamed++ }
    // the row's own action button (the app's REJECT on an input row) re-lettered: the one thing 142 may do to VL
    const rej = [...r.querySelectorAll('button')].find(b => /^reject$/i.test(b.textContent.trim()))
    if (!rej) return { err: 'no reject button' }
    rej.textContent = 'Take him off ' + item.name
    // a quiet line under the row saying where he is: the app's own remarks placeholder look, cloned
    const line = document.createElement('div'); line.setAttribute('data-mine', '1')
    const rm = [...r.querySelectorAll('*')].find(e => !e.children.length && e.textContent.trim() === 'remarks')
    const rcs = getComputedStyle(rm || r)
    line.style.cssText = `padding:0 8px 8px;font-size:${rcs.fontSize};color:${rcs.color};font-family:${rcs.fontFamily};opacity:.55`
    line.textContent = `On ${item.when} · 149 is told if he is taken off`
    r.after(line)
    const wrap = document.createElement('div'); wrap.setAttribute('data-mine', '1'); wrap.style.position = 'relative'
    r.before(wrap); wrap.appendChild(r); wrap.appendChild(line)
    mq.mark(wrap, 'Q4')
    out.push({ renamed, row: r.innerText.replace(/\s+/g, ' '), before })
    }
    return out.length ? out : { err: 'no row' }
  })
  if (st.err) throw new Error('picQ4: ' + st.err + ' ' + rows.join(' | '))
  if (ground && st.length !== 2) throw new Error('picQ4 ground: expected 2 rows, got ' + st.length)
  await page.waitForTimeout(300)
  const clip = await clipOf(page, null, 6)
  const f = `Q4${ground ? 'G' : 'F'}-${sz}-proposed.png`
  await shot(page, f, clip)
  if (ground) rec(f, 'Q4', sz, 'proposed', `142's schedule, Monday's Unavailable list, his question: Saber picked by 149 for its ground programme (ACADEMICS 14:00–16:00) and for VL at night. Two "Attach · 149" rows, one for each stretch of time, each the app's own row from an Attach To 149; each with its own "Take him off …" button and quiet line. The ground item itself does not show on 142's schedule.`)
  else rec(f, 'Q4', sz, 'proposed', `142's schedule, Edit Schedule, Monday's Unavailable list. Saber's "Attach · 149" row, the app's own (an Attach To 149, filed through the Inputs door), the name re-lettered. Drawn in (mark Q4): the line under it, "On 149's VL · Mon night wave · 149's line", and the row's own REJECT button re-lettered "Take him off VL". VL itself does not show on 142's schedule; 142 changes nothing else of it.`)
  notes.push(`picQ4 ${sz}: ${JSON.stringify(st)}`)
  await ctx.close()
}

// his question (chat 100): the same two rows on 142's Scheduler Board, its Unavailable panel. The board draws an input
// row in the ground programme's shape (type box opening the dialog with delete; Start, End, Rmks typed in place). On the
// automatic row none of that is his to change: the times follow 149's plan, so its fields are drawn read-only (the
// board's own read-only look for a field), and its one action, the panel's own "+ Add" button cloned, is "Take him off …".
async function picQ4board(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  await file(page, { iid: 'mq-att', person: COMET, type: 'Attach', to: '149', date: 'Jul 13', yr: 2026, allday: false, s: 1140, e: 1320, remarks: '' })
  await file(page, { iid: 'mq-att2', person: COMET, type: 'Attach', to: '149', date: 'Jul 13', yr: 2026, allday: false, s: 840, e: 960, remarks: '' })
  await page.evaluate(() => document.querySelector('#eWeek .day:not(.peek) [data-sbday="0"]').click())
  await page.waitForSelector('.sb-panel.unav', { state: 'attached' })
  await page.waitForTimeout(1200)
  const st = await page.evaluate(() => {
    const mq = window.__mq
    const panel = document.querySelector('.sb-panel.unav')
    const pb = panel.querySelector('.sb-pb')
    const rows = [...pb.children].filter(x => /Comet/.test(x.textContent) || x.querySelector('[data-person="beams"]'))
    if (!rows.length) return { err: 'no rows: ' + [...pb.children].map(x => x.className + ':' + x.textContent.replace(/\s+/g, ' ').slice(0, 60)).join(' | ') }
    const add = panel.querySelector('.sb-addinp')
    const out = []
    for (const r of rows) {
      const item = /14:00|1400/.test(r.innerText + [...r.querySelectorAll('input')].map(i => i.value).join(' ')) ? { name: 'ACADEMICS', when: "149's ground programme, Mon 14:00–16:00" } : { name: 'VL', when: "149's VL, Mon night wave" }
      const w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT); let n
      while ((n = w.nextNode())) if (/\bComet\b/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/\bComet\b/, 'Saber')
      for (const p of r.querySelectorAll('[title*="Comet"]')) p.setAttribute('title', p.getAttribute('title').replace(/Comet/g, 'Saber'))
      // the times and remarks follow 149's plan: shown, not typed in (the fields' own disabled look)
      for (const i of r.querySelectorAll('input, textarea, [contenteditable="true"]')) { if (i.tagName === 'INPUT' || i.tagName === 'TEXTAREA') i.disabled = true; else i.setAttribute('contenteditable', 'false'); i.style.opacity = '.6' }
      const line = document.createElement('div'); line.setAttribute('data-mine', '1')
      line.style.cssText = 'display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:2px 8px 8px;font-size:12px;opacity:.85'
      // the row's own REJECT button re-lettered, as on Edit Schedule: the one action
      const rej = [...r.querySelectorAll('button')].find(b => /^reject$/i.test(b.textContent.trim()))
      if (!rej) return { err: 'no reject button on the board row' }
      // the board's last column is only REJECT's width: the button moves into the line under the row, the same button cloned
      const nameBox = r.querySelector('.inpedit, button') || r
      line.style.paddingLeft = Math.max(8, Math.round(nameBox.getBoundingClientRect().left - r.getBoundingClientRect().left)) + 'px'
      const btn = mq.strip(rej.cloneNode(true)); btn.textContent = 'Take him off ' + item.name; btn.style.width = 'auto'; btn.style.whiteSpace = 'nowrap'
      mq.hide(rej)
      const txt = document.createElement('span'); txt.textContent = `On ${item.when} · 149 is told if he is taken off`; txt.style.opacity = '.7'
      line.appendChild(btn); line.appendChild(txt)
      const wrap = document.createElement('div'); wrap.setAttribute('data-mine', '1'); wrap.style.position = 'relative'
      r.before(wrap); wrap.appendChild(r); wrap.appendChild(line)
      mq.mark(wrap, 'Q4')
      out.push(r.className + ' · ' + r.innerText.replace(/\s+/g, ' ').slice(0, 80))
    }
    window.__mqClipEl = panel
    // the board scrolls inside its own frame, not the window
    panel.scrollIntoView({ block: 'center', inline: 'nearest' })
    return { out }
  })
  if (st.err) throw new Error('picQ4board: ' + st.err)
  await page.waitForTimeout(300)
  const clip = await clipOf(page, null, 6)
  const f = `Q4B-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, 'Q4', sz, 'proposed', `142's Scheduler Board, Monday's Unavailable panel: Saber's two "Attach · 149" rows (ACADEMICS 14:00–16:00, VL 19:00–22:00), the app's own rows from an Attach To 149, the name re-lettered. Drawn in (mark Q4): the times and remarks shown but not typed in (they follow 149's plan), and under each row its one action, the panel's own "+ Add" button cloned as "Take him off …", with a quiet line saying where he is.`)
  notes.push(`picQ4board ${sz}: ${JSON.stringify(st)}`)
  await ctx.close()
}

// his idea (chat 100, "we can click on the attach.149 to remove him just like all other inputs") with the agent's
// recommendation: the row like every input row — no REJECT, no extra line, the remarks showing where he is
// ("ACADEMICS · 149"); pressing its name opens the input window as for any input, its fields shown not changed ("Set by
// 149's plan"), its Delete re-lettered "Take him off ACADEMICS" with "His seat is left empty; 149 is told." under it.
// Drawn on Edit Schedule (rows + the window) and on the Scheduler Board (rows).
const PLAIN = (r, item) => {
  const mq = window.__mq
  const w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT); let n
  while ((n = w.nextNode())) if (/\bComet\b/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/\bComet\b/, 'Saber')
  const rej = [...r.querySelectorAll('button')].find(b => /^reject$/i.test(b.textContent.trim()))
  if (rej) mq.hide(rej)
  // the remarks field fills itself: the placeholder's place holds the words, in the field's own typed look
  const rmIn = r.querySelector('input[placeholder="remarks"], textarea[placeholder="remarks"]')
  if (rmIn) { rmIn.value = item.name + ' · 149'; rmIn.setAttribute('value', rmIn.value); rmIn.disabled = true }
  else {
    // Edit Schedule: an empty contenteditable whose "remarks" is its data-ph placeholder, drawn by CSS
    const rm = r.querySelector('[data-ph="remarks"]') || r.querySelector('[data-inp$=".rmk"], [data-inp$=".remarks"], [data-inp$=".note"]') || [...r.querySelectorAll('*')].find(e => !e.children.length && e.textContent.trim() === 'remarks')
    if (rm) { rm.textContent = item.name + ' · 149'; rm.removeAttribute('data-ph'); rm.style.color = getComputedStyle(r).color; rm.style.opacity = '1' }
  }
  for (const i of r.querySelectorAll('[contenteditable="true"]')) i.setAttribute('contenteditable', 'false')
  for (const i of r.querySelectorAll('input')) i.disabled = true
  return { rej: !!rej, rm: !!rmIn }
}
async function picQ4plain(sz, where) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  await file(page, { iid: 'mq-att', person: COMET, type: 'Attach', to: '149', date: 'Jul 13', yr: 2026, allday: false, s: 1140, e: 1320, remarks: '' })
  await file(page, { iid: 'mq-att2', person: COMET, type: 'Attach', to: '149', date: 'Jul 13', yr: 2026, allday: false, s: 840, e: 960, remarks: '' })
  if (where === 'board') {
    await page.evaluate(() => document.querySelector('#eWeek .day:not(.peek) [data-sbday="0"]').click())
    await page.waitForSelector('.sb-panel.unav', { state: 'attached' }); await page.waitForTimeout(1200)
  } else await unavMonday(page)
  const st = await page.evaluate(({ where, PLAIN }) => {
    const plain = eval('(' + PLAIN + ')')
    const mq = window.__mq
    const host = where === 'board' ? document.querySelector('.sb-panel.unav') : mq.monday().querySelector('.sec-unav')
    const rows = [...host.querySelectorAll(where === 'board' ? '.sb-pb > *' : '.pl-row')].filter(x => /Comet/.test(x.textContent))
    const out = []
    for (const r of rows) {
      const item = /14:00/.test(r.innerText + [...r.querySelectorAll('input')].map(i => i.value).join(' ')) ? { name: 'ACADEMICS' } : { name: 'VL' }
      out.push(plain(r, item))
      if (getComputedStyle(r).position === 'static') r.style.position = 'relative'
      mq.mark(r, 'Q4')
      if (where !== 'board') { const t = r.querySelector(':scope > .mkq-tag'); if (t) { t.style.top = 'auto'; t.style.bottom = '2px'; t.style.right = '2px' } }
    }
    window.__mqClipEl = host
    if (where === 'board') host.scrollIntoView({ block: 'center' }); else mq.scrollUnder(host, 16)
    return out
  }, { where, PLAIN: PLAIN.toString() })
  if (st.length !== 2) throw new Error('picQ4plain: rows ' + JSON.stringify(st))
  await page.waitForTimeout(300)
  const f = `Q4P${where === 'board' ? 'B' : 'E'}-${sz}-proposed.png`
  await shot(page, f, await clipOf(page, null, 6))
  rec(f, 'Q4', sz, 'proposed', `142's ${where === 'board' ? 'Scheduler Board' : 'Edit Schedule'}, Monday's Unavailable list: Saber's two "Attach · 149" rows as plain input rows (his idea). No REJECT, no extra line; the remarks show where he is ("ACADEMICS · 149", "VL · 149"); times and remarks shown, not typed in. Pressing "Attach · 149" opens the input window.`)
  if (where !== 'board') {
    // the window: pressed open by its own name button, as any input
    await page.evaluate(() => { const r = [...window.__mq.monday().querySelectorAll('.sec-unav .pl-row')].find(x => /14:00/.test(x.innerText)); r.querySelector('.inpedit').click() })
    try { await page.waitForSelector('#inpEditDel', { state: 'attached', timeout: 8000 }) }
    catch (e) { throw new Error('window: ' + await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"], .inpedwin, .floatwin')].map(w => w.className + ' [' + [...w.querySelectorAll('button')].map(b => b.textContent.trim()).join('|') + ']').join(' ;; ') || 'none open')) }
    await page.waitForTimeout(600)
    const ws = await page.evaluate(() => {
      const mq = window.__mq
      const d0 = document.querySelector('#inpEditDel')
      // round 4's way: up from the window's body to its frame
      let win = d0; while (win && !/floatwin|fwin|inpedwin/.test(win.className + '')) win = win.parentElement
      if (!win) win = d0.closest('#inpEditPop')
      if (!win) return { err: 'no frame: ' + (() => { const a = []; for (let e = d0; e; e = e.parentElement) a.push(e.tagName + '.' + e.className); return a.join(' < ') })() }
      for (const e of win.querySelectorAll('*')) for (const tn of e.childNodes) if (tn.nodeType === 3 && /\bComet\b/.test(tn.nodeValue)) tn.nodeValue = tn.nodeValue.replace(/\bComet\b/g, 'Saber')
      // fields shown, not changed
      for (const i of win.querySelectorAll('.inped-f input, .inped-f select, .inped-f textarea')) i.disabled = true
      // by each field's own label: Remarks filled; Document, the "till" tick and the dates note hidden — nothing here
      // is his to change, so nothing invites a change
      const fieldBy = lab => [...win.querySelectorAll('.inped-f')].find(f => { const k = f.querySelector('.inped-k'); return k && k.textContent.trim().toLowerCase() === lab })
      const rmF = fieldBy('remarks')
      if (rmF) {
        const t = rmF.querySelector('textarea, input[type="text"], input:not([type])')
        if (t) { t.value = 'ACADEMICS · 149'; t.setAttribute('value', t.value); t.textContent = t.value }
        for (const c of rmF.querySelectorAll('input[type="checkbox"]')) { const l = c.closest('label') || c.parentElement; mq.hide(l) }
      }
      const docF = fieldBy('document'); if (docF) mq.hide(docF)
      for (const e of win.querySelectorAll('*')) if (!e.children.length && /^The dates are changed/.test(e.textContent.trim())) mq.hide(e)
      for (const e of win.querySelectorAll('.inped-f svg, .inped-f [class*="pencil"], .inped-f [class*="edit-ic"]')) mq.hide(e.closest('button') || e)
      const firstF = win.querySelector('.inped-f')
      const note = document.createElement('div'); note.setAttribute('data-mine', '1')
      note.textContent = "Set by 149's plan"
      note.style.cssText = 'font-size:12px;opacity:.7;padding:2px 0 8px'
      firstF.parentElement.insertBefore(note, firstF)
      mq.mark(note, 'Q4a', 'right')
      const del = win.querySelector('#inpEditDel')
      del.textContent = 'Take him off ACADEMICS'
      const foot = del.parentElement
      const why = document.createElement('div'); why.setAttribute('data-mine', '1')
      why.textContent = 'His seat is left empty; 149 is told.'
      why.style.cssText = 'flex:1 1 100%;font-size:12px;opacity:.7;margin-top:4px'
      foot.style.flexWrap = 'wrap'
      foot.appendChild(why)
      why.style.position = 'relative'; mq.mark(why, 'Q4b')
      const save = [...foot.querySelectorAll('button')].find(b => /^save$/i.test(b.textContent.trim()))
      if (save) mq.hide(save)
      const sc = win.querySelector('.inped-win') || win
      window.__mqClipEl = win
      return { save: !!save, foot: [...foot.querySelectorAll('button')].map(b => b.textContent.trim()) }
    })
    notes.push(`window ${sz}: ${JSON.stringify(ws)}`)
    await page.waitForTimeout(300)
    const f2 = `Q4PW-${sz}-proposed.png`
    await shot(page, f2, await clipOf(page, null, 6))
    rec(f2, 'Q4', sz, 'proposed', `The input window opened by pressing "Attach · 149" (the ACADEMICS row), the app's own window. Drawn in: "Set by 149's plan" above the fields (Q4a), the fields shown but not changeable; the Delete button re-lettered "Take him off ACADEMICS", with "His seat is left empty; 149 is told." under it (Q4b). No Save: nothing here is his to change.`)
  }
  notes.push(`picQ4plain ${where} ${sz}: ${JSON.stringify(st)}`)
  await ctx.close()
}

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const GROUND = process.env.MQ_Q4 === 'ground'
try { for (const sz of ['d', 'p']) { try { if (process.env.MQ_Q4 === 'plain') { await picQ4plain(sz, 'edit'); await picQ4plain(sz, 'board') } else if (process.env.MQ_Q4 === 'board') await picQ4board(sz); else await picQ4(sz, GROUND) } catch (e) { errs.push(`[${sz}] picQ4 FAILED: ${e.message}`) } } }
finally { await browser.close() }
let old = {}
try { old = JSON.parse(readFileSync(`${OUT}/manifest.json`, 'utf8')) } catch {}
writeFileSync(`${OUT}/manifest.json`, JSON.stringify({ ...old, ...manifest }, null, 2) + '\n')
for (const f of readdirSync(OUT)) if (/^Q4(F|G|B|PE|PB|PW)-.*\.png$/.test(f)) copyFileSync(`${OUT}/${f}`, `${PAGEIMG}/${f}`)
console.log('NOTES\n' + notes.join('\n'))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
