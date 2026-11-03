// The loading-claw mock-up, frame by frame ([TALON-LOADING-CLAW], D1591, 3 Nov 26): opens
// docs/mock/talon-loading-claw.html in Chromium and in WebKit (the engine of his iPhone's Safari), pauses every
// animation at fixed moments of one round, and lays the frames out as one strip per engine and per reveal style —
// so "left, then middle, then right, each top to bottom" is checked by eye on both engines before it goes to him.
//   node scripts/handpass/talon-claw-frames.mjs [out dir]
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-11-03-talon/frames')
mkdirSync(OUT, { recursive: true })
const PAGE = pathToFileURL(resolve(HERE, '../../docs/mock/talon-loading-claw.html')).href
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const TIMES = [0.08, 0.2, 0.32, 0.44, 0.56, 0.7, 0.9, 1.5, 1.72]

for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await type.launch(name === 'chromium' && existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  const errs = []
  page.on('pageerror', e => errs.push(e.message))
  await page.goto(PAGE)
  for (const style of ['along', 'straight']) {
    if (style === 'straight') await page.click('[data-k=style] [data-v=straight]')
    const shots = []
    for (const t of TIMES) {
      await page.evaluate(t => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t * 1000 }), t)
      await page.waitForTimeout(60)
      const buf = await page.locator('#claw').screenshot({ animations: 'allow' })
      shots.push({ t, src: 'data:image/png;base64,' + buf.toString('base64') })
    }
    const sheet = await browser.newPage({ viewport: { width: 1200, height: 260 }, deviceScaleFactor: 1 })
    await sheet.setContent(`<body style="margin:0;background:#0B0D10;color:#B6C0CB;font:12px sans-serif;display:flex;gap:10px;padding:12px">
      ${shots.map(s => `<div style="text-align:center"><img src="${s.src}" style="width:120px;height:120px;display:block;border:1px solid #2A313A"><div>${s.t.toFixed(2)} s</div></div>`).join('')}</body>`)
    await sheet.screenshot({ path: join(OUT, `${name}-${style}.png`), fullPage: true })
    await sheet.close()
  }
  console.log(name, errs.length ? 'page errors: ' + errs.join(' | ') : 'no page errors')
  await browser.close()
}
console.log('frames in', OUT)
