// Chat 196, 28 Nov 26 — his "update the drawings to what would actually be built from everything discussed", the
// Leave War's day window. A2 (D2887: an entry a card, a leave's card holding its own leave buttons) with what he ruled
// after it, drawn on the REAL app (the main folder's build on 127.0.0.1:4181; the page's own parts moved and its own
// classes used; nothing under raptor-port/src changes):
//   D2884  a leave's kind is changed by a control a person can see, standing with the leave (its card's leave buttons);
//   D2886  an entry filed on the Inputs page keeps Move and Delete on the war — the group card too;
//   D2888  a medical has no Move and no Delete;
//   D2889  an Inputs-filed entry's own input window opens right OVER the war (frame b9);
//   D2892  the app's one pencil on a card, by kind, never by page: a CSE, OD, OTH, Attach, medical, any group entry,
//          leave with custom hours; plain leave and bids none (it replaces A2's ›);
//   D2881  Approve · Refuse: tick and cross at rest; decided solid with the cyan ring, the other grey;
//   D1187 as narrowed by D2887  Auto-approve only while there are leave buttons to place NEW leave.
// The pencil is the war's own small pencil button (the Events list's `.ev-ctl.ev-pen`, its 40px tap area), drawn with
// the app's one pencil (src/ui/pen.ts PEN_INNER). The manning line under the title says "is" on a day that holds
// something, "turns" on an empty one, as today's app does.
// Run from raptor-port/ (the main folder's, for playwright), one size a process:
//   node <this file> --size d|p [--url http://127.0.0.1:4181/]
process.env.RC_LIB = '1'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const R = await import('../2026-11-27-war-window-states/rollcall-today.mjs')
const { PW, PHONE, sleep, press, tap, reach, closeAll, signIn, toWar, CUT, RAN } = R
const IMG = path.join(HERE, 'img')
mkdirSync(IMG, { recursive: true })
const VERSION = 'draw-war-window v1.0 (28 Nov 26, chat 196)'
console.log(VERSION, '| pictures to', IMG)

const BASE = '2026-12-31'
const PEN = '<svg class="pen-ic solo" viewBox="0 0 24 24" aria-hidden="true"><g transform="rotate(-45 12 12)" fill="currentColor"><rect x="8.5" y="1" width="7" height="4.6" rx="2.4"/><rect x="8.5" y="6.4" width="7" height="12.2" rx=".3"/><path d="M8.5 19.4h7l-2.6 3.1a1.2 1.2 0 0 1-1.8 0Z"/></g></svg>'
const TICK = '<svg class="dk-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const CROSS = '<svg class="dk-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
const ACT = {
  approve: `<button class="dchip dk-b dk-a">${TICK}Approve</button>`, refuse: `<button class="dchip dk-b dk-r">${CROSS}Refuse</button>`,
  approved: `<button class="dchip dk-b dk-a on dk-ring">${TICK}Approved</button>`, refuseOff: `<button class="dchip dk-b dk-r dk-off">${CROSS}Refuse</button>`,
  move: '<button class="dchip move"><span class="mvarr" aria-hidden="true">⇄</span>Move</button>', del: '<button class="dchip del">Delete</button>', edit: '<button class="dchip">Edit…</button>' }
const PLACED = who => `<span class="bp-placedline">Placed <b>${who}</b> · Fri 27 Nov, 12:46</span>`
const LL_PEND = { box: 'c k-ll s-w whole', t: 'LL', main: 'Pending · Whole day', sub: PLACED('Saber'), acts: ['approve', 'refuse', 'move', 'del'], rmk: 'full', leave: 'LL', dur: 'Whole day' }

/* each frame: the day, its cards, and whether the window still adds leave (an empty day, a free half) */
const FRAMES = [
  { id: 'b1-empty', role: 'ad', who: CUT, iso: '2026-12-01', date: 'Tue 1 Dec', cards: [], add: { dur: 'Whole day' }, say: 'An empty day: as today, the manning line moved under the title.' },
  { id: 'b2-pending', role: 'ad', who: CUT, iso: '2026-12-02', date: 'Wed 2 Dec', cards: [LL_PEND], say: 'A pending bid placed on the war.' },
  { id: 'b3-inputs-ll', role: 'ad', who: CUT, iso: '2026-12-09', date: 'Wed 9 Dec',
    cards: [{ box: 'c k-ll s-a whole', t: 'LL', main: 'Approved · Whole day', sub: PLACED('Cutter'), acts: ['approved', 'refuseOff', 'move', 'del'], rmk: 'full', leave: 'LL', dur: 'Whole day' }], say: 'LL filed on the Inputs page: the same card as one placed on the war.' },
  { id: 'b4-medical', role: 'ad', who: CUT, iso: '2026-12-10', date: 'Thu 10 Dec',
    cards: [{ fromCell: true, t: 'OML', main: 'Whole day', sub: PLACED('Cutter'), acts: [], pen: true, rmk: 'doc', mark: 'pen' }], say: 'A medical: no Move, no Delete; its Document and the pencil.' },
  { id: 'b5-course', role: 'ad', who: CUT, iso: '2026-12-14', date: 'Mon 14 Dec',
    cards: [{ fromCell: true, t: 'CSE', main: 'Whole day', sub: PLACED('Cutter'), acts: ['move', 'del'], pen: true, rmk: 'full', mark: 'pen' }], say: 'A course filed on the Inputs page: Move, Delete, its remarks, and the pencil.' },
  { id: 'b6-two', role: 'ad', who: CUT, iso: '2026-12-18', date: 'Fri 18 Dec',
    cards: [{ box: 'c k-oil s-a whole', t: 'FO', main: 'OIL award · a day', sub: '<span class="bp-placedline">Weekend det · given by Saber</span>', acts: ['edit', 'del'] }, LL_PEND], say: 'Two entries: each its own card and its own buttons.' },
  { id: 'b7-group', role: 'ad', who: CUT, iso: '2026-12-21', date: 'Mon 21 Dec',
    cards: [{ box: 'c k-ll s-a whole', t: 'LL', main: 'Approved · Whole day', pucks: ['psy', 'riddler', 'spaceman'], sub: PLACED('Saber'), acts: ['approved', 'refuseOff', 'move', 'del'],
      change: ['3 pax', 'Cutter'], rmk: 'full', rmkText: 'Family trip', leave: 'LL', dur: 'Whole day', pen: true, mark: 'group' }], say: 'A group leave: Move and Delete added, and the pencil.' },
  { id: 'b8-half', role: 'ad', who: CUT, iso: '2026-12-16', date: 'Wed 16 Dec',
    cards: [{ box: 'c k-ll s-a whole', t: 'LL', main: 'Approved · AM', sub: PLACED('Cutter'), acts: ['approved', 'refuseOff', 'move', 'del'], rmk: 'full', leave: 'LL', dur: 'AM' }],
    add: { dur: 'PM' }, say: 'A morning leave: the free afternoon keeps the usual buttons to add leave.' },
  { id: 'm1-own-approved', role: 'us', who: RAN, iso: '2026-12-03', date: 'Thu 3 Dec',
    cards: [{ box: 'c k-ll s-a whole', t: 'LL', main: 'Approved · Whole day', sub: PLACED('Saber'), acts: [], rmk: 'full' }], say: 'Ranger, a member, on his own approved leave: its state and its Document.' },
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
.rd .dl-head .ev-pen{margin-left:auto;align-self:center;width:30px;height:30px;border-radius:7px}
.rd .dl-head .ev-pen .pen-ic{width:15px;height:15px}
.rd .rd-doconly{justify-content:flex-end}
.rd-new{outline:2px dashed #FFD23F !important;outline-offset:2px}
.rd-tag{position:fixed;z-index:2147483647;background:#FFD23F;color:#15171c;font:800 11px/17px system-ui,sans-serif;padding:0 6px;border-radius:9px;pointer-events:none;box-shadow:0 0 0 1px #15171c;white-space:nowrap}`

/* the transform, in the page: the window today's app opens on an empty day of the same man becomes the frame's */
function transform(f) {
  const vis = e => e && e.getBoundingClientRect().width > 0
  const sheet = ['bid-picker', 'raptor-sheet'].map(t => document.querySelector(`[data-testid="${t}"]`)).find(vis)
  if (!sheet) return { err: 'no window' }
  const held = f.cards.length > 0
  sheet.classList.add('rd')
  const hd = sheet.querySelector('.bidsheet-hd')
  hd.querySelector('.when, .dt').textContent = f.date
  const setTill = root => { const t = root.querySelector('[data-testid="bid-tilldate"]'); if (t) t.textContent = 'till ' + f.date.split(' ').slice(1).join(' ') }
  setTill(sheet)
  const dayline = sheet.querySelector('[data-testid="bid-dayline"]'), rmk = sheet.querySelector('[data-testid="bid-rmk-row"]')
  const dur = sheet.querySelector('.bp-dur'), leave = sheet.querySelector('[aria-label="Which leave"]')
  if (held && dayline) dayline.querySelector('[data-testid="bid-dayline-calm"]').textContent = 'No manning row is amber or red'
  sheet.querySelectorAll('[data-testid^="bid-"].lv.lit').forEach(b => b.classList.remove('lit'))
  const grant = sheet.querySelector('[data-testid="bid-oil"] .lv-code'); if (grant) grant.textContent = 'Grant OIL'
  const litDur = (row, word) => row.querySelectorAll('button').forEach(b => { const on = b.textContent.trim() === word; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false') })
  const puck = id => {
    const src = document.querySelector(`[data-testid="person-${id}"] .puck`); if (!src) return ''
    const copy = (a, b) => { const cs = getComputedStyle(a); for (const k of ['display', 'alignItems', 'gap', 'background', 'color', 'font', 'letterSpacing', 'padding', 'border', 'borderRadius', 'height', 'minWidth', 'lineHeight', 'boxShadow', 'overflow', 'whiteSpace', 'textShadow', 'margin', 'justifyContent', 'boxSizing', 'width']) b.style[k] = cs[k]; [...a.children].forEach((c, i) => copy(c, b.children[i])) }
    const c = src.cloneNode(true); copy(src, c); c.style.width = src.getBoundingClientRect().width + 'px'; c.style.flex = 'none'
    return c.outerHTML
  }
  let anchor = dayline || hd, n = 0
  for (const c of f.cards) {
    let box = c.box
    if (c.fromCell) { const g = document.querySelector(`[data-testid="cell-${f.who}-${f.iso}"] .c`); if (g) box = [...g.classList].filter(k => /^(c|k-|s-)$|^(c|k-|s-)/.test(k)).join(' ') + (c.box && /\bam\b/.test(c.box) ? '' : ' whole') }
    const card = document.createElement('div'); card.className = 'rd-card'; card.dataset.rd = ++n
    const pucks = c.pucks ? `<span class="rd-pucks">${c.pucks.map(puck).join('')}</span>` : ''
    const acts = c.acts.length ? `<div class="dl-acts bp-acts">${c.acts.map(a => f.ACT[a]).join('')}</div>` : ''
    const change = c.change ? `<div class="rd-change"><span class="note">Change</span><button class="pchip on">${c.change[0]}</button><button class="pchip">${c.change[1]}</button></div>` : ''
    const pen = c.pen ? `<button type="button" class="ev-ctl ev-pen" title="Edit" aria-label="Edit ${c.t}, ${f.date}">${f.PEN}</button>` : ''
    card.innerHTML = `<ul class="daylist flat"><li class="dl-line dl-card"><div class="dl-head"><span class="leg-box dl-box" aria-hidden="true"><span class="${box}">${c.t}</span></span><div class="dl-text"><span class="dl-main">${c.main}</span>${pucks}<span class="dl-sub bp-placed">${c.sub}</span></div>${pen}</div>${acts}${change}</li></ul>`
    if (c.rmk && rmk) {
      const row = rmk.cloneNode(true); setTill(row)
      if (c.rmk === 'doc') { row.querySelectorAll('textarea, input, label, [data-testid="bid-tilldate"]').forEach(e => e.remove()); [...row.children].forEach(ch => { if (!ch.querySelector('button') && ch.tagName !== 'BUTTON') ch.remove() }); row.classList.add('rd-doconly') }
      if (c.rmkText) row.querySelector('textarea').value = c.rmkText
      card.appendChild(row)
    }
    if (c.leave && dur && leave) {
      const d2 = dur.cloneNode(true), l2 = leave.cloneNode(true)
      litDur(d2, c.dur || 'Whole day'); l2.querySelector(`[data-testid="bid-${c.leave}"]`)?.classList.add('lit')
      card.appendChild(d2); card.appendChild(l2)
    }
    anchor.after(card); anchor = card
  }
  /* the add part: only where leave can still be placed (an empty day, a free half) */
  if (f.add) {
    if (dur) litDur(dur, f.add.dur)
    if (held) { /* the add part follows the last card, in today's order */ const extra = sheet.querySelector('[data-testid="bid-extra-row"]'); [rmk, dur, leave].forEach(e => e && extra.before(e)) }
  } else {
    rmk?.remove(); dur?.remove(); leave?.remove()
    sheet.querySelector('[data-testid="bid-approve-tick"]')?.remove()
  }
  document.querySelectorAll('td.selcell').forEach(td => td.classList.remove('selcell'))
  document.querySelector(`[data-testid="cell-${f.who}-${f.iso}"]`)?.classList.add('selcell')
  const over = el => el.scrollWidth - el.clientWidth
  return { ok: true, sheetOver: over(sheet), height: Math.round(sheet.getBoundingClientRect().height), top: Math.round(sheet.getBoundingClientRect().top),
    spill: [...sheet.querySelectorAll('button, .puck, .dl-main, .dl-sub, textarea')].filter(e => vis(e) && (e.getBoundingClientRect().right > sheet.getBoundingClientRect().right - 1 || e.scrollWidth > e.clientWidth + 1)).map(e => (e.textContent || e.className).trim().slice(0, 24)) }
}
async function mark(p, f, on) {
  await p.evaluate(([on, f]) => {
    document.querySelectorAll('.rd-tag').forEach(t => t.remove()); document.querySelectorAll('.rd-new').forEach(e => e.classList.remove('rd-new'))
    if (!on) return
    const list = []
    f.cards.forEach((c, i) => {
      if (c.mark === 'pen') list.push([`.rd-card[data-rd="${i + 1}"] .ev-pen`, '1'])
      if (c.mark === 'group') { list.push([`.rd-card[data-rd="${i + 1}"] .ev-pen`, '1']); list.push([`.rd-card[data-rd="${i + 1}"] .dl-acts .move`, '2']) }
    })
    for (const [sel, text] of list) {
      const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); if (!e) continue
      e.classList.add('rd-new')
      if (text === '2') { const d = e.nextElementSibling; if (d) d.classList.add('rd-new') }
      const r = e.getBoundingClientRect(), t = document.createElement('span'); t.className = 'rd-tag'; t.textContent = text; document.body.appendChild(t)
      t.style.left = Math.max(2, r.left - t.getBoundingClientRect().width - 4) + 'px'; t.style.top = Math.max(2, r.top + r.height / 2 - 9) + 'px'
    }
  }, [on, f])
}
async function shot(p, name, f, extra = []) {
  await sleep(300)
  const box = await p.evaluate(([f, extra]) => {
    const els = [...document.querySelectorAll(['[data-testid="bid-picker"]', '[data-testid="raptor-sheet"]', '.rd-tag', ...extra].join(', ')), document.querySelector(`[data-testid="cell-${f.who}-${f.iso}"]`)]
      .filter(e => e && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().bottom > 0 && e.getBoundingClientRect().top < innerHeight && getComputedStyle(e).visibility !== 'hidden')
    const rs = els.map(e => e.getBoundingClientRect()), pad = 12
    const x = Math.max(0, Math.min(...rs.map(r => r.left)) - pad), y = Math.max(0, Math.min(...rs.map(r => r.top)) - pad)
    return { x, y, width: Math.min(innerWidth, Math.max(...rs.map(r => r.right)) + pad) - x, height: Math.min(innerHeight, Math.max(...rs.map(r => r.bottom)) + pad) - y }
  }, [f, extra])
  const file = `${name}-${PHONE ? 'phone' : 'desktop'}.png`
  await p.screenshot({ path: path.join(IMG, file), clip: box })
  console.log('  picture', file, Math.round(box.width) + 'x' + Math.round(box.height))
}
async function draw(p, f0) {
  const f = { ...f0, ACT, PEN }
  try {
    await tap(p, f.who, BASE)
    await reach(p, f.who, f.iso)
    const r = await p.evaluate(transform, f)
    if (!r.ok) throw new Error(JSON.stringify(r))
    console.log(`${f.id}: window ${r.height}px tall, top ${r.top} · sideways ${r.sheetOver} · spills ${JSON.stringify(r.spill)}`)
    if (f.cards.some(c => c.mark)) { await mark(p, f, true); await shot(p, f.id, f); await mark(p, f, false) }
    await shot(p, f.id + '-clean', f)
  } catch (e) { console.log('  FAILED', f.id, String(e.message || e).split('\n')[0]) }
  await closeAll(p)
}

/* b9: the course's pencil pressed — its own input window, the Inputs page's, opened right over the war (D2889) */
async function overWar(p) {
  const f = { id: 'b9-pencil-open', who: CUT, iso: '2026-12-14' }
  try {
    /* the Inputs list shows the weeks round the demo date, so the window is the Inputs page's own, filled as the course
       would read (its kind, the man, its day), its title and two buttons then worded as an opened course's (as
       ../2026-11-27-add-window/draw-war-add.mjs drew it for F5) */
    await p.evaluate(() => window.go('inputs')); await sleep(1500)
    if (await p.locator('#inListBtn:visible').count()) { await press(p, '#inListBtn'); await sleep(600) }
    await press(p, '#inNew'); await p.waitForSelector('#inpEditPop', { timeout: 8000 }); await sleep(400)
    await p.selectOption('#inpEditType', 'CSE'); await sleep(300)
    await p.selectOption('#inpEditPerson', 'psy'); await sleep(300)
    const d = p.locator('[data-testid="inpEdCal-day-2026-12-14"]')
    for (let i = 0; i < 12 && !(await d.count()); i++) { await press(p, p.locator('#inpEditPop button[aria-label*="ext"], #inpEditPop button:has-text("›")').last()); await sleep(250) }
    if (await d.count()) { await press(p, d); await sleep(300) } else console.log('  (14 Dec not reached in the window\'s calendar)')
    /* the course on the war is a whole day */
    const ticked = await p.evaluate(() => {
      const pop = document.getElementById('inpEditPop')
      const t = [...pop.querySelectorAll('*')].find(e => e.children.length <= 1 && /^\s*all day\s*$/i.test(e.textContent))
      const box = t && (t.closest('label')?.querySelector('input[type=checkbox]') || t.parentElement?.querySelector('input[type=checkbox]'))
      if (!box) return 'no box'
      if (!box.checked) box.click()
      return box.checked
    })
    console.log('  all day ticked:', ticked); await sleep(300)
    await p.evaluate(() => {
      const inner = document.getElementById('inpEditPop')
      let w = inner; for (let e = inner; e && e !== document.body; e = e.parentElement) { if (/airpop|dialog|modal/i.test(e.className || '') || e.getAttribute('role') === 'dialog') w = e }
      const r = w.getBoundingClientRect(), s = getComputedStyle(w), si = getComputedStyle(inner)
      const sel = {}; w.querySelectorAll('select').forEach(x => { if (x.id) sel[x.id] = x.value })
      window.__dkClone = { html: w.outerHTML, x: r.x, y: r.y, w: r.width, h: r.height, bg: s.backgroundColor !== 'rgba(0, 0, 0, 0)' ? s : si, sel, look: { bg: (s.backgroundColor !== 'rgba(0, 0, 0, 0)' ? s : si).backgroundColor, border: (s.backgroundColor !== 'rgba(0, 0, 0, 0)' ? s : si).border, radius: (s.backgroundColor !== 'rgba(0, 0, 0, 0)' ? s : si).borderRadius, shadow: (s.backgroundColor !== 'rgba(0, 0, 0, 0)' ? s : si).boxShadow } }
      sessionStorage.setItem('dkClone', JSON.stringify({ ...window.__dkClone, bg: null }))
    })
    await press(p, '#inpEditCancel').catch(() => p.keyboard.press('Escape')); await sleep(500)
    for (let i = 0; i < 3 && (await p.locator('#inpEditPop:visible').count()); i++) {
      const sure = p.locator('button:visible').filter({ hasText: /Close it|Lose|Discard|Yes/i }).first()
      if (await sure.count()) await press(p, sure); else await p.keyboard.press('Escape')
      await sleep(400)
    }
    await toWar(p)
    await tap(p, CUT, BASE); await reach(p, CUT, f.iso)
    const card = FRAMES.find(x => x.id === 'b5-course')
    await p.evaluate(transform, { ...card, ACT, PEN })
    const got = await p.evaluate(() => {
      const c = JSON.parse(sessionStorage.getItem('dkClone') || 'null'); if (!c) return null
      const host = document.createElement('div'); host.innerHTML = c.html
      const w = host.firstElementChild; w.id = 'dkEntry'
      const top = Math.max(60, Math.min(c.y, innerHeight - 200)), hgt = Math.min(c.h, innerHeight - top - 8)
      w.style.cssText += `;position:fixed;left:${c.x}px;top:${top}px;width:${c.w}px;height:${hgt}px;max-height:${hgt}px;z-index:9000;margin:0;display:flex;flex-direction:column;overflow:hidden`
      Object.assign(w.style, { backgroundColor: c.look.bg, border: c.look.border, borderRadius: c.look.radius, boxShadow: c.look.shadow })
      for (const [id, v] of Object.entries(c.sel)) { const s = w.querySelector('#' + id); if (s) s.value = v }
      w.querySelectorAll('*').forEach(e => { if (e.scrollTop) e.scrollTop = 0 })
      const head = [...w.querySelectorAll('*')].find(e => e.children.length === 0 && /^New input/.test(e.textContent.trim())); if (head) head.textContent = 'CSE · Cutter · Mon 14 Dec'
      const save = w.querySelector('#inpEditSave'); if (save) save.textContent = 'Save'
      const cancel = w.querySelector('#inpEditCancel'); if (cancel) { cancel.textContent = 'Delete'; cancel.style.color = '#ff8a8a' }
      document.body.appendChild(w)
      /* the war's window waits under it, dimmed, as the window it closes back to */
      const sh = document.querySelector('[data-testid="bid-picker"], [data-testid="raptor-sheet"]'); if (sh) sh.style.filter = 'brightness(.55)'
      return { rows: [...w.querySelectorAll('.inped-k')].map(k => k.textContent.trim()).slice(0, 12), head: w.querySelector('.airpop-head, .airpop-title, h3')?.textContent?.trim() }
    })
    console.log('b9: laid over the war', JSON.stringify(got))
    await shot(p, f.id + '-clean', f, ['#dkEntry'])
  } catch (e) { console.log('  FAILED b9', String(e.message || e).split('\n')[0]) }
}

const browser = await PW.chromium.launch()
const ctx = await browser.newContext(PHONE
  ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
  : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
const errs = []
const watch = p => { p.setDefaultTimeout(10000); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 160)) }) }
try {
  const p1 = await ctx.newPage(); watch(p1)
  await R.setupWorld(p1); await p1.addStyleTag({ content: CSS })
  const only = process.argv.includes('--b9')
  if (!only) for (const f of FRAMES.filter(f => f.role === 'ad')) await draw(p1, f)
  await overWar(p1)
  if (only) { await browser.close(); process.exit(0) }
  await sleep(1200); await p1.close()
  const p2 = await ctx.newPage(); watch(p2)
  await signIn(p2, 'us', 'us'); await toWar(p2); await p2.addStyleTag({ content: CSS })
  for (const f of FRAMES.filter(f => f.role === 'us')) await draw(p2, f)
  console.log('DONE', VERSION)
} catch (e) { console.log('FAILED', e.message.split('\n')[0]) }
finally { console.log('errors:', errs.length, errs.slice(0, 5)); await browser.close() }
