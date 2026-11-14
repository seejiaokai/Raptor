/* rcf-w3 Inputs helpers v1 — the Inputs page's calendar and add window, from the page's own controls */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export async function toMonth(page, year, mon0) {
  for (let i = 0; i < 60; i++) {
    const [name, y] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = year * 12 + mon0 - (+y * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await page.locator(d > 0 ? '#icNext' : '#icPrev').click()
    await page.waitForTimeout(250)
  }
}
export async function openDay(page, iso) {
  const [y, m] = iso.split('-').map(Number)
  await toMonth(page, y, m - 1)
  await page.locator(`#inpCal [data-icday="${iso}"]`).click({ position: { x: 8, y: 8 } })
  await page.waitForTimeout(400)
}
