/* Folds the captured Monday (capture/*.html: three screens, two states), the app's stylesheets (capture/app.css), the looks
   (src/looks.css, src/looks.js), the page's frame, its second round (src/round2.html), styles and script (src/) and the
   measured tables (worked out here from colour.mjs, sched.mjs and capture/clearance.json) into one page: index.html.
   Pictures stay beside it in img/. No app script is carried over, and nothing here adds a style from script.
   Run from raptor-port/: node docs/mock/2026-11-26-al-colours/build.mjs      (--tables prints the figures for the report) */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { contrast, de00, sim, lab } from './colour.mjs'
import { SCHED } from './sched.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const read = p => readFileSync(join(HERE, p), 'utf8')
const TODAY = ['#3BC6E8', '#E5C24A', '#3DE86B', '#FFFFFF', '#B388FF', '#FF7FC4', '#E5872B']
/* round 1's seven: three of the first four sat on a section's own colour (his look-alikes question, 26 Nov 26) */
const R1 = ['#FFE815', '#8FA6FF', '#4FEBC8', '#FF9548', '#EDC4FF', '#9FB07A', '#6FB0B2']
const NEW = ['#F8F337', '#FF95D9', '#9DF7F0', '#D9A88C', '#A9C8FF', '#9FB07A', '#D9B3FF']
const NAME = { '#F8F337': 'Lemon', '#FF95D9': 'Pink', '#9DF7F0': 'Ice', '#D9A88C': 'Clay', '#A9C8FF': 'Sky', '#9FB07A': 'Sage', '#D9B3FF': 'Lilac',
  '#FFE815': 'Lemon', '#8FA6FF': 'Periwinkle', '#4FEBC8': 'Mint', '#FF9548': 'Orange', '#EDC4FF': 'Lilac', '#6FB0B2': 'Teal',
  '#3BC6E8': 'Cyan', '#E5C24A': 'Yellow', '#3DE86B': 'Green', '#FFFFFF': 'White', '#B388FF': 'Purple', '#FF7FC4': 'Pink', '#E5872B': 'Dark orange' }
/* read off the running app (capture/measured.json): the panel behind a changed word on the week, and a box on the board */
const WEEK = '#1A1F2A', BOARD = '#0B0D10', RED = '#F0555F'
const CLOSE = 12   // under this, for ordinary sight, an amendment colour is too close to a schedule colour
const al = i => 'AL' + (i + 1) + (i === 6 ? '+' : '')
const f1 = v => v.toFixed(1), f0 = v => v.toFixed(0)
const cbOnly = (a, b) => Math.min(de00(sim(a, 'deutan'), sim(b, 'deutan')), de00(sim(a, 'protan'), sim(b, 'protan')))
const dot = (c, s = '') => `<span class="pg-dot${s}" style="background:${c}"></span>`

/* ---- swatches ---- */
const swatch = (list, kind) => `<div class="pg-sw">${list.map((c, i) => { const col = sim(c, kind), bg = sim(WEEK, kind)
  return `<div style="background:${bg};color:${col}"><b>${al(i)}</b><u style="text-underline-offset:0">18:00</u><i>${kind ? '' : NAME[c] + ' · ' + f1(contrast(c, WEEK))}</i></div>` }).join('')}</div>`
const cvd = ['deutan', 'protan'].map((k, n) => `<p class="pg-swl">${n ? 'The rarer kind (red-weak)' : 'The commoner kind (green-weak)'}: today’s, then proposed</p>${swatch(TODAY, k)}${swatch(NEW, k)}`).join('')

/* ---- each colour against what the schedule already spends ---- */
const nearest = c => SCHED.map(([s, what]) => [de00(c, s), what, s]).sort((a, b) => a[0] - b[0])[0]
function spentTable(list) {
  const rows = list.map((c, i) => { const near = nearest(c), cw = contrast(c, WEEK), cb = contrast(c, BOARD), bad = near[0] < CLOSE
    return `<tr><td>${dot(c)}</td><td><b>${al(i)}</b> ${NAME[c]}</td><td class="num">${f1(cw)}</td><td class="num">${f1(cb)}</td><td class="num ${bad ? 'bad' : 'ok'}">${f0(near[0])}</td><td class="wrap ${bad ? 'bad' : ''}">${bad ? (near[0] < 1 ? 'the same colour as ' : 'too close to ') : 'nearest is '}${near[1]}</td></tr>` })
  return `<table class="pg-t"><thead><tr><th></th><th>Amendment</th><th>Stands out on the week</th><th>On the board</th><th>Difference</th><th>From the nearest colour the schedule already uses</th></tr></thead><tbody>${rows.join('')}</tbody></table>`
}
/* ---- the hardest pair to tell apart, for the first n ---- */
function hardest(list, n, fn) { let best = null; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const d = fn(list[i], list[j]); if (!best || d < best.d) best = { d, i, j } } return best }
function pairsTable() {
  const cell = (list, n, fn) => { const h = hardest(list, n, fn); return `<td class="num ${h.d < 10 ? 'bad' : 'ok'}">${f0(h.d)}</td><td>${al(h.i)} / ${al(h.j)} ${dot(list[h.i], ' s')} ${dot(list[h.j], ' s')}</td>` }
  const rows = [2, 3, 4, 7].map(n => `<tr><td>${n === 7 ? 'All seven' : 'The first ' + ['', '', 'two', 'three', 'four'][n]}</td>${cell(TODAY, n, de00)}${cell(NEW, n, de00)}${cell(TODAY, n, cbOnly)}${cell(NEW, n, cbOnly)}</tr>`)
  return `<table class="pg-t"><thead><tr><th rowspan="2">Hardest pair among</th><th colspan="4">Ordinary sight</th><th colspan="4">Red-green colour-blind</th></tr><tr><th colspan="2">Today</th><th colspan="2">Proposed</th><th colspan="2">Today</th><th colspan="2">Proposed</th></tr></thead><tbody>${rows.join('')}</tbody></table>`
}
/* ---- look-alikes: every amendment colour against every schedule colour ---- */
function alikeTable(list, title) {
  const head = `<tr><th>${title}</th>${list.map((c, i) => `<th>${dot(c, ' s')} ${al(i)}<br>${NAME[c]}</th>`).join('')}</tr>`
  const rows = SCHED.map(([s, what]) => `<tr><td class="wrap">${dot(s, ' s')} ${what}</td>${list.map(c => { const d = de00(c, s), g = cbOnly(c, s)
    return `<td class="num ${d < CLOSE ? 'bad' : 'ok'}">${f0(d)} / ${f0(g)}</td>` }).join('')}</tr>`)
  return `<table class="pg-t pg-alike"><thead>${head}</thead><tbody>${rows.join('')}</tbody></table>`
}
const flagged = list => list.flatMap((c, i) => SCHED.filter(([s]) => de00(c, s) < CLOSE).map(([s, what]) => ({ i, c, s, what, d: de00(c, s) })))
const APART = { section: 'That colour is only ever the stripe down a section’s left edge and its heading in capitals. The amendment’s colour is a paler tint, on ordinary words, with a line under them.',
  words: 'Those words never have a line under them; a changed word always does.', puck: 'That is a puck’s own fill; an amendment never fills a puck, it adds a corner tab.' }
function alikeFix() {
  const flag = n => { const f = flagged(n); return f.length ? f.map(x => `${al(x.i)} ${NAME[x.c].toLowerCase()} (${f0(x.d)} from ${x.what})`).join('; ') : 'none' }
  const near = NEW.map((c, i) => ({ i, c, n: nearest(c) })).sort((a, b) => a.n[0] - b.n[0]).filter(x => x.n[0] < 18)
  const kind = s => SCHED.find(x => x[0] === s)[2]
  return `<ul><li><b>Too close (under ${CLOSE}), today’s seven:</b> ${flag(TODAY)}.</li><li><b>Too close, my first page’s seven:</b> ${flag(R1)}.</li><li><b>Too close, the new seven:</b> ${flag(NEW)}.</li></ul>
<p>No new colour is under ${CLOSE}. These are the nearest that remain, closest first, and what keeps each apart:</p>
<div class="pg-scroll"><table class="pg-t"><thead><tr><th>Amendment</th><th>Nearest schedule colour</th><th>Difference</th><th>What keeps them apart</th></tr></thead><tbody>${near.map(x =>
    `<tr><td>${dot(x.c, ' s')} <b>${al(x.i)}</b> ${NAME[x.c]}</td><td class="wrap">${dot(x.n[2], ' s')} ${x.n[1]}</td><td class="num">${f0(x.n[0])}</td><td class="wrap">${APART[kind(x.n[2])]}</td></tr>`).join('')}</tbody></table></div>`
}
/* ---- AL4 and the missing-time outline's red ---- */
const clash = () => { const row = (nm, c) => `${nm} ${f0(de00(c, RED))} for ordinary sight and ${f0(cbOnly(c, RED))} for a red-green reader`
  return `Measured against the outline’s red: ${row('AL4’s clay is', NEW[3])} (my first page’s orange was ${f0(de00(R1[3], RED))} and ${f0(cbOnly(R1[3], RED))}, so no better). For ordinary sight that is clearly two colours. For a red-green reader it is close, so colour alone would not do. Shape does the work: the outline is a closed box on the box’s own edge, the amendment’s mark a dotted line inside it, under where the time goes. For comparison, ${row('AL1’s lemon is', NEW[0])}, ${row('AL2’s pink', NEW[1])}.` }

/* ---- colour alone (round 3: only the latest amendment keeps its line): each new colour against the ordinary words ---- */
const WORDS = [['#F1F4F7', 'white words (names)'], ['#B6C0CB', 'grey words (times)'], ['#8A96A3', 'faint grey words']]
const grey = h => { const L = lab(h)[0]; return L }
function plainRows() { return NEW.map((c, i) => ({ i, c, w: WORDS.map(([t]) => [de00(c, t), cbOnly(c, t), Math.abs(grey(c) - grey(t))]) })) }
function plainTable() {
  return `<table class="pg-t pg-alike"><thead><tr><th>Amendment</th>${WORDS.map(w => `<th>from ${w[1]}<br>ordinary / red-green / black-and-white</th>`).join('')}</tr></thead><tbody>${plainRows().map(r =>
    `<tr><td>${dot(r.c, ' s')} <b>${al(r.i)}</b> ${NAME[r.c]}</td>${r.w.map(([d, q, l]) => `<td class="num ${d < CLOSE ? 'bad' : 'ok'}">${f0(d)} / <span class="${q < 10 ? 'bad' : ''}">${f0(q)}</span> / <span class="${l < 10 ? 'bad' : ''}">${f0(l)}</span></td>`).join('')}</tr>`).join('')}</tbody></table>`
}
/* ---- the clearance table (capture/clearance.json, written by shoot.mjs from the real app) ---- */
const CLEAR = JSON.parse(read('capture/clearance.json'))
function clearRows() {
  const by = new Map()
  for (const c of CLEAR) for (const r of c.rows) { const place = / \(board box\)$/.test(r.place) ? 'any box on the Scheduler Board (the line is inside the box; gap to the box’s foot)' : r.place === 'ntx' ? 'a name on View Schedule' : r.place.replace(/^(1st wave|2nd wave \(night\)|duty desk \/ Ground Programme),/, 'duty desk,')
    const e = by.get(place) || by.set(place, { a: { gap: 1e9, cut: 1e9 }, c: { gap: 1e9, cut: 1e9 } }).get(place), w = e[c.look]
    if (r.gap != null && r.gap < w.gap) { w.gap = r.gap; w.at = `${c.surface === 'View-only Sched' ? 'View Schedule' : c.surface}, ${c.size}` }
    if (r.cut != null && r.cut < w.cut) w.cut = r.cut }
  return [...by].map(([place, e]) => ({ place, ...e })).sort((x, y) => x.c.gap - y.c.gap)
}
const g = v => v > 1e8 ? 'no line' : f1(v)
function clearTable() {
  const rows = clearRows().map(r => `<tr><td class="wrap">${r.place}</td><td class="num ${r.a.gap < 2 || r.a.cut < 0 ? 'bad' : 'ok'}">${g(r.a.gap)}${r.a.cut < 0 ? ' (cut off)' : ''}</td><td class="num ${r.c.gap < 2 || r.c.cut < 0 ? 'bad' : 'ok'}">${g(r.c.gap)}</td><td class="wrap">${r.c.at || ''}</td></tr>`)
  return `<table class="pg-t"><thead><tr><th>Where the line is</th><th>Today</th><th>My recommendation</th><th>Its tightest spot</th></tr></thead><tbody>${rows.join('')}</tbody></table>`
}

/* ---- a callsign in the amendment's colour, on each puck ---- */
const PUCKS = [['#6E6A2E', 'pilot (olive)'], ['#1F6E52', 'WSO (green)'], ['#FFFFFF', 'ground crew (white)']]
const puckName = `<div class="pg-scroll"><table class="pg-t"><thead><tr><th>Callsign colour</th>${PUCKS.map(p => `<th>on a ${p[1]} puck</th>`).join('')}</tr></thead><tbody>${NEW.slice(0, 4).map((c, i) => `<tr><td>${dot(c, ' s')} ${al(i)} ${NAME[c]}</td>${PUCKS.map(p => { const v = contrast(c, p[0]); return `<td class="num ${v < 4.5 ? 'bad' : 'ok'}">${f1(v)}</td>` }).join('')}</tr>`).join('')}<tr><td>Today’s cream or white callsign</td><td class="num">${f1(contrast('#FBFAF0', '#6E6A2E'))}</td><td class="num">${f1(contrast('#EAFBF3', '#1F6E52'))}</td><td class="num">${f1(contrast('#18202C', '#FFFFFF'))}</td></tr></tbody></table></div><p class="pg-sub">Below 4.5 (in red) is too faint for letters this small.</p>`
/* ---- the puck demonstration, drawn with the app's own puck ---- */
const pk = (cls, nm, role, q, style = '') => `<span class="seat"><span class="puck ${cls}"${style ? ` style="${style}"` : ''}><span class="nm">${nm}</span><span class="role ${q}">${role}</span></span></span>`
const pucks = `<div class="pg-pucks">
<figure><div class="row">${pk('sm', 'Hunter', 'IP', 'q-ins')}${pk('r sm', 'Wisp', 'C', 'q-c')}${pk('sm warn hard boxred', 'Saber', 'IP', 'q-ins')}</div><figcaption>Today: a pilot, a WSO, and a pilot with a red warning.</figcaption></figure>
<figure><div class="row">${pk('sm', 'Hunter', 'IP', 'q-ins', `background:${NEW[1]};color:#08131b`)}${pk('r sm', 'Wisp', 'C', 'q-c', `background:${NEW[2]};color:#08131b`)}${pk('sm warn hard boxred', 'Saber', 'IP', 'q-ins', `background:${NEW[3]};color:#08131b`)}</div><figcaption>Recoloured for AL2, AL3 and AL4: which is the pilot, which the WSO?</figcaption></figure>
</div>`

/* ---- the pictures ---- */
const SURF = [['edit', 'Edit Schedule'], ['view', 'View Schedule'], ['board', 'Scheduler Board']]
const LOOK = { a: 'today', b: 'colour only, no chips, today’s colours', c: 'my recommendation, proposed colours' }
/* target="_blank": a plain link replaced the whole page with the picture, and on his iPhone there was no way back (26 Nov 26) */
const fig = (f, alt, cap) => { if (!existsSync(join(HERE, f))) throw new Error('missing picture ' + f)
  return `<figure><a href="${f}" target="_blank" rel="noopener"><img src="${f}" loading="lazy" alt="${alt}"></a><figcaption>${cap}</figcaption></figure>` }
const dev = sz => sz === 'phone' ? 'iPhone' : 'Desktop'
const grid = (sz, figs) => `<div class="pg-shots${figs.length === 2 ? ' two' : ''}${sz === 'phone' ? ' ph' : ''}">${figs.join('')}</div>`
const shots = SURF.map(([k, title], n) => `<h3>${n + 1}. ${title}</h3>` + ['phone', 'desktop'].map(sz => grid(sz, ['a', 'b', 'c'].map(l =>
  fig(`img/${k}-${l}-${sz}.png`, `${title} on a ${sz}: ${LOOK[l]}`, `<b>${n + 1}${l}</b> ${dev(sz)}: ${LOOK[l]}`)))).join('')).join('')
/* a close-up, today beside the recommendation, on each screen at each size */
const pairs = part => SURF.map(([k, title]) => `<p class="pg-swl">${title}</p>` + ['phone', 'desktop'].map(sz => grid(sz, [['a', 'today'], ['c', 'my recommendation']].map(([l, w]) =>
  fig(`img/${part}-${k}-${l}-${sz}.png`, `${title} on a ${sz}, close up: ${w}`, `${dev(sz)}: <b>${w}</b>`)))).join('')).join('')
const SCENES = [
  ['1', 'Drafting. A desk with a man on it and an empty time: a grey outline.', ['edit', 'board', 'view']],
  ['2', 'After a sign-off or Publish was refused: the same outline turns red.', ['edit', 'board']],
  ['3', 'A published day with AL4 waiting, and two END times emptied (the SXO’s, whose holder also changed in AL2, and one in the second block). Each wears the red outline at once, with AL4’s dotted line inside it; the day reads pending.', ['edit', 'board']],
  ['4', 'One of them typed again (22:15): its outline is gone and the new time is simply a waiting change, AL4’s colour over a dotted line.', ['edit', 'board']],
  ['5', 'AL4 published with every time in: the lines are solid, no outline anywhere.', ['edit', 'board', 'view']]]
const SN = { edit: 'Edit Schedule', board: 'Scheduler Board', view: 'View Schedule' }
const miss = SCENES.map(([n, words, surfs]) => `<h3>Scene ${n}</h3><p class="pg-sub">${words}</p>` + ['phone', 'desktop'].map(sz => grid(sz, surfs.map(s =>
  fig(`img/miss-${n}-${s}-${sz}.png`, `Scene ${n}, ${SN[s]} on a ${sz}`, `${dev(sz)}: <b>${SN[s]}</b>${s === 'view' ? (n === '1' ? ', which shows no outline' : '') : ''}`)))).join('')).join('')
const ALIKE = [['prog', 'The Common Programme. Its stripe and heading are blue-violet: on my first page AL2 was periwinkle, almost the same colour.'], ['dutysec', 'Duties. Green stripe, heading and block labels: my first page’s AL3 mint sat beside them.'],
  ['simsec', 'Sims. Purple headings and labels.'], ['ground', 'Ground Programme and Personal Inputs. Amber and orange stripes: my first page’s AL4 was orange.']]
const LATEST = [['prog', 'The Common Programme'], ['dutysec', 'Duties']]
const lfig = (part, tag, sz, cap) => fig(`img/ul-${part}-${tag}-${sz}.png`, `${cap}, on a ${sz}`, `${dev(sz)}: <b>${cap}</b>`)
const latest = LATEST.map(([part, title]) => `<h3>${title}</h3><p class="pg-swl">Edit Schedule, AL4 still waiting: the three choices</p>` + ['phone', 'desktop'].map(sz => grid(sz, [lfig(part, 'edit-1w', sz, 'Every AL lined'), lfig(part, 'edit-2w', sz, 'Latest only: just the waiting changes'), lfig(part, 'edit-3w', sz, 'Your pick: AL3 solid, AL4 dotted')])).join('')
  + `<p class="pg-swl">Your pick on View Schedule while AL4 waits (AL3 is the newest it shows), then on both screens with all four out</p>` + ['phone', 'desktop'].map(sz => grid(sz, [lfig(part, 'view-w', sz, 'View Schedule, AL4 waiting: AL3 lined'), lfig(part, 'edit-out', sz, 'Edit Schedule, all out: AL4 lined'), lfig(part, 'view-out', sz, 'View Schedule, all out: AL4 lined')])).join('')).join('')
const PKC = [['a', 'A. A number on every amendment'], ['b', 'B. Number on the newest and the waiting, plain tab on older'], ['c', 'C. Nothing on older amendments']]
const puckmark = [['edit', 'Edit Schedule'], ['view', 'View Schedule']].map(([s, title]) => `<p class="pg-swl">${title}</p>` + ['phone', 'desktop'].map(sz => grid(sz, PKC.map(([l, cap]) => fig(`img/pk-${l}-${s}-${sz}.png`, `${title} on a ${sz}: ${cap}`, `${dev(sz)}: <b>${cap}</b>`)))).join('')).join('')
const alike = ALIKE.map(([part, words]) => `<p class="pg-swl">${words}</p>` + ['phone', 'desktop'].map(sz => grid(sz, [['r1', 'first page’s colours'], ['c', 'the new colours']].map(([l, w]) =>
  fig(`img/like-${part}-${l}-${sz}.png`, `${words} ${w}, on a ${sz}`, `${dev(sz)}: <b>${w}</b>`)))).join('')).join('')

/* ---- the captured surfaces ---- */
const clean = h => h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/ contenteditable="true"/g, '').replace(/ tabindex="0"/g, '')
  .replace(/<(input|textarea)\b/g, '<$1 readonly tabindex="-1"').replace(/<(select|button)\b/g, '<$1 tabindex="-1"')
const surfaces = ['waiting', 'out'].flatMap(st => SURF.map(([k]) => `<div class="tt-surf" data-surf="${k}" data-st="${st}">${clean(read(`capture/${k}-${st}-desktop.html`))}</div>`)).join('\n')

const css = read('capture/app.css').replace(/<\/style/gi, '<\\/style')
const js = p => read(p).replace(/<\/script/gi, '<\\/script')
const PUT = { '<!--SURFACES-->': () => surfaces, '<!--SW:today-->': () => swatch(TODAY), '<!--SW:new-->': () => swatch(NEW), '<!--SW:cvd-->': () => cvd,
  '<!--T:spent:today-->': () => spentTable(TODAY), '<!--T:spent:new-->': () => spentTable(NEW), '<!--T:pairs-->': pairsTable, '<!--T:puckname-->': () => puckName, '<!--PUCKS-->': () => pucks,
  '<!--SHOTS-->': () => shots, '<!--T:clear-->': clearTable, '<!--T:clash-->': clash, '<!--P:fly-->': () => pairs('fly'), '<!--P:sims-->': () => pairs('sims'), '<!--P:miss-->': () => miss, '<!--P:alike-->': () => alike,
  '<!--T:alike:today-->': () => alikeTable(TODAY, 'Today’s seven'), '<!--T:alike:r1-->': () => alikeTable(R1, 'My first page’s seven'), '<!--T:alike:new-->': () => alikeTable(NEW, 'The new seven'), '<!--T:alikefix-->': alikeFix, '<!--T:plain-->': plainTable, '<!--P:latest-->': () => latest, '<!--P:puckmark-->': () => puckmark }
let out = read('src/frame.html').replace('<!--ROUND3-->', () => read('src/round3.html')).replace('<!--ROUND2-->', () => read('src/round2.html'))
  .replace('/*APPCSS*/', () => css).replace('/*LOOKSCSS*/', () => read('src/looks.css')).replace('/*PAGECSS*/', () => read('src/page.css'))
for (const [k, fn] of Object.entries(PUT)) { if (!out.includes(k)) throw new Error('the frame has no place for ' + k); out = out.split(k).join(fn()) }
out = out.replace('/*LOOKSJS*/', () => js('src/looks.js')).replace('/*TRYJS*/', () => js('src/tryout.js'))
if (/<!--[A-Z:a-z0-9]+-->|\/\*[A-Z]+\*\//.test(out.slice(out.indexOf('<body')))) console.log('WARNING: a placeholder is left in the page')
writeFileSync(join(HERE, 'index.html'), out)
console.log('index.html', (out.length / 1024).toFixed(0) + ' KB')

/* ---- the figures, for the report ---- */
if (process.argv.includes('--tables')) {
  for (const [nm, list] of [['TODAY', TODAY], ['ROUND 1', R1], ['PROPOSED', NEW]]) {
    console.log('\n' + nm + ' | contrast on week / board | nearest schedule colour')
    list.forEach((c, i) => { const near = nearest(c); console.log(`| ${al(i)} | ${c} ${NAME[c]} | ${f1(contrast(c, WEEK))} | ${f1(contrast(c, BOARD))} | ${f1(near[0])} ${near[1]} |`) })
    for (const n of [2, 3, 4, 7]) { const h = hardest(list, n, de00), q = hardest(list, n, cbOnly); console.log(`first ${n}: hardest ordinary ${f1(h.d)} (${al(h.i)}/${al(h.j)}), red-green ${f1(q.d)} (${al(q.i)}/${al(q.j)})`) }
    console.log('under ' + CLOSE + ': ' + (flagged(list).map(x => `${al(x.i)} ${NAME[x.c]} ${f1(x.d)} ${x.what}`).join(' ; ') || 'none'))
    console.log('vs outline red: ' + list.map((c, i) => `${al(i)} ${f0(de00(c, RED))}/${f0(cbOnly(c, RED))}`).join('  '))
  }
  console.log('\ncolour alone: from white / grey / faint words: ordinary, red-green, lightness'); for (const r of plainRows()) console.log(al(r.i), NAME[r.c], r.w.map(x => x.map(f0).join('/')).join('  '))
  console.log('\ncallsign on pucks'); NEW.forEach((c, i) => console.log(al(i), PUCKS.map(p => p[1] + ' ' + f1(contrast(c, p[0]))).join(' | ')))
  console.log('\n| Where the line is | Today | Recommendation | Tightest spot |\n|---|---|---|---|')
  for (const r of clearRows()) console.log(`| ${r.place} | ${g(r.a.gap)}${r.a.cut < 0 ? ' (cut off)' : ''} | ${g(r.c.gap)} | ${r.c.at || ''} |`)
}
