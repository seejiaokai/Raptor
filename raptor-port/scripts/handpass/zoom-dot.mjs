/* [PUCK-DOT-ZOOM] (6 Oct 26) — the dotted red "breaks tomorrow's crew rest" ring on a puck that also wears an
   amber ring, at the browser's zoom levels. Each scaling is a browser started at that
   screen scaling (see below). For each: the first such puck on Edit Schedule's week is
   pictured, then enlarged 8x without smoothing so the single pixels can be read, and the RED pixels in the band
   outside the puck are counted — a PASS is "the dots are there to see", which a picture alone cannot assert.
   Run:  HP_URL=http://localhost:4231 HP_SHOTS=<folder> node scripts/handpass/zoom-dot.mjs */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = process.env.HP_URL || 'http://localhost:4173'
const SHOTS = process.env.HP_SHOTS || 'docs/img/handpass/2026-10-06-puck-dot-zoom'
const ZOOMS = (process.env.HP_ZOOMS || '1,0.9,0.8,0.75,0.67,0.5,1.1,1.25').split(',').map(Number)
const SEL = process.env.HP_SEL || '#vWeek .puck.boxdot.warn:not(.hard)'
mkdirSync(SHOTS, { recursive: true })

/* A SCREEN'S OWN SCALING, NOT AN EMULATED ONE. Playwright's `deviceScaleFactor` scales the finished picture and
   leaves the page's own arithmetic at 1 — the browser then rounds a 1.6px line down to 1px, which a real 125% screen
   does not. `--force-device-scale-factor` is what Windows' display scaling hands the browser, so each scaling is its
   own browser with no viewport emulation at all (checked against the desktop app's own pane at 125%, 6 Oct 26: both
   report the stylesheet's 1.5px as 0.8px — one screen pixel). */
const out = []
for (const z of ZOOMS) {
  const browser = await chromium.launch({ headless: true, ...launchOptions, args: [`--force-device-scale-factor=${z}`, `--window-size=${Math.round(1440)},${Math.round(900)}`] })
  const ctx = await browser.newContext({ viewport: null })
  const page = await ctx.newPage()
  await page.goto(BASE + '/?fresh=1')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (process.env.HP_PLANT) await page.evaluate(process.env.HP_PLANT)
  const all = await page.evaluate(() => [...document.querySelectorAll('.puck.boxdot')].map(p => p.className + ' | ' + p.textContent.trim().slice(0, 12)))
  const el = page.locator(SEL).first()
  if (!(await el.count())) { out.push({ z, found: false, boxdot: all }); await browser.close(); continue }
  /* to the middle of the page, clear of the frozen bars a top-edge scroll leaves it under */
  await el.evaluate(n => n.scrollIntoView({ block: 'center', inline: 'center' }))
  const b = await el.boundingBox()
  const pad = 8
  const clip = { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: b.width + pad * 2, height: b.height + pad * 2 }
  const name = `z${String(z).replace('.', '_')}`
  const png = await page.screenshot({ clip })
  writeFileSync(`${SHOTS}/${name}-raw.png`, png)
  /* count the pixels by colour in the band OUTSIDE the puck's own box, in the browser (no image library here) */
  const count = await page.evaluate(async ({ src, pad, z }) => {
    const img = new Image(); img.src = src; await img.decode()
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
    const g = c.getContext('2d'); g.drawImage(img, 0, 0)
    const d = g.getImageData(0, 0, c.width, c.height).data
    const inner = Math.round(pad * z)
    let red = 0, amber = 0, band = 0
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const inside = x >= inner && x < c.width - inner && y >= inner && y < c.height - inner
      if (inside) continue
      band++
      const i = (y * c.width + x) * 4, r = d[i], gg = d[i + 1], bb = d[i + 2]
      if (r > 170 && gg < 125 && bb < 135) red++            // the hard red, not blended into amber
      else if (r > 170 && gg > 125 && bb < 120) amber++
    }
    return { w: c.width, h: c.height, band, red, amber }
  }, { src: 'data:image/png;base64,' + png.toString('base64'), pad, z })
  /* the same picture 8x, pixels kept square, for the eye */
  const big = await ctx.newPage()
  await big.setContent(`<body style="margin:0;background:#111"><img src="data:image/png;base64,${png.toString('base64')}" style="image-rendering:pixelated;width:${Math.round(clip.width * 8)}px"></body>`)
  await big.screenshot({ path: `${SHOTS}/${name}-x8.png`, clip: { x: 0, y: 0, width: Math.min(1400 / 1, clip.width * 8), height: clip.height * 8 } })
  const css = await el.evaluate(n => { const s = getComputedStyle(n); return { cls: n.className, outline: s.outlineWidth + ' ' + s.outlineStyle, offset: s.outlineOffset, shadow: s.boxShadow } })
  out.push({ z, dpr: await page.evaluate(() => devicePixelRatio), found: true, ...count, css })
  await browser.close()
}
writeFileSync(`${SHOTS}/result.json`, JSON.stringify(out, null, 1))
for (const o of out) console.log(JSON.stringify(o))
