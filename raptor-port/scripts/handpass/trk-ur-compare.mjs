/* Compare the round's pictures of the build of main with the same steps on the build before pull request 603
   (trk-ur round, 2 Nov 26): pictures matched by step name, counted pixel by pixel in a browser canvas; for each pair
   that differs, a side-by-side picture with the differing area boxed in red.
     node trk-ur-compare.mjs <after folder> <before folder> <out folder> */
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'
console.log('trk-ur-compare v1')
const [A, B, OUT] = process.argv.slice(2).map(p => resolve(p))
mkdirSync(OUT, { recursive: true })
const key = f => f.replace(/^\d+-/, '')
const listA = Object.fromEntries(readdirSync(A).filter(f => f.endsWith('.png') && !f.endsWith('-tap.png')).map(f => [key(f), f]))
const listB = Object.fromEntries(readdirSync(B).filter(f => f.endsWith('.png') && !f.endsWith('-tap.png')).map(f => [key(f), f]))
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.setContent('<canvas id=c></canvas>')
const rows = []
for (const k of Object.keys(listA)) {
  if (!listB[k]) continue
  const a = 'data:image/png;base64,' + readFileSync(resolve(A, listA[k])).toString('base64')
  const b = 'data:image/png;base64,' + readFileSync(resolve(B, listB[k])).toString('base64')
  const r = await page.evaluate(async ([a, b]) => {
    const load = s => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = s })
    const ia = await load(a), ib = await load(b)
    if (ia.width !== ib.width || ia.height !== ib.height) return { size: true, wa: ia.width, ha: ia.height, wb: ib.width, hb: ib.height }
    const w = ia.width, h = ia.height
    const c = document.getElementById('c'); c.width = w; c.height = h
    const x = c.getContext('2d')
    x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, w, h).data
    x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, w, h).data
    let n = 0, x0 = w, y0 = h, x1 = -1, y1 = -1
    for (let i = 0; i < da.length; i += 4) {
      if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 48) {
        n++; const p = i / 4, px = p % w, py = (p - px) / w
        if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py
      }
    }
    if (!n) return { n: 0 }
    /* side by side: main on the left, before 603 on the right, the differing box in red on both */
    c.width = w * 2 + 12; c.height = h
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, h)
    x.drawImage(ia, 0, 0); x.drawImage(ib, w + 12, 0)
    x.strokeStyle = 'red'; x.lineWidth = 3
    x.strokeRect(x0 - 3, y0 - 3, x1 - x0 + 6, y1 - y0 + 6); x.strokeRect(w + 12 + x0 - 3, y0 - 3, x1 - x0 + 6, y1 - y0 + 6)
    return { n, box: [x0, y0, x1, y1], png: c.toDataURL('image/png') }
  }, [a, b])
  if (r.png) { writeFileSync(resolve(OUT, 'diff-' + k), Buffer.from(r.png.split(',')[1], 'base64')); delete r.png }
  rows.push({ step: k, ...r })
}
await browser.close()
for (const r of rows) console.log(r.n === 0 ? 'same     ' : r.size ? 'size     ' : 'DIFFERS  ', r.step, r.n || '', r.box ? JSON.stringify(r.box) : '', r.size ? JSON.stringify(r) : '')
writeFileSync(resolve(OUT, '_compare.json'), JSON.stringify(rows, null, 2))
