// Chat 199, 28 Nov 26 — the day-window plan's step 9b (plan §8, "Drawn for him before they are built", items 1–12, and Q3):
// the states the approved drawings (../2026-11-28-what-we-build/) never showed, drawn on the REAL app (the build of this
// folder on 127.0.0.1:4181). The page's own parts are moved and cloned and its own classes used; nothing under
// raptor-port/src changes. The card shapes, the CSS and the transform are copied from the drawing of record,
// ../2026-11-28-what-we-build/draw-war-window.mjs (v1.1), and extended only where a state needs it (a frame's name, a
// line inside a card, the Auto-approve switch kept, the last row hidden, the several-day chips).
// "To review" on Edit Schedule's week (s08) follows ../2026-11-28-what-we-build/draw-to-review.mjs (the Board's).
// Run from raptor-port/ (for playwright), one size a process:
//   node <this file> --size d|p [--url http://127.0.0.1:4181/] [--only s01,s04-A-switch-shown,...]
process.env.RC_LIB = '1'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const R = await import('../2026-11-27-war-window-states/rollcall-today.mjs')
const { PW, PHONE, sleep, press, tap, reach, closeAll, signIn, toWar, CUT, RAN } = R
const GHOST = 'riddler', DASH = 'spaceman'
const IMG = path.join(HERE, 'img')
mkdirSync(IMG, { recursive: true })
const VERSION = 'draw-more v1.0 (28 Nov 26, chat 199)'
console.log(VERSION, '| pictures to', IMG)

/* ============================================================================================================
   EVERY WORD THESE DRAWINGS ADD — one table, so a reviewer changes words here and the script redraws.
   w-numbers are the plan's §6 drafts (docs/superpowers/plans/2026-11-28-lw-day-window-plan.md); "ruled" his;
   "app" words the app already prints today; "DRAFT" the drawing helper's own draft (chat 199), for Fable's review.
   ============================================================================================================ */
const W = {
  placedBy: 'Placed by',                       // w0, ruled D2927
  refusedBy: 'Refused by',                     // w0, ruled D2927
  stamp: 'Fri 27 Nov, 12:46',                  // the drawing of record's sample time
  stamp2: 'Fri 27 Nov, 14:05',                 // a later sample time (a refusal)
  headPending: 'Pending · Whole day',          // w2
  headApproved: 'Approved · Whole day',        // w2
  headRefused: 'Refused · Whole day',          // w2
  headHours: 'Approved · 10:00–15:00',         // w2's shape for a leave with set hours (w2 gives "09:00–14:00" on a non-leave card) — DRAFT
  headCourse: 'Whole day',                     // w2 (a non-leave card)
  allDays: 'All 5 days',                       // app (D1448, built: "All n days")
  dayChip: 'Wed 16',                           // app: today's chip reads the day this way ("Mon 7"); the brief wrote "Wed 16 Dec"
  w1: 'Only one kind of leave a day. Tap OL again to change this LL to OL.',   // w1 (drawn b3o1)
  w4: ['Change', '3 pax', 'Cutter'],           // w4, ruled D2784
  w5head: 'OIL award · a day',                 // w5 (drawn b6)
  w5sub: 'Weekend det · given by Saber',       // w5 (drawn b6)
  w8: 'This leave is for all 3. Use the pencil to change it.',  // w8, as a fresh Fable reworded it (28 Nov 26)
  w9closed: 'Bidding is closed on this day. Delete this leave here, or change it on the Inputs page.',   // w9, Fable's
  w9past: 'This day has passed. Delete this leave here, or change it on the Inputs page.',              // w9, Fable's
  q5Bclosed: 'Bidding is closed on this day. Change or delete this leave on the Inputs page.',   // DRAFT (Q5 answer B)
  q5Bpast: 'This day has passed. Change or delete this leave on the Inputs page.',               // DRAFT (Q5 answer B)
  w10: 'LL changed to OL',                     // w10
  w10pending: 'LL changed to OL, now pending', // w10 (pending after it), Fable's
  w11: 'Now LL (AM)',                          // w11, Fable's (the bell's own "Now LL (AM)" form, D2521)
  bellWho: 'Your leave',                       // app (the bell's own name for a war line)
  bellBy: 'Saber',                             // app (the bell line's "· Saber")
  w26: 'Approved leave deleted by Ranger',     // w26, in the "also" line's own shape ("Bid withdrawn by Ranger"); the
                                               // plan's draft text "Ranger deleted his approved LL · Thu 3 Dec" — its
                                               // day and kind are the line's own date link and box
  w26date: PHONE ? '3 Dec' : 'Thu 3 Dec',      // the line's date link, in the app's own form at each size ("Wed 2 Dec ›" / "2 Dec ›")
  s11head: 'OIL earned · a day',               // DRAFT (w5's shape; today's list says "OIL earned")
  s11sub: 'Worked 08:00–16:30 · from the published schedule',   // DRAFT (today: "…, worked 08:00–16:30" + "From the published schedule.")
  s12text: 'Cutter’s LL bid was replaced by CSE (Saber)',       // app (today's day list, word for word)
  s12seen: 'OK, seen',                         // app
  w16: 'To review',                            // w16, ruled D2883
  w17: 'none',                                 // w17 (drawn t1)
}

const BASE = '2026-12-31'
const PEN = '<svg class="pen-ic solo" viewBox="0 0 24 24" aria-hidden="true"><g transform="rotate(-45 12 12)" fill="currentColor"><rect x="8.5" y="1" width="7" height="4.6" rx="2.4"/><rect x="8.5" y="6.4" width="7" height="12.2" rx=".3"/><path d="M8.5 19.4h7l-2.6 3.1a1.2 1.2 0 0 1-1.8 0Z"/></g></svg>'
const TICK = '<svg class="dk-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const CROSS = '<svg class="dk-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
const ACT = {
  approve: `<button class="dchip dk-b dk-a">${TICK}Approve</button>`, refuse: `<button class="dchip dk-b dk-r">${CROSS}Refuse</button>`,
  approved: `<button class="dchip dk-b dk-a on dk-ring">${TICK}Approved</button>`, refuseOff: `<button class="dchip dk-b dk-r dk-off">${CROSS}Refuse</button>`,
  approveOff: `<button class="dchip dk-b dk-a dk-off">${TICK}Approve</button>`, refused: `<button class="dchip dk-b dk-r on dk-ring">${CROSS}Refused</button>`,
  move: '<button class="dchip move"><span class="mvarr" aria-hidden="true">⇄</span>Move</button>', del: '<button class="dchip del">Delete</button>', edit: '<button class="dchip">Edit…</button>',
  seen: `<button class="dchip ack">${W.s12seen}</button>` }
const PLACED = (who, by = W.placedBy) => `<span class="bp-placedline">${by} <b>${who}</b> · ${W.stamp}</span>`

/* the cards (each the drawing of record's shape; `line` a line of words inside the card, after its buttons; `chips` the
   several-day chips in place of Pick a range; `noBox` a card with no kind box, as today's notice line has none) */
const LL_PEND = { box: 'c k-ll s-w whole', t: 'LL', main: W.headPending, pucks: ['psy'], sub: PLACED('Saber'), acts: ['approve', 'refuse', 'move', 'del'], rmk: 'full', leave: 'LL', dur: 'Whole day' }
const B3 = { box: 'c k-ll s-a whole', t: 'LL', main: W.headApproved, pucks: ['psy'], sub: PLACED('Cutter'), acts: ['approved', 'refuseOff', 'move', 'del'], rmk: 'full', leave: 'LL', dur: 'Whole day' }
const RAN_APPR = (acts, extra = {}) => ({ box: 'c k-ll s-a whole', t: 'LL', main: W.headApproved, pucks: ['bane'], sub: PLACED('Saber'), acts, rmk: 'full', ...extra })
const CSE = { fromCell: true, t: 'CSE', main: W.headCourse, pucks: ['psy'], sub: PLACED('Cutter'), acts: ['move', 'del'], pen: true, rmk: 'full' }

const FRAMES = [
  /* 1 — R4: a several-day leave; "All 5 days" · the day tapped where Pick a range stands (today's chips, cloned from the
     real window on Ghost's five approved days) */
  { id: 's01-several-days', role: 'ad', who: GHOST, iso: '2026-12-16', date: 'Wed 16 Dec', till: '18 Dec',
    cards: [{ box: 'c k-ll s-a whole', t: 'LL', main: W.headApproved, pucks: ['riddler'], sub: PLACED('Saber'), acts: ['approved', 'refuseOff', 'move', 'del'], rmk: 'full', leave: 'LL', dur: 'Whole day', chips: true,
      marks: [['.rd-chips', '1']] }] },
  /* 2 — R5: a leave with set hours. An admin: the pencil, Move, Delete, Remarks · Document; no Duration, leave buttons,
     Approve or Refuse */
  { id: 's02a-hours-admin', role: 'ad', who: CUT, iso: '2026-12-22', date: 'Tue 22 Dec',
    cards: [{ fromCell: true, t: 'LL', main: W.headHours, pucks: ['psy'], sub: PLACED('Cutter'), acts: ['move', 'del'], pen: true, rmk: 'full', marks: [['.ev-pen', '1'], ['.dl-acts .move', '2']] }] },
  /* 4 — Q4: an admin's approved leave (b3's card) with the Auto-approve switch in the title bar, beside it hidden */
  { id: 's04-A-switch-shown', role: 'ad', who: CUT, iso: '2026-12-09', date: 'Wed 9 Dec', keepSwitch: true, switchOff: true, cards: [B3], marks: [['[data-testid="bid-approve-tick"]', '1']] },
  { id: 's04-B-hidden', role: 'ad', who: CUT, iso: '2026-12-09', date: 'Wed 9 Dec', cards: [B3] },
  /* 5 — the group card until Q1 and Q2 are answered: its pucks and the pencil only (w8) */
  { id: 's05-group-meanwhile', role: 'ad', who: CUT, iso: '2026-12-21', date: 'Mon 21 Dec',
    cards: [{ box: 'c k-ll s-a whole', t: 'LL', main: W.headApproved, pucks: ['psy', 'riddler', 'spaceman'], sub: PLACED('Saber'), acts: [], pen: true, line: W.w8, marks: [['.ev-pen', '1'], ['.rd-line', '2']] }] },
  /* 5 / Q2 — a group's course drawn as Q2's recommendation: the Change line, Move and Delete, as b7's group leave */
  { id: 's05-q2-group-course', role: 'ad', who: CUT, iso: '2026-12-14', date: 'Mon 14 Dec', add: { dur: 'Whole day' },
    cards: [{ ...CSE, pucks: ['psy', 'riddler', 'spaceman'], sub: PLACED('Saber'), change: W.w4.slice(1), marks: [['.dl-acts .move', '1'], ['.rd-change', '2']] }] },
  /* 10 — a refused bid: Approve grey, Refused lit (D2881), Move, Delete, its leave buttons (today's list gives the same) */
  { id: 's10-refused', role: 'ad', who: CUT, iso: '2026-12-23', date: 'Wed 23 Dec',
    cards: [{ fromCell: true, t: 'LL', main: W.headRefused, pucks: ['psy'], sub: `<span class="bp-placedline">${W.placedBy} <b>Saber</b> · ${W.stamp} · ${W.refusedBy} <b>Saber</b> · ${W.stamp2}</span>`,
      acts: ['approveOff', 'refused', 'move', 'del'], rmk: 'full', leave: 'LL', dur: 'Whole day', marks: [['.dl-acts .dk-r', '1', 't']] }] },
  /* 11 — an OIL the schedule earned (FO*): a card with no buttons (its box drawn into the grid's cell too) */
  { id: 's11-oil-earned', role: 'ad', who: CUT, iso: '2026-12-12', date: 'Sat 12 Dec', cellBox: { box: 'c k-oil s-a whole', t: 'FO*' },
    cards: [{ box: 'c k-oil s-a whole', t: 'FO*', main: W.s11head, pucks: ['psy'], sub: `<span class="bp-placedline">${W.s11sub}</span>`, acts: [], marks: [['CARD', '1']] }] },
  /* 12 — a replaced-bid notice as a card, under the course that replaced it (today's words; no box, as today's line) */
  { id: 's12-replaced-notice', role: 'ad', who: CUT, iso: '2026-12-14', date: 'Mon 14 Dec', add: { dur: 'Whole day' },
    cards: [CSE, { noBox: true, main: W.s12text, acts: ['seen'], marks: [['CARD', '1']] }] },
  /* Q3 — a pending bid (b2's card) after OL is tapped once: w1 just above the leave buttons, as b3o1 */
  { id: 's13-q3-pending-second-tap', role: 'ad', who: CUT, iso: '2026-12-02', date: 'Wed 2 Dec', cards: [{ ...LL_PEND, noteText: W.w1, marks: [['.rd-noteline', '1']] }] },

  /* ---- Ranger, a member (us / us). His window is opened on an empty open day of his (31 Dec) and drawn as the day's. */
  /* 2 — R5 for the leave's own member (step 7, rule 10): Delete, Remarks, Document and the pencil; no Move */
  { id: 's02b-hours-member', role: 'us', who: RAN, iso: '2026-12-08', date: 'Tue 8 Dec',
    cards: [{ fromCell: true, t: 'LL', main: W.headHours, pucks: ['bane'], sub: PLACED('Ranger'), acts: ['del'], pen: true, rmk: 'full', marks: [['.dl-acts .del', '1'], ['.ev-pen', '2']] }] },
  /* 3 — Q5: his approved leave on a day closed for bidding (30 Nov) and on a past day (20 Nov) — answers A, B and C */
  { id: 's03-A-closed', role: 'us', who: RAN, iso: '2026-11-30', date: 'Mon 30 Nov', cards: [RAN_APPR(['del'], { line: W.w9closed, marks: [['.dl-acts .del', '1'], ['.rd-line', '2']] })] },
  { id: 's03-A-past', role: 'us', who: RAN, iso: '2026-11-20', date: 'Fri 20 Nov', cards: [RAN_APPR(['del'], { line: W.w9past, marks: [['.dl-acts .del', '1'], ['.rd-line', '2']] })] },
  { id: 's03-B-closed', role: 'us', who: RAN, iso: '2026-11-30', date: 'Mon 30 Nov', cards: [RAN_APPR([], { line: W.q5Bclosed, marks: [['.rd-line', '1']] })] },
  { id: 's03-B-past', role: 'us', who: RAN, iso: '2026-11-20', date: 'Fri 20 Nov', cards: [RAN_APPR([], { line: W.q5Bpast, marks: [['.rd-line', '1']] })] },
  { id: 's03-C-closed', role: 'us', who: RAN, iso: '2026-11-30', date: 'Mon 30 Nov', cards: [RAN_APPR(['move', 'del'], { leave: 'LL', dur: 'Whole day', marks: [['.dl-acts .move', '1'], ['[aria-label="Which leave"]', '2']] })] },
  { id: 's03-C-past', role: 'us', who: RAN, iso: '2026-11-20', date: 'Fri 20 Nov', cards: [RAN_APPR(['move', 'del'], { leave: 'LL', dur: 'Whole day', marks: [['.dl-acts .move', '1'], ['[aria-label="Which leave"]', '2']] })] },
  /* 9 — a member looking at another man's day (Cutter, Fri 18 Dec: an OIL award and a pending bid): read-only cards,
     no buttons, no Remarks box, no leave buttons, no last row */
  { id: 's09-member-other-day', role: 'us', who: CUT, tapWho: RAN, name: 'Cutter', iso: '2026-12-18', date: 'Fri 18 Dec', noLast: true,
    cards: [{ box: 'c k-oil s-a whole', t: 'FO', main: W.w5head, pucks: ['psy'], sub: `<span class="bp-placedline">${W.w5sub}</span>`, acts: [], marks: [['CARD', '1']] },
      { ...LL_PEND, acts: [], rmk: null, leave: null, marks: [['CARD', '2']] }] },
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
.dl-acts .dk-b.dk-r.on{background:#F0555F !important;border-color:#F0555F !important;color:#0b1116 !important}
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
.rd .rd-pucks{display:flex;flex-wrap:wrap;gap:4px;margin:3px 0 2px;width:fit-content}
.rd .rd-change{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;align-items:center}
.rd .rd-change .note{padding-left:2px}
.rd .dl-head .ev-pen{margin-left:auto;align-self:center;width:30px;height:30px;border-radius:7px}
.rd .dl-head .ev-pen .pen-ic{width:15px;height:15px}
.rd .rd-doconly{justify-content:flex-end}
.rd .rd-card .rd-line{margin-top:8px}
.rd .rd-card .rd-line .note{flex:1 1 auto}
.rd-new{outline:2px dashed #FFD23F !important;outline-offset:2px}
.rd-tag{position:fixed;z-index:2147483647;background:#FFD23F;color:#15171c;font:800 11px/17px system-ui,sans-serif;padding:0 6px;border-radius:9px;pointer-events:none;box-shadow:0 0 0 1px #15171c;white-space:nowrap}
.rv-hide{display:none !important}`

/* the transform, in the page (the drawing of record's, extended): the window today's app opens on an empty day of the
   same man becomes the frame's */
function transform(f) {
  const vis = e => e && e.getBoundingClientRect().width > 0
  const sheet = ['bid-picker', 'raptor-sheet'].map(t => document.querySelector(`[data-testid="${t}"]`)).find(vis)
  if (!sheet) return { err: 'no window' }
  const held = f.cards.length > 0
  sheet.classList.add('rd')
  const hd = sheet.querySelector('.bidsheet-hd')
  hd.querySelector('.when, .dt').textContent = f.date
  /* another man's day (s09): the title's name is his */
  if (f.name) { const nm = [...hd.querySelectorAll('*')].find(e => !e.children.length && e.textContent.trim() && e.textContent.trim() !== f.date && !e.closest('button') && !/^\s*$/.test(e.textContent)); if (nm) nm.textContent = f.name }
  const tillOf = f.till || f.date.split(' ').slice(1).join(' ')
  const setTill = root => { const t = root.querySelector('[data-testid="bid-tilldate"]'); if (t) t.textContent = 'till ' + tillOf }
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
    const on = i => (c.changeOn || 0) === i ? ' on' : ''
    const change = c.change ? `<div class="rd-change"><span class="note">${f.W.w4[0]}</span><button class="pchip${on(0)}">${c.change[0]}</button><button class="pchip${on(1)}">${c.change[1]}</button></div>` : ''
    const pen = c.pen ? `<button type="button" class="ev-ctl ev-pen" title="Edit" aria-label="Edit ${c.t}, ${f.date}">${f.PEN}</button>` : ''
    const boxHtml = c.noBox ? '' : `<span class="leg-box dl-box" aria-hidden="true"><span class="${box}">${c.t}</span></span>`
    card.innerHTML = `<ul class="daylist flat"><li class="dl-line dl-card"><div class="dl-head">${boxHtml}<div class="dl-text"><span class="dl-main">${c.main}</span>${pucks}${c.sub ? `<span class="dl-sub bp-placed">${c.sub}</span>` : ''}</div>${pen}</div>${acts}${change}</li></ul>`
    /* a line of words inside the card, after its buttons (w8, w9) — the window's own note look, plain, not the warning's */
    if (c.line) { const lr = document.createElement('div'); lr.className = 'bidsheet-row rd-line'; lr.innerHTML = `<span class="note">${c.line}</span>`; card.appendChild(lr) }
    if (c.rmk && rmk) {
      const row = rmk.cloneNode(true); setTill(row)
      if (c.rmk === 'doc') { row.querySelectorAll('textarea, input, label, [data-testid="bid-tilldate"]').forEach(e => e.remove()); [...row.children].forEach(ch => { if (!ch.querySelector('button') && ch.tagName !== 'BUTTON') ch.remove() }); row.classList.add('rd-doconly') }
      if (c.rmkText) row.querySelector('textarea').value = c.rmkText
      card.appendChild(row)
    }
    if (c.leave && dur && leave) {
      const d2 = dur.cloneNode(true), l2 = leave.cloneNode(true)
      litDur(d2, c.dur || 'Whole day'); l2.querySelector(`[data-testid="bid-${c.leave}"]`)?.classList.add('lit')
      /* R4 (s01): the several-day window's own two chips, cloned from the real window, where Pick a range stands */
      if (c.chips && f.CHIPS) {
        const pr = d2.querySelector('[data-testid="span-range"]')
        if (pr) { const w = document.createElement('span'); w.className = 'rd-chips'; w.style.cssText = 'display:inline-flex;gap:inherit;margin-left:auto'; w.innerHTML = f.CHIPS; pr.replaceWith(w) }
      }
      card.appendChild(d2)
      /* D2897's line stands just above the leave buttons, where the below-zero line stands (D2031) */
      if (c.noteText) { const nr = document.createElement('div'); nr.className = 'bidsheet-row rd-noteline'; nr.innerHTML = `<span class="note warn">${c.noteText}</span>`; card.appendChild(nr) }
      card.appendChild(l2)
    }
    anchor.after(card); anchor = card
  }
  if (f.add) {
    if (dur) litDur(dur, f.add.dur)
    if (held) { const extra = sheet.querySelector('[data-testid="bid-extra-row"]'); rmk?.remove(); [dur, leave].forEach(e => e && extra.before(e)) }
  } else {
    rmk?.remove(); dur?.remove(); leave?.remove()
    if (!f.keepSwitch) sheet.querySelector('[data-testid="bid-approve-tick"]')?.remove()
  }
  if (f.noLast) sheet.querySelector('[data-testid="bid-extra-row"]')?.classList.add('rv-hide')
  document.querySelectorAll('td.selcell').forEach(td => td.classList.remove('selcell'))
  const cell = document.querySelector(`[data-testid="cell-${f.who}-${f.iso}"]`)
  cell?.classList.add('selcell')
  /* s11: the schedule's credit drawn into the grid's cell too (the world holds none) */
  if (f.cellBox && cell && !cell.querySelector('.rd-cellbox')) {
    const ref = document.querySelector(`[data-testid="cell-${f.who}-2026-12-17"] .c`)
    const s = document.createElement('span'); s.className = (ref ? [...ref.classList].join(' ') : f.cellBox.box) + ' rd-cellbox'; s.textContent = f.cellBox.t
    const host = ref?.parentElement ? ref.parentElement.cloneNode(false) : null
    if (host) { host.classList.add('rd-cellhost'); host.appendChild(s); cell.appendChild(host) } else cell.appendChild(s)
  }
  const over = el => el.scrollWidth - el.clientWidth
  return { ok: true, cell: !!cell, sheetOver: over(sheet), height: Math.round(sheet.getBoundingClientRect().height), top: Math.round(sheet.getBoundingClientRect().top),
    spill: [...sheet.querySelectorAll('button, .puck, .dl-main, .dl-sub, textarea, .note')].filter(e => vis(e) && (e.getBoundingClientRect().right > sheet.getBoundingClientRect().right - 1 || e.scrollWidth > e.clientWidth + 1)).map(e => (e.textContent || e.className).trim().slice(0, 24)) }
}
/* the marks: a dashed outline on the element, a numbered tag beside it (the drawing of record's look) */
async function markList(p, list) {
  return p.evaluate(list => {
    document.querySelectorAll('.rd-tag').forEach(t => t.remove()); document.querySelectorAll('.rd-new').forEach(e => e.classList.remove('rd-new'))
    const missing = []
    for (const [sel, text, side] of list) {
      const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); if (!e) { missing.push(sel); continue }
      const before = e.getBoundingClientRect()
      e.classList.add('rd-new')
      if (/\.move$/.test(sel)) { const d = e.nextElementSibling; if (d) d.classList.add('rd-new') }
      const r = e.getBoundingClientRect(), t = document.createElement('span'); t.className = 'rd-tag'; t.textContent = text; document.body.appendChild(t)
      if (Math.abs(r.width - before.width) > 0.5 || Math.abs(r.top - before.top) > 0.5) missing.push('MOVED ' + sel)
      const tw = t.getBoundingClientRect().width
      /* 't': on the element's top-left corner, so it covers no neighbour's words */
      if (side === 't') { t.style.left = Math.max(2, r.left - tw / 2) + 'px'; t.style.top = Math.max(2, r.top - 9) + 'px'; continue }
      const right = side === 'r' || r.left - tw - 4 < 2
      t.style.left = (right ? Math.min(innerWidth - tw - 2, r.right + 4) : r.left - tw - 4) + 'px'
      t.style.top = Math.max(2, r.top + r.height / 2 - 9) + 'px'
    }
    return missing
  }, list)
}
const cardMarks = f => f.cards.flatMap((c, i) => (c.marks || []).map(([s, t, side]) => [s === 'CARD' ? `.rd-card[data-rd="${i + 1}"]` : s.startsWith('[aria') || s.startsWith('.') ? `.rd-card[data-rd="${i + 1}"] ${s}` : s, t, side])).concat(f.marks || [])
/* the crop: the given elements, the tags, padded, inside the screen */
async function clip(p, file, sels, maxH) {
  await sleep(300)
  const box = await p.evaluate(([sels, maxH]) => {
    const els = sels.flatMap(s => [...document.querySelectorAll(s)]).concat([...document.querySelectorAll('.rd-tag')])
      .filter(e => e && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().bottom > 0 && e.getBoundingClientRect().top < innerHeight && getComputedStyle(e).visibility !== 'hidden')
    if (!els.length) return null
    const rs = els.map(e => e.getBoundingClientRect()), pad = 12
    const x = Math.max(0, Math.min(...rs.map(r => r.left)) - pad), y = Math.max(0, Math.min(...rs.map(r => r.top)) - pad)
    const bottom = Math.min(innerHeight, Math.max(...rs.map(r => r.bottom)) + pad, maxH ? y + maxH : 1e9)
    return { x, y, width: Math.min(innerWidth, Math.max(...rs.map(r => r.right)) + pad) - x, height: bottom - y }
  }, [sels, maxH])
  const name = `${file}-${PHONE ? 'phone' : 'desktop'}.png`
  if (!box) { console.log('  NO PICTURE (nothing to crop)', name); return }
  await p.screenshot({ path: path.join(IMG, name), clip: box })
  console.log('  picture', name, Math.round(box.width) + 'x' + Math.round(box.height))
}
const winSels = f => ['[data-testid="bid-picker"]', '[data-testid="raptor-sheet"]', `[data-testid="cell-${f.who}-${f.iso}"]`]
let CHIPS = null
async function draw(p, f0) {
  const f = { ...f0, ACT, PEN, W, CHIPS }
  try {
    await tap(p, f.tapWho || f.who, BASE)
    /* Q4's example: Hex has turned Auto-approve off — pressed off for real in this window, turned back on after */
    if (f.switchOff) { const sw = p.locator('[data-testid="bid-approve-tick"]:visible').first(); if ((await sw.getAttribute('aria-checked')) === 'true') { await press(p, sw); await sleep(300) } console.log('  Auto-approve now', await sw.getAttribute('aria-checked')) }
    await reach(p, f.who, f.iso)
    const r = await p.evaluate(transform, f)
    if (!r.ok) throw new Error(JSON.stringify(r))
    /* the tapped day kept in sight just above the window (a phone's sheet covers the middle of the grid) */
    const moved = await p.evaluate(f => {
      const cell = document.querySelector(`[data-testid="cell-${f.who}-${f.iso}"]`)
      const sheet = ['bid-picker', 'raptor-sheet'].map(t => document.querySelector(`[data-testid="${t}"]`)).find(e => e && e.getBoundingClientRect().width > 0)
      if (!cell || !sheet) return 'no cell'
      /* the window's visible frame: the sheet, or an ancestor drawn above it (its rounded card), never the whole screen */
      let frame = sheet
      for (let e = sheet.parentElement, i = 0; e && i < 5; e = e.parentElement, i++) { const r = e.getBoundingClientRect(); if (r.width > 0 && r.top < frame.getBoundingClientRect().top - 0.5 && r.height < innerHeight - 20) frame = e }
      const fr = frame.getBoundingClientRect(), cr = cell.getBoundingClientRect()
      if (cr.right < fr.left || cr.left > fr.right) return 0
      const delta = Math.round(cr.bottom - (fr.top - 12))
      if (delta <= 0) return 0
      /* the page scrolled up by just that much, so the cell stands right above the window; where the page is already at
         its foot (a phone), room is added below it, out of every picture, so it can scroll on */
      if (!document.getElementById('rdSpacer')) { const s = document.createElement('div'); s.id = 'rdSpacer'; s.style.height = '700px'; document.body.appendChild(s) }
      scrollBy(0, delta)
      const after = cell.getBoundingClientRect().bottom - (frame.getBoundingClientRect().top - 12)
      const dbg = after > 0 ? ' ' + JSON.stringify({ cell: [Math.round(cell.getBoundingClientRect().top), Math.round(cell.getBoundingClientRect().bottom)], frame: Math.round(frame.getBoundingClientRect().top), sy: scrollY, sc: (() => { const o = []; for (let e = cell.parentElement; e; e = e.parentElement) { if (e.scrollHeight > e.clientHeight + 2) o.push([e.tagName + '.' + String(e.className).slice(0, 20), e.scrollTop, e.scrollHeight, e.clientHeight, getComputedStyle(e).overflowY]) } return o })() }) : ''
      return `${delta} (frame ${frame.className.toString().slice(0, 30)}; ${after > 0 ? 'still covered' : 'clear'})${dbg}`
    }, f)
    if (moved) console.log('  grid scrolled', moved)
    console.log(`${f.id}: window ${r.height}px tall, top ${r.top} · cell ${r.cell} · sideways ${r.sheetOver} · spills ${JSON.stringify(r.spill)}`)
    const ml = cardMarks(f)
    if (ml.length) { const miss = await markList(p, ml); if (miss.length) console.log('  MARK MISSING', miss); await clip(p, f.id, winSels(f)); await markList(p, []) }
    await clip(p, f.id + '-clean', winSels(f))
  } catch (e) { console.log('  FAILED', f.id, String(e.message || e).split('\n')[0]) }
  /* a box drawn into a grid cell (s11) leaves with its frame */
  await p.evaluate(() => document.querySelectorAll('.rd-cellhost, .rd-cellbox').forEach(e => e.remove()))
  await closeAll(p)
  if (f0.switchOff) {
    await tap(p, CUT, '2026-12-01')
    const sw = p.locator('[data-testid="bid-approve-tick"]:visible').first()
    if (await sw.count() && (await sw.getAttribute('aria-checked')) !== 'true') { await press(p, sw); await sleep(300) }
    console.log('  Auto-approve back', await sw.getAttribute('aria-checked')); await closeAll(p)
  }
}

/* ---- the world: the drawing of record's (setupWorld), plus what these states need ---- */
const fileIn = (p, o) => p.evaluate(o => window.fileInput(o), o)
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const md = iso => `${MON[+iso.slice(5, 7) - 1]} ${+iso.slice(8)}`
async function bidOn(p, who, iso, code, approve) {
  await tap(p, who, iso)
  const sw = p.locator('[data-testid="bid-approve-tick"]').first()
  if (await sw.count()) { const on = (await sw.getAttribute('aria-checked')) === 'true' || (await sw.getAttribute('aria-pressed')) === 'true'; if (on !== approve) { await press(p, sw); await sleep(250) } }
  await press(p, `[data-testid="bid-picker"] [data-testid="bid-${code}"]`); await sleep(800); await closeAll(p)
}
async function moreWorld(p) {
  /* s01: Ghost's five approved LL days, Mon 14 – Fri 18 Dec, placed on the war (the world's Cutter is busy that week) */
  for (const iso of ['2026-12-14', '2026-12-15', '2026-12-16', '2026-12-17', '2026-12-18']) await bidOn(p, GHOST, iso, 'LL', true)
  /* s02a / s02b: leave with set hours, 10:00–15:00, filed on the Inputs page */
  await fileIn(p, { person: CUT, date: md('2026-12-22'), yr: 2026, type: 'LL', remarks: '', allday: false, s: 600, e: 900 })
  await fileIn(p, { person: RAN, date: md('2026-12-08'), yr: 2026, type: 'LL', remarks: '', allday: false, s: 600, e: 900 })
  /* s03: Ranger's approved LL on a closed day (30 Nov) and a past day (20 Nov), filed on the Inputs page */
  await fileIn(p, { person: RAN, date: md('2026-11-30'), yr: 2026, type: 'LL', remarks: '', allday: true })
  await fileIn(p, { person: RAN, date: md('2026-11-20'), yr: 2026, type: 'LL', remarks: '', allday: true })
  await sleep(1200)
  /* s10: a bid placed pending, then refused by the window's own Refuse */
  await bidOn(p, CUT, '2026-12-23', 'LL', false)
  await tap(p, CUT, '2026-12-23')
  const rf = p.locator('[data-testid="decide-refuse"]:visible, [data-testid^="dl-refuse-"]:visible').first()
  if (await rf.count()) { await press(p, rf); await sleep(700) } else console.log('  (no Refuse found for 23 Dec)')
  await closeAll(p)
  /* the several-day chips, from the real window on Ghost's Wed 16 Dec */
  await tap(p, GHOST, '2026-12-16')
  CHIPS = await p.evaluate(() => {
    const all = [...document.querySelectorAll('[data-testid="bid-picker"] button')].find(b => /^All \d+ days$/.test(b.textContent.trim()))
    if (!all) return null
    const nx = all.nextElementSibling
    return all.outerHTML + (nx && nx.tagName === 'BUTTON' ? nx.outerHTML : '')
  })
  /* Auto-approve back on (the s10 bid turned it off; the switch is remembered), as the drawings of record show it */
  await closeAll(p); await tap(p, CUT, '2026-12-01')
  const sw = p.locator('[data-testid="bid-approve-tick"]').first()
  if (await sw.count() && (await sw.getAttribute('aria-checked')) !== 'true' && (await sw.getAttribute('aria-pressed')) !== 'true') { await press(p, sw); await sleep(250) }
  console.log('  Auto-approve:', await sw.getAttribute('aria-checked'), await sw.getAttribute('aria-pressed'))
  console.log('  several-day chips:', CHIPS ? CHIPS.replace(/<[^>]+>/g, '|').replace(/\|+/g, '|') : 'NOT FOUND')
  await closeAll(p)
}
/* what the world must show on screen before anything is drawn (the how-to's "each staged record asserted ON SCREEN") */
async function assertWorld(p) {
  const want = [[GHOST, '2026-12-16'], [CUT, '2026-12-22'], [CUT, '2026-12-23'], [CUT, '2026-12-09'], [CUT, '2026-12-21'], [CUT, '2026-12-14'], [CUT, '2026-12-02']]
  for (const [w, iso] of want) {
    await reach(p, w, iso)
    const t = await p.evaluate(s => document.querySelector(s)?.textContent.trim() || '', `[data-testid="cell-${w}-${iso}"]`)
    console.log(`  on screen ${w} ${iso}: "${t}"`)
  }
}

/* ---- s07: the bell's two new lines (w10, w11), cloned from his real war line, in the bell's own list ---- */
async function bell(p) {
  try {
    await press(p, '#notifyBell'); await sleep(900)
    const r = await p.evaluate(W => {
      const list = document.querySelector('[data-testid="bell-list"]'); if (!list) return 'no list'
      const src = [...list.querySelectorAll('.bl-line')].find(l => /added and approved/.test(l.textContent)) || list.querySelector('.bl-line')
      const mk = (day, what, n) => {
        const c = src.cloneNode(true); c.removeAttribute('data-testid'); c.classList.add('rd-bl' + n)
        c.querySelector('.bl-name').textContent = W.bellWho; c.querySelector('.bl-day').textContent = day
        c.querySelector('.bl-what').textContent = `${what} · ${W.bellBy}`; c.querySelector('.bl-ago').textContent = 'now'
        return c
      }
      const a = mk('Thu 3 Dec', W.w10, 1), b = mk('Wed 9 Dec', W.w11, 2), c = mk('Fri 4 Dec', W.w10pending, 3)
      src.parentElement.prepend(c); src.parentElement.prepend(b); src.parentElement.prepend(a)
      return [...list.querySelectorAll('.bl-line')].map(l => l.textContent.replace(/\s+/g, ' ').trim())
    }, W)
    console.log('s07 bell:', JSON.stringify(r))
    const miss = await markList(p, [['.rd-bl1', '1'], ['.rd-bl2', '2'], ['.rd-bl3', '3']])
    if (miss.length) console.log('  MARK MISSING', miss)
    await clip(p, 's07-bell-lines', ['[data-testid="bell-list"]', '#notifyBell']); await markList(p, [])
    await clip(p, 's07-bell-lines-clean', ['[data-testid="bell-list"]', '#notifyBell'])
  } catch (e) { console.log('  FAILED s07', String(e.message || e).split('\n')[0]) }
  await p.keyboard.press('Escape').catch(() => {}); await sleep(400)
}

/* ---- s06: Approvals' "Also since you last looked" with a member's deleted approved leave (w26). The real line first:
   Ranger withdraws his pending bid on Wed 2 Dec after Saber's last look; the new line is that line, cloned. ---- */
async function approvals(p) {
  try {
    await press(p, '[data-testid="lw-tab-approvals"]'); await sleep(1800)
    /* the "also" list stands under the New choice only (ApprovalsPage) */
    const nw = p.locator('button:visible').filter({ hasText: /^New/ }).first()
    if (await nw.count()) { await press(p, nw); await sleep(900) } else console.log('  (no New choice found)')
    const r = await p.evaluate(W => {
      const also = document.querySelector('[data-testid="appr-also"]'); if (!also) return 'no also list'
      const src = also.querySelector('[data-testid="appr-also-withdrawn"]') || also.querySelector('.appr-aline'); if (!src) return 'no line'
      const c = src.cloneNode(true); c.removeAttribute('data-testid'); c.classList.add('rd-also')
      const box = c.querySelector('.appr-box'); if (box) { box.textContent = 'LL'; box.className = box.className.replace(/\bs-\w\b/, 's-r') }
      const dl = c.querySelector('.appr-dlink'); if (dl) dl.textContent = W.w26date + ' ›'
      c.querySelector('.appr-awhat').textContent = W.w26
      src.before(c)
      also.scrollIntoView({ block: 'center' })
      return [...also.querySelectorAll('.appr-aline')].map(l => l.textContent.replace(/\s+/g, ' ').trim())
    }, W)
    console.log('s06 also:', JSON.stringify(r))
    await sleep(400)
    const miss = await markList(p, [['.rd-also .appr-awhat', '1']]); if (miss.length) console.log('  MARK MISSING', miss)
    await clip(p, 's06-also-since', ['[data-testid="appr-also"]']); await markList(p, [])
    await clip(p, 's06-also-since-clean', ['[data-testid="appr-also"]'])
  } catch (e) { console.log('  FAILED s06', String(e.message || e).split('\n')[0]) }
}
async function withdraw(p) {
  await tap(p, RAN, '2026-12-02')
  const del = p.locator('[data-testid="bid-clear"]:visible').first()
  if (await del.count()) { await press(p, del); await sleep(800) } else console.log('  (no Delete on his 2 Dec bid)')
  await closeAll(p)
}

/* ---- s08: "To review" on Edit Schedule's week (Q6), as the Board's drawing (t1, t2): Monday 13 Jul, the demo week.
   An ALL AVAIL Training is filed for Monday so the Common Programme holds a row that came from an input. ---- */
function t8([mode, W]) {
  const day = [...document.querySelectorAll('#eWeek .day[data-day="0"]')].find(d => d.getBoundingClientRect().width > 0); if (!day) return { err: 'no Monday' }
  document.querySelectorAll('#rvCommon, #rvGround, #rvReview').forEach(e => e.removeAttribute('id'))
  const cp = day.querySelector('.sec-prog'), gp = day.querySelector('.sec-grnd'), pi = day.querySelector('.sec-inp')
  if (!cp || !gp || !pi) return { err: 'no sections', cp: !!cp, gp: !!gp, pi: !!pi }
  cp.id = 'rvCommon'; gp.id = 'rvGround'; pi.id = 'rvReview'
  /* the line "To take an input off, press Reject on it in Personal Inputs below." goes (w19), hidden, never removed */
  day.querySelectorAll('.pl-inpnote').forEach(n => { if (!pi.contains(n)) n.classList.add('rv-hide') })
  const proto = pi.querySelector('.accb.undo')
  const lines = [...pi.querySelectorAll('.pl-row')]
  const names = lines.filter(r => r.querySelector('.accb.undo')).map(r => (r.querySelector('.inpedit')?.textContent || '').trim().toLowerCase())
  let ground = 0, common = 0
  const addRej = (row, cls) => {
    const ppl = row.querySelector('.ppl'); if (!ppl || !proto || ppl.querySelector('.rv-rej')) return false
    const b = proto.cloneNode(true); b.removeAttribute('data-acck'); b.classList.add('rv-rej', cls)
    Object.assign(b.style, { marginLeft: '8px', alignSelf: 'center', flex: 'none' })
    ppl.style.display = 'flex'; ppl.style.alignItems = 'center'; ppl.style.flexWrap = 'nowrap'
    /* the pucks keep their own width beside it (pucks never shrink or wrap) */
    ;[...ppl.children].forEach(ch => { ch.style.flex = 'none' })
    /* on a phone the people column has no room beside the puck: the button drops under the people, as the week already
       places an input's button on a phone where its puck's line is full (D947) */
    if (innerWidth < 600) { ppl.style.flexWrap = 'wrap'; ppl.style.rowGap = '4px'; b.style.marginLeft = '0' }
    const addz = ppl.querySelector('.addz'); if (addz) addz.before(b); else ppl.appendChild(b)
    return true
  }
  for (const row of gp.querySelectorAll('.pl-row.gr-frominput')) if (addRej(row, 'rv-g')) ground++
  for (const row of cp.querySelectorAll('.ah-row')) {
    const nm = (row.querySelector('.nm .ntx')?.textContent || '').trim().toLowerCase()
    if (names.includes(nm) && addRej(row, 'rv-c')) common++
  }
  /* Personal Inputs → "To review": only what is not placed stays */
  const head = pi.querySelector('.sub-h')
  for (const n of head.childNodes) if (n.nodeType === 3 && /Personal Inputs/.test(n.textContent)) n.textContent = W.w16
  head.querySelectorAll('span').forEach(s => { if (s.textContent.trim() === 'Personal Inputs') s.textContent = W.w16 })
  const waiting = lines.filter(r => !r.querySelector('.accb.undo'))
  lines.filter(r => r.querySelector('.accb.undo')).forEach(r => r.classList.add('rv-hide'))
  if (!waiting.length) {
    [...pi.children].forEach(ch => { if (ch !== head) ch.classList.add('rv-hide') })
    const hint = head.querySelector('.pl-hint'); if (hint) hint.textContent = W.w17
  }
  return { ground, common, waiting: waiting.length, names }
}
async function weekShots(p, mode) {
  const parts = [['common', '#rvCommon'], ['ground', '#rvGround'], ['review', '#rvReview']]
  const marks = { common: [['#rvCommon .rv-c', '3', 'r']], ground: [['#rvGround .rv-g', '2', 'r']], review: [['#rvReview > .sub-h', '1']] }
  for (const [part, sel] of parts) {
    await p.evaluate(s => { const e = document.querySelector(s); if (e) { e.style.scrollMarginTop = '150px'; e.scrollIntoView({ block: e.getBoundingClientRect().height < innerHeight - 200 ? 'center' : 'start' }) } }, sel); await sleep(500)
    const top = await p.evaluate(s => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); const at = document.elementFromPoint(r.left + 20, Math.max(1, r.top + 4)); return { top: Math.round(r.top), h: Math.round(r.height), clear: !!at && e.contains(at) } }, sel)
    if (!top.clear) console.log(`  (${part}: something covers its top edge at ${top.top})`)
    const miss = await markList(p, marks[part])
    if (miss.length) console.log('  MARK MISSING', part, miss)
    await clip(p, `s08-${mode}-${part}`, [sel]); await markList(p, [])
    await clip(p, `s08-${mode}-${part}-clean`, [sel])
  }
}
async function week(p) {
  try {
    await fileIn(p, { people: [{ p: 'allavail' }], date: 'Jul 13', yr: 2026, type: 'Training', title: 'Survival refresher', remarks: '', allday: false, s: 780, e: 840 })
    if (!PHONE) await p.setViewportSize({ width: 1536, height: 1100 })
    await p.evaluate(() => window.go('editsched')); await sleep(2000)
    const openPI = async () => { await p.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day[data-day="0"]')].find(x => x.getBoundingClientRect().width > 0); if (d && !d.querySelector('.sec-inp .pl-row')) d.querySelector('.sec-inp [data-pitog]')?.click() }); await sleep(800) }
    await openPI()
    let r = await p.evaluate(t8, ['none', W]); console.log('s08 none', JSON.stringify(r))
    await weekShots(p, 'none')
    /* one rejected for real: the Meeting, by today's Reject under Personal Inputs — the page redrawn first */
    /* the first state's injected parts taken away again (the app keeps the day's markup across a page change) */
    await p.evaluate(W => {
      document.querySelectorAll('.rv-rej').forEach(b => b.remove())
      document.querySelectorAll('.rv-hide').forEach(e => e.classList.remove('rv-hide'))
      const pi = document.getElementById('rvReview'), head = pi?.querySelector('.sub-h')
      if (head) { for (const n of head.childNodes) if (n.nodeType === 3 && n.textContent.includes(W.w16)) n.textContent = 'Personal Inputs'; const h = head.querySelector('.pl-hint'); if (h && h.textContent === W.w17) h.textContent = '⌃' }
    }, W)
    await p.evaluate(() => window.go('inputs')); await sleep(800); await p.evaluate(() => window.go('editsched')); await sleep(1800)
    await openPI()
    /* the visible Monday's own Reject on the Meeting line, pressed (the week keeps hidden copies of its days) */
    const rej = p.locator('#eWeek .day[data-day="0"] .sec-inp .pl-row:visible').filter({ hasText: 'Meeting' }).locator('.accb.undo:visible').first()
    if (await rej.count()) { await rej.scrollIntoViewIfNeeded(); if (PHONE) await rej.tap(); else await rej.click(); await sleep(1000) } else console.log('  (no Meeting Reject found)')
    console.log('  Meeting still on the Ground Programme:', await p.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day[data-day="0"]')].find(x => x.getBoundingClientRect().width > 0); return [...d.querySelectorAll('.sec-grnd .pl-row')].some(r => /^MEETING$/i.test((r.querySelector('.nm .ntx')?.textContent || '').trim())) }))
    await openPI()
    r = await p.evaluate(t8, ['one', W]); console.log('s08 one', JSON.stringify(r))
    await weekShots(p, 'one')
  } catch (e) { console.log('  FAILED s08', String(e.message || e).split('\n')[0]) }
}

const browser = await PW.chromium.launch()
const ctx = await browser.newContext(PHONE
  ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
  : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
const errs = []
const watch = p => { p.setDefaultTimeout(10000); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 160)) }) }
const pick = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null
const want = id => !pick || pick.some(k => id.startsWith(k))
try {
  /* admin: the world, the admin's frames, then his first look at Approvals (so a later withdrawal is "since") */
  const p1 = await ctx.newPage(); watch(p1)
  await R.setupWorld(p1); await moreWorld(p1); await p1.addStyleTag({ content: CSS })
  await assertWorld(p1)
  for (const f of FRAMES.filter(f => f.role === 'ad' && want(f.id))) await draw(p1, f)
  await press(p1, '[data-testid="lw-tab-approvals"]'); await sleep(1500)
  await sleep(800); await p1.close()
  /* Ranger: his frames, his bell, then he withdraws his pending bid on Wed 2 Dec */
  const p2 = await ctx.newPage(); watch(p2)
  await signIn(p2, 'us', 'us'); await toWar(p2); await p2.addStyleTag({ content: CSS })
  for (const f of FRAMES.filter(f => f.role === 'us' && want(f.id))) await draw(p2, f)
  if (want('s07')) await bell(p2)
  await withdraw(p2)
  await sleep(800); await p2.close()
  /* Saber again: Approvals' "also" list, then Edit Schedule's week */
  const p3 = await ctx.newPage(); watch(p3)
  await signIn(p3, 'ad', 'a'); await toWar(p3); await p3.addStyleTag({ content: CSS })
  if (want('s06')) await approvals(p3)
  if (want('s08')) await week(p3)
  console.log('DONE', VERSION)
} catch (e) { console.log('FAILED', e.message.split('\n')[0]) }
finally { console.log('errors:', errs.length, errs.slice(0, 8)); await browser.close() }
