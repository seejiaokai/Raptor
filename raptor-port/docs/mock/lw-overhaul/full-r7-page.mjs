// The final set (D1206, night of 21-22 Oct 26), part 1: the Leave War PAGE as it will be built, and what a tap on a date
// opens. Drawn INTO THE REAL LOCAL BUILD on the staged squadron (clock Thu 8 Jan 26; <LWMOCK_OUT>/out/state.json, copied
// from the person helper's scratch). Every ruling D1141-D1207 in, the red team's fixes (design note §10.2) in, each open
// question of §10.3 drawn with its recommended answer and marked with a small "Q<n>" circle (the words are the write-up's; the shared parts and the marks: full-r7-one.mjs). Nothing here is built.
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r7-page.mjs        (R7_ONLY=01,05 for a few)
// Pictures: r7-01 member phone (lands, and one swipe on) · r7-02 admin phone · r7-03 admin desktop · r7-04 every state of
// a cell · r7-05 / r7-06 the day panel · r7-07 the Legend · r7-08 / r7-09 a member's tap on a day not open.
// Invented for the pictures (said in the write-up): Ranger's approved CCL on Thu 2 Apr (as the person window's list has
// it), and in r7-09 his waiting LL on Wed 1 Apr (a bid placed while April was open, the dates since closed).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo } from './full-lib.mjs'
import { oneStage, oneFold, mk, unmk } from './full-r7-one.mjs'
const ONLY = (process.env.R7_ONLY || '').split(',').filter(Boolean)
const want = n => !ONLY.length || ONLY.includes(n)
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))

const UP = '<svg viewBox="0 0 16 16" width="1.05em" height="1.05em" aria-hidden="true"><path d="M8 11V2.5M4.5 6L8 2.5 11.5 6M2.5 10.5v2.2c0 .5.4.8.8.8h9.4c.4 0 .8-.3.8-.8v-2.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'

// look F (D1175) — the families of full-cells4.mjs, his colours
export const FAM = { LL: 'fll', OL: 'fol', OIL: 'foil', FO: 'foil', HO: 'foil', CCL: 'care', FCL: 'care', PL: 'care', CL: 'care', EL: 'care', CSE: 'fcse', OD: 'od', C: 'med', B: 'med', HL: 'med', OML: 'med', MED: 'med' }
export const LOOKF_CSS = `
.zfc{position:relative}
.zf{position:absolute;display:flex;align-items:center;justify-content:center;box-sizing:border-box;border-radius:4px;overflow:hidden;z-index:1;pointer-events:none}
.zf b{font:700 10px/1 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.02em;white-space:nowrap}
.zf.whole{inset:2px}
.zf.whole b.wide{font-size:8.5px;letter-spacing:-.01em}
.zf.top{left:2px;right:2px;top:2px;bottom:calc(50% + .5px);border-radius:4px 4px 2px 2px}
.zf.bot{left:2px;right:2px;top:calc(50% + .5px);bottom:2px;border-radius:2px 2px 4px 4px}
.zf.left{top:2px;bottom:2px;left:2px;right:calc(50% + .5px);border-radius:4px 2px 2px 4px}
.zf.right{top:2px;bottom:2px;left:calc(50% + .5px);right:2px;border-radius:2px 4px 4px 2px}
.zf.right-am{top:2px;bottom:calc(50% + .5px);left:calc(50% + .5px);right:2px;border-radius:2px 4px 2px 2px}
.zf.right-pm{top:calc(50% + .5px);bottom:2px;left:calc(50% + .5px);right:2px;border-radius:2px 2px 4px 2px}
.zf.top b,.zf.bot b,.zf.left b,.zf.right b{font-size:7.5px;letter-spacing:0}
.zf.right-am b,.zf.right-pm b{font-size:6.5px;letter-spacing:0}
.zf.left b.l3,.zf.right b.l3{font-size:6px;letter-spacing:-.02em}
.zf.raptor::before,.zf.moved::before{content:'';position:absolute;left:0;top:0;bottom:0;width:0;z-index:1}
.zf.raptor::before{border-left:2px solid #3bc6e8}
.zf.moved::before{border-left:2px dotted #F2C879}
.zmk{position:absolute;z-index:2;top:0;left:0;font:800 7.5px/7.5px system-ui;padding:1px 2px;color:#0d1117;background:#e5a83b;border-radius:0 0 4px 0;pointer-events:none}
.e-fll{--h:242,200,110;--ink:#FFF1CF;--fill:.22}
.e-fol{--h:226,146,38;--ink:#FFE7C7;--fill:.48}
.e-foil{--h:70,196,108;--ink:#DDF8E6;--fill:.38}
.e-care{--h:138,150,255;--ink:#DCE0FF;--fill:.32}
.e-fcse{--h:184,142,240;--ink:#EEE2FF;--fill:.32}
.e-od{--h:160,170,182;--ink:#E6EBF0;--fill:.26}
.e-med{--h:236,104,140;--ink:#FFD0DD;--fill:.26}
.es-appr{background:rgba(var(--h),var(--fill));color:var(--ink);box-shadow:inset 0 0 0 1px rgba(var(--h),.85)}
.es-wait{background:transparent;color:rgb(var(--h));outline:1px dashed rgba(var(--h),.95);outline-offset:-1px}
.es-ref{background:transparent;color:#7d8894;box-shadow:inset 0 0 0 1px #4a5560}
.es-ref b{text-decoration:line-through}
`
// one cell's boxes: entries [{code, st: appr|wait|ref, half: ''|am|pm, raptor, moved}]
export function cellHTML(es, clash) {
  const box = (e, pos) => `<span class="zf ${pos} e-${FAM[e.code] || 'od'} es-${e.st}${e.raptor ? ' raptor' : ''}${e.moved ? ' moved' : ''}"><b${e.code.length > 2 && /M|W/.test(e.code) ? ' class="wide"' : (pos === 'left' || pos === 'right') && e.code.length > 2 ? ' class="l3"' : ''}>${e.code}</b></span>`
  let h
  const am = es.find(e => e.half === 'am'), pm = es.find(e => e.half === 'pm'), wh = es.filter(e => !e.half)
  if (wh.length === 2) h = box(wh[0], 'left') + box(wh[1], 'right')
  else if (wh.length === 1 && (am || pm)) h = box(wh[0], 'left') + box(am || pm, am ? 'right-am' : 'right-pm') // D1167
  else if (wh.length === 1) h = box(wh[0], 'whole')
  else h = (am ? box(am, 'top') : '') + (pm ? box(pm, 'bot') : '')
  return h + (clash ? '<span class="zmk">!</span>' : '')
}

const CSS = LOOKF_CSS + `
/* the pucks, for the day panel and the windows (lesson 25) */
.zpk{display:inline-flex;align-items:center;gap:4px;flex:none}
.zpk .cs{padding:2px 8px;border-radius:4px;font:600 13px system-ui}
.zpk i{font-style:normal;font:800 9px system-ui;padding:2px 5px;border-radius:8px}
.zkb{position:relative;display:inline-block;flex:none;width:30px;height:22px}
/* the day panel (D1143, D1198), from the foot */
.zday{position:fixed;z-index:95;background:#161b22;border:1px solid #2a323c;border-bottom:0;border-radius:14px 14px 0 0;box-shadow:0 -8px 24px rgba(0,0,0,.55);color:#e6edf3;font-family:system-ui;padding:6px 14px 12px}
.zday .grab{width:44px;height:4px;border-radius:2px;background:#3a4450;margin:2px auto 6px}
.zday .hd{display:grid;grid-template-columns:24px 40px 1fr 40px 24px;align-items:center;height:40px;border-bottom:1px solid #2a323c}
.zday .hd .t{text-align:center;font:800 15px system-ui;letter-spacing:.12em}
.zday .hd .ar{font:400 22px/1 system-ui;color:#c9d1d9;text-align:center}
.zday .hd .gr{color:#6b7785;font-size:14px}.zday .hd .x{color:#9aa5b1;font-size:16px;text-align:right}
.zday .closed{margin-top:10px;padding:9px 12px;border-radius:9px;background:#12161b;border:1px solid #2a323c;color:#c9d1d9;font:600 13.5px system-ui}
.zday .sec{margin:12px 2px 6px;font:700 10.5px system-ui;letter-spacing:.12em;color:#8a96a3}
.zday .figs{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.zday .pair{display:grid;grid-template-columns:1fr auto;row-gap:2px;padding:6px 10px;border-radius:8px}
.zday .pair.p{background:rgba(150,140,50,.13)}.zday .pair.w{background:rgba(40,160,110,.13)}
.zday .pair span{font:600 13.5px/1.6 system-ui;color:#c9d1d9}.zday .pair b{font:800 14px/1.6 system-ui;text-align:right;font-variant-numeric:tabular-nums;color:#f1f4f7}
.zday .pair b.red{color:#FF7A82}.zday .pair b.amb{color:#F2B84B}
.zday .calm{margin:6px 2px 0;font:500 13px system-ui;color:#8a96a3}
.zday .ln{display:grid;grid-template-columns:var(--pkw,104px) 30px minmax(0,1fr) 64px;align-items:center;gap:8px;min-height:38px;border-top:1px solid #222a33}
.zday .ln .d{font:600 13px system-ui;color:#e6edf3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.zday .ln .s{font:600 12.5px system-ui;color:#b6c0cb}.zday .ln .s.w{color:#f1f4f7}
/* a member's tap on a day not open (D1176, Q5) */
.bidsheet .zz-note{margin:12px 4px 6px;font:500 15px/1.45 system-ui;color:#d3dae1}
.bidsheet .zz-bidln{display:flex;align-items:center;gap:10px;font:600 14px system-ui;color:#e6edf3}
.bidsheet .zz-bidln .s{color:#9aa5b1;font-weight:500}
/* the Legend, look F (D1175, D1158) */
.leglist .zsw{position:relative;display:inline-block;flex:none;width:30px;height:26px;zoom:.8;border-radius:3px;background:#0f1318;box-shadow:inset 0 0 0 1px rgba(70,81,94,.8)}
.leglist .zsw.dim{background:#0b0e12}
.leglist .zsw.box{box-shadow:inset 0 0 0 2px rgba(74,140,100,.8)}
.leglist .zsw.you{background:transparent;box-shadow:inset 0 0 0 2px #9F4ADF}
.leglist .leg-row{align-items:center;padding-top:3px;padding-bottom:3px}
`


// the staged squadron's cells that hold two entries behind a "+1" today (read from the app's day list): Ace's Mon 19 Jan
// (an FO award and a refused OL bid — two whole days side by side, D1167) and Warden's Fri 23 Jan (a morning OIL bid and
// an afternoon LL bid, both waiting — halves, D1160)
const EXTRA = {
  'cell-dj-2026-01-19': [{ code: 'FO', st: 'appr', half: '' }, { code: 'OL', st: 'ref', half: '' }],
  'cell-nact-2026-01-23': [{ code: 'OIL', st: 'wait', half: 'am' }, { code: 'LL', st: 'wait', half: 'pm' }],
}

async function setup(kind, who, o = {}) {
  const phone = kind === 'phone'
  const { ctx, p } = phone ? await newPage(browser, 390, 844, true, state) : await newPage(browser, 1536, 860, false, state)
  await signIn(p, who)
  const member = who === 'member'
  // Q9: a member's Manning opens folded (remembered per person) — fold it through the app's own button first
  if (member) await oneFold(p)
  await p.evaluate(([css, EXTRA, FAM, cellSrc, extraCells]) => {
    window.FAM = FAM; const cellHTML = new Function('return ' + cellSrc)(); window.__cellHTML = cellHTML
    const st = document.createElement('style'); st.id = 'zzcss'; st.textContent = css; document.head.appendChild(st)
    const pg = document.querySelector('#page-leavewar')
    // look F on every cell (D1175, D1160, D1167); waiting = no decision (an Ack counts as waiting — D1158)
    const stOf = c => /\bref\b/.test(c) ? 'ref' : /\b(appr|info|sc)\b/.test(c) ? 'appr' : 'wait'
    for (const td of pg.querySelectorAll('td[data-testid^="cell-"]')) {
      const id = td.dataset.testid
      const chips = [...td.querySelectorAll(':scope > .c')]
      if (!chips.length && !extraCells[id]) continue
      if (chips.some(c => c.textContent.trim() === 'PO')) continue
      let es = chips.map(c => ({ code: c.textContent.replace(/[<>*]/g, '').trim(), st: stOf(c.className), half: /\bam\b/.test(c.className) ? 'am' : /\bpm\b/.test(c.className) ? 'pm' : '', raptor: /\braptor\b/.test(c.className) }))
      if (EXTRA[id]) es = EXTRA[id]
      if (extraCells[id]) es = extraCells[id]
      chips.forEach(c => c.remove()); td.querySelector(':scope > .mk.more')?.remove()
      td.classList.add('zfc'); td.insertAdjacentHTML('beforeend', cellHTML(es))
    }
  }, [CSS, EXTRA, FAM, cellHTML.toString(), o.cells || {}])
  // the parts every picture shares — the top rows (no "Viewing as", D1173; no stage chips, D1177), Balances, the
  // magnifiers, the tints, Required P 24, Management, the events — drawn one way (full-r7-one.mjs). Every picture of
  // this part comes before he opens My leave (r7-20) or Approvals (r7-14), so "● 3 new" stands on both.
  await oneStage(p, { phone, member, mlNew: true, apNew: true, fig: o.fig })
  await p.waitForTimeout(300)
  return { ctx, p, phone, member }
}

// Q6 (recommended: a member never bids on a day before today): for a member the days before Thu 8 Jan read closed — the
// quiet dim of a day not open — and the open outline starts at today (one rule answers "is this day open" — B2)
async function pastClosed(p) {
  await p.evaluate(() => {
    const ds = ['01', '02', '03', '04', '05', '06', '07'].map(d => '2026-01-' + d)
    for (const d of ds) {
      document.querySelector(`[data-testid="head-${d}"]`)?.classList.add('locked')
      document.querySelectorAll(`td[data-testid^="cell-"][data-testid$="-${d}"]`).forEach(td => td.classList.add('locked'))
    }
    const b = document.querySelector('.lw-bidbox'), h1 = document.querySelector('[data-testid="head-2026-01-01"]'), h8 = document.querySelector('[data-testid="head-2026-01-08"]')
    if (b && h1 && h8) { const z = parseFloat(getComputedStyle(h1.closest('table')).zoom) || 1; const dx = (h8.offsetLeft - h1.offsetLeft) * z; b.style.left = (parseFloat(b.style.left) + dx) + 'px'; b.style.width = (parseFloat(b.style.width) - dx) + 'px'; b.dataset.zk = 'box' }
  })
}
// D1177: for everyone the days after 31 Mar are not open — the quiet dim (the app dims them for a member today)
async function aprilClosed(p) {
  await p.evaluate(() => {
    for (const th of document.querySelectorAll('th[data-testid^="head-2026-0"]')) {
      const d = th.dataset.testid.slice(5); if (d < '2026-04-01') continue
      th.classList.add('locked'); document.querySelectorAll(`td[data-testid^="cell-"][data-testid$="-${d}"]`).forEach(td => td.classList.add('locked'))
    }
  })
}
// a person's puck as the grid draws it (seat colour, CAT chip in its colour) — lesson 25
const puckFn = `(id) => {
  const el = document.querySelector('[data-testid="person-' + id + '"]'); if (!el) return id
  const cs = el.querySelector('.cs'), ch = el.querySelector('.catchip'), a = getComputedStyle(cs), b = getComputedStyle(ch)
  return '<span class="zpk"><span class="cs" style="background:' + a.backgroundColor + ';color:' + a.color + '">' + cs.textContent + '</span><i style="background:' + b.backgroundColor + ';color:' + b.color + '">' + ch.textContent + '</i></span>'
}`

// Every mark is a small numbered circle ("1", "Q9") set where it covers nothing (full-r7-one.mjs mk); the words are the
// write-up's. A question drawn with its recommended answer wears "Q<n>".

// ======================= r7-01 — the member on his phone, as he lands =======================
if (want('01')) {
  const { ctx, p } = await setup('phone', 'member')
  await pastClosed(p)
  await gridTo(p, '2026-01-06', 'bane')
  await shot(p, 'r7-01-page-phone-clean')
  await mk(p, '[data-zk="pick"]', '1')
  await mk(p, '[data-zk="ml"]', 'Q9', { prefer: ['n'] })
  await mk(p, '[data-zk="mlnew"]', 'Q1', { off: 1 })
  await mk(p, '[data-zk="open"]', '2')
  await mk(p, '[data-zk="under"]', 'Q7')
  await mk(p, '[data-testid="counts-toggle"]', 'Q9')
  await mk(p, '[data-testid="lw-zoom"]', 'Q12')
  await mk(p, '[data-testid="figures-toggle"]', '3')
  await mk(p, '[data-testid="head-2026-01-08"]', '4', { ring: false, prefer: ['s', 'se'] })
  await mk(p, '[data-testid="head-2026-01-06"]', 'Q6', { ring: false, prefer: ['s', 'sw'] })
  await shot(p, 'r7-01-page-phone')
  // one swipe on: his own leave, and his neighbours', in look F
  await unmk(p)
  // from Thu 22 Jan, so his refused Mon 2 Feb is in view too (Ace's two side by side, Mon 19 Jan, sit below the screen
  // since Management stands first: they are drawn in r7-04)
  await gridTo(p, '2026-01-22', 'bane')
  await mk(p, '[data-testid="cell-pump-2026-01-26"]', '5')
  await mk(p, '[data-testid="cell-bane-2026-01-26"]', '6')
  await mk(p, '[data-testid="cell-nact-2026-01-23"]', '7')
  await mk(p, '[data-testid="cell-pump-2026-01-28"]', '8')
  await mk(p, '[data-testid="cell-bane-2026-02-02"]', '9')
  await shot(p, 'r7-01-page-phone-2')
  await ctx.close()
}

// ======================= r7-02 — the admin on his phone =======================
if (want('02')) {
  const { ctx, p } = await setup('phone', 'admin')
  await gridTo(p, '2026-01-18', 'bane')
  await shot(p, 'r7-02-page-phone-clean')
  await mk(p, '[data-zk="pick"]', '1')
  await mk(p, '[data-zk="appr"]', '2', { prefer: ['nw', 'n'] })
  await mk(p, '[data-zk="apnew"]', 'Q1', { off: 1, prefer: ['s', 'se'] })
  await mk(p, '[data-zk="open"]', '3')
  await mk(p, '[data-zk="ml"]', '4')
  await mk(p, '[data-testid="lw-zoom"]', 'Q12')
  await mk(p, '[data-zk="rn-req-p"]', '5', { off: 1, prefer: ['e'] })
  await mk(p, '[data-testid="fly-name-avail-p"]', '5', { off: 1 })
  await mk(p, '[data-testid="figures-toggle"]', '6')
  await mk(p, '[data-testid="cell-nact-2026-01-23"]', '7')
  await mk(p, '[data-zk="mgmt"] .gname', '8')
  await mk(p, '[data-testid="avail-p-2026-01-27"]', '9', { off: 0 })
  await shot(p, 'r7-02-page-phone')
  await ctx.close()
}

// ======================= r7-03 — the admin at a desktop =======================
if (want('03')) {
  const { ctx, p } = await setup('desk', 'admin')
  await shot(p, 'r7-03-page-desk-clean')
  await mk(p, '[data-zk="pick"]', '1')
  await mk(p, '[data-zk="appr"]', '2', { prefer: ['nw', 'n'] })
  await mk(p, '[data-zk="apnew"]', 'Q1', { off: 1, prefer: ['e'] })
  await mk(p, '[data-zk="open"]', '3')
  await mk(p, '[data-zk="ml"]', '4')
  await mk(p, '[data-zk="rn-req-p"]', '5', { off: 1, prefer: ['e'] })
  await mk(p, '[data-testid="fly-name-avail-w"]', '5', { off: 1 })
  await mk(p, '[data-testid="figures-toggle"]', '6')
  await mk(p, '[data-testid="cell-nact-2026-01-23"]', '7')
  await mk(p, '[data-testid="cell-bane-2026-01-29"]', '7')
  await mk(p, '[data-testid="cell-pump-2026-01-26"]', '8')
  await mk(p, '[data-testid="cell-bane-2026-02-02"]', '9')
  await mk(p, '[data-zk="mgmt"] .gname', '10')
  await mk(p, '[data-testid="avail-p-2026-01-27"]', '11', { off: 0 })
  await shot(p, 'r7-03-page-desk')
  await ctx.close()
}

// ======================= r7-04 — every state of a cell, on one page (the guide's §7) =======================
if (want('04')) {
  const E = (code, st = 'appr', half = '', x = {}) => ({ code, st, half, ...x })
  const td = (es, x = {}) => `<td class="cell${x.dim ? ' dim' : ''}${x.box ? ' box' : ''}"><div class="cb zfc">${es ? cellHTML(es, x.clash) : ''}${x.po ? '<span class="po">PO</span>' : ''}</div></td>`
  const NA = '<td class="cell na"><div class="cb"><span class="dash">–</span></div></td>'
  const KINDS = [
    ['LL', 'local leave', 'bid'], ['OL', 'overseas leave', 'bid'], ['OIL', 'off in lieu', 'bid'], ['CCL', 'other leave: CCL · FCL · PL · CL · EL', 'bid'],
    ['FO', 'a day of OIL credited', 'fo'], ['HO', 'half a day of OIL credited', 'ho'],
    ['CSE', 'course', 'inp'], ['OD', 'overseas duty', 'inp'], ['C', 'medical: B · C · OML · HL', 'med'],
  ]
  const kindRows = KINDS.map(([c, w, k]) => {
    const R = { raptor: true }
    const cells = k === 'bid' ? [td([E(c)]), td([E(c, 'wait')]), td([E(c, 'ref')]), td([E(c, 'appr', 'am')]), td([E(c, 'appr', 'pm')]), td([E(c, 'appr', '', R)])]
      : k === 'fo' ? [td([E(c)]), NA, NA, NA, NA, NA]
      : k === 'ho' ? [NA, NA, NA, td([E(c, 'appr', 'am')]), td([E(c, 'appr', 'pm')]), NA]
      : k === 'med' ? [NA, NA, NA, td([E(c, 'appr', 'am', R)]), td([E(c, 'appr', 'pm', R)]), td([E(c, 'appr', '', R)])]
      : [NA, NA, NA, NA, NA, td([E(c, 'appr', '', R)])]
    return `<tr><td class="lab"><b>${c}</b> · ${w}</td>${cells.join('')}</tr>`
  }).join('')
  const COMBO = [
    ['A morning and an afternoon: LL approved, OIL waiting', td([E('LL', 'appr', 'am'), E('OIL', 'wait', 'pm')]), 'mk3'],
    ['Two whole-day entries, side by side: an FO given, an OL refused (Ace, Mon 19 Jan)', td([E('FO'), E('OL', 'ref')]), 'mk4'],
    ['A whole day of leave and an HO in the afternoon', td([E('LL'), E('HO', 'appr', 'pm')])],
    ['A whole day of leave and an HO in the morning', td([E('LL'), E('HO', 'appr', 'am')])],
    ['Leave during a course (from the Inputs page)', td([E('LL'), E('CSE', 'appr', '', { raptor: true })])],
    ['Approved leave moved here from another day', td([E('LL', 'appr', '', { moved: true })])],
    ['Waiting, and something on the day needs an admin', td([E('LL', 'wait')], { clash: true })],
    ['Leave after a posting-out: not counted for manning', td([E('LL')], { po: true })],
    ['A day not open for bidding (the quiet dim)', td(null, { dim: true }), 'mk5'],
    ['A day open for bidding (inside the green outline)', td(null, { box: true }), 'mk5'],
  ]
  const comboRows = COMBO.map(([w, c, m]) => `<tr><td class="lab"${m ? ` data-mk="${m}"` : ''}>${w}</td>${c}</tr>`).join('')
  const PAGE_CSS = LOOKF_CSS + `
:root{color-scheme:dark}body{margin:0;background:#0b0d10;color:#f1f4f7;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.wrap{padding:14px 14px 18px}
h1{font:700 14px/1.3 system-ui;letter-spacing:.06em;text-transform:uppercase;margin:0 0 8px;color:#e6edf3;display:flex;align-items:center;gap:8px}
h1+h1,.gap{margin-top:18px}
table.st{border-collapse:separate;border-spacing:0;background:#11161c;border:1px solid #26303a;border-radius:10px;overflow:hidden}
.st th{font:700 9px/1.2 system-ui;letter-spacing:.06em;color:#8a96a3;text-transform:uppercase;padding:7px 5px;border-bottom:1px solid rgba(70,81,94,.8);text-align:center;vertical-align:bottom}
.st td.lab{font:500 11.5px/1.3 system-ui;color:#c9d1d9;padding:4px 10px;text-align:left;border-bottom:1px solid rgba(70,81,94,.5);max-width:var(--labw)}
.st td.cell{padding:0 6px;border-bottom:1px solid rgba(70,81,94,.5)}
.cb{position:relative;width:27px;height:26.6px;margin:0 auto;background:#0f1318;box-shadow:inset 0 0 0 1px rgba(70,81,94,.8);border-radius:2px}
td.cell.na .cb{background:#0c0f13;box-shadow:none}
td.cell.dim .cb{background:#0a0c0f;opacity:.55}
td.cell.box .cb{box-shadow:inset 0 0 0 2px rgba(74,140,100,.8)}
.dash{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#3b4550;font:600 11px system-ui}
.po{position:absolute;right:-1px;bottom:-1px;z-index:3;font:800 6.5px/1 system-ui;color:#c9d1d9;background:#3a4450;border-radius:3px;padding:1px 2px}
.zoom{zoom:var(--z,1)}
.mk{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;padding:0 6px;border-radius:11px;background:#ff2d95;color:#fff;font:800 12px/1 system-ui;box-shadow:0 0 0 2px #0b0d10}
`
  for (const [name, w, dpr, z, labw] of [['r7-04-cells-phone', 390, 3, 0.8, 200], ['r7-04-cells-desk', 760, 1.25, 1, 330]]) {
    const mk = n => `<span class="mk">${n}</span>`
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${PAGE_CSS}</style></head><body><div class="wrap" style="--labw:${labw}px">
<h1>${mk(1)}${mk(2)} Each kind, each state</h1>
<div class="zoom" style="--z:${z}"><table class="st"><tr><th style="text-align:left;padding-left:10px">Kind</th><th>Approved</th><th>Waiting</th><th>Refused</th><th>AM</th><th>PM</th><th>Inputs<br>page</th></tr>${kindRows}</table></div>
<h1 class="gap">${mk(3)}${mk(4)}${mk(5)} Two on a day, and the marks</h1>
<div class="zoom" style="--z:${z}"><table class="st">${comboRows}</table></div>
</div></body></html>`
    const c = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: dpr })
    const pg = await c.newPage(); pg.on('pageerror', e => errs.push(String(e)))
    await pg.setContent(html); await pg.waitForTimeout(300)
    const over = await pg.evaluate(() => [...document.querySelectorAll('.zf')].filter(f => f.querySelector('b').scrollWidth > f.clientWidth + 0.5).map(f => f.textContent))
    console.log(name, 'letters spilling:', JSON.stringify(over), 'page width', await pg.evaluate(() => document.documentElement.scrollWidth))
    await pg.locator('.wrap').screenshot({ path: join(OUT, name + '.png') }); console.log('shot', name)
    await c.close()
  }
}

// ======================= r7-05 / r7-06 — a tap on a date heading: the day panel =======================
async function dayPanel(p, o) {
  await p.evaluate(([o, puckSrc]) => {
    const puck = new Function('return ' + puckSrc)()
    const th = document.querySelector(`[data-testid="head-${o.date}"]`)
    if (th) { th.style.outline = '2px solid #4c8dff'; th.style.outlineOffset = '-2px'; th.dataset.zk = 'head' }
    const box = (code, st, raptor) => `<span class="zkb"><span class="zf whole e-${o.FAM[code]} es-${st}${raptor ? ' raptor' : ''}"><b>${code}</b></span></span>`
    const SW = { appr: 'Approved', wait: 'Waiting', ref: 'Refused' }
    const d = document.createElement('div'); d.className = 'zday'
    // a desktop's day panel docks to the grid card's bottom-right corner, so the column tapped stays in view (A5)
    if (o.dock) { const card = document.querySelector('#page-leavewar .mx-outer').parentElement.getBoundingClientRect(); o.pos = { right: Math.round(innerWidth - card.right + 6) + 'px', width: o.dock + 'px', bottom: '0px' } }
    Object.assign(d.style, o.pos)
    // Available P against Required P 24 (the one demo setup): red under 24, amber under 26 (D1191, D1202)
    const tone = v => { const n = parseFloat(v); return isNaN(n) ? '' : n < 24 ? 'red' : n < 26 ? 'amb' : '' }
    const short = tone(o.av[0])
    d.innerHTML = `<div class="grab"></div><div class="hd"><span class="gr">⠿</span><span class="ar">‹</span><span class="t">${o.title}</span><span class="ar">›</span><span class="x">✕</span></div>`
      + (o.closed ? `<div class="closed" data-zk="closed">Not open for bidding</div>` : '')
      + `<div class="sec">MANNING</div><div class="figs" data-zk="figs"><div class="pair p"><span>${o.names[0]}</span><b>${o.req[0]}</b><span>${o.names[1]}</span><b class="${short}">${o.av[0]}</b></div><div class="pair w"><span>${o.names[2]}</span><b>${o.req[1]}</b><span>${o.names[3]}</span><b>${o.av[1]}</b></div></div>`
      + (short ? '' : `<div class="calm">No manning row is short</div>`)
      + `<div class="sec">AWAY · ${o.away.length}</div><div data-zk="away" style="--pkw:${o.pkw || 104}px">`
      + o.away.map(([id, code, st, dates, raptor]) => `<div class="ln">${puck(id)}${box(code, st, raptor)}<span class="d">${dates}</span><span class="s${st === 'wait' ? ' w' : ''}">${SW[st]}</span></div>`).join('') + `</div>`
    document.body.appendChild(d)
  }, [o, puckFn])
  await p.waitForTimeout(250)
}
if (want('05')) {
  const { ctx, p } = await setup('phone', 'member')
  await pastClosed(p)
  await gridTo(p, '2026-01-19', 'bane')
  // Manning is folded on his phone (Q9), so the day's figures are read from the admin's grid of the same build: 23 and 17;
  // Required P 24 (the one demo setup, invented), so Available P 23 is red — the day the under-manned chip counts
  await dayPanel(p, {
    date: '2026-01-27', title: 'TUE 27 JAN', FAM, req: ['24', '–'], av: ['23', '17'], names: ['Req P', 'Avail P', 'Req W', 'Avail W'],
    pos: { left: '6px', right: '6px', bottom: '0px' },
    away: [['dice', 'LL', 'wait', '27 Jan'], ['shaft', 'LL', 'wait', '27 Jan'], ['pump', 'LL', 'appr', '26 – 28 Jan', 1], ['bane', 'LL', 'wait', '26 – 27 Jan'], ['slipway', 'LL', 'wait', '27 Jan'], ['glass', 'LL', 'wait', '27 Jan']],
  })
  await shot(p, 'r7-05-day-phone-clean')
  await mk(p, '[data-zk="head"]', '1')
  await mk(p, '.zday .hd', '2')
  await mk(p, '[data-zk="figs"]', '3')
  await mk(p, '[data-zk="away"]', '4')
  await shot(p, 'r7-05-day-phone')
  await ctx.close()
}
if (want('06')) {
  // a closed day: Thu 2 Apr, Ranger's approved CCL (invented, as the person window's list has it)
  const { ctx, p } = await setup('desk', 'admin', { cells: { 'cell-bane-2026-04-02': [{ code: 'CCL', st: 'appr', half: '' }] } })
  await aprilClosed(p)
  await gridTo(p, '2026-03-16', 'bane')
  const av = await p.evaluate(() => ['avail-p-2026-04-02', 'avail-w-2026-04-02'].map(t => document.querySelector(`[data-testid="${t}"]`)?.textContent))
  // the CCL lowers Available P by one (D998)
  const avp = String(Number(av[0] || 28) - 1)
  await p.evaluate(v => { const c = document.querySelector('[data-testid="avail-p-2026-04-02"]'); if (c) c.textContent = v }, avp)
  await dayPanel(p, {
    date: '2026-04-02', title: 'THU 2 APR', FAM, req: ['24', '–'], av: [avp, av[1] || '18'], names: ['Required P', 'Available P', 'Required W', 'Available W'], closed: true, pkw: 120,
    dock: 520,
    away: [['bane', 'CCL', 'appr', 'Thu 2 Apr']],
  })
  await shot(p, 'r7-06-day-desk-clean')
  await mk(p, '[data-zk="head"]', '1', { ring: false })
  await mk(p, '[data-zk="closed"]', '2')
  await mk(p, '[data-zk="figs"]', '3')
  await mk(p, '[data-zk="away"]', '4')
  await shot(p, 'r7-06-day-desk')
  await ctx.close()
}

// ======================= r7-07 — the Legend open, look F, Ack gone =======================
if (want('07')) {
  const { ctx, p } = await setup('phone', 'member')
  await pastClosed(p)
  await gridTo(p, '2026-01-18', 'bane')
  await p.evaluate(() => {
    const E = (code, st = 'appr', half = '', x = {}) => ({ code, st, half, ...x })
    const sw = (es, cls = '', clash) => `<span class="zsw ${cls}">${es ? window.__cellHTML(es, clash) : ''}</span>`
    const row = (s, t) => `<div class="leg-row">${s}<span class="leg-t">${t}</span></div>`
    const sec = (t, k) => `<div class="leg-sec"${k ? ` data-zk="${k}"` : ''}>${t}</div>`
    const L = document.createElement('div'); L.className = 'leglist'; L.setAttribute('role', 'dialog')
    const chip = document.querySelector('[data-zk="legend"]').getBoundingClientRect()
    Object.assign(L.style, { left: (innerWidth - 312 - 8) + 'px', top: (chip.bottom + 6) + 'px' })
    const maxH = innerHeight - chip.bottom - 6 - 8
    L.innerHTML = `<div class="umlist-hd">What the grid is telling you</div><div class="leglist-body" style="max-height:${maxH - 34}px">`
      + `<div data-zk="kinds">` + sec('The colour: what kind')
      + row(sw([E('LL')]), 'Local leave') + row(sw([E('OL')]), 'Overseas leave') + row(sw([E('OIL')]), 'Off in lieu (OIL; FO a day credited, HO half a day)')
      + row(sw([E('CCL')]), 'Other leave: CCL, FCL, PL, CL, EL') + row(sw([E('CSE')]), 'Course') + row(sw([E('OD')]), 'Overseas duty') + row(sw([E('C')]), 'Medical: B, C, OML, HL') + `</div>`
      + `<div data-zk="fill">` + sec('The fill: where it stands')
      + row(sw([E('LL')]), 'Approved') + row(sw([E('LL', 'wait')]), 'Waiting for a decision') + row(sw([E('LL', 'ref')]), 'Refused') + `</div>`
      + `<div data-zk="size">` + sec('The size: how much of the day')
      + row(sw([E('LL')]), 'A whole day') + row(sw([E('LL', 'appr', 'am')]), 'Morning (AM)') + row(sw([E('LL', 'appr', 'pm')]), 'Afternoon (PM)') + row(sw([E('FO'), E('OL', 'ref')]), 'Two entries on one day') + `</div>`
      + `<div data-zk="dates">` + sec('The dates')
      + row(sw(null, 'box'), 'Open for bidding') + row(sw(null, 'dim'), 'Not open for bidding') + `</div>`
      + sec('The left edge: where it came from')
      + row(sw([E('LL', 'appr', '', { raptor: true })]), 'Filed on the Inputs page: change it there, not here') + row(sw([E('LL', 'appr', '', { moved: true })]), 'Moved here from another day')
      + sec('The corner')
      + row(sw([E('LL', 'wait')], '', true), 'Something on this day needs an admin: tap to see')
      + `<div class="leg-sec">The balances: the colours</div><div class="leg-row"><span class="leg-sw plain figw">26</span><span class="leg-t">white: balance left</span></div>`
      + `</div>`
    document.querySelector('#page-leavewar').appendChild(L)
    const sc = document.createElement('div'); sc.className = 'umscrim'; document.querySelector('#page-leavewar').appendChild(sc)
  })
  await p.waitForTimeout(300)
  const fit = await p.evaluate(() => { const r = document.querySelector('.leglist').getBoundingClientRect(); return [r.top, r.bottom, innerHeight] })
  console.log('legend box', fit)
  await shot(p, 'r7-07-legend-phone-clean')
  const legMarks = async () => {
    for (const [k, n] of [['kinds', '1'], ['fill', '2'], ['size', '3'], ['dates', '4']]) {
      const vis = await p.evaluate(k => { const e = document.querySelector(`[data-zk="${k}"]`), b = document.querySelector('.leglist-body').getBoundingClientRect(), r = e.getBoundingClientRect(); return r.top >= b.top - 2 && r.bottom <= b.bottom + 2 }, k)
      if (vis) await mk(p, `[data-zk="${k}"]`, n, { off: -1, prefer: ['in'] })
    }
  }
  await legMarks()
  await shot(p, 'r7-07-legend-phone')
  // the Legend is taller than his phone: its body scrolls inside the window — r7-07b is the same window scrolled to its end
  await unmk(p)
  await p.evaluate(() => { const b = document.querySelector('.leglist-body'); b.scrollTop = b.scrollHeight })
  await p.waitForTimeout(250)
  await shot(p, 'r7-07b-legend-phone-clean')
  await legMarks()
  await shot(p, 'r7-07b-legend-phone')
  await ctx.close()
}

// ======================= r7-08 / r7-09 — a member taps a day not open for bidding =======================
async function closedTap(name, o) {
  const { ctx, p } = await setup('phone', 'member', o.setup || {})
  await gridTo(p, '2026-03-26', 'bane')
  // the real bid window, opened on his row, then lettered for the closed day (today a tap on a closed day opens nothing)
  await p.tap(q('cell-bane-2026-03-31')); await p.waitForTimeout(600)
  await p.evaluate(([html]) => {
    const d = [...document.querySelectorAll('.bidsheet')].filter(e => e.getBoundingClientRect().width).pop(); if (!d) return
    d.innerHTML = html; d.classList.add('zz-new')
    // the ring of the day tapped: the app's one just-tapped look, moved to Wed 1 Apr
    document.querySelectorAll('#page-leavewar td').forEach(td => { if (td.dataset.testid === 'cell-bane-2026-03-31') { td.className = td.className.replace(/\b(sel|armed|picked|on|tapped)\b/g, '') } })
    const c = document.querySelector('[data-testid="cell-bane-2026-04-01"]'); c.style.outline = '2px solid #4c8dff'; c.style.outlineOffset = '-2px'; c.dataset.zk = 'cell'
  }, [o.html])
  // his balance beside his name moves with the invented bid (D1153: a bid takes its leave off at once), in every copy
  if (o.bal) await p.evaluate(([v, u]) => document.querySelectorAll('[data-testid="bal-bane"], td.bal[data-person="bane"], td.bal[title^="Ranger:"]').forEach(c => { if (!c.querySelector('.fb')) return; c.querySelector('.fb').textContent = v; const b = c.querySelector('.fu b'); if (b) b.textContent = u }), o.bal)
  await p.waitForTimeout(300)
  await shot(p, name + '-clean')
  for (const [sel, n, mo] of o.marks) await mk(p, sel, n, sel === '[data-zk="cell"]' ? { ring: false } : (mo || {}))
  await shot(p, name)
  await ctx.close()
}
const HD = (who, dt) => `<div class="bidsheet-hd"><span class="who">${who}</span><span class="dt">${dt}</span><button class="x" aria-label="Close">✕</button></div>`
if (want('08')) {
  await closedTap('r7-08-closed-phone', {
    html: HD('Ranger', 'Wed 1 Apr') + `<div class="zz-note" data-zk="note">Bidding is closed. To change your leave, seek management's approval, then file it on the Inputs page. Your approved leave updates here by itself.</div>`
      + `<div style="display:flex;justify-content:flex-end;margin:6px 4px 4px"><button class="pchip" data-zk="go">Open the Inputs page</button></div>`,
    marks: [['[data-zk="cell"]', '1'], ['[data-zk="note"]', '2'], ['[data-zk="go"]', '3']],
  })
}
if (want('09')) {
  const bid = cellHTML([{ code: 'LL', st: 'wait', half: '' }])
  await closedTap('r7-09-closed-bid-phone', {
    setup: { cells: { 'cell-bane-2026-04-01': [{ code: 'LL', st: 'wait', half: '' }] }, fig: { lve: '13.5', waiting: 3 } }, bal: ['13.5', '6.5'],
    html: HD('Ranger', 'Wed 1 Apr')
      + `<div class="bidsheet-row"><span class="lab">Your bid</span><span class="zz-bidln" data-zk="bid"><span class="zkb">${bid}</span>Whole day<span class="s">· waiting</span></span></div>`
      + `<div class="zz-note" data-zk="note">Your bid waits for a decision. Delete it if you no longer want it.</div>`
      + `<div class="bidsheet-row"><span class="lab">Selected</span><button class="dchip del" data-zk="del">Delete</button><button class="pchip" data-zk="doc" style="display:inline-flex;align-items:center;gap:6px">${UP} Document</button></div>`,
    marks: [['[data-zk="cell"]', '1'], ['[data-zk="bid"] .zkb', '2'], ['[data-zk="note"]', 'Q5'], ['[data-zk="del"]', 'Q5'], ['[data-zk="doc"]', '3']],
  })
}

await browser.close(); console.log('errors:', errs)
