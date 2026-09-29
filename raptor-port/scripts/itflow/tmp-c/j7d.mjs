import { open, go, box, OUT } from './lib.mjs'
const { browser, page, errs } = await open({ who: 'us' })
await go(page, 'inputs')
await page.click('#inCalBtn'); await page.waitForTimeout(700)
console.log('cal head', await page.$eval('#inpCal', e => e.innerText.replace(/\s+/g, ' ').slice(0, 300)))
for (const s of ['#inpCal', '#icPrev', '#icNext', '#icToday', '#icClose']) console.log(s, JSON.stringify(await box(page, s)))
console.log('day cells sample', await page.$$eval('#inpCal [data-icday], #inpCal [data-day], #inpCal .ic-d', a => a.slice(0, 3).map(e => e.outerHTML.slice(0, 200))))
await page.screenshot({ path: OUT + '/j7-8-calview.png' })
// click a day
const attrs = await page.$$eval('#inpCal button, #inpCal [role=button]', a => [...new Set(a.flatMap(e => [...e.attributes].map(x => x.name)))])
console.log('attrs', attrs)
// zenith doc
await page.click('#icClose'); await page.waitForTimeout(300)
await page.click('#inMedBtn'); await page.waitForTimeout(500)
await page.click('#medView .medcard:has-text("Zenith")'); await page.waitForTimeout(600)
await page.screenshot({ path: OUT + '/j7-9-zenithdoc.png' })
console.log(errs)
await browser.close()
