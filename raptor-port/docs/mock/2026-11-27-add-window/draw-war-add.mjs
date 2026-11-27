// Chat 192, 27 Nov 26 — his D2866: "dropdown kept i was asking about the redesign for this", with a picture of the Leave
// War's window. His F5 question ("what about inputting new inputs like LL OL CSE etc? Are there buttons for it?") is about
// the clean sheet's window opened from the war's grid. Drawn on the REAL app as Saber (admin), on Cutter's empty Wed 22 Jul:
//   w1 today — the war's window on an empty day: the leave buttons (each with what is left) and CSE · OD · Grant OIL · ⋯
//   w2 proposed — the same buttons kept; the ⋯ lists every other type the Inputs page's dropdown has (built from the ⋯'s
//      own rows), then Post out and Post in
//   w3 today — after pressing CSE: the window's line sends you to the Inputs page for the rest
//   w4 proposed — after pressing CSE: the entry's own window opens right there — the Inputs page's own window (cloned
//      from the real one, filled the same: CSE, Cutter, Wed 22 Jul), its Type dropdown kept (D2866)
// Nothing under raptor-port/src changes; w3's press files a CSE in the demo data of the drawing's own browser only.
// Run from raptor-port/, one size a process, against an already-served build:
//   node docs/mock/2026-11-27-add-window/draw-war-add.mjs --size d --url http://127.0.0.1:4181/ [--pw <package.json>]
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
const VERSION = 'draw-war-add v1.0 (27 Nov 26, chat 192)'
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d }
const SIZE = arg('size', 'd'), URL = arg('url', 'http://127.0.0.1:4181/')
const IMG = path.resolve(arg('img', 'docs/mock/2026-11-27-add-window/img'))
const PHONE = SIZE === 'p'
const PW = createRequire(arg('pw', process.cwd() + '/package.json'))('playwright')
const sleep = ms => new Promise(r => setTimeout(r, ms))
mkdirSync(IMG, { recursive: true })
console.log(VERSION, '| size', PHONE ? 'phone 402x874 WebKit 3x' : 'desktop 1536x864 Chromium 2x')

/* the types the war's ⋯ would add — the Inputs page dropdown's "Duty & other commitments" not already a button (CSE, OD),
   in the dropdown's own order; Attach and Other are already there */
const MORE = ['Training', 'Meeting', 'Personal', 'Appointment', 'Duty', 'Event']

const MARKCSS = `.dcr-mk{outline:2px solid #FFC83D !important;outline-offset:2px}
.dcr-tag{position:fixed;z-index:2147483647;background:#FFC83D;color:#15171c;font:800 11px/17px system-ui,sans-serif;padding:0 6px;border-radius:9px;pointer-events:none;box-shadow:0 0 0 1px #15171c;white-space:nowrap}
.dcr-sep{height:1px;background:rgba(255,255,255,.10);margin:4px 6px}`
async function press(p, loc) {
  const l = typeof loc === 'string' ? p.locator(loc).first() : loc
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (PHONE) await l.tap(); else await l.click()
}
async function nav(p, name) {
  const re = new RegExp('^\\s*' + name + '\\s*$')
  const vis = p.locator('button:visible, a:visible').filter({ hasText: re })
  if (await vis.count()) await press(p, vis.first())
  else { await press(p, p.locator('[aria-label="Menu"]:visible').first()); await sleep(500); await press(p, p.locator('button:visible, a:visible').filter({ hasText: re }).first()) }
  await sleep(1500)
}
async function signIn(p) {
  await p.goto(URL, { timeout: 60000, waitUntil: 'commit' })
  await p.waitForSelector('#luser', { timeout: 60000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { timeout: 60000 }); await sleep(800)
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' + MARKCSS })
}
const cell = d => `[data-testid="cell-psy-2026-07-${d}"]`
async function warOpen(p) {
  await nav(p, 'Leave War'); await sleep(2000)
  await press(p, p.locator('button:visible').filter({ hasText: /^JUL$/ }).first()); await sleep(1200)
  await p.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), cell('22')); await sleep(400)
  await press(p, cell('22')); await sleep(1000)
}
const sheet = `.bidsheet`
async function tags(p, list) {
  await p.evaluate(list => {
    document.querySelectorAll('.dcr-tag').forEach(t => t.remove())
    for (const [sel, text, side] of list) {
      const e = [...document.querySelectorAll(sel)].filter(x => x.getBoundingClientRect().width > 0)[0]
      if (!e) continue
      const r = e.getBoundingClientRect(), t = document.createElement('span')
      t.className = 'dcr-tag'; t.textContent = text; document.body.appendChild(t)
      const tw = t.getBoundingClientRect().width
      t.style.left = (side === 'r' ? Math.min(innerWidth - tw - 2, r.right + 4) : Math.max(2, r.left - tw - 6)) + 'px'
      t.style.top = Math.max(2, r.top + 1) + 'px'
    }
  }, list)
}
async function mark(p, sel) { await p.evaluate(s => document.querySelectorAll(s).forEach(e => { if (e.getBoundingClientRect().width > 0) e.classList.add('dcr-mk') }), sel) }
async function unmark(p) { await p.evaluate(() => { document.querySelectorAll('.dcr-mk').forEach(e => e.classList.remove('dcr-mk')); document.querySelectorAll('.dcr-tag').forEach(t => t.remove()) }) }
/* the picture: the union of the given elements and the tags, with a margin of the grid behind */
async function shot(p, name, sels, pad = 16) {
  await sleep(300)
  /* no tap elsewhere to clear a touch's hover: a tap outside the war's window closes it */
  const box = await p.evaluate(([sels, pad]) => {
    const rs = [...sels.flatMap(s => [...document.querySelectorAll(s)]), ...document.querySelectorAll('.dcr-tag')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.getBoundingClientRect())
    const x = Math.max(0, Math.min(...rs.map(r => r.left)) - pad), y = Math.max(0, Math.min(...rs.map(r => r.top)) - pad)
    const x2 = Math.min(innerWidth, Math.max(...rs.map(r => r.right)) + pad), y2 = Math.min(innerHeight, Math.max(...rs.map(r => r.bottom)) + pad)
    return { x, y, width: x2 - x, height: y2 - y }
  }, [sels, pad])
  const f = `${name}-${PHONE ? 'phone' : 'desktop'}.png`
  await p.screenshot({ path: path.join(IMG, f), clip: box })
  console.log('  picture', f, Math.round(box.width) + 'x' + Math.round(box.height))
}
const fact = (what, v) => console.log('  ' + what + ':', typeof v === 'string' ? v : JSON.stringify(v))

/* the Inputs page's own window, filled as the CSE press would leave it, kept as markup to lay over the war */
async function cloneEntryWindow(p) {
  await nav(p, 'Inputs')
  if (await p.locator('#inListBtn:visible').count()) { await press(p, '#inListBtn'); await sleep(400) }
  await press(p, '#inNew'); await p.waitForSelector('#inpEditPop', { timeout: 8000 }); await sleep(400)
  await p.selectOption('#inpEditType', 'CSE'); await sleep(300)
  await p.selectOption('#inpEditPerson', 'psy'); await sleep(300)
  const d = p.locator('[data-testid="inpEdCal-day-2026-07-22"]')
  for (let i = 0; i < 12 && !(await d.count()); i++) { await press(p, p.locator('#inpEditPop button[aria-label*="ext"], #inpEditPop button:has-text("›")').last()); await sleep(250) }
  await press(p, d); await sleep(300)
  const got = await p.evaluate(() => {
    /* the whole window — its title bar included — with the surface its page's styles give it */
    const inner = document.getElementById('inpEditPop')
    let w = inner; for (let e = inner; e && e !== document.body; e = e.parentElement) { if (/airpop|dialog|modal/i.test(e.className || '') || e.getAttribute('role') === 'dialog') { w = e } }
    const r = w.getBoundingClientRect()
    const look = el => { const s = getComputedStyle(el); return { bg: s.backgroundColor, border: s.border, radius: s.borderRadius, shadow: s.boxShadow } }
    const surfaces = [w, ...w.querySelectorAll('*')].filter(e => { const s = getComputedStyle(e); return s.backgroundColor !== 'rgba(0, 0, 0, 0)' }).length
    window.__dkClone = { html: w.outerHTML, x: r.x, y: r.y, w: r.width, h: r.height, look: look(w), lookIn: look(inner), surfaces }
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), head: w.querySelector('.airpop-head, .airpop-title')?.textContent?.trim() }
  })
  fact('the entry window cloned', got)
  await press(p, '#inpEditCancel'); await sleep(500)
}

async function run(p) {
  /* w4's markup first, while the Inputs page is reachable without the war in the way */
  await cloneEntryWindow(p)
  await warOpen(p)
  fact('today, empty day: the rows', await p.evaluate(() => [...document.querySelector('.bidsheet').querySelectorAll('.bidsheet-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim())))
  /* w1 today */
  await mark(p, `${sheet} [role="group"][aria-label="Which leave"]`); await mark(p, `${sheet} .bp-extra`)
  await tags(p, [[`${sheet} [role="group"][aria-label="Which leave"]`, '1'], [`${sheet} .bp-extra`, '2']])
  await shot(p, 'w1-war-empty-today', [sheet, cell('22')]); await unmark(p)
  /* w2 proposed: the ⋯ lists every other type */
  await press(p, '[data-testid="bid-more"]'); await sleep(500)
  const menu = await p.evaluate(MORE => {
    const m = [...document.querySelectorAll('[data-testid="bid-more-menu"]')].find(e => e.getBoundingClientRect().width > 0)
    const proto = m.querySelector('[data-testid="bid-file-OTH"]')
    const before = [...m.children].map(c => c.textContent.trim())
    const postout = m.querySelector('[data-testid="bid-postout"]')
    for (const t of MORE) { const b = proto.cloneNode(true); b.textContent = t; b.removeAttribute('title'); b.removeAttribute('data-testid'); b.classList.add('dk-new'); m.insertBefore(b, m.querySelector('[data-testid="bid-file-ATCH"]')) }
    const sep = document.createElement('div'); sep.className = 'dcr-sep'; m.insertBefore(sep, postout)
    /* the menu scrolls inside a set height; drawn whole, so every row is seen (a built one would size to its rows) */
    m.style.maxHeight = 'none'; m.style.overflow = 'visible'; m.scrollTop = 0
    /* the window clips what hangs above it: the menu is lifted out onto the page, standing where it stood, its foot on
       the ⋯ button's top and its right edge where it was */
    const mr = m.getBoundingClientRect(), br = document.querySelector('[data-testid="bid-more"]').getBoundingClientRect()
    const cs = getComputedStyle(m)
    const keep = { background: cs.backgroundColor, border: cs.border, borderRadius: cs.borderRadius, padding: cs.padding, boxShadow: cs.boxShadow, display: cs.display, flexDirection: cs.flexDirection, gap: cs.gap }
    /* each row keeps the look the war's styles gave it inside the window (plain rows, the board's menu look) */
    const proto0 = getComputedStyle(m.querySelector('[data-testid="bid-postout"]'))
    const rowLook = { background: proto0.backgroundColor, border: proto0.border, color: proto0.color, padding: proto0.padding, font: proto0.font, textAlign: proto0.textAlign, borderRadius: proto0.borderRadius, height: proto0.height, minHeight: proto0.minHeight, display: proto0.display, alignItems: proto0.alignItems, width: '100%', boxSizing: 'border-box' }
    m.querySelectorAll('button').forEach(b => Object.assign(b.style, rowLook))
    document.body.appendChild(m)
    Object.assign(m.style, keep, { position: 'fixed', right: (innerWidth - mr.right) + 'px', left: 'auto', top: 'auto', bottom: (innerHeight - br.top + 4) + 'px', width: mr.width + 'px', zIndex: 9000 })
    return { before, after: [...m.children].map(c => c.textContent.trim() || '—') }
  }, MORE)
  fact('the ⋯ today → proposed', menu)
  await mark(p, '[data-testid="bid-more-menu"]')
  await tags(p, [['[data-testid="bid-more-menu"]', '3']])
  await shot(p, 'w2-war-more-proposed', [sheet, '[data-testid="bid-more-menu"]', cell('22')]); await unmark(p)
  /* the lifted menu leaves the page's own window unable to close cleanly: a fresh page for the next two frames */
  await signIn(p); await cloneEntryWindow(p); await warOpen(p)
  /* w3 today: press CSE */
  await press(p, `${sheet} .bp-extra button:has-text("CSE")`); await sleep(1200)
  if (!(await p.locator(`${sheet}:visible`).count())) { await press(p, cell('22')); await sleep(900) }
  const held = await p.evaluate(() => { const l = document.querySelector('.bidsheet [data-testid="bid-heldday"]'); return l ? l.textContent.replace(/\s+/g, ' ').trim() : null })
  fact('today, after CSE: the window\'s line', held)
  if (held) { await mark(p, `${sheet} [data-testid="bid-heldday"]`); await tags(p, [[`${sheet} [data-testid="bid-heldday"]`, '4']]) }
  await shot(p, 'w3-war-after-cse-today', [sheet, cell('22')]); await unmark(p)
  /* w4 proposed: the entry's own window opens right there */
  const placed = await p.evaluate(() => {
    const c = window.__dkClone; if (!c) return null
    document.querySelectorAll('.bidsheet').forEach(s => { s.style.visibility = 'hidden' })
    const host = document.createElement('div'); host.innerHTML = c.html
    const w = host.firstElementChild; w.id = 'dkEntry'; w.classList.add('dk-entry')
    /* where the Inputs page stands it, under the top bar, no taller than the screen (its body scrolls, as the real one's) */
    const top = Math.max(60, Math.min(c.y, innerHeight - 200)), hgt = Math.min(c.h, innerHeight - top - 8)
    w.style.cssText += `;position:fixed;left:${c.x}px;top:${top}px;width:${c.w}px;height:${hgt}px;max-height:${hgt}px;z-index:9000;margin:0;display:flex;flex-direction:column;overflow:hidden`
    /* the surface the Inputs page's styles gave it there (its panel colour, edge, corners and depth) */
    const bg = c.look.bg !== 'rgba(0, 0, 0, 0)' ? c.look : c.lookIn
    Object.assign(w.style, { backgroundColor: bg.bg, border: bg.border, borderRadius: bg.radius, boxShadow: bg.shadow })
    /* markup carries no picked value: put back what was picked in the real window */
    const ty = w.querySelector('#inpEditType'); if (ty) ty.value = 'CSE'
    const pe = w.querySelector('#inpEditPerson'); if (pe) pe.value = 'psy'
    w.querySelectorAll('*').forEach(e => { if (e.scrollTop) e.scrollTop = 0 })
    const head = [...w.querySelectorAll('*')].find(e => e.children.length === 0 && /^New input/.test(e.textContent.trim())); if (head) head.textContent = 'CSE · Cutter · Wed 22 Jul'
    const save = w.querySelector('#inpEditSave'); if (save) save.textContent = 'Save'
    const cancel = w.querySelector('#inpEditCancel'); if (cancel) { cancel.textContent = 'Delete'; cancel.style.color = '#ff8a8a' }
    document.body.appendChild(w)
    const typeRow = w.querySelector('#inpEditType')?.closest('.inped-f'); if (typeRow) typeRow.classList.add('dk-typerow')
    return { head: head?.textContent, rows: [...w.querySelectorAll('.inped-k')].map(k => k.textContent.trim()) }
  })
  fact('the entry window laid over the war', placed)
  await mark(p, '#dkEntry .dk-typerow')
  await tags(p, [['#dkEntry', '5'], ['#dkEntry .dk-typerow', '6']])
  await shot(p, 'w4-war-after-cse-proposed', ['#dkEntry', cell('22')]); await unmark(p)
}

const engine = PHONE ? PW.webkit : PW.chromium
const browser = await engine.launch()
const ctx = await browser.newContext(PHONE
  ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
  : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
p.setDefaultTimeout(10000)
p.on('pageerror', e => console.log('PAGEERROR', e.message))
p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)) })
try { await signIn(p); await run(p); console.log('DONE', VERSION) }
catch (e) { console.log('FAILED', e.message.split('\n')[0]); await p.screenshot({ path: path.join(IMG, `fail-${PHONE ? 'phone' : 'desktop'}.png`) }).catch(() => {}) }
finally { await browser.close() }
