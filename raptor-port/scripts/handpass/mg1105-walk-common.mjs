// Walker helpers shared by the mg1105-walk-* scripts (reuses the host's mg1105-lib.mjs).
import * as L from './mg1105-lib.mjs'
export { L }

/* press by click (desktop) or touch tap (phone) */
export async function press(h, loc, opts = {}) {
  if (h.tap) await loc.tap(opts); else await loc.click(opts)
}
/* phone: a picture straight after the tap (pointer left), then the settled one; desktop: settled only */
export async function pressShot(h, loc, id, what, opts = {}) {
  const page = h.page
  await press(h, loc, opts)
  if (h.tap) await L.shot(page, id, what + '-instant')
  await page.waitForTimeout(700)
  return L.shot(page, id, what + '-settled')
}

export async function toUsers(page) {
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
}
export async function guestViewOn(page) {
  await toUsers(page)
  const gv = page.locator('#admGuestView')
  if (!(await gv.isChecked())) { await gv.click(); await page.waitForTimeout(400) }
  return gv.isChecked()
}

/* the host's M0 fixture, copied: Monday signed off, published, a word on the day note, signed off again */
export async function memberFixture(h) {
  const { page } = h
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
  const target = 0
  const signAll = async () => { for (const sel of await page.locator(`select[data-signday="${target}"]`).all()) { const v = await sel.evaluate(s => [...s.options].map(o => o.value).find(Boolean) || ''); if (v) { await sel.selectOption(v); await page.waitForTimeout(250) } } }
  await signAll()
  await page.locator(`button[data-beak="${target}"]`).click(); await page.waitForTimeout(600)
  const note0 = page.locator(`#eWeek [data-txt="dn:${target}.0"]`).first()
  await note0.click(); await page.keyboard.press('End'); await page.keyboard.type(' MG'); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
  await signAll()
  const live = await page.evaluate(() => { const b = document.querySelector('#alPanel .al-pubday button'); return b ? { text: b.textContent, disabled: b.disabled } : null })
  L.note('fixture', { size: h.size, live })
  return live
}
