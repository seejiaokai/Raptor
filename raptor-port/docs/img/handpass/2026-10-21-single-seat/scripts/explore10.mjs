import { L, snap } from './h.mjs'
const { browser, page, errors } = await L.open({ width: 1400, height: 900 })
await L.go(page, 'quals')
await page.getByRole('button', { name: 'Enable editing' }).click()
await page.waitForTimeout(500)
await page.getByRole('button', { name: 'Edit quals' }).click()
await page.waitForTimeout(500)
const info = await page.evaluate(() => {
  const inp = [...document.querySelectorAll('#page-quals input')].find(i => i.value === 'Saint')
  let r = inp; while (r && r.tagName !== 'TR' && !/row/.test(r.className)) r = r.parentElement
  return r ? r.tagName + '.' + r.className + ' ' + r.outerHTML.slice(0, 3000) : 'none'
})
console.log(info)
await page.screenshot({ path: process.env.HP_SHOTS + '/explore10b.png' })
await browser.close()
