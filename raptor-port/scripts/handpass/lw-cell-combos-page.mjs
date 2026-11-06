// [LW-CELL-COMBOS] — the page put to him (D1625, D1237/D1363 shape): what he answers first, then the pictures (today beside
// each option, real grid cells of the built app), the measured counts, and a live check that measures the boxes on HIS
// phone in its own letters. Writes docs/mock/2026-11-06-lw-cell-combos/index.html (pictures inlined).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const IMG = path.resolve(here, '../../docs/img/handpass/2026-11-06-lw-cell-combos')
const OUTD = path.resolve(here, '../../docs/mock/2026-11-06-lw-cell-combos')
mkdirSync(OUTD, { recursive: true })
const uri = f => 'data:image/png;base64,' + readFileSync(path.join(IMG, 'draw', f)).toString('base64')
const shots = JSON.parse(readFileSync(path.join(IMG, 'draw', 'shots-phone.json'), 'utf8'))
const say = n => shots.cases.find(c => c.n === n).say
const nn = n => String(n).padStart(2, '0')

/* the counts: combinations whose letters do not all show whole, per family, today and under each option */
const fam = (file) => { const f = path.join(IMG, 'measure', file); if (!existsSync(f)) return null; return JSON.parse(readFileSync(f, 'utf8')).families }
const FAMS = [
  ['two whole, side by side', 'Two whole-day entries'],
  ['a whole beside a morning', 'A whole day and a morning'],
  ['a whole beside an afternoon', 'A whole day and an afternoon'],
  ['a morning over an afternoon', 'A morning and an afternoon'],
  ['one whole', 'One whole-day box'],
  ['one morning', 'One morning box'],
  ['one afternoon', 'One afternoon box'],
]
const cnt = (fs, key, z) => { if (!fs) return null; const f = fs.find(x => x.fam === key && (z == null || x.zoom === z)); return f ? [f.fail, f.n] : null }
const COLS = [
  ['measure-phone-system.json', 0.8, 'today'], ['measure-phone-system-C.json', 0.8, 'C'], ['measure-phone-system-A.json', 0.8, 'A'],
  ['measure-phone-wide.json', 0.8, 'today'], ['measure-phone-wide-C.json', 0.8, 'C'], ['measure-phone-wide-A.json', 0.8, 'A'],
  ['measure-desk-system.json', 1, 'today'], ['measure-desk-system-C.json', 1, 'C'], ['measure-desk-system-A.json', 1, 'A'],
]
const data = COLS.map(([f, z]) => fam(f) && fam(f).filter(x => x.zoom === z))
/* one compact table for a phone's width: per kind of day, the combinations whose letters fail — the iPhone size counted in
   whichever letters fail more (his PC's or the wider ones), then the desktop — today, A and B */
const worst = (a, b) => a == null ? b : b == null ? a : [Math.max(a[0], b[0]), a[1]]
const num = v => v == null ? '<td class="na">—</td>' : `<td class="${v[0] ? 'bad' : 'ok'}">${v[0].toLocaleString('en-GB')}</td>`
const ALLF = d => d ? d.reduce((a, c) => [a[0] + c.fail, a[1] + c.n], [0, 0]) : null
const phoneCols = [0, 1, 2].map(i => [data[i], data[i + 3]])
const deskCols = [6, 7, 8].map(i => data[i])
const totalN = data[0] ? ALLF(data[0])[1] : 0
const table = `<table class="cnt"><thead>
<tr><th rowspan="2">Day holds <small>(combinations)</small></th><th colspan="3">iPhone size</th><th colspan="3">Desktop</th></tr>
<tr>${['Today', 'C', 'A', 'Today', 'C', 'A'].map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>
${FAMS.map(([k, label]) => { const n = data[0] && cnt(data[0], k); return `<tr><th>${label} <small>(${n ? n[1].toLocaleString('en-GB') : '?'})</small></th>${phoneCols.map(([a, b]) => num(worst(a && cnt(a, k), b && cnt(b, k)))).join('')}${deskCols.map(d => num(d && cnt(d, k))).join('')}</tr>` }).join('\n')}
<tr class="tot"><th>All <small>(${totalN.toLocaleString('en-GB')})</small></th>${phoneCols.map(([a, b]) => num(worst(ALLF(a), ALLF(b)))).join('')}${deskCols.map(d => num(ALLF(d))).join('')}</tr></tbody></table>`

/* the picture rows: a case, then today / A / B at his iPhone's size, enlarged; the desktop beside */
const pic = (size, look, n, cls = '') => `<img class="cellimg ${size} ${cls}" src="${uri(`${size}-${look}-${nn(n)}.png`)}" alt="">`
const row = (n, looks) => `<div class="case"><div class="n">${n}</div><div class="say">${say(n)}</div>
  <div class="looks">${looks.map(([look, lab, rec]) => `<figure class="${rec ? 'rec' : ''}">${pic('phone', look, n)}<figcaption>${lab}</figcaption></figure>`).join('')}
  <figure class="desk">${looks.map(([look]) => pic('desk', look, n)).join('')}<figcaption>desktop: ${looks.map(l => l[1]).join(' · ')}</figcaption></figure></div></div>`
const L3 = [['today', 'Today'], ['C', 'C', 1], ['A', 'A (first drawing)']]
const L2q = [['today', 'Today'], ['C', 'C', 1], ['A', 'Flags (first drawing)']]
const L2 = [['today', 'Today'], ['C', 'Fixed', 1]]
const alt = fam('measure-phone-system-A-poflags.json')
const altFail = alt ? alt.filter(x => x.zoom === 0.8).reduce((a, f) => a + f.fail, 0) : null

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Leave War — two or more entries on one day</title>
<style>
:root { --bg:#0B0D10; --panel:#14181D; --panel-2:#1A1F26; --ink:#E8EDF2; --ink-2:#AEB8C4; --ink-3:#7D8894; --edge:#2A313A; --accent:#3BC6E8; --ok:#46C46C; --bad:#EE5252; --amber:#F2C879;
  --k-ll:242,200,110; --k-ll-ink:#FFF1CF; --k-ll-fill:.22; --k-ol:226,146,38; --k-ol-ink:#FFE7C7; --k-ol-fill:.48; --k-oil:70,196,108; --k-oil-ink:#DDF8E6; --k-oil-fill:.38;
  --k-oilt:170,230,40; --k-oilt-ink:#F1FFD0; --k-oilt-fill:.30; --k-care:138,150,255; --k-care-ink:#DCE0FF; --k-care-fill:.32; --k-cse:160,100,240; --k-cse-ink:#EBDDFF; --k-cse-fill:.36;
  --k-od:128,142,160; --k-od-ink:#F2F5F8; --k-od-fill:.58; --k-med:238,82,82; --k-med-ink:#FFD6D6; --k-med-fill:.30; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif; }
main { max-width: 860px; margin: 0 auto; padding: 18px 14px 60px; }
h1 { font-size: 20px; margin: 0 0 4px; } h2 { font-size: 17px; margin: 30px 0 8px; } .sub { color: var(--ink-3); font-size: 13px; margin: 0 0 16px; }
.ask { background: var(--panel); border: 1px solid var(--edge); border-radius: 10px; padding: 12px 14px; }
.ask h2 { margin-top: 0; } .ask ol { margin: 0; padding-left: 20px; } .ask li { margin: 0 0 9px; } .ask b { color: #fff; } .rec-tag { color: var(--accent); font-weight: 700; }
p { margin: 6px 0; color: var(--ink-2); } a { color: var(--accent); }
.case { display: grid; grid-template-columns: 26px 1fr; gap: 2px 8px; padding: 10px 0; border-bottom: 1px solid var(--edge); }
.case .n { font-weight: 800; color: var(--accent); font-size: 16px; } .case .say { color: var(--ink); font-size: 14px; }
.looks { grid-column: 2; display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: flex-start; margin-top: 4px; }
figure { margin: 0; text-align: center; } figcaption { font-size: 12px; color: var(--ink-3); margin-top: 2px; }
figure.rec figcaption { color: var(--accent); font-weight: 700; }
figure.rec img { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 3px; }
.cellimg.phone { width: 69px; height: auto; display: block; image-rendering: auto; }
figure.desk { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; } figure.desk figcaption { width: 100%; text-align: left; }
.cellimg.desk { width: 40px; height: auto; }
.strip { width: 100%; height: auto; border-radius: 4px; margin: 4px 0 2px; }
table.cnt { border-collapse: collapse; font-size: 12.5px; width: 100%; margin: 6px 0; } .cnt th, .cnt td { border: 1px solid var(--edge); padding: 4px 5px; text-align: right; }
.cnt th { color: var(--ink-2); font-weight: 600; text-align: center; } .cnt tbody th { text-align: left; } .cnt td small { color: var(--ink-3); font-size: 10.5px; }
.cnt td.bad { color: #FF9D9D; } .cnt td.ok { color: #8BE3A4; } .cnt tr.tot th, .cnt tr.tot td { font-weight: 800; } .tablewrap { overflow-x: auto; }
.note { font-size: 13px; color: var(--ink-3); }
/* the live check: the grid's own box rules (matrix.css, look F), at the grid's own sizes */
#live { background: var(--panel); border: 1px solid var(--edge); border-radius: 10px; padding: 12px 14px; }
#live button { font: inherit; font-weight: 700; background: var(--accent); color: #052A34; border: 0; border-radius: 6px; padding: 8px 14px; min-height: 44px; font-weight: 700; font-size: 14px; }
#liveOut { margin-top: 10px; font-size: 13px; } #liveOut .lrow { margin: 4px 0; } #liveOut .cut { color: #FF9D9D; } #liveOut .fit { color: #8BE3A4; }
.lab { position: absolute; left: -9999px; top: 0; }
.lab .z { zoom: .8; display: flex; flex-wrap: wrap; gap: 4px; font-family: "Inter Tight", system-ui, sans-serif; }
.lab .cellx { position: relative; width: 26px; height: 22px; background: var(--panel-2); }
.lab .c { position: absolute; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: .02em; line-height: 1; white-space: nowrap; background: rgba(var(--h), var(--fill)); color: var(--ink); box-shadow: inset 0 0 0 1px rgba(var(--h), .85); }
.lab .c.whole { inset: 2px; } .lab .c.whole.wide { font-size: 8.5px; letter-spacing: -.01em; } .lab .c.wide.w4 { font-size: 7.5px; letter-spacing: -.04em; }
.lab .c.top { left: 2px; right: 2px; top: 2px; bottom: calc(50% + .5px); } .lab .c.bot { left: 2px; right: 2px; top: calc(50% + .5px); bottom: 2px; }
.lab .c.left { top: 2px; bottom: 2px; left: 2px; right: calc(50% + .5px); } .lab .c.right-am { top: 2px; bottom: calc(50% + .5px); left: calc(50% + .5px); right: 2px; }
.lab .c:is(.top, .bot, .left) { font-size: 7.5px; letter-spacing: 0; } .lab .c.right-am { font-size: 6.5px; letter-spacing: 0; } .lab .c.wide:not(.whole) { font-size: 6.5px; letter-spacing: -.02em; }
.lab .c { --h: 242,200,110; --fill: .22; }
</style></head><body><main>
<h1>Leave War — two or more entries on one day</h1>
<p class="sub">6 Nov 26 · every combination measured on the built app · nothing is built yet</p>

<section class="ask">
<h2>What I need from you</h2>
<p class="note">Redrawn after a design review and your question "so whole day, AM and PM will always be top and bottom half?". My first drawing (A) did make every two-entry day look like a morning and an afternoon, and its corner flags made the "!" too quiet and the same colour as the leave. C fixes both.</p>
<ol>
<li><b>Two entries on one day</b> (pictures 1–6). <span class="rec-tag">Recommended: C</span> — a whole day always reads as a whole day. Beside a half, the whole day keeps the whole cell and the half sits on it (5, 6). Two whole days are one box split in two, the halves touching (1–4). A morning and an afternoon stay two separate boxes with a gap, as today (15). Both codes stay whole. It changes your D1167 (side by side), so it needs your word.</li>
<li><b>Marks on a day</b> (pictures 7–12). <span class="rec-tag">Recommended: C</span> — "!" keeps its amber tab, with a dark outline so it stands out on an amber leave (8, 12). More than two entries show as a small stack of cards behind the box, in place of "+2" (7). On a posted-out day the box itself carries the posting stripes, in place of the grey PO (9). His last day in is a yellow line down the day's right edge, in place of the yellow PO, on every last day, empty or not (10, 11). Letters stay whole; where a mark takes room, they drop one size. It changes the PO tags (your 19 Aug 26 last-day tag, D1720's grey tag) and the "+n", so it needs your word.</li>
<li><b>Zoomed right out</b> (the last strips). <span class="rec-tag">Recommended:</span> the boxes show their colours only, and the "!" stays.</li>
</ol>
<p class="note">Also fixed, without a question: ATCH, PERS, APPT, OML and the app's own FO* / HO* drop one letter size where they were a hair too wide, and letters sit clear of the Inputs page's cyan edge (13–14).</p>
<p class="note">Answer by number, for example "1 C, 2 C, 3 yes". After you pick, I build it, measure all 23,940 combinations again, and walk the grid on both sizes — the look, what a tap opens and how each entry is changed from there (D1725).</p>
</section>

<h2>1 · Two entries on one day</h2>
<p>Each picture is one real day cell of the built grid at your iPhone's size (402 wide, the grid's opening zoom), enlarged. The desktop's are beside.</p>
${[1, 2, 3, 4, 5, 6].map(n => row(n, L3)).join('\n')}

<h2>2 · Marks on a day</h2>
${[7, 8, 9, 10, 11, 12].map(n => row(n, L2q)).join('\n')}

<h2>3 · Zoomed right out (your iPhone, the smallest zoom)</h2>
<p>Today:</p><img class="strip" src="${uri('phone-today-far-strip.png')}" alt="">
<p>Recommended — colours only, the "!" kept:</p><img class="strip" src="${uri('phone-C-far-strip.png')}" alt="">

<h2>Also fixed — long codes alone</h2>
${[13, 14, 15].map(n => row(n, L2)).join('\n')}

<h2>The count</h2>
<p>How many combinations still have letters cut by the box's edge or under a corner tag — every code, every place in the cell, every corner tag, approved, pending and refused. The iPhone size counts whichever fails more: your PC's letters or letters wider than your iPhone's.</p>
<div class="tablewrap">${table}</div>
<p class="note">C and A here are whole designs (question 1 and question 2 together). In letters far wider than a desktop draws, a few long codes on a crowded last day are still a hair over in C; the build steps those down too.</p>

<h2>Check it on your phone</h2>
<section id="live">
<p>This measures the boxes here, on your phone, in its own letters — today's side-by-side and C's one-above-the-other.</p>
<button type="button" id="go">Measure on this phone</button>
<div id="liveOut"></div>
</section>
<div class="lab" aria-hidden="true"><div class="z" id="labz"></div><div id="clamp"></div></div>
</main>
<script>
(function () {
  var CODES = ['LL','OL','OIL','CCL','FCL','PL','CL','EL','FO','HO','FO*','B','C','OML','HL','CSE','OD','OTH','ATCH','TRG','MTG','PERS','APPT','DTY','EVT'];
  var wide = function (t) { var n = t.replace('*', '').length; return n > 3 ? ' wide w4' : n > 2 ? ' wide' : '' };
  function fits(place) {
    var z = document.getElementById('labz'); z.innerHTML = '';
    var cut = [], ok = [];
    CODES.forEach(function (t) {
      var cell = document.createElement('div'); cell.className = 'cellx';
      var b = document.createElement('span'); b.className = 'c ' + place + wide(t); b.textContent = t; cell.appendChild(b); z.appendChild(cell);
      var r = b.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(b); var tr = rg.getBoundingClientRect();
      var room = r.width - 2 * 0.8;
      (tr.width - 0.6 > room ? cut : ok).push(t);
    });
    return { cut: cut, ok: ok };
  }
  document.getElementById('go').addEventListener('click', function () {
    var out = document.getElementById('liveOut'), lines = [];
    var A = [['left', 'Today — side by side (whole day, half width)'], ['right-am', 'Today — a half beside a whole day'], ['top', 'C and A — one above the other'], ['whole', 'One whole-day box']];
    A.forEach(function (p) { var r = fits(p[0]);
      lines.push('<div class="lrow"><b>' + p[1] + '</b>: ' + (r.cut.length ? '<span class="cut">cut — ' + r.cut.join(' ') + '</span>' : '<span class="fit">every code fits</span>') + '</div>'); });
    var c = document.getElementById('clamp'); c.innerHTML = '<div style="zoom:.4;font-size:10px;font-weight:700;display:inline-block" id="c1">LLLLLLLLLL</div><br><div style="font-size:10px;font-weight:700;display:inline-block" id="c2">LLLLLLLLLL</div>';
    var w1 = document.getElementById('c1').getBoundingClientRect().width, w2 = document.getElementById('c2').getBoundingClientRect().width;
    lines.push('<div class="lrow"><b>Zoomed right out</b>: ' + (w1 / w2 > 0.6 ? 'this phone keeps letters at its smallest size (they grow past their boxes)' : 'this phone shrinks the letters with the grid') + '</div>');
    lines.push('<div class="lrow note">Screenshot this and send it to me.</div>');
    out.innerHTML = lines.join('');
  });
})();
</script>
</body></html>`
writeFileSync(path.join(OUTD, 'index.html'), html)
console.log('written', path.join(OUTD, 'index.html'), (html.length / 1024).toFixed(0) + ' KB')
