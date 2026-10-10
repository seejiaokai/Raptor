const C = await import('./aa-C-lib.mjs')
const { world, fileInput, rec, shot, board, signDay, pubSat, sleep, go, L } = C
const w = await world(); const { page } = w
await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: 'S4 duty', oil: 'yes' })
await pubSat(page, 5)
await C.closeBoard(page); await go(page, 'editsched'); await sleep(500)
const info = await page.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="5"]'); return [...d.querySelectorAll('button, .dpend, [data-pendlist], [data-chg]')].filter(e => e.offsetParent).map(e => e.tagName + '|' + e.className + '|' + Object.keys(e.dataset).join(',') + '|' + (e.innerText || '').trim().slice(0, 40)).slice(0, 40) })
console.log(JSON.stringify(info, null, 1))
await page.locator('#eWeek .day[data-day="5"] .dpend').first().click()
await sleep(600)
await shot(page, 'probe3-chg')
console.log(await page.evaluate(() => document.body.innerText.slice(0, 0)))
console.log(await page.evaluate(() => { const w = document.querySelector('[data-testid="win-changes"], .chgwin, #chgWin, [class*=chg]'); return w ? w.innerText.replace(/\s+/g, ' ').slice(0, 700) : 'none' }))
await w.browser.close()
