import { open, go, box, OUT } from './lib.mjs'
const { browser, page, errs } = await open({ who: 'ad' })
await go(page, 'editsched')
const keys = await page.$$eval('select[data-sign][data-signday="1"]', a => a.map(s => s.dataset.sign))
for (const k of keys) {
  const sel = `select[data-sign="${k}"][data-signday="1"]`
  const v = await page.$eval(sel, el => [...el.options].find(o => o.value)?.value)
  await page.selectOption(sel, v); await page.waitForTimeout(250)
}
await page.click('button[data-beak="1"]'); await page.waitForTimeout(800)
await go(page, 'viewsched')
const tue = '#vWeek .day[data-day="1"]'
console.log('picker', await page.$$eval(tue + ' select[data-vwork] option', a => a.map(o => o.value + '=' + o.textContent)))
console.log('tue head', await page.$eval(tue, d => d.innerText.slice(0, 200)))
console.log('tue box', JSON.stringify(await box(page, tue)), 'picker', JSON.stringify(await box(page, tue + ' select[data-vwork]')), 'warn', JSON.stringify(await box(page, tue + ' .daywarn')))
await page.screenshot({ path: OUT + '/j6-admin-view-published.png' })
// open issues bar on Tuesday
await page.click(tue + ' .daywarn'); await page.waitForTimeout(500)
console.log('dwbox open', await page.$eval(tue + ' .dwbox', e => e.className), JSON.stringify(await box(page, tue + ' .dwbox')))
await page.screenshot({ path: OUT + '/j6-issues-open.png' })
// working draft
await page.selectOption(tue + ' select[data-vwork]', 'working'); await page.waitForTimeout(500)
console.log('after working', await page.$eval(tue, d => d.innerText.slice(0, 160)))
await page.screenshot({ path: OUT + '/j6-working.png' })
await page.selectOption(tue + ' select[data-vwork]', 'issued'); await page.waitForTimeout(300)
// week cal
await page.click('#weekSeg .wk-cal'); await page.waitForTimeout(500)
console.log('cal', JSON.stringify(await box(page, '#weekCal .weekcal-box')), await page.$eval('#weekCal', e => e.innerText.slice(0, 200)))
await page.screenshot({ path: OUT + '/j6-weekcal.png' })
await page.click('#weekCal button[data-wcal="2026-07-22"]'); await page.waitForTimeout(900)
console.log('after pick', await page.$$eval('#weekSeg button', a => a.map(b => b.innerText + (b.className.includes('on') ? '*' : ''))))
await page.screenshot({ path: OUT + '/j6-after-calpick.png' })
// back to Jul 13 via week chip
await page.click('#weekSeg button[data-wk="2026-07-13"]').catch(e => console.log('chip err', e.message.slice(0, 100)))
await page.waitForTimeout(800)
console.log('wk chips', await page.$$eval('#weekSeg button[data-wk]', a => a.map(b => b.dataset.wk)))
// logout, login as member, same page
await page.click('#logout'); await page.waitForTimeout(800)
await page.fill('#luser', 'us'); await page.fill('#lpass', 'us')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(600)
console.log('member page', await page.evaluate(() => window.CURPAGE), 'wk', await page.$$eval('#weekSeg button.on', a => a.map(b => b.dataset.wk)))
console.log('member picker', await page.$$eval(tue + ' select[data-vwork] option', a => a.map(o => o.value + '=' + o.textContent)))
await page.screenshot({ path: OUT + '/j6-member-published.png' })
console.log(errs)
await browser.close()
