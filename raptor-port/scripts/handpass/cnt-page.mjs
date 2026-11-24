// THE QUESTIONS PAGE for the look for other counts (his D2603 — chat 170's night of 25 Nov 26, job 2). Drafted by an
// Opus helper; its words read and adjusted by a fresh Fable reader on 25 Nov 26 (his D2441): the order, the numbers and what
// changed are in the notes file beside the brief (§The words read).
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
<p class="lead"><b>Nothing in the app has changed. These are questions for you.</b> On 24 Nov, after agreeing that the bell says every change, you wrote: “See what else in the app also has this existing numerical change and perhaps its better to say everything instead.” I looked through the whole app, and it comes to fourteen questions. For five I recommend naming the things. For nine I recommend keeping the number, because the things are already shown beside it or the names would make a long line. Each is your call.</p>
<p class="lead">Every picture is the real app at iPhone size. The words a question is about are ringed in yellow. Where a picture shows the things named, those words were put into the app’s own box on the screen, so the letters and the way they wrap are the app’s; they are ringed in green. A row is one line of letters across the phone. Tap any picture to enlarge it.</p>
`)

/* ---- what to look at now: the ones recommended to change first, then the ones recommended kept (answerable together) ---- */
const ASKS = [
  'I recommend naming the things: questions 1 to 5',
  ['q1', '1. Deleting an input for several people asks “Delete this input for all 3 people?”. Should it name them?', 'I recommend: Name them. When the question shows, the people have scrolled out of sight.'],
  ['q2', '2. The note after publishing says “4 inputs have no OIL answer”. Should it name all four?', 'I recommend: Name them all. Up to three are already named, and the count does not say which inputs.'],
  ['q3', '3. Deleting a grade asks “3 people hold Ops A: they become No grade”. Should it name them?', 'I recommend: Name them. Nothing in that window shows who holds the grade.'],
  ['q4', '4. The note after publishing an amendment says “1 day with changes still held”. Should it name the day?', 'I recommend: Name the days. They are short: “Sun”, or “Sat, Sun”.'],
  ['q5', '5. Not in the app yet: the new SANS reminder names three days, then says “and 2 more”. Should it name every day?', 'I recommend: Name every day. A member needs each day to know what to file for. No picture: these lines are still being built.'],
  'I recommend keeping the number: questions 6 to 14. “Keep 6 to 14” is an answer, or name any you want changed',
  ['q6', '6. An input for several people is titled “Ace +2” in its window. Should the title name everyone?', 'I recommend: Keep “Ace +2”. The people are picked just below the title, and a long title is cut off on a phone.'],
  ['q7', '7. After “Undo”, the note says “Undid: Training for 3 people”, and the note after publishing counts three people the same way. Should both name them?', 'I recommend: Keep the count for three or more. One small change with it: two people are named after “Undo” too.'],
  ['q8', '8. On the Leave War, crediting OIL to four or more reads “OIL credits · Reaper, Anvil +2”. Should it name everyone?', 'I recommend: Keep it. The picked names are lit in the list above. This one is close.'],
  ['q9', '9. Loading an earlier version says “2 requests stay as filed because they cover another day”, and two more counts like it. Should they be named?', 'I recommend: Keep the counts. On 15 Oct you asked for this note to be shortened. No picture.'],
  ['q10', '10. Placing someone who breaks several rules at once gives the first warning, then “(+2 more)”. Should the note give every warning?', 'I recommend: Keep it. Every warning is in the warning list. No picture.'],
  ['q11', '11. After “Undo” of several inputs at once, the note says “Undid: 3 inputs”. Should it name them?', 'I recommend: Keep it, as you agreed on 3 Nov. No picture.'],
  ['q12', '12. After “Undo” of opening several stretches of dates for bidding, the note reads “opening bidding 1 Mar – 7 Mar and 2 more”. Should it name every stretch?', 'I recommend: Keep it. My guess is that it is rare, and the bidding dates window shows every stretch. No picture.'],
  ['q13', '13. Bringing in holidays from a sheet says “adding 7 holidays” and “Also added: 3 holidays in 2027”. Should they be named?', 'I recommend: Keep both. A sheet can hold a whole year of holidays. No picture.'],
  ['q14', '14. On the Leave War, the window for a picked block of four or more people is headed “5 people”. Should it name them?', 'I recommend: Keep it for now. I could not check it on a phone. No picture.'],
]
const NQ = ASKS.filter(a => Array.isArray(a)).length
H.push(`<div class="asks">\n<h2>What to look at now: ${NQ} questions, then one list</h2>
<p class="news">Seven questions have pictures. Seven have none: six because the case could not be set up in the app in the time, and question 5 because its lines are not in the app yet. Those seven give the app’s words exactly.</p>
<p class="news">Not asked here, because the bell page already asks them: the bell’s “3 people added” (question 5 there) and joining two names with “and” (question 6 there). The bell’s “and 1 more change” you have settled: it will say every change.</p>
<ol>` + ASKS.map(a => (Array.isArray(a) ? `<li><a href="#${a[0]}"><b>${esc(a[1])}</b></a><span class="rec">${esc(a[2])}</span></li>` : `<li class="grp">${esc(a)}</li>`)).join('') + `</ol>
<p class="news"><b>Last, one list:</b> <a href="#keep">the counts I recommend keeping as they are</a>, because the number is the point, or the things it counts are listed beside it or one tap away. One answer covers the list.</p>
</div>\n`)

/* the long amendment note, cut to the part a question is about (the words are the runs', only shortened with "…") */
const heldParts = k => words('P', 'p-held', k).split(' · ')
const heldHead = k => heldParts(k).slice(0, 4).join(' · ') + ' · …'
const heldTail = '…' + heldParts('today').slice(4).join(' · ').replace(/^[^:]*: /, '')
function joinAnd(n) { return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}` }

/* ---- 1 to 5: recommended to name the things ---- */
H.push('<h2>I recommend naming the things</h2>\n')
H.push(`<section id="q1"><h3><span class="qn">Question 1</span> Deleting an input for several people asks “Delete this input for all 3 people?”. Should it name them?</h3>
<p class="eg">This happens when someone deletes an input that has several people in it, such as a Training for three, from the input’s window or the Inputs calendar. How often has not been measured; my guess is a few times a week.</p>
<dl>${row('', 'Today', `${q(words('S', 's-delete', 'today'))} After the delete a note says how many again: for an input of ten, ${q(words('S', 's-deleted', 'today'))}.`)}
${row('new', 'Named', `${q(words('S', 's-delete', 'named'))} takes ${rows('S', 's-delete', 'named')}. For ten people the question takes ${rows('S', 's-delete10', 'named')}, and the note after it ${rows('S', 's-deleted', 'named')}.`)}
${row('', 'Also on screen', peopleInView ? 'The people are still in view when the question shows.' : 'When “Delete” is pressed, the question shows at the foot of the window. The list of people has scrolled out of sight by then, so the screen does not show who will lose the input.')}
${row('', 'Same count', `Other sentences about an input for several people count the same way: “Take yourself out of this input? It stays for the other 2 people.”, “Input added for 3 people”, and on the schedule “3 people's Training is already on the programme” and “Filing 3 people's Training under Unavailable”. Answer “name them” and these name the people too: “Ace, Hex and Ranger's Training is already on the programme” (not drawn).`)}
${row('', 'Your earlier word', 'One more line in the input’s window has the count: “Date changes apply to all 3.” On 10 Oct you approved that line as it was drawn (“Date changes apply to all 4.”). I recommend it stays as you approved it.')}
${row('rc', 'I recommend', '<b>Name them,</b> in the delete question, its note and the sentences under “Same count”. A delete takes the input from every person in it while the screen does not show who they are, and even ten names fit in the question’s box.')}</dl>
${pics(fig('S', 's-delete-today.png', 'Today: “Delete this input for all 3 people?”, ringed in yellow, above the “Delete” button'), fig('S', 's-delete-named.png', 'Named: “Delete this input for Ace, Hex and Ranger?”, ringed in green'), fig('S', 's-delete10-named.png', 'Named, ten people: three rows in the same box'), fig('S', 's-deleted-today.png', 'Today: the note “Input deleted for 10 people”'), fig('S', 's-deleted-named.png', 'Named: the same note with the ten names, two rows'))}</section>
`)
H.push(`<section id="q2"><h3><span class="qn">Question 2</span> The note after publishing says “4 inputs have no OIL answer”. Should it name all four?</h3>
<p class="eg">This happens when a scheduler publishes a weekend day or a holiday while four or more of its inputs still have no OIL answer, because “Later” was pressed when the sign-off asked the OIL question. My guess is that four or more at once is rare; it has not been measured.</p>
<dl>${row('', 'Today', `${q(words('P', 'p-four', 'today'))}: ${rows('P', 'p-four', 'today')}. Up to three inputs are named today, as the third picture shows: ${q(heldTail)}.`)}
${row('new', 'Named', `${q(words('P', 'p-four', 'named'))}: ${rows('P', 'p-four', 'named')}.`)}
${row('', 'What it costs', 'Every input more makes the note longer: eight would be about five rows (worked out from the picture, not drawn). A note stays on screen longer the longer it is, but never more than 12 seconds.')}
${row('', 'Not asked before', 'On 22 Nov you agreed how this note names one input (“Ranger’s Training”, “Ranger and Hex’s Training”). You have not been asked about counting four or more inputs. That was the builder’s choice.')}
${row('rc', 'I recommend', '<b>Name them all.</b> The note says nobody on those inputs earns OIL, and a count does not tell the scheduler which inputs it means. My guess is that it is rare, so the longer note would seldom be seen.')}</dl>
${pics(fig('P', 'p-four-today.png', 'Today: Saturday’s note, “4 inputs have no OIL answer…”, ringed in yellow'), fig('P', 'p-four-named.png', 'Named: the four named, three rows, ringed in green'), fig('P', 'p-held-today.png', 'Today, three unanswered: the app names all three'))}
<p class="eg">How the pictures were made: the four Trainings were put into the day without an OIL answer directly, because the input’s window always asks the question. Signing off, publishing and the note are the real app.</p></section>
`)
H.push(`<section id="q3"><h3><span class="qn">Question 3</span> Deleting a grade asks “3 people hold Ops A: they become No grade”. Should it name them?</h3>
<p class="eg">This happens when an admin deletes a grade in the Leave War’s Grades window while people still hold it. My guess is a few times a year; it has not been measured.</p>
<dl>${row('', 'Today', `${q(words('L', 'l-grade', 'today'))}: ${rows('L', 'l-grade', 'today')}.`)}
${row('new', 'Named', `${q(words('L', 'l-grade', 'named'))}: ${rows('L', 'l-grade', 'named')}, the same as today. A grade held by more people makes it longer: some grades are held by eight, which would be about three rows (worked out from the picture, not drawn).`)}
${row('', 'Also on screen', 'The Grades window shows each grade with how many hold it (“3 people”), but not who.')}
${row('rc', 'I recommend', '<b>Name them.</b> Their grade is about to become No grade, and nothing in that window says who they are.')}</dl>
${pics(fig('L', 'l-grade-today.png', 'Today: “3 people hold Ops A: they become No grade”, ringed in yellow'), fig('L', 'l-grade-named.png', `Named: ${esc(joinAnd(holders))}, ringed in green`))}</section>
`)
H.push(`<section id="q4"><h3><span class="qn">Question 4</span> The note after publishing an amendment says “1 day with changes still held”. Should it name the day?</h3>
<p class="eg">This happens when a scheduler publishes an amendment for one day while other published days of the week also have changes waiting to be published. My guess is weekly, in a busy week; it has not been measured.</p>
<dl>${row('', 'Today', `${q(heldHead('today'))} The note does not say which day.`)}
${row('new', 'Named', `${q(heldHead('named'))} The whole note takes ${rows('P', 'p-held', 'named')}, the same as today. Two days would read “Sat, Sun with changes still held”. Both are my wording.`)}
${row('rc', 'I recommend', '<b>Name the days.</b> A day is three letters, so even several days stay short, and the scheduler sees at once which days still need publishing.')}</dl>
${pics(fig('P', 'p-held-today.png', 'Today: “1 day with changes still held” in the middle of the note'), fig('P', 'p-held-named.png', 'Named: “Sun with changes still held”, ringed in green'), fig('P', 'b-pending.png', 'Where the held change shows: Sunday’s “1 pending”, ringed in yellow'))}</section>
`)
H.push(`<section id="q5"><h3><span class="qn">Question 5</span> Not in the app yet: the new SANS reminder names three days, then says “and 2 more”. Should it name every day?</h3>
<p class="eg"><b>You cannot see these lines in the app today.</b> They are part of the new SANS words you said “Go” to on 24 Nov, still being built and not live. That job holds their wording, and your answer would be passed to it. Once they are live: a SANS member planned on days he has filed no availability for reads the reminder in his bell; and when his SANS posting changes so that availability he filed is hidden, a second line says for which days. How often a member has more than three such days has not been measured.</p>
<dl>${row('', 'As built there', `The reminder: “You're planned on Sat 18, Mon 20, Tue 21 Jul and 2 more with nothing filed. Tap to file for availability.” The second line: “You're active again, so the SANS availability you filed for Sat 18, Mon 20, Tue 21 Jul and 2 more is hidden. It comes back if you're SANS those days again.” Both name three days, then count. One answer settles both.`)}
${row('new', 'Named', `“You're planned on Sat 18, Mon 20, Tue 21, Wed 22, Thu 23 Jul with nothing filed. Tap to file for availability.” (my wording, not drawn). Ten days would be about three rows in the bell (worked out, not drawn).`)}
${row('', 'Your earlier word', 'The drawing you said “Go” to showed the reminder with “Thu 16, Sat 18, Mon 20 Jul and 1 more”. You were not asked about the “and 1 more” on its own; counting past three days was the builder’s choice. The second line was never shown to you with a count.')}
${row('rc', 'I recommend', '<b>Name every day.</b> The reminder is there so that he files for those days, and a day inside “and 2 more” is one he has to find himself. The line gets shorter as he files.')}</dl>
<p class="eg">No picture: these lines are not in today’s app.</p></section>
`)

/* ---- 6 to 14: recommended kept — answerable together ---- */
H.push(`<h2>I recommend keeping the number</h2>
<p class="lead">“Keep 6 to 14” is an answer to all nine. Or answer any one of them on its own. Questions 6, 7 and 8 have pictures; 9 to 14 do not, and each says why.</p>
<section id="q6"><h3><span class="qn">Question 6</span> An input for several people is titled “Ace +2” in its window. Should the title name everyone?</h3>
<p class="eg">This happens whenever someone opens an input that has several people in it, such as a Training for three, from the Inputs page or the schedule. How often has not been measured; my guess is several times a day.</p>
<dl>${row('', 'Today', `${q(words('S', 's-title', 'today'))}: the first name from A to Z, then how many more. With ten people: ${q(words('S', 's-title10', 'today'))}.`)}
${row('new', 'Named', `${q(words('S', 's-title', 'named'))} fits on ${rows('S', 's-title', 'named')}. ${titleCut ? 'With ten people the title is cut off with “…” after five names and part of a sixth, and the date at its end is cut off with them, because a window’s title stays on one row.' : ''}`)}
${row('', 'Also on screen', 'Just under the title the window says “3 picked”, and each picked person is lit in the list of people below it.')}
${row('', 'Your earlier word', 'On 10 Oct you ruled that an input’s card, and the desktop Inputs list, name everyone, never “+1”. Your words about the card: “Instead of doing a +1 hiding the info”. The window’s title was not part of that question. My reading is that the title hides nothing, because the people are picked just below it. That is a reading, so it is your call.')}
${row('', 'Not covered', 'The same short name is also in the OIL question’s heading (“OIL: Ace +2, Training”) and a few other questions (“Open Ace +2’s input and lose them?”), where the people may not be in view. Those were not pictured or checked. Answer “name everyone” and they change with the title; keep “Ace +2” and I recommend they are pictured and put to you next.')}
${row('rc', 'I recommend', '<b>Keep “Ace +2” in the title.</b> The people are picked just below it, and a title of every name is cut off on a phone unless the title is redesigned to wrap.')}</dl>
${pics(fig('S', 's-title-today.png', 'Today: the window title “Ace +2 · 15 Jul”, ringed in yellow, with “3 picked” below it'), fig('S', 's-title-named.png', 'Named: “Ace, Hex, Ranger · 15 Jul”, ringed in green, on one row'), fig('S', 's-title10-named.png', 'Named, ten people: the title is cut off with “…” in the sixth name, and the date is lost'))}</section>
`)
H.push(`<section id="q7"><h3><span class="qn">Question 7</span> After “Undo”, the note says “Undid: Training for 3 people”, and the note after publishing counts three people the same way. Should both name them?</h3>
<p class="eg">After “Undo”: whenever someone presses “Undo” or “Redo” after changing an input that has several people in it. My guess is daily; it has not been measured. After publishing: when a weekend day or a holiday is published while an input for three or more people has no OIL answer. My guess is that this is rare.</p>
<dl>${row('', 'Today', `After “Undo”: one person is named, “Undid: Ranger’s Training”; two or more are counted, “Undid: Training for 2 people”, ${q(words('S', 's-undo', 'today'))}. After publishing: one or two are named, “Ranger and Hex’s Training”; three or more are counted: ${q(words('P', 'p-three', 'today'))}`)}
${row('new', 'Named', `${q(words('S', 's-undo', 'named'))}: ${rows('S', 's-undo', 'named')}. After publishing: ${q(words('P', 'p-three', 'named'))}: ${rows('P', 'p-three', 'named')}, the same as today. With ten people, ten names would come before the word “Training” in both notes.`)}
${row('', 'Your earlier word', 'On 22 Nov you answered “all as recommended” on the publish note’s words; as recorded, one or two people are named and three or more read “Training for 3 people”. That was two days before your words of 24 Nov; whether they reopen it is my reading, so I ask. On 3 Nov you answered “as recommended” on the words after “Undo”; as recorded, an input is named by its person and kind (“Undid: Drifter’s ISR brief”). An input with several people was not part of that question: “Training for 3 people” there was the builder’s choice.')}
${row('rc', 'I recommend', '<b>Keep the count for three or more, in both notes.</b> The note after “Undo” shows for a few seconds to the person who has just made the change, and with many people the input’s name would be lost behind the names. One small change with it: after “Undo”, two people are named as the publish note names them, “Undid: Ranger and Hex’s Training”, where it says “Training for 2 people” today (not drawn). If you want everyone named, both notes would change together.')}</dl>
${pics(fig('S', 's-undo-today.png', 'Today: the note “Undid: Training for 3 people”, ringed in yellow'), fig('S', 's-undo-named.png', 'Named: “Undid: Ace, Hex and Ranger’s Training”, ringed in green'), fig('P', 'p-three-today.png', 'Today: Sunday’s note after publishing, “Training for 3 people has no OIL answer…”'), fig('P', 'p-three-named.png', 'Named: the same note naming Ace, Hex and Ranger'))}</section>
`)
H.push(`<section id="q8"><h3><span class="qn">Question 8</span> On the Leave War, crediting OIL to four or more reads “OIL credits · Reaper, Anvil +2”. Should it name everyone?</h3>
<p class="eg">This happens when an admin credits OIL to several people at once on the Leave War’s OIL page, for example after a weekend exercise. My guess is a few times a month; it has not been measured. Up to three names are shown; from four, the first two and how many more.</p>
<dl>${row('', 'Today', `${q(words('L', 'l-oil', 'today'))}, in the bar at the foot of the page, beside the amount and the date.`)}
${row('new', 'Named', `${q(words('L', 'l-oil', 'named'))}: the bar gets taller, and its date box moves down to a second row. More names would make it taller still; that was not drawn.`)}
${row('', 'Also on screen', 'Each picked name is lit in the list above the bar. The list is longer than the screen, so a picked name can be scrolled out of sight. I did not check that case.')}
${row('', 'Your earlier word', 'On 10 Oct you took “+1” off an input’s card (“Instead of doing a +1 hiding the info”). This bar was not part of that question, so I ask.')}
${row('rc', 'I recommend', '<b>Keep it,</b> but this one is close. For keeping: the picked names are lit in the list, and naming everyone makes the bar taller. For naming: this bar is where OIL is given, and “+2” does not say to whom.')}</dl>
${pics(fig('L', 'l-oil-context.png', 'Today: the four picked names lit in the list, and “OIL credits · Reaper, Anvil +2” at the foot, ringed in yellow'), fig('L', 'l-oil-named.png', 'Named: four names; the date box drops to a second row'))}</section>
`)
H.push(`<section id="q9"><h3><span class="qn">Question 9</span> Loading an earlier version says “2 requests stay as filed because they cover another day”, and two more counts like it. Should they be named?</h3>
<p class="eg">This happens when a scheduler loads an earlier version of a published day onto the working copy, for example to go back to the Original, and some requests or members’ changes are left as they were. My guess is that it is uncommon; it has not been measured. The note is several short sentences, and three of them give a count.</p>
<dl>${row('', 'Today', `“2 requests stay as filed because they cover another day.” “2 changes to members' inputs stay pending.” “2 inputs filed since publishing stay on the programme, pending.”`)}
${row('new', 'Named', '“Ranger’s LL and Hex’s Training stay as filed because they cover another day.” (my wording, not drawn). Each of the three sentences would grow by its names.')}
${row('', 'Same note', 'The same note already names a request that came back onto the programme, for example “Det prep is on Friday again too.”')}
${row('', 'Also on screen', 'Two of the three sentences say “pending”, and the day’s “pending” button opens the list of those changes. I did not find where the requests of the first sentence are listed.')}
${row('', 'Your earlier word', 'On 15 Oct you asked for this note to be shortened (“Shorten it”), and it became short sentences. Naming makes it longer again. Your words of 24 Nov are the later ones; whether they cover this note is my reading, so I ask.')}
${row('rc', 'I recommend', '<b>Keep the counts.</b> You asked for this note to be shorter, and the day’s “pending” button lists what two of its sentences count. One answer settles all three; if you want only the first sentence named, say so.')}</dl>
<p class="eg">No picture: it needs a day published, changed, then loaded back with requests that cover other days.</p></section>
<section id="q10"><h3><span class="qn">Question 10</span> Placing someone who breaks several rules at once gives the first warning, then “(+2 more)”. Should the note give every warning?</h3>
<p class="eg">This happens when a scheduler places or drags someone on the schedule and that one move raises several new warnings, for example a clash and a crew rest breach together. How often one move raises several has not been measured.</p>
<dl>${row('', 'Today', 'The note at the foot gives the first new warning in full, then “(+1 more)” or “(+2 more)”.')}
${row('new', 'Named', 'Each warning is a sentence of its own, so three warnings would make the note three sentences long (not drawn).')}
${row('', 'Also on screen', 'Every one of the new warnings is in the warning list, and the people in them are marked on the schedule.')}
${row('rc', 'I recommend', '<b>Keep it.</b> The note is on screen for a few seconds, and the warning list has every warning in full.')}</dl>
<p class="eg">No picture: it needs one move on the schedule that raises several warnings at once.</p></section>
<section id="q11"><h3><span class="qn">Question 11</span> After “Undo” of several inputs at once, the note says “Undid: 3 inputs”. Should it name them?</h3>
<p class="eg">This would show when one step changes several separate inputs and someone then presses “Undo”. In the time I did not find which action in the app changes several inputs in one step, so I cannot say how often it is seen.</p>
<dl>${row('', 'Today', '“Undid: 3 inputs”. One input is named by its person and kind: “Undid: Ranger’s OL”.')}
${row('new', 'Named', '“Undid: Ranger’s OL, Hex’s Training and Ace’s LL” (my wording, not drawn).')}
${row('', 'Your earlier word', 'On 3 Nov you answered “as recommended” on these words. As recorded: one input by its person and kind, several at once by their count, “Undid: 3 inputs”. Your words of 24 Nov are the later ones; whether they reopen this is my reading, so I ask.')}
${row('rc', 'I recommend', '<b>Keep it,</b> as you agreed on 3 Nov.')}</dl>
<p class="eg">No picture: no step that changes several inputs at once was found in the time.</p></section>
<section id="q12"><h3><span class="qn">Question 12</span> After “Undo” of opening several stretches of dates for bidding, the note reads “opening bidding 1 Mar – 7 Mar and 2 more”. Should it name every stretch?</h3>
<p class="eg">This happens when an admin opens or closes three or more separate stretches of dates for bidding in one step on the Leave War, then presses “Undo”. My guess is that it is rare; it has not been measured.</p>
<dl>${row('', 'Today', '“Undid: opening bidding 1 Mar – 7 Mar and 2 more”. Two stretches are both named: “1 Mar – 7 Mar and 1 Apr – 7 Apr”.')}
${row('new', 'Named', '“Undid: opening bidding 1 Mar – 7 Mar, 1 Apr – 7 Apr and 1 May – 7 May” (my wording, not drawn).')}
${row('rc', 'I recommend', '<b>Keep it.</b> My guess is that it is rare, and the bidding dates window shows every stretch.')}</dl>
<p class="eg">No picture: it needs three separate stretches opened in one step.</p></section>
<section id="q13"><h3><span class="qn">Question 13</span> Bringing in holidays from a sheet says “adding 7 holidays” and “Also added: 3 holidays in 2027”. Should they be named?</h3>
<p class="eg">This happens when an admin brings a year’s holidays in from a sheet. My guess is once or twice a year.</p>
<dl>${row('', 'Today', 'After “Undo”: “Undid: adding 7 holidays”. After a sheet is added: “Also added: 3 holidays in 2027.” That second note counts the holidays of other years, which are not in the list on screen.')}
${row('new', 'Named', 'Each note would list the holidays by name. A sheet can hold a dozen or more, so a note could be a dozen names long (not drawn).')}
${row('rc', 'I recommend', '<b>Keep both.</b> A dozen names is too long for a note that is on screen for a few seconds.')}</dl>
<p class="eg">No picture: it needs a sheet file to bring in.</p></section>
<section id="q14"><h3><span class="qn">Question 14</span> On the Leave War, the window for a picked block of four or more people is headed “5 people”. Should it name them?</h3>
<p class="eg">This happens when an admin drags across several people’s rows on the Leave War grid to act on a block of days at once. My guess is that it is uncommon; it has not been measured.</p>
<dl>${row('', 'Today', 'The window’s heading reads “5 people”, beside its dates, “9–11 Nov · 3 days”. One to three people are named; from four they are counted.')}
${row('new', 'Named', 'Five callsigns in the heading. Whether they fit beside the dates on a phone was not drawn.')}
${row('', 'Also on screen', 'The picked rows are lit on the grid, but I could not check whether the window covers them on a phone.')}
${row('rc', 'I recommend', '<b>Keep it for now.</b> If you want this one looked at, it would be checked on a phone first and put to you with a picture.')}</dl>
<p class="eg">No picture: it needs a drag across five rows of the grid.</p></section>
`)

/* ---- the list: counts that are the fact, or that sit beside or open what they count ---- */
const KEEP = [
  ['The day’s “3 pending” button', 'it opens the changes it counts.'],
  ['The bell’s red number, and its “↓ 3 more” at the foot', 'one counts unread lines; the other says how many more lines are below. The same “↓ 3 more” is on the Leave War’s day panel, where you agreed it on 8 Nov.'],
  ['The bell’s holiday line, “3 inputs need an OIL answer”', 'tapping it opens the list that names them, and the count goes down as each is answered.'],
  ['The warning list’s heading, “⚠ 2 issues · 3 warnings”', 'the list it heads names every one.'],
  ['The changes window: “5 changes”, and a shared input shown as “Input · Meeting · 4 people” with the names under it', 'the names are listed under it, as you chose on 7 Oct.'],
  ['The list of changes waiting to go out: “Range safety brief · 4 people”, with the names under it', 'the names are listed right there.'],
  ['The Inputs calendar’s “+2 more” and a shared bar’s “4 · Meeting”', 'tapping opens the day with every name; you approved the bar’s count as drawn on 10 Oct.'],
  ['The Inputs page’s group headings, “4 inputs · 2 on programme”', 'each heads the list it counts.'],
  ['A Leave War day’s “+2” corner, and the bidding chip’s “Open 1 Apr – 30 Jun +1”', 'each opens the full list.'],
  ['“Published AL1 · 1 item on Sat only”', 'the number of items is the size of the amendment, and they are on the schedule.'],
  ['“3 differences from AL1 are pending” after switching to a saved plan', 'it is the same count as the day’s “pending” button, which opens them.'],
  ['“2 inputs need an OIL answer.” after a load or a plan switch', 'the note opens the list that names them.'],
  ['“OIL answered for 3 inputs”', 'the scheduler has just answered them in that list.'],
  ['The input window’s “3 picked”', 'each one is lit right beside it.'],
  ['The Grades window’s “3 people” beside each grade', 'it is how many hold the grade; deleting one is question 3.'],
  ['Leave War notes such as “3 days filed. 2 days were not yours to change”, “2 of 5 days deleted”, and the picked block’s “3 days”', 'the days are the ones just picked.'],
  ['The Approvals page’s “3 pending · 1 new”, and “+2 pending in JAN – DEC 27 ›”', 'tapping opens them.'],
  ['OIL and leave figures: balances, “2 OIL awards (Sat 18 Jul, Sun 19 Jul)”, “half a day”, “3 days”', 'the number is the fact, and the awards are already named.'],
  ['Admin and Logic: “Cleared 12 items”, “3 rules back to squadron standard”, “2 new bug reports”, “3 reports, newest first”', 'each counts what was just done, or a list shown below.'],
  ['The Tracker: “3 events deleted — Undo restores them”, and its fail totals', 'the events were just picked; the fails are listed.'],
  ['The Insights tiles: sorties, formations, warnings', 'the numbers are the point.'],
  ['Settings and limits, such as “2 waves · 3 duty blocks” and “Next 2 weeks”', 'each is a setting’s own value.'],
]
H.push(`<div class="keep" id="keep"><h2>One list: counts I recommend keeping as they are</h2>
<p class="eg">In each of these the number is the fact itself, or the things it counts are listed beside it or one tap away. That sorting is mine, so it is still your call. “Keep the list” is an answer. Or name any line you want put to you as a question of its own, with pictures.</p>
<ul>${KEEP.map(([a, b]) => `<li><b>${esc(a)}</b>: ${esc(b)}</li>`).join('')}</ul>
${pics(fig('P', 'b-pending.png', 'A button that opens what it counts: “1 pending”'), fig('L', 'b-holds.png', 'A count beside a thing: “3 people” beside the grade Ops A'), fig('S', 's-title-today.png', 'A count beside what it counts: “3 picked”, with the people picked below it'))}
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
