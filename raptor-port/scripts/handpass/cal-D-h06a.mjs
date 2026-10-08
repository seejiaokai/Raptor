import { chromium, launchOptions, world, shot, tid, cell, backToSans, readDate, readDayWin, press, isTouch } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const size = 'desk'
const { ctx, page, errors } = await world(browser, size)
await backToSans(page, size)
const ISO = '2026-07-22'
await press(size, cell(page, ISO), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor()
await press(size, tid(page, 'sd-add')); await page.waitForSelector('#inpEditSave')
await shot(page, 'h06-0-editor')
const sw = page.locator('#inpEditPop [data-testid="pp-several"]'); console.log('several switch', await sw.count())
await sw.click(); await page.waitForTimeout(300)
await shot(page, 'h06-1-several')
console.log(await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp]')].map(b => b.getAttribute('data-pp') + ':' + b.innerText.replace(/\s+/g, ' ')).join(' | ')))
console.log(await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-testid^="pp-all-"], #inpEditPop [data-testid="pp-count"]')].map(b => b.getAttribute('data-testid') + ':' + b.innerText).join(' | ')))
console.log(errors.join('|'))
await ctx.close(); await browser.close()
