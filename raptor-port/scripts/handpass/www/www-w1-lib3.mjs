/* www w1 helpers 3: OIL tracker reads, the pending list, Insights hours. Imports www-w1-lib2.mjs */
export * from './www-w1-lib2.mjs'
import { X, sleep, L, nrm, lwOpen, lwCellRead } from './www-w1-lib2.mjs'

const lines = t => t.split(/\r?\n/).map(s => s.replace(/[\s ]+/g, ' ').trim()).filter(Boolean)
/** the Leave War reading of a man's day: the grid cell, the day sheet (its "Days" line), the OIL tracker's balance and entry lines */
export async function lwReadAll(w, person, iso, tag) {
  const page = w.page, P = w.P
  await lwOpen(w, iso)
  const cell = await lwCellRead(w, person, iso)
  await X.pic(w, `${tag}-lwgrid-${P}`)
  const c = page.locator(`[data-testid="cell-${person}-${iso}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200)
  if (w.phone) await c.tap(); else await c.click()
  await sleep(800)
  await page.screenshot({ path: `${X.SHOTS}/${tag}-lwsheet-${P}.png` })
  const sheet = await page.evaluate(() => {
    const g = id => (document.querySelector(`[data-testid="${id}"]`)?.innerText || '').replace(/\s+/g, ' ').trim()
    return { days: g('oil-detail-days'), why: g('oil-detail-why'), given: g('oil-detail-given') }
  })
  await page.keyboard.press('Escape'); await sleep(400)
  if (await page.locator('[data-testid="bid-picker"]:visible').count()) { const x = page.locator('[data-testid="bid-picker"] button').first(); await page.mouse.click(5, 5); await sleep(300) }
  await X.press(w, '[data-testid="oil-tracker"]'); await sleep(1200)
  await page.waitForSelector(`[data-testid="oil-row-${person}"]`, { timeout: 8000 }).catch(() => {})
  const r = page.locator(`[data-testid="oil-row-${person}"]`).first()
  await r.evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await sleep(250)
  const bal = nrm(await page.locator(`[data-testid="oil-bal-${person}"]`).first().innerText().catch(() => 'NO BAL'))
  const entries = await page.evaluate(([p]) => [...document.querySelectorAll(`[data-testid^="oil-entry-${p}-"]`)].map(e => e.innerText.replace(/\s+/g, ' ').trim()), [person])
  const status = await page.evaluate(([p]) => [...document.querySelectorAll(`[data-testid^="oil-status-${p}-"]`)].map(e => e.innerText.replace(/\s+/g, ' ').trim()), [person])
  await X.pic(w, `${tag}-oiltracker-${P}`)
  await X.press(w, '[data-testid="oil-close"]').catch(() => {})
  await sleep(500)
  return { cell, sheet, bal, entries, status }
}
/** Ranger's day row in Insights: opens Insights and returns all visible text lines mentioning the callsign, plus the hours cell */
export async function insights(w, tag) {
  const page = w.page, P = w.P
  const btn = page.locator('#insightBtn:visible, #sbInsights:visible').first()
  if (await btn.count()) { await btn.evaluate(e => e.scrollIntoView({ block: 'center' })); if (w.phone) await btn.tap(); else await btn.click() }
  else {
    const more = page.locator('#editSchedMore:visible, #viewSchedMore:visible').first(); if (w.phone) await more.tap(); else await more.click(); await sleep(400)
    const mi = page.locator('#editSchedMoreInsights:visible, #viewSchedMoreInsights:visible').first(); if (w.phone) await mi.tap(); else await mi.click()
  }
  await sleep(900)
  await page.screenshot({ path: `${X.SHOTS}/${tag}-insights-${P}.png` })
  const txt = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[class*="insight"], [id*="nsight"]')].filter(e => e.getBoundingClientRect().width > 300).sort((a, b) => b.innerText.length - a.innerText.length)[0]
    return el ? el.innerText : document.body.innerText
  })
  return lines(txt)
}
export async function closeInsights(w) {
  const page = w.page
  if (await page.keyboard.press('Escape').catch(() => 0) !== undefined) await sleep(500)
}
/** open the day's pending list from the board head ("N changes") and return the new lines that appear */
export async function pendingList(w, di, tag) {
  const page = w.page
  const before = new Set(lines(await page.evaluate(() => document.body.innerText)))
  const sel = ".dpend"
  await X.press(w, sel, { scope: "board", after: `${tag}-chg-after-tap-${w.P}` }); await sleep(700)
  await page.screenshot({ path: `${X.SHOTS}/${tag}-pendinglist-${w.P}.png` })
  const after = lines(await page.evaluate(() => document.body.innerText))
  return after.filter(l => !before.has(l))
}
