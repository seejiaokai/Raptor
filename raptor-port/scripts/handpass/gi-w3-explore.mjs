import * as L from './gi-w3-lib.mjs'
const { world, DESK, errs, shot, press, counts, fmt } = L
const { ctx, page } = await world(DESK, false)
await L.toBoard(page)
// open Personal Inputs on the board if folded
const rows = () => page.evaluate(() => document.querySelectorAll('#schedBoard .pinp .sb-arow').length)
if (!(await rows())) { await page.locator('#schedBoard [data-pitog="2"]').first().click(); await page.waitForTimeout(500) }
console.log('pinp rows', await rows())
const ie = page.locator('#schedBoard .sb-panel.pinp .sb-arow.inprow .inpedit', { hasText: 'Range safety brief' }).first()
console.log('inpedit', await ie.innerText())
await ie.scrollIntoViewIfNeeded(); await ie.click(); await page.waitForTimeout(900)
console.log('WIN', await page.evaluate(() => [...document.querySelectorAll('[data-testid], .modal, [role=dialog]')].filter(e => e.offsetParent !== null && /win-|modal|dialog/i.test((e.dataset.testid || '') + e.className)).map(e => (e.dataset.testid || e.className) + ': ' + e.innerText.replace(/s+/g, ' ').slice(0, 500))))
console.log('BTNS', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null && /delete|save|cancel|undo/i.test(b.textContent + b.id)).map(b => b.id + '|' + (b.dataset.testid || '') + '|' + b.textContent.trim().slice(0, 40) + '|' + (b.closest('[class*=win],[class*=modal],[role=dialog]')?.className || '').slice(0, 30))))
await shot(page, 'explore-win')
await page.locator('#inpEditDel').click(); await page.waitForTimeout(700)
console.log('AFTER DEL', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null && /delete|keep|cancel|yes|nob/i.test(b.textContent + b.id)).map(b => b.id + '|' + (b.dataset.testid || '') + '|' + b.textContent.trim().slice(0, 50))))
console.log('TXT', await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"], .inpedwin, .win')].map(e => e.innerText.replace(/s+/g, ' ').slice(-300))))
await shot(page, 'explore-del2')
console.log('errs', errs)
process.exit(0)
