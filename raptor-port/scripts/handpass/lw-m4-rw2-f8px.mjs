// Re-walk 2 F8px — sample the bar's fill and edge colours in the drawing r22-6-phone and in the walk's own picture (a read of two PNGs, no app).
import { chromium } from '@playwright/test'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
console.log('[lw-m4-rw2-f8px v1]')
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const p = await b.newPage()
const draw = readFileSync(path.resolve(here, '../../docs/mock/lw-overhaul/full/r22-6-phone.png')).toString('base64')
const mine = readFileSync(path.resolve(here, '../../docs/img/handpass/2026-10-27-lw-m4/rewalk2/f8-slim-zoom.png')).toString('base64')
const res = await p.evaluate(async ({ draw, mine }) => {
  const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + src })
  const px = (img, x, y) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return [...g.getImageData(x, y, 1, 1).data].slice(0, 3) }
  const d = await load(draw), m = await load(mine)
  // drawing: 1206 x 2622 (3x); bar spans y 2454..2591, x 24..1181; sample inside the bar between words: x 600,y 2520 and x 700,y 2560; edge at y 2455
  const out = { drawing: { size: [d.width, d.height], fill1: px(d, 560, 2570), fill2: px(d, 940, 2570), fill3: px(d, 100, 2520), edgeTop: px(d, 600, 2455), edgeLeft: px(d, 25, 2520) } }
  // my picture: the clip is the bar with margins; find bar by scanning down at x=600 for colour changes
  const c = document.createElement('canvas'); c.width = m.width; c.height = m.height; const g = c.getContext('2d'); g.drawImage(m, 0, 0)
  const col = []; for (let y = 0; y < m.height; y += 4) col.push([y, ...g.getImageData(750, y, 1, 1).data].slice(0, 4))
  out.mine = { size: [m.width, m.height], fill: px(m, 780, 160), fill2: px(m, 1000, 185), edgeTop: px(m, 600, 62), col: col.filter((_, i) => i % 3 === 0).map(a => a.join(',')).join(' | ') }
  return out
}, { draw, mine })
console.log(JSON.stringify(res, null, 1))
await b.close()
