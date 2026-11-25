/* Folds the captured Monday (capture/*.html: three screens, two states), the app's stylesheets (capture/app.css), the looks
   (src/looks.css, src/looks.js), the page's frame, styles and script (src/) and the measured tables (worked out here from
   colour.mjs) into one page: index.html. Pictures stay beside it in img/. No app script is carried over.
   Run from raptor-port/: node docs/mock/2026-11-26-al-colours/build.mjs      (prints the tables' figures for the report) */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { contrast, de00, sim, worst } from './colour.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const read = p => readFileSync(join(HERE, p), 'utf8')
const TODAY = ['#3BC6E8', '#E5C24A', '#3DE86B', '#FFFFFF', '#B388FF', '#FF7FC4', '#E5872B']
const NEW = ['#FFE815', '#8FA6FF', '#4FEBC8', '#FF9548', '#EDC4FF', '#9FB07A', '#6FB0B2']
const NAME = { '#FFE815': 'Lemon', '#8FA6FF': 'Periwinkle', '#4FEBC8': 'Mint', '#FF9548': 'Orange', '#EDC4FF': 'Lilac', '#9FB07A': 'Sage', '#6FB0B2': 'Teal',
  '#3BC6E8': 'Cyan', '#E5C24A': 'Yellow', '#3DE86B': 'Green', '#FFFFFF': 'White', '#B388FF': 'Purple', '#FF7FC4': 'Pink', '#E5872B': 'Dark orange' }
/* read off the running app (capture/measured.json): the panel behind a changed word on the week, and a box on the board */
const WEEK = '#1A1F2A', BOARD = '#0B0D10'
/* what the app already spends each colour on */
const SPENT = [['#3BC6E8', 'the app’s cyan: buttons, the picked tab, the box you are typing in, CAT C'], ['#F0555F', 'the red of a warning'], ['#E5A83B', 'the amber of an advisory and of “pending”'],
  ['#57C97A', 'the green that means fine, and OIL earned'], ['#B24DEA', 'the purple of SANS and “this is you”'], ['#3673DD', 'the blue of a CAT D box'], ['#F1F4F7', 'ordinary white words'], ['#B6C0CB', 'ordinary grey words'], ['#F2D699', 'the pale yellow of the day’s notes']]
const al = i => 'AL' + (i + 1) + (i === 6 ? '+' : '')
const f1 = v => v.toFixed(1), f0 = v => v.toFixed(0)

/* ---- swatches ---- */
const swatch = (list, kind) => `<div class="pg-sw">${list.map((c, i) => { const col = sim(c, kind), bg = sim(WEEK, kind)
  return `<div style="background:${bg};color:${col}"><b>${al(i)}</b><u style="text-underline-offset:3px">18:00</u><i>${kind ? '' : NAME[c] + ' · ' + f1(contrast(c, WEEK))}</i></div>` }).join('')}</div>`
const cvd = ['deutan', 'protan'].map((k, n) => `<p class="pg-swl">${n ? 'The rarer kind (red-weak)' : 'The commoner kind (green-weak)'}: today’s, then proposed</p>${swatch(TODAY, k)}${swatch(NEW, k)}`).join('')

/* ---- each colour against what the app already spends ---- */
function spentTable(list) {
  const rows = list.map((c, i) => {
    const near = SPENT.map(([s, what]) => [de00(c, s), what]).sort((a, b) => a[0] - b[0])[0]
    const cw = contrast(c, WEEK), cb = contrast(c, BOARD), bad = near[0] < 11
    return `<tr><td><span class="pg-dot" style="background:${c}"></span></td><td><b>${al(i)}</b> ${NAME[c]}</td><td class="num">${f1(cw)}</td><td class="num">${f1(cb)}</td><td class="num ${bad ? 'bad' : 'ok'}">${f0(near[0])}</td><td class="wrap ${bad ? 'bad' : ''}">${bad ? (near[0] < 1 ? 'the same colour as ' : 'too close to ') : 'nearest is '}${near[1]}</td></tr>`
  })
  return `<table class="pg-t"><thead><tr><th></th><th>Amendment</th><th>Stands out on the week</th><th>On the board</th><th>Difference</th><th>From the nearest colour the app already uses</th></tr></thead><tbody>${rows.join('')}</tbody></table>`
}
/* ---- the hardest pair to tell apart, for the first n ---- */
function hardest(list, n, fn) { let best = null; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const d = fn(list[i], list[j]); if (!best || d < best.d) best = { d, i, j } } return best }
const cbOnly = (a, b) => Math.min(de00(sim(a, 'deutan'), sim(b, 'deutan')), de00(sim(a, 'protan'), sim(b, 'protan')))
function pairsTable() {
  const cell = (list, n, fn) => { const h = hardest(list, n, fn); return `<td class="num ${h.d < 10 ? 'bad' : 'ok'}">${f0(h.d)}</td><td>${al(h.i)} / ${al(h.j)} <span class="pg-dot s" style="background:${list[h.i]}"></span> <span class="pg-dot s" style="background:${list[h.j]}"></span></td>` }
  const rows = [2, 3, 4, 7].map(n => `<tr><td>${n === 7 ? 'All seven' : 'The first ' + ['', '', 'two', 'three', 'four'][n]}</td>${cell(TODAY, n, de00)}${cell(NEW, n, de00)}${cell(TODAY, n, cbOnly)}${cell(NEW, n, cbOnly)}</tr>`)
  return `<table class="pg-t"><thead><tr><th rowspan="2">Hardest pair among</th><th colspan="4">Ordinary sight</th><th colspan="4">Red-green colour-blind</th></tr><tr><th colspan="2">Today</th><th colspan="2">Proposed</th><th colspan="2">Today</th><th colspan="2">Proposed</th></tr></thead><tbody>${rows.join('')}</tbody></table>`
}
/* ---- a callsign in the amendment's colour, on each puck ---- */
const PUCKS = [['#6E6A2E', 'pilot (olive)'], ['#1F6E52', 'WSO (green)'], ['#FFFFFF', 'ground crew (white)']]
const puckName = `<div class="pg-scroll"><table class="pg-t"><thead><tr><th>Callsign colour</th>${PUCKS.map(p => `<th>on a ${p[1]} puck</th>`).join('')}</tr></thead><tbody>${NEW.slice(0, 4).map((c, i) => `<tr><td><span class="pg-dot s" style="background:${c}"></span> ${al(i)} ${NAME[c]}</td>${PUCKS.map(p => { const v = contrast(c, p[0]); return `<td class="num ${v < 4.5 ? 'bad' : 'ok'}">${f1(v)}</td>` }).join('')}</tr>`).join('')}<tr><td>Today’s cream or white callsign</td><td class="num">${f1(contrast('#FBFAF0', '#6E6A2E'))}</td><td class="num">${f1(contrast('#EAFBF3', '#1F6E52'))}</td><td class="num">${f1(contrast('#18202C', '#FFFFFF'))}</td></tr></tbody></table></div><p class="pg-sub">Below 4.5 (in red) is too faint for letters this small.</p>`
/* ---- the puck demonstration, drawn with the app's own puck ---- */
const pk = (cls, nm, role, q, style = '') => `<span class="seat"><span class="puck ${cls}"${style ? ` style="${style}"` : ''}><span class="nm">${nm}</span><span class="role ${q}">${role}</span></span></span>`
const pucks = `<div class="pg-pucks">
<figure><div class="row">${pk('sm', 'Hunter', 'IP', 'q-ins')}${pk('r sm', 'Wisp', 'C', 'q-c')}${pk('sm warn hard boxred', 'Saber', 'IP', 'q-ins')}</div><figcaption>Today: a pilot, a WSO, and a pilot with a red warning.</figcaption></figure>
<figure><div class="row">${pk('sm', 'Hunter', 'IP', 'q-ins', 'background:#8FA6FF;color:#08131b')}${pk('r sm', 'Wisp', 'C', 'q-c', 'background:#4FEBC8;color:#08131b')}${pk('sm warn hard boxred', 'Saber', 'IP', 'q-ins', 'background:#FF9548;color:#08131b')}</div><figcaption>Recoloured for AL2, AL3 and AL4: which is the pilot, which the WSO? And the orange one reads as a warning.</figcaption></figure>
</div>`

/* ---- the pictures ---- */
const SURF = [['edit', 'Edit Schedule'], ['view', 'View Schedule'], ['board', 'Scheduler Board']]
const LOOK = { a: 'today', b: 'colour only, no chips, today’s colours', c: 'my recommendation, proposed colours' }
const shots = SURF.map(([k, title], n) => `<h3>${n + 1}. ${title}</h3>` + ['phone', 'desktop'].map(sz => `<div class="pg-shots${sz === 'phone' ? ' ph' : ''}">${['a', 'b', 'c'].map(l => { const f = `img/${k}-${l}-${sz}.png`
  if (!existsSync(join(HERE, f))) throw new Error('missing picture ' + f)
  return `<figure><a href="${f}"><img src="${f}" loading="lazy" alt="${title} on a ${sz}: ${LOOK[l]}"></a><figcaption><b>${n + 1}${l}</b> ${sz === 'phone' ? 'iPhone' : 'Desktop'}: ${LOOK[l]}</figcaption></figure>` }).join('')}</div>`).join('')).join('')

/* ---- the captured surfaces ---- */
const clean = h => h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/ contenteditable="true"/g, '').replace(/ tabindex="0"/g, '')
  .replace(/<(input|textarea)\b/g, '<$1 readonly tabindex="-1"').replace(/<(select|button)\b/g, '<$1 tabindex="-1"')
const surfaces = ['waiting', 'out'].flatMap(st => SURF.map(([k]) => `<div class="tt-surf" data-surf="${k}" data-st="${st}">${clean(read(`capture/${k}-${st}-desktop.html`))}</div>`)).join('\n')

const css = read('capture/app.css').replace(/<\/style/gi, '<\\/style')
const js = p => read(p).replace(/<\/script/gi, '<\\/script')
const out = read('src/frame.html')
  .replace('/*APPCSS*/', () => css).replace('/*LOOKSCSS*/', () => read('src/looks.css')).replace('/*PAGECSS*/', () => read('src/page.css'))
  .replace('<!--SURFACES-->', () => surfaces)
  .replace('<!--SW:today-->', () => swatch(TODAY)).replace('<!--SW:new-->', () => swatch(NEW)).replace('<!--SW:cvd-->', () => cvd)
  .replace('<!--T:spent:today-->', () => spentTable(TODAY)).replace('<!--T:spent:new-->', () => spentTable(NEW))
  .replace('<!--T:pairs-->', () => pairsTable()).replace('<!--T:puckname-->', () => puckName).replace('<!--PUCKS-->', () => pucks)
  .replace('<!--SHOTS-->', () => shots)
  .replace('/*LOOKSJS*/', () => js('src/looks.js')).replace('/*TRYJS*/', () => js('src/tryout.js'))
if (/<!--[A-Z:a-z]+-->|\/\*[A-Z]+\*\//.test(out.slice(out.indexOf('<body')))) console.log('WARNING: a placeholder is left in the page')
writeFileSync(join(HERE, 'index.html'), out)
console.log('index.html', (out.length / 1024).toFixed(0) + ' KB')

/* ---- the figures, for the report ---- */
if (process.argv.includes('--tables')) {
  for (const [nm, list] of [['TODAY', TODAY], ['PROPOSED', NEW]]) {
    console.log('\n' + nm + ' | contrast on week ' + WEEK + ' / board ' + BOARD + ' | nearest spent colour')
    list.forEach((c, i) => { const near = SPENT.map(([s, w]) => [de00(c, s), s]).sort((a, b) => a[0] - b[0])[0]; console.log(`| ${al(i)} | ${c} ${NAME[c]} | ${f1(contrast(c, WEEK))} | ${f1(contrast(c, BOARD))} | ${near[1]} ${f1(near[0])} | deutan ${sim(c, 'deutan')} protan ${sim(c, 'protan')} |`) })
    console.log('pairs: normal / worst of normal, deutan, protan')
    list.forEach((a, i) => console.log('| ' + al(i) + ' | ' + list.map((b, j) => i === j ? '-' : f0(de00(a, b)) + '/' + f0(worst(a, b))).join(' | ') + ' |'))
    for (const n of [2, 3, 4, 7]) { const h = hardest(list, n, de00), g = hardest(list, n, cbOnly); console.log(`first ${n}: hardest normal ${f1(h.d)} (${al(h.i)}/${al(h.j)}), hardest red-green ${f1(g.d)} (${al(g.i)}/${al(g.j)})`) }
  }
  console.log('\ncallsign on pucks'); NEW.forEach((c, i) => console.log(al(i), PUCKS.map(p => p[1] + ' ' + f1(contrast(c, p[0]))).join(' | ')))
}
