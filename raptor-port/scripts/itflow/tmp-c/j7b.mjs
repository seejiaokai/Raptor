import { open, go, box, OUT } from './lib.mjs'
const { browser, page, errs } = await open({ who: 'us' })
await go(page, 'inputs')
await page.waitForSelector('#inAdd')
await page.click('#inCal [data-cal="2026-07-15"]'); await page.waitForTimeout(200)
await page.click('#inCal [data-cal="2026-07-16"]'); await page.waitForTimeout(200)
console.log('dates', await page.$eval('#inDates', e => e.textContent))
await page.selectOption('#inType', 'Appointment'); await page.waitForTimeout(200)
console.log('after type: span?', await page.locator('#inSpan').count(), 'allday?', await page.locator('#inAllday').count())
await page.fill('#inRemarks', 'Dental appt'); 
await page.screenshot({ path: OUT + '/j7-2-filled.png' })
// timed appointment -> times
console.log('times', await page.$eval('#inStartT', e => e.value + ' disabled=' + e.disabled), await page.$eval('#inEndT', e => e.value))
await page.click('#inAdd'); await page.waitForTimeout(700)
const dlg = await page.$$eval('[data-testid="docconf"], [role=dialog]', a => a.map(e => e.innerText.slice(0, 200)))
console.log('dialog', dlg, 'toast', await page.$eval('#toastEl', e => e.textContent).catch(() => null))
console.log('rows', await page.$$eval('#inBody tr', a => a.map(r => r.className + ' | ' + r.innerText.replace(/\s+/g, ' ').slice(0, 120))))
console.log('range', await page.$eval('#inRangeBtn', e => e.textContent))
await page.screenshot({ path: OUT + '/j7-3-added.png' })
console.log('INPUTS last', await page.evaluate(() => JSON.stringify(window.INPUTS.slice(-1))))
await go(page, 'viewsched')
const wed = '#vWeek .day[data-day="2"]'
const hit = await page.$$eval(wed + ' *', a => a.filter(e => e.children.length === 0 && /Dental appt/.test(e.textContent)).map(e => e.className + ':' + e.textContent))
console.log('on schedule wed', hit)
const loc = page.locator(wed).getByText('Dental appt').first()
if (await loc.count()) { await loc.scrollIntoViewIfNeeded(); const b = await loc.boundingBox(); console.log('dental box', JSON.stringify(b)); await page.screenshot({ path: OUT + '/j7-4-onsched.png' }) }
console.log(errs)
await browser.close()
