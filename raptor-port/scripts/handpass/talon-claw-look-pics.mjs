// Pictures for the design look of the loading claw (3 Nov 26, after [TALON-CLAW-BG]): the two moments the look's reviewer
// raised, each pictured on the built app at his iPhone's size, so they are put to him with pictures (D853):
//   1  the hand-over to the sign-in: the start-up claw half faded over the sign-in, both logos on screen at once
//   2  the gap in every round: the claw paused at 1.5 s into its round (faded out) and at 1.65 s (the next round not begun)
//   npm run build && node scripts/handpass/talon-claw-look-pics.mjs
import { chromium } from '@playwright/test'
import { preview } from 'vite'
import { existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '../..')
const OUT = join(ROOT, 'docs/img/handpass/2026-11-03-talon-pages/look')
mkdirSync(OUT, { recursive: true })
const PORT = 4313
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const server = await preview({ root: ROOT, preview: { port: PORT, strictPort: true, open: false }, logLevel: 'silent' })
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctxOpts = { viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }

{ // 1 — the hand-over: the claw's 0.2 s fade held at its middle, the sign-in drawn under it
  const ctx = await browser.newContext(ctxOpts)
  const page = await ctx.newPage()
  // the claw's fade slowed to 10 s so its middle can be pictured; nothing else changed
  // …and kept on the page (ui/bootclaw.ts takes it away 0.22 s after the fade starts)
  await page.addInitScript(() => { const rm = Element.prototype.remove; Element.prototype.remove = function () { if (this.id !== 'bootclaw') rm.call(this) } })
  await page.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '#bootclaw{transition:opacity 10s linear!important}'; document.head.appendChild(s) }) })
  await page.goto(`http://localhost:${PORT}/?fresh=1`)
  await page.waitForSelector('#bootclaw.gone', { state: 'attached', timeout: 20000 })
  // the claw itself held whole (its own animations paused at 1.2 s into the round), the screen's fade left running
  await page.evaluate(() => document.getAnimations().forEach(x => { if (x instanceof CSSAnimation) { x.pause(); x.currentTime = 1000 } }))
  await page.waitForTimeout(5000)
  await page.screenshot({ path: join(OUT, '1-handover-mid-fade.png') })
  await ctx.close()
}
{ // 2 — the gap: the start-up claw held (the app's code held back), every animation paused at a moment of its round
  const ctx = await browser.newContext(ctxOpts)
  const page = await ctx.newPage()
  await page.route('**/assets/*.js', async r => { await new Promise(res => setTimeout(res, 30000)); await r.continue() })
  await page.goto(`http://localhost:${PORT}/?fresh=1`, { waitUntil: 'commit' })
  await page.waitForSelector('#bootclaw .mk', { state: 'attached' })
  // an animation's currentTime counts from its start; the round's own time is currentTime + 0.2 s (its head start)
  for (const [name, t] of [['2a-round-1.20s-whole', 1.0], ['2b-round-1.50s-faded', 1.3], ['2c-round-1.65s-empty', 1.45], ['2d-round-0.05s-next', 1.62]]) {
    await page.evaluate(ms => document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms }), t * 1000)
    await page.waitForTimeout(80)
    await page.screenshot({ path: join(OUT, `${name}.png`), clip: { x: 101, y: 337, width: 200, height: 200 } })
  }
  await ctx.close()
}
await browser.close(); await new Promise(r => server.httpServer.close(r))
console.log('pictures in', OUT)
