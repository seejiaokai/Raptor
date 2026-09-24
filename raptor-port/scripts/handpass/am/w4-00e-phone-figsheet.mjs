/* w4 probe (seen in passing, Leave War — not an amendment rule): on a PHONE, does tapping a man's callsign to
   read his figures carry the grid back to January, and does it stay there after the sheet closes?
   Reads the first date header in view before, during and after. Usage: node w4-00e-phone-figsheet.mjs [phone|desktop] */
const w = process.argv[2] || 'phone'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4'
const L = await import('./w4-lib.mjs')
const { open, STATE, PHONE, DESK, lwOpen, shot, checker } = L
const { browser, page, errors } = await open({ ...(w === 'phone' ? PHONE : DESK), state: STATE })
const { ck, note, summary } = checker('FIGSHEET ' + w)
const firstInView = () => page.evaluate(() => {
  const hs = [...document.querySelectorAll('[data-testid^="head-"]')].filter(h => { const r = h.getBoundingClientRect(); return r.width && r.right > 120 && r.left < window.innerWidth })
  hs.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)
  return hs.length ? hs[0].getAttribute('data-testid').slice(5) : 'none'
})
await lwOpen(page, '2026-07-18')
const c = page.locator('[data-testid="cell-plasma-2026-07-18"]').first()
await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
await page.waitForTimeout(500)
const a = await firstInView()
await shot(page, `figsheet-${w}-1-before`)
await page.locator('[data-testid="person-plasma"]:visible').first().click()
await page.waitForTimeout(900)
const b = await firstInView()
await shot(page, `figsheet-${w}-2-sheet-open`)
await page.locator('[data-testid="pfig-close"]:visible').first().click()
await page.waitForTimeout(900)
const d = await firstInView()
const cellDrawn = await page.locator('[data-testid="cell-plasma-2026-07-18"]').count()
await shot(page, `figsheet-${w}-3-after-close`)
note('first date in view', { before: a, sheetOpen: b, afterClose: d, julyCellStillDrawn: cellDrawn })
ck('opening and closing a man\'s figure sheet keeps the grid where it was', d === a && cellDrawn > 0, 'the same date in view', { before: a, afterClose: d })
ck('no console errors', errors.length === 0, 'none', errors)
summary()
await browser.close()
