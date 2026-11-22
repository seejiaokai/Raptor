// The "142 ▾" button and its "Schedules" menu, made nicer — three options drawn on the REAL running app
// (chat 135's design helper, 22 Nov 26), by .claude/skills/brainstorming/mockups-on-the-real-app.md.
// The approved premise (b1-1, his D2132, D2197, D2201, D2252, D2253): the TALON mark's small number is a "142 ▾" button
// for anyone who may see more than one schedule; "Schedules" lists the squadrons he may see; on a phone it opens as a
// sheet from the top bar's foot, the page under it dimmed (redraw-b1.mjs b1). What each option changes is the menu's
// rows, how it says his own squadron, the one in view and what he may do there, and the button's look while open.
//   A  "Checklist"  — the app's small menu (.sb-moremenu, rows .sb-moreitem 38 tall; 44 on a phone): a cyan ✓ on the
//                     one in view, the number, and at the right one grey word for what he may do. A faint detachment
//                     line under 149 shows where batch 2's detachments would sit.
//   B  "Cards"      — the plans menu's buttons (.wavemenu .wm): two lines a squadron, the one in view in the app's
//                     picked look (the page tab's pale cyan), a grey "YOURS" badge, a line saying what he gets; the
//                     number on the bar drawn as a small chip so it reads as pressable.
//   C  "Sections"   — the phone side menu's look (.drawer-panel h4 headings, .drawer-nav rows): headings say what he
//                     may do ("Your squadron", "View only"), the rows only the numbers, the one in view lit as the
//                     side menu lights its page.
// Frames: m<A|B|C>1 — Hunter (142's admin) on 142's Edit Schedule, given View of 149 (drawn: the demo gives him one
// schedule, so his bar has no ▾ until the menu is built). mA2 — the recommended option with him looking at 149: drawn
// on 149's REAL View-only Sched (signed in as Kestrel, 149's admin, so the schedule under the menu is 149's own), the
// number re-lettered "149 ▾" and the menu his.
// Every new part wears the pink "New" mark: the outline drawn ON the element, the tag a child of the menu.
// Run from raptor-port/, against a built preview already serving (default http://localhost:4601/):
//   node docs/mock/2026-11-22-msq-b1-screens/draw-menu.mjs      MQ_ONLY=A1,B1 · MQ_SZ=d or p
import { chromium, webkit } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const URL_ = process.env.MQ_URL || 'http://localhost:4601/'
const IMG = 'docs/mock/2026-11-22-msq-b1-screens/img'
const ONLY = process.env.MQ_ONLY ? process.env.MQ_ONLY.split(',') : null
mkdirSync(IMG, { recursive: true })
const SIZES = {
  d: { name: 'desktop', eng: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', eng: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const NEW = '#ff2d95'
const MARK_CSS = `
.mkq { outline: 2px solid ${NEW} !important; outline-offset: -2px !important; }
.mkq-tag { position: absolute; z-index: 60; background: ${NEW}; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; font-style: normal; }
.toast, .toasts, #toast, #toastEl { display: none !important; }
*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}
`

// the kit (redraw-b1.mjs's, the mark kept to the one "new" colour)
function kit() {
  const mq = {}
  mq.vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  mq.hide = e => { e.setAttribute('data-mqhid', '1'); e.style.setProperty('display', 'none', 'important') }
  mq.topH = () => { const t = document.querySelector('.topbar'); return t && mq.vis(t) ? t.getBoundingClientRect().bottom : 0 }
  mq.checkTags = () => {
    const bad = []
    for (const t of document.querySelectorAll('.mkq-tag')) {
      const r = t.getBoundingClientRect()
      if (!(r.width > 0)) { bad.push('tag not drawn'); continue }
      if (r.left < 0 || r.right > innerWidth || r.top < 0) bad.push('tag off screen')
      for (let a = t.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        const cs = getComputedStyle(a)
        if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
          const c = a.getBoundingClientRect()
          if (r.left < c.left - 0.5 || r.right > c.right + 0.5 || r.top < c.top - 0.5 || r.bottom > c.bottom + 0.5) bad.push('tag clipped by ' + a.className)
        }
      }
    }
    return bad
  }
  window.__mq = mq
}

let browser
const errs = [], notes = []
async function world(sz, user, pass, pg) {
  const ctx = await browser.newContext(SIZES[sz].opts)
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`) })
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  await page.goto(URL_)
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('.topbar .mark .k')
  await page.waitForTimeout(1200)
  await page.evaluate(p => window.go(p), pg)
  await page.waitForSelector(`#page-${pg}.on .day`, { state: 'attached', timeout: 20000 })
  await page.waitForTimeout(1200)
  await page.addStyleTag({ content: MARK_CSS })
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
  return { ctx, page }
}

// ---------- the drawing, in the page ----------
function build({ opt, sz, view, own, rows, det }) {
  const mq = window.__mq, ph = sz === 'p'
  const el = (tag, css, txt) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; e.setAttribute('data-mine', '1'); return e }
  const CHECK = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M4.5 12.5l4.8 4.8L19.5 7" fill="none" stroke="#3BC6E8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'

  // the premise: his own number on the bar is the one in view, now a button
  const k = document.querySelector('.topbar .mark .k')
  if (!mq.vis(k) || k.textContent.trim() !== view) throw new Error('premise: the bar reads ' + k.textContent + ', not ' + view)
  const markEl = document.querySelector('.topbar .mark')
  const before = markEl.getBoundingClientRect()
  const k2 = k.cloneNode(true); k2.setAttribute('data-mine', '1'); k2.textContent = view + ' ▾'
  mq.hide(k); k.after(k2)
  if (opt === 'B') {
    // the number as a small chip (a hair line inside it, no size change: the padding is given back by the margin)
    k2.style.cssText += ';align-self:flex-start;color:var(--ink-2);box-shadow:inset 0 0 0 1px var(--edge-2);border-radius:4px;padding:2px 5px;margin:-2px -5px;background:rgba(255,255,255,.04)'
  }
  // the button while its menu is open: a pale fill round the whole mark, as a page tab lights on hover (no glow, no size change)
  markEl.style.cssText += ';background:rgba(255,255,255,.07);box-shadow:0 0 0 6px rgba(255,255,255,.07);border-radius:4px;outline:2px solid ' + '#ff2d95' + ';outline-offset:6px'
  const after = markEl.getBoundingClientRect()
  if (['x', 'y', 'width', 'height'].some(p => Math.abs(after[p] - before[p]) > 0.5)) throw new Error('the mark moved: ' + JSON.stringify([before, after]))

  // the panel: desktop hung under the mark (the approved place), phone the approved sheet
  const top = Math.round(mq.topH())
  const panel = el('div')
  const rowH = ph ? 44 : 38
  if (opt === 'A') {
    panel.className = 'sb-moremenu'
    panel.style.cssText = `position:fixed;z-index:490;min-width:${ph ? 0 : 268}px;padding:4px;`
  } else if (opt === 'B') {
    panel.className = 'wavemenu'
    panel.style.cssText = `position:fixed;z-index:490;min-width:${ph ? 0 : 272}px;max-width:none;`
  } else {
    panel.className = 'drawer-panel'
    panel.style.cssText = `position:fixed;bottom:auto;z-index:490;width:${ph ? 'auto' : '260px'};padding:${ph ? '10px 16px 14px' : '6px 10px 10px'};border:1px solid var(--edge-2);border-radius:10px;box-shadow:0 10px 28px rgba(0,0,0,.5);overflow:visible`
  }
  const head = (txt, first) => {
    if (opt === 'C') { const h = el('h4', first ? 'margin-top:6px' : 'margin-top:12px', txt); return h }
    // the plans menu's heading (.wavemenu h5), its words
    return el('h5', `margin:0;padding:${opt === 'A' ? (ph ? '10px 11px 6px' : '8px 11px 5px') : '2px 0 7px'};font-family:'Barlow Condensed','Inter Tight',sans-serif;text-transform:uppercase;letter-spacing:.1em;font-size:${ph ? 11 : 10}px;color:var(--ink-3);font-weight:700`, txt)
  }
  const accWord = r => r.own ? 'Your squadron' : r.acc

  if (opt === 'A') {
    panel.append(head('Schedules'))
    const rowA = (r, isDet) => {
      const b = el('button'); b.className = 'sb-moreitem'
      b.style.cssText = `width:100%;min-height:${rowH}px;font-size:${ph ? 15 : 13}px;${isDet ? 'opacity:.42;' : ''}`
      const c = el('span'); c.className = 'bi'; c.style.cssText = 'display:inline-flex;justify-content:center;align-items:center;flex:none'
      if (r.n === view) c.innerHTML = CHECK
      const n = el('span', `font-weight:${isDet ? 600 : 700};font-variant-numeric:tabular-nums;${isDet ? 'padding-left:14px;' : ''}`, r.n)
      const a = el('span', `margin-left:auto;padding-left:24px;font-size:${ph ? 13 : 12}px;font-weight:500;color:var(--ink-3)`, accWord(r))
      b.append(c, n, a); return b
    }
    for (const r of rows) { panel.append(rowA(r)); if (det && det.under === r.n) panel.append(rowA(det, true)) }
  } else if (opt === 'B') {
    panel.append(head('Schedules'))
    const box = el('div', 'display:flex;flex-direction:column;gap:6px')
    for (const r of rows) {
      const b = el('button'); b.className = 'wm'
      const cur = r.n === view
      b.style.cssText = `display:flex;flex-direction:column;align-items:flex-start;gap:3px;width:100%;min-height:${ph ? 52 : 46}px;justify-content:center;` +
        (cur ? 'background:rgba(59,198,232,.12);border-color:rgba(59,198,232,.5);' : '')
      const l1 = el('span', 'display:flex;align-items:center;gap:7px')
      l1.append(el('span', `font-size:${ph ? 16 : 14}px;font-weight:800;font-variant-numeric:tabular-nums;color:${cur ? 'var(--accent)' : 'var(--ink)'}`, r.n))
      if (r.own) {
        const g = el('span', "display:inline-block;font-family:'Barlow Condensed','Inter Tight',sans-serif;font-size:" + (ph ? 9.5 : 8.5) + "px;font-weight:800;letter-spacing:.08em;line-height:1.35;padding:0 5px;border-radius:3px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.22);color:var(--ink-2)", 'YOURS')
        l1.append(g)
      }
      b.append(l1, el('span', `font-size:${ph ? 12.5 : 11.5}px;font-weight:500;color:var(--ink-3)`, r.sub))
      box.append(b)
    }
    panel.append(box)
  } else {
    const groups = []
    for (const r of rows) { const g = accWord(r); let G = groups.find(x => x.g === g); if (!G) groups.push(G = { g, rs: [] }); G.rs.push(r) }
    groups.forEach((G, i) => {
      panel.append(head(G.g, i === 0))
      const nav = el('nav'); nav.className = 'drawer-nav'
      for (const r of G.rs) {
        const a = el('a', `display:flex;align-items:center;min-height:${rowH}px;box-sizing:border-box;font-weight:700;font-variant-numeric:tabular-nums;font-size:${ph ? 15 : 14}px`, r.n)
        if (r.n === view) a.className = 'on'
        nav.append(a)
      }
      panel.append(nav)
    })
  }

  const markR = markEl.getBoundingClientRect()
  if (!ph) {
    panel.style.left = Math.round(markR.left) + 'px'
    panel.style.top = (top + 12) + 'px'
  } else {
    const dim = el('div', `position:fixed;left:0;right:0;top:${top}px;bottom:0;background:rgba(0,0,0,.55);z-index:489`)
    document.body.appendChild(dim)
    panel.style.left = '0'; panel.style.right = '0'; panel.style.top = top + 'px'; panel.style.width = 'auto'
    panel.style.maxWidth = 'none'; panel.style.minWidth = '0'; panel.style.boxSizing = 'border-box'
    panel.style.borderRadius = '0 0 16px 16px'; panel.style.borderTop = '0'; panel.style.margin = '0'
    if (opt !== 'B') panel.style.padding = opt === 'A' ? '4px 8px 10px' : '8px 16px 14px'
  }
  document.body.appendChild(panel)
  // the New mark: the outline on the panel, the tag its child (top right)
  panel.classList.add('mkq')
  const t = el('span'); t.className = 'mkq-tag'; t.textContent = 'New'; t.style.top = '5px'; t.style.right = '6px'
  panel.appendChild(t)
  // keep the keys and the pointer off the drawn rows (no hover ring in the picture)
  for (const b of panel.querySelectorAll('button,a')) b.tabIndex = -1
  // measure: each row's height, the number column's left edge shared by every row
  const rr = [...panel.querySelectorAll('button.sb-moreitem,button.wm,.drawer-nav a')].map(b => Math.round(b.getBoundingClientRect().height))
  const pr = panel.getBoundingClientRect()
  return { top, panel: [pr.left, pr.top, pr.width, pr.height].map(Math.round), rows: rr, mark: [markR.left, markR.top, markR.width, markR.height].map(Math.round) }
}

const OWN = {
  view: '142',
  rows: [{ n: '142', own: true, sub: 'Every page' }, { n: '149', acc: 'View only', sub: 'Schedule and Logic · view only' }],
}
const AWAY = { ...OWN, view: '149' }
const DET = { n: '249 · Exercise North', acc: 'View only', under: '149' }

async function frame(sz, id, opt, state, who, pg, extra = {}) {
  const [user, pass] = who
  const { ctx, page } = await world(sz, user, pass, pg)
  const m = await page.evaluate(build, { opt, sz, ...state, ...extra })
  notes.push(`${id} ${sz}: ${JSON.stringify(m)}`)
  const bad = await page.evaluate(() => window.__mq.checkTags())
  if (bad.length) throw new Error(id + ': ' + bad.join('; '))
  // the premise again, just before the picture
  const ok = await page.evaluate(() => !!document.querySelector('body > [data-mine].mkq') && !!document.querySelector('.topbar .mark .k[data-mine]'))
  if (!ok) throw new Error(id + ': the drawn parts are gone')
  await page.mouse.move(Math.round(page.viewportSize().width / 2), page.viewportSize().height - 2)
  await page.waitForTimeout(200)
  const vp = page.viewportSize()
  const bottom = m.panel[1] + m.panel[3]
  const clip = sz === 'd' ? { x: 0, y: 0, width: 720, height: Math.min(vp.height, bottom + 48) } : { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, bottom + 90) }
  const f = `m${id}-${sz}.png`
  await page.screenshot({ path: `${IMG}/${f}`, clip })
  console.log('  wrote', f)
  await ctx.close()
}

const HUNTER = ['ad2', 'a2'], KESTREL = ['ad9', 'a9']
const JOBS = {
  A1: sz => frame(sz, 'A1', 'A', OWN, HUNTER, 'editsched', { det: DET }),
  B1: sz => frame(sz, 'B1', 'B', OWN, HUNTER, 'editsched'),
  C1: sz => frame(sz, 'C1', 'C', OWN, HUNTER, 'editsched'),
  A2: sz => frame(sz, 'A2', 'A', AWAY, KESTREL, 'viewsched'),
}
try {
  for (const sz of (process.env.MQ_SZ ? process.env.MQ_SZ.split(',') : ['d', 'p'])) {
    browser = await SIZES[sz].eng.launch()
    console.log('== ' + SIZES[sz].name)
    for (const [k, f] of Object.entries(JOBS)) {
      if (ONLY && !ONLY.includes(k)) continue
      try { await f(sz) } catch (e) { errs.push(`[${sz}] ${k} FAILED: ${e.message}`); console.log(k, 'FAILED', e.message) }
    }
    await browser.close()
  }
} finally { if (browser) await browser.close().catch(() => {}) }
console.log('NOTES\n' + notes.join('\n'))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
