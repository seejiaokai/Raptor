// His Q3 (23 Oct 26): how Rearrange's way out looks on a phone with the word "Done" beside ⇅ — today's bar and the same
// bar with the word shown (a style laid over the built app for the picture only). Phone 390, admin, Rearrange on.
// usage: node lw-m2-q3-done.mjs <port> <outDir>
import { createRequire } from 'node:module'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(here, '..', '..', 'package.json'))
const { chromium } = require('@playwright/test')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const port = process.argv[2] || '4265', out = process.argv[3]
mkdirSync(out, { recursive: true })
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
const p = await ctx.newPage()
await p.goto(`http://localhost:${port}/?fresh=1`)
await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
await p.waitForSelector('#vWeek .day'); await p.evaluate(() => window.go('leavewar'))
await p.waitForSelector('.mx-wrap tbody.mxhead th.day'); await p.waitForTimeout(1200)
await p.locator('[data-testid="settings-open"]').tap(); await p.waitForTimeout(500)
await p.locator('[data-testid="settings-rearrange"]').tap(); await p.waitForTimeout(800)
const shot = async name => {
  const hd = await p.locator('.card-hd').first().boundingBox()
  await p.screenshot({ path: `${out}/${name}.png`, clip: { x: 0, y: Math.max(0, hd.y - 8), width: 390, height: hd.height + 70 } })
  return p.evaluate(() => { const r = document.querySelector('[data-testid="roster-arrange"]').getBoundingClientRect(); return { lines: Math.round(document.querySelector('.card-hd').getBoundingClientRect().height), btn: [Math.round(r.left), Math.round(r.width)] } })
}
console.log('today', await shot('q3-today'))
await p.addStyleTag({ content: '#page-leavewar .card-hd [data-testid="roster-arrange"] .rtlbl { display: inline !important; }' })
await p.waitForTimeout(300)
console.log('with Done', await shot('q3-with-done'))
await p.addStyleTag({ content: '#page-leavewar .card-hd [data-testid="lw-zoom"] { display: none !important; }' })
await p.waitForTimeout(300)
console.log('with Done, zoom aside', await shot('q3-with-done-nozoom'))
await b.close()
