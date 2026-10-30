// His D1523 (30 Oct 26 — [WIN-RESIZED-OVER-RETRY]): a window he has only RESIZED, never moved, moves down below a failed
// save's "Not saved" band, so the band and its Retry are never covered; a window he has MOVED keeps its place. Walked on the
// built app with a real mouse at his PC's sizes where the top bar is two lines — 1366 × 700 and 1200 × 800, at 1.25 — and at
// 1440 × 900 (a one-line bar): the changes window opened by its clock, resized by its corner; storage made to refuse (the one
// thing no control can do — a fixture, as in the browser test) and a change made, so the band comes; Retry pressed with the
// mouse at its middle once storage works again. Then a window MOVED by its bar, the same again. Pictures to
// docs/img/handpass/2026-10-30-steady-tests/d1523/. Usage: node scripts/handpass/win-resized-retry-walk.mjs [port]
import { chromium } from 'playwright'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-30-steady-tests/d1523')
mkdirSync(OUT, { recursive: true })
const PORT = process.argv[2] || '4173'
const CHG = '.chgwin:not([hidden])', BAR = '.topbar > .savestat.failed'
const results = []
const rec = (id, verdict, said, pics) => { results.push({ id, verdict, said, pics }); console.log(`${verdict}  ${id}  ${said}  [${pics.join(', ')}]`) }
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

const box = async (page, sel) => { const b = await page.locator(sel).first().boundingBox(); return b ? [b.x, b.y, b.width, b.height].map(Math.round) : null }
async function start(size) {
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1.25 })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
  await page.goto(`http://localhost:${PORT}/`)   // not ?fresh=1: that keeps the world in memory, and no save could fail
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(800)
  await page.locator('#histBtn').click(); await page.waitForSelector(CHG); await page.waitForTimeout(400)
  /* storage that refuses on demand — the app's own failed-save path follows from a real write */
  await page.evaluate(() => {
    const w = window
    w.__was = Storage.prototype.setItem
    Storage.prototype.setItem = function (...a) { if (w.__refuse) throw new DOMException('forced', 'QuotaExceededError'); return w.__was.apply(this, a) }
  })
  return { ctx, page, errs }
}
/* the schedule saved again with storage refusing (the browser test's own way) — then the band */
async function failASave(page) {
  await page.evaluate(() => { const w = window; w.__refuse = true; w.fillSlot('1.0.0.0.p', w.DAYS[1].waves[0].formations[0].aircraft[0].p === 'casper' ? 'bane' : 'casper'); w.afterSchedMutate() })   // a crew change through the one write path, as the browser test makes it
  await page.waitForSelector(BAR, { timeout: 15000 })
  await page.waitForTimeout(500)
}
async function retryByMouse(page) {
  await page.evaluate(() => { window.__refuse = false })
  const r = await page.locator(BAR + ' button').first().boundingBox()
  const at = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && e.closest('.savestat button') ? 'Retry' : (e ? (e.closest('.chgwin') ? 'the changes window' : e.tagName) : 'nothing') }, [r.x + r.width / 2, r.y + r.height / 2])
  await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2)
  await page.waitForSelector(BAR, { state: 'detached', timeout: 40000 }).catch(() => {})
  await page.waitForTimeout(500)
  return at
}
const sizes = [['1366', { width: 1366, height: 700 }], ['1200', { width: 1200, height: 800 }], ['1440', { width: 1440, height: 900 }]]
for (const [name, size] of sizes) {
  /* A — resized only */
  let { ctx, page, errs } = await start(size)
  const b = await page.locator(CHG).first().boundingBox()
  await page.mouse.move(b.x + b.width - 3, b.y + b.height - 3); await page.mouse.down()
  await page.mouse.move(b.x + b.width - 63, size.height - 2, { steps: 10 }); await page.mouse.up()
  await page.evaluate(() => window.afterSchedMutate()); await page.waitForTimeout(400)
  const a0 = await box(page, CHG)
  await page.screenshot({ path: path.join(OUT, `${name}-a1-resized.png`) })
  await failASave(page)
  const a1 = await box(page, CHG), band = await box(page, BAR)
  await page.screenshot({ path: path.join(OUT, `${name}-a2-band.png`) })
  const at = await retryByMouse(page)
  const a2 = await box(page, CHG)
  await page.screenshot({ path: path.join(OUT, `${name}-a3-after.png`) })
  rec(`${name} resized only: below the band, Retry pressed, back at its size`,
    a1[1] >= band[1] + band[3] && at === 'Retry' && a1[0] === a0[0] && a1[2] === a0[2] && a1[1] + a1[3] <= size.height && JSON.stringify(a2) === JSON.stringify(a0) ? 'PASS' : 'FAIL',
    `before ${a0}; band ${band} → window ${a1}; at Retry's middle: ${at}; after ${a2}; errors ${errs.length ? errs.join(' | ') : 'none'}`,
    [`${name}-a1-resized`, `${name}-a2-band`, `${name}-a3-after`])
  await ctx.close();
  /* B — moved by its bar, onto the bar's own line: his place, kept (D587 — a window covers the bar) */
  ;({ ctx, page, errs } = await start(size))
  const g = await page.locator(CHG + ' .win-bar .win-grip').first().boundingBox()
  await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2); await page.mouse.down()
  await page.mouse.move(g.x + g.width / 2 - 200, g.y + g.height / 2 + 120, { steps: 8 }); await page.mouse.up()
  await page.waitForTimeout(400)
  const m0 = await box(page, CHG)
  await failASave(page)
  const m1 = await box(page, CHG)
  await page.screenshot({ path: path.join(OUT, `${name}-b1-moved-band.png`) })
  await retryByMouse(page)
  const m2 = await box(page, CHG)
  rec(`${name} moved: keeps its place and size through the band`, JSON.stringify(m1) === JSON.stringify(m0) && JSON.stringify(m2) === JSON.stringify(m0) ? 'PASS' : 'FAIL',
    `before ${m0}; with the band ${m1}; after ${m2}; errors ${errs.length ? errs.join(' | ') : 'none'}`, [`${name}-b1-moved-band`])
  await ctx.close()
}
writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1))
await browser.close()
