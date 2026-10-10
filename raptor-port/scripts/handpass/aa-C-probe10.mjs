const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go, fileInput, declarePH, bellText, pubSat, closeBoard, cr, crS } = C
const w = await world(); const { page } = w
await fileInput(page, { iso: '2026-07-15', kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: 'S15 duty' })
console.log('rec', await page.evaluate(() => JSON.stringify(window.INPUTS.find(i => i.remarks === 'S15 duty'))))
console.log('PH', await declarePH(page, '2026-07-15'))
await go(page, 'editsched'); await sleep(500)
console.log('bell', await bellText(page)); await shot(page, 'probe10-bell')
console.log(await page.evaluate(() => [...document.querySelectorAll('[class*=bell] *')].filter(e => e.offsetParent && e.children.length === 0).map(e => e.className + '|' + e.innerText.slice(0, 60)).slice(0, 12)))
await w.browser.close()
