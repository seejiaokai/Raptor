// [ASK-AT-THE-CONTROL] (D1626): builds his look page from the five drawing helpers' manifests.
//   node scripts/handpass/ask-at-page.mjs <page folder>
// Reads docs/img/handpass/2026-11-04-ask-at-the-control/<area>/manifest.json, makes a light JPEG of every picture
// (the PNGs stay in the project as the record) into <page folder>/p/<area>/, and writes <page folder>/index.html from
// docs/mock/ask-at-the-control.top.html (what he decides — written by hand) and one section a question.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const HERE = dirname(fileURLToPath(import.meta.url))
const SRC = join(HERE, '../../docs/img/handpass/2026-11-04-ask-at-the-control')
const TOP = join(HERE, '../../docs/mock/ask-at-the-control.top.html')
const OUT = process.argv[2]; if (!OUT) throw new Error('usage: ask-at-page.mjs <page folder>')
const AREAS = [
  ['inputs-a', 'Inputs — an input’s window and the opened day'],
  ['inputs-b', 'Inputs — the document, medical and OIL questions'],
  ['schedule-admin', 'Edit Schedule, the Scheduler Board, Quals and Admin'],
  ['leave-war', 'Leave War'],
  ['tracker', 'Tracker'],
]
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const KIND = {
  card: ['card', 'Hangs from the button'],
  sheet: ['card', 'The whole sheet hangs from the button'],
}
// the 'press again' buttons: the button changes its own words in place (the roll-call's numbers); drawn as cards only to compare
const ARMS = new Set([22, 23, 24, 26, 34, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 52, 53, 54, 56, 57])
const kindOf0 = p => KIND[p] || (/already at the control/.test(p) ? ['at', 'Already at the button'] : ['none', 'Not raised by a button — stays'])

const browser = await chromium.launch()
const page = await browser.newPage()
async function jpeg(area, rel) {
  const from = join(SRC, area, rel), name = basename(rel).replace(/\.png$/, '.jpg'), to = join(OUT, 'p', area, name)
  if (!existsSync(from)) return null
  mkdirSync(dirname(to), { recursive: true })
  if (!existsSync(to)) {
    const b64 = readFileSync(from).toString('base64')
    await page.setContent(`<body style="margin:0"><img id="i" src="data:image/png;base64,${b64}">`)
    const { w, h } = await page.$eval('#i', i => ({ w: i.naturalWidth, h: i.naturalHeight }))
    await page.setViewportSize({ width: w, height: h })
    await page.screenshot({ path: to, type: 'jpeg', quality: 82, clip: { x: 0, y: 0, width: w, height: h } })
  }
  return `p/${area}/${name}`
}

let body = '', count = { card: 0, at: 0, none: 0 }
for (const [area, title] of AREAS) {
  const f = join(SRC, area, 'manifest.json')
  if (!existsSync(f)) { body += `<section class="area"><h2>${esc(title)}</h2><p class="muted">Not drawn yet.</p></section>`; continue }
  const items = JSON.parse(readFileSync(f, 'utf8')).sort((a, b) => a.n - b.n)
  body += `<section class="area" id="${area}"><h2>${esc(title)}</h2>`
  for (const it of items) {
    const [k, label] = ARMS.has(parseInt(it.n, 10)) ? ['at', 'Already at the button · a card drawn to compare'] : kindOf0(String(it.proposal || '')); count[k]++
    const figs = []
    for (const size of ['phone', 'desktop']) {
      const t = it.pics?.today?.[size] || it.pics?.before?.[size], c = it.pics?.card?.[size]
      const tj = t && await jpeg(area, t), cj = c && await jpeg(area, c)
      if (!tj && !cj) continue
      figs.push(`<div class="pair ${size}" data-size="${size}">${tj ? `<figure><figcaption>Today</figcaption><img loading="lazy" src="${tj}" alt="Today, ${size}"></figure>` : ''}${cj ? `<figure class="new"><figcaption>As a card</figcaption><img loading="lazy" src="${cj}" alt="As a card, ${size}"></figure>` : ''}</div>`)
    }
    const q = Array.isArray(it.question) ? it.question.join(' / ') : it.question
    const a = Array.isArray(it.answers) ? it.answers.join(' · ') : it.answers
    body += `<article class="q ${k}" id="q${it.n}"><header><span class="n">${it.n}</span><div class="hd"><p class="qq">${esc(q)}</p>
<p class="meta"><span class="tag ${k}">${label}</span> ${a ? `<span class="ans">${esc(a)}</span>` : ''}</p>
<p class="meta muted">Pressed: ${esc(it.control)}${it.screen ? ` · ${esc(it.screen)}` : ''}</p>
${it.say ? `<p class="say">${esc(it.say)}</p>` : ''}${(it.newWords || []).length ? `<p class="say">New words: ${esc(it.newWords.join(' · '))}</p>` : ''}</div></header>
${figs.join('') || '<p class="muted">Not pictured.</p>'}</article>`
  }
  body += '</section>'
}
await browser.close()
const top = readFileSync(TOP, 'utf8').replace('{{COUNTS}}', `${count.card} drawn as cards · ${count.at} already at the button · ${count.none} not raised by a button`)
writeFileSync(join(OUT, 'index.html'), top + body + '</main><div id="lb" hidden><img alt=""></div><script>' + `
const sw=document.querySelectorAll('.size button');function set(s){document.body.dataset.size=s;sw.forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===s));try{localStorage.setItem('aq-size',s)}catch(e){}}
sw.forEach(b=>b.onclick=()=>set(b.dataset.s));let s0='phone';try{s0=localStorage.getItem('aq-size')||(innerWidth>900?'desktop':'phone')}catch(e){};set(s0);
const lb=document.getElementById('lb'),li=lb.querySelector('img');document.addEventListener('click',e=>{const i=e.target.closest('.pair img');if(i){li.src=i.src;lb.hidden=false}else if(e.target.closest('#lb'))lb.hidden=true});
document.addEventListener('keydown',e=>{if(e.key==='Escape')lb.hidden=true})` + '</script>')
console.log('page written', count)
