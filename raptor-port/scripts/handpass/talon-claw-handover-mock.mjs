// The moving mock-up of [TALON-CLAW-HANDOVER] (3–4 Nov 26, his "Show me the first suggestion"): the real sign-in at his
// iPhone's size, pictured twice — as it is, and with its logo hidden (the moment before the claw lands on it) — and the
// logo's exact box measured, so the mock-up page moves the real claw onto the real logo's place. Writes the two pictures
// and a measures file beside the mock-up page.
//   npm run build && node scripts/handpass/talon-claw-handover-mock.mjs
import { chromium } from '@playwright/test'
import { preview } from 'vite'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '../..')
const OUT = join(ROOT, 'docs/img/handpass/2026-11-03-talon-pages/handover-mock')
mkdirSync(OUT, { recursive: true })
const PORT = 4315
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const server = await preview({ root: ROOT, preview: { port: PORT, strictPort: true, open: false }, logLevel: 'silent' })
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const out = {}
for (const [name, vp] of [['phone', { width: 402, height: 874 }], ['desktop', { width: 1536, height: 864 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(name === 'phone' ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  await page.goto(`http://localhost:${PORT}/?fresh=1`)
  await page.waitForSelector('#luser', { state: 'visible' })
  await page.waitForFunction(() => !document.getElementById('bootclaw'))
  await page.evaluate(() => document.activeElement && document.activeElement.blur())
  await page.waitForTimeout(400)
  const m = await page.evaluate(() => {
    const g = document.querySelector('.lb-glyph'); const r = g.getBoundingClientRect()
    return { x: r.left, y: r.top, w: r.width, h: r.height, filter: getComputedStyle(g).filter, tag: g.tagName, html: g.outerHTML.slice(0, 400) }
  })
  out[name] = { viewport: vp, logo: m }
  await page.screenshot({ path: join(OUT, `signin-${name}.png`) })
  const hide = await page.addStyleTag({ content: '.lb-glyph{visibility:hidden!important}' })
  await page.waitForTimeout(100)
  await page.screenshot({ path: join(OUT, `signin-${name}-nologo.png`) })
  await hide.evaluate(t => t.remove())
  // after the M365 move there is no sign-in page: the first screen is View-only Sched (D1616); its top bar's small claw
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(800)
  await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement && document.activeElement.blur() })
  out[name].topbarLogo = await page.evaluate(() => {
    const g = document.querySelector('.topbar .rglyph'); const r = g.getBoundingClientRect()
    return { x: r.left, y: r.top, w: r.width, h: r.height, filter: getComputedStyle(g).filter }
  })
  await page.screenshot({ path: join(OUT, `viewsched-${name}.png`) })
  await page.addStyleTag({ content: '.topbar .rglyph{visibility:hidden!important}' })
  await page.waitForTimeout(100)
  await page.screenshot({ path: join(OUT, `viewsched-${name}-nologo.png`) })
  await ctx.close()
}
writeFileSync(join(OUT, 'measures.json'), JSON.stringify(out, null, 1))
console.log(JSON.stringify(out, null, 1))
await browser.close(); await new Promise(r => server.httpServer.close(r))
