// His "a" (D1520) as built: the person window's LVE tile, the carried line's date on its own line on a phone (WebKit at 402
// and 375, by touch), one line on a desktop (Chromium at 1536 at 1.25). Pictures the tiles.
//   node scripts/handpass/lw-pw-till-shots.mjs <dist> <out-dir>
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { serveDist, LAUNCH } from '../drawcheck/lib.mjs'
const require = createRequire(import.meta.url)
const { webkit, chromium } = require('@playwright/test')
const [, , DIST = 'dist', OUT = 'C:/dcm5bdraw/pwtill'] = process.argv
mkdirSync(OUT, { recursive: true })
for (const [tag, eng, opts, touch] of [
  ['phone402', webkit, { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true }, true],
  ['phone375', webkit, { viewport: { width: 375, height: 812 }, deviceScaleFactor: 3, hasTouch: true }, true],
  ['desk', chromium, { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 }, false],
]) {
  const b = await eng.launch(eng === chromium ? LAUNCH : {})
  const ctx = await b.newContext({ ...opts, timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, 'http://localhost:4192', DIST)
  const p = await ctx.newPage()
  await p.clock.setFixedTime(new Date('2026-01-08T09:00:00+08:00'))
  await p.goto('http://localhost:4192/')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { timeout: 20000 })
  await p.evaluate(() => window.go('leavewar'))
  const press = l => touch ? l.tap() : l.click()
  await press(p.locator('[data-testid="lw-tab-balances"]')); await p.waitForTimeout(400)
  await press(p.getByTestId('bal-name-stiff')); await p.waitForSelector('[data-testid="pw-tile-LVE"]'); await p.waitForTimeout(500)
  const r = await p.locator('.zz-balgrid').boundingBox()
  await p.screenshot({ path: join(OUT, `${tag}.png`), clip: { x: r.x - 8, y: r.y - 40, width: r.width + 16, height: r.height + 48 } })
  console.log(tag, await p.evaluate(() => [...document.querySelectorAll('[data-testid="pw-tile-LVE"] .r17-cf, [data-testid="pw-tile-LVE"] .r17-till')].map(e => e.innerText.trim()).filter(Boolean).join(' / ')))
  await ctx.close(); await b.close()
}
