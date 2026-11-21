// Makes raptor-port/docs/mock/_c6check/draw.mjs: the approved drawing script, its pictures written to C6_OUT, with one
// added piece, c6: the Q8 flow driven for real on this build (no transform), the note measured; then the drawing's own
// transform laid on the same moment (the first wording, all bold, marked New) and measured, so the drawing's note and
// the built note are measured on one build; then the approved picture's note box read from its pink mark.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
// Run from raptor-port/: node docs/img/handpass/2026-11-21-msq-reshape/schedule/c6-make-check.mjs ; then, through the
// lock: npm run build && C6_OUT=<this folder, absolute> MQ_ONLY=c6 node docs/mock/_c6check/draw.mjs ; then delete
// docs/mock/_c6check. Run 21 Nov 26 on claude/msq-b1-schedule at 27f104918 (bundle index-CHXRkgkL.js): c6-report.json.
const WT = process.cwd().split('\\').join('/')
let s = readFileSync(WT + '/docs/mock/2026-11-20-multi-sqn-reshape/draw.mjs', 'utf8')
const must = (a) => { if (!s.includes(a)) throw new Error('anchor missing: ' + a) }
must("const OUT = resolve(HERE, 'img')")
s = s.replace("const OUT = resolve(HERE, 'img')", () => "const OUT = resolve(process.env.C6_OUT)\nconst APPROVED = resolve(HERE, '../2026-11-20-multi-sqn-reshape/img')")
const RUN = '// ===================== run ====================='
must(RUN)
const piece = String.raw`
const C6_WORDS = "Blocked: Ranger is 149's from Thu 16 Jul. Only Ranger or an admin of both 142 and 149 can change leave that runs across his move."
const measureNote = p => p.evaluate(() => {
  const t = document.getElementById('toastEl'), R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) } }
  const cs = e => { if (!e) return null; const c = getComputedStyle(e); return { color: c.color, weight: c.fontWeight, size: c.fontSize, family: c.fontFamily.slice(0, 40) } }
  const b = t.querySelector('b'), rest = t.querySelector('.bk-rest'), sign = t.querySelector('.bk-sign'), c = getComputedStyle(t)
  return { face: t.dataset.face || '', at: t.dataset.at || '', note: R(t), bg: c.backgroundColor, border: c.borderTopColor + ' ' + c.borderTopWidth, radius: c.borderTopLeftRadius, sign: R(sign), lead: { ...R(b), text: b ? b.textContent : null, ...cs(b) }, rest: rest ? { ...R(rest), text: rest.textContent, ...cs(rest) } : null }
})
// the note box from a picture's pink mark: rows / columns where the outline runs most of the way are its edges; the mark
// is drawn 2px outside the box, 2px wide, so the box is 4 CSS px in from its outer edge
async function pinkBox(file, dpr) {
  const b = browsers.d || (browsers.d = await chromium.launch())
  const ctx = await b.newContext(); const pg = await ctx.newPage()
  const data = 'data:image/png;base64,' + readFileSync(file).toString('base64')
  const r = await pg.evaluate(async data => {
    const im = new Image(); im.src = data; await im.decode()
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0)
    const d = x.getImageData(0, 0, c.width, c.height).data, W = c.width, H = c.height
    const pk = (i) => d[i] > 225 && d[i + 1] < 90 && d[i + 2] > 110 && d[i + 2] < 190
    const rows = new Array(H).fill(0), cols = new Array(W).fill(0)
    for (let y = 0; y < H; y++) for (let X = 0; X < W; X++) if (pk((y * W + X) * 4)) { rows[y]++; cols[X]++ }
    const ry = rows.map((n, y) => n > 200 ? y : -1).filter(y => y >= 0), cx = cols.map((n, X) => n > 40 ? X : -1).filter(X => X >= 0)
    return { W, H, top: Math.min(...ry), bottom: Math.max(...ry), left: Math.min(...cx), right: Math.max(...cx) }
  }, data)
  await ctx.close()
  const k = 1 / dpr, o = 4
  return { x: +(r.left * k + o).toFixed(1), y: +(r.top * k + o).toFixed(1), w: +((r.right - r.left + 1) * k - 2 * o).toFixed(1), h: +((r.bottom - r.top + 1) * k - 2 * o).toFixed(1) }
}
// the approved picture above, the build below, each cut to the note and some room round it, the note ringed on both
async function sideBySide(file, a, b, boxA, boxB, dpr) {
  const br = browsers.d || (browsers.d = await chromium.launch())
  const ctx = await br.newContext(); const pg = await ctx.newPage()
  const u = f => 'data:image/png;base64,' + readFileSync(f).toString('base64')
  const png = await pg.evaluate(async ({ A, B, boxA, boxB, dpr }) => {
    const load = async s => { const i = new Image(); i.src = s; await i.decode(); return i }
    const ia = await load(A), ib = await load(B), pad = 24
    const L = Math.max(0, Math.min(boxA.x, boxB.x) - pad), T = Math.max(0, Math.min(boxA.y, boxB.y) - pad)
    const Rr = Math.max(boxA.x + boxA.w, boxB.x + boxB.w) + pad, Bb = Math.max(boxA.y + boxA.h, boxB.y + boxB.h) + pad
    const w = (Rr - L) * dpr, h = (Bb - T) * dpr, lab = 22 * dpr
    const c = document.createElement('canvas'); c.width = w; c.height = 2 * (h + lab); const x = c.getContext('2d')
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#000'; x.font = (14 * dpr) + 'px sans-serif'
    x.fillText('Approved drawing (8b, first wording)', 6 * dpr, 16 * dpr); x.drawImage(ia, L * dpr, T * dpr, w, h, 0, lab, w, h)
    x.fillText('Built (approved wording)', 6 * dpr, h + lab + 16 * dpr); x.drawImage(ib, L * dpr, T * dpr, w, h, 0, h + 2 * lab, w, h)
    x.strokeStyle = '#00c853'; x.lineWidth = 2 * dpr
    x.strokeRect((boxA.x - L) * dpr, lab + (boxA.y - T) * dpr, boxA.w * dpr, boxA.h * dpr)
    x.strokeRect((boxB.x - L) * dpr, h + 2 * lab + (boxB.y - T) * dpr, boxB.w * dpr, boxB.h * dpr)
    return c.toDataURL('image/png')
  }, { A: u(a), B: u(b), boxA, boxB, dpr })
  writeFileSync(join(OUT, file), Buffer.from(png.split(',')[1], 'base64'))
  await ctx.close()
}
const report = []
async function c6(sz) {
  const dpr = SIZES[sz].opts.deviceScaleFactor
  const w = await world(sz, { user: 'ad2', time: '2026-07-15T10:00:00', moves: RANGER_MOVE, toasts: true })
  const p = w.page
  await nav(w, 'inputs')
  if (!(await p.locator('#inNew:visible').count())) { await tap(w, p.locator('#inListBtn')); await sleep(800) }
  await tap(w, p.locator('#inNew')); await sleep(1400)
  await p.selectOption('#inpEditType', { label: 'LL' }); await sleep(500)
  const day = async a => { const d = p.locator('.inped-win .dcal-d[aria-label^="' + a + '"]').first(); await d.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await tap(w, d); await sleep(500) }
  await day('Tue 14 Jul 2026')
  const offered14 = await p.evaluate(() => [...document.querySelector('#inpEditPerson').options].some(o => o.text === 'Ranger'))
  await p.selectOption('#inpEditPerson', { label: 'Ranger' }); await sleep(500)
  await day('Fri 17 Jul 2026')
  const who = await p.evaluate(() => document.querySelector('#inpEditPerson').selectedOptions[0]?.text)
  if (!offered14 || who !== 'Ranger') throw new Error('C6 draft premise: ' + JSON.stringify({ offered14, who }))
  const before = await p.evaluate(() => (window.INPUTS || []).length)
  await tap(w, p.locator('#inpEditSave')); await sleep(1200)
  const nd = p.locator('button:visible', { hasText: /^No document$/ }).last()
  const docq = await nd.count()
  if (docq) { await tap(w, nd); await sleep(350) }
  const open = await p.locator('.inped-win:visible').count()
  const after = await p.evaluate(() => (window.INPUTS || []).length)
  const built = await measureNote(p)
  const words = await p.evaluate(() => document.getElementById('toastEl').innerText.replace(/\s+/g, ' ').trim())
  if (built.face !== 'blocked' || words !== C6_WORDS || !open || after !== before) throw new Error('C6 built premise: ' + JSON.stringify({ built, words, open, before, after }))
  await shot(w, 'c6-built-' + sz + '.png', { check: () => document.getElementById('toastEl').style.opacity === '1' || 'the note faded' })
  rec('c6-built-' + sz + '.png', 'Q8 / C6', sz, 'real', 'none', 'The build: Hunter files LL for Ranger 14 to 17 Jul across his move (Thu 16 Jul), Add pressed' + (docq ? ', then No document' : '') + '; the note reads the approved words, the window stays open, nothing kept.', JSON.stringify({ built, words, open: !!open, before, after }))
  // the drawing's own transform on the same moment: its first wording, all bold, marked New
  const m = await noteWords(w, Q8_WORDS, 'blocked')
  const drawn = await measureNote(p)
  await shot(w, 'c6-drawing-on-build-' + sz + '.png', { check: () => document.getElementById('toastEl').style.opacity === '1' || 'the note faded' })
  const approvedBox = await pinkBox(join(APPROVED, 'q8b-' + sz + '.png'), dpr)
  const rebuiltBox = await pinkBox(join(OUT, 'c6-drawing-on-build-' + sz + '.png'), dpr)
  await sideBySide('c6-side-' + sz + '.png', join(APPROVED, 'q8b-' + sz + '.png'), join(OUT, 'c6-built-' + sz + '.png'), approvedBox, built.note, dpr)
  const dif = (a, b) => ({ dx: +(b.x - a.x).toFixed(1), dy: +(b.y - a.y).toFixed(1), dw: +(b.w - a.w).toFixed(1), dh: +(b.h - a.h).toFixed(1) })
  report.push({ sz, approvedBox, rebuiltBox, drawnDom: drawn, built, noteBuiltVsApproved: dif(approvedBox, built.note), drawnDomVsPink: dif(rebuiltBox, drawn.note), signBuiltVsDrawn: dif(drawn.sign, built.sign), leadBuiltVsDrawn: dif(drawn.lead, built.lead) })
  await w.ctx.close()
}
`
s = s.replace(RUN, () => piece + RUN)
const PL = 'const PIECES = { q1, q2,'
must(PL)
s = s.replace(PL, () => 'const PIECES = { c6, q1, q2,')
const END = "console.log('errors:'"
must(END)
s = s.replace(END, () => "writeFileSync(join(OUT, 'c6-report.json'), JSON.stringify(report, null, 1))\n" + END)
mkdirSync(WT + '/docs/mock/_c6check', { recursive: true })
writeFileSync(WT + '/docs/mock/_c6check/draw.mjs', s)
console.log('ok', s.length)
