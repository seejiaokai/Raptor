import { open, go, box, OUT } from './lib.mjs'
const { browser, page, errs } = await open({ who: 'ad' })
await go(page, 'admin')
await page.click('.adm-rail .adm-cat:has-text("Squadron config")'); await page.waitForTimeout(400)
console.log('config', await page.$eval('#admConfig', e => e.innerText.replace(/\s+/g, ' ').slice(0, 700)))
for (const s of ['.adm-rail', '#admConfig', '#admSecDefault', '#admWaveDefault', '#admSecDefReset', '#admDutyTpl', '#admDayTpl', '#admWaveTpl']) console.log(s, JSON.stringify(await box(page, s)))
console.log('secrows', await page.$$eval('#admSecDefault [data-adefrow]', a => a.map(r => r.dataset.adefrow)))
await page.screenshot({ path: OUT + '/j14-1-config.png' })
// nudge Sims up
const btn = '#admSecDefault [data-adefrow="sims"] button[aria-label^="Move"][aria-label$="up"]'
console.log('nudge btn', JSON.stringify(await box(page, btn)))
await page.click(btn); await page.waitForTimeout(300)
console.log('secrows after', await page.$$eval('#admSecDefault [data-adefrow]', a => a.map(r => r.dataset.adefrow)))
await page.screenshot({ path: OUT + '/j14-2-config-nudged.png' })
for (const [b, m, c] of [['#admDutyTpl', '#tplModal', '#tplClose'], ['#admDayTpl', '#daytplModal', '#daytplClose'], ['#admWaveTpl', '#waveTplModal', '#waveTplClose']]) {
  await page.click(b); await page.waitForTimeout(500)
  console.log(m, JSON.stringify(await box(page, m + ' .modal-box, ' + m + ' > div')), await page.$eval(m, e => e.innerText.replace(/\s+/g, ' ').slice(0, 400)))
  await page.screenshot({ path: OUT + `/j14-3-${m.slice(1)}.png` })
  await page.click(c); await page.waitForTimeout(300)
}
console.log(errs)
await browser.close()
