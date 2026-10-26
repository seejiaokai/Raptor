// Round 16 (22 Oct 26), his "For B how does the phone show like CCL FCL etc on those balances … Can I pinch to zoom as
// well … standardisation … speed. Lesser taps" (D1236): the balances page on a phone shows EVERY balance the desktop
// shows, on the page, no tap to reach one — the way the grid works (D1228, lesson 17): the names stay put while the
// figures slide sideways (a cut column at the right edge shows there is more), and a pinch zooms the list out.
// Round 15's phone page (one line a person) with the columns the desktop has: App bal · Carried · Pending · War bal ·
// OIL › · CCL · FCL · PL · EL · CL. Built from round 14's and round 15's own pieces, read between markers, unchanged.
//   r16-balph-rest     at rest: LVE's four figures, OIL cut at the edge
//   r16-balph-slid     slid sideways: the names stay, OIL and the five other kinds in view
//   r16-balph-pinch    pinched out: every column on the screen
//   r16-balph-three    the three side by side
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r16-balphone.mjs
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo } from './full-lib.mjs'
import { oneStage, oneFold, mk, UNDER } from './full-r7-one.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const DC = load(cut(SRC('full-r7-decide.mjs'), '// ---------------------------------------------------------------- shared pieces', '// ---------------------------------------------------------------- scenes'),
  { oneStage, oneFold, mk, UNDER, q, newPage, signIn, shot, gridTo, browser, state }, ['stage'])
const B = load(cut(SRC('full-r14-bal.mjs'), '// ---------------------------------------------------------------- the figures', 'let M\n{'), {},
  ['GRADES', 'model', 'roster', 'puck', 'half', 'CSS', 'openPage', 'CHEV', 'MAG', 'LOCK', 'BACK'])
const CSS2 = load(cut(SRC('full-r15-balphone.mjs'), 'const CSS2 = `', 'function phone2'), {}, ['CSS2']).CSS2
const DECO = load(cut(SRC('full-r12-dot.mjs'), 'const DECO = `', 'const deco ='), {}, ['DECO']).DECO

const COLS = '132px 54px 44px 46px 50px 50px 46px 46px 46px 46px 46px'
const CSS3 = `
.zbp.ph2 .hs{overflow-x:auto;overflow-y:hidden;flex:none;scrollbar-width:none}
.zbp.ph2 .hs::-webkit-scrollbar{display:none}
.zbp.ph2 .hs .scroll{overflow:visible;width:max-content;min-width:100%;flex:none}
.zbp.ph2 .cols,.zbp.ph2 .row{grid-template-columns:${COLS};width:max-content;padding:0 12px 0 0}
.zbp.ph2 .cols>span:first-child,.zbp.ph2 .row>.who{position:sticky;left:0;z-index:2;padding-left:12px;align-self:stretch;display:flex;flex-direction:column;justify-content:center}
.zbp.ph2 .cols>span:first-child{background:#0b0d10;flex-direction:row;align-items:center;justify-content:flex-start}
.zbp.ph2 .row>.who{background:#0b0d10}
.zbp.ph2 .row.me>.who{background:#120f1a}
.zbp.ph2 .grp3{width:max-content;min-width:100%;box-sizing:border-box;padding:0}
.zbp.ph2 .grp3 .gl{position:sticky;left:0;padding-left:12px;display:inline-flex;align-items:center;background:#10151b;height:100%}
.zbp.ph2 .cols .sep,.zbp.ph2 .row .sep{border-left:1px solid #222a33;padding-left:6px}
.zbp.ph2 .oil{font:600 14px system-ui;color:#e6edf3;display:inline-flex;justify-content:flex-end;gap:5px}
.zbp.ph2 .oil .ch{color:#5fd0e6;font-weight:700}
.zbp.ph2 .bx.sm{min-width:0}
`
function phone3(M) {
  const OK = ['CCL', 'FCL', 'PL', 'EL', 'CL']
  const head = `<div class="cols zz-cols"><span>NAME · GRADE</span><span>APP BAL</span><span>CARRIED</span><span>PENDING</span><span>WAR BAL</span><span class="sep">OIL</span>${OK.map((k, i) => `<span${i ? '' : ' class="sep"'}>${k}</span>`).join('')}</div>`
  const rows = M.map(G => `<div class="grp3"><span class="gl"><i style="background:${G.col}"></i>${G.g}<em>${G.people.length}</em></span></div>` + G.people.map(m => {
    const g = m.g ? B.GRADES.find(x => x[0] === m.g) : null
    return `<div class="row${m.me ? ' me' : ''}" data-cs="${m.cs}"><span class="who">${B.puck(m)}<span class="gd${g ? '' : ' none'}">${g ? `${g[1]} · +${g[2]}` : 'No grade'}${B.CHEV}</span></span>` +
      `<span class="bx${m.app === 0 ? ' z' : ''}">${B.half(m.app)}</span><span class="bx sm${m.cf === 0 ? ' z' : ''}">${B.half(m.cf)}</span>` +
      `<span class="pend">${m.pend ? '−' + B.half(m.pend) : '<span class="z">–</span>'}</span><span class="war${m.war < 0 ? ' neg' : ''}">${B.half(m.war)}</span>` +
      `<span class="oil sep">${m.oil ? B.half(m.oil) : '<span class="z">0</span>'}<span class="ch">›</span></span>` +
      OK.map((k, i) => `<span${i ? '' : ' class="sep"'}><span class="bx sm${(m.other[k] || 0) === 0 ? ' z' : ''}">${B.half(m.other[k] || 0)}</span></span>`).join('') + `</div>`
  }).join('')).join('')
  const nog = M.flatMap(G => G.people).filter(m => !m.g).length
  // one sideways scroller holds the headings and the rows, so they slide together; the list scrolls down inside it
  return `<div class="card"><div class="bar zz-bar"><span class="btn ic" aria-label="Back to the grid">${B.BACK}</span><span class="btn">2026 ${B.CHEV}</span><span class="btn ic">${B.MAG}</span>` +
    `<span class="sp"></span><span class="nog">No grade ${nog}</span><span class="btn">Grades</span><span class="lk" aria-label="Locked for members">${B.LOCK}</span></div>` +
    `<div class="hs zz-hs">${head}<div class="scroll">${rows}</div></div><div class="cutf"></div></div>`
}

let M
{
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await DC.stage(p, false, {}); M = B.model(await B.roster(p)); await ctx.close()
}

const shots = []
for (const [v, slide, zoom, label] of [
  ['rest', 0, 1, 'slide sideways: OIL, CCL, FCL… are there'],
  ['slid', 1, 1, 'slid: the names stay, the figures move'],
  ['pinch', 0, 0.56, 'pinched out: every column on the screen'],
]) {
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'admin')
  await DC.stage(p, true, {})
  await B.openPage(p, phone3(M), true)
  const fit = await p.evaluate(([css2, css3, slide, zoom]) => {
    const s = document.createElement('style'); s.textContent = css2 + css3; document.head.appendChild(s)
    const z = document.querySelector('.zbp'); z.classList.add('ph2')
    const hs = document.querySelector('.zz-hs')
    if (zoom !== 1) hs.style.zoom = zoom; hs.style.height = ((innerHeight - hs.getBoundingClientRect().top * (zoom !== 1 ? 1 / zoom : 1) * (zoom !== 1 ? zoom : 1)) / zoom) + "px"; hs.style.overflowY = "hidden"
    if (zoom !== 1) hs.style.zoom = zoom
    if (slide) hs.scrollLeft = hs.scrollWidth
    const bar = document.querySelector('.zz-bar')
    return { barOver: bar.scrollWidth > bar.clientWidth + 1, width: hs.scrollWidth, room: hs.clientWidth, left: hs.scrollLeft }
  }, [CSS2, CSS3, slide, zoom])
  console.log(v, JSON.stringify(fit))
  await p.addScriptTag({ content: DECO })
  await p.evaluate(label => { window.__d.tag(label, { left: 10, bottom: innerHeight - 10 }) }, label)
  await shot(p, 'r16-balph-' + v)
  shots.push(join(OUT, 'r16-balph-' + v + '.png'))
  await ctx.close()
}
{
  const { ctx, p } = await newPage(browser, 1210, 844, false, null, 2)
  const img = f => 'data:image/png;base64,' + readFileSync(f).toString('base64')
  await p.setContent(`<body style="margin:0;background:#0b0d10;display:flex;gap:20px;align-items:flex-start">${shots.map(s => `<img src="${img(s)}" style="width:390px;display:block">`).join('')}</body>`)
  await p.waitForTimeout(200)
  await shot(p, 'r16-balph-three', { clip: { x: 0, y: 0, width: 1210, height: 844 } })
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
