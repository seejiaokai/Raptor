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
  const r = await page.evaluate(() => [...document.querySelectorAll('.rsans')].map(s => {
    const er = s.closest('.edit-roster, #eRoster, [class*=roster]'); const rr = s.getBoundingClientRect()
    const head = s.parentElement.closest('*') ; const h = document.querySelector('.er-h')
    return { vis: rr.width > 0, rect: [rr.x, rr.y, rr.width, rr.height].map(Math.round), wrap: er ? er.className + '#' + er.id : '', head: h ? h.innerText.replace(/\s+/g, ' ') : '', html: s.outerHTML.slice(0, 1800) }
  }))
  console.log('RSANS', JSON.stringify(r))
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

// ---------- E1 · 149's SANS availability on Edit Schedule, Tue 14 Jul: Ranger of 142 among 149's own (D2145) ----------
// Real: the crew panel (Aircrew) stepped to Tuesday by its own ›, its "SANS Avail · n free" list (the demo's SANS men,
// standing as 149's own); the top bar re-lettered "149" and the signed-in name "ACE". Drawn in: one more row, a free man's
// own row cloned and re-lettered Ranger, with round 5's grey squadron badge "142" beside his name, in the list's own order.
async function e1(sz) {
  const { ctx, page } = await world(sz)
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#page-editsched.on #eWeek .day'); await page.waitForTimeout(900)
  // the phone's crew panel is a pull-out drawer: its own tab opens it
  if (sz === 'p') { await page.locator('#eRoster .ros-tab').filter({ visible: true }).first().click(); await page.waitForTimeout(600) }
  // the crew panel's own › steps it from Monday to Tuesday
  const head = () => page.evaluate(() => { const h = [...document.querySelectorAll('#eRoster .er-h')].find(window.__mq.vis); return h ? h.innerText.replace(/\s+/g, ' ') : '' })
  for (let i = 0; i < 3 && !/TUESDAY/i.test(await head()); i++) {
    await page.locator('#eRoster .er-daynav[data-crewstep="1"]').filter({ visible: true }).first().click(); await page.waitForTimeout(500)
  }
  if (!/TUESDAY/i.test(await head())) throw new Error('e1: crew panel not on Tuesday: ' + await head())
  // on the phone the panel stands beside the week in one sideways scroll: bring it into view first, then draw
  await page.evaluate(() => { const s = document.querySelector('#eRoster .rsans'); s.scrollIntoView({ block: 'nearest', inline: 'end' }) })
  await page.waitForTimeout(400)
  const st = await page.evaluate((sz) => {
    const mq = window.__mq
    // the demo has a pilot of its own called Ranger (on 149's lines here): re-lettered Gale (one of 149's names in the
    // brief, not in the demo), so the only Ranger on screen is 142's SANS man
    const gale = mq.reletter(document.querySelector('#page-editsched'), 'Ranger', 'Gale')
    if (document.querySelector('#page-editsched').innerText.includes('Ranger')) return { err: 'a Ranger left after re-lettering' }
    const sec = [...document.querySelectorAll('#eRoster .rsans')].find(mq.vis)
    if (!sec) return { err: 'no SANS section in the crew panel' }
    const rows = [...sec.querySelectorAll(':scope > .rsans-row')]
    const free = rows.filter(r => { const p = r.querySelector('.rpuck'); return p && !p.classList.contains('no') && !p.classList.contains('busy') })
    const nm = r => r.querySelector('.nm').textContent
    const before = { rows: rows.map(r => nm(r) + (r.querySelector('.rsans-b') ? ' ' + r.querySelector('.rsans-b').textContent : '') + (r.querySelector('.rpuck.no') ? ' (crossed)' : r.querySelector('.rpuck.busy') ? ' (tasked)' : '')), head: sec.querySelector('.rh2').textContent }
    // his row: a free man's own row cloned (Rebel's, filed "F" all day), re-lettered Ranger
    const proto = free.find(r => nm(r) === 'Rebel') || free[0]
    if (!proto) return { err: 'no free row to clone', before }
    const c = mq.strip(proto.cloneNode(true))
    for (const p of c.querySelectorAll('.rpuck, .puck')) { p.removeAttribute('data-person'); if (p.title) p.title = p.title.replace(/^\S+/, 'Ranger') }
    c.querySelector('.nm').textContent = 'Ranger'
    // the grey squadron badge beside his name: after his puck, before his filed letters
    const b = mq.badge('142', sz === 'p'); b.style.marginLeft = '4px'; b.style.flex = '0 0 auto'
    c.querySelector('.rpuck').after(b)
    // the panel's own order: free men first, callsign order — Ranger before the first free man after him
    const after = free.find(r => nm(r).localeCompare('Ranger') > 0)
    if (after) after.before(c); else (free[free.length - 1] || rows[0]).after(c)
    // the heading counts the free men: one more
    const h = sec.querySelector('.rh2'); h.textContent = h.textContent.replace(/(\d+) free/, (m, n) => (+n + 1) + ' free')
    // 149's admin Ace: the top bar's number and signed-in name re-lettered
    mq.as149()
    const tb = document.querySelector('.topbar'); const n = mq.reletter(tb, 'SABER', 'ACE') + mq.reletter(tb, 'Saber', 'Ace')
    if (getComputedStyle(c).position === 'static') c.style.position = 'relative'
    // the ring inside the row's own box: the phone's drawer clips anything outside the row's sides
    const tg = mq.mark(c, 'D2145', 'in', 'blue'); tg.style.top = '50%'; tg.style.transform = 'translateY(-50%)'; tg.style.right = '3px'
    window.__mqSec = sec; window.__mqRow = c
    const br = b.getBoundingClientRect(), cr = c.getBoundingClientRect(), pr = proto.getBoundingClientRect(), tr = tg.getBoundingClientRect()
    const kids = [...c.children].filter(x => x !== tg).map(x => x.getBoundingClientRect())
    return { before, gale, proto: nm(proto) + ' ' + (proto.querySelector('.rsans-b') ? proto.querySelector('.rsans-b').textContent : ''),
      after: [...sec.querySelectorAll(':scope > .rsans-row')].map(nm), head: h.textContent, topRelettered: n,
      badge: [Math.round(br.width), Math.round(br.height)], rowH: [Math.round(pr.height), Math.round(cr.height)],
      tagOverlaps: kids.some(k => k.right > tr.left && k.left < tr.right && k.bottom > tr.top && k.top < tr.bottom) }
  }, sz)
  if (st.err) throw new Error('e1 ' + st.err + ' ' + JSON.stringify(st.before || ''))
  // framing: from the top bar (149, ACE) down to the foot of the panel's SANS list
  const clip = await page.evaluate((sz) => {
    const mq = window.__mq, s = window.__mqSec, ros = document.querySelector('#eRoster')
    if (s.getBoundingClientRect().bottom > innerHeight - 8) mq.scrollUnder(s, 220)
    const sr = s.getBoundingClientRect()
    return { x: 0, y: 0, width: innerWidth, height: Math.min(innerHeight, Math.round(sr.bottom + 16)) }
  }, sz)
  await page.waitForTimeout(250)
  const f = `R7E1-${sz}-proposed.png`
  await shot(page, f, process.env.MQ_FULL ? undefined : clip)
  rec(f, 'E1', sz, 'proposed', `149's Edit Schedule, signed in as 149's admin Ace (the top bar's "142" and "SABER" re-lettered "149" and "ACE"). The crew panel stepped to Tuesday by its own ›; its "SANS Avail" list, real (the demo's SANS men, standing as 149's own: ${st.before.rows.join(', ')}). Drawn in, blue D2145: one more row, a free man's own row cloned (${st.proto}) and re-lettered Ranger, a SANS man of 142, with the grey squadron badge "142" (round 4's and round 5's recipe) beside his name; placed in the panel's own order (free men first, callsign order) and the heading's count raised by one ("${st.head}"). The demo's own pilot Ranger is re-lettered Gale throughout, so the only Ranger on screen is 142's.${sz === 'p' ? ' Phone: the crew panel is the pull-out drawer, opened by its own tab.' : ''}`)
  notes.push(`e1 ${sz}: ${JSON.stringify(st)}`)
  await ctx.close()
}

// ---------- E2 · today: "+ SANS" on the Leave War, then Post out on a SANS man's row (no proposal) ----------
const E2_PID = 'nick', E2_ISO = '2026-11-27'   // Tally, one of the demo's SANS men; a Friday the war's grid draws
async function e2(sz) {
  const { ctx, page } = await world(sz)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await page.waitForTimeout(800)
  const before = await page.locator(`[data-testid="row-${E2_PID}"]`).count()
  await page.locator('[data-testid="settings-open"]').filter({ visible: true }).first().click(); await page.waitForTimeout(500)
  await page.locator('[data-testid="gadd-SANS"]').filter({ visible: true }).first().click(); await page.waitForTimeout(500)
  await page.keyboard.press('Escape'); await page.waitForTimeout(500)
  // the settings sheet closed by its own Escape; if it is still up, by its own close control
  if (await page.locator('[data-testid="gadd-SANS"], [data-testid="group-offer"]').filter({ visible: true }).count()) {
    const x = page.locator('[role="dialog"] button[aria-label*="Close"], [role="dialog"] .x, [data-testid="settings-close"]').filter({ visible: true })
    if (await x.count()) { await x.first().click(); await page.waitForTimeout(500) }
  }
  const after = await page.locator(`[data-testid="row-${E2_PID}"]`).count()
  if (!after) throw new Error(`e2: no row for ${E2_PID} after + SANS (before ${before})`)
  const c = page.locator(`[data-testid="cell-${E2_PID}-${E2_ISO}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
  if (sz === 'p') await c.tap(); else await c.click()
  await page.waitForTimeout(700)
  const sheet1 = await page.evaluate(() => { const s = window.__mq.sheet(); return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 200) : null })
  let more = 0, po = 0
  if (sheet1) {
    more = await page.locator('.bidsheet[role="dialog"] [data-testid="bid-more"]').filter({ visible: true }).count()
    if (more) { await page.locator('.bidsheet[role="dialog"] [data-testid="bid-more"]').filter({ visible: true }).last().click(); await page.waitForTimeout(400) }
    po = await page.locator('[data-testid="bid-postout"]').filter({ visible: true }).count()
    if (po) { await page.locator('[data-testid="bid-postout"]').filter({ visible: true }).last().click(); await page.waitForTimeout(700) }
  }
  const st = await page.evaluate(() => {
    const mq = window.__mq, s = mq.sheet()
    if (!s) return { sheet: false }
    const row = s.querySelector('.po-outcomes')
    const ttl = s.querySelector('.ttl') ? s.querySelector('.ttl').innerText : ''
    // a neutral press target, so no chip is left focused
    const h = s.querySelector('.who') || s; h.click && h.tagName !== 'BUTTON' && h.click()
    return { sheet: true, who: s.querySelector('.who') ? s.querySelector('.who').textContent : '', when: s.querySelector('.when') ? s.querySelector('.when').textContent : '', ttl,
      chips: row ? [...row.querySelectorAll('button')].map(b => b.textContent.trim() + (b.disabled ? ' (greyed)' : '')) : null,
      line: s.querySelector('[data-testid="po-line"]') ? s.querySelector('[data-testid="po-line"]').textContent : '',
      postBtn: [...s.querySelectorAll('button')].filter(b => b.textContent.trim() === 'Post out').map(b => b.disabled ? 'greyed' : 'live').join(','),
      text: s.innerText.replace(/\s+/g, ' ').slice(0, 400) }
  })
  await page.waitForTimeout(200)
  const f = `R7E2-${sz}-today.png`
  if (st.sheet) {
    const b = await page.evaluate(() => { const r = window.__mq.sheet().getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } })
    const pad = 16, vw = page.viewportSize()
    await shot(page, f, { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - 40), width: Math.min(vw.width, b.w + 2 * pad), height: Math.min(vw.height - Math.max(0, b.y - 40), b.h + 40 + pad) })
  } else await shot(page, f)
  rec(f, 'E2', sz, 'today', st.sheet
    ? `Today, real, no proposal: Leave War, ⚙ settings → "+ SANS" pressed (the SANS group's row added; Tally, one of the demo's SANS men, now has a row). His day ${E2_ISO} tapped → the day's sheet → "More" → "Post out": the Post out sheet opens for him as for anyone. Its Posting chips: ${(st.chips || []).join(' · ')}. Its line: "${st.line}". Post out button: ${st.postBtn || 'none'}.`
    : `Today, real, no proposal: Leave War, ⚙ settings → "+ SANS" pressed; Tally's day tapped: no sheet opened (more: ${more}, Post out item: ${po}).`)
  notes.push(`e2 ${sz}: rows before ${before} after ${after}; sheet1 ${JSON.stringify(sheet1)}; more ${more}; postout ${po}; ${JSON.stringify(st)}`)
  await ctx.close()
}

// ---------- E3 · Admin → Users, a SANS man of 142 with no row on the Leave War: "Post out…" (Q23) ----------
const E3_NAME = 'Tally', E3_PID = 'nick'
const E3_LINE = 'Opens the Leave War\'s Post out sheet. Shown only for someone with no row on the Leave War.'
async function e3(sz) {
  const { ctx, page } = await world(sz)
  // the premise, on screen: SANS men are off the war (the demo's default), so Tally has no row there
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await page.waitForTimeout(800)
  const lwRows = await page.locator(`[data-testid="row-${E3_PID}"]`).count()
  if (lwRows) throw new Error('e3: Tally has a row on the Leave War')
  await page.evaluate(() => window.go('admin'))
  await page.waitForSelector('#page-admin.on button.acc-main', { state: 'attached' }); await page.waitForTimeout(500)
  if (!(await page.locator('#page-admin button.acc-main').first().isVisible())) {
    await page.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first().click()
    await page.waitForSelector('#page-admin.on button.acc-main'); await page.waitForTimeout(500)
  }
  const btn = page.locator('#page-admin button.acc-main', { hasText: new RegExp('^' + E3_NAME) }).first()
  await btn.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
  await btn.click(); await page.waitForTimeout(500)
  const st = await page.evaluate(({ E3_LINE }) => {
    const mq = window.__mq
    const ed = [...document.querySelectorAll('#page-admin .acc-edit')].find(mq.vis)
    if (!ed) return { err: 'no editor' }
    const acts = ed.querySelector('.acc-acts')
    const arch = acts.querySelector('#accEdArchive') || [...acts.querySelectorAll('button')].find(b => b.textContent.trim() === 'Archive')
    const b = mq.strip(arch.cloneNode(true)); b.textContent = 'Post out…'
    arch.after(b)
    // the line in the editor's own quiet note type (its "adm-note acc-note" line, as under Delete's second tap)
    const p = document.createElement('p'); p.className = 'adm-note acc-note'; p.setAttribute('data-mine', '1'); p.textContent = E3_LINE
    acts.after(p)
    if (getComputedStyle(b).position === 'static') b.style.position = 'relative'
    // the ring 2px outside the button (a wider one crosses the line under it); its tag on the ring's top-right corner
    const tg = mq.mark(b, 'Q23', 'inO', 'pink'); tg.style.top = '-12px'; tg.style.right = '-10px'
    const row = ed.closest('.acc-row') || ed.parentElement
    window.__mqClipEl = row
    row.scrollIntoView({ block: 'center' })
    document.activeElement && document.activeElement.blur && document.activeElement.blur()
    const cs = getComputedStyle(arch), cb = getComputedStyle(b)
    return { row: row.querySelector('.acc-main').innerText.replace(/\s+/g, ' '), buttons: [...acts.querySelectorAll('button')].map(x => x.textContent.trim()),
      same: ['font-size', 'height', 'background-color', 'color', 'border-top-color'].every(k => cs.getPropertyValue(k) === cb.getPropertyValue(k)),
      line: p.textContent, lineFont: getComputedStyle(p).fontSize + ' ' + getComputedStyle(p).color }
  }, { E3_LINE })
  if (st.err) throw new Error('e3 ' + st.err)
  await page.waitForTimeout(250)
  const f = `R7E3-${sz}-proposed.png`
  await shot(page, f, await clipOf(page, { pad: 14, top: 40, extraH: 6 }))
  rec(f, 'E3', sz, 'proposed', `Admin → Users, Tally's row opened (real: a SANS man of 142, "${st.row}"; SANS men are off the Leave War, so he has no row there — checked on screen first). Drawn in, pink Q23: one button "Post out…", the editor's own Archive button cloned, after Archive (buttons: ${st.buttons.join(' · ')}). Under the buttons, in the editor's own quiet note line: "${E3_LINE}"`)
  notes.push(`e3 ${sz}: ${JSON.stringify(st)}`)
  await ctx.close()
}

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ALL = { e1, e2, e3 }
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
