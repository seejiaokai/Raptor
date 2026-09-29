/* The IT flow guide deck ([IT-FLOW-GUIDE], D410): a map slide of every journey, then one slide per journey —
   real screenshots, numbered click marks, arrows, a short caption per step and a "What to test" box.
     node scripts/itflow/deck.mjs <shotsDir> <out.pptx>
   <shotsDir> is capture.mjs's output (its manifest places the marks). pptxgenjs is NOT an app dependency —
   install it beside the run, never into package.json: `npm i --no-save pptxgenjs` (or point ITFLOW_MODULES at
   a folder whose node_modules has it). The PDF is PowerPoint's own export (pdf.ps1), so it matches the deck.
   The words live in JOURNEYS below — plain, few, the app's own names; no rules-engine detail (his ask). */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

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

/* Every journey, in slide order. `page` groups it on the map; `built: false` journeys show on the map but have
   no slide yet (the sample carries one). Tests name the file and, in a few words, what it proves. */
const JOURNEYS = [
  { n: 1, title: 'Sign in, or ask for access', who: 'everyone', page: 'signin' },
  { n: 2, title: 'Build a day', who: 'admin', page: 'editsched' },
  {
    n: 3, title: 'Publish a day', who: 'admin', page: 'editsched', built: true,
    where: 'Edit Schedule',
    steps: [
      { shot: 'publish-1', lines: [{ n: 1, t: 'Open Edit Schedule' }, { n: 2, t: 'Pick the week' }] },
      { shot: 'publish-2', lines: [{ n: 3, t: 'Pick the four sign-off names' }, { n: 4, t: 'Press Publish day' }] },
      { shot: 'publish-3', lines: [{ see: true, t: 'The day wears ORIG' }, { see: true, t: 'Unpublish appears' }] },
      { shot: 'publish-4', lines: [{ see: true, t: 'View-only Sched shows ORIG' }, { see: true, t: '"Original — as issued"' }] },
    ],
    checks: [
      'Publish day stays locked until all four names are picked; its hover hint names who is missing.',
      'After publishing: the ORIG tag, the signed line, and "Monday published — APPROVED".',
      'A member (us / us) sees the issued day on View-only Sched and has no Edit Schedule.',
      'Reload the page: the day is still published.',
      'Change anything after signing: the names clear and Publish locks again.',
    ],
    tests: [
      ['pubsweep.test.tsx', 'sign, publish, ORIG, what viewers see'],
      ['publish.test.ts', 'the four sign-off roles; three of four stays locked'],
      ['signbind.test.ts', 'an edit after signing clears the names'],
      ['unpublish-button.test.tsx', 'Unpublish shows only where it should'],
      ['am-01-basics.mjs', 'walk script: the same, in a real browser'],
    ],
  },
  { n: 4, title: 'Amend a published day', who: 'admin', page: 'editsched' },
  { n: 5, title: 'Saved plans', who: 'admin', page: 'editsched' },
  { n: 6, title: 'Read the schedule, desktop and phone', who: 'everyone', page: 'viewsched' },
  { n: 7, title: 'File an input or a medical', who: 'everyone', page: 'inputs' },
  { n: 8, title: 'Update quals', who: 'everyone', page: 'quals' },
  { n: 9, title: 'Bid for leave', who: 'everyone', page: 'leavewar' },
  { n: 10, title: 'Run the Leave War', who: 'admin', page: 'leavewar' },
  { n: 11, title: "Track a student's progress", who: 'everyone', page: 'tracker' },
  { n: 12, title: 'Let people in, add a person', who: 'admin', page: 'admin' },
  { n: 13, title: 'Post out, archive, delete', who: 'admin', page: 'admin' },
  { n: 14, title: 'Squadron settings and rules', who: 'admin', page: 'admin' },
  { n: 15, title: 'Print, export and data', who: 'admin', page: 'admin' },
  { n: 16, title: 'Undo, redo and the change history', who: 'everyone', page: 'topbar' },
]
const PAGES = [
  ['editsched', 'Edit Schedule'], ['viewsched', 'View-only Sched'], ['inputs', 'Inputs'], ['quals', 'Quals'],
  ['leavewar', 'Leave War'], ['tracker', 'Tracker'], ['admin', 'Admin · Logic'],
]
const TOTAL = 1 + JOURNEYS.length

const pres = new PptxGenJS()
pres.layout = 'LAYOUT_WIDE'
pres.title = 'RAPTOR — how the app works'

const txt = (slide, text, o) => slide.addText(text, { fontFace: FONT, color: C.ink, margin: 0, isTextBox: true, ...o })
const img = id => join(SHOTS, `${id}.jpg`)

function footer(slide, i) {
  txt(slide, `RAPTOR · how the app works · ${i} / ${TOTAL}`, { x: 0.5, y: H - 0.38, w: 6, h: 0.25, fontSize: 9, color: C.muted })
}

/* The key to the two marks, top right of every slide. */
function legend(slide, x, y) {
  slide.addShape(pres.shapes.OVAL, { x, y: y + 0.02, w: 0.22, h: 0.22, fill: { color: C.click }, line: { color: C.click } })
  txt(slide, '1', { x, y: y + 0.02, w: 0.22, h: 0.22, fontSize: 9, bold: true, color: C.white, align: 'center', valign: 'middle' })
  txt(slide, 'click', { x: x + 0.28, y, w: 0.55, h: 0.26, fontSize: 10.5, color: C.muted, valign: 'middle' })
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.9, y: y + 0.03, w: 0.3, h: 0.2, rectRadius: 0.05, fill: { type: 'none' }, line: { color: C.see, width: 2 } })
  txt(slide, 'what you should see', { x: x + 1.27, y, w: 1.6, h: 0.26, fontSize: 10.5, color: C.muted, valign: 'middle' })
}

/* A screenshot in a frame, with its marks laid over it as real shapes (editable in PowerPoint). */
function picture(slide, id, x, y, w) {
  const m = MAN[id]
  if (!m) throw new Error(`no shot ${id} in the manifest — run capture.mjs first`)
  const h = w * m.h / m.w
  slide.addShape(pres.shapes.RECTANGLE, { x: x - 0.03, y: y - 0.03, w: w + 0.06, h: h + 0.06, fill: { color: C.white }, line: { color: C.line, width: 1 },
    shadow: { type: 'outer', color: '000000', blur: 6, offset: 2, angle: 90, opacity: 0.18 } })
  slide.addImage({ path: img(id), x, y, w, h })
  const pad = 0.035
  for (const k of m.marks) {
    const bx = x + k.x * w - pad, by = y + k.y * h - pad, bw = k.w * w + 2 * pad, bh = k.h * h + 2 * pad
    const col = k.see ? C.see : C.click
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y: by, w: bw, h: bh, rectRadius: 0.04, fill: { type: 'none' }, line: { color: col, width: 2.5 } })
    if (!k.see) {
      const d = 0.3
      const ox = /r/.test(k.pos || 'tl') ? bx + bw - d * 0.45 : bx - d * 0.55
      const oy = /b/.test(k.pos || 'tl') ? by + bh - d * 0.45 : by - d * 0.55
      slide.addShape(pres.shapes.OVAL, { x: ox, y: oy, w: d, h: d, fill: { color: C.click }, line: { color: C.white, width: 1.5 } })
      txt(slide, String(k.n), { x: ox, y: oy, w: d, h: d, fontSize: 12, bold: true, color: C.white, align: 'center', valign: 'middle' })
    }
  }
  return h
}

function whoPill(slide, who, x, y) {
  const w = WHO[who]
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.25, h: 0.34, rectRadius: 0.17, fill: { color: w.fill }, line: { color: w.fill } })
  txt(slide, w.label, { x, y, w: 1.25, h: 0.34, fontSize: 12, bold: true, color: C.white, align: 'center', valign: 'middle' })
}

/* ---- the map ---- */
function mapSlide() {
  const s = pres.addSlide()
  s.background = { color: C.white }
  txt(s, 'How RAPTOR works — every journey', { x: 0.5, y: 0.35, w: 9, h: 0.6, fontSize: 30, bold: true })
  txt(s, 'Sign in, then pick a page from the top bar. Each numbered journey has its own slide.', { x: 0.5, y: 0.95, w: 9, h: 0.35, fontSize: 14, color: C.muted })
  // who key
  let kx = 9.85
  for (const k of ['everyone', 'admin']) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: kx, y: 0.5, w: 0.34, h: 0.24, rectRadius: 0.08, fill: { color: WHO[k].fill }, line: { color: WHO[k].fill } })
    txt(s, WHO[k].label, { x: kx + 0.42, y: 0.49, w: 1.1, h: 0.26, fontSize: 11, color: C.muted, valign: 'middle' })
    kx += 1.5
  }

  // Sign in, on the left
  const sx = 0.5, sy = 1.75, sw = 1.75
  txt(s, 'Sign in', { x: sx, y: sy - 0.32, w: sw, h: 0.28, fontSize: 13, bold: true })
  const sh = picture(s, 'map-login', sx, sy, sw)
  chip(s, JOURNEYS[0], sx, sy + sh + 0.15, sw)

  // the top bar: a line across, one drop into each page's column
  const cx0 = 2.75, colW = 1.37, gap = 0.08
  const busY = 1.55
  s.addShape(pres.shapes.LINE, { x: sx + sw + 0.05, y: sy + sh / 2, w: 0.3, h: 0, line: { color: C.navy, width: 2, endArrowType: 'none' } })
  s.addShape(pres.shapes.LINE, { x: sx + sw + 0.35, y: busY, w: 0, h: sy + sh / 2 - busY, line: { color: C.navy, width: 2 } })
  const busEnd = cx0 + PAGES.length * (colW + gap) - gap - colW / 2
  s.addShape(pres.shapes.LINE, { x: sx + sw + 0.35, y: busY, w: busEnd - (sx + sw + 0.35), h: 0, line: { color: C.navy, width: 2 } })
  txt(s, 'THE TOP BAR', { x: cx0 + 0.02, y: busY - 0.27, w: 2, h: 0.22, fontSize: 9, bold: true, color: C.navy, charSpacing: 1 })

  PAGES.forEach(([p, name], i) => {
    const x = cx0 + i * (colW + gap)
    s.addShape(pres.shapes.LINE, { x: x + colW / 2, y: busY, w: 0, h: 0.32, line: { color: C.navy, width: 2, endArrowType: 'triangle' } })
    txt(s, name, { x, y: 1.93, w: colW, h: 0.26, fontSize: 12, bold: true, align: 'center' })
    const th = picture(s, `map-${p}`, x, 2.25, colW)
    let y = 2.25 + th + 0.18
    for (const j of JOURNEYS.filter(j => j.page === p)) { chip(s, j, x, y, colW); y += 0.62 }
  })

  // the top bar's own journey, on every page
  const tj = JOURNEYS.find(j => j.page === 'topbar')
  txt(s, 'On every page, in the top bar:', { x: cx0, y: 6.55, w: 2.6, h: 0.4, fontSize: 11, color: C.muted, valign: 'middle' })
  chip(s, tj, cx0 + 2.55, 6.55, 3.2, 0.4)
  footer(s, 1)
}

function chip(s, j, x, y, w, h = 0.54) {
  const f = WHO[j.who].fill
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.07, fill: { color: f }, line: { color: f } })
  txt(s, [
    { text: String(j.n) + '  ', options: { bold: true, fontSize: 12 } },
    { text: j.title, options: { fontSize: 10.5 } },
  ], { x: x + 0.08, y, w: w - 0.14, h, color: C.white, valign: 'middle', fit: 'shrink' })
}

/* ---- one journey ---- */
function journeySlide(j, i) {
  const s = pres.addSlide()
  s.background = { color: C.white }
  txt(s, `JOURNEY ${j.n}`, { x: 0.5, y: 0.32, w: 3, h: 0.25, fontSize: 11, bold: true, color: C.cyan, charSpacing: 2 })
  txt(s, j.title, { x: 0.5, y: 0.55, w: 7, h: 0.6, fontSize: 30, bold: true })
  whoPill(s, j.who, 7.2, 0.66)
  txt(s, [{ text: 'Where  ', options: { color: C.muted } }, { text: j.where, options: { bold: true } }], { x: 8.6, y: 0.66, w: 2, h: 0.34, fontSize: 12, valign: 'middle' })
  legend(s, 10.2, 0.2)

  // the steps: pictures left to right, an arrow between each
  const n = j.steps.length, arrowW = 0.42, left = 0.5
  const pw = (W - 2 * left - (n - 1) * arrowW) / n
  const py = 1.45
  j.steps.forEach((st, k) => {
    const x = left + k * (pw + arrowW)
    const ph = picture(s, st.shot, x, py, pw)
    if (k < n - 1) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + pw + 0.08, y: py + ph / 2 - 0.16, w: arrowW - 0.16, h: 0.32, fill: { color: C.navy }, line: { color: C.navy } })
    let ly = py + ph + 0.17
    for (const l of st.lines) {
      if (l.see) {
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: ly + 0.07, w: 0.26, h: 0.17, rectRadius: 0.04, fill: { type: 'none' }, line: { color: C.see, width: 2 } })
      } else {
        s.addShape(pres.shapes.OVAL, { x, y: ly + 0.02, w: 0.27, h: 0.27, fill: { color: C.click }, line: { color: C.click } })
        txt(s, String(l.n), { x, y: ly + 0.02, w: 0.27, h: 0.27, fontSize: 11, bold: true, color: C.white, align: 'center', valign: 'middle' })
      }
      txt(s, l.t, { x: x + 0.36, y: ly, w: pw - 0.36, h: 0.31, fontSize: 13, valign: 'middle', bold: !l.see })
      ly += 0.34
    }
  })

  // What to test
  const by = 4.72, bh = H - by - 0.5
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: by, w: W - 1, h: bh, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.line, width: 1 } })
  txt(s, 'What to test', { x: 0.75, y: by + 0.14, w: 4, h: 0.34, fontSize: 16, bold: true, color: C.navy })
  txt(s, 'By hand, in the running app', { x: 0.75, y: by + 0.5, w: 6, h: 0.26, fontSize: 11, bold: true, color: C.muted })
  txt(s, j.checks.map((c, k) => ({ text: c, options: { bullet: { code: '2610' }, breakLine: k < j.checks.length - 1 } })),
    { x: 0.75, y: by + 0.8, w: 6.55, h: bh - 0.95, fontSize: 11.5, valign: 'top', paraSpaceAfter: 3 })
  txt(s, 'Automated tests that cover it', { x: 7.6, y: by + 0.5, w: 5, h: 0.26, fontSize: 11, bold: true, color: C.muted })
  txt(s, j.tests.flatMap(([f, what], k) => [
    { text: f, options: { bold: true, fontFace: 'Consolas', fontSize: 10.5, color: C.navy } },
    { text: '  ' + what, options: { breakLine: k < j.tests.length - 1, fontSize: 11 } },
  ]), { x: 7.6, y: by + 0.8, w: 5.0, h: bh - 0.95, valign: 'top', paraSpaceAfter: 3 })
  footer(s, i)
}

mapSlide()
JOURNEYS.forEach(j => { if (j.built) journeySlide(j, 1 + j.n) })
await pres.writeFile({ fileName: OUT })
console.log('wrote', OUT)
