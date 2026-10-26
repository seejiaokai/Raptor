// Round 2b (21 Oct 26, after his answers D1157-D1160): every state of a Leave War cell drawn HIS way — rows keep their
// height (Q4 B), a whole day's box fills its cell and a half day's box fills its half, its letters smaller (D1160) — in
// today's look and the four colour looks of question 2, put to him again. Also the case his answer leaves open: two
// whole-day entries on one day (Q4b). Static pages in the app's own chip colours (values from full-measure.mjs: desktop
// cell 27 x 26.6; a phone draws the grid at zoom 0.8). Writes cells2-*.html beside this script; pictures to OUT.
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, OUT, errs } from './full-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))

// entries: [code, state, half]; state appr|wait|ref|info|sc; half full|am|pm. marks: raptor, moved, clash, po
const CASES = [
  ['A whole day, approved', [['LL', 'appr']]],
  ['A whole day, waiting', [['LL', 'wait']]],
  ['Refused', [['LL', 'ref']]],
  ['AM only, approved', [['LL', 'appr', 'am']]],
  ['PM only, waiting', [['LL', 'wait', 'pm']]],
  ['AM LL approved + PM OIL waiting', [['LL', 'appr', 'am'], ['OIL', 'wait', 'pm']]],
  ['HO: half a day of OIL given by hand (an award, not a half of the day)', [['HO', 'sc']]],
  ['Three records: AM LL + PM OIL + an FO award', [['LL', 'appr', 'am'], ['OIL', 'wait', 'pm'], ['FO', 'sc']]],
  ['Filed on the Inputs page, approved', [['LL', 'appr']], ['raptor']],
  ['Filed on the Inputs page by a member, waiting for the admin (only if question 6 is yes)', [['LL', 'wait']], ['raptor']],
  ['Medical, from the Inputs page', [['C', 'info']], ['raptor']],
  ['Waiting, and moved from another day', [['LL', 'wait']], ['moved']],
  ['Waiting, with a clash flagged', [['LL', 'wait']], ['clash']],
  ['His last day before posting out', [['LL', 'appr']], ['po']],
]
const FAM = c => /^(OIL|FO|HO)$/.test(c) ? 'oil' : /^(C|B|HL|OML|ATT)$/.test(c) ? 'med' : /^(CSE|OD)$/.test(c) ? 'crs' : 'lve'
const THEIRS = { LL: ['#5aa2ff', '#0d2a4d'], OL: ['#b48cff', '#2a1d4a'], OIL: ['#3ed6b0', '#0b3a32'], FO: ['#7be3c5', '#0f3a30'], HO: ['#7be3c5', '#0f3a30'], C: ['#ff6b6b', '#4a1414'] }

const marksHTML = (marks, more) => (more ? `<span class="mk more">+${more}</span>` : '') +
  (marks.includes('clash') ? '<span class="mk clash">!</span>' : '') + (marks.includes('po') ? '<span class="mk po">PO</span>' : '')

function todayCell(e, marks) {
  const [code, st, half] = e[0]
  const t = half === 'am' ? '&lt;' + code : half === 'pm' ? code + '&gt;' : code
  const cls = ['c', st === 'wait' ? '' : st, half || '', marks.includes('raptor') ? 'raptor' : '', marks.includes('moved') ? 'moved' : ''].join(' ')
  return `<td class="cell today"><span class="${cls}">${t}</span>${marksHTML(marks, e.length - 1)}</td>`
}
// one filled box. pos: whole | top | bot | left | right
function box([code, st], look, marks, pos) {
  let cls = 'f ' + pos, style = '', dot = ''
  if (look === 'A') cls += ' ' + st
  if (look === 'B') cls += ' ' + (st === 'wait' ? 'plain' : st)
  if (look === 'C') cls += ' fam-' + FAM(code) + ' st-' + st
  if (look === 'D') {
    const [ink, bg] = THEIRS[code] || ['#c9d1d9', '#222a33']
    style = st === 'wait' ? `color:${ink};background:transparent;box-shadow:inset 0 0 0 1px ${ink}` : st === 'ref' ? `color:${ink};background:transparent;box-shadow:inset 0 0 0 1px #6b7785;text-decoration:line-through` : `color:${ink};background:${bg};box-shadow:inset 0 0 0 1px ${ink}`
    if (st === 'wait') dot = '<i class="tdot"></i>'
  }
  if (marks.includes('raptor')) cls += ' raptor'
  if (marks.includes('moved')) cls += ' moved'
  return `<span class="${cls}" style="${style}"><b>${code}</b>${dot}</span>`
}
// a proposed cell. twoWhole: how two whole-day entries share it — 'side' (Q4b A) or 'stack' (Q4b B)
function newCell(e, marks, look, twoWhole = 'side') {
  const show = e.slice(0, 2), more = e.length > 2 ? e.length - 2 : 0
  const am = show.find(x => x[2] === 'am'), pm = show.find(x => x[2] === 'pm')
  const whole = show.filter(x => !x[2])
  let inner
  if (am || pm) inner = (am ? box(am, look, marks, 'top') : '') + (pm ? box(pm, look, marks, 'bot') : '')
  else if (whole.length === 2) inner = twoWhole === 'side'
    ? box(whole[0], look, marks, 'left') + box(whole[1], look, marks, 'right')
    : box(whole[0], look, marks, 'top') + box(whole[1], look, marks, 'bot')
  else inner = box(whole[0], look, marks, 'whole')
  return `<td class="cell"><div class="cb">${inner}${marksHTML(marks, more)}</div></td>`
}

const CSS = `
:root{color-scheme:dark}
body{margin:0;background:#0b0d10;color:#f1f4f7;font-family:"Inter Tight",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{padding:14px 16px 20px}
h1{font:700 15px/1.3 "Inter Tight",system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;margin:0 0 4px;color:#e6edf3}
.sub{font:500 12px/1.45 system-ui,sans-serif;color:#8a96a3;margin:0 0 12px;max-width:760px}
table.st{border-collapse:separate;border-spacing:0;background:#11161c;border:1px solid #26303a;border-radius:10px;overflow:hidden}
.st th{font:700 10px/1.2 system-ui,sans-serif;letter-spacing:.1em;color:#8a96a3;text-transform:uppercase;padding:8px 6px;border-bottom:1px solid rgba(70,81,94,.8);text-align:center;vertical-align:bottom}
.st th.rec{color:#3bc6e8}
.st td.lab{font:500 11.5px/1.3 system-ui,sans-serif;color:#c9d1d9;padding:4px 10px;text-align:left;border-bottom:1px solid rgba(70,81,94,.5);max-width:200px}
.zoom{zoom:var(--z,1)}
/* the grid's own cell, as measured: rows keep their height (Q4 B) */
td.cell{position:relative;width:27px;min-width:27px;max-width:27px;height:26.6px;padding:0;box-sizing:border-box;text-align:center;vertical-align:middle;border-right:1px solid rgba(70,81,94,.8);border-bottom:1px solid rgba(70,81,94,.8);background:#0f1318}
/* TODAY's chip, unchanged */
.c{position:relative;display:inline-block;min-width:20px;padding:1px 3px;border-radius:5px;font-size:10px;font-weight:700;letter-spacing:.03em;line-height:14px;color:#f1f4f7;box-sizing:border-box}
.c.appr{background:rgba(87,201,122,.16);color:#8FE0A8;box-shadow:inset 0 0 0 1px rgba(87,201,122,.5)}
.c.ref{background:rgba(240,85,95,.16);color:#FFA6AD;box-shadow:inset 0 0 0 1px rgba(240,85,95,.5)}
.c.sc{background:rgba(59,198,232,.16);color:#9FDCEE;box-shadow:inset 0 0 0 1px rgba(59,198,232,.5)}
.c.info{color:#8a96a3}
.c.am{background-image:linear-gradient(90deg,rgba(255,255,255,.2) 0 50%,transparent 50%)}
.c.pm{background-image:linear-gradient(90deg,transparent 50%,rgba(255,255,255,.2) 50%)}
.c.raptor{border-left:2px solid #3bc6e8;padding-left:2px}
.c.moved{border-left:2px dotted #F2C879;padding-left:2px}
.mk{position:absolute;z-index:2;font-size:7.5px;font-weight:800;line-height:7.5px;padding:1px 2px}
.mk.more{top:0;right:0;color:#0d1117;background:rgba(150,162,178,.9);border-radius:0 0 0 4px}
.mk.clash{top:0;left:0;color:#0d1117;background:#e5a83b;border-radius:0 0 4px 0}
.mk.po{bottom:0;right:0;color:#c9d1d9;background:#2a323c;border-radius:4px 0 0 0;font-size:6.5px}
/* NEW (D1160) — the box fills the cell; a half fills its half, its letters smaller */
/* the real cell's box: a tall label row never stretches it */
.cb{position:relative;width:100%;height:26.6px}
.f{position:absolute;display:flex;align-items:center;justify-content:center;box-sizing:border-box;border-radius:4px;color:#f1f4f7;overflow:hidden}
.f b{font-weight:700;letter-spacing:.02em;white-space:nowrap}
.f.whole{inset:2px}
.f.whole b{font-size:10px}
.f.top{left:2px;right:2px;top:2px;bottom:calc(50% + .5px);border-radius:4px 4px 2px 2px}
.f.bot{left:2px;right:2px;top:calc(50% + .5px);bottom:2px;border-radius:2px 2px 4px 4px}
.f.left{top:2px;bottom:2px;left:2px;right:calc(50% + .5px);border-radius:4px 2px 2px 4px}
.f.right{top:2px;bottom:2px;left:calc(50% + .5px);right:2px;border-radius:2px 4px 4px 2px}
.f.top b,.f.bot b,.f.left b,.f.right b{font-size:7.5px;letter-spacing:0}
/* A and B: the colour is where it stands (A waiting dashed; B waiting plain, as today) */
.f.appr{background:rgba(87,201,122,.18);color:#8FE0A8;box-shadow:inset 0 0 0 1px rgba(87,201,122,.55)}
.f.ref{background:rgba(240,85,95,.18);color:#FFA6AD;box-shadow:inset 0 0 0 1px rgba(240,85,95,.55)}
.f.sc{background:rgba(59,198,232,.18);color:#9FDCEE;box-shadow:inset 0 0 0 1px rgba(59,198,232,.55)}
.f.info{background:rgba(150,162,178,.10);color:#9aa5b1}
.f.wait{background:rgba(241,244,247,.05);outline:1px dashed rgba(241,244,247,.7);outline-offset:-1px}
.f.plain{background:transparent}
/* C — a tint per leave family, where it stands by its edge */
.f.fam-lve{color:#AFC2E8;background:rgba(120,150,210,.18)} .f.fam-oil{color:#9FDCEE;background:rgba(59,198,232,.18)} .f.fam-med,.f.fam-crs{color:#aab4bf;background:rgba(150,162,178,.14)}
.f.st-appr,.f.st-sc{box-shadow:inset 0 0 0 1px currentColor} .f.st-wait{outline:1px dashed currentColor;outline-offset:-1px}
.f.st-ref{box-shadow:inset 0 0 0 1px rgba(240,85,95,.75)} .f.st-ref b{text-decoration:line-through}
/* the two edge marks keep their colours, drawn inside the box's left edge */
.f.raptor{border-left:2px solid #3bc6e8}
.f.moved{border-left:2px dotted #F2C879}
.tdot{position:absolute;top:1px;right:1px;width:5px;height:5px;border-radius:50%;background:#ff8a1f}
.key{display:flex;gap:6px 14px;flex-wrap:wrap;font:500 11px/1.4 system-ui,sans-serif;color:#8a96a3;margin:10px 0 0;max-width:760px}
.grid{border-collapse:separate;border-spacing:0;background:#0f1318;border:1px solid #26303a;border-radius:8px;overflow:hidden;margin-top:6px}
.grid th{font:700 8.5px/1.1 system-ui,sans-serif;color:#8a96a3;padding:4px 2px;border-bottom:1px solid rgba(70,81,94,.8);border-right:1px solid rgba(70,81,94,.8);text-align:center}
.grid td.nm{font:600 11px/1 "Inter Tight",system-ui,sans-serif;color:#b6c0cb;padding:0 6px;border-bottom:1px solid rgba(70,81,94,.8);border-right:1px solid rgba(70,81,94,.8);white-space:nowrap;background:#141a21;height:26.6px;box-sizing:border-box}
.grid td.cell.we{background:rgba(6,8,11,.55)}
.looks{display:flex;gap:16px 22px;flex-wrap:wrap;align-items:flex-start}
.cap{font:700 11px/1.3 system-ui,sans-serif;color:#e6edf3;margin:12px 0 0}
.cap.rec{color:#3bc6e8}
.cap i{font-style:normal;color:#8a96a3;font-weight:500}
`
function statesTable() {
  const cols = [['today', 'Today'], ['A', 'A · rec'], ['B', 'B'], ['C', 'C'], ['D', 'D · theirs']]
  const head = `<tr><th style="text-align:left;padding-left:10px">Case</th>${cols.map(([k, l]) => `<th class="${k === 'A' ? 'rec' : ''}">${l}</th>`).join('')}</tr>`
  const rows = CASES.map(([lab, e, m = []]) => `<tr><td class="lab">${lab}</td>${cols.map(([k]) => k === 'today' ? todayCell(e, m) : newCell(e, m, k)).join('')}</tr>`).join('')
  return `<table class="st">${head}${rows}</table>`
}
// a busy week, Mon 19 – Sun 25 Jan, six people — each look drawn on it
const R = (code, st, half, marks) => ({ e: [[code, st, half]], m: marks || [] })
const WEEK = [
  ['Reaper', [R('OL', 'appr'), R('OL', 'appr'), R('OL', 'appr'), R('OL', 'appr'), R('OL', 'appr'), null, null]],
  ['Anvil', [null, { e: [['LL', 'appr', 'am'], ['OIL', 'wait', 'pm']], m: [] }, null, R('LL', 'ref'), null, null, null]],
  ['Cinch', [null, null, null, R('LL', 'wait'), R('LL', 'wait'), null, null]],
  ['Ranger', [R('LL', 'appr'), R('LL', 'appr'), R('LL', 'appr'), null, R('LL', 'wait', 'am'), null, null]],
  ['Sidewinder', [null, null, R('LL', 'appr', 'pm'), R('LL', 'appr', null, ['raptor']), R('LL', 'appr', null, ['raptor']), null, null]],
  ['Warden', [R('C', 'info', null, ['raptor']), R('C', 'info', null, ['raptor']), null, null, { e: [['OIL', 'wait', 'am'], ['LL', 'wait', 'pm']], m: [] }, null, null]],
]
const DAYS = ['MON 19', 'TUE 20', 'WED 21', 'THU 22', 'FRI 23', 'SAT 24', 'SUN 25']
function week(look, rows = WEEK, days = DAYS, twoWhole) {
  const head = `<tr><th></th>${days.map(d => `<th>${d.replace(' ', '<br>')}</th>`).join('')}</tr>`
  const body = rows.map(([n, cells]) => `<tr><td class="nm">${n}</td>${cells.map((c, i) => {
    const we = i > 4 ? ' we' : ''
    if (!c) return `<td class="cell${we}"></td>`
    const td = look === 'today' ? todayCell(c.e, c.m) : newCell(c.e, c.m, look, twoWhole)
    return td.replace('<td class="cell', `<td class="cell${we}`)
  }).join('')}</tr>`).join('')
  return `<table class="grid">${head}${body}</table>`
}
// Q4b — two whole-day entries on one day (an LL and an FO award given by hand), beside a real AM / PM day
const TWO = [
  ['Ranger', [{ e: [['LL', 'appr'], ['FO', 'sc']], m: [] }, { e: [['LL', 'appr', 'am'], ['OIL', 'wait', 'pm']], m: [] }, R('LL', 'appr')]],
  ['Anvil', [{ e: [['LL', 'wait'], ['FO', 'sc']], m: [] }, R('LL', 'wait', 'pm'), null]],
]
const TWODAYS = ['MON 19', 'TUE 20', 'WED 21']

function page(phone) {
  const z = phone ? 0.8 : 1
  const at = phone ? 'at your phone\'s zoom (0.8), real size' : 'at desktop size'
  const looks = [['today', 'Today', ''], ['A', 'A · recommended', 'rec'], ['B', 'B', ''], ['C', 'C', ''], ['D', 'D · your colleague\'s', '']]
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Leave War cells, your way</title><style>${CSS}</style></head><body><div class="wrap">
<section id="q2"><h1>Every state of a cell, your way</h1><p class="sub">Rows keep their height. A whole day's box fills the cell; a half day's box fills its half, morning on top, afternoon below. Today, then the four colour looks of question 2, ${at}.</p>
<div class="zoom" style="--z:${z}">${statesTable()}</div>
<div class="key"><span><b style="color:#3bc6e8">A</b> colour = where it stands; waiting dashed</span><span><b>B</b> waiting plain, as today</span><span><b>C</b> a tint per leave family; where it stands by its edge</span><span><b>D</b> your colleague's: a colour per type, waiting outlined with a dot</span></div></section>
<section id="wk" style="margin-top:22px"><h1>The same week in each look</h1><p class="sub">Mon 19 – Sun 25 Jan, six people, ${at}.</p>
<div class="looks">${looks.map(([k, l, c]) => `<div><div class="cap ${c}">${l}</div><div class="zoom" style="--z:${z}">${week(k)}</div></div>`).join('')}</div></section>
<section id="q4b" style="margin-top:22px"><h1>Two whole-day entries on one day</h1><p class="sub">Monday: a leave and an OIL award given by hand (FO). Tuesday: a real morning and afternoon, for comparison. Look A, ${at}.</p>
<div class="looks"><div><div class="cap rec">A · side by side, each the full height <i>(recommended)</i></div><div class="zoom" style="--z:${z}">${week('A', TWO, TWODAYS, 'side')}</div></div>
<div><div class="cap">B · one above the other <i>(reads like morning and afternoon)</i></div><div class="zoom" style="--z:${z}">${week('A', TWO, TWODAYS, 'stack')}</div></div></div></section>
</div></body></html>`
}
writeFileSync(join(HERE, 'cells2-phone.html'), page(true))
writeFileSync(join(HERE, 'cells2-desk.html'), page(false))
const browser = await chromium.launch()
for (const [n, w, dpr, phone] of [['p4b-phone', 390, 3, true], ['p4b-desk', 900, 2, false]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: dpr })
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e)))
  await p.goto('file:///' + join(HERE, phone ? 'cells2-phone.html' : 'cells2-desk.html').replace(/\\/g, '/'))
  await p.waitForTimeout(300)
  // what the letters come to on screen, and whether any box's letters overflow it
  const m = await p.evaluate(() => {
    const z = parseFloat(getComputedStyle(document.querySelector('.zoom')).zoom) || 1
    const fs = sel => { const el = document.querySelector(sel); return el ? Math.round(parseFloat(getComputedStyle(el).fontSize) * z * 10) / 10 : null }
    const over = [...document.querySelectorAll('.f')].filter(f => { const b = f.querySelector('b'); return b.scrollWidth > f.clientWidth + 0.5 }).map(f => f.textContent + ':' + f.className)
    return { whole: fs('.f.whole b'), half: fs('.f.top b'), cellH: Math.round(document.querySelector('#wk td.cell').getBoundingClientRect().height * 10) / 10, over: over.slice(0, 12), width: document.documentElement.scrollWidth }
  })
  console.log(n, JSON.stringify(m))
  for (const s of ['q2', 'wk', 'q4b']) await p.locator('#' + s).screenshot({ path: join(OUT, `${n}-${s}.png`) })
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
