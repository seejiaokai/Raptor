// The host's look at the M2 bug check's fixes (23 Oct 26): the column beside the names is LVE alone (D1245), the Legend's
// one-column part, the ⚙ Settings window at an iPhone's width (D1270). Phone 390 and desktop 1536, admin.
// usage: node lw-m2-fixlook.mjs <port> <outDir>
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
const errs = []
for (const [name, opts] of [['phone', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }], ['desk', { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 }]]) {
  const ctx = await b.newContext(opts); const p = await ctx.newPage()
  p.on('pageerror', e => errs.push(`${name}: ${e.message}`)); p.on('console', m => { if (m.type() === 'error') errs.push(`${name}: ${m.text()}`) })
  await p.goto(`http://localhost:${port}/?fresh=1`)
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day'); await p.evaluate(() => window.go('leavewar'))
  await p.waitForSelector('.mx-wrap tbody.mxhead th.day'); await p.waitForTimeout(1500)
  const head = await p.locator('[data-testid="counter-head"]').boundingBox()
  await p.screenshot({ path: `${out}/lve-column-${name}.png`, clip: { x: 0, y: Math.max(0, head.y - 120), width: Math.min(opts.viewport.width, 520), height: 420 } })
  const picker = await p.locator('[data-testid="counter-pick"]').count()
  console.log(name, 'column heading:', await p.locator('[data-testid="counter-name"]').textContent(), '· picker buttons:', picker)
  await p.locator('[data-testid="legend-open"]').click(); await p.waitForTimeout(500)
  const fig = p.locator('[data-testid="legend-figures"]'); await fig.scrollIntoViewIfNeeded()
  const fb = await fig.boundingBox()
  await p.screenshot({ path: `${out}/legend-figures-${name}.png`, clip: { x: Math.max(0, fb.x - 12), y: Math.max(0, fb.y - 12), width: Math.min(opts.viewport.width - Math.max(0, fb.x - 12), fb.width + 24), height: fb.height + 24 } })
  console.log(name, 'legend figures:', (await fig.textContent()).replace(/\s+/g, ' '))
  await p.keyboard.press('Escape'); await p.waitForTimeout(300)
  await p.locator('[data-testid="settings-open"]').click(); await p.waitForTimeout(600)
  const sp = await p.locator('[data-testid="settings-sheet"]').evaluate(el => el.scrollWidth - el.clientWidth)
  console.log(name, 'settings: contents wider than the window by', sp, 'px')
  await p.screenshot({ path: `${out}/settings-${name}.png` })
  await ctx.close()
}
console.log('errors:', errs.length ? errs : 'none')
await b.close()
