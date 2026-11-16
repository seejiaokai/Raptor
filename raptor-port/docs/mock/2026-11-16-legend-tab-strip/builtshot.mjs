/* The LOOK's after-pictures of D2081/D2082 as BUILT (nothing injected): Edit Schedule's open Legend at his iPhone's
   402 x 874 in WebKit, in the parked tab's band, and a 1536 desktop; View-only Sched's Legend on the phone too. The
   before-pictures are this folder's *-1-today.png, taken on the build before the change. Run from raptor-port/ against
   the local build on :4173: node docs/mock/2026-11-16-legend-tab-strip/builtshot.mjs */
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'img')
const req = createRequire(resolve(HERE, '../../../package.json'))
const { chromium, webkit } = req('@playwright/test')
const errors = []

async function shoot(name, phone) {
  const browser = phone ? await webkit.launch() : await chromium.launch({ headless: true })
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(`${name} pageerror ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`${name} console ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${name} HTTP ${r.status()} ${r.url()}`) })
  await page.goto('http://localhost:4173/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('editsched'))
  await page.waitForFunction(() => window.CURPAGE === 'editsched')
  await page.waitForTimeout(600)
  /* opened by a tap on its summary, as he opens it */
  await page.locator('#eLegendBox summary.legend-sum').click()
  await page.evaluate(() => { const d = document.querySelector('#eLegendBox'); window.scrollTo(0, d.getBoundingClientRect().top + window.scrollY - 300) })
  await page.waitForTimeout(400)
  const pad = await page.evaluate(() => getComputedStyle(document.querySelector('#eLegend')).paddingRight)
  await page.screenshot({ path: join(OUT, `${name}-3-built.png`), ...(phone ? { clip: { x: 0, y: 92, width: 402, height: 300 } } : {}) })
  let vpad = ''
  if (phone) {
    await page.evaluate(() => window.go('viewsched'))
    await page.waitForFunction(() => window.CURPAGE === 'viewsched')
    await page.waitForTimeout(400)
    await page.locator('#vLegendBox summary.legend-sum').click()
    await page.waitForTimeout(300)
    vpad = await page.evaluate(() => getComputedStyle(document.querySelector('#vLegend')).paddingRight)
    await page.locator('#vLegendBox').screenshot({ path: join(OUT, `${name}-4-viewonly-built.png`) })
  }
  console.log(name, 'Edit Schedule legend padding-right', pad, phone ? `| View-only ${vpad}` : '')
  await browser.close()
}

await shoot('iphone402', true)
await shoot('desktop', false)
console.log(errors.length ? errors.join('\n') : 'no console or page errors, no 4xx')
