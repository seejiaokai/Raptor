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

async function picQ4(sz) {
  const { ctx, page } = await world(sz)
  await toEdit(page)
  // Saber on 149's VL in Monday's night wave, 19:00-22:00: the automatic Attach the pick would make at home (D2098)
  await file(page, { iid: 'mq-att', person: COMET, type: 'Attach', to: '149', date: 'Jul 13', yr: 2026, allday: false, s: 1140, e: 1320, remarks: '' })
  const rows = await unavMonday(page)
  const st = await page.evaluate(() => {
    const mq = window.__mq, mon = mq.monday()
    const r = [...mon.querySelectorAll('.sec-unav .pl-row')].find(x => /Comet/.test(x.innerText))
    if (!r) return { err: 'no row' }
    const before = r.outerHTML.slice(0, 600)
    // the name re-lettered: Saber, as the page's example
    let renamed = 0
    const w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT); let n
    while ((n = w.nextNode())) if (/\bComet\b/.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace(/\bComet\b/, 'Saber'); renamed++ }
    // the row's own action button (the app's REJECT on an input row) re-lettered: the one thing 142 may do to VL
    const rej = [...r.querySelectorAll('button')].find(b => /^reject$/i.test(b.textContent.trim()))
    if (!rej) return { err: 'no reject button' }
    rej.textContent = 'Take him off VL'
    // a quiet line under the row saying where he is: the app's own remarks placeholder look, cloned
    const line = document.createElement('div'); line.setAttribute('data-mine', '1')
    const rm = [...r.querySelectorAll('*')].find(e => !e.children.length && e.textContent.trim() === 'remarks')
    const rcs = getComputedStyle(rm || r)
    line.style.cssText = `padding:0 8px 8px;font-size:${rcs.fontSize};color:${rcs.color};font-family:${rcs.fontFamily};opacity:.55`
    line.textContent = "On 149's VL, Mon night wave · 149 is told if he is taken off"
    r.after(line)
    const wrap = document.createElement('div'); wrap.setAttribute('data-mine', '1'); wrap.style.position = 'relative'
    r.before(wrap); wrap.appendChild(r); wrap.appendChild(line)
    mq.mark(wrap, 'Q4')
    return { renamed, row: r.innerText.replace(/\s+/g, ' '), before }
  })
  if (st.err) throw new Error('picQ4: ' + st.err + ' ' + rows.join(' | '))
  await page.waitForTimeout(300)
  const clip = await clipOf(page, null, 6)
  const f = `Q4F-${sz}-proposed.png`
  await shot(page, f, clip)
  rec(f, 'Q4', sz, 'proposed', `142's schedule, Edit Schedule, Monday's Unavailable list. Saber's "Attach · 149" row, the app's own (an Attach To 149, filed through the Inputs door), the name re-lettered. Drawn in (mark Q4): the line under it, "On 149's VL · Mon night wave · 149's line", and the row's own REJECT button re-lettered "Take him off VL". VL itself does not show on 142's schedule; 142 changes nothing else of it.`)
  notes.push(`picQ4 ${sz}: ${JSON.stringify(st)}`)
  await ctx.close()
}

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
try { for (const sz of ['d', 'p']) { try { await picQ4(sz) } catch (e) { errs.push(`[${sz}] picQ4 FAILED: ${e.message}`) } } }
finally { await browser.close() }
let old = {}
try { old = JSON.parse(readFileSync(`${OUT}/manifest.json`, 'utf8')) } catch {}
writeFileSync(`${OUT}/manifest.json`, JSON.stringify({ ...old, ...manifest }, null, 2) + '\n')
for (const f of readdirSync(OUT)) if (/^Q4F-.*\.png$/.test(f)) copyFileSync(`${OUT}/${f}`, `${PAGEIMG}/${f}`)
console.log('NOTES\n' + notes.join('\n'))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
