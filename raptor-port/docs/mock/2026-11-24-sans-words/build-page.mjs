// Chat 156, 24 Nov 26: writes the page of the SANS wording drawings (index.html) from the pictures draw.mjs took.
// Run from raptor-port/:  node docs/mock/2026-11-24-sans-words/build-page.mjs
import path from 'node:path'
import { existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const CASES = [
  { group: 'The SANS calendar' },
  { id: 'hint', title: 'The grey "+ Commitment" on days before the SANS date', ask: 1,
    eg: 'Ranger opens Thu 16 Jul, the day before Ranger becomes SANS.',
    today: 'SANS aircrew add their availability here.',
    words: ["You're SANS from Fri 17 Jul."],
    pics: [['hint-today', 'Today'], ['hint-new', 'New']] },
  { id: 'note', title: 'A run of days that starts too early',
    eg: 'Ranger is SANS from Fri 17 Jul and drags across Thu 16 to Sat 18. Fri 17 and Sat 18 now save, and Thu 16 is left out.',
    today: 'Nothing saves. Ranger is SANS from Fri 17 Jul: file SANS availability for days from then',
    words: ["Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul.", 'Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul.'],
    pics: [['note-today', 'Today'], ['note-new-own', 'New, Ranger filing'], ['note-new-admin', 'New, an admin filing for Ranger']] },
  { id: 'offer', title: 'A shared offer with one man not yet SANS',
    eg: 'Ranger and Hex share an offer on Sat 18. Hex is now SANS from Fri 24, and Saber tries to add Sun 19. It is still refused. A filing for one man keeps today\'s words, because there is nobody to take out.',
    today: 'Hex is SANS from Fri 24 Jul: file SANS availability for days from then',
    words: ['Hex is SANS from Fri 24 Jul. Take him out of this offer to add earlier days.'],
    pics: [['offer-today', 'Today'], ['offer-new', 'New']] },
  { group: 'The bell: the reminder to file' },
  { id: 'due', title: 'A man posted out as SANS, planned with nothing filed',
    eg: 'Ranger is SANS from Fri 17 Jul and is on the programme on three later days.',
    today: "The same line, ending \"Tap to file.\"",
    words: ["You're SANS from Fri 17 Jul.", "You're planned on Sat 18, Mon 20, Thu 23 Jul with nothing filed. Tap to file for availability."],
    pics: [['due-today', 'Today'], ['due-new', 'New']] },
  { id: 'needed', title: 'A man ticked SANS on Quals, with no date ahead',
    eg: 'An admin ticks Ranger SANS on the Quals page. Ranger is on the programme on four days with nothing filed.',
    today: 'The bell says nothing.',
    words: ['Your SANS availability is needed.', "You're planned on Thu 16, Sat 18, Mon 20 Jul and 1 more with nothing filed. Tap to file for availability."],
    pics: [['needed-today', 'Today'], ['needed-new', 'New']] },
  { group: 'The bell: when the SANS posting or tick changes' },
  { id: 'a', title: 'The SANS date moves later',
    eg: 'Saber moves Ranger from Fri 17 to Sat 18. Ranger had filed for Fri 17.',
    today: 'A crossed-out line, "taken back", then the hidden days.',
    words: ['Your SANS date moved to Sat 18 Jul. · Saber', "You're active until then, so the SANS availability you filed for Fri 17 Jul is hidden. It comes back if you're SANS that day again."],
    pics: [['a-today', 'Today'], ['a-new', 'New']] },
  { id: 'b', title: 'Undo post out',
    eg: 'Saber undoes the posting. Ranger had filed for Fri 17 and Sat 18.',
    today: 'A crossed-out line, "taken back", then the hidden days.',
    words: ["You're no longer posted out as SANS. · Saber", "You're active again, so the SANS availability you filed for Fri 17, Sat 18 Jul is hidden. It comes back if you're SANS those days again."],
    pics: [['b-today', 'Today'], ['b-new', 'New']] },
  { id: 'c', title: 'An admin unticks SANS on Quals',
    eg: 'Saber unticks Ranger on the Quals page. Ranger had filed for Fri 17 and Sat 18.',
    today: 'The bell says nothing.',
    words: ["You're no longer SANS. · Saber", "You're active again, so the SANS availability you filed for Fri 17, Sat 18 Jul is hidden. It comes back if you're SANS those days again."],
    pics: [['c-today', 'Today'], ['c-new', 'New']] },
  { id: 'd', title: 'The SANS date moves earlier',
    eg: 'Saber moves Ranger from Fri 17 to Thu 16. Ranger had read the reminder. The new title stands alone, and the reminder stays above it with its days brought up to date, so both lines name Thu 16.',
    today: 'The old reminder crossed out, "taken back".',
    words: ['Your SANS date moved to Thu 16 Jul. · Saber'],
    pics: [['d-today', 'Today'], ['d-new', 'New']] },
  { id: 'e', title: 'The posting is given another outcome',
    eg: 'Saber changes the posting so Ranger is off the manpower. Ranger had filed for Fri 17 and Sat 18. The line does not say "active", because Ranger is not.',
    today: 'A crossed-out line, "taken back", then the hidden days.',
    words: ["You're no longer posted out as SANS. · Saber", "The SANS availability you filed for Fri 17, Sat 18 Jul is hidden while you're not SANS those days."],
    pics: [['e-today', 'Today'], ['e-new', 'New']] },
]

const need = []
const fig = (name, label, size) => {
  const f = `img/${name}-${size}.png`
  if (!existsSync(path.join(HERE, f))) need.push(f)
  const alt = `${label}, ${size}`
  return `<figure><button type="button" class="zoom" data-src="${f}" aria-label="Enlarge: ${esc(alt)}"><img src="${f}" alt="${esc(alt)}" loading="lazy"></button><figcaption>${esc(label)}</figcaption></figure>`
}
const section = c => {
  if (c.group) return `<h2>${esc(c.group)}</h2>`
  return `<section id="${c.id}">
  <h3>${esc(c.title)}${c.ask ? ` <a class="askmark" href="#top">Question ${c.ask}</a>` : ''}</h3>
  <p class="eg">${esc(c.eg)}</p>
  <dl><div><dt>Today</dt><dd>${esc(c.today)}</dd></div><div class="new"><dt>New words</dt><dd>${c.words.map(w => `<span>${esc(w)}</span>`).join('')}</dd></div></dl>
  <h4>iPhone</h4><div class="pics">${c.pics.map(([n, l]) => fig(n, l, 'phone')).join('')}</div>
  <h4>Desktop</h4><div class="pics">${c.pics.map(([n, l]) => fig(n, l, 'desktop')).join('')}</div>
</section>`
}

const html = `<title>SANS Wordings</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* Layout: one reading column, the decisions first, then each wording with its real screens at both sizes. The app's own dark. */
:root{--bg:#0b0e13;--panel:#151a21;--line:#2a323d;--ink:#e8edf2;--ink2:#a9b4c0;--cyan:#39c6e6;--amber:#ffc83d;color-scheme:dark;
--ui:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font:15px/1.5 var(--ui);padding-inline:max(16px,env(safe-area-inset-left,0px)) max(16px,env(safe-area-inset-right,0px));padding-block:20px 56px}
main{max-width:980px;margin:0 auto;display:grid;gap:18px;min-width:0}
h1{font-size:25px;line-height:1.2;margin:0;text-wrap:balance}
h2{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--cyan);margin:18px 0 0}
h3{font-size:18px;line-height:1.3;margin:0;text-wrap:balance}
h4{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2);margin:6px 0 0}
p{margin:0}.lead{color:var(--ink2);max-width:68ch}
.asks{background:var(--panel);border:1px solid var(--amber);border-radius:10px;padding:16px;display:grid;gap:14px}
.asks h2{margin:0;color:var(--amber)}
.ask{display:grid;gap:3px}.ask b{font-size:16px}.ask .rec{color:var(--ink)}.ask a,.askmark{color:var(--cyan)}
.askmark{font-size:12px;font-weight:600;margin-left:6px;white-space:nowrap}
section{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:16px;display:grid;gap:10px;min-width:0;scroll-margin-top:12px}
.eg{color:var(--ink2);max-width:72ch}
dl{margin:0;display:grid;gap:8px}dl div{display:grid;grid-template-columns:86px minmax(0,1fr);gap:10px}
dt{font-size:12px;font-weight:600;color:var(--ink2);padding-top:2px}dd{margin:0;color:var(--ink2);min-width:0}
.new dt{color:var(--amber)}.new dd{color:var(--ink);font-weight:600;display:grid;gap:3px}
.pics{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr));gap:12px;align-items:start}
figure{margin:0;display:grid;gap:5px;min-width:0}figcaption{font-size:12.5px;color:var(--ink2)}
.zoom{all:unset;display:block;cursor:zoom-in;border:1px solid var(--line);border-radius:6px;overflow:hidden;background:#000}
.zoom:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}.zoom img{display:block;width:100%;height:auto}
.plain{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:16px;display:grid;gap:6px}
.plain ul{margin:0;padding-left:18px;color:var(--ink2);display:grid;gap:4px}
#big{position:fixed;inset:0;background:rgba(5,7,10,.96);display:flex;align-items:center;justify-content:center;padding:max(14px,env(safe-area-inset-top,0px)) max(14px,env(safe-area-inset-right,0px)) max(14px,env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px));z-index:20;overflow:auto;cursor:zoom-out}
#big img{max-width:100%;max-height:100%;height:auto}
</style>
<main id="top">
<h1>The new SANS words, drawn on the real app</h1>
<p class="lead">Nothing here is built yet. Each case was set up on the real app, then only its words were changed. A yellow ring marks what changes. Tap any picture to enlarge it.</p>
<div class="asks">
<h2>One thing for you to decide</h2>
<div class="ask"><b>1. Can I leave out the admin's version of the grey button's words?</b>
<span>You approved "Ranger is SANS from Fri 17 Jul." for an admin looking at Ranger's days. An admin's "+ Commitment" is never grey, so that line would have nowhere to appear.</span>
<span class="rec"><b>I recommend leaving it out.</b> <a href="#hint">See the button</a></span></div>
</div>
${CASES.map(section).join('\n')}
<div class="plain"><h2>No new words, so no picture</h2><ul>
<li>The crew list gets no new line, as you said. The strike and "0 free" already say it.</li>
<li>A day newly planned after Ranger read the reminder lights the bell again. A day dropping off does not.</li>
<li>When a posting is put back and the filed days show again, the "is hidden" sentence goes. If nothing is left, the whole line goes.</li>
</ul></div>
</main>
<div id="big" hidden role="dialog" aria-modal="true" aria-label="Enlarged picture" tabindex="-1"><img alt=""></div>
<script>
(function(){var b=document.getElementById('big'),i=b.querySelector('img'),from=null;
function shut(){b.hidden=true;i.removeAttribute('src');if(from)from.focus()}
document.addEventListener('click',function(e){var z=e.target.closest&&e.target.closest('.zoom');if(z){from=z;i.src=z.dataset.src;i.alt=z.querySelector('img').alt;b.hidden=false;b.focus();return}if(!b.hidden&&b.contains(e.target))shut()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!b.hidden)shut()})})();
</script>
`
if (need.length) { console.error('MISSING PICTURES:\n' + need.join('\n')); process.exit(1) }
writeFileSync(path.join(HERE, 'index.html'), html)
console.log('page written', html.length, 'characters;', (html.match(/<figure>/g) || []).length, 'pictures')
