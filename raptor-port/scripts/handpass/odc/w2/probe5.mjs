import { openWorld, tools, adminCategory } from './lib.mjs'
console.log('probe5 VERSION 1')
const w = await openWorld(process.argv[2] || 'phone')
const t = tools(w, 'probe5')
const { page } = w
const CS = 'Probey'
await adminCategory(page, '^Users')
await page.locator('#accAddPostIn').scrollIntoViewIfNeeded()
await page.fill('#accAddCs', CS); await page.fill('#accAddIni', 'PB')
await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'C')
await t.press('#accAdd'); await page.waitForTimeout(500)
const look = async label => {
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
  await page.evaluate(() => window.lwSetRole('admin')); await page.waitForTimeout(300)
  await t.press('[data-testid="month-OCT"]'); await page.waitForTimeout(900)
  console.log(label, JSON.stringify(await page.evaluate(() => ({ rows: document.querySelectorAll('tr[data-testid^="row-"]').length, mine: [...document.querySelectorAll('tr[data-testid^="row-"] span.cs')].filter(x => /probey/i.test(x.textContent)).length }))))
}
await look('after add with post-in today')
for (const [lab, days] of [['restore today', 0], ['restore +10', 10], ['restore +21', 21]]) {
  await adminCategory(page, '^Users')
  await page.fill('#accFind', CS); await page.waitForTimeout(300)
  await t.press(`#accList .acc-main:has-text("${CS}")`); await t.press('#accEdArchive'); await page.waitForTimeout(500)
  await page.fill('#accFind', '')
  if ((await page.locator('#accArchToggle').getAttribute('aria-expanded')) !== 'true') await t.press('#accArchToggle')
  await t.press(`#accArchList .acc-main:has-text("${CS}")`)
  if (days) { await t.press('#accArPostIn'); if (days > 18) await t.press('[data-testid="dcal-next"]'); await t.pick(t.addDays(days)) }
  await t.press('#accArRestore'); await page.waitForTimeout(600)
  await look(lab)
}
await w.browser.close()
