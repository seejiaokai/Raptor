import { start } from './lib.mjs'
const { browser, page, errors, shot, box, ballBox, clickBall } = await start('ad')
const B = async s => JSON.stringify(await box(s))
// wedge tap: student B's wedge on ST-01
const w = page.locator('#flowSvg .ball[data-id="ST-01"] path.wedge[data-wi="1"]')
console.log('wedge1', JSON.stringify(await w.boundingBox()))
await w.click(); await page.waitForTimeout(400)
console.log('crew after wedge', await page.evaluate(() => document.getElementById('activeSel').selectedOptions[0].textContent), 'pop?', await page.locator('#pop').count())
await shot('p4-wedge')
// grade ST-01 DCO for B, fail ST-02 once
await clickBall('ST-01'); await page.waitForSelector('#pop'); await page.click('#pop .opts button:has-text("DPCO")'); await page.waitForTimeout(300)
await clickBall('ST-02'); await page.waitForSelector('#pop'); await page.fill('#popFailDate', '2026-09-20'); await page.click('#popFailPlus'); await page.waitForTimeout(200); await page.click('#popFailPlus'); await page.waitForTimeout(200)
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
await shot('p4-ball-after')
console.log('ticks ST-02', await page.locator('#flowSvg .ball[data-id="ST-02"] line.ftick').count())
// failures card
await page.locator('#failsCard').scrollIntoViewIfNeeded(); await page.waitForTimeout(300)
console.log('failsCard', await B('#failsCard'), await page.textContent('#failsCard'), await B('#failTitle'), await B('#failChips .failchip'))
await shot('p4-failscard')
await page.click('#failTitle'); await page.waitForTimeout(300)
console.log('failLog', await B('#failLog'), await page.textContent('#failLog'), await B('#failLog .frow input'))
await shot('p4-faillog')
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
// undo from top bar
console.log('undo title', await page.getAttribute('#trUndoBtn', 'title'), await B('#trUndoBtn'), await B('#trRedoBtn'))
await page.click('#trUndoBtn'); await page.waitForTimeout(300)
console.log('after undo title', await page.getAttribute('#trUndoBtn', 'title'), 'redo', await page.getAttribute('#trRedoBtn', 'title'), 'ticks', await page.locator('#flowSvg .ball[data-id="ST-02"] line.ftick').count())
// currency card
await page.locator('.c-curr').scrollIntoViewIfNeeded(); await page.waitForTimeout(200)
console.log('curr', await B('.c-curr'), await B('#lastSyll'), await B('.c-pace'), await B('.c-lull'))
await shot('p4-side-lower')
// show all status
await page.click('#showAllBtn'); await page.waitForTimeout(300)
console.log('sa status', await page.evaluate(() => [...document.querySelectorAll('#showAllPanel .sarow')].slice(0,3).map(r => r.querySelector('.sid').textContent + ':' + r.querySelector('.sst')?.textContent)))
await shot('p4-showall-status', { x: 340, y: 54, w: 760, h: 400 })
console.log('errors', errors)
await browser.close()
