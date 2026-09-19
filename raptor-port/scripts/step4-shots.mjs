// [ARCH-STACK] step 4 — phone + desktop screenshots of the multi-record box and
// its tap list, on the REAL built bundle (the owner's morning check). Plants
// four situations through the real inputs door (w.fileInput, localhost only):
//   A  morning LL + afternoon OIL        → *LL with a grey +1
//   B  a bid replaced by someone's ATT C  → amber !, a notice with "OK, seen"
//   C  LL during a course                 → LL with a grey +1
//   D  clearing leave after a posting-out → LL with the PO tag
// Usage: serve the build (vite preview --port 4180), then
//   node scripts/step4-shots.mjs [outDir]
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.PORT_URL || 'http://localhost:4180/'
const OUT = process.argv[2] || 'step4-shots'
mkdirSync(OUT, { recursive: true })
const CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = []

async function run(name, viewport, mobile) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(`${name}: ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`${name} console: ${m.text()}`) })
  await page.goto(BASE + '?fresh=1')
  await page.fill('#luser', 'ad')
  await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="cell-"]', { state: 'attached' })
  await page.waitForTimeout(600)
  // four adjacent people on the grid, in roster order
  const ids = await page.evaluate(() => {
    const seen = []
    for (const td of document.querySelectorAll('td[data-testid^="cell-"][data-testid$="-2026-01-05"]')) {
      const id = td.getAttribute('data-testid').slice(5, -11)
      if (id && !id.startsWith('-') && !seen.includes(id)) seen.push(id)
    }
    return seen.slice(2, 6)
  })
  const [a, b, c, d] = ids
  const results = await page.evaluate(([a, b, c, d]) => {
    const w = window
    const out = []
    out.push(w.fileInput({ person: a, type: 'LL', date: 'Feb 11', yr: 2026, allday: false, half: 'am', s: 0, e: 720 }))
    out.push(w.fileInput({ person: a, type: 'OIL', date: 'Feb 11', yr: 2026, allday: false, half: 'pm', s: 721, e: 1439 }))
    out.push(w.lwSetCell(b, '2026-02-11', 'LL'))
    out.push(w.fileInput({ person: b, type: 'ATT C', date: 'Feb 11', yr: 2026, allday: true }))
    out.push(w.fileInput({ person: c, type: 'CSE', date: 'Feb 9', endDate: 'Feb 13', yr: 2026, allday: true }))
    out.push(w.fileInput({ person: c, type: 'LL', date: 'Feb 11', yr: 2026, allday: true }))
    out.push(w.lwSetPostOut(d, '2026-02-10'))
    out.push(w.fileInput({ person: d, type: 'LL', date: 'Feb 11', endDate: 'Feb 12', yr: 2026, allday: true }))
    return out
  }, ids)
  // bring February on screen through the month strip
  const feb = page.locator('button', { hasText: /^Feb$/ }).first()
  if (await feb.count()) await feb.click()
  await page.waitForTimeout(700)
  const cell = (p, dt = '2026-02-11') => page.locator(`[data-testid="cell-${p}-${dt}"]`)
  await cell(a).scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  // the grid around the four rows
  const boxA = await cell(a).boundingBox()
  const boxD = await cell(d).boundingBox()
  if (boxA && boxD) {
    const vw = viewport.width
    const x = Math.max(0, 0)
    const y = Math.max(0, boxA.y - 60)
    await page.screenshot({ path: `${OUT}/${name}-grid.png`, clip: { x, y, width: vw, height: Math.min(viewport.height - y, boxD.y + boxD.height + 60 - y) } })
  }
  const marks = await page.evaluate(([a, b, c, d]) => [a, b, c, d].map(p => {
    const td = document.querySelector(`[data-testid="cell-${p}-2026-02-11"]`)
    return td ? td.textContent : null
  }), ids)
  // the tap lists (after the filing toast has faded)
  await page.waitForTimeout(4500)
  for (const [who, tag] of [[a, 'list-halves'], [b, 'list-notice'], [c, 'list-course'], [d, 'list-postout']]) {
    await cell(who).click()
    await page.waitForTimeout(350)
    const sheet = page.locator('[data-testid="daylist-sheet"]')
    if (await sheet.count()) await sheet.screenshot({ path: `${OUT}/${name}-${tag}.png` })
    else await page.screenshot({ path: `${OUT}/${name}-${tag}-NOSHEET.png` })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(250)
  }
  await ctx.close()
  return { ids, results, marks }
}

const desk = await run('desktop', { width: 1440, height: 900 }, false)
const phone = await run('phone', { width: 390, height: 844 }, true)
await browser.close()
console.log(JSON.stringify({ desk, phone, errors }, null, 2))
