// M5a round 2 (28 Oct 26): the Leave War's Balances page, redrawn on today's main from round 1's busy case
// (full-m5a-stage.mjs, clock Thu 22 Jan 26). HIS D1478: every part he approved before is drawn from its own drawing's code,
// read between markers, never re-typed — round 14's page (full-r14-bal.mjs: its styles, grade box, figures, Grades window),
// round 16's phone (full-r16-balphone.mjs, on round 15's styles: names stay, figures slide, a pinch zooms out), round 19's
// Balances icon (full-r19-nav.mjs), round 20d's pending amber (full-r20-3c.mjs) and round 1's figures for Ranger
// (full-m5a-person.mjs, RANGER_B — so the page and his window read the same). What later rulings require is changed and
// named on the side-by-side pictures: the Balances tab (D1254), no "No grade" chip (D1249), halves .5 (D1246), pending
// amber (D1251), App bal the running figure (D1479), the schedule's own puck (D1468, D1476).
// The page stands where the Approvals tab's page stands (D1420): a Balances tab is added to the real tab row, lit.
//   b1-*  the Balances view, desktop admin · b2-* the phone (rest, slid, pinched) · b3-* Days taken · b4-* the way in
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-m5a-balances.mjs        (ONLY=b1,b2,…)
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, errs, OUT, PINK } from './full-lib.mjs'
const M5CLOCK = new Date('2026-01-22T09:00:00+08:00')
const state = JSON.parse(readFileSync(join(OUT, 'm5a-state.json'), 'utf8'))
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = n => !ONLY.length || ONLY.includes(n)
const browser = await chromium.launch()
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))

// ---------------------------------------------------------------- the sole sources (D1478)
const B = load(cut(SRC('full-r14-bal.mjs'), '// ---------------------------------------------------------------- the figures', 'let M\n{'), {},
  ['GRADES', 'gradeOf', 'NOGRADE', 'OILF', 'OTHER', 'TAKEN', 'figures', 'CSS', 'CHEV', 'MAG', 'LOCK', 'grade', 'OTHERK', 'TAKENK'])
const CSS2 = load(cut(SRC('full-r15-balphone.mjs'), 'const CSS2 = `', 'function phone2'), {}, ['CSS2']).CSS2
const R16 = load(cut(SRC('full-r16-balphone.mjs'), 'const COLS = ', 'function phone3'), {}, ['COLS', 'CSS3'])
const IC = load(cut(SRC('full-r19-nav.mjs'), 'const IC = {', 'const CSS = `'), {}, ['IC']).IC
// round 19's phone tabs (approved, D1254): four tabs fit beside ⚙ with its tighter padding — today's build pads them 8px
// for three; its own lines, moved onto today's tab row's classes
const R19TABS = cut(SRC('full-r19-nav.mjs'), '#page-leavewar .zz-nav.ph .intab{', '#page-leavewar .zz-nav .intab .n')
  .split('.zz-nav.ph .intab').join('.lw-top .lw-tabs .intab')
const AMBER = cut(SRC('full-r20-3c.mjs'), '.bidsheet .r17-sum .v.pd{color:', '}').split('color:')[1]   // 20d's pending amber
const R1 = load(cut(SRC('full-m5a-person.mjs'), 'const RANGER = {', 'const NEWS'), {}, ['RANGER_B'])
const RANGER = R1.RANGER_B
const DECO = load(cut(SRC('full-r12-dot.mjs'), 'const DECO = `', 'const deco ='), {}, ['DECO']).DECO

// every rule of the drawn page lives under the Leave War's page, so the app's own puck styles reach it (the puck is cloned
// from the grid) and none of the page's own table rules can outrank it
const scope = css => css.replace(/(^|[,}])(\s*)\.(zbp|zgm|zgw)/gm, (_, a, s, c) => `${a}${s}#page-leavewar .${c}`)
// halves as .5 (D1246) — a whole number stays whole; a minus sign, not a hyphen
const fmt = n => (n < 0 ? '−' : '') + String(Math.abs(n))
const ADD = `
.zbp .pend.pd{color:${AMBER}}
/* a kind's pending figure stands after its box in a slot every row keeps, so a column's boxes stay in one line */
/* its heading stands over the box, not over the slot (D1437's rule for the Approvals columns, carried here) */
.zbp th.ok{padding-right:49px}
.zbp .opd{display:inline-block;min-width:34px;margin-left:5px;text-align:left;font:500 13.5px system-ui;color:${AMBER};font-variant-numeric:tabular-nums}
.zbp .zwho{display:inline-flex;align-items:center;min-width:150px}
.zbp .zwho .puck{flex:none}
/* the phone (round 16): the name column carries the app's own puck, its grade under it */
.zbp.ph2 .who .puck{max-width:118px}
.zbp.ph2 .oc{display:inline-flex;align-items:center;justify-content:flex-end;gap:3px}
.zbp.ph2 .oc .bx{width:40px;flex:none}
.zbp.ph2 .oc{padding-right:6px}
.zbp.ph2 .oc .opd{margin-left:0;min-width:30px;font-size:11.5px}
.zbp.ph2 .cols .ok{padding-right:39px}
`

// ---------------------------------------------------------------- the people, read off the real grid
const roster = p => p.waitForFunction(() => !!window.puck).then(() => p.evaluate(() => {
  const out = []
  for (const r of document.querySelectorAll('#page-leavewar tbody tr')) {
    if (r.classList.contains('grp')) {
      const n = r.querySelector('.gname'); if (!n) continue
      const sq = r.querySelector('.gsw')
      if (!out.some(G => G.g === n.textContent.trim())) out.push({ g: n.textContent.trim(), col: sq ? getComputedStyle(sq).backgroundColor : '#888', people: [] })
      continue
    }
    const btn = r.querySelector('[data-testid^="person-"]'), pk = btn?.querySelector('.puck')
    if (!pk || !out.length) continue
    const id = btn.dataset.testid.slice(7)
    if (out.some(G => G.people.some(m => m.id === id))) continue
    // pending days a kind, from his own cells: a hollow (pending) box counts a day, a half box half a day
    const pend = {}
    for (const td of r.querySelectorAll(`td[data-testid^="cell-${id}-2026"]`)) for (const c of td.querySelectorAll('.c')) {
      if (!/\bs-w\b/.test(c.className)) continue
      const code = c.textContent.replace(/[*<>]/g, '').trim(); if (!/^(LL|OL|CCL|FCL|PL|EL|CL)$/.test(code)) continue
      const k = /^(LL|OL)$/.test(code) ? 'LVE' : code
      pend[k] = (pend[k] || 0) + (/\b(top|bot)\b/.test(c.className) ? 0.5 : 1)
    }
    const cl = pk.className
    // the schedule's own puck, as the Approvals list draws it (sync.ts puckHtml — window.puck on a local build)
    const sp = window.puck ? window.puck(id, false, true, false).replace(' tabindex="0"', '') : pk.outerHTML
    out[out.length - 1].people.push({ id, cs: pk.querySelector('.nm').textContent.trim(), puck: '<span class="appr-puck">' + sp + '</span>', cat: pk.querySelector('.role')?.textContent.trim() || '',
      seat: /\bpers\b/.test(cl) ? 'gnd' : /\br\b/.test(cl) ? 'wso' : 'pilot', me: r.classList.contains('me'), pend })
  }
  return out
}))
function model(groups) {
  return groups.filter(G => G.people.length).map(G => ({ ...G, people: G.people.map(m => {
    const g = B.NOGRADE.includes(m.cs) ? null : m.seat === 'gnd' ? 'oa' : B.gradeOf(m.seat, m.cat, G.g)
    if (m.cs === 'Ranger') {
      // round 1's figures exactly (RANGER_B): App bal 15 incl. 2 carried fwd, 2.5 pending, War bal 12.5
      const o = {}, op = {}
      for (const k of B.OTHERK) { o[k] = +RANGER.other[k][0]; op[k] = +(RANGER.other[k][1] || 0) }
      // (round 1 writes the pending figure with its minus sign, "−2.5"; the grid's own cells must agree with it)
      const pend = Math.abs(parseFloat(RANGER.pend.replace('−', '-')))
      if ((m.pend.LVE || 0) !== pend) console.warn('RANGER PENDING DIFFERS: grid', JSON.stringify(m.pend), 'round 1', pend)
      return { ...m, g, app: +RANGER.app, cf: +RANGER.cf, pend, war: +RANGER.war, oil: +RANGER.oil, other: o, opend: op, taken: B.TAKEN[m.cs] || {} }
    }
    const { app, cf } = B.figures(m.cs, g), pend = m.pend.LVE || 0
    const op = {}; for (const k of B.OTHERK) op[k] = m.pend[k] || 0
    return { ...m, g, app, cf, pend, war: app - pend, oil: B.OILF[m.cs] || 0, other: B.OTHER[m.cs] || {}, opend: op, taken: B.TAKEN[m.cs] || {} }
  }) }))
}

// ---------------------------------------------------------------- the page, round 14's markup with the later rulings
const bx = (v, sm) => `<span class="bx${sm ? ' sm' : ''}${v === 0 ? ' z' : ''}">${fmt(v)}</span>`
const who = m => `<span class="zwho">${m.puck}</span>`
const SEG = view => `<span class="seg zz-seg"><span class="${view === 'bal' ? 'on' : ''}">Balances</span><span class="${view === 'bal' ? '' : 'on'}">Days taken</span></span>`
function deskHTML(M, view, o = {}) {
  const OK = B.OTHERK, TK = B.TAKENK
  const head = view === 'bal'
    ? `<tr class="h1"><th class="l" colspan="2"></th><th class="span sep" colspan="4">LVE</th><th class="sep"></th><th class="span sep" colspan="5">OTHER LEAVE</th><th></th></tr>
       <tr class="h2"><th class="l">NAME</th><th class="l">GRADE · AUTO + LVE ON 1 JAN</th><th class="sep">APP BAL</th><th>INCL. CARRIED FWD</th><th>PENDING</th><th>WAR BAL</th><th class="sep">OIL</th>${OK.map((k, i) => `<th class="ok${i ? '' : ' sep'}">${k}</th>`).join('')}<th style="width:100%"></th></tr>`
    : `<tr class="h1"><th class="l" colspan="2"></th><th class="span sep" colspan="${TK.length}">DAYS TAKEN IN JAN – DEC 26</th><th></th></tr>
       <tr class="h2"><th class="l">NAME</th><th class="l">GRADE · AUTO + LVE ON 1 JAN</th>${TK.map((k, i) => `<th${i ? '' : ' class="sep"'} style="min-width:46px">${k}</th>`).join('')}<th style="width:100%"></th></tr>`
  const span = view === 'bal' ? 13 : TK.length + 3
  const body = M.map(G => `<tr class="grp"><td colspan="${span}"><i style="background:${G.col}"></i>${G.g}<em>${G.people.length}</em></td></tr>` + G.people.map(m => {
    const cells = view === 'bal'
      ? `<td class="sep" data-zk="app">${bx(m.app)}</td><td data-zk="cf">${bx(m.cf, 1)}</td><td class="pend${m.pend ? ' pd' : ''}" data-zk="pend">${m.pend ? '−' + fmt(m.pend) : '<span class="z">–</span>'}</td><td class="war${m.war < 0 ? ' neg' : ''}" data-zk="war">${fmt(m.war)}</td>` +
        `<td class="sep oil" data-zk="oil">${m.oil ? fmt(m.oil) : '<span class="z">0</span>'}<span class="ch">›</span></td>` +
        OK.map((k, i) => `<td${i ? '' : ' class="sep"'} data-zk="o-${k}">${bx(m.other[k] || 0, 1)}<span class="opd">${m.opend[k] ? '−' + fmt(m.opend[k]) : ''}</span></td>`).join('')
      : TK.map((k, i) => `<td${i ? '' : ' class="sep"'}>${m.taken[k] ? fmt(m.taken[k]) : '<span class="z">–</span>'}</td>`).join('')
    return `<tr data-cs="${m.cs}"${m.me ? ' class="me"' : ''}><td class="l">${who(m)}</td><td class="l" data-zk="grade">${B.grade(m.g)}</td>${cells}<td></td></tr>`
  }).join('')).join('')
  // the bar: Balances | Days taken first (D1248), the search, then Grades… and the lock at the right (D1247) — the same bar
  // in both views. No year picker of its own: Days taken counts the period picked in View, as Approvals does (D1184), so
  // the screen never shows two year controls that could disagree (the design look of 28 Oct 26)
  return `<div class="card"><div class="bar zz-bar">` + SEG(view) +
    `<span class="srch">${B.MAG}Find a person</span><span class="sp"></span>` +
    `<span class="btn zz-grades">Grades…</span>` +
    `<span class="lock${o.unlocked ? '' : ' on'} zz-lock">${B.LOCK}Lock for members<span class="sw"></span></span>` +
    `</div><div class="scroll"><table class="zz-table"><thead>${head}</thead><tbody>${body}</tbody></table><div class="cutf"></div></div></div>`
}
// round 16's phone (round 15's styles): one sideways scroller holds the headings and the rows; the names stay put
function phoneHTML(M, view) {
  const OK = B.OTHERK, TK = B.TAKENK
  const head = view === 'bal'
    ? `<div class="cols zz-cols"><span>NAME · GRADE</span><span>APP BAL</span><span>CARRIED</span><span>PENDING</span><span>WAR BAL</span><span class="sep">OIL</span>${OK.map((k, i) => `<span class="ok${i ? '' : ' sep'}">${k}</span>`).join('')}</div>`
    : `<div class="cols zz-cols"><span>NAME · GRADE</span>${TK.map((k, i) => `<span${i ? '' : ' class="sep"'}>${k}</span>`).join('')}</div>`
  const rows = M.map(G => `<div class="grp3"><span class="gl"><i style="background:${G.col}"></i>${G.g}<em>${G.people.length}</em></span></div>` + G.people.map(m => {
    const g = m.g ? B.GRADES.find(x => x[0] === m.g) : null
    const nm = `<span class="who">${m.puck}<span class="gd${g ? '' : ' none'}">${g ? `${g[1]} · +${g[2]}` : 'No grade'}${B.CHEV}</span></span>`
    const cells = view === 'bal'
      ? `${bx(m.app)}${bx(m.cf, 1)}<span class="pend${m.pend ? ' pd' : ''}">${m.pend ? '−' + fmt(m.pend) : '<span class="z">–</span>'}</span><span class="war${m.war < 0 ? ' neg' : ''}">${fmt(m.war)}</span>` +
        `<span class="oil sep">${m.oil ? fmt(m.oil) : '<span class="z">0</span>'}<span class="ch">›</span></span>` +
        OK.map((k, i) => `<span class="oc${i ? '' : ' sep'}">${bx(m.other[k] || 0, 1)}<span class="opd">${m.opend[k] ? '−' + fmt(m.opend[k]) : ''}</span></span>`).join('')
      : TK.map((k, i) => `<span${i ? '' : ' class="sep"'}>${m.taken[k] ? fmt(m.taken[k]) : '<span class="z">–</span>'}</span>`).join('')
    return `<div class="row${m.me ? ' me' : ''}" data-cs="${m.cs}">${nm}${cells}</div>`
  }).join('')).join('')
  return `<div class="card"><div class="bar zz-bar">${SEG(view)}<span class="btn ic">${B.MAG}</span><span class="sp"></span>` +
    `<span class="btn">Grades</span><span class="lk" aria-label="Locked for members">${B.LOCK}</span>` + `</div>` +
    `<div class="hs zz-hs">${head}<div class="scroll">${rows}</div></div><div class="cutf"></div></div>`
}
// the phone's columns: round 16's, the five other kinds wide enough for a box and its pending figure; Days taken narrower
const PH_COLS = { bal: '132px 54px 44px 46px 50px 50px 76px 76px 76px 76px 76px', taken: '132px' + ' 40px'.repeat(11) }

// ---------------------------------------------------------------- staging on the real app
async function open(p, phone) {
  // the Approvals tab's page is where a tab's page stands (D1420); a Balances tab joins the row, lit (D1254)
  await p.click('[data-testid="lw-tab-approvals"]'); await p.waitForTimeout(600)
  await p.evaluate(ic => {
    const ap = document.querySelector('[data-testid="lw-tab-approvals"]')
    const b = ap.cloneNode(true); b.removeAttribute('data-testid'); b.dataset.zz = 'tab-bal'; b.title = 'Everyone’s balances and grades'
    b.querySelector('.appr-tabn')?.remove(); b.querySelector('svg')?.insertAdjacentHTML('beforebegin', ic); b.querySelectorAll('svg')[1]?.remove()
    b.querySelector('.intab-t').textContent = 'Balances'
    ap.setAttribute('aria-selected', 'false'); b.setAttribute('aria-selected', 'true')
    document.querySelector('[data-testid="oil-tracker"]').before(b)
  }, IC.bal)
  await p.waitForTimeout(150)
}
async function place(p, html, phone, css) {
  await p.evaluate(([css, html, phone]) => {
    if (!document.getElementById('zzbal')) { const s = document.createElement('style'); s.id = 'zzbal'; s.textContent = css; document.head.appendChild(s) }
    const sec = document.querySelector('[data-testid="approvals-page"]'), S = sec.getBoundingClientRect()
    sec.style.visibility = 'hidden'
    const d = document.createElement('div'); d.className = 'zbp' + (phone ? ' ph ph2' : ''); d.innerHTML = html
    Object.assign(d.style, phone ? { left: '0px', right: '0px', top: S.top + 'px', bottom: '0px' } : { left: (S.left + 20) + 'px', right: (innerWidth - S.right + 20) + 'px', top: (S.top + 14) + 'px', bottom: '8px' })
    document.querySelector('#page-leavewar').appendChild(d)
  }, [css, html, phone])
  await p.waitForTimeout(250)
}
const deskCSS = () => scope(B.CSS + ADD)
const phoneCSS = view => scope(B.CSS + CSS2 + R16.CSS3.split(R16.COLS).join(PH_COLS[view]) + ADD) + R19TABS + '#page-leavewar .lw-top .lw-tabs .intab{min-width:0}\n'
async function scene(name, phone, view, o = {}) {
  const [w, h] = phone ? [o.w || 402, 874] : [1536, 864]
  const { ctx, p } = await newPage(browser, w, h, phone, state)
  await p.clock.setFixedTime(M5CLOCK)
  await signIn(p, 'admin')
  if (!M) { M = model(await roster(p)); console.log('groups', M.map(G => G.g + ':' + G.people.length).join(' ')); console.log('Ranger', JSON.stringify(M.flatMap(G => G.people).find(m => m.cs === 'Ranger'), (k, v) => k === 'puck' ? undefined : v)) }
  await open(p, phone)
  if (phone) {
    await place(p, phoneHTML(M, view), true, phoneCSS(view))
    const fit = await p.evaluate(([zoom, slide]) => {
      const hs = document.querySelector('.zz-hs')
      // pinched out: the zoom at which every column is on the screen
      if (zoom === 'fit') zoom = Math.floor(hs.clientWidth / hs.scrollWidth * 100) / 100
      hs.style.height = (innerHeight - hs.getBoundingClientRect().top) / zoom + 'px'; hs.style.overflowY = 'hidden'
      if (zoom !== 1) hs.style.zoom = zoom
      // slid: the first of the other kinds (or of Days taken's kinds) stands right beside the names
      if (slide) { const h = [...document.querySelectorAll('.zz-cols > span')]; const at = h.find(s => s.textContent === 'CCL') || h[1]; hs.scrollLeft = at.offsetLeft - h[0].offsetWidth }
      const bar = document.querySelector('.zz-bar'), tabs = document.querySelector('.lw-tabs'), oil = document.querySelector('[data-testid="oil-tracker"]')
      return { barOver: bar.scrollWidth - bar.clientWidth, tabsOver: tabs.scrollWidth - tabs.clientWidth, oilRight: Math.round(oil.getBoundingClientRect().right), gearLeft: Math.round(document.querySelector('[data-testid="settings-open"]').getBoundingClientRect().left), width: hs.scrollWidth, room: hs.clientWidth, zoom }
    }, [o.zoom || 1, !!o.slide])
    console.log(name, 'fit', JSON.stringify(fit))
  } else {
    await place(p, deskHTML(M, view, o), false, deskCSS())
    console.log(name, 'table / room', JSON.stringify(await p.evaluate(() => { const t = document.querySelector('.zz-table'); return [Math.round(t.scrollWidth), Math.round(t.parentElement.clientWidth)] })))
  }
  if (o.after) await o.after(p)
  await p.mouse.move(2, 2)
  await shot(p, name, o.clip ? { clip: await o.clip(p) } : {})
  await ctx.close()
}
// numbered pink tags ON elements (they ride with them — observation 617)
const tag = (p, list) => p.evaluate(([list, PINK]) => {
  for (const [sel, lab, nth] of list) {
    const el = [...document.querySelectorAll(sel)][nth || 0]; if (!el) { console.warn('MISS', sel); continue }
    el.style.outline = `2px solid ${PINK}`; el.style.outlineOffset = '2px'
    const r = el.getBoundingClientRect(), t = document.createElement('div'); t.textContent = lab
    Object.assign(t.style, { position: 'fixed', left: Math.min(innerWidth - 24, r.right - 10) + 'px', top: Math.max(2, r.top - 11) + 'px', background: PINK, color: '#fff', font: '700 12px/1 system-ui', padding: '4px 6px', borderRadius: '10px', zIndex: 2147483647, boxShadow: '0 0 0 2px #0b0d10' })
    document.body.appendChild(t)
  }
}, [list, PINK])
// two or more pictures side by side on one sheet, each with its caption
async function sheet(name, items, h) {
  const { ctx, p } = await newPage(browser, 1600, 900, false, null, 1.5)
  // a name is a picture of this run; 'full/…' is an approved drawing kept in the repo
  const img = f => 'data:image/png;base64,' + readFileSync(f.startsWith('full/') ? new URL('./' + f + '.png', import.meta.url) : join(OUT, f + '.png')).toString('base64')
  await p.setContent(`<body style="margin:0;padding:14px;background:#0b0d10;color:#c9d1d9;font:600 15px system-ui;display:flex;gap:18px;align-items:flex-start">` +
    items.map(([f, cap, wpx]) => `<figure style="margin:0;width:${wpx}px"><figcaption style="margin:0 0 8px">${cap}</figcaption><img src="${img(f)}" style="width:${wpx}px;display:block;border:1px solid #2a313a;border-radius:6px"></figure>`).join('') + '</body>')
  await p.waitForTimeout(250)
  const dim = await p.evaluate(() => [Math.ceil(document.body.scrollWidth), Math.ceil(Math.max(...[...document.querySelectorAll('figure')].map(f => f.getBoundingClientRect().bottom))) + 14])
  await p.setViewportSize({ width: dim[0], height: Math.max(dim[1], 200) })
  await shot(p, name, { clip: { x: 0, y: 0, width: dim[0], height: dim[1] } })
  await ctx.close()
}
let M

// ======================= b1 — the Balances view, desktop admin =======================
if (want('b1')) {
  await scene('m5b-b1-desk', false, 'bal')
  await scene('m5b-b1-desk-marked', false, 'bal', { after: p => tag(p, [
    ['[data-zz="tab-bal"]', '1'], ['.zz-seg', '2'], ['tr[data-cs="Ranger"] [data-zk="app"] .bx', '3'], ['tr[data-cs="Ranger"] [data-zk="pend"]', '4'],
    ['tr[data-cs="Ranger"] [data-zk="o-CCL"] .opd', '5'], ['tr[data-cs="Ranger"] .zwho', '6']] ) })
  // the approved drawing beside the new one (D1478): round 14's whole page and this page, both at their own scale
  await sheet('m5b-b1-vs-r14', [['full/r14-bal-1-desk','Round 14 (approved parts: the grade box, OIL ›, Lock for members)', 760], ['m5b-b1-desk-marked', 'Now: each change numbered', 760]])
}
// a label pinned at the foot of a phone picture, round 16's way
const foot = (p, label) => p.addScriptTag({ content: DECO }).then(() => p.evaluate(l => window.__d.tag(l, { left: 10, bottom: innerHeight - 10 }), label))

// ======================= b2 — the phone, admin: at rest, slid sideways, pinched out (round 16's three) =======================
if (want('b2')) {
  await scene('m5b-b2-rest', true, 'bal', { after: p => foot(p, 'slide sideways: OIL, CCL, FCL… are there') })
  await scene('m5b-b2-slid', true, 'bal', { slide: 1, after: p => foot(p, 'slid: the names stay, the figures move') })
  await scene('m5b-b2-pinch', true, 'bal', { zoom: 'fit', after: p => foot(p, 'pinched out: every column on the screen') })
  await scene('m5b-b2-rest-marked', true, 'bal', { after: p => tag(p, [['[data-zz="tab-bal"]', '1'], ['.zz-seg', '2'], ['.row[data-cs="Ranger"] .bx', '3'], ['.row[data-cs="Ranger"] .pend', '4'], ['.row[data-cs="Ranger"] .who', '5']]) })
  await scene('m5b-b2-slid-marked', true, 'bal', { slide: 1, after: p => tag(p, [['.row[data-cs="Ranger"] .oc .opd', '6']]) })
  await sheet('m5b-b2-three', [['m5b-b2-rest', 'At rest', 360], ['m5b-b2-slid', 'Slid sideways', 360], ['m5b-b2-pinch', 'Pinched out', 360]])
  await sheet('m5b-b2-vs-r16', [['full/r16-balph-three', 'Round 16 (D1236: names stay, figures slide, pinch)', 900], ['m5b-b2-rest-marked', 'Now, at rest', 300], ['m5b-b2-slid-marked', 'Now, slid', 300]])
}

// ======================= b3 — Days taken (D1248), desktop and phone =======================
if (want('b3')) {
  await scene('m5b-b3-desk', false, 'taken')
  await scene('m5b-b3-desk-marked', false, 'taken', { after: p => tag(p, [['.zz-seg', '1'], ['.zz-table tr.h1 th.span', '2'], ['tr[data-cs="Ranger"] td.sep', '3']]) })
  await scene('m5b-b3-phone', true, 'taken', { after: p => foot(p, 'Days taken: the kinds slide sideways too') })
  await sheet('m5b-b3-vs-r14', [['full/r14-bal-3-taken', 'Round 14 (B4, approved as recommended)', 760], ['m5b-b3-desk-marked', 'Now', 760]])
}

// ======================= b4 — the way in: the tab, and the ⚙ beside it =======================
if (want('b4')) {
  await scene('m5b-b4-way-in', false, 'bal', {
    after: p => tag(p, [['[data-zz="tab-bal"]', '1'], ['[data-testid="settings-open"]', '2']]),
    clip: async p => ({ x: 0, y: 56, width: 1536, height: 136 }) })
}
// ======================= b5 — the four tabs on a narrower iPhone, letters as wide as an iPhone's =======================
if (want('b5')) for (const w of [375, 402]) {
  await scene('m5b-b5-tabs-' + w, true, 'bal', { w, after: async p => {
    const r = await p.evaluate(() => {
      const s = document.createElement('style'); s.textContent = '#page-leavewar .lw-tabs .intab-t{letter-spacing:.07em}'; document.head.appendChild(s)
      const t = document.querySelector('.lw-tabs'), oil = document.querySelector('[data-testid="oil-tracker"]').getBoundingClientRect()
      const lab = [...t.querySelectorAll('.intab')].map(b => b.scrollWidth - b.clientWidth)
      return { over: t.scrollWidth - t.clientWidth, oilRight: Math.round(oil.right), gearLeft: Math.round(document.querySelector('[data-testid="settings-open"]').getBoundingClientRect().left), tabOver: lab }
    })
    console.log('tabs at', w, 'wide letters', JSON.stringify(r))
  }, clip: async () => ({ x: 0, y: 50, width: w, height: 60 }) })
}
// the fit for a narrow iPhone: under 400 wide the tabs drop their icons, the words and the count kept
if (want('b5')) await scene('m5b-b5-tabs-375-noicons', true, 'bal', { w: 375, after: p => p.addStyleTag({ content: '#page-leavewar .lw-tabs .intab-t{letter-spacing:.07em}#page-leavewar .lw-tabs .intab .btnglyph{display:none}' }), clip: async () => ({ x: 0, y: 50, width: 375, height: 60 }) })
await browser.close(); console.log('errors:', errs)
