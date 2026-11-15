// Builds page.html (the page for his look) from manifest.json, so the words under each pair are the rows drawn.
// usage: node gen-page.mjs <the warn-words folder>
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
const dir = process.argv[2]
const man = JSON.parse(readFileSync(dir + '/manifest.json', 'utf8'))
const pics = Object.fromEntries(man.pictures.map((p) => [p.file, p]))
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const png = (f) => { const b = readFileSync(dir + '/' + f); return [b.readUInt32BE(16), b.readUInt32BE(20)] }
const missing = []
const fig = (file, label, kind, cssW) => {
  if (!existsSync(dir + '/' + file)) { missing.push(file); return '' }
  const [w, h] = png(file)
  return `<figure class="shot"><figcaption><span class="chip ${label === 'Today' ? 'c-today' : 'c-new'}">${label}</span> <span class="kind">${kind}</span></figcaption>`
    + `<a class="zoom" href="${file}"><img src="${file}" width="${w}" height="${h}" style="max-width:min(100%, ${cssW}px)" alt="${esc(label)} — ${esc(kind)}" loading="lazy"></a></figure>`
}
const pairFigs = (base, kindT, kindP, dev = 'phone') => {
  const cssW = dev === 'phone' ? 402 : 760
  return `<div class="pair ${dev}">${fig(`${base}-today-${dev}.png`, 'Today', kindT, cssW)}${fig(`${base}-proposed-${dev}.png`, 'Proposed', kindP, cssW)}</div>`
}
const rowsOf = (file) => { const p = pics[file]; if (!p) { missing.push('manifest:' + file); return { rows: [], sev: [] } } return p }
// the words of a pair, today beside proposed; `skipT` = indexes of proposed rows that have no line today
const words = (base, skipT = []) => {
  const T = rowsOf(`${base}-today-phone.png`), P = rowsOf(`${base}-proposed-phone.png`)
  let ti = 0, out = ''
  P.rows.forEach((p, i) => {
    const sev = (P.sev && P.sev[i]) || 'adv'
    const t = skipT.includes(i) ? null : T.rows[ti++]
    const same = t === p
    out += `<li class="w ${sev}">` + (t === null ? `<p class="t"><span class="k">Today</span> <i>no such line today</i></p>` : same ? '' : `<p class="t"><span class="k">Today</span> ${esc(t)}</p>`)
      + `<p class="p"><span class="k">${same ? 'Unchanged' : 'Proposed'}</span> ${esc(p)}</p></li>`
  })
  return `<details class="words" open><summary>The words, row by row</summary><ol>${out}</ol></details>`
}
const fam = (id, title, note, parts, opts = {}) => {
  let h = `<section id="${id}"><h2>${title}</h2><p class="note">${note}</p>`
  for (const b of parts) {
    h += pairFigs(b, 'drawn on the real list', 'drawn on the real list') + words(b, (opts.skipT || {})[b] || [])
    if ((opts.desktop || []).includes(b)) h += `<details class="desk"><summary>The same rows on a desktop</summary>${pairFigs(b, 'drawn', 'drawn', 'desktop')}</details>`
  }
  return h + '</section>'
}
const q = (n, href, ask, rec, why) => `<li><a href="#${href}"><b>${ask}</b></a><span class="rec">Recommended: ${rec}</span><span class="why">${why}</span></li>`

const css = `
:root{color-scheme:dark;--bg:#0b0e13;--panel:#141a22;--panel2:#1a212b;--line:#2a323e;--text:#e9edf3;--muted:#98a3b3;--accent:#3cc6ea;
--red:#f0707c;--red-bg:#2a161a;--amber:#ecc063;--amber-bg:#231e14;--grey:#aab3c0;--grey-bg:#1a1f27;--good:#7ad6a0}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-text-size-adjust:100%}
.wrap{max-width:1040px;margin:0 auto;padding-block:28px 64px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
h1{font-size:clamp(26px,5vw,36px);line-height:1.15;margin:6px 0 10px;text-wrap:balance}
h2{font-size:22px;line-height:1.25;margin:0 0 8px;text-wrap:balance}
h3{font-size:16px;margin:22px 0 6px;color:var(--muted);font-weight:600}
p{margin:0 0 12px;max-width:68ch}
a{color:var(--accent)}
.eyebrow{color:var(--amber);font-weight:600;font-size:14px;margin:0}
.lead{font-size:18px;color:var(--text)}
section{margin-top:44px;padding-top:28px;border-top:1px solid var(--line);scroll-margin-top:12px}
.note{color:var(--muted)}
.first{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px 18px 8px;margin-top:22px}
.first h2{margin-bottom:4px}
ol.qs{margin:12px 0 0;padding-left:22px}
ol.qs li{margin:0 0 16px;padding-left:4px}
ol.qs a{display:block;text-decoration-thickness:1px;text-underline-offset:3px}
.rec{display:block;color:var(--good);margin-top:4px}
.why{display:block;color:var(--muted);margin-top:2px}
ul.plain{margin:0 0 12px;padding-left:20px;max-width:68ch}
ul.plain li{margin-bottom:6px}
code,.ex{font:inherit;background:var(--panel2);border:1px solid var(--line);border-radius:6px;padding:1px 6px;overflow-wrap:anywhere}
.pair{display:grid;gap:16px;margin:16px 0 10px;grid-template-columns:1fr}
@media (min-width:860px){.pair.phone{grid-template-columns:1fr 1fr;align-items:start}}
.shot{margin:0;min-width:0}
.shot figcaption{margin-bottom:8px;font-size:14px;color:var(--muted)}
.chip{display:inline-block;font-weight:700;font-size:13px;border-radius:999px;padding:2px 10px;margin-right:4px}
.c-today{background:var(--panel2);color:var(--text);border:1px solid var(--line)}
.c-new{background:var(--accent);color:#06222b}
.zoom{display:block;line-height:0}
.shot img{height:auto;display:block;border:1px solid var(--line);border-radius:10px;background:#000}
details{margin:8px 0 18px}
summary{cursor:pointer;color:var(--accent);font-weight:600;padding:6px 0}
.words ol{list-style:none;margin:6px 0 0;padding:0}
.w{border-left:4px solid var(--amber);background:var(--amber-bg);border-radius:8px;padding:10px 12px;margin:0 0 8px}
.w.hard{border-left-color:var(--red);background:var(--red-bg)}
.w.note{border-left-color:var(--grey);background:var(--grey-bg)}
.w p{margin:0;max-width:none;overflow-wrap:anywhere}
.w .t{color:var(--muted);margin-bottom:6px}
.k{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.02em;color:var(--muted);border:1px solid var(--line);border-radius:6px;padding:0 6px;margin-right:6px}
.w .p .k{color:var(--accent);border-color:var(--accent)}
.tbl{display:block;overflow-x:auto;max-width:100%}
table{border-collapse:collapse;width:100%;min-width:520px}
th,td{text-align:left;vertical-align:top;padding:8px 10px;border-bottom:1px solid var(--line)}
th{color:var(--muted);font-weight:600;font-size:14px}
td.old{color:var(--muted)}
.box{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin:12px 0}
.box p:last-child{margin-bottom:0}
#zoomer{position:fixed;inset:0;background:rgba(0,0,0,.92);overflow:auto;z-index:10;padding:12px;cursor:zoom-out}
#zoomer[hidden]{display:none}
#zoomer img{display:block;margin:0 auto;max-width:none;border-radius:8px}
#zoomer .hint{position:sticky;top:0;color:var(--muted);font-size:14px;text-align:center;padding:4px 0 10px}
`

const A = rowsOf('a2-after-phone.png')
const html = `<title>Warning Words</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>${css}</style>
<div class="wrap">
<header>
<p class="eyebrow">For your look · 15 Nov 26 · nothing is built yet</p>
<h1>The warnings' new words, before and after</h1>
<p class="lead">Every warning reworded so it reads on its own: a short label, the items with their times, and "assumed" wherever the app fills a time in. Your double-turn line is untouched.</p>
<p class="note">Tap any picture to see it full size. The words are also written out under each pair, so you need not zoom.</p>
</header>

<div class="first" id="look">
<h2>Look at this first: four questions</h2>
<p class="note">Each has my recommendation. Tap a question to jump to its pictures. Answer "as recommended" or by number.</p>
<ol class="qs">
${q(1, 'friday', 'A flight in a clash: T/O only, or T/O and landing?', 'both, as in "Clash: RU (T/O 13:00, landing 14:00) &amp; BRIEFING 12:40–13:00".', 'The line you liked showed T/O only. With the landing, a clash at the landing end of a flight reads on its own too. It adds about three words, on clash lines only.')}
${q(2, 'turns', '"Tight turning" renamed "Tight crew rest"?', 'yes.', 'It is the amber line about tomorrow\'s crew rest being short at the usual report time. Today its name reads like the same-day "Tight turn".')}
${q(3, 'names', 'Should the short names of the checks follow the new labels?', 'yes, in the same build.', 'The app has a short name for each kind of warning, shown where warnings are counted by kind. Today a clash is called "Conflict — two events at once" there. One thing, one name.')}
${q(4, 'turns', 'The crew-rest line keeps your order of 22 Aug, with "needs 12h" added?', 'yes.', 'Yesterday\'s end, then when rest clears, then what breaks it, then the shortfall. Only the wording is shorter and the 12h is said.')}
</ol>
</div>

<section id="shape">
<h2>How every line is built</h2>
<ul class="plain">
<li><b>A short label, then a colon:</b> <span class="ex">Clash:</span> <span class="ex">Tight turn:</span> <span class="ex">Misses RU brief</span> <span class="ex">Crew rest:</span></li>
<li><b>Each item with its own times:</b> a flight as <span class="ex">VL BFM (T/O 12:00)</span>, anything else as <span class="ex">BRIEFING 12:40–13:00</span>.</li>
<li><b>"Assumed" for every time the app fills in:</b> <span class="ex">landing assumed 13:00</span>, <span class="ex">2h debrief (assumed)</span>.</li>
<li><b>The limit is said in the line:</b> <span class="ex">needs 120</span>, <span class="ex">needs 12h</span>, <span class="ex">limit 7</span>.</li>
<li><b>The man's name is not repeated:</b> the list already starts each line with his callsign.</li>
</ul>
</section>

<section id="friday">
<h2>Ranger's Friday</h2>
<p class="note">VL BFM takes off 12:00 with no landing typed · BRIEFING 12:40–13:00 · RU takes off 13:00. "After" is the list once the new words and the assumed one-hour landing are both built.</p>
<div class="pair phone">${fig('a1-today-phone.png', 'Today', 'the real app, as it stands', 402)}${fig('a2-after-phone.png', 'Proposed', 'drawn on the real list', 402)}</div>
<div class="tbl"><table>
<tr><th>Today</th><th>After</th></tr>
<tr><td class="old"><i>Not raised today: a blank landing counts as the take-off.</i></td><td>${esc(A.rows[0] || '')}</td></tr>
<tr><td class="old">Ranger — RU &amp; BRIEFING clash</td><td>${esc(A.rows[1] || '')}</td></tr>
<tr><td class="old">Ranger — Tight turn VL BFM→ RU: 60 min take-off→next T/O, no landing typed (needs 120 min — threshold 120, dekit+step 30+60)</td><td>${esc(A.rows[2] || '')}</td></tr>
<tr><td class="old">Ranger — Not enough time to attend the VL BFM debrief — BRIEFING sits inside 12:00–14:00 (take-off + 2h, no landing typed)</td><td><i>Goes away. With the landing assumed at 13:00 the debrief is 13:00–15:00, and the BRIEFING ends at 13:00.</i></td></tr>
<tr><td class="old">Ranger — No time for the RU flight brief — BRIEFING sits inside 10:40–13:00 (brief 10:40)</td><td>${esc(A.rows[3] || '')}</td></tr>
<tr><td class="old">Ranger — 1 person is double turning: Ranger</td><td>${esc(A.rows[4] || '')} <i>(unchanged)</i></td></tr>
</table></div>
<p class="note">I checked the rows by typing a 13:00 landing on VL BFM in the real app: it raised exactly these five, in this order, with today's words.</p>
<div class="box">
<p><b>Where these differ from the five lines you liked:</b></p>
<ul class="plain">
<li><b>The clash lines</b> add the landing after the T/O (question 1).</li>
<li><b>The tight turn</b> ends with ", RU T/O 13:00", so both times of the turn are in the line. "0 min" explains itself; "45 min" would not.</li>
<li><b>"Misses VL BFM debrief … : RU T/O 13:00" cannot happen.</b> The app never raises a missed debrief against another flight (that is the tight turn's job), and on this day the line goes away. Where one is raised, it names what is in the way: <span class="ex">Misses VL BFM debrief 13:00–15:00 (landing assumed): MEETING 13:30–14:00</span>.</li>
</ul>
</div>
<details class="desk"><summary>The same list on a desktop</summary><div class="pair desktop">${fig('a1-today-desktop.png', 'Today', 'the real app', 791)}${fig('a2-after-desktop.png', 'Proposed', 'drawn on the real list', 791)}</div></details>
</section>

${fam('clashes', 'Clashes (red)', 'Every clash starts "Clash:" and gives both items with their times. Today most give neither.', ['b1-clashes'])}
${fam('standby', 'On standby and also on something else (amber)', 'The label says what is wrong: the item overlaps a standby shift, or sits between his in-time and the shift\'s start.', ['b2-standby'])}
${fam('leave', 'On leave, downchit, away (red)', 'The labels are the names you gave these checks: "Downchit + planned", "On leave + planned". What he is planned on now carries its times.', ['b3-leave'])}
${fam('brief', 'Brief and debrief (amber)', '"Misses", whose brief or debrief, its window, then what is in the way. New: each thing in the way carries its own times (today only its name).', ['b4-brief'])}
${fam('turns', 'Turns and rest', 'The crew-rest line keeps your order (question 4). "Tight turning" becomes "Tight crew rest" (question 2). In the first picture\'s fourth row the figures differ on purpose: today a flight with no landing is counted as landing at its take-off; after, its landing is assumed one hour later, so the rest is an hour shorter. That is the change built after you approve the words.', ['b5-turns1', 'b5-turns2'], { desktop: ['b5-turns1', 'b5-turns2'], skipT: { 'b5-turns2': [5] } })}
${fam('crew', 'Who may fly with whom, and in which seat', 'The seat is called "front seat" everywhere. One short reason is added where the line gave none: "An OCU needs an instructor in the other seat."', ['b6-crew1', 'b6-crew2', 'b6-crew3'])}
${fam('oil', 'A line\'s own times, and OIL', 'These already read on their own, so most are left whole. Only the dash that joined two thoughts goes, and "one of the two is wrong" is cut because "Times look wrong" already says it.', ['b7-oil1', 'b7-oil2'])}

<section id="names">
<h2>The short names of the checks (question 3)</h2>
<p class="note">Where the app counts warnings by kind, each kind has a short name. If you say yes, these follow the new labels.</p>
<div class="pair phone">${fig('e-names-today-phone.png', 'Today', 'the real app', 402)}${fig('e-names-proposed-phone.png', 'Proposed', 'drawn on the real list', 402)}</div>
<div class="tbl"><table>
<tr><th>Today's name</th><th>Proposed name</th></tr>
${[['Conflict — two events at once', 'Clash'], ['Personal input clash', 'Clash with a request'], ['No time for the flight brief', 'Misses flight brief'], ['No time for the flight debrief', 'Misses flight debrief'], ['No time for the sim brief', 'Misses sim brief'], ['No time for the sim debrief', 'Misses sim debrief'], ['Tight turning — crew rest', 'Tight crew rest'], ['Long work day', 'Long day'], ['No break day — too many days in a row', 'Days in a row'], ['Qualification — illegal seat', 'Wrong seat'], ['Illegal aircrew combination', 'Crew not authorised'], ['Crew combination — CO approval required', 'CO approval needed'], ['OCU without IP', 'OCU with no IP'], ['IRT without an IR examiner', 'IRT with no IR examiner'], ['On shift — also down for a ground event', 'Overlaps standby'], ['In-time window cut — busy between report and shift start', 'Busy before a standby shift']].map(([a, b]) => `<tr><td class="old">${esc(a)}</td><td>${esc(b)}</td></tr>`).join('\n')}
</table></div>
<p class="note">Names not listed stay as they are: "Downchit + planned", "On leave + planned", "Tight turn", "Double turning" and the rest.</p>
</section>

<section id="logic">
<h2>The Logic page's note under the changed-settings strip</h2>
<p class="note">Same meaning, plainer order: first that a published day does not change until you publish it again, then when it shows as pending.</p>
<div class="pair phone">${fig('c-logic-today-phone.png', 'Today', 'the real app', 402)}${fig('c-logic-proposed-phone.png', 'Proposed', 'drawn on the real page', 402)}</div>
<ol class="words" style="list-style:none;padding:0;margin:0">
<li class="w"><p class="t"><span class="k">Today</span> <b>2 settings changed from the squadron standard.</b> The schedule is checked against them now. A published day keeps the settings it was published under, and the OIL they gave it, until it is published again. If a change to Default rally, Debrief after landing or Full day of OIL would change that OIL, the day reads pending.</p>
<p class="p"><span class="k">Proposed</span> <b>2 settings changed from the squadron standard.</b> They are in use now. A published day does not change until you publish it again: it keeps its old settings and its OIL. If the new Default rally, Debrief after landing or Full day of OIL would change a published day's OIL, that day shows as pending.</p></li>
</ol>
<p class="note">The two sentences that follow it where they apply are left whole: "A changed late cut-off moves the LATE marks at once, on published days too." and "Only an admin can change them."</p>
<details class="desk"><summary>The same strip on a desktop</summary><div class="pair desktop">${fig('c-logic-today-desktop.png', 'Today', 'the real app', 1000)}${fig('c-logic-proposed-desktop.png', 'Proposed', 'drawn', 1000)}</div></details>
</section>

<section id="pending">
<h2>The pending list's new line</h2>
<p class="note">Your ruling of today: where a Logic change makes a published day pending through its OIL, the list says whether the OIL itself changed. Here Default rally went from 3h to 2h50 on a published Saturday. The list already shows the two worked times; the new line says the answer in words, inside the man's own row.</p>
<div class="pair phone">${fig('d-pending-today-phone.png', 'Today', 'the real app', 378)}${fig('d-pending-proposed-phone.png', 'Proposed', 'one line drawn into the real list', 378)}</div>
<ol class="words" style="list-style:none;padding:0;margin:0">
<li class="w note"><p class="t"><span class="k">Today</span> Ranger · OIL as published, under today's values: full day · 05:00–18:00 → full day · 05:10–18:00</p>
<p class="p"><span class="k">Proposed</span> the same row, with one line added under it: <b>Still a full day of OIL. It counts from 05:10, not 05:00.</b></p></li>
<li class="w note"><p class="p"><span class="k">Where the OIL does change</span> <b>OIL changes: full day → half day. It counts from 13:30, not 10:00.</b> <i>(Words only: not drawn, because the demo week has no such day.)</i></p></li>
</ol>
<details class="desk"><summary>The same list on a desktop</summary><div class="pair desktop">${fig('d-pending-today-desktop.png', 'Today', 'the real app', 380)}${fig('d-pending-proposed-desktop.png', 'Proposed', 'drawn', 380)}</div></details>
</section>

<section id="real">
<h2>Which pictures are real, and which are drawn</h2>
<ul class="plain">
<li><b>Real, as the app stands:</b> Ranger's Friday "Today", the Logic strip "Today", the pending list "Today", the short names "Today".</li>
<li><b>Drawn on the real app:</b> every "Proposed" picture. The real list was opened and only the words were changed, so the size, colours and wrapping are the app's own.</li>
<li><b>The family pictures, both sides:</b> example rows set onto Monday's real warning list, because no one demo day raises every kind of warning. The "Today" words there are the app's real sentences with example names and times.</li>
<li><b>A fresh reader</b> who had never seen the old wording read every proposed line on its own. Where the reader stumbled, the line was reworded before these pictures were made.</li>
</ul>
</section>

<section id="next">
<h2>What happens after you approve the words</h2>
<ul class="plain">
<li>The words are built exactly as approved, with tests.</li>
<li>Then the three changes you held until now: the assumed one-hour landing (a setting on the Logic page), a flight with no landing counting in Insights and the long day, and a standby shift with no END left out of crew rest.</li>
<li>Then the full check, because OIL is touched: the app walked on screen, and two independent readers of the code.</li>
<li>Nothing goes live without your "merge live".</li>
</ul>
</section>
</div>
<div id="zoomer" hidden><p class="hint">Tap anywhere to close</p><img alt=""></div>
<script>
(function(){
  var z=document.getElementById('zoomer'),zi=z.querySelector('img');
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a.zoom');
    if(a){e.preventDefault();var im=a.querySelector('img');zi.src=a.getAttribute('href');zi.style.width=Math.max(im.naturalWidth/2,Math.min(im.naturalWidth,window.innerWidth*1.6))+'px';z.hidden=false;z.scrollTop=0;return}
    if(!z.hidden&&e.target.closest('#zoomer')){z.hidden=true;zi.removeAttribute('src')}
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){z.hidden=true}});
})();
</script>
`
writeFileSync(dir + '/page.html', html)
console.log('page.html', Math.round(html.length / 1024) + 'k', missing.length ? 'MISSING: ' + missing.join(', ') : 'all pictures found')
