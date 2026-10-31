/* Compares two recordings of rdc-ab.mjs, step by step (31 Oct 26, D1534).
   usage:  node scripts/handpass/rdc-compare.mjs <labelA> <labelB>
   For each step in either record: picture SAME (bytes equal) / DIFF (decoded in a headless Chromium page, drawn to a canvas,
   pixels counted; a diff picture — differing pixels in magenta over a dimmed copy — goes to <labelB>/diff/<size>/), text SAME / DIFF
   (the page's visible text), reached / errors compared too.
   Writes docs/img/handpass/2026-10-31-react-doctor/compare-<A>-<B>.json and prints a table; exit code 1 when anything differs. */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { launch, OUTROOT } from './rdc-lib.mjs'

const [A, B] = process.argv.slice(2)
if (!A || !B) { console.error('usage: node scripts/handpass/rdc-compare.mjs <labelA> <labelB>'); process.exit(2) }
const dirA = resolve(OUTROOT, A), dirB = resolve(OUTROOT, B)
const recA = JSON.parse(readFileSync(resolve(dirA, 'record.json'), 'utf8')), recB = JSON.parse(readFileSync(resolve(dirB, 'record.json'), 'utf8'))
const key = r => r.size + '|' + r.id
const mapA = new Map(recA.steps.map(r => [key(r), r])), mapB = new Map(recB.steps.map(r => [key(r), r]))
const keys = [...new Set([...mapA.keys(), ...mapB.keys()])].sort((x, y) => {
  const rx = mapA.get(x) || mapB.get(x), ry = mapA.get(y) || mapB.get(y)
  return (rx.size + rx.no).localeCompare(ry.size + ry.no)
})
rmSync(resolve(dirB, 'diff'), { recursive: true, force: true })

const browser = await launch()
const page = await browser.newPage()
await page.goto('about:blank')
/* decode both, count differing pixels, return the diff picture as a data URL */
async function pixelDiff(bufA, bufB) {
  return page.evaluate(async ([a, b]) => {
    const load = async s => { const im = new Image(); im.src = 'data:image/png;base64,' + s; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); return { w: im.width, h: im.height, x, d: x.getImageData(0, 0, im.width, im.height) } }
    const A = await load(a), B = await load(b)
    if (A.w !== B.w || A.h !== B.h) return { sizeDiffers: true, a: [A.w, A.h], b: [B.w, B.h] }
    const out = B.x.createImageData(B.w, B.h); let n = 0, minX = 1e9, minY = 1e9, maxX = -1, maxY = -1
    for (let i = 0; i < A.d.data.length; i += 4) {
      const dr = A.d.data[i] - B.d.data[i], dg = A.d.data[i + 1] - B.d.data[i + 1], db = A.d.data[i + 2] - B.d.data[i + 2], da = A.d.data[i + 3] - B.d.data[i + 3]
      if (dr || dg || db || da) {
        n++; out.data[i] = 255; out.data[i + 1] = 0; out.data[i + 2] = 255; out.data[i + 3] = 255
        const p = i / 4, x = p % B.w, y = (p - x) / B.w; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y
      } else { out.data[i] = B.d.data[i] * 0.3; out.data[i + 1] = B.d.data[i + 1] * 0.3; out.data[i + 2] = B.d.data[i + 2] * 0.3; out.data[i + 3] = 255 }
    }
    const c = document.createElement('canvas'); c.width = B.w; c.height = B.h; c.getContext('2d').putImageData(out, 0, 0)
    return { n, box: n ? [minX, minY, maxX, maxY] : null, png: c.toDataURL('image/png').split(',')[1] }
  }, [bufA.toString('base64'), bufB.toString('base64')])
}

const rows = []
for (const k of keys) {
  const a = mapA.get(k), b = mapB.get(k), r = a || b
  const row = { step: r.id, no: r.no, size: r.size, role: r.role, reachedA: a ? a.reached : null, reachedB: b ? b.reached : null, picture: '', pixels: 0, box: null, text: '', errors: '' }
  if (!a || !b) { row.picture = row.text = 'MISSING in ' + (a ? B : A) }
  else {
    row.text = a.text === b.text ? 'SAME' : 'DIFF'
    if (row.text === 'DIFF') {
      const la = a.text.split('\n'), lb = b.text.split('\n'); const i = la.findIndex((l, j) => l !== lb[j])
      row.textFirstDiff = { line: i, A: (la[i] || '').slice(0, 160), B: (lb[i] || '').slice(0, 160), linesA: la.length, linesB: lb.length }
    }
    row.errors = JSON.stringify(a.errors) === JSON.stringify(b.errors) ? 'SAME' : 'DIFF'
    if (a.reached !== b.reached) row.picture = 'REACHED DIFFERS'
    else if (!a.reached) row.picture = 'n/a (not reached in both)'
    else {
      const fa = resolve(dirA, a.file), fb = resolve(dirB, b.file)
      const ba = readFileSync(fa), bb = readFileSync(fb)
      if (ba.equals(bb)) row.picture = 'SAME'
      else {
        const d = await pixelDiff(ba, bb)
        if (d.sizeDiffers) { row.picture = 'DIFF (size ' + d.a.join('x') + ' vs ' + d.b.join('x') + ')'; row.pixels = -1 }
        else if (d.n === 0) row.picture = 'SAME (bytes differ, pixels equal)'
        else {
          row.picture = 'DIFF'; row.pixels = d.n; row.box = d.box
          const dd = resolve(dirB, 'diff', b.size); mkdirSync(dd, { recursive: true })
          writeFileSync(resolve(dd, b.file.split('/').pop()), Buffer.from(d.png, 'base64'))
          row.diffFile = `${B}/diff/${b.size}/${b.file.split('/').pop()}`
        }
      }
    }
  }
  rows.push(row)
}
await browser.close()

const pad = (s, n) => String(s).padEnd(n)
console.log(pad('no', 4) + pad('size', 8) + pad('step', 28) + pad('picture', 34) + pad('text', 7) + pad('errors', 7) + 'reached')
for (const r of rows) console.log(pad(r.no, 4) + pad(r.size, 8) + pad(r.step, 28) + pad(r.picture + (r.pixels > 0 ? ' ' + r.pixels + 'px' : ''), 34) + pad(r.text, 7) + pad(r.errors, 7) + (r.reachedA ? 'yes' : 'no') + '/' + (r.reachedB ? 'yes' : 'no'))
const bad = rows.filter(r => !/^SAME|^n\/a/.test(r.picture) || r.text !== 'SAME' || r.errors !== 'SAME' && r.errors !== '')
const summary = { A, B, steps: rows.length, pictureSame: rows.filter(r => /^SAME/.test(r.picture)).length, pictureDiff: rows.filter(r => /^DIFF|DIFFERS|MISSING/.test(r.picture)).length, notReachedBoth: rows.filter(r => /^n\/a/.test(r.picture)).length, textDiff: rows.filter(r => r.text !== 'SAME').length, errorsDiff: rows.filter(r => r.errors === 'DIFF').length }
console.log('\n' + JSON.stringify(summary))
writeFileSync(resolve(OUTROOT, `compare-${A}-${B}.json`), JSON.stringify({ summary, rows }, null, 1))
process.exit(bad.length ? 1 : 0)
