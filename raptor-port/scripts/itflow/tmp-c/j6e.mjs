import { open, go, box, OUT } from './lib.mjs'
const { browser, page, errs } = await open({ who: 'us' })
const sl = () => page.$eval('#vWeek', e => e.scrollLeft)
console.log('start', await sl(), await page.$eval('#hsLbl', e => e.textContent))
await page.click('#weekNext'); await page.waitForTimeout(900)
console.log('after weekNext', await sl(), await page.$eval('#hsLbl', e => e.textContent))
await page.click('#hsR'); await page.waitForTimeout(900)
console.log('after hsR', await sl(), await page.$eval('#hsLbl', e => e.textContent))
// scroll to end to show peek
await page.$eval('#vWeek', e => { e.style.scrollBehavior = 'auto'; e.scrollLeft = e.scrollWidth }); await page.waitForTimeout(700)
console.log('peek days', await page.$$eval('#vWeek .day.peek', a => a.map(d => d.dataset.peekDay)), JSON.stringify(await box(page, '#vWeek .day.peek[data-peek-day="0"]')))
await page.screenshot({ path: OUT + '/j6a-1-peek.png' })
await page.click('#vWeek .day.peek[data-peek-day="0"]'); await page.waitForTimeout(1200)
console.log('after peek click wk', await page.$$eval('#weekSeg button.on', a => a.map(b => b.dataset.wk)), 'lbl', await page.$eval('#hsLbl', e => e.textContent), 'mon head', await page.$eval('#vWeek .day[data-day="0"] .day-head', e => e.innerText.replace(/\s+/g, ' ').slice(0, 40)))
await page.screenshot({ path: OUT + '/j6a-2-afterpeek.png' })
// week chip
await page.click('#weekSeg button[data-wk="13/07/2026"]'); await page.waitForTimeout(900)
console.log('after chip', await page.$$eval('#weekSeg button.on', a => a.map(b => b.dataset.wk)))
console.log(errs); await browser.close()
