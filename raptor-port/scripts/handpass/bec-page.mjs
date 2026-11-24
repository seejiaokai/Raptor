// THE QUESTIONS PAGE for the bell's "every change" line (chat 170's night of 25 Nov 26, job 1) — a DRAFT, its words read
// by a fresh reader before the host publishes it. Reads the drawing runs' bec.json (bec-draw.mjs), copies the pictures the
// page shows into docs/img/handpass/2026-11-25-bell-every-change/, and writes docs/mock/bell-every-change.html with every
// picture embedded, so the page opens alone. Every quoted line is read from the runs, never typed here.
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

/* the cases of question A, each today beside every change */
const CASES = [
  ['c1', 'Two changes in one save', 'Saber moves Ranger\u2019s Training from Mon 13 to Tue 14 Jul and changes its remark, in one save.'],
  ['c2', 'Three changes', 'Saber moves “Training” from Wed 15 to Thu 16 Jul, gives it the title “Range brief” and changes its remark.'],
  ['c3a', 'Four changes', 'Saber moves “Range brief” from Fri 17 to Mon 20 Jul, starts it at 08:00 instead of 09:00, adds Ace, renames it “Range talk” and changes its remark.'],
  ['c3b', 'Five changes, one of them the kind', 'The same as the four, and the Training is also made a Meeting.'],
  ['c3c', 'A leave: a half day and a change of kind', 'Saber changes Ranger\u2019s LL on Thu 23 Jul to an OL on the morning of Fri 24 Jul, and changes its remark.'],
  ['c4', 'The longest line one save can make', ''],
  ['c5', 'A change that replaces a Leave War bid', 'Ranger has bid LL on Fri 11 Dec. Saber moves Ranger\u2019s OL from Wed 9 to Fri 11 Dec, makes it a PL and changes its remark.'],
]
const add4 = (EA.people.c4add || []).map(p => p.cs)
CASES[5][2] = `Ranger, Hex and Ace are on a Training called “Advanced range safety procedures brief 1” (40 letters, the longest title the app takes) on Mon 27 Jul. In one save Saber makes it a course called “Range course”, runs it Tue 28 to Thu 30 Jul from 08:00 to 11:30, adds ${esc(add4.join(' and '))}, takes Hex and Ace off and changes its remark. A course files itself under Unavailable, so that is said too.`

const maxRows = Math.max(...CASES.map(([c]) => rows(EA, c)))
const worstRows = rows(EA, 'c4'), worstWk = rows(EA, 'c4', 'wk'), worstDesk = rows(EA, 'c4', 'desk')
const anyCut = [EA, TA].some(r => Object.values(r.cases).some(x => ['phone', 'desk', 'wk'].some(k => x[k] && x[k].m && x[k].m.cut)))

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
<p class="lead"><b>Nothing in the app has changed. These are drawings for you to approve.</b> Each “Today” picture is the real app as it is live now. Each “Every change” picture is ${EVERY === 'every-A' ? 'the same bell from a copy of the app changed only to say every change' : 'the same bell with only the words of that line changed to say every change'}, its new words ringed in green. The pictures are at iPhone size unless they say otherwise. Tap any picture to enlarge it.</p>
`)

/* ---- what to look at now ---- */
const ASKS = [
  ['qa', 'A. Is this how the bell should read when it says every change?', `I recommend: Yes, as drawn. Nothing is cut off, but the longest line one save can make takes ${rowsSaid(worstRows)} on an iPhone, more than the three you were told.`],
  ['qa2', 'A2. Should the changes keep the order the bell uses today?', 'I recommend: Yes. Whether it is still on, then when, then who, then what it is called, then the remark.'],
  ['qa3', 'A3. Should a changed remark still be said only as “remark changed”, without its new words?', 'I recommend: Yes. A remark can be 200 letters; a tap opens the input to read it.'],
  ['qa4', 'A4. When three or more people are added, should the bell name them all, where it says “3 people added” today?', 'I recommend: Name them all. It is the one count left in the line.'],
  ['qa5', 'A5. Should two names be joined with “and”, so they do not read as two separate changes?', 'I recommend: Yes. “Sidewinder and Talisman added, Hex and Ace taken off”.'],
  ['qa6', 'A6. Should a phone message, once the app sends them, carry this same sentence?', 'I recommend: Yes, word for word, so the bell and the phone never disagree.'],
  ['qb', 'B. When a change is undone after Ranger\u2019s phone was told of it, should his phone get a second message?', 'I recommend: Yes. A message on a phone cannot be taken back, so the second one corrects it.'],
  ['qc', 'C. A leave made another kind and a half day: “Now OL (AM), LL changed to OL”.', 'I recommend: “Now AM, LL changed to OL”. The new kind is said once.'],
  ['qd', 'D. A morning leave made a Training: “Now 00:00–12:00, LL changed to Training”.', 'I recommend: “LL changed to Training, 00:00–12:00”. The times did not move; they are its hours now.'],
  ['qe', 'E. A morning leave moved to another day says no “(AM)”: “Now Thu 6 Aug”.', 'I recommend: “Now Thu 6 Aug (AM)”, as when a leave is moved and made a half day.'],
  ['qf', 'F. A title given to an input that had none: “Renamed — was Training”.', 'I recommend: Keep it. It was called Training and is now called Sim.'],
  ['qg', 'G. A title taken away: “Renamed — was Brief”.', 'I recommend: Keep it, for the same reason.'],
  ['qh', 'H. An Attach sent somewhere else: “Renamed — was Exercise Kite · 145 Sqn”.', 'I recommend: “145 Sqn changed to 146 Sqn”, like “LL changed to OL”.'],
]
H.push(`<div class="asks">\n<h2>What to look at now: ${ASKS.length} questions</h2>\n<ol>` + ASKS.map(([id, t, r]) => `<li><a href="#${id}"><b>${esc(t)}</b></a><span class="rec">${esc(r)}</span></li>`).join('') + '</ol>\n</div>\n')

/* ---- A ---- */
let A = `<section id="qa">\n<h3><span class="qn">Question A</span> Is this how the bell should read when it says every change?</h3>
<p class="eg">This happens whenever a scheduler changes an input someone is on: on the Inputs page or the schedule, Saber changes several things in one save, and each person on the input reads one line in the bell. How often a save changes three or more things is not counted by the app; my guess is that most saves change one or two.</p>
<dl>${row('', 'Today', `The bell says the first two changes, then how many more: ${q('and 1 more change')}. What the other changes were is not said.`)}
${row('new', 'Every change', 'Every change of that save is said, in the order the bell already uses, joined by commas, each after the first starting with a small letter unless it starts with a name. A replaced Leave War bid is still said last.')}
${row('', 'Longer than said', `When you agreed, you were told a line might run to a third row on your iPhone. Drawn, five changes already take ${rowsSaid(rows(EA, 'c3b'))}, and the longest line one save can make takes ${rowsSaid(worstRows)}. On a desktop the bell is narrower than on a phone, so a line can take a row more there: the four changes take ${rowsSaid(rows(EA, 'c3a'))} on an iPhone and ${rowsSaid(rows(EA, 'c3a', 'desk'))} on a desktop.`)}
${row('rc', 'I recommend', `<b>Yes, as drawn.</b> ${anyCut ? 'One line is cut off: see the cases.' : 'Nothing is cut off: the bell lets a line run to as many rows as it needs, and the list scrolls.'} A line of two changes reads exactly as today. My guess is that long lines are rare, and they are the saves where Ranger most needs to know what changed.`)}</dl>\n`
for (const [c, t, eg] of CASES) {
  const tw = what(TA, c), ew = what(EA, c)
  A += `<div class="case" id="case-${c}"><h4>${esc(t)}</h4><p class="eg">${eg}</p><dl>
${row('', 'Today', `${q(tw)}, ${rowsSaid(rows(TA, c))}`)}
${row('new', 'Every change', `${q(ew)}, ${rowsSaid(rows(EA, c))}`)}</dl>
${pics(fig(TA, c, 'phone', `Today, iPhone: ${esc(head(TA, c))}`), fig(EA, c, 'phone', `Every change, iPhone: ${esc(head(EA, c))}`))}`
  if (c === 'c4') {
    A += `<p class="eg">The same line on a desktop (the bell is a little narrower there) and in the iPhone's own browser engine: ${rowsSaid(worstDesk)} on the desktop, ${rowsSaid(worstWk)} on the iPhone engine.</p>
${pics(fig(EA, c, 'desk', 'Every change, desktop'), fig(EA, c, 'wk', 'Every change, iPhone engine'), fig(EA, 'list', 'phone', 'Every change, iPhone: the whole bell'))}
<p class="eg"><b>Why no save can say more.</b> One save can change, at most: whether it is on the programme or under Unavailable; its days and hours; who is added; who is taken off; its kind; its name; its remark. That is seven. Cancelling is an eighth, but no window that changes an input can cancel it in the same save: cancelling is a save of its own on the schedule. Ranger himself being added or taken off is never joined to the rest: he reads only “You were added” or “You were taken off”. So seven is the most, and this line is the longest the bell can show, apart from longer callsigns.</p>`
  }
  A += '</div>\n'
}
A += '</section>\n'
H.push(A)

/* ---- A2-A6: the readings, each its own question ---- */
H.push(`<section id="qa2"><h3><span class="qn">Question A2</span> Should the changes keep the order the bell uses today?</h3>
<p class="eg">The same moment as question A: Ranger reads one line after Saber changed several things in one save.</p>
<dl>${row('', 'The order', 'Cancelled or not; on the programme or under Unavailable; the days and hours; who was added; who was taken off; the kind; the name; the remark. Then a replaced Leave War bid.')}
${row('', 'Example', `${q(what(EA, 'c4'))} (the longest case above).`)}
${row('rc', 'I recommend', '<b>Yes.</b> It goes from what matters most to Ranger (is it still on, is it still when he thought) to what matters least. Today\u2019s line already uses this order for its first two.')}</dl></section>
<section id="qa3"><h3><span class="qn">Question A3</span> Should a changed remark still be said only as “remark changed”, without its new words?</h3>
<p class="eg">Saber changes the remark on Ranger\u2019s Training from “Bring your kit” to “Bring water”, with or without other changes.</p>
<dl>${row('', 'As drawn', `${q(what(EA, 'c1'))}.`)}
${row('', 'The other way', '“Now Tue 14 Jul, remark now Bring water · Saber”. A remark can be up to 200 letters, so one remark could fill the bell.')}
${row('rc', 'I recommend', '<b>Say “remark changed”.</b> A tap on the line opens the input with its remark.')}</dl></section>
<section id="qa4"><h3><span class="qn">Question A4</span> When three or more people are added, should the bell name them all?</h3>
<p class="eg">Saber adds Ace, Sidewinder and Talisman to Ranger\u2019s Training in one save. Ranger is already on it.</p>
<dl>${row('', 'Today', '“3 people added · Saber”. One or two are named: “Ace added”, “Ace, Talisman added”. The same for people taken off.')}
${row('', 'Named', '“Ace, Sidewinder and Talisman added · Saber”. Ten people would make a line of ten names.')}
${row('rc', 'I recommend', '<b>Name them all.</b> “Say every change” leaves this as the one count in the line. No picture: the drawing copy changed only the “and 1 more change”, not this.')}</dl></section>
<section id="qa5"><h3><span class="qn">Question A5</span> Should two names be joined with “and”?</h3>
<p class="eg">The longest case above: Saber adds two people and takes two off in one save.</p>
<dl>${row('', 'As drawn', `${q(what(EA, 'c4'))}. The commas between names and the commas between changes look the same, so “Talisman added, Hex, Ace taken off” can read as three changes.`)}
${row('new', 'With “and”', '“…, Sidewinder and Talisman added, Hex and Ace taken off, …”')}
${row('rc', 'I recommend', '<b>Yes.</b> It changes only lines that name two or more people.')}</dl></section>
<section id="qa6"><h3><span class="qn">Question A6</span> Should a phone message carry this same sentence?</h3>
<p class="eg">Once the app sends messages to phones (at the database step), Saber\u2019s save would send Ranger a message as well as the bell line.</p>
<dl>${row('', 'Example', `The message would read: “Range course, Tue 28 Jul: ${esc(what(EA, 'c4'))}”.`)}
${row('rc', 'I recommend', '<b>Yes, word for word.</b> There is no phone message to picture yet.')}</dl></section>
`)

/* ---- B ---- */
H.push(`<section id="qb"><h3><span class="qn">Question B</span> When a change is undone after Ranger\u2019s phone was told of it, should his phone get a second message?</h3>
<p class="eg">This happens when a scheduler presses Undo after a save, for example to take back a slip. Saber moves Training from Wed 15 to Thu 16 Jul, and Ranger\u2019s phone says so. Saber presses Undo. Ranger\u2019s phone gets a second message that Training is back on Wed 15 Jul.</p>
<dl>${row('', 'In the bell', 'This is already how the bell is being made to work: a line Ranger has read gets a new line saying what is true now; a line he has not read simply goes.')}
${row('', 'On a phone', 'A message on a phone cannot be taken back once sent. So the only way to put it right is a second message.')}
${row('', 'The question', 'You said an undone change should get a notification of its own. Is this what you meant: a second phone message, as in the example?')}
${row('rc', 'I recommend', '<b>Yes.</b> The second message\u2019s words would be drawn and put to you before it is built.')}</dl>
<p class="eg">No picture: the app does not send phone messages yet.</p></section>
`)

/* ---- C-H: the wordings round 4 left ---- */
const UQ = [
  ['qc', 'u1', 'C', 'A leave made another kind and a half day', 'Saber opens Ranger\u2019s LL on Mon 3 Aug (a whole day) on the Inputs page, makes it an OL and the morning only, in one save, for example when a leave was booked as the wrong kind.',
    'The line says “OL” before it says the LL was changed to an OL.', [['new', 'Option 1', '“Now AM, LL changed to OL · Saber”'], ['new', 'Option 2', '“LL changed to OL, now AM · Saber”']],
    '<b>Option 1.</b> It keeps the bell\u2019s order and says the new kind once, the way a titled input already reads “Now AM”.'],
  ['qd', 'u2', 'D', 'A morning leave made a Training', 'Ranger\u2019s LL on Tue 4 Aug is the morning only. Saber makes it a Training. A Training has no half days, so it takes the morning\u2019s hours, 00:00 to 12:00. My guess is that this is rare.',
    'Nobody typed 00:00–12:00; those are the morning\u2019s hours, which did not move.', [['new', 'Option 1', '“LL changed to Training · Saber”'], ['new', 'Option 2', '“LL changed to Training, 00:00–12:00 · Saber”']],
    '<b>Option 2.</b> Ranger learns his Training runs 00:00 to 12:00, which is likely a slip he can point out. It says the kind first, which differs from the bell\u2019s order, so it is your call.'],
  ['qe', 'u3', 'E', 'A morning leave moved to another day', 'Ranger\u2019s LL on Wed 5 Aug is the morning only. Saber moves it to Thu 6 Aug and leaves it the morning, for example when a leave is swapped to another day.',
    'The line does not say it is still the morning.', [['new', 'Option 1', '“Now Thu 6 Aug (AM) · Saber”'], ['', 'Option 2', 'Leave it: the half did not change.']],
    '<b>Option 1.</b> It reads like a leave moved and made a half day, “Now Thu 16 Jul (AM)”, which you approved.'],
  ['qf', 'u4', 'F', 'A title given to an input that had none', 'Saber gives Ranger\u2019s Training on Fri 7 Aug the title “Sim”. The bell names it Sim from then on.',
    '', [['', 'Option 1', 'Keep “Renamed — was Training”'], ['new', 'Option 2', '“Titled Sim · Saber”']],
    '<b>Option 1.</b> Ranger knew it as Training, and the bold name above already says Sim.'],
  ['qg', 'u5', 'G', 'A title taken away', 'Saber clears the title “Brief” from Ranger\u2019s Training on Mon 10 Aug. The bell names it Training from then on.',
    '', [['', 'Option 1', 'Keep “Renamed — was Brief”'], ['new', 'Option 2', '“Title Brief removed · Saber”']],
    '<b>Option 1.</b> Ranger knew it as Brief, and the bold name above says Training.'],
  ['qh', 'u6', 'H', 'An Attach sent somewhere else', 'Ranger is on an Attach, “Exercise Kite”, to 145 Sqn on Tue 11 Aug. Saber changes its “To” box to 146 Sqn.',
    'The line\u2019s dots run together: “Exercise Kite · 145 Sqn · Saber” reads as three things.', [['', 'Option 1', 'Keep it'], ['new', 'Option 2', '“145 Sqn changed to 146 Sqn · Saber”']],
    '<b>Option 2.</b> It says what changed, in the same words as “LL changed to OL”.'],
]
H.push('<h2>The wordings the last round left for you</h2>\n')
for (const [id, c, L, t, eg, issue, opts, rec] of UQ) {
  H.push(`<section id="${id}"><h3><span class="qn">Question ${L}</span> ${esc(t)}</h3>
<p class="eg">${eg}</p>
<dl>${row('', 'Today', `${q(what(TB, c))}.${issue ? ' ' + issue : ''}`)}
${opts.map(([cls, dt, dd]) => row(cls, dt, dd)).join('\n')}
${row('rc', 'I recommend', rec)}</dl>
${pics(fig(TB, c, 'phone', `Today, iPhone: ${esc(head(TB, c))} (the words asked about ringed in yellow)`))}</section>
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
