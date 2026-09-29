import { open, go, box, OUT } from './lib.mjs'
const who = process.argv[2] || 'ad'
const { browser, page, errs } = await open({ who })
await go(page, 'logic')
console.log('bar', await page.$eval('.lgbar', e => e.innerText.replace(/\s+/g, ' ')), 'edit visible', await page.locator('#lgEdit').isVisible())
for (const s of ['.title', '.lgbar', '#lgSearch', '#lgFilters', '#lgEdit', '#lgCount', '#lgBody']) console.log(s, JSON.stringify(await box(page, s)))
await page.screenshot({ path: OUT + `/j14-9-logic-${who}.png` })
if (who === 'ad') {
  await page.fill('#lgSearch', 'crew rest'); await page.waitForTimeout(300)
  console.log('count', await page.$eval('#lgCount', e => e.textContent))
  await page.click('#lgEdit'); await page.waitForTimeout(400)
  const ins = await page.$$eval('#lgBody input.lgin', a => a.map(i => i.dataset.lgset + '=' + i.value + ' (' + i.getAttribute('aria-label') + ')'))
  console.log('inputs', ins.slice(0, 10))
  const k = 'crewRest'
  const sel = `#lgBody input.lgin[data-lgset="${k}"]`
  console.log('first input box', JSON.stringify(await box(page, sel)))
  await page.screenshot({ path: OUT + '/j14-10-logic-edit.png' })
  const cur = await page.$eval(sel, i => i.value)
  await page.fill(sel, '11h'); await page.press(sel, 'Enter'); await page.locator(sel).blur().catch(() => {}); await page.waitForTimeout(500)
  console.log('toast', await page.$eval('#toastEl', e => e.textContent).catch(() => null), 'off', await page.$eval('#lgOff', e => e.hidden + ' ' + e.textContent), 'reset visible', await page.locator('#lgReset').isVisible())
  console.log('after val', await page.$eval(sel, i => i.value), 'was', cur)
  await page.screenshot({ path: OUT + '/j14-11-logic-changed.png' })
  for (const s of ['#lgOff', '#lgReset', '#lgDone', '.lgrule.edited']) console.log(s, JSON.stringify(await box(page, s).catch(() => null)))
  await page.click('#lgDone'); await go(page, 'viewsched')
  console.log('banner', await page.$eval('#vBanner', e => e.className + ' ' + getComputedStyle(e).display), JSON.stringify(await box(page, '#vBanner')))
  await page.screenshot({ path: OUT + '/j14-12-banner.png' })
}
console.log(errs)
await browser.close()
