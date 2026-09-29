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
await page.click('#logout').catch(async e => { console.log('logout via drawer?'); await page.evaluate(() => document.getElementById('logout').click()) })
await page.waitForTimeout(800)
await page.fill('#luser', 'us'); await page.fill('#lpass', 'us')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(800)
console.log('page', await page.evaluate(() => window.CURPAGE))
await page.screenshot({ path: OUT + '/j6p-1-landing.png' })
for (const s of ['#vDots', '#vDots button[data-day="1"]', '#weekPrev', '#weekNext', '#viewChrome .filt-cal', '#burger', '#hscroll', '#vWeek']) console.log(s, JSON.stringify(await box(page, s)), await page.locator(s).first().isVisible().catch(() => 'x'))
await page.click('#vDots button[data-day="1"]'); await page.waitForTimeout(900)
console.log('scrollLeft', await page.$eval('#vWeek', e => e.scrollLeft), 'dots on', await page.$$eval('#vDots button.on', a => a.map(b => b.dataset.day)))
await page.screenshot({ path: OUT + '/j6p-2-tuesday.png' })
console.log('picker', JSON.stringify(await box(page, '#vWeek .day[data-day="1"] select[data-vwork]')))
// swipe: scroll the week by one screen
await page.$eval('#vWeek', e => e.scrollBy({ left: e.clientWidth, behavior: 'auto' })); await page.waitForTimeout(900)
console.log('after scrollBy', await page.$eval('#vWeek', e => e.scrollLeft), await page.$$eval('#vDots button.on', a => a.map(b => b.dataset.day)))
await page.screenshot({ path: OUT + '/j6p-3-wed.png' })
// phone cal
await page.click('#viewChrome .filt-cal'); await page.waitForTimeout(500)
await page.screenshot({ path: OUT + '/j6p-4-cal.png' })
await page.click('#weekCal .x')
// burger
await page.click('#burger'); await page.waitForTimeout(500)
await page.screenshot({ path: OUT + '/j6p-5-drawer.png' })
console.log('drawer', await page.$eval('body', b => [...b.querySelectorAll('.drawer a, .drawer button, #drawer a, #drawer button')].map(x => x.textContent.trim()).slice(0, 30)))
console.log(errs)
await browser.close()
