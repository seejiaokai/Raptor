import * as L from './on-C-lib.mjs'
const { tid, shot } = L
const browser = await L.launch()
const { ctx, page, errors } = await L.world(browser)
const tr = await L.fileIt(page, L.FRI, { type: 'Training', people: ['bane', 'nick'], from: '09:00', to: '12:00', title: 'Range brief' }, 'yes')
await L.fileOutHoliday(page, L.FRI, 'National Day')
await tid(page, `odl-yes-${tr}`).click(); await tid(page, 'odl-save').click(); await page.waitForTimeout(700)
console.log('pub', JSON.stringify(await L.signAndPublish(page, L.FRI_DI)))
await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
const mon = page.locator('[data-testid="month-JUL"]'); if (await mon.count()) { await mon.first().click(); await page.waitForTimeout(1200) }
const cells = await page.evaluate(() => { const o = {}; for (const id of ['bane', 'nick']) { const c = document.querySelector(`[data-testid="cell-${id}-2026-07-17"]`); o[id] = c ? { text: c.innerText.trim(), cls: c.className.slice(0, 80) } : 'NO CELL DRAWN' } return o })
console.log('LW CELLS Fri 17', JSON.stringify(cells))
const tally = await page.evaluate(() => Object.entries(window.PEOPLE).filter(([k, v]) => v.cs === 'Tally' || v.cs === 'Ranger').map(([k, v]) => k + ':' + v.cs + ':cat=' + (v.cat || v.category || '') + ':' + JSON.stringify(Object.keys(v).slice(0, 14))))
console.log('PEOPLE', JSON.stringify(tally))
await shot(page, 'C7-7-leavewar-fri17')
await page.locator('[data-testid="oil-tracker"]').click(); await page.waitForTimeout(900)
console.log('tracker mentions Tally:', await page.evaluate(() => document.querySelector('[data-testid="oil-sheet"]').innerText.includes('Tally')), '| group headings:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-testid="oil-sheet"] tr')].filter(r => r.children.length === 1 || r.querySelector('td[colspan]')).map(r => r.innerText.replace(/\s+/g, ' ').trim()).slice(0, 12))))
console.log('ERRORS', JSON.stringify(errors))
await ctx.close(); await browser.close()
