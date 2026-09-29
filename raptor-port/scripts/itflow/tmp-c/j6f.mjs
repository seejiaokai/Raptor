import { open, go, box, OUT } from './lib.mjs'
const { browser, page, errs } = await open({ who: 'us' })
await page.$eval('#vWeek', e => { e.style.scrollBehavior = 'auto'; e.scrollLeft = 6 * 564 - 600 }); await page.waitForTimeout(800)
console.log('peek0', JSON.stringify(await box(page, '#vWeek .day.peek[data-peek-day="0"]')), 'sun', JSON.stringify(await box(page, '#vWeek .day[data-day="6"]')))
console.log('peek label', await page.$eval('#vWeek .day.peek[data-peek-day="0"]', e => e.innerText.slice(0, 40)))
await page.screenshot({ path: OUT + '/j6a-3-peek2.png' })
console.log(errs); await browser.close()
