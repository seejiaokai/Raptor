// Round 6 (night of 21-22 Oct 26): the Leave War's PERSON WINDOW as he asked — D1201 (every balance at once, his leave
// fitted densely, each balance editable), D1203 (a member edits his own balances until the admin locks them), widening
// D1148 (his leave by year). Drawn INTO the real window a tap on a callsign opens today (the person's every-figure
// sheet), its box, header and ✕ kept, its content re-lettered with the app's own pieces. Colours: look F (D1175).
//   cd raptor-port && LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r6-person.mjs
// Needs <scratch>/out/state.json (the staged squadron, from full-stage.mjs / full-stage2.mjs).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, mark, unmark, q, errs, OUT } from './full-lib.mjs'
import { injectCss, LOCK_SVG, CLIP_SVG } from './full-propose.mjs'
import { H, fill } from './full-win-a-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))

// look F (D1175): [r,g,b of the kind, ink, fill strength]
const KIND = {
  LL: ['242,200,110', '#FFF1CF', .22], OL: ['226,146,38', '#FFE7C7', .48], OIL: ['70,196,108', '#DDF8E6', .38],
  CCL: ['138,150,255', '#DCE0FF', .32], FCL: ['138,150,255', '#DCE0FF', .32], PL: ['138,150,255', '#DCE0FF', .32],
  EL: ['138,150,255', '#DCE0FF', .32], CL: ['138,150,255', '#DCE0FF', .32], MED: ['236,104,140', '#FFD0DD', .26],
  C: ['236,104,140', '#FFD0DD', .26],
}
const kb = (k, st = 'appr', sm) => { const [h, ink, f] = KIND[k]; return `<span class="r6-kb ${st}${sm ? ' sm' : ''}" style="--h:${h};--ink:${ink};--fill:${f}"><b>${k}</b></span>` }

const R6_CSS = `
.bidsheet .r6-hd{display:flex;align-items:center;gap:7px;margin:10px 2px 6px;font:700 10.5px/1 system-ui,sans-serif;letter-spacing:.12em;color:#8a96a3;text-transform:uppercase;min-height:26px}
.bidsheet .r6-hd .r6-lk{display:inline-flex;align-items:center;gap:5px;letter-spacing:.02em;text-transform:none;font-weight:600;font-size:12px;color:#8a96a3}
.bidsheet .r6-hd .r6-lk svg{width:11px;height:13px}
.bidsheet .r6-hd .r6-right{margin-left:auto}
.bidsheet .r6-hd .pchip{font-size:12.5px;padding:4px 10px;letter-spacing:0;text-transform:none}
.bidsheet .r6-bal{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
.bidsheet .r6-t{background:#151b22;border-radius:8px;padding:6px 7px 7px;min-height:60px;display:flex;flex-direction:column;gap:4px;min-width:0}
.bidsheet .r6-t.w2{grid-column:span 2}
.bidsheet .r6-t.med{background:transparent;box-shadow:inset 0 0 0 1px #26303a}
.bidsheet .r6-t .lb{height:18px;display:flex;align-items:center;font:800 11px/1 system-ui,sans-serif;letter-spacing:.06em;color:#b6c0cb}
.bidsheet .r6-fig{align-self:flex-start;font:700 19px/1 system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#f1f4f7;padding:3px 6px;margin-left:-6px;border-radius:6px;border:1px solid transparent;min-width:30px}
.bidsheet .r6-fig.ed{border-color:#39424D;background:#0d1217}
.bidsheet .r6-fig.neg{color:#ff8a8a}
.bidsheet .r6-fig.editing{border:2px solid #3bc6e8;padding:2px 5px;background:#0d1217}
.bidsheet .r6-fig.editing .sel{background:#2a5d8a;color:#fff;border-radius:2px;padding:0 1px}
.bidsheet .r6-fig.editing .caret{display:inline-block;width:2px;height:17px;background:#3bc6e8;vertical-align:-2px;margin-left:1px}
.bidsheet .r6-used{display:flex;align-items:center;gap:4px;font:600 11px/1.1 system-ui,sans-serif;color:#8a96a3;font-variant-numeric:tabular-nums;white-space:nowrap;min-height:14px}
.r6-kb{display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:18px;padding:0 4px;box-sizing:border-box;border-radius:4px;font:800 10px/1 system-ui,sans-serif;letter-spacing:.02em}
.r6-kb.sm{min-width:20px;height:14px;font-size:8.5px;padding:0 3px;border-radius:3px}
.r6-kb.appr{background:rgba(var(--h),var(--fill));color:var(--ink);box-shadow:inset 0 0 0 1px rgba(var(--h),.85)}
.r6-kb.wait{background:transparent;color:rgb(var(--h));outline:1px dashed rgba(var(--h),.95);outline-offset:-1px}
.r6-kb.ref{background:transparent;color:#7d8894;box-shadow:inset 0 0 0 1px #4a5560}
.r6-kb.ref b{text-decoration:line-through}
.bidsheet .r6-list{margin:0 0 2px}
.bidsheet .r6-ln{display:grid;grid-template-columns:38px minmax(0,1fr) 30px 70px 14px;align-items:center;gap:8px;padding:7px 2px;border-top:1px solid #222a33;font:600 13.5px/1.2 system-ui,sans-serif;color:#e6edf3}
.bidsheet .r6-ln .d{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bidsheet .r6-ln .n{text-align:right;font-variant-numeric:tabular-nums;color:#c9d1d9}
.bidsheet .r6-ln .s{font-size:12.5px;font-weight:600}
.bidsheet .r6-ln .s.appr{color:#b6c0cb}.bidsheet .r6-ln .s.wait{color:#f1f4f7}.bidsheet .r6-ln .s.ref{color:#8a96a3}.bidsheet .r6-ln .s.filed{color:#b6c0cb}
.bidsheet .r6-ln .clip{color:#8a96a3;display:flex}
#page-leavewar .bidsheet .rtbtn svg.r6-lksvg,body .bidsheet .rtbtn svg.r6-lksvg{display:inline-block!important;margin:0 6px -1px 0!important;color:currentColor;vertical-align:baseline}
`

// one balance tile: [label html, figure, used html, opts]
function tile(lab, fig, used, o = {}) {
  const cls = ['r6-fig', o.edit ? 'ed' : '', o.editing ? 'editing' : '', String(fig).startsWith('−') ? 'neg' : ''].filter(Boolean).join(' ')
  const f = o.editing ? `<span class="sel">${fig}</span><span class="caret"></span>` : fig
  return `<div class="r6-t${o.w2 ? ' w2' : ''}${o.med ? ' med' : ''}${o.cls ? ' ' + o.cls : ''}"><span class="lb">${lab}</span><span class="${cls}">${f}</span><span class="r6-used">${used}</span></div>`
}
// the figures: Ranger's (consistent with his list below) and Anvil's
const FIG = {
  bane: { LVE: ['9.5', `${kb('LL', 'appr', 1)} 5.5 · ${kb('OL', 'appr', 1)} 5 used`], OIL: ['1', '0.5 used'], CCL: ['2', '1 used'], FCL: ['0', ''], PL: ['0', ''], EL: ['0', ''], CL: ['2', ''], MED: ['1', 'day'] },
  shaft: { LVE: ['−1.5', `${kb('LL', 'appr', 1)} 1.5 used`], OIL: ['4', '0.5 used'], CCL: ['5', ''], FCL: ['0', ''], PL: ['0', ''], EL: ['0', ''], CL: ['0', ''], MED: ['0', 'days'] },
}
function balances(who, o) {
  const F = FIG[who]; const e = k => ({ edit: o.edit && k !== 'OIL', editing: o.editing === k })
  return `<div class="r6-bal zz-balgrid">` +
    tile('LVE', F.LVE[0], F.LVE[1], { w2: true, ...e('LVE'), cls: 'zz-lve' }) +
    tile(kb('OIL'), F.OIL[0], F.OIL[1], { cls: 'zz-oil' }) +
    ['CCL', 'FCL'].map(k => tile(kb(k), F[k][0], F[k][1], e(k))).join('') +
    ['PL', 'EL', 'CL'].map(k => tile(kb(k), F[k][0], F[k][1], e(k))).join('') +
    tile(kb('MED'), F.MED[0], F.MED[1], { w2: true, med: true, cls: 'zz-med' }) +
    `</div>`
}
// his leave: one line a request — the coloured box (look F: filled approved, dashed waiting, struck refused), the dates,
// the days, its state, a clip where it carries a document
const LEAVE = {
  bane: [
    ['C', 'appr', 'Mon 12 Jan', '1', 'filed'],
    ['LL', 'appr', 'Mon 19 – Wed 21 Jan', '3', 'appr', 1],
    ['LL', 'wait', 'Mon 26 – Tue 27 Jan', '2', 'wait'],
    ['LL', 'wait', 'Thu 29 Jan, AM', '½', 'wait'],
    ['LL', 'ref', 'Mon 2 Feb', '1', 'ref'],
    ['OIL', 'appr', 'Fri 6 Feb, PM', '½', 'appr'],
    ['OL', 'wait', 'Mon 9 – Fri 13 Mar', '5', 'wait', 1],
    ['CCL', 'appr', 'Thu 2 Apr', '1', 'appr'],
  ],
  shaft: [
    ['LL', 'appr', 'Tue 20 Jan, AM', '½', 'appr'],
    ['OIL', 'wait', 'Tue 20 Jan, PM', '½', 'wait'],
    ['LL', 'wait', 'Tue 27 Jan', '1', 'wait'],
  ],
}
const SW = { appr: 'Approved', wait: 'Waiting', ref: 'Refused', filed: 'Filed' }
const list = who => `<div class="r6-list zz-list">` + LEAVE[who].map(([k, st, d, n, s, doc]) =>
  `<div class="r6-ln">${kb(k, st)}<span class="d">${d}</span><span class="n">${n}</span><span class="s ${s}">${SW[s]}</span><span class="clip">${doc ? CLIP_SVG : ''}</span></div>`).join('') + `</div>`

const LOCKI = LOCK_SVG.replace('class="zz-lockg"', 'class="r6-lksvg"')
const LOCKED = `<span class="r6-lk zz-lk">${LOCK_SVG.replace('class="zz-lockg"', 'class="r6-lksvg"')}Locked</span>`
function personHTML(who, o = {}) {
  const right = o.lockBtn ? `<button class="rtbtn on r6-right zz-lockbtn" style="text-transform:none;letter-spacing:0">${LOCKI}Locked</button>` : ''
  return H.hd(who === 'bane' ? 'Ranger' : 'Anvil', '') +
    `<div class="r6-hd zz-balhd"><span>Balances</span>${o.locked && !o.lockBtn ? LOCKED : ''}${right}</div>` +
    balances(who, o) +
    `<div class="r6-hd zz-yr"><span>Leave</span><button class="pchip on r6-right zz-year">2026 and ahead ▾</button></div>` +
    list(who)
}

// D1173: the "Viewing as" chip goes; on a desktop the Balances drawer is folded so its figures (today's) do not sit
// beside the window's drawn ones
async function tidy(p, touch) {
  await p.evaluate(() => { const v = [...document.querySelectorAll('#page-leavewar button, #page-leavewar span, #page-leavewar div')].filter(e => /viewing as/i.test(e.textContent) && e.textContent.length < 40).sort((a, b) => a.textContent.length - b.textContent.length).pop(); if (v) v.style.visibility = 'hidden' })
  if (!touch && await p.locator(q('figures-toggle')).count()) { await p.click(q('figures-toggle')); await p.waitForTimeout(400) }
  // Ranger's LVE beside his name, in step with the window's drawn leave (an OL in March is drawn that today's demo lacks)
  await p.evaluate(() => { const c = document.querySelector('[data-testid="bal-bane"]'); if (c) { c.querySelector('.fb').textContent = '9.5'; c.querySelector('.fu b').textContent = '10.5' } })
}
async function open(p, touch, id) { await (touch ? p.tap(q('person-' + id)) : p.click(q('person-' + id))); await p.waitForTimeout(500) }
async function scene(name, { w, h, touch, who, id, o, marks }) {
  const { ctx, p } = await newPage(browser, w, h, touch, state); await signIn(p, who); await injectCss(p)
  await p.evaluate(css => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s) }, R6_CSS)
  await tidy(p, touch)
  await open(p, touch, id)
  await fill(p, personHTML(id, o))
  await p.waitForTimeout(250); await shot(p, `r6-person-${name}-clean`)
  for (const [sel, n, t, mo] of marks) await mark(p, sel, touch ? n : `${n} ${t}`, { ...(touch ? { num: true } : { right: true }), ...(mo || {}) })
  await shot(p, `r6-person-${name}`)
  if (o.years) {
    await unmark(p)
    await p.evaluate(() => {
      const b = document.querySelector('.zz-year'); const r = b.getBoundingClientRect()
      const m = document.createElement('div'); m.className = 'zz-new zz-menu'
      Object.assign(m.style, { position: 'fixed', left: (r.right - 190) + 'px', top: (r.bottom + 4) + 'px', zIndex: 999, width: '190px', background: '#1b222b', border: '1px solid #39424D', borderRadius: '10px', padding: '4px', boxShadow: '0 12px 32px rgba(0,0,0,.55)', display: 'flex', flexDirection: 'column' })
      m.innerHTML = [['2026 and ahead', 1], ['2025'], ['2024']].map(([t, on]) => `<div style="display:flex;justify-content:space-between;padding:9px 12px;border-radius:7px;font:600 14px system-ui,sans-serif;color:${on ? '#9FDCEE' : '#e6edf3'};background:${on ? 'rgba(59,198,232,.12)' : 'transparent'}"><span>${t}</span><span>${on ? '✓' : ''}</span></div>`).join('')
      document.body.appendChild(m)
    })
    await mark(p, '.zz-menu', touch ? '1' : '1 a past year, from the drop-down (D1148)', touch ? { num: true } : { right: true })
    await shot(p, `r6-person-${name}-years`)
  }
  await ctx.close()
}

// 1 — a member looking at himself, phone: every balance at once, editable; his leave one line a request
await scene('phone-member', { w: 390, h: 844, touch: true, who: 'member', id: 'bane', o: { edit: true, years: true }, marks: [
  ['.zz-balgrid', '1'], ['.zz-lve .r6-fig', '2', '', { off: 1 }], ['.zz-oil', '3'], ['.zz-med', '4'], ['.zz-year', '5'], ['.zz-list', '6'],
] })
// 2 — the same, his LVE figure tapped: it becomes a box, the figure picked so what he types replaces it (lesson 9)
await scene('phone-editing', { w: 390, h: 844, touch: true, who: 'member', id: 'bane', o: { edit: true, editing: 'LVE' }, marks: [
  ['.zz-lve .r6-fig', '1', '', { off: 5 }],
] })
// 3 — once the admin has locked the balances: a small lock, the figures read only
await scene('phone-locked', { w: 390, h: 844, touch: true, who: 'member', id: 'bane', o: { locked: true }, marks: [
  ['.zz-balhd', '1'], ['.zz-balgrid', '2'],
] })
// 4 — a member opening another man's window: what today's every-figure sheet shows him, read only
await scene('phone-other', { w: 390, h: 844, touch: true, who: 'member', id: 'shaft', o: {}, marks: [
  ['.zz-balgrid', '1'], ['.zz-list', '2'],
] })
// 5 — the admin opening Ranger's window while the balances are locked: the lock shows, and he still edits
await scene('desk-admin', { w: 1536, h: 860, touch: false, who: 'admin', id: 'bane', o: { edit: true, locked: true }, marks: [
  ['.zz-lk', '1', 'locked for members'], ['.zz-lve .r6-fig', '2', 'an admin still edits, locked or not', { off: 1 }],
] })
// 7 — lock B: one lock per person, in each man's window (admin)
await scene('lock-B', { w: 1536, h: 860, touch: false, who: 'admin', id: 'bane', o: { edit: true, locked: true, lockBtn: true }, marks: [
  ['.zz-lockbtn', 'B', 'a lock per person, on his window'],
] })

// 6 — lock A (recommended): one lock for everyone, a line in the Leave War's Settings window
{
  const { ctx, p } = await newPage(browser, 1536, 860, false, state); await signIn(p, 'admin'); await injectCss(p)
  await p.evaluate(css => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s) }, R6_CSS)
  await tidy(p, false); await p.click(q('settings-open')); await p.waitForTimeout(500)
  await p.evaluate(LOCK => {
    const sh = document.querySelector('[data-testid="settings-sheet"]') || document.querySelector('.bidsheet')
    const first = sh.querySelector('.gs-sec')
    const wrap = document.createElement('div'); wrap.className = 'zz-lockA'
    wrap.innerHTML = `<div class="gs-sec">Balances</div><div class="set-tray"><div class="set-ctrls"><button class="rtbtn on" style="text-transform:none;letter-spacing:0">${LOCK.replace('class="zz-lockg"', 'class="r6-lksvg"')}Balances locked</button></div></div>`
    first.before(wrap)
  }, LOCK_SVG)
  await p.waitForTimeout(250); await shot(p, 'r6-person-lock-A-clean')
  await mark(p, '.zz-lockA', 'A one lock for everyone (could sit in the redrawn Settings)', { right: true })
  await shot(p, 'r6-person-lock-A')
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
