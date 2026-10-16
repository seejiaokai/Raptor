// A LATE request's row on the Ground Programme, phone 390 and desktop: can its remark box be tapped when it holds NO typed
// words (the date now stands outside it — D949 Q3)? Measures the box against the LATE mark beside it, as built; changes
// nothing in the app (the box's text is emptied in the page only, to measure the empty box).
//   node scripts/handpass/tick-r2-latebox.mjs [out dir]     (LOOK_URL=http://localhost:4182/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-17-tick-r2/latebox')
mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4182/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
for (const [tag, w, h, phone] of [['phone390', 390, 844, true], ['desk', 1440, 900, false]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: phone ? 3 : 2, ...(phone ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(900)
  const r = await page.evaluate(() => {
    const R = e => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right), Math.round(b.top), Math.round(b.bottom)] }
    const cells = [...document.querySelectorAll('#eWeek .sec-grnd .rmk.has-late')].filter(c => c.querySelector('[data-txt$=".rmks"]') && c.getBoundingClientRect().width > 1)
    if (!cells.length) return { found: 0 }
    const c = cells[0]; c.scrollIntoView({ block: 'center' })
    const box = c.querySelector('[data-txt$=".rmks"]'), late = c.querySelector('.latetag') || c.firstElementChild
    const was = box.textContent
    const hitAt = (x, y) => { const e = document.elementFromPoint(x, y); return e === box || box.contains(e) ? 'box' : (e && e.className) || '?' }
    const with_ = { box: R(box), late: R(late) }
    box.textContent = ''
    const b = box.getBoundingClientRect()
    const empty = { box: R(box), late: R(late), centre: hitAt(b.left + b.width / 2, b.top + b.height / 2), right: hitAt(b.right - 2, b.top + b.height / 2) }
    box.setAttribute('data-wk', '1'); c.setAttribute('data-wkc', '1')
    return { found: cells.length, was, with_, empty }
  })
  if (r.found) await page.locator('[data-wkc]').first().screenshot({ path: join(OUT, `${tag}-empty-box.png`) })
  console.log(tag, JSON.stringify(r))
  await ctx.close()
}
await browser.close()
