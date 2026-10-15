// THE TILL DATE — an EMPTY remark box on Edit Schedule's week takes a tap (the fix read, 17 Oct 26): the box flows inline
// beside its printed date since the gates' geometry test, and an empty inline box would be only its placeholder. Taps the
// empty box of an Unavailable / Personal Inputs row at a phone (touch) and a desktop (mouse) and asserts the caret lands
// in it; types a word, presses Tab, and asserts it saved with the grey date still after the box. Reads and writes the
// demo world only.   node scripts/handpass/r1b-till-emptytap.mjs   (LOOK_URL=http://localhost:4180/)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '../../docs/img/handpass/2026-10-17-r1b-till/emptytap'); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4180/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
let fails = 0, errs = 0
for (const size of [{ tag: 'phone', viewport: { width: 390, height: 844 }, dsf: 3, touch: true }, { tag: 'desk', viewport: { width: 1440, height: 900 }, dsf: 2 }]) {
  const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: size.dsf, ...(size.touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', () => errs++); page.on('console', m => { if (m.type() === 'error') errs++ })
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(700)
  /* empty one remark through the app's own box first: the first Unavailable row of Monday */
  const box = page.locator('#eWeek .day[data-day="0"] .sec-unav [data-inp$=".rmks"]').first()
  await box.scrollIntoViewIfNeeded()
  if (size.touch) await box.tap(); else await box.click()
  await page.keyboard.press('Control+A'); await page.keyboard.press('Delete'); await page.keyboard.press('Tab'); await page.waitForTimeout(400)
  const empty = page.locator('#eWeek .day[data-day="0"] .sec-unav [data-inp$=".rmks"]').first()
  const r = await empty.evaluate(e => { const b = e.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), txt: e.textContent, till: e.nextElementSibling?.textContent || '' } })
  /* tap at the box's own centre, as a finger would — never a scripted focus */
  const bb = await empty.boundingBox()
  if (size.touch) await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)
  const focused = await empty.evaluate(e => document.activeElement === e)
  const ok1 = r.txt === '' && r.w >= 20 && focused
  console.log(`${size.tag} empty box ${r.w}x${r.h}, its date "${r.till}", tap lands: ${focused} → ${ok1 ? 'PASS' : 'FAIL'}`)
  if (!ok1) fails++
  await page.keyboard.type('Back Mon'); await page.keyboard.press('Tab'); await page.waitForTimeout(400)
  const after = await page.locator('#eWeek .day[data-day="0"] .sec-unav [data-inp$=".rmks"]').first().evaluate(e => [e.textContent, e.nextElementSibling?.textContent || ''])
  const ok2 = after[0] === 'Back Mon' && /^till \d/.test(after[1])
  console.log(`${size.tag} typed and saved: [${after.join(' | ')}] → ${ok2 ? 'PASS' : 'FAIL'}`)
  if (!ok2) fails++
  await page.locator('#eWeek .day[data-day="0"] .sec-unav').first().screenshot({ path: join(OUT, `${size.tag}.png`) })
  await ctx.close()
}
console.log(`fails ${fails}, errors ${errs}`)
await browser.close()
