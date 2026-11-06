// [LW-CELL-COMBOS] step 1 (his D1723, D1725 — 6 Nov 26): every combination of entries on one Leave War day, MEASURED on the
// real build. Each combination is laid into a real day cell of the grid — the cell's classes and boxes exactly as the grid
// draws them (MatrixRows.tsx: pairPlaces, the wide / w4 letter steps, the corner tiles' mklo / pohi moves, the Inputs edge)
// — at the grid's own zoom (the table's `zoom`, as the pinch writes it), and for every box it measures whether its letters
// stand whole inside the box's edge and clear of the corner tiles and the 2px left edge. The same script re-run after the
// build is the re-walk (brief step 3).
//   SIZE=phone|desk  FONT=system|wide (wide = Verdana, wider than his iPhone's letters — e2e's LW_WIDE_LETTERS)
//   LW_DIST=<a built folder>  CC_OUT=<folder for the json + pictures>
//   ZOOMS=0.8,0.4,1.4 (phone default) | 1 (desk default)
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
process.env.LW_OUT ||= '2026-11-06-lw-cell-combos/measure'
const L = await import('./lw-rr-lib.mjs')
const SIZE = process.env.SIZE || 'phone'
const FONT = process.env.FONT || 'system'
const ZOOMS = (process.env.ZOOMS || (SIZE === 'phone' ? '0.8,0.4,1.4' : '1')).split(',').map(Number)
const OUT = L.OUT
mkdirSync(OUT, { recursive: true })
/* OPT=<option> measures a candidate fix (lw-cell-combos-options.mjs) — its markup and stylesheet over the real build */
const OPT = process.env.OPT || 'today'
const CLEAR_TAG = process.env.CLEAR === '1' ? '-clear' : ''
const { OPTIONS, CSS, remap } = await import('./lw-cell-combos-options.mjs')
if (!OPTIONS[OPT]) throw new Error('no option ' + OPT)
const tag = `${SIZE}-${FONT}${OPT === 'today' ? '' : '-' + OPT}${CLEAR_TAG}${process.env.ZOOMS && process.env.ZOOMS !== '0.8' && process.env.ZOOMS !== '1' ? '-z' + process.env.ZOOMS : ''}`
console.log('[lw-cell-combos-measure v1]', tag, ZOOMS.join(' '), L.DIST)

/* THE CODES the grid can draw (engine/codes.ts KIND, boxText), each with what decides its box: its kind (colour class),
   whether it can be a half day, whether it wears the Inputs page's 2px left edge (`offWar` — filed on the Inputs page, or
   the app's own credit). Leave is drawn both ways (placed on the war, or filed on the Inputs page); a hand award never wears
   the edge, the app's own (the star) always does. */
const KIND = { B: 'med', C: 'med', LL: 'll', OL: 'ol', OIL: 'oilt', FO: 'oil', HO: 'oil', CCL: 'care', FCL: 'care', PL: 'care', CL: 'care', EL: 'care', CSE: 'cse', OD: 'od', OML: 'med', HL: 'med',
  OTH: 'unav', ATCH: 'unav', TRG: 'unav', MTG: 'unav', PERS: 'unav', APPT: 'unav', DTY: 'unav', EVT: 'unav' }
const LEAVES = ['LL', 'OL', 'OIL', 'CCL', 'FCL', 'PL', 'CL', 'EL']
const CODES = [
  ...LEAVES.map(c => ({ id: c, text: c, edge: false })),
  ...LEAVES.map(c => ({ id: c + '~in', text: c, edge: true })),
  { id: 'FO', text: 'FO', edge: false, whole: true }, { id: 'HO', text: 'HO', edge: false, half: true },
  { id: 'FO*', text: 'FO*', edge: true, whole: true }, { id: 'HO*', text: 'HO*', edge: true, half: true },
  ...['B', 'C', 'OML', 'HL'].map(c => ({ id: c, text: c, edge: true })),
  { id: 'CSE', text: 'CSE', edge: true, whole: true }, { id: 'OD', text: 'OD', edge: true, whole: true },
  ...['OTH', 'ATCH', 'TRG', 'MTG', 'PERS', 'APPT', 'DTY', 'EVT'].map(c => ({ id: c, text: c, edge: true })),
].map(c => ({ ...c, kind: KIND[c.text.replace('*', '')] }))
const canWhole = c => !c.half
const canHalf = c => !c.whole
const letters = t => t.replace('*', '').length
const wideOf = t => letters(t) > 3 ? ' wide w4' : letters(t) > 2 ? ' wide' : ''

/* the corner tiles a cell can carry: the mark ("+n" grey for 3+ entries, "!" amber), the grey PO tag (a gone day holding
   an entry), the yellow PO of his last day in. The PO tag and the last-day PO never meet (a gone day is never his last
   day in); "+n" never stands beside two drawn boxes (with two both drawn "+1" says nothing — MatrixRows `mk`). */
const TILES1 = [[], ['more'], ['warn'], ['po'], ['last'], ['more', 'last'], ['warn', 'last'], ['more', 'po'], ['warn', 'po']]
const TILES2 = [[], ['warn'], ['po'], ['last'], ['warn', 'po'], ['warn', 'last']]

/* every combination: [boxes], tiles. A box: { code, place, state } */
const combos = []
const add = (fam, boxes, tiles) => combos.push({ fam, boxes, tiles })
for (const c of CODES) for (const tiles of TILES1) {
  if (canWhole(c)) add('one whole', [{ c, place: 'whole' }], tiles)
  if (canHalf(c)) { add('one morning', [{ c, place: 'top' }], tiles); add('one afternoon', [{ c, place: 'bot' }], tiles) }
}
for (const a of CODES) for (const b of CODES) for (const tiles of TILES2) {
  if (canWhole(a) && canWhole(b)) add('two whole, side by side', [{ c: a, place: 'left' }, { c: b, place: 'right' }], tiles)
  if (canWhole(a) && canHalf(b)) {
    add('a whole beside a morning', [{ c: a, place: 'left' }, { c: b, place: 'right-am' }], tiles)
    add('a whole beside an afternoon', [{ c: a, place: 'left' }, { c: b, place: 'right-pm' }], tiles)
  }
  if (canHalf(a) && canHalf(b)) add('a morning over an afternoon', [{ c: a, place: 'top' }, { c: b, place: 'bot' }], tiles)
}
/* the three looks of a bid (pending dashed, refused struck) on the leave codes, every place — the edge's width is the same
   1px inside, so these are a check that the look changes no fit */
for (const c of CODES.filter(c => LEAVES.includes(c.id))) for (const s of ['w', 'r']) {
  add(`one whole, ${s === 'w' ? 'pending' : 'refused'}`, [{ c, place: 'whole', state: s }], [])
  add(`one morning, ${s === 'w' ? 'pending' : 'refused'}`, [{ c, place: 'top', state: s }], ['warn'])
  add(`two whole, ${s === 'w' ? 'pending' : 'refused'}`, [{ c, place: 'left', state: s }, { c: CODES.find(x => x.id === 'ATCH'), place: 'right' }], [])
}
console.log('combinations:', combos.length)

/* the cell's classes and inner markup exactly as MatrixRows draws them */
/* OPT=build: the cell as the BUILT app draws it since [LW-CELL-COMBOS] step 3 (his D1727, D1728) — MatrixRows `pairLook`
   and the cell's `bx-` marks, with no stylesheet of ours on top: this is the re-walk of the build. */
function buildMarkup(cb) {
  const pl = cb.boxes.map(b => b.place)
  let looks = pl
  if (pl.length === 2 && pl[0] === 'left' && pl[1] === 'right') looks = ['left bx-tilt', 'right bx-tilt']
  else if (pl.length === 2 && pl[0] === 'left') looks = pl[1] === 'right-am' ? ['whole bx-floor bx-lo', 'top bx-roof bx-am'] : ['whole bx-floor bx-hi', 'bot bx-roof bx-pm']
  const warn = cb.tiles.includes('warn'), more = cb.tiles.includes('more') && !warn && cb.boxes.length === 1
  const po = cb.tiles.includes('po'), last = cb.tiles.includes('last')
  const mk = warn ? 'warn' : more ? 'more' : ''
  const td = ['act', po ? 'gone outlv bx-gone' : '', last ? 'pofin bx-last' : '', mk ? 'mkd' : '', 'hasc', warn ? 'bx-alarm' : '', more ? 'bx-pile' : ''].filter(Boolean).join(' ')
  const spans = cb.boxes.map((b, i) => `<span class="c k-${b.c.kind} s-${b.state || 'a'} ${looks[i]}${wideOf(b.c.text)}${b.c.text.includes('*') ? ' bx-star' : ''}${b.c.edge ? ' raptor' : ''}">${b.c.text}</span>`).join('')
  const tiles = (mk ? `<span class="mk ${mk}">${mk === 'more' ? '+2' : '!'}</span>` : '') + (last ? '<span class="polast">PO</span>' : '')
  return { td, html: spans + tiles }
}
function markup(cb0) {
  if (OPT === 'build') return buildMarkup(cb0)
  const cb = OPTIONS[OPT].map ? remap(OPTIONS[OPT].map, cb0) : { ...cb0, extraTd: [] }
  const places = cb.boxes.map(b => b.place)
  const lettersTop = places.some(p => p === 'top' || p === 'right-am')
  const lettersBot = places.some(p => p === 'bot' || p === 'right-pm')
  const mk = cb.tiles.includes('more') ? 'more' : cb.tiles.includes('warn') ? 'warn' : ''
  const poTag = cb.tiles.includes('po'), last = cb.tiles.includes('last')
  const mkLow = !!mk && lettersTop && !lettersBot && !poTag
  const poHigh = poTag && lettersBot && !lettersTop && !mk
  const td = ['act', poTag ? 'gone outlv' : '', last ? 'pofin' : '', mk ? 'mkd' : '', 'hasc', mkLow ? 'mklo' : '', poHigh ? 'pohi' : '', ...cb.extraTd].filter(Boolean).join(' ')
  const spans = cb.boxes.map(b => {
    const s = b.state || (LEAVES.includes(b.c.text) ? 'a' : 'a')
    return `<span class="c k-${b.c.kind} s-${s} ${b.place}${wideOf(b.c.text)}${b.c.edge ? ' raptor' : ''}${b.extra || ''}${OPT !== 'today' && b.c.text.includes('*') ? ' cc-star' : ''}">${b.noText ? '' : b.c.text}</span>`
  }).join('')
  const tiles = (mk ? `<span class="mk ${mk}">${mk === 'more' ? '+2' : '!'}</span>` : '') + (poTag ? '<span class="potag">PO</span>' : '') + (last ? '<span class="polast">PO</span>' : '')
  return { td, html: spans + tiles }
}
const prepared = combos.map(cb => ({ ...markup(cb), fam: cb.fam, label: cb.boxes.map(b => `${b.c.id}@${b.place}${b.state && b.state !== 'a' ? ':' + b.state : ''}`).join(' + ') + (cb.tiles.length ? ' [' + cb.tiles.join(',') + ']' : '') }))

/* ---- the world: the real build, signed in as the admin, on the grid ---- */
const w = await L.newCtx(SIZE)
if (FONT === 'wide') await w.page.addInitScript(() => {
  const add = () => { const s = document.createElement('style'); s.textContent = '*, *::before, *::after { font-family: Verdana, "DejaVu Sans", sans-serif !important }'; document.head.appendChild(s) }
  if (document.head) add(); else document.addEventListener('DOMContentLoaded', add)
})
await w.ctx.clock.install({ time: new Date(L.T0) })
const { serveDist } = await import('../drawcheck/lib.mjs')
await serveDist(w.ctx, L.ORIGIN, L.DIST)
w.page.setDefaultTimeout(20000)
await L.signInSaved(w, 'admin'); await L.toWar(w); await L.openGrid(w)
const optCss = (OPTIONS[OPT].css || '').split(' ').filter(Boolean).map(k => CSS[k]).join(String.fromCharCode(10))
if (optCss) await w.page.addStyleTag({ content: optCss })
await w.page.waitForTimeout(800)
const P = w.page

/* a row of real day cells in view, on a person's row (the first row of people) */
const host = await P.evaluate(() => {
  const vw = window.innerWidth
  const rows = [...document.querySelectorAll('#page-leavewar table.mx tbody tr')].filter(r => r.querySelector('td[data-testid^="cell-"]'))
  for (const r of rows.slice(2)) {
    /* clear of the pinned names and LVE columns, which are drawn over the days scrolled under them */
    const pinR = Math.max(0, ...[...r.querySelectorAll('td.who, td.bal')].map(t => t.getBoundingClientRect().right))
    const cells = [...r.querySelectorAll('td[data-testid^="cell-"]')].filter(td => { const b = td.getBoundingClientRect(); return b.left > pinR + 2 && b.right < vw - 2 && b.width > 0 })
    if (cells.length >= 8) return { ids: cells.map(c => c.getAttribute('data-testid')), font: getComputedStyle(cells[0]).fontFamily }
  }
  return null
})
if (!host) throw new Error('no row of day cells in view')
console.log('host cells', host.ids.length, 'font', host.font)

/* measure every combination in one cell, at one zoom: the boxes' letters against their room */
const SMALL = (OPTIONS[OPT].css || '').split(' ').includes('scale')
/* CLEAR=1: a letter touching its box's own edge line counts as not whole too (the design review of 6 Nov 26 — a letter on
   the ring reads cramped, and "inside the box" let it pass) */
const CLEAR = process.env.CLEAR === '1'
const measureAll = (items, z, cellId) => P.evaluate(({ items, z, cellId, small, build, clear }) => {
  const td = document.querySelector(`[data-testid="${cellId}"]`)
  const table = td.closest('table')
  const keep = { cls: td.className, html: td.innerHTML, zoom: table.style.zoom, lwz: table.style.getPropertyValue('--lwz') }
  table.style.zoom = String(z); table.style.setProperty('--lwz', String(z))
  table.classList.toggle('cc-small', !!small && z < 1)
  if (build) table.classList.toggle('lw-small', z < 1)   // the build's own class (Matrix `smallCls`), set by the zoom
  const out = []
  const TOL = 0.3
  for (const it of items) {
    td.className = it.td; td.innerHTML = it.html
    const cr = td.getBoundingClientRect()
    /* a tag drawn as a corner flag (a candidate fix) is a triangle, not its square: its right angle in the corner its
       coloured border stands on, the long side running from that edge's far end to the cell's right edge */
    const tiles = [...td.querySelectorAll('.mk, .potag, .polast')].map(e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e)
      const tri = parseFloat(s.fontSize) === 0 ? (parseFloat(s.borderTopWidth) > 0 ? 'top' : 'bottom') : ''
      return { k: e.className, l: r.left, r: r.right, t: r.top, b: r.bottom, tri } })
    const boxes = [...td.querySelectorAll('.c')].filter(e => e.textContent).map(e => {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e)
      const rg = document.createRange(); rg.selectNodeContents(e); const lt = rg.getBoundingClientRect()
      /* THE LETTERS' OWN PIXELS, not their line box: the same letters drawn on a hidden canvas in the same font, size and
         letter spacing, four times over, laid on the line's baseline — each pixel of ink a point. A tile is "over the
         letters" only where it covers a point of ink; a box "cuts" them only where ink falls outside it. (The line box runs
         a few px past the capitals and counted tiles clear of the letters.) Cached per font and text — a few hundred points. */
      const fsPx = parseFloat(cs.fontSize) * z
      const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) * z
      const S = 4
      const cv = (window.__ccCv ||= document.createElement('canvas').getContext('2d', { willReadFrequently: true }))
      const font = `${cs.fontWeight} ${fsPx}px ${cs.fontFamily}`
      cv.font = font
      if ('letterSpacing' in cv) cv.letterSpacing = `${ls}px`
      const m = cv.measureText(e.textContent)
      const scaleX = m.width ? ((cs.writingMode && cs.writingMode !== 'horizontal-tb') ? 1 : lt.width / m.width) : 1
      const ck = `${font}|${ls}|${e.textContent}|${scaleX.toFixed(3)}`
      const cache = (window.__ccInk ||= new Map())
      let ink = cache.get(ck)
      if (!ink) {
        const W = Math.ceil((lt.width + 12) * S), H = Math.ceil((fsPx * 2 + 6) * S), ox = 6, oy = fsPx + 3
        cv.canvas.width = W; cv.canvas.height = H
        cv.font = font; if ('letterSpacing' in cv) cv.letterSpacing = `${ls}px`
        cv.setTransform(S * scaleX, 0, 0, S, ox * S, oy * S)
        cv.fillStyle = '#000'; cv.textBaseline = 'alphabetic'
        cv.fillText(e.textContent, 0, 0)
        const d = cv.getImageData(0, 0, W, H).data
        ink = []
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 110) ink.push([(x + .5) / S - ox, (y + .5) / S - oy])
        cv.setTransform(1, 0, 0, 1, 0, 0)
        cache.set(ck, ink)
      }
      const fA = m.fontBoundingBoxAscent ?? fsPx * .9
      /* a turned box (his "read down to up", option D): the advance runs up from the line's bottom, the letters' tops
         face left — the baseline a vertical line `fA` in from the line box's left */
      const turned = cs.writingMode && cs.writingMode !== 'horizontal-tb'
      const base = lt.top + fA
      const pts = turned ? ink.map(([dx, dy]) => [lt.left + fA + dy, lt.bottom - dx * (lt.height / (m.width || 1))]) : ink.map(([dx, dy]) => [lt.left + dx, base + dy])
      const inkL = Math.min(...pts.map(p => p[0])), inkR = Math.max(...pts.map(p => p[0])), inkT = Math.min(...pts.map(p => p[1])), inkB = Math.max(...pts.map(p => p[1]))
      const inset = (/k-unav/.test(e.className) ? 1.5 : 1) * z          // the box's own edge line, 1px (1.5 outlined)
      const edgeL = /raptor|moved/.test(e.className) ? 2 * z : 0          // the Inputs page's (or a move's) 2px left edge
      const roomL = r.left + Math.max(inset, edgeL), roomR = r.right - inset
      const out = pts.filter(([x, y]) => x < r.left || x > r.right || y < r.top || y > r.bottom).length
      const underEdge = edgeL ? pts.filter(([x, y]) => x >= r.left && x < r.left + edgeL && y >= r.top && y <= r.bottom).length : 0
      const onLine = pts.filter(([x, y]) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom &&
        (x < r.left + inset || x > r.right - inset || (clear && (y < r.top + inset || y > r.bottom - inset)))).length
      const inTile = (q, x, y) => x > q.l && x < q.r && y > q.t && y < q.b && (!q.tri || (q.tri === 'top' ? x - q.l > y - q.t : x - q.l > q.b - y))
      const by = tiles.filter(q => pts.some(([x, y]) => inTile(q, x, y))).map(q => q.k.replace('mk ', ''))
      const cut = out > 0, vcut = false
      return { text: e.textContent, place: [...e.classList].find(c => /^(whole|top|bot|left|right|right-am|right-pm)$/.test(c)),
        fs: +fsPx.toFixed(2), boxW: +r.width.toFixed(2), boxH: +r.height.toFixed(2),
        room: +(roomR - roomL).toFixed(2), need: +(inkR - inkL).toFixed(2), short: +Math.max(0, (inkR - inkL) - (roomR - roomL)).toFixed(2),
        inkH: +(inkB - inkT).toFixed(2), cut, edge: underEdge > 0, line: onLine > 0, by,
        ok: !cut && !underEdge && !by.length && !(clear && onLine > 0) }
    })
    out.push({ boxes, cellW: +cr.width.toFixed(2), cellH: +cr.height.toFixed(2) })
  }
  td.className = keep.cls; td.innerHTML = keep.html
  table.style.zoom = keep.zoom; if (keep.lwz) table.style.setProperty('--lwz', keep.lwz); else table.style.removeProperty('--lwz')
  return out
}, { items, z, cellId, small: SMALL, build: OPT === 'build', clear: CLEAR })

const results = []
for (const z of ZOOMS) {
  const t0 = Date.now()
  for (let i = 0; i < prepared.length; i += 400) {
    const chunk = prepared.slice(i, i + 400)
    const res = await measureAll(chunk.map(p => ({ td: p.td, html: p.html })), z, host.ids[3])
    res.forEach((r, j) => results.push({ zoom: z, fam: chunk[j].fam, label: chunk[j].label, ...r }))
  }
  console.log(`zoom ${z}: measured ${prepared.length} in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
}

/* ---- the summary: by family, letters, zoom — how many fail and why ---- */
const fam = {}
for (const r of results) {
  const k = `${r.zoom}|${r.fam}`
  const f = fam[k] ||= { zoom: r.zoom, fam: r.fam, n: 0, fail: 0, cut: 0, covered: 0, worst: 0, fails: [] }
  f.n++
  const bad = r.boxes.filter(b => !b.ok)
  if (bad.length) {
    f.fail++
    if (bad.some(b => b.cut || b.edge)) f.cut++
    if (bad.some(b => b.by.length)) f.covered++
    f.worst = Math.max(f.worst, ...bad.map(b => b.short))
    if (f.fails.length < 400) f.fails.push(r.label + ' :: ' + bad.map(b => `${b.text}@${b.place} ${b.fs}px need ${b.need} room ${b.room}${b.cut ? ' CUT' : ''}${b.edge ? ' EDGE' : ''}${b.by.length ? ' under ' + b.by.join('+') : ''}`).join(' | '))
  }
}
/* and per box kind: which letters fail in which place, whatever the tiles (the families the drawing answers) */
const per = {}
for (const r of results) for (const b of r.boxes) {
  const tiles = (r.label.match(/\[(.*)\]$/) || [, ''])[1]
  const k = `${r.zoom}|${b.place}|${b.text}|${tiles}`
  const e = per[k] ||= { zoom: r.zoom, place: b.place, text: b.text, tiles, fs: b.fs, room: b.room, need: b.need, n: 0, bad: 0, by: new Set() }
  e.n++; if (!b.ok) { e.bad++; b.by.forEach(x => e.by.add(x)); if (b.cut) e.by.add("cut"); if (b.edge) e.by.add("inputs-edge") }
  e.room = Math.min(e.room, b.room); e.need = Math.max(e.need, b.need)
}
const perRows = Object.values(per).map(e => ({ ...e, by: [...e.by] }))
writeFileSync(path.join(OUT, `measure-${tag}.json`), JSON.stringify({ size: SIZE, font: FONT, hostFont: host.font, zooms: ZOOMS, combos: prepared.length,
  families: Object.values(fam), perBox: perRows }, null, 1))
writeFileSync(path.join(OUT, `measure-${tag}-all.json`), JSON.stringify(results))
for (const f of Object.values(fam)) console.log(`${tag} z${f.zoom}  ${f.fam.padEnd(34)} ${String(f.fail).padStart(5)} / ${String(f.n).padEnd(5)} fail  (cut ${f.cut}, under a tile ${f.covered}, worst ${f.worst.toFixed(1)}px short)`)

/* ---- pictures: one strip of real cells per family that fails at the opening zoom, the failing ones laid side by side ---- */
if (process.env.PICS !== '0') {
  const z = ZOOMS[0]
  const failing = Object.values(fam).filter(f => f.zoom === z && f.fail)
  for (const f of failing) {
    const labels = new Set(f.fails.map(s => s.split(' :: ')[0]))
    /* one of each distinct look: pick up to N failing combinations with distinct box letters */
    const seen = new Set(), pick = []
    for (const p of prepared) if (p.fam === f.fam && labels.has(p.label)) { const key = p.label.replace(/~in/g, ''); if (!seen.has(key)) { seen.add(key); pick.push(p) } }
    const N = host.ids.length - 1
    for (let s = 0, part = 1; s < Math.min(pick.length, N * 3); s += N, part++) {
      const strip = pick.slice(s, s + N)
      await P.evaluate(({ strip, ids, z }) => {
        const first = document.querySelector(`[data-testid="${ids[0]}"]`); first.closest('table').style.zoom = String(z)
        window.__ccKeep = ids.map(id => { const td = document.querySelector(`[data-testid="${id}"]`); return [id, td.className, td.innerHTML] })
        strip.forEach((it, i) => { const td = document.querySelector(`[data-testid="${ids[i + 1]}"]`); td.className = it.td; td.innerHTML = it.html })
      }, { strip: strip.map(p => ({ td: p.td, html: p.html })), ids: host.ids, z })
      const box = await P.evaluate(({ a, b }) => { const r1 = document.querySelector(`[data-testid="${a}"]`).getBoundingClientRect(), r2 = document.querySelector(`[data-testid="${b}"]`).getBoundingClientRect(); return { x: r1.left - 2, y: r1.top - 3, width: r2.right - r1.left + 4, height: r1.height + 6 } }, { a: host.ids[0], b: host.ids[strip.length] })
      const name = `fail-${tag}-z${z}-${f.fam.replace(/[^a-z]+/gi, '-')}-${part}.png`
      await P.screenshot({ path: path.join(OUT, name), clip: box })
      writeFileSync(path.join(OUT, name.replace('.png', '.txt')), strip.map((p, i) => `${i + 1}. ${p.label}`).join('\n'))
      await P.evaluate(({ z }) => { for (const [id, c, h] of window.__ccKeep) { const td = document.querySelector(`[data-testid="${id}"]`); td.className = c; td.innerHTML = h } }, { z })
    }
  }
}
await w.ctx.browser().close()
console.log('done', tag)
