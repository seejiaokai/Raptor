/* W3 survey (26 Sep 26): a fresh demo world, admin, desktop — the war's row order, what the weeks of 20 Jul and 27 Jul
   hold, and whether a real mouse drag over three rows x three days opens the selection sheet. Read only (the drag is
   cancelled through the sheet's ✕). */
process.env.AB_WHO = 'w3'
const L = await import('./ab-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, rowRun, shot, sheetNow, closeSheets } = L
const W = process.argv[2] || 'desktop'
const PHONE = W === 'phone'
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await lwOpen(page, '2026-07-20')
const order = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(r => r.getAttribute('data-testid').slice(4)))
console.log('stage', await page.locator('[data-testid="stage-now"]').innerText(), 'rows', order.length)
console.log('order', order.join(' '))
const days = []; for (let d = 20; d <= 31; d++) days.push(`2026-07-${String(d).padStart(2, '0')}`)
for (const id of order.slice(0, 40)) {
  const r = await rowRun(page, id, days)
  if (r.some(x => !/:·$/.test(x))) console.log(id, r.join(' '))
}
const cs = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
console.log('cs', JSON.stringify(Object.fromEntries(order.map(i => [i, cs[i]]))))
/* a drag: from the first cell to the one two rows down and two days right */
const a = order[3], b = order[5]
const box = async (id, iso) => { const c = page.locator(`[data-testid="cell-${id}-${iso}"]`).first(); await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200); return c.boundingBox() }
const b1 = await box(a, '2026-07-21'); const b2 = await box(b, '2026-07-23')
console.log('boxes', b1, b2)
await page.mouse.move(b1.x + b1.width / 2, b1.y + b1.height / 2)
await page.mouse.down()
await page.mouse.move(b1.x + b1.width / 2 + 8, b1.y + b1.height / 2 + 2, { steps: 3 })
await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2, { steps: 12 })
await page.mouse.up()
await page.waitForTimeout(600)
const s = await sheetNow(page)
console.log('after drag', JSON.stringify(s))
await shot(page, 'w3-00-survey-drag')
await closeSheets(page)
console.log('errors', errors.slice(0, 10))
await browser.close()
