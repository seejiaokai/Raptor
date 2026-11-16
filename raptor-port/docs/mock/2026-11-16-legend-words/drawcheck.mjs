/* D2078 (16 Nov 26) — the drawing check for the Legend: the BUILT Legend fold pictured exactly as shoot.mjs pictured the
   approved drawing (same sizes, same scroll, the same outline drawn on each of the six changed rows), then compared
   pixel by pixel with img/<size>-2-proposed.png. A pixel counts as different when any channel differs by more than 24;
   the box's height and every row's place are compared too. Prints one line per size and writes the built pictures and a
   difference map to img/built-*.png, img/diff-*.png.
   Run against a served build: PORT=4176 node docs/mock/2026-11-16-legend-words/drawcheck.mjs */
import { chromium } from 'playwright'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'img')
const PORT = process.env.PORT || '4173'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const NEW = ['days in a row', 'misses flight brief', 'misses sim brief', 'misses flight debrief', 'misses sim debrief', 'long day']
const errors = []
let bad = 0
for (const [name, vp] of [['desktop', { width: 1536, height: 864 }], ['phone', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(name === 'phone' ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(`${name} pageerror ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`${name} console ${m.text()}`) })
  await page.goto(`http://localhost:${PORT}/`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('editsched'))
  await page.waitForFunction(() => window.CURPAGE === 'editsched')
  await page.waitForTimeout(500)
  await page.evaluate(() => { const d = document.querySelector('#eLegendBox'); d.open = true; d.scrollIntoView({ block: 'start' }); window.scrollBy(0, -60) })
  await page.waitForTimeout(300)
  const missing = await page.evaluate((words) => {
    const spans = [...document.querySelectorAll('#eLegend > span')]
    const miss = []
    for (const w of words) {
      const s = spans.find(x => x.lastChild && x.lastChild.nodeType === 3 && x.lastChild.textContent.trim() === w)
      if (!s) { miss.push(w); continue }
      s.style.outline = '2px solid #2EE6D6'; s.style.outlineOffset = '2px'; s.style.borderRadius = '3px'
    }
    return miss
  }, NEW)
  if (missing.length) { bad++; console.log(name, 'MISSING rows:', missing.join(', ')) }
  await page.waitForTimeout(150)
  const built = join(OUT, `built-${name}.png`)
  await page.locator('#eLegendBox').screenshot({ path: built })
  const res = await page.evaluate(async ([a, b]) => {
    const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src })
    const [ia, ib] = await Promise.all([load(a), load(b)])
    const w = Math.max(ia.width, ib.width), h = Math.max(ia.height, ib.height)
    const px = img => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, w, h) }
    const da = px(ia), db = px(ib)
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); const out = g.createImageData(w, h)
    let diff = 0
    for (let i = 0; i < da.data.length; i += 4) {
      const d = Math.max(Math.abs(da.data[i] - db.data[i]), Math.abs(da.data[i + 1] - db.data[i + 1]), Math.abs(da.data[i + 2] - db.data[i + 2]))
      if (d > 24) { diff++; out.data[i] = 255; out.data[i + 3] = 255 } else { out.data[i] = out.data[i + 1] = out.data[i + 2] = da.data[i] >> 2; out.data[i + 3] = 255 }
    }
    g.putImageData(out, 0, 0)
    return { size: [ia.width, ia.height, ib.width, ib.height], diff, total: w * h, map: c.toDataURL('image/png') }
  }, ['data:image/png;base64,' + readFileSync(built).toString('base64'),
      'data:image/png;base64,' + readFileSync(join(OUT, `${name}-2-proposed.png`)).toString('base64')])
  const { writeFileSync } = await import('node:fs')
  writeFileSync(join(OUT, `diff-${name}.png`), Buffer.from(res.map.split(',')[1], 'base64'))
  const sameSize = res.size[0] === res.size[2] && res.size[1] === res.size[3]
  if (!sameSize || res.diff > 0) bad++
  console.log(name, `built ${res.size[0]}x${res.size[1]} vs drawing ${res.size[2]}x${res.size[3]}`, `pixels different: ${res.diff} of ${res.total}`)
  await ctx.close()
}
await browser.close()
console.log(errors.length ? errors.join('\n') : 'no console or page errors')
process.exit(bad ? 1 : 0)
