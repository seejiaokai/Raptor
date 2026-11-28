// jc-draw2 - the Filter's edge read pixel by pixel, in the approved picture and in the build's picture, on the same kind of line.
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('jc-draw2 v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const MOCK = resolve(HERE, '../../../../docs/mock/2026-11-24-msq-new-words/filter-look/img')
const BUILD = resolve(HERE, '../../../../docs/handpass/2026-11-24-msq-night-check/jc/jc-draw')
const b = await chromium.launch(); const p = await b.newPage()
const edge = (file, ax, at, from, to) => p.evaluate(async ({ b64, ax, at, from, to }) => {
  const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode()
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0)
  const out = []; for (let i = from; i <= to; i++) { const d = ax === 'y' ? g.getImageData(at, i, 1, 1).data : g.getImageData(i, at, 1, 1).data; out.push(`${i}:${d[0]},${d[1]},${d[2]}`) }
  return out.join(' ')
}, { b64: readFileSync(file).toString('base64'), ax, at, from, to })
console.log('drawing desk, top edge of Filter (column 700):', await edge(resolve(MOCK, 'users-after-desk.png'), 'y', 700, 40, 48))
console.log('build desk, top edge of Filter (column 520):', await edge(resolve(BUILD, 'users-desk-on.png'), 'y', 520, 50, 58))
console.log('drawing phone, top edge of Filter (column 560):', await edge(resolve(MOCK, 'users-after-phone.png'), 'y', 560, 73, 81))
console.log('build phone, top edge of Filter (column 540):', await edge(resolve(BUILD, 'users-phone-on.png'), 'y', 540, 50, 58))
console.log('drawing inputs, top edge (column 118):', await edge(resolve(MOCK, 'inputs-after-phone.png'), 'y', 118, 82, 90))
console.log('build inputs, top edge (column 125):', await edge(resolve(BUILD, 'inputs-on.png'), 'y', 125, 34, 42))
await b.close()
