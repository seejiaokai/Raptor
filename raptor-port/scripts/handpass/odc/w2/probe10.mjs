import { openWorld, tools } from './lib.mjs'
console.log('probe10 VERSION 1')
const w = await openWorld(process.argv[2] || 'desktop')
const t = tools(w, 'probe10')
const { page } = w
await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(500)
await t.press('#inMedBtn')
console.log('pending cards:', await page.locator('.medsec.med-pend .medcard').count(), '| sections:', await page.$$eval('.medsec', es => es.map(e => e.className + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 80))))
await t.shot('medical')
const pend = page.locator('.medsec.med-pend .medcard')
if (await pend.count()) {
  console.log('first card text:', (await pend.first().innerText()).replace(/\s+/g, ' '))
  await pend.first().scrollIntoViewIfNeeded(); await t.press('.medsec.med-pend .medcard')
  await page.waitForSelector('#docViewPop:not([hidden])')
  console.log('pop text:', (await page.locator('#docViewPop').innerText()).replace(/\s+/g, ' ').slice(0, 300))
  await t.shot('doc-pop')
  await t.press('#docViewUpchit'); await page.waitForSelector('#inpEditUpDate')
  console.log('form text:', (await page.locator('[data-testid="win-inputedit"]').innerText()).replace(/\s+/g, ' ').slice(0, 600))
  console.log('buttons:', await page.$$eval('[data-testid="win-inputedit"] button', es => es.map(e => e.id + ' [' + e.innerText.trim().replace(/\s+/g, ' ') + ']')))
  await t.shot('form')
}
await w.browser.close()
