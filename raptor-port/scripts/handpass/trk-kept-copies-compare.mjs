/* CHAT 20 — [TRK-KEPT-COPIES] (8 Nov 26): compares two folders of trk-kept-copies-pixels.mjs pictures pixel for pixel.
   The pictures are decoded and compared inside the test browser (a canvas each), so no picture library is needed. For
   every picture it prints SAME or the number of pixels that differ and the box they fall in, and for a difference it
   writes a third picture: the after picture dimmed, every changed pixel in solid magenta.
   From raptor-port/:  node scripts/handpass/trk-kept-copies-compare.mjs <before folder> <after folder> <diff folder>
   Version line: kccmp v1. */
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'
console.log('kccmp v1')
const [A, B, D] = process.argv.slice(2).map(p => resolve(p))
if (!A || !B || !D) { console.error('usage: <before> <after> <diff>'); process.exit(2) }
mkdirSync(D, { recursive: true })
const CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const page = await browser.newPage()
await page.setContent('<canvas id=a></canvas><canvas id=b></canvas>')
const names = readdirSync(A).filter(n => n.endsWith('.png')).sort()
const out = []
for (const n of names) {
  if (!existsSync(resolve(B, n))) { out.push({ n, res: 'MISSING in after' }); console.log('MISSING ' + n); continue }
  const a = readFileSync(resolve(A, n)), b = readFileSync(resolve(B, n))
  if (a.equals(b)) { out.push({ n, res: 'SAME (byte for byte)' }); console.log('SAME   ' + n + ' (byte for byte)'); continue }
  const r = await page.evaluate(async ([ua, ub]) => {
    const load = u => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u })
    const [ia, ib] = await Promise.all([load(ua), load(ub)])
    if (ia.width !== ib.width || ia.height !== ib.height) return { size: [ia.width, ia.height, ib.width, ib.height] }
    const w = ia.width, h = ia.height
    const ca = document.getElementById('a'), cb = document.getElementById('b'); ca.width = cb.width = w; ca.height = cb.height = h
    const xa = ca.getContext('2d'), xb = cb.getContext('2d'); xa.drawImage(ia, 0, 0); xb.drawImage(ib, 0, 0)
    const da = xa.getImageData(0, 0, w, h), db = xb.getImageData(0, 0, w, h)
    let n = 0, x0 = w, y0 = h, x1 = -1, y1 = -1
    const o = xb.createImageData(w, h)
    for (let i = 0; i < da.data.length; i += 4) {
      const same = da.data[i] === db.data[i] && da.data[i + 1] === db.data[i + 1] && da.data[i + 2] === db.data[i + 2] && da.data[i + 3] === db.data[i + 3]
      if (same) { o.data[i] = db.data[i] * 0.35; o.data[i + 1] = db.data[i + 1] * 0.35; o.data[i + 2] = db.data[i + 2] * 0.35; o.data[i + 3] = 255; continue }
      n++; const p = i / 4, x = p % w, y = (p / w) | 0
      if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y
      o.data[i] = 255; o.data[i + 1] = 0; o.data[i + 2] = 255; o.data[i + 3] = 255
    }
    if (!n) return { n }
    xb.putImageData(o, 0, 0)
    return { n, box: [x0, y0, x1, y1], png: cb.toDataURL('image/png') }
  }, ['data:image/png;base64,' + a.toString('base64'), 'data:image/png;base64,' + b.toString('base64')])
  if (r.size) { out.push({ n, res: 'SIZE DIFFERS ' + r.size.join('x') }); console.log('SIZE   ' + n + ' ' + r.size.join(' ')); continue }
  if (!r.n) { out.push({ n, res: 'SAME (pixels; the file bytes differ)' }); console.log('SAME   ' + n + ' (pixels)'); continue }
  writeFileSync(resolve(D, n), Buffer.from(r.png.split(',')[1], 'base64'))
  out.push({ n, res: 'DIFFERS', pixels: r.n, box: r.box })
  console.log('DIFF   ' + n + ' — ' + r.n + ' pixels in x ' + r.box[0] + '–' + r.box[2] + ', y ' + r.box[1] + '–' + r.box[3])
}
for (const n of readdirSync(B).filter(n => n.endsWith('.png'))) if (!names.includes(n)) { out.push({ n, res: 'NEW in after' }); console.log('NEW    ' + n) }
writeFileSync(resolve(D, 'compare.json'), JSON.stringify(out, null, 1))
console.log('total ' + out.length + ': ' + out.filter(x => x.res.startsWith('SAME')).length + ' same, ' + out.filter(x => !x.res.startsWith('SAME')).length + ' not')
await browser.close()
