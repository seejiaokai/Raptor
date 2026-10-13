import { openWorld, tools, adminCategory } from './lib.mjs'
console.log('probe3 VERSION 1')
const w = await openWorld('desktop')
const t = tools(w, 'probe3')
const { page } = w
await adminCategory(page, '^Users')
await page.locator('#accAddPostIn').scrollIntoViewIfNeeded()
await page.fill('#accAddCs', 'Probey'); await page.fill('#accAddIni', 'PB')
await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'C')
await t.press('#accAddPostIn'); await t.pick(t.addDays(10))
await t.press('#accAdd'); await page.waitForTimeout(500)
await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(800)
await page.evaluate(() => window.lwSetRole('admin')); await page.waitForTimeout(300)
await t.press('[data-testid="month-OCT"]'); await page.waitForTimeout(800)
const info = await page.evaluate(() => {
  const e = [...document.querySelectorAll('span.cs')].find(x => /probey/i.test(x.textContent))
  if (!e) return 'no span'
  const row = e.closest('tr')
  return { cls: e.className, txt: JSON.stringify(e.textContent), rowAttrs: row ? [...row.attributes].map(a => a.name + '=' + a.value) : null, cellSample: row ? [...row.querySelectorAll('[data-testid]')].slice(0, 3).map(c => c.getAttribute('data-testid')) : null }
})
console.log(JSON.stringify(info, null, 1))
console.log('errors', w.errors)
await w.browser.close()
