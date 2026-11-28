// k0p-p1-measure - Part 1's drawing comparison: each drawing and the build's picture of the same part, measured on their
// pixels (both 2x pictures: every figure printed is in picture pixels; /2 = screen points), then laid side by side.
// Per image: the cyan main button's box (if any) and the edges (brightness steps over 14 between neighbours, merged
// within 3px) along the scan lines named in ./k0p-p1-scans.json ({ "<pair>": { "drawing": [["row", y], ["col", x]], "build": [...] } }).
//   node raptor-port/scripts/handpass/n194/k0p-p1-measure.mjs [side]   ('side' also writes the side-by-side pictures)
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { OUT, ROOT, sideBySide, closeAll } from './k0p-lib.mjs'
const { chromium } = createRequire(resolve(ROOT, 'package.json'))('playwright')
console.log('k0p-p1-measure v2')
const HERE = dirname(fileURLToPath(import.meta.url))
const DRAWN = resolve(ROOT, 'docs/mock/2026-11-25-msq-pick-guard-q3/drawn')
const PAIRS = { 'closed-d': [`${DRAWN}/s3-8-d-column-crop.png`, `${OUT}/p1-1-closed-d-crop.png`], 'closed-p': [`${DRAWN}/s2-10-p-waiting-crop.png`, `${OUT}/p1-1-closed-p-crop.png`], 'open-d': [`${DRAWN}/s1-add2-a-d-crop.png`, `${OUT}/p1-2-open-d-crop.png`], 'open-p': [`${DRAWN}/s1-add2-a-p-crop.png`, `${OUT}/p1-2-open-p-crop.png`] }
const SC = existsSync(resolve(HERE, 'k0p-p1-scans.json')) ? JSON.parse(readFileSync(resolve(HERE, 'k0p-p1-scans.json'), 'utf8')) : {}
const b = await chromium.launch(); const p = await (await b.newContext()).newPage()
const d = f => 'data:image/png;base64,' + readFileSync(f).toString('base64')
for (const [k, [a, c]] of Object.entries(PAIRS)) for (const [who, f] of [['drawing', a], ['build', c]]) {
  const r = await p.evaluate(async ([src, lines]) => {
    const im = new Image(); im.src = src; await im.decode()
    const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight
    const g = cv.getContext('2d'); g.drawImage(im, 0, 0); const D = g.getImageData(0, 0, cv.width, cv.height).data
    const W = cv.width, H = cv.height, px = (x, y) => { const i = (y * W + x) * 4; return [D[i], D[i + 1], D[i + 2]] }, L = (x, y) => { const [r, gg, bb] = px(x, y); return 0.3 * r + 0.59 * gg + 0.11 * bb }
    let cx0 = 1e9, cy0 = 1e9, cx1 = -1, cy1 = -1
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const [r, gg, bb] = px(x, y); if (r < 110 && gg > 170 && bb > 200) { cx0 = Math.min(cx0, x); cy0 = Math.min(cy0, y); cx1 = Math.max(cx1, x); cy1 = Math.max(cy1, y) } }
    const cyan = cx1 > 0 ? { x: cx0, y: cy0, w: cx1 - cx0 + 1, h: cy1 - cy0 + 1 } : null
    const out = []
    for (const [kind, n] of lines || []) {
      const e = []
      if (kind === 'row') { for (let x = 1; x < W; x++) if (Math.abs(L(x, n) - L(x - 1, n)) > 14 && (!e.length || x - e[e.length - 1] > 3)) e.push(x) }
      else { for (let y = 1; y < H; y++) if (Math.abs(L(n, y) - L(n, y - 1)) > 14 && (!e.length || y - e[e.length - 1] > 3)) e.push(y) }
      out.push(`${kind}${n}: ${e.join(',')}`)
    }
    return { size: [W, H], cyan, out }
  }, [d(f), (SC[k] || {})[who]])
  console.log(`MEASURE ${k} ${who} size=${r.size} cyan=${JSON.stringify(r.cyan)}`)
  for (const l of r.out) console.log(`   ${k} ${who} ${l}`)
}
await b.close()
if (process.argv[2] === 'side') for (const [k, [a, c]] of Object.entries(PAIRS)) await sideBySide(`p1-side-${k}`, a, c, 'Drawing (approved)', 'Build (K2a)')
await closeAll()
