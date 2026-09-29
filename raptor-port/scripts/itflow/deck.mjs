/* The IT flow guide deck ([IT-FLOW-GUIDE], D410–D413): a map of every journey, the two work flows (the life of a
   day; the Leave War's), then each journey's slides — real screenshots, numbered click marks, arrows, a short
   caption per step and a "What to test" box; where the app offers several ways to do a thing, a slide shows the
   ways side by side (D412).
     node scripts/itflow/deck.mjs <shotsDir> <out.pptx>
   <shotsDir> is capture.mjs's output (its manifest places the marks). The WORDS are in content.mjs; this file is
   only the layout. pptxgenjs is NOT an app dependency — install it beside the run, never into package.json:
   `npm i --no-save pptxgenjs` (or point ITFLOW_MODULES at a folder whose node_modules has it). The PDF is
   PowerPoint's own export (pdf.ps1), so it matches the deck. */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { JOURNEYS, PAGES, FLOWS } from './content.mjs'

const req = createRequire(process.env.ITFLOW_MODULES ? join(process.env.ITFLOW_MODULES, 'x.js') : import.meta.url)
const PptxGenJS = req('pptxgenjs')

const SHOTS = process.argv[2]
const OUT = process.argv[3] || 'raptor-it-flow-guide.pptx'
const MAN = JSON.parse(readFileSync(join(SHOTS, 'manifest.json'), 'utf8'))

/* The palette: the app's own navy and cyan for the frame of things; orange for a CLICK, green for WHAT YOU
   SHOULD SEE — the two mark colours are the deck's one visual language, repeated on every slide. */
const C = {
  ink: '14202E', muted: '5D6B7C', line: 'D5DCE4', card: 'F1F4F8', navy: '0F2236', cyan: '1FA9CF',
  click: 'EF7D1A', see: '23A55A', everyone: '1FA9CF', admin: '0F2236', white: 'FFFFFF',
}
const FONT = 'Calibri'
const W = 13.333, H = 7.5
const WHO = {
  everyone: { label: 'Everyone', fill: C.everyone },
  admin: { label: 'Admin only', fill: C.admin },
}

/* Slide numbers: the map, then the work flows, then every journey's slides in order. A journey with no slides
   yet still shows on the map. */
const FIRST = 2 + FLOWS.length
const slideOf = {}
let TOTAL = FIRST - 1
for (const j of JOURNEYS) { if (j.slides?.length) { slideOf[j.n] = TOTAL + 1; TOTAL += j.slides.length } }
const ref = n => slideOf[n] ?? '—'

const pres = new PptxGenJS()
pres.layout = 'LAYOUT_WIDE'
pres.title = 'RAPTOR — how the app works'

const txt = (slide, text, o) => slide.addText(text, { fontFace: FONT, color: C.ink, margin: 0, isTextBox: true, ...o })
const img = id => join(SHOTS, `${id}.jpg`)

function footer(slide, i) {
  txt(slide, `RAPTOR · how the app works · ${i} / ${TOTAL}`, { x: 0.5, y: H - 0.38, w: 6, h: 0.25, fontSize: 9, color: C.muted })
}

/* The key to the two marks, top right of every journey slide. */
function legend(slide, x, y) {
  slide.addShape(pres.shapes.OVAL, { x, y: y + 0.02, w: 0.22, h: 0.22, fill: { color: C.click }, line: { color: C.click } })
  txt(slide, '1', { x, y: y + 0.02, w: 0.22, h: 0.22, fontSize: 9, bold: true, color: C.white, align: 'center', valign: 'middle' })
  txt(slide, 'click', { x: x + 0.28, y, w: 0.55, h: 0.26, fontSize: 10.5, color: C.muted, valign: 'middle' })
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.9, y: y + 0.03, w: 0.3, h: 0.2, rectRadius: 0.05, fill: { type: 'none' }, line: { color: C.see, width: 2 } })
  txt(slide, 'what you should see', { x: x + 1.27, y, w: 1.6, h: 0.26, fontSize: 10.5, color: C.muted, valign: 'middle' })
}

/* A screenshot in a frame, with its marks laid over it as real shapes (editable in PowerPoint). `w` is its width;
   `maxH`, when given, caps the height (the picture then narrows to keep its shape). Returns its box. */
function picture(slide, id, x, y, w, maxH) {
  const m = MAN[id]
  if (!m) throw new Error(`no shot ${id} in the manifest — run capture.mjs first`)
  let h = w * m.h / m.w
  if (maxH && h > maxH) { const k = maxH / h; x += w * (1 - k) / 2; w *= k; h = maxH }
  slide.addShape(pres.shapes.RECTANGLE, { x: x - 0.03, y: y - 0.03, w: w + 0.06, h: h + 0.06, fill: { color: C.white }, line: { color: C.line, width: 1 },
    shadow: { type: 'outer', color: '000000', blur: 6, offset: 2, angle: 90, opacity: 0.18 } })
  slide.addImage({ path: img(id), x, y, w, h })
  const pad = 0.035
  for (const k of m.marks) {
    const bx = x + k.x * w - pad, by = y + k.y * h - pad, bw = k.w * w + 2 * pad, bh = k.h * h + 2 * pad
    const col = k.see ? C.see : C.click
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y: by, w: bw, h: bh, rectRadius: 0.04, fill: { type: 'none' }, line: { color: col, width: 2.5 } })
    if (!k.see) {
      /* The badge sits OUTSIDE its ring so it never covers what it points at: by default to the left, centred;
         'r' to the right; 't' / 'b' above / below at the left end ('tr' / 'br' at the right end). */
      const d = 0.27, pos = k.pos || 'l'
      let ox = bx - d - 0.03, oy = by + bh / 2 - d / 2
      if (pos === 'r') ox = bx + bw + 0.03
      if (/^[tb]/.test(pos)) { oy = pos[0] === 't' ? by - d - 0.02 : by + bh + 0.02; ox = pos[1] === 'r' ? bx + bw - d : bx }
      slide.addShape(pres.shapes.OVAL, { x: ox, y: oy, w: d, h: d, fill: { color: C.click }, line: { color: C.white, width: 1.5 } })
      txt(slide, String(k.n), { x: ox, y: oy, w: d, h: d, fontSize: 11, bold: true, color: C.white, align: 'center', valign: 'middle' })
    }
  }
  return { x, y, w, h }
}

/* One caption line: an orange numbered dot (a click) or a small green ring (what you should see), then words. */
function capLine(s, l, x, y, w, size = 13) {
  if (l.see) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: y + 0.07, w: 0.26, h: 0.17, rectRadius: 0.04, fill: { type: 'none' }, line: { color: C.see, width: 2 } })
  } else if (l.n != null) {
    s.addShape(pres.shapes.OVAL, { x, y: y + 0.02, w: 0.27, h: 0.27, fill: { color: C.click }, line: { color: C.click } })
    txt(s, String(l.n), { x, y: y + 0.02, w: 0.27, h: 0.27, fontSize: 11, bold: true, color: C.white, align: 'center', valign: 'middle' })
  }
  txt(s, l.t, { x: x + 0.36, y, w: w - 0.36, h: 0.31, fontSize: size, valign: 'middle', bold: !l.see, fit: 'shrink' })
}

function whoPill(slide, who, x, y) {
  const w = WHO[who]
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.25, h: 0.34, rectRadius: 0.17, fill: { color: w.fill }, line: { color: w.fill } })
  txt(slide, w.label, { x, y, w: 1.25, h: 0.34, fontSize: 12, bold: true, color: C.white, align: 'center', valign: 'middle' })
}

/* The head of every journey slide: JOURNEY n (· part k of m), its title, who, where, the mark key. */
function head(s, j, sl, k) {
  const part = j.slides.length > 1 ? `  ·  ${k + 1} OF ${j.slides.length}` : ''
  txt(s, `JOURNEY ${j.n}${part}`, { x: 0.5, y: 0.32, w: 5, h: 0.25, fontSize: 11, bold: true, color: C.cyan, charSpacing: 2 })
  txt(s, sl.title || j.title, { x: 0.5, y: 0.55, w: 7.4, h: 0.6, fontSize: 28, bold: true, fit: 'shrink' })
  whoPill(s, sl.who || j.who, 8.05, 0.66)
  txt(s, [{ text: 'Where  ', options: { color: C.muted } }, { text: sl.where || j.where, options: { bold: true } }],
    { x: 9.42, y: 0.66, w: 3.45, h: 0.34, fontSize: 12, valign: 'middle', fit: 'shrink' })
  legend(s, 10.2, 0.2)
}

/* The "What to test" box across the foot: hand checks on the left, the automated tests on the right. */
function testBox(s, sl, by) {
  const bh = H - by - 0.5
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: by, w: W - 1, h: bh, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.line, width: 1 } })
  txt(s, 'What to test', { x: 0.75, y: by + 0.12, w: 4, h: 0.32, fontSize: 15, bold: true, color: C.navy })
  txt(s, 'By hand, in the running app', { x: 0.75, y: by + 0.45, w: 6, h: 0.24, fontSize: 10.5, bold: true, color: C.muted })
  txt(s, sl.checks.map((c, k) => ({ text: c, options: { bullet: { code: '2610' }, breakLine: k < sl.checks.length - 1 } })),
    { x: 0.75, y: by + 0.72, w: 6.55, h: bh - 0.82, fontSize: 11, valign: 'top', paraSpaceAfter: 2, fit: 'shrink' })
  txt(s, 'Automated tests that cover it', { x: 7.6, y: by + 0.45, w: 5, h: 0.24, fontSize: 10.5, bold: true, color: C.muted })
  txt(s, sl.tests.flatMap(([f, what], k) => [
    { text: f, options: { bold: true, fontFace: 'Consolas', fontSize: 10, color: C.navy } },
    { text: '  ' + what, options: { breakLine: k < sl.tests.length - 1, fontSize: 10.5 } },
  ]), { x: 7.6, y: by + 0.72, w: 5.05, h: bh - 0.82, valign: 'top', paraSpaceAfter: 2, fit: 'shrink' })
}

/* ---- the map ---- */
function chip(s, j, x, y, w, h = 0.54) {
  const f = WHO[j.who].fill
  const more = j.slides?.length > 1 ? `  (${j.slides.length} slides)` : ''
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.07, fill: { color: f }, line: { color: f } })
  txt(s, [
    { text: String(j.n) + '  ', options: { bold: true, fontSize: 12 } },
    { text: j.title, options: { fontSize: 10.5 } },
    ...(more ? [{ text: more, options: { fontSize: 9 } }] : []),
  ], { x: x + 0.08, y, w: w - 0.14, h, color: C.white, valign: 'middle', fit: 'shrink' })
}

function mapSlide() {
  const s = pres.addSlide()
  s.background = { color: C.white }
  txt(s, 'How RAPTOR works — every journey', { x: 0.5, y: 0.35, w: 9, h: 0.6, fontSize: 30, bold: true })
  txt(s, 'Sign in, then pick a page from the top bar. Each numbered journey has its own slide.', { x: 0.5, y: 0.95, w: 9, h: 0.35, fontSize: 14, color: C.muted })
  let kx = 9.85
  for (const k of ['everyone', 'admin']) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: kx, y: 0.5, w: 0.34, h: 0.24, rectRadius: 0.08, fill: { color: WHO[k].fill }, line: { color: WHO[k].fill } })
    txt(s, WHO[k].label, { x: kx + 0.42, y: 0.49, w: 1.1, h: 0.26, fontSize: 11, color: C.muted, valign: 'middle' })
    kx += 1.5
  }
  const sx = 0.5, sy = 1.75, sw = 1.75
  txt(s, 'Sign in', { x: sx, y: sy - 0.32, w: sw, h: 0.28, fontSize: 13, bold: true })
  const sp = picture(s, 'map-login', sx, sy, sw)
  chip(s, JOURNEYS.find(j => j.page === 'signin'), sx, sy + sp.h + 0.15, sw)
  txt(s, `The two work flows — how these follow one another — are slides 2 and ${1 + FLOWS.length}.`, { x: 0.5, y: 5.9, w: 2.0, h: 0.8, fontSize: 10.5, color: C.muted, valign: 'top' })

  const cx0 = 2.75, colW = 1.37, gap = 0.08, busY = 1.55
  s.addShape(pres.shapes.LINE, { x: sx + sw + 0.05, y: sy + sp.h / 2, w: 0.3, h: 0, line: { color: C.navy, width: 2 } })
  s.addShape(pres.shapes.LINE, { x: sx + sw + 0.35, y: busY, w: 0, h: sy + sp.h / 2 - busY, line: { color: C.navy, width: 2 } })
  const busEnd = cx0 + PAGES.length * (colW + gap) - gap - colW / 2
  s.addShape(pres.shapes.LINE, { x: sx + sw + 0.35, y: busY, w: busEnd - (sx + sw + 0.35), h: 0, line: { color: C.navy, width: 2 } })
  txt(s, 'THE TOP BAR', { x: cx0 + 0.02, y: busY - 0.27, w: 2, h: 0.22, fontSize: 9, bold: true, color: C.navy, charSpacing: 1 })
  PAGES.forEach(([p, name], i) => {
    const x = cx0 + i * (colW + gap)
    s.addShape(pres.shapes.LINE, { x: x + colW / 2, y: busY, w: 0, h: 0.32, line: { color: C.navy, width: 2, endArrowType: 'triangle' } })
    txt(s, name, { x, y: 1.93, w: colW, h: 0.26, fontSize: 12, bold: true, align: 'center' })
    const th = picture(s, `map-${p}`, x, 2.25, colW)
    let y = 2.25 + th.h + 0.18
    for (const j of JOURNEYS.filter(j => j.page === p)) { chip(s, j, x, y, colW); y += 0.62 }
  })
  const tj = JOURNEYS.find(j => j.page === 'topbar')
  txt(s, 'On every page, in the top bar:', { x: cx0, y: 6.55, w: 2.6, h: 0.4, fontSize: 11, color: C.muted, valign: 'middle' })
  chip(s, tj, cx0 + 2.55, 6.55, 3.2, 0.4)
  footer(s, 1)
}

/* ---- a work flow: two lanes, the stages in the order they happen, each a small real picture, its words and
   its journey slide; right-angled connectors, and a dashed loop under the lanes for the way back round ---- */
function flowSlide(f, i) {
  const s = pres.addSlide()
  s.background = { color: C.white }
  txt(s, f.title, { x: 0.5, y: 0.35, w: 11, h: 0.6, fontSize: 30, bold: true })
  txt(s, f.sub, { x: 0.5, y: 0.95, w: 12, h: 0.35, fontSize: 14, color: C.muted })
  const laneY = [1.55, 4.2], laneH = 2.45, x0 = 1.6, cols = Math.max(...f.stages.map(st => st.col)) + 1
  const colW = (W - 0.5 - x0) / cols, boxW = Math.min(1.33, colW - 0.28)
  f.lanes.forEach((name, k) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: laneY[k], w: W - 1, h: laneH, rectRadius: 0.1, fill: { color: k ? 'E8EDF3' : 'EAF6FA' }, line: { color: C.line, width: 1 } })
    txt(s, name, { x: 0.62, y: laneY[k] + 0.1, w: 0.92, h: laneH - 0.2, fontSize: 13, bold: true, color: k ? C.admin : C.cyan, valign: 'middle' })
  })
  const box = f.stages.map(st => {
    const x = x0 + st.col * colW, y = laneY[st.lane] + 0.18, ph = boxW * 0.62
    if (MAN[st.shot]) {
      s.addShape(pres.shapes.RECTANGLE, { x: x - 0.02, y: y - 0.02, w: boxW + 0.04, h: ph + 0.04, fill: { color: C.white }, line: { color: C.line, width: 1 } })
      s.addImage({ path: img(st.shot), x, y, w: boxW, h: ph, sizing: { type: 'cover', w: boxW, h: ph } })
    }
    txt(s, st.t, { x, y: y + ph + 0.08, w: boxW + 0.12, h: 0.62, fontSize: 11, bold: true, valign: 'top', fit: 'shrink' })
    const refs = st.j.map(ref)
    txt(s, (refs.length > 1 ? 'slides ' : 'slide ') + refs.join(', '), { x, y: y + ph + 0.72, w: boxW, h: 0.24, fontSize: 10, color: C.muted })
    return { x, y, w: boxW, h: ph }
  })
  const seg = (x1, y1, x2, y2, o = {}) => s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2),
    w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), flipH: x2 < x1, flipV: y2 < y1, line: { color: C.navy, width: 2, ...o } })
  for (const [a, b, label] of f.links) {
    const A = box[a], B = box[b]
    if (label) {
      const o = { color: C.click, dashType: 'dash' }, yb = laneY[1] + laneH - 0.14, ax = A.x + A.w / 2, bx = B.x + B.w / 2
      seg(ax, A.y + A.h + 1.02, ax, yb, o)
      seg(ax, yb, bx, yb, o)
      seg(bx, yb, bx, B.y + B.h + 1.02, { ...o, endArrowType: 'triangle' })
      txt(s, label, { x: Math.min(ax, bx) + 0.1, y: yb - 0.28, w: 2.4, h: 0.24, fontSize: 10.5, bold: true, color: C.click })
      continue
    }
    const ax = A.x + A.w + 0.02, ay = A.y + A.h / 2, bx = B.x - 0.02, by = B.y + B.h / 2, mx = (ax + bx) / 2
    if (Math.abs(ay - by) < 0.01) { seg(ax, ay, bx, by, { endArrowType: 'triangle' }); continue }
    seg(ax, ay, mx, ay); seg(mx, ay, mx, by); seg(mx, by, bx, by, { endArrowType: 'triangle' })
  }
  if (f.foot) txt(s, f.foot(ref), { x: 0.5, y: 6.78, w: W - 1, h: 0.3, fontSize: 11, color: C.muted })
  footer(s, i)
}

/* ---- a journey's STEPS slide: the pictures left to right, an arrow between each, a caption under each ---- */
function stepsSlide(j, sl, k, i) {
  const s = pres.addSlide()
  s.background = { color: C.white }
  head(s, j, sl, k)
  const n = sl.steps.length, arrowW = 0.42, left = 0.5, py = 1.45
  const pw = (W - 2 * left - (n - 1) * arrowW) / n
  const lines = Math.max(...sl.steps.map(st => st.lines.length))
  const maxH = Math.min(4.55 - py - 0.17 - lines * 0.34, Math.max(...sl.steps.map(st => pw * MAN[st.shot].h / MAN[st.shot].w)))
  sl.steps.forEach((st, q) => {
    const x = left + q * (pw + arrowW)
    const p = picture(s, st.shot, x, py, pw, maxH)
    if (q < n - 1) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + pw + 0.08, y: py + maxH / 2 - 0.16, w: arrowW - 0.16, h: 0.32, fill: { color: C.navy }, line: { color: C.navy } })
    let ly = py + maxH + 0.17
    for (const l of st.lines) { capLine(s, l, x, ly, pw); ly += 0.34 }
  })
  testBox(s, sl, 4.72)
  footer(s, i)
}

/* ---- a journey's WAYS slide (D412): the same end reached several ways, side by side — a way's name, its
   picture, its short steps; no arrows between them, since they are alternatives, not a sequence ---- */
function waysSlide(j, sl, k, i) {
  const s = pres.addSlide()
  s.background = { color: C.white }
  head(s, j, sl, k)
  if (sl.intro) txt(s, sl.intro, { x: 0.5, y: 1.2, w: W - 1, h: 0.3, fontSize: 13, color: C.muted })
  const n = sl.ways.length, gap = 0.3, left = 0.5, py = 1.62
  const pw = (W - 2 * left - (n - 1) * gap) / n
  const lines = Math.max(...sl.ways.map(w => w.lines.length))
  const maxH = Math.min(4.6 - py - 0.56 - lines * 0.31, Math.max(...sl.ways.map(w => pw * MAN[w.shot].h / MAN[w.shot].w)))
  sl.ways.forEach((w, q) => {
    const x = left + q * (pw + gap)
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: py, w: pw, h: 0.34, rectRadius: 0.06, fill: { color: C.navy }, line: { color: C.navy } })
    txt(s, [{ text: `WAY ${String.fromCharCode(65 + q)}  `, options: { bold: true, color: C.cyan } }, { text: w.t, options: { bold: true } }],
      { x: x + 0.1, y: py, w: pw - 0.2, h: 0.34, fontSize: 12, color: C.white, valign: 'middle', fit: 'shrink' })
    const p = picture(s, w.shot, x, py + 0.46, pw, maxH)
    let ly = py + 0.46 + maxH + 0.1
    for (const l of w.lines) { capLine(s, l, x, ly, pw, 11.5); ly += 0.31 }
  })
  testBox(s, sl, 4.72)
  footer(s, i)
}

/* ---- a RIPPLE slide (D415): one action on the left, every place it reaches by itself on the right — each a
   small real picture, the page, what it shows there — joined to the action by one bracket line ---- */
function rippleSlide(j, sl, k, i) {
  const s = pres.addSlide()
  s.background = { color: C.white }
  head(s, j, sl, k)
  const ax = 0.5, ay = 1.45, aw = 3.3
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ax, y: ay, w: aw, h: 0.34, rectRadius: 0.06, fill: { color: C.click }, line: { color: C.click } })
  txt(s, 'ONE ACTION', { x: ax + 0.1, y: ay, w: aw - 0.2, h: 0.34, fontSize: 11, bold: true, color: C.white, valign: 'middle', charSpacing: 1 })
  const ap = picture(s, sl.action.shot, ax, ay + 0.46, aw, 1.95)
  let ly = ay + 0.46 + ap.h + 0.1
  for (const l of sl.action.lines) { capLine(s, l, ax, ly, aw, 12); ly += 0.31 }
  const n = sl.places.length, cols = n > 4 ? 3 : 2, rows = Math.ceil(n / cols)
  const gx = 4.45, gw = W - 0.5 - gx, gap = 0.22, cw = (gw - (cols - 1) * gap) / cols, rh = (4.55 - 1.45) / rows
  s.addShape(pres.shapes.LINE, { x: ax + aw + 0.1, y: ay + 1.2, w: gx - (ax + aw + 0.1) - 0.2, h: 0, line: { color: C.navy, width: 2 } })
  s.addShape(pres.shapes.LINE, { x: gx - 0.1, y: 1.6, w: 0, h: rows * rh - 0.35, line: { color: C.navy, width: 2 } })
  txt(s, 'SHOWS UP BY ITSELF IN', { x: gx, y: 1.2, w: 4, h: 0.22, fontSize: 9.5, bold: true, color: C.navy, charSpacing: 1 })
  sl.places.forEach((p, q) => {
    const x = gx + (q % cols) * (cw + gap), y = 1.47 + Math.floor(q / cols) * rh
    s.addShape(pres.shapes.LINE, { x: gx - 0.1, y: y + 0.45, w: 0.07, h: 0, line: { color: C.navy, width: 2, endArrowType: 'triangle' } })
    const ph = rh - 0.62
    const pp = picture(s, p.shot, x, y, Math.min(cw, ph * (MAN[p.shot].w / MAN[p.shot].h)))
    txt(s, [{ text: p.page + '  ', options: { bold: true } }, { text: p.t }], { x, y: y + pp.h + 0.05, w: cw, h: 0.5, fontSize: 10.5, valign: 'top', fit: 'shrink' })
  })
  testBox(s, sl, 4.72)
  footer(s, i)
}

const KIND = { steps: stepsSlide, ways: waysSlide, ripple: rippleSlide }
mapSlide()
FLOWS.forEach((f, k) => flowSlide(f, 2 + k))
for (const j of JOURNEYS) (j.slides || []).forEach((sl, k) => KIND[sl.kind || 'steps'](j, sl, k, slideOf[j.n] + k))
await pres.writeFile({ fileName: OUT })
console.log('wrote', OUT, `(${TOTAL} slides)`)
