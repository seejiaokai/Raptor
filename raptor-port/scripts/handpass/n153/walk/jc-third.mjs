// jc-third - Saber makes a third squadron, 150, by Admin → Squadrons' own "+ New squadron" form; Kestrel its first admin.
import { admCat } from './jlib.mjs'
export async function makeThird(s, num = '150') {
  const { page } = s
  await admCat(s, 'Squadrons')
  await page.locator('#sqNew').filter({ visible: true }).first().click(); await page.waitForTimeout(300)
  await page.fill('#sqNewNum', num)
  const lbl = await page.evaluate(() => [...document.querySelector('#sqNewAdmin').options].map(o => o.textContent).find(t => /Kestrel/.test(t)))
  if (lbl) await page.selectOption('#sqNewAdmin', { label: lbl })
  await page.locator('#sqNewSave').click(); await page.waitForTimeout(600)
  return lbl
}
