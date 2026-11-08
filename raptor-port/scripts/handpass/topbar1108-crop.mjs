// Crops one or more pictures to the same box and lays them side by side (for opening what a difference is).
// Usage: node scripts/handpass/topbar1108-crop.mjs <out.png> <x> <y> <w> <h> <picture> [<picture> ...]
import { chromium, LAUNCH } from '../drawcheck/lib.mjs'
import { readFileSync, writeFileSync } from 'node:fs'
console.log('[topbar1108-crop v1]')
const [out, x, y, w, h, ...files] = process.argv.slice(2)
const br = await chromium.launch(LAUNCH)
const pg = await (await br.newContext()).newPage()
const urls = files.map(f => 'data:image/png;base64,' + readFileSync(f).toString('base64'))
const data = await pg.evaluate(async ([urls, x, y, w, h]) => {
  const imgs = await Promise.all(urls.map(s => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = s })))
  const c = document.createElement('canvas'); c.width = (w + 10) * imgs.length; c.height = h
  const g = c.getContext('2d'); g.fillStyle = '#f0f'; g.fillRect(0, 0, c.width, c.height)
  imgs.forEach((im, i) => g.drawImage(im, x, y, w, h, i * (w + 10), 0, w, h))
  return c.toDataURL('image/png').split(',')[1]
}, [urls, +x, +y, +w, +h])
writeFileSync(out, Buffer.from(data, 'base64'))
await br.close()
