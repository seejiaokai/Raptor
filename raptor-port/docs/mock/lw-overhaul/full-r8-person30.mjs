// Round 8 (22 Oct 26): his question on r7-23 — "how would this look like when there are like 30 inputs, is it
// scrollable?" The same window (Ranger, a member, opening Anvil's on his iPhone, 390×844 at 3×) holding 30 leave lines
// this year. The design drawn (the host's decision, from the design guide, D686, D706, D997): the window stands at the
// foot, as tall as the visible screen less 24px; its title bar, the Balances grid, the LEAVE heading with its year
// picker and the list's column headings stay fixed; only the list scrolls, inside the window (a finger on it never
// scrolls the page behind — D686); a thin fade at the list's foot says there is more, gone at the end.
// THE 30 LINES ARE INVENTED (Anvil's real figures are two lines); so are the balances shown with them. Bidding is open
// 1 Jan – 31 Mar (the set's demo), so only lines in those months wait or are refused; a line after March was filed on
// the Inputs page and is approved (D1166, D1177).
//   cd raptor-port && LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r8-person30.mjs
// Needs <scratch>/out/state.json (the staged squadron). Shared parts: full-r7-one.mjs; the window's look copied from
// full-r7-person.mjs (that script draws every scene when imported, so its pieces are repeated here, unchanged).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT } from './full-lib.mjs'
import { oneStage, mk, unmk } from './full-r7-one.mjs'
import { LOCK_SVG } from './full-propose.mjs'
import { H, fill } from './full-win-a-lib.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const LOCKI = LOCK_SVG.replace('class="zz-lockg"', 'class="r7-lk"')
const NODOT = '<i class="zd off" aria-hidden="true"></i>'

// look F (D1175), as full-r7-person.mjs
const KIND = {
  LL: ['242,200,110', '#FFF1CF', .22], OL: ['226,146,38', '#FFE7C7', .48], OIL: ['70,196,108', '#DDF8E6', .38],
  CCL: ['138,150,255', '#DCE0FF', .32], FCL: ['138,150,255', '#DCE0FF', .32], PL: ['138,150,255', '#DCE0FF', .32],
  EL: ['138,150,255', '#DCE0FF', .32], CL: ['138,150,255', '#DCE0FF', .32], CSE: ['184,142,240', '#EEE2FF', .32],
  OD: ['160,170,182', '#E6EBF0', .26], MED: ['236,104,140', '#FFD0DD', .26],
}
const kb = (k, st = 'appr', sm) => { const [h, ink, f] = KIND[k]; return `<span class="r7-kb ${st}${sm ? ' sm' : ''}" style="--h:${h};--ink:${ink};--fill:${f}"><b>${k}</b></span>` }

const CSS = `
#page-leavewar td.r7-f > .c{visibility:hidden}
#page-leavewar td.r7-f > .mk.more{display:none}
.r7-cb{position:absolute;left:2px;right:2px;top:2px;bottom:2px;display:flex;align-items:center;justify-content:center;border-radius:3px;font:800 10px/1 system-ui;z-index:2;pointer-events:none;box-sizing:border-box}
.r7-cb.am{bottom:calc(50% + 1px);font-size:7px}.r7-cb.pm{top:calc(50% + 1px);font-size:7px}
.r7-cb.l{right:calc(50% + 1px);font-size:8px}.r7-cb.r{left:calc(50% + 1px);font-size:8px}
.r7-cb.appr{background:rgba(var(--h),var(--fill));color:var(--ink);box-shadow:inset 0 0 0 1px rgba(var(--h),.85)}
.r7-cb.wait{color:rgb(var(--h));outline:1px dashed rgba(var(--h),.95);outline-offset:-1px}
.r7-cb.ref{color:#7d8894;box-shadow:inset 0 0 0 1px #4a5560;text-decoration:line-through}
.bidsheet .r7-hd{display:flex;align-items:center;gap:8px;margin:10px 2px 6px;font:700 10.5px/1 system-ui,sans-serif;letter-spacing:.12em;color:#8a96a3;text-transform:uppercase;min-height:26px}
.bidsheet .r7-hd .r7-lkt{display:inline-flex;align-items:center;gap:5px;letter-spacing:.02em;text-transform:none;font-weight:600;font-size:12px;color:#8a96a3}
.bidsheet .r7-hd svg.r7-lk{width:11px;height:13px;display:inline-block}
.bidsheet .r7-hd .r7-right{margin-left:auto}
.bidsheet .r7-hd .pchip{font-size:12.5px;padding:4px 10px;letter-spacing:0;text-transform:none}
.bidsheet .r7-bal{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
.bidsheet .r7-t{background:#151b22;border-radius:8px;padding:6px 7px 7px;min-height:60px;display:flex;flex-direction:column;gap:4px;min-width:0}
.bidsheet .r7-t.w2{grid-column:span 2}
.bidsheet .r7-t.med{background:transparent;box-shadow:inset 0 0 0 1px #26303a}
.bidsheet .r7-t .lb{height:18px;display:flex;align-items:center;font:800 11px/1 system-ui,sans-serif;letter-spacing:.06em;color:#b6c0cb}
.bidsheet .r7-fr{display:flex;align-items:center;gap:6px}
.bidsheet .r7-fig{align-self:flex-start;font:700 19px/1 system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#f1f4f7;padding:3px 6px;margin-left:-6px;border-radius:6px;border:1px solid transparent;min-width:30px;box-sizing:border-box}
.bidsheet .r7-fig.neg{color:#ff8a8a}
.bidsheet .r7-go{color:#5fd0e6;font:700 16px/1 system-ui;margin-left:-2px}
.bidsheet .r7-used{display:flex;align-items:center;gap:4px;font:600 11px/1.1 system-ui;color:#8a96a3;font-variant-numeric:tabular-nums;white-space:nowrap;min-height:14px}
.r7-kb{display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:18px;padding:0 4px;box-sizing:border-box;border-radius:4px;font:800 10px/1 system-ui;letter-spacing:.02em}
.r7-kb.sm{min-width:20px;height:14px;font-size:8.5px;padding:0 3px;border-radius:3px}
.r7-kb.appr{background:rgba(var(--h),var(--fill));color:var(--ink);box-shadow:inset 0 0 0 1px rgba(var(--h),.85)}
.r7-kb.wait{background:transparent;color:rgb(var(--h));outline:1px dashed rgba(var(--h),.95);outline-offset:-1px}
.r7-kb.ref{background:transparent;color:#7d8894;box-shadow:inset 0 0 0 1px #4a5560}
.r7-kb.ref b{text-decoration:line-through}
.bidsheet .r7-ln{display:grid;grid-template-columns:7px 36px minmax(0,1fr) 26px 66px 12px;align-items:center;column-gap:8px;row-gap:3px;padding:7px 2px;border-top:1px solid #222a33;font:600 13.5px/1.2 system-ui;color:#e6edf3}
.bidsheet .r7-ln .d{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bidsheet .r7-ln .n{text-align:right;font-variant-numeric:tabular-nums;color:#c9d1d9}
.bidsheet .r7-ln .s{font-size:12.5px;font-weight:600}
.bidsheet .r7-ln .s.appr{color:#b6c0cb}.bidsheet .r7-ln .s.wait{color:#f1f4f7}.bidsheet .r7-ln .s.ref{color:#8a96a3}
.bidsheet .r7-hdr{display:grid;grid-template-columns:7px 36px minmax(0,1fr) 26px 66px 12px;column-gap:8px;padding:0 2px 5px;font:700 9px/1 system-ui;letter-spacing:.12em;color:#6b7785}
.bidsheet .r7-hdr .n{text-align:right}
/* ---- round 8: the window a fixed column; only the list scrolls inside it ---- */
.bidsheet.zz-tall{display:flex!important;flex-direction:column!important;overflow:hidden!important}
.bidsheet.zz-tall > *{flex:none}
.bidsheet.zz-tall > .zz-lwrap{flex:1 1 auto;min-height:0;position:relative;margin:0 -2px;padding:0 2px}
.bidsheet .zz-list{height:100%;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.bidsheet .zz-list::-webkit-scrollbar{display:none}
.bidsheet .zz-list .r7-ln:first-child{border-top-color:#2a323c}
/* the fade at the list's foot: there is more below (gone at the end) */
.bidsheet .zz-fade{position:absolute;left:0;right:0;bottom:0;height:34px;pointer-events:none;background:linear-gradient(rgba(18,22,27,0),var(--zbg,#12161b) 92%)}
/* the phone's own scroll indicator, shown while the finger moves it (drawn on the scrolled pictures only) */
.bidsheet .zz-ind{position:absolute;right:0;width:3px;border-radius:2px;background:rgba(200,210,220,.55);pointer-events:none}
`

async function gridAsBuilt(p) {
  await p.evaluate(KIND => {
    for (const td of document.querySelectorAll('#page-leavewar td[data-testid^="cell-"]')) {
      const chips = [...td.querySelectorAll(':scope > .c')]; if (!chips.length) continue
      const es = chips.map(c => ({ code: c.textContent.replace(/[<>*]/g, '').replace(/\+\d+$/, '').trim(), cls: c.className })).filter(e => KIND[e.code])
      if (!es.length) continue
      td.classList.add('r7-f'); if (getComputedStyle(td).position === 'static') td.style.position = 'relative'
      const put = (e, pos) => {
        const [h, ink, f] = KIND[e.code]; const st = /\bappr\b/.test(e.cls) ? 'appr' : /\bref\b/.test(e.cls) ? 'ref' : 'wait'
        const b = document.createElement('span'); b.className = `r7-cb ${st} ${pos}`; b.style.cssText = `--h:${h};--ink:${ink};--fill:${f}`; b.textContent = e.code; td.appendChild(b)
      }
      if (es.length === 1) put(es[0], /\bam\b/.test(es[0].cls) ? 'am' : /\bpm\b/.test(es[0].cls) ? 'pm' : '')
      else { put(es[0], /\bam\b/.test(es[0].cls) ? 'am' : 'l'); put(es[1], /\bpm\b/.test(es[1].cls) ? 'pm' : 'r') }
    }
  }, KIND)
}

// Anvil's year — 30 lines, INVENTED: [kind, state, dates, days]
const LINES = [
  ['LL', 'appr', 'Fri 2 Jan', '1'],
  ['LL', 'appr', 'Tue 20 Jan, AM', '½'],
  ['LL', 'wait', 'Tue 27 Jan', '1'],
  ['OIL', 'appr', 'Fri 30 Jan', '1'],
  ['LL', 'ref', 'Mon 9 Feb', '1'],
  ['LL', 'wait', 'Thu 19 – Fri 20 Feb', '2'],
  ['CCL', 'appr', 'Wed 25 Feb', '1'],
  ['LL', 'wait', 'Mon 2 – Wed 4 Mar', '3'],
  ['OIL', 'wait', 'Fri 13 Mar, PM', '½'],
  ['CSE', 'appr', 'Mon 16 – Fri 27 Mar', '10'],
  ['OL', 'ref', 'Mon 30 – Tue 31 Mar', '2'],
  ['OL', 'appr', 'Mon 6 – Fri 10 Apr', '5'],
  ['LL', 'appr', 'Thu 30 Apr', '1'],
  ['OD', 'appr', 'Mon 11 – Fri 15 May', '5'],
  ['LL', 'appr', 'Fri 22 May', '1'],
  ['PL', 'appr', 'Mon 1 Jun', '1'],
  ['MED', 'appr', 'Wed 10 – Thu 11 Jun', '2'],
  ['LL', 'appr', 'Mon 22 – Tue 23 Jun', '2'],
  ['OIL', 'appr', 'Fri 3 Jul', '1'],
  ['LL', 'appr', 'Mon 13 – Fri 17 Jul', '5'],
  ['OL', 'appr', 'Mon 3 – Fri 7 Aug', '5'],
  ['LL', 'appr', 'Mon 24 Aug, AM', '½'],
  ['CCL', 'appr', 'Fri 4 Sep', '1'],
  ['LL', 'appr', 'Mon 14 – Tue 15 Sep', '2'],
  ['EL', 'appr', 'Thu 1 Oct', '1'],
  ['LL', 'appr', 'Mon 19 – Fri 23 Oct', '5'],
  ['OIL', 'appr', 'Fri 6 Nov', '1'],
  ['LL', 'appr', 'Mon 16 Nov, PM', '½'],
  ['OL', 'appr', 'Mon 21 – Thu 24 Dec', '4'],
  ['LL', 'appr', 'Mon 28 – Tue 29 Dec', '2'],
]
const SW = { appr: 'Approved', wait: 'Waiting', ref: 'Refused' }
const num = s => s === '½' ? .5 : parseFloat(s)
const half = v => (Math.floor(v) ? Math.floor(v) : '') + (v % 1 ? '½' : '') || '0'
// the balances that go with them (INVENTED): LVE 44 a year, LL and OL drawn from it, a bid off it as it is placed (D1153)
const sum = (ks, st) => LINES.filter(l => ks.includes(l[0]) && l[1] === st).reduce((a, l) => a + num(l[3]), 0)
const lveUsed = sum(['LL', 'OL'], 'appr'), lveWait = sum(['LL', 'OL'], 'wait'), lveLeft = 44 - lveUsed - lveWait
console.log('LVE used', lveUsed, 'waiting', lveWait, 'left', lveLeft)

function tile(lab, fig, used, o = {}) {
  const cls = ['r7-fig', String(fig).startsWith('−') ? 'neg' : ''].filter(Boolean).join(' ')
  return `<div class="r7-t${o.w2 ? ' w2' : ''}${o.med ? ' med' : ''}${o.cls ? ' ' + o.cls : ''}"><span class="lb">${lab}</span><span class="r7-fr"><span class="${cls}">${fig}</span>${o.go ? '<span class="r7-go">›</span>' : ''}</span><span class="r7-used">${used}</span></div>`
}
const usedOf = k => { const u = sum([k], 'appr'), w = sum([k], 'wait'); return u ? `${half(u)} used` : w ? `${half(w)} waiting` : '' }
const balances = () => `<div class="r7-bal zz-balgrid">` +
  tile('LVE', String(lveLeft).replace('.5', '½'), `${half(lveUsed)} used · ${half(lveWait)} waiting`, { w2: true, cls: 'zz-lve' }) +
  tile(kb('OIL'), '1', usedOf('OIL'), { go: true }) + tile(kb('CCL'), '1', usedOf('CCL')) + tile(kb('FCL'), '0', '') +
  tile(kb('PL'), '0', usedOf('PL')) + tile(kb('EL'), '1', usedOf('EL')) + tile(kb('CL'), '0', '') +
  tile(kb('MED'), '2', 'days', { w2: true, med: true }) + `</div>`
const personHTML = () => H.hd('Anvil', '') +
  `<div class="r7-hd zz-balhd"><span>Balances</span><span class="r7-lkt zz-lk">${LOCKI}Locked</span></div>` + balances() +
  `<div class="r7-hd zz-yr"><span>Leave</span><span class="zz-cnt" style="letter-spacing:0;text-transform:none;font:600 12px system-ui;color:#6b7785">${LINES.length}</span><button class="pchip on r7-right zz-year">2026 and ahead ▾</button></div>` +
  `<div class="r7-hdr zz-hdr"><span></span><span>KIND</span><span>DATES</span><span class="n">DAYS</span><span></span><span></span></div>` +
  `<div class="zz-lwrap"><div class="r7-list zz-list">` +
  LINES.map(([k, st, d, n]) => `<div class="r7-ln">${NODOT}${kb(k, st)}<span class="d">${d}</span><span class="n">${n}</span><span class="s ${st}">${SW[st]}</span><span class="clip"></span></div>`).join('') +
  `</div><div class="zz-fade"></div></div>`

const { ctx, p } = await newPage(browser, 390, 844, true, state); await signIn(p, 'member')
await p.evaluate(css => { const st = document.createElement('style'); st.id = 'r8css'; st.textContent = css; document.head.appendChild(st) }, CSS)
await oneStage(p, { phone: true, member: true }); await gridAsBuilt(p)
await p.tap(q('person-shaft')); await p.waitForTimeout(500)
await fill(p, personHTML()); await p.waitForTimeout(150)
// the window at the foot, as tall as the visible screen less 24px (D706, D997's height rule)
const geo = await p.evaluate(() => {
  const d = [...document.querySelectorAll('.bidsheet')].filter(e => e.getBoundingClientRect().width).pop()
  d.classList.add('zz-tall')
  const h = innerHeight - 24
  Object.assign(d.style, { left: '12px', right: '12px', width: 'auto', maxWidth: 'none', top: 'auto', bottom: '0px', height: h + 'px', maxHeight: h + 'px', transform: 'none' })
  d.style.setProperty('--zbg', getComputedStyle(d).backgroundColor)
  const l = d.querySelector('.zz-list'), r = l.getBoundingClientRect()
  const rows = [...l.querySelectorAll('.r7-ln')].map(e => e.getBoundingClientRect())
  const full = rows.filter(x => x.top >= r.top - .5 && x.bottom <= r.bottom + .5).length
  return { winTop: Math.round(d.getBoundingClientRect().top), winH: Math.round(d.getBoundingClientRect().height), listTop: Math.round(r.top), listH: Math.round(r.height), rowH: +(rows[1].top - rows[0].top).toFixed(1), fullRows: full, content: l.scrollHeight, bg: getComputedStyle(d).backgroundColor }
})
console.log('geometry', geo)

const scrollTo = (where, ind) => p.evaluate(([where, ind]) => {
  const d = document.querySelector('.bidsheet.zz-tall'), l = d.querySelector('.zz-list'), w = d.querySelector('.zz-lwrap')
  const max = l.scrollHeight - l.clientHeight
  // land on a row's edge, as a finger flick settles
  const rowH = l.querySelector('.r7-ln:nth-child(2)').offsetTop - l.querySelector('.r7-ln').offsetTop
  l.scrollTop = where === 'end' ? max : where === 'mid' ? Math.round(max / 2 / rowH) * rowH : 0
  d.querySelector('.zz-fade').style.display = l.scrollTop >= max - 1 ? 'none' : ''
  w.querySelector('.zz-ind')?.remove()
  if (ind) {
    const i = document.createElement('div'); i.className = 'zz-ind'
    const h = Math.max(24, l.clientHeight * l.clientHeight / l.scrollHeight)
    i.style.height = h + 'px'; i.style.top = (3 + (l.clientHeight - h - 6) * (l.scrollTop / max)) + 'px'; w.appendChild(i)
  }
  const first = [...l.querySelectorAll('.r7-ln')].findIndex(e => e.getBoundingClientRect().bottom > l.getBoundingClientRect().top + 2)
  return { scrollTop: l.scrollTop, max, firstRow: first + 1 }
}, [where, ind])

const marks = async four => {
  await mk(p, '.zz-balgrid', '1')
  await mk(p, '.zz-lwrap', '2', { off: -2, prefer: ['e', 'w', 'in'] })
  await mk(p, '.zz-hdr', '3', { off: 0, prefer: ['e', 'w', 'ne'] })
  if (four) await mk(p, '.zz-fade', '4', { ring: false, prefer: ['in', 'inb'] })
}
for (const [name, where, ind, four] of [['r8-person-30-top', 'top', false, true], ['r8-person-30-scrolled', 'mid', true, false], ['r8-person-30-end', 'end', true, false]]) {
  await unmk(p)
  console.log(name, await scrollTo(where, ind))
  await shot(p, name + '-clean')
  await marks(four)
  await shot(p, name)
}
await ctx.close()
await browser.close(); console.log('errors:', errs)
