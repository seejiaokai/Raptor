// The FINAL SET (D1206, night of 21–22 Oct 26), part 3 of 3: a person's own leave, and the admin's settings, AS THEY
// WILL BE BUILT — every ruling D1141–D1207 in, the red team's fixes (design note §10.2) in, each open question of §10.3
// drawn with its recommended answer and marked "Q<n> — your answer first". Pictures r7-20 … r7-29.
// Drawn INTO the real local build (clock Thu 8 Jan 26, the staged squadron): the top rows are the overhauled ones
// (View · picker · + New / + · Approvals; the open-dates chip · under-manned · Legend · My leave), the cells look F
// (D1175), "Balances" a button (D1185), the Required / Available rows tinted in pairs (D1194) and all four named as
// buttons (D1193). Figures are the app's own (Ranger LVE 14.5 left, LL 5.5 taken of which 2.5 waiting; Anvil −1.5);
// one leave line is invented (Ranger's deleted Mon 9 Feb, for D1199's struck line) and said so.
//   cd raptor-port && LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r7-person.mjs
// Needs <scratch>/out/state.json (the staged squadron). Nothing here is built into the app.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, mark, unmark, q, errs, OUT, gridTo } from './full-lib.mjs'
import { LOCK_SVG, CLIP_SVG } from './full-propose.mjs'
import { H, fill } from './full-win-a-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))

const CHEV = '<svg viewBox="0 0 12 8" width="1em" height=".7em" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="#57c97a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const DOT = '<i class="zd" aria-hidden="true"></i>'
const NODOT = '<i class="zd off" aria-hidden="true"></i>'
const LOCKI = LOCK_SVG.replace('class="zz-lockg"', 'class="r7-lk"')
// the app's one pencil (ui/pen.ts — D1134), as the dense builders print it
const PEN = '<svg class="pen-ic solo" viewBox="0 0 24 24" aria-hidden="true"><g transform="rotate(-45 12 12)" fill="currentColor"><rect x="8.5" y="1" width="7" height="4.6" rx="2.4"/><rect x="8.5" y="6.4" width="7" height="12.2" rx=".3"/><path d="M8.5 19.4h7l-2.6 3.1a1.2 1.2 0 0 1-1.8 0Z"/></g></svg>'
const UP = '<svg viewBox="0 0 16 16" width="1.05em" height="1.05em" aria-hidden="true" style="vertical-align:-.18em;margin-right:5px"><path d="M8 11V2.5M4.5 6L8 2.5 11.5 6M2.5 10.5v2.2c0 .5.4.8.8.8h9.4c.4 0 .8-.3.8-.8v-2.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const DOWN = UP.replace('M8 11V2.5M4.5 6L8 2.5 11.5 6', 'M8 2.5V11M4.5 7.5L8 11l3.5-3.5')

// look F (D1175): [r,g,b of the kind, ink, fill strength]
const KIND = {
  LL: ['242,200,110', '#FFF1CF', .22], OL: ['226,146,38', '#FFE7C7', .48], OIL: ['70,196,108', '#DDF8E6', .38],
  FO: ['70,196,108', '#DDF8E6', .38], HO: ['70,196,108', '#DDF8E6', .38],
  CCL: ['138,150,255', '#DCE0FF', .32], FCL: ['138,150,255', '#DCE0FF', .32], PL: ['138,150,255', '#DCE0FF', .32],
  EL: ['138,150,255', '#DCE0FF', .32], CL: ['138,150,255', '#DCE0FF', .32], CSE: ['184,142,240', '#EEE2FF', .32],
  OD: ['160,170,182', '#E6EBF0', .26], MED: ['236,104,140', '#FFD0DD', .26], C: ['236,104,140', '#FFD0DD', .26],
  B: ['236,104,140', '#FFD0DD', .26], HL: ['236,104,140', '#FFD0DD', .26], OML: ['236,104,140', '#FFD0DD', .26],
}
const kb = (k, st = 'appr', sm) => { const [h, ink, f] = KIND[k]; return `<span class="r7-kb ${st}${sm ? ' sm' : ''}" style="--h:${h};--ink:${ink};--fill:${f}"><b>${k}</b></span>` }

const CSS = `
/* ---- the overhauled top (as full-r6-visit.mjs drew it from round 4) ---- */
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
.zd{display:inline-block;flex:none;width:7px;height:7px;border-radius:50%;background:#3bc6e8;font-style:normal}.zd.off{background:transparent}
.znw{display:inline-flex;align-items:center;gap:4px;color:#5fd0e6;font:700 var(--fs) system-ui}
.zml .znw{margin:0 6px 0 4px}
.zrow3{display:flex;align-items:center;padding:6px 10px;border-bottom:1px solid #2a313a}
/* ---- the grid: look F boxes over the app's own chips (D1175, D1160, D1167) ---- */
#page-leavewar td.r7-f > .c{visibility:hidden}
#page-leavewar td.r7-f > .mk.more{display:none}
.r7-cb{position:absolute;left:2px;right:2px;top:2px;bottom:2px;display:flex;align-items:center;justify-content:center;border-radius:3px;font:800 10px/1 system-ui;letter-spacing:.02em;z-index:2;pointer-events:none;box-sizing:border-box}
.r7-cb.am{bottom:calc(50% + 1px);font-size:7px}.r7-cb.pm{top:calc(50% + 1px);font-size:7px}
.r7-cb.l{right:calc(50% + 1px);font-size:8px}.r7-cb.r{left:calc(50% + 1px);font-size:8px}
.r7-cb.appr{background:rgba(var(--h),var(--fill));color:var(--ink);box-shadow:inset 0 0 0 1px rgba(var(--h),.85)}
.r7-cb.wait{color:rgb(var(--h));outline:1px dashed rgba(var(--h),.95);outline-offset:-1px}
.r7-cb.ref{color:#7d8894;box-shadow:inset 0 0 0 1px #4a5560;text-decoration:line-through}
/* the Required / Available pairs faintly tinted (D1194) — the pilots' olive, the WSOs' green */
#page-leavewar tr.r7-tp > td{box-shadow:inset 0 0 0 999px rgba(120,112,40,.17)}
#page-leavewar tr.r7-tw > td{box-shadow:inset 0 0 0 999px rgba(30,120,84,.17)}
/* "Balances" a button (D1185, lesson 27), the look of "Manning" */
#page-leavewar .figbar.r7-bal{border:1px solid #39424D!important;border-radius:7px;padding:4px 10px!important;margin:4px 6px;width:auto!important;font:700 12px/1.2 system-ui!important;letter-spacing:.02em!important;text-transform:none!important;color:#e6edf3!important;background:#151b22!important}
/* ---- the person window (D1201, D1203, A1) ---- */
.bidsheet .r7-hd{display:flex;align-items:center;gap:8px;margin:10px 2px 6px;font:700 10.5px/1 system-ui,sans-serif;letter-spacing:.12em;color:#8a96a3;text-transform:uppercase;min-height:26px}
.bidsheet .r7-hd .r7-lkt{display:inline-flex;align-items:center;gap:5px;letter-spacing:.02em;text-transform:none;font-weight:600;font-size:12px;color:#8a96a3}
.bidsheet .r7-hd svg.r7-lk{width:11px;height:13px;display:inline-block}
.bidsheet .r7-hd .r7-right{margin-left:auto}
.bidsheet .r7-hd .pchip{font-size:12.5px;padding:4px 10px;letter-spacing:0;text-transform:none}
.bidsheet .r7-hd .znw{--fs:12px;letter-spacing:0;text-transform:none}
.bidsheet .r7-bal{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
.bidsheet .r7-t{background:#151b22;border-radius:8px;padding:6px 7px 7px;min-height:60px;display:flex;flex-direction:column;gap:4px;min-width:0}
.bidsheet .r7-t.w2{grid-column:span 2}
.bidsheet .r7-t.med{background:transparent;box-shadow:inset 0 0 0 1px #26303a}
.bidsheet .r7-t .lb{height:18px;display:flex;align-items:center;font:800 11px/1 system-ui,sans-serif;letter-spacing:.06em;color:#b6c0cb}
.bidsheet .r7-fr{display:flex;align-items:center;gap:6px}
.bidsheet .r7-fig{align-self:flex-start;font:700 19px/1 system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#f1f4f7;padding:3px 6px;margin-left:-6px;border-radius:6px;border:1px solid transparent;min-width:30px;box-sizing:border-box}
.bidsheet .r7-fig.ed{border-color:#39424D;background:#0d1217}
.bidsheet .r7-fig.neg{color:#ff8a8a}
.bidsheet .r7-fig.editing{border:2px solid #3bc6e8;padding:2px 5px;background:#0d1217}
.bidsheet .r7-fig.editing .sel{background:#2a5d8a;color:#fff;border-radius:2px;padding:0 1px}
.bidsheet .r7-fig.editing .caret{display:inline-block;width:2px;height:17px;background:#3bc6e8;vertical-align:-2px;margin-left:1px}
.bidsheet .r7-go{color:#5fd0e6;font:700 16px/1 system-ui;margin-left:-2px}
.bidsheet .r7-used{display:flex;align-items:center;gap:4px;font:600 11px/1.1 system-ui;color:#8a96a3;font-variant-numeric:tabular-nums;white-space:nowrap;min-height:14px}
.bidsheet .r7-note{grid-column:1/-1;margin:-1px 0 1px;padding:6px 8px;border-radius:7px;background:rgba(59,198,232,.08);box-shadow:inset 0 0 0 1px rgba(59,198,232,.35);font:600 12px/1.2 system-ui;color:#c9d1d9}
.bidsheet .r7-note b{color:#fff;font-variant-numeric:tabular-nums}
.r7-kb{display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:18px;padding:0 4px;box-sizing:border-box;border-radius:4px;font:800 10px/1 system-ui;letter-spacing:.02em}
.r7-kb.sm{min-width:20px;height:14px;font-size:8.5px;padding:0 3px;border-radius:3px}
.r7-kb.appr{background:rgba(var(--h),var(--fill));color:var(--ink);box-shadow:inset 0 0 0 1px rgba(var(--h),.85)}
.r7-kb.wait{background:transparent;color:rgb(var(--h));outline:1px dashed rgba(var(--h),.95);outline-offset:-1px}
.r7-kb.ref,.r7-kb.gone{background:transparent;color:#7d8894;box-shadow:inset 0 0 0 1px #4a5560}
.r7-kb.ref b,.r7-kb.gone b{text-decoration:line-through}
.bidsheet .r7-list{margin:0 0 2px}
.bidsheet .r7-ln{display:grid;grid-template-columns:7px 36px minmax(0,1fr) 26px 66px 12px;align-items:center;column-gap:8px;row-gap:3px;padding:7px 2px;border-top:1px solid #222a33;font:600 13.5px/1.2 system-ui;color:#e6edf3}
.bidsheet .r7-ln .d{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bidsheet .r7-ln .n{text-align:right;font-variant-numeric:tabular-nums;color:#c9d1d9}
.bidsheet .r7-ln .s{font-size:12.5px;font-weight:600}
.bidsheet .r7-ln .s.appr{color:#b6c0cb}.bidsheet .r7-ln .s.wait{color:#f1f4f7}.bidsheet .r7-ln .s.ref,.bidsheet .r7-ln .s.gone{color:#8a96a3}
.bidsheet .r7-ln .clip{color:#8a96a3;display:flex}
.bidsheet .r7-ln .w{grid-column:3/-1;font:500 11.5px/1.2 system-ui;color:#8a96a3;margin-top:-1px}
.bidsheet .r7-ln.del .d{text-decoration:line-through;color:#8a96a3}
.bidsheet .r7-hdr{display:grid;grid-template-columns:7px 36px minmax(0,1fr) 26px 66px 12px;column-gap:8px;padding:0 2px 5px;font:700 9px/1 system-ui;letter-spacing:.12em;color:#6b7785}
.bidsheet .r7-hdr .n{text-align:right}
/* a desktop window docked to the grid's right edge (fix A5) */
.bidsheet.r7-dock{border-radius:12px!important}
/* the phone's number keys (the iPhone's own, drawn plain) */
.r7-kbd{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#1c1d21;border-top:1px solid #2c2e33;font-family:-apple-system,system-ui,sans-serif}
.r7-kbd .acc{display:flex;justify-content:flex-end;align-items:center;height:42px;padding:0 16px;background:#232428;border-bottom:1px solid #2f3136;color:#5aa9ff;font:600 16px system-ui}
.r7-kbd .keys{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:7px 6px 30px}
.r7-kbd .k{height:46px;border-radius:6px;background:#5b5c62;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font:400 24px/1 system-ui}
.r7-kbd .k small{font:600 9px/1 system-ui;letter-spacing:.14em;margin-top:2px}
.r7-kbd .k.f{background:transparent}
/* ---- Settings (D1205, from full-r6-settings.mjs) ---- */
.bidsheet .zz-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:7px 2px;border-top:1px solid rgba(42,49,58,.55)}
.bidsheet .zz-row:first-of-type{border-top:none}
.bidsheet .zz-row .lab{flex:none;width:86px;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3)}
.bidsheet .zz-row .ctl{display:flex;flex-wrap:wrap;gap:7px;flex:1;min-width:0}
.bidsheet .zz-step{display:inline-flex;align-items:center;gap:0}
.bidsheet .zz-step .rtbtn{min-width:30px;text-align:center;font-size:13px;line-height:1;padding:5px 7px}
.bidsheet .zz-step .n{min-width:26px;text-align:center;font:700 13px system-ui;color:var(--ink);font-variant-numeric:tabular-nums}
.bidsheet .zz-step .rtbtn:disabled{opacity:.4}
.bidsheet .rtbtn .pen-ic{width:.95em;height:.95em;margin-left:5px;opacity:.75;vertical-align:-.12em}
.bidsheet .rtbtn svg.r7-lk{display:inline-block;width:10px;height:12px;margin:0 6px -1px 0;vertical-align:baseline}
.bidsheet .set-gct.zz-ct{min-width:38px;text-align:center;background:var(--panel-2);border:1px solid var(--edge-2);border-radius:7px;padding:3px 7px;color:var(--ink-2);font-family:inherit;cursor:pointer}
.bidsheet .set-gct.zz-plain{min-width:38px;text-align:center}
.bidsheet .zz-gdel-gap{width:22px;flex:none}
.bidsheet .zz-foot{display:flex;align-items:center;gap:8px;padding:10px 2px 2px;border-top:1px solid rgba(42,49,58,.55);margin-top:8px}
.bidsheet .zz-foot .st{font-size:10.5px;color:var(--ink-3)}
.bidsheet .zz-foot .sp{flex:1}
.bidsheet .zz-foot .rtbtn:disabled{opacity:.45}
.bidsheet .set-disc.zz-fold{border-color:var(--edge-2)}
.bidsheet .set-disc.zz-fold .cv{color:var(--ink-2)}
.bidsheet .set-gname:not(.on){color:var(--ink)!important}
.bidsheet .zz-else .set-gname{color:var(--ink-3)!important}
.bidsheet .zz-add{padding:0 2px 4px}
.bidsheet .gs-sec.zz-gh{display:flex;align-items:center}
.bidsheet .gs-sec.zz-gh .rtbtn{margin-left:auto;letter-spacing:0;text-transform:none;font-size:12px;padding:4px 9px}
@media (max-width:500px){.bidsheet .zz-row .lab{width:70px}}
/* ---- the row windows: amber and red points (D1190, D1191, D1202) ---- */
.r7-pt{display:inline-flex;align-items:center;gap:9px;font:500 14px system-ui;color:#c9d1d9}
.r7-pt i{width:8px;height:8px;border-radius:50%}
.r7-pt .num{display:inline-flex;align-items:center;justify-content:center;min-width:52px;height:30px;padding:0 8px;border-radius:6px;border:1px solid #39424D;background:#0d1217;color:#fff;font:700 14px system-ui;font-variant-numeric:tabular-nums}
.r7-wnote{font:500 12.5px/1.45 system-ui;color:#c9d1d9;margin:2px 2px 8px}
#page-leavewar td.r7-amb{color:#F2B84B!important;box-shadow:inset 0 0 0 999px rgba(242,184,75,.16)!important}
#page-leavewar td.r7-red{color:#FF7A82!important;box-shadow:inset 0 0 0 999px rgba(240,85,95,.2)!important}
/* ---- the events list (D1155) ---- */
.r7-ev{display:grid;grid-template-columns:170px 1fr 130px 44px;gap:10px;align-items:center;padding:9px 4px;border-top:1px solid #26303a;font:600 14px system-ui;color:#e6edf3}
.r7-ev .k{font:500 12.5px system-ui;color:#8a96a3}
.r7-ev .t{justify-self:start;display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:20px;padding:0 5px;border-radius:4px;color:#c9d1d9;box-shadow:inset 0 0 0 1px #3a4552;font:800 10.5px system-ui}
.r7-evh{display:grid;grid-template-columns:170px 1fr 130px 44px;gap:10px;padding:6px 4px 6px;font:700 9.5px system-ui;letter-spacing:.12em;color:#6b7785}
`

// ===== the top rows, as they will be (the brief's §"as it will be") =====
function topRows(phone, s) {
  const ap = s.admin ? `<span class="zchip" data-zk="appr">Approvals <i class="n">15</i></span>` : ''
  const ml = `<span class="zml" data-zk="ml"><span class="zlab">MY LEAVE</span><b>LVE ${s.lve}</b> · OIL ${s.oil} · ${s.waiting} waiting · next ${s.next}${phone ? '<span class="zsp"></span>' : ''}${s.mlNew ? `<span class="znw">${DOT}${s.mlNew} new</span>` : ''} ›</span>`
  if (phone) return [
    `<div class="zrow"><span class="zlab">VIEW</span><span class="zchip pick">JAN - DEC 26 ${CHEV}</span>${s.admin ? '<span class="zchip sq">+</span>' : ''}${ap}<span class="zsp"></span></div>`,
    `<div class="zrow"><span class="zchip open"><span>Open</span><b>1 Jan – 31 Mar</b></span><span class="zchip">Under <b>0</b> days</span><span class="zsp"></span><span class="zchip">Legend</span></div>`,
    `<div class="zrow">${ml}</div>`]
  return [
    `<div class="zrow"><span class="zlab">VIEW</span><span class="zchip pick">JAN - DEC 26 ${CHEV}</span><span class="zchip">+ New</span>${ap}</div>`,
    `<div class="zrow"><span class="zchip open"><span>Open for bidding</span><b>1 Jan – 31 Mar</b></span><span class="zlab">UNDER-MANNED</span><span class="zchip"><b>0</b> days</span><span class="zchip">Legend</span><span class="zsp"></span>${ml}</div>`]
}
const ME = { member: { lve: '14.5', oil: '0', waiting: '2', next: '19 Jan' }, admin: { lve: '17', oil: '0', waiting: '0', next: '30 Jan', admin: true } }

async function stage(p, phone, s) {
  await p.evaluate(([css, rows, phone]) => {
    if (!document.getElementById('r7css')) { const st = document.createElement('style'); st.id = 'r7css'; st.textContent = css; document.head.appendChild(st) }
    const pg = document.querySelector('#page-leavewar'), top = pg.querySelector('.topbar'), fil = pg.querySelector('.filters')
    pg.style.setProperty('--ch', phone ? '23px' : '32px'); pg.style.setProperty('--fs', phone ? '11.2px' : '13.5px')
    pg.style.setProperty('--pf', phone ? '12.6px' : '13.5px'); pg.style.setProperty('--mh', phone ? '25px' : '34px')
    top.innerHTML = rows[0]; fil.innerHTML = rows[1]
    pg.querySelector('.zrow3')?.remove()
    if (rows[2]) { const r = document.createElement('div'); r.className = 'zrow3'; r.innerHTML = rows[2]; fil.after(r) }
  }, [CSS, topRows(phone, s), phone])
  await p.waitForTimeout(250)
}

// the grid as it will be: look F cells, "Balances" a button, the pairs tinted, all four rows named as buttons
async function gridAsBuilt(p) {
  await p.evaluate(KIND => {
    for (const td of document.querySelectorAll('#page-leavewar td[data-testid^="cell-"]')) {
      const chips = [...td.querySelectorAll(':scope > .c')]; if (!chips.length) continue
      const es = chips.map(c => ({ code: c.textContent.replace(/[<>*]/g, '').replace(/\+\d+$/, '').trim(), cls: c.className })).filter(e => KIND[e.code])
      if (!es.length) continue
      td.classList.add('r7-f'); if (getComputedStyle(td).position === 'static') td.style.position = 'relative'
      td.querySelectorAll('.r7-cb').forEach(n => n.remove())
      const mk = (e, pos) => {
        const [h, ink, f] = KIND[e.code]; const st = /\bappr\b/.test(e.cls) ? 'appr' : /\bref\b/.test(e.cls) ? 'ref' : 'wait'
        const b = document.createElement('span'); b.className = `r7-cb ${st} ${pos}`; b.style.cssText = `--h:${h};--ink:${ink};--fill:${f}`; b.textContent = e.code; td.appendChild(b)
      }
      if (es.length === 1) mk(es[0], /\bam\b/.test(es[0].cls) ? 'am' : /\bpm\b/.test(es[0].cls) ? 'pm' : '')
      else { mk(es[0], /\bam\b/.test(es[0].cls) ? 'am' : 'l'); mk(es[1], /\bpm\b/.test(es[1].cls) ? 'pm' : 'r') }
    }
    for (const [id, c] of [['req-p', 'r7-tp'], ['avail-p', 'r7-tp'], ['req-w', 'r7-tw'], ['avail-w', 'r7-tw']]) document.querySelector(`[data-testid="fly-row-${id}"]`)?.classList.add(c)
    for (const id of ['req-p', 'req-w']) {
      const who = document.querySelector(`[data-testid="fly-row-${id}"] td.who`)
      if (who && !who.querySelector('button')) who.innerHTML = `<button type="button" class="flyname" data-zk="name-${id}">${who.innerHTML}</button>`
    }
    const fb = document.querySelector('[data-testid="figures-toggle"]')
    if (fb) { fb.classList.add('r7-bal'); fb.textContent = fb.getAttribute('aria-expanded') === 'true' ? '▾ Balances' : '▸ Balances' }
  }, KIND)
}
async function foldBalances(p) {
  if (await p.locator(q('figures-toggle')).count() && await p.locator(q('figures-toggle')).getAttribute('aria-expanded') === 'true') { await p.click(q('figures-toggle')); await p.waitForTimeout(400) }
}

// ===== the person window =====
function tile(lab, fig, used, o = {}) {
  const cls = ['r7-fig', o.ed ? 'ed' : '', o.editing ? 'editing' : '', String(fig).startsWith('−') ? 'neg' : ''].filter(Boolean).join(' ')
  const f = o.editing ? `<span class="sel">${o.editing}</span><span class="caret"></span>` : fig
  return `<div class="r7-t${o.w2 ? ' w2' : ''}${o.med ? ' med' : ''}${o.cls ? ' ' + o.cls : ''}"><span class="lb">${lab}</span><span class="r7-fr"><span class="${cls}">${f}</span>${o.go ? '<span class="r7-go">›</span>' : ''}</span><span class="r7-used">${used}</span></div>`
}
// the app's own figures (bal-… cells, the person sheet): Ranger 14.5 left, LL 5.5 taken (3 approved, 2.5 waiting); Anvil
// −1.5 (½ approved, 1 waiting); every other balance 0. EL is the seventh balance D1201 names, not yet a column today.
const FIG = {
  bane: { name: 'Ranger', LVE: ['14.5', `${kb('LL', 'appr', 1)} 3 used · 2½ waiting`], official: '17', waiting: 2, after: '14.5' },
  shaft: { name: 'Anvil', LVE: ['−1.5', `${kb('LL', 'appr', 1)} ½ used · 1 waiting`] },
}
function balances(id, o) {
  const F = FIG[id]
  const z = k => tile(kb(k), '0', '', { ed: o.edit })
  return `<div class="r7-bal zz-balgrid">` +
    tile('LVE', F.LVE[0], F.LVE[1], { w2: true, ed: o.edit, editing: o.editing && F.official, cls: 'zz-lve' }) +
    tile(kb('OIL'), '0', '', { cls: 'zz-oil', go: true }) + z('CCL') + z('FCL') +
    (o.editing ? `<div class="r7-note zz-note">left after your ${F.waiting} waiting: <b>${F.after}</b></div>` : '') +
    z('PL') + z('EL') + z('CL') +
    tile(kb('MED'), '0', 'days', { w2: true, med: true, cls: 'zz-med' }) + `</div>`
}
// one line a request: [kind, state, dates, days, state word, {nw: new since his last visit, w: who and when, clip}]
const LEAVE = {
  bane: [
    ['LL', 'appr', 'Mon 19 – Wed 21 Jan', '3', 'appr', { nw: 1, w: 'approved by Saber · 08:40', clip: 1, k: 'n1' }],
    ['LL', 'wait', 'Mon 26 – Tue 27 Jan', '2', 'wait', {}],
    ['LL', 'wait', 'Thu 29 Jan, AM', '½', 'wait', {}],
    ['LL', 'ref', 'Mon 2 Feb', '1', 'ref', { nw: 1, w: 'refused by Saber · 08:40' }],
    ['LL', 'gone', 'Mon 9 Feb', '1', 'gone', { nw: 1, w: 'deleted by Saber · yesterday', k: 'del' }], // invented (D1199's struck line)
  ],
  shaft: [
    ['LL', 'appr', 'Tue 20 Jan, AM', '½', 'appr', {}],
    ['LL', 'wait', 'Tue 27 Jan', '1', 'wait', {}],
  ],
}
const SW = { appr: 'Approved', wait: 'Waiting', ref: 'Refused', gone: 'Deleted' }
const list = (id, o) => `<div class="r7-hdr"><span></span><span>KIND</span><span>DATES</span><span class="n">DAYS</span><span></span><span></span></div><div class="r7-list zz-list">` +
  LEAVE[id].map(([k, st, d, n, s, x]) => {
    const nw = o.visit && x.nw
    return `<div class="r7-ln${st === 'gone' ? ' del' : ''}"${x.k ? ` data-zk="${x.k}"` : ''}>${nw ? DOT : NODOT}${kb(k, st)}<span class="d">${d}</span><span class="n">${n}</span><span class="s ${s}">${SW[s]}</span><span class="clip">${x.clip ? CLIP_SVG : ''}</span>${nw ? `<span class="w">${x.w}</span>` : ''}</div>`
  }).filter((_, i) => o.visit || LEAVE[id][i][1] !== 'gone').join('') + `</div>`
function personHTML(id, o = {}) {
  return H.hd(FIG[id].name, '') +
    `<div class="r7-hd zz-balhd"><span>Balances</span>${o.locked ? `<span class="r7-lkt zz-lk">${LOCKI}Locked</span>` : ''}</div>` +
    balances(id, o) +
    `<div class="r7-hd zz-yr"><span>Leave</span>${o.visit ? `<span class="znw zz-new3">${DOT}3 new</span>` : ''}<button class="pchip on r7-right zz-year">2026 and ahead ▾</button></div>` +
    list(id, o)
}
async function openPerson(p, touch, id, html) {
  await (touch ? p.tap(q('person-' + id)) : p.click(q('person-' + id))); await p.waitForTimeout(500)
  await fill(p, html)
  await p.waitForTimeout(150)
}
// phone: the window from the foot, as tall as what is in it; desktop: docked to the grid card's right edge (A5)
async function placePhone(p, bottom = 0) {
  await p.evaluate(bottom => {
    const d = [...document.querySelectorAll('.bidsheet')].filter(e => e.getBoundingClientRect().width).pop()
    Object.assign(d.style, { left: '12px', right: '12px', width: 'auto', maxWidth: 'none', top: 'auto', bottom: bottom + 'px', height: 'auto', maxHeight: (innerHeight - bottom - 24) + 'px', transform: 'none', overflow: 'auto' })
  }, bottom)
}
async function dock(p, w = 560) {
  await p.evaluate(w => {
    const d = [...document.querySelectorAll('.bidsheet')].filter(e => e.getBoundingClientRect().width).pop()
    const card = document.querySelector('#page-leavewar .mx-outer').parentElement.getBoundingClientRect()
    const top = Math.max(card.top, 0) + 6
    Object.assign(d.style, { left: 'auto', right: (innerWidth - card.right + 6) + 'px', top: top + 'px', bottom: 'auto', width: w + 'px', maxWidth: w + 'px', height: 'auto', maxHeight: (innerHeight - top - 10) + 'px', transform: 'none', overflow: 'auto', margin: '0' })
    d.classList.add('r7-dock')
  }, w)
}
const out = (name, p, clip) => shot(p, name, clip ? { clip } : {})
// a pink mark: an outline on the element, its tag pinned in the screen's own frame where it covers nothing it names —
// 'num' (a numbered badge on the top-right corner), 'right', 'left', 'below', 'above', 'inright' (inside, at the
// right), 'edge' (right-aligned across the bottom edge); o.leftOf puts the tag left of another element (a window)
async function mk(p, sel, label, pos = 'num', o = {}) {
  const ok = await p.evaluate(([sel, label, pos, o]) => {
    const el = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })[o.nth || 0]
    if (!el) return false
    el.classList.add('zz-marked'); el.style.outline = '3px solid #ff2d95'; el.style.outlineOffset = (o.off ?? 2) + 'px'
    const r = el.getBoundingClientRect(), num = pos === 'num'
    const t = document.createElement('div'); t.className = 'zz-tag'; t.textContent = label
    Object.assign(t.style, { position: 'fixed', zIndex: 2147483647, background: '#ff2d95', color: '#fff', font: `700 ${o.fs || 13}px/1 system-ui,sans-serif`, padding: num ? '4px 6px' : '5px 8px', borderRadius: num ? '11px' : '6px', minWidth: num ? '12px' : '', textAlign: 'center', boxShadow: '0 0 0 2px #0b0d10', whiteSpace: 'nowrap', pointerEvents: 'none' })
    document.body.appendChild(t)
    const w = t.offsetWidth, h = t.offsetHeight
    let x = r.left, y = r.top - h - 6
    if (num) { x = r.right - 12; y = r.top - 10 }
    else if (pos === 'right') { x = r.right + 10; y = r.top + r.height / 2 - h / 2 }
    else if (pos === 'left') { x = r.left - w - 10; y = r.top + r.height / 2 - h / 2 }
    else if (pos === 'below') { y = r.bottom + 6 }
    else if (pos === 'inright') { x = r.right - w - 6; y = r.top + r.height / 2 - h / 2 }
    else if (pos === 'tedge') { x = r.right - w - (o.dx ?? 50); y = r.top - h / 2 }
    else if (pos === 'inbr') { x = r.right - w - 4; y = r.bottom - h - 5 }
    else if (pos === 'edge') { x = r.right - w - 8; y = r.bottom - h / 2 }
    if (o.leftOf) { const a = document.querySelector(o.leftOf).getBoundingClientRect(); x = a.left - w - 10; y = r.top + r.height / 2 - h / 2 }
    x += o.dx2 || 0; y += o.dy || 0
    x = Math.max(2, Math.min(innerWidth - w - 2, x)); y = Math.max(2, Math.min(innerHeight - h - 2, y))
    Object.assign(t.style, { left: x + 'px', top: y + 'px' })
    return true
  }, [sel, label, pos, o])
  if (!ok) console.warn('MARK MISSED:', sel, label)
}

// ---------- r7-20 "My leave": his own window, one window (A1) ----------
{
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'member')
  await stage(p, true, { ...ME.member, mlNew: 3 }); await gridAsBuilt(p)
  await openPerson(p, true, 'bane', personHTML('bane', { edit: true, visit: true })); await placePhone(p)
  await out('r7-20-myleave-phone-clean', p)
  await mk(p, '[data-zk="ml"]', '1')
  await mk(p, '.zz-balgrid', '2')
  await mk(p, '.zz-lve .r7-fig', '3', 'num', { off: 1 })
  await mk(p, '.zz-oil', 'Q4 — your answer first', 'above')
  await mk(p, '.zz-year', '4')
  await mk(p, '[data-zk="n1"]', 'Q1 — your answer first', 'inbr', { fs: 11, dy: 9 })
  await mk(p, '[data-zk="del"]', '5')
  await out('r7-20-myleave-phone', p)
  await ctx.close()
}
// ---------- r7-21 him editing his LVE: the box takes his official figure (Q3), the keys up ----------
{
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'member')
  await stage(p, true, ME.member); await gridAsBuilt(p)
  await openPerson(p, true, 'bane', personHTML('bane', { edit: true, editing: true }))
  await p.evaluate(() => {
    const k = document.createElement('div'); k.className = 'r7-kbd zz-kbd'
    const keys = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['.', '', 'f'], ['0', ''], ['⌫', '', 'f']]
    k.innerHTML = `<div class="acc">Done</div><div class="keys">${keys.map(([a, b, f]) => `<span class="k${f ? ' f' : ''}">${a}${b ? `<small>${b}</small>` : ''}</span>`).join('')}</div>`
    document.body.appendChild(k)
  })
  const kh = await p.evaluate(() => document.querySelector('.zz-kbd').getBoundingClientRect().height)
  await placePhone(p, Math.round(kh))
  await out('r7-21-myleave-edit-phone-clean', p)
  await mk(p, '.zz-lve .r7-fig', '1', 'num', { off: 3 })
  await mk(p, '.zz-note', 'Q3 — your answer first', 'inright')
  await mk(p, '.zz-oil', '2')
  await mk(p, '.zz-kbd .acc', '3', 'num', { off: -3 })
  await out('r7-21-myleave-edit-phone', p)
  await ctx.close()
}
// ---------- r7-22 the admin opening Ranger's window at a desktop, docked; locked balances still editable ----------
{
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await foldBalances(p)
  await stage(p, false, ME.admin); await gridAsBuilt(p)
  await gridTo(p, '2026-01-12', 'bane')
  await openPerson(p, false, 'bane', personHTML('bane', { edit: true, locked: true })); await dock(p)
  await p.mouse.move(2, 2)
  await out('r7-22-person-admin-desk-clean', p)
  await mk(p, '.bidsheet-hd', '1 docked to the grid’s right edge, still draggable (fix A5)', 'left', { leftOf: '.r7-dock' })
  await mk(p, '.zz-lk', '2 locked for members · Q2 — your answer first', 'left', { leftOf: '.r7-dock' })
  await mk(p, '.zz-lve .r7-fig', '3 the admin still edits, locked or not (D1203)', 'left', { leftOf: '.r7-dock', off: 1 })
  await mk(p, '[data-testid="cell-bane-2026-01-19"]', '4 his dates stay in view beside it', 'below')
  await out('r7-22-person-admin-desk', p)
  await ctx.close()
}
// ---------- r7-23 a member opening another man's window: read only (balances locked) ----------
{
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'member')
  await stage(p, true, ME.member); await gridAsBuilt(p)
  await openPerson(p, true, 'shaft', personHTML('shaft', { locked: true })); await placePhone(p)
  await out('r7-23-person-other-phone-clean', p)
  await mk(p, '.zz-lk', 'Q2 — your answer first', 'right')
  await mk(p, '.zz-balgrid', '1')
  await mk(p, '.zz-list', '2')
  await out('r7-23-person-other-phone', p)
  await ctx.close()
}

// ---------- r7-24 / r7-25 the Settings window (D1205 with the red team's changes) ----------
async function settings(touch) {
  const [w, h] = touch ? [390, 1240] : [1536, 860]
  const { ctx, p } = await newPage(browser, w, h, touch, state); await signIn(p, 'admin')
  if (!touch) await foldBalances(p)
  await stage(p, touch, ME.admin); await gridAsBuilt(p)
  const sxo = await p.evaluate(() => {
    let g = '', o = []
    for (const tr of document.querySelectorAll('tr[data-testid]')) { const t = tr.dataset.testid; if (t.startsWith('group-')) g = t.slice(6); else if (t.startsWith('row-') && g === 'SXO') o.push(tr.querySelector('.cs')?.textContent.trim()) }
    return o
  })
  await (touch ? p.tap(q('settings-open')) : p.click(q('settings-open'))); await p.waitForTimeout(600)
  await p.evaluate(([LOCK, PEN, mgmt, phone]) => {
    const s = document.querySelector('[data-testid="settings-sheet"]')
    const hd = s.querySelector('.bidsheet-hd'); hd.querySelector('.dt')?.remove()
    const ct = {}; for (const r of s.querySelectorAll('[data-testid^="grow-"]')) ct[r.dataset.testid.slice(5)] = +r.querySelector('.set-gct').textContent
    ct.SXO -= mgmt.length
    const offer = [...s.querySelectorAll('[data-testid^="gadd-"]')].map(b => b.textContent.trim())
    const row = (lab, ctl, cls = '') => `<div class="zz-row ${cls}"><span class="lab">${lab}</span><span class="ctl">${ctl}</span></div>`
    const grow = (id, name, kind, n, sw, o = {}) => `<div class="set-grow ${o.cls || ''}">` +
      (o.nogrip ? '<span class="set-grip off"></span>' : '<span class="set-grip">⠿</span>') + sw +
      `<button class="set-gname">${name}</button>` + (kind ? `<span class="set-gkd">${kind}</span>` : '') +
      (o.plain ? `<span class="set-gct zz-plain">${n}</span>` : `<button class="set-gct zz-ct" data-zz="ct-${id}">${n} ▾</button>`) +
      (o.nodel ? '<span class="zz-gdel-gap"></span>' : '<button class="set-gdel">✕</button>') + '</div>'
    const sw = c => `<span class="set-sw g-${c}"></span>`
    const names = phone ? ['Req P', 'Req W', 'Avail P', 'Avail W'] : ['Required P', 'Required W', 'Available P', 'Available W']
    const html = `<div class="zz-new zz-rows">` +
      row('Year', '<button class="rtbtn" data-zz="cal">Calendar…</button><button class="rtbtn" data-zz="ev">Events…</button>', 'zz-r1') +
      row('Manning', names.map((t, i) => `<button class="rtbtn" data-zz="mr${i}">${t}${PEN}</button>`).join('') + '<button class="rtbtn" data-zz="ctr">＋ Counter</button>', 'zz-r2') +
      row('Event rows', '<span class="zz-step" data-zz="evr"><button class="rtbtn" disabled aria-label="One event row fewer">−</button><span class="n">2</span><button class="rtbtn" aria-label="One event row more">＋</button></span>', 'zz-r3') +
      row('Balances', `<button class="rtbtn on" data-zz="lock" aria-pressed="true" style="text-transform:none;letter-spacing:0">${LOCK}Lock balances</button>`, 'zz-r4') +
      `</div>` +
      `<div class="gs-sec zz-gh" data-zz="gh">Groups<button class="rtbtn" data-zz="rearr">⇅ Rearrange</button></div>` +
      `<div class="set-grows">` +
      grow('mg', 'Management', 'qual', mgmt.length, '<button class="set-sw set-swbtn" style="background:#4FA3E0" aria-label="Pick a colour for Management"></button>', { cls: 'zz-mg' }) +
      grow('SXO', 'SXO', 'cat', ct.SXO, sw('sxo')) + grow('IP', 'IP', 'cat', ct.IP, sw('ip')) + grow('OPSP', 'OPS P', 'cat', ct.OPSP, sw('opsp')) +
      grow('IWSO', 'IWSO', 'cat', ct.IWSO, sw('iwso')) + grow('OPSW', 'OPS W', 'cat', ct.OPSW, sw('opsw')) + grow('OCU', 'OCU', 'cat', ct.OCU, sw('ocu')) +
      grow('PERS', 'Personnel', 'cat', ct.PERS, sw('pers')) +
      grow('OTHER', 'Everyone else', '', 0, '<span class="set-sw"></span>', { cls: 'zz-else', nogrip: true, nodel: true, plain: true }) +
      `</div>` +
      `<div class="gs-sec zz-addh">Add a group</div><div class="gs-chips zz-add">` + ['+ SANS', ...offer].map((t, i) => `<button class="tchip"${i === 0 ? ' data-zz="sans"' : ''}>${t}</button>`).join('') + `</div>` +
      `<button class="set-disc zz-fold" data-zz="who"><span class="cv">▸</span><span class="dl">Who wins when someone fits two</span><span class="dh">follows the page</span></button>` +
      `<div class="zz-foot" data-zz="foot"><button class="rtbtn set-order" disabled>↺ Reset order</button><span class="st">In default order</span><span class="sp"></span><button class="creset">Back to the standard groups</button></div>`
    ;[...s.children].forEach(c => { if (c !== hd) c.remove() })
    hd.insertAdjacentHTML('afterend', html)
  }, [LOCKI, PEN, sxo.slice(0, 2), touch])
  await p.waitForTimeout(250)
  if (!touch) await p.evaluate(() => {
    const s = document.querySelector('[data-testid="settings-sheet"]'); const r = s.getBoundingClientRect()
    s.style.width = '680px'; s.style.maxWidth = '680px'; s.style.left = Math.round(r.left + r.width / 2 - 340) + 'px'; s.style.right = 'auto'; s.style.transform = 'none'
  })
  if (touch) await p.evaluate(() => {
    const s = document.querySelector('[data-testid="settings-sheet"]'); s.style.maxHeight = (innerHeight - 24) + 'px'; s.style.height = 'auto'; s.style.bottom = 'auto'
    const hgt = s.getBoundingClientRect().height; s.style.top = Math.max(12, Math.round((innerHeight - hgt) / 2)) + 'px'
  })
  await p.waitForTimeout(200)
  const fit = await p.evaluate(() => { const s = document.querySelector('[data-testid="settings-sheet"]'); return [Math.round(s.getBoundingClientRect().top), Math.round(s.getBoundingClientRect().height), s.scrollHeight, s.clientHeight, innerHeight] })
  console.log(touch ? 'phone' : 'desk', 'settings top, height, content, box, screen:', fit)
  const name = `r7-${touch ? '24-settings-phone' : '25-settings-desk'}`
  await out(name + '-clean', p)
  const M = [
    ['[data-zz="ev"]', '1'], ['[data-zz="mr0"]', '2'], ['[data-zz="evr"]', '3'],
    ['[data-zz="rearr"]', '5'], ['.zz-mg', '6'], ['[data-zz="ct-SXO"]', '7'], ['.zz-else', '8'],
    ['[data-zz="who"]', '9'], ['[data-zz="foot"]', '10'],
  ]
  for (const [sel, n] of M) await mk(p, sel, n)
  // the other three names carry the same mark (2), outlined only
  await p.evaluate(() => { for (const i of [1, 2, 3]) { const e = document.querySelector(`[data-zz="mr${i}"]`); e.classList.add('zz-marked'); e.style.outline = '3px solid #ff2d95'; e.style.outlineOffset = '2px' } })
  await mk(p, '[data-zz="lock"]', 'Q2 — your answer first', 'right')
  await mk(p, '.zz-addh', '4')
  await mk(p, '[data-zz="sans"]', 'Q10 — your answer first', 'inright', { off: 2 })
  // the Q10 tag stands at the right of the "Add a group" heading's row, over nothing
  await p.evaluate(() => { const t = [...document.querySelectorAll('.zz-tag')].pop(), h = document.querySelector('.zz-addh').getBoundingClientRect(); t.style.top = (h.top + h.height / 2 - t.offsetHeight / 2 + 2) + 'px'; t.style.left = (h.right - t.offsetWidth - 34) + 'px' })
  await out(name, p)
  await ctx.close()
}
await settings(true); await settings(false)

// ---------- r7-26 the Available P row's own window: its name, its amber and red points ----------
{
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await foldBalances(p)
  await stage(p, false, ME.admin); await gridAsBuilt(p)
  // a Required P figure typed on 19–23 and 29 Jan (invented, to show the points at work): 27 needed against 28
  // available is amber at "+ 2" (one to spare); 29 needed against 28 is red at "+ 0"
  await p.evaluate(() => {
    const set = (d, v) => { const r = document.querySelector(`[data-testid="req-p-${d}"]`); if (r) { r.textContent = v; r.classList.remove('none') } }
    // amber under Required + 2, red under Required + 0 (the window's two points below)
    const judge = (d, req) => { set(d, String(req)); const a = document.querySelector(`[data-testid="avail-p-${d}"]`); if (!a) return; const v = +a.textContent; if (v < req) a.classList.add('r7-red'); else if (v < req + 2) a.classList.add('r7-amb') }
    for (const d of ['19', '20', '21', '22', '23']) judge('2026-01-' + d, 25)
    judge('2026-01-29', 29)
  })
  await gridTo(p, '2026-01-12', 'bane')
  await p.click(q('fly-name-avail-p')); await p.waitForTimeout(500)
  await p.evaluate(() => {
    const d = [...document.querySelectorAll('.bidsheet,[role=dialog]')].filter(e => e.getBoundingClientRect().width).pop()
    d.classList.add('zz-availwin')
    const note = [...d.querySelectorAll('*')].find(e => !e.children.length && /SANS people are never counted/.test(e.textContent))
    const row = (lab, html, k) => `<div class="bidsheet-row zz-pt" data-zk="${k}"><span class="lab">${lab}</span><span class="r7-pt">${html}</span></div>`
    const block = document.createElement('div')
    block.innerHTML = row('Amber', '<i style="background:#F2B84B"></i>when under Required<span class="num">+ 2</span>', 'amb') + row('Red', '<i style="background:#FF6B73"></i>when under Required<span class="num">+ 0</span>', 'red')
    const anchor = note ? (note.closest('.bidsheet-row') || note) : null
    if (anchor) { anchor.before(...block.children) }
    if (note) { const n = document.createElement('div'); n.className = 'r7-wnote'; n.style.font = getComputedStyle(note).font; n.style.color = getComputedStyle(note).color; n.textContent = 'The SANS calendar: still needed = Required P − Available P − the SANS who offer to fly.'; note.after(n) }
    const nameRow = [...d.querySelectorAll('.bidsheet-row, label, div')].find(e => /^NAME/i.test(e.textContent.trim()) && e.querySelector('input')); nameRow?.setAttribute('data-zk', 'name')
  })
  await p.waitForTimeout(200)
  const box = await p.evaluate(() => { const r = document.querySelector('.zz-availwin').getBoundingClientRect(); return [r.x, r.y, r.width, r.height] })
  console.log('avail window', box)
  await p.mouse.move(2, 2)
  await out('r7-26-availp-desk-clean', p)
  await mk(p, '[data-zk="name"]', '1 its name (D1193)', 'right')
  await mk(p, '[data-zk="amb"]', '2 amber: Required plus or minus a number (D1190, D1191)', 'right')
  await mk(p, '[data-zk="red"]', '3 red, set the same way, + 0 by default (D1202)', 'right')
  await mk(p, '[data-testid="avail-p-2026-01-19"]', '4 the row at work: amber, then red', 'below', { off: 1, dx2: 190, dy: 24 })
  await out('r7-26-availp-desk', p)
  await ctx.close()
}
// ---------- r7-27 the Required P row's window: its name only ----------
{
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await foldBalances(p)
  await stage(p, false, ME.admin); await gridAsBuilt(p)
  await gridTo(p, '2026-01-12', 'bane')
  // the app's row window (the Available P one opens it) holding only the name, as the Required rows will have it
  await p.click(q('fly-name-avail-p')); await p.waitForTimeout(500)
  const r = await p.evaluate(() => {
    const d = [...document.querySelectorAll('.bidsheet,[role=dialog]')].filter(e => e.getBoundingClientRect().width).pop()
    d.classList.add('zz-reqwin')
    const who = d.querySelector('.bidsheet-hd .who'); if (who) who.textContent = 'Required P'
    d.querySelector('.bidsheet-hd .dt')?.remove()
    const kids = [...d.children]
    const nameEl = kids.find(e => /^NAME/i.test(e.textContent.trim()) && e.querySelector('input'))
    const foot = kids.find(e => /Save/.test(e.textContent) && /Cancel/.test(e.textContent) && !/NAME/.test(e.textContent))
    for (const k of kids) if (k !== nameEl && k !== foot && !k.classList.contains('bidsheet-hd')) k.remove()
    const inp = nameEl?.querySelector('input'); if (inp) { inp.value = 'Required P'; inp.setAttribute('value', 'Required P') }
    nameEl?.setAttribute('data-zk', 'name')
    // it opens from the row's name, where the Available rows' window opens from theirs
    const rr = document.querySelector('[data-testid="fly-row-req-p"]').getBoundingClientRect()
    Object.assign(d.style, { top: (rr.bottom + 8) + 'px', left: '230px', bottom: 'auto', transform: 'none', width: '560px', height: 'auto', maxHeight: 'none', minHeight: '0', overflow: 'visible' })
    return [!!nameEl, !!foot]
  })
  console.log('req window name/foot found', r)
  await p.mouse.move(2, 2)
  await out('r7-27-reqp-desk-clean', p)
  await mk(p, '[data-zk="name-req-p"]', '1 the row’s name opens its window (D1193)', 'right', { off: 1 })
  await mk(p, '.zz-reqwin [data-zk="name"]', '2 its name only; the figures stay typed in the cells', 'right')
  await out('r7-27-reqp-desk', p)
  await ctx.close()
}

// ---------- r7-28 the bell on a member's phone, with the Leave War's lines (D1142, D769) ----------
{
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'member')
  await stage(p, true, ME.member); await gridAsBuilt(p)
  await p.tap('.bellbtn'); await p.waitForTimeout(500)
  await p.evaluate(() => {
    const list = document.querySelector('.bell-list'); if (!list) return
    list.querySelector('.bl-empty')?.remove()
    const line = (unread, name, day, what, ago, k) => `<button type="button" class="bl-line${unread ? ' unread' : ''}"${k ? ` data-zk="${k}"` : ''}><span class="bl-dot"></span><span class="bl-main"><span class="bl-t"><b class="bl-name">${name}</b><i class="bl-day">${day}</i></span><span class="bl-what">${what}</span></span><span class="bl-ago">${ago}</span></button>`
    list.insertAdjacentHTML('afterbegin',
      line(1, 'Leave War', '1 Apr – 30 Jun', 'Bidding open · Saber', '5m', 'open') +
      line(1, 'Your leave', 'Tue 10 – Wed 11 Feb', 'Approval of LL taken back · Saber', '1h', 'back') +
      line(0, 'Your leave', 'Mon 19 – Wed 21 Jan', 'LL approved · Saber', '1d', 'ok') +
      line(0, 'Your leave', 'Mon 2 Feb', 'LL refused · Saber', '1d') +
      line(0, 'Your leave', 'Mon 9 Feb', 'LL deleted · Saber', '2d') +
      line(0, 'Your leave', 'Thu 12 Mar', 'LL moved to Thu 19 Mar · Saber', '3d') +
      line(0, 'Your leave', 'Mon 23 Feb', 'LL bid replaced by a course · Hex', '4d'))
    if (!list.querySelector('.bl-foot')) list.insertAdjacentHTML('beforeend', '<div class="bl-foot"><button type="button" class="abtn sm ghost">Mark all read</button></div>')
    document.querySelector('.bellbtn')?.classList.add('on')
    list.classList.add('zz-bell')
  })
  await p.waitForTimeout(200)
  await out('r7-28-bell-phone-clean', p)
  await mk(p, '[data-zk="open"]', 'Q8 — your answer first', 'tedge', { off: -2, fs: 11 })
  await mk(p, '[data-zk="back"]', 'Q11 — your answer first', 'tedge', { off: -2, fs: 11 })
  await mk(p, '[data-zk="ok"]', '1', 'num', { off: -2 })
  await out('r7-28-bell-phone', p)
  await ctx.close()
}

// ---------- r7-29 the events list on the war (D1155), and the Calendar window's Holidays list with Export / Import ----------
{
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await foldBalances(p)
  await stage(p, false, ME.admin); await gridAsBuilt(p)
  const EVENTS = [
    ['Thu 1 Jan', "New Year's Day", 'Public holiday', 'PH'], ['Fri 23 Jan', 'Sqn sports day', 'Sports', 'SP'], ['Mon 9 – Fri 13 Feb', 'EX SAMPLE SHIELD', 'Exercise', 'EX', 'multi'],
    ['Tue 17 – Wed 18 Feb', 'Chinese New Year', 'Public holiday', 'PH'], ['Fri 3 Apr', 'Good Friday', 'Public holiday', 'PH'], ['Sun 9 Aug', 'National Day', 'Public holiday', 'PH'],
    ['Fri 25 Dec', 'Christmas Day', 'Public holiday', 'PH'],
  ]
  await p.click(q('person-bane')); await p.waitForTimeout(500)
  await fill(p, H.hd('Events', '') +
    H.row('Show', ['All', 'Public holidays', 'Exercises', 'Other'].map((t, i) => `<button class="pchip${i === 0 ? ' on' : ''}">${t}</button>`).join('') + '<button class="rtbtn" data-zk="add" style="margin-left:auto">＋ Event</button>', 'zz-evf') +
    `<div class="r7-evh"><span>DATES</span><span>EVENT</span><span>KIND</span><span>ROW</span></div>` +
    `<div class="zz-evl">` + EVENTS.map(([d, n, k, s, m]) => `<div class="r7-ev"${m ? ' data-zk="multi"' : ''}><span style="color:#c9d1d9">${d}</span><span>${n}</span><span class="k">${k}</span><span class="t">${s}</span></div>`).join('') + `</div>`)
  await p.evaluate(() => { const d = [...document.querySelectorAll('.bidsheet')].filter(e => e.getBoundingClientRect().width).pop(); Object.assign(d.style, { width: '760px', maxWidth: '760px', left: 'calc(50% - 380px)', right: 'auto', top: '200px', bottom: 'auto', transform: 'none', height: 'auto' }) })
  await p.mouse.move(2, 2); await p.waitForTimeout(200)
  await out('r7-29-events-desk-clean', p)
  await mk(p, '.zz-evl', '1 the squadron’s events, each with its kind (D1155)', 'right')
  await mk(p, '[data-zk="multi"]', '2 several days allowed', 'left', { leftOf: '.zz-new', off: -2 })
  await mk(p, '[data-zk="add"]', '3 the one way to add', 'right')
  await out('r7-29-events-desk', p)
  await unmark(p); await p.keyboard.press('Escape'); await p.waitForTimeout(400)
  // the Calendar window's Holidays list: Export and Import beside + Add (D1155)
  await p.click(q('settings-open')); await p.waitForTimeout(400)
  await p.locator('button:has-text("Calendar…")').first().click(); await p.waitForTimeout(900)
  const ok = await p.evaluate(([UP, DOWN]) => {
    const line = [...document.querySelectorAll('*')].find(e => !e.children.length && /Public holidays and Off days/.test(e.textContent)); if (!line) return 'no line'
    const today = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Today')
    const row = document.createElement('div'); row.className = 'zz-new zz-iorow'; row.style.cssText = 'display:flex;gap:8px;margin:8px 0 12px'
    for (const [t, ic] of [['Export the year', DOWN], ['Import a sheet', UP]]) { const n = today.cloneNode(true); n.innerHTML = ic + t; n.classList.add('zz-io'); row.appendChild(n) }
    // at the foot of the Holidays column, under its list (the list's own box keeps its place)
    const last = [...document.querySelectorAll('*')].find(e => !e.children.length && /^Fri 25 Dec$/.test(e.textContent.trim()))
    let col = line.parentElement; while (col && last && !col.contains(last)) col = col.parentElement
    ;(col || line.parentElement).appendChild(row); return col ? 'ok' : 'fallback'
  }, [UP, DOWN])
  console.log('holidays row', ok)
  await p.mouse.move(2, 2); await p.waitForTimeout(200)
  await out('r7-29-holidays-desk-clean', p)
  await mk(p, '.zz-iorow', '4 holidays by file (D1155)', 'below')
  await out('r7-29-holidays-desk', p)
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
