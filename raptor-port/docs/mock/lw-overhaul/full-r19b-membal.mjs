// Round 19b (22 Oct 26), his "A member should also be able to see balances yeah?" on round 19's member phone (tabs
// Grid · OIL). Members already see balances three ways (the grid's Balances fold, My leave, a tap on anyone's name —
// r7-23); drawn here is the other way: a member gets the Balances tab too, READ ONLY — round 16's phone page with no
// boxes (nothing to type), no grade arrows, no "No grade", no "Grades", no lock switch; his own row lit.
//   r19b-membal-phone   a member's phone, the Balances tab open
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r19b-membal.mjs
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
const CSS3 = load(cut(SRC('full-r16-balphone.mjs'), 'const COLS = ', 'function phone3'), {}, ['CSS3']).CSS3
const IC = load(cut(SRC('full-r19-nav.mjs'), 'const IC = {', 'const CSS = `'), {}, ['IC']).IC
const NAVCSS = load(cut(SRC('full-r19-nav.mjs'), 'const CSS = `', 'async function page('), {}, ['CSS']).CSS

// round 16's phone page, read only: figures as plain text where the admin's has boxes
function phoneRO(M) {
  const OK = ['CCL', 'FCL', 'PL', 'EL', 'CL']
  const num = (v, cls = '') => `<span class="ro${v === 0 ? ' z' : ''}${cls}">${B.half(v)}</span>`
  const head = `<div class="cols zz-cols"><span>NAME · GRADE</span><span>APP BAL</span><span>CARRIED</span><span>PENDING</span><span>WAR BAL</span><span class="sep">OIL</span>${OK.map((k, i) => `<span${i ? '' : ' class="sep"'}>${k}</span>`).join('')}</div>`
  const rows = M.map(G => `<div class="grp3"><span class="gl"><i style="background:${G.col}"></i>${G.g}<em>${G.people.length}</em></span></div>` + G.people.map(m => {
    const g = m.g ? B.GRADES.find(x => x[0] === m.g) : null
    return `<div class="row${m.me ? ' me' : ''}" data-cs="${m.cs}"><span class="who">${B.puck(m)}<span class="gd ro-gd">${g ? g[1] : '–'}</span></span>` +
      num(m.app) + num(m.cf) +
      `<span class="pend">${m.pend ? '−' + B.half(m.pend) : '<span class="z">–</span>'}</span><span class="war${m.war < 0 ? ' neg' : ''}">${B.half(m.war)}</span>` +
      `<span class="oil sep">${m.oil ? B.half(m.oil) : '<span class="z">0</span>'}<span class="ch">›</span></span>` +
      OK.map((k, i) => `<span${i ? '' : ' class="sep"'}>${num(m.other[k] || 0)}</span>`).join('') + `</div>`
  }).join('')).join('')
  return `<div class="card"><div class="bar zz-bar"><span class="btn">2026 ${B.CHEV}</span><span class="btn ic">${B.MAG}</span><span class="sp"></span></div>` +
    `<div class="hs zz-hs">${head}<div class="scroll">${rows}</div></div><div class="cutf"></div></div>`
}
const ROCSS = `
.zbp.ph2 .ro{display:inline-flex;align-items:center;justify-content:flex-end;height:30px;font:700 14px system-ui;color:#f1f4f7;font-variant-numeric:tabular-nums}
.zbp.ph2 .ro.z{color:#7d8894;font-weight:500}
.zbp.ph2 .ro-gd{color:#9aa5b1}
`

let M
{
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin')
  await DC.stage(p, false, {}); M = B.model(await B.roster(p)); await ctx.close()
}
// a member's view: Ranger signed in, his row lit
for (const G of M) for (const m of G.people) m.me = m.cs === 'Ranger'

{
  // drawn on the admin's staged page (its first row carries what openPage places against), then turned into a member's
  const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'admin')
  await DC.stage(p, true, {})
  await B.openPage(p, phoneRO(M), true)
  await p.evaluate(([css, IC]) => {
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s)
    const pg = document.querySelector('#page-leavewar'), top = pg.querySelector('.topbar'), fil = pg.querySelector('.filters')
    const nav = document.createElement('div'); nav.className = 'zz-nav ph'
    const T = (k, label, on) => `<button type="button" role="tab" class="intab" aria-selected="${on}" data-zz="tab-${k}">${IC[k]}<span class="intab-t">${label}</span></button>`
    nav.innerHTML = `<div class="inputs-tabs" role="tablist" data-zz="tabs">${T('grid', 'Grid', false)}${T('bal', 'Balances', true)}${T('oil', 'OIL', false)}</div>`
    top.before(nav); top.style.display = 'none'; fil.style.display = 'none'; pg.querySelectorAll('.zrow3').forEach(n => n.remove())
    const z = document.querySelector('.zbp'); z.classList.add('ph2')
    z.style.top = (nav.getBoundingClientRect().bottom + 6) + 'px'
    const hs = document.querySelector('.zz-hs'); hs.style.height = (innerHeight - hs.getBoundingClientRect().top - 8) + 'px'; hs.style.overflowY = 'hidden'
  }, [CSS2 + CSS3 + ROCSS + NAVCSS.replace(/#page-leavewar /g, ''), IC])
  await mk(p, '[data-zz="tab-bal"]', '1', { prefer: ['s'] })
  await p.mouse.move(2, 2)
  await shot(p, 'r19b-membal-phone')
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
