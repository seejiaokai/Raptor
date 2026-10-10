const C = await import('./aa-C-lib.mjs')
const { world, fileInput, shot, sleep, go, openDay, inputsPage } = C
const w = await world(); const { page } = w
await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: 'S10 duty', oil: 'yes' })
await inputsPage(page)
await openDay(page, '2026-07-18')
await page.locator('[data-testid^="idy-row-"]', { hasText: 'S10 duty' }).first().click(); await sleep(500)
await shot(page, 'probe8-editor')
console.log(await page.evaluate(() => { const w = document.querySelector('#inpEditPop'); return { txt: w.innerText.replace(/\s+/g, ' ').slice(0, 600), btns: [...w.querySelectorAll('button')].map(b => b.id + '|' + (b.dataset.testid || '') + '|' + b.innerText.trim().slice(0, 25)) } }))
await w.browser.close()
