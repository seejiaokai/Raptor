// M4's look before its build (27 Oct 26): Approvals AS A TAB (D1254 narrowed D1196 and D1231 after r7-14 to r7-16 drew it
// as a window docked over the grid). The tab's page was never drawn; this draws it, with every ruling of the list in
// place (D1152, D1178, D1180, D1181, D1184, D1189, D1192, D1197, D1231, D1246 halves .5, D1217 "pending", D1361 the lit
// decided button, A4 "tap again", A11 the phone's two lines, B12 a posted-out man's tag).
//   r22-1-desk   the tab, "All" — the page takes the grid card's place, as the Balances page does (r14-bal-1-desk)
//   r22-2-desk   "New 3" — the new lines' dot and "Also since you last looked"
//   r22-3-desk   one line approved, one refused (lit, staying in place), Approve all armed: "Approve 13 — tap again"
//   r22-4-desk   a request's dates tapped: the Grid tab, the cell ringed, the slim "Back to Approvals" bar at the foot
//   r22-5-phone  the tab on a phone, "All"
//   r22-6-phone  the phone after a date tap: the slim bar
// Drawn INTO the real local build of main (36b7beaa9), the clock Thu 8 Jan 26; the top row, the card and the grid are the
// app's own. INVENTED, said so on the page: every request (today's demo war holds no pending bid), its figures, when it
// was placed, its documents, the posting tag. Nothing here is built into the app.
//   cd raptor-port && npm run build && npx vite preview --port 4197 --strictPort
//   LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r22-approvals-tab.mjs
import { join } from 'node:path'
import { chromium, newPage, signIn, OUT, mark, unmark, gridTo, errs } from './full-lib.mjs'

const browser = await chromium.launch()
const DOT = '<i class="zd" aria-hidden="true"></i>'
const CLIP = '<svg viewBox="0 0 16 16" width="1.2em" height="1.2em" aria-hidden="true"><path d="M10.5 4.5l-5 5a1.6 1.6 0 0 0 2.3 2.3l5.6-5.6a2.9 2.9 0 0 0-4.1-4.1L3.7 7.7a4.2 4.2 0 0 0 5.9 5.9l4.4-4.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
const APPR = '<svg class="btnglyph" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.2h6M3 8h4.5M3 11.8h3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M9 10.6l1.9 1.9L14 8.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
// look F (D1175)
const KF = { LL: ['242,200,110', '#FFF1CF', .22], OL: ['226,146,38', '#FFE7C7', .48], OIL: ['70,196,108', '#DDF8E6', .38], CARE: ['138,150,255', '#DCE0FF', .32] }
const FAM = { LL: 'LL', OL: 'OL', OIL: 'OIL', CCL: 'CARE' }
const kv = k => { const [h, ink, f] = KF[FAM[k]]; return `--h:${h};--ink:${ink};--f:${f}` }
const kbox = (k, st = 'wt') => `<span class="zkb ${st === 'rf' ? 'kx' : st}" style="${kv(k)}"><b>${k}</b></span>`
const CHIP = { sxo: ['#E5B53B', '#2a1e02'], ins: ['#9F4ADF', '#fff'], c: ['#3BC6E8', '#04222b'], a: ['#CA4750', '#fff'] }
// the line's person is the app's OWN puck (D1180, the design guide's lesson 25; his correction of 27 Oct 26 on the first
// drawing's look-alike): a placeholder the page fills with window.puck(id), the schedule's puck as sync.ts puckHtml draws it
const puck = (cs, id, po) => `<span class="zpk"><span class="zreal" data-id="${id}" data-cs="${cs}"></span>${po ? '<em class="zpo">PO 1 Mar</em>' : ''}</span>`

// INVENTED: fifteen pending requests, oldest first — cs, row id, seat, cat, chip, kind, desk dates, phone dates, days,
// balance, lowest-avail lines [[row, figure, tone]], placed, documents, new, posted-out tag
const REQ = [
  ['Cinch', 'snap', 'pilot', 'IP', 'sxo', 'LL', 'Thu 22 – Fri 23 Jan', '22–23 Jan', '2 days', '-2', [['P', '24.5', 'amb']], '2 Jan 09:40', 0],
  ['Gambit', 'bruise', 'pilot', 'C', 'c', 'LL', 'Fri 23 Jan, AM', '23 Jan AM', '0.5 day', '8', [['P', '24.5', 'amb']], '3 Jan 11:05', 1],
  ['Warden', 'nact', 'pilot', 'IP', 'sxo', 'OIL', 'Fri 23 Jan, AM', '23 Jan AM', '0.5 day', 'OIL -0.5', [['P', '24.5', 'amb']], '3 Jan 16:20', 0],
  ['Warden', 'nact', 'pilot', 'IP', 'sxo', 'LL', 'Fri 23 Jan, PM', '23 Jan PM', '0.5 day', '-0.5', [['P', '24.5', 'amb']], '3 Jan 16:21', 0],
  ['Ranger', 'bane', 'pilot', 'IP', 'sxo', 'LL', 'Mon 26 – Tue 27 Jan', '26–27 Jan', '2 days', '14.5', [['P', '23', 'red']], '4 Jan 08:30', 2],
  ['Anvil', 'shaft', 'pilot', 'IP', 'sxo', 'LL', 'Tue 27 Jan', '27 Jan', '1 day', '-1.5', [['P', '23', 'red'], ['IP', '3', 'amb'], ['SXO', '1', 'red']], '5 Jan 10:12', 0],
  ['Drifter', 'slipway', 'pilot', 'A', 'sxo', 'LL', 'Tue 27 Jan', '27 Jan', '1 day', '25', [['P', '23', 'red']], '5 Jan 14:48', 1],
  ['Basher', 'glass', 'wso', 'IW', 'sxo', 'LL', 'Tue 27 Jan', '27 Jan', '1 day', '-1', [['W', '17', '']], '6 Jan 09:02', 1],
  ['Blade', 'slash', 'pilot', 'IP', 'ins', 'LL', 'Mon 2 Feb', '2 Feb', '1 day', '4.5', [['P', '27', '']], '6 Jan 12:30', 0, 0, 1],
  ['Blade', 'slash', 'pilot', 'IP', 'ins', 'CCL', 'Tue 3 Feb, PM', '3 Feb PM', '0.5 day', 'CCL 1.5', [['P', '27.5', '']], '6 Jan 12:31', 0, 0, 1],
  ['Drifter', 'slipway', 'pilot', 'A', 'sxo', 'OIL', 'Tue 10 Feb, AM', '10 Feb AM', '0.5 day', 'OIL 1.5', [['P', '28', '']], '6 Jan 17:45', 0],
  ['Gambit', 'bruise', 'pilot', 'C', 'c', 'OL', 'Mon 23 – Fri 27 Feb', '23–27 Feb', '5 days', '3', [['P', '27', '']], '7 Jan 08:15', 0],
  ['Reaper', 'dice', 'pilot', 'IR', 'sxo', 'LL', 'Tue 27 Jan', '27 Jan', '1 day', '12', [['P', '23', 'red']], '7 Jan 18:10', 0, 1],
  ['Ranger', 'bane', 'pilot', 'IP', 'sxo', 'LL', 'Thu 29 Jan, AM', '29 Jan AM', '0.5 day', '14.5', [['P', '27.5', '']], '7 Jan 21:30', 0, 1],
  ['Static', 'wolf', 'wso', 'IW', 'ins', 'LL', 'Thu 8 Jan', '8 Jan', '1 day', '14', [['W', '17', '']], '8 Jan 07:55', 1, 1],
]
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const HAS = ['Jan', 'Feb']

const CSS = `
.zsp{flex:1}
.zlab{font:600 11px system-ui;letter-spacing:.14em;color:#8a96a3}
.zd{display:inline-block;flex:none;width:7px;height:7px;border-radius:50%;background:#3bc6e8;font-style:normal}
#page-leavewar .lw-tabs .intab .n{font-style:normal;font:800 10.5px/1 system-ui;padding:2px 6px;border-radius:9px;background:rgba(59,198,232,.16);color:#5fd0e6;margin-left:6px}
#page-leavewar .card.zz-hide > :not(.zap){display:none!important}
.zap{color:#c9d1d9;font:13px system-ui;display:flex;flex-direction:column}
.zap .hd{display:flex;align-items:baseline;gap:12px;padding:14px 16px 8px}
.zap .hd b{font:800 17px system-ui;letter-spacing:.04em;color:#f1f4f7}.zap .hd .sub{color:#8a96a3;font:500 13px system-ui}
.zap .fl{display:flex;align-items:center;gap:4px;padding:6px 16px 10px;border-bottom:1px solid #2a323c;white-space:nowrap}
.zap .mb{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:30px;padding:0 8px;border-radius:7px;border:1px solid #2f3a46;background:#12161b;color:#e6edf3;font:600 12px system-ui;white-space:nowrap}
.zap .mb.on{border-color:rgba(59,198,232,.55);background:rgba(59,198,232,.14);color:#5fd0e6}.zap .mb.dim{color:#5c6773;border-color:#222a33;background:#0f1317}
.zap .vs{width:1px;height:20px;background:#2f3a46;margin:0 8px}
.zap .apall{display:inline-flex;align-items:center;height:32px;padding:0 16px;border-radius:8px;background:#3bc6e8;color:#04222b;font:800 13px system-ui;border:0;white-space:nowrap}
.zap .apall.armed{box-shadow:0 0 0 2px #0b0d10,0 0 0 4px #3bc6e8}
.zap .list{padding:0 16px 16px}
/* on a wide desktop the line stays one eye-span: the decide buttons sit near the figures, not at the far edge */
.zap:not(.ph) .fl,.zap:not(.ph) .list{max-width:1240px;box-sizing:border-box}
.zap .zr{display:flex;align-items:center;gap:12px;min-height:50px;border-bottom:1px solid #222a33;white-space:nowrap}
.zap .zr.h{min-height:30px;font:600 9.5px system-ui;letter-spacing:.12em;color:#8a96a3}
.zpk{display:inline-flex;align-items:center;gap:4px;width:118px;flex:none;position:relative}
.zpk > .puck{height:auto!important;max-height:none;align-self:center;flex:none}
.zpk .zpo{position:absolute;left:0;top:100%;margin-top:1px;font:700 9px system-ui;font-style:normal;color:#F2C879;letter-spacing:.04em}
.zkb{display:inline-flex;align-items:center;justify-content:center;flex:none;width:32px;height:22px;border-radius:4px;box-sizing:border-box;font:800 9.5px system-ui}
.zkb.wt{color:rgb(var(--h));outline:1px dashed rgba(var(--h),.95);outline-offset:-1px}
.zkb.ok{background:rgba(var(--h),var(--f));color:var(--ink);box-shadow:inset 0 0 0 1px rgba(var(--h),.85)}
.zkb.kx{color:#7d8894;box-shadow:inset 0 0 0 1px #4a5560}.zkb.kx b{text-decoration:line-through}
.zap .k{width:32px;flex:none}
.zap .dt{width:170px;flex:none;color:#5fd0e6;font-weight:600}.zap .dt::after{content:' ›'}
.zap .zr.h .dt{color:inherit;font-weight:inherit}.zap .zr.h .dt::after{content:''}
.zap .c{flex:none;font-size:12.5px;font-variant-numeric:tabular-nums}.zap .c b{color:#fff}.zap .dy{width:62px}.zap .bl{width:84px;text-align:right;padding-right:18px}
.zap .av{width:104px;display:flex;flex-direction:column;gap:2px;padding:6px 0}.zap .pl{width:96px;color:#9aa5b1}
.zap .av .ln{display:grid;grid-template-columns:36px auto;column-gap:4px}
.zap .amb{color:#F2C879!important}.zap .red{color:#FF7A84!important}.zap .neg{color:#FF7A84!important}
.zap .doc{display:inline-flex;align-items:center;justify-content:center;width:32px;height:30px;flex:none;border-radius:7px;color:#c9d1d9}.zap .doc.has{border:1px solid #2f3a46;background:#12161b}.zap .doc em{font-style:normal;font:700 10px system-ui}
.zap .ap,.zap .rf{display:inline-flex;align-items:center;justify-content:center;flex:none;height:32px;border-radius:8px;font:700 13px system-ui;border:1px solid #2f3a46;background:#12161b}
.zap .ap{width:92px;color:#7ee2a0}.zap .rf{width:84px;color:#FF8A92}
.zap .ap.lit{background:#3fbf6f;border-color:#3fbf6f;color:#06210f}.zap .rf.lit{background:#e5535f;border-color:#e5535f;color:#2a0507}
.zap .nd{width:9px;flex:none;display:flex}
.zap .zgh{display:flex;align-items:center;gap:8px;height:36px;margin-top:16px;border-bottom:1px solid #2a323c}
.zap .wh{width:300px;flex:none;color:#c9d1d9}
/* the phone (A11): each request two lines, the figures under headings drawn once */
.zap.ph .hd{padding:12px 12px 6px}.zap.ph .fl{flex-direction:column;align-items:stretch;gap:6px;padding:6px 12px 10px}
.zap.ph .mos{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}.zap.ph .mos .mb{padding:0;height:32px;font-size:12px}
.zap.ph .dr2{display:flex;align-items:center;gap:8px}
.zap.ph .list{padding:0 12px 12px}
.zap.ph .g2{display:grid;grid-template-columns:52px 64px minmax(0,1fr) 78px;column-gap:8px;align-items:start}
.zap.ph .hh{padding:8px 0 6px;border-bottom:1px solid #2a323c;font:600 9.5px system-ui;letter-spacing:.1em;color:#8a96a3}
.zap.ph .card2{padding:8px 0;border-bottom:1px solid #222a33;display:flex;flex-direction:column;gap:6px}
.zap.ph .l1{display:flex;align-items:center;gap:5px;white-space:nowrap}
.zap.ph .zpk{width:auto;min-width:0}
.zap.ph .l1 .dt{width:auto;flex:1;min-width:0;font-size:12.5px;overflow:hidden;text-overflow:ellipsis}
.zap.ph .ap{width:66px;font-size:12.5px}.zap.ph .rf{width:58px;font-size:12.5px}
.zap.ph .doc{width:28px}
.zap.ph .l2{font-size:12.5px;color:#c9d1d9;font-variant-numeric:tabular-nums}.zap.ph .l2 b{color:#fff}.zap.ph .l2 .pl{color:#9aa5b1}
.zap.ph .l2 .av{padding:0;display:flex;flex-direction:column;gap:1px}
/* the slim bar after a date tap (D1231 as D1254 narrows it — the Grid tab, the bar at the foot, desktop and phone) */
.zslim{position:fixed;left:50%;transform:translateX(-50%);bottom:10px;z-index:90;display:flex;align-items:center;gap:14px;height:46px;padding:0 16px;border-radius:12px;background:#161b22;border:1px solid #2a323c;box-shadow:0 10px 30px rgba(0,0,0,.6);color:#c9d1d9;font:13px system-ui;white-space:nowrap}
.zslim b{font:800 15px system-ui;letter-spacing:.04em;color:#f1f4f7}.zslim .sub{color:#8a96a3}.zslim .bk{color:#5fd0e6;font:700 14px system-ui;margin-left:10px}.zslim .x{color:#9aa5b1;font-size:16px}
.zslim.ph{left:8px;right:8px;transform:none}
/* the just-added ring (D860) round a waiting box drawn into one cell */
#page-leavewar .zf{position:absolute;left:2px;right:2px;top:2px;bottom:2px;display:flex;align-items:center;justify-content:center;border-radius:4px;z-index:2;pointer-events:none;box-sizing:border-box}
#page-leavewar .zf b{font:700 10px/1 system-ui}
#page-leavewar .zf.wt{color:rgb(var(--h));outline:1px dashed rgba(var(--h),.95);outline-offset:-1px}
#page-leavewar .zf.ring{box-shadow:0 0 0 2px #3b8ef0}
`

const fmtBal = v => { const m = /^([A-Z]+ )?(-?[\d.]+)$/.exec(v); if (!m) return v; const n = parseFloat(m[2]); return `${m[1] ? `<small style="color:#8a96a3;font-size:10px">${m[1].trim()}</small> ` : ''}<b class="${n < 0 ? 'neg' : ''}">${m[2].replace('-', '−')}</b>` }
const low = (lines, flex) => lines.map(([n, v, t]) => `<span class="ln"${flex ? ' style="display:flex;gap:4px"' : ''}><span class="${t}">${n}</span><b class="${t}">${v}</b></span>`).join('')
const doc = n => n ? `<span class="doc has zz-doc">${CLIP}${n > 1 ? `<em>${n}</em>` : ''}</span>` : '<span class="doc"></span>'
const btns = (st) => `<span class="ap${st === 'ok' ? ' lit' : ''}">${st === 'ok' ? 'Approved' : 'Approve'}</span><span class="rf${st === 'rf' ? ' lit' : ''}">${st === 'rf' ? 'Refused' : 'Refuse'}</span>`

function desk(o) {
  const rows = REQ.map((r, i) => [r, i]).filter(([r]) => !o.newOnly || r[13])
  const pend = rows.filter(([, i]) => !(o.state && o.state[i])).length
  const head = `<div class="hd"><b>Approvals</b><span class="sub zz-sub">15 pending · 3 new since you last looked, Wed 7 Jan 16:40</span></div>`
  const fl = `<div class="fl"><span class="mb${o.newOnly ? ' on' : ''} zz-new">${DOT}New 3</span><span class="vs"></span><span class="zlab" style="margin-right:6px">DATES</span><span class="zz-months" style="display:inline-flex;gap:4px"><span class="mb${o.newOnly ? '' : ' on'}">All</span>${MON.map(m => `<span class="mb${HAS.includes(m) ? '' : ' dim'}">${m}</span>`).join('')}</span><span class="mb" style="margin-left:4px">Pick dates…</span><span class="zsp"></span><button class="apall${o.armed ? ' armed' : ''} zz-apall">${o.armed ? `Approve ${pend} — tap again` : `Approve all ${pend}`}</button></div>`
  const hdr = `<div class="zr h zz-cols"><span class="nd"></span><span class="zpk" style="background:none">NAME</span><span class="k">KIND</span><span class="dt">DATES</span><span class="c dy">DAYS</span><span class="c bl">LVE BAL</span><span class="c av" style="padding:0">LOWEST AVAIL</span><span class="c pl" style="color:inherit">PLACED</span><span class="doc"></span><span class="zsp"></span><span style="width:188px"></span></div>`
  const lines = rows.map(([r, i]) => { const st = o.state?.[i]; return `<div class="zr zz-line-${i}"><span class="nd">${r[13] ? DOT : ''}</span>${puck(r[0], r[1], r[14])}<span class="k">${kbox(r[5], st || 'wt')}</span><span class="dt zz-dt-${i}">${r[6]}</span><span class="c dy">${r[8]}</span><span class="c bl">${fmtBal(r[9])}</span><span class="c av">${low(r[10])}</span><span class="c pl">${r[11]}</span>${doc(r[12])}<span class="zsp"></span><span class="zz-btns-${i}" style="display:inline-flex;gap:8px">${btns(st)}</span></div>` }).join('')
  // INVENTED: what changed since he last looked that needs no decision (the notifications register's P9, D1231's reading)
  const also = o.newOnly ? `<div class="zgh zz-also"><span class="zlab">ALSO SINCE YOU LAST LOOKED</span><span style="color:#8a96a3;font-size:12px">· nothing to decide</span></div>` +
    [['Cinch', 'snap', 'LL', 'Thu 29 Jan', 'Bid withdrawn by Cinch', '7 Jan 17:20', 'rf'], ['Basher', 'glass', 'LL', 'Mon 2 Feb', 'Filed on the Inputs page · approved', '7 Jan 19:05', 'ok']]
      .map(([cs, id, k, d, what, when, st]) => `<div class="zr"><span class="nd">${DOT}</span>${puck(cs, id)}<span class="k">${kbox(k, st)}</span><span class="dt">${d}</span><span class="wh">${what}</span><span class="c pl">${when}</span></div>`).join('') : ''
  return head + fl + `<div class="list">${hdr}${lines}${also}</div>`
}
function phone(o) {
  const rows = REQ.map((r, i) => [r, i])
  const head = `<div class="hd"><b>Approvals</b><span class="sub">15 pending · 3 new</span></div>`
  const fl = `<div class="fl"><div class="mos zz-months"><span class="mb zz-new">${DOT}New 3</span><span class="mb on">All</span>${MON.map(m => `<span class="mb${HAS.includes(m) ? '' : ' dim'}">${m}</span>`).join('')}</div><div class="dr2"><span class="mb" style="height:32px">Pick dates…</span><span class="zsp"></span><button class="apall zz-apall">Approve all 15</button></div></div>`
  const hh = '<div class="g2 hh zz-cols"><span>DAYS</span><span>LVE BAL</span><span>LOWEST AVAIL</span><span>PLACED</span></div>'
  const cards = rows.map(([r, i]) => `<div class="card2 zz-card-${i}"><div class="l1">${puck(r[0], r[1], r[14])}${kbox(r[5])}<span class="dt">${r[7]}</span>${doc(r[12])}${btns()}</div><div class="g2 l2"><span>${r[8]}</span><span>${fmtBal(r[9])}</span><span class="av">${low(r[10], true)}</span><span class="pl">${r[11]}</span></div></div>`).join('')
  return head + fl + `<div class="list">${hh}${cards}</div>`
}

async function stage(p) {
  await p.evaluate(([css, APPR]) => {
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s)
    // the tab row gains Approvals between Grid and OIL (D1254) — cloned from the app's own OIL tab
    const row = document.querySelector('#page-leavewar .lw-tabs'), [g, o] = row.querySelectorAll('.intab')
    const a = o.cloneNode(true); a.removeAttribute('data-testid'); a.setAttribute('data-zz', 'tab-appr')
    a.innerHTML = `${APPR}<span class="intab-t">Approvals</span><i class="n">15</i>`
    g.after(a)
  }, [CSS, APPR])
}
const tabOn = (p, which) => p.evaluate(which => {
  for (const t of document.querySelectorAll('#page-leavewar .lw-tabs .intab')) t.setAttribute('aria-selected', String(which === 'appr' ? t.dataset.zz === 'tab-appr' : t.dataset.testid === 'lw-tab-grid'))
}, which)
const page = (p, html, ph) => p.evaluate(([html, ph]) => {
  const card = document.querySelector('#page-leavewar .stage > .card')
  card.querySelector('.zap')?.remove(); card.classList.add('zz-hide')
  const d = document.createElement('div'); d.className = 'zap' + (ph ? ' ph' : ''); d.innerHTML = html; card.prepend(d)
  for (const z of d.querySelectorAll('.zreal')) { const h = window.puck ? window.puck(z.dataset.id, false, ph, false) : ''; z.outerHTML = (h || `<span class="ll-cs">${z.dataset.cs}</span>`).replace(' tabindex="0"', '') }
  window.scrollTo(0, 0)
  return [...d.querySelectorAll('.zr,.l1,.fl')].map(r => r.scrollWidth - r.clientWidth).filter(x => x > 1).length
}, [html, ph])
const unpage = p => p.evaluate(() => { const c = document.querySelector('#page-leavewar .stage > .card'); c.querySelector('.zap')?.remove(); c.classList.remove('zz-hide') })
const shot = async (p, name, clip) => { await p.mouse.move(2, 2); await p.waitForTimeout(250); await p.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); console.log('shot', name) }

// ---------- desktop (his PC: 1536 × 860 at 125%) ----------
{
  const { ctx, p } = await newPage(browser, 1536, 860, false)
  await signIn(p, 'admin'); await stage(p)
  await tabOn(p, 'appr')
  console.log('overflow', await page(p, desk({}), false))
  await mark(p, '[data-zz="tab-appr"]', '1', { num: true })
  await mark(p, '.zz-months', '2', { num: true })
  await mark(p, '.zz-cols', '3', { num: true })
  await mark(p, '.zz-line-5 .av', '4', { num: true })
  await mark(p, '.zz-line-8 .zpk', '5', { num: true })
  await shot(p, 'r22-1-desk'); await unmark(p)

  await page(p, desk({ newOnly: true }), false)
  await mark(p, '.zz-new', '1', { num: true }); await mark(p, '.zz-also', '2', { num: true })
  await shot(p, 'r22-2-desk'); await unmark(p)

  await page(p, desk({ state: { 0: 'ok', 1: 'rf' }, armed: true }), false)
  await mark(p, '.zz-btns-0', '1', { num: true }); await mark(p, '.zz-btns-1', '2', { num: true }); await mark(p, '.zz-apall', '3', { num: true })
  await shot(p, 'r22-3-desk', { x: 0, y: 140, width: 1536, height: 330 }); await unmark(p)

  // a tap on Reaper's dates (Tue 27 Jan): the Grid tab, the grid there, his cell ringed, the slim bar
  await unpage(p); await tabOn(p, 'grid')
  await gridTo(p, '2026-01-20', 'dice')
  await p.evaluate(([v]) => {
    const c = document.querySelector('[data-testid="cell-dice-2026-01-27"]'); if (!c) return
    if (getComputedStyle(c).position === 'static') c.style.position = 'relative'
    c.insertAdjacentHTML('beforeend', `<span class="zf wt ring zz-ring" style="${v}"><b>LL</b></span>`)
    document.body.insertAdjacentHTML('beforeend', `<div class="zslim zz-slim">${'<i class="zd"></i>'}<b>Approvals</b><span class="sub">15 pending · 3 new</span><span class="bk">Back ▴</span><span class="x">✕</span></div>`)
  }, [kv('LL')])
  await p.evaluate(() => document.querySelector('.zz-ring')?.scrollIntoView({ block: 'center', inline: 'nearest' }))
  await mark(p, '[data-testid="lw-tab-grid"]', '1', { num: true }); await mark(p, '.zz-ring', '2', { num: true, off: 4 }); await mark(p, '.zz-slim', '3', { num: true })
  await shot(p, 'r22-4-desk'); await unmark(p)
  await ctx.close()
}
// ---------- phone (his iPhone's 402 × 874) ----------
{
  const { ctx, p } = await newPage(browser, 402, 874, true)
  await signIn(p, 'admin'); await stage(p)
  await tabOn(p, 'appr')
  console.log('overflow phone', await page(p, phone({}), true))
  await mark(p, '[data-zz="tab-appr"]', '1', { num: true }); await mark(p, '.zz-card-5 .av', '2', { num: true }); await mark(p, '.zz-card-8 .zpk', '3', { num: true })
  await shot(p, 'r22-5-phone'); await unmark(p)
  await unpage(p); await tabOn(p, 'grid')
  await p.evaluate(() => document.body.insertAdjacentHTML('beforeend', '<div class="zslim ph zz-slim"><i class="zd"></i><b>Approvals</b><span class="sub">15 pending · 3 new</span><span class="zsp" style="flex:1"></span><span class="bk">Back ▴</span><span class="x">✕</span></div>'))
  await mark(p, '.zz-slim', '1', { num: true })
  await shot(p, 'r22-6-phone'); await unmark(p)
  await ctx.close()
}
// ---------- r22-7-bell-phone: the member's bell with M4's lines (D1142, D1214, D1216 — the words of r7-28) and the two
// question Q2 (an admin's leave placed already approved on his row — the register's P2), and bidding that ends by its date
// alone, which rings as D1214 ruled P7 ("its last day passes"), with no name ----------
{
  const { ctx, p } = await newPage(browser, 402, 874, true)
  await signIn(p, 'member')
  await p.tap('#notifyBell'); await p.waitForTimeout(500)
  await p.evaluate(() => {
    const list = document.querySelector('.bell-list'); if (!list) return
    list.querySelector('.bl-empty')?.remove()
    const line = (unread, name, day, what, ago, k, faded) => `<button type="button" class="bl-line${unread ? ' unread' : ''}"${k ? ` data-zk="${k}"` : ''}${faded ? ' style="opacity:.38"' : ''}><span class="bl-dot"></span><span class="bl-main"><span class="bl-t"><b class="bl-name">${name}</b><i class="bl-day">${day}</i></span><span class="bl-what">${what}</span></span><span class="bl-ago">${ago}</span></button>`
    list.insertAdjacentHTML('afterbegin',
      line(1, 'Your leave', 'Mon 9 Mar', 'LL added and approved · Saber', '5m', 'q2') +
      line(1, 'Your leave', 'Mon 19 – Wed 21 Jan', 'LL approved · Saber', '20m') +
      line(1, 'Your leave', 'Mon 2 Feb', 'LL refused · Saber', '20m') +
      line(0, 'Your leave', 'Mon 26 – Tue 27 Jan', 'Approval of LL taken back · Saber', '3d') +
      line(0, 'Leave War', '8 Jan – 31 Mar', 'Bidding closed · its dates ended', '1d', 'q3') +
      line(0, 'Leave War', '8 Jan – 31 Mar', 'Bidding open · Saber', '3w'))
    if (!list.querySelector('.bl-foot')) list.insertAdjacentHTML('beforeend', '<div class="bl-foot"><button type="button" class="abtn sm ghost">Mark all read</button></div>')
  })
  const ok = await p.evaluate(() => !!document.querySelector('[data-zk="q2"]'))
  if (!ok) console.warn('BELL LIST NOT FOUND — r22-7 not drawn')
  await mark(p, '[data-zk="q2"]', 'Q2', { right: false, off: -2, below: true }); await mark(p, '[data-zk="q3"]', 'as ruled (D1214): no name', { off: -2, below: true })
  await shot(p, 'r22-7-bell-phone', { x: 0, y: 0, width: 402, height: 440 }); await unmark(p)
  await ctx.close()
}
console.log('page errors', errs.length, errs.slice(0, 3))
await browser.close()
