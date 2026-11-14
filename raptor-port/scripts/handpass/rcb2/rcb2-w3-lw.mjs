/* rcb2-w3 Leave War helpers v1 — copied (not imported) from am/w4-lib.mjs lwOpen and rcf/rcf-w1-lib.mjs lwEvent */
import { L, W, sleep, nrm } from './rcb2-w3-lib.mjs'
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export async function lwOpen(page, iso) {
  await L.go(page, 'leavewar')
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 15000 })
  await page.waitForTimeout(600)
  const bar = page.locator('[data-testid="figures-toggle"]')
  if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await page.waitForTimeout(300) }
  const m = page.locator(`[data-testid="month-${MON[+iso.slice(5, 7) - 1]}"]:visible`).first()
  if (await m.count()) { await m.click(); await page.waitForTimeout(900) }
  const head = page.locator(`[data-testid="head-${iso}"]`)
  await head.waitFor({ state: 'attached', timeout: 8000 }).catch(() => {})
  await page.waitForTimeout(400)
}
export async function lwEvent(w, iso, text) {
  const page = w.page, SHOTS = W.SHOTS
  await lwOpen(page, iso)
  const ev = page.locator(`[data-testid="event-0-${iso}"]`).first()
  if (!(await ev.count())) return { ok: false, why: 'no event cell for ' + iso }
  await ev.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200)
  if (w.phone) await ev.tap(); else await ev.click()
  await sleep(600)
  if (!(await page.locator('[data-testid="event-apply"]:visible').count())) {
    const ed = page.getByRole('button', { name: 'Edit', exact: true }).first()
    if (await ed.count() && await ed.isVisible().catch(() => false)) { if (w.phone) await ed.tap(); else await ed.click(); await sleep(600) }
  }
  if (!(await page.locator('[data-testid="event-apply"]:visible').count())) return { ok: false, why: 'event sheet did not open' }
  const sheetPic = `${SHOTS}/lwevent-sheet-${iso}-${text === null ? 'del' : 'add'}-${w.phone ? 'p' : 'd'}.png`
  if (text === null) {
    await page.screenshot({ path: sheetPic })
    const del = page.locator('[data-testid="event-delete"]:visible').first()
    if (!(await del.count())) { await page.locator('[data-testid="event-cancel"]').first().click(); return { ok: false, why: 'no Delete on the sheet' } }
    if (w.phone) await del.tap(); else await del.click()
  } else {
    await page.locator('[data-testid="event-text"]').first().fill(text); await sleep(200)
    await page.screenshot({ path: sheetPic })
    const ap = page.locator('[data-testid="event-apply"]').first()
    if (w.phone) await ap.tap(); else await ap.click()
  }
  await sleep(900)
  let oilday = null
  const win = page.locator('[data-testid="win-oilday"]:visible').first()
  if (await win.count()) {
    oilday = nrm(await win.innerText())
    await page.screenshot({ path: `${SHOTS}/lwevent-oilday-${iso}-${w.phone ? 'p' : 'd'}.png` })
    const later = page.locator('[data-testid="odl-later"]:visible').first()
    if (await later.count()) { if (w.phone) await later.tap(); else await later.click() } else { await page.locator('[data-testid="win-oilday-x"]:visible').first().click() }
    await sleep(500)
  }
  return { ok: true, oilday }
}
