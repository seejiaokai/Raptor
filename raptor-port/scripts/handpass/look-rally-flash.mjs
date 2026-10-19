/* LOOK — [RALLY-BOX-CHANGES] the final build, for his look card (19 Oct 26): at his iPhone's width (402, three times its
   density) the Scheduler Board's faint R before a tap, 250 ms after it (the blue flash), and after the flash; then an SC
   line's own R box with a rally typed. Nothing saved beyond the browser's own storage.
   Run: HP_URL=http://localhost:4312 node scripts/handpass/look-rally-flash.mjs
   Pictures: docs/img/handpass/2026-10-19-rally-changes/final/ */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

console.log('look-rally-flash v1')
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4312'
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-19-rally-changes/final')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = []
try {
  const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, colorScheme: 'dark' })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.goto(BASE + '/')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '#toastEl{display:none !important}' })
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
  await p.evaluate(() => window.openScheduler(0)); await p.waitForSelector('#schedBoard'); await p.waitForTimeout(900)
  const r = p.locator('#sbBoard [data-bfld="ff:0.0.0.rl"]:visible').first()
  await r.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(300)
  const clip = async () => { const b = await r.boundingBox(); return { x: 0, y: Math.max(0, b.y - 90), width: 402, height: 200 } }
  await p.screenshot({ path: resolve(OUT, '1-before-tap.png'), clip: await clip() })
  const b = await r.boundingBox()
  await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await p.waitForTimeout(250)
  await p.screenshot({ path: resolve(OUT, '2-tap-250ms.png'), clip: await clip() })
  console.log('ring', JSON.stringify(await r.evaluate(e => ({ v: e.value, cls: e.className, outline: getComputedStyle(e).outlineColor }))))
  await p.waitForTimeout(1400)
  await p.screenshot({ path: resolve(OUT, '3-after-flash.png'), clip: await clip() })
  await p.keyboard.press('Escape')
  /* an SC wave with a rally typed on its AM MAIN line */
  const gi = await p.evaluate(() => { window.addWave(0, 'sc'); return window.DAYS[0].waves.findIndex(w => w.kind === 'sc') })
  await p.waitForTimeout(500)
  const sr = p.locator(`#sbBoard [data-bfld="ff:0.${gi}.0.rl"]:visible`).first()
  await sr.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(300)
  const sb = await sr.boundingBox()
  await p.touchscreen.tap(sb.x + sb.width / 2, sb.y + sb.height / 2)
  await p.keyboard.type('0630'); await p.keyboard.press('Enter'); await p.waitForTimeout(500)
  await sr.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(300)
  const sb2 = await sr.boundingBox()
  await p.screenshot({ path: resolve(OUT, '4-sc-rally.png'), clip: { x: 0, y: Math.max(0, sb2.y - 150), width: 402, height: 330 } })
  console.log('sc rl', await p.evaluate(g => window.DAYS[0].waves[g].formations[0].rl, gi))
  await ctx.close()
} finally {
  await browser.close()
  console.log('page errors', errors.length)
}
