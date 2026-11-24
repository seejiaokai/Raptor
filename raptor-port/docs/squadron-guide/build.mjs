/* Builds the guide for another squadron's schedulers: one self-contained HTML page (pictures inside it) and a PDF of it.
   The tables of settings and checks are NOT typed here — they are read from logic.json, the Logic page's own words and
   standard values as the app prints them, so the guide cannot say something the app does not.
   Run from raptor-port/:  node docs/squadron-guide/build.mjs        (the HTML)
                           node docs/squadron-guide/build.mjs --pdf  (the HTML, then the PDF, by the project's browser) */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const L = JSON.parse(readFileSync(join(HERE, 'logic.json'), 'utf8'))
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const PDF = process.argv.includes('--pdf')

/* a picture, inside the page as data so the one file travels by itself; a picture not taken yet is left out, loudly */
const missing = []
const pic = (name, alt, cap, cls = '') => {
  const f = join(HERE, 'pictures', name + '.jpg')
  if (!existsSync(f)) { missing.push(name); return '' }
  return `<figure class="${cls}"><img alt="${esc(alt)}" src="data:image/jpeg;base64,${readFileSync(f).toString('base64')}"><figcaption>${cap}</figcaption></figure>`
}

const TIER = { Warning: 'red', Advisory: 'amber', Note: 'grey' }
const pill = t => `<span class="pill ${TIER[t]}">${t}</span>`

/* the settings, coded S1… so a reader can answer "S6: ours is 45 min" */
let sN = 0
const sCodes = {}
const settingsHTML = L.settings.map(g => `<tr class="grp"><th colspan="4">${esc(g.g)}</th></tr>` + g.items.map(s => {
  const v = s.kind === 'kinds'
    ? L.kinds.map(k => `${esc(k.label)}: <b>${k.hard ? 'red' : 'amber'}</b>`).join('<br>')
    : `<b>${esc(s.value)}</b>`
  return `<tr><td class="code">${sCodes[s.name] = 'S' + (++sN)}</td><td class="nm">${esc(s.name)}</td><td class="val">${v}</td><td>${esc(s.line)}</td></tr>`
}).join('')).join('')

/* the checks, coded C1… */
let cN = 0
const codes = {}
const checksHTML = L.checks.filter(g => g.g !== 'On the puck').map(g => `<h3>${esc(g.g)}</h3><table class="chk"><thead><tr><th>Code</th><th>Check</th><th>Level</th><th>When it shows</th></tr></thead><tbody>` + g.items.map(c =>
  `<tr><td class="code">${codes[c.name] = 'C' + (++cN)}</td><td class="nm">${esc(c.name)}</td><td>${pill(c.tier)}</td><td>${esc(c.line)}${
    c.how ? `<details${PDF ? ' open' : ''}><summary>How it works</summary><ul>${c.how.map(h => `<li>${esc(h)}</li>`).join('')}</ul></details>` : ''}</td></tr>`).join('') + `</tbody></table>`).join('')

/* the letters on a puck, most serious first, as the app orders them */
const chipCol = c => ['Q', 'C', 'CPH', 'RUN', 'CR'].includes(c) ? 'red' : c === 'LD' ? 'grey' : 'amber'
const chipsHTML = L.chips.map(c => `<tr><td><span class="chip ${chipCol(c.code)}">${esc(c.chip)}</span></td><td>${esc(c.label)}</td></tr>`).join('')

const QUESTIONS = readFileSync(join(HERE, 'questions.txt'), 'utf8').split(/\r?\n\r?\n/).filter(b => /^Q\d+\./.test(b.trim())).map(b => {
  const [q, ...rest] = b.trim().split(/\r?\n/)
  return `<li><b>${esc(q.replace(/^Q\d+\.\s*/, ''))}</b><br><span class="ctx">${esc(rest.join(' ').replace(/^Context:\s*/, ''))}</span></li>`
}).join('')

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>TALON: how it works</title>
<style>
:root{--ink:#14202B;--soft:#4F5D6B;--line:#D8DFE6;--bg:#F5F7F9;--card:#fff;--navy:#0B1F33;--cyan:#0E8FB0;--red:#C93A46;--amber:#B77A12;--grey:#66727F}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
main{max-width:980px;margin:0 auto;padding:0 16px 56px}
header.top{background:var(--navy);color:#fff;padding:28px 16px 24px}
header.top>div{max-width:980px;margin:0 auto}
header.top h1{margin:0 0 6px;font-size:30px;letter-spacing:.02em}
header.top p{margin:0;color:#C5D3E0;max-width:60ch}
h2{font-size:22px;margin:40px 0 8px;padding-top:14px;border-top:3px solid var(--navy)}
h2 small{font-weight:400;color:var(--soft);font-size:15px;margin-left:6px}
h3{font-size:16px;margin:22px 0 6px;color:var(--navy)}
p{margin:8px 0;max-width:72ch}
.lead{font-size:17px}
.box{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--cyan);border-radius:8px;padding:12px 14px;margin:14px 0}
.box b.eg{font-family:ui-monospace,Consolas,monospace;background:#EAF4F8;padding:1px 6px;border-radius:4px;font-weight:600;white-space:nowrap}
figure{margin:14px 0;background:var(--card);border:1px solid var(--line);border-radius:8px;overflow:hidden}
figure img{display:block;width:100%;height:auto}
figure.phone{max-width:340px}
figcaption{padding:8px 12px;font-size:14px;color:var(--soft);border-top:1px solid var(--line)}
figcaption b{color:var(--ink)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:8px;font-size:14.5px;margin:8px 0 4px}
th,td{text-align:left;vertical-align:top;padding:7px 10px;border-bottom:1px solid var(--line)}
thead th{background:#E9EEF3;font-size:12.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--soft)}
tr.grp th{background:#F0F4F7;color:var(--navy);font-size:13.5px}
tr:last-child td{border-bottom:0}
td.code{font-family:ui-monospace,Consolas,monospace;font-weight:700;color:var(--cyan);white-space:nowrap;width:1%}
td.nm{font-weight:600;min-width:150px}
td.val{white-space:nowrap}
.pill,.chip{display:inline-block;border-radius:999px;padding:1px 9px;font-size:12.5px;font-weight:700;color:#fff;white-space:nowrap}
.chip{border-radius:5px;min-width:28px;text-align:center}
.red{background:var(--red)}.amber{background:var(--amber)}.grey{background:var(--grey)}
details{margin-top:6px}
summary{cursor:pointer;color:var(--cyan);font-weight:600;font-size:13.5px}
details ul{margin:6px 0 2px;padding-left:18px}
details li{margin:3px 0}
ol.steps{padding-left:0;list-style:none;counter-reset:s;margin:10px 0}
ol.steps>li{counter-increment:s;position:relative;padding:8px 0 8px 44px;border-bottom:1px solid var(--line)}
ol.steps>li:before{content:counter(s);position:absolute;left:0;top:8px;width:30px;height:30px;border-radius:50%;background:var(--navy);color:#fff;font-weight:700;text-align:center;line-height:30px}
ol.qs{padding-left:22px}
ol.qs li{margin:10px 0}
.ctx{color:var(--soft);font-size:14.5px}
code{font-family:ui-monospace,Consolas,monospace;background:#E9EEF3;padding:1px 5px;border-radius:4px;font-size:.92em}
footer{margin-top:40px;color:var(--soft);font-size:13px}
.swipe{display:none;color:var(--soft);font-size:13.5px;margin:4px 0}
@media (max-width:700px){
  .two{grid-template-columns:1fr}
  table:not(.keep),table:not(.keep) thead,table:not(.keep) tbody,table:not(.keep) tr,table:not(.keep) th,table:not(.keep) td{display:block}
  table:not(.keep) thead{display:none}
  table:not(.keep) tr{border-bottom:1px solid var(--line);padding:8px 10px}
  table:not(.keep) tr.grp{padding:0}
  table:not(.keep) tr.grp th{padding:8px 10px}
  table:not(.keep) td{border:0;padding:2px 0}
  table:not(.keep) td.code{width:auto;display:inline-block;margin-right:8px}
  table:not(.keep) td.nm{display:inline-block;min-width:0}
  table:not(.keep) td.val{white-space:normal}
  table.keep:not(.sa) td:first-child{width:1%;white-space:nowrap}
  .swipe{display:block}
  .scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
  .scroll table{min-width:680px}
}
@page{size:A4;margin:13mm 11mm}
@media print{
  body{background:#fff;font-size:10.5pt}
  header.top{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .pill,.chip,thead th,tr.grp th,ol.steps>li:before{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  main{max-width:none;padding:0}
  h2{break-after:avoid}h3{break-after:avoid}
  tr,figure,.box,ol.steps>li{break-inside:avoid}
  table{font-size:9pt}
  figure.wide{max-width:100%}
  figure.phone{max-width:230px}
}
</style></head><body>
<header class="top"><div>
<h1>TALON: how it works</h1>
<p>A short guide for F-16 schedulers and training appointment holders seeing it for the first time. It was built for a two-seat F-15 squadron. Read it with your own squadron in mind.</p>
</div></header>
<main>

<div class="box"><b>What we need from you.</b> As you read, note what is the <b>same</b> for you, what is <b>different</b>, and what is <b>missing</b>. Every rule in the tables has a code. Reply with the code and what should change, for example <b class="eg">S6: our step is 45 min</b> or <b class="eg">C22: does not apply to us</b>. The questions are at the end.</div>

<h2>1. What it is</h2>
<p class="lead">One place for the week's flying programme, everyone's leave and other inputs, qualifications, leave planning and OIL (off in lieu, earned for weekend or holiday work). As you plan, it checks every person against the squadron's rules and flags the problems.</p>
<p>It flags; the scheduler decides. A flag never stops a day being published.</p>
${pic('01-week', 'The week on Edit Schedule', '<b>Edit Schedule.</b> One column a day. Each day holds its flying waves, standby, duties, sims and ground events. A coloured name is a person (a "puck"), dragged into a seat from the crew list on the right.', 'wide')}

<h2>2. The pages</h2>
<table><thead><tr><th>Page</th><th>Who uses it</th><th>What it is for</th></tr></thead><tbody>
<tr><td class="nm">Edit Schedule</td><td>Schedulers (admins only)</td><td>The week. Add waves and lines, type the times, drag people into seats. Every change is checked at once.</td></tr>
<tr><td class="nm">Scheduler Board</td><td>Schedulers (admins only)</td><td>One day, full screen, for the heavy editing. Opened by tapping a day's date on Edit Schedule.</td></tr>
<tr><td class="nm">View-only Sched</td><td>Everyone</td><td>The programme to read. A published day shows exactly what was published.</td></tr>
<tr><td class="nm">Inputs</td><td>Everyone</td><td>Leave, medical, duties, courses, meetings, appointments. A calendar and a list. SANS people (posted elsewhere, still flying with the squadron) file their availability on its SANS tab.</td></tr>
<tr><td class="nm">Quals</td><td>Everyone. Each person keeps his own row; admins can change anyone's</td><td>Who holds which qualification or currency. The checks read this page.</td></tr>
<tr><td class="nm">Logic</td><td>Everyone reads, admins change</td><td>Every number and every check the app uses, in plain words. Sections 5 and 6 below are this page.</td></tr>
<tr><td class="nm">Leave War</td><td>Everyone</td><td>Leave planning for a period: bids, manning for each day, leave and OIL balances.</td></tr>
<tr><td class="nm">Tracker</td><td>Everyone</td><td>Each student's progress through the syllabus.</td></tr>
<tr><td class="nm">Help</td><td>Everyone</td><td>Report a problem with the app.</td></tr>
<tr><td class="nm">Admin</td><td>Admins</td><td>People and their sign-ins (admin or member), the squadron's duty, day and wave templates, and clearing old data.</td></tr>
</tbody></table>
<div class="two">
${pic('02-board', 'The Scheduler Board', '<b>Scheduler Board.</b> One day at full size: each line has its callsign, mission, times, crew and remarks.')}
${pic('03-inputs', 'The Inputs calendar', '<b>Inputs.</b> Everyone files their own. An input closes that person for its hours from the moment it is filed.')}
</div>
<div class="two">
${pic('04-quals', 'The Quals page', '<b>Quals.</b> One row a person, one column a qualification. A tick here is what the checks trust.')}
${pic('05-leavewar', 'The Leave War', '<b>Leave War.</b> The leave picture for the whole squadron, with the manning left on each day.')}
</div>

<h2>3. From plan to published</h2>
<ol class="steps">
<li><b>People file inputs.</b> Leave, medical, duties and the rest. The person is closed for those hours at once.</li>
<li><b>The scheduler builds the day.</b> Add a wave, add its lines, type the times, drag people into seats. The crew list shows who is free.</li>
<li><b>The app checks as you go.</b> A problem shows as a letter on the person and a line in the day's list. Red is a warning, amber an advisory, grey a note.</li>
<li><b>Four names sign, then Publish.</b> CUR CK, SKED CK, PLANNED BY and APPROVED BY. The day goes out as the original (ORIG).</li>
<li><b>A change after that is an amendment.</b> It waits as "pending" until it is signed and published again as AL1, then AL2, and so on. Each day keeps its own count. Everyone can see who changed what.</li>
<li><b>Weekend and holiday work earns OIL.</b> Worked out from the published day: a full day or a half.</li>
</ol>
${pic('06-published', 'A published day', '<b>A published day.</b> Its heading says which version is out and who signed it. Changes made since wait as pending until the next amendment.', 'wide')}

<h2>4. The flags</h2>
<table class="keep"><thead><tr><th>Level</th><th>Meaning</th></tr></thead><tbody>
<tr><td>${pill('Warning')}</td><td>A rule is broken: a conflict, short crew rest, a seat the person may not hold.</td></tr>
<tr><td>${pill('Advisory')}</td><td>Worth a look: a missed brief, a tight turn, a pairing that needs approval.</td></tr>
<tr><td>${pill('Note')}</td><td>For information: a long day.</td></tr>
</tbody></table>
${pic('07-flags', 'Flags on a day', '<b>Flags.</b> The letter on a person says what is wrong. The day\'s list says it in words: who, what, the times and why. Tap a line and its people light up.', 'wide')}
<h3>The letters on a person, most serious first</h3>
<table class="keep"><tbody>${chipsHTML}</tbody></table>
<p>A person with several problems shows the most serious one.</p>

<h2>5. The numbers <small>what each squadron can set</small></h2>
<p>Admins change these on the Logic page. The values are the F-15 squadron's today. A published day keeps the numbers it was published with until it is published again.</p>
${pic('08-logic', 'The Logic page', '<b>Logic.</b> The same list, in the app. Every number sits beside one line saying what moves with it.', 'phone')}
<table><thead><tr><th>Code</th><th>Setting</th><th>F-15 today</th><th>What it does</th></tr></thead><tbody>${settingsHTML}</tbody></table>

<h2>6. The checks <small>every one the app makes</small></h2>
<p>These are the app's own words. Where a line names a setting in brackets, it is one of the numbers in section 5.</p>
${checksHTML}

<h2>7. Standby <small>how SC MAIN, SC SPARE, AVALON and BB are flagged</small></h2>
<p>A standby line is planned like a flying line, with a row for each crew, and each row is MAIN or SPARE. An SC MAIN is checked in full. SC SPARE, AVALON and BB are checked more lightly, because the crew is waiting, not flying. The moment a row flies, it is checked as a sortie.</p>
${pic('09-standby', 'A standby line on the schedule', '<b>A standby line.</b> Each row wears MAIN or SPARE. The times are the shift\'s START and END.', 'wide')}
<p class="swipe">Swipe the table sideways for SC SPARE, AVALON and BB.</p>
<div class="scroll"><table class="keep sa"><thead><tr><th>While standing by</th><th>SC MAIN</th><th>SC SPARE</th><th>AVALON</th><th>BB</th></tr></thead><tbody>
<tr><td class="nm">Hours</td><td colspan="2">Exactly the START and END written. No step, dekit, brief or debrief is added.</td><td>The same. Overnight.</td><td>The same. Times are yours to set.</td></tr>
<tr><td class="nm">Also down for something else in those hours</td><td><b>Flagged.</b> Red against a flight, a sim, a duty post or another shift. Amber against a ground event or a programme item. Each of the six can be set red or amber (${sCodes['SC MAIN conflicts']}).</td><td>Not flagged, unless it is another SC seat or the SC desk.</td><td>Not flagged, unless it is another AVALON seat or the AVALON desk.</td><td>Not flagged, unless it is another seat or the BB desk.</td></tr>
<tr><td class="nm">Leave, medical and other inputs</td><td><b>Flagged</b> red, as on a flying line, ATT B included. A meeting is amber (${codes['Overlaps standby']}).</td><td>Only overseas leave, overseas duty or a medical code is flagged. Local leave and other local inputs may still stand SPARE.</td><td colspan="2">Only overseas or medically down is flagged.</td></tr>
<tr><td class="nm">Currency</td><td colspan="2">SC DAY if the shift sits wholly inside the SC day window (${sCodes['SC day window']}). SC NIGHT if it reaches outside it.</td><td>SC NIGHT.</td><td>SC currency for the hours typed.</td></tr>
<tr><td class="nm">Front seat</td><td colspan="4">Pilots only, on all four.</td></tr>
<tr><td class="nm">Crew rest</td><td><b>Checked</b>, measured to the shift's START. Typing its B or R makes the line fly (below), and its crew rest then counts to the B or R.</td><td colspan="3">None while standing by.</td></tr>
<tr><td class="nm">OIL on a weekend or holiday</td><td>Earned over its written hours.</td><td colspan="3">Only if switched on for that row in OIL Earn.</td></tr>
</tbody></table></div>
<h3>When a standby line flies</h3>
<table><tbody>
<tr><td class="nm">How the app knows</td><td>Type the line's B or R and every row on it flies. Or tick FLIES on one row on the Scheduler Board and that row flies on its own.</td></tr>
<tr><td class="nm">What changes</td><td>A row that flies has its conflicts and turns checked as a sortie's are, carries crew rest, counts as a jet and a sortie, and earns OIL by default. The SPARE's local-leave allowance no longer applies.</td></tr>
<tr><td class="nm">Empty or cancelled rows</td><td>A row with nobody on it counts nothing. A row that does not come in is cancelled with CX.</td></tr>
<tr><td class="nm">No START or END</td><td>An advisory says its crew rest and OIL cannot be worked out (${codes['Standby line flies — no start or end']}).</td></tr>
</tbody></table>
<p>The app's own lines for these are ${codes['SC']} to ${codes['Arming an SC seat']}, with ${codes['SC currency — wrong shift']}, ${codes['Overlaps standby']} and ${codes['Standing SC SPARE']}.</p>

<h2>8. For training appointment holders</h2>
<table><thead><tr><th>Where</th><th>What it gives you</th></tr></thead><tbody>
<tr><td class="nm">Tracker</td><td>Each student's syllabus as a flow chart of its events. His instructors mark each event on the chart as he completes it; flying it on the schedule does not mark it.</td></tr>
<tr><td class="nm">Quals</td><td>Each person's category and currencies, listed by seat (pilots, WSOs, ground crew). The pairing and currency checks read it.</td></tr>
<tr><td class="nm">Crew pairing checks</td><td>A student paired with someone he may not fly with, a pairing that needs approval, an OCU formation with no instructor (${codes['Crew not authorised']} to ${codes['OCU with no IP']}).</td></tr>
<tr><td class="nm">Test and currency checks</td><td>An IRT with no IR examiner (${codes['IRT with no IR examiner']}). Refuelling flown by a pilot not current, and who may instruct it (${codes['AAR currency — not qualified']}, ${codes['AAR — back seat not cleared to instruct']}).</td></tr>
<tr><td class="nm">Insights (a button on the schedule pages)</td><td>Each person's sorties and work hours for the week.</td></tr>
</tbody></table>
${pic('10-tracker', 'The Tracker', '<b>Tracker.</b> One chart a syllabus. Each ball is an event.', 'wide')}

<h2>9. Words that switch a rule on</h2>
<p>Most boxes are free text. A few words are read by the app.</p>
<table><thead><tr><th>You type</th><th>Where</th><th>What happens</th></tr></thead><tbody>
<tr><td class="nm"><code>AAR</code> <code>DAAR</code> <code>NAAR</code></td><td>A line's remarks</td><td>Checks the front seat's refuelling currency. Plain AAR means night on a night wave, day otherwise. <code>NO AAR</code> cancels it.</td></tr>
<tr><td class="nm"><code>IRT</code></td><td>The mission, or one aircraft's remarks</td><td>Needs an IR examiner in that formation, or in that aircraft.</td></tr>
<tr><td class="nm"><code>LATE SHOW</code> <code>SHOW AT BRIEF</code></td><td>A line's remarks</td><td>Changes only how the crew-rest ring is drawn: dashed while the crew can still make step, solid after. The warning stays.</td></tr>
<tr><td class="nm"><code>1A:</code> <code>1B:</code></td><td>A line's remarks</td><td>Says which seat a refuelling remark (AAR) is about: A the front seat, B the back seat. Text with no tag counts as the front seat. No other rule reads it.</td></tr>
<tr><td class="nm"><code>0900 IN TIME</code></td><td>The in-time line above a wave</td><td>Sets the in-time for the whole wave. With a formation's name in it, for that formation only.</td></tr>
<tr><td class="nm"><code>EP</code></td><td>An OFT sim row's label</td><td>That sim gets a brief before it and a debrief after it.</td></tr>
<tr><td class="nm"><code>BRIEF</code> <code>DEBRIEF</code></td><td>An AMT sim row's label</td><td>That row is the block's brief, or its debrief.</td></tr>
<tr><td class="nm"><code>BRIEF 30</code></td><td>An OFT sim row's remarks</td><td>Sets that sim's brief to 30 minutes before it.</td></tr>
<tr><td class="nm">CX</td><td>A button on the line</td><td>Cancels the line and asks why. The line prints "CX DUE" and the reason.</td></tr>
</tbody></table>

<h2>10. What is built around the F-15</h2>
<p>These are the places we expect another squadron to differ. Tell us where we are wrong.</p>
<table><thead><tr><th>Today</th><th>For you?</th></tr></thead><tbody>
<tr><td><b>Two seats on every line.</b> A front seat and a back seat. People are pilots or WSOs, and the seat checks (${codes['Illegal seat']}, ${codes['Incentive passenger — crew pairing needs approval']}) follow from that.</td><td>A line with only its front seat filled is planned to work in full for single-seat jets. It is not built yet, and the rules a single-seat squadron needs are not written yet. Your answers decide them.</td></tr>
<tr><td><b>Crew pairing by category.</b> OCU and CAT A to D decide who may fly with whom, and when an instructor or approval is needed (${codes['Crew not authorised']} to ${codes['OCU with no IP']}).</td><td>What decides it for you?</td></tr>
<tr><td><b>Three kinds of standby:</b> SC, AVALON and BB, with MAIN and SPARE rows. An SC MAIN is checked in full; SC SPARE, AVALON and BB are checked more lightly, unless they fly (section 7).</td><td>Which do you hold, and what may a person on standby also do?</td></tr>
<tr><td><b>Qualification columns:</b> SANS, SXO, Management, Scheduler, SC DAY, SC NIGHT, DAAR, NAAR, NVG, IMC, TF. The warnings read SC DAY, SC NIGHT, DAAR and NAAR (${codes['AAR currency — not qualified']} to ${codes['SC currency — wrong shift']}). SANS decides who is checked against SANS availability (${codes['SANS availability — planned outside the availability filed']}), and Scheduler who may sign a day. The others are records only.</td><td>Which currencies should stop or flag a seat for you?</td></tr>
<tr><td><b>The numbers in section 5</b> are one squadron's.</td><td>Each squadron having its own schedule, its own numbers and its own public holidays in the one app is being built now.</td></tr>
</tbody></table>

<h2>11. Questions for you</h2>
<p>Short answers are fine. Reply with the question number.</p>
<ol class="qs">${QUESTIONS}</ol>

<footer>Pictures show invented demo people, not a real programme. Tables read from the app's Logic page, ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.</footer>
</main></body></html>`

const out = join(HERE, 'talon-guide.html')
writeFileSync(out, html)
console.log(`talon-guide.html written: ${Math.round(html.length / 1024)} KB, settings S1–S${sN}, checks C1–C${cN}` + (missing.length ? `\nPICTURES MISSING: ${missing.join(', ')}` : ''))

if (PDF) {
  const { chromium } = await import('@playwright/test')
  const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const page = await browser.newPage()
  await page.goto(pathToFileURL(out).href)
  await page.pdf({ path: join(HERE, 'talon-guide.pdf'), format: 'A4', printBackground: true })
  await browser.close()
  /* the PDF was drawn with every "How it works" open; the HTML a person opens keeps them folded */
  writeFileSync(out, html.replace(/<details open>/g, '<details>'))
  console.log('talon-guide.pdf written')
}
