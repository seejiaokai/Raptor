import { open, fileInput, shot, toWeek, errs, browser, PID } from './or-J-lib.mjs'
import { writeFileSync } from 'node:fs'
const { ctx, page } = await open({ fresh: true })
const res = {}
await fileInput(page, { type: 'ATT C', person: 'Tally', from: '2026-07-13', to: '2026-07-14' })
await fileInput(page, { type: 'ATT C', person: 'Ranger', from: '2026-07-13', to: '2026-07-14' })
await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(500)
await page.locator('#inMedBtn').click(); await page.waitForTimeout(800)
const cards = page.locator('[data-testid="medcard-placed"]')
const n = await cards.count()
res.opened = []
for (const who of ['Ranger', 'Tally']) {
  const card = page.locator('#page-inputs button, #page-inputs [role=button], #page-inputs .medcard').filter({ hasText: who }).filter({ hasText: /Placed by/ }).first()
  await card.click(); await page.waitForTimeout(800)
  const w = await page.evaluate(() => { const win = document.querySelector('[data-testid="win-inputedit"], [data-testid^="win-"]'); return win ? { tid: win.dataset.testid, text: win.innerText.replace(/\s+/g, ' ').slice(0, 260) } : null })
  res.opened.push({ who, w, undef: w ? /undefined|NaN/.test(w.text) : null })
  console.log(who, JSON.stringify(w))
  await shot(page, 'j8-b-open-' + who.toLowerCase())
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  if (await page.locator('#inpEditCancel').count()) await page.locator('#inpEditCancel').click().catch(() => {})
  await page.waitForTimeout(300)
}
writeFileSync('docs/handpass/parts/or-J-j8b-raw.json', JSON.stringify(res, null, 1))
console.log('ERR', errs.join('\n'))
await ctx.close(); await browser.close()
