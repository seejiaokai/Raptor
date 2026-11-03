/* walker B explore 6: the Sort all and CX dialogs' doors */
import { start, signIn, editTab } from './ws-walk-b-lib.mjs'
console.log('ws-walk-b-explore v6')
const { browser, page } = await start()
await signIn(page); await editTab(page)
await page.locator('#eWeek .day[data-day="0"] .dt.sb-open').click()
await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(400)
const up = () => page.evaluate(() => ({ sort: !!document.querySelector('#sortAllPop:not([hidden])'), sortEl: !!document.querySelector('#sortAllPop'), cx: [...document.querySelectorAll('.airpop, .modal, [role=presentation]')].filter(e => e.offsetWidth).map(e => e.id + '.' + e.className) }))
for (const how of ['Cancel', 'x', 'Escape', 'shade']) {
  await page.locator('#sbSortAll').click(); await page.waitForTimeout(400)
  const s0 = await up()
  const html = how === 'Cancel' ? await page.evaluate(() => document.querySelector('#sortAllPop').outerHTML.slice(0, 900)) : ''
  if (html) console.log('SORT html', html)
  if (how === 'Cancel') await page.locator('#sortAllPop button', { hasText: /^Cancel$/ }).click()
  else if (how === 'x') await page.locator('#sortAllPop button[aria-label="Close"]').click()
  else if (how === 'Escape') await page.keyboard.press('Escape')
  else await page.mouse.click(300, 700)
  await page.waitForTimeout(400)
  console.log('sort via', how, 'open:', JSON.stringify(s0), 'after:', JSON.stringify(await up()))
  if (await page.locator('#sortAllPop').count()) await page.locator('#sortAllPop button[aria-label="Close"]').click().catch(() => {})
  await page.waitForTimeout(300)
}
const cx = page.locator('#sbBoard [data-lcx]:visible').first()
await cx.click(); await page.waitForTimeout(400)
console.log('CX open', JSON.stringify(await up()))
console.log('CX html', await page.evaluate(() => { const e = [...document.querySelectorAll('.airpop, .modal')].find(x => x.offsetWidth && /Cancel this line/.test(x.textContent)); return e ? e.outerHTML.slice(0, 1000) : 'none' }))
await browser.close()
