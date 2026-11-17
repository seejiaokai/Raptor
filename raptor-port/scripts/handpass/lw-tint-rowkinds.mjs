// The row tint (his D2171, D2177) on every kind of grid row that has a pinned cell, on a PC: the mouse on each row's day
// area, the pinned cells' paint read back and pictured. node lw-tint-rowkinds.mjs [port] [outdir]
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(here, '../../package.json'))
const { chromium } = require('@playwright/test')
const PORT = process.argv[2] || '4197'
const OUT = path.resolve(here, process.argv[3] || '../../docs/img/handpass/2026-11-17-lw-four-items/tint-rows')
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true })
const TINT = 'linear-gradient(rgba(59, 198, 232, 0.05), rgba(59, 198, 232, 0.05))'
const browser = await chromium.launch()
const page = await (await browser.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 })).newPage()
const errors = []
page.on('pageerror', e => errors.push(String(e)))
await page.goto(`http://localhost:${PORT}/`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.evaluate(() => window.go('leavewar'))
await page.waitForFunction(() => window.CURPAGE === 'leavewar')
await page.waitForSelector('.mx tbody tr td.who')
await page.waitForTimeout(800)
// each kind: [name, a selector for the row]
const kinds = [
  ['person', '.mx tbody:not(.counts):not(.mstripe) tr:not(.me):not(.grp):has(td[data-testid^="cell-"])'],
  ['own-row', '.mx tbody tr.me'],
  ['manning-pair-P', '.mx .counts tr.flyrow.pair-p'],
  ['manning-pair-W', '.mx .counts tr.flyrow.pair-w'],
  ['manning-other', '.mx .counts tr:not(.flyrow)'],
  ['event', '.mx .events tr'],
  ['group-heading', '.mx tbody tr.grp'],
  ['month-strip', '.mx tbody.mstripe tr'],
]
const lines = []
for (const [name, sel] of kinds) {
  const row = page.locator(sel).first()
  if (!(await row.count())) { lines.push(`${name}: none in the demo`); continue }
  await row.evaluate(r => r.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(300)
  const read = () => row.evaluate(tr => [...tr.querySelectorAll(':scope > td.who, :scope > td.bal')].map(c => {
    const cs = getComputedStyle(c); return `${c.className.split(' ')[0]}: image ${cs.backgroundImage === 'none' ? 'none' : cs.backgroundImage.replace(/linear-gradient\((rgba\([^)]*\)), \1\)/g, '$1')} · fill ${cs.backgroundColor}` }))
  const before = await read()
  const box = await row.boundingBox()
  /* mid-screen on the row's days: the row's own box starts far off the left once the year is scrolled to today */
  const mx = 900, my = box.y + box.height / 2
  await page.mouse.move(mx, my)
  await page.waitForTimeout(250)
  const under = await page.evaluate(([x, y]) => { const t = document.elementFromPoint(x, y); return t?.closest('tr') ? t.closest('tr').className || '(row)' : t?.tagName }, [mx, my])
  const on = await read()
  await page.screenshot({ path: path.join(OUT, `${name}.png`), clip: { x: 0, y: Math.max(0, box.y - 40), width: 900, height: box.height + 80 } })
  lines.push(`${name}: before [${before.join(' | ') || 'no pinned cell'}] · under the mouse (on row "${under}") [${on.join(' | ') || 'no pinned cell'}]`)
  await page.mouse.move(5, 5)
}
lines.push(`page errors: ${errors.length ? errors.join(' | ') : 'none'}`)
fs.writeFileSync(path.join(OUT, 'results.txt'), lines.join('\n') + '\n')
console.log(lines.join('\n'))
await browser.close()
