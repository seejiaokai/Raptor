// Picture 4 — every state of a Leave War cell on one page (the design guide's §7), in the app's own chip styles: the
// values are the real grid's, measured by full-measure.mjs (desktop cell 27 x 26.6, chip 16 tall, 10px/700 letters; a phone
// draws the grid at zoom 0.8). Writes cells.html beside this script and pictures it at a phone's and a desktop's size.
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, OUT, errs } from './full-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))

// the cases: e = entries [code, state, half]; state appr|wait|tbc|ref|info|sc; half full|am|pm
//   marks: raptor (filed on the Inputs page), moved, clash, po
const CASES = [
  ['A whole day, approved', [['LL', 'appr']]],
  ['A whole day, waiting', [['LL', 'wait']]],
  ['Ack — seen, waiting (today only)', [['LL', 'tbc']]],
  ['Refused', [['LL', 'ref']]],
  ['AM only, approved', [['LL', 'appr', 'am']]],
  ['PM only, waiting', [['LL', 'wait', 'pm']]],
  ['AM LL approved + PM OIL waiting', [['LL', 'appr', 'am'], ['OIL', 'wait', 'pm']]],
  ['Two whole-day records: LL approved + an OIL award (FO)', [['LL', 'appr'], ['FO', 'sc']]],
  ['HO — half a day of OIL earned (no half of the day)', [['HO', 'sc']]],
  ['Three records: AM LL + PM OIL + an FO award', [['LL', 'appr', 'am'], ['OIL', 'wait', 'pm'], ['FO', 'sc']]],
  ['Filed on the Inputs page, approved', [['LL', 'appr']], ['raptor']],
  ['Filed on the Inputs page, waiting (Q6)', [['LL', 'wait']], ['raptor']],
  ['Medical, from the Inputs page', [['C', 'info']], ['raptor']],
  ['Waiting, and moved from another day', [['LL', 'wait']], ['moved']],
  ['Waiting, with a clash flagged', [['LL', 'wait']], ['clash']],
  ['His last day before posting out', [['LL', 'appr']], ['po']],
]
const FAM = c => /^(OIL|FO|HO)$/.test(c) ? 'oil' : /^(C|B|HL|OML|ATT)$/.test(c) ? 'med' : /^(CSE|OD)$/.test(c) ? 'crs' : 'lve'
// the colleague's colour per type (their legend): LL blue, OL purple, OIL teal, FO/HO mint, medical red
const THEIRS = { LL: ['#5aa2ff', '#0d2a4d'], OL: ['#b48cff', '#2a1d4a'], OIL: ['#3ed6b0', '#0b3a32'], FO: ['#7be3c5', '#0f3a30'], HO: ['#7be3c5', '#0f3a30'], C: ['#ff6b6b', '#4a1414'] }

function todayCell(e, marks) {
  // today's grid: one code, `<LL` / `LL>` for a half, the rest behind "+n"
  const [code, st, half] = e[0]
  const t = half === 'am' ? '&lt;' + code : half === 'pm' ? code + '&gt;' : code
  const cls = ['c', st === 'wait' ? '' : st, half || '', marks.includes('raptor') ? 'raptor' : '', marks.includes('moved') ? 'moved' : ''].join(' ')
  const more = e.length > 1 ? `<span class="mk more">+${e.length - 1}</span>` : ''
  const clash = marks.includes('clash') ? '<span class="mk clash">!</span>' : ''
  const po = marks.includes('po') ? '<span class="mk po">PO</span>' : ''
  return `<td class="cell${e.length > 1 || clash || po ? ' mkd' : ''}"><span class="${cls}">${t}</span>${more}${clash}${po}</td>`
}
// a proposed cell: the halves stacked (AM top, PM bottom), two records stacked, a third behind "+1"
function newCell(e, marks, look, size) {
  const show = e.slice(0, 2), more = e.length > 2 ? `<span class="mk more">+${e.length - 2}</span>` : ''
  const stacked = show.length > 1 || show.some(x => x[2] === 'am' || x[2] === 'pm')
  const chip = ([code, st, half]) => {
    let cls = 'c', style = '', dot = ''
    if (look === 'A' || look === 'B') cls += ' ' + (st === 'tbc' ? (look === 'A' ? 'wait' : '') : st === 'wait' ? (look === 'A' ? 'wait' : '') : st)
    if (look === 'C') { cls += ' fam-' + FAM(code) + ' st-' + (st === 'tbc' ? 'wait' : st) }
    if (look === 'D') {
      const [ink, bg] = THEIRS[code] || ['#c9d1d9', '#222a33']
      const waiting = st === 'wait' || st === 'tbc'
      style = waiting ? `color:${ink};background:transparent;box-shadow:inset 0 0 0 1px ${ink}` : st === 'ref' ? `color:${ink};background:transparent;box-shadow:inset 0 0 0 1px #6b7785;text-decoration:line-through` : `color:${ink};background:${bg};box-shadow:inset 0 0 0 1px ${ink}`
      if (waiting) dot = '<i class="tdot"></i>'
    }
    if (marks.includes('raptor')) cls += ' raptor'
    if (marks.includes('moved')) cls += ' moved'
    return `<span class="${cls}${stacked ? ' half' : ''}" style="${style}">${code}${dot}</span>`
  }
  let inner
  if (!stacked) inner = chip(show[0])
  else {
    // a half's chip sits in its own half; two whole-day records take the two halves in the day's ladder order
    const am = show.find(x => x[2] === 'am') || (show.length > 1 ? show.find(x => !x[2]) : null)
    const pm = show.find(x => x[2] === 'pm') || (show.length > 1 ? show.filter(x => !x[2] && x !== am)[0] : null)
    inner = `<span class="halves"><span class="hf top">${am ? chip(am) : ''}</span><span class="hf bot">${pm ? chip(pm) : ''}</span></span>`
  }
  const clash = marks.includes('clash') ? '<span class="mk clash">!</span>' : ''
  const po = marks.includes('po') ? '<span class="mk po">PO</span>' : ''
  return `<td class="cell size-${size}${more || clash || po ? ' mkd' : ''}">${inner}${more}${clash}${po}</td>`
}

const CSS = `
:root{color-scheme:dark}
body{margin:0;background:#0b0d10;color:#f1f4f7;font-family:"Inter Tight",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{padding:14px 16px 20px}
h1{font:700 15px/1.3 "Inter Tight",system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;margin:0 0 4px;color:#e6edf3}
.sub{font:500 12px/1.45 system-ui,sans-serif;color:#8a96a3;margin:0 0 12px}
table.st{border-collapse:separate;border-spacing:0;background:#11161c;border:1px solid #26303a;border-radius:10px;overflow:hidden}
.st th{font:700 10px/1.2 system-ui,sans-serif;letter-spacing:.1em;color:#8a96a3;text-transform:uppercase;padding:8px 6px;border-bottom:1px solid rgba(70,81,94,.8);text-align:center;vertical-align:bottom}
.st th.rec{color:#3bc6e8}
.st td.lab{font:500 11.5px/1.3 system-ui,sans-serif;color:#c9d1d9;padding:4px 10px 4px 10px;text-align:left;border-bottom:1px solid rgba(70,81,94,.5);max-width:190px}
.st td.lab b{color:#e6edf3}
.zoom{zoom:var(--z,1)}
/* the grid's own cell, as measured */
td.cell{position:relative;width:23px;min-width:23px;height:20.6px;padding:3px 2px;text-align:center;vertical-align:middle;font-size:11px;border-right:1px solid rgba(70,81,94,.8);border-bottom:1px solid rgba(70,81,94,.8);background:#0f1318}
td.cell.size-A{height:30px}
.c{position:relative;display:inline-block;min-width:20px;padding:1px 3px;border-radius:5px;font-size:10px;font-weight:700;letter-spacing:.03em;line-height:14px;color:#f1f4f7;box-sizing:border-box}
.c.appr{background:rgba(87,201,122,.16);color:#8FE0A8;box-shadow:inset 0 0 0 1px rgba(87,201,122,.5)}
.c.tbc{background:rgba(178,77,234,.16);color:#D9A6F5;box-shadow:inset 0 0 0 1px rgba(178,77,234,.5)}
.c.ref{background:rgba(240,85,95,.16);color:#FFA6AD;box-shadow:inset 0 0 0 1px rgba(240,85,95,.5)}
.c.sc{background:rgba(59,198,232,.16);color:#9FDCEE;box-shadow:inset 0 0 0 1px rgba(59,198,232,.5)}
.c.info{color:#8a96a3}
.c.am{background-image:linear-gradient(90deg,rgba(255,255,255,.2) 0 50%,transparent 50%)}
.c.pm{background-image:linear-gradient(90deg,transparent 50%,rgba(255,255,255,.2) 50%)}
.c.am::after,.c.pm::after{content:'';position:absolute;top:2px;bottom:2px;width:1px;left:50%;background:rgba(255,255,255,.35)}
.c.raptor{border-left:2px solid #3bc6e8;padding-left:2px}
.c.moved{border-left:2px dotted #F2C879;padding-left:2px}
.mkd{}
.mk{position:absolute;font-size:7.5px;font-weight:800;line-height:7.5px;padding:1px 2px}
.mk.more{top:0;right:0;color:#0d1117;background:rgba(150,162,178,.85);border-radius:0 0 0 4px}
.mk.clash{top:0;left:0;color:#0d1117;background:#e5a83b;border-radius:0 0 4px 0}
.mk.po{bottom:0;right:0;color:#c9d1d9;background:#2a323c;border-radius:4px 0 0 0;font-size:6.5px}
/* NEW — the proposal's parts */
.c.wait{box-shadow:none;outline:1px dashed rgba(241,244,247,.6);outline-offset:-1px}
.halves{display:flex;flex-direction:column;justify-content:space-between;height:100%;min-height:20px}
td.size-A .halves{min-height:28px}
.hf{display:flex;align-items:center;justify-content:center;height:50%}
.c.half{font-size:7.5px;line-height:9px;padding:0 2px;min-width:16px;border-radius:3px}
td.size-A .c.half{font-size:9px;line-height:12px;padding:0 3px;min-width:18px}
.c.half.am::after,.c.half.pm::after{display:none}
/* C — a tint per leave family, where it stands by its edge */
.c.fam-lve{color:#AFC2E8;background:rgba(120,150,210,.16)} .c.fam-oil{color:#9FDCEE;background:rgba(59,198,232,.16)} .c.fam-med,.c.fam-crs{color:#aab4bf;background:rgba(150,162,178,.14)}
.c.st-appr{box-shadow:inset 0 0 0 1px currentColor} .c.st-sc{box-shadow:inset 0 0 0 1px currentColor} .c.st-wait{box-shadow:none;outline:1px dashed currentColor;outline-offset:-1px}
.c.st-ref{box-shadow:inset 0 0 0 1px rgba(240,85,95,.7);text-decoration:line-through} .c.st-info{}
/* D — the colleague's waiting dot (his app's orange) */
.tdot{position:absolute;top:-2px;right:-2px;width:5px;height:5px;border-radius:50%;background:#ff8a1f}
.key{display:flex;gap:14px;flex-wrap:wrap;font:500 11px/1.4 system-ui,sans-serif;color:#8a96a3;margin:10px 0 0}
.grid{border-collapse:separate;border-spacing:0;background:#0f1318;border:1px solid #26303a;border-radius:8px;overflow:hidden;margin-top:6px}
.grid th{font:700 8.5px/1.1 system-ui,sans-serif;color:#8a96a3;padding:4px 2px;border-bottom:1px solid rgba(70,81,94,.8);border-right:1px solid rgba(70,81,94,.8);text-align:center}
.grid td.nm{font:600 11px/1 "Inter Tight",system-ui,sans-serif;color:#b6c0cb;padding:0 6px;border-bottom:1px solid rgba(70,81,94,.8);border-right:1px solid rgba(70,81,94,.8);white-space:nowrap;background:#141a21}
.grid td.cell.we{background:rgba(6,8,11,.55)}
.pair{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start}
.pair > div{flex:0 0 auto}
.cap{font:700 11px/1.3 system-ui,sans-serif;color:#e6edf3;margin:12px 0 0}
.cap i{font-style:normal;color:#8a96a3;font-weight:500}
`
function statesTable(cols, size) {
  const head = `<tr><th style="text-align:left;padding-left:10px">Case</th>${cols.map(([k, l]) => `<th class="${k === 'A' ? 'rec' : ''}">${l}</th>`).join('')}</tr>`
  const rows = CASES.map(([lab, e, m = []]) => `<tr><td class="lab">${lab}</td>${cols.map(([k]) => k === 'today' ? todayCell(e, m) : newCell(e, m, k, size)).join('')}</tr>`).join('')
  return `<table class="st">${head}${rows}</table>`
}
// a busy stretch of the grid, Mon 19 – Sun 25 Jan, five people, for Q4's two sizes
const STRETCH = [
  ['Reaper', [[['OL', 'appr']], [['OL', 'appr']], [['OL', 'appr']], [['OL', 'appr']], [['OL', 'appr']], null, null]],
  ['Anvil', [null, [['LL', 'appr', 'am'], ['OIL', 'wait', 'pm']], null, null, null, null, null]],
  ['Cinch', [null, null, null, [['LL', 'wait']], [['LL', 'wait']], null, null]],
  ['Ranger', [[['LL', 'appr']], [['LL', 'appr']], [['LL', 'appr']], null, [['LL', 'wait', 'am']], null, null]],
  ['Warden', [null, null, null, null, [['OIL', 'wait', 'am'], ['LL', 'wait', 'pm']], null, null]],
]
const DAYS = ['MON 19', 'TUE 20', 'WED 21', 'THU 22', 'FRI 23', 'SAT 24', 'SUN 25']
function stretch(size) {
  const head = `<tr><th></th>${DAYS.map(d => `<th>${d.replace(' ', '<br>')}</th>`).join('')}</tr>`
  const rows = STRETCH.map(([n, cells]) => `<tr><td class="nm">${n}</td>${cells.map((e, i) => {
    if (!e) return `<td class="cell size-${size}${i > 4 ? ' we' : ''}"></td>`
    return newCell(e, [], 'A', size).replace('<td class="cell', `<td class="cell${i > 4 ? ' we' : ''}`)
  }).join('')}</tr>`).join('')
  return `<table class="grid">${head}${rows}</table>`
}
function page(phone) {
  const z = phone ? 0.8 : 1
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Leave War cells</title><style>${CSS}</style></head><body><div class="wrap">
<section id="q2"><h1>Every state of a cell</h1><p class="sub">The real grid's chip, ${phone ? 'at a phone\'s zoom (0.8)' : 'at desktop size'}. Today, then the four looks of question 2. Halves drawn as question 4's A (rows grown).</p>
<div class="zoom" style="--z:${z}">${statesTable([['today', 'Today'], ['A', 'A · rec'], ['B', 'B'], ['C', 'C'], ['D', 'D · theirs']], 'A')}</div>
<div class="key"><span><b style="color:#3bc6e8">A</b> colour = where it stands; waiting dashed</span><span><b>B</b> waiting plain, as today</span><span><b>C</b> tint per leave family; state by edge</span><span><b>D</b> the colleague's: colour per type, waiting outline + dot</span></div></section>
<section id="q4" style="margin-top:22px"><h1>A half day's room (question 4)</h1><p class="sub">Mon 19 – Sun 25 Jan, five people, look A, ${phone ? 'at a phone\'s zoom (0.8), real size' : 'at desktop size'}.</p>
<div class="pair"><div><div class="cap">A · rows grow <i>(30 tall, not 21)</i></div><div class="zoom" style="--z:${z}">${stretch('A')}</div></div>
<div><div class="cap">B · rows stay <i>(halves' letters smaller)</i></div><div class="zoom" style="--z:${z}">${stretch('B')}</div></div></div></section>
</div></body></html>`
}
writeFileSync(join(HERE, 'cells-phone.html'), page(true))
writeFileSync(join(HERE, 'cells-desk.html'), page(false))
const browser = await chromium.launch()
for (const [n, w, dpr, phone] of [['p4-cells-phone', 390, 3, true], ['p4-cells-desk', 820, 2, false]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: dpr })
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e)))
  await p.goto('file:///' + join(HERE, phone ? 'cells-phone.html' : 'cells-desk.html').replace(/\\/g, '/'))
  await p.waitForTimeout(300)
  // measure what a half's letters come to on screen
  const m = await p.evaluate(() => {
    const z = parseFloat(getComputedStyle(document.querySelector('.zoom')).zoom) || 1
    const fs = el => el ? Math.round(parseFloat(getComputedStyle(el).fontSize) * z * 10) / 10 : null
    return { halfB: fs(document.querySelector('#q4 td.size-B .c.half')), halfA: fs(document.querySelector('#q4 td.size-A .c.half')), whole: fs(document.querySelector('#q4 td.size-B .c:not(.half)')), rowB: document.querySelector('#q4 td.size-B')?.getBoundingClientRect().height, rowA: document.querySelector('#q4 td.size-A')?.getBoundingClientRect().height, width: document.documentElement.scrollWidth }
  })
  console.log(n, JSON.stringify(m))
  await p.locator('#q2').screenshot({ path: join(OUT, n + '-q2.png') })
  await p.locator('#q4').screenshot({ path: join(OUT, n + '-q4.png') })
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
