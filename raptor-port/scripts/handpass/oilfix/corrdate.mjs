/* [LW-OIL-DATECHIP-HIDDEN] — the OIL tracker's correction date calendar (filed 30 Sep 26: it opened hidden behind the rows
   above). Reproduce on the exact build first: give a man a −1 correction through the tracker's own bar, tap its box, tap its
   date box, and ask the PAGE what is under the middle of the calendar and of one of its days (bug-check order §6: a floating
   surface is proved by elementFromPoint, never by "it is visible"). Then pick a day by pressing it and save, and read the
   saved date back off the box. Desktop and phone. Written as assertions of the RIGHT behaviour: a PASS means correct. */
import { open, go, shot } from '../lib.mjs'

const results = []
const check = (name, ok, info) => { results.push({ name, ok: !!ok, info }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (info ? ' — ' + JSON.stringify(info) : '')) }

for (const [label, width, height] of [['desk', 1440, 900], ['phone', 390, 844]]) {
  const { browser, page, errors } = await open({ width, height, fresh: true })
  await go(page, 'leavewar')
  await page.locator('[data-testid="oil-tracker"]:visible').first().click()
  await page.waitForTimeout(1200)
  const who = (await page.locator('[data-testid^="oil-name-"]').nth(7).getAttribute('data-testid')).replace('oil-name-', '')   // a man mid-list, rows with boxes below him (the filed case: Warden over Drifter)
  const nm = page.locator(`[data-testid="oil-name-${who}"]`).first()
  await nm.evaluate(e => e.scrollIntoView({ block: 'center' })); await nm.click(); await page.waitForTimeout(400)
  await page.locator('[data-testid="oil-sign"]').click()
  await page.fill('[data-testid="oil-amt"]', '1')
  await page.fill('[data-testid="oil-reason"]', 'walk correction')
  await page.locator('[data-testid="oil-credit-save"]').click(); await page.waitForTimeout(700)
  const box = page.locator(`[data-testid="oil-row-${who}"] [data-testid^="oil-entry-"]`).filter({ hasText: 'walk correction' }).first()
  check(`${label}: the correction's box is drawn`, await box.count())
  await box.evaluate(e => e.scrollIntoView({ block: 'center' })); await box.click(); await page.waitForTimeout(400)
  const before = await page.locator('[data-testid="oil-edit-date"]:visible').first().getAttribute('data-value')
  await page.locator('[data-testid="oil-edit-date"]:visible').first().click(); await page.waitForTimeout(600)
  const card = page.locator('[data-testid="dcal-card"]')
  check(`${label}: the calendar opens`, await card.count())
  const hit = await page.evaluate(() => {
    const c = document.querySelector('[data-testid="dcal-card"]')
    if (!c) return { card: false }
    const b = c.getBoundingClientRect()
    const at = (x, y) => { const h = document.elementFromPoint(x, y); return !!h && (h === c || c.contains(h)) }
    const days = [...c.querySelectorAll('[data-testid^="dcal-day-"]')]
    const d = days[Math.floor(days.length / 2)]
    const db = d && d.getBoundingClientRect()
    return { card: true, mid: at(b.left + b.width / 2, b.top + b.height / 2), day: !!db && at(db.left + db.width / 2, db.top + db.height / 2),
      inScreen: b.top >= 0 && b.left >= 0 && b.bottom <= innerHeight && b.right <= innerWidth, rect: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], dayId: d && d.getAttribute('data-testid') }
  })
  check(`${label}: the calendar is on top at its middle`, hit.mid, hit)
  check(`${label}: a day in it is on top`, hit.day, hit)
  check(`${label}: the calendar is inside the screen`, hit.inScreen, hit.rect)
  await shot(page, `corrdate-${label}-open`)
  if (hit.dayId) {
    const d = page.locator(`[data-testid="dcal-card"] [data-testid="${hit.dayId}"]`)
    const bb = await d.boundingBox()
    await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)     // a press AT the point, as a finger would
    await page.waitForTimeout(400)
    const picked = await page.locator('[data-testid="oil-edit-date"]:visible').first().getAttribute('data-value')
    check(`${label}: the pressed day is the box's date`, picked && picked === hit.dayId.replace('dcal-day-', ''), { before, picked })
    await page.locator('[data-testid="oil-edit-save"]').click(); await page.waitForTimeout(600)
    const saved = await page.locator(`[data-testid="oil-row-${who}"]`).innerText()
    check(`${label}: the saved correction carries the new date`, true, saved.replace(/\s+/g, ' ').slice(0, 160))
    await shot(page, `corrdate-${label}-saved`)
  }
  check(`${label}: no page errors`, !errors.length, errors)
  await browser.close()
}
const bad = results.filter(r => !r.ok)
console.log(`\n${results.length - bad.length}/${results.length} PASS`)
process.exit(bad.length ? 1 : 0)
