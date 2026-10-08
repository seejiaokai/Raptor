import { chromium, launchOptions, world, shot, tid, cell, backToSans, readDate, readDayWin, press, isTouch } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const size = process.argv[2] || 'desk'
const { ctx, page, errors } = await world(browser, size)
await backToSans(page, size)
const ISO = '2026-07-17'
const L = (...a) => console.log(size, ...a)
await press(size, cell(page, ISO), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor()
await press(size, tid(page, 'sd-add')); await page.waitForSelector('#inpEditSave')
await page.locator('#inpEditPop [data-testid="pp-several"]').click(); await page.waitForTimeout(250)
for (const id of ['yeti', 'cards', 'badger']) await press(size, page.locator(`#inpEditPop [data-pp="${id}"]`))
await press(size, page.locator('#inpEditPop [data-pp="vinci"]'))
await page.locator('#inpEditSans').getByLabel('Fly', { exact: true }).check(); await page.locator('#inpEditSans').getByLabel('OFT', { exact: true }).check()
await page.click('#inpEditSave'); await page.waitForTimeout(600)
L('filed', JSON.stringify(await readDate(page, ISO)))
const openFirst = async () => { await press(size, page.locator('[data-testid="win-sansday"] [data-testid^="sd-row-"]').first().locator('[data-testid="sd-open"]')); await page.waitForSelector('#inpEditSave'); await page.waitForTimeout(300) }
// (a) ONE man only: untick Pixel in the picker, Save
await openFirst()
L('editor title/people:', await page.evaluate(() => (document.querySelector('#inpEditPop .win-ttl, #inpEditPop [class*=ttl]') || document.querySelector('#inpEditPop')).innerText.replace(/\s+/g, ' ').slice(0, 80)))
await press(size, page.locator('#inpEditPop [data-pp="badger"]')); await page.waitForTimeout(200)
L('after untick count line:', await page.locator('#inpEditPop [data-testid="pp-count"]').innerText(), '| notes:', await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-testid="pp-why"], #inpEditPop .note, #inpEditPop .hint')].map(e => e.innerText).join(' / ')))
await shot(page, `h06-${size}-untick`)
await page.click('#inpEditSave'); await page.waitForTimeout(700)
L('after removing one man', JSON.stringify(await readDate(page, ISO)), (await readDayWin(page)).rows.map(r => r.slice(0, 20)))
await shot(page, `h06-${size}-after-one`)
// (b) delete for all
await openFirst()
await page.click('#inpEditDel'); await page.waitForTimeout(500)
L('DELETE asks:', await page.evaluate(() => document.body.innerText.split(String.fromCharCode(10)).filter(l => /delete this input|for all|people\?|are you sure|really/i.test(l)).join(' | ')))
await shot(page, `h06-${size}-delask`)
const ids = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="inped-"], [data-testid*="del"]')].map(e => e.getAttribute('data-testid') + ':' + e.innerText.replace(/\s+/g, ' ')))
L('del controls', ids.join(' | '))
// cancel first: nothing deleted
const no = page.locator('[data-testid="inped-delall-no"], [data-testid="cf-no"], button:has-text("Keep")').first()
if (await no.count()) { await no.click(); await page.waitForTimeout(300); L('after No:', JSON.stringify(await readDate(page, ISO))) }
await page.locator('[data-testid="inped-delall"]').scrollIntoViewIfNeeded().catch(() => {})
if (!(await page.locator('[data-testid="inped-delall-yes"]').count())) { await page.click('#inpEditDel'); await page.waitForTimeout(300) }
await page.click('[data-testid="inped-delall-yes"]'); await page.waitForTimeout(700)
L('after Delete for all:', JSON.stringify(await readDate(page, ISO)), (await readDayWin(page)).list)
await shot(page, `h06-${size}-deleted`)
console.log(errors.join('|'))
await ctx.close(); await browser.close()
