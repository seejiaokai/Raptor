// Look F — his colours for look E (21 Oct 26, D1165: "for 2E how about LL and OL is different shades of amber, OIL is
// green"): E's rules (the colour is the kind of leave; filled approved, hollow dashed waiting, grey struck refused) with
// local and overseas leave two ambers and OIL / FO / HO green; the course moves off peach to lilac, clear of the ambers.
// Drawn from full-cells3.mjs (made by copying it — that file stays look E's record).
// Was: Round 3, question 2 again (21 Oct 26, D1161 — "all green feels abit boring and mundane"; his picture of the colleague's
// app, Gryphon, each kind of leave its own colour; its OD is 'other duty', ours stays overseas duty — D1162): look E — a colour for each kind of leave, where it stands by its fill (filled
// approved, hollow dashed waiting, grey struck refused) — beside look A (the colour is where it stands). Cells drawn his
// way (D1160: rows keep their height, a whole day's box fills its cell, a half day's its half). Static pages in the
// app's dark look; pictures to OUT. Run as full-cells2.mjs is.
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, OUT, errs } from './full-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))

// E's families — hues chosen after the colleague's app he showed (leave green, OIL yellow, course peach, care leave blue,
// duty grey, medical red-pink), each kept clear of the grid's own marks: the cyan Inputs edge, the gold dotted move,
// the amber clash corner, the purple "this is you".
const FAMILY = {
  LL: 'll', OL: 'ol', OIL: 'oil', FO: 'oil', HO: 'oil',
  CCL: 'care', FCL: 'care', PL: 'care', CL: 'care', EL: 'care',
  CSE: 'cse', OD: 'od', C: 'med', B: 'med', HL: 'med', OML: 'med',
}
// F: his colours
const FAMILY_F = { ...FAMILY, LL: 'fll', OL: 'fol', OIL: 'foil', FO: 'foil', HO: 'foil', CSE: 'fcse' }
const KEY = [
  ['ll', 'LL', 'local leave'], ['ol', 'OL', 'overseas leave'], ['oil', 'OIL · FO · HO', 'off in lieu'],
  ['care', 'CCL · FCL · PL · CL · EL', 'other leave'], ['cse', 'CSE', 'course'], ['od', 'OD', 'overseas duty'], ['med', 'B · C · OML · HL', 'medical'],
]
const CASES = [
  ['A whole day, approved', [['LL', 'appr']]],
  ['A whole day, waiting', [['LL', 'wait']]],
  ['Refused', [['LL', 'ref']]],
  ['Overseas leave, approved', [['OL', 'appr']]],
  ['OIL, waiting', [['OIL', 'wait']]],
  ['Child care leave, approved', [['CCL', 'appr']]],
  ['A course (from the Inputs page)', [['CSE', 'appr']], ['raptor']],
  ['Overseas duty (from the Inputs page)', [['OD', 'appr']], ['raptor']],
  ['Medical ATT C (from the Inputs page)', [['C', 'info']], ['raptor']],
  ['Medical ATT B: no flying, may still work', [['B', 'info']], ['raptor']],
  ['Outpatient medical leave (OML)', [['OML', 'info']], ['raptor']],
  ['Hospitalisation leave (HL)', [['HL', 'info']], ['raptor']],
  ['FO: a day of OIL given by hand', [['FO', 'sc']]],
  ['HO: half a day of OIL credited, in the half it was earned', [['HO', 'sc', 'pm']]],
  ['AM LL approved + PM HO', [['LL', 'appr', 'am'], ['HO', 'sc', 'pm']]],
  ['AM LL approved + PM OIL waiting', [['LL', 'appr', 'am'], ['OIL', 'wait', 'pm']]],
  ['Waiting, and moved from another day', [['LL', 'wait']], ['moved']],
  ['Waiting, with a clash flagged', [['LL', 'wait']], ['clash']],
]
const marksHTML = (marks) => (marks.includes('clash') ? '<span class="mk clash">!</span>' : '')
function box([code, st], look, marks, pos) {
  let cls = 'f ' + pos
  if (look === 'A') cls += ' a-' + st
  else cls += ' e-' + (look === 'F' ? FAMILY_F : FAMILY)[code] + ' es-' + (st === 'info' || st === 'sc' ? 'appr' : st)
  if (marks.includes('raptor')) cls += ' raptor'
  if (marks.includes('moved')) cls += ' moved'
  // a wide three-letter code (OML) takes letters a step smaller so it never spills out of its box
  return `<span class="${cls}"><b${/M|W/.test(code) && code.length > 2 ? ' class="wide"' : ''}>${code}</b></span>`
}
function cell(e, marks, look, two) {
  if (two && e.length === 2 && !e[0][2]) {
    // the second may be a half (an HO, D1164): it keeps to its own half of the right side
    const h2 = e[1][2] ? '-' + e[1][2] : ''
    // C: the first fills the cell; the second is a strip down the right edge in its own colour (both listed on a tap)
    if (two === 'strip') return `<td class="cell"><div class="cb">${box(e[0], look, marks[0] || [], 'whole strip')}<span class="stripe s${h2} ${box(e[1], look, [], 'x').match(/e-[a-z]+/)[0]}"></span></div></td>`
    const inner = two === 'side' ? box(e[0], look, marks[0] || [], 'left') + box(e[1], look, marks[1] || [], 'right' + h2) : box(e[0], look, marks[0] || [], e[1][2] === 'am' ? 'bot' : 'top') + box(e[1], look, marks[1] || [], e[1][2] === 'am' ? 'top' : 'bot')
    return `<td class="cell"><div class="cb">${inner}</div></td>`
  }
  const am = e.find(x => x[2] === 'am'), pm = e.find(x => x[2] === 'pm')
  const inner = am || pm ? (am ? box(am, look, marks, 'top') : '') + (pm ? box(pm, look, marks, 'bot') : '') : box(e[0], look, marks, 'whole')
  return `<td class="cell"><div class="cb">${inner}${marksHTML(marks)}</div></td>`
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
td.cell{position:relative;width:27px;min-width:27px;height:26.6px;padding:0;box-sizing:border-box;vertical-align:middle;border-right:1px solid rgba(70,81,94,.8);border-bottom:1px solid rgba(70,81,94,.8);background:#0f1318}
.cb{position:relative;width:100%;height:26.6px}
.mk{position:absolute;z-index:2;font-size:7.5px;font-weight:800;line-height:7.5px;padding:1px 2px}
.mk.clash{top:0;left:0;color:#0d1117;background:#e5a83b;border-radius:0 0 4px 0}
.f{position:absolute;display:flex;align-items:center;justify-content:center;box-sizing:border-box;border-radius:4px;overflow:hidden}
.f b{font-weight:700;letter-spacing:.02em;white-space:nowrap;font-size:10px}
.f.whole{inset:2px}
.f.whole b.wide{font-size:8.5px;letter-spacing:-.01em}
.f.top{left:2px;right:2px;top:2px;bottom:calc(50% + .5px);border-radius:4px 4px 2px 2px}
.f.bot{left:2px;right:2px;top:calc(50% + .5px);bottom:2px;border-radius:2px 2px 4px 4px}
.f.left{top:2px;bottom:2px;left:2px;right:calc(50% + .5px);border-radius:4px 2px 2px 4px}
.f.right{top:2px;bottom:2px;left:calc(50% + .5px);right:2px;border-radius:2px 4px 4px 2px}
.f.whole.strip{right:6px}
.stripe{position:absolute;top:2px;bottom:2px;right:2px;width:3px;border-radius:2px;background:rgb(var(--h))}
.f.right-am{top:2px;bottom:calc(50% + .5px);left:calc(50% + .5px);right:2px;border-radius:2px 4px 2px 2px}
.f.right-pm{top:calc(50% + .5px);bottom:2px;left:calc(50% + .5px);right:2px;border-radius:2px 2px 4px 2px}
.f.right-am b,.f.right-pm b{font-size:6.5px;letter-spacing:0}
.stripe.s-am{bottom:calc(50% + .5px)}
.stripe.s-pm{top:calc(50% + .5px)}
.f.left b,.f.right b{font-size:7.5px;letter-spacing:0}
.f.top b,.f.bot b{font-size:7.5px;letter-spacing:0}
/* the two edge marks, drawn on top so a waiting outline never hides them */
.f.raptor::before,.f.moved::before{content:'';position:absolute;left:0;top:0;bottom:0;width:0;z-index:1}
.f.raptor::before{border-left:2px solid #3bc6e8}
.f.moved::before{border-left:2px dotted #F2C879}
/* A — the colour is where it stands */
.a-appr{background:rgba(87,201,122,.18);color:#8FE0A8;box-shadow:inset 0 0 0 1px rgba(87,201,122,.55)}
.a-ref{background:rgba(240,85,95,.18);color:#FFA6AD;box-shadow:inset 0 0 0 1px rgba(240,85,95,.55)}
.a-sc{background:rgba(59,198,232,.18);color:#9FDCEE;box-shadow:inset 0 0 0 1px rgba(59,198,232,.55)}
.a-info{background:rgba(150,162,178,.10);color:#9aa5b1}
.a-wait{background:rgba(241,244,247,.05);color:#f1f4f7;outline:1px dashed rgba(241,244,247,.7);outline-offset:-1px}
/* E — a colour for each kind of leave; filled approved, hollow dashed waiting, grey struck refused */
.e-ll{--h:126,214,160;--ink:#BFF0D0;--fill:.20}
.e-ol{--h:52,190,98;--ink:#E6FFEE;--fill:.46}
.e-oil{--h:236,196,64;--ink:#FFF0B8;--fill:.32}
.e-care{--h:138,150,255;--ink:#DCE0FF;--fill:.32}
.e-cse{--h:242,156,104;--ink:#FFE0CC;--fill:.32}
.e-od{--h:160,170,182;--ink:#E6EBF0;--fill:.26}
.e-med{--h:236,104,140;--ink:#FFD0DD;--fill:.26}
/* F — his colours: two ambers for leave, green for OIL, lilac for a course */
.e-fll{--h:242,200,110;--ink:#FFF1CF;--fill:.22}
.e-fol{--h:226,146,38;--ink:#FFE7C7;--fill:.48}
.e-foil{--h:70,196,108;--ink:#DDF8E6;--fill:.38}
.e-fcse{--h:184,142,240;--ink:#EEE2FF;--fill:.32}
.es-appr{background:rgba(var(--h),var(--fill));color:var(--ink);box-shadow:inset 0 0 0 1px rgba(var(--h),.85)}
.es-wait{background:transparent;color:rgb(var(--h));outline:1px dashed rgba(var(--h),.95);outline-offset:-1px}
.es-ref{background:transparent;color:#7d8894;box-shadow:inset 0 0 0 1px #4a5560}
.es-ref b{text-decoration:line-through}
.cat th{padding:8px 4px;font-size:9px;letter-spacing:.06em}
.cat td.lab{max-width:190px}
/* each box at a real cell's size, whatever the column's width */
.cat td.cell{width:auto;min-width:0;padding:0 6px}
.cat .cb{width:27px;margin:0 auto}
td.cell.na{background:#0c0f13}
.dash{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#3b4550;font:600 11px system-ui}
.grid{border-collapse:separate;border-spacing:0;background:#0f1318;border:1px solid #26303a;border-radius:8px;overflow:hidden;margin-top:6px}
.grid th{font:700 8.5px/1.1 system-ui,sans-serif;color:#8a96a3;padding:4px 2px;border-bottom:1px solid rgba(70,81,94,.8);border-right:1px solid rgba(70,81,94,.8);text-align:center}
.grid td.nm{font:600 11px/1 "Inter Tight",system-ui,sans-serif;color:#b6c0cb;padding:0 6px;border-bottom:1px solid rgba(70,81,94,.8);border-right:1px solid rgba(70,81,94,.8);white-space:nowrap;background:#141a21;height:26.6px;box-sizing:border-box}
.grid td.cell.we{background:rgba(6,8,11,.55)}
.looks{display:flex;gap:16px 22px;flex-wrap:wrap;align-items:flex-start}
.cap{font:700 11px/1.3 system-ui,sans-serif;color:#e6edf3;margin:12px 0 0}
.cap.rec{color:#3bc6e8}
.cap i{font-style:normal;color:#8a96a3;font-weight:500}
.key{display:grid;grid-template-columns:auto auto auto 1fr;gap:6px 10px;align-items:center;font:500 11.5px/1.3 system-ui,sans-serif;color:#c9d1d9;margin-top:6px;max-width:560px}
.key .h{font:700 9.5px/1.2 system-ui,sans-serif;letter-spacing:.1em;color:#8a96a3;text-transform:uppercase}
.key .sw{position:relative;width:27px;height:26.6px}
`
// a busy week with every kind of leave, Mon 19 – Sun 25 Jan
const R = (code, st, half, marks) => ({ e: [[code, st, half]], m: marks || [] })
const WEEK = [
  ['Reaper', [R('OL', 'appr'), R('OL', 'appr'), R('OL', 'appr'), R('OL', 'appr'), R('OL', 'appr'), null, null]],
  ['Anvil', [null, { e: [['LL', 'appr', 'am'], ['OIL', 'wait', 'pm']], m: [] }, null, R('LL', 'ref'), null, null, null]],
  ['Cinch', [R('CSE', 'appr', null, ['raptor']), R('CSE', 'appr', null, ['raptor']), R('CSE', 'appr', null, ['raptor']), R('CSE', 'appr', null, ['raptor']), R('CSE', 'appr', null, ['raptor']), null, null]],
  ['Ranger', [R('LL', 'appr'), R('LL', 'appr'), R('LL', 'appr'), null, R('LL', 'wait', 'am'), null, null]],
  ['Sidewinder', [R('OIL', 'wait'), R('HO', 'sc', 'am'), R('CCL', 'appr'), R('CCL', 'appr'), null, null, null]],
  ['Warden', [R('C', 'info', null, ['raptor']), R('C', 'info', null, ['raptor']), null, null, R('FO', 'sc'), null, null]],
  ['Drifter', [null, null, R('OD', 'appr', null, ['raptor']), R('OD', 'appr', null, ['raptor']), R('OD', 'appr', null, ['raptor']), null, null]],
  ['Basher', [R('OML', 'info', null, ['raptor']), null, R('HL', 'info', null, ['raptor']), R('HL', 'info', null, ['raptor']), R('B', 'info', null, ['raptor']), null, null]],
  ['Piston', [null, R('OIL', 'appr'), null, R('PL', 'wait'), R('PL', 'wait'), null, null]],
]
const DAYS = ['MON 19', 'TUE 20', 'WED 21', 'THU 22', 'FRI 23', 'SAT 24', 'SUN 25']
function week(look) {
  const head = `<tr><th></th>${DAYS.map(d => `<th>${d.replace(' ', '<br>')}</th>`).join('')}</tr>`
  const body = WEEK.map(([n, cells]) => `<tr><td class="nm">${n}</td>${cells.map((c, i) => {
    const we = i > 4 ? ' we' : ''
    if (!c) return `<td class="cell${we}"></td>`
    return cell(c.e, c.m, look).replace('<td class="cell', `<td class="cell${we}`)
  }).join('')}</tr>`).join('')
  return `<table class="grid">${head}${body}</table>`
}
function statesTable() {
  const head = `<tr><th style="text-align:left;padding-left:10px">Case</th><th>E</th><th class="rec">F · yours</th></tr>`
  return `<table class="st cat">${head}${CASES.map(([lab, e, m = []]) => `<tr><td class="lab">${lab}</td>${cell(e, m, 'E')}${cell(e, m, 'F')}</tr>`).join('')}</table>`
}
function key() {
  const sw = (code, st) => `<span class="sw">${box([code, st], 'F', [], 'whole')}</span>`
  const first = { ll: 'LL', ol: 'OL', oil: 'OIL', care: 'CCL', cse: 'CSE', od: 'OD', med: 'C' }
  return `<div class="key"><span class="h">Approved</span><span class="h">Waiting</span><span class="h">Refused</span><span></span>` +
    KEY.map(([f, codes, word]) => {
      const c = first[f], decided = f === 'cse' || f === 'od' || f === 'med'
      return `${sw(c, 'appr')}${decided ? '<span></span><span></span>' : sw(c, 'wait') + sw(c, 'ref')}<span><b>${codes}</b> · ${word}${decided ? ' <i style="color:#8a96a3;font-style:normal">(from the Inputs page)</i>' : ''}</span>`
    }).join('') + `</div>`
}
// every input the war shows, in every state it can be in (his ask, 21 Oct 26: "show me every single input")
const ALL = [
  ['LL', 'local leave', 'leave'], ['OL', 'overseas leave', 'leave'], ['OIL', 'off in lieu', 'leave'],
  ['CCL', 'child care leave', 'leave'], ['FCL', 'family care leave', 'leave'], ['PL', 'paternity leave', 'leave'],
  ['EL', 'embarkation leave', 'leave'], ['CL', 'compassionate leave', 'leave'],
  ['B', 'ATT B: no flying, may still work', 'med'], ['C', 'ATT C', 'med'], ['OML', 'outpatient medical leave', 'med'], ['HL', 'hospitalisation leave', 'med'],
  ['CSE', 'course', 'whole'], ['OD', 'overseas duty', 'whole'],
  ['FO', 'a day of OIL credited', 'fo'], ['HO', 'half a day of OIL credited', 'ho'],
]
const NONE = '<td class="cell na"><div class="cb"><span class="dash">–</span></div></td>'
function catalogue() {
  const cols = ['Approved', 'Waiting', 'Refused', 'AM', 'PM', 'Inputs<br>page']
  const head = `<tr><th style="text-align:left;padding-left:10px">Input</th>${cols.map(c => `<th>${c}</th>`).join('')}</tr>`
  const rows = ALL.map(([code, word, kind]) => {
    const c = (st, half, m) => cell([[code, st, half]], m || [], 'F')
    let tds
    if (kind === 'leave') tds = [c('appr'), c('wait'), c('ref'), c('appr', 'am'), c('appr', 'pm'), c('appr', null, ['raptor'])]
    else if (kind === 'med') tds = [c('info', null, ['raptor']), NONE, NONE, c('info', 'am', ['raptor']), c('info', 'pm', ['raptor']), c('info', null, ['raptor'])]
    else if (kind === 'whole') tds = [c('appr', null, ['raptor']), NONE, NONE, NONE, NONE, c('appr', null, ['raptor'])]
    else if (kind === 'fo') tds = [c('sc'), NONE, NONE, NONE, NONE, NONE]
    else tds = [NONE, NONE, NONE, c('sc', 'am'), c('sc', 'pm'), NONE]
    return `<tr><td class="lab"><b>${code}</b> · ${word}</td>${tds.join('')}</tr>`
  }).join('')
  return `<table class="st cat">${head}${rows}</table>`
}
// the three real cases (the app's clash rules, 20 Sep 26: leave is allowed during a course or overseas duty, beside
// ATT B, and an OIL award given by hand never flags a leave day — D80), beside a real morning and afternoon
const TWO = [
  ['Cinch', 'leave during a course', { e: [['LL', 'appr'], ['CSE', 'appr']], m: [[], ['raptor']] }],
  ['Basher', 'leave while ATT B', { e: [['LL', 'appr'], ['B', 'info']], m: [[], ['raptor']] }],
  ['Warden', 'an FO given on a leave day', { e: [['LL', 'appr'], ['FO', 'sc']], m: [[], []] }],
  ['Viper', 'a full day of leave and an HO in the afternoon', { e: [['LL', 'appr'], ['HO', 'sc', 'pm']], m: [[], []] }],
  ['Slick', 'a full day of leave and an HO in the morning', { e: [['LL', 'appr'], ['HO', 'sc', 'am']], m: [[], []] }],
  ['Ranger', 'for comparison: a real morning and afternoon', { e: [['LL', 'appr', 'am'], ['OIL', 'appr', 'pm']], m: [] }],
]
function twoGrid(how) {
  return `<table class="grid"><tr><th></th><th>MON<br>19</th><th style="text-align:left;padding-left:8px">the case</th></tr>${TWO.map(([n, why, c]) => {
    const td = c.e[0][2] ? cell(c.e, c.m, 'F') : cell(c.e, c.m, 'F', how)
    return `<tr><td class="nm">${n}</td>${td}<td class="nm" style="font-weight:500;color:#8a96a3;background:#0f1318">${why}</td></tr>`
  }).join('')}</table>`
}
function page(phone) {
  const z = phone ? 0.8 : 1
  const at = phone ? 'at your phone\'s zoom (0.8), real size' : 'at desktop size'
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Leave War colours</title><style>${CSS}</style></head><body><div class="wrap">
<section id="wk"><h1>One week: E, then your colours</h1><p class="sub">Mon 19 – Sun 25 Jan, nine people, ${at}. Both: the colour is the kind of leave; filled is approved, hollow is waiting. F: local and overseas leave two ambers, OIL green, a course lilac.</p>
<div class="looks"><div><div class="cap">E · as drawn before</div><div class="zoom" style="--z:${z}">${week('E')}</div></div>
<div><div class="cap rec">F · your colours</div><div class="zoom" style="--z:${z}">${week('F')}</div></div></div></section>
<section id="key" style="margin-top:22px"><h1>Your colours (F)</h1><p class="sub">Each kind of leave keeps its colour; how it stands is the fill.</p><div class="zoom" style="--z:${z}">${key()}</div></section>
<section id="all" style="margin-top:22px"><h1>Every input, your colours (F)</h1><p class="sub">Each kind the Leave War shows, in every state it can be in, ${at}. A dash: it cannot be in that state. Medical, courses and overseas duty come from the Inputs page, so they wear its cyan edge and are never waiting or refused. FO is always a whole day, HO always a half.</p><div class="zoom" style="--z:${z}">${catalogue()}</div></section>
<section id="q4b" style="margin-top:22px"><h1>Two whole-day entries on one day</h1><p class="sub">The three cases the app's rules allow, then a full day of leave with an HO, in your colours, ${at}.</p>
<div class="looks"><div><div class="cap">A · side by side, each the full height <i>(three letters do not fit)</i></div><div class="zoom" style="--z:${z}">${twoGrid('side')}</div></div>
<div><div class="cap">B · one above the other <i>(reads like morning and afternoon)</i></div><div class="zoom" style="--z:${z}">${twoGrid('stack')}</div></div>
<div><div class="cap rec">C · the leave fills the cell, the other a strip down its right edge <i>(recommended)</i></div><div class="zoom" style="--z:${z}">${twoGrid('strip')}</div></div></div></section>
<section id="st" style="margin-top:22px"><h1>Every state, E beside F</h1><p class="sub">${at}.</p><div class="zoom" style="--z:${z}">${statesTable()}</div></section>
</div></body></html>`
}
writeFileSync(join(HERE, 'cells4-phone.html'), page(true))
writeFileSync(join(HERE, 'cells4-desk.html'), page(false))
const browser = await chromium.launch()
for (const [n, w, dpr, phone] of [['p4d-phone', 390, 3, true], ['p4d-desk', 900, 2, false]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: dpr })
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e)))
  await p.goto('file:///' + join(HERE, phone ? 'cells4-phone.html' : 'cells4-desk.html').replace(/\\/g, '/'))
  await p.waitForTimeout(300)
  const over = await p.evaluate(() => [...document.querySelectorAll('.f')].filter(f => f.querySelector('b').scrollWidth > f.clientWidth + 0.5).map(f => f.textContent))
  console.log(n, 'overflow:', JSON.stringify(over), 'width', await p.evaluate(() => document.documentElement.scrollWidth))
  for (const s of ['wk', 'key', 'all', 'q4b', 'st']) await p.locator('#' + s).screenshot({ path: join(OUT, `${n}-${s}.png`) })
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
