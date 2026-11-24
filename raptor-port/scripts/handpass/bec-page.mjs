// THE QUESTIONS PAGE for the bell's "every change" line (chat 170's night of 25 Nov 26, job 1). Drafted by an Opus
// helper; its words read and adjusted by a fresh Fable reader the same night (his D2441), before the host publishes it.
// Reads the drawing runs' bec.json (bec-draw.mjs), copies the pictures the page shows into
// docs/img/handpass/2026-11-25-bell-every-change/, and writes docs/mock/bell-every-change.html with every picture
// embedded, so the page opens alone. Every line the app prints is read from the runs, never typed here; a candidate
// wording (an option, an "other way") is typed here and said on the page to be a wording, not a picture.
//   node scripts/handpass/bec-page.mjs [runs folder, default D:/rw4/night1]
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUNS = process.argv[2] || 'D:/rw4/night1'
const PICS = join(HERE, '../../docs/img/handpass/2026-11-25-bell-every-change')
const PAGE = join(HERE, '../../docs/mock/bell-every-change.html')
mkdirSync(PICS, { recursive: true })
const J = f => ({ ...JSON.parse(readFileSync(join(RUNS, f, 'bec.json'), 'utf8')), dir: f })
/* "every change" from the scratch build when it was made (every-A); else the fallback that swaps the words on today's
   build (swap-A, BEC_SWAP=1 — the notes say which the page shows) */
const EVERY = existsSync(join(RUNS, 'every-A', 'bec.json')) ? 'every-A' : 'swap-A'
const TA = J('today-A'), EA = J(EVERY), TB = J('today-B')
console.log('every change from', EVERY)
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
/* the line's second row, as the bell prints it: what changed · who */
const what = (run, c, where = 'phone') => { const x = run.cases[c] && run.cases[c][where]; if (!x || !x.text) throw new Error(`no ${c} ${where} in ${run.tag}`); return x.text.split(' / ').slice(1).join(' / ') }
const head = (run, c, where = 'phone') => run.cases[c][where].text.split(' / ')[0]
const rows = (run, c, where = 'phone') => run.cases[c][where].rows
const rowsSaid = n => (n === 1 ? 'one row' : `${['', '', 'two', 'three', 'four', 'five', 'six'][n] || n} rows`)
const used = []
function fig(run, c, where, cap) {
  const dir = run.dir, file = `${run.tag}-${c}-${where}.png`
  const src = join(RUNS, dir, file)
  if (!existsSync(src)) throw new Error('no picture ' + src)
  copyFileSync(src, join(PICS, file)); used.push(file)
  const data = 'data:image/png;base64,' + readFileSync(src).toString('base64')
  return `<figure><button type="button" class="zoom" aria-label="Enlarge: ${esc(cap)}"><img src="${data}" alt="${esc(cap)}" loading="lazy"></button><figcaption>${cap}</figcaption></figure>`
}
const pics = (...f) => `<div class="pics">${f.join('')}</div>`
const row = (cls, dt, dd) => `<div${cls ? ` class="${cls}"` : ''}><dt>${dt}</dt><dd>${dd}</dd></div>`
const q = s => `“${esc(s)}”`
/* a line of today's bell as a question's title quotes it: without who did it */
const bare = (run, c) => what(run, c).replace(/ · Saber$/, '')
const r = (c, where = 'phone') => rowsSaid(rows(EA, c, where))

/* the cases of question 1, each today beside every change */
const CASES = [
  ['c1', 'Two changes: nothing changes', `Saber moves Ranger’s Training from Mon 13 to Tue 14 Jul and changes its remark, in one save.`],
  ['c2', 'Three changes', `Saber moves “Training” from Wed 15 to Thu 16 Jul, gives it the title “Range brief” and changes its remark.`],
  ['c3a', 'Four changes', `Saber moves “Range brief” from Fri 17 to Mon 20 Jul and starts it at 08:00 instead of 09:00 (the bell says a new day and a new time as one change), adds Ace, renames it “Range talk” and changes its remark.`],
  ['c3b', 'Five changes, one of them the kind', `Saber moves “Range brief” from Tue 21 to Wed 22 Jul and starts it at 08:00 instead of 09:00, adds Ace, makes the Training a Meeting, renames it “Range talk” and changes its remark.`],
  ['c3c', 'A leave: its day, a half day and its kind', `Saber changes Ranger’s LL on Thu 23 Jul to an OL on the morning of Fri 24 Jul, and changes its remark.`],
  ['c4', 'The longest line one save can make: seven changes', ''],
  ['c5', 'A change that replaces a Leave War bid', `Ranger has bid LL on Fri 11 Dec. Saber moves Ranger’s OL from Wed 9 to Fri 11 Dec, makes it a PL and changes its remark.`],
]
const add4 = (EA.people.c4add || []).map(p => p.cs)
CASES[5][2] = `Ranger, Hex and Ace are on a Training called “Advanced range safety procedures brief 1” (40 letters, the longest title the app takes) on Mon 27 Jul. In one save Saber makes it a CSE (a course) called “Range course”, runs it Tue 28 to Thu 30 Jul from 08:00 to 11:30, adds ${esc(add4.join(' and '))}, takes Hex and Ace off and changes its remark. A CSE is filed under Unavailable, so the line says that too.`

const worstRows = rows(EA, 'c4'), worstWk = rows(EA, 'c4', 'wk'), worstDesk = rows(EA, 'c4', 'desk')
const namesPart = ((what(EA, 'c4').match(/[^,]+, [^,]+ added, [^,]+, [^,]+ taken off/) || [])[0] || what(EA, 'c4')).trim()
const worstLetters = Math.round(what(EA, 'c4').length / 10) * 10
const anyCut = [EA, TA].some(run => Object.values(run.cases).some(x => ['phone', 'desk', 'wk'].some(k => x[k] && x[k].m && x[k].m.cut)))

const H = []
H.push(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bell Every Change</title>
<style>
/* One reading column: what to look at now first, then each question with the real bell. Light and dark, as the phone is set. */
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
h4{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2);margin:6px 0 0}
p{margin:0}.lead{color:var(--ink2);max-width:68ch}.lead b{color:var(--ink)}
.asks{background:var(--panel);border:1px solid var(--amberline);border-radius:10px;padding:16px;display:grid;gap:12px}
.asks h2{margin:0;color:var(--amber)}
.asks ol{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.asks li{display:grid;gap:2px}.asks a{color:var(--cyan);text-decoration:none}.asks a b{font-weight:600}.rec{color:var(--ink2);font-size:14px}
.asks .grp{font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--ink2);margin-top:4px}
.news{max-width:72ch}
.gaps{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:16px;display:grid;gap:6px}
.gaps ul{margin:0;padding-left:18px;color:var(--ink2);display:grid;gap:4px}.gaps h2{margin:0}
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
.case{border-top:1px solid var(--line);padding-top:12px;display:grid;gap:8px}
.case h4{margin:0}
#big{position:fixed;inset:0;background:rgba(5,7,10,.96);display:flex;align-items:flex-start;justify-content:center;padding:max(14px,env(safe-area-inset-top,0px)) max(14px,env(safe-area-inset-right,0px)) max(14px,env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px));z-index:20;overflow:auto;cursor:zoom-out}
#big[hidden]{display:none}
#big img{max-width:100%;height:auto;margin:auto}
</style></head><body>
<main id="top">
<h1>The bell says every change: how it would read</h1>
<p class="lead"><b>Nothing in the app has changed. These are drawings for you to approve.</b> Every picture is the real app. ${EVERY === 'every-A' ? 'The “Every change” pictures come from a copy of the app changed only to say every change; the fuller words are ringed in green.' : 'In the “Every change” pictures the fuller line was put into the app’s own bell on the screen, so its letters and the way it wraps are the app’s; those words are ringed in green.'} The pictures are at iPhone size unless they say otherwise. Tap any picture to enlarge it.</p>
`)

/* ---- what to look at now: the news first, then every question in one line ---- */
const ASKS = [
  'First, the two that change what gets built',
  ['q1', `1. Is this how the bell should read when it says every change, ${rowsSaid(worstRows)} at its longest?`, 'I recommend: Yes, as drawn. Nothing is cut off, and my guess is that lines this long are rare.'],
  ['q2', '2. When a change is undone after Ranger’s phone was told of it, should his phone get a second message?', 'I recommend: Yes. A message on a phone cannot be taken back, so a second one puts it right.'],
  'Then five smaller points about the same line',
  ['q3', '3. Should the changes keep the order the bell uses today?', 'I recommend: Yes. Whether it is still on, then when, then who, then what it is called, then the remark.'],
  ['q4', '4. Should a changed remark still be said only as “remark changed”, without its new words?', 'I recommend: Yes. A remark can be 200 letters; a tap opens the input to read it.'],
  ['q5', '5. When three or more people are added, should the bell name them all, where it says “3 people added” today?', 'I recommend: Name them all. A line with many names can then run past the longest one drawn here.'],
  ['q6', '6. Should two names be joined with “and”, so they do not read as two separate changes?', 'I recommend: Yes. “Sidewinder and Talisman added, Hex and Ace taken off”.'],
  ['q7', '7. Should a phone message, once the app sends them, carry this same sentence?', 'I recommend: Yes, word for word, so the bell and the phone never disagree.'],
  'Then five lines found while the last words round was checked',
  ['q8', `8. A leave made another kind and a half day reads ${q(bare(TB, 'u1'))}.`, 'I recommend: “Now AM, LL changed to OL”. The new kind is said once.'],
  ['q9', `9. A morning leave made a Training reads ${q(bare(TB, 'u2'))}.`, 'I recommend: Keep it. It is true, and it shows Ranger the hours his Training now has.'],
  ['q10', `10. A morning leave moved to another day reads ${q(bare(TB, 'u3'))}, with no “(AM)”.`, 'I recommend: “Now Thu 6 Aug (AM)”, as when a leave is moved and made a half day.'],
  ['q11', `11. A title given, or a title taken away, reads ${q(bare(TB, 'u4'))} or ${q(bare(TB, 'u5'))}.`, 'I recommend: Keep both. Ranger knew it by the old name, and the bold name above says the new one.'],
  ['q12', `12. An Attach sent somewhere else reads ${q(bare(TB, 'u6'))}.`, 'I recommend: “145 Sqn changed to 146 Sqn”, like “LL changed to OL”.'],
]
const NQ = ASKS.filter(a => Array.isArray(a)).length
/* a title above already carries its own curly quotes as HTML (q()), so the list prints titles raw and escapes nothing twice */
H.push(`<div class="asks">\n<h2>What to look at now: ${NQ} questions</h2>
<p class="news"><b>New since you agreed: a line can be longer than you were told.</b> When you agreed to “say everything”, you were told four or five changes fit two rows on your iPhone and six would run to a third. (A row is one line of letters across the bell.) Drawn on the real app, five changes take ${r('c3b')}, and the longest line one save can make, seven changes, takes ${rowsSaid(worstRows)}. ${anyCut ? 'One line is cut off.' : 'Nothing is cut off.'} <a href="#q1">Question 1</a> shows it.</p>
<ol>` + ASKS.map(a => (Array.isArray(a) ? `<li><a href="#${a[0]}"><b>${a[1]}</b></a><span class="rec">${esc(a[2])}</span></li>` : `<li class="grp">${esc(a)}</li>`)).join('') + '</ol>\n</div>\n')

/* ---- 1: the line as drawn, and how long it gets ---- */
H.push('<h2>The two that change what gets built</h2>\n')
let A = `<section id="q1">\n<h3><span class="qn">Question 1</span> Is this how the bell should read when it says every change, ${rowsSaid(worstRows)} at its longest?</h3>
<p class="eg">This happens whenever a scheduler changes several things about an input in one save, on the Inputs page or the schedule. Each person on the input then reads one line in the bell. How often a save changes three or more things has not been measured; my guess is that most saves change one or two.</p>
<dl>${row('', 'Today', `The bell says the first two changes, then how many more: ${q('and 1 more change')}. What the other changes were is not said.`)}
${row('new', 'Every change', 'Every change of that save is said, joined by commas. A line of two changes reads exactly as today. The small letter after a comma, and a replaced Leave War bid said last, stay as you approved them.')}
${row('new', 'How long', `Two changes take ${r('c1')}. Three take ${r('c2')}. Four take ${r('c3a')} on an iPhone and ${r('c3a', 'desk')} on a desktop, where the bell is narrower. Five take ${r('c3b')}. Seven, the most one save can make, take ${rowsSaid(worstRows)}. You were told four or five changes fit two rows and six would run to a third.`)}
${row('', 'Not cut off', `${anyCut ? 'One line is cut off: see the cases.' : 'The bell lets a line run to as many rows as it needs, and its list scrolls.'} Longer lines mean fewer lines show before Ranger scrolls; the last picture of the longest case shows the whole bell.`)}
${row('rc', 'I recommend', '<b>Yes, as drawn.</b> My guess is that long lines are rare, and they are the saves where Ranger most needs to know what changed. If five rows is too long for you, say so, and ways to shorten a line will be drawn for you next.')}</dl>\n`
for (const [c, t, eg] of CASES) {
  const tw = what(TA, c), ew = what(EA, c)
  A += `<div class="case" id="case-${c}"><h4>${esc(t)}</h4><p class="eg">${eg}</p><dl>
${row('', 'Today', `${q(tw)}, ${rowsSaid(rows(TA, c))}`)}
${row('new', 'Every change', `${q(ew)}, ${rowsSaid(rows(EA, c))}`)}</dl>
${pics(fig(TA, c, 'phone', `Today, iPhone: ${esc(head(TA, c))}`), fig(EA, c, 'phone', `Every change, iPhone: ${esc(head(EA, c))}`))}`
  if (c === 'c4') {
    A += `<p class="eg">The same line on a desktop, and drawn by the kind of browser an iPhone uses: ${rowsSaid(worstDesk)} on the desktop, ${rowsSaid(worstWk)} in the iPhone’s browser.</p>
${pics(fig(EA, c, 'desk', 'Every change, desktop'), fig(EA, c, 'wk', 'Every change, the iPhone’s browser'), fig(EA, 'list', 'phone', 'Every change, iPhone: the whole bell'))}
<p class="eg"><b>Why seven is the most.</b> One save can change seven things about an input: whether it is on the programme or filed under Unavailable; its days and hours; who is added; who is taken off; its kind (the Type box); its name; its remark. Cancelling would be an eighth, but cancelling is always a save of its own, on the schedule. And when Ranger himself is added or taken off, his line says only “You were added” or “You were taken off”. So no line can hold more changes than this one. It can still be longer with longer callsigns, or with more names if you answer question 5 with “name them all”.</p>`
  }
  A += '</div>\n'
}
A += '</section>\n'
H.push(A)

/* ---- 2: an undone change — his words quoted, the two readings said to be readings ---- */
H.push(`<section id="q2"><h3><span class="qn">Question 2</span> When a change is undone after Ranger’s phone was told of it, should his phone get a second message?</h3>
<p class="eg">This happens when a scheduler presses Undo after a save, for example to take back a slip, once the app sends messages to phones (planned as Teams messages, at the database step; none are sent today). How often a change is undone after its message went out has not been measured. An example: Saber moves Training from Wed 15 to Thu 16 Jul, and Ranger’s phone says so. Saber presses Undo. Ranger’s phone gets a second message that Training is back on Wed 15 Jul.</p>
<dl>${row('', 'Your words', '“And if its undone perhaps we should also create a notification thats applicable to it.”')}
${row('', 'In the bell', 'You settled this on the bell page of 24 Nov, and it is being built: a line Ranger has read gets a new line saying what is true now; a line he has not read simply goes. My reading is that your words add nothing more to the bell.')}
${row('', 'On a phone', 'A message on a phone cannot be taken back once sent. My reading is that whenever a change is undone after its message went out, a second message goes out, as in the example.')}
${row('', 'The question', 'Is that what you meant, in the bell and on a phone?')}
${row('rc', 'I recommend', '<b>Yes to both.</b> The second message’s words would be drawn and put to you before anything is built.')}</dl>
<p class="eg">No picture: the app does not send phone messages yet.</p></section>
`)

/* ---- 3-7: the smaller points of the same line, each its own question ---- */
H.push(`<h2>Five smaller points about the same line</h2>
<section id="q3"><h3><span class="qn">Question 3</span> Should the changes keep the order the bell uses today?</h3>
<p class="eg">The same moment as question 1: Ranger reads one line after Saber changed several things about an input in one save.</p>
<dl>${row('', 'The order', 'Cancelled or not; on the programme or filed under Unavailable; its days and hours; who was added; who was taken off; its kind; its name; its remark. A replaced Leave War bid comes after them all.')}
${row('', 'Example', `${q(what(EA, 'c3b'))} (the five changes of question 1).`)}
${row('', 'Why I ask', 'Today’s line uses this order for the two changes it says. Saying every change makes the whole order show, and you have not been asked about it.')}
${row('rc', 'I recommend', '<b>Yes.</b> It goes from what matters most to Ranger (is it still on, is it still when he thought) to what matters least.')}</dl></section>
<section id="q4"><h3><span class="qn">Question 4</span> Should a changed remark still be said only as “remark changed”, without its new words?</h3>
<p class="eg">Saber moves Ranger’s Training to Tue 14 Jul and changes its remark from “Bring your kit” to “Bring water”. Ranger opens the bell. How often a remark is changed has not been measured.</p>
<dl>${row('', 'As drawn', `${q(what(EA, 'c1'))}, as the bell reads today.`)}
${row('', 'The other way', '“Now Tue 14 Jul, remark now Bring water · Saber” (a wording of mine, not drawn). A remark can be up to 200 letters, which alone is four or five rows on an iPhone (worked out from the pictures).')}
${row('rc', 'I recommend', '<b>Say “remark changed”.</b> A tap on the line opens the input with its remark.')}</dl></section>
<section id="q5"><h3><span class="qn">Question 5</span> When three or more people are added, should the bell name them all?</h3>
<p class="eg">Saber adds Ace, Sidewinder and Talisman to Ranger’s Training in one save, for example when more people join a Training. Ranger is already on it and opens the bell. How often three or more are added in one save has not been measured.</p>
<dl>${row('', 'Today', '“3 people added · Saber”. One or two are named: “Ace added”, “Ace, Talisman added”. People taken off read the same way: “3 people taken off”.')}
${row('new', 'Named', '“Ace, Sidewinder, Talisman added · Saber”.')}
${row('', 'What it costs', 'Every name makes the line longer. Ten people added would be about two rows of names (worked out from the pictures, not drawn), so a line could run past the five rows of question 1.')}
${row('', 'Why I ask', 'You said the bell should say everything. “3 people added” is also a count. Whether your words cover it is my reading, so it is your call.')}
${row('rc', 'I recommend', '<b>Name them all.</b> It is the one count left in the line, and it hides who.')}</dl>
<p class="eg">No picture: only the “and 1 more change” part of the line was redrawn for this page.</p></section>
<section id="q6"><h3><span class="qn">Question 6</span> Should two names be joined with “and”?</h3>
<p class="eg">This happens whenever a scheduler adds two people to an input, or takes two off, in one save. The longest case of question 1 has both: Saber adds Sidewinder and Talisman and takes Hex and Ace off.</p>
<dl>${row('', 'As drawn', `${q('… ' + namesPart + ' …')}, from the longest line of question 1. The commas between names look the same as the commas between changes, so “Talisman added, Hex, Ace taken off” can read as three changes.`)}
${row('new', 'With “and”', '“…, Sidewinder and Talisman added, Hex and Ace taken off, …” (not drawn).')}
${row('', 'It also changes', 'A line the bell prints today: “Ace, Talisman added” would read “Ace and Talisman added”.')}
${row('rc', 'I recommend', '<b>Yes.</b> It changes only lines that name two or more people.')}</dl></section>
<section id="q7"><h3><span class="qn">Question 7</span> Should a phone message carry this same sentence?</h3>
<p class="eg">Once the app sends messages to phones (planned as Teams messages, at the database step; none are sent today), every save that puts a line in Ranger’s bell would also send him a message.</p>
<dl>${row('', 'Example', `The message would carry the bell’s sentence: ${q(what(EA, 'c2'))}. The longest line of question 1, about ${worstLetters} letters, would go to his phone whole.`)}
${row('', 'Not yet drawn', 'How the message names the input and its day, and how it looks, would be drawn for you before it is built.')}
${row('rc', 'I recommend', '<b>Yes, word for word,</b> so the bell and the phone never disagree.')}</dl>
<p class="eg">No picture: the app does not send phone messages yet.</p></section>
`)

/* ---- 8-12: the wordings round 4's walk left ---- */
const UQ = [
  ['q8', ['u1'], 'A leave made another kind and a half day', `Saber opens Ranger’s LL on Mon 3 Aug (a whole day) on the Inputs page and, in one save, makes it an OL for the morning only, for example when a leave was booked as the wrong kind.`,
    c => `${q(what(TB, c[0]))}. The line says “OL” before it says the LL was changed to an OL.`,
    [['new', 'Option 1', '“Now AM, LL changed to OL · Saber”'], ['new', 'Option 2', '“LL changed to OL, now AM · Saber”']],
    '<b>Option 1.</b> It keeps the bell’s order and says the new kind once. An input with a title already reads “Now AM”.'],
  ['q9', ['u2'], 'A morning leave made a Training', `Ranger’s LL on Tue 4 Aug is the morning only. Saber makes it a Training. A Training has no half days, so it keeps the morning’s hours, 00:00 to 12:00.`,
    c => `${q(what(TB, c[0]))}. Nobody typed 00:00–12:00: those are the morning’s hours, and “Now” can read as if Saber changed the time.`,
    [['', 'Option 1', 'Keep it.'], ['new', 'Option 2', '“LL changed to Training · Saber”'], ['new', 'Option 3', '“LL changed to Training, 00:00–12:00 · Saber”']],
    '<b>Option 1, keep it.</b> What it says is true, it follows the bell’s order (question 3), and Ranger sees the odd hours his Training now has, which he can raise with Saber. Option 2 hides those hours; option 3 says the same as today in another order.'],
  ['q10', ['u3'], 'A morning leave moved to another day', `Ranger’s LL on Wed 5 Aug is the morning only. Saber moves it to Thu 6 Aug and it stays the morning, for example when a leave is swapped to another day.`,
    c => `${q(what(TB, c[0]))}. The line does not say it is still the morning.`,
    [['new', 'Option 1', '“Now Thu 6 Aug (AM) · Saber”'], ['', 'Option 2', 'Keep it: the half did not change.']],
    '<b>Option 1.</b> It reads like a leave moved and made a half day, “Now Thu 16 Jul (AM)”, which you approved on the last words page.'],
  ['q11', ['u4', 'u5'], 'A title given, or a title taken away', `Saber gives Ranger’s Training on Fri 7 Aug the title “Sim”; the bell names it Sim from then on. Separately, Saber clears the title “Brief” from Ranger’s Training on Mon 10 Aug; the bell names it Training from then on.`,
    c => `A title given: ${q(what(TB, c[0]))}. A title taken away: ${q(what(TB, c[1]))}.`,
    [['', 'Option 1', 'Keep both.'], ['new', 'Option 2', '“Titled Sim · Saber” and “Title Brief removed · Saber”']],
    '<b>Option 1.</b> Ranger knew it by the old name, and the bold name above the line already says the new one. If you want one changed and not the other, say which.'],
  ['q12', ['u6'], 'An Attach sent somewhere else', `Ranger is on an Attach, “Exercise Kite”, to 145 Sqn on Tue 11 Aug. Saber changes its “To” box to 146 Sqn.`,
    c => `${q(what(TB, c[0]))}. The title did not change, only where the Attach is to. And the dots run together: “Exercise Kite · 145 Sqn · Saber” reads as three things.`,
    [['', 'Option 1', 'Keep it.'], ['new', 'Option 2', '“145 Sqn changed to 146 Sqn · Saber”']],
    '<b>Option 2.</b> It says what changed, in the same words as “LL changed to OL”.'],
]
const UCAP = { u4: 'a title given', u5: 'a title taken away' }
H.push(`<h2>Five lines found while the last words round was checked</h2>
<p class="lead">These are lines the bell prints today. They are not part of “every change”: each was found when the last words round was checked in the app, and you have not been asked about it. How often each happens has not been measured; my guess is that all five are uncommon. “Keep it as it is today” is always an answer.</p>
`)
for (const [id, cs, t, eg, today, opts, rec] of UQ) {
  H.push(`<section id="${id}"><h3><span class="qn">Question ${id.slice(1)}</span> ${esc(t)}</h3>
<p class="eg">${eg}</p>
<dl>${row('', 'Today', today(cs))}
${opts.map(([cls, dt, dd]) => row(cls, dt, dd)).join('\n')}
${row('rc', 'I recommend', rec)}</dl>
${pics(...cs.map(c => fig(TB, c, 'phone', `Today, iPhone${UCAP[c] ? ', ' + UCAP[c] : ''}: ${esc(head(TB, c))} (the words asked about ringed in yellow)`)))}</section>
`)
}
H.push(`</main>
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
console.log('page', PAGE, Math.round(page.length / 1024) + ' KB', 'pictures', used.length)
