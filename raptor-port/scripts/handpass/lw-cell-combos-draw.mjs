// [LW-CELL-COMBOS] step 2 — the pictures for his page: a set of hard cases laid into real day cells of the built grid,
// today beside each candidate fix (lw-cell-combos-options.mjs), at his iPhone's size (opening zoom 0.8, and the smallest
// 0.4) and a desktop's. Every cell is pictured on its own (cropped to the cell) and the whole row once at true size.
// The cell markup is the measuring script's (lw-cell-combos-measure.mjs `markup`), copied here so a running measurement
// never loads a half-edited file. SIZE=phone|desk  LW_DIST=<build>
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
process.env.LW_OUT ||= '2026-11-06-lw-cell-combos/draw'
const L = await import('./lw-rr-lib.mjs')
const { CSS, remap } = await import('./lw-cell-combos-options.mjs')
const SIZE = process.env.SIZE || 'phone'
const OUT = L.OUT
mkdirSync(OUT, { recursive: true })

const KIND = { B: 'med', C: 'med', LL: 'll', OL: 'ol', OIL: 'oilt', FO: 'oil', HO: 'oil', CCL: 'care', CSE: 'cse', OD: 'od', OML: 'med', OTH: 'unav', ATCH: 'unav', PERS: 'unav' }
const code = (t, edge) => ({ text: t, kind: KIND[t.replace('*', '')], edge: !!edge })
const box = (t, place, edge, state) => ({ c: code(t, edge), place, state })
const letters = t => t.replace('*', '').length
const wideOf = t => letters(t) > 3 ? ' wide w4' : letters(t) > 2 ? ' wide' : ''
/* the hard cases — his two from 6 Nov 26 first (Cobra's FO beside an Attach, an Attach beside an Other) */
export const CASES = [
  { n: 1, say: 'FO award beside a whole-day Attach (his Cobra, Sat 26 Dec)', boxes: [box('FO', 'left'), box('ATCH', 'right', 1)], tiles: [] },
  { n: 2, say: 'Attach beside an Other, both whole days (his Cobra, Sun 27 Dec)', boxes: [box('ATCH', 'left', 1), box('OTH', 'right', 1)], tiles: [] },
  { n: 3, say: 'Leave (LL) during a course (CSE)', boxes: [box('LL', 'left'), box('CSE', 'right', 1)], tiles: [] },
  { n: 4, say: 'Overseas leave (OL) pending, beside a medical (OML)', boxes: [box('OL', 'left', 0, 'w'), box('OML', 'right', 1)], tiles: [] },
  { n: 5, say: 'A whole day of leave and an HO in the morning', boxes: [box('LL', 'left'), box('HO', 'right-am')], tiles: [] },
  { n: 6, say: 'A course and leave in the afternoon', boxes: [box('CSE', 'left', 1), box('OIL', 'right-pm')], tiles: [] },
  { n: 7, say: 'Three entries: one box and "+2"', boxes: [box('LL', 'whole')], tiles: ['more'] },
  { n: 8, say: 'A clash: "!" on a whole day', boxes: [box('CCL', 'whole')], tiles: ['warn'] },
  { n: 9, say: 'Leave on a posted-out day (grey PO)', boxes: [box('OL', 'whole')], tiles: ['po'] },
  { n: 10, say: 'Leave on his last day in (yellow PO)', boxes: [box('LL', 'whole')], tiles: ['last'] },
  { n: 11, say: 'A morning on his last day in', boxes: [box('OL', 'top'), box('LL', 'bot')], tiles: ['last'] },
  { n: 12, say: 'An afternoon on a posted-out day with "!"', boxes: [box('OIL', 'bot')], tiles: ['warn', 'po'] },
  { n: 13, say: 'Attach alone, whole day', boxes: [box('ATCH', 'whole', 1)], tiles: [] },
  { n: 14, say: "The app's own FO, alone", boxes: [box('FO*', 'whole', 1)], tiles: [] },
  { n: 15, say: 'A morning and an afternoon (fits today — the control)', boxes: [box('LL', 'top'), box('OD', 'bot', 1)], tiles: [] },
  { n: 16, say: 'A posted-out day: a course and leave in the afternoon', boxes: [box('CSE', 'left', 1), box('OIL', 'right-pm')], tiles: ['po'] },
  { n: 17, say: 'His last day in: an Attach in the morning, a medical in the afternoon', boxes: [box('ATCH', 'top', 1), box('OML', 'bot', 1)], tiles: ['last'] },
  { n: 18, say: 'His last day in: leave and an HO in the morning', boxes: [box('CCL', 'left'), box('HO', 'right-am')], tiles: ['last'] },
  { n: 19, say: 'His last day in: two whole days', boxes: [box('LL', 'left'), box('CSE', 'right', 1)], tiles: ['last'] },
]
function markup(cb0, map, star) {
  const cb = map ? remap(map, cb0) : { ...cb0, extraTd: [] }
  const places = cb.boxes.map(b => b.place)
  const lettersTop = places.some(p => p === 'top' || p === 'right-am')
  const lettersBot = places.some(p => p === 'bot' || p === 'right-pm')
  const mk = cb.tiles.includes('more') ? 'more' : cb.tiles.includes('warn') ? 'warn' : ''
  const poTag = cb.tiles.includes('po'), last = cb.tiles.includes('last')
  const mkLow = !!mk && lettersTop && !lettersBot && !poTag
  const poHigh = poTag && lettersBot && !lettersTop && !mk
  const td = ['act', poTag ? 'gone outlv' : '', last ? 'pofin' : '', mk ? 'mkd' : '', 'hasc', mkLow ? 'mklo' : '', poHigh ? 'pohi' : '', ...cb.extraTd].filter(Boolean).join(' ')
  const spans = cb.boxes.map(b => `<span class="c k-${b.c.kind} s-${b.state || 'a'} ${b.place}${wideOf(b.c.text)}${b.c.edge ? ' raptor' : ''}${b.extra || ''}${star && b.c.text.includes('*') ? ' cc-star' : ''}">${b.noText ? '' : b.c.text}</span>`).join('')
  const tiles = (mk ? `<span class="mk ${mk}">${mk === 'more' ? '+2' : '!'}</span>` : '') + (poTag ? '<span class="potag">PO</span>' : '') + (last ? '<span class="polast">PO</span>' : '')
  return { td, html: spans + tiles }
}
const LOOKS = [
  { id: 'today', css: '', map: null, z: SIZE === 'phone' ? 0.8 : 1 },
  { id: 'A', css: 'flags fit', map: 'stack flags', z: SIZE === 'phone' ? 0.8 : 1 },
  { id: 'B', css: 'edge flags fit', map: 'edge flags', z: SIZE === 'phone' ? 0.8 : 1 },
  { id: 'Apo', css: 'poflags makeway fit', map: 'stack poflags makeway', z: SIZE === 'phone' ? 0.8 : 1 },
  { id: 'C', css: 'floor marks fit scale', map: 'floor marks', z: SIZE === 'phone' ? 0.8 : 1 },
  { id: 'D', css: 'floor marks fit tilt scale', map: 'tilt floor marks', z: SIZE === 'phone' ? 0.8 : 1 },
  { id: 'E', css: 'floor marks fit tilt scale postrip', map: 'tilt floor marks postrip', z: SIZE === 'phone' ? 0.8 : 1 },
  { id: 'F', css: 'floor marks fit tilt scale postrip', map: 'tilt floor marks postrip postone', z: SIZE === 'phone' ? 0.8 : 1 },
  ...(SIZE === 'phone' ? [
    { id: 'today-far', css: '', map: null, z: 0.4 },
    { id: 'A-far', css: 'flags fit', map: 'stack flags', z: 0.4, far: true },
    { id: 'C-far', css: 'floor marks fit', map: 'floor marks', z: 0.4, far: true },
    { id: 'D-far', css: 'floor marks fit tilt scale', map: 'tilt floor marks', z: 0.4 },
  ] : []),
]

const w = await L.newCtx(SIZE)
await w.ctx.clock.install({ time: new Date(L.T0) })
const { serveDist } = await import('../drawcheck/lib.mjs')
await serveDist(w.ctx, L.ORIGIN, L.DIST)
w.page.setDefaultTimeout(20000)
await L.signInSaved(w, 'admin'); await L.toWar(w); await L.openGrid(w)
await w.page.waitForTimeout(800)
const P = w.page
/* the far look: at the smallest zooms the boxes keep their colours, no letters */
const FAR = '#page-leavewar table.mx.cc-far .c { color: transparent !important; text-decoration: none !important; }'
const shots = []
for (const look of LOOKS) {
  const css = look.css.split(' ').filter(Boolean).map(k => CSS[k]).join('\n') + '\n' + FAR
  const cells = CASES.map(c => markup(c, look.map, look.id !== 'today'))
  /* lay the cases into a row's cells clear of the pinned columns, two days apart so no box touches another case's */
  /* the zoom first, then a pause: the grid lays its months out again for a new zoom, which moves the cells */
  await P.evaluate(({ z }) => { const t = document.querySelector('#page-leavewar table.mx tbody td[data-testid^="cell-"]').closest('table'); t.style.zoom = String(z); t.style.setProperty('--lwz', String(z)) }, { z: look.z })
  await P.waitForTimeout(700)
  const info = await P.evaluate(({ css, cells, z, far }) => {
    let st = document.getElementById('cc-opt'); if (!st) { st = document.createElement('style'); st.id = 'cc-opt'; document.head.appendChild(st) }
    st.textContent = css
    const tbl = document.querySelector('#page-leavewar table.mx tbody td[data-testid^="cell-"]').closest('table')
    tbl.style.zoom = String(z); tbl.style.setProperty('--lwz', String(z)); tbl.classList.toggle('cc-far', !!far)
    tbl.classList.toggle('cc-small', /cc-small/.test(css) && z < 1)
    const vw = window.innerWidth
    const rows = [...tbl.querySelectorAll('tbody tr')].filter(r => r.querySelector('td[data-testid^="cell-"]'))
    /* two rows of people if one row cannot hold every case */
    const out = []
    let i = 0
    for (const r of rows.slice(2)) {
      if (i >= cells.length) break
      const pinR = Math.max(0, ...[...r.querySelectorAll('td.who, td.bal')].map(t => t.getBoundingClientRect().right))
      /* a cell is used only where it is itself on top at its middle: on a phone the names are a frozen copy laid over the
         grid (not the row's own pinned cell), and the date row and bars sit over the top rows */
      const onTop = td => { const b = td.getBoundingClientRect(); const e = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !!e && td.contains(e) }
      const tds = [...r.querySelectorAll('td[data-testid^="cell-"]')].filter(td => { const b = td.getBoundingClientRect(); return b.left > pinR + 2 && b.right < vw - 2 && b.width > 0 && b.top > 0 && b.bottom < innerHeight && onTop(td) })
      for (let k = 0; k < tds.length && i < cells.length; k += 2) {
        const td = tds[k]
        td.dataset.ccKeep = JSON.stringify([td.className, td.innerHTML])
        td.className = cells[i].td; td.innerHTML = cells[i].html
        out.push({ n: i + 1, id: td.getAttribute('data-testid') })
        i++
      }
    }
    return out
  }, { css, cells, z: look.z, far: look.far })
  await P.waitForTimeout(150)
  for (const c of info) {
    const r = await P.evaluate(id => { const b = document.querySelector(`[data-testid="${id}"]`).getBoundingClientRect(); return { x: b.left - 1, y: b.top - 1, width: b.width + 2, height: b.height + 2 } }, c.id)
    if (r.x < 0 || r.y < 0 || r.x + r.width > (SIZE === 'phone' ? 402 : 1536) || r.width < 3) { console.log('skipped (moved off screen)', look.id, c.n, JSON.stringify(r)); continue }
    if (process.env.CC_DEBUG) console.log(JSON.stringify(r), await P.evaluate(() => [window.scrollX, window.scrollY, innerWidth, innerHeight, visualViewport.scale, visualViewport.offsetTop]))
    const name = `${SIZE}-${look.id}-${String(c.n).padStart(2, '0')}.png`
    await P.screenshot({ path: path.join(OUT, name), clip: r })
    shots.push({ size: SIZE, look: look.id, n: c.n, file: name, z: look.z })
  }
  /* the strip at true size: the first row of cases */
  const strip = await P.evaluate(ids => { const rs = ids.map(id => document.querySelector(`[data-testid="${id}"]`).getBoundingClientRect()); const top = Math.min(...rs.map(r => r.top)), bot = Math.max(...rs.map(r => r.bottom)); return { x: Math.min(...rs.map(r => r.left)) - 2, y: top - 2, width: Math.max(...rs.map(r => r.right)) - Math.min(...rs.map(r => r.left)) + 4, height: bot - top + 4 } }, info.map(c => c.id))
  const VW = SIZE === 'phone' ? 402 : 1536, VH = SIZE === 'phone' ? 874 : 730
  strip.x = Math.max(0, strip.x); strip.y = Math.max(0, strip.y); strip.width = Math.min(strip.width, VW - strip.x); strip.height = Math.min(strip.height, VH - strip.y)
  await P.screenshot({ path: path.join(OUT, `${SIZE}-${look.id}-strip.png`), clip: strip }).catch(e => console.log('strip not taken', look.id, String(e).slice(0, 80)))
  await P.evaluate(() => { for (const td of document.querySelectorAll('td[data-cc-keep]')) { const [c, h] = JSON.parse(td.dataset.ccKeep); td.className = c; td.innerHTML = h; delete td.dataset.ccKeep } })
  console.log('drawn', SIZE, look.id, info.length)
}
writeFileSync(path.join(OUT, `shots-${SIZE}.json`), JSON.stringify({ cases: CASES.map(c => ({ n: c.n, say: c.say })), shots }, null, 1))
await w.ctx.browser().close()
console.log('done')
