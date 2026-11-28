// The night of 22–23 Nov 26, job 5 — the drawing check's comparing step (D1494, D1495): each approved drawing
// (docs/mock/2026-11-22-msq-b1-screens/img/<name>-<d|p>.png) against the built app's picture of the same state and size
// (<MQ_OUT>/<name>-<d|p>.png, taken by measure-night1/job2/job3/job4/job5). The two are laid on a canvas in a browser, the
// drawing's own marks (the pink "New" outlines and tags) are set aside, and every region where the pictures differ is
// listed in CSS pixels (the pictures are 2x): its place and size, and the picture's size difference. A side-by-side PNG
// (the drawing left, the build right, each region outlined in red on both) is written for every picture that differs.
//   MQ_OUT=<folder of the built pictures> node scripts/handpass/n149/compare-job5.mjs [name,name…]
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

const IMG = 'docs/mock/2026-11-22-msq-b1-screens/img'
const OUT = process.env.MQ_OUT || 'n149-out'
const ONLY = process.argv[2] ? process.argv[2].split(',') : null
const SBS = `${OUT}/sbs`
mkdirSync(SBS, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const page = await browser.newPage()
await page.setContent('<canvas id=c></canvas>')
const b64 = f => 'data:image/png;base64,' + readFileSync(f).toString('base64')
const names = readdirSync(IMG).filter(f => f.endsWith('.png')).map(f => f.replace('.png', ''))
const res = {}
for (const n of names) {
  if (ONLY && !ONLY.includes(n)) continue
  const alias = [`${OUT}/b1size/${n}.png`, `${OUT}/${n}.png`, `${OUT}/${n.replace(/-(d|p)$/, (m, z) => '-' + z + (z === 'd' ? '1440' : '390'))}.png`]
  const built = alias.find(f => existsSync(f)) || alias[1]
  if (!existsSync(built)) { res[n] = { missing: true }; continue }
  res[n] = await page.evaluate(async ({ a, b, n }) => {
    const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src })
    const [A, B] = await Promise.all([load(a), load(b)])
    const px = im => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, im.width, im.height) }
    const dA = px(A), dB = px(B)
    const W = Math.min(A.width, B.width), H = Math.min(A.height, B.height)
    const isPink = (d, o) => d.data[o] > 215 && d.data[o + 1] < 90 && d.data[o + 2] > 110 && d.data[o + 2] < 200
    const mask = new Uint8Array(W * H)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (isPink(dA, (y * A.width + x) * 4)) mask[y * W + x] = 1
    // widen the set-aside marks by 3 device px
    const m2 = new Uint8Array(W * H)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (mask[y * W + x]) for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < H && xx >= 0 && xx < W) m2[yy * W + xx] = 1 }
    const diff = new Uint8Array(W * H)
    let nd = 0
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (m2[y * W + x]) continue
      const oa = (y * A.width + x) * 4, ob = (y * B.width + x) * 4
      const d = Math.max(Math.abs(dA.data[oa] - dB.data[ob]), Math.abs(dA.data[oa + 1] - dB.data[ob + 1]), Math.abs(dA.data[oa + 2] - dB.data[ob + 2]))
      if (d > 48) { diff[y * W + x] = 1; nd++ }
    }
    // cells of 8 device px; a cell is "different" with 5 or more differing pixels; merge neighbours
    const C = 8, cw = Math.ceil(W / C), ch = Math.ceil(H / C), cell = new Uint8Array(cw * ch)
    for (let cy = 0; cy < ch; cy++) for (let cx = 0; cx < cw; cx++) {
      let k = 0
      for (let y = cy * C; y < Math.min(H, cy * C + C); y++) for (let x = cx * C; x < Math.min(W, cx * C + C); x++) k += diff[y * W + x]
      if (k >= 5) cell[cy * cw + cx] = 1
    }
    const seen = new Uint8Array(cw * ch), boxes = []
    for (let s = 0; s < cw * ch; s++) {
      if (!cell[s] || seen[s]) continue
      const st = [s]; seen[s] = 1; let L = 1e9, T = 1e9, R = -1, Bt = -1, cnt = 0
      while (st.length) {
        const c = st.pop(), cy = (c / cw) | 0, cx = c % cw
        L = Math.min(L, cx); R = Math.max(R, cx); T = Math.min(T, cy); Bt = Math.max(Bt, cy); cnt++
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const yy = cy + dy, xx = cx + dx; if (yy < 0 || xx < 0 || yy >= ch || xx >= cw) continue; const k = yy * cw + xx; if (cell[k] && !seen[k]) { seen[k] = 1; st.push(k) } }
      }
      // tight box of the differing pixels in it
      let l = 1e9, t = 1e9, r = -1, bb = -1
      for (let y = T * C; y < Math.min(H, Bt * C + C); y++) for (let x = L * C; x < Math.min(W, R * C + C); x++) if (diff[y * W + x]) { l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); bb = Math.max(bb, y) }
      boxes.push({ x: l / 2, y: t / 2, w: (r - l + 1) / 2, h: (bb - t + 1) / 2, cells: cnt })
    }
    boxes.sort((p, q) => q.w * q.h - p.w * p.h)
    // the side-by-side: scale so the pair is at most ~1800 css wide
    const sc = Math.min(1, 1800 / ((A.width + B.width) / 2 + 20))
    const gap = 20
    const cv = document.createElement('canvas'); cv.width = Math.round((A.width + B.width) * sc + gap); cv.height = Math.round(Math.max(A.height, B.height) * sc)
    const g = cv.getContext('2d'); g.fillStyle = '#888'; g.fillRect(0, 0, cv.width, cv.height)
    g.drawImage(A, 0, 0, A.width * sc, A.height * sc); g.drawImage(B, A.width * sc + gap, 0, B.width * sc, B.height * sc)
    g.strokeStyle = '#ff1010'; g.lineWidth = 2
    for (const bx of boxes.slice(0, 12)) for (const off of [0, A.width * sc + gap]) g.strokeRect(off + (bx.x * 2 - 4) * sc, (bx.y * 2 - 4) * sc, (bx.w * 2 + 8) * sc, (bx.h * 2 + 8) * sc)
    return { drawn: [A.width / 2, A.height / 2], built: [B.width / 2, B.height / 2], pct: +(100 * nd / (W * H)).toFixed(3), nboxes: boxes.length, boxes: boxes.slice(0, 10), sbs: cv.toDataURL('image/png').split(',')[1] }
  }, { a: b64(`${IMG}/${n}.png`), b: b64(built), n })
  const r = res[n]
  if (r.sbs) { writeFileSync(`${SBS}/${n}.png`, Buffer.from(r.sbs, 'base64')); delete r.sbs }
}
await browser.close()
writeFileSync(`${OUT}/compare.json`, JSON.stringify(res, null, 1))
for (const [n, r] of Object.entries(res)) console.log(n.padEnd(8), r.missing ? 'not taken' : `drawn ${r.drawn.join('x')} built ${r.built.join('x')} diff ${r.pct}% boxes ${r.nboxes}`)
