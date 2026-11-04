// [ASK-AT-THE-CONTROL] his look at the BUILD (D1627, D1628): each of the eight, his approved drawing beside the built app
// from the walk (D1478, D1495 — the drawing is the source; D1426 — any difference shown to him).
//   node scripts/handpass/ask-built-page.mjs <page folder>
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const HERE = dirname(fileURLToPath(import.meta.url))
const IMG = join(HERE, '../../docs/img/handpass/2026-11-04-ask-at-the-control')
const TOP = readFileSync(join(HERE, '../../docs/mock/ask-at-the-control.top.html'), 'utf8')
const STYLE = TOP.slice(0, TOP.indexOf('<main>'))
  .replace('<title>Questions at the Button</title>', '<title>Questions at the Button</title>')
const OUT = process.argv[2]; if (!OUT) throw new Error('usage: ask-built-page.mjs <page folder>')
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const ITEMS = [
  { n: 2, area: 'inputs-a', walk: 'S3', q: 'This input has unsaved changes. Open Drifter’s input and lose them?', where: 'Hangs from the other input pressed — its bar on the Inputs calendar (desktop), its card in the opened day (phone). On a phone the opened day keeps the front, as drawn.' },
  { n: 3, area: 'inputs-a', walk: 'S1', q: 'Delete this input for all 3 people?', where: 'Hangs from Delete at the window’s foot.' },
  { n: 4, area: 'inputs-a', walk: 'S2', q: 'Take yourself out of this input? It stays for the other 2 people.', where: 'Hangs from Take me out, which stays on screen while asked.' },
  { n: 5, area: 'inputs-a', walk: 'S4', q: 'Delete this input for all 2 people?', where: 'The Delete key on an input’s card in the opened day: hangs from that card.' },
  { n: 45, area: 'leave-war', walk: 'S5', q: 'Delete Static?', where: 'Leave War, a day’s window → ⋯ → Post out, Delete chosen: hangs from Post out.' },
  { n: 46, area: 'leave-war', walk: 'S6', q: 'Delete Scope?', where: 'Leave War, a dragged block → ⋯ → Post out, Delete chosen: hangs from Post out.' },
  { n: 47, area: 'leave-war', walk: 'S7', q: 'Delete Relay?', where: 'Leave War, a posted-out day’s window: hangs from the Delete chip.' },
  { n: 48, area: 'leave-war', walk: 'S8', q: 'Delete Static now?', where: 'Leave War, a Delete posting’s date moved to today: hangs from the PO from date.' },
]

const browser = await chromium.launch()
const page = await browser.newPage()
async function jpeg(from, name) {
  if (!existsSync(from)) return null
  const to = join(OUT, 'p', name); mkdirSync(dirname(to), { recursive: true })
  const b64 = readFileSync(from).toString('base64')
  await page.setContent(`<body style="margin:0"><img id="i" src="data:image/png;base64,${b64}">`)
  const { w, h } = await page.$eval('#i', i => ({ w: i.naturalWidth, h: i.naturalHeight }))
  await page.setViewportSize({ width: w, height: h })
  await page.screenshot({ path: to, type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: w, height: h } })
  return 'p/' + name
}
let body = ''
for (const it of ITEMS) {
  const figs = []
  for (const size of ['phone', 'desktop']) {
    const nn = String(it.n).padStart(2, '0')
    const d = await jpeg(join(IMG, it.area, 'A', `${nn}-${size}-card.png`), `${nn}-${size}-drawn.jpg`)
    const b = await jpeg(join(IMG, 'walk', 'A', `${it.walk}-${size}-2-card.png`), `${nn}-${size}-built.jpg`)
    if (!d && !b) continue
    figs.push(`<div class="pair ${size}">${d ? `<figure><figcaption>Your approved drawing</figcaption><img loading="lazy" src="${d}" alt="Drawing, ${size}"></figure>` : ''}${b ? `<figure class="new"><figcaption>Built</figcaption><img loading="lazy" src="${b}" alt="Built, ${size}"></figure>` : ''}</div>`)
  }
  body += `<article class="q card" id="q${it.n}"><header><span class="n">${it.n}</span><div class="hd"><p class="qq">${esc(it.q)}</p><p class="meta muted">${esc(it.where)}</p></div></header>${figs.join('')}</article>`
}
await browser.close()
const head = `<main>
<header style="display:flex;flex-direction:column;gap:6px"><h1>Questions at the Button — built</h1>
<p class="lead">The eight questions you picked (D1627, D1628), built as you approved them. Each is your drawing beside the built app, taken during the bug check. Tap a picture to see it full size.</p></header>
<section class="now"><h2>What to look at now</h2><ol>
<li><b>Each card hangs from its button, as drawn.</b> The blue answer is the safe one and has the keyboard; Escape gives the same answer.</li>
<li><b>One small change you will notice:</b> in the Leave War, a Delete posting no longer turns its button into “Tap again to delete …”. The button stays as it was and the card asks “Delete Static?” with Delete and Cancel.</li>
<li><b>Nothing else changed.</b> The other 63 questions from the first page stay as they are today.</li>
</ol><p class="muted">Try it on your iPhone with the preview link in the chat. If you’re happy, say “merge live”.</p></section>
<div class="size" role="group" aria-label="Picture size"><button type="button" data-s="phone">iPhone</button><button type="button" data-s="desktop">Desktop</button></div>
<section class="area">`
writeFileSync(join(OUT, 'index.html'), STYLE + head + body + '</section></main><div id="lb" hidden><img alt=""></div><script>' + `
const sw=document.querySelectorAll('.size button');function set(s){document.body.dataset.size=s;sw.forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===s));try{localStorage.setItem('aq-size',s)}catch(e){}}
sw.forEach(b=>b.onclick=()=>set(b.dataset.s));let s0='phone';try{s0=localStorage.getItem('aq-size')||(innerWidth>900?'desktop':'phone')}catch(e){};set(s0);
const lb=document.getElementById('lb'),li=lb.querySelector('img');document.addEventListener('click',e=>{const i=e.target.closest('.pair img');if(i){li.src=i.src;lb.hidden=false}else if(e.target.closest('#lb'))lb.hidden=true});
document.addEventListener('keydown',e=>{if(e.key==='Escape')lb.hidden=true})` + '</script>')
console.log('page written')
