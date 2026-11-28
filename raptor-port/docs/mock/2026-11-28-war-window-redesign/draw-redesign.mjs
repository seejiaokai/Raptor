// Chat 195, 28 Nov 26 — his "can u ask fable to see if a better design can be made for this page", of the Leave War's
// day window as the redesign's F6 draws it (../2026-11-27-war-window-states/draw-standard.mjs, s00–s10). Two directions,
// each drawn on the REAL app (the served build, the page's own parts moved and its own classes used; nothing under
// raptor-port/src changes), for s01 (his picture), s00 (pending) and s07 (a group leave), phone and desktop.
//   A  "The entry owns its own things; the add buttons show only where they can add."
//      - the day's manning line sits under the title, above the rule: it is about the day, as the title is;
//      - each entry is ONE raised card: its box, state and placed line, its decision and Move · Delete, and ITS OWN
//        Remarks · till · Document row (today that row floats under the buttons and belongs to nobody in particular);
//      - a group's people are their own pucks (lesson 25), its remark words on the card, changed through Change;
//      - Duration and the eight leave buttons show only where a leave can still go (an empty day, a free half); on a
//        day already full the window ends with the one row CSE · OD · Grant OIL · ⋯, always the window's last row;
//      - Auto-approve shows only while the leave buttons it governs are showing.
//   B  "F6 kept whole, grouped by owner": every part of F6 stays in view; the entry's card, its Remarks row, its
//      Duration and the leave buttons (lit on its kind) share one raised surface, so the form reads as the entry's;
//      CSE · OD · Grant OIL · ⋯ stand apart below it as the way to add another.
//   A2 (round 2 — his D2884, lesson 170: "it doesnt seem intuitive to click on the LL to change the leave"): A, but a
//      LEAVE's card also holds Duration and the eight leave buttons, lit on its kind, under its Remarks row — one tap
//      on another re-types it, as today (D1467), and the buttons plainly belong to that leave. A card that is not
//      leave (an OIL award here) has none. A group's card: the Change line heads the same rows, "3 pax" lit — the
//      buttons under it change the leave for everyone; "Cutter" takes him out first (D2783, D2784).
// Approve · Refuse wear D2881's look in both (tick / cross at rest; decided: solid + the cyan ring, the other grey).
// New or moved parts are outlined dashed yellow and numbered; each frame is also saved clean (…-clean) — no outline.
// Run from raptor-port/ (the main folder's, for playwright), one size a process, against the served build:
//   node <this file> --size d|p [--url http://127.0.0.1:4181/] [--vw 390 --img <folder>]   (--vw: the fit check)
process.env.RC_LIB = '1'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const R = await import('../2026-11-27-war-window-states/rollcall-today.mjs')
const { PW, PHONE, sleep, tap, reach, closeAll, CUT } = R
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d }
const IMG = path.resolve(arg('img', path.join(HERE, 'img'))), VW = +arg('vw', 402)
mkdirSync(IMG, { recursive: true })
const VERSION = 'draw-redesign v2.0 (28 Nov 26, chat 195 — round 2 adds A2)'
console.log(VERSION, '| pictures to', IMG, '| phone width', VW)

const BASE = '2026-12-31'
const TICK = '<svg class="dk-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const CROSS = '<svg class="dk-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
const ACT = {
  approve: `<button class="dchip dk-b dk-a">${TICK}Approve</button>`, refuse: `<button class="dchip dk-b dk-r">${CROSS}Refuse</button>`,
  approved: `<button class="dchip dk-b dk-a on dk-ring">${TICK}Approved</button>`, refuseOff: `<button class="dchip dk-b dk-r dk-off">${CROSS}Refuse</button>`,
  move: '<button class="dchip move"><span class="mvarr" aria-hidden="true">⇄</span>Move</button>', del: '<button class="dchip del">Delete</button>', edit: '<button class="dchip">Edit…</button>' }
const PLACED = who => `<span class="bp-placedline">Placed <b>${who}</b> · Fri 27 Nov, 12:46</span>`
const LL_PEND = { box: 'c k-ll s-w whole', t: 'LL', main: 'Pending · Whole day', sub: PLACED('Saber'), acts: ['approve', 'refuse', 'move', 'del'], form: true }

const FRAMES = [
  { id: 's01-inputs-ll', iso: '2026-12-09', date: 'Wed 9 Dec', lit: 'LL',
    cards: [{ box: 'c k-ll s-a whole', t: 'LL', main: 'Approved · Whole day', sub: PLACED('Cutter'), acts: ['approved', 'refuseOff', 'move', 'del'], form: true }] },
  { id: 's00-pending', iso: '2026-12-02', date: 'Wed 2 Dec', lit: 'LL', cards: [LL_PEND] },
  { id: 's07-group', iso: '2026-12-21', date: 'Mon 21 Dec', lit: 'LL',
    cards: [{ box: 'c k-ll s-a whole', t: 'LL', main: 'Approved · Whole day', pucks: ['psy', 'riddler', 'spaceman'], sub: '<span class="bp-placedline">“Family trip” · placed <b>Saber</b></span>',
      acts: ['approved', 'refuseOff'], change: ['3 pax', 'Cutter'], groupForm: true, rmkText: 'Family trip', subA2: PLACED('Saber') }] },
  /* two more of direction A, so its rule is seen at both ends: a day of two entries, and an empty day */
  { id: 'x05-two', only: ['A', 'A2'], lit: 'LL', iso: '2026-12-18', date: 'Fri 18 Dec',
    cards: [{ box: 'c k-oil s-a whole', t: 'FO', main: 'OIL award · a day', sub: '<span class="bp-placedline">Weekend det · given by Saber</span>', acts: ['edit', 'del'] }, LL_PEND] },
  { id: 'x01-empty', only: ['A'], iso: '2026-12-01', date: 'Tue 1 Dec', cards: [] },
]

const CSS = `
.dk-ic{width:14px;height:14px;flex:none;margin-right:5px}
.dl-acts .dk-a,.dl-acts .dk-r{padding-left:6px !important;padding-right:6px !important;white-space:nowrap}
@media (max-width:600px){.dk-ic{width:12px;height:12px;margin-right:4px} .dl-acts .dk-a,.dl-acts .dk-r{font-size:.9em !important}}
.dl-acts .dk-b{display:inline-flex;align-items:center;justify-content:center}
.dk-a{color:#8FE0A8 !important} .dk-r{color:#FFA6AD !important}
.dl-acts .dk-b.dk-a{border-color:color-mix(in srgb, #8FE0A8 45%, transparent) !important}
.dl-acts .dk-b.dk-r{border-color:color-mix(in srgb, #FFA6AD 45%, transparent) !important}
.dl-acts .dk-b.dk-a.on{background:#57C97A !important;border-color:#57C97A !important;color:#0b1116 !important}
.dl-acts .dchip.dk-ring{outline:2px solid var(--accent) !important;outline-offset:2px}
.dl-acts .dchip.dk-off{color:#7d8794 !important}
.dl-acts .dk-b.dk-off{border-color:var(--edge) !important}
.dk-chev{margin-left:auto;align-self:center;font:400 26px/1 system-ui,sans-serif;color:#8b95a7;padding:0 2px 0 8px}
/* the redesign's own few rules */
.rd .bidsheet-hd{border-bottom:0 !important;margin-bottom:0 !important;padding-bottom:2px !important}
.rd .bidsheet-dayline{border-bottom:1px solid var(--edge) !important;padding:0 2px 8px !important;margin:0 0 8px !important}
.rd .rd-card{background:#1b2027;border-radius:11px;padding:8px 8px 9px;margin:0 -8px 8px}
.rd .rd-card + .rd-card{margin-top:-2px}
.rd .rd-card .daylist{margin:0;padding:0}
.rd .rd-card .dl-line.dl-card{padding:0 !important;gap:8px}
.rd .rd-card > .bidsheet-row{margin-top:8px}
.rd .rd-card > .bidsheet-row:last-child{margin-bottom:0}
.rd .rd-card .dchip:not(.on):not(.lit){background:#151a20}
.rd .rd-card .pchip:not(.on){background:#151a20}
.rd .rd-pucks{display:flex;flex-wrap:wrap;gap:4px;margin:3px 0 2px}
.rd .rd-change{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;align-items:center}
.rd .rd-change .note{padding-left:2px}
.rd-new{outline:2px dashed #FFD23F !important;outline-offset:2px}
.rd-m .rd-new{outline-offset:0 !important;width:64%}
.rd-tag{position:fixed;z-index:2147483647;background:#FFD23F;color:#15171c;font:800 11px/17px system-ui,sans-serif;padding:0 6px;border-radius:9px;pointer-events:none;box-shadow:0 0 0 1px #15171c;white-space:nowrap}`

/* the transform, in the page: the window today's app opens on an empty day of the same man becomes the frame's */
function transform(f) {
  const vis = e => e && e.getBoundingClientRect().width > 0
  const sheet = ['bid-picker', 'raptor-sheet'].map(t => document.querySelector(`[data-testid="${t}"]`)).find(vis)
  if (!sheet) return 'no window'
  const A = f.dir[0] === 'A', A2 = f.dir === 'A2', held = f.cards.length > 0, full = held   /* every drawn state that holds an entry holds the whole day */
  sheet.classList.add('rd', 'rd-' + f.dir)
  const hd = sheet.querySelector('.bidsheet-hd')
  hd.querySelector('.when, .dt').textContent = f.date
  const till = sheet.querySelector('[data-testid="bid-tilldate"]'); if (till) till.textContent = 'till ' + f.date.split(' ').slice(1).join(' ')
  const dayline = sheet.querySelector('[data-testid="bid-dayline"]'), rmk = sheet.querySelector('[data-testid="bid-rmk-row"]')
  const dur = sheet.querySelector('.bp-dur'), leave = sheet.querySelector('[aria-label="Which leave"]'), extra = sheet.querySelector('[data-testid="bid-extra-row"]')
  /* the manning line: the day's own words — today's app says "is" on a day that holds something, "turns" on an empty one */
  if (held) dayline.querySelector('[data-testid="bid-dayline-calm"]').textContent = 'No manning row is amber or red'
  dayline.classList.add('rd-m')
  sheet.querySelectorAll('[data-testid^="bid-"].lv.lit').forEach(b => b.classList.remove('lit'))
  const grant = sheet.querySelector('[data-testid="bid-oil"] .lv-code'); if (grant) grant.textContent = 'Grant OIL'
  const puck = id => {
    const src = document.querySelector(`[data-testid="person-${id}"] .puck`); if (!src) return ''
    const copy = (a, b) => { const cs = getComputedStyle(a); for (const k of ['display', 'alignItems', 'gap', 'background', 'color', 'font', 'letterSpacing', 'padding', 'border', 'borderRadius', 'height', 'minWidth', 'lineHeight', 'boxShadow', 'overflow', 'whiteSpace', 'textShadow', 'margin', 'justifyContent', 'boxSizing', 'width']) b.style[k] = cs[k]; [...a.children].forEach((c, i) => copy(c, b.children[i])) }
    const c = src.cloneNode(true); copy(src, c); c.style.width = src.getBoundingClientRect().width + 'px'; c.style.flex = 'none'
    return c.outerHTML
  }
  let anchor = dayline, n = 0
  for (const c of f.cards) {
    const card = document.createElement('div'); card.className = 'rd-card'; card.dataset.rd = ++n
    const pucks = c.pucks ? `<span class="rd-pucks">${c.pucks.map(puck).join('')}</span>` : ''
    const acts = c.acts.map(a => f.ACT[a]).join('')
    const change = c.change ? `<div class="rd-change"><span class="note">Change</span><button class="pchip${A2 ? ' on' : ''}">${c.change[0]}</button><button class="pchip">${c.change[1]}</button></div>` : ''
    card.innerHTML = `<ul class="daylist flat"><li class="dl-line dl-card"><div class="dl-head"><span class="leg-box dl-box" aria-hidden="true"><span class="${c.box}">${c.t}</span></span><div class="dl-text"><span class="dl-main">${c.main}</span>${pucks}<span class="dl-sub bp-placed">${A2 && c.subA2 ? c.subA2 : c.sub}</span></div><span class="dk-chev" aria-hidden="true">›</span></div><div class="dl-acts bp-acts">${acts}</div>${change}</li></ul>`
    /* the entry's own Remarks · till · Document row, inside its card (a group's is changed through Change) */
    if ((c.form || (A2 && c.groupForm)) && rmk) {
      const row = rmk.parentElement === sheet ? rmk : rmk.cloneNode(true)
      card.appendChild(row)
      if (c.rmkText) row.querySelector('textarea').value = c.rmkText
      if (!A || A2) { card.appendChild(dur); card.appendChild(leave); leave.querySelector(`[data-testid="bid-${f.lit}"]`)?.classList.add('lit') }
    }
    anchor.after(card); anchor = card
  }
  if (held && rmk.parentElement === sheet) rmk.remove()
  if (held && dur.parentElement === sheet) { dur.remove(); leave.remove() }
  /* Auto-approve governs the leave buttons: it shows while they show */
  if (A && full) sheet.querySelector('[data-testid="bid-approve-tick"]')?.remove()
  /* the grid's cyan mark on the state's day */
  document.querySelectorAll('td.selcell').forEach(td => td.classList.remove('selcell'))
  document.querySelector(`[data-testid="cell-${f.who}-${f.iso}"]`)?.classList.add('selcell')
  const over = el => el.scrollWidth - el.clientWidth
  return { ok: true, sheetOver: over(sheet), pageOver: over(document.documentElement), height: Math.round(sheet.getBoundingClientRect().height),
    spill: [...sheet.querySelectorAll('button, .puck, .dl-main, .dl-sub, textarea')].filter(e => vis(e) && (e.getBoundingClientRect().right > sheet.getBoundingClientRect().right - 1 || e.scrollWidth > e.clientWidth + 1)).map(e => (e.textContent || e.className).trim().slice(0, 24)) }
}
async function mark(p, on, f) {
  await p.evaluate(([on, A, held]) => {
    document.querySelectorAll('.rd-tag').forEach(t => t.remove()); document.querySelectorAll('.rd-new').forEach(e => e.classList.remove('rd-new'))
    if (!on) return
    const list = [['.rd-m [data-testid="bid-dayline-calm"]', '1'], ...[...document.querySelectorAll('.rd-card')].map((c, i) => [`.rd-card[data-rd="${i + 1}"]`, '2'])]
    if (held && A) list.push(['[data-testid="bid-extra-row"]', '3'])
    if (held && !A) list.push(['[data-testid="bid-extra-row"]', '3'])
    for (const [sel, text] of list) {
      const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); if (!e) continue
      e.classList.add('rd-new')
      const r = e.getBoundingClientRect(), t = document.createElement('span'); t.className = 'rd-tag'; t.textContent = text; document.body.appendChild(t)
      t.style.left = Math.max(2, r.right - t.getBoundingClientRect().width + 4) + 'px'; t.style.top = Math.max(2, (text === '1' ? r.top + 1 : r.top - 9)) + 'px'; if (text === '1') t.style.left = (r.right + 6) + 'px'
    }
  }, [on, f.dir === 'A', f.cards.length > 0])
}
async function shot(p, name, f) {
  await sleep(300)
  const box = await p.evaluate(f => {
    const els = [...document.querySelectorAll('[data-testid="bid-picker"], [data-testid="raptor-sheet"], .rd-tag'), document.querySelector(`[data-testid="cell-${f.who}-${f.iso}"]`)]
      .filter(e => e && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().bottom > 0 && e.getBoundingClientRect().top < innerHeight)
    const rs = els.map(e => e.getBoundingClientRect()), pad = 12
    const x = Math.max(0, Math.min(...rs.map(r => r.left)) - pad), y = Math.max(0, Math.min(...rs.map(r => r.top)) - pad)
    return { x, y, width: Math.min(innerWidth, Math.max(...rs.map(r => r.right)) + pad) - x, height: Math.min(innerHeight, Math.max(...rs.map(r => r.bottom)) + pad) - y }
  }, f)
  const file = `${name}-${PHONE ? 'phone' : 'desktop'}.png`
  await p.screenshot({ path: path.join(IMG, file), clip: box })
  console.log('  picture', file, Math.round(box.width) + 'x' + Math.round(box.height))
}
async function draw(p, dir, f0) {
  const f = { ...f0, dir, who: CUT, ACT }
  try {
    await tap(p, CUT, BASE)
    await reach(p, CUT, f.iso)
    const r = await p.evaluate(transform, f)
    if (!r.ok) throw new Error(r)
    console.log(`${dir}-${f.id}: window ${r.height}px tall · sideways overflow window ${r.sheetOver} page ${r.pageOver} · spills ${JSON.stringify(r.spill)}`)
    await mark(p, true, f); await shot(p, `${dir}-${f.id}`, f)
    await mark(p, false, f); await shot(p, `${dir}-${f.id}-clean`, f)
  } catch (e) { console.log('  FAILED', dir, f.id, String(e.message || e).split('\n')[0]) }
  await p.evaluate(() => document.querySelectorAll('.rd-tag').forEach(t => t.remove()))
  await closeAll(p)
}

const browser = await PW.chromium.launch()
const ctx = await browser.newContext(PHONE
  ? { viewport: { width: VW, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
  : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
const errs = []
try {
  const p = await ctx.newPage(); p.setDefaultTimeout(10000)
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 160)) })
  await R.setupWorld(p); await p.addStyleTag({ content: CSS })
  for (const dir of ['A', 'B', 'A2']) for (const f of FRAMES.filter(f => !f.only || f.only.includes(dir))) await draw(p, dir, f)
  console.log('DONE', VERSION)
} catch (e) { console.log('FAILED', e.message.split('\n')[0]) }
finally { console.log('errors:', errs.length, errs.slice(0, 5)); await browser.close() }
