// Multi-squadron & detachment — Round 7, Group E (SANS men across squadrons), drawn on the REAL running app by
// .claude/skills/brainstorming/mockups-on-the-real-app.md, to the drawing brief
// docs/superpowers/briefs/2026-11-17-multi-sqn-r7-drawing.md ("Read first", "Rules for every picture") and the host's
// three items E1–E3, whose words are the spec, drawn letter for letter. Two mark colours (his D2159): BLUE #0e7fa6 for
// what he has already ruled, PINK #ff2d95 for what is new in round 7 or a question. Each mark is drawn ON its element by
// mq.mark (outline + child tag), never laid over. Helpers copied whole from draw-r7d.mjs (kit, world, shot, clipOf) and
// round 5's grey badge recipe (docs/mock/2026-11-17-multi-sqn-r5/draw.mjs, mq.badge). Every proposed frame adds nodes
// marked data-mine, hides an app node (display:none, never removed) or changes a real node's words; nothing is removed.
// Demo data only; names re-lettered where the brief names someone the demo does not have.
//
// Run from raptor-port/, against a built preview already serving:
//   MQ_URL=http://localhost:4180/ node docs/mock/2026-11-17-multi-sqn-r7/draw-r7e.mjs
// MQ_ONLY=e1,e3 draws only those; MQ_SZ=d or p one size; MQ_PROBE=1 prints what the screens hold and draws nothing.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, readdirSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.MQ_URL || 'http://localhost:4180/'
const PAGEIMG = 'docs/mock/2026-11-17-multi-sqn-r7/img'
const OUT = 'docs/img/2026-11-17-multi-sqn-r7'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
mkdirSync(OUT, { recursive: true }); mkdirSync(PAGEIMG, { recursive: true })

const SIZES = {
  d: { name: 'desktop', opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
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
  // the top bar's own squadron number re-lettered (149's admin): round 4's way
  mq.as149 = () => { const k = document.querySelector('.topbar .mark .k'); if (k && mq.vis(k)) { const k2 = mq.strip(k.cloneNode(true)); k2.textContent = '149'; mq.hide(k); k.after(k2) } }
  // text nodes inside root: every whole word a → b
  mq.reletter = (root, a, b) => {
    let n = 0; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let tn
    while ((tn = w.nextNode())) { const re = new RegExp('\\b' + a + '\\b', 'g'); if (re.test(tn.nodeValue)) { tn.nodeValue = tn.nodeValue.replace(re, b); n++ } }
    return n
  }
  // the grey badge of round 2's look 2 (D2104), round 4's and round 5's recipe: the standby lines' MAIN badge in neutral grey
  mq.badge = (txt, small) => {
    const c = document.createElement('span'); c.className = 'sarole ro'; c.textContent = txt; c.setAttribute('data-mine', '1')
    c.style.background = 'rgba(255,255,255,.08)'; c.style.borderColor = 'rgba(255,255,255,.22)'; c.style.color = 'var(--ink-2)'
    c.style.verticalAlign = 'middle'; c.style.alignSelf = 'center'
    if (small) { c.style.fontSize = '7px'; c.style.padding = '0 4px' }
    return c
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
async function clipOf(page, { pad = 8, top = 0, extraH = 0, full = false } = {}) {
  return page.evaluate(({ pad, top, extraH, full }) => {
    const e = window.__mqClipEl, r = e.getBoundingClientRect()
    const x = full ? 0 : Math.max(0, r.left - pad), y = Math.max(window.__mq.topH(), r.top - pad - top)
    const w = full ? innerWidth : Math.min(innerWidth - x, r.width + pad * 2), h = Math.min(innerHeight - y, r.bottom + pad + extraH - y)
    return { x, y, width: w, height: h }
  }, { pad, top, extraH, full })
}

// ---------- probe ----------
async function probe(sz) {
  const { ctx, page } = await world(sz)
  const a = await page.evaluate(() => {
    const P = window.PEOPLE || {}
    const sans = Object.entries(P).filter(([, p]) => p.san).map(([id, p]) => `${id}:${p.name || p.cs || ''}${p.archived ? '(arch)' : ''}`)
    return { top: document.querySelector('.topbar') ? document.querySelector('.topbar').innerText.replace(/\s+/g, ' ') : '', sans, keys: Object.keys(P).length }
  })
  console.log('PROBE', JSON.stringify(a))
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#page-editsched.on #eWeek .day'); await page.waitForTimeout(900)
  const b = await page.evaluate(() => {
    const mq = window.__mq
    return mq.days().map(d => ({ head: (d.querySelector('.day-head') || d).innerText.replace(/\s+/g, ' ').slice(0, 50), sans: d.querySelector('.sec-sans') ? d.querySelector('.sec-sans').outerHTML.slice(0, 1500) : null }))
  })
  for (const x of b) console.log('DAY', JSON.stringify(x.head), !!x.sans)
  // Admin → Users: Tally's row
  await page.evaluate(() => window.go('admin'))
  await page.waitForSelector('#page-admin.on button.acc-main', { state: 'attached' }); await page.waitForTimeout(500)
  if (!(await page.locator('#page-admin button.acc-main').first().isVisible())) {
    await page.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first().click()
    await page.waitForSelector('#page-admin.on button.acc-main'); await page.waitForTimeout(500)
  }
  const c = await page.evaluate(() => [...document.querySelectorAll('#page-admin .acc-row')].filter(r => /Tally|Zulu|Rebel/.test(r.innerText)).map(r => r.className + ' | ' + r.innerText.replace(/\s+/g, ' ')))
  console.log('ADMIN', JSON.stringify(c))
  // Leave War: settings, + SANS
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await page.waitForTimeout(800)
  const before = await page.locator('[data-testid="row-nick"]').count()
  await page.locator('[data-testid="settings-open"]').filter({ visible: true }).first().click(); await page.waitForTimeout(500)
  const chips = await page.evaluate(() => [...document.querySelectorAll('[data-testid="group-offer"] button')].map(b => b.textContent.trim()))
  console.log('LW before', before, 'chips', JSON.stringify(chips))
  await ctx.close()
}

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ALL = { }
try {
  for (const sz of (process.env.MQ_SZ ? process.env.MQ_SZ.split(',') : ['d', 'p'])) {
    if (process.env.MQ_PROBE) { await probe(sz); continue }
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
  try { old = JSON.parse(readFileSync(`${OUT}/manifest-r7e.json`, 'utf8')) } catch {}
  writeFileSync(`${OUT}/manifest-r7e.json`, JSON.stringify({ ...old, ...manifest }, null, 2) + '\n')
  copyFileSync(`${OUT}/manifest-r7e.json`, `${PAGEIMG}/manifest-r7e.json`)
  for (const f of readdirSync(PAGEIMG)) if (/^R7E/.test(f)) copyFileSync(`${PAGEIMG}/${f}`, `${OUT}/${f}`)
}
console.log('NOTES\n' + notes.join('\n'))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
