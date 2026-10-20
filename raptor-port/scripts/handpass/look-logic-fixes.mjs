/* The pictures for his look at the Logic fixes (21 Oct 26): his iPhone's width at 2x, the place marked with a ring drawn
   over the page (not part of the app). node scripts/handpass/look-logic-fixes.mjs [port] → docs/img/handpass/2026-10-21-logic-fixes/look/ */
import { chromium } from 'playwright'
import { existsSync, mkdirSync, rmSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const PORT = process.argv[2] || '4290'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'img', 'handpass', '2026-10-21-logic-fixes', 'look')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const page = await (await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })).newPage()
await page.goto(`http://localhost:${PORT}/`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.evaluate(() => window.go('logic')); await page.waitForTimeout(400)
const tap = async loc => { const b = await loc.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }
/* a ring drawn over the page around each element named, with a short label */
const mark = (marks) => page.evaluate(marks => {
  document.querySelectorAll('.zz-mark').forEach(n => n.remove())
  for (const [sel, label] of marks) {
    const r = document.querySelector(sel).getBoundingClientRect()
    const m = document.createElement('div'); m.className = 'zz-mark'
    Object.assign(m.style, { position: 'fixed', left: r.left - 5 + 'px', top: r.top - 5 + 'px', width: r.width + 10 + 'px', height: r.height + 10 + 'px', border: '3px solid #ff3b6b', borderRadius: '10px', zIndex: 99999, pointerEvents: 'none' })
    const t = document.createElement('div'); t.className = 'zz-mark'; t.textContent = label
    Object.assign(t.style, { position: 'fixed', left: Math.max(4, r.left - 5) + 'px', top: r.bottom + 8 + 'px', background: '#ff3b6b', color: '#fff', font: '600 12px system-ui', padding: '3px 7px', borderRadius: '6px', zIndex: 99999, pointerEvents: 'none', maxWidth: '300px' })
    document.body.append(m, t)
  }
}, marks)

await tap(page.locator('#lgEdit')); await page.waitForTimeout(300)
const box = page.locator('#lgBody input[data-lgset="reportLead"]')
await box.evaluate(e => e.scrollIntoView({ block: 'center' }))
await tap(box); await box.fill('2h30')
await mark([['#lgDone', 'ONE tap on Done'], ['#lgBody input[data-lgset="reportLead"]', '2h30 typed, not yet saved']])
await page.screenshot({ path: join(OUT, '01-phone-before-done.png') })
await page.evaluate(() => document.querySelectorAll('.zz-mark').forEach(n => n.remove()))
await tap(page.locator('#lgDone')); await page.waitForTimeout(500)
await mark([['#lgEdit', 'editing ended by that one tap'], ['#lgBody [data-lgkey="reportLead"] .lgstd', 'saved: 2h30, "Standard 3h"']])
await page.screenshot({ path: join(OUT, '02-phone-after-one-tap.png') })
console.log('pictures:', OUT)
await browser.close()
