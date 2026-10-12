import { shot } from './or-A-lib.mjs'
/* declare one public holiday through the Inputs gear > Calendar… > Holidays > + Add (real clicks) */
export async function declareHoliday(page, iso, name = 'Test holiday') {
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inGear').click(); await page.waitForTimeout(400)
  await page.locator('[data-testid="iset-days"]').click(); await page.waitForTimeout(600)
  await page.locator('[data-testid="days-tab-holidays"]').click(); await page.waitForTimeout(400)
  await page.locator('[data-testid="hol-add"]').click(); await page.waitForTimeout(500)
  await page.locator('[data-testid="hol-kind-ph"]').click()
  await page.locator('[data-testid="hol-name"]').fill(name)
  for (let i = 0; i < 24 && !(await page.locator(`[data-testid="holcal-day-${iso}"]`).count()); i++) await page.locator('[data-testid="holcal-next-month"]').click()
  await page.locator(`[data-testid="holcal-day-${iso}"]`).click(); await page.waitForTimeout(200)
  let r = await page.locator('[data-testid="hol-dates"]').evaluate(e => [e.getAttribute('data-from'), e.getAttribute('data-to')])
  if (!r[1]) { await page.locator(`[data-testid="holcal-day-${iso}"]`).click(); await page.waitForTimeout(200); r = await page.locator('[data-testid="hol-dates"]').evaluate(e => [e.getAttribute('data-from'), e.getAttribute('data-to')]) }
  await page.locator('[data-testid="hol-save"]').click(); await page.waitForTimeout(700)
  const said = await page.evaluate(() => ({ saved: (document.querySelector('[data-testid="hol-saved"]') || {}).textContent || null, err: (document.querySelector('[data-testid="hol-err"]') || {}).textContent || null, winOpen: !!document.querySelector('[data-testid="win-holiday"]') }))
  if (said.winOpen) await page.locator('[data-testid="hol-cancel"], [data-testid="win-holiday-x"]').first().click().catch(() => {})
  await page.waitForTimeout(300)
  await page.locator('[data-testid="win-days-x"]').click().catch(() => {})
  await page.waitForTimeout(300)
  await page.locator('[data-testid="win-inputsset-x"]').click().catch(() => {})
  await page.waitForTimeout(300)
  return { range: r, ...said }
}
