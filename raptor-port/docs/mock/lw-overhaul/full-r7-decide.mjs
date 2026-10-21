// The final set (D1206, night of 21-22 Oct 26) — placing leave and deciding it, every window AS IT WILL BE BUILT:
//   r7-10 the member's bid window (phone) · r7-11 the admin's, "Approve what I enter" ticked (desktop) · r7-12 the
//   admin's, unticked (phone) · r7-13 an entry already placed (desktop) · r7-14 Approvals docked on "New 3" (desktop) ·
//   r7-15 its "Approve 15 — tap again" · r7-16 Approvals on a phone · r7-17 / 17b the "Open for bidding" window on a
//   phone (a drag across months; nothing open) · r7-18 the same on a desktop · r7-19 the clash note's reworded line.
// Drawn INTO the real local build (the clock Thu 8 Jan 26, the demo squadron staged by state.json): the top rows, the
// cells (look F) and the Balances button as the rest of the final set draws them; each window's content redrawn with
// the app's own window pieces. Every figure is the app's own, except where a comment says it is invented.
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r7-decide.mjs   (needs <scratch>/out/state.json)
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, mark, q, errs, OUT, gridTo } from './full-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))

// ---------------------------------------------------------------- shared pieces
const CHEV = '<svg viewBox="0 0 12 8" width="1em" height=".7em" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="#57c97a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const DOT = '<i class="zd" aria-hidden="true"></i>'
const UP = '<svg viewBox="0 0 16 16" width="1.05em" height="1.05em" aria-hidden="true"><path d="M8 11V2.5M4.5 6L8 2.5 11.5 6M2.5 10.5v2.2c0 .5.4.8.8.8h9.4c.4 0 .8-.3.8-.8v-2.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const CLIP = '<svg viewBox="0 0 16 16" width="1.2em" height="1.2em" aria-hidden="true"><path d="M10.5 4.5l-5 5a1.6 1.6 0 0 0 2.3 2.3l5.6-5.6a2.9 2.9 0 0 0-4.1-4.1L3.7 7.7a4.2 4.2 0 0 0 5.9 5.9l4.4-4.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
const CAL = '<svg viewBox="0 0 16 16" width="1.15em" height="1.15em" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2 6.5h12M5 1.6v3M11 1.6v3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
const DOCI = '<svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true"><path d="M4 1.8h5.2L12.5 5v9.2H4z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M9 1.8V5.2h3.4" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>'

// look F (D1175): [r,g,b of the kind, ink, fill]
const KF = { LL: ['242,200,110', '#FFF1CF', .22], OL: ['226,146,38', '#FFE7C7', .48], OIL: ['70,196,108', '#DDF8E6', .38],
  CARE: ['138,150,255', '#DCE0FF', .32], CSE: ['184,142,240', '#EEE2FF', .32], OD: ['160,170,182', '#E6EBF0', .26], MED: ['236,104,140', '#FFD0DD', .26] }
const FAM = { LL: 'LL', OL: 'OL', OIL: 'OIL', FO: 'OIL', HO: 'OIL', CCL: 'CARE', FCL: 'CARE', PL: 'CARE', EL: 'CARE', CL: 'CARE', CSE: 'CSE', OD: 'OD', C: 'MED', B: 'MED', OML: 'MED', HL: 'MED' }
const kv = k => { const [h, ink, f] = KF[FAM[k]]; return `--h:${h};--ink:${ink};--f:${f}` }
const kbox = (k, st = 'wt') => `<span class="zkb ${st}" style="${kv(k)}"><b>${k}</b></span>`
const CHIP = { sxo: ['#E5B53B', '#2a1e02'], ins: ['#9F4ADF', '#fff'], c: ['#3BC6E8', '#04222b'], a: ['#CA4750', '#fff'] }
const puck = (cs, seat, cat, chip) => `<span class="zpk ${seat}"><span class="cs">${cs}</span><i style="background:${CHIP[chip][0]};color:${CHIP[chip][1]}">${cat}</i></span>`

const CSS = `
#page-leavewar .zrow{display:flex;align-items:center;gap:8px;width:100%;white-space:nowrap}
.zsp{flex:1}
.zlab{font:600 11px system-ui;letter-spacing:.14em;color:#8a96a3}
.zchip{display:inline-flex;align-items:center;gap:6px;height:var(--ch);padding:0 10px;border-radius:7px;border:1px solid #2a323c;background:#12161b;color:#e6edf3;font:600 var(--fs) system-ui;white-space:nowrap}
.zchip b{font-weight:700;color:#fff}
.zchip .n{font-style:normal;font:700 calc(var(--fs) - 1px) system-ui;color:#5fd0e6;background:#16303b;border-radius:9px;padding:1px 7px}
.zchip.pick{border-color:rgba(87,201,122,.55);background:#0f1d15;font-weight:700;height:28px;font-size:var(--pf)}
.zchip.sq{width:28px;height:28px;justify-content:center;padding:0;font-size:18px;font-weight:400;color:#c9d1d9}
.zchip.open{border-color:rgba(87,201,122,.7);background:#0f1d15}.zchip.open b{color:#8FE0A8}.zchip.open em{font-style:normal;color:#8a96a3;font-weight:600}
.zchip.shut{border-color:#4a5560;color:#c9d1d9}
.zchip .amb{color:#F2C879}
.zml{display:flex;align-items:center;gap:5px;height:var(--mh);padding:0 12px;border-radius:8px;border:1px solid #2a323c;background:#1a1f26;color:#e6edf3;font:600 var(--fs) system-ui;white-space:nowrap}
.zml b{font-weight:800}.zml .zlab{margin-right:4px}
.zrow>.zml:only-child{flex:1}
.zd{display:inline-block;flex:none;width:7px;height:7px;border-radius:50%;background:#3bc6e8;font-style:normal}
.znw{display:inline-flex;align-items:center;gap:4px;color:#5fd0e6;font:700 calc(var(--fs) - 1px) system-ui;margin-left:2px}
.zrow3{display:flex;align-items:center;padding:6px 10px;border-bottom:1px solid #2a313a}
/* look F on the grid (D1175) */
#page-leavewar .zf{position:absolute;left:2px;right:2px;top:2px;bottom:2px;display:flex;align-items:center;justify-content:center;border-radius:4px;z-index:2;pointer-events:none;box-sizing:border-box}
#page-leavewar .zf b{font:700 10px/1 system-ui;letter-spacing:.02em;white-space:nowrap}
#page-leavewar .zf.am{bottom:calc(50% + .5px)}#page-leavewar .zf.pm{top:calc(50% + .5px)}
#page-leavewar .zf.l{right:calc(50% + .5px)}#page-leavewar .zf.r{left:calc(50% + .5px)}
#page-leavewar .zf.am b,#page-leavewar .zf.pm b,#page-leavewar .zf.l b,#page-leavewar .zf.r b{font-size:7.5px}
#page-leavewar .zf.ok{background:rgba(var(--h),var(--f));color:var(--ink);box-shadow:inset 0 0 0 1px rgba(var(--h),.85)}
#page-leavewar .zf.wt{color:rgb(var(--h));outline:1px dashed rgba(var(--h),.95);outline-offset:-1px}
#page-leavewar .zf.rf{color:#7d8894;box-shadow:inset 0 0 0 1px #4a5560}#page-leavewar .zf.rf b{text-decoration:line-through}
#page-leavewar .zf.rp::before{content:'';position:absolute;left:0;top:0;bottom:0;border-left:2px solid #3bc6e8}
#page-leavewar tr.zpair-p td{background-image:linear-gradient(rgba(120,112,40,.22),rgba(120,112,40,.22))}
#page-leavewar tr.zpair-w td{background-image:linear-gradient(rgba(30,110,78,.24),rgba(30,110,78,.24))}
#page-leavewar .zbalb{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:6px;border:1px solid #3a4652;background:#141a21;color:#e6edf3!important;font-weight:700;letter-spacing:.06em}
/* the window pieces (inside the app's own .bidsheet) */
.bidsheet .zt-tick{margin-left:auto;display:inline-flex;align-items:center;gap:7px;align-self:center;height:28px;padding:0 10px;border-radius:7px;border:1px solid #2f3a46;background:#12161b;color:#e6edf3;font:600 calc(var(--zf) * 1) system-ui;white-space:nowrap;cursor:pointer}
.bidsheet .zt-tick i{width:14px;height:14px;border:2px solid #9aa5b1;border-radius:3px;font-style:normal;display:grid;place-items:center;box-sizing:border-box}
.bidsheet .zt-tick i.on{background:#3bc6e8;border-color:#3bc6e8;color:#0b0d10;font:900 10px/1 system-ui}
.bidsheet .zt-tick ~ .x{margin-left:4px}
.bidsheet.zz-new .bidsheet-row{margin-top:4px}
.bidsheet .zday{margin:0 0 4px;padding:5px 10px;border-radius:9px;background:#11161c;border:1px solid #26303a;display:grid;grid-template-columns:auto 1fr;column-gap:16px;row-gap:3px;font:600 calc(var(--zf) * 1.08) system-ui;color:#e6edf3}
.bidsheet .zday .nm{color:#c9d1d9}.bidsheet .zday .fg{font-variant-numeric:tabular-nums;justify-self:start}
.bidsheet .zday .amb{color:#F2C879}.bidsheet .zday .red{color:#FF7A84}
.bidsheet .zday .calm{grid-column:1 / -1;color:#9aa5b1;font-weight:500}
.bidsheet .zlg{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;flex:1;min-width:0}
.bidsheet .zlb{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:5px 4px;border-radius:9px;font:700 var(--zf) system-ui;font-family:inherit;cursor:pointer;white-space:nowrap;min-width:0}
.bidsheet .zlb small{font:600 calc(var(--zf) * .86) system-ui;font-variant-numeric:tabular-nums}
.bidsheet .zlb small.neg{color:#FF7A84!important;opacity:1!important}
.bidsheet .zlb.wt{background:transparent;color:rgb(var(--h));border:1px dashed rgba(var(--h),.95)}
.bidsheet .zlb.wt small{color:#c9d1d9}
.bidsheet .zlb.ok{background:rgba(var(--h),var(--f));color:var(--ink);border:1px solid rgba(var(--h),.85)}
.bidsheet .zlb.ok small{color:var(--ink);opacity:.85}
.bidsheet .zlb.zero small{color:#7d8894}
.bidsheet .zlb.cur{box-shadow:0 0 0 2px #3bc6e8}
.bidsheet .zdocb{display:inline-flex;align-items:center;gap:6px}
.bidsheet .zfile{display:inline-flex;align-items:center;gap:8px;padding:5px 9px;border-radius:8px;border:1px solid #2f3a46;background:#12161b;color:#e6edf3;font:600 var(--zf) system-ui}
.bidsheet .zfile .xx{color:#8a96a3;font-weight:400}
.bidsheet .zval{font:600 calc(var(--zf) * 1.02) system-ui;color:#e6edf3}.bidsheet .zval em{font-style:normal;color:#9aa5b1;font-weight:500}
.bidsheet .zval .ok{color:#8FE0A8}
.bidsheet .dchip.approve.zon{box-shadow:0 0 0 2px #3bc6e8}
.bidsheet .bidsheet-row.zrule{border-top:1px solid #26303a;padding-top:8px;margin-top:8px}
/* the "Open for bidding" window */
.bidsheet .zmos{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;margin:4px 0 10px;position:relative}
.bidsheet .zmos.one{grid-template-columns:repeat(12,minmax(0,1fr))}
.bidsheet .zmb{display:flex;align-items:center;justify-content:center;height:38px;border-radius:9px;border:1px solid #2f3a46;background:#0f1318;color:#9aa5b1;font:700 var(--zf) system-ui;letter-spacing:.04em}
.bidsheet .zmb.on{border-color:rgba(87,201,122,.75);background:rgba(87,201,122,.16);color:#8FE0A8}
.bidsheet .zmb.drag{border:1px solid rgba(59,198,232,.8);background:rgba(59,198,232,.16);color:#9FDCEE}
.bidsheet .zfinger{position:absolute;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:rgba(241,244,247,.28);border:2px solid rgba(241,244,247,.75);pointer-events:none;z-index:3}
.bidsheet .zpath{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:visible}
.bidsheet .zol{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:14px;padding:9px 12px;margin-bottom:6px;border-radius:9px;background:#0f1318;border:1px solid #26303a;font:500 calc(var(--zf) * 1.05) system-ui;color:#9aa5b1}
.bidsheet .zol b{color:#8FE0A8;font-weight:700}
.bidsheet .zol .zcal{display:inline-flex;align-items:center;justify-content:center;width:34px;height:30px;border-radius:7px;border:1px solid #2f3a46;background:#12161b;color:#5fd0e6}
.bidsheet .zempty{padding:10px 12px;border-radius:9px;border:1px dashed #3a4652;color:#9aa5b1;font:500 calc(var(--zf) * 1.05) system-ui;margin-bottom:6px}
.bidsheet .zadd{color:#5fd0e6;font:600 var(--zf) system-ui;padding:4px 2px;background:none;border:0}
/* Approvals (docked on a desktop; from the top on a phone) */
.zapw{position:fixed;z-index:85;background:#161b22;border:1px solid #2a323c;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.6);color:#c9d1d9;font:13px system-ui;display:flex;flex-direction:column;overflow:hidden}
.zapw .hd{display:flex;align-items:center;gap:10px;height:46px;padding:0 14px;border-bottom:1px solid #2a323c;flex:none}
.zapw .hd .g{color:#6b7785}.zapw .hd b{font:800 15px system-ui;letter-spacing:.06em;color:#f1f4f7}.zapw .hd .sub{color:#8a96a3;font:500 12.5px system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.zapw .hd .x{margin-left:auto;color:#9aa5b1;font-size:16px}
.zapw .fl{display:flex;align-items:center;gap:4px;padding:8px 14px;border-bottom:1px solid #2a323c;flex:none;white-space:nowrap}
.zapw .mb{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:28px;padding:0 5px;border-radius:7px;border:1px solid #2f3a46;background:#12161b;color:#e6edf3;font:600 11.5px system-ui;white-space:nowrap}
.zapw .zz-months{gap:3px!important}
.zapw .zgh{display:flex;align-items:center;gap:8px;height:34px;margin-top:14px;border-bottom:1px solid #2a323c}
.zapw .mb.on{border-color:rgba(59,198,232,.55);background:rgba(59,198,232,.14);color:#5fd0e6}.zapw .mb.dim{color:#5c6773;border-color:#222a33;background:#0f1317}
.zapw .vs{width:1px;height:20px;background:#2f3a46;margin:0 6px}
.zapw .apall{display:inline-flex;align-items:center;height:30px;padding:0 14px;border-radius:8px;background:#3bc6e8;color:#04222b;font:800 13px system-ui;border:0;white-space:nowrap}
.zapw .apall.armed{background:#3bc6e8;box-shadow:0 0 0 2px #0b0d10,0 0 0 4px #3bc6e8}
.zapw .list{overflow:hidden;padding:0 14px;flex:1;position:relative}
.zapw .r{display:flex;align-items:center;gap:10px;min-height:50px;border-bottom:1px solid #222a33;white-space:nowrap}
.zapw .r.h{min-height:28px;font:600 9.5px system-ui;letter-spacing:.12em;color:#8a96a3}
.zpk{display:inline-flex;align-items:center;gap:4px;width:112px;flex:none}
.zpk .cs{flex:1;padding:2px 8px;border-radius:4px;font:600 12.5px system-ui;overflow:hidden;text-overflow:ellipsis}
.zpk.pilot .cs{background:#423F1C;color:#FBFAF0}.zpk.wso .cs{background:#13402F;color:#EAFBF3}
.zpk i{font-style:normal;font:800 9px system-ui;padding:2px 5px;border-radius:8px}
.zkb{display:inline-flex;align-items:center;justify-content:center;flex:none;width:30px;height:22px;border-radius:4px;box-sizing:border-box;font:800 9.5px system-ui}
.zkb.wt{color:rgb(var(--h));outline:1px dashed rgba(var(--h),.95);outline-offset:-1px}
.zkb.ok{background:rgba(var(--h),var(--f));color:var(--ink);box-shadow:inset 0 0 0 1px rgba(var(--h),.85)}
.zapw .k{width:30px;flex:none}
.zapw .dt{width:140px;flex:none;color:#e6edf3;font-weight:600}
.zapw .c{flex:none;font-size:12.5px;font-variant-numeric:tabular-nums}.zapw .c b{color:#fff}.zapw .dy{width:52px}.zapw .bl{width:64px;text-align:right;padding-right:14px}
.zapw .av{width:96px;display:flex;flex-direction:column;gap:2px;padding:5px 0}.zapw .pl{width:92px;color:#9aa5b1}
.zapw .av .ln{display:grid;grid-template-columns:34px auto;column-gap:4px}
.zapw .amb{color:#F2C879!important}.zapw .red{color:#FF7A84!important}.zapw .neg{color:#FF7A84!important}
.zapw .doc{display:inline-flex;align-items:center;justify-content:center;width:30px;height:28px;flex:none;border-radius:7px;color:#c9d1d9}.zapw .doc.has{border:1px solid #2f3a46;background:#12161b}.zapw .doc em{font-style:normal;font:700 10px system-ui}
.zapw .ap,.zapw .rf{display:inline-flex;align-items:center;justify-content:center;flex:none;height:30px;border-radius:8px;font:700 13px system-ui;border:1px solid #2f3a46;background:#12161b}
.zapw .ap{width:80px;color:#e6edf3}.zapw .rf{width:70px;color:#FF8A92}
.zapw .nd{width:9px;flex:none;display:flex}
.zapw .cut{position:absolute;left:0;right:0;bottom:0;height:22px;background:linear-gradient(rgba(22,27,34,0),#161b22)}
/* the phone's two-line lines (A11) */
.zapw.ph .hd{height:44px;padding:0 12px}.zapw.ph .fl{flex-direction:column;align-items:stretch;gap:6px;padding:8px 12px}
.zapw.ph .mos{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}.zapw.ph .mos .mb{padding:0;height:30px;font-size:12px}
.zapw.ph .dr2{display:flex;align-items:center;gap:8px}
.zapw.ph .list{padding:0 12px}
.zapw.ph .g2{display:grid;grid-template-columns:50px 58px minmax(0,1fr) 76px;column-gap:8px;align-items:start}
.zapw.ph .hh{padding:7px 0 5px;border-bottom:1px solid #2a323c;font:600 9.5px system-ui;letter-spacing:.1em;color:#8a96a3}
.zapw.ph .card{padding:8px 0 8px;border-bottom:1px solid #222a33;display:flex;flex-direction:column;gap:6px}
.zapw.ph .l1{display:flex;align-items:center;gap:6px;white-space:nowrap}
.zapw.ph .zpk{width:76px}.zapw.ph .zpk .cs{font-size:11.5px;padding:2px 5px}
.zapw.ph .l1{gap:5px}
.zapw.ph .l1 .dt{width:auto;flex:1;min-width:0;font-size:12.5px;overflow:hidden;text-overflow:ellipsis}
.zapw.ph .ap{width:62px;height:30px;font-size:12.5px}.zapw.ph .rf{width:54px;height:30px;font-size:12.5px}
.zapw.ph .l2 .av{padding:0}
.zapw.ph .doc{width:26px;height:28px}
.zapw.ph .l2{font-size:12.5px;color:#c9d1d9;font-variant-numeric:tabular-nums}.zapw.ph .l2 b{color:#fff}.zapw.ph .l2 .pl{color:#9aa5b1}
.zapw.ph .l2 .av{display:flex;flex-direction:column;gap:1px}
.zapw.ph .r{min-height:0}
`
// ---------------------------------------------------------------- the top, as the final set draws it
const topPhone = s => {
  const open = s.closed ? '<span class="zchip shut">Bidding closed</span>' : `<span class="zchip open"><span>Open</span><b>1 Jan – 31 Mar</b>${s.more ? `<em>+${s.more}</em>` : ''}</span>`
  const r1 = `<div class="zrow"><span class="zlab">VIEW</span><span class="zchip pick">JAN - DEC 26 ${CHEV}</span>${s.admin ? `<span class="zchip sq">+</span><span class="zchip">Approvals <i class="n">15</i></span>` : ''}<span class="zsp"></span></div>`
  const r2 = `<div class="zrow">${open}<span class="zchip zz-under">Under <b class="${s.under ? 'amb' : ''}">${s.under}</b> days</span><span class="zsp"></span><span class="zchip">Legend</span></div>`
  const ml = s.admin ? '<b>LVE 17</b> · OIL 0 · 0 waiting · next 30 Jan' : '<b>LVE 14.5</b> · OIL 0 · 2 waiting · next 19 Jan'
  const r3 = `<div class="zrow"><span class="zml"><span class="zlab">MY LEAVE</span>${ml}<span class="zsp"></span>›</span></div>`
  return [r1, r2, r3]
}
const topDesk = s => {
  const open = s.closed ? '<span class="zchip shut">Bidding closed</span>' : `<span class="zchip open"><span>Open for bidding</span><b>1 Jan – 31 Mar</b>${s.more ? `<em>+${s.more}</em>` : ''}</span>`
  const r1 = `<div class="zrow"><span class="zlab">VIEW</span><span class="zchip pick">JAN - DEC 26 ${CHEV}</span><span class="zchip">+ New</span><span class="zchip zz-appr">Approvals <i class="n">15</i>${s.apNew ? `<span class="znw">${DOT}${s.apNew} new</span>` : ''}</span></div>`
  const r2 = `<div class="zrow">${open}<span class="zlab">UNDER-MANNED</span><span class="zchip zz-under"><b class="${s.under ? 'amb' : ''}">${s.under}</b> days</span><span class="zchip">Legend</span><span class="zsp"></span><span class="zml"><span class="zlab">MY LEAVE</span><b>LVE 17</b> · OIL 0 · 0 waiting · next 30 Jan ›</span></div>`
  return [r1, r2]
}
async function stage(p, phone, s) {
  await p.evaluate(([css, rows, phone, KF, FAM]) => {
    if (!document.getElementById('zzcss')) { const st = document.createElement('style'); st.id = 'zzcss'; st.textContent = css; document.head.appendChild(st) }
    const pg = document.querySelector('#page-leavewar'), top = pg.querySelector('.topbar'), fil = pg.querySelector('.filters')
    pg.style.setProperty('--ch', phone ? '23px' : '32px'); pg.style.setProperty('--fs', phone ? '11.2px' : '13.5px')
    pg.style.setProperty('--pf', phone ? '12.6px' : '13.5px'); pg.style.setProperty('--mh', phone ? '25px' : '34px')
    // an open window rendered inside these rows is kept, and put back
    const keep = [...top.querySelectorAll('.bidsheet'), ...fil.querySelectorAll('.bidsheet')]
    top.innerHTML = rows[0]; fil.innerHTML = rows[1]; keep.forEach(k => fil.appendChild(k))
    pg.querySelector('.zrow3')?.remove()
    if (rows[2]) { const r = document.createElement('div'); r.className = 'zrow3'; r.innerHTML = rows[2]; fil.after(r) }
    // look F on every cell (D1175): filled approved, hollow dashed waiting, grey struck refused, a half its half (D1160)
    for (const td of document.querySelectorAll('#page-leavewar td[data-testid^="cell-"]')) {
      const cs = [...td.querySelectorAll(':scope > .c')]; if (!cs.length || td.querySelector('.zf')) continue
      const ents = cs.map(c => ({ code: c.textContent.replace(/[<>*]/g, '').trim(), cls: c.className })).filter(e => FAM[e.code])
      if (!ents.length) continue
      cs.forEach(c => { c.style.visibility = 'hidden' }); td.querySelectorAll(':scope > .mk').forEach(m => { m.style.visibility = 'hidden' })
      if (getComputedStyle(td).position === 'static') td.style.position = 'relative'
      const halves = ents.some(e => /\b(am|pm)\b/.test(e.cls))
      ents.slice(0, 2).forEach((e, i) => {
        const b = document.createElement('span')
        const st = /\bref\b/.test(e.cls) ? 'rf' : /\b(appr|info|sc)\b/.test(e.cls) ? 'ok' : 'wt'
        const half = /\bam\b/.test(e.cls) ? 'am' : /\bpm\b/.test(e.cls) ? 'pm' : (ents.length > 1 && !halves ? ['l', 'r'][i] : '')
        b.className = `zf ${st} ${half}${/\braptor\b/.test(e.cls) ? ' rp' : ''}`
        const [h, ink, f] = KF[FAM[e.code]]; b.style.cssText = `--h:${h};--ink:${ink};--f:${f}`
        b.innerHTML = `<b>${e.code}</b>`; td.appendChild(b)
      })
    }
    // the Required / Available pairs tinted (D1194); "Figures" is the Balances button (D1185)
    document.querySelector('[data-testid="fly-row-req-p"]')?.classList.add('zpair-p'); document.querySelector('[data-testid="fly-row-avail-p"]')?.classList.add('zpair-p')
    document.querySelector('[data-testid="fly-row-req-w"]')?.classList.add('zpair-w'); document.querySelector('[data-testid="fly-row-avail-w"]')?.classList.add('zpair-w')
    const fb = document.querySelector('[data-testid="figures-toggle"]')
    if (fb && !fb.querySelector('.zbalb')) { const open = /▾|expanded/.test(fb.textContent) || fb.getAttribute('aria-expanded') === 'true'; fb.innerHTML = `<span class="zbalb">${open ? '▾' : '▸'} Balances</span>` }
    // question 12's recommended answer, as the rest of the final set draws it: the zoom pair become magnifiers
    const mag = s => `<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10.4 10.4L14 14M5 7h4${s === '+' ? 'M7 5v4' : ''}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
    for (const b of document.querySelectorAll('#page-leavewar button')) {
      if (b.closest('.topbar,.filters,.bidsheet')) continue
      const z = b.dataset.testid; if (z === 'lw-zoom-in' || z === 'lw-zoom-out') b.innerHTML = mag(z === 'lw-zoom-in' ? '+' : '-')
    }
  }, [CSS, phone ? topPhone(s) : topDesk(s), phone, KF, FAM])
  await p.waitForTimeout(250)
}
// INVENTED, said so: Required P typed as 24 on every weekday that is not a holiday, so the Available P row's amber
// (Required + 2) and red (Required + 0, today's rule — D1191, D1202) show; the demo squadron types no Required figure.
const required = p => p.evaluate(() => {
  const isWork = iso => { const d = new Date(iso + 'T12:00:00').getDay(); return d > 0 && d < 6 && !['2026-02-17', '2026-02-18'].includes(iso) }
  const tdOf = (row, iso) => document.querySelector(`[data-testid="fly-row-${row}"] td[data-testid$="${iso}"]`)
  let under = 0
  for (const td of document.querySelectorAll('[data-testid="fly-row-req-p"] td[data-testid]')) {
    const iso = td.dataset.testid.slice(-10); if (!/^\d{4}-\d\d-\d\d$/.test(iso) || !isWork(iso)) continue
    td.textContent = '24'; td.classList.remove('none')
    const a = tdOf('avail-p', iso); if (!a) continue
    const v = parseFloat(a.textContent); if (isNaN(v)) continue
    if (v < 24) a.classList.add('under'); else if (v < 26) a.style.color = '#F2C879'
    if (v < 26 && iso >= '2026-01-01' && iso <= '2026-03-31') under++
  }
  return under
})
// the app's own figure under a window's font
const zfOf = p => p.evaluate(() => { const c = document.querySelector('.bidsheet .pchip'); const f = c ? parseFloat(getComputedStyle(c).fontSize) : 12; document.querySelectorAll('.bidsheet').forEach(s => s.style.setProperty('--zf', f + 'px')); return f })
const fill = (p, html, sel = '.bidsheet') => p.evaluate(([html, sel]) => { const d = [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width).pop(); if (!d) return 'none'; d.innerHTML = html; d.classList.add('zz-new'); return 'ok' }, [html, sel])
// fix A5: the tapped day is scrolled to stand above the window
const reveal = (p, cell) => p.evaluate(cell => {
  const c = document.querySelector(`[data-testid="${cell}"]`), sh = [...document.querySelectorAll('.bidsheet')].filter(e => e.getBoundingClientRect().width).pop()
  if (!c || !sh) return 'none'
  const need = () => c.getBoundingClientRect().bottom - (sh.getBoundingClientRect().top - 3)
  let dy = need(); if (dy > 0) document.scrollingElement.scrollTop += dy
  dy = need(); const w = c.closest('.mx-wrap'); if (dy > 0 && w) w.scrollTop += dy / (parseFloat(getComputedStyle(c.closest('table')).zoom) || 1)
  return [Math.round(need()), document.scrollingElement.scrollTop, w?.scrollTop]
}, cell)
// on a desktop the window docks to the grid's right edge, so the day tapped stays in view (fix A5, carried from Approvals
// and the person window to the bid window — the agent's reading); still draggable (D641)
const dock = p => p.evaluate(() => {
  const sh = [...document.querySelectorAll('.bidsheet')].filter(e => e.getBoundingClientRect().width).pop()
  const g = (document.querySelector('#page-leavewar .mx-outer') || document.querySelector('#page-leavewar .mx-wrap')).getBoundingClientRect()
  Object.assign(sh.style, { left: 'auto', right: (innerWidth - g.right + 8) + 'px', transform: 'none' })
})
const ring = (p, cell) => p.evaluate(cell => { const c = document.querySelector(`[data-testid="${cell}"]`); if (c) { c.style.boxShadow = 'inset 0 0 0 2px #3bc6e8' } }, cell)

// ---------------------------------------------------------------- the bid window (D1144, D1183, D1186, D1187, A2, A8, A9)
const LEAVES = ['LL', 'OL', 'OIL', 'CCL', 'FCL', 'PL', 'EL', 'CL']
// the figures as the app shows them: Ranger LVE 14.5 left, Anvil −1.5 (LL and OL draw on it), every other kind 0
const LEFTS = { Ranger: { LL: '14.5', OL: '14.5', OIL: '0', CCL: '0', FCL: '0', PL: '0', EL: '0', CL: '0' },
  Anvil: { LL: '-1.5', OL: '-1.5', OIL: '0', CCL: '0', FCL: '0', PL: '0', EL: '0', CL: '0' } }
let LEFT = LEFTS.Ranger
const tick = (on, phone) => `<button class="zt-tick zz-tick"><i class="${on ? 'on' : ''}">${on ? '✓' : ''}</i>${phone ? 'Approve what I enter' : 'Approve what I enter'}</button>`
const H = {
  hd: (who, dt, extra = '') => `<div class="bidsheet-hd"><span class="who">${who}</span><span class="dt">${dt}</span>${extra}<button class="x" aria-label="Close">✕</button></div>`,
  row: (lab, inner, cls = '') => `<div class="bidsheet-row ${cls}"><span class="lab">${lab}</span>${inner}</div>`,
}
// D1144 with question 7's recommended answer: Available P before and after, and the row it turns red on its own line
const dayLine = () => `<div class="zday zz-day"><span class="nm zz-q7">Available P</span><span class="fg"><span class="amb">24.5</span> → <b class="red">23.5</b> <span class="red">· red</span></span></div>`
const howMany = () => H.row('How many', '<button class="pchip on">Just this day</button><button class="pchip">Pick a range</button>')
const howMuch = () => H.row('How much', '<button class="pchip on">Whole day</button><button class="pchip">AM</button><button class="pchip">PM</button>')
const docRow = files => H.row('Document', files ? `${files.map(f => `<span class="zfile">${CLIP}${f}<span class="xx">✕</span></span>`).join('')}<button class="pchip zdocb">${UP} Add</button>` : `<button class="pchip zdocb">${UP} Document</button>`, 'zz-doc')
const whichLeave = (st, cur) => H.row('Which leave', `<div class="zlg zz-leaves">${LEAVES.map(k => `<button class="zlb ${st}${LEFT[k] === '0' ? ' zero' : ''}${cur === k ? ' cur' : ''}" style="${kv(k)}">${k}<small class="${LEFT[k].startsWith('-') ? 'neg' : ''}">${LEFT[k].replace('-', '−')}</small></button>`).join('')}</div>`)
const also = () => H.row('Also', '<button class="dchip po">+OIL</button><button class="dchip po">PO</button><button class="dchip po">PI</button>', 'postout zz-also')
const bidHTML = o => H.hd(o.who || 'Ranger', 'Fri 23 Jan', o.admin ? tick(o.tick, o.phone) : '') + dayLine() + howMany() + howMuch() + docRow() + whichLeave(o.admin && o.tick ? 'ok' : 'wt') + (o.admin ? also() : '')
// an entry already placed: Ranger's approved LL, Mon 19 – Wed 21 Jan (the app's own); INVENTED, said so: who placed it
// and when, who decided and when, and its leave form — the app keeps none of the three today
const entryHTML = () => H.hd('Ranger', 'Mon 19 Jan', '<span class="cur">now LL</span>') +
  `<div class="zz-who">${H.row('Placed', '<span class="zval">Ranger <em>· Mon 5 Jan, 09:12</em></span>')}${H.row('Decided', '<span class="zval"><span class="ok">Approved</span> · Saber <em>· Tue 6 Jan, 14:30</em></span>')}</div>` +
  H.row('How many', '<button class="pchip on">Just this day</button><button class="pchip">Pick a range</button>', 'zrule') +
  H.row('Decide', '<button class="dchip approve zon" aria-pressed="true">Approve</button><button class="dchip refuse">Refuse</button>', 'zz-decide') +
  H.row('Selected', '<button class="dchip move"><span class="mvarr">⇄</span>Move</button><button class="dchip del">Delete</button>') +
  docRow(['Leave form.pdf']) + howMuch() + whichLeave('ok', 'LL') + also()

// ---------------------------------------------------------------- Approvals (D1152, D1178, D1180, D1181, D1184, D1189, D1192, D1197, D1199 A)
// the demo's 15 waiting requests, oldest first (the app's own requests, figures, balances and Available rows read off
// the page); INVENTED, said so: when each was placed (the app keeps no such time today), which carry a document, and on
// Anvil's line the counters IP and SXO (the demo squadron has none) to show the stack of D1192
const REQ = [
  // cs, id, seat, cat, chip, kind, desk dates, phone dates, days, isoDates, placed, docs, new, extra
  ['Cinch', 'snap', 'pilot', 'IP', 'sxo', 'LL', 'Thu 22 – Fri 23 Jan', '22–23 Jan', '2 days', ['2026-01-22', '2026-01-23'], '2 Jan 09:40', 0],
  ['Gambit', 'bruise', 'pilot', 'C', 'c', 'LL', 'Fri 23 Jan, AM', '23 Jan AM', '½ day', ['2026-01-23'], '3 Jan 11:05', 1],
  ['Warden', 'nact', 'pilot', 'IP', 'sxo', 'OIL', 'Fri 23 Jan, AM', '23 Jan AM', '½ day', ['2026-01-23'], '3 Jan 16:20', 0],
  ['Warden', 'nact', 'pilot', 'IP', 'sxo', 'LL', 'Fri 23 Jan, PM', '23 Jan PM', '½ day', ['2026-01-23'], '3 Jan 16:21', 0],
  ['Ranger', 'bane', 'pilot', 'IP', 'sxo', 'LL', 'Mon 26 – Tue 27 Jan', '26–27 Jan', '2 days', ['2026-01-26', '2026-01-27'], '4 Jan 08:30', 2],
  ['Anvil', 'shaft', 'pilot', 'IP', 'sxo', 'LL', 'Tue 27 Jan', '27 Jan', '1 day', ['2026-01-27'], '5 Jan 10:12', 0, 0, [['IP', '3', 'amb'], ['SXO', '1', 'red']]],
  ['Drifter', 'slipway', 'pilot', 'A', 'sxo', 'LL', 'Tue 27 Jan', '27 Jan', '1 day', ['2026-01-27'], '5 Jan 14:48', 1],
  ['Basher', 'glass', 'wso', 'IW', 'sxo', 'LL', 'Tue 27 Jan', '27 Jan', '1 day', ['2026-01-27'], '6 Jan 09:02', 1],
  ['Blade', 'slash', 'pilot', 'IP', 'ins', 'LL', 'Mon 2 Feb', '2 Feb', '1 day', ['2026-02-02'], '6 Jan 12:30', 0],
  ['Blade', 'slash', 'pilot', 'IP', 'ins', 'LL', 'Tue 3 Feb, PM', '3 Feb PM', '½ day', ['2026-02-03'], '6 Jan 12:31', 0],
  ['Drifter', 'slipway', 'pilot', 'A', 'sxo', 'OIL', 'Tue 10 Feb, AM', '10 Feb AM', '½ day', ['2026-02-10'], '6 Jan 17:45', 0],
  ['Gambit', 'bruise', 'pilot', 'C', 'c', 'OIL', 'Tue 24 Feb', '24 Feb', '1 day', ['2026-02-24'], '7 Jan 08:15', 0],
  ['Reaper', 'dice', 'pilot', 'IR', 'sxo', 'LL', 'Tue 27 Jan', '27 Jan', '1 day', ['2026-01-27'], '7 Jan 18:10', 0, 1],
  ['Ranger', 'bane', 'pilot', 'IP', 'sxo', 'LL', 'Thu 29 Jan, AM', '29 Jan AM', '½ day', ['2026-01-29'], '7 Jan 21:30', 0, 1],
  ['Static', 'wolf', 'wso', 'IW', 'ins', 'LL', 'Thu 8 Jan', '8 Jan', '1 day', ['2026-01-08'], '8 Jan 07:55', 1, 1],
]
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// read off the page: the balance each line shows (LVE, or OIL for an OIL request), the lowest Available on its days
const readFigs = p => p.evaluate(REQ => {
  const txt = (sel) => document.querySelector(sel)?.textContent.trim()
  const av = (row, iso) => parseFloat(txt(`[data-testid="fly-row-${row}"] td[data-testid$="${iso}"]`))
  return REQ.map(r => {
    const [, id, seat, , , kind, , , , isos] = r
    const bal = kind === 'OIL' ? (txt(`[data-person="${id}"][data-fig="oil"] .fb`) ?? txt(`[data-person="${id}"][data-fig="oil"]`)) : txt(`[data-testid="bal-${id}"] .fb`)
    const row = seat === 'wso' ? 'avail-w' : 'avail-p'
    const vals = isos.map(i => av(row, i)).filter(v => !isNaN(v))
    return { bal, low: vals.length ? Math.min(...vals) : null }
  })
}, REQ)
const tone = (seat, v) => seat === 'wso' || v == null ? '' : v < 24 ? 'red' : v < 26 ? 'amb' : ''
const lowCell = (r, f) => {
  const [, , seat] = r
  const lines = [[seat === 'wso' ? 'W' : 'P', f.low ?? '–', tone(seat, f.low)], ...(r[13] || [])]
  return lines.map(([n, v, t]) => `<span class="ln"><span class="${t}">${n}</span><b class="${t}">${v}</b></span>`).join('')
}
const balCell = (r, f) => `${r[5] === 'OIL' ? '<small style="color:#8a96a3;font-size:10px">OIL</small> ' : ''}<b class="${parseFloat(f.bal) < 0 ? 'neg' : ''}">${f.bal ?? '–'}</b>`
const docCell = n => n ? `<span class="doc has zz-doci">${CLIP}${n > 1 ? `<em>${n}</em>` : ''}</span>` : '<span class="doc"></span>'
function apDesk(figs, o) {
  const rows = REQ.map((r, i) => [r, figs[i]]).filter(([r]) => !o.newOnly || r[12])
  const n = rows.length
  const head = `<div class="hd"><span class="g">⠿</span><b>Approvals</b><span class="sub zz-sub">15 waiting · 3 new since you last looked, Wed 7 Jan 16:40</span><span class="x">✕</span></div>`
  const fl = `<div class="fl"><span class="mb${o.newOnly ? ' on' : ''} zz-new3">${DOT}New 3</span><span class="vs"></span><span class="zlab" style="margin-right:4px">DATES</span><span class="zz-months" style="display:inline-flex;gap:4px"><span class="mb on">All</span>${MON.map(m => `<span class="mb${['Jan', 'Feb'].includes(m) ? '' : ' dim'}">${m}</span>`).join('')}</span><span class="mb">Pick dates…</span><span class="zsp"></span><button class="apall${o.armed ? ' armed' : ''} zz-apall">${o.armed ? `Approve ${n} — tap again` : `Approve all ${n}`}</button></div>`
  const hdr = `<div class="r h zz-cols"><span class="nd"></span><span class="zpk" style="background:none">NAME</span><span class="k">KIND</span><span class="dt" style="color:inherit;font-weight:inherit">DATES</span><span class="c dy">DAYS</span><span class="c bl" style="text-align:right">LVE BAL</span><span class="c av" style="padding:0">LOWEST AVAIL</span><span class="c pl" style="color:inherit">PLACED</span><span class="doc"></span><span class="zsp"></span><span style="width:160px"></span></div>`
  const lines = rows.map(([r, f], i) => `<div class="r${i === 0 ? ' zz-first' : ''}"><span class="nd">${r[12] ? DOT : ''}</span>${puck(r[0], r[2], r[3], r[4])}<span class="k">${kbox(r[5])}</span><span class="dt">${r[6]}</span><span class="c dy">${r[8]}</span><span class="c bl">${balCell(r, f)}</span><span class="c av${r[13] ? ' zz-stack' : ''}">${lowCell(r, f)}</span><span class="c pl">${r[10]}</span>${docCell(r[11])}<span class="zsp"></span><span class="ap${i === 0 ? ' zz-ap' : ''}">Approve</span><span class="rf${i === 0 ? ' zz-rf' : ''}">Refuse</span></div>`).join('')
  // D1199 A, as the visit drawing had it: what changed since he last looked that needs no decision. INVENTED, said so:
  // a bid Cinch withdrew and a leave Basher filed on the Inputs page (the demo holds neither)
  const alsoSince = o.newOnly ? `<div class="zgh zz-also"><span class="zlab">ALSO SINCE YOU LAST LOOKED</span><span style="color:#8a96a3;font-size:12px">· nothing to decide</span></div>` +
    [['Cinch', 'pilot', 'IP', 'sxo', 'LL', 'Thu 29 Jan', 'Bid withdrawn by Cinch', '7 Jan 17:20', 'rf'], ['Basher', 'wso', 'IW', 'sxo', 'LL', 'Mon 2 Feb', 'Filed on the Inputs page · approved', '7 Jan 19:05', 'ok']].map(([cs, s, c, ch, k, d, what, when, st]) =>
      `<div class="r"><span class="nd">${DOT}</span>${puck(cs, s, c, ch)}<span class="k">${st === 'rf' ? `<span class="zkb" style="color:#6b7785;box-shadow:inset 0 0 0 1px #4a5560;text-decoration:line-through"><b>${k}</b></span>` : kbox(k, 'ok')}</span><span class="dt">${d}</span><span style="width:262px;flex:none;color:#c9d1d9">${what}</span><span class="c pl">${when}</span><span class="zsp"></span><span style="color:#5fd0e6;font:600 12.5px system-ui">Show on grid ›</span></div>`).join('') : ''
  return head + fl + `<div class="list">${hdr}${lines}${alsoSince}${o.cut ? '<div class="cut"></div>' : ''}</div>`
}
function apPhone(figs, o) {
  const rows = REQ.map((r, i) => [r, figs[i]]).filter(([r]) => !o.newOnly || r[12])
  const n = rows.length
  const head = `<div class="hd"><span class="g">⠿</span><b>Approvals</b><span class="sub">15 waiting · 3 new</span><span class="x">✕</span></div>`
  const fl = `<div class="fl"><div class="mos zz-months"><span class="mb${o.newOnly ? ' on' : ''} zz-new3">${DOT}New 3</span><span class="mb${o.newOnly ? '' : ' on'}">All</span>${MON.map(m => `<span class="mb${['Jan', 'Feb'].includes(m) ? '' : ' dim'}">${m}</span>`).join('')}</div><div class="dr2"><span class="mb" style="height:30px">Pick dates…</span><span class="zsp"></span><button class="apall zz-apall">Approve all ${n}</button></div></div>`
  const hh = '<div class="g2 hh zz-cols"><span>DAYS</span><span>LVE BAL</span><span>LOWEST AVAIL</span><span>PLACED</span></div>'
  const cards = rows.map(([r, f], i) => `<div class="card${i === 0 ? ' zz-card' : ''}"><div class="l1">${puck(r[0], r[2], r[3], r[4])}${kbox(r[5])}<span class="dt">${r[7]}</span>${docCell(r[11])}<span class="ap">Approve</span><span class="rf">Refuse</span></div><div class="g2 l2"><span>${r[8]}</span><span>${balCell(r, f)}</span><span class="av${r[13] ? ' zz-stack' : ''}">${lowCell(r, f).replace(/class="ln"/g, 'class="ln" style="display:flex;gap:4px"')}</span><span class="pl">${r[10]}</span></div></div>`).join('')
  return head + fl + `<div class="list">${hh}${cards}<div class="cut"></div></div>`
}
async function approvals(p, html, phone) {
  return p.evaluate(([html, phone]) => {
    document.querySelector('.zapw')?.remove()
    const w = document.createElement('div'); w.className = 'zapw zz-fixed zz-apw' + (phone ? ' ph' : ''); w.innerHTML = html
    if (phone) {
      const t = document.querySelector('.zrow3').getBoundingClientRect().bottom + 6
      Object.assign(w.style, { left: '6px', right: '6px', top: t + 'px', bottom: '6px' })
    } else {
      // fix A5: docked to the grid's right edge, as tall as the grid card — the dates its lines name stay in view
      const g = (document.querySelector('#page-leavewar .mx-outer') || document.querySelector('#page-leavewar .mx-wrap')).getBoundingClientRect()
      Object.assign(w.style, { right: (innerWidth - g.right) + 'px', top: g.top + 'px', bottom: '8px', width: '920px' })
    }
    document.body.appendChild(w)
    return [...w.querySelectorAll('.r,.l1,.fl')].map(r => r.scrollWidth - r.clientWidth).filter(x => x > 0)
  }, [html, phone])
}

// ---------------------------------------------------------------- the "Open for bidding" window (D1168, D1169, D1172, D1177, A7)
const MONU = MON.map(m => m.toUpperCase())
const openHTML = o => H.hd('Open for bidding', 'Jan – Dec 26') +
  `<div class="zmos${o.one ? ' one' : ''} zz-mos">${MONU.map((m, i) => `<span class="zmb${o.on.includes(i) ? ' on' : o.drag?.includes(i) ? ' drag' : ''}" data-m="${i}">${m}</span>`).join('')}</div>` +
  (o.lines.length ? o.lines.map(([d, n], i) => `<div class="zol${i === o.lines.length - 1 ? ' zz-line' : ''}"><b>${d}</b><span>${n}</span><span class="zcal zz-cal">${CAL}</span></div>`).join('') : '<div class="zempty zz-empty">Nothing is open, so bidding is closed.</div>') +
  '<button class="zadd">+ Open more dates</button>'
// a finger dragging from May to August across the phone's two rows: the path it took, and the months it opens — in
// calendar order from the first month to the one under the finger, never what the path crossed (fix A7)
const finger = (p, from, to) => p.evaluate(([from, to]) => {
  const g = document.querySelector('.zz-mos'), G = g.getBoundingClientRect()
  const c = m => { const r = g.querySelector(`[data-m="${m}"]`).getBoundingClientRect(); return [r.left + r.width / 2 - G.left, r.top + r.height / 2 - G.top] }
  const [ax, ay] = c(from), [bx, by] = c(to), [sx, sy] = c(8)
  // the finger's way from May down across September to August: a rule that followed the path would open September too
  const svg = `<svg class="zpath" viewBox="0 0 ${G.width} ${G.height}" width="${G.width}" height="${G.height}"><path d="M${ax} ${ay} Q ${sx + 10} ${sy - 20}, ${sx} ${sy} T ${bx} ${by}" fill="none" stroke="rgba(241,244,247,.8)" stroke-width="2" stroke-dasharray="5 4"/></svg>`
  g.insertAdjacentHTML('beforeend', svg + `<span class="zfinger" style="left:${bx}px;top:${by}px"></span>`)
}, [from, to])

// ---------------------------------------------------------------- scenes
async function scene(w, h, touch, who) {
  const { ctx, p } = await newPage(browser, w, h, touch, state); await signIn(p, who)
  return { ctx, p }
}
const tapOrClick = (p, touch, sel) => touch ? p.tap(sel) : p.click(sel)
const M = (p, touch) => async (sel, n, o = {}) => mark(p, sel, String(n), { ...(touch ? { num: true } : { num: true }), ...o })
const Qm = (p) => async (sel, label, o = {}) => mark(p, sel, label, o)
let UNDER = 0

// 0 — read the figures once, on a desktop (the whole year is drawn there)
let FIGS
{
  const { ctx, p } = await scene(1536, 860, false, 'admin')
  UNDER = await required(p)
  FIGS = await readFigs(p)
  console.log('under-manned (amber or red, Jan–Mar):', UNDER, JSON.stringify(FIGS))
  await ctx.close()
}

// r7-10 — the member's bid window on his phone: a tap on his own empty day, Fri 23 Jan
{
  const { ctx, p } = await scene(390, 844, true, 'member')
  await gridTo(p, '2026-01-19', 'bane'); await p.tap(q('cell-bane-2026-01-23')); await p.waitForTimeout(600)
  await stage(p, true, { under: UNDER }); await required(p)
  await zfOf(p); await fill(p, bidHTML({ admin: false, phone: true })); await p.waitForTimeout(200)
  console.log('reveal', await reveal(p, 'cell-bane-2026-01-23')); await ring(p, 'cell-bane-2026-01-23')
  await shot(p, 'r7-10-bid-member-phone-clean')
  const m = M(p, true), qm = Qm(p)
  await qm('.zz-day .fg', 'Q7 — your answer first', { right: true }); await m('.zz-day', 1)
  await m('.zz-doc', 2); await m('.zz-leaves', 3); await m('[data-testid="cell-bane-2026-01-23"]', 4)
  await m('.zz-under', 'Q7')
  await shot(p, 'r7-10-bid-member-phone')
  await ctx.close()
}
// r7-11 — the admin's bid window on a desktop, "Approve what I enter" ticked
{
  const { ctx, p } = await scene(1536, 860, false, 'admin')
  LEFT = LEFTS.Anvil
  await gridTo(p, '2026-01-12', 'shaft'); await p.click(q('cell-shaft-2026-01-23')); await p.waitForTimeout(600)
  await stage(p, false, { under: UNDER }); await required(p)
  await zfOf(p); await fill(p, bidHTML({ admin: true, tick: true, who: 'Anvil' })); await dock(p); await p.waitForTimeout(200)
  await ring(p, 'cell-shaft-2026-01-23')
  await shot(p, 'r7-11-bid-admin-desk-clean')
  const m = M(p, false)
  await m('.zz-tick', 1); await m('.zz-day', 2); await m('.zz-doc', 3); await m('.zz-leaves', 4); await m('.zz-also', 5); await m('[data-testid="cell-shaft-2026-01-23"]', 6)
  await shot(p, 'r7-11-bid-admin-desk')
  await ctx.close()
}
// r7-12 — the same window on the admin's phone, unticked
{
  const { ctx, p } = await scene(390, 844, true, 'admin')
  await gridTo(p, '2026-01-19', 'shaft'); await p.tap(q('cell-shaft-2026-01-23')); await p.waitForTimeout(600)
  await stage(p, true, { admin: true, under: UNDER }); await required(p)
  await zfOf(p); await fill(p, bidHTML({ admin: true, tick: false, phone: true, who: 'Anvil' })); await p.waitForTimeout(200)
  console.log('reveal', await reveal(p, 'cell-shaft-2026-01-23')); await ring(p, 'cell-shaft-2026-01-23')
  const fit = await p.evaluate(() => { const h = document.querySelector('.bidsheet-hd'); return [h.scrollWidth, h.clientWidth] }); console.log('phone title bar fit', fit)
  await shot(p, 'r7-12-bid-admin-phone-clean')
  const m = M(p, true)
  await m('.zz-tick', 1); await m('.zz-leaves', 2); await m('.zz-also', 3)
  await shot(p, 'r7-12-bid-admin-phone')
  await ctx.close()
}
// r7-13 — an entry already placed: the admin taps Ranger's approved LL on Mon 19 Jan
{
  const { ctx, p } = await scene(1536, 860, false, 'admin')
  LEFT = LEFTS.Ranger
  await gridTo(p, '2026-01-12', 'bane'); await p.click(q('cell-bane-2026-01-19')); await p.waitForTimeout(600)
  await stage(p, false, { under: UNDER }); await required(p)
  await zfOf(p); await fill(p, entryHTML()); await dock(p); await p.waitForTimeout(200)
  await ring(p, 'cell-bane-2026-01-19')
  await shot(p, 'r7-13-entry-desk-clean')
  const m = M(p, false)
  await m('.zz-who', 1); await m('.zz-decide', 2); await m('.zz-doc', 3); await m('.zz-leaves', 4)
  await shot(p, 'r7-13-entry-desk')
  await ctx.close()
}
// r7-14, r7-15 — Approvals on a desktop, docked; on "New 3", then on All with "Approve all" asking again
for (const v of ['new', 'armed']) {
  const { ctx, p } = await scene(1536, 860, false, 'admin')
  if (await p.locator(q('figures-toggle')).count()) { await p.click(q('figures-toggle')); await p.waitForTimeout(400) }
  await gridTo(p, '2026-01-19', 'bane')
  await stage(p, false, { under: UNDER, apNew: v === 'new' ? 3 : 0 }); await required(p)
  console.log('approvals overflow', await approvals(p, apDesk(FIGS, v === 'new' ? { newOnly: true } : { armed: true, cut: true }), false))
  const name = v === 'new' ? 'r7-14-approvals-desk' : 'r7-15-approvals-armed-desk'
  await shot(p, name + '-clean')
  const m = M(p, false), qm = Qm(p)
  if (v === 'new') {
    await m('.zz-apw', 1, { off: -3 }); await m('.zz-new3', 2); await qm('.zz-sub', 'Q1 — your answer first', { right: true }); await m('.zz-also', 9)
    await m('.zz-months', 3); await m('.zz-cols', 4); await m('.zz-first .zpk', 5); await m('.zz-doci', 6)
    await m('.zz-apall', 7); await m('.zz-ap', 8); await m('.zz-rf', 8)
  } else {
    await m('.zz-apall', 1); await m('.zz-stack', 2); await m('.zz-apw .cut', 3)
  }
  await shot(p, name)
  await ctx.close()
}
// r7-16 — Approvals on a phone: each request two lines, the column headings drawn once
{
  const { ctx, p } = await scene(390, 844, true, 'admin')
  await stage(p, true, { admin: true, under: UNDER }); await required(p)
  console.log('phone approvals overflow', await approvals(p, apPhone(FIGS, {}), true))
  await shot(p, 'r7-16-approvals-phone-clean')
  const m = M(p, true)
  await m('.zz-card', 1); await m('.zz-cols', 2); await m('.zz-months', 3); await m('.zz-stack', 4); await m('.zz-new3', 'Q1')
  await shot(p, 'r7-16-approvals-phone')
  await ctx.close()
}
// r7-17 — "Open for bidding" on the admin's phone: Jan – Mar open, a drag from May to Aug in progress
// r7-17b — the same with nothing open
for (const v of ['drag', 'none']) {
  const { ctx, p } = await scene(390, 844, true, 'admin')
  await p.tap(q('bid-window')); await p.waitForTimeout(600)
  await stage(p, true, { admin: true, under: UNDER, closed: v === 'none' })
  await required(p); if (v === "none") await p.evaluate(() => document.querySelectorAll(".lw-bidbox").forEach(b => { b.style.display = "none" }))
  await zfOf(p)
  await fill(p, openHTML(v === 'none' ? { on: [], lines: [] } : { on: [0, 1, 2], drag: [4, 5, 6, 7], lines: [['1 Jan – 31 Mar', '90 days']] }))
  if (v !== 'none') await finger(p, 4, 7)
  const name = v === 'none' ? 'r7-17b-open-none-phone' : 'r7-17-open-phone'
  await shot(p, name + '-clean')
  const m = M(p, true), qm = Qm(p)
  if (v === 'none') { await m('.zchip.shut', 1); await m('.zz-empty', 2) }
  else { await m('.zz-mos', 1); await m('.zmb.drag', 2, { nth: 3 }); await m('.zz-line', 3) }
  await shot(p, name)
  await ctx.close()
}
// r7-18 — the same on a desktop, after the drag: two stretches, the chip "+1"
{
  const { ctx, p } = await scene(1536, 860, false, 'admin')
  await p.click(q('bid-window')); await p.waitForTimeout(600)
  await stage(p, false, { under: UNDER, more: 1 }); await required(p)
  await zfOf(p)
  await fill(p, openHTML({ one: true, on: [0, 1, 2, 4, 5, 6, 7], lines: [['1 Jan – 31 Mar', '90 days'], ['1 May – 31 Aug', '123 days']] }))
  await shot(p, 'r7-18-open-desk-clean')
  const m = M(p, false)
  await m('.zz-mos', 1); await m('.zz-line', 2); await m('.zchip.open', 3)
  await shot(p, 'r7-18-open-desk')
  await ctx.close()
}
// r7-19 — the clash note on the admin's phone (D823, D827 — its design of record), its words after D1177. INVENTED,
// said so: the three clashes (the demo holds none); the names and dates are the demo squadron's.
{
  const { ctx, p } = await scene(390, 844, true, 'admin')
  await stage(p, true, { admin: true, under: UNDER }); await required(p)
  await p.evaluate(() => {
    const rows = [
      ['Basher', 'Tue 27 Jan', 'Decide the bid', 'The input is OML, but the bid is LL', ''],
      ['Ranger', 'Mon 19 Jan', 'Change the approved leave', 'The input is HL, but the bid is approved LL', 'zz-new1'],
      ['Cinch', 'Thu 22 Jan', 'Change the leave on Inputs', 'The input is C, but the bid is LL', ''],
    ]
    const names = [...document.querySelectorAll('[data-testid^="person-"]')].map(e => e.textContent.replace(/(IR|IP|IW|OCU|GND|A|B|C|D)\s*$/, '').trim())
    const n = document.createElement('div'); n.className = 'clashnote'
    n.innerHTML = `<button type="button" class="clashline" aria-expanded="true"><span class="clash-n"><span aria-hidden="true">⚠ </span>3 clashes with the schedule</span> <span class="clash-toggle clash-up">Hide</span></button><div class="clashlist">${rows.map(([w, d, go, what, c]) => `<button type="button" class="clashrow ${c}"><span class="clash-who">${w}</span><span class="clash-day">${d}</span><span class="clash-do">${go} ›</span><span class="clash-what">${what}</span></button>`).join('')}<span class="clashsizer" aria-hidden="true">${names.map(x => `<i>${x}</i>`).join('')}</span></div>`
    document.querySelector('.zrow3').after(n)
  })
  await p.waitForTimeout(250)
  await shot(p, 'r7-19-clash-phone-clean')
  const m = M(p, true)
  await m('.zz-new1', 1, { off: 3 }); await p.evaluate(() => { const t = [...document.querySelectorAll('.zz-tag')].pop(); t.style.top = (parseFloat(t.style.top) - 9) + 'px' })
  await shot(p, 'r7-19-clash-phone')
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
