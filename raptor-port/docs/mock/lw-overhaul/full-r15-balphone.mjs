// Round 15 (22 Oct 26), his "/impeccable /design is there a better way to present this? On the phone. The layout, use of
// space" on round 14's balances page as drawn on a phone (full/r14-bal-5-phone.png). Impeccable layout + distill pass:
//   - one line a person, not two: the callsign's puck with the grade under it in small grey words ("Senior pilot · 36",
//     a tap opens the grade picker), the four LVE figures beside it in columns — about twice the people on a screen;
//   - the page fills the screen's width: no card inside the page, hair-thin lines between people (lesson: group with
//     space and a change of surface before another box);
//   - one row of controls, not two: ‹ Grid · 2026 ▾ · a search magnifier (opens the box) · No grade 2 · Grades · the lock
//     as one padlock button (lit when locked, the filter chip's "on" look — D882);
//   - the column headings sit straight above their figures and stay in view while the list scrolls;
//   - the grade picker opens under the tapped grade, as on the desktop.
// Built from round 14's own pieces (full-r14-bal.mjs, read between markers and run unchanged): the same people, groups,
// made-up figures (Ranger's and Saber's real) and colours. Nothing is built.
//   r15-balph-new     the page on a phone, the new layout
//   r15-balph-ba      round 14 beside round 15, the same phone
//   r15-balph-grade   a grade tapped: the picker under it
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r15-balphone.mjs      (R15_ONLY=new,ba,grade)
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo } from './full-lib.mjs'
import { oneStage, oneFold, mk, UNDER } from './full-r7-one.mjs'
const ONLY = (process.env.R15_ONLY || '').split(',').filter(Boolean)
const want = n => !ONLY.length || ONLY.includes(n)
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const DC = load(cut(SRC('full-r7-decide.mjs'), '// ---------------------------------------------------------------- shared pieces', '// ---------------------------------------------------------------- scenes'),
  { oneStage, oneFold, mk, UNDER, q, newPage, signIn, shot, gridTo, browser, state }, ['stage'])
const B = load(cut(SRC('full-r14-bal.mjs'), '// ---------------------------------------------------------------- the figures', 'let M\n{'), {},
  ['GRADES', 'model', 'roster', 'puck', 'half', 'CSS', 'openPage', 'CHEV', 'MAG', 'LOCK', 'BACK'])
const DECO = load(cut(SRC('full-r12-dot.mjs'), 'const DECO = `', 'const deco ='), {}, ['DECO']).DECO

const CSS2 = `
.zbp.ph2{left:0!important;right:0!important;padding-bottom:0!important;background:#0b0d10}
.zbp.ph2 .card{border:0;border-radius:0;background:#0b0d10}
.zbp.ph2 .bar{height:52px;padding:0 10px;gap:6px;border-bottom:1px solid #222a33;flex-wrap:nowrap}
.zbp.ph2 .btn{height:36px;padding:0 9px;font-size:14px;flex:none}
.zbp.ph2 .nog,.zbp.ph2 .lk{flex:none}
.zbp.ph2 .ic{width:36px;padding:0;justify-content:center}
.zbp.ph2 .ic svg{width:17px;height:17px}
.zbp.ph2 .nog{height:36px;padding:0 10px;font-size:14px}
.zbp.ph2 .lk{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9px;border:1px solid rgba(59,198,232,.55);background:rgba(59,198,232,.14);color:#5fd0e6}
.zbp.ph2 .lk svg{width:13px;height:15px}
.zbp.ph2 .cols,.zbp.ph2 .row{display:grid;grid-template-columns:minmax(0,1fr) 54px 44px 46px 50px;column-gap:5px;align-items:center;padding:0 12px}
.zbp.ph2 .cols{height:28px;border-bottom:1px solid #2a313a;font:600 9px system-ui;letter-spacing:.04em;color:#8a96a3;text-align:right;background:#0b0d10;white-space:nowrap}
.zbp.ph2 .cols span:first-child{text-align:left}
.zbp.ph2 .grp3{display:flex;align-items:center;height:30px;padding:0 12px;background:#10151b;border-bottom:1px solid #1d242c;font:800 12px system-ui;letter-spacing:.06em;color:#f1f4f7}
.zbp.ph2 .grp3 i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:9px}
.zbp.ph2 .grp3 em{font-style:normal;color:#8a96a3;font-weight:500;letter-spacing:0;margin-left:6px}
.zbp.ph2 .row{min-height:50px;border-bottom:1px solid #1a2027;text-align:right;font-variant-numeric:tabular-nums}
.zbp.ph2 .row.me{background:rgba(155,89,255,.07)}
.zbp.ph2 .who{display:flex;flex-direction:column;align-items:flex-start;gap:3px;min-width:0;text-align:left}
.zbp.ph2 .who .pk{width:auto;max-width:100%}
.zbp.ph2 .who .pk .cs{font-size:12.5px;padding:2px 7px;max-width:86px}
.zbp.ph2 .gd{display:inline-flex;align-items:center;gap:4px;font:500 11.5px system-ui;color:#9aa5b1;white-space:nowrap}
.zbp.ph2 .gd svg{width:8px;height:8px;color:#6b7785}
.zbp.ph2 .gd.none{color:#F2C879;font-weight:600}
.zbp.ph2 .bx{min-width:0;width:100%;height:30px;padding:0 7px;font-size:14px}
.zbp.ph2 .pend{font-size:14px}.zbp.ph2 .war{font:800 15px system-ui}
.zbp.ph2 .note2{padding:9px 12px;color:#8a96a3;font:500 12px system-ui;border-bottom:1px solid #1a2027}
.zgm.ph{width:220px}
`
function phone2(M) {
  const rows = M.map(G => `<div class="grp3"><i style="background:${G.col}"></i>${G.g}<em>${G.people.length}</em></div>` + G.people.map(m => {
    const g = m.g ? B.GRADES.find(x => x[0] === m.g) : null
    return `<div class="row${m.me ? ' me' : ''}" data-cs="${m.cs}"><span class="who">${B.puck(m)}<span class="gd${g ? '' : ' none'}">${g ? `${g[1]} · +${g[2]}` : 'No grade'}${B.CHEV}</span></span>` +
      `<span class="bx${m.app === 0 ? ' z' : ''}">${B.half(m.app)}</span><span class="bx sm${m.cf === 0 ? ' z' : ''}">${B.half(m.cf)}</span>` +
      `<span class="pend">${m.pend ? '−' + B.half(m.pend) : '<span class="z">–</span>'}</span><span class="war${m.war < 0 ? ' neg' : ''}">${B.half(m.war)}</span></div>`
  }).join('')).join('')
  const nog = M.flatMap(G => G.people).filter(m => !m.g).length
  return `<div class="card"><div class="bar zz-bar"><span class="btn ic zz-back" aria-label="Back to the grid">${B.BACK}</span><span class="btn zz-year">2026 ${B.CHEV}</span><span class="btn ic zz-srch">${B.MAG}</span>` +
    `<span class="sp"></span><span class="nog zz-nog">No grade ${nog}</span><span class="btn zz-grades">Grades</span><span class="lk zz-lock" aria-label="Locked for members">${B.LOCK}</span></div>` +
    `<div class="cols zz-cols"><span>NAME · GRADE (AUTO + LVE 1 JAN)</span><span>APP BAL</span><span>CARRIED</span><span>PENDING</span><span>WAR BAL</span></div>` +
    `<div class="scroll">${rows}<div class="cutf"></div></div></div>`
}

let M
{
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await DC.stage(p, false, {}); M = B.model(await B.roster(p)); await ctx.close()
}

async function scene(name, marks) {
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'admin')
  await DC.stage(p, true, {})
  await B.openPage(p, phone2(M), true)
  await p.evaluate(css => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); document.querySelector('.zbp').classList.add('ph2') }, CSS2)
  await p.waitForTimeout(150)
  const fit = await p.evaluate(() => {
    const over = [...document.querySelectorAll('.zbp .bar, .zbp .row, .zbp .cols')].filter(e => e.scrollWidth > e.clientWidth + 1).length
    const H = innerHeight, seen = [...document.querySelectorAll('.zbp .row')].filter(r => r.getBoundingClientRect().bottom <= H).length
    return { over, peopleInView: seen }
  })
  console.log(name, JSON.stringify(fit))
  await p.addScriptTag({ content: DECO })
  if (marks) await p.evaluate(marks)
  await shot(p, name)
  await ctx.close()
  return fit
}

if (want('new') || want('ba')) {
  await scene('r15-balph-new-clean')
  await scene('r15-balph-new', () => {
    const d = window.__d, r = document.querySelector('.zbp .row[data-cs="Ranger"]'), R = d.R(r)
    d.ring(R, 0)
    d.tag('one line a person; the grade under the name', { left: 10, bottom: innerHeight - 8 })
  })
}
if (want('ba')) {
  const { ctx, p } = await newPage(browser, 800, 844, false, null, 2)
  const img = f => 'data:image/png;base64,' + readFileSync(join(OUT, f)).toString('base64')
  const lab = (t, s) => `<div style="height:34px;display:flex;align-items:center;gap:8px;padding:0 12px;color:#f1f4f7;font:700 13.5px system-ui;background:#0b0d10;border-bottom:1px solid #2a313a"><i style="width:8px;height:8px;border-radius:50%;background:#ff2d95"></i>${t}<span style="font-weight:500;color:#b6c0cb">${s}</span></div>`
  await p.setContent(`<body style="margin:0;background:#0b0d10;display:flex;gap:20px;align-items:flex-start;font-family:system-ui">
    <div style="width:390px">${lab('Round 14:', '5 people on the screen')}<img src="${img('r14-bal-5-phone-clean.png')}" style="width:390px;display:block"></div>
    <div style="width:390px">${lab('Round 15:', 'one line a person')}<img src="${img('r15-balph-new-clean.png')}" style="width:390px;display:block"></div></body>`)
  await p.waitForTimeout(200)
  const h = await p.evaluate(() => Math.ceil(Math.max(...[...document.body.children].map(i => i.getBoundingClientRect().bottom))))
  await shot(p, 'r15-balph-ba', { clip: { x: 0, y: 0, width: 800, height: h } })
  await ctx.close()
}
if (want('grade')) {
  await scene('r15-balph-grade', GR => {
    const d = window.__d, row = document.querySelector('.zbp .row[data-cs="Wildcard"]') || document.querySelector('.zbp .row[data-cs="Ridge"]')
    row.scrollIntoView({ block: 'center' })
    const g = d.R(row.querySelector('.gd'))
    const m = document.createElement('div'); m.className = 'zgm ph'
    m.innerHTML = [['Senior pilot', 36], ['Junior pilot', 33], ['Senior WSO', 21], ['Junior WSO', 18], ['Ops A', 14]].map(([n, k]) => `<div>${n}<span class="d">+${k}</span></div>`).join('') + '<hr><div class="no on">No grade<span class="d">–</span></div>'
    Object.assign(m.style, { left: Math.max(8, g.left - 4) + 'px', top: (g.bottom + 4) + 'px' }); document.body.appendChild(m)
    d.ring(g, 2)
    const M2 = d.R(m)
    d.tag('a tap on his grade', { left: M2.right + 8 > innerWidth - 150 ? 10 : M2.right + 8, top: M2.bottom + 10 })
  })
}
await browser.close(); console.log('errors:', errs)
