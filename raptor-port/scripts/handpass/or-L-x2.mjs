import { open, fileInput, toWeek, shot, saveRes, errs, browser, csId, toast } from './or-L-lib.mjs'
const { ctx, page } = await open('ad', 'a')
const r = await fileInput(page, { type: 'LL', people: ['Drifter', 'Hex', 'Hunter'], from: '2026-07-13', to: '2026-07-17' })
await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
for (let i = 0; i < 2; i++) {
  await page.locator('[data-testid="stage-advance"]').click(); await page.waitForTimeout(600)
  console.log('stage now', await page.locator('[data-testid="stage-now"]').innerText(), '| toast', await toast(page))
  const btns = await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && /confirm|yes|advance|publish|ok/i.test(b.textContent)).map(b => b.dataset.testid + ':' + b.textContent.trim().slice(0, 40)))
  console.log('buttons', btns.join(' | '))
  await shot(page, 'x2-stage' + i)
  const conf = page.locator('[data-testid*="confirm"]:visible').first()
  if (await conf.count()) { console.log('confirm', await conf.getAttribute('data-testid')); await conf.click(); await page.waitForTimeout(600); console.log('stage now', await page.locator('[data-testid="stage-now"]').innerText()) }
}
const hex = await csId(page, 'Hex')
await page.locator('[data-testid="month-JUL"]').click(); await page.waitForTimeout(1000)
const cell = page.locator(`[data-testid="cell-${hex}-2026-07-15"]`)
console.log('cell count', await cell.count(), (await cell.first().innerText().catch(() => '')))
await cell.first().scrollIntoViewIfNeeded()
await cell.first().click(); await page.waitForTimeout(700)
await shot(page, 'x2-cell')
console.log(await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.offsetParent).map(e => e.dataset.testid).filter(t => /remark|sheet|decide|cell-sheet/.test(t)).join(',')))
console.log(errs.join('\n'))
await browser.close()
