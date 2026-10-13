// W3 scenario 9, third step (phone): a tap on the grid behind the sheet, after the calendar was closed. Two different spots.
import { newWorld, rec } from './lib.mjs'
console.log('w3 groupD2 VERSION 1 - phone')
const w = await newWorld('phone', { tag: 'D2' }); const { page } = w
const info = async () => ({ bidsheet: await page.locator('.bidsheet').count(), picker: await page.locator('[data-testid="bid-picker"]').count(), card: await page.locator('[data-testid="dcal-card"]').count(), sheetText: await page.evaluate(() => { const s = document.querySelector('.bidsheet'); return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 80) : '(none)' }) })
try {
  await w.login(); await w.toLeaveWar()
  const spots = [
    ['the SXO group heading row', () => page.evaluate(() => { const e = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /^SXO$/.test(e.textContent.trim())); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(innerWidth * 0.62), y: Math.round(r.top + r.height / 2) } })],
    ['an EVENT 1 cell', () => page.evaluate(() => { const e = document.querySelector('[data-testid^="cell-"][data-testid*="event"], [data-testid^="evt-"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) } })],
    ['a day heading (WED 15)', () => page.evaluate(() => { const e = document.querySelector('[data-testid="head-2026-07-15"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) } })],
    ['the month button AUG', () => page.evaluate(() => { const e = document.querySelector('[data-testid="month-AUG"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) } })],
  ]
  const out = []
  let i = 0
  for (const [label, finder] of spots) {
    i++
    await w.tapCell('slipway', '2026-07-14')
    await w.press('[data-testid="bid-postout"]')
    await w.press('[data-testid="po-date"]'); await w.cardOnTop('S9 third ' + label)
    await page.touchscreen.tap(3, 3); await page.waitForTimeout(500)         // close the calendar by the veil
    const pt = await finder()
    const sheetTop = await page.evaluate(() => document.querySelector('.bidsheet').getBoundingClientRect().top)
    if (!pt || pt.y > sheetTop - 4) { out.push(`${label}: no visible spot above the sheet (${JSON.stringify(pt)}, sheet top ${Math.round(sheetTop)})`); await page.keyboard.press('Escape').catch(() => {}); continue }
    const under = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.getAttribute('data-testid') || e.className || e.tagName).toString().slice(0, 50) : 'null' }, [pt.x, pt.y])
    const before = await info()
    await page.touchscreen.tap(pt.x, pt.y); await page.waitForTimeout(600)
    const after = await info()
    await w.shot(`s9-p-grid-tap-${i}`)
    out.push(`${label} (tap at ${pt.x},${pt.y}; the element there: ${under}): sheet before ${before.bidsheet}, after ${after.bidsheet}; bid-picker after ${after.picker}; sheet text after "${after.sheetText}"`)
    console.log('  ' + out[out.length - 1])
    // clean up: close anything still open
    await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(300)
    if (await page.locator('.bidsheet').count()) { await page.locator('[data-testid="bid-cancel"]').first().tap().catch(() => {}); await page.waitForTimeout(300) }
  }
  rec(w, '9c', 'RECORD', out.join(' || '), 's9-p-grid-tap-1.png, s9-p-grid-tap-2.png, s9-p-grid-tap-3.png, s9-p-grid-tap-4.png')
} catch (e) { console.log('ERR', String(e).slice(0, 500)); await w.shot('D2-ERR').catch(() => {}); rec(w, '9c', 'NOT WALKED', 'script error: ' + String(e).slice(0, 200)) }
console.log('RESULTS', JSON.stringify(w.results))
await w.close().catch(() => {})
