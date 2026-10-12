import * as L from './on-C-lib.mjs'
const { tid, shot } = L
const browser = await L.launch()
const { ctx, page, errors } = await L.world(browser)
const hx = await L.csId(page, 'Hunter')
const tr = await L.fileIt(page, L.FRI, { type: 'Training', people: ['bane', hx], from: '09:00', to: '12:00', title: 'Range brief' }, 'yes')
const du = await L.fileIt(page, L.FRI, { type: 'Duty', people: ['harpoon'], title: 'Gate duty' }, 'yes')
async function tracker(label) {
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
  await page.locator('[data-testid="oil-tracker"]').click(); await page.waitForTimeout(900)
  const rows = await page.evaluate(() => { const out = {}; const find = re => [...document.querySelectorAll('[data-testid^="oil-row-"]')].find(e => re.test(e.innerText)); for (const [k, re] of [['Ranger', /^\s*Ranger\b/], ['Hunter', /^\s*Hunter\b/], ['Trident', /^\s*Trident\b/]]) { const r = find(re); out[k] = r ? r.innerText.replace(/\s+/g, ' ').slice(0, 140) : 'NO ROW' } return out })
  await shot(page, `C7c-${label}-tracker`)
  console.log('TRACKER', label, JSON.stringify(rows))
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  if (await page.locator('[data-testid="oil-sheet"]').count()) { await page.locator('[data-testid="oil-sheet"]').locator('button').filter({ hasText: /^[✕×x]$/ }).first().click().catch(() => {}); await page.waitForTimeout(400) }
}
await tracker('1-before')
await L.fileOutHoliday(page, L.FRI, 'National Day')
await tid(page, `odl-yes-${tr}`).click(); await tid(page, `odl-no-${du}`).click(); await tid(page, 'odl-save').click(); await page.waitForTimeout(700)
console.log('oil', await page.evaluate(([a, b]) => JSON.stringify([window.INPUTS.find(r => r.iid === a).oil, window.INPUTS.find(r => r.iid === b).oil]), [tr, du]))
await tracker('2-saved-not-published')
console.log('pub', JSON.stringify(await L.signAndPublish(page, L.FRI_DI)))
await tracker('3-after-publish')
await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
const mon = page.locator('[data-testid="month-JUL"]'); if (await mon.count()) { await mon.first().click(); await page.waitForTimeout(1200) }
console.log('LW CELLS Fri 17', JSON.stringify(await page.evaluate(h => { const o = {}; for (const id of ['bane', h, 'harpoon']) { const c = document.querySelector(`[data-testid="cell-${id}-2026-07-17"]`); o[id] = c ? c.innerText.trim() + ' ' + c.className.slice(0, 40) : 'NO CELL' } return o }, hx)))
await shot(page, 'C7c-4-leavewar-fri17')
console.log('ERRORS', JSON.stringify(errors))
await ctx.close(); await browser.close()
