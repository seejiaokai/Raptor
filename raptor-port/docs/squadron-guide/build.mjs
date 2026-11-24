/* Builds the guide for another squadron's schedulers and training appointment holders:
   - talon-guide.html — one self-contained page in the app's own look (pictures inside it), interactive where scripts run:
     a section bar, a search and level filter over the settings and checks, pictures that open large, tables that zoom
     and switch between a table and cards, and "Different for us" notes on every row that copy out as one text.
     With scripts off (some phone file previews) it is the same guide, read only.
   - talon-guide.pdf (with --pdf) — the same page printed light, every "How it works" open.
   - with --page <file>, the page without its outer document tags, for publishing as an Artifact.
   The tables of settings and checks are NOT typed here: they are read from logic.json, the Logic page's own words and
   standard values, so the guide cannot say something the app does not.
   Run from raptor-port/:  node docs/squadron-guide/build.mjs [--pdf] [--page <file>] */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const L = JSON.parse(readFileSync(join(HERE, 'logic.json'), 'utf8'))
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const PDF = process.argv.includes('--pdf')
const PAGE = process.argv.includes('--page') ? process.argv[process.argv.indexOf('--page') + 1] : null

/* a picture, inside the page as data so the one file travels by itself; one not taken yet is left out, loudly */
const missing = []
const pic = (name, alt, cap, cls = '') => {
  const f = join(HERE, 'pictures', name + '.jpg')
  if (!existsSync(f)) { missing.push(name); return '' }
  return `<figure class="${cls}"><img class="zoomable" tabindex="0" role="button" aria-label="${esc(alt)}: open large" alt="${esc(alt)}" src="data:image/jpeg;base64,${readFileSync(f).toString('base64')}"><figcaption>${cap}</figcaption></figure>`
}

const TIER = { Warning: 'hard', Advisory: 'adv', Note: 'note' }
const pill = t => `<span class="pill ${TIER[t]}">${t}</span>`
/* the reader's own note on a row: a button that opens a box; the script gathers every filled box into one text */
const ans = (code, name) => `<td class="ans noprint"><button type="button" class="diff" data-for="n-${code}">Different for us</button><input class="mynote" id="n-${code}" data-code="${code}" data-name="${esc(name)}" placeholder="What is it for you?" aria-label="${code}: what is different for you" hidden></td>`

/* the settings, coded S1… so a reader can answer "S6: ours is 45 min" */
let sN = 0
const sCodes = {}
const settingsHTML = L.settings.map(g => `<tr class="grp"><th colspan="5">${esc(g.g)}</th></tr>` + g.items.map(s => {
  const v = s.kind === 'kinds'
    ? L.kinds.map(k => `${esc(k.label)}: <b class="${k.hard ? 't-hard' : 't-adv'}">${k.hard ? 'red' : 'amber'}</b>`).join('<br>')
    : `<span class="val">${esc(s.value)}</span>`
  const code = sCodes[s.name] = 'S' + (++sN)
  return `<tr class="row" data-level="set" data-text="${esc((code + ' ' + s.name + ' ' + s.value + ' ' + s.line).toLowerCase())}"><td class="code">${code}</td><td class="nm">${esc(s.name)}</td><td class="valc">${v}</td><td>${esc(s.line)}</td>${ans(code, s.name)}</tr>`
}).join('')).join('')

/* the checks, coded C1… */
let cN = 0
const codes = {}
const checksHTML = L.checks.filter(g => g.g !== 'On the puck').map(g => `<div class="chkgrp"><h3>${esc(g.g)}</h3><div class="scroll"><table class="auto big"><thead><tr><th>Code</th><th>Check</th><th>Level</th><th>When it shows</th><th class="noprint">Yours</th></tr></thead><tbody>` + g.items.map(c => {
  const code = codes[c.name] = 'C' + (++cN)
  return `<tr class="row" data-level="${TIER[c.tier]}" data-text="${esc((code + ' ' + c.name + ' ' + c.tier + ' ' + c.line + ' ' + (c.how || []).join(' ')).toLowerCase())}"><td class="code">${code}</td><td class="nm">${esc(c.name)}</td><td>${pill(c.tier)}</td><td>${esc(c.line)}${
    c.how ? `<details${PDF ? ' open' : ''}><summary>How it works</summary><ul>${c.how.map(h => `<li>${esc(h)}</li>`).join('')}</ul></details>` : ''}</td>${ans(code, c.name)}</tr>`
}).join('') + `</tbody></table></div></div>`).join('')

/* the letters on a puck, most serious first, as the app orders and colours them */
const chipCol = c => ['Q', 'C', 'CPH', 'RUN', 'CR'].includes(c) ? 'hard' : c === 'LD' ? 'note' : 'adv'
const chipsHTML = L.chips.map(c => `<tr><td><span class="chip ${chipCol(c.code)}">${esc(c.chip)}</span></td><td>${esc(c.label)}</td></tr>`).join('')

/* standby, kept as data so it can be drawn two ways: a table to compare the four across, and a card for each to read
   down on a phone. Equal neighbours in a row are joined into one cell in the table. */
const SA_KINDS = ['SC MAIN', 'SC SPARE', 'AVALON', 'BB']
const hours = 'Exactly the START and END written. No step, dekit, brief or debrief is added.'
const SA = [
  ['Hours', hours, hours, hours + ' Overnight.', hours + ' The times are yours to set.'],
  ['Also down for something else in those hours',
    `<b>Flagged.</b> Red against a flight, a sim, a duty post or another shift. Amber against a ground event or a programme item. Each of the six can be set red or amber (${sCodes['SC MAIN conflicts']}).`,
    'Not flagged, unless it is another SC seat or the SC desk.',
    'Not flagged, unless it is another AVALON seat or the AVALON desk.',
    'Not flagged, unless it is another seat or the BB desk.'],
  ['Leave, medical and other inputs',
    `<b>Flagged</b> red, as on a flying line, ATT B included. A meeting is amber (${codes['Overlaps standby']}).`,
    'Only overseas leave, overseas duty or a medical code is flagged. Local leave and other local inputs may still stand SPARE.',
    'Only overseas or medically down is flagged.', 'Only overseas or medically down is flagged.'],
  ['Currency',
    `SC DAY if the shift sits wholly inside the SC day window (${sCodes['SC day window']}). SC NIGHT if it reaches outside it.`,
    `SC DAY if the shift sits wholly inside the SC day window (${sCodes['SC day window']}). SC NIGHT if it reaches outside it.`,
    'SC NIGHT.', 'SC currency for the hours typed.'],
  ['Front seat', 'Pilots only.', 'Pilots only.', 'Pilots only.', 'Pilots only.'],
  ['Crew rest',
    `<b>Checked</b>, measured to the shift's START. Typing its B or R makes the line fly (below), and its crew rest then counts to the B or R.`,
    'None while standing by.', 'None while standing by.', 'None while standing by.'],
  ['OIL on a weekend or holiday', 'Earned over its written hours.',
    'Only if switched on for that row in OIL Earn.', 'Only if switched on for that row in OIL Earn.', 'Only if switched on for that row in OIL Earn.'],
]
const saTable = `<table class="keep sa big"><thead><tr><th>While standing by</th>${SA_KINDS.map(k => `<th>${k}</th>`).join('')}</tr></thead><tbody>` + SA.map(([label, ...cells]) => {
  let tds = ''
  for (let i = 0; i < cells.length;) { let j = i + 1; while (j < cells.length && cells[j] === cells[i]) j++; tds += `<td${j - i > 1 ? ` colspan="${j - i}"` : ''}>${cells[i]}</td>`; i = j }
  return `<tr><td class="nm">${label}</td>${tds}</tr>`
}).join('') + `</tbody></table>`
const saCards = `<div class="sacards">` + SA_KINDS.map((k, i) => `<section class="sacard"><h4>${k}</h4><dl>${SA.map(r => `<dt>${r[0]}</dt><dd>${r[i + 1]}</dd>`).join('')}</dl></section>`).join('') + `</div>`

let qN = 0
const QUESTIONS = readFileSync(join(HERE, 'questions.txt'), 'utf8').split(/\r?\n\r?\n/).filter(b => /^Q\d+\./.test(b.trim())).map(b => {
  const [q, ...rest] = b.trim().split(/\r?\n/)
  const n = ++qN
  return `<li><b>${esc(q.replace(/^Q\d+\.\s*/, ''))}</b><span class="ctx">${esc(rest.join(' ').replace(/^Context:\s*/, ''))}</span><textarea class="mynote qa noprint" id="n-Q${n}" data-code="Q${n}" data-name="" rows="2" placeholder="Your answer" aria-label="Your answer to question ${n}"></textarea></li>`
}).join('')

/* a table drawn as stacked cards: once for the class the script sets, once for a narrow screen with scripts off */
const stack = sel => `
  ${sel},${sel} thead,${sel} tbody,${sel} tr,${sel} th,${sel} td{display:block}
  ${sel} thead{display:none}
  ${sel} tr{border-bottom:1px solid var(--edge);padding:10px 12px}
  ${sel} tr.grp{padding:0}
  ${sel} tr.grp th{padding:9px 12px}
  ${sel} td{border:0;padding:2px 0}
  ${sel} td.code{width:auto;display:inline-block;margin-right:8px}
  ${sel} td.nm{display:inline-block;min-width:0}
  ${sel} td.valc{white-space:normal}
  ${sel} td.ans{padding-top:8px}`

const SECTIONS = [['what', 'What it is'], ['pages', 'Pages'], ['flow', 'Plan to published'], ['flags', 'Flags'], ['numbers', 'Numbers'], ['checks', 'Checks'], ['standby', 'Standby'], ['training', 'Training'], ['words', 'Typed words'], ['f15', 'Built for F-15'], ['questions', 'Questions']]
const tools = (id, cards) => `<div class="tools noprint" data-tools="${id}">${cards ? `<span class="seg"><button type="button" data-view="table">Table</button><button type="button" data-view="cards">Cards</button></span>` : ''}<span class="seg zoomseg"><button type="button" data-zoom="out" aria-label="Zoom the table out">−</button><button type="button" data-zoom="fit">Fit</button><button type="button" data-zoom="in" aria-label="Zoom the table in">+</button></span></div>`

const css = `
/* layout: the app's own shell — a pinned top bar with the sections, dark panels of dense rows under it, one column */
:root{color-scheme:dark;
  --bg:#0B0D10;--panel:#14181D;--panel-2:#1A1F26;--raised:#20262E;--edge:#2A313A;--edge-2:#39424D;
  --ink:#F1F4F7;--ink-2:#B6C0CB;--ink-3:#8A96A3;--accent:#3BC6E8;--accent-ink:#052A34;
  --hard:#F0555F;--adv:#E5A83B;--note:#8A96A3;--on-hard:#fff;--on-adv:#1B1404;--on-note:#0B0D10;
  --top-a:#15384C;--top-b:#0B1C27;--top-edge:#1F5870;--shade:rgba(0,0,0,.88);
  --sans:'Inter Tight',system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,Consolas,Menlo,monospace}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-padding-top:calc(env(safe-area-inset-top,0px) + 104px)}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 var(--sans)}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--top-a)}
.gut{padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.in{max-width:1080px;margin:0 auto}
.topbar{position:sticky;top:env(safe-area-inset-top,0px);z-index:9;background:linear-gradient(var(--top-a),var(--top-b));border-bottom:1px solid var(--top-edge)}
.topbar .in{display:flex;align-items:center;gap:8px 16px;flex-wrap:wrap;padding-block:9px}
.brand{display:flex;align-items:center;gap:9px;font-weight:800;letter-spacing:.14em;font-size:19px;color:var(--ink);text-decoration:none}
.brand svg{width:26px;height:28px;fill:var(--accent)}
.brand small{font-weight:600;letter-spacing:.08em;font-size:11px;color:var(--ink-3);text-transform:uppercase}
.nav{display:flex;gap:4px;overflow-x:auto;flex:1 1 320px;min-width:0;scrollbar-width:none}
.nav::-webkit-scrollbar{display:none}
.nav a{flex:none;color:var(--ink-2);text-decoration:none;font-size:14px;font-weight:600;padding:6px 10px;border-radius:8px;border:1px solid transparent;white-space:nowrap}
.nav a:hover{color:var(--ink)}
.nav a.on{color:var(--accent);border-color:var(--accent);background:rgba(59,198,232,.1)}
.mine{font:700 14px var(--sans);color:var(--accent-ink);background:var(--accent);border:0;border-radius:8px;padding:8px 12px;cursor:pointer;white-space:nowrap}
.mine[disabled]{background:var(--raised);color:var(--ink-3);cursor:default}
main{padding-block:0 64px}
.hero{padding-block:26px 6px}
.hero h1{margin:0 0 6px;font-size:clamp(26px,5vw,34px);line-height:1.15;text-wrap:balance}
.hero p{margin:0;color:var(--ink-2);max-width:62ch}
section.sec{padding-top:34px}
.eyebrow{font:700 12px var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin:0 0 2px}
h2{font-size:23px;margin:0 0 10px;line-height:1.2;text-wrap:balance}
h2 small{font-weight:500;color:var(--ink-3);font-size:15px;margin-left:6px}
h3{font-size:15px;margin:22px 0 8px;color:var(--ink-2);letter-spacing:.02em}
p{margin:8px 0;max-width:68ch;color:var(--ink-2)}
p.lead{font-size:17px;color:var(--ink)}
.box{background:var(--panel);border:1px solid var(--edge);border-left:4px solid var(--accent);border-radius:10px;padding:12px 14px;margin:16px 0;color:var(--ink-2)}
.box b{color:var(--ink)}
.box b.eg{font-family:var(--mono);background:var(--raised);padding:1px 7px;border-radius:5px;font-weight:500;font-size:.9em;white-space:nowrap;color:var(--accent)}
figure{margin:14px 0;background:var(--panel);border:1px solid var(--edge);border-radius:10px;overflow:hidden}
figure img{display:block;width:100%;height:auto;cursor:zoom-in}
figure.phone{max-width:340px}
figcaption{padding:9px 12px;font-size:14px;color:var(--ink-2);border-top:1px solid var(--edge)}
figcaption b{color:var(--ink)}
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;align-items:start}
.two>*{min-width:0;margin:0}
.scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--edge);border-radius:10px;background:var(--panel);margin:8px 0 4px}
table{width:100%;border-collapse:collapse;font-size:14.5px}
.scroll>table.keep{min-width:700px}
th,td{text-align:left;vertical-align:top;padding:8px 11px;border-bottom:1px solid var(--edge)}
thead th{background:var(--panel-2);font:700 11.5px var(--mono);text-transform:uppercase;letter-spacing:.09em;color:var(--ink-3)}
tr.grp th{background:var(--panel-2);color:var(--ink);font-size:14px}
tbody tr:last-child td{border-bottom:0}
td{color:var(--ink-2)}
td b{color:var(--ink)}
td.code{font:700 13px var(--mono);color:var(--accent);white-space:nowrap;width:1%}
td.nm{font-weight:600;color:var(--ink);min-width:150px}
td.valc{white-space:nowrap}
.val{display:inline-block;font:700 13px var(--mono);color:var(--accent);background:var(--bg);border:1px solid var(--edge-2);border-radius:6px;padding:2px 8px}
.t-hard{color:var(--hard)}.t-adv{color:var(--adv)}
.pill,.chip{display:inline-block;border-radius:999px;padding:1px 9px;font-size:12.5px;font-weight:700;white-space:nowrap}
.chip{border-radius:5px;min-width:30px;text-align:center;font-family:var(--mono)}
.hard{background:var(--hard);color:var(--on-hard)}.adv{background:var(--adv);color:var(--on-adv)}.note.pill,.chip.note{background:var(--note);color:var(--on-note)}
details{margin-top:6px}
summary{cursor:pointer;color:var(--accent);font-weight:600;font-size:13.5px}
details ul{margin:6px 0 2px;padding-left:18px}
details li{margin:3px 0}
ol.steps{padding:0;list-style:none;counter-reset:s;margin:10px 0;background:var(--panel);border:1px solid var(--edge);border-radius:10px}
ol.steps>li{counter-increment:s;position:relative;padding:11px 14px 11px 54px;border-bottom:1px solid var(--edge);color:var(--ink-2)}
ol.steps>li:last-child{border-bottom:0}
ol.steps>li b{color:var(--ink)}
ol.steps>li::before{content:counter(s);position:absolute;left:14px;top:11px;width:28px;height:28px;border-radius:50%;background:var(--accent);color:var(--accent-ink);font:700 14px/28px var(--mono);text-align:center}
ol.qs{padding-left:24px;margin:10px 0}
ol.qs li{margin:14px 0;color:var(--ink)}
.ctx{display:block;color:var(--ink-2);font-size:14.5px;margin-top:2px}
code{font-family:var(--mono);background:var(--raised);padding:1px 6px;border-radius:5px;font-size:.88em;color:var(--ink)}
.tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0 0}
.seg{display:inline-flex;border:1px solid var(--edge-2);border-radius:8px;overflow:hidden}
.seg button{font:600 13px var(--sans);color:var(--ink-2);background:var(--panel);border:0;border-right:1px solid var(--edge-2);padding:7px 12px;cursor:pointer;min-width:38px}
.seg button:last-child{border-right:0}
.seg button.on{background:var(--accent);color:var(--accent-ink)}
.find{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0 0}
.find input{flex:1 1 220px;min-width:0;font:15px var(--sans);color:var(--ink);background:var(--panel);border:1px solid var(--edge-2);border-radius:8px;padding:8px 12px}
.find .count{font:600 12.5px var(--mono);color:var(--ink-3)}
.diff{font:600 12.5px var(--sans);color:var(--ink-3);background:none;border:1px dashed var(--edge-2);border-radius:7px;padding:5px 9px;cursor:pointer;white-space:nowrap}
.diff:hover{color:var(--accent);border-color:var(--accent)}
[hidden]{display:none!important}
.mynote{width:100%;min-width:150px;font:14.5px var(--sans);color:var(--ink);background:var(--bg);border:1px solid var(--accent);border-radius:7px;padding:6px 9px;margin-top:6px}
textarea.mynote{display:block;border-color:var(--edge-2);margin-top:8px;resize:vertical}
textarea.mynote:focus,.find input:focus{border-color:var(--accent);outline:0}
tr.has td.code::after{content:" •";color:var(--adv)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.sacards{display:none;gap:12px;grid-template-columns:1fr}
.sacard{background:var(--panel);border:1px solid var(--edge);border-radius:10px;padding:12px 14px}
.sacard h4{margin:0 0 6px;font:700 14px var(--mono);letter-spacing:.08em;color:var(--accent)}
.sacard dl{margin:0}
.sacard dt{font-weight:600;color:var(--ink);font-size:14px;margin-top:8px}
.sacard dd{margin:1px 0 0;color:var(--ink-2);font-size:14.5px}
.sacard dd b{color:var(--ink)}
.sawrap.cards .scroll{display:none}.sawrap.cards .sacards{display:grid}
.sawrap.cards .zoomseg,.cardsview .zoomseg{display:none}
${stack('table.stack')}
.lb{position:fixed;inset:0;z-index:20;background:var(--shade);overflow:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top,0px) + 56px) max(8px,env(safe-area-inset-right,0px)) calc(env(safe-area-inset-bottom,0px) + 16px) max(8px,env(safe-area-inset-left,0px))}
.lb img{display:block;width:100%;height:auto;max-width:none;cursor:zoom-in;border-radius:6px}
.lb.big img{width:240%;cursor:zoom-out}
.lb .x,.sheet .x{position:fixed;top:calc(env(safe-area-inset-top,0px) + 10px);right:max(12px,env(safe-area-inset-right,0px));font:700 14px var(--sans);color:var(--accent-ink);background:var(--accent);border:0;border-radius:8px;padding:8px 14px;cursor:pointer}
.lb .hint{position:fixed;top:calc(env(safe-area-inset-top,0px) + 18px);left:max(14px,env(safe-area-inset-left,0px));color:var(--ink-2);font-size:13.5px}
.sheet{position:fixed;inset:0;z-index:21;background:var(--shade);display:flex;align-items:center;justify-content:center;padding:calc(env(safe-area-inset-top,0px) + 12px) max(12px,env(safe-area-inset-right,0px)) calc(env(safe-area-inset-bottom,0px) + 12px) max(12px,env(safe-area-inset-left,0px))}
.sheet .card{width:min(640px,100%);max-height:100%;display:flex;flex-direction:column;gap:10px;background:var(--panel);border:1px solid var(--edge-2);border-radius:12px;padding:16px}
.sheet h2{margin:0;font-size:19px}
.sheet p{margin:0;font-size:14px}
.sheet textarea{flex:1 1 auto;min-height:200px;width:100%;font:13.5px/1.45 var(--mono);color:var(--ink);background:var(--bg);border:1px solid var(--edge-2);border-radius:8px;padding:10px}
.sheet .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.btn{font:700 14px var(--sans);border-radius:8px;padding:9px 14px;cursor:pointer;border:1px solid var(--edge-2);background:var(--raised);color:var(--ink)}
.btn.pri{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.said{font-size:13.5px;color:var(--accent)}
footer{margin-top:40px;color:var(--ink-3);font-size:13px}
.nojs{display:block;color:var(--ink-3);font-size:13.5px}
.js .nojs{display:none}
html:not(.js) .noprint.tools,html:not(.js) .find,html:not(.js) .ans,html:not(.js) .mine,html:not(.js) textarea.qa{display:none}
@media (max-width:700px){
  ${stack('html:not(.js) table.auto')}
  html:not(.js) .sawrap .scroll{display:none}
  html:not(.js) .sawrap .sacards{display:grid}
  .topbar .in{padding-block:7px}
  .brand{font-size:17px}
  .mine{order:2;margin-left:auto}
  .nav{order:3;flex-basis:100%}
  html{scroll-padding-top:calc(env(safe-area-inset-top,0px) + 112px)}
}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
@page{size:A4;margin:13mm 11mm}
@media print{
  :root{color-scheme:light;--bg:#fff;--panel:#fff;--panel-2:#EEF2F5;--raised:#E9EEF3;--edge:#D8DFE6;--edge-2:#C5CED8;
    --ink:#14202B;--ink-2:#3C4A57;--ink-3:#66727F;--accent:#0E7F9D;--accent-ink:#fff;
    --hard:#C93A46;--adv:#B77A12;--note:#66727F;--on-adv:#fff;--on-note:#fff;--top-a:#0B1F33;--top-b:#0B1F33;--top-edge:#0B1F33}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{font-size:10.5pt}
  body::before,.noprint,.nav,.mine,.lb,.sheet,.nojs{display:none!important}
  .topbar{position:static}
  .brand,.brand small{color:#fff}.brand svg{fill:#7FD6EE}
  .in{max-width:none}
  .gut{padding-left:0;padding-right:0}
  .topbar .in{padding:10px 14px}
  section.sec{padding-top:20px}
  h2,h3{break-after:avoid}
  tr,figure,.box,ol.steps>li,.sacard{break-inside:avoid}
  table{font-size:9pt}
  .scroll{overflow:visible}
  .scroll>table.keep{min-width:0}
  figure.phone{max-width:230px}
  figure img{cursor:default}
}`

/* the script: everything it adds is extra — with it off, the page above is the whole guide */
const js = `
(function(){
  var d=document,root=d.documentElement,KEY='talon-guide-answers',NARROW=700;
  var $=function(s,el){return Array.prototype.slice.call((el||d).querySelectorAll(s))};
  /* the section bar lights the section in view */
  var links=$('.nav a');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){var on=a.getAttribute('href')==='#'+e.target.id;a.classList.toggle('on',on);if(on&&a.scrollIntoView&&a.parentNode.scrollWidth>a.parentNode.clientWidth)a.parentNode.scrollLeft=a.offsetLeft-a.parentNode.clientWidth/2+a.clientWidth/2})}})},{rootMargin:'-25% 0px -70% 0px'});
    $('section.sec').forEach(function(s){io.observe(s)});
  }
  /* table or cards, and the zoom: one set of buttons a block */
  function setView(wrap,view){
    wrap.classList.toggle('cardsview',view==='cards');
    if(wrap.classList.contains('sawrap'))wrap.classList.toggle('cards',view==='cards');
    $('table.auto',wrap).forEach(function(t){t.classList.toggle('stack',view==='cards');t.classList.toggle('keep',view!=='cards');if(view==='cards')t.style.zoom=''});
    $('[data-view]',wrap).forEach(function(b){b.classList.toggle('on',b.getAttribute('data-view')===view)});
  }
  function zoom(wrap,how){
    $('.scroll>table',wrap).forEach(function(t){
      var z=parseFloat(t.style.zoom)||1,box=t.parentNode;
      if(how==='fit'){t.style.zoom=1;z=Math.max(.35,Math.min(1,(box.clientWidth-2)/t.offsetWidth))}
      else z=Math.max(.35,Math.min(1.6,z+(how==='in'?.15:-.15)));
      t.style.zoom=Math.round(z*100)/100;
    });
  }
  /* a small table outside those blocks reads as cards on a narrow screen */
  if(window.innerWidth<=NARROW)$('table.auto').forEach(function(t){if(!t.closest('[data-wrap]'))t.classList.add('stack')});
  $('[data-wrap]').forEach(function(wrap){
    setView(wrap,window.innerWidth<=NARROW&&$('[data-view]',wrap).length?'cards':'table');
    wrap.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('button');if(!b)return;
      if(b.hasAttribute('data-view'))setView(wrap,b.getAttribute('data-view'));
      if(b.hasAttribute('data-zoom'))zoom(wrap,b.getAttribute('data-zoom'));
    });
  });
  /* the search and the level filter over the settings and the checks */
  var q=d.getElementById('find'),level='all',count=d.getElementById('findcount'),rows=$('tr.row');
  function filter(){
    var words=(q.value||'').toLowerCase().split(/\\s+/).filter(Boolean),shown=0;
    rows.forEach(function(r){
      var ok=(level==='all'||r.getAttribute('data-level')===level)&&words.every(function(w){return r.getAttribute('data-text').indexOf(w)>=0});
      r.hidden=!ok;if(ok)shown++;
    });
    $('tr.grp').forEach(function(g){var n=g.nextElementSibling,any=false;while(n&&!n.classList.contains('grp')){if(!n.hidden)any=true;n=n.nextElementSibling}g.hidden=!any});
    $('.chkgrp').forEach(function(g){g.hidden=!$('tr.row',g).some(function(r){return !r.hidden})});
    count.textContent=shown===rows.length?rows.length+' rows':shown+' of '+rows.length;
  }
  if(q){q.addEventListener('input',filter);
    $('[data-level-pick]').forEach(function(b){b.addEventListener('click',function(){level=b.getAttribute('data-level-pick');$('[data-level-pick]').forEach(function(x){x.classList.toggle('on',x===b)});filter()})});
    filter();}
  /* the reader's notes: kept in this browser where it allows, gathered into one text to copy */
  var notes=$('.mynote'),mine=d.getElementById('mine'),store={};
  try{store=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){store={}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(store))}catch(e){}}
  function tally(){
    var n=notes.filter(function(i){return i.value.trim()}).length;
    mine.textContent=n?'My answers · '+n:'My answers';mine.disabled=!n;
    notes.forEach(function(i){var r=i.closest('tr');if(r)r.classList.toggle('has',!!i.value.trim())});
  }
  notes.forEach(function(i){
    if(store[i.id]){i.value=store[i.id];i.hidden=false}
    i.addEventListener('input',function(){if(i.value.trim())store[i.id]=i.value;else delete store[i.id];save();tally()});
  });
  $('.diff').forEach(function(b){b.addEventListener('click',function(){var i=d.getElementById(b.getAttribute('data-for'));i.hidden=false;i.focus()})});
  function text(){
    var out=['TALON guide: our inputs',''];
    notes.forEach(function(i){var v=i.value.trim();if(!v)return;var c=i.getAttribute('data-code'),n=i.getAttribute('data-name');out.push(c+(n?' ('+n+')':'')+': '+v)});
    return out.join('\\n');
  }
  var sheet=d.getElementById('sheet'),ta=d.getElementById('sheettext'),said=d.getElementById('said'),opener=null;
  function closeSheet(){sheet.hidden=true;if(opener)opener.focus()}
  mine.addEventListener('click',function(){opener=mine;ta.value=text();said.textContent='';sheet.hidden=false;d.getElementById('copy').focus()});
  d.getElementById('sheetx').addEventListener('click',closeSheet);
  sheet.addEventListener('click',function(e){if(e.target===sheet)closeSheet()});
  d.getElementById('copy').addEventListener('click',function(){
    function fallback(){ta.focus();ta.select();var ok=false;try{ok=d.execCommand('copy')}catch(e){}said.textContent=ok?'Copied. Paste it into the group.':'Select the text and copy it.'}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(ta.value).then(function(){said.textContent='Copied. Paste it into the group.'},fallback);else fallback();
  });
  var sure=false,clr=d.getElementById('clear');
  clr.addEventListener('click',function(){
    if(!sure){sure=true;clr.textContent='Clear every answer? Press again';return}
    sure=false;clr.textContent='Clear all';store={};save();notes.forEach(function(i){i.value='';if(!i.classList.contains('qa'))i.hidden=true});tally();closeSheet();
  });
  tally();
  /* a picture opens large; a second press makes it larger still, to pan */
  var lb=d.getElementById('lb'),lbimg=d.getElementById('lbimg'),from=null;
  function openPic(img){from=img;lbimg.src=img.src;lbimg.alt=img.alt;lb.classList.remove('big');lb.hidden=false;d.getElementById('lbx').focus()}
  function closePic(){lb.hidden=true;lbimg.removeAttribute('src');if(from)from.focus()}
  $('img.zoomable').forEach(function(img){
    img.addEventListener('click',function(){openPic(img)});
    img.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openPic(img)}});
  });
  lbimg.addEventListener('click',function(){lb.classList.toggle('big')});
  d.getElementById('lbx').addEventListener('click',closePic);
  lb.addEventListener('click',function(e){if(e.target===lb)closePic()});
  d.addEventListener('keydown',function(e){if(e.key!=='Escape')return;if(!lb.hidden)closePic();else if(!sheet.hidden)closeSheet()});
})();`

const sec = (id, n, title, small, body) => `<section class="sec" id="${id}"><p class="eyebrow">${String(n).padStart(2, '0')}</p><h2>${title}${small ? ` <small>${small}</small>` : ''}</h2>${body}</section>`

const content = `
<header class="topbar"><div class="gut"><div class="in">
<a class="brand" href="#top" aria-label="TALON guide, top of the page"><svg viewBox="0 -2 60 64" aria-hidden="true"><path d="M3 8 Q4.9 38.3 24 62 Q11.5 35.8 3 8 Z"/><path d="M16 0 Q17.4 35.0 42 60 Q26.6 31.0 16 0 Z"/><path d="M31 -2 Q36.4 23.5 58 38 Q42.9 19.1 31 -2 Z"/></svg>TALON <small>guide</small></a>
<nav class="nav" aria-label="Sections">${SECTIONS.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('')}</nav>
<button type="button" class="mine" id="mine" disabled>My answers</button>
</div></div></header>
<main class="gut" id="top"><div class="in">

<div class="hero">
<h1>How TALON works</h1>
<p>A short guide for F-16 schedulers and training appointment holders seeing it for the first time. It was built for a two-seat F-15 squadron. Read it with your own squadron in mind.</p>
</div>

<div class="box"><b>What we need from you.</b> As you read, note what is the <b>same</b> for you, what is <b>different</b>, and what is <b>missing</b>. Every rule in the tables has a code. Reply with the code and what should change, for example <b class="eg">S6: our step is 45 min</b> or <b class="eg">C22: does not apply to us</b>. The questions are at the end.
<span class="nojs">This copy is read only. Opened in a browser, each row also takes your note and the page gathers them into one text to send.</span></div>

${sec('what', 1, 'What it is', '', `
<p class="lead">One place for the week's flying programme, everyone's leave and other inputs, qualifications, leave planning and OIL (off in lieu, earned for weekend or holiday work). As you plan, it checks every person against the squadron's rules and flags the problems.</p>
<p>It flags; the scheduler decides. A flag never stops a day being published.</p>
${pic('01-week', 'The week on Edit Schedule', '<b>Edit Schedule.</b> One column a day. Each day holds its flying waves, standby, duties, sims and ground events. A coloured name is a person (a "puck"), dragged into a seat from the crew list on the right.', 'wide')}`)}

${sec('pages', 2, 'The pages', '', `
<div class="scroll"><table class="auto"><thead><tr><th>Page</th><th>Who uses it</th><th>What it is for</th></tr></thead><tbody>
<tr><td class="nm">Edit Schedule</td><td>Schedulers (admins only)</td><td>The week. Add waves and lines, type the times, drag people into seats. Every change is checked at once.</td></tr>
<tr><td class="nm">Scheduler Board</td><td>Schedulers (admins only)</td><td>One day, full screen, for the heavy editing. Opened by tapping a day's date on Edit Schedule.</td></tr>
<tr><td class="nm">View-only Sched</td><td>Everyone</td><td>The programme to read. A published day shows exactly what was published.</td></tr>
<tr><td class="nm">Inputs</td><td>Everyone</td><td>Leave, medical, duties, courses, meetings, appointments. A calendar and a list. SANS aircrew file their availability on its SANS tab.</td></tr>
<tr><td class="nm">Quals</td><td>Everyone. Each person keeps his own row; admins can change anyone's</td><td>Who holds which qualification or currency. The checks read this page.</td></tr>
<tr><td class="nm">Logic</td><td>Everyone reads, admins change</td><td>Every number and every check the app uses, in plain words. Sections 5 and 6 below are this page.</td></tr>
<tr><td class="nm">Leave War</td><td>Everyone</td><td>Leave planning for a period: bids, manning for each day, leave and OIL balances.</td></tr>
<tr><td class="nm">Tracker</td><td>Everyone</td><td>Each student's progress through the syllabus.</td></tr>
<tr><td class="nm">Help</td><td>Everyone</td><td>Report a problem with the app.</td></tr>
<tr><td class="nm">Admin</td><td>Admins</td><td>People and their sign-ins (admin or member), the squadron's duty, day and wave templates, and clearing old data.</td></tr>
</tbody></table></div>
<div class="two">
${pic('02-board', 'The Scheduler Board', '<b>Scheduler Board.</b> One day at full size: each line has its callsign, mission, times, crew and remarks.')}
${pic('03-inputs', 'The Inputs calendar', '<b>Inputs.</b> Everyone files their own. An input closes that person for its hours from the moment it is filed.')}
${pic('04-quals', 'The Quals page', '<b>Quals.</b> One row a person, one column a qualification. A tick here is what the checks trust.')}
${pic('05-leavewar', 'The Leave War', '<b>Leave War.</b> The leave picture for the whole squadron, with the manning left on each day.')}
</div>`)}

${sec('flow', 3, 'From plan to published', '', `
<ol class="steps">
<li><b>People file inputs.</b> Leave, medical, duties and the rest. The person is closed for those hours at once.</li>
<li><b>The scheduler builds the day.</b> Add a wave, add its lines, type the times, drag people into seats. The crew list shows who is free.</li>
<li><b>The app checks as you go.</b> A problem shows as a letter on the person and a line in the day's list. Red is a warning, amber an advisory, grey a note.</li>
<li><b>Four names sign, then Publish.</b> CUR CK, SKED CK, PLANNED BY and APPROVED BY. The day goes out as the original (ORIG).</li>
<li><b>A change after that is an amendment.</b> It waits as "pending" until it is signed and published again as AL1, then AL2, and so on. Each day keeps its own count. Everyone can see who changed what.</li>
<li><b>Weekend and holiday work earns OIL.</b> Worked out from the published day: a full day or a half.</li>
</ol>
${pic('06-published', 'A published day', '<b>A published day.</b> Its heading says which version is out and who signed it. Changes made since wait as pending until the next amendment.', 'wide')}`)}

${sec('flags', 4, 'The flags', '', `
<div class="scroll"><table><thead><tr><th>Level</th><th>Meaning</th></tr></thead><tbody>
<tr><td>${pill('Warning')}</td><td>A rule is broken: a conflict, short crew rest, a seat the person may not hold.</td></tr>
<tr><td>${pill('Advisory')}</td><td>Worth a look: a missed brief, a tight turn, a pairing that needs approval.</td></tr>
<tr><td>${pill('Note')}</td><td>For information: a long day.</td></tr>
</tbody></table></div>
${pic('07-flags', 'Flags on a day', '<b>Flags.</b> The letter on a person says what is wrong. The day\'s list says it in words: who, what, the times and why. Tap a line and its people light up.', 'wide')}
<h3>The letters on a person, most serious first</h3>
<div class="scroll"><table><tbody>${chipsHTML}</tbody></table></div>
<p>A person with several problems shows the most serious one.</p>`)}

<div class="find noprint"><input type="search" id="find" placeholder="Search the numbers and checks: crew rest, AAR, standby…" aria-label="Search the numbers and the checks">
<span class="seg"><button type="button" class="on" data-level-pick="all">All</button><button type="button" data-level-pick="set">Numbers</button><button type="button" data-level-pick="hard">Warnings</button><button type="button" data-level-pick="adv">Advisories</button><button type="button" data-level-pick="note">Notes</button></span>
<span class="count" id="findcount"></span></div>

${sec('numbers', 5, 'The numbers', 'what each squadron can set', `
<p>Admins change these on the Logic page. The values are the F-15 squadron's today. A published day keeps the numbers it was published with until it is published again.</p>
${pic('08-logic', 'The Logic page', '<b>Logic.</b> The same list, in the app. Every number sits beside one line saying what moves with it.', 'phone')}
<div data-wrap>${tools('numbers', true)}
<div class="scroll"><table class="auto big"><thead><tr><th>Code</th><th>Setting</th><th>F-15 today</th><th>What it does</th><th class="noprint">Yours</th></tr></thead><tbody>${settingsHTML}</tbody></table></div></div>`)}

${sec('checks', 6, 'The checks', 'every one the app makes', `
<p>These are the app's own words. Where a line names a setting in brackets, it is one of the numbers in section 5.</p>
<div data-wrap>${tools('checks', true)}
${checksHTML}</div>`)}

${sec('standby', 7, 'Standby', 'how SC MAIN, SC SPARE, AVALON and BB are flagged', `
<p>A standby line is planned like a flying line, with a row for each crew, and each row is MAIN or SPARE. An SC MAIN is checked in full. SC SPARE, AVALON and BB are checked more lightly, because the crew is waiting, not flying. The moment a row flies, it is checked as a sortie.</p>
${pic('09-standby', 'A standby wave on the Scheduler Board', '<b>A standby wave.</b> Each row wears MAIN or SPARE. The times are the shift\'s START and END.', 'wide')}
<h3>While standing by</h3>
<div class="sawrap" data-wrap>${tools('standby', true)}
<div class="scroll">${saTable}</div>
${saCards}</div>
<h3>When a standby line flies</h3>
<div class="scroll"><table class="auto"><tbody>
<tr><td class="nm">How the app knows</td><td>Type the line's B or R and every row on it flies. Or tick FLIES on one row on the Scheduler Board and that row flies on its own.</td></tr>
<tr><td class="nm">What changes</td><td>A row that flies has its conflicts and turns checked as a sortie's are, carries crew rest, counts as a jet and a sortie, and earns OIL by default. The SPARE's local-leave allowance no longer applies.</td></tr>
<tr><td class="nm">Empty or cancelled rows</td><td>A row with nobody on it counts nothing. A row that does not come in is cancelled with CX.</td></tr>
<tr><td class="nm">No START or END</td><td>An advisory says its crew rest and OIL cannot be worked out (${codes['Standby line flies — no start or end']}).</td></tr>
</tbody></table></div>
<p>The app's own lines for these are ${codes['SC']} to ${codes['Arming an SC seat']}, with ${codes['SC currency — wrong shift']}, ${codes['Overlaps standby']} and ${codes['Standing SC SPARE']}.</p>`)}

${sec('training', 8, 'For training appointment holders', '', `
<div class="scroll"><table class="auto"><thead><tr><th>Where</th><th>What it gives you</th></tr></thead><tbody>
<tr><td class="nm">Tracker</td><td>Each student's syllabus as a flow chart of its events. His instructors mark each event on the chart as he completes it; flying it on the schedule does not mark it.</td></tr>
<tr><td class="nm">Quals</td><td>Each person's category and currencies, listed by seat (pilots, WSOs, ground crew). The pairing and currency checks read it.</td></tr>
<tr><td class="nm">Crew pairing checks</td><td>A student paired with someone he may not fly with, a pairing that needs approval, an OCU formation with no instructor (${codes['Crew not authorised']} to ${codes['OCU with no IP']}).</td></tr>
<tr><td class="nm">Test and currency checks</td><td>An IRT with no IR examiner (${codes['IRT with no IR examiner']}). Refuelling flown by a pilot not current, and who may instruct it (${codes['AAR currency — not qualified']}, ${codes['AAR — back seat not cleared to instruct']}).</td></tr>
<tr><td class="nm">Insights (a button on the schedule pages)</td><td>Each person's sorties and work hours for the week.</td></tr>
</tbody></table></div>
${pic('10-tracker', 'The Tracker', '<b>Tracker.</b> One chart a syllabus. Each ball is an event.', 'wide')}`)}

${sec('words', 9, 'Words that switch a rule on', '', `
<p>Most boxes are free text. A few words are read by the app.</p>
<div class="scroll"><table class="auto"><thead><tr><th>You type</th><th>Where</th><th>What happens</th></tr></thead><tbody>
<tr><td class="nm"><code>AAR</code> <code>DAAR</code> <code>NAAR</code></td><td>A line's remarks</td><td>Checks the front seat's refuelling currency. Plain AAR means night on a night wave, day otherwise. <code>NO AAR</code> cancels it.</td></tr>
<tr><td class="nm"><code>IRT</code></td><td>The mission, or one aircraft's remarks</td><td>Needs an IR examiner in that formation, or in that aircraft.</td></tr>
<tr><td class="nm"><code>LATE SHOW</code> <code>SHOW AT BRIEF</code></td><td>A line's remarks</td><td>Changes only how the crew-rest ring is drawn: dashed while the crew can still make step, solid after. The warning stays.</td></tr>
<tr><td class="nm"><code>1A:</code> <code>1B:</code></td><td>A line's remarks</td><td>Says which seat a refuelling remark (AAR) is about: A the front seat, B the back seat. Text with no tag counts as the front seat. No other rule reads it.</td></tr>
<tr><td class="nm"><code>0900 IN TIME</code></td><td>The in-time line above a wave</td><td>Sets the in-time for the whole wave. With a formation's name in it, for that formation only.</td></tr>
<tr><td class="nm"><code>EP</code></td><td>An OFT sim row's label</td><td>That sim gets a brief before it and a debrief after it.</td></tr>
<tr><td class="nm"><code>BRIEF</code> <code>DEBRIEF</code></td><td>An AMT sim row's label</td><td>That row is the block's brief, or its debrief.</td></tr>
<tr><td class="nm"><code>BRIEF 30</code></td><td>An OFT sim row's remarks</td><td>Sets that sim's brief to 30 minutes before it.</td></tr>
<tr><td class="nm">CX</td><td>A button on the line</td><td>Cancels the line and asks why. The line prints "CX DUE" and the reason.</td></tr>
</tbody></table></div>`)}

${sec('f15', 10, 'What is built around the F-15', '', `
<p>These are the places we expect another squadron to differ. Tell us where we are wrong.</p>
<div class="scroll"><table class="auto"><thead><tr><th>Today</th><th>For you?</th></tr></thead><tbody>
<tr><td><b>Two seats on every line.</b> A front seat and a back seat. People are pilots or WSOs, and the seat checks (${codes['Illegal seat']}, ${codes['Incentive passenger — crew pairing needs approval']}) follow from that.</td><td>A line with only its front seat filled is planned to work in full for single-seat jets. It is not built yet, and the rules a single-seat squadron needs are not written yet. Your answers decide them.</td></tr>
<tr><td><b>Crew pairing by category.</b> OCU and CAT A to D decide who may fly with whom, and when an instructor or approval is needed (${codes['Crew not authorised']} to ${codes['OCU with no IP']}).</td><td>What decides it for you?</td></tr>
<tr><td><b>Three kinds of standby:</b> SC, AVALON and BB, with MAIN and SPARE rows. An SC MAIN is checked in full; SC SPARE, AVALON and BB are checked more lightly, unless they fly (section 7).</td><td>Which do you hold, and what may a person on standby also do?</td></tr>
<tr><td><b>Qualification columns:</b> SANS, SXO, Management, Scheduler, SC DAY, SC NIGHT, DAAR, NAAR, NVG, IMC, TF. The warnings read SC DAY, SC NIGHT, DAAR and NAAR (${codes['AAR currency — not qualified']} to ${codes['SC currency — wrong shift']}). SANS decides who is checked against SANS availability (${codes['SANS availability — planned outside the availability filed']}), and Scheduler who may sign a day. The others are records only.</td><td>Which currencies should stop or flag a seat for you?</td></tr>
<tr><td><b>The numbers in section 5</b> are one squadron's.</td><td>Each squadron having its own schedule, its own numbers and its own public holidays in the one app is being built now.</td></tr>
</tbody></table></div>`)}

${sec('questions', 11, 'Questions for you', '', `
<p>Short answers are fine. Reply with the question number.</p>
<ol class="qs">${QUESTIONS}</ol>`)}

<footer>Pictures show invented demo people, not a real programme. Tables read from the app's Logic page, ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.</footer>
</div></main>

<div class="lb" id="lb" hidden><span class="hint">Tap the picture to enlarge it</span><button type="button" class="x" id="lbx">Close</button><img id="lbimg" alt=""></div>
<div class="sheet" id="sheet" hidden><div class="card" role="dialog" aria-modal="true" aria-labelledby="sheeth">
<h2 id="sheeth">My answers</h2>
<p>Everything you noted, as one text. Copy it and paste it into the group.</p>
<textarea id="sheettext" readonly aria-label="Your answers as text"></textarea>
<div class="row"><button type="button" class="btn pri" id="copy">Copy</button><button type="button" class="btn" id="clear">Clear all</button><button type="button" class="btn" id="sheetx">Close</button><span class="said" id="said" role="status"></span></div>
</div></div>`

/* the page as it is published (no outer tags: the publisher supplies them) and as a file that stands alone */
const head = `<title>TALON Guide</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap">
<script>document.documentElement.classList.add('js')</script>
<style>${css}</style>`
const page = head + content + `<script>${js}</script>`
const html = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}</head><body>${content}<script>${js}</script></body></html>`

const out = join(HERE, 'talon-guide.html')
writeFileSync(out, html)
if (PAGE) writeFileSync(PAGE, page)
console.log(`talon-guide.html written: ${Math.round(html.length / 1024)} KB, settings S1–S${sN}, checks C1–C${cN}, questions Q1–Q${qN}` + (missing.length ? `\nPICTURES MISSING: ${missing.join(', ')}` : ''))

if (PDF) {
  const { chromium } = await import('@playwright/test')
  const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const p = await browser.newPage({ viewport: { width: 1100, height: 1400 } })
  await p.goto(pathToFileURL(out).href)
  await p.pdf({ path: join(HERE, 'talon-guide.pdf'), format: 'A4', printBackground: true })
  await browser.close()
  /* the PDF was drawn with every "How it works" open; the page a person opens keeps them folded */
  writeFileSync(out, html.replace(/<details open>/g, '<details>'))
  if (PAGE) writeFileSync(PAGE, page.replace(/<details open>/g, '<details>'))
  console.log('talon-guide.pdf written')
}
