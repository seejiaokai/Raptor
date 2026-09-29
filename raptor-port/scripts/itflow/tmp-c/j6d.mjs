import { open, go, box, OUT } from './lib.mjs'
const { browser, page, errs } = await open({ who: 'ad', phone: true })
await go(page, 'editsched')
const keys = await page.$$eval('select[data-sign][data-signday="1"]', a => a.map(s => s.dataset.sign))
for (const k of keys) {
  const sel = `select[data-sign="${k}"][data-signday="1"]`
  const v = await page.$eval(sel, el => [...el.options].find(o => o.value)?.value)
  await page.selectOption(sel, v); await page.waitForTimeout(250)
}
await page.click('button[data-beak="1"]'); await page.waitForTimeout(800)
await page.evaluate(() => document.getElementById('logout').click()); await page.waitForTimeout(800)
await page.fill('#luser', 'us'); await page.fill('#lpass', 'us')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(800)
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
await page.screenshot({ path: OUT + '/j6p-1-top.png' })
for (const s of ['#viewChrome', '#viewChrome .filt-cal', '#viewChrome .hl-tog', '#searchV', '#vWeek .day[data-day="0"] .daywarn']) console.log(s, JSON.stringify(await box(page, s)))
// swipe via touch-ish: scroll the week one day
const w0 = await page.$eval('#vWeek', e => e.scrollLeft)
await page.$eval('#vWeek', e => e.scrollBy({ left: e.clientWidth, behavior: 'auto' })); await page.waitForTimeout(900)
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
console.log('scroll', w0, '->', await page.$eval('#vWeek', e => e.scrollLeft), 'dots', await page.$$eval('#vDots button.on', a => a.map(b => b.dataset.day)))
await page.screenshot({ path: OUT + '/j6p-2-tue-top.png' })
console.log('picker', JSON.stringify(await box(page, '#vWeek .day[data-day="1"] select[data-vwork]')), 'head', JSON.stringify(await box(page, '#vWeek .day[data-day="1"] .day-head')))
// does a real touch swipe work? try mouse drag emulation via touchscreen not available; try page.mouse drag
const b = await box(page, '#vWeek')
await page.mouse.move(300, 500); await page.mouse.down(); await page.mouse.move(60, 500, { steps: 10 }); await page.mouse.up(); await page.waitForTimeout(900)
console.log('after mouse drag', await page.$eval('#vWeek', e => e.scrollLeft))
// the dots in view
await page.locator('#vDots').scrollIntoViewIfNeeded(); await page.waitForTimeout(300)
await page.screenshot({ path: OUT + '/j6p-3-dots.png' })
console.log('dots vp', await page.$eval('#vDots', e => JSON.stringify(e.getBoundingClientRect())))
console.log(errs)
await browser.close()
