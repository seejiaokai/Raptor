// THE QUESTIONS PAGE for the look for other counts (his D2603 — chat 170's night of 25 Nov 26, job 2). Drafted by an
// Opus helper; its words to be read and adjusted by a fresh Fable reader (his D2441) before the host publishes it.
// Reads the drawing runs' cnt.json (cnt-draw.mjs, worlds S, P and L), copies the pictures the page shows into
// docs/img/handpass/2026-11-25-counts-look/, and writes docs/mock/counts-look.html with every picture embedded, so the
// page opens alone. Every line the app printed is read from the runs, never typed here; the fuller words ("named") are
// the runs' own swaps, ringed green in the pictures. A wording typed here is said on the page to be a wording, not drawn.
//   node scripts/handpass/cnt-page.mjs [runs folder, default D:/rw4/night2/job2]
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUNS = process.argv[2] || 'D:/rw4/night2/job2'
const PICS = join(HERE, '../../docs/img/handpass/2026-11-25-counts-look')
const PAGE = join(HERE, '../../docs/mock/counts-look.html')
mkdirSync(PICS, { recursive: true })
const RUN = { S: 'run-S', P: 'run-P', L: 'run-L' }
const J = {}; for (const [k, d] of Object.entries(RUN)) J[k] = { ...JSON.parse(readFileSync(join(RUNS, d, 'cnt.json'), 'utf8')), dir: d }
const C = (w, c) => { const x = J[w].cases[c]; if (!x) throw new Error(`no case ${c} in world ${w}`); return x }
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const q = s => `“${esc(s)}”`
const rowsSaid = n => (n === 1 ? 'one row' : `${['', '', 'two', 'three', 'four', 'five', 'six'][n] || n} rows`)
const used = []
function fig(w, file, cap) {
  const src = join(RUNS, J[w].dir, file)
  if (!existsSync(src)) throw new Error('no picture ' + src)
  copyFileSync(src, join(PICS, file)); used.push(file)
  const data = 'data:image/png;base64,' + readFileSync(src).toString('base64')
  return `<figure><button type="button" class="zoom" aria-label="Enlarge: ${esc(cap)}"><img src="${data}" alt="${esc(cap)}" loading="lazy"></button><figcaption>${cap}</figcaption></figure>`
}
const pics = (...f) => `<div class="pics">${f.join('')}</div>`
const row = (cls, dt, dd) => `<div${cls ? ` class="${cls}"` : ''}><dt>${dt}</dt><dd>${dd}</dd></div>`
/* a case's words and rows, from the runs */
const T = (w, c, k = 'today') => { const x = C(w, c)[k]; if (!x) throw new Error(`no ${k} for ${c}`); return x }
const words = (w, c, k) => T(w, c, k).text
const rows = (w, c, k) => rowsSaid(T(w, c, k).rows)

/* the facts the questions lean on, read from the runs */
const three = 'Ace, Hex and Ranger'
const titleCut = C('S', 's-title10').named && C('S', 's-title10').named.cut && C('S', 's-title10').named.cut.cut
const peopleInView = C('S', 's-delete').peopleInView
const holders = C('L', 'l-grade').holders || []

const H = []
H.push(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Counts Look</title>
<style>
/* One reading column: what to look at now first, then each question with the real app. Light and dark, as the phone is set. */
:root{--bg:#f4f6f8;--panel:#ffffff;--panel2:#eef1f4;--line:#d5dbe2;--ink:#141a21;--ink2:#4f5b67;--cyan:#0f7fa0;--amber:#9a6a00;--amberline:#d9a020;color-scheme:light;
--ui:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0b0e13;--panel:#151a21;--panel2:#1b222b;--line:#2a323d;--ink:#e8edf2;--ink2:#a9b4c0;--cyan:#39c6e6;--amber:#ffc83d;--amberline:#ffc83d;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0b0e13;--panel:#151a21;--panel2:#1b222b;--line:#2a323d;--ink:#e8edf2;--ink2:#a9b4c0;--cyan:#39c6e6;--amber:#ffc83d;--amberline:#ffc83d;color-scheme:dark}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 var(--ui);padding-inline:max(16px,env(safe-area-inset-left,0px)) max(16px,env(safe-area-inset-right,0px));padding-block:20px 56px;overflow-wrap:anywhere}
main{max-width:980px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr);gap:18px;min-width:0}
h1{font-size:25px;line-height:1.2;margin:0;text-wrap:balance}
h2{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--cyan);margin:18px 0 0}
h3{font-size:18px;line-height:1.3;margin:0;text-wrap:balance}
p{margin:0}.lead{color:var(--ink2);max-width:68ch}.lead b{color:var(--ink)}
.asks{background:var(--panel);border:1px solid var(--amberline);border-radius:10px;padding:16px;display:grid;gap:12px}
.asks h2{margin:0;color:var(--amber)}
.asks ol{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.asks li{display:grid;gap:2px}.asks a{color:var(--cyan);text-decoration:none}.asks a b{font-weight:600}.rec{color:var(--ink2);font-size:14px}
.asks .grp{font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--ink2);margin-top:4px}
.news{max-width:72ch}
section{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:16px;display:grid;grid-template-columns:minmax(0,1fr);gap:10px;min-width:0;scroll-margin-top:12px}
.qn{display:block;font-size:12px;font-weight:600;letter-spacing:.04em;color:var(--amber);margin-bottom:2px}
.eg{color:var(--ink2);max-width:72ch}
dl{margin:0;display:grid;gap:8px}dl div{display:grid;grid-template-columns:96px minmax(0,1fr);gap:10px}
dt{font-size:12px;font-weight:600;color:var(--ink2);padding-top:2px}dd{margin:0;color:var(--ink2);min-width:0}
.new dt{color:var(--amber)}.new dd{color:var(--ink)}.rc dd b{color:var(--ink)}
.pics{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:12px;align-items:start}
figure{margin:0;display:grid;gap:5px;min-width:0}figcaption{font-size:12.5px;color:var(--ink2)}
.zoom{all:unset;display:block;cursor:zoom-in;border:1px solid var(--line);border-radius:6px;overflow:hidden;background:#000}
.zoom:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}.zoom img{display:block;width:100%;height:auto}
.keep{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:16px;display:grid;gap:10px}
.keep ul{margin:0;padding-left:18px;color:var(--ink2);display:grid;gap:5px}.keep li b{color:var(--ink);font-weight:600}
#big{position:fixed;inset:0;background:rgba(5,7,10,.96);display:flex;align-items:flex-start;justify-content:center;padding:max(14px,env(safe-area-inset-top,0px)) max(14px,env(safe-area-inset-right,0px)) max(14px,env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px));z-index:20;overflow:auto;cursor:zoom-out}
#big[hidden]{display:none}
#big img{max-width:100%;height:auto;margin:auto}
</style></head><body>
<main id="top">
<h1>Where the app counts things instead of naming them</h1>
<p class="lead"><b>Nothing in the app has changed. These are questions for you.</b> You asked to see what else in the app gives a number where it could say the things themselves. Every picture is the real app at iPhone size. The words each question is about are ringed in yellow. Where a picture shows the things named, those words were put into the app’s own box on the screen, so the letters and the way they wrap are the app’s, and they are ringed in green. Tap any picture to enlarge it.</p>
`)

/* ---- what to look at now ---- */
const ASKS = [
  'Seen in the app: seven places',
  ['q1', '1. An input for several people is titled “Ace +2” in its window. Should the title name everyone?', 'I recommend: Keep “Ace +2”. Everyone in it is lit just below the title, and a long title is cut off on a phone.'],
  ['q2', '2. The input’s own questions and notes say “all 3 people”. Should they name the people?', 'I recommend: Name them. When the delete question shows, the people have scrolled out of sight.'],
  ['q3', '3. Undo says “Undid: Training for 3 people”, and so does the publish note. Should both name the people?', 'I recommend: Keep the count, as you chose for the publish note on 22 Nov.'],
  ['q4', '4. The publish note says “4 inputs have no OIL answer”. Should it name all four?', 'I recommend: Name them all. Up to three are named today, and four or more at once is rare.'],
  ['q5', '5. An amendment’s publish note says “1 day with changes still held”. Should it name the day?', 'I recommend: Name the days. They are short, “Sun” or “Sat, Sun”.'],
  ['q6', '6. On the Leave War, crediting OIL to four or more reads “OIL credits · Reaper, Anvil +2”. Should it name everyone?', 'I recommend: Keep it. The picked names are lit in the list just above.'],
  ['q7', '7. Deleting a grade asks “3 people hold Ops A: they become No grade”. Should it name them?', 'I recommend: Name them. Nothing on that window shows who holds the grade.'],
  'Not pictured: four more places',
  ['q8', '8. Placing someone who breaks several rules at once says the first warning, then “(+2 more)”.', 'I recommend: Keep it. Every warning is also ringed on the schedule and listed.'],
  ['q9', '9. Loading an earlier version says “2 requests stay as filed because they cover another day”, and two more counts like it.', 'I recommend: Name them, as the same note already names each request that came back.'],
  ['q10', '10. Undo of opening several separate stretches for bidding reads “opening bidding 1 Mar – 7 Mar and 2 more”.', 'I recommend: Keep it. This is rare, and the bidding dates window shows every stretch.'],
  ['q11', '11. The SANS reminder and the SANS posting line say three days, then “and 2 more”.', 'I recommend: Name every day. Days are short. Their wording is in the SANS job’s hands.'],
  'Three I am unsure about',
  ['q12', '12. On the Leave War, the window for a picked block of four or more people is headed “5 people”.', 'I recommend: Keep it, but I could not check it on a phone.'],
  ['q13', '13. Bringing in holidays from a sheet: Undo says “adding 7 holidays”, and the note says “Also added: 3 holidays in 2027”.', 'I recommend: Keep both. A sheet can hold a whole year of holidays.'],
  ['q14', '14. Undo of several inputs at once says “Undid: 3 inputs”.', 'I recommend: Keep it, as you chose on 3 Nov.'],
]
const NQ = ASKS.filter(a => Array.isArray(a)).length
H.push(`<div class="asks">\n<h2>What to look at now: ${NQ} questions</h2>
<p class="news">Two counts are not asked here, because the bell page already asks them: the bell’s “3 people added” (its question 5) and joining two names with “and” (its question 6). The bell’s “and 1 more change” you have already settled: it will say every change.</p>
<ol>` + ASKS.map(a => (Array.isArray(a) ? `<li><a href="#${a[0]}"><b>${esc(a[1])}</b></a><span class="rec">${esc(a[2])}</span></li>` : `<li class="grp">${esc(a)}</li>`)).join('') + `</ol>
<p class="news">After the questions: <a href="#keep">the counts I recommend keeping as they are</a>, because each number is the point, or tapping it opens the list it counts.</p>
</div>\n`)

/* ---- the seven pictured ---- */
H.push('<h2>Seen in the app</h2>\n')
H.push(`<section id="q1"><h3><span class="qn">Question 1</span> An input for several people is titled “Ace +2” in its window. Should the title name everyone?</h3>
<p class="eg">This happens whenever someone opens an input that has several people in it, such as a Training for three, from the Inputs page or the schedule. It happens often; my guess is several times a day. The same “Ace +2” also names the input in the OIL question’s heading and in a few other questions about it.</p>
<dl>${row('', 'Today', `${q(words('S', 's-title', 'today'))}: the first name from A to Z, then how many more. With ten people: ${q(words('S', 's-title10', 'today'))}.`)}
${row('new', 'Named', `${q(words('S', 's-title', 'named'))} fits on ${rows('S', 's-title', 'named')}. ${titleCut ? 'With ten people, the title is cut off with “…” after about six names, because the title stays on one row.' : ''}`)}
${row('', 'Also on screen', 'Just under the title, the window says “3 picked”, and each of the three is lit in the list of people.')}
${row('', 'Your earlier word', 'On 10 Oct you ruled that an input’s card, and the desktop Inputs list, name everyone, never “+1”. The window’s title was not part of that question.')}
${row('rc', 'I recommend', '<b>Keep “Ace +2” in the title.</b> The people are lit just below it. A title of every name would be cut off on a phone, and it would need a new design to wrap.')}</dl>
${pics(fig('S', 's-title-today.png', 'Today: the window title “Ace +2 · 15 Jul”, ringed in yellow, with “3 picked” below it'), fig('S', 's-title-named.png', 'Named: “Ace, Hex, Ranger · 15 Jul”, ringed in green, on one row'), fig('S', 's-title10-named.png', 'Named, ten people: the title is cut off with “…” after six names'))}</section>
`)
H.push(`<section id="q2"><h3><span class="qn">Question 2</span> The input’s own questions and notes say “all 3 people”. Should they name the people?</h3>
<p class="eg">This happens when someone deletes an input that has several people in it, or takes himself out of one, or changes its dates. One rule makes all of these words, so one answer settles them all. How often it happens has not been measured; my guess is a few times a week.</p>
<dl>${row('', 'Today', `${q(words('S', 's-delete', 'today'))}, and after it ${q(words('S', 's-deleted', 'today'))}. The same count is in “It stays for the other 2 people”, “Date changes apply to all 3”, “3 people’s Training is already on the programme”, and the Inputs calendar’s own delete question. “Input added for 3 people” is said only when the new input is not already in view.`)}
${row('new', 'Named', `${q(words('S', 's-delete', 'named'))} takes ${rows('S', 's-delete', 'named')}. For ten people, the question takes ${rows('S', 's-delete10', 'named')}, and the note after it takes ${rows('S', 's-deleted', 'named')}.`)}
${row('', 'Also on screen', peopleInView ? 'The people are still in view when the question shows.' : 'When Delete is pressed, the question shows at the foot of the window. The list of people has scrolled out of sight by then, so the screen does not show who will lose the input.')}
${row('rc', 'I recommend', '<b>Name them.</b> A delete for several people takes the input away from each of them, and the screen does not show who they are at that moment. Even ten names fit in the question’s box.')}</dl>
${pics(fig('S', 's-delete-today.png', 'Today: “Delete this input for all 3 people?”, ringed in yellow, above the Delete button'), fig('S', 's-delete-named.png', 'Named: “Delete this input for Ace, Hex and Ranger?”, ringed in green'), fig('S', 's-delete10-named.png', 'Named, ten people: three rows in the same box'), fig('S', 's-deleted-today.png', 'Today: the note “Input deleted for 10 people”'), fig('S', 's-deleted-named.png', 'Named: the same note with the ten names, two rows'))}</section>
`)
H.push(`<section id="q3"><h3><span class="qn">Question 3</span> Undo says “Undid: Training for 3 people”, and so does the publish note. Should both name the people?</h3>
<p class="eg">Undo: whenever someone presses Undo or Redo after changing an input that has three or more people in it. It happens often; my guess is daily. The publish note: when a weekend day is published while such an input still has no OIL answer. That is rare, my guess. The publish note was made to name an input the way Undo does.</p>
<dl>${row('', 'Today', `${q(words('S', 's-undo', 'today'))}. Undo names one person, “Undid: Ranger’s Training”, and counts from two, “Training for 2 people”. The publish note names one or two, “Ranger and Hex’s Training”, and counts from three: ${q(words('P', 'p-three', 'today'))}`)}
${row('new', 'Named', `${q(words('S', 's-undo', 'named'))}: ${rows('S', 's-undo', 'named')}. The publish note: ${q(words('P', 'p-three', 'named'))}: ${rows('P', 'p-three', 'named')}, the same as today. With ten people, Undo’s note would put ten names before the word “Training”.`)}
${row('', 'Your earlier word', 'On 22 Nov you chose “Training for 3 people” for the publish note, and on 3 Nov that Undo names an input by its person and kind.')}
${row('rc', 'I recommend', '<b>Keep the count.</b> It is a note that shows for a few seconds, and with many people the name of the input would be lost behind them. If you want the names, both places would change together.')}</dl>
${pics(fig('S', 's-undo-today.png', 'Today: the Undo note “Undid: Training for 3 people”, ringed in yellow'), fig('S', 's-undo-named.png', 'Named: “Undid: Ace, Hex and Ranger’s Training”, ringed in green'), fig('P', 'p-three-today.png', 'Today: Sunday’s publish note, “Training for 3 people has no OIL answer…”'), fig('P', 'p-three-named.png', 'Named: the same publish note naming Ace, Hex and Ranger'))}</section>
`)
H.push(`<section id="q4"><h3><span class="qn">Question 4</span> The publish note says “4 inputs have no OIL answer”. Should it name all four?</h3>
<p class="eg">This happens when a scheduler publishes a weekend day or a holiday while four or more of its inputs still have no OIL answer (he pressed Later when the sign-off asked). Up to three are named today. Four or more at once is rare; that is a guess.</p>
<dl>${row('', 'Today', `${q(words('P', 'p-four', 'today'))}: ${rows('P', 'p-four', 'today')}.`)}
${row('new', 'Named', `${q(words('P', 'p-four', 'named'))}: ${rows('P', 'p-four', 'named')}. It names them the way the note already names three, as the next picture shows.`)}
${row('', 'Three, today', `${q(words('P', 'p-held', 'today'))}: an amendment published later the same day, three inputs still unanswered, ${rows('P', 'p-held', 'today')}.`)}
${row('rc', 'I recommend', '<b>Name them all.</b> This note is the last word before nobody on those inputs earns OIL, and a scheduler needs to know which inputs to fix. It is rare, so the longer note is seldom seen.')}</dl>
${pics(fig('P', 'p-four-today.png', 'Today: Saturday’s publish note, “4 inputs have no OIL answer…”, ringed in yellow'), fig('P', 'p-four-named.png', 'Named: the four named, three rows, ringed in green'), fig('P', 'p-held-today.png', 'Today, three unanswered: the app names all three'))}</section>
`)
H.push(`<section id="q5"><h3><span class="qn">Question 5</span> An amendment’s publish note says “1 day with changes still held”. Should it name the day?</h3>
<p class="eg">This happens when a scheduler publishes an amendment for one day while other published days of the week also have changes waiting. My guess is weekly, in a busy week.</p>
<dl>${row('', 'Today', `${q(words('P', 'p-held', 'today'))}.`)}
${row('new', 'Named', `${q(words('P', 'p-held', 'named'))} (“Sun with changes still held” is my wording): ${rows('P', 'p-held', 'named')}, the same as today.`)}
${row('rc', 'I recommend', '<b>Name the days.</b> A day is three letters, so even several days stay short, and the scheduler sees at once which day still needs publishing.')}</dl>
${pics(fig('P', 'p-held-today.png', 'Today: “1 day with changes still held” in the middle of the note'), fig('P', 'p-held-named.png', 'Named: “Sun with changes still held”, ringed in green'), fig('P', 'b-pending.png', 'Where the held change shows: Sunday’s “1 pending”, ringed in yellow'))}</section>
`)
H.push(`<section id="q6"><h3><span class="qn">Question 6</span> On the Leave War, crediting OIL to four or more reads “OIL credits · Reaper, Anvil +2”. Should it name everyone?</h3>
<p class="eg">This happens when an admin credits OIL to several people at once on the Leave War’s OIL page, for example after a weekend exercise. My guess is a few times a month. Three or fewer are named; from four, the first two and how many more.</p>
<dl>${row('', 'Today', `${q(words('L', 'l-oil', 'today'))}, at the foot of the page, beside the amount and the date.`)}
${row('new', 'Named', `${q(words('L', 'l-oil', 'named'))}: the bar at the foot gets taller, and its date box moves down to a second row.`)}
${row('', 'Also on screen', 'Each picked name is lit in the list just above the bar.')}
${row('rc', 'I recommend', '<b>Keep it.</b> The picked names are lit just above the bar, and naming everyone makes the bar taller.')}</dl>
${pics(fig('L', 'l-oil-context.png', 'Today: the four picked names lit in the list, and “OIL credits · Reaper, Anvil +2” at the foot, ringed in yellow'), fig('L', 'l-oil-named.png', 'Named: four names; the date box drops to a second row'))}</section>
`)
H.push(`<section id="q7"><h3><span class="qn">Question 7</span> Deleting a grade asks “3 people hold Ops A: they become No grade”. Should it name them?</h3>
<p class="eg">This happens when an admin deletes a grade in the Leave War’s Grades window while people still hold it. It is rare; my guess is a few times a year.</p>
<dl>${row('', 'Today', `${q(words('L', 'l-grade', 'today'))}: ${rows('L', 'l-grade', 'today')}.`)}
${row('new', 'Named', `${q(words('L', 'l-grade', 'named'))}: ${rows('L', 'l-grade', 'named')}, the same as today. A grade held by many people would make it longer. Some grades are held by eight; I did not draw that case.`)}
${row('', 'Also on screen', 'The Grades window shows each grade with how many hold it (“3 people”), but not who.')}
${row('rc', 'I recommend', '<b>Name them.</b> Their grade is about to change, and nothing in that window says who they are.')}</dl>
${pics(fig('L', 'l-grade-today.png', 'Today: “3 people hold Ops A: they become No grade”, ringed in yellow'), fig('L', 'l-grade-named.png', `Named: ${esc(joinAnd(holders))}, ringed in green`))}</section>
`)
function joinAnd(n) { return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}` }

/* ---- not pictured ---- */
H.push(`<h2>Not pictured</h2>
<p class="lead">These four I could not make on the app in the time, or the app does not have them yet. Each gives its words as the app writes them.</p>
<section id="q8"><h3><span class="qn">Question 8</span> Placing someone who breaks several rules at once says the first warning, then “(+2 more)”.</h3>
<p class="eg">This happens when a scheduler drags or places someone on the schedule and that one move raises several new warnings, for example a clash and a crew rest breach together. How often this happens has not been measured.</p>
<dl>${row('', 'Today', 'The note at the foot gives the first new warning in full, then “(+1 more)” or “(+2 more)”. For example: “Ranger — <the first warning> (+2 more)”.')}
${row('', 'Named', 'Each warning is a sentence of its own, so naming three would make the note three sentences long.')}
${row('rc', 'I recommend', '<b>Keep it.</b> The note shows for a few seconds. Every warning is also ringed on the schedule and listed in the warning list.')}</dl>
<p class="eg">No picture: it needs a drag on the schedule that raises several warnings at once.</p></section>
<section id="q9"><h3><span class="qn">Question 9</span> Loading an earlier version says “2 requests stay as filed because they cover another day”, and two more counts like it.</h3>
<p class="eg">This happens when a scheduler loads an earlier version of a published day, for example to go back to the Original. It is uncommon; that is a guess. The note is a few short sentences, and three of them count.</p>
<dl>${row('', 'Today', '“2 requests stay as filed because they cover another day.” “2 changes to members’ inputs stay pending.” “2 inputs filed since publishing stay on the programme, pending.” One is said as “1 request stays…”.')}
${row('', 'Same note', 'The same note already names, one by one, each request that came back onto the programme.')}
${row('new', 'Named', '“Ranger’s LL and Hex’s Training stay as filed because they cover another day.” This is my wording, not drawn.')}
${row('rc', 'I recommend', '<b>Name them,</b> as the same note already names the others. Yes or no settles all three counts.')}</dl>
<p class="eg">No picture: it needs a day published, changed, then loaded back with requests that cover other days.</p></section>
<section id="q10"><h3><span class="qn">Question 10</span> Undo of opening several separate stretches for bidding reads “opening bidding 1 Mar – 7 Mar and 2 more”.</h3>
<p class="eg">This happens when an admin opens (or closes) three or more separate stretches of dates for bidding in one step on the Leave War, then presses Undo. Two stretches are named today. It is rare; that is a guess.</p>
<dl>${row('', 'Today', '“Undid: opening bidding 1 Mar – 7 Mar and 2 more”.')}
${row('new', 'Named', '“Undid: opening bidding 1 Mar – 7 Mar, 1 Apr – 7 Apr and 1 May – 7 May”. This is my wording, not drawn.')}
${row('rc', 'I recommend', '<b>Keep it.</b> It is rare, and the bidding dates window shows every stretch.')}</dl>
<p class="eg">No picture: it needs three separate stretches opened in one step.</p></section>
<section id="q11"><h3><span class="qn">Question 11</span> The SANS reminder and the SANS posting line say three days, then “and 2 more”.</h3>
<p class="eg">The reminder: a SANS member planned on days he has filed no availability for reads it in his bell. The posting line: when his SANS posting changes and some availability he filed is hidden. One rule makes the days of both lines, so one answer settles both. These lines are new: they are being built by the SANS words job, which is not live yet, and their wording is in that job’s hands. The answer would go to that job.</p>
<dl>${row('', 'As built there', '“You’re planned on Sat 18, Mon 20, Tue 21 Jul and 2 more with nothing filed.” And: “…the SANS availability you filed for Sat 18, Mon 20 Jul and 2 more is hidden…”.')}
${row('new', 'Named', '“You’re planned on Sat 18, Mon 20, Tue 21, Wed 22, Thu 23 Jul with nothing filed.” This is my wording, not drawn.')}
${row('', 'Your earlier word', 'The SANS drawing you approved on 24 Nov showed “…and 1 more”.')}
${row('rc', 'I recommend', '<b>Name every day.</b> Days are short, so even a whole week stays on about two rows.')}</dl>
<p class="eg">No picture: these lines are not in today’s app.</p></section>
`)
H.push(`<h2>Three I am unsure about</h2>
<section id="q12"><h3><span class="qn">Question 12</span> On the Leave War, the window for a picked block of four or more people is headed “5 people”.</h3>
<p class="eg">This happens when an admin drags across several people’s rows on the Leave War grid to act on a block of days at once. One to three people are named; from four, the window counts them. It is uncommon; that is a guess.</p>
<dl>${row('', 'Today', 'The window’s heading reads “5 people”, beside its dates, “9–11 Nov · 3 days”.')}
${row('', 'Why unsure', 'The rows picked are lit on the grid, but I could not check whether the window covers them on a phone.')}
${row('rc', 'I recommend', '<b>Keep it.</b> I would check on a phone first, if you want this one looked at again.')}</dl>
<p class="eg">No picture: it needs a drag across five rows of the grid.</p></section>
<section id="q13"><h3><span class="qn">Question 13</span> Bringing in holidays from a sheet: Undo says “adding 7 holidays”, and the note says “Also added: 3 holidays in 2027”.</h3>
<p class="eg">This happens when an admin brings a year’s holidays in from a sheet, once or twice a year.</p>
<dl>${row('', 'Today', 'Undo: “Undid: adding 7 holidays”. After the sheet is added: “Also added: 3 holidays in 2027.” That second note counts the holidays of other years, which are not shown in the list on screen.')}
${row('', 'Why unsure', 'A sheet can hold a dozen holidays or more, so naming them would make long notes. But the holidays of other years are not on the screen.')}
${row('rc', 'I recommend', '<b>Keep both.</b>')}</dl>
<p class="eg">No picture: it needs a sheet file to bring in.</p></section>
<section id="q14"><h3><span class="qn">Question 14</span> Undo of several inputs at once says “Undid: 3 inputs”.</h3>
<p class="eg">This happens when one step changes several separate inputs, and someone presses Undo.</p>
<dl>${row('', 'Today', '“Undid: 3 inputs”. One input is named by its person and kind, “Undid: Ranger’s OL”.')}
${row('', 'Your earlier word', 'On 3 Nov you chose this: “several at once by their count”.')}
${row('', 'Why unsure', 'Your words this week could be read as reopening it, or not.')}
${row('rc', 'I recommend', '<b>Keep it,</b> as you chose.')}</dl>
<p class="eg">No picture: I did not find a step that changes several inputs at once in the time.</p></section>
`)

/* ---- the B list ---- */
const KEEP = [
  ['The day’s “3 pending” button', 'it opens the changes it counts.'],
  ['The bell’s red number, and its “↓ 3 more” at the foot', 'one counts unread lines; the other says there is more to scroll to, as you chose on 8 Nov.'],
  ['The bell’s holiday line, “3 inputs need an OIL answer”', 'tapping it opens the list that names them, and the count goes down as each is answered.'],
  ['The warning list’s heading, “⚠ 2 issues · 3 warnings”', 'the list it heads names every one.'],
  ['The changes window: “5 changes”, and a shared input shown as “Input · Meeting · 4 people” with the names under it', 'the list below names them, as you chose on 7 Oct.'],
  ['The list of changes waiting to go out: “Range safety brief · 4 people”, with the names under it', 'the names are listed right there.'],
  ['The Inputs calendar’s “+2 more” and a shared bar’s “4 · Meeting”', 'tapping opens the day with every name; you chose the bar’s count on 10 Oct.'],
  ['A Leave War day’s “+2” corner, and the bidding chip’s “Open 1 Apr – 30 Jun +1”', 'each opens the full list.'],
  ['“Published AL1 · 1 item on Sat only”', 'the number of items is the size of the amendment, and they are on the schedule.'],
  ['“3 differences from AL1 are pending” after switching to a saved plan', 'it is the same count as the day’s pending button, which opens them.'],
  ['“2 inputs need an OIL answer.” after a load or a plan switch', 'the note opens the list that names them.'],
  ['“OIL answered for 3 inputs”', 'he has just answered them himself in that list.'],
  ['The input window’s “3 picked”', 'each one is lit right beside it.'],
  ['The Grades window’s “3 people” beside each grade', 'it is how many hold the grade; deleting one is question 7.'],
  ['Leave War notes such as “3 days filed. 2 days were not yours to change”, “2 of 5 days deleted”, and the picked block’s “3 days”', 'the days are the ones he just picked.'],
  ['The Approvals page’s “3 pending · 1 new”, and “+2 pending in JAN – DEC 27 ›”', 'tapping opens them.'],
  ['OIL and leave figures: balances, “2 OIL awards (Sat 18 Jul, Sun 19 Jul)”, “half a day”, “3 days”', 'the number is the fact, and the awards are already named.'],
  ['Admin and Logic: “Cleared 12 items”, “3 rules back to squadron standard”, “2 new bug reports”, “3 reports, newest first”', 'each counts what was just done, or a list shown below.'],
  ['The Tracker: “3 events deleted — Undo restores them”, and its fail totals', 'the events were just picked; the fails are listed.'],
  ['The Insights tiles: sorties, formations, warnings', 'the numbers are the point.'],
]
H.push(`<div class="keep" id="keep"><h2>Kept as they are unless you say otherwise</h2>
<p class="eg">Each of these numbers is the fact itself, or tapping it opens the list it counts. One line each, with why it stays.</p>
<ul>${KEEP.map(([a, b]) => `<li><b>${esc(a)}</b>: ${esc(b)}</li>`).join('')}</ul>
${pics(fig('P', 'b-pending.png', 'A button that opens what it counts: “1 pending”'), fig('L', 'b-holds.png', 'A count beside a thing: “3 people” beside the grade Ops A'), fig('S', 's-title-today.png', 'A count beside what it counts: “3 picked”, with the three lit below'))}
</div>
</main>
<div id="big" hidden tabindex="-1" role="dialog" aria-label="Enlarged picture"><img alt=""></div>
<script>
(function(){var b=document.getElementById('big'),i=b.querySelector('img'),from=null;
function shut(){b.hidden=true;i.removeAttribute('src');if(from)from.focus()}
document.addEventListener('click',function(e){var z=e.target.closest&&e.target.closest('.zoom');if(z){from=z;i.src=z.querySelector('img').src;i.alt=z.querySelector('img').alt;b.hidden=false;b.scrollTop=0;b.focus();return}if(!b.hidden&&b.contains(e.target))shut()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!b.hidden)shut()})})();
</script>
</body></html>
`)
const page = H.join('')
writeFileSync(PAGE, page)
console.log('page', PAGE, Math.round(page.length / 1024) + ' KB', 'pictures', new Set(used).size)
