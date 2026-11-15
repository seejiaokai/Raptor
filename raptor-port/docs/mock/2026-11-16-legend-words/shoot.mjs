/* D2075 (16 Nov 26) — Edit Schedule's Legend fold drawn with the checks' new names, put to him BEFORE it is built (D1625).
   Drives the local built app (vite preview on :4173), opens Edit Schedule's "Legend — colours & flags" fold and pictures
   it as it is today, then changes ONLY the words of the six changed flags (the one named transform: text swap, nothing
   moved, added or removed) and outlines each changed flag on its own box (an outline takes no room), and pictures again.
   Phone (iPhone 13 size) and a 1536-wide desktop, deviceScaleFactor 2. Run: node docs/mock/2026-11-16-legend-words/shoot.mjs */
import { chromium } from 'playwright'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'img')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const SWAP = [
  ['no break day', 'days in a row'],
  ['no flight brief', 'misses flight brief'],
  ['no sim brief', 'misses sim brief'],
  ['no flight debrief', 'misses flight debrief'],
  ['no sim debrief', 'misses sim debrief'],
  ['long work day', 'long day'],
]
const errors = []
for (const [name, vp] of [['desktop', { width: 1536, height: 864 }], ['phone', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(name === 'phone' ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(`${name} pageerror ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`${name} console ${m.text()}`) })
  await page.goto('http://localhost:4173/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('editsched'))
  await page.waitForFunction(() => window.CURPAGE === 'editsched')
  await page.waitForTimeout(500)
  await page.evaluate(() => { const d = document.querySelector('#eLegendBox'); d.open = true; d.scrollIntoView({ block: 'start' }); window.scrollBy(0, -60) })
  await page.waitForTimeout(300)
  const box = page.locator('#eLegendBox')
  /* the premise, asserted on screen: every old word is there before anything is drawn */
  const before = await page.locator('#eLegend').innerText()
  for (const [old] of SWAP) if (!before.includes(old)) throw new Error(`today's Legend lacks "${old}"`)
  await box.screenshot({ path: join(OUT, `${name}-1-today.png`) })
  const sizes = await page.evaluate((swap) => {
    const spans = [...document.querySelectorAll('#eLegend > span')]
    const out = []
    for (const [old, neu] of swap) {
      const s = spans.find(x => x.lastChild && x.lastChild.nodeType === 3 && x.lastChild.textContent.trim() === old)
      const r0 = s.getBoundingClientRect()
      s.lastChild.textContent = neu
      s.style.outline = '2px solid #2EE6D6'; s.style.outlineOffset = '2px'; s.style.borderRadius = '3px'
      out.push({ old, neu, h0: Math.round(r0.height), h1: Math.round(s.getBoundingClientRect().height) })
    }
    return out
  }, SWAP)
  await page.waitForTimeout(150)
  await box.screenshot({ path: join(OUT, `${name}-2-proposed.png`) })
  const hBox = await box.evaluate(e => Math.round(e.getBoundingClientRect().height))
  console.log(name, 'legend height after', hBox, JSON.stringify(sizes))
  await ctx.close()
}
await browser.close()
console.log(errors.length ? errors.join('\n') : 'no console or page errors')
