// Round 21 (22 Oct 26), his "/impeccable /design is there a better way to design the events" — the events study, drawn
// before G3 is decided. One busy squadron for every way (his facts: up to three events on one day; an event may run
// several days; an event may have only a name, its short form then made from it): round 20b's six extra counters and
// these events, Manning folded on a phone (G4) and open on a desktop, months then dates then Manning (G1, G2):
//   PH  New Year's Day          1 Jan        public holiday (the column already reads green)
//   FAM Familiarisation week    5–7 Jan      untagged
//   OPS Ops planning day        6 Jan        working event
//   SIM Simulator refresher     6 Jan        untagged
//   ACM Air combat training     7 Jan        untagged
//   EX  Squadron exercise       12–13 Jan    working event
//   SD  Sports Day              23 Jan       a name only: its short form made from it
//   NL  No leave                26–30 Jan    no leave (the column reads orange)
//   EX  Exercise                9–13 Feb     working event
//   PH  Chinese New Year        17–18 Feb    public holiday
// The three ways:
//   A  r21-ev-a-<dev>   G3 + G3b as drawn in round 20: the day's first event under its date, a number for more; an
//                       "▸ Events" fold line under the dates opens today's Event rows
//   B  r21-ev-b-<dev>   an events lane: every event a thin bar across the days it runs, in its kind's colour, packed
//                       into as few lanes as the period needs (3 here, as Tue 6 Jan holds three); no row to pick
//   C  r21-ev-c-<dev>   leave events only: a tag in the date heading only where an event changes leave (PH, OFF, NL);
//                       any other event a small dot under the date; all of a day's events in the day panel
//   r21-ev-b-zoom-desk  B close up, Jan, so the bars read at full size
//   cd raptor-port ; LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-r21-events.mjs
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, errs, OUT, gridTo, PINK } from './full-lib.mjs'
import { oneStage, oneFold, mk, UNDER } from './full-r7-one.mjs'
const browser = await chromium.launch()
const state = JSON.parse(readFileSync(join(OUT, 'state.json'), 'utf8'))
const SRC = f => readFileSync(new URL('./' + f, import.meta.url), 'utf8')
const cut = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker missing: ' + a + ' … ' + b); return s.slice(i, j) }
const load = (code, deps, names) => new Function(...Object.keys(deps), code.replace(/^export /gm, '') + `\n;return { ${names.join(', ')} }`)(...Object.values(deps))
const DC = load(cut(SRC('full-r7-decide.mjs'), '// ---------------------------------------------------------------- shared pieces', '// ---------------------------------------------------------------- scenes'),
  { oneStage, oneFold, mk, UNDER, q, newPage, signIn, shot, gridTo, browser, state }, ['stage'])
const N = load(cut(SRC('full-r19-nav.mjs'), 'const IC = {', 'const res = {}'), { newPage, signIn, DC, state, browser }, ['page', 'draw'])

const EVENTS = [
  { s: 'PH', name: "New Year's Day", from: '2026-01-01', to: '2026-01-01', kind: 'off' },
  { s: 'FAM', name: 'Familiarisation week', from: '2026-01-05', to: '2026-01-07', kind: null },
  { s: 'OPS', name: 'Ops planning day', from: '2026-01-06', to: '2026-01-06', kind: 'work' },
  { s: 'SIM', name: 'Simulator refresher', from: '2026-01-06', to: '2026-01-06', kind: null },
  { s: 'ACM', name: 'Air combat training', from: '2026-01-07', to: '2026-01-07', kind: null },
  { s: 'EX', name: 'Squadron exercise', from: '2026-01-12', to: '2026-01-13', kind: 'work' },
  { s: 'SD', name: 'Sports Day', from: '2026-01-23', to: '2026-01-23', kind: null },
  { s: 'NL', name: 'No leave', from: '2026-01-26', to: '2026-01-30', kind: 'nolv' },
  { s: 'EX', name: 'Exercise', from: '2026-02-09', to: '2026-02-13', kind: 'work' },
  { s: 'PH', name: 'Chinese New Year', from: '2026-02-17', to: '2026-02-18', kind: 'off' },
]
const COUNTERS = [['IP', -14], ['SXO', -18], ['IWSO', -22], ['OPS P', -12], ['OPS W', -6], ['FL P', -9]]

const CSS = `
#page-leavewar th.day .zz-evt{display:block;margin:2px auto 0;width:max-content;padding:0 4px;border-radius:4px;font:700 9px/14px system-ui;letter-spacing:.02em;background:rgba(160,170,182,.16);color:#d6dde4;position:relative}
#page-leavewar th.day .zz-evt.off{background:rgba(74,201,126,.22);color:#c9f2d8}
#page-leavewar th.day .zz-evt.nolv{background:rgba(242,139,46,.24);color:#fbddbc}
#page-leavewar th.day .zz-evt.free{background:rgba(180,190,200,.22);color:#e6ebef}
#page-leavewar th.day .zz-evt i{position:absolute;right:-7px;top:-6px;min-width:12px;height:12px;border-radius:6px;background:#5fd0e6;color:#04222b;font:800 8px/12px system-ui;font-style:normal;text-align:center}
#page-leavewar th.day .zz-evt.none{visibility:hidden}
#page-leavewar th.day .zz-dot{display:block;margin:4px auto 0;width:5px;height:5px;border-radius:50%;background:#8a96a3}
#page-leavewar th.day .zz-dot.none{visibility:hidden}
#page-leavewar .zz-evfold td{height:24px;padding:0;border-bottom:1px solid #2a313a;background:#10151b}
#page-leavewar .zz-evfold td.zz-evf-l{font:700 11px/24px system-ui;letter-spacing:.06em;color:#c9d1d9;padding-left:10px;white-space:nowrap}
#page-leavewar .zz-evfold td.zz-evf-l em{font-style:normal;color:#8a96a3;font-weight:600}
#page-leavewar .zz-lanes tr{height:var(--zz-lh)!important}
#page-leavewar .zz-lanes td{height:var(--zz-lh)!important;min-height:0!important;max-height:var(--zz-lh);line-height:0!important;padding:0!important;border-bottom:0!important;background:transparent;overflow:visible;font-size:0;vertical-align:top}
#page-leavewar .zz-lanes tr:last-child td{border-bottom:1px solid #2a313a!important}
#page-leavewar .zz-lanes td.zz-ln-l{text-align:left!important;font:700 10px/var(--zz-lh) system-ui!important;letter-spacing:.08em;color:#8a96a3;padding-left:10px!important;white-space:nowrap;vertical-align:middle;background:#10151b}
#page-leavewar .zz-lanes .zz-bar{position:absolute;left:1px;top:2px;height:calc(var(--zz-lh) - 4px);border-radius:3px;z-index:3;box-sizing:border-box;padding:0 5px;
  font:700 var(--zz-fs)/calc(var(--zz-lh) - 4px) system-ui;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:clip;
  background:rgba(160,170,182,.20);color:#dfe5ea;border:1px solid rgba(160,170,182,.32)}
#page-leavewar .zz-lanes .zz-bar.off{background:rgba(74,201,126,.26);color:#d4f5e0;border-color:rgba(74,201,126,.55)}
#page-leavewar .zz-lanes .zz-bar.nolv{background:rgba(242,139,46,.28);color:#fde3c6;border-color:rgba(242,139,46,.6)}
#page-leavewar .zz-lanes .zz-bar.free{background:rgba(180,190,200,.24);color:#eef2f5;border-color:rgba(180,190,200,.5)}
#page-leavewar .zz-lanes .zz-bar.work{color:#ff9e93}
#page-leavewar .zz-lanes .zz-bar b{font-weight:800;margin-right:5px}
#page-leavewar .zz-lanes .zz-bar span{font-weight:500;opacity:.92}
`
// the six counters in, the stored Event rows written with the same events (a lane each, as the store keeps them)
async function setup(p, lanes) {
  return p.evaluate(([CSS, COUNTERS, EVENTS, lanes]) => {
    const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s)
    const pg = document.querySelector('#page-leavewar'), t = pg.querySelector('table.mx')
    const counts = t.querySelector(':scope > tbody.counts'), ev = t.querySelector(':scope > tbody.events')
    const src = counts?.querySelector('[data-testid="fly-row-avail-p"]'), first = counts?.rows[0]
    if (counts) for (const [name, off] of COUNTERS) {
      const tr = src.cloneNode(true); tr.removeAttribute('data-testid'); tr.classList.add('zz-ctr')
      const lab = tr.cells[0]; const a = lab.querySelector('a, span, button') || lab
      a.textContent = name
      for (const td of [...tr.cells].slice(1)) { const v = parseFloat(td.textContent); if (!isNaN(v)) td.textContent = String(Math.max(0, Math.round(v + off))); td.removeAttribute('data-testid') }
      tr.style.backgroundImage = 'none'; for (const td of tr.cells) td.style.backgroundImage = 'none'
      counts.insertBefore(tr, first)
    }
    // where each date's cell sits in an Event row (read before anything is cloned)
    const idx = {}; [...ev.rows[0].cells].forEach((c, i) => { const m = (c.dataset.testid || '').match(/^event-0-(.+)$/); if (m) idx[m[1]] = i })
    window.__zzIdx = idx
    while (ev.rows.length < 3) { const r = ev.rows[ev.rows.length - 1].cloneNode(true); r.querySelectorAll('[data-testid]').forEach(e => e.removeAttribute('data-testid')); const lab = r.cells[0]; if (lab) lab.textContent = 'EVENT ' + (ev.rows.length + 1); ev.appendChild(r) }
    for (const r of ev.rows) for (const c of [...r.cells].slice(1)) if (Object.values(idx).includes([...r.cells].indexOf(c))) { c.textContent = '+'; c.className = 'ev tap editable' }
    const days = (a, b) => { const out = []; for (let d = new Date(a + 'T00:00:00Z'); d <= new Date(b + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)) out.push(d.toISOString().slice(0, 10)); return out }
    EVENTS.forEach((e, k) => { for (const iso of days(e.from, e.to)) { const c = ev.rows[lanes[k]]?.cells[idx[iso]]; if (c) { c.textContent = e.s; c.className = 'ev has tap editable' } } })
    // the no-leave week's columns read orange, as the app draws a "nolv" event (matrix.css .evnolv)
    for (const iso of days('2026-01-26', '2026-01-30')) {
      t.querySelector(`th.day[data-testid="head-${iso}"]`)?.classList.add('evnolv')
      for (const r of t.querySelectorAll(':scope > tbody > tr')) { const c = r.cells[idx[iso]]; if (c && c.tagName === 'TD' && !r.closest('.events')) c.classList.add('evnolv') }
    }
    for (const o of pg.querySelectorAll('.mxband, .lw-bidbox')) o.style.display = 'none'
    return Object.keys(idx).length
  }, [CSS, COUNTERS, EVENTS, lanes])
}
// G1, G2: months, then dates, then Manning; the month band row goes
async function order(p) {
  return p.evaluate(() => {
    const t = document.querySelector('#page-leavewar table.mx'), tb = c => t.querySelector(':scope > tbody.' + c)
    const counts = tb('counts'), strip = tb('mstripe'), head = tb('mxhead')
    const band = head.querySelector('tr.mbrak'); if (band) band.style.display = 'none'
    const first = t.querySelector(':scope > tbody'); t.insertBefore(strip, first); t.insertBefore(head, strip.nextSibling); if (counts) t.insertBefore(counts, head.nextSibling)
  })
}
async function wayA(p, EVENTS) {
  return p.evaluate(EVENTS => {
    const t = document.querySelector('#page-leavewar table.mx'), head = t.querySelector(':scope > tbody.mxhead'), ev = t.querySelector(':scope > tbody.events')
    for (const th of head.querySelectorAll('th.day[data-testid^="head-"]')) {
      const iso = th.dataset.testid.slice(5), list = EVENTS.filter(e => e.from <= iso && iso <= e.to)
      const e = document.createElement('span'); e.className = 'zz-evt ' + (list[0]?.kind || '') + (list.length ? '' : ' none')
      e.innerHTML = list.length ? list[0].s + (list.length > 1 ? `<i>${list.length}</i>` : '') : '·'; th.appendChild(e)
    }
    ev.style.display = 'none'
    const tbf = document.createElement('tbody'); tbf.className = 'zz-evfold'
    const tr = ev.rows[0].cloneNode(true); tr.querySelectorAll('[data-testid]').forEach(e => e.removeAttribute('data-testid'))
    ;[...tr.cells].forEach((c, i) => { c.textContent = ''; c.className = i ? 'zz-evf-c' : 'zz-evf-l' })
    tr.cells[0].innerHTML = '▸ Events <em>· 3</em>'; tbf.appendChild(tr); t.insertBefore(tbf, head.nextSibling)
    return 'A'
  }, EVENTS)
}
// B: pack the events into lanes, earliest first, longer first on a tie; each lane takes the first event that fits
function pack(evs) {
  const order_ = evs.map((e, k) => k).sort((a, b) => evs[a].from.localeCompare(evs[b].from) || evs[b].to.localeCompare(evs[a].to))
  const ends = [], lane = []
  for (const k of order_) { let l = ends.findIndex(end => end < evs[k].from); if (l < 0) { l = ends.length; ends.push('') } ends[l] = evs[k].to; lane[k] = l }
  return lane
}
async function wayB(p, EVENTS, lane, phone) {
  return p.evaluate(([EVENTS, lane, phone]) => {
    const t = document.querySelector('#page-leavewar table.mx'), head = t.querySelector(':scope > tbody.mxhead'), ev = t.querySelector(':scope > tbody.events')
    const idx = window.__zzIdx, n = Math.max(...lane) + 1
    const tb = document.createElement('tbody'); tb.className = 'zz-lanes'
    tb.style.setProperty('--zz-lh', phone ? '20px' : '17px'); tb.style.setProperty('--zz-fs', phone ? '10px' : '10px')
    for (let l = 0; l < n; l++) {
      const tr = ev.rows[0].cloneNode(true); tr.querySelectorAll('[data-testid]').forEach(e => e.removeAttribute('data-testid'))
      ;[...tr.cells].forEach((c, i) => { c.textContent = ''; c.className = i ? 'zz-ln-c' : 'zz-ln-l'; c.removeAttribute('title') })
      if (tr.cells[1] && !Object.values(idx).includes(1)) tr.cells[1].className = 'zz-ln-l'
      tr.cells[0].textContent = l === 0 ? 'EVENTS' : ''
      tb.appendChild(tr)
    }
    ev.style.display = 'none'; t.insertBefore(tb, head.nextSibling)
    const cv = document.createElement('canvas').getContext('2d'); cv.font = '700 10px system-ui'
    const days = (a, b) => { const out = []; for (let d = new Date(a + 'T00:00:00Z'); d <= new Date(b + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)) out.push(d.toISOString().slice(0, 10)); return out }
    const out = []
    EVENTS.forEach((e, k) => {
      const ds = days(e.from, e.to).filter(iso => idx[iso] != null); if (!ds.length) return
      const row = tb.rows[lane[k]], a = row.cells[idx[ds[0]]], b = row.cells[idx[ds[ds.length - 1]]]
      const w = b.offsetLeft + b.offsetWidth - a.offsetLeft - 2
      a.style.position = 'relative'
      const bar = document.createElement('div'); bar.className = 'zz-bar ' + (e.kind || ''); bar.style.width = w + 'px'
      // the full name where the bar has room for it beside its short form, else the short form alone
      const need = cv.measureText(e.s + '  ' + e.name).width + 14
      bar.innerHTML = need <= w ? `<b>${e.s}</b><span>${e.name}</span>` : `<b style="margin:0">${e.s}</b>`
      // a short form alone: centred, no side padding and a step smaller where its day is narrow, so three letters fit
      if (need > w) { bar.style.textAlign = 'center'; bar.style.padding = '0'; if (w < 30) bar.style.fontSize = '9px' }
      a.appendChild(bar); out.push([e.s, Math.round(w), need <= w])
    })
    return { lanes: n, bars: out }
  }, [EVENTS, lane, phone])
}
async function wayC(p, EVENTS) {
  return p.evaluate(EVENTS => {
    const t = document.querySelector('#page-leavewar table.mx'), head = t.querySelector(':scope > tbody.mxhead'), ev = t.querySelector(':scope > tbody.events')
    for (const th of head.querySelectorAll('th.day[data-testid^="head-"]')) {
      const iso = th.dataset.testid.slice(5), list = EVENTS.filter(e => e.from <= iso && iso <= e.to)
      const lv = list.find(e => e.kind === 'off' || e.kind === 'free' || e.kind === 'nolv')
      const el = document.createElement('span')
      if (lv) { el.className = 'zz-evt ' + lv.kind; el.textContent = lv.s }
      else { el.className = 'zz-dot' + (list.length ? '' : ' none') }
      th.appendChild(el)
    }
    ev.style.display = 'none'
    return 'C'
  }, EVENTS)
}
// the place talked about, marked: a pink frame round the events' area, a letter pinned at its left
async function markArea(p, way) {
  return p.evaluate(([way, PINK]) => {
    const t = document.querySelector('#page-leavewar table.mx')
    const pin = (el, txt) => { if (!el) return; if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; const g = document.createElement('div'); g.textContent = txt; Object.assign(g.style, { position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', background: PINK, color: '#fff', font: '800 11px/1 system-ui', padding: '3px 6px', borderRadius: '10px', zIndex: 9, boxShadow: '0 0 0 2px #0b0d10' }); el.appendChild(g) }
    if (way === 'B') { const tb = t.querySelector('.zz-lanes'); for (const td of tb.rows[0].cells) td.style.boxShadow = `inset 0 2px 0 ${PINK}`; for (const td of tb.rows[tb.rows.length - 1].cells) td.style.boxShadow = (td.style.boxShadow ? td.style.boxShadow + ',' : '') + `inset 0 -2px 0 ${PINK}`; pin(tb.rows[0].cells[1], 'B') }
    if (way === 'A' || way === 'C') { const tr = t.querySelector(':scope > tbody.mxhead tr:not(.mbrak)'); for (const th of t.querySelectorAll('th.day .zz-evt:not(.none), th.day .zz-dot:not(.none)')) { th.style.outline = `2px solid ${PINK}`; if (th.classList.contains('zz-dot')) th.style.outlineOffset = '2px' }; pin(tr?.cells[0], way) }
    if (way === 'A') { const r = t.querySelector('.zz-evfold tr'); for (const td of r.cells) td.style.boxShadow = `inset 0 2px 0 ${PINK}, inset 0 -2px 0 ${PINK}` }
  }, [way, PINK])
}
const firstPerson = p => p.evaluate(() => {
  const rows = [...document.querySelectorAll('#page-leavewar [data-testid^="row-"]')].map(e => e.getBoundingClientRect()).filter(r => r.height)
  return { first: Math.round(rows[0]?.top ?? -1), onScreen: rows.filter(r => r.top >= 0 && r.bottom <= innerHeight).length }
})
const lane = pack(EVENTS)
console.log('lanes', JSON.stringify(lane))
const out = {}
for (const [w, h, touch, dev] of [[390, 844, true, 'phone'], [1536, 860, false, 'desk']]) {
  for (const way of ['A', 'B', 'C', ...(dev === 'desk' ? ['Bzoom'] : [])]) {
    const { ctx, p } = await N.page(w, h, touch, 'admin')
    await N.draw(p, touch, false)
    { const fb = p.locator('[data-testid="figures-toggle"]'); if (await fb.count() && /(^| )on( |$)/.test(await fb.getAttribute('class') || '')) { await fb.click({ force: true }); await p.waitForTimeout(500) } }
    if (touch) { const m = p.locator('[data-testid="counts-toggle"]'); if ((await m.getAttribute('aria-expanded')) !== 'false') { await m.click({ force: true }); await p.waitForTimeout(500) } }
    const n = await setup(p, lane)
    await order(p)
    let info
    if (way === 'A') info = await wayA(p, EVENTS)
    if (way === 'B' || way === 'Bzoom') info = await wayB(p, EVENTS, lane, touch)
    if (way === 'C') info = await wayC(p, EVENTS)
    await p.waitForTimeout(300)
    const r = await firstPerson(p); out[`${way}-${dev}`] = { ...r, info }
    console.log(way, dev, n, JSON.stringify(r), JSON.stringify(info))
    if (way !== 'Bzoom') await markArea(p, way[0])
    await p.mouse.move(2, 2)
    const name = way === 'Bzoom' ? 'r21-ev-b-zoom-desk' : `r21-ev-${way.toLowerCase()}-${dev}`
    if (way === 'Bzoom') {
      const box = await p.evaluate(() => { const r = document.querySelector('#page-leavewar .zz-lanes').getBoundingClientRect(); return { y: Math.round(r.top) - 90, h: Math.round(r.height) + 150 } })
      await shot(p, name, { clip: { x: 0, y: box.y, width: 900, height: box.h } })
    } else await shot(p, name, touch ? {} : { clip: { x: 0, y: 0, width: w, height: 760 } })
    await ctx.close()
  }
}
console.log(JSON.stringify(out))
await browser.close(); console.log('errors:', errs)
