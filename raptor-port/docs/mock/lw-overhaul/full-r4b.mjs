// Round 4, question 7 and 9 redrawn after his points (21 Oct 26): the Approvals list with the person's puck, the kind as
// its coloured box (D1180), "LVE Bal" (D1181), a document icon (D1178), the period's months (D1184) and each line's own
// seat figure (Avail P for a pilot, Avail W for a WSO); the admin's bid window with its leave buttons in their colours
// (D1183) and the "Approve what I enter" tick placed two ways (D1182); the Inputs list's type filter picking a whole
// family (D1179). Drawn over the round-4 pictures in full/ (and one real Inputs list picture); nothing runs the app.
// Run from raptor-port with NODE_PATH at a node_modules that has @playwright/test; pictures to OUT.
import { writeFileSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, OUT, errs, PINK } from './full-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
const pic = f => 'data:image/png;base64,' + readFileSync(join(HERE, f)).toString('base64')

// look F (D1175) — [r,g,b of the kind, ink, fill]
const KIND = { LL: ['242,200,110', '#FFF1CF', .22], OL: ['226,146,38', '#FFE7C7', .48], OIL: ['70,196,108', '#DDF8E6', .38],
  CCL: ['138,150,255', '#DCE0FF', .32], FCL: ['138,150,255', '#DCE0FF', .32], PL: ['138,150,255', '#DCE0FF', .32],
  EL: ['138,150,255', '#DCE0FF', .32], CL: ['138,150,255', '#DCE0FF', .32] }
const box = (k, mk) => { const [h] = KIND[k]; return `<span class="kb" style="--h:${h}"${mk ? ` data-mk="${mk}"` : ''}><b>${k}</b></span>` }
const CHIP = { sxo: ['#E5B53B', '#2a1e02'], ins: ['#9F4ADF', '#fff'], c: ['#3BC6E8', '#04222b'], a: ['#CA4750', '#fff'] }
const puck = (cs, seat, cat, chip, mk) => `<span class="pk ${seat}"${mk ? ` data-mk="${mk}"` : ''}><span class="cs">${cs}</span><i style="background:${CHIP[chip][0]};color:${CHIP[chip][1]}">${cat}</i></span>`
const CLIP = '<svg viewBox="0 0 16 16" width="1.25em" height="1.25em" aria-hidden="true"><path d="M10.5 4.5l-5 5a1.6 1.6 0 0 0 2.3 2.3l5.6-5.6a2.9 2.9 0 0 0-4.1-4.1L3.7 7.7a4.2 4.2 0 0 0 5.9 5.9l4.4-4.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
const doc = (n, mk) => n ? `<span class="doc"${mk ? ` data-mk="${mk}"` : ''} title="Open the document">${CLIP}${n > 1 ? `<em>${n}</em>` : ''}</span>` : '<span class="doc none"></span>'
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WAITING = ['Jan']  // the months that hold the requests drawn (all in January)

// the requests: who, seat, CAT, chip colour, kind, dates, days, balance, own-seat figure, placed, documents
const REQ = [
  ['Static', 'wso', 'IW', 'ins', 'LL', 'Thu 8 Jan', '1 day', 14, 'W 17', 'Static, 2 Jan', 1],
  ['Cinch', 'pilot', 'IP', 'sxo', 'LL', 'Thu 22 – Fri 23 Jan', '2 days', -2, 'P 24.5', 'Cinch, 3 Jan', 0],
  ['Gambit', 'pilot', 'C', 'c', 'LL', 'Fri 23 Jan, AM', '½ day', 8, 'P 24.5', 'Gambit, 3 Jan', 1],
  ['Warden', 'pilot', 'IP', 'sxo', 'OIL', 'Fri 23 Jan, AM', '½ day', -0.5, 'P 24.5', 'Warden, 4 Jan', 0, 'OIL'],
  ['Warden', 'pilot', 'IP', 'sxo', 'LL', 'Fri 23 Jan, PM', '½ day', -0.5, 'P 24.5', 'Warden, 4 Jan', 0],
  ['Ranger', 'pilot', 'IP', 'sxo', 'LL', 'Mon 26 – Tue 27 Jan', '2 days', 14.5, 'P 23', 'Ranger, 5 Jan', 2],
  ['Anvil', 'pilot', 'IP', 'sxo', 'LL', 'Tue 27 Jan', '1 day', -1.5, 'P 23', 'Anvil, 5 Jan', 0],
  ['Basher', 'wso', 'IW', 'sxo', 'LL', 'Tue 27 Jan', '1 day', -1, 'W 17', 'Basher, 6 Jan', 1],
  ['Drifter', 'pilot', 'A', 'sxo', 'OL', 'Tue 27 Jan', '1 day', 25, 'P 23', 'Drifter, 6 Jan', 1],
  ['Reaper', 'pilot', 'IR', 'sxo', 'LL', 'Tue 27 Jan', '1 day', 12, 'P 23', 'Reaper, 7 Jan', 0],
  ['Ranger', 'pilot', 'IP', 'sxo', 'LL', 'Thu 29 Jan, AM', '½ day', 14.5, 'P 27.5', 'Ranger, 7 Jan', 0],
]
const bal = (v, k) => `<span class="lab2">${k === 'OIL' ? 'OIL' : 'LVE'} Bal</span> <b class="${v < 0 ? 'neg' : ''}">${v}</b>`
const line = (r, i, phone) => {
  const [cs, seat, cat, chip, k, dates, days, v, own, by, nd, bk, tone, extra, label, mks] = r
  const m = mks || (i === 0 ? ['A', 'B', 'C', 'D'] : [])
  const detail = `${days} · <span${m[2] ? ` data-mk="${m[2]}"` : ''}>${bal(v, bk)}</span> · <span${m[4] ? ` data-mk="${m[4]}"` : ''}>lowest ${label || 'Avail ' + own.split(' ')[0]} <b class="${tone || ''}">${own.split(' ')[1]}</b></span>${extra ? ` · <span${m[5] ? ` data-mk="${m[5]}"` : ''}>${extra}</span>` : ''} · placed by ${by}`
  return phone
    ? `<div class="card"><div class="l1">${puck(cs, seat, cat, chip, m[0])}${box(k, m[1])}<span class="dt">${dates}</span><span class="sp"></span>${doc(nd, m[3])}</div><div class="l2">${detail}</div><div class="l3"><span class="ap">Approve</span><span class="rf">Refuse</span></div></div>`
    : `<div class="row">${puck(cs, seat, cat, chip, m[0])}${box(k, m[1])}<span class="dt">${dates}</span><span class="det">${detail}</span>${doc(nd, m[3])}<span class="ap">Approve</span><span class="rf">Refuse</span></div>`
}
const months = (phone, mk) => `<div class="mos${phone ? ' ph' : ''}"${mk ? ` data-mk="${mk}"` : ''}><span class="mb on">All</span>${MON.map(m => `<span class="mb${WAITING.includes(m) ? '' : ' dim'}">${m}</span>`).join('')}${phone ? '' : '<span class="mb pick">Pick dates…</span>'}</div>`
const sheetBody = phone => phone
  ? `<div class="body ph"><div class="dates"><span class="lab">DATES</span>${months(true, 'E')}<div class="dr2"><span class="mb pick">Pick dates…</span><span class="sp"></span><span class="apall">Approve all 15</span></div></div>${REQ.slice(0, 5).map((r, i) => line(r, i, true)).join('')}</div>`
  : `<div class="body"><div class="dates"><span class="lab">DATES</span>${months(false, 'E')}<span class="sp"></span><span class="apall">Approve all 15</span></div>${REQ.map((r, i) => line(r, i, false)).join('')}</div>`

// the admin's bid window: the leave buttons in their colours (D1183)
const LB = [['LL', '14.5', 735, 855, 78], ['OL', '14.5', 820, 855, 76], ['OIL', '0', 905, 855, 66], ['CCL', '0', 980, 855, 69], ['FCL', '0', 1057, 855, 68], ['PL', '0', 1133, 855, 48], ['EL', '0', 1190, 855, 69], ['CL', '0', 628, 900, 60]]
const leaveButtons = (dy = 0) => LB.map(([k, n, x, y, w]) => { const [h, ink, f] = KIND[k]; return `<span class="lbtn${n === '0' ? ' zero' : ''}" style="left:${x}px;top:${y + dy}px;width:${w}px;--h:${h};--ink:${ink};--f:${f}">${k}<small>${n}</small></span>` }).join('')

const CSS = u => `
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#0b0d10;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.pic{position:relative;--u:${u}px;overflow:hidden}.pic>img{display:block;position:absolute;left:0;top:0}
.ov{position:absolute}
.body{position:absolute;display:flex;flex-direction:column;overflow:hidden;font-size:calc(13*var(--u));color:#c9d1d9}
.dates{display:flex;align-items:center;gap:calc(8*var(--u));padding:calc(6*var(--u)) 0 calc(10*var(--u));border-bottom:1px solid #2a323c}
.body.ph .dates{flex-direction:column;align-items:stretch}
.lab{font:600 calc(10.5*var(--u)) system-ui;letter-spacing:.14em;color:#8a96a3}.lab2{color:#9aa5b1}
.mos{display:flex;gap:calc(4*var(--u));flex-wrap:nowrap}
.mos.ph{display:grid;grid-template-columns:repeat(7,1fr);gap:calc(5*var(--u))}
.mb{display:inline-flex;align-items:center;justify-content:center;height:calc(28*var(--u));padding:0 calc(7*var(--u));border-radius:calc(7*var(--u));border:1px solid #2f3a46;background:#12161b;color:#e6edf3;font:600 calc(12*var(--u)) system-ui;white-space:nowrap}
.mb.on{border-color:#3f8fa6;background:#14313b;color:#5fd0e6}.mb.dim{color:#5c6773;border-color:#222a33;background:#0f1317}
.mos.ph .mb{padding:0;height:calc(30*var(--u))}
.dr2{display:flex;align-items:center;gap:calc(8*var(--u))}
.apall{display:inline-flex;align-items:center;height:calc(30*var(--u));padding:0 calc(14*var(--u));border-radius:calc(8*var(--u));border:1px solid rgba(87,201,122,.6);background:#183224;color:#8FE0A8;font:700 calc(13*var(--u)) system-ui;white-space:nowrap}
.sp{flex:1}
.row{display:flex;align-items:center;gap:calc(10*var(--u));height:calc(48.8*var(--u));border-bottom:1px solid #222a33;white-space:nowrap}
.pk{display:inline-flex;align-items:center;gap:calc(4*var(--u));width:calc(112*var(--u));flex:none}
.pk .cs{flex:1;padding:calc(2*var(--u)) calc(8*var(--u));border-radius:calc(4*var(--u));font:600 calc(12.5*var(--u)) system-ui;overflow:hidden;text-overflow:ellipsis}
.pk.pilot .cs{background:#423F1C;color:#FBFAF0}.pk.wso .cs{background:#13402F;color:#EAFBF3}
.pk i{font-style:normal;font:800 calc(9*var(--u)) system-ui;padding:calc(2*var(--u)) calc(5*var(--u));border-radius:calc(8*var(--u))}
.kb{display:inline-flex;align-items:center;justify-content:center;flex:none;width:calc(30*var(--u));height:calc(22*var(--u));border-radius:calc(3*var(--u));outline:1px dashed rgba(var(--h),.95);outline-offset:-1px;color:rgb(var(--h));font:800 calc(9.5*var(--u)) system-ui}
.dt{width:calc(150*var(--u));flex:none;color:#e6edf3;font-weight:600}
.det{flex:1;overflow:hidden;text-overflow:ellipsis;color:#9aa5b1;font-size:calc(12.5*var(--u))}
.det b,.l2 b{color:#fff}.neg,.red{color:#ff8a92!important}.amb{color:#F2C879!important}
.doc{display:inline-flex;align-items:center;justify-content:center;gap:1px;width:calc(30*var(--u));height:calc(26*var(--u));flex:none;border-radius:calc(6*var(--u));color:#c9d1d9}
.doc:not(.none){border:1px solid #2f3a46;background:#12161b}.doc em{font-style:normal;font:700 calc(10*var(--u)) system-ui}
.ap,.rf{display:inline-flex;align-items:center;justify-content:center;flex:none;height:calc(30*var(--u));border-radius:calc(7*var(--u));font:700 calc(13*var(--u)) system-ui}
.ap{width:calc(86*var(--u));border:1px solid rgba(87,201,122,.55);background:#183224;color:#8FE0A8}
.rf{width:calc(76*var(--u));border:1px solid rgba(240,85,95,.5);background:#2d1618;color:#FFA6AD}
.card{display:flex;flex-direction:column;gap:calc(6*var(--u));padding:calc(10*var(--u)) 0;border-bottom:1px solid #2a323c}
.l1{display:flex;align-items:center;gap:calc(8*var(--u))}.l1 .dt{width:auto}
.l2{color:#9aa5b1;font-size:calc(12.5*var(--u));line-height:1.35}
.l3{display:flex;gap:calc(8*var(--u))}
.lbtn{position:absolute;height:40px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border-radius:8px;background:rgba(var(--h),var(--f));box-shadow:inset 0 0 0 1px rgba(var(--h),.85);color:var(--ink);font:700 16px system-ui}
.lbtn small{font:600 12px system-ui;opacity:.85}.lbtn.zero{opacity:.5}
.cover{position:absolute}
.tick{position:absolute;display:inline-flex;align-items:center;gap:10px;height:38px;padding:0 14px;border-radius:8px;border:1px solid #2f3a46;background:#12161b;color:#e6edf3;font:600 15.5px system-ui;white-space:nowrap}
.tick i{width:17px;height:17px;border:2px solid #9aa5b1;border-radius:3px}
.wlab{position:absolute;font:600 13px system-ui;letter-spacing:.14em;color:#8a96a3}
.tag{position:absolute;background:${PINK};color:#fff;font:700 15px/1 system-ui;padding:6px 9px;border-radius:7px;white-space:nowrap}
.inl{position:absolute;left:0;right:0;font-size:calc(14*var(--u));color:#e6edf3}
.irow{display:flex;align-items:center;height:calc(37*var(--u));border-bottom:1px solid #1d242c;position:relative}
.irow>*{position:absolute;top:50%;transform:translateY(-50%)}
.irow .pill{display:inline-flex;align-items:center;height:calc(19*var(--u));padding:0 calc(9*var(--u));border-radius:calc(10*var(--u));border:1px solid #2f3a46;background:#161c23;font:800 calc(10*var(--u)) system-ui;color:#c9d1d9}
.irow .nod{font:500 calc(10.5*var(--u)) system-ui;color:#6b7785;font-style:italic}
.irow .clip{color:#c9d1d9}
.bal{position:absolute;display:inline-flex;align-items:center;gap:calc(6*var(--u));height:calc(22*var(--u));padding:0 calc(10*var(--u));border-radius:calc(6*var(--u));border:1px solid #3a4652;background:#141a21;color:#e6edf3;font:700 calc(12*var(--u)) system-ui;white-space:nowrap}.bal i{font-style:normal;color:#9aa5b1;font-size:calc(10*var(--u))}
.dd{position:absolute;background:#1b2027;border:1px solid #3a4450;border-radius:calc(4*var(--u));padding:calc(3*var(--u)) 0;font:500 calc(13*var(--u)) system-ui;color:#e6edf3;box-shadow:0 10px 30px rgba(0,0,0,.6)}
.dd div{padding:calc(2.5*var(--u)) calc(12*var(--u))}.dd .fam{font-weight:800;padding-left:calc(8*var(--u))}.dd .sel{background:#c2d6f5;color:#0b0d10}.dd .k{padding-left:calc(24*var(--u))}
.sel2{position:absolute;display:flex;align-items:center;justify-content:space-between;padding:0 calc(10*var(--u));border-radius:calc(6*var(--u));border:1px solid #3a4450;background:#0d1117;color:#e6edf3;font:500 calc(14*var(--u)) system-ui}
.mk{position:absolute;border:calc(2.4*var(--u)) solid ${PINK};border-radius:calc(7*var(--u));pointer-events:none}
.mk b{position:absolute;top:calc(-11*var(--u));left:calc(-11*var(--u));width:calc(20*var(--u));height:calc(20*var(--u));border-radius:50%;background:${PINK};color:#fff;font:800 calc(11*var(--u))/calc(20*var(--u)) system-ui;text-align:center}
`
const JOBS = []
// 1 — Approvals on a desktop: the sheet's body redrawn
JOBS.push({ name: 'r4b-desk-approvals', img: pic('full/r4-w10-desk-approvals.png'), W: 1920, H: 1075, u: 1.25, sample: [1000, 1040],
  over: `<div class="cover" style="left:356px;top:328px;width:1210px;height:726px;background:var(--bg)"></div><div class="body" style="left:364px;top:330px;width:1192px;height:722px">${sheetBody(false)}</div>` })
// 2 — Approvals on a phone
JOBS.push({ name: 'r4b-phone-approvals', img: pic('full/r4-w10-phone-approvals.png'), W: 1170, H: 2532, u: 3, sample: [600, 2300],
  over: `<div class="cover" style="left:46px;top:700px;width:1080px;height:1765px;background:var(--bg)"></div><div class="body ph" style="left:76px;top:704px;width:1020px;height:1758px">${sheetBody(true)}</div>` })
// 3 — the bid window, A: the tick on a row of its own with a label, "APPROVE ☐ What I enter"; the buttons in their colours
const tagAt = (x, y, t) => `<span class="tag" style="left:${x}px;top:${y}px">${t}</span>`
const winBase = (img, dy = 0) => `<div class="cover" style="left:620px;top:851px;width:684px;height:96px;background:var(--bg)"></div>${leaveButtons(dy)}<span class="wlab" style="left:627px;top:${868 + dy}px">WHICH LEAVE</span>`
JOBS.push({ name: 'r4b-win-A', img: pic('full/r4-w7-desk-admin-new.png'), W: 1920, H: 1075, u: 1.25, sample: [1270, 760], clip: [604, 604, 702, 470],
  over: winBase() + `<div class="cover" style="left:616px;top:800px;width:690px;height:52px;background:var(--bg)"></div><span class="wlab" style="left:627px;top:822px">APPROVE</span><span class="tick" style="left:735px;top:809px" data-mk="A"><i></i>What I enter</span>` + `<span class="ov" data-mk="B" style="left:628px;top:855px;width:632px;height:85px"></span>` })
// 4 — the bid window, B: the tick in the title bar; the rows below it move up
JOBS.push({ name: 'r4b-win-B', img: pic('full/r4-w7-desk-admin-new.png'), W: 1920, H: 1075, u: 1.25, sample: [1270, 760], clip: [604, 604, 702, 414],
  over: winBase() + `<div class="cover" style="left:612px;top:806px;width:694px;height:270px;background:url(${pic('full/r4-w7-desk-admin-new.png')}) -612px -852px no-repeat"></div>` +
    `<div class="cover" style="left:616px;top:800px;width:690px;height:101px;background:var(--bg)"></div>${leaveButtons(-46)}<span class="wlab" style="left:627px;top:822px">WHICH LEAVE</span>` +
    `<div class="cover" style="left:1000px;top:616px;width:270px;height:36px;background:var(--bg)"></div><span class="tick" style="left:1040px;top:614px;height:34px;font-size:14.5px" data-mk="A"><i></i>Approve what I enter</span>` })
// 5, 6 — the Inputs list: the type filter's families as choices; the list on "All leave", who has a document and who not
const LISTPIC = pic('../../img/handpass/2026-10-21-board-side-width/look1/sweep/pc-inputs-list.png')
const ROWS = [['Anvil', '13 Jul', '17 Jul', 'OL', 'Overseas leave', 1], ['Quill', '14 Jul', '', 'LL', 'Local leave', 0], ['Cinch', '20 Jul', '', 'CCL', 'Child care leave', 0], ['Tally', '24 Jul', '', 'LL', 'Local leave', 1], ['Ranger', '27 Jul', '31 Jul', 'OL', 'Overseas leave · Bali', 2]]
const irow = (r, i) => `<div class="irow"><span style="left:${88 - 64}px">${r[0]}</span><span style="left:${588 - 64}px">${r[1]}</span><span style="left:${888 - 64}px">${r[2]}</span><span class="pill" style="left:${1118 - 64}px">${r[3]}</span><span style="left:${1438 - 64}px">${r[4]}</span><span style="left:${2631 - 64}px;font:500 calc(12.5*var(--u)) ui-monospace,monospace;color:#8a96a3">12 Jul 26</span>${r[5] ? `<span class="clip" style="left:${2872 - 64}px"${i === 0 ? ' data-mk="B"' : ''}>${CLIP}${r[5] > 1 ? `<em style="font-style:normal;font-size:calc(10*var(--u))">${r[5]}</em>` : ''}</span>` : `<span class="nod" style="left:${2826 - 64}px"${i === 1 ? ' data-mk="C"' : ''}>No document</span>`}</div>`
const selAt = (t, mk) => `<div class="cover" style="left:2330px;top:132px;width:254px;height:100px;background:var(--bg2)"></div><span class="sel2" style="left:2338px;top:139px;width:236px;height:86px"${mk ? ` data-mk="${mk}"` : ''}>${t}<span style="color:#9aa5b1">⌄</span></span>`
const list = `<div class="cover" style="left:0;top:442px;width:3072px;height:900px;background:var(--bg)"></div><div class="inl" style="left:64px;top:442px;width:2944px">${ROWS.map(irow).join('')}</div>`
const ddList = `<div class="dd" style="left:2338px;top:232px;width:300px"><div>All types</div><div class="fam sel" data-mk="A">All leave</div><div class="k">LL</div><div class="k">OL</div><div class="k">OIL</div><div class="k">CCL</div><div class="k">PL</div><div class="k">FCL</div><div class="k">EL</div><div class="k">CL</div><div class="fam">All medical</div><div class="k">HL</div><div class="k">OML</div><div class="k">ATT C</div><div class="fam">All duty &amp; commitments</div><div class="k">Training</div></div>`
JOBS.push({ name: 'r4b-inputs-filter', img: LISTPIC, W: 3072, H: 1180, u: 2, sample: [1500, 470], sample2: [2200, 200], over: list + selAt('All types') + ddList })
JOBS.push({ name: 'r4b-inputs-all-leave', img: LISTPIC, W: 3072, H: 860, u: 2, sample: [1500, 470], sample2: [2200, 200], over: list + selAt('All leave', 'A') })

// 7, 8 — "Balances" drawn as a button, as "Manning" is (D1185): ▾ open on the desktop, ▸ shut on the phone
JOBS.push({ name: 'r4b-desk-balances', img: pic('full/r4-desk-admin-A.png'), W: 1920, H: 1075, u: 1.25, sample: [150, 458], clip: [0, 200, 1100, 420],
  over: '<div class="cover" style="left:27px;top:438px;width:238px;height:34px;background:var(--bg)"></div><span class="bal" style="left:32px;top:443px" data-mk="A"><i>▾</i>Balances</span>' })
JOBS.push({ name: 'r4b-phone-balances', img: pic('full/r4-phone-member.png'), W: 1170, H: 2532, u: 3, sample: [150, 1012], clip: [0, 0, 1170, 1300],
  over: '<div class="cover" style="left:34px;top:970px;width:282px;height:62px;background:var(--bg)"></div><span class="bal" style="left:44px;top:978px" data-mk="D"><i>▸</i>Balances</span>' })
// 9 — his question (21 Oct 26): the lowest Avail figure red where it is under that day's Required, as the grid's cell is
// (the row has no amber of its own); a manning row amber or red on the request's days named after it; a renamed row
const COLOURED = [
  ['Cinch', 'pilot', 'IP', 'sxo', 'LL', 'Thu 22 – Fri 23 Jan', '2 days', -2, 'P 24.5', 'Cinch, 3 Jan', 0, null, 'red', null, null, ['', '', '', '', 'A']],
  ['Anvil', 'pilot', 'IP', 'sxo', 'LL', 'Tue 27 Jan', '1 day', -1.5, 'P 23', 'Anvil, 5 Jan', 0, null, '', '<b class="amb">IP 3</b>', null, ['', '', '', '', '', 'B']],
  ['Drifter', 'pilot', 'A', 'sxo', 'OL', 'Tue 27 Jan', '1 day', 25, 'P 21', 'Drifter, 6 Jan', 1, null, '', null, 'Pilots w/o OCU', ['', '', '', '', 'C']],
]
JOBS.push({ name: 'r4b-desk-approvals-colours', img: pic('full/r4-w10-desk-approvals.png'), W: 1920, H: 1075, u: 1.25, sample: [1000, 1040], clip: [350, 280, 1225, 305],
  over: `<div class="cover" style="left:356px;top:328px;width:1210px;height:726px;background:var(--bg)"></div><div class="body" style="left:364px;top:330px;width:1192px;height:722px"><div class="dates"><span class="lab">DATES</span>${months(false)}<span class="sp"></span><span class="apall">Approve all 15</span></div>${COLOURED.map((r, i) => line(r, i, false)).join('')}</div>` })
const browser = await chromium.launch()
for (const j of JOBS) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS(j.u)}</style></head><body><div class="pic" id="pic" style="width:${j.W}px;height:${j.H}px"><img id="base" src="${j.img}" alt="">${j.over}</div></body></html>`
  const ctx = await browser.newContext({ viewport: { width: j.W, height: j.H }, deviceScaleFactor: 1 })
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e)))
  await p.setContent(html); await p.waitForTimeout(300)
  const fit = await p.evaluate(([s1, s2]) => {
    const img = document.getElementById('base'), c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight
    const g = c.getContext('2d'); g.drawImage(img, 0, 0)
    const col = ([x, y]) => { const d = g.getImageData(x, y, 1, 1).data; return `rgb(${d[0]},${d[1]},${d[2]})` }
    const pic = document.getElementById('pic'); pic.style.setProperty('--bg', col(s1)); if (s2) pic.style.setProperty('--bg2', col(s2))
    const P = pic.getBoundingClientRect(), u = parseFloat(getComputedStyle(pic).getPropertyValue('--u'))
    for (const el of document.querySelectorAll('[data-mk]')) {
      const r = el.getBoundingClientRect(), m = document.createElement('span'); m.className = 'mk'
      Object.assign(m.style, { left: r.left - P.left - 4 * u + 'px', top: r.top - P.top - 3 * u + 'px', width: r.width + 8 * u + 'px', height: r.height + 6 * u + 'px' })
      m.innerHTML = `<b>${el.dataset.mk}</b>`; pic.appendChild(m)
    }
    return [...document.querySelectorAll('.row,.dates,.mos,.l1,.det')].map(r => r.scrollWidth - r.clientWidth).filter(x => x > 0)
  }, [j.sample, j.sample2])
  console.log(j.name, 'overflow:', fit.join(' ') || 'none')
  const [cx, cy, cw, ch] = j.clip || [0, 0, j.W, j.H]
  await p.screenshot({ path: join(OUT, j.name + '.png'), clip: { x: cx, y: cy, width: cw, height: ch } })
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
