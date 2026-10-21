// The final set (D1206, night of 21-22 Oct 26), part 1: the Leave War PAGE as it will be built, and what a tap on a date
// opens. Drawn INTO THE REAL LOCAL BUILD on the staged squadron (clock Thu 8 Jan 26; <LWMOCK_OUT>/out/state.json, copied
// from the person helper's scratch). Every ruling D1141-D1207 in, the red team's fixes (design note §10.2) in, each open
// question of §10.3 drawn with its recommended answer and marked "Q<n> — your answer first". Nothing here is built.
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r7-page.mjs        (R7_ONLY=01,05 for a few)
// Pictures: r7-01 member phone (lands, and one swipe on) · r7-02 admin phone · r7-03 admin desktop · r7-04 every state of
// a cell · r7-05 / r7-06 the day panel · r7-07 the Legend · r7-08 / r7-09 a member's tap on a day not open.
// Invented for the pictures (said in the write-up): Ranger's approved CCL on Thu 2 Apr (as the person window's list has
// it), and in r7-09 his waiting LL on Wed 1 Apr (a bid placed while April was open, the dates since closed).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, mark, unmark, q, errs, OUT, gridTo } from './full-lib.mjs'
const ONLY = (process.env.R7_ONLY || '').split(',').filter(Boolean)
const want = n => !ONLY.length || ONLY.includes(n)
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))

const CHEV = '<svg viewBox="0 0 12 8" width="1em" height=".7em" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="#57c97a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const DOT = '<i class="zd" aria-hidden="true"></i>'
const UP = '<svg viewBox="0 0 16 16" width="1.05em" height="1.05em" aria-hidden="true"><path d="M8 11V2.5M4.5 6L8 2.5 11.5 6M2.5 10.5v2.2c0 .5.4.8.8.8h9.4c.4 0 .8-.3.8-.8v-2.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const MAG = sign => `<svg viewBox="0 0 18 18" width="15" height="15" aria-hidden="true"><circle cx="7.5" cy="7.5" r="5.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M11.4 11.4 16 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M5 7.5h5${sign === '+' ? 'M7.5 5v5' : ''}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`

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
/* the overhauled top (round 4 / round 6 drawings), the app's own sizes */
#page-leavewar .zrow{display:flex;align-items:center;gap:8px;width:100%;white-space:nowrap}
.zsp{flex:1}
.zlab{font:600 11px system-ui;letter-spacing:.14em;color:#8a96a3}
.zchip{display:inline-flex;align-items:center;gap:6px;height:var(--ch);padding:0 10px;border-radius:7px;border:1px solid #2a323c;background:#12161b;color:#e6edf3;font:600 var(--fs) system-ui;white-space:nowrap}
.zchip b{font-weight:700;color:#fff}
.zchip .n{font-style:normal;font:700 calc(var(--fs) - 1px) system-ui;color:#5fd0e6;background:#16303b;border-radius:9px;padding:1px 7px}
.zchip.pick{border-color:rgba(87,201,122,.55);background:#0f1d15;font-weight:700;height:28px;font-size:var(--pf)}
.zchip.sq{width:28px;height:28px;justify-content:center;padding:0;font-size:18px;font-weight:400;color:#c9d1d9}
.zchip.open{border-color:rgba(87,201,122,.7);background:#0f1d15}.zchip.open b{color:#8FE0A8}
.zml{display:flex;align-items:center;gap:5px;height:var(--mh);padding:0 12px;border-radius:8px;border:1px solid #2a323c;background:#1a1f26;color:#e6edf3;font:600 var(--fs) system-ui;white-space:nowrap}
.zml b{font-weight:800}.zml .zlab{margin-right:4px}
.zrow>.zml:only-child{flex:1}
.zrow3{display:flex;align-items:center;padding:6px 10px;border-bottom:1px solid #2a313a}
.zd{display:inline-block;flex:none;width:7px;height:7px;border-radius:50%;background:#3bc6e8;font-style:normal}
.znw{display:inline-flex;align-items:center;gap:4px;color:#5fd0e6;font:700 var(--fs) system-ui}
.zchip .znw{margin-left:2px;font-size:calc(var(--fs) - 1px)}
/* Q9: "My leave" in the right half of a member's first line, two short lines */
.zml2{flex:1;min-width:0;display:flex;align-items:center;gap:6px;height:36px;padding:0 8px 0 10px;border-radius:8px;border:1px solid #2a323c;background:#1a1f26;color:#e6edf3;font-family:system-ui}
.zml2 .st{display:flex;flex-direction:column;justify-content:center;gap:3px;min-width:0;flex:1}
.zml2 .a{display:flex;align-items:center;gap:6px;font:700 9px/1 system-ui;letter-spacing:.12em;color:#8a96a3}
.zml2 .a .znw{font:700 9.5px/1 system-ui;letter-spacing:0;gap:3px;margin-left:auto}
.zml2 .a .zd{width:6px;height:6px}
.zml2 .b{font:600 11.5px/1 system-ui;white-space:nowrap}
.zml2 .a .nx{letter-spacing:0;font:600 10px/1 system-ui;color:#c9d1d9;margin-left:-2px}
.zml2 .b b{font-weight:800}
.zml2 .chev{color:#9aa5b1;font:600 13px system-ui}
/* Balances as a button (D1185, lesson 27) — the look of "Manning" */
#page-leavewar .figbar.zz-btn{display:inline-flex;align-items:center;gap:5px;border:1px solid #39424D;border-radius:7px;padding:3px 9px;background:#12161b;color:#e6edf3;font:700 11.5px/1.2 system-ui;letter-spacing:.02em;text-transform:none}
/* the Required / Available pairs tinted (D1194, lesson 30): pilots olive, WSOs green */
#page-leavewar .mx tr.zz-tp > td, #page-leavewar tr.zz-tp > td.fr{background-image:linear-gradient(rgba(150,140,50,.15),rgba(150,140,50,.15))!important}
#page-leavewar .mx tr.zz-tw > td, #page-leavewar tr.zz-tw > td.fr{background-image:linear-gradient(rgba(40,160,110,.15),rgba(40,160,110,.15))!important}
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
.zday .pair b.red{color:#ff8a8a}
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

// the top, overhauled — phone: View · picker · (admin + · Approvals) / open · under · Legend / My leave
function topPhone(o) {
  const ml1 = o.member
    ? `<span class="zml2" data-zk="ml"><span class="st"><span class="a">MY LEAVE<span class="nx">· ${o.next}</span>${o.mlNew ? `<span class="znw" data-zk="mlnew">${DOT}${o.mlNew} new</span>` : ''}</span><span class="b"><b>LVE ${o.lve}</b> · OIL ${o.oil} · ${o.waiting} waiting</span></span><span class="chev">›</span></span>` : ''
  const r1 = `<div class="zrow"><span class="zlab" data-zk="viewlab">VIEW</span><span class="zchip pick" data-zk="pick">JAN - DEC 26 ${CHEV}</span>${o.member ? ml1 : `<span class="zchip sq">+</span><span class="zchip" data-zk="appr">Approvals <i class="n">15</i><span class="znw" data-zk="apnew">${DOT}3 new</span></span><span class="zsp"></span>`}</div>`
  const r2 = `<div class="zrow"><span class="zchip open" data-zk="open"><span>Open</span><b>1 Jan – 31 Mar</b></span><span class="zchip">Under <b>0</b> days</span><span class="zsp"></span><span class="zchip" data-zk="legend">Legend</span></div>`
  const r3 = o.member ? '' : `<div class="zrow"><span class="zml" data-zk="ml"><span class="zlab">MY LEAVE</span><b>LVE ${o.lve}</b> · OIL ${o.oil} · ${o.waiting} waiting · next ${o.next}<span class="zsp"></span>›</span></div>`
  return [r1, r2, r3]
}
function topDesk(o) {
  const r1 = `<div class="zrow"><span class="zlab" data-zk="viewlab">VIEW</span><span class="zchip pick" data-zk="pick">JAN - DEC 26 ${CHEV}</span><span class="zchip">+ New</span><span class="zchip" data-zk="appr">Approvals <i class="n">15</i><span class="znw" data-zk="apnew">${DOT}3 new</span></span></div>`
  const r2 = `<div class="zrow"><span class="zchip open" data-zk="open"><span>Open for bidding</span><b>1 Jan – 31 Mar</b></span><span class="zlab">UNDER-MANNED</span><span class="zchip"><b>0</b> days</span><span class="zchip" data-zk="legend">Legend</span><span class="zsp"></span><span class="zml" data-zk="ml"><span class="zlab">MY LEAVE</span><b>LVE ${o.lve}</b> · OIL ${o.oil} · ${o.waiting} waiting · next ${o.next} ›</span></div>`
  return [r1, r2, '']
}

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
  const fig = member ? { lve: '14.5', oil: '0', waiting: 2, next: phone ? '19 Jan' : '19 Jan' } : { lve: '17', oil: '0', waiting: 0, next: '30 Jan' }
  Object.assign(fig, o.fig || {})
  if (member && phone) fig.next = 'next ' + fig.next
  const rows = phone ? topPhone({ member, mlNew: 3, ...fig }) : topDesk({ member, ...fig })
  // Q9: a member's Manning opens folded (remembered per person) — fold it through the app's own button
  if (member && phone) { await p.tap(q('counts-toggle')); await p.waitForTimeout(400) }
  await p.evaluate(([css, rows, phone, member, EXTRA, FAM, cellSrc, MAGM, MAGP, extraCells]) => {
    window.FAM = FAM; const cellHTML = new Function('return ' + cellSrc)(); window.__cellHTML = cellHTML
    const st = document.createElement('style'); st.id = 'zzcss'; st.textContent = css; document.head.appendChild(st)
    const pg = document.querySelector('#page-leavewar'), top = pg.querySelector('.topbar'), fil = pg.querySelector('.filters')
    pg.style.setProperty('--ch', phone ? '23px' : '32px'); pg.style.setProperty('--fs', phone ? '11.2px' : '13.5px')
    pg.style.setProperty('--pf', phone ? '12.6px' : '13.5px'); pg.style.setProperty('--mh', phone ? '25px' : '34px')
    top.innerHTML = rows[0]; fil.innerHTML = rows[1]
    if (rows[2]) { const r = document.createElement('div'); r.className = 'zrow3'; r.innerHTML = rows[2]; fil.after(r) }
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
    // "Balances" a button (D1185, lesson 27)
    const fb = pg.querySelector('[data-testid="figures-toggle"]')
    if (fb) { fb.classList.add('zz-btn'); fb.textContent = (fb.getAttribute('aria-expanded') === 'true' ? '▾' : '▸') + ' Balances' }
    // Q12: the zoom pair become magnifiers
    const zo = pg.querySelector('[data-testid="lw-zoom-out"]'), zi = pg.querySelector('[data-testid="lw-zoom-in"]')
    if (zo) zo.innerHTML = MAGM; if (zi) zi.innerHTML = MAGP
    // the Required / Available pairs tinted (D1194); Required P / W renamable, drawn as the Available rows' names (D1193, A12)
    for (const [t, c] of [['req-p', 'zz-tp'], ['avail-p', 'zz-tp'], ['req-w', 'zz-tw'], ['avail-w', 'zz-tw']]) pg.querySelector(`[data-testid="fly-row-${t}"]`)?.classList.add(c)
    for (const t of ['req-p', 'req-w']) {
      const w = pg.querySelector(`[data-testid="fly-row-${t}"] td.who`); if (!w || w.querySelector('.flyname')) continue
      const b = document.createElement('button'); b.type = 'button'; b.className = 'flyname'; b.dataset.zk = 'rn-' + t
      while (w.firstChild) b.appendChild(w.firstChild); w.appendChild(b)
    }
    // the "Viewing as" chip has gone with the old top (D1173); the stage chips too (D1177)
  }, [CSS, rows, phone, member, EXTRA, FAM, cellHTML.toString(), MAG('-'), MAG('+'), o.cells || {}])
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

// a pink label placed by hand in a free part of the screen (a question's "your answer first"; the thing it is about
// wears the same "Q<n>" pill) — the same look as full-lib's marks, removed by unmark()
const ftag = (p, text, x, y) => p.evaluate(([text, x, y, PINK]) => {
  const t = document.createElement('div'); t.className = 'zz-tag'; t.textContent = text
  Object.assign(t.style, { position: 'fixed', left: x + 'px', top: y + 'px', background: PINK, color: '#fff', font: '700 13px/1 system-ui,sans-serif', padding: '5px 8px', borderRadius: '6px', boxShadow: '0 0 0 2px #0b0d10', zIndex: 2147483647, whiteSpace: 'nowrap', pointerEvents: 'none' })
  document.body.appendChild(t)
}, [text, x, y, '#ff2d95'])
// a numbered pill pinned by hand to an element's corner (fixed, so a dimmed cell never dims it; the phone grid's zoom is
// read off the table so the pill lands where the cell is drawn)
const pill = (p, sel, text, at = 'tr', ring = true) => p.evaluate(([sel, text, at, ring, PINK]) => {
  const el = document.querySelector(sel); if (!el) return console.warn('PILL MISSED', sel)
  const r = el.getBoundingClientRect()
  if (ring) { el.style.outline = '3px solid ' + PINK; el.style.outlineOffset = '1px'; el.classList.add('zz-marked') }
  const t = document.createElement('div'); t.className = 'zz-tag'; t.textContent = text
  Object.assign(t.style, { position: 'fixed', background: PINK, color: '#fff', font: '800 13px/1 system-ui,sans-serif', padding: '4px 6px', borderRadius: '11px', minWidth: '12px', textAlign: 'center', boxShadow: '0 0 0 2px #0b0d10', zIndex: 2147483647, whiteSpace: 'nowrap', pointerEvents: 'none' })
  document.body.appendChild(t)
  const w = t.offsetWidth
  const x = at === 'tam' ? r.left + 20 : at === 'b' ? r.left - 20 : at === 'r' ? r.right + 4 : at === 'tl' || at === 'bl' ? r.left - 8 : Math.min(innerWidth - w - 3, r.right - w / 2)
  const y = at === 'r' ? r.top + r.height / 2 - 11 : at === 'bl' ? r.bottom - 10 : at === 'ta' || at === 'tam' ? r.top - 26 : at === 'b' ? r.bottom + 14 : r.top - 12
  t.style.left = Math.max(3, x) + 'px'; t.style.top = Math.max(2, y) + 'px'
}, [sel, text, at, ring, '#ff2d95'])
const rowsOverflow = p => p.evaluate(() => [...document.querySelectorAll('#page-leavewar .zrow, .zml2 .b, .zml2 .a')].map(r => r.scrollWidth - r.clientWidth))

// ======================= r7-01 — the member on his phone, as he lands =======================
if (want('01')) {
  const { ctx, p } = await setup('phone', 'member')
  await pastClosed(p)
  await gridTo(p, '2026-01-06', 'bane')
  console.log('r7-01 overflow', await rowsOverflow(p))
  await shot(p, 'r7-01-page-phone-clean')
  await mark(p, '[data-zk="pick"]', '1', { num: true })
  await pill(p, '[data-zk="ml"]', 'Q9', 'tam')
  await pill(p, '[data-zk="mlnew"]', 'Q1', 'ta')
  await mark(p, '[data-zk="open"]', '2', { num: true })
  await mark(p, '[data-testid="counts-toggle"]', 'Q9', { num: true })
  await mark(p, '[data-testid="lw-zoom"]', 'Q12', { num: true })
  await mark(p, '[data-testid="figures-toggle"]', '3', { num: true })
  await pill(p, '[data-testid="head-2026-01-08"]', '4', 'tl', false)
  await pill(p, '[data-testid="head-2026-01-06"]', 'Q6', 'tl', false)
  const y0 = await p.evaluate(() => document.querySelector('[data-testid="person-dice"]').getBoundingClientRect().top)
  for (const [i, t] of ['Q9 — your answer first', 'Q1 — your answer first', 'Q12 — your answer first', 'Q6 — your answer first'].entries()) await ftag(p, t, 112, y0 + 4 + i * 31)
  await shot(p, 'r7-01-page-phone')
  // one swipe on: his own leave, and his neighbours', in look F
  await unmark(p)
  await gridTo(p, '2026-01-18', 'bane')
  await mark(p, '[data-testid="cell-bane-2026-01-19"]', '5', { num: true })
  await mark(p, '[data-testid="cell-bane-2026-01-26"]', '6', { num: true })
  await pill(p, '[data-testid="cell-shaft-2026-01-20"]', '7', 'bl')
  await mark(p, '[data-testid="cell-nact-2026-01-23"]', '7', { num: true })
  await mark(p, '[data-testid="cell-pump-2026-01-28"]', '8', { num: true })
  await mark(p, '[data-testid="cell-bane-2026-02-02"]', '9', { num: true })
  await mark(p, '[data-testid="cell-dj-2026-01-19"]', '7', { num: true })
  await shot(p, 'r7-01-page-phone-2')
  await ctx.close()
}

// ======================= r7-02 — the admin on his phone =======================
if (want('02')) {
  const { ctx, p } = await setup('phone', 'admin')
  await gridTo(p, '2026-01-18', 'bane')
  console.log('r7-02 overflow', await rowsOverflow(p))
  await shot(p, 'r7-02-page-phone-clean')
  await mark(p, '[data-zk="pick"]', '1', { num: true })
  await mark(p, '[data-zk="appr"]', '2', { num: true })
  await pill(p, '[data-zk="apnew"]', 'Q1', 'b')
  await mark(p, '[data-zk="open"]', '3', { num: true })
  await mark(p, '[data-zk="ml"]', '4', { num: true })
  await mark(p, '[data-testid="lw-zoom"]', 'Q12', { num: true })
  await pill(p, '[data-zk="rn-req-p"]', '5', 'r')
  await pill(p, '[data-testid="fly-name-avail-p"]', '5', 'r')
  await mark(p, '[data-testid="figures-toggle"]', '6', { num: true })
  await mark(p, '[data-testid="cell-dj-2026-01-19"]', '7', { num: true })
  const y0 = await p.evaluate(() => document.querySelector('[data-testid="person-slash"]').getBoundingClientRect().top)
  for (const [i, t] of ['Q1 — your answer first', 'Q12 — your answer first'].entries()) await ftag(p, t, 112, y0 + 4 + i * 31)
  await shot(p, 'r7-02-page-phone')
  await ctx.close()
}

// ======================= r7-03 — the admin at a desktop =======================
if (want('03')) {
  const { ctx, p } = await setup('desk', 'admin')
  console.log('r7-03 overflow', await rowsOverflow(p))
  await shot(p, 'r7-03-page-desk-clean')
  await mark(p, '[data-zk="pick"]', '1', { num: true })
  await mark(p, '[data-zk="appr"]', '2', { num: true })
  await mark(p, '[data-zk="apnew"]', 'Q1 — your answer first', { right: true })
  await mark(p, '[data-zk="open"]', '3', { num: true })
  await mark(p, '[data-zk="ml"]', '4', { num: true })
  await mark(p, '[data-testid="lw-zoom"]', 'Q12 — your answer first', { right: true })
  await pill(p, '[data-zk="rn-req-p"]', '5', 'r')
  await pill(p, '[data-testid="fly-name-avail-w"]', '5', 'r')
  await mark(p, '[data-testid="figures-toggle"]', '6', { num: true })
  await mark(p, '[data-testid="cell-nact-2026-01-23"]', '7', { num: true })
  await mark(p, '[data-testid="cell-bane-2026-01-29"]', '7', { num: true })
  await mark(p, '[data-testid="cell-pump-2026-01-26"]', '8', { num: true })
  await mark(p, '[data-testid="cell-bane-2026-02-02"]', '9', { num: true })
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
    Object.assign(d.style, o.pos)
    d.innerHTML = `<div class="grab"></div><div class="hd"><span class="gr">⠿</span><span class="ar">‹</span><span class="t">${o.title}</span><span class="ar">›</span><span class="x">✕</span></div>`
      + (o.closed ? `<div class="closed" data-zk="closed">Not open for bidding</div>` : '')
      + `<div class="sec">MANNING</div><div class="figs" data-zk="figs"><div class="pair p"><span>${o.names[0]}</span><b>${o.req[0]}</b><span>${o.names[1]}</span><b>${o.av[0]}</b></div><div class="pair w"><span>${o.names[2]}</span><b>${o.req[1]}</b><span>${o.names[3]}</span><b>${o.av[1]}</b></div></div>`
      + `<div class="calm">No manning row is short</div>`
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
  // Manning is folded on his phone (Q9), so the day's figures are read from the admin's grid of the same build: 23 and 17
  await dayPanel(p, {
    date: '2026-01-27', title: 'TUE 27 JAN', FAM, req: ['–', '–'], av: ['23', '17'], names: ['Req P', 'Avail P', 'Req W', 'Avail W'],
    pos: { left: '6px', right: '6px', bottom: '0px' },
    away: [['dice', 'LL', 'wait', '27 Jan'], ['shaft', 'LL', 'wait', '27 Jan'], ['pump', 'LL', 'appr', '26 – 28 Jan', 1], ['bane', 'LL', 'wait', '26 – 27 Jan'], ['slipway', 'LL', 'wait', '27 Jan'], ['glass', 'LL', 'wait', '27 Jan']],
  })
  await shot(p, 'r7-05-day-phone-clean')
  await mark(p, '[data-zk="head"]', '1', { num: true })
  await mark(p, '.zday .hd', '2', { num: true })
  await mark(p, '[data-zk="figs"]', '3', { num: true })
  await mark(p, '[data-zk="away"]', '4', { num: true })
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
    date: '2026-04-02', title: 'THU 2 APR', FAM, req: ['–', '–'], av: [avp, av[1] || '18'], names: ['Required P', 'Available P', 'Required W', 'Available W'], closed: true, pkw: 120,
    pos: { left: '880px', width: '520px', bottom: '0px' },
    away: [['bane', 'CCL', 'appr', 'Thu 2 Apr']],
  })
  await shot(p, 'r7-06-day-desk-clean')
  await pill(p, '[data-zk="head"]', '1', 'tr', false)
  await mark(p, '[data-zk="closed"]', '2', { num: true })
  await mark(p, '[data-zk="figs"]', '3', { num: true })
  await mark(p, '[data-zk="away"]', '4', { num: true })
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
  await mark(p, '[data-zk="kinds"]', '1', { num: true, off: -1 })
  await mark(p, '[data-zk="fill"]', '2', { num: true, off: -1 })
  await mark(p, '[data-zk="size"]', '3', { num: true, off: -1 })
  await mark(p, '[data-zk="dates"]', '4', { num: true, off: -1 })
  await shot(p, 'r7-07-legend-phone')
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
  for (const [sel, n, mo] of o.marks) await (sel === '[data-zk="cell"]' ? pill(p, sel, n, 'tr', false) : mark(p, sel, n, mo || { num: true }))
  for (const [t, x, y] of o.tags || []) await ftag(p, t, x, y)
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
    tags: [['Q5 — your answer first', 112, 396]],
  })
}

await browser.close(); console.log('errors:', errs)
