import { open, fileInput, toWeek, shot, errs, browser, toast, inputsOf, signOut, signIn, sheets, press, WIN, toMonth, openDay, pickDate, csId } from './or-L-lib.mjs'
const { ctx, page } = await open('ad', 'a')
const f = await fileInput(page, { type: 'LL', people: ['Ranger', 'Hex', 'Hunter'], from: '2026-07-13', to: '2026-07-17' })
console.log(JSON.stringify(f))
await signOut(page); await signIn(page, 'us', 'us')
await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(500)
if (await page.locator('#inListBtn[aria-pressed="false"]').count()) { await page.locator('#inListBtn').click(); await page.waitForTimeout(300) }
await page.locator('#inNew').click(); await page.locator(WIN).waitFor()
console.log('types', await page.evaluate(() => [...document.querySelectorAll('#inpEditType option')].map(o => o.value + ':' + o.textContent)))
await page.selectOption('#inpEditType', { label: /ATT/.test('x') ? 'x' : undefined }).catch(() => {})
console.log(errs.join('\n'))
await browser.close()
