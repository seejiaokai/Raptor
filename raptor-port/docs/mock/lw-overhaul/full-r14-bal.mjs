// Round 14 (22 Oct 26): D1229 + D1230 — one page where an admin enters and updates everyone's balances and sets each
// person's leave grade; designed the app's own way with Impeccable and red-teamed against the colleague's two pages
// (Personnel; Leave & OIL Balances — his pictures in gryphon-balances/). Drawn INTO THE REAL LOCAL BUILD (clock Thu
// 8 Jan 26; <LWMOCK_OUT>/out/state.json): the page takes the grid card's place under the Leave War's first row, where a
// new "Balances" button (admins only) stands after Approvals, lit while the page is open. Nothing here is built.
// What it carries, from his rulings: per person the grade (D1229: Senior pilot 36 · Junior pilot 33 · Senior WSO 21 ·
// Junior WSO 18 · Ops A 14, added every 1 Jan by itself); LVE as the person window has it — App bal (what the official
// leave app shows, typed) incl. carried fwd (typed, used first, gone after its end — D1218, D1224), Pending in days,
// War bal worked out (D1217); OIL read only, a tap opens the OIL tracker (D1209, D400); the other leave kinds typed;
// the one lock for every member (D1220). Left out on purpose (the red team): the colleague's add-a-person form, its
// category and ticks — people come from Admin → Users and Quals (D461, D1200); its paragraph of rules; a typed OIL.
// The people, their groups, seats and CATs are the app's own; every figure but Ranger's and Saber's is MADE UP for the
// drawing (the demo squadron keeps no App bal, carried fwd or grade), and the page says so.
//   r14-bal-1-desk        the whole page on a desktop, Balances view
//   r14-bal-2-grade       a row's grade picker open, cut to the area
//   r14-bal-3-taken       the "Days taken" view, cut to its top
//   r14-bal-4-grades      the Grades window (the days each grade gets on 1 Jan), cut to it
//   r14-bal-5-phone       the page on a phone
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r14-bal.mjs      (R14_ONLY=1,2,3,4,5)
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo } from './full-lib.mjs'
import { oneStage, oneFold, mk, unmk, UNDER, MGMT } from './full-r7-one.mjs'
import { LOCK_SVG, CLIP_SVG } from './full-propose.mjs'
import { H as WH, fill as WFILL } from './full-win-a-lib.mjs'
const ONLY = (process.env.R14_ONLY || '').split(',').filter(Boolean)
const want = n => !ONLY.length || ONLY.includes(n)
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const DC = load(cut(SRC('full-r7-decide.mjs'), '// ---------------------------------------------------------------- shared pieces', '// ---------------------------------------------------------------- scenes'),
  { oneStage, oneFold, mk, UNDER, q, newPage, signIn, shot, gridTo, browser, state }, ['stage'])
const DECO = load(cut(SRC('full-r12-dot.mjs'), 'const DECO = `', 'const deco ='), {}, ['DECO']).DECO
const deco = p => p.addScriptTag({ content: DECO })
const crop = (p, name, r) => p.evaluate(() => [scrollX, scrollY]).then(([sx, sy]) =>
  shot(p, name, { clip: { x: Math.round(r.left + sx), y: Math.round(r.top + sy), width: Math.round(r.width), height: Math.round(r.height) } }))

// ---------------------------------------------------------------- the figures (made up but Ranger's and Saber's)
const GRADES = [['sp', 'Senior pilot', 36], ['jp', 'Junior pilot', 33], ['sw', 'Senior WSO', 21], ['jw', 'Junior WSO', 18], ['oa', 'Ops A', 14]]
const gradeOf = (seat, cat, grp) => grp === 'Personnel' ? 'oa' : seat === 'wso' ? (/^(IW|B|A)$/.test(cat) ? 'sw' : 'jw') : (/^(IR|IP|A|B)$/.test(cat) ? 'sp' : 'jp')
const NOGRADE = ['Talisman', 'Wildcard']                    // two newcomers on OCU: no grade yet (D1229's reading)
const PEND = { Cinch: 2, Gambit: 0.5, Warden: 0.5, Ranger: 2.5, Anvil: 1, Drifter: 1, Basher: 1, Blade: 1.5, Reaper: 1, Static: 1 } // the demo's own pending bids
const OILF = { Drifter: 2, Hunter: 2, Vector: 0.5, Reaper: 1, Warden: 1.5, Gambit: 1 }
const OTHER = { Piston: { CCL: 2 }, Static: { PL: 5 }, Hex: { CCL: 1 }, Blade: { FCL: 2 }, Dash: { EL: 3 } }
const TAKEN = { Ranger: { LL: 3 }, Reaper: { OL: 5 }, Piston: { LL: 3 }, Saber: { LL: 1 }, Drifter: { OL: 1, OIL: 1 }, Sidewinder: { MED: 2 }, Hunter: { OIL: 2 }, Vector: { OIL: 0.5 }, Anvil: { LL: 0.5 } }
const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
function figures(cs, g) {
  if (cs === 'Ranger') return { app: 17, cf: 4 }
  if (cs === 'Saber') return { app: 17, cf: 0 }
  if (cs === 'Cinch') return { app: 1, cf: 0 }              // over-bid: War bal below zero, shown red
  const days = g ? GRADES.find(x => x[0] === g)[2] : 0
  const h = hash(cs), cf = h % 5 === 0 ? 0 : (h % 7), used = (h >> 3) % 9 + ((h >> 6) % 2) * 0.5
  return { app: Math.max(0, days + cf - used), cf }
}
const half = n => { const w = Math.trunc(n), f = Math.abs(n - w); return (n < 0 && w === 0 ? '−' : n < 0 ? '−' : '') + (Math.abs(w) || (f ? '' : '0')) + (f ? '½' : '') }

// ---------------------------------------------------------------- the page's look (the app's own palette and sizes)
const CSS = `
.zbp{position:fixed;z-index:60;background:#0b0d10;display:flex;flex-direction:column;color:#c9d1d9;font:13px system-ui}
.zbp .card{flex:1;min-height:0;display:flex;flex-direction:column;background:#11161c;border:1px solid #2a313a;border-radius:14px;overflow:hidden}
.zbp .bar{display:flex;align-items:center;gap:8px;height:56px;padding:0 14px;border-bottom:1px solid #2a313a;flex:none;white-space:nowrap}
.zbp .btn{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:9px;border:1px solid #2f3a46;background:#12161b;color:#e6edf3;font:600 13.5px system-ui}
.zbp .btn svg{width:15px;height:15px}
.zbp .seg{display:inline-flex;height:36px;border:1px solid #2f3a46;border-radius:9px;overflow:hidden}
.zbp .seg span{display:inline-flex;align-items:center;padding:0 12px;font:600 13.5px system-ui;color:#c9d1d9;background:#12161b}
.zbp .seg span+span{border-left:1px solid #2f3a46}
.zbp .seg span.on{background:rgba(59,198,232,.14);color:#5fd0e6}
.zbp .srch{display:inline-flex;align-items:center;gap:8px;height:36px;width:200px;padding:0 10px;border-radius:9px;border:1px solid #2f3a46;background:#0d1217;color:#6b7785;font:500 13.5px system-ui}
.zbp .srch svg{width:15px;height:15px;color:#8a96a3}
.zbp .nog{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:9px;border:1px dashed rgba(242,200,121,.7);color:#F2C879;font:600 13.5px system-ui;background:transparent}
.zbp .lock{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 12px;border-radius:9px;border:1px solid #2f3a46;background:#12161b;color:#e6edf3;font:600 13.5px system-ui}
.zbp .lock .sw{width:30px;height:18px;border-radius:9px;background:#2f3a46;position:relative}.zbp .lock .sw::after{content:'';position:absolute;left:2px;top:2px;width:14px;height:14px;border-radius:50%;background:#c9d1d9}
.zbp .lock.on{border-color:rgba(59,198,232,.55);background:rgba(59,198,232,.14);color:#5fd0e6}.zbp .lock.on .sw{background:#3bc6e8}.zbp .lock.on .sw::after{left:14px;background:#04222b}
.zbp .sp{flex:1}
.zbp .scroll{flex:1;min-height:0;overflow:hidden;position:relative}
.zbp table{border-collapse:separate;border-spacing:0;font-variant-numeric:tabular-nums}
.zbp th{position:sticky;top:0;background:#11161c;z-index:2;font:600 10px system-ui;letter-spacing:.12em;color:#8a96a3;text-align:right;padding:0 10px;height:26px;white-space:nowrap}
.zbp th.l,.zbp td.l{text-align:left}
.zbp tr.h1 th{height:22px;padding-top:8px;color:#6b7785;letter-spacing:.14em}
.zbp tr.h1 th.span{text-align:center;border-bottom:1px solid #2f3a46}
.zbp tr.h2 th{border-bottom:1px solid #2a313a;top:30px}
.zbp td{height:40px;padding:0 10px;text-align:right;border-bottom:1px solid #1d242c;white-space:nowrap;color:#e6edf3;font-size:13.5px}
.zbp td.sep,.zbp th.sep{border-left:1px solid #222a33}
.zbp tr.grp td{height:34px;background:#0e1318;border-bottom:1px solid #222a33;text-align:left;font:800 12.5px system-ui;letter-spacing:.06em;color:#f1f4f7}
.zbp tr.grp i{display:inline-block;width:11px;height:11px;border-radius:3px;margin:0 10px 0 2px;vertical-align:-1px}
.zbp tr.grp em{font-style:normal;color:#8a96a3;font-weight:500;letter-spacing:0;margin-left:6px}
/* the person: his own puck, as the grid draws it (lesson 25) */
.zbp .pk{display:inline-flex;align-items:center;gap:5px;width:132px}
.zbp .pk .cs{flex:1;min-width:0;padding:3px 9px;border-radius:5px;font:600 13px system-ui;overflow:hidden;text-overflow:ellipsis}
.zbp .pk.pilot .cs{background:#423F1C;color:#FBFAF0}.zbp .pk.wso .cs{background:#13402F;color:#EAFBF3}.zbp .pk.gnd .cs{background:#d9dde2;color:#1b2026}
.zbp .pk b{font:800 9.5px system-ui;padding:2px 6px;border-radius:8px}
.zbp tr.me td{background:rgba(155,89,255,.07)}
/* a box: "you can type this" — its edge 3.4:1 against the tile (the detector's finding on round 13's 1.85:1) */
.zbp .bx{display:inline-flex;align-items:center;justify-content:flex-end;box-sizing:border-box;min-width:54px;height:28px;padding:0 9px;border:1px solid #66717f;border-radius:7px;background:#0d1217;color:#f1f4f7;font:700 13.5px system-ui;font-variant-numeric:tabular-nums}
.zbp .bx.sm{min-width:44px}
.zbp .bx.z,.zbp .z{color:#7d8894;font-weight:500}
.zbp .gr{display:inline-flex;align-items:center;gap:8px;box-sizing:border-box;width:172px;height:28px;padding:0 10px;border:1px solid #66717f;border-radius:7px;background:#0d1217;color:#e6edf3;font:600 13px system-ui}
.zbp .gr .d{color:#8a96a3;font-weight:500;margin-left:auto;font-variant-numeric:tabular-nums}
.zbp .gr svg{width:10px;height:10px;color:#8a96a3;flex:none}
.zbp .gr.none{border:1px dashed rgba(242,200,121,.8);color:#F2C879;background:transparent}
.zbp .war{font:800 15px system-ui}.zbp .neg{color:#FF7A84}
.zbp .pend{color:#c9d1d9}
.zbp .oil{color:#e6edf3}.zbp .oil .ch{color:#5fd0e6;margin-left:6px;font-weight:700}
.zbp .cutf{position:absolute;left:0;right:0;bottom:0;height:28px;background:linear-gradient(rgba(17,22,28,0),#11161c);z-index:3}
.zbp .note{flex:none;padding:10px 16px;border-top:1px solid #2a313a;color:#8a96a3;font:500 12.5px system-ui;display:flex;gap:18px}
/* the grade picker, open */
.zgm{position:fixed;z-index:70;width:204px;background:#161b22;border:1px solid #2f3a46;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.6);padding:5px;font:13px system-ui;color:#e6edf3}
.zgm div{display:flex;align-items:center;gap:8px;height:34px;padding:0 10px;border-radius:7px}
.zgm div .d{margin-left:auto;color:#8a96a3;font-variant-numeric:tabular-nums}
.zgm div.on{background:rgba(59,198,232,.14);color:#5fd0e6}.zgm div.on .d{color:#5fd0e6}
.zgm div.no{color:#9aa5b1}.zgm hr{border:0;border-top:1px solid #2a313a;margin:4px 2px}
/* the Grades window */
.zgw{position:fixed;z-index:70;width:360px;background:#161b22;border:1px solid #2f3a46;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.6);color:#c9d1d9;font:13px system-ui;overflow:hidden}
.zgw .hd{display:flex;align-items:center;gap:10px;height:46px;padding:0 14px;border-bottom:1px solid #2a323c}
.zgw .hd b{font:800 15px system-ui;letter-spacing:.06em;color:#f1f4f7}.zgw .hd .x{margin-left:auto;color:#9aa5b1;font-size:16px}
.zgw .r{display:flex;align-items:center;height:44px;padding:0 14px;border-bottom:1px solid #222a33;color:#e6edf3;font-weight:600}
.zgw .r .n{margin-left:auto;color:#8a96a3;font-weight:500;margin-right:10px}
.zgw .r .bx{display:inline-flex;align-items:center;justify-content:flex-end;box-sizing:border-box;min-width:54px;height:28px;padding:0 9px;border:1px solid #66717f;border-radius:7px;background:#0d1217;color:#f1f4f7;font:700 13.5px system-ui;font-variant-numeric:tabular-nums}
.zgw .ft{padding:10px 14px;color:#8a96a3;font:500 12.5px system-ui}
/* the phone */
.zbp.ph .bar{height:auto;flex-wrap:wrap;padding:8px 10px;gap:6px}
.zbp.ph .srch{width:auto;flex:1}
.zbp.ph .hh{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));column-gap:8px;padding:7px 12px 5px;border-bottom:1px solid #2a313a;font:600 9.5px system-ui;letter-spacing:.1em;color:#8a96a3;text-align:right;flex:none}
.zbp.ph .pc{padding:8px 12px;border-bottom:1px solid #1d242c;display:flex;flex-direction:column;gap:7px}
.zbp.ph .pc .l1{display:flex;align-items:center;gap:8px}
.zbp.ph .pc .l1 .gr{width:auto;flex:1;max-width:190px;margin-left:auto}
.zbp.ph .pc .l2{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));column-gap:8px;align-items:center;text-align:right}
.zbp.ph .pc .l2 .bx{min-width:0;width:100%}
.zbp.ph .grp2{padding:8px 12px;background:#0e1318;border-bottom:1px solid #222a33;font:800 12.5px system-ui;letter-spacing:.06em;color:#f1f4f7}
.zbp.ph .grp2 i{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:10px;vertical-align:-1px}
.zbp.ph .grp2 em{font-style:normal;color:#8a96a3;font-weight:500;letter-spacing:0;margin-left:6px}
`
const CHEV = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const MAG = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
const LOCK = '<svg viewBox="0 0 14 16" width="12" height="14" aria-hidden="true"><rect x="2" y="7" width="10" height="7.5" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
const BACK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'

// read the roster off the real grid: groups in their order, each man's callsign, seat, CAT and its chip's colours
const roster = p => p.evaluate(() => {
  const out = []
  for (const r of document.querySelectorAll('#page-leavewar tbody tr')) {
    const t = r.getAttribute('data-testid') || ''
    if (r.classList.contains('grp')) {
      if (!r.querySelector('.gname')) continue
      const sq = r.querySelector('.gsw')
      out.push({ g: r.querySelector('.gname').textContent.trim(), col: sq ? getComputedStyle(sq).backgroundColor : '#888', people: [] })
    } else if (t.startsWith('row-') && out.length && r.querySelector('.cs') && !out.some(G => G.people.some(m => m.id === t))) {
      const cs = r.querySelector('.cs'), chip = r.querySelector('.catchip'), cc = getComputedStyle(chip)
      out[out.length - 1].people.push({ id: t, cs: cs.textContent.trim(), seat: /seat-wso/.test(cs.className) ? 'wso' : /seat-gnd|seat-pers/.test(cs.className) ? 'gnd' : 'pilot', cat: chip.textContent.trim(), bg: cc.backgroundColor, ink: cc.color, me: r.classList.contains('me') })
    }
  }
  return out
})

function model(groups) {
  return groups.map(G => ({ ...G, people: G.people.map(m => {
    const g = NOGRADE.includes(m.cs) ? null : gradeOf(m.seat, m.cat, G.g)
    const { app, cf } = figures(m.cs, g), pend = PEND[m.cs] || 0
    return { ...m, g, app, cf, pend, war: app - pend, oil: OILF[m.cs] || 0, other: OTHER[m.cs] || {}, taken: TAKEN[m.cs] || {} }
  }) }))
}
const puck = m => `<span class="pk ${m.seat}"><span class="cs">${m.cs}</span><b style="background:${m.bg};color:${m.ink}">${m.cat}</b></span>`
const grade = (g, o = {}) => g ? `<span class="gr${o.zk ? ' ' + o.zk : ''}">${GRADES.find(x => x[0] === g)[1]}<span class="d">${GRADES.find(x => x[0] === g)[2]}</span>${CHEV}</span>` : `<span class="gr none${o.zk ? ' ' + o.zk : ''}">No grade<span class="d" style="color:inherit">–</span>${CHEV}</span>`
const bx = (v, sm) => `<span class="bx${sm ? ' sm' : ''}${v === 0 ? ' z' : ''}">${half(v)}</span>`
const OTHERK = ['CCL', 'FCL', 'PL', 'EL', 'CL']
const TAKENK = ['LL', 'OL', 'OIL', 'CCL', 'FCL', 'PL', 'EL', 'CL', 'MED', 'CSE', 'OD']

function deskHTML(M, view) {
  const head = view === 'bal'
    ? `<tr class="h1"><th class="l" colspan="2"></th><th class="span sep" colspan="4">LVE</th><th class="sep"></th><th class="span sep" colspan="5">OTHER LEAVE</th><th></th></tr>
       <tr class="h2"><th class="l">NAME</th><th class="l">GRADE · DAYS ON 1 JAN</th><th class="sep">APP BAL</th><th>INCL. CARRIED FWD</th><th>PENDING</th><th>WAR BAL</th><th class="sep">OIL</th>${OTHERK.map((k, i) => `<th${i ? '' : ' class="sep"'}>${k}</th>`).join('')}<th style="width:100%"></th></tr>`
    : `<tr class="h1"><th class="l" colspan="2"></th><th class="span sep" colspan="${TAKENK.length}">DAYS TAKEN IN 2026</th><th></th></tr>
       <tr class="h2"><th class="l">NAME</th><th class="l">GRADE · DAYS ON 1 JAN</th>${TAKENK.map((k, i) => `<th${i ? '' : ' class="sep"'} style="min-width:46px">${k}</th>`).join('')}<th style="width:100%"></th></tr>`
  const span = view === 'bal' ? 13 : TAKENK.length + 3
  const body = M.map(G => `<tr class="grp"><td colspan="${span}"><i style="background:${G.col}"></i>${G.g}<em>${G.people.length}</em></td></tr>` + G.people.map(m => {
    const cells = view === 'bal'
      ? `<td class="sep">${bx(m.app)}</td><td>${bx(m.cf, 1)}</td><td class="pend">${m.pend ? '−' + half(m.pend) : '<span class="z">–</span>'}</td><td class="war${m.war < 0 ? ' neg' : ''}">${half(m.war)}</td>` +
        `<td class="sep oil">${m.oil ? half(m.oil) : '<span class="z">0</span>'}<span class="ch">›</span></td>` + OTHERK.map((k, i) => `<td${i ? '' : ' class="sep"'}>${bx(m.other[k] || 0, 1)}</td>`).join('')
      : TAKENK.map((k, i) => `<td${i ? '' : ' class="sep"'}>${m.taken[k] ? half(m.taken[k]) : '<span class="z">–</span>'}</td>`).join('')
    return `<tr data-cs="${m.cs}"${m.me ? ' class="me"' : ''}><td class="l">${puck(m)}</td><td class="l">${grade(m.g)}</td>${cells}<td></td></tr>`
  }).join('')).join('')
  const nog = M.flatMap(G => G.people).filter(m => !m.g).length
  return `<div class="card"><div class="bar zz-bar">` +
    `<span class="btn zz-back">${BACK}Grid</span>` +
    `<span class="btn zz-year">2026 ${CHEV}</span>` +
    `<span class="seg zz-seg"><span class="${view === 'bal' ? 'on' : ''}">Balances</span><span class="${view === 'bal' ? '' : 'on'}">Days taken</span></span>` +
    `<span class="srch">${MAG}Find a person</span><span class="sp"></span>` +
    `<span class="nog zz-nog">No grade ${nog}</span>` +
    `<span class="btn zz-grades">Grades…</span>` +
    `<span class="lock on zz-lock">${LOCK}Lock for members<span class="sw"></span></span>` +
    `</div><div class="scroll"><table class="zz-table"><thead>${head}</thead><tbody>${body}</tbody></table><div class="cutf"></div></div></div>`
}

function phoneHTML(M) {
  const ppl = M.map(G => `<div class="grp2"><i style="background:${G.col}"></i>${G.g}<em>${G.people.length}</em></div>` + G.people.map(m =>
    `<div class="pc" data-cs="${m.cs}"><div class="l1">${puck(m)}${grade(m.g)}</div><div class="l2">${bx(m.app)}${bx(m.cf, 1)}<span class="pend">${m.pend ? '−' + half(m.pend) : '<span class="z">–</span>'}</span><span class="war${m.war < 0 ? ' neg' : ''}">${half(m.war)}</span></div></div>`).join('')).join('')
  return `<div class="card"><div class="bar zz-bar"><span class="btn">${BACK}Grid</span><span class="btn">2026 ${CHEV}</span><span class="nog">No grade 2</span><span class="lock on">${LOCK}<span class="sw"></span></span>` +
    `<span class="srch">${MAG}Find a person</span><span class="btn">Grades…</span></div>` +
    `<div class="hh"><span>APP BAL</span><span>CARRIED</span><span>PENDING</span><span>WAR BAL</span></div>` +
    `<div class="scroll">${ppl}<div class="cutf"></div></div></div>`
}

// the page in the grid card's place: under the Leave War's first row (View · picker · + New · Approvals · Balances)
async function openPage(p, html, phone, btn) {
  await p.evaluate(([css, html, phone, btn]) => {
    if (!document.getElementById('zz14b')) { const s = document.createElement('style'); s.id = 'zz14b'; s.textContent = css; document.head.appendChild(s) }
    // way B only: "Balances", lit (the filter chip's "on" look, as Rearrange), right after Approvals on the first row
    const ap = document.querySelector('[data-zk="appr"]')
    if (btn && ap && !document.querySelector('.zz-balbtn')) {
      const b = ap.cloneNode(false); b.className = ap.className + ' zz-balbtn'; b.removeAttribute('data-zk')
      b.textContent = 'Balances'; Object.assign(b.style, { borderColor: 'rgba(59,198,232,.55)', background: 'rgba(59,198,232,.14)', color: '#5fd0e6' })
      ap.after(b)
    }
    const row1 = ap.closest('.zrow') || ap.parentElement
    const top = row1.getBoundingClientRect().bottom + 8
    const g = document.querySelector('#page-leavewar .mx-outer') || document.querySelector('#page-leavewar .mx-wrap')
    const G = g.getBoundingClientRect()
    const d = document.createElement('div'); d.className = 'zbp' + (phone ? ' ph' : ''); d.innerHTML = html
    Object.assign(d.style, phone ? { left: '6px', right: '6px', top: top + 'px', bottom: '0px', paddingBottom: '6px' } : { left: G.left + 'px', width: G.width + 'px', top: top + 'px', bottom: '8px' })
    if (!html) return
    document.body.appendChild(d)
  }, [CSS, html, phone, !!btn])
  await p.waitForTimeout(200)
}

let M
{
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await DC.stage(p, false, {})
  M = model(await roster(p))
  console.log('groups', M.map(G => G.g + ':' + G.people.length).join(' '))
  await ctx.close()
}

// ======================= 1, 3 — the desktop page: Balances; Days taken =======================
for (const v of ['1', '3']) {
  if (!want(v)) continue
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await DC.stage(p, false, {})
  await openPage(p, deskHTML(M, v === '1' ? 'bal' : 'taken'), false)
  const fitw = await p.evaluate(() => { const t = document.querySelector('.zz-table'), s = t.parentElement; return [Math.round(t.scrollWidth), Math.round(s.clientWidth)] })
  console.log('table width / room', fitw)
  await shot(p, v === '1' ? 'r14-bal-1-desk-clean' : 'r14-bal-3-taken-clean')
  await deco(p)
  const r = await p.evaluate(v => {
    const d = window.__d
    const lab = (sel, html, o) => { const e = d.R(sel); d.ring(e, 2); return d.tag(html, o(e)) }
    if (v === '1') {
      const war = document.querySelector('tr[data-cs="Ranger"] td.war'), W = d.R(war)
      d.ring(d.R(war.closest('tr')), 0)
      const cl = d.R(war.closest('tr').querySelector('td:nth-last-child(2)'))
      d.tag('Ranger: App bal 17, incl. 4 carried fwd,<br>2½ pending → War bal 14½, as in his own window', { left: cl.right + 24, cy: W.top + W.height / 2 })
      const ng = document.querySelector('.zz-nog'); lab('.zz-nog', 'nothing is added on 1 Jan<br>to a person with no grade', e => ({ left: e.left, top: e.bottom + 76 }))
      return { left: 0, top: 0, width: innerWidth, height: innerHeight }
    }
    // 3: the top of the page only, its first two groups
    const t = d.R('.zz-table'), bar = d.R('.zz-bar')
    const sxoLast = [...document.querySelectorAll('.zz-table tbody tr')][14]
    const s = d.R('.zz-seg'); d.ring(s, 2); d.tag('the second view: days taken this year, per kind', { left: s.right + 14, cy: s.top + s.height / 2 })
    return { left: bar.left - 8, top: bar.top - 8, width: Math.min(innerWidth - bar.left + 8, 1200), height: d.R(sxoLast).bottom - bar.top + 16 }
  }, v)
  await p.mouse.move(2, 2)
  await crop(p, v === '1' ? 'r14-bal-1-desk' : 'r14-bal-3-taken', r)
  await ctx.close()
}

// ======================= 2 — a row's grade picker open (Wildcard: no grade yet) =======================
if (want('2')) {
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await DC.stage(p, false, {})
  await openPage(p, deskHTML(M, 'bal'), false)
  await p.evaluate(() => { const s = document.querySelector('.zbp .scroll'); const r = document.querySelector('tr[data-cs="Wildcard"]'); s.scrollTop = 0; document.querySelector('.zz-table').style.transform = `translateY(${-(r.getBoundingClientRect().top - s.getBoundingClientRect().top - 330)}px)` })
  await deco(p)
  const r = await p.evaluate(GR => {
    const d = window.__d, row = document.querySelector('tr[data-cs="Wildcard"]'), g = row.querySelector('.gr'), G = d.R(g)
    const m = document.createElement('div'); m.className = 'zgm'
    m.innerHTML = GR.map(([, n, k]) => `<div>${n}<span class="d">${k}</span></div>`).join('') + '<hr><div class="no on">No grade<span class="d">–</span></div>'
    Object.assign(m.style, { left: G.left + 'px', top: (G.bottom + 4) + 'px' }); document.body.appendChild(m)
    const M2 = d.R(m)
    d.tag('one tap sets his grade; the figure is the days<br>it adds every 1 Jan (D1229)', { left: M2.right + 18, cy: M2.top + 40 })
    const tr = d.R(row)
    return { left: tr.left - 6, top: tr.top - 120, width: 760, height: M2.bottom - tr.top + 140 }
  }, GRADES)
  await p.mouse.move(2, 2)
  await crop(p, 'r14-bal-2-grade', r)
  await ctx.close()
}

// ======================= 4 — the Grades window (from "Grades…") =======================
if (want('4')) {
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await DC.stage(p, false, {})
  await openPage(p, deskHTML(M, 'bal'), false)
  await deco(p)
  const CNT = {}; for (const m of M.flatMap(G => G.people)) if (m.g) CNT[m.g] = (CNT[m.g] || 0) + 1
  const r = await p.evaluate(([GR, cnt]) => {
    const d = window.__d, btn = d.R('.zz-grades')
    const w = document.createElement('div'); w.className = 'zgw'
    w.innerHTML = `<div class="hd"><span style="color:#6b7785">⠿</span><b>Grades</b><span class="x">✕</span></div>` +
      GR.map(([k, n, v]) => `<div class="r">${n}<span class="n">${cnt[k]} people</span><span class="bx">${v}</span></div>`).join('') +
      `<div class="ft">Days of annual leave each grade gets on 1 Jan.</div>`
    Object.assign(w.style, { left: (btn.right - 360) + 'px', top: (btn.bottom + 8) + 'px' }); document.body.appendChild(w)
    const W = d.R(w)
    d.ring(btn, 2)
    const t = d.tag('the days are settings the admin can change;<br>the app adds them by itself every 1 Jan', { right: W.right, top: W.bottom + 12 })
    return { left: W.left - 24, top: btn.top - 14, width: W.width + 38, height: t.bottom - btn.top + 26 }
  }, [GRADES, CNT])
  await p.mouse.move(2, 2)
  await crop(p, 'r14-bal-4-grades', r)
  await ctx.close()
}

// ======================= 5 — the phone =======================
if (want('5')) {
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'admin')
  await DC.stage(p, true, {})
  await openPage(p, phoneHTML(M), true)
  console.log('phone overflow', await p.evaluate(() => [...document.querySelectorAll('.zbp .pc .l1, .zbp .pc .l2, .zbp .bar')].filter(e => e.scrollWidth > e.clientWidth + 1).length))
  await shot(p, 'r14-bal-5-phone-clean')
  await deco(p)
  await p.evaluate(() => {
    const d = window.__d, r = document.querySelector('.zbp .pc[data-cs="Ranger"]')
    if (r) { const R = d.R(r); d.ring(R, 0); d.tag('OIL and the other leave: tap his name (his own window)', { left: 12, top: R.bottom + 8 }) }
  })
  await shot(p, 'r14-bal-5-phone')
  await ctx.close()
}

// ======================= 6 — way A: the page opens from Settings' Balances row, beside Lock balances =======================
if (want('6')) {
  const PR = load(cut(SRC('full-r7-person.mjs'), 'const CHEV', '// ---------- r7-20'),
    { oneStage, mk, unmk, MGMT, LOCK_SVG, CLIP_SVG, H: WH, fill: WFILL, q, gridTo, shot, newPage, signIn, browser, state },
    ['stage', 'gridAsBuilt', 'foldBalances', 'ME', 'LOCKI', 'PEN'])
  // r7's own Settings window, run unchanged up to its first picture
  const SET = load(cut(SRC('full-r7-person.mjs'), 'async function settings(touch)', '  await p.waitForTimeout(200)\n  const fit') + '  return { ctx, p }\n}\n',
    { newPage, browser, state, signIn, q, MGMT, foldBalances: PR.foldBalances, stage: PR.stage, gridAsBuilt: PR.gridAsBuilt, ME: PR.ME, LOCKI: PR.LOCKI, PEN: PR.PEN },
    ['settings'])
  const { ctx, p } = await SET.settings(false)
  await p.waitForTimeout(250)
  await deco(p)
  const r = await p.evaluate(() => {
    const d = window.__d, lock = document.querySelector('[data-zz="lock"]')
    const b = document.createElement('button'); b.className = 'rtbtn zz-balpg'; b.style.cssText = 'text-transform:none;letter-spacing:0'
    b.textContent = 'Balances & grades…'; lock.after(b)
    const B = d.R(b), s = document.querySelector('[data-testid="settings-sheet"]'), S = d.R(s), R4 = d.R('.zz-r4')
    d.ring(B, 2)
    d.tag('NEW: opens the page', { left: B.right + 16, cy: B.top + B.height / 2 })
    const hd = d.R(s.querySelector('.bidsheet-hd'))
    return { left: S.left - 4, top: hd.top - 4, width: S.width + 8, height: R4.bottom - hd.top + 18 }
  })
  await p.mouse.move(2, 2)
  await crop(p, 'r14-bal-6-from-settings', r)
  await ctx.close()
}

// ======================= 7 — way B: a "Balances" button on the first row, desktop and phone =======================
if (want('7')) {
  const parts = []
  for (const [w, h, touch] of [[1536, 860, false], [390, 844, true]]) {
    const { ctx, p } = await newPage(browser, w, h, touch, state); await signIn(p, 'admin')
    await DC.stage(p, touch, {})
    await openPage(p, '', touch, true)
    await deco(p)
    const r = await p.evaluate(touch => {
      const d = window.__d, b = d.R('.zz-balbtn'), ap = document.querySelector('[data-zk="appr"]')
      const row = d.R(ap.closest('.zrow') || ap.parentElement)
      d.ring(b, 2)
      if (touch) { const plus = d.R(document.querySelector('[data-zk="appr"]').previousElementSibling); d.ring(plus, 2); d.tag('the + squeezed', { left: 8, top: row.bottom + 10 }) }
      else d.tag('B: Balances after Approvals', { left: b.right + 16, cy: b.top + b.height / 2 })
      return { left: 0, top: row.top - 8, width: touch ? innerWidth : 900, height: row.height + (touch ? 56 : 16) }
    }, touch)
    const name = 'r14-bal-7' + (touch ? 'b' : 'a'); await crop(p, name, r); parts.push(join(OUT, name + '.png'))
    await ctx.close()
  }
  const { ctx, p } = await newPage(browser, 900, 400, false, null, 2)
  const img = f => 'data:image/png;base64,' + readFileSync(f).toString('base64')
  await p.setContent(`<body style="margin:0;background:#0b0d10;display:flex;flex-direction:column;gap:14px;align-items:flex-start">${parts.map((s, i) => `<img src="${img(s)}" style="width:${i ? 390 : 900}px;display:block">`).join('')}</body>`)
  await p.waitForTimeout(200)
  const hgt = await p.evaluate(() => Math.ceil(Math.max(...[...document.images].map(i => i.getBoundingClientRect().bottom))))
  await shot(p, 'r14-bal-7-top-row', { clip: { x: 0, y: 0, width: 900, height: hgt } })
  await ctx.close()
}

await browser.close(); console.log('errors:', errs)
