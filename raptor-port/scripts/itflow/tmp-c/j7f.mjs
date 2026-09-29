import { open, go, box, OUT } from './lib.mjs'
{
const { browser, page, errs } = await open({ who: 'us' })
await go(page, 'inputs')
await page.click('#inCalBtn'); await page.waitForTimeout(400)
await page.click('#icPrev'); await page.waitForTimeout(300); await page.click('#icPrev'); await page.waitForTimeout(600)
await page.click('#inpCal [data-icday="2026-07-15"]'); await page.waitForTimeout(400)
await page.click('#icPopAdd'); await page.waitForTimeout(500)
console.log('dlg', JSON.stringify(await box(page, '#inpEditPop .airpop-box, #inpEditPop > div')), await page.$eval('#inpEditPop', e => e.innerText.replace(/\s+/g, ' ').slice(0, 300)))
console.log('type opts', await page.$$eval('#inpEditType option', a => a.map(o => o.value).slice(0, 30).join(',')))
await page.selectOption('#inpEditType', 'Meeting'); await page.waitForTimeout(200)
await page.fill('#inpEditStart', '09:00'); await page.fill('#inpEditEnd', '10:00')
await page.fill('#inpEditRmk', 'Safety meeting')
await page.screenshot({ path: OUT + '/j7a-1-caldlg.png' })
for (const s of ['#inpEditType', '#inpEditStart', '#inpEditRmk', '#inpEditSave']) console.log(s, JSON.stringify(await box(page, s)))
await page.click('#inpEditSave'); await page.waitForTimeout(600)
console.log('pop still?', await page.locator('#inpEditPop:not([hidden])').count(), 'toast', await page.$eval('#toastEl', e => e.textContent).catch(() => null))
console.log('cell', await page.$eval('#inpCal [data-icday="2026-07-15"]', e => e.innerText.replace(/\s+/g, ' ')), JSON.stringify(await box(page, '#inpCal [data-icday="2026-07-15"]')))
await page.screenshot({ path: OUT + '/j7a-2-calafter.png' })
console.log(errs); await browser.close()
}
{
const { browser, page, errs } = await open({ who: 'ad' })
await go(page, 'editsched')
await page.click('.sb-open[data-sbday="2"]'); await page.waitForTimeout(900)
const add = '[data-inpadd="2.g"]'
await page.locator(add).scrollIntoViewIfNeeded(); await page.waitForTimeout(300)
console.log('add btn', JSON.stringify(await box(page, add)))
await page.screenshot({ path: OUT + '/j7b-1-board-ground.png' })
await page.click(add); await page.waitForTimeout(500)
console.log('dlg', await page.$eval('#inpEditPop', e => e.innerText.replace(/\s+/g, ' ').slice(0, 300)))
console.log('type opts', await page.$$eval('#inpEditType option', a => a.map(o => o.value).join(',')))
const hasPerson = await page.locator('#inpEditPerson').count()
console.log('person select', hasPerson)
if (hasPerson) { const v = await page.$$eval('#inpEditPerson option', a => a.find(o => o.textContent.trim() === 'Ranger')?.value); await page.selectOption('#inpEditPerson', v) }
await page.selectOption('#inpEditType', 'Meeting').catch(e => console.log('type err', e.message.slice(0, 80)))
await page.fill('#inpEditStart', '09:00'); await page.fill('#inpEditEnd', '10:00'); await page.fill('#inpEditRmk', 'Safety meeting')
await page.screenshot({ path: OUT + '/j7b-2-board-dlg.png' })
await page.click('#inpEditSave'); await page.waitForTimeout(700)
console.log('toast', await page.$eval('#toastEl', e => e.textContent).catch(() => null))
const hit = page.locator('#sbBoard').getByText('Safety meeting').first()
console.log('on board', await hit.count())
if (await hit.count()) { await hit.scrollIntoViewIfNeeded(); console.log('box', JSON.stringify(await hit.boundingBox())); await page.screenshot({ path: OUT + '/j7b-3-board-after.png' }) }
// unavailable + Add
const ua = '[data-inpadd="2.u"]'
await page.locator(ua).scrollIntoViewIfNeeded(); console.log('unav add', JSON.stringify(await box(page, ua)))
await page.click(ua); await page.waitForTimeout(400)
console.log('unav types', await page.$$eval('#inpEditType option', a => a.map(o => o.value).join(',')))
await page.click('#inpEditCancel')
console.log(errs); await browser.close()
}
